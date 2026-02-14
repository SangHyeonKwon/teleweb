"use client";

import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import { SerializedMessage, SerializedEntity } from "@/lib/telegram/types";
import PostMedia from "./PostMedia";
import ChannelAvatar from "@/components/ui/ChannelAvatar";

function RichText({
  text,
  entities,
}: {
  text: string;
  entities: SerializedEntity[];
}) {
  if (!entities.length) {
    return <>{text}</>;
  }

  const sorted = [...entities].sort((a, b) => a.offset - b.offset);
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  for (let i = 0; i < sorted.length; i++) {
    const entity = sorted[i];
    // Text before this entity
    if (entity.offset > lastIndex) {
      parts.push(text.slice(lastIndex, entity.offset));
    }

    const entityText = text.slice(entity.offset, entity.offset + entity.length);

    switch (entity.type) {
      case "MessageEntityBold":
        parts.push(<strong key={i}>{entityText}</strong>);
        break;
      case "MessageEntityItalic":
        parts.push(<em key={i}>{entityText}</em>);
        break;
      case "MessageEntityCode":
        parts.push(
          <code
            key={i}
            className="rounded bg-surface px-1.5 py-0.5 text-sm"
          >
            {entityText}
          </code>
        );
        break;
      case "MessageEntityPre":
        parts.push(
          <pre
            key={i}
            className="my-2 overflow-x-auto rounded-lg bg-surface p-3 text-sm"
          >
            <code>{entityText}</code>
          </pre>
        );
        break;
      case "MessageEntityUrl":
        parts.push(
          <a
            key={i}
            href={entityText}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {entityText}
          </a>
        );
        break;
      case "MessageEntityTextUrl":
        parts.push(
          <a
            key={i}
            href={entity.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {entityText}
          </a>
        );
        break;
      case "MessageEntityMention":
        parts.push(
          <span key={i} className="text-primary">
            {entityText}
          </span>
        );
        break;
      case "MessageEntityHashtag":
        parts.push(
          <span key={i} className="text-primary">
            {entityText}
          </span>
        );
        break;
      default:
        parts.push(entityText);
    }

    lastIndex = entity.offset + entity.length;
  }

  // Remaining text after last entity
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export default function PostCard({ message }: { message: SerializedMessage }) {
  const timeAgo = formatDistanceToNowStrict(new Date(message.date * 1000), {
    addSuffix: false,
  });

  return (
    <article className="border-b border-border px-4 py-3 transition-colors hover:bg-hover">
      <div className="flex gap-3">
        {/* Channel avatar */}
        <Link
          href={`/channels/${message.channelId}`}
          className="shrink-0"
        >
          <ChannelAvatar
            channelId={message.channelId}
            title={message.channelTitle}
            size={40}
          />
        </Link>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="flex items-center gap-1">
            <Link
              href={`/channels/${message.channelId}`}
              className="truncate text-[15px] font-bold hover:underline"
            >
              {message.channelTitle}
            </Link>
            {message.channelUsername && (
              <span className="text-[15px] text-secondary">
                @{message.channelUsername}
              </span>
            )}
            <span className="text-secondary">·</span>
            <time className="shrink-0 text-[15px] text-secondary">
              {timeAgo}
            </time>
          </div>

          {/* Message text */}
          {message.text && (
            <div className="mt-0.5 whitespace-pre-wrap text-[15px] leading-5">
              <RichText text={message.text} entities={message.entities} />
            </div>
          )}

          {/* Media */}
          {message.hasMedia && message.mediaId && (
            <div className="mt-3">
              <PostMedia mediaId={message.mediaId} type={message.mediaType} />
            </div>
          )}

          {/* Engagement bar */}
          <div className="mt-3 flex max-w-[425px] justify-between text-[13px] text-secondary">
            {message.replies !== null && (
              <div className="flex items-center gap-1.5">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="currentColor"
                >
                  <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01z" />
                </svg>
                <span>{formatCount(message.replies)}</span>
              </div>
            )}

            {message.forwards !== null && (
              <div className="flex items-center gap-1.5">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="currentColor"
                >
                  <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" />
                </svg>
                <span>{formatCount(message.forwards)}</span>
              </div>
            )}

            {message.views !== null && (
              <div className="flex items-center gap-1.5">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="currentColor"
                >
                  <path d="M8.75 21V3h2v18h-2zM18.75 21V8.5h2V21h-2zM13.75 21v-9h2v9h-2zM3.75 21v-4h2v4h-2z" />
                </svg>
                <span>{formatCount(message.views)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
