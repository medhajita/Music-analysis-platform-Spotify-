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

const SongGlobalCoverageMap = ({ coverage, songName }) => {
  const [hoveredCountry, setHoveredCountry] = useState(null);

  const normalizeCountryCode = (code) => {
    if (!code) return null;
    const cleaned = String(code).trim().toUpperCase();
    if (cleaned === 'UK') return 'GB';
    if (cleaned === 'EL') return 'GR';
    return cleaned.length === 2 ? cleaned : null;
  };

  const { byCode, byName, countryNameByCode } = useMemo(() => {
    const codeMap = {};
    const nameMap = {};
    const names = {};

    (coverage || []).forEach((item) => {
      const streams = Number(item.total_streams_song_per_country || 0);
      if (!streams) return;

      const code = normalizeCountryCode(item.streamed_country_code);
      if (code) {
        codeMap[code] = (codeMap[code] || 0) + streams;
        if (item.streamed_country && !names[code]) names[code] = item.streamed_country;
      }

      if (item.streamed_country) {
        nameMap[item.streamed_country] = (nameMap[item.streamed_country] || 0) + streams;
      }
    });

    return { byCode: codeMap, byName: nameMap, countryNameByCode: names };
  }, [coverage]);

  const maxStreams = useMemo(() => {
    const values = [...Object.values(byCode), ...Object.values(byName)];
    return values.length > 0 ? Math.max(...values) : 1;
  }, [byCode, byName]);

  const colorScale = useMemo(() => {
    return scaleLinear()
      .domain([0, maxStreams / 4, maxStreams / 2, maxStreams * 0.75, maxStreams])
      .range(MAP_COLOR_SCALE);
  }, [maxStreams]);

  return (
    <ChartCard 
      title="Couverture Mondiale" 
      subtitle={songName || "Sélectionnez une chanson"}
      data={coverage}
      height={400}
    >
      <div className="relative h-full w-full bg-[#121212] rounded-lg overflow-hidden border border-white/5">
        <ComposableMap
          projection="geoNaturalEarth1"
          projectionConfig={{
            scale: 170
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
                  const { ISO_A2, ADMIN } = geo.properties;
                  const streams = byCode[ISO_A2] || byName[ADMIN] || 0;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={streams > 0 ? colorScale(streams) : "#2A2A2A"}
                      stroke="#191414"
                      strokeWidth={0.5}
                      onMouseEnter={() => {
                        setHoveredCountry({
                          name: countryNameByCode[ISO_A2] || ADMIN,
                          streams
                        });
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

export default SongGlobalCoverageMap;
