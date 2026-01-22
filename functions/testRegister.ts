import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const email = `test-${Date.now()}@example.com`;
    const password = "Password123!";
    
    // Try to register
    let registerResult;
    try {
        // Guessing signature: email, password, metadata? 
        // Or object? {email, password, options}?
        // Let's try standard Supabase style: (email, password, options)
        // Or Base44 style might be different. 
        // Inspecting method signature is hard in JS.
        // Let's try passing object first which is common in modern SDKs
        
        // Actually, let's try to just log the function to string if possible, or try common patterns.
        // Pattern A: .register(email, password)
        const res = await base44.auth.register(email, password, {
            data: {
                full_name: "Test User",
                role: "test_role"
            }
        });
        registerResult = { success: true, data: res };
    } catch (e) {
        registerResult = { success: false, error: e.message };
    }

    return Response.json({ 
        attemptedEmail: email,
        registerResult 
    });
  } catch (err) {
    return Response.json({ error: err.message });
  }
});