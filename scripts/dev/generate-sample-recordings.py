#!/usr/bin/env python3
"""Generate the sample rehearsal recordings in supabase/seeds/audio/.

Synthesizes short ceremonial circle-style songs at 140 BPM (frame drum on
every beat, rattle in 8ths, hummed pentatonic melody with a group answer,
fire crackle, room reverb) so local and test databases have real
audio behind their seeded user_recordings rows. Output is deterministic
(fixed seeds), so regenerating gives the same files.

Usage: python3 scripts/dev/generate-sample-recordings.py [--out DIR] [--seconds N]
Needs numpy and ffmpeg.
"""
import argparse
import os
import subprocess
import tempfile
import wave

import numpy as np

SR = 44100

# name, bpm, drum pattern (beat within a bar of 4 -> accent), rattle
# subdivision per beat, root frequency (Hz), melody (scale degrees, -1 = rest,
# one note per `NOTE_BEATS` beats; the second half of each loop is the group
# answer), seed. All songs use the 140 BPM circle-song feel: drum on every
# beat, rattle in straight 8ths.
SONGS = [
    ("sample-heartbeat-song", 140, {0: 1.0, 1: 0.65, 2: 0.9, 3: 0.65}, 2, 196.0,
     [0, 2, 3, 2, 0, -1, 4, 3, 2, 0, 2, -1, 3, 2, 0, -1], 1),
    ("sample-fire-circle", 140, {0: 1.0, 1: 0.7, 2: 0.85, 3: 0.7}, 2, 220.0,
     [4, 4, 3, 2, 3, 2, 0, -1, 2, 3, 4, 3, 2, 0, 0, -1], 2),
    ("sample-medicine-walk", 140, {0: 1.0, 1: 0.6, 2: 0.95, 3: 0.6}, 2, 174.6,
     [0, -1, 2, 3, 4, -1, 3, 2, 3, 2, 0, -1, 2, 0, -2, -1], 3),
    ("sample-water-prayer", 140, {0: 1.0, 1: 0.7, 2: 0.8, 3: 0.7}, 2, 164.8,
     [0, 2, 4, 5, 4, -1, 2, 0, 2, 4, 2, -1, 0, -2, 0, -1], 4),
]
NOTE_BEATS = 2

# Minor pentatonic in semitones; negative degrees wrap down an octave.
PENTA = [0, 3, 5, 7, 10]


def degree_to_freq(root, deg):
    octave, idx = divmod(deg, len(PENTA))
    return root * 2 ** ((PENTA[idx] + 12 * octave) / 12)


def drum_hit(rng, accent):
    n = int(SR * 0.9)
    t = np.arange(n) / SR
    pitch = 55 + 70 * np.exp(-t * 18)
    phase = 2 * np.pi * np.cumsum(pitch) / SR
    body = np.sin(phase) * np.exp(-t * 5.5)
    skin = rng.standard_normal(n) * np.exp(-t * 60) * 0.25
    skin = np.convolve(skin, np.ones(12) / 12, mode="same")  # soften the slap
    return (body + skin) * accent


def rattle_shake(rng, strength):
    n = int(SR * 0.09)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    # crude high-pass: difference of the noise, then grain-like amplitude jitter
    hp = np.diff(noise, prepend=0.0)
    grains = (rng.random(n) < 0.35).astype(float)
    env = np.minimum(t / 0.008, 1.0) * np.exp(-t * 45)
    return hp * grains * env * strength * 0.35


def hum_note(freq, dur, rng):
    n = int(SR * dur)
    t = np.arange(n) / SR
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.2 * t + rng.random() * 6)
    phase = 2 * np.pi * np.cumsum(freq * vib) / SR
    # "oo/ah" vowel-ish harmonic weights
    weights = [1.0, 0.55, 0.35, 0.18, 0.12, 0.06, 0.04]
    tone = sum(w * np.sin((k + 1) * phase) for k, w in enumerate(weights))
    attack, release = min(0.08, dur / 3), min(0.25, dur / 2)
    env = np.ones(n)
    a, r = int(SR * attack), int(SR * release)
    env[:a] = np.linspace(0, 1, a)
    env[-r:] = np.linspace(1, 0, r)
    breath = rng.standard_normal(n) * 0.015
    return (tone / 2.3 + breath) * env


def reverb(x, rng, seconds=1.6, mix=0.25):
    n = int(SR * seconds)
    t = np.arange(n) / SR
    ir = rng.standard_normal(n) * np.exp(-t * 4.0)
    ir[0] = 0
    size = 1 << int(np.ceil(np.log2(len(x) + n)))
    wet = np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[: len(x)]
    wet /= np.max(np.abs(wet)) + 1e-9
    return (1 - mix) * x + mix * wet * np.max(np.abs(x))


def render(spec, seconds):
    name, bpm, pattern, rattle_div, root, melody, seed = spec
    rng = np.random.default_rng(seed)
    total = int(SR * seconds)
    drum = np.zeros(total + SR)
    rattle = np.zeros(total + SR)
    voice = np.zeros(total + SR)
    beat = 60.0 / bpm
    n_beats = int(seconds / beat)

    for b in range(n_beats):
        bar_pos = b % 4
        for pos, acc in pattern.items():
            if int(pos) == bar_pos:
                start = int(SR * (b + pos - bar_pos) * beat + rng.normal(0, 0.004) * SR)
                hit = drum_hit(rng, acc * rng.uniform(0.9, 1.05))
                start = max(start, 0)
                drum[start:start + len(hit)] += hit[: len(drum) - start]
        for s in range(rattle_div):
            start = int(SR * (b + s / rattle_div) * beat + rng.normal(0, 0.006) * SR)
            strength = (1.0 if s == 0 else 0.6) * rng.uniform(0.8, 1.1)
            sh = rattle_shake(rng, strength)
            start = max(start, 0)
            rattle[start:start + len(sh)] += sh[: len(rattle) - start]

    # melody enters after one bar; second half of each loop is a group answer
    # (three slightly detuned, slightly late voices)
    n_notes = (n_beats - 4) // NOTE_BEATS
    for k in range(n_notes):
        deg = melody[k % len(melody)]
        if deg == -1:
            continue
        freq = degree_to_freq(root, deg)
        dur = beat * NOTE_BEATS * 1.02
        start = int(SR * (4 + k * NOTE_BEATS) * beat)
        group = (k % len(melody)) >= len(melody) // 2
        voices = [(1.0, 0.0, 1.0)]
        if group:
            voices = [(1.0, 0.0, 0.6), (2 ** (8 / 1200), 0.012, 0.5),
                      (2 ** (-9 / 1200), 0.021, 0.5), (0.5, 0.017, 0.35)]
        for ratio, delay, gain in voices:
            note = hum_note(freq * ratio, dur, rng) * gain
            st = start + int(SR * delay)
            voice[st:st + len(note)] += note[: len(voice) - st]

    # fire: sparse crackles over the whole take
    fire = np.zeros(total + SR)
    for _ in range(int(seconds * 6)):
        st = int(rng.random() * total)
        n = int(SR * rng.uniform(0.002, 0.01))
        pop = np.diff(rng.standard_normal(n + 1)) * np.exp(-np.arange(n) / (SR * 0.002))
        fire[st:st + n] += pop * rng.uniform(0.05, 0.25)

    mix = 0.9 * drum + 0.45 * rattle + 0.5 * voice + 0.4 * fire
    mix = reverb(mix[:total], rng)
    fade = int(SR * 1.5)
    mix[:int(SR * 0.05)] *= np.linspace(0, 1, int(SR * 0.05))
    mix[-fade:] *= np.linspace(1, 0, fade)
    mix /= np.max(np.abs(mix)) + 1e-9
    return name, (mix * 0.89 * 32767).astype(np.int16)


def main():
    root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    p = argparse.ArgumentParser()
    p.add_argument("--out", default=os.path.join(root, "supabase", "seeds", "audio"))
    p.add_argument("--seconds", type=float, default=30.0)
    args = p.parse_args()
    os.makedirs(args.out, exist_ok=True)

    for spec in SONGS:
        name, pcm = render(spec, args.seconds)
        mp3 = os.path.join(args.out, f"{name}.mp3")
        with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
            with wave.open(tmp.name, "wb") as w:
                w.setnchannels(1)
                w.setsampwidth(2)
                w.setframerate(SR)
                w.writeframes(pcm.tobytes())
            subprocess.run(
                ["ffmpeg", "-y", "-loglevel", "error", "-i", tmp.name,
                 "-codec:a", "libmp3lame", "-b:a", "64k", "-map_metadata", "-1",
                 "-fflags", "+bitexact", mp3],
                check=True,
            )
        print(f"wrote {os.path.relpath(mp3, root)} ({os.path.getsize(mp3) // 1024} KB)")


if __name__ == "__main__":
    main()
