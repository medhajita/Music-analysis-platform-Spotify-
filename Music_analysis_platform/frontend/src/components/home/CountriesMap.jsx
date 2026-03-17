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

const CountriesMap = ({ data }) => {
  const [hoveredCountry, setHoveredCountry] = useState(null);

  const colorScale = useMemo(() => {
    const counts = data.map(d => d.count);
    return scaleLinear()
      .domain([0, Math.max(...counts, 1) / 4, Math.max(...counts, 1) / 2, Math.max(...counts, 1) * 0.75, Math.max(...counts, 1)])
      .range(MAP_COLOR_SCALE);
  }, [data]);

  const countryDataMap = useMemo(() => {
    const map = {};
    data.forEach(d => {
      map[d.country] = d.count;
    });
    return map;
  }, [data]);

  return (
    <ChartCard 
      title="Géo-répartition des Artistes" 
      subtitle="Densité présence artistique par pays"
      data={data}
      height={400}
    >
      <div className="relative h-full w-full bg-[#121212] rounded-lg overflow-hidden border border-white/5">
        <ComposableMap
          projection="geoNaturalEarth1"
          projectionConfig={{
            scale: 160
          }}
          width={800}
          height={400}
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup>
            <Sphere stroke="#2A2A2A" strokeWidth={0.5} />
            <Graticule stroke="#2A2A2A" strokeWidth={0.5} />
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const { ADMIN } = geo.properties;
                  const count = countryDataMap[ADMIN] || 0;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={count > 0 ? colorScale(count) : "#2A2A2A"}
                      stroke="#191414"
                      strokeWidth={0.5}
                      onMouseEnter={() => {
                        setHoveredCountry({ name: ADMIN, count });
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
        
        {hoveredCountry && (
          <div className="absolute top-4 left-4 bg-black/90 border border-white/10 p-2 rounded-lg shadow-xl backdrop-blur-md pointer-events-none z-10">
            <p className="text-white font-bold text-xs uppercase">{hoveredCountry.name}</p>
            <p className="text-emerald-400 font-black text-sm">{formatNumber(hoveredCountry.count)} artistes</p>
          </div>
        )}

        <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-black/40 p-3 rounded-lg backdrop-blur-md border border-white/5">
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

export default CountriesMap;
