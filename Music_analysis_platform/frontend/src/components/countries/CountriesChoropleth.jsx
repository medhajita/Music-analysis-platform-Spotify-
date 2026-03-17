import React, { useMemo, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Sphere,
  Graticule,
  ZoomableGroup
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { 
  MAP_COLOR_SCALE, 
  ChartCard, 
  formatNumber 
} from '../../config/charts';

const geoUrl = "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";

const CountriesChoropleth = ({ data, onCountryClick, selectedCountryCode }) => {
  const [hoveredCountry, setHoveredCountry] = useState(null);

  const countryMap = useMemo(() => {
    const map = {};
    if (Array.isArray(data)) {
      data.forEach(item => {
        map[item.country_code] = Number(item.total_artist_streams || 0) + Number(item.total_album_streams || 0);
      });
    }
    return map;
  }, [data]);

  const maxStreams = useMemo(() => {
    const values = Object.values(countryMap);
    return values.length > 0 ? Math.max(...values) : 1;
  }, [countryMap]);

  const colorScale = useMemo(() => {
    return scaleLinear()
      .domain([0, maxStreams / 4, maxStreams / 2, maxStreams * 0.75, maxStreams])
      .range(MAP_COLOR_SCALE);
  }, [maxStreams]);

  return (
    <ChartCard 
      title="Carte des Flux Mondiaux" 
      subtitle="Intensité basée sur le cumul Artistes + Albums"
      data={data}
      height={500}
    >
      <div className="relative h-full w-full bg-[#121212] rounded-2xl overflow-hidden border border-white/5">
        <ComposableMap
          projection="geoNaturalEarth1"
          projectionConfig={{
            scale: 160
          }}
          width={800}
          height={450}
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup>
            <Sphere stroke="#2A2A2A" strokeWidth={0.5} />
            <Graticule stroke="#2A2A2A" strokeWidth={0.5} />
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const { ISO_A2, ADMIN } = geo.properties;
                  const streams = countryMap[ISO_A2] || 0;
                  const isSelected = selectedCountryCode === ISO_A2;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={streams > 0 ? colorScale(streams) : "#2A2A2A"}
                      stroke={isSelected ? "#1DB954" : "#191414"}
                      strokeWidth={isSelected ? 2 : 0.5}
                      onClick={() => onCountryClick && onCountryClick({ code: ISO_A2, name: ADMIN })}
                      onMouseEnter={() => {
                        setHoveredCountry({ name: ADMIN, streams });
                      }}
                      onMouseLeave={() => {
                        setHoveredCountry(null);
                      }}
                      style={{
                        default: { outline: "none" },
                        hover: { fill: "#1ED760", outline: "none", cursor: "pointer" },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
        
        {hoveredCountry && hoveredCountry.streams > 0 && (
          <div className="absolute top-4 left-4 bg-black/90 border border-white/10 p-2 rounded-lg shadow-xl backdrop-blur-md pointer-events-none z-10">
            <p className="text-white font-bold text-xs uppercase">{hoveredCountry.name}</p>
            <p className="text-emerald-400 font-black text-sm">{formatNumber(hoveredCountry.streams)} streams</p>
          </div>
        )}

        <div className="absolute bottom-8 right-8 flex flex-col gap-2 bg-black/40 p-3 rounded-2xl backdrop-blur-md border border-white/10">
          <div className="flex items-center gap-2 text-[10px] text-[#B3B3B3] font-bold uppercase tracking-widest">
            <span>Moins</span>
            <div className="flex gap-0.5">
              {MAP_COLOR_SCALE.map((c, i) => (
                <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }}></div>
              ))}
            </div>
            <span>Plus</span>
          </div>
        </div>
      </div>
    </ChartCard>
  );
};

export default CountriesChoropleth;
