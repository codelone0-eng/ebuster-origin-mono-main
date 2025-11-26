import DOMPurify from 'dompurify';

/**
 * Санитизация HTML контента для безопасного отображения
 * Защищает от XSS атак
 */
export const sanitizeHTML = (dirty: string): string => {
  if (typeof window === 'undefined') {
    // SSR fallback - просто возвращаем пустую строку
    return '';
  }
  
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'div', 'span'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    KEEP_CONTENT: true,
  });
};

