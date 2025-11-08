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
  OrganizationFormDrawer,
  organizationSchema,
  type Organization,
} from "./columns"
import initialData from "./data.json"

// Validate data with Zod (optional but recommended)
const validatedData = z.array(organizationSchema).parse(initialData)

export default function OrganizationsPage() {
  // ใช้ State เพื่อจัดการข้อมูล (เพื่อให้ลบ/เพิ่ม/แก้ไขได้)
  const [data, setData] = React.useState<Organization[]>(validatedData)

  // State เพื่อเก็บข้อมูลองค์กรที่จะแก้ไข
  const [editingOrg, setEditingOrg] = React.useState<Organization | undefined>(
    undefined
  )

  // Handler สำหรับบันทึก (ทั้งสร้างใหม่และแก้ไข)
  const handleSave = (org: Organization) => {
    const exists = data.some((item) => item.id === org.id)

    if (exists) {
      // Update
      setData((prev) =>
        prev.map((item) => (item.id === org.id ? org : item))
      )
    } else {
      // Create
      setData((prev) => [org, ...prev])
    }
    setEditingOrg(undefined) // เคลียร์ค่า org ที่กำลังแก้ไข
  }

  // Handler สำหรับการลบ
  const handleDelete = (id: string) => {
    setData((prev) => prev.filter((item) => item.id !== id))
    toast.success("ลบองค์กรสำเร็จ!")
  }

  // Handler สำหรับการกดปุ่ม "แก้ไข"
  const handleEdit = (org: Organization) => {
    setEditingOrg(org)
    // เราต้องเปิด Drawer จากตรงนี้
    // Hack: ใช้ ID เพื่อ trigger ปุ่ม Drawer ที่เราซ่อนไว้
    document.getElementById(`edit-trigger-${org.id}`)?.click()
  }

  // สร้าง columns object พร้อมกับส่ง handler functions เข้าไป
  const columns = React.useMemo(
    () => getColumns(handleEdit, handleDelete),
    [data] // Re-create columns if data changes (เพื่อให้ handler มี data ที่อัปเดต)
  )

  return (
    <div className="flex flex-1 flex-col">
      {/* ซ่อน Drawer Trigger สำหรับ "แก้ไข" ไว้ */}
      {/* เราจะ trigger มันด้วย code ผ่าน `handleEdit` */}
      {data.map((org) => (
        <OrganizationFormDrawer
          key={org.id}
          mode="edit"
          organization={org}
          onSave={handleSave}
        >
          <button id={`edit-trigger-${org.id}`} style={{ display: "none" }}>
            Edit
          </button>
        </OrganizationFormDrawer>
      ))}

      {/* Header ของหน้า (ปรับปรุงให้ Responsive) */}
      <div className="flex flex-col items-start justify-between gap-4 p-4 md:flex-row md:items-center md:p-6">
        <div>
          <h1 className="text-xl font-semibold md:text-2xl">
            จัดการองค์กรลูกค้า
          </h1>
          <p className="text-muted-foreground text-sm">
            เพิ่ม ลบ หรือแก้ไขข้อมูลองค์กรลูกค้าของคุณ
          </p>
        </div>

        {/* ปุ่มเพิ่มองค์กร (ใช้ Drawer เดียวกันกับ "แก้ไข" แต่คนละ mode) */}
        <OrganizationFormDrawer mode="create" onSave={handleSave}>
          {/* ✅ Responsive Button: ซ่อนข้อความในจอมือถือ */}
          <Button className="w-full md:w-auto">
            <IconPlus className="mr-0 md:mr-2" />
            <span className="hidden md:inline">เพิ่มองค์กร</span>
            <span className="md:hidden">เพิ่มองค์กรใหม่</span>
          </Button>
        </OrganizationFormDrawer>
      </div>

      {/* ตาราง */}
      <div className="@container/main flex flex-1 flex-col gap-2">
        {/* ✅ Responsive Padding: เพิ่ม px-4 และ md:px-6 */}
        <div className="flex flex-col gap-4 px-4 pb-4 md:gap-6 md:px-6 md:pb-6">
          <ReusableDataTable
            columns={columns}
            data={data}
            filterColumnId="organizationName" // บอกตารางว่าให้ค้นหาจากคอลัมน์นี้
            filterPlaceholder="ค้นหาชื่อองค์กร..."
          />
        </div>
      </div>

      {/* เพิ่ม Toaster เพื่อให้ toast แสดงผล */}
      <Toaster richColors />
    </div>
  )
}