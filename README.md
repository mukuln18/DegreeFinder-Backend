# DegreeFinder Backend (College Platform)

Backend API for the DegreeFinder Platform.
Provides authentication, college management, filtering, comparison, and image uploads.

---

## Features

### Authentication

* User registration
* Login with JWT
* Role-based access (Admin / User)

### College Management (Admin)

* Create college
* Update college
* Delete college
* Draft / publish status
* Image upload via Cloudinary

### Public APIs

* Get colleges
* Pagination
* Search
* Filtering
* Sorting
* College comparison

### Performance & Security

* Database indexing
* Input validation

---

## Tech Stack

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* Cloudinary
* JWT Authentication
* Multer

---

## Folder Structure

```
src/
 ├── controllers
 ├── routes
 ├── models
 ├── middleware
 ├── config
 ├── utils
 ├── app.js
 └── server.js
```

---

## Environment Variables

Create a `.env` file:

```
PORT=5000
MONGO_URI=your_mongo_uri
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

---

## Installation & Running

```
npm install
npm run dev
```

Server runs at:
http://localhost:5000

---

## API Endpoints

### Auth

POST `/api/auth/register`
POST `/api/auth/login`

### Colleges

GET `/api/colleges`
POST `/api/colleges` (Admin)
PUT `/api/colleges/:id` (Admin)
DELETE `/api/colleges/:id` (Admin)

### Compare

GET `/api/colleges/compare?ids=id1,id2`

---

## Deployment

Backend deployed at:
https://degreefinder-backend.onrender.com

---

## Author

Mukul
GitHub: https://github.com/mukuln18
