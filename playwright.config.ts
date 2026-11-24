import { defineConfig, devices } from '@playwright/test'

const chrome = process.env.UGEN_CHROME_PATH
const baseURL = process.env.UGEN_TEST_URL ?? 'http://127.0.0.1:3100'
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  workers: 2,
  timeout: 35_000,
  reporter: 'list',
  use: { ...devices['Desktop Chrome'], baseURL, reducedMotion: 'reduce', launchOptions: chrome ? { executablePath: chrome } : {} },
  webServer: process.env.UGEN_TEST_URL ? undefined : {
    command: 'npm run start -- --hostname 127.0.0.1 --port 3100',
    url: baseURL, reuseExistingServer: true, timeout: 30_000,
  },
})
