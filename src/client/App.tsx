import { Show, createResource } from 'solid-js'
import Head from './components/Head'
import { apiGetRoles } from './api'
import AddMedia from './components/media/AddMedia'
import MediaList from './components/content/MediaList';
import { Mp3Provider } from './context/appContext';
import './App.scss';




function App() {
  const [roles] = createResource(apiGetRoles)
  const isUser = () => (roles()?.data || []).includes('user')
  
  return (
    <Mp3Provider>
      <Head />
      <MediaList />
      
      <Show when={isUser()}>
          <AddMedia />
      </Show>
    </Mp3Provider>
  )
}

export default App;
