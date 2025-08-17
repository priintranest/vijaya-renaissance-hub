import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, Globe } from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { name: t('nav.home'), path: "/" },
    { name: t('nav.about'), path: "/about" },
    { name: t('nav.waitlist'), path: "/waitlist" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <img 
              src="/lovable-uploads/61159d8a-0fa4-410c-9980-ea58769eab06.png" 
              alt="Vishva Vijaya Foundation Logo" 
              className="w-12 h-12 object-contain"
            />
            <span className="text-2xl font-playfair font-semibold text-primary">
              {t('nav.foundation')}
            </span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "font-inter font-medium transition-colors hover:text-accent",
                  location.pathname === item.path
                    ? "text-primary border-b-2 border-accent pb-1"
                    : "text-muted-foreground"
                )}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Language Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-1 font-inter font-medium text-muted-foreground hover:text-accent transition-colors">
                <Globe className="w-4 h-4" />
                <span>{language === 'hi' ? 'हिं' : 'EN'}</span>
                <ChevronDown className="w-3 h-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background border border-border shadow-lg">
                <DropdownMenuItem 
                  onClick={() => setLanguage('en')}
                  className={cn(
                    "cursor-pointer",
                    language === 'en' && "bg-accent/10 text-accent"
                  )}
                >
                  English
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('hi')}
                  className={cn(
                    "cursor-pointer",
                    language === 'hi' && "bg-accent/10 text-accent"
                  )}
                >
                  हिंदी
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-primary">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;