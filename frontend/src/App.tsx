import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ClientsPage from "./pages/ClientsPage";
import ClientDetailsPage from "./pages/ClientDetailsPage";
import TransactionsPage from "./pages/TransactionsPage";
import TransactionDetailsPage from "./pages/TransactionDetailsPage";
import AcceptInvitationPage from "./pages/AcceptInvitationPage";
import ProtectedRoute from "./components/ProtectedRoute";
import TeamMembersPage from "./pages/TeamMembersPage";
import AuditPage from "./pages/AuditPage";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
        path="/accept-invitation/:token"
        element={<AcceptInvitationPage />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <ClientsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/clients/:clientId"
          element={
            <ProtectedRoute>
              <ClientDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <TransactionsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/transactions/:transactionId"
          element={
            <ProtectedRoute>
              <TransactionDetailsPage />
            </ProtectedRoute>
          }
        />
       <Route
           path="/team"
            element={
             <ProtectedRoute>
            <TeamMembersPage />
             </ProtectedRoute>
          }
        />

       <Route
          path="/audit"
          element={
          <ProtectedRoute>
           <AuditPage />
              </ProtectedRoute>
            }
           />

      </Routes>

    </BrowserRouter>
  );
}


export default App;
