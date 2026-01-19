import AgentBuilder from './pages/AgentBuilder';
import Agents from './pages/Agents';
import Analytics from './pages/Analytics';
import Billing from './pages/Billing';
import Channels from './pages/Channels';
import Conversations from './pages/Conversations';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import Settings from './pages/Settings';
import Referrals from './pages/Referrals';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AgentBuilder": AgentBuilder,
    "Agents": Agents,
    "Analytics": Analytics,
    "Billing": Billing,
    "Channels": Channels,
    "Conversations": Conversations,
    "Dashboard": Dashboard,
    "Landing": Landing,
    "Settings": Settings,
    "Referrals": Referrals,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};