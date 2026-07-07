"use client";

import React, { useEffect, useRef, useState } from "react";
import CrateMachine from "@/components/Machine/CrateMachine";
import Video from "@/types/video";
import VideoGrid from "@/components/Videos/VideoGrid";
import ShuffleButton from "@/components/Machine/ShuffleButton";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import DisplayToggle from "@/components/Videos/DisplayToggle";
import BackButton from "@/components/BackButton";

interface HomePageClientProps {
  shuffleAction: (value: number) => Promise<Video[]>;
}

export default function HomePageClient({ shuffleAction }: HomePageClientProps) {
  const [counterValue, setCounterValue] = useState(3);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resultCount, setResultCount] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [discColors, setDiscColors] = useState<string[]>([]);
  const [isOneColumn, setIsOneColumn] = useState(true);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleShuffle = async () => {
    if (revealTimer.current) clearTimeout(revealTimer.current);
    setShowResults(false);
    setVideos([]);
    setResultCount(null);
    setIsLoading(true);
    try {
      const data = await shuffleAction(counterValue);
      setIsLoading(false);
      setVideos(data);
      setResultCount(data.length);
      // give the gantry time to lock and the sleeves time to pop
      revealTimer.current = setTimeout(() => setShowResults(true), 1100);
    } catch (error) {
      console.error("Shuffle failed:", error);
      toast.error("Try again", { description: "Shuffle failed" });
      setIsLoading(false);
      setResultCount(null);
    }
  };

  const handleBack = () => {
    if (revealTimer.current) clearTimeout(revealTimer.current);
    setShowResults(false);
    setVideos([]);
    setResultCount(null);
  };

  const hasResults = showResults && videos.length > 0;
  const isIdle = !isLoading && resultCount === null;

  // bring the results into view once the cards start landing
  useEffect(() => {
    if (!hasResults) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "start",
      });
    }, 300);
    return () => clearTimeout(t);
  }, [hasResults]);

  return (
    <div className="flex flex-col items-center w-full min-h-[600px] gap-6 sm:gap-8 mt-4 sm:mt-0">
      <AnimatePresence>{isIdle && <Subtitles key="subtitles" />}</AnimatePresence>

      {/* the machine stays on screen and compresses when results arrive */}
      <motion.div
        layout
        className="w-full"
        style={{ marginLeft: "auto", marginRight: "auto" }}
        initial={{ maxWidth: 500 }}
        animate={{ maxWidth: hasResults ? 340 : 500 }}
        transition={{ type: "spring", stiffness: 180, damping: 24 }}
      >
        <CrateMachine
          value={counterValue}
          onValueChange={setCounterValue}
          isShuffling={isLoading}
          resultCount={resultCount}
          onPicked={setDiscColors}
        />
      </motion.div>

      <motion.div layout className="flex gap-2">
        <ShuffleButton onClick={handleShuffle} isLoading={isLoading} />
        {hasResults && <BackButton onClick={handleBack} />}
      </motion.div>

      {hasResults && (
        <div className="sm:hidden w-full flex justify-end">
          <DisplayToggle
            isOneColumn={isOneColumn}
            setIsOneColumn={setIsOneColumn}
          />
        </div>
      )}

      <AnimatePresence mode="wait">
        {hasResults && (
          <motion.div
            key="results"
            ref={resultsRef}
            className="w-full max-w-4xl scroll-mt-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
          >
            <VideoGrid
              videos={videos}
              isOneColumn={isOneColumn}
              discColors={discColors}
            />
          </motion.div>
        )}
        {!isLoading && resultCount === 0 && (
          <motion.p
            key="no-results"
            className="mt-4 text-lg text-muted-foreground font-extrabold text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.3, duration: 0.4 } }}
            exit={{ opacity: 0 }}
          >
            No records found in the crate. Adjust the count and dig again!
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const Subtitles = () => {
  const springAnimation = {
    type: "spring" as const,
    stiffness: 150,
    damping: 20,
    mass: 3,
  };
  return (
    <motion.div
      className="flex flex-col gap-2 justify-center text-center font-black"
      exit={{ opacity: 0, y: -10, transition: { duration: 0.25 } }}
    >
      <motion.h2
        className="sm:text-xl md:text-2xl text-lg leading-tight"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springAnimation}
      >
        Discover random tracks from curated YouTube playlists
      </motion.h2>
      <motion.h3
        className="sm:text-lg md:text-xl text-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springAnimation, delay: 0.5 }}
      >
        Hit <span className="italic">Shuffle</span>, get inspired, sample, or
        just vibe
      </motion.h3>
    </motion.div>
  );
};
