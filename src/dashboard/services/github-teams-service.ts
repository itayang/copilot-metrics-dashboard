import { ServerActionResponse } from "@/features/common/server-action-response";
import { formatResponseError, unknownResponseError } from "@/features/common/response-error";
import { ensureGitHubEnvConfig } from "./env-service";

export interface GitHubTeamFromApi {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  privacy: string;
  permission: string;
  members_count: number;
  repos_count: number;
}

export const getGitHubTeamsFromApi = async (
  organization: string,
  token?: string // Optional: use different token
): Promise<ServerActionResponse<GitHubTeamFromApi[]>> => {
  const env = ensureGitHubEnvConfig();

  if (env.status !== "OK") {
    return env;
  }

  // Use provided token or fall back to environment token
  const authToken = token || env.response.token;
  const { version } = env.response;

  try {
    const url = `https://api.github.com/orgs/${organization}/teams`;
    
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${authToken}`,
        "X-GitHub-Api-Version": version,
      },
    });

    if (!response.ok) {
      return formatResponseError(`Teams for ${organization}`, response);
    }

    const teams: GitHubTeamFromApi[] = await response.json();
    
    return {
      status: "OK",
      response: teams,
    };
  } catch (e) {
    return unknownResponseError(e);
  }
};
