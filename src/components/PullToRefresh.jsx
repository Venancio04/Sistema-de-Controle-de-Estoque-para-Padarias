import { useState, useRef, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PullToRefresh({ onRefresh, children }) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(null);
  const threshold = 70;

  const handleTouchStart = useCallback((e) => {
    if (window.scrollY === 0) startY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (startY.current === null) return;
    const dist = Math.max(0, e.touches[0].clientY - startY.current);
    if (dist > 0 && window.scrollY === 0) {
      setPulling(true);
      setPullDistance(Math.min(dist * 0.5, threshold + 20));
    }
  }, [threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold) {
      setRefreshing(true);
      setPullDistance(threshold);
      await onRefresh();
      setRefreshing(false);
    }
    setPulling(false);
    setPullDistance(0);
    startY.current = null;
  }, [pullDistance, threshold, onRefresh]);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{ height: (pulling || refreshing) ? pullDistance : 0 }}
      >
        <RefreshCw
          className={cn("w-5 h-5 text-amber-600", refreshing && "animate-spin")}
          style={{ transform: `rotate(${(pullDistance / threshold) * 360}deg)` }}
        />
      </div>
      {children}
    </div>
  );
}