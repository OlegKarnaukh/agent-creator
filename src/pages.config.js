import Dashboard from './pages/Dashboard';
import AgentBuilder from './pages/AgentBuilder';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "AgentBuilder": AgentBuilder,
}

export const pagesConfig = {
    mainPage: "AgentBuilder",
    Pages: PAGES,
    Layout: __Layout,
};