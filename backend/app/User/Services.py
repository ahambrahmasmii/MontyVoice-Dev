import logging
from fastapi import HTTPException
import pymysql
from pymysql.err import MySQLError
from config import BUCKET_NAME, s3_client
from botocore.exceptions import ClientError as Boto3Error
import boto3

cognito_client = boto3.client('cognito-idp')

class UserService:
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
    def get_user(user_id: str, db: pymysql.connections.Connection):
        # Retrieve user information by user_id
        with db.cursor() as cursor:
            cursor.execute("SELECT * FROM User WHERE user_id=%s", (user_id,))
            user = cursor.fetchone()
            if user is None:
                raise HTTPException(status_code=404, detail="User not found")
        return user

    @staticmethod
    def update_user(user_id: str, user_name: str, user_email: str, phone_number: str, role: str, display_pic, db: pymysql.connections.Connection):
        # Update user information including optional display picture
        logging.info(f"Received update request for user_id: {user_id}")
        logging.info(f"Received data: name={user_name}, email={user_email}, phone={phone_number}, role={role}")
        user_data = {
            "user_name": user_name,
            "user_email": user_email,
            "phone_number": phone_number,
            "role": role, 
            "display_pic": None
        }

        if display_pic:
            user_data["display_pic"] = UserService._handle_display_pic(user_id, display_pic)
        
        UserService._update_user_in_db(user_id, user_data, db)
        
        logging.info(f"Returning user data: {user_data}")
        return user_data

    @staticmethod
    def _handle_display_pic(user_id: str, display_pic):
        # Handle the upload of the display picture to S3
        logging.info(f"Display picture received: filename={display_pic.filename}, content_type={display_pic.content_type}")
        print("handling pic outside try")
        try:
            print("handling pic inside try")
            file_content = display_pic.file.read()
            file_name = user_id

            UserService._delete_existing_s3_object(file_name)
            UserService._upload_to_s3(file_name, file_content)

            s3_url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{file_name}"
            logging.info(f"File uploaded successfully. S3 URL: {s3_url}")
            return s3_url
        except Exception as e:
            logging.error(f"Failed to upload image: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")

    @staticmethod
    def _delete_existing_s3_object(file_name: str):
        # Delete existing file from S3 if it exists
        print("deleting s3 outside try")
        try:
            print("deleting s3 inside try")
            s3_client.head_object(Bucket=BUCKET_NAME, Key=file_name)
            logging.info(f"File already exists in S3 bucket. Deleting old file: bucket={BUCKET_NAME}, key={file_name}")
            s3_client.delete_object(Bucket=BUCKET_NAME, Key=file_name)
            logging.info(f"Old file deleted successfully.")
        except s3_client.exceptions.ClientError as e:
            if e.response['Error']['Code'] != '404':
                raise

    @staticmethod
    def _upload_to_s3(file_name: str, file_content):
        # Upload new file to S3
        logging.info(f"Uploading new file to S3: bucket={BUCKET_NAME}, key={file_name}")
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=file_name,
            Body=file_content,
            ContentType='image/png'
        )

    @staticmethod
    def _update_user_in_db(user_id: str, user_data: dict, db: pymysql.connections.Connection):
        # Update user information in the database
        with db.cursor() as cursor:
            sql = """
            UPDATE User SET phone_number=%(phone_number)s, 
            role=%(role)s, user_email=%(user_email)s, user_name=%(user_name)s,
            display_pic=%(display_pic)s
            WHERE user_id=%(user_id)s
            """
            cursor.execute(sql, {**user_data, "user_id": user_id})
            db.commit()

    @staticmethod
    def get_recent_activity(user_id: str, db: pymysql.connections.Connection):
        # Retrieve recent posts and replies by user_id
        try:
            with db.cursor() as cursor:
                posts = UserService._get_recent_posts(user_id, cursor)
                replies = UserService._get_recent_replies(user_id, cursor)

                recent_activity = sorted(posts + replies, key=lambda x: x['created_at'], reverse=True)

        except MySQLError as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

        return recent_activity

    @staticmethod
    def _get_recent_posts(user_id: str, cursor):
        # Fetch recent posts by user_id
        cursor.execute("""
            SELECT title, created_at, 'post' AS activity_type
            FROM Posts
            WHERE poster_id = %s
            ORDER BY created_at DESC
            LIMIT 2
        """, (user_id,))
        return cursor.fetchall() or []

    @staticmethod
    def _get_recent_replies(user_id: str, cursor):
        # Fetch recent replies by user_id
        cursor.execute("""
            SELECT content AS title, created_at, 'reply' AS activity_type
            FROM Reply
            WHERE user_id = %s
            ORDER BY created_at DESC
            LIMIT 2
        """, (user_id,))
        return cursor.fetchall() or []

    @staticmethod
    def all_user_names(db: pymysql.connections.Connection):
        try:
            with db.cursor(pymysql.cursors.DictCursor) as cursor:  # Use DictCursor
                cursor.execute("SELECT user_name FROM User")
                user_names = cursor.fetchall()
                print("Fetched user names:", user_names)  # Debug logging
            
                # Process the results into a list of names
                processed_names = [name['user_name'] for name in user_names]
                
                print("Processed names:", processed_names)  # Debug logging
            
                # Return an empty list if no users found, instead of raising an exception
                return processed_names
        except pymysql.MySQLError as e:
            print(f"Database error: {str(e)}")  # Debug logging
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
