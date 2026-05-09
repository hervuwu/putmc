interface HeaderProps {
  view: 'home' | 'comments' | 'admin';
  onBack: () => void;
}

export default function Header({ view, onBack }: HeaderProps) {
  return (
    <header className="header">
      <a href="#home" onClick={(e) => { if(view !== 'home') { e.preventDefault(); onBack(); } }} className="nav-logo">
        <img src="/putmc.svg" alt="PUTMC Logo" style={{ width: "40px", height: "40px" }} />
        {view === 'admin' ? 'PUTMC ADMIN' : 'PUTMC'}
      </a>
      <nav className="nav-links">
        {view === 'home' ? (
          <>
            <a href="#home">Home</a><a href="#about">About</a><a href="#features">Features</a><a href="#gallery">Gallery</a><a href="#team">Team</a>
          </>
        ) : (
          <a href="#home" onClick={(e) => { e.preventDefault(); onBack(); }}>&larr; Back to Main Site</a>
        )}
      </nav>
    </header>
  );
}