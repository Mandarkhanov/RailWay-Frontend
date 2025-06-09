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

export default function LoginPage() {
  return (
    <AuthLayout title="Вход в RailWay">
      <Form>
        <FormGroup style={{ textAlign: 'left' }}>
          <Label htmlFor="email">Email</Label>
          <Input type="email" id="email" name="email" />
        </FormGroup>
        <FormGroup style={{ textAlign: 'left' }}>
          <Label htmlFor="password">Пароль</Label>
          <Input type="password" id="password" name="password" />
        </FormGroup>
        <SubmitButton type="submit">Войти</SubmitButton>
      </Form>
    </AuthLayout>
  );
}