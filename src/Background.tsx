import { useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Background() {
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, y => y * -0.2);

  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => {
      const isOrange = Math.random() > 0.5;
      const color = isOrange ? "#c45e3e" : "#7f54f8";
      return {
        id: i,
        left: `${Math.random() * 100}vw`,
        size: `${Math.random() * 6 + 3}px`,
        duration: `${Math.random() * 15 + 10}s`,
        delay: `-${Math.random() * 25}s`,
        color
      };
    });
  }, []);

  return (
    <>
      <div className="bg-logo-container">
        <img src="/putmc.svg" alt="PUTMC Logo Background" onError={(e) => { e.currentTarget.src = "/favicon.svg"; }} />
      </div>
      <div className="bg-orbs-container">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <motion.div style={{ y: parallaxY, position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
          {particles.map((p) => (
            <div key={p.id} className="particle" style={{ 
              left: p.left, 
              width: p.size, 
              height: p.size, 
              backgroundColor: p.color, 
              boxShadow: `0 0 10px ${p.color}, 0 0 20px ${p.color}`,
              animationName: "floatUp", animationDuration: p.duration, animationTimingFunction: "linear", animationDelay: p.delay, animationIterationCount: "infinite"
            }}></div>
          ))}
        </motion.div>
      </div>
    </>
  );
}