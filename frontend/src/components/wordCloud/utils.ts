import * as d3 from 'd3';
import cloud from 'd3-cloud';
import { WeightedTerm } from '@/lib/api';
import { WordData, ColorScale, ContainerSize } from './types';
import { WORD_CLOUD_CONFIG, COLOR_PALETTE } from './constants';

/**
 * Transforms weighted terms into word data for D3 cloud layout
 */
export const transformWordsToWordData = (words: WeightedTerm[]): WordData[] => {
  if (!words || words.length === 0) return [];

  const maxWeight = Math.max(...words.map(w => w.weight));
  const minWeight = Math.min(...words.map(w => w.weight));
  const weightRange = maxWeight - minWeight || 1;

  return words.map(word => ({
    text: word.word,
    size: WORD_CLOUD_CONFIG.MIN_FONT_SIZE + 
          ((word.weight - minWeight) / weightRange) * WORD_CLOUD_CONFIG.FONT_SIZE_RANGE,
    weight: word.weight
  }));
};

/**
 * Creates a stable color scale for words
 */
export const createColorScale = (words: WeightedTerm[]): ColorScale => {
  return d3.scaleOrdinal<string, string>()
    .domain(words.map(w => w.word))
    .range(COLOR_PALETTE);
};

/**
 * Calculates font weight based on size
 */
export const getFontWeight = (size: number): string => {
  return size > WORD_CLOUD_CONFIG.FONT_WEIGHT_THRESHOLD 
    ? WORD_CLOUD_CONFIG.BOLD_WEIGHT 
    : WORD_CLOUD_CONFIG.NORMAL_WEIGHT;
};

/**
 * Generates random rotation within bounds
 */
export const getRandomRotation = (): number => {
  return (Math.random() - 0.5) * WORD_CLOUD_CONFIG.MAX_ROTATION;
};

/**
 * Validates container size and applies minimum constraints
 */
export const validateContainerSize = (size: ContainerSize): ContainerSize => {
  return {
    width: Math.max(WORD_CLOUD_CONFIG.MIN_WIDTH, size.width),
    height: Math.max(WORD_CLOUD_CONFIG.MIN_HEIGHT, size.height)
  };
};

/**
 * Creates D3 cloud layout configuration
 */
export const createCloudLayout = (
  words: WordData[], 
  containerSize: ContainerSize
) => {
  return cloud<WordData>()
    .size([containerSize.width, containerSize.height])
    .words(words)
    .padding(WORD_CLOUD_CONFIG.PADDING)
    .rotate(getRandomRotation)
    .font(WORD_CLOUD_CONFIG.FONT_FAMILY)
    .fontSize((d: WordData) => d.size);
};

/**
 * Applies text styling to D3 selection
 */
export const applyTextStyling = (
  selection: d3.Selection<SVGTextElement, WordData, SVGGElement, unknown>,
  colorScale: ColorScale
) => {
  return selection
    .style('font-size', (d: WordData) => `${d.size}px`)
    .style('font-family', WORD_CLOUD_CONFIG.FONT_FAMILY)
    .style('font-weight', (d: WordData) => getFontWeight(d.size))
    .style('fill', (d: WordData) => colorScale(d.text))
    .style('text-shadow', '2px 2px 4px rgba(0,0,0,0.15)')
    .style('filter', 'drop-shadow(1px 1px 2px rgba(0,0,0,0.1))')
    .style('text-anchor', 'middle')
    .style('cursor', 'pointer')
    .style('opacity', '0')
    .style('transition', 'all 0.3s ease-in-out');
};

/**
 * Applies hover effects to text element
 */
export const applyHoverEffects = (
  element: d3.Selection<SVGTextElement, any, any, any>,
  wordData: WordData
) => {
  return element
    .transition()
    .duration(WORD_CLOUD_CONFIG.HOVER_DURATION)
    .style('opacity', WORD_CLOUD_CONFIG.HOVER_OPACITY)
    .style('filter', 'drop-shadow(2px 2px 6px rgba(0,0,0,0.3))')
    .attr('transform', `translate(${wordData.x},${wordData.y})rotate(${wordData.rotate})scale(${WORD_CLOUD_CONFIG.HOVER_SCALE})`);
};

/**
 * Removes hover effects from text element
 */
export const removeHoverEffects = (
  element: d3.Selection<SVGTextElement, any, any, any>,
  wordData: WordData
) => {
  return element
    .transition()
    .duration(WORD_CLOUD_CONFIG.HOVER_DURATION)
    .style('opacity', '1')
    .style('filter', 'drop-shadow(1px 1px 2px rgba(0,0,0,0.1))')
    .attr('transform', `translate(${wordData.x},${wordData.y})rotate(${wordData.rotate})scale(1)`);
};

/**
 * Applies click animation to text element
 */
export const applyClickAnimation = (
  element: d3.Selection<SVGTextElement, any, any, any>,
  wordData: WordData
) => {
  return element
    .transition()
    .duration(WORD_CLOUD_CONFIG.CLICK_DURATION)
    .attr('transform', `translate(${wordData.x},${wordData.y})rotate(${wordData.rotate})scale(${WORD_CLOUD_CONFIG.CLICK_SCALE})`)
    .transition()
    .duration(WORD_CLOUD_CONFIG.CLICK_DURATION)
    .attr('transform', `translate(${wordData.x},${wordData.y})rotate(${wordData.rotate})scale(1)`);
};

/**
 * Animates text elements appearing with stagger effect
 */
export const animateTextAppearance = (
  selection: d3.Selection<SVGTextElement, WordData, SVGGElement, unknown>
) => {
  return selection
    .transition()
    .duration(WORD_CLOUD_CONFIG.APPEAR_DURATION)
    .delay((d: WordData, i: number) => i * WORD_CLOUD_CONFIG.STAGGER_DELAY)
    .style('opacity', '1');
};
