import { createServerFn } from "@tanstack/react-start";
import z from "zod/v4";
import { env } from "./env/server";

const RAINDROP_API_URL = "https://api.raindrop.io/rest/v1";
export const PAGE_SIZE = 4;

export const isRaindropConfigured = (): boolean =>
  Boolean(env.RAINDROP_ACCESS_TOKEN);

export const getOptions = createServerFn({ method: "GET" }).handler(() => {
  if (!env.RAINDROP_ACCESS_TOKEN) {
    console.warn("[service:raindrop] [level:warn] missing access token");
    return null;
  }

  return {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.RAINDROP_ACCESS_TOKEN}`,
    },
    next: { revalidate: 0 },
  };
});

export const getCollections = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const options = await getOptions();
      if (!options) {
        return null;
      }
      const response = await fetch(`${RAINDROP_API_URL}/collections`, options);
      return await response.json();
    } catch (_error) {
      return null;
    }
  }
);

export const getCollection = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      id: z.string(),
    })
  )
  .handler(async ({ data }) => {
    try {
      const options = await getOptions();
      if (!options) {
        return null;
      }
      const response = await fetch(
        `${RAINDROP_API_URL}/collection/${data.id}`,
        options
      );
      const collection = await response.json();
      return collection;
    } catch (_error) {
      return null;
    }
  });

export const getBookmarksByCollectionId = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      collectionId: z.string(),
      pageIndex: z.number().optional(),
    })
  )
  .handler(async ({ data }) => {
    try {
      const options = await getOptions();
      if (!options) {
        return null;
      }
      const params = new URLSearchParams({
        page: String(data.pageIndex ?? 0),
        perpage: PAGE_SIZE.toString(),
      });
      const response = await fetch(
        `${RAINDROP_API_URL}/raindrops/${data.collectionId}?${params}`,
        options
      );
      return await response.json();
    } catch (_error) {
      return null;
    }
  });
