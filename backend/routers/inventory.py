from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas, security, database

router = APIRouter(prefix="/inventory", tags=["Inventory Management"])

@router.get("/merchant/{merchant_id}", response_model=List[schemas.ProductResponse])
def get_merchant_inventory(
    merchant_id: int,
    user: models.UserAccount = Depends(security.get_current_user),
    db: Session = Depends(database.get_db)
):
    # Security: Verify partnership exists and is active/accepted
    link = db.query(models.Partnership).filter(
        models.Partnership.buyer_id == user.id,
        models.Partnership.merchant_id == merchant_id
    ).first()

    if not link or link.status.lower() not in ["accepted", "active"]:
        raise HTTPException(status_code=403, detail="Active partnership required to view catalog.")

    products = db.query(models.ProductEntry).filter(models.ProductEntry.merchant_id == merchant_id).all()
    
    # Client-side or Service-side calc? The response model expects computed fields
    # Logic for mapping price calculation is handled in serialization or manually:
    results = []
    for p in products:
        resp = schemas.ProductResponse.from_orm(p)
        resp.original_price = float(p.price)
        resp.price = float(p.price) * (1 - (p.discount_rate or 0) / 100.0)
        results.append(resp)
        
    return results

@router.post("/", response_model=schemas.ProductResponse)
def add_product(
    item: schemas.ProductCreate,
    user: models.UserAccount = Depends(security.get_current_user),
    db: Session = Depends(database.get_db)
):
    merchant = db.query(models.MerchantProfile).filter(models.MerchantProfile.user_id == user.id).first()
    if not merchant:
        raise HTTPException(403, detail="Merchant profile required.")
        
    new_product = models.ProductEntry(
        merchant_id=merchant.id,
        name=item.name,
        price=item.price,
        stock=item.stock,
        unit_type=item.unit_type
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    
    # Return structure
    resp = schemas.ProductResponse.from_orm(new_product)
    resp.original_price = float(new_product.price)
    return resp

@router.get("/me", response_model=List[schemas.ProductResponse])
def get_my_inventory(
    user: models.UserAccount = Depends(security.get_current_user),
    db: Session = Depends(database.get_db)
):
    merchant = db.query(models.MerchantProfile).filter(models.MerchantProfile.user_id == user.id).first()
    if not merchant:
        return []
        
    products = db.query(models.ProductEntry).filter(models.ProductEntry.merchant_id == merchant.id).all()
    results = []
    for p in products:
        resp = schemas.ProductResponse.from_orm(p)
        resp.original_price = float(p.price)
        resp.price = float(p.price) * (1 - (p.discount_rate or 0) / 100.0)
        results.append(resp)
    return results

@router.put("/{product_id}", response_model=schemas.ProductResponse)
def update_product(
    product_id: int,
    update_data: schemas.ProductUpdate,
    user: models.UserAccount = Depends(security.get_current_user),
    db: Session = Depends(database.get_db)
):
    merchant = db.query(models.MerchantProfile).filter(models.MerchantProfile.user_id == user.id).first()
    if not merchant:
        raise HTTPException(403)
        
    product = db.query(models.ProductEntry).filter(
        models.ProductEntry.id == product_id, 
        models.ProductEntry.merchant_id == merchant.id
    ).first()
    
    if not product:
        raise HTTPException(404, detail="Product not found.")
        
    product.name = update_data.name
    product.price = update_data.price
    product.stock = update_data.stock
    product.unit_type = update_data.unit_type
    
    db.commit()
    db.refresh(product)
    
    resp = schemas.ProductResponse.from_orm(product)
    resp.original_price = float(product.price)
    resp.price = float(product.price) * (1 - (product.discount_rate or 0) / 100.0)
    return resp

@router.put("/{product_id}/discount")
def set_discount(
    product_id: int,
    discount: schemas.DiscountUpdate,
    user: models.UserAccount = Depends(security.get_current_user),
    db: Session = Depends(database.get_db)
):
    merchant = db.query(models.MerchantProfile).filter(models.MerchantProfile.user_id == user.id).first()
    product = db.query(models.ProductEntry).filter(
        models.ProductEntry.id == product_id, 
        models.ProductEntry.merchant_id == merchant.id
    ).first()
    
    if not product:
        raise HTTPException(404)
        
    product.discount_rate = discount.rate
    db.commit()
    return {"status": "success", "new_rate": discount.rate}

@router.delete("/{product_id}")
def remove_product(
    product_id: int,
    user: models.UserAccount = Depends(security.get_current_user),
    db: Session = Depends(database.get_db)
):
    merchant = db.query(models.MerchantProfile).filter(models.MerchantProfile.user_id == user.id).first()
    product = db.query(models.ProductEntry).filter(
        models.ProductEntry.id == product_id, 
        models.ProductEntry.merchant_id == merchant.id
    ).first()
    
    if not product:
        raise HTTPException(404)
        
    db.delete(product)
    db.commit()
    return {"status": "deleted", "id": product_id}
