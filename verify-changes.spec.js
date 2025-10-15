const { test, expect } = require('@playwright/test');

test.describe('Sticky Notes - All Features', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('http://localhost:8000');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('1. Mode toggle buttons should have proper styling', async ({ page }) => {
    const stickyBtn = page.locator('#stickyModeBtn');
    const mindmapBtn = page.locator('#mindmapModeBtn');

    // Check they have btn class
    await expect(stickyBtn).toHaveClass(/btn/);
    await expect(mindmapBtn).toHaveClass(/btn/);

    // Check active state
    await expect(stickyBtn).toHaveClass(/active/);

    // Switch mode
    await mindmapBtn.click();
    await expect(mindmapBtn).toHaveClass(/active/);
    await expect(stickyBtn).not.toHaveClass(/active/);

    console.log('✓ Mode toggle buttons styled correctly');
  });

  test('2. Should NOT create sticky note when clicking on board', async ({ page }) => {
    const initialCount = await page.locator('.sticky-note').count();

    // Click on empty board area multiple times
    await page.locator('#stickyBoard').click({ position: { x: 400, y: 300 } });
    await page.waitForTimeout(300);
    await page.locator('#stickyBoard').click({ position: { x: 500, y: 400 } });
    await page.waitForTimeout(300);

    const finalCount = await page.locator('.sticky-note').count();
    expect(finalCount).toBe(initialCount);

    console.log('✓ Clicking board does NOT create sticky notes');
  });

  test('3. Sticky notes should be resizable', async ({ page }) => {
    // Add a note
    await page.locator('#addNoteBtn').click();
    await page.waitForTimeout(500);

    const note = page.locator('.sticky-note').last();

    // Check resize CSS property
    const resizable = await note.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.resize;
    });

    expect(resizable).toBe('both');
    console.log('✓ Sticky notes are resizable');
  });

  test('4. Text formatting tools should work', async ({ page }) => {
    // Add a note
    await page.locator('#addNoteBtn').click();
    await page.waitForTimeout(500);

    const note = page.locator('.sticky-note').last();
    const content = note.locator('.note-content');

    // Type text
    await content.click();
    await content.fill('Test formatting');

    // Select all text
    await page.keyboard.press('Control+A');

    // Click Bold button
    await note.locator('[data-format="bold"]').click();
    await page.waitForTimeout(300);

    // Check if text contains bold tag
    const html = await content.innerHTML();
    const hasBold = html.includes('<b>') || html.includes('<strong>') || html.includes('font-weight');

    expect(hasBold).toBeTruthy();
    console.log('✓ Bold formatting works');
  });

  test('5. Keyboard shortcuts should work', async ({ page }) => {
    await page.locator('#addNoteBtn').click();
    await page.waitForTimeout(500);

    const content = page.locator('.sticky-note').last().locator('.note-content');
    await content.click();
    await content.fill('Test shortcuts');
    await page.keyboard.press('Control+A');

    // Test Ctrl+B for bold
    await page.keyboard.press('Control+B');
    await page.waitForTimeout(200);

    const html = await content.innerHTML();
    const hasBold = html.includes('<b>') || html.includes('<strong>');

    expect(hasBold).toBeTruthy();
    console.log('✓ Keyboard shortcuts work (Ctrl+B for bold)');
  });

  test('6. Bullet list button should be present', async ({ page }) => {
    await page.locator('#addNoteBtn').click();
    await page.waitForTimeout(500);

    const bulletBtn = page.locator('[data-format="insertUnorderedList"]').first();
    await expect(bulletBtn).toBeVisible();

    console.log('✓ Bullet list button present');
  });

  test('7. Numbered list button should be present', async ({ page }) => {
    await page.locator('#addNoteBtn').click();
    await page.waitForTimeout(500);

    const numberedBtn = page.locator('[data-format="insertOrderedList"]').first();
    await expect(numberedBtn).toBeVisible();

    console.log('✓ Numbered list button present');
  });

  test('8. Code block button should be present', async ({ page }) => {
    await page.locator('#addNoteBtn').click();
    await page.waitForTimeout(500);

    const codeBtn = page.locator('[data-format="code"]').first();
    await expect(codeBtn).toBeVisible();

    console.log('✓ Code block button present');
  });

  test('9. Font size selector should be present and work', async ({ page }) => {
    await page.locator('#addNoteBtn').click();
    await page.waitForTimeout(500);

    const note = page.locator('.sticky-note').last();
    const fontSelect = note.locator('.note-font-size');
    const content = note.locator('.note-content');

    await expect(fontSelect).toBeVisible();

    // Change font size
    await fontSelect.selectOption('18px');
    await page.waitForTimeout(300);

    const fontSize = await content.evaluate(el => window.getComputedStyle(el).fontSize);
    expect(fontSize).toBe('18px');

    console.log('✓ Font size selector works');
  });

  test('10. All formatting buttons should be visible', async ({ page }) => {
    await page.locator('#addNoteBtn').click();
    await page.waitForTimeout(500);

    const note = page.locator('.sticky-note').last();

    // Check all format buttons
    const formats = ['bold', 'italic', 'underline', 'strikeThrough',
                     'insertUnorderedList', 'insertOrderedList', 'code'];

    for (const format of formats) {
      const btn = note.locator(`[data-format="${format}"]`);
      await expect(btn).toBeVisible();
    }

    console.log('✓ All formatting buttons visible');
  });
});
