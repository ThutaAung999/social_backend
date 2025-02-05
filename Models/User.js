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
  followers: {
    type: Array,
    default: [],
  },
  following: {
    type: Array,
    default: [],
  },
  /* friends: {
    type: Array,
    default: [],
  }, */
  phonenumber: {
    type: String,
    required: true,
  },
  profile: {
    type: String,
  },
  verifed: {
    type: Boolean,
    required: true,
    default: false,
  },
});

export default mongoose.model('User', userSchema);
