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
   * Retrieves a specific content row for a memorial section/key.
   */
  static async getContentItem(memorialId: number, section: string, key: string) {
    return await db
      .select()
      .from(MemorialContent)
      .where(
        and(
          eq(MemorialContent.memorialId, memorialId),
          eq(MemorialContent.section, section),
          eq(MemorialContent.key, key)
        )
      )
      .get();
  }

  /**
   * Upserts several content rows in one atomic batch.
   *
   * Relies on the (memorialId, section, key) unique index so each row is a
   * single INSERT ... ON CONFLICT DO UPDATE rather than a read followed by a
   * write. db.batch wraps them in one transaction: a section save now either
   * lands completely or not at all.
   */
  static async upsertManyContent(
    memorialId: number,
    updates: Array<{ section: string; key: string; value: string; type: string }>
  ) {
    if (updates.length === 0) return;

    const updatedAt = new Date().toISOString();

    const statements = updates.map((update) =>
      db
        .insert(MemorialContent)
        .values({
          memorialId,
          section: update.section,
          key: update.key,
          value: String(update.value),
          type: update.type,
          updatedAt,
        })
        .onConflictDoUpdate({
          target: [MemorialContent.memorialId, MemorialContent.section, MemorialContent.key],
          set: { value: String(update.value), type: update.type, updatedAt },
        })
    );

    // db.batch requires a non-empty tuple; the guard above ensures that.
    await db.batch(statements as [(typeof statements)[number], ...typeof statements]);
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
