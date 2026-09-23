'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Database, Lock, UserCheck, Trash2, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PolitiqueConfidentialitePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-surface via-white to-brand-surface py-12">
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
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
              <div className="flex items-center justify-center mb-3">
                <Shield className="h-12 w-12" />
              </div>
              <CardTitle className="text-3xl font-bold text-center">
                Politique de Confidentialité
              </CardTitle>
              <p className="text-center text-blue-100 mt-2">
                Protection de vos données personnelles - Conforme RGPD
              </p>
            </CardHeader>

            <CardContent className="prose max-w-none space-y-6 mt-6">
              {/* Introduction */}
              <section>
                <p className="text-gray-700 leading-relaxed bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  L'association <strong>Anim'Média La Guerche</strong> attache une grande importance à la protection 
                  de vos données personnelles. Cette politique vous informe sur la manière dont nous collectons, utilisons 
                  et protégeons vos informations, conformément au Règlement Général sur la Protection des Données (RGPD) 
                  et à la loi Informatique et Libertés.
                </p>
              </section>

              {/* Responsable du traitement */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <UserCheck className="h-6 w-6 text-blue-600" />
                  1. Responsable du traitement des données
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="mb-2"><strong>Association :</strong> Anim'Média La Guerche</p>
                  <p className="mb-2"><strong>Adresse :</strong> [ADRESSE À COMPLÉTER]</p>
                  <p className="mb-2"><strong>Email :</strong> [EMAIL À COMPLÉTER]</p>
                  <p className="mb-2"><strong>Représentant légal :</strong> [NOM DU PRÉSIDENT]</p>
                </div>
              </section>

              {/* Données collectées */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Database className="h-6 w-6 text-blue-600" />
                  2. Données personnelles collectées
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">📝 Lors de la création de compte :</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Nom et prénom</li>
                      <li>Adresse email</li>
                      <li>Mot de passe (crypté)</li>
                      <li>Date de création du compte</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">💳 Lors de l'adhésion à l'association :</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Numéro d'adhérent (généré automatiquement)</li>
                      <li>Date de début et de fin d'adhésion</li>
                      <li>Statut d'adhésion (actif/expiré)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">🎯 Lors de l'inscription à des activités :</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Événements et ateliers auxquels vous êtes inscrit</li>
                      <li>Dates d'inscription</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">💡 Lors de la soumission de suggestions :</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                      <li>Contenu de vos suggestions</li>
                      <li>Catégorie et priorité</li>
                      <li>Votes (likes)</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Finalités */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Finalités du traitement</h2>
                <p className="text-gray-700 mb-3">Vos données sont collectées pour les finalités suivantes :</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-semibold mb-2">✅ Gestion des comptes utilisateurs</h4>
                    <p className="text-sm text-gray-700">Authentification et accès sécurisé au site</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-semibold mb-2">📋 Gestion des adhésions</h4>
                    <p className="text-sm text-gray-700">Suivi des adhérents et renouvellements</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                    <h4 className="font-semibold mb-2">🎭 Inscriptions aux activités</h4>
                    <p className="text-sm text-gray-700">Gestion des participants aux événements et ateliers</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                    <h4 className="font-semibold mb-2">📧 Communication</h4>
                    <p className="text-sm text-gray-700">Envoi d'informations sur les activités</p>
                  </div>
                </div>
              </section>

              {/* Base légale */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Base légale du traitement</h2>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-1">✓</span>
                    <span><strong>Consentement :</strong> Vous avez accepté notre politique lors de la création de votre compte</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-1">✓</span>
                    <span><strong>Exécution du contrat :</strong> Gestion de votre adhésion et inscriptions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-1">✓</span>
                    <span><strong>Intérêt légitime :</strong> Amélioration de nos services et activités</span>
                  </li>
                </ul>
              </section>

              {/* Destinataires */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Destinataires des données</h2>
                <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                  <p className="text-gray-700 mb-2">
                    Vos données sont accessibles uniquement :
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Aux administrateurs de l'association (bureau, responsables d'activités)</li>
                    <li>Aux prestataires techniques (hébergement) : Vercel et Google Firebase</li>
                  </ul>
                  <p className="text-gray-700 mt-3 font-semibold">
                    ❌ Vos données ne sont jamais vendues ou transmises à des tiers à des fins commerciales.
                  </p>
                </div>
              </section>

              {/* Durée de conservation */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Durée de conservation</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Type de données</th>
                        <th className="px-4 py-3 text-left font-semibold">Durée</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3">Comptes utilisateurs actifs</td>
                        <td className="px-4 py-3">Durée de la relation + 3 ans</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">Historique d'adhésions</td>
                        <td className="px-4 py-3">3 ans après fin d'adhésion</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">Inscriptions aux activités</td>
                        <td className="px-4 py-3">1 an après l'événement</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">Suggestions</td>
                        <td className="px-4 py-3">Jusqu'à suppression par l'auteur</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Sécurité */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Lock className="h-6 w-6 text-blue-600" />
                  7. Sécurité des données
                </h2>
                <p className="text-gray-700 mb-3">
                  Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données :
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">🔐 Chiffrement</h4>
                    <p className="text-sm text-gray-700">HTTPS, mots de passe hashés avec bcrypt</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">🛡️ Authentification</h4>
                    <p className="text-sm text-gray-700">Firebase Authentication sécurisée</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">🔒 Règles d'accès</h4>
                    <p className="text-sm text-gray-700">Contrôle strict des permissions Firestore</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">💾 Sauvegardes</h4>
                    <p className="text-sm text-gray-700">Backups automatiques quotidiens</p>
                  </div>
                </div>
              </section>

              {/* Vos droits */}
              <section className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. 🎯 Vos droits (RGPD)</h2>
                <p className="text-gray-700 mb-4">
                  Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :
                </p>
                
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <h4 className="font-semibold flex items-center gap-2">
                      <span className="text-blue-600">👁️</span> Droit d'accès
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">Consulter vos données dans votre profil</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <h4 className="font-semibold flex items-center gap-2">
                      <span className="text-blue-600">✏️</span> Droit de rectification
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">Modifier vos informations personnelles</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Trash2 className="h-4 w-4 text-blue-600" />
                      Droit à l'effacement
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">Supprimer votre compte et vos données</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Download className="h-4 w-4 text-blue-600" />
                      Droit à la portabilité
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">Récupérer vos données</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <h4 className="font-semibold flex items-center gap-2">
                      <span className="text-blue-600">⛔</span> Droit d'opposition
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">Vous opposer à certains traitements</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <h4 className="font-semibold flex items-center gap-2">
                      <span className="text-blue-600">⏸️</span> Droit à la limitation
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">Limiter le traitement de vos données</p>
                  </div>
                </div>

                <div className="mt-4 bg-white p-4 rounded-lg border-l-4 border-blue-600">
                  <h4 className="font-semibold mb-2">📧 Comment exercer vos droits ?</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• <strong>Suppression de compte :</strong> Directement depuis votre page Profil</li>
                    <li>• <strong>Modification :</strong> Depuis votre page Profil</li>
                    <li>• <strong>Autre demande :</strong> Contactez-nous à [EMAIL À COMPLÉTER]</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-2 italic">
                    Nous nous engageons à répondre à votre demande sous 1 mois maximum.
                  </p>
                </div>
              </section>

              {/* Cookies */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Cookies</h2>
                <p className="text-gray-700 mb-3">
                  Ce site utilise uniquement des cookies strictement nécessaires à son fonctionnement :
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Cookies d'authentification Firebase :</strong> Pour maintenir votre session connectée</li>
                  <li><strong>Cookies de sécurité :</strong> Protection contre les attaques CSRF</li>
                </ul>
                <p className="text-gray-700 mt-3 bg-green-50 p-3 rounded-lg">
                  ✅ <strong>Aucun cookie publicitaire ou de tracking</strong> n'est utilisé sur ce site.
                </p>
              </section>

              {/* Modifications */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">10. Modifications de cette politique</h2>
                <p className="text-gray-700">
                  Cette politique de confidentialité peut être mise à jour. Nous vous informerons de tout changement 
                  significatif par email ou via une notification sur le site.
                </p>
              </section>

              {/* Réclamation CNIL */}
              <section className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">11. Droit de réclamation</h2>
                <p className="text-gray-700 mb-3">
                  Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation 
                  auprès de la CNIL :
                </p>
                <div className="bg-white p-4 rounded">
                  <p className="mb-1"><strong>Commission Nationale de l'Informatique et des Libertés (CNIL)</strong></p>
                  <p className="text-sm text-gray-700">3 Place de Fontenoy - TSA 80715</p>
                  <p className="text-sm text-gray-700">75334 PARIS CEDEX 07</p>
                  <p className="text-sm text-gray-700">Téléphone : 01 53 73 22 22</p>
                  <p className="text-sm text-gray-700">
                    Site web : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.cnil.fr</a>
                  </p>
                </div>
              </section>

              {/* Contact */}
              <section className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">📧 Nous contacter</h2>
                <p className="text-gray-700 mb-2">
                  Pour toute question concernant cette politique de confidentialité ou vos données personnelles :
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
