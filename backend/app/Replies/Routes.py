from fastapi import APIRouter, Form, Depends, HTTPException, Security
from fastapi.security import OAuth2PasswordBearer
from typing import List
import pymysql

from .ReplyModel import GetReply, SendReply
from database_config import get_db
from .Services import ReplyService

router = APIRouter()

# OAuth2 scheme for token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Dependency to get the current user
async def get_current_user(token: str = Security(oauth2_scheme)):
    return ReplyService.verify_cognito_token(token)

@router.post("/replies/create", response_model=SendReply)
def create_reply(
    post_id: str = Form(...),
    user_id: str = Form(...),
    content: str = Form(...),
    created_at: str = Form(...), 
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        reply = SendReply(
            post_id=post_id,
            user_id=user_id,
            content=content,
            created_at=created_at 
        )
        return ReplyService.create_reply(reply, db)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/replies/getreply/{post_id}", response_model=List[GetReply])
def read_reply(
    post_id: str, 
    db: pymysql.connections.Connection = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return ReplyService.read_reply(post_id, db)

@router.delete("/replies/delrep/{reply_id}")
def delete_reply(
    reply_id: str, 
    db: pymysql.connections.Connection = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return ReplyService.delete_reply(reply_id, db)