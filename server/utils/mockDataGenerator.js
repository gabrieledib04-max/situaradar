import mongoose from 'mongoose';
import UserLocation from '../models/UserLocation.js';

// Connection logic
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/situaradar';

// Puglia Coordinates
const cities = [
  { name: 'Bari (Piazza del Ferrarese)', lat: 41.1271, lng: 16.8719, count: 50, screenOffRatio: 0.8 }, // Big Situa (Many people, phones off)
  { name: 'Monopoli (Centro Storico)', lat: 40.9515, lng: 17.3032, count: 35, screenOffRatio: 0.9 }, // Huge Situa
  { name: 'Lecce (Piazza Sant Oronzo)', lat: 40.3529, lng: 18.1738, count: 20, screenOffRatio: 0.1 }, // Dead / Everyone on phone
  { name: 'Polignano (Lungomare)', lat: 40.9961, lng: 17.2201, count: 5, screenOffRatio: 0.1 } // Very small group
];

async function seedData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB. Clearing old data...');
    await UserLocation.deleteMany({}); // Clear existing

    // Theory Note (Ch. 5 - JS Async):
    // We use a for...of loop with async/await because Array.forEach does not properly await Promises.
    // This allows us to ensure sequential execution when needed.
    for (const city of cities) {
      console.log(`Seeding ${city.name}...`);
      const locations = [];
      
      for (let i = 0; i < city.count; i++) {
        // Randomize location slightly around the center point (100-200m spread)
        const latOffset = (Math.random() - 0.5) * 0.001;
        const lngOffset = (Math.random() - 0.5) * 0.001;
        
        // Determine if screen is on/off based on ratio
        // Theory Note (Ch. 5 - Type Coercion): 
        // Math.random() returns a float. We compare it to screenOffRatio.
        // In some contexts, boolean coercion (like `!!value`) forces true/false.
        const isScreenOn = (Math.random() > city.screenOffRatio);
        
        locations.push({
          location: {
            type: 'Point',
            coordinates: [city.lng + lngOffset, city.lat + latOffset]
          },
          isScreenOn
        });
      }

      // Insert bulk batch
      await UserLocation.insertMany(locations);
    }

    console.log('Seed completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seedData();
