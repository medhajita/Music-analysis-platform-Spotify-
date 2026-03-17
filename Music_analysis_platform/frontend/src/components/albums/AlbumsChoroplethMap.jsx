import React, { useMemo, useRef, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Sphere,
  Graticule,
  ZoomableGroup
} from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { ChartCard } from '../../config/charts';

const geoUrl = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';
const CHOROPLETH_SCALE = ['#5B1A8E', '#6E00A8', '#4C4EA3', '#2AA7B8', '#66D17E', '#FDE725'];

const normalizeCountryCode = (code) => {
  if (!code) return null;
  const cleaned = String(code).trim().toUpperCase();
  if (cleaned === 'UK') return 'GB';
  if (cleaned === 'EL') return 'GR';
  return cleaned.length === 2 ? cleaned : null;
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
  'russian federation': 'russia'
};

const COUNTRY_GROUPS = [
  {
    code: 'US',
    aliases: ['us', 'usa', 'united states', 'united states of america']
  },
  {
    code: 'CA',
    aliases: ['ca', 'can', 'canada']
  },
  {
    code: 'GB',
    aliases: ['gb', 'uk', 'united kingdom', 'great britain']
  }
];

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

const extractGeoIsoAlpha = (props = {}, fallbackA2 = 'N/A') =>
  props.ISO_A3 ||
  props.iso_a3 ||
  props['ISO3166-1-Alpha-3'] ||
  props.ISO3 ||
  props.iso3 ||
  fallbackA2;

const formatMillions = (value) => `${(Number(value || 0) / 1_000_000).toFixed(3)}M`;

const AlbumsChoroplethMap = ({
  data,
  selectedCountryFilter,
  selectedCountryName,
  height = 400,
  title = 'Geo Streams Map',
  subtitle = 'Album streams by country',
  valueField = 'streams_albums',
  countField = '',
  countLabel = 'albums',
  valueLabel = 'streams'
}) => {
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const mapContainerRef = useRef(null);

  const { streamsByCode, streamsByNormalizedName, countryNameByCode } = useMemo(() => {
    const byCode = {};
    const byNormalizedName = {};
    const names = {};

    (data || []).forEach((album) => {
      const streams = Number(album?.[valueField] || 0);
      if (!streams) return;

      const code = normalizeCountryCode(album.country_code);
      if (code) {
        byCode[code] = (byCode[code] || 0) + streams;
        if (album.country && !names[code]) names[code] = album.country;
      }

      if (album.country) {
        const normalized = normalizeCountryName(album.country);
        if (normalized) {
          byNormalizedName[normalized] = (byNormalizedName[normalized] || 0) + streams;
        }
      }
    });

    return { streamsByCode: byCode, streamsByNormalizedName: byNormalizedName, countryNameByCode: names };
  }, [data, valueField]);

  const maxStreams = useMemo(() => {
    const values = [...Object.values(streamsByCode), ...Object.values(streamsByNormalizedName)];
    return values.length > 0 ? Math.max(...values) : 1;
  }, [streamsByCode, streamsByNormalizedName]);

  const colorScale = useMemo(() => {
    return scaleLinear()
      .domain([0, maxStreams * 0.08, maxStreams * 0.2, maxStreams * 0.4, maxStreams * 0.7, maxStreams])
      .range(CHOROPLETH_SCALE);
  }, [maxStreams]);

  const selectedCountryMatchers = useMemo(() => {
    if (!selectedCountryFilter) {
      return { codes: new Set(), names: new Set() };
    }

    const codes = new Set();
    const names = new Set();

    const inputs = [selectedCountryFilter, selectedCountryName].filter(Boolean);
    inputs.forEach((v) => {
      const code = normalizeCountryCode(v);
      if (code) codes.add(code);
      names.add(normalizeCountryName(v));
    });

    COUNTRY_GROUPS.forEach((group) => {
      const matchByCode = group.code && codes.has(group.code);
      const matchByName = group.aliases.some((a) => names.has(normalizeCountryName(a)));
      if (matchByCode || matchByName) {
        codes.add(group.code);
        group.aliases.forEach((a) => names.add(normalizeCountryName(a)));
      }
    });

    return { codes, names };
  }, [selectedCountryFilter, selectedCountryName]);

  const selectionSummary = useMemo(() => {
    if (!selectedCountryFilter) return null;

    const selectedRows = (data || []).filter((row) => {
      const code = normalizeCountryCode(row.country_code);
      const name = normalizeCountryName(row.country);
      const alias = COUNTRY_NAME_ALIASES[name];
      return (
        (code && selectedCountryMatchers.codes.has(code)) ||
        selectedCountryMatchers.names.has(name) ||
        (alias && selectedCountryMatchers.names.has(alias))
      );
    });

    return {
      country: selectedCountryName || selectedCountryFilter,
      count: countField
        ? selectedRows.reduce((acc, row) => acc + Number(row?.[countField] || 0), 0)
        : selectedRows.length,
      streams: selectedRows.reduce((acc, row) => acc + Number(row?.[valueField] || 0), 0)
    };
  }, [data, selectedCountryFilter, selectedCountryName, selectedCountryMatchers, countField, valueField]);

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      data={data}
      height={height}
    >
      <div
        ref={mapContainerRef}
        className="relative h-full w-full bg-[#080A11] rounded-lg overflow-hidden border border-[#2A2F3A]"
      >
        <ComposableMap
          projection="geoNaturalEarth1"
          projectionConfig={{ scale: 160 }}
          width={800}
          height={400}
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomableGroup>
            <Sphere stroke="#2A2F3A" strokeWidth={0.5} />
            <Graticule stroke="#1D2230" strokeWidth={0.45} />
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const geoCode = extractGeoCountryCode(geo.properties);
                  const geoName = extractGeoCountryName(geo.properties);
                  const normalizedGeoName = normalizeCountryName(geoName);
                  const normalizedGeoNameAlias = COUNTRY_NAME_ALIASES[normalizedGeoName];
                  const streams =
                    (geoCode ? streamsByCode[geoCode] : 0) ||
                    streamsByNormalizedName[normalizedGeoName] ||
                    (normalizedGeoNameAlias ? streamsByNormalizedName[normalizedGeoNameAlias] : 0) ||
                    0;
                  const isSelectedGeo =
                    !!selectedCountryFilter &&
                    ((geoCode && selectedCountryMatchers.codes.has(geoCode)) ||
                      selectedCountryMatchers.names.has(normalizedGeoName) ||
                      (normalizedGeoNameAlias && selectedCountryMatchers.names.has(normalizedGeoNameAlias)));
                  const visibleStreams = selectedCountryFilter ? (isSelectedGeo ? streams : 0) : streams;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={visibleStreams > 0 ? colorScale(visibleStreams) : '#11141C'}
                      stroke={isSelectedGeo ? '#53F5DA' : '#3A3F4B'}
                      strokeWidth={isSelectedGeo ? 1.2 : 0.7}
                      onMouseEnter={(evt) => {
                        if (visibleStreams <= 0) return;
                        const rect = mapContainerRef.current?.getBoundingClientRect();
                        const x = rect ? evt.clientX - rect.left : 16;
                        const y = rect ? evt.clientY - rect.top : 16;
                        setHoveredCountry({
                          name: (geoCode ? countryNameByCode[geoCode] : null) || geoName,
                          isoAlpha: extractGeoIsoAlpha(geo.properties, geoCode || 'N/A'),
                          streams: visibleStreams,
                          x,
                          y
                        });
                      }}
                      onMouseMove={(evt) => {
                        const rect = mapContainerRef.current?.getBoundingClientRect();
                        if (!rect) return;
                        setHoveredCountry((prev) => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            x: evt.clientX - rect.left,
                            y: evt.clientY - rect.top
                          };
                        });
                      }}
                      onMouseLeave={() => setHoveredCountry(null)}
                      style={{
                        default: { outline: 'none' },
                        hover: visibleStreams > 0
                          ? { stroke: '#53F5DA', strokeWidth: 1.2, outline: 'none', cursor: 'pointer' }
                          : { stroke: '#2C3040', strokeWidth: 0.5, outline: 'none', cursor: 'default' },
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
          <div
            className="absolute bg-[#0B0F1C] border border-[#22D3EE] p-2 rounded shadow-2xl pointer-events-none z-10 min-w-[170px]"
            style={{ left: `${hoveredCountry.x + 12}px`, top: `${hoveredCountry.y + 12}px` }}
          >
            <p className="text-white font-bold text-xs">{hoveredCountry.name}</p>
            <p className="text-slate-300 text-xs mt-1">iso_alpha={hoveredCountry.isoAlpha}</p>
            <p className="text-cyan-300 text-xs">{valueLabel}={formatMillions(hoveredCountry.streams)}</p>
          </div>
        )}

        <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-black/50 p-3 rounded-lg border border-[#2A2F3A]">
          <div className="flex items-center gap-2 text-[10px] text-[#B3B3B3] font-bold uppercase tracking-widest">
            <span>Moins</span>
            <div className="flex gap-0.5">
              {CHOROPLETH_SCALE.map((c, i) => (
                <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }}></div>
              ))}
            </div>
            <span>Plus</span>
          </div>
          <div className="text-[10px] text-slate-400 flex justify-between">
            <span>{formatMillions(0)}</span>
            <span>{formatMillions(maxStreams)}</span>
          </div>
        </div>

        {selectionSummary && (
          <div className="absolute bottom-4 left-4 bg-black/55 border border-[#2A2F3A] rounded-lg px-3 py-2">
            <p className="text-[10px] text-slate-300 font-bold uppercase">{selectionSummary.country}</p>
            <p className="text-[11px] text-cyan-300">{countLabel}={selectionSummary.count}</p>
            <p className="text-[11px] text-cyan-300">{valueLabel}={formatMillions(selectionSummary.streams)}</p>
          </div>
        )}
      </div>
    </ChartCard>
  );
};

export default AlbumsChoroplethMap;
