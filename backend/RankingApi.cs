using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using CsvHelper;
using System.Text.Json;


public class RankingApi
{
    private readonly IScoreCalculatorService _scoreCalculator;
    private readonly ILlmService _llmService;
    private readonly ISentimentService _sentimentService;
    private readonly IAnomalyDetectorService _anomalyDetectorService;
    private readonly ILogger<RankingApi> _logger;

    public RankingApi(IScoreCalculatorService scoreCalculator, ILlmService llmService, ISentimentService sentimentService, IAnomalyDetectorService anomalyDetectorService, ILogger<RankingApi> logger)
    {
        _scoreCalculator = scoreCalculator;
        _llmService = llmService;
        _sentimentService = sentimentService;
        _anomalyDetectorService = anomalyDetectorService;
        _logger = logger;
    }

    private async Task<List<Colaborador>> LoadDataFromCsv() 
    {
        var projectRootPath = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", ".."));
        var csvPath = Path.Combine(projectRootPath, "data", "dados_hackathon.csv");
        if (!File.Exists(csvPath)) return new List<Colaborador>();

        using var reader = new StreamReader(csvPath);
        using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);
        var csvRecords = csv.GetRecords<ColaboradorCsvRecord>().ToList();
        var colaboradores = new List<Colaborador>();
        int currentId = 1;

        foreach (var record in csvRecords)
        {
            // 1. Coleta todos os 12 pontos de dados
            var absenteismoHistorico = new List<string?> { 
                record.AbsenteismoM1, record.AbsenteismoM2, record.AbsenteismoM3, 
                record.AbsenteismoM4, record.AbsenteismoM5, record.AbsenteismoM6,
                record.AbsenteismoM7, record.AbsenteismoM8, record.AbsenteismoM9,
                record.AbsenteismoM10, record.AbsenteismoM11, record.AbsenteismoM12
            };
            var valoresAbsenteismo = new List<double>();
            foreach (var item in absenteismoHistorico)
            {
                double.TryParse(item?.Replace(",", "."), NumberStyles.Any, CultureInfo.InvariantCulture, out double valor);
                valoresAbsenteismo.Add(valor);
            }

            // 2. Usa o valor do último mês (M12) para o cálculo do score
            double.TryParse(record.AbsenteismoM12?.Replace(",", "."), NumberStyles.Any, CultureInfo.InvariantCulture, out double absenteismoMaisRecente);

            var colaborador = new Colaborador
            {
                Id = currentId++,
                Nome = record.Nome,
                Area = record.Cargo,
                DesempenhoTexto = record.Desempenho,
                RiscoPerdaTexto = record.RiscoPerda,
                ImpactoPerdaTexto = record.ImpactoPerda,
                TempoDeCasa = record.TempoCasa,
                TempoNoCargo = record.TempoCargo,
                Absenteismo = absenteismoMaisRecente / 100.0,
                Advertencias = record.Advertencias,
                FeedbackUltimaAvaliacao = record.FeedbackUltimaAvaliacao
            };

            colaborador.ScoreSentimento = await _sentimentService.AnalisarSentimentoAsync(colaborador.FeedbackUltimaAvaliacao ?? "");
            colaborador.IsAbsenteismoAnomalo = await _anomalyDetectorService.DetectarAnomaliaAbsenteismoAsync(valoresAbsenteismo);

            colaboradores.Add(colaborador);
}
        return colaboradores;
    }

    [Function("GetRanking")]
    public async Task<IActionResult> GetRanking([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "ranking")] HttpRequest req)
    {
        var colaboradores = await LoadDataFromCsv();
        return new OkObjectResult(colaboradores);
    }

    [Function("Analyse")]
    public async Task<IActionResult> Analyse([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "analyse")] HttpRequest req)
    {
        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
        var data = JsonSerializer.Deserialize<AnalysisRequest>(requestBody, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        if (data?.Weights == null) return new BadRequestObjectResult("Requisição inválida. Pesos não fornecidos.");

        var todosColaboradores = await LoadDataFromCsv();
        var colaboradorSelecionado = todosColaboradores.FirstOrDefault(c => c.Id == data.ColaboradorId);
        if (colaboradorSelecionado == null) return new NotFoundObjectResult("Colaborador não encontrado.");

        colaboradorSelecionado.Score = _scoreCalculator.CalcularScore(colaboradorSelecionado, todosColaboradores, data.Weights);

        var analise = await _llmService.GerarAnalise(colaboradorSelecionado, data.AnalysisType);
        return new OkObjectResult(new { analise });
    }
}