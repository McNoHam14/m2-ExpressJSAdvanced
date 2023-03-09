import { checkSchema, validationResult } from "express-validator";
import createHttpError from "http-errors";

const authorsSchema = {
  name: {
    in: ["body"],
    isString: {
      errorMessage: "name needs to be a string",
    },
  },
  surname: {
    in: ["body"],
    isString: {
      errorMessage: "surname needs to be a string",
    },
  },
  email: {
    in: ["body"],
    isString: {
      errorMessage: "email needs to be a string",
    },
  },
  DoB: {
    in: ["body"],
    isString: {
      errorMessage: "dob needs to be a string",
    },
  },
  avatar: {
    in: ["body"],
    isURL: {
      errorMessage: "avater needs to be a valid image url",
    },
  },
};

const blogPostsSchema = {
  category: {
    in: ["body"],
    isString: {
      errorMessage: "category needs to be a string",
    },
  },
  title: {
    in: ["body"],
    isString: {
      errorMessage: "title needs to be a string",
    },
  },
  cover: {
    in: ["body"],
    isURL: {
      errorMessage: "cover needs to be a valid image url",
    },
  },
  "readTime.value": {
    in: ["body"],
    isInt: {
      errorMessage: "readtime value needs to be an integer",
    },
  },
  "readTime.unit": {
    in: ["body"],
    isString: {
      errorMessage: "readtime unit needs to be a string",
    },
  },
  content: {
    in: ["body"],
    isString: {
      errorMessage: "content needs to be a string",
    },
  },
};

export const checkAuthorsSchema = checkSchema(authorsSchema);
export const checkBlogPostsSchema = checkSchema(blogPostsSchema);

export const triggerBadRequest = (req, res, next) => {
  const errors = validationResult(req);

  console.log(errors.array());

  if (errors.isEmpty()) {
    next();
  } else {
    next(
      createHttpError(400, "Error during validation", {
        errorsList: errors.array(),
      })
    );
  }
};
