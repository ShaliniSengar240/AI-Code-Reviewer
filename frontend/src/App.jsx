import { useState } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import NewReview from "./pages/NewReview";
import ReviewResults from "./pages/ReviewResults";
import Navbar from "./components/Navbar";
import { getReview } from "./api";

function App() {
  const [authMode, setAuthMode] = useState("login");
  const [user, setUser] = useState(null);
  const [view, setView] = useState("dashboard");
  const [currentReview, setCurrentReview] = useState(null);

  function handleAuth(data) {
    localStorage.setItem("token", data.token);
    setUser(data);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setUser(null);
    setAuthMode("login");
  }

  async function openReview(reviewId) {
    const review = await getReview(reviewId);
    setCurrentReview(review);
    setView("results");
  }

  function handleReviewResult(result) {
    setCurrentReview(result);
    setView("results");
  }

  if (!user) {
    return authMode === "login" ? (
      <Login onAuth={handleAuth} goSignup={() => setAuthMode("signup")} />
    ) : (
      <Signup onAuth={handleAuth} goLogin={() => setAuthMode("login")} />
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar view={view} setView={setView} user={user} onLogout={handleLogout} />

      {view === "dashboard" && (
        <Dashboard user={user} setView={setView} openReview={openReview} />
      )}
      {view === "newReview" && <NewReview />}
      {view === "history" && <History openReview={openReview} />}
      {view === "results" && <ReviewResults review={currentReview} setView={setView} />}
    </div>
  );
}

export default App;