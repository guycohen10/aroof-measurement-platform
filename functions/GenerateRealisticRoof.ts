import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { address, polygonCoordinates, material } = await req.json();
    
    console.log('🔵 REQUEST:', { address, hasPolygon: !!polygonCoordinates, material });
    
    // 1. Get API Keys from Environment
    const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY') || 'AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc';
    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
    
    if (!REPLICATE_API_KEY) {
      throw new Error('REPLICATE_API_KEY not configured in environment');
    }
    
    let centerLat, centerLng, finalPolygonCoords;
    
    // 2. Auto-Box Safety Net for Quick Estimates
    if (!polygonCoordinates || polygonCoordinates.length === 0) {
      console.log('🟡 No polygon - generating 40x40 ft default square');
      
      // Geocode address to get center
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
      const geocodeResponse = await fetch(geocodeUrl);
      const geocodeData = await geocodeResponse.json();
      
      if (!geocodeData.results || geocodeData.results.length === 0) {
        throw new Error('Could not geocode address: ' + geocodeData.status);
      }
      
      centerLat = geocodeData.results[0].geometry.location.lat;
      centerLng = geocodeData.results[0].geometry.location.lng;
      
      // Create 40x40 ft square (approx 0.00011 degrees per foot)
      const offset = 0.0044;
      finalPolygonCoords = [
        { lat: centerLat + offset, lng: centerLng - offset },
        { lat: centerLat + offset, lng: centerLng + offset },
        { lat: centerLat - offset, lng: centerLng + offset },
        { lat: centerLat - offset, lng: centerLng - offset }
      ];
      
      console.log('✅ Default square at:', centerLat, centerLng);
    } else {
      // Use provided polygon
      finalPolygonCoords = polygonCoordinates;
      
      centerLat = 0;
      centerLng = 0;
      finalPolygonCoords.forEach(coord => {
        centerLat += coord.lat;
        centerLng += coord.lng;
      });
      centerLat /= finalPolygonCoords.length;
      centerLng /= finalPolygonCoords.length;
      
      console.log('✅ Using polygon with', finalPolygonCoords.length, 'points');
    }
    
    // 3. Format Polygon Path (lat,lng|lat,lng|...) and close the loop
    const pathCoords = finalPolygonCoords.map(c => `${c.lat},${c.lng}`).join('|');
    const closedPath = pathCoords + `|${finalPolygonCoords[0].lat},${finalPolygonCoords[0].lng}`;
    
    // 4. Generate Google Static Maps URLs
    const sourceImageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${centerLat},${centerLng}&zoom=20&size=640x640&scale=2&maptype=satellite&key=${GOOGLE_MAPS_API_KEY}`;
    
    const maskImageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${centerLat},${centerLng}&zoom=20&size=640x640&scale=2&maptype=satellite&style=feature:all|element:all|visibility:off&path=color:0x00000000|weight:0|fillcolor:0xFFFFFFFF|${closedPath}&key=${GOOGLE_MAPS_API_KEY}`;
    
    console.log('📸 Source URL:', sourceImageUrl);
    console.log('🎭 Mask URL:', maskImageUrl);
    
    // 5. Call Replicate API
    const prompt = `A photorealistic residential house with a ${material} roof, 8k resolution, highly detailed textures, realistic lighting shadows, professional architecture photography`;
    const negativePrompt = 'cartoon, blurry, drawing, bad quality, low resolution, distorted, unrealistic, text, watermark';
    
    const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: 'c221b2b8ef527988fb59bf24a8b97c4561f1c671f73bd389f866bfb27c061316',
        input: {
          image: sourceImageUrl,
          mask: maskImageUrl,
          prompt: prompt,
          negative_prompt: negativePrompt,
          strength: 0.9,
          num_inference_steps: 50,
          guidance_scale: 7.5
        }
      })
    });
    
    if (!replicateResponse.ok) {
      const errorData = await replicateResponse.json();
      throw new Error('Replicate API error: ' + JSON.stringify(errorData));
    }
    
    const prediction = await replicateResponse.json();
    console.log('🔮 Replicate prediction started:', prediction.id);
    
    // 6. Poll for Result (max 2 minutes)
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
      console.log(`📊 Status (${attempts + 1}/60):`, status.status);
      
      if (status.status === 'succeeded') {
        resultUrl = status.output && status.output.length > 0 ? status.output[0] : status.output;
        console.log('✅ Generation complete:', resultUrl);
        break;
      } else if (status.status === 'failed') {
        throw new Error('AI generation failed: ' + (status.error || 'Unknown error'));
      }
      
      attempts++;
    }
    
    if (!resultUrl) {
      throw new Error('Generation timeout after 2 minutes');
    }
    
    return Response.json({ 
      success: true,
      imageUrl: resultUrl
    });
    
  } catch (error) {
    console.error('❌ BACKEND ERROR:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
});