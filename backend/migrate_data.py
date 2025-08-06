import asyncio
import json
import os
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from bson import ObjectId

# Configuration
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "grants_management")

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def connect_to_database():
    """Connect to MongoDB"""
    client = AsyncIOMotorClient(MONGODB_URI)
    return client[DATABASE_NAME]

async def load_json_data():
    """Load JSON data from files"""
    base_path = "../src/data"
    
    data = {}
    
    # Load users data
    with open(f"{base_path}/users.json", "r") as f:
        data["users"] = json.load(f)["users"]
    
    # Load grant calls data
    with open(f"{base_path}/grantCalls.json", "r") as f:
        data["grant_calls"] = json.load(f)["grantCalls"]
    
    # Load applications data
    with open(f"{base_path}/applications.json", "r") as f:
        data["applications"] = json.load(f)["applications"]
    
    # Load projects data
    with open(f"{base_path}/projects.json", "r") as f:
        data["projects"] = json.load(f)["projects"]
    
    return data

async def migrate_users(db, users_data):
    """Migrate users to MongoDB"""
    print("Migrating users...")
    
    # Clear existing users
    await db.users.delete_many({})
    
    users_to_insert = []
    for user in users_data:
        # Hash the password
        hashed_password = pwd_context.hash(user["password"])
        
        user_doc = {
            "name": user["name"],
            "email": user["email"],
            "hashed_password": hashed_password,
            "role": user["role"],
            "status": "active",
            "created_at": datetime.utcnow()
        }
        users_to_insert.append(user_doc)
    
    result = await db.users.insert_many(users_to_insert)
    print(f"Inserted {len(result.inserted_ids)} users")
    return result.inserted_ids

async def migrate_grant_calls(db, grant_calls_data):
    """Migrate grant calls to MongoDB"""
    print("Migrating grant calls...")
    
    # Clear existing grant calls
    await db.grant_calls.delete_many({})
    
    grant_calls_to_insert = []
    for grant_call in grant_calls_data:
        grant_call_doc = {
            "title": grant_call["title"],
            "type": grant_call["type"],
            "sponsor": grant_call["sponsor"],
            "deadline": grant_call["deadline"],
            "scope": grant_call["scope"],
            "eligibility": grant_call["eligibility"],
            "requirements": grant_call["requirements"],
            "status": grant_call["status"],
            "visibility": grant_call["visibility"],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        grant_calls_to_insert.append(grant_call_doc)
    
    result = await db.grant_calls.insert_many(grant_calls_to_insert)
    print(f"Inserted {len(result.inserted_ids)} grant calls")
    return result.inserted_ids

async def migrate_applications(db, applications_data):
    """Migrate applications to MongoDB"""
    print("Migrating applications...")
    
    # Clear existing applications
    await db.applications.delete_many({})
    
    applications_to_insert = []
    for app in applications_data:
        # Transform reviewer feedback
        reviewer_feedback = []
        if "reviewerFeedback" in app:
            for feedback in app["reviewerFeedback"]:
                reviewer_feedback.append({
                    "reviewer_email": feedback["reviewerEmail"],
                    "reviewer_name": feedback["reviewerName"],
                    "score": 85 if feedback["decision"] == "approve" else 65,  # Default scores
                    "comments": feedback["comments"],
                    "decision": feedback["decision"],
                    "reviewed_at": datetime.fromisoformat(feedback["submittedAt"].replace('Z', '+00:00'))
                })
        
        app_doc = {
            "grant_call_id": app["grantId"],
            "title": app["proposalTitle"],
            "email": app["email"],
            "researcher_name": app["applicantName"],
            "institution": "University Research Institute",  # Default value
            "department": "Computer Science",  # Default value
            "project_summary": f"Research project: {app['proposalTitle']}",
            "objectives": "Primary research objectives and goals",
            "methodology": "Research methodology and approach",
            "expected_outcomes": "Expected research outcomes and impact",
            "budget_amount": 100000.0,  # Default budget
            "budget_justification": "Budget breakdown and justification",
            "timeline": "12-month project timeline",
            "status": app["status"],
            "reviewer_feedback": reviewer_feedback,
            "final_decision": app.get("status"),
            "decision_notes": app.get("reviewComments"),
            "submitted_at": datetime.fromisoformat(app["submissionDate"].replace('Z', '+00:00')),
            "updated_at": datetime.utcnow()
        }
        applications_to_insert.append(app_doc)
    
    result = await db.applications.insert_many(applications_to_insert)
    print(f"Inserted {len(result.inserted_ids)} applications")
    return result.inserted_ids

async def migrate_projects(db, projects_data):
    """Migrate projects to MongoDB"""
    print("Migrating projects...")
    
    # Clear existing projects
    await db.projects.delete_many({})
    
    projects_to_insert = []
    for project in projects_data:
        # Transform milestones
        milestones = []
        for milestone in project.get("milestones", []):
            milestone_doc = {
                "id": milestone["id"],
                "title": milestone["title"],
                "due_date": milestone["dueDate"],
                "status": milestone["status"],
                "description": milestone["description"],
                "progress_report_uploaded": milestone.get("progressReportUploaded", False),
                "progress_report_date": milestone.get("progressReportDate"),
                "progress_report_filename": milestone.get("progressReportFilename"),
                "is_overdue": milestone.get("isOverdue", False)
            }
            milestones.append(milestone_doc)
        
        # Transform requisitions
        requisitions = []
        for req in project.get("requisitions", []):
            req_doc = {
                "id": req["id"],
                "milestone_id": req["milestoneId"],
                "amount": req["amount"],
                "requested_date": req["requestedDate"],
                "status": req["status"],
                "notes": req["notes"],
                "reviewed_by": req.get("reviewedBy"),
                "reviewed_date": req.get("reviewedDate"),
                "review_notes": req.get("reviewNotes")
            }
            requisitions.append(req_doc)
        
        # Transform partners
        partners = []
        for partner in project.get("partners", []):
            partner_doc = {
                "id": partner["id"],
                "name": partner["name"],
                "role": partner["role"],
                "mou_filename": partner.get("mouFilename"),
                "uploaded_date": partner.get("uploadedDate")
            }
            partners.append(partner_doc)
        
        # Transform final report
        final_report = None
        if "finalReport" in project:
            fr = project["finalReport"]
            final_report = {
                "narrative_report": fr.get("narrativeReport"),
                "financial_report": fr.get("financialReport"),
                "status": fr.get("status", "draft"),
                "submitted_date": fr.get("submittedDate"),
                "reviewed_by": fr.get("reviewedBy"),
                "reviewed_date": fr.get("reviewedDate"),
                "review_notes": fr.get("reviewNotes")
            }
        
        # Transform closure workflow
        closure_workflow = None
        if "closureWorkflow" in project:
            cw = project["closureWorkflow"]
            closure_workflow = {
                "status": cw.get("status", "pending"),
                "vc_sign_off_token": cw.get("vcSignOffToken"),
                "vc_signed_by": cw.get("vcSignedBy"),
                "vc_signed_date": cw.get("vcSignedDate"),
                "vc_notes": cw.get("vcNotes"),
                "closure_certificate_generated": cw.get("closureCertificateGenerated", False),
                "closure_certificate_date": cw.get("closureCertificateDate")
            }
        
        project_doc = {
            "application_id": project["applicationId"],
            "title": project["title"],
            "status": project["status"],
            "start_date": project["startDate"],
            "end_date": project["endDate"],
            "milestones": milestones,
            "requisitions": requisitions,
            "partners": partners,
            "final_report": final_report,
            "closure_workflow": closure_workflow,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        projects_to_insert.append(project_doc)
    
    result = await db.projects.insert_many(projects_to_insert)
    print(f"Inserted {len(result.inserted_ids)} projects")
    return result.inserted_ids

async def create_indexes(db):
    """Create database indexes for better performance"""
    print("Creating database indexes...")
    
    # Users indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("role")
    
    # Grant calls indexes
    await db.grant_calls.create_index("status")
    await db.grant_calls.create_index("type")
    await db.grant_calls.create_index("deadline")
    
    # Applications indexes
    await db.applications.create_index("email")
    await db.applications.create_index("status")
    await db.applications.create_index("grant_call_id")
    
    # Projects indexes
    await db.projects.create_index("application_id")
    await db.projects.create_index("status")
    await db.projects.create_index("closure_workflow.vc_sign_off_token")
    
    # Documents indexes (for future use)
    await db.documents.create_index("folder")
    await db.documents.create_index("created_by")
    
    print("Database indexes created successfully")

async def main():
    """Main migration function"""
    print("Starting data migration...")
    
    try:
        # Connect to database
        db = await connect_to_database()
        print(f"Connected to MongoDB database: {DATABASE_NAME}")
        
        # Load JSON data
        data = await load_json_data()
        print("JSON data loaded successfully")
        
        # Migrate data
        await migrate_users(db, data["users"])
        await migrate_grant_calls(db, data["grant_calls"])
        await migrate_applications(db, data["applications"])
        await migrate_projects(db, data["projects"])
        
        # Create indexes
        await create_indexes(db)
        
        print("\n" + "="*50)
        print("DATA MIGRATION COMPLETED SUCCESSFULLY!")
        print("="*50)
        print(f"Users: {len(data['users'])}")
        print(f"Grant Calls: {len(data['grant_calls'])}")
        print(f"Applications: {len(data['applications'])}")
        print(f"Projects: {len(data['projects'])}")
        print("="*50)
        
    except Exception as e:
        print(f"Migration failed: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(main())