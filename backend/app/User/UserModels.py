from pydantic import BaseModel,EmailStr
from typing import Optional

class User(BaseModel):
    user_id: Optional[str]
    display_pic: Optional[str]
    password: Optional[str]
    phone_number: Optional[str]
    role: Optional[str]
    user_email: EmailStr
    user_name: str

class UserLogin(BaseModel):
    user_email: EmailStr
    password: str