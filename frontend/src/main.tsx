import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "bootstrap/dist/css/bootstrap.min.css"
import './index.css'
import App from './components/App/App.tsx'
import "leaflet/dist/leaflet.css";


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

fetch("http://localhost:5000/")
  .then(response => response.text())
  .then(data => console.log(data));