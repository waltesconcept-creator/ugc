import type { Post, UserInteraction, InteractionSignalType } from './types';

// Signal scoring weights according to Section 8.A of the Master Product Brief
const SIGNAL_WEIGHTS: Record<InteractionSignalType, number> = {
  watch_start: 1,
  watch_complete: 12,
  replay: 16,
  like: 8,
  save: 14,      // Saves indicate high intent and quality
  share: 10,
  comment: 7,
  profile_visit: 6,
  skip_fast: -10, // Quickly swiping away reduces category affinity
  not_interested: -60, // Strong negative signal
};

// In-memory session tracking for reactive recommendations
class RecommendationEngine {
  private interactions: UserInteraction[] = [];
  private notInterestedPostIds: Set<string> = new Set();
  private notInterestedCreatorIds: Set<string> = new Set();
  private categoryAffinities: Map<string, number> = new Map();
  private creatorAffinities: Map<string, number> = new Map();

  constructor() {
    // Initial baseline interests (Section 8.C)
    this.categoryAffinities.set('Beauty & Skincare', 15);
    this.categoryAffinities.set('Tech & Gadgets', 12);
    this.categoryAffinities.set('Fashion & Apparel', 10);
    this.categoryAffinities.set('Food & Beverage', 10);
    this.categoryAffinities.set('Fitness & Wellness', 8);
    this.categoryAffinities.set('Travel & Hospitality', 8);
  }

  // Record user interaction signal
  public recordSignal(
    postId: string,
    creatorId: string,
    category: string,
    signal: InteractionSignalType,
    watchDurationSeconds?: number
  ) {
    const interaction: UserInteraction = {
      postId,
      creatorId,
      category,
      signal,
      watchDurationSeconds,
      timestamp: Date.now(),
    };
    this.interactions.push(interaction);

    const weight = SIGNAL_WEIGHTS[signal] || 0;

    // Update category affinity
    const currentCatScore = this.categoryAffinities.get(category) || 0;
    this.categoryAffinities.set(category, Math.max(-50, currentCatScore + weight));

    // Update creator affinity
    const currentCreatorScore = this.creatorAffinities.get(creatorId) || 0;
    this.creatorAffinities.set(creatorId, Math.max(-50, currentCreatorScore + weight));

    if (signal === 'not_interested') {
      this.notInterestedPostIds.add(postId);
    }
  }

  public markNotInterested(postId: string, creatorId?: string) {
    this.notInterestedPostIds.add(postId);
    if (creatorId) {
      this.notInterestedCreatorIds.add(creatorId);
    }
  }

  public boostCategory(category: string, points: number = 20) {
    const current = this.categoryAffinities.get(category) || 0;
    this.categoryAffinities.set(category, current + points);
  }

  // Calculate recommendation score for a given post
  public scorePost(post: Post): number {
    if (this.notInterestedPostIds.has(post.id)) return -999;
    if (this.notInterestedCreatorIds.has(post.creatorId)) return -999;

    let score = 50; // base score

    // 1. Category affinity
    const catScore = this.categoryAffinities.get(post.category) || 0;
    score += catScore * 1.5;

    // 2. Creator affinity
    const creatorScore = this.creatorAffinities.get(post.creatorId) || 0;
    score += creatorScore * 1.2;

    // 3. Section 8.D & 8.G: 48-Hour Freshness & Small Creator Boost
    // Gives emerging creators fair discovery without needing huge follower counts
    if (post.viewsCount < 50_000) {
      score += 15; // Emerging talent discovery bonus
    }
    if (post.isPortfolioPinned) {
      score += 8; // Verified portfolio showpiece
    }

    // 4. Engagement quality ratio (likes/views, saves/views)
    if (post.viewsCount > 0) {
      const saveRate = post.savesCount / post.viewsCount;
      const likeRate = post.likesCount / post.viewsCount;
      score += saveRate * 300 + likeRate * 150;
    }

    return score;
  }

  // Rank posts for "For You" feed with Anti-Monopoly rule (Section 8.E)
  public rankForYouFeed(allPosts: Post[]): Post[] {
    // Filter out hidden posts
    const eligible = allPosts.filter(
      (p) => !this.notInterestedPostIds.has(p.id) && !this.notInterestedCreatorIds.has(p.creatorId)
    );

    // Score and sort
    const scored = eligible.map((post) => ({
      post,
      score: this.scorePost(post),
    }));

    scored.sort((a, b) => b.score - a.score);

    // Apply anti-monopoly diversity rule: max 2 posts from same creator in any 10-item window
    const result: Post[] = [];
    const pool = scored.map((s) => s.post);

    while (pool.length > 0) {
      let candidateIndex = 0;
      const recentWindow = result.slice(-8);

      for (let i = 0; i < pool.length; i++) {
        const candidate = pool[i];
        const occurrences = recentWindow.filter((p) => p.creatorId === candidate.creatorId).length;
        if (occurrences < 2) {
          candidateIndex = i;
          break;
        }
      }

      result.push(pool[candidateIndex]);
      pool.splice(candidateIndex, 1);
    }

    return result;
  }

  // "Following" feed: Chronological from creators followed by the user
  public getFollowingFeed(allPosts: Post[], followingCreatorIds: Set<string>): Post[] {
    return allPosts
      .filter((p) => followingCreatorIds.has(p.creatorId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getCategoryAffinities(): { category: string; score: number }[] {
    const list: { category: string; score: number }[] = [];
    this.categoryAffinities.forEach((score, category) => {
      list.push({ category, score });
    });
    return list.sort((a, b) => b.score - a.score);
  }
}

// Export singleton instance
export const recommendationEngine = new RecommendationEngine();
