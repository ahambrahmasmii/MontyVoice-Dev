from pydantic import BaseModel,EmailStr
from typing import Optional

# class User(BaseModel):
#     user_email: str
#     user_name: str
#     password: str

# class UserLogin(BaseModel):
#     user_email: str
#     password: str

class User(BaseModel):
    user_email: EmailStr
    user_name: str
    password: str

class UserLogin(BaseModel):
    user_email: EmailStr
    password: str