# 🏥 DocPulse — AI-Powered Digital Healthcare Platform

DocPulse is a comprehensive digital healthcare platform that connects 
patients with doctors through AI-driven recommendations, real-time 
consultations, and seamless appointment management.

## 🌟 Key Features

### 🤖 AI-Powered Doctor Recommendation
- Users input their symptoms
- AI agent (powered by Google Gemini) analyzes symptoms
- Recommends the most suitable doctors based on specialization

### 📅 Appointment Booking System
- Browse and book appointments with doctors
- Real-time availability tracking
- Email notifications for booking confirmations

### 💬 Real-Time Consultation Chat
- Live 15-minute consultation sessions using Socket.io
- Chat history persistence across page refreshes
- First consultation with any doctor is FREE

### 💳 Secure Payments
- Razorpay payment gateway integration
- Secure transaction handling

### 🤖 Navigation Chatbot
- AI-powered chatbot for easy website navigation
- Helps users find relevant pages based on their needs

### 👨‍💼 Admin Panel
- Manage all appointments and consultations
- Add new doctors to the platform
- Toggle doctor availability status

## 🛠️ Tech Stack

### Frontend
- React.js
- Tailwind CSS
- HTML5 / CSS3

### Backend
- Node.js
- Express.js
- Socket.io (Real-time communication)
- Nodemailer (Email notifications)

### Database
- MongoDB

### Authentication & Security
- Google OAuth 2.0
- Bcrypt (Password hashing)
- HTTP Cookies (Session management)

### Third-Party Services
- Google Gemini API (AI agent)
- Razorpay (Payment gateway)
- Cloudinary (Image management)

## 📸 Screenshots

(Add screenshots here)

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB
- npm or yarn

### Installation

# Clone the repository
git clone https://github.com/Saumya-Jain-B2K/DocPulse.git

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

### Environment Variables
Create a .env file in the backend directory:

MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
GOOGLE_CLIENT_ID=your_google_client_id
EMAIL_USER=your_email
EMAIL_PASS=your_email_password

### Run the Application

# Start backend server
cd backend
npm start

# Start frontend
cd frontend
npm run dev

## 👨‍💻 Author
**Saumya Jain**
- GitHub: @Saumya-Jain-B2K
- LinkedIn: www.linkedin.com/in/saumya-jain-438495283

## 📄 License
This project is licensed under the MIT License.
