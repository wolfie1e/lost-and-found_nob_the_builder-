import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { login } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import styles from './AuthPage.module.css';

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { loginUser } = useAuth();
    const from = location.state?.from?.pathname || '/';

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

    const onSubmit = async (data) => {
        try {
            const res = await login(data);
            loginUser(res.data.token, res.data.user);
            toast.success(`Welcome back, ${res.data.user.name}!`);
            navigate(from, { replace: true });
        } catch (err) {
            toast.error(err.message || 'Invalid email or password.');
        }
    };

    return (
        <div className="container page-enter">
            <div className={styles.wrapper}>
                <div className={styles.header}>
                    <span className={styles.icon}>📦</span>
                    <h1 className={styles.title}>Welcome back</h1>
                    <p className={styles.subtitle}>Sign in to your account to report or claim items.</p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
                    <Input
                        id="email"
                        label="Email"
                        type="email"
                        required
                        placeholder="you@college.edu"
                        error={errors.email?.message}
                        {...register('email', {
                            required: 'Email is required',
                            pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email address' },
                        })}
                    />
                    <Input
                        id="password"
                        label="Password"
                        type="password"
                        required
                        placeholder="Your password"
                        error={errors.password?.message}
                        {...register('password', { required: 'Password is required' })}
                    />
                    <Button type="submit" size="lg" fullWidth loading={isSubmitting}>Sign In</Button>
                </form>
                <p className={styles.footer}>
                    Don't have an account? <Link to="/register" className={styles.link}>Sign up</Link>
                </p>
            </div>
        </div>
    );
}
