import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Items from "./pages/Items";
import StockReceiving from "./pages/StockReceiving";
import StockIssuance from "./pages/StockIssuance";
import Custodians from "./pages/Custodians";
import StockCardNew from "./pages/StockCardNew";
import PhysicalCountNew from "./pages/PhysicalCountNew";
import DepartmentRequests from "./pages/DepartmentRequests";
import UserRoles from "./pages/UserRoles";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/items" element={<Items />} />
            <Route path="/receiving" element={<StockReceiving />} />
            <Route path="/issuance" element={<StockIssuance />} />
            <Route path="/custodians" element={<Custodians />} />
            <Route path="/stock-card" element={<StockCardNew />} />
            <Route path="/physical-count" element={<PhysicalCountNew />} />
            <Route path="/requests" element={<DepartmentRequests />} />
            <Route path="/users" element={<UserRoles />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
