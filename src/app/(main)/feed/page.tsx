"use client";

import { useState, useCallback, useEffect } from "react";
import { SerializedMessage } from "@/lib/telegram/types";
import PostList from "@/components/feed/PostList";

interface Folder {
  id: number;
  title: string;
  channelIds: string[];
  emoticon: string | null;
}

export default function FeedPage() {
  const [messages, setMessages] = useState<SerializedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [nextBefore, setNextBefore] = useState<number | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");

  // Fetch folders on mount
  useEffect(() => {
    fetch("/api/folders")
      .then((res) => res.json())
      .then((data) => {
        if (data.folders) {
          setFolders(data.folders);
        }
      })
      .catch(() => {});
  }, []);

  const fetchMessages = useCallback(
    async (before?: number, tab?: string) => {
      setLoading(true);
      try {
        const currentTab = tab ?? activeTab;
        const params = new URLSearchParams({ limit: "20" });
        if (before) params.set("before", before.toString());

        // If a folder tab is selected, pass its channel IDs
        if (currentTab !== "all") {
          const folder = folders.find((f) => f.id.toString() === currentTab);
          if (folder) {
            params.set("channelIds", folder.channelIds.join(","));
          }
        }

        const res = await fetch(`/api/feed?${params}`);
        const data = await res.json();

        if (data.messages) {
          setMessages((prev) =>
            before ? [...prev, ...data.messages] : data.messages
          );
          setNextBefore(data.nextBefore);
          setHasMore(data.messages.length === 20);
        }
      } catch {
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [activeTab, folders]
  );

  // Fetch messages when tab changes or on initial load
  useEffect(() => {
    fetchMessages(undefined, activeTab);
  }, [activeTab, fetchMessages]);

  const handleLoadMore = useCallback(() => {
    if (nextBefore && !loading) {
      fetchMessages(nextBefore);
    }
  }, [nextBefore, loading, fetchMessages]);

  function handleTabChange(tabId: string) {
    if (tabId === activeTab) return;
    setMessages([]);
    setNextBefore(null);
    setHasMore(true);
    setActiveTab(tabId);
  }

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
        <h1 className="px-4 pt-3 text-xl font-bold">Home</h1>

        {/* Folder tabs */}
        <div className="flex overflow-x-auto">
          <button
            onClick={() => handleTabChange("all")}
            className={`relative shrink-0 px-4 py-3 text-sm font-medium transition-colors hover:bg-hover ${
              activeTab === "all" ? "text-foreground" : "text-secondary"
            }`}
          >
            All
            {activeTab === "all" && (
              <div className="absolute bottom-0 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-primary" />
            )}
          </button>
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => handleTabChange(folder.id.toString())}
              className={`relative shrink-0 px-4 py-3 text-sm font-medium transition-colors hover:bg-hover ${
                activeTab === folder.id.toString()
                  ? "text-foreground"
                  : "text-secondary"
              }`}
            >
              {folder.emoticon ? `${folder.emoticon} ` : ""}
              {folder.title}
              {activeTab === folder.id.toString() && (
                <div className="absolute bottom-0 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      <PostList
        messages={messages}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
      />
    </div>
  );
}
