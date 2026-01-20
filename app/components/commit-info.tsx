"use client";

import { useEffect, useState } from "react";

const DUMMY_SHA = "0000000";
const REPO = "pythonatsea/tempestas";

interface CommitTime {
  relative: string;
  exact: string;
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) {
    return `${diffYears} year${diffYears === 1 ? "" : "s"} ago`;
  } else if (diffMonths > 0) {
    return `${diffMonths} month${diffMonths === 1 ? "" : "s"} ago`;
  } else if (diffDays > 0) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  } else {
    return "just now";
  }
}

export default function CommitInfo() {
  const [commitTime, setCommitTime] = useState<CommitTime | null>(null);

  const commitSha = process.env.NEXT_PUBLIC_COMMIT_SHA || "";
  const shortSha = commitSha ? commitSha.slice(0, 7) : DUMMY_SHA;
  const isReal = !!commitSha;

  useEffect(() => {
    if (!commitSha) return;

    const controller = new AbortController();
    fetch(`https://api.github.com/repos/${REPO}/commits/${commitSha}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.commit?.author?.date) {
          const date = new Date(data.commit.author.date);
          setCommitTime({
            relative: getRelativeTime(date),
            exact: date.toLocaleString(undefined, { timeZoneName: "short" }),
          });
        }
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        console.error("Failed to fetch commit info:", err);
      });

    return () => controller.abort();
  }, [commitSha]);

  return (
    <span>
      Commit{" "}
      {isReal ? (
        <a
          href={`https://github.com/${REPO}/commit/${commitSha}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline font-mono"
        >
          {shortSha}
        </a>
      ) : (
        <span className="font-mono">{shortSha}</span>
      )}
      {commitTime && (
        <>
          {" from "}
          <span title={commitTime.exact} className="cursor-help">
            about {commitTime.relative}
          </span>
        </>
      )}
    </span>
  );
}
