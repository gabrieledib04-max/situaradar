import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat'; // Note: this attaches to L globally
import '../App.css';

const PUGLIA_CENTER = [40.8, 16.8];
const PUGLIA_ZOOM = 8;

// Theory Note (Ch. 5 - JS):
// In React, functional components manage state using Hooks like useState.
// Instead of managing 'this' bindings in class components, we use arrow functions 
// which lexically bind 'this' automatically, although in functional components 'this' isn't used for state.
function MapPage() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const heatLayerRef = useRef(null);
  const markersRef = useRef([]);

  const [viewState, setViewState] = useState('puglia');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(PUGLIA_ZOOM);
  const [minUsers, setMinUsers] = useState(0);
  const [radarData, setRadarData] = useState([]);

  useEffect(() => {
    // Initialize map only once
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: false,
      }).setView(PUGLIA_CENTER, PUGLIA_ZOOM);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstance.current);

      mapInstance.current.on('zoomend', () => {
        const currentZoom = mapInstance.current.getZoom();
        setZoomLevel(currentZoom);

        if (currentZoom < 5) {
          setViewState('global');
        } else if (currentZoom >= 5 && viewState === 'global') {
          // Reset logic if manually zoomed in
          setViewState('puglia');
        }
      });

      // Request Geolocation and watch position
      let watchId;
      if ("geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // Add user marker
            L.circleMarker([lat, lng], {
              radius: 8,
              fillColor: "#0ea5e9",
              color: "#fff",
              weight: 2,
              opacity: 1,
              fillOpacity: 0.9
            }).addTo(mapInstance.current).bindPopup("<div style='text-align:center;'>Tu sei qui</div>");
            
            const isScreenOn = !document.hidden;
            reportLocation(lat, lng, isScreenOn);
          },
          (error) => {
            console.warn("Geolocation permission denied or error:", error);
          },
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
      }

      // Page Visibility API
      const handleVisibilityChange = () => {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const isScreenOn = !document.hidden;
            reportLocation(lat, lng, isScreenOn);
          });
        }
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);
      
      // Initial scan
      fetchRadarData();

      return () => {
        if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        if (mapInstance.current) {
          mapInstance.current.remove();
          mapInstance.current = null;
        }
      };
    }
  }, []); // Run once

  // Theory Note (Ch. 5 - Async Programming):
  // 'async/await' is modern JS syntax that wraps Promises, allowing us to write asynchronous
  // code that looks synchronous. It makes error handling (try/catch) much cleaner.
  let apiUrl = import.meta.env.VITE_API_URL || '';
  if (apiUrl.endsWith('/')) apiUrl = apiUrl.slice(0, -1);

  const reportLocation = async (lat, lng, isScreenOn) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`${apiUrl}/api/location`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ lat, lng, isScreenOn })
      });
    } catch (err) {
      console.error('Error reporting location:', err);
    }
  };

  const fetchRadarData = async () => {
    setIsScanning(true);
    try {
      const response = await fetch(`${apiUrl}/api/radar`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setRadarData(data);
    } catch (err) {
      console.error('Error fetching radar data:', err);
    } finally {
      setTimeout(() => {
        setIsScanning(false);
      }, 500);
    }
  };

  useEffect(() => {
    if (mapInstance.current) {
      renderHotspots();
    }
  }, [radarData, minUsers]);

  const renderHotspots = () => {
    // Clear existing markers and heat layer
    markersRef.current.forEach(m => mapInstance.current.removeLayer(m));
    markersRef.current = [];
    if (heatLayerRef.current) {
      mapInstance.current.removeLayer(heatLayerRef.current);
    }

    const heatPoints = [];

    const filteredData = radarData.filter(hotspot => hotspot.users >= minUsers);

    filteredData.forEach(hotspot => {
      heatPoints.push([hotspot.lat, hotspot.lng, hotspot.situaIndex * 1.5]);

      const marker = L.circleMarker([hotspot.lat, hotspot.lng], { 
        radius: 15,
        color: 'transparent',
        fillColor: 'transparent'
      }).addTo(mapInstance.current);
      
      let statusText = "Zona Morta (Digitale)";
      let statusColor = "#94a3b8";
      
      if(hotspot.situaIndex > 0.3) { statusText = "Attività Moderata"; statusColor = "#8b5cf6"; }
      if(hotspot.situaIndex > 0.6) { statusText = "Alta Densità Sociale"; statusColor = "#eab308"; }
      if(hotspot.situaIndex > 0.8) { statusText = "MAX ENGAGEMENT"; statusColor = "#ef4444"; }

      marker.bindPopup(`
          <div style="text-align: center; font-family: 'Outfit', sans-serif;">
              <h3 style="margin: 0 0 6px 0; color: ${statusColor}; font-weight: 700;">${statusText}</h3>
              <p style="margin: 4px 0; font-size: 0.95rem;">Persone nel raggio: <b>${hotspot.users}</b></p>
              <p style="margin: 0; font-size: 0.8rem; color: #cbd5e1; opacity: 0.7;">Social Engagement: ${hotspot.situaIndex.toFixed(2)}</p>
          </div>
      `);
      
      markersRef.current.push(marker);
    });

    heatLayerRef.current = L.heatLayer(heatPoints, {
      radius: 65,
      blur: 50,
      maxZoom: 15,
      max: 1.0,
      gradient: {
        0.2: 'rgba(59, 130, 246, 1)',
        0.4: 'rgba(139, 92, 246, 1)',
        0.6: 'rgba(234, 179, 8, 1)',
        0.8: 'rgba(249, 115, 22, 1)',
        1.0: 'rgba(239, 68, 68, 1)'
      }
    }).addTo(mapInstance.current);
  };

  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    try {
      const response = await fetch(`${apiUrl}/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        mapInstance.current.setView([lat, lon], 13);
      } else {
        alert("Città non trovata. Riprova con un nome più specifico.");
      }
    } catch (err) {
      console.error("Errore durante la ricerca:", err);
      alert("Errore di rete durante la ricerca.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleToggleView = (e) => {
    if (e.target.checked) {
      mapInstance.current.setZoom(2);
      setViewState('global');
    } else {
      mapInstance.current.setView(PUGLIA_CENTER, PUGLIA_ZOOM);
      setViewState('puglia');
    }
  };

  const handleZoomChange = (e) => {
    const zoom = parseInt(e.target.value, 10);
    mapInstance.current.setZoom(zoom);
    setZoomLevel(zoom);
  };

  return (
    <>
      <div id="ui-container">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>SituaRadar</h1>
            <p>Trova le zone con la migliore interazione sociale.</p>
          </div>
          <button 
            className="standard-btn" 
            style={{ padding: '4px 8px', fontSize: '0.8rem', background: 'var(--panel-border)' }}
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }}
          >
            Logout
          </button>
        </header>
        
        <div className="controls">
          <div className="search-container" style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="Cerca città (es. Bari)..." 
              style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--panel-border)', background: 'var(--bg-dark)', color: 'var(--text-primary)' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="standard-btn" style={{ padding: '8px 12px' }} onClick={handleSearch}>
              {isSearching ? '...' : 'Cerca'}
            </button>
          </div>

          <button className="standard-btn" onClick={fetchRadarData}>
            {isScanning ? 'Scanning...' : 'Radar Scan'} <span className="radar-dot"></span>
          </button>
          
          <div className="toggle-container">
            <span className="label">Puglia</span>
            <label className="switch">
              <input type="checkbox" checked={viewState === 'global'} onChange={handleToggleView} />
              <span className="slider round"></span>
            </label>
            <span className="label">Globale</span>
          </div>

          <div className="zoom-container" style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <label htmlFor="zoom-slider">Livello Zoom</label>
            <input type="range" id="zoom-slider" min="2" max="18" value={zoomLevel} onChange={handleZoomChange} style={{ width: '100%' }} />
          </div>

          <div className="filter-container" style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <label htmlFor="min-users">Persone minime ({minUsers})</label>
            <input 
              type="range" 
              id="min-users" 
              min="0" 
              max="100" 
              step="5"
              value={minUsers} 
              onChange={(e) => setMinUsers(parseInt(e.target.value, 10))} 
              style={{ width: '100%' }} 
            />
          </div>
        </div>

        <div className="legend">
          <h3>Social Engagement Index</h3>
          <div className="gradient-bar"></div>
          <div className="legend-labels">
            <span>Digitale (Schermi ON)</span>
            <span>Sociale (Schermi OFF)</span>
          </div>
        </div>
      </div>
      
      <div id="map" ref={mapRef}></div>
    </>
  );
}

export default MapPage;
