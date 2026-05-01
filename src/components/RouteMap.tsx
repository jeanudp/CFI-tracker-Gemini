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
  // --- OREGON (PNW) ---
  'KPDX': [45.5886, -122.5975], 'KTTD': [45.5494, -122.4017], 'KHIO': [45.5404, -122.9498],
  'KSLE': [44.9095, -123.0025], 'KMMV': [45.1951, -123.1353], 'KAST': [46.1581, -123.8786],
  'KONP': [44.5803, -124.0583], 'KRDM': [44.2541, -121.1500], 'KBNO': [43.5905, -119.0551],
  'KEUG': [44.1207, -123.2185], 'KMFR': [42.3742, -122.8735], 'KOTH': [43.4171, -124.2460],
  'KCVO': [44.5056, -123.2894], 'KBDN': [44.0946, -121.2003], 'KHMT': [43.5905, -119.0551],
  'KLMT': [42.1561, -121.7333], 'KONO': [44.0322, -117.0131], 'KPDT': [45.6950, -118.8414],
  
  // --- WASHINGTON (PNW) ---
  'KSEA': [47.4502, -122.3088], 'KBFI': [47.5300, -122.3019], 'KRNT': [47.4931, -122.2158],
  'KPAE': [47.9063, -122.2811], 'KBLI': [48.7925, -122.5375], 'KPSC': [46.2647, -119.1190],
  'KGEG': [47.6199, -117.5338], 'KSFF': [47.6744, -117.3228], 'KYKM': [46.5682, -120.5441],
  'KMWH': [47.2077, -119.3204], 'KEAT': [47.3981, -120.2069], 'KCLM': [48.1202, -123.4996],
  'KHQM': [46.9744, -123.9304], 'KAWO': [48.1606, -122.1586], 'KTIW': [47.2675, -122.5783],
  'KOLM': [46.9697, -122.9031], 'KSHN': [47.2333, -123.1481], 'KBKE': [44.8378, -117.8089],
  'KPUW': [46.7439, -117.1094], 'KLWS': [46.3745, -117.0155], 'KCOE': [47.7741, -116.8197],
  
  // --- CALIFORNIA ---
  'KLAX': [33.9416, -118.4085], 'KSFO': [37.6191, -122.3749], 'KOAK': [37.7214, -122.2208],
  'KSJC': [37.3639, -121.9289], 'KSAN': [32.7338, -117.1933], 'KSNA': [33.6757, -117.8676],
  'KBUR': [34.2007, -118.3590], 'KONT': [34.0560, -117.6012], 'KLGB': [33.8177, -118.1516],
  'KSMF': [38.6954, -121.5908], 'KFAT': [36.7762, -119.7181], 'KMRY': [36.5870, -121.8430],
  'KSBP': [35.2371, -120.6424], 'KSBA': [34.4262, -119.8404], 'KOXR': [34.2008, -119.2072],
  'KCMA': [34.2137, -119.0934], 'KVNY': [34.2098, -118.4899], 'KEMT': [34.0860, -118.0348],
  'KWHP': [34.2594, -118.4135], 'KRHV': [37.3323, -121.8198], 'KSQL': [37.5137, -122.2497],
  'KPAO': [37.4611, -122.1151], 'KCCR': [37.9914, -122.0565], 'KHWD': [37.6590, -122.1216],
  'KLVK': [37.6934, -121.8204], 'KSMX': [34.8989, -120.4578], 'KBFL': [35.4336, -119.0577],
  'KRIV': [33.8833, -117.2651], 'KPSP': [33.8297, -116.5067], 'KTRM': [33.6267, -116.1594],
  'KIPL': [32.8342, -115.5786], 'KMMH': [37.6719, -118.8378], 'KTVL': [38.8939, -119.9953],
  'KBIH': [37.3731, -118.3639], 'KMCE': [37.2847, -120.5136], 'KSCK': [37.8942, -121.2358],
  'KMOD': [37.6258, -120.9544], 'KCIC': [39.7954, -121.8584], 'KRDD': [40.5090, -122.2934],
  'KACV': [40.9781, -124.1086], 'KCEC': [41.7802, -124.2367], 'KMYV': [39.0983, -121.5681],
  'KTSP': [35.1270, -118.1756], 'KPRB': [35.6730, -120.6272], 'KSNS': [36.6628, -121.6065],
  'KWVI': [36.9358, -121.7892], 'KSTS': [38.5091, -122.8128], 'KAPC': [38.2132, -122.2806],
  'KUKI': [39.1258, -123.2008], 'KMER': [37.3805, -120.5681], 'KVIS': [36.3186, -119.3928],
  
  // --- MOUNTAIN (AZ, CO, NV, UT, ID, MT, WY) ---
  'KPHX': [33.4342, -112.0116], 'KTUS': [32.1161, -110.9411], 'KFLG': [35.1385, -111.6712],
  'KPRC': [34.6545, -112.4196], 'KDEN': [39.8561, -104.6737], 'KCOS': [38.8058, -104.7003],
  'KGJT': [39.1233, -108.5267], 'KLAS': [36.0840, -115.1537], 'KRNO': [39.4986, -119.7681],
  'KSLC': [40.7899, -111.9791], 'KOGD': [41.1961, -112.0114], 'KPVU': [40.2192, -111.7233],
  'KBOI': [43.5644, -116.2228], 'KPIH': [42.9113, -112.5958], 'KIDA': [43.5146, -112.0702],
  'KHLN': [46.6068, -111.9827], 'KBIL': [45.8077, -110.5186], 'KMSO': [46.9163, -114.0906],
  'KBZN': [45.7772, -111.1517], 'KGPI': [48.3105, -114.2550], 'KCYS': [41.1557, -104.8118],
  'KCPR': [42.9080, -106.4644], 'KJAC': [43.6073, -110.7377], 'KDVT': [33.6882, -112.0825],
  'KSDL': [33.6228, -111.9105], 'KFFZ': [33.4608, -111.7283], 'KIWA': [33.3078, -111.6555],
  'KGYR': [33.4208, -112.4103], 'KDRA': [36.6214, -116.0225], 'KHND': [35.9728, -115.1344],
  'KVGT': [36.2107, -115.1944], 'KBVU': [35.9469, -114.8582], 'KENV': [40.7411, -114.0306],
  
  // --- TEXAS & SOUTH CENTRAL ---
  'KDFW': [32.8998, -97.0403], 'KDAL': [32.8471, -96.8518], 'KIAH': [29.9902, -95.3368],
  'KHOU': [29.6454, -95.2789], 'KAUS': [30.1944, -97.6700], 'KSAT': [29.5337, -98.4697],
  'KELP': [31.8072, -106.3774], 'KAMA': [35.2194, -101.7059],
  'KLBB': [33.6636, -101.8228], 'KMAF': [31.9425, -102.2019], 'KABI': [32.4113, -99.6819],
  'KACT': [31.6113, -97.2305], 'KGRK': [31.0673, -97.8289], 'KTYR': [32.3541, -95.4024],
  'KSPS': [33.9888, -98.4919], 'KCRP': [27.7704, -97.5019], 'KBPT': [29.9508, -94.0206],
  'KBRW': [25.9068, -97.4258], 'KHRL': [26.2285, -97.6543], 'KMFE': [26.1758, -98.2386],
  'KLRD': [27.5438, -99.4616], 'KOKC': [35.3931, -97.6007], 'KTUL': [36.1984, -95.8881],
  'KLIT': [34.7294, -92.2247], 'KXNA': [36.2819, -94.3069], 'KMSY': [29.9911, -90.2592],
  'KBTR': [30.5330, -91.1496], 'KSHV': [32.4466, -93.8256], 'KADS': [32.9686, -96.8364],
  'KTKI': [33.1778, -96.5906], 'KGKY': [32.6641, -97.0933], 'KFTW': [32.8197, -97.3627],
  'KAFW': [32.9875, -97.3203], 'KDWH': [30.0617, -95.5528], 'KTME': [29.8039, -95.8972],
  'KCXO': [30.3586, -95.4144], 'KGTU': [30.6787, -97.6797], 'KSSF': [29.3389, -98.4719],
  
  // --- FLORIDA & SOUTH ---
  'KMIA': [25.7959, -80.2870], 'KFLL': [26.0726, -80.1527], 'KPBI': [26.6832, -80.0956],
  'KTPA': [27.9755, -82.5332], 'KMCO': [28.4294, -81.3089], 'KSFB': [28.7776, -81.2375],
  'KORL': [28.5455, -81.3329], 'KJAX': [30.4941, -81.6879], 'KRSW': [26.5362, -81.7551],
  'KSRQ': [27.3956, -82.5544], 'KTLH': [30.3965, -84.3503], 'KPNS': [30.4734, -87.1874],
  'KVPS': [30.4832, -86.5254], 'KECP': [30.3571, -85.7953], 'KDAB': [29.1799, -81.0581],
  'KMLB': [28.1028, -80.6453], 'KOCF': [29.1772, -82.2233], 'KGNV': [29.6901, -82.2717],
  'KPIE': [27.9102, -82.6874], 'KPGD': [26.9174, -81.9934], 'KAPF': [26.1524, -81.7751],
  'KMKY': [25.9080, -81.6669], 'KEYW': [24.5561, -81.7596], 'KOPF': [25.9070, -80.2784],
  'KHWO': [25.9983, -80.2408], 'KFXE': [26.1973, -80.1707], 'KBCT': [26.3785, -80.1077],
  'KLAL': [27.9889, -82.0186], 'KVDF': [28.0139, -82.3453], 'KSPG': [27.7651, -82.6270],
  'KATL': [33.6407, -84.4277], 'KSAV': [32.1276, -81.2021],
  'KCLT': [35.2144, -80.9473], 'KRDU': [35.8776, -78.7875], 'KGSO': [36.0978, -79.9373],
  'KCHS': [32.8986, -80.0405], 'KBNA': [36.1245, -86.6782], 'KMEM': [35.0424, -89.9767],
  'KTYS': [35.8110, -83.9940], 'KCHA': [35.0353, -85.2038], 'KBHM': [33.5629, -86.7535],
  'KHSV': [34.6469, -86.7731], 'KMOB': [30.6914, -88.2428], 'KJAN': [32.3112, -90.0759],
  
  // --- MIDWEST ---
  'KORD': [41.9742, -87.9073], 'KMDW': [41.7860, -87.7524], 'KMSP': [44.8848, -93.2223],
  'KDTW': [42.2124, -83.3533], 'KSTL': [38.7477, -90.3597], 'KCLE': [41.4108, -81.8494],
  'KCVG': [39.0461, -84.6622], 'KIND': [39.7173, -86.2941], 'KMKE': [42.9472, -87.8967],
  'KSTP': [44.9345, -93.0599], 'KFSD': [43.5817, -96.7417], 'KOMA': [41.3025, -95.8941],
  'KMCI': [39.2976, -94.7139], 'KLNK': [40.8509, -96.7592], 'KDSM': [41.5340, -93.6631],
  'KGRR': [42.8808, -85.5228], 'KAZO': [42.2349, -85.5520], 'KLAN': [42.7787, -84.5874],
  'KFNT': [42.9654, -83.7436], 'KTVC': [44.7417, -85.5822], 'KMSN': [43.1398, -89.3375],
  'KSBN': [41.7086, -86.3173], 'KCMH': [40.0001, -82.8919], 'KCAK': [40.9161, -81.4422],
  'KDAY': [39.9024, -84.2194], 'KSDF': [38.1744, -85.7361], 'KLEX': [38.0365, -84.6059],
  'KPWK': [42.1143, -87.9015], 'KDPA': [41.9078, -88.2486], 'KARR': [41.7719, -88.4756],
  'KPTK': [42.6657, -83.3939], 'KYIP': [42.2380, -83.5303], 'KDET': [42.4092, -83.0102],
  'KSUS': [38.6625, -90.6464], 'KSET': [38.8358, -90.4311], 'KCOU': [38.8181, -92.2196],
  'KSGF': [37.2357, -93.3886], 'KCID': [41.8847, -91.7108], 'KMLI': [41.4485, -90.5075],
  
  // --- NORTHEAST ---
  'KJFK': [40.6413, -73.7781], 'KEWR': [40.6895, -74.1745], 'KLGA': [40.7769, -73.8740],
  'KPHL': [39.8721, -75.2411], 'KBOS': [42.3656, -71.0096], 'KBWI': [39.1754, -76.6683],
  'KIAD': [38.9531, -77.4565], 'KDCA': [38.8512, -77.0402], 'KPVD': [41.7240, -71.4282],
  'KBDL': [41.9389, -72.6832], 'KMHT': [42.9297, -71.4352], 'KPWM': [43.6462, -70.3084],
  'KBTV': [44.4719, -73.1533], 'KALB': [42.7481, -73.8020], 'KBUF': [42.9405, -78.7322],
  'KROC': [43.1189, -77.6724], 'KSYR': [43.1112, -76.1063], 'KABE': [40.6521, -75.4404],
  'KAVP': [41.3385, -75.7234], 'KHPN': [41.0670, -73.7075], 'KISP': [40.7952, -73.1002],
  'KSWF': [41.5041, -74.1048], 'KTEB': [40.8501, -74.0608], 'KCDW': [40.8752, -74.2814],
  'KMMU': [40.7994, -74.4149], 'KTTN': [40.2767, -74.8134], 'KACY': [39.4576, -74.5772],
  'KILG': [39.6787, -75.6065], 'KMDQ': [34.7500, -86.5833], 'KPNE': [40.0819, -75.0106],
  'KRIC': [37.5052, -77.3200], 'KORF': [36.8946, -76.2012], 'KPHF': [37.1319, -76.4930],
  'KROA': [37.3255, -79.9754], 'KCHO': [38.1386, -78.4529], 'KLYH': [37.3267, -79.2004],
  
  // --- ALASKA (PA) ---
  'PANC': [61.1744, -149.9964], 'PAFA': [64.8151, -147.8597], 'PAJN': [58.3547, -134.5763],
  'PAKT': [55.3556, -131.7136], 'PASI': [57.0471, -135.3611], 'PAYA': [59.5033, -139.6603],
  'PACD': [55.2056, -162.7247], 'PADK': [51.8780, -176.6461], 'PADL': [59.0447, -158.5033],
  'PAEN': [60.5731, -151.2450], 'PABR': [71.2854, -156.7660], 'PAOR': [61.9969, -145.4744],
  'PAOT': [66.8847, -162.5986], 'PASC': [70.1947, -148.4651], 'PAGM': [61.5303, -149.0717],
  'PAOM': [64.5106, -165.4450], 'PAUN': [53.8997, -166.5433], 'PAVD': [61.1340, -146.2483],
  'PAHO': [59.6486, -151.4764], 'PAIL': [59.7544, -154.9108], 'PAKN': [58.6764, -156.6486],
  
  // --- HAWAII (PH) ---
  'PHNL': [21.3245, -157.9295], 'PHOG': [20.8986, -156.4305], 'PHTO': [19.7203, -155.0485],
  'PHKO': [19.7388, -156.0456], 'PHLI': [21.9760, -159.3391], 'PHNY': [20.7856, -156.9514],
  'PHMK': [21.1528, -157.0961], 'PHUP': [20.2652, -155.8543], 'PHJH': [20.9631, -156.6806],
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
