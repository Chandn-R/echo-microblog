import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./index.css";
import App from "./App.tsx";
// import { useAuthStore } from "./stores/authStore.ts";
import { ErrorBoundary } from "./lib/ErrorBoundary.tsx";

// useAuthStore.getState().initializeAuth();

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <BrowserRouter>
                <ErrorBoundary>
                    <App />
                </ErrorBoundary>
            </BrowserRouter>
        </ThemeProvider>
    </StrictMode>
);
