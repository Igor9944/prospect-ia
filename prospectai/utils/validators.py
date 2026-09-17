"""Validation d'emails, téléphones et textes métier."""

from __future__ import annotations

import re

from prospectai.models.prospect import NOT_AVAILABLE

EMAIL_RE = re.compile(r"^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$")
PHONE_RE = re.compile(r"^\+?[\d\s().\-]{8,20}$")

PARASITE_KEYWORDS = (
    "recrutement",
    "offre d'emploi",
    "offres d'emploi",
    "job",
    "jobs",
    "career",
    "careers",
    "avis client",
    "avis consommateurs",
    "login",
    "connexion",
    "sign in",
)


def is_valid_email(value: str | None) -> bool:
    if not value:
        return False
    cleaned = value.strip().lower()
    if cleaned in {NOT_AVAILABLE, "n/a", "na", "none"}:
        return False
    return bool(EMAIL_RE.match(cleaned))


def is_valid_phone(value: str | None) -> bool:
    if not value:
        return False
    digits = re.sub(r"\D", "", value)
    return 8 <= len(digits) <= 15 and bool(PHONE_RE.match(value.strip()))


def unavailable(value: str | None) -> str:
    if value is None:
        return NOT_AVAILABLE
    text = str(value).strip()
    return text if text else NOT_AVAILABLE


def contains_parasite_keywords(text: str | None) -> bool:
    if not text:
        return False
    lowered = text.lower()
    return any(keyword in lowered for keyword in PARASITE_KEYWORDS)
