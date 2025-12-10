"use client";

import { Wallet, WalletTransaction } from '@/types';

// In-memory wallet store for development
const wallets: Map<string, Wallet> = new Map();

/**
 * Get or create wallet for a user
 */
export function getWallet(userId: string): Wallet {
    if (!wallets.has(userId)) {
        wallets.set(userId, {
            userId,
            balance: 0,
            pendingBalance: 0,
            transactions: [],
        });
    }
    return wallets.get(userId)!;
}

/**
 * Add funds to wallet (e.g., after a job is paid)
 */
export function addPendingFunds(userId: string, amount: number, jobId: string, description: string): WalletTransaction {
    const wallet = getWallet(userId);

    const transaction: WalletTransaction = {
        id: `txn-${Date.now()}`,
        userId,
        jobId,
        type: 'CREDIT',
        amount,
        status: 'PENDING',
        description,
        createdAt: new Date().toISOString(),
    };

    wallet.pendingBalance += amount;
    wallet.transactions.push(transaction);
    wallets.set(userId, wallet);

    return transaction;
}

/**
 * Release pending funds to available balance (after service completion)
 */
export function releaseFunds(userId: string, transactionId: string): boolean {
    const wallet = getWallet(userId);
    const txIndex = wallet.transactions.findIndex(t => t.id === transactionId);

    if (txIndex === -1) return false;

    const transaction = wallet.transactions[txIndex];
    if (transaction.status !== 'PENDING') return false;

    wallet.pendingBalance -= transaction.amount;
    wallet.balance += transaction.amount;
    wallet.transactions[txIndex] = { ...transaction, status: 'COMPLETED' };
    wallets.set(userId, wallet);

    return true;
}

/**
 * Process a payout request (transfer to bank account)
 */
export function requestPayout(userId: string, amount: number): WalletTransaction | null {
    const wallet = getWallet(userId);

    if (wallet.balance < amount) return null;

    const transaction: WalletTransaction = {
        id: `payout-${Date.now()}`,
        userId,
        type: 'PAYOUT',
        amount,
        status: 'PENDING',
        description: 'Transferência para conta bancária',
        createdAt: new Date().toISOString(),
    };

    wallet.balance -= amount;
    wallet.transactions.push(transaction);
    wallets.set(userId, wallet);

    // In production: trigger Stripe Connect payout
    // Simulate completion after 2-3 business days
    setTimeout(() => {
        const currentWallet = getWallet(userId);
        const idx = currentWallet.transactions.findIndex(t => t.id === transaction.id);
        if (idx !== -1) {
            currentWallet.transactions[idx].status = 'COMPLETED';
            wallets.set(userId, currentWallet);
        }
    }, 5000); // Simulate 5 seconds for demo

    return transaction;
}

/**
 * Process a refund
 */
export function processRefund(userId: string, amount: number, jobId: string): WalletTransaction {
    const wallet = getWallet(userId);

    const transaction: WalletTransaction = {
        id: `refund-${Date.now()}`,
        userId,
        jobId,
        type: 'DEBIT',
        amount,
        status: 'COMPLETED',
        description: 'Reembolso ao cliente',
        createdAt: new Date().toISOString(),
    };

    wallet.balance -= amount;
    wallet.transactions.push(transaction);
    wallets.set(userId, wallet);

    return transaction;
}

/**
 * Get transaction history with pagination
 */
export function getTransactionHistory(userId: string, page: number = 1, limit: number = 10): {
    transactions: WalletTransaction[];
    total: number;
    hasMore: boolean;
} {
    const wallet = getWallet(userId);
    const sorted = [...wallet.transactions].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const start = (page - 1) * limit;
    const transactions = sorted.slice(start, start + limit);

    return {
        transactions,
        total: wallet.transactions.length,
        hasMore: start + limit < wallet.transactions.length,
    };
}
