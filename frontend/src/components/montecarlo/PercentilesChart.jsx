import {
  Box,
  Typography,
} from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value || 0));
};

const PercentilesChart = ({
  p50 = 0,
  p90 = 0,
  p95 = 0,
  p99 = 0,
}) => {
  const data = [
    {
      percentil: "P50",
      valor: Number(p50 || 0),
    },
    {
      percentil: "P90",
      valor: Number(p90 || 0),
    },
    {
      percentil: "P95",
      valor: Number(p95 || 0),
    },
    {
      percentil: "P99",
      valor: Number(p99 || 0),
    },
  ];

  const hasData = data.some(
    (item) => item.valor > 0
  );

  if (!hasData) {
    return (
      <Box
        sx={{
          minHeight: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="text.secondary">
          No existen percentiles registrados.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 20,
            left: 20,
            bottom: 10,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="percentil"
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            tickFormatter={formatCurrency}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip
            formatter={(value) => [
              new Intl.NumberFormat("es-EC", {
                style: "currency",
                currency: "USD",
              }).format(Number(value || 0)),
              "Pérdida",
            ]}
          />

          <Bar
            dataKey="valor"
            fill="#008f95"
            radius={[8, 8, 0, 0]}
            maxBarSize={65}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default PercentilesChart;