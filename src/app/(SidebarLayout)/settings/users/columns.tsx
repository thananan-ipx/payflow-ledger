"use client"

import * as React from "react"
import { z } from "zod"
import { ColumnDef } from "@tanstack/react-table"
import { IconDotsVertical } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"

// 1. Define Zod Schema
export const adminUserSchema = z.object({
  id: z.string(),
  name: z.string().min(3, "ต้องมีอย่างน้อย 3 ตัวอักษร"),
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  role: z.string(), // "Owner" | "Accountant" | "Assistant"
  status: z.string(), // "Active" | "Inactive"
})

export type AdminUser = z.infer<typeof adminUserSchema>

// 2. Helper Component: ฟอร์มสำหรับเพิ่ม/แก้ไข (ใช้ใน Drawer)
type AdminUserFormProps = {
  mode: "create" | "edit"
  user?: AdminUser
  onSave: (user: AdminUser) => void
  children: React.ReactNode // ปุ่ม Trigger
}

export function AdminUserFormDrawer({
  mode,
  user,
  onSave,
  children,
}: AdminUserFormProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(false)
  const [formData, setFormData] = React.useState(
    user || {
      id: mode === "create" ? `ADMIN-${Date.now()}` : "",
      name: "",
      email: "",
      role: "Assistant",
      status: "Active",
    }
  )

  React.useEffect(() => {
    if (user) {
      setFormData(user)
    } else if (mode === "create") {
      setFormData({
        id: `ADMIN-${Date.now()}`,
        name: "",
        email: "",
        role: "Assistant",
        status: "Active",
      })
    }
  }, [user, mode, open])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      adminUserSchema.parse(formData)
      onSave(formData)
      toast.success(
        mode === "create"
          ? "สร้างผู้ใช้แอดมินสำเร็จ!"
          : "บันทึกการเปลี่ยนแปลงสำเร็จ!"
      )
      setOpen(false)
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues.map((err) => err.message).join(", "))
      }
    }
  }

  const title =
    mode === "create" ? "เพิ่มผู้ใช้แอดมินใหม่" : "แก้ไขข้อมูลผู้ใช้แอดมิน"
  const description =
    mode === "create"
      ? "กรอกรายละเอียดเพื่อสร้างผู้ใช้ใหม่ในทีมของคุณ"
      : `กำลังแก้ไขข้อมูลของ ${user?.name}`

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={open}
      onOpenChange={setOpen}
    >
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 overflow-y-auto px-4 text-sm"
        >
          <div className="flex flex-col gap-3">
            <Label htmlFor="name">ชื่อผู้ใช้</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="email">อีเมล</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="role">บทบาท (Role)</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleSelectChange("role", value)}
            >
              <SelectTrigger id="role" className="w-full">
                <SelectValue placeholder="เลือกบทบาท" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Owner">Owner (จัดการทุกอย่าง)</SelectItem>
                <SelectItem value="Accountant">Accountant (จัดการลูกค้า)</SelectItem>
                <SelectItem value="Assistant">
                  Assistant (ช่วยงานทั่วไป)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="status">สถานะ</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleSelectChange("status", value)}
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="เลือกสถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DrawerFooter>
            <Button type="submit">บันทึก</Button>
            <DrawerClose asChild>
              <Button variant="outline">ยกเลิก</Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}

// 3. Define Columns
export const getColumns = (
  onEdit: (user: AdminUser) => void,
  onDelete: (id: string) => void
): ColumnDef<AdminUser>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "ชื่อผู้ใช้",
    cell: ({ row }) => (
      <Button
        variant="link"
        className="text-foreground w-fit px-0 text-left"
        onClick={() => onEdit(row.original)}
      >
        {row.original.name}
      </Button>
    ),
  },
  {
    accessorKey: "email",
    header: "อีเมล",
  },
  {
    accessorKey: "role",
    header: "บทบาท",
    cell: ({ row }) => {
      const role = row.original.role
      let variant: "default" | "secondary" | "outline" = "outline"
      if (role === "Owner") variant = "default"
      if (role === "Accountant") variant = "secondary"
      return <Badge variant={variant}>{role}</Badge>
    },
  },
  {
    accessorKey: "status",
    header: "สถานะ",
    cell: ({ row }) => {
      const isActive = row.original.status === "Active"
      return (
        <Badge
          variant={isActive ? "default" : "outline"}
          className={
            isActive
              ? "bg-green-600 dark:bg-green-500"
              : "text-muted-foreground"
          }
        >
          {row.original.status}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
            >
              <IconDotsVertical />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={() => onEdit(user)}>
              แก้ไข
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?")) {
                  onDelete(user.id)
                }
              }}
            >
              ลบ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]