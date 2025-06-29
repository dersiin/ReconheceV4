// SentimentService.cs
using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

// Interface para o serviço
public interface ISentimentService
{
    Task<double> AnalisarSentimentoAsync(string? texto);
}

// Implementação do serviço
public class SentimentService : ISentimentService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _endpoint;

    public SentimentService(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient();
        _apiKey = Environment.GetEnvironmentVariable("AZURE_LANGUAGE_KEY") ?? "";
        string baseUrl = Environment.GetEnvironmentVariable("AZURE_LANGUAGE_ENDPOINT") ?? "";
        _endpoint = $"{baseUrl}language/:analyze-text?api-version=2023-04-01";
    }

    public async Task<double> AnalisarSentimentoAsync(string? texto)
    {
        if (string.IsNullOrWhiteSpace(texto) || string.IsNullOrEmpty(_apiKey))
        {
            return 0.5; // Retorna neutro se não houver texto ou chave
        }

        var payload = new
        {
            kind = "SentimentAnalysis",
            analysisInput = new { documents = new[] { new { id = "1", language = "pt", text = texto } } }
        };

        var request = new HttpRequestMessage(HttpMethod.Post, _endpoint);
        request.Headers.Add("Ocp-Apim-Subscription-Key", _apiKey);
        request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

        var response = await _httpClient.SendAsync(request);

        if (!response.IsSuccessStatusCode)
        {
            return 0.5; // Falha na análise, retorna neutro
        }

        var responseBody = await response.Content.ReadAsStringAsync();
        using var jsonDoc = JsonDocument.Parse(responseBody);

        // Extrai o score de sentimento negativo. Quanto mais negativo, maior o score (pior).
        var sentiment = jsonDoc.RootElement.GetProperty("results").GetProperty("documents")[0].GetProperty("sentiment").GetString();
        var scores = jsonDoc.RootElement.GetProperty("results").GetProperty("documents")[0].GetProperty("confidenceScores");
        
        // Vamos usar o score negativo como um indicador de risco.
        // Se o sentimento geral for "negativo", retornamos o score de confiança negativo.
        // Se for "positivo", retornamos 0. Se for "misto" ou "neutro", retornamos um valor médio.
        return sentiment switch
        {
            "negative" => scores.GetProperty("negative").GetDouble(),
            "positive" => 0.0,
            _ => 0.3 // Um peso pequeno para misto/neutro
        };
    }
}