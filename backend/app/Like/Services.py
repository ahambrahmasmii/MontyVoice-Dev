import pymysql
import logging
from fastapi import HTTPException
from .Likemodels import LikeRequest
from botocore.exceptions import ClientError as Boto3Error
import boto3

cognito_client = boto3.client('cognito-idp')

class LikeServices:
    @staticmethod
    def verify_cognito_token(token: str):
        try:
            response = cognito_client.get_user(AccessToken=token)
            logging.info(f"Cognito response: {response}")
            return response
        except cognito_client.exceptions.NotAuthorizedException as e:
            logging.error(f"NotAuthorizedException: {str(e)}")
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        except cognito_client.exceptions.ExpiredCodeException as e:
            logging.error(f"ExpiredCodeException: {str(e)}")
            raise HTTPException(status_code=401, detail="Token has expired")
        except cognito_client.exceptions.InvalidParameterException as e:
            logging.error(f"InvalidParameterException: {str(e)}")
            raise HTTPException(status_code=400, detail="Invalid token parameters")
        except cognito_client.exceptions.UserNotFoundException as e:
            logging.error(f"UserNotFoundException: {str(e)}")
            raise HTTPException(status_code=404, detail="User not found")
        except Boto3Error as e:
            logging.error(f"Unexpected error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to verify token: {str(e)}")
        
    # Service method to like a post
    def like_post_service(self, like_request: LikeRequest, db: pymysql.connections.Connection):
        user_id = like_request.user_id
        is_liked = like_request.is_liked
        post_id = like_request.post_id

        with db.cursor() as cursor:
            # Check if the user exists
            cursor.execute("SELECT user_id FROM User WHERE user_id=%s", (user_id,))
            user = cursor.fetchone()
            if user is None:
                raise HTTPException(status_code=404, detail="User not found")

            # Check if the post exists
            cursor.execute("SELECT post_id, likes FROM Posts WHERE post_id=%s", (post_id,))
            post = cursor.fetchone()
            if post is None:
                raise HTTPException(status_code=404, detail="Post not found")

            # Check if the like record exists
            cursor.execute(
                "SELECT id, is_liked FROM `Likes` WHERE user_id=%s AND post_id=%s",
                (user_id, post_id)
            )
            like = cursor.fetchone()

            if like:
                # Update the existing like record
                if like["is_liked"] != is_liked:  # Only update if the state has changed
                    cursor.execute(
                        "UPDATE `Likes` SET is_liked=%s WHERE id=%s",
                        (is_liked, like["id"])
                    )
                    # Adjust the like count based on the new like state
                    likes_count = post["likes"] if post["likes"] is not None else 0
                    new_likes = likes_count + (1 if is_liked else -1)
                else:
                    new_likes = post["likes"]  # No change in like state
            else:
                # Insert a new like record
                cursor.execute(
                    "INSERT INTO `Likes` (user_id, post_id, is_liked) VALUES (%s, %s, %s)",
                    (user_id, post_id, is_liked)
                )
                likes_count = post["likes"] if post["likes"] is not None else 0
                new_likes = likes_count + (1 if is_liked else 0)

                        # Update the post with the new like count
                cursor.execute(
                "UPDATE Posts SET likes=%s WHERE post_id=%s",
                (new_likes, post_id)
                )
                db.commit()  # Commit the transaction

                return {"likes": new_likes}

    # Service method to unlike a post
    def unlike_post_service(self, unlike, db: pymysql.connections.Connection):
        user_id = unlike.user_id
        post_id = unlike.post_id

        with db.cursor() as cursor:
            # Check if the user exists
            cursor.execute("SELECT user_id FROM User WHERE user_id=%s", (user_id))
            user = cursor.fetchone()
            if user is None:
                raise HTTPException(status_code=404, detail="User not found")

            # Check if the post exists
            cursor.execute("SELECT post_id, likes FROM Posts WHERE post_id=%s", (post_id,))
            post = cursor.fetchone()
            if post is None:
                raise HTTPException(status_code=404, detail="Post not found")

            # Check if the like record exists
            cursor.execute(
                "SELECT id, is_liked FROM `Likes` WHERE user_id=%s AND post_id=%s",
                (user_id, post_id)
            )
            like = cursor.fetchone()

            if like:
                # Update the like count and delete the like record if necessary
                if like["is_liked"]:
                    new_likes = post["likes"] - 1
                    cursor.execute("DELETE FROM `Likes` WHERE id=%s", (like["id"],))
                else:
                    new_likes = post["likes"]
            else:
                new_likes = post["likes"]

            # Update the post's like count
            cursor.execute(
                "UPDATE Posts SET likes=%s WHERE post_id=%s",
                (new_likes, post_id)
            )
            db.commit()

        return {"message": "Post unliked", "likes": new_likes}
    
    # Service method to get the like state of a post
    def get_like_state(self, unlike, db: pymysql.connections.Connection):
        user_id = unlike.user_id
        post_id = unlike.post_id

        with db.cursor() as cursor:
            # Fetch the like state for the given user and post
            cursor.execute(
                "SELECT is_liked FROM `Likes` WHERE user_id=%s AND post_id=%s",
                (user_id, post_id)
            )
            like = cursor.fetchone()
            if like:
                return {"is_liked": like["is_liked"]}
            return {"is_liked": False}
