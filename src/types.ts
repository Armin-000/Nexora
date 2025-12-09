// src/types.ts

export type Role = 'system' | 'user' | 'assistant';

export interface Message {
  id: number;
  role: Role;
  content: string;
}

export interface AuthUser {
  id?: number;
  email: string;
}

export interface OllamaChunk {
  model: string;
  created_at: string;
  message?: {
    role: Role;
    content: string;
  };
  done: boolean;
}
