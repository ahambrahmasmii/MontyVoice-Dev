from fastapi import APIRouter, Depends, Form, UploadFile, File, Query, Security
from fastapi.security import OAuth2PasswordBearer
from typing import Optional
import pymysql
from database_config import get_db
from .PostModel import Post
from .Services import PostServices


# Create a new API router
router = APIRouter()
post_services = PostServices()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Security(oauth2_scheme)):
    return post_services.verify_cognito_token(token)

# Endpoint to create a new post
@router.post("/posts/create")
def create_post(post_type: str = Form(...),   
                title: str = Form(...),
                description: str = Form(...),
                person: str = Form(...),
                user_id: str = Form(...),
                attachments: Optional[UploadFile] = File(None),
                db: pymysql.connections.Connection = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return post_services.create_post_service(post_type, title, description, person, user_id, attachments, db)

# Endpoint to update an existing post
@router.put("/posts/update/{post_id}", response_model=Post)
def update_post(
    post_id: str,
    post_type: str = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    user_id: str = Form(...),
    person: Optional[str] = Form(None),
    attachments: Optional[UploadFile] = File(None),
    db: pymysql.connections.Connection = Depends(get_db), current_user: dict = Depends(get_current_user)
):
    post_services = PostServices()
    return post_services.update_post_service(
        post_id=post_id,
        post_type=post_type,
        title=title,
        description=description,
        user_id=user_id,
        person=person,
        attachments=attachments,
        db=db
    )

# Endpoint to delete a post
@router.delete("/posts/delete/{post_id}")
def delete_post(post_id: str, db: pymysql.connections.Connection = Depends(get_db), current_user: dict = Depends(get_current_user)):
    post_services = PostServices()
    return post_services.delete_post_service(post_id, db)

# Endpoint to get posts of type "cheers" for a user
# @router.get("/posts/cheers/{user_id}")
# def get_cheers_posts(user_id: str, db: pymysql.connections.Connection = Depends(get_db)):
#     return post_services.get_cheers_posts_service(user_id, db)

# Endpoint to get posts of type "feedback" for a user
@router.get("/posts/feedback/{user_id}")
def get_feedback_posts(user_id: str, db: pymysql.connections.Connection = Depends(get_db), current_user: dict = Depends(get_current_user)):
    post_services = PostServices()
    return post_services.get_feedback_posts_service(user_id, db)

# Endpoint to get posts of type "suggestion" for a user
@router.get("/posts/suggestion/{user_id}")
def get_suggestion_posts(user_id: str, db: pymysql.connections.Connection = Depends(get_db), current_user: dict = Depends(get_current_user)):
    post_services = PostServices()
    return post_services.get_suggestion_posts_service(user_id, db)



@router.get("/posts/cheers/{user_id}")
def get_cheers_posts(user_id: str, page: int = Query(1, ge=1), db: pymysql.connections.Connection = Depends(get_db), current_user: dict = Depends(get_current_user)):
    post_services = PostServices()
    print(f"Received user_id: {user_id}, page: {page}")
    return post_services.get_cheers_posts_service(user_id, page, db)

# @router.get("/posts/feedback/{user_id}")
# def get_feedback_posts(user_id: str, page: int = Query(1, ge=1), db: pymysql.connections.Connection = Depends(get_db)):
#      print(f"Received user_id: {user_id}, page: {page}")
#      return post_services.get_feedback_posts_service(user_id, page, db)

# @router.get("/posts/suggestion/{user_id}")
# def get_suggestion_posts(user_id: str, page: int = Query(1, ge=1), db: pymysql.connections.Connection = Depends(get_db)):
#     print(f"Received user_id: {user_id}, page: {page}")
#     return post_services.get_suggestion_posts_service(user_id, page, db)
