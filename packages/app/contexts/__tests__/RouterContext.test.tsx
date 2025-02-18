// packages/app/contexts/RouterContext.test.ts

import { assertEquals } from "@std/assert";
import {
  dynamicRoutes,
  matchRouteWithParams,
} from "packages/app/contexts/RouterContext.tsx";


Deno.test("matchRouteWithParams - dynamic route with optional param", () => {
  // For a route like "/blog/:slug?"
  const optionalRoute = "/blog/:slug?";
  dynamicRoutes.add(optionalRoute);

  // a) No slug
  const noSlug = matchRouteWithParams("/blog");
  assertEquals(noSlug.match, true);
  assertEquals(noSlug.params, { slug: null });
  assertEquals(noSlug.needsRedirect, false);

  // b) With slug
  const withSlug = matchRouteWithParams("/blog/my-post");
  assertEquals(withSlug.match, true);
  assertEquals(withSlug.params, { slug: "my-post" });
  assertEquals(withSlug.needsRedirect, false);
});

Deno.test("matchRouteWithParams - dynamic route with required param", () => {
  // Suppose you have a route like "/docs/:docsSlug"
  const docsRoute = "/docs/:docsSlug";
  dynamicRoutes.add(docsRoute);

  const matched = matchRouteWithParams("/docs/intro-to-xyz");
  assertEquals(matched.match, true);
  assertEquals(matched.params, { docsSlug: "intro-to-xyz" });
  assertEquals(matched.needsRedirect, false);

  // Missing the required param => no match
  const missingParam = matchRouteWithParams("/docs");
  assertEquals(missingParam.match, false);
});

Deno.test("matchRouteWithParams - mismatch returns default object", () => {
  // Try something that definitely doesn't exist
  const result = matchRouteWithParams("/totally/made/up");
  assertEquals(result.match, false);
  assertEquals(result.params, {});
  assertEquals(result.queryParams, {});
  assertEquals(result.needsRedirect, false);
  assertEquals(result.redirectTo, undefined);
});
