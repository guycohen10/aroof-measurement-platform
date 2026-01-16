import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error('❌ JSON Parse Error:', e);
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { address, polygonCoordinates, material } = body;
    
    console.log('🔵 Request:', { address, hasPolygon: !!polygonCoordinates, material });

    // Validate inputs
    if (!address || !material) {
      return Response.json({ error: 'Missing required: address or material' }, { status: 400 });
    }

    // Get API Keys from Environment
    const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY') || 'AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc';
    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY') || Deno.env.get('REPLICATE_API_TOKEN');
    
    if (!REPLICATE_API_KEY) {
      console.error('❌ REPLICATE_API_KEY missing');
      return Response.json({ error: 'Server configuration error: REPLICATE_API_KEY not set' }, { status: 500 });
    }
    
    console.log('✅ Keys loaded - Google:', !!GOOGLE_MAPS_API_KEY, 'Replicate:', !!REPLICATE_API_KEY);

    // Build polygon path string
    let pathString = "";
    if (polygonCoordinates && Array.isArray(polygonCoordinates) && polygonCoordinates.length > 0) {
      pathString = polygonCoordinates.map(p => `${p.lat},${p.lng}`).join('|');
      // Close the loop
      pathString += `|${polygonCoordinates[0].lat},${polygonCoordinates[0].lng}`;
      console.log('✅ Using polygon with', polygonCoordinates.length, 'points');
    } else {
      console.log('🟡 No polygon - will use fallback mask');
    }

    // Generate Google Static Maps URLs
    const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(address)}&zoom=20&size=640x640&maptype=satellite&key=${GOOGLE_MAPS_API_KEY}`;
    
    // Mask URL with white polygon on black background
    let maskUrl;
    if (pathString) {
      maskUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(address)}&zoom=20&size=640x640&maptype=satellite&style=feature:all|visibility:off&path=color:0x00000000|weight:0|fillcolor:0xFFFFFFFF|${pathString}&key=${GOOGLE_MAPS_API_KEY}`;
    } else {
      // Fallback: generic centered box
      maskUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(address)}&zoom=20&size=640x640&maptype=satellite&style=feature:all|visibility:off&path=color:0x00000000|weight:0|fillcolor:0xFFFFFFFF|33.0,-96.8|33.0,-96.8&key=${GOOGLE_MAPS_API_KEY}`;
    }
    
    console.log('📸 Map URL:', mapUrl.substring(0, 100) + '...');
    console.log('🎭 Mask URL:', maskUrl.substring(0, 100) + '...');

    // Call Replicate API
    const prompt = `A photorealistic residential house with a ${material} roof, 8k resolution, highly detailed textures, realistic lighting shadows`;
    const negativePrompt = 'cartoon, blurry, drawing, bad quality, low res, text, watermark';
    
    const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json'
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
    
    if (!replicateResponse.ok) {
      const errorData = await replicateResponse.json();
      console.error('❌ Replicate Error:', errorData);
      throw new Error('Replicate API error: ' + JSON.stringify(errorData));
    }
    
    const prediction = await replicateResponse.json();
    console.log('🔮 Prediction started:', prediction.id);
    
    // Poll for result
    let resultUrl = null;
    let attempts = 0;
    
    while (attempts < 60) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${REPLICATE_API_KEY}`
        }
      });
      
      const status = await statusResponse.json();
      
      if (status.status === 'succeeded') {
        resultUrl = status.output && status.output.length > 0 ? status.output[0] : status.output;
        console.log('✅ Generation complete');
        break;
      } else if (status.status === 'failed') {
        throw new Error('AI generation failed: ' + (status.error || 'Unknown error'));
      }
      
      attempts++;
      if (attempts % 10 === 0) {
        console.log(`⏳ Still generating... (${attempts * 2}s)`);
      }
    }
    
    if (!resultUrl) {
      throw new Error('Generation timeout after 2 minutes');
    }
    
    return Response.json({ 
      success: true,
      imageUrl: resultUrl
    });
    
  } catch (error) {
    console.error('❌ Backend Error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});