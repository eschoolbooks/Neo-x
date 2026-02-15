import { createClient } from './client';
import type { Database } from './database.types';

type User = {
    id: string;
    email: string;
    full_name?: string;
};

/**
 * Sign up a new user with email and password
 */
export async function signUp(email: string, password: string, fullName?: string) {
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName || 'Student',
            },
            emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

/**
 * Sign in a user with email and password
 */
export async function signIn(email: string, password: string) {
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

/**
 * Sign out the current user
 */
export async function signOut() {
    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
        throw new Error(error.message);
    }
}

/**
 * Get the current user session
 */
export async function getSession() {
    const supabase = createClient();

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
        throw new Error(error.message);
    }

    return session;
}

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<User | null> {
    const supabase = createClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return null;
    }

    return {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name,
    };
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string) {
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    });

    if (error) {
        throw new Error(error.message);
    }
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string) {
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
        password: newPassword,
    });

    if (error) {
        throw new Error(error.message);
    }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
    const session = await getSession();
    return !!session;
}
