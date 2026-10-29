import { Octokit } from "@octokit/rest";
import type { AuthUser } from "@/types/auth";

/** Returns an Octokit instance authenticated with the given token. */
export function getOctokit(token: string): Octokit {
  return new Octokit({ auth: token });
}

/**
 * Calls GET /user and maps the response to an AuthUser.
 * Throws if the request fails.
 */
export async function fetchAuthenticatedUser(token: string): Promise<AuthUser> {
  const octokit = getOctokit(token);
  const { data } = await octokit.rest.users.getAuthenticated();
  return {
    login: data.login,
    avatarUrl: data.avatar_url,
    token,
  };
}
