# API Reference - Tecnophite Portal

## Authentication

### Register Student
* **Endpoint:** `POST /api/v1/auth/register`
* **Request Body:**
  ```json
  {
    "email": "student@college.edu",
    "password": "securepassword",
    "display_name": "Student Name",
    "phone": "9876543210",
    "college": "XYZ College",
    "department": "CSE",
    "year": 3,
    "roll_number": "CS034"
  }
  ```
* **Response (201):**
  ```json
  {
    "success": true,
    "message": "Student registered successfully.",
    "data": {
      "uid": "firebase_uid",
      "email": "student@college.edu",
      "displayName": "Student Name",
      "role": "student"
    }
  }
  ```

### Verify Token
* **Endpoint:** `POST /api/v1/auth/verify-token`
* **Request Body:**
  ```json
  {
    "id_token": "firebase_jwt_id_token"
  }
  ```
* **Response (200):**
  ```json
  {
    "success": true,
    "message": "Success",
    "data": {
      "uid": "firebase_uid",
      "email": "student@college.edu",
      "displayName": "Student Name",
      "role": "student",
      "isAdmin": false
    }
  }
  ```

---

## Events

### List Active Events
* **Endpoint:** `GET /api/v1/events/?page=1&limit=20&active_only=true`
* **Headers:** `Authorization: Bearer <token>`
* **Response (200):**
  ```json
  {
    "success": true,
    "message": "Success",
    "data": {
      "events": [
        {
          "eventId": "event_doc_id",
          "title": "Coding Challenge",
          "category": "technical",
          "date": "2026-09-15T10:00:00",
          "venue": "Lab 3",
          "availableSpots": 45,
          "isActive": true
        }
      ],
      "total": 1,
      "page": 1,
      "limit": 20
    }
  }
  ```

---

## Registrations

### Register for Event
* **Endpoint:** `POST /api/v1/registrations/`
* **Headers:** `Authorization: Bearer <token>`
* **Request Body:**
  ```json
  {
    "event_id": "event_doc_id"
  }
  ```
* **Response (201):**
  ```json
  {
    "success": true,
    "message": "Successfully registered for the event.",
    "data": {
      "registrationId": "reg_doc_id",
      "eventId": "event_doc_id",
      "status": "registered"
    }
  }
  ```
