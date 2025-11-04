'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminContent />
    </ProtectedRoute>
  );
}

function AdminContent() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalWorkshops: 0,
    totalRegistrations: 0,
    upcomingEvents: 0,
    upcomingWorkshops: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const now = Timestamp.now();

        // Compter les utilisateurs
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const totalUsers = usersSnapshot.size;

        // Compter les événements
        const eventsSnapshot = await getDocs(collection(db, 'events'));
        const totalEvents = eventsSnapshot.size;
        const upcomingEventsSnapshot = await getDocs(
          query(collection(db, 'events'), where('date', '>=', now))
        );
        const upcomingEvents = upcomingEventsSnapshot.size;

        // Compter les ateliers
        const workshopsSnapshot = await getDocs(collection(db, 'workshops'));
        const totalWorkshops = workshopsSnapshot.size;
        const upcomingWorkshopsSnapshot = await getDocs(
          query(collection(db, 'workshops'), where('date', '>=', now))
        );
        const upcomingWorkshops = upcomingWorkshopsSnapshot.size;

        // Compter les inscriptions
        const registrationsSnapshot = await getDocs(collection(db, 'registrations'));
        const totalRegistrations = registrationsSnapshot.size;

        setStats({
          totalUsers,
          totalEvents,
          totalWorkshops,
          totalRegistrations,
          upcomingEvents,
          upcomingWorkshops,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold mb-2">Tableau de Bord Admin</h1>
            <p className="text-lg opacity-90">Bienvenue, {user?.name}</p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <StatCard
                title="Utilisateurs"
                value={stats.totalUsers}
                icon="👥"
                color="bg-blue-500"
              />
              <StatCard
                title="Événements à venir"
                value={stats.upcomingEvents}
                subtitle={`sur ${stats.totalEvents} total`}
                icon="🎉"
                color="bg-purple-500"
              />
              <StatCard
                title="Ateliers à venir"
                value={stats.upcomingWorkshops}
                subtitle={`sur ${stats.totalWorkshops} total`}
                icon="🎨"
                color="bg-pink-500"
              />
              <StatCard
                title="Inscriptions totales"
                value={stats.totalRegistrations}
                icon="📝"
                color="bg-green-500"
              />
            </div>
          )}

          {/* Actions rapides */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Gestion</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/admin/evenements">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      🎉 Gérer les Événements
                    </CardTitle>
                    <CardDescription>
                      Créer, modifier et supprimer des événements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">Accéder</Button>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/ateliers">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      🎨 Gérer les Ateliers
                    </CardTitle>
                    <CardDescription>
                      Créer, modifier et supprimer des ateliers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">Accéder</Button>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/utilisateurs">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      👥 Gérer les Utilisateurs
                    </CardTitle>
                    <CardDescription>
                      Promouvoir des admins et gérer les comptes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">Accéder</Button>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, color }: {
  title: string;
  value: number;
  subtitle?: string;
  icon: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            {title}
          </CardTitle>
          <div className={`${color} p-3 rounded-lg text-2xl`}>
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{value}</div>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
