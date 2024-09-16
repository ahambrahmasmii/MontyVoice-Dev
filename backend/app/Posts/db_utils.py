# get_cheers_post_query="""
#             SELECT p.*, u1.user_name AS poster_name, u1.display_pic AS poster_dp, u2.user_name AS postee_name,
#                 COALESCE(l.is_liked, FALSE) AS is_liked
#             FROM Posts p
#             LEFT JOIN User u1 ON p.poster_id = u1.user_id
#             LEFT JOIN User u2 ON p.postee_id = u2.user_id
#             LEFT JOIN `Likes` l ON p.post_id = l.post_id AND l.user_id = %s
#             WHERE p.post_type='cheers'
#             """
get_feedback_post_query="""
            SELECT p.*, u1.user_name AS poster_name, u1.display_pic AS poster_dp, u2.user_name AS postee_name,
                COALESCE(l.is_liked, FALSE) AS is_liked
            FROM Posts p
            LEFT JOIN User u1 ON p.poster_id = u1.user_id
            LEFT JOIN User u2 ON p.postee_id = u2.user_id
            LEFT JOIN `Likes` l ON p.post_id = l.post_id AND l.user_id = %s
            WHERE p.post_type='feedback' AND (p.poster_id=%s OR p.postee_id=%s)
            """

get_suggestion_post_query="""
            SELECT p.*, u1.user_name AS poster_name, u1.display_pic AS poster_dp, u2.user_name AS postee_name,
                COALESCE(l.is_liked, FALSE) AS is_liked
            FROM Posts p
            LEFT JOIN User u1 ON p.poster_id = u1.user_id
            LEFT JOIN User u2 ON p.postee_id = u2.user_id
            LEFT JOIN `Likes` l ON p.post_id = l.post_id AND l.user_id = %s
            WHERE p.post_type='suggestion' AND (p.poster_id=%s OR p.postee_id=%s)
            """



# utils.py

get_cheers_posts_query = """
        SELECT p.*, u1.user_name AS poster_name, u1.display_pic AS poster_dp, u2.user_name AS postee_name,
            COALESCE(l.is_liked, FALSE) AS is_liked
        FROM Posts p
        LEFT JOIN User u1 ON p.poster_id = u1.user_id
        LEFT JOIN User u2 ON p.postee_id = u2.user_id
        LEFT JOIN Likes l ON p.post_id = l.post_id AND l.user_id = %s
        WHERE p.post_type = 'cheers'
        LIMIT 10 OFFSET %s
    """

# get_feedback_posts_query= """
#         SELECT p.*, u1.user_name AS poster_name, u1.display_pic AS poster_dp, u2.user_name AS postee_name,
#             COALESCE(l.is_liked, FALSE) AS is_liked
#         FROM Posts p
#         LEFT JOIN User u1 ON p.poster_id = u1.user_id
#         LEFT JOIN User u2 ON p.postee_id = u2.user_id
#         LEFT JOIN Likes l ON p.post_id = l.post_id AND l.user_id = %s
#         WHERE p.post_type = 'feedback' 
#         LIMIT 10 OFFSET %s
#     """
# get_suggestion_posts_query= """
#         SELECT p.*, u1.user_name AS poster_name, u1.display_pic AS poster_dp, u2.user_name AS postee_name,
#             COALESCE(l.is_liked, FALSE) AS is_liked
#         FROM Posts p
#         LEFT JOIN User u1 ON p.poster_id = u1.user_id
#         LEFT JOIN User u2 ON p.postee_id = u2.user_id
#         LEFT JOIN Likes l ON p.post_id = l.post_id AND l.user_id = %s
#         WHERE p.post_type = 'suggestion'  
#         LIMIT 10 OFFSET %s
#     """



 
