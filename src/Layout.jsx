import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import ChatWidget from "./components/chat/ChatWidget";
import Navigation from "./components/Navigation";

export default function Layout({ children, currentPageName }) {
  const [measurement, setMeasurement] = useState(null);

  useEffect(() => {
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

  // Pages that shouldn't show the navigation
  const pagesWithoutNav = ['Homepage', 'MeasurementPage', 'FormPage', 'Results', 'Booking', 'BookingSuccess', 'Payment', 'SelectReportType', 'PDFDownload', 'AddressEntry', 'ContactInfoPage'];
  const shouldShowNav = !pagesWithoutNav.includes(currentPageName);

  return (
    <div className="min-h-screen">
      {shouldShowNav && <Navigation />}
      <div className={shouldShowNav ? 'pt-16' : ''}>
        {children}
      </div>
      <ChatWidget currentPage={currentPageName} measurement={measurement} />
    </div>
  );
}