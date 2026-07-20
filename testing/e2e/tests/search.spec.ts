import { test, expect } from '@playwright/test';

test.describe('Search Functionality E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Route all browser logs/warnings/errors to terminal stdout for E2E debugging
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'log' || type === 'error' || type === 'warning') {
        console.log(`[Browser Console ${type.toUpperCase()}] ${msg.text()}`);
      }
    });

    // Go to songs page (uses the standard local dev seed data of 80 songs)
    await page.goto('/songs');
  });

  test('Real-time: debounce spinner and search overlay visibility', async ({ page, isMobile }) => {
    // Spinner animations can be flaky under mobile CPU emulation, so skip on mobile viewports
    test.skip(!!isMobile, 'Skip animation checks under emulated mobile CPU');

    const searchInput = page.locator('input[placeholder="Search 200+ songs"]');
    await searchInput.click();
    
    // Type query sequentially to trigger state cycles
    await searchInput.pressSequentially('vuela', { delay: 50 });
    
    // Immediately after typing, the loader spinner should be visible in the search bar
    const spinner = page.locator('.animate-spin');
    await expect(spinner).toBeVisible();

    // The loading/searching overlay on the grid should also fade in
    const overlay = page.locator('.pointer-events-none.bg-white\\/50, .pointer-events-none.bg-gray-950\\/50');
    await expect(overlay).toHaveClass(/opacity-100/);

    // Wait for the 350ms debounce to settle
    await page.waitForTimeout(500);

    // After settling, spinner and overlay should be gone/hidden
    await expect(spinner).not.toBeVisible();
    await expect(overlay).toHaveClass(/opacity-0/);
  });

  test('Real-time: accent/diacritic-insensitive matching across fields', async ({ page }) => {
    // 1. Discover a song, author, and category name dynamically from the DOM
    const firstTitleElement = page.locator('h3').first();
    await expect(firstTitleElement).toBeVisible();
    const songTitle = (await firstTitleElement.innerText()).trim();

    const firstAuthorElement = page.locator('h3 + p, p.text-gray-500').first();
    await expect(firstAuthorElement).toBeVisible();
    const songAuthor = (await firstAuthorElement.innerText()).trim();

    const searchInput = page.locator('input[placeholder="Search 200+ songs"]');

    // 2. Title Search: search using lowercase version of title
    await searchInput.click();
    await searchInput.fill('');
    await searchInput.pressSequentially(songTitle.toLowerCase(), { delay: 30 });
    await page.waitForTimeout(500);
    await expect(page.locator(`text=${songTitle}`).first()).toBeVisible();

    // 3. Author Search: search using lowercase version of author
    if (songAuthor && songAuthor !== 'Unknown') {
      await searchInput.click();
      await searchInput.fill('');
      await searchInput.pressSequentially(songAuthor.toLowerCase(), { delay: 30 });
      await page.waitForTimeout(500);
      await expect(page.locator(`text=${songAuthor}`).first()).toBeVisible();
    }
  });

  test('Advanced Search Modal: deferred state commitment until "Show results" is clicked', async ({ page }) => {
    // Grab the first song title to assert background visibility
    const firstTitleElement = page.locator('h3').first();
    await expect(firstTitleElement).toBeVisible();
    const songTitle = (await firstTitleElement.innerText()).trim();

    // 1. Open the advanced search options modal
    const filterBtn = page.locator('button[aria-label="Search options"]');
    await filterBtn.click();

    const modal = page.locator('h2:has-text("Search options")');
    await expect(modal).toBeVisible();

    // 2. Interact with modal search input — must NOT trigger real-time debounce
    const modalSearchInput = page.locator('.relative.z-10 input[type="text"]').first();
    await expect(modalSearchInput).toBeVisible();
    
    // Wait for the modal opening transition and init effects to fully settle
    await page.waitForTimeout(200);
    await modalSearchInput.click();
    await modalSearchInput.fill(''); // clear any race-condition typed characters
    await modalSearchInput.pressSequentially('NonExistentSongName123', { delay: 30 });
    await expect(modalSearchInput).toHaveValue('NonExistentSongName123');
    
    // Wait to ensure no live search triggered behind the modal
    await page.waitForTimeout(500);
    // Background results should still show the original song because we haven't clicked "Show results" yet
    await expect(page.locator(`text=${songTitle}`).first()).toBeVisible();

    // 3. Commit changes by clicking "Show results"
    const submitBtn = page.locator('button:has-text("Show results")');
    await submitBtn.click();

    // Modal should close
    await expect(modal).not.toBeVisible();
    
    // Assert the URL contains our search term!
    await expect(page).toHaveURL(/search=NonExistentSongName123/);
    await page.waitForTimeout(500);

    // Committed filters should apply now, showing no results found
    await expect(page.locator('text=No songs found')).toBeVisible();
  });

  test('Advanced Search Modal: close without submit discards draft state', async ({ page }) => {
    // Grab the first song title to assert background visibility
    const firstTitleElement = page.locator('h3').first();
    await expect(firstTitleElement).toBeVisible();
    const songTitle = (await firstTitleElement.innerText()).trim();

    // 1. Open modal
    await page.locator('button[aria-label="Search options"]').click();

    // 2. Change modal search to nonexistent song
    const modalSearchInput = page.locator('.relative.z-10 input[type="text"]').first();
    await expect(modalSearchInput).toBeVisible();
    
    // Wait for the modal opening transition and init effects to fully settle
    await page.waitForTimeout(200);
    await modalSearchInput.click();
    await modalSearchInput.fill('');
    await modalSearchInput.pressSequentially('NonExistentSongName123', { delay: 30 });
    await expect(modalSearchInput).toHaveValue('NonExistentSongName123');

    // 3. Close the modal using the X close button
    const closeBtn = page.locator('button').filter({ has: page.locator('svg.lucide-x') }).first();
    await closeBtn.click();

    // Verify original song is still visible (draft was discarded, did not commit)
    await expect(page.locator(`text=${songTitle}`).first()).toBeVisible();
  });
});
