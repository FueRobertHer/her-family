import { db, MemorialContent, eq, and } from 'astro:db';

export class ContentService {
  /**
   * Retrieves all content rows for a memorial.
   */
  static async getAllContent(memorialId: number) {
    return await db
      .select()
      .from(MemorialContent)
      .where(eq(MemorialContent.memorialId, memorialId));
  }

  /**
   * Upserts content for a memorial section/key.
   */
  static async upsertContent(
    memorialId: number,
    section: string,
    key: string,
    value: string,
    type: string
  ) {
    const existing = await db
      .select()
      .from(MemorialContent)
      .where(
        and(
          eq(MemorialContent.memorialId, memorialId),
          eq(MemorialContent.section, section),
          eq(MemorialContent.key, key)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(MemorialContent)
        .set({
          value: String(value),
          type,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(MemorialContent.id, existing[0].id));
    } else {
      await db.insert(MemorialContent).values({
        memorialId,
        section,
        key,
        value: String(value),
        type,
        updatedAt: new Date().toISOString(),
      });
    }
  }
}
