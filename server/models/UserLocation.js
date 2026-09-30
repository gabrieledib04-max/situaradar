import mongoose from 'mongoose';

const userLocationSchema = new mongoose.Schema({
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  isScreenOn: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now, expires: 3600 } // Auto-delete after 1 hour (TTL)
});

// Create 2dsphere index for spatial queries
userLocationSchema.index({ location: '2dsphere' });

export default mongoose.model('UserLocation', userLocationSchema);
