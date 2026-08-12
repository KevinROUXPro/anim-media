function formatICSDate(date: Date): string {
  return date.toISOString().replace(/-|:|\.\d+/g, '');
}

/**
 * Génère le lien Google Calendar direct pour un événement ou un atelier
 */
export function getGoogleCalendarUrl(activity: { title: string; description: string; location?: string; date?: Date; startTime?: string; endTime?: string }): string {
  const title = encodeURIComponent(activity.title);
  const details = encodeURIComponent(activity.description);
  const location = encodeURIComponent(activity.location || "Anim'Media");

  let startDate = activity.date || new Date();
  let endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2h par défaut

  if (activity.startTime && activity.endTime) {
    const [startH, startM] = activity.startTime.split(':').map(Number);
    const [endH, endM] = activity.endTime.split(':').map(Number);
    
    startDate = new Date(startDate);
    startDate.setHours(startH, startM, 0, 0);

    endDate = new Date(startDate);
    endDate.setHours(endH, endM, 0, 0);
  }

  const startFormatted = formatICSDate(startDate);
  const endFormatted = formatICSDate(endDate);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startFormatted}/${endFormatted}`;
}

/**
 * Génère et déclenche le téléchargement d'un fichier .ics
 */
export function downloadICSFile(activity: { title: string; description: string; location?: string; date?: Date; startTime?: string; endTime?: string }): void {
  const title = activity.title;
  const description = activity.description.replace(/\n/g, '\\n');
  const location = activity.location || "Anim'Media";

  let startDate = activity.date || new Date();
  let endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

  if (activity.startTime && activity.endTime) {
    const [startH, startM] = activity.startTime.split(':').map(Number);
    const [endH, endM] = activity.endTime.split(':').map(Number);
    
    startDate = new Date(startDate);
    startDate.setHours(startH, startM, 0, 0);

    endDate = new Date(startDate);
    endDate.setHours(endH, endM, 0, 0);
  }

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AnimMedia//Activites//FR',
    'BEGIN:VEVENT',
    `UID:animmedia-${Date.now()}@animmedia.fr`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
