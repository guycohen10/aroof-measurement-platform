import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function NewLeadForm() { 
    const navigate = useNavigate(); 
    const [searchParams] = useSearchParams();

    // Load from URL or Session 
    const [form, setForm] = useState({ 
        name: '', 
        email: '', 
        phone: '', 
        address: searchParams.get('address') || sessionStorage.getItem('client_address') || '' 
    });

    const handleSubmit = async () => { 
        if(!form.name || !form.phone) { 
            toast.error("Name and Phone are required"); 
            return; 
        } 
        toast.loading("Creating your profile...");

        try {
            // Create the Lead in the DB immediately
            const newLead = await base44.entities.Lead.create({
                customer_name: form.name,
                email_address: form.email,
                phone_number: form.phone,
                property_address: form.address,
                status: 'New',
                lead_source: 'Website'
            });
            
            // Save to Session for the tool to pick up
            sessionStorage.setItem('active_lead_id', newLead.id);
            sessionStorage.setItem('lead_address', form.address);
            
            toast.dismiss();
            // Redirect to Measurement Tool with the REAL ID
            navigate(`/roofermeasurement?leadId=${newLead.id}`);
        } catch(e) {
            console.error(e);
            toast.error("Error creating lead. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl border-t-4 border-green-600">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl">Address Found!</CardTitle>
                    <p className="text-slate-500">Please confirm your details to view the estimate.</p>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                            id="name"
                            placeholder="John Doe"
                            value={form.name} 
                            onChange={e => setForm({...form, name: e.target.value})}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                            id="phone"
                            placeholder="(555) 123-4567"
                            value={form.phone} 
                            onChange={e => setForm({...form, phone: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            value={form.email} 
                            onChange={e => setForm({...form, email: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Property Address</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                            <Input 
                                value={form.address} 
                                disabled 
                                className="bg-slate-100 pl-9 text-slate-600"
                            />
                        </div>
                    </div>

                    <Button className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 mt-4 shadow-md transition-all hover:scale-[1.02]" onClick={handleSubmit}>
                        See My Roof Estimate
                    </Button>
                    
                    <Button variant="ghost" size="sm" className="w-full text-slate-400 hover:text-slate-600" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                </CardContent>
            </Card>
        </div>
    ); 
}