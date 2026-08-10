import { db, Comments, MemorialContent, Memorials, eq, and, desc, count } from 'astro:db';

export class CommentService {
  /**
   * Fetch approved comments for a public memorial page
   */
  static async getApprovedComments(memorialId: number, limit: number, offset: number) {
    return await db
      .select()
      .from(Comments)
      .where(and(eq(Comments.status, 'approved'), eq(Comments.memorialId, memorialId)))
      .orderBy(desc(Comments.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Check if comments should be auto-approved for a specific memorial
   */
  static async getAutoApproveSetting(memorialId: number): Promise<boolean> {
    try {
      const settings = await db
        .select()
        .from(MemorialContent)
        .where(
          and(
            eq(MemorialContent.memorialId, memorialId),
            eq(MemorialContent.section, 'comments'),
            eq(MemorialContent.key, 'autoApprove')
          )
        );

      return settings.length > 0 && settings[0].value === 'true';
    } catch (error) {
      console.error('Error checking auto-approve setting:', error);
      return false; // Default to pending on error
    }
  }

  /**
   * Create a new comment
   */
  static async createComment(data: {
    memorialId: number;
    name: string;
    email?: string | null;
    relationship?: string | null;
    message: string;
    imageUrl?: string | null;
    status: 'pending' | 'approved';
  }) {
    const now = new Date().toISOString();
    const result = await db.insert(Comments).values({
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return Number(result.lastInsertRowid);
  }

  /**
   * Fetch comments and counts for the admin dashboard.
   *
   * Counts come from a GROUP BY and the memorial name from a join. The previous
   * version pulled every comment row to tally statuses in JS and every memorial
   * to build a lookup map, so both grew with the table rather than the page.
   */
  static async getAdminComments(
    memorialIdFilter: number | null,
    statusFilter: string | null,
    limit: number,
    offset: number
  ) {
    const memorialCondition =
      memorialIdFilter !== null ? eq(Comments.memorialId, memorialIdFilter) : undefined;

    // 1. Counts per status, computed by the database.
    const countQuery = db
      .select({ status: Comments.status, total: count() })
      .from(Comments)
      .groupBy(Comments.status);

    const countRows = await (memorialCondition ? countQuery.where(memorialCondition) : countQuery);

    const counts = { pending: 0, approved: 0, rejected: 0, total: 0 };
    for (const row of countRows) {
      const total = Number(row.total) || 0;
      counts.total += total;
      if (row.status === 'pending' || row.status === 'approved' || row.status === 'rejected') {
        counts[row.status] += total;
      }
    }

    // 2. One page of comments, with their memorial joined in.
    const conditions = [];
    if (memorialCondition) conditions.push(memorialCondition);
    if (statusFilter && statusFilter !== 'all') conditions.push(eq(Comments.status, statusFilter));

    const pageQuery = db
      .select({
        id: Comments.id,
        memorialId: Comments.memorialId,
        name: Comments.name,
        email: Comments.email,
        relationship: Comments.relationship,
        message: Comments.message,
        imageUrl: Comments.imageUrl,
        status: Comments.status,
        createdAt: Comments.createdAt,
        updatedAt: Comments.updatedAt,
        memorialName: Memorials.name,
        memorialSlug: Memorials.slug,
      })
      .from(Comments)
      .leftJoin(Memorials, eq(Comments.memorialId, Memorials.id));

    const rows = await (conditions.length > 0 ? pageQuery.where(and(...conditions)) : pageQuery)
      .orderBy(desc(Comments.createdAt))
      .limit(limit)
      .offset(offset);

    const comments = rows.map((row) => ({
      ...row,
      memorialName: row.memorialName ?? 'Unknown memorial',
      memorialSlug: row.memorialSlug ?? '',
    }));

    return { comments, counts };
  }

  /**
   * Update the status of a comment (approve/reject)
   */
  static async updateCommentStatus(
    commentId: number,
    memorialIdFilter: number | null,
    status: 'approved' | 'rejected'
  ) {
    const now = new Date().toISOString();
    const updateQuery = db.update(Comments).set({ status, updatedAt: now });

    if (memorialIdFilter !== null) {
      await updateQuery.where(
        and(eq(Comments.id, commentId), eq(Comments.memorialId, memorialIdFilter))
      );
    } else {
      await updateQuery.where(eq(Comments.id, commentId));
    }
  }
}
