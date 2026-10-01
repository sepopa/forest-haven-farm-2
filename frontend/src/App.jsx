import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import History from "./pages/History";
import Process from "./pages/Process";
import Orders from "./pages/Orders";
import Faq from "./pages/Faq";
import Contact from "./pages/Contact";

import Login from "./admin/Login";
import ForgotPassword from "./admin/ForgotPassword";
import ResetPassword from "./admin/ResetPassword";
import AdminLayout from "./admin/AdminLayout";
import ProtectedRoute from "./admin/ProtectedRoute";
import Dashboard from "./admin/pages/Dashboard";
import PagesEditor from "./admin/pages/PagesEditor";
import MenuEditor from "./admin/pages/MenuEditor";
import FaqEditor from "./admin/pages/FaqEditor";
import HistoryEditor from "./admin/pages/HistoryEditor";
import ProcessEditor from "./admin/pages/ProcessEditor";
import GalleryEditor from "./admin/pages/GalleryEditor";
import SettingsEditor from "./admin/pages/SettingsEditor";
import MediaLibrary from "./admin/pages/MediaLibrary";
import OrdersInbox from "./admin/pages/OrdersInbox";
import OrderDetail from "./admin/pages/OrderDetail";
import PickupDatesManager from "./admin/pages/PickupDatesManager";
import ParametersEditor from "./admin/pages/ParametersEditor";
import MessagesInbox from "./admin/pages/MessagesInbox";
import AccountSettings from "./admin/pages/AccountSettings";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/history" element={<History />} />
        <Route path="/process" element={<Process />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<Home />} />
      </Route>

      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin/forgot-password" element={<ForgotPassword />} />
      <Route path="/admin/reset-password" element={<ResetPassword />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="pages" element={<PagesEditor />} />
        <Route path="menu" element={<MenuEditor />} />
        <Route path="faq" element={<FaqEditor />} />
        <Route path="history" element={<HistoryEditor />} />
        <Route path="process" element={<ProcessEditor />} />
        <Route path="gallery" element={<GalleryEditor />} />
        <Route path="settings" element={<SettingsEditor />} />
        <Route path="media" element={<MediaLibrary />} />
        <Route path="orders" element={<OrdersInbox />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="pickup-dates" element={<PickupDatesManager />} />
        <Route path="parameters" element={<ParametersEditor />} />
        <Route path="messages" element={<MessagesInbox />} />
        <Route path="account" element={<AccountSettings />} />
      </Route>
    </Routes>
  );
}
