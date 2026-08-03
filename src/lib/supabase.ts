import 'react-native-url-polyfill/auto';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// The anon/public key is safe to ship in a mobile client - Row Level
// Security on the Supabase tables is what actually protects the data.
const SUPABASE_URL = 'https://tfyeidideacnwmqjflos.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmeWVpZGlkZWFjbndtcWpmbG9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5Njc5NzUsImV4cCI6MjA4MzU0Mzk3NX0.RjeXoaVT0QCy4rRmwGadlc7HlJZyjKIV0EbeIMcYynA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Supabase's token auto-refresh timer keeps running in the background
// even while the app is backgrounded unless it's told to stop, which
// wastes battery and can throw refresh errors - pause/resume it based
// on whether the app is actually in the foreground.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
