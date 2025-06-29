using CsvHelper;
using CsvHelper.Configuration;
using ReconheceAi.Api.Models;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Caching.Memory;

namespace ReconheceAi.Api.Services
{
    public class DataService : IDataService
    {
        private readonly ILogger<DataService> _logger;
        private readonly IMemoryCache _cache;
        private readonly ISentimentService _sentimentService;
        private readonly IAnomalyDetectorService _anomalyDetectorService;
        private const string CACHE_KEY = "employees_data";
        private const int CACHE_DURATION_MINUTES = 30;

        public DataService(
            ILogger<DataService> logger, 
            IMemoryCache cache,
            ISentimentService sentimentService,
            IAnomalyDetectorService anomalyDetectorService)
        {
            _logger = logger;
            _cache = cache;
            _sentimentService = sentimentService;
            _anomalyDetectorService = anomalyDetectorService;
        }

        public async Task<List<Employee>> LoadEmployeesFromCsvAsync()
        {
            try
            {
                // Verifica cache primeiro
                if (_cache.TryGetValue(CACHE_KEY, out List<Employee>? cachedEmployees))
                {
                    _logger.LogInformation("Dados carregados do cache");
                    return cachedEmployees ?? new List<Employee>();
                }

                var projectRootPath = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", ".."));
                var csvPath = Path.Combine(projectRootPath, "data", "Hackaton.csv");
                
                if (!File.Exists(csvPath))
                {
                    _logger.LogWarning("Arquivo CSV não encontrado: {CsvPath}", csvPath);
                    return new List<Employee>();
                }

                var employees = new List<Employee>();
                var config = new CsvConfiguration(CultureInfo.InvariantCulture)
                {
                    HasHeaderRecord = true,
                    MissingFieldFound = null,
                    HeaderValidated = null,
                    TrimOptions = TrimOptions.Trim
                };

                using var reader = new StreamReader(csvPath);
                using var csv = new CsvReader(reader, config);
                
                var records = csv.GetRecords<ColaboradorCsvRecord>().ToList();
                _logger.LogInformation("Carregados {Count} registros do CSV", records.Count);

                int currentId = 1;
                foreach (var record in records)
                {
                    try
                    {
                        var employee = await MapCsvRecordToEmployeeAsync(record, currentId++);
                        employees.Add(employee);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Erro ao processar registro: {Nome}", record.Nome);
                    }
                }

                // Calcula scores finais
                await CalculateScoresAsync(employees);

                // Cache os dados
                _cache.Set(CACHE_KEY, employees, TimeSpan.FromMinutes(CACHE_DURATION_MINUTES));
                
                _logger.LogInformation("Processados {Count} colaboradores com sucesso", employees.Count);
                return employees;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao carregar dados do CSV");
                throw;
            }
        }

        public async Task<Employee?> GetEmployeeByIdAsync(int id)
        {
            var employees = await LoadEmployeesFromCsvAsync();
            return employees.FirstOrDefault(e => e.Id == id);
        }

        public async Task<List<Employee>> GetEmployeesByDepartmentAsync(string department)
        {
            var employees = await LoadEmployeesFromCsvAsync();
            return employees.Where(e => e.Area.Equals(department, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        public async Task<List<Employee>> GetHighRiskEmployeesAsync()
        {
            var employees = await LoadEmployeesFromCsvAsync();
            return employees.Where(e => e.IsAtRisk()).ToList();
        }

        public async Task<Dictionary<string, object>> GetDashboardMetricsAsync()
        {
            var employees = await LoadEmployeesFromCsvAsync();
            
            return new Dictionary<string, object>
            {
                ["totalEmployees"] = employees.Count,
                ["highRiskEmployees"] = employees.Count(e => e.IsAtRisk()),
                ["averageScore"] = employees.Average(e => e.Score),
                ["retentionRate"] = employees.Count > 0 ? (1.0 - (double)employees.Count(e => e.IsAtRisk()) / employees.Count) * 100 : 0,
                ["topPerformers"] = employees.Where(e => e.IsTopTalent()).Count(),
                ["departmentMetrics"] = GetDepartmentMetrics(employees),
                ["riskDistribution"] = GetRiskDistribution(employees),
                ["diversityMetrics"] = GetDiversityMetrics(employees)
            };
        }

        public async Task<bool> ValidateDataIntegrityAsync()
        {
            try
            {
                var employees = await LoadEmployeesFromCsvAsync();
                
                // Validações básicas
                var hasInvalidScores = employees.Any(e => e.Score < 0 || e.Score > 500);
                var hasInvalidDates = employees.Any(e => e.DataAdmissao > DateTime.Now);
                var hasMissingNames = employees.Any(e => string.IsNullOrWhiteSpace(e.Nome));
                
                if (hasInvalidScores || hasInvalidDates || hasMissingNames)
                {
                    _logger.LogWarning("Problemas de integridade detectados nos dados");
                    return false;
                }
                
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro na validação de integridade dos dados");
                return false;
            }
        }

        private async Task<Employee> MapCsvRecordToEmployeeAsync(ColaboradorCsvRecord record, int id)
        {
            var dataAdmissao = ParseDate(record.DataAdmissao);
            var dataUltimaPromocao = ParseDate(record.DataUltimaPromocao);
            var tempoDeCasa = CalculateTenure(dataAdmissao);
            var tempoNoCargo = ParseTimeInMonths(record.TempoCargoAtual) / 12.0;
            var salario = ParseDecimal(record.Salario);
            var faltasInjustificadas = ParseInt(record.FaltasInjustificadas);
            var diasAfastamento = ParseInt(record.DiasAfastamento);
            var numeroAdvertencias = ParseInt(record.NumeroAdvertencias);

            var employee = new Employee
            {
                Id = id,
                Nome = record.Nome ?? string.Empty,
                Matricula = record.Matricula ?? string.Empty,
                Genero = record.Genero ?? string.Empty,
                RacaCor = record.RacaCor ?? string.Empty,
                OrientacaoSexual = record.OrientacaoSexual ?? string.Empty,
                Empresa = record.Empresa ?? string.Empty,
                UnidadeOrganizacional = record.UnidadeOrganizacional ?? string.Empty,
                CentroCustos = record.CentroCustos ?? string.Empty,
                GestorImediato = record.GestorImediato ?? string.Empty,
                CargoAtual = record.CargoAtual ?? string.Empty,
                TabelaSalarial = record.TabelaSalarial ?? string.Empty,
                FaixaSalarial = record.FaixaSalarial ?? string.Empty,
                NivelSalarial = record.NivelSalarial ?? string.Empty,
                Salario = salario,
                DataAdmissao = dataAdmissao,
                DataUltimaPromocao = dataUltimaPromocao,
                ResultadoAvaliacaoDesempenho = record.ResultadoAvaliacaoDesempenho ?? string.Empty,
                DataUltimaAvaliacao = ParseDate(record.DataUltimaAvaliacao),
                NumeroAdvertencias = numeroAdvertencias,
                FaltasInjustificadas = faltasInjustificadas,
                DiasAfastamento = diasAfastamento,
                ProbabilidadeRiscoPerda = record.ProbabilidadeRiscoPerda ?? string.Empty,
                ImpactoPerda = record.ImpactoPerda ?? string.Empty,
                GrauEscolaridade = record.GrauEscolaridade ?? string.Empty,
                CursosConcluidos = record.CursosConcluidos ?? string.Empty,
                CertificacoesRelevantes = record.CertificacoesRelevantes ?? string.Empty,
                IdiomasFalados = record.IdiomasFalados ?? string.Empty,
                AtualizacaoRecenteFormacao = ParseDate(record.AtualizacaoRecenteFormacao),
                TempoCargoAtual = tempoNoCargo,
                TempoDeCasa = tempoDeCasa,
                TempoNoCargo = tempoNoCargo,
                Absenteismo = faltasInjustificadas / 100.0
            };

            // Gerar feedback e calcular scores adicionais
            employee.FeedbackUltimaAvaliacao = GenerateFeedback(employee);
            employee.ScoreSentimento = await _sentimentService.AnalisarSentimentoAsync(employee.FeedbackUltimaAvaliacao);
            employee.IsAbsenteismoAnomalo = await _anomalyDetectorService.DetectarAnomaliaAbsenteismoAsync(
                new List<double> { employee.Absenteismo * 100 });
            
            employee.ScoreExperiencia = CalculateExperienceScore(employee);
            employee.ScoreDiversidade = CalculateDiversityScore(employee);
            employee.ScoreFormacao = CalculateEducationScore(employee);
            
            employee.RiskFactors = IdentifyRiskFactors(employee);
            employee.Strengths = IdentifyStrengths(employee);

            return employee;
        }

        private async Task CalculateScoresAsync(List<Employee> employees)
        {
            var defaultWeights = new Dictionary<string, int>
            {
                ["desempenho"] = 20,
                ["tempoCargo"] = 10,
                ["tempoCasa"] = 10,
                ["riscoPerda"] = 15,
                ["impactoPerda"] = 15,
                ["absenteismo"] = 10,
                ["salario"] = 5,
                ["formacao"] = 5,
                ["diversidade"] = 5,
                ["experiencia"] = 5
            };

            var scoreCalculator = new ScoreCalculatorService();
            
            foreach (var employee in employees)
            {
                employee.Score = scoreCalculator.CalcularScore(employee, employees, defaultWeights);
            }
        }

        // Métodos auxiliares
        private DateTime ParseDate(string? dateString)
        {
            if (string.IsNullOrWhiteSpace(dateString)) return DateTime.Now;
            
            var formats = new[] { "dd/MM/yyyy", "d/M/yyyy", "yyyy-MM-dd" };
            
            foreach (var format in formats)
            {
                if (DateTime.TryParseExact(dateString, format, CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
                {
                    return date;
                }
            }
            
            return DateTime.Now;
        }

        private decimal ParseDecimal(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return 0;
            
            var cleaned = value.Replace("R$", "").Replace(".", "").Replace(",", ".");
            return decimal.TryParse(cleaned, NumberStyles.Any, CultureInfo.InvariantCulture, out var result) ? result : 0;
        }

        private int ParseInt(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return 0;
            return int.TryParse(value, out var result) ? result : 0;
        }

        private double ParseTimeInMonths(string? timeString)
        {
            if (string.IsNullOrWhiteSpace(timeString)) return 0;
            
            var lowerTime = timeString.ToLower();
            var numbers = System.Text.RegularExpressions.Regex.Matches(timeString, @"\d+");
            
            if (numbers.Count == 0) return 0;
            
            var value = int.Parse(numbers[0].Value);
            
            if (lowerTime.Contains("ano")) return value * 12;
            if (lowerTime.Contains("mes")) return value;
            if (lowerTime.Contains("dia")) return Math.Round(value / 30.0);
            
            return value;
        }

        private double CalculateTenure(DateTime admissionDate)
        {
            var diffTime = DateTime.Now - admissionDate;
            return Math.Round(diffTime.TotalDays / 365.25, 1);
        }

        private double CalculateExperienceScore(Employee employee)
        {
            var experienceWeight = Math.Min(employee.TempoDeCasa / 10, 1) * 0.7;
            var stabilityWeight = Math.Min(employee.TempoNoCargo / 5, 1) * 0.3;
            return (experienceWeight + stabilityWeight) * 100;
        }

        private double CalculateDiversityScore(Employee employee)
        {
            double score = 0;
            
            if (employee.Genero != "Masculino") score += 20;
            if (employee.RacaCor != "Branca") score += 20;
            if (employee.OrientacaoSexual != "Heterosexual") score += 20;
            if (employee.GrauEscolaridade.Contains("Superior") || employee.GrauEscolaridade.Contains("Pós")) score += 20;
            if (!string.IsNullOrEmpty(employee.IdiomasFalados) && employee.IdiomasFalados != "Português") score += 20;
            
            return Math.Min(score, 100);
        }

        private double CalculateEducationScore(Employee employee)
        {
            double score = 0;
            
            score += employee.GrauEscolaridade.ToLower() switch
            {
                var x when x.Contains("pós") || x.Contains("mestrado") || x.Contains("doutorado") => 40,
                var x when x.Contains("superior completo") => 30,
                var x when x.Contains("superior incompleto") => 20,
                var x when x.Contains("ensino médio") => 10,
                _ => 5
            };
            
            if (!string.IsNullOrEmpty(employee.CursosConcluidos) && employee.CursosConcluidos != "Nenhuma") score += 20;
            if (!string.IsNullOrEmpty(employee.CertificacoesRelevantes) && employee.CertificacoesRelevantes != "Nenhuma") score += 30;
            
            return Math.Min(score, 100);
        }

        private List<string> IdentifyRiskFactors(Employee employee)
        {
            var factors = new List<string>();
            
            if (employee.ProbabilidadeRiscoPerda.ToLower() == "alto")
                factors.Add("Alto risco de perda identificado");
            
            if (employee.NumeroAdvertencias > 0)
                factors.Add($"{employee.NumeroAdvertencias} advertência(s) nos últimos 12 meses");
            
            if (employee.FaltasInjustificadas > 5)
                factors.Add("Alto índice de faltas injustificadas");
            
            if (employee.DiasAfastamento > 30)
                factors.Add("Muitos dias de afastamento");
            
            var tempoUltimaPromocao = employee.CalcularTempoUltimaPromocao();
            if (tempoUltimaPromocao > 3)
                factors.Add("Sem promoção há mais de 3 anos");
            
            if (employee.ResultadoAvaliacaoDesempenho.ToLower().Contains("não atende"))
                factors.Add("Desempenho abaixo do esperado");
            
            return factors;
        }

        private List<string> IdentifyStrengths(Employee employee)
        {
            var strengths = new List<string>();
            
            if (employee.ResultadoAvaliacaoDesempenho.ToLower().Contains("excede"))
                strengths.Add("Desempenho excepcional");
            
            if (employee.TempoDeCasa > 5)
                strengths.Add("Alta lealdade à empresa");
            
            if (employee.NumeroAdvertencias == 0)
                strengths.Add("Histórico disciplinar limpo");
            
            if (employee.GrauEscolaridade.Contains("Pós") || employee.GrauEscolaridade.Contains("Superior"))
                strengths.Add("Alta qualificação acadêmica");
            
            if (!string.IsNullOrEmpty(employee.CertificacoesRelevantes) && employee.CertificacoesRelevantes != "Nenhuma")
                strengths.Add("Certificações profissionais relevantes");
            
            if (employee.FaltasInjustificadas == 0)
                strengths.Add("Excelente assiduidade");
            
            return strengths;
        }

        private string GenerateFeedback(Employee employee)
        {
            var performance = employee.ResultadoAvaliacaoDesempenho.ToLower();
            var risk = employee.ProbabilidadeRiscoPerda.ToLower();
            
            var feedback = $"{employee.Nome} ";
            
            feedback += performance switch
            {
                var p when p.Contains("excede") => "demonstra desempenho excepcional e é uma referência para a equipe. ",
                var p when p.Contains("atende") => "apresenta desempenho sólido e consistente. ",
                var p when p.Contains("parcialmente") => "tem potencial, mas precisa de desenvolvimento em algumas áreas. ",
                _ => "necessita de atenção e suporte para melhorar o desempenho. "
            };
            
            feedback += risk switch
            {
                "alto" => "Há sinais de que pode estar considerando oportunidades externas. ",
                "médio" => "Demonstra satisfação moderada com a posição atual. ",
                _ => "Mostra-se satisfeito e engajado com a empresa. "
            };
            
            if (employee.NumeroAdvertencias > 0)
                feedback += $"Teve {employee.NumeroAdvertencias} advertência(s) que requer atenção. ";
            
            var tempoUltimaPromocao = employee.CalcularTempoUltimaPromocao();
            if (tempoUltimaPromocao > 2)
                feedback += "Pode se beneficiar de discussões sobre crescimento na carreira. ";
            
            return feedback.Trim();
        }

        private Dictionary<string, object> GetDepartmentMetrics(List<Employee> employees)
        {
            return employees
                .GroupBy(e => e.Area)
                .ToDictionary(
                    g => g.Key,
                    g => (object)new
                    {
                        count = g.Count(),
                        averageScore = g.Average(e => e.Score),
                        highRisk = g.Count(e => e.IsAtRisk()),
                        averageSalary = g.Average(e => (double)e.Salario),
                        diversityScore = g.Average(e => e.ScoreDiversidade)
                    }
                );
        }

        private Dictionary<string, int> GetRiskDistribution(List<Employee> employees)
        {
            return new Dictionary<string, int>
            {
                ["alto"] = employees.Count(e => e.RiscoPerdaTexto.ToLower() == "alto"),
                ["medio"] = employees.Count(e => e.RiscoPerdaTexto.ToLower() == "médio"),
                ["baixo"] = employees.Count(e => e.RiscoPerdaTexto.ToLower() == "baixo")
            };
        }

        private Dictionary<string, object> GetDiversityMetrics(List<Employee> employees)
        {
            return new Dictionary<string, object>
            {
                ["genero"] = employees.GroupBy(e => e.Genero).ToDictionary(g => g.Key, g => g.Count()),
                ["racaCor"] = employees.GroupBy(e => e.RacaCor).ToDictionary(g => g.Key, g => g.Count()),
                ["orientacaoSexual"] = employees.GroupBy(e => e.OrientacaoSexual).ToDictionary(g => g.Key, g => g.Count()),
                ["grauEscolaridade"] = employees.GroupBy(e => e.GrauEscolaridade).ToDictionary(g => g.Key, g => g.Count())
            };
        }
    }
}