import { defineDb, defineTable, column } from 'astro:db';

const Comments = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    email: column.text({ optional: true }),
    relationship: column.text({ optional: true }), // e.g., "Friend", "Student", "Colleague"
    message: column.text(),
    imageUrl: column.text({ optional: true }), // Optional image attachment
    status: column.text({ default: 'pending' }), // 'pending', 'approved', 'rejected'
    createdAt: column.text({ default: new Date().toISOString() }),
    updatedAt: column.text({ default: new Date().toISOString() })
  },
  indexes: {
    status_idx: { on: ["status"], unique: false }
  }
});

const MemorialContent = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    section: column.text(), // 'hero', 'biography', 'funeral', 'video', 'donations'
    key: column.text(), // specific field name
    value: column.text(), // the content value
    type: column.text({ default: 'text' }), // 'text', 'textarea', 'image', 'date', 'boolean'
    updatedAt: column.text({ default: new Date().toISOString() })
  },
  indexes: {
    section_key_idx: { on: ["section", "key"], unique: false }
  }
});

const GalleryImages = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    imagePath: column.text(), // Full path or URL to image
    caption: column.text({ optional: true }),
    displayOrder: column.number({ default: 0 }),
    isActive: column.boolean({ default: true }),
    uploadedAt: column.text({ default: new Date().toISOString() })
  },
  indexes: {
    order_idx: { on: ["displayOrder"], unique: false }
  }
});

// https://astro.build/db/config
export default defineDb({
  tables: { Comments, MemorialContent, GalleryImages }
});