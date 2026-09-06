import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';

// se importan los estilos de PrimeReact, el tema Nano, PrimeIcons y PrimeFlex.
import 'primereact/resources/themes/nano/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './index.css';

import App from './App.jsx';

// se inicializa la configuración global del tema Nano para PrimeReact.
const configuracionPrimeReact = {
  ripple: true
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <PrimeReactProvider value={configuracionPrimeReact}>
      <BrowserRouter basename='/DespensaBot'>
        <App />
      </BrowserRouter>
    </PrimeReactProvider>
  </StrictMode>,
);
