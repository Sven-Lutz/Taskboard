/**
 * GitHub Device Flow authentication.
 * Docs: https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#device-flow
 *
 * No client_secret needed — the entire flow runs in the browser.
 */

const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID as string;

export interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

/** Step 1: Request a device + user code from GitHub. */
export async function requestDeviceCode(): Promise<DeviceCodeResponse> {
  const res = await fetch("https://github.com/login/device/code", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ client_id: CLIENT_ID, scope: "repo" }),
  });
  if (!res.ok) throw new Error("Failed to request device code");
  return res.json() as Promise<DeviceCodeResponse>;
}

/** Step 2: Poll until the user authorises or the code expires. */
export async function pollForToken(
  deviceCode: string,
  intervalSeconds: number,
  signal: AbortSignal
): Promise<string> {
  let waitMs = intervalSeconds * 1000;

  while (!signal.aborted) {
    await new Promise((resolve) => setTimeout(resolve, waitMs));
    if (signal.aborted) break;

    const res = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        device_code: deviceCode,
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
      }),
    });

    if (!res.ok) throw new Error("Polling request failed");

    const data = (await res.json()) as {
      access_token?: string;
      error?: string;
      interval?: number;
    };

    if (data.access_token) return data.access_token;
    if (data.error === "slow_down") waitMs = (data.interval ?? intervalSeconds + 5) * 1000;
    if (data.error === "expired_token") throw new Error("Device code expired. Please try again.");
    if (data.error === "access_denied") throw new Error("Access denied.");
    // "authorization_pending" → keep polling
  }

  throw new Error("Polling aborted");
}
