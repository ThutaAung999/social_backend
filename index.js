/* eslint-disable no-undef */
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './router/user.js';

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

app.use(express.json());
app.use('/api/user', userRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
