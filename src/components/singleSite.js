import axios from "axios";
import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import { SitesContext } from "../contexts/sitesContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ImageFilePicker from "./imageFilePicker";
import { HexColorPicker } from "react-colorful";
import { useBeforeunload } from "react-beforeunload";
import GradientPicker from "./gradientPicker";
import EditableLink from "./editableLink";
import update from "immutability-helper";
import Picker from "emoji-picker-react";
import styles from "./singleSite.module.css";
import defaultHeader from "./assets/default-header.png";
import toHex from "colornames";
import { toast } from "react-toastify";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import ANIMATION_PRESETS from "./assets/particlesPresets";
import invert from "invert-color";
import { TextField, Checkbox, Select, MenuItem } from "@mui/material";
import iPhoneImage from "./assets/iphone.png";
import SquareImageCropModal from "./squareImageCropModal";
import { imageFieldRaw, imageFieldSrc } from "../utils/imageField";
import { SITE_EDITOR_TAB_SLUGS } from "../constants/siteEditorTabs";
import AnalyticsTab from "./analyticsTab";

const PREVIEW_VIEWPORT_STORAGE_KEY = "mostlink-editor-preview-viewport";

const IMAGE_TYPE = {
  HEADER: "header",
  BACKGROUND: "background",
};

/** Widescreen crop for page background (common for full-bleed cover). */
const BACKGROUND_CROP_ASPECT = 16 / 9;

const particlesInit = async (main) => {
  // console.log(main);

  // you can initialize the tsParticles instance (main) here, adding custom shapes or presets
  // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
  // starting from v2 you can add only the features you need reducing the bundle size
  await loadFull(main);
};

const particlesLoaded = (container) => {
  return;
};

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

/**
 * Hostname stored on Heroku/Convex: apex names (example.com) use www.; hosts with
 * more labels (app.example.com) are kept as-is so custom subdomains work.
 */
function hostnameForCustomDomainRegistration(domainToAdd) {
  const d = domainToAdd.trim().toLowerCase();
  const parts = d.split(".").filter(Boolean);
  if (parts.length === 2) {
    return d.startsWith("www.") ? d : `www.${d}`;
  }
  return d;
}

/** Avoid sharing nested refs with context `site` so link edits don’t mutate `site.links`. */
/** Merge body gradient + optional background image for `document.body` (CSS allows layered backgrounds). */
function composeBodyBackgroundImageCss(bodyGradient, imageUrl) {
  const g = bodyGradient && String(bodyGradient).trim();
  const u = imageUrl && String(imageUrl).trim();
  if (g && u) {
    return `${g}, url(${u})`;
  }
  if (u) {
    return `url(${u})`;
  }
  if (g) {
    return g;
  }
  return null;
}

function resolveBackgroundImageDisplayUrl(backgroundImage, backgroundImageDisplayUrl) {
  if (backgroundImageDisplayUrl) {
    return backgroundImageDisplayUrl;
  }
  return imageFieldSrc(backgroundImage);
}

function cloneLinksForEditor(linksFromSite) {
  if (!linksFromSite || !Array.isArray(linksFromSite)) {
    return [];
  }
  return JSON.parse(JSON.stringify(linksFromSite));
}

/** Strip client-only `live.isLive` so dirty checks match persisted site data. */
function linksForDirtyCompare(linksArray) {
  if (!linksArray || !Array.isArray(linksArray)) {
    return [];
  }
  return linksArray.map((link) => {
    const copy = { ...link };
    if (copy.live != null && typeof copy.live === "object") {
      const { isLive, ...liveRest } = copy.live;
      copy.live = Object.keys(liveRest).length ? liveRest : undefined;
    }
    return copy;
  });
}

const SingleSite = () => {
  const {
    site,
    siteLoading,
    fetchSite,
    theme,
    themeObj,
    singleSiteTabIndex,
    setSingleSiteTabIndex,
  } = useContext(SitesContext);

  const { id, tab } = useParams();
  const navigate = useNavigate();

  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  const [previewViewport, setPreviewViewport] = useState(() => {
    try {
      return localStorage.getItem(PREVIEW_VIEWPORT_STORAGE_KEY) === "desktop"
        ? "desktop"
        : "mobile";
    } catch {
      return "mobile";
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [hasEditButtonBeenClicked, setHasEditButtonBeenClicked] =
    useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [headerImage, setHeaderImage] = useState("");
  const [headerImageDisplayUrl, setHeaderImageDisplayUrl] = useState(null);
  const [headerEmoji, setHeaderEmoji] = useState("");
  const [backgroundImage, setBackgroundImage] = useState("");
  const [backgroundImageDisplayUrl, setBackgroundImageDisplayUrl] =
    useState(null);
  const [links, setLinks] = useState([]);
  const [titlesColor, setTitlesColor] = useState("#000000");
  const titlesColorRef = useRef(titlesColor);
  const [containerColor, setContainerColor] = useState("#ADD8E6");
  const [isContainerTransparent, setIsContainerTransparent] = useState(false);
  const [editButtonColor, setEditButtonColor] = useState("#000000");
  const containerColorRef = useRef(containerColor);
  const [containerGradient, setContainerGradient] = useState("");
  const [bodyColor, setBodyColor] = useState("#FFFFFF");
  const bodyColorRef = useRef(bodyColor);
  const [bodyGradient, setBodyGradient] = useState("");
  const [bodyAnimationStyle, setBodyAnimationStyle] = useState("");
  const [linkTextColor, setLinkTextColor] = useState("#000000");
  const linkTextColorRef = useRef(linkTextColor);
  const [linkBackgroundColor, setLinkBackgroundColor] = useState("#FFFFFF");
  const linkBackgroundColorRef = useRef(linkBackgroundColor);
  const [liveNotificationColor, setLiveNotificationColor] = useState("#FF0000");
  const liveNotificationColorRef = useRef(liveNotificationColor);
  const [isPexelsModalShowing, setIsPexelsModalShowing] = useState(false);
  const [isGiphyModalShowing, setIsGiphyModalShowing] = useState(false);
  /** `{ imageSrc, target }` — opens square crop UI before applying header/background image */
  const [squareCrop, setSquareCrop] = useState(null);
  const [modalOpenedWith, setModalOpenedWith] = useState("");
  const [photos, setPhotos] = useState([]);
  const [gifs, setGifs] = useState([]);
  const [query, setQuery] = useState("abstract");
  const [gifQuery, setGifQuery] = useState("cat");
  const [isDirty, setIsDirty] = useState(false);
  const [isEditButtonVisible, setIsEditButtonVisible] = useState(true);
  const [isDeleteModalShowing, setIsDeleteModalShowing] = useState(false);
  const [isCheckDomainModalShowing, setIsCheckDomainModalShowing] =
    useState(false);
  const [isRegisterDomainModalShowing, setIsRegisterDomainModalShowing] =
    useState(false);
  const [isDeleteDomainModalShowing, setIsDeleteDomainModalShowing] =
    useState(false);
  const [domains, setDomains] = useState([]);
  const [domainToAdd, setDomainToAdd] = useState("");
  const [domainToDelete, setDomainToDelete] = useState("");
  const [isDomainAvailable, setIsDomainAvailable] = useState(false);
  const [hasDomainBeenChecked, setHasDomainBeenChecked] = useState(false);
  const [hasDomainBeenRegistered, setHasDomainBeenRegistered] = useState(false);
  const [currentDomainCname, setCurrentDomainCname] = useState("");
  const [expandedAccordion, setExpandedAccordion] = useState(false);
  const [hoveredLinkIndex, setHoveredLinkIndex] = useState(null);
  const [isSubdomainValid, setIsSubdomainValid] = useState(true);
  const [subdomainError, setSubdomainError] = useState("");
  const [suggestion, setSuggestion] = useState("");

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PREVIEW_VIEWPORT_STORAGE_KEY, previewViewport);
    } catch {
      /* ignore */
    }
  }, [previewViewport]);

  const memoizedParticles = useMemo(() => (
    <Particles
      id="tsparticles"
      init={particlesInit}
      loaded={particlesLoaded}
      options={{ ...ANIMATION_PRESETS[bodyAnimationStyle], autoplay: true }}
      style={{ height: "100vh", width: "100vw" }}
    />
  ));

  const HEX_COLOR_REGEX_SHORT = "^#(?:[0-9a-fA-F]{3}){1}$";
  const HEX_COLOR_REGEX_LONG = "^#(?:[0-9a-fA-F]{2}){3,4}$";
  const WHITESPACE_REGEX = /\s/;
  const SUBDOMAIN_TAKEN_ERROR =
    "That subdomain is taken. Please choose another one.";

  const fetchPexels = (e) => {
    e?.preventDefault();

    axios
      .get(`https://api.pexels.com/v1/search?query=${query}&per_page=50`, {
        transformRequest: (data, headers) => {
          delete headers["X-CSRF-Token"];
          headers["Authorization"] = process.env.REACT_APP_PEXELS_API_KEY;
          return data;
        },
      })
      .then((res) => setPhotos(res.data.photos))
      .catch((err) => console.error(err));
  };

  const onKeyDownPexels = (e) => {
    if (e.key === "Enter") {
      fetchPexels(e);
    }
  };

  const fetchGiphy = (e) => {
    e?.preventDefault();

    axios
      .get(
        `https://api.giphy.com/v1/gifs/search?api_key=${process.env.REACT_APP_GIPHY_API_KEY}&limit=50&q=${gifQuery}`
      )
      .then((res) => setGifs(res.data.data))
      .catch((err) => console.log(err));
  };

  const onKeyDownGiphy = (e) => {
    if (e.key === "Enter") {
      fetchGiphy(e);
    }
  };

  const fetchSiteDomains = () => {
    axios
      .get(
        `${process.env.REACT_APP_API_BASE}/api/sites/fetch-domains/${id}`,
        { withCredentials: true }
      )
      .then((res) => {
        const domains = res.data;
        domains.forEach((data) => {
          axios.put(
            `${process.env.REACT_APP_API_BASE}/api/sites/update-domain/`,
            { domain: data.domain },
            { withCredentials: true }
          );
        });
      })
      .then(() => {
        axios
          .get(
            `${process.env.REACT_APP_API_BASE}/api/sites/fetch-domains/${id}`,
            { withCredentials: true }
          )
          .then((res) => setDomains(res.data));
      });
  };

  useEffect(() => {
    fetchSite(id);
    fetchPexels();
    fetchGiphy();
    fetchSiteDomains();
  }, []);

  useEffect(() => {
    if (tab == null) {
      setSingleSiteTabIndex(0);
      return;
    }
    const slug = String(tab).toLowerCase();
    const idx = SITE_EDITOR_TAB_SLUGS.indexOf(slug);
    if (idx === -1) {
      navigate(`/site/${id}/links`, { replace: true });
      return;
    }
    setSingleSiteTabIndex(idx);
  }, [id, tab, navigate, setSingleSiteTabIndex]);

  useEffect(() => {
    const url = resolveBackgroundImageDisplayUrl(
      backgroundImage,
      backgroundImageDisplayUrl
    );
    const css = composeBodyBackgroundImageCss(bodyGradient, url);
    document.body.style.backgroundImage = css || "none";
  }, [bodyGradient, backgroundImage, backgroundImageDisplayUrl]);

  useEffect(() => {
    document.body.style.backgroundColor = bodyColor;
  }, [bodyColor]);

  useEffect(() => {
    const linksWithLive =
      links &&
      links.map((link) => {
        if (link.live) {
          const { type, meta } = link.live;

          axios
            .get(
              `${process.env.REACT_APP_API_BASE}/api/sites/${type}/${meta}`,
              { withCredentials: true }
            )
            .then((res) => {
              if (res.data.isLive) {
                link.live.isLive = true;
              } else {
                link.live.isLive = false;
              }
            })
            .catch((err) => console.error(err));
        }
        return link;
      });

    if (JSON.stringify(links) !== JSON.stringify(linksWithLive)) {
      setLinks(linksWithLive);
    }
  }, [links]);

  useEffect(() => {
    setTitle(site.title);
    setSubtitle(site.subtitle);
    setSubdomain(site.subdomain);
    setHeaderImage(site.headerImage);
    setHeaderEmoji(site.headerEmoji);
    setLinks(cloneLinksForEditor(site.links));
    setBackgroundImage(site.backgroundImage);
    setTitlesColor(site.titlesColor);
    setContainerColor(site.containerColor);
    setBodyColor(site.bodyColor);
    setLinkTextColor(site.linkTextColor);
    setLinkBackgroundColor(site.linkBackgroundColor);
    setLiveNotificationColor(site.liveNotificationColor);
    setBodyGradient(site.bodyGradient);
    setContainerGradient(site.containerGradient);
    setBodyAnimationStyle(site.bodyAnimationStyle ?? "");
    setIsContainerTransparent(site.containerColor === "#00000000");
  }, [site]);

  useEffect(() => {
    const raw = imageFieldRaw(backgroundImage);
    if (typeof raw === "string" && raw.startsWith("storage:")) {
      let cancelled = false;
      axios
        .get(`${process.env.REACT_APP_API_BASE}/api/sites/image-url`, {
          params: { ref: raw },
          withCredentials: true,
        })
        .then((r) => {
          if (!cancelled) {
            setBackgroundImageDisplayUrl(r.data.url);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setBackgroundImageDisplayUrl(null);
          }
        });
      return () => {
        cancelled = true;
      };
    }
    setBackgroundImageDisplayUrl(null);
  }, [backgroundImage]);

  useEffect(() => {
    const raw = imageFieldRaw(headerImage);
    if (typeof raw === "string" && raw.startsWith("storage:")) {
      axios
        .get(`${process.env.REACT_APP_API_BASE}/api/sites/image-url`, {
          params: { ref: raw },
          withCredentials: true,
        })
        .then((r) => setHeaderImageDisplayUrl(r.data.url))
        .catch(() => setHeaderImageDisplayUrl(null));
    } else {
      setHeaderImageDisplayUrl(null);
    }
  }, [headerImage]);

  useEffect(() => {
    if (bodyAnimationStyle) {
      const color = ANIMATION_PRESETS[bodyAnimationStyle].background.color;
      setBodyColor(color.value || color);
    }
  }, [bodyAnimationStyle]);

  useEffect(() => {
    let rgb = containerColor?.slice(0, 7);

    if (rgb?.match(HEX_COLOR_REGEX_SHORT) || rgb?.match(HEX_COLOR_REGEX_LONG)) {
      setEditButtonColor(invert(rgb, true));
    } else {
      const hex = toHex(rgb);
      if (
        hex?.match(HEX_COLOR_REGEX_SHORT) ||
        hex?.match(HEX_COLOR_REGEX_LONG)
      ) {
        setEditButtonColor(invert(hex, true));
      } else {
        setEditButtonColor("#888888");
      }
    }
  }, [containerColor]);

  useEffect(() => {
    if (containerColor.length === 9) {
      const hex = containerColor.slice(7);
      if (hex === "00" && !isContainerTransparent) {
        setIsContainerTransparent(true);
      }
    }
  }, [containerColor]);

  useEffect(() => {
    if (isContainerTransparent && containerColor !== "#00000000") {
      setContainerColor(containerColor.slice(0, 7) + "00");
    } else {
      setContainerColor(containerColor.slice(0, 7));
    }
  }, [isContainerTransparent]);

  useEffect(() => {
    if (!subdomain) {
      setIsSubdomainValid(true);
    }

    const delayDebounceFn = setTimeout(() => {
      subdomain &&
        subdomain !== site.subdomain &&
        axios
          .get(
            `${process.env.REACT_APP_API_BASE}/api/sites/register-subdomain/${subdomain}`,
            { withCredentials: true }
          )
          .then(() => {
            setIsSubdomainValid(true);
            setSubdomainError("");
          })
          .catch((err) => {
            setIsSubdomainValid(false);
            setSuggestion(err.response.data.suggestion);
            setSubdomainError(SUBDOMAIN_TAKEN_ERROR);
          });
    }, 1000);

    if (subdomain?.match(WHITESPACE_REGEX)) {
      setSubdomainError("No spaces allowed.");
    } else {
      setSubdomainError("");
    }

    return () => clearTimeout(delayDebounceFn);
  }, [subdomain]);

  useBeforeunload((e) => {
    if (isDirty) {
      e.preventDefault();
    }
  });

  const stripIsLiveFromLinks = () =>
    links.map((link) => {
      if (link.live) {
        const { isLive, ...rest } = link.live;
        return {
          ...link,
          live: Object.keys(rest).length ? rest : undefined,
        };
      }
      return { ...link };
    });

  const onSave = () => {
    const siteToSave = {
      title,
      subtitle,
      subdomain,
      headerImage,
      headerEmoji,
      backgroundImage,
      links: stripIsLiveFromLinks(),
      titlesColor,
      containerColor,
      bodyColor,
      linkTextColor,
      linkBackgroundColor,
      liveNotificationColor,
      bodyGradient,
      containerGradient,
      bodyAnimationStyle,
    };

    isSubdomainValid &&
      !subdomainError &&
      axios
        .put(
          `${process.env.REACT_APP_API_BASE}/api/sites/siteId/${id}`,
          siteToSave,
          { withCredentials: true }
        )
        .then(() => {
          toast("Changes saved.", { type: "success", theme });
          setIsEditing(false);
          fetchSite(id, { skipLoading: true });
        })
        .catch((err) => {
          toast(err.response.data.error, { type: "error", theme });
          console.error("Error saving site: " + err);
        });
  };

  const onCancel = () => {
    setIsEditing(false);
    fetchSite(id, { skipLoading: true });
  };

  const addLink = () => {
    const newLinks = links.slice();
    newLinks.push({
      href: "https://www.google.com",
      text: "Google",
      icon: "fab_google",
      id: newLinks.length,
    });
    setLinks(newLinks);
  };

  const deleteLink = (index) => {
    const newLinks = links.slice();
    newLinks.splice(index, 1);
    setLinks(newLinks);
  };

  const openPexelsModal = (component) => {
    setIsPexelsModalShowing(true);
    setModalOpenedWith(component);
  };

  const openCheckDomainModal = () => {
    setIsCheckDomainModalShowing(true);
  };

  const closeCheckDomainModal = () => {
    setIsCheckDomainModalShowing(false);
    setDomainToAdd("");
    setIsDomainAvailable(false);
    setHasDomainBeenChecked(false);
    setHasDomainBeenRegistered(false);
  };

  const openRegisterDomainModal = () => {
    setIsCheckDomainModalShowing(false);
    setIsRegisterDomainModalShowing(true);
  };

  const closeRegisterDomainModal = () => {
    setIsRegisterDomainModalShowing(false);
    setDomainToAdd("");
    setIsDomainAvailable(false);
    setHasDomainBeenChecked(false);
    setHasDomainBeenRegistered(false);
  };

  const openDeleteDomainModal = (domain) => {
    setIsDeleteDomainModalShowing(true);
    setDomainToDelete(domain);
  };

  const closeDeleteDomainModal = () => {
    setIsDeleteDomainModalShowing(false);
    setDomainToDelete("");
  };

  const checkDomain = () => {
    let properDomain = domainToAdd.trim();

    if (properDomain.startsWith("https://")) {
      properDomain = properDomain.replace("https://", "");
    }

    if (properDomain.startsWith("http://")) {
      properDomain = properDomain.replace("http://", "");
    }

    const slash = properDomain.indexOf("/");
    if (slash !== -1) {
      properDomain = properDomain.slice(0, slash);
    }

    if (properDomain.toLowerCase().startsWith("www.")) {
      properDomain = properDomain.slice(4);
    }

    properDomain = properDomain.toLowerCase();

    setDomainToAdd(properDomain);

    axios
      .get(
        `${process.env.REACT_APP_API_BASE}/api/sites/check-domain/${properDomain}`,
        { withCredentials: true }
      )
      .then((res) => {
        setIsDomainAvailable(res.data.domain.isAvailable);
        setHasDomainBeenChecked(true);
      })
      .catch((err) => toast(err.response.data.error, { type: "error", theme }));
  };

  const registerDomain = () => {
    const body = {
      domain: hostnameForCustomDomainRegistration(domainToAdd),
      siteId: id,
    };

    axios
      .post(
        `${process.env.REACT_APP_API_BASE}/api/sites/register-domain`,
        body,
        { withCredentials: true }
      )
      .then((res) => {
        toast("Domain registered. Add the DNS records below to go live.", {
          type: "success",
          theme,
        });
        setHasDomainBeenRegistered(true);
        setCurrentDomainCname(res.data.cname);
        fetchSiteDomains();
      })
      .catch((err) => toast(err.response.data.error, { type: "error", theme }));
  };

  const deleteDomain = () => {
    axios
      .delete(
        `${process.env.REACT_APP_API_BASE}/api/sites/delete-domain/${domainToDelete}`,
        { withCredentials: true }
      )
      .then(() => {
        toast("Domain successfully deleted.", { type: "success", theme });
        setIsDeleteDomainModalShowing(false);
        fetchSiteDomains();
      })
      .catch((err) =>
        toast("Could not delete the domain. Please try again.", {
          type: "error",
          theme,
        })
      );
  };

  const moveLink = (from, to) => {
    const newLinks = links.slice();
    newLinks.splice(to, 0, newLinks.splice(from, 1)[0]);
    setLinks(newLinks);
  };

  const onEmojiClick = (emojiObject) => {
    setHeaderEmoji(emojiObject.emoji);
  };

  const standardizeColorInput = (input, setterCallback, ref) => {
    setterCallback(input);

    const isHex =
      input?.match(HEX_COLOR_REGEX_SHORT) || input?.match(HEX_COLOR_REGEX_LONG);
    const allColorNames = toHex.all().map((color) => color.name);

    if (isHex) {
      setterCallback(input.toUpperCase());
      ref.current = input.toUpperCase();
    } else if (allColorNames.includes(input.toLowerCase())) {
      setterCallback(toHex(input.toLowerCase()).toUpperCase());
      ref.current = toHex(input.toLowerCase()).toUpperCase();
    } else {
      ref.current = input;
    }

    setTimeout(() => {
      const { current } = ref;

      if (
        !current.match(HEX_COLOR_REGEX_SHORT) &&
        !current.match(HEX_COLOR_REGEX_LONG)
      ) {
        setterCallback("#000000");
        ref.current = "#000000";
      }
    }, 5000);
  };

  const handleAccordionChange = (panel) => (e, isExpanded) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  const hasUnsavedChanges = () =>
    title !== site.title ||
    subtitle !== site.subtitle ||
    subdomain !== site.subdomain ||
    imageFieldSrc(headerImage) !== imageFieldSrc(site.headerImage) ||
    imageFieldSrc(backgroundImage) !== imageFieldSrc(site.backgroundImage) ||
    JSON.stringify(linksForDirtyCompare(links)) !==
      JSON.stringify(linksForDirtyCompare(site?.links || [])) ||
    titlesColor !== site?.titlesColor ||
    containerColor !== site?.containerColor ||
    linkTextColor !== site?.linkTextColor ||
    linkBackgroundColor !== site?.linkBackgroundColor ||
    bodyColor !== site?.bodyColor ||
    headerEmoji !== site?.headerEmoji ||
    liveNotificationColor !== site?.liveNotificationColor ||
    bodyGradient !== site?.bodyGradient ||
    containerGradient !== site?.containerGradient ||
    (bodyAnimationStyle ?? "") !== (site?.bodyAnimationStyle ?? "");

  const deleteSite = () => {
    axios
      .delete(
        `${process.env.REACT_APP_API_BASE}/api/sites/siteId/${site._id}`,
        { withCredentials: true }
      )
      .then((res) => {
        toast("Site deleted.", { type: "success", theme });
        navigate("/dashboard");
      })
      .catch((err) => {
        toast(err.response.data.error, { type: "error", theme });
      });
  };

  useEffect(() => {
    const isCurrentlyDirty = hasUnsavedChanges();
    if (isCurrentlyDirty !== isDirty) {
      setIsDirty(isCurrentlyDirty);
    }
  }, [
    title,
    subtitle,
    subdomain,
    headerImage,
    headerEmoji,
    links,
    backgroundImage,
    titlesColor,
    containerColor,
    containerGradient,
    bodyColor,
    bodyGradient,
    linkTextColor,
    linkBackgroundColor,
    liveNotificationColor,
    bodyAnimationStyle,
    site,
  ]);

  const onMouseEnter = (index) => {
    setHoveredLinkIndex(index);
  };

  const onMouseLeave = () => {
    setHoveredLinkIndex(null);
  };

  const getTabSection = (index) => {
    switch (index) {
      case 1:
        return (
          <div
            className={`${styles.editContents} ${styles.editContentsCenterSubs}`}
          >
            <h1>Style</h1>
            <h2>Link Text Color</h2>
            <HexColorPicker
              color={linkTextColor}
              onChange={(e) => setLinkTextColor(e.toUpperCase())}
            />
            <TextField
              type="text"
              value={linkTextColor}
              onChange={(e) =>
                standardizeColorInput(
                  e.target.value,
                  setLinkTextColor,
                  linkTextColorRef
                )
              }
              className={styles.textField}
              size="small"
              variant="filled"
            />
            <h2>Link Background Color</h2>
            <HexColorPicker
              color={linkBackgroundColor}
              onChange={(e) => setLinkBackgroundColor(e.toUpperCase())}
            />
            <TextField
              type="text"
              value={linkBackgroundColor}
              onChange={(e) =>
                standardizeColorInput(
                  e.target.value,
                  setLinkBackgroundColor,
                  linkBackgroundColorRef
                )
              }
              className={styles.textField}
              size="small"
              variant="filled"
            />
            <h2>Live Notification Color</h2>
            <HexColorPicker
              color={liveNotificationColor}
              onChange={(e) => setLiveNotificationColor(e.toUpperCase())}
            />
            <TextField
              type="text"
              value={liveNotificationColor}
              onChange={(e) =>
                standardizeColorInput(
                  e.target.value,
                  setLiveNotificationColor,
                  liveNotificationColorRef
                )
              }
              className={styles.textField}
              size="small"
              variant="filled"
            />
            <h2>Body Color</h2>
            <HexColorPicker
              color={bodyColor}
              onChange={(e) => setBodyColor(e.toUpperCase())}
            />
            <TextField
              type="text"
              value={bodyColor}
              onChange={(e) =>
                standardizeColorInput(
                  e.target.value,
                  setBodyColor,
                  bodyColorRef
                )
              }
              className={styles.textField}
              size="small"
              variant="filled"
            />
            <h2>Body Gradient</h2>
            <GradientPicker
              setter={(value) => setBodyGradient(value)}
              value={bodyGradient}
              place="body"
              isContainerTransparent={null}
            />
            <h2>Body Animation</h2>
            <Select
              value={bodyAnimationStyle ?? ""}
              onChange={(e) => setBodyAnimationStyle(e.target.value)}
              style={{ marginBottom: "20px" }}
            >
              <MenuItem value="">none</MenuItem>
              <MenuItem value="absorbers">absorbers</MenuItem>
              <MenuItem value="amongUs">amongUs</MenuItem>
              <MenuItem value="background">background</MenuItem>
              <MenuItem value="big">big</MenuItem>
              <MenuItem value="bubble">bubble</MenuItem>
              <MenuItem value="chars">chars</MenuItem>
              <MenuItem value="collisions">collisions</MenuItem>
              <MenuItem value="confetti">confetti</MenuItem>
              <MenuItem value="connect">connect</MenuItem>
              <MenuItem value="defaultAnim">default</MenuItem>
              <MenuItem value="divRepulse">divRepulse</MenuItem>
              <MenuItem value="emmiterAbsorber">emmiterAbsorber</MenuItem>
              <MenuItem value="emitters">emitters</MenuItem>
              <MenuItem value="fontawesome">fontawesome</MenuItem>
              <MenuItem value="growing">growing</MenuItem>
              <MenuItem value="hollowknight">hollowknight</MenuItem>
              <MenuItem value="images">images</MenuItem>
              <MenuItem value="multiplePolygonMasks">
                multiplePolygonMasks
              </MenuItem>
              <MenuItem value="nasa">nasa</MenuItem>
              <MenuItem value="noconfig">noconfig</MenuItem>
              <MenuItem value="nyancat">nyancat</MenuItem>
              <MenuItem value="nyancat2">nyancat2</MenuItem>
              <MenuItem value="parallax">parallax</MenuItem>
              <MenuItem value="polygonMask">polygonMask</MenuItem>
              <MenuItem value="polygons">polygons</MenuItem>
              <MenuItem value="preset">preset</MenuItem>
              <MenuItem value="random">random</MenuItem>
              <MenuItem value="shadow">shadow</MenuItem>
              <MenuItem value="slow">slow</MenuItem>
              <MenuItem value="snow">snow</MenuItem>
              <MenuItem value="star">star</MenuItem>
              <MenuItem value="trail">trail</MenuItem>
              <MenuItem value="twinkle">twinkle</MenuItem>
              <MenuItem value="virus">virus</MenuItem>
              <MenuItem value="warp">warp</MenuItem>
            </Select>
            {bodyAnimationStyle && isEditing && (
              <Particles
                id="tsparticlessmall"
                init={particlesInit}
                loaded={particlesLoaded}
                options={{
                  ...ANIMATION_PRESETS[bodyAnimationStyle],
                  autoplay: true,
                  fullScreen: { enable: false },
                  style: { height: "200px", width: "200px" },
                }}
              />
            )}
            <h2>Container Color</h2>
            <HexColorPicker
              color={containerColor}
              onChange={(e) => setContainerColor(e.toUpperCase())}
            />
            <TextField
              type="text"
              value={containerColor}
              onChange={(e) =>
                standardizeColorInput(
                  e.target.value,
                  setContainerColor,
                  containerColorRef
                )
              }
              className={styles.textField}
              size="small"
              variant="filled"
            />
            <h3>Transparent container?</h3>
            <Checkbox
              checked={isContainerTransparent}
              onChange={(e) => setIsContainerTransparent(e.target.checked)}
            />
            <h2>Container Gradient</h2>
            <GradientPicker
              setter={(value) => setContainerGradient(value)}
              value={containerGradient}
              place="container"
              isContainerTransparent={containerColor === "#00000000"}
            />
            <h1>Images</h1>

            <div className={styles.titleAndClear}>
              <h2>Header Image</h2>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => setHeaderImage("")}
                aria-label="Clear header image"
              >
                <FontAwesomeIcon icon={["fas", "times"]} size="xs" />
              </button>
            </div>
            <div className={styles.headerWarning}>
              Note: Emojis override images in the header. You can clear an emoji
              to use an image.
            </div>
            <img
              src={
                headerImageDisplayUrl ||
                imageFieldSrc(headerImage) ||
                defaultHeader
              }
              width="200"
              height="200"
              alt="header"
              className={styles.editImage}
            />
            <ImageFilePicker
              ariaLabel="Upload header image"
              hint="PNG, JPG, or GIF — you'll crop to a square in the next step"
              onDone={(file) =>
                setSquareCrop({
                  imageSrc: file.base64,
                  target: IMAGE_TYPE.HEADER,
                })
              }
            />
            <button className={styles.mediaBtn} onClick={() => openPexelsModal(IMAGE_TYPE.HEADER)}>
              Choose from Pexels
            </button>
            <button className={styles.mediaBtn} onClick={() => setIsGiphyModalShowing(true)}>
              Choose from GIPHY
            </button>

            <div className={styles.titleAndClear}>
              <h2>Header Emoji</h2>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => setHeaderEmoji("")}
                aria-label="Clear header emoji"
              >
                <FontAwesomeIcon icon={["fas", "times"]} size="xs" />
              </button>
            </div>
            {headerEmoji && (
              <div className={styles.selectedEmoji}>{headerEmoji}</div>
            )}
            <Picker onEmojiClick={onEmojiClick} autoFocusSearch={false} />

            <div className={styles.titleAndClear}>
              <h2>Background Image</h2>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => setBackgroundImage("")}
                aria-label="Clear background image"
              >
                <FontAwesomeIcon icon={["fas", "times"]} size="xs" />
              </button>
            </div>
            <img
              src={
                backgroundImageDisplayUrl ||
                imageFieldSrc(backgroundImage) ||
                defaultHeader
              }
              alt="background"
              className={styles.editBackgroundImage}
            />
            <ImageFilePicker
              ariaLabel="Upload background image"
              hint="PNG, JPG, or GIF — you'll crop to a wide frame next"
              onDone={(file) =>
                setSquareCrop({
                  imageSrc: file.base64,
                  target: IMAGE_TYPE.BACKGROUND,
                })
              }
            />
            <button className={styles.mediaBtn} onClick={() => openPexelsModal(IMAGE_TYPE.BACKGROUND)}>
              Choose from Pexels
            </button>
          </div>
        );
      case 2:
        return (
          <div className={styles.editContents}>
            <AnalyticsTab siteId={id} />
          </div>
        );
      case 3:
        return (
          <div
            className={`${styles.editContents} ${styles.editContentsCenterSubs}`}
          >
            <h1>Settings</h1>
            <h2>Title</h2>
            <TextField
              type="text"
              value={title}
              placeholder="Title"
              onChange={(e) => setTitle(e.target.value)}
              className={styles.textField}
              size="small"
              variant="filled"
            />
            <h2>Subtitle</h2>
            <TextField
              type="text"
              value={subtitle}
              placeholder="Subtitle"
              onChange={(e) => setSubtitle(e.target.value)}
              className={styles.textField}
              size="small"
              variant="filled"
            />
            <h2>Title Color</h2>
            <HexColorPicker color={titlesColor} onChange={setTitlesColor} />
            <TextField
              type="text"
              value={titlesColor}
              onChange={(e) =>
                standardizeColorInput(
                  e.target.value,
                  setTitlesColor,
                  titlesColorRef
                )
              }
              className={styles.textField}
              size="small"
              variant="filled"
            />
            <h1>Site/Domains</h1>
            <h2>Subdomain</h2>
            <div className={styles.siteAndPath}>
              <TextField
                type="text"
                className={styles.textField}
                value={subdomain}
                name="subdomain"
                onChange={(e) => setSubdomain(e.target.value)}
                placeholder="subdomain"
                variant="filled"
                size="small"
                error={!isSubdomainValid || subdomainError}
                helperText={subdomainError}
              />
              .mostlink.co
            </div>
            {subdomain && subdomainError === SUBDOMAIN_TAKEN_ERROR && (
              <div
                onClick={() => setSubdomain(suggestion)}
                className={styles.suggestion}
              >
                How about {suggestion}?
              </div>
            )}
            <h2>Live Sites</h2>
            {process.env.REACT_APP_ENVIRONMENT === "production" ||
            process.env.REACT_APP_ENVIRONMENT === "development" ? (
              <>
                <a
                  href={`https://${site.subdomain}.${process.env.REACT_APP_HOSTED_BASE}`}
                  style={{ color: themeObj.color }}
                  target="_blank"
                  rel="noreferrer"
                >
                  https://{site.subdomain}.{process.env.REACT_APP_HOSTED_BASE}
                </a>
                <br />
                <a
                  href={`https://${process.env.REACT_APP_HOSTED_BASE_SHORT}/${site.subdomain}`}
                  style={{ color: themeObj.color }}
                  target="_blank"
                  rel="noreferrer"
                >
                  https://{process.env.REACT_APP_HOSTED_BASE_SHORT}/{site.subdomain}
                </a>
              </>
            ) : (
              <>
                <a
                  href={`${process.env.REACT_APP_HOSTED_BASE}/${site.subdomain}`}
                  style={{ color: themeObj.color }}
                  target="_blank"
                  rel="noreferrer"
                >
                  {process.env.REACT_APP_HOSTED_BASE}/{site.subdomain}
                </a>
              </>
            )}
            <h2>Domains</h2>
            <button className={styles.addBtn} onClick={openCheckDomainModal}>Add a domain</button>
            {domains.length ? (
              <>
                <ul className={styles.domainList}>
                  {domains.map((data) => {
                    return (
                      <li key={data.domain} className={styles.domainListDomain}>
                        <a
                          href={`https://${data.domain}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: themeObj.color }}
                        >
                          {`https://${data.domain}`}
                        </a>
                        &nbsp;
                        {data.isPointing ? (
                          <FontAwesomeIcon
                            icon={["fas", "check"]}
                            color={themeObj.accentColor}
                          />
                        ) : (
                          <FontAwesomeIcon
                            icon={["fas", "window-close"]}
                            color="salmon"
                          />
                        )}
                        &nbsp;
                        <button
                          className={styles.smallDangerBtn}
                          onClick={() => openDeleteDomainModal(data.domain)}
                        >
                          Delete
                        </button>
                        <br />
                        {data.isPointing ? null : (
                          <div>
                            CNAME: <br />
                            {data.cname}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
                {domains.some((d) => !d.isPointing) ? (
                  <p>
                    Reminder: in DNS, point this hostname at the CNAME shown (for
                    subdomains like app.example.com, add a CNAME for that host; for
                    apex domains we register a www host by default).
                  </p>
                ) : null}
              </>
            ) : (
              <div>You have no domains.</div>
            )}
            <button
              onClick={() => setIsDeleteModalShowing(true)}
              className={styles.deleteSiteButton}
            >
              Delete Site
            </button>
          </div>
        );
      default:
        return (
          <div className={styles.editContents}>
            <h1>Links</h1>
            <button className={styles.addLinkBtn} onClick={addLink}>+ Add link</button>
            <ul className={styles.linkEditList}>
              {links?.map((link, index) => {
                return (
                  <EditableLink
                    link={link}
                    links={links}
                    setLinks={setLinks}
                    deleteLink={deleteLink}
                    moveLink={moveLink}
                    index={index}
                    key={link.id}
                    id={link.id}
                  />
                );
              })}
            </ul>
          </div>
        );
    }
  };

  const getDisplayContents = (
    thisTitle,
    thisSubtitle,
    thisHeaderImage,
    theseLinks,
    titlesColor,
    thisContainerColor,
    thisContainerGradient,
    thisBodyColor,
    thisBodyGradient,
    thisLinkTextColor,
    thisLinkBackgroundColor,
    thisLiveNotificationColor,
    thisBodyAnimationStyle
  ) => {
    const w = windowDimensions.width;
    const h = windowDimensions.height;
    const isNarrow = w < 1024;

    const isPreviewMobile = previewViewport === "mobile";
    const previewIntrinsicW = isPreviewMobile ? 350 : 800;
    const previewIntrinsicH = isPreviewMobile ? 700 : 700;

    let previewScale;
    if (isNarrow) {
      if (isPreviewMobile) {
        if (w < 380) {
          previewScale = 0.5;
        } else if (w < 480) {
          previewScale = 0.56;
        } else if (w < 600) {
          previewScale = 0.64;
        } else {
          previewScale = 0.72;
        }
      } else {
        const colW = Math.max(200, w - 32);
        const colH = Math.max(240, h * 0.42);
        previewScale = Math.min(
          colW / previewIntrinsicW,
          colH / previewIntrinsicH,
          0.95
        );
      }
    } else if (isPreviewMobile) {
      previewScale = h >= 800 ? h / 1000 : 0.8;
    } else {
      const colW = w * 0.5 - 56;
      const colH = h - 80 - 64;
      previewScale = Math.min(
        colW / previewIntrinsicW,
        colH / previewIntrinsicH,
        1
      ) * 0.96;
    }

    const containerPosition = isNarrow ? "relative" : "absolute";

    const dirty = hasUnsavedChanges();
    const accent = themeObj.accentColor;

    return (
      <div className={styles.bodyContainer}>
        <div className={styles.singleSiteWrapper}>
          {thisBodyAnimationStyle && !isEditing && memoizedParticles}
          <div
            className={styles.tabSection}
            style={{
              color: themeObj.color,
              backgroundColor: themeObj.editTrayBackground,
            }}
          >
            <div className={styles.saveToolbar}>
              <button
                type="button"
                className={styles.cancelFab}
                disabled={!dirty}
                onClick={onCancel}
                aria-label={
                  dirty
                    ? "Discard unsaved changes"
                    : "No unsaved changes to discard"
                }
                style={{
                  color: dirty ? accent : themeObj.color,
                  borderColor: dirty ? `${accent}88` : `${accent}40`,
                  backgroundColor: dirty ? `${accent}14` : `${accent}08`,
                }}
              >
                <FontAwesomeIcon
                  icon={["fas", "arrow-rotate-left"]}
                  size="lg"
                  style={{ color: dirty ? accent : themeObj.color }}
                />
                <span className={styles.saveFabLabel}>Cancel</span>
              </button>
              <button
                type="button"
                className={styles.saveFab}
                disabled={!dirty}
                onClick={onSave}
                aria-label={dirty ? "Save changes" : "No changes to save"}
                style={{
                  color: dirty ? accent : themeObj.color,
                  backgroundColor: dirty ? `${accent}18` : `${accent}0c`,
                }}
              >
                <FontAwesomeIcon
                  icon={["fas", "save"]}
                  size="lg"
                  style={{ color: dirty ? accent : themeObj.color }}
                />
                <span className={styles.saveFabLabel}>Save</span>
              </button>
            </div>

            {getTabSection(singleSiteTabIndex)}
          </div>
          <div
            className={styles.previewColumn}
            role="region"
            aria-label="Live preview of your page"
          >
            <div
              className={styles.previewToolbar}
              role="group"
              aria-label="Preview viewport"
              style={{
                borderColor: `${accent}40`,
                backgroundColor: `${themeObj.editTrayBackground}e6`,
              }}
            >
              <button
                type="button"
                className={styles.previewSegmentButton}
                onClick={() => setPreviewViewport("mobile")}
                aria-pressed={isPreviewMobile}
                style={
                  isPreviewMobile
                    ? {
                        color: accent,
                        borderColor: `${accent}66`,
                        backgroundColor: `${accent}18`,
                      }
                    : { color: themeObj.color }
                }
              >
                <FontAwesomeIcon icon={["fas", "mobile-screen-button"]} />
                <span>Mobile</span>
              </button>
              <button
                type="button"
                className={styles.previewSegmentButton}
                onClick={() => setPreviewViewport("desktop")}
                aria-pressed={!isPreviewMobile}
                style={
                  !isPreviewMobile
                    ? {
                        color: accent,
                        borderColor: `${accent}66`,
                        backgroundColor: `${accent}18`,
                      }
                    : { color: themeObj.color }
                }
              >
                <FontAwesomeIcon icon={["fas", "laptop"]} />
                <span>Desktop</span>
              </button>
            </div>

            <div className={styles.previewStage}>
            <div
              className={
                isPreviewMobile
                  ? styles.singleSiteContainer
                  : `${styles.singleSiteContainer} ${styles.singleSiteContainerDesktop}`
              }
              style={{
                backgroundColor: !thisContainerGradient && thisContainerColor,
                backgroundImage: thisContainerGradient,
                transform: isNarrow
                  ? `scale(${previewScale})`
                  : `translate(-50%, -50%) scale(${previewScale})`,
                transformOrigin: isNarrow ? "top center" : "center center",
                position: containerPosition,
                top: isNarrow ? "auto" : "50%",
                left: isNarrow ? "auto" : "50%",
                right: "auto",
                marginLeft: isNarrow ? "auto" : undefined,
                marginRight: isNarrow ? "auto" : undefined,
              }}
            >
            {isPreviewMobile ? (
              <img
                src={iPhoneImage}
                className={styles.iPhone}
                alt=""
                aria-hidden
              />
            ) : null}

            <div
              className={
                isPreviewMobile
                  ? styles.singleSiteContents
                  : `${styles.singleSiteContents} ${styles.singleSiteContentsDesktop}`
              }
            >
              {headerEmoji ? (
                <div className={styles.headerEmoji}>{headerEmoji}</div>
              ) : (
                <img
                  src={thisHeaderImage || defaultHeader}
                  alt={title}
                  className={styles.headerImage}
                  width="200"
                  height="200"
                />
              )}
              <h1 className={styles.singleTitle} style={{ color: titlesColor }}>
                {thisTitle}
              </h1>
              <h3
                className={styles.singleSubtitle}
                style={{ color: titlesColor }}
              >
                {thisSubtitle}
              </h3>
              {links ? (
                <ul
                  className={
                    isPreviewMobile
                      ? styles.linksList
                      : `${styles.linksList} ${styles.linksListDesktop}`
                  }
                >
                  {theseLinks?.map((link, i) => {
                    const hoverStyle = {
                      color: thisLinkBackgroundColor,
                      background: thisLinkTextColor,
                    };
                    const nonHoverStyle = {
                      color: thisLinkTextColor,
                      background: thisLinkBackgroundColor,
                    };

                    return (
                      <a
                        href={
                          link.href.startsWith("http")
                            ? link.href
                            : "https://" + link.href
                        }
                        target="_blank"
                        rel="noreferrer"
                        className={
                          isPreviewMobile
                            ? styles.individualLink
                            : `${styles.individualLink} ${styles.individualLinkDesktop}`
                        }
                        style={{
                          color:
                            hoveredLinkIndex === i
                              ? hoverStyle.color
                              : nonHoverStyle.color,
                          background:
                            hoveredLinkIndex === i
                              ? hoverStyle.background
                              : nonHoverStyle.background,
                        }}
                        key={i}
                        onMouseEnter={() => onMouseEnter(i)}
                        onMouseLeave={onMouseLeave}
                      >
                        <div className={styles.linkTextAndLiveStatus}>
                          <div className={styles.linkText}>{link.text}</div>
                          {link.live ? (
                            <div>
                              {link.live.isLive ? (
                                <>
                                  <span>-</span>
                                  <span
                                    style={{
                                      color: thisLiveNotificationColor,
                                    }}
                                  >
                                    {" "}
                                    LIVE!
                                  </span>
                                </>
                              ) : (
                                "- not live"
                              )}
                            </div>
                          ) : null}
                        </div>
                        <FontAwesomeIcon icon={link?.icon?.split("_")} />
                      </a>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const keyFramesStartEditTray = `
        @keyframes edit-tray-move-right {
            0% {
                left: -600px;
            }

            100% {
                left: 0;
            }
        }
    `;

  const editTrayStyle = {
    left: isEditing ? 0 : "-600px",
  };

  const keyFramesEndEditTray = `
        @keyframes edit-tray-move-left {
            0% {
                left: 0;
            }

            100% {
                left: -600px;
            }
        }
    `;

  const onEscKey = (e) => {
    if (e.key === "Escape") {
      setSquareCrop(null);
      setIsPexelsModalShowing(false);
      setIsGiphyModalShowing(false);
      setIsDeleteModalShowing(false);
      setIsCheckDomainModalShowing(false);
      setIsRegisterDomainModalShowing(false);
      setIsDeleteDomainModalShowing(false);
    }
  };

  return (
    <>
      {siteLoading ? (
        <div
          className={styles.loadingContainer}
          style={{ backgroundColor: themeObj.sitesBoxColor }}
        >
          <div className={styles.ldsCircle}>
            <div></div>
          </div>
        </div>
      ) : (
        <div onKeyDown={onEscKey} tabIndex="0">
          <style
            children={isEditing ? keyFramesStartEditTray : keyFramesEndEditTray}
          />

          {/* tabs go here */}

          {getDisplayContents(
            title,
            subtitle,
            headerImageDisplayUrl || imageFieldSrc(headerImage),
            links,
            titlesColor,
            containerColor,
            containerGradient,
            bodyColor,
            bodyGradient,
            linkTextColor,
            linkBackgroundColor,
            liveNotificationColor,
            bodyAnimationStyle
          )}
          {isPexelsModalShowing ? (
            <>
              <div
                className={styles.blocker}
                onClick={() => setIsPexelsModalShowing(false)}
              />
              <div className={styles.pexelsModal}>
                <div
                  className={styles.closeButton}
                  onClick={() => setIsPexelsModalShowing(false)}
                >
                  +
                </div>
                <span>
                  Find and select a photo for your {modalOpenedWith} image from{" "}
                  <a
                    href="https://www.pexels.com"
                    style={{ color: themeObj.accentColor }}
                  >
                    Pexels
                  </a>
                </span>
                <form
                  className={styles.pexelsSearch}
                  onSubmit={fetchPexels}
                  onKeyDown={onKeyDownPexels}
                >
                  <TextField
                    type="text"
                    value={query}
                    placeholder="Search"
                    onChange={(e) => setQuery(e.target.value)}
                    className={styles.textField}
                    size="small"
                    variant="filled"
                  />
                  <button className={styles.searchBtn} onClick={fetchPexels} type="submit">
                    Search
                  </button>
                </form>
                <div className={styles.photos}>
                  {photos?.map((photo) => {
                    return (
                      <img
                        src={photo.src.tiny}
                        alt="pexel result"
                        width="100"
                        height="100"
                        onClick={() => {
                          setIsPexelsModalShowing(false);
                          if (modalOpenedWith === IMAGE_TYPE.BACKGROUND) {
                            setSquareCrop({
                              imageSrc: photo.src.original,
                              target: IMAGE_TYPE.BACKGROUND,
                            });
                          } else {
                            setSquareCrop({
                              imageSrc: photo.src.original,
                              target: IMAGE_TYPE.HEADER,
                            });
                          }
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </>
          ) : null}
          {squareCrop ? (
            <SquareImageCropModal
              key={squareCrop.imageSrc}
              imageSrc={squareCrop.imageSrc}
              theme={theme}
              accentColor={themeObj.accentColor}
              aspect={
                squareCrop.target === IMAGE_TYPE.BACKGROUND
                  ? BACKGROUND_CROP_ASPECT
                  : 1
              }
              cropTitle={
                squareCrop.target === IMAGE_TYPE.BACKGROUND
                  ? "Crop background"
                  : undefined
              }
              onCancel={() => setSquareCrop(null)}
              onApply={(value) => {
                const store =
                  typeof value === "string" && value.startsWith("storage:")
                    ? value
                    : { base64: value };
                if (squareCrop.target === IMAGE_TYPE.HEADER) {
                  setHeaderImage(store);
                } else {
                  setBackgroundImage(store);
                }
                setSquareCrop(null);
              }}
            />
          ) : null}
          {isGiphyModalShowing ? (
            <>
              <div
                className={styles.blocker}
                onClick={() => setIsGiphyModalShowing(false)}
              />
              <div className={styles.pexelsModal}>
                <div
                  className={styles.closeButton}
                  onClick={() => setIsGiphyModalShowing(false)}
                >
                  +
                </div>
                <span>
                  Find and select a photo for your header image from{" "}
                  <a
                    href="https://www.giphy.com"
                    style={{ color: themeObj.accentColor }}
                  >
                    GIPHY
                  </a>
                </span>
                <form
                  className={styles.pexelsSearch}
                  onSubmit={fetchGiphy}
                  onKeyDown={onKeyDownGiphy}
                >
                  <TextField
                    type="text"
                    value={gifQuery}
                    placeholder="Search"
                    onChange={(e) => setGifQuery(e.target.value)}
                    className={styles.textField}
                    size="small"
                    variant="filled"
                  />
                  <button className={styles.searchBtn} onClick={fetchGiphy} type="submit">
                    Search
                  </button>
                </form>
                <div className={styles.photos}>
                  {gifs?.map((gif) => {
                    return (
                      <img
                        src={`https://media.giphy.com/media/${gif.id}/giphy.gif`}
                        alt="giphy result"
                        width="100"
                        height="100"
                        onClick={() => {
                          setIsGiphyModalShowing(false);
                          setSquareCrop({
                            imageSrc: `https://media.giphy.com/media/${gif.id}/giphy.gif`,
                            target: IMAGE_TYPE.HEADER,
                          });
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </>
          ) : null}
          {isDeleteModalShowing ? (
            <>
              <div
                className={styles.blocker}
                onClick={() => setIsDeleteModalShowing(false)}
              ></div>
              <div className={styles.deleteSiteModal}>
                <div
                  className={styles.closeButton}
                  onClick={() => setIsDeleteModalShowing(false)}
                >
                  +
                </div>
                <h1>Delete site</h1>
                <p>
                  Are you sure you want to delete this site? Your site will be
                  lost forever (a long time!)
                </p>
                <div className={styles.deleteSiteButtons}>
                  <button
                    className={styles.cancelButton}
                    onClick={() => setIsDeleteModalShowing(false)}
                  >
                    Cancel
                  </button>
                  <button className={styles.deleteButton} onClick={deleteSite}>
                    Delete
                  </button>
                </div>
              </div>
            </>
          ) : null}
          {isCheckDomainModalShowing ? (
            !hasDomainBeenChecked ? (
              <>
                <div
                  className={styles.blocker}
                  onClick={closeCheckDomainModal}
                ></div>
                <div className={styles.deleteSiteModal}>
                  <div
                    className={styles.closeButton}
                    onClick={closeCheckDomainModal}
                  >
                    +
                  </div>
                  <h1>Add a domain</h1>
                  <TextField
                    type="text"
                    name="domainToAdd"
                    value={domainToAdd}
                    onChange={(e) => setDomainToAdd(e.target.value)}
                    placeholder="e.g. example.com or app.example.com"
                    className={styles.textField}
                    size="small"
                    variant="filled"
                  />
                  <div className={styles.deleteSiteButtons}>
                    <button
                      className={styles.deleteButton}
                      onClick={closeCheckDomainModal}
                    >
                      Cancel
                    </button>
                    <button
                      className={styles.cancelButton}
                      onClick={checkDomain}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </>
            ) : isDomainAvailable ? (
              <>
                <div
                  className={styles.blocker}
                  onClick={closeCheckDomainModal}
                ></div>
                <div className={styles.deleteSiteModal}>
                  <div
                    className={styles.closeButton}
                    onClick={closeCheckDomainModal}
                  >
                    +
                  </div>
                  <h1>This domain is available</h1>
                  <h2>{domainToAdd}</h2>
                  <p>
                    Please register this domain through your favorite registrar
                    and come back. We plan on adding a domain registration
                    feature in the future.
                  </p>
                  <div className={styles.deleteSiteButtons}>
                    <button
                      className={styles.cancelButton}
                      onClick={closeCheckDomainModal}
                    >
                      Okay
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div
                  className={styles.blocker}
                  onClick={closeCheckDomainModal}
                ></div>
                <div className={styles.deleteSiteModal}>
                  <div
                    className={styles.closeButton}
                    onClick={closeCheckDomainModal}
                  >
                    +
                  </div>
                  <h1>Domain taken</h1>
                  <h2>Do you own this domain?</h2>
                  <h2>{domainToAdd}</h2>
                  <div className={styles.deleteSiteButtons}>
                    <button
                      className={styles.deleteButton}
                      onClick={closeCheckDomainModal}
                    >
                      No
                    </button>
                    <button
                      className={styles.cancelButton}
                      onClick={openRegisterDomainModal}
                    >
                      Yes
                    </button>
                  </div>
                </div>
              </>
            )
          ) : null}
          {isRegisterDomainModalShowing ? (
            !hasDomainBeenRegistered ? (
              <>
                <div
                  className={styles.blocker}
                  onClick={closeRegisterDomainModal}
                ></div>
                <div className={styles.deleteSiteModal}>
                  <div
                    className={styles.closeButton}
                    onClick={closeRegisterDomainModal}
                  >
                    +
                  </div>
                  <h1>Register a domain</h1>
                  <h2>Do you want to register this domain? {domainToAdd}</h2>
                  <div className={styles.deleteSiteButtons}>
                    <button
                      className={styles.deleteButton}
                      onClick={closeRegisterDomainModal}
                    >
                      Cancel
                    </button>
                    <button
                      className={styles.cancelButton}
                      onClick={registerDomain}
                    >
                      Register
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div
                  className={styles.blocker}
                  onClick={closeRegisterDomainModal}
                ></div>
                <div className={styles.deleteSiteModal}>
                  <div
                    className={styles.closeButton}
                    onClick={closeRegisterDomainModal}
                  >
                    +
                  </div>
                  <h1>Registered!</h1>
                  <h2>{domainToAdd}</h2>
                  <p>
                    Please add a "www" CNAME at your registrar
                    <br />
                    that points at our server: <br /> {currentDomainCname}
                  </p>
                  <div className={styles.deleteSiteButtons}>
                    <button
                      className={styles.cancelButton}
                      onClick={closeRegisterDomainModal}
                    >
                      Okay
                    </button>
                  </div>
                </div>
              </>
            )
          ) : null}
          {isDeleteDomainModalShowing ? (
            <>
              <div
                className={styles.blocker}
                onClick={closeDeleteDomainModal}
              ></div>
              <div className={styles.deleteSiteModal}>
                <div
                  className={styles.closeButton}
                  onClick={closeDeleteDomainModal}
                >
                  +
                </div>
                <h1>Delete domain</h1>
                <h2>
                  Are you sure you want to delete this domain? {domainToDelete}
                </h2>
                <div className={styles.deleteSiteButtons}>
                  <button
                    className={styles.cancelButton}
                    onClick={closeDeleteDomainModal}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={deleteDomain}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}
    </>
  );
};

export default SingleSite;
