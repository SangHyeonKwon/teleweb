"use client";

import { useEffect, useRef, useCallback } from "react";
import { SerializedMessage } from "@/lib/telegram/types";
import PostCard from "./PostCard";

export default function PostList({
  messages,
  loading,
  hasMore,
  onLoadMore,
}: {
  messages: SerializedMessage[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        onLoadMore();
      }
    },
    [hasMore, loading, onLoadMore]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: "200px",
    });
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [handleIntersect]);

  if (messages.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
        <h2 className="text-xl font-bold">No posts yet</h2>
        <p className="mt-2 text-secondary">
          Join some Telegram channels to see their posts here.
        </p>
      </div>
    );
  }

  return (
    <div>
      {messages.map((msg) => (
        <PostCard key={`${msg.channelId}-${msg.id}`} message={msg} />
      ))}

      {loading && (
        <div className="flex justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}
