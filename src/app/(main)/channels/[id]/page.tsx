"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { SerializedMessage } from "@/lib/telegram/types";
import { SerializedChannel } from "@/lib/telegram/types";
import PostList from "@/components/feed/PostList";
import ChannelAvatar from "@/components/ui/ChannelAvatar";

export default function ChannelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const channelId = params.id as string;

  const [channel, setChannel] = useState<SerializedChannel | null>(null);
  const [messages, setMessages] = useState<SerializedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [nextOffsetId, setNextOffsetId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/channels/${channelId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.channel) setChannel(data.channel);
      })
      .catch(() => {});
  }, [channelId]);

  const fetchMessages = useCallback(
    async (offsetId?: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: "20" });
        if (offsetId) params.set("offsetId", offsetId.toString());

        const res = await fetch(
          `/api/channels/${channelId}/messages?${params}`
        );
        const data = await res.json();

        if (data.messages) {
          setMessages((prev) =>
            offsetId ? [...prev, ...data.messages] : data.messages
          );
          setNextOffsetId(data.nextOffsetId);
          setHasMore(data.messages.length === 20);
        }
      } catch {
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [channelId]
  );

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleLoadMore = useCallback(() => {
    if (nextOffsetId && !loading) {
      fetchMessages(nextOffsetId);
    }
  }, [nextOffsetId, loading, fetchMessages]);

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 px-4 py-2 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.back()}
            className="rounded-full p-2 transition-colors hover:bg-hover"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="currentColor"
            >
              <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold">
              {channel?.title || "Channel"}
            </h1>
            {channel?.username && (
              <p className="text-[13px] text-secondary">
                @{channel.username}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Channel info banner */}
      {channel && (
        <div className="border-b border-border px-4 py-4">
          <div className="flex items-center gap-4">
            <ChannelAvatar
              channelId={channelId}
              title={channel.title}
              size={64}
            />
            <div>
              <h2 className="text-lg font-bold">{channel.title}</h2>
              <p className="text-sm text-secondary">
                {channel.participantsCount > 0 && (
                  <span>
                    {channel.participantsCount.toLocaleString()} subscribers
                  </span>
                )}
                {channel.isChannel ? " · Channel" : " · Group"}
              </p>
            </div>
          </div>
        </div>
      )}

      <PostList
        messages={messages}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
      />
    </div>
  );
}
