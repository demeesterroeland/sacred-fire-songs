/**
 * Pending step stubs for docs/testing/setlist-pdf-export.feature (@unit @pdfExport).
 *
 * The behaviour is covered by Vitest (testing/unit/tests/pdfExport.test.ts,
 * pdfCache.test.ts). These stubs keep `npm run test:bdd` green now that the
 * feature file is wired into cucumber.json (Epic 5.1, Story 5.1.3); replace
 * each `pending` with a real step when the PDF scenarios are automated.
 */
/* eslint-disable @typescript-eslint/no-unused-vars -- Cucumber checks step arity, so unused `_param`s must stay */
import { Given, Then, When } from '@cucumber/cucumber';

Given('I exported the setlist to PDF', function () {
  return 'pending';
});

Given('I have a setlist titled {string}', function (_string: string) {
  return 'pending';
});

Given('nothing in the setlist has changed', function () {
  return 'pending';
});

Given('the setlist contains songs with song page URLs', function () {
  return 'pending';
});

Given('the setlist is exported from {string}', function (_string: string) {
  return 'pending';
});

Given('two users export setlists on the same device', function () {
  return 'pending';
});

Then('a new PDF is generated', function () {
  return 'pending';
});

Then('continuation pages of a song reuse that song\'s QR code', function () {
  return 'pending';
});

Then('each page shows a {int} cm × {int} cm QR code linking to the song on that page', function (_int: number, _int2: number) {
  return 'pending';
});

Then('each user only ever receives their own cached PDF', function () {
  return 'pending';
});

Then('pages without a song URL show no QR code', function () {
  return 'pending';
});

Then('signing out clears every cached PDF', function () {
  return 'pending';
});

Then('the bottom-left footer shows only {string}', function (_string: string) {
  return 'pending';
});

Then('the previously generated PDF is downloaded without regenerating it', function () {
  return 'pending';
});

When('a song is added', function () {
  return 'pending';
});

When('a song is removed', function () {
  return 'pending';
});

When('a song\'s content or key is edited', function () {
  return 'pending';
});

When('I export the setlist to PDF again', function () {
  return 'pending';
});

When('I export the setlist to PDF', function () {
  return 'pending';
});

When('the interface language is switched', function () {
  return 'pending';
});

When('the setlist title or description changes', function () {
  return 'pending';
});

When('the song order is changed', function () {
  return 'pending';
});

