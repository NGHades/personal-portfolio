import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <section className="page section" style={{ minHeight: "60vh" }}>
      <h1 className="section-heading" style={{ marginBottom: 24 }}>
        Nothing <span className="italic-accent">here.</span>
      </h1>
      <p>
        That page doesn't exist. <Link to="/">Back to the home page</Link>.
      </p>
    </section>
  );
}
