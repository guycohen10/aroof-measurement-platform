import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const email = `invite-${Date.now()}@example.com`;

    console.log("Inviting:", email);
    
    try {
        await base44.users.inviteUser(email, "user");
        console.log("Invite call success");
    } catch (e) {
        console.log("Invite call failed:", e.message);
        return Response.json({ success: false, error: e.message });
    }

    // Check if user was created
    // Wait a bit for async creation?
    await new Promise(r => setTimeout(r, 1000));

    const users = await base44.asServiceRole.entities.User.filter({ email });
    const created = users && users.length > 0;

    return Response.json({ 
        success: true,
        email,
        created,
        user: created ? users[0] : null
    });
  } catch (err) {
    return Response.json({ error: err.message });
  }
});