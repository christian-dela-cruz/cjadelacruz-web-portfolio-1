"use client";

import Image from "next/image";
import React, { useState, useRef, useEffect, Suspense, lazy, Component } from "react";
import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaDownload,
  FaArrowRight,
  FaGraduationCap,
  FaBriefcase,
  FaCertificate,
  FaCode,
  FaExternalLinkAlt,
  FaImage,
  FaPaperPlane,
  FaContao,
  FaEnvelopeOpen,
  FaPhone,
  FaPhoneSquare,
  FaAddressCard,
  FaChevronLeft,
  FaChevronRight,
  FaChalkboardTeacher,
  FaTimes,
} from "react-icons/fa";
import { SiCredly } from "react-icons/si";
import { HiChip, HiCalendar } from "react-icons/hi";
import { supabase } from "@/lib/supabase";
import { detectWebGL } from "@/lib/webgl";
import { ShaderFallback } from "@/components/ShaderFallback";

const Dithering = typeof window !== "undefined" && detectWebGL()
  ? lazy(() => import("@paper-design/shaders-react").then((mod) => ({ default: mod.Dithering })))
  : () => <div className="absolute inset-0 bg-transparent" />;

class ShaderErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
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

// ─── Data ────────────────────────────────────────────────────────────────────

const socialLinks = [
  {
    icon: FaGithub,
    href: "https://github.com/christian-dela-cruz",
    label: "GitHub",
  },
  {
    icon: FaLinkedin,
    href: "https://www.linkedin.com/in/christian-dela-cruz-629aa6345",
    label: "LinkedIn",
  },
  {
    icon: FaEnvelope,
    href: "mailto:cjadelacruz.it@gmail.com",
    label: "Gmail",
  },
  {
    icon: SiCredly,
    href: "https://www.credly.com/users/christian-joseph-dela-cruz/badges#credly",
    label: "Credly",
  },
];

const initialSkills: Record<string, string[]> = {
  Programming: ["Python", "C#", "Kotlin", "HTML", "TypeScript", "ASP.NET MVC"],
  Networking: [
    "Routing & Switching",
    "Network Infrastructure",
    "IEEE 802.15.4",
  ],
  "Systems & Cloud": [
    "Systems Administration",
    "Oracle VirtualBox",
    "Google Cloud Platform",
    "Windows Server",
    "Red Hat Interprise Linux",
  ],
  Security: ["Kali Linux", "Security Fundamentals", "Ethical Hacking"],
  Databases: ["MySQL", "Oracle"],
  "Tools & Platforms": [
    "Cisco Packet Tracer",
    "Visual Studio Code",
    "Visual Studio",
    "Arduino IDE",
    "Figma",
    "GitHub",
    "Canva",
    "Next.js",
    "XAMPP",
  ],
};

const initialCertifications = [
  {
    name: "CompTIA Tech+",
    issuer: "CompTIA",
    date: "December 2025",
    badge: "/comptia.png",
    credlyUrl:
      "https://www.credly.com/badges/1577cccf-5f34-46bd-8d09-b7e837a28d03/public_url",
  },
  {
    name: "CCNA: Switching, Routing, and Wireless Essentials",
    issuer: "Cisco Networking Academy",
    date: "March 2025",
    badge: "/ccna.png",
    credlyUrl:
      "https://www.credly.com/badges/b78ed2f8-74f1-4fbc-8cb2-a7f622e80ea6/public_url",
  },
  {
    name: "Ethical Hacker",
    issuer: "Cisco Networking Academy",
    date: "March 2025",
    badge: "/ethicalhacker.png",
    credlyUrl:
      "https://www.credly.com/badges/7781dbd5-da20-4852-ab68-84dda25f6895/public_url",
  },
  {
    name: "Google Cloud Computing Foundations",
    issuer: "Google Cloud",
    date: "March 2025",
    badge: "/cgc.png",
    credlyUrl:
      "https://www.credly.com/badges/cffe1fbf-7b99-4b79-a873-03031e7fd62d/public_url",
  },
  {
    name: "TOEIC",
    issuer: "ETS",
    date: "L&R: 940/990 | S: 160 | W: 190",
    badge: "/toeic.jpeg",
    credlyUrl: null,
  },
];

interface Project {
  title: string;
  description: string;
  bullets: string[];
  tech: string[];
  duration?: string;
  github: string; // TODO: Replace placeholder "#" with actual GitHub repository URL
  status: "completed" | "in-progress" | "planned";
  screenshots?: string[];
}

const initialProjects: Project[] = [
  {
    title: "HOPFOG: Multi-Hop Messaging and Communication Application (Mobile)",
    description:
      "A community-based communication solution designed for low-connectivity or disaster-prone environments. Leverages fog computing concepts and a multi-hop mesh architecture.",
    bullets: [
      "Multi-hop communication system utilizing IEEE 802.15.4 standard",
      "Implemented fog computing concepts for localized data processing",
      "Community-based solution for low-connectivity or disaster-prone environments",
    ],
    tech: ["IEEE 802.15.4", "Fog Computing", "Mobile", "Networking", "Kotlin", "Android"],
    duration: "September 2025 – April 2026",
    github: "https://github.com/christian-dela-cruz/HopFogMobile.git",
    status: "completed",
    screenshots: ["/projects/hopfog1.png", "/projects/hopfog2.png"],
  },
  {
    title: "EliteFitness Mobile Application",
    description:
      "A native Android fitness application built with Xamarin.Android (C#) helping users manage and track their fitness journey with real-time data sync.",
    bullets: [
      "Native Android application using Xamarin.Android (C#)",
      "Firebase integration for real-time data storage and sync",
      "User profiles, workout logs, and progress metrics tracking",
    ],
    tech: ["Xamarin.Android", "C#", "Firebase", "Android"],
    github: "#",
    status: "completed",
  },
  {
    title: "MaluPET",
    description:
      "Your Pet's Best Friend — A native Android app for managing your pets and scheduling their care appointments. Helps pet owners keep track of pets and manage feeding, grooming, and veterinary visits.",
    bullets: [
      "Register & Login — Create an account and securely sign in",
      "Manage Pets — Add and view pet profiles (name, type, breed, age)",
      "Schedule Appointments — Track feeding times, grooming dates, and veterinary visits",
    ],
    tech: ["Kotlin", "Jetpack Compose", "Material Design 3", "Ktor Client", "Gradle"],
    github: "https://github.com/christian-dela-cruz/MaluPET",
    status: "completed",
    screenshots: ["/projects/malupet1.png"],
  },
  {
    title: "Darwin's Game",
    description:
      "A C# Windows Forms sidescroller game inspired by the theory of evolution. Guide your character through five stages of life — from a primordial creature all the way to modern humanity — dodging obstacles and surviving each era.",
    bullets: [
      "Side-scrolling game with five evolutionary stages",
      "Built with C# Windows Forms",
      "Dodge obstacles and survive each era of evolution",
    ],
    tech: ["C#", "Windows Forms", ".NET"],
    github: "https://github.com/christian-dela-cruz/Darwins-Game",
    status: "completed",
    screenshots: ["/projects/darwin1.jpeg", "/projects/darwin2.jpeg"],
  },
  {
    title: "Crossroads Coffee House",
    description:
      "A comprehensive UI/UX design project for Crossroads Coffee House, developed as part of a fully documented system development process following the Software Development Life Cycle (SDLC).",
    bullets: [
      "Full UI/UX design following SDLC methodology",
      "Comprehensive documentation at each phase of development",
      "Wireframes, mockups, and prototypes created in Figma",
    ],
    tech: ["UI/UX", "Figma", "SDLC"],
    github: "https://github.com/christian-dela-cruz/Crossroads-Coffee-House",
    status: "completed",
    screenshots: ["/projects/crossroad1.png", "/projects/crossroad2.png"],
  },
  {
    title: "TollGate Web AppLication",
    description:
      "An IoT-based automated toll gate system with a web dashboard for real-time monitoring and manual control.",
    bullets: [
      "IoT-based automated toll gate hardware integration",
      "Web dashboard for real-time monitoring",
      "Manual override and control capabilities",
    ],
    tech: ["C++", "IoT", "Web Dashboard"],
    github: "https://github.com/christian-dela-cruz/TollGate-Web-App",
    status: "completed",
  },
  {
    title: "TriHex Cipher",
    description:
      "A custom symmetric encryption algorithm implemented in Python that combines substitution, transposition, and bit-level transformations for enhanced confusion and diffusion.",
    bullets: [
      "Custom symmetric encryption combining substitution and transposition",
      "Bit-level transformations for enhanced confusion and diffusion",
      "Implemented entirely in Python",
    ],
    tech: ["Python", "Cryptography", "Algorithms"],
    github: "https://github.com/christian-dela-cruz/TriHex-Cipher",
    status: "completed",
    screenshots: ["/projects/trihex1.jpeg", "/projects/trihex2.jpeg"],
  },
];

const statusConfig = {
  completed: {
    label: "Completed",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.2)",
  },
  "in-progress": {
    label: "In Progress",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.2)",
  },
  planned: {
    label: "Planned",
    color: "#9ca3af",
    bg: "rgba(156,163,175,0.1)",
    border: "rgba(156,163,175,0.2)",
  },
};

const initialSeminars = [
  {
    title: "Pathways to Employability: Career Readiness Toolkit",
    organizer: "Mapúa Malayan Colleges Laguna & Arizona State University",
    date: "April 21, 2026",
    image: "https://github.com/user-attachments/assets/bead45aa-3aa9-4650-abf2-145886afe857",
  },
  {
    title: "Technopreneurship: A Journey in Building Your Own Tech Start Up",
    organizer: "CCIS – Mapúa MCL & Prosperna",
    date: "March 7, 2024",
    image: "https://github.com/user-attachments/assets/a435f8ad-382a-4fe0-88de-e5cd85acdff9",
  },
  {
    title: "Architecting the Future with Decentralization: An Introduction to Blockchain",
    organizer: "JPCS Mapúa MCL",
    date: "February 5, 2025",
    image: "https://github.com/user-attachments/assets/7e92d12b-92f8-45a5-87da-86df7e956a60",
  },
];

const initialExperience = [
  {
    title: "Freelance Mobile App Developer",
    company: "EliteFitness",
    duration: "Mar 2025 – Jun 2025",
    hours: null,
    bullets: [
      "Developed a native Android fitness application using Xamarin.Android (C#) to help users manage and track their fitness journey.",
      "Integrated Firebase for real-time data storage and synchronization of user profiles, workout logs, and progress metrics.",
      "Designed and implemented a user-friendly interface for managing fitness schedules, tracking progress, and setting personal goals."
    ],
    tech: ["Xamarin.Android", "C#", "Firebase", "Android"]
  },
  {
    title: "Software Developer",
    company: "The Bellevue Manila",
    duration: "April 2026 – July 2026",
    hours: "486 Hours",
    bullets: [
      "Assisted in the development and maintenance of internal web-based systems used by hotel staff and management.",
      "Collaborated with the IT department to troubleshoot software issues and implement minor feature enhancements.",
      "Documented technical processes and supported data management tasks across hotel operations."
    ],
    tech: []
  }
];

const initialEducation = [
  {
    degree: "Bachelor of Science in Information Technology",
    specialization: "Cybersecurity Specialization",
    school: "Mapúa Malayan Colleges Laguna",
    duration: "2022 – Present",
    description: "Currently enrolled. Gained strong fundamentals in cybersecurity, networking, software engineering, cloud infrastructure, and full-stack development. Active in hands-on projects including multi-hop mesh networking systems, mobile app development, and ethical hacking implementations.",
    honors: "🏅 Dean's Lister: T1 & T3 (AY 2022–2023), T1 (AY 2024–2025)"
  }
];

const contactInfo = [
  {
    icon: FaGithub,
    label: "GitHub",
    href: "https://github.com/christian-dela-cruz",
    display: "github.com/christian-dela-cruz",
  },
  {
    icon: FaLinkedin,
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/christian-dela-cruz-629aa6345",
    display: "linkedin.com/in/christian-dela-cruz-629aa6345",
  },
  {
    icon: FaEnvelope,
    label: "Gmail",
    href: "mailto:cjadelacruz.it@gmail.com",
    display: "cjadelacruz.it@gmail.com",
  },
  {
    icon: SiCredly,
    label: "Credly",
    href: "https://www.credly.com/users/christian-joseph-dela-cruz/badges#credly",
    display: "credly.com/users/christian-joseph-dela-cruz",
  },
];

// ─── Shared style helpers ─────────────────────────────────────────────────────

const accentBg = "rgba(6,182,212,0.1)";
const accentBorder = "rgba(6,182,212,0.2)";
const accentBgMd = "rgba(6,182,212,0.15)";

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PortfolioClientProps {
  databaseProfile: any;
  databaseSkills: any;
  databaseProjects: any;
  databaseCertifications: any;
  databaseSeminars: any;
  databaseExperience: any;
  databaseEducation: any;
}

export default function PortfolioClient({
  databaseProfile,
  databaseSkills,
  databaseProjects,
  databaseCertifications,
  databaseSeminars,
  databaseExperience,
  databaseEducation
}: PortfolioClientProps) {
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

  const certScrollRef = useRef<HTMLDivElement>(null);
  
  // Dynamic State variables initialized with server-fetched database data or local seed fallbacks
  const [skills, setSkills] = useState<Record<string, string[]>>(() => {
    if (databaseSkills && databaseSkills.length > 0) {
      const skillsObj: Record<string, string[]> = {};
      databaseSkills.forEach((s: any) => {
        skillsObj[s.category] = s.items;
      });
      return skillsObj;
    }
    return initialSkills;
  });

  const [certifications, setCertifications] = useState<any[]>(() => {
    if (databaseCertifications && databaseCertifications.length > 0) {
      return databaseCertifications.map((c: any) => ({
        name: c.name,
        issuer: c.issuer,
        date: c.date,
        badge: c.badge_url || "/placeholder.png",
        credlyUrl: c.credly_url,
      }));
    }
    return initialCertifications;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    if (databaseProjects && databaseProjects.length > 0) {
      return databaseProjects.map((p: any) => ({
        title: p.title,
        description: p.description,
        bullets: p.bullets || [],
        tech: p.tech || [],
        duration: p.duration,
        github: p.github,
        status: p.status,
        screenshots: p.screenshots || [],
      }));
    }
    return initialProjects;
  });

  const [seminars, setSeminars] = useState<any[]>(() => {
    if (databaseSeminars && databaseSeminars.length > 0) {
      return databaseSeminars.map((s: any) => ({
        title: s.title,
        organizer: s.organizer,
        date: s.date,
        image: s.image_url || "/placeholder.png",
      }));
    }
    return initialSeminars;
  });

  const [experience, setExperience] = useState<any[]>(() => {
    if (databaseExperience && databaseExperience.length > 0) {
      return databaseExperience.map((exp: any) => ({
        id: exp.id,
        title: exp.title,
        company: exp.company,
        duration: exp.duration,
        hours: exp.hours,
        bullets: exp.bullets || [],
        tech: exp.tech || []
      }));
    }
    return initialExperience;
  });

  const [education, setEducation] = useState<any[]>(() => {
    if (databaseEducation && databaseEducation.length > 0) {
      return databaseEducation.map((edu: any) => ({
        id: edu.id,
        degree: edu.degree,
        specialization: edu.specialization,
        school: edu.school,
        duration: edu.duration,
        description: edu.description,
        honors: edu.honors
      }));
    }
    return initialEducation;
  });

  const [profile, setProfile] = useState<any>(() => {
    if (databaseProfile) {
      return {
        name: databaseProfile.name || "Christian Dela Cruz",
        title: databaseProfile.title || "Information Technology & Cybersecurity Specialist",
        description: databaseProfile.description || "",
        profile_image_url: databaseProfile.profile_image_url || "/Formal_Picture.jpg",
        resume_url: databaseProfile.resume_url || "/resume.pdf"
      };
    }
    return {
      name: "Christian Dela Cruz",
      title: "Information Technology & Cybersecurity Specialist",
      description: "Full-stack developer with expertise in mobile app development, networking, and cloud infrastructure. Passionate about building secure, scalable, and user-centric solutions.",
      profile_image_url: "/Formal_Picture.jpg",
      resume_url: "/resume.pdf"
    };
  });

  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const [hoveredEntry, setHoveredEntry] = useState<string | null>(null);
  const [projectPage, setProjectPage] = useState(0);
  const [selectedSeminar, setSelectedSeminar] = useState<(typeof initialSeminars)[number] | null>(null);
  const [slideshowIdx, setSlideshowIdx] = useState(0);
  const slideshowIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const [isCTAHovered, setIsCTAHovered] = useState(false);

  const startSlideshow = (screenshots: string[]) => {
    setSlideshowIdx(0);
    if (screenshots.length > 1) {
      slideshowIntervalRef.current = setInterval(() => {
        setSlideshowIdx((i) => (i + 1) % screenshots.length);
      }, 2200);
    }
  };

  const stopSlideshow = () => {
    if (slideshowIntervalRef.current) {
      clearInterval(slideshowIntervalRef.current);
      slideshowIntervalRef.current = null;
    }
    setSlideshowIdx(0);
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (slideshowIntervalRef.current) {
        clearInterval(slideshowIntervalRef.current);
      }
    };
  }, []);

  const scrollCerts = (dir: "left" | "right") => {
    certScrollRef.current?.scrollBy({ left: dir === "left" ? -275 : 275, behavior: "smooth" });
  };

  return (
    <div style={{ background: "var(--background)" }}>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section
        id="home"
        className="min-h-screen flex items-center justify-center px-6 pt-28 pb-20 scroll-mt-24 relative overflow-hidden pulsing-gradient-bg"
        onMouseEnter={() => setIsHeroHovered(true)}
        onMouseLeave={() => setIsHeroHovered(false)}
      >
        {/* WebGL Shader Dithering Background */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-25 dark:opacity-20 mix-blend-normal transition-opacity duration-500">
          {!shaderError && isWebGLSupported ? (
            <ShaderErrorBoundary>
              <Suspense fallback={<div className="absolute inset-0 bg-transparent" />}>
                <Dithering
                  colorBack="#00000000" // Transparent background
                  colorFront="#FF7F50"  // Accent Coral color
                  shape="warp"
                  type="4x4"
                  speed={isHeroHovered ? 0.5 : 0.15}
                  className="size-full"
                  minPixelRatio={1}
                />
              </Suspense>
            </ShaderErrorBoundary>
          ) : (
            <ShaderFallback color="#FF7F50" speed={isHeroHovered ? 0.5 : 0.15} />
          )}
        </div>

        <div className="max-w-6xl w-full mx-auto relative z-10">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-16">
            {/* Text */}
            <div className="flex-1 text-center lg:text-left">

              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight"
                style={{ color: "var(--foreground)" }}
              >
                {profile.name.split(" ")[0]}{" "}
                <span style={{ color: "var(--accent)" }}>
                  {profile.name.split(" ").slice(1).join(" ")}
                </span>
              </h1>

              <h2
                className="text-lg sm:text-xl font-semibold mb-4"
                style={{ color: "var(--foreground)" }}
              >
                {profile.title}
              </h2>

              <p
                className="text-base leading-relaxed max-w-xl mx-auto lg:mx-0 mb-10"
                style={{ color: "var(--foreground)" }}
              >
                {profile.description}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10">
                <a
                  href="#projects"
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById("projects")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95"
                  style={{ background: "var(--accent)", color: "#fff" }}
                >
                  View My Work
                  <FaArrowRight size={14} />
                </a>

                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById("contact")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: "var(--card-bg)",
                    color: "var(--foreground)",
                    border: "1px solid var(--card-border)",
                  }}
                >
                    <FaEnvelope size={13} />
                  Contact Me
                </a>

                <a
                  href={profile.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: "var(--card-bg)",
                    color: "var(--foreground)",
                    border: "1px solid var(--card-border)",
                  }}
                >
                  <FaDownload size={13} />
                  View Resume
                </a>
              </div>

              {/* Social icons */}
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith("mailto") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                    style={{
                      background: "var(--card-bg)",
                      color: "var(--muted)",
                      border: "1px solid var(--card-border)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "var(--accent)";
                      (
                        e.currentTarget as HTMLAnchorElement
                      ).style.borderColor = "var(--accent)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "var(--muted)";
                      (
                        e.currentTarget as HTMLAnchorElement
                      ).style.borderColor = "var(--card-border)";
                    }}
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            {/* Profile image */}
            <div className="flex-shrink-0 flex flex-col items-center gap-4 mb-auto">
              <div
                className="relative w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-full overflow-hidden"
                style={{
                  border: "3px solid var(--accent)",
                  boxShadow: "0 0 40px rgba(6,182,212,0.25)",
                }}
              >
                <Image
                  src={profile.profile_image_url}
                  alt={profile.name}
                  fill
                  className="object-cover"
                  priority
                  unoptimized={profile.profile_image_url.startsWith("http")}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ─────────────────────────────────────────────────────────── */}
      <section
        id="about"
        className="py-28 px-6 scroll-mt-16"
        style={{ borderTop: "1px solid var(--card-border)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 text-center">
            <h2
              className="text-4xl sm:text-5xl font-bold mb-4"
              style={{ color: "var(--foreground)" }}
            >
              About <span style={{ color: "var(--accent)" }}>Me</span>
            </h2>
            <p
              className="text-base max-w-xl mx-auto"
              style={{ color: "var(--muted)" }}
            >
              IT professional with a passion for cybersecurity, full-stack
              development, and building meaningful software.
            </p>
          </div>

          <div className="flex flex-col gap-8">

            {/* ── Row 1: Technical Skills ──────────────────────────────────── */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: accentBgMd }}
                >
                  <HiChip size={20} style={{ color: "var(--accent)" }} />
                </div>
                <h3
                  className="font-semibold text-lg"
                  style={{ color: "var(--foreground)" }}
                >
                  Technical Skills
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {Object.entries(skills).map(([category, items]) => (
                  <div key={category} className="flex items-start gap-4">
                    <div className="flex items-center gap-2 w-36 flex-shrink-0 pt-1">
                      <FaCode size={11} style={{ color: "var(--accent)", flexShrink: 0 }} />
                      <h4
                        className="text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "var(--accent)" }}
                      >
                        {category}
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {items.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs px-3 py-1.5 rounded-lg"
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            color: "var(--muted)",
                            border: "1px solid var(--card-border)",
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Row 2: Experience + Education ───────────────────────────── */}
            <div className="grid md:grid-cols-2 gap-8">

              {/* Experience */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: accentBgMd }}
                  >
                    <FaBriefcase size={18} style={{ color: "var(--accent)" }} />
                  </div>
                  <h3
                    className="font-semibold text-lg"
                    style={{ color: "var(--foreground)" }}
                  >
                    Experience
                  </h3>
                </div>

                {/* Timeline */}
                <div className="relative pl-9">
                  {/* Vertical line */}
                  <div
                    className="absolute left-[13px] top-1 bottom-1 w-px"
                    style={{ background: accentBorder }}
                  />

                  {experience.map((exp, index) => (
                    <div
                      key={exp.id || index}
                      className={`relative ${index < experience.length - 1 ? "mb-5" : ""}`}
                      onMouseEnter={() => setHoveredEntry(`exp-${index}`)}
                      onMouseLeave={() => setHoveredEntry(null)}
                    >
                      {/* Dot */}
                      <div
                        className="absolute -left-7 top-3 w-3 h-3 rounded-full transition-all duration-300"
                        style={{
                          background: "var(--accent)",
                          boxShadow: hoveredEntry === `exp-${index}`
                            ? `0 0 0 5px ${accentBg}, 0 0 12px rgba(6,182,212,0.5)`
                            : `0 0 0 3px ${accentBg}`,
                          transform: hoveredEntry === `exp-${index}` ? "scale(1.35)" : "scale(1)",
                        }}
                      />
                      <div
                        className="rounded-xl p-5 transition-all duration-300 hover:-translate-y-1"
                        style={{
                          background: "rgba(6,182,212,0.04)",
                          border: `1px solid ${accentBorder}`,
                          boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent)";
                          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 24px rgba(6,182,212,0.15)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.borderColor = accentBorder;
                          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.15)";
                        }}
                      >
                        <div className="flex flex-col gap-2 mb-4">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <h4
                              className="font-semibold text-sm"
                              style={{ color: "var(--foreground)" }}
                            >
                              {exp.title}
                            </h4>
                            <span
                              className="text-xs px-3 py-1 rounded-full"
                              style={{
                                background: accentBg,
                                color: "var(--accent)",
                                border: `1px solid ${accentBorder}`,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {exp.duration}
                            </span>
                          </div>
                          <p className="text-sm" style={{ color: "var(--accent)" }}>
                            {exp.company}
                          </p>
                          {exp.hours && (
                            <p className="text-xs" style={{ color: "var(--muted)" }}>
                              {exp.hours}
                            </p>
                          )}
                        </div>

                        {exp.bullets && exp.bullets.length > 0 && (
                          <ul className="flex flex-col gap-2">
                            {exp.bullets.map((point: string, i: number) => (
                              <li
                                key={i}
                                className="flex gap-2 text-sm"
                                style={{ color: "var(--muted)" }}
                              >
                                <span
                                  className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                                  style={{ background: "var(--accent)" }}
                                />
                                {point}
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Tech stack badges */}
                        {exp.tech && exp.tech.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4 pt-4" style={{ borderTop: "1px solid var(--card-border)" }}>
                            {exp.tech.map((techItem: string) => (
                              <span
                                key={techItem}
                                className="text-xs px-2.5 py-1 rounded-lg"
                                style={{
                                  background: accentBg,
                                  color: "var(--accent)",
                                  border: `1px solid ${accentBorder}`,
                                }}
                              >
                                {techItem}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {experience.length === 0 && (
                    <div className="text-[var(--muted)] text-sm italic py-4">No experience entries found.</div>
                  )}
                </div>
              </div>

              {/* Education */}
<div>
  <div className="flex items-center gap-3 mb-6">
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center"
      style={{ background: accentBgMd }}
    >
      <FaGraduationCap size={20} style={{ color: "var(--accent)" }} />
    </div>
    <h3
      className="font-semibold text-lg"
      style={{ color: "var(--foreground)" }}
    >
      Education
    </h3>
  </div>

  {/* Timeline */}
  <div className="relative pl-9">
    {/* Vertical line */}
    <div
      className="absolute left-[13px] top-1 bottom-1 w-px"
      style={{ background: accentBorder }}
    />

    {education.map((edu, index) => (
      <div
        key={edu.id || index}
        className={`relative ${index < education.length - 1 ? "mb-5" : ""}`}
        onMouseEnter={() => setHoveredEntry(`edu-${index}`)}
        onMouseLeave={() => setHoveredEntry(null)}
      >
        {/* Dot */}
        <div
          className="absolute -left-7 top-3 w-3 h-3 rounded-full transition-all duration-300"
          style={{
            background: "var(--accent)",
            boxShadow: hoveredEntry === `edu-${index}`
              ? `0 0 0 5px ${accentBg}, 0 0 12px rgba(6,182,212,0.5)`
              : `0 0 0 3px ${accentBg}`,
            transform: hoveredEntry === `edu-${index}` ? "scale(1.35)" : "scale(1)",
          }}
        />
        <div
          className="rounded-xl p-5 transition-all duration-300 hover:-translate-y-1"
          style={{
            background: "rgba(6,182,212,0.04)",
            border: `1px solid ${accentBorder}`,
            boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent)";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 24px rgba(6,182,212,0.15)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = accentBorder;
            (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.15)";
          }}
        >
          <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
            <div className="flex-1">
              <h4
                className="font-semibold text-sm mb-1"
                style={{ color: "var(--foreground)" }}
              >
                {edu.degree}
              </h4>
              {edu.specialization && (
                <p className="text-xs" style={{ color: "var(--foreground)" }}>
                  {edu.specialization}
                </p>
              )}
            </div>
            <span
              className="text-xs px-3 py-1 rounded-full whitespace-nowrap"
              style={{
                background: accentBg,
                color: "var(--accent)",
                border: `1px solid ${accentBorder}`,
              }}
            >
              {edu.duration}
            </span>
          </div>

          <p className="text-sm mb-3" style={{ color: "var(--accent)" }}>
            {edu.school}
          </p>

          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            {edu.description}
          </p>
          {edu.honors && (
            <p className="text-xs mt-3 font-medium" style={{ color: "var(--accent)" }}>
              {edu.honors}
            </p>
          )}
        </div>
      </div>
    ))}
    {education.length === 0 && (
      <div className="text-[var(--muted)] text-sm italic py-4">No education entries found.</div>
    )}
  </div>
</div>
            </div>

            {/* ── Row 3: Certifications ────────────────────────────────────── */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: accentBgMd }}
                >
                  <FaCertificate size={20} style={{ color: "var(--accent)" }} />
                </div>
                <h3
                  className="font-semibold text-lg"
                  style={{ color: "var(--foreground)" }}
                >
                  Certifications
                </h3>
              </div>

              {/* Horizontal scrollable slider with navigation */}
              <div className="relative">
                {/* Gradient fade – left */}
                <div
                  className="pointer-events-none absolute left-0 top-0 bottom-3 w-10 z-10"
                  style={{ background: "linear-gradient(to right, var(--background), transparent)" }}
                />
                {/* Gradient fade – right */}
                <div
                  className="pointer-events-none absolute right-0 top-0 bottom-3 w-10 z-10"
                  style={{ background: "linear-gradient(to left, var(--background), transparent)" }}
                />
                {/* Left arrow */}
                <button
                  onClick={() => scrollCerts("left")}
                  className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                    color: "var(--accent)",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--card-border)";
                  }}
                >
                  <FaChevronLeft size={12} />
                </button>
                {/* Right arrow */}
                <button
                  onClick={() => scrollCerts("right")}
                  className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                    color: "var(--accent)",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--card-border)";
                  }}
                >
                  <FaChevronRight size={12} />
                </button>

                {/* Scrollable track */}
                <div
                  ref={certScrollRef}
                  className="flex gap-5 overflow-x-auto pb-3 px-4 no-scrollbar"
                  style={{ scrollSnapType: "x mandatory" }}
                >
                  {certifications.map((cert) => {
                    const inner = (
                      <>
                        {/* Badge image or placeholder */}
                        <div
                          className="w-32 h-32 rounded-2xl flex items-center justify-center mx-auto mb-5 flex-shrink-0 overflow-hidden"
                          style={{
                            background: cert.badge ? "transparent" : "rgba(6,182,212,0.08)",
                            border: cert.badge ? "none" : "2px dashed rgba(6,182,212,0.3)",
                          }}
                        >
                          {cert.badge ? (
                            <Image
                              src={cert.badge}
                              alt={`${cert.name} badge`}
                              width={128}
                              height={128}
                              className="object-contain"
                            />
                          ) : (
                            <div className="text-center">
                              <FaImage
                                size={28}
                                style={{ color: "var(--accent)", opacity: 0.5, margin: "0 auto 4px" }}
                              />
                              <p className="text-[9px]" style={{ color: "var(--accent)", opacity: 0.6 }}>
                                Badge
                              </p>
                            </div>
                          )}
                        </div>

                        <p
                          className="text-sm font-semibold text-center mb-1.5 leading-snug"
                          style={{ color: "var(--foreground)" }}
                        >
                          {cert.name}
                        </p>
                        <p
                          className="text-xs text-center mb-1"
                          style={{ color: "var(--muted)" }}
                        >
                          {cert.issuer}
                        </p>
                        <p
                          className="text-xs text-center"
                          style={{ color: "var(--accent)" }}
                        >
                          {cert.date}
                        </p>
                        {cert.credlyUrl && (
                          <div className="flex justify-center mt-3">
                          </div>
                        )}
                      </>
                    );

                    return cert.credlyUrl ? (
                      <a
                        key={cert.name}
                        href={cert.credlyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 flex flex-col p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1"
                        style={{
                          width: 255,
                          scrollSnapAlign: "start",
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid var(--card-border)",
                          textDecoration: "none",
                          boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--accent)";
                          (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 28px rgba(6,182,212,0.18)";
                          (e.currentTarget as HTMLAnchorElement).style.background = "rgba(6,182,212,0.05)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--card-border)";
                          (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.15)";
                          (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.02)";
                        }}
                      >
                        {inner}
                      </a>
                    ) : (
                      <div
                        key={cert.name}
                        className="flex-shrink-0 flex flex-col p-6 rounded-2xl"
                        style={{
                          width: 255,
                          scrollSnapAlign: "start",
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid var(--card-border)",
                          boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                        }}
                      >
                        {inner}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Row 4: Seminars Attended ──────────────────────────────────── */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: accentBgMd }}
                >
                  <FaChalkboardTeacher size={20} style={{ color: "var(--accent)" }} />
                </div>
                <h3
                  className="font-semibold text-lg"
                  style={{ color: "var(--foreground)" }}
                >
                  Seminars Attended
                </h3>
              </div>

              {/* Grid layout – no scroll needed */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {seminars.map((seminar) => (
                    <button
                      key={seminar.title}
                      onClick={() => setSelectedSeminar(seminar)}
                      className="flex flex-col rounded-2xl transition-all duration-300 hover:-translate-y-1 text-left cursor-pointer overflow-hidden w-full"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid var(--card-border)",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 28px rgba(6,182,212,0.18)";
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(6,182,212,0.05)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--card-border)";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.15)";
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.02)";
                      }}
                    >
                      {/* Certificate thumbnail */}
                      <div className="w-full h-48 overflow-hidden relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={seminar.image}
                          alt={seminar.title}
                          className="w-full h-full object-cover"
                        />
                        <div
                          className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200"
                          style={{ background: "rgba(6,182,212,0.15)" }}
                        >
                          <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "var(--accent)", color: "#fff" }}>
                            Click to expand
                          </span>
                        </div>
                      </div>
                      {/* Info */}
                      <div className="p-5 flex flex-col gap-1.5">
                        <p
                          className="text-sm font-semibold leading-snug"
                          style={{ color: "var(--foreground)" }}
                        >
                          {seminar.title}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--muted)" }}
                        >
                          {seminar.organizer}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--accent)" }}
                        >
                          {seminar.date}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SEMINAR LIGHTBOX ──────────────────────────────────────────────── */}
      {selectedSeminar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setSelectedSeminar(null)}
        >
          <div
            className="relative max-w-4xl w-full rounded-2xl overflow-hidden"
            style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedSeminar(null)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: "rgba(0,0,0,0.6)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              <FaTimes size={14} />
            </button>
            {/* Full image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedSeminar.image}
              alt={selectedSeminar.title}
              className="w-full h-auto"
            />
            {/* Caption */}
            <div className="p-4">
              <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
                {selectedSeminar.title}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                {selectedSeminar.organizer} · {selectedSeminar.date}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── PROJECTS ──────────────────────────────────────────────────────── */}
      <section
        id="projects"
        className="py-24 px-6 scroll-mt-16"
        style={{ borderTop: "1px solid var(--card-border)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-14 text-center">
            <h2
              className="text-4xl sm:text-5xl font-bold mb-4"
              style={{ color: "var(--foreground)" }}
            >
              My <span style={{ color: "var(--accent)" }}>Projects</span>
            </h2>
            <p
              className="text-base max-w-xl mx-auto"
              style={{ color: "var(--muted)" }}
            >
              A showcase of selected work spanning mobile development,
              networking, and software engineering.
            </p>
          </div>

          {(() => {
            const projectsPerPage = 4;
            const totalPages = Math.ceil(projects.length / projectsPerPage);
            const pageProjects = projects.slice(
              projectPage * projectsPerPage,
              projectPage * projectsPerPage + projectsPerPage
            );
            return (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pageProjects.map((project, idx) => {
                    const globalIdx = projectPage * projectsPerPage + idx;
                    const status = statusConfig[project.status];
                    const hasLink = project.github && project.github !== "#";
                    const isHovered = hoveredProject === globalIdx;
                    return (
                      <article
                        key={globalIdx}
                        className="rounded-2xl overflow-hidden transition-all duration-300"
                        style={{
                          background: "var(--card-bg)",
                          border: "1px solid var(--card-border)",
                          boxShadow: isHovered ? "0 8px 32px rgba(6,182,212,0.15)" : "0 4px 24px rgba(0,0,0,0.3)",
                          transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                          borderColor: isHovered ? "var(--accent)" : "var(--card-border)",
                        }}
                        onMouseEnter={() => {
                          setHoveredProject(globalIdx);
                          if (project.screenshots && project.screenshots.length > 0) {
                            startSlideshow(project.screenshots);
                          }
                        }}
                        onMouseLeave={() => {
                          setHoveredProject(null);
                          stopSlideshow();
                        }}
                      >
                        {/* Screenshot area */}
                        <div
                          className="h-68 relative flex items-center justify-center overflow-hidden"
                          style={{
                            background:
                              "linear-gradient(135deg, #0d1625 0%, #0a1c30 100%)",
                            borderBottom: "1px solid var(--card-border)",
                          }}
                        >
                          {project.screenshots && project.screenshots.length > 0 ? (
                            <>
                              {project.screenshots.map((src, sIdx) => (
                                <Image
                                  key={src}
                                  src={src}
                                  alt={`${project.title} screenshot ${sIdx + 1}`}
                                  fill
                                  className="object-cover transition-opacity duration-500"
                                  style={{ opacity: slideshowIdx === sIdx ? 1 : 0, objectPosition: "fit" }}
                                  sizes="(max-width: 768px) 100vw, 50vw"
                                />
                              ))}
                            </>
                          ) : (
                            <div className="text-center">
                              <FaImage
                                size={30}
                                style={{
                                  color: "var(--muted)",
                                  margin: "0 auto 8px",
                                  opacity: 0.4,
                                }}
                              />
                              <p
                                className="text-xs font-medium"
                                style={{ color: "var(--muted)", opacity: 0.5 }}
                              >
                                Project Screenshot
                              </p>
                            </div>
                          )}
                          {/* Status badge overlay */}
                          <span
                            className="absolute top-3 right-3 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1.5"
                            style={{
                              color: status.color,
                              background: status.bg,
                              border: `1px solid ${status.border}`,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: status.color }}
                            />
                            {status.label}
                          </span>
                          {/* GitHub link overlay — visible on hover */}
                          <a
                            href={hasLink ? project.github : undefined}
                            target={hasLink ? "_blank" : undefined}
                            rel="noopener noreferrer"
                            aria-disabled={!hasLink}
                            onClick={(e) => { if (!hasLink) e.preventDefault(); }}
                            className="absolute bottom-3 left-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold"
                            style={{
                              background: "rgba(0,0,0,0.65)",
                              color: "var(--accent)",
                              border: `1px solid ${accentBorder}`,
                              backdropFilter: "blur(4px)",
                              cursor: hasLink ? "pointer" : "default",
                              pointerEvents: isHovered ? "auto" : "none",
                              opacity: isHovered ? 1 : 0,
                              transform: isHovered ? "translateY(0)" : "translateY(6px)",
                              transition: "opacity 0.2s ease, transform 0.2s ease",
                              textDecoration: "none",
                            }}
                          >
                            <FaGithub size={12} />
                            {hasLink ? "View on GitHub" : "GitHub (link pending)"}
                          </a>
                        </div>

                        <div className="p-5 sm:p-6">
                          <h3
                            className="text-base sm:text-lg font-bold mb-2"
                            style={{ color: "var(--foreground)" }}
                          >
                            {project.title}
                          </h3>

                          <p
                            className="text-sm leading-relaxed mb-4"
                            style={{ color: "var(--muted)" }}
                          >
                            {project.description}
                          </p>

                          {/* Duration */}
                          {project.duration && (
                            <div
                              className="flex items-center gap-2 text-xs mb-4"
                              style={{ color: "var(--muted)" }}
                            >
                              <HiCalendar
                                size={13}
                                style={{ color: "var(--accent)" }}
                              />
                              {project.duration}
                            </div>
                          )}

                          {/* Tech tags */}
                          <div className="flex flex-wrap gap-2">
                            {project.tech.map((t) => (
                              <span
                                key={t}
                                className="text-xs px-2.5 py-1 rounded-lg"
                                style={{
                                  background: accentBg,
                                  color: "var(--accent)",
                                  border: `1px solid ${accentBorder}`,
                                }}
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Pagination controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-10">
                    <button
                      onClick={() => { setProjectPage((p) => Math.max(0, p - 1)); setHoveredProject(null); }}
                      disabled={projectPage === 0}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        background: "var(--card-bg)",
                        border: "1px solid var(--card-border)",
                        color: "var(--foreground)",
                      }}
                      aria-label="Previous page"
                    >
                      <FaChevronLeft size={12} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => { setProjectPage(i); setHoveredProject(null); }}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                        style={{
                          background: projectPage === i ? "var(--accent)" : "var(--card-bg)",
                          border: `1px solid ${projectPage === i ? "var(--accent)" : "var(--card-border)"}`,
                          color: projectPage === i ? "#fff" : "var(--foreground)",
                        }}
                        aria-label={`Page ${i + 1}`}
                        aria-current={projectPage === i ? "page" : undefined}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => { setProjectPage((p) => Math.min(totalPages - 1, p + 1)); setHoveredProject(null); }}
                      disabled={projectPage === totalPages - 1}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        background: "var(--card-bg)",
                        border: "1px solid var(--card-border)",
                        color: "var(--foreground)",
                      }}
                      aria-label="Next page"
                    >
                      <FaChevronRight size={12} />
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </section>

      {/* ── CTA SECTION ────────────────────────────────────────────────────── */}
      <section className="py-12 w-full flex justify-center items-center px-6 md:px-8 relative z-10 max-w-6xl mx-auto">
        <div 
          className="w-full relative"
          onMouseEnter={() => setIsCTAHovered(true)}
          onMouseLeave={() => setIsCTAHovered(false)}
        >
          <div className="relative overflow-hidden rounded-[32px] sm:rounded-[48px] border border-[var(--card-border)] bg-[var(--card-bg)]/30 backdrop-blur-sm shadow-xl min-h-[500px] flex flex-col items-center justify-center transition-all duration-500 hover:border-[#FF7F50]/30 hover:shadow-2xl px-6 py-12 md:py-16">
            {/* WebGL Shader Dithering Background */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-35 dark:opacity-20 mix-blend-multiply dark:mix-blend-screen transition-opacity duration-500 w-full h-full">
              {!shaderError && isWebGLSupported ? (
                <ShaderErrorBoundary>
                  <Suspense fallback={<div className="absolute inset-0 bg-transparent" />}>
                    <Dithering
                      colorBack="#00000000" // Transparent
                      colorFront="#FF7F50"  // Accent Coral
                      shape="warp"
                      type="4x4"
                      speed={isCTAHovered ? 0.5 : 0.15}
                      className="size-full"
                      minPixelRatio={1}
                    />
                  </Suspense>
                </ShaderErrorBoundary>
              ) : (
                <ShaderFallback color="#FF7F50" speed={isCTAHovered ? 0.5 : 0.15} />
              )}
            </div>

            <div className="relative z-10 px-4 max-w-3xl mx-auto text-center flex flex-col items-center">
              {/* Pulsing Status Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#FF7F50]/20 bg-[rgba(255,127,80,0.05)] px-4 py-1.5 text-xs font-semibold text-[#FF7F50] backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF7F50] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF7F50]"></span>
                </span>
                Open for Collaborations
              </div>

              {/* Headline */}
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-[var(--foreground)] mb-6 leading-tight">
                Ready to elevate <br />
                <span className="text-[var(--muted)]">your next project?</span>
              </h2>
              
              {/* Description */}
              <p className="text-[var(--muted)] text-sm sm:text-base max-w-xl mb-8 leading-relaxed font-medium">
                Looking for a skilled IT & Cybersecurity Specialist or a Full-Stack Developer? 
                Let's discuss how we can build secure, reliable, and premium systems together.
              </p>

              {/* Button */}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#FF7F50] hover:bg-[#ff6a35] px-8 text-sm font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95 hover:ring-4 hover:ring-[#FF7F50]/20 cursor-pointer shadow-lg shadow-[#FF7F50]/25"
              >
                <span className="relative z-10">Let's Work Together</span>
                <FaArrowRight size={12} className="relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ───────────────────────────────────────────────────────── */}
      <section
        id="contact"
        className="py-24 px-6 scroll-mt-16"
        style={{ borderTop: "1px solid var(--card-border)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-14 text-center">
            <h2
              className="text-4xl sm:text-5xl font-bold mb-4"
              style={{ color: "var(--foreground)" }}
            >
              Get In <span style={{ color: "var(--accent)" }}>Touch</span>
            </h2>
            <p
              className="text-base max-w-xl mx-auto"
              style={{ color: "var(--muted)" }}
            >
              Whether you have a project in mind, a question, or just want to
              say hello — my inbox is always open.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact info */}
            <div className="flex flex-col gap-4">
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: "var(--foreground)" }}
              >
                Contact Details
              </h3>

              {contactInfo.map(({ icon: Icon, label, href, display }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:-translate-y-0.5"
                  style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor =
                      "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor =
                      "var(--card-border)";
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: accentBg, color: "var(--accent)" }}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-xs font-semibold uppercase tracking-wide mb-0.5"
                      style={{ color: "var(--accent)" }}
                    >
                      {label}
                    </p>
                    <p
                      className="text-sm truncate"
                      style={{ color: "var(--muted)" }}
                    >
                      {display}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            {/* Contact form */}
            <div
              className="rounded-2xl p-6 sm:p-8"
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--card-border)",
              }}
            >
              <h3
                className="text-lg font-semibold mb-6"
                style={{ color: "var(--foreground)" }}
              >
                Send a Message
              </h3>

              <form className="flex flex-col gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-xs font-medium mb-1.5"
                      style={{ color: "var(--muted)" }}
                      htmlFor="contact-name"
                    >
                      Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      placeholder="Your name"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid var(--card-border)",
                        color: "var(--foreground)",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs font-medium mb-1.5"
                      style={{ color: "var(--muted)" }}
                      htmlFor="contact-email"
                    >
                      Email
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid var(--card-border)",
                        color: "var(--foreground)",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "var(--muted)" }}
                    htmlFor="contact-subject"
                  >
                    Subject
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    placeholder="How can I help?"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid var(--card-border)",
                      color: "var(--foreground)",
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "var(--muted)" }}
                    htmlFor="contact-message"
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    placeholder="Tell me about your project or just say hi..."
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid var(--card-border)",
                      color: "var(--foreground)",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
                  style={{ background: "var(--accent)", color: "#fff" }}
                >
                  <FaPaperPlane size={14} />
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

