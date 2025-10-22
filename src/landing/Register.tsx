import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Index from './Index';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref');

  useEffect(() => {
    // Сохраняем реферальный код в localStorage
    if (refCode) {
      localStorage.setItem('referral_code', refCode);
    }

    // Перенаправляем на главную с параметром для открытия модалки регистрации
    const timer = setTimeout(() => {
      navigate(`/?register=true${refCode ? `&ref=${refCode}` : ''}`, { replace: true });
    }, 100);

    return () => clearTimeout(timer);
  }, [refCode, navigate]);

  // Показываем главную страницу пока происходит редирект
  return <Index />;
};

export default Register;
