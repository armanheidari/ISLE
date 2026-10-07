'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Globe } from 'lucide-react';
import { WorldMapProps, WorldMapState, MetricType } from '@/types/worldMap';
import { GEO_URL, COUNTRY_NAME_MAP } from '@/constants/worldMap';
import { 
  processCountryData, 
  createColorScale, 
  calculateTooltipPosition,
  CountryData 
} from '@/utils/worldMapUtils';
import { 
  MetricSelector, 
  MapTooltip, 
  MapLegend, 
  MapVisualization, 
  ErrorState 
} from './worldMap/';

export default function WorldMap({ data, onCountrySelect }: WorldMapProps) {
  const [state, setState] = useState<WorldMapState>({
    selectedMetric: 'papers',
    hoveredCountry: null,
    pinnedCountry: null,
    tooltipPosition: { x: 0, y: 0 }
  });

  if (!data) {
    return (
      <ErrorState
        title="No Data Available"
        message="No data available for map visualization"
      />
    );
  }

  const countryData = useMemo(() => 
    processCountryData(data, COUNTRY_NAME_MAP), 
    [data]
  );

  const getColorScale = useMemo(() => {
    const values = Object.values(countryData).map(country => 
      state.selectedMetric === 'papers' ? country.papers : country.citations
    );
    return createColorScale(values);
  }, [countryData, state.selectedMetric]);

  const coloredCountries = useMemo(() => {
    const colored: Record<string, CountryData> = {};
    Object.entries(countryData).forEach(([name, data]) => {
      const value = state.selectedMetric === 'papers' ? data.papers : data.citations;
      colored[name] = {
        ...data,
        color: getColorScale(value)
      };
    });
    return colored;
  }, [countryData, state.selectedMetric, getColorScale]);

  const handleMetricChange = useCallback((metric: MetricType) => {
    setState(prev => ({ ...prev, selectedMetric: metric }));
  }, []);

  const handleCountryClick = useCallback((countryName: string) => {
    if (onCountrySelect) {
      onCountrySelect(countryName);
    }
    setState(prev => ({ ...prev, pinnedCountry: countryName }));
  }, [onCountrySelect]);

  const handleCountryHover = useCallback((countryName: string | null) => {
    setState(prev => ({ ...prev, hoveredCountry: countryName }));
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    const position = calculateTooltipPosition(event, state.pinnedCountry ? { left: '20px', top: '20px' } : undefined);
    setState(prev => ({ ...prev, tooltipPosition: position }));
  }, [state.pinnedCountry]);

  const togglePin = useCallback((countryName: string) => {
    setState(prev => ({
      ...prev,
      pinnedCountry: prev.pinnedCountry === countryName ? null : countryName
    }));
  }, []);

  const closeTooltip = useCallback(() => {
    setState(prev => ({ ...prev, pinnedCountry: null }));
  }, []);


  try {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Globe className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">World Map</h3>
          </div>
          
          <MetricSelector
            selectedMetric={state.selectedMetric}
            onMetricChange={handleMetricChange}
          />
        </div>

        <div 
          className="relative"
          onMouseMove={handleMouseMove}
        >
          <MapVisualization
            geoUrl={GEO_URL}
            countries={coloredCountries}
            selectedMetric={state.selectedMetric}
            hoveredCountry={state.hoveredCountry}
            onCountryClick={handleCountryClick}
            onCountryHover={handleCountryHover}
          />

          {(state.hoveredCountry || state.pinnedCountry) && 
           coloredCountries[state.hoveredCountry || state.pinnedCountry!] && (
            <MapTooltip
              countryName={state.hoveredCountry || state.pinnedCountry!}
              countries={coloredCountries}
              selectedMetric={state.selectedMetric}
              isPinned={!!state.pinnedCountry}
              position={state.tooltipPosition}
              onTogglePin={togglePin}
              onClose={closeTooltip}
            />
          )}
        </div>

        <MapLegend selectedMetric={state.selectedMetric} />
      </div>
    );
  } catch (error) {
    console.error('Error rendering WorldMap:', error);
    return (
      <ErrorState
        title="Map Error"
        message="There was an error loading the world map. Please try refreshing the page."
        showRefreshButton={true}
      />
    );
  }
}
