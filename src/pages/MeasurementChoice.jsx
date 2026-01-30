import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Zap, Ruler, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function MeasurementChoice() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const address = searchParams.get('address');

    const handleChoice = (type) => {
        if (type === 'quick') {
            // Future implementation: Redirect to /quick-estimate
            // For now, we can redirect to a placeholder or back to measurement with a flag
            // But prompt says "Option 1... Redirects to: /quick-estimate"
            // I'll assume /quick-estimate exists or I should create it?
            // "Create a new page /quick-estimate" was implied in the fix requirements description (Option 1).
            // But since I can't create everything at once and keep it simple, 
            // I'll create a simple placeholder for QuickEstimate or redirect to it if I create it.
            // Let's create a basic QuickEstimate page too.
            navigate(`/quick-estimate?address=${encodeURIComponent(address || '')}`);
        } else {
            navigate(`/measurementpage?address=${encodeURIComponent(address || '')}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-4xl w-full space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-extrabold text-slate-900">Choose Your Measurement Type</h1>
                    <p className="text-xl text-slate-600">Select how you want to measure your roof</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Option 1: Quick Estimate */}
                    <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-500 cursor-pointer group" onClick={() => handleChoice('quick')}>
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                                <Zap className="w-8 h-8 text-blue-600 group-hover:text-white" />
                            </div>
                            <CardTitle className="text-2xl">Quick Estimate</CardTitle>
                            <CardDescription className="text-blue-600 font-semibold">Powered by Google Solar API</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                            <p className="text-slate-600">
                                Get an instant AI-powered estimate based on your roof's footprint. Fast and easy.
                            </p>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                Select Quick Estimate <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Option 2: Detailed Measurement */}
                    <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-green-500 cursor-pointer group" onClick={() => handleChoice('detailed')}>
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors">
                                <Ruler className="w-8 h-8 text-green-600 group-hover:text-white" />
                            </div>
                            <CardTitle className="text-2xl">Detailed Measurement</CardTitle>
                            <CardDescription className="text-green-600 font-semibold">Manual Precision Measurement</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                            <p className="text-slate-600">
                                Manually draw your roof sections for maximum accuracy. Best for complex roofs.
                            </p>
                            <Button className="w-full bg-green-600 hover:bg-green-700">
                                Select Detailed Tool <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="text-center">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-900">
                        <ArrowLeft className="mr-2 w-4 h-4" /> Back
                    </Button>
                </div>
            </div>
        </div>
    );
}