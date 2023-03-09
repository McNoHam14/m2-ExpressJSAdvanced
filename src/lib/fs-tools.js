import fs from "fs-extra";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const { readJSON, writeJSON, writeFile } = fs;

const folderPath = join(dirname(fileURLToPath(import.meta.url)), "../data");

console.log("A", process.cwd());
export const publicFolderPath = join(process.cwd(), "./public/img/authors");

const authorImagePath = join(publicFolderPath, "../api/authors");

const blogPostImagePath = join(publicFolderPath, "../api/blogPosts");

const authorsPath = join(folderPath, "../data/authors.json");

const blogPostsPath = join(folderPath, "../data/blogPosts.json");

export const getAuthors = () => readJSON(authorsPath);
export const writeAuthors = (authors) => writeJSON(authorsPath, authors);

export const getBlogPosts = () => readJSON(blogPostsPath);
export const writeBlogPosts = (blogPosts) =>
  writeJSON(blogPostsPath, blogPosts);

export const saveAuthorImage = (fileName, fileContent) =>
  writeFile(join(authorImagePath, fileName), fileContent);

export const saveBlogPostImage = (fileName, fileContent) => {
  writeFile(join(blogPostImagePath, fileName), fileContent);
};
