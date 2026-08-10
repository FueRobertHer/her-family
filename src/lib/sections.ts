/**
 * Single source of truth for editable memorial sections.
 *
 * Each section used to be described in three places: a field list in the admin
 * modal, a DOM patcher that re-implemented the component in imperative JS, and
 * the component itself. Adding a field meant editing all three, and missing one
 * failed silently. The patchers are gone (the page re-renders after a save) and
 * the field list and the rendered defaults both live here.
 *
 * This module is imported by both server code (memorial.service.ts) and client
 * code (admin-editor/modal.ts), so it must stay free of DOM and Node imports.
 */

export type SectionFieldType =
  | 'text'
  | 'textarea'
  | 'date'
  | 'email'
  | 'checkbox'
  | 'image'
  | 'video'
  | 'info'
  | 'reorder_gallery';

export interface SectionField {
  key: string;
  label: string;
  type: SectionFieldType;
  /** Rows for a textarea. */
  rows?: number;
  /** Placeholder text; falls back to the rendered default for this key. */
  placeholder?: string;
  /** Body text for `info` fields. */
  message?: string;
  /**
   * Storage section for this field when it differs from the section's own
   * storage section. Only 'highlights' needs it: its content lives under
   * 'biography' while its visibility toggle lives under 'highlights'.
   */
  storageSection?: string;
  /** Value used when no row exists yet (checkboxes). */
  defaultValue?: string;
  /**
   * Storage encoding when the stored value is not the edited text. 'lines'
   * stores a JSON array of strings and edits it as one entry per line.
   */
  serialize?: 'lines';
}

export interface SectionDefinition {
  /** Heading shown at the top of the edit modal. */
  title: string;
  /**
   * Section name used in the MemorialContent table when it differs from the
   * editor's own key (specialInstructions and flowersInfo live under funeral).
   */
  storageSection?: string;
  fields: SectionField[];
}

/**
 * Text that renders when a memorial has no stored value for a key.
 *
 * These were previously duplicated as component prop defaults and as modal
 * placeholders, and had drifted apart: the donations title rendered "Support"
 * while the editor suggested "Honor Their Memory", and the biography title
 * rendered "Life Story" while the component claimed "Remembering a Beautiful
 * Life". The values kept here are the ones that actually rendered.
 */
export const SECTION_DEFAULTS = {
  hero: {
    birthDate: '1900-01-01',
    deathDate: '2024-01-01',
    mainImage: '/images/portrait.jpg',
    subtitle: 'In loving memory',
  },
  biography: {
    title: 'Life Story',
  },
  gallery: {
    sectionTitle: 'Treasured Moments',
  },
  video: {
    sectionTitle: 'A Life Remembered',
  },
  comments: {
    sectionTitle: 'Share Your Memories',
    subtitle: 'Leave a message to honor their memory.',
  },
  donations: {
    sectionTitle: 'Support',
  },
  funeral: {
    sectionTitle: 'Service Information',
    subtitle: 'Please join us as we celebrate their life.',
  },
} as const;

export const SECTIONS: Record<string, SectionDefinition> = {
  hero: {
    title: 'Edit Hero Section',
    fields: [
      { key: 'name', label: 'Full Name', type: 'text' },
      { key: 'birthDate', label: 'Birth Date', type: 'date' },
      { key: 'deathDate', label: 'Death Date', type: 'date' },
      { key: 'subtitle', label: 'Subtitle', type: 'text' },
      {
        key: 'mainImage',
        label: 'Portrait Image',
        type: 'image',
        placeholder: '/images/portrait.jpg or Cloudinary URL',
      },
      {
        key: 'backgroundImage',
        label: 'Background Image',
        type: 'image',
        placeholder: 'Optional: Custom background image',
      },
    ],
  },

  biography: {
    title: 'Edit Biography',
    fields: [
      { key: 'visible', label: 'Show Biography Section', type: 'checkbox', defaultValue: 'true' },
      { key: 'title', label: 'Section Title', type: 'text' },
      { key: 'content', label: 'Biography Content', type: 'textarea', rows: 10 },
    ],
  },

  highlights: {
    title: 'Edit Highlights',
    // Content is stored under 'biography'; only the visibility flag is its own.
    storageSection: 'biography',
    fields: [
      {
        key: 'visible',
        label: 'Show Cherished Memories',
        type: 'checkbox',
        storageSection: 'highlights',
        defaultValue: 'true',
      },
      {
        key: 'highlights',
        label: 'Cherished Memories (one per line)',
        type: 'textarea',
        rows: 8,
        placeholder: 'Enter each memory on a new line',
        serialize: 'lines',
      },
    ],
  },

  video: {
    title: 'Edit Video Section',
    fields: [
      { key: 'visible', label: 'Show Video Section', type: 'checkbox', defaultValue: 'true' },
      { key: 'sectionTitle', label: 'Section Title', type: 'text' },
      { key: 'description', label: 'Video Description', type: 'text' },
      {
        key: 'videoUrl',
        label: 'Video URL',
        type: 'video',
        placeholder: '/videos/memorial-video.mp4 or Cloudinary URL',
      },
      {
        key: 'posterImage',
        label: 'Video Poster Image',
        type: 'image',
        placeholder: '/images/video-poster.jpg',
      },
    ],
  },

  donations: {
    title: 'Edit Donations',
    fields: [
      { key: 'visible', label: 'Show Donations Section', type: 'checkbox', defaultValue: 'true' },
      { key: 'sectionTitle', label: 'Section Title', type: 'text' },
      { key: 'customMessage', label: 'Custom Message', type: 'textarea', rows: 3 },
      { key: 'venmoUsername', label: 'Venmo Username', type: 'text', placeholder: '@username' },
      {
        key: 'venmoImage',
        label: 'Venmo QR Code/Image',
        type: 'image',
        placeholder: 'Upload QR Code',
      },
      {
        key: 'cashappUsername',
        label: 'Cash App Username',
        type: 'text',
        placeholder: '$username',
      },
      {
        key: 'cashappImage',
        label: 'Cash App QR Code/Image',
        type: 'image',
        placeholder: 'Upload QR Code',
      },
      { key: 'zelleEmail', label: 'Zelle Email', type: 'email', placeholder: 'email@example.com' },
      {
        key: 'zelleImage',
        label: 'Zelle QR Code/Image',
        type: 'image',
        placeholder: 'Upload QR Code',
      },
    ],
  },

  funeral: {
    title: 'Edit Funeral Information',
    fields: [
      { key: 'visible', label: 'Show Funeral Section', type: 'checkbox', defaultValue: 'true' },
      { key: 'sectionTitle', label: 'Section Title', type: 'text' },
      { key: 'subtitle', label: 'Subtitle Text', type: 'text' },
    ],
  },

  specialInstructions: {
    title: 'Edit Special Instructions',
    storageSection: 'funeral',
    fields: [
      {
        key: 'specialInstructionsVisible',
        label: 'Show Special Instructions',
        type: 'checkbox',
        defaultValue: 'true',
      },
      {
        key: 'specialInstructions',
        label: 'Special Instructions',
        type: 'textarea',
        rows: 5,
        placeholder: 'Please arrive 15 minutes early for seating...',
      },
    ],
  },

  flowersInfo: {
    title: 'Edit Flowers/Donation Information',
    storageSection: 'funeral',
    fields: [
      {
        key: 'flowersInfoVisible',
        label: 'Show Flowers/Donation Info',
        type: 'checkbox',
        defaultValue: 'true',
      },
      {
        key: 'flowersInfo',
        label: 'Flowers/Donation Information',
        type: 'textarea',
        rows: 3,
        placeholder: 'In lieu of flowers, the family requests...',
      },
    ],
  },

  services: {
    title: 'Edit Service Events',
    fields: [
      {
        key: 'info',
        label: 'Service Management',
        type: 'info',
        message:
          'Service events are complex structured data. To edit services, dates, times, and locations, please update the database directly or contact support.',
      },
    ],
  },

  reception: {
    title: 'Edit Reception Information',
    fields: [
      {
        key: 'visible',
        label: 'Show Reception Information',
        type: 'checkbox',
        defaultValue: 'true',
      },
      {
        key: 'location',
        label: 'Reception Location',
        type: 'text',
        placeholder: "St. Mary's Parish Hall",
      },
      { key: 'time', label: 'Reception Time', type: 'text', placeholder: 'Following the service' },
      {
        key: 'description',
        label: 'Reception Description',
        type: 'textarea',
        rows: 3,
        placeholder: 'Light refreshments will be served...',
      },
    ],
  },

  gallery: {
    title: 'Edit Gallery',
    fields: [
      { key: 'visible', label: 'Show Gallery Section', type: 'checkbox', defaultValue: 'true' },
      { key: 'sectionTitle', label: 'Section Title', type: 'text' },
      { key: 'images', label: 'Reorder Images', type: 'reorder_gallery' },
    ],
  },

  comments: {
    title: 'Edit Memories',
    fields: [
      { key: 'visible', label: 'Show Memories Section', type: 'checkbox', defaultValue: 'true' },
      {
        key: 'autoApprove',
        label: 'Auto-approve New Comments',
        type: 'checkbox',
        defaultValue: 'false',
      },
      { key: 'sectionTitle', label: 'Section Title', type: 'text' },
      { key: 'subtitle', label: 'Subtitle Text', type: 'text' },
    ],
  },

  footer: {
    title: 'Edit Footer',
    fields: [
      { key: 'visible', label: 'Show Footer', type: 'checkbox', defaultValue: 'true' },
      { key: 'quote', label: 'Memorial Quote', type: 'textarea', rows: 2 },
      {
        key: 'credit',
        label: 'Footer Credit Text',
        type: 'text',
        placeholder: 'Created with love by the Family • 2024',
      },
    ],
  },
};

/** Where a field's value is stored: field override, then section, then the section key. */
export function storageSectionFor(sectionKey: string, field?: SectionField): string {
  return field?.storageSection ?? SECTIONS[sectionKey]?.storageSection ?? sectionKey;
}

/**
 * Placeholder for a field, falling back to the value the page renders when the
 * field is left empty, so the editor never suggests text the site won't use.
 */
export function placeholderFor(sectionKey: string, field: SectionField): string {
  if (field.placeholder) return field.placeholder;

  const defaults = (SECTION_DEFAULTS as Record<string, Record<string, string>>)[
    storageSectionFor(sectionKey, field)
  ];
  return defaults?.[field.key] ?? '';
}
