export interface ProblemListParams {
  skip?: number;
  limit?: number;
  difficulty?: string;
  tags?: string;
  search?: string;
}

export interface TopicTag {
  name: string;
  id: string;
  slug: string;
}

export interface SimilarQuestion {
  title: string;
  titleSlug: string;
  difficulty: string;
  isPaidOnly?: boolean;
};

export interface ProblemItem {
  questionFrontendId: number; // FIXED
  questionId: number,
  title: string;
  titleSlug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  isPaidOnly: boolean; // ADDED
  topicTags: TopicTag[]; // FIXED
}

export interface ProblemListMeta {
  total: number;
  limit: number;
  skip: number;
  returned: number;
  hasMore: boolean;
  nextSkip: number | null;
}

export interface ProblemListResponse {
  meta: ProblemListMeta;
  problems: ProblemItem[];
}

/**
 * Full API response shape
 */
export interface ProblemListApiResponse {
  success: boolean;
  statusCode: number;
  message: ProblemListResponse;
}