# StyleHub – Smart Clothing Shop Management System
## Assignment Report & Architecture Documentation

### Project Summary
StyleHub is an end-to-end MERN (MongoDB, Express.js, React.js, Node.js) web platform developed for modern clothing shop management. It seamlessly connects customer e-commerce shopping with administrative management workflows.

---

### Epic 1 Implementation: Customer Management
- **Authentication**: JWT token generation and authorization headers.
- **Password Security**: Bcryptjs salt hashing with pre-save model hooks.
- **User Roles**: Role-Based Access Control (RBAC) supporting `customer`, `staff`, and `admin` roles.
- **User Management Pages**:
  - `Login.js`: Secure sign-in with instant demo credential switchers.
  - `Register.js`: Account creation with validation and role selector.
  - `UserProfile.js`: User settings dashboard with avatar, account information, saved addresses, and order history.
  - `AddressManager.js`: Interactive shipping address manager (Add, Edit, Delete default address).
  - `CustomerList.js`: Admin customer directory table with search, role badges, and registration details.

---

### API Endpoint Reference (Epic 1)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create new account & return JWT |
| POST | `/api/auth/login` | Public | Authenticate credentials & return JWT |
| GET | `/api/auth/profile` | Private | Fetch logged-in user profile |
| PUT | `/api/auth/profile` | Private | Update user profile info |
| POST | `/api/auth/addresses` | Private | Add new shipping address |
| GET | `/api/auth/customers` | Private (Admin/Staff) | List all registered customers |

---

### Directory Layout Verification
The codebase adheres strictly to the requested folder layout:
```
Smart Clothing Shop Management System/
│── 📄 server.js
│── 📄 package.json
│── 📄 .env
│── 📄 .gitignore
├── 📁 client/
│   ├── 📁 public/
│   └── 📁 src/
│       ├── 📄 App.js
│       ├── 📄 App.css
│       ├── 📄 index.js
│       ├── 📄 index.css
│       ├── 📁 api/
│       ├── 📁 components/
│       ├── 📁 context/
│       ├── 📁 pages/
│       └── 📁 epics/
│           ├── 📁 E1_CustomerManagement/
│           ├── 📁 E2_ProductAndInventory/
│           ├── 📁 E3_ShoppingAndOrders/
│           └── 📁 E4_AdminAndReports/
├── 📁 config/
├── 📁 models/
├── 📁 controllers/
├── 📁 routes/
├── 📁 middleware/
├── 📁 seed/
├── 📁 docs/
├── 📁 epics/
├── 📁 img/
└── 📁 uploads/
```
