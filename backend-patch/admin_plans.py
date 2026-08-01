# Anuverse — admin plan editing endpoints
#
# Drop this file into your FastAPI repo as `backend/routes/admin_plans.py`
# and register it in `backend/main.py`:
#
#     from backend.routes import admin_plans
#     app.include_router(admin_plans.router, prefix="/api")
#
# It stores plan overrides in MongoDB (collection `plan_overrides`) and merges
# them over the hardcoded catalogues in `backend/routes/plans.py`, so the
# frontend admin area at /admin can edit plans without redeploying.

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict, Optional

from backend.database import get_db
from backend.auth import require_admin
from backend.routes.plans import MINECRAFT_PLANS, VPS_PLANS

router = APIRouter(prefix="/admin", tags=["admin-plans"])

CATALOGUES = {"minecraft": MINECRAFT_PLANS, "vps": VPS_PLANS}


class PlanIn(BaseModel):
    id: str
    name: str
    ram: Optional[str] = None
    vcores: Optional[int] = None
    disk: Optional[str] = None
    nvme: Optional[str] = None
    players: Optional[int] = None
    price: Dict[str, float]


@router.put("/plans/{catalogue}/{category_id}/{plan_id}")
async def upsert_plan(
    catalogue: str,
    category_id: str,
    plan_id: str,
    plan: PlanIn,
    _admin=Depends(require_admin),
):
    if catalogue not in CATALOGUES:
        raise HTTPException(status_code=404, detail="Unknown catalogue")

    category = next((c for c in CATALOGUES[catalogue] if c["id"] == category_id), None)
    if not category:
        raise HTTPException(status_code=404, detail="Unknown category")
    if not any(p["id"] == plan_id for p in category["plans"]):
        raise HTTPException(status_code=404, detail="Unknown plan")

    db = get_db()
    doc = plan.model_dump(exclude_none=True)
    await db["plan_overrides"].update_one(
        {"catalogue": catalogue, "category_id": category_id, "plan_id": plan_id},
        {"$set": {"plan": doc}},
        upsert=True,
    )
    return doc


async def apply_overrides(catalogue: str, categories: list) -> list:
    """Call this from GET /plans and GET /vps-plans before returning."""
    db = get_db()
    overrides = {
        (o["category_id"], o["plan_id"]): o["plan"]
        async for o in db["plan_overrides"].find({"catalogue": catalogue})
    }
    if not overrides:
        return categories
    merged = []
    for cat in categories:
        plans = [
            {**p, **overrides.get((cat["id"], p["id"]), {})}
            for p in cat["plans"]
        ]
        merged.append({**cat, "plans": plans})
    return merged
