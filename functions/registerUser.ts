import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { email, name, company, plan } = await req.json();

    // Validation
    if (!email) throw new Error("Email is required");
    if (!name) throw new Error("Name is required");
    if (!company) throw new Error("Company name is required");

    // Use passed plan or default to starter
    const selectedPlan = plan ? plan.toLowerCase() : 'starter';

    const base44 = createClientFromRequest(req);

    // Check for existing user
    const existingUsers = await base44.asServiceRole.entities.User.filter({ email });
    if (existingUsers && existingUsers.length > 0) {
      // Throw a standard error that the frontend can read
      throw new Error("This email is already registered. Please log in.");
    }

    // Step 1: Create the Company Entity FIRST (Service Role)
    console.log(`Creating company: ${company} with plan: ${selectedPlan}`);
    const newCompany = await base44.asServiceRole.entities.Company.create({
      company_name: company,
      contact_email: email,
      contact_name: name,
      subscription_status: 'trial',
      subscription_tier: selectedPlan,
      is_active: true,
      trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    if (!newCompany || !newCompany.id) {
        throw new Error("Failed to create company record");
    }
    console.log(`Company created: ${newCompany.id}`);

    // Step 2: Invite using Service Role (Bypasses "You must be logged in" error)
    console.log(`Inviting user: ${email}`);
    // We can pass data to inviteUser if supported, but typically we update the user after
    await base44.asServiceRole.users.inviteUser(email, 'user');

    // Step 3: Attempt to Link (Safe Mode / Best Effort)
    // We try to find the user we just invited and update their company_id
    // We wrap this in try/catch so if it fails (e.g. user not immediately available), the registration still succeeds
    try {
      // Small delay to allow propagation
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Find user using service role (needed to see invited/unconfirmed users)
      const users = await base44.asServiceRole.entities.User.filter({ email });
      const user = users[0];

      if (user) {
        console.log(`Linking user ${user.id} to company ${newCompany.id}`);
        await base44.asServiceRole.entities.User.update(user.id, { 
          company_id: newCompany.id,
          full_name: name,
          aroof_role: 'external_roofer'
          // We could store 'selected_plan' in metadata if User entity had it, 
          // but we already set it on the Company entity which is the correct place.
        });
      } else {
        console.log("User record not found immediately after invite - they will need to be linked later.");
      }
    } catch (linkError) {
      console.warn("Warning: Could not link user to company immediately:", linkError.message);
      // Swallow error so client sees success
    }

    return Response.json({ 
      success: true,
      companyId: newCompany.id
    });

  } catch (error) {
    console.error("Registration Error:", error);
    // Return a clean error object instead of crashing with 500
    return Response.json({ 
      error: error.message || "Registration failed" 
    }, { status: 400 });
  }
});