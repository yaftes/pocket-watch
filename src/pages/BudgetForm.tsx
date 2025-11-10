import * as React from "react"
import { useForm } from "react-hook-form"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "../components/ui/button"
import { Calendar } from "../components/ui/calendar"
import { Label } from "../components/ui/label"
import { Input } from "../components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"

export type BudgetInputs = {
  category: string
  amount: number
  start_date: Date
  end_date: Date
}

type BudgetFormProps = {
  initialValues?: Partial<BudgetInputs>
  onSubmitForm: (data: BudgetInputs) => void
  onDelete?: () => void
}

const BudgetForm: React.FC<BudgetFormProps> = ({
  initialValues,
  onSubmitForm,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<BudgetInputs>({
    defaultValues: initialValues,
  })

  const [openStart, setOpenStart] = React.useState(false)
  const [openEnd, setOpenEnd] = React.useState(false)
  const [startDate, setStartDate] = React.useState<Date | undefined>(
    initialValues?.start_date
  )
  const [endDate, setEndDate] = React.useState<Date | undefined>(
    initialValues?.end_date
  )

  const onSubmit = (data: BudgetInputs) => {
    onSubmitForm(data)
    reset()
    setStartDate(undefined)
    setEndDate(undefined)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6 p-6 max-w-lg mx-auto"
    >
      <div className="flex flex-col gap-1">
        <Label htmlFor="category">Category</Label>
        <Select onValueChange={(value) => setValue("category", value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="food">Food</SelectItem>
            <SelectItem value="transport">Transport</SelectItem>
            <SelectItem value="entertainment">Entertainment</SelectItem>
            <SelectItem value="utilities">Utilities</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        {errors.category && (
          <span className="text-red-500 text-sm">Category is required</span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          placeholder="Enter amount"
          {...register("amount", { required: true, valueAsNumber: true })}
        />
        {errors.amount && (
          <span className="text-red-500 text-sm">Amount is required</span>
        )}
      </div>


      <div className="flex gap-4 flex-wrap justify-between">
      
        <div className="flex flex-col gap-1">
          <Label>Start Date</Label>
          <Popover open={openStart} onOpenChange={setOpenStart}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-48 justify-between font-normal"
              >
                {startDate ? startDate.toLocaleDateString() : "Select start date"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="center"
              className="p-0 border-none shadow-lg"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minWidth: "auto",
              }}
            >
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                  setStartDate(date)
                  setValue("start_date", date!)
                  setOpenStart(false)
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-1">
          <Label>End Date</Label>
          <Popover open={openEnd} onOpenChange={setOpenEnd}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-48 justify-between font-normal"
              >
                {endDate ? endDate.toLocaleDateString() : "Select end date"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="center"
              className="p-0 border-none shadow-lg"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minWidth: "auto",
              }}
            >
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => {
                  setEndDate(date)
                  setValue("end_date", date!)
                  setOpenEnd(false)
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="submit">{initialValues ? "Update" : "Create"}</Button>
      </div>
    </form>
  )
}

export default BudgetForm
