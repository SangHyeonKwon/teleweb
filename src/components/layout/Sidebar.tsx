"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    label: "Home",
    href: "/feed",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[26px] w-[26px]" fill="currentColor">
        <path d="M21.591 7.146L12.52 1.157c-.316-.21-.724-.21-1.04 0l-9.071 5.99c-.26.173-.409.456-.409.757v13.183c0 .502.418.913.929.913h6.638c.511 0 .929-.41.929-.913v-7.075h3.008v7.075c0 .502.418.913.929.913h6.638c.511 0 .929-.41.929-.913V7.904c0-.301-.158-.584-.408-.758z" />
      </svg>
    ),
  },
  {
    label: "Channels",
    href: "/channels",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[26px] w-[26px]" fill="currentColor">
        <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/settings",
    icon: (
      <svg viewBox="0 0 24 24" className="h-[26px] w-[26px]" fill="currentColor">
        <path d="M10.54 1.75h2.92l1.57 2.36c.11.17.32.25.53.21l2.53-.59 2.17 2.17-.58 2.54c-.05.2.04.41.21.53l2.36 1.57v2.92l-2.36 1.57c-.17.12-.26.33-.21.53l.58 2.54-2.17 2.17-2.53-.59c-.21-.04-.42.04-.53.21l-1.57 2.36h-2.92l-1.58-2.36c-.11-.17-.32-.25-.52-.21l-2.54.59-2.17-2.17.58-2.54c.05-.2-.03-.41-.21-.53L1.75 13.46v-2.92l2.36-1.57c.18-.12.26-.33.21-.53l-.58-2.54 2.17-2.17 2.54.59c.2.04.41-.04.52-.21l1.58-2.36zm1.46 2l-1.4 2.11c-.5.74-1.36 1.11-2.24.95l-2.26-.53-.96.96.53 2.26c.16.88-.21 1.74-.95 2.24l-2.11 1.4v1.36l2.11 1.4c.74.5 1.11 1.36.95 2.24l-.53 2.26.96.96 2.26-.53c.88-.16 1.74.21 2.24.95l1.4 2.11h1.36l1.4-2.11c.5-.74 1.36-1.11 2.24-.95l2.26.53.96-.96-.53-2.26c-.16-.88.21-1.74.95-2.24l2.11-1.4v-1.36l-2.11-1.4c-.74-.5-1.11-1.36-.95-2.24l.53-2.26-.96-.96-2.26.53c-.88.16-1.74-.21-2.24-.95l-1.4-2.11h-1.36zM12 8.5c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5zM10.5 12c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col justify-between px-2 py-3">
      <div>
        <Link
          href="/feed"
          className="mb-2 flex h-[50px] w-[50px] items-center justify-center rounded-full transition-colors hover:bg-hover"
        >
          <span className="text-2xl font-bold text-primary">M</span>
        </Link>

        <nav className="mt-1 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-5 rounded-full px-3 py-3 text-xl transition-colors hover:bg-hover"
              >
                <span className="text-foreground">{item.icon}</span>
                <span
                  className={`hidden xl:inline ${isActive ? "font-bold" : ""}`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
