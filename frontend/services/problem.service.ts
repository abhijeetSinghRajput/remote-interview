import { api } from "@/lib/api";
import { ProblemItem, ProblemListApiResponse, ProblemListParams, ProblemListResponse } from "@/types/problem";

export const fetchProblemList = async (
  params: ProblemListParams
): Promise<ProblemListResponse> => {
  const { data } = await api.get<ProblemListApiResponse>("/problems", {
    params: {
      limit: params.limit ?? 100,
      skip: params.skip ?? 0,
      ...(params.difficulty &&
        params.difficulty !== "all" && { difficulty: params.difficulty }),
      ...(params.tags &&
        params.tags !== "all" && { tags: params.tags }),
      ...(params.search &&
        params.search.trim() && { search: params.search }),
    },
  });

  return data.message;
};

export interface ProblemDetailApiResponse {
  success: boolean;
  statusCode: number;
  message: {
    problem: ProblemItem;
  };
}

export const fetchProblemDetail = async (slug: string) => {
  const { data } = await api.get<ProblemDetailApiResponse>(
    `/problems/${slug}`
  );
  return data.message.problem;
};