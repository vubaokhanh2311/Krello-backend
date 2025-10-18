export interface JwtPayload {
  uid: string;
  jti: string;
  iat?: number;
  exp?: number;
}
