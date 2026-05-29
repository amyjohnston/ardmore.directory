import { createAuthClient } from 'better-auth/client';

// baseURL is inferred from window.location at runtime — no hardcoding needed.
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
