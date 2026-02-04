import React from 'react';
import ReactDOM from 'react-dom/client';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import './index.css';
import App from './App';

const originalSwalFire = Swal.fire.bind(Swal);
const baseSwalOptions = {
  backdrop: 'rgba(0, 0, 0, 0.55)',
  buttonsStyling: false,
  customClass: {
    popup: 'bg-base-100 text-base-content rounded-box shadow-xl',
    title: 'text-base-content',
    htmlContainer: 'text-base-content',
    actions: 'gap-2',
    confirmButton: 'btn btn-primary',
    cancelButton: 'btn btn-ghost',
    denyButton: 'btn btn-secondary',
  },
};

const resolveDaisyUiComputedStyles = (() => {
  let cachedTheme = null;
  let cached = null;

  const readClassStyle = (className, property) => {
    const el = document.createElement('div');
    el.className = className;
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    el.style.top = '-9999px';
    el.style.pointerEvents = 'none';
    document.body.appendChild(el);
    const value = getComputedStyle(el)[property];
    el.remove();
    return value;
  };

  return () => {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    if (cached && cachedTheme === theme) return cached;

    cachedTheme = theme;
    cached = {
      popupBackgroundColor: readClassStyle('bg-base-100', 'backgroundColor'),
      popupTextColor: readClassStyle('text-base-content', 'color'),
      popupBorderColor: readClassStyle('border border-base-300', 'borderTopColor'),
    };
    return cached;
  };
})();

const syncSwalCssVarsWithDaisyUiTheme = () => {
  const styles = resolveDaisyUiComputedStyles();
  if (!styles) return;

  const root = document.documentElement;
  if (styles.popupBackgroundColor) root.style.setProperty('--swal2-background', styles.popupBackgroundColor);
  if (styles.popupTextColor) root.style.setProperty('--swal2-color', styles.popupTextColor);
  if (styles.popupBorderColor) root.style.setProperty('--swal2-border', `1px solid ${styles.popupBorderColor}`);
  root.style.setProperty('--swal2-border-radius', 'var(--rounded-box)');
  root.style.setProperty('--swal2-backdrop', baseSwalOptions.backdrop);
};

const isPlainObject = (value) => {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

Swal.fire = (...args) => {
  const options = isPlainObject(args[0])
    ? args[0]
    : {
        title: args[0],
        html: args[1],
        icon: args[2],
      };

  const isToast = options?.toast === true;
  const hasBackdrop = Object.prototype.hasOwnProperty.call(options, 'backdrop');

  syncSwalCssVarsWithDaisyUiTheme();

  return originalSwalFire({
    ...baseSwalOptions,
    ...options,
    customClass: {
      ...baseSwalOptions.customClass,
      ...(options.customClass || {}),
    },
    backdrop: hasBackdrop ? options.backdrop : isToast ? false : baseSwalOptions.backdrop,
    didOpen: (popup) => {
      options?.didOpen?.(popup);
    },
    didRender: () => options?.didRender?.(),
  });
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
