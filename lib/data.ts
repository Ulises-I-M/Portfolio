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

/** A string authored in both site languages. */
export type Bilingual = { en: string; es: string };

// ─── Experience ──────────────────────────────────────────────────────────────

export type Achievement = {
  /** Stable key for the accordion — also used as the React key. */
  client: string;
  label: string;
  labelEs?: string;
  description: string;
  descriptionEs?: string;
  /** Anchor to the section that carries the detail, so it is not repeated here. */
  linkHref?: string;
};

export type ExperienceEntry = {
  role: string;
  roleEs?: string;
  company: string;
  period: string;
  periodEs?: string;
  periodCode: string;
  description: string;
  descriptionEs?: string;
  tags: string[];
  achievements?: Achievement[];
};

export const experience: ExperienceEntry[] = [
  {
    role: "Full-stack Developer · Frontend Lead",
    roleEs: "Desarrollador Full-stack · Líder de Frontend",
    company: "Senzary LLC",
    period: "Aug 2024 — Present",
    periodEs: "Ago 2024 — Actualidad",
    periodCode: "2024.08 — PRESENT",
    description:
      "Industrial IoT for enterprise clients in oil & gas, energy, aviation, steel, data centers and environmental monitoring. I led the frontend — and in many cases the backend too — of IoTLogIQ, a Smart Industry product built from the ground up, and supported its migration from ThingsBoard to an in-house Angular + Node.js stack. 10+ solutions delivered across Latin America and the US.",
    descriptionEs:
      "IoT industrial para clientes enterprise en oil & gas, energía, aviación, siderurgia, data centers y monitoreo ambiental. Lideré el frontend — y en muchos casos también el backend — de IoTLogIQ, un producto Smart Industry construido desde cero, y acompañé su migración desde ThingsBoard hacia un stack propio en Angular y Node.js. Más de 10 soluciones entregadas en Latinoamérica y EE.UU.",
    tags: ["ThingsBoard PE", "Angular", "React", "Node.js", "TypeScript", "IoT", "UX/UI"],
    achievements: [
      {
        client: "PLATFORM",
        label: "Platform & design system",
        labelEs: "Plataforma y design system",
        description:
          "IoTLogIQ is a Smart Industry product built from the ground up: a base platform plus per-client tailored solutions. I worked full-stack leading the frontend and in many cases the backend, and supported its migration from ThingsBoard towards an in-house Angular and Node.js stack. On top of it I built Senzary Pro, the reusable navigation system deployed across every client dashboard — cross-dashboard routing, dynamic badges for alarm, ticket and device counts, contextual visibility per contracted service — and defined the design system behind it: palette, typography and hierarchy criteria applied across the board.",
        descriptionEs:
          "IoTLogIQ es un producto Smart Industry construido desde cero: una plataforma base más soluciones a medida por cliente. Trabajé full-stack liderando el frontend y en muchos casos el backend, y acompañé su migración desde ThingsBoard hacia un stack propio en Angular y Node.js. Sobre esa base construí Senzary Pro, el sistema de navegación reutilizable desplegado en todos los dashboards de clientes — navegación cross-dashboard, badges dinámicos por conteo de alarmas, tickets y dispositivos, visibilidad contextual según los servicios contratados — y definí el design system que lo sostiene: paleta, tipografía y criterios de jerarquía aplicados de forma transversal.",
      },
      {
        client: "CLIENTS",
        label: "Clients & industries",
        labelEs: "Clientes e industrias",
        description:
          "Solutions delivered for Shell, ENI, AES, IAC, Jacksonville Airport, AWSS Aruba, SF DPW, Ragasa and Ternium — oil & gas, energy, aviation, steel, data centers, water utilities and environmental monitoring, across Latin America and the US. Worker safety, wastewater SCADA, air filtration with a 3D digital twin, waste collection routing, predictive maintenance and airport operations. Each one involved use-case analysis, offsets and thresholds, rule chains and alarms with severity matched to the operation.",
        descriptionEs:
          "Soluciones entregadas para Shell, ENI, AES, IAC, Jacksonville Airport, AWSS Aruba, SF DPW, Ragasa y Ternium — oil & gas, energía, aviación, siderurgia, data centers, saneamiento y monitoreo ambiental, en Latinoamérica y EE.UU. Seguridad de trabajadores, SCADA de aguas residuales, filtración de aire con gemelo digital 3D, ruteo de recolección, mantenimiento predictivo y operación aeroportuaria. Cada una implicó análisis de casos de uso, offsets y thresholds, rule chains y alarmas con severidad acorde a la operación.",
        linkHref: "#projects",
      },
      {
        client: "DESIGN_PRACTICE",
        label: "Design practice & accessibility",
        labelEs: "Práctica de diseño y accesibilidad",
        description:
          "Redesigned the AES Energy platform end to end, running the client meetings that defined its visual identity and translating that into a design system applied across every view — a result the client singled out. On AWSS I ran a UX and accessibility audit that surfaced real operational-safety findings: inverted colour semantics on a wet-well tank, a running pump plotted in the colour of a fault, and measured WCAG AA contrast failures. On Ragasa I rebuilt the main view once it was clear the audience was operational rather than technical.",
        descriptionEs:
          "Rediseñé la plataforma de AES Energy de punta a punta, coordinando las reuniones con el cliente que definieron su identidad visual y traduciéndola a un sistema de diseño aplicado a todas las vistas — un resultado que el cliente destacó. En AWSS hice una auditoría de UX y accesibilidad con hallazgos reales de seguridad operativa: semántica de color invertida en un tanque de wet well, una bomba en marcha graficada con el color de una falla, y fallos de contraste WCAG AA medidos. En Ragasa rediseñé la vista principal cuando quedó claro que la audiencia era operativa y no técnica.",
      },
      {
        client: "TEAM",
        label: "Team enablement",
        labelEs: "Habilitación del equipo",
        description:
          "Led the adoption of AI tooling in the development team's workflow: usage standards, prompts and review criteria, plus training for other developers so we could ship faster without giving up quality. Alongside it, technical architecture documentation, bilingual (ES/EN) user manuals for plant operators and managers, and automated Excel reports for performance tracking.",
        descriptionEs:
          "Lideré la adopción de herramientas de IA en el flujo de trabajo del equipo de desarrollo: estándares de uso, prompts y criterios de revisión, más capacitación a otros desarrolladores para acelerar entregas sin resignar calidad. En paralelo, documentación técnica de arquitectura, manuales de usuario bilingües (ES/EN) para operadores y gerentes de planta, y reportes automatizados en Excel para seguimiento de performance.",
      },
    ],
  },
];

// ─── Projects ────────────────────────────────────────────────────────────────

/**
 * Folder key under public/images/projects/. Keep in step with slugify() in
 * scripts/sync-project-images.mjs — renaming a title renames the folder.
 */
export const projectSlug = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Motif drawn behind the sigil when a project has no public screenshot. */
export type ProjectGlyph =
  | "nodes"
  | "radar"
  | "route"
  | "wave"
  | "grid"
  | "bars"
  | "scatter"
  | "flow"
  | "hex";

export type ProjectMetric = { value: string; label: Bilingual };

export type Project = {
  title: string;
  /** Three-letter sigil stamped on the generated glyph. */
  code: string;
  client?: string;
  description: string;
  descriptionEs?: string;
  longDescription?: string;
  longDescriptionEs?: string;
  metrics?: ProjectMetric[];
  highlights?: Bilingual[];
  /** Absent when the deployment is private — the card shows no visit link. */
  url?: string;
  glyph?: ProjectGlyph;
  tags: string[];
  category: "iot" | "web" | "personal";
  /** Drawn as a full card; the rest are listed in the compact index below. */
  featured?: boolean;
};

export const projects: Project[] = [
  {
    title: "Senzary.com",
    code: "SNZ",
    client: "Senzary · corporate site",
    url: "https://senzary.com/",
    glyph: "grid",
    category: "web",
    featured: true,
    description:
      "Corporate site and storefront for Senzary's industrial IoT platform: bilingual, eight solution verticals, sensor catalogue and Stripe checkout.",
    descriptionEs:
      "Sitio corporativo y tienda de la plataforma IoT industrial de Senzary: bilingüe, ocho verticales de solución, catálogo de sensores y checkout con Stripe.",
    longDescription:
      "The public face of the platform I build behind the scenes. Two ways in — pick your vertical, or pick the problem you arrived with — over a portfolio of eight solutions, each with its own page. Multi-level navigation across solutions, industries, platform, sensors, networks and a store, in English and Spanish, with a sensor catalogue that takes payment rather than routing every buyer to a sales call.",
    longDescriptionEs:
      "La cara pública de la plataforma que construyo del otro lado. Dos formas de entrar — elegir tu vertical, o elegir el problema con el que llegaste — sobre un portafolio de ocho soluciones, cada una con su propia página. Navegación multinivel entre soluciones, industrias, plataforma, sensores, redes y tienda, en inglés y español, con un catálogo de sensores que cobra en vez de derivar a cada comprador a una llamada de ventas.",
    metrics: [
      { value: "8", label: { en: "SOLUTION VERTICALS", es: "VERTICALES DE SOLUCIÓN" } },
      { value: "7", label: { en: "TOP-LEVEL SECTIONS", es: "SECCIONES PRINCIPALES" } },
      { value: "2", label: { en: "LANGUAGES · EN / ES", es: "IDIOMAS · EN / ES" } },
    ],
    highlights: [
      {
        en: "Two entry paths off the hero — \"select your vertical\" for a visitor who knows their industry, \"pick your problem\" for one who only knows what is going wrong. Industrial buyers arrive as both, and a single funnel loses one of them.",
        es: "Dos caminos de entrada desde el hero — \"elegí tu vertical\" para quien conoce su industria, \"elegí tu problema\" para quien solo sabe qué se le está rompiendo. El comprador industrial llega de las dos formas, y un embudo único pierde a uno de los dos.",
      },
      {
        en: "Eight solution verticals — RotaryIQ, WorkerIQ, AssetIQ, AirportIQ, DustIQ, CrisisIQ, SmartCity and Campus360 — each with its own page, tied back to a portfolio map that shows all three core problems resolving onto one platform.",
        es: "Ocho verticales de solución — RotaryIQ, WorkerIQ, AssetIQ, AirportIQ, DustIQ, CrisisIQ, SmartCity y Campus360 — cada una con su página, atadas a un mapa de portafolio que muestra los tres problemas centrales resolviéndose sobre una sola plataforma.",
      },
      {
        en: "Storefront with cart and Stripe checkout alongside the marketing site, so a sensor order does not have to become a sales conversation.",
        es: "Tienda con carrito y checkout de Stripe conviviendo con el sitio institucional, para que un pedido de sensores no tenga que convertirse en una conversación de ventas.",
      },
      {
        en: "Full EN/ES localisation across every section, for a company selling into Latin America and the US at the same time.",
        es: "Localización EN/ES completa en todas las secciones, para una empresa que vende a Latinoamérica y EE.UU. en simultáneo.",
      },
      {
        en: "Built in the Senzary brand palette — magenta on near-black — the same visual language as the product dashboards, so the site and the platform read as one company rather than two vendors.",
        es: "Construido en la paleta de marca de Senzary — magenta sobre casi negro — el mismo lenguaje visual que los dashboards del producto, para que el sitio y la plataforma se lean como una sola empresa y no como dos proveedores.",
      },
    ],
    tags: ["Next.js", "React", "Tailwind CSS", "Stripe", "i18n", "Vercel"],
  },
  {
    title: "IoTLogIQ",
    featured: true,
    code: "ILQ",
    client: "Senzary · Smart Industry",
    glyph: "nodes",
    category: "iot",
    description:
      "Smart Industry product built from the ground up: a base IoT platform plus tailored solutions for Shell, ENI, AES, IAC, Jacksonville Airport and Ternium.",
    descriptionEs:
      "Producto Smart Industry desarrollado desde cero: plataforma IoT base más soluciones a medida para Shell, ENI, AES, IAC, Jacksonville Airport y Ternium.",
    longDescription:
      "Industrial IoT platform built on ThingsBoard PE. I worked full-stack across frontend and backend, and supported the product's migration from ThingsBoard towards an in-house Angular and Node.js stack. I also led the adoption of AI tooling inside the development team. 10+ projects delivered for clients in airports, oil & gas, energy, steel, data centers and environmental monitoring, mainly across Latin America and the US.",
    longDescriptionEs:
      "Plataforma industrial IoT construida sobre ThingsBoard PE. Trabajé full-stack, tanto en frontend como en backend, y acompañé la migración del producto desde ThingsBoard hacia un stack propio en Angular y Node.js. Lideré además la adopción de herramientas de IA en el equipo de desarrollo. Más de 10 proyectos entregados para clientes en aeropuertos, oil & gas, energía, siderurgia, data centers y monitoreo ambiental, principalmente en Latinoamérica y EE.UU.",
    metrics: [
      { value: "10+", label: { en: "SOLUTIONS SHIPPED", es: "SOLUCIONES ENTREGADAS" } },
      { value: "6", label: { en: "INDUSTRIES", es: "INDUSTRIAS" } },
      { value: "2", label: { en: "REGIONS · LATAM / US", es: "REGIONES · LATAM / EE.UU." } },
    ],
    highlights: [
      {
        en: "Senzary Pro — a reusable navigation system (top bar + sidebar) deployed across every client dashboard: cross-dashboard routing, dynamic badges for alarm, ticket and device counts, and contextual visibility per contracted service.",
        es: "Senzary Pro — sistema de navegación reutilizable (top bar + sidebar) desplegado en todos los dashboards de clientes: navegación cross-dashboard, badges dinámicos por conteo de alarmas, tickets y dispositivos, y visibilidad contextual según los servicios contratados.",
      },
      {
        en: "Custom Alarm Manager widget replacing ThingsBoard's native alarm table, plus a shared gateway-management widget with in-place attribute editing.",
        es: "Widget custom Alarm Manager que reemplaza la tabla de alarmas nativa de ThingsBoard, más un widget transversal de gestión de gateways con edición de atributos in-place.",
      },
      {
        en: "Platform design system: magenta #E91E8C, navy #2E3192, Plus Jakarta Sans — palette, typography and hierarchy criteria applied across every client view.",
        es: "Design system de la plataforma: magenta #E91E8C, navy #2E3192, Plus Jakarta Sans — paleta, tipografía y criterios de jerarquía aplicados en todas las vistas de cliente.",
      },
      {
        en: "Tenant migration oldsmart → smart across the Smart Industry module: users, devices and assets at scale, without breaking live client dashboards.",
        es: "Migración de tenant oldsmart → smart en el módulo Smart Industry: usuarios, devices y assets a escala, sin romper los dashboards de clientes en producción.",
      },
      {
        en: "Cross-client dashboards: multi-tenant pressure monitoring (16 widgets, Ellenex sensors in inWC), IoT network gateway management and industrial door monitoring with Dragino sensors for IAC St. Joseph.",
        es: "Dashboards transversales: monitoreo de presión multi-cliente (16 widgets, sensores Ellenex en inWC), gestión de gateways de red IoT y monitoreo de puertas industriales con sensores Dragino para IAC St. Joseph.",
      },
      {
        en: "Deep TB PE patterns: markdownTextFunction, custom widget lifecycle (onInit / onDataUpdated), base64 state navigation, ctx.stateController vs ctx.router, and injecting modals into window.parent.document to escape the widget iframe.",
        es: "Patrones TB PE dominados: markdownTextFunction, ciclo de vida de custom widgets (onInit / onDataUpdated), navegación entre estados con parámetros base64, ctx.stateController vs ctx.router, e inyección en window.parent.document para modales que escapan el iframe.",
      },
    ],
    tags: ["Angular", "Node.js", "React", "ThingsBoard PE", "IoT", "Digital Twin", "Dashboards"],
  },
  {
    title: "WorkerIQ",
    featured: true,
    code: "WIQ",
    client: "ENI · Puerto Dos Bocas, MX",
    glyph: "radar",
    category: "iot",
    description:
      "Worker safety platform for ENI: real-time personnel tracking, geolocated maps, mustering, toxic gas monitoring and a control-room command center.",
    descriptionEs:
      "Plataforma de seguridad de trabajadores para ENI: seguimiento de personal en tiempo real, mapas geolocalizados, mustering, monitoreo de gas tóxico y command center para sala de control.",
    longDescription:
      "End-to-end industrial safety platform for ENI / Roca Port. It combines personnel tracking with Abeeway badges (GPS + BLE + LoRaWAN), H2S/NH3 toxic gas monitoring against OSHA thresholds, emergency detection (man-down, falls, panic button), geofencing by operational zone, and a command center designed for an 80\" TV in the control room.",
    longDescriptionEs:
      "Plataforma integral de seguridad industrial para ENI / Roca Port. Combina tracking de personal con badges Abeeway (GPS + BLE + LoRaWAN), monitoreo de gas tóxico H2S/NH3 contra umbrales OSHA, detección de emergencias (man-down, caídas, botón de pánico), geofencing por zonas operativas y un command center diseñado para TV de 80\" en sala de control.",
    metrics: [
      { value: "139", label: { en: "SMART BADGES", es: "SMART BADGES" } },
      { value: "10", label: { en: "LORAWAN GATEWAYS", es: "GATEWAYS LORAWAN" } },
      { value: "7", label: { en: "OPERATIONAL ZONES", es: "ZONAS OPERATIVAS" } },
      { value: "66", label: { en: "RULE CHAIN NODES", es: "NODOS DE RULE CHAIN" } },
    ],
    highlights: [
      {
        en: "Badge Assignment System: real-time monitoring and assignment of 160 badges with state filters, configurable auto-refresh, Excel export and columns for battery, last message, beacon read, mode, current location and condition.",
        es: "Badge Assignment System: monitoreo y asignación en tiempo real de 160 badges, con filtros por estado, auto-refresh configurable, export a Excel y columnas de batería, último mensaje, beacon leído, modo, ubicación actual y condición.",
      },
      {
        en: "Rule-chain geofencing: a point-in-polygon (ray casting) algorithm over polygons stored as an asset perimeter attribute, writing zoneCurrentDescription as timeseries so the existing SOS notification system picks it up automatically.",
        es: "Geofencing por rule chain: algoritmo point-in-polygon (ray casting) sobre polígonos definidos como atributo perimeter de assets, guardando zoneCurrentDescription como timeseries para que el sistema de notificación SOS existente lo levante automáticamente.",
      },
      {
        en: "Two-level alarm escalation (primary + secondary) with email/SMS notifications and automatic reminders, wired into a 66-node rule chain without breaking the existing flows.",
        es: "Escalamiento de alarmas en dos niveles (primario + secundario) con notificaciones email/SMS y recordatorios automáticos, sobre una rule chain de 66 nodos intervenida sin romper los flujos existentes.",
      },
      {
        en: "HERE Maps widget with live badge positions, dynamic iconography by device state and geofence rendering, plus a zone-distribution donut with alias normalisation and an \"out of boundary\" bucket.",
        es: "Widget de mapa HERE con posiciones de badges en vivo, iconografía dinámica por estado de dispositivo y renderizado de geocercas, más un donut de distribución por zona con normalización de aliases y bucket \"out of boundary\".",
      },
      {
        en: "Command Center TV: dark glassmorphism theme in ENI corporate colours, typography scaled for distance reading (40px KPIs, 44px sensor readouts), designed as a passive no-interaction view.",
        es: "Command Center TV: dark theme con glassmorphism en colores corporativos ENI, tipografía escalada para lectura a distancia (KPIs 40px, lecturas de sensor 44px), diseñado como vista pasiva sin interacción.",
      },
      {
        en: "H2S thresholds mapped to OSHA bands: 0–10 ppm safe, 10–20 warning, >20 danger, >100 IDLH.",
        es: "Umbrales de H2S mapeados a bandas OSHA: 0–10 ppm seguro, 10–20 advertencia, >20 peligro, >100 IDLH.",
      },
    ],
    tags: ["ThingsBoard PE", "JavaScript", "HERE Maps", "ECharts", "LoRaWAN", "Rule Chains"],
  },
  {
    title: "TrashCans",
    featured: true,
    code: "TRC",
    client: "San Francisco Dept. of Public Works",
    url: "https://trashcans.senzary.com/",
    glyph: "route",
    category: "iot",
    description:
      "Smart waste management for SF DPW: real-time fill level, temperature, alarms and route planning across 851 deployed ultrasonic sensors.",
    descriptionEs:
      "Gestión inteligente de residuos para el SF DPW: nivel de llenado en tiempo real, temperatura, alarmas y planificación de rutas sobre 851 sensores ultrasónicos desplegados.",
    longDescription:
      "Smart waste management system for the San Francisco Department of Public Works. Each container carries an ultrasonic sensor that measures free space every ~10 minutes and transmits over NB-IoT. Instead of fixed calendar routes, dispatchers see which containers are full right now and trace optimised routes in real time — saving fuel and avoiding overflows in high-density areas like Mission, SOMA and Castro.",
    longDescriptionEs:
      "Sistema de gestión inteligente de residuos para el San Francisco Department of Public Works. Cada contenedor lleva un sensor ultrasónico que mide el espacio libre cada ~10 minutos y transmite por NB-IoT. En vez de rutas fijas por calendario, los despachadores ven qué contenedores están llenos ahora y trazan rutas optimizadas en tiempo real, ahorrando combustible y evitando desbordes en zonas de alta densidad como Mission, SOMA y Castro.",
    metrics: [
      { value: "851", label: { en: "SENSORS DEPLOYED", es: "SENSORES DESPLEGADOS" } },
      { value: "1036", label: { en: "UNITS IN INVENTORY", es: "UNIDADES EN INVENTARIO" } },
      { value: "13", label: { en: "DASHBOARD STATES", es: "ESTADOS DE DASHBOARD" } },
      { value: "15+", label: { en: "CUSTOM WIDGETS", es: "WIDGETS CUSTOM" } },
    ],
    highlights: [
      {
        en: "HERE Maps route planning (Routing API v8 + flexible polyline decoder) with Collection / Critical / Maintenance tabs, each with its own prioritisation: Collection skips units in fire state, Critical dispatches fire alerts first then overflow by descending fill, Maintenance sorts offline units by longest downtime, then tilt, then battery.",
        es: "Planificación de rutas con HERE Maps (Routing API v8 + decoder de flexible polyline) y tabs Collection / Critical / Maintenance, cada una con su propia priorización: Collection excluye unidades en estado de incendio, Critical despacha primero alertas de fuego y luego overflow por llenado descendente, Maintenance ordena las offline por mayor tiempo caído, luego tilt, luego batería.",
      },
      {
        en: "Five-step Field Install Wizard (mount bracket → scan QR/DevEUI → confirm first uplink → location + 2 photos → deploy) with 16-hex DevEUI validation, Milesight OUI prefix check, real GPS capture and uplink polling.",
        es: "Field Install Wizard de 5 pasos (montar bracket → escanear QR/DevEUI → confirmar primer uplink → ubicación + 2 fotos → deploy) con validación de DevEUI de 16 hex, chequeo de prefijo OUI Milesight, captura real de GPS y polling de uplink.",
      },
      {
        en: "Users Management widget with full CRUD against the ThingsBoard PE API: per-customer listing, role resolution by entity group, three-step creation wizard with activation mail, role change, edit, delete with self-guard and activation resend.",
        es: "Widget de Users Management con CRUD completo contra la API de ThingsBoard PE: listado por customer, resolución de roles por entity group, wizard de alta en 3 pasos con mail de activación, cambio de rol, edición, borrado con self-guard y reenvío de activación.",
      },
      {
        en: "Complete mobile adaptation: side menu with a centred Field Install FAB in the tab bar, bottom sheets, 2×2 KPI cards, compact device list, card-format alarm console and inventory card view.",
        es: "Adaptación mobile completa: side menu con FAB de Field Install centrado en la tab bar, bottom sheets, KPI cards 2×2, device list compacto, consola de alarmas en formato card e inventario con card view.",
      },
      {
        en: "Two critical fixes: fill_level_pct is the real percentage while fillLevel is raw ultrasonic distance in cm; and widget iframes carry their own viewport, so CSS media queries never fire — breakpoints had to be detected in JS off window.parent.innerWidth.",
        es: "Dos fixes críticos: fill_level_pct es el porcentaje real mientras que fillLevel es distancia cruda del ultrasónico en cm; y los iframes de widget tienen viewport propio, por lo que las media queries CSS no disparan — los breakpoints hay que detectarlos por JS con window.parent.innerWidth.",
      },
    ],
    tags: ["ThingsBoard PE", "JavaScript", "HERE Maps", "ECharts", "NB-IoT", "Milesight"],
  },
  {
    title: "PumpIQ",
    featured: true,
    code: "PIQ",
    client: "AWSS · Aruba Wastewater Services",
    glyph: "wave",
    category: "iot",
    description:
      "Wastewater SCADA for 20 lift stations: SCADA symbology, per-motor detail with runtime and energy, fleet analytics and a dynamic alarm engine.",
    descriptionEs:
      "SCADA de aguas residuales para 20 estaciones de bombeo: simbología SCADA, detalle por motor con runtime y energía, analítica de flota y motor de alarmas dinámico.",
    longDescription:
      "Industrial dashboard on ThingsBoard PE for AWSS, monitoring 20 lift stations spread across the island. Each station carries an ultrasonic level sensor, two pumps instrumented for current and energy, a Siemens S7-1200 PLC and LoRaWAN/D2D communication — sensor EM500-UDL, UC300 controller, Acrel ADW300-WL energy meter per pump over MQTT, Milesight UG65 / Kerlink iStation gateways and Teltonika LTE backhaul.",
    longDescriptionEs:
      "Dashboard industrial sobre ThingsBoard PE para AWSS, monitoreando 20 lift stations distribuidas en la isla. Cada estación tiene sensor de nivel ultrasónico, dos bombas instrumentadas con medición de corriente y energía, PLC Siemens S7-1200 y comunicación LoRaWAN/D2D — sensor EM500-UDL, controlador UC300, medidor Acrel ADW300-WL por bomba vía MQTT, gateways Milesight UG65 / Kerlink iStation y backhaul LTE Teltonika.",
    metrics: [
      { value: "20", label: { en: "LIFT STATIONS", es: "ESTACIONES DE BOMBEO" } },
      { value: "81", label: { en: "WIDGETS", es: "WIDGETS" } },
      { value: "13", label: { en: "DASHBOARD STATES", es: "ESTADOS DE DASHBOARD" } },
      { value: "12", label: { en: "ALARM RULES", es: "REGLAS DE ALARMA" } },
    ],
    highlights: [
      {
        en: "Analytics section built as a single custom widget: five KPI cards (fleet uptime, total energy, average level, alarm events, comm health), fleet average-level trend in ECharts, station ranking, pump status bars, energy distribution donut and active alarm list.",
        es: "Sección Analytics construida como un único widget custom: 5 KPI cards (fleet uptime, energía total, nivel promedio, eventos de alarma, comm health), tendencia de nivel promedio de flota en ECharts, ranking de estaciones, barras de estado de bombas, donut de distribución energética y lista de alarmas activas.",
      },
      {
        en: "Motor Detail widget from scratch: runtime derived from historical pump1_run/pump2_run transitions, ECharts loaded dynamically by CDN, a calendar-style heatmap (0–23h × 30 days), KPIs, energy, flow rates and runtime hours.",
        es: "Widget de Motor Detail desde cero: runtime derivado de transiciones históricas de pump1_run/pump2_run, carga dinámica de ECharts por CDN, heatmap tipo calendario (0–23h × 30 días), KPIs, energía, caudales y horas de runtime.",
      },
      {
        en: "Twelve alarm rules on the awss-station device profile comparing telemetry against dynamic SERVER_SCOPE attributes: overflow/high level (critical), low level, pump faults, overcurrent, no power / fail to start (30s duration), excessive runtime (120min), comm lost (30min inactivity) and weak signal by RSSI.",
        es: "Doce alarm rules en el device profile awss-station comparando telemetría contra atributos SERVER_SCOPE dinámicos: overflow/high level (crítica), low level, fallas de bomba, sobrecorriente, no power / fail to start (duración 30s), runtime excesivo (120min), comm lost (inactividad 30min) y señal débil por RSSI.",
      },
      {
        en: "Full UX/UI audit of the 13 states and ~206k characters of controllerScript, surfacing real operational-safety findings: inverted colour semantics on the wet-well tank (red for low level, blue for high — the opposite of the actual overflow risk), pump2_run plotted in red making normal operation read as a fault, and measured WCAG AA contrast failures (nav bar 2.27:1, idle pump LED 1.73:1).",
        es: "Auditoría UX/UI completa de los 13 estados y ~206k caracteres de controllerScript, con hallazgos reales de seguridad operativa: semántica de color invertida en el tanque de wet well (rojo para nivel bajo, azul para alto — al revés del riesgo real de desborde), pump2_run graficado en rojo haciendo que la operación normal pareciera falla, y fallos de contraste WCAG AA medidos (nav bar 2.27:1, LED de bomba idle 1.73:1).",
      },
      {
        en: "Platform bugs resolved: the currentStation param requires an exact { entityId: { id, entityType }, entityName } shape; TB PE does not re-resolve stateEntity aliases when calling openState on the same state (a fleet→station bounce is needed); and ctx.data mixes items from multiple datasources, so filtering by entityAliasId is mandatory.",
        es: "Bugs de plataforma resueltos: el parámetro currentStation requiere la estructura exacta { entityId: { id, entityType }, entityName }; TB PE no re-resuelve aliases stateEntity al llamar openState sobre el mismo estado (hace falta un rebote fleet→station); y ctx.data mezcla ítems de múltiples datasources, por lo que filtrar por entityAliasId es obligatorio.",
      },
    ],
    tags: ["ThingsBoard PE", "JavaScript", "ECharts", "SCADA", "LoRaWAN", "MQTT", "Modbus/PLC"],
  },
  {
    title: "DustIQ Baghouse",
    featured: true,
    code: "DIQ",
    client: "IAC · multi-plant",
    glyph: "grid",
    category: "iot",
    description:
      "Industrial air filtration monitoring across 71 baghouse units in several plants, with a fleet heatmap, comparison table and a 3D digital twin in Three.js.",
    descriptionEs:
      "Monitoreo de filtración industrial de aire sobre 71 unidades baghouse en varias plantas, con heatmap de flota, tabla comparativa y gemelo digital 3D en Three.js.",
    longDescription:
      "Monitoring dashboard for baghouse filtration units (industrial dust collectors) modelled as ThingsBoard assets across plants in US Toledo, Geneva IL, Labadie, Hercules and others. I built the whole suite as custom widgets, including a navigable 3D digital twin of the filtration train fed with live telemetry: prefilter and HEPA differential pressure, bag leak detection, airflow, inlet/outlet temperature and motor amperage.",
    longDescriptionEs:
      "Dashboard de monitoreo para unidades de filtración baghouse (colectores de polvo industrial) modeladas como assets de ThingsBoard, distribuidas en plantas de US Toledo, Geneva IL, Labadie, Hercules y otras. Desarrollé la suite completa como widgets custom, incluyendo un gemelo digital 3D navegable del tren de filtración con telemetría en vivo: presión diferencial de prefiltro y HEPA, detección de fuga de bolsa, caudal, temperatura de entrada/salida y amperaje de motor.",
    metrics: [
      { value: "71", label: { en: "BAGHOUSE UNITS", es: "UNIDADES BAGHOUSE" } },
      { value: "5+", label: { en: "PLANTS", es: "PLANTAS" } },
      { value: "7", label: { en: "TELEMETRY CHANNELS", es: "CANALES DE TELEMETRÍA" } },
      { value: "4", label: { en: "CUSTOM WIDGETS", es: "WIDGETS CUSTOM" } },
    ],
    highlights: [
      {
        en: "Baghouse Details — a 3D digital twin in Three.js: model of the Polysense FEU/EF filtration train, animated airflow particles, orbital drag/zoom controls and a side panel of live telemetry cards. Split out from the heatmap as a reusable entity-bound widget, using a ResizeObserver instead of media queries and per-instance state in ctx.bdState rather than globals.",
        es: "Baghouse Details — gemelo digital 3D en Three.js: modelo del tren de filtración Polysense FEU/EF, partículas animadas de flujo de aire, controles orbitales de drag/zoom y panel lateral con cards de telemetría en vivo. Independizado del heatmap como widget reutilizable bindeado a entidad, usando ResizeObserver en vez de media queries y estado por instancia en ctx.bdState en lugar de globals.",
      },
      {
        en: "Fleet Filter Load Heatmap — a card grid per unit with OK / Warning / Alarm severity, backed by explicit thresholds (prefilter DP 0.9/1.0 inWC, HEPA DP 2.9/3.0 inWC, bag leak 8/12%).",
        es: "Fleet Filter Load Heatmap — grilla de cards por unidad con severidad OK / Warning / Alarm, respaldada por umbrales explícitos (prefiltro DP 0.9/1.0 inWC, HEPA DP 2.9/3.0 inWC, bag leak 8/12%).",
      },
      {
        en: "Fleet Table with client-side sorting and a KPI strip clustered as \"Fleet Status\" / \"Fleet Median\" — median rather than mean, so a single bad sensor cannot drag the fleet reading.",
        es: "Fleet Table con ordenamiento client-side y KPI strip agrupado en \"Fleet Status\" / \"Fleet Median\" — mediana en vez de media, para que un solo sensor defectuoso no arrastre la lectura de flota.",
      },
      {
        en: "Data-quality fix: a sanitize() pass discarding physically impossible readings (12320.90 inWC, −4761.35 inWC) that were corrupting the fleet averages.",
        es: "Fix de calidad de datos: un paso sanitize() que descarta lecturas físicamente imposibles (12320.90 inWC, −4761.35 inWC) que corrompían los promedios de flota.",
      },
      {
        en: "Classification fix: lastActivityTime is never populated on ASSET entities, so using it as a severity gate made all 71 units report OFFLINE.",
        es: "Fix de clasificación: lastActivityTime no se popula en entidades ASSET, por lo que usarlo como gate de severidad hacía que las 71 unidades aparecieran OFFLINE.",
      },
      {
        en: "Own XSS escaping (escHtml / escJs / bdEsc) across every widget, and an ERR_CERT_AUTHORITY_INVALID diagnosis on the Three.js load that turned out to be corporate SSL inspection rather than CSP — solved by self-hosting the library in the TB Resource Library.",
        es: "Escapado XSS propio (escHtml / escJs / bdEsc) en todos los widgets, y diagnóstico de un ERR_CERT_AUTHORITY_INVALID al cargar Three.js que resultó ser inspección SSL corporativa y no CSP — resuelto self-hosteando la librería en el Resource Library de TB.",
      },
    ],
    tags: ["ThingsBoard PE", "JavaScript", "Three.js", "ECharts", "Digital Twin"],
  },
  {
    title: "AirportIQ",
    code: "AIQ",
    client: "Jacksonville Airport",
    glyph: "bars",
    category: "iot",
    description:
      "Airport operations on IoTLogIQ: air quality, temperature, people counting and flow, queue management and environmental monitoring for control-room reading.",
    descriptionEs:
      "Operación aeroportuaria sobre IoTLogIQ: calidad de aire, temperatura, conteo y flujo de personas, gestión de filas y monitoreo ambiental para lectura en sala de control.",
    longDescription:
      "Airport operations solution built on the IoTLogIQ platform. Dashboards designed for fast reading in a control room, with threshold alarms, per-terminal views and historical measurements, plus asset management across gateways, IAQ, people movers, moving walkways and predictive maintenance in baggage claim, filterable by floor and location.",
    longDescriptionEs:
      "Solución de operación aeroportuaria construida sobre la plataforma IoTLogIQ. Dashboards pensados para lectura rápida en sala de control, con alarmas por umbral, vistas por terminal e histórico de mediciones, más gestión de assets por gateways, IAQ, people movers, moving walkways y mantenimiento predictivo en baggage claim, con filtros por piso y ubicación.",
    metrics: [
      { value: "11", label: { en: "WIDGETS · PEOPLE COUNTER 2.0", es: "WIDGETS · PEOPLE COUNTER 2.0" } },
      { value: "5", label: { en: "KPI SERIES", es: "SERIES DE KPI" } },
      { value: "3", label: { en: "ASSET DETAIL MODES", es: "MODOS DE DETALLE" } },
    ],
    highlights: [
      {
        en: "People Counter 2.0: redesign and migration of the original dashboard to a multi-state version (default, bathroom, escalator, plus per-asset-mode detail states — Cleaning In-Out, Count In-Out, Switch/Availability) with dynamic cards and a responsive corporate design.",
        es: "People Counter 2.0: rediseño y migración del dashboard original a una versión con navegación multi-estado (default, bathroom, escalator, más estados de detalle por modo de asset — Cleaning In-Out, Count In-Out, Switch/Availability) con cards dinámicas y diseño corporativo responsivo.",
      },
      {
        en: "KPI strip: Total Entries (SUM), Total Exits (SUM), Total Traffic, Net People (cumulative in − out) and Switch Available — each with a sparkline and a comparison against the previous period.",
        es: "KPI strip: Total Entries (SUM), Total Exits (SUM), Total Traffic, Net People (in − out acumulado) y Switch Available — cada uno con sparkline y comparación contra el período anterior.",
      },
      {
        en: "Platform constraint solved: ThingsBoard does not support DELTA_PERCENT with SUM aggregation, so the widget uses DELTA_ABSOLUTE and computes the percentage itself.",
        es: "Constraint de plataforma resuelto: ThingsBoard no soporta DELTA_PERCENT con agregación SUM, por lo que el widget usa DELTA_ABSOLUTE y calcula el porcentaje por su cuenta.",
      },
    ],
    tags: ["Angular", "ThingsBoard PE", "Node.js", "IoT", "Dashboards"],
  },
  {
    title: "AES Predictive Maintenance",
    code: "AES",
    client: "AES Energy · data center",
    glyph: "scatter",
    category: "iot",
    description:
      "Predictive maintenance platform for a data center: vibration analysis, linear regression, component remaining-life estimation and anomaly detection.",
    descriptionEs:
      "Plataforma de mantenimiento predictivo para datacenter: análisis de vibración, regresión lineal, estimación de vida útil de componentes y detección de anomalías.",
    longDescription:
      "Predictive maintenance platform for AES Energy, plus a complete redesign of the application. I ran the client workshops that defined its visual identity and translated that into a design system applied across every view — a redesign that drew standout recognition from the client.",
    longDescriptionEs:
      "Plataforma de mantenimiento predictivo para AES Energy, más un rediseño completo de la aplicación. Coordiné las reuniones con el cliente que definieron la identidad visual y la traduje a un sistema de diseño aplicado a todas las vistas — un rediseño que recibió reconocimiento destacado del cliente.",
    highlights: [
      {
        en: "Complete platform redesign: client meetings to define the application's visual identity, translated into a design system applied across every view. The result drew standout recognition from the client.",
        es: "Rediseño completo de la plataforma: reuniones con el cliente para definir la identidad visual de la aplicación, traducida a un sistema de diseño aplicado a todas las vistas. El resultado recibió reconocimiento destacado del cliente.",
      },
      {
        en: "Bearing remaining-life estimation, failure pattern detection and confidence scoring over vibration telemetry.",
        es: "Estimación de vida útil de rodamientos, detección de patrones de falla y scoring de confianza sobre telemetría de vibración.",
      },
      {
        en: "ECharts plots with a linear regression line drawn over the vibration series, so a technician reads the trend rather than the noise.",
        es: "Gráficos ECharts con línea de regresión lineal sobre las series de vibración, para que el técnico lea la tendencia y no el ruido.",
      },
    ],
    tags: ["ThingsBoard PE", "ECharts", "Vibration Analysis", "JavaScript", "UX/UI"],
  },
  {
    title: "Ragasa Digital Plant",
    code: "RGS",
    client: "Ragasa · industrial plant",
    glyph: "flow",
    category: "iot",
    description:
      "Multi-domain IoT suite for an active industrial plant: valve monitoring, energy consumption, air quality and predictive maintenance.",
    descriptionEs:
      "Suite IoT multi-dominio para planta industrial activa: monitoreo de válvulas, consumo energético, calidad de aire y mantenimiento predictivo.",
    longDescription:
      "Multi-domain suite for an active industrial plant. The valve dashboard tracks open/closed state with Abeeway trackers reading tilt, driven by a four-level priority state machine with animated SVG indicators, 48-bar ECharts histograms and Leaflet/OSM mapping. Delivered through Jira alongside a collaborative root-cause investigation.",
    longDescriptionEs:
      "Suite multi-dominio para una planta industrial activa. El dashboard de válvulas monitorea estado abierto/cerrado con trackers Abeeway leyendo inclinación, gobernado por una máquina de estados de 4 niveles de prioridad, con indicadores SVG animados, histogramas de 48 barras en ECharts y mapeo Leaflet/OSM. Entregado vía Jira junto a una investigación colaborativa de root cause.",
    highlights: [
      {
        en: "Valve Dashboard: open/closed monitoring with Abeeway trackers reading tiltX_deg, a four-level priority state machine, animated SVG indicators, 48-bar ECharts histograms and Leaflet/OSM mapping.",
        es: "Valve Dashboard: monitoreo abierto/cerrado con trackers Abeeway leyendo tiltX_deg, máquina de estados de 4 niveles de prioridad, indicadores SVG animados, histogramas de 48 barras en ECharts y mapeo Leaflet/OSM.",
      },
      {
        en: "Design pivot: the real audience turned out to be non-technical users who only needed state, last activity and battery — so the technical data (tilt angles, RSSI) was demoted and the view rebuilt as a split panel (list + floorplan).",
        es: "Pivote de diseño: la audiencia real eran usuarios no técnicos que solo necesitaban estado, última actividad y batería — así que la data técnica (ángulos de tilt, RSSI) se ocultó y la vista se rediseñó como split-panel (lista + floorplan).",
      },
      {
        en: "Architecture rule established for every widget in the suite: a single datasource bound to the \"Devices under asset\" alias pointing at the currentAsset state param.",
        es: "Regla de arquitectura establecida para todos los widgets de la suite: un solo datasource atado al alias \"Devices under asset\" apuntando al state param currentAsset.",
      },
      {
        en: "Collaborative root-cause investigation: 5 of 6 trackers had been misconfigured in Actility from valve tilt mode to GPS tracking mode, so they had stopped transmitting while bolted to fixed valves.",
        es: "Investigación colaborativa de root cause: 5 de 6 trackers habían sido mal configurados en Actility de modo tilt de válvula a modo GPS tracking, dejando de transmitir mientras estaban atornillados a válvulas fijas.",
      },
    ],
    tags: ["ThingsBoard PE", "ECharts", "Leaflet/OSM", "LoRaWAN", "Abeeway", "Jira"],
  },
  {
    title: "IoTArg",
    featured: true,
    code: "ARG",
    client: "Collaborative project · public repo",
    url: "https://iotarg.vercel.app/",
    glyph: "hex",
    category: "personal",
    description:
      "Full-stack IoT fleet management platform: real-time device monitoring, geolocated maps, alarms, drag-and-drop dashboards and multi-tenant role-based access.",
    descriptionEs:
      "Plataforma full-stack de gestión de flota IoT: monitoreo de dispositivos en tiempo real, mapas geolocalizados, alarmas, dashboards drag-and-drop y acceso multi-cliente por roles.",
    longDescription:
      "Integrates ThingsBoard as the IoT engine (telemetry, rules, entities) behind a NestJS backend exposing REST + WebSocket APIs, with a Next.js/React frontend. Designed to scale to multiple clients with device hierarchies and granular per-role permissions. I own the frontend and UX/UI. It currently runs on the ThingsBoard free tier, so some enterprise features are limited for now.",
    longDescriptionEs:
      "Integra ThingsBoard como motor IoT (telemetría, reglas, entidades) detrás de un backend en NestJS que expone APIs REST + WebSocket, con frontend en Next.js/React. Pensada para escalar a múltiples clientes con jerarquías de dispositivos y permisos granulares por rol. Llevo el frontend y el UX/UI. Actualmente corre sobre el free tier de ThingsBoard, por lo que algunas funciones enterprise están limitadas por ahora.",
    highlights: [
      {
        en: "Customisable dashboards with drag-and-drop widget layout, persisted per user.",
        es: "Dashboards personalizables con layout de widgets drag-and-drop, persistido por usuario.",
      },
      {
        en: "Real-time telemetry over WebSockets, with React Query for cache and Zod for runtime schema validation at the API boundary.",
        es: "Telemetría en tiempo real sobre WebSockets, con React Query para caché y Zod para validación de esquemas en runtime en el borde de la API.",
      },
      {
        en: "Multi-tenant, multi-role access control with device hierarchies — built to onboard new clients without forking the app.",
        es: "Control de acceso multi-cliente y multi-rol con jerarquías de dispositivos — pensado para dar de alta clientes nuevos sin forkear la app.",
      },
    ],
    tags: [
      "React",
      "Next.js",
      "TypeScript",
      "React Query",
      "Zod",
      "Tailwind CSS",
      "WebSockets",
      "NestJS",
      "Prisma",
      "PostgreSQL",
      "Docker",
      "ThingsBoard",
    ],
  },
  {
    title: "Nandina Smart Home",
    code: "NSH",
    description:
      "Real-time IoT smart home dashboard with Synetika sensors. Live data visualization, device control panels, and alerting system.",
    descriptionEs:
      "Dashboard IoT de hogar inteligente en tiempo real con sensores Synetika. Visualización de datos en vivo, paneles de control de dispositivos y sistema de alertas.",
    url: "https://smarthome-nandina.netlify.app",
    tags: ["React", "ThingsBoard", "IoT"],
    category: "web",
  },
  {
    title: "Air Ecommerce",
    code: "AIR",
    description:
      "Minimal clothing store landing page with product showcase, cart interactions, and mobile-first design.",
    descriptionEs:
      "Landing page minimalista de tienda de ropa con showcase de productos, interacciones de carrito y diseño mobile-first.",
    url: "https://air-ecommerce.netlify.app",
    tags: ["HTML", "CSS", "JavaScript"],
    category: "web",
  },
  {
    title: "EnerGym",
    code: "EGY",
    description:
      "Conversion-focused gym landing page. Optimized for leads with strong CTAs and performance-first build.",
    descriptionEs:
      "Landing page de gimnasio orientada a conversión. Optimizada para generación de leads con CTAs potentes y build de alto rendimiento.",
    url: "https://ener-gym-landing.netlify.app",
    tags: ["HTML", "CSS", "JavaScript"],
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
