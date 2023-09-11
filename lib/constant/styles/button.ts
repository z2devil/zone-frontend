import styled, { css } from 'styled-components';
import values from './values';

const buttonStyles = css`
  outline: none;
  border: none;
  border-radius: 999px;
  padding: 8px 24px;
  font-size: 14px;
  background-color: ${values['card-background-color']};
  color: ${values['text-color-major']};
  cursor: pointer;
  transition: all 0.08s;
  &:hover {
    background-color: ${values['highlight']};
    color: ${values['card-background-color']};
  }
`;

const Button = styled.button`
  ${buttonStyles}
`;

export { buttonStyles, Button };
