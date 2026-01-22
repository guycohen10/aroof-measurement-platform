import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    const keys = Object.keys(sr);
    const methods = {};
    
    // Check specific namespaces
    if (sr.users) methods.users = Object.keys(sr.users);
    if (sr.auth) methods.auth = Object.keys(sr.auth);
    if (sr.admin) methods.admin = Object.keys(sr.admin);
    
    // Check deeper
    if (sr.auth?.admin) methods.authAdmin = Object.keys(sr.auth.admin);

    console.log("Service Role Keys:", keys);
    console.log("Service Role Methods:", methods);
    
    // Try to find Supabase client
    const supabaseExists = !!sr.supabase;
    console.log("Has Supabase Client:", supabaseExists);

    return Response.json({ keys, methods, supabaseExists });
  } catch (err) {
    return Response.json({ error: err.message, stack: err.stack });
  }
});