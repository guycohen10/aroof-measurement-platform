Deno.serve(async (req) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (req.method === "OPTIONS") return new Response(null, { headers });

  try {
    const { address, polygonCoordinates, selectedMaterial } = await req.json();

    // HARD CODED KEYS
    const GOOGLE_KEY = "AIzaSyA1beAjeMHo2UgNlUBEgGlfzojuJ0GD0L0";
    const REPLICATE_KEY = "r8_emR8qiw7RptiJEXpi9KKQMoh66EkAhI3ET1ZW";

    // 1. Calculate Centroid (Center of drawn polygon)
    let centerLat = 0;
    let centerLng = 0;
    let pathString = "";
    
    if (polygonCoordinates && polygonCoordinates.length > 0) {
      polygonCoordinates.forEach(p => {
        centerLat += p.lat;
        centerLng += p.lng;
      });
      centerLat = centerLat / polygonCoordinates.length;
      centerLng = centerLng / polygonCoordinates.length;
      
      pathString = polygonCoordinates.map(p => `${p.lat},${p.lng}`).join('|');
      pathString += `|${polygonCoordinates[0].lat},${polygonCoordinates[0].lng}`;
    }

    const centerParam = `${centerLat},${centerLng}`;

    // 2. Generate URLs using centroid (not address)
    const maskUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${centerParam}&zoom=20&size=640x640&maptype=satellite&style=feature:all|visibility:off&path=color:0x00000000|weight:0|fillcolor:0xFFFFFFFF|${pathString}&key=${GOOGLE_KEY}`;
    const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${centerParam}&zoom=20&size=640x640&maptype=satellite&key=${GOOGLE_KEY}`;

    // 2. Call Replicate (Wait for result)
    const replicateResp = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${REPLICATE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "wait=30" // Wait for generation
      },
      body: JSON.stringify({
        version: "c221b2b8ef527988fb59bf24a8b97c4561f1c671f73bd389f866bfb27c061316",
        input: {
          image: mapUrl,
          mask: maskUrl,
          prompt: `A photo of a house with ${selectedMaterial} roof, maintaining exact building geometry and shadows`,
          negative_prompt: "cartoon, blurry, low quality",
          strength: 0.65
        }
      })
    });

    const data = await replicateResp.json();

    // 3. Return the Data
    return new Response(JSON.stringify(data), { headers, status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers, status: 500 });
  }
});