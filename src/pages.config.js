import AgentBuilder from './pages/AgentBuilder';
import Dashboard from './pages/Dashboard';
import Conversations from './pages/Conversations';
import Billing from './pages/Billing';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AgentBuilder": AgentBuilder,
    "Dashboard": Dashboard,
    "Conversations": Conversations,
    "Billing": Billing,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "AgentBuilder",
    Pages: PAGES,
    Layout: __Layout,
};