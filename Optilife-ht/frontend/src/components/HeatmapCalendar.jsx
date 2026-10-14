// Calendar-style grid of the last 90 days. Shade shows how many routines were completed.
export default function HeatmapCalendar({ history }) {
  // Pick a shade: none, low (up to 33%), medium (up to 66%), high (above 66%)
  function levelFor(day) {
    if (!day.completed) return 'level-0';
    if (day.percentage <= 33) return 'level-1';
    if (day.percentage <= 66) return 'level-2';
    return 'level-3';
  }

  return (
    <div>
      <div className="heatmap">
        {history.map((day) => (
          <div
            key={day.date}
            className={`heat-cell ${levelFor(day)}`}
            title={`${day.date}: ${day.completed} of ${day.scheduled} routines`}
          />
        ))}
      </div>

      <div className="heat-legend">
        <span className="heat-legend-item"><span className="heat-cell level-0" /> No activity</span>
        <span className="heat-legend-item"><span className="heat-cell level-1" /> Low</span>
        <span className="heat-legend-item"><span className="heat-cell level-2" /> Medium</span>
        <span className="heat-legend-item"><span className="heat-cell level-3" /> High</span>
      </div>
    </div>
  );
}
