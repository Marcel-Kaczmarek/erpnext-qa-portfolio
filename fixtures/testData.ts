export function uniqueName(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export const salesFlowData = {
  customerName: uniqueName("QA-Customer"),
  itemCode: uniqueName("QA-Item"),
  itemRate: 100,
  qty: 2,
};

/** ISO format (YYYY-MM-DD) — what the Frappe REST API expects for date fields. */
export function futureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
}

export function pastDate(daysAgo: number): string {
  return futureDate(-daysAgo);
}
