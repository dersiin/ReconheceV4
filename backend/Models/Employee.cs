using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ReconheceAi.Api.Models
{
    public class Employee
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Nome { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(20)]
        public string Matricula { get; set; } = string.Empty;
        
        [MaxLength(20)]
        public string Genero { get; set; } = string.Empty;
        
        [MaxLength(30)]
        public string RacaCor { get; set; } = string.Empty;
        
        [MaxLength(30)]
        public string OrientacaoSexual { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string Empresa { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string UnidadeOrganizacional { get; set; } = string.Empty;
        
        [MaxLength(20)]
        public string CentroCustos { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string GestorImediato { get; set; } = string.Empty;
        
        [MaxLength(50)]
        public string CargoAtual { get; set; } = string.Empty;
        
        [MaxLength(50)]
        public string TabelaSalarial { get; set; } = string.Empty;
        
        [MaxLength(50)]
        public string FaixaSalarial { get; set; } = string.Empty;
        
        [MaxLength(30)]
        public string NivelSalarial { get; set; } = string.Empty;
        
        [Range(0, double.MaxValue)]
        public decimal Salario { get; set; }
        
        public DateTime DataAdmissao { get; set; }
        
        public DateTime DataUltimaPromocao { get; set; }
        
        [MaxLength(50)]
        public string ResultadoAvaliacaoDesempenho { get; set; } = string.Empty;
        
        public DateTime DataUltimaAvaliacao { get; set; }
        
        [Range(0, int.MaxValue)]
        public int NumeroAdvertencias { get; set; }
        
        [Range(0, int.MaxValue)]
        public int FaltasInjustificadas { get; set; }
        
        [Range(0, int.MaxValue)]
        public int DiasAfastamento { get; set; }
        
        [MaxLength(30)]
        public string ProbabilidadeRiscoPerda { get; set; } = string.Empty;
        
        [MaxLength(30)]
        public string ImpactoPerda { get; set; } = string.Empty;
        
        [MaxLength(50)]
        public string GrauEscolaridade { get; set; } = string.Empty;
        
        [MaxLength(200)]
        public string CursosConcluidos { get; set; } = string.Empty;
        
        [MaxLength(200)]
        public string CertificacoesRelevantes { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string IdiomasFalados { get; set; } = string.Empty;
        
        public DateTime AtualizacaoRecenteFormacao { get; set; }
        
        [Range(0, double.MaxValue)]
        public double TempoCargoAtual { get; set; }
        
        // Campos calculados
        public string Area => UnidadeOrganizacional;
        public string DesempenhoTexto => ResultadoAvaliacaoDesempenho;
        public string RiscoPerdaTexto => ProbabilidadeRiscoPerda;
        public string ImpactoPerdaTexto => ImpactoPerda;
        
        [Range(0, double.MaxValue)]
        public double TempoDeCasa { get; set; }
        
        [Range(0, double.MaxValue)]
        public double TempoNoCargo { get; set; }
        
        [Range(0, 1)]
        public double Absenteismo { get; set; }
        
        public int Advertencias => NumeroAdvertencias;
        
        [Range(0, 500)]
        public double Score { get; set; }
        
        [Range(0, double.MaxValue)]
        public double ReajusteSugerido { get; set; }
        
        public string FeedbackUltimaAvaliacao { get; set; } = string.Empty;
        
        [Range(0, 1)]
        public double ScoreSentimento { get; set; }
        
        public bool IsAbsenteismoAnomalo { get; set; }
        
        [Range(0, 100)]
        public double ScoreExperiencia { get; set; }
        
        [Range(0, 100)]
        public double ScoreDiversidade { get; set; }
        
        [Range(0, 100)]
        public double ScoreFormacao { get; set; }
        
        public List<string> RiskFactors { get; set; } = new();
        public List<string> Strengths { get; set; } = new();
        
        // Métodos auxiliares
        public double CalcularTempoDeCasa()
        {
            var diffTime = DateTime.Now - DataAdmissao;
            return Math.Round(diffTime.TotalDays / 365.25, 1);
        }
        
        public double CalcularTempoUltimaPromocao()
        {
            var diffTime = DateTime.Now - DataUltimaPromocao;
            return Math.Round(diffTime.TotalDays / 365.25, 1);
        }
        
        public bool IsHighPerformer() => Score >= 400;
        public bool IsTopTalent() => Score >= 450;
        public bool IsAtRisk() => RiscoPerdaTexto?.ToLower() == "alto";
        public bool IsCriticalImpact() => ImpactoPerdaTexto?.ToLower() is "alto" or "crítico" or "estratégico";
    }
}