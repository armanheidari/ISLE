import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { WeightedTerm } from '@/lib/api';
import { WordData, ContainerSize, TooltipPosition } from '../types';
import { 
  transformWordsToWordData, 
  createColorScale, 
  createCloudLayout,
  applyTextStyling,
  applyHoverEffects,
  removeHoverEffects,
  applyClickAnimation,
  animateTextAppearance
} from '../utils';

interface UseWordCloudProps {
  words: WeightedTerm[];
  containerSize: ContainerSize;
  onWordClick?: (word: string, weight: number) => void;
  onWordHover?: (word: string, weight: number) => void;
}

/**
 * Custom hook for managing word cloud rendering and interactions
 */
export const useWordCloud = ({ 
  words, 
  containerSize, 
  onWordClick, 
  onWordHover 
}: UseWordCloudProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition | null>(null);

  useEffect(() => {
    if (!svgRef.current || !words || words.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const wordData = transformWordsToWordData(words);
    const colorScale = createColorScale(words);
    const layout = createCloudLayout(wordData, containerSize);

    layout.on("end", (words: WordData[]) => {
      drawWordCloud(words, colorScale);
    });

    layout.start();

    function drawWordCloud(words: WordData[], colorScale: (word: string) => string) {
      if (!svgRef.current) return;
      
      const svg = d3.select(svgRef.current);
      const { width, height } = containerSize;

      const g = svg
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width/2},${height/2})`);

      const textElements = g.selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .attr("transform", (d: WordData) => `translate(${d.x},${d.y})rotate(${d.rotate})`)
        .text((d: WordData) => d.text);

      applyTextStyling(textElements, colorScale);

      animateTextAppearance(textElements);

      addWordInteractions(textElements, onWordClick, onWordHover);
    }

    function addWordInteractions(
      textElements: d3.Selection<SVGTextElement, WordData, SVGGElement, unknown>,
      onWordClick?: (word: string, weight: number) => void,
      onWordHover?: (word: string, weight: number) => void
    ) {
      textElements
        .on("mouseover", function(event: MouseEvent, d: WordData) {
          const element = d3.select(this);
          applyHoverEffects(element, d);
          
          setHoveredWord(d.text);
          onWordHover?.(d.text, d.weight);
          
          if (svgRef.current) {
            const [mx, my] = d3.pointer(event, svgRef.current);
            setTooltipPos({ x: mx + 10, y: my + 10 });
          }
        })
        .on("mousemove", function(event: MouseEvent) {
          if (svgRef.current) {
            const [mx, my] = d3.pointer(event, svgRef.current);
            setTooltipPos({ x: mx + 10, y: my + 10 });
          }
        })
        .on("mouseout", function(event: MouseEvent, d: WordData) {
          const element = d3.select(this);
          removeHoverEffects(element, d);
          
          setHoveredWord(null);
          setTooltipPos(null);
        })
        .on("click", function(event: MouseEvent, d: WordData) {
          const element = d3.select(this);
          applyClickAnimation(element, d);
          onWordClick?.(d.text, d.weight);
        });
    }
  }, [words, containerSize, onWordClick, onWordHover]);

  return {
    svgRef,
    hoveredWord,
    tooltipPos
  };
};
