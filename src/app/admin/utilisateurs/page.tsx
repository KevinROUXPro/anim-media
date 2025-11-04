'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, UserRole } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { ArrowLeft, Shield, User as UserIcon } from 'lucide-react';

export default function AdminUsersPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!isAdmin) {
      router.push('/');
      return;
    }
    fetchUsers();
  }, [user, isAdmin, router]);

  const fetchUsers = async () => {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(usersQuery);
      const usersData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt.toDate(),
      })) as User[];
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (userId: string, currentRole: UserRole) => {
    if (userId === user?.id) {
      toast.error('Vous ne pouvez pas modifier votre propre rôle');
      return;
    }

    const newRole = currentRole === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN;
    const action = newRole === UserRole.ADMIN ? 'promouvoir en administrateur' : 'rétrograder en utilisateur';

    if (!confirm(`Êtes-vous sûr de vouloir ${action} cet utilisateur ?`)) {
      return;
    }

    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
      });
      
      toast.success(
        newRole === UserRole.ADMIN 
          ? 'Utilisateur promu administrateur' 
          : 'Utilisateur rétrogradé'
      );
      
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Erreur lors de la modification du rôle');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/admin')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Total Utilisateurs</p>
                <p className="text-3xl font-bold text-blue-900">{users.length}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Administrateurs</p>
                <p className="text-3xl font-bold text-purple-900">
                  {users.filter(u => u.role === UserRole.ADMIN).length}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Utilisateurs</p>
                <p className="text-3xl font-bold text-green-900">
                  {users.filter(u => u.role === UserRole.USER).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4">
          {users.map((u) => (
            <Card key={u.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {u.role === UserRole.ADMIN ? (
                        <Shield className="h-5 w-5 text-purple-600" />
                      ) : (
                        <UserIcon className="h-5 w-5 text-gray-400" />
                      )}
                      <h3 className="text-xl font-bold text-gray-900">{u.name}</h3>
                      {u.id === user?.id && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          Vous
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>📧 {u.email}</p>
                      <p>📅 Inscrit le {format(u.createdAt, "d MMMM yyyy 'à' HH:mm", { locale: fr })}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <span 
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        u.role === UserRole.ADMIN 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {u.role === UserRole.ADMIN ? '👑 Administrateur' : '👤 Utilisateur'}
                    </span>
                    {u.id !== user?.id && (
                      <Button
                        size="sm"
                        variant={u.role === UserRole.ADMIN ? 'outline' : 'default'}
                        onClick={() => toggleAdmin(u.id, u.role)}
                      >
                        {u.role === UserRole.ADMIN ? 'Rétrograder' : 'Promouvoir Admin'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {users.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                Aucun utilisateur trouvé
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
