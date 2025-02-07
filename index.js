/* eslint-disable no-undef */
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';

import userRouter from './router/user.js';
import postRouter from './router/post.js';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

mongoose
  //.connect(process.env.MONGODB_URI)
  .connect(process.env.MONGODB_LOCAL_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.log(err);
  });

app.use(cors());
app.use(express.json());
app.use('/api/user', userRouter);
app.use('/api/post', postRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
