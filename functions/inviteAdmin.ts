import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Send admin invitation
        await base44.users.inviteUser("greenteamdallas@gmail.com", "admin");
        
        return Response.json({ 
            success: true,
            message: "Admin invitation sent to greenteamdallas@gmail.com"
        });
    } catch (error) {
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});