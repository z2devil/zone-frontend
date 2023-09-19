export enum FormRules {
  EMAIL,
}

export const formRules = {
  [FormRules.EMAIL]: [
    { required: true, message: '请输入邮箱' },
    {
      pattern: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
      message: '请输入正确的邮箱',
    },
  ],
};

export const validate = (
  value: string,
  rules: FormRules
): readonly [pass: boolean, message: string] => {
  const rule = formRules[rules];
  if (!rule) {
    return [true, ''];
  }
  for (let i = 0; i < rule.length; i++) {
    const { pattern, required, message } = rule[i];
    if (required && !value) {
      return [false, message];
    }
    if (pattern && !pattern.test(value)) {
      return [false, message];
    }
  }
  return [true, ''];
};
