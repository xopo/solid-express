let BASE_URL: string;

try {
    BASE_URL = process.env.NODE_ENV === "production" ? "/solid-mp3/" : "/";
} catch {
    BASE_URL = "/";
}
export default BASE_URL;
