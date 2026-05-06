import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from "@nestjs/common";

type TwitchToken = {
  accessToken: string;
  expiresAt: number;
};

type TwitchUser = {
  id: string;
  login: string;
  display_name: string;
  profile_image_url: string;
};

type TwitchStream = {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_name: string;
  title: string;
  started_at: string;
  thumbnail_url: string;
};

type TwitchPublicChannelPayload = {
  id: string;
  login: string;
  displayName: string | null;
  profileImageUrl: string | null;
  stream: LiveStreamSnapshot | null;
};

type ResolvedChannel = {
  id: string | null;
  login: string;
  displayName: string | null;
  profileImageUrl: string | null;
  source: "api" | "public";
};

type LiveStreamSnapshot = {
  id: string | null;
  userId: string | null;
  userLogin: string;
  userName: string | null;
  gameName: string | null;
  title: string | null;
  startedAt: string | null;
  previewImageUrl: string | null;
  source: "api" | "public";
};

type TwitchPublicGqlResponse = {
  data?: {
    user?: {
      id: string;
      login: string;
      displayName: string | null;
      profileImageURL: string | null;
      stream?: {
        id: string;
        title: string | null;
        createdAt: string | null;
        previewImageURL: string | null;
        game?: {
          displayName: string | null;
        } | null;
      } | null;
    } | null;
  };
  errors?: Array<{
    message?: string;
  }>;
};

type TwitchConfigurationState = {
  mode: "api" | "public";
  clientIdConfigured: boolean;
  clientSecretConfigured: boolean;
  eventsubSecretConfigured: boolean;
  apiReady: boolean;
  eventsubReady: boolean;
  missing: string[];
};

const TWITCH_PUBLIC_GQL_CLIENT_ID = "kimne78kx3ncx6brgo4mv6wki5h1ko";
const TWITCH_PUBLIC_CHANNEL_QUERY = `
  query PublicChannelByLogin($login: String!) {
    user(login: $login) {
      id
      login
      displayName
      profileImageURL(width: 300)
      stream {
        id
        title
        createdAt
        previewImageURL(width: 640, height: 360)
        game {
          displayName
        }
      }
    }
  }
`;

@Injectable()
export class TwitchService {
  private cachedToken: TwitchToken | null = null;

  normalizeChannelInput(input: string) {
    const trimmed = input.trim();

    if (!trimmed) {
      throw new BadRequestException("Channel input is empty.");
    }

    const urlMatch = trimmed.match(/^https?:\/\/(?:www\.)?twitch\.tv\/([^/?#]+)/i);
    const rawLogin = (urlMatch?.[1] ?? trimmed)
      .replace(/^@/, "")
      .trim()
      .toLowerCase();

    if (!/^[a-zA-Z0-9_]{3,25}$/.test(rawLogin)) {
      throw new BadRequestException("Invalid Twitch channel format.");
    }

    return rawLogin;
  }

  async resolveChannel(input: string) {
    const login = this.normalizeChannelInput(input);

    if (!this.isApiConfigured()) {
      const channel = await this.getPublicChannelByLogin(login);

      if (!channel) {
        throw new BadRequestException("Twitch channel was not found.");
      }

      return {
        id: channel.id,
        login: channel.login,
        displayName: channel.displayName ?? channel.login,
        profileImageUrl: channel.profileImageUrl,
        source: "public",
      } satisfies ResolvedChannel;
    }

    const data = await this.request<{ data: TwitchUser[] }>(
      `https://api.twitch.tv/helix/users?login=${encodeURIComponent(login)}`,
    );

    if (!data.data.length) {
      throw new BadRequestException("Twitch channel was not found.");
    }

    return {
      id: data.data[0].id,
      login: data.data[0].login,
      displayName: data.data[0].display_name,
      profileImageUrl: data.data[0].profile_image_url,
      source: "api",
    } satisfies ResolvedChannel;
  }

  async getLiveStream(input: { userId?: string | null; login?: string | null }) {
    if (this.isApiConfigured() && input.userId) {
      return this.getLiveStreamByUserId(input.userId);
    }

    if (this.isApiConfigured() && input.login) {
      return this.getLiveStreamByLogin(input.login);
    }

    if (input.login) {
      const channel = await this.getPublicChannelByLogin(input.login);
      return channel?.stream ?? null;
    }

    return null;
  }

  getConfigurationState(): TwitchConfigurationState {
    const clientId = process.env.TWITCH_CLIENT_ID?.trim() ?? "";
    const clientSecret = process.env.TWITCH_CLIENT_SECRET?.trim() ?? "";
    const eventsubSecret = process.env.TWITCH_EVENTSUB_SECRET?.trim() ?? "";
    const clientIdConfigured = Boolean(clientId);
    const clientSecretConfigured = Boolean(clientSecret);
    const eventsubSecretConfigured = this.isValidEventsubSecret(eventsubSecret);
    const apiReady = clientIdConfigured && clientSecretConfigured;
    const missing: string[] = [];

    if (!clientIdConfigured) {
      missing.push("TWITCH_CLIENT_ID");
    }

    if (!clientSecretConfigured) {
      missing.push("TWITCH_CLIENT_SECRET");
    }

    if (!eventsubSecretConfigured) {
      missing.push("TWITCH_EVENTSUB_SECRET");
    }

    return {
      mode: apiReady ? "api" : "public",
      clientIdConfigured,
      clientSecretConfigured,
      eventsubSecretConfigured,
      apiReady,
      eventsubReady: apiReady && eventsubSecretConfigured,
      missing,
    };
  }

  private async getLiveStreamByUserId(userId: string): Promise<LiveStreamSnapshot | null> {
    const data = await this.request<{ data: TwitchStream[] }>(
      `https://api.twitch.tv/helix/streams?user_id=${encodeURIComponent(userId)}`,
    );

    const stream = data.data[0];

    if (!stream) {
      return null;
    }

    return {
      id: stream.id,
      userId: stream.user_id,
      userLogin: stream.user_login,
      userName: stream.user_name,
      gameName: stream.game_name,
      title: stream.title,
      startedAt: stream.started_at,
      previewImageUrl: stream.thumbnail_url,
      source: "api",
    };
  }

  private async getLiveStreamByLogin(login: string): Promise<LiveStreamSnapshot | null> {
    const data = await this.request<{ data: TwitchStream[] }>(
      `https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(login)}`,
    );

    const stream = data.data[0];

    if (!stream) {
      return null;
    }

    return {
      id: stream.id,
      userId: stream.user_id,
      userLogin: stream.user_login,
      userName: stream.user_name,
      gameName: stream.game_name,
      title: stream.title,
      startedAt: stream.started_at,
      previewImageUrl: stream.thumbnail_url,
      source: "api",
    };
  }

  private async request<T>(url: string): Promise<T> {
    const token = await this.getAppToken();

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-Id": this.getClientId(),
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new InternalServerErrorException(
        `Twitch API request failed (${response.status}): ${text}`,
      );
    }

    return response.json() as Promise<T>;
  }

  private isApiConfigured() {
    return Boolean(process.env.TWITCH_CLIENT_ID?.trim() && process.env.TWITCH_CLIENT_SECRET?.trim());
  }

  private async getAppToken() {
    if (this.cachedToken && this.cachedToken.expiresAt > Date.now() + 60_000) {
      return this.cachedToken.accessToken;
    }

    const clientId = this.getClientId();
    const clientSecret = this.getClientSecret();

    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    });

    const response = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new ServiceUnavailableException(
        `Unable to get Twitch app token (${response.status}): ${text}`,
      );
    }

    const data = (await response.json()) as {
      access_token: string;
      expires_in: number;
    };

    this.cachedToken = {
      accessToken: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };

    return data.access_token;
  }

  private async getPublicChannelByLogin(login: string): Promise<TwitchPublicChannelPayload | null> {
    const response = await fetch("https://gql.twitch.tv/gql", {
      method: "POST",
      headers: {
        "Client-ID": TWITCH_PUBLIC_GQL_CLIENT_ID,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: TWITCH_PUBLIC_CHANNEL_QUERY,
        variables: {
          login,
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new ServiceUnavailableException(
        `Unable to query Twitch public channel data (${response.status}): ${text}`,
      );
    }

    const payload = (await response.json()) as TwitchPublicGqlResponse;
    const errorMessage = payload.errors
      ?.map((error) => error.message?.trim())
      .filter(Boolean)
      .join("; ");

    if (errorMessage) {
      throw new ServiceUnavailableException(
        `Unable to query Twitch public channel data: ${errorMessage}`,
      );
    }

    const user = payload.data?.user;

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      login: user.login,
      displayName: user.displayName,
      profileImageUrl: user.profileImageURL,
      stream: user.stream
        ? {
            id: user.stream.id,
            userId: user.id,
            userLogin: user.login,
            userName: user.displayName ?? user.login,
            gameName: user.stream.game?.displayName ?? null,
            title: user.stream.title,
            startedAt: user.stream.createdAt,
            previewImageUrl: user.stream.previewImageURL,
            source: "public",
          }
        : null,
    };
  }

  private getClientId() {
    const value = process.env.TWITCH_CLIENT_ID?.trim();

    if (!value) {
      throw new ServiceUnavailableException(
        "TWITCH_CLIENT_ID is not configured. Register a Twitch app and fill .env.",
      );
    }

    return value;
  }

  private getClientSecret() {
    const value = process.env.TWITCH_CLIENT_SECRET?.trim();

    if (!value) {
      throw new ServiceUnavailableException(
        "TWITCH_CLIENT_SECRET is not configured. Register a Twitch app and fill .env.",
      );
    }

    return value;
  }

  private isValidEventsubSecret(value: string) {
    if (value.length < 10 || value.length > 100) {
      return false;
    }

    return Array.from(value).every((char) => char.charCodeAt(0) <= 0x7f);
  }
}
