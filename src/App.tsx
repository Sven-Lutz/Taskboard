import { BrowserRouter, Navigate, NavLink, Route, Routes } from "react-router-dom";
import BoardPage from "@/pages/BoardPage";
import MatrixPage from "@/pages/MatrixPage";
import TablePage from "@/pages/TablePage";

function NavBar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? "bg-slate-900 text-white"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <header className="border-b border-border bg-white">
      <nav className="max-w-5xl mx-auto flex items-center gap-1 px-6 py-3">
        <span className="font-semibold text-slate-900 mr-6">Taskboard</span>
        <NavLink to="/board" className={linkClass}>
          Board
        </NavLink>
        <NavLink to="/matrix" className={linkClass}>
          Matrix
        </NavLink>
        <NavLink to="/table" className={linkClass}>
          Table
        </NavLink>
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <NavBar />
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/board" replace />} />
            <Route path="/board" element={<BoardPage />} />
            <Route path="/matrix" element={<MatrixPage />} />
            <Route path="/table" element={<TablePage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
