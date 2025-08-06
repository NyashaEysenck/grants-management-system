from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from .user import PyObjectId

class DocumentVersion(BaseModel):
    id: str
    version_number: int
    filename: str
    uploaded_by: EmailStr
    uploaded_at: datetime
    file_size: str
    notes: Optional[str] = None

class Document(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str
    folder: str  # Applications, Projects, Awards, Reports
    current_version: int
    versions: List[DocumentVersion]
    created_by: EmailStr
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_modified: datetime = Field(default_factory=datetime.utcnow)
    tags: List[str] = []

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}