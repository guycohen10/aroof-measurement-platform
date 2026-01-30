import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function QuickEstimate() {
    const [searchParams] = useSearchParams();
    const address = searchParams.get('address');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading Solar API data
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

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
        <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center">
            <div className="max-w-2xl w-full bg-white rounded-xl shadow-xl p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-3xl">⚡</span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900">Quick Estimate Ready</h1>
                <p className="text-lg text-slate-600">
                    Estimate for: <span className="font-semibold text-slate-900">{address}</span>
                </p>
                
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-600 font-bold uppercase mb-1">Estimated Roof Area</p>
                    <p className="text-4xl font-black text-slate-900">2,450 <span className="text-xl font-normal text-slate-500">sq ft</span></p>
                    <p className="text-xs text-slate-400 mt-2">*Based on satellite footprint approximation</p>
                </div>

                <div className="flex gap-4">
                     <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>
                        <ArrowLeft className="mr-2 w-4 h-4" /> Back
                    </Button>
                    <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => navigate(`/measurementpage?address=${encodeURIComponent(address)}`)}>
                        Refine with Manual Tool
                    </Button>
                </div>
            </div>
        </div>
    );
}