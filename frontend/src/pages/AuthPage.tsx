import { AuthForm } from "@/components/AuthForm";

interface AuthPageProps {
  onLogin: (username: string, password: string) => void;
  onRegister: (username: string, password: string) => void;
}

export function AuthPage({ onLogin, onRegister }: AuthPageProps) {
  return <AuthForm onLogin={onLogin} onRegister={onRegister} />;
}
