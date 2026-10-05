import type { Bill } from "@/types";
import { formatDate } from "@/lib/utils";

type InvoiceTemplateProps = {
    bill: Bill;
};

export default function InvoiceTemplate({ bill }: InvoiceTemplateProps) {
    const monthName = new Date(0, bill.month - 1).toLocaleString("default", {
        month: "long",
    });

    const isPaid = bill.status === "Paid";
    const paidAmount = bill.paidAmount ?? (isPaid ? bill.amount : 0);
    const dueAmount = bill.dueAmount ?? (isPaid ? 0 : bill.amount);
    const advanceAmount = bill.advanceAmount ?? 0;

    return (
        <div
            style={{
                width: "210mm",
                minHeight: "297mm",
                padding: "14mm 14mm 12mm 14mm",
                backgroundColor: "#ffffff",
                color: "#000000",
                fontFamily: "'Arial', 'Helvetica Neue', Helvetica, sans-serif",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                fontSize: "11px",
                lineHeight: "1.5",
            }}
        >
            <div>
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        borderBottom: "2px solid #000000",
                        paddingBottom: "10px",
                        marginBottom: "14px",
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontSize: "22px",
                                fontWeight: "900",
                                letterSpacing: "-0.5px",
                                color: "#000000",
                                lineHeight: "1.1",
                            }}
                        >
                            ABUZZ IT LIMITED
                        </div>
                        <div
                            style={{
                                fontSize: "10px",
                                color: "#555555",
                                marginTop: "3px",
                                textTransform: "uppercase",
                                letterSpacing: "0.8px",
                                fontWeight: "600",
                            }}
                        >
                            Nationwide Internet Service Provider
                        </div>
                        <div
                            style={{
                                fontSize: "9px",
                                color: "#666666",
                                marginTop: "2px",
                            }}
                        >
                            <div>Head Office: GA-130, Progati Sarani, Middle Badda, Dhaka-1212</div>
                            <div>Sundarganj Regional Office: Sundarganj Bazar, Sundarganj, Gaibandha</div>
                            <div>Cell: +88 01611090104, +88 01781584484</div>
                        </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                        <div
                            style={{
                                fontSize: "18px",
                                fontWeight: "800",
                                color: "#000000",
                                letterSpacing: "-0.3px",
                            }}
                        >
                            INVOICE
                        </div>
                        <div
                            style={{
                                fontSize: "11px",
                                fontWeight: "700",
                                color: "#000000",
                                marginTop: "2px",
                                fontFamily: "monospace",
                            }}
                        >
                            #{bill.invoiceNumber}
                        </div>
                        <div
                            style={{
                                display: "inline-block",
                                marginTop: "6px",
                                padding: "2px 10px",
                                border: "1.5px solid #000000",
                                fontSize: "10px",
                                fontWeight: "700",
                                letterSpacing: "1px",
                                textTransform: "uppercase",
                                backgroundColor: isPaid ? "#000000" : "#ffffff",
                                color: isPaid ? "#ffffff" : "#000000",
                            }}
                        >
                            {isPaid ? "PAID" : "UNPAID"}
                        </div>
                    </div>
                </div>

                {/* Bill To / Invoice Info Grid */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "16px",
                        marginBottom: "16px",
                    }}
                >
                    {/* Bill To */}
                    <div
                        style={{
                            border: "1px solid #cccccc",
                            padding: "10px 12px",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "9px",
                                fontWeight: "700",
                                textTransform: "uppercase",
                                letterSpacing: "1px",
                                color: "#555555",
                                marginBottom: "6px",
                                borderBottom: "1px solid #eeeeee",
                                paddingBottom: "4px",
                            }}
                        >
                            Billed To
                        </div>
                        <div
                            style={{
                                fontSize: "12px",
                                fontWeight: "800",
                                color: "#000000",
                                marginBottom: "4px",
                            }}
                        >
                            {bill.customer?.name ?? "N/A"}
                        </div>
                        <div style={{ color: "#444444", lineHeight: "1.6" }}>
                            <div>
                                <span style={{ fontWeight: "600" }}>Customer ID: </span>
                                <span style={{ fontFamily: "monospace", fontWeight: "700" }}>
                                    {bill.customer?.customerCode ?? "—"}
                                </span>
                            </div>
                            <div>
                                <span style={{ fontWeight: "600" }}>Phone: </span>
                                {bill.customer?.phone ?? "—"}
                            </div>
                            {bill.customer?.email && (
                                <div>
                                    <span style={{ fontWeight: "600" }}>Email: </span>
                                    {bill.customer.email}
                                </div>
                            )}
                            {bill.customer?.location && (
                                <div>
                                    <span style={{ fontWeight: "600" }}>Location: </span>
                                    {bill.customer.location}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Invoice Info */}
                    <div
                        style={{
                            border: "1px solid #cccccc",
                            padding: "10px 12px",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "9px",
                                fontWeight: "700",
                                textTransform: "uppercase",
                                letterSpacing: "1px",
                                color: "#555555",
                                marginBottom: "6px",
                                borderBottom: "1px solid #eeeeee",
                                paddingBottom: "4px",
                            }}
                        >
                            Invoice Details
                        </div>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <tbody>
                                <InvoiceRow label="Invoice No." value={bill.invoiceNumber} mono />
                                <InvoiceRow label="Billing Period" value={`${monthName} ${bill.year}`} />
                                <InvoiceRow
                                    label="Status"
                                    value={bill.status}
                                    bold
                                />
                                {isPaid && (
                                    <>
                                        <InvoiceRow
                                            label="Payment Date"
                                            value={formatDate(bill.paymentDate)}
                                        />
                                        <InvoiceRow
                                            label="Payment Method"
                                            value={bill.paymentMethod ?? "Cash"}
                                        />
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Line Items Table */}
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        marginBottom: "14px",
                        border: "1px solid #000000",
                    }}
                >
                    <thead>
                        <tr
                            style={{
                                backgroundColor: "#000000",
                                color: "#ffffff",
                            }}
                        >
                            <th
                                style={{
                                    padding: "8px 10px",
                                    textAlign: "left",
                                    fontSize: "9px",
                                    fontWeight: "700",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.8px",
                                }}
                            >
                                Description / Service
                            </th>
                            <th
                                style={{
                                    padding: "8px 10px",
                                    textAlign: "center",
                                    fontSize: "9px",
                                    fontWeight: "700",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.8px",
                                    width: "120px",
                                }}
                            >
                                Package
                            </th>
                            <th
                                style={{
                                    padding: "8px 10px",
                                    textAlign: "center",
                                    fontSize: "9px",
                                    fontWeight: "700",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.8px",
                                    width: "80px",
                                }}
                            >
                                Period
                            </th>
                            <th
                                style={{
                                    padding: "8px 10px",
                                    textAlign: "right",
                                    fontSize: "9px",
                                    fontWeight: "700",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.8px",
                                    width: "90px",
                                }}
                            >
                                Amount
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ borderBottom: "1px solid #dddddd" }}>
                            <td style={{ padding: "10px 10px" }}>
                                <div style={{ fontWeight: "700", color: "#000000" }}>
                                    Internet Service Subscription
                                </div>
                                <div style={{ fontSize: "10px", color: "#777777", marginTop: "2px" }}>
                                    Monthly internet connection & network bandwidth service
                                </div>
                            </td>
                            <td
                                style={{
                                    padding: "10px 10px",
                                    textAlign: "center",
                                    fontWeight: "600",
                                    color: "#222222",
                                }}
                            >
                                {bill.customer?.packageName ?? "Standard Package"}
                            </td>
                            <td
                                style={{
                                    padding: "10px 10px",
                                    textAlign: "center",
                                    fontWeight: "600",
                                    color: "#222222",
                                }}
                            >
                                {monthName.slice(0, 3)} {bill.year}
                            </td>
                            <td
                                style={{
                                    padding: "10px 10px",
                                    textAlign: "right",
                                    fontWeight: "800",
                                    fontSize: "12px",
                                    color: "#000000",
                                }}
                            >
                                ৳ {bill.amount.toFixed(2)}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Financial Summary */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
                    <div
                        style={{
                            width: "260px",
                            border: "1px solid #000000",
                        }}
                    >
                        <SummaryRow label="Subtotal" value={`৳ ${bill.amount.toFixed(2)}`} />
                        <SummaryRow label="Tax / VAT (0%)" value="৳ 0.00" />
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                padding: "8px 12px",
                                borderTop: "2px solid #000000",
                                backgroundColor: "#000000",
                                color: "#ffffff",
                                fontWeight: "800",
                                fontSize: "12px",
                            }}
                        >
                            <span>Total Amount</span>
                            <span>৳ {bill.amount.toFixed(2)}</span>
                        </div>
                        <SummaryRow label="Paid Amount" value={`৳ ${paidAmount.toFixed(2)}`} />
                        <SummaryRow label="Due Amount" value={`৳ ${dueAmount.toFixed(2)}`} />
                        {advanceAmount > 0 && (
                            <SummaryRow label="Advance Amount" value={`৳ ${advanceAmount.toFixed(2)}`} />
                        )}
                    </div>
                </div>

                {/* Remarks */}
                {bill.remarks && (
                    <div
                        style={{
                            border: "1px solid #cccccc",
                            padding: "8px 12px",
                            marginBottom: "14px",
                        }}
                    >
                        <div style={{ fontWeight: "700", marginBottom: "3px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Remarks:
                        </div>
                        <div style={{ color: "#444444" }}>{bill.remarks}</div>
                    </div>
                )}
            </div>

            {/* Footer / Signatures */}
            <div>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        paddingTop: "32px",
                        paddingBottom: "12px",
                    }}
                >
                    <div style={{ textAlign: "center", width: "160px" }}>
                        <div style={{ borderBottom: "1px solid #000000", marginBottom: "6px" }} />
                        <div style={{ fontWeight: "700", fontSize: "10px" }}>Customer Signature</div>
                    </div>
                    <div style={{ textAlign: "center", width: "160px" }}>
                        <div style={{ borderBottom: "1px solid #000000", marginBottom: "6px" }} />
                        <div style={{ fontWeight: "700", fontSize: "10px" }}>Authorized Signature</div>
                        <div style={{ fontSize: "9px", color: "#666666" }}>ABUZZ IT LIMITED</div>
                    </div>
                </div>

                <div
                    style={{
                        borderTop: "1px solid #cccccc",
                        paddingTop: "8px",
                        textAlign: "center",
                        fontSize: "9px",
                        color: "#777777",
                    }}
                >
                    <div style={{ fontWeight: "600", marginBottom: "2px" }}>
                        Thank you for choosing ABUZZ IT LIMITED!
                    </div>
                    <div>
                        This is a computer-generated invoice. For billing inquiries, please contact our helpline.
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper components
function InvoiceRow({
    label,
    value,
    mono,
    bold,
}: {
    label: string;
    value: string | number | null | undefined;
    mono?: boolean;
    bold?: boolean;
}) {
    return (
        <tr>
            <td
                style={{
                    padding: "2px 0",
                    fontSize: "10px",
                    color: "#555555",
                    fontWeight: "600",
                    width: "45%",
                    verticalAlign: "top",
                }}
            >
                {label}
            </td>
            <td
                style={{
                    padding: "2px 0",
                    fontSize: "10px",
                    color: "#000000",
                    fontWeight: bold ? "700" : "500",
                    fontFamily: mono ? "monospace" : "inherit",
                    textAlign: "right",
                }}
            >
                {value ?? "—"}
            </td>
        </tr>
    );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "6px 12px",
                borderBottom: "1px solid #eeeeee",
                fontSize: "10px",
                color: "#333333",
            }}
        >
            <span>{label}</span>
            <span style={{ fontWeight: "600" }}>{value}</span>
        </div>
    );
}