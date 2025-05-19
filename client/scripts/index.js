function scrollToSection(sectionId) {
  const target = document.getElementById(sectionId);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", inline: "start" });
  }
}

