import { defineDocumentType, makeSource, ComputedFields } from "contentlayer/source-files";

const computedFields: ComputedFields = {
  slug: {
    type: "string",
    resolve: (doc) => {
      const hasDateDir = doc._raw.flattenedPath.split("/")[1].match(/^\d{4}-\d{2}$/);
      const slug = hasDateDir
        ? `/posts/${doc._raw.flattenedPath.split("/")[2].replace(/#( )?/, "")}`
        : `/${doc._raw.flattenedPath}`;

      console.log("🚀 ~ slug:", slug);
      return slug;
      // return `/${doc._raw.flattenedPath}`;

      // '/   posts/2018-08/# 盘点 React 16.0 ~ 16.5 主要更新及其应用/README
    },
  },
  slugAsParams: {
    type: "string",
    resolve: (doc) => {
      const hasDateDir = doc._raw.flattenedPath.split("/")[1].match(/^\d{4}-\d{2}$/);
      const slug = hasDateDir
        ? `post/${doc._raw.flattenedPath.split("/")[2].replace(/#( )?/, "")}`
        : doc._raw.flattenedPath;

      return slug.split("/").slice(1).join("/");
    },
  },
};

export const Page = defineDocumentType(() => ({
  name: "Page",
  filePathPattern: `src/content/pages/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
    },
    description: {
      type: "string",
    },
  },
  computedFields,
}));

export const Post = defineDocumentType(() => ({
  name: "Post",
  filePathPattern: `src/content/posts/**/*.md`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true,
    },
    description: {
      type: "string",
    },
    date: {
      type: "date",
      required: false,
    },
  },
  computedFields,
}));

export default makeSource({
  contentDirPath: "./src/content",
  documentTypes: [Post, Page],
});
