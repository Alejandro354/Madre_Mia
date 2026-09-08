import os
import re
import uuid
from datetime import datetime, timezone
from urllib.parse import urlparse

from werkzeug.utils import secure_filename

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PASSWORD_RE = re.compile(r"^(?=.*[A-Za-z])(?=.*\d).{8,}$")
PHONE_RE = re.compile(r"^\+?[0-9\s\-()]{7,15}$")

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}
PORTFOLIO_EXTENSIONS = {"pdf", "jpg", "jpeg", "png"}

SOCIAL_DOMAINS = {
    "linkedin": {"linkedin.com", "www.linkedin.com"},
    "github": {"github.com", "www.github.com"},
    "instagram": {"instagram.com", "www.instagram.com"},
}


def utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def is_valid_email(email):
    return bool(EMAIL_RE.match(email or ""))


def validate_password(password):
    return bool(PASSWORD_RE.match(password or ""))


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def allowed_portfolio_file(filename):
    return (
        "." in filename and filename.rsplit(".", 1)[1].lower() in PORTFOLIO_EXTENSIONS
    )


def is_valid_url(value):
    if not value:
        return False
    parsed = urlparse(value)
    return parsed.scheme in ("http", "https") and bool(parsed.netloc)


def is_valid_social_url(red, value):
    if not value or not is_valid_url(value):
        return False
    domain = urlparse(value).netloc.lower()
    return domain in SOCIAL_DOMAINS.get(red, set())


def save_upload(file_storage, upload_folder):
    original = secure_filename(file_storage.filename)
    ext = original.rsplit(".", 1)[1].lower()
    name = f"{uuid.uuid4().hex}.{ext}"
    file_storage.save(os.path.join(upload_folder, name))
    return name


def save_photo(file_storage, upload_folder):
    return save_upload(file_storage, upload_folder)


def remove_file(filename, upload_folder):
    if not filename:
        return
    path = os.path.join(upload_folder, filename)
    if os.path.exists(path):
        os.remove(path)
