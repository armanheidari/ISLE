'use client';

import { useContainerSize } from './wordCloud/hooks/useContainerSize';
import { useWordCloud } from './wordCloud/hooks/useWordCloud';
import { EmptyState } from './wordCloud/components/EmptyState';
import { DownloadButton } from './wordCloud/components/DownloadButton';
import { Tooltip } from './wordCloud/components/Tooltip';
import { WordCloudVisualizationProps } from './wordCloud/types';
import { CSS_CLASSES } from './wordCloud/constants';


export default function WordCloudVisualization({ 
  words, 
  className = '', 
  onWordClick, 
  onWordHover 
}: WordCloudVisualizationProps) {
  const { wrapperRef, containerSize } = useContainerSize();
  const { svgRef, hoveredWord, tooltipPos } = useWordCloud({
    words,
    containerSize,
    onWordClick,
    onWordHover
  });

  if (!words || words.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={`${CSS_CLASSES.CONTAINER} ${className}`}>
      <div ref={wrapperRef} className={CSS_CLASSES.WRAPPER}>
        <svg ref={svgRef} className={CSS_CLASSES.SVG} />
        <DownloadButton svgRef={svgRef} />
        <Tooltip hoveredWord={hoveredWord} tooltipPos={tooltipPos} />
      </div>
    </div>
  );
}