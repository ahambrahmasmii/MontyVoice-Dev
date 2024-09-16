import pymysql
from fastapi import HTTPException
from .ReplyModel import SendReply, GetReply
from .db_utils import get_reply, create_reply, delete_reply
import boto3
import logging
from botocore.exceptions import ClientError as Boto3Error

# Assuming you have set up the Cognito client
cognito_client = boto3.client('cognito-idp')

class ReplyService:
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

    @staticmethod
    def create_reply(reply: SendReply, db: pymysql.connections.Connection):
        try:
            with db.cursor() as cursor:
                cursor.execute("SELECT 1 FROM Posts WHERE post_id = %s", (reply.post_id,))
                if not cursor.fetchone():
                    raise HTTPException(status_code=404, detail="Post not found")
            
                cursor.execute(create_reply, {
                    'post_id': reply.post_id,
                    'user_id': reply.user_id,
                    'content': reply.content,
                    'created_at': reply.created_at
                })
                db.commit()
            return reply
        except pymysql.Error as e:
            db.rollback()
            print(f"Error creating reply: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to create reply. Error: {str(e)}")

    @staticmethod
    def read_reply(post_id: str, db: pymysql.connections.Connection):
        try:
            with db.cursor(pymysql.cursors.DictCursor) as cursor:
                cursor.execute(get_reply, (post_id,))
                replies = cursor.fetchall()

                if not replies:
                    raise HTTPException(status_code=404, detail="No replies found for this post")

                return [GetReply(**reply) for reply in replies]
        except pymysql.Error as e:
            print(f"Error fetching replies: {e}")
            raise HTTPException(status_code=500, detail="Failed to fetch replies. Please try again later.")

    @staticmethod
    def delete_reply(reply_id: str, db: pymysql.connections.Connection):
        try:
            with db.cursor() as cursor:
                cursor.execute(delete_reply, (reply_id,))
                db.commit()
            return {"detail": "Reply deleted"}
        except pymysql.MySQLError as e:
            db.rollback()
            print(f"Error deleting reply: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to delete reply. Please try again later. Error: {e}")