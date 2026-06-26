"use client";

import { useState, useEffect } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import { FaSun, FaMoon } from "react-icons/fa";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "#home", label: "Home", id: "home" },
  { href: "#about", label: "About", id: "about" },
  { href: "#projects", label: "Projects", id: "projects" },
  { href: "#contact", label: "Contact", id: "contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    navLinks.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: "-40% 0px -60% 0px" }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{
        background: "var(--navbar)",
        backdropFilter: "blur(12px)",
        borderColor: "var(--card-border)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#home"
          onClick={(e) => handleNavClick(e, "home")}
          className="flex items-center gap-2 group"
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm transition-transform group-hover:scale-105"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            CDC
          </div>
          <span
            className="font-semibold text-sm hidden sm:block"
            style={{ color: "var(--foreground)" }}
          >
            Christian Dela Cruz
          </span>
        </a>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, id }) => {
            const isActive = activeSection === id;
            return (
              <li key={id}>
                <a
                  href={href}
                  onClick={(e) => handleNavClick(e, id)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    color: isActive ? "var(--accent)" : "var(--foreground)",
                    background: isActive
                      ? "rgba(6,182,212,0.1)"
                      : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "var(--muted)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "var(--foreground)";
                  }}
                >
                  {label}
                </a>
              </li>
            );
          })}
        </ul>

        {/* Theme Toggle & Hamburger Group */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center w-9 h-9"
            style={{
              borderColor: "var(--card-border)",
              background: "var(--card-bg)",
              color: "var(--foreground)"
            }}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <FaSun size={14} className="text-[#FF7F50]" /> : <FaMoon size={14} />}
          </button>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: "var(--muted)" }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <HiX size={22} /> : <HiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t px-6 py-4 flex flex-col gap-1"
          style={{ borderColor: "var(--card-border)" }}
        >
          {navLinks.map(({ href, label, id }) => {
            const isActive = activeSection === id;
            return (
              <a
                key={id}
                href={href}
                onClick={(e) => handleNavClick(e, id)}
                className="px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                style={{
                  color: isActive ? "var(--accent)" : "var(--muted)",
                  background: isActive
                    ? "rgba(6,182,212,0.1)"
                    : "transparent",
                }}
              >
                {label}
              </a>
            );
          })}
        </div>
      )}
    </nav>
  );
}
