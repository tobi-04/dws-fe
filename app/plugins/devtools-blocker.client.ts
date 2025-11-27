export default defineNuxtPlugin(() => {
  //   if (import.meta.env.DEV) return;
  return;

  const router = useRouter();
  const route = useRoute();

  let devToolsOpen = false;
  let hasLoggedThisSession = false;
  const BLOCKED_IMAGE_URL =
    "https://cdn-icons-png.flaticon.com/512/7596/7596460.png";

  // Log DevTools detection to server (only for keyboard shortcuts)
  const logDevToolsDetection = async () => {
    if (hasLoggedThisSession) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      hasLoggedThisSession = true;
      await api.logDevTools(route.path, navigator.userAgent);
    } catch {
      // Ignore errors - user might not be logged in
    }
  };

  const replaceAllImages = () => {
    const images = document.querySelectorAll("img");
    images.forEach((img) => {
      if (img.src !== BLOCKED_IMAGE_URL) {
        img.dataset.originalSrc = img.src;
        img.src = BLOCKED_IMAGE_URL;
        img.srcset = "";
      }
    });
  };

  const observeNewImages = () => {
    const observer = new MutationObserver((mutations) => {
      if (!devToolsOpen) return;

      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLImageElement) {
            if (node.src !== BLOCKED_IMAGE_URL) {
              node.dataset.originalSrc = node.src;
              node.src = BLOCKED_IMAGE_URL;
              node.srcset = "";
            }
          }
          if (node instanceof HTMLElement) {
            const images = node.querySelectorAll("img");
            images.forEach((img) => {
              if (img.src !== BLOCKED_IMAGE_URL) {
                img.dataset.originalSrc = img.src;
                img.src = BLOCKED_IMAGE_URL;
                img.srcset = "";
              }
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return observer;
  };

  let imageObserver: MutationObserver | null = null;

  const redirectToBlock = (shouldLog: boolean = false) => {
    if (route.path !== "/block") {
      devToolsOpen = true;
      replaceAllImages();
      if (!imageObserver) {
        imageObserver = observeNewImages();
      }
      if (shouldLog) {
        logDevToolsDetection();
      }
      router.push("/block");
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && e.key === "I") ||
      (e.ctrlKey && e.shiftKey && e.key === "J") ||
      (e.ctrlKey && e.shiftKey && e.key === "C") ||
      (e.ctrlKey && e.key === "S") ||
      (e.ctrlKey && e.key === "u") ||
      (e.ctrlKey && e.key === "U")
    ) {
      e.preventDefault();
      e.stopPropagation();
      redirectToBlock(true); // Log keyboard shortcut detection
      return false;
    }
  };

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    // Don't log right-click as per requirement
    return false;
  };

  const checkDevTools = () => {
    if (route.path === "/block" && !devToolsOpen) return;

    try {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold =
        window.outerHeight - window.innerHeight > threshold;

      if (widthThreshold || heightThreshold) {
        if (!devToolsOpen) {
          devToolsOpen = true;
          replaceAllImages();
          if (!imageObserver) {
            imageObserver = observeNewImages();
          }
        }
        if (route.path !== "/block") {
          router.push("/block");
        }
      }
    } catch (error) {
      console.log("Error checking devtools", error);
    }
  };

  window.addEventListener("keydown", handleKeyDown, true);
  window.addEventListener("contextmenu", handleContextMenu, true);

  setInterval(checkDevTools, 10000);

  checkDevTools();
});
