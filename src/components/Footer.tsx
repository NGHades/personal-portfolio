import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa6";
import "./Footer.css";

// TODO: replace with Richie's real profile URLs.
const SOCIAL_LINKS = [
  { label: "Email", href: "mailto:richienguyen01@gmail.com", icon: FaEnvelope },
  { label: "GitHub", href: "https://github.com/", icon: FaGithub },
  { label: "LinkedIn", href: "https://www.linkedin.com/", icon: FaLinkedin },
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="page footer-inner">
        <h2 className="footer-heading">
          Connect <span className="italic-accent">with me</span>
        </h2>
        <ul className="footer-icons">
          {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
            <li key={label}>
              <a href={href} target="_blank" rel="noreferrer" aria-label={label} className="footer-chip">
                <Icon size={18} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
