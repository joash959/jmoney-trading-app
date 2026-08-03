import { FunctionsHttpError } from '@supabase/supabase-js';

export async function parseFunctionError(error: unknown) {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = await error.context.json();
      return body.error ?? 'Something went wrong. Please try again.';
    } catch {
      // fall through to default message
    }
  }
  return 'Something went wrong. Please try again.';
}
