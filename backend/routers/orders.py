from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas, security, database

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.post("/", response_model=schemas.OrderResponse)
def create_transaction(
    order_data: schemas.OrderCreate, 
    current_user: models.UserAccount = Depends(security.get_current_user), 
    db: Session = Depends(database.get_db)
):
    # 1. Verify Partnership
    partnership = db.query(models.Partnership).filter(
        models.Partnership.buyer_id == current_user.id,
        models.Partnership.merchant_id == order_data.merchant_id,
        models.Partnership.status.in_(["accepted", "active"]) 
    ).first()

    if not partnership:
        raise HTTPException(status_code=403, detail="Active partnership required.")

    # 2. Calculate total
    total_cost = 0.0
    for item in order_data.items:
        product = db.query(models.ProductEntry).filter(models.ProductEntry.id == item.product_id).first()
        if product:
            price = float(product.price)
            discount = product.discount_rate or 0
            final_price = price * (1 - discount / 100.0)
            total_cost += (final_price * item.quantity)

    # 3. Save Order
    new_order = models.SalesOrder(
        buyer_id=current_user.id,
        merchant_id=order_data.merchant_id,
        total_value=total_cost,
        status="pending"
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # 4. Save Lines
    for item in order_data.items:
        line_item = models.OrderItem(
            order_id=new_order.id,
            product_id=item.product_id,
            quantity=item.quantity
        )
        db.add(line_item)
    
    db.commit()
    return new_order

@router.get("/", response_model=List[schemas.OrderResponse])
def list_transactions(
    user: models.UserAccount = Depends(security.get_current_user), 
    db: Session = Depends(database.get_db)
):
    # If user is a merchant, show incoming orders. If buyer, show outgoing.
    merchant_profile = db.query(models.MerchantProfile).filter(models.MerchantProfile.user_id == user.id).first()
    
    if merchant_profile:
        orders = db.query(models.SalesOrder).filter(models.SalesOrder.merchant_id == merchant_profile.id).all()
    else:
        orders = db.query(models.SalesOrder).filter(models.SalesOrder.buyer_id == user.id).all()
        
    return orders

@router.put("/{order_id}/status")
def update_transaction_status(
    order_id: int,
    status_update: schemas.OrderStatusUpdate,
    user: models.UserAccount = Depends(security.get_current_user), 
    db: Session = Depends(database.get_db)
):
    merchant = db.query(models.MerchantProfile).filter(models.MerchantProfile.user_id == user.id).first()
    if not merchant:
        raise HTTPException(403, detail="Only merchants can update order status.")
        
    order = db.query(models.SalesOrder).filter(
        models.SalesOrder.id == order_id,
        models.SalesOrder.merchant_id == merchant.id
    ).first()
    
    if not order:
        raise HTTPException(404)
        
    order.status = status_update.status
    db.commit()
    return {"status": "updated", "current_status": order.status}
