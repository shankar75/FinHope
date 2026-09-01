import { useState, useMemo } from "react";
import {
  Home, Wallet, Landmark, Target, ListChecks, MessageCircle,
  Plus, ArrowUpCircle, ArrowDownCircle, Send, TrendingUp, AlertTriangle, Check
} from "lucide-react";

// ---------- Design tokens ----------
const C = {
  ink: "#0B1F1C",       // deep ledger-green background
  surface: "#122C27",   // card surface
  surface2: "#173832",  // raised surface
  line: "#254741",      // hairline / dot-leader
  ivory: "#F2EFE6",     // primary text
  muted: "#88A199",     // secondary text
  mint: "#7CE6B8",      // primary accent
  mintDim: "#4E9E7E",
  amber: "#F0B429",     // caution
  coral: "#E8593D",     // danger
};

const displayFont = "'Fraunces', Georgia, serif";
const uiFont = "'Inter', system-ui, sans-serif";
const monoFont = "'JetBrains Mono', 'Courier New', monospace";

const fmt = (n) =>
  "₹" + Math.round(n).toLocaleString("en-IN");

// ---------- Ledger row: label ..... value ----------
function LedgerRow({ label, value, valueColor, sub }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8, padding: "10px 0" }}>
      <span style={{ fontFamily: uiFont, fontSize: 13, color: C.muted, whiteSpace: "nowrap" }}>
        {label}
      </span>
      <span style={{
        flex: 1, borderBottom: `1px dotted ${C.line}`, transform: "translateY(-3px)"
      }} />
      <div style={{ textAlign: "right" }}>
        <div style={{ fontFamily: monoFont, fontSize: 16, color: valueColor || C.ivory, fontWeight: 600 }}>
          {value}
        </div>
        {sub && <div style={{ fontFamily: uiFont, fontSize: 11, color: C.muted }}>{sub}</div>}
      </div>
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.line}`,
      borderRadius: 14,
      padding: 16,
      ...style
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ children, right }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0 10px" }}>
      <h2 style={{ fontFamily: displayFont, fontSize: 18, color: C.ivory, margin: 0, fontWeight: 600 }}>
        {children}
      </h2>
      {right}
    </div>
  );
}

// ---------- Health score gauge ----------
function ScoreGauge({ score }) {
  const pct = Math.max(0, Math.min(100, score));
  const angle = (pct / 100) * 270 - 135; // -135 to 135
  const color = pct >= 70 ? C.mint : pct >= 45 ? C.amber : C.coral;
  const r = 54, cx = 60, cy = 60;
  const arc = (startDeg, endDeg) => {
    const toXY = (deg) => {
      const rad = (deg - 90) * Math.PI / 180;
      return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
    };
    const [x1, y1] = toXY(startDeg);
    const [x2, y2] = toXY(endDeg);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <path d={arc(-135, 135)} stroke={C.line} strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d={arc(-135, angle)} stroke={color} strokeWidth="10" fill="none" strokeLinecap="round" />
      <text x="60" y="58" textAnchor="middle" fontFamily={monoFont} fontSize="26" fontWeight="700" fill={C.ivory}>
        {Math.round(pct)}
      </text>
      <text x="60" y="76" textAnchor="middle" fontFamily={uiFont} fontSize="10" fill={C.muted}>
        / 100
      </text>
    </svg>
  );
}

function Pill({ children, tone = "muted" }) {
  const map = {
    muted: { bg: "rgba(136,161,153,0.15)", fg: C.muted },
    danger: { bg: "rgba(232,89,61,0.15)", fg: C.coral },
    warn: { bg: "rgba(240,180,41,0.15)", fg: C.amber },
    good: { bg: "rgba(124,230,184,0.15)", fg: C.mint },
  };
  const s = map[tone];
  return (
    <span style={{
      background: s.bg, color: s.fg, fontFamily: uiFont, fontSize: 11, fontWeight: 600,
      padding: "3px 8px", borderRadius: 999, textTransform: "uppercase", letterSpacing: 0.4
    }}>
      {children}
    </span>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <div style={{ fontFamily: uiFont, fontSize: 12, color: C.muted, marginBottom: 6 }}>{label}</div>
      {children}
    </label>
  );
}

const inputStyle = {
  width: "100%", boxSizing: "border-box", background: C.surface2, border: `1px solid ${C.line}`,
  borderRadius: 8, padding: "10px 12px", color: C.ivory, fontFamily: uiFont, fontSize: 14, outline: "none"
};

function Button({ children, onClick, tone = "mint", full }) {
  const bg = tone === "mint" ? C.mint : tone === "coral" ? C.coral : tone === "amber" ? C.amber : C.surface2;
  const fg = tone === "muted" ? C.ivory : C.ink;
  return (
    <button onClick={onClick} style={{
      background: bg, color: fg, border: "none", borderRadius: 8, padding: "10px 16px",
      fontFamily: uiFont, fontWeight: 700, fontSize: 14, cursor: "pointer",
      width: full ? "100%" : "auto"
    }}>
      {children}
    </button>
  );
}

// ---------- Main App ----------
export default function FinHope() {
  const [tab, setTab] = useState("home");

  const [transactions, setTransactions] = useState([
    { id: 1, type: "income", amount: 32000, category: "Salary", note: "Monthly salary", date: "1 Aug" },
    { id: 2, type: "expense", amount: 12800, category: "Bills", need: true, note: "Rent + utilities", date: "3 Aug" },
    { id: 3, type: "expense", amount: 750, category: "Food", need: false, note: "Weekend dinner", date: "10 Aug" },
  ]);

  const [budgets, setBudgets] = useState({ Food: 3000, Bills: 13000, Transport: 1500 });

  const [loans, setLoans] = useState([
    { id: 1, name: "Rupee112", outstanding: 25846, due: "30 Aug", dueInDays: 2, rate: 36, severity: 8, emi: 3200 },
    { id: 2, name: "Personal Loan - HDFC", outstanding: 219000, due: "5 Sep", dueInDays: 8, rate: 14, severity: 4, emi: 8500 },
  ]);

  const [goals, setGoals] = useState([
    { id: 1, name: "Emergency fund", target: 20000, saved: 4000 },
  ]);

  const [actions, setActions] = useState([
    { id: 1, when: "today", label: "Record today's expenses", done: false },
    { id: 2, when: "today", label: "Keep ₹1,000 aside", done: false },
    { id: 3, when: "today", label: "Contact Rupee112 about due date", done: false },
    { id: 4, when: "week", label: "Pay electricity bill", done: false },
    { id: 5, when: "week", label: "Review subscriptions", done: false },
  ]);

  const [chat, setChat] = useState([
    { from: "bot", text: "Ask me anything about your money — I use your real numbers to answer." }
  ]);
  const [chatInput, setChatInput] = useState("");

  // ---- Derived numbers ----
  const totalIncome = useMemo(() => transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0), [transactions]);
  const totalExpense = useMemo(() => transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0), [transactions]);
  const balance = totalIncome - totalExpense;
  const totalDebt = useMemo(() => loans.reduce((s, l) => s + l.outstanding, 0), [loans]);
  const wantSpend = useMemo(() => transactions.filter(t => t.type === "expense" && t.need === false).reduce((s, t) => s + t.amount, 0), [transactions]);

  // ---- Debt payoff scoring ----
  // priority = 40% urgency (days to due) + 35% cost of delay (interest rate)
  //          + 15% payoff momentum (smaller balance clears faster) + 10% severity (informal/collections risk)
  const scoredLoans = useMemo(() => {
    const maxBalance = Math.max(1, ...loans.map(l => l.outstanding));
    const maxRate = Math.max(1, ...loans.map(l => l.rate || 0), 36); // cap reference so 36%+ reads as max cost
    const scored = loans.map(l => {
      const urgency = l.dueInDays <= 0 ? 100 : Math.max(0, 100 - l.dueInDays * 3);
      const costOfDelay = Math.min(100, ((l.rate || 0) / maxRate) * 100);
      const momentum = (1 - l.outstanding / maxBalance) * 100;
      const severityScore = Math.min(100, (l.severity || 0) * 10);
      const score = 0.40 * urgency + 0.35 * costOfDelay + 0.15 * momentum + 0.10 * severityScore;
      const level = score >= 66 ? "High" : score >= 40 ? "Medium" : "Low";
      return { ...l, score, level };
    });
    return scored.sort((a, b) => b.score - a.score);
  }, [loans]);

  const topLoan = scoredLoans[0];

  // Buffer kept aside before recommending extra debt paydown
  const emergencyBuffer = Math.max(2000, totalIncome * 0.05);
  const safeSurplus = Math.max(0, balance - emergencyBuffer);
  const recommendedPayoff = topLoan ? Math.min(safeSurplus, topLoan.outstanding) : 0;

  // ---- Strategy comparison: avalanche vs. snowball vs. FinHope's hybrid ----
  // A simplified simulation: each month, minimum EMI goes to every loan, and the safe surplus
  // goes entirely to whichever loan the strategy ranks first (re-evaluated as loans close).
  // This estimates months-to-debt-free and total interest paid under each ordering, for comparison only —
  // not a substitute for an amortization schedule.
  const strategyComparison = useMemo(() => {
    if (!loans.length || safeSurplus <= 0) return null;

    const simulate = (orderFn) => {
      let sim = loans.map(l => ({ ...l, bal: l.outstanding }));
      let months = 0, totalInterest = 0;
      const maxMonths = 600; // safety cap
      while (sim.some(l => l.bal > 0) && months < maxMonths) {
        months++;
        // accrue monthly interest, apply minimum EMI
        sim.forEach(l => {
          if (l.bal <= 0) return;
          const interest = (l.bal * (l.rate || 0)) / 100 / 12;
          totalInterest += interest;
          l.bal = Math.max(0, l.bal + interest - (l.emi || 0));
        });
        // apply safe surplus to the top-ranked remaining loan
        const remaining = sim.filter(l => l.bal > 0);
        if (!remaining.length) break;
        const ranked = orderFn(remaining);
        ranked[0].bal = Math.max(0, ranked[0].bal - safeSurplus);
      }
      return { months, totalInterest: Math.round(totalInterest) };
    };

    const avalanche = simulate(arr => [...arr].sort((a, b) => (b.rate || 0) - (a.rate || 0)));
    const snowball = simulate(arr => [...arr].sort((a, b) => a.bal - b.bal));
    const hybrid = simulate(arr => {
      const maxBalance = Math.max(1, ...arr.map(l => l.outstanding));
      const maxRate = Math.max(1, ...arr.map(l => l.rate || 0), 36);
      return [...arr].sort((a, b) => {
        const scoreOf = (l) => {
          const urgency = l.dueInDays <= 0 ? 100 : Math.max(0, 100 - l.dueInDays * 3);
          const costOfDelay = Math.min(100, ((l.rate || 0) / maxRate) * 100);
          const momentum = (1 - l.bal / maxBalance) * 100;
          const severityScore = Math.min(100, (l.severity || 0) * 10);
          return 0.40 * urgency + 0.35 * costOfDelay + 0.15 * momentum + 0.10 * severityScore;
        };
        return scoreOf(b) - scoreOf(a);
      });
    });

    return { avalanche, snowball, hybrid };
  }, [loans, safeSurplus]);

  // Quick win: a smaller loan (not already the top pick) that safeSurplus could fully close outright.
  // Clearing a loan entirely frees up its EMI and gives a momentum win, even if it isn't the highest-cost loan.
  const quickWinLoan = useMemo(() => {
    return scoredLoans
      .filter(l => l.id !== topLoan?.id && l.outstanding <= safeSurplus)
      .sort((a, b) => a.outstanding - b.outstanding)[0] || null;
  }, [scoredLoans, topLoan, safeSurplus]);

  // RBI guideline: total EMI should stay within 50% of income
  const totalEMI = useMemo(() => loans.reduce((s, l) => s + (l.emi || 0), 0), [loans]);
  const emiToIncomeRatio = totalIncome > 0 ? totalEMI / totalIncome : 0;
  const overDebtToIncomeLimit = emiToIncomeRatio > 0.5;

  // ---- Financial Health Score ----
  // Modeled on the Financial Health Network's FinHealth Score (Spend / Save / Borrow / Plan pillars).
  // Two of their eight standard indicators — credit score and insurance — aren't tracked in FinHope V1,
  // so each pillar here uses only the indicators we actually have real data for.
  const healthBreakdown = useMemo(() => {
    // SPEND (25): cash flow ratio + no overdue loans
    const cashFlowRatio = totalIncome > 0 ? balance / totalIncome : 0;
    const cashFlowPts = Math.max(0, Math.min(1, cashFlowRatio)) * 15;
    const overdueCount = scoredLoans.filter(l => l.dueInDays <= 0).length;
    const billTimelinessPts = scoredLoans.length ? (1 - overdueCount / scoredLoans.length) * 10 : 10;
    const spend = cashFlowPts + billTimelinessPts;

    // SAVE (25): emergency fund vs. monthly expenses + progress on other goals
    const monthlyExpense = totalExpense || 1;
    const emergencyGoal = goals.find(g => g.name.toLowerCase().includes("emergency"));
    const emergencyRatio = Math.max(0, Math.min(1, (emergencyGoal?.saved || 0) / monthlyExpense));
    const emergencyPts = emergencyRatio * 15;
    const otherGoals = goals.filter(g => g !== emergencyGoal);
    const otherSaved = otherGoals.reduce((s, g) => s + g.saved, 0);
    const otherTarget = otherGoals.reduce((s, g) => s + g.target, 0);
    const otherGoalsRatio = otherTarget > 0 ? Math.max(0, Math.min(1, otherSaved / otherTarget)) : 1;
    const otherGoalsPts = otherGoalsRatio * 10;
    const save = emergencyPts + otherGoalsPts;

    // BORROW (25): EMI-to-income ratio (RBI 50% ceiling) + share of high-risk loans
    const debtLoadPts = Math.max(0, Math.min(1, (0.5 - emiToIncomeRatio) / (0.5 - 0.2))) * 15;
    const highRiskCount = scoredLoans.filter(l => l.level === "High").length;
    const loanQualityPts = scoredLoans.length ? (1 - highRiskCount / scoredLoans.length) * 10 : 10;
    const borrow = debtLoadPts + loanQualityPts;

    // PLAN (25): buffer maintained after commitments + daily action follow-through
    const bufferPts = emergencyBuffer > 0 ? Math.max(0, Math.min(1, balance / emergencyBuffer)) * 15 : 15;
    const todayActions = actions.filter(a => a.when === "today");
    const actionPts = todayActions.length ? (todayActions.filter(a => a.done).length / todayActions.length) * 10 : 10;
    const plan = bufferPts + actionPts;

    const total = Math.max(5, Math.min(100, spend + save + borrow + plan));
    return {
      total,
      pillars: [
        { name: "Spend", score: Math.round(spend) },
        { name: "Save", score: Math.round(save) },
        { name: "Borrow", score: Math.round(borrow) },
        { name: "Plan", score: Math.round(plan) },
      ],
    };
  }, [totalIncome, balance, totalExpense, goals, scoredLoans, emiToIncomeRatio, emergencyBuffer, actions]);

  const healthScore = healthBreakdown.total;
  const weakestPillar = [...healthBreakdown.pillars].sort((a, b) => a.score - b.score)[0];

  const dailyBudget = Math.max(0, Math.round((balance * 0.5) / 20));

  // ---- Smart Alerts engine ----
  // Rule-based, severity-ranked, capped — targeted signals rather than noisy notifications.
  const categorySpend = useMemo(() => {
    const map = {};
    transactions.filter(t => t.type === "expense").forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return map;
  }, [transactions]);

  // ---- Cash-flow forecast ----
  // Projects forward from the current burn rate to flag a likely shortfall before month end.
  const cashFlowForecast = useMemo(() => {
    const now = new Date();
    const dayOfMonth = Math.max(5, now.getDate()); // clamp low end so early-month data doesn't overreact
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysRemaining = Math.max(0, daysInMonth - dayOfMonth);
    const avgDailySpend = totalExpense / dayOfMonth;
    const projectedRemainingSpend = avgDailySpend * daysRemaining;
    const projectedShortfall = balance - projectedRemainingSpend;
    let shortDateLabel = null;
    if (projectedShortfall < 0 && avgDailySpend > 0) {
      const daysUntilShort = Math.max(0, Math.floor(balance / avgDailySpend));
      const shortDate = new Date(now.getTime() + daysUntilShort * 86400000);
      shortDateLabel = shortDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" });
    }
    return { projectedShortfall, shortDateLabel };
  }, [totalExpense, balance]);

  const alerts = useMemo(() => {
    const list = [];
    const push = (level, icon, text) => list.push({ level, icon, text });

    // 1. Debt-to-income over RBI's 50% guideline — highest severity
    if (overDebtToIncomeLimit) {
      push("danger", "alert", `Total EMI is ${Math.round(emiToIncomeRatio * 100)}% of income — above the recommended 50%`);
    }

    // 2. Cash-flow forecast — projected shortfall before month end
    if (cashFlowForecast.shortDateLabel) {
      push("danger", "alert", `At this pace, you may run short by ${cashFlowForecast.shortDateLabel}`);
    }

    // 3. Loan payments due imminently
    if (topLoan) {
      if (topLoan.dueInDays <= 2) {
        push("danger", "alert", `Payment due in ${Math.max(0, topLoan.dueInDays)}d on ${topLoan.name}`);
      } else if (topLoan.dueInDays <= 7) {
        push("warn", "alert", `Payment due in ${topLoan.dueInDays}d on ${topLoan.name}`);
      }
    }

    // 4. Category budgets — danger if over 100%, warn if 80%+
    Object.entries(budgets).forEach(([cat, limit]) => {
      const spent = categorySpend[cat] || 0;
      if (limit > 0) {
        const pct = spent / limit;
        if (pct >= 1) {
          push("danger", "alert", `You've gone over your ${cat} budget — ${fmt(spent)} of ${fmt(limit)}`);
        } else if (pct >= 0.8) {
          push("warn", "alert", `You've spent ${Math.round(pct * 100)}% of your ${cat} budget`);
        }
      }
    });

    // 5. Discretionary ("want") spending pace vs. weekly target
    const weeklyWantTarget = (totalIncome * 0.1) / 4.3;
    const weeklyWantSpend = wantSpend / 4.3; // rough weekly average from month-to-date
    if (weeklyWantSpend > weeklyWantTarget * 1.1) {
      push("warn", "alert", `"Want" spending is pacing above your weekly target`);
    } else if (totalIncome > 0 && weeklyWantSpend < weeklyWantTarget) {
      const under = Math.round(weeklyWantTarget - weeklyWantSpend);
      push("good", "check", `You're ${fmt(under)} below your weekly spending target`);
    }

    // 6. Savings potential — positive nudge
    if (safeSurplus > 500) {
      push("good", "check", `You can save approximately ${fmt(Math.round(safeSurplus * 0.5))} this month`);
    }

    // 7. Fallback — nothing negative and balance positive
    if (!list.some(a => a.level === "danger" || a.level === "warn") && balance > 0) {
      push("good", "check", "You're within budget so far this month");
    }

    // Rank by severity, cap so it stays useful rather than noisy
    const order = { danger: 0, warn: 1, good: 2 };
    return list.sort((a, b) => order[a.level] - order[b.level]).slice(0, 4);
  }, [overDebtToIncomeLimit, emiToIncomeRatio, cashFlowForecast, topLoan, budgets, categorySpend, totalIncome, wantSpend, safeSurplus, balance]);

  // ---- Add transaction ----
  const [newTx, setNewTx] = useState({ type: "expense", amount: "", category: "Food", need: true, note: "" });
  const addTx = () => {
    if (!newTx.amount) return;
    setTransactions([...transactions, {
      id: Date.now(), type: newTx.type, amount: Number(newTx.amount),
      category: newTx.category, need: newTx.need, note: newTx.note, date: "Today"
    }]);
    setNewTx({ ...newTx, amount: "", note: "" });
  };

  // ---- Add loan ----
  const [newLoan, setNewLoan] = useState({ name: "", outstanding: "", due: "", dueInDays: "", rate: "", severity: "4", emi: "" });
  const addLoan = () => {
    if (!newLoan.name || !newLoan.outstanding) return;
    setLoans([...loans, {
      id: Date.now(),
      name: newLoan.name,
      outstanding: Number(newLoan.outstanding),
      due: newLoan.due || "—",
      dueInDays: newLoan.dueInDays === "" ? 30 : Number(newLoan.dueInDays),
      rate: newLoan.rate === "" ? 0 : Number(newLoan.rate),
      severity: Number(newLoan.severity),
      emi: newLoan.emi === "" ? 0 : Number(newLoan.emi),
    }]);
    setNewLoan({ name: "", outstanding: "", due: "", dueInDays: "", rate: "", severity: "4", emi: "" });
  };

  // ---- Add goal ----
  const [newGoal, setNewGoal] = useState({ name: "", target: "", targetDate: "" });
  const addGoal = () => {
    if (!newGoal.name || !newGoal.target) return;
    setGoals([...goals, { id: Date.now(), name: newGoal.name, target: Number(newGoal.target), saved: 0, targetDate: newGoal.targetDate || "" }]);
    setNewGoal({ name: "", target: "", targetDate: "" });
  };

  // Contributing to a goal is a real transaction — it reduces available balance just like any expense,
  // so the dashboard, health score, and Ask FinHope all stay consistent with money actually committed to goals.
  const [contribInput, setContribInput] = useState({});
  const addContribution = (goal) => {
    const amount = Number(contribInput[goal.id]);
    if (!amount || amount <= 0) return;
    setGoals(goals.map(g => g.id === goal.id ? { ...g, saved: g.saved + amount } : g));
    setTransactions([...transactions, {
      id: Date.now(), type: "expense", amount, category: `Goal: ${goal.name}`,
      need: true, note: "Contribution", date: "Today"
    }]);
    setContribInput({ ...contribInput, [goal.id]: "" });
  };

  // Suggested monthly allocation: emergency fund gets priority up to its own target,
  // then any remaining safe surplus (after the recommended debt payoff) splits across other goals
  // in proportion to how much each still needs.
  const goalAllocations = useMemo(() => {
    const leftoverAfterDebt = Math.max(0, safeSurplus - recommendedPayoff);
    const emergencyGoal = goals.find(g => g.name.toLowerCase().includes("emergency"));
    const others = goals.filter(g => g !== emergencyGoal);
    const alloc = {};
    let remaining = leftoverAfterDebt;

    if (emergencyGoal) {
      const need = Math.max(0, emergencyGoal.target - emergencyGoal.saved);
      const give = Math.min(remaining, need);
      alloc[emergencyGoal.id] = give;
      remaining -= give;
    }
    const totalOtherNeed = others.reduce((s, g) => s + Math.max(0, g.target - g.saved), 0);
    others.forEach(g => {
      const need = Math.max(0, g.target - g.saved);
      alloc[g.id] = totalOtherNeed > 0 ? Math.round(remaining * (need / totalOtherNeed)) : 0;
    });
    return alloc;
  }, [goals, safeSurplus, recommendedPayoff]);

  const toggleAction = (id) => setActions(actions.map(a => a.id === id ? { ...a, done: !a.done } : a));

  // ---- Opportunity cost insight ----
  // Turns "you spent ₹X on Y" into a concrete tradeoff: cutting the biggest discretionary
  // category by 25% would reach the nearest unfinished goal how much sooner.
  const opportunityInsight = useMemo(() => {
    const wantCats = {};
    transactions.filter(t => t.type === "expense" && t.need === false).forEach(t => {
      wantCats[t.category] = (wantCats[t.category] || 0) + t.amount;
    });
    const entries = Object.entries(wantCats).sort((a, b) => b[1] - a[1]);
    if (!entries.length) return null;
    const [topCat, topCatSpend] = entries[0];
    const reduction = topCatSpend * 0.25;
    if (reduction <= 0) return null;

    const targetGoal = goals.find(g => g.target - g.saved > 0);
    if (!targetGoal) return null;
    const remaining = targetGoal.target - targetGoal.saved;
    const currentMonthly = goalAllocations[targetGoal.id] || 0;
    if (currentMonthly <= 0) return null;

    const monthsAtCurrent = remaining / currentMonthly;
    const monthsAtNew = remaining / (currentMonthly + reduction);
    const monthsAccelerated = monthsAtCurrent - monthsAtNew;
    if (monthsAccelerated < 0.2) return null;

    return {
      category: topCat,
      reduction: Math.round(reduction),
      goalName: targetGoal.name,
      months: monthsAccelerated >= 1 ? Math.round(monthsAccelerated) : null,
      days: monthsAccelerated < 1 ? Math.round(monthsAccelerated * 30) : null,
    };
  }, [transactions, goals, goalAllocations]);

  // ---- Ask FinHope: rule-based fallback (used only if the API call fails) ----
  const getRuleBasedReply = (q, chatInputRaw) => {
    let reply = "";
    const numMatch = q.match(/[\d,]+/);
    const amount = numMatch ? Number(numMatch[0].replace(/,/g, "")) : null;
    const isWindfall = /\b(bonus|windfall|got|received|inherit|refund|cashback|won|gift)\b/.test(q) && amount;

    if (isWindfall) {
      const bufferGap = Math.max(0, emergencyBuffer - balance);
      let remaining = amount;
      const toBuffer = Math.min(remaining, bufferGap);
      remaining -= toBuffer;
      const toDebt = topLoan ? Math.min(remaining, topLoan.outstanding) : 0;
      remaining -= toDebt;
      const toGoals = remaining;
      const parts = [];
      if (toBuffer > 0) parts.push(`${fmt(toBuffer)} to top up your safety buffer`);
      if (toDebt > 0) parts.push(`${fmt(toDebt)} toward ${topLoan.name} (your highest-priority loan)`);
      if (toGoals > 0) parts.push(`${fmt(toGoals)} toward your goals`);
      reply = parts.length
        ? `With ${fmt(amount)}, I'd split it: ${parts.join(", ")}. That clears the most expensive debt first while still protecting your buffer.`
        : `With ${fmt(amount)}, you're already well covered — consider putting it fully toward your goals or savings.`;
    } else if (q.includes("afford") || q.includes("spend") || amount) {
      if (amount != null) {
        if (amount <= dailyBudget * 3) {
          reply = `Yes, ${fmt(amount)} fits comfortably. Your available balance is ${fmt(balance)} and your daily discretionary budget is about ${fmt(dailyBudget)}.`;
        } else if (amount <= balance) {
          reply = `You technically have ${fmt(balance)} available, so ${fmt(amount)} would clear — but it's well above your usual ${fmt(dailyBudget)}/day pace. I'd only do this if it's a genuine need, since you still have ${fmt(totalDebt)} in outstanding debt.`;
        } else {
          reply = `I wouldn't. ${fmt(amount)} is more than your available balance of ${fmt(balance)}. Spending it would mean dipping into money needed for upcoming commitments.`;
        }
      } else {
        reply = `Your available balance right now is ${fmt(balance)}, with a daily discretionary budget of about ${fmt(dailyBudget)}. Keep new spending under that and you're on track.`;
      }
    } else if (q.includes("loan") || q.includes("debt") || q.includes("pay")) {
      if (!topLoan) {
        reply = `You don't have any loans on record yet — add one under Debts to get a payoff recommendation.`;
      } else {
        reply = recommendedPayoff > 0
          ? `Put ${fmt(recommendedPayoff)} extra toward ${topLoan.name} — it's your highest priority loan right now. This is general guidance, not regulated financial advice.`
          : `I'd prioritise ${topLoan.name} first, but there's no safe surplus to allocate right now beyond minimum payments.`;
      }
    } else if (q.includes("save") || q.includes("saving")) {
      const totalSuggested = Object.values(goalAllocations).reduce((s, v) => s + v, 0);
      reply = totalSuggested > 0
        ? `You have about ${fmt(totalSuggested)} of safe surplus to put toward your goals this month.`
        : `Right now your safe surplus is going toward debt paydown, so there isn't extra room for goal contributions this month.`;
    } else {
      reply = `Available balance ${fmt(balance)}, total debt ${fmt(totalDebt)}, financial health score ${Math.round(healthScore)}/100. Your weakest pillar is ${weakestPillar.name} (${weakestPillar.score}/25).`;
    }
    return reply;
  };

  const [asking, setAsking] = useState(false);

  // ---- Ask FinHope: LLM-backed, grounded in the user's real live financial state ----
  // Sends the full financial snapshot + conversation history on every turn, so answers are
  // reasoned fresh each time instead of picked from a fixed set of templates — the actual fix
  // for "gives the same answer again and again."
  const askFinHope = async () => {
    if (!chatInput.trim() || asking) return;
    const question = chatInput;
    const userMsg = { from: "user", text: question };
    const nextChat = [...chat, userMsg];
    setChat(nextChat);
    setChatInput("");
    setAsking(true);

    const snapshot = {
      balance, totalIncome, totalExpense, dailyBudget, emergencyBuffer, safeSurplus,
      totalDebt, healthScore: Math.round(healthScore),
      healthPillars: healthBreakdown.pillars,
      loans: scoredLoans.map(l => ({
        name: l.name, outstanding: l.outstanding, rate: l.rate, emi: l.emi,
        dueInDays: l.dueInDays, priorityScore: Math.round(l.score), level: l.level,
      })),
      recommendedPayoff, quickWin: quickWinLoan ? { name: quickWinLoan.name, amount: quickWinLoan.outstanding } : null,
      goals: goals.map(g => ({
        name: g.name, target: g.target, saved: g.saved,
        suggestedMonthly: goalAllocations[g.id] || 0,
      })),
      budgets, categorySpend,
      emiToIncomeRatio: Math.round(emiToIncomeRatio * 100),
    };

    const systemPrompt = `You are Ask FinHope, the conversational assistant inside the FinHope personal finance app for Indian users.
Answer using ONLY the real financial snapshot provided below — never invent numbers. Be direct, specific, and cite actual figures (in ₹) from the snapshot.
Keep answers to 2-4 sentences, conversational, no headers or bullet lists. Vary your phrasing naturally between turns — do not reuse the same sentence structure repeatedly.
For any debt or loan recommendation, add "This is general guidance, not regulated financial advice." only when directly recommending a specific repayment action.
Never suggest new borrowing. Never suggest anything that would push the user's balance negative.

Current financial snapshot (JSON):
${JSON.stringify(snapshot)}`;

    try {
      const apiMessages = nextChat.map(m => ({
        role: m.from === "bot" ? "assistant" : "user",
        content: m.text,
      }));

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: systemPrompt,
          messages: apiMessages,
        }),
      });
      const data = await response.json();
      const text = (data.content || []).map(b => b.text || "").join("\n").trim();
      if (!text) throw new Error("Empty response");
      setChat([...nextChat, { from: "bot", text }]);
    } catch (err) {
      console.error("Ask FinHope API error:", err);
      const fallback = getRuleBasedReply(question.toLowerCase(), question);
      setChat([...nextChat, { from: "bot", text: fallback }]);
    } finally {
      setAsking(false);
    }
  };

  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "track", icon: Wallet, label: "Track" },
    { id: "debts", icon: Landmark, label: "Debts" },
    { id: "goals", icon: Target, label: "Goals" },
    { id: "actions", icon: ListChecks, label: "Actions" },
    { id: "ask", icon: MessageCircle, label: "Ask" },
  ];

  return (
    <div style={{
      background: C.ink, minHeight: "100vh", maxWidth: 420, margin: "0 auto",
      fontFamily: uiFont, color: C.ivory, paddingBottom: 76, position: "relative"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap');
        * { box-sizing: border-box; }
        input:focus { border-color: ${C.mint} !important; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "24px 20px 8px" }}>
        <div style={{ fontFamily: uiFont, fontSize: 12, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>
          Good evening
        </div>
        <div style={{ fontFamily: displayFont, fontSize: 26, fontWeight: 600, marginTop: 2 }}>
          FinHope
        </div>
      </div>

      <div style={{ padding: "0 20px" }}>

        {tab === "home" && (
          <>
            <Card style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8 }}>
              <ScoreGauge score={healthScore} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: uiFont, fontSize: 12, color: C.muted, marginBottom: 4 }}>Financial Health</div>
                <Pill tone={healthScore >= 70 ? "good" : healthScore >= 45 ? "warn" : "danger"}>
                  {healthScore >= 70 ? "Healthy" : healthScore >= 45 ? "Coping" : "Vulnerable"}
                </Pill>
                <div style={{ fontFamily: uiFont, fontSize: 12, color: C.muted, marginTop: 8 }}>
                  {weakestPillar.name} is your weakest pillar ({weakestPillar.score}/25) — focus there first.
                </div>
              </div>
            </Card>

            <Card style={{ marginTop: 14 }}>
              <div style={{ fontFamily: uiFont, fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700, marginBottom: 10 }}>
                Spend · Save · Borrow · Plan
              </div>
              {healthBreakdown.pillars.map(p => (
                <div key={p.name} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: C.ivory }}>{p.name}</span>
                    <span style={{ fontFamily: monoFont, color: C.muted }}>{p.score}/25</span>
                  </div>
                  <div style={{ background: C.surface2, borderRadius: 6, height: 6, overflow: "hidden" }}>
                    <div style={{
                      width: `${(p.score / 25) * 100}%`, height: "100%",
                      background: p.score >= 18 ? C.mint : p.score >= 10 ? C.amber : C.coral
                    }} />
                  </div>
                </div>
              ))}
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                Modeled on the Financial Health Network's Spend/Save/Borrow/Plan framework.
              </div>
            </Card>

            <Card style={{ marginTop: 14 }}>
              <LedgerRow label="Available this month" value={fmt(balance)} valueColor={balance >= 0 ? C.mint : C.coral} />
              <LedgerRow label="Total income" value={fmt(totalIncome)} />
              <LedgerRow label="Total spent" value={fmt(totalExpense)} />
              <LedgerRow label="Outstanding debt" value={fmt(totalDebt)} valueColor={C.coral} />
            </Card>

            <Card style={{ marginTop: 14, borderColor: C.mintDim }}>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <TrendingUp size={18} color={C.mint} style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ fontFamily: uiFont, fontSize: 13, lineHeight: 1.5, color: C.ivory }}>
                  You have <b>{fmt(balance)}</b> available. I'd keep discretionary spending near <b>{fmt(dailyBudget)}/day</b> until your next debt payment on {loans[0]?.due || "—"}.
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <Button onClick={() => setTab("ask")}>Ask FinHope</Button>
              </div>
            </Card>

            {opportunityInsight && (
              <Card style={{ marginTop: 14, borderColor: C.amber }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <TrendingUp size={18} color={C.amber} style={{ marginTop: 2, flexShrink: 0 }} />
                  <div style={{ fontFamily: uiFont, fontSize: 13, lineHeight: 1.5, color: C.ivory }}>
                    Cutting <b>{opportunityInsight.category}</b> spending by 25% (about {fmt(opportunityInsight.reduction)}/month) could reach <b>{opportunityInsight.goalName}</b>{" "}
                    {opportunityInsight.months ? <>{opportunityInsight.months} month{opportunityInsight.months === 1 ? "" : "s"} sooner</> : <>{opportunityInsight.days} days sooner</>}.
                  </div>
                </div>
              </Card>
            )}

            <SectionTitle>Alerts</SectionTitle>
            <Card style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {alerts.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 8, fontSize: 13 }}>
                  {a.icon === "check"
                    ? <Check size={16} color={C.mint} style={{ flexShrink: 0 }} />
                    : <AlertTriangle size={16} color={a.level === "danger" ? C.coral : C.amber} style={{ flexShrink: 0 }} />
                  }
                  {a.text}
                </div>
              ))}
            </Card>
          </>
        )}

        {tab === "track" && (
          <>
            <SectionTitle>Add transaction</SectionTitle>
            <Card>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <Button tone={newTx.type === "income" ? "mint" : "muted"} onClick={() => setNewTx({ ...newTx, type: "income" })}>Income</Button>
                <Button tone={newTx.type === "expense" ? "coral" : "muted"} onClick={() => setNewTx({ ...newTx, type: "expense" })}>Expense</Button>
              </div>
              <Field label="Amount (₹)">
                <input style={inputStyle} type="number" value={newTx.amount} onChange={e => setNewTx({ ...newTx, amount: e.target.value })} placeholder="0" />
              </Field>
              <Field label="Category">
                <input style={inputStyle} value={newTx.category} onChange={e => setNewTx({ ...newTx, category: e.target.value })} />
              </Field>
              {newTx.type === "expense" && (
                <Field label="Type">
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button tone={newTx.need ? "mint" : "muted"} onClick={() => setNewTx({ ...newTx, need: true })}>Need</Button>
                    <Button tone={!newTx.need ? "amber" : "muted"} onClick={() => setNewTx({ ...newTx, need: false })}>Want</Button>
                  </div>
                </Field>
              )}
              <Field label="Note">
                <input style={inputStyle} value={newTx.note} onChange={e => setNewTx({ ...newTx, note: e.target.value })} placeholder="Optional" />
              </Field>
              <Button full onClick={addTx}>Add</Button>
            </Card>

            <SectionTitle>Recent</SectionTitle>
            <Card style={{ padding: 0 }}>
              {transactions.slice().reverse().map((t, i) => (
                <div key={t.id} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
                  borderBottom: i < transactions.length - 1 ? `1px solid ${C.line}` : "none"
                }}>
                  {t.type === "income" ? <ArrowUpCircle size={20} color={C.mint} /> : <ArrowDownCircle size={20} color={C.coral} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{t.category}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{t.note} · {t.date}</div>
                  </div>
                  <div style={{ fontFamily: monoFont, fontWeight: 700, color: t.type === "income" ? C.mint : C.coral }}>
                    {t.type === "income" ? "+" : "−"}{fmt(t.amount)}
                  </div>
                </div>
              ))}
            </Card>

            <SectionTitle>Budgets</SectionTitle>
            <Card>
              {Object.entries(budgets).map(([cat, limit]) => {
                const spent = categorySpend[cat] || 0;
                const pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
                const barColor = pct >= 100 ? C.coral : pct >= 80 ? C.amber : C.mint;
                return (
                  <div key={cat} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{cat}</span>
                      <input
                        style={{ ...inputStyle, width: 90, padding: "4px 8px", fontSize: 12, textAlign: "right" }}
                        type="number"
                        value={limit}
                        onChange={e => setBudgets({ ...budgets, [cat]: Number(e.target.value) || 0 })}
                      />
                    </div>
                    <div style={{ background: C.surface2, borderRadius: 6, height: 6, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: barColor }} />
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                      {fmt(spent)} of {fmt(limit)} spent
                    </div>
                  </div>
                );
              })}
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="New category"
                  id="newBudgetCat"
                  onKeyDown={e => {
                    if (e.key === "Enter" && e.target.value.trim()) {
                      setBudgets({ ...budgets, [e.target.value.trim()]: 1000 });
                      e.target.value = "";
                    }
                  }}
                />
              </div>
            </Card>
          </>
        )}

        {tab === "debts" && (
          <>
            <SectionTitle>Loans & debts</SectionTitle>

            {overDebtToIncomeLimit && (
              <Card style={{ marginBottom: 14, borderColor: C.coral }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <AlertTriangle size={18} color={C.coral} style={{ marginTop: 2, flexShrink: 0 }} />
                  <div style={{ fontFamily: uiFont, fontSize: 13, lineHeight: 1.5 }}>
                    Your total EMI is <b style={{ color: C.coral }}>{Math.round(emiToIncomeRatio * 100)}%</b> of income — above the RBI's recommended 50% threshold. Consider consolidating or renegotiating terms before taking on any new borrowing.
                  </div>
                </div>
              </Card>
            )}

            {topLoan && (
              <Card style={{ marginBottom: 14, borderColor: C.mintDim }}>
                <div style={{ fontSize: 11, color: C.mint, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700, marginBottom: 6 }}>
                  Suggested payoff
                </div>
                <div style={{ fontFamily: uiFont, fontSize: 13, lineHeight: 1.5, marginBottom: 8 }}>
                  {recommendedPayoff > 0
                    ? <>Put <b style={{ color: C.mint }}>{fmt(recommendedPayoff)}</b> extra toward <b>{topLoan.name}</b> — it scores highest on urgency, interest cost, and risk.</>
                    : <>Prioritise <b>{topLoan.name}</b> when funds free up — no safe surplus to allocate beyond minimums right now.</>
                  }
                </div>
                <LedgerRow label="Priority score" value={`${Math.round(topLoan.score)} / 100`} valueColor={C.mint} />
                <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                  Kept aside as a buffer: {fmt(emergencyBuffer)}. General guidance, not regulated financial advice.
                </div>
              </Card>
            )}

            {quickWinLoan && (
              <Card style={{ marginBottom: 14, borderColor: C.amber }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <TrendingUp size={18} color={C.amber} style={{ marginTop: 2, flexShrink: 0 }} />
                  <div style={{ fontFamily: uiFont, fontSize: 13, lineHeight: 1.5 }}>
                    Quick win: {fmt(quickWinLoan.outstanding)} would fully close <b>{quickWinLoan.name}</b> right now. That frees up its {fmt(quickWinLoan.emi || 0)}/month EMI and gives you a completed loan before tackling {topLoan?.name}.
                  </div>
                </div>
              </Card>
            )}

            {strategyComparison && (
              <Card style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700, marginBottom: 10 }}>
                  Compare strategies
                </div>
                {[
                  { key: "avalanche", label: "Avalanche (highest rate first)" },
                  { key: "snowball", label: "Snowball (smallest balance first)" },
                  { key: "hybrid", label: "FinHope hybrid (recommended)" },
                ].map(({ key, label }) => {
                  const s = strategyComparison[key];
                  const isHybrid = key === "hybrid";
                  return (
                    <div key={key} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "8px 0", borderBottom: key !== "hybrid" ? `1px solid ${C.line}` : "none"
                    }}>
                      <span style={{ fontSize: 12, color: isHybrid ? C.mint : C.ivory, fontWeight: isHybrid ? 700 : 400 }}>{label}</span>
                      <span style={{ fontFamily: monoFont, fontSize: 12, color: C.muted, textAlign: "right" }}>
                        {s.months}mo · {fmt(s.totalInterest)} interest
                      </span>
                    </div>
                  );
                })}
                <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>
                  Simplified simulation based on current balances, rates, and minimum EMIs — for comparison only, not a guarantee.
                </div>
              </Card>
            )}

            {scoredLoans.map(l => (
              <Card key={l.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{l.name}</div>
                  <Pill tone={l.level === "High" ? "danger" : l.level === "Medium" ? "warn" : "good"}>{l.level}</Pill>
                </div>
                <LedgerRow label="Outstanding" value={fmt(l.outstanding)} valueColor={C.coral} />
                <LedgerRow label="Due" value={`${l.due} (${l.dueInDays}d)`} />
                <LedgerRow label="Interest rate" value={`${l.rate}%`} />
                <LedgerRow label="Monthly EMI" value={fmt(l.emi || 0)} />
                <LedgerRow label="Priority score" value={Math.round(l.score)} />
              </Card>
            ))}

            <SectionTitle>Add a loan</SectionTitle>
            <Card>
              <Field label="Lender / loan name">
                <input style={inputStyle} value={newLoan.name} onChange={e => setNewLoan({ ...newLoan, name: e.target.value })} />
              </Field>
              <Field label="Outstanding amount (₹)">
                <input style={inputStyle} type="number" value={newLoan.outstanding} onChange={e => setNewLoan({ ...newLoan, outstanding: e.target.value })} />
              </Field>
              <Field label="Monthly EMI (₹)">
                <input style={inputStyle} type="number" value={newLoan.emi} onChange={e => setNewLoan({ ...newLoan, emi: e.target.value })} placeholder="e.g. 3200" />
              </Field>
              <Field label="Due date (label)">
                <input style={inputStyle} value={newLoan.due} onChange={e => setNewLoan({ ...newLoan, due: e.target.value })} placeholder="e.g. 30 Aug" />
              </Field>
              <Field label="Days until due">
                <input style={inputStyle} type="number" value={newLoan.dueInDays} onChange={e => setNewLoan({ ...newLoan, dueInDays: e.target.value })} placeholder="e.g. 5" />
              </Field>
              <Field label="Interest / penalty rate (% annual)">
                <input style={inputStyle} type="number" value={newLoan.rate} onChange={e => setNewLoan({ ...newLoan, rate: e.target.value })} placeholder="e.g. 24" />
              </Field>
              <Field label="Risk if unpaid (informal lender, collections, credit impact)">
                <div style={{ display: "flex", gap: 8 }}>
                  <Button tone={newLoan.severity === "2" ? "mint" : "muted"} onClick={() => setNewLoan({ ...newLoan, severity: "2" })}>Low</Button>
                  <Button tone={newLoan.severity === "5" ? "amber" : "muted"} onClick={() => setNewLoan({ ...newLoan, severity: "5" })}>Medium</Button>
                  <Button tone={newLoan.severity === "9" ? "coral" : "muted"} onClick={() => setNewLoan({ ...newLoan, severity: "9" })}>High</Button>
                </div>
              </Field>
              <Button full onClick={addLoan}>Add loan</Button>
            </Card>
          </>
        )}

        {tab === "goals" && (
          <>
            <SectionTitle>Goals</SectionTitle>

            {Object.values(goalAllocations).some(v => v > 0) && (
              <Card style={{ marginBottom: 14, borderColor: C.mintDim }}>
                <div style={{ fontSize: 11, color: C.mint, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700, marginBottom: 6 }}>
                  Suggested this month
                </div>
                <div style={{ fontFamily: uiFont, fontSize: 13, lineHeight: 1.5 }}>
                  After your recommended debt payment, you have room to put money toward your goals — split below by what each one still needs.
                </div>
              </Card>
            )}

            {goals.map(g => {
              const remaining = Math.max(0, g.target - g.saved);
              const suggested = goalAllocations[g.id] || 0;
              const monthsAtSuggested = suggested > 0 ? Math.ceil(remaining / suggested) : null;
              return (
                <Card key={g.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{g.name}</div>
                    {g.targetDate && <Pill tone="muted">{g.targetDate}</Pill>}
                  </div>
                  <div style={{ background: C.surface2, borderRadius: 6, height: 8, overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(100, (g.saved / g.target) * 100)}%`, background: C.mint, height: "100%" }} />
                  </div>
                  <LedgerRow label="Saved" value={fmt(g.saved)} sub={`of ${fmt(g.target)}`} valueColor={C.mint} />
                  {remaining > 0 && suggested > 0 && (
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>
                      Suggested: {fmt(suggested)}/month · ~{monthsAtSuggested} month{monthsAtSuggested === 1 ? "" : "s"} to reach goal
                    </div>
                  )}
                  {remaining === 0 && (
                    <div style={{ fontSize: 11, color: C.mint, marginBottom: 8, fontWeight: 600 }}>Goal reached 🎉</div>
                  )}
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      style={{ ...inputStyle, flex: 1 }}
                      type="number"
                      placeholder={suggested > 0 ? `e.g. ${suggested}` : "Amount"}
                      value={contribInput[g.id] || ""}
                      onChange={e => setContribInput({ ...contribInput, [g.id]: e.target.value })}
                    />
                    <Button onClick={() => addContribution(g)}>Add</Button>
                  </div>
                </Card>
              );
            })}

            <SectionTitle>Add a goal</SectionTitle>
            <Card>
              <Field label="Goal name">
                <input style={inputStyle} value={newGoal.name} onChange={e => setNewGoal({ ...newGoal, name: e.target.value })} />
              </Field>
              <Field label="Target amount (₹)">
                <input style={inputStyle} type="number" value={newGoal.target} onChange={e => setNewGoal({ ...newGoal, target: e.target.value })} />
              </Field>
              <Field label="Target date (optional)">
                <input style={inputStyle} value={newGoal.targetDate} onChange={e => setNewGoal({ ...newGoal, targetDate: e.target.value })} placeholder="e.g. Dec 2026" />
              </Field>
              <Button full onClick={addGoal}>Add goal</Button>
            </Card>
          </>
        )}

        {tab === "actions" && (
          <>
            <SectionTitle>Today</SectionTitle>
            <Card style={{ padding: 0 }}>
              {actions.filter(a => a.when === "today").map((a, i, arr) => (
                <div key={a.id} onClick={() => toggleAction(a.id)} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", cursor: "pointer",
                  borderBottom: i < arr.length - 1 ? `1px solid ${C.line}` : "none"
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 5, border: `2px solid ${a.done ? C.mint : C.line}`,
                    background: a.done ? C.mint : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                  }}>
                    {a.done && <Check size={13} color={C.ink} />}
                  </div>
                  <span style={{ fontSize: 13, textDecoration: a.done ? "line-through" : "none", color: a.done ? C.muted : C.ivory }}>
                    {a.label}
                  </span>
                </div>
              ))}
            </Card>

            <SectionTitle>This week</SectionTitle>
            <Card style={{ padding: 0 }}>
              {actions.filter(a => a.when === "week").map((a, i, arr) => (
                <div key={a.id} onClick={() => toggleAction(a.id)} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", cursor: "pointer",
                  borderBottom: i < arr.length - 1 ? `1px solid ${C.line}` : "none"
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 5, border: `2px solid ${a.done ? C.mint : C.line}`,
                    background: a.done ? C.mint : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                  }}>
                    {a.done && <Check size={13} color={C.ink} />}
                  </div>
                  <span style={{ fontSize: 13, textDecoration: a.done ? "line-through" : "none", color: a.done ? C.muted : C.ivory }}>
                    {a.label}
                  </span>
                </div>
              ))}
            </Card>
          </>
        )}

        {tab === "ask" && (
          <>
            <SectionTitle>Ask FinHope</SectionTitle>
            <Card style={{ minHeight: 300, display: "flex", flexDirection: "column" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
                {chat.map((m, i) => (
                  <div key={i} style={{
                    alignSelf: m.from === "bot" ? "flex-start" : "flex-end",
                    background: m.from === "bot" ? C.surface2 : C.mint,
                    color: m.from === "bot" ? C.ivory : C.ink,
                    padding: "10px 12px", borderRadius: 10, maxWidth: "85%", fontSize: 13, lineHeight: 1.4
                  }}>
                    {m.text}
                  </div>
                ))}
                {asking && (
                  <div style={{
                    alignSelf: "flex-start", background: C.surface2, color: C.muted,
                    padding: "10px 12px", borderRadius: 10, fontSize: 13, fontStyle: "italic"
                  }}>
                    Thinking…
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  style={{ ...inputStyle, flex: 1, opacity: asking ? 0.6 : 1 }}
                  value={chatInput}
                  disabled={asking}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && askFinHope()}
                  placeholder="Can I spend ₹2,000 today?"
                />
                <button onClick={askFinHope} disabled={asking} style={{
                  background: C.mint, border: "none", borderRadius: 8, width: 40, display: "flex",
                  alignItems: "center", justifyContent: "center", cursor: asking ? "default" : "pointer",
                  opacity: asking ? 0.6 : 1
                }}>
                  <Send size={16} color={C.ink} />
                </button>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 420,
        background: C.surface, borderTop: `1px solid ${C.line}`, display: "flex", justifyContent: "space-around", padding: "10px 4px"
      }}>
        {navItems.map(({ id, icon: Icon, label }) => (
          <div key={id} onClick={() => setTab(id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer",
            color: tab === id ? C.mint : C.muted, flex: 1
          }}>
            <Icon size={18} />
            <span style={{ fontSize: 9, fontFamily: uiFont, fontWeight: 600 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
