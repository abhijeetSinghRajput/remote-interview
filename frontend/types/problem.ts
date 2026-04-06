export type ProblemListParams = {
  page?: number;
  limit?: number;
  difficulty?: "easy" | "medium" | "hard";
  tag?: string;
  search?: string;
};