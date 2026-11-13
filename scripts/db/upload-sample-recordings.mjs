#!/usr/bin/env node
// Uploads the sample MP3s in supabase/seeds/audio/ to the `rehearsals` bucket
// for every user_recordings row whose file is missing, so playback, sharing and
// signed streaming URLs can be tested with real audio. The seed SQL only holds
// metadata; run this after `npx supabase db reset`, or any time takes have no file.
// Takes that already have a file (recorded or uploaded in the local app) keep it;
// `--force` replaces every file with a sample.
//
// Local stack only: refuses any Supabase URL that is not localhost.
// Usage: node scripts/db/upload-sample-recordings.mjs [--force]
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const AUDIO_DIR = path.resolve('supabase/seeds/audio');
/** Fallback when ffprobe is not installed (the generated samples are 30 s). */
const DEFAULT_SECONDS = 30;
const RETRIES = 3;

function durationSeconds(file) {
  try {
    const out = execFileSync(
      'ffprobe',
      ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file],
      { encoding: 'utf8' },
    );
    const seconds = Math.round(Number.parseFloat(out));
    return Number.isFinite(seconds) && seconds > 0 ? seconds : DEFAULT_SECONDS;
  } catch {
    return DEFAULT_SECONDS;
  }
}

function localStackEnv() {
  const out = execFileSync('npx', ['supabase', 'status', '-o', 'env'], { encoding: 'utf8' });
  const env = Object.fromEntries(
    out.split('\n')
      .map((line) => line.match(/^([A-Z_]+)="?(.*?)"?$/))
      .filter(Boolean)
      .map((m) => [m[1], m[2]]),
  );
  return { url: env.API_URL, key: env.SERVICE_ROLE_KEY };
}

/** Storage answers 409 "The resource already exists" when a file is uploaded without upsert. */
export function isAlreadyExists(err) {
  return String(err?.statusCode) === '409' || /already exists/i.test(err?.message ?? '');
}

/**
 * Gives every row with a storage path an audio file, round-robin over the samples. Without `force`
 * an existing file is kept (upload without upsert, "already exists" means keep); only rows that got a
 * sample have their size and duration updated.
 */
export async function fillRecordings(supabase, rows, audio, { force }) {
  let uploaded = 0;
  let kept = 0;
  for (const [i, row] of rows.entries()) {
    if (!row.storage_path) continue;
    const { body, seconds } = audio[i % audio.length];
    let upErr = null;
    // The local storage container sometimes times out under load: retry a few times.
    for (let attempt = 1; attempt <= RETRIES; attempt++) {
      ({ error: upErr } = await supabase.storage
        .from('rehearsals')
        .upload(row.storage_path, body, { contentType: 'audio/mpeg', upsert: force }));
      if (!upErr || !/tim(ing|ed) ?out|fetch failed/i.test(upErr.message ?? '')) break;
    }
    if (upErr && !force && isAlreadyExists(upErr)) {
      kept++;
      continue;
    }
    if (upErr) throw new Error(`${row.storage_path}: ${upErr.message}`);
    const { error: updErr } = await supabase
      .from('user_recordings')
      .update({ file_size_bytes: body.length, duration_seconds: seconds })
      .eq('id', row.id);
    if (updErr) throw updErr;
    uploaded++;
  }
  return { uploaded, kept };
}

async function main() {
  const { url, key } = localStackEnv();
  if (!url || !key) throw new Error('Local Supabase is not running (npx supabase start).');
  const host = new URL(url).hostname;
  if (!['127.0.0.1', 'localhost'].includes(host)) {
    throw new Error(`Refusing to upload to non-local Supabase at ${host}.`);
  }

  const samples = readdirSync(AUDIO_DIR).filter((f) => f.endsWith('.mp3')).sort();
  if (samples.length === 0) throw new Error(`No MP3 files in ${AUDIO_DIR}.`);
  const audio = samples.map((f) => {
    const file = path.join(AUDIO_DIR, f);
    return { body: readFileSync(file), seconds: durationSeconds(file) };
  });

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data: rows, error } = await supabase
    .from('user_recordings')
    .select('id, storage_path')
    .order('id');
  if (error) throw error;

  const { uploaded, kept } = await fillRecordings(supabase, rows, audio, { force: process.argv.includes('--force') });
  console.log(`[upload-sample-recordings] Uploaded ${uploaded} recordings using ${samples.length} samples; kept ${kept} existing files.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(`[upload-sample-recordings] ${err.message}`);
    process.exit(1);
  });
}
