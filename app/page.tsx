export const dynamic = "force-static";

import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Experience from "@/components/sections/Experience";
import Education from "@/components/sections/Education";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/layout/Footer";
import CyberDivider from "@/components/ui/CyberDivider";

export default function Home() {
  return (
    <main>
      <Hero />
      <CyberDivider label="SYS.02" />
      <About />
      <CyberDivider label="SYS.03" />
      <Experience />
      <CyberDivider label="SYS.04" />
      <Education />
      <CyberDivider label="SYS.05" />
      <Skills />
      <CyberDivider label="SYS.06" />
      <Projects />
      <CyberDivider label="SYS.07" />
      <Contact />
      <Footer />
    </main>
  );
}
