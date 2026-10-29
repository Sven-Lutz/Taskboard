import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const code = req.query["code"];

  if (!code || typeof code !== "string") {
    res.status(400).json({ error: "Missing code parameter" });
    return;
  }

  const clientId = process.env["VITE_GITHUB_CLIENT_ID"];
  const clientSecret = process.env["GITHUB_CLIENT_SECRET"];

  if (!clientId || !clientSecret) {
    res.status(500).json({ error: "OAuth app not configured" });
    return;
  }

  const response = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    },
  );

  const data = (await response.json()) as { access_token?: string; error?: string };

  if (!data.access_token) {
    res
      .status(400)
      .json({ error: data.error ?? "Failed to exchange code for token" });
    return;
  }

  res.status(200).json({ token: data.access_token });
}
