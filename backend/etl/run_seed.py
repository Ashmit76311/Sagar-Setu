"""
Sagar Setu — Database Seed Script
Runs the synthetic data generator.
"""
import asyncio
import sys
import os

from api.database import async_session
from etl.synthetic_data import generate_synthetic_data

async def main():
    print("Starting database seed...")
    async with async_session() as session:
        try:
            await generate_synthetic_data(session)
            print("Database seeded successfully.")
        except Exception as e:
            print(f"Error seeding database: {e}")
            await session.rollback()

if __name__ == "__main__":
    asyncio.run(main())
