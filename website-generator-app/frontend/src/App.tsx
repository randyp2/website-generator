import React from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import { NavbarMenu } from "./data/navLinks";

const App: React.FC = () => {
  return (
    <div className="overflow-x-hidden relative flex flex-col min-h-screen bg-linear-to-br from-white via-slate-50 to-cyan-100/20">
      <Navbar />
      
      <main className="flex-1">
        <Routes>
          {/* Dynamically generate routes from NavbarMenu */}
          {NavbarMenu.map((item) => (
            <Route key={item.id} path={item.link} element={item.element} />
          ))}
        </Routes>
      </main>
    </div>
  );
};

export default App;