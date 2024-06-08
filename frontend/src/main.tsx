import React from 'react'
import ReactDOM from 'react-dom/client'
import HomePage from './pages/HomePage.tsx'
import './index.css'
import { GlobalContextProvider } from './GlobalContext.tsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import RoomPage from './pages/RoomPage.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GlobalContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/room/:roomId" element={<RoomPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </GlobalContextProvider>
  </React.StrictMode>,
)
