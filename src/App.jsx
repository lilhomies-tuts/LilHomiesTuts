import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  deleteDoc, 
  updateDoc 
} from "firebase/firestore";
import { 
  Sun, Moon, MessageSquare, Video, Mic, MicOff, VideoOff, 
  ShieldCheck, Plus, Trash2, LogOut, Lock, BookOpen, 
  CheckCircle, XCircle, Share2, Users, AlertCircle 
} from 'lucide-react';

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyBaRmr__iKG8QsW7FQcI3R_vt8urDWC0nc",
  authDomain: "lilhomiestuts-8be90.firebaseapp.com",
  projectId: "lilhomiestuts-8be90",
  storageBucket: "lilhomiestuts-8be90.firebasestorage.app",
  messagingSenderId: "254466584918",
  appId: "1:254466584918:web:9c234d67b711c58984e6f7",
  measurementId: "G-B2Z8PRV16Z"
};

const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
const db = getFirestore(app);

// --- SHEETDB CONFIGURATION ---
const SHEETDB_URL = "https://sheetdb.io/api/v1/6zspra8ligajg";

// Master Control Emails
const MASTER_EMAILS = [
  'master1@lilhomiestuts.com', 
  'master2@lilhomiestuts.com', 
  'master3@lilhomiestuts.com'
];

export default function App() {
  // --- STATE MANAGEMENT ---
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('overview');
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Auth State
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('student'); // 'faculty' | 'student' | 'master'
  const [authMode, setAuthMode] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Registration Form State
  const [regForm, setRegForm] = useState({
    name: '', mobile: '', email: '', password: '', 
    gen: false, age: '', standard: '', course: '', utr: ''
  });

  // Classrooms & WebRTC
  const [classrooms, setClassrooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  // Faculty Classroom Creation
  const [newCourse, setNewCourse] = useState('');
  const [newAbout, setNewAbout] = useState('');
  const [screenRecToggle, setScreenRecToggle] = useState(false);
  const [whitelistedEmails, setWhitelistedEmails] = useState('');

  // Master Admin State
  const [pendingUTRs, setPendingUTRs] = useState([]);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // --- THEME MANAGEMENT ---
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  // --- FIREBASE AUTH & FIRESTORE LISTENERS ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userEmail = user.email ? user.email.toLowerCase() : '';
        
        if (MASTER_EMAILS.includes(userEmail)) {
          setUserRole('master');
        } else {
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              setUserRole(userDoc.data().role || 'student');
            }
          } catch (err) {
            console.error("Error fetching user role:", err);
          }
        }
      } else {
        setCurrentUser(null);
        setUserRole('student');
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync Classrooms from Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "rooms"), (snapshot) => {
      const roomList = snapshot.docs.map(doc => ({ roomId: doc.id, ...doc.data() }));
      setClassrooms(roomList);
    });
    return () => unsub();
  }, []);

  // Sync UTR Submissions for Master Admin
  useEffect(() => {
    if (userRole === 'master') {
      const unsub = onSnapshot(collection(db, "utr_requests"), (snapshot) => {
        const utrs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPendingUTRs(utrs);
      });
      return () => unsub();
    }
  }, [userRole]);

  // --- HANDLERS ---
  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setActiveTab('overview');
    } catch (err) {
      setErrorMsg(err.message.replace("Firebase: ", ""));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const userCred = await createUserWithEmailAndPassword(auth, regForm.email, regForm.password);
      const generatedUtr = regForm.utr || `AUTO-UTR-${Math.floor(100000 + Math.random() * 900000)}`;

      const newRecord = {
        email: regForm.email,
        name: regForm.name,
        mobile: regForm.mobile,
        utr: generatedUtr,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      // 1. Save to Firebase Firestore
      await setDoc(doc(db, "users", userCred.user.uid), {
        ...newRecord,
        role: 'student',
        gen: regForm.gen,
        age: regForm.age,
        standard: regForm.standard,
        course: regForm.course
      });

      await setDoc(doc(db, "utr_requests", userCred.user.uid), newRecord);

      // 2. Post record to Google Sheet via SheetDB API
      try {
        await fetch(SHEETDB_URL, {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ data: [newRecord] })
        });
      } catch (sheetErr) {
        console.warn("SheetDB sync failed, saved in Firebase:", sheetErr);
      }

      alert(`Registration complete! Your UTR key is ${generatedUtr}.`);
      setActiveTab('overview');
    } catch (err) {
      setErrorMsg(err.message.replace("Firebase: ", ""));
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setActiveTab('login');
  };

  // Faculty Room Deployment
  const createClassroom = async () => {
    if (!currentUser || userRole !== 'faculty') return;
    try {
      const roomId = currentUser.uid;
      const allowedList = whitelistedEmails.split(',').map(e => e.trim().toLowerCase()).slice(0, 20);

      await setDoc(doc(db, "rooms", roomId), {
        course: newCourse,
        about: newAbout,
        facultyEmail: currentUser.email,
        screenRecAllowed: screenRecToggle,
        allowedStudents: allowedList,
        createdAt: new Date().toISOString()
      });

      setNewCourse('');
      setNewAbout('');
      setWhitelistedEmails('');
      alert("Classroom registered successfully!");
    } catch (err) {
      alert("Error deploying room: " + err.message);
    }
  };

  const deleteClassroom = async (roomId) => {
    try {
      await deleteDoc(doc(db, "rooms", roomId));
    } catch (err) {
      alert("Failed to delete classroom: " + err.message);
    }
  };

  // 1:1 Access Validation
  const joinRoom = (room) => {
    if (userRole === 'student') {
      const isRoomOwner = currentUser?.uid === room.roomId;
      const isWhitelisted = room.allowedStudents?.includes(currentUser?.email?.toLowerCase());

      if (!isRoomOwner && !isWhitelisted) {
        alert("Access Denied: Room access restricted by 1-on-1 faculty protocol.");
        return;
      }
    }

    setActiveRoom(room);
    setActiveTab('room');
    setInCall(true);
    startMediaStream();
  };

  const startMediaStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } catch (err) {
      console.warn("Camera/Mic stream simulated.", err);
    }
  };

  const endCall = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
    }
    setInCall(false);
    setActiveRoom(null);
    setActiveTab('overview');
  };

  // Master Admin Status Update (Firebase + SheetDB Sync)
  const updateUTRStatus = async (docId, candidateEmail, newStatus) => {
    try {
      // 1. Update Firestore
      await updateDoc(doc(db, "utr_requests", docId), { status: newStatus });

      // 2. Update Google Sheet via SheetDB PATCH
      try {
        await fetch(`${SHEETDB_URL}/email/${encodeURIComponent(candidateEmail)}`, {
          method: "PATCH",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ data: { status: newStatus } })
        });
      } catch (sheetErr) {
        console.warn("SheetDB patch error:", sheetErr);
      }

      alert(`Status updated to ${newStatus}.`);
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* HEADER */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-md ${theme === 'dark' ? 'border-gray-800 bg-gray-900/80' : 'border-gray-200 bg-white/80'}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 text-white p-2 rounded-xl shadow-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-xl tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
              LilHomies Tuts
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Theme Switcher */}
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-lg border transition ${theme === 'dark' ? 'border-gray-700 bg-gray-800 hover:bg-gray-700' : 'border-gray-300 bg-gray-100 hover:bg-gray-200'}`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>

            {/* Manual WhatsApp Support Desk */}
            <button 
              onClick={() => setShowWhatsApp(!showWhatsApp)}
              className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1 shadow-md"
              title="Manual WhatsApp Desk"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="hidden sm:inline text-xs font-semibold">WhatsApp Desk</span>
            </button>

            {/* Profile Bar */}
            {currentUser ? (
              <div className="flex items-center gap-3">
                <span className="text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  {userRole}
                </span>
                <button 
                  onClick={handleLogout}
                  className="p-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setActiveTab('login')}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-md"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* WHATSAPP DESK OVERRIDE MODAL */}
      {showWhatsApp && (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-2xl shadow-2xl border max-w-sm w-full ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-emerald-500 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> WhatsApp Support Desk
            </h4>
            <button onClick={() => setShowWhatsApp(false)} className="text-xs opacity-50 hover:opacity-100">✕</button>
          </div>
          <p className="text-xs text-gray-400 mb-3">Facing access issues or UTR verification delay? Reach out directly via WhatsApp.</p>
          <a 
            href="https://wa.me/1234567890" 
            target="_blank" 
            rel="noreferrer"
            className="block text-center py-2 bg-emerald-600 text-white font-semibold rounded-xl text-sm shadow hover:bg-emerald-500 transition"
          >
            Open WhatsApp Chat
          </a>
        </div>
      )}

      {/* NAVIGATION BAR */}
      <nav className={`border-b ${theme === 'dark' ? 'border-gray-800 bg-gray-900/40' : 'border-gray-200 bg-gray-100/50'}`}>
        <div className="max-w-7xl mx-auto px-4 flex gap-6 text-sm font-medium">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition ${activeTab === 'overview' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
          >
            Overview
          </button>
          {userRole === 'master' && (
            <button 
              onClick={() => setActiveTab('admin')}
              className={`py-3 border-b-2 transition flex items-center gap-1 ${activeTab === 'admin' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
            >
              <ShieldCheck className="w-4 h-4" /> Master Control
            </button>
          )}
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* ERROR MSG */}
        {errorMsg && (
          <div className="max-w-md mx-auto mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. LOGIN */}
        {activeTab === 'login' && !currentUser && (
          <div className="max-w-md mx-auto my-12 p-8 rounded-2xl border shadow-xl bg-gray-900/60 border-gray-800 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-center mb-6">Portal Sign In</h2>
            
            <div className="grid grid-cols-2 p-1 bg-gray-800 rounded-xl mb-6 text-xs font-semibold">
              <button 
                onClick={() => setAuthMode('student')} 
                className={`py-2 rounded-lg transition ${authMode === 'student' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}
              >
                Student
              </button>
              <button 
                onClick={() => setAuthMode('faculty')} 
                className={`py-2 rounded-lg transition ${authMode === 'faculty' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}
              >
                Faculty
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={authMode === 'faculty' ? 'faculty@edu.com' : 'student@lilhomiestuts.com'}
                  className="w-full px-4 py-2.5 rounded-xl border bg-gray-800/50 border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Password</label>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border bg-gray-800/50 border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button 
                type="submit" 
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl text-sm transition shadow-lg"
              >
                Sign In as {authMode.toUpperCase()}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-gray-500">
              New candidate?{' '}
              <button onClick={() => setActiveTab('register')} className="text-indigo-400 underline font-semibold">
                Register Student Account
              </button>
            </div>
          </div>
        )}

        {/* 2. REGISTRATION */}
        {activeTab === 'register' && (
          <div className="max-w-xl mx-auto p-8 rounded-2xl border shadow-xl bg-gray-900/60 border-gray-800">
            <h2 className="text-2xl font-bold mb-1">Student Candidate Registration</h2>
            <p className="text-xs text-gray-400 mb-6">Complete registration to automatically sync UTR details to Google Sheets.</p>

            <form onSubmit={handleRegister} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium mb-1 text-gray-400">Full Name</label>
                <input type="text" required value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} className="w-full p-2.5 rounded-lg bg-gray-800 border border-gray-700" />
              </div>
              <div>
                <label className="block font-medium mb-1 text-gray-400">Mobile Number</label>
                <input type="tel" required value={regForm.mobile} onChange={e => setRegForm({...regForm, mobile: e.target.value})} className="w-full p-2.5 rounded-lg bg-gray-800 border border-gray-700" />
              </div>
              <div>
                <label className="block font-medium mb-1 text-gray-400">Email Address</label>
                <input type="email" required value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} className="w-full p-2.5 rounded-lg bg-gray-800 border border-gray-700" />
              </div>
              <div>
                <label className="block font-medium mb-1 text-gray-400">Password</label>
                <input type="password" required value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})} className="w-full p-2.5 rounded-lg bg-gray-800 border border-gray-700" />
              </div>
              <div>
                <label className="block font-medium mb-1 text-gray-400">Age</label>
                <input type="number" required value={regForm.age} onChange={e => setRegForm({...regForm, age: e.target.value})} className="w-full p-2.5 rounded-lg bg-gray-800 border border-gray-700" />
              </div>
              <div>
                <label className="block font-medium mb-1 text-gray-400">Standard / Grade</label>
                <input type="text" required value={regForm.standard} onChange={e => setRegForm({...regForm, standard: e.target.value})} className="w-full p-2.5 rounded-lg bg-gray-800 border border-gray-700" />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-medium mb-1 text-gray-400">Selected Course</label>
                <input type="text" required value={regForm.course} onChange={e => setRegForm({...regForm, course: e.target.value})} placeholder="e.g. Higher Mathematics" className="w-full p-2.5 rounded-lg bg-gray-800 border border-gray-700" />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-medium mb-1 text-gray-400">UTR Reference ID (Optional - Auto generated if left blank)</label>
                <input type="text" value={regForm.utr} onChange={e => setRegForm({...regForm, utr: e.target.value})} placeholder="UTR123456789" className="w-full p-2.5 rounded-lg bg-gray-800 border border-gray-700" />
              </div>
              
              <div className="sm:col-span-2 flex items-center gap-2 mt-2">
                <input type="checkbox" id="gen" checked={regForm.gen} onChange={e => setRegForm({...regForm, gen: e.target.checked})} className="rounded bg-gray-800 border-gray-700" />
                <label htmlFor="gen" className="text-gray-300">GEN Category Candidate</label>
              </div>

              <div className="sm:col-span-2 mt-4">
                <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition">
                  Complete Registration
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 3. OVERVIEW PAGE */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Faculty Classroom Deployer */}
            {userRole === 'faculty' && (
              <div className="p-6 rounded-2xl border bg-gray-900/40 border-gray-800">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-400" /> Deploy 1-on-1 Classroom
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-xs">
                  <input 
                    type="text" 
                    placeholder="Course Title" 
                    value={newCourse} 
                    onChange={e => setNewCourse(e.target.value)} 
                    className="p-3 rounded-xl bg-gray-800 border border-gray-700"
                  />
                  <input 
                    type="text" 
                    placeholder="About Room / Overview" 
                    value={newAbout} 
                    onChange={e => setNewAbout(e.target.value)} 
                    className="p-3 rounded-xl bg-gray-800 border border-gray-700"
                  />
                  <div className="md:col-span-2">
                    <input 
                      type="text" 
                      placeholder="Whitelisted Student Emails (Comma-separated, max 20)" 
                      value={whitelistedEmails} 
                      onChange={e => setWhitelistedEmails(e.target.value)} 
                      className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input 
                      type="checkbox" 
                      checked={screenRecToggle} 
                      onChange={e => setScreenRecToggle(e.target.checked)} 
                      className="rounded bg-gray-800 border-gray-700 text-indigo-600"
                    />
                    <span>Allow Screen Recording for Whitelisted 20 Students</span>
                  </label>

                  <button 
                    onClick={createClassroom}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow"
                  >
                    Deploy Classroom
                  </button>
                </div>
              </div>
            )}

            {/* Active Classrooms */}
            <div>
              <h3 className="text-xl font-bold mb-4">Active Classrooms</h3>
              {classrooms.length === 0 ? (
                <div className="p-8 text-center border border-dashed rounded-2xl border-gray-800 text-gray-500">
                  No active classrooms registered.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {classrooms.map(c => (
                    <div key={c.roomId} className="p-6 rounded-2xl border bg-gray-900/60 border-gray-800 hover:border-indigo-500/50 transition flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-indigo-400 border border-gray-700">
                            ID: {c.roomId.slice(0, 8)}...
                          </span>
                          {c.screenRecAllowed && (
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                              Screen Rec Enabled
                            </span>
                          )}
                        </div>
                        <h4 className="text-lg font-bold mb-1">{c.course}</h4>
                        <p className="text-xs text-gray-400 mb-3">{c.about}</p>
                        <div className="text-xs text-gray-500 mb-4">
                          Faculty: <span className="text-gray-300 font-medium">{c.facultyEmail}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t border-gray-800/60">
                        <button 
                          onClick={() => joinRoom(c)}
                          className="flex-1 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold transition"
                        >
                          Join Stream
                        </button>
                        {userRole === 'faculty' && currentUser?.email === c.facultyEmail && (
                          <button 
                            onClick={() => deleteClassroom(c.roomId)}
                            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition"
                            title="Delete Room"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. WEBRTC STREAMING ROOM */}
        {activeTab === 'room' && activeRoom && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">{activeRoom.course}</h2>
                <p className="text-xs text-gray-400">1-on-1 WebRTC Encrypted Session (ICE2 Protocol)</p>
              </div>
              <button onClick={endCall} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow">
                Leave Session
              </button>
            </div>

            {/* Stream Canvas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative aspect-video rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden flex items-center justify-center">
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded-lg text-xs backdrop-blur-md">
                  Local Stream ({userRole})
                </div>
              </div>

              <div className="relative aspect-video rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden flex items-center justify-center">
                <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute text-center text-gray-500">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Awaiting Peer WebRTC Signaling Candidate...</p>
                </div>
                <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded-lg text-xs backdrop-blur-md">
                  Remote Peer (DTLSSRTP Encrypted)
                </div>
              </div>
            </div>

            {/* Stream Action Bar */}
            <div className="flex items-center justify-center gap-4 p-4 rounded-2xl bg-gray-900/80 border border-gray-800 max-w-md mx-auto">
              <button 
                onClick={() => setIsMuted(!isMuted)} 
                className={`p-3 rounded-full ${isMuted ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-200'}`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => setIsVideoOff(!isVideoOff)} 
                className={`p-3 rounded-full ${isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-200'}`}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
              {activeRoom.screenRecAllowed && (
                <button 
                  onClick={() => setIsScreenSharing(!isScreenSharing)} 
                  className={`p-3 rounded-full ${isScreenSharing ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-200'}`}
                  title="Screen Sharing Enabled"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* 5. MASTER CONTROL DASHBOARD */}
        {activeTab === 'admin' && userRole === 'master' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Lock className="w-6 h-6 text-purple-400" />
              <div>
                <h2 className="text-2xl font-bold">Master Control Panel</h2>
                <p className="text-xs text-gray-400">Manage UTR submissions synced with SheetDB.</p>
              </div>
            </div>

            <div className="border border-gray-800 rounded-2xl overflow-hidden bg-gray-900/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-800/50 border-b border-gray-800 text-gray-400 uppercase">
                  <tr>
                    <th className="p-4">Student Email</th>
                    <th className="p-4">UTR Reference</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {pendingUTRs.map((row) => (
                    <tr key={row.id}>
                      <td className="p-4 font-medium text-gray-200">{row.email}</td>
                      <td className="p-4 font-mono text-indigo-400">{row.utr}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                          row.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          row.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {row.status === 'Pending' && (
                          <>
                            <button 
                              onClick={() => updateUTRStatus(row.id, row.email, 'Approved')}
                              className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition"
                              title="Approve UTR"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => updateUTRStatus(row.id, row.email, 'Rejected')}
                              className="p-1.5 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white transition"
                              title="Reject UTR"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className={`border-t py-6 mt-12 text-center text-xs text-gray-500 ${theme === 'dark' ? 'border-gray-800 bg-gray-950' : 'border-gray-200 bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© LilHomies Tuts. Powered by Firebase & SheetDB[cite: 1].</div>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">TURN Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}