# This file makes the parsers directory a Python package

from .cbhpm_parser import CBHPMParser
from .demonstrativo_parser import DemonstrativoParser

# Parsers de guias - agora habilitados
try:
    from .guia_parser import parse_guia_pdf
    from .scanned_guia_parser import parse_scanned_guia_pdf
    GUIA_PARSERS_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Guia parsers not available: {e}")
    GUIA_PARSERS_AVAILABLE = False

__all__ = [
    "DemonstrativoParser",
    "CBHPMParser",
]

if GUIA_PARSERS_AVAILABLE:
    __all__.extend(["parse_guia_pdf", "parse_scanned_guia_pdf"])
