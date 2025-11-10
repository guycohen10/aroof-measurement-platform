import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import ChatWidget from "./components/chat/ChatWidget";

export default function Layout({ children, currentPageName }) {
  const [measurement, setMeasurement] = useState(null);

  useEffect(() => {
    // Try to load the most recent measurement for context
    const loadRecentMeasurement = async () => {
      try {
        const measurements = await base44.entities.Measurement.list('-created_date', 1);
        if (measurements && measurements.length > 0) {
          setMeasurement(measurements[0]);
        }
      } catch (err) {
        console.log("No measurement context available");
      }
    };

    loadRecentMeasurement();
  }, []);

  return (
    <div className="min-h-screen">
      {children}
      <ChatWidget currentPage={currentPageName} measurement={measurement} />
    </div>
  );
}