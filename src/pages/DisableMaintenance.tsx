import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DisableMaintenance = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Remove maintenance mode from localStorage
    localStorage.removeItem("vvf_maintenance_mode");
    
    // Show confirmation and redirect
    alert("✅ Maintenance mode DISABLED. Site is now live for users.");
    
    // Redirect to home
    navigate("/");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-green-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-green-800">Disabling Maintenance Mode...</h1>
        <p className="text-green-600">Please wait...</p>
      </div>
    </div>
  );
};

export default DisableMaintenance;
