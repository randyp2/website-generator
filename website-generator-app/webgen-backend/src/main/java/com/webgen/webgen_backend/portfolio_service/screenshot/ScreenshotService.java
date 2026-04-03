package com.webgen.webgen_backend.portfolio_service.screenshot;

import com.microsoft.playwright.*;
import com.microsoft.playwright.options.LoadState;
import com.microsoft.playwright.options.ScreenshotType;
import com.microsoft.playwright.options.WaitUntilState;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ScreenshotService {

    @Value("${webgen.screenshot.base-url:http://localhost:3000}")
    private String baseUrl;

    private Playwright playwright;
    private Browser browser;


    /**
     * Initialize Playwright once not everytime a screenshot is made
     * - init when bean is constructed and dependencies are injected by spring boot container
     */
    @PostConstruct
    public void init() {
        playwright = Playwright.create();
        browser = playwright.chromium().launch(
                new BrowserType.LaunchOptions().setHeadless(true) // Visible window for debugging
        );
    }

    /**
     * Clean up playwright initialization when spring boot shuts down
     */
    @PreDestroy
    public void destroy() {
        if (browser != null) browser.close();
        if (playwright != null) playwright.close();
    }

    /**
     * Given a slug navigate to the page via playwright and then take a screenshot.
     * This screenshot will be used to for portfolio cards and portfolio previews
     * under /dashboard-user route and /explore route
     * @param slug a String representing where the users portfolio is hosted under a Domain Name
     * @return image bytes of the captured screenshot
     */
    public byte[] captureScreenshot(String slug) {

        String url = baseUrl + "/portfolio/" + slug;
        System.out.println(">>> [SCREENSHOT] Navigating to: " + url);

        // Create isolated browser context
        try (BrowserContext context = browser.newContext(
                new Browser.NewContextOptions().setViewportSize(1280, 800)
        )) {

            // Load page until network requests stop - MAX WAIT = 30 seconds
            Page page = context.newPage();
            page.navigate(url, new Page.NavigateOptions()
                    .setWaitUntil(WaitUntilState.NETWORKIDLE)
                    .setTimeout(30000));

            // Ensure all resources (including Tailwind CDN script) have loaded
            page.waitForLoadState(LoadState.LOAD, new Page.WaitForLoadStateOptions().setTimeout(15000));

            // Reload to ensure Tailwind CDN processes all styles on second pass
            page.reload(new Page.ReloadOptions()
                    .setWaitUntil(WaitUntilState.NETWORKIDLE)
                    .setTimeout(30000));

            // Wait for React to re-mount and Tailwind to process styles
            page.waitForTimeout(3000);

            return page.screenshot(new Page.ScreenshotOptions()
                    .setFullPage(false)
                    .setType(ScreenshotType.PNG));

        }
    }

}
