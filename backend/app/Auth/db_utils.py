sql_signup = """
INSERT INTO User (user_id, password, user_email, user_name)
VALUES (UUID(), %(password)s, %(user_email)s, %(user_name)s)
"""
            