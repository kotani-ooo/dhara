import { useEffect, useMemo, useState } from "react";
import { CaretDown, List, Translate, X } from "@phosphor-icons/react";
import { appContent } from "./generated/app-content.js";
import { content, localeNames, locales } from "./content.js";

const appStoreUrl = import.meta.env.VITE_APP_STORE_URL;
const base = import.meta.env.BASE_URL;

function routeInfo() {
  const relative = window.location.pathname.slice(base.length - 1).replace(/^\/+|\/+$/g, "");
  const parts = relative.split("/").filter(Boolean);
  const locale = locales.includes(parts[0]) ? parts[0] : "en";
  const page = ["support", "privacy", "terms", "coming-soon"].includes(parts[1]) ? parts[1] : "home";
  return { locale, page };
}

function pathFor(locale, page = "home", hash = "") {
  const pagePart = page === "home" ? "" : `${page}/`;
  return `${base}${locale}/${pagePart}${hash}`;
}

function AppStoreLink({ children, compact = false, locale }) {
  const href = appStoreUrl || pathFor(locale, "coming-soon");
  return <a className={`store-button${compact ? " store-button--compact" : ""}`} href={href}>{children}</a>;
}

function LanguageMenu({ locale, page }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="language-menu">
      <button className="language-trigger" type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Translate size={17} weight="light" /><span>{localeNames[locale]}</span><CaretDown size={14} />
      </button>
      {open && <div className="language-popover">
        {locales.map((item) => <a className={item === locale ? "active" : ""} href={pathFor(item, page)} key={item}>{localeNames[item]}</a>)}
      </div>}
    </div>
  );
}

function Header({ locale, page }) {
  const [open, setOpen] = useState(false);
  const copy = content[locale];
  return <header className="site-header">
    <a className="brand" href={pathFor(locale)} aria-label="Dhara">
      <img src={`${base}assets/logo.svg`} alt="Dhara" />
    </a>
    <nav className={`primary-nav${open ? " is-open" : ""}`} aria-label="Primary navigation">
      <a href={pathFor(locale, "support")} onClick={() => setOpen(false)}>{copy.nav.support}</a>
      <a href={pathFor(locale, "privacy")} onClick={() => setOpen(false)}>{copy.nav.privacy}</a>
      <a href={pathFor(locale, "terms")} onClick={() => setOpen(false)}>{copy.nav.terms}</a>
      <LanguageMenu locale={locale} page={page} />
    </nav>
    <AppStoreLink compact locale={locale}>App Store</AppStoreLink>
    <button className="menu-button" type="button" aria-label={open ? copy.close : copy.menu} onClick={() => setOpen(!open)}>
      {open ? <X size={24} /> : <List size={25} />}
    </button>
  </header>;
}

function Footer({ locale, page }) {
  const copy = content[locale];
  return <footer className="site-footer">
    <div className="footer-links">
      <a href={pathFor(locale, "support")}>{copy.nav.support}</a>
      <a href={pathFor(locale, "privacy")}>{appContent[locale].privacy.title}</a>
      <a href={pathFor(locale, "terms")}>{appContent[locale].terms.title}</a>
      <LanguageMenu locale={locale} page={page} />
    </div>
    <p>{copy.availability}</p>
  </footer>;
}

function Home({ locale }) {
  const copy = content[locale];
  return <>
    <main>
      <section className="hero">
        <div className="hero-copy">
          <h1>{copy.heroTitle}</h1>
          <p className="lead">{copy.heroBody}</p>
          <p className="note">{copy.heroNote}</p>
          <AppStoreLink locale={locale}>{copy.appStore}</AppStoreLink>
        </div>
        <div className="hero-visual"><img src={`${base}assets/dhara-app-icon.png`} alt="" /></div>
        <a className="scroll-cue" href="#experience" aria-label={copy.nav.experience}><CaretDown size={30} weight="thin" /></a>
      </section>

      <section className="experience section" id="experience">
        <div className="section-grid">
          <div className="section-copy">
            <h2>{copy.experienceTitle}</h2>
            <p>{copy.experienceBody}</p>
            <div className="experience-trust">
              <p>{copy.trustBody}</p>
              <p>{copy.purchase}</p>
            </div>
          </div>
          <div className="phone-stage">
            <div className="phone-halo" />
            <img className="phone-shot" src={`${base}assets/dhara.png`} alt={copy.phoneAlt} />
          </div>
        </div>
      </section>

      <section className="closing-cta">
        <AppStoreLink locale={locale}>{copy.appStore}</AppStoreLink>
      </section>
    </main>
    <Footer locale={locale} page="home" />
  </>;
}

function DocumentPage({ locale, page }) {
  const document = appContent[locale][page];
  const blocks = useMemo(() => document.body.split("\n\n"), [document.body]);
  return <>
    <main className="document-page">
      <a className="document-back" href={pathFor(locale)}>← Dhara</a>
      <h1>{document.title}</h1>
      <div className="document-body">
        {blocks.map((block, index) => {
          const email = block.trim() === "dhara.support@icloud.com";
          const heading = /^\d+\.\s/.test(block);
          if (email) return <p key={index}><a href="mailto:dhara.support@icloud.com">{block}</a></p>;
          if (heading) return <h2 key={index}>{block}</h2>;
          return <p key={index}>{block}</p>;
        })}
      </div>
    </main>
    <Footer locale={locale} page={page} />
  </>;
}

function ComingSoonPage({ locale }) {
  const copy = content[locale].comingSoon;
  return <>
    <main className="document-page coming-soon-page">
      <a className="document-back" href={pathFor(locale)}>← {copy.back}</a>
      <p className="coming-soon-kicker">App Store</p>
      <h1>{copy.title}</h1>
      <div className="document-body">
        {copy.body.split("\n\n").map((block) => <p key={block}>{block}</p>)}
      </div>
    </main>
    <Footer locale={locale} page="coming-soon" />
  </>;
}

export function App() {
  const [{ locale, page }] = useState(routeInfo);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = page === "home" ? "Dhara — A quiet place to return to" : page === "coming-soon" ? `${content[locale].comingSoon.title} — Dhara` : `${appContent[locale][page].title} — Dhara`;
  }, [locale, page]);
  return <div className="app-shell"><Header locale={locale} page={page} />{page === "home" ? <Home locale={locale} /> : page === "coming-soon" ? <ComingSoonPage locale={locale} /> : <DocumentPage locale={locale} page={page} />}</div>;
}
