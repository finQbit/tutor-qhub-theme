// qhub_theme: the footer of the MFEs, in place of Indigo's. DESIGN.md's footer: the lockup and the links, then the EU
// funding logos on their white plate, then the legal line. Styles: _qhub.scss of openedx/brand. No language switch:
// Open edX takes the language from the browser and from the learner's account settings. No "Powered by Open edX":
// Open edX's trademark guidelines ask for it ("should"), they do not require it.
const QuantumHubFooter = () => {
  const intl = useIntl();
  const config = getConfig();
  const polish = (intl.locale || 'en').toLowerCase().startsWith('pl');
  const t = (pl, en) => (polish ? pl : en);
  const links = config.INDIGO_FOOTER_NAV_LINKS || [];

  return (
    <footer className="qh-footer">
      <div className="qh-footer__main">
        <div className="qh-footer__brand">
          <img className="qh-footer__lockup qh-logo__light" src={config.LOGO_URL} alt={config.SITE_NAME} width="180" height="26" />
          <img className="qh-footer__lockup qh-logo__dark" src={config.LOGO_WHITE_URL} alt={config.SITE_NAME} width="180" height="26" />
        </div>
        {links.length > 0 && (
          <nav className="qh-footer__links" aria-label={t('Linki w stopce', 'Footer links')}>
            <ul>
              {links.map((link) => (
                <li key={link.url}>
                  <a href={link.url.startsWith('http') ? link.url : `${config.LMS_BASE_URL}${link.url}`}>{link.title}</a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
      <div className="qh-funding">
        <div className="qh-funding-plate">
          {/* In Polish for Polish, in English for every other language (as footer.html of openedx/theme). */}
          {polish ? (
            <img
              src="https://cdn.qhub-dev.finqbit.com/brand/eu-funds/fepw-rp-eu-parp-color.v1.png"
              width="28935"
              height="2167"
              loading="lazy"
              alt="Fundusze Europejskie dla Polski Wschodniej, Rzeczpospolita Polska, Dofinansowane przez Unię Europejską, PARP Grupa PFR"
            />
          ) : (
            <img
              src="https://cdn.qhub-dev.finqbit.com/brand/eu-funds/fepw-rp-eu-parp-color-en.v1.png"
              width="2126"
              height="252"
              loading="lazy"
              alt="European Funds for Eastern Poland, Republic of Poland, Co-funded by the European Union, PARP (PFR Group)"
            />
          )}
        </div>
      </div>
      <p className="qh-footer__legal">© {new Date().getFullYear()} finQbit · <a href={QHUB_THEME_SOURCE_URL}>{t("Kod źródłowy", "Source code")}</a></p>
    </footer>
  );
};
