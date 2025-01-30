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
  const users = await User.find().select('-password'); //remove password

  if (!users) {
    return res.status(200).json('No user found');
  }
  res.status(200).json(users);
});

//update user  ,ဒါက ကိုယ့် ဘာသာ ရေးထားတာ ,   tutorial  မှာ မပါဘူး
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
    //console.log('req.params.id', req.params.id);
    //console.log('req.body.user', req.body.user);// Note : req.body.user is the user id who is following
    if (req.params.id !== req.body.user) {
      //ကိုယ့်  ac   ကိုယ် ပြန်ပြီးတော့  follow  လုပ်လို့မရဘူး
      const user = await User.findById(req.params.id);
      console.log('user :', user);

      const otheruser = await User.findById(req.body.user);
      console.log('otheruser :', otheruser);
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
        // return res.status(200).json('You are already following this user ');

        //if  block ထဲက နည်းလမ်း အသစ် , အခု နည်းဟောင်းနဲံရေးမယ်
        await user.updateOne({ $pull: { followers: req.body.id } });
        await otheruser.updateOne({ $pull: { following: req.params.id } });
        return res.status(200).json('User has unfollowed');
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

//Fetch posts from following users
router.get('/flw/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const followersPost = await Promise.all(
      user?.following.map((item) => {
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
    console.log('req.params.id', req.params.id); //677edae3231634cad19bcebf
    console.log('req.user.id', req.user.id); //677edae3231634cad19bcebf
    if (req.params.id === req.user.id) {
      //ကို့ယ်   profile  ကိုယ်ပဲ ပြင်လို့ရအောင် စစ်တာပါ
      //The purpose of this check is to ensure that the authenticated user (represented by req.user.id) can only update their own profile.
      console.log('req.body.password', req.body.password); ////undefined ပြနေတာ body  မှာ password field  ထည့်မပေးလို့်ပါ,
      console.log('req.body :', req.body);
      if (req.body.password) {
        //undefined ပြနေတယ်
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

//get User details for post
router.get('/post/user/details/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('user', 'username profile')
      .populate('comments.user', 'username profile');
    if (!user) {
      return res.status(400).json('User not found');
    }
    ``;
    //အောက်က  code  တွေက user က database collection  ထဲမှာ
    // document တစ်ခုအနေနဲံ ရှိမှ ဆက်လုပ်မယ်
    //email, password, phonenumber,  ၃ ခုချန်ပြီး ကျန်တာ အကုန်ယူတာ ။
    const { email, password, phonenumber, ...others } = user._doc;
    res.status(200).json(others);
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
});

//get user to follow
router.get('/all/user/:id', async (req, res) => {
  try {
    const allUser = await User.find();
    const user = await User.findById(req.params.id);
    const followingUser = await Promise.all(
      user.following.map((item) => {
        return item;
      })
    );
    //Filter Users to Exclude Already-Followed
    let userToFollow = allUser.filter((val) => {
      return !followingUser.find((item) => {
        return val._id.toString() === item;
      });
    });

    let filterUser = await Promise.all(
      userToFollow.map((item) => {
        const {
          email,
          phonenumber,
          followers,
          following,
          password,
          ...others
        } = item._doc;
        return others;
      })
    );
    res.status(200).json(filterUser);
  } catch (error) {
    console.log('Error :', error);
  }
});

export default router;
