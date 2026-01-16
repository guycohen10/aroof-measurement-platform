Deno.serve(async (req) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (req.method === "OPTIONS") return new Response(null, { headers });

  try {
    const { address, polygonCoordinates } = await req.json();

    // HARD CODED KEYS
    const GOOGLE_KEY = "AIzaSyA1beAjeMHo2UgNlUBEgGlfzojuJ0GD0L0";

    // 1. Polyline Algorithm (Standard Google Encoding)
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

    // 2. Generate Safe Mask URL
    const encodedPath = encodePolyline(polygonCoordinates);
    // We MUST encode the special characters in the polyline string for the URL
    const safePath = encodeURIComponent(encodedPath);

    // Calculate Center
    let cLat = 0, cLng = 0;
    polygonCoordinates.forEach(p => { cLat += p.lat; cLng += p.lng; });
    const center = `${(cLat/polygonCoordinates.length).toFixed(5)},${(cLng/polygonCoordinates.length).toFixed(5)}`;

    const maskUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=20&size=640x640&maptype=satellite&style=feature:all|visibility:off&path=fillcolor:0xFFFFFFFF|weight:0|enc:${safePath}&key=${GOOGLE_KEY}`;

    console.log("DEBUG MASK URL:", maskUrl);

    // 3. RETURN MASK ONLY (Diagnostic Mode)
    // This pretends to be Replicate so the frontend displays the image immediately
    return new Response(JSON.stringify({
      output: [maskUrl],
      status: "succeeded"
    }), { headers, status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers, status: 500 });
  }
});