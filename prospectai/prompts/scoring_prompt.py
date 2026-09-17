"""Prompt de scoring IA — solutions informatiques B2B."""

SCORING_SYSTEM_PROMPT = (
    "Tu es un analyste commercial B2B expert en solutions informatiques pour PME. "
    "Tu ne dois jamais inventer une donnée. Si une information est absente, "
    "indique-la comme non disponible. Réponds uniquement en JSON valide."
)

SCORING_USER_TEMPLATE = """
Analyse ce prospect pour une PME spécialisée en solutions informatiques B2B.

CONTEXTE CAMPAGNE
- Type de cible : {target_type}
- Secteur : {sector}
- Localisation : {location}
- Mots-clés inclus : {keywords_include}
- Mots-clés exclus : {keywords_exclude}
- Critères de taille : {size_criteria}
- Signaux commerciaux recherchés : {commercial_signal}
- Seuil de qualification : {score_threshold}/10

DONNÉES PROSPECT (best effort, jamais inventées)
- Entreprise : {company_name}
- Domaine : {domain}
- Site : {website_url}
- Secteur : {prospect_sector}
- Sous-secteur : {sub_sector}
- Localisation : {prospect_location}
- Effectif : {employee_count}
- Catégorie de taille : {size_category}
- CA : {revenue} (statut : {revenue_status})
- Année de création : {founded_year}
- Produits / services : {products_services}
- Description : {description}
- Présence digitale : {digital_presence}
- Signaux commerciaux : {commercial_signals}
- Sources : {sources}

PONDÉRATION
- Secteur : 40 %
- Taille : 20 %
- Signaux commerciaux : 20 %
- Localisation : 10 %
- Présence digitale : 10 %

RÈGLES
1. Score entier de 0 à 10.
2. Si le CA est inconnu, ne pas pénaliser de plus de 1 point.
3. Ne jamais inventer de fait : noter « non disponible ».
4. Lister les signaux positifs, négatifs et les données manquantes.

Retourne uniquement :
{{
  "score": 0,
  "justification": "...",
  "signaux_positifs": [],
  "signaux_negatifs": [],
  "donnees_manquantes": []
}}
"""
