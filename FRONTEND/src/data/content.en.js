// =========================================================
// Site content — CDN Social (English)
// Mirrors the shape of content.es.js — keep both in sync.
// =========================================================

import practicantes2 from '../assets/practicantes2.jpg'
import equipoCadena from '../assets/Imagen1.jpg'
import voluntariados from '../assets/voluntariados.jpg'
import reunionCadena from '../assets/ReunionCadena.jpg'
import historyVideo from '../assets/VideoJeronimo1.mp4'
import marlonVideo from '../assets/VideoMarlon.mp4'

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
}

export const nav = {
  links: [
    { label: 'Home', href: '#inicio' },
    { label: 'Blog', href: '#/blog' },
    { label: 'Stories', href: '#/historia' },
    { label: 'About Us', href: '#/nosotros' },
  ],
  secondaryCta: { label: 'Interns' },
  primaryCta: { label: 'Apply now' },
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
  paragraph:
    'We were born to help brands communicate with clarity and creativity on social media. Today we are a multidisciplinary team of strategists, designers and content creators.',
  bullets: [
    'We design content strategies tailored to each brand.',
    'We manage digital advertising with a focus on measurable results.',
    'We support social growth with data, not guesswork.',
  ],
  mediaCaptions: ['Team strategy session', 'Content production'],
}

export const videoShowcase = {
  eyebrow: 'Real stories',
  title: 'This is what life at the Center of Excellence looks like',
  items: [
    {
      title: 'Jerónimo Ávila Sanguino tells us',
      subtitle: 'What social innovation feels like at Cadena',
      video: historyVideo,
    },
    {
      title: 'Marlon Osorio Pérez tells us',
      subtitle: 'His story at Cadena’s Center of Excellence',
      video: marlonVideo,
    },
    {
      title: 'Coming soon',
      subtitle: 'New video on the way',
      poster: voluntariados,
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
      title: 'We know the territory',
      description: 'We get close to communities, listen to their stories and understand their needs, ideas and opportunities.',
      image: reunionCadena,
    },
    {
      title: 'We support people',
      description: 'We stand by them throughout their journey, supporting spaces for learning, growth and the development of new skills.',
      image: practicantes2,
    },
    {
      title: 'We create connections',
      description: 'We bring together people, companies, institutions and opportunities so new experiences, lessons and paths can emerge.',
      image: equipoCadena,
    },
    {
      title: 'We drive change that lasts',
      description: 'We want every initiative to leave something valuable, keep growing and continue creating opportunities for more people.',
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
  description: 'Strategy, content and growth for brands that want to be seen.',
  address: 'Medellín, Colombia',
  rights: 'All rights reserved.',
  columns: [
    {
      title: 'Explore',
      links: [
        { label: 'About Us', href: '#/nosotros' },
        { label: 'Services', href: '#servicios' },
        { label: 'Stories', href: '#/historia' },
        { label: 'Blog', href: '#/blog' },
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
