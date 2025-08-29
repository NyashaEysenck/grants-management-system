from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from ..db_config import get_database
from ..schemas.user import Token, UserLogin, UserResponse, TokenWithUser, RefreshTokenRequest
from ..schemas.error import ErrorCode
from ..services.user_service import authenticate_user, get_user_by_email
from ..utils.security import create_access_token, create_refresh_token, verify_token, decode_token
from ..utils.error_handlers import AuthenticationError, rate_limiter
from ..config import settings
from ..utils.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/login", response_model=TokenWithUser)
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    db = await get_database()
    email = form_data.username.lower().strip()
    
    #Check rate limiting
    # is_limited, retry_after = rate_limiter.is_rate_limited(email)
    # if is_limited:
    #     raise AuthenticationError(
    #         error_code=ErrorCode.TOO_MANY_ATTEMPTS,
    #         message="Too many failed login attempts",
    #         details=f"Account temporarily locked. Try again in {retry_after} seconds",
    #         retry_after=retry_after
    #     )
    
    # Authenticate user without role requirement
    user = await authenticate_user(db, email, form_data.password)
    if not user:
        # Record failed attempt
        rate_limiter.record_attempt(email, success=False)
        
        raise AuthenticationError(
            error_code=ErrorCode.INVALID_CREDENTIALS,
            message="Invalid email or password",
            details="Please check your credentials and try again"
        )
    
    # Check if account is disabled
    if user.status == "disabled":
        raise AuthenticationError(
            error_code=ErrorCode.ACCOUNT_DISABLED,
            message="Account disabled",
            details="Your account has been disabled. Please contact support"
        )
    
    # Record successful attempt
    rate_limiter.record_attempt(email, success=True)
    
    # Create access and refresh tokens
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    refresh_token_expires = timedelta(days=settings.refresh_token_expire_days)
    
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(
        data={"sub": user.email}, expires_delta=refresh_token_expires
    )
    
    user_response = UserResponse(
        id=str(user.id),
        name=user.name,
        email=user.email,
        role=user.role,
        status=user.status,
        created_at=user.created_at.isoformat()
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user_response
    }

@router.post("/login-custom", response_model=Token)
async def login_custom(user_login: UserLogin):
    db = await get_database()
    
    user = await authenticate_user(db, user_login.email, user_login.password, user_login.role)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email, password, or role"
        )
    
    # Create access and refresh tokens
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    refresh_token_expires = timedelta(days=settings.refresh_token_expire_days)
    
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(
        data={"sub": user.email}, expires_delta=refresh_token_expires
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_request: RefreshTokenRequest):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Verify refresh token
        email = verify_token(refresh_request.refresh_token, credentials_exception, "refresh")
        
        # Get user from database
        db = await get_database()
        user = await get_user_by_email(db, email)
        if user is None:
            raise credentials_exception
        
        # Create new access and refresh tokens
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        refresh_token_expires = timedelta(days=settings.refresh_token_expire_days)
        
        new_access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        new_refresh_token = create_refresh_token(
            data={"sub": user.email}, expires_delta=refresh_token_expires
        )
        
        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }
        
    except Exception:
        raise credentials_exception

@router.post("/logout")
async def logout():
    # In a production system, you might want to blacklist the tokens
    # For now, we'll just return a success message
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user.id),
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        status=current_user.status,
        created_at=current_user.created_at.isoformat()
    )
