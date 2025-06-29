using System.Collections.Generic;
using System.Text.Json.Serialization;

// Modelo para o corpo da requisição
public record OpenAiRequest
{
    [JsonPropertyName("messages")]
    public List<OpenAiMessage> Messages { get; set; } = new();

    [JsonPropertyName("temperature")]
    public double Temperature { get; set; } = 0.7;

    [JsonPropertyName("max_tokens")]
    public int Max_Tokens { get; set; } = 600;
}

public record OpenAiMessage
{
    [JsonPropertyName("role")]
    public string Role { get; set; } = string.Empty;

    [JsonPropertyName("content")]
    public string Content { get; set; } = string.Empty;
}
public record OpenAiResponse
{
    public List<Choice>? Choices { get; set; }
}

public record Choice
{
    public OpenAiMessage? Message { get; set; }
}