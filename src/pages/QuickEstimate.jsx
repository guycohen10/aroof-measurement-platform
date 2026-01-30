import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, ArrowLeft, Zap, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function QuickEstimate() {
    const [searchParams] = useSearchParams();
    const address = searchParams.get('address');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [solarData, setSolarData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Try to get coords from session (set by AddressMethodSelector)
                let lat = sessionStorage.getItem('homeowner_lat');
                let lng = sessionStorage.getItem('homeowner_lng');

                // If not in session, we would need to geocode (omitted for brevity, assuming flow from Selector)
                if (!lat || !lng) {
                    // Fallback: try to geocode or show error
                    // For now, assume flow works
                    console.warn("No coordinates found in session");
                }

                if (lat && lng) {
                    const { data } = await base44.functions.invoke('getSolarData', { lat, lng });
                    setSolarData(data);
                } else {
                     // Simulate or fail gracefully if no coords
                     // In a real app, we'd use Geocoding API here too
                     setError("Could not determine location coordinates.");
                }
            } catch (err) {
                console.error("Solar API Failed:", err);
                setError("Could not retrieve solar data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [address]);

    const getRoofArea = () => {
        if (!solarData || !solarData.solarPotential || !solarData.solarPotential.wholeRoofStats) return null;
        return Math.round(solarData.solarPotential.wholeRoofStats.areaMeters2 * 10.764); // Convert sq meters to sq ft
    };

    const roofArea = getRoofArea();

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <h2 className="text-xl font-semibold text-slate-700">Analyzing Roof Data...</h2>
                <p className="text-slate-500">Contacting Google Solar API</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center">
            <div className="max-w-2xl w-full space-y-8">
                <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Zap className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Quick Estimate Ready</h1>
                    <p className="text-lg text-slate-600 mt-2">
                        Estimate for: <span className="font-semibold text-slate-900">{address}</span>
                    </p>
                </div>

                <Card className="border-blue-200 bg-blue-50/50">
                    <CardContent className="p-8 text-center">
                        <p className="text-sm text-blue-600 font-bold uppercase mb-2">Estimated Roof Area</p>
                        {roofArea ? (
                            <>
                                <p className="text-5xl font-black text-slate-900 mb-2">{roofArea.toLocaleString()} <span className="text-2xl font-normal text-slate-500">sq ft</span></p>
                                <p className="text-xs text-slate-400">*Based on Google Solar API data</p>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-amber-600">
                                <AlertTriangle className="w-8 h-8 mb-2" />
                                <p className="text-lg font-bold">Data Not Available</p>
                                <p className="text-sm">Could not retrieve solar data for this location.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2">
                     <Button variant="outline" className="h-14 text-lg" onClick={() => navigate(-1)}>
                        <ArrowLeft className="mr-2 w-5 h-5" /> Back
                    </Button>
                    <Button 
                        className="h-14 text-lg bg-green-600 hover:bg-green-700 font-bold shadow-lg hover:shadow-xl transition-all" 
                        onClick={() => navigate(`/measurementpage?address=${encodeURIComponent(address)}`)}
                    >
                        <CheckCircle className="mr-2 w-5 h-5" />
                        Refine with Manual Tool
                    </Button>
                </div>
            </div>
        </div>
    );
}