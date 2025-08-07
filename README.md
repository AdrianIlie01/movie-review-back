# 🎬 Movie Review – Backend API (NestJS)

This is the **backend API** for the [Movie Review](https://movie-review-front.onrender.com/home) platform — a full-stack movie discovery and review application. The backend is built with **NestJS** and provides secure user authentication, movie & cast management, and admin features via RESTful APIs.

---

## 🧰 Tech Stack

- **Framework:** [NestJS](https://nestjs.com/) (Node.js)
- **Authentication:** Two-Factor Authentication (2FA)
- **Database:** MySQL, Firebase (for comments and reviews storage)
- **API:** REST (with role-based access control)
- **Cloudinary:** Image hosting & delivery
- **YouTube API:** Embedded trailers
  
 ---

## 🔐 Main Backend Features

- Register/Login with secure JWT
- Two-Factor Authentication via email (Firebase)
- Password reset and session validation
- Role-based access control (`user`, `moderator`, `admin`)
- Admin dashboard functionality:
  - Movie management:
    - Create/edit movies
    - Assign cast
  - Cast management:
    - Add/edit cast members
    - Assign movies & roles
  - User Management:
    - Ban/unban users
    - Role assignment
- RESTful API structure
- CORS configured for frontend communication
  
---

## 🌐 Live Demo (Frontend)

You can try the full application frontend here:  
🔗 [Movie Review Frontend Live](https://movie-review-front.onrender.com/home)
