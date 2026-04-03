require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

// Conexión a Supabase usando tus credenciales del archivo .env
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

module.exports = supabase;
