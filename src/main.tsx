import { createRoot } from "react-dom/client";
import LandingApp from "./LandingApp.tsx";
import DashboardApp from "./DashboardApp.tsx";
import AdminApp from "./AdminApp.tsx";
import "./index.css";

// Определяем какое приложение загружать в зависимости от домена
const hostname = window.location.hostname;
const pathname = window.location.pathname;
let AppComponent;

if (hostname === 'lk.ebuster.ru') {
  // Личный кабинет
  AppComponent = DashboardApp;
} else if (hostname === 'admin.ebuster.ru') {
  // Админка
  AppComponent = AdminApp;
} else if (hostname === 'localhost') {
  // Localhost - выбираем по пути
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/ticket')) {
    AppComponent = DashboardApp;
  } else if (pathname.startsWith('/admin')) {
    AppComponent = AdminApp;
  } else {
    AppComponent = LandingApp;
  }
} else {
  // Лендинг (ebuster.ru, www.ebuster.ru)
  AppComponent = LandingApp;
}

createRoot(document.getElementById("root")!).render(<AppComponent />);
