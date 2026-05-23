import { Outlet } from "react-router";
import { authClient } from "../auth-client";
import { AuthPage } from "../features/auth";
import { StationSetupPage, useStationSetup } from "../features/setup";
import type { StationSetup } from "../features/setup";
import { AppSidebar } from "./app-sidebar";

export type LayoutContext = {
  station: StationSetup;
  onSignOut: () => Promise<void>;
};

export function ProtectedLayout() {
  const { data: session, isPending, refetch } = authClient.useSession();
  const stationSetup = useStationSetup(Boolean(session));

  const handleSignOut = async () => {
    await authClient.signOut();
    await refetch();
  };

  if (isPending || (session && stationSetup.isPending)) {
    return (
      <main className="min-h-screen grid place-content-center bg-brand-900 text-brand-50">
        <p className="justify-self-center px-5 py-4 border border-white/20 rounded-lg bg-brand-900/70">
          {session ? "Loading station setup..." : "Checking station access..."}
        </p>
      </main>
    );
  }

  if (!session) {
    return <AuthPage onAuthenticated={refetch} />;
  }

  if (!stationSetup.state?.station) {
    return (
      <StationSetupPage
        statusError={stationSetup.error}
        onConfigured={stationSetup.setState}
      />
    );
  }

  const context: LayoutContext = {
    station: stationSetup.state.station,
    onSignOut: handleSignOut,
  };

  return (
    <main className="grid grid-cols-[248px_1fr] min-h-screen max-md:grid-cols-1">
      <AppSidebar />
      <section className="p-7 grid gap-5 content-start max-md:p-4">
        <Outlet context={context} />
      </section>
    </main>
  );
}
