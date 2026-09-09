from flask import Blueprint, jsonify
from flask_socketio import emit, join_room
from sqlalchemy import or_, desc

from extensions import db, socketio
from helpers import get_current_user, require_user
from models import Message, User

chat_bp = Blueprint("chat", __name__, url_prefix="/api/chat")


@chat_bp.route("/contacts", methods=["GET"])
@require_user
def get_contacts():
    user = get_current_user()
    user_id = user.id

    messages = Message.query.filter(
        or_(Message.sender_id == user_id, Message.receiver_id == user_id)
    ).order_by(desc(Message.fecha_envio)).all()

    contacts_dict = {}
    for msg in messages:
        other_id = msg.receiver_id if msg.sender_id == user_id else msg.sender_id
        if other_id not in contacts_dict:
            other = User.query.get(other_id)
            if not other:
                continue

            name = "Usuario"
            photo = ""
            if other.role == "estudiante" and other.student_profile:
                name = other.student_profile.nombre
                photo = other.student_profile.foto_url or ""
            elif other.role == "empresa" and other.company_profile:
                name = other.company_profile.nombre_empresa
                photo = other.company_profile.logo_url or ""

            unread_count = Message.query.filter_by(
                sender_id=other_id, receiver_id=user_id, leido=False
            ).count()

            contacts_dict[other_id] = {
                "id": other_id,
                "name": name,
                "initial": name[0] if name else "?",
                "color": "#638FE9",
                "lastMessage": msg.contenido,
                "time": msg.fecha_envio.strftime("%I:%M %p"),
                "unread": unread_count > 0,
                "unreadCount": unread_count,
                "avatarUrl": photo,
            }

    return jsonify(list(contacts_dict.values())), 200


@chat_bp.route("/unread-count", methods=["GET"])
@require_user
def get_unread_count():
    user = get_current_user()
    count = Message.query.filter_by(receiver_id=user.id, leido=False).count()
    return jsonify({"unread_count": count}), 200


@chat_bp.route("/messages/<int:other_user_id>", methods=["GET"])
@require_user
def get_messages(other_user_id):
    user = get_current_user()
    user_id = user.id

    messages = Message.query.filter(
        or_(
            (Message.sender_id == user_id) & (Message.receiver_id == other_user_id),
            (Message.sender_id == other_user_id) & (Message.receiver_id == user_id),
        )
    ).order_by(Message.fecha_envio).all()

    # Mark as read
    Message.query.filter_by(
        sender_id=other_user_id, receiver_id=user_id, leido=False
    ).update({"leido": True})
    db.session.commit()

    result = []
    for msg in messages:
        result.append({
            "id": msg.id,
            "sender_id": msg.sender_id,
            "receiver_id": msg.receiver_id,
            "text": msg.contenido,
            "time": msg.fecha_envio.strftime("%I:%M %p"),
            "isMine": msg.sender_id == user_id,
        })
    return jsonify(result), 200


@chat_bp.route("/user-info/<int:target_user_id>", methods=["GET"])
@require_user
def get_user_info(target_user_id):
    target = User.query.get(target_user_id)
    if not target:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    name = "Usuario"
    photo = ""
    if target.role == "estudiante" and target.student_profile:
        name = target.student_profile.nombre
        photo = target.student_profile.foto_url or ""
    elif target.role == "empresa" and target.company_profile:
        name = target.company_profile.nombre_empresa
        photo = target.company_profile.logo_url or ""

    return jsonify({
        "id": target.id,
        "name": name,
        "initial": name[0] if name else "?",
        "color": "#638FE9",
        "avatarUrl": photo,
    }), 200


# ─────────────── SOCKETIO EVENTS ───────────────
@socketio.on("connect")
def on_connect():
    print("Client connected")


@socketio.on("disconnect")
def on_disconnect():
    print("Client disconnected")


@socketio.on("join")
def on_join(data):
    room = data["room"]
    join_room(room)
    print(f"User joined room {room}")


@socketio.on("send_message")
def handle_send_message(data):
    sender_id = data.get("sender_id")
    receiver_id = data.get("receiver_id")
    content = data.get("contenido")

    msg = Message(sender_id=sender_id, receiver_id=receiver_id, contenido=content)
    db.session.add(msg)
    db.session.commit()

    message_data = {
        "id": msg.id,
        "sender_id": msg.sender_id,
        "receiver_id": msg.receiver_id,
        "contenido": msg.contenido,
        "fecha_envio": msg.fecha_envio.isoformat(),
        "leido": msg.leido,
    }

    emit("receive_message", message_data, room=str(receiver_id))
    emit("receive_message", message_data, room=str(sender_id))
