import SearchIcon from "@mui/icons-material/Search";
import {
  Autocomplete,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import type { SearchResult } from "../../data/search";

function SearchField({
  autoFocus,
  onNavigate,
  width,
}: {
  autoFocus?: boolean;
  onNavigate?: () => void;
  width?: number | string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`)
        .then((r) => (r.ok ? r.json() : { results: [] }))
        .then((data) => {
          if (!cancelled) setResults(data.results ?? []);
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  return (
    <Autocomplete<SearchResult, false, false, false>
      autoHighlight
      blurOnSelect
      clearOnBlur={false}
      filterOptions={(x) => x}
      forcePopupIcon={false}
      getOptionLabel={(o) => o.label}
      groupBy={(o) => o.kind}
      inputValue={query}
      loading={loading}
      noOptionsText={query.trim().length < 2 ? "Type to search" : "No matches"}
      options={results}
      renderInput={(params) => (
        <TextField
          {...params}
          autoFocus={autoFocus}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: "1.1rem", color: "rgba(232,220,200,0.5)" }} />
              </InputAdornment>
            ),
            endAdornment: loading ? <CircularProgress size={14} /> : null,
          }}
          inputProps={{ ...params.inputProps, "aria-label": "Search StageKeeper" }}
          placeholder="Search"
          size="small"
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option.key}>
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontSize: "0.88rem" }}>
              {option.label}
            </Typography>
            {option.detail && (
              <Typography noWrap color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                {option.detail}
              </Typography>
            )}
          </Box>
        </li>
      )}
      slotProps={{ popper: { sx: { minWidth: 280 }, placement: "bottom-start" } }}
      sx={{ width }}
      value={null}
      onChange={(_, option) => {
        if (!option) return;
        setQuery("");
        setResults([]);
        onNavigate?.();
        router.push(option.href);
      }}
      onInputChange={(_, value, reason) => {
        if (reason === "input") setQuery(value);
      }}
    />
  );
}

// The width where the logo, links, field and Log a show button all fit, admin link included.
const ROOMY = "@media (min-width: 1400px)";

/** Inline on wide screens; an icon that opens a dialog where the nav has no room. */
function NavSearch() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Box sx={{ display: "none", ml: 1, [ROOMY]: { display: "block" } }}>
        <SearchField width={180} />
      </Box>
      <IconButton
        aria-label="Search"
        color="inherit"
        sx={{ ml: 0.5, flexShrink: 0, [ROOMY]: { display: "none" } }}
        onClick={() => setOpen(true)}
      >
        <SearchIcon />
      </IconButton>
      <Dialog
        fullWidth
        maxWidth="sm"
        open={open}
        sx={{ "& .MuiDialog-container": { alignItems: "flex-start" } }}
        onClose={() => setOpen(false)}
      >
        <DialogContent sx={{ minHeight: 80 }}>
          <SearchField autoFocus width="100%" onNavigate={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default NavSearch;
