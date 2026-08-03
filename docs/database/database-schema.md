# Firestore Database Schema

## Collections

### 1. `users` (Students)
* **Document ID:** Firebase Auth User UID
* **Fields:**
  | Field Name | Type | Description |
  |------------|------|-------------|
  | `uid` | String | Firebase Authentication UID |
  | `email` | String | Student email address |
  | `displayName` | String | Full student name |
  | `phone` | String | Phone number |
  | `college` | String | Academic college |
  | `department` | String | Academic department |
  | `year` | Number | Year of study (1-4) |
  | `rollNumber` | String | College ID/roll number |
  | `profileImageUrl` | String | URL of profile picture |
  | `createdAt` | Timestamp | Account creation time |
  | `updatedAt` | Timestamp | Last update time |

### 2. `events`
* **Document ID:** Auto-generated UUID
* **Fields:**
  | Field Name | Type | Description |
  |------------|------|-------------|
  | `title` | String | Event Title |
  | `description` | String | Long text description |
  | `category` | String | technical \| cultural \| sports \| workshop |
  | `date` | Timestamp | Chronological event date and start time |
  | `time` | String | Display time string (e.g. 10 AM - 1 PM) |
  | `venue` | String | Event venue location |
  | `maxParticipants` | Number | Maximum slots (0 = unlimited) |
  | `currentRegistrations` | Number | Registered student counter |
  | `registrationDeadline` | Timestamp | Cut-off timestamp |
  | `eventHeadId` | String | Associated event head doc ID |
  | `imageUrl` | String | Event graphic banner URL |
  | `isActive` | Boolean | Active flag |

### 3. `registrations`
* **Document ID:** Auto-generated UUID
* **Fields:**
  | Field Name | Type | Description |
  |------------|------|-------------|
  | `userId` | String | Reference to user UID |
  | `eventId` | String | Reference to event doc ID |
  | `userName` | String | Student display name (denormalized) |
  | `eventTitle` | String | Event title (denormalized) |
  | `status` | String | registered \| attended \| cancelled |
  | `registeredAt` | Timestamp | Creation timestamp |
