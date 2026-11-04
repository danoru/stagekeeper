import LegalPage, { ContactLine, LegalSection } from "../src/components/layout/LegalPage";

function TermsPage() {
  return (
    <LegalPage
      description="The ground rules for using StageKeeper."
      path="/terms"
      title="Terms of Use"
      updated="November 4, 2026"
    >
      <LegalSection heading="Using StageKeeper">
        <p>
          StageKeeper is a logbook for the theatre you see. By creating an account or using the
          site, you agree to these terms. You must be at least 13, and you&apos;re responsible for
          keeping your password safe and for what happens under your account.
        </p>
      </LegalSection>

      <LegalSection heading="What you post">
        <p>
          Your logs, ratings and notes are yours. By posting them, or adding shows, theatres and
          credits, you let us store and display them on StageKeeper so the site can work. Shows,
          theatres and credits you add may stay in the catalog if you leave.
        </p>
      </LegalSection>

      <LegalSection heading="Be decent">
        <ul>
          <li>
            Don&apos;t harass people, including performers, or post anything hateful or illegal.
          </li>
          <li>Don&apos;t post someone else&apos;s private information.</li>
          <li>Add information you believe is accurate. Credits name real people.</li>
          <li>Don&apos;t spam, scrape the site heavily, or try to break it.</li>
        </ul>
        <p>
          We may edit or remove content, and suspend or close accounts, when these rules are broken.
          Use &ldquo;Report a problem&rdquo; if you spot something wrong.
        </p>
      </LegalSection>

      <LegalSection heading="Showtimes and listings">
        <p>
          Listings, including dates, times and casts, come from members and public sources, and some
          are estimates. Always check with the theatre before you buy tickets or travel. StageKeeper
          isn&apos;t affiliated with the theatres and shows it lists. Their names and artwork belong
          to their owners.
        </p>
      </LegalSection>

      <LegalSection heading="No guarantees">
        <p>
          StageKeeper is provided as is, without warranties, and may change or go offline. To the
          extent the law allows, we aren&apos;t liable for losses from using it. Use the download in
          Settings if you want your own copy of your data.
        </p>
      </LegalSection>

      <LegalSection heading="Leaving, and changes">
        <p>
          You can delete your account at any time from <a href="/settings">Settings</a>. See the{" "}
          <a href="/privacy">Privacy Policy</a> for what that removes. We may update these terms;
          continuing to use the site after a change means you accept it.
        </p>
        <ContactLine />
      </LegalSection>
    </LegalPage>
  );
}

export default TermsPage;
