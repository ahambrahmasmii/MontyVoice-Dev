from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

class GetReply(BaseModel):
    reply_id: str
    user_id: str
    replier_name: str
    content: str

class SendReply(BaseModel):
    reply_id: Optional[str]
    post_id: str
    created_at: str
    user_id: str
    content: str