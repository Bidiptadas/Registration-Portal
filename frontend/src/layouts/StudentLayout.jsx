import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';
import Sidebar from '../components/navigation/Sidebar';
import Footer from '../components/navigation/Footer';
import './StudentLayout.css';

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`student-layout${sidebarOpen ? ' student-layout--sidebar-open' : ''}`}>
      <div className="student-layout__background" aria-hidden="true" />
      {/* Mobile Sidebar Overlay Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar variant="student" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="student-layout__content">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="student-layout__main">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
