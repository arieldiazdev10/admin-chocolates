import { LoaderCircle } from "lucide-react";
import { useAuth } from "./hooks/useAuth";
import { AdminLayout } from "./components/layout/AdminLayout";
import { LoginPage } from "./modules/auth/pages/LoginPage";
import { ProductAdminPage } from "./modules/products/pages/ProductAdminPage";

const SessionLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-stone-50">
    <div className="flex items-center gap-3 text-sm font-medium text-stone-500">
      <LoaderCircle className="animate-spin text-cacao-700" size={22} />
      Verificando sesión...
    </div>
  </div>
);

function App() {
  const { user, checkingSession } = useAuth();

  if (checkingSession) {
    return <SessionLoader />;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <AdminLayout>
      <ProductAdminPage />
    </AdminLayout>
  );
}

export default App;
