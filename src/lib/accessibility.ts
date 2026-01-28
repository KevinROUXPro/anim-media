/**
 * Utilitaires pour améliorer l'accessibilité
 */

// Gestion du focus pour la navigation au clavier
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  function handleTab(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  }

  element.addEventListener('keydown', handleTab);
  firstElement?.focus();

  return () => {
    element.removeEventListener('keydown', handleTab);
  };
}

// Annoncer les changements aux lecteurs d'écran
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Vérifier si l'utilisateur préfère réduire les animations
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Gérer le focus visible pour la navigation au clavier
export function setupKeyboardNavigation() {
  let isUsingKeyboard = false;

  document.addEventListener('keydown', () => {
    isUsingKeyboard = true;
    document.body.classList.add('keyboard-navigation');
  });

  document.addEventListener('mousedown', () => {
    isUsingKeyboard = false;
    document.body.classList.remove('keyboard-navigation');
  });
}

// Initialiser au chargement
if (typeof window !== 'undefined') {
  setupKeyboardNavigation();
}
