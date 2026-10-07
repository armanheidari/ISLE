import { RefObject } from 'react';
import { CSS_CLASSES } from '../constants';

interface DownloadButtonProps {
  svgRef: RefObject<SVGSVGElement>;
}

/**
 * Download button component for exporting word cloud as SVG
 */
export const DownloadButton = ({ svgRef }: DownloadButtonProps) => {
  const handleDownloadSVG = () => {
    if (!svgRef.current) return;

    const svg = svgRef.current.cloneNode(true) as SVGSVGElement;
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wordcloud.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={handleDownloadSVG}
      className={CSS_CLASSES.DOWNLOAD_BUTTON}
    >
      Download SVG
    </button>
  );
};
