from dataclasses import dataclass
from typing import Dict, Any, Optional

@dataclass
class StackInfo:
    name: str  # e.g., "python", "node"
    version: Optional[str]  # e.g., "3.9", "18.x"
    framework: Optional[str] = None # e.g., "fastapi", "nextjs"
    has_db: bool = False
    has_redis: bool = False
    details: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.details is None:
            self.details = {}
