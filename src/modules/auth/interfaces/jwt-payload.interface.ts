export interface JwtPayload {
  uid: string;
  jti: string;
  role?: string | null;
  iat?: number;
  exp?: number;
}
