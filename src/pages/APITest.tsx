import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { submitWaitlist, fetchWaitlistEntries, testAPIConnection, WaitlistData } from "@/lib/waitlist";

const APITest = () => {
  const [testData, setTestData] = useState<WaitlistData>({
    name: "Test User",
    email: "test@example.com",
    phone: "+1234567890",
    interest: "Testing"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const { toast } = useToast();

  const addResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setResults(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const result = await testAPIConnection();
      addResult(`Connection test: ${result.success ? 'SUCCESS' : 'FAILED'} - ${result.message}`);
      toast({
        title: result.success ? "Connection Success" : "Connection Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
      addResult(`Connection test error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSubmission = async () => {
    setIsLoading(true);
    try {
      const result = await submitWaitlist(testData);
      addResult(`Submission: ${result.success ? 'SUCCESS' : 'FAILED'} - ${result.message}`);
      toast({
        title: result.success ? "Submission Success" : "Submission Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
      addResult(`Submission error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testFetch = async () => {
    setIsLoading(true);
    try {
      const result = await fetchWaitlistEntries();
      addResult(`Fetch: ${result.success ? 'SUCCESS' : 'FAILED'} - ${result.message || 'No message'}`);
      if (result.success && result.data) {
        addResult(`Fetched ${result.data.length} entries`);
      }
      toast({
        title: result.success ? "Fetch Success" : "Fetch Failed",
        description: result.message || 'Check console for details',
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
      addResult(`Fetch error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center">API Testing Tool</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Controls */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">API Tests</h2>
            
            <div className="space-y-4">
              <Button 
                onClick={testConnection} 
                disabled={isLoading}
                className="w-full"
              >
                Test API Connection
              </Button>
              
              <Button 
                onClick={testFetch} 
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                Test Fetch Entries
              </Button>
              
              <div className="space-y-2">
                <Label htmlFor="testName">Test Data</Label>
                <Input
                  id="testName"
                  placeholder="Name"
                  value={testData.name}
                  onChange={(e) => setTestData({...testData, name: e.target.value})}
                />
                <Input
                  placeholder="Email"
                  value={testData.email}
                  onChange={(e) => setTestData({...testData, email: e.target.value})}
                />
                <Input
                  placeholder="Phone"
                  value={testData.phone || ''}
                  onChange={(e) => setTestData({...testData, phone: e.target.value})}
                />
                <Button 
                  onClick={testSubmission} 
                  disabled={isLoading}
                  className="w-full"
                  variant="secondary"
                >
                  Test Submission
                </Button>
              </div>
              
              <Button 
                onClick={clearResults} 
                variant="outline"
                className="w-full"
              >
                Clear Results
              </Button>
            </div>
          </Card>

          {/* Results */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.length === 0 ? (
                <p className="text-muted-foreground">No tests run yet...</p>
              ) : (
                results.map((result, index) => (
                  <div 
                    key={index} 
                    className="p-2 bg-muted rounded text-sm font-mono"
                  >
                    {result}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Check the browser console for detailed logs during testing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default APITest;
