'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AGReport, AGReportDoc, MembershipStatus } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { THEME_CLASSES } from '@/config/theme';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';
import { FileText, Calendar, Download, Eye } from 'lucide-react';
import { downloadReport, getReportObjectUrl, releaseReportUrl } from '@/lib/ag-reports';
import { toast } from 'sonner';

export default function VieAssociativePage() {
  return (
    <ProtectedRoute requireMembership>
      <VieAssociativeContent />
    </ProtectedRoute>
  );
}

function VieAssociativeContent() {
  const { user } = useAuth();
  const [reports, setReports] = useState<AGReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<AGReport | null>(null);
  // Les PDF sont recuperes via le SDK (getBlob), soumis aux regles Storage,
  // puis affiches depuis une URL blob locale valable le temps de l'apercu.
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const openPreview = async (report: AGReport) => {
    setSelectedReport(report);
    setPreviewLoading(true);
    try {
      const url = await getReportObjectUrl(report.storagePath);
      setPreviewUrl(url);
    } catch (error) {
      console.error("Erreur lors de l'ouverture du compte rendu:", error);
      toast.error("Impossible d'ouvrir ce compte rendu");
      setSelectedReport(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    releaseReportUrl(previewUrl);
    setPreviewUrl(null);
    setSelectedReport(null);
  };

  // Liberer le blob si la page est quittee avec l'apercu ouvert.
  useEffect(() => {
    return () => releaseReportUrl(previewUrl);
  }, [previewUrl]);

  useEffect(() => {
    async function fetchReports() {
      if (!user || user.membershipStatus !== MembershipStatus.ACTIVE) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const reportsQuery = query(
          collection(db, 'agReports'),
          orderBy('date', 'desc')
        );
        const reportsSnapshot = await getDocs(reportsQuery);
        
        const reportsData = reportsSnapshot.docs.map(doc => {
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
        console.error('Erreur lors de la récupération des comptes rendus:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7EDE0]/30 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Header */}
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h1 className={`text-4xl md:text-5xl font-bold ${THEME_CLASSES.textGradient} mb-4`}>
              Vie Associative
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Retrouvez ici tous les comptes rendus des Assemblées Générales de l&apos;association
            </p>
          </motion.div>

          {/* Liste des comptes rendus */}
          {reports.length === 0 ? (
            <motion.div variants={fadeInUp}>
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-xl text-gray-600">
                    Aucun compte rendu disponible pour le moment
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainer}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {reports.map((report) => (
                <motion.div key={report.id} variants={staggerItem}>
                  <Card className={`h-full ${THEME_CLASSES.cardHover} transition-all duration-300`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{report.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4" />
                            {format(report.date, 'dd MMMM yyyy', { locale: fr })}
                          </CardDescription>
                        </div>
                        <FileText className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 line-clamp-3">{report.description}</p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => openPreview(report)}
                          className={THEME_CLASSES.buttonPrimary}
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Consulter
                        </Button>
                        <Button
                          onClick={async () => {
                            try {
                              await downloadReport(report.storagePath, report.fileName);
                            } catch (error) {
                              console.error('Erreur lors du téléchargement:', error);
                              toast.error('Impossible de télécharger ce compte rendu');
                            }
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Modal de visualisation PDF */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="text-2xl font-bold">{selectedReport.title}</h2>
                <p className="text-sm text-gray-600">
                  {format(selectedReport.date, 'dd MMMM yyyy', { locale: fr })}
                </p>
              </div>
              <Button
                onClick={closePreview}
                variant="outline"
                size="sm"
              >
                Fermer
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              {previewLoading || !previewUrl ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className={`animate-spin rounded-full h-12 w-12 border-4 border-t-transparent ${THEME_CLASSES.borderPrimary}`} />
                </div>
              ) : (
                <iframe
                  src={previewUrl}
                  className="w-full h-full"
                  title={selectedReport.title}
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
