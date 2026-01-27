import { z } from 'zod';

/**
 * Validation schemas using Zod for type-safe input validation
 */

// Comment validation schema
export const commentSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  
  email: z.string()
    .trim()
    .email('Invalid email format')
    .optional()
    .or(z.literal('')),
  
  relationship: z.string()
    .trim()
    .max(50, 'Relationship must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  
  message: z.string()
    .trim()
    .min(1, 'Message is required')
    .max(1000, 'Message must be less than 1000 characters'),
  
  imageUrl: z.string()
    .url('Invalid image URL')
    .optional()
    .or(z.literal(''))
});

export type CommentInput = z.infer<typeof commentSchema>;

// Memorial content validation schema
export const memorialContentSchema = z.object({
  section: z.string()
    .trim()
    .min(1, 'Section is required'),
  
  key: z.string()
    .trim()
    .min(1, 'Key is required'),
  
  value: z.string(),
  
  type: z.enum(['text', 'textarea', 'image', 'date', 'boolean', 'json'])
    .default('text')
});

export type MemorialContentInput = z.infer<typeof memorialContentSchema>;

// Gallery image validation schema
export const galleryImageSchema = z.object({
  imagePath: z.string()
    .trim()
    .min(1, 'Image path is required')
    .refine((path) => {
      // Accept URLs or local paths
      return path.startsWith('/') || path.startsWith('http://') || path.startsWith('https://');
    }, 'Image path must be a valid URL or absolute path'),
  
  caption: z.string()
    .trim()
    .max(200, 'Caption must be less than 200 characters')
    .optional()
    .or(z.literal('')),
  
  displayOrder: z.number()
    .int()
    .min(0)
    .optional()
});

export type GalleryImageInput = z.infer<typeof galleryImageSchema>;

// Login validation schema
export const loginSchema = z.object({
  password: z.string()
    .min(1, 'Password is required')
});

export type LoginInput = z.infer<typeof loginSchema>;

// Comment action validation schema (for admin)
export const commentActionSchema = z.object({
  id: z.number()
    .int()
    .positive('Invalid comment ID'),
  
  action: z.enum(['approve', 'reject'], {
    errorMap: () => ({ message: 'Action must be "approve" or "reject"' })
  })
});

export type CommentActionInput = z.infer<typeof commentActionSchema>;

// Gallery update order validation schema
export const galleryUpdateOrderSchema = z.object({
  imagePath: z.string()
    .trim()
    .min(1, 'Image path is required'),
  
  displayOrder: z.number()
    .int()
    .min(0, 'Display order must be a non-negative integer')
});

export type GalleryUpdateOrderInput = z.infer<typeof galleryUpdateOrderSchema>;

/**
 * Helper function to validate data against a schema
 * Returns a standardized result object
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string; details?: string[] } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  // Extract user-friendly error messages
  const errorMessages = result.error.errors.map(err => {
    const path = err.path.join('.');
    return path ? `${path}: ${err.message}` : err.message;
  });
  
  return {
    success: false,
    error: errorMessages[0] || 'Validation failed',
    details: errorMessages
  };
}
