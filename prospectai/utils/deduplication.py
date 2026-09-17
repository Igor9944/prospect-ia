"""Normalisation des domaines et clés de déduplication."""

from __future__ import annotations

import re
from urllib.parse import urlparse


def normalize_domain(value: str | None) -> str:
    """Retourne un domaine minuscule sans schéma, www, chemin ni port."""
    if not value:
        return ""
    raw = value.strip().lower()
    if "://" not in raw:
        raw = "https://" + raw
    parsed = urlparse(raw)
    host = parsed.netloc or parsed.path
    host = host.split("/")[0].split("?")[0].split("#")[0]
    if host.startswith("www."):
        host = host[4:]
    if ":" in host:
        host = host.split(":")[0]
    return host.strip(".")


def generate_prospect_id(domain: str | None) -> str:
    """Clé unique métier : domaine normalisé."""
    return normalize_domain(domain)


def normalize_company_name(name: str | None) -> str:
    if not name:
        return "non disponible"
    cleaned = re.sub(r"\s+", " ", name).strip()
    cleaned = re.sub(r"\s*[\|\-–—:].*$", "", cleaned).strip()
    return cleaned or "non disponible"


def is_blacklisted_domain(domain: str, extra: list[str] | None = None) -> bool:
    blocked = {
        "facebook.com",
        "fb.com",
        "twitter.com",
        "x.com",
        "linkedin.com",
        "instagram.com",
        "youtube.com",
        "wikipedia.org",
        "google.com",
        "bing.com",
        "yahoo.com",
        "pagesjaunes.fr",
        "yelp.com",
        "trustpilot.com",
        "indeed.com",
        "glassdoor.com",
        "reddit.com",
        "pinterest.com",
        "tiktok.com",
        "amazon.com",
        "amazon.fr",
        "github.com",
        "stackoverflow.com",
        "medium.com",
        "leboncoin.fr",
    }
    if extra:
        blocked.update(d.lower() for d in extra)
    domain = normalize_domain(domain)
    return any(domain == item or domain.endswith("." + item) for item in blocked)
