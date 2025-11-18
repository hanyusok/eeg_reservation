import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import * as z from "zod"

const uploadDocumentSchema = z.object({
  patientId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  fileName: z.string().min(1),
  fileType: z.string().min(1),
  fileData: z.string(), // Base64 encoded file
})

// GET /api/documents - List documents
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patientId")
    const appointmentId = searchParams.get("appointmentId")

    let where: any = {}

    if (patientId) {
      where.patientId = patientId
    }

    if (appointmentId) {
      where.appointmentId = appointmentId
    }

    // Check permissions
    if (session.user.role === "parent") {
      // Parent can only see documents for their children
      const patients = await prisma.patient.findMany({
        where: { parentId: session.user.id },
        select: { id: true },
      })
      where.patientId = {
        in: patients.map((p) => p.id),
      }
    } else if (session.user.role === "patient") {
      // Patient can only see their own documents
      const patient = await prisma.patient.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      })
      if (patient) {
        where.patientId = patient.id
      } else {
        return NextResponse.json({ documents: [] })
      }
    } else if (session.user.role !== "admin" && session.user.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const documents = await prisma.medicalDocument.findMany({
      where,
      include: {
        patient: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        uploader: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        uploadedAt: "desc",
      },
    })

    return NextResponse.json({ documents })
  } catch (error) {
    console.error("Error fetching documents:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/documents - Upload document
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = uploadDocumentSchema.parse(body)

    // Verify patient exists and user has access
    const patient = await prisma.patient.findUnique({
      where: { id: validatedData.patientId },
    })

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    // Check permissions
    if (session.user.role === "parent") {
      if (patient.parentId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    } else if (session.user.role === "patient") {
      if (patient.userId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    } else if (session.user.role !== "admin" && session.user.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "uploads", "documents")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Save file
    const fileId = `${Date.now()}-${Math.random().toString(36).substring(7)}`
    const fileExtension = validatedData.fileName.split(".").pop()
    const savedFileName = `${fileId}.${fileExtension}`
    const filePath = join(uploadsDir, savedFileName)

    // Decode base64 and save
    const fileBuffer = Buffer.from(validatedData.fileData, "base64")
    await writeFile(filePath, fileBuffer)

    // Create document record
    const document = await prisma.medicalDocument.create({
      data: {
        patientId: validatedData.patientId,
        appointmentId: validatedData.appointmentId,
        fileName: validatedData.fileName,
        filePath: `/uploads/documents/${savedFileName}`,
        fileType: validatedData.fileType,
        uploadedBy: session.user.id,
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "document_uploaded",
        entityType: "medical_document",
        entityId: document.id,
        details: {
          fileName: validatedData.fileName,
          fileType: validatedData.fileType,
          patientId: validatedData.patientId,
        },
      },
    })

    return NextResponse.json({ document }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error uploading document:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

