import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const DataDashboard = lazy(() => import("./pages/DataDashboard"));
const BlogList = lazy(() => import("./pages/BlogList"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const BlogNew = lazy(() => import("./pages/BlogNew"));
const BlogEdit = lazy(() => import("./pages/BlogEdit"));
const BlogManage = lazy(() => import("./pages/BlogManage"));

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/dashboard"
              element={
                <Suspense fallback={<div className="min-h-screen bg-background" />}>
                  <DataDashboard />
                </Suspense>
              }
            />
            <Route path="/blog" element={<Suspense fallback={<div className="min-h-screen bg-background" />}><BlogList /></Suspense>} />
            <Route path="/blog/new" element={<Suspense fallback={<div className="min-h-screen bg-background" />}><BlogNew /></Suspense>} />
            <Route path="/blog/manage" element={<Suspense fallback={<div className="min-h-screen bg-background" />}><BlogManage /></Suspense>} />
            <Route path="/blog/edit/:slug" element={<Suspense fallback={<div className="min-h-screen bg-background" />}><BlogEdit /></Suspense>} />
            <Route path="/blog/:slug" element={<Suspense fallback={<div className="min-h-screen bg-background" />}><BlogPost /></Suspense>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
