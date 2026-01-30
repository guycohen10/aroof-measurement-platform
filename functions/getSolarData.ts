import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        // Note: For public access we might skip auth check if it's a lead tool
        // But better to check if user exists or is anonymous
        
        const payload = await req.json();
        const { lat, lng } = payload;

        if (!lat || !lng) {
            return Response.json({ error: "Latitude and Longitude required" }, { status: 400 });
        }

        const apiKey = Deno.env.get("VITE_GOOGLE_MAPS_API_KEY");
        if (!apiKey) {
            return Response.json({ error: "API Key not configured" }, { status: 500 });
        }

        const url = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lng}&requiredQuality=HIGH&key=${apiKey}`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.error("Solar API Error:", data);
            return Response.json({ error: data.error?.message || "Failed to fetch solar data" }, { status: response.status });
        }

        return Response.json(data);
    } catch (error) {
        console.error("Function error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});