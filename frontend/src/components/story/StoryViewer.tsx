import React, { useEffect, useRef, useState, useCallback } from "react";
import { Chapter } from "../../types/story.types";

interface Props {
  chapters: Chapter[];
  storyId: string;
}

const StoryViewer: React.FC<Props> = ({
  chapters,
  storyId,
}) => {
  const [progress, setProgress] = useState(0);
  const [copiedChapterId, setCopiedChapterId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCopyChapter = useCallback(async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedChapterId(id);
      setTimeout(() => setCopiedChapterId(null), 2000);
    } catch {
      // clipboard unavailable
    }
  }, []);

  const storageKey = `story-progress-${storyId}`;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const savedProgress = localStorage.getItem(storageKey);

    if (savedProgress) {
      const progressValue = Number(savedProgress);

      setProgress(progressValue);

      setTimeout(() => {
        const maxScroll =
          container.scrollHeight - container.clientHeight;

        container.scrollTop =
          (progressValue / 100) * maxScroll;
      }, 100);
    }
  }, [storageKey]);

  useEffect(() => {
    const container = containerRef.current;
    
    if (!container) return;

    const handleScroll = () => {
      const maxScroll =
        container.scrollHeight - container.clientHeight;

      if (maxScroll <= 0) return;

      const currentProgress =
        (container.scrollTop / maxScroll) * 100;

      const rounded = Math.min(
        100,
        Math.max(0, Math.round(currentProgress))
      );

      setProgress(rounded);

      localStorage.setItem(
        storageKey,
        rounded.toString()
      );
    };

    container.addEventListener(
      "scroll",
      handleScroll
    );

    return () =>
      container.removeEventListener(
        "scroll",
        handleScroll
      );
  }, [storageKey]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-8 py-10 bg-zinc-950"
    >
      <div className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur-md rounded-lg p-4 mb-8">
        <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <div className="flex justify-between items-center mt-2">
  <span className="text-sm text-zinc-400">
    Reading Progress
  </span>

  <span className="text-sm font-medium text-indigo-400">
    {progress}%
  </span>
</div>
      </div>
      <div className="max-w-4xl mx-auto">
      {chapters.map((chapter) => (
        <div key={chapter.id} className="mb-16">
          <div className="flex items-start justify-between gap-4 mb-6">
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              {chapter.title}
            </h1>
            <button
              type="button"
              onClick={() => handleCopyChapter(chapter.id, chapter.content)}
              aria-label="Copy story to clipboard"
              className="shrink-0 mt-1 flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-95"
              title={copiedChapterId === chapter.id ? "Copied!" : "Copy chapter"}
            >
              {copiedChapterId === chapter.id ? (
                <>
                  <i className="fa-solid fa-check text-emerald-400"></i>
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <i className="fa-regular fa-clipboard"></i>
                  Copy
                </>
              )}
            </button>
          </div>

          <p className="text-lg text-zinc-300 whitespace-pre-line leading-9">
            {chapter.content}
          </p>
          <hr className="border-zinc-800 mt-10" />
        </div>
      ))}
      </div>
    </div>
  );
};

export default StoryViewer;