import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Home, Grid, BarChart3, MapPin, Globe, LogOut, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { label: "Home", icon: Home, path: "/dashboard" },
    { label: "Thematic Areas", icon: Grid, path: "/thematic-areas" },
    { label: "Publications", icon: BookOpen, path: "/publications" },
    { label: "Indicators", icon: BarChart3, path: "/indicators" },
    { label: "Counties", icon: MapPin, path: "/counties-list" },
  ];

  return (
    <>
     {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-sidebar rounded-md text-sidebar-foreground"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-transform z-40",
          "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:transform-none md:translate-x-0 md-relative"
        )}
      >
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10  flex items-center justify-center flex-shrink-0">
            <img src="/ndc_logo.png" className="h-10 w-auto" alt="Logo" />
          </div>
          <div className="flex-1">
            <h1 className="text-sm font-semibold leading-tight">
              NDC tracking tool for water and waste management in Kenya
            </h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-border/30"
              )}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4 space-y-2">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-border/30 transition-colors"
        >
          <Globe size={20} />
          <span className="text-sm font-medium">Public Portal</span>
        </Link>
        {user && (
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-border/30 transition-colors text-left"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Log out</span>
          </button>
        )}
      </div>
    </div>
     {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
