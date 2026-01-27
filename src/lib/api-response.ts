/**
 * Standardized API response utilities for consistent response formatting
 */

interface SuccessResponse<T = unknown> {
  success: true;
  data?: T;
  message?: string;
}

interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
}

/**
 * Creates a standardized success response
 * @param data - Optional data to include in response
 * @param message - Optional success message
 * @param status - HTTP status code (default: 200)
 * @returns Response object with standardized format
 */
export function successResponse<T>(
  data?: T,
  message?: string,
  status: number = 200
): Response {
  const body: SuccessResponse<T> = { success: true };
  
  if (data !== undefined) {
    body.data = data;
  }
  
  if (message) {
    body.message = message;
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Creates a standardized error response
 * @param error - Error message
 * @param status - HTTP status code (default: 500)
 * @param details - Optional additional error details
 * @returns Response object with standardized error format
 */
export function errorResponse(
  error: string,
  status: number = 500,
  details?: string
): Response {
  const body: ErrorResponse = { success: false, error };
  
  if (details) {
    body.details = details;
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Creates a standardized validation error response (400)
 * @param error - Validation error message
 * @param details - Optional details about what failed validation
 * @returns Response object with 400 status
 */
export function validationError(error: string, details?: string): Response {
  return errorResponse(error, 400, details);
}

/**
 * Creates a standardized unauthorized error response (401)
 * @param message - Optional custom message (default: "Unauthorized")
 * @returns Response object with 401 status
 */
export function unauthorizedError(message: string = 'Unauthorized'): Response {
  return errorResponse(message, 401);
}

/**
 * Creates a standardized not found error response (404)
 * @param resource - Optional resource type that was not found
 * @returns Response object with 404 status
 */
export function notFoundError(resource?: string): Response {
  const message = resource ? `${resource} not found` : 'Resource not found';
  return errorResponse(message, 404);
}
