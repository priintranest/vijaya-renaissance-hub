import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChevronDown, Globe, Menu, X } from "lucide-react";
import { useState } from "react";

const Navigation = () => {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

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
              className="w-12 h-12 object-contain bg-transparent"
            />
            <span className="text-lg sm:text-2xl font-playfair font-semibold text-primary">
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

          {/* Mobile menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button className="text-primary p-2">
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-6 mt-6">
                  {/* Mobile Navigation Links */}
                  <div className="flex flex-col space-y-4">
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "font-inter font-medium text-lg transition-colors hover:text-accent py-2",
                          location.pathname === item.path
                            ? "text-primary border-l-4 border-accent pl-4"
                            : "text-muted-foreground"
                        )}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                  
                  {/* Mobile Language Selector */}
                  <div className="border-t border-border pt-6">
                    <h4 className="font-medium text-primary mb-4">Language / भाषा</h4>
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => {
                          setLanguage('en');
                          setIsOpen(false);
                        }}
                        className={cn(
                          "flex items-center space-x-2 p-3 rounded-lg transition-colors text-left",
                          language === 'en' 
                            ? "bg-accent/10 text-accent border border-accent/20" 
                            : "text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <Globe className="w-4 h-4" />
                        <span>English</span>
                      </button>
                      <button
                        onClick={() => {
                          setLanguage('hi');
                          setIsOpen(false);
                        }}
                        className={cn(
                          "flex items-center space-x-2 p-3 rounded-lg transition-colors text-left",
                          language === 'hi' 
                            ? "bg-accent/10 text-accent border border-accent/20" 
                            : "text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <Globe className="w-4 h-4" />
                        <span>हिंदी</span>
                      </button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;