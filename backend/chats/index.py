"""Управление чатами: список чатов, создание, поиск пользователей"""
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
        action = params.get('action', 'list')

        if action == 'search':
            q = params.get('q', '')
            cur.execute(f"""
                SELECT id, username, display_name, avatar, last_seen
                FROM {SCHEMA}.users
                WHERE (username ILIKE '%{q}%' OR display_name ILIKE '%{q}%')
                AND id != {user_id}
                LIMIT 20
            """)
            rows = cur.fetchall()
            conn.close()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps([
                {'id': r[0], 'username': r[1], 'display_name': r[2], 'avatar': r[3]} for r in rows
            ])}

        # List chats for user
        cur.execute(f"""
            SELECT
                c.id,
                c.is_group,
                c.name,
                u2.id as other_user_id,
                u2.display_name as other_name,
                u2.avatar as other_avatar,
                u2.last_seen,
                (SELECT text FROM {SCHEMA}.messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_msg,
                (SELECT created_at FROM {SCHEMA}.messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_time,
                (SELECT COUNT(*) FROM {SCHEMA}.messages WHERE chat_id = c.id AND is_read = FALSE AND sender_id != {user_id}) as unread
            FROM {SCHEMA}.chats c
            JOIN {SCHEMA}.chat_members cm ON cm.chat_id = c.id AND cm.user_id = {user_id}
            LEFT JOIN {SCHEMA}.chat_members cm2 ON cm2.chat_id = c.id AND cm2.user_id != {user_id} AND c.is_group = FALSE
            LEFT JOIN {SCHEMA}.users u2 ON u2.id = cm2.user_id
            ORDER BY last_time DESC NULLS LAST
        """)
        rows = cur.fetchall()
        conn.close()
        chats = []
        for r in rows:
            chats.append({
                'id': r[0],
                'is_group': r[1],
                'name': r[2] if r[1] else r[4],
                'avatar': r[5] or '?',
                'other_user_id': r[3],
                'last_message': r[7] or '',
                'last_time': r[8].strftime('%H:%M') if r[8] else '',
                'unread': r[9],
                'online': False,
            })
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps(chats)}

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        action = body.get('action')

        if action == 'create_or_get':
            other_id = body.get('other_user_id')
            # Check if direct chat already exists
            cur.execute(f"""
                SELECT c.id FROM {SCHEMA}.chats c
                JOIN {SCHEMA}.chat_members cm1 ON cm1.chat_id = c.id AND cm1.user_id = {user_id}
                JOIN {SCHEMA}.chat_members cm2 ON cm2.chat_id = c.id AND cm2.user_id = {other_id}
                WHERE c.is_group = FALSE
                LIMIT 1
            """)
            row = cur.fetchone()
            if row:
                conn.close()
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'chat_id': row[0]})}

            cur.execute(f"INSERT INTO {SCHEMA}.chats (is_group) VALUES (FALSE) RETURNING id")
            chat_id = cur.fetchone()[0]
            cur.execute(f"INSERT INTO {SCHEMA}.chat_members (chat_id, user_id) VALUES ({chat_id}, {user_id})")
            cur.execute(f"INSERT INTO {SCHEMA}.chat_members (chat_id, user_id) VALUES ({chat_id}, {other_id})")
            conn.close()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'chat_id': chat_id})}

    conn.close()
    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Неизвестное действие'})}