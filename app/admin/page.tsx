"use client";

import React, { useState, useEffect, useRef, lazy, Suspense, Component } from "react";
import { supabase } from "@/lib/supabase";
import {
  FaFolder,
  FaCertificate,
  FaChalkboardTeacher,
  FaCode,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSignOutAlt,
  FaSpinner,
  FaUpload,
  FaTimes,
  FaLock,
  FaEnvelope,
  FaExternalLinkAlt,
  FaUserCog,
  FaSun,
  FaMoon,
  FaEye,
  FaEyeSlash,
  FaInfoCircle,
  FaChevronUp,
  FaBars,
  FaSearch,
  FaInbox,
  FaChevronLeft,
} from "react-icons/fa";

import { detectWebGL } from "@/lib/webgl";
import { ShaderFallback } from "@/components/ShaderFallback";

const Dithering = typeof window !== "undefined" && detectWebGL()
  ? lazy(() => import("@paper-design/shaders-react").then((mod) => ({ default: mod.Dithering })))
  : () => <div className="absolute inset-0 bg-transparent" />;

class ShaderErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn("Shader WebGL error caught:", error);
  }

  render() {
    if (this.state.hasError) {
      return <div className="absolute inset-0 bg-transparent" />;
    }
    return this.props.children;
  }
}

type Tab = "projects" | "certifications" | "seminars" | "skills" | "profile";

export default function AdminPage() {
  const [shaderError, setShaderError] = useState(false);
  const [isWebGLSupported, setIsWebGLSupported] = useState(false);

  useEffect(() => {
    setIsWebGLSupported(detectWebGL());

    const handleRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason &&
        event.reason.message &&
        (event.reason.message.includes("Paper Shaders") || event.reason.message.includes("WebGL"))
      ) {
        event.preventDefault();
        setShaderError(true);
      }
    };

    window.addEventListener("unhandledrejection", handleRejection);
    return () => window.removeEventListener("unhandledrejection", handleRejection);
  }, []);

  const [session, setSession] = useState<any>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // App Theme
  const [theme, setTheme] = useState("dark");

  // Auth State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoginHovered, setIsLoginHovered] = useState(false);
  const [authView, setAuthView] = useState<"login" | "forgot" | "reset">("login");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [isRecovering, setIsRecovering] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<Tab>("projects");

  // Sidebar
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Search, Filter & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Data States
  const [projects, setProjects] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [seminars, setSeminars] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Profile Settings States
  const [profName, setProfName] = useState("");
  const [profTitle, setProfTitle] = useState("");
  const [profDesc, setProfDesc] = useState("");
  const [profImageUrl, setProfImageUrl] = useState("");
  const [profResumeUrl, setProfResumeUrl] = useState("");
  const [profLogoImageUrl, setProfLogoImageUrl] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Editor Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  // -- Project Fields
  const [projTitle, setProjTitle] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projBullets, setProjBullets] = useState("");
  const [projTech, setProjTech] = useState("");
  const [projDuration, setProjDuration] = useState("");
  const [projGithub, setProjGithub] = useState("");
  const [projStatus, setProjStatus] = useState<"completed" | "in-progress" | "planned">("completed");
  const [projScreenshots, setProjScreenshots] = useState<string[]>([]);

  // -- Certification Fields
  const [certName, setCertName] = useState("");
  const [certIssuer, setCertIssuer] = useState("");
  const [certDate, setCertDate] = useState("");
  const [certBadgeUrl, setCertBadgeUrl] = useState("");
  const [certCredlyUrl, setCertCredlyUrl] = useState("");

  // -- Seminar Fields
  const [semTitle, setSemTitle] = useState("");
  const [semOrganizer, setSemOrganizer] = useState("");
  const [semDate, setSemDate] = useState("");
  const [semImageUrl, setSemImageUrl] = useState("");

  // -- Skill Fields
  const [skillCategory, setSkillCategory] = useState("");
  const [skillItems, setSkillItems] = useState("");

  // Image Upload Ref & State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const logoImageInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize theme and check session
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);

    // Check if recovery parameter is present in URL
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("recovery") === "true") {
        setIsRecovering(true);
        setAuthView("reset");
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsCheckingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovering(true);
        setAuthView("reset");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  // Fetch Data when session is active
  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      const [pRes, cRes, sRes, skRes, profRes] = await Promise.all([
        supabase.from("projects").select("*").order("created_at", { ascending: false }),
        supabase.from("certifications").select("*").order("created_at", { ascending: false }),
        supabase.from("seminars").select("*").order("created_at", { ascending: false }),
        supabase.from("skills").select("*").order("category", { ascending: true }),
        supabase.from("profile").select("*").maybeSingle(),
      ]);

      if (pRes.data) setProjects(pRes.data);
      if (cRes.data) setCertifications(cRes.data);
      if (sRes.data) setSeminars(sRes.data);
      if (skRes.data) setSkills(skRes.data);
      
      if (profRes.data) {
        setProfName(profRes.data.name || "");
        setProfTitle(profRes.data.title || "");
        setProfDesc(profRes.data.description || "");
        setProfImageUrl(profRes.data.profile_image_url || "");
        setProfResumeUrl(profRes.data.resume_url || "");
        setProfLogoImageUrl(profRes.data.logo_image_url || "");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsLoggingIn(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err: any) {
      setAuthError(err.message || "Failed to log in");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setIsRecovering(false);
    setAuthView("login");
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setResetSuccess("");
    setIsLoggingIn(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin?recovery=true`,
      });
      if (error) throw error;
      setResetSuccess("A password reset link has been sent to your email.");
    } catch (err: any) {
      setAuthError(err.message || "Failed to send reset link");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setResetSuccess("");

    if (newPassword !== confirmPassword) {
      setAuthError("Passwords do not match");
      return;
    }

    setIsLoggingIn(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setResetSuccess("Your password has been successfully updated.");
      setTimeout(() => {
        setIsRecovering(false);
        setAuthView("login");
        setNewPassword("");
        setConfirmPassword("");
        setResetSuccess("");
        if (typeof window !== "undefined") {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }, 2500);
    } catch (err: any) {
      setAuthError(err.message || "Failed to update password");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Image Upload helper
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldSetter: (val: string) => void
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // Upload file to Supabase Storage bucket 'portfolio-assets'
      const { error } = await supabase.storage
        .from("portfolio-assets")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage.from("portfolio-assets").getPublicUrl(filePath);
      fieldSetter(urlData.publicUrl);
    } catch (err: any) {
      alert("Upload failed: " + err.message + "\nMake sure you created a public bucket named 'portfolio-assets' in Supabase.");
    } finally {
      setIsUploading(false);
    }
  };

  // Modal Open Handlers
  const openModal = (item: any = null) => {
    setEditingItem(item);

    if (activeTab === "projects") {
      setProjTitle(item?.title || "");
      setProjDesc(item?.description || "");
      setProjBullets(item?.bullets ? item.bullets.join("\n") : "");
      setProjTech(item?.tech ? item.tech.join(", ") : "");
      setProjDuration(item?.duration || "");
      setProjGithub(item?.github || "#");
      setProjStatus(item?.status || "completed");
      setProjScreenshots(item?.screenshots || []);
    } else if (activeTab === "certifications") {
      setCertName(item?.name || "");
      setCertIssuer(item?.issuer || "");
      setCertDate(item?.date || "");
      setCertBadgeUrl(item?.badge_url || "");
      setCertCredlyUrl(item?.credly_url || "");
    } else if (activeTab === "seminars") {
      setSemTitle(item?.title || "");
      setSemOrganizer(item?.organizer || "");
      setSemDate(item?.date || "");
      setSemImageUrl(item?.image_url || "");
    } else if (activeTab === "skills") {
      setSkillCategory(item?.category || "");
      setSkillItems(item?.items ? item.items.join(", ") : "");
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  // Delete Handler
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const { error } = await supabase.from(activeTab).delete().eq("id", id);
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  // Submit Handler for dynamic tables
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let data: any = {};
      const id = editingItem?.id;

      if (activeTab === "projects") {
        data = {
          title: projTitle,
          description: projDesc,
          bullets: projBullets.split("\n").map(b => b.trim()).filter(Boolean),
          tech: projTech.split(",").map(t => t.trim()).filter(Boolean),
          duration: projDuration || null,
          github: projGithub,
          status: projStatus,
          screenshots: projScreenshots,
        };
      } else if (activeTab === "certifications") {
        data = {
          name: certName,
          issuer: certIssuer,
          date: certDate,
          badge_url: certBadgeUrl || null,
          credly_url: certCredlyUrl || null,
        };
      } else if (activeTab === "seminars") {
        data = {
          title: semTitle,
          organizer: semOrganizer,
          date: semDate,
          image_url: semImageUrl || null,
        };
      } else if (activeTab === "skills") {
        data = {
          category: skillCategory,
          items: skillItems.split(",").map(i => i.trim()).filter(Boolean),
        };
      }

      let error;
      if (id) {
        const { error: err } = await supabase.from(activeTab).update(data).eq("id", id);
        error = err;
      } else {
        const { error: err } = await supabase.from(activeTab).insert(data);
        error = err;
      }

      if (error) throw error;

      closeModal();
      fetchData();
    } catch (err: any) {
      alert("Save failed: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Profile Form Save Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      // Upsert profile data using static UUID
      const { error } = await supabase.from("profile").upsert({
        id: "00000000-0000-0000-0000-000000000000",
        name: profName,
        title: profTitle,
        description: profDesc,
        profile_image_url: profImageUrl,
        resume_url: profResumeUrl,
        logo_image_url: profLogoImageUrl,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      alert("Profile and Hero section updated successfully!");
      fetchData();
    } catch (err: any) {
      let errorMsg = err.message || "Failed to save profile";
      if (err.message && err.message.includes("column") && err.message.includes("logo_image_url")) {
        errorMsg += "\n\nIt seems the 'logo_image_url' column is missing from your profile table. Please run the SQL command provided in the setup alert box on this page within your Supabase SQL Editor.";
      }
      alert("Profile update failed: " + errorMsg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Reset page when tab/search/filter changes
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, filterValue]);

  // Filtered + paginated data (computed each render)
  const getFilteredData = (): any[] => {
    const q = searchQuery.toLowerCase();
    if (activeTab === "projects") {
      return projects.filter((p) => {
        const matchSearch = p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
        const matchFilter = filterValue === "all" || p.status === filterValue;
        return matchSearch && matchFilter;
      });
    }
    if (activeTab === "certifications") {
      return certifications.filter((c) =>
        c.name?.toLowerCase().includes(q) || c.issuer?.toLowerCase().includes(q)
      );
    }
    if (activeTab === "seminars") {
      return seminars.filter((s) =>
        s.title?.toLowerCase().includes(q) || s.organizer?.toLowerCase().includes(q)
      );
    }
    if (activeTab === "skills") {
      return skills.filter((s) =>
        s.category?.toLowerCase().includes(q) || s.items?.join(" ").toLowerCase().includes(q)
      );
    }
    return [];
  };

  const filteredData = getFilteredData();
  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[rgba(255,127,80,0.1)] border border-[rgba(255,127,80,0.15)] flex items-center justify-center">
        <FaInbox className="text-2xl text-[#FF7F50]/50" />
      </div>
      <div>
        <p className="text-[var(--foreground)] font-semibold text-base">No entries yet</p>
        <p className="text-[var(--muted)] text-sm mt-1">Click &ldquo;Add New Entry&rdquo; to get started.</p>
      </div>
    </div>
  );

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1c141d] text-white">
        <FaSpinner className="animate-spin text-4xl text-[#FF7F50]" />
      </div>
    );
  }

  // LOGIN SCREEN
  if (!session || isRecovering) {
    return (
      <div className="admin-page min-h-screen flex flex-col md:flex-row bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300 relative pulsing-gradient-bg">
        {/* Floating Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-6 right-6 p-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]/80 backdrop-blur-sm transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center w-10 h-10 z-20 text-[var(--foreground)] shadow-md"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <FaSun size={15} className="text-[#FF7F50]" /> : <FaMoon size={15} />}
        </button>

        {/* Left column: form */}
        <section className="flex-1 flex items-center justify-center p-6 sm:p-12 md:p-16 z-10">
          <div className="max-w-md w-full">
            <div className="flex flex-col gap-6">
              
              {authView === "login" && (
                <>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)]">
                      Admin <span className="text-[#FF7F50]">Access</span>
                    </h1>
                    <p className="text-[var(--muted)] text-sm mt-1.5">Sign in to manage your portfolio</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-5">
                    {authError && (
                      <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-red-200 text-sm text-center animate-fade-in">
                        {authError}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[var(--foreground)]/80">Email Address</label>
                      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]/20 backdrop-blur-sm transition-all focus-within:border-[#FF7F50] focus-within:bg-[rgba(255,127,80,0.05)] relative flex items-center">
                        <FaEnvelope className="absolute left-4 text-[var(--muted)] pointer-events-none" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-transparent text-sm py-3.5 pl-11 pr-4 text-[var(--foreground)] focus:outline-none"
                          placeholder="admin@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-[var(--foreground)]/80">Password</label>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthView("forgot");
                            setAuthError("");
                            setResetSuccess("");
                          }}
                          className="text-xs font-semibold text-[#FF7F50] hover:text-[#ff6a35] hover:underline focus:outline-none transition-colors cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]/20 backdrop-blur-sm transition-all focus-within:border-[#FF7F50] focus-within:bg-[rgba(255,127,80,0.05)] relative flex items-center">
                        <FaLock className="absolute left-4 text-[var(--muted)] pointer-events-none" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-transparent text-sm py-3.5 pl-11 pr-11 text-[var(--foreground)] focus:outline-none"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 text-[var(--muted)] hover:text-[#FF7F50] transition-colors focus:outline-none cursor-pointer"
                          title={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoggingIn}
                      className="w-full bg-[#FF7F50] hover:bg-[#ff6a35] text-white font-semibold py-3.5 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-[#FF7F50]/20 mt-2"
                    >
                      {isLoggingIn ? (
                        <>
                          <FaSpinner className="animate-spin text-lg" /> Logging In...
                        </>
                      ) : (
                        "Log In"
                      )}
                    </button>
                  </form>
                </>
              )}

              {authView === "forgot" && (
                <>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)]">
                      Reset <span className="text-[#FF7F50]">Password</span>
                    </h1>
                    <p className="text-[var(--muted)] text-sm mt-1.5">Enter your email to receive a password reset link</p>
                  </div>

                  <form onSubmit={handleRequestReset} className="space-y-5">
                    {authError && (
                      <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-red-200 text-sm text-center animate-fade-in">
                        {authError}
                      </div>
                    )}
                    
                    {resetSuccess && (
                      <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-200 text-sm text-center animate-fade-in">
                        {resetSuccess}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[var(--foreground)]/80">Email Address</label>
                      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]/20 backdrop-blur-sm transition-all focus-within:border-[#FF7F50] focus-within:bg-[rgba(255,127,80,0.05)] relative flex items-center">
                        <FaEnvelope className="absolute left-4 text-[var(--muted)] pointer-events-none" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-transparent text-sm py-3.5 pl-11 pr-4 text-[var(--foreground)] focus:outline-none"
                          placeholder="admin@example.com"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoggingIn}
                      className="w-full bg-[#FF7F50] hover:bg-[#ff6a35] text-white font-semibold py-3.5 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-[#FF7F50]/20 mt-2"
                    >
                      {isLoggingIn ? (
                        <>
                          <FaSpinner className="animate-spin text-lg" /> Sending...
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAuthView("login");
                        setAuthError("");
                        setResetSuccess("");
                      }}
                      className="w-full text-center text-sm font-semibold text-[var(--muted)] hover:text-[#FF7F50] hover:underline focus:outline-none transition-colors mt-4 cursor-pointer"
                    >
                      Back to Log In
                    </button>
                  </form>
                </>
              )}

              {authView === "reset" && (
                <>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)]">
                      Set New <span className="text-[#FF7F50]">Password</span>
                    </h1>
                    <p className="text-[var(--muted)] text-sm mt-1.5">Create a new secure password for your account</p>
                  </div>

                  <form onSubmit={handleUpdatePassword} className="space-y-5">
                    {authError && (
                      <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-red-200 text-sm text-center animate-fade-in">
                        {authError}
                      </div>
                    )}
                    
                    {resetSuccess && (
                      <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-200 text-sm text-center animate-fade-in">
                        {resetSuccess}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[var(--foreground)]/80">New Password</label>
                      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]/20 backdrop-blur-sm transition-all focus-within:border-[#FF7F50] focus-within:bg-[rgba(255,127,80,0.05)] relative flex items-center">
                        <FaLock className="absolute left-4 text-[var(--muted)] pointer-events-none" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-transparent text-sm py-3.5 pl-11 pr-11 text-[var(--foreground)] focus:outline-none"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 text-[var(--muted)] hover:text-[#FF7F50] transition-colors focus:outline-none cursor-pointer"
                          title={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[var(--foreground)]/80">Confirm Password</label>
                      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]/20 backdrop-blur-sm transition-all focus-within:border-[#FF7F50] focus-within:bg-[rgba(255,127,80,0.05)] relative flex items-center">
                        <FaLock className="absolute left-4 text-[var(--muted)] pointer-events-none" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-transparent text-sm py-3.5 pl-11 pr-11 text-[var(--foreground)] focus:outline-none"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoggingIn}
                      className="w-full bg-[#FF7F50] hover:bg-[#ff6a35] text-white font-semibold py-3.5 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-[#FF7F50]/20 mt-2"
                    >
                      {isLoggingIn ? (
                        <>
                          <FaSpinner className="animate-spin text-lg" /> Updating...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </button>
                  </form>
                </>
              )}

            </div>
          </div>
        </section>

        {/* Right column: visual section */}
        <section
          className="hidden md:flex md:w-1/2 relative bg-[var(--background)] overflow-hidden items-center justify-center border-l border-[var(--card-border)] transition-colors duration-300 admin-visual-gradient"
          onMouseEnter={() => setIsLoginHovered(true)}
          onMouseLeave={() => setIsLoginHovered(false)}
        >
          <div className="absolute inset-0 z-0 pointer-events-none opacity-30 dark:opacity-20 mix-blend-normal transition-opacity duration-500">
            {!shaderError && isWebGLSupported ? (
              <ShaderErrorBoundary>
                <Suspense fallback={<div className="absolute inset-0 bg-transparent" />}>
                  <Dithering
                    colorBack="#00000000" // Transparent
                    colorFront="#FF7F50"  // Coral
                    shape="warp"
                    type="4x4"
                    speed={isLoginHovered ? 0.45 : 0.12}
                    className="size-full"
                    minPixelRatio={1}
                  />
                </Suspense>
              </ShaderErrorBoundary>
            ) : (
              <ShaderFallback color="#FF7F50" speed={isLoginHovered ? 0.45 : 0.12} />
            )}
          </div>
        </section>
      </div>
    );
  }

  // DASHBOARD SCREEN
  return (
    <div className="admin-page min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col transition-colors duration-300">
      {/* Dashboard Header */}
      <header className="bg-[var(--navbar)] border-b border-[var(--card-border)] px-5 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {/* Sidebar toggle – desktop only */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden md:flex items-center justify-center w-9 h-9 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] hover:bg-[var(--card-border)] transition-all cursor-pointer text-[var(--muted)] hover:text-[var(--foreground)] flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            {isSidebarCollapsed ? <FaBars size={13} /> : <FaChevronLeft size={11} />}
          </button>
          <div
            onClick={() => setActiveTab("profile")}
            className="flex items-center text-2xl font-bold tracking-tighter select-none cursor-pointer hover:opacity-90 transition-opacity"
          >
            <span className="text-neutral-400 dark:text-neutral-600 font-bold opacity-80">C</span>
            <span className="text-[#FF7F50] font-black text-3xl -mx-0.5">D</span>
            <span className="text-neutral-400 dark:text-neutral-600 font-bold opacity-80">C</span>
          </div>
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 text-xs bg-[var(--card-bg)] hover:bg-[var(--card-border)] px-3 py-1.5 rounded-lg border border-[var(--card-border)] transition-colors text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <FaEye /> Live View
          </a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center w-9 h-9"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <FaSun size={14} className="text-[#FF7F50]" /> : <FaMoon size={14} />}
          </button>
          <button
            onClick={handleLogout}
            className="md:hidden flex items-center justify-center text-red-400 hover:text-red-300 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl w-9 h-9 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Logout"
          >
            <FaSignOutAlt size={14} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row items-stretch">
        {/* Desktop Collapsible Sidebar */}
        <aside
          style={{ width: isSidebarCollapsed ? "68px" : "256px" }}
          className="hidden md:flex flex-col justify-between border-r border-[var(--card-border)] bg-[var(--card-bg)]/20 p-3 gap-2 md:sticky md:top-[73px] md:h-[calc(100vh-73px)] transition-[width] duration-300 ease-in-out overflow-hidden flex-shrink-0"
        >
          <div className="flex flex-col gap-1.5">
            {(
              [
                { id: "profile", label: "Hero Settings", icon: FaUserCog },
                { id: "projects", label: "Projects", icon: FaFolder },
                { id: "certifications", label: "Certifications", icon: FaCertificate },
                { id: "seminars", label: "Seminars", icon: FaChalkboardTeacher },
                { id: "skills", label: "Skills", icon: FaCode },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  title={isSidebarCollapsed ? tab.label : undefined}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer overflow-hidden whitespace-nowrap
                    ${isSidebarCollapsed ? "justify-center" : ""}
                    ${isActive
                      ? "bg-[#FF7F50] text-white shadow-lg shadow-[#FF7F50]/20"
                      : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)]"
                    }`}
                >
                  <Icon className="text-base flex-shrink-0" />
                  {!isSidebarCollapsed && <span>{tab.label}</span>}
                </button>
              );
            })}
          </div>

          {/* User Card */}
          <div className="mt-auto pt-3 border-t border-[var(--card-border)] relative">
            {isSidebarCollapsed ? (
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                title={profName || "Admin User"}
                className="w-full flex justify-center"
              >
                <div className="w-10 h-10 rounded-full bg-[rgba(255,127,80,0.15)] border border-[rgba(255,127,80,0.3)] text-[#FF7F50] flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-[rgba(255,127,80,0.25)] transition-colors">
                  {profName ? profName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() : "AD"}
                </div>
              </button>
            ) : (
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[var(--card-bg)] border border-transparent hover:border-[var(--card-border)] transition-all cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[rgba(255,127,80,0.15)] border border-[rgba(255,127,80,0.3)] text-[#FF7F50] flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {profName ? profName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() : "AD"}
                  </div>
                  <div className="truncate w-32">
                    <h4 className="text-sm font-bold text-[var(--foreground)] truncate">{profName || "Admin User"}</h4>
                    <p className="text-[10px] font-medium text-[var(--muted)]">Super Admin</p>
                  </div>
                </div>
                <FaChevronUp className={`text-[var(--muted)] text-xs transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`} />
              </button>
            )}

            {isUserMenuOpen && (
              <div className={`absolute ${isSidebarCollapsed ? "left-full ml-2 bottom-0" : "bottom-[68px] left-0 right-0"} bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-2 shadow-2xl z-20 flex flex-col gap-1 w-52 animate-fade-in`}>
                <div className="px-3 py-1.5 text-xs text-[var(--muted)] border-b border-[var(--card-border)] truncate font-semibold mb-1">
                  {session.user.email}
                </div>
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-xl hover:bg-[var(--background)] transition-colors text-[var(--foreground)] text-left cursor-pointer font-semibold"
                >
                  {theme === "dark" ? <FaSun className="text-[#FF7F50] text-sm" /> : <FaMoon className="text-sm text-[var(--muted)]" />}
                  <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors text-left cursor-pointer border-t border-[var(--card-border)] mt-1 font-semibold"
                >
                  <FaSignOutAlt className="text-sm" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Tab Navigation */}
        <nav className="md:hidden flex items-center gap-2 p-3 overflow-x-auto border-b border-[var(--card-border)] bg-[var(--card-bg)]/20 no-scrollbar flex-shrink-0">
          {(
            [
              { id: "profile", label: "Hero", icon: FaUserCog },
              { id: "projects", label: "Projects", icon: FaFolder },
              { id: "certifications", label: "Certs", icon: FaCertificate },
              { id: "seminars", label: "Seminars", icon: FaChalkboardTeacher },
              { id: "skills", label: "Skills", icon: FaCode },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer flex-shrink-0 transition-all ${
                  isActive ? "bg-[#FF7F50] text-white shadow-md" : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)]"
                }`}
              >
                <Icon className="text-sm" /> {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Content Panel */}
        <main className="flex-1 p-5 sm:p-7 md:p-10 min-w-0 overflow-x-hidden">
          {/* Tab Header */}
          <div className="mb-7">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
              {activeTab === "profile" ? "Hero & Bio Settings" :
               activeTab === "projects" ? "Manage Projects" :
               activeTab === "certifications" ? "Manage Certifications" :
               activeTab === "seminars" ? "Manage Seminars" : "Manage Skills"}
            </h1>
            <p className="text-[var(--muted)] text-sm mt-1.5">
              {activeTab === "profile"
                ? "Configure your personal information, hero titles, descriptions, and dynamic image."
                : `Add, update, or remove your portfolio's ${activeTab} dynamic entries.`
              }
            </p>
          </div>

          {/* Loader */}
          {isLoadingData ? (
            <div className="h-64 flex items-center justify-center">
              <FaSpinner className="animate-spin text-3xl text-[#FF7F50]" />
            </div>
          ) : (
            <div className="space-y-6">

              {/* ── PROFILE SETTINGS ─────────────────────────────── */}
              {activeTab === "profile" && (
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 shadow-xl">
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--foreground)]/80">Full Name</label>
                        <input type="text" value={profName} onChange={(e) => setProfName(e.target.value)}
                          className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-3 px-4 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm transition-all"
                          placeholder="e.g. Christian Dela Cruz" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--foreground)]/80">Hero Title / Role</label>
                        <input type="text" value={profTitle} onChange={(e) => setProfTitle(e.target.value)}
                          className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-3 px-4 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm transition-all"
                          placeholder="e.g. Information Technology Specialist" required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[var(--foreground)]/80">Hero Biography Description</label>
                      <textarea value={profDesc} onChange={(e) => setProfDesc(e.target.value)} rows={4}
                        className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-3 px-4 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm transition-all leading-relaxed"
                        placeholder="Explain who you are and your fields of expertise..." required />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[var(--foreground)]/80 block">Hero Profile Image</label>
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#FF7F50] bg-[var(--background)] flex-shrink-0">
                          {profImageUrl ? (
                            <img src={profImageUrl} alt="Hero Profile Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-[var(--muted)]">No Image</div>
                          )}
                        </div>
                        <div className="flex-1 w-full space-y-2">
                          <div className="flex gap-2">
                            <input type="text" placeholder="Paste picture URL or upload a file" value={profImageUrl}
                              onChange={(e) => setProfImageUrl(e.target.value)}
                              className="flex-1 bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm" />
                            <button type="button" onClick={() => profileImageInputRef.current?.click()} disabled={isUploading}
                              className="bg-[var(--card-bg)] hover:bg-[var(--card-border)] border border-[var(--card-border)] px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50 text-[var(--foreground)]">
                              {isUploading ? <FaSpinner className="animate-spin" /> : <FaUpload />} Upload
                            </button>
                          </div>
                          <input type="file" ref={profileImageInputRef} className="hidden" accept="image/*"
                            onChange={(e) => handleImageUpload(e, setProfImageUrl)} />
                          <p className="text-[var(--muted)] text-[10px] flex items-center gap-1.5">
                            <FaInfoCircle /> Drag-and-drop support: Files are uploaded directly to your Supabase cloud Storage bucket.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[var(--foreground)]/80 block">Resume Document (PDF)</label>
                      <div className="flex gap-2">
                        <input type="text" placeholder="Paste PDF link or upload a file" value={profResumeUrl}
                          onChange={(e) => setProfResumeUrl(e.target.value)}
                          className="flex-1 bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm" />
                        <button type="button" onClick={() => resumeInputRef.current?.click()} disabled={isUploading}
                          className="bg-[var(--card-bg)] hover:bg-[var(--card-border)] border border-[var(--card-border)] px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50 text-[var(--foreground)]">
                          {isUploading ? <FaSpinner className="animate-spin" /> : <FaUpload />} Upload
                        </button>
                      </div>
                      <input type="file" ref={resumeInputRef} className="hidden" accept="application/pdf"
                        onChange={(e) => handleImageUpload(e, setProfResumeUrl)} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[var(--foreground)]/80 block">Navbar Logo / Icon Image</label>
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-[var(--card-border)] bg-[var(--background)] flex-shrink-0 flex items-center justify-center p-2">
                          {profLogoImageUrl ? (
                            <img src={profLogoImageUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-[var(--muted)]">No Logo</div>
                          )}
                        </div>
                        <div className="flex-1 w-full space-y-2">
                          <div className="flex gap-2">
                            <input type="text" placeholder="Paste logo image URL or upload a file" value={profLogoImageUrl}
                              onChange={(e) => setProfLogoImageUrl(e.target.value)}
                              className="flex-1 bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm" />
                            <button type="button" onClick={() => logoImageInputRef.current?.click()} disabled={isUploading}
                              className="bg-[var(--card-bg)] hover:bg-[var(--card-border)] border border-[var(--card-border)] px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50 text-[var(--foreground)]">
                              {isUploading ? <FaSpinner className="animate-spin" /> : <FaUpload />} Upload
                            </button>
                          </div>
                          <input type="file" ref={logoImageInputRef} className="hidden" accept="image/*"
                            onChange={(e) => handleImageUpload(e, setProfLogoImageUrl)} />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-yellow-600 dark:text-yellow-400 text-xs leading-relaxed space-y-1.5">
                      <p className="font-semibold flex items-center gap-1.5">
                        <FaInfoCircle /> First-Time Setup: Database Action Required
                      </p>
                      <p>
                        If your Supabase database was created before this update, you must add the new <code>logo_image_url</code> column to your <code>profile</code> table. Run this command in your Supabase SQL Editor:
                      </p>
                      <pre className="bg-black/40 p-2 rounded-lg font-mono select-all overflow-x-auto text-[10px] text-left">
                        ALTER TABLE public.profile ADD COLUMN IF NOT EXISTS logo_image_url TEXT DEFAULT &apos;/favicon.png&apos;;
                      </pre>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-[var(--card-border)]">
                      <button type="submit" disabled={isSavingProfile}
                        className="bg-[#FF7F50] hover:bg-[#ff6a35] text-white px-8 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg disabled:opacity-50 flex items-center gap-2">
                        {isSavingProfile ? <FaSpinner className="animate-spin" /> : "Save Profile Settings"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ── DATA TABLES ──────────────────────────────────── */}
              {activeTab !== "profile" && (
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl overflow-hidden shadow-2xl">

                  {/* Toolbar */}
                  <div className="px-5 py-4 border-b border-[var(--card-border)] flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-[var(--background)]/30">
                    {/* Search */}
                    <div className="relative w-full sm:w-64">
                      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] text-xs pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search entries..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2 pl-8 pr-3 text-sm text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] transition-colors placeholder:text-[var(--muted)]"
                      />
                    </div>

                    {/* Status filter – projects only */}
                    {activeTab === "projects" && (
                      <select
                        value={filterValue}
                        onChange={(e) => { setFilterValue(e.target.value); setCurrentPage(1); }}
                        className="bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2 px-3 text-sm text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] cursor-pointer transition-colors"
                      >
                        <option value="all">All Statuses</option>
                        <option value="completed">Completed</option>
                        <option value="in-progress">In Progress</option>
                        <option value="planned">Planned</option>
                      </select>
                    )}

                    {/* Count + Add */}
                    <div className="flex items-center gap-3 sm:ml-auto w-full sm:w-auto justify-between sm:justify-end">
                      <span className="text-xs text-[var(--muted)] font-medium">
                        {filteredData.length} {filteredData.length === 1 ? "entry" : "entries"}
                      </span>
                      <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 bg-[#FF7F50] hover:bg-[#ff6a35] text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-[#FF7F50]/20 whitespace-nowrap"
                      >
                        <FaPlus size={11} /> Add New Entry
                      </button>
                    </div>
                  </div>

                  {/* ── Projects Table ── */}
                  {activeTab === "projects" && (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b border-[var(--card-border)] bg-[var(--background)]/60 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
                            <th className="px-6 py-3.5">Title</th>
                            <th className="px-6 py-3.5">Status</th>
                            <th className="px-6 py-3.5">Tech Stack</th>
                            <th className="px-6 py-3.5 w-28 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--card-border)] text-sm">
                          {paginatedData.map((proj) => (
                            <tr key={proj.id} className="hover:bg-[var(--card-border)]/25 transition-colors duration-150">
                              <td className="px-6 py-4 font-semibold text-[var(--foreground)] max-w-[200px]">
                                <span className="block truncate">{proj.title}</span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <span
                                    className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border capitalize"
                                    style={{
                                      color: proj.status === "completed" ? "#22c55e" : proj.status === "in-progress" ? "#f59e0b" : "#9ca3af",
                                      backgroundColor: proj.status === "completed" ? "rgba(34,197,94,0.1)" : proj.status === "in-progress" ? "rgba(245,158,11,0.1)" : "rgba(156,163,175,0.1)",
                                      borderColor: proj.status === "completed" ? "rgba(34,197,94,0.25)" : proj.status === "in-progress" ? "rgba(245,158,11,0.25)" : "rgba(156,163,175,0.25)",
                                    }}
                                  >
                                    {proj.status}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-[var(--muted)] max-w-[200px]">
                                <span className="block truncate">{proj.tech?.slice(0, 3).join(", ")}{proj.tech?.length > 3 && " ..."}</span>
                              </td>
                              <td className="px-6 py-4 w-28">
                                <div className="flex items-center justify-center gap-3">
                                  <button onClick={() => openModal(proj)} className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-all cursor-pointer" title="Edit"><FaEdit size={13} /></button>
                                  <button onClick={() => handleDelete(proj.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all cursor-pointer" title="Delete"><FaTrash size={13} /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {paginatedData.length === 0 && (
                            <tr><td colSpan={4}>{emptyState}</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* ── Certifications Table ── */}
                  {activeTab === "certifications" && (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b border-[var(--card-border)] bg-[var(--background)]/60 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
                            <th className="px-6 py-3.5 w-20">Badge</th>
                            <th className="px-6 py-3.5">Name</th>
                            <th className="px-6 py-3.5">Issuer</th>
                            <th className="px-6 py-3.5">Date</th>
                            <th className="px-6 py-3.5 w-28 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--card-border)] text-sm">
                          {paginatedData.map((cert) => (
                            <tr key={cert.id} className="hover:bg-[var(--card-border)]/25 transition-colors duration-150">
                              <td className="px-6 py-4">
                                {cert.badge_url ? (
                                  <img src={cert.badge_url} alt={cert.name} className="w-10 h-10 object-contain rounded-md border border-[var(--card-border)] p-0.5 bg-[var(--background)]" />
                                ) : (
                                  <span className="text-[var(--muted)] text-lg">—</span>
                                )}
                              </td>
                              <td className="px-6 py-4 font-semibold text-[var(--foreground)] max-w-[200px]">
                                <span className="block truncate">{cert.name}</span>
                              </td>
                              <td className="px-6 py-4 text-[var(--muted)]">{cert.issuer}</td>
                              <td className="px-6 py-4 text-[var(--muted)] whitespace-nowrap">{cert.date}</td>
                              <td className="px-6 py-4 w-28">
                                <div className="flex items-center justify-center gap-3">
                                  <button onClick={() => openModal(cert)} className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-all cursor-pointer" title="Edit"><FaEdit size={13} /></button>
                                  <button onClick={() => handleDelete(cert.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all cursor-pointer" title="Delete"><FaTrash size={13} /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {paginatedData.length === 0 && (
                            <tr><td colSpan={5}>{emptyState}</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* ── Seminars Table ── */}
                  {activeTab === "seminars" && (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b border-[var(--card-border)] bg-[var(--background)]/60 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
                            <th className="px-6 py-3.5 w-24">Image</th>
                            <th className="px-6 py-3.5">Title</th>
                            <th className="px-6 py-3.5">Organizer</th>
                            <th className="px-6 py-3.5">Date</th>
                            <th className="px-6 py-3.5 w-28 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--card-border)] text-sm">
                          {paginatedData.map((sem) => (
                            <tr key={sem.id} className="hover:bg-[var(--card-border)]/25 transition-colors duration-150">
                              <td className="px-6 py-4">
                                {sem.image_url ? (
                                  <img src={sem.image_url} alt={sem.title} className="w-16 h-10 object-cover rounded-md border border-[var(--card-border)]" />
                                ) : (
                                  <span className="text-[var(--muted)] text-lg">—</span>
                                )}
                              </td>
                              <td className="px-6 py-4 font-semibold text-[var(--foreground)] max-w-[200px]">
                                <span className="block truncate">{sem.title}</span>
                              </td>
                              <td className="px-6 py-4 text-[var(--muted)]">{sem.organizer}</td>
                              <td className="px-6 py-4 text-[var(--muted)] whitespace-nowrap">{sem.date}</td>
                              <td className="px-6 py-4 w-28">
                                <div className="flex items-center justify-center gap-3">
                                  <button onClick={() => openModal(sem)} className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-all cursor-pointer" title="Edit"><FaEdit size={13} /></button>
                                  <button onClick={() => handleDelete(sem.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all cursor-pointer" title="Delete"><FaTrash size={13} /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {paginatedData.length === 0 && (
                            <tr><td colSpan={5}>{emptyState}</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* ── Skills Table ── */}
                  {activeTab === "skills" && (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b border-[var(--card-border)] bg-[var(--background)]/60 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
                            <th className="px-6 py-3.5">Category</th>
                            <th className="px-6 py-3.5">Skills</th>
                            <th className="px-6 py-3.5 w-28 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--card-border)] text-sm">
                          {paginatedData.map((sk) => (
                            <tr key={sk.id} className="hover:bg-[var(--card-border)]/25 transition-colors duration-150">
                              <td className="px-6 py-4 font-semibold text-[var(--foreground)] whitespace-nowrap">{sk.category}</td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1.5">
                                  {sk.items?.slice(0, 6).map((item: string, i: number) => (
                                    <span key={i} className="px-2 py-0.5 bg-[var(--background)] border border-[var(--card-border)] rounded-md text-[10px] font-medium text-[var(--foreground)]/70">{item}</span>
                                  ))}
                                  {sk.items?.length > 6 && (
                                    <span className="px-2 py-0.5 text-[10px] text-[var(--muted)]">+{sk.items.length - 6} more</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 w-28">
                                <div className="flex items-center justify-center gap-3">
                                  <button onClick={() => openModal(sk)} className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-all cursor-pointer" title="Edit"><FaEdit size={13} /></button>
                                  <button onClick={() => handleDelete(sk.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all cursor-pointer" title="Delete"><FaTrash size={13} /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {paginatedData.length === 0 && (
                            <tr><td colSpan={3}>{emptyState}</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination Footer */}
                  {filteredData.length > ITEMS_PER_PAGE && (
                    <div className="px-6 py-4 border-t border-[var(--card-border)] bg-[var(--background)]/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <p className="text-xs text-[var(--muted)]">
                        Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredData.length)}&ndash;{Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length} entries
                      </p>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--card-border)] bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[#FF7F50] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                        >
                          &larr; Prev
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                          <button
                            key={p}
                            onClick={() => setCurrentPage(p)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentPage === p
                                ? "bg-[#FF7F50] text-white shadow-sm shadow-[#FF7F50]/30"
                                : "border border-[var(--card-border)] bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[#FF7F50]"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--card-border)] bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[#FF7F50] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                        >
                          Next &rarr;
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── CRUD EDITOR DRAWER ──────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
            onClick={closeModal}
          />
          <form
            onSubmit={handleSave}
            className="relative w-full max-w-xl bg-[var(--card-bg)] border-l border-[var(--card-border)] h-full shadow-2xl flex flex-col z-10 animate-slide-in-right text-left"
          >
            <div className="px-6 py-5 border-b border-[var(--card-border)] flex items-center justify-between bg-[var(--card-bg)]">
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                {editingItem ? "Edit" : "Add New"} {activeTab.slice(0, -1)}
              </h2>
              <button type="button" onClick={closeModal}
                className="text-[var(--muted)] hover:text-[var(--foreground)] text-lg p-2 rounded-lg cursor-pointer transition-colors hover:bg-[var(--background)] flex items-center justify-center">
                <FaTimes />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[var(--card-bg)]">
              {/* PROJECTS FORM */}
              {activeTab === "projects" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[var(--foreground)]/80">Project Title</label>
                      <input type="text" value={projTitle} onChange={(e) => setProjTitle(e.target.value)}
                        className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm"
                        placeholder="My Awesome App" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[var(--foreground)]/80">Status</label>
                      <select value={projStatus} onChange={(e: any) => setProjStatus(e.target.value)}
                        className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm">
                        <option value="completed">Completed</option>
                        <option value="in-progress">In Progress</option>
                        <option value="planned">Planned</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--foreground)]/80">Description</label>
                    <textarea value={projDesc} onChange={(e) => setProjDesc(e.target.value)} rows={3}
                      className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm leading-relaxed"
                      placeholder="Enter a brief project description" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--foreground)]/80">Bullets Achievements (One item per line)</label>
                    <textarea value={projBullets} onChange={(e) => setProjBullets(e.target.value)} rows={4}
                      className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm leading-relaxed"
                      placeholder={"Bullet point 1\nBullet point 2\nBullet point 3"} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[var(--foreground)]/80">Tech Stack (Comma separated)</label>
                      <input type="text" value={projTech} onChange={(e) => setProjTech(e.target.value)}
                        className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm"
                        placeholder="React, Next.js, Tailwind, Supabase" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[var(--foreground)]/80">Duration</label>
                      <input type="text" value={projDuration} onChange={(e) => setProjDuration(e.target.value)}
                        className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm"
                        placeholder="Sept 2025 - Dec 2025" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--foreground)]/80">GitHub URL</label>
                    <input type="text" value={projGithub} onChange={(e) => setProjGithub(e.target.value)}
                      className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm"
                      placeholder="https://github.com/username/project" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--foreground)]/80 block">Screenshots</label>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Paste image URL or upload one"
                        value={projScreenshots.join(", ")}
                        onChange={(e) => setProjScreenshots(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                        className="flex-1 bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm" />
                      <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}
                        className="bg-[var(--card-bg)] hover:bg-[var(--card-border)] border border-[var(--card-border)] px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50 text-[var(--foreground)]">
                        {isUploading ? <FaSpinner className="animate-spin" /> : <FaUpload />} Upload
                      </button>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*"
                      onChange={(e) => handleImageUpload(e, (url) => setProjScreenshots((prev) => [...prev, url]))} />
                    {projScreenshots.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {projScreenshots.map((url, idx) => (
                          <div key={idx} className="relative group rounded-md overflow-hidden border border-[var(--card-border)]">
                            <img src={url} alt="Screenshot preview" className="w-20 h-12 object-cover" />
                            <button type="button"
                              onClick={() => setProjScreenshots((prev) => prev.filter((_, i) => i !== idx))}
                              className="absolute top-0 right-0 bg-red-600 text-white rounded-bl-md p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs">
                              <FaTimes />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* CERTIFICATIONS FORM */}
              {activeTab === "certifications" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--foreground)]/80">Certification Name</label>
                    <input type="text" value={certName} onChange={(e) => setCertName(e.target.value)}
                      className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm"
                      placeholder="e.g. AWS Certified Solutions Architect" required />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[var(--foreground)]/80">Issuer</label>
                      <input type="text" value={certIssuer} onChange={(e) => setCertIssuer(e.target.value)}
                        className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm"
                        placeholder="e.g. Amazon Web Services" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[var(--foreground)]/80">Date Earned</label>
                      <input type="text" value={certDate} onChange={(e) => setCertDate(e.target.value)}
                        className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm"
                        placeholder="e.g. October 2025" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--foreground)]/80 block">Badge Image</label>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Paste image URL or upload one" value={certBadgeUrl}
                        onChange={(e) => setCertBadgeUrl(e.target.value)}
                        className="flex-1 bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm" />
                      <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}
                        className="bg-[var(--card-bg)] hover:bg-[var(--card-border)] border border-[var(--card-border)] px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50 text-[var(--foreground)]">
                        {isUploading ? <FaSpinner className="animate-spin" /> : <FaUpload />} Upload
                      </button>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*"
                      onChange={(e) => handleImageUpload(e, setCertBadgeUrl)} />
                    {certBadgeUrl && (
                      <div className="mt-2">
                        <img src={certBadgeUrl} alt="Badge Preview" className="w-16 h-16 object-contain rounded-md border border-[var(--card-border)] p-1 bg-[var(--background)]" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--foreground)]/80">Credly URL (Optional)</label>
                    <input type="text" value={certCredlyUrl} onChange={(e) => setCertCredlyUrl(e.target.value)}
                      className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm"
                      placeholder="https://www.credly.com/badges/your-badge" />
                  </div>
                </>
              )}

              {/* SEMINARS FORM */}
              {activeTab === "seminars" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--foreground)]/80">Seminar Title</label>
                    <input type="text" value={semTitle} onChange={(e) => setSemTitle(e.target.value)}
                      className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm"
                      placeholder="e.g. Introduction to Generative AI" required />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[var(--foreground)]/80">Organizer</label>
                      <input type="text" value={semOrganizer} onChange={(e) => setSemOrganizer(e.target.value)}
                        className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm"
                        placeholder="e.g. Google Cloud Developer Group" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[var(--foreground)]/80">Date</label>
                      <input type="text" value={semDate} onChange={(e) => setSemDate(e.target.value)}
                        className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm"
                        placeholder="e.g. June 26, 2026" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--foreground)]/80 block">Seminar Certificate/Image</label>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Paste image URL or upload one" value={semImageUrl}
                        onChange={(e) => setSemImageUrl(e.target.value)}
                        className="flex-1 bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm" />
                      <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}
                        className="bg-[var(--card-bg)] hover:bg-[var(--card-border)] border border-[var(--card-border)] px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50 text-[var(--foreground)]">
                        {isUploading ? <FaSpinner className="animate-spin" /> : <FaUpload />} Upload
                      </button>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*"
                      onChange={(e) => handleImageUpload(e, setSemImageUrl)} />
                    {semImageUrl && (
                      <div className="mt-2">
                        <img src={semImageUrl} alt="Seminar Preview" className="w-32 h-20 object-cover rounded-md border border-[var(--card-border)]" />
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* SKILLS FORM */}
              {activeTab === "skills" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--foreground)]/80">Category Name</label>
                    <input type="text" value={skillCategory} onChange={(e) => setSkillCategory(e.target.value)}
                      disabled={!!editingItem}
                      className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm disabled:opacity-50"
                      placeholder="e.g. Programming, Databases" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--foreground)]/80">Skills (Comma separated list)</label>
                    <textarea value={skillItems} onChange={(e) => setSkillItems(e.target.value)} rows={4}
                      className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm leading-relaxed"
                      placeholder="e.g. HTML, CSS, JavaScript, TypeScript" required />
                  </div>
                </>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[var(--card-border)] bg-[var(--card-bg)] flex justify-end gap-3">
              <button type="button" onClick={closeModal}
                className="bg-[var(--card-bg)] hover:bg-[var(--card-border)] border border-[var(--card-border)] px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer text-[var(--foreground)]">
                Cancel
              </button>
              <button type="submit" disabled={isSaving}
                className="bg-[#FF7F50] hover:bg-[#ff6a35] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50">
                {isSaving ? (
                  <><FaSpinner className="animate-spin" /> Saving...</>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
