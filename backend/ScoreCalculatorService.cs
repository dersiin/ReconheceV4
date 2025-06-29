using System;
using System.Collections.Generic;
using System.Linq;

// O "contrato" do nosso serviço de cálculo
public interface IScoreCalculatorService
{
    double CalcularScore(Colaborador c, List<Colaborador> all, Dictionary<string, int> weights);
}

// implementação da lógica
public class ScoreCalculatorService : IScoreCalculatorService
{
    private double ConverterTextoParaNumero(string tipo, string? texto)
    {
        if (string.IsNullOrEmpty(texto)) return 0.0;
        var map = new Dictionary<string, Dictionary<string, double>>
        {
            ["risco"] = new() { { "alto", 1.0 }, { "médio", 0.5 }, { "baixo", 0.1 } },
            ["impacto"] = new() { { "estratégico", 1.0 }, { "alto", 1.0 }, { "crítico", 1.0 }, { "médio", 0.5 }, { "moderado", 0.5 }, { "baixo", 0.1 } },
            ["desempenho"] = new() { { "excepcional", 1.0 }, { "acima do esperado", 0.8 }, {"excelente", 0.9}, {"bom", 0.75}, {"regular", 0.6}, { "abaixo do esperado", 0.3 } }
        };
        return map.ContainsKey(tipo) && map[tipo].ContainsKey(texto.ToLower()) ? map[tipo][texto.ToLower()] : 0.0;
    }

    private double Normalize(double value, double max) => (max > 0) ? (value / max) : 0;

    public double CalcularScore(Colaborador c, List<Colaborador> all, Dictionary<string, int> weights)
    {
        double maxTempoCasa = all.Any() ? all.Max(i => i.TempoDeCasa) : 1;
        double maxTempoCargo = all.Any() ? all.Max(i => i.TempoNoCargo) : 1;

        var totalWeights = weights.Values.Sum();
        if (totalWeights == 0) return 0;
        
        double scoreBase =
            (ConverterTextoParaNumero("desempenho", c.DesempenhoTexto) * (weights["desempenho"] / (double)totalWeights)) +
            (Normalize(c.TempoNoCargo, maxTempoCargo) * (weights["tempoCargo"] / (double)totalWeights)) +
            (Normalize(c.TempoDeCasa, maxTempoCasa) * (weights["tempoCasa"] / (double)totalWeights)) +
            (ConverterTextoParaNumero("risco", c.RiscoPerdaTexto) * (weights["riscoPerda"] / (double)totalWeights)) +
            (ConverterTextoParaNumero("impacto", c.ImpactoPerdaTexto) * (weights["impactoPerda"] / (double)totalWeights)) +
            ((1 - c.Absenteismo) * (weights["absenteismo"] / (double)totalWeights));

        double penalidadePercentual = Math.Min(c.Advertencias * 0.10, 0.30);
        return Math.Round((scoreBase * (1 - penalidadePercentual)) * 500, 1);
    }
}