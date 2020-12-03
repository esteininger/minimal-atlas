async function loginGoogle() {
  const client = stitch.Stitch.initializeDefaultAppClient(
    "atlasconfigurator-xyznk"
  ); 

  if (client.auth.hasRedirectResult()) {
    client.auth.handleRedirectResult().then((user) => {
      let redirectUrl = localStorage.getItem("redirectUrl");

      if (!redirectUrl) {
        redirectUrl = "index.html";
      }
      window.location.replace(redirectUrl);
    });
  }

  client.auth.logout().then(function () {
    // Store the URL of the page the user was on previously to redirect back to the page after authentication
    localStorage.setItem("redirectUrl", document.referrer);

    let credential = new stitch.GoogleRedirectCredential();
    client.auth.loginWithRedirect(credential);
  });
}
