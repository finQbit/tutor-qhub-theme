// qhub_theme: Indigo fills the logo and footer slots of every MFE with its own widgets; they render Quantum Hub's
// instead. Indigo's other widgets in those slots (theme variant, user theme) stay.
Object.values(config.pluginSlots || {}).forEach((slot) => {
  slot.plugins.forEach((plugin) => {
    if (plugin.widget?.id === 'custom_logo') {
      plugin.widget.RenderWidget = QuantumHubLogo;
    }
    if (plugin.widget?.id === 'indigo_footer') {
      plugin.widget.RenderWidget = QuantumHubFooter;
    }
  });
});
