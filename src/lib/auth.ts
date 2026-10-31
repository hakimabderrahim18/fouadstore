export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "fouad97";
export const ADMIN_COOKIE_NAME = "fouadstore_admin_session";
export const ADMIN_TOKEN_VALUE = "fouadstore_authenticated_token_97";

export function verifyAdminPassword(input: string): boolean {
  if (!input) return false;
  return input.trim() === ADMIN_PASSWORD;
}

export function isValidAdminToken(token?: string | null): boolean {
  if (!token) return false;
  return token === ADMIN_TOKEN_VALUE;
}
