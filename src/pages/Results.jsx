import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import HomeownerResults from "../components/results/HomeownerResults";
import RooferResults from "../components/results/RooferResults";

export default function Results() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [measurement, setMeasurement] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const measurementId = urlParams.get('measurementId');

      if (!measurementId) {
        navigate(createPageUrl("Homepage"));
        return;
      }

      try {
        const measurements = await base44.entities.Measurement.filter({ id: measurementId });
        if (measurements.length > 0) {
          setMeasurement(measurements[0]);
          
          // Load user data
          const users = await base44.entities.User.filter({ id: measurements[0].user_id });
          if (users.length > 0) {
            setUser(users[0]);
          }
        } else {
          navigate(createPageUrl("Homepage"));
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load measurement data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const isHomeowner = measurement?.user_type === "homeowner";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Homepage")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Aroof</h1>
                <p className="text-xs text-slate-500">Your Roof Measurement Results</p>
              </div>
            </Link>
            <Link to={createPageUrl(`MeasurementTool?measurementId=${measurement?.id}`)}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Edit Measurement
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {isHomeowner ? (
        <HomeownerResults measurement={measurement} user={user} setMeasurement={setMeasurement} />
      ) : (
        <RooferResults measurement={measurement} user={user} />
      )}
    </div>
  );
}