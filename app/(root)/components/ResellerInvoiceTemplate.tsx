import type { ResellerBill } from "@/types";
import { formatDate } from "@/lib/utils";

type ResellerInvoiceTemplateProps = {
  bill: ResellerBill;
};

export default function ResellerInvoiceTemplate({
  bill,
}: ResellerInvoiceTemplateProps) {
  const monthName = new Date(0, bill.month - 1).toLocaleString("default", {
    month: "long",
  });

  const isPaid = bill.status === "Paid";

  return (
    <div
      className="w-[210mm] min-h-[297mm] p-10 bg-white text-slate-800 font-sans relative flex flex-col justify-between"
      style={{
        boxSizing: "border-box",
        backgroundColor: "#ffffff",
        color: "#1e293b",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Top Accent Bar */}
      <div
        className="absolute top-0 left-0 right-0 h-3"
        style={{
          background: "linear-gradient(to right, #4c1d95, #7c3aed, #a855f7)",
        }}
      />

      <div>
        {/* Header Section */}
        <div className="flex justify-between items-start pt-2 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm tracking-tighter"
                style={{
                  background: "linear-gradient(135deg, #4c1d95, #7c3aed)",
                }}
              >
                SBN
              </div>
              <h1 className="text-2xl font-black text-[#4c1d95] tracking-tight">
                SBN Enterprise
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase">
              Reseller & Upstream Distribution Billing
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Support: +880 1700-000000 | Billing: info@sbnsolutions.com
            </p>
          </div>

          <div className="text-right">
            <span
              className="inline-block px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest mb-2"
              style={{
                backgroundColor: isPaid ? "#ecfdf5" : "#fff1f2",
                color: isPaid ? "#047857" : "#be123c",
                border: `1px solid ${isPaid ? "#a7f3d0" : "#fecdd3"}`,
              }}
            >
              {isPaid ? "✓ PAID INVOICE" : "⚠ UNPAID INVOICE"}
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {bill.invoiceNumber}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Billing Period:{" "}
              <span className="font-bold text-slate-700">
                {monthName} {bill.year}
              </span>
            </p>
          </div>
        </div>

        {/* Info Grid: Reseller Details & Invoice Info */}
        <div className="grid grid-cols-2 gap-8 my-7">
          {/* Reseller Details */}
          <div
            className="p-4 rounded-xl border border-slate-100"
            style={{ backgroundColor: "#f8fafc" }}
          >
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Billed To (Reseller Partner)
            </p>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {bill.reseller?.name ?? "N/A"}
            </h3>
            <div className="space-y-1 text-xs text-slate-600">
              <p>
                <span className="font-semibold text-slate-500">Reseller Code:</span>{" "}
                <span className="font-mono font-bold text-[#4c1d95]">
                  {bill.reseller?.resellerCode ?? "—"}
                </span>
              </p>
              <p>
                <span className="font-semibold text-slate-500">Phone:</span>{" "}
                {bill.reseller?.phone ?? "—"}
              </p>
              {bill.reseller?.email && (
                <p>
                  <span className="font-semibold text-slate-500">Email:</span>{" "}
                  {bill.reseller.email}
                </p>
              )}
              {bill.reseller?.location && (
                <p>
                  <span className="font-semibold text-slate-500">Location / Zone:</span>{" "}
                  {bill.reseller.location}
                </p>
              )}
            </div>
          </div>

          {/* Invoice Information */}
          <div
            className="p-4 rounded-xl border border-slate-100"
            style={{ backgroundColor: "#f8fafc" }}
          >
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Invoice Information
            </p>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-medium">Invoice Number:</span>
                <span className="font-mono font-bold text-slate-800">
                  {bill.invoiceNumber}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-medium">Billing Cycle:</span>
                <span className="font-bold text-slate-800">
                  {monthName} {bill.year}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500 font-medium">Payment Status:</span>
                <span
                  className="font-bold"
                  style={{ color: isPaid ? "#059669" : "#dc2626" }}
                >
                  {bill.status}
                </span>
              </div>
              {isPaid && (
                <>
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500 font-medium">Payment Date:</span>
                    <span className="font-bold text-slate-800">
                      {formatDate(bill.paymentDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Payment Method:</span>
                    <span className="font-bold text-slate-800">
                      {bill.paymentMethod ?? "Cash"}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Reseller Client Distribution Summary */}
        <div className="mb-6 p-4 rounded-xl border border-violet-100 bg-violet-50/50 flex items-center justify-between text-xs">
          <div>
            <p className="font-bold text-violet-900">Reseller Subscriber Metrics</p>
            <p className="text-[11px] text-violet-700 mt-0.5">
              Service coverage: {bill.reseller?.location ?? "General Area"}
            </p>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <div>
              <span className="text-slate-500">Active Subscribers: </span>
              <span className="font-extrabold text-emerald-700 text-sm">
                {bill.reseller?.activeClients ?? 0}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Inactive Subscribers: </span>
              <span className="font-extrabold text-slate-600 text-sm">
                {bill.reseller?.inactiveClients ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-6 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                style={{
                  backgroundColor: "#4c1d95",
                  color: "#ffffff",
                }}
              >
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider">
                  Service Description
                </th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-center">
                  Bandwidth / Plan
                </th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-center">
                  Period
                </th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-right">
                  Amount ($)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              <tr style={{ backgroundColor: "#ffffff" }}>
                <td className="py-3.5 px-4">
                  <p className="font-bold text-slate-800">
                    Reseller Bandwidth & Upstream Distribution
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Dedicated upstream bandwidth and network infrastructure services
                  </p>
                </td>
                <td className="py-3.5 px-4 text-center font-medium text-slate-700">
                  {bill.reseller?.packageDesc || "Dedicated Reseller Link"}
                </td>
                <td className="py-3.5 px-4 text-center font-medium text-slate-700">
                  {monthName.slice(0, 3)} {bill.year}
                </td>
                <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 text-sm">
                  $ {bill.amount.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Financial Summary Box */}
        <div className="flex justify-end mb-8">
          <div
            className="w-72 rounded-xl border border-slate-200 p-4 space-y-2 text-xs"
            style={{ backgroundColor: "#f8fafc" }}
          >
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">
                $ {bill.amount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax / VAT (0%)</span>
              <span className="font-semibold text-slate-800">$ 0.00</span>
            </div>
            <div
              className="flex justify-between text-sm font-black pt-2.5 border-t border-slate-200"
              style={{ color: "#4c1d95" }}
            >
              <span>Total Bill Amount</span>
              <span>$ {bill.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600 pt-1">
              <span>Payment Status</span>
              <span
                className="font-bold"
                style={{ color: isPaid ? "#059669" : "#dc2626" }}
              >
                {bill.status}
              </span>
            </div>
          </div>
        </div>

        {/* Remarks */}
        {bill.remarks && (
          <div
            className="p-3.5 rounded-xl border border-purple-100 text-xs mb-6"
            style={{ backgroundColor: "#faf5ff" }}
          >
            <p className="font-bold text-[#4c1d95] mb-0.5">Invoice Remarks:</p>
            <p className="text-slate-600">{bill.remarks}</p>
          </div>
        )}
      </div>

      {/* Footer & Signatures */}
      <div>
        <div className="flex justify-between items-end pt-12 pb-6 text-xs">
          <div className="text-center w-48">
            <div className="border-b border-slate-300 pb-1 mb-1.5" />
            <p className="font-bold text-slate-700">Reseller Signature</p>
          </div>

          <div className="text-center w-48">
            <div className="border-b border-slate-300 pb-1 mb-1.5" />
            <p className="font-bold text-[#4c1d95]">Authorized Signature</p>
            <p className="text-[10px] text-slate-400">
              SBN Enterprise Accounts
            </p>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-3 text-center text-[10px] text-slate-400">
          <p className="font-semibold text-slate-500">
            Thank you for your partnership with SBN Enterprise!
          </p>
          <p className="mt-0.5">
            This is a computer-generated invoice document. For reseller billing queries, please contact corporate accounts.
          </p>
        </div>
      </div>
    </div>
  );
}
