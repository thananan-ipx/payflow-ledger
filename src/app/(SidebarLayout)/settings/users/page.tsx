"use client"

import * as React from "react"
import { z } from "zod"
import { IconPlus } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { ReusableDataTable } from "@/components/reusable-data-table"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import {
  getColumns,
  AdminUserFormDrawer,
  adminUserSchema,
  type AdminUser,
} from "./columns"
import initialData from "./data.json"

// Validate data with Zod
const validatedData = z.array(adminUserSchema).parse(initialData)

export default function AdminUsersPage() {
  const [data, setData] = React.useState<AdminUser[]>(validatedData)
  const [editingUser, setEditingUser] = React.useState<AdminUser | undefined>(
    undefined
  )

  // Handler สำหรับบันทึก (ทั้งสร้างใหม่และแก้ไข)
  const handleSave = (user: AdminUser) => {
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
    toast.success("ลบผู้ใช้แอดมินสำเร็จ!")
  }

  // Handler สำหรับการกดปุ่ม "แก้ไข"
  const handleEdit = (user: AdminUser) => {
    setEditingUser(user)
    document.getElementById(`edit-trigger-${user.id}`)?.click()
  }

  // สร้าง columns object
  const columns = React.useMemo(
    () => getColumns(handleEdit, handleDelete),
    [data]
  )

  return (
    <div className="flex flex-1 flex-col">
      {/* ซ่อน Drawer Trigger สำหรับ "แก้ไข" ไว้ */}
      {data.map((user) => (
        <AdminUserFormDrawer
          key={user.id}
          mode="edit"
          user={user}
          onSave={handleSave}
        >
          <button id={`edit-trigger-${user.id}`} style={{ display: "none" }}>
            Edit
          </button>
        </AdminUserFormDrawer>
      ))}

      {/* Header ของหน้า */}
      <div className="flex flex-col items-start justify-between gap-4 p-4 md:flex-row md:items-center md:p-6">
        <div>
          <h1 className="text-xl font-semibold md:text-2xl">
            จัดการทีมงาน (แอดมิน)
          </h1>
          <p className="text-muted-foreground text-sm">
            จัดการบัญชีผู้ใช้ของพนักงานในสำนักงานบัญชี
          </p>
        </div>

        {/* ปุ่มเพิ่มผู้ใช้ */}
        <AdminUserFormDrawer mode="create" onSave={handleSave}>
          <Button className="w-full md:w-auto">
            <IconPlus className="mr-0 md:mr-2" />
            <span className="hidden md:inline">เพิ่มทีมงาน</span>
            <span className="md:hidden">เพิ่มทีมงานใหม่</span>
          </Button>
        </AdminUserFormDrawer>
      </div>

      {/* ตาราง */}
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 px-4 pb-4 md:gap-6 md:px-6 md:pb-6">
          <ReusableDataTable
            columns={columns}
            data={data}
            filterColumnId="name"
            filterPlaceholder="ค้นหาชื่อทีมงาน..."
          />
        </div>
      </div>

      <Toaster richColors />
    </div>
  )
}