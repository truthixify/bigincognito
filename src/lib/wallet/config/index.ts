import { cookieStorage, createStorage } from "@wagmi/core";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { polygon, polygonAmoy } from "@reown/appkit/networks";

// Get projectId from https://cloud.reown.com
export const projectId = process.env.wkProjectID;

if (!projectId) {
  throw new Error("Project ID is not defined");
}

export const networks = [polygon, polygonAmoy];

export const contractAddress = "0x34Da66269431a3DaDE50DA17F88F4b8F1F2Ed771";

export const metadata = {
  name: "Big Inc",
  description: "An artist onchain.",
  url: "https://www.bigcognito.com",
  icons: ["https://www.bigincognito.com/assets/img/big_inc_icon.png"],
};

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;
