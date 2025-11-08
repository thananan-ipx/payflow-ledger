"use client"

import * as React from "react"
import { z } from "zod"
import { IconPlus, IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { ReusableDataTable } from "@/components/reusable-data-table"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import {
  getColumns,
  ExpenseFormDrawer,
  expenseSchema,
  type Expense,
} from "./columns"
import initialData from "./data.json"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

// Validate data with Zod
const validatedData = z.array(expenseSchema).parse(initialData)

// --- ตัวช่วยสำหรับ Dropdown เดือน/ปี ---
const currentSystemYear = new Date().getFullYear()
const years = Array.from({ length: 5 }, (_, i) =>
  (currentSystemYear - i).toString()
)
const months = [
  { value: "1", label: "มกราคม" },
  { value: "2", label: "กุมภาพันธ์" },
  { value: "3", label: "มีนาคม" },
  { value: "4", label: "เมษายน" },
  { value: "5", label: "พฤษภาคม" },
  { value: "6", label: "มิถุนายน" },
  { value: "7", label: "กรกฎาคม" },
  { value: "8", label: "สิงหาคม" },
  { value: "9", label: "กันยายน" },
  { value: "10", label: "ตุลาคม" },
  { value: "11", label: "พฤศจิกายน" },
  { value: "12", label: "ธันวาคม" },
]
// -------------------------------------

export default function OrgLedgerPage() {
  const params = useParams()
  const orgId = params.orgId as string

  // State สำหรับเก็บข้อมูลทั้งหมด (เพื่อการแก้ไข/ลบ)
  const [allData, setAllData] = React.useState<Expense[]>(
    validatedData.filter((expense) => expense.orgId === orgId)
  )
  
  // State สำหรับเก็บข้อมูลที่จะแก้ไข
  const [editingExpense, setEditingExpense] = React.useState<
    Expense | undefined
  >(undefined)

  // State สำหรับตัวเลือก เดือน/ปี
  const [selectedYear, setSelectedYear] = React.useState(
    currentSystemYear.toString()
  )
  const [selectedMonth, setSelectedMonth] = React.useState(
    (new Date().getMonth() + 1).toString() // เดือนปัจจุบัน (1-12)
  )

  // กรองข้อมูลที่จะแสดงในตาราง ตามเดือน/ปี ที่เลือก
  const displayData = React.useMemo(() => {
    const yearNum = parseInt(selectedYear)
    const monthNum = parseInt(selectedMonth)
    return allData.filter((d) => {
      const date = new Date(d.expenseDate)
      return (
        date.getFullYear() === yearNum && date.getMonth() + 1 === monthNum
      )
    })
  }, [allData, selectedYear, selectedMonth])

  // Handler สำหรับบันทึก (ทั้งสร้างใหม่และแก้ไข)
  const handleSave = (expense: Expense) => {
    const exists = allData.some((item) => item.id === expense.id)
    if (exists) {
      // Update
      setAllData((prev) =>
        prev.map((item) => (item.id === expense.id ? expense : item))
      )
    } else {
      // Create
      setAllData((prev) => [expense, ...prev])
    }
    setEditingExpense(undefined)
  }

  // Handler สำหรับการลบ
  const handleDelete = (id: string) => {
    setAllData((prev) => prev.filter((item) => item.id !== id))
    toast.success("ลบรายการสำเร็จ!")
  }

  // Handler สำหรับการกดปุ่ม "แก้ไข"
  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    document.getElementById(`edit-trigger-${expense.id}`)?.click()
  }

  // สร้าง columns object (ส่ง "ปี" ปัจจุบันเข้าไปเพื่อเช็กการล็อก)
  const columns = React.useMemo(
    () => getColumns(handleEdit, handleDelete, currentSystemYear),
    [allData, currentSystemYear]
  )

  const orgName = `องค์กร ${orgId.replace("ORG-", "")}` // ชื่อจำลอง

  return (
    <div className="flex flex-1 flex-col">
      {/* ซ่อน Drawer Trigger สำหรับ "แก้ไข" ไว้ */}
      {allData.map((expense) => (
        <ExpenseFormDrawer
          key={expense.id}
          mode="edit"
          expense={expense}
          orgId={orgId}
          onSave={handleSave}
        >
          <button id={`edit-trigger-${expense.id}`} style={{ display: "none" }}>
            Edit
          </button>
        </ExpenseFormDrawer>
      ))}

      {/* Header ของหน้า */}
      <div className="flex flex-col items-start justify-between gap-4 p-4 md:flex-row md:items-center md:p-6">
        <div>
          <Button
            variant="link"
            asChild
            className="text-muted-foreground -ml-4 mb-1"
          >
            <Link href="/organizations">
              <IconArrowLeft className="mr-2 size-4" />
              กลับไปหน้าองค์กร
            </Link>
          </Button>
          <h1 className="text-xl font-semibold md:text-2xl">
            บันทึกรายจ่าย ({orgName})
          </h1>
          <p className="text-muted-foreground text-sm">
            เลือกงวดบัญชี และเพิ่ม/แก้ไข รายการค่าใช้จ่าย
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
          {/* --- ตัวเลือก เดือน/ปี --- */}
          <div className="flex items-center gap-2">
            <Label htmlFor="month-select" className="hidden md:block">
              เดือน
            </Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger id="month-select" className="w-full md:w-40">
                <SelectValue placeholder="เลือกเดือน" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="year-select" className="hidden md:block">
              ปี
            </Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger id="year-select" className="w-full md:w-28">
                <SelectValue placeholder="เลือกปี" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* --- ปุ่มเพิ่มรายการ --- */}
          <ExpenseFormDrawer mode="create" orgId={orgId} onSave={handleSave}>
            <Button className="w-full md:w-auto">
              <IconPlus className="mr-0 md:mr-2" />
              <span className="hidden md:inline">เพิ่มรายการ</span>
              <span className="md:hidden">เพิ่มรายการใหม่</span>
            </Button>
          </ExpenseFormDrawer>
        </div>
      </div>

      {/* ตาราง */}
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 px-4 pb-4 md:gap-6 md:px-6 md:pb-6">
          <ReusableDataTable
            columns={columns}
            data={displayData} // ใช้ข้อมูลที่กรองแล้ว
            filterColumnId="description"
            filterPlaceholder="ค้นหารายละเอียด..."
          />
        </div>
      </div>

      <Toaster richColors />
    </div>
  )
}