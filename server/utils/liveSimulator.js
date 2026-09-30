import mongoose from 'mongoose';
import UserLocation from '../models/UserLocation.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/situaradar';

// Configuriamo diverse zone (hotspot) in Puglia con comportamenti diversi
const hubs = [
  // Bari - Zone di forte movida (tanta gente, schermi spenti)
  { name: 'Bari - Piazza Ferrarese', lat: 41.1271, lng: 16.8719, radius: 0.0015, targetUsers: 450, screenOffRatio: 0.85 },
  { name: 'Bari - Corso V. Emanuele', lat: 41.1265, lng: 16.8680, radius: 0.002, targetUsers: 250, screenOffRatio: 0.6 },
  
  // Monopoli - Mega Situa
  { name: 'Monopoli - Centro', lat: 40.9515, lng: 17.3032, radius: 0.0015, targetUsers: 500, screenOffRatio: 0.9 },
  
  // Lecce - Zona moderata
  { name: 'Lecce - Piazza S. Oronzo', lat: 40.3529, lng: 18.1738, radius: 0.002, targetUsers: 200, screenOffRatio: 0.7 },
  
  // Polignano - Turisti che fanno foto (tanti schermi accesi)
  { name: 'Polignano - Terrazze', lat: 40.9961, lng: 17.2201, radius: 0.001, targetUsers: 300, screenOffRatio: 0.2 },
  
  // Taranto - Zona tranquilla
  { name: 'Taranto - Lungomare', lat: 40.4712, lng: 17.2432, radius: 0.003, targetUsers: 150, screenOffRatio: 0.4 },

  // Utenti sparsi in tutta la Puglia (rumore di fondo, non formano cluster densi)
  { name: 'Puglia Background', lat: 40.8, lng: 16.8, radius: 1.0, targetUsers: 1000, screenOffRatio: 0.1 }
];

async function runSimulation() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB. Starting Live Simulator...');
    console.log('Premi Ctrl+C per fermare la simulazione.');

    // Prima esecuzione immediata
    await updateLocations();

    // Eseguiamo il ciclo ogni 5 secondi per dare un effetto real-time
    setInterval(updateLocations, 5000);
    
  } catch (error) {
    console.error('Errore di connessione:', error);
    process.exit(1);
  }
}

async function updateLocations() {
  try {
    // Cancelliamo i dati precedenti per mantenere il DB pulito durante la simulazione rapida
    await UserLocation.deleteMany({});
    
    const locations = [];
    
    for (const hub of hubs) {
      // Creiamo una fluttuazione casuale degli utenti (+/- 15%) per simulare movimento in entrata/uscita
      const currentUsers = Math.floor(hub.targetUsers * (0.85 + Math.random() * 0.3));
      
      for (let i = 0; i < currentUsers; i++) {
        // Distribuzione pseudogaussiana per concentrare la maggior parte degli utenti al centro dell'hotspot
        const u = (Math.random() + Math.random() + Math.random() - 1.5);
        const v = (Math.random() + Math.random() + Math.random() - 1.5);
        
        // Aggiungiamo un leggero "drift" (spostamento di massa) nel tempo basato sul clock
        const driftLat = Math.sin(Date.now() / 10000) * 0.0002;
        const driftLng = Math.cos(Date.now() / 10000) * 0.0002;

        const lat = hub.lat + (u * hub.radius) + driftLat;
        const lng = hub.lng + (v * hub.radius) + driftLng;
        
        // Determina se lo schermo è acceso in base alla ratio dell'hub
        const isScreenOn = Math.random() > hub.screenOffRatio;
        
        locations.push({
          location: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          isScreenOn
        });
      }
    }
    
    await UserLocation.insertMany(locations);
    console.log(`[${new Date().toLocaleTimeString()}] Simulati ${locations.length} utenti attivi in ${hubs.length} macro-zone.`);
  } catch (err) {
    console.error('Errore durante il ciclo di simulazione:', err);
  }
}

runSimulation();
