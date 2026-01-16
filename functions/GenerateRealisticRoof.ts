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
    let { address, polygonCoordinates, selectedMaterial, selectedColor } = await req.json();

    // Safety Default
    if (!selectedColor || selectedColor === "undefined") {
      selectedColor = "Weathered Wood";
    }

    // --- KEYS ---
    const GOOGLE_KEY = "AIzaSyA1beAjeMHo2UgNlUBEgGlfzojuJ0GD0L0";
    const REPLICATE_KEY = "r8_emR8qiw7RptiJEXpi9KKQMoh66EkAhI3ET1ZW";

    // --- BOUNDING BOX CENTERING (Kept from last success) ---
    const lats = polygonCoordinates.map(p => p.lat);
    const lngs = polygonCoordinates.map(p => p.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const centerLat = ((minLat + maxLat) / 2).toFixed(6);
    const centerLng = ((minLng + maxLng) / 2).toFixed(6);
    const center = `${centerLat},${centerLng}`;

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

    // --- Prepare URLs ---
    const encodedPath = encodePolyline(polygonCoordinates);
    const safePath = encodeURIComponent(encodedPath);
    const maskUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=20&size=640x640&maptype=satellite&style=feature:all|visibility:off&path=fillcolor:0xFFFFFFFF|weight:0|enc:${safePath}&key=${GOOGLE_KEY}`;
    const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=20&size=640x640&maptype=satellite&key=${GOOGLE_KEY}`;

    // --- Call Replicate ---
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
          // STRICT TEXTURE PROMPT
          prompt: `Close up detailed texture of a ${selectedMaterial} roof, ${selectedColor} color, construction material, aerial view, 8k, highly detailed`,
          // NO POOLS ALLOWED
          negative_prompt: "pool, water, swimming pool, lake, blue water, yard, grass, trees, windows, walls, cartoon, drawing, painting, glitch, distorted, low quality, blurred",
          strength: 0.70, // Reduced to keep structure
          guidance_scale: 9.0,
          num_inference_steps: 40,
          seed: 3242
        }
      })
    });

    const result = await prediction.json();
    return new Response(JSON.stringify(result), { headers, status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers, status: 500 });
  }
});