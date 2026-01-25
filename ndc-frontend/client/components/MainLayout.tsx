import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/context/AuthContext";

interface MainLayoutProps {
  children: ReactNode;
}

// Helper function to format role display
function formatRole(role: string): string {
  const roleMap: Record<string, string> = {
    'user': 'User',
    'admin': 'Admin',
    'super_admin': 'Super Admin',
    'superadmin': 'Super Admin',
    'moderator': 'Moderator',
    'editor': 'Editor',
  };
  return roleMap[role.toLowerCase()] || role.charAt(0).toUpperCase() + role.slice(1);
}

// Helper function to get user initials for avatar
function getUserInitials(fullName: string): string {
  const names = fullName.trim().split(' ');
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }
  return fullName.substring(0, 2).toUpperCase();
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b border-border px-8 flex items-center justify-between">
          <input
            type="text"
            placeholder="Search..."
            className="w-64 px-4 py-2 bg-background text-foreground text-sm rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-semibold text-sm">
                  {getUserInitials(user.fullName)}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground">{formatRole(user.role)}</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400" />
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">Guest</p>
                  <p className="text-xs text-muted-foreground">Not signed in</p>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
