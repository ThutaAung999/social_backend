/* eslint-disable no-undef */
import express from 'express';
import Post from '../Models/Post.js';
import verifyToken from './verifyToken.js';

const router = express.Router();

//Create Post
router.post('/user/post', verifyToken, async (req, res) => {
  try {
    let { title, image, video } = req.body;
    let newPost = new Post({ title, image, video, user: req.user.id });
    const post = await newPost.save();
    res.status(201).json(post);
  } catch (error) {
    console.log("post creation doesn't success", error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

//upload posts by one user  ,  get all posts by one user
router.get('/get/post/:id', verifyToken, async (req, res) => {
  console.log('req.user', req.user);
  console.log('req.params.id', req.params.id);
  try {
    const myPost = await Post.find({ user: req.params.id });
    console.log('myPost', myPost);
    if (!myPost) {
      return res.status(200).json("You don't have any post");
    }
    res.status(200).json(myPost);
  } catch (error) {
    res
      .status(500)
      .json({ errorMessage: 'Internal Server Error', error: error });
  }
});

//update user post
router.patch('/update/post/:id', verifyToken, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!post) {
      return res.status(200).json('Post not found');
    }
    res.status(200).json({ successmessage: 'Post updated successfully', post });
  } catch (error) {
    res
      .status(500)
      .json({ errorMessage: 'Internal Server Error', error: error });
  }
  //အောက်ကလိုရေးလဲရတယ်
  /* 
          try {
                   let post = await Post.findById(req.params.id);
                   if(!post){
                    return res.status(400).json("Post does not found")
                   };
                   
                   post = await Post.findByIdAndUpdate(req.params.id , {
                    $set:req.body
                   })
                   let updatepost = await post.save();
                   res.status(200).json(updatepost);
          } catch (error) {
                   return res.status(500).json("Internal error occured") 
          }
*/
});

//Like post
router.put('/:id/like', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.like.includes(req.body.user)) {
      if (post.dislike.includes(req.body.user)) {
        await post.updateOne({ $pull: { dislike: req.body.user } });
      }
      await post.updateOne({ $push: { like: req.body.user } });
      return res.status(200).json('Post has been liked');
    } else {
      await post.updateOne({ $pull: { like: req.body.user } });
      return res.status(200).json('Post has been unlike');
    }
  } catch (error) {
    return res.status(500).json('Internal server error ');
  }
});

//Dislike
router.put('/:id/dislike', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.dislike.includes(req.body.user)) {
      if (post.like.includes(req.body.user)) {
        await post.updateOne({ $pull: { like: req.body.user } });
      }
      await post.updateOne({ $push: { dislike: req.body.user } });
      return res.status(200).json('Post has been disliked');
    } else {
      await post.updateOne({ $pull: { dislike: req.body.user } });
      return res.status(200).json('Post has been unlike');
    }
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
});

//Comment
router.put('/comment/post', verifyToken, async (req, res) => {
  // try {
  const { comment, postid /*  profile */ } = req.body;
  const comments = {
    user: req.user.id,
    username: req.user.username,
    comment,
    // profile,
  };
  console.log('comments :', comments);
  const post = await Post.findById(postid);
  post?.comments.push(comments);
  await post?.save();
  res.status(200).json(post);
  // } catch (error) {
  //       return res.status(500).json("Internal server error")
  // }
});

//Delete post
router.delete('/delete/post/:id', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.user === req.user.id) {
      const deletepost = await Post.findByIdAndDelete(req.params.id);
      return res.status(200).json('You post has been deleted');
    } else {
      return res.status(400).json('You are not allow to delete this post');
    }
  } catch (error) {
    return res.status(500).json('Internal server error');
  }
});

export default router;
