import type { DashboardChartPoint } from '../types';

type InboundOutboundChartProps = {
  data: DashboardChartPoint[];
  loading?: boolean;
};

const CHART_HEIGHT = 220;
const CHART_TOP_PADDING = 16;
const BAR_GAP_RATIO = 0.35;

function formatDateLabel(iso: string) {
  const [, month, day] = iso.split('-');
  return `${day}/${month}`;
}

export function InboundOutboundChart({ data, loading }: InboundOutboundChartProps) {
  if (loading) {
    return <div className="chart-empty">Đang tải biểu đồ…</div>;
  }

  if (!data.length) {
    return <div className="chart-empty">Chưa có dữ liệu để hiển thị.</div>;
  }

  const maxValue = Math.max(1, ...data.map((d) => Math.max(d.inbound, d.outbound)));
  const groupWidth = 100 / data.length;
  const barWidth = groupWidth * (1 - BAR_GAP_RATIO) * 0.5;

  return (
    <div className="chart-wrap">
      <svg
        className="chart-svg"
        viewBox={`0 0 100 ${CHART_HEIGHT}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Biểu đồ số lượng nhập xuất kho theo ngày"
      >
        {[0.25, 0.5, 0.75, 1].map((f) => {
          const y = CHART_TOP_PADDING + (CHART_HEIGHT - CHART_TOP_PADDING - 24) * (1 - f);
          return (
            <line
              key={f}
              x1={0}
              x2={100}
              y1={y}
              y2={y}
              className="chart-gridline"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}

        {data.map((point, i) => {
          const usableHeight = CHART_HEIGHT - CHART_TOP_PADDING - 24;
          const inboundH = (point.inbound / maxValue) * usableHeight;
          const outboundH = (point.outbound / maxValue) * usableHeight;
          const groupStart = i * groupWidth + groupWidth * (BAR_GAP_RATIO / 2);

          return (
            <g key={point.date}>
              <rect
                x={groupStart}
                y={CHART_TOP_PADDING + usableHeight - inboundH}
                width={barWidth}
                height={inboundH}
                className="chart-bar chart-bar-inbound"
              >
                <title>{`${point.date}: Nhập ${point.inbound}`}</title>
              </rect>
              <rect
                x={groupStart + barWidth}
                y={CHART_TOP_PADDING + usableHeight - outboundH}
                width={barWidth}
                height={outboundH}
                className="chart-bar chart-bar-outbound"
              >
                <title>{`${point.date}: Xuất ${point.outbound}`}</title>
              </rect>
            </g>
          );
        })}
      </svg>

      <div className="chart-x-axis">
        {data.map((point, i) => {
          // Với chuỗi ngày dài, chỉ hiện nhãn cách quãng để tránh chồng chữ
          const showLabel =
            data.length <= 14 || i === 0 || i === data.length - 1 || i % Math.ceil(data.length / 10) === 0;
          return (
            <span key={point.date} className="chart-x-label">
              {showLabel ? formatDateLabel(point.date) : ''}
            </span>
          );
        })}
      </div>

      <div className="chart-legend">
        <span className="chart-legend-item">
          <i className="chart-legend-dot chart-legend-dot-inbound" /> Nhập kho
        </span>
        <span className="chart-legend-item">
          <i className="chart-legend-dot chart-legend-dot-outbound" /> Xuất kho
        </span>
      </div>
    </div>
  );
}
