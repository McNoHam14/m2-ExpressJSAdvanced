// CRUD endpoints

import Express from "express";
import fs, { writeFile } from "fs";
import { dirname, join, extname } from "path";
import { fileURLToPath } from "url";
import uniqid from "uniqid";
import createHttpError from "http-errors";
import { checkAuthorsSchema, triggerBadRequest } from "../validation.js";
import {
  getAuthors,
  publicFolderPath,
  saveAuthorImage,
  writeAuthors,
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
//     const filename = req.params.authorId + extname(file.originalname);
//     cb(null, filename);
//   },
// });

const upload = multer({ storage: cloudStorage });

const authorsRouter = Express.Router();

console.log(getAuthors());

// POST (new author)

authorsRouter.post(
  "/",
  checkAuthorsSchema,
  triggerBadRequest,
  async (req, res, next) => {
    try {
      const newAuthor = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: uniqid(),
      };

      const authorsArray = await getAuthors();

      const emailInUse = authorsArray.some(
        (author) => author.email === req.body.email
      );

      if (!emailInUse) {
        authorsArray.push(newAuthor);
        await writeAuthors(authorsArray);

        res.status(201).send({
          name: newAuthor.name + " " + newAuthor.surname,
          id: newAuthor.id,
        });
      } else {
        next(
          createHttpError(
            400,
            `${req.body.email} is already registered to another user `
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

// GET (all authors)

authorsRouter.get("/", async (req, res, next) => {
  try {
    const authorsArray = await getAuthors();
    res.send(authorsArray);
  } catch (error) {
    next(error);
  }
});

// GET (single author)

authorsRouter.get("/:authorId", async (req, res, next) => {
  try {
    const authorsArray = await getAuthors();
    const foundAuthor = authorsArray.find(
      (author) => author.id === req.params.authorId
    );
    if (foundAuthor) {
      res.send(foundAuthor);
    } else {
      next(
        createHttpError(404, `Author with id ${req.params.authorId} not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

// PUT

authorsRouter.put(
  "/:authorId",
  checkAuthorsSchema,
  triggerBadRequest,
  async (req, res, next) => {
    try {
      const authorsArray = await getAuthors();
      const index = authorsArray.findIndex(
        (author) => author.id === req.params.authorId
      );
      if (index !== -1) {
        const oldAuthor = authorsArray[index];
        const updatedAuthor = {
          ...oldAuthor,
          ...req.body,
          updatedAt: new Date(),
        };
        authorsArray[index] = updatedAuthor;
        await writeAuthors(authorsArray);
        res.send(updatedAuthor);
      } else {
        next(
          createHttpError(
            404,
            `There is no author with this ${req.body.authorId} id`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

// DELETE

authorsRouter.delete("/:authorId", async (req, res, next) => {
  try {
    const authorsArray = await getAuthors();
    const remainingAuthors = authorsArray.filter(
      (author) => author.id !== req.params.authorId
    );

    if (authorsArray.length !== remainingAuthors.length) {
      writeAuthors(remainingAuthors);
      res.status(204).send();
    } else {
      next(
        createHttpError(404, `Author with ${req.params.authorId} id not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

// POST (checkEmail)

authorsRouter.post("/checkEmail", async (req, res, next) => {
  try {
    const authorsArray = await getAuthors();

    if (req.body && req.body.email) {
      const emailInUse = authorsArray.some(
        (author) => author.email === req.body.email
      );
      res.send({ emailInUse: emailInUse });
    } else {
      next(createHttpError(400, "TEST"));
    }
  } catch (error) {
    next(error);
  }
  // const authorsArray = JSON.parse(fs.readFileSync(authorsPath));
  const emailInUse = authors.some((author) => author.email === req.body.email);

  res.send(
    `This email: ${req.body.email} is already is use (bool:${emailInUse})`
  );
});

authorsRouter.post(
  "/:authorId/uploadAvatar",
  upload.single("avatar"),
  async (req, res, next) => {
    try {
      console.log(req.file);
      const authors = await getAuthors();
      const index = authors.findIndex(
        (author) => author.id === req.params.authorId
      );
      if (index !== -1) {
        // const filename = req.params.authorId + extname(req.file.originalname);
        // await saveAuthorImage(filename, req.file.buffer);
        authors[index] = {
          ...authors[index],
          avatar: req.file.path,
        };
        await writeAuthors(authors);
        res.send({ message: `${req.params.authorId} avatar uploaded` });
      } else {
        next(createHttpError(404, `no author with id ${req.params.authorId} `));
      }
    } catch (error) {
      next(error);
    }
  }
);

export default authorsRouter;
