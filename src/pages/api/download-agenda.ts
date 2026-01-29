import type { APIRoute } from 'astro';
import { db, MemorialContent, eq, and } from 'astro:db';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const serviceIndex = url.searchParams.get('service');

  if (!serviceIndex) {
    return new Response('Missing service parameter', { status: 400 });
  }

  try {
    // Fetch the service data
    const result = await db
      .select()
      .from(MemorialContent)
      .where(
        and(
          eq(MemorialContent.section, 'funeral'),
          eq(MemorialContent.key, `service${serviceIndex}`)
        )
      )
      .get();

    if (!result || !result.value) {
      return new Response('Service not found', { status: 404 });
    }

    const serviceData = JSON.parse(result.value);
    const agendaUrl = serviceData.agendaUrl;
    const serviceType = serviceData.type || 'Service';

    if (!agendaUrl) {
      return new Response('No agenda URL found', { status: 404 });
    }

    // Determine file extension
    const urlLower = agendaUrl.toLowerCase();
    const isPdf = urlLower.includes('.pdf') || urlLower.includes('/raw/upload/');
    const extension = isPdf ? 'pdf' : 'jpg';

    // Generate filename
    const sanitizedServiceType = serviceType.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const filename = `${sanitizedServiceType}-agenda.${extension}`;

    // Fetch the file from Cloudinary
    const fileResponse = await fetch(agendaUrl);

    if (!fileResponse.ok) {
      return new Response('Failed to fetch file', { status: 500 });
    }

    const fileBlob = await fileResponse.blob();

    // Return with proper headers
    return new Response(fileBlob, {
      headers: {
        'Content-Type': isPdf ? 'application/pdf' : 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=86400', // Cache for 1 day
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};
