<div align="center">

# Food Order Frontend

### Online Food Ordering System - Frontend Application

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Redux](https://img.shields.io/badge/Redux_Toolkit-2.8-764ABC?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Hosting-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)


**Frontend Application** for online food ordering system with modern UI/UX, real-time features, and seamless user experience.

[Features](#1-features) •
[Technologies](#2-technologies) •
[Installation](#4-installation) •
[Project Structure](#3-project-structure) •
[Architecture](#5-system-architecture)

</div>

---

## 1. Features

<table>
<tr>
<td>

### Authentication & User

- JWT Authentication
- OAuth2 (Google, Facebook)
- Profile management
- Password reset via email
- Role-based UI (User/Staff/Admin)

</td>
<td>

### Food & Menu

- Browse food catalog
- Category filtering
- Algolia search integration
- Favorites management
- Food reviews & ratings

</td>
</tr>
<tr>
<td>

### Cart & Orders

- Real-time cart management
- Order placement & tracking
- Order history
- Coupon application
- Multiple payment methods

</td>
<td>

### Payment Integration

- ZaloPay integration
- Cash on Delivery (COD)
- Reward points system
- Transaction history

</td>
</tr>
<tr>
<td>

### Real-time Features

- WebSocket notifications
- Live chat support
- AI Chatbot assistant
- Order status updates

</td>
<td>

### Admin & Staff

- Dashboard analytics
- User management
- Order management
- Food/Menu CRUD
- Staff reports

</td>
</tr>
</table>

---

## 2. Technologies

<div align="center">

| Category             | Technologies                                                                                                                                                                                                                                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**        | ![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)                                                                                                                               |
| **State Management** | ![Redux](https://img.shields.io/badge/Redux_Toolkit-764ABC?style=flat-square&logo=redux&logoColor=white) ![Redux Persist](https://img.shields.io/badge/Redux_Persist-764ABC?style=flat-square&logo=redux&logoColor=white)                                                                                                    |
| **Styling**          | ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) ![MUI](https://img.shields.io/badge/MUI-007FFF?style=flat-square&logo=mui&logoColor=white) ![Ant Design](https://img.shields.io/badge/Ant_Design-0170FE?style=flat-square&logo=antdesign&logoColor=white) |
| **Authentication**   | ![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=json-web-tokens&logoColor=white) ![Google OAuth](https://img.shields.io/badge/Google_OAuth-4285F4?style=flat-square&logo=google&logoColor=white)                                                                                                       |
| **Real-time**        | ![WebSocket](https://img.shields.io/badge/WebSocket-010101?style=flat-square&logo=socket.io&logoColor=white) ![STOMP](https://img.shields.io/badge/STOMP-010101?style=flat-square&logo=socket.io&logoColor=white)                                                                                                            |
| **Animation**        | ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white) ![AOS](https://img.shields.io/badge/AOS-FF6B6B?style=flat-square&logoColor=white)                                                                                                                          |
| **Charts**           | ![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat-square&logo=chartdotjs&logoColor=white)                                                                                                                                                                                                                  |
| **Search**           | ![Algolia](https://img.shields.io/badge/Algolia-003DFF?style=flat-square&logo=algolia&logoColor=white)                                                                                                                                                                                                                       |
| **Deployment**       | ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)                                                                                                                                                                                                                    |

</div>

---

## 3. Project Structure

```
src/
├── assets/              # Images, icons, fonts, global styles
│   ├── fonts/
│   ├── icons/
│   ├── images/
│   └── styles/
├── components/          # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── Button/          # Button variants
│   ├── Chatbot/         # AI Chatbot components
│   ├── Comment/         # Comment system
│   ├── GuideModal/      # User guide modals
│   ├── LikeButton/      # Like functionality
│   ├── NavBar/          # Navigation bar
│   ├── Notification/    # Notification components
│   ├── ShareButton/     # Social sharing
│   ├── Sidebar/         # Sidebar navigation
│   ├── Skeleton/        # Loading skeletons
│   └── Support/         # Support chat components
├── constants/           # App constants
├── contexts/            # React contexts
├── hooks/               # Custom React hooks
│   ├── auth/            # Auth-related hooks
│   ├── useComment.js
│   ├── useLike.js
│   ├── useNotifications.js
│   └── useWebSocket.js
├── layouts/             # Page layouts
│   ├── AdminLayout.jsx
│   ├── BaseLayout.jsx
│   └── StaffLayout.jsx
├── pages/               # Application pages
│   ├── admin/           # Admin dashboard pages
│   ├── auth/            # Login, Register pages
│   ├── Cart/            # Shopping cart
│   ├── Catering/        # Catering services
│   ├── Contact/         # Contact page
│   ├── Foods/           # Food catalog
│   ├── News/            # News & blog
│   ├── Order/           # Order management
│   ├── Profile/         # User profile
│   └── staff/           # Staff dashboard pages
├── routes/              # Route configurations
│   ├── AdminRoutes.jsx
│   ├── AppRoutes.jsx
│   ├── StaffRoutes.jsx
│   └── UserRoutes.jsx
├── services/            # API services
│   ├── api/             # API endpoint functions
│   ├── auth/            # Auth services
│   ├── cache/           # Caching services
│   ├── firebase/        # Firebase services
│   └── websocket/       # WebSocket services
├── store/               # Redux store
│   ├── slices/          # Redux slices
│   │   ├── authSlice.js
│   │   ├── cartSlice.js
│   │   ├── chatbotSlice.js
│   │   ├── favoriteSlice.js
│   │   ├── pointsSlice.js
│   │   └── profileSlice.js
│   └── thunks/          # Async thunks
├── utils/               # Utility functions
├── App.jsx              # Root component
├── main.jsx             # Entry point
└── index.css            # Global styles
```

---

## 4. Installation

### System Requirements

- **Node.js** 18+
- **npm** 9+ or **yarn** 1.22+

### Quick Start

1. **Clone repository**

   ```bash
   git clone https://github.com/DUYLINH1402/OrderFood-FE-React.git
   cd food-order-frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create `.env` file**

   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** in `.env` file:

   ```env
   # API Backend
   VITE_API_BASE_URL=http://localhost:8080/api
   VITE_WS_URL=ws://localhost:8080/ws

   # Firebase
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id

   # Google OAuth
   VITE_GOOGLE_CLIENT_ID=your_google_client_id

   # Algolia Search
   VITE_ALGOLIA_APP_ID=your_algolia_app_id
   VITE_ALGOLIA_SEARCH_KEY=your_search_only_key
   ```

5. **Start development server**

   ```bash
   npm run dev
   ```

6. **Open browser**
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
# Build
npm run build

# Preview production build
npm run preview
```

### Deploy to Firebase

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy
firebase deploy
```

---

## 5. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FOOD ORDER FRONTEND                     │
│                   (React + Vite Application)                │
└──────────────────────────┬──────────────────────────────────┘
                           │
      ┌────────────────────┼────────────────────┐
      │                    │                    │
      ▼                    ▼                    ▼
┌───────────┐      ┌───────────────┐     ┌──────────────┐
│   Pages   │      │  Components   │     │   Layouts    │
│  (Views)  │      │ (Reusable UI) │     │ (Structure)  │
└─────┬─────┘      └───────┬───────┘     └──────┬───────┘
      │                    │                    │
      └────────────────────┼────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     STATE MANAGEMENT                        │
│              Redux Toolkit + Redux Persist                  │
├─────────────────────────────────────────────────────────────┤
│  authSlice │ cartSlice │ favoriteSlice │ pointsSlice │ ...  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      SERVICES LAYER                         │
├──────────────┬──────────────┬──────────────┬────────────────┤
│   API Client │  WebSocket   │   Firebase   │     Cache      │
│   (Axios)    │   (STOMP)    │   Services   │    Services    │
└──────┬───────┴──────┬───────┴──────┬───────┴───────┬────────┘
       │              │              │               │
       ▼              ▼              ▼               ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                        │
├─────────────┬──────────────┬─────────────┬──────────────────┤
│  Backend    │   Firebase   │   Algolia   │   Google OAuth   │
│  REST API   │   Hosting    │   Search    │                  │
└─────────────┴──────────────┴─────────────┴──────────────────┘
```

---

## 6. Key Dependencies

| Package            | Version | Description        |
| ------------------ | ------- | ------------------ |
| `react`            | 18.2    | UI Library         |
| `react-redux`      | 9.2     | Redux bindings     |
| `@reduxjs/toolkit` | 2.8     | State management   |
| `react-router-dom` | 6.20    | Routing            |
| `axios`            | 1.9     | HTTP client        |
| `@stomp/stompjs`   | 7.1     | WebSocket client   |
| `tailwindcss`      | 3.4     | CSS framework      |
| `@mui/material`    | 7.2     | UI components      |
| `antd`             | 5.24    | UI components      |
| `framer-motion`    | 11.18   | Animations         |
| `aos`              | 2.3     | Scroll animations  |
| `algoliasearch`    | 4.26    | Search integration |
| `firebase`         | 11.6    | Firebase SDK       |
| `chart.js`         | 4.5     | Charts             |
| `react-toastify`   | 11.0    | Notifications      |

---

## 7. Scripts

```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Build for production

# Preview
npm run preview      # Preview production build
```

---

## 8. Environment Variables

| Variable                    | Description             | Required |
| --------------------------- | ----------------------- | -------- |
| `VITE_API_BASE_URL`         | Backend API base URL    | Yes      |
| `VITE_WS_URL`               | WebSocket URL           | Yes      |
| `VITE_FIREBASE_API_KEY`     | Firebase API key        | Yes      |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain    | Yes      |
| `VITE_FIREBASE_PROJECT_ID`  | Firebase project ID     | Yes      |
| `VITE_GOOGLE_CLIENT_ID`     | Google OAuth client ID  | No       |
| `VITE_ALGOLIA_APP_ID`       | Algolia application ID  | No       |
| `VITE_ALGOLIA_SEARCH_KEY`   | Algolia search-only key | No       |

---

## 9. Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## 10. Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 11. Related Projects

- [Food Order Backend](https://github.com/DUYLINH1402/OrderFood-BE-Java) - Backend REST API

---

## 12. Contact

<div align="center">

[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:duylinh63b5@gmail.com)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/DUYLINH1402)

</div>

---

<div align="center">

### Star this repo if you find it helpful!

Made with love by [DuyLinh](https://github.com/DUYLINH1402)

</div>
