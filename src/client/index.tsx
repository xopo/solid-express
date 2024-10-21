/* @refresh reload */
import { render } from "solid-js/web";
import { Router, Route } from "@solidjs/router";
import BASE_URL from "./const";

import "./index.css";
import App from "./App";
import Login from "./components/login/Login";

const root = document.getElementById("root");

render(
    () => (
        <Router>
            <Route path={`${BASE_URL}login`} component={Login} />
            <Route path={BASE_URL} component={App} />
        </Router>
    ),
    root!,
);