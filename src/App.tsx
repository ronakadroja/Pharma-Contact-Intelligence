import { BrowserRouter } from "react-router-dom";
import { Suspense } from "react";
import AppRoutes from "./routes/AppRoutes";
import Loader from "./components/ui/Loader";
import { AppProvider } from "./context/AppContext";
import { ToastProvider } from "./context/ToastContext";
import { LoadingProvider } from "./context/LoadingContext";
import ErrorBoundary from "./components/ErrorBoundary";

const App = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <ToastProvider>
          <LoadingProvider>
            <BrowserRouter>
              <Suspense fallback={<Loader variant="spinner" size="lg" fullScreen />}>
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
