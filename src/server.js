import Express from "express";
import listEndpoints from "express-list-endpoints";
import authorsRouter from "./api/authors/index.js";
import blogPostsRouter from "./api/blogPosts/index.js";
import filesRouter from "./api/files/index.js";
import {
  badRequestHandler,
  unauthorizedHandler,
  notfoundHandler,
  genericErrorHandler,
} from "./errorHandlers.js";
import cors from "cors";
import { dirname, join, extname } from "path";
import { fileURLToPath } from "url";
import { publicFolderPath } from "./lib/fs-tools.js";
import createHttpError from "http-errors";

const server = Express();
const port = process.env.PORT || 3002;
const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];

server.use(Express.static(publicFolderPath));

server.use(
  cors({
    origin: (currentOrigin, corsNext) => {
      if (!currentOrigin || whitelist.indexOf(currentOrigin) !== -1) {
        corsNext(null, true);
      } else {
        corsNext(
          createHttpError(400, `Origin ${currentOrigin} is not whitelisted`)
        );
      }
    },
  })
);

server.use(Express.json());

// Endpoints

server.use("/authors", authorsRouter);
server.use("/blogPosts", blogPostsRouter);
server.use("/", filesRouter);

// Error handlers

server.use(badRequestHandler); // 400
server.use(unauthorizedHandler); // 401
server.use(notfoundHandler); // 404
server.use(genericErrorHandler); // 500

server.listen(port, () => {
  console.table(listEndpoints(server));
  console.log(`Server is running on ${port}`);
});
