import "./Footer.css";

// TODO: replace with Richie's real profile URLs.
const SOCIAL_LINKS = [
  { label: "Email", href: "mailto:richienguyen01@gmail.com" },
  { label: "GitHub", href: "https://github.com/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="page">
        <div className="columns footer-inner">
          <h2 className="footer-heading">
            Connect <span className="italic-accent">with me</span>
          </h2>
          <ul className="footer-links">
            {SOCIAL_LINKS.map(({ label, href }) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noreferrer" className="footer-link">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
