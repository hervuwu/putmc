import type { CommentData } from "./types";
import { renderStars } from "./utils";

interface CommentsViewProps {
  comments: CommentData[];
  isLoading: boolean;
}

export default function CommentsView({ comments, isLoading }: CommentsViewProps) {
  return (
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
                <div><strong style={{ color: "var(--color-orange)", fontSize: "1.1rem", fontFamily: "Montserrat" }}>{comment.username}</strong><span style={{ color: "#888", fontSize: "0.85rem", marginLeft: "12px" }}>{comment.timestamp}</span><span style={{ marginLeft: "12px" }}>{renderStars(comment.rating)}</span></div>
              </div>
              <p style={{ color: "#d1d1d1", fontSize: "1.1rem" }}>{comment.text}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}