import './main.css';

const GOOGLE_ANALYTICS_DELAY_MS = 30;

const REPAIR_ORG_URLS = {};

const REPAIR_ORG_FULL_PAGE_URLS = {};

let joinUrls = null;
let isMaximizing = false;
let language = 'en';

function maximize () {
  if (isMaximizing) {
    return;
  }
  isMaximizing = true;
  postMessage('maximize');
  const stickyFooter = document.querySelector('.dcs-footer');
  stickyFooter.style.display = 'none';

  const fullPage = document.querySelector('.dcs-full-page');
  fullPage.style.display = 'flex';
}

function isTruthy (str) {
  return typeof(str) === 'undefined' || `${str}` === 'true' || `${str}` === '1';
}

function parseQuery (queryString) {
  var query = {};
  var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split('=');
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }
  return query;
}

function postMessage (action, data) {
  data || (data = {});
  data.action = action;
  data.REPAIR_ORG = true;
  window.parent.postMessage(data, '*');
}

function handleCloseButtonClick (event) {
  event.preventDefault();
  event.stopPropagation();

  //adding delay to allow google analytics call to complete
  setTimeout(() => {
    postMessage('closeButtonClicked');
  }, GOOGLE_ANALYTICS_DELAY_MS);
}

function handleButtonClick (event) {
  event.preventDefault();
  event.stopPropagation();

  //adding delay to allow google analytics call to complete
  setTimeout(() => {
    postMessage('actionClicked');
  }, GOOGLE_ANALYTICS_DELAY_MS);
}

function attachEvent (selector, event, callback) {
  var elements = document.querySelectorAll(selector);
  for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener(event, callback);
  }
}

function initGoogleAnalytics () {
  (function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function () {
      (i[r].q = i[r].q || []).push(arguments);
    }, i[r].l = 1 * new Date();
    a = s.createElement(o),
      m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m);
  })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

  if (typeof window.ga !== 'undefined') {
    window.ga('create', 'UA-56309303-15', 'auto');
    window.ga('send', 'pageview');
  }
}

function addTrackingEvents (hostname) {
  attachEvent('.dcs-footer .dcs-button', 'click', () => {
    trackEvent('footer-join-button', 'click', hostname);
  });

  attachEvent('.dcs-footer .dcs-close', 'click', () => trackEvent('footer-close-button', 'click', hostname));

  trackEvent('footer-widget', 'load', hostname);
}

function trackEvent (category, action, label, value) {
  if (!window.ga) {
    return;
  }

  const params = {
    hitType: 'event',
    eventCategory: category,
    eventAction: action
  };

  if (label) {
    params.eventLabel = label;
  }

  if (value) {
    params.eventValue = value;
  }
  window.ga('send', params);
}

function initializeInterface () {
  const query = parseQuery(location.search);
  const isFullPage = false;

  joinUrls = isFullPage ? REPAIR_ORG_FULL_PAGE_URLS : REPAIR_ORG_URLS;

  attachEvent('.dcs-close', 'click', handleCloseButtonClick);
  attachEvent('.dcs-button', 'click', handleButtonClick);
  attachEvent('.dcs-footer__logo', 'click', handleButtonClick);

  language = 'en';

  if (isTruthy(query.googleAnalytics) && !navigator.doNotTrack) {
    initGoogleAnalytics();
    addTrackingEvents(query.hostname);
  }
}

document.addEventListener('DOMContentLoaded', initializeInterface);
