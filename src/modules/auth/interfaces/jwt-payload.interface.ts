export interface JwtPayload {
  uid: string;
  jti: string;
  role?: string | null;
  permissions?: string[];
  iat?: number;
  exp?: number;
}
