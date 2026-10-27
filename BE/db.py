import os
from dotenv import load_dotenv
from pymongo import MongoClient, DESCENDING

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE", "codereviewer")

if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI is missing. Add it to your .env file.")

client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
db = client[MONGODB_DATABASE]
users_collection = db["users"]
reviews_collection = db["reviews"]


def ensure_indexes() -> None:
    """Create indexes used by signup and review-history queries."""
    users_collection.create_index("email", unique=True)
    reviews_collection.create_index([
        ("user_id", 1),
        ("created_at", DESCENDING),
    ])
