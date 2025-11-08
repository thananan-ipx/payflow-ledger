"use client"

import * as React from "react"
import { z } from "zod"
import { ColumnDef } from "@tanstack/react-table"
import {
  IconDotsVertical,
  IconFile,
  IconCircleCheckFilled,
  IconLoader,
  IconAlertCircle,
} from "@tabler/icons-react"
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

// 1. Define Zod Schema
export const expenseSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  expenseDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "วันที่ไม่ถูกต้อง",
  }),
  description: z.string().min(3, "ต้องมีอย่างน้อย 3 ตัวอักษร"),
  amount: z.coerce
    .number("ต้องเป็นตัวเลข")
    .positive("จำนวนเงินต้องมากกว่า 0"),
  paymentType: z.string().min(1, "กรุณาเลือกประเภทการจ่าย"),
  receiptStatus: z.string().min(1, "กรุณาเลือกสถานะใบเสร็จ"),
  notes: z.string().optional().default(""),
  fileName: z.string().optional().default(""),
})

export type Expense = z.infer<typeof expenseSchema>

// 2. Helper Component: ฟอร์มสำหรับเพิ่ม/แก้ไข (ใช้ใน Drawer)
type ExpenseFormProps = {
  mode: "create" | "edit"
  expense?: Expense
  orgId: string
  onSave: (expense: Expense) => void
  children: React.ReactNode // ปุ่ม Trigger
}

const paymentTypes = [
  "เงินสด",
  "เงินโอน",
  "กรรมการสำรองจ่าย",
  "บัตรเครดิต",
]
const receiptStatuses = [
  "มีใบเสร็จ",
  "ไม่มีใบเสร็จ",
  "โอนให้พนักงาน",
  "โอนให้ร้านค้า",
]

export function ExpenseFormDrawer({
  mode,
  expense,
  orgId,
  onSave,
  children,
}: ExpenseFormProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(false)
  const [formData, setFormData] = React.useState<Expense>(
    expense || {
      id: mode === "create" ? `EXP-${Date.now()}` : "",
      orgId: orgId,
      expenseDate: new Date().toISOString().split("T")[0], // วันที่ปัจจุบัน
      description: "",
      amount: 0,
      paymentType: "",
      receiptStatus: "",
      notes: "",
      fileName: "",
    }
  )

  React.useEffect(() => {
    if (open) {
      if (mode === "edit" && expense) {
        setFormData(expense)
      } else if (mode === "create") {
        setFormData({
          id: `EXP-${Date.now()}`,
          orgId: orgId,
          expenseDate: new Date().toISOString().split("T")[0],
          description: "",
          amount: 0,
          paymentType: "",
          receiptStatus: "",
          notes: "",
          fileName: "",
        })
      }
    }
  }, [expense, orgId, mode, open])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target
    if (type === "file") {
      const file = e.target.files?.[0]
      setFormData((prev) => ({ ...prev, fileName: file ? file.name : "" }))
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }))
    }
  }

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const validatedData = expenseSchema.parse(formData)
      onSave(validatedData)
      toast.success(
        mode === "create"
          ? "เพิ่มรายการสำเร็จ!"
          : "บันทึกการเปลี่ยนแปลงสำเร็จ!"
      )
      setOpen(false)
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues.map((err) => err.message).join(", "))
      }
    }
  }

  const title = mode === "create" ? "เพิ่มรายการค่าใช้จ่าย" : "แก้ไขรายการ"
  const description =
    mode === "create"
      ? "กรอกรายละเอียดค่าใช้จ่ายสำหรับงวดบัญชีนี้"
      : `กำลังแก้ไข: ${expense?.description}`

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
            <Label htmlFor="expenseDate">วันที่จ่าย</Label>
            <Input
              id="expenseDate"
              type="date"
              value={formData.expenseDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="description">รายละเอียดค่าใช้จ่าย</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="amount">จำนวนเงิน</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="paymentType">ประเภทการจ่าย</Label>
            <Select
              value={formData.paymentType}
              onValueChange={(value) =>
                handleSelectChange("paymentType", value)
              }
            >
              <SelectTrigger id="paymentType" className="w-full">
                <SelectValue placeholder="เลือกประเภท..." />
              </SelectTrigger>
              <SelectContent>
                {paymentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="receiptStatus">สถานะใบเสร็จ</Label>
            <Select
              value={formData.receiptStatus}
              onValueChange={(value) =>
                handleSelectChange("receiptStatus", value)
              }
            >
              <SelectTrigger id="receiptStatus" className="w-full">
                <SelectValue placeholder="เลือกสถานะ..." />
              </SelectTrigger>
              <SelectContent>
                {receiptStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="notes">หมายเหตุ</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="file">
              แนบใบเสร็จ (ถ้ามี)
              {formData.fileName && (
                <span className="text-muted-foreground ml-2">
                  (ไฟล์เดิม: {formData.fileName})
                </span>
              )}
            </Label>
            <Input id="file" type="file" onChange={handleChange} />
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
  onEdit: (expense: Expense) => void,
  onDelete: (id: string) => void,
  currentYear: number // รับปีปัจจุบันมาเช็ก
): ColumnDef<Expense>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "expenseDate",
    header: "วันที่จ่าย",
    cell: ({ row }) => {
      const date = new Date(row.original.expenseDate)
      return date.toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    },
  },
  {
    accessorKey: "description",
    header: "รายละเอียด",
    cell: ({ row }) => (
      <Button
        variant="link"
        className="text-foreground w-fit px-0 text-left"
        onClick={() => onEdit(row.original)}
      >
        {row.original.description}
      </Button>
    ),
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">จำนวนเงิน</div>,
    cell: ({ row }) => {
      const amount = row.original.amount
      return (
        <div className="text-right font-medium">
          {amount.toLocaleString("th-TH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      )
    },
  },
  {
    accessorKey: "paymentType",
    header: "ประเภทการจ่าย",
  },
  {
    accessorKey: "receiptStatus",
    header: "สถานะใบเสร็จ",
    cell: ({ row }) => {
      const status = row.original.receiptStatus
      let icon = <IconAlertCircle className="size-4" />
      if (status === "มีใบเสร็จ")
        icon = <IconCircleCheckFilled className="size-4 text-green-500" />
      if (status === "ไม่มีใบเสร็จ")
        icon = <IconAlertCircle className="size-4 text-red-500" />
      if (status.startsWith("โอนให้"))
        icon = <IconLoader className="size-4 text-blue-500" />

      return (
        <Badge variant="outline" className="flex items-center gap-1.5">
          {icon}
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "fileName",
    header: "ไฟล์แนบ",
    cell: ({ row }) => {
      if (!row.original.fileName) return "-"
      return (
        <Button variant="outline" size="icon" className="size-8">
          <IconFile className="size-4" />
          <span className="sr-only">ดูไฟล์</span>
        </Button>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const expense = row.original

      // --- ⭐️ นี่คือ Logic การล็อกข้อมูล ⭐️ ---
      const expenseYear = new Date(expense.expenseDate).getFullYear()
      const isLocked = expenseYear < currentYear
      // ------------------------------------

      const editButton = (
        <DropdownMenuItem
          onClick={() => onEdit(expense)}
          disabled={isLocked} // ล็อกปุ่ม
        >
          แก้ไข
        </DropdownMenuItem>
      )

      const deleteButton = (
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) {
              onDelete(expense.id)
            }
          }}
          disabled={isLocked} // ล็อกปุ่ม
        >
          ลบ
        </DropdownMenuItem>
      )

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
            {/* ถ้าล็อก ให้แสดง Tooltip อธิบาย */}
            {isLocked ? (
              <Tooltip>
                <TooltipTrigger asChild>{editButton}</TooltipTrigger>
                <TooltipContent>
                  <p>ไม่สามารถแก้ไขรายการของปีก่อนหน้าได้</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              editButton
            )}
            <DropdownMenuSeparator />
            {isLocked ? (
              <Tooltip>
                <TooltipTrigger asChild>{deleteButton}</TooltipTrigger>
                <TooltipContent>
                  <p>ไม่สามารถลบรายการของปีก่อนหน้าได้</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              deleteButton
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]