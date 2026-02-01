import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import * as z from "zod"

const updateAvailabilitySchema = z.object({
    weekly: z.array(
        z.object({
            dayOfWeek: z.number().min(0).max(6),
            startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
            endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
            isEnabled: z.boolean(),
        })
    ).optional(),
    blockedDates: z.array(
        z.object({
            date: z.string().datetime(), // ISO string
            reason: z.string().optional(),
        })
    ).optional(),
    unblockDates: z.array(z.string().datetime()).optional(), // dates to remove from blocked list
})

// GET /api/availability - Get current user's availability
export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Only doctors and admins can have availability
        if (session.user.role !== "doctor" && session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const [weeklyAvailability, blockedDates] = await Promise.all([
            prisma.availability.findMany({
                where: { userId: session.user.id },
                orderBy: { dayOfWeek: "asc" },
            }),
            prisma.blockedDate.findMany({
                where: {
                    userId: session.user.id,
                    date: { gte: new Date() } // Only future blocked dates
                },
                orderBy: { date: "asc" },
            }),
        ])

        return NextResponse.json({
            weekly: weeklyAvailability,
            blockedDates,
        })
    } catch (error) {
        console.error("Error fetching availability:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// PUT /api/availability - Update availability
export async function PUT(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        if (session.user.role !== "doctor" && session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await request.json()
        const validatedData = updateAvailabilitySchema.parse(body)

        // Transaction to ensure atomicity
        await prisma.$transaction(async (tx) => {
            // 1. Update Weekly Availability
            if (validatedData.weekly) {
                for (const item of validatedData.weekly) {
                    await tx.availability.upsert({
                        where: {
                            userId_dayOfWeek: {
                                userId: session.user.id,
                                dayOfWeek: item.dayOfWeek,
                            },
                        },
                        update: {
                            startTime: item.startTime,
                            endTime: item.endTime,
                            isEnabled: item.isEnabled,
                        },
                        create: {
                            userId: session.user.id,
                            dayOfWeek: item.dayOfWeek,
                            startTime: item.startTime,
                            endTime: item.endTime,
                            isEnabled: item.isEnabled,
                        },
                    })
                }
            }

            // 2. Add Blocked Dates
            if (validatedData.blockedDates) {
                for (const item of validatedData.blockedDates) {
                    // Check if already blocked
                    const date = new Date(item.date)
                    await tx.blockedDate.upsert({
                        where: {
                            userId_date: {
                                userId: session.user.id,
                                date: date,
                            },
                        },
                        update: {
                            reason: item.reason,
                        },
                        create: {
                            userId: session.user.id,
                            date: date,
                            reason: item.reason,
                        },
                    })
                }
            }

            // 3. Remove Blocked Dates (Unblock)
            if (validatedData.unblockDates) {
                for (const dateStr of validatedData.unblockDates) {
                    await tx.blockedDate.deleteMany({
                        where: {
                            userId: session.user.id,
                            date: new Date(dateStr),
                        },
                    })
                }
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid input data", details: error.errors },
                { status: 400 }
            )
        }

        console.error("Error updating availability:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
