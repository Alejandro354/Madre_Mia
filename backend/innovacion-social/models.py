import json
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

_MESES_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']


def format_date_es(dt):
    return f'{dt.day:02d} {_MESES_ES[dt.month - 1]}, {dt.year}'


class Admin(db.Model):
    __tablename__ = 'admins'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    failed_attempts = db.Column(db.Integer, default=0, nullable=False)
    locked_until = db.Column(db.DateTime, nullable=True)


class BlogPost(db.Model):
    __tablename__ = 'blog_posts'

    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(255), unique=True, nullable=False)
    tag = db.Column(db.String(120), nullable=False)
    title = db.Column(db.String(120), nullable=False)
    excerpt = db.Column(db.String(300), nullable=False)
    content = db.Column(db.Text, nullable=False)  # JSON: lista de párrafos
    quote = db.Column(db.Text, nullable=True)
    image_path = db.Column(db.String(255), nullable=False)
    image_placement = db.Column(db.String(10), default='top', nullable=False)
    video_path = db.Column(db.String(255), nullable=True)
    video_path_2 = db.Column(db.String(255), nullable=True)
    date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    views = db.Column(db.Integer, default=0, nullable=False)
    read_time = db.Column(db.String(20), nullable=False)

    def to_dict(self):
        videos = []
        if self.video_path:
            videos.append({'video': f'/uploads/{self.video_path}'})
        if self.video_path_2:
            videos.append({'video': f'/uploads/{self.video_path_2}'})

        return {
            'slug': self.slug,
            'tag': self.tag,
            'title': self.title,
            'excerpt': self.excerpt,
            'content': json.loads(self.content),
            'quote': self.quote,
            'image': f'/uploads/{self.image_path}',
            'imagePlacement': self.image_placement,
            'video': f'/uploads/{self.video_path}' if self.video_path else None,
            'video2': f'/uploads/{self.video_path_2}' if self.video_path_2 else None,
            'videos': videos or None,
            'date': format_date_es(self.date),
            'views': self.views,
            'readTime': self.read_time,
            'source': 'dynamic',
        }
