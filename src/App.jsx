import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DemoProvider } from "./context/DemoContext";
import { globalStyles } from "./theme";
import { C, body } from "./theme";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Noticeboard from "./pages/Noticeboard";
import Events from "./pages/Events";
import VenueBooking from "./pages/VenueBooking";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";
import SuperAdmin from "./pages/SuperAdmin";
import SignUp from "./pages/SignUp";
import MemberDashboard from "./pages/MemberDashboard";
import AdminDashboard from "./pages/AdminDashboard";

// Layout
import AppNav from "./components/layout/AppNav";
import Sidebar from "./components/layout/Sidebar";
import DemoBanner from "./components/demo/DemoBanner";

// Auth guard — redirects unauthenticated users to /login
function RequireAuth({ children, requireRole }) {
  const { user, profile, loading } = useAuth();

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.cream }}>
      <div style={{ fontSize: 13, color: C.textLight, fontFamily: body }}>Loading…</div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace/>;

  if (requireRole === "admin" && profile?.role !== "admin" && profile?.role !== "super_admin") {
    return <Navigate to="/dashboard" replace/>;
  }

  if (requireRole === "super_admin" && profile?.role !== "super_admin") {
    return <Navigate to="/dashboard" replace/>;
  }

  return children;
}

// Authenticated app shell with nav + sidebar
function AppShell() {
  return (
    <div style={{ fontFamily: body, background: C.cream, minHeight: "100vh", paddingTop: 36 }}>
      <AppNav/>
      <div style={{ display: "flex" }}>
        <Sidebar/>
        <div style={{ flex: 1, padding: 24, maxWidth: 900, minHeight: "calc(100vh - 88px)" }}>
          <Outlet/>
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Demo pages — no auth required */}
      <Route path="/" element={<Home/>}/>
      <Route path="/signup" element={<SignUp/>}/>
      <Route path="/member-dashboard" element={<MemberDashboard/>}/>
      <Route path="/admin-dashboard" element={<AdminDashboard/>}/>

      {/* Original auth pages */}
      <Route path="/login" element={<Login/>}/>

      {/* Authenticated shell */}
      <Route element={<RequireAuth><AppShell/></RequireAuth>}>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/noticeboard" element={<Noticeboard/>}/>
        <Route path="/events" element={<Events/>}/>
        <Route path="/venue-booking" element={<VenueBooking/>}/>
        <Route path="/profile" element={<Profile/>}/>

        {/* Admin only */}
        <Route path="/admin" element={
          <RequireAuth requireRole="admin"><AdminPanel/></RequireAuth>
        }/>

        {/* Super admin only */}
        <Route path="/super-admin" element={
          <RequireAuth requireRole="super_admin"><SuperAdmin/></RequireAuth>
        }/>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DemoProvider>
          <style>{globalStyles}</style>
          <DemoBanner/>
          <AppRoutes/>
        </DemoProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
