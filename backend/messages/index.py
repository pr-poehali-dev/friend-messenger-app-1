"""Отправка и получение сообщений в чатах"""
import json
import os
import psycopg2

SCHEMA = 't_p58878170_friend_messenger_app'

def get_conn():
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.autocommit = True
    return conn

def handler(event: dict, context) -> dict:
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    user_id = params.get('user_id') or event.get('headers', {}).get('X-User-Id')

    if not user_id:
        return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Не авторизован'})}

    conn = get_conn()
    cur = conn.cursor()

    if method == 'GET':
        chat_id = params.get('chat_id')
        if not chat_id:
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'chat_id обязателен'})}

        try:
            cur.execute(f"UPDATE {SCHEMA}.messages SET is_read = TRUE WHERE chat_id = {chat_id} AND sender_id != {user_id}")
        except Exception:
            pass

        cur.execute(f"""
            SELECT m.id, m.text, m.created_at, m.sender_id, m.is_read, u.display_name, u.avatar
            FROM {SCHEMA}.messages m
            JOIN {SCHEMA}.users u ON u.id = m.sender_id
            WHERE m.chat_id = {chat_id}
            ORDER BY m.created_at ASC
            LIMIT 100
        """)
        rows = cur.fetchall()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps([
            {
                'id': r[0],
                'text': r[1],
                'time': r[2].strftime('%H:%M'),
                'sender_id': r[3],
                'sender': 'me' if str(r[3]) == str(user_id) else 'other',
                'is_read': r[4],
                'status': 'read' if r[4] else 'delivered',
                'sender_name': r[5],
                'sender_avatar': r[6],
                'type': 'text',
            } for r in rows
        ])}

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        chat_id = body.get('chat_id')
        text = (body.get('text') or '').strip()

        if not chat_id or not text:
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Заполните все поля'})}

        safe_text = text.replace("'", "''")
        cur.execute(f"""
            INSERT INTO {SCHEMA}.messages (chat_id, sender_id, text)
            VALUES ({chat_id}, {user_id}, '{safe_text}')
            RETURNING id, created_at
        """)
        row = cur.fetchone()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({
            'id': row[0],
            'text': text,
            'time': row[1].strftime('%H:%M'),
            'sender': 'me',
            'sender_id': int(user_id),
            'status': 'sent',
            'type': 'text',
        })}

    conn.close()
    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Неизвестное действие'})}
