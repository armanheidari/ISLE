import { WeightedTerm } from '@/lib/api';

export interface WordData {
  text: string;
  size: number;
  weight: number;
  x?: number;
  y?: number;
  rotate?: number;
}

export interface ContainerSize {
  width: number;
  height: number;
}

export interface TooltipPosition {
  x: number;
  y: number;
}

export interface WordCloudVisualizationProps {
  words: WeightedTerm[];
  className?: string;
  onWordClick?: (word: string, weight: number) => void;
  onWordHover?: (word: string, weight: number) => void;
}

export interface WordCloudConfig {
  minFontSize: number;
  maxFontSize: number;
  padding: number;
  maxRotation: number;
  fontFamily: string;
  fontWeightThreshold: number;
  boldWeight: string;
  normalWeight: string;
}

export interface AnimationConfig {
  appearDuration: number;
  hoverDuration: number;
  clickDuration: number;
  staggerDelay: number;
  hoverScale: number;
  clickScale: number;
  hoverOpacity: number;
}

export type ColorScale = (word: string) => string;
