import { createBrowserRouter, Navigate } from "react-router";
import { ProtectedLayout } from "./components/protected-layout";
import { ShiftDashboard } from "./features/shift";
import { SalesPage } from "./features/sales";
import { TanksPage } from "./features/tanks";
import { CreditPage } from "./features/credit";
import { PumpBoysPage } from "./features/pump-boys";
import { SettingsPage } from "./features/settings";

export const router = createBrowserRouter([
  {
    element: <ProtectedLayout />,
    children: [
      { index: true, element: <ShiftDashboard /> },
      { path: "sales", element: <SalesPage /> },
      { path: "tanks", element: <TanksPage /> },
      { path: "credit", element: <CreditPage /> },
      { path: "pump-boys", element: <PumpBoysPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
