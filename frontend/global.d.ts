// Allow importing CSS modules and global CSS in TypeScript without type errors
// This is a common workaround for Next.js + TypeScript projects

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "@/app/styles/*.css";
