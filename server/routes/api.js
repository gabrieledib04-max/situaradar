import express from 'express';
import UserLocation from '../models/UserLocation.js';

const router = express.Router();

// Theory Note (Ch. 2 - HTTP/REST): 
// This POST request handles the incoming client telemetry. 
// A REST API uses semantic methods. POST is used to create a new resource.
// We return a 201 Created HTTP status code indicating successful creation.
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = 'supersecret_for_demo';

router.post('/location', async (req, res) => {
  try {
    const { lat, lng, isScreenOn } = req.body;
    
    // Theory Note (Ch. 5 - JS):
    // 'req.body' contains parsed JSON thanks to the express.json() middleware.
    // We use object destructuring.
    
    // Type coercion note (Ch. 5): Using == null checks for both null and undefined.
    if (lat == null || lng == null || isScreenOn == null) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // JWT verification and User Score Update
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // Accumula punteggio "situa" se lo schermo è spento
        if (!isScreenOn) {
           await User.findByIdAndUpdate(decoded.id, { $inc: { situaScore: 1 } });
        }
      } catch(e) {
        console.warn("Invalid or expired token");
      }
    }

    const newUserLoc = new UserLocation({
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      isScreenOn
    });

    await newUserLoc.save();
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    // 500 is Internal Server Error
    res.status(500).json({ error: 'Server error' });
  }
});

// Theory Note (Ch. 2 - Caching):
// For a live radar, we typically DO NOT want to cache this response because data changes rapidly.
// We set Cache-Control headers to 'no-store' to prevent any caching mechanisms.
router.get('/radar', async (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  
  try {
    // 1. Fetch recent locations (last 15 mins)
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    const locations = await UserLocation.find({ timestamp: { $gte: fifteenMinsAgo } });

    // 2. Spatial Clustering (naive approach for MVP)
    // We group points that are within a certain distance (approx 100m).
    const clusters = [];
    const radius = 0.001; // Approx 100m in lat/lng degrees

    locations.forEach(loc => {
      const [lng, lat] = loc.location.coordinates;
      let foundCluster = false;
      
      for (let cluster of clusters) {
        // Simple Euclidean distance for MVP (Haversine is better but slower)
        const dist = Math.sqrt(Math.pow(cluster.lat - lat, 2) + Math.pow(cluster.lng - lng, 2));
        if (dist < radius) {
          cluster.users++;
          if (!loc.isScreenOn) {
            cluster.screenOffCount++;
          }
          // Shift cluster center slightly
          cluster.lat = (cluster.lat * (cluster.users - 1) + lat) / cluster.users;
          cluster.lng = (cluster.lng * (cluster.users - 1) + lng) / cluster.users;
          foundCluster = true;
          break;
        }
      }

      if (!foundCluster) {
        clusters.push({
          lat,
          lng,
          users: 1,
          screenOffCount: loc.isScreenOn ? 0 : 1
        });
      }
    });

    // 3. Calculate "Situa Index"
    const hotspots = clusters.map(cluster => {
      // Index = (screenOff / total) * (users / MAX_EXPECTED_USERS)
      const ratio = cluster.screenOffCount / cluster.users;
      
      // We scale the density component. Say, 20 users is a decent "density" baseline for a hotspot.
      const densityScore = Math.min(cluster.users / 20, 1.0);
      
      const situaIndex = ratio * densityScore;
      
      return {
        lat: cluster.lat,
        lng: cluster.lng,
        users: cluster.users,
        situaIndex
      };
    });

    // Filter clusters (minimum 3 people to be considered a 'situa')
    const validHotspots = hotspots.filter(h => h.users >= 3);

    res.json(validHotspots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Proxy route for geocoding to avoid CORS and User-Agent blocks from Nominatim
router.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Missing query' });
  
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'SituaRadar/1.0 (localhost)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
