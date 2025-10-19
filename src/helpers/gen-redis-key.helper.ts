export const genRefreshTokenKey = (jti: string): string =>
  `refresh_token:${jti}`;

export const genAccessTokenKey = (jti: string): string => `access_token:${jti}`;
export const genRevokeKey = (jti: string): string => `blacklist_token:${jti}`;
