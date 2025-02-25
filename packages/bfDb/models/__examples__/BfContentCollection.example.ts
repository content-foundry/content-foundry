import { BfCurrentViewer } from "packages/bfDb/classes/BfCurrentViewer.ts";
import { BfContentCollection } from "packages/bfDb/models/BfContentCollection.ts";
import { getLogger } from "packages/logger.ts";
import { toBfGid } from "packages/bfDb/classes/BfNodeIds.ts";
import { BfErrorNodeNotFound } from "packages/bfDb/classes/BfErrorNode.ts";

const logger = getLogger(import.meta);

/**
 * Example function to demonstrate how to use BfContentCollection
 * to load and display content from the filesystem.
 */
export async function loadContentExample() {
  // Create a logged out viewer (or use an authenticated one if needed)
  const cv = BfCurrentViewer.createLoggedOut(import.meta);

  try {
    // Load a specific content item
    const contentItem = await BfContentCollection.findX(
      cv,
      toBfGid("content/blog/welcome-post"),
    );

    logger.info("Found content item:", {
      title: contentItem.props.title,
      description: contentItem.props.description,
      contentPreview: typeof contentItem.props.content === "string"
        ? contentItem.props.content.substring(0, 100) + "..."
        : String(contentItem.props.content),
    });

    // Load all blog posts
    const allBlogPosts = await BfContentCollection.query(cv, undefined, {
      path: "content/blog",
    });

    logger.info(`Found ${allBlogPosts.length} blog posts`);

    // Find featured content
    const featuredContent = allBlogPosts.filter((post) =>
      post.props.featured === true
    );

    logger.info(`Found ${featuredContent.length} featured posts`);

    // Filter content by tag (if tags exist in the frontmatter)
    const taggedContent = allBlogPosts.filter((post) => {
      const tags = post.props.tags || [];
      return Array.isArray(tags) && tags.includes("typescript");
    });

    logger.info(`Found ${taggedContent.length} posts tagged with "typescript"`);

    // You can also load content collections from other directories
    const docContent = await BfContentCollection.query(cv, undefined, {
      path: "content/docs",
    });

    logger.info(`Found ${docContent.length} documentation pages`);

    return {
      singlePost: contentItem,
      allPosts: allBlogPosts,
      featuredPosts: featuredContent,
      taggedPosts: taggedContent,
      docs: docContent,
    };
  } catch (error) {
    logger.error("Error loading content:", error);
    throw error;
  }
}

/**
 * Example of how to use BfContentCollection in a server route handler
 */
export async function handleContentRequest(request: Request) {
  const url = new URL(request.url);
  const contentPath = url.pathname.replace(/^\/content\//, "");

  try {
    const cv = BfCurrentViewer.createFromRequest(
      import.meta,
      request,
      new Headers(),
    );
    const content = await BfContentCollection.findX(
      cv,
      toBfGid(`content/${contentPath}`),
    );

    return new Response(
      JSON.stringify({
        title: content.props.title,
        description: content.props.description,
        content: content.props.content,
        metadata: content.metadata,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    if (error instanceof BfErrorNodeNotFound) {
      return new Response(JSON.stringify({ error: "Content not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
