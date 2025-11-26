<<<<<<< HEAD
# College Event Manager - Full Stack MERN Application

A complete event management system for colleges where students can browse and register for events, and admins can manage events.

## 🚀 Features

### For Students
- ✅ Browse upcoming college events with beautiful card UI
- ✅ View detailed event information
- ✅ Register for events with email OTP verification
- ✅ Receive confirmation email with QR code
- ✅ View registered events in profile
- ✅ Download/save QR code for venue RSVP

### For Admins
- ✅ Create, update, and delete events
- ✅ Upload event images via Cloudinary
- ✅ Manage only their own events
- ✅ View registration statistics

### Technical Features
- ✅ Session-based authentication with cookies
- ✅ Email OTP verification using Nodemailer
- ✅ Unique QR code generation for each registration
- ✅ Professional UI with Framer Motion animations
- ✅ Responsive design for mobile and desktop
- ✅ Real-time registration status updates

## 📁 Project Structure

```
college-event-manager/
├── server/                  # Backend (Node.js + Express)
│   ├── models/             # MongoDB models (User, Event, Registration)
│   ├── routes/             # API routes (auth, events, registrations)
│   ├── middleware/         # Authentication middleware
│   ├── utils/              # Utilities (email, QR, cloudinary)
│   ├── seed.js             # Database seeder with dummy data
│   ├── server.js           # Express server entry point
│   ├── package.json        # Backend dependencies
│   └── .env.example        # Environment variables template
│
└── client/                 # Frontend (React)
    ├── public/             # Static files
    ├── src/
    │   ├── components/     # Reusable components (Navbar, EventCard)
    │   ├── pages/          # Page components (Home, Login, Profile, etc.)
    │   ├── context/        # AuthContext for global state
    │   ├── App.js          # Main app with routing
    │   └── index.js        # React entry point
    ├── package.json        # Frontend dependencies
    └── .env                # API URL configuration

```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Gmail account for sending emails
- Cloudinary account for image hosting

### Step 1: Clone and Install

```bash
# Extract the zip file
cd college-event-manager

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Step 2: Configure Environment Variables

#### Backend (.env in server folder)

Create `server/.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/college-event-manager
SESSION_SECRET=your-secret-key-change-this-in-production
FRONTEND_URL=http://localhost:3000

# Gmail Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Frontend (.env in client folder)

The file is already created:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 3: Gmail App Password Setup

1. Go to Google Account settings: https://myaccount.google.com/
2. Enable 2-Step Verification
3. Go to App Passwords: https://myaccount.google.com/apppasswords
4. Create new app password for "Mail"
5. Copy the 16-character password
6. Paste it in `.env` as `EMAIL_PASS`

### Step 4: Cloudinary Setup

1. Sign up at https://cloudinary.com (free tier)
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret
4. Paste them in `.env`
5. Upload event images or use provided URLs

### Step 5: Start MongoDB

```bash
# If using local MongoDB
mongod

# If using MongoDB Atlas, just use the connection string in .env
```

### Step 6: Seed Database with Dummy Data

```bash
cd server
npm run seed
```

This creates:
- 1 Admin account
- 5 Dummy events with details

**Admin Credentials:**
- Email: admin@college.edu
- Password: admin123

### Step 7: Run the Application

#### Terminal 1 - Backend
```bash
cd server
npm run dev
```
Backend runs on http://localhost:5000

#### Terminal 2 - Frontend
```bash
cd client
npm start
```
Frontend runs on http://localhost:3000

## 🎯 Usage Guide

### As a Student

1. **Sign Up**
   - Click "Sign Up" button
   - Fill registration form
   - Select "Student" role
   - Check email for OTP
   - Verify OTP to activate account

2. **Browse Events**
   - View all events on home page
   - Click on any event card for details

3. **Register for Event**
   - Click "Register Now" on event details page
   - Receive confirmation with QR code
   - Check email for QR code copy
   - View registration in Profile page

4. **View Profile**
   - Click "Profile" in navbar
   - See all registered events
   - Click "View QR Code" for any event

### As an Admin

1. **Login**
   - Use admin credentials (see Step 6)
   - Email: admin@college.edu
   - Password: admin123

2. **Create Event**
   - Use API or database directly
   - Or create through admin interface

3. **Manage Events**
   - Go to any event you created
   - Click "Manage Event" button (only visible to organiser)
   - Edit event details
   - Update or delete event

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-otp` - Verify email with OTP
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (admin only)
- `PUT /api/events/:id` - Update event (organiser only)
- `DELETE /api/events/:id` - Delete event (organiser only)
- `GET /api/events/:id/is-organiser` - Check if user is organiser

### Registrations
- `POST /api/registrations` - Register for event
- `GET /api/registrations/my-registrations` - Get user's registrations
- `GET /api/registrations/:id` - Get single registration
- `GET /api/registrations/check/:eventId` - Check if registered
- `DELETE /api/registrations/:id` - Cancel registration

## 🎨 Tech Stack

### Frontend
- **React** 18 - UI library
- **React Router** - Navigation
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **React Toastify** - Notifications
- **date-fns** - Date formatting

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **express-session** - Session management
- **Nodemailer** - Email service
- **QRCode** - QR code generation
- **bcryptjs** - Password hashing
- **Cloudinary** - Image hosting

## 🎨 Design Features

- Professional color scheme (Teal primary: #21808d)
- Smooth animations with Framer Motion
- Responsive grid layouts
- Card-based UI design
- Loading states and skeletons
- Toast notifications
- Form validations
- Mobile-friendly navigation

## 📸 Screenshots

The application includes:
- Beautiful event cards with images
- Animated page transitions
- Professional authentication forms
- Interactive event details page
- Profile dashboard
- QR code display page
- Admin event management interface

## 🔒 Security Features

- Password hashing with bcrypt
- Session-based authentication
- HTTP-only cookies
- CORS configuration
- Input validation
- Protected routes
- Email verification

## 📝 Notes

1. **Images**: The seeder uses Unsplash placeholder images. For production, upload your own images to Cloudinary.

2. **Email**: Gmail has daily sending limits (500 for free accounts). For production, use a dedicated email service.

3. **Sessions**: Sessions are stored in MongoDB. Clear browser cookies if you face login issues.

4. **OTP**: OTP expires in 10 minutes. Request a new one if expired.

5. **QR Codes**: Generated uniquely for each registration with user and event details embedded.

## 🚀 Production Deployment

### Backend (Heroku/Railway/Render)
1. Set all environment variables
2. Use MongoDB Atlas for database
3. Update FRONTEND_URL to your deployed frontend URL

### Frontend (Vercel/Netlify)
1. Build: `npm run build`
2. Set REACT_APP_API_URL to your backend URL
3. Deploy build folder

## 🐛 Troubleshooting

**Issue: Can't login after registration**
- Solution: Make sure you verified OTP. Check email spam folder.

**Issue: Images not loading**
- Solution: Upload images to your Cloudinary account and update URLs.

**Issue: Email not sending**
- Solution: Verify Gmail app password is correct. Check if 2FA is enabled.

**Issue: Session not persisting**
- Solution: Make sure cookies are enabled. Check CORS settings.

**Issue: MongoDB connection failed**
- Solution: Verify MongoDB is running. Check connection string in .env.

## 👨‍💻 Development

```bash
# Run backend with auto-reload
cd server
npm run dev

# Run frontend with hot reload
cd client
npm start

# Seed database
cd server
npm run seed
```

## 📄 License

This project is for educational purposes.

## 🤝 Support

For issues or questions, check:
1. .env variables are correctly set
2. MongoDB is running
3. All dependencies are installed
4. Ports 3000 and 5000 are available

---

**Built with ❤️ using MERN Stack**

Enjoy managing your college events! 🎉
=======
WEB DEV ASSIGNMENT 2
>>>>>>> aeab84e8b6bc10557bbc5e95a03f718b55c0f6e1
