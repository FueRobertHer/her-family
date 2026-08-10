/**
 * Markup for a single approved memory.
 *
 * Shared deliberately: the first page of comments is server-rendered (so the
 * memories are in the HTML for crawlers, link previews, and visitors without
 * JavaScript) while "load more" appends the same cards client-side. Keeping
 * one renderer means the two paths cannot drift apart.
 *
 * Runs on both server and client, so it must stay free of DOM APIs.
 */
import { escapeHtml } from './escape-html';

export interface CommentCardData {
  id: number;
  name: string;
  relationship?: string | null;
  message: string;
  imageUrl?: string | null;
  createdAt: string;
}

/** Slide width: 1 card on mobile, 2 on tablet, 3 on desktop. */
export const COMMENT_SLIDE_CLASS =
  'shrink-0 w-full md:w-[calc(50%-12px)] xl:w-[calc(33.333%-16px)]';

export function formatCommentDate(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Inner markup of one card, without the slide wrapper. */
export function renderCommentCard(comment: CommentCardData): string {
  const initial = escapeHtml((comment.name || '?').charAt(0).toUpperCase());
  const name = escapeHtml(comment.name);

  const relationship = comment.relationship
    ? `<p class="text-xs text-warm-gray-500">${escapeHtml(comment.relationship)}</p>`
    : '';

  const photo = comment.imageUrl
    ? `
            <div
              class="relative group cursor-pointer overflow-hidden rounded-lg mb-3"
              data-lightbox-trigger
              data-lightbox-url="${escapeHtml(comment.imageUrl)}"
              data-lightbox-title="Photo from ${name}"
            >
              <img
                src="${escapeHtml(comment.imageUrl)}"
                alt="Memory photo"
                class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                decoding="async"
                data-fallback="photo"
              />
              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <svg class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>`
    : '';

  return `
      <div class="bg-white rounded-xl p-6 shadow-xs border border-warm-gray-100 h-full flex flex-col">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-warm-gray-100 flex items-center justify-center text-warm-gray-500 font-bold text-lg" aria-hidden="true">
              ${initial}
            </div>
            <div>
              <h4 class="font-semibold text-warm-gray-900">${name}</h4>
              ${relationship}
            </div>
          </div>
          <time class="text-xs text-warm-gray-400 whitespace-nowrap" datetime="${escapeHtml(comment.createdAt)}">
            ${escapeHtml(formatCommentDate(comment.createdAt))}
          </time>
        </div>

        <div class="grow space-y-4">${photo}
          <p class="text-warm-gray-700 leading-relaxed text-sm whitespace-pre-wrap line-clamp-6">${escapeHtml(comment.message)}</p>
        </div>
      </div>
  `;
}

/** A card wrapped in its carousel slide. */
export function renderCommentSlide(comment: CommentCardData): string {
  return `<div class="${COMMENT_SLIDE_CLASS}">${renderCommentCard(comment)}</div>`;
}

export function renderEmptyState(): string {
  return `
    <div class="w-full text-center py-12 text-warm-gray-600">
      <p>No memories shared yet. Be the first to share one.</p>
    </div>
  `;
}
