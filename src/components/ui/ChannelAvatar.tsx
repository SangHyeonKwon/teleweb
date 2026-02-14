"use client";

import { useState } from "react";

export default function ChannelAvatar({
  channelId,
  title,
  size = 40,
}: {
  channelId: string;
  title: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);

  const sizeClass =
    size <= 40
      ? "h-10 w-10 text-sm"
      : size <= 48
        ? "h-12 w-12 text-base"
        : "h-16 w-16 text-2xl";

  if (failed) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-full bg-primary/20 font-bold text-primary ${sizeClass}`}
      >
        {title.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={`/api/channels/${channelId}/photo`}
      alt={title}
      className={`shrink-0 rounded-full object-cover ${sizeClass}`}
      onError={() => setFailed(true)}
    />
  );
}
