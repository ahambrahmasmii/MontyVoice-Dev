from fastapi import HTTPException
import pymysql
from config import pwd_context
from .db_utils import sql_signup
 

# class AuthService:
#     # Method to verify if the provided plain password matches the hashed password
#     def verify_password(plain_password, hashed_password):
#         return pwd_context.verify(plain_password, hashed_password)

#     # Method to hash a plain password
#     def get_password_hash(password):
#         return pwd_context.hash(password)
    
#     # Function to sign up a new user
#     def signup(db, user):
#         # Hash the password received from the user
#         hashed_password = AuthService.get_password_hash(user.password)
        
#         # Convert the user object to a dictionary and replace the plain password with the hashed password
#         user_data = user.dict()
#         user_data["password"] = hashed_password
        
#         # Using a database cursor to execute the SQL insert statement
#         with db.cursor() as cursor:
#             try:
#                 # Execute the SQL statement defined in sql_signup with the user data
#                 cursor.execute(sql_signup, user_data)
#                 # Commit the transaction to save the changes in the database
#                 db.commit()
#             except pymysql.MySQLError as e:
#                 # Raise an HTTPException if the email is already registered
#                 raise HTTPException(status_code=400, detail="Email already registered")
        
#         # Return the user object after successful signup
#         return user
    
#     # Function to log in an existing user
#     def login(db, user_login):
#         # Using a database cursor to execute the SQL select statement
#         with db.cursor() as cursor:
#             # Query the User table to fetch the user record by email
#             cursor.execute("SELECT * FROM User WHERE user_email=%s", (user_login.user_email,))
#             user = cursor.fetchone()
            
#             # Check if the user exists and if the password is correct
#             if not user or not AuthService.verify_password(user_login.password, user["password"]):
#                 # Raise an HTTPException if the email or password is incorrect
#                 raise HTTPException(status_code=400, detail="Invalid email or password")
        
#         # Return a success message and the user ID after successful login
#         return {"message": "Login successful", "user_id": user["user_id"]}

# import os
# from fastapi import HTTPException
# from database_config import get_db
# from config import cognito_client


# class AuthService:
#     def signup(db, user):
#         USER_POOL_ID = "us-east-1_2uNLb4caR"
#         APP_CLIENT_ID = "2loavnldncjhcsnl8k8el2rceh"
#         try:
            
#             response = cognito_client.sign_up(
#                 ClientId=APP_CLIENT_ID,
#                 Username=user.user_email,
#                 Password=user.password,
#                 UserAttributes=[
#                     {'Name': 'email', 'Value': user.user_email},
#                     {'Name': 'name', 'Value': user.user_name}
#                 ]
#             )
#             print("Response: ", response)
            
#             cognito_client.admin_confirm_sign_up(
#                 UserPoolId=USER_POOL_ID,
#                 Username=user.user_email
#             )
            
#             user_details = cognito_client.admin_get_user(
#                 UserPoolId=USER_POOL_ID,
#                 Username=user.user_email
#             )
#             print("User: ", response)
#             sub = next(attr['Value'] for attr in user_details['UserAttributes'] if attr['Name'] == 'sub')

#             with db.cursor() as cursor:
#                 sql = """
#                 INSERT INTO User (user_id, user_email, user_name, cognito_sub)
#                 VALUES (UUID(), %(user_email)s, %(user_name)s, %(cognito_sub)s)
#                 """
#                 cursor.execute(sql, {"user_email": user.user_email, "user_name": user.user_name, "cognito_sub": sub})
#                 db.commit()
            
#             return {"message": "User signed up successfully"}
        
#         except cognito_client.exceptions.UsernameExistsException:
#             raise HTTPException(status_code=400, detail="Email already registered")
#         except Exception as e:
#             raise HTTPException(status_code=400, detail=str(e))
        

    # def login(db, user_login):
    #     APP_CLIENT_ID = "2loavnldncjhcsnl8k8el2rceh"
    #     try:
    #         response = cognito_client.initiate_auth(
    #             ClientId=APP_CLIENT_ID,
    #             AuthFlow='USER_PASSWORD_AUTH',
    #             AuthParameters={
    #                 'USERNAME': user_login.user_email,
    #                 'PASSWORD': user_login.password
    #             }
    #         )

    #         id_token = response['AuthenticationResult']['AccessToken']
            
    #         with db.cursor() as cursor:
    #             cursor.execute("SELECT * FROM User WHERE user_email=%s", (user_login.user_email,))
    #             user = cursor.fetchone()
    #             if not user:
    #                 raise HTTPException(status_code=404, detail="User not found")
    #             user_id = user['user_id']

    #         return {"message": "Login successful", "token": id_token, "user_id": user_id, "user_email": user_login.user_email}
        
    #     except cognito_client.exceptions.NotAuthorizedException:
    #         raise HTTPException(status_code=400, detail="Invalid email or password")
    #     except Exception as e:
    #         raise HTTPException(status_code=400, detail=str(e))






# import os
# from fastapi import HTTPException
# from database_config import get_db
# from config import cognito_client


# class AuthService:
#     def signup(db, user):
#         USER_POOL_ID = "us-east-1_2uNLb4caR"
#         APP_CLIENT_ID = "2loavnldncjhcsnl8k8el2rceh"
#         try:
#             response = cognito_client.sign_up(
#                 ClientId=APP_CLIENT_ID,
#                 Username=user.user_email,
#                 Password=user.password,
#                 UserAttributes=[
#                     {'Name': 'email', 'Value': user.user_email},
#                     {'Name': 'name', 'Value': user.user_name}
#                 ]
#             )
#             print("Signup response: ", response)

#             cognito_client.admin_confirm_sign_up(
#                 UserPoolId=USER_POOL_ID,
#                 Username=user.user_email
#             )

#             user_details = cognito_client.admin_get_user(
#                 UserPoolId=USER_POOL_ID,
#                 Username=user.user_email
#             )
#             print("User details: ", user_details)

#             sub = next(attr['Value'] for attr in user_details['UserAttributes'] if attr['Name'] == 'sub')

#             with db.cursor() as cursor:
#                 sql = """
#                 INSERT INTO User (user_id, user_email, user_name, cognito_sub)
#                 VALUES (UUID(), %(user_email)s, %(user_name)s, %(cognito_sub)s)
#                 """
#                 cursor.execute(sql, {"user_email": user.user_email, "user_name": user.user_name, "cognito_sub": sub})
#                 db.commit()

#             return {"message": "User signed up successfully"}

#         except cognito_client.exceptions.UsernameExistsException:
#             raise HTTPException(status_code=400, detail="Email already registered")
#         except Exception as e:
#             print(f"Error: {str(e)}")
#             raise HTTPException(status_code=400, detail=str(e))


#working locally
# class AuthService:
#     def signup(db, user):
#         USER_POOL_ID = "us-east-1_2uNLb4caR"
#         APP_CLIENT_ID = "2loavnldncjhcsnl8k8el2rceh"
#         try:
#             response = cognito_client.sign_up(
#                 ClientId=APP_CLIENT_ID,
#                 Username=user.user_email,
#                 Password=user.password,
#                 UserAttributes=[
#                     {'Name': 'email', 'Value': user.user_email},
#                     {'Name': 'name', 'Value': user.user_name}
#                 ]
#             )
#             print("Signup response: ", response)

#             cognito_client.admin_confirm_sign_up(
#                 UserPoolId=USER_POOL_ID,
#                 Username=user.user_email
#             )

#             user_details = cognito_client.admin_get_user(
#                 UserPoolId=USER_POOL_ID,
#                 Username=user.user_email
#             )
#             print("User details: ", user_details)

#             sub = next(attr['Value'] for attr in user_details['UserAttributes'] if attr['Name'] == 'sub')

#             with db.cursor() as cursor:
#                 sql = """
#                 INSERT INTO User (user_id, user_email, user_name, cognito_sub)
#                 VALUES (UUID(), %(user_email)s, %(user_name)s, %(cognito_sub)s)
#                 """
#                 cursor.execute(sql, {"user_email": user.user_email, "user_name": user.user_name, "cognito_sub": sub})
#                 db.commit()

#             return {"message": "User signed up successfully"}

#         except cognito_client.exceptions.UsernameExistsException:
#             raise HTTPException(status_code=400, detail="Email already registered")
#         except Exception as e:
#             print(f"Error: {str(e)}")
#             raise HTTPException(status_code=400, detail=str(e))

        

#     def login(db, user_login):
#         APP_CLIENT_ID = "2loavnldncjhcsnl8k8el2rceh"
#         try:
#             response = cognito_client.initiate_auth(
#                 ClientId=APP_CLIENT_ID,
#                 AuthFlow='USER_PASSWORD_AUTH',
#                 AuthParameters={
#                     'USERNAME': user_login.user_email,
#                     'PASSWORD': user_login.password
#                 }
#             )
            
#             print("Login response: ", response)

#             id_token = response['AuthenticationResult']['AccessToken']

#             with db.cursor() as cursor:
#                 cursor.execute("SELECT * FROM User WHERE user_email=%s", (user_login.user_email,))
#                 user = cursor.fetchone()
#                 if not user:
#                     raise HTTPException(status_code=404, detail="User not found")
#                 user_id = user['user_id']

#             return {
#                 "message": "Login successful",
#                 "token": id_token,
#                 "user_id": user_id,
#                 "user_email": user_login.user_email
#             }

#         except cognito_client.exceptions.NotAuthorizedException:
#             raise HTTPException(status_code=400, detail="Invalid email or password")
#         except Exception as e:
#             print(f"Error: {str(e)}")
#             raise HTTPException(status_code=400, detail=str(e))



import os
import logging
from fastapi import HTTPException
from database_config import get_db
from config import cognito_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AuthService:
    @staticmethod
    def signup(db, user):
        USER_POOL_ID = "us-east-1_2uNLb4caR"
        APP_CLIENT_ID = "2loavnldncjhcsnl8k8el2rceh"
        try:
            logger.info("Starting signup process")
            response = cognito_client.sign_up(
                ClientId=APP_CLIENT_ID,
                Username=user.user_email,
                Password=user.password,
                UserAttributes=[
                    {'Name': 'email', 'Value': user.user_email},
                    {'Name': 'name', 'Value': user.user_name}
                ]
            )
            logger.info(f"Signup response: {response}")

            logger.info("Confirming signup")
            cognito_client.admin_confirm_sign_up(
                UserPoolId=USER_POOL_ID,
                Username=user.user_email
            )

            logger.info("Getting user details")
            user_details = cognito_client.admin_get_user(
                UserPoolId=USER_POOL_ID,
                Username=user.user_email
            )
            logger.info(f"User details: {user_details}")

            sub = next(attr['Value'] for attr in user_details['UserAttributes'] if attr['Name'] == 'sub')

            logger.info("Inserting user into database")
            with db.cursor() as cursor:
                sql = """
                INSERT INTO User (user_id, user_email, user_name, cognito_sub)
                VALUES (UUID(), %(user_email)s, %(user_name)s, %(cognito_sub)s)
                """
                cursor.execute(sql, {"user_email": user.user_email, "user_name": user.user_name, "cognito_sub": sub})
                db.commit()

            logger.info("Signup process completed successfully")
            return {"message": "User signed up successfully"}

        except cognito_client.exceptions.UsernameExistsException:
            logger.error("Email already registered")
            raise HTTPException(status_code=400, detail="Email already registered")
        except Exception as e:
            logger.error(f"Error during signup: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    def login(db, user_login):
        APP_CLIENT_ID = "2loavnldncjhcsnl8k8el2rceh"
        try:
            logger.info("Starting login process")
            response = cognito_client.initiate_auth(
                ClientId=APP_CLIENT_ID,
                AuthFlow='USER_PASSWORD_AUTH',
                AuthParameters={
                    'USERNAME': user_login.user_email,
                    'PASSWORD': user_login.password
                }
            )
            
            logger.info(f"Login response: {response}")

            id_token = response['AuthenticationResult']['AccessToken']

            logger.info("Fetching user from database")
            with db.cursor() as cursor:
                cursor.execute("SELECT * FROM User WHERE user_email=%s", (user_login.user_email,))
                user = cursor.fetchone()
                if not user:
                    logger.error("User not found in database")
                    raise HTTPException(status_code=404, detail="User not found")
                user_id = user['user_id']

            logger.info("Login process completed successfully")
            return {
                "message": "Login successful",
                "token": id_token,
                "user_id": user_id,
                "user_email": user_login.user_email
            }

        except cognito_client.exceptions.NotAuthorizedException:
            logger.error("Invalid email or password")
            raise HTTPException(status_code=400, detail="Invalid email or password")
        except Exception as e:
            logger.error(f"Error during login: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
    
