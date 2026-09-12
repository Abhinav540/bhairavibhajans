interface FunnelStep {
  label: string;
  value: number;
}

function pct(partial: number, total: number): string {
  if (!total) return "—";
  return `${((partial / total) * 100).toFixed(1)}%`;
}

export function ConversionFunnel({
  visitors,
  whatsapp,
  enquiries,
  confirmed,
}: {
  visitors: number;
  whatsapp: number;
  enquiries: number;
  confirmed: number;
}) {
  const steps: FunnelStep[] = [
    { label: "Website Visitors", value: visitors },
    { label: "WhatsApp Clicks", value: whatsapp },
    { label: "Enquiries", value: enquiries },
    { label: "Confirmed Bookings", value: confirmed },
  ];

  const max = Math.max(visitors, 1);
  const rates = [
    pct(whatsapp, visitors),
    pct(enquiries, whatsapp),
    pct(confirmed, enquiries),
  ];

  return (
    <section className="admin-section glass-card">
      <div className="admin-section-header">
        <h2>Conversion Funnel</h2>
      </div>
      <div className="funnel">
        {steps.map((step, i) => {
          if (step.value === 0 && i > 0 && steps[i - 1].value === 0) {
            return null;
          }
          const width = Math.max((step.value / max) * 100, step.value > 0 ? 12 : 4);
          return (
            <div key={step.label} className="funnel-row">
              <div className="funnel-track">
                <div className="funnel-fill" style={{ width: `${width}%` }}>
                  <span className="funnel-value">{step.value.toLocaleString()}</span>
                </div>
              </div>
              <div className="funnel-meta">
                <span className="funnel-label">{step.label}</span>
                {i < rates.length && <span className="funnel-rate">{rates[i]}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}