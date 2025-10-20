/**
 * Z-Index Configuration
 * Centralized z-index management for consistent layering
 */

export const Z_INDEX = {
  // Base layers
  BASE: 0,
  BACKGROUND: -1,
  
  // Content layers
  CONTENT: 1,
  HEADER: 100,
  
  // Interactive layers
  DROPDOWN: 800,
  POPOVER: 900,
  TOOLTIP: 950,
  
  // Modal layers
  OVERLAY: 1000,        // Dialog overlay (dim background)
  MODAL: 1010,          // Dialog content
  
  // Special layers
  CURSOR: 2147483651,   // Custom cursor (highest priority)
  TOAST: 2147483646,   // Toast notifications (below cursor)
} as const;

// CSS custom properties for Tailwind
export const Z_INDEX_CSS = `
:root {
  --z-base: ${Z_INDEX.BASE};
  --z-background: ${Z_INDEX.BACKGROUND};
  --z-content: ${Z_INDEX.CONTENT};
  --z-header: ${Z_INDEX.HEADER};
  --z-dropdown: ${Z_INDEX.DROPDOWN};
  --z-popover: ${Z_INDEX.POPOVER};
  --z-tooltip: ${Z_INDEX.TOOLTIP};
  --z-overlay: ${Z_INDEX.OVERLAY};
  --z-modal: ${Z_INDEX.MODAL};
  --z-cursor: ${Z_INDEX.CURSOR};
  --z-toast: ${Z_INDEX.TOAST};
}
`;

// Utility classes
export const Z_INDEX_CLASSES = {
  base: `z-[${Z_INDEX.BASE}]`,
  background: `z-[${Z_INDEX.BACKGROUND}]`,
  content: `z-[${Z_INDEX.CONTENT}]`,
  header: `z-[${Z_INDEX.HEADER}]`,
  dropdown: `z-[${Z_INDEX.DROPDOWN}]`,
  popover: `z-[${Z_INDEX.POPOVER}]`,
  tooltip: `z-[${Z_INDEX.TOOLTIP}]`,
  overlay: `z-[${Z_INDEX.OVERLAY}]`,
  modal: `z-[${Z_INDEX.MODAL}]`,
  cursor: `z-[${Z_INDEX.CURSOR}]`,
  toast: `z-[${Z_INDEX.TOAST}]`,
} as const;

// Radix UI bindings
export const RADIX_Z_INDEX = {
  '[data-radix-dialog-overlay]': Z_INDEX.OVERLAY,
  '[data-radix-dialog-content]': Z_INDEX.MODAL,
  '[data-radix-toast-viewport]': Z_INDEX.TOAST,
  '[data-radix-toast-root]': Z_INDEX.TOAST,
  '[data-radix-popover-content]': Z_INDEX.POPOVER,
  '[data-radix-dropdown-menu-content]': Z_INDEX.DROPDOWN,
  '[data-radix-tooltip-content]': Z_INDEX.TOOLTIP,
  '[data-radix-select-content]': Z_INDEX.DROPDOWN,
  '[data-radix-context-menu-content]': Z_INDEX.DROPDOWN,
  '[data-radix-menubar-content]': Z_INDEX.DROPDOWN,
  '[data-radix-hover-card-content]': Z_INDEX.POPOVER,
  '[data-radix-sheet-overlay]': Z_INDEX.OVERLAY,
  '[data-radix-sheet-content]': Z_INDEX.MODAL,
  '[data-radix-drawer-overlay]': Z_INDEX.OVERLAY,
  '[data-radix-drawer-content]': Z_INDEX.MODAL,
  '[data-radix-alert-dialog-overlay]': Z_INDEX.OVERLAY,
  '[data-radix-alert-dialog-content]': Z_INDEX.MODAL,
} as const;
