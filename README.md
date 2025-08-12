# 🐾 Find Pet API - Challenge

API REST para conectar organizações de adoção de animais com pessoas interessadas em adotar pets.

## 📝 Premissas do Desafio

### Funcionalidades Implementadas

- ✅ Deve ser possível cadastrar um pet
- ✅ Deve ser possível listar todos os pets disponíveis para adoção em uma cidade
- ✅ Deve ser possível filtrar pets por suas características
- ✅ Deve ser possível visualizar detalhes de um pet para adoção
- ✅ Deve ser possível se cadastrar como uma ORG
- ✅ Deve ser possível realizar login como uma ORG

### Regras de Negócio

- ✅ Para listar os pets, obrigatoriamente precisamos informar a cidade
- ✅ Uma ORG precisa ter um endereço e um número de WhatsApp
- ✅ Um pet deve estar ligado a uma ORG
- ✅ O usuário que quer adotar, entrará em contato com a ORG via WhatsApp
- ✅ Todos os filtros, além da cidade, são opcionais
- ✅ Para uma ORG acessar a aplicação como admin, ela precisa estar logada

## ⚡ Tecnologias Utilizadas

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

## 🚀 Como Executar o Projeto

### Pré-requisitos

- Node.js (versão 18 ou superior)
- Docker e Docker Compose
- npm ou yarn

### 1. Clone o repositório

```bash
git clone <repository-url>
cd find-pet-api
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="postgresql://docker:docker@localhost:5432/pet_finder?schema=public"

# JWT
JWT_SECRET="sua-chave-secreta-super-segura"
```

### 4. Inicie o banco de dados

```bash
docker-compose up -d
```

### 5. Execute as migrações do banco

```bash
npx prisma migrate dev
```

### 6. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

A API estará disponível em `http://localhost:3333`

### 7. (Opcional) Visualize o banco de dados

```bash
npx prisma studio
```

Acesse `http://localhost:5555` para visualizar os dados no Prisma Studio.

## 📚 Documentação da API

### Autenticação

Todos os endpoints marcados com 🔒 requerem autenticação via JWT Bearer Token.

#### Registrar Organização

```http
POST /register
Content-Type: application/json

{
  "name": "ONG Patinhas Felizes",
  "email": "contato@patinhasfelizes.org",
  "password": "senha123456",
  "address": "Rua das Flores, 123",
  "city": "São Paulo",
  "whatsapp": "11999999999",
  "latitude": -23.5505,
  "longitude": -46.6333
}
```

#### Login (Autenticação)

```http
POST /sessions
Content-Type: application/json

{
  "email": "contato@patinhasfelizes.org",
  "password": "senha123456"
}
```

**Resposta:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "organization": {
    "id": "uuid",
    "name": "ONG Patinhas Felizes",
    "email": "contato@patinhasfelizes.org"
  }
}
```

#### Renovar Token

```http
PATCH /token/refresh
Cookie: refreshToken=seu_refresh_token
```

### Organizações

#### 🔒 Obter Perfil da Organização Autenticada

```http
GET /me
Authorization: Bearer {token}
```

#### Obter Perfil de Organização por ID

```http
GET /orgs/{organizationId}
```

#### Buscar Organizações por Cidade

```http
GET /orgs/city/{city}
```

#### Buscar Organizações Próximas

```http
GET /orgs/nearby?latitude=-23.5505&longitude=-46.6333&maxDistance=10&city=São Paulo
```

**Parâmetros:**

- `latitude` (obrigatório): Latitude da localização
- `longitude` (obrigatório): Longitude da localização
- `maxDistance` (opcional): Distância máxima em km (padrão: 10)
- `city` (opcional): Filtrar por cidade

#### Calcular Distância para Organização

```http
GET /orgs/{organizationId}/distance?latitude=-23.5505&longitude=-46.6333
```

### Pets

#### 🔒 Cadastrar Pet

```http
POST /pets
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Buddy",
  "species": "dog",
  "breed": "Golden Retriever",
  "age": "adult",
  "size": "large",
  "description": "Cachorro muito dócil e carinhoso, adora brincar com crianças."
}
```

**Campos válidos:**

- `species`: dog, cat, bird, etc.
- `age`: puppy, young, adult, senior
- `size`: small, medium, large

#### Obter Detalhes do Pet

```http
GET /pets/{petId}
```

#### Buscar Pets por Cidade (com filtros opcionais)

```http
GET /pets/search?city=São Paulo&species=dog&age=adult&size=large&breed=Golden Retriever
```

**Parâmetros:**

- `city` (obrigatório): Cidade para busca
- `species` (opcional): Espécie do animal
- `age` (opcional): Idade do animal
- `size` (opcional): Porte do animal
- `breed` (opcional): Raça do animal

#### Buscar Pets Próximos

```http
GET /pets/nearby?latitude=-23.5505&longitude=-46.6333&maxDistance=20&city=São Paulo&species=dog
```

**Parâmetros:**

- `latitude` (obrigatório): Latitude da localização
- `longitude` (obrigatório): Longitude da localização
- `maxDistance` (obrigatório): Distância máxima em km
- `city` (obrigatório): Cidade para busca
- `species` (opcional): Espécie do animal
- `age` (opcional): Idade do animal
- `size` (opcional): Porte do animal
- `breed` (opcional): Raça do animal

## 🗃️ Schemas

### Organizations (Organizações)

- ID único
- Nome, email e senha
- Endereço completo e cidade
- WhatsApp para contato
- Coordenadas (latitude/longitude)

### Pets

- ID único
- Nome, espécie, raça
- Idade e porte
- Descrição
- Relacionamento com organização
