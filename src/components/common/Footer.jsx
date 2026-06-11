import logoA from "../../assets/landing-page/logoa.png";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <>

      <footer className="mx-0 bg-[#0a0a1a] px-5 py-8 text-white md:px-10 md:py-10">
        <div className="flex flex-col gap-3">
          <Link to="/"><img src={logoA} alt="AUDTLIST" className="h-24 w-auto object-left object-contain self-start -ml-3 hover:opacity-80 transition-opacity cursor-pointer" /></Link>
          <p className="text-white/45 text-[13px] max-w-sm leading-relaxed">
            A marketplace for independent artists. Discover, support, and own
            music directly from the people who make it.
          </p>
          <ul className="mt-2 flex flex-col gap-3">
            <li>
              <Link to="/about" className="text-white/50 hover:text-white text-[14px] no-underline transition-colors">
                About us
              </Link>
            </li>
            <li>
              <Link to="/help" className="text-white/50 hover:text-white text-[14px] no-underline transition-colors">
                Help
              </Link>
            </li>
            <li>
              <Link to="/terms" className="text-white/50 hover:text-white text-[14px] no-underline transition-colors">
                Terms and conditions
              </Link>
            </li>
          </ul>
          <p className="mt-6 text-white/25 text-[11px]">
            © 2026 Audtlist · Made with ♪ in Bangkok
          </p>
        </div>
      </footer>
    </>
  );
}
