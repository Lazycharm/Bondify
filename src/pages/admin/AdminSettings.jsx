import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function AdminSettings() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/admin/config', { replace: true }); }, []);
  return null;
}
