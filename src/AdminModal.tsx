import type { FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AdminModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  passwordInput: string;
  setPasswordInput: (v: string) => void;
  error: string;
}

export default function AdminModal({ show, onClose, onSubmit, passwordInput, setPasswordInput, error }: AdminModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          key="admin-modal"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0, 0, 0, 0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="glass-panel" 
            style={{ padding: "2rem", borderRadius: "8px", width: "90%", maxWidth: "400px", textAlign: "center", border: "1px solid var(--color-orange)", background: "rgba(10, 10, 15, 0.95)" }}
          >
            <h3 style={{ color: "var(--color-orange)", marginBottom: "1.5rem", fontFamily: "Montserrat" }}>Admin Access</h3>
            <form onSubmit={onSubmit}>
              <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Enter Password" autoFocus
                style={{ width: "100%", boxSizing: "border-box", background: "rgba(0, 0, 0, 0.4)", border: "1px solid var(--glass-border)", color: "var(--color-white)", padding: "0.8rem", borderRadius: "4px", marginBottom: "1rem", fontFamily: "Montserrat" }}
              />
              {error && <p style={{ color: "#d9381e", fontSize: "0.9rem", marginBottom: "1rem" }}>{error}</p>}
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem" }}>
                <button type="submit" style={{ padding: "0.6rem 1.2rem" }}>Submit</button>
                <button type="button" onClick={onClose} style={{ background: "transparent", border: "1px solid #888", color: "#ccc", padding: "0.6rem 1.2rem", boxShadow: "none" }}>Cancel</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}