'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, Home, Users, Calendar, FileText, DollarSign, Bell, LogOut, UserPlus, Send } from 'lucide-react';

// ============ TYPES & CONSTANTS ============
const GRADES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const SECTIONS = ['A', 'B', 'C', 'D'];
const ROLES = { ADMIN: 'admin', TEACHER: 'teacher', PARENT: 'parent' };

// ============ DEMO DATA ============
const DEMO_USERS = [
  { id: '1', email: 'admin@school.com', password: 'admin123', role: ROLES.ADMIN, name: 'Principal Sharma' },
  { id: '2', email: 'teacher@school.com', password: 'teacher123', role: ROLES.TEACHER, name: 'Priya Verma' },
  { id: '3', email: 'parent@school.com', password: 'parent123', role: ROLES.PARENT, name: 'Rajesh Kumar', linkedStudentId: '1' }
];

const DEMO_STUDENTS = [
  { id: '1', rollNo: '001', name: 'Aarav Kumar', class: '10', section: 'A', parentEmail: 'parent@school.com', fatherName: 'Rajesh Kumar', motherName: 'Priya Kumar', phone: '+91-9876543210', address: 'Delhi' },
  { id: '2', rollNo: '002', name: 'Ananya Sharma', class: '10', section: 'A', parentEmail: 'ananya.parent@school.com', fatherName: 'Vikram Sharma', motherName: 'Meera Sharma', phone: '+91-9876543211', address: 'Mumbai' },
  { id: '3', rollNo: '003', name: 'Rohan Gupta', class: '9', section: 'B', parentEmail: 'rohan.parent@school.com', fatherName: 'Suresh Gupta', motherName: 'Anjali Gupta', phone: '+91-9876543212', address: 'Bangalore' },
  { id: '4', rollNo: '004', name: 'Diya Patel', class: '10', section: 'A', parentEmail: 'diya.parent@school.com', fatherName: 'Amit Patel', motherName: 'Neha Patel', phone: '+91-9876543213', address: 'Ahmedabad' }
];

const DEMO_ATTENDANCE = [
  { id: '1', studentId: '1', date: '2024-12-01', status: 'present' },
  { id: '2', studentId: '1', date: '2024-12-02', status: 'present' },
  { id: '3', studentId: '1', date: '2024-12-03', status: 'absent' },
  { id: '4', studentId: '2', date: '2024-12-01', status: 'present' },
  { id: '5', studentId: '2', date: '2024-12-02', status: 'present' }
];

const DEMO_ASSIGNMENTS = [
  { id: '1', title: 'Mathematics Chapter 5 Exercises', description: 'Complete all exercises from Chapter 5', class: '10', section: 'A', dueDate: '2024-12-30', createdAt: '2024-12-15' },
  { id: '2', title: 'Science Project: Solar System Model', description: 'Create a working model of the solar system', class: '10', section: 'A', dueDate: '2025-01-15', createdAt: '2024-12-10' },
  { id: '3', title: 'English Essay: My India', description: 'Write a 500-word essay on "My Vision for India"', class: '9', section: 'B', dueDate: '2024-12-28', createdAt: '2024-12-12' }
];

const DEMO_ASSIGNMENT_STATUS = [
  { id: '1', assignmentId: '1', studentId: '1', status: 'completed' },
  { id: '2', assignmentId: '1', studentId: '2', status: 'pending' },
  { id: '3', assignmentId: '2', studentId: '1', status: 'pending' },
  { id: '4', assignmentId: '2', studentId: '2', status: 'completed' },
  { id: '5', assignmentId: '1', studentId: '4', status: 'pending' },
  { id: '6', assignmentId: '2', studentId: '4', status: 'pending' }
];

const DEMO_FEES = [
  { id: '1', studentId: '1', month: 'December 2024', amount: 5000, status: 'paid', paidDate: '2024-12-01' },
  { id: '2', studentId: '2', month: 'December 2024', amount: 5000, status: 'pending', dueDate: '2024-12-30' },
  { id: '3', studentId: '3', month: 'December 2024', amount: 4500, status: 'pending', dueDate: '2024-12-30' },
  { id: '4', studentId: '1', month: 'January 2025', amount: 5000, status: 'pending', dueDate: '2025-01-10' }
];

// ============ STORAGE WRAPPER ============
const StorageManager = {
  init() {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem('lms_users')) {
      localStorage.setItem('lms_users', JSON.stringify(DEMO_USERS));
    }
    if (!localStorage.getItem('lms_students')) {
      localStorage.setItem('lms_students', JSON.stringify(DEMO_STUDENTS));
    }
    if (!localStorage.getItem('lms_attendance')) {
      localStorage.setItem('lms_attendance', JSON.stringify(DEMO_ATTENDANCE));
    }
    if (!localStorage.getItem('lms_assignments')) {
      localStorage.setItem('lms_assignments', JSON.stringify(DEMO_ASSIGNMENTS));
    }
    if (!localStorage.getItem('lms_assignment_status')) {
      localStorage.setItem('lms_assignment_status', JSON.stringify(DEMO_ASSIGNMENT_STATUS));
    }
    if (!localStorage.getItem('lms_fees')) {
      localStorage.setItem('lms_fees', JSON.stringify(DEMO_FEES));
    }
  },

  getUsers() {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('lms_users') || '[]');
  },

  getStudents() {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('lms_students') || '[]');
  },

  getAttendance() {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('lms_attendance') || '[]');
  },

  getAssignments() {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('lms_assignments') || '[]');
  },

  getAssignmentStatus() {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('lms_assignment_status') || '[]');
  },

  getFees() {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('lms_fees') || '[]');
  },

  saveUsers(users: any[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('lms_users', JSON.stringify(users));
  },

  saveStudents(students: any[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('lms_students', JSON.stringify(students));
  },

  saveAttendance(attendance: any[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('lms_attendance', JSON.stringify(attendance));
  },

  saveAssignments(assignments: any[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('lms_assignments', JSON.stringify(assignments));
  },

  saveAssignmentStatus(status: any[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('lms_assignment_status', JSON.stringify(status));
  },

  saveFees(fees: any[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('lms_fees', JSON.stringify(fees));
  }
};

// ============ AUTH COMPONENT ============
const Auth = ({ onLogin }: { onLogin: (user: any) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users = StorageManager.getUsers();

    if (isLogin) {
      const user = users.find((u: any) => u.email === email && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid credentials');
      }
    } else {
      if (users.find((u: any) => u.email === email)) {
        setError('Email already exists');
        return;
      }
      const newUser = {
        id: Date.now().toString(),
        email,
        password,
        name,
        role: ROLES.PARENT
      };
      users.push(newUser);
      StorageManager.saveUsers(users);
      onLogin(newUser);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">📚 Bharat Vidya</h1>
          <p className="text-gray-600 mt-2">Learning Management System</p>
        </div>

        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-blue-800 mb-2">Demo Accounts:</p>
          <p className="text-xs text-blue-700">👤 Admin: admin@school.com / admin123</p>
          <p className="text-xs text-blue-700">👨‍🏫 Teacher: teacher@school.com / teacher123</p>
          <p className="text-xs text-blue-700">👨‍👩‍👧 Parent: parent@school.com / parent123</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 font-semibold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

// ============ DASHBOARD COMPONENT ============
const Dashboard = ({ user }: { user: any }) => {
  const students = StorageManager.getStudents();
  const attendance = StorageManager.getAttendance();
  const assignments = StorageManager.getAssignments();
  const fees = StorageManager.getFees();

  const linkedStudent = user.role === ROLES.PARENT && user.linkedStudentId
    ? students.find((s: any) => s.id === user.linkedStudentId)
    : null;

  const getStats = () => {
    if (user.role === ROLES.PARENT && linkedStudent) {
      const studentAttendance = attendance.filter((a: any) => a.studentId === linkedStudent.id);
      const presentCount = studentAttendance.filter((a: any) => a.status === 'present').length;
      const percentage = studentAttendance.length > 0
        ? ((presentCount / studentAttendance.length) * 100).toFixed(1)
        : 0;

      const studentAssignments = StorageManager.getAssignmentStatus()
        .filter((s: any) => s.studentId === linkedStudent.id);
      const completed = studentAssignments.filter((s: any) => s.status === 'completed').length;

      const studentFees = fees.filter((f: any) => f.studentId === linkedStudent.id && f.status === 'pending');

      return {
        attendance: `${percentage}%`,
        assignments: `${completed}/${studentAssignments.length}`,
        pendingFees: `₹${studentFees.reduce((sum: number, f: any) => sum + f.amount, 0)}`
      };
    }

    return {
      students: students.length,
      teachers: StorageManager.getUsers().filter((u: any) => u.role === ROLES.TEACHER).length,
      assignments: assignments.length,
      pendingFees: `₹${fees.filter((f: any) => f.status === 'pending').reduce((sum: number, f: any) => sum + f.amount, 0)}`
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, {user.name}! 🙏
          </h1>
          <p className="text-gray-600 mt-1">
            {user.role === ROLES.ADMIN && 'Administrator Dashboard'}
            {user.role === ROLES.TEACHER && 'Teacher Dashboard'}
            {user.role === ROLES.PARENT && linkedStudent && `Parent of ${linkedStudent.name}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {user.role === ROLES.PARENT && linkedStudent ? (
          <>
            <StatCard
              title="Attendance"
              value={stats.attendance}
              icon="📊"
              color="bg-green-500"
            />
            <StatCard
              title="Assignments"
              value={stats.assignments}
              icon="📝"
              color="bg-blue-500"
            />
            <StatCard
              title="Pending Fees"
              value={stats.pendingFees}
              icon="💰"
              color="bg-yellow-500"
            />
            <StatCard
              title="Class"
              value={`${linkedStudent.class}-${linkedStudent.section}`}
              icon="🎓"
              color="bg-purple-500"
            />
          </>
        ) : (
          <>
            <StatCard
              title="Total Students"
              value={stats.students}
              icon="👨‍🎓"
              color="bg-blue-500"
            />
            <StatCard
              title="Teachers"
              value={stats.teachers}
              icon="👨‍🏫"
              color="bg-green-500"
            />
            <StatCard
              title="Assignments"
              value={stats.assignments}
              icon="📝"
              color="bg-purple-500"
            />
            <StatCard
              title="Pending Fees"
              value={stats.pendingFees}
              icon="💰"
              color="bg-yellow-500"
            />
          </>
        )}
      </div>

      {user.role !== ROLES.PARENT && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickActionButton icon={<Users />} text="Manage Students" />
            <QuickActionButton icon={<Calendar />} text="Mark Attendance" />
            <QuickActionButton icon={<FileText />} text="Create Assignment" />
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg shadow p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">🇮🇳 Bharat Vidya LMS</h2>
        <p className="opacity-90">Empowering education across India - Classes 1 to 12</p>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: { title: string; value: any; icon: string; color: string }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
      <div className={`${color} w-12 h-12 rounded-full flex items-center justify-center text-2xl`}>
        {icon}
      </div>
    </div>
  </div>
);

const QuickActionButton = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <button className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
    <div className="text-blue-600">{icon}</div>
    <span className="font-medium text-gray-700">{text}</span>
  </button>
);

// ============ STUDENTS COMPONENT ============
const Students = ({ user }: { user: any }) => {
  const [students, setStudents] = useState(StorageManager.getStudents());
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [newStudent, setNewStudent] = useState({
    rollNo: '',
    name: '',
    class: '10',
    section: 'A',
    parentEmail: '',
    fatherName: '',
    motherName: '',
    phone: '',
    address: ''
  });

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const student = {
      id: Date.now().toString(),
      ...newStudent
    };

    const updatedStudents = [...students, student];
    setStudents(updatedStudents);
    StorageManager.saveStudents(updatedStudents);

    // Backfill assignments
    const assignments = StorageManager.getAssignments()
      .filter((a: any) => a.class === student.class && a.section === student.section);

    const assignmentStatus = StorageManager.getAssignmentStatus();
    assignments.forEach((assignment: any) => {
      assignmentStatus.push({
        id: Date.now().toString() + Math.random(),
        assignmentId: assignment.id,
        studentId: student.id,
        status: 'pending'
      });
    });
    StorageManager.saveAssignmentStatus(assignmentStatus);

    setShowModal(false);
    setNewStudent({
      rollNo: '',
      name: '',
      class: '10',
      section: 'A',
      parentEmail: '',
      fatherName: '',
      motherName: '',
      phone: '',
      address: ''
    });
  };

  const filteredStudents = students.filter((s: any) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNo.includes(searchTerm);
    const matchesClass = !filterClass || s.class === filterClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">👨‍🎓 Students Directory</h1>
        {user.role !== ROLES.PARENT && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <UserPlus size={20} />
            <span>Add Student</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Classes</option>
            {GRADES.map(grade => (
              <option key={grade} value={grade}>Class {grade}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Roll No</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Parent Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student: any) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{student.rollNo}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{student.class}-{student.section}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{student.parentEmail}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{student.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Student</h2>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Roll Number"
                  value={newStudent.rollNo}
                  onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value })}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Student Name"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
                <select
                  value={newStudent.class}
                  onChange={(e) => setNewStudent({ ...newStudent, class: e.target.value })}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {GRADES.map(grade => (
                    <option key={grade} value={grade}>Class {grade}</option>
                  ))}
                </select>
                <select
                  value={newStudent.section}
                  onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {SECTIONS.map(section => (
                    <option key={section} value={section}>Section {section}</option>
                  ))}
                </select>
                <input
                  type="email"
                  placeholder="Parent Email"
                  value={newStudent.parentEmail}
                  onChange={(e) => setNewStudent({ ...newStudent, parentEmail: e.target.value })}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Father's Name"
                  value={newStudent.fatherName}
                  onChange={(e) => setNewStudent({ ...newStudent, fatherName: e.target.value })}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Mother's Name"
                  value={newStudent.motherName}
                  onChange={(e) => setNewStudent({ ...newStudent, motherName: e.target.value })}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <textarea
                placeholder="Address"
                value={newStudent.address}
                onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                rows={3}
                required
              />
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Add Student
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Due to length, I'll continue in the next part with Attendance, Assignments, Fees, Admin, and Layout components
// For now, let me create a simplified version that works

// ============ LAYOUT COMPONENT ============
const Layout = ({ user, onLogout, children, currentPage, setCurrentPage }: any) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = user.role === ROLES.PARENT
    ? [
      { name: 'Dashboard', icon: Home, page: 'dashboard' },
    ]
    : user.role === ROLES.ADMIN
      ? [
        { name: 'Dashboard', icon: Home, page: 'dashboard' },
        { name: 'Students', icon: Users, page: 'students' },
      ]
      : [
        { name: 'Dashboard', icon: Home, page: 'dashboard' },
        { name: 'Students', icon: Users, page: 'students' },
      ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="lg:hidden bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">📚 Bharat Vidya</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex">
        <aside className={`${sidebarOpen ? 'block' : 'hidden'
          } lg:block w-64 bg-white shadow-lg min-h-screen fixed lg:sticky top-0 z-40`}>
          <div className="p-6 border-b hidden lg:block">
            <h1 className="text-2xl font-bold text-blue-600">📚 Bharat Vidya</h1>
            <p className="text-sm text-gray-600 mt-1">LMS for Indian Schools</p>
          </div>

          <nav className="p-4 space-y-2">
            {navigation.map((item: any) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.page}
                  onClick={() => {
                    setCurrentPage(item.page);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${currentPage === item.page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </button>
              );
            })}
          </nav>

          <div className="absolute bottom-0 w-64 p-4 border-t bg-white">
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-800">{user.name || user.email}</p>
              <p className="text-xs text-gray-600 capitalize">{user.role}</p>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

// ============ MAIN APP COMPONENT ============
export default function App() {
  const [user, setUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    StorageManager.init();
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('dashboard');
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'students':
        return <Students user={user} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <Layout
      user={user}
      onLogout={handleLogout}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
    >
      {renderPage()}
    </Layout>
  );
}
