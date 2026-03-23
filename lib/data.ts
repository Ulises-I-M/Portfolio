export const personal = {
  name: "Ulises Miranda",
  nameDisplay: "ULISES MIRANDA",
  role: "Frontend Developer",
  roleDisplay: "FRONTEND_DEVELOPER",
  bio: "I build performant web interfaces with a focus on clean code, reusable components, and great user experiences. Based in Buenos Aires, Argentina.",
  bioEs:
    "Desarrollador Frontend con experiencia en React, TypeScript y Next.js. Trabajo con dashboards IoT, e-commerce y landing pages de alto impacto.",
  phone: "+54 11 28266790",
  email: "ulisesmiranda332@gmail.com",
  location: "Buenos Aires, AR",
  locationCode: "AR / BUE",
  formspree: "https://formspree.io/f/mkgjpyjo",
};

export const social = [
  {
    label: "GitHub",
    handle: "Ulises-I-M",
    url: "https://github.com/Ulises-I-M",
  },
  {
    label: "LinkedIn",
    handle: "ulises-miranda",
    url: "https://www.linkedin.com/in/ulises-miranda-b49b0a17b/",
  },
  {
    label: "Instagram",
    handle: "ulises_i.m",
    url: "https://www.instagram.com/ulises_i.m/",
  },
];

export const skills = [
  { name: "HTML5", icon: "html5" },
  { name: "CSS3", icon: "css3" },
  { name: "JavaScript", icon: "javascript" },
  { name: "TypeScript", icon: "typescript" },
  { name: "React", icon: "react" },
  { name: "Next.js", icon: "nextdotjs" },
  { name: "Vite", icon: "vite" },
  { name: "Figma", icon: "figma" },
  { name: "Git", icon: "git" },
  { name: "Jira", icon: "jira" },
  { name: "Confluence", icon: "confluence" },
  { name: "ThingsBoard", icon: null },
];

export const experience = [
  {
    role: "Desarrollador Frontend",
    company: "Sensary",
    period: "Jul 2024 — Apr 2025",
    periodCode: "2024.07 — 2025.04",
    description:
      "Developed and maintained IoT dashboards using ThingsBoard for enterprise clients including SHELL Canada, AES, and Jacksonville Airport. Built real-time data visualization components and custom widgets.",
    tags: ["ThingsBoard", "React", "IoT", "Dashboards"],
  },
];

export type Project = {
  title: string;
  description: string;
  url: string;
  image: string;
  tags: string[];
  category: "web" | "personal";
};

export const projects: Project[] = [
  {
    title: "Smart Home Dashboard",
    description:
      "Real-time IoT dashboard with Synetika sensors. Live data visualization, device control panels, and alerting system.",
    url: "https://smarthome-nandina.netlify.app",
    image: "/images/portfolio/portfolio-1.jpg",
    tags: ["React", "ThingsBoard", "IoT"],
    category: "web",
  },
  {
    title: "Air Ecommerce",
    description:
      "Minimal clothing store landing page with product showcase, cart interactions, and mobile-first design.",
    url: "https://air-ecommerce.netlify.app",
    image: "/images/portfolio/portfolio-2.jpg",
    tags: ["HTML", "CSS", "JavaScript"],
    category: "web",
  },
  {
    title: "EnerGym",
    description:
      "Conversion-focused gym landing page. Optimized for leads with strong CTAs and performance-first build.",
    url: "https://ener-gym-landing.netlify.app",
    image: "/images/portfolio/portfolio-3.jpg",
    tags: ["HTML", "CSS", "JavaScript"],
    category: "web",
  },
  {
    title: "To-do List App",
    description:
      "Multi-board task management app with drag-and-drop, persistent state, and clean keyboard navigation.",
    url: "https://to-do-list-ulises-i-m.netlify.app",
    image: "/images/portfolio/portfolio-4.jpg",
    tags: ["React", "TypeScript"],
    category: "personal",
  },
];

export const navLinks = [
  { label: "HOME", href: "#home" },
  { label: "ABOUT", href: "#about" },
  { label: "WORK", href: "#projects" },
  { label: "CONTACT", href: "#contact" },
];
