public record Colaborador
{
    public int Id { get; init; }
    public string? Nome { get; init; }
    public string? Area { get; init; }
    public string? DesempenhoTexto { get; init; }
    public string? RiscoPerdaTexto { get; init; }
    public string? ImpactoPerdaTexto { get; init; }
    public double TempoDeCasa { get; init; }
    public double TempoNoCargo { get; init; }
    public double Absenteismo { get; init; }
    public int Advertencias { get; init; }
    public double Score { get; set; }
    public double ReajusteSugerido { get; set; }
    public string? FeedbackUltimaAvaliacao { get; init; }
    public double ScoreSentimento { get; set; } = 0.5;
    public bool IsAbsenteismoAnomalo { get; set; } = false;
}

public record BudgetRequest(decimal Budget);