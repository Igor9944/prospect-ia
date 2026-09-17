"""Chargement sécurisé de la configuration depuis l'environnement."""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


def _env(name: str, default: str = "") -> str:
    return os.getenv(name, default).strip()


class Config:
    """Paramètres de l'application. Les secrets ne vivent que dans `.env`."""

    SUPABASE_URL: str = _env("SUPABASE_URL")
    SUPABASE_KEY: str = _env("SUPABASE_KEY")

    GOOGLE_AI_API_KEY: str = _env("GOOGLE_AI_API_KEY") or _env("GEMINI_API_KEY")
    GOOGLE_AI_MODEL: str = _env("GOOGLE_AI_MODEL", "gemini-2.0-flash")

    GOOGLE_API_KEY: str = _env("GOOGLE_API_KEY")
    GOOGLE_CSE_ID: str = _env("GOOGLE_CSE_ID")

    GMAIL_CREDENTIALS_PATH: str = _env(
        "GMAIL_CREDENTIALS_PATH",
        str(BASE_DIR / "credentials" / "gmail_credentials.json"),
    )
    GMAIL_TOKEN_PATH: str = _env(
        "GMAIL_TOKEN_PATH",
        str(BASE_DIR / "credentials" / "gmail_token.json"),
    )

    MAX_FOLLOWUPS: int = int(_env("MAX_FOLLOWUPS", "3"))
    FOLLOWUP_DELAY_DAYS: int = int(_env("FOLLOWUP_DELAY_DAYS", "7"))
    LOG_LEVEL: str = _env("LOG_LEVEL", "INFO")
    LOG_FILE: str = _env("LOG_FILE", str(BASE_DIR / "logs" / "prospectai.log"))

    HTTP_TIMEOUT_SECONDS: float = 10.0
    ENRICHMENT_CONCURRENCY: int = 5
    GOOGLE_MAX_PAGES: int = 3

    REQUIRED_FOR_SEARCH: tuple[str, ...] = (
        "SUPABASE_URL",
        "SUPABASE_KEY",
        "GOOGLE_AI_API_KEY",
        "GOOGLE_API_KEY",
        "GOOGLE_CSE_ID",
    )

    @classmethod
    def missing(cls, names: tuple[str, ...]) -> list[str]:
        return [name for name in names if not getattr(cls, name, "")]

    @classmethod
    def require(cls, names: tuple[str, ...]) -> None:
        missing = cls.missing(names)
        if missing:
            raise ValueError(
                "Variables d'environnement manquantes : "
                + ", ".join(missing)
                + ". Copiez .env.example vers .env et renseignez les clés."
            )


config = Config()
