import { Link } from 'react-router-dom'

// Los enlaces de este sitio son de dos tipos: rutas de la app ("/blog") y
// anclas dentro de la página de inicio ("#servicios"). Las rutas tienen que
// navegar sin recargar; las anclas siguen siendo <a> normales.
function SmartLink({ href, children, ...rest }) {
  if (href && href.startsWith('/')) {
    return (
      <Link to={href} {...rest}>
        {children}
      </Link>
    )
  }

  return (
    <a href={href} {...rest}>
      {children}
    </a>
  )
}

export default SmartLink
