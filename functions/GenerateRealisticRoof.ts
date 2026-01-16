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
    
    // Calculate center from polygon coordinates
    let centerLat = 0, centerLng = 0;
    polygonCoordinates.forEach(coord => {
      centerLat += coord.lat;
      centerLng += coord.lng;
    });
    centerLat /= polygonCoordinates.length;
    centerLng /= polygonCoordinates.length;
    
    // Step A: Generate Source Image URL (Satellite View)
    const sourceImageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${centerLat},${centerLng}&zoom=20&size=800x600&scale=2&maptype=satellite&key=${GOOGLE_MAPS_API_KEY}`;
    
    // Step B: Generate Mask Image URL (White Polygon on Black)
    const pathCoords = polygonCoordinates.map(c => `${c.lat},${c.lng}`).join('|');
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