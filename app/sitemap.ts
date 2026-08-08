import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { ALL_GAMES } from "@/lib/games/config";

/**
 * Generated from the game registry so a new mode is never left out, which is
 * what happened to Make Exact Operations under the hand-written sitemap.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    ...ALL_GAMES.map((game) => ({
      url: `${SITE_URL}${game.path}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    {
      url: `${SITE_URL}/how-to-play`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ];
}
