import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate(createPageUrl("admin/Login"));
    }
  }, [navigate]);

  const token = localStorage.getItem('admin_token');
  if (!token) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}