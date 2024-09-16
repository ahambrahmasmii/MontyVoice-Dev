from pydantic import BaseModel

class LikeRequest(BaseModel):
    user_id: str  # UUID as a string
    post_id: str  # UUID as a string
    is_liked: bool

class Unlike(BaseModel):
    user_id: str  # UUID as a string
    post_id: str  # UUID as a string