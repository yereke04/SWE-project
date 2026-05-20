from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import models, schemas, security, database

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

@router.post("/signup", response_model=schemas.AccountResponse)
def register_new_user(data: schemas.AccountCreate, db: Session = Depends(database.get_db)):
    # Check if email exists
    existing_user = db.query(models.UserAccount).filter(models.UserAccount.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email address already registered.")

    # Create User
    hashed_pw = security.get_password_hash(data.password)
    new_user = models.UserAccount(
        email=data.email,
        password_hash=hashed_pw,
        full_name=data.full_name,
        role=data.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create Profile based on Role
    if data.role == "merchant_admin" or data.role == "supplier_admin":
        # Map 'supplier_admin' to 'merchant_admin' for consistency if needed, or keep strictly equal
        profile = models.MerchantProfile(
            user_id=new_user.id,
            business_name=data.full_name,
            is_public=False
        )
        db.add(profile)
        db.commit()
    
    # Note: BuyerProfile was optional in new design, but we can add it if strictly needed. 
    # The UserAccount handles the identity well enough for now.

    return new_user

@router.post("/login", response_model=schemas.AuthToken)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.UserAccount).filter(models.UserAccount.email == form_data.username).first()
    
    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = security.create_access_token(data={"sub": user.email})
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_id": user.id,
        "role": user.role
    }
