import styled from 'styled-components';

const AuthContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background-color: #f0f2f5;
`;

const FormWrapper = styled.div`
  padding: 2rem 2.5rem;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Title = styled.h1`
    margin-bottom: 2rem;
    color: #333;
`;

export default function AuthLayout({ title, children }) {
  return (
    <AuthContainer>
      <FormWrapper>
        <Title>{title}</Title>
        {children}
      </FormWrapper>
    </AuthContainer>
  );
}