import { Show, createResource } from 'solid-js'
import './App.css'
import Count from './components/Count'
import Head from './components/Head'
import Button from './components/Button'
import { apiGetRoles } from './api'
import { effect } from 'solid-js/web'
import AddMedia from './components/media/AddMedia'

const fetchContent = async () => (await fetch('/api/content')).json();
// const fetchRoles = async () => (await fetch('/api/content/roles')).json();

function App() {
  const [content] = createResource(fetchContent)
  const [roles] = createResource(apiGetRoles)
  const isUser = () => (roles()?.data || []).includes('user')
  effect(() => console.log(roles()))
  return (
    <>
      <Show
          when={!content.loading}
          fallback={<div>Loading....</div>}
      >
        {JSON.stringify(content)}
      </Show>
      <Head />
      <h1>Vite + Solid</h1>
      <Count />
      {/* <span>{hello.loading && "Loading..."}</span>
      <p> -- resource {hello()}</p> */}
      <Button />
      <p class="read-the-docs">
        Click on the Vite and Solid logos to learn more
      </p>
      <Show when={isUser()}>
          <AddMedia />
      </Show>
    </>
  )
}

export default App;
