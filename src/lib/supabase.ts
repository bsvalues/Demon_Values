import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced URL validation
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'https:' && url.hostname.includes('.supabase.co');
  } catch (e) {
    return false;
  }
}

// Enhanced key validation
function isValidAnonKey(key: string): boolean {
  return /^eyJ[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*$/.test(key);
}

// Create client only if we have valid credentials
export const supabase = (supabaseUrl && supabaseKey && isValidUrl(supabaseUrl) && isValidAnonKey(supabaseKey))
  ? createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      db: {
        schema: 'public'
      },
      global: {
        fetch: fetch.bind(globalThis),
        headers: { 
          'x-application-name': 'ai-support-platform',
          'x-client-info': 'ai-support-platform/1.0.0'
        }
      }
    })
  : null;

// Connection state management
let connectionState = {
  isConnected: false,
  lastCheck: 0,
  checkInterval: 30000, // Check every 30 seconds
  retryCount: 0,
  maxRetries: 3
};

export async function checkSupabaseConnection() {
  if (!supabaseUrl) {
    throw new Error(
      'Missing Supabase URL. Please click "Connect to Supabase" to configure your database.'
    );
  }

  if (!isValidUrl(supabaseUrl)) {
    throw new Error(
      'Invalid Supabase URL format. URL must be a valid HTTPS Supabase endpoint.'
    );
  }

  if (!supabaseKey) {
    throw new Error(
      'Missing Supabase anon key. Please click "Connect to Supabase" to configure your database.'
    );
  }

  if (!isValidAnonKey(supabaseKey)) {
    throw new Error(
      'Invalid Supabase anon key format. Please check your configuration.'
    );
  }

  if (!supabase) {
    throw new Error(
      'Database client not initialized. Please click "Connect to Supabase" to configure your database.'
    );
  }

  try {
    // Only check connection if enough time has passed since last check
    const now = Date.now();
    if (now - connectionState.lastCheck < connectionState.checkInterval && connectionState.isConnected) {
      return true;
    }

    // Test database connection with a simple query
    const { data, error } = await supabase
      .from('tickets')
      .select('count')
      .limit(1)
      .single();

    if (error) {
      // Handle specific error cases
      switch (error.code) {
        case '42501':
          throw new Error('Permission denied. Please check your database permissions.');
        case 'PGRST116':
          throw new Error('Database connection failed. Please check your Supabase configuration.');
        case '20000':
          throw new Error('Database is currently unavailable. Please try again later.');
        case '28000':
          throw new Error('Invalid credentials. Please check your Supabase configuration.');
        default:
          if (error.message.includes('Failed to fetch')) {
            throw new Error(
              'Unable to connect to Supabase. Please ensure you have clicked "Connect to Supabase" and configured your database properly.'
            );
          }
          throw error;
      }
    }

    // Update connection state
    connectionState.isConnected = true;
    connectionState.lastCheck = now;
    connectionState.retryCount = 0;
    return true;

  } catch (error) {
    connectionState.isConnected = false;
    
    // Handle retry logic
    if (connectionState.retryCount < connectionState.maxRetries) {
      connectionState.retryCount++;
      const delay = Math.pow(2, connectionState.retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return checkSupabaseConnection();
    }

    // Reset retry count after max retries
    connectionState.retryCount = 0;
    
    if (error instanceof Error) {
      // Network-related errors
      if (error.message.includes('Failed to fetch')) {
        throw new Error(
          'Unable to connect to Supabase. Please ensure you have clicked "Connect to Supabase" and configured your database properly.'
        );
      }
      if (error.message.includes('NetworkError')) {
        throw new Error(
          'Network error while connecting to Supabase. Please check your internet connection and try again.'
        );
      }
      if (error.message.includes('timeout')) {
        throw new Error(
          'Connection timed out. Please check your internet connection and try again.'
        );
      }
      
      throw new Error(`Database connection failed: ${error.message}`);
    }
    
    throw new Error('Failed to connect to database. Please check your configuration.');
  }
}

// Helper function for retrying database operations
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Don't retry certain errors
      if (error instanceof Error) {
        if (error.message.includes('Permission denied') ||
            error.message.includes('Invalid credentials')) {
          throw error;
        }
      }
      
      // Wait before retrying
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }

  throw lastError || new Error('Operation failed after retries');
}