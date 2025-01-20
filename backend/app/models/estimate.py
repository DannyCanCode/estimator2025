from pydantic import BaseModel
from typing import Dict, Any, List, Optional

class MaterialItem(BaseModel):
    price: float
    quantity: Optional[int] = None

class Materials(BaseModel):
    shingles: MaterialItem
    ridge_caps: MaterialItem
    starter: MaterialItem
    drip_edge: MaterialItem
    ice_water: MaterialItem

class Pricing(BaseModel):
    materials: Materials

class AdditionalMaterial(BaseModel):
    type: str
    quantity: int

class EstimateRequest(BaseModel):
    measurements: Dict[str, Any]
    pricing: Pricing
    selectedShingle: str
    additionalMaterials: Dict[str, List[AdditionalMaterial]]
    underlaymentType: str 