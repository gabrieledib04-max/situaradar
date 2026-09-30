import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String }, // optional for OAuth users
  oauthId: { type: String }, // for google oauth
  gender: { type: String, enum: ['M', 'F', 'Altro', 'Preferisco non specificare'], required: true },
  age: { type: Number, required: true },
  situaScore: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
