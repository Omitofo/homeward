import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/layout/LegalPageShell";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Safety",
  description: `How to stay safe when adopting through ${siteConfig.name}.`,
};

export default function SafetyPage() {
  return (
    <LegalPageShell title="Safety" updated="23 September 2026">
      <p>
        Adoption should be joyful — and careful. These guidelines help you avoid common
        scams and stay safe when contacting rescues.
      </p>

      <h2 className="text-base font-semibold text-foreground">Never send money up front</h2>
      <p className="text-muted">
        Legitimate rescues do not ask for wire transfers, gift cards, crypto, or
        "shipping deposits" before you have met the animal or completed their process.
        Prefer transparent adoption fees paid through the shelter&apos;s official channels
        after you have visited or completed their application.
      </p>

      <h2 className="text-base font-semibold text-foreground">Use in-app chat first</h2>
      <p className="text-muted">
        Start conversations on {siteConfig.name}. Be cautious if someone pushes you to
        move immediately to unknown apps or personal payment links. Report suspicious
        messages with the report controls on posts and comments.
      </p>

      <h2 className="text-base font-semibold text-foreground">Look for verification</h2>
      <p className="text-muted">
        Verified badges are granted by admins after reviewing evidence. They reduce risk
        but are not a guarantee. Unverified shelters can still be genuine — ask questions,
        visit in person when possible, and trust your instincts.
      </p>

      <h2 className="text-base font-semibold text-foreground">Meet safely</h2>
      <ul className="list-disc space-y-2 pl-5 text-muted">
        <li>Prefer the shelter&apos;s facility or a public place.</li>
        <li>Bring a friend if you are unsure.</li>
        <li>Ask about medical history, temperament, and return policies.</li>
        <li>Never feel pressured to decide on the spot.</li>
      </ul>

      <h2 className="text-base font-semibold text-foreground">Report problems</h2>
      <p className="text-muted">
        Use the report button on posts and comments, or contact us via{" "}
        <Link href="/about" className="font-medium text-primary underline-offset-4 hover:underline">
          About
        </Link>
        . Admins can hide content and review verification.
      </p>

      <h2 className="text-base font-semibold text-foreground">For shelters</h2>
      <p className="text-muted">
        Post accurate information and photos you have rights to use. Complete verification
        when you can. Do not share adopters&apos; private data publicly. Flag harassment
        in chat to admins when needed.
      </p>
    </LegalPageShell>
  );
}
