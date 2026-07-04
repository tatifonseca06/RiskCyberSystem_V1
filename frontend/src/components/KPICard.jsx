import {
  Box,
  Card,
  CardContent,
  Typography,
} from "@mui/material";

const KPICard = ({
  title,
  value,
  icon,
  subtitle,
  gradient,
}) => {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border:
          "1px solid rgba(15, 61, 91, 0.08)",
        transition:
          "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow:
            "0 12px 28px rgba(16, 53, 82, 0.12)",
        },
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 2.5,
          "&:last-child": {
            pb: 2.5,
          },
        }}
      >
        <Box
          sx={{
            width: 54,
            height: 54,
            flexShrink: 0,
            borderRadius: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            background:
              gradient ||
              "linear-gradient(135deg, #0b5fa5, #008f95)",
            boxShadow:
              "0 8px 22px rgba(11, 95, 165, 0.22)",
          }}
        >
          {icon}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight={600}
            noWrap
          >
            {title}
          </Typography>

          <Typography
            variant="h4"
            fontWeight={800}
            color="text.primary"
          >
            {Number(value || 0).toLocaleString(
              "es-EC"
            )}
          </Typography>

          {subtitle && (
            <Typography
              variant="caption"
              color="text.secondary"
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default KPICard;