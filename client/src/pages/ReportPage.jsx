import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { createItem } from '../api/items';
import { CATEGORIES } from '../constants/categories';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import styles from './ReportPage.module.css';

export default function ReportPage() {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({ defaultValues: { type: 'lost', category: 'other' } });

    const selectedType = watch('type');

    const onSubmit = async (data) => {
        try {
            await createItem(data);
            toast.success('Item reported successfully!');
            navigate('/');
        } catch (err) {
            toast.error(err.message || 'Failed to submit. Please try again.');
        }
    };

    return (
        <div className="container page-enter">
            <div className={styles.wrapper}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Report an Item</h1>
                    <p className={styles.subtitle}>
                        Help reunite someone with their belongings — fill in as many details as possible.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
                    {/* Type Toggle */}
                    <div className={styles.typeSection}>
                        <p className={styles.fieldLabel}>Item Type <span className={styles.req}>*</span></p>
                        <div className={styles.typeToggle} role="group" aria-label="Select item type">
                            {['lost', 'found'].map((t) => (
                                <label key={t} className={[styles.typeOption, selectedType === t ? styles.typeSelected : ''].join(' ')}>
                                    <input
                                        type="radio"
                                        value={t}
                                        {...register('type', { required: true })}
                                        className={styles.radioHidden}
                                    />
                                    <span className={styles.typeIcon}>{t === 'lost' ? '❌' : '✅'}</span>
                                    <span className={styles.typeLabel}>{t === 'lost' ? "I Lost Something" : "I Found Something"}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <Input
                        id="title"
                        label="Item Title"
                        required
                        placeholder="e.g. Blue Backpack, iPhone 14, Student ID Card"
                        error={errors.title?.message}
                        {...register('title', {
                            required: 'Title is required',
                            minLength: { value: 2, message: 'Minimum 2 characters' },
                            maxLength: { value: 100, message: 'Maximum 100 characters' },
                        })}
                    />

                    {/* Category */}
                    <div className={styles.fieldGroup}>
                        <label htmlFor="category" className={styles.fieldLabel}>
                            Category
                        </label>
                        <select
                            id="category"
                            className={styles.select}
                            {...register('category')}
                            defaultValue="other"
                        >
                            {CATEGORIES.map(({ value, label, icon }) => (
                                <option key={value} value={value}>{icon} {label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div className={styles.fieldGroup}>
                        <label htmlFor="description" className={styles.fieldLabel}>Description</label>
                        <textarea
                            id="description"
                            className={styles.textarea}
                            placeholder="Describe the item in detail — color, brand, distinguishing marks, what was inside…"
                            rows={4}
                            {...register('description', {
                                maxLength: { value: 1000, message: 'Maximum 1000 characters' },
                            })}
                        />
                        {errors.description && (
                            <p className={styles.errorMsg} role="alert">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Location */}
                    <Input
                        id="location"
                        label="Location"
                        required
                        placeholder="e.g. Library 2nd Floor, Main Cafeteria, Block C Parking Lot"
                        error={errors.location?.message}
                        {...register('location', {
                            required: 'Location is required',
                            minLength: { value: 2, message: 'Minimum 2 characters' },
                            maxLength: { value: 200, message: 'Maximum 200 characters' },
                        })}
                    />

                    {/* Contact */}
                    <Input
                        id="contact"
                        label="Contact"
                        required
                        placeholder="Your email or phone number"
                        hint="Your contact details will only be visible to logged-in users."
                        error={errors.contact?.message}
                        {...register('contact', {
                            required: 'Contact is required',
                            minLength: { value: 5, message: 'Minimum 5 characters' },
                            maxLength: { value: 150, message: 'Maximum 150 characters' },
                        })}
                    />

                    {/* Actions */}
                    <div className={styles.formActions}>
                        <Button type="submit" size="lg" fullWidth loading={isSubmitting} variant="primary">
                            Submit Report
                        </Button>
                        <Button
                            type="button"
                            size="lg"
                            fullWidth
                            variant="ghost"
                            onClick={() => navigate(-1)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
