import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  console.log('=== GenerateRealisticRoof Started ===');
  
  try {
    // Authentication
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      console.error('❌ Unauthorized request');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('✅ User authenticated:', user.email);

    // Parse body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error('❌ JSON Parse Error:', e.message);
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { address, polygonCoordinates, material } = body;
    
    console.log('📋 Inputs:', {
      address,
      material,
      hasPolygon: !!polygonCoordinates,
      polygonPoints: polygonCoordinates?.length || 0
    });

    // Validation
    if (!address || !material) {
      console.error('❌ Missing required fields');
      return Response.json({ error: 'Missing address or material' }, { status: 400 });
    }

    // Get API Keys
    const GOOGLE_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY') || 'AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc';
    const REPLICATE_KEY = Deno.env.get('REPLICATE_API_KEY') || Deno.env.get('REPLICATE_API_TOKEN');
    
    console.log('🔑 Keys Status:', {
      google: !!GOOGLE_KEY,
      replicate: !!REPLICATE_KEY
    });
    
    if (!REPLICATE_KEY) {
      console.error('❌ REPLICATE_API_KEY not found in environment');
      return Response.json({ error: 'Server misconfigured: REPLICATE_API_KEY missing' }, { status: 500 });
    }

    // Build polygon path
    let pathString = "";
    if (polygonCoordinates && Array.isArray(polygonCoordinates) && polygonCoordinates.length > 0) {
      pathString = polygonCoordinates.map(p => `${p.lat},${p.lng}`).join('|');
      pathString += `|${polygonCoordinates[0].lat},${polygonCoordinates[0].lng}`;
      console.log('✅ Using polygon:', polygonCoordinates.length, 'points');
    } else {
      console.log('⚠️ No polygon - using fallback mask');
    }

    // Generate Google Maps URLs
    const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(address)}&zoom=20&size=640x640&maptype=satellite&key=${GOOGLE_KEY}`;
    
    let maskUrl;
    if (pathString) {
      maskUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(address)}&zoom=20&size=640x640&maptype=satellite&style=feature:all|visibility:off&path=color:0x00000000|weight:0|fillcolor:0xFFFFFFFF|${pathString}&key=${GOOGLE_KEY}`;
    } else {
      maskUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(address)}&zoom=20&size=640x640&maptype=satellite&style=feature:all|visibility:off&path=color:0x00000000|weight:0|fillcolor:0xFFFFFFFF|33.0,-96.8|33.0,-96.8&key=${GOOGLE_KEY}`;
    }
    
    console.log('📸 URLs generated');

    // Call Replicate with Prefer: wait header
    const prompt = `A photorealistic residential house with a ${material} roof, 8k resolution, highly detailed textures, realistic lighting shadows`;
    const negativePrompt = 'cartoon, blurry, drawing, bad quality, low res, text, watermark';
    
    console.log('🚀 Calling Replicate API...');
    
    const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait=30'
      },
      body: JSON.stringify({
        version: 'c221b2b8ef527988fb59bf24a8b97c4561f1c671f73bd389f866bfb27c061316',
        input: {
          image: mapUrl,
          mask: maskUrl,
          prompt: prompt,
          negative_prompt: negativePrompt,
          strength: 0.95
        }
      })
    });
    
    console.log('📡 Replicate responded:', replicateResponse.status);
    
    const prediction = await replicateResponse.json();
    
    if (!replicateResponse.ok) {
      console.error('❌ Replicate Error:', prediction);
      return Response.json({ 
        error: 'Replicate API failed',
        details: prediction
      }, { status: 500 });
    }
    
    console.log('🔮 Prediction:', prediction.status, prediction.id);
    
    // Check if already completed (with Prefer: wait)
    if (prediction.status === 'succeeded') {
      const resultUrl = prediction.output?.[0] || prediction.output;
      console.log('✅ Immediate success:', resultUrl);
      return Response.json({ 
        success: true,
        imageUrl: resultUrl
      });
    }
    
    // Poll if not completed
    console.log('⏳ Polling for result...');
    let attempts = 0;
    
    while (attempts < 60) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { 'Authorization': `Token ${REPLICATE_KEY}` }
      });
      
      const status = await statusResponse.json();
      
      if (status.status === 'succeeded') {
        const resultUrl = status.output?.[0] || status.output;
        console.log('✅ Generation complete');
        return Response.json({ 
          success: true,
          imageUrl: resultUrl
        });
      } else if (status.status === 'failed') {
        console.error('❌ Generation failed:', status.error);
        return Response.json({ 
          error: 'AI generation failed',
          details: status.error
        }, { status: 500 });
      }
      
      attempts++;
      if (attempts % 10 === 0) {
        console.log(`⏳ Still waiting... ${attempts * 2}s`);
      }
    }
    
    console.error('❌ Timeout after 2 minutes');
    return Response.json({ error: 'Generation timeout' }, { status: 408 });
    
  } catch (error) {
    console.error('❌ FATAL ERROR:', error.message);
    console.error('Stack:', error.stack);
    return Response.json({ 
      error: error.message,
      type: error.constructor.name
    }, { status: 500 });
  }
});