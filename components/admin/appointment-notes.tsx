"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMessages } from "@/lib/i18n-client"

interface Note {
  id: string
  content: string
  createdAt: string
  user: {
    firstName: string
    lastName: string
  }
}

export default function AppointmentNotes({ appointmentId }: { appointmentId: string }) {
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { messages } = useMessages()

  useEffect(() => {
    fetchNotes()
  }, [appointmentId])

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/notes`)
      if (response.ok) {
        const data = await response.json()
        // Parse notes from the text format
        if (data.notes && data.notes.length > 0) {
          const parsedNotes = data.notes.map((note: any, index: number) => ({
            ...note,
            id: `${appointmentId}-note-${index}`,
          }))
          setNotes(parsedNotes)
        } else {
          setNotes([])
        }
      }
    } catch (err: any) {
      console.error("Error fetching notes:", err)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/appointments/${appointmentId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newNote }),
      })

      if (!response.ok) {
        throw new Error(messages.appointmentNotes.errors.addFailed)
      }

      setNewNote("")
      fetchNotes()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-xl font-semibold mb-4">
        {messages.appointmentNotes.title}
      </h2>

      {/* Add Note Form */}
      <div className="mb-6 space-y-4">
        <div>
          <Label htmlFor="newNote">{messages.appointmentNotes.addLabel}</Label>
          <textarea
            id="newNote"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder={messages.appointmentNotes.placeholder}
          />
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <Button onClick={handleAddNote} disabled={loading || !newNote.trim()}>
          {loading ? messages.appointmentNotes.adding : messages.appointmentNotes.add}
        </Button>
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            {messages.appointmentNotes.empty}
          </p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="rounded-lg border bg-background p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium">
                    {note.user.firstName} {note.user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(note.createdAt)}
                  </p>
                </div>
              </div>
              <p className="text-sm whitespace-pre-wrap">{note.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

