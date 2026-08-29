"""
Simple, readable logging configuration.

Logs are written to stdout in a consistent, easy-to-parse format:

    2026-08-28 10:15:32 | INFO | taskflow | Request received: GET /api/tasks

This is intentionally kept simple (no external logging libraries) because
this application will later be used to build a Linux log analyzer and a
monitoring pipeline. Plain, predictable text output makes that much easier.
"""
import logging
import sys


def setup_logging(level: str = "INFO") -> logging.Logger:
    """Configure and return the application's root logger."""
    logger = logging.getLogger("taskflow")
    logger.setLevel(level)

    # Avoid adding duplicate handlers if this is called more than once
    # (e.g. during tests or hot-reload).
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            fmt="%(asctime)s | %(levelname)s | taskflow | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger


logger = setup_logging()
