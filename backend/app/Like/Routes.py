from fastapi import APIRouter, Depends,HTTPException, Security
import pymysql
from fastapi.security import OAuth2PasswordBearer
from database_config import get_db
from .Services import LikeServices
from .Likemodels import LikeRequest, Unlike

# Create a new API router
router = APIRouter()

# Create an instance of the LikeServices class
like_services = LikeServices()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Security(oauth2_scheme)):
    return LikeServices.verify_cognito_token(token)


@router.post("/like/{post_id}")
def like_post(post_id: str, like_request: LikeRequest, db: pymysql.connections.Connection = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if like_request.post_id != post_id:
        raise HTTPException(status_code=400, detail="Post ID mismatch")
    return like_services.like_post_service(like_request, db)

# Define a POST endpoint for unliking a post
@router.post("/unlike/{post_id}")
def unlike_post(post_id: str, unlike: Unlike, db: pymysql.connections.Connection = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if unlike.post_id != post_id:
        raise HTTPException(status_code=400, detail="Post ID mismatch")
    return like_services.unlike_post_service(unlike, db)

@router.get("/like_state/{post_id}/{user_id}")
def get_like_state(post_id: str, user_id: str, db: pymysql.connections.Connection = Depends(get_db), current_user: dict = Depends(get_current_user)):
    unlike = Unlike(user_id=user_id, post_id=post_id)
    return like_services.get_like_state(unlike, db)   
