from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Numeric
from sqlalchemy.orm import relationship
from database import Base

class UserAccount(Base):
    __tablename__ = "user_accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # e.g., 'merchant', 'buyer'

    merchant_profile = relationship("MerchantProfile", back_populates="user", uselist=False)
    # Relationships for chat
    sent_messages = relationship("ChatMessage", foreign_keys="ChatMessage.sender_id", back_populates="sender")
    received_messages = relationship("ChatMessage", foreign_keys="ChatMessage.receiver_id", back_populates="receiver")

class MerchantProfile(Base):
    __tablename__ = "merchant_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user_accounts.id"), nullable=False)
    business_name = Column(String, nullable=False)
    is_verified = Column(Boolean, default=False)
    description = Column(Text, nullable=True)
    is_public = Column(Boolean, default=False)

    user = relationship("UserAccount", back_populates="merchant_profile")
    inventory = relationship("ProductEntry", back_populates="merchant")
    partnerships = relationship("Partnership", back_populates="merchant")

class ProductEntry(Base):
    __tablename__ = "product_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    merchant_id = Column(Integer, ForeignKey("merchant_profiles.id"), nullable=False)
    name = Column(String, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    stock = Column(Integer, nullable=False)
    unit_type = Column(String, nullable=False)
    discount_rate = Column(Integer, default=0)

    merchant = relationship("MerchantProfile", back_populates="inventory")

class Partnership(Base):
    """Represents a B2B link between a buyer (User) and a Merchant."""
    __tablename__ = "partnerships"
    
    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("user_accounts.id"), nullable=False)
    merchant_id = Column(Integer, ForeignKey("merchant_profiles.id"), nullable=False)
    status = Column(String, default="pending")  # pending, active, rejected
    created_at = Column(DateTime, default=datetime.utcnow)

    merchant = relationship("MerchantProfile", back_populates="partnerships")
    buyer = relationship("UserAccount")

class SalesOrder(Base):
    __tablename__ = "sales_orders"
    
    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("user_accounts.id"), nullable=False)
    merchant_id = Column(Integer, ForeignKey("merchant_profiles.id"), nullable=False)
    total_value = Column(Numeric(10, 2), nullable=False)
    status = Column(String, default="processing")
    created_at = Column(DateTime, default=datetime.utcnow)

    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("sales_orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("product_entries.id"), nullable=False)
    quantity = Column(Integer, nullable=False)

    order = relationship("SalesOrder", back_populates="items")

class InquiryTicket(Base):
    __tablename__ = "inquiry_tickets"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user_accounts.id"), nullable=False)
    content = Column(Text, nullable=False)
    status = Column(String, default="open")
    created_at = Column(DateTime, default=datetime.utcnow)
    related_order_id = Column(Integer, nullable=True)

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("user_accounts.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("user_accounts.id"), nullable=False)
    message_body = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    sender = relationship("UserAccount", foreign_keys=[sender_id], back_populates="sent_messages")
    receiver = relationship("UserAccount", foreign_keys=[receiver_id], back_populates="received_messages")
