"use client";

import { useState, useEffect, useRef } from "react";
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
  FaInfoCircle,
  FaChevronUp,
} from "react-icons/fa";

type Tab = "projects" | "certifications" | "seminars" | "skills" | "profile";

export default function AdminPage() {
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

  // Active Tab
  const [activeTab, setActiveTab] = useState<Tab>("projects");

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
  const [isUploading, setIsUploading] = useState(false);

  // Initialize theme and check session
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsCheckingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
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
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      alert("Profile and Hero section updated successfully!");
      fetchData();
    } catch (err: any) {
      alert("Profile update failed: " + err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1c141d] text-white">
        <FaSpinner className="animate-spin text-4xl text-[#FF7F50]" />
      </div>
    );
  }

  // LOGIN SCREEN
  if (!session) {
    return (
      <div className="admin-page min-h-screen flex items-center justify-center bg-[#1c141d] px-6">
        <div className="max-w-md w-full bg-[#2a2a2a] border border-[#404040] rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[rgba(255,127,80,0.1)] border border-[rgba(255,127,80,0.2)] rounded-full flex items-center justify-center mx-auto mb-4">
              <FaLock className="text-2xl text-[#FF7F50]" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
            <p className="text-[#b0b0b0] text-sm mt-1">Sign in to manage your portfolio</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {authError && (
              <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200 text-sm text-center">
                {authError}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#b0b0b0] tracking-wider uppercase">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b0b0b0]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1c141d] border border-[#404040] rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#FF7F50] transition-colors"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#b0b0b0] tracking-wider uppercase">Password</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b0b0b0]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1c141d] border border-[#404040] rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#FF7F50] transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-[#FF7F50] hover:bg-[#ff6a35] text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <FaSpinner className="animate-spin" /> Checking...
                </>
              ) : (
                "Log In"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // DASHBOARD SCREEN
  return (
    <div className="admin-page min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col transition-colors duration-300">
      {/* Dashboard Custom Header */}
      <header className="bg-[var(--navbar)] border-b border-[var(--card-border)] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="bg-[#FF7F50] text-[#1c141d] font-black px-3 py-1.5 rounded-lg text-sm tracking-tighter shadow-md">
            CDC
          </span>
          <span className="font-bold text-lg hidden sm:inline">Portfolio Editor</span>
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 text-xs bg-[var(--card-bg)] hover:bg-[var(--card-border)] px-3 py-1.5 rounded-lg border border-[var(--card-border)] transition-colors ml-4 text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <FaEye /> Live View
          </a>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center w-9 h-9"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <FaSun size={14} className="text-[#FF7F50]" /> : <FaMoon size={14} />}
          </button>

          {/* Mobile-Only Logout Icon */}
          <button
            onClick={handleLogout}
            className="md:hidden flex items-center justify-center text-red-400 hover:text-red-300 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl w-9 h-9 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Logout"
          >
            <FaSignOutAlt size={14} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-[var(--card-bg)]/20 border-r border-[var(--card-border)] p-4 flex flex-row md:flex-col justify-between md:justify-start gap-4 overflow-x-auto md:overflow-x-visible">
          {/* Sidebar Nav Tabs */}
          <div className="flex flex-row md:flex-col gap-2 flex-1">
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-[#FF7F50] text-white shadow-lg"
                      : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)]"
                  }`}
                >
                  <Icon className="text-lg" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* User Card Profile Widget */}
          <div className="hidden md:block mt-auto pt-4 border-t border-[var(--card-border)] relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[var(--card-bg)] border border-transparent hover:border-[var(--card-border)] transition-all cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                {/* Initials Avatar */}
                <div className="w-10 h-10 rounded-full bg-[rgba(255,127,80,0.15)] border border-[rgba(255,127,80,0.3)] text-[#FF7F50] flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {profName ? profName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "AD"}
                </div>
                {/* Profile Text */}
                <div className="truncate w-32">
                  <h4 className="text-sm font-bold text-[var(--foreground)] truncate">
                    {profName || "Admin User"}
                  </h4>
                  <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider">
                    Super Admin
                  </p>
                </div>
              </div>
              <FaChevronUp className={`text-[var(--muted)] text-xs transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {/* User card popup menu */}
            {isUserMenuOpen && (
              <div className="absolute bottom-16 left-0 right-0 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-2 shadow-2xl z-20 flex flex-col gap-1 w-full animate-fade-in">
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

        {/* Content Panel */}
        <main className="flex-1 p-6 sm:p-8 md:p-10 max-w-6xl mx-auto w-full">
          {/* Tab Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-[var(--card-border)]">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-wider text-[var(--foreground)]">
                {activeTab === "profile" ? "Hero & Bio Settings" : `Manage ${activeTab}`}
              </h1>
              <p className="text-[var(--muted)] text-sm mt-1">
                {activeTab === "profile" 
                  ? "Configure your personal information, hero titles, descriptions, and dynamic image."
                  : `Add, update, or remove your portfolio's ${activeTab} dynamic entries.`
                }
              </p>
            </div>

            {activeTab !== "profile" && (
              <button
                onClick={() => openModal()}
                className="flex items-center gap-2 bg-[#FF7F50] hover:bg-[#ff6a35] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
              >
                <FaPlus /> Add New Entry
              </button>
            )}
          </div>

          {/* Loader */}
          {isLoadingData ? (
            <div className="h-64 flex items-center justify-center">
              <FaSpinner className="animate-spin text-3xl text-[#FF7F50]" />
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* PROFILE SETTINGS TAB VIEW */}
              {activeTab === "profile" && (
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 shadow-xl">
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Full Name</label>
                        <input
                          type="text"
                          value={profName}
                          onChange={(e) => setProfName(e.target.value)}
                          className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-3 px-4 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm transition-all"
                          placeholder="e.g. Christian Dela Cruz"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Hero Title / Role</label>
                        <input
                          type="text"
                          value={profTitle}
                          onChange={(e) => setProfTitle(e.target.value)}
                          className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-3 px-4 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm transition-all"
                          placeholder="e.g. Information Technology Specialist"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Hero Biography Description</label>
                      <textarea
                        value={profDesc}
                        onChange={(e) => setProfDesc(e.target.value)}
                        rows={4}
                        className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-3 px-4 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm transition-all leading-relaxed"
                        placeholder="Explain who you are and your fields of expertise..."
                        required
                      />
                    </div>

                    {/* Hero Profile Image Upload */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider block">Hero Profile Image</label>
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
                            <input
                              type="text"
                              placeholder="Paste picture URL or upload a file"
                              value={profImageUrl}
                              onChange={(e) => setProfImageUrl(e.target.value)}
                              className="flex-1 bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => profileImageInputRef.current?.click()}
                              disabled={isUploading}
                              className="bg-[var(--card-bg)] hover:bg-[var(--card-border)] border border-[var(--card-border)] px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50 text-[var(--foreground)]"
                            >
                              {isUploading ? <FaSpinner className="animate-spin" /> : <FaUpload />} Upload
                            </button>
                          </div>
                          <input
                            type="file"
                            ref={profileImageInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, setProfImageUrl)}
                          />
                          <p className="text-[var(--muted)] text-[10px] flex items-center gap-1.5">
                            <FaInfoCircle /> Drag-and-drop support: Files are uploaded directly to your Supabase cloud Storage bucket.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Resume PDF Upload */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider block">Resume Document (PDF)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Paste PDF link or upload a file"
                          value={profResumeUrl}
                          onChange={(e) => setProfResumeUrl(e.target.value)}
                          className="flex-1 bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => resumeInputRef.current?.click()}
                          disabled={isUploading}
                          className="bg-[var(--card-bg)] hover:bg-[var(--card-border)] border border-[var(--card-border)] px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50 text-[var(--foreground)]"
                        >
                          {isUploading ? <FaSpinner className="animate-spin" /> : <FaUpload />} Upload
                        </button>
                      </div>
                      <input
                        type="file"
                        ref={resumeInputRef}
                        className="hidden"
                        accept="application/pdf"
                        onChange={(e) => handleImageUpload(e, setProfResumeUrl)}
                      />
                    </div>

                    <div className="flex justify-end pt-4 border-t border-[var(--card-border)]">
                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="bg-[#FF7F50] hover:bg-[#ff6a35] text-white px-8 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg disabled:opacity-50 flex items-center gap-2"
                      >
                        {isSavingProfile ? <FaSpinner className="animate-spin" /> : "Save Profile Settings"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* DYNAMIC LIST TABLES FOR OTHER TABS */}
              {activeTab !== "profile" && (
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl overflow-hidden shadow-xl">
                  {activeTab === "projects" && (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b border-[var(--card-border)] bg-[var(--background)]/50 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Tech Stack</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--card-border)] text-sm">
                          {projects.map((proj) => (
                            <tr key={proj.id} className="hover:bg-[var(--background)]/20 transition-colors">
                              <td className="px-6 py-4 font-semibold text-[var(--foreground)]">{proj.title}</td>
                              <td className="px-6 py-4">
                                <span
                                  className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                                  style={{
                                    color:
                                      proj.status === "completed"
                                        ? "#22c55e"
                                        : proj.status === "in-progress"
                                        ? "#f59e0b"
                                        : "#9ca3af",
                                    backgroundColor:
                                      proj.status === "completed"
                                        ? "rgba(34,197,94,0.1)"
                                        : proj.status === "in-progress"
                                        ? "rgba(245,158,11,0.1)"
                                        : "rgba(156,163,175,0.1)",
                                    borderColor:
                                      proj.status === "completed"
                                        ? "rgba(34,197,94,0.2)"
                                        : proj.status === "in-progress"
                                        ? "rgba(245,158,11,0.2)"
                                        : "rgba(156,163,175,0.2)",
                                  }}
                                >
                                  {proj.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-[var(--muted)]">
                                {proj.tech?.slice(0, 3).join(", ")}
                                {proj.tech?.length > 3 && "..."}
                              </td>
                              <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                <button
                                  onClick={() => openModal(proj)}
                                  className="p-2 text-blue-400 hover:bg-[var(--background)]/40 rounded-lg transition-colors cursor-pointer"
                                  title="Edit"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => handleDelete(proj.id)}
                                  className="p-2 text-red-400 hover:bg-[var(--background)]/40 rounded-lg transition-colors cursor-pointer"
                                  title="Delete"
                                >
                                  <FaTrash />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {projects.length === 0 && (
                            <tr>
                              <td colSpan={4} className="text-center py-12 text-[var(--muted)]">
                                No projects found. Add one to get started!
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeTab === "certifications" && (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b border-[var(--card-border)] bg-[var(--background)]/50 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                            <th className="px-6 py-4">Badge</th>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Issuer</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--card-border)] text-sm">
                          {certifications.map((cert) => (
                            <tr key={cert.id} className="hover:bg-[var(--background)]/20 transition-colors">
                              <td className="px-6 py-4">
                                {cert.badge_url ? (
                                  <img
                                    src={cert.badge_url}
                                    alt={cert.name}
                                    className="w-10 h-10 object-contain rounded-md border border-[var(--card-border)] p-0.5 bg-[var(--background)]"
                                  />
                                ) : (
                                  <span className="text-xs text-[var(--muted)]">No image</span>
                                )}
                              </td>
                              <td className="px-6 py-4 font-semibold text-[var(--foreground)]">{cert.name}</td>
                              <td className="px-6 py-4 text-[var(--muted)]">{cert.issuer}</td>
                              <td className="px-6 py-4 text-[var(--muted)]">{cert.date}</td>
                              <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                <button
                                  onClick={() => openModal(cert)}
                                  className="p-2 text-blue-400 hover:bg-[var(--background)]/40 rounded-lg transition-colors cursor-pointer"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => handleDelete(cert.id)}
                                  className="p-2 text-red-400 hover:bg-[var(--background)]/40 rounded-lg transition-colors cursor-pointer"
                                >
                                  <FaTrash />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {certifications.length === 0 && (
                            <tr>
                              <td colSpan={5} className="text-center py-12 text-[var(--muted)]">
                                No certifications found. Add one to get started!
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeTab === "seminars" && (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b border-[var(--card-border)] bg-[var(--background)]/50 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                            <th className="px-6 py-4">Image</th>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4">Organizer</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--card-border)] text-sm">
                          {seminars.map((sem) => (
                            <tr key={sem.id} className="hover:bg-[var(--background)]/20 transition-colors">
                              <td className="px-6 py-4">
                                {sem.image_url ? (
                                  <img
                                    src={sem.image_url}
                                    alt={sem.title}
                                    className="w-16 h-10 object-cover rounded-md border border-[var(--card-border)]"
                                  />
                                ) : (
                                  <span className="text-xs text-[var(--muted)]">No image</span>
                                )}
                              </td>
                              <td className="px-6 py-4 font-semibold text-[var(--foreground)]">{sem.title}</td>
                              <td className="px-6 py-4 text-[var(--muted)]">{sem.organizer}</td>
                              <td className="px-6 py-4 text-[var(--muted)]">{sem.date}</td>
                              <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                <button
                                  onClick={() => openModal(sem)}
                                  className="p-2 text-blue-400 hover:bg-[var(--background)]/40 rounded-lg transition-colors cursor-pointer"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => handleDelete(sem.id)}
                                  className="p-2 text-red-400 hover:bg-[var(--background)]/40 rounded-lg transition-colors cursor-pointer"
                                >
                                  <FaTrash />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {seminars.length === 0 && (
                            <tr>
                              <td colSpan={5} className="text-center py-12 text-[var(--muted)]">
                                No seminars found. Add one to get started!
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeTab === "skills" && (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b border-[var(--card-border)] bg-[var(--background)]/50 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Skills</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--card-border)] text-sm">
                          {skills.map((sk) => (
                            <tr key={sk.id} className="hover:bg-[var(--background)]/20 transition-colors">
                              <td className="px-6 py-4 font-semibold text-[var(--foreground)] whitespace-nowrap">
                                {sk.category}
                              </td>
                              <td className="px-6 py-4 text-[var(--muted)]">
                                {sk.items?.join(", ")}
                              </td>
                              <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                <button
                                  onClick={() => openModal(sk)}
                                  className="p-2 text-blue-400 hover:bg-[var(--background)]/40 rounded-lg transition-colors cursor-pointer"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => handleDelete(sk.id)}
                                  className="p-2 text-red-400 hover:bg-[var(--background)]/40 rounded-lg transition-colors cursor-pointer"
                                >
                                  <FaTrash />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {skills.length === 0 && (
                            <tr>
                              <td colSpan={3} className="text-center py-12 text-[var(--muted)]">
                                No skill categories found. Add one!
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* CRUD EDITOR DRAWER (ONLY FOR PROJECTS, CERTS, SEMINARS, SKILLS) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop (closes drawer when clicked) */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
            onClick={closeModal}
          />

          {/* Drawer Form Panel */}
          <form
            onSubmit={handleSave}
            className="relative w-full max-w-xl bg-[var(--card-bg)] border-l border-[var(--card-border)] h-full shadow-2xl flex flex-col z-10 animate-slide-in-right text-left"
          >
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-[var(--card-border)] flex items-center justify-between bg-[var(--card-bg)]">
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                {editingItem ? "Edit" : "Add New"} {activeTab.slice(0, -1)}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-[var(--muted)] hover:text-[var(--foreground)] text-lg p-2 rounded-lg cursor-pointer transition-colors hover:bg-[var(--background)] flex items-center justify-center"
              >
                <FaTimes />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[var(--card-bg)]">
              {/* PROJECTS FORM */}
              {activeTab === "projects" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Project Title</label>
                      <input
                        type="text"
                        value={projTitle}
                        onChange={(e) => setProjTitle(e.target.value)}
                        className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm"
                        placeholder="My Awesome App"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Status</label>
                      <select
                        value={projStatus}
                        onChange={(e: any) => setProjStatus(e.target.value)}
                        className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm"
                      >
                        <option value="completed">Completed</option>
                        <option value="in-progress">In Progress</option>
                        <option value="planned">Planned</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Description</label>
                    <textarea
                      value={projDesc}
                      onChange={(e) => setProjDesc(e.target.value)}
                      rows={3}
                      className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm leading-relaxed"
                      placeholder="Enter a brief project description"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                      Bullets Achievements (One item per line)
                    </label>
                    <textarea
                      value={projBullets}
                      onChange={(e) => setProjBullets(e.target.value)}
                      rows={4}
                      className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm leading-relaxed"
                      placeholder="Bullet point 1&#10;Bullet point 2&#10;Bullet point 3"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                        Tech Stack (Comma separated)
                      </label>
                      <input
                        type="text"
                        value={projTech}
                        onChange={(e) => setProjTech(e.target.value)}
                        className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm"
                        placeholder="React, Next.js, Tailwind, Supabase"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Duration</label>
                      <input
                        type="text"
                        value={projDuration}
                        onChange={(e) => setProjDuration(e.target.value)}
                        className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm"
                        placeholder="Sept 2025 - Dec 2025"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">GitHub URL</label>
                    <input
                      type="text"
                      value={projGithub}
                      onChange={(e) => setProjGithub(e.target.value)}
                      className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm"
                      placeholder="https://github.com/username/project"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider block">Screenshots</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Paste image URL or upload one"
                        value={projScreenshots.join(", ")}
                        onChange={(e) =>
                          setProjScreenshots(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))
                        }
                        className="flex-1 bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="bg-[var(--card-bg)] hover:bg-[var(--card-border)] border border-[var(--card-border)] px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50 text-[var(--foreground)]"
                      >
                        {isUploading ? <FaSpinner className="animate-spin" /> : <FaUpload />} Upload
                      </button>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageUpload(e, (url) => setProjScreenshots((prev) => [...prev, url]))
                      }
                    />
                    {projScreenshots.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {projScreenshots.map((url, idx) => (
                          <div key={idx} className="relative group rounded-md overflow-hidden border border-[var(--card-border)]">
                            <img src={url} alt="Screenshot preview" className="w-20 h-12 object-cover" />
                            <button
                              type="button"
                              onClick={() => setProjScreenshots((prev) => prev.filter((_, i) => i !== idx))}
                              className="absolute top-0 right-0 bg-red-600 text-white rounded-bl-md p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs"
                            >
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
                    <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Certification Name</label>
                    <input
                      type="text"
                      value={certName}
                      onChange={(e) => setCertName(e.target.value)}
                      className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm"
                      placeholder="e.g. AWS Certified Solutions Architect"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Issuer</label>
                      <input
                        type="text"
                        value={certIssuer}
                        onChange={(e) => setCertIssuer(e.target.value)}
                        className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm"
                        placeholder="e.g. Amazon Web Services"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Date Earned</label>
                      <input
                        type="text"
                        value={certDate}
                        onChange={(e) => setCertDate(e.target.value)}
                        className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm"
                        placeholder="e.g. October 2025"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider block">Badge Image</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Paste image URL or upload one"
                        value={certBadgeUrl}
                        onChange={(e) => setCertBadgeUrl(e.target.value)}
                        className="flex-1 bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="bg-[var(--card-bg)] hover:bg-[var(--card-border)] border border-[var(--card-border)] px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50 text-[var(--foreground)]"
                      >
                        {isUploading ? <FaSpinner className="animate-spin" /> : <FaUpload />} Upload
                      </button>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, setCertBadgeUrl)}
                    />
                    {certBadgeUrl && (
                      <div className="mt-2">
                        <img src={certBadgeUrl} alt="Badge Preview" className="w-16 h-16 object-contain rounded-md border border-[var(--card-border)] p-1 bg-[var(--background)]" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Credly URL (Optional)</label>
                    <input
                      type="text"
                      value={certCredlyUrl}
                      onChange={(e) => setCertCredlyUrl(e.target.value)}
                      className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm"
                      placeholder="https://www.credly.com/badges/your-badge"
                    />
                  </div>
                </>
              )}

              {/* SEMINARS FORM */}
              {activeTab === "seminars" && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Seminar Title</label>
                    <input
                      type="text"
                      value={semTitle}
                      onChange={(e) => setSemTitle(e.target.value)}
                      className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm"
                      placeholder="e.g. Introduction to Generative AI"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Organizer</label>
                      <input
                        type="text"
                        value={semOrganizer}
                        onChange={(e) => setSemOrganizer(e.target.value)}
                        className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm"
                        placeholder="e.g. Google Cloud Developer Group"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Date</label>
                      <input
                        type="text"
                        value={semDate}
                        onChange={(e) => setSemDate(e.target.value)}
                        className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm"
                        placeholder="e.g. June 26, 2026"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider block">Seminar Certificate/Image</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Paste image URL or upload one"
                        value={semImageUrl}
                        onChange={(e) => setSemImageUrl(e.target.value)}
                        className="flex-1 bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="bg-[var(--card-bg)] hover:bg-[var(--card-border)] border border-[var(--card-border)] px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50 text-[var(--foreground)]"
                      >
                        {isUploading ? <FaSpinner className="animate-spin" /> : <FaUpload />} Upload
                      </button>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, setSemImageUrl)}
                    />
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
                    <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Category Name</label>
                    <input
                      type="text"
                      value={skillCategory}
                      onChange={(e) => setSkillCategory(e.target.value)}
                      disabled={!!editingItem}
                      className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm disabled:opacity-50"
                      placeholder="e.g. Programming, Databases"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                      Skills (Comma separated list)
                    </label>
                    <textarea
                      value={skillItems}
                      onChange={(e) => setSkillItems(e.target.value)}
                      rows={4}
                      className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-xl py-2.5 px-3 text-[var(--foreground)] focus:outline-none focus:border-[#FF7F50] text-sm leading-relaxed"
                      placeholder="e.g. HTML, CSS, JavaScript, TypeScript"
                      required
                    />
                  </div>
                </>
              )}
            </div>

            {/* Sticky Action Footer */}
            <div className="px-6 py-4 border-t border-[var(--card-border)] bg-[var(--card-bg)] flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="bg-[var(--card-bg)] hover:bg-[var(--card-border)] border border-[var(--card-border)] px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer text-[var(--foreground)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="bg-[#FF7F50] hover:bg-[#ff6a35] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <FaSpinner className="animate-spin" /> Saving...
                  </>
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
