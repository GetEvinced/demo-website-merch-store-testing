import { setCredentials, setOfflineCredentials } from '@evinced/js-playwright-sdk';

/**
 * Global setup — runs once before all Playwright tests.
 *
 * Authenticates the Evinced SDK using environment variables:
 *
 *   Online mode (default):
 *     EVINCED_SERVICE_ID   – your Evinced Service Account ID
 *     EVINCED_API_KEY      – your Evinced API Key
 *
 *   Offline mode (JWT supplied by Evinced):
 *     EVINCED_SERVICE_ID   – your Evinced Service Account ID
 *     EVINCED_AUTH_TOKEN   – the offline JWT provided by Evinced
 *
 * Never hard-code credentials here; always use environment variables.
 */
async function globalSetup(): Promise<void> {
  const serviceId = process.env.EVINCED_SERVICE_ID;
  const apiKey = process.env.EVINCED_API_KEY;
  const authToken = process.env.EVINCED_AUTH_TOKEN;

  if (!serviceId) {
    throw new Error(
      'Missing EVINCED_SERVICE_ID environment variable. ' +
        'Please set it before running the tests.'
    );
  }

  try {
    if (authToken) {
      // Offline mode — use a pre-issued JWT instead of contacting the licensing server
      await setOfflineCredentials({ serviceId, token: authToken });
    } else {
      if (!apiKey) {
        throw new Error(
          'Missing EVINCED_API_KEY environment variable. ' +
            'Set EVINCED_API_KEY for online mode, or EVINCED_AUTH_TOKEN for offline mode.'
        );
      }
      await setCredentials({ serviceId, secret: apiKey });
    }
  } catch (error) {
    throw new Error(`Evinced SDK authentication failed: ${(error as Error).message}`);
  }
}

export default globalSetup;
