import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { MainLayout } from "@/components/MainLayout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <MainLayout>
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
          <p className="text-lg text-muted-foreground mb-6">Page not found</p>
          <p className="text-sm text-muted-foreground mb-6">
            The page you're looking for doesn't exist. Use the navigation menu to explore the dashboard.
          </p>
          <a href="/" className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
            Return to Home
          </a>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFound;
