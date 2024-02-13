import MainPage from './components/MainPage'
import { ReservationProvider } from './provider/ReserveProvider'
import { apiLogout } from './api';
import './App.scss'

export default function App() {
    return (
        <ReservationProvider>
            <MainPage />
            <footer>
                <button onClick={apiLogout}>⏏️ LogOut</button>
                <a href='https://www.calendis.ro/cluj-napoca/baza-sportiva-la-terenuri-1/tenis-de-masa-1/s' target='_blank'>Rezervare<span> tenis-de-masa</span> www.calendis.ro </a>
            </footer>
        </ReservationProvider>
    );
}
