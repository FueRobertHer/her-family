import type { APIRoute } from 'astro';
import { getMemorialBySlug } from '../../lib/memorial-context';
import { isAuthenticated } from '../../lib/auth';
import { ContentService } from '../../lib/services/content.service.ts';

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies }) => {
  const url = new URL(request.url);
  const serviceIndex = url.searchParams.get('service');
  const memorialSlug = url.searchParams.get('memorial')?.trim() || '';

  if (!serviceIndex || !memorialSlug) {
    return new Response('Missing service or memorial parameter', { status: 400 });
  }

  const memorial = await getMemorialBySlug(memorialSlug, {
    includeHidden: isAuthenticated(cookies),
  });
  if (!memorial) {
    return new Response('Memorial not found', { status: 404 });
  }

  try {
    // Fetch the service data
    const result = await ContentService.getContentItem(
      memorial.id,
      'funeral',
      `service${serviceIndex}`
    );

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
