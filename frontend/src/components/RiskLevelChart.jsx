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

const RiskLevelChart = ({ data }) => {
  const total = data.reduce(
    (sum, item) =>
      sum + Number(item.value || 0),
    0
  );

  if (total === 0) {
    return (
      <Box
        sx={{
          minHeight: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <Typography color="text.secondary">
          No existen datos suficientes.
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
            top: 15,
            right: 20,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip
            formatter={(value) => [
              Number(value).toLocaleString(
                "es-EC"
              ),
              "Cantidad",
            ]}
          />

          <Bar
            dataKey="value"
            fill="#0b5fa5"
            radius={[8, 8, 0, 0]}
            maxBarSize={54}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default RiskLevelChart;