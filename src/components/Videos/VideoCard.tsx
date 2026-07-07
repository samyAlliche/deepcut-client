import Video from "@/types/video";
import clsx from "clsx";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

interface VideoCardProps {
  video: Video;
  className?: string;
  index?: number;
  discColor?: string;
}

export default function VideoCard({
  video,
  className,
  index = 0,
  discColor,
}: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <motion.a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(
        "group relative overflow-hidden rounded-lg bg-card shadow-md",
        className
      )}
      initial={{ opacity: 0, y: 26, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.07,
        type: "spring",
        stiffness: 240,
        damping: 22,
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{
        scale: 1.03,
        y: -4,
        transition: {
          duration: 0.2,
          ease: "easeOut",
        },
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative w-full aspect-square">
        <Image
          src={imgFailed ? "/placeholder.jpg" : video.thumbnail?.url || "/placeholder.jpg"}
          alt={`Thumbnail for ${video.title}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => setImgFailed(true)}
        />

        {/* vinyl reveal: the picked record spins up, then fades into the thumbnail */}
        {discColor && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-card"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: index * 0.07 + 0.55, duration: 0.35 }}
          >
            <motion.div
              className="rounded-full"
              style={{
                width: "62%",
                height: "62%",
                background: `radial-gradient(circle, ${discColor} 0% 31%, #171717 32% 100%)`,
              }}
              initial={{ rotate: 0, scale: 0.7 }}
              animate={{ rotate: 360, scale: 1.1 }}
              transition={{ delay: index * 0.07, duration: 0.7, ease: "easeOut" }}
            />
          </motion.div>
        )}

        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 p-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{
              y: 0,
              opacity: 1,
              transition: {
                duration: 0.25,
                ease: "easeOut",
              },
            }}
            exit={{
              y: 10,
              opacity: 0,
              transition: {
                duration: 0.2,
                ease: "easeIn",
              },
            }}
          >
            <motion.h3
              className="font-medium text-white line-clamp-2 text-sm drop-shadow-lg"
              title={video.title}
              initial={{ y: 10, opacity: 0 }}
              animate={{
                y: 0,
                opacity: 1,
                transition: {
                  delay: 0.1,
                  duration: 0.2,
                },
              }}
            >
              {video.title}
            </motion.h3>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.a>
  );
}
