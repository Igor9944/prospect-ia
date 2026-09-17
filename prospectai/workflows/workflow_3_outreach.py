"""
Workflow 3: Outreach (Envoi d'emails)
Handles sending initial outreach emails to qualified prospects.
"""
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Any, Dict, Optional
from uuid import UUID
from prospectai.config import config
from prospectai.services import supabase, google_ai, gmail
from prospectai.models import Campaign, Prospect
from prospectai.utils.logger import get_logger

logger = get_logger(__name__)

async def run_outreach(campaign_id: UUID, dry_run: bool = True) -> Dict[str, Any]:
    """
    Main function for Workflow 3: Outreach (Envoi d'emails).

    Args:
        campaign_id: ID of the campaign
        dry_run: If True, only prepare emails without sending (status = 'À valider')
                 If False, actually send emails via Gmail

    Returns:
        Dictionary with results statistics
    """
    mode = "DRY RUN" if dry_run else "LIVE SEND"
    logger.info(f"Starting Workflow 3: Outreach ({mode}) for campaign {campaign_id}")

    stats: Dict[str, Any] = {
        'prospects_processed': 0,
        'emails_prepared': 0,
        'emails_sent': 0,
        'errors': 0
    }

    try:
        # Get qualified prospects that haven't been contacted yet
        prospects = await supabase.get_prospects_by_campaign(
            campaign_id,
            status='Qualifié'
        )

        # Filter for prospects with email and not yet contacted
        prospects_to_contact = [
            p for p in prospects
            if p.email and p.contact_date is None
        ]

        logger.info(f"Found {len(prospects_to_contact)} qualified prospects with email to contact")
        stats['prospects_processed'] = len(prospects_to_contact)

        # Process prospects
        for prospect in prospects_to_contact:
            try:
                logger.info(f"Processing outreach for prospect: {prospect.company_name} ({prospect.email})")

                # Check if we've already sent an email to this prospect (idempotency)
                existing_interactions = await supabase.get_interactions_by_prospect(prospect.id)
                email_sent_exists = any(
                    interaction.get('type') == 'email_sent'
                    for interaction in existing_interactions
                )

                if email_sent_exists:
                    logger.info(f"Email already sent to prospect {prospect.id}, skipping")
                    continue

                # Prepare campaign context for email generation
                campaign = await supabase.get_campaign(campaign_id)
                campaign_context = {
                    'sector': campaign.sector if campaign else '',
                    'location': campaign.location if campaign else ''
                }

                # Prepare prospect data
                prospect_data = {
                    'company_name': prospect.company_name,
                    'domain': prospect.domain,
                    'website_url': prospect.website_url,
                    'sector': prospect.sector,
                    'location': prospect.location,
                    'email': prospect.email,
                    'phone': prospect.phone,
                    'ai_score': prospect.ai_score,
                    'ai_justification': prospect.ai_justification
                }

                # Generate email using AI
                email_result = await google_ai.generate_email(
                    prospect_data,
                    campaign_context,
                    email_type="initial"
                )

                # Record the interaction before sending (for idempotency)
                interaction_data = {
                    'prospect_id': str(prospect.id),
                    'type': 'email_sent',
                    'content': f"Objet: {email_result.objet}\n\nCorps:\n{email_result.corps}",
                    'ai_analysis': {
                        'generated_subject': email_result.objet,
                        'generated_body': email_result.corps
                    }
                }

                await supabase.create_interaction(interaction_data)

                if dry_run:
                    # In dry run mode, set status to 'À valider' for manual review
                    await supabase.update_prospect(
                        prospect.id,
                        ProspectUpdate(status='À valider')
                    )
                    stats['emails_prepared'] += 1
                    logger.info(f"Email prepared for manual validation: {prospect.company_name}")
                else:
                    # Actually send the email
                    sent_result = await gmail.send_email(
                        to=prospect.email,
                        subject=email_result.objet,
                        body=email_result.corps
                    )

                    # Update prospect with contact info
                    now = datetime.now()
                    await supabase.update_prospect(
                        prospect.id,
                        ProspectUpdate(
                            status='Contacté',
                            contact_date=now,
                            next_followup_date=now + timedelta(days=config.FOLLOWUP_DELAY_DAYS),
                            last_action_date=now
                        )
                    )

                    stats['emails_sent'] += 1
                    logger.info(f"Email sent to {prospect.email}: {sent_result['id']}")

                # Small delay between emails to be respectful
                await asyncio.sleep(1)

            except Exception as e:
                logger.error(f"Error processing outreach for prospect {prospect.id}: {str(e)}")
                stats['errors'] += 1
                continue

        logger.info(f"Workflow 3 ({mode}) completed: {stats['emails_prepared']} prepared, {stats['emails_sent']} sent")
        return stats

    except Exception as e:
        logger.error(f"Error in Workflow 3: {str(e)}")
        stats['errors'] += 1
        raise
