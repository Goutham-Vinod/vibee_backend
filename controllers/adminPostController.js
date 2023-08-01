import postModel from "../model/Posts.js"

export const deletePost = async (req, res) => {
  try {
    const { postId } = req.body
    const post = await postModel.findByIdAndUpdate(postId, { isDeleted: true })
    res.json(post)
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later" })
  }
}

export const getAllPosts = async (req, res) => {
  try {
    const posts = await postModel
      .find({ shared: false })
      .populate({ path: "createdBy", select: "-password" })
    res.json(posts)
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later" })
  }
}

export const getSinglePost = async (req, res) => {
  try {
    const { postId } = req.params
    const post = await postModel
      .findById(postId)
      .populate({ path: "createdBy", select: "-password" })
      .populate({ path: "comments.userId", select: "-password" })
      .populate({ path: "likes", select: "-password" })
    if (!post) return res.status(404).json({ message: "Post does not exist" })
    if (post.shared) return res.status(301).json({ id: post.postId })
    res.json(post)
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later" })
  }
}

export const deleteComment = async (req, res) => {
  try {
    const { postId } = req.params
    const { commentId } = req.body
    const post = await postModel.findById(postId)
    post.comments = post.comments.filter(
      (item) => item._id.toString() !== commentId
    )
    await post.save()
    await post.populate({ path: "createdBy", select: "-password" })
    await post.populate({ path: "comments.userId", select: "-password" })
    res.json(post)
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later" })
  }
}
