import { db, Memorials, eq } from 'astro:db';

export interface MemorialRecord {
  id: number;
  slug: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export async function getMemorialBySlug(slug: string): Promise<MemorialRecord | null> {
  if (!slug) return null;
  const memorial = await db.select().from(Memorials).where(eq(Memorials.slug, slug)).get();
  return (memorial as MemorialRecord | undefined) ?? null;
}

export async function getActiveMemorials(): Promise<MemorialRecord[]> {
  const memorials = await db
    .select()
    .from(Memorials)
    .where(eq(Memorials.status, 'active'));
  return memorials as MemorialRecord[];
}

export async function getDefaultMemorial(): Promise<MemorialRecord | null> {
  const memorials = await getActiveMemorials();
  return memorials[0] ?? null;
}
