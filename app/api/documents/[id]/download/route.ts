import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { readFile } from "fs/promises"
import { join } from "path"

// GET /api/documents/:id/download - Download document
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const document = await prisma.medicalDocument.findUnique({
      where: { id: params.id },
      include: {
        patient: true,
      },
    })

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Check permissions
    if (session.user.role === "parent") {
      if (document.patient.parentId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    } else if (session.user.role === "patient") {
      if (document.patient.userId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    } else if (session.user.role !== "admin" && session.user.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Read file
    const filePath = join(process.cwd(), document.filePath)
    const fileBuffer = await readFile(filePath)

    // Return file
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": document.fileType,
        "Content-Disposition": `attachment; filename="${document.fileName}"`,
      },
    })
  } catch (error) {
    console.error("Error downloading document:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


