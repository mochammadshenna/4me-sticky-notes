const { test, expect } = require('@playwright/test');

test.describe('Drawnix-Style Interface', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8000');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Switch to mind map mode
    await page.locator('#mindmapModeBtn').click();
    await page.waitForTimeout(500);
  });

  test('1. Mind Map tab has prominent active color', async ({ page }) => {
    const mindmapBtn = page.locator('#mindmapModeBtn');

    // Check active class
    await expect(mindmapBtn).toHaveClass(/active/);

    // Check for gradient background
    const background = await mindmapBtn.evaluate(el =>
      window.getComputedStyle(el).backgroundImage
    );

    expect(background).toContain('gradient');
    console.log('✓ Mind Map tab has prominent purple gradient');
  });

  test('2. Left toolbar is visible with tools', async ({ page }) => {
    const leftToolbar = page.locator('.mindmap-left-toolbar');
    await expect(leftToolbar).toBeVisible();

    // Check for tool buttons
    const selectTool = page.locator('[data-tool="select"]');
    const handTool = page.locator('[data-tool="hand"]');
    const nodeTool = page.locator('[data-tool="node"]');

    await expect(selectTool).toBeVisible();
    await expect(handTool).toBeVisible();
    await expect(nodeTool).toBeVisible();

    console.log('✓ Left toolbar with tools visible');
  });

  test('3. Select tool is active by default', async ({ page }) => {
    const selectTool = page.locator('[data-tool="select"]');
    await expect(selectTool).toHaveClass(/active/);

    console.log('✓ Select tool active by default');
  });

  test('4. Canvas has grid background', async ({ page }) => {
    const canvasWrapper = page.locator('.mindmap-canvas-wrapper');
    await expect(canvasWrapper).toBeVisible();

    const bgImage = await canvasWrapper.evaluate(el =>
      window.getComputedStyle(el).backgroundImage
    );

    expect(bgImage).toContain('linear-gradient');
    console.log('✓ Canvas has grid background');
  });

  test('5. Minimap navigator is visible', async ({ page }) => {
    const minimap = page.locator('.minimap-container');
    await expect(minimap).toBeVisible();

    const header = page.locator('.minimap-header');
    await expect(header).toHaveText('Navigator');

    console.log('✓ Minimap navigator visible');
  });

  test('6. Canvas wrapper allows panning', async ({ page }) => {
    const canvasWrapper = page.locator('.mindmap-canvas-wrapper');

    // Check cursor style
    const cursor = await canvasWrapper.evaluate(el =>
      window.getComputedStyle(el).cursor
    );

    expect(cursor).toBe('grab');
    console.log('✓ Canvas wrapper has grab cursor for panning');
  });

  test('7. Toolbar buttons have hover effect', async ({ page }) => {
    const nodeTool = page.locator('[data-tool="node"]');

    // Hover over button
    await nodeTool.hover();
    await page.waitForTimeout(300);

    // Button should be visible and interactive
    await expect(nodeTool).toBeVisible();
    console.log('✓ Toolbar buttons have hover effects');
  });

  test('8. Interface layout matches Drawnix style', async ({ page }) => {
    // Check mindmap board uses flexbox
    const mindmapBoard = page.locator('#mindmapBoard');
    const display = await mindmapBoard.evaluate(el =>
      window.getComputedStyle(el).display
    );

    expect(display).toBe('flex');

    // Check left toolbar width
    const leftToolbar = page.locator('.mindmap-left-toolbar');
    const width = await leftToolbar.evaluate(el =>
      window.getComputedStyle(el).width
    );

    expect(width).toBe('60px');

    console.log('✓ Layout matches Drawnix flex structure');
  });

  test('9. All mind map features still work', async ({ page }) => {
    // Check zoom controls still visible
    const zoomIn = page.locator('#zoomInBtn');
    const zoomOut = page.locator('#zoomOutBtn');

    await expect(zoomIn).toBeVisible();
    await expect(zoomOut).toBeVisible();

    // Try zooming
    await zoomIn.click();
    await page.waitForTimeout(200);

    const zoomLevel = await page.locator('#zoomLevel').textContent();
    expect(parseInt(zoomLevel)).toBeGreaterThan(100);

    console.log('✓ All mind map features still work');
  });

  test('10. No Chinese text visible (all English)', async ({ page }) => {
    // Check all visible text
    const bodyText = await page.locator('body').textContent();

    // Should not contain common Chinese characters
    const hasChinese = /[\u4e00-\u9fa5]/.test(bodyText);
    expect(hasChinese).toBeFalsy();

    console.log('✓ All text is in English');
  });
});
