import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  addCategory,
  getCategoriesDashboardInfo,
  type CategoryDashboardInfo,
} from "../api/category_api";
import { addBudget } from "../api/budget_api";
import { addTransaction } from "../api/transaction_api";
import { getUserId, getUserInfo, isLoggedIn, signOut } from "../api/auth_api";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../components/ui/drawer";
import { ChartSkeleton } from "../components/skeletons/chart_skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Upload } from "lucide-react";
import Tesseract from "tesseract.js";


const categoriesList = ["Food", "Transport", "Shopping", "Entertainment", "Utilities", "Other"];

const extractAmount = (text: string): number => {
  const amountRegex = /(total|amount|balance)?\s*[:$]?\s*(\d+(\.\d{1,2})?)/gi;
  let match;
  let lastAmount = 0;
  while ((match = amountRegex.exec(text)) !== null) {
    lastAmount = parseFloat(match[2]);
  }
  return lastAmount;
};

const extractDate = (text: string): string => {
  const dateRegex =
    /(\d{4}[-/]\d{1,2}[-/]\d{1,2})|(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/;
  const match = text.match(dateRegex);
  return match ? match[0] : new Date().toISOString().split("T")[0];
};

const extractCategory = (text: string): string => {
  for (const cat of categoriesList) {
    if (text.toLowerCase().includes(cat.toLowerCase())) {
      return cat;
    }
  }
  return "Other";
};

const extractTextFromImage = async (file: File | string): Promise<string> => {
  try {
    const { data } = await Tesseract.recognize(file, "eng", {
      logger: (m) => console.log(m),
    });
    return data.text;
  } catch (error) {
    console.error("Error extracting text:", error);
    return "";
  }
};

const parseReceiptText = (text: string, userId: string) => {
  const amount = extractAmount(text);
  const date = extractDate(text);
  const category = extractCategory(text);

  return {
    user_id: userId,
    category,
    amount,
    note: text.slice(0, 150),
    created_at: date,
  };
};


type CategoryInputs = { title: string };
type TransactionInputs = { category: string; amount: number; note: string };

const Dashboard = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CategoryInputs>();
  const { register: registerTransaction, handleSubmit: handleTransactionSubmit, reset: resetTransaction, setValue } = useForm<TransactionInputs>();

  const [categories, setCategories] = useState<CategoryDashboardInfo[]>([]);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);

  const [budgetCategory, setBudgetCategory] = useState("");
  const [budgetAmount, setBudgetAmount] = useState<number | "">("");
  const [budgetStart, setBudgetStart] = useState("");
  const [budgetEnd, setBudgetEnd] = useState("");
  const [userInfo, setUserInfo] = useState("");

  const navigate = useNavigate();

  const fetchCategories = async () => {
    setFetchingCategories(true);
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
      const cats = await getCategoriesDashboardInfo(userId);
      setCategories(cats);
    } catch (err: any) {
      setCategoryError(err.message || "Failed to fetch data.");
    } finally {
      setFetchingCategories(false);
    }
  };

  const fetchUserInfo = async () => {
    const name = await getUserInfo();
    setUserInfo(name);
  };

  useEffect(() => {
    fetchUserInfo();
    fetchCategories();
  }, [navigate]);


  const onSubmitCategory = async (data: CategoryInputs) => {
    try {
      const userId = await getUserId();
      if (!userId) return navigate("/login", { replace: true });

      await addCategory(data.title, userId);
      reset();
      setCategoryError(null);
      setSuccessMessage("Category created successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchCategories();
    } catch (err: any) {
      setCategoryError(err.message || "Failed to add category.");
    }
  };


  const onSubmitTransaction = async (data: TransactionInputs) => {
    setTransactionError(null);
    setSuccessMessage(null);
    try {
      const userId = await getUserId();
      if (!userId) return navigate("/login", { replace: true });

      await addTransaction({
        user_id: userId,
        category: data.category,
        amount: Number(data.amount),
        note: data.note,
        created_at: new Date().toISOString(),
      });

      resetTransaction();
      setSuccessMessage("Transaction added successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchCategories();
    } catch (err: any) {
      setTransactionError(err.message || "Failed to add transaction.");
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
      setTimeout(() => setSuccessMessage(null), 3000);
      setBudgetCategory("");
      setBudgetAmount("");
      setBudgetStart("");
      setBudgetEnd("");
      fetchCategories();
    } catch (err: any) {
      setBudgetError(err.message || "Failed to create budget.");
    } finally {
      setLoading(false);
    }
  };

  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrText, setOcrText] = useState<string>("");

  const handleReceiptUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setOcrLoading(true);
    try {
      const userId = await getUserId();
      const text = await extractTextFromImage(file);
      setOcrText(text);
      const parsed = parseReceiptText(text, userId!);

      setValue("category", parsed.category);
      setValue("amount", parsed.amount);
      setValue("note", parsed.note);

      await addTransaction(parsed);
      setSuccessMessage("Transaction added from receipt!");
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchCategories();
    } catch (error: any) {
      setTransactionError("Failed to process receipt. Try again.");
    } finally {
      setOcrLoading(false);
    }
  };

  const chartData = useMemo(() => {
    return categories.map(cat => ({
      name: cat.title,
      totalBudget: cat.total_budget_amount,
      activeBudget: cat.is_there_active_budget ? cat.active_budget_amount || 0 : 0,
      budgetCount: cat.budget_count,
      totalTransactions: cat.total_transactions_amount || 0,
      transactionCount: cat.trasactions_count || 0,
      id: cat.id,
    }));
  }, [categories]);

  const handleBarClick = (data: any) => {
    if (data?.id) navigate(`/category/${data.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="flex justify-between items-start mb-6 gap-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-4 items-start">
         
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>Create New Category</MenubarTrigger>
              <MenubarContent className="p-3">
                <form onSubmit={handleSubmit(onSubmitCategory)} className="flex flex-col gap-2">
                  <Input placeholder="Category Title" {...register("title", { required: true })} />
                  {errors.title && <p className="text-red-500 text-sm">Title is required</p>}
                  <Button type="submit" className="bg-black text-white">Add Category</Button>
                </form>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>

       
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>Create New Budget</MenubarTrigger>
              <MenubarContent className="p-3 w-64 flex flex-col gap-2">
                <Select value={budgetCategory} onValueChange={setBudgetCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length > 0 ? (
                      categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.title}>{cat.title}</SelectItem>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 px-2 py-1">No categories found</p>
                    )}
                  </SelectContent>
                </Select>

                <Input type="number" placeholder="Amount" value={budgetAmount}
                       onChange={e => setBudgetAmount(Number(e.target.value))} />
                <Input type="date" value={budgetStart} onChange={e => setBudgetStart(e.target.value)} />
                <Input type="date" value={budgetEnd} onChange={e => setBudgetEnd(e.target.value)} />

                <Button onClick={handleAddBudget} disabled={loading} className="bg-black text-white hover:bg-gray-900">
                  {loading ? "Creating..." : "Add Budget"}
                </Button>
                {budgetError && <p className="text-red-500 text-sm">{budgetError}</p>}
              </MenubarContent>
            </MenubarMenu>
          </Menubar>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="cursor-pointer">
                <AvatarImage src="/path/to/profile.jpg" alt="User" />
                <AvatarFallback>{userInfo[0]}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate("/profile")}>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { signOut(); navigate("/login"); }}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {successMessage && (
        <Alert className="mb-4 bg-green-100 border-green-400">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      {(categoryError || budgetError || transactionError) && (
        <Alert className="mb-4 bg-red-100 border-red-400">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{categoryError || budgetError || transactionError}</AlertDescription>
        </Alert>
      )}

      {fetchingCategories ? (
        <ChartSkeleton />
      ) : categories.length > 0 ? (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Category Budget & Transactions Overview</h2>
          <ResponsiveContainer width="100%" height={450}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              onClick={(e) => handleBarClick(e.activePayload?.[0]?.payload)}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalBudget" fill="#2563eb" name="Total Budget $" radius={[4,4,0,0]} />
              <Bar dataKey="activeBudget" fill="#16a34a" name="Active Budget" radius={[4,4,0,0]} />
              <Bar dataKey="budgetCount" fill="#f59e0b" name="Budgets" radius={[4,4,0,0]} />
              <Bar dataKey="totalTransactions" fill="#ef4444" name="Total Transactions $" radius={[4,4,0,0]} />
              <Bar dataKey="transactionCount" fill="#8b5cf6" name="Transactions" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p>No categories to display.</p>
      )}

      <div className="flex justify-center items-center mt-8">
        <Drawer>
          <DrawerTrigger asChild>
            <Button className="bg-black text-white hover:bg-gray-800">Make Transaction</Button>
          </DrawerTrigger>
          <DrawerContent className="p-6">
            <DrawerHeader>
              <DrawerTitle>Create a New Transaction</DrawerTitle>
              <DrawerDescription>Upload a receipt and add transaction details.</DrawerDescription>
            </DrawerHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
              
             <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 cursor-pointer">
                <Upload className="h-10 w-10 text-gray-500 mb-2" />
                <p className="text-sm text-gray-500">{ocrLoading ? "Reading receipt..." : "Click or drag to upload receipt"}</p>
                <Input type="file" accept="image/*" onChange={handleReceiptUpload} className="hidden" />
              </label>

              <form onSubmit={handleTransactionSubmit(onSubmitTransaction)} className="flex flex-col gap-3">
                <Select
                  value={budgetCategory}
                  onValueChange={(value) => {
                    setBudgetCategory(value);
                    setValue("category", value);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length > 0 ? (
                      categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.title}>{cat.title}</SelectItem>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 px-2 py-1">No categories found</p>
                    )}
                  </SelectContent>
                </Select>

                <Input type="number" placeholder="Amount" {...registerTransaction("amount", { required: true })} />
                <Input placeholder="Note" {...registerTransaction("note")} />
                <Button type="submit" className="bg-black text-white hover:bg-gray-800">Submit Transaction</Button>
              </form>
            </div>

            <DrawerFooter>
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
