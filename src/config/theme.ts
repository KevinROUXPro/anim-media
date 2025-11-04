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
  headerGradient: 'bg-gradient-to-r from-[#DE3156] via-[#F49928] to-[#00A8A8]',
  heroGradient: 'bg-gradient-to-br from-[#DE3156] via-[#F49928] to-[#00A8A8]',
  
  // Boutons
  buttonPrimary: 'bg-gradient-to-r from-[#DE3156] to-[#F49928] hover:from-[#b82745] hover:to-[#d67d1a]',
  buttonSecondary: 'bg-[#00A8A8] hover:bg-[#008989]',
  buttonAccent: 'bg-[#F49928] hover:bg-[#d67d1a]',
  
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
  bgLight: 'bg-[#F7EDE0]',
  bgLightSubtle: 'bg-[#F7EDE0]/30',
  bgPrimary: 'bg-[#DE3156]',
  bgSecondary: 'bg-[#00A8A8]',
  bgAccent: 'bg-[#F49928]',
  
  // Cartes et sections
  cardHover: 'hover:shadow-xl hover:shadow-[#DE3156]/20',
  sectionEvents: 'bg-gradient-to-br from-[#DE3156]/10 to-[#F49928]/10',
  sectionWorkshops: 'bg-gradient-to-br from-[#00A8A8]/10 to-[#00C2CB]/10',
  
  // Borders
  borderPrimary: 'border-[#DE3156]',
  borderSecondary: 'border-[#00A8A8]',
  borderAccent: 'border-[#F49928]',
};

