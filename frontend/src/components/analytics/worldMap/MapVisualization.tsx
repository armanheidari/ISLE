import React from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { CountryData, GeographyStyle } from '@/types/worldMap';
import { MAP_CONFIG } from '@/constants/worldMap';
import { getCountryValue } from '@/utils/worldMapUtils';

interface MapVisualizationProps {
  geoUrl: string;
  countries: Record<string, CountryData>;
  selectedMetric: 'papers' | 'citations';
  hoveredCountry: string | null;
  onCountryClick: (countryName: string) => void;
  onCountryHover: (countryName: string | null) => void;
}

export const MapVisualization: React.FC<MapVisualizationProps> = ({
  geoUrl,
  countries,
  selectedMetric,
  hoveredCountry,
  onCountryClick,
  onCountryHover
}) => {
  const getGeographyStyle = (countryName: string, countryData?: CountryData): GeographyStyle => {
    const fillColor = countryData?.color || '#f3f4f6';
    const isHovered = hoveredCountry === countryName;
    
    return {
      default: {
        fill: fillColor,
        stroke: '#e5e7eb',
        strokeWidth: 0.5,
        outline: 'none',
      },
      hover: {
        fill: fillColor,
        stroke: '#3b82f6',
        strokeWidth: 1.5,
        outline: 'none',
      },
      pressed: {
        fill: fillColor,
        stroke: '#1d4ed8',
        strokeWidth: 2,
        outline: 'none',
      },
    };
  };

  return (
    <ComposableMap
      projection={MAP_CONFIG.projection}
      projectionConfig={{
        scale: MAP_CONFIG.scale,
        center: MAP_CONFIG.center
      }}
      width={MAP_CONFIG.width}
      height={MAP_CONFIG.height}
      className="w-full h-auto"
    >
      <ZoomableGroup>
        <Geographies geography={geoUrl}>
          {({ geographies }: { geographies: any[] }) =>
            geographies.map((geo: any) => {
              const countryName = geo.properties.name;
              const countryData = countries[countryName];
              const value = getCountryValue(countryName, countries, selectedMetric);
              const isHovered = hoveredCountry === countryName;
              const style = getGeographyStyle(countryName, countryData);
              
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={countryData?.color || '#f3f4f6'}
                  stroke="#e5e7eb"
                  strokeWidth={0.5}
                  style={style}
                  onClick={() => onCountryClick(countryName)}
                  onMouseEnter={() => onCountryHover(countryName)}
                  onMouseLeave={() => onCountryHover(null)}
                />
              );
            })
          }
        </Geographies>
      </ZoomableGroup>
    </ComposableMap>
  );
};
