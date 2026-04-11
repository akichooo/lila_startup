import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { GROUPS, type Student, type Group } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";

export interface StudentResult {
  student: Student;
  participationPct: number;
  speakingTurns: number;
  engagement: "High" | "Engaged" | "Moderate" | "Low";
  notable: string;
  change: string;
  changeColor: string;
  flagged: boolean;
  flagNote?: string;
}

export interface MisinfoCorrectionResult {
  studentName: string;
  topic: string;
  original: string;
  reframe: string;
  time: string;
}

export interface AnalysisResult {
  id: string;
  sessionName: string;
  topic: string;
  groupId: string;
  groupName: string;
  ageRange: string;
  date: string;
  duration: number;
  studentCount: number;
  overallTone: string;
  summaryParagraph: string;
  studentResults: StudentResult[];
  misinfoCorrection: MisinfoCorrectionResult;
  highlights: { text: string; time: string; isWarning: boolean }[];
  followUpActions: { text: string; urgency: string }[];
  createdAt: number;
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
  analyses: AnalysisResult[];
  addAnalysis: (a: AnalysisResult) => void;
  generateAnalysis: (params: {
    groupId: string;
    sessionName?: string;
    topic?: string;
    duration?: number;
    audioUrl?: string;
  }) => AnalysisResult;
  studentRecords: StudentSessionRecord[];
  refreshRecords: () => Promise<void>;
}

const AnalysisContext = createContext<AnalysisContextType | null>(null);

export function useAnalysis() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysis must be used within AnalysisProvider");
  return ctx;
}

const TONES = [
  "Calm and constructive",
  "Mostly engaged with brief off-topic moments",
  "Highly engaged with strong peer interaction",
];

const MISCONCEPTIONS: Record<string, { original: string; reframe: string }[]> = {
  default: [
    { original: "Fair always means everyone gets the same thing", reframe: "explored examples where fairness can mean meeting different needs rather than identical treatment" },
    { original: "Being kind means always agreeing with others", reframe: "discussed how respectful disagreement can also be a form of kindness and honesty" },
    { original: "You can only be friends with people who are like you", reframe: "introduced the idea that differences can make friendships richer and more interesting" },
    { original: "Rules are only made to punish people", reframe: "explored how rules can protect everyone and create a safer space for the whole group" },
    { original: "If someone is quiet they must be bored", reframe: "discussed different ways people participate, including thinking carefully before speaking" },
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateParticipation(count: number): number[] {
  const raw = Array.from({ length: count }, () => 10 + Math.random() * 30);
  const sum = raw.reduce((a, b) => a + b, 0);
  const normalized = raw.map((v) => Math.round((v / sum) * 100));
  const diff = 100 - normalized.reduce((a, b) => a + b, 0);
  normalized[0] += diff;
  return normalized.sort((a, b) => b - a);
}

function engagementFromPct(pct: number): "High" | "Engaged" | "Moderate" | "Low" {
  if (pct >= 28) return "High";
  if (pct >= 22) return "Engaged";
  if (pct >= 15) return "Moderate";
  return "Low";
}

function toneFromPct(pct: number): "positive" | "neutral" | "uncertain" {
  if (pct >= 25) return "positive";
  if (pct >= 18) return "neutral";
  return "uncertain";
}

function formatNow(): string {
  const d = new Date();
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

async function persistStudentRecords(analysis: AnalysisResult) {
  const group = GROUPS.find((g) => g.id === analysis.groupId);
  const records = analysis.studentResults.map((sr) => ({
    student_id: sr.student.id,
    student_name: sr.student.name,
    group_id: analysis.groupId,
    group_name: analysis.groupName,
    session_id: analysis.id,
    session_date: new Date().toISOString(),
    session_topic: analysis.topic,
    speaking_turns: sr.speakingTurns,
    participation_pct: sr.participationPct,
    tone_signal: toneFromPct(sr.participationPct),
    flagged: sr.flagged,
    flag_description: sr.flagNote || null,
    age_range: group?.ageRange || null,
  }));

  const { error } = await supabase.from("student_session_records").insert(records);
  if (error) {
    console.error("Failed to persist student records:", error);
    // Fallback to localStorage
    const existing = JSON.parse(localStorage.getItem("student_session_records") || "[]");
    localStorage.setItem("student_session_records", JSON.stringify([...existing, ...records]));
  }
}

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>(() => {
    const saved = localStorage.getItem("lila_analyses");
    return saved ? JSON.parse(saved) : [];
  });
  const [studentRecords, setStudentRecords] = useState<StudentSessionRecord[]>([]);

  // Persist analyses to localStorage
  useEffect(() => {
    localStorage.setItem("lila_analyses", JSON.stringify(analyses));
  }, [analyses]);

  const refreshRecords = async () => {
    const { data, error } = await supabase
      .from("student_session_records")
      .select("*")
      .order("session_date", { ascending: true });
    if (error) {
      console.error("Failed to fetch records:", error);
      const fallback = JSON.parse(localStorage.getItem("student_session_records") || "[]");
      setStudentRecords(fallback);
    } else {
      setStudentRecords(data as StudentSessionRecord[]);
    }
  };

  useEffect(() => {
    refreshRecords();
  }, []);

  const addAnalysis = (a: AnalysisResult) => {
    setAnalyses((prev) => [a, ...prev]);
  };

  const generateAnalysis = ({
    groupId,
    sessionName,
    topic,
    duration,
  }: {
    groupId: string;
    sessionName?: string;
    topic?: string;
    duration?: number;
    audioUrl?: string;
  }): AnalysisResult => {
    const group = GROUPS.find((g) => g.id === groupId) || GROUPS[0];
    const students = group.students;
    const effectiveTopic = topic || "Discussion Session";
    const effectiveDuration = duration || (15 + Math.floor(Math.random() * 15));
    const effectiveName = sessionName || effectiveTopic;

    const pcts = generateParticipation(students.length);
    const flaggedIdx = pcts.length - 1;
    const tone = pickRandom(TONES);
    const misconception = pickRandom(MISCONCEPTIONS.default);
    const misinfStudent = students[Math.floor(Math.random() * students.length)];
    const firstName = (s: Student) => s.name.split(" ")[0];

    const studentResults: StudentResult[] = students.map((s, i) => {
      const pct = pcts[i];
      const turns = Math.max(2, Math.round(pct * effectiveDuration / 100 * 0.6));
      const eng = engagementFromPct(pct);
      const isFlagged = i === flaggedIdx;

      const notables = [
        `Contributed thoughtful observations about ${effectiveTopic.toLowerCase()}.`,
        `Asked clarifying questions that helped move the discussion forward.`,
        `Built on peers' ideas with concrete examples.`,
        `Offered a unique perspective that sparked further conversation.`,
        `Responded well to facilitator prompts and showed active listening.`,
      ];

      return {
        student: s,
        participationPct: pct,
        speakingTurns: turns,
        engagement: eng,
        notable: isFlagged
          ? `Responded less frequently than peers during this session. May benefit from a brief check-in.`
          : pickRandom(notables),
        change: isFlagged
          ? "↓ Less active than previous sessions"
          : pct >= 28
            ? "↑ More active than recent sessions"
            : "→ Consistent with prior sessions",
        changeColor: isFlagged ? "#D97706" : pct >= 28 ? "#059669" : "#7C6FAA",
        flagged: isFlagged,
        flagNote: isFlagged
          ? `${firstName(s)} responded less frequently than peers during this session and may benefit from a brief check-in.`
          : undefined,
      };
    });

    const topContributor = studentResults[0];
    const secondContributor = studentResults[1];
    const quietStudent = studentResults[studentResults.length - 1];

    const summaryParagraph = `This session explored ${effectiveTopic.toLowerCase()} with ${students.length} students over ${effectiveDuration} minutes. The group was ${tone.toLowerCase()}, with strong contributions from ${firstName(topContributor.student)} and ${firstName(secondContributor.student)} and quieter participation from ${firstName(quietStudent.student)}. The facilitator asked ${5 + Math.floor(Math.random() * 5)} questions and noted one moment where a student's response included a factual oversimplification (see below). Overall discussion tone was ${tone.toLowerCase()}. No disruptive interactions were observed.`;

    const misinfo: MisinfoCorrectionResult = {
      studentName: firstName(misinfStudent),
      topic: effectiveTopic,
      original: misconception.original,
      reframe: misconception.reframe,
      time: `${10 + Math.floor(Math.random() * 10)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
    };

    const highlights = [
      { text: `${firstName(topContributor.student)} offered a strong conceptual distinction using a concrete personal example.`, time: `${10 + Math.floor(Math.random() * 5)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`, isWarning: false },
      { text: `${firstName(secondContributor.student)} connected the discussion to a personal experience unprompted.`, time: `${15 + Math.floor(Math.random() * 5)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`, isWarning: false },
      { text: `${firstName(quietStudent.student)} did not respond to two direct facilitator invitations. The facilitator moved on without pressure.`, time: `${18 + Math.floor(Math.random() * 5)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`, isWarning: true },
    ];

    const followUpActions = [
      { text: `Check in briefly with ${firstName(quietStudent.student)} to see how they're doing this week.`, urgency: "Low urgency" },
      { text: `Consider pairing ${firstName(topContributor.student)} and ${firstName(quietStudent.student)} together in a warm-up activity next session.`, urgency: "Pedagogical suggestion" },
      { text: `Extend the ${effectiveTopic.toLowerCase()} topic next session — the group showed strong curiosity and unresolved questions.`, urgency: "Curriculum suggestion" },
    ];

    const id = `analysis_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const result: AnalysisResult = {
      id,
      sessionName: effectiveName,
      topic: effectiveTopic,
      groupId,
      groupName: group.name,
      ageRange: group.ageRange,
      date: formatNow(),
      duration: effectiveDuration,
      studentCount: students.length,
      overallTone: tone,
      summaryParagraph,
      studentResults,
      misinfoCorrection: misinfo,
      highlights,
      followUpActions,
      createdAt: Date.now(),
    };

    addAnalysis(result);

    // Persist student records to Supabase
    persistStudentRecords(result).then(() => refreshRecords());

    return result;
  };

  return (
    <AnalysisContext.Provider value={{ analyses, addAnalysis, generateAnalysis, studentRecords, refreshRecords }}>
      {children}
    </AnalysisContext.Provider>
  );
}
