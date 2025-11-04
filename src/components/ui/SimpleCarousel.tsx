import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Box, IconButton, SxProps } from "@mui/material";
import { ReactNode, useEffect, useRef, useState, KeyboardEvent } from "react";

interface Props {
  children: ReactNode[] | ReactNode;
  sx?: SxProps;
  autoplay?: boolean;
  interval?: number;
}

export default function SimpleCarousel({ children, sx, autoplay = false, interval = 4000 }: Props) {
  const childArray = Array.isArray(children) ? children : [children];
  const [index, setIndex] = useState(0);
  const count = childArray.length;
  const timer = useRef<number | null>(null);
  const raf = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointerStartX = useRef<number | null>(null);
  const pointerDeltaX = useRef<number>(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!autoplay) return undefined;
    if (isPaused) return undefined;
    timer.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, interval);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
      if (raf.current) window.cancelAnimationFrame(raf.current);
    };
  }, [autoplay, interval, count]);

  function prev() {
    setIndex((i) => (i - 1 + count) % count);
  }

  function next() {
    setIndex((i) => (i + 1) % count);
  }

  function onPointerDown(e: React.PointerEvent) {
    pointerStartX.current = e.clientX;
    pointerDeltaX.current = 0;
    (e.target as Element).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (pointerStartX.current == null) return;
    pointerDeltaX.current = e.clientX - pointerStartX.current;
    if (containerRef.current) {
      if (raf.current) {
        return;
      }
      raf.current = window.requestAnimationFrame(() => {
        const inner = containerRef.current?.firstElementChild as HTMLElement | null;
        if (inner)
          inner.style.transform = `translateX(calc(-${index * 100}% + ${pointerDeltaX.current}px))`;
        raf.current = null;
      });
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    if (pointerStartX.current == null) return;
    const delta = pointerDeltaX.current;
    pointerStartX.current = null;
    pointerDeltaX.current = 0;
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch {}
    if (raf.current) {
      window.cancelAnimationFrame(raf.current);
      raf.current = null;
    }
    const threshold = 50;
    if (delta > threshold) {
      prev();
    } else if (delta < -threshold) {
      next();
    } else {
      if (containerRef.current) {
        const inner = containerRef.current.firstElementChild as HTMLElement | null;
        if (inner) inner.style.transform = `translateX(-${index * 100}%)`;
      }
    }
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  }

  return (
    <Box
      onBlur={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onKeyDown={onKey}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onPointerCancel={onPointerUp}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      ref={containerRef}
      tabIndex={0}
      sx={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        outline: "none",
        ...((sx as object) || {}),
      }}
    >
      <Box
        sx={{
          display: "flex",
          transition: "transform 400ms ease",
          transform: `translateX(-${index * 100}%)`,
          width: `${count * 100}%`,
        }}
      >
        {childArray.map((child, i) => (
          <Box key={i} sx={{ width: `${100 / count}%`, flex: "0 0 auto", p: 1 }}>
            {child}
          </Box>
        ))}
      </Box>

      {count > 1 && (
        <>
          <IconButton
            aria-label="previous"
            size="small"
            sx={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.7)",
            }}
            onClick={prev}
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            aria-label="next"
            size="small"
            sx={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.7)",
            }}
            onClick={next}
          >
            <ChevronRightIcon />
          </IconButton>
          <Box
            sx={{
              bottom: 8,
              display: "flex",
              gap: 1,
              left: "50%",
              position: "absolute",
              transform: "translateX(-50%)",
            }}
          >
            {childArray.map((_, i) => (
              <Box
                aria-label={`Go to slide ${i + 1}`}
                component="button"
                key={i}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  p: 0,
                  border: "none",
                  background: i === index ? "primary.main" : "rgba(0,0,0,0.3)",
                  cursor: "pointer",
                }}
                onClick={() => setIndex(i)}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}
