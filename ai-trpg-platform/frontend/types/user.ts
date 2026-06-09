export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  avatar_url?: string | null;
  created_at?: string | null;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
