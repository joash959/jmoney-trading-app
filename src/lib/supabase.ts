import 'react-native-url-polyfill/auto';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// The anon/public key is safe to ship in a mobile client - Row Level
// Security on the Supabase tables is what actually protects the data.
const SUPABASE_URL = 'https://kkayisukkckaqqxwouga.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrYXlpc3Vra2NrYXFxeHdvdWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MTI0MjQsImV4cCI6MjEwMzQ4ODQyNH0.COAzwgYEcKK4RoGbbUeEJ_VjnH1VBMmSO7rzP1yuOCo';

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
