import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "#F5F3FF" }}>
      <div className="text-center">
        <div className="text-6xl mb-4 voice-mascot-bob">💜</div>
        <h1 className="mb-4 text-4xl font-extrabold" style={{ color: "#2D1B69" }}>404</h1>
        <p className="mb-4 text-xl" style={{ color: "#7C6FAA" }}>Oops! Lila can't find this page</p>
        <a href="/" className="font-bold underline hover:no-underline" style={{ color: "#A78BFA" }}>
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
