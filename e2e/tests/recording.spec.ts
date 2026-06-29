import { test, expect } from '@playwright/test';
import { ROLES } from '../fixtures/roles';

// Set up fake media/mic devices for the chromium instances in this test file
test.use({
  launchOptions: {
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
    ],
  },
});

test.describe('Private Rehearsal Audio Recording (Story 4.6.1)', () => {
  let songUrl: string;

  test.beforeAll(async ({ playwright }) => {
    // Navigate to `/songs` to dynamically discover a valid song URL
    const browser = await playwright.chromium.launch({ channel: 'chrome' });
    const page = await browser.newPage();
    await page.goto('/songs');
    // Grab the href of the first song link
    const firstSongLink = page.locator('a[href^="/songs/"]:not([href="/songs/add"])').first();
    await expect(firstSongLink).toBeVisible();
    const href = await firstSongLink.getAttribute('href');
    if (!href) throw new Error('Could not find a valid song link on /songs');
    songUrl = href;
    await browser.close();
    console.log(`Discovered song URL for rehearsal recording E2E: ${songUrl}`);
  });

  test.describe('As Guest User', () => {
    test('Cannot record or see private rehearsals', async ({ page }) => {
      await page.goto(songUrl);

      // Verify that the desktop "Record" button is NOT visible
      const desktopRecordBtn = page.locator('button[title="Record Rehearsal"]');
      await expect(desktopRecordBtn).toHaveCount(0);

      // Verify that the mobile overflow menu option is NOT visible
      const moreBtn = page.locator('button[aria-label="More actions"]');
      if (await moreBtn.isVisible()) {
        await moreBtn.click();
        const recordOption = page.locator('button:has-text("Record Rehearsal")');
        await expect(recordOption).toHaveCount(0);
      }
    });
  });

  test.describe('As Authenticated Member', () => {
    test.use({ storageState: ROLES.member.storage });

    test('Can open record drawer, capture fake mic stream, play back, upload, and delete', async ({ page }) => {
      await page.goto(songUrl);

      // Verify desktop "Record" action button exists and click it
      const recordBtn = page.locator('button[title="Record Rehearsal"]').first();
      await expect(recordBtn).toBeVisible({ timeout: 15000 });
      await recordBtn.click();

      // Verify rehearsal drawer slides up
      const drawerTitle = page.locator('h3:has-text("Rehearsal Space")');
      await expect(drawerTitle).toBeVisible();
      
      const recordPrompt = page.locator('h4:has-text("Ready to record rehearsal")');
      await expect(recordPrompt).toBeVisible();

      // Click "Start recording" button
      const startBtn = page.locator('button[title="Start recording"]');
      await expect(startBtn).toBeVisible();
      await startBtn.click();

      // Verify active recording prompt appears
      const activePrompt = page.locator('h4:has-text("Recording rehearsal...")');
      await expect(activePrompt).toBeVisible();

      // Let it record for 3 seconds (fake device streams mock tone)
      await page.waitForTimeout(3000);

      // Click "Stop recording"
      const stopBtn = page.locator('button[title="Stop recording"]');
      await expect(stopBtn).toBeVisible();
      await stopBtn.click();

      // Verify review state
      const reviewPrompt = page.locator('h4:has-text("Review your recording")');
      await expect(reviewPrompt).toBeVisible();

      // Verify native audio preview element is rendered
      const audioPreview = page.locator('audio');
      await expect(audioPreview).toBeVisible();

      // Fill in a custom name
      const nameInput = page.locator('input[placeholder="Recording Name (e.g. Rehearsal 1)"]');
      await expect(nameInput).toBeVisible();
      const customName = `E2E Practice - ${Date.now()}`;
      await nameInput.fill(customName);

      // Click "Save Rehearsal" to trigger Supabase Upload and Insert
      const saveBtn = page.locator('button:has-text("Save Rehearsal")');
      await expect(saveBtn).toBeVisible();
      await saveBtn.click();

      // Verify that the take is listed in "My Saved Takes"
      const savedTake = page.locator(`h4:has-text("${customName}")`);
      await expect(savedTake).toBeVisible({ timeout: 10000 });

      // Clean up/Delete the created take to keep database clean
      const cardRow = page.locator('div.rounded-2xl', { has: page.locator(`h4:has-text("${customName}")`) }).first();
      const deleteBtn = cardRow.locator('button[title="Delete rehearsal"]');
      await expect(deleteBtn).toBeVisible();
      await deleteBtn.click();

      // Verify the take disappears
      await expect(savedTake).toHaveCount(0, { timeout: 10000 });
    });

    test('Automatically stops recording at 3 minutes', async ({ page }) => {
      await page.goto(songUrl);

      // Open drawer
      const recordBtn = page.locator('button[title="Record Rehearsal"]').first();
      await expect(recordBtn).toBeVisible({ timeout: 15000 });
      await recordBtn.click();

      // Set fast timer flag in browser context
      await page.evaluate(() => {
        (window as any).__E2E_FAST_TIMER__ = true;
      });

      // Start recording
      const startBtn = page.locator('button[title="Start recording"]');
      await expect(startBtn).toBeVisible();
      await startBtn.click();

      // Wait for the fast timer to finish (1.8s minimum, wait 3000ms to be safe)
      await page.waitForTimeout(3000);

      // Verify that it automatically stops and shows the review UI
      const reviewPrompt = page.locator('h4:has-text("Review your recording")');
      await expect(reviewPrompt).toBeVisible();

      // Verify that the duration shows 03:00
      const durationDisplay = page.locator('text=03:00');
      await expect(durationDisplay).toBeVisible();
    });

    test('Blocks saving when recording exceeds 10MB', async ({ page }) => {
      await page.goto(songUrl);

      // Open drawer
      const recordBtn = page.locator('button[title="Record Rehearsal"]').first();
      await expect(recordBtn).toBeVisible({ timeout: 15000 });
      await recordBtn.click();

      // Start recording
      const startBtn = page.locator('button[title="Start recording"]');
      await expect(startBtn).toBeVisible();
      await startBtn.click();

      // Let it record briefly
      await page.waitForTimeout(1000);

      // Override Blob size in the browser context before stopping
      await page.evaluate(() => {
        const OriginalBlob = window.Blob;
        // Mock Blob to return a custom size larger than 10MB
        // @ts-ignore
        window.Blob = class MockBlob extends OriginalBlob {
          get size() {
            return 11 * 1024 * 1024; // 11 MB
          }
        };
      });

      // Stop recording to trigger Blob creation with our mocked Blob class
      const stopBtn = page.locator('button[title="Stop recording"]');
      await expect(stopBtn).toBeVisible();
      await stopBtn.click();

      // Verify review UI is visible
      await expect(page.locator('h4:has-text("Review your recording")')).toBeVisible();

      // Try to save the rehearsal
      const saveBtn = page.locator('button:has-text("Save Rehearsal")');
      await expect(saveBtn).toBeVisible();
      await saveBtn.click();

      // Verify client-side error message is displayed
      const errorMsg = page.locator('text=Recording file size exceeds the 10 MB limit.');
      await expect(errorMsg).toBeVisible();
    });
  });
});

