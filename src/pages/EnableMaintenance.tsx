import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EnableMaintenance = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Set maintenance mode in localStorage
    localStorage.setItem("vvf_maintenance_mode", "true");
    
    // Show confirmation and redirect
    alert("� SITE DISABLED: Non-payment maintenance mode activated. Site now shows payment required message to all users.");
    
    // Redirect to home (which will show maintenance page)
    navigate("/");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-red-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-800">Activating Non-Payment Mode...</h1>
        <p className="text-red-600">Site will show payment required message...</p>
      </div>
    </div>
  );
};

export default EnableMaintenance;
