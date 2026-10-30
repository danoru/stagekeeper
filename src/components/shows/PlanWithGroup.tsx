import GroupsIcon from "@mui/icons-material/Groups";
import { Button, ListItemText, Menu, MenuItem } from "@mui/material";
import { useState } from "react";

interface Props {
  /** "MUSICAL-12" | "PLAY-34", the key the group plan form uses for shows. */
  showKey: string;
}

interface GroupOption {
  group: number;
  groups: { name: string; _count: { members: number } };
}

// Jumps to a group's "Propose a show" form with this show already picked.
function PlanWithGroup({ showKey }: Props) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [groups, setGroups] = useState<GroupOption[] | null>(null);

  function open(e: React.MouseEvent<HTMLElement>) {
    setAnchor(e.currentTarget);
    if (groups) return;
    fetch("/api/groups")
      .then((r) => (r.ok ? r.json() : { groups: [] }))
      .then((body) => setGroups(body.groups ?? []))
      .catch(() => setGroups([]));
  }

  return (
    <>
      <Button
        aria-haspopup="menu"
        size="small"
        startIcon={<GroupsIcon fontSize="small" />}
        variant="outlined"
        onClick={open}
      >
        Plan with a group
      </Button>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {groups === null && <MenuItem disabled>Loading…</MenuItem>}
        {groups?.map((g) => (
          <MenuItem
            key={g.group}
            component="a"
            href={`/groups/${g.group}?propose=${encodeURIComponent(showKey)}`}
          >
            <ListItemText
              primary={g.groups.name}
              secondary={`${g.groups._count.members} ${g.groups._count.members === 1 ? "member" : "members"}`}
            />
          </MenuItem>
        ))}
        {groups?.length === 0 && (
          <MenuItem component="a" href="/groups">
            <ListItemText primary="Start a group" secondary="You're not in any groups yet" />
          </MenuItem>
        )}
      </Menu>
    </>
  );
}

export default PlanWithGroup;
