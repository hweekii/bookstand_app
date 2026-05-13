import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function AppLayout() {
  return (
    <div className="min-h-screen font-body">
      <Navbar />
      <main className="pb-24 max-w-2xl mx-auto px-0">
        <Outlet />
      </main>
    </div>
  );
}
