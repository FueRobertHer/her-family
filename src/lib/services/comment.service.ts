import { db, Comments, MemorialContent, Memorials, eq, and, desc } from 'astro:db';

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
   * Fetch comments and counts for the admin dashboard
   */
  static async getAdminComments(
    memorialIdFilter: number | null,
    statusFilter: string | null,
    limit: number,
    offset: number
  ) {
    // 1. Get counts for all statuses
    const statusRows =
      memorialIdFilter !== null
        ? await db
            .select({ status: Comments.status })
            .from(Comments)
            .where(eq(Comments.memorialId, memorialIdFilter))
        : await db.select({ status: Comments.status }).from(Comments);

    const counts = {
      pending: statusRows.filter((c) => c.status === 'pending').length,
      approved: statusRows.filter((c) => c.status === 'approved').length,
      rejected: statusRows.filter((c) => c.status === 'rejected').length,
      total: statusRows.length,
    };

    // 2. Fetch paginated comments
    const conditions = [];
    if (memorialIdFilter !== null) conditions.push(eq(Comments.memorialId, memorialIdFilter));
    if (statusFilter && statusFilter !== 'all') conditions.push(eq(Comments.status, statusFilter));

    const baseQuery = db.select().from(Comments);
    const pageRows = await (conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery)
      .orderBy(desc(Comments.createdAt))
      .limit(limit)
      .offset(offset);

    // 3. Map to include memorial details
    const memorialRecords = await db.select().from(Memorials);
    const memorialMap = new Map(memorialRecords.map((memorial) => [memorial.id, memorial]));

    const comments = pageRows.map((comment) => {
      const memorial = memorialMap.get(comment.memorialId);
      return {
        ...comment,
        memorialName: memorial?.name || 'Unknown memorial',
        memorialSlug: memorial?.slug || '',
      };
    });

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
      await updateQuery.where(and(eq(Comments.id, commentId), eq(Comments.memorialId, memorialIdFilter)));
    } else {
      await updateQuery.where(eq(Comments.id, commentId));
    }
  }
}
