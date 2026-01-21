import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const results = {};
  
  // Test 1: Does asServiceRole exist?
  try {
    const serviceRole = base44.asServiceRole;
    results.hasServiceRole = !!serviceRole;
    results.serviceRoleType = typeof serviceRole;
  } catch (e) {
    results.hasServiceRole = false;
    results.serviceRoleError = e.message;
  }
  
  // Test 2: Does auth.admin exist?
  try {
    const admin = base44.asServiceRole?.auth?.admin;
    results.hasAuthAdmin = !!admin;
    results.authAdminMethods = admin ? Object.keys(admin) : [];
  } catch (e) {
    results.hasAuthAdmin = false;
    results.authAdminError = e.message;
  }
  
  // Test 3: Does createUser method exist?
  try {
    const createUser = base44.asServiceRole?.auth?.admin?.createUser;
    results.hasCreateUser = typeof createUser === 'function';
  } catch (e) {
    results.hasCreateUser = false;
    results.createUserError = e.message;
  }
  
  // Test 4: Does inviteUserByEmail exist?
  try {
    const inviteUser = base44.asServiceRole?.auth?.admin?.inviteUserByEmail;
    results.hasInviteUser = typeof inviteUser === 'function';
  } catch (e) {
    results.hasInviteUser = false;
  }
  
  return Response.json(results);
});