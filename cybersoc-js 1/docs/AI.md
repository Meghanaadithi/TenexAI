# AI / Anomaly Detection (JavaScript)

Explainable heuristics — no training required.

## Signals
- **IP bursts** per minute (z-score >= 3)
- **Error spikes** (4xx/5xx) by user/IP (threshold >=10 or z>=2.5)
- **Rare domain + large bytes** (>5MB & ≤1% frequency)
- **Unusual methods** (CONNECT/TRACE/TRACK)

Each anomaly has a human-readable **reason** and **confidence** in [0..1].
Optional LLM summary can be toggled via env; not required for the exercise.
