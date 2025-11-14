import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  addCategory,
  getCategoriesDashboardInfo,
  type CategoryDashboardInfo,
} from "../api/category_api";
import { addBudget } from "../api/budget_api";
import { addTransaction } from "../api/transaction_api";
import { getUserId, getUserInfo, isLoggedIn } from "../api/auth_api";
import { useNavigate } from "react-router-dom";
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
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  Calendar as CalendarIcon,
  Layers,
  Sparkles,
  TrendingUp,
  Upload,
  Wallet,
  Lightbulb,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Calendar } from "../components/ui/calendar";
import { cn } from "../lib/utils";
import { extractTextFromImage, parseReceiptText } from "../utils/receipt";
import type { SpendingInsight } from "../utils/ai_service";


type CategoryInputs = { title: string };
type TransactionInputs = { category: string; amount: number; note?: string };

const Dashboard = () => {
  const createDefaultRange = () => {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setDate(today.getDate() + 30);
    return { from: today, to: nextMonth };
  };
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CategoryInputs>();
  const {
    register: registerTransaction,
    handleSubmit: handleTransactionSubmit,
    reset: resetTransaction,
    setValue,
  } = useForm<TransactionInputs>();

  const [categories, setCategories] = useState<CategoryDashboardInfo[]>([]);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);

  const [budgetCategory, setBudgetCategory] = useState("");
  const [budgetAmount, setBudgetAmount] = useState<number | "">("");
  const [budgetRange, setBudgetRange] = useState<DateRange | undefined>(() => createDefaultRange());
  const [transactionCategory, setTransactionCategory] = useState("");
  const [transactionDate, setTransactionDate] = useState<Date | undefined>(new Date());
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

  useEffect(() => {
    registerTransaction("category", { required: true });
  }, [registerTransaction]);


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
      const categoryValue = data.category || transactionCategory;
      if (!categoryValue) {
        setTransactionError("Please select a category.");
        return;
      }

      await addTransaction({
        user_id: userId,
        category: categoryValue,
        amount: Number(data.amount),
        note: data.note,
        created_at: (transactionDate ?? new Date()).toISOString(),
      });

      resetTransaction();
      setTransactionCategory("");
      setTransactionDate(new Date());
      setSuccessMessage("Transaction added successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
      await fetchCategories();
      
      // Load insights after transaction is created
      setTimeout(async () => {
        await loadInsights();
      }, 1000);
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
      const startDate = budgetRange?.from ? format(budgetRange.from, "yyyy-MM-dd") : "";
      const endDate = budgetRange?.to ? format(budgetRange.to, "yyyy-MM-dd") : "";
      if (!budgetCategory || !budgetAmount || !startDate || !endDate) {
        setBudgetError("All fields are required.");
        setLoading(false);
        return;
      }

      await addBudget(userId, budgetCategory, {
        amount: Number(budgetAmount),
        start_date: startDate,
        end_date: endDate,
      });

      setSuccessMessage("Budget added successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
      setBudgetCategory("");
      setBudgetAmount("");
      setBudgetRange(createDefaultRange());
      fetchCategories();
    } catch (err: any) {
      setBudgetError(err.message || "Failed to create budget.");
    } finally {
      setLoading(false);
    }
  };

  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [insights, setInsights] = useState<SpendingInsight[]>([]);
  const [showInsights, setShowInsights] = useState(false);

  
  const handleReceiptUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setOcrLoading(true);
    setOcrProgress(0);
    setTransactionError(null);
    setSuccessMessage(null);
    
    try {
      const userId = await getUserId();
      if (!userId) {
        navigate("/login", { replace: true });
        return;
      }

      // Step 1: Extract text with OCR
      setOcrProgress(30);
      const text = await extractTextFromImage(file);
      
      if (!text || text.trim().length === 0) {
        throw new Error("Could not extract text from receipt. Please ensure the image is clear.");
      }

      // Step 2: Get available categories for AI
      setOcrProgress(50);
      const availableCategories = categories.length > 0 
        ? categories.map(cat => cat.title)
        : ["Food", "Transport", "Shopping", "Entertainment", "Utilities", "Other"];

      // Step 3: Parse with AI
      setOcrProgress(70);
      const parsed = await parseReceiptText(text, userId, availableCategories);

      if (parsed.amount === 0) {
        throw new Error("Could not extract amount from receipt. Please check the image quality.");
      }

      // Step 4: Auto-fill form (user can review and submit manually)
      setOcrProgress(90);
      setValue("category", parsed.category);
      setValue("amount", parsed.amount);
      setValue("note", parsed.note);
      setTransactionCategory(parsed.category);
      const parsedDate = parsed.created_at ? new Date(parsed.created_at) : null;
      if (parsedDate && !Number.isNaN(parsedDate.getTime())) {
        setTransactionDate(parsedDate);
      }

      // Form is now filled - user can review and submit manually
      setOcrProgress(100);
      const confidenceMsg = parsed.confidence 
        ? ` (${Math.round(parsed.confidence * 100)}% confidence)`
        : "";
      const merchantMsg = parsed.merchant ? ` from ${parsed.merchant}` : "";
      setSuccessMessage(
        `Receipt parsed successfully${merchantMsg}! Amount: $${parsed.amount.toFixed(2)} in ${parsed.category}${confidenceMsg}. Please review and click "Submit Transaction" to confirm.`
      );
      
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error: any) {
      console.error("Receipt processing error:", error);
      setTransactionError(error.message || "Failed to process receipt. Please try again with a clearer image.");
    } finally {
      setOcrLoading(false);
      setOcrProgress(0);
      event.target.value = "";
    }
  };

  const loadInsights = async () => {
    try {
      const userId = await getUserId();
      if (!userId || categories.length === 0) return;

      // Create basic insights from category data
      const basicInsights: SpendingInsight[] = [];

      categories.forEach(cat => {
        if (cat.total_transactions_amount && cat.total_transactions_amount > 500) {
          basicInsights.push({
            type: "info",
            message: `High spending in ${cat.title}: $${cat.total_transactions_amount.toFixed(2)}`,
            category: cat.title,
            amount: cat.total_transactions_amount,
          });
        }

    
        if (cat.is_there_active_budget && cat.active_budget_amount) {
          const spent = cat.total_transactions_amount || 0;
          const percentage = (spent / cat.active_budget_amount) * 100;
          
          if (percentage > 100) {
            basicInsights.push({
              type: "warning",
              message: `Budget exceeded in ${cat.title} by $${(spent - cat.active_budget_amount).toFixed(2)}`,
              category: cat.title,
              amount: spent - cat.active_budget_amount,
            });
          } else if (percentage > 80) {
            basicInsights.push({
              type: "warning",
              message: `Approaching budget limit in ${cat.title} (${percentage.toFixed(0)}% used)`,
              category: cat.title,
            });
          }
        }
      });

      setInsights(basicInsights);
      if (basicInsights.length > 0) {
        setShowInsights(true);
      }
    } catch (error) {
      console.error("Failed to load insights:", error);
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

  const summary = useMemo(() => {
    if (!categories.length) {
      return {
        totalBudget: 0,
        activeBudget: 0,
        totalTransactions: 0,
        transactionsCount: 0,
        categoriesCount: 0,
      };
    }

    const aggregate = categories.reduce(
      (acc, cat) => {
        acc.totalBudget += cat.total_budget_amount || 0;
        acc.activeBudget += cat.is_there_active_budget ? cat.active_budget_amount || 0 : 0;
        acc.totalTransactions += cat.total_transactions_amount || 0;
        acc.transactionsCount += cat.trasactions_count || 0;
        return acc;
      },
      {
        totalBudget: 0,
        activeBudget: 0,
        totalTransactions: 0,
        transactionsCount: 0,
      }
    );

    return {
      ...aggregate,
      categoriesCount: categories.length,
    };
  }, [categories]);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }),
    []
  );

  const formatCurrency = (value: number) => currencyFormatter.format(value || 0);

  const handleBarClick = (data: any) => {
    if (data?.id) navigate(`/category/${data.id}`);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#0f172a,_#020617)] text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 lg:px-0">
        <header className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-slate-900/80 p-6 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-indigo-200">
                <Sparkles className="h-4 w-4 text-yellow-300" />
                Live Control
              </p>
              <div>
                <h1 className="text-3xl font-bold leading-tight md:text-4xl">
                  Pocket Watch
                </h1>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="ghost"
                  className="border border-white/20 bg-white/10 text-white shadow-lg shadow-indigo-500/40 transition hover:-translate-y-0.5 hover:bg-white/20"
                  onClick={() => fetchCategories()}
                >
                  Refresh Insights
                </Button>
                <Button
                  className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 text-slate-900 shadow-lg shadow-emerald-500/40 transition hover:-translate-y-0.5"
                  onClick={() =>
                    document.getElementById("budget-card")?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Plan New Budget
                </Button>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="min-w-[240px] border-white/40 bg-white/10 text-left text-white hover:bg-white/20"
                >
                  <Avatar className="border border-white/40">
                    <AvatarImage src="/path/to/profile.jpg" alt="User avatar" />
                    <AvatarFallback>{userInfo?.[0]?.toUpperCase() || "PW"}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-semibold">{userInfo || "Guest Analyst"}</p>
                    <p className="text-xs text-white/70">Tap to manage</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate("/logout")}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {successMessage && (
          <Alert className="border-emerald-500/60 bg-emerald-500/10 text-emerald-100">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}
        {(categoryError || budgetError || transactionError) && (
          <Alert className="border-red-500/60 bg-red-500/10 text-red-100">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{categoryError || budgetError || transactionError}</AlertDescription>
          </Alert>
        )}

        {showInsights && insights.length > 0 && (
          <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-400" />
                <CardTitle className="text-lg">AI Spending Insights</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                onClick={() => setShowInsights(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {insights.map((insight, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3 backdrop-blur-sm",
                    insight.type === "warning" && "border-amber-500/30 bg-amber-500/10",
                    insight.type === "suggestion" && "border-blue-500/30 bg-blue-500/10",
                    insight.type === "info" && "border-indigo-500/30 bg-indigo-500/10"
                  )}
                >
                  {insight.type === "warning" && (
                    <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  )}
                  {insight.type === "suggestion" && (
                    <Lightbulb className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  )}
                  {insight.type === "info" && (
                    <Info className="h-5 w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                  )}
                  <p className="text-sm text-white/90 flex-1">{insight.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total Budget",
              hint: "Across all categories",
              value: formatCurrency(summary.totalBudget),
              icon: Wallet,
            },
            {
              label: "Active Budget",
              hint: "Live envelopes",
              value: formatCurrency(summary.activeBudget),
              icon: TrendingUp,
            },
            {
              label: "Transactions",
              hint: `${summary.transactionsCount} logged`,
              value: formatCurrency(summary.totalTransactions),
              icon: Sparkles,
            },
            {
              label: "Categories",
              hint: "Personalized groups",
              value: summary.categoriesCount,
              icon: Layers,
            },
          ].map(({ label, hint, value, icon: Icon }) => (
            <Card
              key={label}
              className="border-white/10 bg-white/5 text-white shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:border-white/30"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/80">{label}</CardTitle>
                <Icon className="h-5 w-5 text-indigo-200" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-white/70">{hint}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
          <Card className="border-white/10 bg-white/5 text-white shadow-2xl shadow-black/30">
            <CardHeader className="space-y-1">
              <CardTitle>Spending Pulse</CardTitle>
              <CardDescription className="text-white/70">
                Dive into your budgets and click any bar to deep-dive on a category.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {fetchingCategories ? (
                <ChartSkeleton />
              ) : categories.length > 0 ? (
                <div className="h-[420px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      onClick={(e) => handleBarClick(e?.activePayload?.[0]?.payload)}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#CBD5F5" }} />
                      <YAxis tick={{ fill: "#CBD5F5" }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e1b4b" }}
                        labelStyle={{ color: "#e0e7ff" }}
                      />
                      <Legend />
                      <Bar dataKey="totalBudget" fill="#6366F1" name="Total Budget $" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="activeBudget" fill="#4ade80" name="Active Budget $" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="budgetCount" fill="#fbbf24" name="Budgets" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="totalTransactions" fill="#f87171" name="Transactions $" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="transactionCount" fill="#c084fc" name="Transactions" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/20 p-8 text-center text-white/70">
                  No categories to display yet. Start by creating your first category below.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card
              id="category-card"
              className="border-white/10 bg-white/[0.08] text-white shadow-2xl shadow-black/30"
            >
              <CardHeader>
                <CardTitle>Instant Categories</CardTitle>
                <CardDescription className="text-white/70">
                  Keep spending sorted by crafting smart containers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmitCategory)} className="space-y-4">
                  <Input
                    placeholder="ie. Wellness, Studio Gear..."
                    {...register("title", { required: true })}
                    className="border-white/20 bg-white/10 text-white placeholder:text-white/50"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-300">Title is required</p>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/40 transition hover:-translate-y-0.5"
                  >
                    Create Category
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card
              id="budget-card"
              className="border-white/10 bg-white/[0.08] text-white shadow-2xl shadow-black/30"
            >
              <CardHeader>
                <CardTitle>Budget Architect</CardTitle>
                <CardDescription className="text-white/70">
                  Assign envelopes, amounts, and shimmering timelines.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={budgetCategory} onValueChange={setBudgetCategory}>
                  <SelectTrigger className="w-full border-white/30 bg-white/10 text-white">
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
                      <SelectItem value="__empty" disabled>
                        No categories found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  placeholder="Budget Amount"
                  value={budgetAmount}
                  className="border-white/30 bg-white/10 text-white placeholder:text-white/50"
                  onChange={(e) => setBudgetAmount(e.target.value === "" ? "" : Number(e.target.value))}
                />

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start border-dashed border-white/30 bg-white/5 text-left font-normal text-white hover:bg-white/10",
                        !budgetRange?.from && "text-white/60"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {budgetRange?.from && budgetRange?.to ? (
                        <>
                          {format(budgetRange.from, "PPP")} - {format(budgetRange.to, "PPP")}
                        </>
                      ) : (
                        <span>Pick budget window</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto border-white/20 bg-slate-900 p-0 text-white" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      numberOfMonths={2}
                      selected={budgetRange}
                      onSelect={setBudgetRange}
                    />
                  </PopoverContent>
                </Popover>

                <Button
                  onClick={handleAddBudget}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 text-slate-900 shadow-lg shadow-emerald-500/40 transition hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Add Budget"}
                </Button>
                {budgetError ? (
                  <p className="text-sm text-rose-300">{budgetError}</p>
                ) : (
                  <p className="text-xs text-white/50">Budgets auto-sync with your chart in real-time.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <Card className="border-white/10 bg-white/[0.08] text-white shadow-2xl shadow-black/30">
          <CardHeader>
            <CardTitle>Smart Receipt Capture</CardTitle>
            <CardDescription className="text-white/70">
              Launch the drawer to upload a slip, auto-parse it, and fine-tune details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Drawer>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-white/70">
                  Tap below to open the immersive transaction composer with OCR superpowers.
                </p>
                <DrawerTrigger asChild>
                  <Button className="bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/40 transition hover:-translate-y-0.5">
                    Launch Composer
                  </Button>
                </DrawerTrigger>
              </div>
              <DrawerContent className="border-t border-white/10 bg-slate-950 text-white">
                <DrawerHeader>
                  <DrawerTitle>Craft a New Transaction</DrawerTitle>
                  <DrawerDescription className="text-white/70">
                    Upload a receipt or add details manually. Everything is mobile-first and snappy.
                  </DrawerDescription>
                </DrawerHeader>

                <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                  <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/30 bg-white/5 p-6 text-center transition hover:-translate-y-0.5 hover:border-white/60 relative overflow-hidden">
                    {ocrLoading && (
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-blue-500/20 animate-pulse" />
                    )}
                    <div className="relative z-10 flex flex-col items-center">
                      <Upload className={cn(
                        "mb-3 h-10 w-10 text-white/80 transition-all",
                        ocrLoading && "animate-bounce"
                      )} />
                      <p className="text-sm text-white/80 font-medium mb-2">
                        {ocrLoading 
                          ? `Processing... ${ocrProgress}%` 
                          : "Tap to upload or drop an image"}
                      </p>
                      {ocrLoading && (
                        <div className="w-full max-w-xs h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 transition-all duration-300"
                            style={{ width: `${ocrProgress}%` }}
                          />
                        </div>
                      )}
                      <p className="text-xs text-white/60">
                        {ocrLoading 
                          ? "AI is extracting data from your receipt..." 
                          : "PNG, JPG, or PDF up to 10MB"}
                      </p>
                    </div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptUpload}
                      disabled={ocrLoading}
                      className="hidden"
                    />
                  </label>

                  <form onSubmit={handleTransactionSubmit(onSubmitTransaction)} className="space-y-4">
                    <Select
                      value={transactionCategory}
                      onValueChange={(value) => {
                        setTransactionCategory(value);
                        setValue("category", value);
                      }}
                    >
                      <SelectTrigger className="w-full border-white/30 bg-white/5 text-white">
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
                          <SelectItem value="__empty" disabled>
                            No categories found
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      placeholder="Amount"
                      {...registerTransaction("amount", { required: true })}
                      className="border-white/30 bg-white/5 text-white placeholder:text-white/50"
                    />
                    <Input
                      placeholder="Internal note"
                      {...registerTransaction("note")}
                      className="border-white/30 bg-white/5 text-white placeholder:text-white/50"
                    />

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start border-white/30 bg-white/5 text-left font-normal text-white hover:bg-white/10",
                            !transactionDate && "text-white/60"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {transactionDate ? format(transactionDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto border-white/20 bg-slate-900 p-0 text-white" align="start">
                        <Calendar
                          initialFocus
                          mode="single"
                          selected={transactionDate}
                          onSelect={setTransactionDate}
                        />
                      </PopoverContent>
                    </Popover>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/40 transition hover:-translate-y-0.5"
                    >
                      Submit Transaction
                    </Button>
                  </form>
                </div>

                <DrawerFooter>
                  <DrawerClose asChild>
                    <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                      Cancel
                    </Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
