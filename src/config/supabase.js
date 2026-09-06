import { createClient } from '@supabase/supabase-js';

// se obtienen las credenciales de conexión desde las variables de entorno.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('faltan las variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_KEY.');
}

// se inicializa y exporta el cliente de Supabase.
export const supabase = createClient(supabaseUrl, supabaseKey);
