import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PendingApproval from "./pages/PendingApproval";
import AccessDenied from "./pages/AccessDenied";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import Clients from "./pages/Clients";
import Employees from "./pages/Employees";
import Quotations from "./pages/Quotations";
import Invoices from "./pages/Invoices";
import Payments from "./pages/Payments";
import Users from "./pages/Users";
import Accounts from "./pages/Accounts";
import PersonalAccounts from "./pages/PersonalAccounts";
import Vendors from "./pages/Vendors";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/pending-approval" element={<PendingApproval />} />
            <Route path="/access-denied" element={<AccessDenied />} />
            <Route path="/" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute><AppLayout><Events /></AppLayout></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute><AppLayout><Clients /></AppLayout></ProtectedRoute>} />
            <Route path="/employees" element={<ProtectedRoute><AppLayout><Employees /></AppLayout></ProtectedRoute>} />
            <Route path="/quotations" element={<ProtectedRoute><AppLayout><Quotations /></AppLayout></ProtectedRoute>} />
            <Route path="/invoices" element={<ProtectedRoute><AppLayout><Invoices /></AppLayout></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><AppLayout><Payments /></AppLayout></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute requiredPermission="canManageUsers"><AppLayout><Users /></AppLayout></ProtectedRoute>} />
            <Route path="/accounts" element={<ProtectedRoute><AppLayout><Accounts /></AppLayout></ProtectedRoute>} />
            <Route path="/personal-accounts" element={<ProtectedRoute><AppLayout><PersonalAccounts /></AppLayout></ProtectedRoute>} />
            <Route path="/vendors" element={<ProtectedRoute requiredPermission="canViewVendors"><AppLayout><Vendors /></AppLayout></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
