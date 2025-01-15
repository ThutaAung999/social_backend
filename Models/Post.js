import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    // required:true
  },
  video: {
    type: String,
  },
  like: {
    type: Array,
    default: [],
  },
  dislike: {
    type: Array,
    default: [],
  },
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      username: {
        type: String,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
});

export default mongoose.model('Post', postSchema);
