"""Validation rules shared by backend authentication entry points."""

import re


EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
PASSWORD_PATTERN = re.compile(r"^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$")


def normalize_email(email: str) -> str:
    """Trim and normalize an email address, rejecting malformed input."""
    normalized = email.strip().lower()
    if not EMAIL_PATTERN.fullmatch(normalized):
        raise ValueError("Please enter a valid email address.")
    return normalized


def validate_password(password: str) -> str:
    """Validate the minimum password policy and return the original value."""
    if not PASSWORD_PATTERN.fullmatch(password):
        raise ValueError(
            "Password must contain at least 8 characters, one uppercase letter, "
            "one number, and one special symbol."
        )
    return password