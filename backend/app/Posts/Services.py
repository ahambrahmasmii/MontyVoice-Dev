import pymysql
import uuid
import logging
from typing import Optional
from fastapi import HTTPException, UploadFile
from pymysql.err import MySQLError
from config import BUCKET_NAME, s3_client
from .PostModel import Post
import traceback
from .db_utils import get_feedback_post_query, get_suggestion_post_query
from .db_utils import get_cheers_posts_query
from botocore.exceptions import ClientError as Boto3Error
import boto3
# from events.handlers import put_event

cognito_client = boto3.client('cognito-idp')

class PostServices:
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

    # Service method to create a new post
    def create_post_service(self, post_type: str, title: str, description: str, person: str, user_id: str, attachments: Optional[UploadFile], db: pymysql.connections.Connection):
         cursor = None
         try:
             print("Starting create_post_service")
             print(f"Input parameters: post_type={post_type}, title={title}, description={description}, person={person}, user_id={user_id}, attachments={attachments}")
                
             cursor = db.cursor(pymysql.cursors.DictCursor)
                
                # Test database connection
             cursor.execute("SELECT 1")
             result = cursor.fetchone()
             print(f"Database connection test: {result}")
                
                # Check Posts table structure
             cursor.execute("DESCRIBE Posts")
             table_structure = cursor.fetchall()
             print(f"Posts table structure: {table_structure}")
                
                # Check User table
             cursor.execute("SELECT COUNT(*) FROM User")
             user_count = cursor.fetchone()
             print(f"User table count: {user_count}")
                
             print(f"Fetching user_id for person: {person}")
                
                # Get user_id of the person being posted about
             sql_get_postee_id = "SELECT user_id FROM User WHERE user_name = %s"
             cursor.execute(sql_get_postee_id, (person,))
             postee_id_result = cursor.fetchone()
                
             if not postee_id_result:
                 print("User not found for the given person name")
                 raise HTTPException(status_code=404, detail="User not found for the given person name")
                
             postee_id = postee_id_result['user_id']
             print(f"postee_id: {postee_id}")
                
             post_id = str(uuid.uuid4())
             print(f"Generated post_id: {post_id}")
                
                # S3 configuration check
             print(f"S3 bucket name: {BUCKET_NAME}")
             print(f"S3 client region: {s3_client.meta.region_name}")
                
                # Handle file upload to S3
             post_pic_url = None
             if attachments:
                 try:
                     print(f"Uploading file to S3 for post_id: {post_id}")
                     file_content = attachments.file.read()
                     file_name = f"{post_id}.{attachments.filename.split('.')[-1]}.png"
                     response = s3_client.put_object(Bucket=BUCKET_NAME, Key=file_name, Body=file_content, ContentType='image/png')
                     post_pic_url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{file_name}"
                     print(f"File uploaded successfully, post_pic_url: {post_pic_url}")
                 except Exception as e:
                     print(f"Failed to upload image: {str(e)}")
                     raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")
             else:
                 print("No attachments provided, post_pic_url set to None")
                
                # Insert post data into the Post table
             post_data_to_insert = {
                    "post_id": post_id,
                    "description": description,
                    "person": person,
                    "post_type": post_type,
                    "postee_id": postee_id,
                    "poster_id": user_id,
                    "title": title,
                    "post_pic": post_pic_url
                }
             print(f"Post data to insert: {post_data_to_insert}")
                
             sql_insert_post = """
             INSERT INTO Posts (post_id, description, person, post_type, postee_id, poster_id, title, post_pic)
             VALUES (%(post_id)s, %(description)s, %(person)s, %(post_type)s, %(postee_id)s, %(poster_id)s, %(title)s, %(post_pic)s)
             """
             cursor.execute(sql_insert_post, post_data_to_insert)
             db.commit()
             print("Post data inserted successfully")

             print("Post created successfully")
             return {"status": "success", "message": "Post created successfully"}

         except MySQLError as e:
                error_message = f"Database error: {str(e)}"
                print(error_message)
                if db.open:
                    db.rollback()
                raise HTTPException(status_code=500, detail=error_message)
         except Exception as e:
                error_message = f"An unexpected error occurred: {str(e)}"
                print(error_message)
                print(f"Exception type: {type(e).__name__}")
                print("Exception traceback:")
                traceback.print_exc()
                if db and db.open:
                    db.rollback()
                raise HTTPException(status_code=500, detail=error_message)
         finally:
                if cursor:
                    cursor.close()
        
    # Service method to update an existing post
    def update_post_service(self,post_id: str, post_type: str, title: str, description: str, user_id: str, person: Optional[str], attachments: Optional[UploadFile], db: pymysql.connections.Connection):
        try:
            print(f"Starting update_post_service for post_id: {post_id}")

            # Fetch existing post details
            with db.cursor(pymysql.cursors.DictCursor) as cursor:
                sql_get_post_details = "SELECT * FROM Posts WHERE post_id = %s"
                print(f"Executing SQL: {sql_get_post_details} with post_id: {post_id}")
                cursor.execute(sql_get_post_details, (post_id,))
                post_details = cursor.fetchone()
                print(f"Post details fetched: {post_details}")

            if not post_details:
                print("Post not found")
                raise HTTPException(status_code=404, detail="Post not found")

            # Ensure the person cannot be changed
            if post_details['poster_id'] != user_id:
                print(f"User {user_id} is not authorized to update post {post_id}")
                raise HTTPException(status_code=403, detail="You are not authorized to update this post")

            postee_id = post_details['postee_id']
            person = post_details['person']
            post_pic_url = post_details['post_pic']

            # Handle file upload to S3 if a new attachment is provided
            if attachments:
                try:
                    print(f"Reading attachment file for post_id: {post_id}")
                    file_content = attachments.file.read()
                    file_name = f"{post_id}.{attachments.filename.split('.')[-1]}.png"
                    print(f"Uploading file {file_name} to S3 bucket {BUCKET_NAME}")
                    response = s3_client.put_object(Bucket=BUCKET_NAME, Key=file_name, Body=file_content, ContentType='image/png')
                    post_pic_url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{file_name}"
                    print(f"File uploaded successfully, post_pic_url: {post_pic_url}")
                except Exception as e:
                    print(f"Failed to upload image: {str(e)}")
                    raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")
            else:
                post_pic_url = None
                print(f"No new attachment provided, post_pic_url set to None")

            # Update post data in the Post table
            post_data_to_update = {
                "post_id": post_id,
                "description": description if description is not None else post_details['description'],
                "person": person if person is not None else post_details['person'],
                "post_type": post_type if post_type is not None else post_details['post_type'],
                "postee_id": postee_id,
                "poster_id": user_id,
                "title": title if title is not None else post_details['title'],
                "post_pic": post_pic_url
            }
            print(f"Updating post with data: {post_data_to_update}")

            with db.cursor() as cursor:
                sql_update_post = """
                UPDATE Posts
                SET description = %(description)s,
                    post_type = %(post_type)s,
                    title = %(title)s,
                    post_pic = %(post_pic)s
                WHERE post_id = %(post_id)s
                """
                print(f"Executing SQL: {sql_update_post}")
                cursor.execute(sql_update_post, post_data_to_update)
                db.commit()
                print("Post updated successfully")

            # Fetch the updated post details
            with db.cursor(pymysql.cursors.DictCursor) as cursor:
                sql_get_updated_post = "SELECT * FROM Posts WHERE post_id = %s"
                print(f"Executing SQL: {sql_get_updated_post} with post_id: {post_id}")
                cursor.execute(sql_get_updated_post, (post_id,))
                updated_post = cursor.fetchone()
                print(f"Updated post details fetched: {updated_post}")

            if not updated_post:
                print("Post not found after update")
                raise HTTPException(status_code=404, detail="Post not found after update")

            # Convert the updated post data to a Post object
            print(f"Returning updated post details: {updated_post}")
            return Post(
                post_id=updated_post['post_id'],
                description=updated_post['description'],
                person=updated_post['person'],
                post_type=updated_post['post_type'],
                postee_id=updated_post['postee_id'],
                poster_id=updated_post['poster_id'],
                title=updated_post['title'],
                user_id=updated_post['poster_id']
            )

        except pymysql.MySQLError as e:
            print(f"Database error: {str(e)}")
            traceback.print_exc()
            if db.open:
                db.rollback()
            raise HTTPException(status_code=500, detail="Database error")
            
        except Exception as e:
            print(f"An unexpected error occurred: {str(e)}")
            traceback.print_exc()
            traceback.print_exc()
            if db and db.open:
                db.rollback()
            raise HTTPException(status_code=500, detail="An unexpected error occurred")
        finally:
            if cursor:
                cursor.close()


            

    # Service method to delete a post
    def delete_post_service(self, post_id: str, db: pymysql.connections.Connection):
        with db.cursor() as cursor:
            cursor.execute("DELETE FROM Posts WHERE post_id=%s", (post_id,))
            db.commit()
        return {"detail": "Post deleted"}
    

    # Service method to get cheers posts for a user
    # def get_cheers_posts_service(self, user_id: str, db: pymysql.connections.Connection):
    #     with db.cursor(pymysql.cursors.DictCursor) as cursor:
    #         cursor.execute(get_cheers_post_query, (user_id,))
    #         posts = cursor.fetchall()
    #     return posts

    # Service method to get feedback posts for a user
    def get_feedback_posts_service(self, user_id: str, db: pymysql.connections.Connection):
        with db.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(get_feedback_post_query, (user_id, user_id, user_id))
            posts = cursor.fetchall()
        return posts

    # Service method to get suggestion posts for a user
    def get_suggestion_posts_service(self, user_id: str, db: pymysql.connections.Connection):
        with db.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(get_suggestion_post_query, (user_id, user_id, user_id))
            posts = cursor.fetchall()
        return posts



    def get_cheers_posts_service(self, user_id: str, page: int, db: pymysql.connections.Connection):
        offset = (page - 1) * 10
        query = get_cheers_posts_query
        with db.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(query, (user_id, offset))
            posts = cursor.fetchall()
        return posts

    # def get_feedback_posts_service(self, user_id: str, page: int, db: pymysql.connections.Connection):
    #     offset = (page - 1) * 10
    #     query = get_feedback_posts_query
    #     with db.cursor(pymysql.cursors.DictCursor) as cursor:
    #         cursor.execute(query, (user_id, user_id, user_id, offset))
    #         posts = cursor.fetchall()
    #     return posts

    # def get_suggestion_posts_service(self, user_id: str, page: int,db: pymysql.connections.Connection):
    #     offset = (page - 1) * 10
    #     query = get_suggestion_posts_query
    #     with db.cursor(pymysql.cursors.DictCursor) as cursor:
    #         cursor.execute(query, (user_id, user_id, user_id, offset))
    #         posts = cursor.fetchall()
    #     return posts

