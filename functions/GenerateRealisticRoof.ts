import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sourceImage, maskImage, material, color } = await req.json();
    
    // Convert base64 to blob URLs for Replicate
    const sourceBlob = await fetch(sourceImage).then(r => r.blob());
    const maskBlob = await fetch(maskImage).then(r => r.blob());
    
    // Upload to temporary storage
    const sourceFile = new File([sourceBlob], 'source.png', { type: 'image/png' });
    const maskFile = new File([maskBlob], 'mask.png', { type: 'image/png' });
    
    const sourceUpload = await base44.integrations.Core.UploadFile({ file: sourceFile });
    const maskUpload = await base44.integrations.Core.UploadFile({ file: maskFile });
    
    // Call Replicate API
    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
    
    const prompt = `A photorealistic residential house with a ${material} roof, ${color} color, 8k resolution, highly detailed textures, realistic lighting and shadows, professional architecture photography`;
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
          image: sourceUpload.file_url,
          mask: maskUpload.file_url,
          prompt: prompt,
          negative_prompt: negativePrompt,
          num_inference_steps: 50,
          guidance_scale: 7.5
        }
      })
    });
    
    const prediction = await replicateResponse.json();
    
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
        break;
      } else if (status.status === 'failed') {
        throw new Error('AI generation failed');
      }
      
      attempts++;
    }
    
    if (!resultUrl) {
      throw new Error('Generation timeout');
    }
    
    return Response.json({ 
      success: true,
      imageUrl: resultUrl
    });
    
  } catch (error) {
    console.error('Generation error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});