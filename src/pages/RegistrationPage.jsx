import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../layouts/AuthLayout';
import { Form, FormGroup, Label, Input } from '../forms/formStyles';
import styled from 'styled-components';

const SubmitButton = styled.button`
  width: 100%;
  padding: 12px;
  margin-top: 1rem;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1em;
  cursor: pointer;
  &:hover { background-color: #27ae60; }
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

export default function RegistrationPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      if (password.length < 3) {
          setError('Пароль должен быть длиннее 3 символов.');
          return;
      }
      try {
        await register({ name, email, password });
      } catch (err) {
        setError('Не удалось зарегистрироваться. Возможно, email уже используется.');
      }
    };

  return (
    <AuthLayout title="Регистрация">
        <Form onSubmit={handleSubmit}>
            <FormGroup style={{ textAlign: 'left' }}>
            <Label htmlFor="name">Имя</Label>
            <Input 
                type="text" 
                id="name" 
                name="name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            </FormGroup>
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
            <SubmitButton type="submit">Зарегистрироваться</SubmitButton>
        </Form>
        <SwitchLink>
            Уже есть аккаунт? <Link to="/login">Войти</Link>
        </SwitchLink>
    </AuthLayout>
  );
}