import json
import os
import re
import uuid
from datetime import datetime
from functools import wraps

import jwt
from flask import Blueprint, current_app, jsonify, request

from models import BlogPost, db

blog_bp = Blueprint('blog', __name__)

ALLOWED_IMAGE_EXT = {'jpg', 'jpeg', 'png', 'webp', 'gif'}
ALLOWED_VIDEO_EXT = {'mp4', 'mov', 'webm'}
MAX_IMAGE_MB = 8
MAX_VIDEO_MB = 60
MAX_TITLE_LEN = 120
MAX_PARAGRAPH_LEN = 800
MAX_PARAGRAPHS = 6

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


def delete_upload(filename):
    if not filename:
        return
    path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    if os.path.exists(path):
        try:
            os.remove(path)
        except OSError:
            pass


@blog_bp.route('/api/blog', methods=['GET'])
def list_posts():
    posts = BlogPost.query.order_by(BlogPost.date.desc()).all()
    return jsonify([p.to_dict() for p in posts])


@blog_bp.route('/api/blog/<slug>', methods=['GET'])
def get_post(slug):
    post = BlogPost.query.filter_by(slug=slug).first()
    if not post:
        return jsonify({'error': 'No encontrado'}), 404
    post.views = (post.views or 0) + 1
    db.session.commit()
    return jsonify(post.to_dict())


@blog_bp.route('/api/blog', methods=['POST'])
@token_required
def create_post():
    title = (request.form.get('title') or '').strip()
    tag = (request.form.get('tag') or '').strip()
    excerpt = (request.form.get('excerpt') or '').strip()
    quote = (request.form.get('quote') or '').strip() or None
    read_time = (request.form.get('readTime') or '3 min').strip()

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
    if not isinstance(paragraphs, list) or not paragraphs:
        return jsonify({'error': 'Agregá al menos un párrafo'}), 400
    if len(paragraphs) > MAX_PARAGRAPHS:
        return jsonify({'error': f'Máximo {MAX_PARAGRAPHS} párrafos'}), 400
    for p in paragraphs:
        if not isinstance(p, str) or not p.strip():
            return jsonify({'error': 'Los párrafos no pueden estar vacíos'}), 400
        if len(p) > MAX_PARAGRAPH_LEN:
            return jsonify({'error': f'Cada párrafo debe tener máximo {MAX_PARAGRAPH_LEN} caracteres'}), 400

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

    slug = unique_slug(slugify(title))
    post = BlogPost(
        slug=slug,
        tag=tag,
        title=title,
        excerpt=excerpt or paragraphs[0][:180],
        content=json.dumps(paragraphs, ensure_ascii=False),
        quote=quote,
        image_path=image_name,
        video_path=video_name,
        date=datetime.utcnow(),
        views=0,
        read_time=read_time,
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

    content_raw = request.form.get('content')
    if content_raw is not None:
        try:
            paragraphs = json.loads(content_raw)
        except (ValueError, TypeError):
            return jsonify({'error': 'Formato de contenido inválido'}), 400
        if not isinstance(paragraphs, list) or not paragraphs:
            return jsonify({'error': 'Agregá al menos un párrafo'}), 400
        if len(paragraphs) > MAX_PARAGRAPHS:
            return jsonify({'error': f'Máximo {MAX_PARAGRAPHS} párrafos'}), 400
        for p in paragraphs:
            if not isinstance(p, str) or not p.strip():
                return jsonify({'error': 'Los párrafos no pueden estar vacíos'}), 400
            if len(p) > MAX_PARAGRAPH_LEN:
                return jsonify({'error': f'Cada párrafo debe tener máximo {MAX_PARAGRAPH_LEN} caracteres'}), 400
        post.content = json.dumps(paragraphs, ensure_ascii=False)
        post.excerpt = excerpt or paragraphs[0][:180]

    image = request.files.get('image')
    if image and image.filename:
        image_name, err = save_upload(image, ALLOWED_IMAGE_EXT, MAX_IMAGE_MB)
        if err:
            return jsonify({'error': err}), 400
        delete_upload(post.image_path)
        post.image_path = image_name

    video = request.files.get('video')
    if video and video.filename:
        video_name, err = save_upload(video, ALLOWED_VIDEO_EXT, MAX_VIDEO_MB)
        if err:
            return jsonify({'error': err}), 400
        delete_upload(post.video_path)
        post.video_path = video_name

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
    db.session.delete(post)
    db.session.commit()
    return jsonify({'ok': True})
