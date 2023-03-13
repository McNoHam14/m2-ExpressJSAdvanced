// CRUD endpoints

import Express from "express";
import fs from "fs";
import { dirname, extname, join } from "path";
import { fileURLToPath } from "url";
import uniqid from "uniqid";
import createHttpError from "http-errors";
import { checkBlogPostsSchema, triggerBadRequest } from "../validation.js";
import {
  getBlogPosts,
  publicFolderPath,
  writeBlogPosts,
} from "../../lib/fs-tools.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

const cloudStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "strive",
  },
});

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, publicFolderPath);
//   },
//   filename: function (req, file, cb) {
//     const filename = req.params.blogPostId + extname(file.originalname);
//     cb(null, filename);
//   },
// });

const upload = multer({ storage: cloudStorage });

const blogPostsRouter = Express.Router();

console.log(getBlogPosts());

// POST (new blog post)

blogPostsRouter.post(
  "/",
  checkBlogPostsSchema,
  triggerBadRequest,
  async (req, res, next) => {
    const newBlogPost = {
      ...req.body,
      id: uniqid(),
      createdAt: new Date(),
      updatedAt: new Date(),
      comments: [],
    };
    const blogPostsArray = await getBlogPosts();
    blogPostsArray.push(newBlogPost);
    await writeBlogPosts(blogPostsArray);
    res.status(201).send({ id: newBlogPost.id });
  }
);

// GET (all blogPosts)

blogPostsRouter.get("/", async (req, res, next) => {
  try {
    const blogPosts = await getBlogPosts();
    res.send(blogPosts);
  } catch (error) {
    next(error);
  }
});

// GET (single blogPost)

blogPostsRouter.get("/:blogPostId", async (req, res, next) => {
  try {
    const blogPostsArray = await getBlogPosts();
    const blogPost = blogPostsArray.find(
      (blogPost) => blogPost.id === req.params.blogPostId
    );
    if (blogPost) {
      res.send(blogPost);
    } else {
      next(
        createHttpError(
          404,
          `There is no blogpost with ${req.params.blogPostId} as an ID`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

// PUT

blogPostsRouter.put(
  "/:blogPostId",
  checkBlogPostsSchema,
  triggerBadRequest,
  async (req, res, next) => {
    try {
      const blogPostsArray = await getBlogPosts();

      const index = blogPostsArray.findIndex(
        (blogPost) => blogPost.id === req.params.blogPostId
      );

      if (index !== -1) {
        const oldBlogPost = blogPostsArray[index];
        const updatedBlogPost = {
          ...oldBlogPost,
          ...req.body,
          updatedAt: new Date(),
        };
        blogPostsArray[index] = updatedBlogPost;
        await writeBlogPosts(blogPostsArray);
        res.send(updatedBlogPost);
      } else {
        next(
          createHttpError(
            404,
            `There is no blogpost with ${req.params.blogPostId} as an ID`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

// DELETE

blogPostsRouter.delete("/:blogPostId", async (req, res, next) => {
  try {
    const blogPostsArray = await getBlogPosts();

    const remainingBlogPosts = blogPostsArray.filter(
      (blogPost) => blogPost.id !== req.params.blogPostId
    );

    if (blogPostsArray.length !== remainingBlogPosts.length) {
      await writeBlogPosts(remainingBlogPosts);
      res.status(204).send();
    } else {
      next(
        createHttpError(
          404,
          `There is no blogpost with ${req.params.blogPostId} as an ID`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.post(
  "/:blogPostId/uploadCover",
  upload.single("coverImage"),
  // needs to be the same as key in Postman, upload comes from multer disk storage
  async (req, res, next) => {
    try {
      const blogPostsArray = await getBlogPosts();

      const index = blogPostsArray.findIndex(
        (blogPost) => blogPost.id === req.params.blogPostId
      );
      // const filename = req.params.blogPostId + extname(req.file.originalname);
      if (index !== -1) {
        const oldBlogPost = blogPostsArray[index];
        const updatedBlogPost = {
          ...oldBlogPost,
          cover: req.file.path,
          updatedAt: new Date(),
        };
        blogPostsArray[index] = updatedBlogPost;
        await writeBlogPosts(blogPostsArray);
        res.send(updatedBlogPost);
      } else {
        next(
          createHttpError(
            404,
            `There is no blogpost with ${req.params.blogPostId} as an ID`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

blogPostsRouter.post("/:blogPostId/comments", async (req, res, next) => {
  try {
    const blogPostsArray = await getBlogPosts();

    const index = blogPostsArray.findIndex(
      (blogPost) => blogPost.id === req.params.blogPostId
    );

    if (index !== -1) {
      const currentBlogPost = blogPostsArray[index];
      req.body.id = uniqid();
      currentBlogPost.comments.push(req.body);
      blogPostsArray[index] = currentBlogPost;
      await writeBlogPosts(blogPostsArray);
      res.send(currentBlogPost);
    } else {
      next(
        createHttpError(
          404,
          `There is no blogpost with ${req.params.blogPostId} as an ID`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.get("/:blogPostId/comments", async (req, res, next) => {
  try {
    const blogPostsArray = await getBlogPosts();

    const index = blogPostsArray.findIndex(
      (blogPost) => blogPost.id === req.params.blogPostId
    );

    if (index !== -1) {
      const currentBlogPost = blogPostsArray[index];
      res.send(currentBlogPost.comments);
    } else {
      next(
        createHttpError(
          404,
          `There is no blogpost with ${req.params.blogPostId} as an ID`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.delete(
  "/:blogPostId/comments/:commentId",
  async (req, res, next) => {
    try {
      const blogPostsArray = await getBlogPosts();

      const index = blogPostsArray.findIndex(
        (blogPost) => blogPost.id === req.params.blogPostId
      );

      if (index !== -1) {
        const currentBlogPost = blogPostsArray[index];
        currentBlogPost.comments = currentBlogPost.comments.filter(
          (comment) => {
            if (comment.id !== req.params.commentId) {
              return true;
            }
          }
        );
        blogPostsArray[index] = currentBlogPost;
        await writeBlogPosts(blogPostsArray);
        res.send(currentBlogPost);
      } else {
        next(
          createHttpError(
            404,
            `There is no blogpost with ${req.params.blogPostId} as an ID`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default blogPostsRouter;
