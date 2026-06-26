<template>
  <footer class="footer">
    <div class="footer-container">
 
      <!-- Top grid -->
      <div class="footer-grid">
 
        <!-- Brand column -->
        <div class="footer-brand">
          <div class="brand-logo">
            <div class="brand-mark">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </div>
            <span class="brand-name">ShopVue</span>
          </div>
          <p class="brand-desc">Modern e-commerce built with Vue.js and Laravel. Fast, reliable, and beautifully crafted.</p>
 
          <!-- Social icons -->
          <div class="social-row">
            <a href="#" class="social-btn" aria-label="Facebook">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="#" class="social-btn" aria-label="Twitter / X">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
            </a>
            <a href="#" class="social-btn" aria-label="Instagram">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="#" class="social-btn" aria-label="GitHub">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
          </div>
        </div>
 
        <!-- Shop links -->
        <div class="footer-col">
          <h4 class="col-heading">Shop</h4>
          <ul class="col-links">
            <li><router-link to="/products">All products</router-link></li>
            <li><router-link to="/products?sort=new">New arrivals</router-link></li>
            <li><router-link to="/products?sort=popular">Best sellers</router-link></li>
            <li><router-link to="/products?sale=true">
              Sale
              <span class="tag-badge">Hot</span>
            </router-link></li>
          </ul>
        </div>
 
        <!-- Support links -->
        <div class="footer-col">
          <h4 class="col-heading">Support</h4>
          <ul class="col-links">
            <li><a href="#">Contact us</a></li>
            <li><a href="#">Shipping info</a></li>
            <li><a href="#">Returns</a></li>
            <li><a href="#">FAQ</a></li>
          </ul>
        </div>
 
        <!-- Account links -->
        <div class="footer-col">
          <h4 class="col-heading">Account</h4>
          <ul class="col-links">
            <li><router-link to="/login">Sign in</router-link></li>
            <li><router-link to="/register">Create account</router-link></li>
            <li><router-link to="/orders">My orders</router-link></li>
            <li><router-link to="/profile">Profile</router-link></li>
          </ul>
        </div>
 
      </div>
 
      <!-- Newsletter strip -->
      <div class="newsletter">
        <div class="newsletter-text">
          <p class="newsletter-heading">Stay in the loop</p>
          <p class="newsletter-sub">Get new arrivals and exclusive offers in your inbox.</p>
        </div>
        <form class="newsletter-form" @submit.prevent="subscribeNewsletter">
          <input
            v-model="email"
            type="email"
            placeholder="you@example.com"
            class="newsletter-input"
            :disabled="subscribed"
          />
          <button type="submit" class="newsletter-btn" :disabled="subscribed">
            <span v-if="subscribed">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Subscribed
            </span>
            <span v-else>Subscribe</span>
          </button>
        </form>
      </div>
 
      <!-- Bottom bar -->
      <div class="footer-bottom">
        <p class="copyright">&copy; {{ new Date().getFullYear() }} ShopVue. All rights reserved.</p>
        <div class="legal-links">
          <a href="#">Privacy policy</a>
          <span class="dot" aria-hidden="true">·</span>
          <a href="#">Terms of service</a>
          <span class="dot" aria-hidden="true">·</span>
          <a href="#">Cookie settings</a>
        </div>
      </div>
 
    </div>
  </footer>
</template>
 
<script setup>
import { ref } from 'vue'
 
const email      = ref('')
const subscribed = ref(false)
 
function subscribeNewsletter() {
  if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) return
  // TODO: wire up to your API
  subscribed.value = true
}
</script>
 
<style scoped>
/* ── Shell ── */
.footer {
  background: #0f172a;
  color: #94a3b8;
  padding: 56px 20px 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
 
.footer-container {
  max-width: 1200px;
  margin: 0 auto;
}
 
/* ── Top grid ── */
.footer-grid {
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr);
  gap: 48px;
  padding-bottom: 48px;
  border-bottom: 1px solid #1e293b;
}
 
/* ── Brand column ── */
.brand-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}
 
.brand-mark {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: #ffffff;
  color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
 
.brand-name {
  font-size: 16px;
  font-weight: 600;
  color: #f1f5f9;
  letter-spacing: -0.3px;
}
 
.brand-desc {
  font-size: 13px;
  color: #64748b;
  line-height: 1.7;
  margin: 0 0 20px;
  max-width: 240px;
}
 
/* ── Social ── */
.social-row {
  display: flex;
  gap: 8px;
}
 
.social-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #1e293b;
  background: #1e293b;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
 
.social-btn:hover {
  background: #334155;
  border-color: #334155;
  color: #f1f5f9;
}
 
/* ── Link columns ── */
.footer-col { 
  color: #334155;
}
 
.col-heading {
  font-size: 11px;
  font-weight: 600;
  color: #f1f5f9;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin: 0 0 16px;
}
 
.col-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
 
.col-links a {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  text-decoration: none;
  font-size: 13px;
  color: #64748b;
  transition: color 0.15s;
}
 
.col-links a:hover { color: #f1f5f9; }
 
/* ── Sale badge ── */
.tag-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 5px;
  background: #ef4444;
  color: #ffffff;
  letter-spacing: 0.02em;
}
 
/* ── Newsletter strip ── */
.newsletter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 28px 32px;
  margin: 40px 0;
  background: #1e293b;
  border-radius: 14px;
  border: 1px solid #334155;
}
 
.newsletter-heading {
  margin: 0 0 3px;
  font-size: 14px;
  font-weight: 600;
  color: #f1f5f9;
}
 
.newsletter-sub {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}
 
.newsletter-form {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
 
.newsletter-input {
  width: 220px;
  height: 38px;
  padding: 0 14px;
  border-radius: 9px;
  border: 1px solid #334155;
  background: #0f172a;
  color: #f1f5f9;
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s;
}
 
.newsletter-input::placeholder { color: #475569; }
 
.newsletter-input:focus {
  border-color: #475569;
}
 
.newsletter-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
 
.newsletter-btn {
  height: 38px;
  padding: 0 18px;
  border-radius: 9px;
  border: none;
  background: #f1f5f9;
  color: #0f172a;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
  transition: background 0.15s;
  flex-shrink: 0;
}
 
.newsletter-btn:hover:not(:disabled) { background: #e2e8f0; }
.newsletter-btn:disabled { opacity: 0.7; cursor: default; }
 
/* ── Bottom bar ── */
.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0 24px;
  border-top: 1px solid #1e293b;
  gap: 16px;
}
 
.copyright {
  margin: 0;
  font-size: 12px;
  color: #475569;
}
 
.legal-links {
  display: flex;
  align-items: center;
  gap: 10px;
}
 
.legal-links a {
  font-size: 12px;
  color: #475569;
  text-decoration: none;
  transition: color 0.15s;
}
 
.legal-links a:hover { color: #94a3b8; }
 
.dot {
  color: #334155;
  font-size: 12px;
}
 
/* ── Responsive ── */
@media (max-width: 900px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
 
  .footer-brand { grid-column: 1 / -1; }
  .brand-desc   { max-width: 100%; }
 
  .newsletter {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 24px;
  }
 
  .newsletter-form { width: 100%; }
  .newsletter-input { flex: 1; width: auto; }
}
 
@media (max-width: 560px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 28px;
  }
 
  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
 
  .legal-links { flex-wrap: wrap; }
}
</style>