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

const server = Express();
const port = 3002;

server.use(cors());

server.use(Express.json());
server.use(Express.static(publicFolderPath));

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
