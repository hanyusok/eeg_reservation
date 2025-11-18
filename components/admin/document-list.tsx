"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Document {
  id: string
  fileName: string
  fileType: string
  uploadedAt: string
  uploader: {
    firstName: string
    lastName: string
  }
}

export default function DocumentList({
  patientId,
  appointmentId,
}: {
  patientId: string
  appointmentId?: string
}) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    fetchDocuments()
  }, [patientId, appointmentId])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ patientId })
      if (appointmentId) {
        params.append("appointmentId", appointmentId)
      }
      const response = await fetch(`/api/documents?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
      }
    } catch (err: any) {
      console.error("Error fetching documents:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      setUploading(true)
      setError(null)

      // Convert file to base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(",")[1]

        const response = await fetch("/api/documents", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patientId,
            appointmentId: appointmentId || undefined,
            fileName: selectedFile.name,
            fileType: selectedFile.type,
            fileData: base64Data,
          }),
        })

        if (!response.ok) {
          const result = await response.json()
          throw new Error(result.error || "Failed to upload document")
        }

        setSelectedFile(null)
        setShowUpload(false)
        fetchDocuments()
      }
      reader.readAsDataURL(selectedFile)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (documentId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (err: any) {
      console.error("Error downloading document:", err)
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Medical Documents</h2>
        <Button onClick={() => setShowUpload(!showUpload)} variant="outline" size="sm">
          {showUpload ? "Cancel" : "Upload Document"}
        </Button>
      </div>

      {/* Upload Form */}
      {showUpload && (
        <div className="mb-6 p-4 rounded-lg border bg-background">
          <div className="space-y-4">
            <div>
              <Label htmlFor="file">Select File</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {selectedFile && (
              <div className="flex items-center gap-2">
                <p className="text-sm">{selectedFile.name}</p>
                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  size="sm"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Documents List */}
      {loading ? (
        <p className="text-center py-4 text-muted-foreground">Loading documents...</p>
      ) : documents.length === 0 ? (
        <p className="text-center py-4 text-muted-foreground">
          No documents uploaded yet.
        </p>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-background"
            >
              <div className="flex-1">
                <p className="font-medium">{doc.fileName}</p>
                <p className="text-sm text-muted-foreground">
                  Uploaded by {doc.uploader.firstName} {doc.uploader.lastName} on{" "}
                  {formatDate(doc.uploadedAt)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleDownload(doc.id, doc.fileName)}
                  variant="outline"
                  size="sm"
                >
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


