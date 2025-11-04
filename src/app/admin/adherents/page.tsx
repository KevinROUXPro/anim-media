'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, MembershipStatus, MEMBERSHIP_LABELS } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, addYears, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { ArrowLeft, UserCheck, UserX, RefreshCw } from 'lucide-react';

export default function AdminMembershipsPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<MembershipStatus | 'ALL'>('ALL');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [membershipForm, setMembershipForm] = useState({
    membershipNumber: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    duration: 1, // années
  });

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
      const usersData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt.toDate(),
          membershipExpiry: data.membershipExpiry?.toDate(),
          membershipStartDate: data.membershipStartDate?.toDate(),
        };
      }) as User[];
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const activateMembership = async (userId: string) => {
    const startDate = new Date(membershipForm.startDate);
    const expiryDate = addYears(startDate, membershipForm.duration);
    
    try {
      await updateDoc(doc(db, 'users', userId), {
        membershipStatus: MembershipStatus.ACTIVE,
        membershipNumber: membershipForm.membershipNumber || `ADH-${Date.now()}`,
        membershipStartDate: Timestamp.fromDate(startDate),
        membershipExpiry: Timestamp.fromDate(expiryDate),
      });
      
      toast.success('Adhésion activée avec succès');
      setEditingUserId(null);
      setMembershipForm({ membershipNumber: '', startDate: format(new Date(), 'yyyy-MM-dd'), duration: 1 });
      fetchUsers();
    } catch (error) {
      console.error('Error activating membership:', error);
      toast.error('Erreur lors de l\'activation');
    }
  };

  const renewMembership = async (userId: string, currentExpiry?: Date) => {
    const startDate = currentExpiry && !isBefore(currentExpiry, new Date()) 
      ? currentExpiry 
      : new Date();
    const expiryDate = addYears(startDate, 1);
    
    try {
      await updateDoc(doc(db, 'users', userId), {
        membershipStatus: MembershipStatus.ACTIVE,
        membershipExpiry: Timestamp.fromDate(expiryDate),
      });
      
      toast.success('Adhésion renouvelée avec succès');
      fetchUsers();
    } catch (error) {
      console.error('Error renewing membership:', error);
      toast.error('Erreur lors du renouvellement');
    }
  };

  const deactivateMembership = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir désactiver cette adhésion ?')) {
      return;
    }

    try {
      await updateDoc(doc(db, 'users', userId), {
        membershipStatus: MembershipStatus.NONE,
      });
      
      toast.success('Adhésion désactivée');
      fetchUsers();
    } catch (error) {
      console.error('Error deactivating membership:', error);
      toast.error('Erreur lors de la désactivation');
    }
  };

  const filteredUsers = filter === 'ALL' 
    ? users 
    : users.filter(u => u.membershipStatus === filter);

  const stats = {
    total: users.length,
    active: users.filter(u => u.membershipStatus === MembershipStatus.ACTIVE).length,
    expired: users.filter(u => u.membershipStatus === MembershipStatus.EXPIRED).length,
    none: users.filter(u => u.membershipStatus === MembershipStatus.NONE).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Adhérents</h1>
          </div>
        </div>

        {/* Statistiques */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Statistiques des Adhésions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Total Utilisateurs</p>
                <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Adhérents Actifs</p>
                <p className="text-3xl font-bold text-green-900">{stats.active}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-orange-600 font-medium">Adhésions Expirées</p>
                <p className="text-3xl font-bold text-orange-900">{stats.expired}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="text-sm text-gray-600 font-medium">Non Adhérents</p>
                <p className="text-3xl font-bold text-gray-900">{stats.none}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filtres */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filter === 'ALL' ? 'default' : 'outline'}
                onClick={() => setFilter('ALL')}
              >
                Tous ({users.length})
              </Button>
              <Button
                variant={filter === MembershipStatus.ACTIVE ? 'default' : 'outline'}
                onClick={() => setFilter(MembershipStatus.ACTIVE)}
                className={filter === MembershipStatus.ACTIVE ? 'bg-green-600' : ''}
              >
                ✅ Actifs ({stats.active})
              </Button>
              <Button
                variant={filter === MembershipStatus.EXPIRED ? 'default' : 'outline'}
                onClick={() => setFilter(MembershipStatus.EXPIRED)}
                className={filter === MembershipStatus.EXPIRED ? 'bg-orange-600' : ''}
              >
                ⏰ Expirés ({stats.expired})
              </Button>
              <Button
                variant={filter === MembershipStatus.NONE ? 'default' : 'outline'}
                onClick={() => setFilter(MembershipStatus.NONE)}
                className={filter === MembershipStatus.NONE ? 'bg-gray-600' : ''}
              >
                ❌ Non adhérents ({stats.none})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Liste des utilisateurs */}
        <div className="grid grid-cols-1 gap-4">
          {filteredUsers.map((u) => {
            const membershipInfo = MEMBERSHIP_LABELS[u.membershipStatus];
            const isExpired = u.membershipExpiry && isBefore(u.membershipExpiry, new Date());
            
            return (
              <Card key={u.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{u.name}</h3>
                        <span 
                          className={`px-3 py-1 rounded-full text-sm font-medium bg-${membershipInfo.color}-100 text-${membershipInfo.color}-700`}
                        >
                          {membershipInfo.label}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>📧 {u.email}</p>
                        {u.membershipNumber && (
                          <p>🎫 Numéro d'adhérent : <strong>{u.membershipNumber}</strong></p>
                        )}
                        {u.membershipStartDate && (
                          <p>📅 Début : {format(u.membershipStartDate, "d MMMM yyyy", { locale: fr })}</p>
                        )}
                        {u.membershipExpiry && (
                          <p className={isExpired ? 'text-orange-600 font-semibold' : ''}>
                            ⏰ Expire le : {format(u.membershipExpiry, "d MMMM yyyy", { locale: fr })}
                            {isExpired && ' (Expiré)'}
                          </p>
                        )}
                      </div>

                      {/* Formulaire d'activation */}
                      {editingUserId === u.id && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                          <div>
                            <Label>Numéro d'adhérent (optionnel)</Label>
                            <Input
                              value={membershipForm.membershipNumber}
                              onChange={(e) => setMembershipForm({ ...membershipForm, membershipNumber: e.target.value })}
                              placeholder="ADH-2025-001"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>Date de début</Label>
                              <Input
                                type="date"
                                value={membershipForm.startDate}
                                onChange={(e) => setMembershipForm({ ...membershipForm, startDate: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label>Durée (années)</Label>
                              <Input
                                type="number"
                                min="1"
                                value={membershipForm.duration}
                                onChange={(e) => setMembershipForm({ ...membershipForm, duration: parseInt(e.target.value) })}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => activateMembership(u.id)}>
                              Activer
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingUserId(null)}>
                              Annuler
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      {u.membershipStatus === MembershipStatus.NONE ? (
                        <Button
                          size="sm"
                          onClick={() => setEditingUserId(u.id)}
                          className="bg-green-600"
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Activer adhésion
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => renewMembership(u.id, u.membershipExpiry)}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Renouveler 1 an
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deactivateMembership(u.id)}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Désactiver
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredUsers.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                Aucun utilisateur dans cette catégorie
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
