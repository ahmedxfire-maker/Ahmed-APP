import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cleanFirestoreData, handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import { 
  AppUser, 
  UserRole, 
  AccountStatus, 
  UserPermissions, 
  ActivityLog, 
  ActivityActionType 
} from '../types';

export const defaultSuperAdminPermissions: UserPermissions = {
  canAccessAdmin: true,
  canManageUsers: true,
  canManageRoles: true,
  canViewReports: true,
  canExportData: true,
  canDeleteData: true,
  canCreateReports: true,
  canCreatePests: true,
  canCreateLocations: true,
  canCreateControl: true,
  canViewOwnDataOnly: false,
  canEditProfile: true,
  allowedModules: ['dashboard', 'pests', 'reports', 'control', 'monthly', 'locations'],
  hiddenSections: []
};

export const defaultEmployeePermissions: UserPermissions = {
  canAccessAdmin: false,
  canManageUsers: false,
  canManageRoles: false,
  canViewReports: false,
  canExportData: false,
  canDeleteData: false,
  canCreateReports: true,
  canCreatePests: false,
  canCreateLocations: false,
  canCreateControl: false,
  canViewOwnDataOnly: true,
  canEditProfile: true,
  allowedModules: ['dashboard', 'pests', 'reports', 'control', 'monthly', 'locations'],
  hiddenSections: []
};

export const initialUsers: AppUser[] = [
  {
    id: 'USR-ADMIN-001',
    name: 'د. أحمد عبد الوهاب',
    username: 'admin',
    email: 'admin@moa.gov.eg',
    phoneNumber: '01012345678',
    password: 'admin123',
    status: 'active',
    role: 'super_admin',
    department: 'الإدارة المركزية للحجر الزراعي',
    jobTitle: 'رئيس الإدارة المركزية والمشرف العام على المنظومة',
    permissions: defaultSuperAdminPermissions,
    createdAt: '2026-01-01T08:00:00Z',
    notes: 'حساب المدير العام الفائق (Super Admin)'
  },
  {
    id: 'USR-EMP-002',
    name: 'م. محمود سمير النجار',
    username: 'employee',
    email: 'm.samir@moa.gov.eg',
    phoneNumber: '01198765432',
    password: 'user123',
    status: 'active',
    role: 'employee',
    department: 'مفتشية الحجر الزراعي - منفذ الإسكندرية',
    jobTitle: 'مهندس فحص وتتبع ميداني',
    permissions: defaultEmployeePermissions,
    createdAt: '2026-01-15T10:30:00Z',
    notes: 'مهندس رصد وبلاغات ميدانية'
  },
  {
    id: 'USR-EMP-003',
    name: 'م. سارة كمال الباز',
    username: 'sara_kamal',
    email: 'sara.kamal@moa.gov.eg',
    phoneNumber: '01234567890',
    password: 'sara123',
    status: 'active', // حالة  فعال 
    role: 'employee',
    department: 'معمل بحوث أمراض النبات - الجيزة',
    jobTitle: 'أخصائي تشخيص فيروسات ونيماتودا',
    permissions: defaultEmployeePermissions,
    createdAt: '2026-02-01T09:15:00Z',
    notes: 'حساب غير فعال حالياً للتجربة والتحكم الإداري'
  }
];

export const initialActivityLogs: ActivityLog[] = [
  {
    id: 'LOG-001',
    userId: 'USR-ADMIN-001',
    userName: 'د. أحمد عبد الوهاب',
    userRole: 'super_admin',
    action: 'login',
    details: 'تسجيل دخول ناجح إلى النظام من لوحة الإدارة',
    timestamp: '2026-02-20T08:30:00Z'
  },
  {
    id: 'LOG-002',
    userId: 'USR-ADMIN-001',
    userName: 'د. أحمد عبد الوهاب',
    userRole: 'super_admin',
    action: 'create_user',
    details: 'إنشاء حساب مستخدم جديد للمهندس: م. محمود سمير النجار',
    timestamp: '2026-02-20T09:00:00Z',
    targetId: 'USR-EMP-002'
  },
  {
    id: 'LOG-003',
    userId: 'USR-EMP-002',
    userName: 'م. محمود سمير النجار',
    userRole: 'employee',
    action: 'create_report',
    details: 'إضافة بلاغ رصد جديد للآفة: سوسة النخيل الحمراء (REP-2026-001)',
    timestamp: '2026-02-21T11:20:00Z',
    targetId: 'REP-2026-001'
  }
];

interface AuthContextType {
  currentUser: AppUser | null;
  users: AppUser[];
  activityLogs: ActivityLog[];
  isLoadingAuth: boolean;
  
  // Auth operations
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  switchUserDemo: (username: string) => boolean;
  
  // User Management operations (Super Admin)
  createUser: (userData: Omit<AppUser, 'id' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>;
  updateUser: (id: string, updates: Partial<AppUser>) => Promise<void>;
  deleteUser: (id: string) => Promise<{ success: boolean; error?: string }>;
  toggleUserStatus: (id: string) => Promise<void>;
  
  // Profile update (Self)
  updateProfile: (updates: { name: string; phoneNumber: string; password?: string; email?: string }) => Promise<void>;
  
  // Activity Logging
  logActivity: (action: ActivityActionType, details: string, targetId?: string) => Promise<void>;
  
  // Quick Permission Evaluator
  hasPermission: (permissionKey: keyof UserPermissions) => boolean;
  isSuperAdmin: boolean;
  isEmployee: boolean;

  // Batch import users from backup
  importUsersBatch: (importedUsers: AppUser[]) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem('egy_quarantine_users');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  // App starts with login page on boot (currentUser starts as null)
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  // Clear any legacy persisted login on start to ensure login is required on launch
  useEffect(() => {
    try {
      localStorage.removeItem('egy_quarantine_current_user');
      sessionStorage.removeItem('egy_quarantine_current_user');
    } catch {
      // Ignore storage errors
    }
  }, []);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('egy_quarantine_activity_logs');
    return saved ? JSON.parse(saved) : initialActivityLogs;
  });

  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(false);
  const seedingRef = useRef<boolean>(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('egy_quarantine_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('egy_quarantine_activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  // Firestore real-time synchronization for users
  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), async (snapshot) => {
      if (snapshot.empty && !seedingRef.current) {
        seedingRef.current = true;
        try {
          const batch = writeBatch(db);
          initialUsers.forEach(u => {
            batch.set(doc(db, 'users', u.id), u);
          });
          await batch.commit();
        } catch (err) {
          console.warn('Firestore seeding users note:', err);
        }
      } else if (!snapshot.empty) {
        const loaded: AppUser[] = [];
        snapshot.forEach(docSnap => {
          loaded.push(docSnap.data() as AppUser);
        });
        setUsers(loaded);
        // Refresh currentUser state if active
        if (currentUser) {
          const fresh = loaded.find(u => u.id === currentUser.id);
          if (fresh) {
            setCurrentUser(fresh);
          }
        }
      }
    }, (err) => {
      console.warn('Firestore users listener note:', err?.message || err);
    });

    const unsubLogs = onSnapshot(collection(db, 'activityLogs'), async (snapshot) => {
      if (snapshot.empty && !seedingRef.current) {
        try {
          const batch = writeBatch(db);
          initialActivityLogs.forEach(log => {
            batch.set(doc(db, 'activityLogs', log.id), log);
          });
          await batch.commit();
        } catch (err) {
          console.warn('Firestore seeding logs note:', err);
        }
      } else if (!snapshot.empty) {
        const loadedLogs: ActivityLog[] = [];
        snapshot.forEach(docSnap => {
          loadedLogs.push(docSnap.data() as ActivityLog);
        });
        loadedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setActivityLogs(loadedLogs);
      }
    }, (err) => {
      console.warn('Firestore logs listener note:', err?.message || err);
    });

    return () => {
      unsubUsers();
      unsubLogs();
    };
  }, []);

  const logActivity = async (action: ActivityActionType, details: string, targetId?: string) => {
    if (!currentUser) return;
    const logId = `LOG-${Date.now()}`;
    const newLog: ActivityLog = {
      id: logId,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      details,
      timestamp: new Date().toISOString(),
      ...(targetId ? { targetId } : {})
    };

    setActivityLogs(prev => [newLog, ...prev]);

    try {
      await setDoc(doc(db, 'activityLogs', logId), cleanFirestoreData(newLog));
    } catch (e) {
      console.warn('Failed to record activity log in cloud:', e);
    }
  };

  const login = (username: string, password: string): { success: boolean; error?: string } => {
    const trimmedUsername = username.trim().toLowerCase();
    const user = users.find(u => u.username.toLowerCase() === trimmedUsername);

    if (!user) {
      return { success: false, error: 'اسم المستخدم غير موجود بالنظام. يرجى التحقق وإعادة المحاولة.' };
    }

    if (user.password !== password) {
      return { success: false, error: 'كلمة المرور غير صحيحة. يرجى التأكد والمحاولة مجدداً.' };
    }

    if (user.status === 'inactive') {
      return { 
        success: false, 
        error: 'عفواً، تم تعطيل هذا الحساب أو أنه غير فعال حالياً. يرجى مراجعة المستخدم المدير لتفعيل الحساب.' 
      };
    }

    const updatedUser = { ...user, lastLoginAt: new Date().toISOString() };
    setCurrentUser(updatedUser);
    updateUser(user.id, { lastLoginAt: updatedUser.lastLoginAt });

    logActivity('login', `تسجيل دخول ناجح للمستخدم: ${user.name} (${user.role === 'super_admin' ? 'مدير' : 'موظف'})`);

    return { success: true };
  };

  const logout = () => {
    if (currentUser) {
      logActivity('logout', `تسجيل خروج المستخدم: ${currentUser.name}`);
    }
    setCurrentUser(null);
  };

  const switchUserDemo = (username: string): boolean => {
    const user = users.find(u => u.username === username);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const createUser = async (userData: Omit<AppUser, 'id' | 'createdAt'>): Promise<{ success: boolean; error?: string }> => {
    // Validate phone number required
    if (!userData.phoneNumber || userData.phoneNumber.trim().length < 8) {
      return { success: false, error: 'رقم الهاتف ضروريًا وإلزاميًا لإنشاء الحساب (8 أرقام على الأقل).' };
    }

    // Check username uniqueness
    const exists = users.some(u => u.username.toLowerCase() === userData.username.trim().toLowerCase());
    if (exists) {
      return { success: false, error: 'اسم المستخدم محجوز بالفعل. يرجى اختيار اسم مستخدم آخر.' };
    }

    const newId = `USR-${userData.role === 'super_admin' ? 'ADM' : 'EMP'}-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();
    const newUser: AppUser = {
      ...userData,
      id: newId,
      createdAt: now,
      createdById: currentUser?.id
    };

    setUsers(prev => [newUser, ...prev]);

    try {
      await setDoc(doc(db, 'users', newId), cleanFirestoreData(newUser));
      await logActivity(
        'create_user', 
        `إنشاء حساب مستخدم جديد: ${newUser.name} (${newUser.username}) بصلاحية ${newUser.role === 'super_admin' ? 'مدير' : 'موظف'}`,
        newId
      );
      return { success: true };
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string };
      if (err?.code === 'permission-denied' || err?.message?.includes('permissions')) {
        try {
          handleFirestoreError(e, OperationType.CREATE, `users/${newId}`);
        } catch (diagError) {
          console.warn('Firestore diagnostic error:', diagError);
        }
      } else {
        console.warn('Firestore user creation warning:', e);
      }
      return { success: true }; // Local write succeeded
    }
  };

  const updateUser = async (id: string, updates: Partial<AppUser>) => {
    const cleanedUpdates = cleanFirestoreData(updates);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...cleanedUpdates } : u));
    if (currentUser?.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...cleanedUpdates } : null);
    }

    try {
      await updateDoc(doc(db, 'users', id), cleanedUpdates);
      await logActivity('update_user', `تعديل بيانات المستخدم: ${id}`, id);
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string };
      if (err?.code === 'permission-denied' || err?.message?.includes('permissions')) {
        try {
          handleFirestoreError(e, OperationType.UPDATE, `users/${id}`);
        } catch (diagError) {
          console.warn('Firestore diagnostic error:', diagError);
        }
      } else {
        console.warn('Firestore updateUser note:', e);
      }
    }
  };

  const deleteUser = async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (currentUser?.id === id) {
      return { success: false, error: 'لا يمكنك حذف الحساب الخاص بك وأنت مسجل الدخول به.' };
    }

    const targetUser = users.find(u => u.id === id);
    setUsers(prev => prev.filter(u => u.id !== id));

    try {
      await deleteDoc(doc(db, 'users', id));
      await logActivity(
        'delete_user', 
        `حذف المستخدم: ${targetUser?.name || id} (${targetUser?.username})`, 
        id
      );
      return { success: true };
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string };
      if (err?.code === 'permission-denied' || err?.message?.includes('permissions')) {
        try {
          handleFirestoreError(e, OperationType.DELETE, `users/${id}`);
        } catch (diagError) {
          console.warn('Firestore diagnostic error:', diagError);
        }
      } else {
        console.warn('Firestore deleteUser note:', e);
      }
      return { success: true };
    }
  };

  const toggleUserStatus = async (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    const newStatus: AccountStatus = user.status === 'active' ? 'inactive' : 'active';
    await updateUser(id, { status: newStatus });

    await logActivity(
      'toggle_user_status', 
      `تغيير حالة حساب المستخدم (${user.name}) إلى: ${newStatus === 'active' ? 'فعال' : 'غير فعال'}`,
      id
    );
  };

  const updateProfile = async (updates: { name: string; phoneNumber: string; password?: string; email?: string }) => {
    if (!currentUser) return;
    const cleanUpdates: Partial<AppUser> = {
      name: updates.name,
      phoneNumber: updates.phoneNumber,
      ...(updates.email ? { email: updates.email } : {}),
      ...(updates.password ? { password: updates.password } : {})
    };

    await updateUser(currentUser.id, cleanUpdates);
    await logActivity('update_profile', `قام المستخدم ${currentUser.name} بتحديث بياناته الشخصية`, currentUser.id);
  };

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isEmployee = currentUser?.role === 'employee';

  const importUsersBatch = async (importedUsers: AppUser[]) => {
    if (!importedUsers || importedUsers.length === 0) return;
    const userMap = new Map<string, AppUser>(users.map(u => [u.id, u]));
    importedUsers.forEach(u => userMap.set(u.id, u));
    const merged = Array.from(userMap.values());
    setUsers(merged);
    localStorage.setItem('egy_quarantine_users', JSON.stringify(merged));

    try {
      const batch = writeBatch(db);
      importedUsers.forEach(u => {
        batch.set(doc(db, 'users', u.id), cleanFirestoreData(u), { merge: true });
      });
      await batch.commit();
    } catch (e) {
      console.warn('Firestore importUsersBatch note:', e);
    }
  };

  const hasPermission = (permissionKey: keyof UserPermissions): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'super_admin') return true;
    // Employee strictly has NO delete permissions across any data in the system
    if (currentUser.role === 'employee' && permissionKey === 'canDeleteData') {
      return false;
    }
    return Boolean(currentUser.permissions?.[permissionKey]);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        activityLogs,
        isLoadingAuth,
        login,
        logout,
        switchUserDemo,
        createUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        updateProfile,
        logActivity,
        hasPermission,
        isSuperAdmin,
        isEmployee,
        importUsersBatch
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
