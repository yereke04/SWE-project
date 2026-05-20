from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy import or_
from sqlalchemy.orm import Session
import models, schemas, security, database

router = APIRouter(prefix="/communication", tags=["Communication"])

# --- Support Tickets ---

@router.post("/tickets", response_model=schemas.TicketResponse)
def open_ticket(
    payload: schemas.TicketCreate,
    user: models.UserAccount = Depends(security.get_current_user),
    db: Session = Depends(database.get_db)
):
    ticket = models.InquiryTicket(
        user_id=user.id,
        content=payload.content,
        related_order_id=payload.related_order_id
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket

@router.get("/tickets", response_model=List[schemas.TicketResponse])
def get_my_tickets(
    user: models.UserAccount = Depends(security.get_current_user),
    db: Session = Depends(database.get_db)
):
    return db.query(models.InquiryTicket).filter(models.InquiryTicket.user_id == user.id).all()

# --- Direct Chat ---

@router.get("/chat/{partner_id}", response_model=List[schemas.ChatMessageResponse])
def get_chat_history(
    partner_id: int,
    user: models.UserAccount = Depends(security.get_current_user),
    db: Session = Depends(database.get_db)
):
    # Retrieve messages where sender is me AND receiver is them, OR sender is them AND receiver is me.
    history = db.query(models.ChatMessage).filter(
        or_(
            (models.ChatMessage.sender_id == user.id) & (models.ChatMessage.receiver_id == partner_id),
            (models.ChatMessage.sender_id == partner_id) & (models.ChatMessage.receiver_id == user.id)
        )
    ).order_by(models.ChatMessage.timestamp).all()
    
    return history

@router.post("/chat", response_model=schemas.ChatMessageResponse)
def send_message(
    msg: schemas.ChatMessageCreate,
    user: models.UserAccount = Depends(security.get_current_user),
    db: Session = Depends(database.get_db)
):
    new_msg = models.ChatMessage(
        sender_id=user.id,
        receiver_id=msg.receiver_id,
        message_body=msg.message_body
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)
    return new_msg
