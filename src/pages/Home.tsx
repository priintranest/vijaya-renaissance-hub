import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/ui/navigation";
import Footer from "@/components/ui/footer";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@/assets/vijaya-leaf-hero.jpg";
import templeIcon from "@/assets/temple-icon.jpg";
import { BookOpen, FlaskConical, Scale } from "lucide-react";

const Home = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-playfair font-bold text-primary leading-tight">
                  {t('nav.foundation')}
                </h1>
                <h2 className="text-2xl lg:text-3xl font-playfair text-accent font-medium">
                  {t('home.hero.title')}
                </h2>
              </div>
              
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                {t('home.hero.subtitle')}
              </p>
              
              <Link to="/waitlist">
                <Button size="lg" className="bg-primary hover:bg-accent text-primary-foreground hover:text-accent-foreground shadow-sacred transition-all duration-300 hover:shadow-gold">
                  {t('home.hero.cta')}
                </Button>
              </Link>
            </div>
            
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Sacred Vijaya leaf illustration" 
                className="w-full h-auto rounded-lg shadow-sacred animate-float"
              />
              <div className="absolute inset-0 bg-gradient-sacred opacity-10 rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-primary mb-6">
            {t('home.vision.title')}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t('home.vision.text')}
          </p>
        </div>
      </section>

      {/* Focus Areas */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-primary text-center mb-16">
            {t('home.focus.title')}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-sacred transition-all duration-300 border-border/50">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <FlaskConical className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-playfair font-semibold text-primary mb-4">
                {t('home.research.title')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('home.research.text')}
              </p>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-sacred transition-all duration-300 border-border/50">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-playfair font-semibold text-primary mb-4">
                {t('home.education.title')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('home.education.text')}
              </p>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-sacred transition-all duration-300 border-border/50">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <img src={templeIcon} alt="Cultural Heritage" className="w-8 h-8 object-contain animate-sacred" />
                </div>
              </div>
              <h3 className="text-xl font-playfair font-semibold text-primary mb-4">
                {t('home.cultural.title')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('home.cultural.text')}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-6 bg-gradient-subtle">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="space-y-6">
            <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-primary">
              {t('home.cta.title')}
            </h2>
            <Link to="/waitlist">
              <Button size="lg" className="bg-accent hover:bg-primary text-accent-foreground hover:text-primary-foreground shadow-gold transition-all duration-300">
                {t('home.cta.button')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;