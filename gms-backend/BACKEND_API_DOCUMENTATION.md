# Grants Management System Backend API Documentation

This document provides a full reference for the FastAPI backend, including all endpoints, expected request bodies, response formats, and a summary of the main services.

---

## Table of Contents

- [Authentication](#authentication)
- [Users](#users)
- [Grant Calls](#grant-calls)
- [Applications](#applications)
- [Projects](#projects)
- [Documents](#documents)
- [Admin](#admin)
- [Services Overview](#services-overview)

---

## Authentication

### `POST /auth/login`
**Description:** User login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "email": "user@example.com",
    "role": "Researcher",
    "name": "Dr. Sarah Johnson"
  }
}
```

**Status Codes:**
- `200 OK`: Successful login
- `401 Unauthorized`: Invalid credentials
- `423 Locked`: Account locked due to too many failed attempts
- `400 Bad Request`: Missing or invalid fields

---

### `POST /auth/login-custom`
**Description:** Custom login format for external systems integration.

**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "password123",
  "system": "external_system"
}
```

**Response:** Same as standard login.

**Status Codes:**
- `200 OK`: Successful login
- `401 Unauthorized`: Invalid credentials
- `423 Locked`: Account locked due to too many failed attempts
- `400 Bad Request`: Missing or invalid fields

---

### `GET /auth/me`
**Description:** Get current user info (requires authentication).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "email": "user@example.com",
  "role": "Researcher",
  "name": "Dr. Sarah Johnson",
  "id": "user_id"
}
```

**Status Codes:**
- `200 OK`: Success
- `401 Unauthorized`: Invalid or expired token

---

## Users

### `GET /users/`
**Description:** List all users (Admin only).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
[
  {
    "email": "researcher@grants.edu",
    "role": "Researcher",
    "name": "Dr. Sarah Johnson",
    "createdAt": "2024-07-15T10:30:00Z",
    "id": "user_id_1"
  },
  {
    "email": "manager@grants.edu",
    "role": "Grants Manager",
    "name": "Michael Chen",
    "createdAt": "2024-06-10T09:15:00Z",
    "id": "user_id_2"
  }
]
```

**Status Codes:**
- `200 OK`: Success
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not an admin

---

### `POST /users/`
**Description:** Create new user (Admin only).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "email": "newuser@grants.edu",
  "password": "newpassword",
  "role": "Researcher",
  "name": "New User"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "email": "newuser@grants.edu",
    "role": "Researcher",
    "name": "New User",
    "id": "new_user_id",
    "createdAt": "2024-07-22T14:25:30Z"
  }
}
```

**Status Codes:**
- `201 Created`: User created successfully
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not an admin
- `409 Conflict`: Email already exists

---

### `PUT /users/{id}`
**Description:** Update user (Admin only).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL Parameters:**
- `id`: User ID

**Request Body:** Partial user fields.
```json
{
  "role": "Grants Manager",
  "name": "Updated Name"
}
```

**Response:**
```json
{
  "message": "User updated successfully",
  "user": {
    "email": "user@grants.edu",
    "role": "Grants Manager",
    "name": "Updated Name",
    "id": "user_id",
    "createdAt": "2024-06-15T10:30:00Z",
    "updatedAt": "2024-07-22T14:25:30Z"
  }
}
```

**Status Codes:**
- `200 OK`: User updated successfully
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not an admin
- `404 Not Found`: User not found

---

### `DELETE /users/{id}`
**Description:** Delete user (Admin only).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL Parameters:**
- `id`: User ID

**Response:**
```json
{
  "message": "User deleted successfully",
  "id": "deleted_user_id"
}
```

**Status Codes:**
- `200 OK`: User deleted successfully
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not an admin
- `404 Not Found`: User not found

---

## Grant Calls

### `GET /grant-calls/`
**Description:** List grant calls (optionally filter by type/status).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `type_filter` (optional): string - Filter by grant type (e.g., "ORI", "External")
- `status_filter` (optional): string - Filter by status ("Open" or "Closed")

**Response:**
```json
[
  {
    "id": "grant_call_id_1",
    "title": "Research Innovation Grant 2024",
    "type": "ORI",
    "sponsor": "National Science Foundation",
    "deadline": "2024-12-31T23:59:59Z",
    "scope": "Supporting innovative research projects in technology and science",
    "eligibility": "Open to all researchers with PhD",
    "requirements": "Submit proposal with budget and timeline",
    "status": "Open",
    "visibility": "Public",
    "created_at": "2024-06-15T10:30:00Z",
    "updated_at": "2024-06-15T10:30:00Z"
  },
  {
    "id": "grant_call_id_2",
    "title": "Healthcare Innovation Fund",
    "type": "External",
    "sponsor": "Health Research Council",
    "deadline": "2024-11-30T23:59:59Z",
    "scope": "Advancing healthcare through innovative research",
    "eligibility": "Healthcare researchers and institutions",
    "requirements": "Focus on patient impact and clinical relevance",
    "status": "Open",
    "visibility": "Public",
    "created_at": "2024-06-20T14:45:00Z",
    "updated_at": "2024-06-20T14:45:00Z"
  }
]
```

**Status Codes:**
- `200 OK`: Success
- `401 Unauthorized`: Not authenticated

---

### `POST /grant-calls/`
**Description:** Create grant call (Grants Manager).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "title": "Research Innovation Grant 2024",
  "type": "ORI",
  "sponsor": "National Science Foundation",
  "deadline": "2024-12-31T23:59:59Z",
  "scope": "Supporting innovative research projects",
  "eligibility": "Open to all researchers with PhD",
  "requirements": "Submit proposal with budget and timeline",
  "status": "Open",
  "visibility": "Public"
}
```

**Response:**
```json
{
  "id": "new_grant_call_id",
  "title": "Research Innovation Grant 2024",
  "type": "ORI",
  "sponsor": "National Science Foundation",
  "deadline": "2024-12-31T23:59:59Z",
  "scope": "Supporting innovative research projects",
  "eligibility": "Open to all researchers with PhD",
  "requirements": "Submit proposal with budget and timeline",
  "status": "Open",
  "visibility": "Public",
  "created_at": "2024-07-22T14:25:30Z",
  "updated_at": "2024-07-22T14:25:30Z"
}
```

**Status Codes:**
- `201 Created`: Grant call created successfully
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not a Grants Manager

---

### `PUT /grant-calls/{id}`
**Description:** Update grant call (Grants Manager).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL Parameters:**
- `id`: Grant call ID

**Request Body:** Partial grant call fields.
```json
{
  "title": "Updated Grant Title",
  "deadline": "2025-01-31T23:59:59Z",
  "requirements": "Updated requirements"
}
```

**Response:**
```json
{
  "id": "grant_call_id",
  "title": "Updated Grant Title",
  "type": "ORI",
  "sponsor": "National Science Foundation",
  "deadline": "2025-01-31T23:59:59Z",
  "scope": "Supporting innovative research projects",
  "eligibility": "Open to all researchers with PhD",
  "requirements": "Updated requirements",
  "status": "Open",
  "visibility": "Public",
  "created_at": "2024-06-15T10:30:00Z",
  "updated_at": "2024-07-22T14:25:30Z"
}
```

**Status Codes:**
- `200 OK`: Grant call updated successfully
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not a Grants Manager
- `404 Not Found`: Grant call not found

---

### `PATCH /grant-calls/{id}/toggle-status`
**Description:** Toggle grant call status between Open and Closed.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL Parameters:**
- `id`: Grant call ID

**Response:**
```json
{
  "id": "grant_call_id",
  "title": "Research Innovation Grant 2024",
  "type": "ORI",
  "sponsor": "National Science Foundation",
  "deadline": "2024-12-31T23:59:59Z",
  "scope": "Supporting innovative research projects",
  "eligibility": "Open to all researchers with PhD",
  "requirements": "Submit proposal with budget and timeline",
  "status": "Closed",
  "visibility": "Public",
  "created_at": "2024-06-15T10:30:00Z",
  "updated_at": "2024-07-22T14:25:30Z"
}
```

**Status Codes:**
- `200 OK`: Status toggled successfully
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not a Grants Manager
- `404 Not Found`: Grant call not found

---

### `DELETE /grant-calls/{id}`
**Description:** Delete grant call.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL Parameters:**
- `id`: Grant call ID

**Response:**
```json
{
  "message": "Grant call deleted successfully",
  "id": "deleted_grant_call_id"
}
```

**Status Codes:**
- `200 OK`: Grant call deleted successfully
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not a Grants Manager
- `404 Not Found`: Grant call not found
- `409 Conflict`: Cannot delete grant call with associated applications

---

## Applications

### `GET /applications/`
**Description:** List applications (filtered by user role, status, or grant call).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `status_filter` (optional): string - Filter by application status
- `grant_call_id` (optional): string - Filter by associated grant call

**Response:**
```json
[
  {
    "id": "application_id_1",
    "grantId": "grant_call_id_1",
    "applicantName": "Dr. Sarah Johnson",
    "email": "researcher@grants.edu",
    "proposalTitle": "AI-Powered Climate Change Prediction Models",
    "institution": "University of Technology",
    "department": "Computer Science",
    "projectSummary": "Developing advanced AI models to predict climate change patterns",
    "objectives": "Create predictive models for climate change analysis",
    "methodology": "Machine learning algorithms with historical climate data",
    "expectedOutcomes": "Improved climate prediction accuracy by 25%",
    "budgetAmount": 500000.0,
    "budgetJustification": "Equipment, personnel, and computational resources",
    "timeline": "24 months",
    "status": "manager_approved",
    "submissionDate": "2024-07-15T10:30:00Z",
    "reviewComments": "Excellent proposal with strong methodology",
    "deadline": "2024-12-31T23:59:59Z",
    "revisionCount": 0,
    "originalSubmissionDate": "2024-07-15T10:30:00Z",
    "isEditable": false,
    "proposalFileName": "ai-climate-prediction.pdf",
    "proposalFileSize": 2048000,
    "proposalFileType": "application/pdf",
    "biodata": {
      "name": "Dr. Sarah Johnson",
      "age": 42,
      "email": "researcher@grants.edu",
      "firstTimeApplicant": false
    },
    "reviewHistory": [
      {
        "id": "rev_001",
        "reviewerName": "Dr. Review Expert",
        "reviewerEmail": "reviewer@grants.edu",
        "comments": "Strong technical approach and clear objectives",
        "submittedAt": "2024-07-20T14:30:00Z",
        "status": "approved"
      }
    ],
    "signoff_workflow": {
      "status": "pending",
      "award_amount": 500000.0,
      "approvals": [
        {
          "role": "DORI",
          "email": "dori@grants.edu",
          "name": "Dr. DORI Manager",
          "token": "sample_dori_token_123",
          "status": "pending",
          "created_at": "2024-07-21T10:30:00Z"
        },
        {
          "role": "DVC",
          "email": "dvc@grants.edu",
          "name": "Prof. DVC Leader",
          "token": "sample_dvc_token_456",
          "status": "pending",
          "created_at": "2024-07-21T10:30:00Z"
        }
      ],
      "initiated_by": "manager@grants.edu",
      "initiated_at": "2024-07-21T10:30:00Z"
    },
    "createdAt": "2024-07-15T10:30:00Z",
    "updatedAt": "2024-07-21T10:30:00Z"
  }
]
```

**Status Codes:**
- `200 OK`: Success
- `401 Unauthorized`: Not authenticated

---

### `GET /applications/my`
**Description:** Get applications for current user.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `status_filter` (optional): string - Filter by application status

**Response:** Array of application objects (same structure as GET /applications/).

**Status Codes:**
- `200 OK`: Success
- `401 Unauthorized`: Not authenticated

---

### `POST /applications/`
**Description:** Submit new application.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "grantId": "grant_call_id",
  "applicantName": "Dr. Sarah Johnson",
  "email": "researcher@grants.edu",
  "proposalTitle": "AI-Powered Climate Change Prediction Models",
  "institution": "University of Technology",
  "department": "Computer Science",
  "projectSummary": "Developing advanced AI models to predict climate change patterns",
  "objectives": "Create predictive models for climate change analysis",
  "methodology": "Machine learning algorithms with historical climate data",
  "expectedOutcomes": "Improved climate prediction accuracy by 25%",
  "budgetAmount": 500000.0,
  "budgetJustification": "Equipment, personnel, and computational resources",
  "timeline": "24 months",
  "biodata": {
    "name": "Dr. Sarah Johnson",
    "age": 42,
    "email": "researcher@grants.edu",
    "firstTimeApplicant": false
  },
  "proposalFileName": "ai-climate-prediction.pdf",
  "proposalFileData": "base64_encoded_file_data",
  "proposalFileSize": 2048000,
  "proposalFileType": "application/pdf"
}
```

**Response:**
```json
{
  "id": "new_application_id",
  "grantId": "grant_call_id",
  "applicantName": "Dr. Sarah Johnson",
  "email": "researcher@grants.edu",
  "proposalTitle": "AI-Powered Climate Change Prediction Models",
  "institution": "University of Technology",
  "department": "Computer Science",
  "projectSummary": "Developing advanced AI models to predict climate change patterns",
  "objectives": "Create predictive models for climate change analysis",
  "methodology": "Machine learning algorithms with historical climate data",
  "expectedOutcomes": "Improved climate prediction accuracy by 25%",
  "budgetAmount": 500000.0,
  "budgetJustification": "Equipment, personnel, and computational resources",
  "timeline": "24 months",
  "status": "submitted",
  "submissionDate": "2024-07-22T14:25:30Z",
  "reviewComments": "",
  "deadline": "2024-12-31T23:59:59Z",
  "revisionCount": 0,
  "originalSubmissionDate": "2024-07-22T14:25:30Z",
  "isEditable": false,
  "proposalFileName": "ai-climate-prediction.pdf",
  "proposalFileSize": 2048000,
  "proposalFileType": "application/pdf",
  "biodata": {
    "name": "Dr. Sarah Johnson",
    "age": 42,
    "email": "researcher@grants.edu",
    "firstTimeApplicant": false
  },
  "reviewHistory": [],
  "createdAt": "2024-07-22T14:25:30Z",
  "updatedAt": "2024-07-22T14:25:30Z"
}
```

**Status Codes:**
- `201 Created`: Application submitted successfully
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Email doesn't match authenticated user
- `404 Not Found`: Grant call not found
- `409 Conflict`: Duplicate application for this grant

---

### `GET /applications/{id}`
**Description:** Get application details.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL Parameters:**
- `id`: Application ID

**Response:** Full application object (same structure as in POST response).

**Status Codes:**
- `200 OK`: Success
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to view this application
- `404 Not Found`: Application not found

---

### `PUT /applications/{id}/status`
**Description:** Update application status (unified endpoint).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL Parameters:**
- `id`: Application ID

**Request Body:**
```json
{
  "status": "submitted",
  "comments": "Application resubmitted by researcher"
}
```

**Response:** Updated application object.

**Status Codes:**
- `200 OK`: Status updated successfully
- `400 Bad Request`: Invalid status or transition
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to update this application
- `404 Not Found`: Application not found

---

### `PUT /applications/{id}/withdraw`
**Description:** Withdraw application (researcher only).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL Parameters:**
- `id`: Application ID

**Response:**
```json
{
  "id": "application_id",
  "status": "withdrawn",
  "updatedAt": "2024-07-22T14:25:30Z",
  "...": "other application fields"
}
```

**Status Codes:**
- `200 OK`: Application withdrawn successfully
- `400 Bad Request`: Cannot withdraw in current status or after deadline
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not your application
- `404 Not Found`: Application not found

---

### `PUT /applications/{id}/resubmit`
**Description:** Resubmit application after revision.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL Parameters:**
- `id`: Application ID

**Request Body:**
```json
{
  "status": "submitted",
  "comments": "Resubmitting after revision"
}
```

**Response:**
```json
{
  "id": "application_id",
  "status": "submitted",
  "revisionCount": 1,
  "submissionDate": "2024-07-22T14:25:30Z",
  "originalSubmissionDate": "2024-07-15T10:30:00Z",
  "reviewComments": "Resubmitting after revision",
  "updatedAt": "2024-07-22T14:25:30Z",
  "...": "other application fields"
}
```

**Status Codes:**
- `200 OK`: Application resubmitted successfully
- `400 Bad Request`: Cannot resubmit in current status
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not your application
- `404 Not Found`: Application not found

---

### `PUT /applications/{id}`
**Description:** Update application (proposal, revision, etc).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL Parameters:**
- `id`: Application ID

**Request Body:**
```json
{
  "proposalTitle": "Updated Title",
  "status": "submitted",
  "revisionNote": {
    "revisionNumber": 1,
    "notes": "Addressed reviewer comments",
    "submittedAt": "2024-07-20T15:30:00Z"
  },
  "proposalFileName": "updated-proposal.pdf",
  "proposalFileData": "base64_encoded_file_data",
  "proposalFileSize": 2156000,
  "proposalFileType": "application/pdf"
}
```

**Response:** Complete updated application object.

**Status Codes:**
- `200 OK`: Application updated successfully
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to update this application
- `404 Not Found`: Application not found

---

### `POST /applications/{id}/reviews`
**Description:** Submit review for application.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL Parameters:**
- `id`: Application ID

**Request Body:**
```json
{
  "reviewerName": "Dr. Reviewer",
  "reviewerEmail": "reviewer@grants.edu",
  "comments": "Strong technical approach with clear objectives",
  "status": "approved"
}
```

**Response:**
```json
{
  "message": "Review submitted successfully",
  "review": {
    "id": "review_id",
    "reviewerName": "Dr. Reviewer",
    "reviewerEmail": "reviewer@grants.edu",
    "comments": "Strong technical approach with clear objectives",
    "submittedAt": "2024-07-22T14:25:30Z",
    "status": "approved"
  }
}
```

**Status Codes:**
- `201 Created`: Review submitted successfully
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to review this application
- `404 Not Found`: Application not found
- `409 Conflict`: Already reviewed by this reviewer

---

### `POST /applications/{id}/signoff/initiate`
**Description:** Initiate sign-off workflow (Grants Manager).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL Parameters:**
- `id`: Application ID

**Request Body:**
```json
{
  "award_amount": 500000,
  "approvers": [
    { "role": "DORI", "email": "dori@grants.edu", "name": "Dr. DORI Manager" },
    { "role": "DVC", "email": "dvc@grants.edu", "name": "Prof. DVC Leader" }
  ]
}
```

**Response:**
```json
{
  "message": "Sign-off workflow initiated successfully",
  "sign_off_tokens": [
    { "role": "DORI", "token": "dori_token_123", "email": "dori@grants.edu" },
    { "role": "DVC", "token": "dvc_token_456", "email": "dvc@grants.edu" }
  ]
}
```

**Status Codes:**
- `200 OK`: Sign-off workflow initiated successfully
- `400 Bad Request`: Invalid input data or application not in manager_approved status
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not a Grants Manager
- `404 Not Found`: Application not found

---

### `GET /applications/signoff/{token}`
**Description:** Get application and approval details by sign-off token.

**URL Parameters:**
- `token`: Sign-off token

**Response:**
```json
{
  "application": {
    "id": "application_id",
    "applicantName": "Dr. Sarah Johnson",
    "proposalTitle": "AI-Powered Climate Change Prediction Models",
    "...": "other application fields"
  },
  "approval": {
    "role": "DORI",
    "email": "dori@grants.edu",
    "name": "Dr. DORI Manager",
    "approverName": "Dr. DORI Manager",
    "token": "dori_token_123",
    "status": "pending",
    "created_at": "2024-07-21T10:30:00Z"
  }
}
```

**Status Codes:**
- `200 OK`: Success
- `404 Not Found`: Invalid or expired token

---

### `POST /applications/signoff/{token}`
**Description:** Submit sign-off approval/rejection.

**URL Parameters:**
- `token`: Sign-off token

**Request Body:**
```json
{
  "decision": "approved",
  "comments": "Looks good",
  "approver_name": "Dr. DORI Manager"
}
```

**Response:**
```json
{
  "message": "Sign-off approval submitted successfully",
  "application": {
    "id": "application_id",
    "applicantName": "Dr. Sarah Johnson",
    "status": "awaiting_signoff",
    "signoff_workflow": {
      "status": "pending",
      "approvals": [
        {
          "role": "DORI",
          "status": "approved",
          "approver_name": "Dr. DORI Manager",
          "comments": "Looks good",
          "approved_at": "2024-07-22T14:25:30Z",
          "...": "other approval fields"
        },
        {
          "role": "DVC",
          "status": "pending",
          "...": "other approval fields"
        }
      ]
    },
    "...": "other application fields"
  }
}
```

**Status Codes:**
- `200 OK`: Sign-off approval submitted successfully
- `400 Bad Request`: Invalid input data
- `404 Not Found`: Invalid or expired token
- `409 Conflict`: Already approved or rejected

---

### `GET /applications/{id}/signoff/status`
**Description:** Get sign-off status for an application.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL Parameters:**
- `id`: Application ID

**Response:**
```json
{
  "current_status": "pending",
  "completed_approvals": 1,
  "total_approvals": 2
}
```

**Status Codes:**
- `200 OK`: Success
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to view this application
- `404 Not Found`: Application not found

---

## Projects

### `POST /projects/`
**Description:** Create new project (Grants Manager).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "application_id": "app_001",
  "title": "AI Climate Prediction Implementation",
  "start_date": "2024-08-01T00:00:00Z",
  "end_date": "2025-07-31T23:59:59Z"
}
```

**Response:**
```json
{
  "id": "proj_001",
  "message": "Project created successfully",
  "application_id": "app_001",
  "title": "AI Climate Prediction Implementation",
  "status": "active",
  "start_date": "2024-08-01T00:00:00Z",
  "end_date": "2025-07-31T23:59:59Z",
  "created_at": "2024-07-22T14:25:30Z"
}
```

**Status Codes:**
- `201 Created`: Project created successfully
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not a Grants Manager
- `404 Not Found`: Application not found
- `409 Conflict`: Project already exists for this application

---

### `GET /projects/`
**Description:** List projects (filtered by user role).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
[
  {
    "id": "proj_001",
    "applicationId": "app_001",
    "title": "AI Climate Prediction Implementation",
    "status": "active",
    "startDate": "2024-08-01T00:00:00Z",
    "endDate": "2025-07-31T23:59:59Z",
    "milestones": [
      {
        "id": "milestone_001",
        "title": "Data Collection Phase",
        "dueDate": "2024-10-31T23:59:59Z",
        "status": "in_progress",
        "description": "Collect and prepare climate data",
        "progressReportUploaded": true,
        "progressReportDate": "2024-09-15T10:00:00Z",
        "progressReportFilename": "data_collection_report.pdf",
        "isOverdue": false
      }
    ],
    "requisitions": [
      {
        "id": "req_001",
        "milestoneId": "milestone_001",
        "amount": 50000,
        "requestedDate": "2024-08-15T00:00:00Z",
        "status": "approved",
        "notes": "Equipment purchase",
        "reviewedBy": "manager@grants.edu",
        "reviewedDate": "2024-08-16T00:00:00Z",
        "reviewNotes": "Approved as requested"
      }
    ],
    "partners": [
      {
        "id": "partner_001",
        "name": "Climate Research Institute",
        "role": "Data Provider",
        "mouFilename": "climate_research_mou.pdf",
        "uploadedDate": "2024-08-05T10:00:00Z"
      }
    ],
    "createdAt": "2024-08-01T00:00:00Z",
    "updatedAt": "2024-08-16T00:00:00Z"
  }
]
```

**Status Codes:**
- `200 OK`: Success
- `401 Unauthorized`: Not authenticated

---

### `GET /projects/{id}`
**Description:** Get project details.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL Parameters:**
- `id`: Project ID

**Response:** Detailed project object with all related data (same structure as in GET /projects/).

**Status Codes:**
- `200 OK`: Success
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to view this project
- `404 Not Found`: Project not found

---

### `PATCH /projects/{id}/status`
**Description:** Update project status (Grants Manager).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL Parameters:**
- `id`: Project ID

**Request Body:**
```json
{
  "status": "completed"
}
```

**Response:**
```json
{
  "message": "Project status updated successfully",
  "id": "proj_001",
  "status": "completed",
  "updatedAt": "2024-07-22T14:25:30Z"
}
```

**Status Codes:**
- `200 OK`: Status updated successfully
- `400 Bad Request`: Invalid status
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not a Grants Manager
- `404 Not Found`: Project not found

---

### `POST /projects/{id}/milestones`
**Description:** Add milestone to project.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL Parameters:**
- `id`: Project ID

**Request Body:**
```json
{
  "title": "Data Collection Phase",
  "due_date": "2024-10-31T23:59:59Z",
  "description": "Collect and prepare climate data"
}
```

**Response:**
```json
{
  "message": "Milestone added successfully",
  "milestone": {
    "id": "milestone_id",
    "title": "Data Collection Phase",
    "dueDate": "2024-10-31T23:59:59Z",
    "status": "pending",
    "description": "Collect and prepare climate data",
    "progressReportUploaded": false,
    "isOverdue": false
  }
}
```

**Status Codes:**
- `201 Created`: Milestone added successfully
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to modify this project
- `404 Not Found`: Project not found

---

### `POST /projects/{id}/requisitions`
**Description:** Submit fund requisition.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL Parameters:**
- `id`: Project ID

**Request Body:**
```json
{
  "milestone_id": "milestone_001",
  "amount": 10000,
  "notes": "Funds needed for equipment"
}
```

**Response:**
```json
{
  "message": "Requisition submitted successfully",
  "requisition": {
    "id": "req_id",
    "milestoneId": "milestone_001",
    "amount": 10000,
    "requestedDate": "2024-07-22T14:25:30Z",
    "status": "submitted",
    "notes": "Funds needed for equipment"
  }
}
```

**Status Codes:**
- `201 Created`: Requisition submitted successfully
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to submit requisition
- `404 Not Found`: Project or milestone not found

---

### `POST /projects/{id}/partners`
**Description:** Add partner to project.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL Parameters:**
- `id`: Project ID

**Request Body:**
```json
{
  "name": "Partner Organization",
  "role": "Technology Provider"
}
```

**Response:**
```json
{
  "message": "Partner added successfully",
  "partner": {
    "id": "partner_id",
    "name": "Partner Organization",
    "role": "Technology Provider"
  }
}
```

**Status Codes:**
- `201 Created`: Partner added successfully
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to modify this project
- `404 Not Found`: Project not found

---

### `POST /projects/{id}/milestones/{milestone_id}/progress-report`
**Description:** Upload progress report for milestone.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL Parameters:**
- `id`: Project ID
- `milestone_id`: Milestone ID

**Request:** Multipart/form-data with file.

**Response:**
```json
{
  "message": "Progress report uploaded successfully",
  "filename": "progress_report_2024-07-22.pdf",
  "milestone": {
    "id": "milestone_id",
    "progressReportUploaded": true,
    "progressReportDate": "2024-07-22T14:25:30Z",
    "progressReportFilename": "progress_report_2024-07-22.pdf"
  }
}
```

**Status Codes:**
- `200 OK`: Report uploaded successfully
- `400 Bad Request`: Invalid file format or missing file
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to modify this project
- `404 Not Found`: Project or milestone not found

---

### `POST /projects/{id}/final-report/{report_type}`
**Description:** Upload final report (narrative or financial).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL Parameters:**
- `id`: Project ID
- `report_type`: "narrative" or "financial"

**Request:** Multipart/form-data with file.

**Response:**
```json
{
  "message": "Narrative report uploaded successfully",
  "filename": "final_narrative_report.pdf",
  "uploadDate": "2024-07-22T14:25:30Z",
  "report_type": "narrative"
}
```

**Status Codes:**
- `200 OK`: Report uploaded successfully
- `400 Bad Request`: Invalid file format, missing file, or invalid report type
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to modify this project
- `404 Not Found`: Project not found

---

### `POST /projects/{id}/initiate-vc-signoff`
**Description:** Initiate VC sign-off process.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL Parameters:**
- `id`: Project ID

**Response:**
```json
{
  "message": "VC sign-off initiated",
  "token": "vc_proj_001_abcdef123456",
  "email": "vc@university.edu"
}
```

**Status Codes:**
- `200 OK`: Sign-off initiated successfully
- `400 Bad Request`: Project not ready for sign-off
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not a Grants Manager
- `404 Not Found`: Project not found
- `409 Conflict`: Sign-off already initiated

---

### `GET /projects/vc-signoff/{token}`
**Description:** Get project by VC sign-off token.

**URL Parameters:**
- `token`: VC sign-off token

**Response:** Project object with closure workflow details.

**Status Codes:**
- `200 OK`: Success
- `404 Not Found`: Invalid or expired token

---

### `POST /projects/vc-signoff/{token}/submit`
**Description:** Submit VC sign-off decision.

**URL Parameters:**
- `token`: VC sign-off token

**Request Body:**
```json
{
  "decision": "approved",
  "notes": "Approved for closure",
  "vc_name": "Prof. VC Name"
}
```

**Response:**
```json
{
  "message": "VC sign-off submitted successfully",
  "status": "signed_off",
  "project": {
    "id": "proj_001",
    "status": "closed",
    "closure_workflow": {
      "status": "signed_off",
      "vcSignedBy": "Prof. VC Name",
      "vcSignedDate": "2024-07-22T14:25:30Z",
      "vcNotes": "Approved for closure"
    }
  }
}
```

**Status Codes:**
- `200 OK`: Sign-off submitted successfully
- `400 Bad Request`: Invalid input data
- `404 Not Found`: Invalid or expired token
- `409 Conflict`: Already signed off

---

### `PUT /projects/{id}/milestones/{milestone_id}`
**Description:** Update milestone.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL Parameters:**
- `id`: Project ID
- `milestone_id`: Milestone ID

**Request Body:**
```json
{
  "status": "completed",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "message": "Milestone updated successfully",
  "milestone": {
    "id": "milestone_id",
    "title": "Data Collection Phase",
    "status": "completed",
    "description": "Updated description",
    "dueDate": "2024-10-31T23:59:59Z",
    "updatedAt": "2024-07-22T14:25:30Z"
  }
}
```

**Status Codes:**
- `200 OK`: Milestone updated successfully
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to modify this project
- `404 Not Found`: Project or milestone not found

---

### `DELETE /projects/{id}/partners/{partner_id}`
**Description:** Remove partner from project.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL Parameters:**
- `id`: Project ID
- `partner_id`: Partner ID

**Response:**
```json
{
  "message": "Partner removed successfully",
  "id": "partner_id"
}
```

**Status Codes:**
- `200 OK`: Partner removed successfully
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to modify this project
- `404 Not Found`: Project or partner not found

---

### `PATCH /projects/{id}/requisitions/{requisition_id}/status`
**Description:** Update requisition status.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL Parameters:**
- `id`: Project ID
- `requisition_id`: Requisition ID

**Request Body:**
```json
{
  "status": "approved",
  "review_notes": "Approved for payment",
  "reviewed_by": "manager@grants.edu"
}
```

**Response:**
```json
{
  "message": "Requisition approved successfully",
  "requisition": {
    "id": "requisition_id",
    "status": "approved",
    "reviewNotes": "Approved for payment",
    "reviewedBy": "manager@grants.edu",
    "reviewedDate": "2024-07-22T14:25:30Z"
  }
}
```

**Status Codes:**
- `200 OK`: Requisition status updated successfully
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to approve requisitions
- `404 Not Found`: Project or requisition not found

---

## Documents

### `POST /documents/upload`
**Description:** Upload a new document with version control.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request:** Multipart/form-data with fields:
- `name`: string (document title)
- `folder`: string ("Applications", "Projects", "Awards", "Reports")
- `file`: file (the document to upload)
- `notes`: string (optional description)

**Response:**
```json
{
  "id": "doc_001",
  "message": "Document uploaded successfully",
  "filename": "timestamp_filename.pdf",
  "size": "2.0 MB"
}
```

**Status Codes:**
- `201 Created`: Document uploaded successfully
- `400 Bad Request`: Invalid input data or file type
- `401 Unauthorized`: Not authenticated
- `413 Request Entity Too Large`: File too large

---

### `GET /documents/`
**Description:** List documents (optionally filter by folder or search).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `folder`: string (optional) - Filter by document folder
- `search`: string (optional) - Search by name, content, or tags

**Response:**
```json
[
  {
    "id": "doc_001",
    "name": "Research Proposal",
    "folder": "Applications",
    "current_version": 1,
    "versions": [
      {
        "id": "doc_001_v1",
        "versionNumber": 1,
        "fileName": "timestamp_proposal.pdf",
        "uploadedBy": "researcher@grants.edu",
        "uploadedAt": "2024-07-15T10:30:00Z",
        "fileSize": "2.0 MB",
        "notes": "Initial upload"
      }
    ],
    "created_by": "researcher@grants.edu",
    "created_at": "2024-07-15T10:30:00Z",
    "last_modified": "2024-07-15T10:30:00Z",
    "tags": ["proposal", "ai", "climate"]
  }
]
```

**Status Codes:**
- `200 OK`: Success
- `401 Unauthorized`: Not authenticated

---

### `GET /documents/{id}/download`
**Description:** Download document file (latest version).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL Parameters:**
- `id`: Document ID

**Response:** File download (Content-Disposition header set).

**Status Codes:**
- `200 OK`: Success
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to download this document
- `404 Not Found`: Document or file not found

---

### `POST /documents/{id}/upload-version`
**Description:** Upload new version of an existing document.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL Parameters:**
- `id`: Document ID

**Request:** Multipart/form-data with:
- `file`: file (the new version)
- `notes`: string (optional description of changes)

**Response:**
```json
{
  "message": "New version uploaded successfully",
  "filename": "timestamp_proposal_v2.pdf",
  "size": "2.2 MB",
  "version": 2
}
```

**Status Codes:**
- `200 OK`: New version uploaded successfully
- `400 Bad Request`: Invalid input data or file type
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized to modify this document
- `404 Not Found`: Document not found
- `413 Request Entity Too Large`: File too large

---

### `GET /documents/stats`
**Description:** Get document statistics.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "total": 10,
  "Applications": 3,
  "Projects": 4,
  "Awards": 2,
  "Reports": 1,
  "by_type": {
    "pdf": 7,
    "docx": 2,
    "txt": 1
  },
  "by_user": {
    "researcher@grants.edu": 4,
    "manager@grants.edu": 6
  }
}
```

**Status Codes:**
- `200 OK`: Success
- `401 Unauthorized`: Not authenticated

---

## Admin

### `POST /admin/reset-database`
**Description:** Reset the database to initial state (Admin only).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "message": "Database reset successfully",
  "details": {
    "users_deleted": 3,
    "applications_deleted": 2,
    "projects_deleted": 1,
    "documents_deleted": 5,
    "grant_calls_deleted": 6
  }
}
```

**Status Codes:**
- `200 OK`: Database reset successfully
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not an admin

---

## Services Overview

### Authentication Service
- Handles login, JWT token generation, user info retrieval
- Implements token-based authentication with secure JWT
- Manages session expiration and token refresh
- Prevents brute force attacks with rate limiting

### User Service
- CRUD operations for users
- Role management (Researcher, Grants Manager, Admin)
- Password hashing with bcrypt for secure storage
- User profile management

### Grant Call Service
- CRUD for grant calls
- Filtering by type, status, visibility
- Deadline management and status toggling
- Support for different grant types and visibility settings

### Application Service
- CRUD for grant applications
- Review management and workflow
- Sign-off process with multi-level approvals
- Status transitions and revision history
- Document uploads and version tracking
- Award letter generation

### Project Service
- CRUD for funded projects
- Milestone tracking with progress reports
- Requisition management with approval workflow
- Partner management and final reporting
- VC sign-off and closure workflow
- Budget tracking and document management

### Document Service
- Document upload with version control
- Document categorization by folders
- Search functionality
- Statistics and metrics
- Access control based on user roles
- Support for different file types and sizes

### Admin Service
- Database reset and sample data generation
- System configuration and maintenance
- Audit logging
- System health monitoring

---

## Notes

- All endpoints require authentication except `/auth/login`
- Role-based access control is enforced (Researcher, Grants Manager, Admin)
- All date/time fields are ISO8601 strings (format: YYYY-MM-DDTHH:MM:SSZ)
- File uploads use multipart/form-data
- Error responses follow FastAPI conventions:
  ```json
  { "detail": "Error message" }
  ```
- Detailed error responses include:
  ```json
  {
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Validation failed",
      "details": "Please check the provided data"
    },
    "timestamp": "2024-07-22T14:25:30Z",
    "request_id": "request_tracking_id"
  }
  ```

---

For further details, see the FastAPI OpenAPI docs at `/docs` when the backend is running.
