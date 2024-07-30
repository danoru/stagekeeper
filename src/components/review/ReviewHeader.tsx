import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Typography from "@mui/material/Typography";
import Link from "next/link";

interface Props {
  username: string;
  year?: string | null;
}

function ReviewHeader({ year, username }: Props) {
  const previousYear = year ? Number(year) - 1 : null;
  const nextYear = year ? Number(year) + 1 : null;

  const prevYearURL = `/users/${username}/review/${previousYear}`;
  const nextYearURL = `/users/${username}/review/${nextYear}`;

  const humanReadableYear = () => {
    return year ? `${year} Year in Review` : "All Time Statistics";
  };

  const prevYearCheck = () =>
    previousYear && previousYear >= 2022 ? (
      <Link href={prevYearURL}>
        <ArrowBackIosIcon />
      </Link>
    ) : null;

  const nextYearCheck = () =>
    nextYear && nextYear <= 2024 ? (
      <Link href={nextYearURL}>
        <ArrowForwardIosIcon />
      </Link>
    ) : null;

  return (
    <div>
      <Typography variant="h5">{username}</Typography>
      <Typography variant="h6">
        {prevYearCheck()}
        {humanReadableYear()}
        {nextYearCheck()}
      </Typography>
    </div>
  );
}

export default ReviewHeader;
