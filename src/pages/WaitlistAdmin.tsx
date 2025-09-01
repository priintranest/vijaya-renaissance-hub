import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAllWaitlistEntries, getWaitlistCount, clearAllEntries } from "@/lib/database";

interface WaitlistEntry {
  id: number;
  name: string;
  email: string;
  phone?: string;
  interest?: string;
  submitted_at: string;
}

const WaitlistAdmin = () => {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [entriesResult, countResult] = await Promise.all([
        getAllWaitlistEntries(),
        getWaitlistCount()
      ]);

      if (entriesResult.success) {
        setEntries(entriesResult.data || []);
      }
      
      if (countResult.success) {
        setCount(countResult.count);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const exportToCSV = () => {
    const csv = [
      ['Name', 'Email', 'Registration Date'],
      ...entries.map(entry => [
        entry.name,
        entry.email,
        new Date(entry.submitted_at).toLocaleString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waitlist-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete ALL waitlist entries? This cannot be undone!')) {
      const result = await clearAllEntries();
      if (result.success) {
        await fetchData(); // Refresh the data
        alert('All entries have been cleared.');
      } else {
        alert('Failed to clear entries. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading waitlist data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-playfair font-bold text-primary mb-4">
            Waitlist Admin Dashboard
          </h1>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Total registrations: <span className="font-bold text-primary">{count}</span>
            </p>
            <div className="space-x-4">
              <Button onClick={fetchData} variant="outline">
                Refresh Data
              </Button>
              <Button onClick={exportToCSV} className="bg-accent hover:bg-primary">
                Export to CSV
              </Button>
              <Button onClick={handleClearAll} variant="destructive">
                Clear All Data
              </Button>
            </div>
          </div>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-playfair font-bold text-primary mb-4">
            Recent Registrations
          </h2>
          
          {entries.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No registrations yet. Share your waitlist page to get started!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-primary">ID</th>
                    <th className="text-left py-3 px-4 font-medium text-primary">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-primary">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-primary">Registration Date</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm">{entry.id}</td>
                      <td className="py-3 px-4 font-medium">{entry.name}</td>
                      <td className="py-3 px-4 text-sm">{entry.email}</td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(entry.submitted_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default WaitlistAdmin;
