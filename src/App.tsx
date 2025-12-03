"use client";

// import { Toaster } from "@/components/ui/toaster"; // Removed import
// import { Toaster as Sonner } from "@/components/ui/sonner"; // Removed import
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ClientLogin from "./pages/ClientLogin"; // New login page
import WrappedDashboard from "./pages/WrappedDashboard"; // New wrapped dashboard
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* <Toaster /> */} {/* Removed Toaster component */}
      {/* <Sonner /> */} {/* Removed Sonner component */}
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}> {/* Added future flags */}
        <Routes>
          <Route path="/" element={<ClientLogin />} /> {/* New root route */}
          <Route path="/wrapped/:customerId" element={<WrappedDashboard />} /> {/* New wrapped route */}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;