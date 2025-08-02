# -*- coding: utf-8 -*-
"""
Audit logging helpers
"""
import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

class AuditLogger:
    """Audit logging utility"""
    
    def __init__(self, db_session: Optional[Session] = None):
        self.db_session = db_session
    
    def log_user_action(
        self,
        user_id: int,
        action: str,
        details: Dict[str, Any],
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ):
        """Log user action for audit trail"""
        audit_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "user_id": user_id,
            "action": action,
            "details": details,
            "ip_address": ip_address,
            "user_agent": user_agent
        }
        
        # Log to standard logger
        logger.info(f"AUDIT: {json.dumps(audit_entry)}")
        
        # If database session provided, could save to audit table
        if self.db_session:
            self._save_to_database(audit_entry)
    
    def _save_to_database(self, audit_entry: Dict[str, Any]):
        """Save audit entry to database (implement as needed)"""
        # This would require an audit table in the database
        # For now, just log it
        logger.debug(f"Would save to database: {audit_entry}")

def log_authentication_attempt(
    email: str,
    success: bool,
    ip_address: Optional[str] = None,
    failure_reason: Optional[str] = None
):
    """Log authentication attempt"""
    audit_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "action": "login_attempt",
        "email": email,
        "success": success,
        "ip_address": ip_address,
        "failure_reason": failure_reason if not success else None
    }
    
    logger.info(f"AUTH_AUDIT: {json.dumps(audit_entry)}")

def log_password_change(user_id: int, initiated_by: str):
    """Log password change event"""
    audit_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "action": "password_change",
        "user_id": user_id,
        "initiated_by": initiated_by  # "user" or "admin" or "reset"
    }
    
    logger.info(f"PASSWORD_AUDIT: {json.dumps(audit_entry)}")

def log_account_creation(user_id: int, created_by: Optional[int] = None):
    """Log account creation"""
    audit_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "action": "account_created",
        "user_id": user_id,
        "created_by": created_by
    }
    
    logger.info(f"ACCOUNT_AUDIT: {json.dumps(audit_entry)}")