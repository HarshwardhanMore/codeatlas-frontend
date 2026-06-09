let accessToken: string | null = null;

export const tokenStorage = {
  clear(): void {
    accessToken = null;
  },
  get(): string | null {
    return accessToken;
  },
  set(token: string): void {
    accessToken = token;
  },
};
