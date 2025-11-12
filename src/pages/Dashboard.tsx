import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  addCategory,
  getCategories,
  deleteCategory,
  type Category,
} from "../api/category_api";
import {
  addBudget,
  type Budget,
} from "../api/budget_api";
import { getUserId, isLoggedIn } from "../api/auth_api";
import { useNavigate } from "react-router-dom";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
} from "../components/ui/menubar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../components/ui/popover";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "../components/ui/drawer";

type CategoryInputs = { title: string };

const Dashboard = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CategoryInputs>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [deletePopoverOpen, setDeletePopoverOpen] = useState<string | null>(null);
  const [budgetPopoverOpen, setBudgetPopoverOpen] = useState(false);
  const [budgetCategory, setBudgetCategory] = useState("");
  const [budgetAmount, setBudgetAmount] = useState<number | "">("");
  const [budgetStart, setBudgetStart] = useState("");
  const [budgetEnd, setBudgetEnd] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const loggedIn = await isLoggedIn();
        if (!loggedIn) {
          navigate("/login", { replace: true });
          return;
        }

        const userId = await getUserId();
        if (!userId) {
          setCategoryError("User ID not found.");
          return;
        }

        const cats = await getCategories(userId);
        setCategories(cats);
      } catch (err: any) {
        setCategoryError(err.message || "Failed to fetch data.");
      }
    };
    fetchData();
  }, [navigate]);

  const chartData = [
    { month: "January", desktop: 186, mobile: 80 },
    { month: "February", desktop: 305, mobile: 200 },
    { month: "March", desktop: 237, mobile: 120 },
    { month: "April", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
    { month: "June", desktop: 214, mobile: 140 },
  ];



  const onSubmitCategory = async (data: CategoryInputs) => {
    try {
      const userId = await getUserId();
      if (!userId) return navigate("/login", { replace: true });

      const newCategory = await addCategory(data.title, userId);
      setCategories((prev) => [newCategory, ...prev]);
      reset();
      setCategoryError(null);
      setSuccessMessage("Category created successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setCategoryError(err.message || "Failed to add category.");
    }
  };

  const handleAddBudget = async () => {
    setLoading(true);
    setBudgetError(null);

    try {
      const userId = await getUserId();
      if (!userId) return navigate("/login", { replace: true });

      if (!budgetCategory || !budgetAmount || !budgetStart || !budgetEnd) {
        setBudgetError("All fields are required.");
        setLoading(false);
        return;
      }

      await addBudget(userId, budgetCategory, {
        amount: Number(budgetAmount),
        start_date: budgetStart,
        end_date: budgetEnd,
      });

      setSuccessMessage("Budget added successfully!");
      setBudgetCategory("");
      setBudgetAmount("");
      setBudgetStart("");
      setBudgetEnd("");
      setBudgetPopoverOpen(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setBudgetError(err.message || "Failed to create budget.");
    } finally {
      setLoading(false);
    }
  };



  const handleDeleteCategory = async (id?: string) => {
    if (!id) {
      setCategoryError("Category ID missing.");
      return;
    }

    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      setSuccessMessage("Category deleted successfully!");
      setDeletePopoverOpen(null);
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err: any) {
      setCategoryError(err.message || "Failed to delete category.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Create New Category</MenubarTrigger>
            <MenubarContent className="p-3">
              <form onSubmit={handleSubmit(onSubmitCategory)} className="flex flex-col gap-2">
                <Input placeholder="Category Title" {...register("title", { required: true })} />
                {errors.title && <p className="text-red-500 text-sm">Title is required</p>}
                <Button type="submit" className="bg-black text-white">
                  Add Category
                </Button>
              </form>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger>Create New Budget</MenubarTrigger>
            <MenubarContent className="p-3 w-64 flex flex-col gap-2">
              <Select value={budgetCategory} onValueChange={setBudgetCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.title}>
                        {cat.title}
                      </SelectItem>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 px-2 py-1">No categories found</p>
                  )}
                </SelectContent>
              </Select>

              <Input
                placeholder="Amount"
                type="number"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(Number(e.target.value))}
              />
              <Input
                type="date"
                value={budgetStart}
                onChange={(e) => setBudgetStart(e.target.value)}
              />
              <Input
                type="date"
                value={budgetEnd}
                onChange={(e) => setBudgetEnd(e.target.value)}
              />

              <Button
                onClick={handleAddBudget}
                disabled={loading}
                className="bg-black text-white hover:bg-gray-900"
              >
                {loading ? "Creating..." : "Add Budget"}
              </Button>

              {budgetError && <p className="text-red-500 text-sm">{budgetError}</p>}
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </header>

      {successMessage && (
        <Alert className="mb-4 bg-green-100 border-green-400">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      {(categoryError || budgetError) && (
        <Alert className="mb-4 bg-red-100 border-red-400">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{categoryError || budgetError}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between gap-5">

        <div className="w-1/3 bg-gray-50 p-4 rounded shadow flex items-center justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="desktop" fill="#2563eb" radius={[4,4,0,0]} />
              <Bar dataKey="mobile" fill="#60a5fa" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 h-[600px] overflow-y-auto space-y-4">
          {categories.length === 0 ? (
            <p>No categories yet.</p>
          ) : (
            categories.map((cat) => (
              <Card key={cat.id} className="shadow-md hover:shadow-lg transition-all w-full">
                <CardHeader>
                  <CardTitle>{cat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(cat.created_at || "").toLocaleString()}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Popover
                    open={deletePopoverOpen === cat.id}
                    onOpenChange={(open) =>
                      setDeletePopoverOpen(open ? cat.id ?? null : null)
                    }
                  >
                    <PopoverTrigger asChild>
                      <Button>Delete</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56">
                      <p className="mb-3 text-sm">
                        Delete <b>{cat.title}</b>?
                      </p>
                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() => setDeletePopoverOpen(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteCategory(cat.id)}
                        >
                          Yes, Delete
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Button
                    variant="outline"
                    onClick={() => navigate(`/category/${cat.id}`)}
                  >
                    Details
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>

      <div className="flex justify-center items-center">
        <Drawer>
          <DrawerTrigger>
            <Button>Make Transaction</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Are you absolutely sure?</DrawerTitle>
              <DrawerDescription>This action cannot be undone.</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <Button>Submit</Button>
              <DrawerClose>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

      </div>
    </div>
  );
};

export default Dashboard;
