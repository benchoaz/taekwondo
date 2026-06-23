# Taekwondo Academy API Documentation

REST API built with Next.js 15 App Router. Base path: `/api`.

## 1. Authentication
Endpoints for user session management.

### Login
* **URL**: `/api/auth/login`
* **Method**: `POST`
* **Request Body**:
  ```json
  {
    "email": "member.beni@taekwondo.com",
    "password": "password123"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": { "id": "uuid", "email": "member.beni@taekwondo.com", "role": "MEMBER" }
  }
  ```

---

## 2. UKT Exams
Manage grading exams.

### Get Upcoming UKT Sessions
* **URL**: `/api/ukt`
* **Method**: `GET`
* **Success Response (200 OK)**:
  ```json
  [
    {
      "id": "uuid",
      "title": "Ujian Kenaikan Tingkat (UKT) Semester I 2026",
      "date": "2026-07-15T09:00:00.000Z",
      "location": "Dojang Pusat Taekwondo Academy, Jakarta",
      "status": "UPCOMING"
    }
  ]
  ```

### Register for UKT Exam
* **URL**: `/api/ukt/register`
* **Method**: `POST`
* **Request Body**:
  ```json
  {
    "uktExamId": "uuid-of-exam",
    "memberId": "uuid-of-member",
    "targetBelt": "Sabuk Merah (2 Geup)",
    "permissionLetter": "https://supabase.co/storage/bucket/letter.jpg",
    "photoUrl": "https://supabase.co/storage/bucket/photo.jpg"
  }
  ```

---

## 3. Certificates & Verifications

### Verify Digital Certificate
* **URL**: `/api/verify-certificate/[id]`
* **Method**: `GET`
* **Success Response (200 OK)**:
  ```json
  {
    "isValid": true,
    "certNumber": "CERT-2025-0482",
    "fullName": "Beni Setiawan",
    "oldBelt": "Sabuk Hijau (6 Geup)",
    "newBelt": "Sabuk Biru (4 Geup)",
    "issueDate": "2025-05-10"
  }
  ```
