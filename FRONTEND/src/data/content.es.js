// =========================================================
// Contenido del sitio — CDN Social
// Centralizar la copia aquí facilita editarla sin tocar UI.
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
}

export const nav = {
  links: [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Blog', href: '#/blog' },
    { label: 'Historias', href: '#/historia' },
    { label: 'Nosotros', href: '#/nosotros' },
  ],
  secondaryCta: { label: 'Seguimiento' },
  primaryCta: { label: 'Iniciar sesión' },
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
  paragraph:
    'Nacimos para ayudar a marcas a comunicar con claridad y creatividad en redes sociales. Hoy somos un equipo multidisciplinario de estrategas, diseñadores y creadores de contenido.',
  bullets: [
    'Diseñamos estrategias de contenido a la medida de cada marca.',
    'Gestionamos pauta digital con foco en resultados medibles.',
    'Acompañamos el crecimiento en redes con datos, no intuición.',
  ],
  mediaCaptions: ['Equipo en sesión de estrategia', 'Producción de contenido'],
}

export const videoShowcase = {
  eyebrow: 'Historias reales',
  title: 'Así se vive el Centro de Excelencia',
  items: [
    {
      title: 'Jerónimo Ávila Sanguino nos cuenta',
      subtitle: 'Cómo vive la innovación social en Cadena',
      video: historyVideo,
    },
    {
      title: 'Marlon Osorio Pérez nos cuenta',
      subtitle: 'Su historia en el Centro de Excelencia de Cadena',
      video: marlonVideo,
    },
    {
      title: 'Próximamente',
      subtitle: 'Nuevo video en camino',
      poster: voluntariados,
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
      title: 'Conocemos el territorio',
      description: 'Nos acercamos a las comunidades, escuchamos sus historias y entendemos sus necesidades, ideas y oportunidades.',
      image: reunionCadena,
    },
    {
      title: 'Acompañamos a las personas',
      description: 'Estamos presentes en sus procesos, apoyando espacios de aprendizaje, crecimiento y desarrollo de nuevas habilidades.',
      image: practicantes2,
    },
    {
      title: 'Creamos conexiones',
      description: 'Unimos personas, empresas, instituciones y oportunidades para que puedan surgir nuevas experiencias, aprendizajes y caminos.',
      image: equipoCadena,
    },
    {
      title: 'Impulsamos cambios que permanezcan',
      description: 'Buscamos que cada iniciativa deje algo valioso, pueda seguir creciendo y continúe generando oportunidades para más personas.',
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
  items: [
    {
      slug: 'orientacion-vocacional',
      tag: 'Feria Universitaria',
      date: '02 abr, 2026',
      readTime: '3 min',
      views: 842,
      title: 'Explorar hoy para decidir mejor mañana',
      excerpt: 'Desde el Museo Juan del Corral, acompañamos la Feria Universitaria para conocer de cerca el impacto que este espacio tiene en los jóvenes y en las decisiones que comienzan a tomar sobre su futuro.',
      image: feriaUniversitaria2,
      content: [
        'Desde el Museo Juan del Corral, acompañamos la Feria Universitaria para conocer de cerca el impacto que este espacio tiene en los jóvenes y en las decisiones que comienzan a tomar sobre su futuro.',
        'Más que una feria, fue un espacio para descubrir posibilidades. Los estudiantes pudieron acercarse a diferentes opciones de formación, resolver dudas y empezar a imaginar qué camino quieren seguir después de terminar sus estudios.',
        'Desde Innovación Social y la Fundación Juan del Corral, estuvimos presentes observando y acompañando este proceso, escuchando tanto a los estudiantes como a quienes hacen posible estos espacios.',
      ],
      videos: [
        {
          preview: feriaUniversitaria3,
          video: entrevistaRectorVideo,
          aspectRatio: '4 / 3',
          caption: 'Entrevista al rector William Toro – Feria Universitaria',
          content: [
            'En esta entrevista conversamos con William Toro, rector de la Institución Educativa San Luis Gonzaga de Santa Fe de Antioquia, sobre la importancia de realizar espacios como la Feria Universitaria y el valor que pueden tener para los jóvenes del municipio y de las veredas cercanas.',
            'El video gira alrededor de cómo estas iniciativas pueden ayudar a los estudiantes a conocer nuevas opciones de estudio, descubrir diferentes caminos para su futuro y tomar decisiones con mayor información después de terminar el colegio.',
            'Una conversación que nos permite conocer, desde la mirada educativa, por qué acercar estas oportunidades a los jóvenes puede marcar una diferencia en la construcción de su proyecto de vida.',
          ],
        },
        {
          preview: feriaUniversitaria1,
          video: entrevistaPersoneroVideo,
          aspectRatio: '4 / 3',
          caption: 'Entrevista a Gerónimo – La voz de los estudiantes',
          content: [
            'En esta entrevista conversamos con Gerónimo, representante de los estudiantes, para conocer cómo viven los jóvenes este tipo de actividades y qué significado puede tener para ellos participar en una Feria Universitaria.',
            'El video recoge la mirada de los propios estudiantes sobre la importancia de conocer nuevas opciones de estudio, descubrir diferentes caminos para su futuro y tener espacios donde puedan resolver dudas y pensar en lo que quieren hacer después de terminar el colegio.',
            'Escuchar a los jóvenes también nos permite entender mejor sus expectativas, intereses y la importancia de acercarles oportunidades que puedan aportar a sus decisiones y a la construcción de su futuro.',
          ],
        },
      ],
    },
    {
      slug: 'voluntariado-limpieza',
      tag: 'Voluntariado',
      date: '08 abr, 2026',
      readTime: '3 min',
      views: 511,
      title: 'Jornada de limpieza en el Bosque Seco Tropical',
      excerpt: 'Un grupo de voluntarios recolectó residuos y ayudó a proteger la biodiversidad de este ecosistema único del territorio.',
      image: voluntariadoLimpieza,
      imagePosition: 'center 12%',
      heroImage: voluntariadoSiembra,
      heroCompact: true,
      content: [
        'Un grupo de voluntarios recolectó residuos y ayudó a proteger la biodiversidad de este ecosistema único del territorio.',
      ],
      secondaryHeading: 'Voluntariado que transforma',
      secondaryContent: [
        'En Innovación Social de CADENA, el voluntariado es una forma de compartir conocimientos, experiencias y habilidades para aportar al crecimiento de otras personas. Nuestros colaboradores participan de manera voluntaria en actividades de formación, acompañamiento y fortalecimiento de habilidades, especialmente con jóvenes vinculados al Centro de Excelencia. Así, buscamos crear espacios de aprendizaje, fortalecer los lazos con la comunidad y generar un impacto positivo que conecte a las personas con nuevas oportunidades.',
      ],
      highlights: [
        {
          title: 'Compartimos conocimiento',
          description: 'Nuestros voluntarios aportan su experiencia y conocimientos en diferentes temas para apoyar la formación de los jóvenes.',
        },
        {
          title: 'Acompañamos el crecimiento',
          description: 'También fortalecemos habilidades como la comunicación, el trabajo en equipo, la confianza y el desarrollo personal.',
        },
      ],
    },
    {
      slug: 'premiacion-cuentos',
      tag: 'Concurso de cuentos',
      date: '15 abr, 2026',
      readTime: '3 min',
      views: 693,
      title: '7.º Concurso de Cuento "Volar con la Imaginación"',
      excerpt: 'La Institución Educativa Rural Nurquí realizó una nueva edición del concurso "Volar con la Imaginación", una iniciativa que busca mantener vivo el gusto por la escritura y motivar a niños, jóvenes y adultos a expresar sus ideas por medio de cuentos e historias.',
      image: premiacionCuentos2,
      imagePosition: 'center top',
      heroImage: premiacionCuentos,
      content: [
        'La Institución Educativa Rural Nurquí realizó una nueva edición del concurso "Volar con la Imaginación", una iniciativa que busca mantener vivo el gusto por la escritura y motivar a niños, jóvenes y adultos a expresar sus ideas por medio de cuentos e historias.',
        'La Fundación Juan del Corral acompañó y apoyó este proyecto, reconociendo la importancia de crear espacios donde la imaginación, la creatividad y la lectura tengan un lugar especial dentro de la comunidad.',
        'Antes de la premiación se realizaron diferentes actividades dinámicas que permitieron compartir, aprender y disfrutar alrededor de la escritura. Luego, se reconocieron los cuentos participantes y el esfuerzo de quienes se animaron a crear y contar sus propias historias.',
        'Más que premiar un cuento, esta actividad busca recordar que escribir también es una forma de imaginar, aprender, expresar lo que sentimos y mantener vivas nuestras historias.',
      ],
      quote: 'Cuando una historia se escribe, una idea empieza a volar.',
    },
    {
      slug: 'exploracion-territorios',
      tag: 'Exploración de territorios',
      date: '20 abr, 2026',
      readTime: '4 min',
      views: 357,
      title: 'Constelaciones: historias de mi barrio',
      excerpt: 'Un grupo de jóvenes recorrió el patrimonio industrial de su territorio para reconstruir y contar la memoria de su barrio.',
      image: exploracionTerritorios,
      content: [
        'Un grupo de jóvenes recorrió el patrimonio industrial de su territorio para reconstruir y contar la memoria de su barrio.',
      ],
    },
  ],
}

export const footer = {
  description: 'Estrategia, contenido y crecimiento para marcas que quieren ser vistas.',
  address: 'Medellín, Colombia',
  rights: 'Todos los derechos reservados.',
  columns: [
    {
      title: 'Explorar',
      links: [
        { label: 'Nosotros', href: '#/nosotros' },
        { label: 'Servicios', href: '#servicios' },
        { label: 'Historias', href: '#/historia' },
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
