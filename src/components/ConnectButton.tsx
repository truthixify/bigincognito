"use client";
import { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { Button } from "./ui/button";

const networks = [
  { name: "Mainnet", id: "mainnet", chainId: "SN_MAIN" },
  { name: "Sepolia Testnet", id: "sepolia", chainId: "SN_SEPOLIA" },
];

export default function ConnectButton() {
  const { account, connect, disconnect, isConnected, connectors } = useWallet();
  const [showOptions, setShowOptions] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(networks[0]);

  const shortAddress = (address: string) =>
    address.slice(0, 6) + "..." + address.slice(-4);

  const handleConnect = (connector: any) => {
    connect({
      connector,
    });
    setShowOptions(false);
  };

  if (isConnected && account) {
    return (
      <Button
        onClick={disconnect}
        className="bg-red-600 text-white px-4 py-2 rounded-xl shadow-md hover:bg-red-700 transition"
      >
        {shortAddress(account)}
      </Button>
    );
  }

  return (
    <div className="relative inline-block text-left">
      <Button
        onClick={() => setShowOptions((prev) => !prev)}
        className="bg-purple-600 text-white px-4 py-2 rounded-xl shadow-md hover:bg-purple-700 transition"
      >
        Connect Wallet
      </Button>

      {showOptions && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg border border-gray-200 z-50 p-2">
          {/* Select de red */}
          <select
            onChange={(e) =>
              setSelectedNetwork(networks.find((n) => n.id === e.target.value)!)
            }
            className="mb-3 p-2 border rounded w-full text-sm"
            value={selectedNetwork.id}
          >
            {networks.map((network) => (
              <option key={network.id} value={network.id}>
                {network.name}
              </option>
            ))}
          </select>

          {/* Lista de wallets */}
          {connectors.map((connector: any) => (
            <button
              key={connector.id}
              onClick={() => handleConnect(connector)}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded"
            >
              {connector.name || connector.id}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
