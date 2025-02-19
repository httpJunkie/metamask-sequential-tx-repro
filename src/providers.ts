declare global {
  interface WindowEventMap {
    "eip6963:announceProvider": CustomEvent
  }
}

// Declare selectedProvider at the top level
let selectedProvider: EIP1193Provider | null = null;

// Connect to the selected provider using eth_requestAccounts.
const connectWithProvider = async (
  wallet: EIP6963AnnounceProviderEvent["detail"]
) => {
  try {
    await wallet.provider.request({ method: "eth_requestAccounts" })
    selectedProvider = wallet.provider;
    
    // Show transaction buttons after connection
    const txButtons = document.getElementById('transactionButtons');
    if (txButtons) txButtons.style.display = 'block';
    
    // Add click handler for sequential transactions
    const sendButton = document.getElementById('sendSequentialTx');
    if (sendButton) {
      sendButton.onclick = sendSequentialTransactions;
    }
  } catch (error) {
    console.error("Failed to connect to provider:", error)
  }
}

async function sendSequentialTransactions() {
  if (!selectedProvider) {
    console.error('No provider selected');
    return;
  }

  const statusDiv = document.getElementById('status');
  if (statusDiv) statusDiv.innerHTML = 'Sending transactions...';

  try {
    const accounts = await selectedProvider.request({ 
      method: 'eth_accounts' 
    }) as string[];

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }

    // Create transaction template
    const createTx = () => ({
      from: accounts[0],
      to: accounts[0],
      value: '0x0',
      gas: '0x5208', // 21000
      maxFeePerGas: '0x2540BE400', // 10 GWEI
      maxPriorityFeePerGas: '0x3B9ACA00' // 1 GWEI
    });

    // Send first transaction
    const tx1Hash = await selectedProvider.request({
      method: 'eth_sendTransaction',
      params: [createTx()]
    }) as string;

    if (statusDiv) statusDiv.innerHTML += `<br>First transaction sent: ${tx1Hash}`;

    // Wait for 1 block confirmation
    await selectedProvider.request({
      method: 'eth_getTransactionReceipt',
      params: [tx1Hash]
    });

    // Immediately send second transaction
    const tx2Hash = await selectedProvider.request({
      method: 'eth_sendTransaction',
      params: [createTx()]
    }) as string;

    if (statusDiv) statusDiv.innerHTML += `<br>Second transaction sent: ${tx2Hash}`;

  } catch (error: unknown) {
    console.error('Transaction error:', error);
    if (statusDiv) {
      if (error instanceof Error) {
        statusDiv.innerHTML += `<br>Error: ${error.message}`;
      } else {
        statusDiv.innerHTML += `<br>Error: ${String(error)}`;
      }
    }
  }
}

// Display detected providers as connect buttons.
export function listProviders(element: HTMLDivElement) {
  window.addEventListener(
    "eip6963:announceProvider",
    (event: EIP6963AnnounceProviderEvent) => {
      const button = document.createElement("button")

      button.innerHTML = `
        <img src="${event.detail.info.icon}" alt="${event.detail.info.name}" />
        <div>${event.detail.info.name}</div>
      `

      // Call connectWithProvider when a user selects the button.
      button.onclick = () => connectWithProvider(event.detail)
      element.appendChild(button)
    }
  )

  // Notify event listeners and other parts of the dapp that a provider is requested.
  window.dispatchEvent(new Event("eip6963:requestProvider"))
}