# Projeto Feridas

O Projeto Feridas é uma aplicação desenvolvida para auxiliar na segmentação de feridas através de dispositivos móveis. O objetivo principal do projeto é permitir que profissionais de saúde capturem imagens de feridas, realizem a segmentação dessas imagens diretamente no aplicativo e, em seguida, façam o upload das feridas segmentadas para o Google Drive. Isso facilita a criação de um banco de dados volumoso de feridas segmentadas, que pode ser utilizado para análise, acompanhamento de tratamentos e pesquisas.

## Recursos

- **Captura de Imagens**: Permite que os usuários capturem imagens de feridas diretamente através da câmera do dispositivo.
- **Segmentação de Feridas**: Ferramentas para segmentar feridas nas imagens capturadas, destacando as áreas relevantes.
- **Upload de Imagens da Galeria**: Possibilidade de selecionar imagens diretamente da galeria do celular e fazer o upload para o Google Drive.
- **Upload de Imagens sem Segmentação**: Funcionalidade para carregar imagens não segmentadas do Google Drive para o aplicativo.
- **Upload para Google Drive**: Funcionalidade para salvar as imagens segmentadas diretamente no Google 

## Instalação

Para clonar e rodar este projeto, siga os passos abaixo:

### Pré-requisitos

Certifique-se de ter os seguintes itens instalados:

- **Node.js**: [Baixar Node.js](https://nodejs.org/) e instalar.
- **Expo CLI**: Instale globalmente com `npm install -g expo-cli`.
- **Android Studio**: [Baixar Android Studio](https://developer.android.com/studio) e instalar.
   - Certifique se de que o SDK Android e o Emulador estão configurados

### Configuração do Ambiente

1. **Configuração do Android SDK**:
   - Abra o Android Studio.
   - Vá para **File > Settings > Appearance & Behavior > System Settings > Android SDK**.
   - Certifique-se de que os seguintes componentes estão instalados:
     - Android SDK Platform-Tools
     - Android SDK Build-Tools
     - Android SDK API Level correspondente

2. **Configuração do Emulador**:
   - No Android Studio, vá para **AVD Manager**.
   - Crie um novo dispositivo virtual ou use um existente.
   - Certifique-se de que o emulador está configurado corretamente.

### Execução do Projeto

 1. Clone o repositório e entre na pasta do projeto:
```bash
git clone https://github.com/joaodelrio/ProjetoFeridas.git
```
2. Entre na pasta do projeto:
```bash      
cd ProjetoFeridas
```
3. Instale as dependências do projeto:
``` bash
npm install
``` 
4. npx expo run:android
```bash    
npx expo run:android
```

### Problemas Comuns

1. **Erro ao rodar npx expo run:android**:
- Verifique se o Android Studio está instalado e configurado corretamente.
- Certifique-se de que o emulador está em execução ou um dispositivo físico está conectado.

2. **Erro de node_modules**:

- Remover a pasta node_modules, e então reinstale as dependências:

```bash
rm -rf node_modules
npm install
npx expo run:android
```
3. **Problemas com a pasta android**:

- Remova a pasta android e gere-a novamente:

```bash
rm -rf android
npx expo run:android
```

## Requisitos

- **Java**: versão 18.0.2.1
- **Node.js**: versão 20.14.0
- **npm**: versão 10.8.2
- **React**: versão 18.2.0
- **React Native**: versão 0.74.3
- **Android SDK**:
    - ***API Levels***: 34
    - ***Build Tools***: 34.0.0

## Tecnologias Utilizadas

### **Frameworks e Ferramentas**
- **React Native**: Framework para desenvolvimento de aplicativos móveis.
- **Expo**: Ferramenta para desenvolvimento com React Native.
- **Redux**: Biblioteca para gerenciamento de estado global.
- **npm**: Gerenciador de pacotes para Node.js.
- **npx**: Ferramenta para executar pacotes Node.js.

### **Integração com Google Drive**
- **Google Sign-In**: Biblioteca para autenticação e permissões.
  - **Biblioteca**: `@react-native-google-signin/google-signin`
- **Google Drive API**: Biblioteca para acessar e gerenciar arquivos no Google Drive.
  - **Biblioteca**: `@robinbobin/react-native-google-drive-api-wrapper`

### **Segmentação e Manipulação de Imagens**
- **React Native Skia**: Biblioteca para renderização gráfica avançada.
  - **Biblioteca**: `@shopify/react-native-skia`
- **React Native Image Crop Picker**: Biblioteca para seleção e manipulação de imagens.
  - **Biblioteca**: `react-native-image-crop-picker`
- **React Native View Shot**: Biblioteca para captura de imagens de visualizações.
  - **Biblioteca**: `react-native-view-shot`

### **Outros Pacotes e Bibliotecas**
- **React Native Paper**: Biblioteca para componentes de interface.
  - **Biblioteca**: `react-native-paper`
- **Expo Image Picker**: Biblioteca para selecionar imagens do dispositivo.
  - **Biblioteca**: `expo-image-picker`
- Entre outros

## Documentação Adicional

1. Documentação do [React Native](https://reactnative.dev/docs/environment-setup).
2. Documentação do [Node.js](https://nodejs.org/docs/latest/api/).
3. Documentação do [Expo](https://docs.expo.dev/).

