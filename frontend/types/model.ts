// types/model.ts

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

export interface IProblem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  testCases: ITestCase[];
  codeStubs: ICodeStub[];
  hints: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ISession {
  _id: string;
  host: IUser | string;
  problem: IProblem | string;
  participant?: IUser | string;
  status: "active" | "completed";
  callId?: string;
  createdAt?: string;
  updatedAt?: string;
}
