import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProgress } from "@react-three/drei";

interface LoadingScreenProps {
  isApiLoading: boolean;
  onComplete?: () => void;
}

export default function LoadingScreen({ isApiLoading, onComplete }: LoadingScreenProps) {
  const { progress } = useProgress();
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Consider it loaded when the 3D model is 100% loaded AND API is done.
    // We also add a slight delay so the user can see the 100% "READY" state briefly
    let timeout: ReturnType<typeof setTimeout>;
    if (progress === 100 && !isApiLoading) {
      timeout = setTimeout(() => setShow(false), 1200);
    }
    
    return () => clearTimeout(timeout);
  }, [progress, isApiLoading]);

  // Make sure scrolling is disabled while the loading screen is active
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {show && (
        <motion.div
          key="global-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#0a0a0f",
            zIndex: 999999,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "var(--color-orange)"
          }}
        >
          <motion.img 
            src="/putmc.svg" 
            alt="PUTMC Logo" 
            animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: "120px", height: "120px", marginBottom: "30px" }} 
            onError={(e) => { e.currentTarget.src = "/favicon.svg"; }}
          />
          <h2 style={{ fontFamily: "League Gothic, sans-serif", fontSize: "3rem", letterSpacing: "4px", marginBottom: "20px", textTransform: "uppercase" }}>
            INITIALIZING
          </h2>
          <div style={{ width: "300px", height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", overflow: "hidden" }}>
            <motion.div 
              style={{ height: "100%", background: "var(--color-orange)" }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p style={{ marginTop: "20px", fontFamily: "Montserrat, sans-serif", fontSize: "0.9rem", letterSpacing: "2px", color: "#888", textTransform: "uppercase" }}>
            {progress < 100 
              ? `LOADING ASSETS ${progress.toFixed(0)}%` 
              : isApiLoading 
                ? "ZAPPING SERVER BUGS..." 
                : "SYSTEM READY"}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}