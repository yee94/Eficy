import { BarChart, Bar, Tooltip, Legend, Recharts, type TooltipProps } from '../index';

const tooltip: TooltipProps<number, string> = { isAnimationActive: false };
const chart = <BarChart data={[{ value: 128 }]}>
  <Bar dataKey="value" />
  <Tooltip<number, string> {...tooltip} />
  <Legend />
</BarChart>;
const namespaceChart: typeof BarChart = Recharts.BarChart;
void namespaceChart;
void chart;
