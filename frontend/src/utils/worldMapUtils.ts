import { COLOR_SCALE, COLOR_THRESHOLDS, INTENSITY_LABELS, INTENSITY_THRESHOLDS } from '@/constants/worldMap';

export interface CountryData {
  name: string;
  papers: number;
  citations: number;
  color: string;
}

export interface CountryStats {
  rank: number;
  percentage: number;
  totalCountries: number;
}

export interface TooltipPosition {
  x: number;
  y: number;
}

/**
 * Calculate color scale based on values using logarithmic scaling
 */
export const createColorScale = (values: number[]): ((value: number) => string) => {
  if (values.length === 0) {
    return () => COLOR_SCALE.noData;
  }
  
  const nonZeroValues = values.filter(v => v > 0);
  if (nonZeroValues.length === 0) {
    return () => COLOR_SCALE.noData;
  }
  
  const maxValue = Math.max(...values);
  const minValue = Math.min(...nonZeroValues);

  return (value: number) => {
    if (value === 0) return COLOR_SCALE.noData;
    
    const logMin = Math.log10(minValue);
    const logMax = Math.log10(maxValue);
    const logValue = Math.log10(value);
    
    if (logMax === logMin) {
      return COLOR_SCALE.medium;
    }
    
    const normalized = (logValue - logMin) / (logMax - logMin);
    
    if (normalized < COLOR_THRESHOLDS.veryLow) return COLOR_SCALE.veryLow;
    if (normalized < COLOR_THRESHOLDS.low) return COLOR_SCALE.low;
    if (normalized < COLOR_THRESHOLDS.lowMedium) return COLOR_SCALE.lowMedium;
    if (normalized < COLOR_THRESHOLDS.mediumLight) return COLOR_SCALE.mediumLight;
    if (normalized < COLOR_THRESHOLDS.medium) return COLOR_SCALE.medium;
    if (normalized < COLOR_THRESHOLDS.blue) return COLOR_SCALE.blue;
    if (normalized < COLOR_THRESHOLDS.mediumDark) return COLOR_SCALE.mediumDark;
    if (normalized < COLOR_THRESHOLDS.dark) return COLOR_SCALE.dark;
    if (normalized < COLOR_THRESHOLDS.veryDark) return COLOR_SCALE.veryDark;
    return COLOR_SCALE.darkest;
  };
};

/**
 * Calculate country statistics including rank and percentage
 */
export const calculateCountryStats = (
  countryName: string,
  countries: Record<string, CountryData>,
  selectedMetric: 'papers' | 'citations'
): CountryStats => {
  const country = countries[countryName];
  if (!country) return { rank: 0, percentage: 0, totalCountries: 0 };

  const values = Object.values(countries).map(c => 
    selectedMetric === 'papers' ? c.papers : c.citations
  ).sort((a, b) => b - a);
  
  const countryValue = selectedMetric === 'papers' ? country.papers : country.citations;
  const rank = values.indexOf(countryValue) + 1;
  const totalCountries = values.length;
  const percentage = totalCountries > 0 ? ((totalCountries - rank + 1) / totalCountries) * 100 : 0;
  
  return { rank, percentage, totalCountries };
};

/**
 * Get country value based on selected metric
 */
export const getCountryValue = (
  countryName: string,
  countries: Record<string, CountryData>,
  selectedMetric: 'papers' | 'citations'
): number => {
  const country = countries[countryName];
  if (!country) return 0;
  return selectedMetric === 'papers' ? country.papers : country.citations;
};

/**
 * Get country name from country data
 */
export const getCountryName = (
  countryName: string,
  countries: Record<string, CountryData>
): string => {
  const country = countries[countryName];
  return country ? country.name : countryName;
};

/**
 * Calculate color intensity label based on value and max value
 */
export const getColorIntensityLabel = (
  value: number,
  maxValue: number
): string => {
  const intensity = (value / maxValue) * 100;
  
  if (intensity > INTENSITY_THRESHOLDS.veryHigh) return INTENSITY_LABELS.veryHigh;
  if (intensity > INTENSITY_THRESHOLDS.high) return INTENSITY_LABELS.high;
  if (intensity > INTENSITY_THRESHOLDS.medium) return INTENSITY_LABELS.medium;
  if (intensity > INTENSITY_THRESHOLDS.low) return INTENSITY_LABELS.low;
  return INTENSITY_LABELS.veryLow;
};

/**
 * Calculate tooltip position with bounds checking
 */
export const calculateTooltipPosition = (
  event: React.MouseEvent,
  pinnedPosition?: { left: string; top: string }
): TooltipPosition => {
  if (pinnedPosition) {
    return { x: 0, y: 0 };
  }

  const rect = event.currentTarget.getBoundingClientRect();
  return {
    x: Math.min(event.clientX - rect.left + 10, 300),
    y: Math.min(event.clientY - rect.top - 10, 200)
  };
};

/**
 * Process country data from analysis result
 */
export const processCountryData = (
  data: any,
  countryNameMap: Record<string, string>
): Record<string, CountryData> => {
  try {
    const countries: Record<string, CountryData> = {};
    
    const countriesByPapers = data.all_countries_by_papers || data.top_countries_by_papers || [];
    countriesByPapers.forEach((country: any) => {
      const mappedName = countryNameMap[country.name] || country.name;
      countries[mappedName] = {
        name: country.name,
        papers: country.count,
        citations: 0,
        color: COLOR_SCALE.noData
      };
    });

    const countriesByCitations = data.all_countries_by_citations || data.top_countries_by_citations || [];
    countriesByCitations.forEach((country: any) => {
      const mappedName = countryNameMap[country.name] || country.name;
      if (countries[mappedName]) {
        countries[mappedName].citations = country.count;
      } else {
        countries[mappedName] = {
          name: country.name,
          papers: 0,
          citations: country.count,
          color: COLOR_SCALE.noData
        };
      }
    });
    
    return countries;
  } catch (error) {
    console.error('Error processing country data:', error);
    return {};
  }
};
