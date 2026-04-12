// types/model.ts

import type { ProblemDifficulty, ProblemTag } from "@/types/problem";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
  clerkId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ITestCase {
  input: string;
  output: string;
  isHidden?: boolean;
  explanation?: string;
}

export interface ICodeStub {
  language: "javascript" | "python" | "java" | "cpp";
  starterCode: string;
  solutionCode?: string;
}

export interface ICodeSnippet {
  lang: string;
  langSlug: string;
  code: string;
}

/**
 * Lightweight problem shape used inside session responses
 * Returned by session endpoints after populate("problem", ...)
 */
export interface ISessionProblem {
  _id?: string;
  questionId: number;
  questionFrontendId: number;
  title: string;
  titleSlug: string;
  difficulty: ProblemDifficulty;
  isPaidOnly: boolean;
  topicTags: ProblemTag[];
  codeSnippets?: ICodeSnippet[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ISession {
  _id: string;
  host: IUser | string;
  problem: ISessionProblem | string;
  participant?: IUser | string | null;
  status: "active" | "completed";
  callId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ISessionDetail = Omit<ISession, "host" | "problem" | "participant"> & {
  host: IUser;
  problem: ISessionProblem;
  participant?: IUser | null;
};