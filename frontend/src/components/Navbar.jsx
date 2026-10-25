import { LayoutDashboard, FilePlus2, History, LogOut } from "lucide-react";

const links = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "newReview", label: "New Review", icon: FilePlus2 },
  { id: "history", label: "History", icon: History },
];

export default function Navbar({ view, setView, user, onLogout }) {
  return (
    <nav className="border-b border-border bg-panel">
      <div className="max-w-[1600px] mx-auto px-8 h-[72px] flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setView("dashboard")}
        >
          <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
            <div
              className="absolute inset-0 rounded-lg opacity-40 blur-md"
              style={{ background: "radial-gradient(circle, #ffc933 0%, transparent 70%)" }}
            />
            <div className="relative w-9 h-9 rounded-lg border-2 border-accent bg-panel-2 flex items-center justify-center">
              <span className="text-accent font-semibold text-[15px] font-mono">&gt;_</span>
            </div>
          </div>
          <span className="font-display font-bold text-[19px] text-text">CodeReview</span>
        </div>

        {/* Tabs: bigger text, active one is bold and accent colored */}
        <div className="flex items-center gap-2">
          {links.map((l) => {
            const Icon = l.icon;
            const active = view === l.id;
            return (
              <button
                key={l.id}
                onClick={() => setView(l.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-[16px] transition-colors ${
                  active
                    ? "bg-panel-2 text-accent font-bold"
                    : "text-muted font-medium hover:text-text hover:bg-panel-2/60"
                }`}
              >
                <Icon className="w-[18px] h-[18px]" strokeWidth={active ? 2.5 : 2} />
                {l.label}
              </button>
            );
          })}
        </div>

        {/* User */}
        <div className="flex items-center gap-5">
          <span className="text-[15px] font-medium text-text hidden sm:inline">{user?.name}</span>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-[15px] font-medium text-muted hover:text-danger transition-colors"
          >
            <LogOut className="w-[17px] h-[17px]" strokeWidth={2} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}