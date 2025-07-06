import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import LoginPage from './components/LoginPage.jsx'
import './index.css'
import { ThemeProvider } from "@/components/theme-provider"

function Root() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(() => Boolean(localStorage.getItem('GEMINI_API_KEY')));
  const handleLogin = () => setIsLoggedIn(true);
  return isLoggedIn ? <App /> : <LoginPage onLogin={handleLogin} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Root />
    </ThemeProvider>
  </React.StrictMode>,
)
