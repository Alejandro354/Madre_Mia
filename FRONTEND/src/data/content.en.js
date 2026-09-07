// =========================================================
// Site content — CDN Social (English)
// Mirrors the shape of content.es.js — keep both in sync.
// =========================================================

import feriaUniversitaria1 from '../assets/FeriaUniverisitaria1.jpg'
import feriaUniversitaria2 from '../assets/FeriaUniverisitaria2.jpg'
import feriaUniversitaria3 from '../assets/FeriaUniversitaria3.jpg'
import voluntariadoLimpieza from '../assets/monica2.jpg'
import voluntariadoSiembra from '../assets/VoluntariadoCadena.jpg'
import premiacionCuentos from '../assets/PremiacionCuentos.jpg'
import premiacionCuentos2 from '../assets/PremiacionCuentos (2).jpg'
import exploracionTerritorios from '../assets/ExploracionTerritorios.jpg'
import practicantes2 from '../assets/practicantes2.jpg'
import equipoCadena from '../assets/Imagen1.jpg'
import voluntariados from '../assets/voluntariados.jpg'
import reunionCadena from '../assets/ReunionCadena.jpg'
import historyVideo from '../assets/VideoJeronimo1.mp4'
import marlonVideo from '../assets/VideoMarlon.mp4'
import entrevistaRectorVideo from '../assets/Entrevista Rector.mp4'
import entrevistaPersoneroVideo from '../assets/Entrevista Personero.mp4'

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
}

export const nav = {
  links: [
    { label: 'Home', href: '#inicio' },
    { label: 'Blog', href: '#/blog' },
    { label: 'Stories', href: '#/historia' },
    { label: 'About Us', href: '#/nosotros' },
  ],
  secondaryCta: { label: 'Track' },
  primaryCta: { label: 'Log in' },
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
  items: [
    {
      slug: 'orientacion-vocacional',
      tag: 'University Fair',
      date: 'Apr 2, 2026',
      readTime: '3 min',
      views: 842,
      title: 'Exploring today to decide better tomorrow',
      excerpt: 'From the Juan del Corral Museum, we joined the University Fair to see up close the impact this space has on young people and on the decisions they are beginning to make about their future.',
      image: feriaUniversitaria2,
      content: [
        'From the Juan del Corral Museum, we joined the University Fair to see up close the impact this space has on young people and on the decisions they are beginning to make about their future.',
        'More than a fair, it was a space to discover possibilities. Students were able to explore different education options, get their questions answered and start imagining which path they want to follow after finishing school.',
        'From Social Innovation and the Juan del Corral Foundation, we were there observing and supporting this process, listening to both the students and the people who make these spaces possible.',
      ],
      videos: [
        {
          preview: feriaUniversitaria3,
          video: entrevistaRectorVideo,
          aspectRatio: '4 / 3',
          caption: 'Interview with principal William Toro – University Fair',
          content: [
            'In this interview we spoke with William Toro, principal of the San Luis Gonzaga Educational Institution in Santa Fe de Antioquia, about the importance of holding spaces like the University Fair and the value they can have for young people from the municipality and nearby rural areas.',
            'The video centers on how these initiatives can help students learn about new study options, discover different paths for their future and make better-informed decisions after finishing school.',
            'A conversation that lets us understand, from an educational perspective, why bringing these opportunities closer to young people can make a difference in building their life plan.',
          ],
        },
        {
          preview: feriaUniversitaria1,
          video: entrevistaPersoneroVideo,
          aspectRatio: '4 / 3',
          caption: 'Interview with Gerónimo – The voice of the students',
          content: [
            'In this interview we spoke with Gerónimo, student representative, to learn how young people experience this kind of activity and what it can mean for them to take part in a University Fair.',
            'The video captures the students’ own perspective on the importance of learning about new study options, discovering different paths for their future and having spaces where they can get their questions answered and think about what they want to do after finishing school.',
            'Listening to young people also helps us better understand their expectations and interests, and the importance of bringing them opportunities that can contribute to their decisions and to building their future.',
          ],
        },
      ],
    },
    {
      slug: 'voluntariado-limpieza',
      tag: 'Volunteering',
      date: 'Apr 8, 2026',
      readTime: '3 min',
      views: 511,
      title: 'Cleanup day in the Tropical Dry Forest',
      excerpt: 'A group of volunteers collected waste and helped protect the biodiversity of this unique ecosystem in the region.',
      image: voluntariadoLimpieza,
      imagePosition: 'center 12%',
      heroImage: voluntariadoSiembra,
      heroCompact: true,
      content: [
        'A group of volunteers collected waste and helped protect the biodiversity of this unique ecosystem in the region.',
      ],
      secondaryHeading: 'Volunteering that transforms',
      secondaryContent: [
        'At CADENA’s Social Innovation, volunteering is a way to share knowledge, experience and skills to support the growth of other people. Our team members take part voluntarily in training, mentoring and skill-building activities, especially with young people connected to the Center of Excellence. In doing so, we aim to create spaces for learning, strengthen ties with the community and generate a positive impact that connects people with new opportunities.',
      ],
      highlights: [
        {
          title: 'We share knowledge',
          description: 'Our volunteers contribute their experience and knowledge on different topics to support young people’s education.',
        },
        {
          title: 'We support growth',
          description: 'We also strengthen skills such as communication, teamwork, confidence and personal development.',
        },
      ],
    },
    {
      slug: 'premiacion-cuentos',
      tag: 'Story contest',
      date: 'Apr 15, 2026',
      readTime: '3 min',
      views: 693,
      title: '7th "Flying with Imagination" Story Contest',
      excerpt: 'The Nurquí Rural Educational Institution held a new edition of the "Flying with Imagination" contest, an initiative that keeps the love of writing alive and encourages children, young people and adults to express their ideas through stories.',
      image: premiacionCuentos2,
      imagePosition: 'center top',
      heroImage: premiacionCuentos,
      content: [
        'The Nurquí Rural Educational Institution held a new edition of the "Flying with Imagination" contest, an initiative that keeps the love of writing alive and encourages children, young people and adults to express their ideas through stories.',
        'The Juan del Corral Foundation supported and accompanied this project, recognizing the importance of creating spaces where imagination, creativity and reading have a special place within the community.',
        'Before the awards ceremony, different hands-on activities were held that made it possible to share, learn and enjoy writing together. Afterward, the participating stories were recognized, along with the effort of everyone who dared to create and tell their own stories.',
        'More than awarding a story, this activity aims to remind us that writing is also a way to imagine, learn, express what we feel and keep our stories alive.',
      ],
      quote: 'When a story is written, an idea begins to fly.',
    },
    {
      slug: 'exploracion-territorios',
      tag: 'Territory exploration',
      date: 'Apr 20, 2026',
      readTime: '4 min',
      views: 357,
      title: 'Constellations: stories from my neighborhood',
      excerpt: 'A group of young people toured their territory’s industrial heritage to reconstruct and tell the story of their neighborhood.',
      image: exploracionTerritorios,
      content: [
        'A group of young people toured their territory’s industrial heritage to reconstruct and tell the story of their neighborhood.',
      ],
    },
  ],
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
