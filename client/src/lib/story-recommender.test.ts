import { describe, expect, it } from "vitest";
import { STORIES } from "../../../lib/seed";
import { clusterStories, recommendStoriesForStory } from "../../../lib/story-recommender";

describe("story recommender", () => {
  it("recommends closely related stories in the same phonics family", () => {
    const recommendations = recommendStoriesForStory("fat-cat", STORIES, 3);
    expect(recommendations[0]?.id).toBe("big-dog");
    expect(recommendations.some((story) => story.id === "sun-bun")).toBe(true);
  });

  it("creates a bounded set of clusters for the story library", () => {
    const clusters = clusterStories(STORIES, 3);
    expect(clusters).toHaveLength(3);
    expect(clusters.every((cluster) => cluster.length > 0)).toBe(true);
  });
});
