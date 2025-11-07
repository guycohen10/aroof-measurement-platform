import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function MeasurementPage() {
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [areaSqft, setAreaSqft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [savedMeasurement, setSavedMeasurement] = useState(null);

  useEffect(() => {
    // Get address from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const addressParam = urlParams.get('address');
    
    if (!addressParam) {
      navigate(createPageUrl("FormPage"));
      return;
    }
    
    setAddress(decodeURIComponent(addressParam));
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    // Validate input
    const area = parseFloat(areaSqft);
    if (isNaN(area) || area <= 0) {
      setError("Please enter a valid roof area greater than 0");
      setLoading(false);
      return;
    }

    if (area > 50000) {
      setError("Roof area seems too large. Please check your input.");
      setLoading(false);
      return;
    }

    try {
      // Save measurement to database
      const measurement = await base44.entities.RoofMeasurement.create({
        address: address,
        area_sqft: area
      });

      setSavedMeasurement(measurement);
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      console.error("Error saving measurement:", err);
      setError("Failed to save measurement. Please try again.");
      setLoading(false);
    }
  };

  const handleStartNew = () => {
    navigate(createPageUrl("Homepage"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Homepage")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900">Aroof</span>
            </Link>
            <Link to={createPageUrl("FormPage")}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        {success && savedMeasurement && (
          <Card className="mb-8 bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-green-900 mb-2">
                    Measurement Saved!
                  </h3>
                  <p className="text-green-800 text-lg mb-1">
                    Area: <strong>{savedMeasurement.area_sqft.toLocaleString()} sq ft</strong>
                  </p>
                  <p className="text-green-700 text-sm">
                    Address: {savedMeasurement.address}
                  </p>
                  <Button
                    onClick={handleStartNew}
                    className="mt-4 bg-green-600 hover:bg-green-700"
                  >
                    Start New Measurement
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Measurement Form */}
        {!success && (
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl text-center">Roof Measurement Tool</CardTitle>
              <p className="text-center text-slate-600 mt-2">
                Enter the roof area for this property
              </p>
            </CardHeader>
            <CardContent className="p-6">
              {/* Display Address */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-600 font-medium mb-1">Property Address:</p>
                <p className="text-lg font-bold text-blue-900">{address}</p>
              </div>

              {/* Coming Soon Note */}
              <Alert className="mb-6 bg-yellow-50 border-yellow-200">
                <AlertDescription className="text-yellow-800">
                  <strong>Note:</strong> Map integration coming next. For now, please enter the roof area manually.
                </AlertDescription>
              </Alert>

              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="area" className="text-base font-medium">
                    Enter roof area in sq ft <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="area"
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    placeholder="e.g. 2500"
                    value={areaSqft}
                    onChange={(e) => setAreaSqft(e.target.value)}
                    className="mt-2 h-12 text-lg"
                    disabled={loading}
                  />
                  <p className="text-sm text-slate-500 mt-2">
                    Enter the total roof area in square feet
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Measurement"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Help Text */}
        <Card className="mt-6 bg-slate-50">
          <CardContent className="p-6">
            <h4 className="font-bold text-slate-900 mb-3">What's Next?</h4>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">1.</span>
                <span>Enter your roof area measurement</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">2.</span>
                <span>Click "Save Measurement" to store the data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">3.</span>
                <span>Google Maps integration will be added next for automatic measurements</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}