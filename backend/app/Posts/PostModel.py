from pydantic import BaseModel
from typing import Optional
 

class Post(BaseModel):
    post_id: Optional[str]
    description: str
    person: Optional[str]
    post_type: str
    postee_id: str
    poster_id: str
    title: str
    user_id: str
 
     