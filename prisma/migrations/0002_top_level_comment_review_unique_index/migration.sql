CREATE UNIQUE INDEX "Comment_recipeId_authorId_top_level_unique"
ON "Comment" ("recipeId", "authorId")
WHERE "parentId" IS NULL;