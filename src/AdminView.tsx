import type { CommentData } from "./types";
import { renderStars } from "./utils";

interface AdminViewProps {
  comments: CommentData[];
  isLoading: boolean;
  handleDeleteComment: (id: string) => void;
}

export default function AdminView({ comments, isLoading, handleDeleteComment }: AdminViewProps) {
  return (
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
  );
}