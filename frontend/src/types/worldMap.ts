import { AnalysisResult } from '@/lib/api';

export interface WorldMapProps {
  data: AnalysisResult;
  onCountrySelect?: (country: string) => void;
}

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

export type MetricType = 'papers' | 'citations';

export interface WorldMapState {
  selectedMetric: MetricType;
  hoveredCountry: string | null;
  pinnedCountry: string | null;
  tooltipPosition: TooltipPosition;
}

export interface GeographyStyle {
  default: {
    fill: string;
    stroke: string;
    strokeWidth: number;
    outline: string;
  };
  hover: {
    fill: string;
    stroke: string;
    strokeWidth: number;
    outline: string;
  };
  pressed: {
    fill: string;
    stroke: string;
    strokeWidth: number;
    outline: string;
  };
}

export interface TooltipProps {
  countryName: string;
  countries: Record<string, CountryData>;
  selectedMetric: MetricType;
  isPinned: boolean;
  position: TooltipPosition;
  onTogglePin: (countryName: string) => void;
  onClose: () => void;
}

export interface LegendProps {
  selectedMetric: MetricType;
}

export interface MetricSelectorProps {
  selectedMetric: MetricType;
  onMetricChange: (metric: MetricType) => void;
}
