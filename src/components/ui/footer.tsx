import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-primary text-primary-foreground py-12 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          
          {/* Navigation Links */}
          <div className="flex flex-col items-center space-y-4">
            <h4 className="font-playfair font-semibold text-lg">Quick Links</h4>
            <nav className="flex flex-col space-y-2 text-center">
              <Link to="/" className="hover:text-accent transition-colors">
                {t('nav.home')}
              </Link>
              <Link to="/about" className="hover:text-accent transition-colors">
                {t('nav.about')}
              </Link>
              <Link to="/waitlist" className="hover:text-accent transition-colors">
                {t('nav.waitlist')}
              </Link>
            </nav>
          </div>

          {/* Mission Statement */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-4">
            <h4 className="font-playfair font-semibold text-lg">Our Mission</h4>
            <p className="text-sm opacity-90 max-w-xs leading-relaxed">
              {t('footer.mission')}
            </p>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-sm opacity-80">
            © 2025 {t('nav.foundation')} — {t('footer.copyright')}
          </p>
          <p className="text-sm opacity-70 mt-2">
            🌱 {t('waitlist.closing')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;