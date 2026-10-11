"use client";

import dynamic from "next/dynamic";

const MindMapCanvas = dynamic(() => import("./MindMapCanvas"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center text-sm text-muted">
      <span className="animate-pulse">지식의 별자리를 그리는 중…</span>
    </div>
  ),
});

export default MindMapCanvas;
