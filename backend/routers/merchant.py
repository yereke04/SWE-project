from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas, security, database

router = APIRouter(prefix="/merchants", tags=["Merchant Operations"])

# --- Profile Management ---

@router.put("/profile", response_model=dict)
def update_merchant_details(
    payload: schemas.MerchantProfileUpdate, 
    user: models.UserAccount = Depends(security.get_current_user),
    db: Session = Depends(database.get_db)
):
    profile = db.query(models.MerchantProfile).filter(models.MerchantProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=403, detail="User is not a merchant.")
    
    profile.description = payload.description
    db.commit()
    return {"status": "success", "description": profile.description}

@router.post("/visibility", response_model=dict)
def set_visibility(
    action: str, # 'show' or 'hide' via query param or change to body if preferred
    user: models.UserAccount = Depends(security.get_current_user),
    db: Session = Depends(database.get_db)
):
    profile = db.query(models.MerchantProfile).filter(models.MerchantProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=403, detail="Access denied.")
    
    if action == "show":
        profile.is_public = True
    elif action == "hide":
        profile.is_public = False
    else:
        raise HTTPException(400, detail="Invalid action.")
        
    db.commit()
    return {"status": "updated", "is_public": profile.is_public}

@router.get("/", response_model=List[schemas.MerchantPublicProfile])
def discover_merchants(db: Session = Depends(database.get_db)):
    merchants = db.query(models.MerchantProfile).filter(models.MerchantProfile.is_public == True).all()
    return merchants

# --- Partnerships (Linking) ---

@router.post("/partnerships", response_model=schemas.PartnershipResponse)
def request_partnership(
    req: schemas.PartnershipRequest,
    user: models.UserAccount = Depends(security.get_current_user),
    db: Session = Depends(database.get_db)
):
    if user.role != "consumer" and user.role != "buyer":
        raise HTTPException(status_code=403, detail="Only buyers can initiate partnerships.")
    
    existing = db.query(models.Partnership).filter(
        models.Partnership.buyer_id == user.id,
        models.Partnership.merchant_id == req.merchant_id
    ).first()
    
    if existing:
        return existing
    
    new_link = models.Partnership(
        buyer_id=user.id,
        merchant_id=req.merchant_id,
        status="pending"
    )
    db.add(new_link)
    db.commit()
    db.refresh(new_link)
    return new_link

@router.get("/partnerships/sent", response_model=List[schemas.PartnershipResponse])
def get_sent_requests(user: models.UserAccount = Depends(security.get_current_user), db: Session = Depends(database.get_db)):
    # Join MerchantProfile to get names
    results = db.query(models.Partnership, models.MerchantProfile).join(
        models.MerchantProfile, models.Partnership.merchant_id == models.MerchantProfile.id
    ).filter(models.Partnership.buyer_id == user.id).all()
    
    response = []
    for link, merchant in results:
        # We construct the response manually to include the extra name field
        resp = schemas.PartnershipResponse.from_orm(link)
        resp.merchant_name = merchant.business_name

        resp.merchant_user_id = merchant.user_id

        response.append(resp)
    return response

@router.get("/partnerships/received", response_model=List[schemas.PartnershipResponse])
def get_incoming_requests(user: models.UserAccount = Depends(security.get_current_user), db: Session = Depends(database.get_db)):
    merchant = db.query(models.MerchantProfile).filter(models.MerchantProfile.user_id == user.id).first()
    if not merchant:
        return []
    
    results = db.query(models.Partnership, models.UserAccount).join(
        models.UserAccount, models.Partnership.buyer_id == models.UserAccount.id
    ).filter(models.Partnership.merchant_id == merchant.id).all()
    
    response = []
    for link, buyer in results:
        resp = schemas.PartnershipResponse.from_orm(link)
        resp.buyer_name = buyer.full_name

        resp.merchant_user_id = merchant.user_id

        response.append(resp)
    return response

@router.put("/partnerships/{link_id}", response_model=schemas.PartnershipResponse)
def update_partnership_status(
    link_id: int,
    update: schemas.PartnershipUpdate,
    user: models.UserAccount = Depends(security.get_current_user),
    db: Session = Depends(database.get_db)
):
    link = db.query(models.Partnership).filter(models.Partnership.id == link_id).first()
    if not link:
        raise HTTPException(404, detail="Request not found")
        
    merchant = db.query(models.MerchantProfile).filter(models.MerchantProfile.user_id == user.id).first()
    if not merchant or merchant.id != link.merchant_id:
        raise HTTPException(403, detail="Not authorized to manage this link.")
        
    link.status = update.status
    db.commit()
    return link
