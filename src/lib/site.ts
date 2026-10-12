export const site = {
  name: "riverlog",
  author: "Hyerin Kim",
  nickname: "River",
  description: "River의 블로그이자 지식 창고.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://riverlog-five.vercel.app",
  email: "aprilhyerinkim@gmail.com",
  github: "https://github.com/HerrineKim",
  repo: "https://github.com/HerrineKim/riverlog",
  linkedin: "https://www.linkedin.com/in/aprilhyerinkim/",
  // Comments live in this repo's GitHub Discussions (https://giscus.app)
  giscus: {
    repo: "HerrineKim/riverlog",
    repoId: "R_kgDOVE2D9A",
    category: "Announcements",
    categoryId: "DIC_kwDOVE2D9M4DH_d1",
  },
} as const;
