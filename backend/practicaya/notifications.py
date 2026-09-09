from flask import Blueprint, jsonify

from extensions import db
from helpers import get_current_user, require_user, notification_to_dict
from models import Notification

notifications_bp = Blueprint("notifications", __name__, url_prefix="/api/notifications")


@notifications_bp.route("", methods=["GET"])
@require_user
def list_notifications():
    user = get_current_user()
    items = (
        Notification.query.filter_by(user_id=user.id)
        .order_by(Notification.created_at.desc())
        .limit(30)
        .all()
    )
    return jsonify({"notifications": [notification_to_dict(n) for n in items]}), 200


@notifications_bp.route("/unread-count", methods=["GET"])
@require_user
def unread_count():
    user = get_current_user()
    count = Notification.query.filter_by(user_id=user.id, leido=False).count()
    return jsonify({"unread_count": count}), 200


@notifications_bp.route("/<int:notification_id>/read", methods=["PUT"])
@require_user
def mark_read(notification_id):
    user = get_current_user()
    notification = Notification.query.filter_by(id=notification_id, user_id=user.id).first()
    if not notification:
        return jsonify({"msg": "Notificación no encontrada"}), 404

    notification.leido = True
    db.session.commit()
    return jsonify({"msg": "Notificación marcada como leída"}), 200


@notifications_bp.route("/read-all", methods=["PUT"])
@require_user
def mark_all_read():
    user = get_current_user()
    Notification.query.filter_by(user_id=user.id, leido=False).update({"leido": True})
    db.session.commit()
    return jsonify({"msg": "Notificaciones marcadas como leídas"}), 200
