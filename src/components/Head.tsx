import solidLogo from '../assets/solid.svg'

export default function Head() {
    return (
        <div>
            <a href="https://vitejs.dev" target="_blank">
                <img src='/vite.svg' class="logo" alt="Vite logo" />
            </a>
            <a href="https://solidjs.com" target="_blank">
                <img src={solidLogo} class="logo solid" alt="Solid logo" />
            </a>
        </div>
    );
}