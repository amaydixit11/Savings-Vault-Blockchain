# Savings Vault - Smart Contract

![Savings Vault Mascot](savings_vault_mascot.png)
<img width="1394" height="1035" alt="image" src="https://github.com/user-attachments/assets/3de3e3ac-1033-4162-8d1a-b440af3786cb" />

## Project Title
**Savings Vault**

## About Me
- **Name**: Amay Dixit
- **Role**: Blockchain Developer & Web3 Enthusiast
- **Expertise**: Stellar, Soroban, Rust, TypeScript, React
- **Interest**: Building decentralized financial tools that are accessible and secure for everyone.
- **Goal**: To leverage blockchain technology to simplify savings and empower financial independence.

## Project Description
Savings Vault is a decentralized smart contract built on the Stellar network using Soroban. It provides a secure and transparent way for users to save their digital assets. Users can deposit funds into their personal "vault", track their savings over time, and withdraw them whenever needed. The contract maintains a global count of users and total funds saved, ensuring a clear overview of the ecosystem's growth.

## Vision Statement
The vision of Savings Vault is to empower individuals worldwide with an accessible, permissionless, and reliable savings tool. By leveraging the Stellar network's speed and low costs, Savings Vault aims to bridge the gap between traditional finance and decentralized technology, fostering a culture of financial responsibility and security in the digital age. This project can create a big impact by providing a trustworthy alternative to traditional banking for the unbanked and underbanked populations.

## Software Development Plan
1.  **Contract Core Logic**: Develop the smart contract using `soroban-sdk` in Rust, implementing fundamental functions: `deposit`, `withdraw`, `get_balance`, and `view_vault_stats`.
2.  **Data Storage**: Implement persistent storage for individual user balances and instance storage for global vault metadata like total deposits and user count.
3.  **Front-end Development**: Build a modern, responsive user interface using React and TypeScript to provide a seamless user experience.
4.  **Stellar Integration**: Integrate the Freighter wallet and Stellar SDK to enable secure transaction signing and real-time ledger interactions.
5.  **Deployment**: Deploy the smart contract to the Stellar network and launch the web application for public use.

## Contract Deployment Details
- **Contract ID** : CC7SHEPLV3XK7YTGITY2RGZ4EBTIRRMSSWAPPV6UTZE4BRSBAVRWN2AS
- **Contract Screenshot** : <img width="1609" height="1032" alt="image" src="https://github.com/user-attachments/assets/75a44eae-5a17-43fe-bb2e-071863265e3a" />

## Personal Story Summary
I'm Amay Dixit, a blockchain enthusiast who believes in financial freedom through technology. Watching how traditional saving systems can be slow and opaque inspired me to build Savings Vault. By combining my passion for Rust and the Stellar network, I aim to create tools that make decentralized finance accessible to everyone, helping them secure their financial future one transaction at a time.

## Installation Guide
To get Savings Vault running locally, follow these steps:

### 1. Clone the Repository
```bash
git clone https://github.com/amaydixit11/Savings-Vault-Blockchain.git
cd Savings-Vault-Blockchain
```

### 2. Install Prerequisites
- **Rust**: [Install Rust](https://www.rust-lang.org/tools/install)
- **Stellar CLI**: `cargo install --locked stellar-cli`
- **Node.js**: [Download Node.js](https://nodejs.org/)

### 3. Build the Contract
Navigate to the contract directory and build:
```bash
cd contract
stellar contract build
```

### 4. Install Front-end Dependencies
Navigate to the client directory and install dependencies:
```bash
cd ../client
npm install
```

### 5. Run the Application
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
