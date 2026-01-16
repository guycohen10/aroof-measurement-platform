import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// HARD-CODED KEYS - DO NOT USE process.env
const GOOGLE_KEY = "AIzaSyA1beAjeMHo2UgNlUBEgGlfzojuJ0GD0L0";
const REPLICATE_KEY = "r8_emR8qiw7RptiJEXpi9KKQMoh66EkAhI3ET1ZW";

Deno.serve(async (req) => {
  try {
    // Auth check
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse input
    const { address, polygonCoordinates, material } = await req.json();

    // Build polygon path for mask
    let pathString = "";
    if (polygonCoordinates?.length > 0) {
      pathString = polygonCoordinates.map(p => `${p.lat},${p.lng}`).join('|');
      pathString += `|${polygonCoordinates[0].lat},${polygonCoordinates[0].lng}`;
    }

    // Generate Google Maps URLs
    const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(address)}&zoom=20&size=640x640&maptype=satellite&key=${GOOGLE_KEY}`;
    const maskUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(address)}&zoom=20&size=640x640&maptype=satellite&style=feature:all|visibility:off&path=color:0x00000000|weight:0|fillcolor:0xFFFFFFFF|${pathString}&key=${GOOGLE_KEY}`;

    // Call Replicate (NO WAIT - returns immediately)
    const replicateRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: 'c221b2b8ef527988fb59bf24a8b97c4561f1c671f73bd389f866bfb27c061316',
        input: {
          image: mapUrl,
          mask: maskUrl,
          prompt: `A photorealistic residential house with a ${material} roof, 8k resolution, highly detailed textures, realistic lighting`,
          negative_prompt: 'cartoon, blurry, low quality',
          strength: 0.95
        }
      })
    });

    const prediction = await replicateRes.json();

    // Return prediction object immediately
    return Response.json(prediction);

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});