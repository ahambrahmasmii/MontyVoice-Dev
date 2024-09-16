from fastapi import APIRouter, Depends
import pymysql
from .Services import AuthService
from .UserModels import User, UserLogin
from database_config import get_db


router = APIRouter()

#route for signup
@router.post("/signup")
def signup(user: User, db: pymysql.connections.Connection = Depends(get_db)):
    return AuthService.signup(db, user)

#route for login
@router.post("/login")
def login(user_login: UserLogin, db: pymysql.connections.Connection = Depends(get_db)):
    return AuthService.login(db, user_login)