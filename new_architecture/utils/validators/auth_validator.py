# -*- coding: utf-8 -*-
"""
Authentication validation utilities
"""
import re
from typing import Dict, List, Optional
from pydantic import ValidationError

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_password_strength(password: str) -> Dict[str, any]:
    """
    Validate password strength
    Returns dict with validation results
    """
    errors = []
    
    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")
    
    if not re.search(r'[A-Z]', password):
        errors.append("Password must contain at least one uppercase letter")
    
    if not re.search(r'[a-z]', password):
        errors.append("Password must contain at least one lowercase letter")
    
    if not re.search(r'\d', password):
        errors.append("Password must contain at least one number")
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        errors.append("Password must contain at least one special character")
    
    return {
        "is_valid": len(errors) == 0,
        "errors": errors,
        "strength": "strong" if len(errors) == 0 else "weak"
    }

def validate_crm(crm: str) -> bool:
    """
    Validate CRM format (Brazilian medical license)
    Format: Numbers followed by optional state abbreviation
    """
    if not crm:
        return False
    
    # Remove spaces and convert to uppercase
    crm_clean = crm.replace(" ", "").upper()
    
    # Basic pattern: numbers followed by optional letters (state)
    pattern = r'^\d{4,6}[A-Z]{0,2}$'
    return bool(re.match(pattern, crm_clean))

def validate_registration_data(data: Dict) -> Dict[str, any]:
    """
    Validate complete registration data
    """
    errors = {}
    
    # Validate email
    if not validate_email(data.get("email", "")):
        errors["email"] = "Invalid email format"
    
    # Validate password
    password_validation = validate_password_strength(data.get("password", ""))
    if not password_validation["is_valid"]:
        errors["password"] = password_validation["errors"]
    
    # Validate CRM
    if not validate_crm(data.get("crm", "")):
        errors["crm"] = "Invalid CRM format"
    
    # Validate required fields
    required_fields = ["nome", "email", "password", "crm"]
    for field in required_fields:
        if not data.get(field):
            errors[field] = f"{field} is required"
    
    return {
        "is_valid": len(errors) == 0,
        "errors": errors
    }