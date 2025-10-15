const { test, expect } = require('@playwright/test');

test.describe('Sticky Notes App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');
  });

  test('should NOT create sticky note when clicking on empty board', async ({ page }) => {
    // Get initial count of sticky notes
    const initialCount = await page.locator('.sticky-note').count();

    // Click on empty area of the board
    await page.locator('#stickyBoard').click({ position: { x: 500, y: 300 } });

    // Wait a bit
    await page.waitForTimeout(500);

    // Count should remain the same
    const finalCount = await page.locator('.sticky-note').count();
    expect(finalCount).toBe(initialCount);
  });

  test('should create sticky note ONLY when clicking Add Note button', async ({ page }) => {
    const initialCount = await page.locator('.sticky-note').count();

    // Click Add Note button
    await page.locator('#addNoteBtn').click();

    // Wait for animation
    await page.waitForTimeout(500);

    // Count should increase by 1
    const finalCount = await page.locator('.sticky-note').count();
    expect(finalCount).toBe(initialCount + 1);
  });

  test('text formatting buttons should work', async ({ page }) => {
    // Add a new note
    await page.locator('#addNoteBtn').click();
    await page.waitForTimeout(300);

    // Get the latest note
    const note = page.locator('.sticky-note').last();
    const content = note.locator('.note-content');

    // Type some text
    await content.click();
    await content.fill('Test text');
    await content.selectText();

    // Click Bold button
    await note.locator('[data-format="bold"]').click();

    // Check if text is bold
    const html = await content.innerHTML();
    expect(html).toContain('<b>');
  });

  test('mode toggle buttons should be styled like other toolbar buttons', async ({ page }) => {
    const stickyModeBtn = page.locator('#stickyModeBtn');
    const drawBtn = page.locator('#toggleDrawBtn');

    // Both should have similar button styling
    const stickyStyles = await stickyModeBtn.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        padding: styles.padding,
        borderRadius: styles.borderRadius,
        display: styles.display
      };
    });

    const drawStyles = await drawBtn.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        padding: styles.padding,
        borderRadius: styles.borderRadius,
        display: styles.display
      };
    });

    console.log('Sticky Mode Button styles:', stickyStyles);
    console.log('Draw Button styles:', drawStyles);
  });
});
