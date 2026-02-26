import { defineDb, defineTable, column } from 'astro:db';

export const Memorials = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    slug: column.text(),
    name: column.text(),
    status: column.text({ default: 'active' }),
    createdAt: column.text(),
    updatedAt: column.text(),
  },
  indexes: {
    slug_idx: { on: ['slug'], unique: true },
    memorials_status_idx: { on: ['status'], unique: false },
  },
});

export const Comments = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    memorialId: column.number(),
    name: column.text(),
    email: column.text({ optional: true }),
    relationship: column.text({ optional: true }), // e.g., "Friend", "Student", "Colleague"
    message: column.text(),
    imageUrl: column.text({ optional: true }), // Optional image attachment
    status: column.text({ default: 'pending' }), // 'pending', 'approved', 'rejected'
    createdAt: column.text(), // Must be set explicitly in application code
    updatedAt: column.text(), // Must be set explicitly in application code
  },
  indexes: {
    memorial_status_idx: { on: ['memorialId', 'status'], unique: false },
    memorial_created_idx: { on: ['memorialId', 'createdAt'], unique: false },
  },
});

export const MemorialContent = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    memorialId: column.number(),
    section: column.text(), // 'hero', 'biography', 'funeral', 'video', 'donations'
    key: column.text(), // specific field name
    value: column.text(), // the content value
    type: column.text({ default: 'text' }), // 'text', 'textarea', 'image', 'date', 'boolean'
    updatedAt: column.text(), // Must be set explicitly in application code
  },
  indexes: {
    memorial_section_key_idx: { on: ['memorialId', 'section', 'key'], unique: true },
    memorial_section_idx: { on: ['memorialId', 'section'], unique: false },
  },
});

export const GalleryImages = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    memorialId: column.number(),
    imagePath: column.text(), // Full path or URL to image
    caption: column.text({ optional: true }),
    displayOrder: column.number({ default: 0 }),
    isActive: column.boolean({ default: true }),
    uploadedAt: column.text(), // Must be set explicitly in application code
  },
  indexes: {
    memorial_order_idx: { on: ['memorialId', 'displayOrder'], unique: false },
    memorial_image_idx: { on: ['memorialId', 'imagePath'], unique: false },
  },
});

// https://astro.build/db/config
export default defineDb({
  tables: { Memorials, Comments, MemorialContent, GalleryImages },
});
