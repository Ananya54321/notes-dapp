'use client'
import React, { ReactNode, useMemo } from 'react'
import {
    WalletAdapterNetwork
} from '@solana/wallet-adapter-base';
import {
    ConnectionProvider,
    WalletProvider
} from '@solana/wallet-adapter-react';
import {
    WalletMultiButton,
    WalletModalProvider
} from '@solana/wallet-adapter-react-ui';
import {PhantomWalletAdapter} from '@solana/wallet-adapter-wallets';
// rpc endpoint
import {clusterApiUrl} from '@solana/web3.js';
import { Wallet } from '@project-serum/anchor';
import '@solana/wallet-adapter-react-ui/styles.css';


const WalletContextProvider = ({children} : {children : ReactNode} ) => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
  ], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>
          <div className="min-h-screen bg-gray-100">
            <header className='flex justify-between items-center p-4 bg-white shadow-md border-b border-gray-200'>
              <h1 className="text-2xl font-bold text-gray-800">Diary Dapp</h1>
            <WalletMultiButton />
            </header>
            <main className='p-5'>
              {children}
            </main>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default WalletContextProvider
