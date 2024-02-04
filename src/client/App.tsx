import MainPage from './components/MainPage'
import { ReservationProvider } from './provider/ReserveProvider'
import './App.css'

export default function App() {
  return (
    <ReservationProvider>
      <MainPage />
    </ReservationProvider>
  )
}
