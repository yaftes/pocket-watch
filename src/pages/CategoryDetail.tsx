import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  deleteCategory,
  getCategoryDetail,
  type CategoryDetail as CategoryDetailType,
} from "../api/category_api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../components/ui/alert";
import { Skeleton } from "../components/ui/skeleton";
import { getUserId } from "../api/auth_api";
import { Button } from "../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import {
  Trash2,
  DollarSign,
  List,
  Activity,
  CalendarDays,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from "lucide-react";
import { deleteBudget } from "../api/budget_api";
import { deleteTransaction } from "../api/transaction_api";
import { cn } from "../lib/utils";
import { format } from "date-fns";

const CategoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [categoryDetail, setCategoryDetail] =
    useState<CategoryDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategoryDetail = async () => {
      if (!id) return setError("Category ID not found.");
      setLoading(true);
      try {
        const user = await getUserId();
        if (!user) {
          navigate("/login", { replace: true });
          return;
        }
        setUserId(user);
        const detail = await getCategoryDetail(id, user);
        setCategoryDetail(detail);
      } catch (err: any) {
        setError(err.message || "Failed to fetch category detail.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryDetail();
  }, [id, navigate]);


  const handleCategoryDelete = async () => {
    if (!id || !userId) return;
    setDeleting(true);
    try {
      await deleteCategory(id, userId);
      navigate("/dashboard", { replace: true });
    } catch (e: any) {
      setError(e.message || "Failed to delete category.");
    } finally {
      setDeleting(false);
    }
  };

  const handleBudgetDelete = async (budgetId: string) => {
    if (!userId) return;
    setDeleting(true);
    try {
      await deleteBudget(budgetId, userId);
      const updated = await getCategoryDetail(id!, userId);
      setCategoryDetail(updated);
    } catch (e: any) {
      setError(e.message || "Failed to delete budget.");
    } finally {
      setDeleting(false);
    }
  };

  const handleTransactionDelete = async (txId: string) => {
    if (!userId) return;
    setDeleting(true);
    try {
      await deleteTransaction(txId, userId);
      const updated = await getCategoryDetail(id!, userId);
      setCategoryDetail(updated);
    } catch (e: any) {
      setError(e.message || "Failed to delete transaction.");
    } finally {
      setDeleting(false);
    }
  };


  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-950 p-4 md:p-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-12 top-0 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl" />
          <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
        </div>
        <div className="relative z-10 space-y-6">
          <Skeleton className="h-32 w-full rounded-xl bg-white/10" />
          <Skeleton className="h-64 w-full rounded-xl bg-white/10" />
          <Skeleton className="h-64 w-full rounded-xl bg-white/10" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-950 p-4 md:p-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-12 top-0 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl">
          <Alert className="border-red-400/50 bg-red-500/10 text-white backdrop-blur">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!categoryDetail) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-950 p-4 md:p-6">
        <div className="relative z-10 mx-auto max-w-4xl">
          <p className="text-white/70">No category detail found.</p>
        </div>
      </div>
    );
  }

  const { category, budgets, transactions } = categoryDetail;
  const totalBudgetAmount = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalTransactionsAmount = transactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );
  const balance = totalBudgetAmount - totalTransactionsAmount;
  const isOverBudget = balance < 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-12 top-0 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl animate-pulse" />
        <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl animate-pulse delay-1000" />
        <div className="absolute left-1/2 bottom-0 h-48 w-96 -translate-x-1/2 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl space-y-6 p-4 md:p-6 lg:p-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-4 text-white/80 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="border-white/10 bg-white/10 shadow-2xl backdrop-blur overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
          <CardHeader className="bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-emerald-600/20 border-b border-white/10 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-6 w-6 text-emerald-400" />
                  <CardTitle className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    {category.title}
                  </CardTitle>
                </div>
                <CardDescription className="text-white/70 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Created: {format(new Date(category.created_at || ""), "PPP")}
                </CardDescription>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-200 hover:text-white transition-all"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 border-white/20 bg-slate-900/95 backdrop-blur text-white">
                  <p className="text-sm mb-3">
                    Are you sure you want to delete{" "}
                    <strong className="text-red-300">{category.title}</strong>?
                    This cannot be undone.
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => document.body.click()}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleCategoryDelete}
                      disabled={deleting}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      {deleting ? "Deleting..." : "Yes, Delete"}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </CardHeader>

          <CardContent className="p-6 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 p-6 backdrop-blur transition-all hover:scale-105 hover:border-indigo-400/30 hover:shadow-lg hover:shadow-indigo-500/20">
                <div className="flex items-center justify-between mb-3">
                  <List className="h-6 w-6 text-indigo-400" />
                  <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                </div>
                <p className="text-xs font-medium text-white/60 mb-1">Total Budgets</p>
                <p className="text-2xl font-bold text-white">{budgets.length}</p>
              </div>

              <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-6 backdrop-blur transition-all hover:scale-105 hover:border-emerald-400/30 hover:shadow-lg hover:shadow-emerald-500/20">
                <div className="flex items-center justify-between mb-3">
                  <DollarSign className="h-6 w-6 text-emerald-400" />
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                </div>
                <p className="text-xs font-medium text-white/60 mb-1">Total Budget</p>
                <p className="text-2xl font-bold text-white">
                  ${totalBudgetAmount.toFixed(2)}
                </p>
              </div>

              <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-6 backdrop-blur transition-all hover:scale-105 hover:border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/20">
                <div className="flex items-center justify-between mb-3">
                  <Activity className="h-6 w-6 text-blue-400" />
                  <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                </div>
                <p className="text-xs font-medium text-white/60 mb-1">Transactions</p>
                <p className="text-2xl font-bold text-white">{transactions.length}</p>
              </div>

              <div className={cn(
                "group relative overflow-hidden rounded-xl border p-6 backdrop-blur transition-all hover:scale-105 hover:shadow-lg",
                isOverBudget
                  ? "border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-600/5 hover:border-red-400/50 hover:shadow-red-500/20"
                  : "border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-600/5 hover:border-amber-400/50 hover:shadow-amber-500/20"
              )}>
                <div className="flex items-center justify-between mb-3">
                  <DollarSign className={cn(
                    "h-6 w-6",
                    isOverBudget ? "text-red-400" : "text-amber-400"
                  )} />
                  {isOverBudget ? (
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-amber-400" />
                  )}
                </div>
                <p className="text-xs font-medium text-white/60 mb-1">Spent</p>
                <p className={cn(
                  "text-2xl font-bold",
                  isOverBudget ? "text-red-300" : "text-amber-300"
                )}>
                  ${totalTransactionsAmount.toFixed(2)}
                </p>
                {balance !== 0 && (
                  <p className={cn(
                    "text-xs mt-1",
                    isOverBudget ? "text-red-400" : "text-emerald-400"
                  )}>
                    {isOverBudget ? "Over by" : "Remaining"}: ${Math.abs(balance).toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      
        <Card className="border-white/10 bg-white/10 shadow-2xl backdrop-blur animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <CardHeader className="border-b border-white/10 p-6">
            <div className="flex items-center gap-3">
              <List className="h-5 w-5 text-indigo-400" />
              <CardTitle className="text-2xl font-semibold">Budgets</CardTitle>
              <span className="ml-auto rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300">
                {budgets.length} {budgets.length === 1 ? "budget" : "budgets"}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {budgets.length === 0 ? (
              <div className="py-12 text-center">
                <List className="mx-auto h-12 w-12 text-white/20 mb-4" />
                <p className="text-white/60">No budgets available for this category.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableCaption className="text-white/50">Budgets under this category</TableCaption>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableHead className="text-white/80 font-semibold">Amount</TableHead>
                      <TableHead className="text-white/80 font-semibold">Start Date</TableHead>
                      <TableHead className="text-white/80 font-semibold">End Date</TableHead>
                      <TableHead className="text-white/80 font-semibold">Status</TableHead>
                      <TableHead className="text-right text-white/80 font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {budgets.map((b, idx) => (
                      <TableRow 
                        key={b.id} 
                        className="border-white/10 hover:bg-white/5 transition-colors animate-in fade-in slide-in-from-left-4"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <TableCell className="font-semibold text-white">
                          ${b.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-white/80">
                          {format(new Date(b.start_date), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="text-white/80">
                          {format(new Date(b.end_date), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
                              b.is_active
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-white/10 text-white/60 border border-white/10"
                            )}
                          >
                            <div className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              b.is_active ? "bg-emerald-400 animate-pulse" : "bg-white/40"
                            )} />
                            {b.is_active ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/20 border border-transparent hover:border-red-500/30 transition-all"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-60 border-white/20 bg-slate-900/95 backdrop-blur text-white">
                              <p className="text-sm mb-3">
                                Delete this budget permanently?
                              </p>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => document.body.click()}
                                  className="border-white/20 text-white hover:bg-white/10"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleBudgetDelete(b.id!)}
                                  disabled={deleting}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  {deleting ? "Deleting..." : "Delete"}
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/10 shadow-2xl backdrop-blur animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <CardHeader className="border-b border-white/10 p-6">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-2xl font-semibold">Transactions</CardTitle>
              <span className="ml-auto rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-300">
                {transactions.length} {transactions.length === 1 ? "transaction" : "transactions"}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {transactions.length === 0 ? (
              <div className="py-12 text-center">
                <Activity className="mx-auto h-12 w-12 text-white/20 mb-4" />
                <p className="text-white/60">No transactions available for this category.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableCaption className="text-white/50">
                    Transactions for this category
                  </TableCaption>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableHead className="text-white/80 font-semibold">Amount</TableHead>
                      <TableHead className="text-white/80 font-semibold">Date</TableHead>
                      <TableHead className="text-white/80 font-semibold">Note</TableHead>
                      <TableHead className="text-right text-white/80 font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((t, idx) => (
                      <TableRow 
                        key={t.id}
                        className="border-white/10 hover:bg-white/5 transition-colors animate-in fade-in slide-in-from-left-4"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <TableCell className="font-semibold text-emerald-300">
                          ${t.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-white/80">
                          {t.created_at ? format(new Date(t.created_at), "MMM dd, yyyy") : "—"}
                        </TableCell>
                        <TableCell className="text-white/70 max-w-xs truncate">
                          {t.note || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/20 border border-transparent hover:border-red-500/30 transition-all"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-60 border-white/20 bg-slate-900/95 backdrop-blur text-white">
                              <p className="text-sm mb-3">
                                Delete this transaction?
                              </p>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => document.body.click()}
                                  className="border-white/20 text-white hover:bg-white/10"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleTransactionDelete(t.id!)}
                                  disabled={deleting}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  {deleting ? "Deleting..." : "Delete"}
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CategoryDetail;
