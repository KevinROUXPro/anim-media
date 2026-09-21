import { getBlob, ref } from 'firebase/storage';
import { storage } from '@/lib/firebase';

/**
 * Accès aux comptes rendus d'AG, réservés aux adhérents à jour.
 *
 * Ces PDF ne doivent JAMAIS être exposés via getDownloadURL : l'URL produite
 * embarque un jeton d'accès permanent qui contourne les règles Storage et
 * reste valable pour quiconque la récupère. On passe donc par getBlob(), qui
 * est soumis aux règles et vérifie l'adhésion à chaque téléchargement.
 *
 * L'URL retournée est un blob local, valable uniquement dans l'onglet courant.
 * Elle doit être libérée avec releaseReportUrl() une fois l'aperçu fermé.
 */
export async function getReportObjectUrl(storagePath: string): Promise<string> {
  const blob = await getBlob(ref(storage, storagePath));
  return URL.createObjectURL(blob);
}

export function releaseReportUrl(objectUrl: string | null | undefined): void {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Déclenche le téléchargement du PDF sous son nom d'origine.
 */
export async function downloadReport(storagePath: string, fileName: string): Promise<void> {
  const objectUrl = await getReportObjectUrl(storagePath);
  try {
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName || 'compte-rendu.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    releaseReportUrl(objectUrl);
  }
}
