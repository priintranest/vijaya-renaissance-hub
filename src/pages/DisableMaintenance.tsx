import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DisableMaintenance = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Remove maintenance mode from localStorage
    localStorage.removeItem("vvf_maintenance_mode");
    
    // Show confirmation and redirect
    alert("✅ SITE RESTORED: Payment maintenance mode disabled. Site is now live and accessible to all users.");
    
    // Redirect to home
    navigate("/");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-green-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-green-800">Restoring Site Access...</h1>
        <p className="text-green-600">Site will be live shortly...</p>
      </div>
    </div>
  );
};

export default DisableMaintenance;
