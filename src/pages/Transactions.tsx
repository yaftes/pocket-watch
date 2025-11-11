import * as React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getTransactions,
  deleteTransaction,
  addTransaction,
  type Transaction,
} from "../api/transaction_api";
import { supabase } from "../api/supabase_client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "../components/ui/popover";


export type TransactionInputs = {
  category: string;
  amount: number;
  note?: string;
  date: Date;
};

type TransactionFormProps = {
  initialValues?: TransactionInputs;
  onSubmitForm: (data: TransactionInputs) => void;
};

const TransactionForm = ({ initialValues, onSubmitForm }: TransactionFormProps) => {
  const [category, setCategory] = useState(initialValues?.category || "");
  const [amount, setAmount] = useState(initialValues?.amount || 0);
  const [note, setNote] = useState(initialValues?.note || "");
  const [date, setDate] = useState(initialValues?.date.toISOString().split("T")[0] || new Date().toISOString().split("T")[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitForm({
      category,
      amount,
      note,
      date: new Date(date),
    });
  };

  return (
    <form className="flex flex-col gap-3 w-full" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="border p-2 rounded"
        required
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="border p-2 rounded"
        required
      />
      <input
        type="text"
        placeholder="Note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="border p-2 rounded"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border p-2 rounded"
        required
      />
      <Button type="submit">Save Transaction</Button>
    </form>
  );
};

const Transactions = () => {
  const { budgetId } = useParams<{ budgetId: string }>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) throw error;
        if (!user) {
          setErrorMessage("You must be logged in to view transactions.");
          return;
        }
        setUserId(user.id);

        if (budgetId) {
          const data = await getTransactions(user.id, budgetId);
          setTransactions(data);
        } else {
          setErrorMessage("Budget ID not found in the URL.");
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [budgetId]);

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to delete transaction.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (data: TransactionInputs) => {
    if (!userId || !budgetId) return;

    try {
      setLoading(true);
      const newTransaction = await addTransaction({
        user_id: userId,
        budget_id: budgetId,
        category: data.category,
        amount: data.amount,
        note: data.note,
        date: data.date.toISOString().split("T")[0],
        created_at: new Date().toISOString(),
      });
      setTransactions((prev) => [newTransaction, ...prev]);
      setIsPopoverOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to add transaction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Transactions</h1>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button onClick={() => setIsPopoverOpen(true)}>Add Transaction</Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-4">
            <TransactionForm onSubmitForm={handleFormSubmit} />
          </PopoverContent>
        </Popover>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-100 text-red-600 rounded-md text-center">
          {errorMessage}
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-500">Loading transactions...</p>
      ) : transactions.length === 0 ? (
        <p className="text-center text-gray-500">No transactions found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {transactions.map((transaction) => (
            <Card key={transaction.id}>
              <CardHeader>
                <CardTitle>{transaction.category}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <p>
                  <strong>Amount:</strong> {transaction.amount}$
                </p>
                <p>
                  <strong>Note:</strong> {transaction.note || "-"}
                </p>
                <p>
                  <strong>Date:</strong> {transaction.date}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(transaction.id!)}
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Transactions;
