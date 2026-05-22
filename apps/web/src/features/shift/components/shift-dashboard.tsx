import {
  Banknote,
  CreditCard,
  Droplets,
  Fuel,
  Gauge,
  IndianRupee,
  LogOut,
  Plus,
  ReceiptText,
  RefreshCw,
  UserRound,
} from "lucide-react";
import { type StationSetup } from "../../setup";
import { type SaleSummary, type TankSummary } from "../types/shift.types";

const sales: SaleSummary[] = [
  {
    nozzle: "D1-N1",
    fuel: "Petrol",
    liters: "142.320",
    amount: "15,512.88",
    method: "UPI",
  },
  {
    nozzle: "D1-N2",
    fuel: "Diesel",
    liters: "211.840",
    amount: "19,642.36",
    method: "Fleet",
  },
  {
    nozzle: "D2-N1",
    fuel: "Premium",
    liters: "48.220",
    amount: "5,832.40",
    method: "Cash",
  },
];

type ShiftDashboardProps = {
  onSignOut: () => Promise<void>;
  station: StationSetup;
};

export function ShiftDashboard({ onSignOut, station }: ShiftDashboardProps) {
  const tanks = station.tanks.map(
    (tank): TankSummary => ({
      name: tank.name,
      fuel: tank.product.name,
      level: Math.round(
        (Number(tank.currentDip) / Number(tank.capacity)) * 100,
      ),
      stock: `${Number(tank.currentDip).toLocaleString("en-IN")} L`,
    }),
  );

  return (
    <main className="shell">
      <aside className="sidebar" aria-label="Main navigation">
        <div className="brand">
          <Fuel size={24} />
          <span>DSR</span>
        </div>
        <nav>
          <a className="active" href="/">
            <Gauge size={18} />
            Shift
          </a>
          <a href="/">
            <ReceiptText size={18} />
            Sales
          </a>
          <a href="/">
            <Droplets size={18} />
            Tanks
          </a>
          <a href="/">
            <UserRound size={18} />
            Credit
          </a>
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Station {station.code}</p>
            <h1>Morning shift</h1>
          </div>
          <div className="actions">
            <button
              className="iconButton"
              type="button"
              aria-label="Refresh dashboard"
            >
              <RefreshCw size={18} />
            </button>
            <button
              className="iconButton"
              onClick={() => void onSignOut()}
              type="button"
              aria-label="Sign out"
            >
              <LogOut size={18} />
            </button>
            <button type="button">
              <Plus size={18} />
              New sale
            </button>
          </div>
        </header>

        <section className="metrics" aria-label="Shift summary">
          <article>
            <IndianRupee size={20} />
            <p>Gross sales</p>
            <strong>₹40,987.64</strong>
          </article>
          <article>
            <Fuel size={20} />
            <p>Fuel sold</p>
            <strong>402.380 L</strong>
          </article>
          <article>
            <Banknote size={20} />
            <p>Cash in drawer</p>
            <strong>₹9,842.00</strong>
          </article>
          <article>
            <CreditCard size={20} />
            <p>Digital payments</p>
            <strong>₹31,145.64</strong>
          </article>
        </section>

        <section className="contentGrid">
          <div className="panel">
            <div className="panelHeader">
              <h2>Recent sales</h2>
              <span>Live DSR</span>
            </div>
            <div className="table">
              <div className="row head">
                <span>Nozzle</span>
                <span>Fuel</span>
                <span>Liters</span>
                <span>Amount</span>
                <span>Mode</span>
              </div>
              {sales.map((sale) => (
                <div className="row" key={sale.nozzle}>
                  <span>{sale.nozzle}</span>
                  <span>{sale.fuel}</span>
                  <span>{sale.liters}</span>
                  <span>₹{sale.amount}</span>
                  <span>{sale.method}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panelHeader">
              <h2>Tank stock</h2>
              <span>Dip ledger</span>
            </div>
            <div className="tankList">
              {tanks.map((tank) => (
                <article className="tank" key={tank.name}>
                  <div>
                    <strong>{tank.name}</strong>
                    <p>
                      {tank.fuel} · {tank.stock}
                    </p>
                  </div>
                  <div
                    className="bar"
                    aria-label={`${tank.name} level ${tank.level}%`}
                  >
                    <span style={{ width: `${tank.level}%` }} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="reconciliation">
          <h2>Shift reconciliation</h2>
          <div className="reconGrid">
            <label>
              Opening meter
              <input defaultValue="284711.440" />
            </label>
            <label>
              Closing meter
              <input defaultValue="285113.820" />
            </label>
            <label>
              Testing liters
              <input defaultValue="1.500" />
            </label>
            <label>
              Expenses
              <input defaultValue="1250.00" />
            </label>
          </div>
        </section>
      </section>
    </main>
  );
}
