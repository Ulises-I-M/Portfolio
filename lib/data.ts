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
  descriptionEs?: string;
};

export type ExperienceEntry = {
  role: string;
  company: string;
  period: string;
  periodCode: string;
  description: string;
  descriptionEs?: string;
  tags: string[];
  achievements?: Achievement[];
};

export const experience: ExperienceEntry[] = [
  {
    role: "Desarrollador Frontend",
    company: "Senzary LLC",
    period: "Jul 2024 — Present",
    periodCode: "2024.07 — PRESENT",
    description:
      "Developed and maintained IoT dashboards using ThingsBoard for enterprise clients in the energy, aviation, and industrial sectors. Responsible for the full frontend of custom real-time widgets, data visualization interfaces, and alerting systems.",
    descriptionEs:
      "Desarrollé y mantuve dashboards IoT utilizando ThingsBoard para clientes enterprise en los sectores de energía, aviación e industria. Responsable del frontend completo de widgets en tiempo real, interfaces de visualización de datos y sistemas de alertas.",
    tags: ["ThingsBoard", "React", "TypeScript", "IoT", "Dashboards"],
    achievements: [
      {
        client: "AES",
        label: "AES — Energy Monitoring Platform",
        description:
          "Built a real-time energy monitoring dashboard for AES, one of the world's largest power companies. Implemented custom ThingsBoard widgets for live sensor telemetry, alarm management panels, and historical trend charts across multiple facilities.",
        descriptionEs:
          "Construí un dashboard de monitoreo energético en tiempo real para AES, una de las compañías eléctricas más grandes del mundo. Implementé widgets personalizados en ThingsBoard para telemetría de sensores, paneles de gestión de alarmas y gráficos históricos en múltiples instalaciones.",
      },
      {
        client: "ENI",
        label: "ENI — Industrial Operations Dashboard",
        description:
          "Developed a multi-site industrial dashboard for ENI's operations. Integrated device telemetry streams, geo-mapped asset tracking, and role-based access control panels for field engineers and management.",
        descriptionEs:
          "Desarrollé un dashboard industrial multi-sitio para las operaciones de ENI. Integré flujos de telemetría de dispositivos, seguimiento geolocalizado de activos y paneles de control de acceso por roles para ingenieros de campo y management.",
      },
      {
        client: "SHELL",
        label: "SHELL Canada — Field Monitoring",
        description:
          "Contributed to operational dashboards for SHELL Canada's field monitoring infrastructure, enabling real-time equipment status tracking and automated alerting for technicians on-site.",
        descriptionEs:
          "Contribuí a los dashboards operacionales de la infraestructura de monitoreo de campo de SHELL Canada, habilitando el seguimiento en tiempo real del estado de equipos y alertas automatizadas para técnicos en sitio.",
      },
    ],
  },
];

export type Project = {
  title: string;
  description: string;
  descriptionEs?: string;
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
    descriptionEs:
      "Landing page minimalista de tienda de ropa con showcase de productos, interacciones de carrito y diseño mobile-first.",
    url: "https://air-ecommerce.netlify.app",
    image: "/images/portfolio/portfolio-1.jpg",
    tags: ["HTML", "CSS", "JavaScript"],
    category: "web",
  },
  {
    title: "To-do List App",
    description:
      "Multi-board task management app with drag-and-drop, persistent state, and clean keyboard navigation.",
    descriptionEs:
      "App de gestión de tareas con múltiples tableros, drag-and-drop, estado persistente y navegación por teclado.",
    url: "https://to-do-list-ulises-i-m.netlify.app",
    image: "/images/portfolio/portfolio-2.jpg",
    tags: ["React", "TypeScript"],
    category: "personal",
  },
  {
    title: "EnerGym",
    description:
      "Conversion-focused gym landing page. Optimized for leads with strong CTAs and performance-first build.",
    descriptionEs:
      "Landing page de gimnasio orientada a conversión. Optimizada para generación de leads con CTAs potentes y build de alto rendimiento.",
    url: "https://ener-gym-landing.netlify.app",
    image: "/images/portfolio/portfolio-4.jpg",
    tags: ["HTML", "CSS", "JavaScript"],
    category: "web",
  },
  {
    title: "Nandina Smart Home",
    description:
      "Real-time IoT smart home dashboard with Synetika sensors. Live data visualization, device control panels, and alerting system.",
    descriptionEs:
      "Dashboard IoT de hogar inteligente en tiempo real con sensores Synetika. Visualización de datos en vivo, paneles de control de dispositivos y sistema de alertas.",
    url: "https://smarthome-nandina.netlify.app",
    image: "/images/portfolio/portfolio-5.jpg",
    tags: ["React", "ThingsBoard", "IoT"],
    category: "web",
  },
];

export type EducationEntry = {
  degree: string;
  institution: string;
  year: string;
  type: "formal" | "course" | "self";
  tags: string[];
};

// Update these with your real education/courses
export const education: EducationEntry[] = [
  {
    degree: "Bachiller Técnico en Informática",
    institution: "Actualizar institución",
    year: "20XX",
    type: "formal",
    tags: ["Redes", "Sistemas", "Programación"],
  },
  {
    degree: "React — De cero a experto",
    institution: "Udemy",
    year: "2023",
    type: "course",
    tags: ["React", "JavaScript", "Hooks", "Context"],
  },
  {
    degree: "TypeScript Completo",
    institution: "Udemy",
    year: "2024",
    type: "course",
    tags: ["TypeScript", "Generics", "Types"],
  },
  {
    degree: "Next.js — Apps Full Stack",
    institution: "Udemy",
    year: "2024",
    type: "course",
    tags: ["Next.js", "SSR", "API Routes"],
  },
];

export const navLinks = [
  { label: "HOME", href: "#home" },
  { label: "ABOUT", href: "#about" },
  { label: "EXP", href: "#experience" },
  { label: "WORK", href: "#projects" },
  { label: "CONTACT", href: "#contact" },
];
