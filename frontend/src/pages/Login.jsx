import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { login } from "../api";

export default function Login({ onAuth, goSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password);
      onAuth(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
  className="min-h-screen flex items-center justify-center px-6 py-16"
  style={{
    background: "radial-gradient(circle at 50% 0%, #281f0e 0%, #100d0b 38%)",
    backgroundAttachment: "fixed",
    backgroundSize: "100vw 100vh",
  }}
>
      <div className="w-full max-w-[400px]">
        {/* Logo lockup */}
        <div className="flex items-center gap-3.5 mb-10 justify-center">
          <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
            <div
              className="absolute inset-0 rounded-xl opacity-50 blur-md"
              style={{ background: "radial-gradient(circle, #f0a868 0%, transparent 70%)" }}
            />
            <div className="relative w-10 h-10 rounded-xl border-2 border-accent bg-panel flex items-center justify-center">
              <span className="text-accent font-semibold text-base font-mono">&gt;_</span>
            </div>
          </div>
          <div>
            <div className="font-display font-bold text-[19px] leading-tight text-text tracking-tight">
              CodeReview
            </div>
            <div className="text-[13px] leading-tight text-muted mt-0.5">
              AI-powered code reviews, instantly
            </div>
          </div>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-panel border border-border rounded-2xl px-8 py-9 shadow-2xl shadow-black/50"
        >
          <div className="mb-7">
            <h2 className="font-display font-bold text-[22px] leading-tight text-text tracking-tight mb-1.5">
              Welcome back
            </h2>
            <p className="text-[14px] text-muted">Sign in to continue reviewing your code</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-muted mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[17px] h-[17px] text-slate-500"
                  strokeWidth={2}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-panel-2 border border-border rounded-lg pl-10 pr-3.5 py-3 text-[14px] text-text placeholder-slate-500 focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/15 transition-all"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                  Password
                </label>
                <button type="button" className="text-[13px] font-medium text-accent hover:text-amber-300">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[17px] h-[17px] text-slate-500"
                  strokeWidth={2}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-panel-2 border border-border rounded-lg pl-10 pr-11 py-3 text-[14px] text-text placeholder-slate-500 focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/15 transition-all"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-[17px] h-[17px]" />
                  ) : (
                    <Eye className="w-[17px] h-[17px]" />
                  )}
                </button>
              </div>
            </div>

            {error && <p className="text-danger text-[13px]">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-bg font-semibold text-[14px] rounded-lg py-3.5 mt-2 hover:opacity-90 active:opacity-80 transition-opacity shadow-lg shadow-accent/20 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <p className="text-center text-[14px] text-muted mt-6">
          Don't have an account?{" "}
          <button onClick={goSignup} className="text-accent hover:text-amber-300 font-medium">
            Create one
          </button>
        </p>
      </div>
    </div>
  );
}