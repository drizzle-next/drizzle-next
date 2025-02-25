import { PostRowActions } from "./drizzle-cms.components";
import { db } from "./lib/db";
import { DrizzleCmsConfig } from "./package/types";
import { categories } from "./schema/categories";
import { posts } from "./schema/posts";
import { postsTags } from "./schema/posts-tags";
import { tags } from "./schema/tags";
import { users } from "./schema/users";

export const config: DrizzleCmsConfig = {
  basePath: "/cms",
  schema: {
    users: { drizzleTable: users, label: "Users" },
    posts: {
      drizzleTable: posts,
      formControlMap: { content: "textarea", updatedAt: "input" },
      TableRowActionsSlot: PostRowActions,
    },
    categories: {
      drizzleTable: categories,
    },
    tags: {
      drizzleTable: tags,
    },
    postsTags: {
      drizzleTable: postsTags,
      label: "posts tags",
    },
  },
  db: db,
  dbDialect: "sqlite",
  sidebar: [
    { text: "Custom Page", link: "/cms/custom-page" },
    { text: "Custom Group", items: [{ text: "A custom link", link: "/" }] },
    { text: "Tables", type: "dynamic-tables" },
  ],
};
