import { createBrowserRouter, Navigate } from "react-router";
import { ProtectedLayout } from "./components/protected-layout";
import { DashboardPage } from "./features/dashboard";
import { ShiftDashboard } from "./features/shift";
import { SalesPage } from "./features/sales";
import { TanksPage } from "./features/tanks";
import { CreditPage } from "./features/credit";
import { EmployeesPage } from "./features/employees";
import { SettingsPage } from "./features/settings";

export const router = createBrowserRouter([
  {
    element: <ProtectedLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "shifts", element: <ShiftDashboard /> },
      { path: "sales", element: <SalesPage /> },
      { path: "tanks", element: <TanksPage /> },
      { path: "credit", element: <CreditPage /> },
      { path: "employees", element: <EmployeesPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
