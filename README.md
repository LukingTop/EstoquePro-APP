
# 📱 EstoquePro - Mobile App

Este é o aplicativo móvel do sistema **EstoquePro**, desenhado para ser utilizado por operadores de estoque. O app permite visualizar missões, realizar contagens através de bipagem de itens e sincronizar os dados em tempo real com o [API do EstoquePro](https://github.com/LukingTop/EstoquePro-API).

# 🚀 Tecnologias Utilizadas

* **React Native & Expo:** Desenvolvimento mobile multiplataforma.
* **TypeScript:** Tipagem estática para maior segurança do código.
* **Axios:** Cliente HTTP com interceptors configurados para renovação automática de Token JWT.
* **Expo SecureStore:** Armazenamento criptografado dos tokens de sessão do usuário.
* **Sentry (@sentry/react-native):** Rastreamento de falhas e monitoramento de estabilidade.
* **EAS Build:** Pipeline de compilação na nuvem para geração de `.apk`.

# ⚙️ Funcionalidades

* **Login Persistente:** Fluxo completo de autenticação com armazenamento seguro e refresh token silencioso.
* **Tratamento de Fila de Requisições:** Interceptors mantêm requisições pausadas em caso de expiração de token e disparam novamente de forma invisível após a renovação.
* **Interface Dinâmica:** Tela focada na produtividade do operador (leitura de itens e missões diárias).

# 🛠️ Como rodar o projeto localmente

**1. Clone este repositório:**

```bash

git clone [https://github.com/LukingTop/EstoquePro-APP]

cd estoquepro-mobile

npm install

cp .env.example .env

# Certifique-se de que a variável comece com EXPO_PUBLIC_API_URL=http://...

npx expo start

eas build -p android --profile preview
