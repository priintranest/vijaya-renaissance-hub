import Navigation from "@/components/ui/navigation";
import Footer from "@/components/ui/footer";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Heart, Target, Lightbulb } from "lucide-react";

const About = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Header Section */}
      <section className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl lg:text-5xl font-playfair font-bold text-primary mb-6">
            {t('about.title')}
          </h1>
          <div className="w-24 h-1 bg-accent mx-auto mb-8"></div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t('about.intro')}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground leading-relaxed mb-8">
              {t('about.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-primary text-center mb-16">
            {t('about.mission.title')}
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
                {t('about.mission.advance')}
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
                {t('about.mission.enable')}
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
                {t('about.mission.revive')}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-primary text-center mb-12">
            {t('about.why.title')}
          </h2>
          
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="w-2 h-2 bg-accent rounded-full mt-3 flex-shrink-0"></div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('about.why.dignity')}
              </p>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-2 h-2 bg-accent rounded-full mt-3 flex-shrink-0"></div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('about.why.empowering')}
              </p>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-2 h-2 bg-accent rounded-full mt-3 flex-shrink-0"></div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('about.why.bridge')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;