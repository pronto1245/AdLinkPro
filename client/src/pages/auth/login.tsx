import { login } from '@/lib/auth';

const LoginPage = () => {
  login();

  return <div>Login Page</div>;
};

export default LoginPage;