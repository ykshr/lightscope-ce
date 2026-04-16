import { useTotalCityQuery, useTotalCountryQuery } from '@/__generated__/graphql';
import { Spinner } from '@/components/common/Loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { useUrlParams } from '@/hooks/useUrl';
import { useQuery } from '@tanstack/react-query';
import * as d3 from 'd3-geo';
import { interpolateRgb } from 'd3-interpolate';
import { select } from 'd3-selection';
import * as d3Zoom from 'd3-zoom';
import i18n from 'i18n-iso-countries';
import { MapPin } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { feature } from 'topojson-client';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

export default function MapCountry() {
  const [urlParams] = useUrlParams();
  const { startDate, endDate, articleFilter } = urlParams;

  const [selectedCountry, setSelectedCountry] = useState<{
    id: string;
    name?: string;
    code: string;
  } | null>(null);

  const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const zoomBehavior = d3Zoom
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        setTransform(event.transform);
      });

    select(svgRef.current).call(zoomBehavior);
  }, []);

  // 1. Fetch map data
  const { data: geographies } = useQuery({
    queryKey: ['geoData'],
    queryFn: async () => {
      const res = await fetch(geoUrl);
      const json = await res.json();
      return (feature(json, json.objects.countries) as unknown as { features: unknown })
        .features as {
        geometry: unknown;
        id?: string | number | undefined;
        properties: { name?: string };
      }[];
    },
    staleTime: Infinity,
  });

  // 2. Statistical data
  const { data: dataCountries } = useTotalCountryQuery({
    startDate,
    endDate,
    articleFilter,
  });

  const countries = useMemo(() => {
    return (
      dataCountries?.trend?.categoryGeo
        ?.filter((d): d is typeof d & { country: string } => !!d.country)
        .map((d) => ({
          id: i18n.alpha2ToNumeric(d.country),
          name: i18n.getName(d.country, 'en'),
          code: d.country,
          value: d.value,
        }))
        .filter((d): d is typeof d & { id: string } => !!d.id) || []
    );
  }, [dataCountries]);

  const { data: dataCities, isLoading: isLoadingCities } = useTotalCityQuery(
    {
      startDate,
      endDate,
      articleFilter,
      country: selectedCountry?.code || '',
    },
    { enabled: !!selectedCountry }
  );
  const cities =
    dataCities?.trend?.categoryGeo
      ?.filter((d): d is typeof d & { city: string } => !!d.city)
      .map((d) => ({ name: d.city, value: d.value, count: d.value })) || [];

  const projection = d3.geoMercator().scale(120).translate([400, 280]);
  const pathGenerator = d3.geoPath().projection(projection);

  const colorScale = useMemo(() => {
    const max = Math.max(...countries.map((d) => d.value), 1);
    return (val: number) => {
      const t = val / max;
      return interpolateRgb('#eff6ff', '#2563eb')(t);
    };
  }, [countries]);

  // Toggle on country click
  const handleCountryClick = (e: React.MouseEvent, d: { id?: string | number }) => {
    e.stopPropagation(); // Prevent background click
    const clickedId = String(d.id);
    if (selectedCountry?.id === clickedId) {
      setSelectedCountry(null); // Reset if same country
    } else {
      const country = countries.find((c) => c.id === clickedId);
      if (!country) return;
      setSelectedCountry({
        id: clickedId,
        name: country.name,
        code: country.code,
      });
    }
  };

  return (
    <Card className="flex flex-col border-border h-full col-span-2">
      <CardHeader className="pb-0">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-4">
          Locations
        </CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-1 lg:grid-cols-4 px-3 gap-4">
        <div className="lg:col-span-3 cursor-grab">
          {/* Map container */}
          <svg
            ref={svgRef}
            viewBox="0 0 800 450"
            className="touch-none outline-none"
            onClick={() => setSelectedCountry(null)} // Reset on background click
          >
            <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
              {geographies?.map(
                (d: { id?: string | number; geometry: unknown; properties: { name?: string } }) => {
                  if (!d.id) return;
                  const stat = countries.find((s) => s.id === String(d.id));
                  const isSelected = d.id != null && selectedCountry?.id === String(d.id);
                  return (
                    <path
                      key={d.id}
                      d={pathGenerator(d as d3.GeoPermissibleObjects) || ''}
                      fill={stat ? colorScale(stat.value) : '#ffffff'}
                      stroke={isSelected ? '#2563eb' : '#cbd5e1'}
                      strokeWidth={isSelected ? 1.5 / transform.k : 0.5 / transform.k}
                      className="cursor-pointer hover:opacity-80"
                      onClick={(e) => handleCountryClick(e, d)}
                    />
                  );
                }
              )}
            </g>
          </svg>
        </div>

        {/* List section */}
        <div className="lg:col-span-1 flex flex-col">
          <div className="pb-3 border-b">
            <h3 className="text-xs font-bold flex justify-center text-muted-foreground items-center gap-2">
              {selectedCountry ? (
                <>
                  <MapPin className="h-3 w-3 text-blue-500" />
                  {selectedCountry.name}
                </>
              ) : (
                'Top Countries'
              )}
            </h3>
          </div>
          <ScrollArea className="flex-1 px-2">
            {isLoadingCities ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : (
              <Table>
                <TableBody>
                  {selectedCountry
                    ? cities.map((city: { name: string; value: number; count?: number }) => (
                        <TableRow key={city.name} className="hover:bg-transparent">
                          <TableCell className="py-2 text-xs font-medium">{city.name}</TableCell>
                          <TableCell className="py-2 text-right text-xs font-mono">
                            {city.count?.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                    : countries
                        .sort((a, b) => b.value - a.value)
                        .map((c) => (
                          <TableRow
                            key={c.id}
                            className="cursor-pointer transition-colors"
                            onClick={() =>
                              setSelectedCountry({
                                id: c.id,
                                name: c.name,
                                code: c.code,
                              })
                            }
                          >
                            <TableCell className="py-2 text-xs font-medium">{c.name}</TableCell>
                            <TableCell className="py-2 text-right text-xs font-mono">
                              {c.value.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
