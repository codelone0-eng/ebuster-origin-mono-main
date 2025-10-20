export const ru = {
  title: "Создать аккаунт",
  description: "Присоединяйтесь к сообществу профессионалов, которые не идут на компромиссы в вопросах качества.",
  fields: {
    fullName: "Полное имя",
    fullNamePlaceholder: "Введите ваше полное имя",
    email: "Email адрес",
    emailPlaceholder: "Введите ваш email",
    password: "Пароль",
    passwordPlaceholder: "Создайте пароль",
    confirmPassword: "Подтвердите пароль",
    confirmPasswordPlaceholder: "Подтвердите ваш пароль"
  },
  buttons: {
    createAccount: "Создать аккаунт",
    alreadyHaveAccount: "Уже есть аккаунт?",
    signIn: "Войти"
  },
  passwordRequirements: {
    title: "Требования к паролю",
    requirements: [
      "Минимум 8 символов",
      "Содержит заглавные буквы",
      "Содержит строчные буквы", 
      "Содержит цифры",
      "Содержит специальные символы"
    ]
  },
  errors: {
    required: "Это поле обязательно",
    emailInvalid: "Неверный формат email",
    passwordMismatch: "Пароли не совпадают",
    passwordTooShort: "Пароль должен содержать минимум 8 символов"
  }
};
