import {
  csharp,
  typescript,
  javascript_light,
  python,
  javascript,
  html,
  css,
  reactjs,
  tailwind,
  nodejs,
  git,
  unity,
  aws,
  maxSlam,
  explottens,
  lostTwins2,
  duel21,
} from "../assets";

export const navLinks = [
  { id: "about", title: "About" },
  { id: "work", title: "Work" },
  { id: "contact", title: "Contact" },
];

export const services = [
  { title: "C#", icon: csharp },
  { title: "JavaScript", icon: javascript_light },
  { title: "Python", icon: python },
  { title: "TypeScript", icon: typescript },
];

export const technologies = [
  { name: "HTML 5", icon: html },
  { name: "CSS 3", icon: css },
  { name: "JavaScript", icon: javascript },
  { name: "React JS", icon: reactjs },
  { name: "Tailwind CSS", icon: tailwind },
  { name: "Node JS", icon: nodejs },
  { name: "git", icon: git },
  { name: "Unity", icon: unity },
  { name: "AWS", icon: aws },
];

// NOTE: Replace github placeholder icons with real company logos
// Place them in src/assets/company/ and import/export from src/assets/index.js
export const experiences = [
  {
    title: "Senior Unity Developer",
    company_name: "MaxDuel (Betsoft Gaming)",
    iconBg: "#915EFF",
    date: "December 2024 – November 2025",
    points: [
      "Developed scalable multiplayer gameplay systems using Unity and C#.",
      "Implemented server-authoritative multiplayer architecture, matchmaking, and session management systems.",
      "Collaborated with designers, QA, and backend teams to deliver stable live-service gameplay features.",
      "Optimized gameplay performance across mobile and WebGL platforms.",
      "Conducted code reviews and mentored developers to maintain engineering standards.",
      "Contributed to long-term technical planning and scalable system architecture.",
    ],
  },
  {
    title: "Senior Unity Developer",
    company_name: "Big Immersive",
    iconBg: "#915EFF",
    date: "August 2023 – July 2024",
    points: [
      "Designed foundational architecture for multiplayer metaverse systems (Virtua & Maians).",
      "Implemented state synchronization using Photon Fusion 2.",
      "Optimized WebGL builds for improved browser performance.",
      "Integrated backend APIs for real-time functionality and communication.",
      "Coordinated with backend, QA, marketing, and design teams to implement gameplay features (Nitro League).",
    ],
  },
  {
    title: "Senior Unity Developer",
    company_name: "WRP Studios (erstwhile weRplay)",
    iconBg: "#915EFF",
    date: "April 2021 – July 2023",
    points: [
      "Principal developer responsible for Explottens, an Apple Arcade title, using Unity.",
      "Senior Unity Developer on Lost Twins 2, shipped on Steam, PS5, Xbox Series X|S, Switch, iOS, and Android, reporting directly to the CTO.",
      "Developed gameplay systems and implemented production-ready features for Spy Ninja Network.",
      "Ensured adherence to clean architecture principles, coding standards, and game programming best practices.",
      "Oversaw technical quality, gameplay implementation, debugging, and testing workflows.",
    ],
  },
  {
    title: "Senior Unity Developer",
    company_name: "AptechMedia",
    iconBg: "#915EFF",
    date: "March 2016 – March 2021",
    points: [
      "Led development of multiple Unity game projects for Android and iOS platforms.",
      "Designed and implemented multiplayer architecture for Poker King using Photon networking.",
      "Served as lead developer for Deer Hunt, an FPS hunting game for mobile platforms.",
      "Developed gameplay systems, UI systems, and platform-specific optimizations.",
      "Maintained code quality standards and contributed to scalable gameplay architecture.",
    ],
  },
  {
    title: "Unity Developer",
    company_name: "Skippy Apps",
    iconBg: "#915EFF",
    date: "March 2015 – February 2016",
    points: [
      "Developed gameplay features and game systems using Unity and C#.",
      "Assisted in implementing UI systems, gameplay mechanics, and mobile platform features.",
      "Participated in debugging, testing, and optimization workflows.",
      "Collaborated with team members to deliver stable mobile game experiences.",
    ],
  },
];

// NOTE: Replace placeholder images with actual project screenshots
// Place PNGs in src/assets/projects/ — see comments on each entry
export const projects = [
  {
    name: "Max Slam – Real-Time Multiplayer iGaming",
    description:
      "Real-time multiplayer iGaming platform with server-authoritative architecture, matchmaking, and session management across mobile and WebGL.",
    tags: [
      { name: "Unity", color: "blue-text-gradient" },
      { name: "C#", color: "green-text-gradient" },
      { name: "Netcode for GameObjects", color: "pink-text-gradient" },
      { name: "WebGL", color: "yellow-text-gradient" },
    ],
    image: maxSlam,
    links: [
      { name: "Platform", url: "https://maxduel.com/" },
    ],
  },
  {
    name: "Explottens",
    description:
      "Apple Arcade title developed as principal Unity developer. Built core gameplay mechanics and systems with clean architecture for a polished mobile experience.",
    tags: [
      { name: "Unity", color: "blue-text-gradient" },
      { name: "C#", color: "green-text-gradient" },
      { name: "Mobile", color: "pink-text-gradient" },
      { name: "Apple Arcade", color: "yellow-text-gradient" },
    ],
    image: explottens,
    links: [
      { name: "YouTube", url: "#" },
      { name: "Website", url: "https://www.playdew.com/explottens" },
      { name: "Steam", url: "#" },
    ],
  },
  {
    name: "Lost Twins 2 – Puzzle Platformer",
    description:
      "Multi-platform puzzle platformer shipped on Steam, PS5, Xbox Series X|S, Nintendo Switch, iOS, and Android. Designed core time-manipulation systems and physics-driven interactions.",
    tags: [
      { name: "Unity", color: "blue-text-gradient" },
      { name: "C#", color: "green-text-gradient" },
      { name: "Cross-Platform", color: "pink-text-gradient" },
      { name: "Console", color: "yellow-text-gradient" },
    ],
    image: lostTwins2,
    links: [
      { name: "Website", url: "https://www.playdew.com/lost-twins-2" },
      { name: "Steam", url: "#" },
      { name: "PS5", url: "#" },
      { name: "Xbox Series X|S", url: "#" },
      { name: "Nintendo Switch", url: "#" },
      { name: "Android", url: "#" },
    ],
  },
  {
    name: "21 Duel – Multiplayer Card Game",
    description:
      "Competitive multiplayer card game with real-time networking, gameplay synchronization, and live-service backend integration.",
    tags: [
      { name: "Unity", color: "blue-text-gradient" },
      { name: "C#", color: "green-text-gradient" },
      { name: "Multiplayer", color: "pink-text-gradient" },
      { name: "Client-Server", color: "yellow-text-gradient" },
    ],
    image: duel21,
    links: [
      { name: "Platform", url: "https://maxduel.com/" },
    ],
  },
];
