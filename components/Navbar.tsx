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

export default function Navbar({ logoImageUrl }: { logoImageUrl?: string }) {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 pt-4 transition-all duration-300 pointer-events-none">
      <nav
        className="w-full max-w-6xl pointer-events-auto rounded-2xl border transition-all duration-300"
        style={{
          background: "var(--navbar)",
          backdropFilter: "blur(12px)",
          borderColor: "var(--card-border)",
          padding: scrolled ? "0.6rem 1.25rem" : "0.8rem 1.5rem",
          boxShadow: scrolled ? "0 10px 30px -10px rgba(0, 0, 0, 0.3)" : "none",
        }}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, "home")}
            className="flex items-center group"
          >
            {logoImageUrl ? (
              <img
                src={logoImageUrl}
                alt="Logo"
                className="h-10 w-auto object-contain rounded-lg transition-transform group-hover:scale-105"
                style={{
                  filter: theme === "light" ? "drop-shadow(0 0 1.5px rgba(0,0,0,0.5)) drop-shadow(0 0 1px rgba(0,0,0,0.3))" : "none"
                }}
              />
            ) : (
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center font-bold text-base transition-transform group-hover:scale-105"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                CDC
              </div>
            )}
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
                        ? "rgba(255, 127, 80, 0.1)"
                        : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive)
                        (e.currentTarget as HTMLAnchorElement).style.color =
                          "var(--accent)";
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
                color: "var(--foreground)",
              }}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <FaSun size={14} className="text-[#FF7F50]" />
              ) : (
                <FaMoon size={14} />
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg transition-colors cursor-pointer"
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
            className="md:hidden border-t px-2 py-3 mt-3 flex flex-col gap-1"
            style={{ borderColor: "var(--card-border)" }}
          >
            {navLinks.map(({ href, label, id }) => {
              const isActive = activeSection === id;
              return (
                <a
                  key={id}
                  href={href}
                  onClick={(e) => handleNavClick(e, id)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    color: isActive ? "var(--accent)" : "var(--muted)",
                    background: isActive
                      ? "rgba(255, 127, 80, 0.1)"
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
    </div>
  );
}
