import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./src/tests/e2e",
  timeout: 20 * 1000,
  use: {
    headless: false,
    baseURL: "http://localhost:3000",
    viewport: { width: 1300, height: 720 },
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
    {
      name: "webkit",
      use: { browserName: "webkit" },
    },
  ],
  webServer: {
    command: "npm run build && npm run preview",
    port: 3000,
    reuseExistingServer: true,
    timeout: 60 * 60 * 1000,
  },
});
