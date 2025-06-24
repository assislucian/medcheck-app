import { test, expect } from '@playwright/test';

test.describe('Layout Consistency Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: navigate to the app and wait for it to load
    await page.goto('http://localhost:8083/');
    await page.waitForLoadState('networkidle');
  });

  test('All pages should use consistent layout classes', async ({ page }) => {
    const routes = [
      '/dashboard',
      '/guides', 
      '/demonstratives',
      '/unpaid-procedures'
    ];

    for (const route of routes) {
      await page.goto(`http://localhost:8083${route}`);
      await page.waitForLoadState('networkidle');

      // Check if main content uses content-layout class
      const mainContent = page.locator('main .content-layout');
      await expect(mainContent).toHaveCount(1);

      // Check if sections use section-spacing class
      const sections = page.locator('.section-spacing');
      await expect(sections).toHaveCount.greaterThan(0);

      // Check that no page-level wrappers have conflicting padding/margin
      const pageWrappers = page.locator('main > div:not(.content-layout)');
      for (let i = 0; i < await pageWrappers.count(); i++) {
        const wrapper = pageWrappers.nth(i);
        const className = await wrapper.getAttribute('class') || '';
        
        // Should not have px-, mx-, max-w- classes that could cause misalignment
        expect(className).not.toMatch(/px-[0-9]/);
        expect(className).not.toMatch(/mx-[0-9]/);
        expect(className).not.toMatch(/max-w-/);
      }
    }
  });

  test('Sidebar offset should be consistent across all pages', async ({ page }) => {
    const routes = [
      '/dashboard',
      '/guides',
      '/demonstratives', 
      '/unpaid-procedures'
    ];

    let expectedOffset: string | null = null;

    for (const route of routes) {
      await page.goto(`http://localhost:8083${route}`);
      await page.waitForLoadState('networkidle');

      // Get the computed left margin of the main content
      const mainElement = page.locator('main');
      const leftMargin = await mainElement.evaluate(el => 
        window.getComputedStyle(el).marginLeft
      );

      if (expectedOffset === null) {
        expectedOffset = leftMargin;
      } else {
        // All pages should have the same left margin
        expect(leftMargin).toBe(expectedOffset);
      }
    }
  });

  test('Content should not have horizontal gaps or misalignment', async ({ page }) => {
    const routes = [
      '/dashboard',
      '/guides',
      '/demonstratives',
      '/unpaid-procedures'
    ];

    for (const route of routes) {
      await page.goto(`http://localhost:8083${route}`);
      await page.waitForLoadState('networkidle');

      // Check that content doesn't overflow horizontally
      const body = page.locator('body');
      const overflowX = await body.evaluate(el => 
        window.getComputedStyle(el).overflowX
      );
      expect(overflowX).not.toBe('auto');
      expect(overflowX).not.toBe('scroll');

      // Check that main content is properly contained
      const main = page.locator('main');
      const mainWidth = await main.evaluate(el => el.offsetWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      
      // Main content should not exceed viewport width
      expect(mainWidth).toBeLessThanOrEqual(viewportWidth);
    }
  });

  test('Layout should be responsive across breakpoints', async ({ page }) => {
    const breakpoints = [
      { width: 375, height: 667 },   // Mobile
      { width: 768, height: 1024 },  // Tablet
      { width: 1280, height: 720 },  // Desktop
      { width: 1536, height: 864 }   // Large Desktop
    ];

    for (const breakpoint of breakpoints) {
      await page.setViewportSize(breakpoint);
      await page.goto('http://localhost:8083/dashboard');
      await page.waitForLoadState('networkidle');

      // Check that layout adapts properly
      const main = page.locator('main');
      const mainWidth = await main.evaluate(el => el.offsetWidth);
      
      // Content should be properly sized for the viewport
      expect(mainWidth).toBeLessThanOrEqual(breakpoint.width);
      expect(mainWidth).toBeGreaterThan(breakpoint.width * 0.5); // At least 50% of viewport
    }
  });

  test('No layout shift during navigation', async ({ page }) => {
    // Start at dashboard
    await page.goto('http://localhost:8083/dashboard');
    await page.waitForLoadState('networkidle');

    // Get initial layout metrics
    const initialLayout = await page.evaluate(() => {
      const main = document.querySelector('main');
      return {
        left: main?.getBoundingClientRect().left || 0,
        width: main?.offsetWidth || 0
      };
    });

    // Navigate to other pages and check for layout shifts
    const routes = ['/guides', '/demonstratives', '/unpaid-procedures'];
    
    for (const route of routes) {
      await page.goto(`http://localhost:8083${route}`);
      await page.waitForLoadState('networkidle');

      const currentLayout = await page.evaluate(() => {
        const main = document.querySelector('main');
        return {
          left: main?.getBoundingClientRect().left || 0,
          width: main?.offsetWidth || 0
        };
      });

      // Layout should remain consistent (within 2px tolerance)
      expect(Math.abs(currentLayout.left - initialLayout.left)).toBeLessThan(2);
      expect(Math.abs(currentLayout.width - initialLayout.width)).toBeLessThan(2);
    }
  });

  test('CSS variables should be properly defined', async ({ page }) => {
    await page.goto('http://localhost:8083/dashboard');
    await page.waitForLoadState('networkidle');

    // Check that layout CSS variables are defined
    const cssVariables = await page.evaluate(() => {
      const root = document.documentElement;
      const computedStyle = window.getComputedStyle(root);
      
      return {
        sidebarWidth: computedStyle.getPropertyValue('--sidebar-width'),
        pageMaxWidth: computedStyle.getPropertyValue('--page-max-width'),
        pageMinWidth: computedStyle.getPropertyValue('--page-min-width')
      };
    });

    expect(cssVariables.sidebarWidth).toBeTruthy();
    expect(cssVariables.pageMaxWidth).toBeTruthy();
    expect(cssVariables.pageMinWidth).toBeTruthy();
  });
}); 