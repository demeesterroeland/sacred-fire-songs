import { test, expect } from '@playwright/test';
import { TEST_PASSWORD } from '../fixtures/roles';

const PREVIEW_BASE_URL = process.env.PREVIEW_URL || 'https://staging.example.com';

test.describe('Preview Environment Rehearsal Playback Debugging', () => {
  test('Verify both real uploaded recordings play cleanly without error on Preview', async ({ page }) => {
    const failedRequests: string[] = [];

    page.on('console', (msg) => {
      console.log(`[Browser Console ${msg.type()}]: ${msg.text()}`);
    });

    page.on('response', (response) => {
      if (response.status() >= 400) {
        const errorLine = `[HTTP ${response.status()}] ${response.request().method()} ${response.url()}`;
        failedRequests.push(errorLine);
        console.error(`[Failed Response]: ${errorLine}`);
      }
    });

    // 1. Log in to Preview
    await page.goto(`${PREVIEW_BASE_URL}/auth/login`);
    await page.waitForLoadState('networkidle');
    
    const pwdTabBtn = page.getByRole('button', { name: 'Sign in with password' });
    if (await pwdTabBtn.isVisible({ timeout: 5000 })) {
      await pwdTabBtn.click();
    }

    const emailInput = page.locator('#email');
    const passwordInput = page.locator('#password');
    const submitBtn = page.getByRole('button', { name: 'Sign In', exact: true });

    if (await emailInput.isVisible({ timeout: 5000 })) {
      await emailInput.fill('roel.de.meester+member@gmail.com');
      await passwordInput.fill(TEST_PASSWORD);
      await submitBtn.click();
      await page.waitForURL((url) => url.pathname === '/', { timeout: 10000 }).catch(() => {});
    }

    // 2. Navigate to Abuelo Colibrí Ancestral
    await page.goto(`${PREVIEW_BASE_URL}/songs/6ba02979-174c-4121-ae0a-b5c0a759616b`);
    await page.waitForLoadState('networkidle');

    // 3. Open Rehearsal Space drawer
    const recordBtn = page.locator('button[title="Recordings"]').first();
    await recordBtn.click();
    await page.waitForTimeout(1000);

    // Switch to Voice Recorder tab
    const voiceRecorderTab = page.locator('button:has-text("Voice Recorder")').first();
    await voiceRecorderTab.click();
    await page.waitForTimeout(1000);

    // Scroll down drawer container to expose recordings list
    const drawerContainer = page.locator('.overflow-y-auto').first();
    if (await drawerContainer.isVisible()) {
      await drawerContainer.evaluate((el) => el.scrollTop = el.scrollHeight);
    }

    // 4. Test Playback on Track 1: "Santa Maria vem nos ayudar"
    const track1Title = page.locator('h4', { hasText: 'Santa Maria' }).first();
    await track1Title.scrollIntoViewIfNeeded();
    await expect(track1Title).toBeVisible({ timeout: 10000 });
    const track1Card = page.locator('div.group', { has: track1Title }).first();
    const track1PlayBtn = track1Card.locator('button').first();
    await track1PlayBtn.click();
    console.log('Testing playback for Track 1: Santa Maria vem nos ayudar');
    await page.waitForTimeout(3000);

    // 5. Test Playback on Track 2: "Echa wanbli"
    const track2Title = page.locator('h4', { hasText: 'Echa wanbli' }).first();
    await track2Title.scrollIntoViewIfNeeded();
    await expect(track2Title).toBeVisible({ timeout: 10000 });
    const track2Card = page.locator('div.group', { has: track2Title }).first();
    const track2PlayBtn = track2Card.locator('button').first();
    await track2PlayBtn.click();
    console.log('Testing playback for Track 2: Echa wanbli');
    await page.waitForTimeout(3000);

    // Verify no error toast appeared
    const errorToast = page.locator('text="Failed to play recording audio."');
    const hasErrorToast = await errorToast.isVisible({ timeout: 1000 });

    expect(hasErrorToast, 'Both real recordings should play without error toast').toBe(false);
  });
});
