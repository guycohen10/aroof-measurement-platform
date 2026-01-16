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

    // 1. Prepare Safe Coordinates (5 decimals is ~1 meter precision, plenty for AI)
    const pathParts = polygonCoordinates.map(p => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`);

    // 2. Calculate Center
    let cLat = 0, cLng = 0;
    polygonCoordinates.forEach(p => {
      cLat += p.lat;
      cLng += p.lng;
    });
    const center = `${(cLat/polygonCoordinates.length).toFixed(5)},${(cLng/polygonCoordinates.length).toFixed(5)}`;

    // 3. Construct URL manually (Prevent Encoding Errors)
    const key = GOOGLE_KEY;
    // Note: We use %7C instead of | to be safe
    const style = "color:0x00000000%7Cweight:0%7Cfillcolor:0xFFFFFFFF";
    const pathStr = pathParts.join("%7C");

    const maskUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=20&size=640x640&maptype=satellite&style=feature:all%7Cvisibility:off&path=${style}%7C${pathStr}&key=${key}`;
    const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=20&size=640x640&maptype=satellite&key=${key}`;

    // 4. Log for Debugging (This will show in your Base44 logs)
    console.log("GENERATED MASK:", maskUrl);

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
          prompt: `${selectedMaterial} roof, daylight, 4k, smooth texture`,
          negative_prompt: "noise, grain, high contrast, oversaturated, cartoon",
          strength: 0.55,
          guidance_scale: 7.5,
          num_inference_steps: 50,
          scheduler: "K_EULER_ANCESTRAL",
          seed: 42
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