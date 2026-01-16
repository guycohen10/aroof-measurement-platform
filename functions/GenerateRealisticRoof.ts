import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// HARD-CODED API KEYS (Direct from user)
const GOOGLE_KEY = "AIzaSyA1beAjeMHo2UgNlUBEgGlfzojuJ0GD0L0";
const REPLICATE_KEY = "r8_emR8qiw7RptiJEXpi9KKQMoh66EkAhI3ET1ZW";

Deno.serve(async (req) => {
  console.log('🚀 === GenerateRealisticRoof Started (Hard-Coded Keys) ===');
  
  try {
    // Authentication
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      console.error('❌ Unauthorized');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('✅ User:', user.email);

    // Parse body
    const body = await req.json();
    const { address, polygonCoordinates, material } = body;
    
    console.log('📋 Input:', { address, material, hasPolygon: !!polygonCoordinates });

    if (!address || !material) {
      return Response.json({ error: 'Missing address or material' }, { status: 400 });
    }

    // Build polygon path
    let pathString = "";
    if (polygonCoordinates && Array.isArray(polygonCoordinates) && polygonCoordinates.length > 0) {
      pathString = polygonCoordinates.map(p => `${p.lat},${p.lng}`).join('|');
      pathString += `|${polygonCoordinates[0].lat},${polygonCoordinates[0].lng}`;
      console.log('✅ Polygon:', polygonCoordinates.length, 'points');
    } else {
      console.log('⚠️ No polygon - using default');
      pathString = "33.0,-96.8|33.0,-96.8";
    }

    // Generate Google Maps URLs
    const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(address)}&zoom=20&size=640x640&maptype=satellite&key=${GOOGLE_KEY}`;
    const maskUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(address)}&zoom=20&size=640x640&maptype=satellite&style=feature:all|visibility:off&path=color:0x00000000|weight:0|fillcolor:0xFFFFFFFF|${pathString}&key=${GOOGLE_KEY}`;
    
    console.log('📸 URLs generated');

    // Call Replicate with Prefer: wait
    const prompt = `A photorealistic residential house with a ${material} roof, 8k resolution, highly detailed textures, realistic lighting shadows`;
    
    console.log('🎨 Calling Replicate...');
    
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
          negative_prompt: 'cartoon, blurry, low quality',
          strength: 0.95
        }
      })
    });
    
    console.log('📡 Response:', replicateResponse.status);
    
    const prediction = await replicateResponse.json();
    
    if (!replicateResponse.ok) {
      console.error('❌ Replicate Error:', prediction);
      return Response.json({ error: 'Replicate failed', details: prediction }, { status: 500 });
    }
    
    console.log('🔮 Prediction:', prediction.status);
    
    // Check if completed immediately
    if (prediction.status === 'succeeded') {
      const resultUrl = prediction.output?.[0] || prediction.output;
      console.log('✅ Immediate success');
      return Response.json({ success: true, imageUrl: resultUrl });
    }
    
    // Poll for result
    console.log('⏳ Polling...');
    let attempts = 0;
    
    while (attempts < 60) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { 'Authorization': `Token ${REPLICATE_KEY}` }
      });
      
      const status = await statusResponse.json();
      
      if (status.status === 'succeeded') {
        const resultUrl = status.output?.[0] || status.output;
        console.log('✅ Success');
        return Response.json({ success: true, imageUrl: resultUrl });
      } else if (status.status === 'failed') {
        console.error('❌ Failed:', status.error);
        return Response.json({ error: 'Generation failed', details: status.error }, { status: 500 });
      }
      
      attempts++;
    }
    
    console.error('❌ Timeout');
    return Response.json({ error: 'Timeout after 2 minutes' }, { status: 408 });
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});