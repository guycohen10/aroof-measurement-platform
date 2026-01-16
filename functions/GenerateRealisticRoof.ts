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

    // 1. Coordinate Compression (Fix URL character limit)
    let simplifiedCoords = polygonCoordinates;
    let centerLat = 0;
    let centerLng = 0;
    let pathString = "";
    
    if (polygonCoordinates && polygonCoordinates.length > 0) {
      // Step A: Downsample if too many points
      if (polygonCoordinates.length > 30) {
        const step = Math.ceil(polygonCoordinates.length / 30);
        simplifiedCoords = polygonCoordinates.filter((_, i) => i % step === 0);
      }

      // Step B: Round to 5 decimals and Calculate Center
      pathString = simplifiedCoords.map(p => {
        centerLat += p.lat;
        centerLng += p.lng;
        return `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`; // Rounding saves space
      }).join('|');

      // Close the loop
      const first = simplifiedCoords[0];
      pathString += `|${first.lat.toFixed(5)},${first.lng.toFixed(5)}`;

      // Finalize Center
      centerLat = centerLat / simplifiedCoords.length;
      centerLng = centerLng / simplifiedCoords.length;
    }

    const centerParam = `${centerLat.toFixed(5)},${centerLng.toFixed(5)}`;

    // 2. Generate URLs (Zoom 19 for better context)
    const maskUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${centerParam}&zoom=19&size=640x640&maptype=satellite&style=feature:all|visibility:off&path=color:0x00000000|weight:0|fillcolor:0xFFFFFFFF|${pathString}&key=${GOOGLE_KEY}`;
    const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${centerParam}&zoom=19&size=640x640&maptype=satellite&key=${GOOGLE_KEY}`;

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
          prompt: `Satellite view of a residential home, replacing the roof with ${selectedMaterial}, photorealistic, 4k, maintaining building edges`,
          negative_prompt: "cartoon, blurry, low quality",
          strength: 0.75
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