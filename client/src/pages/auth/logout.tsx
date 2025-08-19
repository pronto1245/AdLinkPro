import { useEffect } from "react";
import { useLocation } from "wouter";
import { logout } from "@/lib/auth";

const LogoutPage = () => {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Clear all authentication data
    logout();
    
    // Redirect to login page
    setLocation("/login");
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Logging out...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we log you out safely.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogoutPage;