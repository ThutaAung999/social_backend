import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    // unique: true,
    // minlength: 3,
    // maxlength: 20,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  pendingFriends: {
    type: Array,
    default: [],
  },
  friends: {
    type: Array,
    default: [],
  },
  phonenumber: {
    type: Number,
    required: true,
  },
  profile: {
    type: String,
  },
});

export default mongoose.model('User', userSchema);
