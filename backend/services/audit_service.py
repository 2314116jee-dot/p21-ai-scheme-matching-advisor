from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from backend.models.user import AuditLog
import logging

logger = logging.getLogger(__name__)


def record_audit_log(
    db: Session,
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    user_id: Optional[int] = None,
    ip_address: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
) -> AuditLog:
    """Record an audit log entry for security and compliance."""
    log_entry = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        ip_address=ip_address,
        details=details or {},
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    logger.info(f"AUDIT: action={action} resource={resource_type}:{resource_id} user={user_id}")
    return log_entry
