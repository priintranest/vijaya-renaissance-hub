import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("vvf_admin_auth") === "true";
    
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [navigate]);

  const isAuthenticated = sessionStorage.getItem("vvf_admin_auth") === "true";

  if (!isAuthenticated) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
};

export default ProtectedRoute;
