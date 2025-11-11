import { useEffect, useState } from "react";
import { supabase } from "../api/supabase_client";

const Dashboard = () => {

 const [user, setUser] = useState<{ email: string | null; full_name: string } | null>(null);

  useEffect(() => {
    
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({
          email: user.email ?? null, 
          full_name: (user.user_metadata.full_name as string) || user.email || "",
        });
      }
    };
    fetchUser();
  }, []);



  return (
    <div className="min-h-screen bg-gray-100">
      <header className="w-full bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        {user && (
          <div className="flex items-center space-x-2">
            <span className="text-gray-700 font-medium">{user.full_name}</span>
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || "")}&background=random`}
              alt="User Avatar"
              className="w-10 h-10 rounded-full border"
            />
          </div>
        )}
      </header>

      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <h2 className="text-xl font-semibold mb-2">Total Transactions</h2>
              <p className="text-gray-600 text-3xl">42</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <h2 className="text-xl font-semibold mb-2">Budget Remaining</h2>
              <p className="text-gray-600 text-3xl">$1,200</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <h2 className="text-xl font-semibold mb-2">Recent Activity</h2>
              <ul className="text-gray-600 list-disc list-inside">
                <li>Paid $50 for groceries</li>
                <li>Received $200 salary</li>
                <li>Transferred $100 to savings</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;


