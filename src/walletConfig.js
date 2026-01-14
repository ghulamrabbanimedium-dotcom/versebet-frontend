import { createAppKit } from '@reown/appkit';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { polygon } from '@reown/appkit/networks';

let modal = null;
let isInitializing = false;
let initPromise = null;

const metadata = {
  name: 'VerseBet',
  description: 'Elite Crypto Casino on Polygon',
  url: window.location.origin,
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const themeVariables = {
  '--w3m-accent': '#00f2ff',
  '--w3m-color-mix': '#8b5cf6',
  '--w3m-color-mix-strength': 20,
  '--w3m-border-radius-master': '2px',
  '--w3m-font-family': 'Orbitron, Inter, sans-serif',
  '--w3m-z-index': 99999
};

async function initModal() {
  if (modal) {
    console.log("AppKit already initialized, returning existing modal");
    return modal;
  }
  
  if (isInitializing && initPromise) {
    console.log("AppKit initialization in progress, waiting...");
    return initPromise;
  }
  
  isInitializing = true;
  
  initPromise = (async () => {
    try {
      let projectId = '5d831ec9e37d9aca512a614cebc15bb8';
      
      try {
        const response = await fetch('/api/config');
        if (response.ok) {
          const config = await response.json();
          if (config.reownProjectId) {
            projectId = config.reownProjectId;
          }
        }
      } catch (fetchError) {
        console.warn("Could not fetch config, using default project ID");
      }
      
      console.log("Initializing AppKit with Project ID:", projectId);
      
      modal = createAppKit({
        adapters: [new EthersAdapter()],
        networks: [polygon],
        defaultNetwork: polygon,
        metadata,
        projectId,
        allowUnsupportedChain: true,
        themeMode: 'dark',
        themeVariables,
        enableWalletConnect: true,
        enableInjected: true,
        features: {
          analytics: true,
          email: false,
          socials: false,
          onramp: false,
          swaps: false
        }
      });
      
      console.log("AppKit modal created successfully");
      return modal;
    } catch (e) {
      console.error('Failed to initialize AppKit:', e);
      isInitializing = false;
      initPromise = null;
      return null;
    }
  })();
  
  return initPromise;
}

function getModal() {
  return modal;
}

export { initModal, getModal, polygon };
