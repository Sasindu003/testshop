# Epic 1: Customer Management Specification

## Overview
Epic 1 encompasses end-to-end customer registration, authentication, role-based access control, profile management, shipping address management, and order history tracking within StyleHub - Smart Clothing Shop Management System.

## Key Features & User Stories
1. **Customer Registration & Login**:
   - Secure account registration with hashed passwords (bcrypt).
   - JWT authentication issuance for persistent sessions.
   - Quick role switcher demo modes (Admin, Staff, Customer).
2. **Profile & Account Settings**:
   - Manage personal info (Name, Email, Phone, Profile Avatar).
   - Address book (Add, edit, remove shipping addresses).
3. **Order History**:
   - Real-time customer order timeline, order items summary, tracking status.
4. **Role-Based Access Control**:
   - Role protection (`customer`, `staff`, `admin`).
   - Admin customer management list.

## Database Schema (User)
```json
{
  "name": "String",
  "email": "String (Unique)",
  "password": "Hashed String",
  "role": "customer | staff | admin",
  "phone": "String",
  "addresses": [
    {
      "street": "String",
      "city": "String",
      "state": "String",
      "zipCode": "String",
      "country": "String",
      "isDefault": "Boolean"
    }
  ]
}
```
