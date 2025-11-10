pocket-watch/

├── public/
│   ├── index.html
│   └── assets/          # Static assets like images, icons
├── src/
│   ├── api/             # API calls and Supabase integration
│   │   ├── supabaseClient.js
│   │   └── transactionsApi.js
│   │
│   ├── app/             # Redux store setup
│   │   ├── store.js
│   │   └── rootReducer.js
│   │
│   ├── components/      # Reusable UI components
│   │   ├── Button/
│   │   │   └── Button.jsx
│   │   ├── Modal/
│   │   │   └── Modal.jsx
│   │   └── ...          # Any other generic components
│   │
│   ├── features/        # Redux feature slices + related components
│   │   ├── transactions/
│   │   │   ├── transactionsSlice.js
│   │   │   ├── TransactionList.jsx
│   │   │   └── TransactionForm.jsx
│   │   ├── budgets/
│   │   │   ├── budgetsSlice.js
│   │   │   └── BudgetChart.jsx
│   │   └── user/
│   │       ├── userSlice.js
│   │       └── UserProfile.jsx
│   │
│   ├── pages/           # Main route pages
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   └── Settings.jsx
│   │
│   ├── routes/          # React Router setup
│   │   └── AppRoutes.jsx
│   │
│   ├── utils/           # Utility functions
│   │   ├── parseReceipt.js   # Tesseract.js text parsing

│   │   └── formatDate.js
│   │
│   ├── hooks/           # Custom hooks
│   │   ├── useTransactions.js
│   │   └── useBudget.js
│   │
│   ├── styles/          # Global styles (Tailwind + shadcn overrides)
│   │   └── index.css
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── .env                 # Environment variables (Supabase keys, etc.)
├── package.json
└── README.md
