'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Menu, X, Home, Users, Calendar, FileText, DollarSign,
  Bell, LogOut, UserPlus, Send, CheckCircle2, Clock,
  AlertCircle, ChevronRight, Filter, Download
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ============ CONSTANTS ============
const GRADES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const SECTIONS = ['A', 'B', 'C', 'D'];
const ROLES = { ADMIN: 'admin', TEACHER: 'teacher', PARENT: 'parent' };

// ============ TYPES ============
interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  linked_student_id?: string;
}

// ============ MAIN APP COMPONENT ============
export default function BharatVidyaLMS() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [viewingChildData, setViewingChildData] = useState<any>(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, students(*)')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Fallback: Create profile if it doesn't exist
        let autoRole = ROLES.PARENT;
        const email = session?.user.email;
        if (email === 'admin@school.com') autoRole = ROLES.ADMIN;
        if (email === 'teacher@school.com') autoRole = ROLES.TEACHER;

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            email: email,
            role: autoRole
          })
          .select()
          .single();

        if (createError) throw createError;
        setProfile(newProfile as UserProfile);
      } else {
        setProfile(data as UserProfile);
        if (data.role === ROLES.PARENT && data.linked_student_id) {
          setViewingChildData(data.students);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentPage('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a73e8]"></div>
      </div>
    );
  }

  if (!session) {
    return <AuthView onLogin={() => { }} />;
  }

  return (
    <Layout
      profile={profile}
      onLogout={handleLogout}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
    >
      <MainContent
        profile={profile}
        currentPage={currentPage}
        childData={viewingChildData}
      />
    </Layout>
  );
}

// ============ AUTH VIEW ============
function AuthView({ onLogin }: { onLogin: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data: { user, session }, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: window.location.origin
          }
        });

        if (signUpError) throw signUpError;

        if (user && !session) {
          // Email confirmation required
          alert('✅ Account created! Please check your email to confirm your account, then return here to log in.');
          setIsLogin(true);
          setEmail('');
          setPassword('');
          setName('');
          return;
        }

        if (user && session) {
          // Auto-logged in (email confirmation disabled)
          await supabase.from('profiles').upsert({
            id: user.id,
            email,
            name,
            role: ROLES.PARENT
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
      <div className="google-card p-8 w-full max-w-md shadow-lg border-t-4 border-t-[#1a73e8]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1a73e8]">📚 Bharat Vidya</h1>
          <p className="text-gray-600 mt-2">Learning Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="google-input"
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="google-input"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="google-input"
            required
          />

          {error && <p className="text-red-500 text-sm flex items-center gap-1"><AlertCircle size={14} /> {error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full google-button-primary"
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#1a73e8] font-medium hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs font-bold text-gray-700 mb-2">📌 Getting Started</p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>• <span className="font-medium text-gray-700">New users:</span> Sign up to create a Parent account</p>
            <p>• <span className="font-medium text-gray-700">Admins/Teachers:</span> Contact administrator for account setup</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ LAYOUT ============
function Layout({ profile, onLogout, children, currentPage, setCurrentPage }: any) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', icon: Home, page: 'dashboard', roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.PARENT] },
    { name: 'Students', icon: Users, page: 'students', roles: [ROLES.ADMIN, ROLES.TEACHER] },
    { name: 'Attendance', icon: Calendar, page: 'attendance', roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.PARENT] },
    { name: 'Assignments', icon: FileText, page: 'assignments', roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.PARENT] },
    { name: 'Fees', icon: DollarSign, page: 'fees', roles: [ROLES.ADMIN, ROLES.TEACHER, ROLES.PARENT] },
    { name: 'Admin Panel', icon: Send, page: 'admin', roles: [ROLES.ADMIN] },
  ];

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
      <div className="text-center">
        <p className="text-gray-600 mb-4">Initializing profile...</p>
        <button onClick={onLogout} className="text-[#1a73e8] hover:underline">Return to Login</button>
      </div>
    </div>
  );

  const filteredNav = navigation.filter(item => item.roles.includes(profile.role));

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full bg-white border-b border-gray-200 z-50 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-[#1a73e8]">📚 Bharat Vidya</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-gray-600">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 bg-white border-r border-gray-200 w-64 z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-gray-100 mb-4 hidden lg:block">
          <h1 className="text-2xl font-bold text-[#1a73e8]">📚 Bharat Vidya</h1>
          <p className="text-xs text-gray-500 font-medium tracking-wider uppercase mt-1">School Management</p>
        </div>

        <nav className="p-4 space-y-1">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => {
                  setCurrentPage(item.page);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
                  ${isActive
                    ? 'bg-[#e8f0fe] text-[#1a73e8]'
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                <Icon size={20} className={isActive ? 'text-[#1a73e8]' : 'text-gray-400'} />
                <span className={`font-medium ${isActive ? 'text-[#1a73e8]' : 'text-gray-700'}`}>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 bg-white">
          <div className="mb-4 flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-full bg-[#1a73e8] flex items-center justify-center text-white font-bold">
              {profile.name?.charAt(0) || profile.email?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-gray-800 truncate">{profile.name}</p>
              <p className="text-xs text-gray-500 capitalize">{profile.role}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-red-100 text-red-600 rounded-md hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full lg:overflow-y-auto">
        <div className="p-4 pt-20 lg:pt-8 lg:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

// ============ MAIN CONTENT SWITCHER ============
function MainContent({ profile, currentPage, childData }: any) {
  switch (currentPage) {
    case 'dashboard': return <DashboardView profile={profile} childData={childData} />;
    case 'students': return <StudentsView profile={profile} />;
    case 'attendance': return <AttendanceView profile={profile} childData={childData} />;
    case 'assignments': return <AssignmentsView profile={profile} childData={childData} />;
    case 'fees': return <FeesView profile={profile} childData={childData} />;
    case 'admin': return <AdminPanelView profile={profile} />;
    default: return <DashboardView profile={profile} childData={childData} />;
  }
}

// ============ DASHBOARD VIEW ============
function DashboardView({ profile, childData }: any) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [profile, childData]);

  const fetchStats = async () => {
    try {
      if (profile.role === ROLES.PARENT && childData) {
        // Fetch child specific stats
        const [attRes, assRes, feeRes] = await Promise.all([
          supabase.from('attendance').select('status').eq('student_id', childData.id),
          supabase.from('assignment_submissions').select('status').eq('student_id', childData.id),
          supabase.from('fees').select('amount').eq('student_id', childData.id).eq('status', 'pending')
        ]);

        const totalAtt = attRes.data?.length || 0;
        const presentAtt = attRes.data?.filter(a => a.status === 'present').length || 0;
        const attPercent = totalAtt > 0 ? ((presentAtt / totalAtt) * 100).toFixed(1) : 0;

        const totalAss = assRes.data?.length || 0;
        const compAss = assRes.data?.filter(a => a.status === 'completed').length || 0;

        const totalFees = feeRes.data?.reduce((sum, f) => sum + Number(f.amount), 0) || 0;

        setStats({
          attendance: `${attPercent}%`,
          assignments: `${compAss}/${totalAss}`,
          fees: `₹${totalFees}`,
          class: `${childData.class}-${childData.section}`
        });
      } else {
        // Admin/Teacher general stats
        const [stuRes, profRes, assRes, feeRes] = await Promise.all([
          supabase.from('students').select('id', { count: 'exact' }),
          supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'teacher'),
          supabase.from('assignments').select('id', { count: 'exact' }),
          supabase.from('fees').select('amount').eq('status', 'pending')
        ]);

        setStats({
          students: stuRes.count,
          teachers: profRes.count,
          assignments: assRes.count,
          pendingFees: `₹${feeRes.data?.reduce((sum, f) => sum + Number(f.amount), 0) || 0}`
        });
      }
    } catch (error) {
      console.error('Stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold text-gray-900">
          Welcome, {profile.name}! 👋
        </h2>
        <p className="text-gray-600 mt-2 flex items-center gap-2">
          {profile.role === ROLES.ADMIN && <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold uppercase">Administrator</span>}
          {profile.role === ROLES.TEACHER && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold uppercase">Teacher Portal</span>}
          {profile.role === ROLES.PARENT && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold uppercase">Parent Portal</span>}
          {profile.role === ROLES.PARENT && childData && `Managing child: ${childData.name} (Class ${childData.class}-${childData.section})`}
          {profile.role === ROLES.PARENT && !childData && "Account not linked to any student."}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {profile.role === ROLES.PARENT ? (
          <>
            <StatCard title="Attendance" value={stats.attendance} icon={Calendar} color="bg-green-50 text-green-600" />
            <StatCard title="Completed Assignments" value={stats.assignments} icon={FileText} color="bg-blue-50 text-blue-600" />
            <StatCard title="Pending Fees" value={stats.fees} icon={DollarSign} color="bg-orange-50 text-orange-600" />
            <StatCard title="Class / Section" value={stats.class} icon={Users} color="bg-purple-50 text-purple-600" />
          </>
        ) : (
          <>
            <StatCard title="Total Students" value={stats.students} icon={Users} color="bg-blue-50 text-blue-600" />
            <StatCard title="Teachers" value={stats.teachers} icon={CheckCircle2} color="bg-green-50 text-green-600" />
            <StatCard title="Active Assignments" value={stats.assignments} icon={FileText} color="bg-purple-50 text-purple-600" />
            <StatCard title="Total Unpaid Fees" value={stats.pendingFees} icon={DollarSign} color="bg-red-50 text-red-600" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 google-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Recent Activity</h3>
            <button className="text-[#1a73e8] text-sm font-medium hover:underline">View all</button>
          </div>
          <div className="space-y-4">
            <ActivityItem icon={Bell} title="Annual Day Notice" desc="Admin broadcasted a new notice for all classes." time="2 hours ago" />
            <ActivityItem icon={FileText} title="New Assignment Added" desc="Maths: Chapter 5 Exercises assigned to Class 10-A." time="5 hours ago" />
            <ActivityItem icon={DollarSign} title="Fee Reminder Sent" desc="System automatically sent reminders for January fees." time="1 day ago" />
          </div>
        </div>

        <div className="google-card p-6 bg-gradient-to-br from-[#1a73e8] to-[#1557b0] text-white border-none shadow-xl">
          <h3 className="text-xl font-bold mb-4">🇮🇳 Bharat Vidya LMS</h3>
          <p className="text-white/80 text-sm leading-relaxed mb-6">
            Empowering education across India. Designed for Classes 1 to 12 with role-based dashboarding and automated notifications.
          </p>
          <div className="space-y-3">
            <QuickLink icon={CheckCircle2} text="Verify Students" />
            <QuickLink icon={Send} text="Broadcast Alerts" />
            <QuickLink icon={Download} text="Download Reports" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="google-card p-6 border-none shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ icon: Icon, title, desc, time }: any) {
  return (
    <div className="flex gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 flex-shrink-0">
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{desc}</p>
      </div>
      <div className="text-[10px] font-medium text-gray-400 uppercase">{time}</div>
    </div>
  );
}

function QuickLink({ icon: Icon, text }: any) {
  return (
    <button className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-left text-sm font-medium">
      <Icon size={18} />
      <span>{text}</span>
    </button>
  );
}

// ============ STUDENTS VIEW ============
function StudentsView({ profile }: any) {
  if (profile.role === ROLES.PARENT) return <RestrictedView />;

  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [formData, setFormData] = useState({
    roll_no: '', name: '', class: '10', section: 'A',
    parent_email: '', father_name: '', mother_name: '',
    phone: '', address: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('students').select('*').order('roll_no');
    if (data) setStudents(data);
    setLoading(false);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Insert Student
      const { data: newStudent, error } = await supabase
        .from('students')
        .insert(formData)
        .select()
        .single();

      if (error) throw error;

      // 2. Automatic Backfilling (USE CASE T1)
      // Find all existing assignments for this class/section
      const { data: assignments } = await supabase
        .from('assignments')
        .select('id')
        .eq('class', formData.class)
        .eq('section', formData.section);

      if (assignments && assignments.length > 0) {
        const statuses = assignments.map(a => ({
          assignment_id: a.id,
          student_id: newStudent.id,
          status: 'pending'
        }));
        await supabase.from('assignment_submissions').insert(statuses);
      }

      setIsModalOpen(false);
      fetchStudents();
      alert(`Student added! Backfilled ${assignments?.length || 0} assignments.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = students.filter(s =>
    (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.roll_no.includes(searchTerm)) &&
    (!selectedClass || s.class === selectedClass)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Student Directory</h2>
          <p className="text-sm text-gray-500">Manage school-wide student records and enrollment.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="google-button-primary flex items-center justify-center gap-2"
        >
          <UserPlus size={18} />
          <span>Add New Student</span>
        </button>
      </div>

      <div className="google-card p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="google-input pl-10"
            />
          </div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="google-input md:w-48"
          >
            <option value="">All Classes</option>
            {GRADES.map(g => <option key={g} value={g}>Class {g}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <table className="w-full text-left">
            <thead className="bg-[#f8f9fa] border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Roll No</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Class</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Parent Email</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">Loading students...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">No students found.</td></tr>
              ) : filtered.map(s => (
                <tr key={s.id} className="hover:bg-[#fcfdfe] transition-colors group">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{s.roll_no}</td>
                  <td className="px-6 py-4 text-sm font-medium text-[#1a73e8] flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center text-xs font-bold">
                      {s.name.charAt(0)}
                    </div>
                    {s.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">Grade {s.class}-{s.section}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{s.parent_email}</td>
                  <td className="px-6 py-4">
                    <button className="text-gray-400 hover:text-[#1a73e8] opacity-0 group-hover:opacity-100 transition-all">
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#1a73e8] p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Enroll New Student</h3>
                <p className="text-white/80 text-xs">Complete the profile to generate school records.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-1.5 block px-1">Roll Number</label>
                  <input required className="google-input" placeholder="e.g. 046" value={formData.roll_no}
                    onChange={e => setFormData({ ...formData, roll_no: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-1.5 block px-1">Full Name</label>
                  <input required className="google-input" placeholder="Student Name" value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-1.5 block px-1">Class</label>
                  <select className="google-input" value={formData.class}
                    onChange={e => setFormData({ ...formData, class: e.target.value })}>
                    {GRADES.map(g => <option key={g} value={g}>Class {g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-1.5 block px-1">Section</label>
                  <select className="google-input" value={formData.section}
                    onChange={e => setFormData({ ...formData, section: e.target.value })}>
                    {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-1.5 block px-1">Parent Email</label>
                  <input required type="email" className="google-input" placeholder="email@example.com"
                    value={formData.parent_email} onChange={e => setFormData({ ...formData, parent_email: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-500 mb-1.5 block px-1">Phone Number</label>
                  <input required className="google-input" placeholder="+91-0000000000"
                    value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 google-button-primary py-3">Confirm Enrollment</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 google-button-secondary py-3">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ ATTENDANCE VIEW ============
function AttendanceView({ profile, childData }: any) {
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('10');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'mark' | 'report'>(profile.role === ROLES.PARENT ? 'report' : 'mark');
  const [month, setMonth] = useState('December 2024');

  useEffect(() => {
    if (viewMode === 'mark') fetchClassForAttendance();
  }, [selectedClass, selectedSection, selectedDate, viewMode, month, childData]);

  const fetchClassForAttendance = async () => {
    const { data: stu } = await supabase.from('students').select('*').eq('class', selectedClass).eq('section', selectedSection);
    const { data: att } = await supabase.from('attendance').select('*').eq('date', selectedDate);
    if (stu) setStudents(stu);
    if (att) setAttendance(att);
  };

  const markAttendance = async (studentId: string, status: 'present' | 'absent') => {
    try {
      const { error } = await supabase
        .from('attendance')
        .upsert({
          student_id: studentId,
          date: selectedDate,
          status
        }, { onConflict: 'student_id,date' });

      if (error) throw error;
      fetchClassForAttendance();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (profile.role === ROLES.PARENT) {
    return <ParentAttendanceView childData={childData} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Attendance Management</h2>
          <p className="text-sm text-gray-500">Mark daily attendance or view monthly analytics.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('mark')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'mark' ? 'bg-white text-[#1a73e8] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Mark Daily
          </button>
          <button
            onClick={() => setViewMode('report')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'report' ? 'bg-white text-[#1a73e8] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Monthly Report
          </button>
        </div>
      </div>

      {viewMode === 'mark' ? (
        <div className="google-card p-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-end bg-[#fafbfc] p-4 rounded-xl border border-gray-100">
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">Grade</label>
              <select className="google-input" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                {GRADES.map(g => <option key={g} value={g}>Class {g}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">Section</label>
              <select className="google-input" value={selectedSection} onChange={e => setSelectedSection(e.target.value)}>
                {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">Date</label>
              <input type="date" className="google-input" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            {students.map(s => {
              const record = attendance.find(a => a.student_id === s.id && a.date === selectedDate);
              return (
                <div key={s.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-[#1a73e8]/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-gray-400 w-8">{s.roll_no}</span>
                    <span className="font-semibold text-gray-800">{s.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => markAttendance(s.id, 'present')}
                      className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${record?.status === 'present' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-green-50'}`}
                    >
                      Present
                    </button>
                    <button
                      onClick={() => markAttendance(s.id, 'absent')}
                      className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${record?.status === 'absent' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-red-50'}`}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <AttendanceReportView selectedClass={selectedClass} selectedSection={selectedSection} month={month} />
      )}
    </div>
  );
}

function AttendanceReportView({ selectedClass, selectedSection, month }: any) {
  const [report, setReport] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [selectedClass, selectedSection, month]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const { data: students } = await supabase.from('students').select('*').eq('class', selectedClass).eq('section', selectedSection);
      if (!students) return;

      const date = new Date(month);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();

      const { data: attData } = await supabase
        .from('attendance')
        .select('*')
        .in('student_id', students.map(s => s.id))
        .gte('date', startOfMonth.split('T')[0])
        .lte('date', endOfMonth.split('T')[0]);

      const processed = students.map(s => {
        const studentAtt = attData?.filter(a => a.student_id === s.id) || [];
        const total = studentAtt.length;
        const present = studentAtt.filter(a => a.status === 'present').length;
        const percent = total > 0 ? (present / total) * 100 : 0;

        let status = 'Excellent';
        let color = 'bg-green-100 text-green-700';
        if (percent < 50) { status = 'Critical'; color = 'bg-red-100 text-red-700'; }
        else if (percent < 65) { status = 'Needs Attention'; color = 'bg-orange-100 text-orange-700'; }
        else if (percent < 75) { status = 'Average'; color = 'bg-yellow-100 text-yellow-700'; }
        else if (percent < 85) { status = 'Good'; color = 'bg-blue-100 text-blue-700'; }

        return { ...s, total, present, percent: percent.toFixed(1), status, color };
      });

      setReport(processed);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const sendReports = async () => {
    setLoading(true);
    try {
      for (const item of report) {
        if (!item.parent_email) continue;
        const html = `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2 style="color: #1a73e8;">Monthly Attendance Report - ${month}</h2>
            <p>Dear Parent,</p>
            <p>Please find the attendance report for <b>${item.name}</b>:</p>
            <ul>
              <li>Total Working Days: ${item.total}</li>
              <li>Days Present: ${item.present}</li>
              <li>Attendance Percentage: ${item.percent}%</li>
              <li>Status: <b>${item.status}</b></li>
            </ul>
            <p>Regards,<br/>Bharat Vidya LMS</p>
          </div>
        `;
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: item.parent_email,
            subject: `Attendance Report: ${item.name} - ${month}`,
            html,
            type: 'attendance_report'
          })
        });

        await supabase.from('message_logs').insert({
          recipient: item.parent_email,
          subject: `Attendance Report: ${item.name}`,
          message: html,
          type: 'attendance_report'
        });
      }
      alert("Reports sent to all parents! ✓");
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="google-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg">Report: {month} (Class {selectedClass}-{selectedSection})</h3>
        <div className="flex gap-2">
          <button className="google-button-secondary text-xs flex items-center gap-2"><Download size={14} /> Export PDF</button>
          <button onClick={sendReports} disabled={loading} className="google-button-primary text-xs">
            {loading ? 'Sending...' : 'Send Reports to Parents'}
          </button>
        </div>
      </div>
      <div className="overflow-hidden border border-gray-100 rounded-lg">
        <table className="w-full text-left">
          <thead className="bg-[#f8f9fa] border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Roll</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Name</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Days</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Present</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">%</th>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-400">Loading report...</td></tr>
            ) : report.map(r => (
              <tr key={r.id}>
                <td className="px-4 py-3 text-sm font-bold">{r.roll_no}</td>
                <td className="px-4 py-3 text-sm font-medium">{r.name}</td>
                <td className="px-4 py-3 text-sm">{r.total}</td>
                <td className="px-4 py-3 text-sm">{r.present}</td>
                <td className="px-4 py-3 text-sm font-bold">{r.percent}%</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${r.color}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ParentAttendanceView({ childData }: any) {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (childData) fetchChildAttendance();
  }, [childData]);

  const fetchChildAttendance = async () => {
    const { data } = await supabase.from('attendance').select('*').eq('student_id', childData.id).order('date', { ascending: false });
    if (data) setHistory(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Child's Attendance</h2>
          <p className="text-sm text-gray-500 uppercase tracking-widest font-bold text-[#1a73e8]">{childData?.name} • Grade {childData?.class}-{childData?.section}</p>
        </div>
        <div className="google-card px-4 py-2 bg-white border-blue-100 flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Monthly Avg</p>
            <p className="text-lg font-bold text-[#1a73e8]">92.5%</p>
          </div>
          <CheckCircle2 className="text-green-500" />
        </div>
      </div>

      <div className="google-card p-6">
        <h3 className="font-bold text-gray-800 mb-6">Recent Records</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {history.map(h => (
            <div key={h.id} className={`p-4 rounded-xl border flex items-center justify-between ${h.status === 'present' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
              <div>
                <p className="text-xs font-bold text-gray-500 mb-1">{h.date}</p>
                <p className={`text-sm font-bold uppercase ${h.status === 'present' ? 'text-green-700' : 'text-red-700'}`}>{h.status}</p>
              </div>
              {h.status === 'present' ? <CheckCircle2 className="text-green-500" size={20} /> : <X className="text-red-500" size={20} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ ASSIGNMENTS VIEW ============
function AssignmentsView({ profile, childData }: any) {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', class: '10', section: 'A', due_date: '' });
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);

  useEffect(() => {
    fetchAssignments();
  }, [profile, childData]);

  const fetchAssignments = async () => {
    if (profile.role === ROLES.PARENT && childData) {
      // Fetch specifically for child's class and include their status
      const { data } = await supabase
        .from('assignments')
        .select('*, assignment_submissions!inner(*)')
        .eq('class', childData.class)
        .eq('section', childData.section)
        .eq('assignment_submissions.student_id', childData.id);
      if (data) setAssignments(data);
    } else {
      const { data } = await supabase.from('assignments').select('*, assignment_submissions(*)');
      if (data) setAssignments(data);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Create Assignment
      const { data: ass, error } = await supabase.from('assignments').insert(formData).select().single();
      if (error) throw error;

      // 2. Backfill (USE CASE T4)
      const { data: stu } = await supabase.from('students').select('id').eq('class', formData.class).eq('section', formData.section);
      if (stu && stu.length > 0) {
        const statuses = stu.map(s => ({ assignment_id: ass.id, student_id: s.id, status: 'pending' }));
        await supabase.from('assignment_submissions').insert(statuses);
      }

      setIsModalOpen(false);
      fetchAssignments();
      alert(`Assignment created for ${stu?.length || 0} students!`);
    } catch (err: any) { alert(err.message); }
  };

  const toggleStatus = async (assignmentId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      const studentId = childData?.id; // In parent view

      const { error } = await supabase
        .from('assignment_submissions')
        .update({ status: newStatus, completed_at: newStatus === 'completed' ? new Date().toISOString() : null })
        .eq('assignment_id', assignmentId)
        .eq('student_id', studentId);

      if (error) throw error;
      fetchAssignments();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Assignments</h2>
          <p className="text-sm text-gray-500">Track homework, projects, and submission status.</p>
        </div>
        {profile.role !== ROLES.PARENT && (
          <button onClick={() => setIsModalOpen(true)} className="google-button-primary flex items-center gap-2">
            <FileText size={18} /> Create Assignment
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assignments.map(a => {
          const sub = a.assignment_submissions?.[0];
          const isCompleted = sub?.status === 'completed';

          // Calculate progress for teachers
          const totalSubmissions = a.assignment_submissions?.length || 0;
          const completedCount = a.assignment_submissions?.filter((s: any) => s.status === 'completed').length || 0;
          const progress = totalSubmissions > 0 ? (completedCount / totalSubmissions) * 100 : 0;

          return (
            <div key={a.id} className={`google-card group hover:scale-[1.01] duration-300 ${isCompleted ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-orange-500'}`}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#1a73e8] transition-colors">{a.title}</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Grade {a.class}-{a.section}</p>
                  </div>
                  {profile.role === ROLES.PARENT ? (
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {isCompleted ? 'Completed' : 'Pending'}
                    </span>
                  ) : (
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-500">{completedCount}/{totalSubmissions} Done</p>
                      <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-[#1a73e8]" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-6 line-clamp-2">{a.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2 text-xs text-gray-400 font-medium uppercase">
                    <Clock size={14} /> Due: {a.due_date}
                  </div>
                  {profile.role === ROLES.PARENT ? (
                    <button
                      onClick={() => toggleStatus(a.id, sub?.status)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-md transition-all ${isCompleted ? 'text-gray-400 hover:text-orange-500' : 'text-[#1a73e8] hover:bg-blue-50 border border-blue-100'}`}
                    >
                      {isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedAssignment(a);
                        setIsDetailModalOpen(true);
                      }}
                      className="text-xs font-bold text-[#1a73e8] hover:bg-blue-50 px-3 py-1.5 rounded-md border border-blue-100"
                    >
                      View Details
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isDetailModalOpen && selectedAssignment && (
        <AssignmentDetailModal
          assignment={selectedAssignment}
          onClose={() => setIsDetailModalOpen(false)}
          onUpdate={fetchAssignments}
        />
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-[#1a73e8] p-6 text-white flex justify-between items-center rounded-t-2xl">
              <h3 className="text-xl font-bold">New Assignment</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateAssignment} className="p-8 space-y-4">
              <input required className="google-input" placeholder="Assignment Title"
                value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              <textarea className="google-input" rows={3} placeholder="Description..."
                value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <select className="google-input" value={formData.class} onChange={e => setFormData({ ...formData, class: e.target.value })}>
                  {GRADES.map(g => <option key={g} value={g}>Class {g}</option>)}
                </select>
                <select className="google-input" value={formData.section} onChange={e => setFormData({ ...formData, section: e.target.value })}>
                  {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                </select>
              </div>
              <input required type="date" className="google-input" value={formData.due_date}
                onChange={e => setFormData({ ...formData, due_date: e.target.value })} />
              <button type="submit" className="w-full google-button-primary py-3 mt-4">Broadcast Assignment</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ FEES VIEW ============
function FeesView({ profile, childData }: any) {
  const [fees, setFees] = useState<any[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchFees();
  }, [profile, childData]);

  const fetchFees = async () => {
    const query = supabase.from('fees').select('*, students(*)');
    if (profile.role === ROLES.PARENT && childData) query.eq('student_id', childData.id);
    const { data } = await query;
    if (data) setFees(data);
  };

  const markPaid = async (id: string) => {
    await supabase.from('fees').update({ status: 'paid', paid_date: new Date().toISOString().split('T')[0] }).eq('id', id);
    fetchFees();
  };

  const sendFeeReminders = async () => {
    setSending(true);
    try {
      // 1. Get all pending fees with student info
      const { data: pendingFees, error } = await supabase
        .from('fees')
        .select(`
          *,
          students (
            name,
            parent_email,
            class,
            section
          )
        `)
        .eq('status', 'pending');

      if (error) throw error;
      if (!pendingFees || pendingFees.length === 0) {
        alert("No pending fees found.");
        return;
      }

      // 2. Group by parent email
      const shipments: Record<string, any> = {};
      pendingFees.forEach((fee: any) => {
        const email = fee.students.parent_email;
        if (!email) return;
        if (!shipments[email]) {
          shipments[email] = {
            studentName: fee.students.name,
            fees: [],
            total: 0
          };
        }
        shipments[email].fees.push(fee);
        shipments[email].total += Number(fee.amount);
      });

      // 3. Send emails
      for (const [email, data] of Object.entries(shipments)) {
        const html = `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2 style="color: #1a73e8;">Fee Payment Reminder</h2>
            <p>Dear Parent,</p>
            <p>This is a reminder regarding pending fees for <b>${data.studentName}</b>:</p>
            <ul>
              ${data.fees.map((f: any) => `<li>${f.month}: ₹${f.amount}</li>`).join('')}
            </ul>
            <p><b>Total Amount Due: ₹${data.total}</b></p>
            <p>Please clear the dues at the school office at your earliest convenience.</p>
            <hr />
            <p style="font-size: 12px; color: #666;">This is an automated message from Bharat Vidya LMS.</p>
          </div>
        `;

        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email,
            subject: `Fee Reminder - ${data.studentName}`,
            html,
            type: 'fee_reminder'
          })
        });

        // 4. Log to message_logs
        await supabase.from('message_logs').insert({
          recipient: email,
          subject: `Fee Reminder - ${data.studentName}`,
          message: html,
          type: 'fee_reminder'
        });
      }

      alert(`Reminders sent to ${Object.keys(shipments).length} parents! ✓`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Fees Management</h2>
          <p className="text-sm text-gray-500">Track tuition fees and payment status.</p>
        </div>
        {profile.role !== ROLES.PARENT && (
          <button
            onClick={sendFeeReminders}
            disabled={sending}
            className="google-button-primary flex items-center gap-2"
          >
            <Bell size={18} /> {sending ? 'Sending...' : 'Send Fee Reminders'}
          </button>
        )}
      </div>

      <div className="google-card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#f8f9fa] border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Student</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Month</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {fees.map(f => (
              <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium">{f.students?.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{f.month}</td>
                <td className="px-6 py-4 text-sm font-bold">₹{f.amount}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${f.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700 animate-pulse'}`}>
                    {f.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {profile.role !== ROLES.PARENT && f.status === 'pending' && (
                    <button onClick={() => markPaid(f.id)} className="text-xs font-bold text-[#1a73e8] hover:underline">Mark Paid</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============ ADMIN PANEL VIEW ============
function AdminPanelView({ profile }: any) {
  if (profile.role === ROLES.PARENT) return <RestrictedView />;

  const [users, setUsers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'onboarding' | 'linking' | 'notices' | 'history'>('onboarding');

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    if (activeTab === 'onboarding') {
      const { data } = await supabase.from('profiles').select('*').eq('role', ROLES.PARENT);
      if (data) setUsers(data);
    } else if (activeTab === 'linking') {
      const [u, s] = await Promise.all([
        supabase.from('profiles').select('*').eq('role', ROLES.PARENT),
        supabase.from('students').select('*')
      ]);
      if (u.data) setUsers(u.data);
      if (s.data) setStudents(s.data);
    } else if (activeTab === 'history') {
      const { data } = await supabase.from('message_logs').select('*').order('created_at', { ascending: false });
      if (data) setLogs(data);
    }
  };

  const promoteToTeacher = async (userId: string) => {
    await supabase.from('profiles').update({ role: ROLES.TEACHER }).eq('id', userId);
    fetchAdminData();
    alert("User promoted to Teacher! ✓");
  };

  const linkParent = async (userId: string, studentId: string) => {
    await supabase.from('profiles').update({ linked_student_id: studentId }).eq('id', userId);
    fetchAdminData();
    alert("Parent linked to Student! ✓");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Control Center</h2>
        <p className="text-sm text-gray-500">System-wide configurations and role management.</p>
      </div>

      <div className="flex border-b border-gray-200 w-full mb-8">
        <button onClick={() => setActiveTab('onboarding')} className={`px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'onboarding' ? 'border-[#1a73e8] text-[#1a73e8]' : 'border-transparent text-gray-400'}`}>Teacher Onboarding</button>
        <button onClick={() => setActiveTab('linking')} className={`px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'linking' ? 'border-[#1a73e8] text-[#1a73e8]' : 'border-transparent text-gray-400'}`}>Parent-Student Link</button>
        <button onClick={() => setActiveTab('notices')} className={`px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'notices' ? 'border-[#1a73e8] text-[#1a73e8]' : 'border-transparent text-gray-400'}`}>School Notices</button>
        <button onClick={() => setActiveTab('history')} className={`px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'history' ? 'border-[#1a73e8] text-[#1a73e8]' : 'border-transparent text-gray-400'}`}>Message History</button>
      </div>

      {activeTab === 'onboarding' && (
        <div className="google-card p-6">
          <h3 className="font-bold mb-4">Promote Users to Teacher Role</h3>
          <div className="space-y-3">
            {users.map(u => (
              <div key={u.id} className="flex justify-between items-center p-4 bg-[#fafbfc] rounded-xl border border-gray-100">
                <div>
                  <p className="font-bold">{u.name || u.email}</p>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">{u.email}</p>
                </div>
                <button onClick={() => promoteToTeacher(u.id)} className="google-button-secondary text-xs font-bold border-blue-100 text-[#1a73e8]">Promote to Teacher</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'linking' && (
        <div className="google-card p-6">
          <h3 className="font-bold mb-4">Associate Parent with Student Record</h3>
          <div className="space-y-3">
            {users.map(u => (
              <div key={u.id} className="flex flex-col md:flex-row gap-4 justify-between items-center p-4 bg-[#fafbfc] rounded-xl border border-gray-100">
                <div>
                  <p className="font-bold">{u.name}</p>
                  <p className="text-xs text-blue-600 font-bold">{u.linked_student_id ? 'Already Linked' : 'Unlinked Account'}</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <select
                    className="google-input text-xs h-10 min-w-[200px]"
                    onChange={(e) => linkParent(u.id, e.target.value)}
                    defaultValue={u.linked_student_id || ''}
                  >
                    <option value="">Select Student...</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.class}-{s.section})</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="google-card p-6">
          <h3 className="font-bold mb-4">Past Notifications</h3>
          <div className="space-y-4">
            {logs.map(log => (
              <div key={log.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold text-gray-900">{log.subject}</p>
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold uppercase">{log.type}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">To: {log.recipient}</p>
                <div className="text-xs text-gray-400">{new Date(log.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NoticeSender({ profile }: any) {
  const [targetClass, setTargetClass] = useState('All');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendNotice = async () => {
    if (!subject || !message) return alert("Please fill all fields");
    setSending(true);

    try {
      // 1. Fetch relevant student/parent emails
      let query = supabase.from('students').select('parent_email');
      if (targetClass !== 'All') {
        query = query.eq('class', targetClass);
      }
      const { data: students, error } = await query;

      if (error) throw error;
      const emails = Array.from(new Set(students?.map(s => s.parent_email).filter(Boolean)));

      if (emails.length === 0) {
        alert("No parent emails found for selection.");
        return;
      }

      // 2. Send emails
      for (const email of emails) {
        const html = `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e8f0fe; border-radius: 8px;">
            <div style="background-color: #1a73e8; padding: 10px; border-radius: 4px; color: white;">
              <h1 style="margin: 0; font-size: 20px;">Bharat Vidya School - Notice</h1>
            </div>
            <div style="padding: 20px 0;">
              <h2 style="color: #333;">${subject}</h2>
              <p style="color: #555; line-height: 1.6;">${message}</p>
            </div>
            <hr />
            <p style="font-size: 12px; color: #666;">Sent by School Administration via Bharat Vidya LMS.</p>
          </div>
        `;

        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email,
            subject: `School Notice: ${subject}`,
            html,
            type: 'notice'
          })
        });

        // 3. Log to message_logs
        await supabase.from('message_logs').insert({
          recipient: email!,
          subject,
          message: html,
          type: 'notice'
        });
      }

      alert(`Notice sent to ${emails.length} parents! ✓`);
      setSubject('');
      setMessage('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="google-card p-8 bg-blue-50/30 border-dashed">
      <div className="max-w-xl">
        <h3 className="text-xl font-bold mb-2">Send Broadcast Notice</h3>
        <p className="text-sm text-gray-600 mb-6">This will send an email notification via Resend API to all registered parents.</p>
        <div className="space-y-4">
          <select
            className="google-input"
            value={targetClass}
            onChange={e => setTargetClass(e.target.value)}
          >
            <option value="All">All Classes</option>
            {GRADES.map(g => <option key={g} value={g}>Class {g}</option>)}
          </select>
          <input
            className="google-input"
            placeholder="Subject (e.g. Annual Day Celebration)"
            value={subject}
            onChange={e => setSubject(e.target.value)}
          />
          <textarea
            className="google-input"
            rows={5}
            placeholder="Write your message here..."
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
          <button
            onClick={handleSendNotice}
            disabled={sending}
            className="google-button-primary w-full py-4 font-bold flex items-center justify-center gap-2 shadow-xl shadow-blue-200"
          >
            <Send size={18} /> {sending ? 'Sending...' : 'Send Notice'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AssignmentDetailModal({ assignment, onClose, onUpdate }: any) {
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    fetchSubmissions();
  }, [assignment]);

  const fetchSubmissions = async () => {
    const { data } = await supabase
      .from('assignment_submissions')
      .select('*, students(*)')
      .eq('assignment_id', assignment.id);
    if (data) setSubmissions(data);
  };

  const toggleStudentStatus = async (sub: any) => {
    const newStatus = sub.status === 'completed' ? 'pending' : 'completed';
    await supabase
      .from('assignment_submissions')
      .update({ status: newStatus, completed_at: newStatus === 'completed' ? new Date().toISOString() : null })
      .eq('id', sub.id);
    fetchSubmissions();
    onUpdate();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="bg-[#1a73e8] p-6 text-white flex justify-between items-center rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold">{assignment.title}</h3>
            <p className="text-white/80 text-xs">Tracking completion for Class {assignment.class}-{assignment.section}</p>
          </div>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f8f9fa] border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Roll</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Student</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {submissions.map(sub => (
                <tr key={sub.id} className={sub.status === 'completed' ? 'bg-green-50/30' : ''}>
                  <td className="px-4 py-3 text-sm font-bold">{sub.students?.roll_no}</td>
                  <td className="px-4 py-3 text-sm">{sub.students?.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${sub.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStudentStatus(sub)}
                      className="text-xs font-bold text-[#1a73e8] hover:underline"
                    >
                      Toggle Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RestrictedView() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="bg-red-50 p-6 rounded-full mb-6">
        <AlertCircle size={48} className="text-red-600" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Access Restricted</h2>
      <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
        This section is reserved for School Administrators and Teachers only.
        If you require access, please contact the school office.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="google-button-primary px-8 py-3 font-bold shadow-lg shadow-blue-200"
      >
        Back to Dashboard
      </button>
    </div>
  );
}
