"""Регистрация и вход пользователей мессенджера"""
import json
import os
import hashlib
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p58878170_friend_messenger_app')

def get_conn():
    dsn = os.environ['DATABASE_URL']
    if '?' in dsn:
        dsn += f'&options=-csearch_path%3D{SCHEMA}'
    else:
        dsn += f'?options=-csearch_path%3D{SCHEMA}'
    return psycopg2.connect(dsn)

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def handler(event: dict, context) -> dict:
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    action = body.get('action')
    username = (body.get('username') or '').strip().lower()
    password = body.get('password') or ''
    display_name = (body.get('display_name') or username).strip()

    if not username or not password:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Заполните все поля'})}

    conn = get_conn()
    cur = conn.cursor()

    if action == 'register':
        cur.execute(f"SELECT id FROM users WHERE username = '{username}'")
        if cur.fetchone():
            conn.close()
            return {'statusCode': 409, 'headers': headers, 'body': json.dumps({'error': 'Имя пользователя занято'})}

        avatar = display_name[:2].upper() if display_name else username[:2].upper()
        pw_hash = hash_password(password)
        cur.execute(
            f"INSERT INTO users (username, display_name, avatar, password_hash) VALUES ('{username}', '{display_name}', '{avatar}', '{pw_hash}') RETURNING id"
        )
        user_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({
            'id': user_id, 'username': username, 'display_name': display_name, 'avatar': avatar
        })}

    elif action == 'login':
        pw_hash = hash_password(password)
        cur.execute(f"SELECT id, username, display_name, avatar FROM users WHERE username = '{username}' AND password_hash = '{pw_hash}'")
        row = cur.fetchone()
        conn.close()
        if not row:
            return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Неверный логин или пароль'})}
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({
            'id': row[0], 'username': row[1], 'display_name': row[2], 'avatar': row[3]
        })}

    conn.close()
    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Неизвестное действие'})}