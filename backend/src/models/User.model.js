import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String,
  },
  clearId: {
    type: String,
    required: true,
    unique: true,
  },
}, {timeseries: true});

const User = mongoose.model('User', userSchema);

export default User;