import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../layouts/AuthLayout';
import { Form, FormGroup, Label, Input } from '../forms/formStyles';
import styled from 'styled-components';

const SubmitButton = styled.button`
  width: 100%;
  padding: 12px;
  margin-top: 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1em;
  cursor: pointer;
  &:hover { background-color: #2980b9; }
`;

const ErrorMessage = styled.p`
  color: #e74c3c;
  margin-top: 1rem;
`;

const SwitchLink = styled.div`
  margin-top: 1.5rem;
  font-size: 0.9em;
  color: #555;
  
  a {
    color: #3498db;
    text-decoration: none;
    font-weight: 600;
    &:hover { text-decoration: underline; }
  }
`;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login({ email, password });
      // Навигация произойдет внутри функции login в AuthContext
    } catch (err) {
      setError('Неверный email или пароль. Попробуйте снова.');
    }
  };

  return (
    <AuthLayout title="Вход в RailWay">
      <Form onSubmit={handleSubmit}>
        <FormGroup style={{ textAlign: 'left' }}>
          <Label htmlFor="email">Email</Label>
          <Input 
            type="email" 
            id="email" 
            name="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </FormGroup>
        <FormGroup style={{ textAlign: 'left' }}>
          <Label htmlFor="password">Пароль</Label>
          <Input 
            type="password" 
            id="password" 
            name="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </FormGroup>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <SubmitButton type="submit">Войти</SubmitButton>
      </Form>
       <SwitchLink>
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </SwitchLink>
    </AuthLayout>
  );
}