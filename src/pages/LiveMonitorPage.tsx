import { useMemo, useState } from "react";
import { AlertCircle, Save } from "lucide-react";
import { AppShell } from "@/components/bridge/AppShell";
import { useAnalysis } from "@/contexts/AnalysisContext";

export default function LiveMonitorPage() {
  const { sessions, students, teacherNotes, dataError, addTeacherNote } = useAnalysis();
  const [sessionId, setSessionId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [noteText, setNoteText] = useState("");
  const [message, setMessage] = useState("");
  const selectedSession = useMemo(() => sessions.find((session) => session.id === sessionId) || sessions[0], [sessions, sessionId]);
  const notesForSession = teacherNotes.filter((note) => !selectedSession || note.session_id === selectedSession.id);

  const saveNote = async () => {
    if (!noteText.trim()) return;
    setMessage("");
    try {
      await addTeacherNote({
        session_id: selectedSession?.id || null,
        student_id: studentId || null,
        note_text: noteText.trim(),
      });
      setNoteText("");
      setMessage("Note saved.");
    } catch (error: any) {
      setMessage(error?.message || "Unable to save note.");
    }
  };

  return (
    <AppShell pageTitle="Session Monitor">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <p className="lila-label">Teacher Notes</p>
          <h1>Session Monitor</h1>
          <p className="text-sm mt-2 max-w-2xl" style={{ color: "#7C6FAA" }}>
            Add teacher observations to real sessions. Audio analysis happens after upload or recording.
          </p>
        </div>

        {dataError && (
          <div className="rounded-2xl p-4 flex gap-3" style={{ background: "#FEF2F2", border: "1.5px solid #FECACA" }}>
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-700">{dataError}</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="lila-card-elevated space-y-4">
            <h2 className="text-xl">Add Note</h2>
            <label className="space-y-2 block">
              <span className="lila-label">Session</span>
              <select
                value={selectedSession?.id || ""}
                onChange={(event) => setSessionId(event.target.value)}
                className="w-full rounded-2xl border px-4 py-3 bg-white"
                style={{ borderColor: "#EDE9FF", color: "#2D1B69" }}
              >
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.session_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 block">
              <span className="lila-label">Student</span>
              <select
                value={studentId}
                onChange={(event) => setStudentId(event.target.value)}
                className="w-full rounded-2xl border px-4 py-3 bg-white"
                style={{ borderColor: "#EDE9FF", color: "#2D1B69" }}
              >
                <option value="">Whole group</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 block">
              <span className="lila-label">Observation</span>
              <textarea
                value={noteText}
                onChange={(event) => setNoteText(event.target.value)}
                className="w-full rounded-2xl border px-4 py-3 bg-white min-h-[160px]"
                style={{ borderColor: "#EDE9FF", color: "#2D1B69" }}
                placeholder="Write a teacher observation for later review."
              />
            </label>
            <button onClick={saveNote} className="lila-btn-primary inline-flex items-center gap-2 disabled:opacity-60" disabled={!noteText.trim()}>
              <Save className="h-4 w-4" />
              Save Note
            </button>
            {message && <p className="text-sm" style={{ color: message.includes("Unable") ? "#DC2626" : "#059669" }}>{message}</p>}
          </section>

          <section className="lila-card-elevated">
            <h2 className="text-xl mb-4">Saved Notes</h2>
            <div className="space-y-3">
              {notesForSession.map((note) => {
                const student = students.find((item) => item.id === note.student_id);
                return (
                  <div key={note.id} className="rounded-2xl p-4" style={{ background: "#FAFAFE", border: "1.5px solid #EDE9FF" }}>
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-bold text-sm" style={{ color: "#2D1B69" }}>{student?.name || "Whole group"}</p>
                      <span className="text-xs" style={{ color: "#7C6FAA" }}>{new Date(note.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm mt-2" style={{ color: "#2D1B69" }}>{note.note_text}</p>
                  </div>
                );
              })}
              {notesForSession.length === 0 && (
                <p className="text-sm rounded-2xl p-4" style={{ color: "#7C6FAA", background: "#FAFAFE" }}>
                  No notes saved for this session yet.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
