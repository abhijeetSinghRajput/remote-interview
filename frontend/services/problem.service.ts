import { api } from "@/lib/api";
import {
  ProblemDetail,
  ProblemDetailApiResponse,
  ProblemListApiResponse,
  ProblemListParams,
  ProblemListResponse,
} from "@/types/problem";

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
        params.tags.length > 0 && { tags: params.tags.join(",") }),
      ...(params.search &&
        params.search.trim() && { search: params.search.trim() }),
    },
  });

  return data.message;
};

export const fetchProblemDetail = async (
  slug: string
): Promise<ProblemDetail> => {
  const { data } = await api.get<ProblemDetailApiResponse>(`/problems/${slug}`);
  return data.message.problem;
};