"use client"

import * as React from "react"
import { z } from "zod"
import { ColumnDef } from "@tanstack/react-table"
import { IconDotsVertical, IconPlus } from "@tabler/icons-react"
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

// 1. Define Zod Schema (โครงสร้างข้อมูล)
export const organizationSchema = z.object({
  id: z.string(),
  organizationName: z.string(),
  contactName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  status: z.string(), // "Active" | "Inactive"
})

export type Organization = z.infer<typeof organizationSchema>

// 2. Helper Component: ฟอร์มสำหรับเพิ่ม/แก้ไข (ใช้ใน Drawer)
type OrganizationFormProps = {
  mode: "create" | "edit"
  organization?: Organization
  onSave: (organization: Organization) => void
  children: React.ReactNode // นี่คือปุ่ม Trigger
}

export function OrganizationFormDrawer({
  mode,
  organization,
  onSave,
  children,
}: OrganizationFormProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(false)
  const [formData, setFormData] = React.useState(
    organization || {
      id: mode === "create" ? `ORG-${Date.now()}` : "",
      organizationName: "",
      contactName: "",
      email: "",
      phone: "",
      status: "Active",
    }
  )

  React.useEffect(() => {
    // Reset form data if organization prop changes (for editing)
    if (organization) {
      setFormData(organization)
    }
  }, [organization, open])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // เพิ่มการ validate ด้วย Zod ตรงนี้ได้
    try {
      organizationSchema.parse(formData)
      onSave(formData)
      toast.success(
        mode === "create"
          ? "สร้างองค์กรสำเร็จ!"
          : "บันทึกการเปลี่ยนแปลงสำเร็จ!"
      )
      setOpen(false)
      // Reset form for "create" mode
      if (mode === "create") {
        setFormData({
          id: `ORG-${Date.now()}`,
          organizationName: "",
          contactName: "",
          email: "",
          phone: "",
          status: "Active",
        })
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues.map((err) => err.message).join(", "))
      }
    }
  }

  const title = mode === "create" ? "เพิ่มองค์กรใหม่" : "แก้ไขข้อมูลองค์กร"
  const description =
    mode === "create"
      ? "กรอกรายละเอียดเพื่อสร้างองค์กรลูกค้าใหม่"
      : `กำลังแก้ไขข้อมูลของ ${organization?.organizationName}`

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
            <Label htmlFor="organizationName">ชื่อองค์กร</Label>
            <Input
              id="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="contactName">ชื่อผู้ติดต่อ</Label>
            <Input
              id="contactName"
              value={formData.contactName}
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
            <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="status">สถานะ</Label>
            <Select
              value={formData.status}
              onValueChange={handleStatusChange}
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
// ฟังก์ชันนี้จะรับ "handler" (ฟังก์ชันที่มาจาก page) เพื่อให้ปุ่มในตารางสามารถอัปเดต state ที่ page ได้
export const getColumns = (
  onEdit: (org: Organization) => void,
  onDelete: (id: string) => void
): ColumnDef<Organization>[] => [
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
    accessorKey: "organizationName",
    header: "ชื่อองค์กร",
    cell: ({ row }) => {
      // ทำให้ชื่อองค์กรเป็นปุ่มสำหรับ Edit
      return (
        <Button
          variant="link"
          className="text-foreground w-fit px-0 text-left"
          onClick={() => onEdit(row.original)}
        >
          {row.original.organizationName}
        </Button>
      )
    },
  },
  {
    accessorKey: "contactName",
    header: "ผู้ติดต่อ",
  },
  {
    accessorKey: "email",
    header: "อีเมล",
  },
  {
    accessorKey: "phone",
    header: "เบอร์โทรศัพท์",
  },
  {
    accessorKey: "status",
    header: "สถานะ",
    cell: ({ row }) => {
      const isActive = row.original.status === "Active"
      return (
        <Badge variant={isActive ? "default" : "outline"} className={isActive ? "bg-green-600 dark:bg-green-500" : "text-muted-foreground"}>
          {row.original.status}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const organization = row.original

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
            <DropdownMenuItem onClick={() => onEdit(organization)}>
              แก้ไข
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                // เพิ่มการยืนยันก่อนลบ
                if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบองค์กรนี้?")) {
                  onDelete(organization.id)
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