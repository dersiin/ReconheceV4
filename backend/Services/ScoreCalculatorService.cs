using ReconheceAi.Api.Models;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ReconheceAi.Api.Services
{
    public class ScoreCalculatorService : IScoreCalculatorService
    {
        private readonly ILogger<ScoreCalculatorService> _logger;

        public ScoreCalculatorService(ILogger<ScoreCalculatorService> logger)
        {
            _logger = logger;
        }

        public double CalcularScore(Employee colaborador, List<Employee> todosColaboradores, Dictionary<string, int> weights)
        {
            try
            {
                if (colaborador == null || todosColaboradores == null || weights == null)
                {
                    _logger.LogWarning("Parâmetros inválidos para cálculo de score");
                    return 0;
                }

                var totalWeights = weights.Values.Sum();
                if (totalWeights == 0)
                {
                    _logger.LogWarning("Soma dos pesos é zero");
                    return 0;
                }

                // Normalização baseada nos máximos da população
                var maxTempoCasa = todosColaboradores.Any() ? todosColaboradores.Max(c => c.TempoDeCasa) : 1;
                var maxTempoCargo = todosColaboradores.Any() ? todosColaboradores.Max(c => c.TempoNoCargo) : 1;
                var maxSalario = todosColaboradores.Any() ? todosColaboradores.Max(c => (double)c.Salario) : 1;

                // Componentes do score
                var desempenhoScore = ConverterTextoParaNumero("desempenho", colaborador.DesempenhoTexto);
                var tempoCargoScore = Normalize(colaborador.TempoNoCargo, maxTempoCargo);
                var tempoCasaScore = Normalize(colaborador.TempoDeCasa, maxTempoCasa);
                var riscoScore = ConverterTextoParaNumero("risco", colaborador.RiscoPerdaTexto);
                var impactoScore = ConverterTextoParaNumero("impacto", colaborador.ImpactoPerdaTexto);
                var absenteismoScore = 1 - colaborador.Absenteismo;
                var salarioScore = CalculateSalaryScore(colaborador, todosColaboradores);
                var formacaoScore = colaborador.ScoreFormacao / 100.0;
                var diversidadeScore = colaborador.ScoreDiversidade / 100.0;
                var experienciaScore = colaborador.ScoreExperiencia / 100.0;

                // Cálculo ponderado
                var scoreBase = 
                    (desempenhoScore * GetWeight(weights, "desempenho", totalWeights)) +
                    (tempoCargoScore * GetWeight(weights, "tempoCargo", totalWeights)) +
                    (tempoCasaScore * GetWeight(weights, "tempoCasa", totalWeights)) +
                    (riscoScore * GetWeight(weights, "riscoPerda", totalWeights)) +
                    (impactoScore * GetWeight(weights, "impactoPerda", totalWeights)) +
                    (absenteismoScore * GetWeight(weights, "absenteismo", totalWeights)) +
                    (salarioScore * GetWeight(weights, "salario", totalWeights)) +
                    (formacaoScore * GetWeight(weights, "formacao", totalWeights)) +
                    (diversidadeScore * GetWeight(weights, "diversidade", totalWeights)) +
                    (experienciaScore * GetWeight(weights, "experiencia", totalWeights));

                // Aplicar penalidades
                var penalidadeAdvertencias = Math.Min(colaborador.Advertencias * 0.05, 0.20);
                var penalidadeAfastamento = Math.Min(colaborador.DiasAfastamento * 0.001, 0.10);
                var penalidadeSentimento = colaborador.ScoreSentimento * 0.05;

                var scoreComPenalidades = scoreBase * (1 - penalidadeAdvertencias - penalidadeAfastamento - penalidadeSentimento);

                // Aplicar bônus para top performers
                if (colaborador.IsHighPerformer() && colaborador.TempoDeCasa > 2)
                {
                    scoreComPenalidades *= 1.05; // 5% de bônus
                }

                var scoreFinal = Math.Round(scoreComPenalidades * 500, 1);
                
                _logger.LogDebug("Score calculado para {Nome}: {Score}", colaborador.Nome, scoreFinal);
                
                return Math.Max(0, Math.Min(500, scoreFinal));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao calcular score para {Nome}", colaborador?.Nome);
                return 0;
            }
        }

        public Dictionary<string, double> CalcularScoreDetalhado(Employee colaborador, List<Employee> todosColaboradores, Dictionary<string, int> weights)
        {
            var detalhes = new Dictionary<string, double>();
            
            try
            {
                var totalWeights = weights.Values.Sum();
                if (totalWeights == 0) return detalhes;

                var maxTempoCasa = todosColaboradores.Any() ? todosColaboradores.Max(c => c.TempoDeCasa) : 1;
                var maxTempoCargo = todosColaboradores.Any() ? todosColaboradores.Max(c => c.TempoNoCargo) : 1;

                detalhes["desempenho"] = ConverterTextoParaNumero("desempenho", colaborador.DesempenhoTexto) * 100;
                detalhes["tempoCargo"] = Normalize(colaborador.TempoNoCargo, maxTempoCargo) * 100;
                detalhes["tempoCasa"] = Normalize(colaborador.TempoDeCasa, maxTempoCasa) * 100;
                detalhes["riscoPerda"] = ConverterTextoParaNumero("risco", colaborador.RiscoPerdaTexto) * 100;
                detalhes["impactoPerda"] = ConverterTextoParaNumero("impacto", colaborador.ImpactoPerdaTexto) * 100;
                detalhes["absenteismo"] = (1 - colaborador.Absenteismo) * 100;
                detalhes["salario"] = CalculateSalaryScore(colaborador, todosColaboradores) * 100;
                detalhes["formacao"] = colaborador.ScoreFormacao;
                detalhes["diversidade"] = colaborador.ScoreDiversidade;
                detalhes["experiencia"] = colaborador.ScoreExperiencia;
                
                detalhes["scoreTotal"] = CalcularScore(colaborador, todosColaboradores, weights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao calcular score detalhado para {Nome}", colaborador?.Nome);
            }

            return detalhes;
        }

        public double CalcularScoreNormalizado(Employee colaborador, List<Employee> todosColaboradores)
        {
            if (!todosColaboradores.Any()) return 0;
            
            var scores = todosColaboradores.Select(e => e.Score).ToList();
            var minScore = scores.Min();
            var maxScore = scores.Max();
            
            if (maxScore == minScore) return 50; // Se todos têm o mesmo score
            
            return ((colaborador.Score - minScore) / (maxScore - minScore)) * 100;
        }

        public List<string> IdentificarAreasMelhoria(Employee colaborador, List<Employee> todosColaboradores)
        {
            var areas = new List<string>();
            
            try
            {
                var scoreDetalhado = CalcularScoreDetalhado(colaborador, todosColaboradores, GetDefaultWeights());
                
                foreach (var item in scoreDetalhado.Where(s => s.Value < 60 && s.Key != "scoreTotal"))
                {
                    areas.Add(GetAreaMelhoriaDescricao(item.Key, item.Value));
                }
                
                // Análises específicas
                if (colaborador.ScoreSentimento > 0.6)
                    areas.Add("Trabalhar satisfação e engajamento do colaborador");
                
                if (colaborador.IsAbsenteismoAnomalo)
                    areas.Add("Investigar e reduzir padrão de absenteísmo");
                
                if (colaborador.CalcularTempoUltimaPromocao() > 3)
                    areas.Add("Avaliar oportunidades de crescimento e promoção");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao identificar áreas de melhoria para {Nome}", colaborador?.Nome);
            }
            
            return areas;
        }

        // Métodos auxiliares privados
        private double ConverterTextoParaNumero(string tipo, string? texto)
        {
            if (string.IsNullOrEmpty(texto)) return 0.0;

            var maps = new Dictionary<string, Dictionary<string, double>>
            {
                ["risco"] = new() { { "alto", 1.0 }, { "médio", 0.5 }, { "baixo", 0.1 } },
                ["impacto"] = new() { 
                    { "estratégico", 1.0 }, { "alto", 1.0 }, { "crítico", 1.0 }, 
                    { "médio", 0.5 }, { "moderado", 0.5 }, { "baixo", 0.1 } 
                },
                ["desempenho"] = new() { 
                    { "excepcional", 1.0 }, { "excede", 1.0 }, { "acima do esperado", 0.8 }, 
                    { "excelente", 0.9 }, { "bom", 0.75 }, { "atende", 0.7 }, 
                    { "parcialmente atende", 0.6 }, { "regular", 0.6 }, 
                    { "abaixo do esperado", 0.3 }, { "não atende", 0.2 } 
                }
            };

            if (maps.TryGetValue(tipo, out var map))
            {
                var key = texto.ToLower().Trim();
                return map.TryGetValue(key, out var value) ? value : 0.0;
            }

            return 0.0;
        }

        private double Normalize(double value, double max) => max > 0 ? Math.Min(value / max, 1) : 0;

        private double GetWeight(Dictionary<string, int> weights, string key, int totalWeights)
        {
            return weights.TryGetValue(key, out var weight) ? (double)weight / totalWeights : 0;
        }

        private double CalculateSalaryScore(Employee colaborador, List<Employee> todosColaboradores)
        {
            var sameCargo = todosColaboradores.Where(e => e.CargoAtual == colaborador.CargoAtual).ToList();
            if (!sameCargo.Any()) return 0.5;

            var salarios = sameCargo.Select(e => (double)e.Salario).OrderBy(s => s).ToList();
            var position = salarios.BinarySearch((double)colaborador.Salario);
            
            if (position < 0) position = ~position;
            
            return salarios.Count > 1 ? (double)position / (salarios.Count - 1) : 0.5;
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

        private string GetAreaMelhoriaDescricao(string area, double score)
        {
            return area switch
            {
                "desempenho" => $"Melhorar performance geral (atual: {score:F1}%)",
                "tempoCargo" => "Desenvolver experiência na função atual",
                "tempoCasa" => "Fortalecer vínculo com a empresa",
                "riscoPerda" => "Reduzir fatores de risco de saída",
                "impactoPerda" => "Aumentar contribuição estratégica",
                "absenteismo" => "Melhorar assiduidade e presença",
                "salario" => "Revisar adequação salarial",
                "formacao" => "Investir em qualificação e certificações",
                "diversidade" => "Ampliar contribuição para diversidade",
                "experiencia" => "Desenvolver experiência e estabilidade",
                _ => $"Melhorar {area}"
            };
        }
    }
}