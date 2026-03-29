#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol, log};

#[contracttype]
#[derive(Clone)]
pub struct VaultStats {
    pub total_amount: i128, // Count of Total savings in the vault
    pub user_count: u64,    // Count of Total users in the vault
}

#[contract]
pub struct SavingsVault;

// Symbol for vault statistics
const VAULT_STATS: Symbol = symbol_short!("V_STATS");

#[contractimpl]
impl SavingsVault {
    // This function deposits funds into the vault for the authenticated user and returns the new balance.
    pub fn deposit(env: Env, user: Address, amount: i128) -> i128 {
        user.require_auth();
        if amount <= 0 {
            panic!("Deposit amount must be positive");
        }

        // Update user balance in persistent storage
        let mut balance: i128 = env.storage().persistent().get(&user).unwrap_or(0);
        
        let mut stats: VaultStats = env.storage().instance().get(&VAULT_STATS).unwrap_or(VaultStats {
            total_amount: 0,
            user_count: 0,
        });

        // If this is the user's first deposit, increment the user count
        if balance == 0 {
            stats.user_count += 1;
        }

        balance += amount;
        stats.total_amount += amount;

        // Save updated data
        env.storage().persistent().set(&user, &balance);
        env.storage().instance().set(&VAULT_STATS, &stats);

        log!(&env, "User: {} successfully deposited: {}", user, amount);
        balance
    }

    // This function withdraws funds from the vault for the authenticated user and returns the new balance.
    pub fn withdraw(env: Env, user: Address, amount: i128) -> i128 {
        user.require_auth();
        let mut balance: i128 = env.storage().persistent().get(&user).unwrap_or(0);

        if amount > balance {
            panic!("Insufficient balance for withdrawal");
        }

        balance -= amount;
        
        let mut stats: VaultStats = env.storage().instance().get(&VAULT_STATS).unwrap_or(VaultStats {
            total_amount: 0,
            user_count: 0,
        });

        stats.total_amount -= amount;
        // If the balance becomes zero, decrement the user count
        if balance == 0 {
            stats.user_count -= 1;
        }

        // Save updated data
        env.storage().persistent().set(&user, &balance);
        env.storage().instance().set(&VAULT_STATS, &stats);

        log!(&env, "User: {} successfully withdrew: {}", user, amount);
        balance
    }

    // This function allows a user to check their current balance in the vault.
    pub fn get_balance(env: Env, user: Address) -> i128 {
        env.storage().persistent().get(&user).unwrap_or(0)
    }

    // This function returns the overall statistics of the Savings Vault.
    pub fn view_vault_stats(env: Env) -> VaultStats {
        env.storage().instance().get(&VAULT_STATS).unwrap_or(VaultStats {
            total_amount: 0,
            user_count: 0,
        })
    }
}
