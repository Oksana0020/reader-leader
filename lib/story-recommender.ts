/** Story recommendation prototype: vector-style similarity scoring with simple K-NN ranking and K-means-style clustering. */

import type { Story } from "../lib/domain";
import { STORIES } from "../lib/seed";

export type StoryVector = {
  id: string;
  band: string;
  focus: string;
  level: number;
  titleTokens: string[];
  textTokens: string[];
  vector: number[];
};

const STORY_FEATURES = new Map<string, StoryVector>();

function normalizeToken(token: string): string {
  return token.toLowerCase().replace(/[^a-z]/g, "");
}

function buildTokens(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .map(normalizeToken)
    .filter(Boolean);
}

function makeVector(story: Story): number[] {
  const textTokens = buildTokens(story.targetText);
  const featureBag = new Set<string>();

  for (const token of textTokens) featureBag.add(token);
  for (const token of buildTokens(story.focus)) featureBag.add(token);
  for (const token of buildTokens(story.title)) featureBag.add(token);

  const keywords = [...featureBag].sort();
  const bandScore = {
    pink: 1,
    red: 2,
    yellow: 3,
    green: 4,
  } as const;

  const vector = keywords.map((keyword) => {
    const score = (textTokens.filter((token) => token === keyword).length * 3)
      + (buildTokens(story.focus).filter((token) => token === keyword).length * 2)
      + (buildTokens(story.title).filter((token) => token === keyword).length * 2)
      + (keyword.includes("cat") || keyword.includes("dog") || keyword.includes("sun") || keyword.includes("frog") ? 1 : 0)
      + (story.band in bandScore ? bandScore[story.band as keyof typeof bandScore] * 0.2 : 0);
    return Number(score.toFixed(3));
  });

  return vector;
}

function getStoryVector(story: Story): StoryVector {
  const existing = STORY_FEATURES.get(story.id);
  if (existing) return existing;

  const vector = makeVector(story);
  const record: StoryVector = {
    id: story.id,
    band: story.band,
    focus: story.focus,
    level: story.level,
    titleTokens: buildTokens(story.title),
    textTokens: buildTokens(story.targetText),
    vector,
  };
  STORY_FEATURES.set(story.id, record);
  return record;
}

function cosineSimilarity(left: number[], right: number[]): number {
  if (left.length === 0 || right.length === 0 || left.length !== right.length) return 0;

  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;

  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftNorm += left[index] * left[index];
    rightNorm += right[index] * right[index];
  }

  if (leftNorm === 0 || rightNorm === 0) return 0;
  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
}

export function recommendStoriesForStory(storyId: string, storyList: Story[] = STORIES, limit = 3): Story[] {
  const current = storyList.find((story) => story.id === storyId) ?? storyList[0];
  const currentVector = getStoryVector(current);

  return [...storyList]
    .filter((story) => story.id !== current.id)
    .map((story) => {
      const candidateVector = getStoryVector(story);
      const score = cosineSimilarity(currentVector.vector, candidateVector.vector);
      const bandBoost = current.band === story.band ? 0.4 : 0;
      const levelBoost = Math.abs(current.level - story.level) <= 1 ? 0.25 : 0;
      const focusBoost = current.focus === story.focus ? 0.35 : 0;
      return { story, score: score + bandBoost + levelBoost + focusBoost };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map(({ story }) => story);
}

export function clusterStories(storyList: Story[] = STORIES, clusterCount = 3): Story[][] {
  const clusters: Story[][] = Array.from({ length: clusterCount }, () => []);

  const centroids = storyList.slice(0, clusterCount).map((story) => getStoryVector(story).vector);

  for (const story of storyList) {
    const vector = getStoryVector(story).vector;
    let bestClusterIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let index = 0; index < centroids.length; index += 1) {
      const distance = 1 - cosineSimilarity(vector, centroids[index]);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestClusterIndex = index;
      }
    }

    clusters[bestClusterIndex].push(story);
  }

  return clusters.filter((cluster) => cluster.length > 0);
}
