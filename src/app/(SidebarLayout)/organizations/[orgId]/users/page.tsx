"use client"

import * as React from "react"
import { z } from "zod"
import { IconPlus, IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"
import { useParams } from "next/navigation" // ✅ 1. Import useParams

import { Button } from "@/components/ui/button"
import { ReusableDataTable } from "@/components/reusable-data-table"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import {
  getColumns,
  UserFormDrawer,
  userSchema,
  type User,
} from "./columns"
import initialData from "./data.json"

// Validate data with Zod
const validatedData = z.array(userSchema).parse(initialData)

// ✅ 2. ลบ params ออกจาก props ของ Component
export default function OrgUsersPage() {
  // ✅ 3. ใช้ useParams hook เพื่อดึงค่า params
  const params = useParams()
  const orgId = params.orgId as string // orgId จะเป็น string ที่ถูกต้อง

  // ในโลกจริง: คุณจะใช้ orgId นี้เพื่อ fetch ข้อมูลผู้ใช้จาก API
  // ตอนนี้: เราจะกรองข้อมูลจาก data.json จำลอง
  const [data, setData] = React.useState<User[]>(
    // ✅ 4. ตอนนี้ orgId เป็น string ธรรมดา ใช้งานได้เลย
    validatedData.filter((user) => user.orgId === orgId)
  )

  // State เพื่อเก็บข้อมูลผู้ใช้ที่จะแก้ไข
  const [editingUser, setEditingUser] = React.useState<User | undefined>(
    undefined
  )

  // Handler สำหรับบันทึก (ทั้งสร้างใหม่และแก้ไข)
  const handleSave = (user: User) => {
    const exists = data.some((item) => item.id === user.id)

    if (exists) {
      // Update
      setData((prev) =>
        prev.map((item) => (item.id === user.id ? user : item))
      )
    } else {
      // Create
      setData((prev) => [user, ...prev])
    }
    setEditingUser(undefined)
  }

  // Handler สำหรับการลบ
  const handleDelete = (id: string) => {
    setData((prev) => prev.filter((item) => item.id !== id))
    toast.success("ลบผู้ใช้สำเร็จ!")
  }

  // Handler สำหรับการกดปุ่ม "แก้ไข"
  const handleEdit = (user: User) => {
    setEditingUser(user)
    document.getElementById(`edit-trigger-${user.id}`)?.click()
  }

  // สร้าง columns object
  const columns = React.useMemo(
    () => getColumns(handleEdit, handleDelete),
    [data]
  )

  // ✅ 5. ใช้ orgId ที่ได้จาก hook
  const orgName = `องค์กร ${orgId.replace("ORG-", "")}` // ชื่อจำลอง

  return (
    <div className="flex flex-1 flex-col">
      {/* ซ่อน Drawer Trigger สำหรับ "แก้ไข" ไว้ */}
      {data.map((user) => (
        <UserFormDrawer
          key={user.id}
          mode="edit"
          user={user}
          orgId={orgId} // ✅ 6. ส่ง orgId ที่ได้จาก hook
          onSave={handleSave}
        >
          <button id={`edit-trigger-${user.id}`} style={{ display: "none" }}>
            Edit
          </button>
        </UserFormDrawer>
      ))}

      {/* Header ของหน้า */}
      <div className="flex flex-col items-start justify-between gap-4 p-4 md:flex-row md:items-center md:p-6">
        <div>
          {/* ปุ่มกลับหน้าองค์กร */}
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
            จัดการผู้ใช้ ({orgName})
          </h1>
          <p className="text-muted-foreground text-sm">
            เพิ่ม ลบ หรือแก้ไขข้อมูลผู้ใช้สำหรับองค์กรนี้
          </p>
        </div>

        {/* ปุ่มเพิ่มผู้ใช้ */}
        <UserFormDrawer
          mode="create"
          orgId={orgId} // ✅ 7. ส่ง orgId ที่ได้จาก hook
          onSave={handleSave}
        >
          <Button className="w-full md:w-auto">
            <IconPlus className="mr-0 md:mr-2" />
            <span className="hidden md:inline">เพิ่มผู้ใช้</span>
            <span className="md:hidden">เพิ่มผู้ใช้ใหม่</span>
          </Button>
        </UserFormDrawer>
      </div>

      {/* ตาราง */}
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 px-4 pb-4 md:gap-6 md:px-6 md:pb-6">
          <ReusableDataTable
            columns={columns}
            data={data}
            filterColumnId="name"
            filterPlaceholder="ค้นหาชื่อผู้ใช้..."
          />
        </div>
      </div>

      <Toaster richColors />
    </div>
  )
}