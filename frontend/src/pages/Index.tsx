import { useState } from "react";
import { AuthPage } from "./AuthPage";
import { PlaylistsPage } from "./PlaylistsPage";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");

  const handleLogin = (user: string, _password: string) => {
    // Placeholder for actual login logic - connect your endpoint here
    setUsername(user);
    setIsAuthenticated(true);
  };

  const handleRegister = (user: string, _password: string) => {
    // Placeholder for actual register logic - connect your endpoint here
    setUsername(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername("");
  };

  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return <PlaylistsPage username={username} onLogout={handleLogout} />;
};

export default Index;
