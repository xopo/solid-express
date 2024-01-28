import { createResource } from 'solid-js'
import './App.css'
import Count from './components/Count'
import Head from './components/Head'
import { effect } from 'solid-js/web'

const fetchHello = async () => (await fetch('/hello')).json()

function App() {
  const [hello] = createResource(fetchHello)
  console.log({hello: hello()})
  effect(() => {
    console.log(hello())
  })
  return (
    <>
      <Head />
      <h1>Vite + Solid</h1>
      <Count />
      <span>{hello.loading && "Loading..."}</span>
      <p> -- resource {hello()}</p>
      <p class="read-the-docs">
        Click on the Vite and Solid logos to learn more
      </p>
    </>
  )
}

export default App
