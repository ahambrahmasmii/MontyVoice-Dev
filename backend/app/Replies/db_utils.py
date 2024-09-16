get_reply="""
SELECT Reply.reply_id, Reply.user_id, Reply.content, User.user_name AS replier_name
FROM Reply
LEFT JOIN User ON Reply.user_id = User.user_id
WHERE Reply.post_id = %s
"""

create_reply = """
INSERT INTO Reply (reply_id, post_id, user_id, content, created_at)
VALUES (UUID(), %(post_id)s, %(user_id)s, %(content)s, %(created_at)s)
"""

delete_reply = """
DELETE FROM Reply
WHERE reply_id = %s
"""