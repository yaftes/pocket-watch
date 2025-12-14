import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  createContext,
  useContext,
} from "react";
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
  Moon,
  Sun,
  Laptop,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Calendar } from "../components/ui/calendar";
import { cn } from "../lib/utils";
import { extractTextFromImage, parseReceiptText } from "../utils/receipt";
import type { SpendingInsight } from "../utils/ai_service";




type Theme = "dark" | "light" | "system";


const ThemeProviderContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({
  theme: "system",
  setTheme: () => null,
});

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {

  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("vite-ui-theme") as Theme) || "system"
  );

  useEffect(() => {

    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);


  const value = useMemo(
    () => ({
      theme,
      setTheme: (theme: Theme) => {
        localStorage.setItem("vite-ui-theme", theme);
        setTheme(theme);
      },
    }),
    [theme]
  );

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
};

const useTheme = () => useContext(ThemeProviderContext);


const StatsSection = React.memo(({ summary }: { summary: any }) => {

  const stats = [

    {
      label: "Total Budget",
      hint: "Across all categories",
      value: summary.totalBudget,
      icon: Wallet,
    },
    {
      label: "Active Budget",
      hint: "Live envelopes",
      value: summary.activeBudget,
      icon: TrendingUp,
    },
    {
      label: "Transactions",
      hint: `${summary.transactionsCount} logged`,
      value: summary.totalTransactions,
      icon: Sparkles,
    },
    {
      label: "Categories",
      hint: "Personalized groups",
      value: summary.categoriesCount,
      icon: Layers,
      isCount: true,
    },

  ];

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  return (

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, hint, value, icon: Icon, isCount }) => (
        <Card
          key={label}
          className="bg-card text-card-foreground shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {label}
            </CardTitle>
            <Icon className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isCount ? value : currencyFormatter.format(value)}
            </div>
            <p className="text-xs text-muted-foreground">{hint}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
});



const SpendingChart = React.memo(
  ({
    data,
    loading,
    onBarClick,
  }: {
    data: any[];
    loading: boolean;
    onBarClick: (id: string) => void;
  }) => {
    if (loading) return <ChartSkeleton />;

    if (data.length === 0) {
      return (
        <div className="flex h-[420px] items-center justify-center rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
          No categories to display yet. Start by creating your first category.
        </div>
      );
    }

    return (
      <div className="h-[420px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            onClick={(e) => {
              if (e?.activePayload?.[0]?.payload?.id) {
                onBarClick(e.activePayload[0].payload.id);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis className="text-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                borderColor: "hsl(var(--border))",
                color: "hsl(var(--popover-foreground))",
                borderRadius: "8px",
              }}
              cursor={{ fill: "hsl(var(--muted)/0.3)" }}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            <Bar
              dataKey="totalBudget"
              fill="hsl(var(--primary))"
              name="Total Budget $"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="activeBudget"
              fill="#10b981"
              name="Active Budget $"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="totalTransactions"
              fill="#ef4444"
              name="Spent $"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
);



const CategoryForm = React.memo(

  ({ onAdd }: { onAdd: (title: string) => Promise<void> }) => {

    const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm<{ title: string }>();

    const onSubmit = async (data: { title: string }) => {
      await onAdd(data.title);
      reset();
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="ie. Wellness, Studio Gear..."
            {...register("title", { required: true })}
            className="bg-background"
          />
          {errors.title && (
            <p className="text-xs text-destructive">Title is required</p>
          )}
        </div>
        <Button type="submit" className="w-full">
          Create Category
        </Button>
      </form>
    );
  }

);



const BudgetForm = React.memo(
  ({
    categories,
    onAdd,
  }: {
    categories: CategoryDashboardInfo[];
    onAdd: (
      category: string,
      amount: number,
      range: DateRange
    ) => Promise<void>;
  }) => {
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState<number | "">("");
    const [range, setRange] = useState<DateRange | undefined>(() => {
      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setDate(today.getDate() + 30);
      return { from: today, to: nextMonth };
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
      if (!category || !amount || !range?.from || !range?.to) {
        setError("All fields are required.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        await onAdd(category, Number(amount), range);
        setCategory("");
        setAmount("");
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-4">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full bg-background">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.title}>
                {cat.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="number"
          placeholder="Budget Amount"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value === "" ? "" : Number(e.target.value))
          }
          className="bg-background"
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start border-dashed text-left font-normal",
                !range?.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {range?.from && range?.to ? (
                <>
                  {format(range.from, "PPP")} - {format(range.to, "PPP")}
                </>
              ) : (
                <span>Pick budget window</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              numberOfMonths={2}
              selected={range}
              onSelect={setRange}
            />
          </PopoverContent>
        </Popover>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:opacity-90"
        >
          {loading ? "Creating..." : "Add Budget"}
        </Button>
      </div>
    );
  }
);


const TransactionDrawer = React.memo(
  ({
    categories,
    onAdd,
    userId,
  }: {
    categories: CategoryDashboardInfo[];
    onAdd: (data: any) => Promise<void>;
    userId: string | null;
  }) => {
    const { register, handleSubmit, setValue, reset, watch } = useForm();
    const [ocrLoading, setOcrLoading] = useState(false);
    const [ocrProgress, setOcrProgress] = useState(0);
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [msg, setMsg] = useState<string | null>(null);
    const categoryValue = watch("category");


    const handleReceiptUpload = async (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file = event.target.files?.[0];
      if (!file || !userId) return;

      setOcrLoading(true);
      setOcrProgress(10);
      setMsg(null);

      try {
        const text = await extractTextFromImage(file);
        setOcrProgress(50);
        if (!text) throw new Error("No text found.");

        const availableCategories = categories.map((c) => c.title);
        const parsed = await parseReceiptText(text, userId, availableCategories);
        setOcrProgress(90);

        if (parsed.amount) {
          setValue("amount", parsed.amount);
          setValue("category", parsed.category);
          setValue("note", parsed.note);
          if (parsed.created_at) setDate(new Date(parsed.created_at));

          setMsg(`Scanned: $${parsed.amount} - ${parsed.merchant || "Unknown"}`);
        }
      } catch (err) {
        console.error(err);
        setMsg("Failed to scan receipt.");
      } finally {
        setOcrLoading(false);
        setOcrProgress(0);
        event.target.value = "";
      }
    };

    const onSubmit = async (data: any) => {
      await onAdd({
        ...data,
        created_at: date?.toISOString(),
      });
      reset();
      setDate(new Date());
      setOpen(false);
    };

    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg transition hover:-translate-y-0.5">
            Launch Composer
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto w-full max-w-4xl">
            <DrawerHeader>
              <DrawerTitle>New Transaction</DrawerTitle>
              <DrawerDescription>
                Manually enter details or scan a receipt.
              </DrawerDescription>
            </DrawerHeader>

            <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
              <label className="relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed bg-muted/30 p-6 text-center transition hover:bg-muted/50">
                {ocrLoading && (
                  <div className="absolute inset-0 z-0 animate-pulse bg-primary/10" />
                )}
                <div className="relative z-10 flex flex-col items-center">
                  <Upload
                    className={cn(
                      "mb-3 h-10 w-10 text-muted-foreground",
                      ocrLoading && "animate-bounce text-primary"
                    )}
                  />
                  <p className="mb-2 text-sm font-medium">
                    {ocrLoading
                      ? `Processing... ${ocrProgress}%`
                      : "Tap to upload receipt"}
                  </p>
                  {ocrLoading && (
                    <div className="mb-2 h-1 w-24 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${ocrProgress}%` }}
                      />
                    </div>
                  )}
                  {msg && <p className="text-xs text-emerald-500">{msg}</p>}
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptUpload}
                  disabled={ocrLoading}
                  className="hidden"
                />
              </label>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Select
                  value={categoryValue}
                  onValueChange={(val) => setValue("category", val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.title}>
                        {cat.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  {...register("amount", { required: true })}
                />
                <Input placeholder="Note" {...register("note")} />

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Button type="submit" className="w-full">
                  Submit Transaction
                </Button>
              </form>
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }
);


const DashboardContent = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryDashboardInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState("");
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [insights, setInsights] = useState<SpendingInsight[]>([]);
  const [showInsights, setShowInsights] = useState(false);


  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const loggedIn = await isLoggedIn();
      if (!loggedIn) {
        navigate("/login", { replace: true });
        return;
      }
      const userId = await getUserId();
      if (!userId) return;

      const [cats, user] = await Promise.all([
        getCategoriesDashboardInfo(userId),
        getUserInfo(),
      ]);

      setCategories(cats);
      setUserInfo(user);
    } catch (err: any) {
      setGlobalError(err.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const chartData = useMemo(() => {
    return categories.map((cat) => ({
      name: cat.title,
      totalBudget: cat.total_budget_amount,
      activeBudget: cat.is_there_active_budget
        ? cat.active_budget_amount || 0
        : 0,
      totalTransactions: cat.total_transactions_amount || 0,
      id: cat.id,
    }));
  }, [categories]);

  const summary = useMemo(() => {
    return categories.reduce(
      (acc, cat) => ({
        totalBudget: acc.totalBudget + (cat.total_budget_amount || 0),
        activeBudget:
          acc.activeBudget +
          (cat.is_there_active_budget ? cat.active_budget_amount || 0 : 0),
        totalTransactions:
          acc.totalTransactions + (cat.total_transactions_amount || 0),
        transactionsCount: acc.transactionsCount + (cat.trasactions_count || 0),
        categoriesCount: acc.categoriesCount + 1,
      }),
      {
        totalBudget: 0,
        activeBudget: 0,
        totalTransactions: 0,
        transactionsCount: 0,
        categoriesCount: 0,
      }
    );
  }, [categories]);



  const handleAddCategory = useCallback(
    async (title: string) => {
      try {
        const userId = await getUserId();
        if (!userId) return;
        await addCategory(title, userId);
        setSuccessMsg("Category created!");
        setTimeout(() => setSuccessMsg(null), 3000);
        fetchData();
      } catch (err: any) {
        setGlobalError(err.message);
      }
    },
    [fetchData]
  );

  const handleAddBudget = useCallback(
    async (category: string, amount: number, range: DateRange) => {
      try {
        const userId = await getUserId();
        if (!userId) return;
        const start = format(range.from!, "yyyy-MM-dd");
        const end = format(range.to!, "yyyy-MM-dd");

        await addBudget(userId, category, {
          amount,
          start_date: start,
          end_date: end,
        });
        setSuccessMsg("Budget set!");
        setTimeout(() => setSuccessMsg(null), 3000);
        fetchData();
      } catch (err: any) {
        setGlobalError(err.message);
      }
    },
    [fetchData]
  );

  const handleAddTransaction = useCallback(
    async (data: any) => {
      try {
        const userId = await getUserId();
        if (!userId) return;
        await addTransaction({
          user_id: userId,
          category: data.category,
          amount: Number(data.amount),
          note: data.note,
          created_at: data.created_at,
        });
        setSuccessMsg("Transaction recorded.");
        setTimeout(() => setSuccessMsg(null), 3000);
        await fetchData();

        // Simple insight generation after transaction
        const newInsights: SpendingInsight[] = [];
        if (Number(data.amount) > 500) {
          newInsights.push({
            type: "warning",
            message: `Large transaction detected: $${data.amount}`,
            category: data.category,
          });
          setInsights(newInsights);
          setShowInsights(true);
        }
      } catch (err: any) {
        setGlobalError(err.message);
      }
    },
    [fetchData]
  );

  // Safe user ID access for children
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  useEffect(() => {
    getUserId().then(setCurrentUserId);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 lg:px-6">
        
        {/* Header */}
        <header className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                <Sparkles className="h-3 w-3" />
                Live Control
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                Pocket Watch
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="mr-2 h-4 w-4" /> Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="mr-2 h-4 w-4" /> Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Laptop className="mr-2 h-4 w-4" /> System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2">
                    <Avatar className="h-8 w-8 border">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {userInfo?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden text-left text-sm md:block">
                      <p className="font-medium">{userInfo || "Guest"}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigate("/logout")}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Alerts */}
        {successMsg && (
          <Alert className="border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{successMsg}</AlertDescription>
          </Alert>
        )}
        {globalError && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{globalError}</AlertDescription>
          </Alert>
        )}

        {showInsights && insights.length > 0 && (
          <Card className="border-indigo-500/30 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-base">Insights</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowInsights(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {insights.map((insight, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  {insight.type === "warning" && (
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  )}
                  {insight.type === "info" && (
                    <Info className="h-4 w-4 text-blue-500" />
                  )}
                  <span>{insight.message}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <StatsSection summary={summary} />

        <div className="grid gap-6 lg:grid-cols-3">
          
          <Card className="shadow-lg lg:col-span-2">
            <CardHeader>
              <CardTitle>Spending Pulse</CardTitle>
              <CardDescription>
                Real-time visualization of your budgets vs spending.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SpendingChart
                data={chartData}
                loading={loading}
                onBarClick={(id) => navigate(`/category/${id}`)}
              />
            </CardContent>
          </Card>

  
          <div className="space-y-6">
            
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <TransactionDrawer
                  categories={categories}
                  onAdd={handleAddTransaction}
                  userId={currentUserId}
                />
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>New Category</CardTitle>
                <CardDescription>Create a container for spending</CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryForm onAdd={handleAddCategory} />
              </CardContent>
            </Card>

            {/* Budget Architect */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Budget Architect</CardTitle>
                <CardDescription>Set limits for your categories</CardDescription>
              </CardHeader>
              <CardContent>
                <BudgetForm categories={categories} onAdd={handleAddBudget} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  return (
    <ThemeProvider>
      <DashboardContent />
    </ThemeProvider>
  );
};

export default Dashboard;