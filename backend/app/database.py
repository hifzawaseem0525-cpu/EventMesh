
import os
import ssl
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. Add it to your .env file."
    )

connect_args = {}

if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

elif DATABASE_URL.startswith("mysql+pymysql://"):
    # Use the TiDB CA certificate when MYSQL_SSL_CA is not provided.
    default_ca = (
        Path(__file__).resolve().parent.parent
        / "certs"
        / "tidb-ca.pem"
    )
    ca_path = Path(os.getenv("MYSQL_SSL_CA", str(default_ca)))

    if not ca_path.is_file():
        raise RuntimeError(
            f"MySQL CA certificate not found: {ca_path}"
        )

    tls_context = ssl.create_default_context(cafile=str(ca_path))
    connect_args = {"ssl": tls_context}

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
