import { useTheme } from '@/lib/ThemeContext';

export default function ThemeLogo({ className = '', alt = 'Bondify' }) {
  const { theme } = useTheme();
  const src = theme === 'light' ? '/logo-light.png' : '/logo.png';
  return <img src={src} alt={alt} className={className} onError={(e) => { e.target.src = '/logo.png'; }} />;
}
