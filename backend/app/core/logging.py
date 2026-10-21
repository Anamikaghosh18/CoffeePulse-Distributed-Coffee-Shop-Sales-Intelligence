"""Logging configuration for CoffeePulse."""

import logging
import sys


def setup_logging(log_level: str = "INFO") -> logging.Logger:
    """Configure root and application loggers."""
    logging.basicConfig(
        level=getattr(logging, log_level.upper(), logging.INFO),
        format="%(asctime)s [%(levelname)s] [%(name)s]: %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
    )
    logger = logging.getLogger("coffeepulse")
    logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))
    return logger


logger = setup_logging()
