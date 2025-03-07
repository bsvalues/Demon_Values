import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

export interface AuthUser extends User {
  organization?: {
    id: string;
    name: string;
    slug: string;
    subscription_status: string;
  };
  profile?: {
    full_name: string;
    role: string;
  };
}

export async function signUp(email: string, password: string, organizationName: string) {
  try {
    // Create user account
    const { data: auth, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) throw signUpError;
    if (!auth.user) throw new Error('Failed to create user account');

    // Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: organizationName,
        slug: organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      })
      .select()
      .single();

    if (orgError) throw orgError;

    // Create user profile
    const { error: profileError } = await supabase
      .from('users_profile')
      .insert({
        id: auth.user.id,
        organization_id: org.id,
        full_name: email.split('@')[0],
        role: 'admin', // First user is org admin
      });

    if (profileError) throw profileError;

    return { user: auth.user, organization: org };
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data: auth, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) throw signInError;
    if (!auth.user) throw new Error('Failed to sign in');

    // Get user profile and organization data
    const { data: profile, error: profileError } = await supabase
      .from('users_profile')
      .select(`
        *,
        organizations (
          id,
          name,
          slug,
          subscription_status
        )
      `)
      .eq('id', auth.user.id)
      .single();

    if (profileError) throw profileError;

    return {
      user: {
        ...auth.user,
        profile,
        organization: profile.organizations,
      } as AuthUser,
    };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    // Get profile and organization data
    const { data: profile, error: profileError } = await supabase
      .from('users_profile')
      .select(`
        *,
        organizations (
          id,
          name,
          slug,
          subscription_status
        )
      `)
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    return {
      ...user,
      profile,
      organization: profile.organizations,
    } as AuthUser;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

export async function updateProfile(userId: string, updates: Partial<{
  full_name: string;
  settings: Record<string, any>;
}>) {
  const { data, error } = await supabase
    .from('users_profile')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function generateApiKey(organizationId: string, name: string, permissions: string[]) {
  // Generate a secure random API key
  const key = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Generate a secure hash of the key
  const keyHash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(key)
  ).then(buf => Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join(''));

  // Store the key hash in the database
  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      organization_id: organizationId,
      name,
      key_hash: keyHash,
      permissions,
      created_at: new Date().toISOString(),
      last_used: null,
      expires_at: null, // Optional: Set an expiration date
      is_active: true
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      throw new Error('An API key with this name already exists');
    }
    throw error;
  }

  // Only return the actual key on creation
  return { 
    ...data,
    key: `dva_${key}` // Add a prefix to distinguish our API keys
  };
}