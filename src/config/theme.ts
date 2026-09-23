// Palette issue du logo actuel : turquoise, framboise, orange et jaune solaire.
// Les composants utilisent les mêmes variables que globals.css.
export const APP_COLORS = {
  logo: {
    background: '#FFFFFF',
    primary: '#007F85',
    secondary: '#E9004F',
    tertiary: '#A72A86',
    cyan: '#00A4A8',
    lightCyan: '#E7F8F7',
    orange: '#F87500',
    green: '#46A67B',
    yellow: '#FFB000',
  },
  primary: { main: '#E9004F', hover: '#C60043', light: '#FFE7EF' },
  secondary: { main: '#007F85', hover: '#005F65', light: '#E7F8F7' },
  accent: { main: '#F87500', hover: '#A94700', light: '#FFF0DF' },
};

export const THEME_CLASSES = {
  headerGradient: 'bg-brand-blue',
  heroGradient: 'bg-white',
  buttonPrimary: 'bg-gradient-to-r from-brand-pink to-brand-orange hover:from-brand-pink-dark hover:to-brand-orange-dark text-white shadow-sm rounded-full transition-all duration-200 font-bold',
  buttonSecondary: 'bg-brand-blue hover:bg-brand-blue-dark text-white shadow-sm rounded-full transition-all duration-200 font-bold',
  buttonAccent: 'bg-brand-sun hover:bg-brand-orange text-brand-ink shadow-sm rounded-full transition-all duration-200 font-bold',
  textGradient: 'text-brand-pink',
  textPrimary: 'text-brand-pink',
  textSecondary: 'text-brand-blue',
  textAccent: 'text-brand-orange-dark',
  linkHover: 'hover:text-brand-pink',
  linkActive: 'text-brand-pink',
  linkSecondary: 'hover:text-brand-blue',
  bgLight: 'bg-brand-surface',
  bgLightSubtle: 'bg-brand-surface/50',
  bgPrimary: 'bg-brand-pink',
  bgSecondary: 'bg-brand-blue',
  bgAccent: 'bg-brand-orange',
  cardHover: 'card-premium card-premium-hover',
  sectionEvents: 'bg-brand-pink/5 border border-brand-pink/10',
  sectionWorkshops: 'bg-brand-blue/5 border border-brand-blue/10',
  borderPrimary: 'border-brand-pink',
  borderSecondary: 'border-brand-blue',
  borderAccent: 'border-brand-orange',
};
