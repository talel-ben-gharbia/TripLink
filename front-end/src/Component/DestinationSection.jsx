import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import DestinationCard from './DestinationCard';
import { MapPin, SlidersHorizontal, Save, X, Grid2x2, Layers, Filter, SortAsc, SortDesc, Compass, Tag, DollarSign, Calendar, BarChart3, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

const DestinationSection = ({ mode }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [country, setCountry] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [tag, setTag] = useState('');
  const [sorts, setSorts] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [savedSearches, setSavedSearches] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapObj, setMapObj] = useState(null);
  const [clusterGroup, setClusterGroup] = useState(null);
  const [markerIndex, setMarkerIndex] = useState({});
  const categoryColors = useMemo(() => ({ beach: '#3b82f6', mountain: '#10b981', city: '#ef4444', cultural: '#f59e0b', adventure: '#7c3aed' }), []);
  const [continent, setContinent] = useState('');
  const [hoverId, setHoverId] = useState(null);
  const [tileName, setTileName] = useState('Default');
  const allowedTiles = ['Default', 'OSM HOT'];
  const [tileLayer, setTileLayer] = useState(null);
  const [geoCache, setGeoCache] = useState(() => {
    try { return JSON.parse(localStorage.getItem('triplink.geoCache') || '{}'); } catch { return {}; }
  });

  const [continentByCountry, setContinentByCountry] = useState(() => {
    try { return JSON.parse(localStorage.getItem('triplink.continentMap') || '{}'); } catch { return {}; }
  });

  const recScore = useCallback((d) => {
    const r = typeof d.rating === 'number' ? d.rating : 0;
    const rScore = (r / 5) * 60;
    const vals = [d.priceMin, d.priceMax, d.price].filter((v) => typeof v === 'number');
    const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    const allPrices = items.map((x) => [x.priceMin, x.priceMax, x.price].filter((v) => typeof v === 'number')).flat();
    const minP = allPrices.length ? Math.min(...allPrices) : null;
    const maxP = allPrices.length ? Math.max(...allPrices) : null;
    let pScore = 0;
    if (avg != null && minP != null && maxP != null && maxP !== minP) {
      const norm = (avg - minP) / (maxP - minP);
      pScore = (1 - norm) * 25;
    }
    const catScore = tag && d.category === tag ? 10 : 5;
    const aiScore = d.aiRecommended ? 5 : 0;
    const score = Math.max(0, Math.min(100, Math.round(rScore + pScore + catScore + aiScore)));
    return score;
  }, [items, tag]);

  const loadSaved = () => {
    try {
      const raw = localStorage.getItem('triplink.savedSearches') || '[]';
      const list = JSON.parse(raw);
      setSavedSearches(Array.isArray(list) ? list : []);
    } catch {
      setSavedSearches([]);
    }
  };

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      let url = '/api/destinations';
      const hasSearch = Boolean(q || country || tag || (priceMin !== '' || priceMax !== ''));
      if (!hasSearch) {
        if (mode === 'popular') url = '/api/destinations/popular';
        if (mode === 'recommended') url = '/api/destinations/recommended';
      }
      const params = { limit: 1000, offset: 0 };
      if (mode === 'popular') {
      } else {
        if (q) params.q = q;
        if (country) params.country = country;
        // Phase 1: Support multi-tag filtering
        if (tag) {
          // If tag is comma-separated, pass as is; otherwise single tag
          params.tags = tag.includes(',') ? tag : tag;
        }
        if (priceMin !== '') params.priceMin = Number(priceMin);
        if (priceMax !== '') params.priceMax = Number(priceMax);
        // Phase 1: Enhanced sorting
        if (sorts.length) {
          const [key, dir] = sorts[0].split(':');
          // Map frontend sort keys to backend sort keys
          const sortMap = {
            'rating': 'rating',
            'priceMin': 'price',
            'priceMax': 'price',
            'name': 'alphabetical',
            'score': 'popularity' // Default to popularity for score
          };
          const backendKey = sortMap[key] || key;
          params.sort = `${backendKey}:${dir}`;
        }
      }
      const res = await api.get(url, { params });
      let data = res.data || [];
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const w = await api.get('/api/wishlist');
          const wishIds = new Set((w.data || []).map((x) => x.id));
          data = data.map((d) => ({ ...d, wishlisted: wishIds.has(d.id) }));
        } catch { }
      }
      setItems(data);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [mode, q, country, tag, priceMin, priceMax, sorts]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    loadSaved();
    try {
      const raw = localStorage.getItem('triplink.searchState');
      if (raw) {
        const s = JSON.parse(raw);
        setQ(s.q || '');
        setContinent(s.continent || '');
        setCountry(s.country || '');
        setPriceMin(s.priceMin ?? '');
        setPriceMax(s.priceMax ?? '');
        setTag(s.tag || '');
        setSorts(Array.isArray(s.sorts) ? s.sorts : []);
      }
    } catch { }
  }, []);



  const onSearch = async (e) => {
    e.preventDefault();
    await loadData();
    try {
      localStorage.setItem('triplink.searchState', JSON.stringify({ q, continent, country, priceMin, priceMax, tag, sorts }));
    } catch { }
  };
  useEffect(() => {
    try { localStorage.setItem('triplink.selected', JSON.stringify(selected)); } catch { }
  }, [selected]);

  const handleWishlistChange = (id, wished) => {
    setItems((prev) => prev.map((d) => d.id === id ? { ...d, wishlisted: wished } : d));
  };

  const countries = useMemo(() => {
    const set = new Set((items || []).map((d) => d.country).filter(Boolean));
    return Array.from(set).sort();
  }, [items]);

  const continents = useMemo(() => {
    const vals = new Set(Object.values(continentByCountry).filter(Boolean));
    return Array.from(vals).sort();
  }, [continentByCountry]);

  useEffect(() => {
    const missing = countries.filter((c) => !continentByCountry[c]);
    if (!missing.length) return;
    let cancelled = false;
    const fetchRegions = async () => {
      const entries = {};
      for (const c of missing) {
        try {
          const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(c)}?fields=region`);
          const data = await res.json();
          const region = Array.isArray(data) && data[0] && data[0].region ? data[0].region : '';
          if (region) entries[c] = region;
        } catch { }
      }
      if (!cancelled && Object.keys(entries).length) {
        const next = { ...continentByCountry, ...entries };
        setContinentByCountry(next);
        try { localStorage.setItem('triplink.continentMap', JSON.stringify(next)); } catch { }
      }
    };
    fetchRegions();
    return () => { cancelled = true; };
  }, [countries, continentByCountry]);

  useEffect(() => {
    const onHomeSearch = (e) => {
      const payload = e.detail || {};
      const dest = (payload.destination || '').trim();
      setQ(dest);
      if (countries.includes(dest)) setCountry(dest); else setCountry('');
      if (typeof payload.budgetMin === 'number') setPriceMin(String(payload.budgetMin));
      if (typeof payload.budgetMax === 'number') setPriceMax(String(payload.budgetMax));
      loadData();
    };
    window.addEventListener('home-search', onHomeSearch);
    const onVis = () => { if (!document.hidden) loadData(); };
    document.addEventListener('visibilitychange', onVis);
    const iv = setInterval(() => loadData(), 30000);
    return () => {
      window.removeEventListener('home-search', onHomeSearch);
      document.removeEventListener('visibilitychange', onVis);
      clearInterval(iv);
    };
  }, [countries, loadData]);

  const categories = useMemo(() => {
    const set = new Set((items || []).map((d) => d.category).filter(Boolean));
    return Array.from(set).sort();
  }, [items]);



  const filtered = useMemo(() => {
    let list = items.slice();
    if (q) {
      const qq = q.toLowerCase();
      list = list.filter((d) => (d.name || '').toLowerCase().includes(qq) || (d.city || '').toLowerCase().includes(qq) || (d.country || '').toLowerCase().includes(qq));
    }
    if (continent) {
      list = list.filter((d) => continentByCountry[d.country] === continent);
    }
    if (country) {
      list = list.filter((d) => d.country === country);
    }
    const pmin = priceMin !== '' ? Number(priceMin) : null;
    const pmax = priceMax !== '' ? Number(priceMax) : null;
    if (pmin !== null) {
      list = list.filter((d) => {
        const vals = [d.priceMin, d.priceMax, d.price].filter((v) => typeof v === 'number');
        if (!vals.length) return true;
        return Math.min(...vals) >= pmin || Math.max(...vals) >= pmin;
      });
    }
    if (pmax !== null) {
      list = list.filter((d) => {
        const vals = [d.priceMin, d.priceMax, d.price].filter((v) => typeof v === 'number');
        if (!vals.length) return true;
        return Math.min(...vals) <= pmax || Math.max(...vals) <= pmax;
      });
    }
    if (tag) {
      list = list.filter((d) => d.category === tag);
    }
    let sorted = list.slice();
    for (const s of sorts) {
      const [key, dir] = s.split(':');
      sorted = sorted.sort((a, b) => {
        const av = key === 'score' ? recScore(a) : a[key];
        const bv = key === 'score' ? recScore(b) : b[key];
        if (key === 'name') {
          const cmp = String(av || '').localeCompare(String(bv || ''));
          return dir === 'desc' ? -cmp : cmp;
        }
        const na = typeof av === 'number' ? av : 0;
        const nb = typeof bv === 'number' ? bv : 0;
        return dir === 'desc' ? (nb - na) : (na - nb);
      });
    }
    return sorted;
  }, [items, q, continent, continentByCountry, country, priceMin, priceMax, tag, sorts, recScore]);

  const ensureLeaflet = async () => {
    if (!window.L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet/dist/leaflet.css';
      document.head.appendChild(link);
      await new Promise((resolve) => {
        const s = document.createElement('script');
        s.src = 'https://unpkg.com/leaflet/dist/leaflet.js';
        s.onload = resolve;
        document.body.appendChild(s);
      });
    }
    if (!window.L || window.L.markerClusterGroup) {
      return;
    }
    const link2 = document.createElement('link');
    link2.rel = 'stylesheet';
    link2.href = 'https://unpkg.com/leaflet.markercluster/dist/MarkerCluster.css';
    document.head.appendChild(link2);
    const link3 = document.createElement('link');
    link3.rel = 'stylesheet';
    link3.href = 'https://unpkg.com/leaflet.markercluster/dist/MarkerCluster.Default.css';
    document.head.appendChild(link3);
    await new Promise((resolve) => {
      const s2 = document.createElement('script');
      s2.src = 'https://unpkg.com/leaflet.markercluster/dist/leaflet.markercluster.js';
      s2.onload = resolve;
      document.body.appendChild(s2);
    });
  };

  useEffect(() => { ensureLeaflet(); }, []);



  const getTileUrl = (name) => {
    if (name === 'OSM HOT') return 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
    return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  };

  useEffect(() => {
    if (!allowedTiles.includes(tileName)) setTileName('Default');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tileName]);

  const geocodePlace = useCallback(async (city, country) => {
    const key = `${city}|${country}`;
    if (geoCache[key]) return geoCache[key];
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city + ', ' + country)}`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      const data = await res.json();
      if (Array.isArray(data) && data.length) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        const next = { ...geoCache, [key]: [lat, lon] };
        setGeoCache(next);
        try { localStorage.setItem('triplink.geoCache', JSON.stringify(next)); } catch { }
        return [lat, lon];
      }
    } catch { }
    return null;
  }, [geoCache]);

  useEffect(() => {
    if (!showMap) return;
    const init = async () => {
      setMapLoading(true);
      await ensureLeaflet();
      const L = window.L;
      if (!L) { setMapLoading(false); return; }
      const el = document.getElementById('map');
      if (!el) { setMapLoading(false); return; }
      const map = mapObj || L.map(el);
      if (!mapObj) {
        const tl = L.tileLayer(getTileUrl(tileName), { attribution: '&copy; OpenStreetMap' });
        tl.addTo(map);
        setTileLayer(tl);
        setMapObj(map);
      }
      if (clusterGroup) {
        clusterGroup.clearLayers();
      }
      const cg = clusterGroup || (window.L.markerClusterGroup ? window.L.markerClusterGroup() : L.layerGroup());
      if (!clusterGroup) {
        cg.addTo(map);
        setClusterGroup(cg);
      }
      const nextIndex = {};
      const markers = [];
      for (const d of filtered) {
        const queryCity = (d.city || '').trim();
        const queryCountry = (d.country || '').trim();
        const pos = await geocodePlace(queryCity || queryCountry, queryCountry || queryCity);
        if (!pos) continue;
        const color = (typeof categoryColors === 'object' && categoryColors[d.category]) ? categoryColors[d.category] : '#6b7280';
        const baseIcon = L.divIcon({ html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};box-shadow:0 0 0 2px #fff"></div>`, className: '' });
        const m = L.marker(pos, { icon: baseIcon });
        m.bindTooltip(`${d.name}`, { direction: 'top' });
        m.bindPopup(`<div>
            <div style="font-weight:600">${d.name}</div>
            <div style="font-size:12px;color:#555">${d.city ? d.city + ', ' + d.country : d.country}</div>
            ${d.image ? `<img src="${d.image}" alt="${d.name}" style="width:180px;height:120px;object-fit:cover;border-radius:8px;margin-top:8px" />` : ''}
            <div style="margin-top:6px"><a href="#" data-view="${d.id}" style="color:#3b82f6;font-weight:600">View details</a></div>
          </div>`);
        m.on('click', () => {
          const elCard = document.getElementById('dest-card-' + d.id);
          if (elCard) { elCard.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
          setSelected((prev) => prev.includes(d.id) ? prev : [...prev, d.id]);
        });
        m.on('dblclick', () => navigate(`/destinations/${d.id}`));
        m.on('popupopen', (e) => {
          const el = e?.popup?.getElement();
          if (!el) return;
          const link = el.querySelector('a[data-view="' + d.id + '"]');
          if (link) {
            link.addEventListener('click', (ev) => { ev.preventDefault(); navigate(`/destinations/${d.id}`); });
          }
        });
        cg.addLayer(m);
        nextIndex[d.id] = m;
        markers.push(m);
      }
      setMapLoading(false);
      setTimeout(() => {
        try {
          if (markers.length) {
            const group = L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.25));
          } else {
            map.setView([20, 0], 2);
          }
          map.invalidateSize();
        } catch { }
      }, 400);
      setMarkerIndex(nextIndex);
    };
    init();
  }, [showMap, filtered, categoryColors, clusterGroup, mapObj, navigate, geocodePlace, tileName]);

  useEffect(() => {
    if (!mapObj || !markerIndex) return;
    const L = window.L;
    if (!L) return;
    for (const id of Object.keys(markerIndex)) {
      const m = markerIndex[id];
      const d = items.find((x) => String(x.id) === String(id));
      if (!d) continue;
      const color = (typeof categoryColors === 'object' && categoryColors[d.category]) ? categoryColors[d.category] : '#6b7280';
      const sel = selected.includes(d.id);
      const hov = hoverId === d.id;
      const size = sel && hov ? 20 : sel ? 16 : hov ? 18 : 12;
      const icon = L.divIcon({ html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};box-shadow:0 0 0 2px #fff"></div>`, className: '' });
      m.setIcon(icon);
    }
  }, [selected, hoverId, markerIndex, items, categoryColors, mapObj]);

  useEffect(() => {
    if (!mapObj) return;
    const handler = () => { try { mapObj.invalidateSize(); } catch { } };
    window.addEventListener('resize', handler);
    if (showMap) setTimeout(handler, 80);
    return () => { window.removeEventListener('resize', handler); };
  }, [mapObj, showMap]);

  const toggleSelect = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const selectedItems = useMemo(() => items.filter((d) => selected.includes(d.id)), [items, selected]);




  const saveCurrentSearch = () => {
    const name = prompt('Name this search');
    if (!name) return;
    const entry = { name, q, continent, country, priceMin, priceMax, tag, sorts, ts: Date.now() };
    try {
      const list = JSON.parse(localStorage.getItem('triplink.savedSearches') || '[]');
      const next = [entry, ...list].slice(0, 10);
      localStorage.setItem('triplink.savedSearches', JSON.stringify(next));
      setSavedSearches(next);
    } catch { }
  };

  const applySaved = (s) => {
    setQ(s.q || '');
    setContinent(s.continent || '');
    setCountry(s.country || '');
    setPriceMin(s.priceMin ?? '');
    setPriceMax(s.priceMax ?? '');
    setTag(s.tag || '');
    setSorts(Array.isArray(s.sorts) ? s.sorts : []);
  };

  return (
    <section className="pt-6 pb-12 px-4 max-w-7xl mx-auto animate-fade-up" id="destinations">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-4xl font-bold brand-gradient-text">
            {mode === 'popular' ? 'Popular Destinations' : mode === 'recommended' ? 'Recommended For You' : 'Destinations'}
          </h2>
          <div className="mt-2 h-1 w-28 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full" />
          <div className="mt-2 text-sm text-gray-600">Find your next escape</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setShowMap((v) => !v)} className={`px-3 py-2 rounded-lg border ${showMap ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-gray-700 border-gray-300'} flex items-center gap-2`}><MapPin size={16} />Map</button>
          <button type="button" onClick={() => setShowFilters((v) => !v)} className={`px-3 py-2 rounded-lg border ${showFilters ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-white text-gray-700 border-gray-300'} flex items-center gap-2`}><SlidersHorizontal size={16} />Filters</button>
          <div className="text-sm text-gray-700 font-medium">{filtered.length} results</div>
          <div className="ml-3 flex items-center gap-2">
            <div className="text-sm text-gray-600">Selected: {selected.length}</div>
            <button type="button" onClick={() => setShowCompare(true)} disabled={selected.length < 2} className={`px-3 py-2 rounded-lg border ${selected.length < 2 ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-white text-gray-700 border-gray-300'} flex items-center gap-2`}><Grid2x2 size={16} />Compare</button>
            <button type="button" onClick={() => setSelected([])} className="px-3 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200 flex items-center gap-2"><X size={16} />Clear</button>
          </div>
        </div>
      </div>

      {mode !== 'popular' && (
        <form onSubmit={onSearch} className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 mb-6 flex gap-3 items-center border border-white/40 shadow">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, city, or country"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3"
          />
          <button type="submit" className="px-5 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">Search</button>
          <button type="button" onClick={saveCurrentSearch} className="px-3 py-3 rounded-lg bg-white text-gray-700 border border-gray-300 flex items-center gap-2"><Save size={16} />Save</button>
        </form>
      )}

      {showFilters && (
        <div className="bg-white rounded-2xl p-4 mb-6 border shadow space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-gray-600 mb-2 flex items-center gap-2"><Compass size={14} />Continent</div>
              <select value={continent} onChange={(e) => setContinent(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                <option value="">All</option>
                {continents.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-2 flex items-center gap-2"><Compass size={14} />Country</div>
              <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                <option value="">All</option>
                {countries.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-2 flex items-center gap-2"><DollarSign size={14} />Price range</div>
              <div className="flex items-center gap-2">
                <input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="Min" className="w-24 px-3 py-2 border rounded-lg" />
                <span className="text-gray-500">-</span>
                <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="Max" className="w-24 px-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-2 flex items-center gap-2"><Tag size={14} />Category</div>
              <select value={tag} onChange={(e) => setTag(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                <option value="">All</option>
                {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
          </div>
          <div className="border-t pt-4">
            <div className="text-xs text-gray-600 mb-2 flex items-center gap-2"><Filter size={14} />Sort</div>
            <div className="flex flex-wrap gap-2">
              {[
                { k: 'rating', label: 'Rating' },
                { k: 'priceMin', label: 'Price Min' },
                { k: 'priceMax', label: 'Price Max' },
                { k: 'name', label: 'Name' },
                { k: 'score', label: 'Score' }
              ].map((opt) => (
                <div key={opt.k} className="flex items-center gap-1">
                  <button type="button" onClick={() => setSorts((prev) => [...prev.filter((s) => !s.startsWith(opt.k + ':')), `${opt.k}:asc`])} className="px-3 py-1 rounded-full border bg-white text-gray-700 flex items-center gap-1"><SortAsc size={14} />{opt.label}</button>
                  <button type="button" onClick={() => setSorts((prev) => [...prev.filter((s) => !s.startsWith(opt.k + ':')), `${opt.k}:desc`])} className="px-3 py-1 rounded-full border bg-white text-gray-700 flex items-center gap-1"><SortDesc size={14} />{opt.label}</button>
                </div>
              ))}
              {sorts.length > 0 && (
                <button type="button" onClick={() => setSorts([])} className="px-3 py-1 rounded-full border bg-gray-50 text-gray-700">Clear sort</button>
              )}
            </div>
            {sorts.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {sorts.map((s, i) => (
                  <div key={s + i} className="px-3 py-1 rounded-full border bg-white text-gray-700 flex items-center gap-2">
                    <span>{s.replace(':', ' ')}</span>
                    <button type="button" onClick={() => setSorts((prev) => prev.filter((x, idx) => idx !== i))} className="text-gray-500"><X size={14} /></button>
                    <button type="button" onClick={() => setSorts((prev) => { const next = prev.slice(); const j = Math.max(0, i - 1); const t = next[i]; next.splice(i, 1); next.splice(j, 0, t); return next; })} className="text-gray-500"><ChevronLeft size={14} /></button>
                    <button type="button" onClick={() => setSorts((prev) => { const next = prev.slice(); const j = Math.min(prev.length - 1, i + 1); const t = next[i]; next.splice(i, 1); next.splice(j, 0, t); return next; })} className="text-gray-500"><ChevronRight size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {savedSearches.length > 0 && (
            <div className="border-t pt-4">
              <div className="text-xs text-gray-600 mb-2 flex items-center gap-2"><Calendar size={14} />Saved searches</div>
              <div className="flex flex-wrap gap-2">
                {savedSearches.map((s, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <button type="button" onClick={() => applySaved(s)} className="px-3 py-1 rounded-full border bg-white text-gray-700">{s.name}</button>
                    <button type="button" onClick={() => { const next = savedSearches.filter((_, idx) => idx !== i); setSavedSearches(next); try { localStorage.setItem('triplink.savedSearches', JSON.stringify(next)); } catch { } }} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center"><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border bg-white">
              <div className="h-56 animate-shimmer" />
              <div className="p-6 space-y-3">
                <div className="h-6 w-2/3 bg-gray-200 rounded animate-shimmer" />
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-shimmer" />
                <div className="h-4 w-1/3 bg-gray-200 rounded animate-shimmer" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {!showMap ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((d, i) => (
                <div key={d.id} id={`dest-card-${d.id}`} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }} onMouseEnter={() => setHoverId(d.id)} onMouseLeave={() => setHoverId(null)}>
                  <DestinationCard destination={d} onWishlistChange={handleWishlistChange} selectable selected={selected.includes(d.id)} onSelectToggle={() => toggleSelect(d.id)} />
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full text-center bg-white rounded-2xl p-8 text-gray-700">No destinations found — try a different filter</div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border shadow p-3">
              {mapLoading && (<div className="text-sm text-gray-600 px-3 py-2">Loading map…</div>)}
              <div id="map" className="w-full h-[520px] rounded-xl" />
              <div className="mt-2 text-xs text-gray-600">
                <div className="flex items-center gap-2"><Layers size={14} />Pins color-coded by category</div>
                <div className="mt-2 flex flex-wrap gap-3">
                  {Object.entries(categoryColors).map(([k, color]) => (
                    <button key={k} type="button" onClick={() => setTag((prev) => prev === k ? '' : k)} className={`flex items-center gap-2 px-2 py-1 rounded-full border ${tag === k ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-700'}`}>
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                      <span className="capitalize">{k}</span>
                      <span className="text-gray-400">{filtered.filter((d) => d.category === k).length}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <select value={tileName} onChange={(e) => {
                    const name = e.target.value;
                    setTileName(name);
                    const L = window.L;
                    if (mapObj && L) {
                      const prev = tileLayer;
                      const tl = L.tileLayer(getTileUrl(name), { attribution: '&copy; OpenStreetMap' });
                      tl.on('load', () => { try { if (prev) mapObj.removeLayer(prev); } catch { } });
                      tl.addTo(mapObj);
                      setTileLayer(tl);
                    }
                  }} className="px-2 py-1 border rounded">
                    {allowedTiles.map((n) => (<option key={n} value={n}>{n}</option>))}
                  </select>
                  <button type="button" onClick={() => {
                    const L = window.L;
                    if (!mapObj || !L) return;
                    const selMarkers = selected.map((id) => markerIndex[id]).filter(Boolean);
                    if (selMarkers.length) {
                      const group = L.featureGroup(selMarkers);
                      mapObj.fitBounds(group.getBounds().pad(0.25));
                    }
                  }} className="px-2 py-1 rounded border bg-white text-gray-700">Fit to selected</button>
                  <button type="button" onClick={() => { if (mapObj) mapObj.setView([20, 0], 2); }} className="px-2 py-1 rounded border bg-white text-gray-700">Reset view</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}



      {showCompare && (
        <div className="fixed inset-0 bg-black/40 z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border w-full max-w-6xl mx-auto my-4 flex flex-col max-h-[calc(100vh-2rem)]">
            <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
              <div className="flex items-center gap-2"><Grid2x2 /><span className="font-semibold">Comparison</span></div>
              <button type="button" onClick={() => setShowCompare(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><X /></button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <div className="overflow-x-auto">
                <table className="min-w-full border">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left border bg-gray-50">Attribute</th>
                      {selectedItems.map((d) => (
                        <th key={d.id} className="px-3 py-2 text-left border bg-gray-50">{d.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { key: 'location', label: 'Location', render: (d) => (d.city ? `${d.city}, ${d.country}` : d.country) },
                      { key: 'category', label: 'Category', render: (d) => (d.category || '') },
                      { key: 'rating', label: 'Rating', render: (d) => String(typeof d.rating === 'number' ? d.rating : '') },
                      {
                        key: 'price', label: 'Price range', render: (d) => {
                          const vals = [d.priceMin, d.priceMax, d.price].filter((v) => typeof v === 'number');
                          return vals.length ? `${Math.min(...vals)} - ${Math.max(...vals)}` : '';
                        }
                      },
                      { key: 'score', label: 'Recommendation', render: (d) => `${recScore(d)}` }
                    ].map((row) => (
                      <tr key={row.key}>
                        <td className="px-3 py-2 border font-medium">{row.label}</td>
                        {selectedItems.map((d) => (
                          <td key={d.id + row.key} className="px-3 py-2 border">{row.render(d)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedItems.map((d) => (
                  <div key={d.id} className="p-4 rounded-xl border bg-gray-50">
                    <div className="flex items-center gap-2 mb-2"><BarChart3 size={16} /><span className="font-semibold">Price analysis</span></div>
                    <div className="text-sm text-gray-700">
                      {(() => {
                        const vals = [d.priceMin, d.priceMax, d.price].filter((v) => typeof v === 'number');
                        const min = vals.length ? Math.min(...vals) : null;
                        const max = vals.length ? Math.max(...vals) : null;
                        const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
                        return `${min ?? '-'} / ${avg ?? '-'} / ${max ?? '-'}`;
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-center mt-12">
        <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:opacity-90 transition shadow-lg font-semibold">Load More Destinations</button>
      </div>
    </section>
  );
};
export default DestinationSection;
