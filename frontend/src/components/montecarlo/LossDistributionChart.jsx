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

const LossDistributionChart = ({
  data = [],
}) => {
  if (!Array.isArray(data) || data.length === 0) {
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
          El backend no devolvió datos del
          histograma.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", height: 340 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 20,
            left: 5,
            bottom: 45,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="rango"
            angle={-35}
            textAnchor="end"
            interval={0}
            height={80}
            tick={{
              fontSize: 11,
            }}
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
              "Frecuencia",
            ]}
          />

          <Bar
            dataKey="frecuencia"
            fill="#0b5fa5"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default LossDistributionChart;