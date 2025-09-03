import { useEffect } from "react";
import { Wrench, Clock, Mail } from "lucide-react";

const MaintenanceMode = () => {
  useEffect(() => {
    document.title = "Site Under Maintenance - VVF";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="text-center max-w-lg mx-auto bg-white/95 backdrop-blur rounded-lg shadow-2xl p-8">
        {/* Maintenance Icon */}
        <div className="mx-auto mb-6 w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center animate-pulse">
          <Wrench className="w-10 h-10 text-orange-600" />
        </div>

        {/* Main Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Site Under Maintenance
        </h1>
        <p className="text-gray-600 mb-6">
          We're currently performing scheduled maintenance to improve your experience.
          Please check back in a few hours.
        </p>

        {/* Time Display */}
        <div className="flex items-center justify-center space-x-2 text-gray-500 mb-6">
          <Clock className="w-4 h-4" />
          <span className="text-sm">
            {new Date().toLocaleString()}
          </span>
        </div>

        {/* Contact Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">Need assistance?</p>
          <div className="flex items-center justify-center space-x-2 text-gray-700">
            <Mail className="w-4 h-4" />
            <span className="text-sm">support@thevvf.org</span>
          </div>
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
