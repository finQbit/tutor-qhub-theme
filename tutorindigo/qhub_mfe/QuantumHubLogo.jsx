// qhub_theme: the header logo of the MFEs, in place of Indigo's (which is labelled "Open edX"). The lockup comes from
// Quantum Hub's shared visual assets, at the URLs qhub_theme sets in LOGO_URL and LOGO_WHITE_URL; the white one shows
// in dark mode (_qhub.scss of openedx/brand).
const QuantumHubLogo = () => {
  const config = getConfig();
  return (
    <a href={`${config.LMS_BASE_URL}/dashboard`} className="logo qh-logo">
      <img className="qh-logo__light" src={config.LOGO_URL} alt={config.SITE_NAME} width="180" height="26" />
      <img className="qh-logo__dark" src={config.LOGO_WHITE_URL} alt={config.SITE_NAME} width="180" height="26" />
    </a>
  );
};
