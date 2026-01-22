Deno.serve(async (req) => {
  const envKeys = Object.keys(Deno.env.toObject());
  const hasSupabaseUrl = !!Deno.env.get("SUPABASE_URL");
  const hasSupabaseKey = !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const hasSupabaseAnon = !!Deno.env.get("SUPABASE_ANON_KEY");
  
  return Response.json({ 
      keys: envKeys,
      hasSupabaseUrl,
      hasSupabaseKey,
      hasSupabaseAnon
  });
});