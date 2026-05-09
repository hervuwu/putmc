import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import type { CommentData } from "./types";
import Background from "./Background";
import Header from "./Header";
import Footer from "./Footer";
import AdminModal from "./AdminModal";
import HomeView from "./HomeView";
import CommentsView from "./CommentsView";
import AdminView from "./AdminView";
import "./App.css";

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
    window.innerWidth <= 768 ? 1.5 : window.innerWidth <= 1024 ? 0.8 : 1.2
  );

  const BIN_ID = import.meta.env.VITE_JSONBIN_BIN_ID;
  const API_KEY = import.meta.env.VITE_JSONBIN_API_KEY;
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

  const DISABLE_API = false;

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
           const validatedData = data.map((c: Partial<CommentData>, i: number) => ({
             ...c,
             id: c.id || `fallback-id-${i}-${Date.now()}`
           })) as CommentData[];
           setComments(validatedData);
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.message !== 'API_DISABLED') {
          console.error("Error fetching comments:", error);
        }
        const saved = localStorage.getItem("putmc_comments");
        if (saved) {
          try { 
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              const validatedData = parsed.map((c: Partial<CommentData>, i: number) => ({
                ...c,
                id: c.id || `fallback-id-${i}-${Date.now()}`
              })) as CommentData[];
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
    
    setComments(updatedComments);
    setNewComment(""); 
    setNewUsername(""); 
    setNewRating(5);

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
  
        if (!response.ok) throw new Error('Failed to save to JSONbin');
      }
      
      localStorage.setItem("putmc_comments", JSON.stringify(updatedComments));
    } catch (error: unknown) {
      console.error("Error saving comment:", error);
      alert("There was an error saving your comment to the server. It has been saved locally.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (idToDelete: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    
    const updatedComments = comments.filter(c => c.id !== idToDelete);
    setComments(updatedComments); 
    
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
    } catch (error: unknown) {
      console.error("Error deleting comment:", error);
      alert("There was an error deleting the comment. Changes may not be saved.");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  return (
    <>
      <Background />

      <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
        {showAdminPage ? (
          <motion.div key="admin" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4, ease: "easeOut" }}>
            <Header view="admin" onBack={() => setShowAdminPage(false)} />
            <AdminView comments={comments} isLoading={isLoading} handleDeleteComment={handleDeleteComment} />
          </motion.div>
        ) : showCommentsPage ? (
          <motion.div key="comments" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4, ease: "easeOut" }}>
            <Header view="comments" onBack={() => setShowCommentsPage(false)} />
            <CommentsView comments={comments} isLoading={isLoading} />
          </motion.div>
        ) : (
          <motion.div key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.4, ease: "easeOut" }}>
            <Header view="home" onBack={() => {}} />
            <HomeView 
              comments={comments}
              isLoading={isLoading}
              modelScale={modelScale}
              newComment={newComment}
              setNewComment={setNewComment}
              newUsername={newUsername}
              setNewUsername={setNewUsername}
              newRating={newRating}
              setNewRating={setNewRating}
              isSubmitting={isSubmitting}
              handleCommentSubmit={handleCommentSubmit}
              setShowCommentsPage={setShowCommentsPage}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Footer handleAdminAccess={handleAdminAccess} />

      <AdminModal 
        show={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handlePasswordSubmit}
        passwordInput={adminPasswordInput}
        setPasswordInput={setAdminPasswordInput}
        error={passwordError}
      />

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
