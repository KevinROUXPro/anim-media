'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AGReport, AGReportDoc } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, ArrowLeft, FileText, Upload } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export default function AdminDocumentsPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<AGReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReport, setEditingReport] = useState<AGReport | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    pdfFile: null as File | null,
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
    fetchReports();
  }, [user, isAdmin, router]);

  const fetchReports = async () => {
    try {
      const reportsQuery = query(
        collection(db, 'agReports'),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(reportsQuery);
      const reportsData = snapshot.docs.map(doc => {
        const data = doc.data() as AGReportDoc;
        return {
          ...data,
          id: doc.id,
          date: data.date?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as AGReport;
      });
      
      setReports(reportsData);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Erreur lors du chargement des documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setFormData({ ...formData, pdfFile: file });
    } else {
      toast.error('Veuillez sélectionner un fichier PDF');
    }
  };

  const uploadPDF = async (file: File): Promise<{ url: string; fileName: string }> => {
    const fileName = `ag-reports/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    
    return { url, fileName: file.name };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.date) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (!editingReport && !formData.pdfFile) {
      toast.error('Veuillez sélectionner un fichier PDF');
      return;
    }

    setUploading(true);
    try {
      let pdfUrl = editingReport?.pdfUrl || '';
      let fileName = editingReport?.fileName || '';

      // Upload nouveau PDF si fourni
      if (formData.pdfFile) {
        const uploadResult = await uploadPDF(formData.pdfFile);
        pdfUrl = uploadResult.url;
        fileName = uploadResult.fileName;
      }

      const reportDate = new Date(formData.date);
      
      const reportData = {
        title: formData.title,
        description: formData.description,
        date: Timestamp.fromDate(reportDate),
        pdfUrl,
        fileName,
        updatedAt: Timestamp.now(),
      };

      if (editingReport) {
        await updateDoc(doc(db, 'agReports', editingReport.id), reportData);
        toast.success('Document modifié avec succès');
      } else {
        await addDoc(collection(db, 'agReports'), {
          ...reportData,
          createdAt: Timestamp.now(),
        });
        toast.success('Document ajouté avec succès');
      }

      resetForm();
      fetchReports();
    } catch (error) {
      console.error('Error saving report:', error);
      toast.error('Erreur lors de l\'enregistrement du document');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (report: AGReport) => {
    setEditingReport(report);
    setFormData({
      title: report.title,
      description: report.description,
      date: format(report.date, 'yyyy-MM-dd'),
      pdfFile: null,
    });
    setShowForm(true);
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'agReports', reportId));
      toast.success('Document supprimé avec succès');
      fetchReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Erreur lors de la suppression du document');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      pdfFile: null,
    });
    setEditingReport(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.push('/admin')}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Documents</h1>
              <p className="text-gray-600 mt-2">Comptes rendus d'Assemblée Générale</p>
            </div>
            
            {!showForm && (
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-[#DE3156] to-[#F49928]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un document
              </Button>
            )}
          </div>
        </div>

        {/* Formulaire */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingReport ? 'Modifier le document' : 'Nouveau document'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Titre</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Compte rendu AG 2025"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="date">Date de l'AG</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Résumé du contenu du compte rendu..."
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="pdf">
                    Fichier PDF {editingReport && '(laisser vide pour conserver le fichier actuel)'}
                  </Label>
                  <div className="mt-2">
                    <Input
                      id="pdf"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      required={!editingReport}
                    />
                    {formData.pdfFile && (
                      <p className="text-sm text-gray-600 mt-2">
                        Fichier sélectionné : {formData.pdfFile.name}
                      </p>
                    )}
                    {editingReport && !formData.pdfFile && (
                      <p className="text-sm text-gray-600 mt-2">
                        Fichier actuel : {editingReport.fileName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={uploading}
                    className="bg-gradient-to-r from-[#DE3156] to-[#F49928]"
                  >
                    {uploading ? (
                      <>
                        <Upload className="h-4 w-4 mr-2 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      editingReport ? 'Modifier' : 'Ajouter'
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={resetForm}
                    variant="outline"
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Liste des documents */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{report.title}</CardTitle>
                    <p className="text-sm text-gray-500">
                      {format(report.date, 'dd MMMM yyyy', { locale: fr })}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 line-clamp-3">{report.description}</p>
                <p className="text-sm text-gray-500 mb-4">{report.fileName}</p>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => window.open(report.pdfUrl, '_blank')}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Voir
                  </Button>
                  <Button
                    onClick={() => handleEdit(report)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(report.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {reports.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-xl text-gray-600">Aucun document disponible</p>
            <p className="text-gray-500 mt-2">Commencez par ajouter un premier compte rendu</p>
          </div>
        )}
      </div>
    </div>
  );
}
