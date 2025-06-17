
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { FirebaseAuthProvider } from "@/hooks/useFirebaseAuth";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Auth from "./pages/Auth";
import HowToBuy from "./pages/HowToBuy";
import Referral from "./pages/Referral";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProductsList from "./pages/admin/ProductsList";
import AddProduct from "./pages/admin/AddProduct";
import EditProduct from "./pages/admin/EditProduct";
import OrdersHistory from "./pages/admin/OrdersHistory";
import ImportExport from "./pages/admin/ImportExport";
import RecycleBin from "./pages/admin/RecycleBin";
import AdminLogs from "./pages/admin/AdminLogs";
import ReferralSettings from "./pages/admin/ReferralSettings";
import ReferralPanelPage from "./pages/admin/ReferralPanel";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FirebaseAuthProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/how-to-buy" element={<HowToBuy />} />
                <Route path="/referral" element={<Referral />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/products" element={<ProductsList />} />
                <Route path="/admin/products/add" element={<AddProduct />} />
                <Route path="/admin/products/edit/:id" element={<EditProduct />} />
                <Route path="/admin/orders" element={<OrdersHistory />} />
                <Route path="/admin/referral-settings" element={<ReferralSettings />} />
                <Route path="/admin/import-export" element={<ImportExport />} />
                <Route path="/admin/recycle-bin" element={<RecycleBin />} />
                <Route path="/admin/logs" element={<AdminLogs />} />
                <Route path="/admin/referral-panel" element={<ReferralPanelPage />} />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </FirebaseAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
