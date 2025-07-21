import { BrowserRouter } from "react-router-dom";
import { Suspense } from "react";
import AppRoutes from "./routes/AppRoutes";
import { AppProvider } from "./context/AppContext";
import { ToastProvider } from "./context/ToastContext";
import { LoadingProvider } from "./context/LoadingContext";
import ErrorBoundary from "./components/ErrorBoundary";

// Minimal loading fallback for initial app load only
const AppLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p className="text-neutral-600 font-medium">Loading application...</p>
    </div>
  </div>
);

const App = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <ToastProvider>
          <LoadingProvider>
            <BrowserRouter>
              <Suspense fallback={<AppLoader />}>
                <AppRoutes />
              </Suspense>
            </BrowserRouter>
          </LoadingProvider>
        </ToastProvider>
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;
