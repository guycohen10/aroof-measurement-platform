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
    const { address, polygonCoordinates, selectedMaterial, selectedColor } = await req.json();

    // --- KEYS (User Provided) ---
    const GOOGLE_KEY = "AIzaSyA1beAjeMHo2UgNlUBEgGlfzojuJ0GD0L0";
    const REPLICATE_KEY = "r8_emR8qiw7RptiJEXpi9KKQMoh66EkAhI3ET1ZW";

    // --- HELPER: Polyline Encoding ---
    const encodePolyline = (points) => {
      let str = '';
      let lastLat = 0, lastLng = 0;
      for (const point of points) {
        let lat = Math.round(point.lat * 1e5);
        let lng = Math.round(point.lng * 1e5);
        let dLat = lat - lastLat;
        let dLng = lng - lastLng;
        lastLat = lat; lastLng = lng;
        [dLat, dLng].forEach(val => {
          let num = val < 0 ? ~(val << 1) : (val << 1);
          while (num >= 0x20) {
            str += String.fromCharCode((0x20 | (num & 0x1f)) + 63);
            num >>= 5;
          }
          str += String.fromCharCode(num + 63);
        });
      }
      return str;
    };

    // --- 2. Prepare URLs ---
    let cLat = 0, cLng = 0;
    polygonCoordinates.forEach(p => { cLat += p.lat; cLng += p.lng; });
    const center = `${(cLat/polygonCoordinates.length).toFixed(6)},${(cLng/polygonCoordinates.length).toFixed(6)}`;

    const encodedPath = encodePolyline(polygonCoordinates);
    const safePath = encodeURIComponent(encodedPath);

    const maskUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=20&size=640x640&maptype=satellite&style=feature:all|visibility:off&path=fillcolor:0xFFFFFFFF|weight:0|enc:${safePath}&key=${GOOGLE_KEY}`;
    const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=20&size=640x640&maptype=satellite&key=${GOOGLE_KEY}`;

    // --- 3. Call Replicate ---
    const prediction = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${REPLICATE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "wait=30"
      },
      body: JSON.stringify({
        version: "c221b2b8ef527988fb59bf24a8b97c4561f1c671f73bd389f866bfb27c061316",
        input: {
          image: mapUrl,
          mask: maskUrl,
          // STABLE PROMPT: No complex weights, no 'Close up', just Aerial context
          prompt: `Aerial drone photography of a residential home, replacing the roof with ${selectedColor || "clean"} ${selectedMaterial}, realistic 4k, highly detailed, daylight`,
          negative_prompt: "cartoon, drawing, painting, glitch, distorted, low quality, blurred, noise",
          strength: 0.65, // Safe limit for structure
          guidance_scale: 7.5, // Standard realism
          num_inference_steps: 40
        }
      })
    });

    const result = await prediction.json();
    return new Response(JSON.stringify(result), { headers, status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers, status: 500 });
  }
});