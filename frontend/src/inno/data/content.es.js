// =========================================================
// Contenido del sitio — CDN Social
// Centralizar la copia aquí facilita editarla sin tocar UI.
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
  locale: 'es-CO',
  openMenu: 'Abrir menú',
  playVideo: 'Reproducir video',
  pauseVideo: 'Pausar video',
  backToBlog: 'Volver al blog',
  articleNotFound: 'No encontramos este artículo',
  readTimeSuffix: 'de lectura',
  viewsSuffix: 'vistas',
  readOnBlog: 'Leer en el blog',
  prevStory: 'Historia anterior',
  nextStory: 'Historia siguiente',
  viewStory: 'Ver historia',
  saveArticle: 'Guardar artículo',
  removeSaved: 'Quitar de guardados',
  logout: 'Cerrar sesión',
  createBlog: 'Crear blog',
  searchPlaceholder: 'Buscar historias…',
  allCategories: 'Todas',
  noResults: 'No encontramos historias con esos filtros.',
  featuredBadge: 'Destacado',
  readArticle: 'Leer artículo',
  readMore: 'Leer más',
  prevPage: 'Página anterior',
  nextPage: 'Página siguiente',
}

export const nav = {
  links: [
    { label: 'Inicio', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: 'Historias', href: '/historia' },
    { label: 'Nosotros', href: '/nosotros' },
  ],
  secondaryCta: { label: 'Practicantes', href: '/practicantes' },
  primaryCta: { label: 'Practica ya', href: '/login' },
}

export const hero = {
  title: 'Contenido que conecta, estrategia que convierte.',
  subtitle:
    'CDN Social diseña estrategias de redes sociales, contenido y pauta digital para marcas que quieren crecer con resultados medibles.',
  primaryCta: { label: 'Solicitar propuesta', href: '#contacto' },
  secondaryCta: { label: 'Ver historias', href: '#historias' },
}

export const stats = [
  { value: '150+', label: 'marcas atendidas' },
  { value: '40M+', label: 'alcance mensual generado' },
  { value: '320+', label: 'piezas de contenido al mes' },
  { value: '98%', label: 'clientes que renuevan' },
]

export const history = {
  title: 'Nuestra historia en el Centro de Excelencia',
  paragraphs: [
    'El Centro de Excelencia es una apuesta por el desarrollo del territorio a través de la innovación social, conectando la formación con oportunidades reales de inserción laboral y acercando el talento joven al empleo formal.',
    'Desde Santa Fe de Antioquia, fortalece capacidades y articula conocimiento, talento y empresa para impulsar la transformación social y económica del Occidente antioqueño.',
  ],
  mainImage: centroExcelencia,
  secondaryImage: cadenaTrabajadores,
}

export const andresVideo = {
  eyebrow: 'Historias reales',
  sectionTitle: 'Una historia más para contar',
  title: 'Andrés Felipe Correa Villa nos cuenta',
  subtitle: 'Líder TI en el Centro de Excelencia',
  video: andresVideoFile,
}

export const videoShowcase = {
  eyebrow: 'Historias reales',
  title: 'Así se vive el Centro de Excelencia',
  items: [
    {
      title: 'Jerónimo Ávila Sanguino nos cuenta',
      subtitle: 'Su historia en el Centro de Excelencia de Cadena',
      video: historyVideo,
    },
    {
      title: 'Marlon Osorio Pérez nos cuenta',
      subtitle: 'Su historia en el Centro de Excelencia de Cadena',
      video: marlonVideo,
    },
    {
      title: 'Santiago Andrés Durango Ospina nos cuenta',
      subtitle: 'Su experiencia en Innovación Social de Cadena',
      video: santiagoVideo,
    },
  ],
}

export const historyPage = {
  titleLines: [
    { text: 'Nuestra', accent: false },
    { text: 'HISTORIA', accent: true },
  ],
  tagline: 'Desde el primer día',
}

export const services = {
  title: 'Qué hacemos',
  items: [
    {
      title: 'Semillero de talento joven',
      description: 'Diagnóstico vocacional y selección con eje en vulnerabilidad.',
      image: reunionCadena,
    },
    {
      title: 'Desarrollo de capacidades',
      description: 'Formación técnica y habilidades para el mercado laboral.',
      image: practicantes2,
    },
    {
      title: 'Inserción laboral efectiva',
      description: 'Teoría del cambio aplicada a rutas de empleabilidad.',
      image: equipoCadena,
    },
    {
      title: 'Agentes digitales de cambio',
      description: 'Talento digital al servicio de iniciativas de territorio.',
      image: voluntariados,
    },
  ],
}

export const blogPage = {
  heading: 'Historias que construyen',
  headingAccent: 'territorio',
  description:
    'Contamos las historias detrás de cada proceso social, educativo y comunitario que impulsamos junto a nuestros aliados.',
}

export const news = {
  items: [],
}

export const footer = {
  description: 'Estrategia, contenido e innovación social que conectan personas y comunidades.',
  address: 'Medellín, Colombia',
  rights: 'Todos los derechos reservados.',
  columns: [
    {
      title: 'Explorar',
      links: [
        { label: 'Inicio', href: '/' },
        { label: 'Nosotros', href: '/nosotros' },
        { label: 'Historias', href: '/historia' },
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
    { text: 'Empresas', accent: false },
    { text: 'IMPARABLES', accent: true },
  ],
  tagline: 'Desde innovación social',
  description:
    'En CADENA, nuestro Modelo de Innovación Social busca transformar realidades a partir de las necesidades de las personas y las comunidades. Se basa en escuchar, comprender y trabajar de manera conjunta para crear soluciones útiles, que generen cambios positivos, puedan mantenerse en el tiempo y crecer para beneficiar a más personas trabajando de manera cercana con ellos.',
  mission: {
    label: 'Misión',
    text: 'Crear un espacio que conecte a estudiantes y empresas, haciendo que las oportunidades de práctica sean más visibles y fáciles de encontrar. Buscamos que los estudiantes puedan mostrar quiénes son, qué estudian, cuáles son sus habilidades y qué pueden aportar, mientras las empresas dan a conocer sus oportunidades y encuentran nuevos talentos para sus equipos.',
    points: [
      'Conectamos estudiantes con oportunidades de práctica reales',
      'Los estudiantes muestran quiénes son y qué saben hacer',
      'Las empresas encuentran talento nuevo para sus equipos',
      'Hacemos las oportunidades más visibles y fáciles de encontrar',
    ],
  },
  vision: {
    label: 'Visión',
    text: 'Ser una plataforma reconocida por acercar a los estudiantes al mundo laboral y facilitar la conexión con las empresas, generando más oportunidades de aprendizaje, crecimiento y experiencia. Queremos que cada vez más jóvenes puedan demostrar su potencial y que las empresas encuentren practicantes con nuevas ideas, conocimientos y ganas de aportar.',
    points: [
      'Referente en la conexión entre estudiantes y empresas',
      'Más oportunidades de aprendizaje y experiencia real',
      'Jóvenes que demuestran todo su potencial',
      'Empresas que encuentran ideas frescas y compromiso',
    ],
  },
  values: {
    title: 'Nuestros valores',
    items: [
      {
        title: 'Creatividad con propósito',
        description: 'Cada pieza de contenido responde a un objetivo claro de marca.',
        icon: 'content',
      },
      {
        title: 'Datos antes que intuición',
        description: 'Medimos todo para decidir con evidencia, no con suposiciones.',
        icon: 'analytics',
      },
      {
        title: 'Cercanía real',
        description: 'Trabajamos como una extensión del equipo de nuestros clientes.',
        icon: 'ads',
      },
    ],
  },
}
