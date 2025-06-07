"""Base seeder module."""
from abc import ABC, abstractmethod

from sqlalchemy.ext.asyncio import AsyncSession


class BaseSeed(ABC):
    """Base class for all seeders."""

    def __init__(self, session: AsyncSession):
        """Initialize the seeder.
        
        Args:
            session: The database session to use for seeding.
        """
        self.session = session

    @abstractmethod
    async def run(self) -> None:
        """Run the seeder.
        
        This method must be implemented by all seeders.
        """
        pass 