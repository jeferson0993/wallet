// Register service worker to control making site work offline

if("serviceWorker" in navigator) {
  navigator
  .serviceWorker
  .register("/wallet/js/jef-web-wallet-service-worker.js")
  .then(function() { 
    console.info("Service Worker Registered With Success!"); 
  })
  .catch(function (error) { 
    console.error(error.message); 
  });
}

// Code to handle install prompt on desktop

let deferredPrompt;
const addBtn = document.querySelector('.add-button');
addBtn.style.display = "none";

window.addEventListener("beforeinstallprompt", (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI to notify the user they can add to home screen
  addBtn.style.display = "block";

  addBtn.addEventListener("click", (e) => {
    // hide our user interface that shows our A2HS button
    addBtn.style.display = "none";
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.info("User accepted the A2HS prompt");
        } else {
          console.error("User dismissed the A2HS prompt");
        }
        deferredPrompt = null;
      });
  });
});
