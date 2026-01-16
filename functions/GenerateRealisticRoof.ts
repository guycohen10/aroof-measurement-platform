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

    // HARD CODED KEY
    const GOOGLE_KEY = "AIzaSyA1beAjeMHo2UgNlUBEgGlfzojuJ0GD0L0";

    // 1. Google Polyline Algorithm (Standard)
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

    // 2. Encode and Calculate Center
    const encodedPath = encodePolyline(polygonCoordinates);
    const safePath = encodeURIComponent(encodedPath); // <--- CRITICAL FIX

    let cLat = 0, cLng = 0;
    polygonCoordinates.forEach(p => { cLat += p.lat; cLng += p.lng; });
    const center = `${(cLat/polygonCoordinates.length).toFixed(5)},${(cLng/polygonCoordinates.length).toFixed(5)}`;

    // 3. Generate Mask URL
    const maskUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=20&size=640x640&maptype=satellite&style=feature:all|visibility:off&path=fillcolor:0xFFFFFFFF|weight:0|enc:${safePath}&key=${GOOGLE_KEY}`;

    // 4. RETURN THE MASK (No AI)
    return new Response(JSON.stringify({
      output: [maskUrl],
      status: "succeeded"
    }), { headers, status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers, status: 500 });
  }
});