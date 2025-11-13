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
} from "lucide-react";
import { deleteBudget } from "../api/budget_api";
import { deleteTransaction } from "../api/transaction_api";

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
      <div className="p-6 space-y-6">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }


  if (error) {
    return (
      <Alert className="m-6 bg-red-100 border-red-400">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!categoryDetail) {
    return <p className="p-6 text-gray-500">No category detail found.</p>;
  }

  const { category, budgets, transactions } = categoryDetail;
  const totalBudgetAmount = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalTransactionsAmount = transactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  return (
    <div className="p-6 space-y-8">

      <Card className="shadow-lg border-none overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-black to-gray-800 text-white flex justify-between items-center p-6">
          <div>
            <CardTitle className="text-3xl font-bold">
              {category.title}
            </CardTitle>
            <p className="text-sm opacity-80 mt-2 flex items-center gap-1">
              <CalendarDays size={15} />
              Created at:{" "}
              {new Date(category.created_at || "").toLocaleDateString()}
            </p>
          </div>

       
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="bg-red-500 hover:bg-red-600"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <p className="text-sm text-gray-700 mb-3">
                Are you sure you want to delete{" "}
                <strong>{category.title}</strong>? This cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => document.body.click()}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCategoryDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Yes, Delete"}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </CardHeader>


        <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-6">
          <div className="flex flex-col items-center text-center">
            <List className="text-indigo-500 mb-2 h-6 w-6" />
            <p className="text-sm text-gray-500">Total Budgets</p>
            <p className="text-xl font-semibold">{budgets.length}</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <DollarSign className="text-green-500 mb-2 h-6 w-6" />
            <p className="text-sm text-gray-500">Total Budget Amount</p>
            <p className="text-xl font-semibold">
              ${totalBudgetAmount.toFixed(2)}
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Activity className="text-blue-500 mb-2 h-6 w-6" />
            <p className="text-sm text-gray-500">Total Transactions</p>
            <p className="text-xl font-semibold">{transactions.length}</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <DollarSign className="text-amber-500 mb-2 h-6 w-6" />
            <p className="text-sm text-gray-500">Transaction Amount</p>
            <p className="text-xl font-semibold">
              ${totalTransactionsAmount.toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>
      

      <Card className="bg-white shadow-md border">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Budgets
          </CardTitle>
        </CardHeader>
        <CardContent>
          {budgets.length === 0 ? (
            <p className="text-gray-500">No budgets available.</p>
          ) : (
            <Table>
              <TableCaption>Budgets under this category</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgets.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>${b.amount.toFixed(2)}</TableCell>
                    <TableCell>{b.start_date}</TableCell>
                    <TableCell>{b.end_date}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          b.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {b.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="bg-red-500 hover:bg-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-60">
                          <p className="text-sm mb-3">
                            Delete this budget permanently?
                          </p>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => document.body.click()}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleBudgetDelete(b.id!)}
                            >
                              Delete
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white shadow-md border">
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-gray-500">No transactions available.</p>
          ) : (
            <Table>
              <TableCaption>
                Transactions for this category
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>${t.amount.toFixed(2)}</TableCell>
                    <TableCell>{t.created_at}</TableCell>
                    <TableCell className="text-right">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="bg-red-500 hover:bg-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-60">
                          <p className="text-sm mb-3">
                            Delete this transaction?
                          </p>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => document.body.click()}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() =>
                                handleTransactionDelete(t.id!)
                              }
                            >
                              Delete
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryDetail;
