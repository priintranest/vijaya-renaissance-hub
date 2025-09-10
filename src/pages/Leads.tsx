import React, { useState, useEffect } from "react";
import Navigation from "@/components/ui/navigation";
import Footer from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  interest: string | null;
  submitted_at: string;
}

const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const { toast } = useToast();

  const fetchLeads = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      console.log("🚀 Fetching leads from API...");
      
      const response = await fetch('https://api.esamudaay.com/api/waitlist', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-TOKEN': 'STATIC_WAITLIST_TOKEN',
        },
      });

      console.log("📡 Response status:", response.status);
      console.log("📡 Response headers:", response.headers);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("📊 Raw API response:", data);
      console.log("📊 Is array?", Array.isArray(data));
      console.log("📊 Data length:", data?.length || 'N/A');

      if (Array.isArray(data)) {
        setLeads(data);
        toast({
          title: "Success! 🎉",
          description: `Loaded ${data.length} leads successfully`,
        });
      } else {
        console.error("❌ Unexpected response format:", data);
        setError("Unexpected response format from API");
      }

    } catch (err) {
      console.error("❌ Fetch error:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Error ❌",
        description: `Failed to fetch leads: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-load on mount
  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📋 Leads Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Direct API integration test page
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-center mb-8">
          <Button 
            onClick={fetchLeads} 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "🔄 Loading..." : "🔄 Refresh Leads"}
          </Button>
        </div>

        {/* Leads Table - Always show structure */}
        <Card className="p-6 bg-white/80 backdrop-blur mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              📋 Leads Table
            </h2>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {leads.length} entries
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="text-left p-4 font-semibold text-gray-700">ID</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Email</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Phone</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Interest</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center">
                      <div className="animate-spin inline-block w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                      <p className="text-gray-600">Loading leads...</p>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center">
                      <div className="text-red-600 mb-2">❌ Error loading data</div>
                      <p className="text-sm text-gray-600">{error}</p>
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center">
                      <div className="text-gray-500">📭 No leads found</div>
                    </td>
                  </tr>
                ) : (
                  leads.map((lead, index) => (
                    <tr 
                      key={lead.id} 
                      className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'
                      }`}
                    >
                      <td className="p-4">
                        <span className="font-mono font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded text-sm">
                          #{lead.id}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-gray-900">{lead.name}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-blue-600 hover:underline">{lead.email}</span>
                      </td>
                      <td className="p-4">
                        {lead.phone ? (
                          <span className="text-gray-700">{lead.phone}</span>
                        ) : (
                          <span className="text-gray-400 italic">N/A</span>
                        )}
                      </td>
                      <td className="p-4">
                        {lead.interest ? (
                          <span className="text-gray-700">{lead.interest}</span>
                        ) : (
                          <span className="text-gray-400 italic">N/A</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <div className="text-gray-900 font-medium">
                            {new Date(lead.submitted_at).toLocaleDateString()}
                          </div>
                          <div className="text-gray-500">
                            {new Date(lead.submitted_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* API Status Card */}
        <Card className="p-6 bg-white/80 backdrop-blur">
          <h2 className="text-xl font-semibold mb-4">🔗 API Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Endpoint:</span>
              <p className="text-blue-600 break-all">https://api.esamudaay.com/api/waitlist</p>
            </div>
            <div>
              <span className="font-medium">Status:</span>
              <p className={isLoading ? "text-yellow-600" : error ? "text-red-600" : "text-green-600"}>
                {isLoading ? "Loading..." : error ? "Error" : "Success"}
              </p>
            </div>
            <div>
              <span className="font-medium">Leads Count:</span>
              <p className="text-purple-600 font-bold">{leads.length}</p>
            </div>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 rounded text-red-700">
              ❌ Error: {error}
            </div>
          )}
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default Leads;
