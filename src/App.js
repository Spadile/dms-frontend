import { Route, Routes } from "react-router-dom";
import "./App.css";
import AuthLayout from "./layouts/AuthLayout";
import AppRoutes from "./routes/AppRoutes";
import MainLayout from "./layouts/MainLayout";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        {AppRoutes?.authRoutes?.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Route>

      {/* Main Routes */}
      <Route element={<MainLayout />}>
        {AppRoutes?.mainRoutes?.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Route>

      {/* 404 Page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
