import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import '@fontsource/bebas-neue/400.css';
import '@fontsource/barlow-condensed/300.css';
import '@fontsource/barlow-condensed/400.css';
import '@fontsource/barlow-condensed/600.css';
import '@fontsource/barlow-condensed/700.css';
import '@fontsource/barlow/300.css';
import '@fontsource/barlow/400.css';
import '@fontsource/barlow/500.css';

import './styles/globals.css';
import { App } from './App';
import { ThemeProvider } from './lib/theme';
import { SidebarProvider } from './lib/sidebar';
import { AuthProvider } from './lib/auth';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('No #root element en index.html');

createRoot(rootEl).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <SidebarProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </SidebarProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
