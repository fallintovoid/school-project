import os

SECRET_KEY = os.getenv("SECRET_KEY", "")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/school_project")

if SECRET_KEY is None:
    raise ValueError("SECRET_KEY is not set")