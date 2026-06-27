import React, { useState, useEffect, useRef } from 'react';
import { UBELKA_TREES, ODS_SPECIES } from '../data';
import { TreeIndividu } from '../types';
import { 
  MapPin, 
  Compass, 
  Info, 
  Navigation, 
  ArrowRight, 
  Layers, 
  Move, 
  RotateCcw, 
  Map as MapIcon, 
  HelpCircle, 
  Sparkles 
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface HuveauneMapProps {
  selectedTreeId?: string;
  onSelectTree?: (treeId: string) => void;
  highlightedTreeId?: string;
  isMobile?: boolean;
}

// Map coordinate conversion to display SVG (bounds: Lat [43.3685, 43.3698], Lng [5.6310, 5.6328])
const MIN_LNG = 5.6310;
const MAX_LNG = 5.6328;
const MIN_LAT = 43.3685;
const MAX_LAT = 43.3698;

const lngToSvgX = (lng: number) => {
  const pct = (lng - MIN_LNG) / (MAX_LNG - MIN_LNG);
  return Math.max(40, Math.min(760, Math.round(pct * 800)));
};

const latToSvgY = (lat: number) => {
  // Lat increases going North (up), but SVG Y increases going South (down)
  const pct = (lat - MIN_LAT) / (MAX_LAT - MIN_LAT);
  return Math.max(40, Math.min(360, Math.round((1 - pct) * 400)));
};

const svgXToLng = (x: number) => {
  const pct = x / 800;
  return parseFloat((MIN_LNG + pct * (MAX_LNG - MIN_LNG)).toFixed(5));
};

const svgYToLat = (y: number) => {
  const pct = 1 - (y / 400);
  return parseFloat((MIN_LAT + pct * (MAX_LAT - MIN_LAT)).toFixed(5));
};

export default function HuveauneMap({ selectedTreeId, onSelectTree, highlightedTreeId, isMobile = false }: HuveauneMapProps) {
  const [viewMode, setViewMode] = useState<'schematic' | 'real'>('schematic');
  const [moveMode, setMoveMode] = useState<boolean>(false);
  const [hoveredTree, setHoveredTree] = useState<TreeIndividu | null>(null);
  const [selectedPin, setSelectedPin] = useState<TreeIndividu | null>(null);
  const [draggingTreeId, setDraggingTreeId] = useState<string | null>(null);

  // Load tree positions from localStorage or fallback to defaults
  const [treePositions, setTreePositions] = useState<TreeIndividu[]>(() => {
    const saved = localStorage.getItem('ubelka_tree_positions_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // error parsing, fallback
      }
    }
    // Set initial positions matching our math translation exactly for ideal SVG & Leaflet overlay
    return UBELKA_TREES.map(t => ({
      ...t,
      // store custom svg coordinate if not yet stored, matching our layout
      svgPos: { x: lngToSvgX(t.gps.lng), y: latToSvgY(t.gps.lat) }
    }));
  });

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  const getSpeciesColor = (speciesId: string) => {
    switch (speciesId) {
      case 'frene': return 'bg-emerald-500 border-emerald-200 text-emerald-950';
      case 'sureau':
      case 'noyer': return 'bg-amber-500 border-amber-200 text-amber-950';
      case 'bouleau': return 'bg-indigo-500 border-indigo-200 text-indigo-950';
      case 'robinier': return 'bg-lime-500 border-lime-200 text-lime-950';
      default: return 'bg-teal-500 border-teal-200 text-teal-950';
    }
  };

  const getSpeciesLabel = (speciesId: string) => {
    return ODS_SPECIES.find(s => s.id === speciesId)?.commonName || '';
  };

  const getShortLabel = (speciesId: string) => {
    switch (speciesId) {
      case 'frene': return 'T1: Frêne';
      case 'sureau':
      case 'noyer': return 'T2: Noyer';
      case 'bouleau': return 'T3: Bouleau';
      case 'robinier': return 'T4: Robinier';
      default: return speciesId;
    }
  };

  // Reset positions to default
  const handleResetPositions = () => {
    if (window.confirm("Voulez-vous réinitialiser l'emplacement des 4 arbres témoins à leur valeur par défaut ?")) {
      localStorage.removeItem('ubelka_tree_positions_v1');
      const reset = UBELKA_TREES.map(t => ({
        ...t,
        svgPos: { x: lngToSvgX(t.gps.lng), y: latToSvgY(t.gps.lat) }
      }));
      setTreePositions(reset);
      setSelectedPin(null);
      setMoveMode(false);
    }
  };

  // Helper to create beautiful custom HTML markers for Leaflet matching our app's style
  const createLeafletIcon = (speciesId: string, label: string, isSelected: boolean) => {
    const colorClass = 
      speciesId === 'frene' ? 'bg-emerald-500 border-emerald-100 text-emerald-900' :
      (speciesId === 'sureau' || speciesId === 'noyer') ? 'bg-amber-500 border-amber-100 text-amber-900' :
      speciesId === 'bouleau' ? 'bg-indigo-500 border-indigo-100 text-indigo-900' :
      'bg-lime-500 border-lime-100 text-lime-900';

    const ringClass = isSelected ? 'ring-4 ring-emerald-400 ring-offset-2 scale-110' : 'hover:scale-105';

    return L.divIcon({
      html: `
        <div class="flex flex-col items-center justify-center cursor-pointer transition-all duration-300" style="transform: translate(-50%, -50%);">
          <div class="w-8 h-8 rounded-full bg-white shadow-lg border-2 border-slate-300 flex items-center justify-center ${ringClass}">
            <div class="w-5 h-5 rounded-full ${colorClass.split(' ')[0]} flex items-center justify-center shadow-inner"></div>
          </div>
          <span class="mt-1 px-1.5 py-0.5 bg-slate-900/90 text-white rounded text-[9px] font-bold font-mono tracking-wider whitespace-nowrap shadow-md border border-slate-700">
            ${label}
          </span>
        </div>
      `,
      className: 'custom-leaflet-marker',
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (viewMode !== 'real' || !mapContainerRef.current) {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      return;
    }

    const map = L.map(mapContainerRef.current, {
      center: [43.36915, 5.6320],
      zoom: 17,
      maxZoom: 19,
      minZoom: 15,
      zoomControl: true
    });

    mapRef.current = map;

    // Use standard satellite style imagery or styled streets
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Initial setup of markers
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [viewMode]);

  // Handle markers updates, dragging, and selection
  useEffect(() => {
    const map = mapRef.current;
    if (!map || viewMode !== 'real') return;

    // Remove old markers
    Object.values(markersRef.current).forEach(m => map.removeLayer(m));
    markersRef.current = {};

    treePositions.forEach(tree => {
      const isSelected = selectedTreeId === tree.id || highlightedTreeId === tree.id;
      const icon = createLeafletIcon(tree.speciesId, getShortLabel(tree.speciesId), isSelected);
      
      const marker = L.marker([tree.gps.lat, tree.gps.lng], {
        icon,
        draggable: moveMode
      }).addTo(map);

      // Popup content
      marker.bindPopup(`
        <div class="font-sans p-1 max-w-[200px]">
          <h4 class="font-black text-emerald-950 text-xs uppercase tracking-tight">${tree.label}</h4>
          <p class="text-[10px] text-emerald-700 font-bold mb-1 font-mono">${getSpeciesLabel(tree.speciesId)}</p>
          <p class="text-[10px] text-slate-600 leading-snug mb-2">${tree.description}</p>
          <div class="text-[9px] font-mono bg-slate-100 p-1 rounded border border-slate-200">
            Lat: ${tree.gps.lat.toFixed(5)}<br/>Lng: ${tree.gps.lng.toFixed(5)}
          </div>
          ${moveMode ? '<div class="text-[9px] font-bold text-amber-600 mt-1 flex items-center gap-1">⚠️ Glissez-déposez pour replacer</div>' : ''}
        </div>
      `);

      // Update position on drag end
      if (moveMode) {
        marker.on('dragend', (e) => {
          const newLatLng = (e.target as L.Marker).getLatLng();
          const lat = parseFloat(newLatLng.lat.toFixed(5));
          const lng = parseFloat(newLatLng.lng.toFixed(5));
          
          setTreePositions(prev => {
            const updated = prev.map(t => {
              if (t.id === tree.id) {
                return {
                  ...t,
                  gps: { lat, lng },
                  svgPos: { x: lngToSvgX(lng), y: latToSvgY(lat) }
                };
              }
              return t;
            });
            localStorage.setItem('ubelka_tree_positions_v1', JSON.stringify(updated));
            return updated;
          });
        });
      }

      // Handle marker click
      marker.on('click', () => {
        setSelectedPin(tree);
        if (onSelectTree) onSelectTree(tree.id);
      });

      markersRef.current[tree.id] = marker;
    });
  }, [viewMode, treePositions, moveMode, selectedTreeId, highlightedTreeId]);

  // Center map on highlighted / selected tree
  useEffect(() => {
    const map = mapRef.current;
    if (!map || viewMode !== 'real') return;

    const activeId = highlightedTreeId || selectedTreeId;
    if (activeId) {
      const activeTree = treePositions.find(t => t.id === activeId);
      if (activeTree) {
        map.setView([activeTree.gps.lat, activeTree.gps.lng], 18, { animate: true });
        const marker = markersRef.current[activeId];
        if (marker) {
          marker.openPopup();
        }
      }
    }
  }, [selectedTreeId, highlightedTreeId, viewMode]);

  // SVG Mouse Drag handlers
  const handleSvgMouseDown = (e: React.MouseEvent, treeId: string) => {
    if (!moveMode) return;
    e.preventDefault();
    setDraggingTreeId(treeId);
  };

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggingTreeId || !moveMode) return;
    const svgElement = document.getElementById('huveaune-svg-map');
    if (!svgElement) return;

    const rect = svgElement.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 800;
    const rawY = ((e.clientY - rect.top) / rect.height) * 400;

    // Constrain inside bounds
    const x = Math.max(40, Math.min(760, Math.round(rawX)));
    const y = Math.max(40, Math.min(360, Math.round(rawY)));

    // Calculate Lat/Lng accordingly
    const lat = svgYToLat(y);
    const lng = svgXToLng(x);

    setTreePositions(prev => {
      const updated = prev.map(t => {
        if (t.id === draggingTreeId) {
          return {
            ...t,
            gps: { lat, lng },
            svgPos: { x, y }
          };
        }
        return t;
      });
      localStorage.setItem('ubelka_tree_positions_v1', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSvgMouseUp = () => {
    setDraggingTreeId(null);
  };

  return (
    <div className={`bg-white border-2 border-emerald-100 shadow-sm overflow-hidden ${isMobile ? "rounded-xl p-3" : "rounded-3xl p-6"}`} onMouseUp={handleSvgMouseUp}>
      {/* Header and Controls */}
      <div className={`flex flex-col gap-3 mb-3 ${isMobile ? "" : "lg:flex-row lg:items-center justify-between"}`}>
        <div>
          <h3 className={`font-sans font-black text-emerald-900 uppercase tracking-tight flex items-center gap-1.5 ${isMobile ? "text-sm" : "text-lg"}`}>
            <Compass className="w-4 h-4 text-emerald-600 animate-pulse" />
            Cartographie de l'Ubelka
          </h3>
          <p className="text-[10px] text-slate-500 font-sans mt-0.5">
            {isMobile ? "Auriol — Repérage des 4 arbres témoins." : "Auriol, Bouches-du-Rhône — Repérage des 4 arbres témoins le long des méandres de l'Huveaune."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex gap-1 text-xs">
            <button
              onClick={() => setViewMode('schematic')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'schematic'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Schéma Pédagogique
            </button>
            <button
              onClick={() => setViewMode('real')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'real'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              Carte Réelle (Leaflet)
            </button>
          </div>

          {/* Move Mode Toggle */}
          <button
            onClick={() => setMoveMode(!moveMode)}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 border-2 ${
              moveMode
                ? 'bg-amber-500 border-amber-600 text-white shadow-md animate-pulse'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Move className="w-3.5 h-3.5" />
            {moveMode ? 'Déplacement : Actif 🎯' : 'Déplacer arbres'}
          </button>

          {/* Reset positions */}
          <button
            onClick={handleResetPositions}
            className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl transition-all"
            title="Réinitialiser les coordonnées"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Move Guide banner */}
      {moveMode && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 text-xs text-amber-900 flex items-center gap-2 mb-4 animate-fade-in font-sans">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Mode déplacement activé !</strong>{' '}
            {viewMode === 'schematic' 
              ? "Cliquez et glissez les pastilles de couleur sur le schéma." 
              : "Glissez les pastilles directement sur la carte satellite ci-dessous pour repositionner les arbres géographiquement."
            } Vos modifications se synchronisent et sont enregistrées localement !
          </span>
        </div>
      )}

      {/* Map display */}
      <div className="relative border-2 border-emerald-100 rounded-2xl overflow-hidden bg-slate-50/50">
        {viewMode === 'schematic' ? (
          /* IMPROVED SVG MAP matching the user image and real geography */
          <svg 
            viewBox="0 0 800 400" 
            className="w-full h-auto select-none font-sans"
            id="huveaune-svg-map"
            onMouseMove={handleSvgMouseMove}
            onMouseUp={handleSvgMouseUp}
            onMouseLeave={handleSvgMouseUp}
          >
            <defs>
              <linearGradient id="riverGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#bae6fd" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#bae6fd" />
              </linearGradient>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
              </pattern>
            </defs>

            {/* Grid pattern */}
            <rect width="800" height="400" fill="url(#grid)" opacity="0.3" />

            {/* L'HUVEAUNE RIVER (At the very top, curving smoothly) */}
            <path 
              d="M 0 70 C 150 40, 250 110, 420 80 C 550 50, 680 110, 800 65" 
              fill="none" 
              stroke="url(#riverGradient)" 
              strokeWidth="28" 
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path 
              d="M 0 70 C 150 40, 250 110, 420 80 C 550 50, 680 110, 800 65" 
              fill="none" 
              stroke="#0284c7" 
              strokeWidth="3" 
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.25"
            />
            {/* CURRENT FLOW DIRECTION (from right to left / East to West) */}
            <path d="M 135 62 L 120 68 L 135 74 Z" fill="#0369a1" />
            <path d="M 515 68 L 500 74 L 515 80 Z" fill="#0369a1" />
            <text x="530" y="77" fill="#0369a1" className="text-[10px] font-black italic tracking-wide">
              L'Huveaune (sens du courant ◄)
            </text>

            {/* WETLAND (RIPISYLVE ZONE) BETWEEN RIVER AND ROAD */}
            <path 
              d="M 0 100 Q 150 120, 250 140 T 500 130 T 800 110 L 800 280 L 0 280 Z" 
              fill="#ecfdf5" 
              fillOpacity="0.75" 
            />
            <text x="320" y="160" fill="#047857" className="text-[11px] font-semibold italic tracking-wide">
              Zone Humide des Méandres (Ripisylve protégée)
            </text>

            {/* ROADS LAYOUT matching the provided image */}
            {/* Horizontal Road: Rue du Collège / Devant le collège */}
            <path d="M 0 300 L 800 300" stroke="#94a3b8" strokeWidth="24" opacity="0.9" />
            <path d="M 0 300 L 800 300" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="6 4" opacity="0.5" />
            <text x="240" y="304" fill="#334155" className="text-[9px] font-black uppercase tracking-wider">
              Avenue du Collège (Rue principale)
            </text>

            {/* Roundabout on the left */}
            <circle cx="120" cy="300" r="30" fill="#94a3b8" stroke="#64748b" strokeWidth="2" />
            <circle cx="120" cy="300" r="14" fill="#10b981" stroke="#334155" strokeWidth="2" /> {/* Central island */}
            
            {/* South Road branching down from roundabout */}
            <path d="M 120 300 L 120 400" stroke="#94a3b8" strokeWidth="24" opacity="0.9" />
            
            {/* CD 45A on the right side */}
            <path d="M 780 0 Q 750 150, 720 300 L 720 400" fill="none" stroke="#64748b" strokeWidth="28" opacity="0.95" />
            <path d="M 780 0 Q 750 150, 720 300 L 720 400" fill="none" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5" />
            
            {/* CD 45A Label */}
            <g transform="translate(740, 110)">
              <rect x="0" y="0" width="48" height="18" rx="4" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
              <text x="24" y="12" textAnchor="middle" fill="#000000" className="text-[9px] font-black font-mono">CD 45A</text>
            </g>

            {/* Labels of Landmarks */}
            {/* Judo Club Auriol */}
            <g transform="translate(145, 275)">
              <rect x="0" y="0" width="105" height="18" rx="4" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
              <text x="52" y="12" textAnchor="middle" fill="#475569" className="text-[9px] font-bold">🥋 Judo Club Auriol</text>
            </g>

            {/* Bus Stop Icon */}
            <g transform="translate(390, 280)">
              <circle cx="10" cy="10" r="8" fill="#1e3a8a" />
              <text x="10" y="13" textAnchor="middle" fill="#ffffff" className="text-[9px] font-bold">🚌</text>
            </g>

            {/* COLLÈGE UBELKA (At the bottom, below the main road) */}
            <path d="M 180 324 L 660 324 L 660 395 L 180 395 Z" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
            <rect x="195" y="340" width="450" height="40" rx="6" fill="#ffffff" stroke="#e2e8f0" />
            <text x="420" y="364" textAnchor="middle" fill="#1e293b" className="text-sm font-black tracking-widest uppercase">
              🎓 Collège Ubelka d'Auriol
            </text>

            {/* Static plant decorations */}
            <g fill="#10b981" opacity="0.15">
              <circle cx="50" cy="150" r="14" />
              <circle cx="80" cy="180" r="16" />
              <circle cx="280" cy="180" r="18" />
              <circle cx="340" cy="220" r="15" />
              <circle cx="680" cy="180" r="16" />
            </g>

            {/* Tree Pins on SVG map */}
            {treePositions.map((tree) => {
              const pos = tree.svgPos || { x: 100, y: 100 };
              const isSelected = selectedTreeId === tree.id || highlightedTreeId === tree.id;
              const isHovered = hoveredTree?.id === tree.id;
              const isDragging = draggingTreeId === tree.id;

              return (
                <g
                  key={tree.id}
                  className={`transition-all duration-300 ${moveMode ? 'cursor-move' : 'cursor-pointer'}`}
                  onMouseDown={(e) => handleSvgMouseDown(e, tree.id)}
                  onClick={() => {
                    if (!moveMode) {
                      setSelectedPin(tree);
                      if (onSelectTree) onSelectTree(tree.id);
                    }
                  }}
                  onMouseEnter={() => !draggingTreeId && setHoveredTree(tree)}
                  onMouseLeave={() => setHoveredTree(null)}
                >
                  {/* Ping Animation on selection */}
                  {isSelected && (
                    <circle 
                      cx={pos.x} 
                      cy={pos.y} 
                      r="22" 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="2.5" 
                      className="animate-ping"
                      opacity="0.35"
                    />
                  )}

                  {/* Drag indication circle */}
                  {isDragging && (
                    <circle 
                      cx={pos.x} 
                      cy={pos.y} 
                      r="26" 
                      fill="none" 
                      stroke="#f59e0b" 
                      strokeWidth="2" 
                      strokeDasharray="4 2"
                    />
                  )}

                  {/* Outer circle shadow */}
                  <circle 
                    cx={pos.x} 
                    cy={pos.y} 
                    r={isDragging ? 18 : isSelected ? 15 : isHovered ? 13 : 10.5} 
                    fill="#ffffff" 
                    stroke={isDragging ? '#f59e0b' : isSelected ? '#047857' : '#94a3b8'} 
                    strokeWidth={isSelected || isDragging ? 3 : 2} 
                  />

                  {/* Inner colored dot */}
                  <circle 
                    cx={pos.x} 
                    cy={pos.y} 
                    r={isDragging ? 10 : isSelected ? 8.5 : isHovered ? 7.5 : 5.5} 
                    className={`transition-all ${
                      tree.speciesId === 'frene' ? 'fill-emerald-600' :
                      (tree.speciesId === 'sureau' || tree.speciesId === 'noyer') ? 'fill-amber-500' :
                      tree.speciesId === 'bouleau' ? 'fill-indigo-500' :
                      'fill-lime-500'
                    }`}
                  />

                  {/* Text labels floating above */}
                  <text 
                    x={pos.x} 
                    y={pos.y - (isSelected ? 21 : 16)} 
                    textAnchor="middle" 
                    fill="#1e293b" 
                    className={`text-[9px] pointer-events-none font-sans font-black ${
                      isSelected ? 'fill-emerald-950 font-black scale-110' : ''
                    }`}
                  >
                    {getShortLabel(tree.speciesId)}
                  </text>
                </g>
              );
            })}
          </svg>
        ) : (
          /* REAL LEAFLET MAP */
          <div 
            ref={mapContainerRef} 
            className="w-full h-[400px] rounded-2xl shadow-inner relative" 
            style={{ zIndex: 1 }}
          />
        )}

        {/* Hover Information overlay for SVG Map */}
        {viewMode === 'schematic' && hoveredTree && !draggingTreeId && (
          <div 
            className="absolute z-10 p-3.5 bg-slate-950/95 text-white text-xs rounded-xl shadow-2xl border border-slate-700/50 max-w-[250px] pointer-events-none animate-fade-in"
            style={{
              left: `${(hoveredTree.svgPos?.x || 100) / 8}%`,
              top: `${((hoveredTree.svgPos?.y || 100) / 4) - 8}%`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="font-bold flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
              <span className="font-sans font-black text-slate-100">{hoveredTree.label}</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-black tracking-wider ${
                hoveredTree.speciesId === 'frene' ? 'bg-emerald-600/30 text-emerald-300' :
                (hoveredTree.speciesId === 'sureau' || hoveredTree.speciesId === 'noyer') ? 'bg-amber-600/30 text-amber-300' :
                hoveredTree.speciesId === 'bouleau' ? 'bg-indigo-600/30 text-indigo-300' :
                'bg-lime-600/30 text-lime-300'
              }`}>
                {getSpeciesLabel(hoveredTree.speciesId)}
              </span>
            </div>
            <p className="mt-1.5 text-slate-300 leading-relaxed text-[11px]">{hoveredTree.description}</p>
            <div className="mt-2 text-[10px] text-emerald-400 font-mono flex flex-col gap-0.5">
              <div>Lat : {hoveredTree.gps.lat.toFixed(5)}</div>
              <div>Lng : {hoveredTree.gps.lng.toFixed(5)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-emerald-50/40 p-3.5 border-2 border-emerald-100 rounded-2xl text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-full bg-emerald-500 border border-emerald-200 flex items-center justify-center text-[10px] text-white font-bold">1</div>
          <div>
            <div className="font-bold text-emerald-950">Frêne à f. étroites</div>
            <div className="text-[10px] text-emerald-700 font-semibold">Berges & Canopée</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-full bg-amber-500 border border-amber-200 flex items-center justify-center text-[10px] text-white font-bold">2</div>
          <div>
            <div className="font-bold text-amber-950">Noyer commun</div>
            <div className="text-[10px] text-amber-700 font-semibold">Terrasses de la ripisylve</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-full bg-indigo-500 border border-indigo-200 flex items-center justify-center text-[10px] text-white font-bold">3</div>
          <div>
            <div className="font-bold text-indigo-950">Bouleau verruqueux</div>
            <div className="text-[10px] text-indigo-700 font-semibold">Écorce blanche caractéristique</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-full bg-lime-500 border border-lime-200 flex items-center justify-center text-[10px] text-white font-bold">4</div>
          <div>
            <div className="font-bold text-lime-950">Robinier faux-acacia</div>
            <div className="text-[10px] text-lime-700 font-semibold">Fleurs mellifères & épines</div>
          </div>
        </div>
      </div>

      {/* Selected Tree Info Box with GPS details */}
      {selectedPin && (
        <div className="mt-4 bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-4 flex gap-3 items-start animate-fade-in">
          <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="grow">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-bold text-emerald-950 text-sm">
                Cible sélectionnée : {selectedPin.label}
              </h4>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                {getSpeciesLabel(selectedPin.speciesId)}
              </span>
            </div>
            <p className="text-xs text-emerald-900 mt-1">
              {selectedPin.description}
            </p>
            <div className="mt-2 text-[11px] font-mono text-emerald-700 flex gap-4">
              <span>Latitude : {selectedPin.gps.lat.toFixed(5)}° N</span>
              <span>Longitude : {selectedPin.gps.lng.toFixed(5)}° E</span>
            </div>
          </div>
          <button 
            onClick={() => setSelectedPin(null)}
            className="text-emerald-800 hover:text-emerald-950 text-xs font-semibold uppercase tracking-wider"
          >
            Masquer
          </button>
        </div>
      )}
    </div>
  );
}
