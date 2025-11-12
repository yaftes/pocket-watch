// import * as React from "react"
// import { Button } from "../components/ui/button"
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "../components/ui/popover"
// import {
//   Card,
//   CardAction,
//   CardContent,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "../components/ui/card"
// import BudgetForm, { type BudgetInputs } from "../components/budget/BudgetForm"
// import {
//   addBudget,
//   deleteBudget,
//   getBudgets,
//   updateBudget,
// } from "../api/budget_api"
// import { supabase } from "../api/supabase_client"
// import { useNavigate } from "react-router-dom"

// type Budget = {
//   id: number
//   category: string
//   amount: number
//   start_date: string
//   end_date: string
// }

// const Budgets = () => {
//   const [budgets, setBudgets] = React.useState<Budget[]>([])
//   const [editingBudget, setEditingBudget] = React.useState<Budget | null>(null)
//   const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)
//   const [loading, setLoading] = React.useState(false)
//   const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
//   const [userId, setUserId] = React.useState<string | null>(null)
  
//   const navigate = useNavigate()

//   React.useEffect(() => {
//     const fetchUserAndBudgets = async () => {
//       try {
//         setLoading(true)
//         const {
//           data: { user },
//           error,
//         } = await supabase.auth.getUser()
//         if (error) throw error
//         if (!user) {
//           setErrorMessage("You must be logged in to view budgets.")
//           return
//         }
//         setUserId(user.id)

//         const data = await getBudgets(user.id)
//         setBudgets(data)
//       } catch (err: any) {
//         setErrorMessage(err.message || "Something went wrong.")
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchUserAndBudgets()
//   }, [])

//   const handleDelete = async (id: number) => {
//     try {
//       setLoading(true)
//       await deleteBudget(id.toString())
//       setBudgets((prev) => prev.filter((b) => b.id !== id))
//     } catch (err: any) {
//       setErrorMessage(err.message || "Failed to delete budget.")
//     } finally {
//       setLoading(false)
//     }
//   }

  
//   const handleEdit = (budget: Budget) => {
//     setEditingBudget(budget)
//     setIsPopoverOpen(true)
//   }

  
//   const handleTransaction = (budgetId: number) => {
//     navigate(`/transactions/${budgetId}`)
//   }

  
//   const handleFormSubmit = async (data: BudgetInputs) => {
//     if (!userId) {
//       setErrorMessage("You must be logged in to perform this action.")
//       return
//     }

//     try {
//       setLoading(true)
//       setErrorMessage(null)

      
//       const today = new Date()
//       const startDate = today.toISOString().split("T")[0]

      
//       const endDate = data.end_date.toISOString().split("T")[0]
//       if (new Date(endDate) < new Date(startDate)) {
//         throw new Error("End date cannot be before the start date.")
//       }

//       if (editingBudget) {
        
//         const updated = await updateBudget(editingBudget.id.toString(), {
//           category: data.category,
//           amount: data.amount,
//           start_date: startDate,
//           end_date: endDate,
//         })
//         setBudgets((prev) =>
//           prev.map((b) => (b.id === editingBudget.id ? updated : b))
//         )
//         setEditingBudget(null)
//       } else {
        
//         const newBudget = await addBudget(userId, data.category, {
//           start_date: startDate,
//           end_date: endDate,
//           amount: data.amount,
//         })
//         setBudgets((prev) => [...prev, newBudget])
//       }

//       setIsPopoverOpen(false)
//     } catch (err: any) {
//       setErrorMessage(err.message || "Failed to save budget.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (

//     <div className="flex flex-col gap-6 p-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-semibold">Your Budgets</h1>
        
//         <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
//           <PopoverTrigger asChild>
//             <Button
//               variant="outline"
//               onClick={() => {
//                 setEditingBudget(null)
//                 setIsPopoverOpen(true)
//               }}
//             >
//               Create New Budget
//             </Button>
//           </PopoverTrigger>
//           <PopoverContent className="w-[450px] flex flex-col justify-center items-center p-4">
//             <BudgetForm
//               initialValues={
//                 editingBudget
//                   ? {
//                       category: editingBudget.category,
//                       amount: editingBudget.amount,
//                       start_date: new Date(editingBudget.start_date),
//                       end_date: new Date(editingBudget.end_date),
//                     }
//                   : {
//                       start_date: new Date(),
//                       end_date: new Date(),
//                       category: "",
//                       amount: 0,
//                     }
//               }
//               onSubmitForm={handleFormSubmit}
//               onDelete={
//                 editingBudget
//                   ? () => {
//                       handleDelete(editingBudget.id)
//                       setIsPopoverOpen(false)
//                     }
//                   : undefined
//               }
//             />
//           </PopoverContent>
//         </Popover>
//       </div>

//       {errorMessage && (
//         <div className="p-3 bg-red-100 text-red-600 rounded-md text-center">
//           {errorMessage}
//         </div>
//       )}

//       {loading ? (
//         <p className="text-center text-gray-500">Loading budgets...</p>
//       ) : budgets.length === 0 ? (
//         <p className="text-center text-gray-500">No budgets found.</p>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {budgets.map((budget) => (

//             <Card key={budget.id}>
//               <CardHeader>
//                 <CardTitle>{budget.category}</CardTitle>
//                 <CardAction>{budget.amount}$</CardAction>
//               </CardHeader>
//               <CardContent className="flex flex-col gap-2">
//                 <p>
//                   <strong>Start Date:</strong> {budget.start_date}
//                 </p>
//                 <p>
//                   <strong>End Date:</strong> {budget.end_date}
//                 </p>
//               </CardContent>
//               <CardFooter className="flex justify-end gap-2">
//                 <Button
//                   variant="secondary"
//                   size="sm"
//                   onClick={() => handleTransaction(budget.id)}
//                 >
//                   Transactions
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => handleEdit(budget)}
//                 >
//                   Edit
//                 </Button>
//                 <Button
//                   variant="destructive"
//                   size="sm"
//                   onClick={() => handleDelete(budget.id)}
//                 >
//                   Delete
//                 </Button>
//               </CardFooter>
//             </Card>
            
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

// export default Budgets
