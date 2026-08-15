import { useState } from 'react';
import { Wrench, Lock, User, Loader2 } from 'lucide-react';
import './Login.css';

interface LoginProps {
  onLoginSuccess: () => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simula um tempo de carregamento para efeito visual
    await new Promise(resolve => setTimeout(resolve, 800));

    // Validação Mockada
    if (username === 'gz' && password === '121314') {
      onLoginSuccess();
    } else {
      setError('Usuário ou senha incorretos.');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="login-logo-wrapper">
            <Wrench size={32} className="login-icon" />
          </div>
          <h2>GZ Centro Automotivo</h2>
          <p>Acesse o sistema de gestão</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="login-error">{error}</div>}

          <div className="login-input-group">
            <label htmlFor="username">Usuário</label>
            <div className="login-input-wrapper">
              <User size={18} className="login-input-icon" />
              <input 
                type="text" 
                id="username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="login-input-group">
            <label htmlFor="password">Senha</label>
            <div className="login-input-wrapper">
              <Lock size={18} className="login-input-icon" />
              <input 
                type="password" 
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={isLoading || !username || !password}>
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Entrar no Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}