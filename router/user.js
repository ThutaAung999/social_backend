/* eslint-disable no-undef */
import express from 'express';
import User from '../Models/User.js';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = '#zinyawhteinhtein222222222';

router.post(
  '/create/user',
  body('username').isLength({ min: 5 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('phonenumber').isLength({ min: 10 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        //email already exist
        return res.status(200).json('Please login with the correct password');
      } // ရှိပြီးသား  email  ကို ခွင့်မပြုလို့  login page  ပြန်ပြီး  redirect လုပ်မယ်

      const salt = await bcrypt.genSalt(10); //crate random string
      const secretPassword = await bcrypt.hash(req.body.password, salt); //add random string to password

      user = await User.create({
        username: req.body.username,
        email: req.body.email,
        password: secretPassword,
        profile: req.body.profile,
        phonenumber: req.body.phonenumber,
      });

      const accessToken = jwt.sign(
        { id: user._id, username: user.username },
        JWT_SECRET
        // { expiresIn: '1h' }
      );
      await user.save();

      res.status(201).json({ user, accessToken });
    } catch (error) {
      console.error('Error occurred:', error); // Log the error for debugging
      return res
        .status(400)
        .json({ error: `Error occurred: ${error.message}` });
    }
  }
);

//Login

router.post(
  '/login',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.fineOne({ email: req.body.email }).select(
        '+password'
      );
      if (!user) {
        return res.status(400).json('user does not exist');
      }

      const comparePassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!comparePassword) {
        return res.status(400).json('password does not match');
      }
      const accessToken = jwt.sign(
        { id: user._id, username: user.username },
        JWT_SECRET
        // { expiresIn: '1h' }
      );
      res.status(200).json({ user, accessToken });
    } catch (error) {
      res.status(500).json('Internal server error :', error);
    }
  }
);

export default router;
