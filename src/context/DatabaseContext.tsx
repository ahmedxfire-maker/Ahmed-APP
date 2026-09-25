import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch 
} from 'firebase/firestore';
import { db, testConnection } from '../lib/firebase';
import { 
  cleanFirestoreData, 
  handleFirestoreError, 
  OperationType 
} from '../lib/firestoreErrors';
import { 
  Pest, 
  Location, 
  InfestationReport, 
  ControlMeasure, 
  ZoneClassification,
  MonthlyStat,
  AppUser
} from '../types';
import { 
  exportSystemBackup, 
  BackupPayload 
} from '../utils/backupUtils';
import { 
  initialPests, 
  initialLocations, 
  initialInfestationReports, 
  initialControlMeasures,
  initialMonthlyStats 
} from '../data/mockData';

interface LocationZoneStatus {
  location: Location;
  classification: ZoneClassification;
  totalAffectedFeddans: number;
  activeReportsCount: number;
  severeCount: number;
  moderateCount: number;
  mildCount: number;
  dominantPests: string[];
}

interface DatabaseContextType {
  pests: Pest[];
  locations: Location[];
  reports: InfestationReport[];
  controlMeasures: ControlMeasure[];
  monthlyStats: MonthlyStat[];
  isCloudConnected: boolean;
  
  // CRUD
  addPest: (pest: Omit<Pest, 'id'>) => Promise<void>;
  updatePest: (id: string, pest: Partial<Pest>) => Promise<void>;
  deletePest: (id: string) => Promise<void>;

  addLocation: (loc: Omit<Location, 'id'>) => Promise<void>;
  updateLocation: (id: string, loc: Partial<Location>) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;

  addReport: (rep: Omit<InfestationReport, 'id'>) => Promise<void>;
  updateReport: (id: string, rep: Partial<InfestationReport>) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;

  addControlMeasure: (ctrl: Omit<ControlMeasure, 'id'>) => Promise<void>;
  updateControlMeasure: (id: string, ctrl: Partial<ControlMeasure>) => Promise<void>;
  deleteControlMeasure: (id: string) => Promise<void>;

  // Analysis & Geographical Zones
  locationZoneStatuses: LocationZoneStatus[];
  getLocationStatus: (locationId: string) => LocationZoneStatus | undefined;
  
  // Reset disabled for persistent shared database protection
  resetDatabaseToDefaults: () => void;

  // Quick lookup helpers
  getPestById: (id: string) => Pest | undefined;
  getLocationById: (id: string) => Location | undefined;
  getControlByPestId: (pestId: string) => ControlMeasure[];

  // Backup and Restore
  exportBackup: (exportedByName?: string, users?: AppUser[]) => BackupPayload;
  importBackup: (
    payload: BackupPayload,
    mode: 'merge' | 'replace',
    onUserImport?: (users: AppUser[]) => Promise<void>
  ) => Promise<{
    success: boolean;
    message: string;
    counts: {
      pests: number;
      locations: number;
      reports: number;
      controlMeasures: number;
      monthlyStats: number;
      users: number;
    };
  }>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const seedingRef = useRef<boolean>(false);

  const [pests, setPests] = useState<Pest[]>(() => {
    const saved = localStorage.getItem('egy_quarantine_pests');
    return saved ? JSON.parse(saved) : initialPests;
  });

  const [locations, setLocations] = useState<Location[]>(() => {
    const saved = localStorage.getItem('egy_quarantine_locations');
    return saved ? JSON.parse(saved) : initialLocations;
  });

  const [reports, setReports] = useState<InfestationReport[]>(() => {
    const saved = localStorage.getItem('egy_quarantine_reports');
    return saved ? JSON.parse(saved) : initialInfestationReports;
  });

  const [controlMeasures, setControlMeasures] = useState<ControlMeasure[]>(() => {
    const saved = localStorage.getItem('egy_quarantine_control_measures');
    return saved ? JSON.parse(saved) : initialControlMeasures;
  });

  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>(() => {
    const saved = localStorage.getItem('egy_quarantine_monthly_stats');
    return saved ? JSON.parse(saved) : initialMonthlyStats;
  });

  // Always keep offline cache updated for zero-latency local fallback
  useEffect(() => {
    localStorage.setItem('egy_quarantine_pests', JSON.stringify(pests));
  }, [pests]);

  useEffect(() => {
    localStorage.setItem('egy_quarantine_locations', JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    localStorage.setItem('egy_quarantine_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('egy_quarantine_control_measures', JSON.stringify(controlMeasures));
  }, [controlMeasures]);

  useEffect(() => {
    localStorage.setItem('egy_quarantine_monthly_stats', JSON.stringify(monthlyStats));
  }, [monthlyStats]);

  // Connect to Firestore real-time collections and sync data across all devices
  useEffect(() => {
    testConnection();

    // 1. Pests listener
    const unsubPests = onSnapshot(collection(db, 'pests'), async (snapshot) => {
      if (snapshot.empty && !seedingRef.current) {
        seedingRef.current = true;
        try {
          const batch = writeBatch(db);
          initialPests.forEach(p => {
            batch.set(doc(db, 'pests', p.id), p);
          });
          await batch.commit();
        } catch (e) {
          console.warn('Firestore seeding pests error:', e);
        }
      } else if (!snapshot.empty) {
        const loaded: Pest[] = [];
        snapshot.forEach(docSnap => {
          loaded.push(docSnap.data() as Pest);
        });
        setPests(loaded);
        setIsCloudConnected(true);
      }
    }, (err) => {
      console.warn('Firestore pests onSnapshot note:', err?.message || err);
    });

    // 2. Locations listener
    const unsubLocations = onSnapshot(collection(db, 'locations'), async (snapshot) => {
      if (snapshot.empty && !seedingRef.current) {
        try {
          const batch = writeBatch(db);
          initialLocations.forEach(loc => {
            batch.set(doc(db, 'locations', loc.id), loc);
          });
          await batch.commit();
        } catch (e) {
          console.warn('Firestore seeding locations error:', e);
        }
      } else if (!snapshot.empty) {
        const loaded: Location[] = [];
        snapshot.forEach(docSnap => {
          loaded.push(docSnap.data() as Location);
        });
        setLocations(loaded);
        setIsCloudConnected(true);
      }
    }, (err) => {
      console.warn('Firestore locations onSnapshot note:', err?.message || err);
    });

    // 3. Reports listener
    const unsubReports = onSnapshot(collection(db, 'reports'), async (snapshot) => {
      if (snapshot.empty && !seedingRef.current) {
        try {
          const batch = writeBatch(db);
          initialInfestationReports.forEach(rep => {
            batch.set(doc(db, 'reports', rep.id), rep);
          });
          await batch.commit();
        } catch (e) {
          console.warn('Firestore seeding reports error:', e);
        }
      } else if (!snapshot.empty) {
        const loaded: InfestationReport[] = [];
        snapshot.forEach(docSnap => {
          loaded.push(docSnap.data() as InfestationReport);
        });
        // Sort descending by detection date
        loaded.sort((a, b) => new Date(b.detectionDate).getTime() - new Date(a.detectionDate).getTime());
        setReports(loaded);
        setIsCloudConnected(true);
      }
    }, (err) => {
      console.warn('Firestore reports onSnapshot note:', err?.message || err);
    });

    // 4. Control measures listener
    const unsubControl = onSnapshot(collection(db, 'controlMeasures'), async (snapshot) => {
      if (snapshot.empty && !seedingRef.current) {
        try {
          const batch = writeBatch(db);
          initialControlMeasures.forEach(ctrl => {
            batch.set(doc(db, 'controlMeasures', ctrl.id), ctrl);
          });
          await batch.commit();
        } catch (e) {
          console.warn('Firestore seeding controlMeasures error:', e);
        }
      } else if (!snapshot.empty) {
        const loaded: ControlMeasure[] = [];
        snapshot.forEach(docSnap => {
          loaded.push(docSnap.data() as ControlMeasure);
        });
        setControlMeasures(loaded);
        setIsCloudConnected(true);
      }
    }, (err) => {
      console.warn('Firestore controlMeasures onSnapshot note:', err?.message || err);
    });

    // 5. Monthly stats listener
    const unsubMonthly = onSnapshot(collection(db, 'monthlyStats'), async (snapshot) => {
      if (snapshot.empty && !seedingRef.current) {
        try {
          const batch = writeBatch(db);
          initialMonthlyStats.forEach(stat => {
            batch.set(doc(db, 'monthlyStats', stat.monthCode), stat);
          });
          await batch.commit();
        } catch (e) {
          console.warn('Firestore seeding monthlyStats error:', e);
        }
      } else if (!snapshot.empty) {
        const loaded: MonthlyStat[] = [];
        snapshot.forEach(docSnap => {
          loaded.push(docSnap.data() as MonthlyStat);
        });
        loaded.sort((a, b) => a.monthCode.localeCompare(b.monthCode));
        setMonthlyStats(loaded);
      }
    }, (err) => {
      console.warn('Firestore monthlyStats onSnapshot note:', err?.message || err);
    });

    return () => {
      unsubPests();
      unsubLocations();
      unsubReports();
      unsubControl();
      unsubMonthly();
    };
  }, []);

  // CRUD Pests - Cloud & Local
  const addPest = async (newPestData: Omit<Pest, 'id'>) => {
    const newId = `PEST-${Date.now().toString().slice(-6)}`;
    const newPest: Pest = { ...newPestData, id: newId };
    const cleaned = cleanFirestoreData(newPest);
    setPests(prev => [newPest, ...prev]);
    try {
      await setDoc(doc(db, 'pests', newId), cleaned);
    } catch (err) {
      if (err instanceof Error && (err.message.includes('permission') || err.message.includes('insufficient'))) {
        handleFirestoreError(err, OperationType.WRITE, `pests/${newId}`);
      } else {
        console.error('Failed to write pest to cloud:', err);
      }
    }
  };

  const updatePest = async (id: string, updated: Partial<Pest>) => {
    const cleaned = cleanFirestoreData(updated);
    setPests(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    try {
      await updateDoc(doc(db, 'pests', id), cleaned);
    } catch (err) {
      if (err instanceof Error && (err.message.includes('permission') || err.message.includes('insufficient'))) {
        handleFirestoreError(err, OperationType.UPDATE, `pests/${id}`);
      } else {
        console.error('Failed to update pest in cloud:', err);
      }
    }
  };

  const deletePest = async (id: string) => {
    setPests(prev => prev.filter(p => p.id !== id));
    try {
      await deleteDoc(doc(db, 'pests', id));
    } catch (err) {
      if (err instanceof Error && (err.message.includes('permission') || err.message.includes('insufficient'))) {
        handleFirestoreError(err, OperationType.DELETE, `pests/${id}`);
      } else {
        console.error('Failed to delete pest from cloud:', err);
      }
    }
  };

  // CRUD Locations - Cloud & Local
  const addLocation = async (newLocData: Omit<Location, 'id'>) => {
    const newId = `LOC-${Date.now().toString().slice(-6)}`;
    const newLoc: Location = { ...newLocData, id: newId };
    const cleaned = cleanFirestoreData(newLoc);
    setLocations(prev => [...prev, newLoc]);
    try {
      await setDoc(doc(db, 'locations', newId), cleaned);
    } catch (err) {
      if (err instanceof Error && (err.message.includes('permission') || err.message.includes('insufficient'))) {
        handleFirestoreError(err, OperationType.WRITE, `locations/${newId}`);
      } else {
        console.error('Failed to write location to cloud:', err);
      }
    }
  };

  const updateLocation = async (id: string, updated: Partial<Location>) => {
    const cleaned = cleanFirestoreData(updated);
    setLocations(prev => prev.map(l => l.id === id ? { ...l, ...updated } : l));
    try {
      await updateDoc(doc(db, 'locations', id), cleaned);
    } catch (err) {
      if (err instanceof Error && (err.message.includes('permission') || err.message.includes('insufficient'))) {
        handleFirestoreError(err, OperationType.UPDATE, `locations/${id}`);
      } else {
        console.error('Failed to update location in cloud:', err);
      }
    }
  };

  const deleteLocation = async (id: string) => {
    setLocations(prev => prev.filter(l => l.id !== id));
    try {
      await deleteDoc(doc(db, 'locations', id));
    } catch (err) {
      if (err instanceof Error && (err.message.includes('permission') || err.message.includes('insufficient'))) {
        handleFirestoreError(err, OperationType.DELETE, `locations/${id}`);
      } else {
        console.error('Failed to delete location from cloud:', err);
      }
    }
  };

  // CRUD Reports - Cloud & Local
  const addReport = async (newRepData: Omit<InfestationReport, 'id'>) => {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-5);
    const newId = `REP-${year}-${timestamp}`;
    const newRep: InfestationReport = { ...newRepData, id: newId };
    const cleaned = cleanFirestoreData(newRep);
    setReports(prev => [newRep, ...prev]);
    try {
      await setDoc(doc(db, 'reports', newId), cleaned);
    } catch (err) {
      if (err instanceof Error && (err.message.includes('permission') || err.message.includes('insufficient'))) {
        handleFirestoreError(err, OperationType.WRITE, `reports/${newId}`);
      } else {
        console.error('Failed to write report to cloud:', err);
      }
    }
  };

  const updateReport = async (id: string, updated: Partial<InfestationReport>) => {
    const cleaned = cleanFirestoreData(updated);
    setReports(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
    try {
      await updateDoc(doc(db, 'reports', id), cleaned);
    } catch (err) {
      if (err instanceof Error && (err.message.includes('permission') || err.message.includes('insufficient'))) {
        handleFirestoreError(err, OperationType.UPDATE, `reports/${id}`);
      } else {
        console.error('Failed to update report in cloud:', err);
      }
    }
  };

  const deleteReport = async (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
    try {
      await deleteDoc(doc(db, 'reports', id));
    } catch (err) {
      if (err instanceof Error && (err.message.includes('permission') || err.message.includes('insufficient'))) {
        handleFirestoreError(err, OperationType.DELETE, `reports/${id}`);
      } else {
        console.error('Failed to delete report from cloud:', err);
      }
    }
  };

  // CRUD Control Measures - Cloud & Local
  const addControlMeasure = async (newCtrlData: Omit<ControlMeasure, 'id'>) => {
    const newId = `CTRL-${Date.now().toString().slice(-6)}`;
    const newCtrl: ControlMeasure = { ...newCtrlData, id: newId };
    const cleaned = cleanFirestoreData(newCtrl);
    setControlMeasures(prev => [newCtrl, ...prev]);
    try {
      await setDoc(doc(db, 'controlMeasures', newId), cleaned);
    } catch (err) {
      if (err instanceof Error && (err.message.includes('permission') || err.message.includes('insufficient'))) {
        handleFirestoreError(err, OperationType.WRITE, `controlMeasures/${newId}`);
      } else {
        console.error('Failed to write control measure to cloud:', err);
      }
    }
  };

  const updateControlMeasure = async (id: string, updated: Partial<ControlMeasure>) => {
    const cleaned = cleanFirestoreData(updated);
    setControlMeasures(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
    try {
      await updateDoc(doc(db, 'controlMeasures', id), cleaned);
    } catch (err) {
      if (err instanceof Error && (err.message.includes('permission') || err.message.includes('insufficient'))) {
        handleFirestoreError(err, OperationType.UPDATE, `controlMeasures/${id}`);
      } else {
        console.error('Failed to update control measure in cloud:', err);
      }
    }
  };

  const deleteControlMeasure = async (id: string) => {
    setControlMeasures(prev => prev.filter(c => c.id !== id));
    try {
      await deleteDoc(doc(db, 'controlMeasures', id));
    } catch (err) {
      if (err instanceof Error && (err.message.includes('permission') || err.message.includes('insufficient'))) {
        handleFirestoreError(err, OperationType.DELETE, `controlMeasures/${id}`);
      } else {
        console.error('Failed to delete control measure from cloud:', err);
      }
    }
  };

  // Reset is disabled to preserve user-added records across all devices
  const resetDatabaseToDefaults = () => {
    console.warn('Database reset is disabled per administrator request to preserve cloud records.');
  };

  const getPestById = (id: string) => pests.find(p => p.id === id);
  const getLocationById = (id: string) => locations.find(l => l.id === id);
  const getControlByPestId = (pestId: string) => controlMeasures.filter(c => c.pestId === pestId);

  // Calculate Zone Classification for each Location based on reports
  const locationZoneStatuses = useMemo<LocationZoneStatus[]>(() => {
    return locations.map(loc => {
      const locReports = reports.filter(r => r.locationId === loc.id);
      const totalAffectedFeddans = locReports.reduce((sum, r) => sum + (r.affectedAreaFeddans || 0), 0);
      const severeCount = locReports.filter(r => r.severity === 'جسيمة').length;
      const moderateCount = locReports.filter(r => r.severity === 'متوسطة').length;
      const mildCount = locReports.filter(r => r.severity === 'خفيفة').length;

      // Check if there are quarantine A1 pests
      const hasQuarantineA1 = locReports.some(r => {
        const pest = pests.find(p => p.id === r.pestId);
        return pest?.quarantineCategory?.includes('أ1');
      });

      let classification: ZoneClassification;
      if (locReports.length === 0) {
        classification = 'منطقة خالية من الإصابة (PFA)';
      } else if (severeCount > 0 || hasQuarantineA1 || totalAffectedFeddans >= 80) {
        classification = 'منطقة عالية الإصابة (بؤرة حجرية)';
      } else if (moderateCount > 0 || totalAffectedFeddans >= 30) {
        classification = 'منطقة متوسطة الإصابة';
      } else {
        classification = 'منطقة منخفضة الإصابة (ALPP)';
      }

      // Collect dominant pest names
      const pestNamesMap = new Map<string, number>();
      locReports.forEach(r => {
        const p = pests.find(pest => pest.id === r.pestId);
        if (p) {
          pestNamesMap.set(p.commonName, (pestNamesMap.get(p.commonName) || 0) + 1);
        }
      });
      const dominantPests = Array.from(pestNamesMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);

      return {
        location: loc,
        classification,
        totalAffectedFeddans: Number(totalAffectedFeddans.toFixed(1)),
        activeReportsCount: locReports.length,
        severeCount,
        moderateCount,
        mildCount,
        dominantPests
      };
    });
  }, [locations, reports, pests]);

  const getLocationStatus = (locationId: string) => {
    return locationZoneStatuses.find(s => s.location.id === locationId);
  };

  // Export backup snapshot
  const exportBackup = (exportedByName = 'مدير النظام (Super Admin)', userList: AppUser[] = []) => {
    return exportSystemBackup({
      pests,
      locations,
      reports,
      controlMeasures,
      monthlyStats,
      users: userList,
      exportedByName,
      includeUsers: userList.length > 0
    });
  };

  // Import and restore backup
  const importBackup = async (
    payload: BackupPayload,
    mode: 'merge' | 'replace' = 'merge',
    onUserImport?: (users: AppUser[]) => Promise<void>
  ) => {
    const incoming = payload.data;

    let targetPests: Pest[];
    let targetLocations: Location[];
    let targetReports: InfestationReport[];
    let targetControl: ControlMeasure[];
    let targetMonthly: MonthlyStat[];

    if (mode === 'replace') {
      targetPests = incoming.pests || [];
      targetLocations = incoming.locations || [];
      targetReports = incoming.reports || [];
      targetControl = incoming.controlMeasures || [];
      targetMonthly = incoming.monthlyStats || [];
    } else {
      const pestMap = new Map<string, Pest>(pests.map(p => [p.id, p]));
      (incoming.pests || []).forEach(p => pestMap.set(p.id, p));
      targetPests = Array.from(pestMap.values());

      const locMap = new Map<string, Location>(locations.map(l => [l.id, l]));
      (incoming.locations || []).forEach(l => locMap.set(l.id, l));
      targetLocations = Array.from(locMap.values());

      const repMap = new Map<string, InfestationReport>(reports.map(r => [r.id, r]));
      (incoming.reports || []).forEach(r => repMap.set(r.id, r));
      targetReports = Array.from(repMap.values());

      const ctrlMap = new Map<string, ControlMeasure>(controlMeasures.map(c => [c.id, c]));
      (incoming.controlMeasures || []).forEach(c => ctrlMap.set(c.id, c));
      targetControl = Array.from(ctrlMap.values());

      const monthlyMap = new Map<string, MonthlyStat>(monthlyStats.map(m => [m.monthCode, m]));
      (incoming.monthlyStats || []).forEach(m => monthlyMap.set(m.monthCode, m));
      targetMonthly = Array.from(monthlyMap.values());
    }

    // Update local state and local storage immediately
    setPests(targetPests);
    setLocations(targetLocations);
    setReports(targetReports);
    setControlMeasures(targetControl);
    setMonthlyStats(targetMonthly);

    localStorage.setItem('egy_quarantine_pests', JSON.stringify(targetPests));
    localStorage.setItem('egy_quarantine_locations', JSON.stringify(targetLocations));
    localStorage.setItem('egy_quarantine_reports', JSON.stringify(targetReports));
    localStorage.setItem('egy_quarantine_control_measures', JSON.stringify(targetControl));
    localStorage.setItem('egy_quarantine_monthly_stats', JSON.stringify(targetMonthly));

    // Batch write to Firestore in chunks of 250
    try {
      const operations: Array<{ ref: any; data: any }> = [];

      targetPests.forEach(p => {
        operations.push({ ref: doc(db, 'pests', p.id), data: cleanFirestoreData(p) });
      });

      targetLocations.forEach(l => {
        operations.push({ ref: doc(db, 'locations', l.id), data: cleanFirestoreData(l) });
      });

      targetReports.forEach(r => {
        operations.push({ ref: doc(db, 'reports', r.id), data: cleanFirestoreData(r) });
      });

      targetControl.forEach(c => {
        operations.push({ ref: doc(db, 'controlMeasures', c.id), data: cleanFirestoreData(c) });
      });

      targetMonthly.forEach(m => {
        operations.push({ ref: doc(db, 'monthlyStats', m.monthCode), data: cleanFirestoreData(m) });
      });

      const CHUNK_SIZE = 250;
      for (let i = 0; i < operations.length; i += CHUNK_SIZE) {
        const chunk = operations.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        for (const op of chunk) {
          batch.set(op.ref, op.data, { merge: true });
        }
        await batch.commit();
      }
    } catch (err) {
      console.warn('Firestore cloud sync notice during backup restore:', err);
    }

    let importedUsersCount = 0;
    if (incoming.users && incoming.users.length > 0 && onUserImport) {
      try {
        await onUserImport(incoming.users);
        importedUsersCount = incoming.users.length;
      } catch (err) {
        console.warn('Failed to import user accounts:', err);
      }
    }

    return {
      success: true,
      message: mode === 'replace' ? 'تم استبدال واستعادة قاعدة البيانات بنجاح' : 'تم دمج وتحديث البيانات بنجاح',
      counts: {
        pests: incoming.pests?.length || 0,
        locations: incoming.locations?.length || 0,
        reports: incoming.reports?.length || 0,
        controlMeasures: incoming.controlMeasures?.length || 0,
        monthlyStats: incoming.monthlyStats?.length || 0,
        users: importedUsersCount
      }
    };
  };

  return (
    <DatabaseContext.Provider
      value={{
        pests,
        locations,
        reports,
        controlMeasures,
        monthlyStats,
        isCloudConnected,
        addPest,
        updatePest,
        deletePest,
        addLocation,
        updateLocation,
        deleteLocation,
        addReport,
        updateReport,
        deleteReport,
        addControlMeasure,
        updateControlMeasure,
        deleteControlMeasure,
        locationZoneStatuses,
        getLocationStatus,
        resetDatabaseToDefaults,
        getPestById,
        getLocationById,
        getControlByPestId,
        exportBackup,
        importBackup
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
