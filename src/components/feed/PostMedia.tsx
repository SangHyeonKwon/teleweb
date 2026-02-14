"use client";

import { useState } from "react";

export default function PostMedia({
  mediaId,
  type,
}: {
  mediaId: string;
  type: "photo" | "video" | "document" | "none";
}) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (type === "none") return null;

  if (type === "photo") {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-border">
        {loading && (
          <div className="absolute inset-0 animate-pulse bg-surface" />
        )}
        {error ? (
          <div className="flex h-32 items-center justify-center bg-surface text-sm text-secondary">
            Media unavailable
          </div>
        ) : (
          <img
            src={`/api/media/${mediaId}`}
            alt=""
            className="max-h-[510px] w-full object-cover"
            onLoad={() => setLoading(false)}
            onError={() => {
              setError(true);
              setLoading(false);
            }}
          />
        )}
      </div>
    );
  }

  if (type === "video") {
    return (
      <div className="overflow-hidden rounded-2xl border border-border">
        <video
          src={`/api/media/${mediaId}`}
          controls
          className="max-h-[510px] w-full"
          preload="metadata"
        />
      </div>
    );
  }

  // Document
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
      <svg
        viewBox="0 0 24 24"
        className="h-8 w-8 shrink-0 text-primary"
        fill="currentColor"
      >
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
      </svg>
      <a
        href={`/api/media/${mediaId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-primary hover:underline"
      >
        Download file
      </a>
    </div>
  );
}
