import { MUSICAL_LIST_TYPE } from "../../types";

import Card from "@mui/material/Card";
import Image from "next/image";

interface Props {
  stats: MUSICAL_LIST_TYPE[];
}

function Statistics(props: Props) {
  const { stats } = props;

  const filteredMusicals = stats.filter(
    (stats: MUSICAL_LIST_TYPE) => stats.groupAttended
  );

  const firstMusical = filteredMusicals.reduce((a, b) =>
    a.date < b.date ? a : b
  );

  const latestMusical = filteredMusicals.reduce((a, b) =>
    a.date > b.date ? a : b
  );

  return (
    <div>
      <section>
        <Card>
          <Image
            src={firstMusical.image}
            width="100"
            height="100"
            alt="costa mesa"
          />
          <h1>First Musical of the Year ... {firstMusical.title}!</h1>
          <p>
            You watched {firstMusical.title} at the {firstMusical.playhouse} in{" "}
            {firstMusical.location} on {firstMusical.date}!
          </p>
        </Card>
        <Card>
          <Image
            src={latestMusical.image}
            width="100"
            height="100"
            alt="costa mesa"
          />
          <h1>Last Musical of the Year ... {latestMusical.title}!</h1>
          <p>
            You watched {latestMusical.title} at the {latestMusical.playhouse}{" "}
            in {latestMusical.location} on {latestMusical.date}!
          </p>
        </Card>
      </section>
      <section>
        <Card>
          <Image
            src="/images/places/costamesa.jpg"
            width="100"
            height="100"
            alt="costa mesa"
          />
          <h1>Your spent the most time in ... Costa Mesa!</h1>
          <p> Stuff about the places you have been. </p>
        </Card>
        <Card>
          <Image
            src="/images/places/segerstrom.jpg"
            width="100"
            height="100"
            alt="Segerstrom Center for the Arts"
          />
          <h1>
            Your most visited playhouse was ... Segerstrom Center for the Arts!
          </h1>
          <p>Stuff about the playhouses you went to.</p>
        </Card>
      </section>
      <section>
        <Card>
          <Image
            src="/images/playbills/rent.jpg"
            width="100"
            height="100"
            alt="costa mesa"
          />
          <h1>The oldest musical you saw was ... Rent!</h1>
          <p>Stuff about the playhouses you went to.</p>
        </Card>
        <Card>
          <Image
            src="/images/playbills/moulinrouge.jpg"
            width="100"
            height="100"
            alt="costa mesa"
          />
        </Card>
        <h1>The newest musical you saw was ... Moulin Rouge!</h1>
        <p>Stuff about the playhouses you went to.</p>
        <Card>
          <Image
            src="/images/playbills/rent.jpg"
            width="100"
            height="100"
            alt="costa mesa"
          />
          <h1>Your musical taste is primarily ... New School!</h1>
          <p>Stuff about the playhouses you went to.</p>
        </Card>
      </section>
    </div>
  );
}

export default Statistics;
