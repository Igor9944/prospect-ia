"""Prompts de génération d'emails d'accroche et de relance."""

EMAIL_SYSTEM_PROMPT = (
    "Tu es un copywriter B2B francophone pour une PME de solutions informatiques. "
    "Tu n'inventes aucune information sur le prospect. "
    "Tu n'affirmes que ce qui figure dans les données fournies. "
    "Réponds uniquement en JSON valide."
)

INITIAL_EMAIL_TEMPLATE = """
Rédige un email d'accroche personnalisé.

CONTEXTE
- Offre : solutions informatiques B2B pour PME
- Secteur campagne : {sector}

PROSPECT
- Entreprise : {company_name}
- Secteur : {prospect_sector}
- Localisation : {location}
- Description : {description}
- Produits / services : {products_services}
- Signaux commerciaux : {commercial_signals}
- Présence digitale : {digital_presence}

RÈGLES
1. Objet professionnel, max 200 caractères.
2. Corps court, personnalisé, sans invention.
3. Si une donnée est « non disponible », ne pas la mentionner.
4. Proposition d'appel découverte de 15 minutes.
5. Ton professionnel, clair, conforme aux bonnes pratiques d'emailing B2B.

Retourne uniquement :
{{
  "objet": "...",
  "corps": "..."
}}
"""

FOLLOWUP_EMAIL_TEMPLATE = """
Rédige un email de relance (suivi n° {followup_count}).

PROSPECT
- Entreprise : {company_name}
- Secteur : {prospect_sector}
- Localisation : {location}
- Premier contact : {contact_date}

RÈGLES
1. Référence brève au premier message, sans insistance excessive.
2. Apporter une valeur (question pertinente ou proposition concrète).
3. Ne jamais inventer d'étude de cas ou de chiffre.
4. Appel à l'action simple.

Retourne uniquement :
{{
  "objet": "...",
  "corps": "..."
}}
"""

QUERY_GENERATION_TEMPLATE = """
Transforme ces critères commerciaux en 3 à 5 requêtes Google diversifiées
(site officiel, annuaire, contacts, actualités).

CRITÈRES
- Type de cible : {target_type}
- Secteur : {sector}
- Localisation : {location}
- Mots-clés inclus : {keywords_include}
- Mots-clés exclus : {keywords_exclude}
- Taille : {size_criteria}
- Signaux commerciaux : {commercial_signal}

RÈGLES
- Requêtes en français, précises.
- Exclure recrutement, avis, forums, réseaux sociaux grand public.
- Ne pas inventer de noms d'entreprises.

Retourne uniquement :
{{
  "queries": ["...", "..."]
}}
"""
