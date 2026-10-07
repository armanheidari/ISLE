export const WORD_CLOUD_CONFIG = {
  MIN_WIDTH: 200,
  MIN_HEIGHT: 160,
  DEFAULT_WIDTH: 400,
  DEFAULT_HEIGHT: 240,
  
  MIN_FONT_SIZE: 12,
  MAX_FONT_SIZE: 44,
  FONT_SIZE_RANGE: 32,
  
  PADDING: 3,
  MAX_ROTATION: 45,
  
  APPEAR_DURATION: 1000,
  HOVER_DURATION: 200,
  CLICK_DURATION: 150,
  STAGGER_DELAY: 80,
  
  HOVER_SCALE: 1.15,
  CLICK_SCALE: 1.3,
  HOVER_OPACITY: 0.8,
  
  FONT_FAMILY: 'Inter, sans-serif',
  FONT_WEIGHT_THRESHOLD: 20,
  BOLD_WEIGHT: '700',
  NORMAL_WEIGHT: '600',
} as const;

export const COLOR_PALETTE = [
  '#0ea5e9', // sky-500
  '#3b82f6', // blue-500
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#a855f7', // purple-500
  '#d946ef', // fuchsia-500
  '#ec4899', // pink-500
  '#f43f5e'  // rose-500
] as const;

export const CSS_CLASSES = {
  CONTAINER: 'w-full h-60 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-shadow duration-300',
  WRAPPER: 'relative w-full h-full overflow-hidden rounded-lg',
  SVG: 'w-full h-full',
  DOWNLOAD_BUTTON: 'absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 border shadow-sm rounded-md text-xs px-2 py-1',
  TOOLTIP: 'pointer-events-none absolute bg-white px-2 py-1 rounded shadow border text-xs text-gray-700',
  EMPTY_STATE: 'w-full h-60 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300',
  EMPTY_STATE_CONTENT: 'text-center',
  EMPTY_STATE_ICON: 'text-gray-400 mb-2',
  EMPTY_STATE_TITLE: 'text-gray-500 font-medium',
  EMPTY_STATE_SUBTITLE: 'text-gray-400 text-sm mt-1',
} as const;
