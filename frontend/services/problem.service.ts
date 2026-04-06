import { api } from "@/lib/api";
import { ProblemListParams } from "@/types/problem";


export const  fetchProblemList = async ({
    page=1, 
    limit=10, 
    ...rest
}: ProblemListParams) =>  {
  const { data } = await api.get("/problems", {
    params: {
      page,
      limit,
      ...rest
    }
  });
  return data.data.problems;
}

export const fetchProblemDetail = async (slug: string) => {
  const { data } = await api.get(`/problems/${slug}`);
  return data.data.problem;
}