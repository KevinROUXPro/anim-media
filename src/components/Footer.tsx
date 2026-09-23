import Link from 'next/link';

export function Footer() {
  return (
    <footer className="site-footer">
      <div><strong className="brand-wordmark">anim<span>’Média</span></strong><span>Association culturelle · La Guerche</span></div>
      <nav aria-label="Informations complémentaires">
        <Link href="/vie-associative">Vie associative</Link>
        <Link href="/mentions-legales">Mentions légales</Link>
        <Link href="/politique-confidentialite">Confidentialité</Link>
      </nav>
      <small>© {new Date().getFullYear()} Anim’Média</small>
    </footer>
  );
}
