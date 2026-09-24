import React, { useState } from "react";
import { LoginPage } from "./modules/auth/pages/LoginPage";
import { ProductAdminPage } from "./modules/products/pages/ProductAdminPage";

function App() {
  // Estado simple para controlar si está logueado (puedes mejorar esto guardando un flag en localStorage)
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <main>
      {!isAuthenticated ? (
        <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />
      ) : (
        <ProductAdminPage />
      )}
    </main>
  );
}

export default App;
