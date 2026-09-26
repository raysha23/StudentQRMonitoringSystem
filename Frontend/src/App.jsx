// File path: Frontend\src\App.jsx
import React, { useEffect, useState } from "react";
import Layout from "./layout/layout";
import Login from "./login";
import { getCurrentUser, logout as apiLogout } from "./api/auth-api";
import { routes } from "./routes/routes";

export default function App() {
    const [user, setUser] = useState(null);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [activeTab, setActiveTab] = useState(routes[0].id);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setCheckingAuth(false);
            return;
        }
        getCurrentUser()
            .then((data) => setUser(data))
            .catch(() => localStorage.removeItem("token"))
            .finally(() => setCheckingAuth(false));
    }, []);

    const handleLogout = async () => {
        try {
            await apiLogout();
        } catch {
            // ignore network errors on logout
        } finally {
            localStorage.removeItem("token");
            setUser(null);
        }
    };

    if (checkingAuth) return null;

    if (!user) {
        return <Login onLoginSuccess={setUser} />;
    }

    const ActiveComponent = routes.find((r) => r.id === activeTab)?.component;

    return (
        <Layout
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            user={user}
            onLogout={handleLogout}
        >
            {ActiveComponent && <ActiveComponent />}
        </Layout>
    );
}
