import json
import os
import re
import uuid
from datetime import datetime
from functools import wraps

import jwt
import requests
from flask import Blueprint, current_app, jsonify, request

from models import BlogPost, db

blog_bp = Blueprint('blog', __name__)

ALLOWED_IMAGE_EXT = {'jpg', 'jpeg', 'png', 'webp', 'gif'}
ALLOWED_VIDEO_EXT = {'mp4', 'mov', 'webm'}
MAX_IMAGE_MB = 15
MAX_VIDEO_MB = 60
MAX_TITLE_LEN = 120
MAX_PARAGRAPH_LEN = 800
MAX_PARAGRAPHS = 6
MAX_HEADING_LEN = 150
MAX_TAGS = 10
MAX_TAG_LEN = 40
MAX_SLUG_LEN = 200

ACCENTS = str.maketrans('áàäéèëíìïóòöúùüñ', 'aaaeeeiiiooouuun')


def token_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Token requerido'}), 401
        token = auth_header.split(' ', 1)[1]
        try:
            jwt.decode(token, current_app.config['JWT_SECRET'], algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Sesión expirada, iniciá sesión de nuevo'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token inválido'}), 401
        return f(*args, **kwargs)

    return wrapper


def slugify(text):
    text = text.strip().lower().translate(ACCENTS)
    text = re.sub(r'[^a-z0-9]+', '-', text).strip('-')
    return text or 'post'


def unique_slug(base):
    slug = base
    i = 2
    while BlogPost.query.filter_by(slug=slug).first():
        slug = f'{base}-{i}'
        i += 1
    return slug


def ext_ok(filename, allowed):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed


def save_upload(file_storage, allowed_ext, max_mb):
    filename = file_storage.filename or ''
    if not ext_ok(filename, allowed_ext):
        return None, 'Formato de archivo no permitido'

    file_storage.stream.seek(0, os.SEEK_END)
    size_mb = file_storage.stream.tell() / (1024 * 1024)
    file_storage.stream.seek(0)
    if size_mb > max_mb:
        return None, f'El archivo supera el tamaño máximo de {max_mb}MB'

    ext = filename.rsplit('.', 1)[1].lower()
    safe_name = f'{uuid.uuid4().hex}.{ext}'
    upload_dir = current_app.config['UPLOAD_FOLDER']
    os.makedirs(upload_dir, exist_ok=True)
    file_storage.save(os.path.join(upload_dir, safe_name))
    return safe_name, None


def validate_paragraphs(paragraphs):
    if not isinstance(paragraphs, list) or not paragraphs:
        return None, 'Agregá al menos un párrafo'
    if len(paragraphs) > MAX_PARAGRAPHS:
        return None, f'Máximo {MAX_PARAGRAPHS} párrafos'

    cleaned = []
    for p in paragraphs:
        video_slot = None
        image = None
        image_position = None
        if isinstance(p, str):
            heading, text = '', p.strip()
        elif isinstance(p, dict):
            heading = str(p.get('heading') or '').strip()
            text = str(p.get('text') or '').strip()
            video_raw = p.get('video')
            if video_raw not in (None, ''):
                try:
                    video_slot = int(video_raw)
                except (TypeError, ValueError):
                    return None, 'Video de párrafo inválido'
                if video_slot not in (1, 2):
                    return None, 'Video de párrafo inválido'
            image_raw = p.get('image')
            if isinstance(image_raw, str) and image_raw.startswith('/uploads/'):
                image = image_raw
            position_raw = p.get('imagePosition')
            if position_raw in ('above', 'below'):
                image_position = position_raw
        else:
            return None, 'Los párrafos no pueden estar vacíos'

        if not text:
            return None, 'Los párrafos no pueden estar vacíos'
        if len(text) > MAX_PARAGRAPH_LEN:
            return None, f'Cada párrafo debe tener máximo {MAX_PARAGRAPH_LEN} caracteres'
        if len(heading) > MAX_HEADING_LEN:
            return None, f'Cada subtítulo debe tener máximo {MAX_HEADING_LEN} caracteres'

        if heading or video_slot or image or image_position:
            item = {'text': text}
            if heading:
                item['heading'] = heading
            if video_slot:
                item['video'] = video_slot
            if image:
                item['image'] = image
            if image_position:
                item['imagePosition'] = image_position
            cleaned.append(item)
        else:
            cleaned.append(text)

    return cleaned, None


def validate_tags(raw):
    if raw in (None, ''):
        return [], None
    try:
        tags = json.loads(raw)
    except (ValueError, TypeError):
        return None, 'Formato de etiquetas inválido'
    if not isinstance(tags, list):
        return None, 'Formato de etiquetas inválido'
    if len(tags) > MAX_TAGS:
        return None, f'Máximo {MAX_TAGS} etiquetas'

    cleaned = []
    seen = set()
    for tag in tags:
        if not isinstance(tag, str):
            return None, 'Formato de etiquetas inválido'
        value = tag.strip()
        if not value:
            continue
        if len(value) > MAX_TAG_LEN:
            return None, f'Cada etiqueta debe tener máximo {MAX_TAG_LEN} caracteres'
        key = value.lower()
        if key in seen:
            continue
        seen.add(key)
        cleaned.append(value)

    return cleaned, None


def validate_content_en(paragraphs):
    """Como validate_paragraphs, pero para la versión en inglés (opcional):
    cada párrafo puede quedar vacío (sin heading ni text) para indicar que
    ese párrafo no tiene traducción y el frontend debe mostrar el español
    en esa posición."""
    if not isinstance(paragraphs, list):
        return None, 'Formato de contenido en inglés inválido'
    if len(paragraphs) > MAX_PARAGRAPHS:
        return None, f'Máximo {MAX_PARAGRAPHS} párrafos'

    cleaned = []
    for p in paragraphs:
        if isinstance(p, str):
            heading, text = '', p.strip()
        elif isinstance(p, dict):
            heading = str(p.get('heading') or '').strip()
            text = str(p.get('text') or '').strip()
        elif p is None:
            heading, text = '', ''
        else:
            return None, 'Formato de contenido en inglés inválido'

        if len(text) > MAX_PARAGRAPH_LEN:
            return None, f'Cada párrafo debe tener máximo {MAX_PARAGRAPH_LEN} caracteres'
        if len(heading) > MAX_HEADING_LEN:
            return None, f'Cada subtítulo debe tener máximo {MAX_HEADING_LEN} caracteres'

        if not text:
            cleaned.append('')
        elif heading:
            cleaned.append({'text': text, 'heading': heading})
        else:
            cleaned.append(text)

    return cleaned, None


def read_translation_fields():
    """Lee los campos opcionales en inglés del form. Devuelve
    (dict_de_campos, error). Los campos ausentes o vacíos quedan en None."""
    title_en = (request.form.get('titleEn') or '').strip() or None
    if title_en and len(title_en) > MAX_TITLE_LEN:
        return None, f'El título en inglés no puede superar {MAX_TITLE_LEN} caracteres'

    excerpt_en = (request.form.get('excerptEn') or '').strip() or None
    tag_en = (request.form.get('tagEn') or '').strip() or None
    quote_en = (request.form.get('quoteEn') or '').strip() or None

    try:
        paragraphs_en = json.loads(request.form.get('contentEn') or '[]')
    except (ValueError, TypeError):
        return None, 'Formato de contenido en inglés inválido'
    paragraphs_en, err = validate_content_en(paragraphs_en)
    if err:
        return None, err
    if not excerpt_en:
        first_translated = next((p for p in paragraphs_en if paragraph_text(p)), None)
        if first_translated:
            excerpt_en = make_excerpt(paragraph_text(first_translated))

    return {
        'title_en': title_en,
        'excerpt_en': excerpt_en,
        'tag_en': tag_en,
        'quote_en': quote_en,
        'content_en': json.dumps(paragraphs_en, ensure_ascii=False),
    }, None


def paragraph_image_path(paragraph):
    if isinstance(paragraph, dict) and isinstance(paragraph.get('image'), str):
        return paragraph['image'].rsplit('/', 1)[-1]
    return None


def apply_paragraph_images(paragraphs, old_paragraphs=None):
    old_images = set()
    if old_paragraphs:
        old_images = {p for p in (paragraph_image_path(item) for item in old_paragraphs) if p}

    for i, paragraph in enumerate(paragraphs):
        file_field = request.files.get(f'paragraph_image_{i}')
        if file_field and file_field.filename:
            image_name, err = save_upload(file_field, ALLOWED_IMAGE_EXT, MAX_IMAGE_MB)
            if err:
                return None, err
            if isinstance(paragraph, str):
                paragraph = {'text': paragraph}
                paragraphs[i] = paragraph
            paragraph['image'] = f'/uploads/{image_name}'
            paragraph.setdefault('imagePosition', 'below')

    new_images = {p for p in (paragraph_image_path(item) for item in paragraphs) if p}
    for stale in old_images - new_images:
        delete_upload(stale)

    return paragraphs, None


def paragraph_text(paragraph):
    return paragraph['text'] if isinstance(paragraph, dict) else paragraph


def make_excerpt(text, limit=220):
    text = text.strip()
    if len(text) <= limit:
        return text
    truncated = text[:limit].rsplit(' ', 1)[0].rstrip(' ,;:.-')
    return truncated + '…'


def delete_upload(filename):
    if not filename:
        return
    path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    if os.path.exists(path):
        try:
            os.remove(path)
        except OSError:
            pass


MYMEMORY_CHUNK_LEN = 480  # la API anónima de MyMemory corta textos largos


def translate_text(text, target='en', source='es'):
    """Traduce con MyMemory (gratis, sin API key). Si falla o el texto está
    vacío, devuelve el original tal cual — nunca revienta el request."""
    text = (text or '').strip()
    if not text:
        return ''

    chunks = [text[i:i + MYMEMORY_CHUNK_LEN] for i in range(0, len(text), MYMEMORY_CHUNK_LEN)] or ['']
    translated_chunks = []
    for chunk in chunks:
        try:
            resp = requests.get(
                'https://api.mymemory.translated.net/get',
                params={'q': chunk, 'langpair': f'{source}|{target}'},
                timeout=8,
            )
            data = resp.json()
            translated = data.get('responseData', {}).get('translatedText')
            translated_chunks.append(translated or chunk)
        except (requests.RequestException, ValueError):
            translated_chunks.append(chunk)

    return ' '.join(translated_chunks)


def ensure_translation(post):
    """Completa los campos *_en que falten traduciéndolos automáticamente,
    y guarda el resultado para no tener que volver a traducir. Un admin que
    haya escrito su propia traducción manual nunca se pisa: solo se traduce
    lo que está vacío."""
    changed = False

    if not post.title_en:
        post.title_en = translate_text(post.title)
        changed = True
    if not post.tag_en:
        post.tag_en = translate_text(post.tag)
        changed = True
    if not post.excerpt_en:
        post.excerpt_en = translate_text(post.excerpt)
        changed = True
    if post.quote and not post.quote_en:
        post.quote_en = translate_text(post.quote)
        changed = True

    content = json.loads(post.content)
    content_en = json.loads(post.content_en or '[]')
    needs_content = len(content_en) < len(content) or any(
        not paragraph_text(content_en[i]) for i in range(len(content_en))
    )
    if needs_content:
        new_content_en = []
        for i, paragraph in enumerate(content):
            existing = content_en[i] if i < len(content_en) else None
            if existing and paragraph_text(existing):
                new_content_en.append(existing)
                continue
            heading = paragraph.get('heading') if isinstance(paragraph, dict) else None
            translated_text = translate_text(paragraph_text(paragraph))
            translated_heading = translate_text(heading) if heading else ''
            if translated_heading:
                new_content_en.append({'text': translated_text, 'heading': translated_heading})
            else:
                new_content_en.append(translated_text)
        post.content_en = json.dumps(new_content_en, ensure_ascii=False)
        changed = True

    if changed:
        db.session.commit()


@blog_bp.route('/api/blog', methods=['GET'])
def list_posts():
    posts = BlogPost.query.order_by(BlogPost.date.desc()).all()
    for post in posts:
        ensure_translation(post)
    return jsonify([p.to_dict() for p in posts])


@blog_bp.route('/api/blog/<slug>', methods=['GET'])
def get_post(slug):
    post = BlogPost.query.filter_by(slug=slug).first()
    if not post:
        return jsonify({'error': 'No encontrado'}), 404
    post.views = (post.views or 0) + 1
    db.session.commit()
    ensure_translation(post)
    return jsonify(post.to_dict())


@blog_bp.route('/api/blog', methods=['POST'])
@token_required
def create_post():
    title = (request.form.get('title') or '').strip()
    tag = (request.form.get('tag') or '').strip()
    excerpt = (request.form.get('excerpt') or '').strip()
    quote = (request.form.get('quote') or '').strip() or None
    read_time = (request.form.get('readTime') or '3 min').strip()
    image_placement = request.form.get('imagePlacement')
    image_placement = image_placement if image_placement in ('top', 'bottom') else 'top'

    try:
        paragraphs = json.loads(request.form.get('content') or '[]')
    except (ValueError, TypeError):
        return jsonify({'error': 'Formato de contenido inválido'}), 400

    if not title:
        return jsonify({'error': 'El título es obligatorio'}), 400
    if len(title) > MAX_TITLE_LEN:
        return jsonify({'error': f'El título no puede superar {MAX_TITLE_LEN} caracteres'}), 400
    if not tag:
        return jsonify({'error': 'La categoría es obligatoria'}), 400
    tags, err = validate_tags(request.form.get('tags'))
    if err:
        return jsonify({'error': err}), 400
    paragraphs, err = validate_paragraphs(paragraphs)
    if err:
        return jsonify({'error': err}), 400
    paragraphs, err = apply_paragraph_images(paragraphs)
    if err:
        return jsonify({'error': err}), 400
    translation, err = read_translation_fields()
    if err:
        return jsonify({'error': err}), 400

    image = request.files.get('image')
    if not image or not image.filename:
        return jsonify({'error': 'La imagen es obligatoria'}), 400
    image_name, err = save_upload(image, ALLOWED_IMAGE_EXT, MAX_IMAGE_MB)
    if err:
        return jsonify({'error': err}), 400

    video_name = None
    video = request.files.get('video')
    if video and video.filename:
        video_name, err = save_upload(video, ALLOWED_VIDEO_EXT, MAX_VIDEO_MB)
        if err:
            return jsonify({'error': err}), 400

    video_name_2 = None
    video2 = request.files.get('video2')
    if video2 and video2.filename:
        video_name_2, err = save_upload(video2, ALLOWED_VIDEO_EXT, MAX_VIDEO_MB)
        if err:
            return jsonify({'error': err}), 400

    slug_input = (request.form.get('slug') or '').strip()
    base_slug = slugify(slug_input)[:MAX_SLUG_LEN] if slug_input else slugify(title)
    slug = unique_slug(base_slug)
    post = BlogPost(
        slug=slug,
        tag=tag,
        tags=json.dumps(tags, ensure_ascii=False),
        title=title,
        excerpt=excerpt or make_excerpt(paragraph_text(paragraphs[0])),
        content=json.dumps(paragraphs, ensure_ascii=False),
        quote=quote,
        image_path=image_name,
        image_placement=image_placement,
        video_path=video_name,
        video_path_2=video_name_2,
        date=datetime.utcnow(),
        views=0,
        read_time=read_time,
        **translation,
    )
    db.session.add(post)
    db.session.commit()
    return jsonify(post.to_dict()), 201


@blog_bp.route('/api/blog/<slug>', methods=['PUT'])
@token_required
def update_post(slug):
    post = BlogPost.query.filter_by(slug=slug).first()
    if not post:
        return jsonify({'error': 'No encontrado'}), 404

    title = (request.form.get('title') or post.title).strip()
    tag = (request.form.get('tag') or post.tag).strip()
    excerpt = (request.form.get('excerpt') or '').strip()
    quote = request.form.get('quote')
    read_time = (request.form.get('readTime') or post.read_time).strip()

    if not title:
        return jsonify({'error': 'El título es obligatorio'}), 400
    if len(title) > MAX_TITLE_LEN:
        return jsonify({'error': f'El título no puede superar {MAX_TITLE_LEN} caracteres'}), 400
    if not tag:
        return jsonify({'error': 'La categoría es obligatoria'}), 400

    tags_raw = request.form.get('tags')
    if tags_raw is not None:
        tags, err = validate_tags(tags_raw)
        if err:
            return jsonify({'error': err}), 400
        post.tags = json.dumps(tags, ensure_ascii=False)

    translation, err = read_translation_fields()
    if err:
        return jsonify({'error': err}), 400
    post.title_en = translation['title_en']
    post.excerpt_en = translation['excerpt_en']
    post.tag_en = translation['tag_en']
    post.quote_en = translation['quote_en']
    post.content_en = translation['content_en']

    slug_input = (request.form.get('slug') or '').strip()
    if slug_input:
        requested_slug = slugify(slug_input)[:MAX_SLUG_LEN]
        # Si coincide con el slug que ya tiene este mismo post, no hay nada
        # que reasignar (evita que unique_slug le agregue un sufijo -2 al
        # encontrarlo a él mismo como "ya existente").
        if requested_slug != post.slug:
            post.slug = unique_slug(requested_slug)

    content_raw = request.form.get('content')
    if content_raw is not None:
        try:
            paragraphs = json.loads(content_raw)
        except (ValueError, TypeError):
            return jsonify({'error': 'Formato de contenido inválido'}), 400
        paragraphs, err = validate_paragraphs(paragraphs)
        if err:
            return jsonify({'error': err}), 400
        old_paragraphs = json.loads(post.content)
        paragraphs, err = apply_paragraph_images(paragraphs, old_paragraphs)
        if err:
            return jsonify({'error': err}), 400
        post.content = json.dumps(paragraphs, ensure_ascii=False)
        post.excerpt = excerpt or make_excerpt(paragraph_text(paragraphs[0]))

    image = request.files.get('image')
    if image and image.filename:
        image_name, err = save_upload(image, ALLOWED_IMAGE_EXT, MAX_IMAGE_MB)
        if err:
            return jsonify({'error': err}), 400
        delete_upload(post.image_path)
        post.image_path = image_name

    image_placement = request.form.get('imagePlacement')
    if image_placement in ('top', 'bottom'):
        post.image_placement = image_placement

    video = request.files.get('video')
    if video and video.filename:
        video_name, err = save_upload(video, ALLOWED_VIDEO_EXT, MAX_VIDEO_MB)
        if err:
            return jsonify({'error': err}), 400
        delete_upload(post.video_path)
        post.video_path = video_name
    elif request.form.get('removeVideo') == '1':
        delete_upload(post.video_path)
        post.video_path = None

    video2 = request.files.get('video2')
    if video2 and video2.filename:
        video_name_2, err = save_upload(video2, ALLOWED_VIDEO_EXT, MAX_VIDEO_MB)
        if err:
            return jsonify({'error': err}), 400
        delete_upload(post.video_path_2)
        post.video_path_2 = video_name_2
    elif request.form.get('removeVideo2') == '1':
        delete_upload(post.video_path_2)
        post.video_path_2 = None

    post.title = title
    post.tag = tag
    post.read_time = read_time
    if quote is not None:
        post.quote = quote.strip() or None

    db.session.commit()
    return jsonify(post.to_dict())


@blog_bp.route('/api/blog/<slug>', methods=['DELETE'])
@token_required
def delete_post(slug):
    post = BlogPost.query.filter_by(slug=slug).first()
    if not post:
        return jsonify({'error': 'No encontrado'}), 404

    delete_upload(post.image_path)
    delete_upload(post.video_path)
    delete_upload(post.video_path_2)
    for paragraph in json.loads(post.content):
        image_name = paragraph_image_path(paragraph)
        if image_name:
            delete_upload(image_name)
    db.session.delete(post)
    db.session.commit()
    return jsonify({'ok': True})
