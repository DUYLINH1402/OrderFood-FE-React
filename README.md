FoodieExpress – End-to-End Online Food Ordering System
📌 Overview
FoodieExpress is a robust, enterprise-grade food ordering platform built with Java Spring Boot. The system features a multi-role architecture (User, Staff, Admin) designed to streamline the entire process from customer ordering to kitchen management and administrative oversight.

The project emphasizes security, real-time communication, and seamless third-party integrations to provide a production-ready experience.

🛠 Tech Stack
Backend: Java 17, Spring Boot, Spring Security (JWT), WebSocket.

Database: PostgreSQL (AWS RDS).

Cloud & Storage: AWS EC2 (Deployment), AWS S3 (Image Hosting).

Frontend: React/Next.js (Deployed on Firebase with Custom Domain).

Third-party Services: \* ZaloPay: Payment Gateway Integration.

OpenAI: AI-powered Customer Support Chatbot.

Brevo: Automated Transactional Emails.

🚀 Key Features

1. Multi-Role Management (RBAC)
   User: Browse menus, place orders, track status, and chat with support.

Staff: Real-time order confirmation, inventory management (mark items as out-of-stock).

Admin: Complete system control via a secure dashboard (Hidden/Protected Entry).

2. Advanced Integrations
   Payment Processing: Full integration with ZaloPay for secure digital transactions.

AI Assistant: Integrated OpenAI API to provide instant culinary suggestions and support.

Real-time Communication: Powered by WebSockets for instant order notifications and live chat between Users and Staff.

Automated Communication: Brevo integration for registration welcomes, order receipts, and secure password reset links.

3. Database & Security
   Audit Logging: Database schema includes created_at, updated_at, and user tracking fields.

Data Integrity: Implemented Soft Delete logic (is_deleted) to ensure data persistence and history tracking.

Authentication: Secure JWT-based authentication with role-based access control.

☁️ Infrastructure
Backend Deployment: Hosted on AWS EC2 with a professional custom domain.

Cloud Storage: AWS S3 utilized for high-availability image storage.

Database Hosting: AWS RDS (PostgreSQL) for managed, scalable data storage.

📸 Database Schema
The system utilizes a structured relational schema designed for scalability, including comprehensive metadata for every record:

id: Bigserial Primary Key.

is_deleted: Boolean flag for safe data removal.

Audit Fields: Tracking who and when each project/order was modified.
