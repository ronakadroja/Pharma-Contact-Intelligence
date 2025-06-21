import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { LogIn, Mail, Lock } from 'lucide-react';
import { Button, Card, Input } from '../components/ui/design-system';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAppContext();
    const { success, error: showError } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const loginSuccess = await login(username, password);
            if (loginSuccess) {
                success('Successfully logged in!', {
                    title: 'Welcome',
                    actions: [
                        {
                            label: 'Go to Dashboard',
                            onClick: () => navigate('/dashboard'),
                            variant: 'primary'
                        }
                    ]
                });
                // Redirect based on role - this will be handled by the protected route
                navigate('/dashboard');
            } else {
                error('Invalid email or password. Please check your credentials and try again.', {
                    title: 'Login Failed',
                    persistent: true,
                    actions: [
                        {
                            label: 'Try Again',
                            onClick: () => {
                                setUsername('');
                                setPassword('');
                            },
                            variant: 'primary'
                        }
                    ]
                });
            }
        } catch (err) {
            error(err instanceof Error ? err.message : 'An error occurred during login', {
                title: 'Login Error',
                persistent: true,
                actions: [
                    {
                        label: 'Retry',
                        onClick: () => {
                            setUsername('');
                            setPassword('');
                        },
                        variant: 'primary'
                    }
                ]
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-md">
                <Card variant="elevated" padding="none" className="overflow-hidden animate-fade-in">
                    {/* Logo/Icon and Header */}
                    <div className="px-8 pt-8 pb-6 text-center border-b border-neutral-100">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-glow transform hover:scale-105 transition-transform">
                            <span className="text-4xl font-bold text-white">P</span>
                        </div>
                        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Pharma Contact Intelligence</h1>
                        <p className="text-neutral-600">Sign in to access your dashboard</p>
                    </div>

                    {/* Login Form */}
                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Input
                                id="email"
                                type="email"
                                label="Email Address"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your email"
                                leftIcon={<Mail size={18} />}
                                required
                            />

                            <Input
                                id="password"
                                type="password"
                                label="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                leftIcon={<Lock size={18} />}
                                required
                            />

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700">
                                        Remember me
                                    </label>
                                </div>
                                <div className="text-sm">
                                    <a href="#" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                                        Forgot password?
                                    </a>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                loading={isLoading}
                                icon={!isLoading ? <LogIn size={20} /> : undefined}
                                className="w-full"
                            >
                                {isLoading ? 'Signing in...' : 'Sign in'}
                            </Button>
                        </form>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;
