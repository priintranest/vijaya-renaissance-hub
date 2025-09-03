import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EnableMaintenance = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Set maintenance mode in localStorage
    localStorage.setItem("vvf_maintenance_mode", "true");
    
    // Show confirmation and redirect
    alert("🔧 Maintenance mode ENABLED. Site is now offline for users.");
    
    // Redirect to home (which will show maintenance page)
    navigate("/");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-red-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-800">Enabling Maintenance Mode...</h1>
        <p className="text-red-600">Please wait...</p>
      </div>
    </div>
  );
};

export default EnableMaintenance;
