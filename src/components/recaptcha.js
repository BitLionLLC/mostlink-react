import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

const SCRIPT_SRC = "https://www.google.com/recaptcha/api.js?render=explicit";

let scriptPromise = null;

/**
 * Loads Google's reCAPTCHA script once per page and resolves once the api is
 * ready to render widgets.
 */
const loadRecaptcha = () => {
  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise((resolve, reject) => {
    if (window.grecaptcha?.render) {
      resolve(window.grecaptcha);
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => window.grecaptcha.ready(() => resolve(window.grecaptcha));
    script.onerror = () => {
      // Let a later mount retry the load.
      scriptPromise = null;
      reject(new Error("Could not load reCAPTCHA."));
    };

    document.head.appendChild(script);
  });

  return scriptPromise;
};

/**
 * reCAPTCHA v2 ("I'm not a robot") checkbox. Calls onChange with the response
 * token when the user passes the challenge, and with "" when it expires,
 * errors, or is reset. Expose reset() through a ref to clear a used token.
 */
const ReCaptcha = forwardRef(({ siteKey, theme = "light", onChange }, ref) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const onChangeRef = useRef(onChange);

  onChangeRef.current = onChange;

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current !== null) {
        window.grecaptcha?.reset(widgetIdRef.current);
      }
    },
  }));

  useEffect(() => {
    if (!siteKey) {
      return undefined;
    }

    let cancelled = false;
    const container = containerRef.current;

    loadRecaptcha()
      .then((grecaptcha) => {
        if (cancelled || !container) {
          return;
        }

        // Render into a fresh child element so a remount (StrictMode, theme
        // change) never hits "reCAPTCHA has already been rendered".
        const host = document.createElement("div");
        container.appendChild(host);

        widgetIdRef.current = grecaptcha.render(host, {
          sitekey: siteKey,
          theme,
          callback: (token) => onChangeRef.current(token),
          "expired-callback": () => onChangeRef.current(""),
          "error-callback": () => onChangeRef.current(""),
        });
      })
      .catch(() => {
        if (!cancelled) {
          onChangeRef.current("");
        }
      });

    return () => {
      cancelled = true;
      widgetIdRef.current = null;

      if (container) {
        container.innerHTML = "";
      }
    };
  }, [siteKey, theme]);

  if (!siteKey) {
    return null;
  }

  return <div ref={containerRef} />;
});

ReCaptcha.displayName = "ReCaptcha";

export default ReCaptcha;
