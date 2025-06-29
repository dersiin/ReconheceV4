using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

public interface IAnomalyDetectorService
{
    Task<bool> DetectarAnomaliaAbsenteismoAsync(List<double> seriesData);
}

public class AnomalyDetectorService : IAnomalyDetectorService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _endpoint;

    public AnomalyDetectorService(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient();
        _apiKey = Environment.GetEnvironmentVariable("AZURE_ANOMALY_KEY") ?? "";
        string baseUrl = Environment.GetEnvironmentVariable("AZURE_ANOMALY_ENDPOINT") ?? "";
        _endpoint = $"{baseUrl}anomalydetector/v1.0/timeseries/last/detect";
    }

    public async Task<bool> DetectarAnomaliaAbsenteismoAsync(List<double> seriesData)
    {
        if (seriesData == null || seriesData.Count < 4 || string.IsNullOrEmpty(_apiKey))
        {
            return false;
        }

        var points = seriesData.Select((value, index) => new { 
            timestamp = DateTime.UtcNow.AddMonths(-(seriesData.Count - index - 1)).ToString("o"), 
            value 
        }).ToList();

        var payload = new { series = points, granularity = "monthly", sensitivity = 99 };
        var request = new HttpRequestMessage(HttpMethod.Post, _endpoint);
        request.Headers.Add("Ocp-Apim-Subscription-Key", _apiKey);
        request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

        var response = await _httpClient.SendAsync(request);
        if (!response.IsSuccessStatusCode) return false;

        var responseBody = await response.Content.ReadAsStringAsync();
        using var jsonDoc = JsonDocument.Parse(responseBody);

        return jsonDoc.RootElement.GetProperty("isAnomaly").GetBoolean();
    }
}