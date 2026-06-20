import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;

export interface Student {
  id: string;
  name: string;
  ageRange?: string | null;
  groupId?: string | null;
}

export interface Group {
  id: string;
  name: string;
  ageRange?: string | null;
  grade?: string | null;
  topic?: string | null;
  studentCount: number;
  students: Student[];
}

export interface SessionRow {
  id: string;
  session_name: string;
  topic: string | null;
  description: string | null;
  duration_minutes: number | null;
  group_id: string | null;
  audio_url: string | null;
  recording_path: string | null;
  status: string;
  analysis_status?: string | null;
  speaker_map?: Record<string, any> | null;
  created_at: string;
  processed_at?: string | null;
}

export interface SessionMetric {
  id: string;
  session_id: string;
  group_id: string | null;
  student_id: string | null;
  student_name: string | null;
  speaker_label: string;
  display_name: string;
  speaking_turns: number;
  total_turn_duration_sec: number;
  avg_turn_duration_sec: number;
  interruptions: number;
  response_latency_sec: number | null;
  words_per_turn: number;
  questions_asked: number;
  tone_register: "positive" | "neutral" | "uncertain";
  topic_relevance: number;
  participation_pct: number;
  observation_flags: string[];
  raw_metrics?: any;
  created_at: string;
}

export interface FollowUp {
  id: string;
  session_id: string | null;
  group_id: string | null;
  student_id: string | null;
  student_name: string | null;
  speaker_label: string | null;
  title: string;
  body: string | null;
  flag: string | null;
  status: "pending" | "done";
  created_at: string;
}

export interface TeacherNote {
  id: string;
  session_id: string | null;
  student_id: string | null;
  note_text: string;
  created_by: string | null;
  created_at: string;
}

export interface SessionReport {
  id: string;
  session_id: string;
  audio_url: string | null;
  report_text: string;
  report_json: any;
  created_at: string;
}

export interface StudentSessionRecord {
  id: string;
  student_id: string;
  student_name: string;
  group_id: string;
  group_name: string;
  session_id: string;
  session_date: string;
  session_topic: string;
  speaking_turns: number;
  participation_pct: number;
  tone_signal: string;
  flagged: boolean;
  flag_description: string | null;
  age_range: string | null;
}

interface AnalysisContextType {
  groups: Group[];
  students: Student[];
  sessions: SessionRow[];
  sessionMetrics: SessionMetric[];
  followUps: FollowUp[];
  teacherNotes: TeacherNote[];
  sessionReports: SessionReport[];
  studentRecords: StudentSessionRecord[];
  loading: boolean;
  dataError: string | null;
  refreshRecords: () => Promise<void>;
  updateFollowUpStatus: (id: string, status: "pending" | "done") => Promise<void>;
  saveSpeakerMappings: (sessionId: string, mappings: Record<string, string>) => Promise<void>;
  addTeacherNote: (note: { session_id?: string | null; student_id?: string | null; note_text: string }) => Promise<void>;
}

const AnalysisContext = createContext<AnalysisContextType | null>(null);

export function useAnalysis() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysis must be used within AnalysisProvider");
  return ctx;
}

const SEED_GROUPS: Group[] = [
  {
    id: "g1",
    name: "Group Turtle",
    ageRange: "6-8",
    grade: "1-2",
    topic: "Fair helpers",
    studentCount: 5,
    students: [
      { id: "s1", name: "Lena M.", ageRange: "6-8", groupId: "g1" },
      { id: "s2", name: "Kai R.", ageRange: "6-8", groupId: "g1" },
      { id: "s3", name: "Maya S.", ageRange: "6-8", groupId: "g1" },
      { id: "s4", name: "Noah P.", ageRange: "6-8", groupId: "g1" },
      { id: "s5", name: "Ari T.", ageRange: "6-8", groupId: "g1" },
    ],
  },
  {
    id: "g2",
    name: "Group Fox",
    ageRange: "8-10",
    grade: "3-4",
    topic: "Working through disagreement",
    studentCount: 5,
    students: [
      { id: "s6", name: "Sofia L.", ageRange: "8-10", groupId: "g2" },
      { id: "s7", name: "Eli W.", ageRange: "8-10", groupId: "g2" },
      { id: "s8", name: "Amara K.", ageRange: "8-10", groupId: "g2" },
      { id: "s9", name: "Jonas B.", ageRange: "8-10", groupId: "g2" },
      { id: "s10", name: "Nina C.", ageRange: "8-10", groupId: "g2" },
    ],
  },
  {
    id: "g3",
    name: "Group Robin",
    ageRange: "10-12",
    grade: "5-6",
    topic: "Building trust",
    studentCount: 4,
    students: [
      { id: "s11", name: "Zoe H.", ageRange: "10-12", groupId: "g3" },
      { id: "s12", name: "Malik J.", ageRange: "10-12", groupId: "g3" },
      { id: "s13", name: "Iris N.", ageRange: "10-12", groupId: "g3" },
      { id: "s14", name: "Theo V.", ageRange: "10-12", groupId: "g3" },
    ],
  },
];

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [sessionMetrics, setSessionMetrics] = useState<SessionMetric[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [teacherNotes, setTeacherNotes] = useState<TeacherNote[]>([]);
  const [sessionReports, setSessionReports] = useState<SessionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const students = useMemo(() => groups.flatMap((group) => group.students), [groups]);

  const refreshRecords = async () => {
    setLoading(true);
    setDataError(null);
    try {
      await ensureSeedRows();
      const [groupsRes, studentsRes, sessionsRes, metricsRes, followUpsRes, notesRes, reportsRes] = await Promise.all([
        db.from("groups").select("*").order("name", { ascending: true }),
        db.from("students").select("*").order("display_name", { ascending: true }),
        db.from("sessions").select("*").order("created_at", { ascending: false }),
        db.from("session_metrics").select("*").order("created_at", { ascending: true }),
        db.from("follow_ups").select("*").order("created_at", { ascending: false }),
        db.from("teacher_notes").select("*").order("created_at", { ascending: false }),
        db.from("session_reports").select("*").order("created_at", { ascending: false }),
      ]);

      const firstError = [groupsRes, studentsRes, sessionsRes, metricsRes, followUpsRes, notesRes, reportsRes].find((res) => res.error)?.error;
      if (firstError) throw firstError;

      const grouped = mapGroups(groupsRes.data || [], studentsRes.data || []);
      setGroups(grouped);
      setSessions((sessionsRes.data || []) as SessionRow[]);
      setSessionMetrics(normalizeMetrics(metricsRes.data || []));
      setFollowUps((followUpsRes.data || []) as FollowUp[]);
      setTeacherNotes((notesRes.data || []) as TeacherNote[]);
      setSessionReports((reportsRes.data || []) as SessionReport[]);
    } catch (error: any) {
      console.error("Failed to refresh Lila data:", error);
      setDataError(error?.message || "Unable to load Supabase data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshRecords();
  }, []);

  const studentRecords = useMemo(
    () => buildStudentRecords(sessionMetrics, sessions, groups),
    [sessionMetrics, sessions, groups],
  );

  const updateFollowUpStatus = async (id: string, status: "pending" | "done") => {
    const { error } = await db
      .from("follow_ups")
      .update({ status, completed_at: status === "done" ? new Date().toISOString() : null })
      .eq("id", id);
    if (error) throw error;
    await refreshRecords();
  };

  const saveSpeakerMappings = async (sessionId: string, mappings: Record<string, string>) => {
    const speakerMap: Record<string, any> = {};
    for (const [speakerLabel, studentId] of Object.entries(mappings)) {
      const student = students.find((item) => item.id === studentId);
      if (!student) continue;
      speakerMap[speakerLabel] = { student_id: student.id, student_name: student.name, display_name: student.name };
      const { error } = await db
        .from("session_metrics")
        .update({ student_id: student.id, student_name: student.name, display_name: student.name })
        .eq("session_id", sessionId)
        .eq("speaker_label", speakerLabel);
      if (error) throw error;
    }

    const { error: sessionError } = await db.from("sessions").update({ speaker_map: speakerMap }).eq("id", sessionId);
    if (sessionError) throw sessionError;
    await refreshRecords();
  };

  const addTeacherNote = async (note: { session_id?: string | null; student_id?: string | null; note_text: string }) => {
    const { error } = await db.from("teacher_notes").insert({
      session_id: note.session_id || null,
      student_id: note.student_id || null,
      note_text: note.note_text,
      created_by: "Teacher",
    });
    if (error) throw error;
    await refreshRecords();
  };

  return (
    <AnalysisContext.Provider
      value={{
        groups,
        students,
        sessions,
        sessionMetrics,
        followUps,
        teacherNotes,
        sessionReports,
        studentRecords,
        loading,
        dataError,
        refreshRecords,
        updateFollowUpStatus,
        saveSpeakerMappings,
        addTeacherNote,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

async function ensureSeedRows() {
  const { data, error } = await db.from("groups").select("id").limit(1);
  if (error) throw error;
  if (data && data.length > 0) return;

  const groupRows = SEED_GROUPS.map((group) => ({
    id: group.id,
    name: group.name,
    grade: group.grade,
    student_count: group.studentCount,
    topic: group.topic,
  }));
  const studentRows = SEED_GROUPS.flatMap((group) =>
    group.students.map((student) => ({
      id: student.id,
      group_id: group.id,
      display_name: student.name,
      age_range: student.ageRange,
    })),
  );

  const { error: groupError } = await db.from("groups").upsert(groupRows, { onConflict: "id" });
  if (groupError) throw groupError;
  const { error: studentError } = await db.from("students").upsert(studentRows, { onConflict: "id" });
  if (studentError) throw studentError;
}

function mapGroups(groupRows: any[], studentRows: any[]): Group[] {
  return groupRows.map((row) => ({
    id: row.id,
    name: row.name,
    grade: row.grade,
    topic: row.topic,
    studentCount: row.student_count || studentRows.filter((student) => student.group_id === row.id).length,
    ageRange: null,
    students: studentRows
      .filter((student) => student.group_id === row.id)
      .map((student) => ({
        id: student.id,
        name: student.display_name,
        ageRange: student.age_range,
        groupId: student.group_id,
      })),
  }));
}

function normalizeMetrics(rows: any[]): SessionMetric[] {
  return rows.map((row) => ({
    ...row,
    total_turn_duration_sec: Number(row.total_turn_duration_sec || 0),
    avg_turn_duration_sec: Number(row.avg_turn_duration_sec || 0),
    response_latency_sec: row.response_latency_sec === null ? null : Number(row.response_latency_sec || 0),
    words_per_turn: Number(row.words_per_turn || 0),
    topic_relevance: Number(row.topic_relevance || 0),
    participation_pct: Number(row.participation_pct || 0),
    observation_flags: row.observation_flags || [],
  }));
}

function buildStudentRecords(metrics: SessionMetric[], sessions: SessionRow[], groups: Group[]): StudentSessionRecord[] {
  return metrics
    .filter((metric) => metric.student_id)
    .map((metric) => {
      const session = sessions.find((item) => item.id === metric.session_id);
      const group = groups.find((item) => item.id === metric.group_id);
      return {
        id: metric.id,
        student_id: metric.student_id || "",
        student_name: metric.student_name || metric.display_name,
        group_id: metric.group_id || "",
        group_name: group?.name || "Unassigned group",
        session_id: metric.session_id,
        session_date: session?.processed_at || session?.created_at || metric.created_at,
        session_topic: session?.topic || "General discussion",
        speaking_turns: metric.speaking_turns,
        participation_pct: Math.round(metric.participation_pct),
        tone_signal: metric.tone_register,
        flagged: metric.observation_flags.length > 0,
        flag_description: metric.observation_flags.join(", ") || null,
        age_range: group?.ageRange || null,
      };
    })
    .sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime());
}
