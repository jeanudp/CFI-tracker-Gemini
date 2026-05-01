import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, Maximize, Map as MapIcon, Plane, Check, X, Search } from 'lucide-react';
import { cn } from '../lib/utils';

// Fix for default marker icon in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const AIRPORT_COORDS: Record<string, [number, number]> = {
  // PNW
  'KPDX': [45.5886, -122.5975],
  'KTTD': [45.5494, -122.4017],
  'KHIO': [45.5404, -122.9498],
  'KSLE': [44.9095, -123.0025],
  'KMMV': [45.1951, -123.1353],
  'KAST': [46.1581, -123.8786],
  'KONP': [44.5803, -124.0583],
  'KRDM': [44.2541, -121.1500],
  'KBNO': [43.5905, -119.0551],
  'KEUG': [44.1207, -123.2185],
  'KMFR': [42.3742, -122.8735],
  'KOTH': [43.4171, -124.2460],
  'KGEG': [47.6199, -117.5338],
  'KSFF': [47.6744, -117.3228],
  'KPSC': [46.2647, -119.1190],
  'KYKM': [46.5682, -120.5441],
  'KHQM': [46.9744, -123.9304],
  'KCLM': [48.1202, -123.4996],
  'KBLI': [48.7925, -122.5375],
  'KAWO': [48.1606, -122.1586],
  'KPAE': [47.9063, -122.2811],
  'KRNT': [47.4931, -122.2158],
  'KBFI': [47.5300, -122.3019],
  'KSEA': [47.4502, -122.3088],
  // Major US
  'KLAX': [33.9416, -118.4085],
  'KSFO': [37.6191, -122.3749],
  'KOAK': [37.7214, -122.2208],
  'KSJC': [37.3639, -121.9289],
  'KSAN': [32.7338, -117.1933],
  'KLAS': [36.0840, -115.1537],
  'KPHX': [33.4342, -112.0116],
  'KDEN': [39.8561, -104.6737],
  'KDFW': [32.8998, -97.0403],
  'KIAH': [29.9902, -95.3368],
  'KATL': [33.6407, -84.4277],
  'KMIA': [25.7959, -80.2870],
  'KORD': [41.9742, -87.9073],
  'KBOS': [42.3656, -71.0096],
  'KJFK': [40.6413, -73.7781],
  'KEWR': [40.6895, -74.1745],
  'KDCA': [38.8512, -77.0402],
  'KIAD': [38.9531, -77.4565],
};

const COLORS = ['#1a3a5c', '#2d7a4f', '#e8a020', '#7c3aed', '#c0392b', '#0891b2'];

interface Lesson {
  id: string;
  label: string;
  saved_at: string;
  meta: {
    route?: string;
    totalFlight?: string;
  };
}

interface RouteMapProps {
  lessons: Lesson[];
  studentName: string;
}

const FitBoundsButton = ({ coords }: { coords: [number, number][] }) => {
  const map = useMap();
  
  const handleFit = () => {
    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  return (
    <button
      onClick={handleFit}
      className="absolute top-4 right-4 z-[1000] bg-white border border-[#dde3ec] rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#1a3a5c] shadow-sm hover:bg-[#f8fafc] flex items-center gap-2 transition-colors"
    >
      <Maximize size={12} />
      Fit All Routes
    </button>
  );
};

export default function RouteMap({ lessons, studentName: _studentName }: RouteMapProps) {
  const [visibleLessonIds, setVisibleLessonIds] = useState<Set<string>>(new Set(lessons.map(l => l.id)));

  const parsedRoutes = useMemo(() => {
    return lessons.map((lesson, idx) => {
      const routeStr = lesson.meta.route || '';
      const tokens = routeStr.split(/[- ]+/).map(t => t.toUpperCase().trim());
      const airports = tokens
        .filter(t => t.length >= 3 && t.length <= 4 && (t.startsWith('K') || t.startsWith('P')))
        .filter((t, i, arr) => t !== arr[i - 1]); // Remove consecutive duplicates
      
      const coords = airports
        .map(icao => AIRPORT_COORDS[icao])
        .filter((coord): coord is [number, number] => !!coord);

      return {
        lesson,
        airports,
        coords,
        color: COLORS[idx % COLORS.length]
      };
    }).filter(r => r.coords.length >= 2);
  }, [lessons]);

  const allVisibleCoords = useMemo(() => {
    return parsedRoutes
      .filter(r => visibleLessonIds.has(r.lesson.id))
      .flatMap(r => r.coords);
  }, [parsedRoutes, visibleLessonIds]);

  const uniqueAirports = useMemo(() => {
    const map = new Map<string, [number, number]>();
    parsedRoutes.forEach(r => {
      r.airports.forEach(icao => {
        const coord = AIRPORT_COORDS[icao];
        if (coord) map.set(icao, coord);
      });
    });
    return Array.from(map.entries());
  }, [parsedRoutes]);

  const toggleLesson = (id: string) => {
    setVisibleLessonIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="bg-white rounded-[2rem] border border-[#dde3ec] overflow-hidden shadow-sm flex flex-col">
      <div className="px-6 py-4 border-b border-[#dde3ec] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-[#1a3a5c] flex items-center gap-2">
            <MapIcon size={20} />
            Flight Route Map
          </h3>
          <p className="text-[10px] text-[#6b7280] font-black uppercase tracking-widest mt-0.5">Visualization of logged training routes</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {parsedRoutes.map(item => (
            <button
              key={item.lesson.id}
              onClick={() => toggleLesson(item.lesson.id)}
              className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border shadow-sm flex items-center gap-2"
              style={{
                backgroundColor: visibleLessonIds.has(item.lesson.id) ? item.color : '#f1f5f9',
                color: visibleLessonIds.has(item.lesson.id) ? 'white' : '#6b7280',
                borderColor: visibleLessonIds.has(item.lesson.id) ? item.color : '#dde3ec'
              }}
            >
              <Plane size={10} className={visibleLessonIds.has(item.lesson.id) ? "text-white" : "text-[#6b7280]"} />
              {item.lesson.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-[500px] w-full bg-[#f4f5f7]">
        {parsedRoutes.length > 0 ? (
          <MapContainer
            center={[45.59, -122.60]}
            zoom={7}
            style={{ height: '100%', width: '100%' }}
            className="z-10"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <FitBoundsButton coords={allVisibleCoords} />

            {parsedRoutes.map((route, idx) => (
              visibleLessonIds.has(route.lesson.id) && (
                <Polyline
                  key={`${route.lesson.id}-${idx}`}
                  positions={route.coords}
                  pathOptions={{ color: route.color, weight: 3, opacity: 0.7, lineJoin: 'round' }}
                >
                  <Popup>
                    <div className="min-w-[150px]">
                      <div className="text-[10px] font-black uppercase tracking-widest text-[#6b7280] mb-1">
                        {new Date(route.lesson.saved_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="text-sm font-black text-[#1a3a5c] mb-1">{route.lesson.label}</div>
                      <div className="flex items-center justify-between text-xs font-mono font-bold pt-2 border-t border-[#f1f5f9]">
                        <span className="text-[#1a3a5c]">{route.lesson.meta.route}</span>
                        <span className="text-[#2d7a4f]">{route.lesson.meta.totalFlight}h</span>
                      </div>
                    </div>
                  </Popup>
                </Polyline>
              )
            ))}

            {uniqueAirports.map(([icao, coord]) => (
              <CircleMarker
                key={icao}
                center={coord}
                radius={6}
                pathOptions={{ color: '#1a3a5c', fillColor: 'white', fillOpacity: 1, weight: 2 }}
              >
                <Popup>
                  <div className="text-xs font-black text-[#1a3a5c]">{icao}</div>
                </Popup>
              </CircleMarker>
            ))}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 z-[1000] bg-white border border-[#dde3ec] rounded-xl p-3 shadow-lg min-w-[140px] pointer-events-none sm:pointer-events-auto">
              <div className="text-[9px] font-black uppercase tracking-widest text-[#6b7280] mb-2 border-b border-[#f1f5f9] pb-1">Legend</div>
              <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                {parsedRoutes.map(route => (
                  <div key={route.lesson.id} className="flex items-center gap-2 opacity-90">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: route.color }} />
                    <div className="min-w-0">
                      <div className="text-[10px] font-black text-[#1a3a5c] truncate">{route.lesson.label}</div>
                      <div className="text-[8px] font-bold text-[#6b7280]">{new Date(route.lesson.saved_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </MapContainer>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#6b7280] p-6 text-center">
            <Layers size={48} className="opacity-10 mb-4" />
            <h4 className="text-sm font-black text-[#1a3a5c] mb-1">No routes logged yet</h4>
            <p className="text-xs font-medium max-w-[280px]">
              Add a route when logging flight lessons, for example <span className="font-mono bg-[#f1f5f9] px-1 rounded">KPDX-KTTD-KPDX</span>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
