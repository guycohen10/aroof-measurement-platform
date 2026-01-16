import React from "react";
import { Building2 } from "lucide-react";

export default function CompanyLogoDisplay({ company, size = "md", className = "" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-20 h-20"
  };

  // No logo - show fallback
  if (!company?.company_logo_url) {
    return (
      <div className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 ${className}`}>
        <Building2 className="w-1/2 h-1/2 text-white" />
      </div>
    );
  }

  // Has logo - show image
  return (
    <div className={`${sizeClasses[size]} rounded-lg bg-white border-2 border-slate-200 flex items-center justify-center p-1 overflow-hidden flex-shrink-0 ${className}`}>
      <img
        src={company.company_logo_url}
        alt={company.company_name || "Company logo"}
        className="w-full h-full object-contain"
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
    </div>
  );
}