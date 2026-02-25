import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface BillOperation {
    lineItems: Array<LineItem>;
    amountPaid: number;
    billDate: bigint;
    invoiceNumber: string;
    partyName: string;
}
export interface LineItem {
    rate: number;
    srNo: bigint;
    unit: string;
    hsnCode: string;
    productName: string;
    totalAmount: number;
    quantity: number;
}
export interface ProfitLossSummary {
    totalReceived: number;
    totalOutstanding: number;
    profitLossIndicator: boolean;
    totalBilled: number;
}
export interface Bill {
    lineItems: Array<LineItem>;
    finalAmount: number;
    cgst: number;
    sgst: number;
    totalGst: number;
    amountPaid: number;
    billDate: bigint;
    invoiceNumber: string;
    baseAmount: number;
    partyName: string;
    pendingAmount: number;
    roundOff: number;
}
export interface CompanyReport {
    totalReceived: number;
    totalServiceAmount: number;
    bills: Array<Bill>;
    totalPending: number;
}
export interface PartySummary {
    gstNumber: string;
    totalPaid: number;
    totalBilled: number;
    partyName: string;
    billCount: bigint;
    totalPending: number;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBill(billOp: BillOperation): Promise<Bill>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    billExists(invoiceNumber: string): Promise<boolean>;
    deleteBill(invoiceNumber: string): Promise<Bill>;
    editBill(invoiceNumber: string, updatedBillOp: BillOperation): Promise<Bill>;
    getAggregate(): Promise<{
        totalGst: number;
        totalAmount: number;
    }>;
    getAllBills(): Promise<Array<Bill>>;
    getBill(invoiceNumber: string): Promise<Bill>;
    getBillsByParty(partyName: string): Promise<Array<Bill>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCompanyReport(partyName: string, from: bigint, to: bigint): Promise<CompanyReport>;
    getPartyGstNumber(partyName: string): Promise<string>;
    getPartySummary(): Promise<Array<PartySummary>>;
    getPartySummaryByDateRange(from: bigint, to: bigint): Promise<Array<PartySummary>>;
    getProfitLossSummary(from: bigint, to: bigint): Promise<ProfitLossSummary>;
    getUniquePartyNames(): Promise<Array<string>>;
    getUniqueProductNames(): Promise<Array<string>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    savePartyGstNumber(partyName: string, gstNumber: string): Promise<void>;
}
