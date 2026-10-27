from contextlib import asynccontextmanager
from datetime import datetime, timezone
import json

from bson import ObjectId
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
from pymongo.errors import DuplicateKeyError
from jose import JWTError, jwt
import os
from dotenv import load_dotenv

from db import client, users_collection, reviews_collection, ensure_indexes
from auth import hash_password, verify_password, create_token
from gapi import analyze_code
from typing import Literal


load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is missing from your .env file")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Fail early if Atlas is unreachable, and create the indexes we need.
    client.admin.command("ping")
    ensure_indexes()
    yield
    client.close()


app = FastAPI(title="Enterprise Code Reviewer API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def public_user(user: dict) -> dict:
    """Return safe user fields; never return password_hash."""
    return {
        "user_id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
    }


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id or not ObjectId.is_valid(user_id):
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise credentials_exception
    return user


# Pydantic request/response schemas
class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(char.isdigit() for char in value):
            raise ValueError("Password must contain at least one digit")
        return value


class UserResponse(BaseModel):
    user_id: str
    name: str
    email: EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class CodeReview(BaseModel):
    code: str = Field(min_length=1)
    language: str = Field(min_length=1)
    focus: Literal["general", "security", "performance"] = "general"


@app.get("/")
def home():
    return {"message": "Code Reviewer is running!"}


@app.get("/db-check")
def db_check():
    client.admin.command("ping")
    return {"database": "connected"}


@app.post("/auth/signup", status_code=201)
def signup(user: UserCreate):
    normalized_email = str(user.email).lower()
    document = {
        "name": user.name,
        "email": normalized_email,
        "password_hash": hash_password(user.password),
        "created_at": datetime.now(timezone.utc),
    }
    try:
        result = users_collection.insert_one(document)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    saved_user = users_collection.find_one({"_id": result.inserted_id})
    token = create_token({"sub": str(saved_user["_id"])})
    return {
        **public_user(saved_user),
        "created_at": iso_utc(saved_user["created_at"]),
        "token": token,
        "access_token": token,
    }


@app.post("/auth/login")
def login(credentials: LoginRequest):
    normalized_email = str(credentials.email).lower()
    user = users_collection.find_one({"email": normalized_email})

    if not user or not verify_password(
        credentials.password, user["password_hash"]
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_token({"sub": str(user["_id"])})
    return {
        **public_user(user),
        "created_at": iso_utc(user["created_at"]),
        "token": token,
        "access_token": token,
    }


@app.get("/me", response_model=UserResponse)
def read_me(current_user: dict = Depends(get_current_user)):
    return public_user(current_user)


@app.post("/auth/logout")
def logout():
    return {"message": "Logged out on this client; discard the access token."}


@app.post("/review", status_code=201)
def codereview(
    payload: CodeReview,
    current_user: dict = Depends(get_current_user),
):
    try:
        result = analyze_code(payload.code, payload.language)
    except Exception:
        raise HTTPException(status_code=502, detail="Gemini review failed")

        # Count issues whose severity is exactly "critical".
    critical_count = sum(
        issue["severity"] == "critical"
        for issue in result["issues"]
    )

    created_at = datetime.now(timezone.utc)

    review_document = {
        "user_id": current_user["_id"],
        "code": payload.code,
        "language": payload.language,
        "focus": payload.focus,
        "overall_score": result["overall_score"],
        "category_scores": result["category_scores"],
        "critical_issues_count": critical_count,
        "issues": result["issues"],
        "explanation": result["explanation"],
        "summary": result["summary"],
        "created_at": created_at,
    }

    saved = reviews_collection.insert_one(review_document)

    return {
        "review_id": str(saved.inserted_id),
        "focus": payload.focus,
        "overall_score": review_document["overall_score"],
        "category_scores": review_document["category_scores"],
        "critical_issues_count": critical_count,
        "issues": review_document["issues"],
        "explanation": review_document["explanation"],
        "summary": review_document["summary"],
        "created_at": created_at.isoformat().replace("+00:00", "Z"),
    }


def iso_utc(value: datetime) -> str:
    # PyMongo may return UTC dates without timezone info.
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)

    return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


@app.get("/review/history")
def list_my_reviews(
    current_user: dict = Depends(get_current_user),
):
    cursor = (
        reviews_collection.find(
            {"user_id": current_user["_id"]}
        )
        .sort("created_at", -1)
        .limit(100)
    )

    return [
        {
            "review_id": str(review["_id"]),
            "date": iso_utc(review["created_at"]),
            "language": review["language"],
            "focus": review.get("focus", "general"),
            "overall_score": review["overall_score"],
        }
        for review in cursor
    ]


@app.get("/review/{reviewId}")
def get_review(
    review_id: str,
    current_user: dict = Depends(get_current_user),
):
    if not ObjectId.is_valid(review_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid review ID",
        )

    review = reviews_collection.find_one({
        "_id": ObjectId(review_id),
        "user_id": current_user["_id"],
    })

    if not review:
        raise HTTPException(
            status_code=404,
            detail="Review not found",
        )

    return {
        "review_id": str(review["_id"]),
        "focus": review.get("focus", "general"),
        "overall_score": review["overall_score"],
        "category_scores": review["category_scores"],
        "critical_issues_count": review["critical_issues_count"],
        "issues": review["issues"],
        "explanation": review["explanation"],
        "summary": review["summary"],
        "language": review["language"],
        "code": review["code"],
        "created_at": iso_utc(review["created_at"]),
    }