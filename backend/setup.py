"""Setup script for the backend package."""
from setuptools import find_packages, setup

setup(
    name="game-night-concierge",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "fastapi>=0.68.0",
        "uvicorn>=0.15.0",
        "sqlalchemy>=1.4.0",
        "alembic==1.13.1",
        "psycopg2-binary>=2.9.0",
        "asyncpg>=0.29.0",
        "pydantic==2.6.1",
        "pydantic-settings==2.1.0",
    ],
) 