import AgentBuilder from './pages/AgentBuilder';
import Agents from './pages/Agents';
import Analytics from './pages/Analytics';
import Billing from './pages/Billing';
import Channels from './pages/Channels';
import Conversations from './pages/Conversations';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AgentBuilder": AgentBuilder,
    "Agents": Agents,
    "Analytics": Analytics,
    "Billing": Billing,
    "Channels": Channels,
    "Conversations": Conversations,
    "Dashboard": Dashboard,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "AgentBuilder",
    Pages: PAGES,
    Layout: __Layout,
};