import React, { useState, useEffect } from "react";
import Navigation from "@/components/ui/navigation";
import Footer from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  interest?: string;
  submitted_at: string;
}

const Admin = () => {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch waitlist data from external API
  const fetchWaitlistData = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching data from external API...');
      
      const response = await fetch('https://api.esamudaay.com/api/waitlist', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-TOKEN': 'STATIC_WAITLIST_TOKEN',
        },
      });

      console.log('API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API response data:', data);

      // Handle different possible response formats
      let entriesArray: WaitlistEntry[] = [];
      
      if (Array.isArray(data)) {
        entriesArray = data;
      } else if (data.data && Array.isArray(data.data)) {
        entriesArray = data.data;
      } else if (data.entries && Array.isArray(data.entries)) {
        entriesArray = data.entries;
      } else if (data.waitlist && Array.isArray(data.waitlist)) {
        entriesArray = data.waitlist;
      } else {
        console.log('Unexpected data format:', data);
        entriesArray = [];
      }

      setEntries(entriesArray);
      
      toast({
        title: "Success",
        description: `Loaded ${entriesArray.length} waitlist entries`,
      });

    } catch (error) {
      console.error('Failed to fetch waitlist data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch waitlist data. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchWaitlistData();
  }, []);

  // Export to CSV
  const handleExport = () => {
    if (!entries.length) {
      toast({
        title: "No Data",
        description: "No entries to export",
        variant: "destructive"
      });
      return;
    }

    const headers = ['ID', 'Name', 'Email', 'Phone', 'Interest', 'Submitted At'];
    const csvRows = [
      headers.join(','),
      ...entries.map(entry => [
        entry.id || '',
        `"${(entry.name || '').replace(/"/g, '""')}"`,
        `"${(entry.email || '').replace(/"/g, '""')}"`,
        `"${(entry.phone || '').replace(/"/g, '""')}"`,
        `"${(entry.interest || '').replace(/"/g, '""')}"`,
        entry.submitted_at || ''
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `waitlist-entries-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: "CSV file downloaded"
    });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🍃 Waitlist Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Total registrations: <span className="font-semibold">{entries.length}</span>
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={fetchWaitlistData} 
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? "Loading..." : "Refresh Data"}
            </Button>
            <Button 
              onClick={handleExport}
              disabled={!entries.length}
            >
              Export to CSV
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Registrations</h2>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <p className="mt-2 text-gray-600">Loading waitlist data...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No registrations yet. Share your waitlist page to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Interest</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono text-sm">
                        {entry.id || 'N/A'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {entry.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {entry.email || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {entry.phone || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {entry.interest || 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(entry.submitted_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {/* Debug Info */}
        <Card className="mt-6 p-4 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Debug Info</h3>
          <p className="text-xs text-gray-600">
            API Endpoint: https://api.esamudaay.com/api/waitlist
          </p>
          <p className="text-xs text-gray-600">
            Last Updated: {new Date().toLocaleString()}
          </p>
          <p className="text-xs text-gray-600">
            Entries Found: {entries.length}
          </p>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default Admin;
