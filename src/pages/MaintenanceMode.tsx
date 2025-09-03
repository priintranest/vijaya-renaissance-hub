import { useEffect } from "react";
import { Wrench, Clock, Mail } from "lucide-react";

const MaintenanceMode = () => {
  useEffect(() => {
    document.title = "Service Unavailable - Payment Required";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="text-center max-w-lg mx-auto bg-white/95 backdrop-blur rounded-lg shadow-2xl p-8">
        {/* Maintenance Icon */}
        <div className="mx-auto mb-6 w-20 h-20 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
          <Wrench className="w-10 h-10 text-red-600" />
        </div>

        {/* Main Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Service Temporarily Unavailable
        </h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <p className="text-red-800 font-semibold mb-2">
            ⚠️ Site is currently offline due to non-payment
          </p>
          <p className="text-red-700 text-sm">
            This website is suspended due to outstanding payment issues. 
            Please contact the site administrator to resolve this matter.
          </p>
        </div>

        {/* Time Display */}
        <div className="flex items-center justify-center space-x-2 text-gray-500 mb-6">
          <Clock className="w-4 h-4" />
          <span className="text-sm">
            {new Date().toLocaleString()}
          </span>
        </div>

        {/* Contact Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">Administrator Contact:</p>
          <div className="flex items-center justify-center space-x-2 text-gray-700">
            <Mail className="w-4 h-4" />
            <span className="text-sm">admin@thevvf.org</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Please contact the administrator to resolve payment issues and restore service.
          </p>
        </div>

        {/* Footer */}
        <p className="mt-6 text-xs text-gray-400">
          © 2025 VVF Renaissance Hub. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default MaintenanceMode;
