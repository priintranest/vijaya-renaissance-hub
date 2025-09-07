import React, { useState, useEffect } from "react";
import Navigation from "@/components/ui/navigation";
import Footer from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://thevvf.org/api' 
  : 'http://localhost:3001/api';

const Admin = () => {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [adminToken, setAdminToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  const fetchWaitlistEntries = async () => {
    if (!adminToken) {
      toast({
        title: "Authentication Required",
        description: "Please enter the admin token.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/waitlist`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Admin-Token': adminToken
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: "Authentication Failed",
            description: "Invalid admin token.",
            variant: "destructive"
          });
          setIsAuthenticated(false);
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch waitlist entries.",
            variant: "destructive"
          });
        }
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      setEntries(data.entries);
      setIsAuthenticated(true);
      
      toast({
        title: "Data Loaded",
        description: `Loaded ${data.entries.length} waitlist entries.`
      });
    } catch (error) {
      console.error('Failed to fetch entries:', error);
      toast({
        title: "Error",
        description: "Failed to load data from the server.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (!entries.length) {
      toast({
        title: "No Data",
        description: "There are no entries to export.",
        variant: "destructive"
      });
      return;
    }
    
    // Create CSV content
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Interest', 'Submitted At'];
    const csvRows = [
      headers.join(','),
      ...entries.map(entry => [
        entry.id,
        `"${entry.name.replace(/"/g, '""')}"`,
        `"${entry.email.replace(/"/g, '""')}"`,
        `"${entry.phone ? entry.phone.replace(/"/g, '""') : ''}"`,
        `"${entry.interest ? entry.interest.replace(/"/g, '""') : ''}"`,
        entry.submitted_at
      ].join(','))
    ];
    const csvContent = csvRows.join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `waitlist-entries-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Header Section */}
      <section className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl lg:text-5xl font-playfair font-bold text-primary mb-6">
            Waitlist Admin
          </h1>
          <div className="w-24 h-1 bg-accent mx-auto mb-8"></div>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Manage and view waitlist entries
          </p>
        </div>
      </section>

      {/* Authentication Section */}
      {!isAuthenticated && (
        <section className="py-8 px-6">
          <div className="container mx-auto max-w-md">
            <Card className="p-6 shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Authentication Required</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adminToken">Admin Token</Label>
                  <Input 
                    id="adminToken" 
                    type="password" 
                    value={adminToken} 
                    onChange={(e) => setAdminToken(e.target.value)}
                    placeholder="Enter admin token" 
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={fetchWaitlistEntries}
                  disabled={isLoading}
                >
                  {isLoading ? "Authenticating..." : "Access Admin Panel"}
                </Button>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Data Section */}
      {isAuthenticated && (
        <section className="py-8 px-6">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Waitlist Entries ({entries.length})</h2>
              <div className="space-x-2">
                <Button variant="outline" onClick={fetchWaitlistEntries} disabled={isLoading}>
                  {isLoading ? "Loading..." : "Refresh Data"}
                </Button>
                <Button onClick={handleExport} disabled={!entries.length}>
                  Export CSV
                </Button>
              </div>
            </div>
            
            {entries.length > 0 ? (
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Interest</TableHead>
                      <TableHead className="w-[180px]">Submitted At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.id}</TableCell>
                        <TableCell className="font-medium">{entry.name}</TableCell>
                        <TableCell>{entry.email}</TableCell>
                        <TableCell>{entry.phone || '-'}</TableCell>
                        <TableCell>{entry.interest || '-'}</TableCell>
                        <TableCell>{formatDate(entry.submitted_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 bg-muted rounded-lg">
                <p className="text-lg text-muted-foreground">No waitlist entries found.</p>
              </div>
            )}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Admin;
