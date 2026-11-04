import LegalPage, { ContactLine, LegalSection } from "../src/components/layout/LegalPage";

function PrivacyPage() {
  return (
    <LegalPage
      description="What StageKeeper collects, who can see it, and how to download or delete it."
      path="/privacy"
      title="Privacy Policy"
      updated="November 4, 2026"
    >
      <LegalSection heading="What we collect">
        <ul>
          <li>Your username, email address and a hashed version of your password.</li>
          <li>
            Anything you choose to add to your profile: name, location, website, bio and picture.
          </li>
          <li>
            What you do here: shows you log, rate, like or put on your watchlist, dates you say
            you&apos;re going, notes, follows, groups and plans, and credits or reports you submit.
          </li>
          <li>Your IP address, briefly, to limit repeated sign-in and signup attempts.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Who can see what">
        <ul>
          <li>
            <strong>Public, including to people who aren&apos;t signed in:</strong> your profile,
            the shows you&apos;ve logged with their ratings and notes, your likes and watchlist, and
            who you follow.
          </li>
          <li>
            <strong>Mutual follows and people in your groups:</strong> dates you&apos;ve said
            you&apos;re going.
          </li>
          <li>
            <strong>Only you and site admins:</strong> your email address. Admins can see it to run
            the site. We never show it on your profile.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="How we use it">
        <p>
          To run StageKeeper: showing your logbook, connecting you with friends and groups, and
          sending account emails such as password resets. We don&apos;t sell your information or use
          it for advertising.
        </p>
      </LegalSection>

      <LegalSection heading="Who we share it with">
        <p>
          Only the services that keep the site running: our database and hosting providers, and an
          email delivery provider for account emails. We&apos;d also disclose information if the law
          required it.
        </p>
      </LegalSection>

      <LegalSection heading="Cookies">
        <p>
          We use one kind of cookie: the one that keeps you signed in. No advertising or tracking
          cookies.
        </p>
      </LegalSection>

      <LegalSection heading="Your choices">
        <ul>
          <li>
            Edit your profile, download everything tied to your account, or delete your account at
            any time from <a href="/settings">Settings</a>.
          </li>
          <li>
            Deleting your account removes your profile, visits, ratings, lists and follows. Shows,
            theatres and credits you added stay in the catalog without your name, and groups you
            share carry on without you.
          </li>
          <li>
            If you live in California or elsewhere with similar privacy laws, these tools are how
            you can access and delete your information. Contact us if you need help with a request.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="Children">
        <p>StageKeeper isn&apos;t meant for anyone under 13, and they shouldn&apos;t sign up.</p>
      </LegalSection>

      <LegalSection heading="Changes and contact">
        <p>We&apos;ll update this page if any of this changes.</p>
        <ContactLine />
      </LegalSection>
    </LegalPage>
  );
}

export default PrivacyPage;
