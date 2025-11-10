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
  const count = childArray.length;

  const [index, setIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const dragStartX = useRef<number | null>(null);
  const timer = useRef<number | null>(null);

  // --- Autoplay ---
  useEffect(() => {
    if (!autoplay || isDragging) return;

    timer.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, interval);

    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [autoplay, interval, count, isDragging]);

  // --- Navigation ---
  const prev = () => setIndex((i) => (i - 1 + count) % count);
  const next = () => setIndex((i) => (i + 1) % count);

  // --- Drag Handlers ---
  const onPointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
    setIsDragging(true);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    setDragOffset(e.clientX - dragStartX.current);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;

    const delta = dragOffset;
    dragStartX.current = null;
    setDragOffset(0);
    setIsDragging(false);

    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch {}

    const threshold = 50;
    if (delta > threshold) prev();
    else if (delta < -threshold) next();
  };

  // --- Keyboard Navigation ---
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  };

  return (
    <Box
      tabIndex={0}
      onKeyDown={onKey}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onMouseEnter={() => setIsDragging(true)}
      onMouseLeave={() => setIsDragging(false)}
      sx={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        outline: "none",
        ...((sx as object) || {}),
      }}
    >
      {/* Slides */}
      <Box
        sx={{
          display: "flex",
          width: "100%",
          transform: `translateX(calc(${-index * 100}% + ${dragOffset}px))`,
          transition: isDragging ? "none" : "transform 400ms ease",
        }}
      >
        {childArray.map((child, i) => (
          <Box key={i} sx={{ flex: "0 0 100%", width: "100%", boxSizing: "border-box" }}>
            {child}
          </Box>
        ))}
      </Box>

      {/* Arrows */}
      {count > 1 && (
        <>
          <IconButton
            aria-label="previous"
            size="small"
            onClick={prev}
            sx={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.7)",
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            aria-label="next"
            size="small"
            onClick={next}
            sx={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.7)",
            }}
          >
            <ChevronRightIcon />
          </IconButton>

          {/* Dots */}
          <Box
            sx={{
              position: "absolute",
              bottom: 8,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 1,
            }}
          >
            {childArray.map((_, i) => (
              <Box
                key={i}
                component="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  border: "none",
                  background: i === index ? "primary.main" : "rgba(0,0,0,0.3)",
                  cursor: "pointer",
                  p: 0,
                }}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}
