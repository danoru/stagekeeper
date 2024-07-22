import Avatar from "@mui/material/Avatar";

interface Props {
  avatarSize: string;
  name: string;
}

function UserAvatar({ avatarSize, name }: Props) {
  function stringToColor(string: string) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = "#";

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
  }

  function stringAvatar(name: string) {
    const nameUppercase = name.toUpperCase();
    const nameSplit = nameUppercase.split(" ");
    const nameInitials =
      nameSplit[0][0] + (nameSplit.length > 1 ? nameSplit[1][0] : "");
    return {
      sx: {
        bgcolor: stringToColor(nameUppercase),
      },
      children: nameInitials,
    };
  }

  return (
    <Avatar
      alt={name}
      title={name}
      {...stringAvatar(name)}
      sx={{ ...stringAvatar(name).sx, height: avatarSize, width: avatarSize }}
    />
  );
}

export default UserAvatar;
