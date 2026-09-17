"""
Workflow 4: Relances automatiques
Handles sending follow-up emails to contacted prospects.
"""
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List
from uuid import UUID
from prospectai.config import config
from prospectai.services import supabase, google_ai, gmail
from prospectai.models import Campaign, Prospect
from prospectai.utils.logger import get_logger

logger = get_logger(__name__)

async def run_followups() -> Dict[str, Any]:
    """
    Main function for Workflow 4: Relances automatiques.
    This function is designed to be called by a scheduler (e.g., APScheduler).

    Returns:
        Dictionary with results statistics
    """
    logger.info("Starting Workflow 4: Relances automatiques")

    stats: Dict[str, Any] = {
        'prospects_processed': 0,
        'followups_sent': 0,
        'errors': 0
    }

    try:
        # Get prospects that need follow-up
        # Criteria: next_followup_date <= NOW and status not in final states
        now = datetime.now()

        # We'll get all prospects and filter in Python for simplicity
        # In production, you'd want to do this with a proper SQL query
        all_prospects = await supabase.client.table('prospects').select('*').execute()
        prospects = all_prospects.data if all_prospects.data else []

        prospects_needing_followup: List[Prospect] = []
        for prospect_dict in prospects:
            prospect = Prospect(**prospect_dict)

            # Skip if in final states
            if prospect.status in ['Converti', 'Perdu', 'Classé']:
                continue

            # Check if follow-up is due
            if prospect.next_followup_date:
                try:
                    nf_str = str(prospect.next_followup_date)
                    if nf_str.endswith('Z'):
                        nf_str = nf_str[:-1] + '+00:00'
                    next_followup = datetime.fromisoformat(nf_str)
                    if next_followup <= now and prospect.followup_count < config.MAX_FOLLOWUPS:
                        prospects_needing_followup.append(prospect)
                except Exception as e:
                    logger.warning(f"Could not parse next_followup_date for prospect {prospect.id}: {str(e)}")
            # If no next_followup_date but has been contacted, it's time for first follow-up
            elif prospect.contact_date and prospect.followup_count == 0:
                prospects_needing_followup.append(prospect)

        logger.info(f"Found {len(prospects_needing_followup)} prospects needing follow-up")
        stats['prospects_processed'] = len(prospects_needing_followup)

        # Process follow-ups
        for prospect in prospects_needing_followup:
            try:
                logger.info(f"Processing follow-up for prospect: {prospect.company_name}")

                # Get campaign context
                campaign = await supabase.get_campaign(UUID(str(prospect.campaign_id)))
                campaign_context = {
                    'sector': campaign.sector if campaign else '',
                    'location': campaign.location if campaign else ''
                } if campaign else {}

                # Prepare prospect data
                prospect_data = {
                    'company_name': prospect.company_name,
                    'domain': prospect.domain,
                    'website_url': prospect.website_url,
                    'email': prospect.email,
                    'ai_score': prospect.ai_score,
                    'ai_justification': prospect.ai_justification,
                    'contact_date': prospect.contact_date,
                    'followup_count': prospect.followup_count
                }

                # Generate follow-up email using AI
                email_result = await google_ai.generate_email(
                    prospect_data,
                    campaign_context,
                    email_type="followup"
                )

                # Record the interaction
                interaction_data = {
                    'prospect_id': str(prospect.id),
                    'type': 'followup_sent',
                    'content': f"Objet: {email_result.objet}\n\nCorps:\n{email_result.corps}",
                    'ai_analysis': {
                        'generated_subject': email_result.objet,
                        'generated_body': email_result.corps
                    }
                }

                await supabase.create_interaction(interaction_data)

                # Send the email
                sent_result = await gmail.send_email(
                    to=prospect.email,
                    subject=email_result.objet,
                    body=email_result.corps
                )

                # Calculate next follow-up date with linear backoff
                backoff_days = config.FOLLOWUP_DELAY_DAYS * (prospect.followup_count + 1)
                next_followup = datetime.now() + timedelta(days=backoff_days)

                # Update prospect
                await supabase.update_prospect(
                    prospect.id,
                    ProspectUpdate(
                        status='Relancé',
                        followup_count=prospect.followup_count + 1,
                        next_followup_date=next_followup,
                        last_action_date=datetime.now()
                    )
                )

                stats['followups_sent'] += 1
                logger.info(f"Follow-up sent to {prospect.email} (followup #{prospect.followup_count + 1})")

                # Delay between follow-ups
                await asyncio.sleep(2)

            except Exception as e:
                logger.error(f"Error processing follow-up for prospect {prospect.id}: {str(e)}")
                stats['errors'] += 1
                continue

        logger.info(f"Workflow 4 completed: {stats['followups_sent']} follow-ups sent")
        return stats

    except Exception as e:
        logger.error(f"Error in Workflow 4: {str(e)}")
        stats['errors'] += 1
        raise
