import { useState } from "react";
import Navigation from "@/components/ui/navigation";
import Footer from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import handsImage from "@/assets/hands-offering-leaf.jpg";

const Waitlist = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    country: "",
    profession: ""
  });

  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.country || !formData.profession) {
      toast({
        title: "Please fill in all fields",
        description: "All fields are required to join the waitlist.",
        variant: "destructive"
      });
      return;
    }

    // Simulate form submission
    toast({
      title: "Welcome to the movement! 🌱",
      description: "You've been added to our waitlist. We'll be in touch soon.",
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      country: "",
      profession: ""
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Header Section */}
      <section className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl lg:text-5xl font-playfair font-bold text-primary mb-6">
            Be Part of the Movement
          </h1>
          <div className="w-24 h-1 bg-accent mx-auto mb-8"></div>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            The world is ready for a new conversation around Vijaya — one that is authentic, research-driven, 
            and rooted in Bharat's tradition.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Benefits Section */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl lg:text-3xl font-playfair font-bold text-primary mb-6">
                  By joining the Vishva Vijaya Foundation waitlist, you will:
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-accent-foreground text-sm font-bold">✓</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Get early access to insights, research, and events.
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-accent-foreground text-sm font-bold">✓</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Join a community of changemakers shaping the narrative of Vijaya.
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-accent-foreground text-sm font-bold">✓</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Contribute to policy, education, and cultural revival.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <img 
                  src={handsImage} 
                  alt="Sacred hands offering Vijaya leaf" 
                  className="w-full h-64 object-cover rounded-lg shadow-sacred"
                />
                <div className="absolute inset-0 bg-gradient-sacred opacity-20 rounded-lg"></div>
              </div>
            </div>
            
            {/* Form Section */}
            <Card className="p-8 shadow-sacred">
              <h3 className="text-2xl font-playfair font-bold text-primary text-center mb-6">
                Join the Waitlist
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-primary font-medium">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="border-border/50 focus:ring-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-primary font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="border-border/50 focus:ring-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-primary font-medium">Country</Label>
                  <Input
                    id="country"
                    type="text"
                    placeholder="Your country"
                    value={formData.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                    className="border-border/50 focus:ring-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="profession" className="text-primary font-medium">Profession</Label>
                  <Select value={formData.profession} onValueChange={(value) => handleChange("profession", value)}>
                    <SelectTrigger className="border-border/50 focus:ring-primary">
                      <SelectValue placeholder="Select your profession" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="researcher">Researcher</SelectItem>
                      <SelectItem value="healthcare">Healthcare Professional</SelectItem>
                      <SelectItem value="educator">Educator</SelectItem>
                      <SelectItem value="advocate">Advocate/Activist</SelectItem>
                      <SelectItem value="policymaker">Policymaker</SelectItem>
                      <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-accent hover:bg-primary text-accent-foreground hover:text-primary-foreground shadow-gold transition-all duration-300"
                  size="lg"
                >
                  Join the Waitlist
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Closing Section */}
      <section className="py-16 px-6 bg-gradient-subtle">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-2xl lg:text-3xl font-playfair font-medium text-primary mb-8">
            🌱 Together, let's reclaim and share the true spirit of Vijaya with the world.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Waitlist;