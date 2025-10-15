const { test, expect } = require('@playwright/test');

test.describe('Mode Isolation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8000');
    // Clear localStorage to start fresh
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('1. Sticky notes should only appear in Sticky Notes mode', async ({ page }) => {
    // Start in Sticky Notes mode - create a note
    await page.click('#addNoteBtn');
    await page.waitForTimeout(300);

    // Verify note is visible
    const noteInStickyMode = await page.locator('.sticky-note').first();
    await expect(noteInStickyMode).toBeVisible();
    console.log('✓ Note visible in Sticky Notes mode');

    // Switch to Mind Map mode
    await page.click('#mindmapModeBtn');
    await page.waitForTimeout(300);

    // Verify sticky board is hidden
    const stickyBoard = await page.locator('#stickyBoard');
    const isHidden = await stickyBoard.evaluate(el => {
      return window.getComputedStyle(el).display === 'none';
    });
    expect(isHidden).toBe(true);
    console.log('✓ Sticky board is hidden in Mind Map mode');

    // Verify note is not visible in Mind Map mode
    const noteInMindMapMode = await page.locator('.sticky-note').first();
    const noteVisible = await noteInMindMapMode.isVisible();
    expect(noteVisible).toBe(false);
    console.log('✓ Sticky notes NOT visible in Mind Map mode');

    // Switch back to Sticky Notes mode
    await page.click('#stickyModeBtn');
    await page.waitForTimeout(300);

    // Verify note is visible again
    const noteBackInStickyMode = await page.locator('.sticky-note').first();
    await expect(noteBackInStickyMode).toBeVisible();
    console.log('✓ Note visible again when switching back to Sticky Notes mode');
  });

  test('2. Mind map nodes should only appear in Mind Map mode', async ({ page }) => {
    // Start in Mind Map mode
    await page.click('#mindmapModeBtn');
    await page.waitForTimeout(500);

    // Verify mind map board is visible
    const mindmapBoard = await page.locator('#mindmapBoard');
    await expect(mindmapBoard).toBeVisible();
    console.log('✓ Mind map board visible');

    // Verify mind map nodes exist
    const mindmapNodes = await page.locator('.mindmap-node').count();
    expect(mindmapNodes).toBeGreaterThan(0);
    console.log(`✓ Mind map has ${mindmapNodes} nodes`);

    // Switch to Sticky Notes mode
    await page.click('#stickyModeBtn');
    await page.waitForTimeout(300);

    // Verify mind map board is hidden
    const mindmapBoardHidden = await mindmapBoard.evaluate(el => {
      return window.getComputedStyle(el).display === 'none';
    });
    expect(mindmapBoardHidden).toBe(true);
    console.log('✓ Mind map board is hidden in Sticky Notes mode');

    // Verify sticky board is visible
    const stickyBoard = await page.locator('#stickyBoard');
    await expect(stickyBoard).toBeVisible();
    console.log('✓ Sticky board visible in Sticky Notes mode');
  });

  test('3. New sticky notes created should be in correct container', async ({ page }) => {
    // Create a note in Sticky Notes mode
    await page.click('#addNoteBtn');
    await page.waitForTimeout(300);

    // Check that note is a child of stickyBoard, not board
    const noteParent = await page.evaluate(() => {
      const note = document.querySelector('.sticky-note');
      return note ? note.parentElement.id : null;
    });

    expect(noteParent).toBe('stickyBoard');
    console.log('✓ Note is correctly added to stickyBoard container');
  });

  test('4. Mode switching should maintain state', async ({ page }) => {
    // Create a note
    await page.click('#addNoteBtn');
    await page.waitForTimeout(300);

    const note = await page.locator('.sticky-note').first();
    await note.locator('.note-content').fill('Test Note Content');
    await page.waitForTimeout(200);

    // Switch to Mind Map mode and back
    await page.click('#mindmapModeBtn');
    await page.waitForTimeout(300);
    await page.click('#stickyModeBtn');
    await page.waitForTimeout(300);

    // Verify note content is preserved
    const noteContent = await note.locator('.note-content').textContent();
    expect(noteContent).toBe('Test Note Content');
    console.log('✓ Note content preserved after mode switching');
  });

  test('5. Tools should switch correctly with modes', async ({ page }) => {
    // Start in Sticky Notes mode
    const stickyTools = await page.locator('#stickyTools');
    await expect(stickyTools).toBeVisible();
    console.log('✓ Sticky tools visible in Sticky Notes mode');

    // Switch to Mind Map mode
    await page.click('#mindmapModeBtn');
    await page.waitForTimeout(300);

    // Verify mind map tools are visible
    const mindmapTools = await page.locator('#mindmapTools');
    await expect(mindmapTools).toBeVisible();
    console.log('✓ Mind map tools visible in Mind Map mode');

    // Verify sticky tools are hidden
    const stickyToolsHidden = await stickyTools.evaluate(el => {
      return window.getComputedStyle(el).display === 'none';
    });
    expect(stickyToolsHidden).toBe(true);
    console.log('✓ Sticky tools hidden in Mind Map mode');
  });
});
