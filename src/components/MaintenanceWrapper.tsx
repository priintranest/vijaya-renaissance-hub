import { useState, useEffect } from "react";
import MaintenanceMode from "@/pages/MaintenanceMode";

interface MaintenanceWrapperProps {
  children: React.ReactNode;
}

const MaintenanceWrapper = ({ children }: MaintenanceWrapperProps) => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if maintenance mode is enabled
    const checkMaintenanceMode = () => {
      const maintenanceStatus = localStorage.getItem("vvf_maintenance_mode");
      setIsMaintenanceMode(maintenanceStatus === "true");
      setIsLoading(false);
    };

    checkMaintenanceMode();

    // Listen for storage changes (in case maintenance is toggled in another tab)
    const handleStorageChange = () => {
      checkMaintenanceMode();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Show loading briefly to prevent flash
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show maintenance page if maintenance mode is enabled
  if (isMaintenanceMode) {
    return <MaintenanceMode />;
  }

  // Show normal app
  return <>{children}</>;
};

export default MaintenanceWrapper;
