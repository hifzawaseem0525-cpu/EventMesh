import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. Add it to your .env file, e.g.\n"
        "DATABASE_URL=sqlite:///./truthlens.db"
    )

# SQLite needs this because FastAPI can hand a request to a different
# thread than the one that opened the connection. Postgres/MySQL don't
# need it, so it's only added when the URL is a sqlite one.
connect_args = (
    {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    connect_args=connect_args,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()