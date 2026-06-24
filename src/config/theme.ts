// Configuration des couleurs de l'application
// Basé sur les couleurs du logo Anim'Média

export const APP_COLORS = {
  // Couleurs du logo
  logo: {
    background: '#F7EDE0',
    primary: '#DE3156',    // Rose/Rouge vif
    secondary: '#F49928',  // Orange
    tertiary: '#EEAE84',   // Beige rosé
    cyan: '#00A8A8',       // Cyan foncé
    lightCyan: '#00C2CB',  // Cyan clair
    orange: '#FF7300',     // Orange vif
  },
  
  // Couleurs principales pour l'application
  primary: {
    main: '#DE3156',       // Rose/Rouge du logo
    hover: '#b82745',      // Version plus foncée
    light: '#ff6b8a',      // Version plus claire
  },
  
  secondary: {
    main: '#00A8A8',       // Cyan du logo
    hover: '#008989',      // Version plus foncée
    light: '#00C2CB',      // Cyan clair
  },
  
  accent: {
    main: '#F49928',       // Orange
    hover: '#d67d1a',      // Version plus foncée
    light: '#FF7300',      // Orange vif
  },
};

// Classes Tailwind personnalisées (à configurer dans tailwind.config.ts)
export const THEME_CLASSES = {
  // Headers et sections importantes
  headerGradient: 'bg-gradient-to-r from-[#DE3156]/90 via-[#F49928]/90 to-[#00A8A8]/90 backdrop-blur-md',
  heroGradient: 'bg-[#FAF9F6]',
  
  // Boutons
  buttonPrimary: 'bg-[#DE3156] hover:bg-[#c12547] text-white shadow-md shadow-[#DE3156]/10 hover:shadow-lg hover:shadow-[#DE3156]/20 rounded-xl transition-all duration-300 font-semibold',
  buttonSecondary: 'bg-[#00A8A8] hover:bg-[#008989] text-white shadow-md shadow-[#00A8A8]/10 hover:shadow-lg hover:shadow-[#00A8A8]/20 rounded-xl transition-all duration-300 font-semibold',
  buttonAccent: 'bg-[#F49928] hover:bg-[#d67d1a] text-white shadow-md shadow-[#F49928]/10 hover:shadow-lg hover:shadow-[#F49928]/20 rounded-xl transition-all duration-300 font-semibold',
  
  // Texte et liens
  textGradient: 'bg-gradient-to-r from-[#DE3156] via-[#F49928] to-[#00A8A8] bg-clip-text text-transparent',
  textPrimary: 'text-[#DE3156]',
  textSecondary: 'text-[#00A8A8]',
  textAccent: 'text-[#F49928]',
  
  // Liens
  linkHover: 'hover:text-[#DE3156]',
  linkActive: 'text-[#DE3156]',
  linkSecondary: 'hover:text-[#00A8A8]',
  
  // Backgrounds
  bgLight: 'bg-[#FAF9F6]',
  bgLightSubtle: 'bg-[#FAF9F6]/50',
  bgPrimary: 'bg-[#DE3156]',
  bgSecondary: 'bg-[#00A8A8]',
  bgAccent: 'bg-[#F49928]',
  
  // Cartes et sections
  cardHover: 'card-premium card-premium-hover',
  sectionEvents: 'bg-gradient-to-br from-[#DE3156]/5 to-[#F49928]/5 border border-red-500/5',
  sectionWorkshops: 'bg-gradient-to-br from-[#00A8A8]/5 to-[#00C2CB]/5 border border-cyan-500/5',
  
  // Borders
  borderPrimary: 'border-[#DE3156]',
  borderSecondary: 'border-[#00A8A8]',
  borderAccent: 'border-[#F49928]',
};

