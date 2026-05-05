import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import { IconButton, InputAdornment, TextField } from "@mui/material";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder }: Props) {
  return (
    <TextField
      fullWidth
      placeholder={placeholder}
      size="small"
      value={value}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: "rgba(212,175,85,0.5)", fontSize: "1.1rem" }} />
          </InputAdornment>
        ),
        endAdornment: value ? (
          <InputAdornment position="end">
            <IconButton size="small" onClick={() => onChange("")}>
              <ClearIcon sx={{ color: "rgba(232,220,200,0.45)", fontSize: "1rem" }} />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          background: "rgba(212,175,85,0.04)",
          borderRadius: 1,
          "& fieldset": { borderColor: "rgba(212,175,85,0.2)" },
          "&:hover fieldset": { borderColor: "rgba(212,175,85,0.35)" },
          "&.Mui-focused fieldset": { borderColor: "rgba(212,175,85,0.55)" },
        },
        "& input": {
          color: "#E8DCC8",
          fontFamily: '"DM Sans", sans-serif',
          fontSize: "0.85rem",
          "&::placeholder": { color: "rgba(232,220,200,0.35)", opacity: 1 },
        },
      }}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
