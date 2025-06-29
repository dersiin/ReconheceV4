using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;

public interface ILlmService
{
    Task<string> GerarAnalise(Colaborador colaborador, string analysisType);
}

// A implementação real do serviço
public class LlmService : ILlmService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _apiUrl;

    public LlmService(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient();
        _apiKey = Environment.GetEnvironmentVariable("AZURE_OPENAI_KEY") ?? "";
        string endpoint = Environment.GetEnvironmentVariable("AZURE_OPENAI_ENDPOINT") ?? "";
        string deploymentName = Environment.GetEnvironmentVariable("AZURE_OPENAI_DEPLOYMENT_NAME") ?? "";
        string apiVersion = "2023-12-01-preview";
        _apiUrl = $"{endpoint}openai/deployments/{deploymentName}/chat/completions?api-version={apiVersion}";
    }

    public async Task<string> GerarAnalise(Colaborador colaborador, string analysisType)
    {
        var (systemMessage, userMessage) = GerarPrompt(colaborador, analysisType);
        var requestPayload = new OpenAiRequest { Messages = new List<OpenAiMessage> { systemMessage, userMessage } };
        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Add("api-key", _apiKey);
        try
        {
            var response = await _httpClient.PostAsJsonAsync(_apiUrl, requestPayload);
            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                return $"Erro na API do Azure OpenAI: {response.StatusCode} - {errorBody}";
            }
            var openAiResponse = await response.Content.ReadFromJsonAsync<OpenAiResponse>();
            return openAiResponse?.Choices?.FirstOrDefault()?.Message?.Content ?? "Não foi possível extrair a análise da resposta.";
        }
        catch (Exception ex)
        {
            return $"Ocorreu um erro ao conectar com a IA: {ex.Message}";
        }
    }
    
    private (OpenAiMessage, OpenAiMessage) GerarPrompt(Colaborador c, string analysisType)
    {
        string systemContent = "Você é o 'ReconheceAí', um agente de IA especialista em Gestão de Talentos e Estratégia de RH.";
        string userContent = "";

        switch (analysisType.ToLower())
        {
            case "risk":
                systemContent += " Sua tarefa é analisar o risco de perda de um colaborador e prescrever um plano de retenção acionável.";
                userContent = $@"Analise os dados do colaborador {c.Nome} e gere uma **Análise de Risco de Perda**.
                    **Dados para Análise:**
                    - Nome: {c.Nome}, Cargo: {c.Area}
                    - Nível de Risco de Perda: {c.RiscoPerdaTexto}
                    - Desempenho: {c.DesempenhoTexto}
                    - Tempo no Cargo: {c.TempoNoCargo} anos
                    - Score de Reconhecimento: {c.Score:F1}

                    **Sua Tarefa:**
                    1.  **Diagnóstico do Risco:** Em um parágrafo, explique por que o risco de perda é classificado como '{c.RiscoPerdaTexto}'.
                    2.  **Plano de Retenção Sugerido:** Crie uma lista com 3 a 4 ações concretas que um gestor poderia tomar.

                    **Regras de Formatação OBRIGATÓRIAS:**
                    - Use apenas tags HTML.
                    - Use `<p><strong>Diagnóstico do Risco</strong></p>` para o primeiro título, seguido pelo parágrafo.
                    - Use `<p><strong>Plano de Retenção Sugerido</strong></p>` para o segundo título, seguido pela lista `<ul>`. NÃO use markdown.";
                break;
            case "impact":
                systemContent += " Sua tarefa é analisar o impacto da potencial saída de um colaborador para a organização.";
                userContent = $@"Analise os dados do colaborador {c.Nome} e gere uma **Análise de Impacto de Perda**.
                    **Dados para Análise:**
                    - Nome: {c.Nome}, Cargo: {c.Area}
                    - Nível de Impacto da Perda: {c.ImpactoPerdaTexto}
                    - Desempenho: {c.DesempenhoTexto}
                    - Score de Reconhecimento: {c.Score:F1}

                    **Regras de Formatação OBRIGATÓRIAS:**
                    - Use apenas tags HTML. A resposta deve ser um único parágrafo `<p>` começando com `<strong>Análise de Impacto:</strong>`.";
                break;
            default: 
                systemContent += " Sua tarefa é gerar justificativas claras para decisões de reconhecimento.";
                userContent = $@"Gere uma justificativa de reconhecimento para {c.Nome}.
                    **Dados do Colaborador:**
                    - Score de Reconhecimento: {c.Score:F1}
                    - Desempenho: {c.DesempenhoTexto}
                    - Risco de Perda: {c.RiscoPerdaTexto}
                    - Impacto da Perda: {c.ImpactoPerdaTexto}
                    
                    **Regras de Formatação OBRIGATÓRIAS:**
                    - Formato HTML com 3 parágrafos `<p>`, cada um começando com `<strong>`. Títulos: 'Parágrafo de Reconhecimento:', 'Justificativa Técnica:', 'Mensagem de Incentivo:'. NÃO use markdown.";
                break;
        }
        return (new OpenAiMessage { Role = "system", Content = systemContent }, new OpenAiMessage { Role = "user", Content = userContent });
    }
}