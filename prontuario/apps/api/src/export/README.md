# Módulo de Exportação de Prontuário

Este módulo permite exportar prontuários de pacientes em formato PDF ou ZIP com anexos.

## Funcionalidades

- **Exportação em PDF**: Gera um relatório completo do prontuário
- **Exportação em ZIP**: Inclui o PDF + lista de anexos com URLs presignadas
- **Filtro por período**: Permite exportar apenas dados de um período específico
- **Integração com S3**: Armazena arquivos no S3 com URLs temporárias

## Endpoints

### POST /export/prontuario

Exporta o prontuário de um paciente.

**Body:**
```json
{
  "pacienteId": "uuid-do-paciente",
  "from": "2024-01-01", // opcional - data inicial (ISO)
  "to": "2024-12-31",   // opcional - data final (ISO)
  "incluirAnexos": true // opcional - incluir anexos no ZIP
}
```

**Response (PDF):**
```json
{
  "tipo": "PDF",
  "fileKey": "exports/2024/12/uuid.pdf",
  "url": "https://s3.amazonaws.com/bucket/exports/2024/12/uuid.pdf?signature=...",
  "expires": 300
}
```

**Response (ZIP):**
```json
{
  "tipo": "ZIP",
  "fileKey": "exports/2024/12/uuid.zip",
  "url": "https://s3.amazonaws.com/bucket/exports/2024/12/uuid.zip?signature=...",
  "expires": 300
}
```

## Estrutura do PDF

O PDF gerado inclui:

1. **Cabeçalho**: Nome do paciente, período e data de nascimento
2. **Sumário**: Contagem de episódios, evoluções e anexos
3. **Conteúdo**: Lista cronológica de episódios e evoluções
4. **Anexos**: Lista de arquivos anexados (quando aplicável)

## Estrutura do ZIP

Quando `incluirAnexos` é `true`, o ZIP contém:

- `prontuario.pdf`: O relatório completo
- `anexos.csv`: Lista de anexos com URLs presignadas para download

## Variáveis de Ambiente

Certifique-se de configurar:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=your-bucket-name
```

## Uso no Mobile

A tela `ExportProntuario` permite:

- Selecionar paciente por ID
- Definir período de exportação
- Escolher incluir anexos ou não
- Download direto do arquivo gerado

## Testes

Execute os testes com:

```bash
pnpm test export.service.spec.ts
```
