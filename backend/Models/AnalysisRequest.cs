using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ReconheceAi.Api.Models
{
    public class AnalysisRequest
    {
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "ColaboradorId deve ser maior que 0")]
        public int ColaboradorId { get; set; }
        
        [Required]
        [RegularExpression("^(risk|impact|recognition|development|diversity)$", 
            ErrorMessage = "AnalysisType deve ser: risk, impact, recognition, development ou diversity")]
        public string AnalysisType { get; set; } = string.Empty;
        
        [Required]
        public Dictionary<string, int> Weights { get; set; } = new();
        
        // Validação customizada para pesos
        public bool IsValidWeights()
        {
            if (Weights == null || Weights.Count == 0) return false;
            
            var totalWeight = 0;
            foreach (var weight in Weights.Values)
            {
                if (weight < 0 || weight > 100) return false;
                totalWeight += weight;
            }
            
            return totalWeight == 100;
        }
    }
    
    public class BudgetRequest
    {
        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Budget deve ser maior ou igual a 0")]
        public decimal Budget { get; set; }
    }
    
    public class AnalysisResponse
    {
        public string Analise { get; set; } = string.Empty;
        public double Score { get; set; }
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
        public string AnalysisType { get; set; } = string.Empty;
        public Dictionary<string, object> Metadata { get; set; } = new();
    }
}