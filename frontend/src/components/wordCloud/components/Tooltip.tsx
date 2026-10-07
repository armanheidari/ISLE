import { TooltipPosition } from '../types';
import { CSS_CLASSES } from '../constants';

interface TooltipProps {
  hoveredWord: string | null;
  tooltipPos: TooltipPosition | null;
}

/**
 * Tooltip component for displaying hovered word information
 */
export const Tooltip = ({ hoveredWord, tooltipPos }: TooltipProps) => {
  if (!hoveredWord || !tooltipPos) return null;

  return (
    <div
      className={CSS_CLASSES.TOOLTIP}
      style={{ left: tooltipPos.x, top: tooltipPos.y }}
    >
      {hoveredWord}
    </div>
  );
};
