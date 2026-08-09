import { db, GalleryImages, eq, and } from 'astro:db';

export class GalleryService {
  /**
   * Add a new image to the memorial's gallery.
   */
  static async addImage(
    memorialId: number,
    imagePath: string,
    caption: string,
    displayOrder: number
  ) {
    await db.insert(GalleryImages).values({
      memorialId,
      imagePath,
      caption: caption || '',
      displayOrder: displayOrder || 999,
      isActive: true,
      uploadedAt: new Date().toISOString(),
    });
  }

  /**
   * Delete an image from the gallery.
   */
  static async deleteImage(memorialId: number, imagePath: string) {
    await db
      .delete(GalleryImages)
      .where(and(eq(GalleryImages.imagePath, imagePath), eq(GalleryImages.memorialId, memorialId)));
  }

  /**
   * Update the caption of an existing gallery image.
   * Returns true if an image was updated, false if not found.
   */
  static async updateCaption(memorialId: number, imagePath: string, caption: string) {
    const result = await db
      .update(GalleryImages)
      .set({ caption: caption || '' })
      .where(and(eq(GalleryImages.imagePath, imagePath), eq(GalleryImages.memorialId, memorialId)));

    return result.rowsAffected && result.rowsAffected > 0;
  }

  /**
   * Update the display order of an existing gallery image.
   * Returns true if an image was updated, false if not found.
   */
  static async updateOrder(memorialId: number, imagePath: string, displayOrder: number) {
    const result = await db
      .update(GalleryImages)
      .set({ displayOrder })
      .where(and(eq(GalleryImages.imagePath, imagePath), eq(GalleryImages.memorialId, memorialId)));

    return result.rowsAffected && result.rowsAffected > 0;
  }
}
