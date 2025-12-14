import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
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
  MoreVertical,
} from "lucide-react";

import {
  deleteCategory,
  getCategoryDetail,
  type CategoryDetail as CategoryDetailType,
} from "../api/category_api";
import { deleteBudget } from "../api/budget_api";
import { deleteTransaction } from "../api/transaction_api";
import { getUserId } from "../api/auth_api";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Skeleton } from "../components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { cn } from "../lib/utils";






const StatsGrid = React.memo(
  ({
    budgetCount,
    transactionCount,
    totalBudget,
    totalSpent,
  }: {
    budgetCount: number;
    transactionCount: number;
    totalBudget: number;
    totalSpent: number;
  }) => {
    const balance = totalBudget - totalSpent;
    const isOverBudget = balance < 0;

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        {/* Budgets Count */}
        <Card className="overflow-hidden border-indigo-200 bg-indigo-50/50 dark:border-indigo-500/20 dark:bg-indigo-950/10">
          <CardContent className="p-6">
            <div className="mb-3 flex items-center justify-between">
              <List className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
              <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            </div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Total Budgets
            </p>
            <p className="text-2xl font-bold text-foreground">{budgetCount}</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-emerald-200 bg-emerald-50/50 dark:border-emerald-500/20 dark:bg-emerald-950/10">
          <CardContent className="p-6">
            <div className="mb-3 flex items-center justify-between">
              <DollarSign className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
              <TrendingUp className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
            </div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Total Budget
            </p>
            <p className="text-2xl font-bold text-foreground">
              ${totalBudget.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-blue-200 bg-blue-50/50 dark:border-blue-500/20 dark:bg-blue-950/10">
          <CardContent className="p-6">
            <div className="mb-3 flex items-center justify-between">
              <Activity className="h-6 w-6 text-blue-500 dark:text-blue-400" />
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            </div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Transactions
            </p>
            <p className="text-2xl font-bold text-foreground">
              {transactionCount}
            </p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "overflow-hidden transition-all",
            isOverBudget
              ? "border-red-200 bg-red-50/50 dark:border-red-500/20 dark:bg-red-950/10"
              : "border-amber-200 bg-amber-50/50 dark:border-amber-500/20 dark:bg-amber-950/10"
          )}
        >
          <CardContent className="p-6">
            <div className="mb-3 flex items-center justify-between">
              <DollarSign
                className={cn(
                  "h-6 w-6",
                  isOverBudget
                    ? "text-red-500 dark:text-red-400"
                    : "text-amber-500 dark:text-amber-400"
                )}
              />
              {isOverBudget ? (
                <TrendingDown className="h-4 w-4 text-red-500 dark:text-red-400" />
              ) : (
                <TrendingUp className="h-4 w-4 text-amber-500 dark:text-amber-400" />
              )}
            </div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Total Spent
            </p>
            <div className="flex items-end gap-2">
              <p
                className={cn(
                  "text-2xl font-bold",
                  isOverBudget
                    ? "text-red-600 dark:text-red-400"
                    : "text-amber-600 dark:text-amber-400"
                )}
              >
                ${totalSpent.toFixed(2)}
              </p>
            </div>
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                isOverBudget
                  ? "text-red-500 dark:text-red-300"
                  : "text-emerald-600 dark:text-emerald-400"
              )}
            >
              {isOverBudget ? "Over by" : "Left"}: ${Math.abs(balance).toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
);

const BudgetList = React.memo(
  ({
    budgets,
    onDelete,
  }: {
    budgets: any[];
    onDelete: (id: string) => void;
  }) => {
    return (
      <Card>
        <CardHeader className="border-b bg-muted/20 p-6">
          <div className="flex items-center gap-3">
            <List className="h-5 w-5 text-indigo-500" />
            <CardTitle className="text-xl">Budgets</CardTitle>
            <span className="ml-auto rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
              {budgets.length}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {budgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <List className="mb-4 h-10 w-10 opacity-20" />
              <p>No budgets assigned yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden sm:table-cell">Range</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgets.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-semibold">
                      ${b.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                      {format(new Date(b.start_date), "MMM d")} -{" "}
                      {format(new Date(b.end_date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium",
                          b.is_active
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            b.is_active
                              ? "bg-emerald-500 animate-pulse"
                              : "bg-gray-400"
                          )}
                        />
                        {b.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => onDelete(b.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    );
  }
);



const TransactionList = React.memo(
  ({
    transactions,
    onDelete,
  }: {
    transactions: any[];
    onDelete: (id: string) => void;
  }) => {
    return (
      <Card>
        <CardHeader className="border-b bg-muted/20 p-6">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-xl">Transactions</CardTitle>
            <span className="ml-auto rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {transactions.length}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Activity className="mb-4 h-10 w-10 opacity-20" />
              <p>No transactions recorded.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">
                      ${t.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                      {t.created_at
                        ? format(new Date(t.created_at), "MMM dd, yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate text-sm text-muted-foreground">
                      {t.note || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => onDelete(t.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    );
  }
);



const CategoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [categoryDetail, setCategoryDetail] = useState<CategoryDetailType | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);


  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      const uid = await getUserId();
      if (!uid) {
        navigate("/login", { replace: true });
        return;
      }
      setUserId(uid);
      

      if (!categoryDetail) setLoading(true);
      
      const detail = await getCategoryDetail(id, uid);
      setCategoryDetail(detail);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, categoryDetail]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const { totalBudget, totalSpent } = useMemo(() => {
    if (!categoryDetail) return { totalBudget: 0, totalSpent: 0 };
    return {
      totalBudget: categoryDetail.budgets.reduce((sum, b) => sum + b.amount, 0),
      totalSpent: categoryDetail.transactions.reduce(
        (sum, t) => sum + t.amount,
        0
      ),
    };
  }, [categoryDetail]);

  const handleCategoryDelete = async () => {
    if (!id || !userId) return;
    setActionLoading(true);
    try {
      await deleteCategory(id, userId);
      navigate("/dashboard", { replace: true });
    } catch (e: any) {
      setError(e.message);
      setActionLoading(false);
    }
  };

  const handleBudgetDelete = useCallback(
    async (budgetId: string) => {
      if (!userId || !id) return;
      try {
        await deleteBudget(budgetId, userId);
        const updated = await getCategoryDetail(id, userId);
        setCategoryDetail(updated);
      } catch (e: any) {
        setError(e.message);
      }
    },
    [userId, id]
  );

  const handleTransactionDelete = useCallback(
    async (txId: string) => {
      if (!userId || !id) return;
      try {
        await deleteTransaction(txId, userId);
        const updated = await getCategoryDetail(id, userId);
        setCategoryDetail(updated);
      } catch (e: any) {
        setError(e.message);
      }
    },
    [userId, id]
  );


  if (loading) {
    return (
      <div className="container mx-auto min-h-screen max-w-7xl space-y-8 p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !categoryDetail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Category not found"}</AlertDescription>
          <Button
            variant="outline"
            className="mt-4 border-red-200 text-red-900 hover:bg-red-50"
            onClick={() => navigate("/dashboard")}
          >
            Go Back
          </Button>
        </Alert>
      </div>
    );
  }

  const { category, budgets, transactions } = categoryDetail;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[20%] top-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-0 top-20 h-[300px] w-[300px] rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl space-y-8 p-4 md:p-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="group text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </Button>

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/20">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                  {category.title}
                </h1>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Created {format(new Date(category.created_at || ""), "MMMM d, yyyy")}
                </p>
              </div>
            </div>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="destructive"
                className="shadow-sm transition-all hover:bg-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete Category
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none text-red-600">
                    Confirm Deletion
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to delete <strong>{category.title}</strong>?
                    This action cannot be undone and will remove all associated data.
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => document.body.click()}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleCategoryDelete}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Deleting..." : "Confirm Delete"}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <StatsGrid
          budgetCount={budgets.length}
          transactionCount={transactions.length}
          totalBudget={totalBudget}
          totalSpent={totalSpent}
        />

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <BudgetList budgets={budgets} onDelete={handleBudgetDelete} />
          </div>
          
          <div className="space-y-4">
            <TransactionList
              transactions={transactions}
              onDelete={handleTransactionDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetail;