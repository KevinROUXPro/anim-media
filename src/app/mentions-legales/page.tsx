'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { THEME_CLASSES } from '@/config/theme';

export default function MentionsLegalesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7EDE0] via-white to-[#F7EDE0] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center">
                Mentions Légales
              </CardTitle>
              <p className="text-center text-gray-600 mt-2">
                Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique
              </p>
            </CardHeader>

            <CardContent className="prose max-w-none space-y-6">
              {/* Éditeur du site */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Éditeur du site</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="mb-2"><strong>Nom de l'association :</strong> Anim'Média La Guerche</p>
                  <p className="mb-2"><strong>Forme juridique :</strong> Association loi 1901</p>
                  <p className="mb-2"><strong>Siège social :</strong> [ADRESSE À COMPLÉTER]</p>
                  <p className="mb-2"><strong>Email :</strong> [EMAIL À COMPLÉTER]</p>
                  <p className="mb-2"><strong>Téléphone :</strong> [TÉLÉPHONE À COMPLÉTER]</p>
                  <p className="mb-2"><strong>Numéro RNA :</strong> [NUMÉRO RNA À COMPLÉTER si applicable]</p>
                  <p className="mb-2"><strong>Numéro SIRET :</strong> [SIRET À COMPLÉTER si applicable]</p>
                </div>
              </section>

              {/* Directeur de publication */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Directeur de la publication</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="mb-2"><strong>Nom :</strong> [NOM DU PRÉSIDENT OU RESPONSABLE]</p>
                  <p className="mb-2"><strong>Qualité :</strong> Président(e) de l'association</p>
                </div>
              </section>

              {/* Hébergement */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Hébergement</h2>
                
                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2">Hébergement du site web :</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="mb-2"><strong>Hébergeur :</strong> Vercel Inc.</p>
                    <p className="mb-2"><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
                    <p className="mb-2"><strong>Site web :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://vercel.com</a></p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Hébergement des données :</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="mb-2"><strong>Service :</strong> Google Firebase (Google Cloud Platform)</p>
                    <p className="mb-2"><strong>Société :</strong> Google LLC</p>
                    <p className="mb-2"><strong>Adresse :</strong> 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA</p>
                    <p className="mb-2"><strong>Localisation des serveurs :</strong> europe-west1 (Belgique)</p>
                  </div>
                </div>
              </section>

              {/* Propriété intellectuelle */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Propriété intellectuelle</h2>
                <p className="text-gray-700 leading-relaxed">
                  L'ensemble du contenu de ce site (textes, images, logos, vidéos, structure du site) est la propriété exclusive 
                  de l'association Anim'Média La Guerche, sauf mentions contraires. Toute reproduction, distribution, modification, 
                  adaptation, retransmission ou publication de ces différents éléments est strictement interdite sans l'accord 
                  écrit de l'association.
                </p>
              </section>

              {/* Données personnelles */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Protection des données personnelles</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, 
                  vous disposez de droits sur vos données personnelles.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Pour plus d'informations sur la collecte et le traitement de vos données personnelles, consultez notre{' '}
                  <a href="/politique-confidentialite" className="text-blue-600 hover:underline font-semibold">
                    Politique de confidentialité
                  </a>.
                </p>
              </section>

              {/* Cookies */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Cookies</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Ce site utilise des cookies strictement nécessaires à son fonctionnement technique, notamment pour :
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>La gestion de l'authentification des utilisateurs</li>
                  <li>La sécurité des sessions</li>
                  <li>Les préférences d'affichage</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-3">
                  Ces cookies essentiels ne nécessitent pas de consentement préalable. Aucun cookie de traçage publicitaire 
                  n'est utilisé sur ce site.
                </p>
              </section>

              {/* Responsabilité */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Limitation de responsabilité</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  L'association Anim'Média La Guerche s'efforce d'assurer l'exactitude et la mise à jour des informations 
                  diffusées sur ce site. Toutefois, elle ne peut garantir l'exactitude, la précision ou l'exhaustivité 
                  des informations mises à disposition.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  L'association ne pourra être tenue responsable des dommages directs ou indirects résultant de l'accès 
                  ou de l'utilisation du site.
                </p>
              </section>

              {/* Droit applicable */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Droit applicable</h2>
                <p className="text-gray-700 leading-relaxed">
                  Les présentes mentions légales sont régies par le droit français. En cas de litige et à défaut d'accord 
                  amiable, le litige sera porté devant les tribunaux français conformément aux règles de compétence en vigueur.
                </p>
              </section>

              {/* Contact */}
              <section className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">📧 Nous contacter</h2>
                <p className="text-gray-700 leading-relaxed mb-2">
                  Pour toute question concernant ces mentions légales ou pour exercer vos droits :
                </p>
                <p className="text-gray-700">
                  <strong>Email :</strong> [EMAIL DE CONTACT À COMPLÉTER]
                </p>
              </section>

              {/* Date de mise à jour */}
              <section className="text-center pt-6 border-t">
                <p className="text-sm text-gray-500">
                  Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </section>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
