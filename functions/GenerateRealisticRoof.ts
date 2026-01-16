// Standard Google Polyline Encoding Algorithm
function encodePolyline(points) {
  let str = '';
  let lastLat = 0;
  let lastLng = 0;

  for (const point of points) {
    let lat = Math.round(point.lat * 1e5);
    let lng = Math.round(point.lng * 1e5);
    let dLat = lat - lastLat;
    let dLng = lng - lastLng;
    lastLat = lat;
    lastLng = lng;

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
}

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

    // 1. Calculate Center (using raw coordinates for perfect alignment)
    let centerLat = 0;
    let centerLng = 0;
    
    if (polygonCoordinates && polygonCoordinates.length > 0) {
      polygonCoordinates.forEach(p => {
        centerLat += p.lat;
        centerLng += p.lng;
      });
      centerLat = centerLat / polygonCoordinates.length;
      centerLng = centerLng / polygonCoordinates.length;
    }

    const centerParam = `${centerLat},${centerLng}`;

    // 2. Encode polygon using Google Polyline Encoding (keeps precision, reduces URL size)
    const encodedPath = encodePolyline(polygonCoordinates);

    // 3. Generate URLs with encoded path
    const maskUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${centerParam}&zoom=20&size=640x640&maptype=satellite&style=feature:all|visibility:off&path=weight:0|fillcolor:0xFFFFFFFF|enc:${encodedPath}&key=${GOOGLE_KEY}`;
    const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${centerParam}&zoom=20&size=640x640&maptype=satellite&key=${GOOGLE_KEY}`;

    // 4. Call Replicate (Wait for result)
    const replicateResp = await fetch("https://api.replicate.com/v1/predictions", {
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
          prompt: `${selectedMaterial} roof texture, aerial photography, daylight, realistic`,
          negative_prompt: "blur, distortion, new buildings, changing house shape, cartoon, low quality",
          strength: 0.60,
          guidance_scale: 9,
          num_inference_steps: 40,
          scheduler: "K_EULER_ANCESTRAL"
        }
      })
    });

    const data = await replicateResp.json();

    // 5. Return the Data
    return new Response(JSON.stringify(data), { headers, status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers, status: 500 });
  }
});