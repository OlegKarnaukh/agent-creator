import AgentBuilder from './pages/AgentBuilder';
import Dashboard from './pages/Dashboard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AgentBuilder": AgentBuilder,
    "Dashboard": Dashboard,
}

export const pagesConfig = {
    mainPage: "AgentBuilder",
    Pages: PAGES,
    Layout: __Layout,
};