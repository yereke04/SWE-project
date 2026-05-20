from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict

# --- Authentication ---
class AuthToken(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    role: str

class AccountCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str 

class AccountResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str

    model_config = ConfigDict(from_attributes=True)

# --- Merchant Profiles ---
class MerchantProfileUpdate(BaseModel):
    description: str

class MerchantPublicProfile(BaseModel):
    id: int
    business_name: str
    is_verified: bool
    description: Optional[str] = None
    is_public: bool

    model_config = ConfigDict(from_attributes=True)

# --- Inventory (Products) ---
class ProductBase(BaseModel):
    name: str
    price: float
    stock: int
    unit_type: str

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class DiscountUpdate(BaseModel):
    rate: int

class ProductResponse(ProductBase):
    id: int
    merchant_id: int
    original_price: Optional[float] = None
    discount_rate: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)

# --- Partnerships (Links) ---
class PartnershipRequest(BaseModel):
    merchant_id: int

class PartnershipUpdate(BaseModel):
    status: str

class PartnershipResponse(BaseModel):
    id: int
    buyer_id: int
    merchant_id: int     # This is the Business Profile ID
    merchant_user_id: Optional[int] = None # <--- ADD THIS LINE (The Human User ID)
    status: str
    created_at: datetime
    merchant_name: Optional[str] = None
    buyer_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# --- Transactions (Orders) ---
class OrderItemSchema(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    merchant_id: int
    items: List[OrderItemSchema]

class OrderResponse(BaseModel):
    id: int
    buyer_id: int
    merchant_id: int
    total_value: float
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class OrderStatusUpdate(BaseModel):
    status: str

# --- Communication (Chat & Support) ---
class TicketCreate(BaseModel):
    related_order_id: Optional[int] = None
    content: str

class TicketResponse(BaseModel):
    id: int
    user_id: int
    content: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ChatMessageCreate(BaseModel):
    receiver_id: int
    message_body: str

class ChatMessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    message_body: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
