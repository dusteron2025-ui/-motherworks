// Simple in-memory OTP store
// In production, use Redis, database, or Supabase

interface OTPData {
    code: string;
    expiresAt: number;
    attempts: number;
}

class OTPStore {
    private store = new Map<string, OTPData>();
    private readonly maxAttempts = 5;
    private readonly expirationMs = 10 * 60 * 1000; // 10 minutes

    // Generate and store OTP
    generate(phone: string): string {
        // Clean up expired codes
        this.cleanup();

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        this.store.set(phone, {
            code,
            expiresAt: Date.now() + this.expirationMs,
            attempts: 0
        });

        return code;
    }

    // Verify OTP
    verify(phone: string, code: string): { success: boolean; error?: string } {
        const data = this.store.get(phone);

        if (!data) {
            return { success: false, error: 'Código não encontrado ou expirado. Solicite um novo.' };
        }

        // Check expiration
        if (data.expiresAt < Date.now()) {
            this.store.delete(phone);
            return { success: false, error: 'Código expirado. Solicite um novo.' };
        }

        // Check attempts
        if (data.attempts >= this.maxAttempts) {
            this.store.delete(phone);
            return { success: false, error: 'Muitas tentativas incorretas. Solicite um novo código.' };
        }

        // Verify code
        if (data.code !== code) {
            data.attempts++;
            return { success: false, error: `Código incorreto. ${this.maxAttempts - data.attempts} tentativas restantes.` };
        }

        // Success - remove from store
        this.store.delete(phone);
        return { success: true };
    }

    // Check if OTP exists for phone
    exists(phone: string): boolean {
        const data = this.store.get(phone);
        if (!data) return false;
        if (data.expiresAt < Date.now()) {
            this.store.delete(phone);
            return false;
        }
        return true;
    }

    // Get remaining time in seconds
    getRemainingTime(phone: string): number {
        const data = this.store.get(phone);
        if (!data) return 0;
        const remaining = Math.ceil((data.expiresAt - Date.now()) / 1000);
        return remaining > 0 ? remaining : 0;
    }

    // Cleanup expired codes
    private cleanup(): void {
        const now = Date.now();
        for (const [phone, data] of this.store.entries()) {
            if (data.expiresAt < now) {
                this.store.delete(phone);
            }
        }
    }
}

// Export singleton instance
export const otpStore = new OTPStore();
