// Mock data for the Lila platform

export interface Student {
  id: string;
  name: string;
  initials: string;
  grade: string;
  color: string;
}

export interface Group {
  id: string;
  name: string;
  ageRange: "6-8" | "9-10" | "11-12";
  students: Student[];
  lastSession: string;
  nextSession?: string;
}

export interface Session {
  id: string;
  topic: string;
  groupName: string;
  groupId: string;
  date: string;
  studentCount: number;
  duration: number;
  status: "summary-ready" | "follow-up-pending" | "reviewed" | "live" | "draft";
}

export interface FollowUp {
  id: string;
  text: string;
  sessionDate: string;
  done: boolean;
}

export interface TranscriptEntry {
  id: string;
  speaker: string;
  initials: string;
  color: string;
  text: string;
  time: string;
  isAI?: boolean;
  isCorrection?: boolean;
  isSilence?: boolean;
}

export const STUDENTS: Student[] = [
  { id: "s1", name: "Lena M.", initials: "LM", grade: "3rd", color: "#A78BFA" },
  { id: "s2", name: "Marcus J.", initials: "MJ", grade: "3rd", color: "#FB7185" },
  { id: "s3", name: "Priya S.", initials: "PS", grade: "3rd", color: "#7DD3FC" },
  { id: "s4", name: "Omar S.", initials: "OS", grade: "3rd", color: "#6EE7B7" },
  { id: "s5", name: "Aiden K.", initials: "AK", grade: "3rd", color: "#FCD34D" },
  { id: "s6", name: "Sofia T.", initials: "ST", grade: "3rd", color: "#FDBA74" },
  { id: "s7", name: "Dev P.", initials: "DP", grade: "3rd", color: "#C4B5FD" },
  { id: "s8", name: "Zoe R.", initials: "ZR", grade: "3rd", color: "#FB7185" },
  { id: "s9", name: "Kai N.", initials: "KN", grade: "3rd", color: "#7DD3FC" },
  { id: "s10", name: "Amara L.", initials: "AL", grade: "3rd", color: "#6EE7B7" },
];

export const GROUPS: Group[] = [
  { id: "g1", name: "Group Finch", students: STUDENTS.slice(0, 5), lastSession: "Oct 14", nextSession: "Oct 21" },
  { id: "g2", name: "Group Sparrow", students: STUDENTS.slice(5, 10), lastSession: "Oct 13", nextSession: "Oct 20" },
  { id: "g3", name: "Group Robin", students: STUDENTS.slice(0, 4), lastSession: "Oct 11", nextSession: "Oct 18" },
  { id: "g4", name: "Group Crane", students: [STUDENTS[2], STUDENTS[5], STUDENTS[7], STUDENTS[8], STUDENTS[9]], lastSession: "Oct 4", nextSession: "Oct 18" },
  { id: "g5", name: "Group Heron", students: STUDENTS.slice(1, 5), lastSession: "Oct 7" },
  { id: "g6", name: "Group Wren", students: [STUDENTS[6], STUDENTS[8], STUDENTS[9]], lastSession: "Sep 30" },
];

export const SESSIONS: Session[] = [
  { id: "ses1", topic: "Feelings & Fairness", groupName: "Group Finch", groupId: "g1", date: "Oct 14", studentCount: 4, duration: 22, status: "summary-ready" },
  { id: "ses2", topic: "Why Do Rules Exist?", groupName: "Group Sparrow", groupId: "g2", date: "Oct 13", studentCount: 5, duration: 18, status: "summary-ready" },
  { id: "ses3", topic: "What Makes a Good Friend?", groupName: "Group Robin", groupId: "g3", date: "Oct 11", studentCount: 4, duration: 25, status: "follow-up-pending" },
  { id: "ses4", topic: "Emotions in Stories", groupName: "Group Finch", groupId: "g1", date: "Oct 7", studentCount: 4, duration: 20, status: "reviewed" },
  { id: "ses5", topic: "Sharing & Fairness", groupName: "Group Crane", groupId: "g4", date: "Oct 4", studentCount: 5, duration: 17, status: "reviewed" },
];

export const FOLLOW_UPS: FollowUp[] = [
  { id: "f1", text: "Check in with Lena M.", sessionDate: "Oct 14", done: false },
  { id: "f2", text: "Review Omar S. participation trend", sessionDate: "Oct 13", done: false },
  { id: "f3", text: "Schedule make-up session for Group Wren", sessionDate: "absent student", done: false },
  { id: "f4", text: "Share session summary with co-teacher Ms. Park", sessionDate: "Oct 11", done: false },
];

export const TRANSCRIPT: TranscriptEntry[] = [
  { id: "t1", speaker: "Lila Facilitator", initials: "🟣", color: "#A78BFA", text: "Has anyone ever felt like something wasn't fair? What happened?", time: "10:02", isAI: true },
  { id: "t2", speaker: "Lena", initials: "LM", color: "#A78BFA", text: "One time my brother got a bigger piece of cake and I didn't think that was fair.", time: "10:04" },
  { id: "t3", speaker: "Lila Facilitator", initials: "🟣", color: "#A78BFA", text: "That sounds frustrating! Do you think fairness always means getting exactly the same thing?", time: "10:05", isAI: true },
  { id: "t4", speaker: "Marcus", initials: "MJ", color: "#FB7185", text: "No, sometimes fair means getting what you need. Like if someone is taller they need bigger shoes.", time: "10:07" },
  { id: "t5", speaker: "Lila Facilitator", initials: "🟣", color: "#A78BFA", text: "That's a really thoughtful point, Marcus. Does everyone agree? What do others think?", time: "10:08", isAI: true },
  { id: "t6", speaker: "Priya", initials: "PS", color: "#7DD3FC", text: "I think fair means everyone is happy.", time: "10:09" },
  { id: "t7", speaker: "Lila Facilitator", initials: "🟣", color: "#A78BFA", text: "That's an interesting idea, Priya! Sometimes fair decisions don't make everyone happy right away — like a rule that feels hard at first but is good for everyone. Can you think of an example like that?", time: "10:10", isAI: true, isCorrection: true },
  { id: "t8", speaker: "", initials: "", color: "", text: "Lila is waiting…", time: "", isSilence: true },
  { id: "t9", speaker: "Omar", initials: "OS", color: "#6EE7B7", text: "Like wearing helmets on bikes. I don't like it but it keeps me safe.", time: "10:13" },
];

export const PARTICIPATION_DATA = [
  { session: "Sep 16", lena: 9, marcus: 7, priya: 8, omar: 6 },
  { session: "Sep 23", lena: 8, marcus: 6, priya: 7, omar: 7 },
  { session: "Sep 30", lena: 7, marcus: 8, priya: 8, omar: 5 },
  { session: "Oct 4", lena: 7, marcus: 7, priya: 6, omar: 8 },
  { session: "Oct 7", lena: 5, marcus: 9, priya: 7, omar: 6 },
  { session: "Oct 11", lena: 4, marcus: 8, priya: 8, omar: 7 },
  { session: "Oct 13", lena: 5, marcus: 7, priya: 6, omar: 8 },
  { session: "Oct 14", lena: 5, marcus: 8, priya: 6, omar: 5 },
];

export const TOPIC_ENGAGEMENT = [
  { topic: "Fairness", engagement: 85 },
  { topic: "Friendship", engagement: 90 },
  { topic: "Emotions", engagement: 65 },
  { topic: "Community", engagement: 60 },
  { topic: "Conflict", engagement: 35 },
];

export const TONE_DATA = [
  { session: "Sep 16", positive: 60, neutral: 30, uncertain: 10 },
  { session: "Sep 23", positive: 55, neutral: 35, uncertain: 10 },
  { session: "Sep 30", positive: 50, neutral: 35, uncertain: 15 },
  { session: "Oct 4", positive: 45, neutral: 35, uncertain: 20 },
  { session: "Oct 7", positive: 40, neutral: 35, uncertain: 25 },
  { session: "Oct 11", positive: 35, neutral: 40, uncertain: 25 },
  { session: "Oct 13", positive: 40, neutral: 30, uncertain: 30 },
  { session: "Oct 14", positive: 35, neutral: 35, uncertain: 30 },
];
