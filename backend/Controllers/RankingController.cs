using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ReconheceAi.Api.Models;
using ReconheceAi.Api.Services;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace ReconheceAi.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class RankingController : ControllerBase
    {
        private readonly IDataService _dataService;
        private readonly IScoreCalculatorService _scoreCalculator;
        private readonly ILlmService _llmService;
        private readonly ILogger<RankingController> _logger;

        public RankingController(
            IDataService dataService,
            IScoreCalculatorService scoreCalculator,
            ILlmService llmService,
            ILogger<RankingController> logger)
        {
            _dataService = dataService;
            _scoreCalculator = scoreCalculator;
            _llmService = llmService;
            _logger = logger;
        }

        /// <summary>
        /// Obtém a lista completa de colaboradores com seus scores
        /// </summary>
        /// <returns>Lista de colaboradores</returns>
        [HttpGet]
        [ProducesResponseType(typeof(List<Employee>), 200)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetRanking()
        {
            try
            {
                _logger.LogInformation("Iniciando busca de ranking de colaboradores");
                
                var colaboradores = await _dataService.LoadEmployeesFromCsvAsync();
                
                _logger.LogInformation("Retornando {Count} colaboradores", colaboradores.Count);
                
                return Ok(colaboradores);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar ranking de colaboradores");
                return StatusCode(500, new { error = "Erro interno do servidor", message = ex.Message });
            }
        }

        /// <summary>
        /// Obtém colaborador específico por ID
        /// </summary>
        /// <param name="id">ID do colaborador</param>
        /// <returns>Dados do colaborador</returns>
        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(Employee), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> GetEmployee([Range(1, int.MaxValue)] int id)
        {
            try
            {
                _logger.LogInformation("Buscando colaborador com ID: {Id}", id);
                
                var employee = await _dataService.GetEmployeeByIdAsync(id);
                
                if (employee == null)
                {
                    _logger.LogWarning("Colaborador com ID {Id} não encontrado", id);
                    return NotFound(new { error = "Colaborador não encontrado", id });
                }
                
                return Ok(employee);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar colaborador {Id}", id);
                return StatusCode(500, new { error = "Erro interno do servidor", message = ex.Message });
            }
        }

        /// <summary>
        /// Obtém colaboradores por departamento
        /// </summary>
        /// <param name="department">Nome do departamento</param>
        /// <returns>Lista de colaboradores do departamento</returns>
        [HttpGet("department/{department}")]
        [ProducesResponseType(typeof(List<Employee>), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> GetEmployeesByDepartment([Required] string department)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(department))
                {
                    return BadRequest(new { error = "Nome do departamento é obrigatório" });
                }

                _logger.LogInformation("Buscando colaboradores do departamento: {Department}", department);
                
                var employees = await _dataService.GetEmployeesByDepartmentAsync(department);
                
                return Ok(employees);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar colaboradores do departamento {Department}", department);
                return StatusCode(500, new { error = "Erro interno do servidor", message = ex.Message });
            }
        }

        /// <summary>
        /// Obtém colaboradores de alto risco
        /// </summary>
        /// <returns>Lista de colaboradores de alto risco</returns>
        [HttpGet("high-risk")]
        [ProducesResponseType(typeof(List<Employee>), 200)]
        public async Task<IActionResult> GetHighRiskEmployees()
        {
            try
            {
                _logger.LogInformation("Buscando colaboradores de alto risco");
                
                var employees = await _dataService.GetHighRiskEmployeesAsync();
                
                return Ok(employees);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao buscar colaboradores de alto risco");
                return StatusCode(500, new { error = "Erro interno do servidor", message = ex.Message });
            }
        }

        /// <summary>
        /// Gera análise detalhada de um colaborador
        /// </summary>
        /// <param name="request">Dados da requisição de análise</param>
        /// <returns>Análise gerada pela IA</returns>
        [HttpPost("analyse")]
        [ProducesResponseType(typeof(AnalysisResponse), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Analyse([FromBody] AnalysisRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                if (!request.IsValidWeights())
                {
                    return BadRequest(new { error = "Pesos inválidos. A soma deve ser 100 e todos os valores entre 0 e 100." });
                }

                _logger.LogInformation("Iniciando análise para colaborador {Id} - Tipo: {Type}", 
                    request.ColaboradorId, request.AnalysisType);

                var todosColaboradores = await _dataService.LoadEmployeesFromCsvAsync();
                var colaboradorSelecionado = todosColaboradores.FirstOrDefault(c => c.Id == request.ColaboradorId);
                
                if (colaboradorSelecionado == null)
                {
                    return NotFound(new { error = "Colaborador não encontrado", id = request.ColaboradorId });
                }

                // Recalcula score com os pesos fornecidos
                colaboradorSelecionado.Score = _scoreCalculator.CalcularScore(
                    colaboradorSelecionado, todosColaboradores, request.Weights);

                // Gera análise com IA
                var analise = await _llmService.GerarAnalise(colaboradorSelecionado, request.AnalysisType);

                var response = new AnalysisResponse
                {
                    Analise = analise,
                    Score = colaboradorSelecionado.Score,
                    AnalysisType = request.AnalysisType,
                    GeneratedAt = DateTime.UtcNow,
                    Metadata = new Dictionary<string, object>
                    {
                        ["employeeId"] = colaboradorSelecionado.Id,
                        ["employeeName"] = colaboradorSelecionado.Nome,
                        ["department"] = colaboradorSelecionado.Area,
                        ["riskLevel"] = colaboradorSelecionado.RiscoPerdaTexto,
                        ["weights"] = request.Weights
                    }
                };

                _logger.LogInformation("Análise gerada com sucesso para colaborador {Id}", request.ColaboradorId);
                
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao gerar análise para colaborador {Id}", request?.ColaboradorId);
                return StatusCode(500, new { error = "Erro interno do servidor", message = ex.Message });
            }
        }

        /// <summary>
        /// Obtém score detalhado de um colaborador
        /// </summary>
        /// <param name="id">ID do colaborador</param>
        /// <param name="weights">Pesos para cálculo (opcional)</param>
        /// <returns>Score detalhado por componente</returns>
        [HttpPost("{id:int}/score")]
        [ProducesResponseType(typeof(Dictionary<string, double>), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetDetailedScore(
            [Range(1, int.MaxValue)] int id, 
            [FromBody] Dictionary<string, int>? weights = null)
        {
            try
            {
                var todosColaboradores = await _dataService.LoadEmployeesFromCsvAsync();
                var colaborador = todosColaboradores.FirstOrDefault(c => c.Id == id);
                
                if (colaborador == null)
                {
                    return NotFound(new { error = "Colaborador não encontrado", id });
                }

                weights ??= GetDefaultWeights();

                var scoreDetalhado = _scoreCalculator.CalcularScoreDetalhado(colaborador, todosColaboradores, weights);
                var areasMelhoria = _scoreCalculator.IdentificarAreasMelhoria(colaborador, todosColaboradores);

                var response = new
                {
                    employeeId = id,
                    employeeName = colaborador.Nome,
                    scoreComponents = scoreDetalhado,
                    improvementAreas = areasMelhoria,
                    weights,
                    calculatedAt = DateTime.UtcNow
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao calcular score detalhado para colaborador {Id}", id);
                return StatusCode(500, new { error = "Erro interno do servidor", message = ex.Message });
            }
        }

        /// <summary>
        /// Obtém métricas do dashboard
        /// </summary>
        /// <returns>Métricas agregadas</returns>
        [HttpGet("dashboard/metrics")]
        [ProducesResponseType(typeof(Dictionary<string, object>), 200)]
        public async Task<IActionResult> GetDashboardMetrics()
        {
            try
            {
                _logger.LogInformation("Calculando métricas do dashboard");
                
                var metrics = await _dataService.GetDashboardMetricsAsync();
                
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao calcular métricas do dashboard");
                return StatusCode(500, new { error = "Erro interno do servidor", message = ex.Message });
            }
        }

        /// <summary>
        /// Valida integridade dos dados
        /// </summary>
        /// <returns>Status da validação</returns>
        [HttpGet("validate")]
        [ProducesResponseType(typeof(object), 200)]
        public async Task<IActionResult> ValidateData()
        {
            try
            {
                var isValid = await _dataService.ValidateDataIntegrityAsync();
                
                return Ok(new 
                { 
                    isValid, 
                    message = isValid ? "Dados íntegros" : "Problemas detectados nos dados",
                    validatedAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro na validação de dados");
                return StatusCode(500, new { error = "Erro interno do servidor", message = ex.Message });
            }
        }

        private Dictionary<string, int> GetDefaultWeights()
        {
            return new Dictionary<string, int>
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
        }
    }
}