from fastapi import APIRouter, HTTPException, Depends, File, Form, UploadFile, Security
from fastapi.security import OAuth2PasswordBearer
from typing import Optional
import pymysql
from .UserModels import User
from database_config import get_db
from .Services import UserService

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Security(oauth2_scheme)):
    return UserService.verify_cognito_token(token)

@router.get("/users/getuserbyid/{user_id}", response_model=User)
def read_user(user_id: str, db: pymysql.connections.Connection = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return UserService.get_user(user_id, db)

@router.put("/users/updateuser/{user_id}", response_model=dict)
def update_user(
    user_id: str,
    user_name: str = Form(...),
    user_email: str = Form(...),
    phone_number: str = Form(...),
    role: str = Form(...),
    display_pic: Optional[UploadFile] = File(None),
    db: pymysql.connections.Connection = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return UserService.update_user(user_id, user_name, user_email, phone_number, role, display_pic, db)


@router.get("/users/{user_id}/recent-activity")
def get_recent_activity(user_id: str, db: pymysql.connections.Connection = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return UserService.get_recent_activity(user_id, db)

@router.get("/users/getall/usernames")
def all_user_names(db: pymysql.connections.Connection = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return UserService.all_user_names(db)
