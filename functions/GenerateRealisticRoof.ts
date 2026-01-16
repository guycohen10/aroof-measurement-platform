Deno.serve(async (req) => {
  // 1. CORS Headers (Required for the frontend to talk to the backend)
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  // Handle Browser Pre-check
  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  try {
    // 2. Parse Input
    const { address, polygonCoordinates, selectedMaterial } = await req.json();

    // 3. HARD CODED KEYS
    const GOOGLE_KEY = "AIzaSyA1beAjeMHo2UgNlUBEgGlfzojuJ0GD0L0";
    const REPLICATE_KEY = "r8_emR8qiw7RptiJEXpi9KKQMoh66EkAhI3ET1ZW";

    // 4. Generate Google URLs
    let pathString = "";
    if (polygonCoordinates && polygonCoordinates.length > 0) {
      pathString = polygonCoordinates.map(p => `${p.lat},${p.lng}`).join('|');
      pathString += `|${polygonCoordinates[0].lat},${polygonCoordinates[0].lng}`;
    }

    // Mask (White shape, Black background)
    const maskUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(address)}&zoom=20&size=640x640&maptype=satellite&style=feature:all|visibility:off&path=color:0x00000000|weight:0|fillcolor:0xFFFFFFFF|${pathString}&key=${GOOGLE_KEY}`;
    
    // Satellite Photo
    const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(address)}&zoom=20&size=640x640&maptype=satellite&key=${GOOGLE_KEY}`;

    // 5. Call Replicate (Standard Fetch)
    const replicateResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${REPLICATE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "wait=30" // Wait up to 30s for the result
      },
      body: JSON.stringify({
        version: "c221b2b8ef527988fb59bf24a8b97c4561f1c671f73bd389f866bfb27c061316",
        input: {
          image: mapUrl,
          mask: maskUrl,
          prompt: `A photorealistic residential house with a ${selectedMaterial} roof, 8k resolution, highly detailed textures, realistic lighting`,
          negative_prompt: "cartoon, blurry, low quality",
          strength: 0.95
        }
      })
    });

    const result = await replicateResponse.json();

    // 6. Return Success
    return new Response(JSON.stringify(result), { headers, status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers, status: 500 });
  }
});