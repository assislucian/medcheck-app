import { test, expect } from '@playwright/test';

test.describe('Layout Consistency Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: navigate to the app and wait for it to load
    await page.goto('http://localhost:8080/');
    await page.waitForLoadState('networkidle');
  });

  test('All pages should have consistent horizontal alignment', async ({ page }) => {
    const routes = [
      '/dashboard',
      '/guides', 
      '/demonstratives',
      '/unpaid-procedures'
    ];

    const layoutMeasurements: Record<string, { leftOffset: number, maxWidth: number }> = {};

    for (const route of routes) {
      await page.goto(`http://localhost:8080${route}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000); // Wait for animations

      // Get the main content area
      const mainContent = page.locator('main .content-layout').first();
      
      if (await mainContent.count() > 0) {
        const boundingBox = await mainContent.boundingBox();
        if (boundingBox) {
          layoutMeasurements[route] = {
            leftOffset: boundingBox.x,
            maxWidth: boundingBox.width
          };
        }
      }
    }

    // Verify that all pages have similar left offset (within 10px tolerance)
    const offsets = Object.values(layoutMeasurements).map(m => m.leftOffset);
    const maxOffset = Math.max(...offsets);
    const minOffset = Math.min(...offsets);
    
    expect(maxOffset - minOffset).toBeLessThan(10);

    // Verify that all pages have similar max width (within 50px tolerance)
    const widths = Object.values(layoutMeasurements).map(m => m.maxWidth);
    const maxWidth = Math.max(...widths);
    const minWidth = Math.min(...widths);
    
    expect(maxWidth - minWidth).toBeLessThan(50);

    console.log('Layout measurements:', layoutMeasurements);
  });

  test('All pages should use consistent layout classes', async ({ page }) => {
    const routes = [
      '/dashboard',
      '/guides', 
      '/demonstratives',
      '/unpaid-procedures'
    ];

    for (const route of routes) {
      await page.goto(`http://localhost:8080${route}`);
      await page.waitForLoadState('networkidle');

      // Check if main content uses content-layout class
      const mainContent = page.locator('main .content-layout');
      await expect(mainContent).toHaveCount(1);

      // Check if sections use section-spacing class
      const sections = page.locator('.section-spacing');
      await expect(sections).toHaveCount.greaterThan(0);

      // Check if cards use card-grid class where appropriate
      const cardGrids = page.locator('.card-grid');
      if (await cardGrids.count() > 0) {
        await expect(cardGrids.first()).toBeVisible();
      }
    }
  });

  test('No horizontal scroll should be present', async ({ page }) => {
    const routes = [
      '/dashboard',
      '/guides', 
      '/demonstratives',
      '/unpaid-procedures'
    ];

    for (const route of routes) {
      await page.goto(`http://localhost:8080${route}`);
      await page.waitForLoadState('networkidle');

      // Check if there's horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalScroll).toBe(false);
    }
  });

  test('Responsive behavior should be consistent', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 },   // Mobile
      { width: 768, height: 1024 },  // Tablet
      { width: 1280, height: 720 },  // Desktop
      { width: 1536, height: 864 }   // Large Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      
      const routes = [
        '/dashboard',
        '/guides', 
        '/demonstratives',
        '/unpaid-procedures'
      ];

      for (const route of routes) {
        await page.goto(`http://localhost:8080${route}`);
        await page.waitForLoadState('networkidle');

        // Check if content is properly contained
        const mainContent = page.locator('main .content-layout').first();
        if (await mainContent.count() > 0) {
          const boundingBox = await mainContent.boundingBox();
          if (boundingBox) {
            // Content should not overflow viewport
            expect(boundingBox.x + boundingBox.width).toBeLessThanOrEqual(viewport.width);
            expect(boundingBox.x).toBeGreaterThanOrEqual(0);
          }
        }
      }
    }
  });
}); 