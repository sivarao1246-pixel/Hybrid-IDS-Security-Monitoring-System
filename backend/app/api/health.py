from fastapi import APIRouter
from app.database.database import DB_PATH
router = APIRouter(prefix="/api", tags=["Health"])
@router.get("/health")
def health():
    return {"status":"healthy","database":"sqlite","database_path":str(DB_PATH)}
