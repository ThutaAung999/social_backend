/* eslint-disable no-undef */
import express from 'express';
import User from '../Models/User.js';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import verifyToken from './verifyToken.js';
import Post from '../Models/Post.js';

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
        return res.status(200).json('Email already exist');
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
      const user = await User.findOne({ email: req.body.email });
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
      const { password, ...others } = user._doc;
      res.status(200).json({ user: others, accessToken });
    } catch (error) {
      res
        .status(500)
        .json({ error: 'Internal server error', details: error.message });
    }
  }
);

//get All users
router.get('/get/users', async (req, res) => {
  const users = await User.find().select('-password');

  if (!users) {
    return res.status(200).json('No user found');
  }
  res.status(200).json(users);
});

//update user
router.patch(
  '/update/user/:id',
  /* verifyToken, */ async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(200).json('User not found');
      }
      user.username = req.body.username;
      user.email = req.body.email;
      user.phonenumber = req.body.phonenumber;
      user.profile = req.body.profile;
      await user.save();
      res
        .status(200)
        .json({ successmessage: 'User updated successfully', user: user });
    } catch (error) {
      res
        .status(500)
        .json({ errorMessage: 'Internal Server Error', error: error });
    }
  }
);

//delete user
router.delete(
  '/delete/user/:id',
  /* verifyToken, */ async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      console.log('user', user);
      if (!user) {
        return res.status(200).json('User not found');
      }

      res
        .status(200)
        .json({ successmessage: 'User deleted successfully', user: user });
    } catch (error) {
      res
        .status(500)
        .json({ errorMessage: 'Internal Server Error', error: error });
    }
  }
);

//following
router.put('/following/:id', verifyToken, async (req, res) => {
  try {
    console.log('req.params.id', req.params.id);
    console.log('req.body.user', req.body.user);
    if (req.params.id !== req.body.user) {
      //ကိုယ့်  ac   ကိုယ် ပြန်ပြီးတော့  follow  လုပ်လို့မရဘူး
      const user = await User.findById(req.params.id);
      console.log('user :', user);
      /* if (!user) {
          return res.status(200).json("Post not found");
        }else{
            return res.status(200).json("You are already following this post");
        } */
      const otheruser = await User.findById(req.body.user);

      //user က  follow မလုပ်ရသေးဘူးဆိုရင်
      if (!user.followers.includes(req.body.user)) {
        //this user is not exist in our followers array or followers list
        user.followers.push(req.body.user);
        //အောက်ကလိုရေးလဲရတယ်
        //await user.updateOne({$push:{followers:req.body.user}});
        otheruser.following.push(req.params.id);
        //အောက်ကလိုရေးလဲရတယ်
        //await otheruser.updateOne({$push:{following:req.params.id}});
        await user.save();
        await otheruser.save();
        res.status(200).json('User has followed');
      } else {
        //this user is already exist in our followers array or followers list
        return res.status(200).json('You are already following this user ');
      }
    } else {
      //ကိုယ့်  ac   ကိုယ် ပြန်ပြီးတော့  follow  လုပ်လို့မရဘူး
      return res.status(400).json("You can't follow yourself");
    }
  } catch (error) {
    res
      .status(500)
      .json({ errorMessage: 'Internal Server Error', error: error });
  }
});

//Fetch post from following
router.get('/flw/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const followersPost = await Promise.all(
      user.followers.map((item) => {
        return Post.find({ user: item });
      })
    );
    const userPost = await Post.find({ user: user._id });
    //res.status(200).json({ followersPost, userPost });
    res.status(200).json(userPost.concat(...followersPost));
  } catch (error) {
    res.status(500).json({
      message: 'Error in fetching posts, Internal server error',
      error: error,
    });
  }
});

//Update User Profile
router.put('/update/:id', verifyToken, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      //ကို့ယ်   profile  ကိုယ်ပဲ ပြင်လို့ရအောင် စစ်တာပါ
      //The purpose of this check is to ensure that the authenticated user (represented by req.user.id) can only update their own profile.

      if (req.body.password) {
        const salt = await bcrypt.genSalt(10); //10 reandom string
        const secretPassword = await bcrypt.hash(req.body.password, salt);
        req.body.password = secretPassword;

        const userUpdate = await User.findByIdAndUpdate(req.params.id, {
          $set: req.body,
        });
        userUpdate.save();
        res.status(200).json(userUpdate);
      }
    } else {
      return res
        .status(400)
        .json('Your are not allow to update this user details ');
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Internal server error', error: error });
  }
});

//Delete user account
router.delete('/delete/:id', verifyToken, async (req, res) => {
  console.log('req.params.id   :', req.params.id);
  console.log('req.user  :', req.user);
  try {
    if (req.params.id !== req.user.id) {
      return res.status(400).json('Account does not match');
    } else {
      const user = await User.findByIdAndDelete(req.params.id);
      return res
        .status(200)
        .json({ successmessage: 'Account deleted successfully', user: user });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ errorMessage: 'Internal Server Error', error: error });
  }
});

export default router;
