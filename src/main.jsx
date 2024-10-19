import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import AppContextProvider from './Context/AppContext.jsx'

// Use Vite's import.meta.env instead of process.env
const basename = import.meta.env.PROD 
  ? '/Chat-Application' 
  : '/'

createRoot(document.getElementById('root')).render(
  <BrowserRouter basename={basename}>
    <AppContextProvider>
      <App />
    </AppContextProvider>
  </BrowserRouter>,
)