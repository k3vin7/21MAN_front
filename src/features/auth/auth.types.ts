export type AuthUser = {
  id: number;
  email: string;
  username: string;
  avatar?: string;
  bio?: string;
  created_at: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  username: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
};

export type RefreshResponse = {
  access_token: string;
  token_type: 'Bearer';
};

