import {
  Box,
  Typography,
} from "@mui/material";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = [
  "#c62828",
  "#ef6c00",
  "#f9a825",
  "#2e7d32",
];

const CustomTooltip = ({
  active,
  payload,
}) => {
  if (
    active &&
    Array.isArray(payload) &&
    payload.length > 0
  ) {
    const item = payload[0]?.payload;

    return (
      <Box
        sx={{
          backgroundColor: "white",
          border:
            "1px solid rgba(0,0,0,0.08)",
          borderRadius: 2,
          px: 2,
          py: 1.25,
          boxShadow:
            "0 8px 24px rgba(0,0,0,0.12)",
        }}
      >
        <Typography
          variant="body2"
          fontWeight={700}
        >
          {item?.name}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
        >
          {Number(
            item?.value || 0
          ).toLocaleString("es-EC")}{" "}
          riesgos
        </Typography>
      </Box>
    );
  }

  return null;
};

const RiskDistributionChart = ({
  data,
}) => {
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
          No existen riesgos clasificados.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            innerRadius={65}
            outerRadius={105}
            paddingAngle={3}
          >
            {data.map((entry, index) => (
              <Cell
                key={`${entry.name}-${index}`}
                fill={
                  COLORS[
                    index % COLORS.length
                  ]
                }
              />
            ))}
          </Pie>

          <Tooltip
            content={<CustomTooltip />}
          />

          <Legend
            verticalAlign="bottom"
            height={36}
          />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default RiskDistributionChart;