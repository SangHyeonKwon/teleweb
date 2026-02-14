"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SerializedChannel } from "@/lib/telegram/types";
import ChannelAvatar from "@/components/ui/ChannelAvatar";

interface Folder {
  id: number;
  title: string;
  channelIds: string[];
  emoticon: string | null;
}

export default function ChannelsPage() {
  const [channels, setChannels] = useState<SerializedChannel[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    Promise.all([
      fetch("/api/channels").then((r) => r.json()),
      fetch("/api/folders").then((r) => r.json()),
    ])
      .then(([channelData, folderData]) => {
        if (channelData.channels) setChannels(channelData.channels);
        if (folderData.folders) setFolders(folderData.folders);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Filter: search + folder tab
  const filtered = channels.filter((ch) => {
    const matchesSearch = ch.title
      .toLowerCase()
      .includes(search.toLowerCase());
    if (activeTab === "all") return matchesSearch;
    const folder = folders.find((f) => f.id.toString() === activeTab);
    if (!folder) return matchesSearch;
    return matchesSearch && folder.channelIds.includes(ch.id);
  });

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
        <h1 className="px-4 pt-3 text-xl font-bold">Channels</h1>
        <div className="px-4 pt-3">
          <input
            type="text"
            placeholder="Search channels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground placeholder:text-secondary focus:border-primary focus:outline-none"
          />
        </div>

        {/* Folder tabs */}
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setActiveTab("all")}
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
              onClick={() => setActiveTab(folder.id.toString())}
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

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-4 py-16 text-center">
          <h2 className="text-xl font-bold">
            {search ? "No channels found" : "No channels yet"}
          </h2>
          <p className="mt-2 text-secondary">
            {search
              ? "Try a different search term"
              : "Join channels on Telegram to see them here"}
          </p>
        </div>
      ) : (
        <div>
          {filtered.map((channel) => (
            <Link
              key={channel.id}
              href={`/channels/${channel.id}`}
              className="flex items-center gap-3 border-b border-border px-4 py-4 transition-colors hover:bg-hover"
            >
              <ChannelAvatar
                channelId={channel.id}
                title={channel.title}
                size={48}
              />
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-bold">{channel.title}</div>
                <div className="text-[13px] text-secondary">
                  {channel.username
                    ? `@${channel.username}`
                    : "Private channel"}
                  {channel.participantsCount > 0 && (
                    <span>
                      {" "}
                      · {channel.participantsCount.toLocaleString()} subscribers
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
