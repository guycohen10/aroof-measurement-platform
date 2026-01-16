import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  console.log('🔍 === DIAGNOSTIC MODE ACTIVATED ===');
  
  try {
    // Test 1: Authentication
    let authStatus = 'UNKNOWN';
    let userEmail = 'NONE';
    try {
      const base44 = createClientFromRequest(req);
      const user = await base44.auth.me();
      authStatus = user ? 'SUCCESS' : 'FAILED';
      userEmail = user?.email || 'NONE';
    } catch (authError) {
      authStatus = 'ERROR: ' + authError.message;
    }
    
    console.log('✅ Auth Test:', authStatus, userEmail);
    
    // Test 2: Environment Variables
    const googleKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    const replicateKey1 = Deno.env.get('REPLICATE_API_KEY');
    const replicateKey2 = Deno.env.get('REPLICATE_API_TOKEN');
    
    console.log('✅ Env Check:', {
      GOOGLE_MAPS_API_KEY: !!googleKey,
      REPLICATE_API_KEY: !!replicateKey1,
      REPLICATE_API_TOKEN: !!replicateKey2
    });
    
    // Test 3: Body Parsing
    let bodyStatus = 'UNKNOWN';
    let parsedBody = null;
    try {
      parsedBody = await req.json();
      bodyStatus = 'SUCCESS';
    } catch (bodyError) {
      bodyStatus = 'ERROR: ' + bodyError.message;
    }
    
    console.log('✅ Body Parse:', bodyStatus);
    
    // Test 4: Replicate API Connectivity (if key exists)
    let replicateTest = 'SKIPPED';
    if (replicateKey1 || replicateKey2) {
      try {
        const testKey = replicateKey1 || replicateKey2;
        const testResponse = await fetch('https://api.replicate.com/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Token ${testKey}`
          }
        });
        replicateTest = testResponse.ok ? 'CONNECTED' : 'FAILED: ' + testResponse.status;
      } catch (replicateError) {
        replicateTest = 'ERROR: ' + replicateError.message;
      }
    }
    
    console.log('✅ Replicate Test:', replicateTest);
    
    // Return full diagnostic report
    const diagnostics = {
      status: 'DIAGNOSTIC_COMPLETE',
      timestamp: new Date().toISOString(),
      tests: {
        authentication: authStatus,
        userEmail: userEmail,
        secrets: {
          GOOGLE_MAPS_API_KEY: googleKey ? 'FOUND' : 'MISSING',
          REPLICATE_API_KEY: replicateKey1 ? 'FOUND' : 'MISSING',
          REPLICATE_API_TOKEN: replicateKey2 ? 'FOUND' : 'MISSING'
        },
        bodyParsing: bodyStatus,
        bodyReceived: parsedBody ? Object.keys(parsedBody) : [],
        replicateAPI: replicateTest
      },
      verdict: (replicateKey1 || replicateKey2) && authStatus === 'SUCCESS' ? 'SYSTEM_HEALTHY' : 'ISSUE_DETECTED'
    };
    
    console.log('📊 Final Diagnostics:', JSON.stringify(diagnostics, null, 2));
    
    return Response.json(diagnostics, { status: 200 });
    
  } catch (error) {
    console.error('❌ DIAGNOSTIC CRASH:', error.message);
    console.error('Stack:', error.stack);
    
    return Response.json({
      status: 'DIAGNOSTIC_FAILED',
      error: error.message,
      type: error.constructor.name,
      stack: error.stack
    }, { status: 500 });
  }
});