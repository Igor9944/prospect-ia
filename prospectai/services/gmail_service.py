"""
Gmail service for ProspectAI.
Handles sending and reading emails via Gmail API.
"""
import logging
import base64
import os
from typing import List, Dict, Any, Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from prospectai.config import config

logger = logging.getLogger(__name__)

# Gmail API scopes
SCOPES = ['https://www.googleapis.com/auth/gmail.modify',
          'https://www.googleapis.com/auth/gmail.send']

class GmailService:
    """Gmail service wrapper for ProspectAI operations."""
    
    def __init__(self):
        """Initialize the Gmail service."""
        self.creds = None
        self.service = None
        self._authenticate()
    
    def _authenticate(self):
        """Authenticate with Gmail API using OAuth2."""
        try:
            # Check if token file exists
            if os.path.exists(config.GMAIL_TOKEN_PATH):
                self.creds = Credentials.from_authorized_user_file(
                    config.GMAIL_TOKEN_PATH, SCOPES
                )
            
            # If there are no (valid) credentials available, let the user log in.
            if not self.creds or not self.creds.valid:
                if self.creds and self.creds.expired and self.creds.refresh_token:
                    self.creds.refresh(Request())
                else:
                    if not os.path.exists(config.GMAIL_CREDENTIALS_PATH):
                        raise FileNotFoundError(
                            f"Gmail credentials file not found at {config.GMAIL_CREDENTIALS_PATH}. "
                            "Please download credentials.json from Google Cloud Console."
                        )
                    flow = InstalledAppFlow.from_client_secrets_file(
                        config.GMAIL_CREDENTIALS_PATH, SCOPES
                    )
                    self.creds = flow.run_local_server(port=0)
                
                # Save the credentials for the next run
                os.makedirs(os.path.dirname(config.GMAIL_TOKEN_PATH), exist_ok=True)
                with open(config.GMAIL_TOKEN_PATH, 'w') as token:
                    token.write(self.creds.to_json())
            
            self.service = build('gmail', 'v1', credentials=self.creds)
            logger.info("Gmail service authenticated successfully")
            
        except Exception as e:
            logger.error(f"Failed to authenticate Gmail service: {str(e)}")
            raise
    
    async def send_email(self, to: str, subject: str, body: str, 
                        thread_id: Optional[str] = None,
                        message_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Send an email via Gmail API.
        
        Args:
            to: Recipient email address
            subject: Email subject
            body: Email body (plain text)
            thread_id: Optional thread ID to reply to
            message_id: Optional message ID to reply to
            
        Returns:
            Dictionary with sent message details
        """
        try:
            # Validate email
            if not to or '@' not in to:
                raise ValueError("Invalid recipient email address")
            
            # Create message
            message = MIMEText(body)
            message['to'] = to
            message['subject'] = subject
            
            # Add threading headers if replying
            if thread_id and message_id:
                message['In-Reply-To'] = message_id
                message['References'] = message_id
            
            # Encode message
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            message_body = {'raw': raw_message}
            
            # Send message
            sent_message = self.service.users().messages().send(
                userId='me',
                body=message_body
            ).execute()
            
            logger.info(f"Email sent to {to}: {sent_message['id']}")
            
            # Mark as important? Not necessary for now
            return {
                'id': sent_message['id'],
                'threadId': sent_message.get('threadId'),
                'labelIds': sent_message.get('labelIds', []),
                'to': to,
                'subject': subject
            }
            
        except HttpError as e:
            logger.error(f"Gmail API error sending email: {e.resp.status} {e.content}")
            raise
        except Exception as e:
            logger.error(f"Error sending email: {str(e)}")
            raise
    
    async def get_unread_messages(self, max_results: int = 20) -> List[Dict[str, Any]]:
        """
        Get unread messages from the inbox.
        
        Args:
            max_results: Maximum number of messages to return
            
        Returns:
            List of message dictionaries
        """
        try:
            # Query for unread messages in inbox
            results = self.service.users().messages().list(
                userId='me',
                q='is:unread in:inbox',
                maxResults=max_results
            ).execute()
            
            messages = results.get('messages', [])
            
            # Get full message details
            detailed_messages = []
            for message in messages:
                try:
                    msg = self.service.users().messages().get(
                        userId='me',
                        id=message['id'],
                        format='full'
                    ).execute()
                    detailed_messages.append(msg)
                except Exception as e:
                    logger.warning(f"Could not get full message {message['id']}: {str(e)}")
            
            logger.info(f"Retrieved {len(detailed_messages)} unread messages")
            return detailed_messages
            
        except HttpError as e:
            logger.error(f"Gmail API error getting messages: {e.resp.status} {e.content}")
            return []
        except Exception as e:
            logger.error(f"Error getting unread messages: {str(e)}")
            return []
    
    async def mark_as_read(self, message_id: str) -> bool:
        """
        Mark a message as read by removing the UNREAD label.
        
        Args:
            message_id: ID of the message to mark as read
            
        Returns:
            True if successful
        """
        try:
            self.service.users().messages().modify(
                userId='me',
                id=message_id,
                body={'removeLabelIds': ['UNREAD']}
            ).execute()
            
            logger.info(f"Message marked as read: {message_id}")
            return True
        except Exception as e:
            logger.error(f"Error marking message as read: {str(e)}")
            return False
    
    async def add_label(self, message_id: str, label_name: str) -> bool:
        """
        Add a label to a message.
        
        Args:
            message_id: ID of the message
            label_name: Name of the label to add
            
        Returns:
            True if successful
        """
        try:
            # Get or create label
            label_id = await self._get_or_create_label(label_name)
            if not label_id:
                return False
            
            self.service.users().messages().modify(
                userId='me',
                id=message_id,
                body={'addLabelIds': [label_id]}
            ).execute()
            
            logger.info(f"Label '{label_name}' added to message {message_id}")
            return True
        except Exception as e:
            logger.error(f"Error adding label to message: {str(e)}")
            return False
    
    async def _get_or_create_label(self, label_name: str) -> Optional[str]:
        """Get or create a Gmail label."""
        try:
            # List existing labels
            results = self.service.users().labels().list(userId='me').execute()
            labels = results.get('labels', [])
            
            # Check if label already exists
            for label in labels:
                if label['name'] == label_name:
                    return label['id']
            
            # Create new label
            label_body = {
                'name': label_name,
                'labelListVisibility': 'labelShow',
                'messageListVisibility': 'show'
            }
            
            created_label = self.service.users().labels().create(
                userId='me',
                body=label_body
            ).execute()
            
            logger.info(f"Created label: {label_name}")
            return created_label['id']
            
        except Exception as e:
            logger.error(f"Error getting/creating label: {str(e)}")
            return None
    
    def extract_email_addresses(self, text: str) -> List[str]:
        """
        Extract email addresses from text.
        
        Args:
            text: Text to search for email addresses
            
        Returns:
            List of unique email addresses found
        """
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        emails = re.findall(email_pattern, text)
        # Normalize to lowercase and deduplicate
        return list(set(email.lower() for email in emails))

# Global instance
gmail = GmailService()
