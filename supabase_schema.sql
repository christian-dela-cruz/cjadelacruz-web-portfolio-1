-- 1. Create Skills Table
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL UNIQUE,
  items TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Certifications Table
CREATE TABLE IF NOT EXISTS public.certifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  date TEXT NOT NULL,
  badge_url TEXT,
  credly_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  bullets TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  tech TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  duration TEXT,
  github TEXT NOT NULL DEFAULT '#',
  status TEXT NOT NULL CHECK (status IN ('completed', 'in-progress', 'planned')),
  screenshots TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Seminars Table
CREATE TABLE IF NOT EXISTS public.seminars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  organizer TEXT NOT NULL,
  date TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seminars ENABLE ROW LEVEL SECURITY;

-- Create Policies to allow public read-only access
CREATE POLICY "Allow public read access on skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Allow public read access on certifications" ON public.certifications FOR SELECT USING (true);
CREATE POLICY "Allow public read access on projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow public read access on seminars" ON public.seminars FOR SELECT USING (true);

-- Create Policies to allow authenticated users (Admins) full access
CREATE POLICY "Allow auth write access on skills" ON public.skills FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow auth write access on certifications" ON public.certifications FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow auth write access on projects" ON public.projects FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow auth write access on seminars" ON public.seminars FOR ALL TO authenticated USING (true);

-- Insert original mock data for Skills
INSERT INTO public.skills (category, items) VALUES
('Programming', ARRAY['Python', 'C#', 'Kotlin', 'HTML', 'TypeScript', 'ASP.NET MVC']),
('Networking', ARRAY['Routing & Switching', 'Network Infrastructure', 'IEEE 802.15.4']),
('Systems & Cloud', ARRAY['Systems Administration', 'Oracle VirtualBox', 'Google Cloud Platform', 'Windows Server', 'Red Hat Enterprise Linux']),
('Security', ARRAY['Kali Linux', 'Security Fundamentals', 'Ethical Hacking']),
('Databases', ARRAY['MySQL', 'Oracle']),
('Tools & Platforms', ARRAY['Cisco Packet Tracer', 'Visual Studio Code', 'Visual Studio', 'Arduino IDE', 'Figma', 'GitHub', 'Canva', 'Next.js', 'XAMPP'])
ON CONFLICT (category) DO UPDATE SET items = EXCLUDED.items;

-- Insert original mock data for Certifications
INSERT INTO public.certifications (name, issuer, date, badge_url, credly_url) VALUES
('CompTIA Tech+', 'CompTIA', 'December 2025', '/comptia.png', 'https://www.credly.com/badges/1577cccf-5f34-46bd-8d09-b7e837a28d03/public_url'),
('CCNA: Switching, Routing, and Wireless Essentials', 'Cisco Networking Academy', 'March 2025', '/ccna.png', 'https://www.credly.com/badges/b78ed2f8-74f1-4fbc-8cb2-a7f622e80ea6/public_url'),
('Ethical Hacker', 'Cisco Networking Academy', 'March 2025', '/ethicalhacker.png', 'https://www.credly.com/badges/7781dbd5-da20-4852-ab68-84dda25f6895/public_url'),
('Google Cloud Computing Foundations', 'Google Cloud', 'March 2025', '/cgc.png', 'https://www.credly.com/badges/cffe1fbf-7b99-4b79-a873-03031e7fd62d/public_url'),
('TOEIC', 'ETS', 'L&R: 940/990 | S: 160 | W: 190', '/toeic.jpeg', NULL);

-- Insert original mock data for Projects
INSERT INTO public.projects (title, description, bullets, tech, duration, github, status, screenshots) VALUES
('HOPFOG: Multi-Hop Messaging and Communication Application (Mobile)', 'A community-based communication solution designed for low-connectivity or disaster-prone environments. Leverages fog computing concepts and a multi-hop mesh architecture.', ARRAY['Multi-hop communication system utilizing IEEE 802.15.4 standard', 'Implemented fog computing concepts for localized data processing', 'Community-based solution for low-connectivity or disaster-prone environments'], ARRAY['IEEE 802.15.4', 'Fog Computing', 'Mobile', 'Networking', 'Kotlin', 'Android'], 'September 2025 – April 2026', 'https://github.com/christian-dela-cruz/HopFogMobile.git', 'completed', ARRAY['/projects/hopfog1.png', '/projects/hopfog2.png']),
('EliteFitness Mobile Application', 'A native Android fitness application built with Xamarin.Android (C#) helping users manage and track their fitness journey with real-time data sync.', ARRAY['Native Android application using Xamarin.Android (C#)', 'Firebase integration for real-time data storage and sync', 'User profiles, workout logs, and progress metrics tracking'], ARRAY['Xamarin.Android', 'C#', 'Firebase', 'Android'], NULL, '#', 'completed', ARRAY[]::TEXT[]),
('MaluPET', 'Your Pet''s Best Friend — A native Android app for managing your pets and scheduling their care appointments. Helps pet owners keep track of pets and manage feeding, grooming, and veterinary visits.', ARRAY['Register & Login — Create an account and securely sign in', 'Manage Pets — Add and view pet profiles (name, type, breed, age)', 'Schedule Appointments — Track feeding times, grooming dates, and veterinary visits'], ARRAY['Kotlin', 'Jetpack Compose', 'Material Design 3', 'Ktor Client', 'Gradle'], NULL, 'https://github.com/christian-dela-cruz/MaluPET', 'completed', ARRAY['/projects/malupet1.png']),
('Darwin''s Game', 'A C# Windows Forms sidescroller game inspired by the theory of evolution. Guide your character through five stages of life — from a primordial creature all the way to modern humanity — dodging obstacles and surviving each era.', ARRAY['Side-scrolling game with five evolutionary stages', 'Built with C# Windows Forms', 'Dodge obstacles and survive each era of evolution'], ARRAY['C#', 'Windows Forms', '.NET'], NULL, 'https://github.com/christian-dela-cruz/Darwins-Game', 'completed', ARRAY['/projects/darwin1.jpeg', '/projects/darwin2.jpeg']),
('Crossroads Coffee House', 'A comprehensive UI/UX design project for Crossroads Coffee House, developed as part of a fully documented system development process following the Software Development Life Cycle (SDLC).', ARRAY['Full UI/UX design following SDLC methodology', 'Comprehensive documentation at each phase of development', 'Wireframes, mockups, and prototypes created in Figma'], ARRAY['UI/UX', 'Figma', 'SDLC'], NULL, 'https://github.com/christian-dela-cruz/Crossroads-Coffee-House', 'completed', ARRAY['/projects/crossroad1.png', '/projects/crossroad2.png']),
('TollGate Web AppLication', 'An IoT-based automated toll gate system with a web dashboard for real-time monitoring and manual control.', ARRAY['IoT-based automated toll gate hardware integration', 'Web dashboard for real-time monitoring', 'Manual override and control capabilities'], ARRAY['C++', 'IoT', 'Web Dashboard'], NULL, 'https://github.com/christian-dela-cruz/TollGate-Web-App', 'completed', ARRAY[]::TEXT[]),
('TriHex Cipher', 'A custom symmetric encryption algorithm implemented in Python that combines substitution, transposition, and bit-level transformations for enhanced confusion and diffusion.', ARRAY['Custom symmetric encryption combining substitution and transposition', 'Bit-level transformations for enhanced confusion and diffusion', 'Implemented entirely in Python'], ARRAY['Python', 'Cryptography', 'Algorithms'], NULL, 'https://github.com/christian-dela-cruz/TriHex-Cipher', 'completed', ARRAY['/projects/trihex1.jpeg', '/projects/trihex2.jpeg']);

-- Insert original mock data for Seminars
INSERT INTO public.seminars (title, organizer, date, image_url) VALUES
('Pathways to Employability: Career Readiness Toolkit', 'Mapúa Malayan Colleges Laguna & Arizona State University', 'April 21, 2026', 'https://github.com/user-attachments/assets/bead45aa-3aa9-4650-abf2-145886afe857'),
('Technopreneurship: A Journey in Building Your Own Tech Start Up', 'CCIS – Mapúa MCL & Prosperna', 'March 7, 2024', 'https://github.com/user-attachments/assets/a435f8ad-382a-4fe0-88de-e5cd85acdff9'),
('Architecting the Future with Decentralization: An Introduction to Blockchain', 'JPCS Mapúa MCL', 'February 5, 2025', 'https://github.com/user-attachments/assets/7e92d12b-92f8-45a5-87da-86df7e956a60');

-- 5. Create Profile Settings Table
CREATE TABLE IF NOT EXISTS public.profile (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Christian Dela Cruz',
  title TEXT NOT NULL DEFAULT 'Information Technology & Cybersecurity Specialist',
  description TEXT NOT NULL DEFAULT 'Full-stack developer with expertise in mobile app development, networking, and cloud infrastructure. Passionate about building secure, scalable, and user-centric solutions.',
  profile_image_url TEXT DEFAULT '/Formal_Picture.jpg',
  resume_url TEXT DEFAULT '/resume.pdf',
  logo_image_url TEXT DEFAULT '/favicon.png',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on profile table
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;

-- Create Policies to allow public read-only access and authenticated full access
CREATE POLICY "Allow public read access on profile" ON public.profile FOR SELECT USING (true);
CREATE POLICY "Allow auth write access on profile" ON public.profile FOR ALL TO authenticated USING (true);

-- Insert original mock profile data
INSERT INTO public.profile (id, name, title, description, profile_image_url, resume_url, logo_image_url)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Christian Dela Cruz',
  'Information Technology & Cybersecurity Specialist',
  'Full-stack developer with expertise in mobile app development, networking, and cloud infrastructure. Passionate about building secure, scalable, and user-centric solutions.',
  '/Formal_Picture.jpg',
  '/resume.pdf',
  '/favicon.png'
)
ON CONFLICT (id) DO NOTHING;


-- 6. Create Experience Table
CREATE TABLE IF NOT EXISTS public.experience (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  duration TEXT NOT NULL,
  hours TEXT,
  bullets TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  tech TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create Education Table
CREATE TABLE IF NOT EXISTS public.education (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  degree TEXT NOT NULL,
  specialization TEXT,
  school TEXT NOT NULL,
  duration TEXT NOT NULL,
  description TEXT NOT NULL,
  honors TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on new tables
ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;

-- Create Policies to allow public read-only access
CREATE POLICY "Allow public read access on experience" ON public.experience FOR SELECT USING (true);
CREATE POLICY "Allow public read access on education" ON public.education FOR SELECT USING (true);

-- Create Policies to allow authenticated users (Admins) full access
CREATE POLICY "Allow auth write access on experience" ON public.experience FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow auth write access on education" ON public.education FOR ALL TO authenticated USING (true);

-- Seed Experience mock data
INSERT INTO public.experience (title, company, duration, hours, bullets, tech, sort_order) VALUES
(
  'Freelance Mobile App Developer', 
  'EliteFitness', 
  'Mar 2025 – Jun 2025', 
  NULL, 
  ARRAY[
    'Developed a native Android fitness application using Xamarin.Android (C#) to help users manage and track their fitness journey.',
    'Integrated Firebase for real-time data storage and synchronization of user profiles, workout logs, and progress metrics.',
    'Designed and implemented a user-friendly interface for managing fitness schedules, tracking progress, and setting personal goals.'
  ], 
  ARRAY['Xamarin.Android', 'C#', 'Firebase', 'Android'],
  1
),
(
  'Software Developer', 
  'The Bellevue Manila', 
  'April 2026 – July 2026', 
  '486 Hours', 
  ARRAY[
    'Assisted in the development and maintenance of internal web-based systems used by hotel staff and management.',
    'Collaborated with the IT department to troubleshoot software issues and implement minor feature enhancements.',
    'Documented technical processes and supported data management tasks across hotel operations.'
  ], 
  ARRAY[]::TEXT[],
  2
)
ON CONFLICT (id) DO NOTHING;

-- Seed Education mock data
INSERT INTO public.education (degree, specialization, school, duration, description, honors, sort_order) VALUES
(
  'Bachelor of Science in Information Technology',
  'Cybersecurity Specialization',
  'Mapúa Malayan Colleges Laguna',
  '2022 – Present',
  'Currently enrolled. Gained strong fundamentals in cybersecurity, networking, software engineering, cloud infrastructure, and full-stack development. Active in hands-on projects including multi-hop mesh networking systems, mobile app development, and ethical hacking implementations.',
  '🏅 Dean''s Lister: T1 & T3 (AY 2022–2023), T1 (AY 2024–2025)',
  1
)
ON CONFLICT (id) DO NOTHING;


