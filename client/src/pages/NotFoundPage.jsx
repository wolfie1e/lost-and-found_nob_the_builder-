import '../styles/globals.css';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
    return (
        <div className="container page-enter">
            <EmptyState
                icon="🧭"
                title="Page not found"
                description="The page you're looking for doesn't exist or was moved."
                action={<Link to="/"><Button>Go to Home</Button></Link>}
            />
        </div>
    );
}
