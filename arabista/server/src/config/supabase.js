const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;

if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
} else {
  console.warn(
    'Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. Image storage operations will fail until configured in .env'
  );
}

const getSupabase = () => {
  if (!supabase) {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      return supabase;
    }
    throw new Error('Supabase client is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server/.env');
  }
  return supabase;
};

module.exports = {
  getSupabase,
};
