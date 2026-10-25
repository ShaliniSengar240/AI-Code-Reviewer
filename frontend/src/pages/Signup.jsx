import { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { signup } from "../api";

export default function Signup({ onAuth, goLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      const data = await signup(name, email, password);
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
  style={{ background: "radial-gradient(circle at 50% 0%, #2e2410 0%, #100d0b 42%)" }}
>
      <div className="w-full max-w-[400px]">
        {/* Logo lockup */}
        <div className="flex items-center gap-3.5 mb-10 justify-center">
          <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
            <div
              className="absolute inset-0 rounded-xl opacity-50 blur-md"
              style={{ background: "radial-gradient(circle, #ffc933 0%, transparent 70%)" }}
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
              Create your account
            </h2>
            <p className="text-[14px] text-muted">Start getting AI-powered feedback on your code</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-muted mb-2">
                Full name
              </label>
              <div className="relative">
                <User
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[17px] h-[17px] text-slate-500"
                  strokeWidth={2}
                />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-panel-2 border border-border rounded-lg pl-10 pr-3.5 py-3 text-[14px] text-text placeholder-slate-500 focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/15 transition-all"
                  placeholder="Priya Sharma"
                  required
                />
              </div>
            </div>

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
              <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-muted mb-2">
                Password
              </label>
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
                  placeholder="Create a password"
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

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-muted mb-2">
                Confirm password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[17px] h-[17px] text-slate-500"
                  strokeWidth={2}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-panel-2 border border-border rounded-lg pl-10 pr-3.5 py-3 text-[14px] text-text placeholder-slate-500 focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/15 transition-all"
                  placeholder="Re-enter your password"
                  required
                />
              </div>
            </div>

            {error && <p className="text-danger text-[13px]">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-bg font-semibold text-[14px] rounded-lg py-3.5 mt-2 hover:opacity-90 active:opacity-80 transition-opacity shadow-lg shadow-accent/20 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>

        <p className="text-center text-[14px] text-muted mt-6">
          Already have an account?{" "}
          <button onClick={goLogin} className="text-accent hover:text-amber-300 font-medium">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}