import "./style.css"
import { listProviders } from "./providers.ts"

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <div id="providerButtons"></div>
    <div id="transactionButtons" style="margin-top: 20px; display: none">
      <button id="sendSequentialTx">Send Sequential Transactions</button>
      <div id="status"></div>
    </div>
  </div>
`

listProviders(document.querySelector<HTMLDivElement>("#providerButtons")!)