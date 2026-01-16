import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { address, polygonCoordinates, material } = await req.json();
    
    const GOOGLE_MAPS_API_KEY = 'AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc';
    
    let centerLat, centerLng, finalPolygonCoords;
    
    // Step A: Auto-Box Safety Net for Quick Estimates
    if (!polygonCoordinates || polygonCoordinates.length === 0) {
      console.log('🟡 No polygon provided - generating 40x40 ft default square');
      
      // Geocode address to get center
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
      const geocodeResponse = await fetch(geocodeUrl);
      const geocodeData = await geocodeResponse.json();
      
      if (!geocodeData.results || geocodeData.results.length === 0) {
        throw new Error('Could not geocode address');
      }
      
      centerLat = geocodeData.results[0].geometry.location.lat;
      centerLng = geocodeData.results[0].geometry.location.lng;
      
      // Create 40x40 ft square (approx 0.00011 degrees per foot at mid-latitudes)
      const offset = 0.0044; // 40 feet in degrees
      finalPolygonCoords = [
        { lat: centerLat + offset, lng: centerLng - offset },
        { lat: centerLat + offset, lng: centerLng + offset },
        { lat: centerLat - offset, lng: centerLng + offset },
        { lat: centerLat - offset, lng: centerLng - offset }
      ];
      
      console.log('✅ Generated default square at:', centerLat, centerLng);
    } else {
      // Use provided polygon coordinates
      finalPolygonCoords = polygonCoordinates;
      
      // Calculate center from polygon
      centerLat = 0;
      centerLng = 0;
      finalPolygonCoords.forEach(coord => {
        centerLat += coord.lat;
        centerLng += coord.lng;
      });
      centerLat /= finalPolygonCoords.length;
      centerLng /= finalPolygonCoords.length;
      
      console.log('✅ Using provided polygon with', finalPolygonCoords.length, 'points');
    }
    
    // Step B: Generate Source Image URL (Satellite View)
    const sourceImageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${centerLat},${centerLng}&zoom=20&size=800x600&scale=2&maptype=satellite&key=${GOOGLE_MAPS_API_KEY}`;
    
    // Step C: Generate Mask Image URL (White Polygon on Black Background)
    const pathCoords = finalPolygonCoords.map(c => `${c.lat},${c.lng}`).join('|');
    const maskImageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${centerLat},${centerLng}&zoom=20&size=800x600&scale=2&style=feature:all|element:all|visibility:off&style=feature:all|element:geometry.fill|color:0x000000&path=fillcolor:0xFFFFFF|color:0x000000|${pathCoords}&key=${GOOGLE_MAPS_API_KEY}`;
    
    console.log('📸 Source URL:', sourceImageUrl);
    console.log('🎭 Mask URL:', maskImageUrl);
    
    // Call Replicate API with Google URLs directly
    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
    
    const prompt = `A photorealistic residential house with a ${material} roof, 8k resolution, highly detailed textures, realistic lighting and shadows, professional architecture photography`;
    const negativePrompt = 'cartoon, blurry, drawing, bad quality, low resolution, distorted, unrealistic';
    
    const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: '7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
        input: {
          image: sourceImageUrl,
          mask: maskImageUrl,
          prompt: prompt,
          negative_prompt: negativePrompt,
          num_inference_steps: 50,
          guidance_scale: 7.5
        }
      })
    });
    
    const prediction = await replicateResponse.json();
    console.log('🔮 Replicate prediction started:', prediction.id);
    
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
        resultUrl = status.output[0];
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
    console.error('❌ Generation error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});