"use client";
import {
  ConnectVariables,
  StarknetConfig,
  useAccount,
  useConnect,
  useDisconnect,
} from "@starknet-react/core";
import { UseMutateFunction } from "@tanstack/react-query";
import { createContext, useContext, useMemo } from "react";
import { mainnet } from "@starknet-react/chains";
import { RpcProvider } from "starknet";

export interface WalletContextType {
  account: `0x${string}` | undefined;
  isConnected: Boolean;
  connect: (args?: ConnectVariables) => void;
  disconnect: () => void;
  connectors: ConnectVariables["connector"][];
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletInternalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const isConnected = Boolean(address);

  const contextValue = useMemo(
    () => ({
      account: address,
      isConnected,
      connect,
      disconnect,
      connectors
    }),
    [address, isConnected, connect, disconnect, connectors]
  );
  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const provider = new RpcProvider({
    nodeUrl: "https://starknet-mainnet.public.blastapi.io",
  });

  return (
    <StarknetConfig provider={() => provider} chains={[mainnet]}>
        <WalletInternalProvider>
            {children}
        </WalletInternalProvider>
    </StarknetConfig>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context)
    throw new Error("useWallet must be used within a WalletProvider");
  return context;
};
