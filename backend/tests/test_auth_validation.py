import pytest

from app.services.auth_validation import normalize_email, validate_password


@pytest.mark.parametrize(
    ("raw_email", "expected"),
    [("  User@Example.COM ", "user@example.com"), ("student+tag@example.org", "student+tag@example.org")],
)
def test_normalize_email_trims_and_normalizes(raw_email, expected):
    assert normalize_email(raw_email) == expected


@pytest.mark.parametrize("email", ["missing-at.example.com", "name@", "@example.com", "name example.com"])
def test_normalize_email_rejects_invalid_values(email):
    with pytest.raises(ValueError):
        normalize_email(email)


@pytest.mark.parametrize("password", ["shortA1", "longpassword1!", "Longpassword!", "Longpassword1"])
def test_validate_password_rejects_each_policy_violation(password):
    with pytest.raises(ValueError):
        validate_password(password)


def test_validate_password_accepts_policy_compliant_password():
    assert validate_password("ValidPass1!") == "ValidPass1!"