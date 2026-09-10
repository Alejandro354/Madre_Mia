// =========================================================
// Site content — CDN Social (English)
// Mirrors the shape of content.es.js — keep both in sync.
// =========================================================

import practicantes2 from '../assets/practicantes2.jpg'
import equipoCadena from '../assets/Imagen1.jpg'
import voluntariados from '../assets/voluntariados.jpg'
import reunionCadena from '../assets/ReunionCadena.jpg'
import centroExcelencia from '../assets/Centro-de-Excelencia.jpg'
import cadenaTrabajadores from '../assets/CadenaTrabajadores.jpg'
import historyVideo from '../assets/VideoJeronimo1.mp4'
import marlonVideo from '../assets/VideoMarlon.mp4'
import santiagoVideo from '../assets/VideoSantiago.mp4'
import andresVideoFile from '../assets/VideoAndres.mp4'

export const ui = {
  locale: 'en-US',
  openMenu: 'Open menu',
  playVideo: 'Play video',
  pauseVideo: 'Pause video',
  backToBlog: 'Back to blog',
  articleNotFound: "We couldn't find this article",
  readTimeSuffix: 'read',
  viewsSuffix: 'views',
  readOnBlog: 'Read on the blog',
  prevStory: 'Previous story',
  nextStory: 'Next story',
  viewStory: 'View story',
  saveArticle: 'Save article',
  removeSaved: 'Remove from saved',
  logout: 'Log out',
  createBlog: 'Create post',
  searchPlaceholder: 'Search stories…',
  allCategories: 'All',
  noResults: "We couldn't find stories matching those filters.",
  featuredBadge: 'Featured',
  readArticle: 'Read article',
  readMore: 'Read more',
  prevPage: 'Previous page',
  nextPage: 'Next page',
}

export const nav = {
  links: [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: 'Stories', href: '/historia' },
    { label: 'About Us', href: '/nosotros' },
  ],
  secondaryCta: { label: 'Interns', href: '/practicantes' },
  primaryCta: { label: 'Apply now', href: '/login' },
}

export const hero = {
  title: 'Content that connects, strategy that converts.',
  subtitle:
    'CDN Social designs social media strategies, content and digital advertising for brands that want to grow with measurable results.',
  primaryCta: { label: 'Request a proposal', href: '#contacto' },
  secondaryCta: { label: 'See stories', href: '#historias' },
}

export const stats = [
  { value: '150+', label: 'brands served' },
  { value: '40M+', label: 'monthly reach generated' },
  { value: '320+', label: 'content pieces per month' },
  { value: '98%', label: 'client renewal rate' },
]

export const history = {
  title: 'Our story at the Center of Excellence',
  paragraphs: [
    'The Centro de Excelencia is a commitment to the development of the territory through social innovation, connecting training with real job placement opportunities and bringing young talent closer to formal employment.',
    'From Santa Fe de Antioquia, it strengthens capabilities and brings together knowledge, talent and business to drive the social and economic transformation of Western Antioquia.',
  ],
  mainImage: centroExcelencia,
  secondaryImage: cadenaTrabajadores,
}

export const andresVideo = {
  eyebrow: 'Real stories',
  sectionTitle: 'One more story to tell',
  title: 'Andrés Felipe Correa Villa tells us',
  subtitle: 'IT Lead at the Center of Excellence',
  video: andresVideoFile,
}

export const videoShowcase = {
  eyebrow: 'Real stories',
  title: 'This is what life at the Center of Excellence looks like',
  items: [
    {
      title: 'Jerónimo Ávila Sanguino tells us',
      subtitle: 'His story at Cadena’s Center of Excellence',
      video: historyVideo,
    },
    {
      title: 'Marlon Osorio Pérez tells us',
      subtitle: 'His story at Cadena’s Center of Excellence',
      video: marlonVideo,
    },
    {
      title: 'Santiago Andrés Durango Ospina tells us',
      subtitle: 'His experience in Social Innovation at Cadena',
      video: santiagoVideo,
    },
  ],
}

export const historyPage = {
  titleLines: [
    { text: 'Our', accent: false },
    { text: 'STORY', accent: true },
  ],
  tagline: 'Since day one',
}

export const services = {
  title: 'What we do',
  items: [
    {
      title: 'A seedbed for young talent',
      description: 'Vocational diagnosis and selection with a focus on vulnerability.',
      image: reunionCadena,
    },
    {
      title: 'Capability development',
      description: 'Technical training and skills for the job market.',
      image: practicantes2,
    },
    {
      title: 'Effective job placement',
      description: 'Theory of change applied to employability pathways.',
      image: equipoCadena,
    },
    {
      title: 'Digital agents of change',
      description: 'Digital talent serving territorial initiatives.',
      image: voluntariados,
    },
  ],
}

export const blogPage = {
  heading: 'Stories that build',
  headingAccent: 'territory',
  description:
    'We tell the stories behind every social, educational and community process we drive together with our partners.',
}

export const news = {
  items: [],
}

export const footer = {
  description: 'Strategy, content and social innovation that connect people and communities.',
  address: 'Medellín, Colombia',
  rights: 'All rights reserved.',
  columns: [
    {
      title: 'Explore',
      links: [
        { label: 'Home', href: '/' },
        { label: 'About Us', href: '/nosotros' },
        { label: 'Stories', href: '/historia' },
        { label: 'Blog', href: '/blog' },
      ],
    },
  ],
}

export const fundacionSocial = {
  title: 'Fundación Juan del Corral',
  networks: [
    { label: 'Facebook', href: 'https://www.facebook.com/share/1CU6bAW4KY/?mibextid=wwXIfr', icon: 'facebook' },
    { label: 'Instagram', href: 'https://www.instagram.com/fundacionjuandelcorral?igsi=dXZpYWRyNTlkd3My', icon: 'instagram' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/fundacion-juan-del-corral/', icon: 'linkedin' },
  ],
  team: [
    { label: 'Mónica Sanín', href: 'https://www.linkedin.com/in/monicasaninb/' },
  ],
}

export const aboutPage = {
  titleLines: [
    { text: 'Companies', accent: false },
    { text: 'UNSTOPPABLE', accent: true },
  ],
  tagline: 'From social innovation',
  description:
    'At CADENA, our Social Innovation Model seeks to transform realities based on the needs of people and communities. It relies on listening, understanding and working together to create useful solutions that generate positive change, can be sustained over time and grow to benefit more people by working closely with them.',
  mission: {
    label: 'Mission',
    text: 'To create a space that connects students and companies, making internship opportunities more visible and easier to find. We want students to be able to show who they are, what they study, what skills they have and what they can contribute, while companies showcase their opportunities and find new talent for their teams.',
    points: [
      'We connect students with real internship opportunities',
      'Students show who they are and what they know how to do',
      'Companies find new talent for their teams',
      'We make opportunities more visible and easier to find',
    ],
  },
  vision: {
    label: 'Vision',
    text: 'To be a platform recognized for bringing students closer to the working world and making it easier to connect with companies, creating more opportunities for learning, growth and experience. We want more and more young people to be able to show their potential, and companies to find interns with fresh ideas, knowledge and a drive to contribute.',
    points: [
      'A benchmark in connecting students and companies',
      'More opportunities for learning and real experience',
      'Young people who show their full potential',
      'Companies that find fresh ideas and commitment',
    ],
  },
  values: {
    title: 'Our values',
    items: [
      {
        title: 'Purposeful creativity',
        description: 'Every piece of content responds to a clear brand objective.',
        icon: 'content',
      },
      {
        title: 'Data before intuition',
        description: 'We measure everything to decide based on evidence, not assumptions.',
        icon: 'analytics',
      },
      {
        title: 'Real closeness',
        description: 'We work as an extension of our clients’ team.',
        icon: 'ads',
      },
    ],
  },
}
