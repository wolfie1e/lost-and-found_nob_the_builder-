import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { register as registerUser } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import styles from './AuthPage.module.css';

export default function RegisterPage() {
    const navigate = useNavigate();
    const { loginUser } = useAuth();
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
    const pwd = watch('password');

    const onSubmit = async (data) => {
        try {
            const res = await registerUser({
                name: data.name,
                email: data.email,
                password: data.password,
            });
            loginUser(res.data.token, res.data.user);
            toast.success(`Account created! Welcome, ${res.data.user.name}!`);
            navigate('/');
        } catch (err) {
            toast.error(err.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="container page-enter">
            <div className={styles.wrapper}>
                <div className={styles.header}>
                    <span className={styles.icon}>🎓</span>
                    <h1 className={styles.title}>Create your account</h1>
                    <p className={styles.subtitle}>Join your campus Lost &amp; Found community.</p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
                    <Input
                        id="name"
                        label="Full Name"
                        required
                        placeholder="Your name"
                        error={errors.name?.message}
                        {...register('name', {
                            required: 'Name is required',
                            minLength: { value: 2, message: 'Name must be at least 2 characters' },
                        })}
                    />
                    <Input
                        id="email"
                        label="College Email"
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
                        placeholder="Minimum 8 characters"
                        hint="Must include uppercase and a number."
                        error={errors.password?.message}
                        {...register('password', {
                            required: 'Password is required',
                            minLength: { value: 8, message: 'Minimum 8 characters' },
                            pattern: {
                                value: /^(?=.*[A-Z])(?=.*[0-9])/,
                                message: 'Must contain uppercase and number',
                            },
                        })}
                    />
                    <Input
                        id="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        required
                        placeholder="Repeat your password"
                        error={errors.confirmPassword?.message}
                        {...register('confirmPassword', {
                            required: 'Please confirm your password',
                            validate: (v) => v === pwd || 'Passwords do not match',
                        })}
                    />
                    <Button type="submit" size="lg" fullWidth loading={isSubmitting}>Create Account</Button>
                </form>
                <p className={styles.footer}>
                    Already have an account? <Link to="/login" className={styles.link}>Sign in</Link>
                </p>
            </div>
        </div>
    );
}
