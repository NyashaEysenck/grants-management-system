from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import List
from datetime import datetime
import base64
from bson import ObjectId

from ...utils.dependencies import get_current_active_user, require_role, get_database
from ...services.application_service import get_application_by_id
from .utils import build_application_response

router = APIRouter()

@router.post("/{application_id}/award-documents/upload")
async def upload_award_document(
    application_id: str,
    file: UploadFile = File(...),
    current_user = Depends(require_role("Grants Manager"))
):
    """Upload award document for approved application"""
    db = await get_database()
    
    application = await get_application_by_id(db, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if application.status != "signoff_approved":
        raise HTTPException(status_code=400, detail="Can only upload award documents for sign-off approved applications")
    
    # Read file content and encode to base64
    file_content = await file.read()
    file_data = base64.b64encode(file_content).decode('utf-8')
    
    # Create award document entry
    award_doc = {
        "id": f"award_{ObjectId()}",
        "filename": file.filename,
        "file_data": file_data,
        "file_type": file.content_type,
        "uploaded_at": datetime.utcnow().isoformat(),
        "uploaded_by": current_user.email
    }
    
    # Add to application's award_documents array
    result = await db.applications.update_one(
        {"_id": ObjectId(application_id)},
        {
            "$push": {"award_documents": award_doc},
            "$set": {
                "status": "award_pending_acceptance",
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to upload award document")
    
    return {"message": "Award document uploaded successfully", "document_id": award_doc["id"]}

@router.get("/{application_id}/award-documents")
async def list_award_documents(
    application_id: str,
    current_user = Depends(get_current_active_user)
):
    """List award documents for application"""
    db = await get_database()
    
    application = await get_application_by_id(db, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Check access permissions
    if current_user.role == "Researcher" and application.email != current_user.email:
        raise HTTPException(status_code=403, detail="Access denied")
    
    award_documents = getattr(application, 'award_documents', [])
    
    # Return document metadata (without file data for list view)
    return [
        {
            "id": doc["id"],
            "filename": doc["filename"],
            "file_type": doc["file_type"],
            "uploaded_at": doc["uploaded_at"],
            "uploaded_by": doc["uploaded_by"]
        }
        for doc in award_documents
    ]

@router.get("/{application_id}/award-documents/{document_id}/download")
async def download_award_document(
    application_id: str,
    document_id: str,
    current_user = Depends(get_current_active_user)
):
    """Download specific award document"""
    db = await get_database()
    
    application = await get_application_by_id(db, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Check access permissions
    if current_user.role == "Researcher" and application.email != current_user.email:
        raise HTTPException(status_code=403, detail="Access denied")
    
    award_documents = getattr(application, 'award_documents', [])
    document = next((doc for doc in award_documents if doc["id"] == document_id), None)
    
    if not document:
        raise HTTPException(status_code=404, detail="Award document not found")
    
    return {
        "filename": document["filename"],
        "file_type": document["file_type"],
        "file_data": document["file_data"]
    }

@router.delete("/{application_id}/award-documents/{document_id}")
async def delete_award_document(
    application_id: str,
    document_id: str,
    current_user = Depends(require_role("Grants Manager"))
):
    """Delete award document"""
    db = await get_database()
    
    application = await get_application_by_id(db, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Remove document from array
    result = await db.applications.update_one(
        {"_id": ObjectId(application_id)},
        {
            "$pull": {"award_documents": {"id": document_id}},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Award document not found")
    
    return {"message": "Award document deleted successfully"}

@router.post("/{application_id}/accept-award")
async def accept_award(
    application_id: str,
    acceptance_data: dict,
    current_user = Depends(get_current_active_user)
):
    """Researcher accepts award"""
    db = await get_database()
    
    application = await get_application_by_id(db, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Check permissions - only researcher who submitted can accept
    if application.email != current_user.email:
        raise HTTPException(status_code=403, detail="Only the applicant can accept/reject the award")
    
    if application.status != "award_pending_acceptance":
        raise HTTPException(status_code=400, detail="Award is not pending acceptance")
    
    decision = acceptance_data.get("decision")  # "accepted" or "rejected"
    comments = acceptance_data.get("comments", "")
    
    if decision not in ["accepted", "rejected"]:
        raise HTTPException(status_code=400, detail="Decision must be 'accepted' or 'rejected'")
    
    # Update application with acceptance data
    award_acceptance = {
        "status": decision,
        "decision": decision,
        "comments": comments,
        "decided_at": datetime.utcnow().isoformat(),
        "decided_by": current_user.email
    }
    
    new_status = "award_accepted" if decision == "accepted" else "award_rejected"
    
    result = await db.applications.update_one(
        {"_id": ObjectId(application_id)},
        {
            "$set": {
                "award_acceptance": award_acceptance,
                "status": new_status,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to record award decision")
    
    return {"message": f"Award {decision} successfully", "status": new_status}

@router.get("/{application_id}/acceptance-status")
async def get_acceptance_status(
    application_id: str,
    current_user = Depends(get_current_active_user)
):
    """Get award acceptance status"""
    db = await get_database()
    
    application = await get_application_by_id(db, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Check access permissions
    if current_user.role == "Researcher" and application.email != current_user.email:
        raise HTTPException(status_code=403, detail="Access denied")
    
    award_acceptance = getattr(application, 'award_acceptance', None)
    
    if not award_acceptance:
        return {
            "status": "pending",
            "can_accept": (application.status == "award_pending_acceptance" and 
                          application.email == current_user.email),
            "has_award_documents": len(getattr(application, 'award_documents', [])) > 0
        }
    
    return {
        "status": award_acceptance["status"],
        "decision": award_acceptance["decision"],
        "comments": award_acceptance.get("comments"),
        "decided_at": award_acceptance["decided_at"],
        "decided_by": award_acceptance["decided_by"],
        "can_accept": False,
        "has_award_documents": len(getattr(application, 'award_documents', [])) > 0
    }

@router.post("/{application_id}/award-letter/generate")
async def generate_award_letter(
    application_id: str,
    current_user = Depends(require_role("Grants Manager"))
):
    """Generate award letter for signoff approved application"""
    db = await get_database()
    
    application = await get_application_by_id(db, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if application.status != "signoff_approved":
        raise HTTPException(status_code=400, detail="Can only generate award letter for signoff approved applications")
    
    # Create award letter data
    award_letter = {
        "id": f"award_letter_{ObjectId()}",
        "filename": f"award_letter_{application.applicantName.replace(' ', '_')}.pdf",
        "generated_at": datetime.utcnow().isoformat(),
        "generated_by": current_user.email,
        "application_id": application_id,
        "applicant_name": application.applicantName,
        "proposal_title": application.proposalTitle,
        "award_amount": getattr(application, 'signoff_workflow', {}).get('award_amount', 0),
        "file_data": f"base64_encoded_award_letter_content_for_{application_id}",  # In real implementation, generate PDF
        "file_type": "application/pdf"
    }
    
    # Add to application's award_letter field
    result = await db.applications.update_one(
        {"_id": ObjectId(application_id)},
        {
            "$set": {
                "award_letter": award_letter,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to generate award letter")
    
    return {"message": "Award letter generated successfully", "letter_id": award_letter["id"]}

@router.get("/{application_id}/award-letter")
async def download_award_letter(
    application_id: str,
    current_user = Depends(get_current_active_user)
):
    """Download generated award letter"""
    db = await get_database()
    
    application = await get_application_by_id(db, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Check access permissions
    if current_user.role == "Researcher" and application.email != current_user.email:
        raise HTTPException(status_code=403, detail="Access denied")
    
    award_letter = getattr(application, 'award_letter', None)
    if not award_letter:
        raise HTTPException(status_code=404, detail="Award letter not found. Please generate it first.")
    
    return {
        "filename": award_letter["filename"],
        "file_type": award_letter["file_type"],
        "file_data": award_letter["file_data"],
        "generated_at": award_letter["generated_at"],
        "generated_by": award_letter["generated_by"]
    }

@router.post("/{application_id}/contract/confirm-receipt")
async def confirm_contract_receipt(
    application_id: str,
    confirmation_data: dict,
    current_user = Depends(require_role("Grants Manager"))
):
    """Confirm receipt of signed contract"""
    db = await get_database()
    
    application = await get_application_by_id(db, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if application.status != "contract_pending":
        raise HTTPException(status_code=400, detail="Contract receipt can only be confirmed for applications with contract_pending status")
    
    # Create contract confirmation record
    contract_confirmation = {
        "confirmed_at": datetime.utcnow().isoformat(),
        "confirmed_by": current_user.email,
        "comments": confirmation_data.get("comments", ""),
        "status": "received"
    }
    
    # Update application status
    result = await db.applications.update_one(
        {"_id": ObjectId(application_id)},
        {
            "$set": {
                "contract_confirmation": contract_confirmation,
                "status": "contract_received",
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to confirm contract receipt")
    
    return {"message": "Contract receipt confirmed successfully", "status": "contract_received"}

@router.get("/{application_id}/document")
async def download_application_document(
    application_id: str,
    current_user = Depends(get_current_active_user)
):
    """Download original application proposal document"""
    db = await get_database()
    
    application = await get_application_by_id(db, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Check access permissions
    if current_user.role == "Researcher" and application.email != current_user.email:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Check if proposal file exists
    if not hasattr(application, 'proposalFileName') or not application.proposalFileName:
        raise HTTPException(status_code=404, detail="Application document not found")
    
    # In a real implementation, you would fetch the actual file from storage
    # For now, return the metadata that would allow downloading
    return {
        "filename": application.proposalFileName,
        "file_type": getattr(application, 'proposalFileType', 'application/pdf'),
        "file_size": getattr(application, 'proposalFileSize', 0),
        "uploaded_at": getattr(application, 'submissionDate', ''),
        # In real implementation, include file_data or a download URL
        "message": "Document metadata retrieved. Implement actual file storage integration for download."
    }