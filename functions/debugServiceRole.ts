import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Inspect root client
    const rootKeys = Object.keys(base44);
    const usersMethods = base44.users ? Object.keys(base44.users) : [];
    const authMethods = base44.auth ? Object.keys(base44.auth) : [];

    // Try invite (should fail if auth required)
    let inviteResult = "Not attempted";
    try {
        await base44.users.inviteUser("test-invite@example.com", "user");
        inviteResult = "Success";
    } catch (e) {
        inviteResult = `Failed: ${e.message}`;
    }

    return Response.json({ 
        rootKeys, 
        usersMethods, 
        authMethods,
        inviteResult 
    });
  } catch (err) {
    return Response.json({ error: err.message });
  }
});