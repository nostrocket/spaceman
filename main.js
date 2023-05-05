import './style.css'
import renderIdentities from './src/identity/identity.js'

import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import {newsubrocket} from "./src/subrockets/newrocket.js";
//import { setupCounter } from './counter.js'

// document.querySelector('#app').innerHTML = `
//   <div>
//     <a href="https://vitejs.dev" target="_blank">
//       <img src="${viteLogo}" class="logo" alt="Vite logo" />
//     </a>
//     <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
//       <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
//     </a>
//     <h1>Hello Vite!</h1>
//     <div class="card">
//       <button id="counter" type="button"></button>
//     </div>
//     <p class="read-the-docs">
//       Click on the Vite logo to learn more
//     </p>
//   </div>
// `
window.missioncontrol = {}
window.missioncontrol.renderIdentity = renderIdentities
window.missioncontrol.newSubrocket = newsubrocket

window.missioncontrol.rootevents = {}
window.missioncontrol.rootevents.IdentityRoot = "0a73208becd0b1a9d294e6caef14352047ab44b848930e6979937fe09effaf71"
window.missioncontrol.rootevents.SharesRoot = "7fd9810bdb8bc635633cc4e3d0888e395420aedc7d28778c100793d1d3bc09a6"
window.missioncontrol.rootevents.SubrocketsRoot = "c7f87218e62f6d41fa2f5b2480210ed1d48b2609e03e9b4b500a3b64e3c08554"
window.missioncontrol.rootevents.IgnitionEvent = "fd459ea06157e30cfb87f7062ee3014bc143ecda072dd92ee6ea4315a6d2df1c"
window.missioncontrol.rootevents.ReplayRoot = "24c30ad7f036ed49379b5d1209836d1ff6795adb34da2d3e4cabc47dc9dfef21"