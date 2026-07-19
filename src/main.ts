import './style.css';
import { registerAllModes } from './modes/index.js';
import { createStorage } from './platform/createStorage.js';
import { ProductStore } from './platform/productStore.js';
import { PRODUCT_NAME } from './product/config.js';
import { App } from './ui/app.js';

registerAllModes();
document.title = PRODUCT_NAME;

const root = document.getElementById('app');
if (!root) throw new Error('#app root element missing from index.html');

const app = new App(root, new ProductStore(createStorage()));
void app.init();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register(new URL('./sw.js', location.href), { scope: './' });
  });
}
