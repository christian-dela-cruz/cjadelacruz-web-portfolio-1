import { supabase } from "@/lib/supabase";
import PortfolioClient from "@/components/PortfolioClient";

// Force dynamic server-rendering so database updates are fetched fresh on refresh
export const dynamic = "force-dynamic";

export default async function Page() {
  let profileData = null;
  let skillsData = null;
  let projectsData = null;
  let certsData = null;
  let seminarsData = null;

  try {
    const { data } = await supabase.from("profile").select("*").maybeSingle();
    profileData = data;
  } catch (e) {
    console.warn("Supabase fetch profile failed on server:", e);
  }

  try {
    const { data } = await supabase.from("skills").select("*").order("category", { ascending: true });
    skillsData = data;
  } catch (e) {
    console.warn("Supabase fetch skills failed on server:", e);
  }

  try {
    const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    projectsData = data;
  } catch (e) {
    console.warn("Supabase fetch projects failed on server:", e);
  }

  try {
    const { data } = await supabase.from("certifications").select("*").order("created_at", { ascending: false });
    certsData = data;
  } catch (e) {
    console.warn("Supabase fetch certifications failed on server:", e);
  }

  try {
    const { data } = await supabase.from("seminars").select("*").order("created_at", { ascending: false });
    seminarsData = data;
  } catch (e) {
    console.warn("Supabase fetch seminars failed on server:", e);
  }

  return (
    <PortfolioClient
      databaseProfile={profileData}
      databaseSkills={skillsData}
      databaseProjects={projectsData}
      databaseCertifications={certsData}
      databaseSeminars={seminarsData}
    />
  );
}
