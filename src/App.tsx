import { Suspense, useEffect, useState, FormEvent, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { PresentationControls, Html } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Model as PutmcTrap } from "./Putmc";
import "./App.css";
import * as THREE from 'three';
import { motion, AnimatePresence, type Variants, useScroll, useTransform } from "framer-motion";

// Define the structure of our new comment objects
interface CommentData {
  id: string;
  username: string;
  text: string;
  timestamp: string;
  rating?: number;
}

// Helper function to display stars globally
const renderStars = (rating = 5) => {
  const safeRating = Math.max(0, Math.min(5, Math.floor(Number(rating) || 0)));
  return (
    <span style={{ color: "#ffd700", letterSpacing: "2px", fontSize: "1.1rem" }}>
      {"★".repeat(safeRating)}{"☆".repeat(5 - safeRating)}
    </span>
  );
};

export default function App() {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newComment, setNewComment] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [showCommentsPage, setShowCommentsPage] = useState(false);
  const [showAdminPage, setShowAdminPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [modelScale, setModelScale] = useState(
    window.innerWidth <= 768 ? 1.5 : window.innerWidth <= 1024 ? 80 : 1.2
  );

  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, y => y * -0.2);

  const BIN_ID = import.meta.env.VITE_JSONBIN_BIN_ID;
  const API_KEY = import.meta.env.VITE_JSONBIN_API_KEY;
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

  // Toggle this to false when you want to re-enable JSONbin API requests
  const DISABLE_API = true;

  // Generate random particles once on load
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => {
      const isOrange = Math.random() > 0.5;
      const color = isOrange ? "#c45e3e" : "#7f54f8"; // matches your brand colors
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

  // Fetch comments from JSONbin on load
  useEffect(() => {
    const fetchComments = async () => {
      try {
        if (DISABLE_API) throw new Error('API_DISABLED');
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
          headers: {
            'X-Master-Key': API_KEY,
            'X-Bin-Meta': 'false'
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        if (Array.isArray(data)) {
           // Ensure all comments have an ID to prevent deletion bugs on older comments
           const validatedData = data.map((c: any, i: number) => ({
             ...c,
             id: c.id || `fallback-id-${i}-${Date.now()}`
           }));
           setComments(validatedData);
        }
      } catch (error: any) {
        if (error.message !== 'API_DISABLED') {
          console.error("Error fetching comments:", error);
        }
        // Fallback to local storage if API fails just in case
        const saved = localStorage.getItem("putmc_comments");
        if (saved) {
          try { 
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              const validatedData = parsed.map((c: any, i: number) => ({
                ...c,
                id: c.id || `fallback-id-${i}-${Date.now()}`
              }));
              setComments(validatedData); 
            }
          } catch {}
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [BIN_ID, API_KEY]);


  const handleCommentSubmit = async () => {
    if (newComment.trim() === "") {
      alert("Please enter a comment before submitting.");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    const newEntry: CommentData = {
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      username: newUsername.trim() || "Anonymous",
      text: newComment.trim(),
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }),
      rating: newRating
    };
    
    const updatedComments = [...comments, newEntry];
    
    // Optimistically update UI
    setComments(updatedComments);
    setNewComment(""); 
    setNewUsername(""); 
    setNewRating(5);

    try {
      if (!DISABLE_API) {
        // Save to JSONbin
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': API_KEY
          },
          body: JSON.stringify(updatedComments)
        });
  
        if (!response.ok) throw new Error('Failed to save to JSONbin');
      }
      
      // Also save a local backup
      localStorage.setItem("putmc_comments", JSON.stringify(updatedComments));
    } catch (error) {
      console.error("Error saving comment:", error);
      alert("There was an error saving your comment to the server. It has been saved locally.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (idToDelete: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    
    const updatedComments = comments.filter(c => c.id !== idToDelete);
    setComments(updatedComments); // optimistic
    
    try {
      if (!DISABLE_API) {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': API_KEY
          },
          body: JSON.stringify(updatedComments)
        });
        if (!response.ok) throw new Error('Failed to update JSONbin');
      }
      localStorage.setItem("putmc_comments", JSON.stringify(updatedComments));
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("There was an error deleting the comment. Changes may not be saved.");
    }
  };

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.15, // Triggers when 15% of the element is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target); // Unobserve to animate only once
        }
      });
    }, observerOptions);

    // A short timeout ensures the page transition exit animation finishes before finding DOM elements
    const timeoutId = setTimeout(() => {
      const elements = document.querySelectorAll(".reveal-on-scroll");
      elements.forEach((el) => observer.observe(el));
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect(); // Cleanup on unmount
    };
  }, [showAdminPage, showCommentsPage]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Listen for window resize to dynamically scale 3D models
  useEffect(() => {
    const handleResize = () => {
      setModelScale(window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 80 : 1.2 );
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAdminAccess = () => {
    setShowPasswordModal(true);
    setAdminPasswordInput("");
    setPasswordError("");
  };

  const handlePasswordSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (adminPasswordInput === ADMIN_PASSWORD) { 
      setShowAdminPage(true);
      setShowPasswordModal(false);
      setAdminPasswordInput("");
    } else {
      setPasswordError("Incorrect password!");
    }
  };

  const pageVariants: Variants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 }
  };

  const staggerContainer: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <>
      {/* BACKGROUND LOGO (Persistent) */}
      <div className="bg-logo-container">
        <img 
          src="/putmc.svg" 
          alt="PUTMC Logo Background" 
          onError={(e) => { e.currentTarget.src = "/favicon.svg"; }}
        />
      </div>

      {/* ANIMATED BACKGROUND ORBS (Persistent) */}
      <div className="bg-orbs-container">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <motion.div style={{ y: parallaxY, position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
          {particles.map((p) => (
            <div 
              key={p.id} 
              className="particle" 
              style={{ 
                left: p.left, 
                width: p.size, 
                height: p.size, 
                backgroundColor: p.color, 
                boxShadow: `0 0 10px ${p.color}, 0 0 20px ${p.color}`,
                animationName: "floatUp",
                animationDuration: p.duration,
                animationTimingFunction: "linear",
                animationDelay: p.delay,
                animationIterationCount: "infinite"
              }} 
            ></div>
          ))}
        </motion.div>
      </div>

      <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
        {showAdminPage ? (
          <motion.div key="admin" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4, ease: "easeOut" }}>
        <header className="header">
          <a href="#" onClick={(e) => { e.preventDefault(); setShowAdminPage(false); }} className="nav-logo">
            <img src="/putmc.svg" alt="PUTMC Logo" style={{ width: "40px", height: "40px" }} />
            PUTMC ADMIN
          </a>
          <nav className="nav-links">
            <a href="#" onClick={(e) => { e.preventDefault(); setShowAdminPage(false); }}>&larr; Back to Main Site</a>
          </nav>
        </header>
        <section style={{ paddingTop: "120px", minHeight: "100vh" }}>
          <h2 className="section-title">Manage Comments</h2>
          <div className="comments-container glass-panel">
            {isLoading ? (
               <p style={{ textAlign: "center", color: "#ccc" }}>Loading comments...</p>
            ) : comments.length === 0 ? (
              <p style={{ textAlign: "center", color: "#ccc" }}>No comments to manage.</p>
            ) : (
              [...comments].reverse().map((comment) => (
                <div key={comment.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "8px", marginBottom: "1rem", border: "1px solid var(--glass-border)" }}>
                  <div style={{ flex: 1, paddingRight: "1rem", textAlign: "left" }}>
                    <strong style={{ color: "var(--color-orange)", fontFamily: "Montserrat" }}>{comment.username}</strong>
                    <span style={{ color: "#888", fontSize: "0.85rem", marginLeft: "12px" }}>{comment.timestamp}</span>
                    <span style={{ marginLeft: "12px" }}>{renderStars(comment.rating)}</span>
                    <p style={{ color: "#d1d1d1", marginTop: "0.5rem" }}>{comment.text}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteComment(comment.id)} 
                    style={{ background: "#d9381e", padding: "0.5rem 1rem", border: "none", borderRadius: "4px", color: "white", cursor: "pointer", fontWeight: "bold" }}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
          </motion.div>
        ) : showCommentsPage ? (
          <motion.div key="comments" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4, ease: "easeOut" }}>
        <header className="header">
          <a href="#" onClick={(e) => { e.preventDefault(); setShowCommentsPage(false); }} className="nav-logo">
            <img src="/putmc.svg" alt="PUTMC Logo" style={{ width: "40px", height: "40px" }} />
            PUTMC
          </a>
          <nav className="nav-links">
            <a href="#" onClick={(e) => { e.preventDefault(); setShowCommentsPage(false); }}>&larr; Back to Main Site</a>
          </nav>
        </header>
        <section style={{ paddingTop: "120px", minHeight: "100vh" }}>
          <h2 className="section-title">Community Feedback</h2>
          <div className="comments-container glass-panel">
            {isLoading ? (
               <p style={{ textAlign: "center", color: "#ccc" }}>Loading comments...</p>
            ) : comments.length === 0 ? (
              <p style={{ textAlign: "center", color: "#ccc" }}>No comments have been submitted yet.</p>
            ) : (
              [...comments].reverse().map((comment) => (
                <div key={comment.id} style={{ background: "rgba(0,0,0,0.2)", padding: "1.5rem", borderRadius: "8px", marginBottom: "1.5rem", border: "1px solid var(--glass-border)", textAlign: "left" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.8rem" }}>
                    <div>
                      <strong style={{ color: "var(--color-orange)", fontSize: "1.1rem", fontFamily: "Montserrat" }}>{comment.username}</strong>
                      <span style={{ color: "#888", fontSize: "0.85rem", marginLeft: "12px" }}>{comment.timestamp}</span>
                      <span style={{ marginLeft: "12px" }}>{renderStars(comment.rating)}</span>
                    </div>
                  </div>
                  <p style={{ color: "#d1d1d1", fontSize: "1.1rem" }}>{comment.text}</p>
                </div>
              ))
            )}
          </div>
        </section>
          </motion.div>
        ) : (
          <motion.div key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4, ease: "easeOut" }}>
      {/* HEADER */}
      <header className="header">
        <a href="#home" className="nav-logo">
          <img src="/putmc.svg" alt="PUTMC Logo" style={{ width: "40px", height: "40px" }} />
          PUTMC
        </a>
        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#features">Features</a>
          <a href="#gallery">Gallery</a>
          <a href="#team">Team</a>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section id="home" className="hero-section">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <h1>
            Integrated
            <br />
            <span>Solar Trap</span>
          </h1>
          <p>
            The next generation of sustainable, industrial-grade mosquito
            control powered by centralized solar intelligence and UV technology.
          </p>
        </motion.div>

       <motion.div 
         className="hero-canvas-container"
         initial={{ opacity: 0, scale: 0.85 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
       >
  <Canvas 
    camera={{ position: [-3, 5, 9], fov: 45 }}
    // Force transparency and disable automatic color shifting
    gl={{ 
      alpha: true, 
      antialias: true,
      toneMapping: THREE.NoToneMapping,
      outputColorSpace: THREE.SRGBColorSpace 
    }}
    onCreated={({ gl }) => {
      gl.setClearColor(0x000000, 0); // Sets background alpha to 0
    }}
  >
      {/* FOG: Blends the 3D model into the dark background */}
      <fog attach="fog" args={['#100f13', 8, 16]} />

      {/* Tinted lights to blend with the purple/dark background */}
      <ambientLight intensity={0.5} color="#5d3eaf" /> 
    <directionalLight
      position={[10, 10, 5]}
        intensity={2}
        color="#ffd5c0"
    />
      {/* Fill light to add purple hues to the shadows */}
      <directionalLight position={[-10, -10, -5]} intensity={1.5} color="#7f54f8" />

    <PresentationControls
      global
      rotation={[0, -Math.PI / 4, 0]}
      polar={[-0.2, 0.2]}
      azimuth={[-Math.PI / 2, Math.PI / 2]}
    >
      <Suspense
        fallback={
          <Html center>
            <div
              style={{
                color: "var(--color-orange)",
                fontFamily: "League Gothic",
                fontSize: "2rem",
                letterSpacing: "2px",
              }}
            >
              LOADING ASSETS...
            </div>
          </Html>
        }
      >
        <PutmcTrap scale={10 * modelScale} position={[0, -1.5, 0]} />
      </Suspense>
    </PresentationControls>

    {/* --- POST PROCESSING START --- */}
    <EffectComposer>
      <Bloom
        luminanceThreshold={4}
        luminanceSmoothing={0.5}
        mipmapBlur
        intensity={1.2}
      />
    </EffectComposer>
    {/* --- POST PROCESSING END --- */}
  </Canvas>
       </motion.div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about">
        <h2 className="section-title reveal-on-scroll">About The Project</h2>
        <motion.p 
          className="about-intro"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.02 } },
            hidden: {}
          }}
        >
          {"The Portable UV Trap for Mosquito Control (PUTMC) is a sustainable, chemical-free solution for vector management. By combining solar energy with UV attractants, we offer communities a safer way to combat mosquito-borne diseases.".split(" ").map((word, index) => (
            <motion.span
              key={index}
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
              }}
              style={{ display: "inline-block", marginRight: "0.25em" }}
            >
              {word}
            </motion.span>
          ))}
        </motion.p>
        <div className="about-grid glass-panel reveal-on-scroll">
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.5rem" }}>🌱</span> Purpose & Origin
            </h3>
            <p>
              Designed for off-grid and industrial use, PUTMC harnesses solar power to deliver efficient, emission-free mosquito control without relying on traditional power grids.
            </p>
          </div>
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.5rem" }}>⚙️</span> Mechanism & Performance
            </h3>
            <p>
              A Vivid Purple UV LED array attracts mosquitoes, while a powerful 12V DC fan captures them. Built-in Schottky diodes ensure safe and efficient battery charging.
            </p>
          </div>
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.5rem" }}>🔋</span> Power Autonomy
            </h3>
            <p>
              Powered by an integrated solar panel for daily use, with a seamless USB-C fast-charging fallback to ensure uninterrupted operation during overcast weather.
            </p>
          </div>
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.5rem" }}>🌍</span> Environmental Impact
            </h3>
            <p>
              A zero-residue alternative to chemical fogs. Its targeted UV wavelength and quiet operation minimize disruption to local ecosystems and beneficial insects.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features">
        <h2 className="section-title reveal-on-scroll">Product Features</h2>
        <motion.div 
          className="features-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          <motion.div className="feature-card glass-panel" variants={cardVariants} whileHover={{ scale: 1.05, y: -10, transition: { duration: 0.3, ease: "easeOut" } }}>
            <div className="feature-icon">⚡</div>
            <h3>Dual-Input Charging</h3>
            <p>
              Seamlessly switch between the primary Solar Panel and an emergency
              USB-C port to ensure continuous operation.
            </p>
          </motion.div>
          <motion.div className="feature-card glass-panel" variants={cardVariants} whileHover={{ scale: 1.05, y: -10, transition: { duration: 0.3, ease: "easeOut" } }}>
            <div className="feature-icon">🔦</div>
            <h3>UV Attractant</h3>
            <p>
              Emits a specific wavelength of light highly attractive to local
              mosquito populations, drawing them toward the trap housing.
            </p>
          </motion.div>
          <motion.div className="feature-card glass-panel" variants={cardVariants} whileHover={{ scale: 1.05, y: -10, transition: { duration: 0.3, ease: "easeOut" } }}>
            <div className="feature-icon">🌀</div>
            <h3>Vortex Capture Fan</h3>
            <p>
              A powerful, energy-efficient 12V DC fan creates a downward vacuum,
              preventing escape and dehydrating the catch.
            </p>
          </motion.div>
          <motion.div className="feature-card glass-panel" variants={cardVariants} whileHover={{ scale: 1.05, y: -10, transition: { duration: 0.3, ease: "easeOut" } }}>
            <div className="feature-icon">🌿</div>
            <h3>Eco-Friendly Design</h3>
            <p>
              Provides a sustainable, zero-residue solution that targets mosquitoes without harming beneficial insects or local ecosystems.
            </p>
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

      {/* RESEARCH INFORMATION */}
      <section id="team">
        <h2 className="section-title reveal-on-scroll">Research Team</h2>
        <motion.div 
          className="team-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          <motion.div className="team-card glass-panel" variants={cardVariants} whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}>
            <div className="team-photo"></div>
            <h3>Jose Marie L. Bacalso</h3>
            <p>Phone: 09462382092</p>
            <p>Email: bacalsojose821@gmail.com</p>
          </motion.div>
          <motion.div className="team-card glass-panel" variants={cardVariants} whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}>
            <div className="team-photo"></div>
            <h3>Trese Ray Bustamante</h3>
            <p>Phone: 09455835666</p>
            <p>Email: treseraybb@gmail.com</p>
          </motion.div>
          <motion.div className="team-card glass-panel" variants={cardVariants} whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}>
            <div className="team-photo"></div>
            <h3>Faith Andrea Egas</h3>
            <p>Phone: 09537799212</p>
            <p>Email: faithandreaegas24@gmail.com</p>
          </motion.div>
          <motion.div className="team-card glass-panel" variants={cardVariants} whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}>
            <div className="team-photo"></div>
            <h3>Marx Carl Hife</h3>
            <p>Phone: 09478543822</p>
            <p>Email: marxcarla5@gmail.com</p>
          </motion.div>
          <motion.div className="team-card glass-panel" variants={cardVariants} whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}>
            <div className="team-photo"></div>
            <h3>Dave Lawas</h3>
            <p>Phone: 09702231654</p>
            <p>Email: dave.lawas1234@gmail.com</p>
          </motion.div>
          <motion.div className="team-card glass-panel" variants={cardVariants} whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}>
            <div className="team-photo"></div>
            <h3>Jhon Hervy Yu</h3>
            <p>Phone: 09924744150</p>
            <p>Email: yujhervy@gmail.com</p>
          </motion.div>
        </motion.div>
      </section>

      {/* COMMENTS & RECOMMENDATION */}
      <section id="comments">
        <h2 className="section-title reveal-on-scroll">Feedback & Recommendations</h2>
        <div className="comments-container glass-panel reveal-on-scroll">
          <p style={{ marginBottom: "1rem" }}>
            Leave your thoughts, deployment observations, or recommendations for
            future iterations below.
          </p>
          <input
            type="text"
            placeholder="Your Name (optional)"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            style={{ width: "100%", background: "rgba(0, 0, 0, 0.2)", border: "1px solid var(--glass-border)", color: "var(--color-white)", fontFamily: "'Montserrat', sans-serif", marginBottom: "1rem", padding: "1rem", borderRadius: "6px", transition: "border-color 0.3s, box-shadow 0.3s" }}
          />
          <div style={{ marginBottom: "1rem", textAlign: "left" }}>
            <span style={{ color: "#d1d1d1", marginRight: "1rem", fontFamily: "Montserrat" }}>Rating:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <span 
                key={star}
                onClick={() => setNewRating(star)}
                style={{ 
                  cursor: "pointer", 
                  color: star <= newRating ? "#ffd700" : "#555",
                  fontSize: "1.5rem",
                  marginRight: "4px",
                  transition: "color 0.2s"
                }}
              >
                ★
              </span>
            ))}
          </div>
          <textarea
            rows={5}
            placeholder="Type your thoughts or recommendations here..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          ></textarea>
          
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button 
              onClick={handleCommentSubmit}
              disabled={isSubmitting}
              style={{ opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? "not-allowed" : "pointer" }}
            >
              {isSubmitting ? "Submitting..." : "Submit Comment"}
            </button>
            <button 
              onClick={() => setShowCommentsPage(true)} 
              style={{ background: "transparent", border: "2px solid var(--color-orange)", color: "var(--color-orange)", boxShadow: "none" }}
            >
              View All Comments
            </button>
          </div>

          {isLoading ? (
             <p style={{ textAlign: "center", color: "#ccc", marginTop: "2.5rem" }}>Loading comments...</p>
          ) : comments.length > 0 && (
            <div style={{ marginTop: "2.5rem", textAlign: "left" }}>
              <h3 style={{ color: "var(--color-orange)", marginBottom: "1rem", fontFamily: "League Gothic", fontSize: "1.8rem", letterSpacing: "1px" }}>
                Recent Comments ({comments.length})
              </h3>
              {/* Only show the 3 most recent comments on the home page view */}
              {comments.slice(-3).reverse().map((comment) => (
                <div key={comment.id} style={{ background: "rgba(0,0,0,0.2)", padding: "1.5rem", borderRadius: "8px", marginBottom: "1rem", border: "1px solid var(--glass-border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <div>
                      <strong style={{ color: "var(--color-orange)", fontFamily: "Montserrat" }}>{comment.username}</strong>
                      <span style={{ color: "#888", fontSize: "0.85rem", marginLeft: "10px" }}>{comment.timestamp}</span>
                      <span style={{ marginLeft: "10px" }}>{renderStars(comment.rating)}</span>
                    </div>
                  </div>
                  <p style={{ color: "#d1d1d1" }}>{comment.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER (Persistent) */}
      <footer className="footer">
        <h3>
          Cebu Technological University - Main Campus
        </h3>
        <p>
          © {new Date().getFullYear()} PUTMC Research Team. All rights reserved.
        </p>
        <div style={{ marginTop: "1rem" }}>
          <button 
            onClick={handleAdminAccess} 
            style={{ background: "transparent", border: "none", color: "#666", cursor: "pointer", fontSize: "0.85rem", textDecoration: "underline" }}
          >
            Admin Portal
          </button>
        </div>
      </footer>

      {/* ADMIN PASSWORD MODAL */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div 
            key="admin-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0, 0, 0, 0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="glass-panel" 
              style={{ padding: "2rem", borderRadius: "8px", width: "90%", maxWidth: "400px", textAlign: "center", border: "1px solid var(--color-orange)", background: "rgba(10, 10, 15, 0.95)" }}
            >
            <h3 style={{ color: "var(--color-orange)", marginBottom: "1.5rem", fontFamily: "Montserrat" }}>Admin Access</h3>
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                placeholder="Enter Password"
                autoFocus
                style={{ width: "100%", boxSizing: "border-box", background: "rgba(0, 0, 0, 0.4)", border: "1px solid var(--glass-border)", color: "var(--color-white)", padding: "0.8rem", borderRadius: "4px", marginBottom: "1rem", fontFamily: "Montserrat" }}
              />
              {passwordError && <p style={{ color: "#d9381e", fontSize: "0.9rem", marginBottom: "1rem" }}>{passwordError}</p>}
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem" }}>
                <button type="submit" style={{ padding: "0.6rem 1.2rem" }}>Submit</button>
                <button type="button" onClick={() => setShowPasswordModal(false)} style={{ background: "transparent", border: "1px solid #888", color: "#ccc", padding: "0.6rem 1.2rem", boxShadow: "none" }}>Cancel</button>
              </div>
            </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SCROLL TO TOP BUTTON */}
      <AnimatePresence>
        {showScrollToTop && (
          <motion.button
            key="scroll-to-top"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            style={{
              position: "fixed",
              bottom: "30px",
              right: "30px",
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              background: "var(--color-orange)",
              color: "white",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              zIndex: 1000,
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            ↑
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
