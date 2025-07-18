# San2Stic API Documentation

## Base URL
```
https://api.san2stic.com/api
```

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Rate Limiting
- General endpoints: 100 requests per 15 minutes per IP
- Authentication endpoints: 5 requests per 15 minutes per IP  
- Upload endpoints: 10 requests per hour per IP

## Endpoints

### Authentication

#### POST /auth/signup
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "username": "optional_username",
  "walletAddress": "0x1234567890123456789012345678901234567890"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "optional_username",
    "role": "user"
  },
  "token": "jwt_token"
}
```

#### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "role": "user",
    "reputation": 100
  },
  "token": "jwt_token"
}
```

### Recordings

#### GET /recordings
Fetch all approved recordings with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50, max: 100)
- `status` (optional): Moderation status (default: 'APPROVED')

**Response:**
```json
{
  "recordings": [
    {
      "id": "uuid",
      "title": "Forest Ambience",
      "description": "Peaceful forest sounds",
      "artist": "Nature Recorder",
      "latitude": 48.8566,
      "longitude": 2.3522,
      "audioUrl": "https://storage.googleapis.com/...",
      "duration": 180,
      "quality": "HIGH",
      "license": "CC_BY",
      "tags": ["nature", "forest", "ambient"],
      "upvotes": 15,
      "downvotes": 2,
      "totalRating": 45,
      "ratingCount": 10,
      "User": {
        "id": "uuid",
        "username": "recorder123",
        "reputation": 150
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "totalCount": 150,
  "currentPage": 1,
  "totalPages": 3
}
```

#### GET /recordings/location
Fetch recordings within a geographic bounding box.

**Query Parameters:**
- `minLat`: Minimum latitude
- `maxLat`: Maximum latitude  
- `minLng`: Minimum longitude
- `maxLng`: Maximum longitude
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Response:** Same format as GET /recordings

#### POST /recordings
Create a new recording (requires authentication).

**Request:** Multipart form data
- `audioFile`: Audio file (required)
- `title`: Recording title (required, max 100 chars)
- `description`: Description (optional, max 500 chars)
- `artist`: Artist name (required)
- `latitude`: Latitude coordinate (required, -90 to 90)
- `longitude`: Longitude coordinate (required, -180 to 180)
- `tags`: JSON array of tags (optional, max 10 tags)
- `equipment`: Equipment used (optional, max 100 chars)
- `license`: License type (optional, default: 'ALL_RIGHTS_RESERVED')

**Response:**
```json
{
  "id": "uuid",
  "title": "New Recording",
  "message": "Recording created successfully",
  // ... other recording fields
}
```

#### GET /recordings/user
Fetch current user's recordings (requires authentication).

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:** Same format as GET /recordings

#### PUT /recordings/:id
Update a recording (requires authentication, only pending recordings).

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "tags": ["updated", "tags"]
}
```

**Response:**
```json
{
  "id": "uuid",
  "message": "Recording updated successfully",
  // ... updated recording fields
}
```

#### DELETE /recordings/:id
Soft delete a recording (requires authentication).

**Response:**
```json
{
  "message": "Recording deleted successfully"
}
```

## Error Responses

All error responses follow this format:
```json
{
  "error": "Error message",
  "details": ["Additional error details if applicable"]
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

## Data Types

### License Types
- `ALL_RIGHTS_RESERVED`: Traditional copyright
- `CC_BY`: Creative Commons Attribution 4.0
- `CC_BY_SA`: Creative Commons Attribution-ShareAlike 4.0
- `CC_BY_NC`: Creative Commons Attribution-NonCommercial 4.0
- `CC_BY_NC_SA`: Creative Commons Attribution-NonCommercial-ShareAlike 4.0
- `CC_BY_ND`: Creative Commons Attribution-NoDerivatives 4.0
- `CC_BY_NC_ND`: Creative Commons Attribution-NonCommercial-NoDerivatives 4.0
- `PUBLIC_DOMAIN`: Public Domain (CC0)

### Quality Types
- `LOW`: Low quality audio
- `MEDIUM`: Medium quality audio
- `HIGH`: High quality audio
- `LOSSLESS`: Lossless audio

### Moderation Status
- `PENDING`: Awaiting moderation
- `APPROVED`: Approved for public viewing
- `REJECTED`: Rejected by moderators
- `FLAGGED`: Flagged for review

### User Roles
- `user`: Regular user
- `moderator`: Can moderate content
- `admin`: Full administrative access
