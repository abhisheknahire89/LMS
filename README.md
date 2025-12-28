# 📚 Bharat Vidya LMS

A comprehensive Learning Management System designed for Indian schools (Classes 1-12).

## 🎯 Features

- **Role-Based Access Control**: Admin, Teacher, and Parent roles
- **Student Management**: Complete student directory with search and filters
- **Attendance Tracking**: Daily attendance marking and monthly reports
- **Assignment Management**: Create, track, and monitor assignments
- **Fee Management**: Track fee payments and send reminders
- **Admin Panel**: Teacher onboarding and parent-student linking
- **Notifications**: Send school-wide or class-specific notices

## 🚀 Demo Accounts

### Admin
- **Email**: admin@school.com
- **Password**: admin123

### Teacher
- **Email**: teacher@school.com
- **Password**: teacher123

### Parent
- **Email**: parent@school.com
- **Password**: parent123

## 🛠️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Storage**: LocalStorage (client-side)
- **Language**: TypeScript

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Deploy with default settings

Or use the Vercel CLI:

```bash
npm i -g vercel
vercel
```

## 📝 Usage

### Admin Features
- Promote users to teacher role
- Link parents to students
- Send school-wide notices
- Full access to all modules

### Teacher Features
- Add and manage students
- Mark daily attendance
- Create and track assignments
- Manage fee records

### Parent Features
- View child's attendance
- Check assignment status
- Monitor fee payments
- Receive school notices

## 🗂️ Project Structure

```
bharat-vidya-lms-app/
├── src/
│   └── app/
│       ├── page.tsx          # Main application
│       ├── layout.tsx         # Root layout
│       └── globals.css        # Global styles
├── public/                    # Static assets
├── package.json
└── README.md
```

## 🔐 Security Notes

⚠️ **Important**: This is a demo application using localStorage for data persistence. For production use:
- Implement proper backend with database (PostgreSQL, MongoDB, etc.)
- Add proper authentication (NextAuth.js, Clerk, or similar)
- Secure API endpoints
- Add input validation and sanitization
- Implement proper error handling
- Add data encryption

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for educational purposes.

## 🇮🇳 Made in India

Built with ❤️ for empowering education across India.
