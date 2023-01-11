import Card from "@mui/material/Card";
import Image from "next/image";

function Statistics(props: any) {
  return (
    <div>
      <section>
        <Card>
          <Image
            src="/images/playbills/somethingrotten.jpg"
            width="100"
            height="100"
            alt="costa mesa"
          />
          <h1>First Musical of the Year ... Something Rotten!</h1>
        </Card>
        <Card>
          <Image
            src="/images/playbills/youngfrankenstein.jpg"
            width="100"
            height="100"
            alt="costa mesa"
          />
          <h1>Last Musical of the Year ... Young Frankenstein!</h1>
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
          <p> Stuff about the places you've been. </p>
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
