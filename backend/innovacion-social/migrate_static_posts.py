"""
Migra las 4 historias que estaban escritas a mano en
FRONTEND/src/data/content.es.js hacia la base de datos, para que
Mónica pueda editarlas/eliminarlas desde el panel de administración.

Se conserva el mismo slug de cada una para no romper enlaces
existentes. Los campos que el panel todavía no soporta (varios
videos con subtítulos propios, secciones secundarias con su propio
título, traducción al inglés) no se migran — quedan reducidos a
título, categoría, imagen, párrafos y frase destacada.

Se puede correr una sola vez; si el slug ya existe en la base de
datos, se lo salta en vez de duplicarlo.
"""
import json
import os
import shutil
import uuid
from datetime import datetime

from app import app
from models import BlogPost, db

ASSETS_DIR = os.path.join('..', 'FRONTEND', 'src', 'assets')

POSTS = [
    {
        'slug': 'orientacion-vocacional',
        'tag': 'Feria Universitaria',
        'title': 'Explorar hoy para decidir mejor mañana',
        'excerpt': 'Desde el Museo Juan del Corral, acompañamos la Feria Universitaria para conocer de cerca el impacto que este espacio tiene en los jóvenes y en las decisiones que comienzan a tomar sobre su futuro.',
        'content': [
            'Desde el Museo Juan del Corral, acompañamos la Feria Universitaria para conocer de cerca el impacto que este espacio tiene en los jóvenes y en las decisiones que comienzan a tomar sobre su futuro.',
            'Más que una feria, fue un espacio para descubrir posibilidades. Los estudiantes pudieron acercarse a diferentes opciones de formación, resolver dudas y empezar a imaginar qué camino quieren seguir después de terminar sus estudios.',
            'Desde Innovación Social y la Fundación Juan del Corral, estuvimos presentes observando y acompañando este proceso, escuchando tanto a los estudiantes como a quienes hacen posible estos espacios.',
        ],
        'quote': None,
        'image': 'FeriaUniverisitaria2.jpg',
        'date': datetime(2026, 4, 2),
        'read_time': '3 min',
        'views': 842,
    },
    {
        'slug': 'voluntariado-limpieza',
        'tag': 'Voluntariado',
        'title': 'Jornada de limpieza en el Bosque Seco Tropical',
        'excerpt': 'Un grupo de voluntarios recolectó residuos y ayudó a proteger la biodiversidad de este ecosistema único del territorio.',
        'content': [
            'Un grupo de voluntarios recolectó residuos y ayudó a proteger la biodiversidad de este ecosistema único del territorio.',
            'En Innovación Social de CADENA, el voluntariado es una forma de compartir conocimientos, experiencias y habilidades para aportar al crecimiento de otras personas. Nuestros colaboradores participan de manera voluntaria en actividades de formación, acompañamiento y fortalecimiento de habilidades, especialmente con jóvenes vinculados al Centro de Excelencia.',
            'Nuestros voluntarios aportan su experiencia y conocimientos en diferentes temas para apoyar la formación de los jóvenes.',
            'También fortalecemos habilidades como la comunicación, el trabajo en equipo, la confianza y el desarrollo personal.',
        ],
        'quote': None,
        'image': 'monica2.jpg',
        'date': datetime(2026, 4, 8),
        'read_time': '3 min',
        'views': 511,
    },
    {
        'slug': 'premiacion-cuentos',
        'tag': 'Concurso de cuentos',
        'title': '7.º Concurso de Cuento "Volar con la Imaginación"',
        'excerpt': 'La Institución Educativa Rural Nurquí realizó una nueva edición del concurso "Volar con la Imaginación", una iniciativa que busca mantener vivo el gusto por la escritura y motivar a niños, jóvenes y adultos a expresar sus ideas por medio de cuentos e historias.',
        'content': [
            'La Institución Educativa Rural Nurquí realizó una nueva edición del concurso "Volar con la Imaginación", una iniciativa que busca mantener vivo el gusto por la escritura y motivar a niños, jóvenes y adultos a expresar sus ideas por medio de cuentos e historias.',
            'La Fundación Juan del Corral acompañó y apoyó este proyecto, reconociendo la importancia de crear espacios donde la imaginación, la creatividad y la lectura tengan un lugar especial dentro de la comunidad.',
            'Antes de la premiación se realizaron diferentes actividades dinámicas que permitieron compartir, aprender y disfrutar alrededor de la escritura. Luego, se reconocieron los cuentos participantes y el esfuerzo de quienes se animaron a crear y contar sus propias historias.',
            'Más que premiar un cuento, esta actividad busca recordar que escribir también es una forma de imaginar, aprender, expresar lo que sentimos y mantener vivas nuestras historias.',
        ],
        'quote': 'Cuando una historia se escribe, una idea empieza a volar.',
        'image': 'PremiacionCuentos (2).jpg',
        'date': datetime(2026, 4, 15),
        'read_time': '3 min',
        'views': 693,
    },
    {
        'slug': 'exploracion-territorios',
        'tag': 'Exploración de territorios',
        'title': 'Constelaciones: historias de mi barrio',
        'excerpt': 'Un grupo de jóvenes recorrió el patrimonio industrial de su territorio para reconstruir y contar la memoria de su barrio.',
        'content': [
            'Un grupo de jóvenes recorrió el patrimonio industrial de su territorio para reconstruir y contar la memoria de su barrio.',
        ],
        'quote': None,
        'image': 'ExploracionTerritorios.jpg',
        'date': datetime(2026, 4, 20),
        'read_time': '4 min',
        'views': 357,
    },
]


def copy_image(filename, upload_dir):
    src = os.path.join(ASSETS_DIR, filename)
    ext = filename.rsplit('.', 1)[1].lower()
    safe_name = f'{uuid.uuid4().hex}.{ext}'
    dst = os.path.join(upload_dir, safe_name)
    shutil.copyfile(src, dst)
    return safe_name


def main():
    with app.app_context():
        upload_dir = app.config['UPLOAD_FOLDER']
        os.makedirs(upload_dir, exist_ok=True)

        for data in POSTS:
            if BlogPost.query.filter_by(slug=data['slug']).first():
                print(f"ya existe, se salta: {data['slug']}")
                continue

            image_name = copy_image(data['image'], upload_dir)
            post = BlogPost(
                slug=data['slug'],
                tag=data['tag'],
                title=data['title'],
                excerpt=data['excerpt'],
                content=json.dumps(data['content'], ensure_ascii=False),
                quote=data['quote'],
                image_path=image_name,
                video_path=None,
                date=data['date'],
                views=data['views'],
                read_time=data['read_time'],
            )
            db.session.add(post)
            print(f"migrado: {data['slug']}")

        db.session.commit()


if __name__ == '__main__':
    main()
