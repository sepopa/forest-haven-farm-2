import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useLanguage } from "../i18n/LanguageContext";
import { recordPageview } from "../api";

const VISITOR_KEY = "fhf-visitor-id";

function getVisitorId() {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

function detectDeviceType() {
  const width = window.innerWidth;
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

export default function Layout() {
  const { pathname } = useLocation();
  const { lang } = useLanguage();

  // Scroll to top on route change (mirrors normal multi-page site behavior).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    recordPageview({
      path: pathname,
      referrer: document.referrer || null,
      device_type: detectDeviceType(),
      lang,
      visitor_id: getVisitorId(),
    });
  }, [pathname, lang]);

  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
