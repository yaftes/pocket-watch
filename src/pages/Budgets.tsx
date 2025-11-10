import * as React from "react"
import { Button } from "../components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover"
import { Card, CardContent, CardFooter } from "../components/ui/card"
import BudgetForm, { type BudgetInputs } from "./BudgetForm"

type Budget = {
  id: number
  category: string
  amount: number
  start_date: string
  end_date: string
}

const mockBudgets: Budget[] = [
  {
    id: 1,
    category: "Food",
    amount: 200,
    start_date: "2025-11-01",
    end_date: "2025-11-30",
  },
  {
    id: 2,
    category: "Transport",
    amount: 150,
    start_date: "2025-11-01",
    end_date: "2025-11-30",
  },
]

const Budgets = () => {

  const [budgets, setBudgets] = React.useState<Budget[]>(mockBudgets)
  const [editingBudget, setEditingBudget] = React.useState<Budget | null>(null)
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)

  const handleDelete = (id: number) => {
    setBudgets(budgets.filter((budget) => budget.id !== id))
  }

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget)
    setIsPopoverOpen(true)
  }

  const handleFormSubmit = (data: BudgetInputs) => {
    if (editingBudget) {
      setBudgets((prev) =>
        prev.map((b) =>
          b.id === editingBudget.id
            ? { ...b, ...data, start_date: data.start_date.toISOString().split("T")[0], end_date: data.end_date.toISOString().split("T")[0] }
            : b
        )
      )
      setEditingBudget(null)
    } else {
      // Create new budget
      const newBudget: Budget = {
        id: budgets.length + 1,
        category: data.category,
        amount: data.amount,
        start_date: data.start_date.toISOString().split("T")[0],
        end_date: data.end_date.toISOString().split("T")[0],
      }
      setBudgets([...budgets, newBudget])
    }
    setIsPopoverOpen(false)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-end">
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" onClick={()=>{
                setEditingBudget(null);
            }}>
               Create New Budget
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[450px] flex flex-col justify-center items-center p-4">
            <BudgetForm
              initialValues={
                editingBudget
                  ? {
                      category: editingBudget.category,
                      amount: editingBudget.amount,
                      start_date: new Date(editingBudget.start_date),
                      end_date: new Date(editingBudget.end_date),
                    }
                  : undefined
              }
              onSubmitForm={handleFormSubmit}
              onDelete={
                editingBudget
                  ? () => {
                      handleDelete(editingBudget.id)
                      setIsPopoverOpen(false)
                    }
                  : undefined
              }
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((budget) => (
          <Card
            key={budget.id}
            className="shadow-xl rounded-xl transition-transform transform hover:-translate-y-1 hover:shadow-2xl bg-gradient-to-tr from-white via-gray-50 to-gray-100"
          >
            <CardContent className="flex flex-col gap-2">
              <p className="text-lg font-semibold">{budget.category}</p>
              <p>
                <strong>Amount:</strong> ${budget.amount}
              </p>
              <p>
                <strong>Start Date:</strong> {budget.start_date}
              </p>
              <p>
                <strong>End Date:</strong> {budget.end_date}
              </p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(budget)}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(budget.id)}
              >
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Budgets
