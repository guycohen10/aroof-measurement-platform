import React, { useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";

export default function AddressAutocomplete({ onAddressSelect, initialValue = "", error = "" }) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    // Check if Google Maps is available
    if (!inputRef.current || !window.google?.maps?.places) {
      console.error("Google Maps Places not loaded");
      return;
    }

    try {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ["address"],
          componentRestrictions: { country: "us" },
          fields: ["formatted_address", "geometry", "address_components"],
        }
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();

        if (!place.geometry) {
          onAddressSelect(null, "Invalid address selected");
          return;
        }

        // Extract address components
        const components = {};
        place.address_components?.forEach((comp) => {
          if (comp.types.includes("street_number")) components.streetNumber = comp.long_name;
          if (comp.types.includes("route")) components.route = comp.long_name;
          if (comp.types.includes("locality")) components.city = comp.long_name;
          if (comp.types.includes("administrative_area_level_1")) components.state = comp.short_name;
          if (comp.types.includes("postal_code")) components.zip = comp.long_name;
        });

        const addressData = {
          formatted_address: place.formatted_address,
          street: `${components.streetNumber || ""} ${components.route || ""}`.trim(),
          city: components.city || "",
          state: components.state || "",
          zip: components.zip || "",
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
        };

        // Validate it's a complete address
        if (!addressData.street || !addressData.city || !addressData.state || !addressData.zip) {
          onAddressSelect(null, "Please select a complete address");
          return;
        }

        onAddressSelect(addressData, null);
      });
    } catch (err) {
      console.error("Autocomplete init failed:", err);
    }

    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onAddressSelect]);

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="text"
        placeholder="Enter your home address..."
        defaultValue={initialValue}
        className={`w-full px-6 py-4 text-lg border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
          error
            ? "border-red-500 bg-red-50"
            : "border-slate-300 bg-white hover:border-slate-400"
        }`}
        autoComplete="off"
      />
      {error && (
        <div className="flex items-center gap-2 mt-3 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}