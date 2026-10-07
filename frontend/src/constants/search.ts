export const SEARCH_CONSTANTS = {
  QUERY_LIMIT: 1000,
  MIN_YEAR: 1900,
  MAX_YEAR: 2024,
  TIMEOUT_MESSAGE: 'The request is taking longer than expected. The server may still be processing your request. Please wait a moment and try again.',
  SERVER_ERROR_MESSAGE: 'Server error occurred. Please try again with a different search query.',
  EMPTY_QUERY_MESSAGE: 'Please enter a search query',
  GENERIC_ERROR_MESSAGE: 'An error occurred',
  TIMEOUT_TIP: '💡 Tip: Data processing can take 1-2 minutes for large datasets. Please be patient.',
} as const;

export const SEARCH_PLACEHOLDERS = {
  QUERY: "Enter your research query (e.g., 'machine learning in healthcare')",
  AUTHORS: 'Enter author names (comma-separated)',
  COUNTRIES: 'Enter countries (comma-separated)',
  INSTITUTIONS: 'Enter institutions (comma-separated)',
  YEAR_FROM: 'From',
  YEAR_TO: 'To',
} as const;

export const SEARCH_LABELS = {
  AUTHORS: 'Authors',
  COUNTRIES: 'Countries',
  INSTITUTIONS: 'Institutions',
  YEAR_RANGE: 'Year Range',
  FILTERS: 'Filters',
  SEARCH: 'Search',
  SEARCHING: 'Searching...',
  CLEAR_ALL: 'Clear all',
  TRY_AGAIN: 'Try Again',
  ADVANCED_FILTERS: 'Advanced Filters',
} as const;
