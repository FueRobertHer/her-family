import { db, Memorials, MemorialContent, GalleryImages, Comments, eq, and, desc, asc } from 'astro:db';
import type { Props as FuneralInfoProps } from '../../components/FuneralInfo.astro';

export interface OrganizedContent {
  [section: string]: {
    [key: string]: string;
  };
}

export type ServiceInfo = FuneralInfoProps['services'][number];

export interface MemorialData {
  name: string;
  birthDate: string;
  deathDate: string;
  mainImage: string;
  backgroundImage: string;
  subtitle: string;
  biography: string;
  biographyTitle: string;
  biographyVisible: boolean;
  highlights: string[];
  highlightsVisible: boolean;
  galleryVisible: boolean;
  galleryTitle: string;
  images: Array<{ src: string; alt: string; caption?: string }>;
  videoUrl: string;
  posterImage: string;
  videoSectionTitle: string;
  videoDescription: string;
  videoVisible: boolean;
  commentsTitle: string;
  commentsSubtitle: string;
  commentsVisible: boolean;
  donations: {
    sectionTitle: string;
    venmoUsername: string;
    venmoImage: string;
    cashappUsername: string;
    cashappImage: string;
    zelleEmail: string;
    zelleImage: string;
    customMessage: string;
    visible: boolean;
  };
  funeralInfo: {
    visible: boolean;
    sectionTitle: string;
    subtitle: string;
    services: ServiceInfo[];
    specialInstructionsVisible: boolean;
    flowersInfoVisible: boolean;
    receptionVisible: boolean;
    specialInstructions: string;
    flowersInfo: string;
    receptionInfo?: {
      location: string;
      time: string;
      description?: string;
    };
  };
  footerVisible: boolean;
  footerQuote: string;
  footerCredit: string;
}

/** Parse a JSON content value without letting bad data crash the page render. */
export function parseJsonContent<T>(raw: string | undefined, label: string): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Invalid JSON in memorial content (${label}):`, error);
    return null;
  }
}

export class MemorialService {
  /**
   * Retrieves all memorials regardless of status (Admin only)
   */
  static async getAllMemorialsAdmin() {
    return await db.select().from(Memorials).orderBy(desc(Memorials.updatedAt));
  }

  /**
   * Retrieves all active memorials
   */
  static async getActiveMemorials() {
    return await db.select().from(Memorials).where(eq(Memorials.status, 'active'));
  }

  /**
   * Retrieves content for a specific memorial section
   */
  static async getMemorialContent(memorialId: number, section: string) {
    const rows = await db
      .select()
      .from(MemorialContent)
      .where(and(eq(MemorialContent.memorialId, memorialId), eq(MemorialContent.section, section)));

    return rows.reduce<Record<string, string>>((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
  }

  /**
   * Fetches a memorial by slug and determines if it should be visible based on admin status.
   */
  static async getMemorialBySlug(slug: string, isAdmin: boolean) {
    if (isAdmin) {
      return await db.select().from(Memorials).where(eq(Memorials.slug, slug)).get();
    } else {
      return await db
        .select()
        .from(Memorials)
        .where(and(eq(Memorials.slug, slug), eq(Memorials.status, 'active')))
        .get();
    }
  }

  /**
   * Fetches all content and gallery images for a memorial and formats it into MemorialData.
   */
  static async getMemorialData(memorial: { id: number; name: string }): Promise<MemorialData> {
    const [contentRows, galleryImages] = await Promise.all([
      db.select().from(MemorialContent).where(eq(MemorialContent.memorialId, memorial.id)),
      db
        .select()
        .from(GalleryImages)
        .where(and(eq(GalleryImages.memorialId, memorial.id), eq(GalleryImages.isActive, true)))
        .orderBy(asc(GalleryImages.displayOrder)),
    ]);

    const organizedContent = contentRows.reduce<OrganizedContent>((acc, item) => {
      if (!acc[item.section]) acc[item.section] = {};
      acc[item.section][item.key] = item.value;
      return acc;
    }, {});

    const getContent = (section: string, key: string, fallback: string) =>
      organizedContent[section]?.[key] ?? fallback;

    const services: ServiceInfo[] = [];
    for (let i = 0; i < 10; i++) {
      const service = parseJsonContent<ServiceInfo>(
        organizedContent.funeral?.[`service${i}`],
        `service${i}`
      );
      if (service) services.push(service);
    }

    const defaultData: MemorialData = {
      name: memorial.name || 'Memorial',
      birthDate: '1900-01-01',
      deathDate: '2024-01-01',
      mainImage: '/images/portrait.jpg',
      backgroundImage: '',
      subtitle: 'In loving memory',
      biography: '',
      biographyTitle: 'Life Story',
      biographyVisible: true,
      highlights: [],
      highlightsVisible: true,
      galleryVisible: true,
      galleryTitle: 'Treasured Moments',
      images: [],
      videoUrl: '',
      posterImage: '',
      videoSectionTitle: 'A Life Remembered',
      videoDescription: '',
      videoVisible: true,
      commentsTitle: 'Share Your Memories',
      commentsSubtitle: 'Leave a message to honor their memory.',
      commentsVisible: true,
      donations: {
        sectionTitle: 'Support',
        venmoUsername: '',
        venmoImage: '',
        cashappUsername: '',
        cashappImage: '',
        zelleEmail: '',
        zelleImage: '',
        customMessage: '',
        visible: true,
      },
      funeralInfo: {
        visible: true,
        sectionTitle: 'Service Information',
        subtitle: 'Please join us as we celebrate their life.',
        services: [],
        specialInstructionsVisible: true,
        flowersInfoVisible: true,
        receptionVisible: true,
        specialInstructions: '',
        flowersInfo: '',
      },
      footerVisible: true,
      footerQuote: '',
      footerCredit: '',
    };

    return {
      ...defaultData,
      name: getContent('hero', 'name', memorial.name),
      birthDate: getContent('hero', 'birthDate', defaultData.birthDate),
      deathDate: getContent('hero', 'deathDate', defaultData.deathDate),
      mainImage: getContent('hero', 'mainImage', defaultData.mainImage),
      backgroundImage: getContent('hero', 'backgroundImage', ''),
      subtitle: getContent('hero', 'subtitle', defaultData.subtitle),
      biography: getContent('biography', 'content', defaultData.biography),
      biographyTitle: getContent('biography', 'title', defaultData.biographyTitle),
      biographyVisible: organizedContent.biography?.visible !== 'false',
      highlights:
        parseJsonContent<string[]>(organizedContent.biography?.highlights, 'highlights') ?? [],
      highlightsVisible: organizedContent.highlights?.visible !== 'false',
      galleryVisible: organizedContent.gallery?.visible !== 'false',
      galleryTitle: getContent('gallery', 'sectionTitle', defaultData.galleryTitle),
      images: galleryImages.map((img) => ({
        src: img.imagePath,
        alt: img.caption || 'Memorial photo',
        caption: img.caption || undefined,
      })),
      videoUrl: getContent('video', 'videoUrl', defaultData.videoUrl),
      posterImage: getContent('video', 'posterImage', defaultData.posterImage),
      videoSectionTitle: getContent('video', 'sectionTitle', defaultData.videoSectionTitle),
      videoDescription: getContent('video', 'description', defaultData.videoDescription),
      videoVisible: organizedContent.video?.visible !== 'false',
      commentsTitle: getContent('comments', 'sectionTitle', defaultData.commentsTitle),
      commentsSubtitle: getContent('comments', 'subtitle', defaultData.commentsSubtitle),
      commentsVisible: organizedContent.comments?.visible !== 'false',
      donations: {
        sectionTitle: getContent('donations', 'sectionTitle', defaultData.donations.sectionTitle),
        venmoUsername: getContent('donations', 'venmoUsername', ''),
        venmoImage: getContent('donations', 'venmoImage', ''),
        cashappUsername: getContent('donations', 'cashappUsername', ''),
        cashappImage: getContent('donations', 'cashappImage', ''),
        zelleEmail: getContent('donations', 'zelleEmail', ''),
        zelleImage: getContent('donations', 'zelleImage', ''),
        customMessage: getContent('donations', 'customMessage', ''),
        visible: organizedContent.donations?.visible !== 'false',
      },
      funeralInfo: {
        visible: organizedContent.funeral?.visible !== 'false',
        sectionTitle: getContent('funeral', 'sectionTitle', defaultData.funeralInfo.sectionTitle),
        subtitle: getContent('funeral', 'subtitle', defaultData.funeralInfo.subtitle),
        services,
        specialInstructionsVisible: organizedContent.funeral?.specialInstructionsVisible !== 'false',
        flowersInfoVisible: organizedContent.funeral?.flowersInfoVisible !== 'false',
        receptionVisible: organizedContent.reception?.visible !== 'false',
        specialInstructions: getContent('funeral', 'specialInstructions', ''),
        flowersInfo: getContent('funeral', 'flowersInfo', ''),
        receptionInfo: {
          location: getContent('reception', 'location', ''),
          time: getContent('reception', 'time', ''),
          description: getContent('reception', 'description', ''),
        },
      },
      footerVisible: organizedContent.footer?.visible !== 'false',
      footerQuote: getContent('footer', 'quote', ''),
      footerCredit: getContent('footer', 'credit', ''),
    };
  }

  /**
   * Create a new memorial
   */
  static async createMemorial(name: string, slug: string) {
    const now = new Date().toISOString();
    const result = await db.insert(Memorials).values({
      slug,
      name,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    });
    
    return Number(result.lastInsertRowid);
  }

  /**
   * Update an existing memorial
   */
  static async updateMemorial(id: number, status: string, name: string, slug: string) {
    await db
      .update(Memorials)
      .set({
        status,
        name,
        slug,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(Memorials.id, id));
  }

  /**
   * Permanently delete a memorial and all associated records (cascading delete)
   */
  static async deleteMemorial(id: number) {
    await db.delete(Comments).where(eq(Comments.memorialId, id));
    await db.delete(MemorialContent).where(eq(MemorialContent.memorialId, id));
    await db.delete(GalleryImages).where(eq(GalleryImages.memorialId, id));
    await db.delete(Memorials).where(eq(Memorials.id, id));
  }
}
