# 📱 CargoPolo – Inventário Rotativo de Estoque

App móvel do sistema **CargoPolo**, desenvolvido para operadores de estoque realizarem contagens sequenciais, registrarem avarias, lançamentos livres (stage) e acompanharem o progresso dos ciclos de inventário. O aplicativo se comunica em tempo real com o [Backend Django](https://github.com/LukingTop/EstoquePro-Backend).

# 🚀 Tecnologias Utilizadas

* **React Native & Expo (Expo Router):** Desenvolvimento mobile com navegação baseada em arquivos.
* **TypeScript:** Tipagem estática para segurança e produtividade.
* **Axios:** Cliente HTTP com interceptors para renovação automática de Token JWT.
* **Expo SecureStore & AsyncStorage:** Armazenamento criptografado de credenciais e cache offline.
* **Sentry (@sentry/react-native):** Monitoramento de erros e performance.
* **Gradle (build local):** Geração de APK diretamente na máquina, sem depender do EAS Build.

# ⚙️ Funcionalidades Principais

* **Login persistente:** autenticação JWT com renovação silenciosa de token e opção “lembrar acesso”.
* **Home (Missões de Recontagem):** lista de tarefas de recontagem pendentes, com opção de assumir e iniciar contagem.
* **Ciclos de Contagem:** visualização das sessões de inventário criadas pelo gestor; ao selecionar, o operador inicia a contagem sequencial das ruas atribuídas.
* **Contagem Sequencial:** progresso da rota, leitura de produto (modal de busca ou digitação), registro de pallets e unidades, observações, navegação entre endereços (anterior/próximo) e confirmação de contagem (online e offline).
* **Registro de Avaria:** conversor de unidades com cálculo automático (unidade/pack/pallet) e envio para o backend.
* **Lançamento Livre (Stage):** contagem rápida em qualquer endereço, independente de ciclo.
* **Meu Progresso:** painel individual com total de pallets do dia, missões concluídas e últimos itens contados.
* **Ranking Diário:** classificação dos operadores com meta de pallets e destaque para o usuário logado.
* **Detalhes do Ciclo:** acompanhamento visual com percentual de conclusão, lista de itens e gráfico de rosca.
* **Histórico de Contagens:** registro detalhado por item, com opção de solicitar recontagem.
* **Relatórios:** hub central que direciona para Progresso, Ranking, Avaria e Stage.
* **Sincronização offline:** contagens pendentes são salvas localmente e enviadas quando a internet retorna.

# 📋 Pré‑requisitos

* **Node.js** (versão LTS recomendada) e **npm** instalados.
* **Android Studio** (para emulador) ou um **dispositivo Android físico**.
* **JDK 17** (recomendado: Eclipse Adoptium Temurin 17).
* **Android SDK** configurado (caminho padrão: `C:\Users\<seu_usuario>\AppData\Local\Android\Sdk`).
* Variável de ambiente `ANDROID_HOME` (opcional, mas recomendada).

# 🔧 Configuração do Ambiente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/LukingTop/EstoquePro-APP.git
   cd estoque-app

2. **Instale as dependências:**
bash

npm install   

3. **Configure a URL do backend:**

Crie um arquivo .env na raiz do projeto com o seguinte conteúdo:

text

EXPO_PUBLIC_API_URL=http://192.168.X.X:8000

Substitua 192.168.X.X pelo IP da máquina onde o backend Django está rodando.
(Para descobrir seu IP local no Windows, use ipconfig e procure por Endereço IPv4.)

4. **Sincronize os assets nativos**

bash
npx expo prebuild --platform android

🛠️ Rodando o App em Desenvolvimento
Inicie o servidor Metro:

bash
npx expo start
Escaneie o QR Code com o app Expo Go no seu celular (Android/iOS) ou pressione a para abrir no emulador Android.

O app será carregado com hot‑reload ativado.

Nota: Certifique‑se de que o backend esteja acessível no mesmo IP configurado no .env e que a porta 8000 esteja liberada no firewall.

📦 Gerando o APK (Build Local)
Quando precisar instalar o app em um dispositivo sem Expo Go, gere o APK de produção localmente:

bash
# 1. Exporte o bundle JavaScript limpo
npx expo export --platform android --clear

# 2. Copie o bundle e os assets para a pasta do Android
xcopy /E /Y dist\* android\app\src\main\assets\

# 3. Acesse a pasta android
cd android

# 4. Execute o Gradle para gerar o APK de release
.\gradlew assembleRelease
O APK será gerado em:

text
android\app\build\outputs\apk\release\app-release.apk
Transfira o arquivo para o celular e instale‑o.

Dica: Se o Gradle apresentar erro de memória ou metadados corrompidos, limpe o cache:

bash
taskkill /f /im java.exe
Remove-Item -Path "$env:USERPROFILE\.gradle\caches\8.13\transforms" -Recurse -Force

📄 Licença
Este projeto é de uso interno da CargoPolo – Inventário Rotativo de Estoque. Todos os direitos reservados.

