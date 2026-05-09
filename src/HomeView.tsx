import { Suspense, useEffect } from "react";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { PresentationControls, Html } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from 'three';
import { Model as PutmcTrap } from "./Putmc";
import type { CommentData } from "./types";
import { renderStars, staggerContainer, cardVariants } from "./utils";

interface HomeViewProps {
  comments: CommentData[];
  isLoading: boolean;
  modelScale: number;
  newComment: string;
  setNewComment: (v: string) => void;
  newUsername: string;
  setNewUsername: (v: string) => void;
  newRating: number;
  setNewRating: (v: number) => void;
  isSubmitting: boolean;
  handleCommentSubmit: () => void;
  setShowCommentsPage: (v: boolean) => void;
}

export default function HomeView({
  comments, isLoading, modelScale, newComment, setNewComment, newUsername,
  setNewUsername, newRating, setNewRating, isSubmitting, handleCommentSubmit, setShowCommentsPage
}: HomeViewProps) {

  useEffect(() => {
    const observerOptions = { root: null, rootMargin: "0px", threshold: 0.15 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const timeoutId = setTimeout(() => {
      const elements = document.querySelectorAll(".reveal-on-scroll");
      elements.forEach((el) => observer.observe(el));
    }, 500);

    return () => { clearTimeout(timeoutId); observer.disconnect(); };
  }, []);

  return (
    <>
      {/* HERO SECTION */}
      <section id="home" className="hero-section">
        <motion.div className="hero-content" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}>
          <h1>Integrated<br /><span>Solar Trap</span></h1>
          <p>The next generation of sustainable, industrial-grade mosquito control powered by centralized solar intelligence and UV technology.</p>
        </motion.div>
        <motion.div className="hero-canvas-container" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}>
          <Canvas 
            camera={{ position: [-3, 5, 9], fov: 45 }}
            gl={{ alpha: true, antialias: true, toneMapping: THREE.NoToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
            onCreated={({ gl }) => { gl.setClearColor(0x000000, 0); }}
          >
            <fog attach="fog" args={['#100f13', 8, 16]} />
            <ambientLight intensity={0.5} color="#5d3eaf" /> 
            <directionalLight position={[10, 10, 5]} intensity={2} color="#ffd5c0" />
            <directionalLight position={[-10, -10, -5]} intensity={1.5} color="#7f54f8" />
            <PresentationControls global rotation={[0, -Math.PI / 4, 0]} polar={[-0.2, 0.2]} azimuth={[-Math.PI / 2, Math.PI / 2]}>
              <Suspense fallback={<Html center><div style={{ color: "var(--color-orange)", fontFamily: "League Gothic", fontSize: "2rem", letterSpacing: "2px" }}>LOADING ASSETS...</div></Html>}>
                <PutmcTrap scale={10 * modelScale} position={[0, -1.5, 0]} />
              </Suspense>
            </PresentationControls>
            <EffectComposer><Bloom luminanceThreshold={4} luminanceSmoothing={0.5} mipmapBlur intensity={1.2} /></EffectComposer>
          </Canvas>
        </motion.div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about">
        <h2 className="section-title reveal-on-scroll">About The Project</h2>
        <motion.p className="about-intro" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={{ visible: { transition: { staggerChildren: 0.02 } }, hidden: {} }}>
          {"The Portable UV Trap for Mosquito Control (PUTMC) is a sustainable, chemical-free solution for vector management. By combining solar energy with UV attractants, we offer communities a safer way to combat mosquito-borne diseases.".split(" ").map((word, index) => (
            <motion.span key={index} variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } }} style={{ display: "inline-block", marginRight: "0.25em" }}>
              {word}
            </motion.span>
          ))}
        </motion.p>
        <div className="about-grid glass-panel reveal-on-scroll">
          <div><h3 style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ fontSize: "1.5rem" }}>🌱</span> Purpose & Origin</h3><p>Designed for off-grid and industrial use, PUTMC harnesses solar power to deliver efficient, emission-free mosquito control without relying on traditional power grids.</p></div>
          <div><h3 style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ fontSize: "1.5rem" }}>⚙️</span> Mechanism & Performance</h3><p>A Vivid Purple UV LED array attracts mosquitoes, while a powerful 12V DC fan captures them. Built-in Schottky diodes ensure safe and efficient battery charging.</p></div>
          <div><h3 style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ fontSize: "1.5rem" }}>🔋</span> Power Autonomy</h3><p>Powered by an integrated solar panel for daily use, with a seamless USB-C fast-charging fallback to ensure uninterrupted operation during overcast weather.</p></div>
          <div><h3 style={{ display: "flex", alignItems: "center", gap: "10px" }}><span style={{ fontSize: "1.5rem" }}>🌍</span> Environmental Impact</h3><p>A zero-residue alternative to chemical fogs. Its targeted UV wavelength and quiet operation minimize disruption to local ecosystems and beneficial insects.</p></div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features">
        <h2 className="section-title reveal-on-scroll">Product Features</h2>
        <motion.div className="features-grid" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}>
          <motion.div className="feature-card glass-panel" variants={cardVariants} whileHover={{ scale: 1.05, y: -10, transition: { duration: 0.3, ease: "easeOut" } }}>
            <div className="feature-icon">⚡</div><h3>Dual-Input Charging</h3><p>Seamlessly switch between the primary Solar Panel and an emergency USB-C port to ensure continuous operation.</p>
          </motion.div>
          <motion.div className="feature-card glass-panel" variants={cardVariants} whileHover={{ scale: 1.05, y: -10, transition: { duration: 0.3, ease: "easeOut" } }}>
            <div className="feature-icon">🔦</div><h3>UV Attractant</h3><p>Emits a specific wavelength of light highly attractive to local mosquito populations, drawing them toward the trap housing.</p>
          </motion.div>
          <motion.div className="feature-card glass-panel" variants={cardVariants} whileHover={{ scale: 1.05, y: -10, transition: { duration: 0.3, ease: "easeOut" } }}>
            <div className="feature-icon">🌀</div><h3>Vortex Capture Fan</h3><p>A powerful, energy-efficient 12V DC fan creates a downward vacuum, preventing escape and dehydrating the catch.</p>
          </motion.div>
          <motion.div className="feature-card glass-panel" variants={cardVariants} whileHover={{ scale: 1.05, y: -10, transition: { duration: 0.3, ease: "easeOut" } }}>
            <div className="feature-icon">🌿</div><h3>Eco-Friendly Design</h3><p>Provides a sustainable, zero-residue solution that targets mosquitoes without harming beneficial insects or local ecosystems.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* GALLERY SECTION */}
      <section id="gallery">
        <h2 className="section-title reveal-on-scroll">Gallery</h2>
        <div className="gallery-grid reveal-on-scroll">
          <div className="gallery-item glass-panel">Actual Photo 1 (Placeholder)</div>
          <div className="gallery-item glass-panel">3D Render View (Placeholder)</div>
          <div className="gallery-item glass-panel">Internal Components (Placeholder)</div>
          <div className="gallery-item glass-panel">Field Deployment (Placeholder)</div>
        </div>
      </section>

      {/* TEAM SECTION */}
      <section id="team">
        <h2 className="section-title reveal-on-scroll">Research Team</h2>
        <motion.div className="team-grid" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}>
          <motion.div className="team-card glass-panel" variants={cardVariants} whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}>
            <motion.div className="team-photo" animate={{ y: [-5, 5, -5], boxShadow: ["0px 0px 10px rgba(196, 94, 62, 0.2)", "0px 10px 25px rgba(196, 94, 62, 0.7)", "0px 0px 10px rgba(196, 94, 62, 0.2)"] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} whileHover={{ rotate: 10, scale: 1.05 }}></motion.div>
            <h3>Jose Marie L. Bacalso</h3><p>Phone: 09462382092</p><p>Email: bacalsojose821@gmail.com</p>
          </motion.div>
          <motion.div className="team-card glass-panel" variants={cardVariants} whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}>
            <motion.div className="team-photo" animate={{ y: [-5, 5, -5], boxShadow: ["0px 0px 10px rgba(196, 94, 62, 0.2)", "0px 10px 25px rgba(196, 94, 62, 0.7)", "0px 0px 10px rgba(196, 94, 62, 0.2)"] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }} whileHover={{ rotate: -10, scale: 1.05 }}></motion.div>
            <h3>Trese Ray Bustamante</h3><p>Phone: 09455835666</p><p>Email: treseraybb@gmail.com</p>
          </motion.div>
          <motion.div className="team-card glass-panel" variants={cardVariants} whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}>
            <motion.div className="team-photo" animate={{ y: [-5, 5, -5], boxShadow: ["0px 0px 10px rgba(196, 94, 62, 0.2)", "0px 10px 25px rgba(196, 94, 62, 0.7)", "0px 0px 10px rgba(196, 94, 62, 0.2)"] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }} whileHover={{ rotate: 10, scale: 1.05 }}></motion.div>
            <h3>Faith Andrea Egas</h3><p>Phone: 09537799212</p><p>Email: faithandreaegas24@gmail.com</p>
          </motion.div>
          <motion.div className="team-card glass-panel" variants={cardVariants} whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}>
            <motion.div className="team-photo" animate={{ y: [-5, 5, -5], boxShadow: ["0px 0px 10px rgba(196, 94, 62, 0.2)", "0px 10px 25px rgba(196, 94, 62, 0.7)", "0px 0px 10px rgba(196, 94, 62, 0.2)"] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }} whileHover={{ rotate: -10, scale: 1.05 }}></motion.div>
            <h3>Marx Carl Hife</h3><p>Phone: 09478543822</p><p>Email: marxcarla5@gmail.com</p>
          </motion.div>
          <motion.div className="team-card glass-panel" variants={cardVariants} whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}>
            <motion.div className="team-photo" animate={{ y: [-5, 5, -5], boxShadow: ["0px 0px 10px rgba(196, 94, 62, 0.2)", "0px 10px 25px rgba(196, 94, 62, 0.7)", "0px 0px 10px rgba(196, 94, 62, 0.2)"] }} transition={{ duration: 3.1, repeat: Infinity, ease: "easeInOut" }} whileHover={{ rotate: 10, scale: 1.05 }}></motion.div>
            <h3>Dave Lawas</h3><p>Phone: 09702231654</p><p>Email: dave.lawas1234@gmail.com</p>
          </motion.div>
          <motion.div className="team-card glass-panel" variants={cardVariants} whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}>
            <motion.div className="team-photo" animate={{ y: [-5, 5, -5], boxShadow: ["0px 0px 10px rgba(196, 94, 62, 0.2)", "0px 10px 25px rgba(196, 94, 62, 0.7)", "0px 0px 10px rgba(196, 94, 62, 0.2)"] }} transition={{ duration: 2.9, repeat: Infinity, ease: "easeInOut" }} whileHover={{ rotate: -10, scale: 1.05 }}></motion.div>
            <h3>Jhon Hervy Yu</h3><p>Phone: 09924744150</p><p>Email: yujhervy@gmail.com</p>
          </motion.div>
        </motion.div>
      </section>

      {/* FEEDBACK SECTION */}
      <section id="comments">
        <h2 className="section-title reveal-on-scroll">Feedback & Recommendations</h2>
        <div className="comments-container glass-panel reveal-on-scroll">
          <p style={{ marginBottom: "1rem" }}>Leave your thoughts, deployment observations, or recommendations for future iterations below.</p>
          <input type="text" placeholder="Your Name (optional)" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} style={{ width: "100%", background: "rgba(0, 0, 0, 0.2)", border: "1px solid var(--glass-border)", color: "var(--color-white)", fontFamily: "'Montserrat', sans-serif", marginBottom: "1rem", padding: "1rem", borderRadius: "6px", transition: "border-color 0.3s, box-shadow 0.3s" }} />
          <div style={{ marginBottom: "1rem", textAlign: "left" }}>
            <span style={{ color: "#d1d1d1", marginRight: "1rem", fontFamily: "Montserrat" }}>Rating:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} onClick={() => setNewRating(star)} style={{ cursor: "pointer", color: star <= newRating ? "#ffd700" : "#555", fontSize: "1.5rem", marginRight: "4px", transition: "color 0.2s" }}>★</span>
            ))}
          </div>
          <textarea rows={5} placeholder="Type your thoughts or recommendations here..." value={newComment} onChange={(e) => setNewComment(e.target.value)}></textarea>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button onClick={handleCommentSubmit} disabled={isSubmitting} style={{ opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? "not-allowed" : "pointer" }}>{isSubmitting ? "Submitting..." : "Submit Comment"}</button>
            <button onClick={() => setShowCommentsPage(true)} style={{ background: "transparent", border: "2px solid var(--color-orange)", color: "var(--color-orange)", boxShadow: "none" }}>View All Comments</button>
          </div>

          {isLoading ? (
             <p style={{ textAlign: "center", color: "#ccc", marginTop: "2.5rem" }}>Loading comments...</p>
          ) : comments.length > 0 && (
            <div style={{ marginTop: "2.5rem", textAlign: "left" }}>
              <h3 style={{ color: "var(--color-orange)", marginBottom: "1rem", fontFamily: "League Gothic", fontSize: "1.8rem", letterSpacing: "1px" }}>Recent Comments ({comments.length})</h3>
              {comments.slice(-3).reverse().map((comment) => (
                <div key={comment.id} style={{ background: "rgba(0,0,0,0.2)", padding: "1.5rem", borderRadius: "8px", marginBottom: "1rem", border: "1px solid var(--glass-border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <div><strong style={{ color: "var(--color-orange)", fontFamily: "Montserrat" }}>{comment.username}</strong><span style={{ color: "#888", fontSize: "0.85rem", marginLeft: "10px" }}>{comment.timestamp}</span><span style={{ marginLeft: "10px" }}>{renderStars(comment.rating)}</span></div>
                  </div>
                  <p style={{ color: "#d1d1d1" }}>{comment.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}