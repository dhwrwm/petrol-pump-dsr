import { authClient } from "./auth-client";
import { AuthPage } from "./features/auth";
import { StationSetupPage, useStationSetup } from "./features/setup";
import { ShiftDashboard } from "./features/shift";

export function App() {
  const { data: session, isPending, refetch } = authClient.useSession();
  const stationSetup = useStationSetup(Boolean(session));

  if (isPending || (session && stationSetup.isPending)) {
    return (
      <main className="authShell">
        <p className="authLoading">
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

  return (
    <ShiftDashboard
      station={stationSetup.state.station}
      onSignOut={async () => {
        await authClient.signOut();
        await refetch();
      }}
    />
  );
}
