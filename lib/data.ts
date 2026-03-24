export const personal = {
  name: "Ulises Miranda",
  nameDisplay: "ULISES MIRANDA",
  role: "Frontend Developer",
  roleDisplay: "FRONTEND_DEVELOPER",
  bio: "I build performant web interfaces with a strong eye for design and detail. Passionate about UX/UI — I care deeply about how things look, feel, and flow.",
  bioEs:
    "Desarrollador Frontend con experiencia en React, TypeScript y Next.js. Trabajo con dashboards IoT, e-commerce y landing pages de alto impacto. Apasionado por el diseño UX/UI y la experiencia del usuario.",
  phone: "+54 11 28266790",
  email: "ulisesmiranda332@gmail.com",
  location: "Bs As, Argentina",
  locationCode: "Bs As / Arg",
  formspree: "https://formspree.io/f/mkgjpyjo",
};

export const social = [
  {
    label: "GitHub",
    handle: "Ulises-I-M",
    url: "https://github.com/Ulises-I-M",
    icon: "github",
  },
  {
    label: "LinkedIn",
    handle: "ulises-miranda",
    url: "https://www.linkedin.com/in/ulises-miranda-b49b0a17b/",
    icon: "linkedin",
  },
  {
    label: "Instagram",
    handle: "ulises_i.m",
    url: "https://www.instagram.com/ulises_i.m/",
    icon: "instagram",
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

export type Achievement = {
  client: string;
  label: string;
  description: string;
};

export type ExperienceEntry = {
  role: string;
  company: string;
  period: string;
  periodCode: string;
  description: string;
  tags: string[];
  achievements?: Achievement[];
};

export const experience: ExperienceEntry[] = [
  {
    role: "Desarrollador Frontend",
    company: "Sensary",
    period: "Jul 2024 — Apr 2025",
    periodCode: "2024.07 — 2025.04",
    description:
      "Developed and maintained IoT dashboards using ThingsBoard for enterprise clients in the energy, aviation, and industrial sectors. Responsible for the full frontend of custom real-time widgets, data visualization interfaces, and alerting systems.",
    tags: ["ThingsBoard", "React", "TypeScript", "IoT", "Dashboards"],
    achievements: [
      {
        client: "AES",
        label: "AES — Energy Monitoring Platform",
        description:
          "Built a real-time energy monitoring dashboard for AES, one of the world's largest power companies. Implemented custom ThingsBoard widgets for live sensor telemetry, alarm management panels, and historical trend charts across multiple facilities.",
      },
      {
        client: "ENI",
        label: "ENI — Industrial Operations Dashboard",
        description:
          "Developed a multi-site industrial dashboard for ENI's operations. Integrated device telemetry streams, geo-mapped asset tracking, and role-based access control panels for field engineers and management.",
      },
      {
        client: "SHELL",
        label: "SHELL Canada — Field Monitoring",
        description:
          "Contributed to operational dashboards for SHELL Canada's field monitoring infrastructure, enabling real-time equipment status tracking and automated alerting for technicians on-site.",
      },
    ],
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
    title: "Air Ecommerce",
    description:
      "Minimal clothing store landing page with product showcase, cart interactions, and mobile-first design.",
    url: "https://air-ecommerce.netlify.app",
    image: "/images/portfolio/portfolio-1.jpg",
    tags: ["HTML", "CSS", "JavaScript"],
    category: "web",
  },
  {
    title: "To-do List App",
    description:
      "Multi-board task management app with drag-and-drop, persistent state, and clean keyboard navigation.",
    url: "https://to-do-list-ulises-i-m.netlify.app",
    image: "/images/portfolio/portfolio-2.jpg",
    tags: ["React", "TypeScript"],
    category: "personal",
  },
  {
    title: "EnerGym",
    description:
      "Conversion-focused gym landing page. Optimized for leads with strong CTAs and performance-first build.",
    url: "https://ener-gym-landing.netlify.app",
    image: "/images/portfolio/portfolio-4.jpg",
    tags: ["HTML", "CSS", "JavaScript"],
    category: "web",
  },
  {
    title: "Nandina Smart Home",
    description:
      "Real-time IoT smart home dashboard with Synetika sensors. Live data visualization, device control panels, and alerting system.",
    url: "https://smarthome-nandina.netlify.app",
    image: "/images/portfolio/portfolio-5.jpg",
    tags: ["React", "ThingsBoard", "IoT"],
    category: "web",
  },
];

export const navLinks = [
  { label: "HOME", href: "#home" },
  { label: "ABOUT", href: "#about" },
  { label: "EXP", href: "#experience" },
  { label: "WORK", href: "#projects" },
  { label: "CONTACT", href: "#contact" },
];
