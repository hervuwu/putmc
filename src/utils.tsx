import type { Variants } from "framer-motion";

export const renderStars = (rating: number = 5) => {
  const safeRating = Math.max(0, Math.min(5, Math.floor(Number(rating) || 0)));
  return (
    <span style={{ color: "#ffd700", letterSpacing: "2px", fontSize: "1.1rem" }}>
      {"★".repeat(safeRating)}{"☆".repeat(5 - safeRating)}
    </span>
  );
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } }
};

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  hover: { scale: 1.05, y: -10, transition: { duration: 0.3, ease: "easeOut" } }
};