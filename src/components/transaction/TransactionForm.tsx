import * as React from "react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export type TransactionInputs = {
  amount: number;
  note?: string;
  date: Date;
  file?: File | null;
};

type TransactionFormProps = {
  initialValues?: TransactionInputs;
  onSubmitForm: (data: TransactionInputs) => void;
};

const TransactionForm = ({ initialValues, onSubmitForm }: TransactionFormProps) => {
  const [amount, setAmount] = useState(initialValues?.amount || 0);
  const [note, setNote] = useState(initialValues?.note || "");
  const [date, setDate] = useState(
    initialValues?.date.toISOString().split("T")[0] || new Date().toISOString().split("T")[0]
  );
  const [file, setFile] = useState<File | null>(null);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitForm({ amount, note, date: new Date(date), file });
    setFile(null);
    setAmount(0);
    setNote("");
    setDate(new Date().toISOString().split("T")[0]);
  };

  return (
    <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="note">Note</Label>
        <Input
          id="note"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
        className="border border-dashed rounded p-4 text-center cursor-pointer relative"
      >
        {file ? file.name : "Drag & drop a file here or click to select"}
        <input
          type="file"
          onChange={handleFileSelect}
          className="absolute w-full h-full top-0 left-0 opacity-0 cursor-pointer"
        />
      </div>

      <Button type="submit">Save Transaction</Button>
    </form>
  );
};

export default TransactionForm;
