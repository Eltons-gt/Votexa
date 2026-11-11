import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://inuleocyvdzcspopiipl.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_PfeFM4jmSey-Kggq5UcBlQ_-CjhB7MB';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

