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
    navigate(`/?register=true${refCode ? `&ref=${refCode}` : ''}`, { replace: true });
  }, [refCode, navigate]);

  // Показываем главную страницу
  return <Index />;
};

export default Register;
