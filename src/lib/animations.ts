// Bibliothèque d'animations réutilisables pour Framer Motion
import { Variants } from 'framer-motion';

// Animations de base
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -100 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 100 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

// Animations de scale
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.6, ease: "backOut" }
  }
};

export const scaleInBounce: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.8, 
      type: "spring",
      stiffness: 200,
      damping: 15
    }
  }
};

// Animations de rotation
export const rotateIn: Variants = {
  hidden: { opacity: 0, rotate: -180, scale: 0.5 },
  visible: { 
    opacity: 1, 
    rotate: 0, 
    scale: 1,
    transition: { duration: 0.8, ease: "backOut" }
  }
};

// Animations pour les listes (stagger)
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

// Animations de carte
export const cardHover = {
  scale: 1.05,
  y: -10,
  rotateZ: 2,
  transition: { 
    duration: 0.3,
    type: "spring",
    stiffness: 300
  }
};

export const cardTap = {
  scale: 0.98,
  transition: { duration: 0.1 }
};

// Animations de bouton spectaculaires
export const buttonHover = {
  scale: 1.1,
  boxShadow: "0 20px 40px rgba(222, 49, 86, 0.4)",
  transition: { 
    duration: 0.3,
    type: "spring",
    stiffness: 400
  }
};

export const buttonTap = {
  scale: 0.95,
  transition: { duration: 0.1 }
};

// Animation de slide spectaculaire
export const slideInLeft: Variants = {
  hidden: { 
    opacity: 0, 
    x: -200,
    rotateY: -45
  },
  visible: { 
    opacity: 1, 
    x: 0,
    rotateY: 0,
    transition: { 
      duration: 1,
      ease: "easeOut"
    }
  }
};

export const slideInRight: Variants = {
  hidden: { 
    opacity: 0, 
    x: 200,
    rotateY: 45
  },
  visible: { 
    opacity: 1, 
    x: 0,
    rotateY: 0,
    transition: { 
      duration: 1,
      ease: "easeOut"
    }
  }
};

// Animation de flip
export const flipIn: Variants = {
  hidden: { 
    opacity: 0, 
    rotateX: -90,
    transformPerspective: 1000
  },
  visible: { 
    opacity: 1, 
    rotateX: 0,
    transition: { 
      duration: 0.8,
      ease: "backOut"
    }
  }
};

// Animation de bounce spectaculaire
export const bounceIn: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0,
    y: -100
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: { 
      duration: 0.8,
      type: "spring",
      stiffness: 300,
      damping: 10
    }
  }
};

// Animation de text reveal
export const textReveal: Variants = {
  hidden: { 
    opacity: 0,
    y: 50,
    skewY: 10
  },
  visible: { 
    opacity: 1,
    y: 0,
    skewY: 0,
    transition: { 
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

// Animation pour sections entières
export const sectionReveal: Variants = {
  hidden: { 
    opacity: 0,
    y: 100,
    scale: 0.95
  },
  visible: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      duration: 1,
      ease: "easeOut"
    }
  }
};

// Animation de float (flottement continu)
export const floatingAnimation = {
  y: [-10, 10],
  transition: {
    y: {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut"
    }
  }
};

// Animation de pulse
export const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

// Animation de shimmer/shine
export const shimmerAnimation = {
  backgroundPosition: ["200% 0", "-200% 0"],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "linear"
  }
};
