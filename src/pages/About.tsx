import Navigation from "@/components/ui/navigation";
import { Card } from "@/components/ui/card";
import { Heart, Target, Lightbulb } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Header Section */}
      <section className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl lg:text-5xl font-playfair font-bold text-primary mb-6">
            Who We Are
          </h1>
          <div className="w-24 h-1 bg-accent mx-auto mb-8"></div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Vishva Vijaya Foundation (VVF) is a non-profit initiative dedicated to taking Bharat's Vijaya to the global stage.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground leading-relaxed mb-8">
              For centuries, Vijaya has been revered in Bharat as a sacred sacrament — celebrated in rituals, wellness, and culture. 
              Today, the world is rediscovering its value, and VVF is leading the effort to ensure that this rediscovery is rooted 
              in authentic knowledge and respect.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-primary text-center mb-16">
            Our Mission
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-sacred transition-all duration-300">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-playfair font-semibold text-primary mb-4">
                Advance Knowledge
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Through research, documentation, and collaborations with scientists, scholars, and traditional practitioners.
              </p>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-sacred transition-all duration-300">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Target className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-playfair font-semibold text-primary mb-4">
                Enable Change
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                By developing education, awareness programs, and legal solutions that remove stigma.
              </p>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-sacred transition-all duration-300">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-playfair font-semibold text-primary mb-4">
                Revive Culture
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                By catalysing a renaissance that reconnects society with the true essence of Vijaya.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-primary text-center mb-12">
            Why It Matters
          </h2>
          
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="w-2 h-2 bg-accent rounded-full mt-3 flex-shrink-0"></div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                <span className="font-semibold text-primary">Restoring dignity</span> to a sacred plant misrepresented for decades.
              </p>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-2 h-2 bg-accent rounded-full mt-3 flex-shrink-0"></div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                <span className="font-semibold text-primary">Empowering communities</span> through knowledge, wellness, and cultural pride.
              </p>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-2 h-2 bg-accent rounded-full mt-3 flex-shrink-0"></div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                <span className="font-semibold text-primary">Building a bridge</span> between Bharat's heritage and the world's future.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;