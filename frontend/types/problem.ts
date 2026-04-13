import { ICodeSnippet } from "./model";

export type ProblemDifficulty = "Easy" | "Medium" | "Hard";
export type ProblemDifficultyFilter = ProblemDifficulty | "all";

export interface SimilarProblem {
  title: string;
  titleSlug: string;
  difficulty: ProblemDifficulty;
  isPaidOnly?: boolean;
}

export interface ProblemTag {
  name: string;
  id: string | number;
  slug: string;
}

export interface ProblemListParams {
  skip?: number;
  limit?: number;
  difficulty?: ProblemDifficultyFilter;
  tags?: string[];
  search?: string;
}

/** item returned by GET /problems */
export interface ProblemListItem {
  questionFrontendId: number;
  title: string;
  titleSlug: string;
  difficulty: ProblemDifficulty;
  isPaidOnly: boolean;
  isUnlocked?: boolean;
  topicTags: ProblemTag[];
}

/** full problem returned by GET /problems/:slug */
export interface ProblemDetail extends ProblemListItem {
  questionId: number;
  codeSnippets: ICodeSnippet[];

  content?: string;
  description?: string;
  constraints?: string[];
  hints?: string[];
  similarQuestions?: SimilarProblem[];
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
  problems: ProblemListItem[];
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export type ProblemListApiResponse = ApiResponse<ProblemListResponse>;

export type ProblemDetailApiResponse = ApiResponse<{
  problem: ProblemDetail;
}>;