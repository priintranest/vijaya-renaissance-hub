import React, { createContext, useContext, useState } from 'react';

interface LanguageContextType {
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.waitlist': 'Join Waitlist',
    'nav.foundation': 'Vishva Vijaya Foundation',
    
    // Home Page
    'home.hero.title': 'Taking Bharat\'s Vijaya to the World',
    'home.hero.subtitle': 'In Bharat, Vijaya is not just a plant — it is a sacrament. A symbol of culture, consciousness, and care.',
    'home.hero.cta': 'Join the Waitlist',
    'home.vision.title': 'Our Vision',
    'home.vision.text': 'We are re-imagining Vijaya for the modern world — blending ancient wisdom with scientific research to restore its rightful place in society.',
    'home.focus.title': 'Our Focus Areas',
    'home.research.title': 'Research & Development',
    'home.research.text': 'Advancing rigorous studies to unlock the healing and cultural potential of Vijaya.',
    'home.education.title': 'Education & Legal Reform',
    'home.education.text': 'Building awareness and policy frameworks to remove stigma and outdated barriers.',
    'home.cultural.title': 'Cultural Renaissance',
    'home.cultural.text': 'Reviving sacred traditions and strengthening Bharat\'s identity around Vijaya.',
    'home.cta.title': 'Join us in shaping a movement of knowledge, healing, and heritage.',
    'home.cta.button': 'Join Waitlist',
    
    // About Page
    'about.title': 'Who We Are',
    'about.intro': 'Vishva Vijaya Foundation (VVF) is a non-profit initiative dedicated to taking Bharat\'s Vijaya to the global stage.',
    'about.description': 'For centuries, Vijaya has been revered in Bharat as a sacred sacrament — celebrated in rituals, wellness, and culture. Today, the world is rediscovering its value, and VVF is leading the effort to ensure that this rediscovery is rooted in authentic knowledge and respect.',
    'about.mission.title': 'Our Mission',
    'about.mission.advance': 'Advance Knowledge – Through research, documentation, and collaborations with scientists, scholars, and traditional practitioners.',
    'about.mission.enable': 'Enable Change – By developing education, awareness programs, and legal solutions that remove stigma.',
    'about.mission.revive': 'Revive Culture – By catalysing a renaissance that reconnects society with the true essence of Vijaya.',
    'about.why.title': 'Why It Matters',
    'about.why.dignity': 'Restoring dignity to a sacred plant misrepresented for decades.',
    'about.why.empowering': 'Empowering communities through knowledge, wellness, and cultural pride.',
    'about.why.bridge': 'Building a bridge between Bharat\'s heritage and the world\'s future.',
    
    // Waitlist Page
    'waitlist.title': 'Be Part of the Movement',
    'waitlist.subtitle': 'The world is ready for a new conversation around Vijaya — one that is authentic, research-driven, and rooted in Bharat\'s tradition.',
    'waitlist.benefits': 'By joining the Vishva Vijaya Foundation waitlist, you will:',
    'waitlist.benefit1': 'Get early access to insights, research, and events.',
    'waitlist.benefit2': 'Join a community of changemakers shaping the narrative of Vijaya.',
    'waitlist.benefit3': 'Contribute to policy, education, and cultural revival.',
    'waitlist.form.title': 'How to Join',
    'waitlist.form.subtitle': 'Enter your details below to secure your spot in the movement.',
    'waitlist.form.name': 'Name',
    'waitlist.form.email': 'Email',
    'waitlist.form.country': 'Country',
    'waitlist.form.profession': 'Profession',
    'waitlist.form.submit': 'Join the Waitlist',
    'waitlist.closing': 'Together, let\'s reclaim and share the true spirit of Vijaya with the world.',
    
    // Footer
    'footer.mission': 'Advancing Bharat\'s sacred Vijaya traditions through research, education, and cultural renaissance for global healing and heritage.',
    'footer.copyright': 'All Rights Reserved.',
  },
  hi: {
    // Navigation
    'nav.home': 'मुख्य',
    'nav.about': 'हमारे बारे में',
    'nav.waitlist': 'प्रतीक्षा सूची में शामिल हों',
    'nav.foundation': 'विश्व विजया फाउंडेशन',
    
    // Home Page
    'home.hero.title': 'भारत की विजया को विश्व तक पहुंचाना',
    'home.hero.subtitle': 'भारत में, विजया केवल एक पौधा नहीं है, यह एक संस्कार है।',
    'home.hero.cta': 'प्रतीक्षा सूची में शामिल हों',
    'home.vision.title': 'हमारी दृष्टि',
    'home.vision.text': 'हम आधुनिक दुनिया के लिए विजया की पुनः कल्पना कर रहे हैं — प्राचीन ज्ञान को वैज्ञानिक अनुसंधान के साथ मिलाकर समाज में इसका सही स्थान बहाल करने के लिए।',
    'home.focus.title': 'हमारे फोकस क्षेत्र',
    'home.research.title': 'अनुसंधान और विकास',
    'home.research.text': 'कठोर अनुसंधान एवं विकास के माध्यम से विजया की समझ को बढ़ाना',
    'home.education.title': 'शिक्षा और कानूनी सुधार',
    'home.education.text': 'अवरुद्धताओं को हटाने और कलंक समाप्त करने के लिए शिक्षा और कानूनी समाधान विकसित करना',
    'home.cultural.title': 'सांस्कृतिक पुनर्जागरण',
    'home.cultural.text': 'विजया के साथ हमारे संबंध को पुनर्जीवित करते हुए सांस्कृतिक पुनर्जागरण को उत्प्रेरित करना',
    'home.cta.title': 'ज्ञान, उपचार और विरासत के आंदोलन को आकार देने में हमारे साथ जुड़ें।',
    'home.cta.button': 'प्रतीक्षा सूची में शामिल हों',
    
    // About Page
    'about.title': 'हम कौन हैं',
    'about.intro': 'विश्व विजया फाउंडेशन एक गैर-लाभकारी संस्था है जो भारत की विजया को दुनिया तक पहुंचा रही है।',
    'about.description': 'सदियों से, विजया को भारत में एक पवित्र संस्कार के रूप में सम्मानित किया गया है — अनुष्ठानों, कल्याण और संस्कृति में मनाया गया है। आज, दुनिया इसके मूल्य की पुनः खोज कर रही है, और वीवीएफ यह सुनिश्चित करने के प्रयास का नेतृत्व कर रहा है कि यह पुनः खोज प्रामाणिक ज्ञान और सम्मान में निहित है।',
    'about.mission.title': 'हमारा मिशन',
    'about.mission.advance': 'ज्ञान आगे बढ़ाना – अनुसंधान, प्रलेखन, और वैज्ञानिकों, विद्वानों और पारंपरिक चिकित्सकों के साथ सहयोग के माध्यम से।',
    'about.mission.enable': 'परिवर्तन सक्षम करना – शिक्षा, जागरूकता कार्यक्रम, और कानूनी समाधान विकसित करके जो कलंक को दूर करते हैं।',
    'about.mission.revive': 'संस्कृति को पुनर्जीवित करना – एक पुनर्जागरण को उत्प्रेरित करके जो समाज को विजया के सच्चे सार से फिर से जोड़ता है।',
    'about.why.title': 'यह क्यों महत्वपूर्ण है',
    'about.why.dignity': 'दशकों से गलत तरीके से प्रस्तुत किए गए एक पवित्र पौधे की गरिमा को बहाल करना।',
    'about.why.empowering': 'ज्ञान, कल्याण और सांस्कृतिक गर्व के माध्यम से समुदायों को सशक्त बनाना।',
    'about.why.bridge': 'भारत की विरासत और दुनिया के भविष्य के बीच एक पुल का निर्माण।',
    
    // Waitlist Page
    'waitlist.title': 'आंदोलन का हिस्सा बनें',
    'waitlist.subtitle': 'दुनिया विजया के आसपास एक नई बातचीत के लिए तैयार है — जो प्रामाणिक, अनुसंधान-संचालित, और भारत की परंपरा में निहित है।',
    'waitlist.benefits': 'VVF का सदस्य क्यों बनें',
    'waitlist.benefit1': 'अंतर्दृष्टि, अनुसंधान और घटनाओं तक जल्दी पहुंच प्राप्त करें।',
    'waitlist.benefit2': 'विजया की कथा को आकार देने वाले परिवर्तनकर्ताओं के समुदाय में शामिल हों।',
    'waitlist.benefit3': 'नीति, शिक्षा और सांस्कृतिक पुनरुद्धार में योगदान दें।',
    'waitlist.form.title': 'कैसे शामिल हों',
    'waitlist.form.subtitle': 'कृपया हमारी वेटलिस्ट में शामिल होने के लिए नीचे दिया गया फॉर्म भरें।',
    'waitlist.form.name': 'नाम',
    'waitlist.form.email': 'ईमेल',
    'waitlist.form.country': 'देश',
    'waitlist.form.profession': 'पेशा',
    'waitlist.form.submit': 'प्रतीक्षा सूची में शामिल हों',
    'waitlist.closing': 'आइए मिलकर विजया की सच्ची भावना को दुनिया के साथ पुनः प्राप्त करें और साझा करें।',
    
    // Footer
    'footer.mission': 'वैश्विक उपचार और विरासत के लिए अनुसंधान, शिक्षा और सांस्कृतिक पुनर्जागरण के माध्यम से भारत की पवित्र विजया परंपराओं को आगे बढ़ाना।',
    'footer.copyright': '© विश्व विजया फाउंडेशन — सर्वाधिकार सुरक्षित।',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'hi'>('hi');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};