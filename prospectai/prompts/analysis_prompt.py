"""Prompt d'analyse des réponses email."""

ANALYSIS_SYSTEM_PROMPT = (
    "Tu es un analyste commercial B2B. Tu classifies les réponses email "
    "sans inventer d'intention. Réponds uniquement en JSON valide."
)

ANALYSIS_USER_TEMPLATE = """
Analyse cette réponse d'un prospect.

ENTREPRISE : {company_name}
SECTEUR : {sector}

MESSAGE :
\"\"\"{email_content}\"\"\"

CATÉGORIES AUTORISÉES (une seule) :
- intéressé
- hésitant
- négatif
- demande d'information
- hors sujet

Retourne uniquement :
{{
  "categorie": "intéressé | hésitant | négatif | demande d'information | hors sujet",
  "justification": "...",
  "prochaine_action": "..."
}}
"""
