import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-6">
        <h1 className="text-7xl font-extrabold text-primary mb-4">404</h1>
        <p className="text-2xl font-semibold text-foreground mb-2">Page not found</p>
        <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          Go to Homepage
        </a>
      </div>
    </div>
  );
};

export default NotFound;
