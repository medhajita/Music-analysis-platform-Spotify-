import React, { useMemo, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Sphere,
  Graticule,
  ZoomableGroup
} from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import {
  MAP_COLOR_SCALE,
  ChartCard,
  formatNumber
} from '../../config/charts';

const geoUrl = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';

const normalizeCountryCode = (code) => {
  if (!code) return null;
  const cleaned = String(code).trim().toUpperCase();
  if (cleaned === 'UK') return 'GB';
  if (cleaned === 'EL') return 'GR';
  return /^[A-Z]{2}$/.test(cleaned) ? cleaned : null;
};

const normalizeCountryName = (name) =>
  String(name || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,'’()-]/g, ' ')
    .replace(/\s+/g, ' ');

const COUNTRY_NAME_ALIASES = {
  'united states': 'united states of america',
  usa: 'united states of america',
  uk: 'united kingdom',
  'korea republic of': 'south korea',
  'republic of korea': 'south korea',
  turkiye: 'turkey',
  'russian federation': 'russia',
  'czech republic': 'czechia'
};

const extractGeoCountryCode = (props = {}) =>
  normalizeCountryCode(
    props.ISO_A2 ||
      props.iso_a2 ||
      props['ISO3166-1-Alpha-2'] ||
      props.ISO2 ||
      props.iso2 ||
      props.ADM0_A2
  );

const extractGeoCountryName = (props = {}) =>
  props.ADMIN || props.NAME || props.name || props.SOVEREIGNT || props.COUNTRY || '';

const CountriesChoropleth = ({ data, onCountryClick, selectedCountryCode, selectedCountryName, mode = 'streams', selectedOnly = false }) => {
  const [hoveredCountry, setHoveredCountry] = useState(null);

  const { streamsByCode, streamsByName, countryNameByCode } = useMemo(() => {
    const byCode = {};
    const byName = {};
    const namesByCode = {};
    const useWorldStreams = mode === 'streams';

    if (Array.isArray(data)) {
      data.forEach((item) => {
        const streamsRaw = useWorldStreams
          ? Number(item.total_world_streams || 0)
          : Number(item.total_artist_streams || 0) + Number(item.total_album_streams || 0);
        const streams = useWorldStreams
          ? streamsRaw || Number(item.total_songs_count || 0)
          : streamsRaw;
        if (!streams) return;

        const code = normalizeCountryCode(item.country_code);
        if (code) {
          byCode[code] = (byCode[code] || 0) + streams;
          if (item.country && !namesByCode[code]) {
            namesByCode[code] = item.country;
          }
        }

        const name = normalizeCountryName(item.country);
        if (name) {
          byName[name] = (byName[name] || 0) + streams;
          const alias = COUNTRY_NAME_ALIASES[name];
          if (alias) byName[alias] = (byName[alias] || 0) + streams;
        }
      });
    }

    return { streamsByCode: byCode, streamsByName: byName, countryNameByCode: namesByCode };
  }, [data, mode]);

  const maxStreams = useMemo(() => {
    const values = [...Object.values(streamsByCode), ...Object.values(streamsByName)];
    return values.length > 0 ? Math.max(...values) : 1;
  }, [streamsByCode, streamsByName]);

  const colorScale = useMemo(() => {
    return scaleLinear()
      .domain([0, maxStreams / 4, maxStreams / 2, maxStreams * 0.75, maxStreams])
      .range(MAP_COLOR_SCALE);
  }, [maxStreams]);

  const selectedCode = normalizeCountryCode(selectedCountryCode);
  const selectedName = normalizeCountryName(selectedCountryName);
  const selectedAlias = COUNTRY_NAME_ALIASES[selectedName];
  const hasSelection = Boolean(selectedCode || selectedName);
  const limitToSelected = selectedOnly && hasSelection;

  return (
    <ChartCard
      title="Carte des Flux Mondiaux"
      subtitle={mode === 'streams'
        ? 'Streams des titres par pays (source mondiale)'
        : 'Intensite basee sur le cumul Artistes + Albums'}
      data={data}
      height={500}
    >
      <div className="relative h-full w-full bg-[#121212] rounded-2xl overflow-hidden border border-white/5">
        <ComposableMap
          projection="geoNaturalEarth1"
          projectionConfig={{ scale: 160 }}
          width={800}
          height={450}
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomableGroup>
            <Sphere stroke="#2A2A2A" strokeWidth={0.5} />
            <Graticule stroke="#2A2A2A" strokeWidth={0.5} />
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const geoCode = extractGeoCountryCode(geo.properties);
                  const geoLabel = extractGeoCountryName(geo.properties);
                  const geoName = normalizeCountryName(geoLabel);
                  const geoAlias = COUNTRY_NAME_ALIASES[geoName];
                  const streams =
                    (geoCode ? streamsByCode[geoCode] : 0) ||
                    streamsByName[geoName] ||
                    (geoAlias ? streamsByName[geoAlias] : 0) ||
                    0;
                  const isSelected =
                    (selectedCode && geoCode === selectedCode) ||
                    (selectedName && geoName === selectedName) ||
                    (selectedAlias && geoName === selectedAlias);
                  const visibleStreams = limitToSelected ? (isSelected ? streams : 0) : streams;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={visibleStreams > 0 ? colorScale(visibleStreams) : '#2A2A2A'}
                      stroke={isSelected ? '#1DB954' : '#191414'}
                      strokeWidth={isSelected ? 2 : 0.5}
                      onClick={() => {
                        if (!streams || !onCountryClick || !geoCode) return;
                        onCountryClick({
                          code: geoCode,
                          name: (geoCode && countryNameByCode[geoCode]) || geoLabel
                        });
                      }}
                      onMouseEnter={() => {
                        if (visibleStreams <= 0) return;
                        setHoveredCountry({
                          name: (geoCode && countryNameByCode[geoCode]) || geoLabel,
                          streams: visibleStreams
                        });
                      }}
                      onMouseLeave={() => {
                        setHoveredCountry(null);
                      }}
                      style={{
                        default: { outline: 'none' },
                        hover: visibleStreams > 0
                          ? { fill: '#1ED760', outline: 'none', cursor: 'pointer' }
                          : { fill: '#2A2A2A', outline: 'none', cursor: 'default' },
                        pressed: { outline: 'none' }
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
            <p className="text-emerald-400 font-black text-sm">
              {formatNumber(hoveredCountry.streams)} {mode === 'streams' ? 'streams' : 'streams locaux'}
            </p>
          </div>
        )}

        <div className="absolute bottom-8 right-8 flex flex-col gap-2 bg-black/40 p-3 rounded-2xl backdrop-blur-md border border-white/10">
          <div className="flex items-center gap-2 text-[10px] text-[#B3B3B3] font-bold uppercase tracking-widest">
            <span>Moins</span>
            <div className="flex gap-0.5">
              {MAP_COLOR_SCALE.map((c, i) => (
                <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
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
