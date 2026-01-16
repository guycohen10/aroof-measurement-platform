Deno.serve(async (req) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (req.method === "OPTIONS") return new Response(null, { headers });

  try {
    // 1. Inputs
    let { address, polygonCoordinates, selectedColor } = await req.json();

    // --- KEYS (User Provided) ---
    const GOOGLE_KEY = "AIzaSyA1beAjeMHo2UgNlUBEgGlfzojuJ0GD0L0";

    // 2. Calculate Center (Simple Average)
    let totalLat = 0, totalLng = 0;
    polygonCoordinates.forEach(p => { totalLat += p.lat; totalLng += p.lng; });
    const centerLat = (totalLat / polygonCoordinates.length).toFixed(6);
    const centerLng = (totalLng / polygonCoordinates.length).toFixed(6);
    const center = `${centerLat},${centerLng}`;

    // 3. Create Safe Path String (5 decimals to fit URL limit)
    // We use manual string building to avoid encoding bugs
    const pathPoints = polygonCoordinates.map(p => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`).join("|");

    // 4. Generate URLs
    // MAP: The satellite photo
    const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=20&size=640x640&maptype=satellite&key=${GOOGLE_KEY}`;

    // MASK: The white shape (Must match Map center exactly)
    const maskUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=20&size=640x640&maptype=satellite&style=feature:all|visibility:off&path=color:0x00000000|weight:0|fillcolor:0xFFFFFFFF|${pathPoints}&key=${GOOGLE_KEY}`;

    console.log("DEBUG MAP:", mapUrl);
    console.log("DEBUG MASK:", maskUrl);

    // 5. Return URLs for Inspection
    // We return the MASK as the image so you can see if the shape is correct on screen
    return new Response(JSON.stringify({
      output: [maskUrl], 
      logs: { map: mapUrl, mask: maskUrl },
      status: "succeeded"
    }), { headers, status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers, status: 500 });
  }
});