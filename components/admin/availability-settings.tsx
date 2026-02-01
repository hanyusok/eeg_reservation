"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useMessages } from "@/lib/i18n-client"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon, Trash2, Plus } from "lucide-react"

type WeeklySchedule = {
    dayOfWeek: number
    startTime: string
    endTime: string
    isEnabled: boolean
}

type BlockedDate = {
    date: string // ISO
    reason?: string
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function AvailabilitySettings() {
    const { messages } = useMessages()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [weekly, setWeekly] = useState<WeeklySchedule[]>([])
    const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
    const [newBlockDate, setNewBlockDate] = useState<Date>()
    const [newBlockReason, setNewBlockReason] = useState("")

    useEffect(() => {
        fetchAvailability()
    }, [])

    const fetchAvailability = async () => {
        try {
            const res = await fetch("/api/availability")
            if (res.ok) {
                const data = await res.json()

                // Initialize weekly if empty
                let initialWeekly = data.weekly || []
                if (initialWeekly.length === 0) {
                    initialWeekly = Array.from({ length: 7 }, (_, i) => ({
                        dayOfWeek: i,
                        startTime: "09:00",
                        endTime: "17:00",
                        isEnabled: i > 0 && i < 6, // Mon-Fri default
                    }))
                }
                setWeekly(initialWeekly)
                setBlockedDates(data.blockedDates || [])
            }
        } catch (error) {
            console.error("Failed to fetch availability", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await fetch("/api/availability", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    weekly,
                    blockedDates,
                }),
            })
            alert("Settings saved successfully")
        } catch (error) {
            alert("Failed to save settings")
        } finally {
            setSaving(false)
        }
    }

    const toggleDay = (dayIndex: number) => {
        setWeekly(prev => prev.map(d =>
            d.dayOfWeek === dayIndex ? { ...d, isEnabled: !d.isEnabled } : d
        ))
    }

    const updateTime = (dayIndex: number, field: "startTime" | "endTime", value: string) => {
        setWeekly(prev => prev.map(d =>
            d.dayOfWeek === dayIndex ? { ...d, [field]: value } : d
        ))
    }

    const addBlockedDate = () => {
        if (!newBlockDate) return
        setBlockedDates(prev => [
            ...prev,
            { date: newBlockDate.toISOString(), reason: newBlockReason }
        ])
        setNewBlockDate(undefined)
        setNewBlockReason("")
    }

    const removeBlockedDate = (dateStr: string) => {
        setBlockedDates(prev => prev.filter(d => d.date !== dateStr))
        // Note: To properly implement unblocking in a single PUT, 
        // we might need to track 'unblockDates' separately if we want to delete from DB immediately,
        // but our API PUT handles blockedDates upsert. 
        // Wait, the API I wrote supports 'unblockDates' array for deletion.
        // For simplicity in this UI, I'm just removing from the 'upsert' list.
        // However, if the date strictly exists in DB, excluding it from PUT won't delete it unless logic is handled.
        // Let's verify my API logic.
        // The API has: 
        // // 2. Add Blocked Dates (upsert)
        // // 3. Remove Blocked Dates (deleteMany)
        // So I need to send `unblockDates` to actually remove them.
        // I will trigger a separate DELETE or handle state carefully.
        // For this iteration, let's keep it simple: We will just call the API to delete specifically if needed,
        // OR accumulate a list of "dates to delete".
        // I'll add an `unblockDates` state.
    }

    // Refined removal logic
    const [datesToUnblock, setDatesToUnblock] = useState<string[]>([])

    const handleRemoveDate = (dateStr: string) => {
        setBlockedDates(prev => prev.filter(d => d.date !== dateStr))
        setDatesToUnblock(prev => [...prev, dateStr])
    }

    const handleSaveWithUnblock = async () => {
        setSaving(true)
        try {
            await fetch("/api/availability", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    weekly,
                    blockedDates: blockedDates.filter(d => !datesToUnblock.includes(d.date)), // Ensure we don't upsert what we want to delete (though rare conflict)
                    unblockDates: datesToUnblock,
                }),
            })
            setDatesToUnblock([]) // Reset unblock list
            alert("Settings saved successfully")
            fetchAvailability() // Refresh
        } catch (error) {
            alert("Failed to save settings")
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div className="space-y-8">
            {/* Weekly Schedule */}
            <div className="rounded-lg border bg-card p-6">
                <h2 className="text-xl font-semibold mb-4">Weekly Schedule</h2>
                <div className="space-y-4">
                    {weekly.sort((a, b) => a.dayOfWeek - b.dayOfWeek).map((day) => (
                        <div key={day.dayOfWeek} className="flex items-center gap-4">
                            <div className="w-32 flex items-center gap-2">
                                <Checkbox
                                    id={`day-${day.dayOfWeek}`}
                                    checked={day.isEnabled}
                                    onCheckedChange={() => toggleDay(day.dayOfWeek)}
                                />
                                <Label htmlFor={`day-${day.dayOfWeek}`} className="cursor-pointer font-medium">
                                    {DAYS[day.dayOfWeek]}
                                </Label>
                            </div>

                            <div className={`flex items-center gap-2 ${!day.isEnabled ? "opacity-50 pointer-events-none" : ""}`}>
                                <Input
                                    type="time"
                                    className="w-32"
                                    value={day.startTime}
                                    onChange={(e) => updateTime(day.dayOfWeek, "startTime", e.target.value)}
                                />
                                <span>to</span>
                                <Input
                                    type="time"
                                    className="w-32"
                                    value={day.endTime}
                                    onChange={(e) => updateTime(day.dayOfWeek, "endTime", e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Blocked Dates */}
            <div className="rounded-lg border bg-card p-6">
                <h2 className="text-xl font-semibold mb-4">Blocked Dates</h2>

                <div className="flex gap-4 mb-6">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal", !newBlockDate && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {newBlockDate ? format(newBlockDate, "PPP") : "Pick a date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={newBlockDate}
                                onSelect={setNewBlockDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>

                    <Input
                        placeholder="Reason (Optional)"
                        value={newBlockReason}
                        onChange={(e) => setNewBlockReason(e.target.value)}
                        className="max-w-xs"
                    />

                    <Button onClick={addBlockedDate} disabled={!newBlockDate}>
                        <Plus className="h-4 w-4 mr-2" />
                        Block Date
                    </Button>
                </div>

                <div className="space-y-2">
                    {blockedDates.length === 0 && <p className="text-muted-foreground text-sm">No specific blocked dates.</p>}
                    {blockedDates.map((block, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-md bg-background">
                            <div>
                                <span className="font-medium">{format(new Date(block.date), "PPP")}</span>
                                {block.reason && <span className="ml-2 text-sm text-muted-foreground">({block.reason})</span>}
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveDate(block.date)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-start">
                <Button onClick={handleSaveWithUnblock} disabled={saving} size="lg">
                    {saving ? "Saving..." : "Save Settings"}
                </Button>
            </div>
        </div>
    )
}
