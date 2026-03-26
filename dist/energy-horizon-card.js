/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ho = globalThis, bf = ho.ShadowRoot && (ho.ShadyCSS === void 0 || ho.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, wf = Symbol(), Nh = /* @__PURE__ */ new WeakMap();
let zp = class {
  constructor(t, e, i) {
    if (this._$cssResult$ = !0, i !== wf) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (bf && t === void 0) {
      const i = e !== void 0 && e.length === 1;
      i && (t = Nh.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && Nh.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const I_ = (r) => new zp(typeof r == "string" ? r : r + "", void 0, wf), Hp = (r, ...t) => {
  const e = r.length === 1 ? r[0] : t.reduce((i, n, a) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(n) + r[a + 1], r[0]);
  return new zp(e, r, wf);
}, E_ = (r, t) => {
  if (bf) r.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const i = document.createElement("style"), n = ho.litNonce;
    n !== void 0 && i.setAttribute("nonce", n), i.textContent = e.cssText, r.appendChild(i);
  }
}, Bh = bf ? (r) => r : (r) => r instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const i of t.cssRules) e += i.cssText;
  return I_(e);
})(r) : r;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: R_, defineProperty: k_, getOwnPropertyDescriptor: O_, getOwnPropertyNames: N_, getOwnPropertySymbols: B_, getPrototypeOf: F_ } = Object, ur = globalThis, Fh = ur.trustedTypes, z_ = Fh ? Fh.emptyScript : "", Ns = ur.reactiveElementPolyfillSupport, En = (r, t) => r, Mo = { toAttribute(r, t) {
  switch (t) {
    case Boolean:
      r = r ? z_ : null;
      break;
    case Object:
    case Array:
      r = r == null ? r : JSON.stringify(r);
  }
  return r;
}, fromAttribute(r, t) {
  let e = r;
  switch (t) {
    case Boolean:
      e = r !== null;
      break;
    case Number:
      e = r === null ? null : Number(r);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(r);
      } catch {
        e = null;
      }
  }
  return e;
} }, xf = (r, t) => !R_(r, t), zh = { attribute: !0, type: String, converter: Mo, reflect: !1, useDefault: !1, hasChanged: xf };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), ur.litPropertyMetadata ?? (ur.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let wi = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = zh) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const i = Symbol(), n = this.getPropertyDescriptor(t, i, e);
      n !== void 0 && k_(this.prototype, t, n);
    }
  }
  static getPropertyDescriptor(t, e, i) {
    const { get: n, set: a } = O_(this.prototype, t) ?? { get() {
      return this[e];
    }, set(o) {
      this[e] = o;
    } };
    return { get: n, set(o) {
      const s = n == null ? void 0 : n.call(this);
      a == null || a.call(this, o), this.requestUpdate(t, s, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? zh;
  }
  static _$Ei() {
    if (this.hasOwnProperty(En("elementProperties"))) return;
    const t = F_(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(En("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(En("properties"))) {
      const e = this.properties, i = [...N_(e), ...B_(e)];
      for (const n of i) this.createProperty(n, e[n]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [i, n] of e) this.elementProperties.set(i, n);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, i] of this.elementProperties) {
      const n = this._$Eu(e, i);
      n !== void 0 && this._$Eh.set(n, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const i = new Set(t.flat(1 / 0).reverse());
      for (const n of i) e.unshift(Bh(n));
    } else t !== void 0 && e.push(Bh(t));
    return e;
  }
  static _$Eu(t, e) {
    const i = e.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var t;
    this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (t = this.constructor.l) == null || t.forEach((e) => e(this));
  }
  addController(t) {
    var e;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t), this.renderRoot !== void 0 && this.isConnected && ((e = t.hostConnected) == null || e.call(t));
  }
  removeController(t) {
    var e;
    (e = this._$EO) == null || e.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), e = this.constructor.elementProperties;
    for (const i of e.keys()) this.hasOwnProperty(i) && (t.set(i, this[i]), delete this[i]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return E_(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    var t;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (t = this._$EO) == null || t.forEach((e) => {
      var i;
      return (i = e.hostConnected) == null ? void 0 : i.call(e);
    });
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    var t;
    (t = this._$EO) == null || t.forEach((e) => {
      var i;
      return (i = e.hostDisconnected) == null ? void 0 : i.call(e);
    });
  }
  attributeChangedCallback(t, e, i) {
    this._$AK(t, i);
  }
  _$ET(t, e) {
    var a;
    const i = this.constructor.elementProperties.get(t), n = this.constructor._$Eu(t, i);
    if (n !== void 0 && i.reflect === !0) {
      const o = (((a = i.converter) == null ? void 0 : a.toAttribute) !== void 0 ? i.converter : Mo).toAttribute(e, i.type);
      this._$Em = t, o == null ? this.removeAttribute(n) : this.setAttribute(n, o), this._$Em = null;
    }
  }
  _$AK(t, e) {
    var a, o;
    const i = this.constructor, n = i._$Eh.get(t);
    if (n !== void 0 && this._$Em !== n) {
      const s = i.getPropertyOptions(n), l = typeof s.converter == "function" ? { fromAttribute: s.converter } : ((a = s.converter) == null ? void 0 : a.fromAttribute) !== void 0 ? s.converter : Mo;
      this._$Em = n;
      const u = l.fromAttribute(e, s.type);
      this[n] = u ?? ((o = this._$Ej) == null ? void 0 : o.get(n)) ?? u, this._$Em = null;
    }
  }
  requestUpdate(t, e, i, n = !1, a) {
    var o;
    if (t !== void 0) {
      const s = this.constructor;
      if (n === !1 && (a = this[t]), i ?? (i = s.getPropertyOptions(t)), !((i.hasChanged ?? xf)(a, e) || i.useDefault && i.reflect && a === ((o = this._$Ej) == null ? void 0 : o.get(t)) && !this.hasAttribute(s._$Eu(t, i)))) return;
      this.C(t, e, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: i, reflect: n, wrapped: a }, o) {
    i && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t) && (this._$Ej.set(t, o ?? e ?? this[t]), a !== !0 || o !== void 0) || (this._$AL.has(t) || (this.hasUpdated || i || (e = void 0), this._$AL.set(t, e)), n === !0 && this._$Em !== t && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (e) {
      Promise.reject(e);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var i;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [a, o] of this._$Ep) this[a] = o;
        this._$Ep = void 0;
      }
      const n = this.constructor.elementProperties;
      if (n.size > 0) for (const [a, o] of n) {
        const { wrapped: s } = o, l = this[a];
        s !== !0 || this._$AL.has(a) || l === void 0 || this.C(a, void 0, o, l);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), (i = this._$EO) == null || i.forEach((n) => {
        var a;
        return (a = n.hostUpdate) == null ? void 0 : a.call(n);
      }), this.update(e)) : this._$EM();
    } catch (n) {
      throw t = !1, this._$EM(), n;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    var e;
    (e = this._$EO) == null || e.forEach((i) => {
      var n;
      return (n = i.hostUpdated) == null ? void 0 : n.call(i);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((e) => this._$ET(e, this[e]))), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
wi.elementStyles = [], wi.shadowRootOptions = { mode: "open" }, wi[En("elementProperties")] = /* @__PURE__ */ new Map(), wi[En("finalized")] = /* @__PURE__ */ new Map(), Ns == null || Ns({ ReactiveElement: wi }), (ur.reactiveElementVersions ?? (ur.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Rn = globalThis, Hh = (r) => r, Do = Rn.trustedTypes, $h = Do ? Do.createPolicy("lit-html", { createHTML: (r) => r }) : void 0, $p = "$lit$", ar = `lit$${Math.random().toFixed(9).slice(2)}$`, Vp = "?" + ar, H_ = `<${Vp}>`, qr = document, Kn = () => qr.createComment(""), jn = (r) => r === null || typeof r != "object" && typeof r != "function", Tf = Array.isArray, $_ = (r) => Tf(r) || typeof (r == null ? void 0 : r[Symbol.iterator]) == "function", Bs = `[ 	
\f\r]`, en = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Vh = /-->/g, Gh = />/g, yr = RegExp(`>|${Bs}(?:([^\\s"'>=/]+)(${Bs}*=${Bs}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Wh = /'/g, Uh = /"/g, Gp = /^(?:script|style|textarea|title)$/i, V_ = (r) => (t, ...e) => ({ _$litType$: r, strings: t, values: e }), gt = V_(1), Hi = Symbol.for("lit-noChange"), Mt = Symbol.for("lit-nothing"), Yh = /* @__PURE__ */ new WeakMap(), $r = qr.createTreeWalker(qr, 129);
function Wp(r, t) {
  if (!Tf(r) || !r.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return $h !== void 0 ? $h.createHTML(t) : t;
}
const G_ = (r, t) => {
  const e = r.length - 1, i = [];
  let n, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = en;
  for (let s = 0; s < e; s++) {
    const l = r[s];
    let u, f, h = -1, v = 0;
    for (; v < l.length && (o.lastIndex = v, f = o.exec(l), f !== null); ) v = o.lastIndex, o === en ? f[1] === "!--" ? o = Vh : f[1] !== void 0 ? o = Gh : f[2] !== void 0 ? (Gp.test(f[2]) && (n = RegExp("</" + f[2], "g")), o = yr) : f[3] !== void 0 && (o = yr) : o === yr ? f[0] === ">" ? (o = n ?? en, h = -1) : f[1] === void 0 ? h = -2 : (h = o.lastIndex - f[2].length, u = f[1], o = f[3] === void 0 ? yr : f[3] === '"' ? Uh : Wh) : o === Uh || o === Wh ? o = yr : o === Vh || o === Gh ? o = en : (o = yr, n = void 0);
    const c = o === yr && r[s + 1].startsWith("/>") ? " " : "";
    a += o === en ? l + H_ : h >= 0 ? (i.push(u), l.slice(0, h) + $p + l.slice(h) + ar + c) : l + ar + (h === -2 ? s : c);
  }
  return [Wp(r, a + (r[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class Qn {
  constructor({ strings: t, _$litType$: e }, i) {
    let n;
    this.parts = [];
    let a = 0, o = 0;
    const s = t.length - 1, l = this.parts, [u, f] = G_(t, e);
    if (this.el = Qn.createElement(u, i), $r.currentNode = this.el.content, e === 2 || e === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (n = $r.nextNode()) !== null && l.length < s; ) {
      if (n.nodeType === 1) {
        if (n.hasAttributes()) for (const h of n.getAttributeNames()) if (h.endsWith($p)) {
          const v = f[o++], c = n.getAttribute(h).split(ar), d = /([.?@])?(.*)/.exec(v);
          l.push({ type: 1, index: a, name: d[2], strings: c, ctor: d[1] === "." ? U_ : d[1] === "?" ? Y_ : d[1] === "@" ? X_ : ts }), n.removeAttribute(h);
        } else h.startsWith(ar) && (l.push({ type: 6, index: a }), n.removeAttribute(h));
        if (Gp.test(n.tagName)) {
          const h = n.textContent.split(ar), v = h.length - 1;
          if (v > 0) {
            n.textContent = Do ? Do.emptyScript : "";
            for (let c = 0; c < v; c++) n.append(h[c], Kn()), $r.nextNode(), l.push({ type: 2, index: ++a });
            n.append(h[v], Kn());
          }
        }
      } else if (n.nodeType === 8) if (n.data === Vp) l.push({ type: 2, index: a });
      else {
        let h = -1;
        for (; (h = n.data.indexOf(ar, h + 1)) !== -1; ) l.push({ type: 7, index: a }), h += ar.length - 1;
      }
      a++;
    }
  }
  static createElement(t, e) {
    const i = qr.createElement("template");
    return i.innerHTML = t, i;
  }
}
function $i(r, t, e = r, i) {
  var o, s;
  if (t === Hi) return t;
  let n = i !== void 0 ? (o = e._$Co) == null ? void 0 : o[i] : e._$Cl;
  const a = jn(t) ? void 0 : t._$litDirective$;
  return (n == null ? void 0 : n.constructor) !== a && ((s = n == null ? void 0 : n._$AO) == null || s.call(n, !1), a === void 0 ? n = void 0 : (n = new a(r), n._$AT(r, e, i)), i !== void 0 ? (e._$Co ?? (e._$Co = []))[i] = n : e._$Cl = n), n !== void 0 && (t = $i(r, n._$AS(r, t.values), n, i)), t;
}
class W_ {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: e }, parts: i } = this._$AD, n = ((t == null ? void 0 : t.creationScope) ?? qr).importNode(e, !0);
    $r.currentNode = n;
    let a = $r.nextNode(), o = 0, s = 0, l = i[0];
    for (; l !== void 0; ) {
      if (o === l.index) {
        let u;
        l.type === 2 ? u = new va(a, a.nextSibling, this, t) : l.type === 1 ? u = new l.ctor(a, l.name, l.strings, this, t) : l.type === 6 && (u = new Z_(a, this, t)), this._$AV.push(u), l = i[++s];
      }
      o !== (l == null ? void 0 : l.index) && (a = $r.nextNode(), o++);
    }
    return $r.currentNode = qr, n;
  }
  p(t) {
    let e = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, e), e += i.strings.length - 2) : i._$AI(t[e])), e++;
  }
}
class va {
  get _$AU() {
    var t;
    return ((t = this._$AM) == null ? void 0 : t._$AU) ?? this._$Cv;
  }
  constructor(t, e, i, n) {
    this.type = 2, this._$AH = Mt, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = i, this.options = n, this._$Cv = (n == null ? void 0 : n.isConnected) ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && (t == null ? void 0 : t.nodeType) === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = $i(this, t, e), jn(t) ? t === Mt || t == null || t === "" ? (this._$AH !== Mt && this._$AR(), this._$AH = Mt) : t !== this._$AH && t !== Hi && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : $_(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== Mt && jn(this._$AH) ? this._$AA.nextSibling.data = t : this.T(qr.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    var a;
    const { values: e, _$litType$: i } = t, n = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = Qn.createElement(Wp(i.h, i.h[0]), this.options)), i);
    if (((a = this._$AH) == null ? void 0 : a._$AD) === n) this._$AH.p(e);
    else {
      const o = new W_(n, this), s = o.u(this.options);
      o.p(e), this.T(s), this._$AH = o;
    }
  }
  _$AC(t) {
    let e = Yh.get(t.strings);
    return e === void 0 && Yh.set(t.strings, e = new Qn(t)), e;
  }
  k(t) {
    Tf(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let i, n = 0;
    for (const a of t) n === e.length ? e.push(i = new va(this.O(Kn()), this.O(Kn()), this, this.options)) : i = e[n], i._$AI(a), n++;
    n < e.length && (this._$AR(i && i._$AB.nextSibling, n), e.length = n);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    var i;
    for ((i = this._$AP) == null ? void 0 : i.call(this, !1, !0, e); t !== this._$AB; ) {
      const n = Hh(t).nextSibling;
      Hh(t).remove(), t = n;
    }
  }
  setConnected(t) {
    var e;
    this._$AM === void 0 && (this._$Cv = t, (e = this._$AP) == null || e.call(this, t));
  }
}
class ts {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, i, n, a) {
    this.type = 1, this._$AH = Mt, this._$AN = void 0, this.element = t, this.name = e, this._$AM = n, this.options = a, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = Mt;
  }
  _$AI(t, e = this, i, n) {
    const a = this.strings;
    let o = !1;
    if (a === void 0) t = $i(this, t, e, 0), o = !jn(t) || t !== this._$AH && t !== Hi, o && (this._$AH = t);
    else {
      const s = t;
      let l, u;
      for (t = a[0], l = 0; l < a.length - 1; l++) u = $i(this, s[i + l], e, l), u === Hi && (u = this._$AH[l]), o || (o = !jn(u) || u !== this._$AH[l]), u === Mt ? t = Mt : t !== Mt && (t += (u ?? "") + a[l + 1]), this._$AH[l] = u;
    }
    o && !n && this.j(t);
  }
  j(t) {
    t === Mt ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class U_ extends ts {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === Mt ? void 0 : t;
  }
}
class Y_ extends ts {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== Mt);
  }
}
class X_ extends ts {
  constructor(t, e, i, n, a) {
    super(t, e, i, n, a), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = $i(this, t, e, 0) ?? Mt) === Hi) return;
    const i = this._$AH, n = t === Mt && i !== Mt || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, a = t !== Mt && (i === Mt || n);
    n && this.element.removeEventListener(this.name, this, i), a && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var e;
    typeof this._$AH == "function" ? this._$AH.call(((e = this.options) == null ? void 0 : e.host) ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Z_ {
  constructor(t, e, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    $i(this, t);
  }
}
const Fs = Rn.litHtmlPolyfillSupport;
Fs == null || Fs(Qn, va), (Rn.litHtmlVersions ?? (Rn.litHtmlVersions = [])).push("3.3.2");
const q_ = (r, t, e) => {
  const i = (e == null ? void 0 : e.renderBefore) ?? t;
  let n = i._$litPart$;
  if (n === void 0) {
    const a = (e == null ? void 0 : e.renderBefore) ?? null;
    i._$litPart$ = n = new va(t.insertBefore(Kn(), a), a, void 0, e ?? {});
  }
  return n._$AI(r), n;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ur = globalThis;
class Pi extends wi {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var e;
    const t = super.createRenderRoot();
    return (e = this.renderOptions).renderBefore ?? (e.renderBefore = t.firstChild), t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = q_(e, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var t;
    super.connectedCallback(), (t = this._$Do) == null || t.setConnected(!0);
  }
  disconnectedCallback() {
    var t;
    super.disconnectedCallback(), (t = this._$Do) == null || t.setConnected(!1);
  }
  render() {
    return Hi;
  }
}
var Fp;
Pi._$litElement$ = !0, Pi.finalized = !0, (Fp = Ur.litElementHydrateSupport) == null || Fp.call(Ur, { LitElement: Pi });
const zs = Ur.litElementPolyfillSupport;
zs == null || zs({ LitElement: Pi });
(Ur.litElementVersions ?? (Ur.litElementVersions = [])).push("4.2.2");
function Xh(r, t) {
  const e = [], i = new Date(r.current_start);
  if (i.setHours(0, 0, 0, 0), r.aggregation === "day")
    for (; i.getTime() <= t.getTime(); )
      e.push(i.getTime()), i.setDate(i.getDate() + 1);
  else if (r.aggregation === "week")
    for (; i.getTime() <= t.getTime(); )
      e.push(i.getTime()), i.setDate(i.getDate() + 7);
  else if (r.aggregation === "month")
    for (i.setDate(1); i.getFullYear() < t.getFullYear() || i.getFullYear() === t.getFullYear() && i.getMonth() <= t.getMonth(); )
      e.push(i.getTime()), i.setMonth(i.getMonth() + 1);
  return e;
}
function K_(r, t, e) {
  const i = new Date(t.getTime()), n = r.period_offset ?? -1;
  let a, o, s, l;
  if (r.comparison_mode === "year_over_year") {
    const u = i.getFullYear();
    a = new Date(u, 0, 1, 0, 0, 0, 0), o = i;
    const f = u + n;
    s = new Date(f, 0, 1, 0, 0, 0, 0), l = new Date(f, 11, 31, 23, 59, 59, 999);
  } else {
    const u = i.getFullYear(), f = i.getMonth();
    a = new Date(u, f, 1, 0, 0, 0, 0), o = i;
    const h = u + n;
    s = new Date(h, f, 1, 0, 0, 0, 0), l = new Date(h, f + 1, 0, 23, 59, 59, 999);
  }
  return {
    current_start: a,
    current_end: o,
    reference_start: s,
    reference_end: l,
    aggregation: r.aggregation ?? "day",
    time_zone: e
  };
}
function Zh(r, t) {
  const e = {
    day: "day",
    week: "week",
    month: "month"
  };
  return {
    type: "recorder/statistics_during_period",
    start_time: r.current_start.toISOString(),
    end_time: r.current_end.toISOString(),
    statistic_ids: [t],
    period: e[r.aggregation]
  };
}
function qh(r, t, e) {
  const i = r.result ?? r, n = i.results ?? i;
  if (!n || typeof n != "object") return;
  let a = n[t];
  if (!a || a.length === 0) {
    const u = Object.keys(n);
    u.length === 1 && (a = n[u[0]]);
  }
  if (!a || a.length === 0) return;
  const { unit: o, timeSeries: s } = j_(a);
  return Q_(
    s,
    o,
    e
  );
}
function j_(r) {
  let t = "";
  const e = [];
  let i;
  for (const n of r) {
    let a;
    if (typeof n.sum == "number")
      if (i === void 0) {
        i = n.sum;
        continue;
      } else {
        const o = n.sum - i;
        if (i = n.sum, !Number.isFinite(o) || o <= 0)
          continue;
        a = o;
      }
    else typeof n.change == "number" ? a = n.change : typeof n.state == "number" && (a = n.state);
    if (!(a == null || !Number.isFinite(a))) {
      if (!t && n.unit_of_measurement)
        t = n.unit_of_measurement;
      else if (t && n.unit_of_measurement && n.unit_of_measurement !== t)
        return { unit: "", timeSeries: [] };
      e.push({
        timestamp: new Date(n.start).getTime(),
        value: a,
        rawValue: a
      });
    }
  }
  return { unit: t, timeSeries: e.sort((n, a) => n.timestamp - a.timestamp) };
}
function Q_(r, t, e) {
  let i = 0;
  const n = r.map((o) => {
    const s = o.rawValue ?? o.value;
    return i += s, { ...o, value: i };
  }), a = n.length > 0 ? n[n.length - 1].value : 0;
  return {
    points: n,
    unit: t,
    periodLabel: e,
    total: a
  };
}
function J_(r) {
  var o, s, l;
  const t = r.current.points, e = ((o = t[t.length - 1]) == null ? void 0 : o.value) ?? 0;
  let i;
  if (r.reference && r.reference.points.length >= t.length) {
    const u = r.reference.points;
    i = ((s = u[t.length - 1]) == null ? void 0 : s.value) ?? ((l = u[u.length - 1]) == null ? void 0 : l.value);
  }
  let n, a;
  return i != null && (n = e - i, i !== 0 && (a = n / i * 100)), {
    current_cumulative: e,
    reference_cumulative: i,
    difference: n,
    differencePercent: a,
    unit: r.current.unit
  };
}
function t0(r, t) {
  var x, D;
  const e = (T) => ({
    enabled: !1,
    confidence: "low",
    unit: T
  }), i = r.current.points, n = r.current.unit;
  if (typeof t != "number" || !Number.isFinite(t) || t <= 0 || i.length === 0)
    return e(n);
  const a = i.length - 1, o = a / t;
  if (a < 3 || o < 0.05)
    return e(n);
  const s = (x = r.reference) == null ? void 0 : x.points;
  if (!s || s.length === 0)
    return e(n);
  const l = i[a - 1].timestamp - i[0].timestamp, u = i[0].timestamp + l, f = i[0].timestamp - s[0].timestamp;
  let h = -1;
  for (let T = s.length - 1; T >= 0; T--)
    if (s[T].timestamp + f <= u) {
      h = T;
      break;
    }
  if (h === -1)
    return e(n);
  const v = s.slice(0, h + 1).reduce((T, C) => T + (C.rawValue ?? 0), 0);
  if (!Number.isFinite(v) || v <= 0)
    return e(n);
  const c = i.slice(0, a).reduce((T, C) => T + (C.rawValue ?? 0), 0), d = c / v, y = Math.min(5, Math.max(0.2, d)), p = 10 * c < 3 * v || 10 * c > 33 * v;
  let g = o >= 0.4 ? "high" : o >= 0.2 ? "medium" : "low";
  p && (g = "low");
  const m = s.slice(h + 1).reduce((T, C) => T + (C.rawValue ?? 0), 0), _ = v + m;
  let S = c + m * y;
  const w = ((D = i[i.length - 1]) == null ? void 0 : D.value) ?? 0;
  S = Math.max(S, w);
  const b = {
    enabled: !0,
    forecast_total: S,
    reference_total: _,
    confidence: g,
    unit: n
  };
  return p && (b.anomalousReference = !0), b;
}
function e0(r) {
  const { reference_cumulative: t, difference: e, unit: i } = r;
  if (t == null || e == null)
    return {
      trend: "unknown",
      unit: i
    };
  const n = Math.abs(e);
  return n < 0.01 ? {
    trend: "similar",
    diffValue: n,
    unit: i
  } : e > 0 ? {
    trend: "higher",
    diffValue: n,
    unit: i
  } : {
    trend: "lower",
    diffValue: n,
    unit: i
  };
}
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
var hu = function(r, t) {
  return hu = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(e, i) {
    e.__proto__ = i;
  } || function(e, i) {
    for (var n in i) Object.prototype.hasOwnProperty.call(i, n) && (e[n] = i[n]);
  }, hu(r, t);
};
function O(r, t) {
  if (typeof t != "function" && t !== null)
    throw new TypeError("Class extends value " + String(t) + " is not a constructor or null");
  hu(r, t);
  function e() {
    this.constructor = r;
  }
  r.prototype = t === null ? Object.create(t) : (e.prototype = t.prototype, new e());
}
var r0 = /* @__PURE__ */ (function() {
  function r() {
    this.firefox = !1, this.ie = !1, this.edge = !1, this.newEdge = !1, this.weChat = !1;
  }
  return r;
})(), i0 = /* @__PURE__ */ (function() {
  function r() {
    this.browser = new r0(), this.node = !1, this.wxa = !1, this.worker = !1, this.svgSupported = !1, this.touchEventsSupported = !1, this.pointerEventsSupported = !1, this.domSupported = !1, this.transformSupported = !1, this.transform3dSupported = !1, this.hasGlobalWindow = typeof window < "u";
  }
  return r;
})(), U = new i0();
typeof wx == "object" && typeof wx.getSystemInfoSync == "function" ? (U.wxa = !0, U.touchEventsSupported = !0) : typeof document > "u" && typeof self < "u" ? U.worker = !0 : !U.hasGlobalWindow || "Deno" in window ? (U.node = !0, U.svgSupported = !0) : n0(navigator.userAgent, U);
function n0(r, t) {
  var e = t.browser, i = r.match(/Firefox\/([\d.]+)/), n = r.match(/MSIE\s([\d.]+)/) || r.match(/Trident\/.+?rv:(([\d.]+))/), a = r.match(/Edge?\/([\d.]+)/), o = /micromessenger/i.test(r);
  i && (e.firefox = !0, e.version = i[1]), n && (e.ie = !0, e.version = n[1]), a && (e.edge = !0, e.version = a[1], e.newEdge = +a[1].split(".")[0] > 18), o && (e.weChat = !0), t.svgSupported = typeof SVGRect < "u", t.touchEventsSupported = "ontouchstart" in window && !e.ie && !e.edge, t.pointerEventsSupported = "onpointerdown" in window && (e.edge || e.ie && +e.version >= 11), t.domSupported = typeof document < "u";
  var s = document.documentElement.style;
  t.transform3dSupported = (e.ie && "transition" in s || e.edge || "WebKitCSSMatrix" in window && "m11" in new WebKitCSSMatrix() || "MozPerspective" in s) && !("OTransition" in s), t.transformSupported = t.transform3dSupported || e.ie && +e.version >= 9;
}
var Cf = 12, a0 = "sans-serif", Kr = Cf + "px " + a0, o0 = 20, s0 = 100, l0 = "007LLmW'55;N0500LLLLLLLLLL00NNNLzWW\\\\WQb\\0FWLg\\bWb\\WQ\\WrWWQ000CL5LLFLL0LL**F*gLLLL5F0LF\\FFF5.5N";
function u0(r) {
  var t = {};
  if (typeof JSON > "u")
    return t;
  for (var e = 0; e < r.length; e++) {
    var i = String.fromCharCode(e + 32), n = (r.charCodeAt(e) - o0) / s0;
    t[i] = n;
  }
  return t;
}
var f0 = u0(l0), Xi = {
  createCanvas: function() {
    return typeof document < "u" && document.createElement("canvas");
  },
  measureText: /* @__PURE__ */ (function() {
    var r, t;
    return function(e, i) {
      if (!r) {
        var n = Xi.createCanvas();
        r = n && n.getContext("2d");
      }
      if (r)
        return t !== i && (t = r.font = i || Kr), r.measureText(e);
      e = e || "", i = i || Kr;
      var a = /((?:\d+)?\.?\d*)px/.exec(i), o = a && +a[1] || Cf, s = 0;
      if (i.indexOf("mono") >= 0)
        s = o * e.length;
      else
        for (var l = 0; l < e.length; l++) {
          var u = f0[e[l]];
          s += u == null ? o : u * o;
        }
      return { width: s };
    };
  })(),
  loadImage: function(r, t, e) {
    var i = new Image();
    return i.onload = t, i.onerror = e, i.src = r, i;
  }
}, Up = Zi([
  "Function",
  "RegExp",
  "Date",
  "Error",
  "CanvasGradient",
  "CanvasPattern",
  "Image",
  "Canvas"
], function(r, t) {
  return r["[object " + t + "]"] = !0, r;
}, {}), Yp = Zi([
  "Int8",
  "Uint8",
  "Uint8Clamped",
  "Int16",
  "Uint16",
  "Int32",
  "Uint32",
  "Float32",
  "Float64"
], function(r, t) {
  return r["[object " + t + "Array]"] = !0, r;
}, {}), da = Object.prototype.toString, es = Array.prototype, h0 = es.forEach, c0 = es.filter, Mf = es.slice, v0 = es.map, Kh = (function() {
}).constructor, wa = Kh ? Kh.prototype : null, Df = "__proto__", d0 = 2311;
function Xp() {
  return d0++;
}
function Af() {
  for (var r = [], t = 0; t < arguments.length; t++)
    r[t] = arguments[t];
  typeof console < "u" && console.error.apply(console, r);
}
function K(r) {
  if (r == null || typeof r != "object")
    return r;
  var t = r, e = da.call(r);
  if (e === "[object Array]") {
    if (!kn(r)) {
      t = [];
      for (var i = 0, n = r.length; i < n; i++)
        t[i] = K(r[i]);
    }
  } else if (Yp[e]) {
    if (!kn(r)) {
      var a = r.constructor;
      if (a.from)
        t = a.from(r);
      else {
        t = new a(r.length);
        for (var i = 0, n = r.length; i < n; i++)
          t[i] = r[i];
      }
    }
  } else if (!Up[e] && !kn(r) && !Jn(r)) {
    t = {};
    for (var o in r)
      r.hasOwnProperty(o) && o !== Df && (t[o] = K(r[o]));
  }
  return t;
}
function Q(r, t, e) {
  if (!W(t) || !W(r))
    return e ? K(t) : r;
  for (var i in t)
    if (t.hasOwnProperty(i) && i !== Df) {
      var n = r[i], a = t[i];
      W(a) && W(n) && !N(a) && !N(n) && !Jn(a) && !Jn(n) && !jh(a) && !jh(n) && !kn(a) && !kn(n) ? Q(n, a, e) : (e || !(i in r)) && (r[i] = K(t[i]));
    }
  return r;
}
function k(r, t) {
  if (Object.assign)
    Object.assign(r, t);
  else
    for (var e in t)
      t.hasOwnProperty(e) && e !== Df && (r[e] = t[e]);
  return r;
}
function ot(r, t, e) {
  for (var i = pt(t), n = 0, a = i.length; n < a; n++) {
    var o = i[n];
    r[o] == null && (r[o] = t[o]);
  }
  return r;
}
function rt(r, t) {
  if (r) {
    if (r.indexOf)
      return r.indexOf(t);
    for (var e = 0, i = r.length; e < i; e++)
      if (r[e] === t)
        return e;
  }
  return -1;
}
function p0(r, t) {
  var e = r.prototype;
  function i() {
  }
  i.prototype = t.prototype, r.prototype = new i();
  for (var n in e)
    e.hasOwnProperty(n) && (r.prototype[n] = e[n]);
  r.prototype.constructor = r, r.superClass = t;
}
function _e(r, t, e) {
  if (r = "prototype" in r ? r.prototype : r, t = "prototype" in t ? t.prototype : t, Object.getOwnPropertyNames)
    for (var i = Object.getOwnPropertyNames(t), n = 0; n < i.length; n++) {
      var a = i[n];
      a !== "constructor" && r[a] == null && (r[a] = t[a]);
    }
  else
    ot(r, t);
}
function Yt(r) {
  return !r || typeof r == "string" ? !1 : typeof r.length == "number";
}
function A(r, t, e) {
  if (r && t)
    if (r.forEach && r.forEach === h0)
      r.forEach(t, e);
    else if (r.length === +r.length)
      for (var i = 0, n = r.length; i < n; i++)
        t.call(e, r[i], i, r);
    else
      for (var a in r)
        r.hasOwnProperty(a) && t.call(e, r[a], a, r);
}
function H(r, t, e) {
  if (!r)
    return [];
  if (!t)
    return Lf(r);
  if (r.map && r.map === v0)
    return r.map(t, e);
  for (var i = [], n = 0, a = r.length; n < a; n++)
    i.push(t.call(e, r[n], n, r));
  return i;
}
function Zi(r, t, e, i) {
  if (r && t) {
    for (var n = 0, a = r.length; n < a; n++)
      e = t.call(i, e, r[n], n, r);
    return e;
  }
}
function xt(r, t, e) {
  if (!r)
    return [];
  if (!t)
    return Lf(r);
  if (r.filter && r.filter === c0)
    return r.filter(t, e);
  for (var i = [], n = 0, a = r.length; n < a; n++)
    t.call(e, r[n], n, r) && i.push(r[n]);
  return i;
}
function pt(r) {
  if (!r)
    return [];
  if (Object.keys)
    return Object.keys(r);
  var t = [];
  for (var e in r)
    r.hasOwnProperty(e) && t.push(e);
  return t;
}
function g0(r, t) {
  for (var e = [], i = 2; i < arguments.length; i++)
    e[i - 2] = arguments[i];
  return function() {
    return r.apply(t, e.concat(Mf.call(arguments)));
  };
}
var dt = wa && G(wa.bind) ? wa.call.bind(wa.bind) : g0;
function ht(r) {
  for (var t = [], e = 1; e < arguments.length; e++)
    t[e - 1] = arguments[e];
  return function() {
    return r.apply(this, t.concat(Mf.call(arguments)));
  };
}
function N(r) {
  return Array.isArray ? Array.isArray(r) : da.call(r) === "[object Array]";
}
function G(r) {
  return typeof r == "function";
}
function z(r) {
  return typeof r == "string";
}
function cu(r) {
  return da.call(r) === "[object String]";
}
function vt(r) {
  return typeof r == "number";
}
function W(r) {
  var t = typeof r;
  return t === "function" || !!r && t === "object";
}
function jh(r) {
  return !!Up[da.call(r)];
}
function Xt(r) {
  return !!Yp[da.call(r)];
}
function Jn(r) {
  return typeof r == "object" && typeof r.nodeType == "number" && typeof r.ownerDocument == "object";
}
function rs(r) {
  return r.colorStops != null;
}
function y0(r) {
  return r.image != null;
}
function Ao(r) {
  return r !== r;
}
function Vi() {
  for (var r = [], t = 0; t < arguments.length; t++)
    r[t] = arguments[t];
  for (var e = 0, i = r.length; e < i; e++)
    if (r[e] != null)
      return r[e];
}
function X(r, t) {
  return r ?? t;
}
function co(r, t, e) {
  return r ?? t ?? e;
}
function Lf(r) {
  for (var t = [], e = 1; e < arguments.length; e++)
    t[e - 1] = arguments[e];
  return Mf.apply(r, t);
}
function Zp(r) {
  if (typeof r == "number")
    return [r, r, r, r];
  var t = r.length;
  return t === 2 ? [r[0], r[1], r[0], r[1]] : t === 3 ? [r[0], r[1], r[2], r[1]] : r;
}
function $e(r, t) {
  if (!r)
    throw new Error(t);
}
function Me(r) {
  return r == null ? null : typeof r.trim == "function" ? r.trim() : r.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
}
var qp = "__ec_primitive__";
function vu(r) {
  r[qp] = !0;
}
function kn(r) {
  return r[qp];
}
var m0 = (function() {
  function r() {
    this.data = {};
  }
  return r.prototype.delete = function(t) {
    var e = this.has(t);
    return e && delete this.data[t], e;
  }, r.prototype.has = function(t) {
    return this.data.hasOwnProperty(t);
  }, r.prototype.get = function(t) {
    return this.data[t];
  }, r.prototype.set = function(t, e) {
    return this.data[t] = e, this;
  }, r.prototype.keys = function() {
    return pt(this.data);
  }, r.prototype.forEach = function(t) {
    var e = this.data;
    for (var i in e)
      e.hasOwnProperty(i) && t(e[i], i);
  }, r;
})(), Kp = typeof Map == "function";
function _0() {
  return Kp ? /* @__PURE__ */ new Map() : new m0();
}
var S0 = (function() {
  function r(t) {
    var e = N(t);
    this.data = _0();
    var i = this;
    t instanceof r ? t.each(n) : t && A(t, n);
    function n(a, o) {
      e ? i.set(a, o) : i.set(o, a);
    }
  }
  return r.prototype.hasKey = function(t) {
    return this.data.has(t);
  }, r.prototype.get = function(t) {
    return this.data.get(t);
  }, r.prototype.set = function(t, e) {
    return this.data.set(t, e), e;
  }, r.prototype.each = function(t, e) {
    this.data.forEach(function(i, n) {
      t.call(e, i, n);
    });
  }, r.prototype.keys = function() {
    var t = this.data.keys();
    return Kp ? Array.from(t) : t;
  }, r.prototype.removeKey = function(t) {
    this.data.delete(t);
  }, r;
})();
function Z(r) {
  return new S0(r);
}
function b0(r, t) {
  for (var e = new r.constructor(r.length + t.length), i = 0; i < r.length; i++)
    e[i] = r[i];
  for (var n = r.length, i = 0; i < t.length; i++)
    e[i + n] = t[i];
  return e;
}
function is(r, t) {
  var e;
  if (Object.create)
    e = Object.create(r);
  else {
    var i = function() {
    };
    i.prototype = r, e = new i();
  }
  return t && k(e, t), e;
}
function jp(r) {
  var t = r.style;
  t.webkitUserSelect = "none", t.userSelect = "none", t.webkitTapHighlightColor = "rgba(0,0,0,0)", t["-webkit-touch-callout"] = "none";
}
function jr(r, t) {
  return r.hasOwnProperty(t);
}
function Ut() {
}
var w0 = 180 / Math.PI;
function qi(r, t) {
  return r == null && (r = 0), t == null && (t = 0), [r, t];
}
function x0(r) {
  return [r[0], r[1]];
}
function Qh(r, t, e) {
  return r[0] = t[0] + e[0], r[1] = t[1] + e[1], r;
}
function Qp(r, t, e) {
  return r[0] = t[0] - e[0], r[1] = t[1] - e[1], r;
}
function T0(r) {
  return Math.sqrt(C0(r));
}
function C0(r) {
  return r[0] * r[0] + r[1] * r[1];
}
function Hs(r, t, e) {
  return r[0] = t[0] * e, r[1] = t[1] * e, r;
}
function Pf(r, t) {
  var e = T0(t);
  return e === 0 ? (r[0] = 0, r[1] = 0) : (r[0] = t[0] / e, r[1] = t[1] / e), r;
}
function du(r, t) {
  return Math.sqrt((r[0] - t[0]) * (r[0] - t[0]) + (r[1] - t[1]) * (r[1] - t[1]));
}
var M0 = du;
function D0(r, t) {
  return (r[0] - t[0]) * (r[0] - t[0]) + (r[1] - t[1]) * (r[1] - t[1]);
}
var Ii = D0;
function ue(r, t, e) {
  var i = t[0], n = t[1];
  return r[0] = e[0] * i + e[2] * n + e[4], r[1] = e[1] * i + e[3] * n + e[5], r;
}
function Ci(r, t, e) {
  return r[0] = Math.min(t[0], e[0]), r[1] = Math.min(t[1], e[1]), r;
}
function Mi(r, t, e) {
  return r[0] = Math.max(t[0], e[0]), r[1] = Math.max(t[1], e[1]), r;
}
var si = /* @__PURE__ */ (function() {
  function r(t, e) {
    this.target = t, this.topTarget = e && e.topTarget;
  }
  return r;
})(), A0 = (function() {
  function r(t) {
    this.handler = t, t.on("mousedown", this._dragStart, this), t.on("mousemove", this._drag, this), t.on("mouseup", this._dragEnd, this);
  }
  return r.prototype._dragStart = function(t) {
    for (var e = t.target; e && !e.draggable; )
      e = e.parent || e.__hostTarget;
    e && (this._draggingTarget = e, e.dragging = !0, this._x = t.offsetX, this._y = t.offsetY, this.handler.dispatchToElement(new si(e, t), "dragstart", t.event));
  }, r.prototype._drag = function(t) {
    var e = this._draggingTarget;
    if (e) {
      var i = t.offsetX, n = t.offsetY, a = i - this._x, o = n - this._y;
      this._x = i, this._y = n, e.drift(a, o, t), this.handler.dispatchToElement(new si(e, t), "drag", t.event);
      var s = this.handler.findHover(i, n, e).target, l = this._dropTarget;
      this._dropTarget = s, e !== s && (l && s !== l && this.handler.dispatchToElement(new si(l, t), "dragleave", t.event), s && s !== l && this.handler.dispatchToElement(new si(s, t), "dragenter", t.event));
    }
  }, r.prototype._dragEnd = function(t) {
    var e = this._draggingTarget;
    e && (e.dragging = !1), this.handler.dispatchToElement(new si(e, t), "dragend", t.event), this._dropTarget && this.handler.dispatchToElement(new si(this._dropTarget, t), "drop", t.event), this._draggingTarget = null, this._dropTarget = null;
  }, r;
})(), Ie = (function() {
  function r(t) {
    t && (this._$eventProcessor = t);
  }
  return r.prototype.on = function(t, e, i, n) {
    this._$handlers || (this._$handlers = {});
    var a = this._$handlers;
    if (typeof e == "function" && (n = i, i = e, e = null), !i || !t)
      return this;
    var o = this._$eventProcessor;
    e != null && o && o.normalizeQuery && (e = o.normalizeQuery(e)), a[t] || (a[t] = []);
    for (var s = 0; s < a[t].length; s++)
      if (a[t][s].h === i)
        return this;
    var l = {
      h: i,
      query: e,
      ctx: n || this,
      callAtLast: i.zrEventfulCallAtLast
    }, u = a[t].length - 1, f = a[t][u];
    return f && f.callAtLast ? a[t].splice(u, 0, l) : a[t].push(l), this;
  }, r.prototype.isSilent = function(t) {
    var e = this._$handlers;
    return !e || !e[t] || !e[t].length;
  }, r.prototype.off = function(t, e) {
    var i = this._$handlers;
    if (!i)
      return this;
    if (!t)
      return this._$handlers = {}, this;
    if (e) {
      if (i[t]) {
        for (var n = [], a = 0, o = i[t].length; a < o; a++)
          i[t][a].h !== e && n.push(i[t][a]);
        i[t] = n;
      }
      i[t] && i[t].length === 0 && delete i[t];
    } else
      delete i[t];
    return this;
  }, r.prototype.trigger = function(t) {
    for (var e = [], i = 1; i < arguments.length; i++)
      e[i - 1] = arguments[i];
    if (!this._$handlers)
      return this;
    var n = this._$handlers[t], a = this._$eventProcessor;
    if (n)
      for (var o = e.length, s = n.length, l = 0; l < s; l++) {
        var u = n[l];
        if (!(a && a.filter && u.query != null && !a.filter(t, u.query)))
          switch (o) {
            case 0:
              u.h.call(u.ctx);
              break;
            case 1:
              u.h.call(u.ctx, e[0]);
              break;
            case 2:
              u.h.call(u.ctx, e[0], e[1]);
              break;
            default:
              u.h.apply(u.ctx, e);
              break;
          }
      }
    return a && a.afterTrigger && a.afterTrigger(t), this;
  }, r.prototype.triggerWithContext = function(t) {
    for (var e = [], i = 1; i < arguments.length; i++)
      e[i - 1] = arguments[i];
    if (!this._$handlers)
      return this;
    var n = this._$handlers[t], a = this._$eventProcessor;
    if (n)
      for (var o = e.length, s = e[o - 1], l = n.length, u = 0; u < l; u++) {
        var f = n[u];
        if (!(a && a.filter && f.query != null && !a.filter(t, f.query)))
          switch (o) {
            case 0:
              f.h.call(s);
              break;
            case 1:
              f.h.call(s, e[0]);
              break;
            case 2:
              f.h.call(s, e[0], e[1]);
              break;
            default:
              f.h.apply(s, e.slice(1, o - 1));
              break;
          }
      }
    return a && a.afterTrigger && a.afterTrigger(t), this;
  }, r;
})(), L0 = Math.log(2);
function pu(r, t, e, i, n, a) {
  var o = i + "-" + n, s = r.length;
  if (a.hasOwnProperty(o))
    return a[o];
  if (t === 1) {
    var l = Math.round(Math.log((1 << s) - 1 & ~n) / L0);
    return r[e][l];
  }
  for (var u = i | 1 << e, f = e + 1; i & 1 << f; )
    f++;
  for (var h = 0, v = 0, c = 0; v < s; v++) {
    var d = 1 << v;
    d & n || (h += (c % 2 ? -1 : 1) * r[e][v] * pu(r, t - 1, f, u, n | d, a), c++);
  }
  return a[o] = h, h;
}
function Jh(r, t) {
  var e = [
    [r[0], r[1], 1, 0, 0, 0, -t[0] * r[0], -t[0] * r[1]],
    [0, 0, 0, r[0], r[1], 1, -t[1] * r[0], -t[1] * r[1]],
    [r[2], r[3], 1, 0, 0, 0, -t[2] * r[2], -t[2] * r[3]],
    [0, 0, 0, r[2], r[3], 1, -t[3] * r[2], -t[3] * r[3]],
    [r[4], r[5], 1, 0, 0, 0, -t[4] * r[4], -t[4] * r[5]],
    [0, 0, 0, r[4], r[5], 1, -t[5] * r[4], -t[5] * r[5]],
    [r[6], r[7], 1, 0, 0, 0, -t[6] * r[6], -t[6] * r[7]],
    [0, 0, 0, r[6], r[7], 1, -t[7] * r[6], -t[7] * r[7]]
  ], i = {}, n = pu(e, 8, 0, 0, 0, i);
  if (n !== 0) {
    for (var a = [], o = 0; o < 8; o++)
      for (var s = 0; s < 8; s++)
        a[s] == null && (a[s] = 0), a[s] += ((o + s) % 2 ? -1 : 1) * pu(e, 7, o === 0 ? 1 : 0, 1 << o, 1 << s, i) / n * t[o];
    return function(l, u, f) {
      var h = u * a[6] + f * a[7] + 1;
      l[0] = (u * a[0] + f * a[1] + a[2]) / h, l[1] = (u * a[3] + f * a[4] + a[5]) / h;
    };
  }
}
var tc = "___zrEVENTSAVED", $s = [];
function P0(r, t, e, i, n) {
  return gu($s, t, i, n, !0) && gu(r, e, $s[0], $s[1]);
}
function gu(r, t, e, i, n) {
  if (t.getBoundingClientRect && U.domSupported && !Jp(t)) {
    var a = t[tc] || (t[tc] = {}), o = I0(t, a), s = E0(o, a, n);
    if (s)
      return s(r, e, i), !0;
  }
  return !1;
}
function I0(r, t) {
  var e = t.markers;
  if (e)
    return e;
  e = t.markers = [];
  for (var i = ["left", "right"], n = ["top", "bottom"], a = 0; a < 4; a++) {
    var o = document.createElement("div"), s = o.style, l = a % 2, u = (a >> 1) % 2;
    s.cssText = [
      "position: absolute",
      "visibility: hidden",
      "padding: 0",
      "margin: 0",
      "border-width: 0",
      "user-select: none",
      "width:0",
      "height:0",
      i[l] + ":0",
      n[u] + ":0",
      i[1 - l] + ":auto",
      n[1 - u] + ":auto",
      ""
    ].join("!important;"), r.appendChild(o), e.push(o);
  }
  return e;
}
function E0(r, t, e) {
  for (var i = e ? "invTrans" : "trans", n = t[i], a = t.srcCoords, o = [], s = [], l = !0, u = 0; u < 4; u++) {
    var f = r[u].getBoundingClientRect(), h = 2 * u, v = f.left, c = f.top;
    o.push(v, c), l = l && a && v === a[h] && c === a[h + 1], s.push(r[u].offsetLeft, r[u].offsetTop);
  }
  return l && n ? n : (t.srcCoords = o, t[i] = e ? Jh(s, o) : Jh(o, s));
}
function Jp(r) {
  return r.nodeName.toUpperCase() === "CANVAS";
}
var R0 = /([&<>"'])/g, k0 = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};
function $t(r) {
  return r == null ? "" : (r + "").replace(R0, function(t, e) {
    return k0[e];
  });
}
var O0 = /^(?:mouse|pointer|contextmenu|drag|drop)|click/, Vs = [], N0 = U.browser.firefox && +U.browser.version.split(".")[0] < 39;
function yu(r, t, e, i) {
  return e = e || {}, i ? ec(r, t, e) : N0 && t.layerX != null && t.layerX !== t.offsetX ? (e.zrX = t.layerX, e.zrY = t.layerY) : t.offsetX != null ? (e.zrX = t.offsetX, e.zrY = t.offsetY) : ec(r, t, e), e;
}
function ec(r, t, e) {
  if (U.domSupported && r.getBoundingClientRect) {
    var i = t.clientX, n = t.clientY;
    if (Jp(r)) {
      var a = r.getBoundingClientRect();
      e.zrX = i - a.left, e.zrY = n - a.top;
      return;
    } else if (gu(Vs, r, i, n)) {
      e.zrX = Vs[0], e.zrY = Vs[1];
      return;
    }
  }
  e.zrX = e.zrY = 0;
}
function If(r) {
  return r || window.event;
}
function re(r, t, e) {
  if (t = If(t), t.zrX != null)
    return t;
  var i = t.type, n = i && i.indexOf("touch") >= 0;
  if (n) {
    var o = i !== "touchend" ? t.targetTouches[0] : t.changedTouches[0];
    o && yu(r, o, t, e);
  } else {
    yu(r, t, t, e);
    var a = B0(t);
    t.zrDelta = a ? a / 120 : -(t.detail || 0) / 3;
  }
  var s = t.button;
  return t.which == null && s !== void 0 && O0.test(t.type) && (t.which = s & 1 ? 1 : s & 2 ? 3 : s & 4 ? 2 : 0), t;
}
function B0(r) {
  var t = r.wheelDelta;
  if (t)
    return t;
  var e = r.deltaX, i = r.deltaY;
  if (e == null || i == null)
    return t;
  var n = Math.abs(i !== 0 ? i : e), a = i > 0 ? -1 : i < 0 ? 1 : e > 0 ? -1 : 1;
  return 3 * n * a;
}
function F0(r, t, e, i) {
  r.addEventListener(t, e, i);
}
function z0(r, t, e, i) {
  r.removeEventListener(t, e, i);
}
var tg = function(r) {
  r.preventDefault(), r.stopPropagation(), r.cancelBubble = !0;
}, H0 = (function() {
  function r() {
    this._track = [];
  }
  return r.prototype.recognize = function(t, e, i) {
    return this._doTrack(t, e, i), this._recognize(t);
  }, r.prototype.clear = function() {
    return this._track.length = 0, this;
  }, r.prototype._doTrack = function(t, e, i) {
    var n = t.touches;
    if (n) {
      for (var a = {
        points: [],
        touches: [],
        target: e,
        event: t
      }, o = 0, s = n.length; o < s; o++) {
        var l = n[o], u = yu(i, l, {});
        a.points.push([u.zrX, u.zrY]), a.touches.push(l);
      }
      this._track.push(a);
    }
  }, r.prototype._recognize = function(t) {
    for (var e in Gs)
      if (Gs.hasOwnProperty(e)) {
        var i = Gs[e](this._track, t);
        if (i)
          return i;
      }
  }, r;
})();
function rc(r) {
  var t = r[1][0] - r[0][0], e = r[1][1] - r[0][1];
  return Math.sqrt(t * t + e * e);
}
function $0(r) {
  return [
    (r[0][0] + r[1][0]) / 2,
    (r[0][1] + r[1][1]) / 2
  ];
}
var Gs = {
  pinch: function(r, t) {
    var e = r.length;
    if (e) {
      var i = (r[e - 1] || {}).points, n = (r[e - 2] || {}).points || i;
      if (n && n.length > 1 && i && i.length > 1) {
        var a = rc(i) / rc(n);
        !isFinite(a) && (a = 1), t.pinchScale = a;
        var o = $0(i);
        return t.pinchX = o[0], t.pinchY = o[1], {
          type: "pinch",
          target: r[0].target,
          event: t
        };
      }
    }
  }
};
function Ei() {
  return [1, 0, 0, 1, 0, 0];
}
function Ef(r) {
  return r[0] = 1, r[1] = 0, r[2] = 0, r[3] = 1, r[4] = 0, r[5] = 0, r;
}
function V0(r, t) {
  return r[0] = t[0], r[1] = t[1], r[2] = t[2], r[3] = t[3], r[4] = t[4], r[5] = t[5], r;
}
function Ri(r, t, e) {
  var i = t[0] * e[0] + t[2] * e[1], n = t[1] * e[0] + t[3] * e[1], a = t[0] * e[2] + t[2] * e[3], o = t[1] * e[2] + t[3] * e[3], s = t[0] * e[4] + t[2] * e[5] + t[4], l = t[1] * e[4] + t[3] * e[5] + t[5];
  return r[0] = i, r[1] = n, r[2] = a, r[3] = o, r[4] = s, r[5] = l, r;
}
function mu(r, t, e) {
  return r[0] = t[0], r[1] = t[1], r[2] = t[2], r[3] = t[3], r[4] = t[4] + e[0], r[5] = t[5] + e[1], r;
}
function Rf(r, t, e, i) {
  i === void 0 && (i = [0, 0]);
  var n = t[0], a = t[2], o = t[4], s = t[1], l = t[3], u = t[5], f = Math.sin(e), h = Math.cos(e);
  return r[0] = n * h + s * f, r[1] = -n * f + s * h, r[2] = a * h + l * f, r[3] = -a * f + h * l, r[4] = h * (o - i[0]) + f * (u - i[1]) + i[0], r[5] = h * (u - i[1]) - f * (o - i[0]) + i[1], r;
}
function G0(r, t, e) {
  var i = e[0], n = e[1];
  return r[0] = t[0] * i, r[1] = t[1] * n, r[2] = t[2] * i, r[3] = t[3] * n, r[4] = t[4] * i, r[5] = t[5] * n, r;
}
function kf(r, t) {
  var e = t[0], i = t[2], n = t[4], a = t[1], o = t[3], s = t[5], l = e * o - a * i;
  return l ? (l = 1 / l, r[0] = o * l, r[1] = -a * l, r[2] = -i * l, r[3] = e * l, r[4] = (i * s - o * n) * l, r[5] = (a * n - e * s) * l, r) : null;
}
var ut = (function() {
  function r(t, e) {
    this.x = t || 0, this.y = e || 0;
  }
  return r.prototype.copy = function(t) {
    return this.x = t.x, this.y = t.y, this;
  }, r.prototype.clone = function() {
    return new r(this.x, this.y);
  }, r.prototype.set = function(t, e) {
    return this.x = t, this.y = e, this;
  }, r.prototype.equal = function(t) {
    return t.x === this.x && t.y === this.y;
  }, r.prototype.add = function(t) {
    return this.x += t.x, this.y += t.y, this;
  }, r.prototype.scale = function(t) {
    this.x *= t, this.y *= t;
  }, r.prototype.scaleAndAdd = function(t, e) {
    this.x += t.x * e, this.y += t.y * e;
  }, r.prototype.sub = function(t) {
    return this.x -= t.x, this.y -= t.y, this;
  }, r.prototype.dot = function(t) {
    return this.x * t.x + this.y * t.y;
  }, r.prototype.len = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }, r.prototype.lenSquare = function() {
    return this.x * this.x + this.y * this.y;
  }, r.prototype.normalize = function() {
    var t = this.len();
    return this.x /= t, this.y /= t, this;
  }, r.prototype.distance = function(t) {
    var e = this.x - t.x, i = this.y - t.y;
    return Math.sqrt(e * e + i * i);
  }, r.prototype.distanceSquare = function(t) {
    var e = this.x - t.x, i = this.y - t.y;
    return e * e + i * i;
  }, r.prototype.negate = function() {
    return this.x = -this.x, this.y = -this.y, this;
  }, r.prototype.transform = function(t) {
    if (t) {
      var e = this.x, i = this.y;
      return this.x = t[0] * e + t[2] * i + t[4], this.y = t[1] * e + t[3] * i + t[5], this;
    }
  }, r.prototype.toArray = function(t) {
    return t[0] = this.x, t[1] = this.y, t;
  }, r.prototype.fromArray = function(t) {
    this.x = t[0], this.y = t[1];
  }, r.set = function(t, e, i) {
    t.x = e, t.y = i;
  }, r.copy = function(t, e) {
    t.x = e.x, t.y = e.y;
  }, r.len = function(t) {
    return Math.sqrt(t.x * t.x + t.y * t.y);
  }, r.lenSquare = function(t) {
    return t.x * t.x + t.y * t.y;
  }, r.dot = function(t, e) {
    return t.x * e.x + t.y * e.y;
  }, r.add = function(t, e, i) {
    t.x = e.x + i.x, t.y = e.y + i.y;
  }, r.sub = function(t, e, i) {
    t.x = e.x - i.x, t.y = e.y - i.y;
  }, r.scale = function(t, e, i) {
    t.x = e.x * i, t.y = e.y * i;
  }, r.scaleAndAdd = function(t, e, i, n) {
    t.x = e.x + i.x * n, t.y = e.y + i.y * n;
  }, r.lerp = function(t, e, i, n) {
    var a = 1 - n;
    t.x = a * e.x + n * i.x, t.y = a * e.y + n * i.y;
  }, r;
})(), xa = Math.min, Ta = Math.max, mr = new ut(), _r = new ut(), Sr = new ut(), br = new ut(), rn = new ut(), nn = new ut(), it = (function() {
  function r(t, e, i, n) {
    i < 0 && (t = t + i, i = -i), n < 0 && (e = e + n, n = -n), this.x = t, this.y = e, this.width = i, this.height = n;
  }
  return r.prototype.union = function(t) {
    var e = xa(t.x, this.x), i = xa(t.y, this.y);
    isFinite(this.x) && isFinite(this.width) ? this.width = Ta(t.x + t.width, this.x + this.width) - e : this.width = t.width, isFinite(this.y) && isFinite(this.height) ? this.height = Ta(t.y + t.height, this.y + this.height) - i : this.height = t.height, this.x = e, this.y = i;
  }, r.prototype.applyTransform = function(t) {
    r.applyTransform(this, this, t);
  }, r.prototype.calculateTransform = function(t) {
    var e = this, i = t.width / e.width, n = t.height / e.height, a = Ei();
    return mu(a, a, [-e.x, -e.y]), G0(a, a, [i, n]), mu(a, a, [t.x, t.y]), a;
  }, r.prototype.intersect = function(t, e) {
    if (!t)
      return !1;
    t instanceof r || (t = r.create(t));
    var i = this, n = i.x, a = i.x + i.width, o = i.y, s = i.y + i.height, l = t.x, u = t.x + t.width, f = t.y, h = t.y + t.height, v = !(a < l || u < n || s < f || h < o);
    if (e) {
      var c = 1 / 0, d = 0, y = Math.abs(a - l), p = Math.abs(u - n), g = Math.abs(s - f), m = Math.abs(h - o), _ = Math.min(y, p), S = Math.min(g, m);
      a < l || u < n ? _ > d && (d = _, y < p ? ut.set(nn, -y, 0) : ut.set(nn, p, 0)) : _ < c && (c = _, y < p ? ut.set(rn, y, 0) : ut.set(rn, -p, 0)), s < f || h < o ? S > d && (d = S, g < m ? ut.set(nn, 0, -g) : ut.set(nn, 0, m)) : _ < c && (c = _, g < m ? ut.set(rn, 0, g) : ut.set(rn, 0, -m));
    }
    return e && ut.copy(e, v ? rn : nn), v;
  }, r.prototype.contain = function(t, e) {
    var i = this;
    return t >= i.x && t <= i.x + i.width && e >= i.y && e <= i.y + i.height;
  }, r.prototype.clone = function() {
    return new r(this.x, this.y, this.width, this.height);
  }, r.prototype.copy = function(t) {
    r.copy(this, t);
  }, r.prototype.plain = function() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }, r.prototype.isFinite = function() {
    return isFinite(this.x) && isFinite(this.y) && isFinite(this.width) && isFinite(this.height);
  }, r.prototype.isZero = function() {
    return this.width === 0 || this.height === 0;
  }, r.create = function(t) {
    return new r(t.x, t.y, t.width, t.height);
  }, r.copy = function(t, e) {
    t.x = e.x, t.y = e.y, t.width = e.width, t.height = e.height;
  }, r.applyTransform = function(t, e, i) {
    if (!i) {
      t !== e && r.copy(t, e);
      return;
    }
    if (i[1] < 1e-5 && i[1] > -1e-5 && i[2] < 1e-5 && i[2] > -1e-5) {
      var n = i[0], a = i[3], o = i[4], s = i[5];
      t.x = e.x * n + o, t.y = e.y * a + s, t.width = e.width * n, t.height = e.height * a, t.width < 0 && (t.x += t.width, t.width = -t.width), t.height < 0 && (t.y += t.height, t.height = -t.height);
      return;
    }
    mr.x = Sr.x = e.x, mr.y = br.y = e.y, _r.x = br.x = e.x + e.width, _r.y = Sr.y = e.y + e.height, mr.transform(i), br.transform(i), _r.transform(i), Sr.transform(i), t.x = xa(mr.x, _r.x, Sr.x, br.x), t.y = xa(mr.y, _r.y, Sr.y, br.y);
    var l = Ta(mr.x, _r.x, Sr.x, br.x), u = Ta(mr.y, _r.y, Sr.y, br.y);
    t.width = l - t.x, t.height = u - t.y;
  }, r;
})(), eg = "silent";
function W0(r, t, e) {
  return {
    type: r,
    event: e,
    target: t.target,
    topTarget: t.topTarget,
    cancelBubble: !1,
    offsetX: e.zrX,
    offsetY: e.zrY,
    gestureEvent: e.gestureEvent,
    pinchX: e.pinchX,
    pinchY: e.pinchY,
    pinchScale: e.pinchScale,
    wheelDelta: e.zrDelta,
    zrByTouch: e.zrByTouch,
    which: e.which,
    stop: U0
  };
}
function U0() {
  tg(this.event);
}
var Y0 = (function(r) {
  O(t, r);
  function t() {
    var e = r !== null && r.apply(this, arguments) || this;
    return e.handler = null, e;
  }
  return t.prototype.dispose = function() {
  }, t.prototype.setCursor = function() {
  }, t;
})(Ie), an = /* @__PURE__ */ (function() {
  function r(t, e) {
    this.x = t, this.y = e;
  }
  return r;
})(), X0 = [
  "click",
  "dblclick",
  "mousewheel",
  "mouseout",
  "mouseup",
  "mousedown",
  "mousemove",
  "contextmenu"
], Ws = new it(0, 0, 0, 0), rg = (function(r) {
  O(t, r);
  function t(e, i, n, a, o) {
    var s = r.call(this) || this;
    return s._hovered = new an(0, 0), s.storage = e, s.painter = i, s.painterRoot = a, s._pointerSize = o, n = n || new Y0(), s.proxy = null, s.setHandlerProxy(n), s._draggingMgr = new A0(s), s;
  }
  return t.prototype.setHandlerProxy = function(e) {
    this.proxy && this.proxy.dispose(), e && (A(X0, function(i) {
      e.on && e.on(i, this[i], this);
    }, this), e.handler = this), this.proxy = e;
  }, t.prototype.mousemove = function(e) {
    var i = e.zrX, n = e.zrY, a = ig(this, i, n), o = this._hovered, s = o.target;
    s && !s.__zr && (o = this.findHover(o.x, o.y), s = o.target);
    var l = this._hovered = a ? new an(i, n) : this.findHover(i, n), u = l.target, f = this.proxy;
    f.setCursor && f.setCursor(u ? u.cursor : "default"), s && u !== s && this.dispatchToElement(o, "mouseout", e), this.dispatchToElement(l, "mousemove", e), u && u !== s && this.dispatchToElement(l, "mouseover", e);
  }, t.prototype.mouseout = function(e) {
    var i = e.zrEventControl;
    i !== "only_globalout" && this.dispatchToElement(this._hovered, "mouseout", e), i !== "no_globalout" && this.trigger("globalout", { type: "globalout", event: e });
  }, t.prototype.resize = function() {
    this._hovered = new an(0, 0);
  }, t.prototype.dispatch = function(e, i) {
    var n = this[e];
    n && n.call(this, i);
  }, t.prototype.dispose = function() {
    this.proxy.dispose(), this.storage = null, this.proxy = null, this.painter = null;
  }, t.prototype.setCursorStyle = function(e) {
    var i = this.proxy;
    i.setCursor && i.setCursor(e);
  }, t.prototype.dispatchToElement = function(e, i, n) {
    e = e || {};
    var a = e.target;
    if (!(a && a.silent)) {
      for (var o = "on" + i, s = W0(i, e, n); a && (a[o] && (s.cancelBubble = !!a[o].call(a, s)), a.trigger(i, s), a = a.__hostTarget ? a.__hostTarget : a.parent, !s.cancelBubble); )
        ;
      s.cancelBubble || (this.trigger(i, s), this.painter && this.painter.eachOtherLayer && this.painter.eachOtherLayer(function(l) {
        typeof l[o] == "function" && l[o].call(l, s), l.trigger && l.trigger(i, s);
      }));
    }
  }, t.prototype.findHover = function(e, i, n) {
    var a = this.storage.getDisplayList(), o = new an(e, i);
    if (ic(a, o, e, i, n), this._pointerSize && !o.target) {
      for (var s = [], l = this._pointerSize, u = l / 2, f = new it(e - u, i - u, l, l), h = a.length - 1; h >= 0; h--) {
        var v = a[h];
        v !== n && !v.ignore && !v.ignoreCoarsePointer && (!v.parent || !v.parent.ignoreCoarsePointer) && (Ws.copy(v.getBoundingRect()), v.transform && Ws.applyTransform(v.transform), Ws.intersect(f) && s.push(v));
      }
      if (s.length)
        for (var c = 4, d = Math.PI / 12, y = Math.PI * 2, p = 0; p < u; p += c)
          for (var g = 0; g < y; g += d) {
            var m = e + p * Math.cos(g), _ = i + p * Math.sin(g);
            if (ic(s, o, m, _, n), o.target)
              return o;
          }
    }
    return o;
  }, t.prototype.processGesture = function(e, i) {
    this._gestureMgr || (this._gestureMgr = new H0());
    var n = this._gestureMgr;
    i === "start" && n.clear();
    var a = n.recognize(e, this.findHover(e.zrX, e.zrY, null).target, this.proxy.dom);
    if (i === "end" && n.clear(), a) {
      var o = a.type;
      e.gestureEvent = o;
      var s = new an();
      s.target = a.target, this.dispatchToElement(s, o, a.event);
    }
  }, t;
})(Ie);
A(["click", "mousedown", "mouseup", "mousewheel", "dblclick", "contextmenu"], function(r) {
  rg.prototype[r] = function(t) {
    var e = t.zrX, i = t.zrY, n = ig(this, e, i), a, o;
    if ((r !== "mouseup" || !n) && (a = this.findHover(e, i), o = a.target), r === "mousedown")
      this._downEl = o, this._downPoint = [t.zrX, t.zrY], this._upEl = o;
    else if (r === "mouseup")
      this._upEl = o;
    else if (r === "click") {
      if (this._downEl !== this._upEl || !this._downPoint || M0(this._downPoint, [t.zrX, t.zrY]) > 4)
        return;
      this._downPoint = null;
    }
    this.dispatchToElement(a, r, t);
  };
});
function Z0(r, t, e) {
  if (r[r.rectHover ? "rectContain" : "contain"](t, e)) {
    for (var i = r, n = void 0, a = !1; i; ) {
      if (i.ignoreClip && (a = !0), !a) {
        var o = i.getClipPath();
        if (o && !o.contain(t, e))
          return !1;
      }
      i.silent && (n = !0);
      var s = i.__hostTarget;
      i = s || i.parent;
    }
    return n ? eg : !0;
  }
  return !1;
}
function ic(r, t, e, i, n) {
  for (var a = r.length - 1; a >= 0; a--) {
    var o = r[a], s = void 0;
    if (o !== n && !o.ignore && (s = Z0(o, e, i)) && (!t.topTarget && (t.topTarget = o), s !== eg)) {
      t.target = o;
      break;
    }
  }
}
function ig(r, t, e) {
  var i = r.painter;
  return t < 0 || t > i.getWidth() || e < 0 || e > i.getHeight();
}
var ng = 32, on = 7;
function q0(r) {
  for (var t = 0; r >= ng; )
    t |= r & 1, r >>= 1;
  return r + t;
}
function nc(r, t, e, i) {
  var n = t + 1;
  if (n === e)
    return 1;
  if (i(r[n++], r[t]) < 0) {
    for (; n < e && i(r[n], r[n - 1]) < 0; )
      n++;
    K0(r, t, n);
  } else
    for (; n < e && i(r[n], r[n - 1]) >= 0; )
      n++;
  return n - t;
}
function K0(r, t, e) {
  for (e--; t < e; ) {
    var i = r[t];
    r[t++] = r[e], r[e--] = i;
  }
}
function ac(r, t, e, i, n) {
  for (i === t && i++; i < e; i++) {
    for (var a = r[i], o = t, s = i, l; o < s; )
      l = o + s >>> 1, n(a, r[l]) < 0 ? s = l : o = l + 1;
    var u = i - o;
    switch (u) {
      case 3:
        r[o + 3] = r[o + 2];
      case 2:
        r[o + 2] = r[o + 1];
      case 1:
        r[o + 1] = r[o];
        break;
      default:
        for (; u > 0; )
          r[o + u] = r[o + u - 1], u--;
    }
    r[o] = a;
  }
}
function Us(r, t, e, i, n, a) {
  var o = 0, s = 0, l = 1;
  if (a(r, t[e + n]) > 0) {
    for (s = i - n; l < s && a(r, t[e + n + l]) > 0; )
      o = l, l = (l << 1) + 1, l <= 0 && (l = s);
    l > s && (l = s), o += n, l += n;
  } else {
    for (s = n + 1; l < s && a(r, t[e + n - l]) <= 0; )
      o = l, l = (l << 1) + 1, l <= 0 && (l = s);
    l > s && (l = s);
    var u = o;
    o = n - l, l = n - u;
  }
  for (o++; o < l; ) {
    var f = o + (l - o >>> 1);
    a(r, t[e + f]) > 0 ? o = f + 1 : l = f;
  }
  return l;
}
function Ys(r, t, e, i, n, a) {
  var o = 0, s = 0, l = 1;
  if (a(r, t[e + n]) < 0) {
    for (s = n + 1; l < s && a(r, t[e + n - l]) < 0; )
      o = l, l = (l << 1) + 1, l <= 0 && (l = s);
    l > s && (l = s);
    var u = o;
    o = n - l, l = n - u;
  } else {
    for (s = i - n; l < s && a(r, t[e + n + l]) >= 0; )
      o = l, l = (l << 1) + 1, l <= 0 && (l = s);
    l > s && (l = s), o += n, l += n;
  }
  for (o++; o < l; ) {
    var f = o + (l - o >>> 1);
    a(r, t[e + f]) < 0 ? l = f : o = f + 1;
  }
  return l;
}
function j0(r, t) {
  var e = on, i, n, a = 0, o = [];
  i = [], n = [];
  function s(c, d) {
    i[a] = c, n[a] = d, a += 1;
  }
  function l() {
    for (; a > 1; ) {
      var c = a - 2;
      if (c >= 1 && n[c - 1] <= n[c] + n[c + 1] || c >= 2 && n[c - 2] <= n[c] + n[c - 1])
        n[c - 1] < n[c + 1] && c--;
      else if (n[c] > n[c + 1])
        break;
      f(c);
    }
  }
  function u() {
    for (; a > 1; ) {
      var c = a - 2;
      c > 0 && n[c - 1] < n[c + 1] && c--, f(c);
    }
  }
  function f(c) {
    var d = i[c], y = n[c], p = i[c + 1], g = n[c + 1];
    n[c] = y + g, c === a - 3 && (i[c + 1] = i[c + 2], n[c + 1] = n[c + 2]), a--;
    var m = Ys(r[p], r, d, y, 0, t);
    d += m, y -= m, y !== 0 && (g = Us(r[d + y - 1], r, p, g, g - 1, t), g !== 0 && (y <= g ? h(d, y, p, g) : v(d, y, p, g)));
  }
  function h(c, d, y, p) {
    var g = 0;
    for (g = 0; g < d; g++)
      o[g] = r[c + g];
    var m = 0, _ = y, S = c;
    if (r[S++] = r[_++], --p === 0) {
      for (g = 0; g < d; g++)
        r[S + g] = o[m + g];
      return;
    }
    if (d === 1) {
      for (g = 0; g < p; g++)
        r[S + g] = r[_ + g];
      r[S + p] = o[m];
      return;
    }
    for (var w = e, b, x, D; ; ) {
      b = 0, x = 0, D = !1;
      do
        if (t(r[_], o[m]) < 0) {
          if (r[S++] = r[_++], x++, b = 0, --p === 0) {
            D = !0;
            break;
          }
        } else if (r[S++] = o[m++], b++, x = 0, --d === 1) {
          D = !0;
          break;
        }
      while ((b | x) < w);
      if (D)
        break;
      do {
        if (b = Ys(r[_], o, m, d, 0, t), b !== 0) {
          for (g = 0; g < b; g++)
            r[S + g] = o[m + g];
          if (S += b, m += b, d -= b, d <= 1) {
            D = !0;
            break;
          }
        }
        if (r[S++] = r[_++], --p === 0) {
          D = !0;
          break;
        }
        if (x = Us(o[m], r, _, p, 0, t), x !== 0) {
          for (g = 0; g < x; g++)
            r[S + g] = r[_ + g];
          if (S += x, _ += x, p -= x, p === 0) {
            D = !0;
            break;
          }
        }
        if (r[S++] = o[m++], --d === 1) {
          D = !0;
          break;
        }
        w--;
      } while (b >= on || x >= on);
      if (D)
        break;
      w < 0 && (w = 0), w += 2;
    }
    if (e = w, e < 1 && (e = 1), d === 1) {
      for (g = 0; g < p; g++)
        r[S + g] = r[_ + g];
      r[S + p] = o[m];
    } else {
      if (d === 0)
        throw new Error();
      for (g = 0; g < d; g++)
        r[S + g] = o[m + g];
    }
  }
  function v(c, d, y, p) {
    var g = 0;
    for (g = 0; g < p; g++)
      o[g] = r[y + g];
    var m = c + d - 1, _ = p - 1, S = y + p - 1, w = 0, b = 0;
    if (r[S--] = r[m--], --d === 0) {
      for (w = S - (p - 1), g = 0; g < p; g++)
        r[w + g] = o[g];
      return;
    }
    if (p === 1) {
      for (S -= d, m -= d, b = S + 1, w = m + 1, g = d - 1; g >= 0; g--)
        r[b + g] = r[w + g];
      r[S] = o[_];
      return;
    }
    for (var x = e; ; ) {
      var D = 0, T = 0, C = !1;
      do
        if (t(o[_], r[m]) < 0) {
          if (r[S--] = r[m--], D++, T = 0, --d === 0) {
            C = !0;
            break;
          }
        } else if (r[S--] = o[_--], T++, D = 0, --p === 1) {
          C = !0;
          break;
        }
      while ((D | T) < x);
      if (C)
        break;
      do {
        if (D = d - Ys(o[_], r, c, d, d - 1, t), D !== 0) {
          for (S -= D, m -= D, d -= D, b = S + 1, w = m + 1, g = D - 1; g >= 0; g--)
            r[b + g] = r[w + g];
          if (d === 0) {
            C = !0;
            break;
          }
        }
        if (r[S--] = o[_--], --p === 1) {
          C = !0;
          break;
        }
        if (T = p - Us(r[m], o, 0, p, p - 1, t), T !== 0) {
          for (S -= T, _ -= T, p -= T, b = S + 1, w = _ + 1, g = 0; g < T; g++)
            r[b + g] = o[w + g];
          if (p <= 1) {
            C = !0;
            break;
          }
        }
        if (r[S--] = r[m--], --d === 0) {
          C = !0;
          break;
        }
        x--;
      } while (D >= on || T >= on);
      if (C)
        break;
      x < 0 && (x = 0), x += 2;
    }
    if (e = x, e < 1 && (e = 1), p === 1) {
      for (S -= d, m -= d, b = S + 1, w = m + 1, g = d - 1; g >= 0; g--)
        r[b + g] = r[w + g];
      r[S] = o[_];
    } else {
      if (p === 0)
        throw new Error();
      for (w = S - (p - 1), g = 0; g < p; g++)
        r[w + g] = o[g];
    }
  }
  return {
    mergeRuns: l,
    forceMergeRuns: u,
    pushRun: s
  };
}
function vo(r, t, e, i) {
  e || (e = 0), i || (i = r.length);
  var n = i - e;
  if (!(n < 2)) {
    var a = 0;
    if (n < ng) {
      a = nc(r, e, i, t), ac(r, e, i, e + a, t);
      return;
    }
    var o = j0(r, t), s = q0(n);
    do {
      if (a = nc(r, e, i, t), a < s) {
        var l = n;
        l > s && (l = s), ac(r, e, e + l, e + a, t), a = l;
      }
      o.pushRun(e, a), o.mergeRuns(), n -= a, e += a;
    } while (n !== 0);
    o.forceMergeRuns();
  }
}
var jt = 1, Tn = 2, xi = 4, oc = !1;
function Xs() {
  oc || (oc = !0, console.warn("z / z2 / zlevel of displayable is invalid, which may cause unexpected errors"));
}
function sc(r, t) {
  return r.zlevel === t.zlevel ? r.z === t.z ? r.z2 - t.z2 : r.z - t.z : r.zlevel - t.zlevel;
}
var Q0 = (function() {
  function r() {
    this._roots = [], this._displayList = [], this._displayListLen = 0, this.displayableSortFunc = sc;
  }
  return r.prototype.traverse = function(t, e) {
    for (var i = 0; i < this._roots.length; i++)
      this._roots[i].traverse(t, e);
  }, r.prototype.getDisplayList = function(t, e) {
    e = e || !1;
    var i = this._displayList;
    return (t || !i.length) && this.updateDisplayList(e), i;
  }, r.prototype.updateDisplayList = function(t) {
    this._displayListLen = 0;
    for (var e = this._roots, i = this._displayList, n = 0, a = e.length; n < a; n++)
      this._updateAndAddDisplayable(e[n], null, t);
    i.length = this._displayListLen, vo(i, sc);
  }, r.prototype._updateAndAddDisplayable = function(t, e, i) {
    if (!(t.ignore && !i)) {
      t.beforeUpdate(), t.update(), t.afterUpdate();
      var n = t.getClipPath();
      if (t.ignoreClip)
        e = null;
      else if (n) {
        e ? e = e.slice() : e = [];
        for (var a = n, o = t; a; )
          a.parent = o, a.updateTransform(), e.push(a), o = a, a = a.getClipPath();
      }
      if (t.childrenRef) {
        for (var s = t.childrenRef(), l = 0; l < s.length; l++) {
          var u = s[l];
          t.__dirty && (u.__dirty |= jt), this._updateAndAddDisplayable(u, e, i);
        }
        t.__dirty = 0;
      } else {
        var f = t;
        e && e.length ? f.__clipPaths = e : f.__clipPaths && f.__clipPaths.length > 0 && (f.__clipPaths = []), isNaN(f.z) && (Xs(), f.z = 0), isNaN(f.z2) && (Xs(), f.z2 = 0), isNaN(f.zlevel) && (Xs(), f.zlevel = 0), this._displayList[this._displayListLen++] = f;
      }
      var h = t.getDecalElement && t.getDecalElement();
      h && this._updateAndAddDisplayable(h, e, i);
      var v = t.getTextGuideLine();
      v && this._updateAndAddDisplayable(v, e, i);
      var c = t.getTextContent();
      c && this._updateAndAddDisplayable(c, e, i);
    }
  }, r.prototype.addRoot = function(t) {
    t.__zr && t.__zr.storage === this || this._roots.push(t);
  }, r.prototype.delRoot = function(t) {
    if (t instanceof Array) {
      for (var e = 0, i = t.length; e < i; e++)
        this.delRoot(t[e]);
      return;
    }
    var n = rt(this._roots, t);
    n >= 0 && this._roots.splice(n, 1);
  }, r.prototype.delAllRoots = function() {
    this._roots = [], this._displayList = [], this._displayListLen = 0;
  }, r.prototype.getRoots = function() {
    return this._roots;
  }, r.prototype.dispose = function() {
    this._displayList = null, this._roots = null;
  }, r;
})(), Lo;
Lo = U.hasGlobalWindow && (window.requestAnimationFrame && window.requestAnimationFrame.bind(window) || window.msRequestAnimationFrame && window.msRequestAnimationFrame.bind(window) || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame) || function(r) {
  return setTimeout(r, 16);
};
var On = {
  linear: function(r) {
    return r;
  },
  quadraticIn: function(r) {
    return r * r;
  },
  quadraticOut: function(r) {
    return r * (2 - r);
  },
  quadraticInOut: function(r) {
    return (r *= 2) < 1 ? 0.5 * r * r : -0.5 * (--r * (r - 2) - 1);
  },
  cubicIn: function(r) {
    return r * r * r;
  },
  cubicOut: function(r) {
    return --r * r * r + 1;
  },
  cubicInOut: function(r) {
    return (r *= 2) < 1 ? 0.5 * r * r * r : 0.5 * ((r -= 2) * r * r + 2);
  },
  quarticIn: function(r) {
    return r * r * r * r;
  },
  quarticOut: function(r) {
    return 1 - --r * r * r * r;
  },
  quarticInOut: function(r) {
    return (r *= 2) < 1 ? 0.5 * r * r * r * r : -0.5 * ((r -= 2) * r * r * r - 2);
  },
  quinticIn: function(r) {
    return r * r * r * r * r;
  },
  quinticOut: function(r) {
    return --r * r * r * r * r + 1;
  },
  quinticInOut: function(r) {
    return (r *= 2) < 1 ? 0.5 * r * r * r * r * r : 0.5 * ((r -= 2) * r * r * r * r + 2);
  },
  sinusoidalIn: function(r) {
    return 1 - Math.cos(r * Math.PI / 2);
  },
  sinusoidalOut: function(r) {
    return Math.sin(r * Math.PI / 2);
  },
  sinusoidalInOut: function(r) {
    return 0.5 * (1 - Math.cos(Math.PI * r));
  },
  exponentialIn: function(r) {
    return r === 0 ? 0 : Math.pow(1024, r - 1);
  },
  exponentialOut: function(r) {
    return r === 1 ? 1 : 1 - Math.pow(2, -10 * r);
  },
  exponentialInOut: function(r) {
    return r === 0 ? 0 : r === 1 ? 1 : (r *= 2) < 1 ? 0.5 * Math.pow(1024, r - 1) : 0.5 * (-Math.pow(2, -10 * (r - 1)) + 2);
  },
  circularIn: function(r) {
    return 1 - Math.sqrt(1 - r * r);
  },
  circularOut: function(r) {
    return Math.sqrt(1 - --r * r);
  },
  circularInOut: function(r) {
    return (r *= 2) < 1 ? -0.5 * (Math.sqrt(1 - r * r) - 1) : 0.5 * (Math.sqrt(1 - (r -= 2) * r) + 1);
  },
  elasticIn: function(r) {
    var t, e = 0.1, i = 0.4;
    return r === 0 ? 0 : r === 1 ? 1 : (!e || e < 1 ? (e = 1, t = i / 4) : t = i * Math.asin(1 / e) / (2 * Math.PI), -(e * Math.pow(2, 10 * (r -= 1)) * Math.sin((r - t) * (2 * Math.PI) / i)));
  },
  elasticOut: function(r) {
    var t, e = 0.1, i = 0.4;
    return r === 0 ? 0 : r === 1 ? 1 : (!e || e < 1 ? (e = 1, t = i / 4) : t = i * Math.asin(1 / e) / (2 * Math.PI), e * Math.pow(2, -10 * r) * Math.sin((r - t) * (2 * Math.PI) / i) + 1);
  },
  elasticInOut: function(r) {
    var t, e = 0.1, i = 0.4;
    return r === 0 ? 0 : r === 1 ? 1 : (!e || e < 1 ? (e = 1, t = i / 4) : t = i * Math.asin(1 / e) / (2 * Math.PI), (r *= 2) < 1 ? -0.5 * (e * Math.pow(2, 10 * (r -= 1)) * Math.sin((r - t) * (2 * Math.PI) / i)) : e * Math.pow(2, -10 * (r -= 1)) * Math.sin((r - t) * (2 * Math.PI) / i) * 0.5 + 1);
  },
  backIn: function(r) {
    var t = 1.70158;
    return r * r * ((t + 1) * r - t);
  },
  backOut: function(r) {
    var t = 1.70158;
    return --r * r * ((t + 1) * r + t) + 1;
  },
  backInOut: function(r) {
    var t = 2.5949095;
    return (r *= 2) < 1 ? 0.5 * (r * r * ((t + 1) * r - t)) : 0.5 * ((r -= 2) * r * ((t + 1) * r + t) + 2);
  },
  bounceIn: function(r) {
    return 1 - On.bounceOut(1 - r);
  },
  bounceOut: function(r) {
    return r < 1 / 2.75 ? 7.5625 * r * r : r < 2 / 2.75 ? 7.5625 * (r -= 1.5 / 2.75) * r + 0.75 : r < 2.5 / 2.75 ? 7.5625 * (r -= 2.25 / 2.75) * r + 0.9375 : 7.5625 * (r -= 2.625 / 2.75) * r + 0.984375;
  },
  bounceInOut: function(r) {
    return r < 0.5 ? On.bounceIn(r * 2) * 0.5 : On.bounceOut(r * 2 - 1) * 0.5 + 0.5;
  }
}, Ca = Math.pow, fr = Math.sqrt, Po = 1e-8, ag = 1e-4, lc = fr(3), Ma = 1 / 3, Ce = qi(), ae = qi(), ki = qi();
function or(r) {
  return r > -Po && r < Po;
}
function og(r) {
  return r > Po || r < -Po;
}
function At(r, t, e, i, n) {
  var a = 1 - n;
  return a * a * (a * r + 3 * n * t) + n * n * (n * i + 3 * a * e);
}
function uc(r, t, e, i, n) {
  var a = 1 - n;
  return 3 * (((t - r) * a + 2 * (e - t) * n) * a + (i - e) * n * n);
}
function Io(r, t, e, i, n, a) {
  var o = i + 3 * (t - e) - r, s = 3 * (e - t * 2 + r), l = 3 * (t - r), u = r - n, f = s * s - 3 * o * l, h = s * l - 9 * o * u, v = l * l - 3 * s * u, c = 0;
  if (or(f) && or(h))
    if (or(s))
      a[0] = 0;
    else {
      var d = -l / s;
      d >= 0 && d <= 1 && (a[c++] = d);
    }
  else {
    var y = h * h - 4 * f * v;
    if (or(y)) {
      var p = h / f, d = -s / o + p, g = -p / 2;
      d >= 0 && d <= 1 && (a[c++] = d), g >= 0 && g <= 1 && (a[c++] = g);
    } else if (y > 0) {
      var m = fr(y), _ = f * s + 1.5 * o * (-h + m), S = f * s + 1.5 * o * (-h - m);
      _ < 0 ? _ = -Ca(-_, Ma) : _ = Ca(_, Ma), S < 0 ? S = -Ca(-S, Ma) : S = Ca(S, Ma);
      var d = (-s - (_ + S)) / (3 * o);
      d >= 0 && d <= 1 && (a[c++] = d);
    } else {
      var w = (2 * f * s - 3 * o * h) / (2 * fr(f * f * f)), b = Math.acos(w) / 3, x = fr(f), D = Math.cos(b), d = (-s - 2 * x * D) / (3 * o), g = (-s + x * (D + lc * Math.sin(b))) / (3 * o), T = (-s + x * (D - lc * Math.sin(b))) / (3 * o);
      d >= 0 && d <= 1 && (a[c++] = d), g >= 0 && g <= 1 && (a[c++] = g), T >= 0 && T <= 1 && (a[c++] = T);
    }
  }
  return c;
}
function sg(r, t, e, i, n) {
  var a = 6 * e - 12 * t + 6 * r, o = 9 * t + 3 * i - 3 * r - 9 * e, s = 3 * t - 3 * r, l = 0;
  if (or(o)) {
    if (og(a)) {
      var u = -s / a;
      u >= 0 && u <= 1 && (n[l++] = u);
    }
  } else {
    var f = a * a - 4 * o * s;
    if (or(f))
      n[0] = -a / (2 * o);
    else if (f > 0) {
      var h = fr(f), u = (-a + h) / (2 * o), v = (-a - h) / (2 * o);
      u >= 0 && u <= 1 && (n[l++] = u), v >= 0 && v <= 1 && (n[l++] = v);
    }
  }
  return l;
}
function Eo(r, t, e, i, n, a) {
  var o = (t - r) * n + r, s = (e - t) * n + t, l = (i - e) * n + e, u = (s - o) * n + o, f = (l - s) * n + s, h = (f - u) * n + u;
  a[0] = r, a[1] = o, a[2] = u, a[3] = h, a[4] = h, a[5] = f, a[6] = l, a[7] = i;
}
function J0(r, t, e, i, n, a, o, s, l, u, f) {
  var h, v = 5e-3, c = 1 / 0, d, y, p, g;
  Ce[0] = l, Ce[1] = u;
  for (var m = 0; m < 1; m += 0.05)
    ae[0] = At(r, e, n, o, m), ae[1] = At(t, i, a, s, m), p = Ii(Ce, ae), p < c && (h = m, c = p);
  c = 1 / 0;
  for (var _ = 0; _ < 32 && !(v < ag); _++)
    d = h - v, y = h + v, ae[0] = At(r, e, n, o, d), ae[1] = At(t, i, a, s, d), p = Ii(ae, Ce), d >= 0 && p < c ? (h = d, c = p) : (ki[0] = At(r, e, n, o, y), ki[1] = At(t, i, a, s, y), g = Ii(ki, Ce), y <= 1 && g < c ? (h = y, c = g) : v *= 0.5);
  return fr(c);
}
function t1(r, t, e, i, n, a, o, s, l) {
  for (var u = r, f = t, h = 0, v = 1 / l, c = 1; c <= l; c++) {
    var d = c * v, y = At(r, e, n, o, d), p = At(t, i, a, s, d), g = y - u, m = p - f;
    h += Math.sqrt(g * g + m * m), u = y, f = p;
  }
  return h;
}
function Vt(r, t, e, i) {
  var n = 1 - i;
  return n * (n * r + 2 * i * t) + i * i * e;
}
function fc(r, t, e, i) {
  return 2 * ((1 - i) * (t - r) + i * (e - t));
}
function e1(r, t, e, i, n) {
  var a = r - 2 * t + e, o = 2 * (t - r), s = r - i, l = 0;
  if (or(a)) {
    if (og(o)) {
      var u = -s / o;
      u >= 0 && u <= 1 && (n[l++] = u);
    }
  } else {
    var f = o * o - 4 * a * s;
    if (or(f)) {
      var u = -o / (2 * a);
      u >= 0 && u <= 1 && (n[l++] = u);
    } else if (f > 0) {
      var h = fr(f), u = (-o + h) / (2 * a), v = (-o - h) / (2 * a);
      u >= 0 && u <= 1 && (n[l++] = u), v >= 0 && v <= 1 && (n[l++] = v);
    }
  }
  return l;
}
function lg(r, t, e) {
  var i = r + e - 2 * t;
  return i === 0 ? 0.5 : (r - t) / i;
}
function Ro(r, t, e, i, n) {
  var a = (t - r) * i + r, o = (e - t) * i + t, s = (o - a) * i + a;
  n[0] = r, n[1] = a, n[2] = s, n[3] = s, n[4] = o, n[5] = e;
}
function r1(r, t, e, i, n, a, o, s, l) {
  var u, f = 5e-3, h = 1 / 0;
  Ce[0] = o, Ce[1] = s;
  for (var v = 0; v < 1; v += 0.05) {
    ae[0] = Vt(r, e, n, v), ae[1] = Vt(t, i, a, v);
    var c = Ii(Ce, ae);
    c < h && (u = v, h = c);
  }
  h = 1 / 0;
  for (var d = 0; d < 32 && !(f < ag); d++) {
    var y = u - f, p = u + f;
    ae[0] = Vt(r, e, n, y), ae[1] = Vt(t, i, a, y);
    var c = Ii(ae, Ce);
    if (y >= 0 && c < h)
      u = y, h = c;
    else {
      ki[0] = Vt(r, e, n, p), ki[1] = Vt(t, i, a, p);
      var g = Ii(ki, Ce);
      p <= 1 && g < h ? (u = p, h = g) : f *= 0.5;
    }
  }
  return fr(h);
}
function i1(r, t, e, i, n, a, o) {
  for (var s = r, l = t, u = 0, f = 1 / o, h = 1; h <= o; h++) {
    var v = h * f, c = Vt(r, e, n, v), d = Vt(t, i, a, v), y = c - s, p = d - l;
    u += Math.sqrt(y * y + p * p), s = c, l = d;
  }
  return u;
}
var n1 = /cubic-bezier\(([0-9,\.e ]+)\)/;
function ug(r) {
  var t = r && n1.exec(r);
  if (t) {
    var e = t[1].split(","), i = +Me(e[0]), n = +Me(e[1]), a = +Me(e[2]), o = +Me(e[3]);
    if (isNaN(i + n + a + o))
      return;
    var s = [];
    return function(l) {
      return l <= 0 ? 0 : l >= 1 ? 1 : Io(0, i, a, 1, l, s) && At(0, n, o, 1, s[0]);
    };
  }
}
var a1 = (function() {
  function r(t) {
    this._inited = !1, this._startTime = 0, this._pausedTime = 0, this._paused = !1, this._life = t.life || 1e3, this._delay = t.delay || 0, this.loop = t.loop || !1, this.onframe = t.onframe || Ut, this.ondestroy = t.ondestroy || Ut, this.onrestart = t.onrestart || Ut, t.easing && this.setEasing(t.easing);
  }
  return r.prototype.step = function(t, e) {
    if (this._inited || (this._startTime = t + this._delay, this._inited = !0), this._paused) {
      this._pausedTime += e;
      return;
    }
    var i = this._life, n = t - this._startTime - this._pausedTime, a = n / i;
    a < 0 && (a = 0), a = Math.min(a, 1);
    var o = this.easingFunc, s = o ? o(a) : a;
    if (this.onframe(s), a === 1)
      if (this.loop) {
        var l = n % i;
        this._startTime = t - l, this._pausedTime = 0, this.onrestart();
      } else
        return !0;
    return !1;
  }, r.prototype.pause = function() {
    this._paused = !0;
  }, r.prototype.resume = function() {
    this._paused = !1;
  }, r.prototype.setEasing = function(t) {
    this.easing = t, this.easingFunc = G(t) ? t : On[t] || ug(t);
  }, r;
})(), fg = /* @__PURE__ */ (function() {
  function r(t) {
    this.value = t;
  }
  return r;
})(), o1 = (function() {
  function r() {
    this._len = 0;
  }
  return r.prototype.insert = function(t) {
    var e = new fg(t);
    return this.insertEntry(e), e;
  }, r.prototype.insertEntry = function(t) {
    this.head ? (this.tail.next = t, t.prev = this.tail, t.next = null, this.tail = t) : this.head = this.tail = t, this._len++;
  }, r.prototype.remove = function(t) {
    var e = t.prev, i = t.next;
    e ? e.next = i : this.head = i, i ? i.prev = e : this.tail = e, t.next = t.prev = null, this._len--;
  }, r.prototype.len = function() {
    return this._len;
  }, r.prototype.clear = function() {
    this.head = this.tail = null, this._len = 0;
  }, r;
})(), pa = (function() {
  function r(t) {
    this._list = new o1(), this._maxSize = 10, this._map = {}, this._maxSize = t;
  }
  return r.prototype.put = function(t, e) {
    var i = this._list, n = this._map, a = null;
    if (n[t] == null) {
      var o = i.len(), s = this._lastRemovedEntry;
      if (o >= this._maxSize && o > 0) {
        var l = i.head;
        i.remove(l), delete n[l.key], a = l.value, this._lastRemovedEntry = l;
      }
      s ? s.value = e : s = new fg(e), s.key = t, i.insertEntry(s), n[t] = s;
    }
    return a;
  }, r.prototype.get = function(t) {
    var e = this._map[t], i = this._list;
    if (e != null)
      return e !== i.tail && (i.remove(e), i.insertEntry(e)), e.value;
  }, r.prototype.clear = function() {
    this._list.clear(), this._map = {};
  }, r.prototype.len = function() {
    return this._list.len();
  }, r;
})(), hc = {
  transparent: [0, 0, 0, 0],
  aliceblue: [240, 248, 255, 1],
  antiquewhite: [250, 235, 215, 1],
  aqua: [0, 255, 255, 1],
  aquamarine: [127, 255, 212, 1],
  azure: [240, 255, 255, 1],
  beige: [245, 245, 220, 1],
  bisque: [255, 228, 196, 1],
  black: [0, 0, 0, 1],
  blanchedalmond: [255, 235, 205, 1],
  blue: [0, 0, 255, 1],
  blueviolet: [138, 43, 226, 1],
  brown: [165, 42, 42, 1],
  burlywood: [222, 184, 135, 1],
  cadetblue: [95, 158, 160, 1],
  chartreuse: [127, 255, 0, 1],
  chocolate: [210, 105, 30, 1],
  coral: [255, 127, 80, 1],
  cornflowerblue: [100, 149, 237, 1],
  cornsilk: [255, 248, 220, 1],
  crimson: [220, 20, 60, 1],
  cyan: [0, 255, 255, 1],
  darkblue: [0, 0, 139, 1],
  darkcyan: [0, 139, 139, 1],
  darkgoldenrod: [184, 134, 11, 1],
  darkgray: [169, 169, 169, 1],
  darkgreen: [0, 100, 0, 1],
  darkgrey: [169, 169, 169, 1],
  darkkhaki: [189, 183, 107, 1],
  darkmagenta: [139, 0, 139, 1],
  darkolivegreen: [85, 107, 47, 1],
  darkorange: [255, 140, 0, 1],
  darkorchid: [153, 50, 204, 1],
  darkred: [139, 0, 0, 1],
  darksalmon: [233, 150, 122, 1],
  darkseagreen: [143, 188, 143, 1],
  darkslateblue: [72, 61, 139, 1],
  darkslategray: [47, 79, 79, 1],
  darkslategrey: [47, 79, 79, 1],
  darkturquoise: [0, 206, 209, 1],
  darkviolet: [148, 0, 211, 1],
  deeppink: [255, 20, 147, 1],
  deepskyblue: [0, 191, 255, 1],
  dimgray: [105, 105, 105, 1],
  dimgrey: [105, 105, 105, 1],
  dodgerblue: [30, 144, 255, 1],
  firebrick: [178, 34, 34, 1],
  floralwhite: [255, 250, 240, 1],
  forestgreen: [34, 139, 34, 1],
  fuchsia: [255, 0, 255, 1],
  gainsboro: [220, 220, 220, 1],
  ghostwhite: [248, 248, 255, 1],
  gold: [255, 215, 0, 1],
  goldenrod: [218, 165, 32, 1],
  gray: [128, 128, 128, 1],
  green: [0, 128, 0, 1],
  greenyellow: [173, 255, 47, 1],
  grey: [128, 128, 128, 1],
  honeydew: [240, 255, 240, 1],
  hotpink: [255, 105, 180, 1],
  indianred: [205, 92, 92, 1],
  indigo: [75, 0, 130, 1],
  ivory: [255, 255, 240, 1],
  khaki: [240, 230, 140, 1],
  lavender: [230, 230, 250, 1],
  lavenderblush: [255, 240, 245, 1],
  lawngreen: [124, 252, 0, 1],
  lemonchiffon: [255, 250, 205, 1],
  lightblue: [173, 216, 230, 1],
  lightcoral: [240, 128, 128, 1],
  lightcyan: [224, 255, 255, 1],
  lightgoldenrodyellow: [250, 250, 210, 1],
  lightgray: [211, 211, 211, 1],
  lightgreen: [144, 238, 144, 1],
  lightgrey: [211, 211, 211, 1],
  lightpink: [255, 182, 193, 1],
  lightsalmon: [255, 160, 122, 1],
  lightseagreen: [32, 178, 170, 1],
  lightskyblue: [135, 206, 250, 1],
  lightslategray: [119, 136, 153, 1],
  lightslategrey: [119, 136, 153, 1],
  lightsteelblue: [176, 196, 222, 1],
  lightyellow: [255, 255, 224, 1],
  lime: [0, 255, 0, 1],
  limegreen: [50, 205, 50, 1],
  linen: [250, 240, 230, 1],
  magenta: [255, 0, 255, 1],
  maroon: [128, 0, 0, 1],
  mediumaquamarine: [102, 205, 170, 1],
  mediumblue: [0, 0, 205, 1],
  mediumorchid: [186, 85, 211, 1],
  mediumpurple: [147, 112, 219, 1],
  mediumseagreen: [60, 179, 113, 1],
  mediumslateblue: [123, 104, 238, 1],
  mediumspringgreen: [0, 250, 154, 1],
  mediumturquoise: [72, 209, 204, 1],
  mediumvioletred: [199, 21, 133, 1],
  midnightblue: [25, 25, 112, 1],
  mintcream: [245, 255, 250, 1],
  mistyrose: [255, 228, 225, 1],
  moccasin: [255, 228, 181, 1],
  navajowhite: [255, 222, 173, 1],
  navy: [0, 0, 128, 1],
  oldlace: [253, 245, 230, 1],
  olive: [128, 128, 0, 1],
  olivedrab: [107, 142, 35, 1],
  orange: [255, 165, 0, 1],
  orangered: [255, 69, 0, 1],
  orchid: [218, 112, 214, 1],
  palegoldenrod: [238, 232, 170, 1],
  palegreen: [152, 251, 152, 1],
  paleturquoise: [175, 238, 238, 1],
  palevioletred: [219, 112, 147, 1],
  papayawhip: [255, 239, 213, 1],
  peachpuff: [255, 218, 185, 1],
  peru: [205, 133, 63, 1],
  pink: [255, 192, 203, 1],
  plum: [221, 160, 221, 1],
  powderblue: [176, 224, 230, 1],
  purple: [128, 0, 128, 1],
  red: [255, 0, 0, 1],
  rosybrown: [188, 143, 143, 1],
  royalblue: [65, 105, 225, 1],
  saddlebrown: [139, 69, 19, 1],
  salmon: [250, 128, 114, 1],
  sandybrown: [244, 164, 96, 1],
  seagreen: [46, 139, 87, 1],
  seashell: [255, 245, 238, 1],
  sienna: [160, 82, 45, 1],
  silver: [192, 192, 192, 1],
  skyblue: [135, 206, 235, 1],
  slateblue: [106, 90, 205, 1],
  slategray: [112, 128, 144, 1],
  slategrey: [112, 128, 144, 1],
  snow: [255, 250, 250, 1],
  springgreen: [0, 255, 127, 1],
  steelblue: [70, 130, 180, 1],
  tan: [210, 180, 140, 1],
  teal: [0, 128, 128, 1],
  thistle: [216, 191, 216, 1],
  tomato: [255, 99, 71, 1],
  turquoise: [64, 224, 208, 1],
  violet: [238, 130, 238, 1],
  wheat: [245, 222, 179, 1],
  white: [255, 255, 255, 1],
  whitesmoke: [245, 245, 245, 1],
  yellow: [255, 255, 0, 1],
  yellowgreen: [154, 205, 50, 1]
};
function hr(r) {
  return r = Math.round(r), r < 0 ? 0 : r > 255 ? 255 : r;
}
function _u(r) {
  return r < 0 ? 0 : r > 1 ? 1 : r;
}
function Zs(r) {
  var t = r;
  return t.length && t.charAt(t.length - 1) === "%" ? hr(parseFloat(t) / 100 * 255) : hr(parseInt(t, 10));
}
function Nn(r) {
  var t = r;
  return t.length && t.charAt(t.length - 1) === "%" ? _u(parseFloat(t) / 100) : _u(parseFloat(t));
}
function qs(r, t, e) {
  return e < 0 ? e += 1 : e > 1 && (e -= 1), e * 6 < 1 ? r + (t - r) * e * 6 : e * 2 < 1 ? t : e * 3 < 2 ? r + (t - r) * (2 / 3 - e) * 6 : r;
}
function Da(r, t, e) {
  return r + (t - r) * e;
}
function ee(r, t, e, i, n) {
  return r[0] = t, r[1] = e, r[2] = i, r[3] = n, r;
}
function Su(r, t) {
  return r[0] = t[0], r[1] = t[1], r[2] = t[2], r[3] = t[3], r;
}
var hg = new pa(20), Aa = null;
function li(r, t) {
  Aa && Su(Aa, t), Aa = hg.put(r, Aa || t.slice());
}
function ze(r, t) {
  if (r) {
    t = t || [];
    var e = hg.get(r);
    if (e)
      return Su(t, e);
    r = r + "";
    var i = r.replace(/ /g, "").toLowerCase();
    if (i in hc)
      return Su(t, hc[i]), li(r, t), t;
    var n = i.length;
    if (i.charAt(0) === "#") {
      if (n === 4 || n === 5) {
        var a = parseInt(i.slice(1, 4), 16);
        if (!(a >= 0 && a <= 4095)) {
          ee(t, 0, 0, 0, 1);
          return;
        }
        return ee(t, (a & 3840) >> 4 | (a & 3840) >> 8, a & 240 | (a & 240) >> 4, a & 15 | (a & 15) << 4, n === 5 ? parseInt(i.slice(4), 16) / 15 : 1), li(r, t), t;
      } else if (n === 7 || n === 9) {
        var a = parseInt(i.slice(1, 7), 16);
        if (!(a >= 0 && a <= 16777215)) {
          ee(t, 0, 0, 0, 1);
          return;
        }
        return ee(t, (a & 16711680) >> 16, (a & 65280) >> 8, a & 255, n === 9 ? parseInt(i.slice(7), 16) / 255 : 1), li(r, t), t;
      }
      return;
    }
    var o = i.indexOf("("), s = i.indexOf(")");
    if (o !== -1 && s + 1 === n) {
      var l = i.substr(0, o), u = i.substr(o + 1, s - (o + 1)).split(","), f = 1;
      switch (l) {
        case "rgba":
          if (u.length !== 4)
            return u.length === 3 ? ee(t, +u[0], +u[1], +u[2], 1) : ee(t, 0, 0, 0, 1);
          f = Nn(u.pop());
        case "rgb":
          if (u.length >= 3)
            return ee(t, Zs(u[0]), Zs(u[1]), Zs(u[2]), u.length === 3 ? f : Nn(u[3])), li(r, t), t;
          ee(t, 0, 0, 0, 1);
          return;
        case "hsla":
          if (u.length !== 4) {
            ee(t, 0, 0, 0, 1);
            return;
          }
          return u[3] = Nn(u[3]), cc(u, t), li(r, t), t;
        case "hsl":
          if (u.length !== 3) {
            ee(t, 0, 0, 0, 1);
            return;
          }
          return cc(u, t), li(r, t), t;
        default:
          return;
      }
    }
    ee(t, 0, 0, 0, 1);
  }
}
function cc(r, t) {
  var e = (parseFloat(r[0]) % 360 + 360) % 360 / 360, i = Nn(r[1]), n = Nn(r[2]), a = n <= 0.5 ? n * (i + 1) : n + i - n * i, o = n * 2 - a;
  return t = t || [], ee(t, hr(qs(o, a, e + 1 / 3) * 255), hr(qs(o, a, e) * 255), hr(qs(o, a, e - 1 / 3) * 255), 1), r.length === 4 && (t[3] = r[3]), t;
}
function vc(r, t) {
  var e = ze(r);
  if (e) {
    for (var i = 0; i < 3; i++)
      e[i] = e[i] * (1 - t) | 0, e[i] > 255 ? e[i] = 255 : e[i] < 0 && (e[i] = 0);
    return ns(e, e.length === 4 ? "rgba" : "rgb");
  }
}
function s1(r, t, e) {
  if (!(!(t && t.length) || !(r >= 0 && r <= 1))) {
    var i = r * (t.length - 1), n = Math.floor(i), a = Math.ceil(i), o = ze(t[n]), s = ze(t[a]), l = i - n, u = ns([
      hr(Da(o[0], s[0], l)),
      hr(Da(o[1], s[1], l)),
      hr(Da(o[2], s[2], l)),
      _u(Da(o[3], s[3], l))
    ], "rgba");
    return e ? {
      color: u,
      leftIndex: n,
      rightIndex: a,
      value: i
    } : u;
  }
}
function ns(r, t) {
  if (!(!r || !r.length)) {
    var e = r[0] + "," + r[1] + "," + r[2];
    return (t === "rgba" || t === "hsva" || t === "hsla") && (e += "," + r[3]), t + "(" + e + ")";
  }
}
function ko(r, t) {
  var e = ze(r);
  return e ? (0.299 * e[0] + 0.587 * e[1] + 0.114 * e[2]) * e[3] / 255 + (1 - e[3]) * t : 0;
}
var dc = new pa(100);
function pc(r) {
  if (z(r)) {
    var t = dc.get(r);
    return t || (t = vc(r, -0.1), dc.put(r, t)), t;
  } else if (rs(r)) {
    var e = k({}, r);
    return e.colorStops = H(r.colorStops, function(i) {
      return {
        offset: i.offset,
        color: vc(i.color, -0.1)
      };
    }), e;
  }
  return r;
}
function l1(r) {
  return r.type === "linear";
}
function u1(r) {
  return r.type === "radial";
}
(function() {
  return U.hasGlobalWindow && G(window.btoa) ? function(r) {
    return window.btoa(unescape(encodeURIComponent(r)));
  } : typeof Buffer < "u" ? function(r) {
    return Buffer.from(r).toString("base64");
  } : function(r) {
    return null;
  };
})();
var bu = Array.prototype.slice;
function Be(r, t, e) {
  return (t - r) * e + r;
}
function Ks(r, t, e, i) {
  for (var n = t.length, a = 0; a < n; a++)
    r[a] = Be(t[a], e[a], i);
  return r;
}
function f1(r, t, e, i) {
  for (var n = t.length, a = n && t[0].length, o = 0; o < n; o++) {
    r[o] || (r[o] = []);
    for (var s = 0; s < a; s++)
      r[o][s] = Be(t[o][s], e[o][s], i);
  }
  return r;
}
function La(r, t, e, i) {
  for (var n = t.length, a = 0; a < n; a++)
    r[a] = t[a] + e[a] * i;
  return r;
}
function gc(r, t, e, i) {
  for (var n = t.length, a = n && t[0].length, o = 0; o < n; o++) {
    r[o] || (r[o] = []);
    for (var s = 0; s < a; s++)
      r[o][s] = t[o][s] + e[o][s] * i;
  }
  return r;
}
function h1(r, t) {
  for (var e = r.length, i = t.length, n = e > i ? t : r, a = Math.min(e, i), o = n[a - 1] || { color: [0, 0, 0, 0], offset: 0 }, s = a; s < Math.max(e, i); s++)
    n.push({
      offset: o.offset,
      color: o.color.slice()
    });
}
function c1(r, t, e) {
  var i = r, n = t;
  if (!(!i.push || !n.push)) {
    var a = i.length, o = n.length;
    if (a !== o) {
      var s = a > o;
      if (s)
        i.length = o;
      else
        for (var l = a; l < o; l++)
          i.push(e === 1 ? n[l] : bu.call(n[l]));
    }
    for (var u = i[0] && i[0].length, l = 0; l < i.length; l++)
      if (e === 1)
        isNaN(i[l]) && (i[l] = n[l]);
      else
        for (var f = 0; f < u; f++)
          isNaN(i[l][f]) && (i[l][f] = n[l][f]);
  }
}
function po(r) {
  if (Yt(r)) {
    var t = r.length;
    if (Yt(r[0])) {
      for (var e = [], i = 0; i < t; i++)
        e.push(bu.call(r[i]));
      return e;
    }
    return bu.call(r);
  }
  return r;
}
function go(r) {
  return r[0] = Math.floor(r[0]) || 0, r[1] = Math.floor(r[1]) || 0, r[2] = Math.floor(r[2]) || 0, r[3] = r[3] == null ? 1 : r[3], "rgba(" + r.join(",") + ")";
}
function v1(r) {
  return Yt(r && r[0]) ? 2 : 1;
}
var Pa = 0, yo = 1, cg = 2, Cn = 3, wu = 4, xu = 5, yc = 6;
function mc(r) {
  return r === wu || r === xu;
}
function Ia(r) {
  return r === yo || r === cg;
}
var sn = [0, 0, 0, 0], d1 = (function() {
  function r(t) {
    this.keyframes = [], this.discrete = !1, this._invalid = !1, this._needsSort = !1, this._lastFr = 0, this._lastFrP = 0, this.propName = t;
  }
  return r.prototype.isFinished = function() {
    return this._finished;
  }, r.prototype.setFinished = function() {
    this._finished = !0, this._additiveTrack && this._additiveTrack.setFinished();
  }, r.prototype.needsAnimate = function() {
    return this.keyframes.length >= 1;
  }, r.prototype.getAdditiveTrack = function() {
    return this._additiveTrack;
  }, r.prototype.addKeyframe = function(t, e, i) {
    this._needsSort = !0;
    var n = this.keyframes, a = n.length, o = !1, s = yc, l = e;
    if (Yt(e)) {
      var u = v1(e);
      s = u, (u === 1 && !vt(e[0]) || u === 2 && !vt(e[0][0])) && (o = !0);
    } else if (vt(e) && !Ao(e))
      s = Pa;
    else if (z(e))
      if (!isNaN(+e))
        s = Pa;
      else {
        var f = ze(e);
        f && (l = f, s = Cn);
      }
    else if (rs(e)) {
      var h = k({}, l);
      h.colorStops = H(e.colorStops, function(c) {
        return {
          offset: c.offset,
          color: ze(c.color)
        };
      }), l1(e) ? s = wu : u1(e) && (s = xu), l = h;
    }
    a === 0 ? this.valType = s : (s !== this.valType || s === yc) && (o = !0), this.discrete = this.discrete || o;
    var v = {
      time: t,
      value: l,
      rawValue: e,
      percent: 0
    };
    return i && (v.easing = i, v.easingFunc = G(i) ? i : On[i] || ug(i)), n.push(v), v;
  }, r.prototype.prepare = function(t, e) {
    var i = this.keyframes;
    this._needsSort && i.sort(function(y, p) {
      return y.time - p.time;
    });
    for (var n = this.valType, a = i.length, o = i[a - 1], s = this.discrete, l = Ia(n), u = mc(n), f = 0; f < a; f++) {
      var h = i[f], v = h.value, c = o.value;
      h.percent = h.time / t, s || (l && f !== a - 1 ? c1(v, c, n) : u && h1(v.colorStops, c.colorStops));
    }
    if (!s && n !== xu && e && this.needsAnimate() && e.needsAnimate() && n === e.valType && !e._finished) {
      this._additiveTrack = e;
      for (var d = i[0].value, f = 0; f < a; f++)
        n === Pa ? i[f].additiveValue = i[f].value - d : n === Cn ? i[f].additiveValue = La([], i[f].value, d, -1) : Ia(n) && (i[f].additiveValue = n === yo ? La([], i[f].value, d, -1) : gc([], i[f].value, d, -1));
    }
  }, r.prototype.step = function(t, e) {
    if (!this._finished) {
      this._additiveTrack && this._additiveTrack._finished && (this._additiveTrack = null);
      var i = this._additiveTrack != null, n = i ? "additiveValue" : "value", a = this.valType, o = this.keyframes, s = o.length, l = this.propName, u = a === Cn, f, h = this._lastFr, v = Math.min, c, d;
      if (s === 1)
        c = d = o[0];
      else {
        if (e < 0)
          f = 0;
        else if (e < this._lastFrP) {
          var y = v(h + 1, s - 1);
          for (f = y; f >= 0 && !(o[f].percent <= e); f--)
            ;
          f = v(f, s - 2);
        } else {
          for (f = h; f < s && !(o[f].percent > e); f++)
            ;
          f = v(f - 1, s - 2);
        }
        d = o[f + 1], c = o[f];
      }
      if (c && d) {
        this._lastFr = f, this._lastFrP = e;
        var p = d.percent - c.percent, g = p === 0 ? 1 : v((e - c.percent) / p, 1);
        d.easingFunc && (g = d.easingFunc(g));
        var m = i ? this._additiveValue : u ? sn : t[l];
        if ((Ia(a) || u) && !m && (m = this._additiveValue = []), this.discrete)
          t[l] = g < 1 ? c.rawValue : d.rawValue;
        else if (Ia(a))
          a === yo ? Ks(m, c[n], d[n], g) : f1(m, c[n], d[n], g);
        else if (mc(a)) {
          var _ = c[n], S = d[n], w = a === wu;
          t[l] = {
            type: w ? "linear" : "radial",
            x: Be(_.x, S.x, g),
            y: Be(_.y, S.y, g),
            colorStops: H(_.colorStops, function(x, D) {
              var T = S.colorStops[D];
              return {
                offset: Be(x.offset, T.offset, g),
                color: go(Ks([], x.color, T.color, g))
              };
            }),
            global: S.global
          }, w ? (t[l].x2 = Be(_.x2, S.x2, g), t[l].y2 = Be(_.y2, S.y2, g)) : t[l].r = Be(_.r, S.r, g);
        } else if (u)
          Ks(m, c[n], d[n], g), i || (t[l] = go(m));
        else {
          var b = Be(c[n], d[n], g);
          i ? this._additiveValue = b : t[l] = b;
        }
        i && this._addToTarget(t);
      }
    }
  }, r.prototype._addToTarget = function(t) {
    var e = this.valType, i = this.propName, n = this._additiveValue;
    e === Pa ? t[i] = t[i] + n : e === Cn ? (ze(t[i], sn), La(sn, sn, n, 1), t[i] = go(sn)) : e === yo ? La(t[i], t[i], n, 1) : e === cg && gc(t[i], t[i], n, 1);
  }, r;
})(), Of = (function() {
  function r(t, e, i, n) {
    if (this._tracks = {}, this._trackKeys = [], this._maxTime = 0, this._started = 0, this._clip = null, this._target = t, this._loop = e, e && n) {
      Af("Can' use additive animation on looped animation.");
      return;
    }
    this._additiveAnimators = n, this._allowDiscrete = i;
  }
  return r.prototype.getMaxTime = function() {
    return this._maxTime;
  }, r.prototype.getDelay = function() {
    return this._delay;
  }, r.prototype.getLoop = function() {
    return this._loop;
  }, r.prototype.getTarget = function() {
    return this._target;
  }, r.prototype.changeTarget = function(t) {
    this._target = t;
  }, r.prototype.when = function(t, e, i) {
    return this.whenWithKeys(t, e, pt(e), i);
  }, r.prototype.whenWithKeys = function(t, e, i, n) {
    for (var a = this._tracks, o = 0; o < i.length; o++) {
      var s = i[o], l = a[s];
      if (!l) {
        l = a[s] = new d1(s);
        var u = void 0, f = this._getAdditiveTrack(s);
        if (f) {
          var h = f.keyframes, v = h[h.length - 1];
          u = v && v.value, f.valType === Cn && u && (u = go(u));
        } else
          u = this._target[s];
        if (u == null)
          continue;
        t > 0 && l.addKeyframe(0, po(u), n), this._trackKeys.push(s);
      }
      l.addKeyframe(t, po(e[s]), n);
    }
    return this._maxTime = Math.max(this._maxTime, t), this;
  }, r.prototype.pause = function() {
    this._clip.pause(), this._paused = !0;
  }, r.prototype.resume = function() {
    this._clip.resume(), this._paused = !1;
  }, r.prototype.isPaused = function() {
    return !!this._paused;
  }, r.prototype.duration = function(t) {
    return this._maxTime = t, this._force = !0, this;
  }, r.prototype._doneCallback = function() {
    this._setTracksFinished(), this._clip = null;
    var t = this._doneCbs;
    if (t)
      for (var e = t.length, i = 0; i < e; i++)
        t[i].call(this);
  }, r.prototype._abortedCallback = function() {
    this._setTracksFinished();
    var t = this.animation, e = this._abortedCbs;
    if (t && t.removeClip(this._clip), this._clip = null, e)
      for (var i = 0; i < e.length; i++)
        e[i].call(this);
  }, r.prototype._setTracksFinished = function() {
    for (var t = this._tracks, e = this._trackKeys, i = 0; i < e.length; i++)
      t[e[i]].setFinished();
  }, r.prototype._getAdditiveTrack = function(t) {
    var e, i = this._additiveAnimators;
    if (i)
      for (var n = 0; n < i.length; n++) {
        var a = i[n].getTrack(t);
        a && (e = a);
      }
    return e;
  }, r.prototype.start = function(t) {
    if (!(this._started > 0)) {
      this._started = 1;
      for (var e = this, i = [], n = this._maxTime || 0, a = 0; a < this._trackKeys.length; a++) {
        var o = this._trackKeys[a], s = this._tracks[o], l = this._getAdditiveTrack(o), u = s.keyframes, f = u.length;
        if (s.prepare(n, l), s.needsAnimate())
          if (!this._allowDiscrete && s.discrete) {
            var h = u[f - 1];
            h && (e._target[s.propName] = h.rawValue), s.setFinished();
          } else
            i.push(s);
      }
      if (i.length || this._force) {
        var v = new a1({
          life: n,
          loop: this._loop,
          delay: this._delay || 0,
          onframe: function(c) {
            e._started = 2;
            var d = e._additiveAnimators;
            if (d) {
              for (var y = !1, p = 0; p < d.length; p++)
                if (d[p]._clip) {
                  y = !0;
                  break;
                }
              y || (e._additiveAnimators = null);
            }
            for (var p = 0; p < i.length; p++)
              i[p].step(e._target, c);
            var g = e._onframeCbs;
            if (g)
              for (var p = 0; p < g.length; p++)
                g[p](e._target, c);
          },
          ondestroy: function() {
            e._doneCallback();
          }
        });
        this._clip = v, this.animation && this.animation.addClip(v), t && v.setEasing(t);
      } else
        this._doneCallback();
      return this;
    }
  }, r.prototype.stop = function(t) {
    if (this._clip) {
      var e = this._clip;
      t && e.onframe(1), this._abortedCallback();
    }
  }, r.prototype.delay = function(t) {
    return this._delay = t, this;
  }, r.prototype.during = function(t) {
    return t && (this._onframeCbs || (this._onframeCbs = []), this._onframeCbs.push(t)), this;
  }, r.prototype.done = function(t) {
    return t && (this._doneCbs || (this._doneCbs = []), this._doneCbs.push(t)), this;
  }, r.prototype.aborted = function(t) {
    return t && (this._abortedCbs || (this._abortedCbs = []), this._abortedCbs.push(t)), this;
  }, r.prototype.getClip = function() {
    return this._clip;
  }, r.prototype.getTrack = function(t) {
    return this._tracks[t];
  }, r.prototype.getTracks = function() {
    var t = this;
    return H(this._trackKeys, function(e) {
      return t._tracks[e];
    });
  }, r.prototype.stopTracks = function(t, e) {
    if (!t.length || !this._clip)
      return !0;
    for (var i = this._tracks, n = this._trackKeys, a = 0; a < t.length; a++) {
      var o = i[t[a]];
      o && !o.isFinished() && (e ? o.step(this._target, 1) : this._started === 1 && o.step(this._target, 0), o.setFinished());
    }
    for (var s = !0, a = 0; a < n.length; a++)
      if (!i[n[a]].isFinished()) {
        s = !1;
        break;
      }
    return s && this._abortedCallback(), s;
  }, r.prototype.saveTo = function(t, e, i) {
    if (t) {
      e = e || this._trackKeys;
      for (var n = 0; n < e.length; n++) {
        var a = e[n], o = this._tracks[a];
        if (!(!o || o.isFinished())) {
          var s = o.keyframes, l = s[i ? 0 : s.length - 1];
          l && (t[a] = po(l.rawValue));
        }
      }
    }
  }, r.prototype.__changeFinalValue = function(t, e) {
    e = e || pt(t);
    for (var i = 0; i < e.length; i++) {
      var n = e[i], a = this._tracks[n];
      if (a) {
        var o = a.keyframes;
        if (o.length > 1) {
          var s = o.pop();
          a.addKeyframe(s.time, t[n]), a.prepare(this._maxTime, a.getAdditiveTrack());
        }
      }
    }
  }, r;
})();
function Di() {
  return (/* @__PURE__ */ new Date()).getTime();
}
var p1 = (function(r) {
  O(t, r);
  function t(e) {
    var i = r.call(this) || this;
    return i._running = !1, i._time = 0, i._pausedTime = 0, i._pauseStart = 0, i._paused = !1, e = e || {}, i.stage = e.stage || {}, i;
  }
  return t.prototype.addClip = function(e) {
    e.animation && this.removeClip(e), this._head ? (this._tail.next = e, e.prev = this._tail, e.next = null, this._tail = e) : this._head = this._tail = e, e.animation = this;
  }, t.prototype.addAnimator = function(e) {
    e.animation = this;
    var i = e.getClip();
    i && this.addClip(i);
  }, t.prototype.removeClip = function(e) {
    if (e.animation) {
      var i = e.prev, n = e.next;
      i ? i.next = n : this._head = n, n ? n.prev = i : this._tail = i, e.next = e.prev = e.animation = null;
    }
  }, t.prototype.removeAnimator = function(e) {
    var i = e.getClip();
    i && this.removeClip(i), e.animation = null;
  }, t.prototype.update = function(e) {
    for (var i = Di() - this._pausedTime, n = i - this._time, a = this._head; a; ) {
      var o = a.next, s = a.step(i, n);
      s && (a.ondestroy(), this.removeClip(a)), a = o;
    }
    this._time = i, e || (this.trigger("frame", n), this.stage.update && this.stage.update());
  }, t.prototype._startLoop = function() {
    var e = this;
    this._running = !0;
    function i() {
      e._running && (Lo(i), !e._paused && e.update());
    }
    Lo(i);
  }, t.prototype.start = function() {
    this._running || (this._time = Di(), this._pausedTime = 0, this._startLoop());
  }, t.prototype.stop = function() {
    this._running = !1;
  }, t.prototype.pause = function() {
    this._paused || (this._pauseStart = Di(), this._paused = !0);
  }, t.prototype.resume = function() {
    this._paused && (this._pausedTime += Di() - this._pauseStart, this._paused = !1);
  }, t.prototype.clear = function() {
    for (var e = this._head; e; ) {
      var i = e.next;
      e.prev = e.next = e.animation = null, e = i;
    }
    this._head = this._tail = null;
  }, t.prototype.isFinished = function() {
    return this._head == null;
  }, t.prototype.animate = function(e, i) {
    i = i || {}, this.start();
    var n = new Of(e, i.loop);
    return this.addAnimator(n), n;
  }, t;
})(Ie), g1 = 300, js = U.domSupported, Qs = (function() {
  var r = [
    "click",
    "dblclick",
    "mousewheel",
    "wheel",
    "mouseout",
    "mouseup",
    "mousedown",
    "mousemove",
    "contextmenu"
  ], t = [
    "touchstart",
    "touchend",
    "touchmove"
  ], e = {
    pointerdown: 1,
    pointerup: 1,
    pointermove: 1,
    pointerout: 1
  }, i = H(r, function(n) {
    var a = n.replace("mouse", "pointer");
    return e.hasOwnProperty(a) ? a : n;
  });
  return {
    mouse: r,
    touch: t,
    pointer: i
  };
})(), _c = {
  mouse: ["mousemove", "mouseup"],
  pointer: ["pointermove", "pointerup"]
}, Sc = !1;
function Tu(r) {
  var t = r.pointerType;
  return t === "pen" || t === "touch";
}
function y1(r) {
  r.touching = !0, r.touchTimer != null && (clearTimeout(r.touchTimer), r.touchTimer = null), r.touchTimer = setTimeout(function() {
    r.touching = !1, r.touchTimer = null;
  }, 700);
}
function Js(r) {
  r && (r.zrByTouch = !0);
}
function m1(r, t) {
  return re(r.dom, new _1(r, t), !0);
}
function vg(r, t) {
  for (var e = t, i = !1; e && e.nodeType !== 9 && !(i = e.domBelongToZr || e !== t && e === r.painterRoot); )
    e = e.parentNode;
  return i;
}
var _1 = /* @__PURE__ */ (function() {
  function r(t, e) {
    this.stopPropagation = Ut, this.stopImmediatePropagation = Ut, this.preventDefault = Ut, this.type = e.type, this.target = this.currentTarget = t.dom, this.pointerType = e.pointerType, this.clientX = e.clientX, this.clientY = e.clientY;
  }
  return r;
})(), pe = {
  mousedown: function(r) {
    r = re(this.dom, r), this.__mayPointerCapture = [r.zrX, r.zrY], this.trigger("mousedown", r);
  },
  mousemove: function(r) {
    r = re(this.dom, r);
    var t = this.__mayPointerCapture;
    t && (r.zrX !== t[0] || r.zrY !== t[1]) && this.__togglePointerCapture(!0), this.trigger("mousemove", r);
  },
  mouseup: function(r) {
    r = re(this.dom, r), this.__togglePointerCapture(!1), this.trigger("mouseup", r);
  },
  mouseout: function(r) {
    r = re(this.dom, r);
    var t = r.toElement || r.relatedTarget;
    vg(this, t) || (this.__pointerCapturing && (r.zrEventControl = "no_globalout"), this.trigger("mouseout", r));
  },
  wheel: function(r) {
    Sc = !0, r = re(this.dom, r), this.trigger("mousewheel", r);
  },
  mousewheel: function(r) {
    Sc || (r = re(this.dom, r), this.trigger("mousewheel", r));
  },
  touchstart: function(r) {
    r = re(this.dom, r), Js(r), this.__lastTouchMoment = /* @__PURE__ */ new Date(), this.handler.processGesture(r, "start"), pe.mousemove.call(this, r), pe.mousedown.call(this, r);
  },
  touchmove: function(r) {
    r = re(this.dom, r), Js(r), this.handler.processGesture(r, "change"), pe.mousemove.call(this, r);
  },
  touchend: function(r) {
    r = re(this.dom, r), Js(r), this.handler.processGesture(r, "end"), pe.mouseup.call(this, r), +/* @__PURE__ */ new Date() - +this.__lastTouchMoment < g1 && pe.click.call(this, r);
  },
  pointerdown: function(r) {
    pe.mousedown.call(this, r);
  },
  pointermove: function(r) {
    Tu(r) || pe.mousemove.call(this, r);
  },
  pointerup: function(r) {
    pe.mouseup.call(this, r);
  },
  pointerout: function(r) {
    Tu(r) || pe.mouseout.call(this, r);
  }
};
A(["click", "dblclick", "contextmenu"], function(r) {
  pe[r] = function(t) {
    t = re(this.dom, t), this.trigger(r, t);
  };
});
var Cu = {
  pointermove: function(r) {
    Tu(r) || Cu.mousemove.call(this, r);
  },
  pointerup: function(r) {
    Cu.mouseup.call(this, r);
  },
  mousemove: function(r) {
    this.trigger("mousemove", r);
  },
  mouseup: function(r) {
    var t = this.__pointerCapturing;
    this.__togglePointerCapture(!1), this.trigger("mouseup", r), t && (r.zrEventControl = "only_globalout", this.trigger("mouseout", r));
  }
};
function S1(r, t) {
  var e = t.domHandlers;
  U.pointerEventsSupported ? A(Qs.pointer, function(i) {
    mo(t, i, function(n) {
      e[i].call(r, n);
    });
  }) : (U.touchEventsSupported && A(Qs.touch, function(i) {
    mo(t, i, function(n) {
      e[i].call(r, n), y1(t);
    });
  }), A(Qs.mouse, function(i) {
    mo(t, i, function(n) {
      n = If(n), t.touching || e[i].call(r, n);
    });
  }));
}
function b1(r, t) {
  U.pointerEventsSupported ? A(_c.pointer, e) : U.touchEventsSupported || A(_c.mouse, e);
  function e(i) {
    function n(a) {
      a = If(a), vg(r, a.target) || (a = m1(r, a), t.domHandlers[i].call(r, a));
    }
    mo(t, i, n, { capture: !0 });
  }
}
function mo(r, t, e, i) {
  r.mounted[t] = e, r.listenerOpts[t] = i, F0(r.domTarget, t, e, i);
}
function tl(r) {
  var t = r.mounted;
  for (var e in t)
    t.hasOwnProperty(e) && z0(r.domTarget, e, t[e], r.listenerOpts[e]);
  r.mounted = {};
}
var bc = /* @__PURE__ */ (function() {
  function r(t, e) {
    this.mounted = {}, this.listenerOpts = {}, this.touching = !1, this.domTarget = t, this.domHandlers = e;
  }
  return r;
})(), w1 = (function(r) {
  O(t, r);
  function t(e, i) {
    var n = r.call(this) || this;
    return n.__pointerCapturing = !1, n.dom = e, n.painterRoot = i, n._localHandlerScope = new bc(e, pe), js && (n._globalHandlerScope = new bc(document, Cu)), S1(n, n._localHandlerScope), n;
  }
  return t.prototype.dispose = function() {
    tl(this._localHandlerScope), js && tl(this._globalHandlerScope);
  }, t.prototype.setCursor = function(e) {
    this.dom.style && (this.dom.style.cursor = e || "default");
  }, t.prototype.__togglePointerCapture = function(e) {
    if (this.__mayPointerCapture = null, js && +this.__pointerCapturing ^ +e) {
      this.__pointerCapturing = e;
      var i = this._globalHandlerScope;
      e ? b1(this, i) : tl(i);
    }
  }, t;
})(Ie), dg = 1;
U.hasGlobalWindow && (dg = Math.max(window.devicePixelRatio || window.screen && window.screen.deviceXDPI / window.screen.logicalXDPI || 1, 1));
var Oo = dg, Mu = 0.4, Du = "#333", Au = "#ccc", x1 = "#eee", wc = Ef, xc = 5e-5;
function wr(r) {
  return r > xc || r < -xc;
}
var xr = [], ui = [], el = Ei(), rl = Math.abs, Nf = (function() {
  function r() {
  }
  return r.prototype.getLocalTransform = function(t) {
    return r.getLocalTransform(this, t);
  }, r.prototype.setPosition = function(t) {
    this.x = t[0], this.y = t[1];
  }, r.prototype.setScale = function(t) {
    this.scaleX = t[0], this.scaleY = t[1];
  }, r.prototype.setSkew = function(t) {
    this.skewX = t[0], this.skewY = t[1];
  }, r.prototype.setOrigin = function(t) {
    this.originX = t[0], this.originY = t[1];
  }, r.prototype.needLocalTransform = function() {
    return wr(this.rotation) || wr(this.x) || wr(this.y) || wr(this.scaleX - 1) || wr(this.scaleY - 1) || wr(this.skewX) || wr(this.skewY);
  }, r.prototype.updateTransform = function() {
    var t = this.parent && this.parent.transform, e = this.needLocalTransform(), i = this.transform;
    if (!(e || t)) {
      i && (wc(i), this.invTransform = null);
      return;
    }
    i = i || Ei(), e ? this.getLocalTransform(i) : wc(i), t && (e ? Ri(i, t, i) : V0(i, t)), this.transform = i, this._resolveGlobalScaleRatio(i);
  }, r.prototype._resolveGlobalScaleRatio = function(t) {
    var e = this.globalScaleRatio;
    if (e != null && e !== 1) {
      this.getGlobalScale(xr);
      var i = xr[0] < 0 ? -1 : 1, n = xr[1] < 0 ? -1 : 1, a = ((xr[0] - i) * e + i) / xr[0] || 0, o = ((xr[1] - n) * e + n) / xr[1] || 0;
      t[0] *= a, t[1] *= a, t[2] *= o, t[3] *= o;
    }
    this.invTransform = this.invTransform || Ei(), kf(this.invTransform, t);
  }, r.prototype.getComputedTransform = function() {
    for (var t = this, e = []; t; )
      e.push(t), t = t.parent;
    for (; t = e.pop(); )
      t.updateTransform();
    return this.transform;
  }, r.prototype.setLocalTransform = function(t) {
    if (t) {
      var e = t[0] * t[0] + t[1] * t[1], i = t[2] * t[2] + t[3] * t[3], n = Math.atan2(t[1], t[0]), a = Math.PI / 2 + n - Math.atan2(t[3], t[2]);
      i = Math.sqrt(i) * Math.cos(a), e = Math.sqrt(e), this.skewX = a, this.skewY = 0, this.rotation = -n, this.x = +t[4], this.y = +t[5], this.scaleX = e, this.scaleY = i, this.originX = 0, this.originY = 0;
    }
  }, r.prototype.decomposeTransform = function() {
    if (this.transform) {
      var t = this.parent, e = this.transform;
      t && t.transform && (t.invTransform = t.invTransform || Ei(), Ri(ui, t.invTransform, e), e = ui);
      var i = this.originX, n = this.originY;
      (i || n) && (el[4] = i, el[5] = n, Ri(ui, e, el), ui[4] -= i, ui[5] -= n, e = ui), this.setLocalTransform(e);
    }
  }, r.prototype.getGlobalScale = function(t) {
    var e = this.transform;
    return t = t || [], e ? (t[0] = Math.sqrt(e[0] * e[0] + e[1] * e[1]), t[1] = Math.sqrt(e[2] * e[2] + e[3] * e[3]), e[0] < 0 && (t[0] = -t[0]), e[3] < 0 && (t[1] = -t[1]), t) : (t[0] = 1, t[1] = 1, t);
  }, r.prototype.transformCoordToLocal = function(t, e) {
    var i = [t, e], n = this.invTransform;
    return n && ue(i, i, n), i;
  }, r.prototype.transformCoordToGlobal = function(t, e) {
    var i = [t, e], n = this.transform;
    return n && ue(i, i, n), i;
  }, r.prototype.getLineScale = function() {
    var t = this.transform;
    return t && rl(t[0] - 1) > 1e-10 && rl(t[3] - 1) > 1e-10 ? Math.sqrt(rl(t[0] * t[3] - t[2] * t[1])) : 1;
  }, r.prototype.copyTransform = function(t) {
    T1(this, t);
  }, r.getLocalTransform = function(t, e) {
    e = e || [];
    var i = t.originX || 0, n = t.originY || 0, a = t.scaleX, o = t.scaleY, s = t.anchorX, l = t.anchorY, u = t.rotation || 0, f = t.x, h = t.y, v = t.skewX ? Math.tan(t.skewX) : 0, c = t.skewY ? Math.tan(-t.skewY) : 0;
    if (i || n || s || l) {
      var d = i + s, y = n + l;
      e[4] = -d * a - v * y * o, e[5] = -y * o - c * d * a;
    } else
      e[4] = e[5] = 0;
    return e[0] = a, e[3] = o, e[1] = c * a, e[2] = v * o, u && Rf(e, e, u), e[4] += i + f, e[5] += n + h, e;
  }, r.initDefaultProps = (function() {
    var t = r.prototype;
    t.scaleX = t.scaleY = t.globalScaleRatio = 1, t.x = t.y = t.originX = t.originY = t.skewX = t.skewY = t.rotation = t.anchorX = t.anchorY = 0;
  })(), r;
})(), ta = [
  "x",
  "y",
  "originX",
  "originY",
  "anchorX",
  "anchorY",
  "rotation",
  "scaleX",
  "scaleY",
  "skewX",
  "skewY"
];
function T1(r, t) {
  for (var e = 0; e < ta.length; e++) {
    var i = ta[e];
    r[i] = t[i];
  }
}
var Tc = {};
function Qt(r, t) {
  t = t || Kr;
  var e = Tc[t];
  e || (e = Tc[t] = new pa(500));
  var i = e.get(r);
  return i == null && (i = Xi.measureText(r, t).width, e.put(r, i)), i;
}
function Cc(r, t, e, i) {
  var n = Qt(r, t), a = Ff(t), o = Mn(0, n, e), s = Ti(0, a, i), l = new it(o, s, n, a);
  return l;
}
function Bf(r, t, e, i) {
  var n = ((r || "") + "").split(`
`), a = n.length;
  if (a === 1)
    return Cc(n[0], t, e, i);
  for (var o = new it(0, 0, 0, 0), s = 0; s < n.length; s++) {
    var l = Cc(n[s], t, e, i);
    s === 0 ? o.copy(l) : o.union(l);
  }
  return o;
}
function Mn(r, t, e) {
  return e === "right" ? r -= t : e === "center" && (r -= t / 2), r;
}
function Ti(r, t, e) {
  return e === "middle" ? r -= t / 2 : e === "bottom" && (r -= t), r;
}
function Ff(r) {
  return Qt("国", r);
}
function Qr(r, t) {
  return typeof r == "string" ? r.lastIndexOf("%") >= 0 ? parseFloat(r) / 100 * t : parseFloat(r) : r;
}
function pg(r, t, e) {
  var i = t.position || "inside", n = t.distance != null ? t.distance : 5, a = e.height, o = e.width, s = a / 2, l = e.x, u = e.y, f = "left", h = "top";
  if (i instanceof Array)
    l += Qr(i[0], e.width), u += Qr(i[1], e.height), f = null, h = null;
  else
    switch (i) {
      case "left":
        l -= n, u += s, f = "right", h = "middle";
        break;
      case "right":
        l += n + o, u += s, h = "middle";
        break;
      case "top":
        l += o / 2, u -= n, f = "center", h = "bottom";
        break;
      case "bottom":
        l += o / 2, u += a + n, f = "center";
        break;
      case "inside":
        l += o / 2, u += s, f = "center", h = "middle";
        break;
      case "insideLeft":
        l += n, u += s, h = "middle";
        break;
      case "insideRight":
        l += o - n, u += s, f = "right", h = "middle";
        break;
      case "insideTop":
        l += o / 2, u += n, f = "center";
        break;
      case "insideBottom":
        l += o / 2, u += a - n, f = "center", h = "bottom";
        break;
      case "insideTopLeft":
        l += n, u += n;
        break;
      case "insideTopRight":
        l += o - n, u += n, f = "right";
        break;
      case "insideBottomLeft":
        l += n, u += a - n, h = "bottom";
        break;
      case "insideBottomRight":
        l += o - n, u += a - n, f = "right", h = "bottom";
        break;
    }
  return r = r || {}, r.x = l, r.y = u, r.align = f, r.verticalAlign = h, r;
}
var il = "__zr_normal__", nl = ta.concat(["ignore"]), C1 = Zi(ta, function(r, t) {
  return r[t] = !0, r;
}, { ignore: !1 }), fi = {}, M1 = new it(0, 0, 0, 0), as = (function() {
  function r(t) {
    this.id = Xp(), this.animators = [], this.currentStates = [], this.states = {}, this._init(t);
  }
  return r.prototype._init = function(t) {
    this.attr(t);
  }, r.prototype.drift = function(t, e, i) {
    switch (this.draggable) {
      case "horizontal":
        e = 0;
        break;
      case "vertical":
        t = 0;
        break;
    }
    var n = this.transform;
    n || (n = this.transform = [1, 0, 0, 1, 0, 0]), n[4] += t, n[5] += e, this.decomposeTransform(), this.markRedraw();
  }, r.prototype.beforeUpdate = function() {
  }, r.prototype.afterUpdate = function() {
  }, r.prototype.update = function() {
    this.updateTransform(), this.__dirty && this.updateInnerText();
  }, r.prototype.updateInnerText = function(t) {
    var e = this._textContent;
    if (e && (!e.ignore || t)) {
      this.textConfig || (this.textConfig = {});
      var i = this.textConfig, n = i.local, a = e.innerTransformable, o = void 0, s = void 0, l = !1;
      a.parent = n ? this : null;
      var u = !1;
      if (a.copyTransform(e), i.position != null) {
        var f = M1;
        i.layoutRect ? f.copy(i.layoutRect) : f.copy(this.getBoundingRect()), n || f.applyTransform(this.transform), this.calculateTextPosition ? this.calculateTextPosition(fi, i, f) : pg(fi, i, f), a.x = fi.x, a.y = fi.y, o = fi.align, s = fi.verticalAlign;
        var h = i.origin;
        if (h && i.rotation != null) {
          var v = void 0, c = void 0;
          h === "center" ? (v = f.width * 0.5, c = f.height * 0.5) : (v = Qr(h[0], f.width), c = Qr(h[1], f.height)), u = !0, a.originX = -a.x + v + (n ? 0 : f.x), a.originY = -a.y + c + (n ? 0 : f.y);
        }
      }
      i.rotation != null && (a.rotation = i.rotation);
      var d = i.offset;
      d && (a.x += d[0], a.y += d[1], u || (a.originX = -d[0], a.originY = -d[1]));
      var y = i.inside == null ? typeof i.position == "string" && i.position.indexOf("inside") >= 0 : i.inside, p = this._innerTextDefaultStyle || (this._innerTextDefaultStyle = {}), g = void 0, m = void 0, _ = void 0;
      y && this.canBeInsideText() ? (g = i.insideFill, m = i.insideStroke, (g == null || g === "auto") && (g = this.getInsideTextFill()), (m == null || m === "auto") && (m = this.getInsideTextStroke(g), _ = !0)) : (g = i.outsideFill, m = i.outsideStroke, (g == null || g === "auto") && (g = this.getOutsideFill()), (m == null || m === "auto") && (m = this.getOutsideStroke(g), _ = !0)), g = g || "#000", (g !== p.fill || m !== p.stroke || _ !== p.autoStroke || o !== p.align || s !== p.verticalAlign) && (l = !0, p.fill = g, p.stroke = m, p.autoStroke = _, p.align = o, p.verticalAlign = s, e.setDefaultTextStyle(p)), e.__dirty |= jt, l && e.dirtyStyle(!0);
    }
  }, r.prototype.canBeInsideText = function() {
    return !0;
  }, r.prototype.getInsideTextFill = function() {
    return "#fff";
  }, r.prototype.getInsideTextStroke = function(t) {
    return "#000";
  }, r.prototype.getOutsideFill = function() {
    return this.__zr && this.__zr.isDarkMode() ? Au : Du;
  }, r.prototype.getOutsideStroke = function(t) {
    var e = this.__zr && this.__zr.getBackgroundColor(), i = typeof e == "string" && ze(e);
    i || (i = [255, 255, 255, 1]);
    for (var n = i[3], a = this.__zr.isDarkMode(), o = 0; o < 3; o++)
      i[o] = i[o] * n + (a ? 0 : 255) * (1 - n);
    return i[3] = 1, ns(i, "rgba");
  }, r.prototype.traverse = function(t, e) {
  }, r.prototype.attrKV = function(t, e) {
    t === "textConfig" ? this.setTextConfig(e) : t === "textContent" ? this.setTextContent(e) : t === "clipPath" ? this.setClipPath(e) : t === "extra" ? (this.extra = this.extra || {}, k(this.extra, e)) : this[t] = e;
  }, r.prototype.hide = function() {
    this.ignore = !0, this.markRedraw();
  }, r.prototype.show = function() {
    this.ignore = !1, this.markRedraw();
  }, r.prototype.attr = function(t, e) {
    if (typeof t == "string")
      this.attrKV(t, e);
    else if (W(t))
      for (var i = t, n = pt(i), a = 0; a < n.length; a++) {
        var o = n[a];
        this.attrKV(o, t[o]);
      }
    return this.markRedraw(), this;
  }, r.prototype.saveCurrentToNormalState = function(t) {
    this._innerSaveToNormal(t);
    for (var e = this._normalState, i = 0; i < this.animators.length; i++) {
      var n = this.animators[i], a = n.__fromStateTransition;
      if (!(n.getLoop() || a && a !== il)) {
        var o = n.targetName, s = o ? e[o] : e;
        n.saveTo(s);
      }
    }
  }, r.prototype._innerSaveToNormal = function(t) {
    var e = this._normalState;
    e || (e = this._normalState = {}), t.textConfig && !e.textConfig && (e.textConfig = this.textConfig), this._savePrimaryToNormal(t, e, nl);
  }, r.prototype._savePrimaryToNormal = function(t, e, i) {
    for (var n = 0; n < i.length; n++) {
      var a = i[n];
      t[a] != null && !(a in e) && (e[a] = this[a]);
    }
  }, r.prototype.hasState = function() {
    return this.currentStates.length > 0;
  }, r.prototype.getState = function(t) {
    return this.states[t];
  }, r.prototype.ensureState = function(t) {
    var e = this.states;
    return e[t] || (e[t] = {}), e[t];
  }, r.prototype.clearStates = function(t) {
    this.useState(il, !1, t);
  }, r.prototype.useState = function(t, e, i, n) {
    var a = t === il, o = this.hasState();
    if (!(!o && a)) {
      var s = this.currentStates, l = this.stateTransition;
      if (!(rt(s, t) >= 0 && (e || s.length === 1))) {
        var u;
        if (this.stateProxy && !a && (u = this.stateProxy(t)), u || (u = this.states && this.states[t]), !u && !a) {
          Af("State " + t + " not exists.");
          return;
        }
        a || this.saveCurrentToNormalState(u);
        var f = !!(u && u.hoverLayer || n);
        f && this._toggleHoverLayerFlag(!0), this._applyStateObj(t, u, this._normalState, e, !i && !this.__inHover && l && l.duration > 0, l);
        var h = this._textContent, v = this._textGuide;
        return h && h.useState(t, e, i, f), v && v.useState(t, e, i, f), a ? (this.currentStates = [], this._normalState = {}) : e ? this.currentStates.push(t) : this.currentStates = [t], this._updateAnimationTargets(), this.markRedraw(), !f && this.__inHover && (this._toggleHoverLayerFlag(!1), this.__dirty &= ~jt), u;
      }
    }
  }, r.prototype.useStates = function(t, e, i) {
    if (!t.length)
      this.clearStates();
    else {
      var n = [], a = this.currentStates, o = t.length, s = o === a.length;
      if (s) {
        for (var l = 0; l < o; l++)
          if (t[l] !== a[l]) {
            s = !1;
            break;
          }
      }
      if (s)
        return;
      for (var l = 0; l < o; l++) {
        var u = t[l], f = void 0;
        this.stateProxy && (f = this.stateProxy(u, t)), f || (f = this.states[u]), f && n.push(f);
      }
      var h = n[o - 1], v = !!(h && h.hoverLayer || i);
      v && this._toggleHoverLayerFlag(!0);
      var c = this._mergeStates(n), d = this.stateTransition;
      this.saveCurrentToNormalState(c), this._applyStateObj(t.join(","), c, this._normalState, !1, !e && !this.__inHover && d && d.duration > 0, d);
      var y = this._textContent, p = this._textGuide;
      y && y.useStates(t, e, v), p && p.useStates(t, e, v), this._updateAnimationTargets(), this.currentStates = t.slice(), this.markRedraw(), !v && this.__inHover && (this._toggleHoverLayerFlag(!1), this.__dirty &= ~jt);
    }
  }, r.prototype.isSilent = function() {
    for (var t = this.silent, e = this.parent; !t && e; ) {
      if (e.silent) {
        t = !0;
        break;
      }
      e = e.parent;
    }
    return t;
  }, r.prototype._updateAnimationTargets = function() {
    for (var t = 0; t < this.animators.length; t++) {
      var e = this.animators[t];
      e.targetName && e.changeTarget(this[e.targetName]);
    }
  }, r.prototype.removeState = function(t) {
    var e = rt(this.currentStates, t);
    if (e >= 0) {
      var i = this.currentStates.slice();
      i.splice(e, 1), this.useStates(i);
    }
  }, r.prototype.replaceState = function(t, e, i) {
    var n = this.currentStates.slice(), a = rt(n, t), o = rt(n, e) >= 0;
    a >= 0 ? o ? n.splice(a, 1) : n[a] = e : i && !o && n.push(e), this.useStates(n);
  }, r.prototype.toggleState = function(t, e) {
    e ? this.useState(t, !0) : this.removeState(t);
  }, r.prototype._mergeStates = function(t) {
    for (var e = {}, i, n = 0; n < t.length; n++) {
      var a = t[n];
      k(e, a), a.textConfig && (i = i || {}, k(i, a.textConfig));
    }
    return i && (e.textConfig = i), e;
  }, r.prototype._applyStateObj = function(t, e, i, n, a, o) {
    var s = !(e && n);
    e && e.textConfig ? (this.textConfig = k({}, n ? this.textConfig : i.textConfig), k(this.textConfig, e.textConfig)) : s && i.textConfig && (this.textConfig = i.textConfig);
    for (var l = {}, u = !1, f = 0; f < nl.length; f++) {
      var h = nl[f], v = a && C1[h];
      e && e[h] != null ? v ? (u = !0, l[h] = e[h]) : this[h] = e[h] : s && i[h] != null && (v ? (u = !0, l[h] = i[h]) : this[h] = i[h]);
    }
    if (!a)
      for (var f = 0; f < this.animators.length; f++) {
        var c = this.animators[f], d = c.targetName;
        c.getLoop() || c.__changeFinalValue(d ? (e || i)[d] : e || i);
      }
    u && this._transitionState(t, l, o);
  }, r.prototype._attachComponent = function(t) {
    if (!(t.__zr && !t.__hostTarget) && t !== this) {
      var e = this.__zr;
      e && t.addSelfToZr(e), t.__zr = e, t.__hostTarget = this;
    }
  }, r.prototype._detachComponent = function(t) {
    t.__zr && t.removeSelfFromZr(t.__zr), t.__zr = null, t.__hostTarget = null;
  }, r.prototype.getClipPath = function() {
    return this._clipPath;
  }, r.prototype.setClipPath = function(t) {
    this._clipPath && this._clipPath !== t && this.removeClipPath(), this._attachComponent(t), this._clipPath = t, this.markRedraw();
  }, r.prototype.removeClipPath = function() {
    var t = this._clipPath;
    t && (this._detachComponent(t), this._clipPath = null, this.markRedraw());
  }, r.prototype.getTextContent = function() {
    return this._textContent;
  }, r.prototype.setTextContent = function(t) {
    var e = this._textContent;
    e !== t && (e && e !== t && this.removeTextContent(), t.innerTransformable = new Nf(), this._attachComponent(t), this._textContent = t, this.markRedraw());
  }, r.prototype.setTextConfig = function(t) {
    this.textConfig || (this.textConfig = {}), k(this.textConfig, t), this.markRedraw();
  }, r.prototype.removeTextConfig = function() {
    this.textConfig = null, this.markRedraw();
  }, r.prototype.removeTextContent = function() {
    var t = this._textContent;
    t && (t.innerTransformable = null, this._detachComponent(t), this._textContent = null, this._innerTextDefaultStyle = null, this.markRedraw());
  }, r.prototype.getTextGuideLine = function() {
    return this._textGuide;
  }, r.prototype.setTextGuideLine = function(t) {
    this._textGuide && this._textGuide !== t && this.removeTextGuideLine(), this._attachComponent(t), this._textGuide = t, this.markRedraw();
  }, r.prototype.removeTextGuideLine = function() {
    var t = this._textGuide;
    t && (this._detachComponent(t), this._textGuide = null, this.markRedraw());
  }, r.prototype.markRedraw = function() {
    this.__dirty |= jt;
    var t = this.__zr;
    t && (this.__inHover ? t.refreshHover() : t.refresh()), this.__hostTarget && this.__hostTarget.markRedraw();
  }, r.prototype.dirty = function() {
    this.markRedraw();
  }, r.prototype._toggleHoverLayerFlag = function(t) {
    this.__inHover = t;
    var e = this._textContent, i = this._textGuide;
    e && (e.__inHover = t), i && (i.__inHover = t);
  }, r.prototype.addSelfToZr = function(t) {
    if (this.__zr !== t) {
      this.__zr = t;
      var e = this.animators;
      if (e)
        for (var i = 0; i < e.length; i++)
          t.animation.addAnimator(e[i]);
      this._clipPath && this._clipPath.addSelfToZr(t), this._textContent && this._textContent.addSelfToZr(t), this._textGuide && this._textGuide.addSelfToZr(t);
    }
  }, r.prototype.removeSelfFromZr = function(t) {
    if (this.__zr) {
      this.__zr = null;
      var e = this.animators;
      if (e)
        for (var i = 0; i < e.length; i++)
          t.animation.removeAnimator(e[i]);
      this._clipPath && this._clipPath.removeSelfFromZr(t), this._textContent && this._textContent.removeSelfFromZr(t), this._textGuide && this._textGuide.removeSelfFromZr(t);
    }
  }, r.prototype.animate = function(t, e, i) {
    var n = t ? this[t] : this, a = new Of(n, e, i);
    return t && (a.targetName = t), this.addAnimator(a, t), a;
  }, r.prototype.addAnimator = function(t, e) {
    var i = this.__zr, n = this;
    t.during(function() {
      n.updateDuringAnimation(e);
    }).done(function() {
      var a = n.animators, o = rt(a, t);
      o >= 0 && a.splice(o, 1);
    }), this.animators.push(t), i && i.animation.addAnimator(t), i && i.wakeUp();
  }, r.prototype.updateDuringAnimation = function(t) {
    this.markRedraw();
  }, r.prototype.stopAnimation = function(t, e) {
    for (var i = this.animators, n = i.length, a = [], o = 0; o < n; o++) {
      var s = i[o];
      !t || t === s.scope ? s.stop(e) : a.push(s);
    }
    return this.animators = a, this;
  }, r.prototype.animateTo = function(t, e, i) {
    al(this, t, e, i);
  }, r.prototype.animateFrom = function(t, e, i) {
    al(this, t, e, i, !0);
  }, r.prototype._transitionState = function(t, e, i, n) {
    for (var a = al(this, e, i, n), o = 0; o < a.length; o++)
      a[o].__fromStateTransition = t;
  }, r.prototype.getBoundingRect = function() {
    return null;
  }, r.prototype.getPaintRect = function() {
    return null;
  }, r.initDefaultProps = (function() {
    var t = r.prototype;
    t.type = "element", t.name = "", t.ignore = t.silent = t.isGroup = t.draggable = t.dragging = t.ignoreClip = t.__inHover = !1, t.__dirty = jt;
    function e(i, n, a, o) {
      Object.defineProperty(t, i, {
        get: function() {
          if (!this[n]) {
            var l = this[n] = [];
            s(this, l);
          }
          return this[n];
        },
        set: function(l) {
          this[a] = l[0], this[o] = l[1], this[n] = l, s(this, l);
        }
      });
      function s(l, u) {
        Object.defineProperty(u, 0, {
          get: function() {
            return l[a];
          },
          set: function(f) {
            l[a] = f;
          }
        }), Object.defineProperty(u, 1, {
          get: function() {
            return l[o];
          },
          set: function(f) {
            l[o] = f;
          }
        });
      }
    }
    Object.defineProperty && (e("position", "_legacyPos", "x", "y"), e("scale", "_legacyScale", "scaleX", "scaleY"), e("origin", "_legacyOrigin", "originX", "originY"));
  })(), r;
})();
_e(as, Ie);
_e(as, Nf);
function al(r, t, e, i, n) {
  e = e || {};
  var a = [];
  gg(r, "", r, t, e, i, a, n);
  var o = a.length, s = !1, l = e.done, u = e.aborted, f = function() {
    s = !0, o--, o <= 0 && (s ? l && l() : u && u());
  }, h = function() {
    o--, o <= 0 && (s ? l && l() : u && u());
  };
  o || l && l(), a.length > 0 && e.during && a[0].during(function(d, y) {
    e.during(y);
  });
  for (var v = 0; v < a.length; v++) {
    var c = a[v];
    f && c.done(f), h && c.aborted(h), e.force && c.duration(e.duration), c.start(e.easing);
  }
  return a;
}
function ol(r, t, e) {
  for (var i = 0; i < e; i++)
    r[i] = t[i];
}
function D1(r) {
  return Yt(r[0]);
}
function A1(r, t, e) {
  if (Yt(t[e]))
    if (Yt(r[e]) || (r[e] = []), Xt(t[e])) {
      var i = t[e].length;
      r[e].length !== i && (r[e] = new t[e].constructor(i), ol(r[e], t[e], i));
    } else {
      var n = t[e], a = r[e], o = n.length;
      if (D1(n))
        for (var s = n[0].length, l = 0; l < o; l++)
          a[l] ? ol(a[l], n[l], s) : a[l] = Array.prototype.slice.call(n[l]);
      else
        ol(a, n, o);
      a.length = n.length;
    }
  else
    r[e] = t[e];
}
function L1(r, t) {
  return r === t || Yt(r) && Yt(t) && P1(r, t);
}
function P1(r, t) {
  var e = r.length;
  if (e !== t.length)
    return !1;
  for (var i = 0; i < e; i++)
    if (r[i] !== t[i])
      return !1;
  return !0;
}
function gg(r, t, e, i, n, a, o, s) {
  for (var l = pt(i), u = n.duration, f = n.delay, h = n.additive, v = n.setToFinal, c = !W(a), d = r.animators, y = [], p = 0; p < l.length; p++) {
    var g = l[p], m = i[g];
    if (m != null && e[g] != null && (c || a[g]))
      if (W(m) && !Yt(m) && !rs(m)) {
        if (t) {
          s || (e[g] = m, r.updateDuringAnimation(t));
          continue;
        }
        gg(r, g, e[g], m, n, a && a[g], o, s);
      } else
        y.push(g);
    else s || (e[g] = m, r.updateDuringAnimation(t), y.push(g));
  }
  var _ = y.length;
  if (!h && _)
    for (var S = 0; S < d.length; S++) {
      var w = d[S];
      if (w.targetName === t) {
        var b = w.stopTracks(y);
        if (b) {
          var x = rt(d, w);
          d.splice(x, 1);
        }
      }
    }
  if (n.force || (y = xt(y, function(M) {
    return !L1(i[M], e[M]);
  }), _ = y.length), _ > 0 || n.force && !o.length) {
    var D = void 0, T = void 0, C = void 0;
    if (s) {
      T = {}, v && (D = {});
      for (var S = 0; S < _; S++) {
        var g = y[S];
        T[g] = e[g], v ? D[g] = i[g] : e[g] = i[g];
      }
    } else if (v) {
      C = {};
      for (var S = 0; S < _; S++) {
        var g = y[S];
        C[g] = po(e[g]), A1(e, i, g);
      }
    }
    var w = new Of(e, !1, !1, h ? xt(d, function(L) {
      return L.targetName === t;
    }) : null);
    w.targetName = t, n.scope && (w.scope = n.scope), v && D && w.whenWithKeys(0, D, y), C && w.whenWithKeys(0, C, y), w.whenWithKeys(u ?? 500, s ? T : i, y).delay(f || 0), r.addAnimator(w, t), o.push(w);
  }
}
var Dt = (function(r) {
  O(t, r);
  function t(e) {
    var i = r.call(this) || this;
    return i.isGroup = !0, i._children = [], i.attr(e), i;
  }
  return t.prototype.childrenRef = function() {
    return this._children;
  }, t.prototype.children = function() {
    return this._children.slice();
  }, t.prototype.childAt = function(e) {
    return this._children[e];
  }, t.prototype.childOfName = function(e) {
    for (var i = this._children, n = 0; n < i.length; n++)
      if (i[n].name === e)
        return i[n];
  }, t.prototype.childCount = function() {
    return this._children.length;
  }, t.prototype.add = function(e) {
    return e && e !== this && e.parent !== this && (this._children.push(e), this._doAdd(e)), this;
  }, t.prototype.addBefore = function(e, i) {
    if (e && e !== this && e.parent !== this && i && i.parent === this) {
      var n = this._children, a = n.indexOf(i);
      a >= 0 && (n.splice(a, 0, e), this._doAdd(e));
    }
    return this;
  }, t.prototype.replace = function(e, i) {
    var n = rt(this._children, e);
    return n >= 0 && this.replaceAt(i, n), this;
  }, t.prototype.replaceAt = function(e, i) {
    var n = this._children, a = n[i];
    if (e && e !== this && e.parent !== this && e !== a) {
      n[i] = e, a.parent = null;
      var o = this.__zr;
      o && a.removeSelfFromZr(o), this._doAdd(e);
    }
    return this;
  }, t.prototype._doAdd = function(e) {
    e.parent && e.parent.remove(e), e.parent = this;
    var i = this.__zr;
    i && i !== e.__zr && e.addSelfToZr(i), i && i.refresh();
  }, t.prototype.remove = function(e) {
    var i = this.__zr, n = this._children, a = rt(n, e);
    return a < 0 ? this : (n.splice(a, 1), e.parent = null, i && e.removeSelfFromZr(i), i && i.refresh(), this);
  }, t.prototype.removeAll = function() {
    for (var e = this._children, i = this.__zr, n = 0; n < e.length; n++) {
      var a = e[n];
      i && a.removeSelfFromZr(i), a.parent = null;
    }
    return e.length = 0, this;
  }, t.prototype.eachChild = function(e, i) {
    for (var n = this._children, a = 0; a < n.length; a++) {
      var o = n[a];
      e.call(i, o, a);
    }
    return this;
  }, t.prototype.traverse = function(e, i) {
    for (var n = 0; n < this._children.length; n++) {
      var a = this._children[n], o = e.call(i, a);
      a.isGroup && !o && a.traverse(e, i);
    }
    return this;
  }, t.prototype.addSelfToZr = function(e) {
    r.prototype.addSelfToZr.call(this, e);
    for (var i = 0; i < this._children.length; i++) {
      var n = this._children[i];
      n.addSelfToZr(e);
    }
  }, t.prototype.removeSelfFromZr = function(e) {
    r.prototype.removeSelfFromZr.call(this, e);
    for (var i = 0; i < this._children.length; i++) {
      var n = this._children[i];
      n.removeSelfFromZr(e);
    }
  }, t.prototype.getBoundingRect = function(e) {
    for (var i = new it(0, 0, 0, 0), n = e || this._children, a = [], o = null, s = 0; s < n.length; s++) {
      var l = n[s];
      if (!(l.ignore || l.invisible)) {
        var u = l.getBoundingRect(), f = l.getLocalTransform(a);
        f ? (it.applyTransform(i, u, f), o = o || i.clone(), o.union(i)) : (o = o || u.clone(), o.union(u));
      }
    }
    return o || i;
  }, t;
})(as);
Dt.prototype.type = "group";
/*!
* ZRender, a high performance 2d drawing library.
*
* Copyright (c) 2013, Baidu Inc.
* All rights reserved.
*
* LICENSE
* https://github.com/ecomfe/zrender/blob/master/LICENSE.txt
*/
var _o = {}, yg = {};
function I1(r) {
  delete yg[r];
}
function E1(r) {
  if (!r)
    return !1;
  if (typeof r == "string")
    return ko(r, 1) < Mu;
  if (r.colorStops) {
    for (var t = r.colorStops, e = 0, i = t.length, n = 0; n < i; n++)
      e += ko(t[n].color, 1);
    return e /= i, e < Mu;
  }
  return !1;
}
var R1 = (function() {
  function r(t, e, i) {
    var n = this;
    this._sleepAfterStill = 10, this._stillFrameAccum = 0, this._needsRefresh = !0, this._needsRefreshHover = !0, this._darkMode = !1, i = i || {}, this.dom = e, this.id = t;
    var a = new Q0(), o = i.renderer || "canvas";
    _o[o] || (o = pt(_o)[0]), i.useDirtyRect = i.useDirtyRect == null ? !1 : i.useDirtyRect;
    var s = new _o[o](e, a, i, t), l = i.ssr || s.ssrOnly;
    this.storage = a, this.painter = s;
    var u = !U.node && !U.worker && !l ? new w1(s.getViewportRoot(), s.root) : null, f = i.useCoarsePointer, h = f == null || f === "auto" ? U.touchEventsSupported : !!f, v = 44, c;
    h && (c = X(i.pointerSize, v)), this.handler = new rg(a, s, u, s.root, c), this.animation = new p1({
      stage: {
        update: l ? null : function() {
          return n._flush(!0);
        }
      }
    }), l || this.animation.start();
  }
  return r.prototype.add = function(t) {
    this._disposed || !t || (this.storage.addRoot(t), t.addSelfToZr(this), this.refresh());
  }, r.prototype.remove = function(t) {
    this._disposed || !t || (this.storage.delRoot(t), t.removeSelfFromZr(this), this.refresh());
  }, r.prototype.configLayer = function(t, e) {
    this._disposed || (this.painter.configLayer && this.painter.configLayer(t, e), this.refresh());
  }, r.prototype.setBackgroundColor = function(t) {
    this._disposed || (this.painter.setBackgroundColor && this.painter.setBackgroundColor(t), this.refresh(), this._backgroundColor = t, this._darkMode = E1(t));
  }, r.prototype.getBackgroundColor = function() {
    return this._backgroundColor;
  }, r.prototype.setDarkMode = function(t) {
    this._darkMode = t;
  }, r.prototype.isDarkMode = function() {
    return this._darkMode;
  }, r.prototype.refreshImmediately = function(t) {
    this._disposed || (t || this.animation.update(!0), this._needsRefresh = !1, this.painter.refresh(), this._needsRefresh = !1);
  }, r.prototype.refresh = function() {
    this._disposed || (this._needsRefresh = !0, this.animation.start());
  }, r.prototype.flush = function() {
    this._disposed || this._flush(!1);
  }, r.prototype._flush = function(t) {
    var e, i = Di();
    this._needsRefresh && (e = !0, this.refreshImmediately(t)), this._needsRefreshHover && (e = !0, this.refreshHoverImmediately());
    var n = Di();
    e ? (this._stillFrameAccum = 0, this.trigger("rendered", {
      elapsedTime: n - i
    })) : this._sleepAfterStill > 0 && (this._stillFrameAccum++, this._stillFrameAccum > this._sleepAfterStill && this.animation.stop());
  }, r.prototype.setSleepAfterStill = function(t) {
    this._sleepAfterStill = t;
  }, r.prototype.wakeUp = function() {
    this._disposed || (this.animation.start(), this._stillFrameAccum = 0);
  }, r.prototype.refreshHover = function() {
    this._needsRefreshHover = !0;
  }, r.prototype.refreshHoverImmediately = function() {
    this._disposed || (this._needsRefreshHover = !1, this.painter.refreshHover && this.painter.getType() === "canvas" && this.painter.refreshHover());
  }, r.prototype.resize = function(t) {
    this._disposed || (t = t || {}, this.painter.resize(t.width, t.height), this.handler.resize());
  }, r.prototype.clearAnimation = function() {
    this._disposed || this.animation.clear();
  }, r.prototype.getWidth = function() {
    if (!this._disposed)
      return this.painter.getWidth();
  }, r.prototype.getHeight = function() {
    if (!this._disposed)
      return this.painter.getHeight();
  }, r.prototype.setCursorStyle = function(t) {
    this._disposed || this.handler.setCursorStyle(t);
  }, r.prototype.findHover = function(t, e) {
    if (!this._disposed)
      return this.handler.findHover(t, e);
  }, r.prototype.on = function(t, e, i) {
    return this._disposed || this.handler.on(t, e, i), this;
  }, r.prototype.off = function(t, e) {
    this._disposed || this.handler.off(t, e);
  }, r.prototype.trigger = function(t, e) {
    this._disposed || this.handler.trigger(t, e);
  }, r.prototype.clear = function() {
    if (!this._disposed) {
      for (var t = this.storage.getRoots(), e = 0; e < t.length; e++)
        t[e] instanceof Dt && t[e].removeSelfFromZr(this);
      this.storage.delAllRoots(), this.painter.clear();
    }
  }, r.prototype.dispose = function() {
    this._disposed || (this.animation.stop(), this.clear(), this.storage.dispose(), this.painter.dispose(), this.handler.dispose(), this.animation = this.storage = this.painter = this.handler = null, this._disposed = !0, I1(this.id));
  }, r;
})();
function Mc(r, t) {
  var e = new R1(Xp(), r, t);
  return yg[e.id] = e, e;
}
function k1(r, t) {
  _o[r] = t;
}
var Dc = 1e-4, mg = 20;
function O1(r) {
  return r.replace(/^\s+|\s+$/g, "");
}
function Ac(r, t, e, i) {
  var n = t[0], a = t[1], o = e[0], s = e[1], l = a - n, u = s - o;
  if (l === 0)
    return u === 0 ? o : (o + s) / 2;
  if (i)
    if (l > 0) {
      if (r <= n)
        return o;
      if (r >= a)
        return s;
    } else {
      if (r >= n)
        return o;
      if (r <= a)
        return s;
    }
  else {
    if (r === n)
      return o;
    if (r === a)
      return s;
  }
  return (r - n) / l * u + o;
}
function Tt(r, t) {
  switch (r) {
    case "center":
    case "middle":
      r = "50%";
      break;
    case "left":
    case "top":
      r = "0%";
      break;
    case "right":
    case "bottom":
      r = "100%";
      break;
  }
  return z(r) ? O1(r).match(/%$/) ? parseFloat(r) / 100 * t : parseFloat(r) : r == null ? NaN : +r;
}
function wt(r, t, e) {
  return t == null && (t = 10), t = Math.min(Math.max(0, t), mg), r = (+r).toFixed(t), e ? r : +r;
}
function De(r) {
  if (r = +r, isNaN(r))
    return 0;
  if (r > 1e-14) {
    for (var t = 1, e = 0; e < 15; e++, t *= 10)
      if (Math.round(r * t) / t === r)
        return e;
  }
  return N1(r);
}
function N1(r) {
  var t = r.toString().toLowerCase(), e = t.indexOf("e"), i = e > 0 ? +t.slice(e + 1) : 0, n = e > 0 ? e : t.length, a = t.indexOf("."), o = a < 0 ? 0 : n - 1 - a;
  return Math.max(0, o - i);
}
function B1(r, t) {
  var e = Math.log, i = Math.LN10, n = Math.floor(e(r[1] - r[0]) / i), a = Math.round(e(Math.abs(t[1] - t[0])) / i), o = Math.min(Math.max(-n + a, 0), 20);
  return isFinite(o) ? o : 20;
}
function F1(r, t) {
  var e = Math.max(De(r), De(t)), i = r + t;
  return e > mg ? i : wt(i, e);
}
function _g(r) {
  var t = Math.PI * 2;
  return (r % t + t) % t;
}
function No(r) {
  return r > -Dc && r < Dc;
}
var z1 = /^(?:(\d{4})(?:[-\/](\d{1,2})(?:[-\/](\d{1,2})(?:[T ](\d{1,2})(?::(\d{1,2})(?::(\d{1,2})(?:[.,](\d+))?)?)?(Z|[\+\-]\d\d:?\d\d)?)?)?)?)?$/;
function Ve(r) {
  if (r instanceof Date)
    return r;
  if (z(r)) {
    var t = z1.exec(r);
    if (!t)
      return /* @__PURE__ */ new Date(NaN);
    if (t[8]) {
      var e = +t[4] || 0;
      return t[8].toUpperCase() !== "Z" && (e -= +t[8].slice(0, 3)), new Date(Date.UTC(+t[1], +(t[2] || 1) - 1, +t[3] || 1, e, +(t[5] || 0), +t[6] || 0, t[7] ? +t[7].substring(0, 3) : 0));
    } else
      return new Date(+t[1], +(t[2] || 1) - 1, +t[3] || 1, +t[4] || 0, +(t[5] || 0), +t[6] || 0, t[7] ? +t[7].substring(0, 3) : 0);
  } else if (r == null)
    return /* @__PURE__ */ new Date(NaN);
  return new Date(Math.round(r));
}
function H1(r) {
  return Math.pow(10, zf(r));
}
function zf(r) {
  if (r === 0)
    return 0;
  var t = Math.floor(Math.log(r) / Math.LN10);
  return r / Math.pow(10, t) >= 10 && t++, t;
}
function Sg(r, t) {
  var e = zf(r), i = Math.pow(10, e), n = r / i, a;
  return n < 1.5 ? a = 1 : n < 2.5 ? a = 2 : n < 4 ? a = 3 : n < 7 ? a = 5 : a = 10, r = a * i, e >= -20 ? +r.toFixed(e < 0 ? -e : 0) : r;
}
function Bo(r) {
  var t = parseFloat(r);
  return t == r && (t !== 0 || !z(r) || r.indexOf("x") <= 0) ? t : NaN;
}
function $1(r) {
  return !isNaN(Bo(r));
}
function bg() {
  return Math.round(Math.random() * 9);
}
function wg(r, t) {
  return t === 0 ? r : wg(t, r % t);
}
function Lc(r, t) {
  return r == null ? t : t == null ? r : r * t / wg(r, t);
}
function Gt(r) {
  throw new Error(r);
}
function Pc(r, t, e) {
  return (t - r) * e + r;
}
var xg = "series\0", V1 = "\0_ec_\0";
function Ot(r) {
  return r instanceof Array ? r : r == null ? [] : [r];
}
function Lu(r, t, e) {
  if (r) {
    r[t] = r[t] || {}, r.emphasis = r.emphasis || {}, r.emphasis[t] = r.emphasis[t] || {};
    for (var i = 0, n = e.length; i < n; i++) {
      var a = e[i];
      !r.emphasis[t].hasOwnProperty(a) && r[t].hasOwnProperty(a) && (r.emphasis[t][a] = r[t][a]);
    }
  }
}
var Ic = ["fontStyle", "fontWeight", "fontSize", "fontFamily", "rich", "tag", "color", "textBorderColor", "textBorderWidth", "width", "height", "lineHeight", "align", "verticalAlign", "baseline", "shadowColor", "shadowBlur", "shadowOffsetX", "shadowOffsetY", "textShadowColor", "textShadowBlur", "textShadowOffsetX", "textShadowOffsetY", "backgroundColor", "borderColor", "borderWidth", "borderRadius", "padding"];
function ga(r) {
  return W(r) && !N(r) && !(r instanceof Date) ? r.value : r;
}
function G1(r) {
  return W(r) && !(r instanceof Array);
}
function W1(r, t, e) {
  var i = e === "normalMerge", n = e === "replaceMerge", a = e === "replaceAll";
  r = r || [], t = (t || []).slice();
  var o = Z();
  A(t, function(l, u) {
    if (!W(l)) {
      t[u] = null;
      return;
    }
  });
  var s = U1(r, o, e);
  return (i || n) && Y1(s, r, o, t), i && X1(s, t), i || n ? Z1(s, t, n) : a && q1(s, t), K1(s), s;
}
function U1(r, t, e) {
  var i = [];
  if (e === "replaceAll")
    return i;
  for (var n = 0; n < r.length; n++) {
    var a = r[n];
    a && a.id != null && t.set(a.id, n), i.push({
      existing: e === "replaceMerge" || ea(a) ? null : a,
      newOption: null,
      keyInfo: null,
      brandNew: null
    });
  }
  return i;
}
function Y1(r, t, e, i) {
  A(i, function(n, a) {
    if (!(!n || n.id == null)) {
      var o = Bn(n.id), s = e.get(o);
      if (s != null) {
        var l = r[s];
        $e(!l.newOption, 'Duplicated option on id "' + o + '".'), l.newOption = n, l.existing = t[s], i[a] = null;
      }
    }
  });
}
function X1(r, t) {
  A(t, function(e, i) {
    if (!(!e || e.name == null))
      for (var n = 0; n < r.length; n++) {
        var a = r[n].existing;
        if (!r[n].newOption && a && (a.id == null || e.id == null) && !ea(e) && !ea(a) && Tg("name", a, e)) {
          r[n].newOption = e, t[i] = null;
          return;
        }
      }
  });
}
function Z1(r, t, e) {
  A(t, function(i) {
    if (i) {
      for (
        var n, a = 0;
        // Be `!resultItem` only when `nextIdx >= result.length`.
        (n = r[a]) && (n.newOption || ea(n.existing) || // In mode "replaceMerge", here no not-mapped-non-internal-existing.
        n.existing && i.id != null && !Tg("id", i, n.existing));
      )
        a++;
      n ? (n.newOption = i, n.brandNew = e) : r.push({
        newOption: i,
        brandNew: e,
        existing: null,
        keyInfo: null
      }), a++;
    }
  });
}
function q1(r, t) {
  A(t, function(e) {
    r.push({
      newOption: e,
      brandNew: !0,
      existing: null,
      keyInfo: null
    });
  });
}
function K1(r) {
  var t = Z();
  A(r, function(e) {
    var i = e.existing;
    i && t.set(i.id, e);
  }), A(r, function(e) {
    var i = e.newOption;
    $e(!i || i.id == null || !t.get(i.id) || t.get(i.id) === e, "id duplicates: " + (i && i.id)), i && i.id != null && t.set(i.id, e), !e.keyInfo && (e.keyInfo = {});
  }), A(r, function(e, i) {
    var n = e.existing, a = e.newOption, o = e.keyInfo;
    if (W(a)) {
      if (o.name = a.name != null ? Bn(a.name) : n ? n.name : xg + i, n)
        o.id = Bn(n.id);
      else if (a.id != null)
        o.id = Bn(a.id);
      else {
        var s = 0;
        do
          o.id = "\0" + o.name + "\0" + s++;
        while (t.get(o.id));
      }
      t.set(o.id, e);
    }
  });
}
function Tg(r, t, e) {
  var i = Le(t[r], null), n = Le(e[r], null);
  return i != null && n != null && i === n;
}
function Bn(r) {
  return Le(r, "");
}
function Le(r, t) {
  return r == null ? t : z(r) ? r : vt(r) || cu(r) ? r + "" : t;
}
function Hf(r) {
  var t = r.name;
  return !!(t && t.indexOf(xg));
}
function ea(r) {
  return r && r.id != null && Bn(r.id).indexOf(V1) === 0;
}
function j1(r, t, e) {
  A(r, function(i) {
    var n = i.newOption;
    W(n) && (i.keyInfo.mainType = t, i.keyInfo.subType = Q1(t, n, i.existing, e));
  });
}
function Q1(r, t, e, i) {
  var n = t.type ? t.type : e ? e.subType : i.determineSubType(r, t);
  return n;
}
function Jr(r, t) {
  if (t.dataIndexInside != null)
    return t.dataIndexInside;
  if (t.dataIndex != null)
    return N(t.dataIndex) ? H(t.dataIndex, function(e) {
      return r.indexOfRawIndex(e);
    }) : r.indexOfRawIndex(t.dataIndex);
  if (t.name != null)
    return N(t.name) ? H(t.name, function(e) {
      return r.indexOfName(e);
    }) : r.indexOfName(t.name);
}
function mt() {
  var r = "__ec_inner_" + J1++;
  return function(t) {
    return t[r] || (t[r] = {});
  };
}
var J1 = bg();
function sl(r, t, e) {
  var i = $f(t, e), n = i.mainTypeSpecified, a = i.queryOptionMap, o = i.others, s = o, l = e ? e.defaultMainType : null;
  return !n && l && a.set(l, {}), a.each(function(u, f) {
    var h = ya(r, f, u, {
      useDefault: l === f,
      enableAll: e && e.enableAll != null ? e.enableAll : !0,
      enableNone: e && e.enableNone != null ? e.enableNone : !0
    });
    s[f + "Models"] = h.models, s[f + "Model"] = h.models[0];
  }), s;
}
function $f(r, t) {
  var e;
  if (z(r)) {
    var i = {};
    i[r + "Index"] = 0, e = i;
  } else
    e = r;
  var n = Z(), a = {}, o = !1;
  return A(e, function(s, l) {
    if (l === "dataIndex" || l === "dataIndexInside") {
      a[l] = s;
      return;
    }
    var u = l.match(/^(\w+)(Index|Id|Name)$/) || [], f = u[1], h = (u[2] || "").toLowerCase();
    if (!(!f || !h || t && t.includeMainTypes && rt(t.includeMainTypes, f) < 0)) {
      o = o || !!f;
      var v = n.get(f) || n.set(f, {});
      v[h] = s;
    }
  }), {
    mainTypeSpecified: o,
    queryOptionMap: n,
    others: a
  };
}
var ye = {
  useDefault: !0,
  enableAll: !1,
  enableNone: !1
};
function ya(r, t, e, i) {
  i = i || ye;
  var n = e.index, a = e.id, o = e.name, s = {
    models: null,
    specified: n != null || a != null || o != null
  };
  if (!s.specified) {
    var l = void 0;
    return s.models = i.useDefault && (l = r.getComponent(t)) ? [l] : [], s;
  }
  return n === "none" || n === !1 ? ($e(i.enableNone, '`"none"` or `false` is not a valid value on index option.'), s.models = [], s) : (n === "all" && ($e(i.enableAll, '`"all"` is not a valid value on index option.'), n = a = o = null), s.models = r.queryComponents({
    mainType: t,
    index: n,
    id: a,
    name: o
  }), s);
}
function Cg(r, t, e) {
  r.setAttribute ? r.setAttribute(t, e) : r[t] = e;
}
function tS(r, t) {
  return r.getAttribute ? r.getAttribute(t) : r[t];
}
function eS(r) {
  return r === "auto" ? U.domSupported ? "html" : "richText" : r || "html";
}
function rS(r, t, e, i, n) {
  var a = t == null || t === "auto";
  if (i == null)
    return i;
  if (vt(i)) {
    var o = Pc(e || 0, i, n);
    return wt(o, a ? Math.max(De(e || 0), De(i)) : t);
  } else {
    if (z(i))
      return n < 1 ? e : i;
    for (var s = [], l = e, u = i, f = Math.max(l ? l.length : 0, u.length), h = 0; h < f; ++h) {
      var v = r.getDimensionInfo(h);
      if (v && v.type === "ordinal")
        s[h] = (n < 1 && l ? l : u)[h];
      else {
        var c = l && l[h] ? l[h] : 0, d = u[h], o = Pc(c, d, n);
        s[h] = wt(o, a ? Math.max(De(c), De(d)) : t);
      }
    }
    return s;
  }
}
var iS = ".", Tr = "___EC__COMPONENT__CONTAINER___", Mg = "___EC__EXTENDED_CLASS___";
function Ae(r) {
  var t = {
    main: "",
    sub: ""
  };
  if (r) {
    var e = r.split(iS);
    t.main = e[0] || "", t.sub = e[1] || "";
  }
  return t;
}
function nS(r) {
  $e(/^[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)?$/.test(r), 'componentType "' + r + '" illegal');
}
function aS(r) {
  return !!(r && r[Mg]);
}
function Vf(r, t) {
  r.$constructor = r, r.extend = function(e) {
    var i = this, n;
    return oS(i) ? n = /** @class */
    (function(a) {
      O(o, a);
      function o() {
        return a.apply(this, arguments) || this;
      }
      return o;
    })(i) : (n = function() {
      (e.$constructor || i).apply(this, arguments);
    }, p0(n, this)), k(n.prototype, e), n[Mg] = !0, n.extend = this.extend, n.superCall = uS, n.superApply = fS, n.superClass = i, n;
  };
}
function oS(r) {
  return G(r) && /^class\s/.test(Function.prototype.toString.call(r));
}
function Dg(r, t) {
  r.extend = t.extend;
}
var sS = Math.round(Math.random() * 10);
function lS(r) {
  var t = ["__\0is_clz", sS++].join("_");
  r.prototype[t] = !0, r.isInstance = function(e) {
    return !!(e && e[t]);
  };
}
function uS(r, t) {
  for (var e = [], i = 2; i < arguments.length; i++)
    e[i - 2] = arguments[i];
  return this.superClass.prototype[t].apply(r, e);
}
function fS(r, t, e) {
  return this.superClass.prototype[t].apply(r, e);
}
function os(r) {
  var t = {};
  r.registerClass = function(i) {
    var n = i.type || i.prototype.type;
    if (n) {
      nS(n), i.prototype.type = n;
      var a = Ae(n);
      if (!a.sub)
        t[a.main] = i;
      else if (a.sub !== Tr) {
        var o = e(a);
        o[a.sub] = i;
      }
    }
    return i;
  }, r.getClass = function(i, n, a) {
    var o = t[i];
    if (o && o[Tr] && (o = n ? o[n] : null), a && !o)
      throw new Error(n ? "Component " + i + "." + (n || "") + " is used but not imported." : i + ".type should be specified.");
    return o;
  }, r.getClassesByMainType = function(i) {
    var n = Ae(i), a = [], o = t[n.main];
    return o && o[Tr] ? A(o, function(s, l) {
      l !== Tr && a.push(s);
    }) : a.push(o), a;
  }, r.hasClass = function(i) {
    var n = Ae(i);
    return !!t[n.main];
  }, r.getAllClassMainTypes = function() {
    var i = [];
    return A(t, function(n, a) {
      i.push(a);
    }), i;
  }, r.hasSubTypes = function(i) {
    var n = Ae(i), a = t[n.main];
    return a && a[Tr];
  };
  function e(i) {
    var n = t[i.main];
    return (!n || !n[Tr]) && (n = t[i.main] = {}, n[Tr] = !0), n;
  }
}
function ra(r, t) {
  for (var e = 0; e < r.length; e++)
    r[e][1] || (r[e][1] = r[e][0]);
  return t = t || !1, function(i, n, a) {
    for (var o = {}, s = 0; s < r.length; s++) {
      var l = r[s][1];
      if (!(n && rt(n, l) >= 0 || a && rt(a, l) < 0)) {
        var u = i.getShallow(l, t);
        u != null && (o[r[s][0]] = u);
      }
    }
    return o;
  };
}
var hS = [
  ["fill", "color"],
  ["shadowBlur"],
  ["shadowOffsetX"],
  ["shadowOffsetY"],
  ["opacity"],
  ["shadowColor"]
  // Option decal is in `DecalObject` but style.decal is in `PatternObject`.
  // So do not transfer decal directly.
], cS = ra(hS), vS = (
  /** @class */
  (function() {
    function r() {
    }
    return r.prototype.getAreaStyle = function(t, e) {
      return cS(this, t, e);
    }, r;
  })()
), Pu = new pa(50);
function dS(r) {
  if (typeof r == "string") {
    var t = Pu.get(r);
    return t && t.image;
  } else
    return r;
}
function Ag(r, t, e, i, n) {
  if (r)
    if (typeof r == "string") {
      if (t && t.__zrImageSrc === r || !e)
        return t;
      var a = Pu.get(r), o = { hostEl: e, cb: i, cbPayload: n };
      return a ? (t = a.image, !ss(t) && a.pending.push(o)) : (t = Xi.loadImage(r, Ec, Ec), t.__zrImageSrc = r, Pu.put(r, t.__cachedImgObj = {
        image: t,
        pending: [o]
      })), t;
    } else
      return r;
  else return t;
}
function Ec() {
  var r = this.__cachedImgObj;
  this.onload = this.onerror = this.__cachedImgObj = null;
  for (var t = 0; t < r.pending.length; t++) {
    var e = r.pending[t], i = e.cb;
    i && i(this, e.cbPayload), e.hostEl.dirty();
  }
  r.pending.length = 0;
}
function ss(r) {
  return r && r.width && r.height;
}
var ll = /\{([a-zA-Z0-9_]+)\|([^}]*)\}/g;
function pS(r, t, e, i, n, a) {
  if (!e) {
    r.text = "", r.isTruncated = !1;
    return;
  }
  var o = (t + "").split(`
`);
  a = Lg(e, i, n, a);
  for (var s = !1, l = {}, u = 0, f = o.length; u < f; u++)
    Pg(l, o[u], a), o[u] = l.textLine, s = s || l.isTruncated;
  r.text = o.join(`
`), r.isTruncated = s;
}
function Lg(r, t, e, i) {
  i = i || {};
  var n = k({}, i);
  n.font = t, e = X(e, "..."), n.maxIterations = X(i.maxIterations, 2);
  var a = n.minChar = X(i.minChar, 0);
  n.cnCharWidth = Qt("国", t);
  var o = n.ascCharWidth = Qt("a", t);
  n.placeholder = X(i.placeholder, "");
  for (var s = r = Math.max(0, r - 1), l = 0; l < a && s >= o; l++)
    s -= o;
  var u = Qt(e, t);
  return u > s && (e = "", u = 0), s = r - u, n.ellipsis = e, n.ellipsisWidth = u, n.contentWidth = s, n.containerWidth = r, n;
}
function Pg(r, t, e) {
  var i = e.containerWidth, n = e.font, a = e.contentWidth;
  if (!i) {
    r.textLine = "", r.isTruncated = !1;
    return;
  }
  var o = Qt(t, n);
  if (o <= i) {
    r.textLine = t, r.isTruncated = !1;
    return;
  }
  for (var s = 0; ; s++) {
    if (o <= a || s >= e.maxIterations) {
      t += e.ellipsis;
      break;
    }
    var l = s === 0 ? gS(t, a, e.ascCharWidth, e.cnCharWidth) : o > 0 ? Math.floor(t.length * a / o) : 0;
    t = t.substr(0, l), o = Qt(t, n);
  }
  t === "" && (t = e.placeholder), r.textLine = t, r.isTruncated = !0;
}
function gS(r, t, e, i) {
  for (var n = 0, a = 0, o = r.length; a < o && n < t; a++) {
    var s = r.charCodeAt(a);
    n += 0 <= s && s <= 127 ? e : i;
  }
  return a;
}
function yS(r, t) {
  r != null && (r += "");
  var e = t.overflow, i = t.padding, n = t.font, a = e === "truncate", o = Ff(n), s = X(t.lineHeight, o), l = !!t.backgroundColor, u = t.lineOverflow === "truncate", f = !1, h = t.width, v;
  h != null && (e === "break" || e === "breakAll") ? v = r ? Ig(r, t.font, h, e === "breakAll", 0).lines : [] : v = r ? r.split(`
`) : [];
  var c = v.length * s, d = X(t.height, c);
  if (c > d && u) {
    var y = Math.floor(d / s);
    f = f || v.length > y, v = v.slice(0, y);
  }
  if (r && a && h != null)
    for (var p = Lg(h, n, t.ellipsis, {
      minChar: t.truncateMinChar,
      placeholder: t.placeholder
    }), g = {}, m = 0; m < v.length; m++)
      Pg(g, v[m], p), v[m] = g.textLine, f = f || g.isTruncated;
  for (var _ = d, S = 0, m = 0; m < v.length; m++)
    S = Math.max(Qt(v[m], n), S);
  h == null && (h = S);
  var w = S;
  return i && (_ += i[0] + i[2], w += i[1] + i[3], h += i[1] + i[3]), l && (w = h), {
    lines: v,
    height: d,
    outerWidth: w,
    outerHeight: _,
    lineHeight: s,
    calculatedLineHeight: o,
    contentWidth: S,
    contentHeight: c,
    width: h,
    isTruncated: f
  };
}
var mS = /* @__PURE__ */ (function() {
  function r() {
  }
  return r;
})(), Rc = /* @__PURE__ */ (function() {
  function r(t) {
    this.tokens = [], t && (this.tokens = t);
  }
  return r;
})(), _S = /* @__PURE__ */ (function() {
  function r() {
    this.width = 0, this.height = 0, this.contentWidth = 0, this.contentHeight = 0, this.outerWidth = 0, this.outerHeight = 0, this.lines = [], this.isTruncated = !1;
  }
  return r;
})();
function SS(r, t) {
  var e = new _S();
  if (r != null && (r += ""), !r)
    return e;
  for (var i = t.width, n = t.height, a = t.overflow, o = (a === "break" || a === "breakAll") && i != null ? { width: i, accumWidth: 0, breakAll: a === "breakAll" } : null, s = ll.lastIndex = 0, l; (l = ll.exec(r)) != null; ) {
    var u = l.index;
    u > s && ul(e, r.substring(s, u), t, o), ul(e, l[2], t, o, l[1]), s = ll.lastIndex;
  }
  s < r.length && ul(e, r.substring(s, r.length), t, o);
  var f = [], h = 0, v = 0, c = t.padding, d = a === "truncate", y = t.lineOverflow === "truncate", p = {};
  function g($, J, j) {
    $.width = J, $.lineHeight = j, h += j, v = Math.max(v, J);
  }
  t: for (var m = 0; m < e.lines.length; m++) {
    for (var _ = e.lines[m], S = 0, w = 0, b = 0; b < _.tokens.length; b++) {
      var x = _.tokens[b], D = x.styleName && t.rich[x.styleName] || {}, T = x.textPadding = D.padding, C = T ? T[1] + T[3] : 0, M = x.font = D.font || t.font;
      x.contentHeight = Ff(M);
      var L = X(D.height, x.contentHeight);
      if (x.innerHeight = L, T && (L += T[0] + T[2]), x.height = L, x.lineHeight = co(D.lineHeight, t.lineHeight, L), x.align = D && D.align || t.align, x.verticalAlign = D && D.verticalAlign || "middle", y && n != null && h + x.lineHeight > n) {
        var P = e.lines.length;
        b > 0 ? (_.tokens = _.tokens.slice(0, b), g(_, w, S), e.lines = e.lines.slice(0, m + 1)) : e.lines = e.lines.slice(0, m), e.isTruncated = e.isTruncated || e.lines.length < P;
        break t;
      }
      var I = D.width, E = I == null || I === "auto";
      if (typeof I == "string" && I.charAt(I.length - 1) === "%")
        x.percentWidth = I, f.push(x), x.contentWidth = Qt(x.text, M);
      else {
        if (E) {
          var R = D.backgroundColor, V = R && R.image;
          V && (V = dS(V), ss(V) && (x.width = Math.max(x.width, V.width * L / V.height)));
        }
        var B = d && i != null ? i - w : null;
        B != null && B < x.width ? !E || B < C ? (x.text = "", x.width = x.contentWidth = 0) : (pS(p, x.text, B - C, M, t.ellipsis, { minChar: t.truncateMinChar }), x.text = p.text, e.isTruncated = e.isTruncated || p.isTruncated, x.width = x.contentWidth = Qt(x.text, M)) : x.contentWidth = Qt(x.text, M);
      }
      x.width += C, w += x.width, D && (S = Math.max(S, x.lineHeight));
    }
    g(_, w, S);
  }
  e.outerWidth = e.width = X(i, v), e.outerHeight = e.height = X(n, h), e.contentHeight = h, e.contentWidth = v, c && (e.outerWidth += c[1] + c[3], e.outerHeight += c[0] + c[2]);
  for (var m = 0; m < f.length; m++) {
    var x = f[m], F = x.percentWidth;
    x.width = parseInt(F, 10) / 100 * e.width;
  }
  return e;
}
function ul(r, t, e, i, n) {
  var a = t === "", o = n && e.rich[n] || {}, s = r.lines, l = o.font || e.font, u = !1, f, h;
  if (i) {
    var v = o.padding, c = v ? v[1] + v[3] : 0;
    if (o.width != null && o.width !== "auto") {
      var d = Qr(o.width, i.width) + c;
      s.length > 0 && d + i.accumWidth > i.width && (f = t.split(`
`), u = !0), i.accumWidth = d;
    } else {
      var y = Ig(t, l, i.width, i.breakAll, i.accumWidth);
      i.accumWidth = y.accumWidth + c, h = y.linesWidths, f = y.lines;
    }
  } else
    f = t.split(`
`);
  for (var p = 0; p < f.length; p++) {
    var g = f[p], m = new mS();
    if (m.styleName = n, m.text = g, m.isLineHolder = !g && !a, typeof o.width == "number" ? m.width = o.width : m.width = h ? h[p] : Qt(g, l), !p && !u) {
      var _ = (s[s.length - 1] || (s[0] = new Rc())).tokens, S = _.length;
      S === 1 && _[0].isLineHolder ? _[0] = m : (g || !S || a) && _.push(m);
    } else
      s.push(new Rc([m]));
  }
}
function bS(r) {
  var t = r.charCodeAt(0);
  return t >= 32 && t <= 591 || t >= 880 && t <= 4351 || t >= 4608 && t <= 5119 || t >= 7680 && t <= 8303;
}
var wS = Zi(",&?/;] ".split(""), function(r, t) {
  return r[t] = !0, r;
}, {});
function xS(r) {
  return bS(r) ? !!wS[r] : !0;
}
function Ig(r, t, e, i, n) {
  for (var a = [], o = [], s = "", l = "", u = 0, f = 0, h = 0; h < r.length; h++) {
    var v = r.charAt(h);
    if (v === `
`) {
      l && (s += l, f += u), a.push(s), o.push(f), s = "", l = "", u = 0, f = 0;
      continue;
    }
    var c = Qt(v, t), d = i ? !1 : !xS(v);
    if (a.length ? f + c > e : n + f + c > e) {
      f ? (s || l) && (d ? (s || (s = l, l = "", u = 0, f = u), a.push(s), o.push(f - u), l += v, u += c, s = "", f = u) : (l && (s += l, l = "", u = 0), a.push(s), o.push(f), s = v, f = c)) : d ? (a.push(l), o.push(u), l = v, u = c) : (a.push(v), o.push(c));
      continue;
    }
    f += c, d ? (l += v, u += c) : (l && (s += l, l = "", u = 0), s += v);
  }
  return !a.length && !s && (s = r, l = "", u = 0), l && (s += l), s && (a.push(s), o.push(f)), a.length === 1 && (f += n), {
    accumWidth: f,
    lines: a,
    linesWidths: o
  };
}
var Iu = "__zr_style_" + Math.round(Math.random() * 10), Yr = {
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  shadowColor: "#000",
  opacity: 1,
  blend: "source-over"
}, ls = {
  style: {
    shadowBlur: !0,
    shadowOffsetX: !0,
    shadowOffsetY: !0,
    shadowColor: !0,
    opacity: !0
  }
};
Yr[Iu] = !0;
var kc = ["z", "z2", "invisible"], TS = ["invisible"], ma = (function(r) {
  O(t, r);
  function t(e) {
    return r.call(this, e) || this;
  }
  return t.prototype._init = function(e) {
    for (var i = pt(e), n = 0; n < i.length; n++) {
      var a = i[n];
      a === "style" ? this.useStyle(e[a]) : r.prototype.attrKV.call(this, a, e[a]);
    }
    this.style || this.useStyle({});
  }, t.prototype.beforeBrush = function() {
  }, t.prototype.afterBrush = function() {
  }, t.prototype.innerBeforeBrush = function() {
  }, t.prototype.innerAfterBrush = function() {
  }, t.prototype.shouldBePainted = function(e, i, n, a) {
    var o = this.transform;
    if (this.ignore || this.invisible || this.style.opacity === 0 || this.culling && CS(this, e, i) || o && !o[0] && !o[3])
      return !1;
    if (n && this.__clipPaths) {
      for (var s = 0; s < this.__clipPaths.length; ++s)
        if (this.__clipPaths[s].isZeroArea())
          return !1;
    }
    if (a && this.parent)
      for (var l = this.parent; l; ) {
        if (l.ignore)
          return !1;
        l = l.parent;
      }
    return !0;
  }, t.prototype.contain = function(e, i) {
    return this.rectContain(e, i);
  }, t.prototype.traverse = function(e, i) {
    e.call(i, this);
  }, t.prototype.rectContain = function(e, i) {
    var n = this.transformCoordToLocal(e, i), a = this.getBoundingRect();
    return a.contain(n[0], n[1]);
  }, t.prototype.getPaintRect = function() {
    var e = this._paintRect;
    if (!this._paintRect || this.__dirty) {
      var i = this.transform, n = this.getBoundingRect(), a = this.style, o = a.shadowBlur || 0, s = a.shadowOffsetX || 0, l = a.shadowOffsetY || 0;
      e = this._paintRect || (this._paintRect = new it(0, 0, 0, 0)), i ? it.applyTransform(e, n, i) : e.copy(n), (o || s || l) && (e.width += o * 2 + Math.abs(s), e.height += o * 2 + Math.abs(l), e.x = Math.min(e.x, e.x + s - o), e.y = Math.min(e.y, e.y + l - o));
      var u = this.dirtyRectTolerance;
      e.isZero() || (e.x = Math.floor(e.x - u), e.y = Math.floor(e.y - u), e.width = Math.ceil(e.width + 1 + u * 2), e.height = Math.ceil(e.height + 1 + u * 2));
    }
    return e;
  }, t.prototype.setPrevPaintRect = function(e) {
    e ? (this._prevPaintRect = this._prevPaintRect || new it(0, 0, 0, 0), this._prevPaintRect.copy(e)) : this._prevPaintRect = null;
  }, t.prototype.getPrevPaintRect = function() {
    return this._prevPaintRect;
  }, t.prototype.animateStyle = function(e) {
    return this.animate("style", e);
  }, t.prototype.updateDuringAnimation = function(e) {
    e === "style" ? this.dirtyStyle() : this.markRedraw();
  }, t.prototype.attrKV = function(e, i) {
    e !== "style" ? r.prototype.attrKV.call(this, e, i) : this.style ? this.setStyle(i) : this.useStyle(i);
  }, t.prototype.setStyle = function(e, i) {
    return typeof e == "string" ? this.style[e] = i : k(this.style, e), this.dirtyStyle(), this;
  }, t.prototype.dirtyStyle = function(e) {
    e || this.markRedraw(), this.__dirty |= Tn, this._rect && (this._rect = null);
  }, t.prototype.dirty = function() {
    this.dirtyStyle();
  }, t.prototype.styleChanged = function() {
    return !!(this.__dirty & Tn);
  }, t.prototype.styleUpdated = function() {
    this.__dirty &= ~Tn;
  }, t.prototype.createStyle = function(e) {
    return is(Yr, e);
  }, t.prototype.useStyle = function(e) {
    e[Iu] || (e = this.createStyle(e)), this.__inHover ? this.__hoverStyle = e : this.style = e, this.dirtyStyle();
  }, t.prototype.isStyleObject = function(e) {
    return e[Iu];
  }, t.prototype._innerSaveToNormal = function(e) {
    r.prototype._innerSaveToNormal.call(this, e);
    var i = this._normalState;
    e.style && !i.style && (i.style = this._mergeStyle(this.createStyle(), this.style)), this._savePrimaryToNormal(e, i, kc);
  }, t.prototype._applyStateObj = function(e, i, n, a, o, s) {
    r.prototype._applyStateObj.call(this, e, i, n, a, o, s);
    var l = !(i && a), u;
    if (i && i.style ? o ? a ? u = i.style : (u = this._mergeStyle(this.createStyle(), n.style), this._mergeStyle(u, i.style)) : (u = this._mergeStyle(this.createStyle(), a ? this.style : n.style), this._mergeStyle(u, i.style)) : l && (u = n.style), u)
      if (o) {
        var f = this.style;
        if (this.style = this.createStyle(l ? {} : f), l)
          for (var h = pt(f), v = 0; v < h.length; v++) {
            var c = h[v];
            c in u && (u[c] = u[c], this.style[c] = f[c]);
          }
        for (var d = pt(u), v = 0; v < d.length; v++) {
          var c = d[v];
          this.style[c] = this.style[c];
        }
        this._transitionState(e, {
          style: u
        }, s, this.getAnimationStyleProps());
      } else
        this.useStyle(u);
    for (var y = this.__inHover ? TS : kc, v = 0; v < y.length; v++) {
      var c = y[v];
      i && i[c] != null ? this[c] = i[c] : l && n[c] != null && (this[c] = n[c]);
    }
  }, t.prototype._mergeStates = function(e) {
    for (var i = r.prototype._mergeStates.call(this, e), n, a = 0; a < e.length; a++) {
      var o = e[a];
      o.style && (n = n || {}, this._mergeStyle(n, o.style));
    }
    return n && (i.style = n), i;
  }, t.prototype._mergeStyle = function(e, i) {
    return k(e, i), e;
  }, t.prototype.getAnimationStyleProps = function() {
    return ls;
  }, t.initDefaultProps = (function() {
    var e = t.prototype;
    e.type = "displayable", e.invisible = !1, e.z = 0, e.z2 = 0, e.zlevel = 0, e.culling = !1, e.cursor = "pointer", e.rectHover = !1, e.incremental = !1, e._rect = null, e.dirtyRectTolerance = 0, e.__dirty = jt | Tn;
  })(), t;
})(as), fl = new it(0, 0, 0, 0), hl = new it(0, 0, 0, 0);
function CS(r, t, e) {
  return fl.copy(r.getBoundingRect()), r.transform && fl.applyTransform(r.transform), hl.width = t, hl.height = e, !fl.intersect(hl);
}
var oe = Math.min, se = Math.max, cl = Math.sin, vl = Math.cos, Cr = Math.PI * 2, Ea = qi(), Ra = qi(), ka = qi();
function Oc(r, t, e, i, n, a) {
  n[0] = oe(r, e), n[1] = oe(t, i), a[0] = se(r, e), a[1] = se(t, i);
}
var Nc = [], Bc = [];
function MS(r, t, e, i, n, a, o, s, l, u) {
  var f = sg, h = At, v = f(r, e, n, o, Nc);
  l[0] = 1 / 0, l[1] = 1 / 0, u[0] = -1 / 0, u[1] = -1 / 0;
  for (var c = 0; c < v; c++) {
    var d = h(r, e, n, o, Nc[c]);
    l[0] = oe(d, l[0]), u[0] = se(d, u[0]);
  }
  v = f(t, i, a, s, Bc);
  for (var c = 0; c < v; c++) {
    var y = h(t, i, a, s, Bc[c]);
    l[1] = oe(y, l[1]), u[1] = se(y, u[1]);
  }
  l[0] = oe(r, l[0]), u[0] = se(r, u[0]), l[0] = oe(o, l[0]), u[0] = se(o, u[0]), l[1] = oe(t, l[1]), u[1] = se(t, u[1]), l[1] = oe(s, l[1]), u[1] = se(s, u[1]);
}
function DS(r, t, e, i, n, a, o, s) {
  var l = lg, u = Vt, f = se(oe(l(r, e, n), 1), 0), h = se(oe(l(t, i, a), 1), 0), v = u(r, e, n, f), c = u(t, i, a, h);
  o[0] = oe(r, n, v), o[1] = oe(t, a, c), s[0] = se(r, n, v), s[1] = se(t, a, c);
}
function AS(r, t, e, i, n, a, o, s, l) {
  var u = Ci, f = Mi, h = Math.abs(n - a);
  if (h % Cr < 1e-4 && h > 1e-4) {
    s[0] = r - e, s[1] = t - i, l[0] = r + e, l[1] = t + i;
    return;
  }
  if (Ea[0] = vl(n) * e + r, Ea[1] = cl(n) * i + t, Ra[0] = vl(a) * e + r, Ra[1] = cl(a) * i + t, u(s, Ea, Ra), f(l, Ea, Ra), n = n % Cr, n < 0 && (n = n + Cr), a = a % Cr, a < 0 && (a = a + Cr), n > a && !o ? a += Cr : n < a && o && (n += Cr), o) {
    var v = a;
    a = n, n = v;
  }
  for (var c = 0; c < a; c += Math.PI / 2)
    c > n && (ka[0] = vl(c) * e + r, ka[1] = cl(c) * i + t, u(s, ka, s), f(l, ka, l));
}
var tt = {
  M: 1,
  L: 2,
  C: 3,
  Q: 4,
  A: 5,
  Z: 6,
  R: 7
}, Mr = [], Dr = [], be = [], Xe = [], we = [], xe = [], dl = Math.min, pl = Math.max, Ar = Math.cos, Lr = Math.sin, Oe = Math.abs, Eu = Math.PI, ir = Eu * 2, gl = typeof Float32Array < "u", ln = [];
function yl(r) {
  var t = Math.round(r / Eu * 1e8) / 1e8;
  return t % 2 * Eu;
}
function LS(r, t) {
  var e = yl(r[0]);
  e < 0 && (e += ir);
  var i = e - r[0], n = r[1];
  n += i, !t && n - e >= ir ? n = e + ir : t && e - n >= ir ? n = e - ir : !t && e > n ? n = e + (ir - yl(e - n)) : t && e < n && (n = e - (ir - yl(n - e))), r[0] = e, r[1] = n;
}
var ti = (function() {
  function r(t) {
    this.dpr = 1, this._xi = 0, this._yi = 0, this._x0 = 0, this._y0 = 0, this._len = 0, t && (this._saveData = !1), this._saveData && (this.data = []);
  }
  return r.prototype.increaseVersion = function() {
    this._version++;
  }, r.prototype.getVersion = function() {
    return this._version;
  }, r.prototype.setScale = function(t, e, i) {
    i = i || 0, i > 0 && (this._ux = Oe(i / Oo / t) || 0, this._uy = Oe(i / Oo / e) || 0);
  }, r.prototype.setDPR = function(t) {
    this.dpr = t;
  }, r.prototype.setContext = function(t) {
    this._ctx = t;
  }, r.prototype.getContext = function() {
    return this._ctx;
  }, r.prototype.beginPath = function() {
    return this._ctx && this._ctx.beginPath(), this.reset(), this;
  }, r.prototype.reset = function() {
    this._saveData && (this._len = 0), this._pathSegLen && (this._pathSegLen = null, this._pathLen = 0), this._version++;
  }, r.prototype.moveTo = function(t, e) {
    return this._drawPendingPt(), this.addData(tt.M, t, e), this._ctx && this._ctx.moveTo(t, e), this._x0 = t, this._y0 = e, this._xi = t, this._yi = e, this;
  }, r.prototype.lineTo = function(t, e) {
    var i = Oe(t - this._xi), n = Oe(e - this._yi), a = i > this._ux || n > this._uy;
    if (this.addData(tt.L, t, e), this._ctx && a && this._ctx.lineTo(t, e), a)
      this._xi = t, this._yi = e, this._pendingPtDist = 0;
    else {
      var o = i * i + n * n;
      o > this._pendingPtDist && (this._pendingPtX = t, this._pendingPtY = e, this._pendingPtDist = o);
    }
    return this;
  }, r.prototype.bezierCurveTo = function(t, e, i, n, a, o) {
    return this._drawPendingPt(), this.addData(tt.C, t, e, i, n, a, o), this._ctx && this._ctx.bezierCurveTo(t, e, i, n, a, o), this._xi = a, this._yi = o, this;
  }, r.prototype.quadraticCurveTo = function(t, e, i, n) {
    return this._drawPendingPt(), this.addData(tt.Q, t, e, i, n), this._ctx && this._ctx.quadraticCurveTo(t, e, i, n), this._xi = i, this._yi = n, this;
  }, r.prototype.arc = function(t, e, i, n, a, o) {
    this._drawPendingPt(), ln[0] = n, ln[1] = a, LS(ln, o), n = ln[0], a = ln[1];
    var s = a - n;
    return this.addData(tt.A, t, e, i, i, n, s, 0, o ? 0 : 1), this._ctx && this._ctx.arc(t, e, i, n, a, o), this._xi = Ar(a) * i + t, this._yi = Lr(a) * i + e, this;
  }, r.prototype.arcTo = function(t, e, i, n, a) {
    return this._drawPendingPt(), this._ctx && this._ctx.arcTo(t, e, i, n, a), this;
  }, r.prototype.rect = function(t, e, i, n) {
    return this._drawPendingPt(), this._ctx && this._ctx.rect(t, e, i, n), this.addData(tt.R, t, e, i, n), this;
  }, r.prototype.closePath = function() {
    this._drawPendingPt(), this.addData(tt.Z);
    var t = this._ctx, e = this._x0, i = this._y0;
    return t && t.closePath(), this._xi = e, this._yi = i, this;
  }, r.prototype.fill = function(t) {
    t && t.fill(), this.toStatic();
  }, r.prototype.stroke = function(t) {
    t && t.stroke(), this.toStatic();
  }, r.prototype.len = function() {
    return this._len;
  }, r.prototype.setData = function(t) {
    var e = t.length;
    !(this.data && this.data.length === e) && gl && (this.data = new Float32Array(e));
    for (var i = 0; i < e; i++)
      this.data[i] = t[i];
    this._len = e;
  }, r.prototype.appendPath = function(t) {
    t instanceof Array || (t = [t]);
    for (var e = t.length, i = 0, n = this._len, a = 0; a < e; a++)
      i += t[a].len();
    gl && this.data instanceof Float32Array && (this.data = new Float32Array(n + i));
    for (var a = 0; a < e; a++)
      for (var o = t[a].data, s = 0; s < o.length; s++)
        this.data[n++] = o[s];
    this._len = n;
  }, r.prototype.addData = function(t, e, i, n, a, o, s, l, u) {
    if (this._saveData) {
      var f = this.data;
      this._len + arguments.length > f.length && (this._expandData(), f = this.data);
      for (var h = 0; h < arguments.length; h++)
        f[this._len++] = arguments[h];
    }
  }, r.prototype._drawPendingPt = function() {
    this._pendingPtDist > 0 && (this._ctx && this._ctx.lineTo(this._pendingPtX, this._pendingPtY), this._pendingPtDist = 0);
  }, r.prototype._expandData = function() {
    if (!(this.data instanceof Array)) {
      for (var t = [], e = 0; e < this._len; e++)
        t[e] = this.data[e];
      this.data = t;
    }
  }, r.prototype.toStatic = function() {
    if (this._saveData) {
      this._drawPendingPt();
      var t = this.data;
      t instanceof Array && (t.length = this._len, gl && this._len > 11 && (this.data = new Float32Array(t)));
    }
  }, r.prototype.getBoundingRect = function() {
    be[0] = be[1] = we[0] = we[1] = Number.MAX_VALUE, Xe[0] = Xe[1] = xe[0] = xe[1] = -Number.MAX_VALUE;
    var t = this.data, e = 0, i = 0, n = 0, a = 0, o;
    for (o = 0; o < this._len; ) {
      var s = t[o++], l = o === 1;
      switch (l && (e = t[o], i = t[o + 1], n = e, a = i), s) {
        case tt.M:
          e = n = t[o++], i = a = t[o++], we[0] = n, we[1] = a, xe[0] = n, xe[1] = a;
          break;
        case tt.L:
          Oc(e, i, t[o], t[o + 1], we, xe), e = t[o++], i = t[o++];
          break;
        case tt.C:
          MS(e, i, t[o++], t[o++], t[o++], t[o++], t[o], t[o + 1], we, xe), e = t[o++], i = t[o++];
          break;
        case tt.Q:
          DS(e, i, t[o++], t[o++], t[o], t[o + 1], we, xe), e = t[o++], i = t[o++];
          break;
        case tt.A:
          var u = t[o++], f = t[o++], h = t[o++], v = t[o++], c = t[o++], d = t[o++] + c;
          o += 1;
          var y = !t[o++];
          l && (n = Ar(c) * h + u, a = Lr(c) * v + f), AS(u, f, h, v, c, d, y, we, xe), e = Ar(d) * h + u, i = Lr(d) * v + f;
          break;
        case tt.R:
          n = e = t[o++], a = i = t[o++];
          var p = t[o++], g = t[o++];
          Oc(n, a, n + p, a + g, we, xe);
          break;
        case tt.Z:
          e = n, i = a;
          break;
      }
      Ci(be, be, we), Mi(Xe, Xe, xe);
    }
    return o === 0 && (be[0] = be[1] = Xe[0] = Xe[1] = 0), new it(be[0], be[1], Xe[0] - be[0], Xe[1] - be[1]);
  }, r.prototype._calculateLength = function() {
    var t = this.data, e = this._len, i = this._ux, n = this._uy, a = 0, o = 0, s = 0, l = 0;
    this._pathSegLen || (this._pathSegLen = []);
    for (var u = this._pathSegLen, f = 0, h = 0, v = 0; v < e; ) {
      var c = t[v++], d = v === 1;
      d && (a = t[v], o = t[v + 1], s = a, l = o);
      var y = -1;
      switch (c) {
        case tt.M:
          a = s = t[v++], o = l = t[v++];
          break;
        case tt.L: {
          var p = t[v++], g = t[v++], m = p - a, _ = g - o;
          (Oe(m) > i || Oe(_) > n || v === e - 1) && (y = Math.sqrt(m * m + _ * _), a = p, o = g);
          break;
        }
        case tt.C: {
          var S = t[v++], w = t[v++], p = t[v++], g = t[v++], b = t[v++], x = t[v++];
          y = t1(a, o, S, w, p, g, b, x, 10), a = b, o = x;
          break;
        }
        case tt.Q: {
          var S = t[v++], w = t[v++], p = t[v++], g = t[v++];
          y = i1(a, o, S, w, p, g, 10), a = p, o = g;
          break;
        }
        case tt.A:
          var D = t[v++], T = t[v++], C = t[v++], M = t[v++], L = t[v++], P = t[v++], I = P + L;
          v += 1, d && (s = Ar(L) * C + D, l = Lr(L) * M + T), y = pl(C, M) * dl(ir, Math.abs(P)), a = Ar(I) * C + D, o = Lr(I) * M + T;
          break;
        case tt.R: {
          s = a = t[v++], l = o = t[v++];
          var E = t[v++], R = t[v++];
          y = E * 2 + R * 2;
          break;
        }
        case tt.Z: {
          var m = s - a, _ = l - o;
          y = Math.sqrt(m * m + _ * _), a = s, o = l;
          break;
        }
      }
      y >= 0 && (u[h++] = y, f += y);
    }
    return this._pathLen = f, f;
  }, r.prototype.rebuildPath = function(t, e) {
    var i = this.data, n = this._ux, a = this._uy, o = this._len, s, l, u, f, h, v, c = e < 1, d, y, p = 0, g = 0, m, _ = 0, S, w;
    if (!(c && (this._pathSegLen || this._calculateLength(), d = this._pathSegLen, y = this._pathLen, m = e * y, !m)))
      t: for (var b = 0; b < o; ) {
        var x = i[b++], D = b === 1;
        switch (D && (u = i[b], f = i[b + 1], s = u, l = f), x !== tt.L && _ > 0 && (t.lineTo(S, w), _ = 0), x) {
          case tt.M:
            s = u = i[b++], l = f = i[b++], t.moveTo(u, f);
            break;
          case tt.L: {
            h = i[b++], v = i[b++];
            var T = Oe(h - u), C = Oe(v - f);
            if (T > n || C > a) {
              if (c) {
                var M = d[g++];
                if (p + M > m) {
                  var L = (m - p) / M;
                  t.lineTo(u * (1 - L) + h * L, f * (1 - L) + v * L);
                  break t;
                }
                p += M;
              }
              t.lineTo(h, v), u = h, f = v, _ = 0;
            } else {
              var P = T * T + C * C;
              P > _ && (S = h, w = v, _ = P);
            }
            break;
          }
          case tt.C: {
            var I = i[b++], E = i[b++], R = i[b++], V = i[b++], B = i[b++], F = i[b++];
            if (c) {
              var M = d[g++];
              if (p + M > m) {
                var L = (m - p) / M;
                Eo(u, I, R, B, L, Mr), Eo(f, E, V, F, L, Dr), t.bezierCurveTo(Mr[1], Dr[1], Mr[2], Dr[2], Mr[3], Dr[3]);
                break t;
              }
              p += M;
            }
            t.bezierCurveTo(I, E, R, V, B, F), u = B, f = F;
            break;
          }
          case tt.Q: {
            var I = i[b++], E = i[b++], R = i[b++], V = i[b++];
            if (c) {
              var M = d[g++];
              if (p + M > m) {
                var L = (m - p) / M;
                Ro(u, I, R, L, Mr), Ro(f, E, V, L, Dr), t.quadraticCurveTo(Mr[1], Dr[1], Mr[2], Dr[2]);
                break t;
              }
              p += M;
            }
            t.quadraticCurveTo(I, E, R, V), u = R, f = V;
            break;
          }
          case tt.A:
            var $ = i[b++], J = i[b++], j = i[b++], lt = i[b++], ft = i[b++], ct = i[b++], Nt = i[b++], Bt = !i[b++], _t = j > lt ? j : lt, St = Oe(j - lt) > 1e-3, nt = ft + ct, Y = !1;
            if (c) {
              var M = d[g++];
              p + M > m && (nt = ft + ct * (m - p) / M, Y = !0), p += M;
            }
            if (St && t.ellipse ? t.ellipse($, J, j, lt, Nt, ft, nt, Bt) : t.arc($, J, _t, ft, nt, Bt), Y)
              break t;
            D && (s = Ar(ft) * j + $, l = Lr(ft) * lt + J), u = Ar(nt) * j + $, f = Lr(nt) * lt + J;
            break;
          case tt.R:
            s = u = i[b], l = f = i[b + 1], h = i[b++], v = i[b++];
            var q = i[b++], ke = i[b++];
            if (c) {
              var M = d[g++];
              if (p + M > m) {
                var Ct = m - p;
                t.moveTo(h, v), t.lineTo(h + dl(Ct, q), v), Ct -= q, Ct > 0 && t.lineTo(h + q, v + dl(Ct, ke)), Ct -= ke, Ct > 0 && t.lineTo(h + pl(q - Ct, 0), v + ke), Ct -= q, Ct > 0 && t.lineTo(h, v + pl(ke - Ct, 0));
                break t;
              }
              p += M;
            }
            t.rect(h, v, q, ke);
            break;
          case tt.Z:
            if (c) {
              var M = d[g++];
              if (p + M > m) {
                var L = (m - p) / M;
                t.lineTo(u * (1 - L) + s * L, f * (1 - L) + l * L);
                break t;
              }
              p += M;
            }
            t.closePath(), u = s, f = l;
        }
      }
  }, r.prototype.clone = function() {
    var t = new r(), e = this.data;
    return t.data = e.slice ? e.slice() : Array.prototype.slice.call(e), t._len = this._len, t;
  }, r.CMD = tt, r.initDefaultProps = (function() {
    var t = r.prototype;
    t._saveData = !0, t._ux = 0, t._uy = 0, t._pendingPtDist = 0, t._version = 0;
  })(), r;
})();
function hi(r, t, e, i, n, a, o) {
  if (n === 0)
    return !1;
  var s = n, l = 0, u = r;
  if (o > t + s && o > i + s || o < t - s && o < i - s || a > r + s && a > e + s || a < r - s && a < e - s)
    return !1;
  if (r !== e)
    l = (t - i) / (r - e), u = (r * i - e * t) / (r - e);
  else
    return Math.abs(a - r) <= s / 2;
  var f = l * a - o + u, h = f * f / (l * l + 1);
  return h <= s / 2 * s / 2;
}
function PS(r, t, e, i, n, a, o, s, l, u, f) {
  if (l === 0)
    return !1;
  var h = l;
  if (f > t + h && f > i + h && f > a + h && f > s + h || f < t - h && f < i - h && f < a - h && f < s - h || u > r + h && u > e + h && u > n + h && u > o + h || u < r - h && u < e - h && u < n - h && u < o - h)
    return !1;
  var v = J0(r, t, e, i, n, a, o, s, u, f);
  return v <= h / 2;
}
function IS(r, t, e, i, n, a, o, s, l) {
  if (o === 0)
    return !1;
  var u = o;
  if (l > t + u && l > i + u && l > a + u || l < t - u && l < i - u && l < a - u || s > r + u && s > e + u && s > n + u || s < r - u && s < e - u && s < n - u)
    return !1;
  var f = r1(r, t, e, i, n, a, s, l);
  return f <= u / 2;
}
var Fc = Math.PI * 2;
function Oa(r) {
  return r %= Fc, r < 0 && (r += Fc), r;
}
var un = Math.PI * 2;
function ES(r, t, e, i, n, a, o, s, l) {
  if (o === 0)
    return !1;
  var u = o;
  s -= r, l -= t;
  var f = Math.sqrt(s * s + l * l);
  if (f - u > e || f + u < e)
    return !1;
  if (Math.abs(i - n) % un < 1e-4)
    return !0;
  if (a) {
    var h = i;
    i = Oa(n), n = Oa(h);
  } else
    i = Oa(i), n = Oa(n);
  i > n && (n += un);
  var v = Math.atan2(l, s);
  return v < 0 && (v += un), v >= i && v <= n || v + un >= i && v + un <= n;
}
function Pr(r, t, e, i, n, a) {
  if (a > t && a > i || a < t && a < i || i === t)
    return 0;
  var o = (a - t) / (i - t), s = i < t ? 1 : -1;
  (o === 1 || o === 0) && (s = i < t ? 0.5 : -0.5);
  var l = o * (e - r) + r;
  return l === n ? 1 / 0 : l > n ? s : 0;
}
var Ze = ti.CMD, Ir = Math.PI * 2, RS = 1e-4;
function kS(r, t) {
  return Math.abs(r - t) < RS;
}
var kt = [-1, -1, -1], ne = [-1, -1];
function OS() {
  var r = ne[0];
  ne[0] = ne[1], ne[1] = r;
}
function NS(r, t, e, i, n, a, o, s, l, u) {
  if (u > t && u > i && u > a && u > s || u < t && u < i && u < a && u < s)
    return 0;
  var f = Io(t, i, a, s, u, kt);
  if (f === 0)
    return 0;
  for (var h = 0, v = -1, c = void 0, d = void 0, y = 0; y < f; y++) {
    var p = kt[y], g = p === 0 || p === 1 ? 0.5 : 1, m = At(r, e, n, o, p);
    m < l || (v < 0 && (v = sg(t, i, a, s, ne), ne[1] < ne[0] && v > 1 && OS(), c = At(t, i, a, s, ne[0]), v > 1 && (d = At(t, i, a, s, ne[1]))), v === 2 ? p < ne[0] ? h += c < t ? g : -g : p < ne[1] ? h += d < c ? g : -g : h += s < d ? g : -g : p < ne[0] ? h += c < t ? g : -g : h += s < c ? g : -g);
  }
  return h;
}
function BS(r, t, e, i, n, a, o, s) {
  if (s > t && s > i && s > a || s < t && s < i && s < a)
    return 0;
  var l = e1(t, i, a, s, kt);
  if (l === 0)
    return 0;
  var u = lg(t, i, a);
  if (u >= 0 && u <= 1) {
    for (var f = 0, h = Vt(t, i, a, u), v = 0; v < l; v++) {
      var c = kt[v] === 0 || kt[v] === 1 ? 0.5 : 1, d = Vt(r, e, n, kt[v]);
      d < o || (kt[v] < u ? f += h < t ? c : -c : f += a < h ? c : -c);
    }
    return f;
  } else {
    var c = kt[0] === 0 || kt[0] === 1 ? 0.5 : 1, d = Vt(r, e, n, kt[0]);
    return d < o ? 0 : a < t ? c : -c;
  }
}
function FS(r, t, e, i, n, a, o, s) {
  if (s -= t, s > e || s < -e)
    return 0;
  var l = Math.sqrt(e * e - s * s);
  kt[0] = -l, kt[1] = l;
  var u = Math.abs(i - n);
  if (u < 1e-4)
    return 0;
  if (u >= Ir - 1e-4) {
    i = 0, n = Ir;
    var f = a ? 1 : -1;
    return o >= kt[0] + r && o <= kt[1] + r ? f : 0;
  }
  if (i > n) {
    var h = i;
    i = n, n = h;
  }
  i < 0 && (i += Ir, n += Ir);
  for (var v = 0, c = 0; c < 2; c++) {
    var d = kt[c];
    if (d + r > o) {
      var y = Math.atan2(s, d), f = a ? 1 : -1;
      y < 0 && (y = Ir + y), (y >= i && y <= n || y + Ir >= i && y + Ir <= n) && (y > Math.PI / 2 && y < Math.PI * 1.5 && (f = -f), v += f);
    }
  }
  return v;
}
function Eg(r, t, e, i, n) {
  for (var a = r.data, o = r.len(), s = 0, l = 0, u = 0, f = 0, h = 0, v, c, d = 0; d < o; ) {
    var y = a[d++], p = d === 1;
    switch (y === Ze.M && d > 1 && (e || (s += Pr(l, u, f, h, i, n))), p && (l = a[d], u = a[d + 1], f = l, h = u), y) {
      case Ze.M:
        f = a[d++], h = a[d++], l = f, u = h;
        break;
      case Ze.L:
        if (e) {
          if (hi(l, u, a[d], a[d + 1], t, i, n))
            return !0;
        } else
          s += Pr(l, u, a[d], a[d + 1], i, n) || 0;
        l = a[d++], u = a[d++];
        break;
      case Ze.C:
        if (e) {
          if (PS(l, u, a[d++], a[d++], a[d++], a[d++], a[d], a[d + 1], t, i, n))
            return !0;
        } else
          s += NS(l, u, a[d++], a[d++], a[d++], a[d++], a[d], a[d + 1], i, n) || 0;
        l = a[d++], u = a[d++];
        break;
      case Ze.Q:
        if (e) {
          if (IS(l, u, a[d++], a[d++], a[d], a[d + 1], t, i, n))
            return !0;
        } else
          s += BS(l, u, a[d++], a[d++], a[d], a[d + 1], i, n) || 0;
        l = a[d++], u = a[d++];
        break;
      case Ze.A:
        var g = a[d++], m = a[d++], _ = a[d++], S = a[d++], w = a[d++], b = a[d++];
        d += 1;
        var x = !!(1 - a[d++]);
        v = Math.cos(w) * _ + g, c = Math.sin(w) * S + m, p ? (f = v, h = c) : s += Pr(l, u, v, c, i, n);
        var D = (i - g) * S / _ + g;
        if (e) {
          if (ES(g, m, S, w, w + b, x, t, D, n))
            return !0;
        } else
          s += FS(g, m, S, w, w + b, x, D, n);
        l = Math.cos(w + b) * _ + g, u = Math.sin(w + b) * S + m;
        break;
      case Ze.R:
        f = l = a[d++], h = u = a[d++];
        var T = a[d++], C = a[d++];
        if (v = f + T, c = h + C, e) {
          if (hi(f, h, v, h, t, i, n) || hi(v, h, v, c, t, i, n) || hi(v, c, f, c, t, i, n) || hi(f, c, f, h, t, i, n))
            return !0;
        } else
          s += Pr(v, h, v, c, i, n), s += Pr(f, c, f, h, i, n);
        break;
      case Ze.Z:
        if (e) {
          if (hi(l, u, f, h, t, i, n))
            return !0;
        } else
          s += Pr(l, u, f, h, i, n);
        l = f, u = h;
        break;
    }
  }
  return !e && !kS(u, h) && (s += Pr(l, u, f, h, i, n) || 0), s !== 0;
}
function zS(r, t, e) {
  return Eg(r, 0, !1, t, e);
}
function HS(r, t, e, i) {
  return Eg(r, t, !0, e, i);
}
var Rg = ot({
  fill: "#000",
  stroke: null,
  strokePercent: 1,
  fillOpacity: 1,
  strokeOpacity: 1,
  lineDashOffset: 0,
  lineWidth: 1,
  lineCap: "butt",
  miterLimit: 10,
  strokeNoScale: !1,
  strokeFirst: !1
}, Yr), $S = {
  style: ot({
    fill: !0,
    stroke: !0,
    strokePercent: !0,
    fillOpacity: !0,
    strokeOpacity: !0,
    lineDashOffset: !0,
    lineWidth: !0,
    miterLimit: !0
  }, ls.style)
}, ml = ta.concat([
  "invisible",
  "culling",
  "z",
  "z2",
  "zlevel",
  "parent"
]), st = (function(r) {
  O(t, r);
  function t(e) {
    return r.call(this, e) || this;
  }
  return t.prototype.update = function() {
    var e = this;
    r.prototype.update.call(this);
    var i = this.style;
    if (i.decal) {
      var n = this._decalEl = this._decalEl || new t();
      n.buildPath === t.prototype.buildPath && (n.buildPath = function(l) {
        e.buildPath(l, e.shape);
      }), n.silent = !0;
      var a = n.style;
      for (var o in i)
        a[o] !== i[o] && (a[o] = i[o]);
      a.fill = i.fill ? i.decal : null, a.decal = null, a.shadowColor = null, i.strokeFirst && (a.stroke = null);
      for (var s = 0; s < ml.length; ++s)
        n[ml[s]] = this[ml[s]];
      n.__dirty |= jt;
    } else this._decalEl && (this._decalEl = null);
  }, t.prototype.getDecalElement = function() {
    return this._decalEl;
  }, t.prototype._init = function(e) {
    var i = pt(e);
    this.shape = this.getDefaultShape();
    var n = this.getDefaultStyle();
    n && this.useStyle(n);
    for (var a = 0; a < i.length; a++) {
      var o = i[a], s = e[o];
      o === "style" ? this.style ? k(this.style, s) : this.useStyle(s) : o === "shape" ? k(this.shape, s) : r.prototype.attrKV.call(this, o, s);
    }
    this.style || this.useStyle({});
  }, t.prototype.getDefaultStyle = function() {
    return null;
  }, t.prototype.getDefaultShape = function() {
    return {};
  }, t.prototype.canBeInsideText = function() {
    return this.hasFill();
  }, t.prototype.getInsideTextFill = function() {
    var e = this.style.fill;
    if (e !== "none") {
      if (z(e)) {
        var i = ko(e, 0);
        return i > 0.5 ? Du : i > 0.2 ? x1 : Au;
      } else if (e)
        return Au;
    }
    return Du;
  }, t.prototype.getInsideTextStroke = function(e) {
    var i = this.style.fill;
    if (z(i)) {
      var n = this.__zr, a = !!(n && n.isDarkMode()), o = ko(e, 0) < Mu;
      if (a === o)
        return i;
    }
  }, t.prototype.buildPath = function(e, i, n) {
  }, t.prototype.pathUpdated = function() {
    this.__dirty &= ~xi;
  }, t.prototype.getUpdatedPathProxy = function(e) {
    return !this.path && this.createPathProxy(), this.path.beginPath(), this.buildPath(this.path, this.shape, e), this.path;
  }, t.prototype.createPathProxy = function() {
    this.path = new ti(!1);
  }, t.prototype.hasStroke = function() {
    var e = this.style, i = e.stroke;
    return !(i == null || i === "none" || !(e.lineWidth > 0));
  }, t.prototype.hasFill = function() {
    var e = this.style, i = e.fill;
    return i != null && i !== "none";
  }, t.prototype.getBoundingRect = function() {
    var e = this._rect, i = this.style, n = !e;
    if (n) {
      var a = !1;
      this.path || (a = !0, this.createPathProxy());
      var o = this.path;
      (a || this.__dirty & xi) && (o.beginPath(), this.buildPath(o, this.shape, !1), this.pathUpdated()), e = o.getBoundingRect();
    }
    if (this._rect = e, this.hasStroke() && this.path && this.path.len() > 0) {
      var s = this._rectStroke || (this._rectStroke = e.clone());
      if (this.__dirty || n) {
        s.copy(e);
        var l = i.strokeNoScale ? this.getLineScale() : 1, u = i.lineWidth;
        if (!this.hasFill()) {
          var f = this.strokeContainThreshold;
          u = Math.max(u, f ?? 4);
        }
        l > 1e-10 && (s.width += u / l, s.height += u / l, s.x -= u / l / 2, s.y -= u / l / 2);
      }
      return s;
    }
    return e;
  }, t.prototype.contain = function(e, i) {
    var n = this.transformCoordToLocal(e, i), a = this.getBoundingRect(), o = this.style;
    if (e = n[0], i = n[1], a.contain(e, i)) {
      var s = this.path;
      if (this.hasStroke()) {
        var l = o.lineWidth, u = o.strokeNoScale ? this.getLineScale() : 1;
        if (u > 1e-10 && (this.hasFill() || (l = Math.max(l, this.strokeContainThreshold)), HS(s, l / u, e, i)))
          return !0;
      }
      if (this.hasFill())
        return zS(s, e, i);
    }
    return !1;
  }, t.prototype.dirtyShape = function() {
    this.__dirty |= xi, this._rect && (this._rect = null), this._decalEl && this._decalEl.dirtyShape(), this.markRedraw();
  }, t.prototype.dirty = function() {
    this.dirtyStyle(), this.dirtyShape();
  }, t.prototype.animateShape = function(e) {
    return this.animate("shape", e);
  }, t.prototype.updateDuringAnimation = function(e) {
    e === "style" ? this.dirtyStyle() : e === "shape" ? this.dirtyShape() : this.markRedraw();
  }, t.prototype.attrKV = function(e, i) {
    e === "shape" ? this.setShape(i) : r.prototype.attrKV.call(this, e, i);
  }, t.prototype.setShape = function(e, i) {
    var n = this.shape;
    return n || (n = this.shape = {}), typeof e == "string" ? n[e] = i : k(n, e), this.dirtyShape(), this;
  }, t.prototype.shapeChanged = function() {
    return !!(this.__dirty & xi);
  }, t.prototype.createStyle = function(e) {
    return is(Rg, e);
  }, t.prototype._innerSaveToNormal = function(e) {
    r.prototype._innerSaveToNormal.call(this, e);
    var i = this._normalState;
    e.shape && !i.shape && (i.shape = k({}, this.shape));
  }, t.prototype._applyStateObj = function(e, i, n, a, o, s) {
    r.prototype._applyStateObj.call(this, e, i, n, a, o, s);
    var l = !(i && a), u;
    if (i && i.shape ? o ? a ? u = i.shape : (u = k({}, n.shape), k(u, i.shape)) : (u = k({}, a ? this.shape : n.shape), k(u, i.shape)) : l && (u = n.shape), u)
      if (o) {
        this.shape = k({}, this.shape);
        for (var f = {}, h = pt(u), v = 0; v < h.length; v++) {
          var c = h[v];
          typeof u[c] == "object" ? this.shape[c] = u[c] : f[c] = u[c];
        }
        this._transitionState(e, {
          shape: f
        }, s);
      } else
        this.shape = u, this.dirtyShape();
  }, t.prototype._mergeStates = function(e) {
    for (var i = r.prototype._mergeStates.call(this, e), n, a = 0; a < e.length; a++) {
      var o = e[a];
      o.shape && (n = n || {}, this._mergeStyle(n, o.shape));
    }
    return n && (i.shape = n), i;
  }, t.prototype.getAnimationStyleProps = function() {
    return $S;
  }, t.prototype.isZeroArea = function() {
    return !1;
  }, t.extend = function(e) {
    var i = (function(a) {
      O(o, a);
      function o(s) {
        var l = a.call(this, s) || this;
        return e.init && e.init.call(l, s), l;
      }
      return o.prototype.getDefaultStyle = function() {
        return K(e.style);
      }, o.prototype.getDefaultShape = function() {
        return K(e.shape);
      }, o;
    })(t);
    for (var n in e)
      typeof e[n] == "function" && (i.prototype[n] = e[n]);
    return i;
  }, t.initDefaultProps = (function() {
    var e = t.prototype;
    e.type = "path", e.strokeContainThreshold = 5, e.segmentIgnoreThreshold = 0, e.subPixelOptimize = !1, e.autoBatch = !1, e.__dirty = jt | Tn | xi;
  })(), t;
})(ma), VS = ot({
  strokeFirst: !0,
  font: Kr,
  x: 0,
  y: 0,
  textAlign: "left",
  textBaseline: "top",
  miterLimit: 2
}, Rg), Fo = (function(r) {
  O(t, r);
  function t() {
    return r !== null && r.apply(this, arguments) || this;
  }
  return t.prototype.hasStroke = function() {
    var e = this.style, i = e.stroke;
    return i != null && i !== "none" && e.lineWidth > 0;
  }, t.prototype.hasFill = function() {
    var e = this.style, i = e.fill;
    return i != null && i !== "none";
  }, t.prototype.createStyle = function(e) {
    return is(VS, e);
  }, t.prototype.setBoundingRect = function(e) {
    this._rect = e;
  }, t.prototype.getBoundingRect = function() {
    var e = this.style;
    if (!this._rect) {
      var i = e.text;
      i != null ? i += "" : i = "";
      var n = Bf(i, e.font, e.textAlign, e.textBaseline);
      if (n.x += e.x || 0, n.y += e.y || 0, this.hasStroke()) {
        var a = e.lineWidth;
        n.x -= a / 2, n.y -= a / 2, n.width += a, n.height += a;
      }
      this._rect = n;
    }
    return this._rect;
  }, t.initDefaultProps = (function() {
    var e = t.prototype;
    e.dirtyRectTolerance = 10;
  })(), t;
})(ma);
Fo.prototype.type = "tspan";
var GS = ot({
  x: 0,
  y: 0
}, Yr), WS = {
  style: ot({
    x: !0,
    y: !0,
    width: !0,
    height: !0,
    sx: !0,
    sy: !0,
    sWidth: !0,
    sHeight: !0
  }, ls.style)
};
function US(r) {
  return !!(r && typeof r != "string" && r.width && r.height);
}
var gr = (function(r) {
  O(t, r);
  function t() {
    return r !== null && r.apply(this, arguments) || this;
  }
  return t.prototype.createStyle = function(e) {
    return is(GS, e);
  }, t.prototype._getSize = function(e) {
    var i = this.style, n = i[e];
    if (n != null)
      return n;
    var a = US(i.image) ? i.image : this.__image;
    if (!a)
      return 0;
    var o = e === "width" ? "height" : "width", s = i[o];
    return s == null ? a[e] : a[e] / a[o] * s;
  }, t.prototype.getWidth = function() {
    return this._getSize("width");
  }, t.prototype.getHeight = function() {
    return this._getSize("height");
  }, t.prototype.getAnimationStyleProps = function() {
    return WS;
  }, t.prototype.getBoundingRect = function() {
    var e = this.style;
    return this._rect || (this._rect = new it(e.x || 0, e.y || 0, this.getWidth(), this.getHeight())), this._rect;
  }, t;
})(ma);
gr.prototype.type = "image";
function YS(r, t) {
  var e = t.x, i = t.y, n = t.width, a = t.height, o = t.r, s, l, u, f;
  n < 0 && (e = e + n, n = -n), a < 0 && (i = i + a, a = -a), typeof o == "number" ? s = l = u = f = o : o instanceof Array ? o.length === 1 ? s = l = u = f = o[0] : o.length === 2 ? (s = u = o[0], l = f = o[1]) : o.length === 3 ? (s = o[0], l = f = o[1], u = o[2]) : (s = o[0], l = o[1], u = o[2], f = o[3]) : s = l = u = f = 0;
  var h;
  s + l > n && (h = s + l, s *= n / h, l *= n / h), u + f > n && (h = u + f, u *= n / h, f *= n / h), l + u > a && (h = l + u, l *= a / h, u *= a / h), s + f > a && (h = s + f, s *= a / h, f *= a / h), r.moveTo(e + s, i), r.lineTo(e + n - l, i), l !== 0 && r.arc(e + n - l, i + l, l, -Math.PI / 2, 0), r.lineTo(e + n, i + a - u), u !== 0 && r.arc(e + n - u, i + a - u, u, 0, Math.PI / 2), r.lineTo(e + f, i + a), f !== 0 && r.arc(e + f, i + a - f, f, Math.PI / 2, Math.PI), r.lineTo(e, i + s), s !== 0 && r.arc(e + s, i + s, s, Math.PI, Math.PI * 1.5);
}
var Ai = Math.round;
function kg(r, t, e) {
  if (t) {
    var i = t.x1, n = t.x2, a = t.y1, o = t.y2;
    r.x1 = i, r.x2 = n, r.y1 = a, r.y2 = o;
    var s = e && e.lineWidth;
    return s && (Ai(i * 2) === Ai(n * 2) && (r.x1 = r.x2 = Vr(i, s, !0)), Ai(a * 2) === Ai(o * 2) && (r.y1 = r.y2 = Vr(a, s, !0))), r;
  }
}
function Og(r, t, e) {
  if (t) {
    var i = t.x, n = t.y, a = t.width, o = t.height;
    r.x = i, r.y = n, r.width = a, r.height = o;
    var s = e && e.lineWidth;
    return s && (r.x = Vr(i, s, !0), r.y = Vr(n, s, !0), r.width = Math.max(Vr(i + a, s, !1) - r.x, a === 0 ? 0 : 1), r.height = Math.max(Vr(n + o, s, !1) - r.y, o === 0 ? 0 : 1)), r;
  }
}
function Vr(r, t, e) {
  if (!t)
    return r;
  var i = Ai(r * 2);
  return (i + Ai(t)) % 2 === 0 ? i / 2 : (i + (e ? 1 : -1)) / 2;
}
var XS = /* @__PURE__ */ (function() {
  function r() {
    this.x = 0, this.y = 0, this.width = 0, this.height = 0;
  }
  return r;
})(), ZS = {}, Lt = (function(r) {
  O(t, r);
  function t(e) {
    return r.call(this, e) || this;
  }
  return t.prototype.getDefaultShape = function() {
    return new XS();
  }, t.prototype.buildPath = function(e, i) {
    var n, a, o, s;
    if (this.subPixelOptimize) {
      var l = Og(ZS, i, this.style);
      n = l.x, a = l.y, o = l.width, s = l.height, l.r = i.r, i = l;
    } else
      n = i.x, a = i.y, o = i.width, s = i.height;
    i.r ? YS(e, i) : e.rect(n, a, o, s);
  }, t.prototype.isZeroArea = function() {
    return !this.shape.width || !this.shape.height;
  }, t;
})(st);
Lt.prototype.type = "rect";
var zc = {
  fill: "#000"
}, Hc = 2, qS = {
  style: ot({
    fill: !0,
    stroke: !0,
    fillOpacity: !0,
    strokeOpacity: !0,
    lineWidth: !0,
    fontSize: !0,
    lineHeight: !0,
    width: !0,
    height: !0,
    textShadowColor: !0,
    textShadowBlur: !0,
    textShadowOffsetX: !0,
    textShadowOffsetY: !0,
    backgroundColor: !0,
    padding: !0,
    borderColor: !0,
    borderWidth: !0,
    borderRadius: !0
  }, ls.style)
}, Zt = (function(r) {
  O(t, r);
  function t(e) {
    var i = r.call(this) || this;
    return i.type = "text", i._children = [], i._defaultStyle = zc, i.attr(e), i;
  }
  return t.prototype.childrenRef = function() {
    return this._children;
  }, t.prototype.update = function() {
    r.prototype.update.call(this), this.styleChanged() && this._updateSubTexts();
    for (var e = 0; e < this._children.length; e++) {
      var i = this._children[e];
      i.zlevel = this.zlevel, i.z = this.z, i.z2 = this.z2, i.culling = this.culling, i.cursor = this.cursor, i.invisible = this.invisible;
    }
  }, t.prototype.updateTransform = function() {
    var e = this.innerTransformable;
    e ? (e.updateTransform(), e.transform && (this.transform = e.transform)) : r.prototype.updateTransform.call(this);
  }, t.prototype.getLocalTransform = function(e) {
    var i = this.innerTransformable;
    return i ? i.getLocalTransform(e) : r.prototype.getLocalTransform.call(this, e);
  }, t.prototype.getComputedTransform = function() {
    return this.__hostTarget && (this.__hostTarget.getComputedTransform(), this.__hostTarget.updateInnerText(!0)), r.prototype.getComputedTransform.call(this);
  }, t.prototype._updateSubTexts = function() {
    this._childCursor = 0, tb(this.style), this.style.rich ? this._updateRichTexts() : this._updatePlainTexts(), this._children.length = this._childCursor, this.styleUpdated();
  }, t.prototype.addSelfToZr = function(e) {
    r.prototype.addSelfToZr.call(this, e);
    for (var i = 0; i < this._children.length; i++)
      this._children[i].__zr = e;
  }, t.prototype.removeSelfFromZr = function(e) {
    r.prototype.removeSelfFromZr.call(this, e);
    for (var i = 0; i < this._children.length; i++)
      this._children[i].__zr = null;
  }, t.prototype.getBoundingRect = function() {
    if (this.styleChanged() && this._updateSubTexts(), !this._rect) {
      for (var e = new it(0, 0, 0, 0), i = this._children, n = [], a = null, o = 0; o < i.length; o++) {
        var s = i[o], l = s.getBoundingRect(), u = s.getLocalTransform(n);
        u ? (e.copy(l), e.applyTransform(u), a = a || e.clone(), a.union(e)) : (a = a || l.clone(), a.union(l));
      }
      this._rect = a || e;
    }
    return this._rect;
  }, t.prototype.setDefaultTextStyle = function(e) {
    this._defaultStyle = e || zc;
  }, t.prototype.setTextContent = function(e) {
  }, t.prototype._mergeStyle = function(e, i) {
    if (!i)
      return e;
    var n = i.rich, a = e.rich || n && {};
    return k(e, i), n && a ? (this._mergeRich(a, n), e.rich = a) : a && (e.rich = a), e;
  }, t.prototype._mergeRich = function(e, i) {
    for (var n = pt(i), a = 0; a < n.length; a++) {
      var o = n[a];
      e[o] = e[o] || {}, k(e[o], i[o]);
    }
  }, t.prototype.getAnimationStyleProps = function() {
    return qS;
  }, t.prototype._getOrCreateChild = function(e) {
    var i = this._children[this._childCursor];
    return (!i || !(i instanceof e)) && (i = new e()), this._children[this._childCursor++] = i, i.__zr = this.__zr, i.parent = this, i;
  }, t.prototype._updatePlainTexts = function() {
    var e = this.style, i = e.font || Kr, n = e.padding, a = Xc(e), o = yS(a, e), s = _l(e), l = !!e.backgroundColor, u = o.outerHeight, f = o.outerWidth, h = o.contentWidth, v = o.lines, c = o.lineHeight, d = this._defaultStyle;
    this.isTruncated = !!o.isTruncated;
    var y = e.x || 0, p = e.y || 0, g = e.align || d.align || "left", m = e.verticalAlign || d.verticalAlign || "top", _ = y, S = Ti(p, o.contentHeight, m);
    if (s || n) {
      var w = Mn(y, f, g), b = Ti(p, u, m);
      s && this._renderBackground(e, e, w, b, f, u);
    }
    S += c / 2, n && (_ = Yc(y, g, n), m === "top" ? S += n[0] : m === "bottom" && (S -= n[2]));
    for (var x = 0, D = !1, T = Uc("fill" in e ? e.fill : (D = !0, d.fill)), C = Wc("stroke" in e ? e.stroke : !l && (!d.autoStroke || D) ? (x = Hc, d.stroke) : null), M = e.textShadowBlur > 0, L = e.width != null && (e.overflow === "truncate" || e.overflow === "break" || e.overflow === "breakAll"), P = o.calculatedLineHeight, I = 0; I < v.length; I++) {
      var E = this._getOrCreateChild(Fo), R = E.createStyle();
      E.useStyle(R), R.text = v[I], R.x = _, R.y = S, R.textAlign = g, R.textBaseline = "middle", R.opacity = e.opacity, R.strokeFirst = !0, M && (R.shadowBlur = e.textShadowBlur || 0, R.shadowColor = e.textShadowColor || "transparent", R.shadowOffsetX = e.textShadowOffsetX || 0, R.shadowOffsetY = e.textShadowOffsetY || 0), R.stroke = C, R.fill = T, C && (R.lineWidth = e.lineWidth || x, R.lineDash = e.lineDash, R.lineDashOffset = e.lineDashOffset || 0), R.font = i, Vc(R, e), S += c, L && E.setBoundingRect(new it(Mn(R.x, h, R.textAlign), Ti(R.y, P, R.textBaseline), h, P));
    }
  }, t.prototype._updateRichTexts = function() {
    var e = this.style, i = Xc(e), n = SS(i, e), a = n.width, o = n.outerWidth, s = n.outerHeight, l = e.padding, u = e.x || 0, f = e.y || 0, h = this._defaultStyle, v = e.align || h.align, c = e.verticalAlign || h.verticalAlign;
    this.isTruncated = !!n.isTruncated;
    var d = Mn(u, o, v), y = Ti(f, s, c), p = d, g = y;
    l && (p += l[3], g += l[0]);
    var m = p + a;
    _l(e) && this._renderBackground(e, e, d, y, o, s);
    for (var _ = !!e.backgroundColor, S = 0; S < n.lines.length; S++) {
      for (var w = n.lines[S], b = w.tokens, x = b.length, D = w.lineHeight, T = w.width, C = 0, M = p, L = m, P = x - 1, I = void 0; C < x && (I = b[C], !I.align || I.align === "left"); )
        this._placeToken(I, e, D, g, M, "left", _), T -= I.width, M += I.width, C++;
      for (; P >= 0 && (I = b[P], I.align === "right"); )
        this._placeToken(I, e, D, g, L, "right", _), T -= I.width, L -= I.width, P--;
      for (M += (a - (M - p) - (m - L) - T) / 2; C <= P; )
        I = b[C], this._placeToken(I, e, D, g, M + I.width / 2, "center", _), M += I.width, C++;
      g += D;
    }
  }, t.prototype._placeToken = function(e, i, n, a, o, s, l) {
    var u = i.rich[e.styleName] || {};
    u.text = e.text;
    var f = e.verticalAlign, h = a + n / 2;
    f === "top" ? h = a + e.height / 2 : f === "bottom" && (h = a + n - e.height / 2);
    var v = !e.isLineHolder && _l(u);
    v && this._renderBackground(u, i, s === "right" ? o - e.width : s === "center" ? o - e.width / 2 : o, h - e.height / 2, e.width, e.height);
    var c = !!u.backgroundColor, d = e.textPadding;
    d && (o = Yc(o, s, d), h -= e.height / 2 - d[0] - e.innerHeight / 2);
    var y = this._getOrCreateChild(Fo), p = y.createStyle();
    y.useStyle(p);
    var g = this._defaultStyle, m = !1, _ = 0, S = Uc("fill" in u ? u.fill : "fill" in i ? i.fill : (m = !0, g.fill)), w = Wc("stroke" in u ? u.stroke : "stroke" in i ? i.stroke : !c && !l && (!g.autoStroke || m) ? (_ = Hc, g.stroke) : null), b = u.textShadowBlur > 0 || i.textShadowBlur > 0;
    p.text = e.text, p.x = o, p.y = h, b && (p.shadowBlur = u.textShadowBlur || i.textShadowBlur || 0, p.shadowColor = u.textShadowColor || i.textShadowColor || "transparent", p.shadowOffsetX = u.textShadowOffsetX || i.textShadowOffsetX || 0, p.shadowOffsetY = u.textShadowOffsetY || i.textShadowOffsetY || 0), p.textAlign = s, p.textBaseline = "middle", p.font = e.font || Kr, p.opacity = co(u.opacity, i.opacity, 1), Vc(p, u), w && (p.lineWidth = co(u.lineWidth, i.lineWidth, _), p.lineDash = X(u.lineDash, i.lineDash), p.lineDashOffset = i.lineDashOffset || 0, p.stroke = w), S && (p.fill = S);
    var x = e.contentWidth, D = e.contentHeight;
    y.setBoundingRect(new it(Mn(p.x, x, p.textAlign), Ti(p.y, D, p.textBaseline), x, D));
  }, t.prototype._renderBackground = function(e, i, n, a, o, s) {
    var l = e.backgroundColor, u = e.borderWidth, f = e.borderColor, h = l && l.image, v = l && !h, c = e.borderRadius, d = this, y, p;
    if (v || e.lineHeight || u && f) {
      y = this._getOrCreateChild(Lt), y.useStyle(y.createStyle()), y.style.fill = null;
      var g = y.shape;
      g.x = n, g.y = a, g.width = o, g.height = s, g.r = c, y.dirtyShape();
    }
    if (v) {
      var m = y.style;
      m.fill = l || null, m.fillOpacity = X(e.fillOpacity, 1);
    } else if (h) {
      p = this._getOrCreateChild(gr), p.onload = function() {
        d.dirtyStyle();
      };
      var _ = p.style;
      _.image = l.image, _.x = n, _.y = a, _.width = o, _.height = s;
    }
    if (u && f) {
      var m = y.style;
      m.lineWidth = u, m.stroke = f, m.strokeOpacity = X(e.strokeOpacity, 1), m.lineDash = e.borderDash, m.lineDashOffset = e.borderDashOffset || 0, y.strokeContainThreshold = 0, y.hasFill() && y.hasStroke() && (m.strokeFirst = !0, m.lineWidth *= 2);
    }
    var S = (y || p).style;
    S.shadowBlur = e.shadowBlur || 0, S.shadowColor = e.shadowColor || "transparent", S.shadowOffsetX = e.shadowOffsetX || 0, S.shadowOffsetY = e.shadowOffsetY || 0, S.opacity = co(e.opacity, i.opacity, 1);
  }, t.makeFont = function(e) {
    var i = "";
    return JS(e) && (i = [
      e.fontStyle,
      e.fontWeight,
      QS(e.fontSize),
      e.fontFamily || "sans-serif"
    ].join(" ")), i && Me(i) || e.textFont || e.font;
  }, t;
})(ma), KS = { left: !0, right: 1, center: 1 }, jS = { top: 1, bottom: 1, middle: 1 }, $c = ["fontStyle", "fontWeight", "fontSize", "fontFamily"];
function QS(r) {
  return typeof r == "string" && (r.indexOf("px") !== -1 || r.indexOf("rem") !== -1 || r.indexOf("em") !== -1) ? r : isNaN(+r) ? Cf + "px" : r + "px";
}
function Vc(r, t) {
  for (var e = 0; e < $c.length; e++) {
    var i = $c[e], n = t[i];
    n != null && (r[i] = n);
  }
}
function JS(r) {
  return r.fontSize != null || r.fontFamily || r.fontWeight;
}
function tb(r) {
  return Gc(r), A(r.rich, Gc), r;
}
function Gc(r) {
  if (r) {
    r.font = Zt.makeFont(r);
    var t = r.align;
    t === "middle" && (t = "center"), r.align = t == null || KS[t] ? t : "left";
    var e = r.verticalAlign;
    e === "center" && (e = "middle"), r.verticalAlign = e == null || jS[e] ? e : "top";
    var i = r.padding;
    i && (r.padding = Zp(r.padding));
  }
}
function Wc(r, t) {
  return r == null || t <= 0 || r === "transparent" || r === "none" ? null : r.image || r.colorStops ? "#000" : r;
}
function Uc(r) {
  return r == null || r === "none" ? null : r.image || r.colorStops ? "#000" : r;
}
function Yc(r, t, e) {
  return t === "right" ? r - e[1] : t === "center" ? r + e[3] / 2 - e[1] / 2 : r + e[3];
}
function Xc(r) {
  var t = r.text;
  return t != null && (t += ""), t;
}
function _l(r) {
  return !!(r.backgroundColor || r.lineHeight || r.borderWidth && r.borderColor);
}
var et = mt(), eb = function(r, t, e, i) {
  if (i) {
    var n = et(i);
    n.dataIndex = e, n.dataType = t, n.seriesIndex = r, n.ssrType = "chart", i.type === "group" && i.traverse(function(a) {
      var o = et(a);
      o.seriesIndex = r, o.dataIndex = e, o.dataType = t, o.ssrType = "chart";
    });
  }
}, Zc = 1, qc = {}, Ng = mt(), Gf = mt(), Wf = 0, us = 1, fs = 2, fe = ["emphasis", "blur", "select"], Kc = ["normal", "emphasis", "blur", "select"], rb = 10, ib = 9, Xr = "highlight", So = "downplay", Fn = "select", bo = "unselect", zn = "toggleSelect";
function ci(r) {
  return r != null && r !== "none";
}
function hs(r, t, e) {
  r.onHoverStateChange && (r.hoverState || 0) !== e && r.onHoverStateChange(t), r.hoverState = e;
}
function Bg(r) {
  hs(r, "emphasis", fs);
}
function Fg(r) {
  r.hoverState === fs && hs(r, "normal", Wf);
}
function Uf(r) {
  hs(r, "blur", us);
}
function zg(r) {
  r.hoverState === us && hs(r, "normal", Wf);
}
function nb(r) {
  r.selected = !0;
}
function ab(r) {
  r.selected = !1;
}
function jc(r, t, e) {
  t(r, e);
}
function Ue(r, t, e) {
  jc(r, t, e), r.isGroup && r.traverse(function(i) {
    jc(i, t, e);
  });
}
function Qc(r, t) {
  switch (t) {
    case "emphasis":
      r.hoverState = fs;
      break;
    case "normal":
      r.hoverState = Wf;
      break;
    case "blur":
      r.hoverState = us;
      break;
    case "select":
      r.selected = !0;
  }
}
function ob(r, t, e, i) {
  for (var n = r.style, a = {}, o = 0; o < t.length; o++) {
    var s = t[o], l = n[s];
    a[s] = l ?? (i && i[s]);
  }
  for (var o = 0; o < r.animators.length; o++) {
    var u = r.animators[o];
    u.__fromStateTransition && u.__fromStateTransition.indexOf(e) < 0 && u.targetName === "style" && u.saveTo(a, t);
  }
  return a;
}
function sb(r, t, e, i) {
  var n = e && rt(e, "select") >= 0, a = !1;
  if (r instanceof st) {
    var o = Ng(r), s = n && o.selectFill || o.normalFill, l = n && o.selectStroke || o.normalStroke;
    if (ci(s) || ci(l)) {
      i = i || {};
      var u = i.style || {};
      u.fill === "inherit" ? (a = !0, i = k({}, i), u = k({}, u), u.fill = s) : !ci(u.fill) && ci(s) ? (a = !0, i = k({}, i), u = k({}, u), u.fill = pc(s)) : !ci(u.stroke) && ci(l) && (a || (i = k({}, i), u = k({}, u)), u.stroke = pc(l)), i.style = u;
    }
  }
  if (i && i.z2 == null) {
    a || (i = k({}, i));
    var f = r.z2EmphasisLift;
    i.z2 = r.z2 + (f ?? rb);
  }
  return i;
}
function lb(r, t, e) {
  if (e && e.z2 == null) {
    e = k({}, e);
    var i = r.z2SelectLift;
    e.z2 = r.z2 + (i ?? ib);
  }
  return e;
}
function ub(r, t, e) {
  var i = rt(r.currentStates, t) >= 0, n = r.style.opacity, a = i ? null : ob(r, ["opacity"], t, {
    opacity: 1
  });
  e = e || {};
  var o = e.style || {};
  return o.opacity == null && (e = k({}, e), o = k({
    // Already being applied 'emphasis'. DON'T mul opacity multiple times.
    opacity: i ? n : a.opacity * 0.1
  }, o), e.style = o), e;
}
function Sl(r, t) {
  var e = this.states[r];
  if (this.style) {
    if (r === "emphasis")
      return sb(this, r, t, e);
    if (r === "blur")
      return ub(this, r, e);
    if (r === "select")
      return lb(this, r, e);
  }
  return e;
}
function fb(r) {
  r.stateProxy = Sl;
  var t = r.getTextContent(), e = r.getTextGuideLine();
  t && (t.stateProxy = Sl), e && (e.stateProxy = Sl);
}
function Jc(r, t) {
  !Gg(r, t) && !r.__highByOuter && Ue(r, Bg);
}
function tv(r, t) {
  !Gg(r, t) && !r.__highByOuter && Ue(r, Fg);
}
function ia(r, t) {
  r.__highByOuter |= 1 << (t || 0), Ue(r, Bg);
}
function na(r, t) {
  !(r.__highByOuter &= ~(1 << (t || 0))) && Ue(r, Fg);
}
function Hg(r) {
  Ue(r, Uf);
}
function Yf(r) {
  Ue(r, zg);
}
function $g(r) {
  Ue(r, nb);
}
function Vg(r) {
  Ue(r, ab);
}
function Gg(r, t) {
  return r.__highDownSilentOnTouch && t.zrByTouch;
}
function Wg(r) {
  var t = r.getModel(), e = [], i = [];
  t.eachComponent(function(n, a) {
    var o = Gf(a), s = n === "series", l = s ? r.getViewOfSeriesModel(a) : r.getViewOfComponentModel(a);
    !s && i.push(l), o.isBlured && (l.group.traverse(function(u) {
      zg(u);
    }), s && e.push(a)), o.isBlured = !1;
  }), A(i, function(n) {
    n && n.toggleBlurSeries && n.toggleBlurSeries(e, !1, t);
  });
}
function Ru(r, t, e, i) {
  var n = i.getModel();
  e = e || "coordinateSystem";
  function a(u, f) {
    for (var h = 0; h < f.length; h++) {
      var v = u.getItemGraphicEl(f[h]);
      v && Yf(v);
    }
  }
  if (r != null && !(!t || t === "none")) {
    var o = n.getSeriesByIndex(r), s = o.coordinateSystem;
    s && s.master && (s = s.master);
    var l = [];
    n.eachSeries(function(u) {
      var f = o === u, h = u.coordinateSystem;
      h && h.master && (h = h.master);
      var v = h && s ? h === s : f;
      if (!// Not blur other series if blurScope series
      (e === "series" && !f || e === "coordinateSystem" && !v || t === "series" && f)) {
        var c = i.getViewOfSeriesModel(u);
        if (c.group.traverse(function(p) {
          p.__highByOuter && f && t === "self" || Uf(p);
        }), Yt(t))
          a(u.getData(), t);
        else if (W(t))
          for (var d = pt(t), y = 0; y < d.length; y++)
            a(u.getData(d[y]), t[d[y]]);
        l.push(u), Gf(u).isBlured = !0;
      }
    }), n.eachComponent(function(u, f) {
      if (u !== "series") {
        var h = i.getViewOfComponentModel(f);
        h && h.toggleBlurSeries && h.toggleBlurSeries(l, !0, n);
      }
    });
  }
}
function ku(r, t, e) {
  if (!(r == null || t == null)) {
    var i = e.getModel().getComponent(r, t);
    if (i) {
      Gf(i).isBlured = !0;
      var n = e.getViewOfComponentModel(i);
      !n || !n.focusBlurEnabled || n.group.traverse(function(a) {
        Uf(a);
      });
    }
  }
}
function hb(r, t, e) {
  var i = r.seriesIndex, n = r.getData(t.dataType);
  if (n) {
    var a = Jr(n, t);
    a = (N(a) ? a[0] : a) || 0;
    var o = n.getItemGraphicEl(a);
    if (!o)
      for (var s = n.count(), l = 0; !o && l < s; )
        o = n.getItemGraphicEl(l++);
    if (o) {
      var u = et(o);
      Ru(i, u.focus, u.blurScope, e);
    } else {
      var f = r.get(["emphasis", "focus"]), h = r.get(["emphasis", "blurScope"]);
      f != null && Ru(i, f, h, e);
    }
  }
}
function Xf(r, t, e, i) {
  var n = {
    focusSelf: !1,
    dispatchers: null
  };
  if (r == null || r === "series" || t == null || e == null)
    return n;
  var a = i.getModel().getComponent(r, t);
  if (!a)
    return n;
  var o = i.getViewOfComponentModel(a);
  if (!o || !o.findHighDownDispatchers)
    return n;
  for (var s = o.findHighDownDispatchers(e), l, u = 0; u < s.length; u++)
    if (et(s[u]).focus === "self") {
      l = !0;
      break;
    }
  return {
    focusSelf: l,
    dispatchers: s
  };
}
function cb(r, t, e) {
  var i = et(r), n = Xf(i.componentMainType, i.componentIndex, i.componentHighDownName, e), a = n.dispatchers, o = n.focusSelf;
  a ? (o && ku(i.componentMainType, i.componentIndex, e), A(a, function(s) {
    return Jc(s, t);
  })) : (Ru(i.seriesIndex, i.focus, i.blurScope, e), i.focus === "self" && ku(i.componentMainType, i.componentIndex, e), Jc(r, t));
}
function vb(r, t, e) {
  Wg(e);
  var i = et(r), n = Xf(i.componentMainType, i.componentIndex, i.componentHighDownName, e).dispatchers;
  n ? A(n, function(a) {
    return tv(a, t);
  }) : tv(r, t);
}
function db(r, t, e) {
  if (Bu(t)) {
    var i = t.dataType, n = r.getData(i), a = Jr(n, t);
    N(a) || (a = [a]), r[t.type === zn ? "toggleSelect" : t.type === Fn ? "select" : "unselect"](a, i);
  }
}
function ev(r) {
  var t = r.getAllData();
  A(t, function(e) {
    var i = e.data, n = e.type;
    i.eachItemGraphicEl(function(a, o) {
      r.isSelected(o, n) ? $g(a) : Vg(a);
    });
  });
}
function pb(r) {
  var t = [];
  return r.eachSeries(function(e) {
    var i = e.getAllData();
    A(i, function(n) {
      n.data;
      var a = n.type, o = e.getSelectedDataIndices();
      if (o.length > 0) {
        var s = {
          dataIndex: o,
          seriesIndex: e.seriesIndex
        };
        a != null && (s.dataType = a), t.push(s);
      }
    });
  }), t;
}
function Ou(r, t, e) {
  Ug(r, !0), Ue(r, fb), yb(r, t, e);
}
function gb(r) {
  Ug(r, !1);
}
function zo(r, t, e, i) {
  i ? gb(r) : Ou(r, t, e);
}
function yb(r, t, e) {
  var i = et(r);
  t != null ? (i.focus = t, i.blurScope = e) : i.focus && (i.focus = null);
}
var rv = ["emphasis", "blur", "select"], mb = {
  itemStyle: "getItemStyle",
  lineStyle: "getLineStyle",
  areaStyle: "getAreaStyle"
};
function iv(r, t, e, i) {
  e = e || "itemStyle";
  for (var n = 0; n < rv.length; n++) {
    var a = rv[n], o = t.getModel([a, e]), s = r.ensureState(a);
    s.style = o[mb[e]]();
  }
}
function Ug(r, t) {
  var e = t === !1, i = r;
  r.highDownSilentOnTouch && (i.__highDownSilentOnTouch = r.highDownSilentOnTouch), (!e || i.__highDownDispatcher) && (i.__highByOuter = i.__highByOuter || 0, i.__highDownDispatcher = !e);
}
function Nu(r) {
  return !!(r && r.__highDownDispatcher);
}
function _b(r) {
  var t = qc[r];
  return t == null && Zc <= 32 && (t = qc[r] = Zc++), t;
}
function Bu(r) {
  var t = r.type;
  return t === Fn || t === bo || t === zn;
}
function nv(r) {
  var t = r.type;
  return t === Xr || t === So;
}
function Sb(r) {
  var t = Ng(r);
  t.normalFill = r.style.fill, t.normalStroke = r.style.stroke;
  var e = r.states.select || {};
  t.selectFill = e.style && e.style.fill || null, t.selectStroke = e.style && e.style.stroke || null;
}
var vi = ti.CMD, bb = [[], [], []], av = Math.sqrt, wb = Math.atan2;
function xb(r, t) {
  if (t) {
    var e = r.data, i = r.len(), n, a, o, s, l, u, f = vi.M, h = vi.C, v = vi.L, c = vi.R, d = vi.A, y = vi.Q;
    for (o = 0, s = 0; o < i; ) {
      switch (n = e[o++], s = o, a = 0, n) {
        case f:
          a = 1;
          break;
        case v:
          a = 1;
          break;
        case h:
          a = 3;
          break;
        case y:
          a = 2;
          break;
        case d:
          var p = t[4], g = t[5], m = av(t[0] * t[0] + t[1] * t[1]), _ = av(t[2] * t[2] + t[3] * t[3]), S = wb(-t[1] / _, t[0] / m);
          e[o] *= m, e[o++] += p, e[o] *= _, e[o++] += g, e[o++] *= m, e[o++] *= _, e[o++] += S, e[o++] += S, o += 2, s = o;
          break;
        case c:
          u[0] = e[o++], u[1] = e[o++], ue(u, u, t), e[s++] = u[0], e[s++] = u[1], u[0] += e[o++], u[1] += e[o++], ue(u, u, t), e[s++] = u[0], e[s++] = u[1];
      }
      for (l = 0; l < a; l++) {
        var w = bb[l];
        w[0] = e[o++], w[1] = e[o++], ue(w, w, t), e[s++] = w[0], e[s++] = w[1];
      }
    }
    r.increaseVersion();
  }
}
var bl = Math.sqrt, Na = Math.sin, Ba = Math.cos, fn = Math.PI;
function ov(r) {
  return Math.sqrt(r[0] * r[0] + r[1] * r[1]);
}
function Fu(r, t) {
  return (r[0] * t[0] + r[1] * t[1]) / (ov(r) * ov(t));
}
function sv(r, t) {
  return (r[0] * t[1] < r[1] * t[0] ? -1 : 1) * Math.acos(Fu(r, t));
}
function lv(r, t, e, i, n, a, o, s, l, u, f) {
  var h = l * (fn / 180), v = Ba(h) * (r - e) / 2 + Na(h) * (t - i) / 2, c = -1 * Na(h) * (r - e) / 2 + Ba(h) * (t - i) / 2, d = v * v / (o * o) + c * c / (s * s);
  d > 1 && (o *= bl(d), s *= bl(d));
  var y = (n === a ? -1 : 1) * bl((o * o * (s * s) - o * o * (c * c) - s * s * (v * v)) / (o * o * (c * c) + s * s * (v * v))) || 0, p = y * o * c / s, g = y * -s * v / o, m = (r + e) / 2 + Ba(h) * p - Na(h) * g, _ = (t + i) / 2 + Na(h) * p + Ba(h) * g, S = sv([1, 0], [(v - p) / o, (c - g) / s]), w = [(v - p) / o, (c - g) / s], b = [(-1 * v - p) / o, (-1 * c - g) / s], x = sv(w, b);
  if (Fu(w, b) <= -1 && (x = fn), Fu(w, b) >= 1 && (x = 0), x < 0) {
    var D = Math.round(x / fn * 1e6) / 1e6;
    x = fn * 2 + D % 2 * fn;
  }
  f.addData(u, m, _, o, s, S, x, h, a);
}
var Tb = /([mlvhzcqtsa])([^mlvhzcqtsa]*)/ig, Cb = /-?([0-9]*\.)?[0-9]+([eE]-?[0-9]+)?/g;
function Mb(r) {
  var t = new ti();
  if (!r)
    return t;
  var e = 0, i = 0, n = e, a = i, o, s = ti.CMD, l = r.match(Tb);
  if (!l)
    return t;
  for (var u = 0; u < l.length; u++) {
    for (var f = l[u], h = f.charAt(0), v = void 0, c = f.match(Cb) || [], d = c.length, y = 0; y < d; y++)
      c[y] = parseFloat(c[y]);
    for (var p = 0; p < d; ) {
      var g = void 0, m = void 0, _ = void 0, S = void 0, w = void 0, b = void 0, x = void 0, D = e, T = i, C = void 0, M = void 0;
      switch (h) {
        case "l":
          e += c[p++], i += c[p++], v = s.L, t.addData(v, e, i);
          break;
        case "L":
          e = c[p++], i = c[p++], v = s.L, t.addData(v, e, i);
          break;
        case "m":
          e += c[p++], i += c[p++], v = s.M, t.addData(v, e, i), n = e, a = i, h = "l";
          break;
        case "M":
          e = c[p++], i = c[p++], v = s.M, t.addData(v, e, i), n = e, a = i, h = "L";
          break;
        case "h":
          e += c[p++], v = s.L, t.addData(v, e, i);
          break;
        case "H":
          e = c[p++], v = s.L, t.addData(v, e, i);
          break;
        case "v":
          i += c[p++], v = s.L, t.addData(v, e, i);
          break;
        case "V":
          i = c[p++], v = s.L, t.addData(v, e, i);
          break;
        case "C":
          v = s.C, t.addData(v, c[p++], c[p++], c[p++], c[p++], c[p++], c[p++]), e = c[p - 2], i = c[p - 1];
          break;
        case "c":
          v = s.C, t.addData(v, c[p++] + e, c[p++] + i, c[p++] + e, c[p++] + i, c[p++] + e, c[p++] + i), e += c[p - 2], i += c[p - 1];
          break;
        case "S":
          g = e, m = i, C = t.len(), M = t.data, o === s.C && (g += e - M[C - 4], m += i - M[C - 3]), v = s.C, D = c[p++], T = c[p++], e = c[p++], i = c[p++], t.addData(v, g, m, D, T, e, i);
          break;
        case "s":
          g = e, m = i, C = t.len(), M = t.data, o === s.C && (g += e - M[C - 4], m += i - M[C - 3]), v = s.C, D = e + c[p++], T = i + c[p++], e += c[p++], i += c[p++], t.addData(v, g, m, D, T, e, i);
          break;
        case "Q":
          D = c[p++], T = c[p++], e = c[p++], i = c[p++], v = s.Q, t.addData(v, D, T, e, i);
          break;
        case "q":
          D = c[p++] + e, T = c[p++] + i, e += c[p++], i += c[p++], v = s.Q, t.addData(v, D, T, e, i);
          break;
        case "T":
          g = e, m = i, C = t.len(), M = t.data, o === s.Q && (g += e - M[C - 4], m += i - M[C - 3]), e = c[p++], i = c[p++], v = s.Q, t.addData(v, g, m, e, i);
          break;
        case "t":
          g = e, m = i, C = t.len(), M = t.data, o === s.Q && (g += e - M[C - 4], m += i - M[C - 3]), e += c[p++], i += c[p++], v = s.Q, t.addData(v, g, m, e, i);
          break;
        case "A":
          _ = c[p++], S = c[p++], w = c[p++], b = c[p++], x = c[p++], D = e, T = i, e = c[p++], i = c[p++], v = s.A, lv(D, T, e, i, b, x, _, S, w, v, t);
          break;
        case "a":
          _ = c[p++], S = c[p++], w = c[p++], b = c[p++], x = c[p++], D = e, T = i, e += c[p++], i += c[p++], v = s.A, lv(D, T, e, i, b, x, _, S, w, v, t);
          break;
      }
    }
    (h === "z" || h === "Z") && (v = s.Z, t.addData(v), e = n, i = a), o = v;
  }
  return t.toStatic(), t;
}
var Yg = (function(r) {
  O(t, r);
  function t() {
    return r !== null && r.apply(this, arguments) || this;
  }
  return t.prototype.applyTransform = function(e) {
  }, t;
})(st);
function Xg(r) {
  return r.setData != null;
}
function Zg(r, t) {
  var e = Mb(r), i = k({}, t);
  return i.buildPath = function(n) {
    if (Xg(n)) {
      n.setData(e.data);
      var a = n.getContext();
      a && n.rebuildPath(a, 1);
    } else {
      var a = n;
      e.rebuildPath(a, 1);
    }
  }, i.applyTransform = function(n) {
    xb(e, n), this.dirtyShape();
  }, i;
}
function Db(r, t) {
  return new Yg(Zg(r, t));
}
function Ab(r, t) {
  var e = Zg(r, t), i = (function(n) {
    O(a, n);
    function a(o) {
      var s = n.call(this, o) || this;
      return s.applyTransform = e.applyTransform, s.buildPath = e.buildPath, s;
    }
    return a;
  })(Yg);
  return i;
}
function Lb(r, t) {
  for (var e = [], i = r.length, n = 0; n < i; n++) {
    var a = r[n];
    e.push(a.getUpdatedPathProxy(!0));
  }
  var o = new st(t);
  return o.createPathProxy(), o.buildPath = function(s) {
    if (Xg(s)) {
      s.appendPath(e);
      var l = s.getContext();
      l && s.rebuildPath(l, 1);
    }
  }, o;
}
var Pb = /* @__PURE__ */ (function() {
  function r() {
    this.cx = 0, this.cy = 0, this.r = 0;
  }
  return r;
})(), cs = (function(r) {
  O(t, r);
  function t(e) {
    return r.call(this, e) || this;
  }
  return t.prototype.getDefaultShape = function() {
    return new Pb();
  }, t.prototype.buildPath = function(e, i) {
    e.moveTo(i.cx + i.r, i.cy), e.arc(i.cx, i.cy, i.r, 0, Math.PI * 2);
  }, t;
})(st);
cs.prototype.type = "circle";
var Ib = /* @__PURE__ */ (function() {
  function r() {
    this.cx = 0, this.cy = 0, this.rx = 0, this.ry = 0;
  }
  return r;
})(), Zf = (function(r) {
  O(t, r);
  function t(e) {
    return r.call(this, e) || this;
  }
  return t.prototype.getDefaultShape = function() {
    return new Ib();
  }, t.prototype.buildPath = function(e, i) {
    var n = 0.5522848, a = i.cx, o = i.cy, s = i.rx, l = i.ry, u = s * n, f = l * n;
    e.moveTo(a - s, o), e.bezierCurveTo(a - s, o - f, a - u, o - l, a, o - l), e.bezierCurveTo(a + u, o - l, a + s, o - f, a + s, o), e.bezierCurveTo(a + s, o + f, a + u, o + l, a, o + l), e.bezierCurveTo(a - u, o + l, a - s, o + f, a - s, o), e.closePath();
  }, t;
})(st);
Zf.prototype.type = "ellipse";
var qg = Math.PI, wl = qg * 2, Er = Math.sin, di = Math.cos, Eb = Math.acos, Pt = Math.atan2, uv = Math.abs, Hn = Math.sqrt, Dn = Math.max, Te = Math.min, de = 1e-4;
function Rb(r, t, e, i, n, a, o, s) {
  var l = e - r, u = i - t, f = o - n, h = s - a, v = h * l - f * u;
  if (!(v * v < de))
    return v = (f * (t - a) - h * (r - n)) / v, [r + v * l, t + v * u];
}
function Fa(r, t, e, i, n, a, o) {
  var s = r - e, l = t - i, u = (o ? a : -a) / Hn(s * s + l * l), f = u * l, h = -u * s, v = r + f, c = t + h, d = e + f, y = i + h, p = (v + d) / 2, g = (c + y) / 2, m = d - v, _ = y - c, S = m * m + _ * _, w = n - a, b = v * y - d * c, x = (_ < 0 ? -1 : 1) * Hn(Dn(0, w * w * S - b * b)), D = (b * _ - m * x) / S, T = (-b * m - _ * x) / S, C = (b * _ + m * x) / S, M = (-b * m + _ * x) / S, L = D - p, P = T - g, I = C - p, E = M - g;
  return L * L + P * P > I * I + E * E && (D = C, T = M), {
    cx: D,
    cy: T,
    x0: -f,
    y0: -h,
    x1: D * (n / w - 1),
    y1: T * (n / w - 1)
  };
}
function kb(r) {
  var t;
  if (N(r)) {
    var e = r.length;
    if (!e)
      return r;
    e === 1 ? t = [r[0], r[0], 0, 0] : e === 2 ? t = [r[0], r[0], r[1], r[1]] : e === 3 ? t = r.concat(r[2]) : t = r;
  } else
    t = [r, r, r, r];
  return t;
}
function Ob(r, t) {
  var e, i = Dn(t.r, 0), n = Dn(t.r0 || 0, 0), a = i > 0, o = n > 0;
  if (!(!a && !o)) {
    if (a || (i = n, n = 0), n > i) {
      var s = i;
      i = n, n = s;
    }
    var l = t.startAngle, u = t.endAngle;
    if (!(isNaN(l) || isNaN(u))) {
      var f = t.cx, h = t.cy, v = !!t.clockwise, c = uv(u - l), d = c > wl && c % wl;
      if (d > de && (c = d), !(i > de))
        r.moveTo(f, h);
      else if (c > wl - de)
        r.moveTo(f + i * di(l), h + i * Er(l)), r.arc(f, h, i, l, u, !v), n > de && (r.moveTo(f + n * di(u), h + n * Er(u)), r.arc(f, h, n, u, l, v));
      else {
        var y = void 0, p = void 0, g = void 0, m = void 0, _ = void 0, S = void 0, w = void 0, b = void 0, x = void 0, D = void 0, T = void 0, C = void 0, M = void 0, L = void 0, P = void 0, I = void 0, E = i * di(l), R = i * Er(l), V = n * di(u), B = n * Er(u), F = c > de;
        if (F) {
          var $ = t.cornerRadius;
          $ && (e = kb($), y = e[0], p = e[1], g = e[2], m = e[3]);
          var J = uv(i - n) / 2;
          if (_ = Te(J, g), S = Te(J, m), w = Te(J, y), b = Te(J, p), T = x = Dn(_, S), C = D = Dn(w, b), (x > de || D > de) && (M = i * di(u), L = i * Er(u), P = n * di(l), I = n * Er(l), c < qg)) {
            var j = Rb(E, R, P, I, M, L, V, B);
            if (j) {
              var lt = E - j[0], ft = R - j[1], ct = M - j[0], Nt = L - j[1], Bt = 1 / Er(Eb((lt * ct + ft * Nt) / (Hn(lt * lt + ft * ft) * Hn(ct * ct + Nt * Nt))) / 2), _t = Hn(j[0] * j[0] + j[1] * j[1]);
              T = Te(x, (i - _t) / (Bt + 1)), C = Te(D, (n - _t) / (Bt - 1));
            }
          }
        }
        if (!F)
          r.moveTo(f + E, h + R);
        else if (T > de) {
          var St = Te(g, T), nt = Te(m, T), Y = Fa(P, I, E, R, i, St, v), q = Fa(M, L, V, B, i, nt, v);
          r.moveTo(f + Y.cx + Y.x0, h + Y.cy + Y.y0), T < x && St === nt ? r.arc(f + Y.cx, h + Y.cy, T, Pt(Y.y0, Y.x0), Pt(q.y0, q.x0), !v) : (St > 0 && r.arc(f + Y.cx, h + Y.cy, St, Pt(Y.y0, Y.x0), Pt(Y.y1, Y.x1), !v), r.arc(f, h, i, Pt(Y.cy + Y.y1, Y.cx + Y.x1), Pt(q.cy + q.y1, q.cx + q.x1), !v), nt > 0 && r.arc(f + q.cx, h + q.cy, nt, Pt(q.y1, q.x1), Pt(q.y0, q.x0), !v));
        } else
          r.moveTo(f + E, h + R), r.arc(f, h, i, l, u, !v);
        if (!(n > de) || !F)
          r.lineTo(f + V, h + B);
        else if (C > de) {
          var St = Te(y, C), nt = Te(p, C), Y = Fa(V, B, M, L, n, -nt, v), q = Fa(E, R, P, I, n, -St, v);
          r.lineTo(f + Y.cx + Y.x0, h + Y.cy + Y.y0), C < D && St === nt ? r.arc(f + Y.cx, h + Y.cy, C, Pt(Y.y0, Y.x0), Pt(q.y0, q.x0), !v) : (nt > 0 && r.arc(f + Y.cx, h + Y.cy, nt, Pt(Y.y0, Y.x0), Pt(Y.y1, Y.x1), !v), r.arc(f, h, n, Pt(Y.cy + Y.y1, Y.cx + Y.x1), Pt(q.cy + q.y1, q.cx + q.x1), v), St > 0 && r.arc(f + q.cx, h + q.cy, St, Pt(q.y1, q.x1), Pt(q.y0, q.x0), !v));
        } else
          r.lineTo(f + V, h + B), r.arc(f, h, n, u, l, v);
      }
      r.closePath();
    }
  }
}
var Nb = /* @__PURE__ */ (function() {
  function r() {
    this.cx = 0, this.cy = 0, this.r0 = 0, this.r = 0, this.startAngle = 0, this.endAngle = Math.PI * 2, this.clockwise = !0, this.cornerRadius = 0;
  }
  return r;
})(), vs = (function(r) {
  O(t, r);
  function t(e) {
    return r.call(this, e) || this;
  }
  return t.prototype.getDefaultShape = function() {
    return new Nb();
  }, t.prototype.buildPath = function(e, i) {
    Ob(e, i);
  }, t.prototype.isZeroArea = function() {
    return this.shape.startAngle === this.shape.endAngle || this.shape.r === this.shape.r0;
  }, t;
})(st);
vs.prototype.type = "sector";
var Bb = /* @__PURE__ */ (function() {
  function r() {
    this.cx = 0, this.cy = 0, this.r = 0, this.r0 = 0;
  }
  return r;
})(), qf = (function(r) {
  O(t, r);
  function t(e) {
    return r.call(this, e) || this;
  }
  return t.prototype.getDefaultShape = function() {
    return new Bb();
  }, t.prototype.buildPath = function(e, i) {
    var n = i.cx, a = i.cy, o = Math.PI * 2;
    e.moveTo(n + i.r, a), e.arc(n, a, i.r, 0, o, !1), e.moveTo(n + i.r0, a), e.arc(n, a, i.r0, 0, o, !0);
  }, t;
})(st);
qf.prototype.type = "ring";
function Fb(r, t, e, i) {
  var n = [], a = [], o = [], s = [], l, u, f, h;
  if (i) {
    f = [1 / 0, 1 / 0], h = [-1 / 0, -1 / 0];
    for (var v = 0, c = r.length; v < c; v++)
      Ci(f, f, r[v]), Mi(h, h, r[v]);
    Ci(f, f, i[0]), Mi(h, h, i[1]);
  }
  for (var v = 0, c = r.length; v < c; v++) {
    var d = r[v];
    if (e)
      l = r[v ? v - 1 : c - 1], u = r[(v + 1) % c];
    else if (v === 0 || v === c - 1) {
      n.push(x0(r[v]));
      continue;
    } else
      l = r[v - 1], u = r[v + 1];
    Qp(a, u, l), Hs(a, a, t);
    var y = du(d, l), p = du(d, u), g = y + p;
    g !== 0 && (y /= g, p /= g), Hs(o, a, -y), Hs(s, a, p);
    var m = Qh([], d, o), _ = Qh([], d, s);
    i && (Mi(m, m, f), Ci(m, m, h), Mi(_, _, f), Ci(_, _, h)), n.push(m), n.push(_);
  }
  return e && n.push(n.shift()), n;
}
function Kg(r, t, e) {
  var i = t.smooth, n = t.points;
  if (n && n.length >= 2) {
    if (i) {
      var a = Fb(n, i, e, t.smoothConstraint);
      r.moveTo(n[0][0], n[0][1]);
      for (var o = n.length, s = 0; s < (e ? o : o - 1); s++) {
        var l = a[s * 2], u = a[s * 2 + 1], f = n[(s + 1) % o];
        r.bezierCurveTo(l[0], l[1], u[0], u[1], f[0], f[1]);
      }
    } else {
      r.moveTo(n[0][0], n[0][1]);
      for (var s = 1, h = n.length; s < h; s++)
        r.lineTo(n[s][0], n[s][1]);
    }
    e && r.closePath();
  }
}
var zb = /* @__PURE__ */ (function() {
  function r() {
    this.points = null, this.smooth = 0, this.smoothConstraint = null;
  }
  return r;
})(), Kf = (function(r) {
  O(t, r);
  function t(e) {
    return r.call(this, e) || this;
  }
  return t.prototype.getDefaultShape = function() {
    return new zb();
  }, t.prototype.buildPath = function(e, i) {
    Kg(e, i, !0);
  }, t;
})(st);
Kf.prototype.type = "polygon";
var Hb = /* @__PURE__ */ (function() {
  function r() {
    this.points = null, this.percent = 1, this.smooth = 0, this.smoothConstraint = null;
  }
  return r;
})(), jf = (function(r) {
  O(t, r);
  function t(e) {
    return r.call(this, e) || this;
  }
  return t.prototype.getDefaultStyle = function() {
    return {
      stroke: "#000",
      fill: null
    };
  }, t.prototype.getDefaultShape = function() {
    return new Hb();
  }, t.prototype.buildPath = function(e, i) {
    Kg(e, i, !1);
  }, t;
})(st);
jf.prototype.type = "polyline";
var $b = {}, Vb = /* @__PURE__ */ (function() {
  function r() {
    this.x1 = 0, this.y1 = 0, this.x2 = 0, this.y2 = 0, this.percent = 1;
  }
  return r;
})(), Ge = (function(r) {
  O(t, r);
  function t(e) {
    return r.call(this, e) || this;
  }
  return t.prototype.getDefaultStyle = function() {
    return {
      stroke: "#000",
      fill: null
    };
  }, t.prototype.getDefaultShape = function() {
    return new Vb();
  }, t.prototype.buildPath = function(e, i) {
    var n, a, o, s;
    if (this.subPixelOptimize) {
      var l = kg($b, i, this.style);
      n = l.x1, a = l.y1, o = l.x2, s = l.y2;
    } else
      n = i.x1, a = i.y1, o = i.x2, s = i.y2;
    var u = i.percent;
    u !== 0 && (e.moveTo(n, a), u < 1 && (o = n * (1 - u) + o * u, s = a * (1 - u) + s * u), e.lineTo(o, s));
  }, t.prototype.pointAt = function(e) {
    var i = this.shape;
    return [
      i.x1 * (1 - e) + i.x2 * e,
      i.y1 * (1 - e) + i.y2 * e
    ];
  }, t;
})(st);
Ge.prototype.type = "line";
var Ft = [], Gb = /* @__PURE__ */ (function() {
  function r() {
    this.x1 = 0, this.y1 = 0, this.x2 = 0, this.y2 = 0, this.cpx1 = 0, this.cpy1 = 0, this.percent = 1;
  }
  return r;
})();
function fv(r, t, e) {
  var i = r.cpx2, n = r.cpy2;
  return i != null || n != null ? [
    (e ? uc : At)(r.x1, r.cpx1, r.cpx2, r.x2, t),
    (e ? uc : At)(r.y1, r.cpy1, r.cpy2, r.y2, t)
  ] : [
    (e ? fc : Vt)(r.x1, r.cpx1, r.x2, t),
    (e ? fc : Vt)(r.y1, r.cpy1, r.y2, t)
  ];
}
var ds = (function(r) {
  O(t, r);
  function t(e) {
    return r.call(this, e) || this;
  }
  return t.prototype.getDefaultStyle = function() {
    return {
      stroke: "#000",
      fill: null
    };
  }, t.prototype.getDefaultShape = function() {
    return new Gb();
  }, t.prototype.buildPath = function(e, i) {
    var n = i.x1, a = i.y1, o = i.x2, s = i.y2, l = i.cpx1, u = i.cpy1, f = i.cpx2, h = i.cpy2, v = i.percent;
    v !== 0 && (e.moveTo(n, a), f == null || h == null ? (v < 1 && (Ro(n, l, o, v, Ft), l = Ft[1], o = Ft[2], Ro(a, u, s, v, Ft), u = Ft[1], s = Ft[2]), e.quadraticCurveTo(l, u, o, s)) : (v < 1 && (Eo(n, l, f, o, v, Ft), l = Ft[1], f = Ft[2], o = Ft[3], Eo(a, u, h, s, v, Ft), u = Ft[1], h = Ft[2], s = Ft[3]), e.bezierCurveTo(l, u, f, h, o, s)));
  }, t.prototype.pointAt = function(e) {
    return fv(this.shape, e, !1);
  }, t.prototype.tangentAt = function(e) {
    var i = fv(this.shape, e, !0);
    return Pf(i, i);
  }, t;
})(st);
ds.prototype.type = "bezier-curve";
var Wb = /* @__PURE__ */ (function() {
  function r() {
    this.cx = 0, this.cy = 0, this.r = 0, this.startAngle = 0, this.endAngle = Math.PI * 2, this.clockwise = !0;
  }
  return r;
})(), ps = (function(r) {
  O(t, r);
  function t(e) {
    return r.call(this, e) || this;
  }
  return t.prototype.getDefaultStyle = function() {
    return {
      stroke: "#000",
      fill: null
    };
  }, t.prototype.getDefaultShape = function() {
    return new Wb();
  }, t.prototype.buildPath = function(e, i) {
    var n = i.cx, a = i.cy, o = Math.max(i.r, 0), s = i.startAngle, l = i.endAngle, u = i.clockwise, f = Math.cos(s), h = Math.sin(s);
    e.moveTo(f * o + n, h * o + a), e.arc(n, a, o, s, l, !u);
  }, t;
})(st);
ps.prototype.type = "arc";
var Ub = (function(r) {
  O(t, r);
  function t() {
    var e = r !== null && r.apply(this, arguments) || this;
    return e.type = "compound", e;
  }
  return t.prototype._updatePathDirty = function() {
    for (var e = this.shape.paths, i = this.shapeChanged(), n = 0; n < e.length; n++)
      i = i || e[n].shapeChanged();
    i && this.dirtyShape();
  }, t.prototype.beforeBrush = function() {
    this._updatePathDirty();
    for (var e = this.shape.paths || [], i = this.getGlobalScale(), n = 0; n < e.length; n++)
      e[n].path || e[n].createPathProxy(), e[n].path.setScale(i[0], i[1], e[n].segmentIgnoreThreshold);
  }, t.prototype.buildPath = function(e, i) {
    for (var n = i.paths || [], a = 0; a < n.length; a++)
      n[a].buildPath(e, n[a].shape, !0);
  }, t.prototype.afterBrush = function() {
    for (var e = this.shape.paths || [], i = 0; i < e.length; i++)
      e[i].pathUpdated();
  }, t.prototype.getBoundingRect = function() {
    return this._updatePathDirty.call(this), st.prototype.getBoundingRect.call(this);
  }, t;
})(st), jg = (function() {
  function r(t) {
    this.colorStops = t || [];
  }
  return r.prototype.addColorStop = function(t, e) {
    this.colorStops.push({
      offset: t,
      color: e
    });
  }, r;
})(), Qg = (function(r) {
  O(t, r);
  function t(e, i, n, a, o, s) {
    var l = r.call(this, o) || this;
    return l.x = e ?? 0, l.y = i ?? 0, l.x2 = n ?? 1, l.y2 = a ?? 0, l.type = "linear", l.global = s || !1, l;
  }
  return t;
})(jg), Yb = (function(r) {
  O(t, r);
  function t(e, i, n, a, o) {
    var s = r.call(this, a) || this;
    return s.x = e ?? 0.5, s.y = i ?? 0.5, s.r = n ?? 0.5, s.type = "radial", s.global = o || !1, s;
  }
  return t;
})(jg), Rr = [0, 0], kr = [0, 0], za = new ut(), Ha = new ut(), Ho = (function() {
  function r(t, e) {
    this._corners = [], this._axes = [], this._origin = [0, 0];
    for (var i = 0; i < 4; i++)
      this._corners[i] = new ut();
    for (var i = 0; i < 2; i++)
      this._axes[i] = new ut();
    t && this.fromBoundingRect(t, e);
  }
  return r.prototype.fromBoundingRect = function(t, e) {
    var i = this._corners, n = this._axes, a = t.x, o = t.y, s = a + t.width, l = o + t.height;
    if (i[0].set(a, o), i[1].set(s, o), i[2].set(s, l), i[3].set(a, l), e)
      for (var u = 0; u < 4; u++)
        i[u].transform(e);
    ut.sub(n[0], i[1], i[0]), ut.sub(n[1], i[3], i[0]), n[0].normalize(), n[1].normalize();
    for (var u = 0; u < 2; u++)
      this._origin[u] = n[u].dot(i[0]);
  }, r.prototype.intersect = function(t, e) {
    var i = !0, n = !e;
    return za.set(1 / 0, 1 / 0), Ha.set(0, 0), !this._intersectCheckOneSide(this, t, za, Ha, n, 1) && (i = !1, n) || !this._intersectCheckOneSide(t, this, za, Ha, n, -1) && (i = !1, n) || n || ut.copy(e, i ? za : Ha), i;
  }, r.prototype._intersectCheckOneSide = function(t, e, i, n, a, o) {
    for (var s = !0, l = 0; l < 2; l++) {
      var u = this._axes[l];
      if (this._getProjMinMaxOnAxis(l, t._corners, Rr), this._getProjMinMaxOnAxis(l, e._corners, kr), Rr[1] < kr[0] || Rr[0] > kr[1]) {
        if (s = !1, a)
          return s;
        var f = Math.abs(kr[0] - Rr[1]), h = Math.abs(Rr[0] - kr[1]);
        Math.min(f, h) > n.len() && (f < h ? ut.scale(n, u, -f * o) : ut.scale(n, u, h * o));
      } else if (i) {
        var f = Math.abs(kr[0] - Rr[1]), h = Math.abs(Rr[0] - kr[1]);
        Math.min(f, h) < i.len() && (f < h ? ut.scale(i, u, f * o) : ut.scale(i, u, -h * o));
      }
    }
    return s;
  }, r.prototype._getProjMinMaxOnAxis = function(t, e, i) {
    for (var n = this._axes[t], a = this._origin, o = e[0].dot(n) + a[t], s = o, l = o, u = 1; u < e.length; u++) {
      var f = e[u].dot(n) + a[t];
      s = Math.min(f, s), l = Math.max(f, l);
    }
    i[0] = s, i[1] = l;
  }, r;
})(), Xb = [], Zb = (function(r) {
  O(t, r);
  function t() {
    var e = r !== null && r.apply(this, arguments) || this;
    return e.notClear = !0, e.incremental = !0, e._displayables = [], e._temporaryDisplayables = [], e._cursor = 0, e;
  }
  return t.prototype.traverse = function(e, i) {
    e.call(i, this);
  }, t.prototype.useStyle = function() {
    this.style = {};
  }, t.prototype.getCursor = function() {
    return this._cursor;
  }, t.prototype.innerAfterBrush = function() {
    this._cursor = this._displayables.length;
  }, t.prototype.clearDisplaybles = function() {
    this._displayables = [], this._temporaryDisplayables = [], this._cursor = 0, this.markRedraw(), this.notClear = !1;
  }, t.prototype.clearTemporalDisplayables = function() {
    this._temporaryDisplayables = [];
  }, t.prototype.addDisplayable = function(e, i) {
    i ? this._temporaryDisplayables.push(e) : this._displayables.push(e), this.markRedraw();
  }, t.prototype.addDisplayables = function(e, i) {
    i = i || !1;
    for (var n = 0; n < e.length; n++)
      this.addDisplayable(e[n], i);
  }, t.prototype.getDisplayables = function() {
    return this._displayables;
  }, t.prototype.getTemporalDisplayables = function() {
    return this._temporaryDisplayables;
  }, t.prototype.eachPendingDisplayable = function(e) {
    for (var i = this._cursor; i < this._displayables.length; i++)
      e && e(this._displayables[i]);
    for (var i = 0; i < this._temporaryDisplayables.length; i++)
      e && e(this._temporaryDisplayables[i]);
  }, t.prototype.update = function() {
    this.updateTransform();
    for (var e = this._cursor; e < this._displayables.length; e++) {
      var i = this._displayables[e];
      i.parent = this, i.update(), i.parent = null;
    }
    for (var e = 0; e < this._temporaryDisplayables.length; e++) {
      var i = this._temporaryDisplayables[e];
      i.parent = this, i.update(), i.parent = null;
    }
  }, t.prototype.getBoundingRect = function() {
    if (!this._rect) {
      for (var e = new it(1 / 0, 1 / 0, -1 / 0, -1 / 0), i = 0; i < this._displayables.length; i++) {
        var n = this._displayables[i], a = n.getBoundingRect().clone();
        n.needLocalTransform() && a.applyTransform(n.getLocalTransform(Xb)), e.union(a);
      }
      this._rect = e;
    }
    return this._rect;
  }, t.prototype.contain = function(e, i) {
    var n = this.transformCoordToLocal(e, i), a = this.getBoundingRect();
    if (a.contain(n[0], n[1]))
      for (var o = 0; o < this._displayables.length; o++) {
        var s = this._displayables[o];
        if (s.contain(e, i))
          return !0;
      }
    return !1;
  }, t;
})(ma), qb = mt();
function Kb(r, t, e, i, n) {
  var a;
  if (t && t.ecModel) {
    var o = t.ecModel.getUpdatePayload();
    a = o && o.animation;
  }
  var s = t && t.isAnimationEnabled(), l = r === "update";
  if (s) {
    var u = void 0, f = void 0, h = void 0;
    i ? (u = X(i.duration, 200), f = X(i.easing, "cubicOut"), h = 0) : (u = t.getShallow(l ? "animationDurationUpdate" : "animationDuration"), f = t.getShallow(l ? "animationEasingUpdate" : "animationEasing"), h = t.getShallow(l ? "animationDelayUpdate" : "animationDelay")), a && (a.duration != null && (u = a.duration), a.easing != null && (f = a.easing), a.delay != null && (h = a.delay)), G(h) && (h = h(e, n)), G(u) && (u = u(e));
    var v = {
      duration: u || 0,
      delay: h,
      easing: f
    };
    return v;
  } else
    return null;
}
function Qf(r, t, e, i, n, a, o) {
  var s = !1, l;
  G(n) ? (o = a, a = n, n = null) : W(n) && (a = n.cb, o = n.during, s = n.isFrom, l = n.removeOpt, n = n.dataIndex);
  var u = r === "leave";
  u || t.stopAnimation("leave");
  var f = Kb(r, i, n, u ? l || {} : null, i && i.getAnimationDelayParams ? i.getAnimationDelayParams(t, n) : null);
  if (f && f.duration > 0) {
    var h = f.duration, v = f.delay, c = f.easing, d = {
      duration: h,
      delay: v || 0,
      easing: c,
      done: a,
      force: !!a || !!o,
      // Set to final state in update/init animation.
      // So the post processing based on the path shape can be done correctly.
      setToFinal: !u,
      scope: r,
      during: o
    };
    s ? t.animateFrom(e, d) : t.animateTo(e, d);
  } else
    t.stopAnimation(), !s && t.attr(e), o && o(1), a && a();
}
function We(r, t, e, i, n, a) {
  Qf("update", r, t, e, i, n, a);
}
function Ki(r, t, e, i, n, a) {
  Qf("enter", r, t, e, i, n, a);
}
function $n(r) {
  if (!r.__zr)
    return !0;
  for (var t = 0; t < r.animators.length; t++) {
    var e = r.animators[t];
    if (e.scope === "leave")
      return !0;
  }
  return !1;
}
function $o(r, t, e, i, n, a) {
  $n(r) || Qf("leave", r, t, e, i, n, a);
}
function hv(r, t, e, i) {
  r.removeTextContent(), r.removeTextGuideLine(), $o(r, {
    style: {
      opacity: 0
    }
  }, t, e, i);
}
function jb(r, t, e) {
  function i() {
    r.parent && r.parent.remove(r);
  }
  r.isGroup ? r.traverse(function(n) {
    n.isGroup || hv(n, t, e, i);
  }) : hv(r, t, e, i);
}
function Qb(r) {
  qb(r).oldStyle = r.style;
}
var Vo = Math.max, Go = Math.min, zu = {};
function Jb(r) {
  return st.extend(r);
}
var tw = Ab;
function ew(r, t) {
  return tw(r, t);
}
function Se(r, t) {
  zu[r] = t;
}
function rw(r) {
  if (zu.hasOwnProperty(r))
    return zu[r];
}
function Jf(r, t, e, i) {
  var n = Db(r, t);
  return e && (i === "center" && (e = ty(e, n.getBoundingRect())), ey(n, e)), n;
}
function Jg(r, t, e) {
  var i = new gr({
    style: {
      image: r,
      x: t.x,
      y: t.y,
      width: t.width,
      height: t.height
    },
    onload: function(n) {
      if (e === "center") {
        var a = {
          width: n.width,
          height: n.height
        };
        i.setStyle(ty(t, a));
      }
    }
  });
  return i;
}
function ty(r, t) {
  var e = t.width / t.height, i = r.height * e, n;
  i <= r.width ? n = r.height : (i = r.width, n = i / e);
  var a = r.x + r.width / 2, o = r.y + r.height / 2;
  return {
    x: a - i / 2,
    y: o - n / 2,
    width: i,
    height: n
  };
}
var iw = Lb;
function ey(r, t) {
  if (r.applyTransform) {
    var e = r.getBoundingRect(), i = e.calculateTransform(t);
    r.applyTransform(i);
  }
}
function aa(r, t) {
  return kg(r, r, {
    lineWidth: t
  }), r;
}
function nw(r) {
  return Og(r.shape, r.shape, r.style), r;
}
var aw = Vr;
function ow(r, t) {
  for (var e = Ef([]); r && r !== t; )
    Ri(e, r.getLocalTransform(), e), r = r.parent;
  return e;
}
function th(r, t, e) {
  return t && !Yt(t) && (t = Nf.getLocalTransform(t)), e && (t = kf([], t)), ue([], r, t);
}
function sw(r, t, e) {
  var i = t[4] === 0 || t[5] === 0 || t[0] === 0 ? 1 : Math.abs(2 * t[4] / t[0]), n = t[4] === 0 || t[5] === 0 || t[2] === 0 ? 1 : Math.abs(2 * t[4] / t[2]), a = [r === "left" ? -i : r === "right" ? i : 0, r === "top" ? -n : r === "bottom" ? n : 0];
  return a = th(a, t, e), Math.abs(a[0]) > Math.abs(a[1]) ? a[0] > 0 ? "right" : "left" : a[1] > 0 ? "bottom" : "top";
}
function cv(r) {
  return !r.isGroup;
}
function lw(r) {
  return r.shape != null;
}
function ry(r, t, e) {
  if (!r || !t)
    return;
  function i(o) {
    var s = {};
    return o.traverse(function(l) {
      cv(l) && l.anid && (s[l.anid] = l);
    }), s;
  }
  function n(o) {
    var s = {
      x: o.x,
      y: o.y,
      rotation: o.rotation
    };
    return lw(o) && (s.shape = k({}, o.shape)), s;
  }
  var a = i(r);
  t.traverse(function(o) {
    if (cv(o) && o.anid) {
      var s = a[o.anid];
      if (s) {
        var l = n(o);
        o.attr(n(s)), We(o, l, e, et(o).dataIndex);
      }
    }
  });
}
function uw(r, t) {
  return H(r, function(e) {
    var i = e[0];
    i = Vo(i, t.x), i = Go(i, t.x + t.width);
    var n = e[1];
    return n = Vo(n, t.y), n = Go(n, t.y + t.height), [i, n];
  });
}
function fw(r, t) {
  var e = Vo(r.x, t.x), i = Go(r.x + r.width, t.x + t.width), n = Vo(r.y, t.y), a = Go(r.y + r.height, t.y + t.height);
  if (i >= e && a >= n)
    return {
      x: e,
      y: n,
      width: i - e,
      height: a - n
    };
}
function eh(r, t, e) {
  var i = k({
    rectHover: !0
  }, t), n = i.style = {
    strokeNoScale: !0
  };
  if (e = e || {
    x: -1,
    y: -1,
    width: 2,
    height: 2
  }, r)
    return r.indexOf("image://") === 0 ? (n.image = r.slice(8), ot(n, e), new gr(i)) : Jf(r.replace("path://", ""), i, e, "center");
}
function hw(r, t, e, i, n) {
  for (var a = 0, o = n[n.length - 1]; a < n.length; a++) {
    var s = n[a];
    if (iy(r, t, e, i, s[0], s[1], o[0], o[1]))
      return !0;
    o = s;
  }
}
function iy(r, t, e, i, n, a, o, s) {
  var l = e - r, u = i - t, f = o - n, h = s - a, v = xl(f, h, l, u);
  if (cw(v))
    return !1;
  var c = r - n, d = t - a, y = xl(c, d, l, u) / v;
  if (y < 0 || y > 1)
    return !1;
  var p = xl(c, d, f, h) / v;
  return !(p < 0 || p > 1);
}
function xl(r, t, e, i) {
  return r * i - e * t;
}
function cw(r) {
  return r <= 1e-6 && r >= -1e-6;
}
function gs(r) {
  var t = r.itemTooltipOption, e = r.componentModel, i = r.itemName, n = z(t) ? {
    formatter: t
  } : t, a = e.mainType, o = e.componentIndex, s = {
    componentType: a,
    name: i,
    $vars: ["name"]
  };
  s[a + "Index"] = o;
  var l = r.formatterParamsExtra;
  l && A(pt(l), function(f) {
    jr(s, f) || (s[f] = l[f], s.$vars.push(f));
  });
  var u = et(r.el);
  u.componentMainType = a, u.componentIndex = o, u.tooltipConfig = {
    name: i,
    option: ot({
      content: i,
      encodeHTMLContent: !0,
      formatterParams: s
    }, n)
  };
}
function vv(r, t) {
  var e;
  r.isGroup && (e = t(r)), e || r.traverse(t);
}
function ys(r, t) {
  if (r)
    if (N(r))
      for (var e = 0; e < r.length; e++)
        vv(r[e], t);
    else
      vv(r, t);
}
Se("circle", cs);
Se("ellipse", Zf);
Se("sector", vs);
Se("ring", qf);
Se("polygon", Kf);
Se("polyline", jf);
Se("rect", Lt);
Se("line", Ge);
Se("bezierCurve", ds);
Se("arc", ps);
const vw = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Arc: ps,
  BezierCurve: ds,
  BoundingRect: it,
  Circle: cs,
  CompoundPath: Ub,
  Ellipse: Zf,
  Group: Dt,
  Image: gr,
  IncrementalDisplayable: Zb,
  Line: Ge,
  LinearGradient: Qg,
  OrientedBoundingRect: Ho,
  Path: st,
  Point: ut,
  Polygon: Kf,
  Polyline: jf,
  RadialGradient: Yb,
  Rect: Lt,
  Ring: qf,
  Sector: vs,
  Text: Zt,
  applyTransform: th,
  clipPointsByRect: uw,
  clipRectByRect: fw,
  createIcon: eh,
  extendPath: ew,
  extendShape: Jb,
  getShapeClass: rw,
  getTransform: ow,
  groupTransition: ry,
  initProps: Ki,
  isElementRemoved: $n,
  lineLineIntersect: iy,
  linePolygonIntersect: hw,
  makeImage: Jg,
  makePath: Jf,
  mergePath: iw,
  registerShape: Se,
  removeElement: $o,
  removeElementWithFadeOut: jb,
  resizePath: ey,
  setTooltipConfig: gs,
  subPixelOptimize: aw,
  subPixelOptimizeLine: aa,
  subPixelOptimizeRect: nw,
  transformDirection: sw,
  traverseElements: ys,
  updateProps: We
}, Symbol.toStringTag, { value: "Module" }));
var ms = {};
function dw(r, t) {
  for (var e = 0; e < fe.length; e++) {
    var i = fe[e], n = t[i], a = r.ensureState(i);
    a.style = a.style || {}, a.style.text = n;
  }
  var o = r.currentStates.slice();
  r.clearStates(!0), r.setStyle({
    text: t.normal
  }), r.useStates(o, !0);
}
function dv(r, t, e) {
  var i = r.labelFetcher, n = r.labelDataIndex, a = r.labelDimIndex, o = t.normal, s;
  i && (s = i.getFormattedLabel(n, "normal", null, a, o && o.get("formatter"), e != null ? {
    interpolatedValue: e
  } : null)), s == null && (s = G(r.defaultText) ? r.defaultText(n, r, e) : r.defaultText);
  for (var l = {
    normal: s
  }, u = 0; u < fe.length; u++) {
    var f = fe[u], h = t[f];
    l[f] = X(i ? i.getFormattedLabel(n, f, null, a, h && h.get("formatter")) : null, s);
  }
  return l;
}
function _s(r, t, e, i) {
  e = e || ms;
  for (var n = r instanceof Zt, a = !1, o = 0; o < Kc.length; o++) {
    var s = t[Kc[o]];
    if (s && s.getShallow("show")) {
      a = !0;
      break;
    }
  }
  var l = n ? r : r.getTextContent();
  if (a) {
    n || (l || (l = new Zt(), r.setTextContent(l)), r.stateProxy && (l.stateProxy = r.stateProxy));
    var u = dv(e, t), f = t.normal, h = !!f.getShallow("show"), v = Gi(f, i && i.normal, e, !1, !n);
    v.text = u.normal, n || r.setTextConfig(pv(f, e, !1));
    for (var o = 0; o < fe.length; o++) {
      var c = fe[o], s = t[c];
      if (s) {
        var d = l.ensureState(c), y = !!X(s.getShallow("show"), h);
        if (y !== h && (d.ignore = !y), d.style = Gi(s, i && i[c], e, !0, !n), d.style.text = u[c], !n) {
          var p = r.ensureState(c);
          p.textConfig = pv(s, e, !0);
        }
      }
    }
    l.silent = !!f.getShallow("silent"), l.style.x != null && (v.x = l.style.x), l.style.y != null && (v.y = l.style.y), l.ignore = !h, l.useStyle(v), l.dirty(), e.enableTextSetter && (ny(l).setLabelText = function(g) {
      var m = dv(e, t, g);
      dw(l, m);
    });
  } else l && (l.ignore = !0);
  r.dirty();
}
function _a(r, t) {
  t = t || "label";
  for (var e = {
    normal: r.getModel(t)
  }, i = 0; i < fe.length; i++) {
    var n = fe[i];
    e[n] = r.getModel([n, t]);
  }
  return e;
}
function Gi(r, t, e, i, n) {
  var a = {};
  return pw(a, r, e, i, n), t && k(a, t), a;
}
function pv(r, t, e) {
  t = t || {};
  var i = {}, n, a = r.getShallow("rotate"), o = X(r.getShallow("distance"), e ? null : 5), s = r.getShallow("offset");
  return n = r.getShallow("position") || (e ? null : "inside"), n === "outside" && (n = t.defaultOutsidePosition || "top"), n != null && (i.position = n), s != null && (i.offset = s), a != null && (a *= Math.PI / 180, i.rotation = a), o != null && (i.distance = o), i.outsideFill = r.get("color") === "inherit" ? t.inheritColor || null : "auto", i;
}
function pw(r, t, e, i, n) {
  e = e || ms;
  var a = t.ecModel, o = a && a.option.textStyle, s = gw(t), l;
  if (s) {
    l = {};
    for (var u in s)
      if (s.hasOwnProperty(u)) {
        var f = t.getModel(["rich", u]);
        _v(l[u] = {}, f, o, e, i, n, !1, !0);
      }
  }
  l && (r.rich = l);
  var h = t.get("overflow");
  h && (r.overflow = h);
  var v = t.get("minMargin");
  v != null && (r.margin = v), _v(r, t, o, e, i, n, !0, !1);
}
function gw(r) {
  for (var t; r && r !== r.ecModel; ) {
    var e = (r.option || ms).rich;
    if (e) {
      t = t || {};
      for (var i = pt(e), n = 0; n < i.length; n++) {
        var a = i[n];
        t[a] = 1;
      }
    }
    r = r.parentModel;
  }
  return t;
}
var gv = ["fontStyle", "fontWeight", "fontSize", "fontFamily", "textShadowColor", "textShadowBlur", "textShadowOffsetX", "textShadowOffsetY"], yv = ["align", "lineHeight", "width", "height", "tag", "verticalAlign", "ellipsis"], mv = ["padding", "borderWidth", "borderRadius", "borderDashOffset", "backgroundColor", "borderColor", "shadowColor", "shadowBlur", "shadowOffsetX", "shadowOffsetY"];
function _v(r, t, e, i, n, a, o, s) {
  e = !n && e || ms;
  var l = i && i.inheritColor, u = t.getShallow("color"), f = t.getShallow("textBorderColor"), h = X(t.getShallow("opacity"), e.opacity);
  (u === "inherit" || u === "auto") && (l ? u = l : u = null), (f === "inherit" || f === "auto") && (l ? f = l : f = null), a || (u = u || e.color, f = f || e.textBorderColor), u != null && (r.fill = u), f != null && (r.stroke = f);
  var v = X(t.getShallow("textBorderWidth"), e.textBorderWidth);
  v != null && (r.lineWidth = v);
  var c = X(t.getShallow("textBorderType"), e.textBorderType);
  c != null && (r.lineDash = c);
  var d = X(t.getShallow("textBorderDashOffset"), e.textBorderDashOffset);
  d != null && (r.lineDashOffset = d), !n && h == null && !s && (h = i && i.defaultOpacity), h != null && (r.opacity = h), !n && !a && r.fill == null && i.inheritColor && (r.fill = i.inheritColor);
  for (var y = 0; y < gv.length; y++) {
    var p = gv[y], g = X(t.getShallow(p), e[p]);
    g != null && (r[p] = g);
  }
  for (var y = 0; y < yv.length; y++) {
    var p = yv[y], g = t.getShallow(p);
    g != null && (r[p] = g);
  }
  if (r.verticalAlign == null) {
    var m = t.getShallow("baseline");
    m != null && (r.verticalAlign = m);
  }
  if (!o || !i.disableBox) {
    for (var y = 0; y < mv.length; y++) {
      var p = mv[y], g = t.getShallow(p);
      g != null && (r[p] = g);
    }
    var _ = t.getShallow("borderType");
    _ != null && (r.borderDash = _), (r.backgroundColor === "auto" || r.backgroundColor === "inherit") && l && (r.backgroundColor = l), (r.borderColor === "auto" || r.borderColor === "inherit") && l && (r.borderColor = l);
  }
}
function yw(r, t) {
  var e = t && t.getModel("textStyle");
  return Me([
    // FIXME in node-canvas fontWeight is before fontStyle
    r.fontStyle || e && e.getShallow("fontStyle") || "",
    r.fontWeight || e && e.getShallow("fontWeight") || "",
    (r.fontSize || e && e.getShallow("fontSize") || 12) + "px",
    r.fontFamily || e && e.getShallow("fontFamily") || "sans-serif"
  ].join(" "));
}
var ny = mt(), mw = ["textStyle", "color"], Tl = ["fontStyle", "fontWeight", "fontSize", "fontFamily", "padding", "lineHeight", "rich", "width", "height", "overflow"], Cl = new Zt(), _w = (
  /** @class */
  (function() {
    function r() {
    }
    return r.prototype.getTextColor = function(t) {
      var e = this.ecModel;
      return this.getShallow("color") || (!t && e ? e.get(mw) : null);
    }, r.prototype.getFont = function() {
      return yw({
        fontStyle: this.getShallow("fontStyle"),
        fontWeight: this.getShallow("fontWeight"),
        fontSize: this.getShallow("fontSize"),
        fontFamily: this.getShallow("fontFamily")
      }, this.ecModel);
    }, r.prototype.getTextRect = function(t) {
      for (var e = {
        text: t,
        verticalAlign: this.getShallow("verticalAlign") || this.getShallow("baseline")
      }, i = 0; i < Tl.length; i++)
        e[Tl[i]] = this.getShallow(Tl[i]);
      return Cl.useStyle(e), Cl.update(), Cl.getBoundingRect();
    }, r;
  })()
), ay = [
  ["lineWidth", "width"],
  ["stroke", "color"],
  ["opacity"],
  ["shadowBlur"],
  ["shadowOffsetX"],
  ["shadowOffsetY"],
  ["shadowColor"],
  ["lineDash", "type"],
  ["lineDashOffset", "dashOffset"],
  ["lineCap", "cap"],
  ["lineJoin", "join"],
  ["miterLimit"]
  // Option decal is in `DecalObject` but style.decal is in `PatternObject`.
  // So do not transfer decal directly.
], Sw = ra(ay), bw = (
  /** @class */
  (function() {
    function r() {
    }
    return r.prototype.getLineStyle = function(t) {
      return Sw(this, t);
    }, r;
  })()
), oy = [
  ["fill", "color"],
  ["stroke", "borderColor"],
  ["lineWidth", "borderWidth"],
  ["opacity"],
  ["shadowBlur"],
  ["shadowOffsetX"],
  ["shadowOffsetY"],
  ["shadowColor"],
  ["lineDash", "borderType"],
  ["lineDashOffset", "borderDashOffset"],
  ["lineCap", "borderCap"],
  ["lineJoin", "borderJoin"],
  ["miterLimit", "borderMiterLimit"]
  // Option decal is in `DecalObject` but style.decal is in `PatternObject`.
  // So do not transfer decal directly.
], ww = ra(oy), xw = (
  /** @class */
  (function() {
    function r() {
    }
    return r.prototype.getItemStyle = function(t, e) {
      return ww(this, t, e);
    }, r;
  })()
), yt = (
  /** @class */
  (function() {
    function r(t, e, i) {
      this.parentModel = e, this.ecModel = i, this.option = t;
    }
    return r.prototype.init = function(t, e, i) {
    }, r.prototype.mergeOption = function(t, e) {
      Q(this.option, t, !0);
    }, r.prototype.get = function(t, e) {
      return t == null ? this.option : this._doGet(this.parsePath(t), !e && this.parentModel);
    }, r.prototype.getShallow = function(t, e) {
      var i = this.option, n = i == null ? i : i[t];
      if (n == null && !e) {
        var a = this.parentModel;
        a && (n = a.getShallow(t));
      }
      return n;
    }, r.prototype.getModel = function(t, e) {
      var i = t != null, n = i ? this.parsePath(t) : null, a = i ? this._doGet(n) : this.option;
      return e = e || this.parentModel && this.parentModel.getModel(this.resolveParentPath(n)), new r(a, e, this.ecModel);
    }, r.prototype.isEmpty = function() {
      return this.option == null;
    }, r.prototype.restoreData = function() {
    }, r.prototype.clone = function() {
      var t = this.constructor;
      return new t(K(this.option));
    }, r.prototype.parsePath = function(t) {
      return typeof t == "string" ? t.split(".") : t;
    }, r.prototype.resolveParentPath = function(t) {
      return t;
    }, r.prototype.isAnimationEnabled = function() {
      if (!U.node && this.option) {
        if (this.option.animation != null)
          return !!this.option.animation;
        if (this.parentModel)
          return this.parentModel.isAnimationEnabled();
      }
    }, r.prototype._doGet = function(t, e) {
      var i = this.option;
      if (!t)
        return i;
      for (var n = 0; n < t.length && !(t[n] && (i = i && typeof i == "object" ? i[t[n]] : null, i == null)); n++)
        ;
      return i == null && e && (i = e._doGet(this.resolveParentPath(t), e.parentModel)), i;
    }, r;
  })()
);
Vf(yt);
lS(yt);
_e(yt, bw);
_e(yt, xw);
_e(yt, vS);
_e(yt, _w);
var Tw = Math.round(Math.random() * 10);
function Ss(r) {
  return [r || "", Tw++].join("_");
}
function Cw(r) {
  var t = {};
  r.registerSubTypeDefaulter = function(e, i) {
    var n = Ae(e);
    t[n.main] = i;
  }, r.determineSubType = function(e, i) {
    var n = i.type;
    if (!n) {
      var a = Ae(e).main;
      r.hasSubTypes(e) && t[a] && (n = t[a](i));
    }
    return n;
  };
}
function Mw(r, t) {
  r.topologicalTravel = function(a, o, s, l) {
    if (!a.length)
      return;
    var u = e(o), f = u.graph, h = u.noEntryList, v = {};
    for (A(a, function(m) {
      v[m] = !0;
    }); h.length; ) {
      var c = h.pop(), d = f[c], y = !!v[c];
      y && (s.call(l, c, d.originalDeps.slice()), delete v[c]), A(d.successor, y ? g : p);
    }
    A(v, function() {
      var m = "";
      throw new Error(m);
    });
    function p(m) {
      f[m].entryCount--, f[m].entryCount === 0 && h.push(m);
    }
    function g(m) {
      v[m] = !0, p(m);
    }
  };
  function e(a) {
    var o = {}, s = [];
    return A(a, function(l) {
      var u = i(o, l), f = u.originalDeps = t(l), h = n(f, a);
      u.entryCount = h.length, u.entryCount === 0 && s.push(l), A(h, function(v) {
        rt(u.predecessor, v) < 0 && u.predecessor.push(v);
        var c = i(o, v);
        rt(c.successor, v) < 0 && c.successor.push(l);
      });
    }), {
      graph: o,
      noEntryList: s
    };
  }
  function i(a, o) {
    return a[o] || (a[o] = {
      predecessor: [],
      successor: []
    }), a[o];
  }
  function n(a, o) {
    var s = [];
    return A(a, function(l) {
      rt(o, l) >= 0 && s.push(l);
    }), s;
  }
}
function Dw(r, t) {
  return Q(Q({}, r, !0), t, !0);
}
const Aw = {
  time: {
    month: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    monthAbbr: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    dayOfWeekAbbr: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  },
  legend: {
    selector: {
      all: "All",
      inverse: "Inv"
    }
  },
  toolbox: {
    brush: {
      title: {
        rect: "Box Select",
        polygon: "Lasso Select",
        lineX: "Horizontally Select",
        lineY: "Vertically Select",
        keep: "Keep Selections",
        clear: "Clear Selections"
      }
    },
    dataView: {
      title: "Data View",
      lang: ["Data View", "Close", "Refresh"]
    },
    dataZoom: {
      title: {
        zoom: "Zoom",
        back: "Zoom Reset"
      }
    },
    magicType: {
      title: {
        line: "Switch to Line Chart",
        bar: "Switch to Bar Chart",
        stack: "Stack",
        tiled: "Tile"
      }
    },
    restore: {
      title: "Restore"
    },
    saveAsImage: {
      title: "Save as Image",
      lang: ["Right Click to Save Image"]
    }
  },
  series: {
    typeNames: {
      pie: "Pie chart",
      bar: "Bar chart",
      line: "Line chart",
      scatter: "Scatter plot",
      effectScatter: "Ripple scatter plot",
      radar: "Radar chart",
      tree: "Tree",
      treemap: "Treemap",
      boxplot: "Boxplot",
      candlestick: "Candlestick",
      k: "K line chart",
      heatmap: "Heat map",
      map: "Map",
      parallel: "Parallel coordinate map",
      lines: "Line graph",
      graph: "Relationship graph",
      sankey: "Sankey diagram",
      funnel: "Funnel chart",
      gauge: "Gauge",
      pictorialBar: "Pictorial bar",
      themeRiver: "Theme River Map",
      sunburst: "Sunburst",
      custom: "Custom chart",
      chart: "Chart"
    }
  },
  aria: {
    general: {
      withTitle: 'This is a chart about "{title}"',
      withoutTitle: "This is a chart"
    },
    series: {
      single: {
        prefix: "",
        withName: " with type {seriesType} named {seriesName}.",
        withoutName: " with type {seriesType}."
      },
      multiple: {
        prefix: ". It consists of {seriesCount} series count.",
        withName: " The {seriesId} series is a {seriesType} representing {seriesName}.",
        withoutName: " The {seriesId} series is a {seriesType}.",
        separator: {
          middle: "",
          end: ""
        }
      }
    },
    data: {
      allData: "The data is as follows: ",
      partialData: "The first {displayCnt} items are: ",
      withName: "the data for {name} is {value}",
      withoutName: "{value}",
      separator: {
        middle: ", ",
        end: ". "
      }
    }
  }
}, Lw = {
  time: {
    month: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
    monthAbbr: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
    dayOfWeek: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
    dayOfWeekAbbr: ["日", "一", "二", "三", "四", "五", "六"]
  },
  legend: {
    selector: {
      all: "全选",
      inverse: "反选"
    }
  },
  toolbox: {
    brush: {
      title: {
        rect: "矩形选择",
        polygon: "圈选",
        lineX: "横向选择",
        lineY: "纵向选择",
        keep: "保持选择",
        clear: "清除选择"
      }
    },
    dataView: {
      title: "数据视图",
      lang: ["数据视图", "关闭", "刷新"]
    },
    dataZoom: {
      title: {
        zoom: "区域缩放",
        back: "区域缩放还原"
      }
    },
    magicType: {
      title: {
        line: "切换为折线图",
        bar: "切换为柱状图",
        stack: "切换为堆叠",
        tiled: "切换为平铺"
      }
    },
    restore: {
      title: "还原"
    },
    saveAsImage: {
      title: "保存为图片",
      lang: ["右键另存为图片"]
    }
  },
  series: {
    typeNames: {
      pie: "饼图",
      bar: "柱状图",
      line: "折线图",
      scatter: "散点图",
      effectScatter: "涟漪散点图",
      radar: "雷达图",
      tree: "树图",
      treemap: "矩形树图",
      boxplot: "箱型图",
      candlestick: "K线图",
      k: "K线图",
      heatmap: "热力图",
      map: "地图",
      parallel: "平行坐标图",
      lines: "线图",
      graph: "关系图",
      sankey: "桑基图",
      funnel: "漏斗图",
      gauge: "仪表盘图",
      pictorialBar: "象形柱图",
      themeRiver: "主题河流图",
      sunburst: "旭日图",
      custom: "自定义图表",
      chart: "图表"
    }
  },
  aria: {
    general: {
      withTitle: "这是一个关于“{title}”的图表。",
      withoutTitle: "这是一个图表，"
    },
    series: {
      single: {
        prefix: "",
        withName: "图表类型是{seriesType}，表示{seriesName}。",
        withoutName: "图表类型是{seriesType}。"
      },
      multiple: {
        prefix: "它由{seriesCount}个图表系列组成。",
        withName: "第{seriesId}个系列是一个表示{seriesName}的{seriesType}，",
        withoutName: "第{seriesId}个系列是一个{seriesType}，",
        separator: {
          middle: "；",
          end: "。"
        }
      }
    },
    data: {
      allData: "其数据是——",
      partialData: "其中，前{displayCnt}项是——",
      withName: "{name}的数据是{value}",
      withoutName: "{value}",
      separator: {
        middle: "，",
        end: ""
      }
    }
  }
};
var Wo = "ZH", rh = "EN", Oi = rh, wo = {}, ih = {}, sy = U.domSupported ? (function() {
  var r = (
    /* eslint-disable-next-line */
    (document.documentElement.lang || navigator.language || navigator.browserLanguage || Oi).toUpperCase()
  );
  return r.indexOf(Wo) > -1 ? Wo : Oi;
})() : Oi;
function ly(r, t) {
  r = r.toUpperCase(), ih[r] = new yt(t), wo[r] = t;
}
function Pw(r) {
  if (z(r)) {
    var t = wo[r.toUpperCase()] || {};
    return r === Wo || r === rh ? K(t) : Q(K(t), K(wo[Oi]), !1);
  } else
    return Q(K(r), K(wo[Oi]), !1);
}
function Iw(r) {
  return ih[r];
}
function Ew() {
  return ih[Oi];
}
ly(rh, Aw);
ly(Wo, Lw);
var nh = 1e3, ah = nh * 60, Vn = ah * 60, le = Vn * 24, Sv = le * 365, An = {
  year: "{yyyy}",
  month: "{MMM}",
  day: "{d}",
  hour: "{HH}:{mm}",
  minute: "{HH}:{mm}",
  second: "{HH}:{mm}:{ss}",
  millisecond: "{HH}:{mm}:{ss} {SSS}",
  none: "{yyyy}-{MM}-{dd} {HH}:{mm}:{ss} {SSS}"
}, $a = "{yyyy}-{MM}-{dd}", bv = {
  year: "{yyyy}",
  month: "{yyyy}-{MM}",
  day: $a,
  hour: $a + " " + An.hour,
  minute: $a + " " + An.minute,
  second: $a + " " + An.second,
  millisecond: An.none
}, Ml = ["year", "month", "day", "hour", "minute", "second", "millisecond"], uy = ["year", "half-year", "quarter", "month", "week", "half-week", "day", "half-day", "quarter-day", "hour", "minute", "second", "millisecond"];
function qe(r, t) {
  return r += "", "0000".substr(0, t - r.length) + r;
}
function Ni(r) {
  switch (r) {
    case "half-year":
    case "quarter":
      return "month";
    case "week":
    case "half-week":
      return "day";
    case "half-day":
    case "quarter-day":
      return "hour";
    default:
      return r;
  }
}
function Rw(r) {
  return r === Ni(r);
}
function kw(r) {
  switch (r) {
    case "year":
    case "month":
      return "day";
    case "millisecond":
      return "millisecond";
    default:
      return "second";
  }
}
function bs(r, t, e, i) {
  var n = Ve(r), a = n[oh(e)](), o = n[Bi(e)]() + 1, s = Math.floor((o - 1) / 3) + 1, l = n[ws(e)](), u = n["get" + (e ? "UTC" : "") + "Day"](), f = n[oa(e)](), h = (f - 1) % 12 + 1, v = n[xs(e)](), c = n[Ts(e)](), d = n[Cs(e)](), y = f >= 12 ? "pm" : "am", p = y.toUpperCase(), g = i instanceof yt ? i : Iw(i || sy) || Ew(), m = g.getModel("time"), _ = m.get("month"), S = m.get("monthAbbr"), w = m.get("dayOfWeek"), b = m.get("dayOfWeekAbbr");
  return (t || "").replace(/{a}/g, y + "").replace(/{A}/g, p + "").replace(/{yyyy}/g, a + "").replace(/{yy}/g, qe(a % 100 + "", 2)).replace(/{Q}/g, s + "").replace(/{MMMM}/g, _[o - 1]).replace(/{MMM}/g, S[o - 1]).replace(/{MM}/g, qe(o, 2)).replace(/{M}/g, o + "").replace(/{dd}/g, qe(l, 2)).replace(/{d}/g, l + "").replace(/{eeee}/g, w[u]).replace(/{ee}/g, b[u]).replace(/{e}/g, u + "").replace(/{HH}/g, qe(f, 2)).replace(/{H}/g, f + "").replace(/{hh}/g, qe(h + "", 2)).replace(/{h}/g, h + "").replace(/{mm}/g, qe(v, 2)).replace(/{m}/g, v + "").replace(/{ss}/g, qe(c, 2)).replace(/{s}/g, c + "").replace(/{SSS}/g, qe(d, 3)).replace(/{S}/g, d + "");
}
function Ow(r, t, e, i, n) {
  var a = null;
  if (z(e))
    a = e;
  else if (G(e))
    a = e(r.value, t, {
      level: r.level
    });
  else {
    var o = k({}, An);
    if (r.level > 0)
      for (var s = 0; s < Ml.length; ++s)
        o[Ml[s]] = "{primary|" + o[Ml[s]] + "}";
    var l = e ? e.inherit === !1 ? e : ot(e, o) : o, u = fy(r.value, n);
    if (l[u])
      a = l[u];
    else if (l.inherit) {
      for (var f = uy.indexOf(u), s = f - 1; s >= 0; --s)
        if (l[u]) {
          a = l[u];
          break;
        }
      a = a || o.none;
    }
    if (N(a)) {
      var h = r.level == null ? 0 : r.level >= 0 ? r.level : a.length + r.level;
      h = Math.min(h, a.length - 1), a = a[h];
    }
  }
  return bs(new Date(r.value), a, n, i);
}
function fy(r, t) {
  var e = Ve(r), i = e[Bi(t)]() + 1, n = e[ws(t)](), a = e[oa(t)](), o = e[xs(t)](), s = e[Ts(t)](), l = e[Cs(t)](), u = l === 0, f = u && s === 0, h = f && o === 0, v = h && a === 0, c = v && n === 1, d = c && i === 1;
  return d ? "year" : c ? "month" : v ? "day" : h ? "hour" : f ? "minute" : u ? "second" : "millisecond";
}
function wv(r, t, e) {
  var i = vt(r) ? Ve(r) : r;
  switch (t = t || fy(r, e), t) {
    case "year":
      return i[oh(e)]();
    case "half-year":
      return i[Bi(e)]() >= 6 ? 1 : 0;
    case "quarter":
      return Math.floor((i[Bi(e)]() + 1) / 4);
    case "month":
      return i[Bi(e)]();
    case "day":
      return i[ws(e)]();
    case "half-day":
      return i[oa(e)]() / 24;
    case "hour":
      return i[oa(e)]();
    case "minute":
      return i[xs(e)]();
    case "second":
      return i[Ts(e)]();
    case "millisecond":
      return i[Cs(e)]();
  }
}
function oh(r) {
  return r ? "getUTCFullYear" : "getFullYear";
}
function Bi(r) {
  return r ? "getUTCMonth" : "getMonth";
}
function ws(r) {
  return r ? "getUTCDate" : "getDate";
}
function oa(r) {
  return r ? "getUTCHours" : "getHours";
}
function xs(r) {
  return r ? "getUTCMinutes" : "getMinutes";
}
function Ts(r) {
  return r ? "getUTCSeconds" : "getSeconds";
}
function Cs(r) {
  return r ? "getUTCMilliseconds" : "getMilliseconds";
}
function Nw(r) {
  return r ? "setUTCFullYear" : "setFullYear";
}
function hy(r) {
  return r ? "setUTCMonth" : "setMonth";
}
function cy(r) {
  return r ? "setUTCDate" : "setDate";
}
function vy(r) {
  return r ? "setUTCHours" : "setHours";
}
function dy(r) {
  return r ? "setUTCMinutes" : "setMinutes";
}
function py(r) {
  return r ? "setUTCSeconds" : "setSeconds";
}
function gy(r) {
  return r ? "setUTCMilliseconds" : "setMilliseconds";
}
function yy(r) {
  if (!$1(r))
    return z(r) ? r : "-";
  var t = (r + "").split(".");
  return t[0].replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, "$1,") + (t.length > 1 ? "." + t[1] : "");
}
function my(r, t) {
  return r = (r || "").toLowerCase().replace(/-(.)/g, function(e, i) {
    return i.toUpperCase();
  }), t && r && (r = r.charAt(0).toUpperCase() + r.slice(1)), r;
}
var Ms = Zp;
function Hu(r, t, e) {
  var i = "{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}";
  function n(f) {
    return f && Me(f) ? f : "-";
  }
  function a(f) {
    return !!(f != null && !isNaN(f) && isFinite(f));
  }
  var o = t === "time", s = r instanceof Date;
  if (o || s) {
    var l = o ? Ve(r) : r;
    if (isNaN(+l)) {
      if (s)
        return "-";
    } else return bs(l, i, e);
  }
  if (t === "ordinal")
    return cu(r) ? n(r) : vt(r) && a(r) ? r + "" : "-";
  var u = Bo(r);
  return a(u) ? yy(u) : cu(r) ? n(r) : typeof r == "boolean" ? r + "" : "-";
}
var xv = ["a", "b", "c", "d", "e", "f", "g"], Dl = function(r, t) {
  return "{" + r + (t ?? "") + "}";
};
function _y(r, t, e) {
  N(t) || (t = [t]);
  var i = t.length;
  if (!i)
    return "";
  for (var n = t[0].$vars || [], a = 0; a < n.length; a++) {
    var o = xv[a];
    r = r.replace(Dl(o), Dl(o, 0));
  }
  for (var s = 0; s < i; s++)
    for (var l = 0; l < n.length; l++) {
      var u = t[s][n[l]];
      r = r.replace(Dl(xv[l], s), e ? $t(u) : u);
    }
  return r;
}
function Bw(r, t) {
  var e = z(r) ? {
    color: r,
    extraCssText: t
  } : r || {}, i = e.color, n = e.type;
  t = e.extraCssText;
  var a = e.renderMode || "html";
  if (!i)
    return "";
  if (a === "html")
    return n === "subItem" ? '<span style="display:inline-block;vertical-align:middle;margin-right:8px;margin-left:3px;border-radius:4px;width:4px;height:4px;background-color:' + $t(i) + ";" + (t || "") + '"></span>' : '<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:' + $t(i) + ";" + (t || "") + '"></span>';
  var o = e.markerId || "markerX";
  return {
    renderMode: a,
    content: "{" + o + "|}  ",
    style: n === "subItem" ? {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: i
    } : {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: i
    }
  };
}
function ei(r, t) {
  return t = t || "transparent", z(r) ? r : W(r) && r.colorStops && (r.colorStops[0] || {}).color || t;
}
var xo = A, Fw = ["left", "right", "top", "bottom", "width", "height"], Va = [["width", "left", "right"], ["height", "top", "bottom"]];
function sh(r, t, e, i, n) {
  var a = 0, o = 0;
  i == null && (i = 1 / 0), n == null && (n = 1 / 0);
  var s = 0;
  t.eachChild(function(l, u) {
    var f = l.getBoundingRect(), h = t.childAt(u + 1), v = h && h.getBoundingRect(), c, d;
    if (r === "horizontal") {
      var y = f.width + (v ? -v.x + f.x : 0);
      c = a + y, c > i || l.newline ? (a = 0, c = y, o += s + e, s = f.height) : s = Math.max(s, f.height);
    } else {
      var p = f.height + (v ? -v.y + f.y : 0);
      d = o + p, d > n || l.newline ? (a += s + e, o = 0, d = p, s = f.width) : s = Math.max(s, f.width);
    }
    l.newline || (l.x = a, l.y = o, l.markRedraw(), r === "horizontal" ? a = c + e : o = d + e);
  });
}
var Gn = sh;
ht(sh, "vertical");
ht(sh, "horizontal");
function Uo(r, t, e) {
  e = Ms(e || 0);
  var i = t.width, n = t.height, a = Tt(r.left, i), o = Tt(r.top, n), s = Tt(r.right, i), l = Tt(r.bottom, n), u = Tt(r.width, i), f = Tt(r.height, n), h = e[2] + e[0], v = e[1] + e[3], c = r.aspect;
  switch (isNaN(u) && (u = i - s - v - a), isNaN(f) && (f = n - l - h - o), c != null && (isNaN(u) && isNaN(f) && (c > i / n ? u = i * 0.8 : f = n * 0.8), isNaN(u) && (u = c * f), isNaN(f) && (f = u / c)), isNaN(a) && (a = i - s - u - v), isNaN(o) && (o = n - l - f - h), r.left || r.right) {
    case "center":
      a = i / 2 - u / 2 - e[3];
      break;
    case "right":
      a = i - u - v;
      break;
  }
  switch (r.top || r.bottom) {
    case "middle":
    case "center":
      o = n / 2 - f / 2 - e[0];
      break;
    case "bottom":
      o = n - f - h;
      break;
  }
  a = a || 0, o = o || 0, isNaN(u) && (u = i - v - a - (s || 0)), isNaN(f) && (f = n - h - o - (l || 0));
  var d = new it(a + e[3], o + e[0], u, f);
  return d.margin = e, d;
}
function sa(r) {
  var t = r.layoutMode || r.constructor.layoutMode;
  return W(t) ? t : t ? {
    type: t
  } : null;
}
function Wi(r, t, e) {
  var i = e && e.ignoreSize;
  !N(i) && (i = [i, i]);
  var n = o(Va[0], 0), a = o(Va[1], 1);
  u(Va[0], r, n), u(Va[1], r, a);
  function o(f, h) {
    var v = {}, c = 0, d = {}, y = 0, p = 2;
    if (xo(f, function(_) {
      d[_] = r[_];
    }), xo(f, function(_) {
      s(t, _) && (v[_] = d[_] = t[_]), l(v, _) && c++, l(d, _) && y++;
    }), i[h])
      return l(t, f[1]) ? d[f[2]] = null : l(t, f[2]) && (d[f[1]] = null), d;
    if (y === p || !c)
      return d;
    if (c >= p)
      return v;
    for (var g = 0; g < f.length; g++) {
      var m = f[g];
      if (!s(v, m) && s(r, m)) {
        v[m] = r[m];
        break;
      }
    }
    return v;
  }
  function s(f, h) {
    return f.hasOwnProperty(h);
  }
  function l(f, h) {
    return f[h] != null && f[h] !== "auto";
  }
  function u(f, h, v) {
    xo(f, function(c) {
      h[c] = v[c];
    });
  }
}
function Ds(r) {
  return zw({}, r);
}
function zw(r, t) {
  return t && r && xo(Fw, function(e) {
    t.hasOwnProperty(e) && (r[e] = t[e]);
  }), r;
}
var Hw = mt(), at = (
  /** @class */
  (function(r) {
    O(t, r);
    function t(e, i, n) {
      var a = r.call(this, e, i, n) || this;
      return a.uid = Ss("ec_cpt_model"), a;
    }
    return t.prototype.init = function(e, i, n) {
      this.mergeDefaultAndTheme(e, n);
    }, t.prototype.mergeDefaultAndTheme = function(e, i) {
      var n = sa(this), a = n ? Ds(e) : {}, o = i.getTheme();
      Q(e, o.get(this.mainType)), Q(e, this.getDefaultOption()), n && Wi(e, a, n);
    }, t.prototype.mergeOption = function(e, i) {
      Q(this.option, e, !0);
      var n = sa(this);
      n && Wi(this.option, e, n);
    }, t.prototype.optionUpdated = function(e, i) {
    }, t.prototype.getDefaultOption = function() {
      var e = this.constructor;
      if (!aS(e))
        return e.defaultOption;
      var i = Hw(this);
      if (!i.defaultOption) {
        for (var n = [], a = e; a; ) {
          var o = a.prototype.defaultOption;
          o && n.push(o), a = a.superClass;
        }
        for (var s = {}, l = n.length - 1; l >= 0; l--)
          s = Q(s, n[l], !0);
        i.defaultOption = s;
      }
      return i.defaultOption;
    }, t.prototype.getReferringComponents = function(e, i) {
      var n = e + "Index", a = e + "Id";
      return ya(this.ecModel, e, {
        index: this.get(n, !0),
        id: this.get(a, !0)
      }, i);
    }, t.prototype.getBoxLayoutParams = function() {
      var e = this;
      return {
        left: e.get("left"),
        top: e.get("top"),
        right: e.get("right"),
        bottom: e.get("bottom"),
        width: e.get("width"),
        height: e.get("height")
      };
    }, t.prototype.getZLevelKey = function() {
      return "";
    }, t.prototype.setZLevel = function(e) {
      this.option.zlevel = e;
    }, t.protoInitialize = (function() {
      var e = t.prototype;
      e.type = "component", e.id = "", e.name = "", e.mainType = "", e.subType = "", e.componentIndex = 0;
    })(), t;
  })(yt)
);
Dg(at, yt);
os(at);
Cw(at);
Mw(at, $w);
function $w(r) {
  var t = [];
  return A(at.getClassesByMainType(r), function(e) {
    t = t.concat(e.dependencies || e.prototype.dependencies || []);
  }), t = H(t, function(e) {
    return Ae(e).main;
  }), r !== "dataset" && rt(t, "dataset") <= 0 && t.unshift("dataset"), t;
}
var Sy = "";
typeof navigator < "u" && (Sy = navigator.platform || "");
var pi = "rgba(0, 0, 0, 0.2)";
const Vw = {
  darkMode: "auto",
  // backgroundColor: 'rgba(0,0,0,0)',
  colorBy: "series",
  color: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"],
  gradientColor: ["#f6efa6", "#d88273", "#bf444c"],
  aria: {
    decal: {
      decals: [{
        color: pi,
        dashArrayX: [1, 0],
        dashArrayY: [2, 5],
        symbolSize: 1,
        rotation: Math.PI / 6
      }, {
        color: pi,
        symbol: "circle",
        dashArrayX: [[8, 8], [0, 8, 8, 0]],
        dashArrayY: [6, 0],
        symbolSize: 0.8
      }, {
        color: pi,
        dashArrayX: [1, 0],
        dashArrayY: [4, 3],
        rotation: -Math.PI / 4
      }, {
        color: pi,
        dashArrayX: [[6, 6], [0, 6, 6, 0]],
        dashArrayY: [6, 0]
      }, {
        color: pi,
        dashArrayX: [[1, 0], [1, 6]],
        dashArrayY: [1, 0, 6, 0],
        rotation: Math.PI / 4
      }, {
        color: pi,
        symbol: "triangle",
        dashArrayX: [[9, 9], [0, 9, 9, 0]],
        dashArrayY: [7, 2],
        symbolSize: 0.75
      }]
    }
  },
  // If xAxis and yAxis declared, grid is created by default.
  // grid: {},
  textStyle: {
    // color: '#000',
    // decoration: 'none',
    // PENDING
    fontFamily: Sy.match(/^Win/) ? "Microsoft YaHei" : "sans-serif",
    // fontFamily: 'Arial, Verdana, sans-serif',
    fontSize: 12,
    fontStyle: "normal",
    fontWeight: "normal"
  },
  // http://blogs.adobe.com/webplatform/2014/02/24/using-blend-modes-in-html-canvas/
  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
  // Default is source-over
  blendMode: null,
  stateAnimation: {
    duration: 300,
    easing: "cubicOut"
  },
  animation: "auto",
  animationDuration: 1e3,
  animationDurationUpdate: 500,
  animationEasing: "cubicInOut",
  animationEasingUpdate: "cubicInOut",
  animationThreshold: 2e3,
  // Configuration for progressive/incremental rendering
  progressiveThreshold: 3e3,
  progressive: 400,
  // Threshold of if use single hover layer to optimize.
  // It is recommended that `hoverLayerThreshold` is equivalent to or less than
  // `progressiveThreshold`, otherwise hover will cause restart of progressive,
  // which is unexpected.
  // see example <echarts/test/heatmap-large.html>.
  hoverLayerThreshold: 3e3,
  // See: module:echarts/scale/Time
  useUTC: !1
};
var by = Z(["tooltip", "label", "itemName", "itemId", "itemGroupId", "itemChildGroupId", "seriesName"]), he = "original", qt = "arrayRows", Ee = "objectRows", Ye = "keyedColumns", cr = "typedArray", wy = "unknown", He = "column", ji = "row", Kt = {
  Must: 1,
  Might: 2,
  Not: 3
  // Other cases
}, xy = mt();
function Gw(r) {
  xy(r).datasetMap = Z();
}
function Ww(r, t, e) {
  var i = {}, n = Ty(t);
  if (!n || !r)
    return i;
  var a = [], o = [], s = t.ecModel, l = xy(s).datasetMap, u = n.uid + "_" + e.seriesLayoutBy, f, h;
  r = r.slice(), A(r, function(y, p) {
    var g = W(y) ? y : r[p] = {
      name: y
    };
    g.type === "ordinal" && f == null && (f = p, h = d(g)), i[g.name] = [];
  });
  var v = l.get(u) || l.set(u, {
    categoryWayDim: h,
    valueWayDim: 0
  });
  A(r, function(y, p) {
    var g = y.name, m = d(y);
    if (f == null) {
      var _ = v.valueWayDim;
      c(i[g], _, m), c(o, _, m), v.valueWayDim += m;
    } else if (f === p)
      c(i[g], 0, m), c(a, 0, m);
    else {
      var _ = v.categoryWayDim;
      c(i[g], _, m), c(o, _, m), v.categoryWayDim += m;
    }
  });
  function c(y, p, g) {
    for (var m = 0; m < g; m++)
      y.push(p + m);
  }
  function d(y) {
    var p = y.dimsDef;
    return p ? p.length : 1;
  }
  return a.length && (i.itemName = a), o.length && (i.seriesName = o), i;
}
function Ty(r) {
  var t = r.get("data", !0);
  if (!t)
    return ya(r.ecModel, "dataset", {
      index: r.get("datasetIndex", !0),
      id: r.get("datasetId", !0)
    }, ye).models[0];
}
function Uw(r) {
  return !r.get("transform", !0) && !r.get("fromTransformResult", !0) ? [] : ya(r.ecModel, "dataset", {
    index: r.get("fromDatasetIndex", !0),
    id: r.get("fromDatasetId", !0)
  }, ye).models;
}
function Cy(r, t) {
  return Yw(r.data, r.sourceFormat, r.seriesLayoutBy, r.dimensionsDefine, r.startIndex, t);
}
function Yw(r, t, e, i, n, a) {
  var o, s = 5;
  if (Xt(r))
    return Kt.Not;
  var l, u;
  if (i) {
    var f = i[a];
    W(f) ? (l = f.name, u = f.type) : z(f) && (l = f);
  }
  if (u != null)
    return u === "ordinal" ? Kt.Must : Kt.Not;
  if (t === qt) {
    var h = r;
    if (e === ji) {
      for (var v = h[a], c = 0; c < (v || []).length && c < s; c++)
        if ((o = S(v[n + c])) != null)
          return o;
    } else
      for (var c = 0; c < h.length && c < s; c++) {
        var d = h[n + c];
        if (d && (o = S(d[a])) != null)
          return o;
      }
  } else if (t === Ee) {
    var y = r;
    if (!l)
      return Kt.Not;
    for (var c = 0; c < y.length && c < s; c++) {
      var p = y[c];
      if (p && (o = S(p[l])) != null)
        return o;
    }
  } else if (t === Ye) {
    var g = r;
    if (!l)
      return Kt.Not;
    var v = g[l];
    if (!v || Xt(v))
      return Kt.Not;
    for (var c = 0; c < v.length && c < s; c++)
      if ((o = S(v[c])) != null)
        return o;
  } else if (t === he)
    for (var m = r, c = 0; c < m.length && c < s; c++) {
      var p = m[c], _ = ga(p);
      if (!N(_))
        return Kt.Not;
      if ((o = S(_[a])) != null)
        return o;
    }
  function S(w) {
    var b = z(w);
    if (w != null && Number.isFinite(Number(w)) && w !== "")
      return b ? Kt.Might : Kt.Not;
    if (b && w !== "-")
      return Kt.Must;
  }
  return Kt.Not;
}
var Xw = Z();
function Zw(r, t, e) {
  var i = Xw.get(t);
  if (!i)
    return e;
  var n = i(r);
  return n ? e.concat(n) : e;
}
var Tv = mt();
mt();
var lh = (
  /** @class */
  (function() {
    function r() {
    }
    return r.prototype.getColorFromPalette = function(t, e, i) {
      var n = Ot(this.get("color", !0)), a = this.get("colorLayer", !0);
      return Kw(this, Tv, n, a, t, e, i);
    }, r.prototype.clearColorPalette = function() {
      jw(this, Tv);
    }, r;
  })()
);
function qw(r, t) {
  for (var e = r.length, i = 0; i < e; i++)
    if (r[i].length > t)
      return r[i];
  return r[e - 1];
}
function Kw(r, t, e, i, n, a, o) {
  a = a || r;
  var s = t(a), l = s.paletteIdx || 0, u = s.paletteNameMap = s.paletteNameMap || {};
  if (u.hasOwnProperty(n))
    return u[n];
  var f = o == null || !i ? e : qw(i, o);
  if (f = f || e, !(!f || !f.length)) {
    var h = f[l];
    return n && (u[n] = h), s.paletteIdx = (l + 1) % f.length, h;
  }
}
function jw(r, t) {
  t(r).paletteIdx = 0, t(r).paletteNameMap = {};
}
var Ga, hn, Cv, Mv = "\0_ec_inner", Qw = 1, uh = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      return r !== null && r.apply(this, arguments) || this;
    }
    return t.prototype.init = function(e, i, n, a, o, s) {
      a = a || {}, this.option = null, this._theme = new yt(a), this._locale = new yt(o), this._optionManager = s;
    }, t.prototype.setOption = function(e, i, n) {
      var a = Lv(i);
      this._optionManager.setOption(e, n, a), this._resetOption(null, a);
    }, t.prototype.resetOption = function(e, i) {
      return this._resetOption(e, Lv(i));
    }, t.prototype._resetOption = function(e, i) {
      var n = !1, a = this._optionManager;
      if (!e || e === "recreate") {
        var o = a.mountOption(e === "recreate");
        !this.option || e === "recreate" ? Cv(this, o) : (this.restoreData(), this._mergeOption(o, i)), n = !0;
      }
      if ((e === "timeline" || e === "media") && this.restoreData(), !e || e === "recreate" || e === "timeline") {
        var s = a.getTimelineOption(this);
        s && (n = !0, this._mergeOption(s, i));
      }
      if (!e || e === "recreate" || e === "media") {
        var l = a.getMediaOption(this);
        l.length && A(l, function(u) {
          n = !0, this._mergeOption(u, i);
        }, this);
      }
      return n;
    }, t.prototype.mergeOption = function(e) {
      this._mergeOption(e, null);
    }, t.prototype._mergeOption = function(e, i) {
      var n = this.option, a = this._componentsMap, o = this._componentsCount, s = [], l = Z(), u = i && i.replaceMergeMainTypeMap;
      Gw(this), A(e, function(h, v) {
        h != null && (at.hasClass(v) ? v && (s.push(v), l.set(v, !0)) : n[v] = n[v] == null ? K(h) : Q(n[v], h, !0));
      }), u && u.each(function(h, v) {
        at.hasClass(v) && !l.get(v) && (s.push(v), l.set(v, !0));
      }), at.topologicalTravel(s, at.getAllClassMainTypes(), f, this);
      function f(h) {
        var v = Zw(this, h, Ot(e[h])), c = a.get(h), d = (
          // `!oldCmptList` means init. See the comment in `mappingToExists`
          c ? u && u.get(h) ? "replaceMerge" : "normalMerge" : "replaceAll"
        ), y = W1(c, v, d);
        j1(y, h, at), n[h] = null, a.set(h, null), o.set(h, 0);
        var p = [], g = [], m = 0, _;
        A(y, function(S, w) {
          var b = S.existing, x = S.newOption;
          if (!x)
            b && (b.mergeOption({}, this), b.optionUpdated({}, !1));
          else {
            var D = h === "series", T = at.getClass(
              h,
              S.keyInfo.subType,
              !D
              // Give a more detailed warn later if series don't exists
            );
            if (!T)
              return;
            if (h === "tooltip") {
              if (_)
                return;
              _ = !0;
            }
            if (b && b.constructor === T)
              b.name = S.keyInfo.name, b.mergeOption(x, this), b.optionUpdated(x, !1);
            else {
              var C = k({
                componentIndex: w
              }, S.keyInfo);
              b = new T(x, this, this, C), k(b, C), S.brandNew && (b.__requireNewView = !0), b.init(x, this, this), b.optionUpdated(null, !0);
            }
          }
          b ? (p.push(b.option), g.push(b), m++) : (p.push(void 0), g.push(void 0));
        }, this), n[h] = p, a.set(h, g), o.set(h, m), h === "series" && Ga(this);
      }
      this._seriesIndices || Ga(this);
    }, t.prototype.getOption = function() {
      var e = K(this.option);
      return A(e, function(i, n) {
        if (at.hasClass(n)) {
          for (var a = Ot(i), o = a.length, s = !1, l = o - 1; l >= 0; l--)
            a[l] && !ea(a[l]) ? s = !0 : (a[l] = null, !s && o--);
          a.length = o, e[n] = a;
        }
      }), delete e[Mv], e;
    }, t.prototype.getTheme = function() {
      return this._theme;
    }, t.prototype.getLocaleModel = function() {
      return this._locale;
    }, t.prototype.setUpdatePayload = function(e) {
      this._payload = e;
    }, t.prototype.getUpdatePayload = function() {
      return this._payload;
    }, t.prototype.getComponent = function(e, i) {
      var n = this._componentsMap.get(e);
      if (n) {
        var a = n[i || 0];
        if (a)
          return a;
        if (i == null) {
          for (var o = 0; o < n.length; o++)
            if (n[o])
              return n[o];
        }
      }
    }, t.prototype.queryComponents = function(e) {
      var i = e.mainType;
      if (!i)
        return [];
      var n = e.index, a = e.id, o = e.name, s = this._componentsMap.get(i);
      if (!s || !s.length)
        return [];
      var l;
      return n != null ? (l = [], A(Ot(n), function(u) {
        s[u] && l.push(s[u]);
      })) : a != null ? l = Dv("id", a, s) : o != null ? l = Dv("name", o, s) : l = xt(s, function(u) {
        return !!u;
      }), Av(l, e);
    }, t.prototype.findComponents = function(e) {
      var i = e.query, n = e.mainType, a = s(i), o = a ? this.queryComponents(a) : xt(this._componentsMap.get(n), function(u) {
        return !!u;
      });
      return l(Av(o, e));
      function s(u) {
        var f = n + "Index", h = n + "Id", v = n + "Name";
        return u && (u[f] != null || u[h] != null || u[v] != null) ? {
          mainType: n,
          // subType will be filtered finally.
          index: u[f],
          id: u[h],
          name: u[v]
        } : null;
      }
      function l(u) {
        return e.filter ? xt(u, e.filter) : u;
      }
    }, t.prototype.eachComponent = function(e, i, n) {
      var a = this._componentsMap;
      if (G(e)) {
        var o = i, s = e;
        a.each(function(h, v) {
          for (var c = 0; h && c < h.length; c++) {
            var d = h[c];
            d && s.call(o, v, d, d.componentIndex);
          }
        });
      } else
        for (var l = z(e) ? a.get(e) : W(e) ? this.findComponents(e) : null, u = 0; l && u < l.length; u++) {
          var f = l[u];
          f && i.call(n, f, f.componentIndex);
        }
    }, t.prototype.getSeriesByName = function(e) {
      var i = Le(e, null);
      return xt(this._componentsMap.get("series"), function(n) {
        return !!n && i != null && n.name === i;
      });
    }, t.prototype.getSeriesByIndex = function(e) {
      return this._componentsMap.get("series")[e];
    }, t.prototype.getSeriesByType = function(e) {
      return xt(this._componentsMap.get("series"), function(i) {
        return !!i && i.subType === e;
      });
    }, t.prototype.getSeries = function() {
      return xt(this._componentsMap.get("series"), function(e) {
        return !!e;
      });
    }, t.prototype.getSeriesCount = function() {
      return this._componentsCount.get("series");
    }, t.prototype.eachSeries = function(e, i) {
      hn(this), A(this._seriesIndices, function(n) {
        var a = this._componentsMap.get("series")[n];
        e.call(i, a, n);
      }, this);
    }, t.prototype.eachRawSeries = function(e, i) {
      A(this._componentsMap.get("series"), function(n) {
        n && e.call(i, n, n.componentIndex);
      });
    }, t.prototype.eachSeriesByType = function(e, i, n) {
      hn(this), A(this._seriesIndices, function(a) {
        var o = this._componentsMap.get("series")[a];
        o.subType === e && i.call(n, o, a);
      }, this);
    }, t.prototype.eachRawSeriesByType = function(e, i, n) {
      return A(this.getSeriesByType(e), i, n);
    }, t.prototype.isSeriesFiltered = function(e) {
      return hn(this), this._seriesIndicesMap.get(e.componentIndex) == null;
    }, t.prototype.getCurrentSeriesIndices = function() {
      return (this._seriesIndices || []).slice();
    }, t.prototype.filterSeries = function(e, i) {
      hn(this);
      var n = [];
      A(this._seriesIndices, function(a) {
        var o = this._componentsMap.get("series")[a];
        e.call(i, o, a) && n.push(a);
      }, this), this._seriesIndices = n, this._seriesIndicesMap = Z(n);
    }, t.prototype.restoreData = function(e) {
      Ga(this);
      var i = this._componentsMap, n = [];
      i.each(function(a, o) {
        at.hasClass(o) && n.push(o);
      }), at.topologicalTravel(n, at.getAllClassMainTypes(), function(a) {
        A(i.get(a), function(o) {
          o && (a !== "series" || !Jw(o, e)) && o.restoreData();
        });
      });
    }, t.internalField = (function() {
      Ga = function(e) {
        var i = e._seriesIndices = [];
        A(e._componentsMap.get("series"), function(n) {
          n && i.push(n.componentIndex);
        }), e._seriesIndicesMap = Z(i);
      }, hn = function(e) {
      }, Cv = function(e, i) {
        e.option = {}, e.option[Mv] = Qw, e._componentsMap = Z({
          series: []
        }), e._componentsCount = Z();
        var n = i.aria;
        W(n) && n.enabled == null && (n.enabled = !0), tx(i, e._theme.option), Q(i, Vw, !1), e._mergeOption(i, null);
      };
    })(), t;
  })(yt)
);
function Jw(r, t) {
  if (t) {
    var e = t.seriesIndex, i = t.seriesId, n = t.seriesName;
    return e != null && r.componentIndex !== e || i != null && r.id !== i || n != null && r.name !== n;
  }
}
function tx(r, t) {
  var e = r.color && !r.colorLayer;
  A(t, function(i, n) {
    n === "colorLayer" && e || at.hasClass(n) || (typeof i == "object" ? r[n] = r[n] ? Q(r[n], i, !1) : K(i) : r[n] == null && (r[n] = i));
  });
}
function Dv(r, t, e) {
  if (N(t)) {
    var i = Z();
    return A(t, function(a) {
      if (a != null) {
        var o = Le(a, null);
        o != null && i.set(a, !0);
      }
    }), xt(e, function(a) {
      return a && i.get(a[r]);
    });
  } else {
    var n = Le(t, null);
    return xt(e, function(a) {
      return a && n != null && a[r] === n;
    });
  }
}
function Av(r, t) {
  return t.hasOwnProperty("subType") ? xt(r, function(e) {
    return e && e.subType === t.subType;
  }) : r;
}
function Lv(r) {
  var t = Z();
  return r && A(Ot(r.replaceMerge), function(e) {
    t.set(e, !0);
  }), {
    replaceMergeMainTypeMap: t
  };
}
_e(uh, lh);
var ex = [
  "getDom",
  "getZr",
  "getWidth",
  "getHeight",
  "getDevicePixelRatio",
  "dispatchAction",
  "isSSR",
  "isDisposed",
  "on",
  "off",
  "getDataURL",
  "getConnectedDataURL",
  // 'getModel',
  "getOption",
  // 'getViewOfComponentModel',
  // 'getViewOfSeriesModel',
  "getId",
  "updateLabelLayout"
], My = (
  /** @class */
  /* @__PURE__ */ (function() {
    function r(t) {
      A(ex, function(e) {
        this[e] = dt(t[e], t);
      }, this);
    }
    return r;
  })()
), Al = {}, fh = (
  /** @class */
  (function() {
    function r() {
      this._coordinateSystems = [];
    }
    return r.prototype.create = function(t, e) {
      var i = [];
      A(Al, function(n, a) {
        var o = n.create(t, e);
        i = i.concat(o || []);
      }), this._coordinateSystems = i;
    }, r.prototype.update = function(t, e) {
      A(this._coordinateSystems, function(i) {
        i.update && i.update(t, e);
      });
    }, r.prototype.getCoordinateSystems = function() {
      return this._coordinateSystems.slice();
    }, r.register = function(t, e) {
      Al[t] = e;
    }, r.get = function(t) {
      return Al[t];
    }, r;
  })()
), rx = /^(min|max)?(.+)$/, ix = (
  /** @class */
  (function() {
    function r(t) {
      this._timelineOptions = [], this._mediaList = [], this._currentMediaIndices = [], this._api = t;
    }
    return r.prototype.setOption = function(t, e, i) {
      t && (A(Ot(t.series), function(o) {
        o && o.data && Xt(o.data) && vu(o.data);
      }), A(Ot(t.dataset), function(o) {
        o && o.source && Xt(o.source) && vu(o.source);
      })), t = K(t);
      var n = this._optionBackup, a = nx(t, e, !n);
      this._newBaseOption = a.baseOption, n ? (a.timelineOptions.length && (n.timelineOptions = a.timelineOptions), a.mediaList.length && (n.mediaList = a.mediaList), a.mediaDefault && (n.mediaDefault = a.mediaDefault)) : this._optionBackup = a;
    }, r.prototype.mountOption = function(t) {
      var e = this._optionBackup;
      return this._timelineOptions = e.timelineOptions, this._mediaList = e.mediaList, this._mediaDefault = e.mediaDefault, this._currentMediaIndices = [], K(t ? e.baseOption : this._newBaseOption);
    }, r.prototype.getTimelineOption = function(t) {
      var e, i = this._timelineOptions;
      if (i.length) {
        var n = t.getComponent("timeline");
        n && (e = K(
          // FIXME:TS as TimelineModel or quivlant interface
          i[n.getCurrentIndex()]
        ));
      }
      return e;
    }, r.prototype.getMediaOption = function(t) {
      var e = this._api.getWidth(), i = this._api.getHeight(), n = this._mediaList, a = this._mediaDefault, o = [], s = [];
      if (!n.length && !a)
        return s;
      for (var l = 0, u = n.length; l < u; l++)
        ax(n[l].query, e, i) && o.push(l);
      return !o.length && a && (o = [-1]), o.length && !sx(o, this._currentMediaIndices) && (s = H(o, function(f) {
        return K(f === -1 ? a.option : n[f].option);
      })), this._currentMediaIndices = o, s;
    }, r;
  })()
);
function nx(r, t, e) {
  var i = [], n, a, o = r.baseOption, s = r.timeline, l = r.options, u = r.media, f = !!r.media, h = !!(l || s || o && o.timeline);
  o ? (a = o, a.timeline || (a.timeline = s)) : ((h || f) && (r.options = r.media = null), a = r), f && N(u) && A(u, function(c) {
    c && c.option && (c.query ? i.push(c) : n || (n = c));
  }), v(a), A(l, function(c) {
    return v(c);
  }), A(i, function(c) {
    return v(c.option);
  });
  function v(c) {
    A(t, function(d) {
      d(c, e);
    });
  }
  return {
    baseOption: a,
    timelineOptions: l || [],
    mediaDefault: n,
    mediaList: i
  };
}
function ax(r, t, e) {
  var i = {
    width: t,
    height: e,
    aspectratio: t / e
    // lower case for convenience.
  }, n = !0;
  return A(r, function(a, o) {
    var s = o.match(rx);
    if (!(!s || !s[1] || !s[2])) {
      var l = s[1], u = s[2].toLowerCase();
      ox(i[u], a, l) || (n = !1);
    }
  }), n;
}
function ox(r, t, e) {
  return e === "min" ? r >= t : e === "max" ? r <= t : r === t;
}
function sx(r, t) {
  return r.join(",") === t.join(",");
}
var ce = A, la = W, Pv = ["areaStyle", "lineStyle", "nodeStyle", "linkStyle", "chordStyle", "label", "labelLine"];
function Ll(r) {
  var t = r && r.itemStyle;
  if (t)
    for (var e = 0, i = Pv.length; e < i; e++) {
      var n = Pv[e], a = t.normal, o = t.emphasis;
      a && a[n] && (r[n] = r[n] || {}, r[n].normal ? Q(r[n].normal, a[n]) : r[n].normal = a[n], a[n] = null), o && o[n] && (r[n] = r[n] || {}, r[n].emphasis ? Q(r[n].emphasis, o[n]) : r[n].emphasis = o[n], o[n] = null);
    }
}
function Rt(r, t, e) {
  if (r && r[t] && (r[t].normal || r[t].emphasis)) {
    var i = r[t].normal, n = r[t].emphasis;
    i && (e ? (r[t].normal = r[t].emphasis = null, ot(r[t], i)) : r[t] = i), n && (r.emphasis = r.emphasis || {}, r.emphasis[t] = n, n.focus && (r.emphasis.focus = n.focus), n.blurScope && (r.emphasis.blurScope = n.blurScope));
  }
}
function Ln(r) {
  Rt(r, "itemStyle"), Rt(r, "lineStyle"), Rt(r, "areaStyle"), Rt(r, "label"), Rt(r, "labelLine"), Rt(r, "upperLabel"), Rt(r, "edgeLabel");
}
function bt(r, t) {
  var e = la(r) && r[t], i = la(e) && e.textStyle;
  if (i)
    for (var n = 0, a = Ic.length; n < a; n++) {
      var o = Ic[n];
      i.hasOwnProperty(o) && (e[o] = i[o]);
    }
}
function ie(r) {
  r && (Ln(r), bt(r, "label"), r.emphasis && bt(r.emphasis, "label"));
}
function lx(r) {
  if (la(r)) {
    Ll(r), Ln(r), bt(r, "label"), bt(r, "upperLabel"), bt(r, "edgeLabel"), r.emphasis && (bt(r.emphasis, "label"), bt(r.emphasis, "upperLabel"), bt(r.emphasis, "edgeLabel"));
    var t = r.markPoint;
    t && (Ll(t), ie(t));
    var e = r.markLine;
    e && (Ll(e), ie(e));
    var i = r.markArea;
    i && ie(i);
    var n = r.data;
    if (r.type === "graph") {
      n = n || r.nodes;
      var a = r.links || r.edges;
      if (a && !Xt(a))
        for (var o = 0; o < a.length; o++)
          ie(a[o]);
      A(r.categories, function(u) {
        Ln(u);
      });
    }
    if (n && !Xt(n))
      for (var o = 0; o < n.length; o++)
        ie(n[o]);
    if (t = r.markPoint, t && t.data)
      for (var s = t.data, o = 0; o < s.length; o++)
        ie(s[o]);
    if (e = r.markLine, e && e.data)
      for (var l = e.data, o = 0; o < l.length; o++)
        N(l[o]) ? (ie(l[o][0]), ie(l[o][1])) : ie(l[o]);
    r.type === "gauge" ? (bt(r, "axisLabel"), bt(r, "title"), bt(r, "detail")) : r.type === "treemap" ? (Rt(r.breadcrumb, "itemStyle"), A(r.levels, function(u) {
      Ln(u);
    })) : r.type === "tree" && Ln(r.leaves);
  }
}
function Ne(r) {
  return N(r) ? r : r ? [r] : [];
}
function Iv(r) {
  return (N(r) ? r[0] : r) || {};
}
function ux(r, t) {
  ce(Ne(r.series), function(i) {
    la(i) && lx(i);
  });
  var e = ["xAxis", "yAxis", "radiusAxis", "angleAxis", "singleAxis", "parallelAxis", "radar"];
  t && e.push("valueAxis", "categoryAxis", "logAxis", "timeAxis"), ce(e, function(i) {
    ce(Ne(r[i]), function(n) {
      n && (bt(n, "axisLabel"), bt(n.axisPointer, "label"));
    });
  }), ce(Ne(r.parallel), function(i) {
    var n = i && i.parallelAxisDefault;
    bt(n, "axisLabel"), bt(n && n.axisPointer, "label");
  }), ce(Ne(r.calendar), function(i) {
    Rt(i, "itemStyle"), bt(i, "dayLabel"), bt(i, "monthLabel"), bt(i, "yearLabel");
  }), ce(Ne(r.radar), function(i) {
    bt(i, "name"), i.name && i.axisName == null && (i.axisName = i.name, delete i.name), i.nameGap != null && i.axisNameGap == null && (i.axisNameGap = i.nameGap, delete i.nameGap);
  }), ce(Ne(r.geo), function(i) {
    la(i) && (ie(i), ce(Ne(i.regions), function(n) {
      ie(n);
    }));
  }), ce(Ne(r.timeline), function(i) {
    ie(i), Rt(i, "label"), Rt(i, "itemStyle"), Rt(i, "controlStyle", !0);
    var n = i.data;
    N(n) && A(n, function(a) {
      W(a) && (Rt(a, "label"), Rt(a, "itemStyle"));
    });
  }), ce(Ne(r.toolbox), function(i) {
    Rt(i, "iconStyle"), ce(i.feature, function(n) {
      Rt(n, "iconStyle");
    });
  }), bt(Iv(r.axisPointer), "label"), bt(Iv(r.tooltip).axisPointer, "label");
}
function fx(r, t) {
  for (var e = t.split(","), i = r, n = 0; n < e.length && (i = i && i[e[n]], i != null); n++)
    ;
  return i;
}
function hx(r, t, e, i) {
  for (var n = t.split(","), a = r, o, s = 0; s < n.length - 1; s++)
    o = n[s], a[o] == null && (a[o] = {}), a = a[o];
  a[n[s]] == null && (a[n[s]] = e);
}
function Ev(r) {
  r && A(cx, function(t) {
    t[0] in r && !(t[1] in r) && (r[t[1]] = r[t[0]]);
  });
}
var cx = [["x", "left"], ["y", "top"], ["x2", "right"], ["y2", "bottom"]], vx = ["grid", "geo", "parallel", "legend", "toolbox", "title", "visualMap", "dataZoom", "timeline"], Pl = [["borderRadius", "barBorderRadius"], ["borderColor", "barBorderColor"], ["borderWidth", "barBorderWidth"]];
function cn(r) {
  var t = r && r.itemStyle;
  if (t)
    for (var e = 0; e < Pl.length; e++) {
      var i = Pl[e][1], n = Pl[e][0];
      t[i] != null && (t[n] = t[i]);
    }
}
function Rv(r) {
  r && r.alignTo === "edge" && r.margin != null && r.edgeDistance == null && (r.edgeDistance = r.margin);
}
function kv(r) {
  r && r.downplay && !r.blur && (r.blur = r.downplay);
}
function dx(r) {
  r && r.focusNodeAdjacency != null && (r.emphasis = r.emphasis || {}, r.emphasis.focus == null && (r.emphasis.focus = "adjacency"));
}
function Dy(r, t) {
  if (r)
    for (var e = 0; e < r.length; e++)
      t(r[e]), r[e] && Dy(r[e].children, t);
}
function Ay(r, t) {
  ux(r, t), r.series = Ot(r.series), A(r.series, function(e) {
    if (W(e)) {
      var i = e.type;
      if (i === "line")
        e.clipOverflow != null && (e.clip = e.clipOverflow);
      else if (i === "pie" || i === "gauge") {
        e.clockWise != null && (e.clockwise = e.clockWise), Rv(e.label);
        var n = e.data;
        if (n && !Xt(n))
          for (var a = 0; a < n.length; a++)
            Rv(n[a]);
        e.hoverOffset != null && (e.emphasis = e.emphasis || {}, (e.emphasis.scaleSize = null) && (e.emphasis.scaleSize = e.hoverOffset));
      } else if (i === "gauge") {
        var o = fx(e, "pointer.color");
        o != null && hx(e, "itemStyle.color", o);
      } else if (i === "bar") {
        cn(e), cn(e.backgroundStyle), cn(e.emphasis);
        var n = e.data;
        if (n && !Xt(n))
          for (var a = 0; a < n.length; a++)
            typeof n[a] == "object" && (cn(n[a]), cn(n[a] && n[a].emphasis));
      } else if (i === "sunburst") {
        var s = e.highlightPolicy;
        s && (e.emphasis = e.emphasis || {}, e.emphasis.focus || (e.emphasis.focus = s)), kv(e), Dy(e.data, kv);
      } else i === "graph" || i === "sankey" ? dx(e) : i === "map" && (e.mapType && !e.map && (e.map = e.mapType), e.mapLocation && ot(e, e.mapLocation));
      e.hoverAnimation != null && (e.emphasis = e.emphasis || {}, e.emphasis && e.emphasis.scale == null && (e.emphasis.scale = e.hoverAnimation)), Ev(e);
    }
  }), r.dataRange && (r.visualMap = r.dataRange), A(vx, function(e) {
    var i = r[e];
    i && (N(i) || (i = [i]), A(i, function(n) {
      Ev(n);
    }));
  });
}
function px(r) {
  var t = Z();
  r.eachSeries(function(e) {
    var i = e.get("stack");
    if (i) {
      var n = t.get(i) || t.set(i, []), a = e.getData(), o = {
        // Used for calculate axis extent automatically.
        // TODO: Type getCalculationInfo return more specific type?
        stackResultDimension: a.getCalculationInfo("stackResultDimension"),
        stackedOverDimension: a.getCalculationInfo("stackedOverDimension"),
        stackedDimension: a.getCalculationInfo("stackedDimension"),
        stackedByDimension: a.getCalculationInfo("stackedByDimension"),
        isStackedByIndex: a.getCalculationInfo("isStackedByIndex"),
        data: a,
        seriesModel: e
      };
      if (!o.stackedDimension || !(o.isStackedByIndex || o.stackedByDimension))
        return;
      n.length && a.setCalculationInfo("stackedOnSeries", n[n.length - 1].seriesModel), n.push(o);
    }
  }), t.each(gx);
}
function gx(r) {
  A(r, function(t, e) {
    var i = [], n = [NaN, NaN], a = [t.stackResultDimension, t.stackedOverDimension], o = t.data, s = t.isStackedByIndex, l = t.seriesModel.get("stackStrategy") || "samesign";
    o.modify(a, function(u, f, h) {
      var v = o.get(t.stackedDimension, h);
      if (isNaN(v))
        return n;
      var c, d;
      s ? d = o.getRawIndex(h) : c = o.get(t.stackedByDimension, h);
      for (var y = NaN, p = e - 1; p >= 0; p--) {
        var g = r[p];
        if (s || (d = g.data.rawIndexOf(g.stackedByDimension, c)), d >= 0) {
          var m = g.data.getByRawIndex(g.stackResultDimension, d);
          if (l === "all" || l === "positive" && m > 0 || l === "negative" && m < 0 || l === "samesign" && v >= 0 && m > 0 || l === "samesign" && v <= 0 && m < 0) {
            v = F1(v, m), y = m;
            break;
          }
        }
      }
      return i[0] = v, i[1] = y, i;
    });
  });
}
var As = (
  /** @class */
  /* @__PURE__ */ (function() {
    function r(t) {
      this.data = t.data || (t.sourceFormat === Ye ? {} : []), this.sourceFormat = t.sourceFormat || wy, this.seriesLayoutBy = t.seriesLayoutBy || He, this.startIndex = t.startIndex || 0, this.dimensionsDetectedCount = t.dimensionsDetectedCount, this.metaRawOption = t.metaRawOption;
      var e = this.dimensionsDefine = t.dimensionsDefine;
      if (e)
        for (var i = 0; i < e.length; i++) {
          var n = e[i];
          n.type == null && Cy(this, i) === Kt.Must && (n.type = "ordinal");
        }
    }
    return r;
  })()
);
function hh(r) {
  return r instanceof As;
}
function $u(r, t, e) {
  e = e || Py(r);
  var i = t.seriesLayoutBy, n = mx(r, e, i, t.sourceHeader, t.dimensions), a = new As({
    data: r,
    sourceFormat: e,
    seriesLayoutBy: i,
    dimensionsDefine: n.dimensionsDefine,
    startIndex: n.startIndex,
    dimensionsDetectedCount: n.dimensionsDetectedCount,
    metaRawOption: K(t)
  });
  return a;
}
function Ly(r) {
  return new As({
    data: r,
    sourceFormat: Xt(r) ? cr : he
  });
}
function yx(r) {
  return new As({
    data: r.data,
    sourceFormat: r.sourceFormat,
    seriesLayoutBy: r.seriesLayoutBy,
    dimensionsDefine: K(r.dimensionsDefine),
    startIndex: r.startIndex,
    dimensionsDetectedCount: r.dimensionsDetectedCount
  });
}
function Py(r) {
  var t = wy;
  if (Xt(r))
    t = cr;
  else if (N(r)) {
    r.length === 0 && (t = qt);
    for (var e = 0, i = r.length; e < i; e++) {
      var n = r[e];
      if (n != null) {
        if (N(n) || Xt(n)) {
          t = qt;
          break;
        } else if (W(n)) {
          t = Ee;
          break;
        }
      }
    }
  } else if (W(r)) {
    for (var a in r)
      if (jr(r, a) && Yt(r[a])) {
        t = Ye;
        break;
      }
  }
  return t;
}
function mx(r, t, e, i, n) {
  var a, o;
  if (!r)
    return {
      dimensionsDefine: Ov(n),
      startIndex: o,
      dimensionsDetectedCount: a
    };
  if (t === qt) {
    var s = r;
    i === "auto" || i == null ? Nv(function(u) {
      u != null && u !== "-" && (z(u) ? o == null && (o = 1) : o = 0);
    }, e, s, 10) : o = vt(i) ? i : i ? 1 : 0, !n && o === 1 && (n = [], Nv(function(u, f) {
      n[f] = u != null ? u + "" : "";
    }, e, s, 1 / 0)), a = n ? n.length : e === ji ? s.length : s[0] ? s[0].length : null;
  } else if (t === Ee)
    n || (n = _x(r));
  else if (t === Ye)
    n || (n = [], A(r, function(u, f) {
      n.push(f);
    }));
  else if (t === he) {
    var l = ga(r[0]);
    a = N(l) && l.length || 1;
  }
  return {
    startIndex: o,
    dimensionsDefine: Ov(n),
    dimensionsDetectedCount: a
  };
}
function _x(r) {
  for (var t = 0, e; t < r.length && !(e = r[t++]); )
    ;
  if (e)
    return pt(e);
}
function Ov(r) {
  if (r) {
    var t = Z();
    return H(r, function(e, i) {
      e = W(e) ? e : {
        name: e
      };
      var n = {
        name: e.name,
        displayName: e.displayName,
        type: e.type
      };
      if (n.name == null)
        return n;
      n.name += "", n.displayName == null && (n.displayName = n.name);
      var a = t.get(n.name);
      return a ? n.name += "-" + a.count++ : t.set(n.name, {
        count: 1
      }), n;
    });
  }
}
function Nv(r, t, e, i) {
  if (t === ji)
    for (var n = 0; n < e.length && n < i; n++)
      r(e[n] ? e[n][0] : null, n);
  else
    for (var a = e[0] || [], n = 0; n < a.length && n < i; n++)
      r(a[n], n);
}
function Iy(r) {
  var t = r.sourceFormat;
  return t === Ee || t === Ye;
}
var Or, Nr, Br, Bv, Fv, Ey = (
  /** @class */
  (function() {
    function r(t, e) {
      var i = hh(t) ? t : Ly(t);
      this._source = i;
      var n = this._data = i.data;
      i.sourceFormat === cr && (this._offset = 0, this._dimSize = e, this._data = n), Fv(this, n, i);
    }
    return r.prototype.getSource = function() {
      return this._source;
    }, r.prototype.count = function() {
      return 0;
    }, r.prototype.getItem = function(t, e) {
    }, r.prototype.appendData = function(t) {
    }, r.prototype.clean = function() {
    }, r.protoInitialize = (function() {
      var t = r.prototype;
      t.pure = !1, t.persistent = !0;
    })(), r.internalField = (function() {
      var t;
      Fv = function(o, s, l) {
        var u = l.sourceFormat, f = l.seriesLayoutBy, h = l.startIndex, v = l.dimensionsDefine, c = Bv[ch(u, f)];
        if (k(o, c), u === cr)
          o.getItem = e, o.count = n, o.fillStorage = i;
        else {
          var d = Ry(u, f);
          o.getItem = dt(d, null, s, h, v);
          var y = ky(u, f);
          o.count = dt(y, null, s, h, v);
        }
      };
      var e = function(o, s) {
        o = o - this._offset, s = s || [];
        for (var l = this._data, u = this._dimSize, f = u * o, h = 0; h < u; h++)
          s[h] = l[f + h];
        return s;
      }, i = function(o, s, l, u) {
        for (var f = this._data, h = this._dimSize, v = 0; v < h; v++) {
          for (var c = u[v], d = c[0] == null ? 1 / 0 : c[0], y = c[1] == null ? -1 / 0 : c[1], p = s - o, g = l[v], m = 0; m < p; m++) {
            var _ = f[m * h + v];
            g[o + m] = _, _ < d && (d = _), _ > y && (y = _);
          }
          c[0] = d, c[1] = y;
        }
      }, n = function() {
        return this._data ? this._data.length / this._dimSize : 0;
      };
      Bv = (t = {}, t[qt + "_" + He] = {
        pure: !0,
        appendData: a
      }, t[qt + "_" + ji] = {
        pure: !0,
        appendData: function() {
          throw new Error('Do not support appendData when set seriesLayoutBy: "row".');
        }
      }, t[Ee] = {
        pure: !0,
        appendData: a
      }, t[Ye] = {
        pure: !0,
        appendData: function(o) {
          var s = this._data;
          A(o, function(l, u) {
            for (var f = s[u] || (s[u] = []), h = 0; h < (l || []).length; h++)
              f.push(l[h]);
          });
        }
      }, t[he] = {
        appendData: a
      }, t[cr] = {
        persistent: !1,
        pure: !0,
        appendData: function(o) {
          this._data = o;
        },
        // Clean self if data is already used.
        clean: function() {
          this._offset += this.count(), this._data = null;
        }
      }, t);
      function a(o) {
        for (var s = 0; s < o.length; s++)
          this._data.push(o[s]);
      }
    })(), r;
  })()
), zv = function(r, t, e, i) {
  return r[i];
}, Sx = (Or = {}, Or[qt + "_" + He] = function(r, t, e, i) {
  return r[i + t];
}, Or[qt + "_" + ji] = function(r, t, e, i, n) {
  i += t;
  for (var a = n || [], o = r, s = 0; s < o.length; s++) {
    var l = o[s];
    a[s] = l ? l[i] : null;
  }
  return a;
}, Or[Ee] = zv, Or[Ye] = function(r, t, e, i, n) {
  for (var a = n || [], o = 0; o < e.length; o++) {
    var s = e[o].name, l = r[s];
    a[o] = l ? l[i] : null;
  }
  return a;
}, Or[he] = zv, Or);
function Ry(r, t) {
  var e = Sx[ch(r, t)];
  return e;
}
var Hv = function(r, t, e) {
  return r.length;
}, bx = (Nr = {}, Nr[qt + "_" + He] = function(r, t, e) {
  return Math.max(0, r.length - t);
}, Nr[qt + "_" + ji] = function(r, t, e) {
  var i = r[0];
  return i ? Math.max(0, i.length - t) : 0;
}, Nr[Ee] = Hv, Nr[Ye] = function(r, t, e) {
  var i = e[0].name, n = r[i];
  return n ? n.length : 0;
}, Nr[he] = Hv, Nr);
function ky(r, t) {
  var e = bx[ch(r, t)];
  return e;
}
var Il = function(r, t, e) {
  return r[t];
}, xx = (Br = {}, Br[qt] = Il, Br[Ee] = function(r, t, e) {
  return r[e];
}, Br[Ye] = Il, Br[he] = function(r, t, e) {
  var i = ga(r);
  return i instanceof Array ? i[t] : i;
}, Br[cr] = Il, Br);
function Oy(r) {
  var t = xx[r];
  return t;
}
function ch(r, t) {
  return r === qt ? r + "_" + t : r;
}
function Ui(r, t, e) {
  if (r) {
    var i = r.getRawDataItem(t);
    if (i != null) {
      var n = r.getStore(), a = n.getSource().sourceFormat;
      if (e != null) {
        var o = r.getDimensionIndex(e), s = n.getDimensionProperty(o);
        return Oy(a)(i, o, s);
      } else {
        var l = i;
        return a === he && (l = ga(i)), l;
      }
    }
  }
}
var Tx = /\{@(.+?)\}/g, vh = (
  /** @class */
  (function() {
    function r() {
    }
    return r.prototype.getDataParams = function(t, e) {
      var i = this.getData(e), n = this.getRawValue(t, e), a = i.getRawIndex(t), o = i.getName(t), s = i.getRawDataItem(t), l = i.getItemVisual(t, "style"), u = l && l[i.getItemVisual(t, "drawType") || "fill"], f = l && l.stroke, h = this.mainType, v = h === "series", c = i.userOutput && i.userOutput.get();
      return {
        componentType: h,
        componentSubType: this.subType,
        componentIndex: this.componentIndex,
        seriesType: v ? this.subType : null,
        seriesIndex: this.seriesIndex,
        seriesId: v ? this.id : null,
        seriesName: v ? this.name : null,
        name: o,
        dataIndex: a,
        data: s,
        dataType: e,
        value: n,
        color: u,
        borderColor: f,
        dimensionNames: c ? c.fullDimensions : null,
        encode: c ? c.encode : null,
        // Param name list for mapping `a`, `b`, `c`, `d`, `e`
        $vars: ["seriesName", "name", "value"]
      };
    }, r.prototype.getFormattedLabel = function(t, e, i, n, a, o) {
      e = e || "normal";
      var s = this.getData(i), l = this.getDataParams(t, i);
      if (o && (l.value = o.interpolatedValue), n != null && N(l.value) && (l.value = l.value[n]), !a) {
        var u = s.getItemModel(t);
        a = u.get(e === "normal" ? ["label", "formatter"] : [e, "label", "formatter"]);
      }
      if (G(a))
        return l.status = e, l.dimensionIndex = n, a(l);
      if (z(a)) {
        var f = _y(a, l);
        return f.replace(Tx, function(h, v) {
          var c = v.length, d = v;
          d.charAt(0) === "[" && d.charAt(c - 1) === "]" && (d = +d.slice(1, c - 1));
          var y = Ui(s, t, d);
          if (o && N(o.interpolatedValue)) {
            var p = s.getDimensionIndex(d);
            p >= 0 && (y = o.interpolatedValue[p]);
          }
          return y != null ? y + "" : "";
        });
      }
    }, r.prototype.getRawValue = function(t, e) {
      return Ui(this.getData(e), t);
    }, r.prototype.formatTooltip = function(t, e, i) {
    }, r;
  })()
);
function $v(r) {
  var t, e;
  return W(r) ? r.type && (e = r) : t = r, {
    text: t,
    // markers: markers || markersExisting,
    frag: e
  };
}
function Wn(r) {
  return new Cx(r);
}
var Cx = (
  /** @class */
  (function() {
    function r(t) {
      t = t || {}, this._reset = t.reset, this._plan = t.plan, this._count = t.count, this._onDirty = t.onDirty, this._dirty = !0;
    }
    return r.prototype.perform = function(t) {
      var e = this._upstream, i = t && t.skip;
      if (this._dirty && e) {
        var n = this.context;
        n.data = n.outputData = e.context.outputData;
      }
      this.__pipeline && (this.__pipeline.currentTask = this);
      var a;
      this._plan && !i && (a = this._plan(this.context));
      var o = f(this._modBy), s = this._modDataCount || 0, l = f(t && t.modBy), u = t && t.modDataCount || 0;
      (o !== l || s !== u) && (a = "reset");
      function f(m) {
        return !(m >= 1) && (m = 1), m;
      }
      var h;
      (this._dirty || a === "reset") && (this._dirty = !1, h = this._doReset(i)), this._modBy = l, this._modDataCount = u;
      var v = t && t.step;
      if (e ? this._dueEnd = e._outputDueEnd : this._dueEnd = this._count ? this._count(this.context) : 1 / 0, this._progress) {
        var c = this._dueIndex, d = Math.min(v != null ? this._dueIndex + v : 1 / 0, this._dueEnd);
        if (!i && (h || c < d)) {
          var y = this._progress;
          if (N(y))
            for (var p = 0; p < y.length; p++)
              this._doProgress(y[p], c, d, l, u);
          else
            this._doProgress(y, c, d, l, u);
        }
        this._dueIndex = d;
        var g = this._settedOutputEnd != null ? this._settedOutputEnd : d;
        this._outputDueEnd = g;
      } else
        this._dueIndex = this._outputDueEnd = this._settedOutputEnd != null ? this._settedOutputEnd : this._dueEnd;
      return this.unfinished();
    }, r.prototype.dirty = function() {
      this._dirty = !0, this._onDirty && this._onDirty(this.context);
    }, r.prototype._doProgress = function(t, e, i, n, a) {
      Vv.reset(e, i, n, a), this._callingProgress = t, this._callingProgress({
        start: e,
        end: i,
        count: i - e,
        next: Vv.next
      }, this.context);
    }, r.prototype._doReset = function(t) {
      this._dueIndex = this._outputDueEnd = this._dueEnd = 0, this._settedOutputEnd = null;
      var e, i;
      !t && this._reset && (e = this._reset(this.context), e && e.progress && (i = e.forceFirstProgress, e = e.progress), N(e) && !e.length && (e = null)), this._progress = e, this._modBy = this._modDataCount = null;
      var n = this._downstream;
      return n && n.dirty(), i;
    }, r.prototype.unfinished = function() {
      return this._progress && this._dueIndex < this._dueEnd;
    }, r.prototype.pipe = function(t) {
      (this._downstream !== t || this._dirty) && (this._downstream = t, t._upstream = this, t.dirty());
    }, r.prototype.dispose = function() {
      this._disposed || (this._upstream && (this._upstream._downstream = null), this._downstream && (this._downstream._upstream = null), this._dirty = !1, this._disposed = !0);
    }, r.prototype.getUpstream = function() {
      return this._upstream;
    }, r.prototype.getDownstream = function() {
      return this._downstream;
    }, r.prototype.setOutputEnd = function(t) {
      this._outputDueEnd = this._settedOutputEnd = t;
    }, r;
  })()
), Vv = /* @__PURE__ */ (function() {
  var r, t, e, i, n, a = {
    reset: function(l, u, f, h) {
      t = l, r = u, e = f, i = h, n = Math.ceil(i / e), a.next = e > 1 && i > 0 ? s : o;
    }
  };
  return a;
  function o() {
    return t < r ? t++ : null;
  }
  function s() {
    var l = t % n * e + Math.ceil(t / n), u = t >= r ? null : l < i ? l : t;
    return t++, u;
  }
})();
function Fi(r, t) {
  var e = t && t.type;
  return e === "ordinal" ? r : (e === "time" && !vt(r) && r != null && r !== "-" && (r = +Ve(r)), r == null || r === "" ? NaN : Number(r));
}
Z({
  number: function(r) {
    return parseFloat(r);
  },
  time: function(r) {
    return +Ve(r);
  },
  trim: function(r) {
    return z(r) ? Me(r) : r;
  }
});
var Mx = (
  /** @class */
  (function() {
    function r(t, e) {
      var i = t === "desc";
      this._resultLT = i ? 1 : -1, e == null && (e = i ? "min" : "max"), this._incomparable = e === "min" ? -1 / 0 : 1 / 0;
    }
    return r.prototype.evaluate = function(t, e) {
      var i = vt(t) ? t : Bo(t), n = vt(e) ? e : Bo(e), a = isNaN(i), o = isNaN(n);
      if (a && (i = this._incomparable), o && (n = this._incomparable), a && o) {
        var s = z(t), l = z(e);
        s && (i = l ? t : 0), l && (n = s ? e : 0);
      }
      return i < n ? this._resultLT : i > n ? -this._resultLT : 0;
    }, r;
  })()
), Dx = (
  /** @class */
  (function() {
    function r() {
    }
    return r.prototype.getRawData = function() {
      throw new Error("not supported");
    }, r.prototype.getRawDataItem = function(t) {
      throw new Error("not supported");
    }, r.prototype.cloneRawData = function() {
    }, r.prototype.getDimensionInfo = function(t) {
    }, r.prototype.cloneAllDimensionInfo = function() {
    }, r.prototype.count = function() {
    }, r.prototype.retrieveValue = function(t, e) {
    }, r.prototype.retrieveValueFromItem = function(t, e) {
    }, r.prototype.convertValue = function(t, e) {
      return Fi(t, e);
    }, r;
  })()
);
function Ax(r, t) {
  var e = new Dx(), i = r.data, n = e.sourceFormat = r.sourceFormat, a = r.startIndex, o = "";
  r.seriesLayoutBy !== He && Gt(o);
  var s = [], l = {}, u = r.dimensionsDefine;
  if (u)
    A(u, function(y, p) {
      var g = y.name, m = {
        index: p,
        name: g,
        displayName: y.displayName
      };
      if (s.push(m), g != null) {
        var _ = "";
        jr(l, g) && Gt(_), l[g] = m;
      }
    });
  else
    for (var f = 0; f < r.dimensionsDetectedCount; f++)
      s.push({
        index: f
      });
  var h = Ry(n, He);
  t.__isBuiltIn && (e.getRawDataItem = function(y) {
    return h(i, a, s, y);
  }, e.getRawData = dt(Lx, null, r)), e.cloneRawData = dt(Px, null, r);
  var v = ky(n, He);
  e.count = dt(v, null, i, a, s);
  var c = Oy(n);
  e.retrieveValue = function(y, p) {
    var g = h(i, a, s, y);
    return d(g, p);
  };
  var d = e.retrieveValueFromItem = function(y, p) {
    if (y != null) {
      var g = s[p];
      if (g)
        return c(y, p, g.name);
    }
  };
  return e.getDimensionInfo = dt(Ix, null, s, l), e.cloneAllDimensionInfo = dt(Ex, null, s), e;
}
function Lx(r) {
  var t = r.sourceFormat;
  if (!dh(t)) {
    var e = "";
    Gt(e);
  }
  return r.data;
}
function Px(r) {
  var t = r.sourceFormat, e = r.data;
  if (!dh(t)) {
    var i = "";
    Gt(i);
  }
  if (t === qt) {
    for (var n = [], a = 0, o = e.length; a < o; a++)
      n.push(e[a].slice());
    return n;
  } else if (t === Ee) {
    for (var n = [], a = 0, o = e.length; a < o; a++)
      n.push(k({}, e[a]));
    return n;
  }
}
function Ix(r, t, e) {
  if (e != null) {
    if (vt(e) || !isNaN(e) && !jr(t, e))
      return r[e];
    if (jr(t, e))
      return t[e];
  }
}
function Ex(r) {
  return K(r);
}
var Ny = Z();
function Rx(r) {
  r = K(r);
  var t = r.type, e = "";
  t || Gt(e);
  var i = t.split(":");
  i.length !== 2 && Gt(e);
  var n = !1;
  i[0] === "echarts" && (t = i[1], n = !0), r.__isBuiltIn = n, Ny.set(t, r);
}
function kx(r, t, e) {
  var i = Ot(r), n = i.length, a = "";
  n || Gt(a);
  for (var o = 0, s = n; o < s; o++) {
    var l = i[o];
    t = Ox(l, t), o !== s - 1 && (t.length = Math.max(t.length, 1));
  }
  return t;
}
function Ox(r, t, e, i) {
  var n = "";
  t.length || Gt(n), W(r) || Gt(n);
  var a = r.type, o = Ny.get(a);
  o || Gt(n);
  var s = H(t, function(u) {
    return Ax(u, o);
  }), l = Ot(o.transform({
    upstream: s[0],
    upstreamList: s,
    config: K(r.config)
  }));
  return H(l, function(u, f) {
    var h = "";
    W(u) || Gt(h), u.data || Gt(h);
    var v = Py(u.data);
    dh(v) || Gt(h);
    var c, d = t[0];
    if (d && f === 0 && !u.dimensions) {
      var y = d.startIndex;
      y && (u.data = d.data.slice(0, y).concat(u.data)), c = {
        seriesLayoutBy: He,
        sourceHeader: y,
        dimensions: d.metaRawOption.dimensions
      };
    } else
      c = {
        seriesLayoutBy: He,
        sourceHeader: 0,
        dimensions: u.dimensions
      };
    return $u(u.data, c, null);
  });
}
function dh(r) {
  return r === qt || r === Ee;
}
var Ls = "undefined", Nx = typeof Uint32Array === Ls ? Array : Uint32Array, Bx = typeof Uint16Array === Ls ? Array : Uint16Array, By = typeof Int32Array === Ls ? Array : Int32Array, Gv = typeof Float64Array === Ls ? Array : Float64Array, Fy = {
  float: Gv,
  int: By,
  // Ordinal data type can be string or int
  ordinal: Array,
  number: Array,
  time: Gv
}, El;
function gi(r) {
  return r > 65535 ? Nx : Bx;
}
function yi() {
  return [1 / 0, -1 / 0];
}
function Fx(r) {
  var t = r.constructor;
  return t === Array ? r.slice() : new t(r);
}
function Wv(r, t, e, i, n) {
  var a = Fy[e || "float"];
  if (n) {
    var o = r[t], s = o && o.length;
    if (s !== i) {
      for (var l = new a(i), u = 0; u < s; u++)
        l[u] = o[u];
      r[t] = l;
    }
  } else
    r[t] = new a(i);
}
var Vu = (
  /** @class */
  (function() {
    function r() {
      this._chunks = [], this._rawExtent = [], this._extent = [], this._count = 0, this._rawCount = 0, this._calcDimNameToIdx = Z();
    }
    return r.prototype.initData = function(t, e, i) {
      this._provider = t, this._chunks = [], this._indices = null, this.getRawIndex = this._getRawIdxIdentity;
      var n = t.getSource(), a = this.defaultDimValueGetter = El[n.sourceFormat];
      this._dimValueGetter = i || a, this._rawExtent = [], Iy(n), this._dimensions = H(e, function(o) {
        return {
          // Only pick these two props. Not leak other properties like orderMeta.
          type: o.type,
          property: o.property
        };
      }), this._initDataFromProvider(0, t.count());
    }, r.prototype.getProvider = function() {
      return this._provider;
    }, r.prototype.getSource = function() {
      return this._provider.getSource();
    }, r.prototype.ensureCalculationDimension = function(t, e) {
      var i = this._calcDimNameToIdx, n = this._dimensions, a = i.get(t);
      if (a != null) {
        if (n[a].type === e)
          return a;
      } else
        a = n.length;
      return n[a] = {
        type: e
      }, i.set(t, a), this._chunks[a] = new Fy[e || "float"](this._rawCount), this._rawExtent[a] = yi(), a;
    }, r.prototype.collectOrdinalMeta = function(t, e) {
      var i = this._chunks[t], n = this._dimensions[t], a = this._rawExtent, o = n.ordinalOffset || 0, s = i.length;
      o === 0 && (a[t] = yi());
      for (var l = a[t], u = o; u < s; u++) {
        var f = i[u] = e.parseAndCollect(i[u]);
        isNaN(f) || (l[0] = Math.min(f, l[0]), l[1] = Math.max(f, l[1]));
      }
      n.ordinalMeta = e, n.ordinalOffset = s, n.type = "ordinal";
    }, r.prototype.getOrdinalMeta = function(t) {
      var e = this._dimensions[t], i = e.ordinalMeta;
      return i;
    }, r.prototype.getDimensionProperty = function(t) {
      var e = this._dimensions[t];
      return e && e.property;
    }, r.prototype.appendData = function(t) {
      var e = this._provider, i = this.count();
      e.appendData(t);
      var n = e.count();
      return e.persistent || (n += i), i < n && this._initDataFromProvider(i, n, !0), [i, n];
    }, r.prototype.appendValues = function(t, e) {
      for (var i = this._chunks, n = this._dimensions, a = n.length, o = this._rawExtent, s = this.count(), l = s + Math.max(t.length, e || 0), u = 0; u < a; u++) {
        var f = n[u];
        Wv(i, u, f.type, l, !0);
      }
      for (var h = [], v = s; v < l; v++)
        for (var c = v - s, d = 0; d < a; d++) {
          var f = n[d], y = El.arrayRows.call(this, t[c] || h, f.property, c, d);
          i[d][v] = y;
          var p = o[d];
          y < p[0] && (p[0] = y), y > p[1] && (p[1] = y);
        }
      return this._rawCount = this._count = l, {
        start: s,
        end: l
      };
    }, r.prototype._initDataFromProvider = function(t, e, i) {
      for (var n = this._provider, a = this._chunks, o = this._dimensions, s = o.length, l = this._rawExtent, u = H(o, function(m) {
        return m.property;
      }), f = 0; f < s; f++) {
        var h = o[f];
        l[f] || (l[f] = yi()), Wv(a, f, h.type, e, i);
      }
      if (n.fillStorage)
        n.fillStorage(t, e, a, l);
      else
        for (var v = [], c = t; c < e; c++) {
          v = n.getItem(c, v);
          for (var d = 0; d < s; d++) {
            var y = a[d], p = this._dimValueGetter(v, u[d], c, d);
            y[c] = p;
            var g = l[d];
            p < g[0] && (g[0] = p), p > g[1] && (g[1] = p);
          }
        }
      !n.persistent && n.clean && n.clean(), this._rawCount = this._count = e, this._extent = [];
    }, r.prototype.count = function() {
      return this._count;
    }, r.prototype.get = function(t, e) {
      if (!(e >= 0 && e < this._count))
        return NaN;
      var i = this._chunks[t];
      return i ? i[this.getRawIndex(e)] : NaN;
    }, r.prototype.getValues = function(t, e) {
      var i = [], n = [];
      if (e == null) {
        e = t, t = [];
        for (var a = 0; a < this._dimensions.length; a++)
          n.push(a);
      } else
        n = t;
      for (var a = 0, o = n.length; a < o; a++)
        i.push(this.get(n[a], e));
      return i;
    }, r.prototype.getByRawIndex = function(t, e) {
      if (!(e >= 0 && e < this._rawCount))
        return NaN;
      var i = this._chunks[t];
      return i ? i[e] : NaN;
    }, r.prototype.getSum = function(t) {
      var e = this._chunks[t], i = 0;
      if (e)
        for (var n = 0, a = this.count(); n < a; n++) {
          var o = this.get(t, n);
          isNaN(o) || (i += o);
        }
      return i;
    }, r.prototype.getMedian = function(t) {
      var e = [];
      this.each([t], function(a) {
        isNaN(a) || e.push(a);
      });
      var i = e.sort(function(a, o) {
        return a - o;
      }), n = this.count();
      return n === 0 ? 0 : n % 2 === 1 ? i[(n - 1) / 2] : (i[n / 2] + i[n / 2 - 1]) / 2;
    }, r.prototype.indexOfRawIndex = function(t) {
      if (t >= this._rawCount || t < 0)
        return -1;
      if (!this._indices)
        return t;
      var e = this._indices, i = e[t];
      if (i != null && i < this._count && i === t)
        return t;
      for (var n = 0, a = this._count - 1; n <= a; ) {
        var o = (n + a) / 2 | 0;
        if (e[o] < t)
          n = o + 1;
        else if (e[o] > t)
          a = o - 1;
        else
          return o;
      }
      return -1;
    }, r.prototype.indicesOfNearest = function(t, e, i) {
      var n = this._chunks, a = n[t], o = [];
      if (!a)
        return o;
      i == null && (i = 1 / 0);
      for (var s = 1 / 0, l = -1, u = 0, f = 0, h = this.count(); f < h; f++) {
        var v = this.getRawIndex(f), c = e - a[v], d = Math.abs(c);
        d <= i && ((d < s || d === s && c >= 0 && l < 0) && (s = d, l = c, u = 0), c === l && (o[u++] = f));
      }
      return o.length = u, o;
    }, r.prototype.getIndices = function() {
      var t, e = this._indices;
      if (e) {
        var i = e.constructor, n = this._count;
        if (i === Array) {
          t = new i(n);
          for (var a = 0; a < n; a++)
            t[a] = e[a];
        } else
          t = new i(e.buffer, 0, n);
      } else {
        var i = gi(this._rawCount);
        t = new i(this.count());
        for (var a = 0; a < t.length; a++)
          t[a] = a;
      }
      return t;
    }, r.prototype.filter = function(t, e) {
      if (!this._count)
        return this;
      for (var i = this.clone(), n = i.count(), a = gi(i._rawCount), o = new a(n), s = [], l = t.length, u = 0, f = t[0], h = i._chunks, v = 0; v < n; v++) {
        var c = void 0, d = i.getRawIndex(v);
        if (l === 0)
          c = e(v);
        else if (l === 1) {
          var y = h[f][d];
          c = e(y, v);
        } else {
          for (var p = 0; p < l; p++)
            s[p] = h[t[p]][d];
          s[p] = v, c = e.apply(null, s);
        }
        c && (o[u++] = d);
      }
      return u < n && (i._indices = o), i._count = u, i._extent = [], i._updateGetRawIdx(), i;
    }, r.prototype.selectRange = function(t) {
      var e = this.clone(), i = e._count;
      if (!i)
        return this;
      var n = pt(t), a = n.length;
      if (!a)
        return this;
      var o = e.count(), s = gi(e._rawCount), l = new s(o), u = 0, f = n[0], h = t[f][0], v = t[f][1], c = e._chunks, d = !1;
      if (!e._indices) {
        var y = 0;
        if (a === 1) {
          for (var p = c[n[0]], g = 0; g < i; g++) {
            var m = p[g];
            (m >= h && m <= v || isNaN(m)) && (l[u++] = y), y++;
          }
          d = !0;
        } else if (a === 2) {
          for (var p = c[n[0]], _ = c[n[1]], S = t[n[1]][0], w = t[n[1]][1], g = 0; g < i; g++) {
            var m = p[g], b = _[g];
            (m >= h && m <= v || isNaN(m)) && (b >= S && b <= w || isNaN(b)) && (l[u++] = y), y++;
          }
          d = !0;
        }
      }
      if (!d)
        if (a === 1)
          for (var g = 0; g < o; g++) {
            var x = e.getRawIndex(g), m = c[n[0]][x];
            (m >= h && m <= v || isNaN(m)) && (l[u++] = x);
          }
        else
          for (var g = 0; g < o; g++) {
            for (var D = !0, x = e.getRawIndex(g), T = 0; T < a; T++) {
              var C = n[T], m = c[C][x];
              (m < t[C][0] || m > t[C][1]) && (D = !1);
            }
            D && (l[u++] = e.getRawIndex(g));
          }
      return u < o && (e._indices = l), e._count = u, e._extent = [], e._updateGetRawIdx(), e;
    }, r.prototype.map = function(t, e) {
      var i = this.clone(t);
      return this._updateDims(i, t, e), i;
    }, r.prototype.modify = function(t, e) {
      this._updateDims(this, t, e);
    }, r.prototype._updateDims = function(t, e, i) {
      for (var n = t._chunks, a = [], o = e.length, s = t.count(), l = [], u = t._rawExtent, f = 0; f < e.length; f++)
        u[e[f]] = yi();
      for (var h = 0; h < s; h++) {
        for (var v = t.getRawIndex(h), c = 0; c < o; c++)
          l[c] = n[e[c]][v];
        l[o] = h;
        var d = i && i.apply(null, l);
        if (d != null) {
          typeof d != "object" && (a[0] = d, d = a);
          for (var f = 0; f < d.length; f++) {
            var y = e[f], p = d[f], g = u[y], m = n[y];
            m && (m[v] = p), p < g[0] && (g[0] = p), p > g[1] && (g[1] = p);
          }
        }
      }
    }, r.prototype.lttbDownSample = function(t, e) {
      var i = this.clone([t], !0), n = i._chunks, a = n[t], o = this.count(), s = 0, l = Math.floor(1 / e), u = this.getRawIndex(0), f, h, v, c = new (gi(this._rawCount))(Math.min((Math.ceil(o / l) + 2) * 2, o));
      c[s++] = u;
      for (var d = 1; d < o - 1; d += l) {
        for (var y = Math.min(d + l, o - 1), p = Math.min(d + l * 2, o), g = (p + y) / 2, m = 0, _ = y; _ < p; _++) {
          var S = this.getRawIndex(_), w = a[S];
          isNaN(w) || (m += w);
        }
        m /= p - y;
        var b = d, x = Math.min(d + l, o), D = d - 1, T = a[u];
        f = -1, v = b;
        for (var C = -1, M = 0, _ = b; _ < x; _++) {
          var S = this.getRawIndex(_), w = a[S];
          if (isNaN(w)) {
            M++, C < 0 && (C = S);
            continue;
          }
          h = Math.abs((D - g) * (w - T) - (D - _) * (m - T)), h > f && (f = h, v = S);
        }
        M > 0 && M < x - b && (c[s++] = Math.min(C, v), v = Math.max(C, v)), c[s++] = v, u = v;
      }
      return c[s++] = this.getRawIndex(o - 1), i._count = s, i._indices = c, i.getRawIndex = this._getRawIdx, i;
    }, r.prototype.minmaxDownSample = function(t, e) {
      for (var i = this.clone([t], !0), n = i._chunks, a = Math.floor(1 / e), o = n[t], s = this.count(), l = new (gi(this._rawCount))(Math.ceil(s / a) * 2), u = 0, f = 0; f < s; f += a) {
        var h = f, v = o[this.getRawIndex(h)], c = f, d = o[this.getRawIndex(c)], y = a;
        f + a > s && (y = s - f);
        for (var p = 0; p < y; p++) {
          var g = this.getRawIndex(f + p), m = o[g];
          m < v && (v = m, h = f + p), m > d && (d = m, c = f + p);
        }
        var _ = this.getRawIndex(h), S = this.getRawIndex(c);
        h < c ? (l[u++] = _, l[u++] = S) : (l[u++] = S, l[u++] = _);
      }
      return i._count = u, i._indices = l, i._updateGetRawIdx(), i;
    }, r.prototype.downSample = function(t, e, i, n) {
      for (var a = this.clone([t], !0), o = a._chunks, s = [], l = Math.floor(1 / e), u = o[t], f = this.count(), h = a._rawExtent[t] = yi(), v = new (gi(this._rawCount))(Math.ceil(f / l)), c = 0, d = 0; d < f; d += l) {
        l > f - d && (l = f - d, s.length = l);
        for (var y = 0; y < l; y++) {
          var p = this.getRawIndex(d + y);
          s[y] = u[p];
        }
        var g = i(s), m = this.getRawIndex(Math.min(d + n(s, g) || 0, f - 1));
        u[m] = g, g < h[0] && (h[0] = g), g > h[1] && (h[1] = g), v[c++] = m;
      }
      return a._count = c, a._indices = v, a._updateGetRawIdx(), a;
    }, r.prototype.each = function(t, e) {
      if (this._count)
        for (var i = t.length, n = this._chunks, a = 0, o = this.count(); a < o; a++) {
          var s = this.getRawIndex(a);
          switch (i) {
            case 0:
              e(a);
              break;
            case 1:
              e(n[t[0]][s], a);
              break;
            case 2:
              e(n[t[0]][s], n[t[1]][s], a);
              break;
            default:
              for (var l = 0, u = []; l < i; l++)
                u[l] = n[t[l]][s];
              u[l] = a, e.apply(null, u);
          }
        }
    }, r.prototype.getDataExtent = function(t) {
      var e = this._chunks[t], i = yi();
      if (!e)
        return i;
      var n = this.count(), a = !this._indices, o;
      if (a)
        return this._rawExtent[t].slice();
      if (o = this._extent[t], o)
        return o.slice();
      o = i;
      for (var s = o[0], l = o[1], u = 0; u < n; u++) {
        var f = this.getRawIndex(u), h = e[f];
        h < s && (s = h), h > l && (l = h);
      }
      return o = [s, l], this._extent[t] = o, o;
    }, r.prototype.getRawDataItem = function(t) {
      var e = this.getRawIndex(t);
      if (this._provider.persistent)
        return this._provider.getItem(e);
      for (var i = [], n = this._chunks, a = 0; a < n.length; a++)
        i.push(n[a][e]);
      return i;
    }, r.prototype.clone = function(t, e) {
      var i = new r(), n = this._chunks, a = t && Zi(t, function(s, l) {
        return s[l] = !0, s;
      }, {});
      if (a)
        for (var o = 0; o < n.length; o++)
          i._chunks[o] = a[o] ? Fx(n[o]) : n[o];
      else
        i._chunks = n;
      return this._copyCommonProps(i), e || (i._indices = this._cloneIndices()), i._updateGetRawIdx(), i;
    }, r.prototype._copyCommonProps = function(t) {
      t._count = this._count, t._rawCount = this._rawCount, t._provider = this._provider, t._dimensions = this._dimensions, t._extent = K(this._extent), t._rawExtent = K(this._rawExtent);
    }, r.prototype._cloneIndices = function() {
      if (this._indices) {
        var t = this._indices.constructor, e = void 0;
        if (t === Array) {
          var i = this._indices.length;
          e = new t(i);
          for (var n = 0; n < i; n++)
            e[n] = this._indices[n];
        } else
          e = new t(this._indices);
        return e;
      }
      return null;
    }, r.prototype._getRawIdxIdentity = function(t) {
      return t;
    }, r.prototype._getRawIdx = function(t) {
      return t < this._count && t >= 0 ? this._indices[t] : -1;
    }, r.prototype._updateGetRawIdx = function() {
      this.getRawIndex = this._indices ? this._getRawIdx : this._getRawIdxIdentity;
    }, r.internalField = (function() {
      function t(e, i, n, a) {
        return Fi(e[a], this._dimensions[a]);
      }
      El = {
        arrayRows: t,
        objectRows: function(e, i, n, a) {
          return Fi(e[i], this._dimensions[a]);
        },
        keyedColumns: t,
        original: function(e, i, n, a) {
          var o = e && (e.value == null ? e : e.value);
          return Fi(o instanceof Array ? o[a] : o, this._dimensions[a]);
        },
        typedArray: function(e, i, n, a) {
          return e[a];
        }
      };
    })(), r;
  })()
), zx = (
  /** @class */
  (function() {
    function r(t) {
      this._sourceList = [], this._storeList = [], this._upstreamSignList = [], this._versionSignBase = 0, this._dirty = !0, this._sourceHost = t;
    }
    return r.prototype.dirty = function() {
      this._setLocalSource([], []), this._storeList = [], this._dirty = !0;
    }, r.prototype._setLocalSource = function(t, e) {
      this._sourceList = t, this._upstreamSignList = e, this._versionSignBase++, this._versionSignBase > 9e10 && (this._versionSignBase = 0);
    }, r.prototype._getVersionSign = function() {
      return this._sourceHost.uid + "_" + this._versionSignBase;
    }, r.prototype.prepareSource = function() {
      this._isDirty() && (this._createSource(), this._dirty = !1);
    }, r.prototype._createSource = function() {
      this._setLocalSource([], []);
      var t = this._sourceHost, e = this._getUpstreamSourceManagers(), i = !!e.length, n, a;
      if (Wa(t)) {
        var o = t, s = void 0, l = void 0, u = void 0;
        if (i) {
          var f = e[0];
          f.prepareSource(), u = f.getSource(), s = u.data, l = u.sourceFormat, a = [f._getVersionSign()];
        } else
          s = o.get("data", !0), l = Xt(s) ? cr : he, a = [];
        var h = this._getSourceMetaRawOption() || {}, v = u && u.metaRawOption || {}, c = X(h.seriesLayoutBy, v.seriesLayoutBy) || null, d = X(h.sourceHeader, v.sourceHeader), y = X(h.dimensions, v.dimensions), p = c !== v.seriesLayoutBy || !!d != !!v.sourceHeader || y;
        n = p ? [$u(s, {
          seriesLayoutBy: c,
          sourceHeader: d,
          dimensions: y
        }, l)] : [];
      } else {
        var g = t;
        if (i) {
          var m = this._applyTransform(e);
          n = m.sourceList, a = m.upstreamSignList;
        } else {
          var _ = g.get("source", !0);
          n = [$u(_, this._getSourceMetaRawOption(), null)], a = [];
        }
      }
      this._setLocalSource(n, a);
    }, r.prototype._applyTransform = function(t) {
      var e = this._sourceHost, i = e.get("transform", !0), n = e.get("fromTransformResult", !0);
      if (n != null) {
        var a = "";
        t.length !== 1 && Uv(a);
      }
      var o, s = [], l = [];
      return A(t, function(u) {
        u.prepareSource();
        var f = u.getSource(n || 0), h = "";
        n != null && !f && Uv(h), s.push(f), l.push(u._getVersionSign());
      }), i ? o = kx(i, s, {
        datasetIndex: e.componentIndex
      }) : n != null && (o = [yx(s[0])]), {
        sourceList: o,
        upstreamSignList: l
      };
    }, r.prototype._isDirty = function() {
      if (this._dirty)
        return !0;
      for (var t = this._getUpstreamSourceManagers(), e = 0; e < t.length; e++) {
        var i = t[e];
        if (
          // Consider the case that there is ancestor diry, call it recursively.
          // The performance is probably not an issue because usually the chain is not long.
          i._isDirty() || this._upstreamSignList[e] !== i._getVersionSign()
        )
          return !0;
      }
    }, r.prototype.getSource = function(t) {
      t = t || 0;
      var e = this._sourceList[t];
      if (!e) {
        var i = this._getUpstreamSourceManagers();
        return i[0] && i[0].getSource(t);
      }
      return e;
    }, r.prototype.getSharedDataStore = function(t) {
      var e = t.makeStoreSchema();
      return this._innerGetDataStore(e.dimensions, t.source, e.hash);
    }, r.prototype._innerGetDataStore = function(t, e, i) {
      var n = 0, a = this._storeList, o = a[n];
      o || (o = a[n] = {});
      var s = o[i];
      if (!s) {
        var l = this._getUpstreamSourceManagers()[0];
        Wa(this._sourceHost) && l ? s = l._innerGetDataStore(t, e, i) : (s = new Vu(), s.initData(new Ey(e, t.length), t)), o[i] = s;
      }
      return s;
    }, r.prototype._getUpstreamSourceManagers = function() {
      var t = this._sourceHost;
      if (Wa(t)) {
        var e = Ty(t);
        return e ? [e.getSourceManager()] : [];
      } else
        return H(Uw(t), function(i) {
          return i.getSourceManager();
        });
    }, r.prototype._getSourceMetaRawOption = function() {
      var t = this._sourceHost, e, i, n;
      if (Wa(t))
        e = t.get("seriesLayoutBy", !0), i = t.get("sourceHeader", !0), n = t.get("dimensions", !0);
      else if (!this._getUpstreamSourceManagers().length) {
        var a = t;
        e = a.get("seriesLayoutBy", !0), i = a.get("sourceHeader", !0), n = a.get("dimensions", !0);
      }
      return {
        seriesLayoutBy: e,
        sourceHeader: i,
        dimensions: n
      };
    }, r;
  })()
);
function Wa(r) {
  return r.mainType === "series";
}
function Uv(r) {
  throw new Error(r);
}
var Hx = "line-height:1";
function zy(r) {
  var t = r.lineHeight;
  return t == null ? Hx : "line-height:" + $t(t + "") + "px";
}
function Hy(r, t) {
  var e = r.color || "#6e7079", i = r.fontSize || 12, n = r.fontWeight || "400", a = r.color || "#464646", o = r.fontSize || 14, s = r.fontWeight || "900";
  return t === "html" ? {
    // eslint-disable-next-line max-len
    nameStyle: "font-size:" + $t(i + "") + "px;color:" + $t(e) + ";font-weight:" + $t(n + ""),
    // eslint-disable-next-line max-len
    valueStyle: "font-size:" + $t(o + "") + "px;color:" + $t(a) + ";font-weight:" + $t(s + "")
  } : {
    nameStyle: {
      fontSize: i,
      fill: e,
      fontWeight: n
    },
    valueStyle: {
      fontSize: o,
      fill: a,
      fontWeight: s
    }
  };
}
var $x = [0, 10, 20, 30], Vx = ["", `
`, `

`, `


`];
function ri(r, t) {
  return t.type = r, t;
}
function Gu(r) {
  return r.type === "section";
}
function $y(r) {
  return Gu(r) ? Gx : Wx;
}
function Vy(r) {
  if (Gu(r)) {
    var t = 0, e = r.blocks.length, i = e > 1 || e > 0 && !r.noHeader;
    return A(r.blocks, function(n) {
      var a = Vy(n);
      a >= t && (t = a + +(i && // 0 always can not be readable gap level.
      (!a || Gu(n) && !n.noHeader)));
    }), t;
  }
  return 0;
}
function Gx(r, t, e, i) {
  var n = t.noHeader, a = Ux(Vy(t)), o = [], s = t.blocks || [];
  $e(!s || N(s)), s = s || [];
  var l = r.orderMode;
  if (t.sortBlocks && l) {
    s = s.slice();
    var u = {
      valueAsc: "asc",
      valueDesc: "desc"
    };
    if (jr(u, l)) {
      var f = new Mx(u[l], null);
      s.sort(function(y, p) {
        return f.evaluate(y.sortParam, p.sortParam);
      });
    } else l === "seriesDesc" && s.reverse();
  }
  A(s, function(y, p) {
    var g = t.valueFormatter, m = $y(y)(
      // Inherit valueFormatter
      g ? k(k({}, r), {
        valueFormatter: g
      }) : r,
      y,
      p > 0 ? a.html : 0,
      i
    );
    m != null && o.push(m);
  });
  var h = r.renderMode === "richText" ? o.join(a.richText) : Wu(i, o.join(""), n ? e : a.html);
  if (n)
    return h;
  var v = Hu(t.header, "ordinal", r.useUTC), c = Hy(i, r.renderMode).nameStyle, d = zy(i);
  return r.renderMode === "richText" ? Gy(r, v, c) + a.richText + h : Wu(i, '<div style="' + c + ";" + d + ';">' + $t(v) + "</div>" + h, e);
}
function Wx(r, t, e, i) {
  var n = r.renderMode, a = t.noName, o = t.noValue, s = !t.markerType, l = t.name, u = r.useUTC, f = t.valueFormatter || r.valueFormatter || function(S) {
    return S = N(S) ? S : [S], H(S, function(w, b) {
      return Hu(w, N(c) ? c[b] : c, u);
    });
  };
  if (!(a && o)) {
    var h = s ? "" : r.markupStyleCreator.makeTooltipMarker(t.markerType, t.markerColor || "#333", n), v = a ? "" : Hu(l, "ordinal", u), c = t.valueType, d = o ? [] : f(t.value, t.dataIndex), y = !s || !a, p = !s && a, g = Hy(i, n), m = g.nameStyle, _ = g.valueStyle;
    return n === "richText" ? (s ? "" : h) + (a ? "" : Gy(r, v, m)) + (o ? "" : Zx(r, d, y, p, _)) : Wu(i, (s ? "" : h) + (a ? "" : Yx(v, !s, m)) + (o ? "" : Xx(d, y, p, _)), e);
  }
}
function Yv(r, t, e, i, n, a) {
  if (r) {
    var o = $y(r), s = {
      useUTC: n,
      renderMode: e,
      orderMode: i,
      markupStyleCreator: t,
      valueFormatter: r.valueFormatter
    };
    return o(s, r, 0, a);
  }
}
function Ux(r) {
  return {
    html: $x[r],
    richText: Vx[r]
  };
}
function Wu(r, t, e) {
  var i = '<div style="clear:both"></div>', n = "margin: " + e + "px 0 0", a = zy(r);
  return '<div style="' + n + ";" + a + ';">' + t + i + "</div>";
}
function Yx(r, t, e) {
  var i = t ? "margin-left:2px" : "";
  return '<span style="' + e + ";" + i + '">' + $t(r) + "</span>";
}
function Xx(r, t, e, i) {
  var n = e ? "10px" : "20px", a = t ? "float:right;margin-left:" + n : "";
  return r = N(r) ? r : [r], '<span style="' + a + ";" + i + '">' + H(r, function(o) {
    return $t(o);
  }).join("&nbsp;&nbsp;") + "</span>";
}
function Gy(r, t, e) {
  return r.markupStyleCreator.wrapRichTextStyle(t, e);
}
function Zx(r, t, e, i, n) {
  var a = [n], o = i ? 10 : 20;
  return e && a.push({
    padding: [0, 0, 0, o],
    align: "right"
  }), r.markupStyleCreator.wrapRichTextStyle(N(t) ? t.join("  ") : t, a);
}
function qx(r, t) {
  var e = r.getData().getItemVisual(t, "style"), i = e[r.visualDrawType];
  return ei(i);
}
function Wy(r, t) {
  var e = r.get("padding");
  return e ?? (t === "richText" ? [8, 10] : 10);
}
var Rl = (
  /** @class */
  (function() {
    function r() {
      this.richTextStyles = {}, this._nextStyleNameId = bg();
    }
    return r.prototype._generateStyleName = function() {
      return "__EC_aUTo_" + this._nextStyleNameId++;
    }, r.prototype.makeTooltipMarker = function(t, e, i) {
      var n = i === "richText" ? this._generateStyleName() : null, a = Bw({
        color: e,
        type: t,
        renderMode: i,
        markerId: n
      });
      return z(a) ? a : (this.richTextStyles[n] = a.style, a.content);
    }, r.prototype.wrapRichTextStyle = function(t, e) {
      var i = {};
      N(e) ? A(e, function(a) {
        return k(i, a);
      }) : k(i, e);
      var n = this._generateStyleName();
      return this.richTextStyles[n] = i, "{" + n + "|" + t + "}";
    }, r;
  })()
);
function Kx(r) {
  var t = r.series, e = r.dataIndex, i = r.multipleSeries, n = t.getData(), a = n.mapDimensionsAll("defaultedTooltip"), o = a.length, s = t.getRawValue(e), l = N(s), u = qx(t, e), f, h, v, c;
  if (o > 1 || l && !o) {
    var d = jx(s, t, e, a, u);
    f = d.inlineValues, h = d.inlineValueTypes, v = d.blocks, c = d.inlineValues[0];
  } else if (o) {
    var y = n.getDimensionInfo(a[0]);
    c = f = Ui(n, e, a[0]), h = y.type;
  } else
    c = f = l ? s[0] : s;
  var p = Hf(t), g = p && t.name || "", m = n.getName(e), _ = i ? g : m;
  return ri("section", {
    header: g,
    // When series name is not specified, do not show a header line with only '-'.
    // This case always happens in tooltip.trigger: 'item'.
    noHeader: i || !p,
    sortParam: c,
    blocks: [ri("nameValue", {
      markerType: "item",
      markerColor: u,
      // Do not mix display seriesName and itemName in one tooltip,
      // which might confuses users.
      name: _,
      // name dimension might be auto assigned, where the name might
      // be not readable. So we check trim here.
      noName: !Me(_),
      value: f,
      valueType: h,
      dataIndex: e
    })].concat(v || [])
  });
}
function jx(r, t, e, i, n) {
  var a = t.getData(), o = Zi(r, function(h, v, c) {
    var d = a.getDimensionInfo(c);
    return h = h || d && d.tooltip !== !1 && d.displayName != null;
  }, !1), s = [], l = [], u = [];
  i.length ? A(i, function(h) {
    f(Ui(a, e, h), h);
  }) : A(r, f);
  function f(h, v) {
    var c = a.getDimensionInfo(v);
    !c || c.otherDims.tooltip === !1 || (o ? u.push(ri("nameValue", {
      markerType: "subItem",
      markerColor: n,
      name: c.displayName,
      value: h,
      valueType: c.type
    })) : (s.push(h), l.push(c.type)));
  }
  return {
    inlineValues: s,
    inlineValueTypes: l,
    blocks: u
  };
}
var Ke = mt();
function Ua(r, t) {
  return r.getName(t) || r.getId(t);
}
var Qx = "__universalTransitionEnabled", dr = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e._selectedDataIndicesMap = {}, e;
    }
    return t.prototype.init = function(e, i, n) {
      this.seriesIndex = this.componentIndex, this.dataTask = Wn({
        count: tT,
        reset: eT
      }), this.dataTask.context = {
        model: this
      }, this.mergeDefaultAndTheme(e, n);
      var a = Ke(this).sourceManager = new zx(this);
      a.prepareSource();
      var o = this.getInitialData(e, n);
      Zv(o, this), this.dataTask.context.data = o, Ke(this).dataBeforeProcessed = o, Xv(this), this._initSelectedMapFromData(o);
    }, t.prototype.mergeDefaultAndTheme = function(e, i) {
      var n = sa(this), a = n ? Ds(e) : {}, o = this.subType;
      at.hasClass(o) && (o += "Series"), Q(e, i.getTheme().get(this.subType)), Q(e, this.getDefaultOption()), Lu(e, "label", ["show"]), this.fillDataTextStyle(e.data), n && Wi(e, a, n);
    }, t.prototype.mergeOption = function(e, i) {
      e = Q(this.option, e, !0), this.fillDataTextStyle(e.data);
      var n = sa(this);
      n && Wi(this.option, e, n);
      var a = Ke(this).sourceManager;
      a.dirty(), a.prepareSource();
      var o = this.getInitialData(e, i);
      Zv(o, this), this.dataTask.dirty(), this.dataTask.context.data = o, Ke(this).dataBeforeProcessed = o, Xv(this), this._initSelectedMapFromData(o);
    }, t.prototype.fillDataTextStyle = function(e) {
      if (e && !Xt(e))
        for (var i = ["show"], n = 0; n < e.length; n++)
          e[n] && e[n].label && Lu(e[n], "label", i);
    }, t.prototype.getInitialData = function(e, i) {
    }, t.prototype.appendData = function(e) {
      var i = this.getRawData();
      i.appendData(e.data);
    }, t.prototype.getData = function(e) {
      var i = Uu(this);
      if (i) {
        var n = i.context.data;
        return e == null || !n.getLinkedData ? n : n.getLinkedData(e);
      } else
        return Ke(this).data;
    }, t.prototype.getAllData = function() {
      var e = this.getData();
      return e && e.getLinkedDataAll ? e.getLinkedDataAll() : [{
        data: e
      }];
    }, t.prototype.setData = function(e) {
      var i = Uu(this);
      if (i) {
        var n = i.context;
        n.outputData = e, i !== this.dataTask && (n.data = e);
      }
      Ke(this).data = e;
    }, t.prototype.getEncode = function() {
      var e = this.get("encode", !0);
      if (e)
        return Z(e);
    }, t.prototype.getSourceManager = function() {
      return Ke(this).sourceManager;
    }, t.prototype.getSource = function() {
      return this.getSourceManager().getSource();
    }, t.prototype.getRawData = function() {
      return Ke(this).dataBeforeProcessed;
    }, t.prototype.getColorBy = function() {
      var e = this.get("colorBy");
      return e || "series";
    }, t.prototype.isColorBySeries = function() {
      return this.getColorBy() === "series";
    }, t.prototype.getBaseAxis = function() {
      var e = this.coordinateSystem;
      return e && e.getBaseAxis && e.getBaseAxis();
    }, t.prototype.formatTooltip = function(e, i, n) {
      return Kx({
        series: this,
        dataIndex: e,
        multipleSeries: i
      });
    }, t.prototype.isAnimationEnabled = function() {
      var e = this.ecModel;
      if (U.node && !(e && e.ssr))
        return !1;
      var i = this.getShallow("animation");
      return i && this.getData().count() > this.getShallow("animationThreshold") && (i = !1), !!i;
    }, t.prototype.restoreData = function() {
      this.dataTask.dirty();
    }, t.prototype.getColorFromPalette = function(e, i, n) {
      var a = this.ecModel, o = lh.prototype.getColorFromPalette.call(this, e, i, n);
      return o || (o = a.getColorFromPalette(e, i, n)), o;
    }, t.prototype.coordDimToDataDim = function(e) {
      return this.getRawData().mapDimensionsAll(e);
    }, t.prototype.getProgressive = function() {
      return this.get("progressive");
    }, t.prototype.getProgressiveThreshold = function() {
      return this.get("progressiveThreshold");
    }, t.prototype.select = function(e, i) {
      this._innerSelect(this.getData(i), e);
    }, t.prototype.unselect = function(e, i) {
      var n = this.option.selectedMap;
      if (n) {
        var a = this.option.selectedMode, o = this.getData(i);
        if (a === "series" || n === "all") {
          this.option.selectedMap = {}, this._selectedDataIndicesMap = {};
          return;
        }
        for (var s = 0; s < e.length; s++) {
          var l = e[s], u = Ua(o, l);
          n[u] = !1, this._selectedDataIndicesMap[u] = -1;
        }
      }
    }, t.prototype.toggleSelect = function(e, i) {
      for (var n = [], a = 0; a < e.length; a++)
        n[0] = e[a], this.isSelected(e[a], i) ? this.unselect(n, i) : this.select(n, i);
    }, t.prototype.getSelectedDataIndices = function() {
      if (this.option.selectedMap === "all")
        return [].slice.call(this.getData().getIndices());
      for (var e = this._selectedDataIndicesMap, i = pt(e), n = [], a = 0; a < i.length; a++) {
        var o = e[i[a]];
        o >= 0 && n.push(o);
      }
      return n;
    }, t.prototype.isSelected = function(e, i) {
      var n = this.option.selectedMap;
      if (!n)
        return !1;
      var a = this.getData(i);
      return (n === "all" || n[Ua(a, e)]) && !a.getItemModel(e).get(["select", "disabled"]);
    }, t.prototype.isUniversalTransitionEnabled = function() {
      if (this[Qx])
        return !0;
      var e = this.option.universalTransition;
      return e ? e === !0 ? !0 : e && e.enabled : !1;
    }, t.prototype._innerSelect = function(e, i) {
      var n, a, o = this.option, s = o.selectedMode, l = i.length;
      if (!(!s || !l)) {
        if (s === "series")
          o.selectedMap = "all";
        else if (s === "multiple") {
          W(o.selectedMap) || (o.selectedMap = {});
          for (var u = o.selectedMap, f = 0; f < l; f++) {
            var h = i[f], v = Ua(e, h);
            u[v] = !0, this._selectedDataIndicesMap[v] = e.getRawIndex(h);
          }
        } else if (s === "single" || s === !0) {
          var c = i[l - 1], v = Ua(e, c);
          o.selectedMap = (n = {}, n[v] = !0, n), this._selectedDataIndicesMap = (a = {}, a[v] = e.getRawIndex(c), a);
        }
      }
    }, t.prototype._initSelectedMapFromData = function(e) {
      if (!this.option.selectedMap) {
        var i = [];
        e.hasItemOption && e.each(function(n) {
          var a = e.getRawDataItem(n);
          a && a.selected && i.push(n);
        }), i.length > 0 && this._innerSelect(e, i);
      }
    }, t.registerClass = function(e) {
      return at.registerClass(e);
    }, t.protoInitialize = (function() {
      var e = t.prototype;
      e.type = "series.__base__", e.seriesIndex = 0, e.ignoreStyleOnData = !1, e.hasSymbolVisual = !1, e.defaultSymbol = "circle", e.visualStyleAccessPath = "itemStyle", e.visualDrawType = "fill";
    })(), t;
  })(at)
);
_e(dr, vh);
_e(dr, lh);
Dg(dr, at);
function Xv(r) {
  var t = r.name;
  Hf(r) || (r.name = Jx(r) || t);
}
function Jx(r) {
  var t = r.getRawData(), e = t.mapDimensionsAll("seriesName"), i = [];
  return A(e, function(n) {
    var a = t.getDimensionInfo(n);
    a.displayName && i.push(a.displayName);
  }), i.join(" ");
}
function tT(r) {
  return r.model.getRawData().count();
}
function eT(r) {
  var t = r.model;
  return t.setData(t.getRawData().cloneShallow()), rT;
}
function rT(r, t) {
  t.outputData && r.end > t.outputData.count() && t.model.getRawData().cloneShallow(t.outputData);
}
function Zv(r, t) {
  A(b0(r.CHANGABLE_METHODS, r.DOWNSAMPLE_METHODS), function(e) {
    r.wrapMethod(e, ht(iT, t));
  });
}
function iT(r, t) {
  var e = Uu(r);
  return e && e.setOutputEnd((t || this).count()), t;
}
function Uu(r) {
  var t = (r.ecModel || {}).scheduler, e = t && t.getPipeline(r.uid);
  if (e) {
    var i = e.currentTask;
    if (i) {
      var n = i.agentStubMap;
      n && (i = n.get(r.uid));
    }
    return i;
  }
}
var me = (
  /** @class */
  (function() {
    function r() {
      this.group = new Dt(), this.uid = Ss("viewComponent");
    }
    return r.prototype.init = function(t, e) {
    }, r.prototype.render = function(t, e, i, n) {
    }, r.prototype.dispose = function(t, e) {
    }, r.prototype.updateView = function(t, e, i, n) {
    }, r.prototype.updateLayout = function(t, e, i, n) {
    }, r.prototype.updateVisual = function(t, e, i, n) {
    }, r.prototype.toggleBlurSeries = function(t, e, i) {
    }, r.prototype.eachRendered = function(t) {
      var e = this.group;
      e && e.traverse(t);
    }, r;
  })()
);
Vf(me);
os(me);
function Uy() {
  var r = mt();
  return function(t) {
    var e = r(t), i = t.pipelineContext, n = !!e.large, a = !!e.progressiveRender, o = e.large = !!(i && i.large), s = e.progressiveRender = !!(i && i.progressiveRender);
    return (n !== o || a !== s) && "reset";
  };
}
var Yy = mt(), nT = Uy(), Pe = (
  /** @class */
  (function() {
    function r() {
      this.group = new Dt(), this.uid = Ss("viewChart"), this.renderTask = Wn({
        plan: aT,
        reset: oT
      }), this.renderTask.context = {
        view: this
      };
    }
    return r.prototype.init = function(t, e) {
    }, r.prototype.render = function(t, e, i, n) {
    }, r.prototype.highlight = function(t, e, i, n) {
      var a = t.getData(n && n.dataType);
      a && Kv(a, n, "emphasis");
    }, r.prototype.downplay = function(t, e, i, n) {
      var a = t.getData(n && n.dataType);
      a && Kv(a, n, "normal");
    }, r.prototype.remove = function(t, e) {
      this.group.removeAll();
    }, r.prototype.dispose = function(t, e) {
    }, r.prototype.updateView = function(t, e, i, n) {
      this.render(t, e, i, n);
    }, r.prototype.updateLayout = function(t, e, i, n) {
      this.render(t, e, i, n);
    }, r.prototype.updateVisual = function(t, e, i, n) {
      this.render(t, e, i, n);
    }, r.prototype.eachRendered = function(t) {
      ys(this.group, t);
    }, r.markUpdateMethod = function(t, e) {
      Yy(t).updateMethod = e;
    }, r.protoInitialize = (function() {
      var t = r.prototype;
      t.type = "chart";
    })(), r;
  })()
);
function qv(r, t, e) {
  r && Nu(r) && (t === "emphasis" ? ia : na)(r, e);
}
function Kv(r, t, e) {
  var i = Jr(r, t), n = t && t.highlightKey != null ? _b(t.highlightKey) : null;
  i != null ? A(Ot(i), function(a) {
    qv(r.getItemGraphicEl(a), e, n);
  }) : r.eachItemGraphicEl(function(a) {
    qv(a, e, n);
  });
}
Vf(Pe);
os(Pe);
function aT(r) {
  return nT(r.model);
}
function oT(r) {
  var t = r.model, e = r.ecModel, i = r.api, n = r.payload, a = t.pipelineContext.progressiveRender, o = r.view, s = n && Yy(n).updateMethod, l = a ? "incrementalPrepareRender" : s && o[s] ? s : "render";
  return l !== "render" && o[l](t, e, i, n), sT[l];
}
var sT = {
  incrementalPrepareRender: {
    progress: function(r, t) {
      t.view.incrementalRender(r, t.model, t.ecModel, t.api, t.payload);
    }
  },
  render: {
    // Put view.render in `progress` to support appendData. But in this case
    // view.render should not be called in reset, otherwise it will be called
    // twise. Use `forceFirstProgress` to make sure that view.render is called
    // in any cases.
    forceFirstProgress: !0,
    progress: function(r, t) {
      t.view.render(t.model, t.ecModel, t.api, t.payload);
    }
  }
}, Yo = "\0__throttleOriginMethod", jv = "\0__throttleRate", Qv = "\0__throttleType";
function Xy(r, t, e) {
  var i, n = 0, a = 0, o = null, s, l, u, f;
  t = t || 0;
  function h() {
    a = (/* @__PURE__ */ new Date()).getTime(), o = null, r.apply(l, u || []);
  }
  var v = function() {
    for (var c = [], d = 0; d < arguments.length; d++)
      c[d] = arguments[d];
    i = (/* @__PURE__ */ new Date()).getTime(), l = this, u = c;
    var y = f || t, p = f || e;
    f = null, s = i - (p ? n : a) - y, clearTimeout(o), p ? o = setTimeout(h, y) : s >= 0 ? h() : o = setTimeout(h, -s), n = i;
  };
  return v.clear = function() {
    o && (clearTimeout(o), o = null);
  }, v.debounceNextCall = function(c) {
    f = c;
  }, v;
}
function Zy(r, t, e, i) {
  var n = r[t];
  if (n) {
    var a = n[Yo] || n, o = n[Qv], s = n[jv];
    if (s !== e || o !== i) {
      if (e == null || !i)
        return r[t] = a;
      n = r[t] = Xy(a, e, i === "debounce"), n[Yo] = a, n[Qv] = i, n[jv] = e;
    }
    return n;
  }
}
function Yu(r, t) {
  var e = r[t];
  e && e[Yo] && (e.clear && e.clear(), r[t] = e[Yo]);
}
var Jv = mt(), td = {
  itemStyle: ra(oy, !0),
  lineStyle: ra(ay, !0)
}, lT = {
  lineStyle: "stroke",
  itemStyle: "fill"
};
function qy(r, t) {
  var e = r.visualStyleMapper || td[t];
  return e || (console.warn("Unknown style type '" + t + "'."), td.itemStyle);
}
function Ky(r, t) {
  var e = r.visualDrawType || lT[t];
  return e || (console.warn("Unknown style type '" + t + "'."), "fill");
}
var uT = {
  createOnAllSeries: !0,
  performRawSeries: !0,
  reset: function(r, t) {
    var e = r.getData(), i = r.visualStyleAccessPath || "itemStyle", n = r.getModel(i), a = qy(r, i), o = a(n), s = n.getShallow("decal");
    s && (e.setVisual("decal", s), s.dirty = !0);
    var l = Ky(r, i), u = o[l], f = G(u) ? u : null, h = o.fill === "auto" || o.stroke === "auto";
    if (!o[l] || f || h) {
      var v = r.getColorFromPalette(
        // TODO series count changed.
        r.name,
        null,
        t.getSeriesCount()
      );
      o[l] || (o[l] = v, e.setVisual("colorFromPalette", !0)), o.fill = o.fill === "auto" || G(o.fill) ? v : o.fill, o.stroke = o.stroke === "auto" || G(o.stroke) ? v : o.stroke;
    }
    if (e.setVisual("style", o), e.setVisual("drawType", l), !t.isSeriesFiltered(r) && f)
      return e.setVisual("colorFromPalette", !1), {
        dataEach: function(c, d) {
          var y = r.getDataParams(d), p = k({}, o);
          p[l] = f(y), c.setItemVisual(d, "style", p);
        }
      };
  }
}, vn = new yt(), fT = {
  createOnAllSeries: !0,
  performRawSeries: !0,
  reset: function(r, t) {
    if (!(r.ignoreStyleOnData || t.isSeriesFiltered(r))) {
      var e = r.getData(), i = r.visualStyleAccessPath || "itemStyle", n = qy(r, i), a = e.getVisual("drawType");
      return {
        dataEach: e.hasItemOption ? function(o, s) {
          var l = o.getRawDataItem(s);
          if (l && l[i]) {
            vn.option = l[i];
            var u = n(vn), f = o.ensureUniqueItemVisual(s, "style");
            k(f, u), vn.option.decal && (o.setItemVisual(s, "decal", vn.option.decal), vn.option.decal.dirty = !0), a in u && o.setItemVisual(s, "colorFromPalette", !1);
          }
        } : null
      };
    }
  }
}, hT = {
  performRawSeries: !0,
  overallReset: function(r) {
    var t = Z();
    r.eachSeries(function(e) {
      var i = e.getColorBy();
      if (!e.isColorBySeries()) {
        var n = e.type + "-" + i, a = t.get(n);
        a || (a = {}, t.set(n, a)), Jv(e).scope = a;
      }
    }), r.eachSeries(function(e) {
      if (!(e.isColorBySeries() || r.isSeriesFiltered(e))) {
        var i = e.getRawData(), n = {}, a = e.getData(), o = Jv(e).scope, s = e.visualStyleAccessPath || "itemStyle", l = Ky(e, s);
        a.each(function(u) {
          var f = a.getRawIndex(u);
          n[f] = u;
        }), i.each(function(u) {
          var f = n[u], h = a.getItemVisual(f, "colorFromPalette");
          if (h) {
            var v = a.ensureUniqueItemVisual(f, "style"), c = i.getName(u) || u + "", d = i.count();
            v[l] = e.getColorFromPalette(c, o, d);
          }
        });
      }
    });
  }
}, Ya = Math.PI;
function cT(r, t) {
  t = t || {}, ot(t, {
    text: "loading",
    textColor: "#000",
    fontSize: 12,
    fontWeight: "normal",
    fontStyle: "normal",
    fontFamily: "sans-serif",
    maskColor: "rgba(255, 255, 255, 0.8)",
    showSpinner: !0,
    color: "#5470c6",
    spinnerRadius: 10,
    lineWidth: 5,
    zlevel: 0
  });
  var e = new Dt(), i = new Lt({
    style: {
      fill: t.maskColor
    },
    zlevel: t.zlevel,
    z: 1e4
  });
  e.add(i);
  var n = new Zt({
    style: {
      text: t.text,
      fill: t.textColor,
      fontSize: t.fontSize,
      fontWeight: t.fontWeight,
      fontStyle: t.fontStyle,
      fontFamily: t.fontFamily
    },
    zlevel: t.zlevel,
    z: 10001
  }), a = new Lt({
    style: {
      fill: "none"
    },
    textContent: n,
    textConfig: {
      position: "right",
      distance: 10
    },
    zlevel: t.zlevel,
    z: 10001
  });
  e.add(a);
  var o;
  return t.showSpinner && (o = new ps({
    shape: {
      startAngle: -Ya / 2,
      endAngle: -Ya / 2 + 0.1,
      r: t.spinnerRadius
    },
    style: {
      stroke: t.color,
      lineCap: "round",
      lineWidth: t.lineWidth
    },
    zlevel: t.zlevel,
    z: 10001
  }), o.animateShape(!0).when(1e3, {
    endAngle: Ya * 3 / 2
  }).start("circularInOut"), o.animateShape(!0).when(1e3, {
    startAngle: Ya * 3 / 2
  }).delay(300).start("circularInOut"), e.add(o)), e.resize = function() {
    var s = n.getBoundingRect().width, l = t.showSpinner ? t.spinnerRadius : 0, u = (r.getWidth() - l * 2 - (t.showSpinner && s ? 10 : 0) - s) / 2 - (t.showSpinner && s ? 0 : 5 + s / 2) + (t.showSpinner ? 0 : s / 2) + (s ? 0 : l), f = r.getHeight() / 2;
    t.showSpinner && o.setShape({
      cx: u,
      cy: f
    }), a.setShape({
      x: u - l,
      y: f - l,
      width: l * 2,
      height: l * 2
    }), i.setShape({
      x: 0,
      y: 0,
      width: r.getWidth(),
      height: r.getHeight()
    });
  }, e.resize(), e;
}
var jy = (
  /** @class */
  (function() {
    function r(t, e, i, n) {
      this._stageTaskMap = Z(), this.ecInstance = t, this.api = e, i = this._dataProcessorHandlers = i.slice(), n = this._visualHandlers = n.slice(), this._allHandlers = i.concat(n);
    }
    return r.prototype.restoreData = function(t, e) {
      t.restoreData(e), this._stageTaskMap.each(function(i) {
        var n = i.overallTask;
        n && n.dirty();
      });
    }, r.prototype.getPerformArgs = function(t, e) {
      if (t.__pipeline) {
        var i = this._pipelineMap.get(t.__pipeline.id), n = i.context, a = !e && i.progressiveEnabled && (!n || n.progressiveRender) && t.__idxInPipeline > i.blockIndex, o = a ? i.step : null, s = n && n.modDataCount, l = s != null ? Math.ceil(s / o) : null;
        return {
          step: o,
          modBy: l,
          modDataCount: s
        };
      }
    }, r.prototype.getPipeline = function(t) {
      return this._pipelineMap.get(t);
    }, r.prototype.updateStreamModes = function(t, e) {
      var i = this._pipelineMap.get(t.uid), n = t.getData(), a = n.count(), o = i.progressiveEnabled && e.incrementalPrepareRender && a >= i.threshold, s = t.get("large") && a >= t.get("largeThreshold"), l = t.get("progressiveChunkMode") === "mod" ? a : null;
      t.pipelineContext = i.context = {
        progressiveRender: o,
        modDataCount: l,
        large: s
      };
    }, r.prototype.restorePipelines = function(t) {
      var e = this, i = e._pipelineMap = Z();
      t.eachSeries(function(n) {
        var a = n.getProgressive(), o = n.uid;
        i.set(o, {
          id: o,
          head: null,
          tail: null,
          threshold: n.getProgressiveThreshold(),
          progressiveEnabled: a && !(n.preventIncremental && n.preventIncremental()),
          blockIndex: -1,
          step: Math.round(a || 700),
          count: 0
        }), e._pipe(n, n.dataTask);
      });
    }, r.prototype.prepareStageTasks = function() {
      var t = this._stageTaskMap, e = this.api.getModel(), i = this.api;
      A(this._allHandlers, function(n) {
        var a = t.get(n.uid) || t.set(n.uid, {}), o = "";
        $e(!(n.reset && n.overallReset), o), n.reset && this._createSeriesStageTask(n, a, e, i), n.overallReset && this._createOverallStageTask(n, a, e, i);
      }, this);
    }, r.prototype.prepareView = function(t, e, i, n) {
      var a = t.renderTask, o = a.context;
      o.model = e, o.ecModel = i, o.api = n, a.__block = !t.incrementalPrepareRender, this._pipe(e, a);
    }, r.prototype.performDataProcessorTasks = function(t, e) {
      this._performStageTasks(this._dataProcessorHandlers, t, e, {
        block: !0
      });
    }, r.prototype.performVisualTasks = function(t, e, i) {
      this._performStageTasks(this._visualHandlers, t, e, i);
    }, r.prototype._performStageTasks = function(t, e, i, n) {
      n = n || {};
      var a = !1, o = this;
      A(t, function(l, u) {
        if (!(n.visualType && n.visualType !== l.visualType)) {
          var f = o._stageTaskMap.get(l.uid), h = f.seriesTaskMap, v = f.overallTask;
          if (v) {
            var c, d = v.agentStubMap;
            d.each(function(p) {
              s(n, p) && (p.dirty(), c = !0);
            }), c && v.dirty(), o.updatePayload(v, i);
            var y = o.getPerformArgs(v, n.block);
            d.each(function(p) {
              p.perform(y);
            }), v.perform(y) && (a = !0);
          } else h && h.each(function(p, g) {
            s(n, p) && p.dirty();
            var m = o.getPerformArgs(p, n.block);
            m.skip = !l.performRawSeries && e.isSeriesFiltered(p.context.model), o.updatePayload(p, i), p.perform(m) && (a = !0);
          });
        }
      });
      function s(l, u) {
        return l.setDirty && (!l.dirtyMap || l.dirtyMap.get(u.__pipeline.id));
      }
      this.unfinished = a || this.unfinished;
    }, r.prototype.performSeriesTasks = function(t) {
      var e;
      t.eachSeries(function(i) {
        e = i.dataTask.perform() || e;
      }), this.unfinished = e || this.unfinished;
    }, r.prototype.plan = function() {
      this._pipelineMap.each(function(t) {
        var e = t.tail;
        do {
          if (e.__block) {
            t.blockIndex = e.__idxInPipeline;
            break;
          }
          e = e.getUpstream();
        } while (e);
      });
    }, r.prototype.updatePayload = function(t, e) {
      e !== "remain" && (t.context.payload = e);
    }, r.prototype._createSeriesStageTask = function(t, e, i, n) {
      var a = this, o = e.seriesTaskMap, s = e.seriesTaskMap = Z(), l = t.seriesType, u = t.getTargetSeries;
      t.createOnAllSeries ? i.eachRawSeries(f) : l ? i.eachRawSeriesByType(l, f) : u && u(i, n).each(f);
      function f(h) {
        var v = h.uid, c = s.set(v, o && o.get(v) || Wn({
          plan: yT,
          reset: mT,
          count: ST
        }));
        c.context = {
          model: h,
          ecModel: i,
          api: n,
          // PENDING: `useClearVisual` not used?
          useClearVisual: t.isVisual && !t.isLayout,
          plan: t.plan,
          reset: t.reset,
          scheduler: a
        }, a._pipe(h, c);
      }
    }, r.prototype._createOverallStageTask = function(t, e, i, n) {
      var a = this, o = e.overallTask = e.overallTask || Wn({
        reset: vT
      });
      o.context = {
        ecModel: i,
        api: n,
        overallReset: t.overallReset,
        scheduler: a
      };
      var s = o.agentStubMap, l = o.agentStubMap = Z(), u = t.seriesType, f = t.getTargetSeries, h = !0, v = !1, c = "";
      $e(!t.createOnAllSeries, c), u ? i.eachRawSeriesByType(u, d) : f ? f(i, n).each(d) : (h = !1, A(i.getSeries(), d));
      function d(y) {
        var p = y.uid, g = l.set(p, s && s.get(p) || // When the result of `getTargetSeries` changed, the overallTask
        // should be set as dirty and re-performed.
        (v = !0, Wn({
          reset: dT,
          onDirty: gT
        })));
        g.context = {
          model: y,
          overallProgress: h
          // FIXME:TS never used, so comment it
          // modifyOutputEnd: modifyOutputEnd
        }, g.agent = o, g.__block = h, a._pipe(y, g);
      }
      v && o.dirty();
    }, r.prototype._pipe = function(t, e) {
      var i = t.uid, n = this._pipelineMap.get(i);
      !n.head && (n.head = e), n.tail && n.tail.pipe(e), n.tail = e, e.__idxInPipeline = n.count++, e.__pipeline = n;
    }, r.wrapStageHandler = function(t, e) {
      return G(t) && (t = {
        overallReset: t,
        seriesType: bT(t)
      }), t.uid = Ss("stageHandler"), e && (t.visualType = e), t;
    }, r;
  })()
);
function vT(r) {
  r.overallReset(r.ecModel, r.api, r.payload);
}
function dT(r) {
  return r.overallProgress && pT;
}
function pT() {
  this.agent.dirty(), this.getDownstream().dirty();
}
function gT() {
  this.agent && this.agent.dirty();
}
function yT(r) {
  return r.plan ? r.plan(r.model, r.ecModel, r.api, r.payload) : null;
}
function mT(r) {
  r.useClearVisual && r.data.clearAllVisual();
  var t = r.resetDefines = Ot(r.reset(r.model, r.ecModel, r.api, r.payload));
  return t.length > 1 ? H(t, function(e, i) {
    return Qy(i);
  }) : _T;
}
var _T = Qy(0);
function Qy(r) {
  return function(t, e) {
    var i = e.data, n = e.resetDefines[r];
    if (n && n.dataEach)
      for (var a = t.start; a < t.end; a++)
        n.dataEach(i, a);
    else n && n.progress && n.progress(t, i);
  };
}
function ST(r) {
  return r.data.count();
}
function bT(r) {
  Xo = null;
  try {
    r(ua, Jy);
  } catch {
  }
  return Xo;
}
var ua = {}, Jy = {}, Xo;
tm(ua, uh);
tm(Jy, My);
ua.eachSeriesByType = ua.eachRawSeriesByType = function(r) {
  Xo = r;
};
ua.eachComponent = function(r) {
  r.mainType === "series" && r.subType && (Xo = r.subType);
};
function tm(r, t) {
  for (var e in t.prototype)
    r[e] = Ut;
}
var ed = ["#37A2DA", "#32C5E9", "#67E0E3", "#9FE6B8", "#FFDB5C", "#ff9f7f", "#fb7293", "#E062AE", "#E690D1", "#e7bcf3", "#9d96f5", "#8378EA", "#96BFFF"];
const wT = {
  color: ed,
  colorLayer: [["#37A2DA", "#ffd85c", "#fd7b5f"], ["#37A2DA", "#67E0E3", "#FFDB5C", "#ff9f7f", "#E062AE", "#9d96f5"], ["#37A2DA", "#32C5E9", "#9FE6B8", "#FFDB5C", "#ff9f7f", "#fb7293", "#e7bcf3", "#8378EA", "#96BFFF"], ed]
};
var Et = "#B9B8CE", rd = "#100C2A", Xa = function() {
  return {
    axisLine: {
      lineStyle: {
        color: Et
      }
    },
    splitLine: {
      lineStyle: {
        color: "#484753"
      }
    },
    splitArea: {
      areaStyle: {
        color: ["rgba(255,255,255,0.02)", "rgba(255,255,255,0.05)"]
      }
    },
    minorSplitLine: {
      lineStyle: {
        color: "#20203B"
      }
    }
  };
}, id = ["#4992ff", "#7cffb2", "#fddd60", "#ff6e76", "#58d9f9", "#05c091", "#ff8a45", "#8d48e3", "#dd79ff"], em = {
  darkMode: !0,
  color: id,
  backgroundColor: rd,
  axisPointer: {
    lineStyle: {
      color: "#817f91"
    },
    crossStyle: {
      color: "#817f91"
    },
    label: {
      // TODO Contrast of label backgorundColor
      color: "#fff"
    }
  },
  legend: {
    textStyle: {
      color: Et
    },
    pageTextStyle: {
      color: Et
    }
  },
  textStyle: {
    color: Et
  },
  title: {
    textStyle: {
      color: "#EEF1FA"
    },
    subtextStyle: {
      color: "#B9B8CE"
    }
  },
  toolbox: {
    iconStyle: {
      borderColor: Et
    }
  },
  dataZoom: {
    borderColor: "#71708A",
    textStyle: {
      color: Et
    },
    brushStyle: {
      color: "rgba(135,163,206,0.3)"
    },
    handleStyle: {
      color: "#353450",
      borderColor: "#C5CBE3"
    },
    moveHandleStyle: {
      color: "#B0B6C3",
      opacity: 0.3
    },
    fillerColor: "rgba(135,163,206,0.2)",
    emphasis: {
      handleStyle: {
        borderColor: "#91B7F2",
        color: "#4D587D"
      },
      moveHandleStyle: {
        color: "#636D9A",
        opacity: 0.7
      }
    },
    dataBackground: {
      lineStyle: {
        color: "#71708A",
        width: 1
      },
      areaStyle: {
        color: "#71708A"
      }
    },
    selectedDataBackground: {
      lineStyle: {
        color: "#87A3CE"
      },
      areaStyle: {
        color: "#87A3CE"
      }
    }
  },
  visualMap: {
    textStyle: {
      color: Et
    }
  },
  timeline: {
    lineStyle: {
      color: Et
    },
    label: {
      color: Et
    },
    controlStyle: {
      color: Et,
      borderColor: Et
    }
  },
  calendar: {
    itemStyle: {
      color: rd
    },
    dayLabel: {
      color: Et
    },
    monthLabel: {
      color: Et
    },
    yearLabel: {
      color: Et
    }
  },
  timeAxis: Xa(),
  logAxis: Xa(),
  valueAxis: Xa(),
  categoryAxis: Xa(),
  line: {
    symbol: "circle"
  },
  graph: {
    color: id
  },
  gauge: {
    title: {
      color: Et
    },
    axisLine: {
      lineStyle: {
        color: [[1, "rgba(207,212,219,0.2)"]]
      }
    },
    axisLabel: {
      color: Et
    },
    detail: {
      color: "#EEF1FA"
    }
  },
  candlestick: {
    itemStyle: {
      color: "#f64e56",
      color0: "#54ea92",
      borderColor: "#f64e56",
      borderColor0: "#54ea92"
      // borderColor: '#ca2824',
      // borderColor0: '#09a443'
    }
  }
};
em.categoryAxis.splitLine.show = !1;
var xT = (
  /** @class */
  (function() {
    function r() {
    }
    return r.prototype.normalizeQuery = function(t) {
      var e = {}, i = {}, n = {};
      if (z(t)) {
        var a = Ae(t);
        e.mainType = a.main || null, e.subType = a.sub || null;
      } else {
        var o = ["Index", "Name", "Id"], s = {
          name: 1,
          dataIndex: 1,
          dataType: 1
        };
        A(t, function(l, u) {
          for (var f = !1, h = 0; h < o.length; h++) {
            var v = o[h], c = u.lastIndexOf(v);
            if (c > 0 && c === u.length - v.length) {
              var d = u.slice(0, c);
              d !== "data" && (e.mainType = d, e[v.toLowerCase()] = l, f = !0);
            }
          }
          s.hasOwnProperty(u) && (i[u] = l, f = !0), f || (n[u] = l);
        });
      }
      return {
        cptQuery: e,
        dataQuery: i,
        otherQuery: n
      };
    }, r.prototype.filter = function(t, e) {
      var i = this.eventInfo;
      if (!i)
        return !0;
      var n = i.targetEl, a = i.packedEvent, o = i.model, s = i.view;
      if (!o || !s)
        return !0;
      var l = e.cptQuery, u = e.dataQuery;
      return f(l, o, "mainType") && f(l, o, "subType") && f(l, o, "index", "componentIndex") && f(l, o, "name") && f(l, o, "id") && f(u, a, "name") && f(u, a, "dataIndex") && f(u, a, "dataType") && (!s.filterForExposedEvent || s.filterForExposedEvent(t, e.otherQuery, n, a));
      function f(h, v, c, d) {
        return h[c] == null || v[d || c] === h[c];
      }
    }, r.prototype.afterTrigger = function() {
      this.eventInfo = null;
    }, r;
  })()
), Xu = ["symbol", "symbolSize", "symbolRotate", "symbolOffset"], nd = Xu.concat(["symbolKeepAspect"]), TT = {
  createOnAllSeries: !0,
  // For legend.
  performRawSeries: !0,
  reset: function(r, t) {
    var e = r.getData();
    if (r.legendIcon && e.setVisual("legendIcon", r.legendIcon), !r.hasSymbolVisual)
      return;
    for (var i = {}, n = {}, a = !1, o = 0; o < Xu.length; o++) {
      var s = Xu[o], l = r.get(s);
      G(l) ? (a = !0, n[s] = l) : i[s] = l;
    }
    if (i.symbol = i.symbol || r.defaultSymbol, e.setVisual(k({
      legendIcon: r.legendIcon || i.symbol,
      symbolKeepAspect: r.get("symbolKeepAspect")
    }, i)), t.isSeriesFiltered(r))
      return;
    var u = pt(n);
    function f(h, v) {
      for (var c = r.getRawValue(v), d = r.getDataParams(v), y = 0; y < u.length; y++) {
        var p = u[y];
        h.setItemVisual(v, p, n[p](c, d));
      }
    }
    return {
      dataEach: a ? f : null
    };
  }
}, CT = {
  createOnAllSeries: !0,
  // For legend.
  performRawSeries: !0,
  reset: function(r, t) {
    if (!r.hasSymbolVisual || t.isSeriesFiltered(r))
      return;
    var e = r.getData();
    function i(n, a) {
      for (var o = n.getItemModel(a), s = 0; s < nd.length; s++) {
        var l = nd[s], u = o.getShallow(l, !0);
        u != null && n.setItemVisual(a, l, u);
      }
    }
    return {
      dataEach: e.hasItemOption ? i : null
    };
  }
};
function MT(r, t, e) {
  switch (e) {
    case "color":
      var i = r.getItemVisual(t, "style");
      return i[r.getVisual("drawType")];
    case "opacity":
      return r.getItemVisual(t, "style").opacity;
    case "symbol":
    case "symbolSize":
    case "liftZ":
      return r.getItemVisual(t, e);
  }
}
function ph(r, t) {
  switch (t) {
    case "color":
      var e = r.getVisual("style");
      return e[r.getVisual("drawType")];
    case "opacity":
      return r.getVisual("style").opacity;
    case "symbol":
    case "symbolSize":
    case "liftZ":
      return r.getVisual(t);
  }
}
function mi(r, t, e, i, n) {
  var a = r + t;
  e.isSilent(a) || i.eachComponent({
    mainType: "series",
    subType: "pie"
  }, function(o) {
    for (var s = o.seriesIndex, l = o.option.selectedMap, u = n.selected, f = 0; f < u.length; f++)
      if (u[f].seriesIndex === s) {
        var h = o.getData(), v = Jr(h, n.fromActionPayload);
        e.trigger(a, {
          type: a,
          seriesId: o.id,
          name: N(v) ? h.getName(v[0]) : h.getName(v),
          selected: z(l) ? l : k({}, l)
        });
      }
  });
}
function DT(r, t, e) {
  r.on("selectchanged", function(i) {
    var n = e.getModel();
    i.isFromClick ? (mi("map", "selectchanged", t, n, i), mi("pie", "selectchanged", t, n, i)) : i.fromAction === "select" ? (mi("map", "selected", t, n, i), mi("pie", "selected", t, n, i)) : i.fromAction === "unselect" && (mi("map", "unselected", t, n, i), mi("pie", "unselected", t, n, i));
  });
}
function Pn(r, t, e) {
  for (var i; r && !(t(r) && (i = r, e)); )
    r = r.__hostTarget || r.parent;
  return i;
}
var AT = Math.round(Math.random() * 9), LT = typeof Object.defineProperty == "function", PT = (function() {
  function r() {
    this._id = "__ec_inner_" + AT++;
  }
  return r.prototype.get = function(t) {
    return this._guard(t)[this._id];
  }, r.prototype.set = function(t, e) {
    var i = this._guard(t);
    return LT ? Object.defineProperty(i, this._id, {
      value: e,
      enumerable: !1,
      configurable: !0
    }) : i[this._id] = e, this;
  }, r.prototype.delete = function(t) {
    return this.has(t) ? (delete this._guard(t)[this._id], !0) : !1;
  }, r.prototype.has = function(t) {
    return !!this._guard(t)[this._id];
  }, r.prototype._guard = function(t) {
    if (t !== Object(t))
      throw TypeError("Value of WeakMap is not a non-null object.");
    return t;
  }, r;
})(), IT = st.extend({
  type: "triangle",
  shape: {
    cx: 0,
    cy: 0,
    width: 0,
    height: 0
  },
  buildPath: function(r, t) {
    var e = t.cx, i = t.cy, n = t.width / 2, a = t.height / 2;
    r.moveTo(e, i - a), r.lineTo(e + n, i + a), r.lineTo(e - n, i + a), r.closePath();
  }
}), ET = st.extend({
  type: "diamond",
  shape: {
    cx: 0,
    cy: 0,
    width: 0,
    height: 0
  },
  buildPath: function(r, t) {
    var e = t.cx, i = t.cy, n = t.width / 2, a = t.height / 2;
    r.moveTo(e, i - a), r.lineTo(e + n, i), r.lineTo(e, i + a), r.lineTo(e - n, i), r.closePath();
  }
}), RT = st.extend({
  type: "pin",
  shape: {
    // x, y on the cusp
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: function(r, t) {
    var e = t.x, i = t.y, n = t.width / 5 * 3, a = Math.max(n, t.height), o = n / 2, s = o * o / (a - o), l = i - a + o + s, u = Math.asin(s / o), f = Math.cos(u) * o, h = Math.sin(u), v = Math.cos(u), c = o * 0.6, d = o * 0.7;
    r.moveTo(e - f, l + s), r.arc(e, l, o, Math.PI - u, Math.PI * 2 + u), r.bezierCurveTo(e + f - h * c, l + s + v * c, e, i - d, e, i), r.bezierCurveTo(e, i - d, e - f + h * c, l + s + v * c, e - f, l + s), r.closePath();
  }
}), kT = st.extend({
  type: "arrow",
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: function(r, t) {
    var e = t.height, i = t.width, n = t.x, a = t.y, o = i / 3 * 2;
    r.moveTo(n, a), r.lineTo(n + o, a + e), r.lineTo(n, a + e / 4 * 3), r.lineTo(n - o, a + e), r.lineTo(n, a), r.closePath();
  }
}), OT = {
  line: Ge,
  rect: Lt,
  roundRect: Lt,
  square: Lt,
  circle: cs,
  diamond: ET,
  pin: RT,
  arrow: kT,
  triangle: IT
}, NT = {
  line: function(r, t, e, i, n) {
    n.x1 = r, n.y1 = t + i / 2, n.x2 = r + e, n.y2 = t + i / 2;
  },
  rect: function(r, t, e, i, n) {
    n.x = r, n.y = t, n.width = e, n.height = i;
  },
  roundRect: function(r, t, e, i, n) {
    n.x = r, n.y = t, n.width = e, n.height = i, n.r = Math.min(e, i) / 4;
  },
  square: function(r, t, e, i, n) {
    var a = Math.min(e, i);
    n.x = r, n.y = t, n.width = a, n.height = a;
  },
  circle: function(r, t, e, i, n) {
    n.cx = r + e / 2, n.cy = t + i / 2, n.r = Math.min(e, i) / 2;
  },
  diamond: function(r, t, e, i, n) {
    n.cx = r + e / 2, n.cy = t + i / 2, n.width = e, n.height = i;
  },
  pin: function(r, t, e, i, n) {
    n.x = r + e / 2, n.y = t + i / 2, n.width = e, n.height = i;
  },
  arrow: function(r, t, e, i, n) {
    n.x = r + e / 2, n.y = t + i / 2, n.width = e, n.height = i;
  },
  triangle: function(r, t, e, i, n) {
    n.cx = r + e / 2, n.cy = t + i / 2, n.width = e, n.height = i;
  }
}, Zu = {};
A(OT, function(r, t) {
  Zu[t] = new r();
});
var BT = st.extend({
  type: "symbol",
  shape: {
    symbolType: "",
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  calculateTextPosition: function(r, t, e) {
    var i = pg(r, t, e), n = this.shape;
    return n && n.symbolType === "pin" && t.position === "inside" && (i.y = e.y + e.height * 0.4), i;
  },
  buildPath: function(r, t, e) {
    var i = t.symbolType;
    if (i !== "none") {
      var n = Zu[i];
      n || (i = "rect", n = Zu[i]), NT[i](t.x, t.y, t.width, t.height, n.shape), n.buildPath(r, n.shape, e);
    }
  }
});
function FT(r, t) {
  if (this.type !== "image") {
    var e = this.style;
    this.__isEmptyBrush ? (e.stroke = r, e.fill = t || "#fff", e.lineWidth = 2) : this.shape.symbolType === "line" ? e.stroke = r : e.fill = r, this.markRedraw();
  }
}
function ii(r, t, e, i, n, a, o) {
  var s = r.indexOf("empty") === 0;
  s && (r = r.substr(5, 1).toLowerCase() + r.substr(6));
  var l;
  return r.indexOf("image://") === 0 ? l = Jg(r.slice(8), new it(t, e, i, n), o ? "center" : "cover") : r.indexOf("path://") === 0 ? l = Jf(r.slice(7), {}, new it(t, e, i, n), o ? "center" : "cover") : l = new BT({
    shape: {
      symbolType: r,
      x: t,
      y: e,
      width: i,
      height: n
    }
  }), l.__isEmptyBrush = s, l.setColor = FT, a && l.setColor(a), l;
}
function gh(r) {
  return N(r) || (r = [+r, +r]), [r[0] || 0, r[1] || 0];
}
function Ps(r, t) {
  if (r != null)
    return N(r) || (r = [r, r]), [Tt(r[0], t[0]) || 0, Tt(X(r[1], r[0]), t[1]) || 0];
}
function Gr(r) {
  return isFinite(r);
}
function zT(r, t, e) {
  var i = t.x == null ? 0 : t.x, n = t.x2 == null ? 1 : t.x2, a = t.y == null ? 0 : t.y, o = t.y2 == null ? 0 : t.y2;
  t.global || (i = i * e.width + e.x, n = n * e.width + e.x, a = a * e.height + e.y, o = o * e.height + e.y), i = Gr(i) ? i : 0, n = Gr(n) ? n : 1, a = Gr(a) ? a : 0, o = Gr(o) ? o : 0;
  var s = r.createLinearGradient(i, a, n, o);
  return s;
}
function HT(r, t, e) {
  var i = e.width, n = e.height, a = Math.min(i, n), o = t.x == null ? 0.5 : t.x, s = t.y == null ? 0.5 : t.y, l = t.r == null ? 0.5 : t.r;
  t.global || (o = o * i + e.x, s = s * n + e.y, l = l * a), o = Gr(o) ? o : 0.5, s = Gr(s) ? s : 0.5, l = l >= 0 && Gr(l) ? l : 0.5;
  var u = r.createRadialGradient(o, s, 0, o, s, l);
  return u;
}
function qu(r, t, e) {
  for (var i = t.type === "radial" ? HT(r, t, e) : zT(r, t, e), n = t.colorStops, a = 0; a < n.length; a++)
    i.addColorStop(n[a].offset, n[a].color);
  return i;
}
function $T(r, t) {
  if (r === t || !r && !t)
    return !1;
  if (!r || !t || r.length !== t.length)
    return !0;
  for (var e = 0; e < r.length; e++)
    if (r[e] !== t[e])
      return !0;
  return !1;
}
function Za(r) {
  return parseInt(r, 10);
}
function qa(r, t, e) {
  var i = ["width", "height"][t], n = ["clientWidth", "clientHeight"][t], a = ["paddingLeft", "paddingTop"][t], o = ["paddingRight", "paddingBottom"][t];
  if (e[i] != null && e[i] !== "auto")
    return parseFloat(e[i]);
  var s = document.defaultView.getComputedStyle(r);
  return (r[n] || Za(s[i]) || Za(r.style[i])) - (Za(s[a]) || 0) - (Za(s[o]) || 0) | 0;
}
function VT(r, t) {
  return !r || r === "solid" || !(t > 0) ? null : r === "dashed" ? [4 * t, 2 * t] : r === "dotted" ? [t] : vt(r) ? [r] : N(r) ? r : null;
}
function rm(r) {
  var t = r.style, e = t.lineDash && t.lineWidth > 0 && VT(t.lineDash, t.lineWidth), i = t.lineDashOffset;
  if (e) {
    var n = t.strokeNoScale && r.getLineScale ? r.getLineScale() : 1;
    n && n !== 1 && (e = H(e, function(a) {
      return a / n;
    }), i /= n);
  }
  return [e, i];
}
var GT = new ti(!0);
function Zo(r) {
  var t = r.stroke;
  return !(t == null || t === "none" || !(r.lineWidth > 0));
}
function ad(r) {
  return typeof r == "string" && r !== "none";
}
function qo(r) {
  var t = r.fill;
  return t != null && t !== "none";
}
function od(r, t) {
  if (t.fillOpacity != null && t.fillOpacity !== 1) {
    var e = r.globalAlpha;
    r.globalAlpha = t.fillOpacity * t.opacity, r.fill(), r.globalAlpha = e;
  } else
    r.fill();
}
function sd(r, t) {
  if (t.strokeOpacity != null && t.strokeOpacity !== 1) {
    var e = r.globalAlpha;
    r.globalAlpha = t.strokeOpacity * t.opacity, r.stroke(), r.globalAlpha = e;
  } else
    r.stroke();
}
function Ku(r, t, e) {
  var i = Ag(t.image, t.__image, e);
  if (ss(i)) {
    var n = r.createPattern(i, t.repeat || "repeat");
    if (typeof DOMMatrix == "function" && n && n.setTransform) {
      var a = new DOMMatrix();
      a.translateSelf(t.x || 0, t.y || 0), a.rotateSelf(0, 0, (t.rotation || 0) * w0), a.scaleSelf(t.scaleX || 1, t.scaleY || 1), n.setTransform(a);
    }
    return n;
  }
}
function WT(r, t, e, i) {
  var n, a = Zo(e), o = qo(e), s = e.strokePercent, l = s < 1, u = !t.path;
  (!t.silent || l) && u && t.createPathProxy();
  var f = t.path || GT, h = t.__dirty;
  if (!i) {
    var v = e.fill, c = e.stroke, d = o && !!v.colorStops, y = a && !!c.colorStops, p = o && !!v.image, g = a && !!c.image, m = void 0, _ = void 0, S = void 0, w = void 0, b = void 0;
    (d || y) && (b = t.getBoundingRect()), d && (m = h ? qu(r, v, b) : t.__canvasFillGradient, t.__canvasFillGradient = m), y && (_ = h ? qu(r, c, b) : t.__canvasStrokeGradient, t.__canvasStrokeGradient = _), p && (S = h || !t.__canvasFillPattern ? Ku(r, v, t) : t.__canvasFillPattern, t.__canvasFillPattern = S), g && (w = h || !t.__canvasStrokePattern ? Ku(r, c, t) : t.__canvasStrokePattern, t.__canvasStrokePattern = S), d ? r.fillStyle = m : p && (S ? r.fillStyle = S : o = !1), y ? r.strokeStyle = _ : g && (w ? r.strokeStyle = w : a = !1);
  }
  var x = t.getGlobalScale();
  f.setScale(x[0], x[1], t.segmentIgnoreThreshold);
  var D, T;
  r.setLineDash && e.lineDash && (n = rm(t), D = n[0], T = n[1]);
  var C = !0;
  (u || h & xi) && (f.setDPR(r.dpr), l ? f.setContext(null) : (f.setContext(r), C = !1), f.reset(), t.buildPath(f, t.shape, i), f.toStatic(), t.pathUpdated()), C && f.rebuildPath(r, l ? s : 1), D && (r.setLineDash(D), r.lineDashOffset = T), i || (e.strokeFirst ? (a && sd(r, e), o && od(r, e)) : (o && od(r, e), a && sd(r, e))), D && r.setLineDash([]);
}
function UT(r, t, e) {
  var i = t.__image = Ag(e.image, t.__image, t, t.onload);
  if (!(!i || !ss(i))) {
    var n = e.x || 0, a = e.y || 0, o = t.getWidth(), s = t.getHeight(), l = i.width / i.height;
    if (o == null && s != null ? o = s * l : s == null && o != null ? s = o / l : o == null && s == null && (o = i.width, s = i.height), e.sWidth && e.sHeight) {
      var u = e.sx || 0, f = e.sy || 0;
      r.drawImage(i, u, f, e.sWidth, e.sHeight, n, a, o, s);
    } else if (e.sx && e.sy) {
      var u = e.sx, f = e.sy, h = o - u, v = s - f;
      r.drawImage(i, u, f, h, v, n, a, o, s);
    } else
      r.drawImage(i, n, a, o, s);
  }
}
function YT(r, t, e) {
  var i, n = e.text;
  if (n != null && (n += ""), n) {
    r.font = e.font || Kr, r.textAlign = e.textAlign, r.textBaseline = e.textBaseline;
    var a = void 0, o = void 0;
    r.setLineDash && e.lineDash && (i = rm(t), a = i[0], o = i[1]), a && (r.setLineDash(a), r.lineDashOffset = o), e.strokeFirst ? (Zo(e) && r.strokeText(n, e.x, e.y), qo(e) && r.fillText(n, e.x, e.y)) : (qo(e) && r.fillText(n, e.x, e.y), Zo(e) && r.strokeText(n, e.x, e.y)), a && r.setLineDash([]);
  }
}
var ld = ["shadowBlur", "shadowOffsetX", "shadowOffsetY"], ud = [
  ["lineCap", "butt"],
  ["lineJoin", "miter"],
  ["miterLimit", 10]
];
function im(r, t, e, i, n) {
  var a = !1;
  if (!i && (e = e || {}, t === e))
    return !1;
  if (i || t.opacity !== e.opacity) {
    Wt(r, n), a = !0;
    var o = Math.max(Math.min(t.opacity, 1), 0);
    r.globalAlpha = isNaN(o) ? Yr.opacity : o;
  }
  (i || t.blend !== e.blend) && (a || (Wt(r, n), a = !0), r.globalCompositeOperation = t.blend || Yr.blend);
  for (var s = 0; s < ld.length; s++) {
    var l = ld[s];
    (i || t[l] !== e[l]) && (a || (Wt(r, n), a = !0), r[l] = r.dpr * (t[l] || 0));
  }
  return (i || t.shadowColor !== e.shadowColor) && (a || (Wt(r, n), a = !0), r.shadowColor = t.shadowColor || Yr.shadowColor), a;
}
function fd(r, t, e, i, n) {
  var a = fa(t, n.inHover), o = i ? null : e && fa(e, n.inHover) || {};
  if (a === o)
    return !1;
  var s = im(r, a, o, i, n);
  if ((i || a.fill !== o.fill) && (s || (Wt(r, n), s = !0), ad(a.fill) && (r.fillStyle = a.fill)), (i || a.stroke !== o.stroke) && (s || (Wt(r, n), s = !0), ad(a.stroke) && (r.strokeStyle = a.stroke)), (i || a.opacity !== o.opacity) && (s || (Wt(r, n), s = !0), r.globalAlpha = a.opacity == null ? 1 : a.opacity), t.hasStroke()) {
    var l = a.lineWidth, u = l / (a.strokeNoScale && t.getLineScale ? t.getLineScale() : 1);
    r.lineWidth !== u && (s || (Wt(r, n), s = !0), r.lineWidth = u);
  }
  for (var f = 0; f < ud.length; f++) {
    var h = ud[f], v = h[0];
    (i || a[v] !== o[v]) && (s || (Wt(r, n), s = !0), r[v] = a[v] || h[1]);
  }
  return s;
}
function XT(r, t, e, i, n) {
  return im(r, fa(t, n.inHover), e && fa(e, n.inHover), i, n);
}
function nm(r, t) {
  var e = t.transform, i = r.dpr || 1;
  e ? r.setTransform(i * e[0], i * e[1], i * e[2], i * e[3], i * e[4], i * e[5]) : r.setTransform(i, 0, 0, i, 0, 0);
}
function ZT(r, t, e) {
  for (var i = !1, n = 0; n < r.length; n++) {
    var a = r[n];
    i = i || a.isZeroArea(), nm(t, a), t.beginPath(), a.buildPath(t, a.shape), t.clip();
  }
  e.allClipped = i;
}
function qT(r, t) {
  return r && t ? r[0] !== t[0] || r[1] !== t[1] || r[2] !== t[2] || r[3] !== t[3] || r[4] !== t[4] || r[5] !== t[5] : !(!r && !t);
}
var hd = 1, cd = 2, vd = 3, dd = 4;
function KT(r) {
  var t = qo(r), e = Zo(r);
  return !(r.lineDash || !(+t ^ +e) || t && typeof r.fill != "string" || e && typeof r.stroke != "string" || r.strokePercent < 1 || r.strokeOpacity < 1 || r.fillOpacity < 1);
}
function Wt(r, t) {
  t.batchFill && r.fill(), t.batchStroke && r.stroke(), t.batchFill = "", t.batchStroke = "";
}
function fa(r, t) {
  return t && r.__hoverStyle || r.style;
}
function am(r, t) {
  Wr(r, t, { inHover: !1, viewWidth: 0, viewHeight: 0 }, !0);
}
function Wr(r, t, e, i) {
  var n = t.transform;
  if (!t.shouldBePainted(e.viewWidth, e.viewHeight, !1, !1)) {
    t.__dirty &= ~jt, t.__isRendered = !1;
    return;
  }
  var a = t.__clipPaths, o = e.prevElClipPaths, s = !1, l = !1;
  if ((!o || $T(a, o)) && (o && o.length && (Wt(r, e), r.restore(), l = s = !0, e.prevElClipPaths = null, e.allClipped = !1, e.prevEl = null), a && a.length && (Wt(r, e), r.save(), ZT(a, r, e), s = !0), e.prevElClipPaths = a), e.allClipped) {
    t.__isRendered = !1;
    return;
  }
  t.beforeBrush && t.beforeBrush(), t.innerBeforeBrush();
  var u = e.prevEl;
  u || (l = s = !0);
  var f = t instanceof st && t.autoBatch && KT(t.style);
  s || qT(n, u.transform) ? (Wt(r, e), nm(r, t)) : f || Wt(r, e);
  var h = fa(t, e.inHover);
  t instanceof st ? (e.lastDrawType !== hd && (l = !0, e.lastDrawType = hd), fd(r, t, u, l, e), (!f || !e.batchFill && !e.batchStroke) && r.beginPath(), WT(r, t, h, f), f && (e.batchFill = h.fill || "", e.batchStroke = h.stroke || "")) : t instanceof Fo ? (e.lastDrawType !== vd && (l = !0, e.lastDrawType = vd), fd(r, t, u, l, e), YT(r, t, h)) : t instanceof gr ? (e.lastDrawType !== cd && (l = !0, e.lastDrawType = cd), XT(r, t, u, l, e), UT(r, t, h)) : t.getTemporalDisplayables && (e.lastDrawType !== dd && (l = !0, e.lastDrawType = dd), jT(r, t, e)), f && i && Wt(r, e), t.innerAfterBrush(), t.afterBrush && t.afterBrush(), e.prevEl = t, t.__dirty = 0, t.__isRendered = !0;
}
function jT(r, t, e) {
  var i = t.getDisplayables(), n = t.getTemporalDisplayables();
  r.save();
  var a = {
    prevElClipPaths: null,
    prevEl: null,
    allClipped: !1,
    viewWidth: e.viewWidth,
    viewHeight: e.viewHeight,
    inHover: e.inHover
  }, o, s;
  for (o = t.getCursor(), s = i.length; o < s; o++) {
    var l = i[o];
    l.beforeBrush && l.beforeBrush(), l.innerBeforeBrush(), Wr(r, l, a, o === s - 1), l.innerAfterBrush(), l.afterBrush && l.afterBrush(), a.prevEl = l;
  }
  for (var u = 0, f = n.length; u < f; u++) {
    var l = n[u];
    l.beforeBrush && l.beforeBrush(), l.innerBeforeBrush(), Wr(r, l, a, u === f - 1), l.innerAfterBrush(), l.afterBrush && l.afterBrush(), a.prevEl = l;
  }
  t.clearTemporalDisplayables(), t.notClear = !0, r.restore();
}
var kl = new PT(), pd = new pa(100), gd = ["symbol", "symbolSize", "symbolKeepAspect", "color", "backgroundColor", "dashArrayX", "dashArrayY", "maxTileWidth", "maxTileHeight"];
function ju(r, t) {
  if (r === "none")
    return null;
  var e = t.getDevicePixelRatio(), i = t.getZr(), n = i.painter.type === "svg";
  r.dirty && kl.delete(r);
  var a = kl.get(r);
  if (a)
    return a;
  var o = ot(r, {
    symbol: "rect",
    symbolSize: 1,
    symbolKeepAspect: !0,
    color: "rgba(0, 0, 0, 0.2)",
    backgroundColor: null,
    dashArrayX: 5,
    dashArrayY: 5,
    rotation: 0,
    maxTileWidth: 512,
    maxTileHeight: 512
  });
  o.backgroundColor === "none" && (o.backgroundColor = null);
  var s = {
    repeat: "repeat"
  };
  return l(s), s.rotation = o.rotation, s.scaleX = s.scaleY = n ? 1 : 1 / e, kl.set(r, s), r.dirty = !1, s;
  function l(u) {
    for (var f = [e], h = !0, v = 0; v < gd.length; ++v) {
      var c = o[gd[v]];
      if (c != null && !N(c) && !z(c) && !vt(c) && typeof c != "boolean") {
        h = !1;
        break;
      }
      f.push(c);
    }
    var d;
    if (h) {
      d = f.join(",") + (n ? "-svg" : "");
      var y = pd.get(d);
      y && (n ? u.svgElement = y : u.image = y);
    }
    var p = sm(o.dashArrayX), g = QT(o.dashArrayY), m = om(o.symbol), _ = JT(p), S = lm(g), w = !n && Xi.createCanvas(), b = n && {
      tag: "g",
      attrs: {},
      key: "dcl",
      children: []
    }, x = T(), D;
    w && (w.width = x.width * e, w.height = x.height * e, D = w.getContext("2d")), C(), h && pd.put(d, w || b), u.image = w, u.svgElement = b, u.svgWidth = x.width, u.svgHeight = x.height;
    function T() {
      for (var M = 1, L = 0, P = _.length; L < P; ++L)
        M = Lc(M, _[L]);
      for (var I = 1, L = 0, P = m.length; L < P; ++L)
        I = Lc(I, m[L].length);
      M *= I;
      var E = S * _.length * m.length;
      return {
        width: Math.max(1, Math.min(M, o.maxTileWidth)),
        height: Math.max(1, Math.min(E, o.maxTileHeight))
      };
    }
    function C() {
      D && (D.clearRect(0, 0, w.width, w.height), o.backgroundColor && (D.fillStyle = o.backgroundColor, D.fillRect(0, 0, w.width, w.height)));
      for (var M = 0, L = 0; L < g.length; ++L)
        M += g[L];
      if (M <= 0)
        return;
      for (var P = -S, I = 0, E = 0, R = 0; P < x.height; ) {
        if (I % 2 === 0) {
          for (var V = E / 2 % m.length, B = 0, F = 0, $ = 0; B < x.width * 2; ) {
            for (var J = 0, L = 0; L < p[R].length; ++L)
              J += p[R][L];
            if (J <= 0)
              break;
            if (F % 2 === 0) {
              var j = (1 - o.symbolSize) * 0.5, lt = B + p[R][F] * j, ft = P + g[I] * j, ct = p[R][F] * o.symbolSize, Nt = g[I] * o.symbolSize, Bt = $ / 2 % m[V].length;
              _t(lt, ft, ct, Nt, m[V][Bt]);
            }
            B += p[R][F], ++$, ++F, F === p[R].length && (F = 0);
          }
          ++R, R === p.length && (R = 0);
        }
        P += g[I], ++E, ++I, I === g.length && (I = 0);
      }
      function _t(St, nt, Y, q, ke) {
        var Ct = n ? 1 : e, ba = ii(ke, St * Ct, nt * Ct, Y * Ct, q * Ct, o.color, o.symbolKeepAspect);
        if (n) {
          var Oh = i.painter.renderOneToVNode(ba);
          Oh && b.children.push(Oh);
        } else
          am(D, ba);
      }
    }
  }
}
function om(r) {
  if (!r || r.length === 0)
    return [["rect"]];
  if (z(r))
    return [[r]];
  for (var t = !0, e = 0; e < r.length; ++e)
    if (!z(r[e])) {
      t = !1;
      break;
    }
  if (t)
    return om([r]);
  for (var i = [], e = 0; e < r.length; ++e)
    z(r[e]) ? i.push([r[e]]) : i.push(r[e]);
  return i;
}
function sm(r) {
  if (!r || r.length === 0)
    return [[0, 0]];
  if (vt(r)) {
    var t = Math.ceil(r);
    return [[t, t]];
  }
  for (var e = !0, i = 0; i < r.length; ++i)
    if (!vt(r[i])) {
      e = !1;
      break;
    }
  if (e)
    return sm([r]);
  for (var n = [], i = 0; i < r.length; ++i)
    if (vt(r[i])) {
      var t = Math.ceil(r[i]);
      n.push([t, t]);
    } else {
      var t = H(r[i], function(s) {
        return Math.ceil(s);
      });
      t.length % 2 === 1 ? n.push(t.concat(t)) : n.push(t);
    }
  return n;
}
function QT(r) {
  if (!r || typeof r == "object" && r.length === 0)
    return [0, 0];
  if (vt(r)) {
    var t = Math.ceil(r);
    return [t, t];
  }
  var e = H(r, function(i) {
    return Math.ceil(i);
  });
  return r.length % 2 ? e.concat(e) : e;
}
function JT(r) {
  return H(r, function(t) {
    return lm(t);
  });
}
function lm(r) {
  for (var t = 0, e = 0; e < r.length; ++e)
    t += r[e];
  return r.length % 2 === 1 ? t * 2 : t;
}
function tC(r, t) {
  r.eachRawSeries(function(e) {
    if (!r.isSeriesFiltered(e)) {
      var i = e.getData();
      i.hasItemVisual() && i.each(function(o) {
        var s = i.getItemVisual(o, "decal");
        if (s) {
          var l = i.ensureUniqueItemVisual(o, "style");
          l.decal = ju(s, t);
        }
      });
      var n = i.getVisual("decal");
      if (n) {
        var a = i.getVisual("style");
        a.decal = ju(n, t);
      }
    }
  });
}
var ge = new Ie(), um = {};
function eC(r, t) {
  um[r] = t;
}
function rC(r) {
  return um[r];
}
var iC = 1, nC = 800, aC = 900, oC = 1e3, sC = 2e3, lC = 5e3, fm = 1e3, uC = 1100, yh = 2e3, hm = 3e3, fC = 4e3, Is = 4500, hC = 4600, cC = 5e3, vC = 6e3, cm = 7e3, dC = {
  PROCESSOR: {
    FILTER: oC,
    SERIES_FILTER: nC,
    STATISTIC: lC
  },
  VISUAL: {
    LAYOUT: fm,
    PROGRESSIVE_LAYOUT: uC,
    GLOBAL: yh,
    CHART: hm,
    POST_CHART_LAYOUT: hC,
    COMPONENT: fC,
    BRUSH: cC,
    CHART_ITEM: Is,
    ARIA: vC,
    DECAL: cm
  }
}, It = "__flagInMainProcess", zt = "__pendingUpdate", Ol = "__needsUpdateStatus", yd = /^[a-zA-Z0-9_]+$/, Nl = "__connectUpdateStatus", md = 0, pC = 1, gC = 2;
function vm(r) {
  return function() {
    for (var t = [], e = 0; e < arguments.length; e++)
      t[e] = arguments[e];
    if (this.isDisposed()) {
      this.id;
      return;
    }
    return pm(this, r, t);
  };
}
function dm(r) {
  return function() {
    for (var t = [], e = 0; e < arguments.length; e++)
      t[e] = arguments[e];
    return pm(this, r, t);
  };
}
function pm(r, t, e) {
  return e[0] = e[0] && e[0].toLowerCase(), Ie.prototype[t].apply(r, e);
}
var gm = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      return r !== null && r.apply(this, arguments) || this;
    }
    return t;
  })(Ie)
), ym = gm.prototype;
ym.on = dm("on");
ym.off = dm("off");
var _i, Bl, Ka, je, Fl, zl, Hl, dn, pn, _d, Sd, $l, bd, ja, wd, mm, Jt, xd, _m = (
  /** @class */
  (function(r) {
    O(t, r);
    function t(e, i, n) {
      var a = r.call(this, new xT()) || this;
      a._chartsViews = [], a._chartsMap = {}, a._componentsViews = [], a._componentsMap = {}, a._pendingActions = [], n = n || {}, z(i) && (i = Sm[i]), a._dom = e;
      var o = "canvas", s = "auto", l = !1;
      n.ssr;
      var u = a._zr = Mc(e, {
        renderer: n.renderer || o,
        devicePixelRatio: n.devicePixelRatio,
        width: n.width,
        height: n.height,
        ssr: n.ssr,
        useDirtyRect: X(n.useDirtyRect, l),
        useCoarsePointer: X(n.useCoarsePointer, s),
        pointerSize: n.pointerSize
      });
      a._ssr = n.ssr, a._throttledZrFlush = Xy(dt(u.flush, u), 17), i = K(i), i && Ay(i, !0), a._theme = i, a._locale = Pw(n.locale || sy), a._coordSysMgr = new fh();
      var f = a._api = wd(a);
      function h(v, c) {
        return v.__prio - c.__prio;
      }
      return vo(jo, h), vo(Qu, h), a._scheduler = new jy(a, f, Qu, jo), a._messageCenter = new gm(), a._initEvents(), a.resize = dt(a.resize, a), u.animation.on("frame", a._onframe, a), _d(u, a), Sd(u, a), vu(a), a;
    }
    return t.prototype._onframe = function() {
      if (!this._disposed) {
        xd(this);
        var e = this._scheduler;
        if (this[zt]) {
          var i = this[zt].silent;
          this[It] = !0;
          try {
            _i(this), je.update.call(this, null, this[zt].updateParams);
          } catch (l) {
            throw this[It] = !1, this[zt] = null, l;
          }
          this._zr.flush(), this[It] = !1, this[zt] = null, dn.call(this, i), pn.call(this, i);
        } else if (e.unfinished) {
          var n = iC, a = this._model, o = this._api;
          e.unfinished = !1;
          do {
            var s = +/* @__PURE__ */ new Date();
            e.performSeriesTasks(a), e.performDataProcessorTasks(a), zl(this, a), e.performVisualTasks(a), ja(this, this._model, o, "remain", {}), n -= +/* @__PURE__ */ new Date() - s;
          } while (n > 0 && e.unfinished);
          e.unfinished || this._zr.flush();
        }
      }
    }, t.prototype.getDom = function() {
      return this._dom;
    }, t.prototype.getId = function() {
      return this.id;
    }, t.prototype.getZr = function() {
      return this._zr;
    }, t.prototype.isSSR = function() {
      return this._ssr;
    }, t.prototype.setOption = function(e, i, n) {
      if (!this[It]) {
        if (this._disposed) {
          this.id;
          return;
        }
        var a, o, s;
        if (W(i) && (n = i.lazyUpdate, a = i.silent, o = i.replaceMerge, s = i.transition, i = i.notMerge), this[It] = !0, !this._model || i) {
          var l = new ix(this._api), u = this._theme, f = this._model = new uh();
          f.scheduler = this._scheduler, f.ssr = this._ssr, f.init(null, null, null, u, this._locale, l);
        }
        this._model.setOption(e, {
          replaceMerge: o
        }, Ju);
        var h = {
          seriesTransition: s,
          optionChanged: !0
        };
        if (n)
          this[zt] = {
            silent: a,
            updateParams: h
          }, this[It] = !1, this.getZr().wakeUp();
        else {
          try {
            _i(this), je.update.call(this, null, h);
          } catch (v) {
            throw this[zt] = null, this[It] = !1, v;
          }
          this._ssr || this._zr.flush(), this[zt] = null, this[It] = !1, dn.call(this, a), pn.call(this, a);
        }
      }
    }, t.prototype.setTheme = function() {
    }, t.prototype.getModel = function() {
      return this._model;
    }, t.prototype.getOption = function() {
      return this._model && this._model.getOption();
    }, t.prototype.getWidth = function() {
      return this._zr.getWidth();
    }, t.prototype.getHeight = function() {
      return this._zr.getHeight();
    }, t.prototype.getDevicePixelRatio = function() {
      return this._zr.painter.dpr || U.hasGlobalWindow && window.devicePixelRatio || 1;
    }, t.prototype.getRenderedCanvas = function(e) {
      return this.renderToCanvas(e);
    }, t.prototype.renderToCanvas = function(e) {
      e = e || {};
      var i = this._zr.painter;
      return i.getRenderedCanvas({
        backgroundColor: e.backgroundColor || this._model.get("backgroundColor"),
        pixelRatio: e.pixelRatio || this.getDevicePixelRatio()
      });
    }, t.prototype.renderToSVGString = function(e) {
      e = e || {};
      var i = this._zr.painter;
      return i.renderToString({
        useViewBox: e.useViewBox
      });
    }, t.prototype.getSvgDataURL = function() {
      if (U.svgSupported) {
        var e = this._zr, i = e.storage.getDisplayList();
        return A(i, function(n) {
          n.stopAnimation(null, !0);
        }), e.painter.toDataURL();
      }
    }, t.prototype.getDataURL = function(e) {
      if (this._disposed) {
        this.id;
        return;
      }
      e = e || {};
      var i = e.excludeComponents, n = this._model, a = [], o = this;
      A(i, function(l) {
        n.eachComponent({
          mainType: l
        }, function(u) {
          var f = o._componentsMap[u.__viewId];
          f.group.ignore || (a.push(f), f.group.ignore = !0);
        });
      });
      var s = this._zr.painter.getType() === "svg" ? this.getSvgDataURL() : this.renderToCanvas(e).toDataURL("image/" + (e && e.type || "png"));
      return A(a, function(l) {
        l.group.ignore = !1;
      }), s;
    }, t.prototype.getConnectedDataURL = function(e) {
      if (this._disposed) {
        this.id;
        return;
      }
      var i = e.type === "svg", n = this.group, a = Math.min, o = Math.max, s = 1 / 0;
      if (Td[n]) {
        var l = s, u = s, f = -s, h = -s, v = [], c = e && e.pixelRatio || this.getDevicePixelRatio();
        A(Yn, function(_, S) {
          if (_.group === n) {
            var w = i ? _.getZr().painter.getSvgDom().innerHTML : _.renderToCanvas(K(e)), b = _.getDom().getBoundingClientRect();
            l = a(b.left, l), u = a(b.top, u), f = o(b.right, f), h = o(b.bottom, h), v.push({
              dom: w,
              left: b.left,
              top: b.top
            });
          }
        }), l *= c, u *= c, f *= c, h *= c;
        var d = f - l, y = h - u, p = Xi.createCanvas(), g = Mc(p, {
          renderer: i ? "svg" : "canvas"
        });
        if (g.resize({
          width: d,
          height: y
        }), i) {
          var m = "";
          return A(v, function(_) {
            var S = _.left - l, w = _.top - u;
            m += '<g transform="translate(' + S + "," + w + ')">' + _.dom + "</g>";
          }), g.painter.getSvgRoot().innerHTML = m, e.connectedBackgroundColor && g.painter.setBackgroundColor(e.connectedBackgroundColor), g.refreshImmediately(), g.painter.toDataURL();
        } else
          return e.connectedBackgroundColor && g.add(new Lt({
            shape: {
              x: 0,
              y: 0,
              width: d,
              height: y
            },
            style: {
              fill: e.connectedBackgroundColor
            }
          })), A(v, function(_) {
            var S = new gr({
              style: {
                x: _.left * c - l,
                y: _.top * c - u,
                image: _.dom
              }
            });
            g.add(S);
          }), g.refreshImmediately(), p.toDataURL("image/" + (e && e.type || "png"));
      } else
        return this.getDataURL(e);
    }, t.prototype.convertToPixel = function(e, i) {
      return Fl(this, "convertToPixel", e, i);
    }, t.prototype.convertFromPixel = function(e, i) {
      return Fl(this, "convertFromPixel", e, i);
    }, t.prototype.containPixel = function(e, i) {
      if (this._disposed) {
        this.id;
        return;
      }
      var n = this._model, a, o = sl(n, e);
      return A(o, function(s, l) {
        l.indexOf("Models") >= 0 && A(s, function(u) {
          var f = u.coordinateSystem;
          if (f && f.containPoint)
            a = a || !!f.containPoint(i);
          else if (l === "seriesModels") {
            var h = this._chartsMap[u.__viewId];
            h && h.containPoint && (a = a || h.containPoint(i, u));
          }
        }, this);
      }, this), !!a;
    }, t.prototype.getVisual = function(e, i) {
      var n = this._model, a = sl(n, e, {
        defaultMainType: "series"
      }), o = a.seriesModel, s = o.getData(), l = a.hasOwnProperty("dataIndexInside") ? a.dataIndexInside : a.hasOwnProperty("dataIndex") ? s.indexOfRawIndex(a.dataIndex) : null;
      return l != null ? MT(s, l, i) : ph(s, i);
    }, t.prototype.getViewOfComponentModel = function(e) {
      return this._componentsMap[e.__viewId];
    }, t.prototype.getViewOfSeriesModel = function(e) {
      return this._chartsMap[e.__viewId];
    }, t.prototype._initEvents = function() {
      var e = this;
      A(yC, function(i) {
        var n = function(a) {
          var o = e.getModel(), s = a.target, l, u = i === "globalout";
          if (u ? l = {} : s && Pn(s, function(d) {
            var y = et(d);
            if (y && y.dataIndex != null) {
              var p = y.dataModel || o.getSeriesByIndex(y.seriesIndex);
              return l = p && p.getDataParams(y.dataIndex, y.dataType, s) || {}, !0;
            } else if (y.eventData)
              return l = k({}, y.eventData), !0;
          }, !0), l) {
            var f = l.componentType, h = l.componentIndex;
            (f === "markLine" || f === "markPoint" || f === "markArea") && (f = "series", h = l.seriesIndex);
            var v = f && h != null && o.getComponent(f, h), c = v && e[v.mainType === "series" ? "_chartsMap" : "_componentsMap"][v.__viewId];
            l.event = a, l.type = i, e._$eventProcessor.eventInfo = {
              targetEl: s,
              packedEvent: l,
              model: v,
              view: c
            }, e.trigger(i, l);
          }
        };
        n.zrEventfulCallAtLast = !0, e._zr.on(i, n, e);
      }), A(Un, function(i, n) {
        e._messageCenter.on(n, function(a) {
          this.trigger(n, a);
        }, e);
      }), A(["selectchanged"], function(i) {
        e._messageCenter.on(i, function(n) {
          this.trigger(i, n);
        }, e);
      }), DT(this._messageCenter, this, this._api);
    }, t.prototype.isDisposed = function() {
      return this._disposed;
    }, t.prototype.clear = function() {
      if (this._disposed) {
        this.id;
        return;
      }
      this.setOption({
        series: []
      }, !0);
    }, t.prototype.dispose = function() {
      if (this._disposed) {
        this.id;
        return;
      }
      this._disposed = !0;
      var e = this.getDom();
      e && Cg(this.getDom(), _h, "");
      var i = this, n = i._api, a = i._model;
      A(i._componentsViews, function(o) {
        o.dispose(a, n);
      }), A(i._chartsViews, function(o) {
        o.dispose(a, n);
      }), i._zr.dispose(), i._dom = i._model = i._chartsMap = i._componentsMap = i._chartsViews = i._componentsViews = i._scheduler = i._api = i._zr = i._throttledZrFlush = i._theme = i._coordSysMgr = i._messageCenter = null, delete Yn[i.id];
    }, t.prototype.resize = function(e) {
      if (!this[It]) {
        if (this._disposed) {
          this.id;
          return;
        }
        this._zr.resize(e);
        var i = this._model;
        if (this._loadingFX && this._loadingFX.resize(), !!i) {
          var n = i.resetOption("media"), a = e && e.silent;
          this[zt] && (a == null && (a = this[zt].silent), n = !0, this[zt] = null), this[It] = !0;
          try {
            n && _i(this), je.update.call(this, {
              type: "resize",
              animation: k({
                // Disable animation
                duration: 0
              }, e && e.animation)
            });
          } catch (o) {
            throw this[It] = !1, o;
          }
          this[It] = !1, dn.call(this, a), pn.call(this, a);
        }
      }
    }, t.prototype.showLoading = function(e, i) {
      if (this._disposed) {
        this.id;
        return;
      }
      if (W(e) && (i = e, e = ""), e = e || "default", this.hideLoading(), !!tf[e]) {
        var n = tf[e](this._api, i), a = this._zr;
        this._loadingFX = n, a.add(n);
      }
    }, t.prototype.hideLoading = function() {
      if (this._disposed) {
        this.id;
        return;
      }
      this._loadingFX && this._zr.remove(this._loadingFX), this._loadingFX = null;
    }, t.prototype.makeActionFromEvent = function(e) {
      var i = k({}, e);
      return i.type = Un[e.type], i;
    }, t.prototype.dispatchAction = function(e, i) {
      if (this._disposed) {
        this.id;
        return;
      }
      if (W(i) || (i = {
        silent: !!i
      }), !!Ko[e.type] && this._model) {
        if (this[It]) {
          this._pendingActions.push(e);
          return;
        }
        var n = i.silent;
        Hl.call(this, e, n);
        var a = i.flush;
        a ? this._zr.flush() : a !== !1 && U.browser.weChat && this._throttledZrFlush(), dn.call(this, n), pn.call(this, n);
      }
    }, t.prototype.updateLabelLayout = function() {
      ge.trigger("series:layoutlabels", this._model, this._api, {
        // Not adding series labels.
        // TODO
        updatedSeries: []
      });
    }, t.prototype.appendData = function(e) {
      if (this._disposed) {
        this.id;
        return;
      }
      var i = e.seriesIndex, n = this.getModel(), a = n.getSeriesByIndex(i);
      a.appendData(e), this._scheduler.unfinished = !0, this.getZr().wakeUp();
    }, t.internalField = (function() {
      _i = function(h) {
        var v = h._scheduler;
        v.restorePipelines(h._model), v.prepareStageTasks(), Bl(h, !0), Bl(h, !1), v.plan();
      }, Bl = function(h, v) {
        for (var c = h._model, d = h._scheduler, y = v ? h._componentsViews : h._chartsViews, p = v ? h._componentsMap : h._chartsMap, g = h._zr, m = h._api, _ = 0; _ < y.length; _++)
          y[_].__alive = !1;
        v ? c.eachComponent(function(b, x) {
          b !== "series" && S(x);
        }) : c.eachSeries(S);
        function S(b) {
          var x = b.__requireNewView;
          b.__requireNewView = !1;
          var D = "_ec_" + b.id + "_" + b.type, T = !x && p[D];
          if (!T) {
            var C = Ae(b.type), M = v ? me.getClass(C.main, C.sub) : (
              // FIXME:TS
              // (ChartView as ChartViewConstructor).getClass('series', classType.sub)
              // For backward compat, still support a chart type declared as only subType
              // like "liquidfill", but recommend "series.liquidfill"
              // But need a base class to make a type series.
              Pe.getClass(C.sub)
            );
            T = new M(), T.init(c, m), p[D] = T, y.push(T), g.add(T.group);
          }
          b.__viewId = T.__id = D, T.__alive = !0, T.__model = b, T.group.__ecComponentInfo = {
            mainType: b.mainType,
            index: b.componentIndex
          }, !v && d.prepareView(T, b, c, m);
        }
        for (var _ = 0; _ < y.length; ) {
          var w = y[_];
          w.__alive ? _++ : (!v && w.renderTask.dispose(), g.remove(w.group), w.dispose(c, m), y.splice(_, 1), p[w.__id] === w && delete p[w.__id], w.__id = w.group.__ecComponentInfo = null);
        }
      }, Ka = function(h, v, c, d, y) {
        var p = h._model;
        if (p.setUpdatePayload(c), !d) {
          A([].concat(h._componentsViews).concat(h._chartsViews), w);
          return;
        }
        var g = {};
        g[d + "Id"] = c[d + "Id"], g[d + "Index"] = c[d + "Index"], g[d + "Name"] = c[d + "Name"];
        var m = {
          mainType: d,
          query: g
        };
        y && (m.subType = y);
        var _ = c.excludeSeriesId, S;
        _ != null && (S = Z(), A(Ot(_), function(b) {
          var x = Le(b, null);
          x != null && S.set(x, !0);
        })), p && p.eachComponent(m, function(b) {
          var x = S && S.get(b.id) != null;
          if (!x)
            if (nv(c))
              if (b instanceof dr)
                c.type === Xr && !c.notBlur && !b.get(["emphasis", "disabled"]) && hb(b, c, h._api);
              else {
                var D = Xf(b.mainType, b.componentIndex, c.name, h._api), T = D.focusSelf, C = D.dispatchers;
                c.type === Xr && T && !c.notBlur && ku(b.mainType, b.componentIndex, h._api), C && A(C, function(M) {
                  c.type === Xr ? ia(M) : na(M);
                });
              }
            else Bu(c) && b instanceof dr && (db(b, c, h._api), ev(b), Jt(h));
        }, h), p && p.eachComponent(m, function(b) {
          var x = S && S.get(b.id) != null;
          x || w(h[d === "series" ? "_chartsMap" : "_componentsMap"][b.__viewId]);
        }, h);
        function w(b) {
          b && b.__alive && b[v] && b[v](b.__model, p, h._api, c);
        }
      }, je = {
        prepareAndUpdate: function(h) {
          _i(this), je.update.call(this, h, {
            // Needs to mark option changed if newOption is given.
            // It's from MagicType.
            // TODO If use a separate flag optionChanged in payload?
            optionChanged: h.newOption != null
          });
        },
        update: function(h, v) {
          var c = this._model, d = this._api, y = this._zr, p = this._coordSysMgr, g = this._scheduler;
          if (c) {
            c.setUpdatePayload(h), g.restoreData(c, h), g.performSeriesTasks(c), p.create(c, d), g.performDataProcessorTasks(c, h), zl(this, c), p.update(c, d), e(c), g.performVisualTasks(c, h), $l(this, c, d, h, v);
            var m = c.get("backgroundColor") || "transparent", _ = c.get("darkMode");
            y.setBackgroundColor(m), _ != null && _ !== "auto" && y.setDarkMode(_), ge.trigger("afterupdate", c, d);
          }
        },
        updateTransform: function(h) {
          var v = this, c = this._model, d = this._api;
          if (c) {
            c.setUpdatePayload(h);
            var y = [];
            c.eachComponent(function(g, m) {
              if (g !== "series") {
                var _ = v.getViewOfComponentModel(m);
                if (_ && _.__alive)
                  if (_.updateTransform) {
                    var S = _.updateTransform(m, c, d, h);
                    S && S.update && y.push(_);
                  } else
                    y.push(_);
              }
            });
            var p = Z();
            c.eachSeries(function(g) {
              var m = v._chartsMap[g.__viewId];
              if (m.updateTransform) {
                var _ = m.updateTransform(g, c, d, h);
                _ && _.update && p.set(g.uid, 1);
              } else
                p.set(g.uid, 1);
            }), e(c), this._scheduler.performVisualTasks(c, h, {
              setDirty: !0,
              dirtyMap: p
            }), ja(this, c, d, h, {}, p), ge.trigger("afterupdate", c, d);
          }
        },
        updateView: function(h) {
          var v = this._model;
          v && (v.setUpdatePayload(h), Pe.markUpdateMethod(h, "updateView"), e(v), this._scheduler.performVisualTasks(v, h, {
            setDirty: !0
          }), $l(this, v, this._api, h, {}), ge.trigger("afterupdate", v, this._api));
        },
        updateVisual: function(h) {
          var v = this, c = this._model;
          c && (c.setUpdatePayload(h), c.eachSeries(function(d) {
            d.getData().clearAllVisual();
          }), Pe.markUpdateMethod(h, "updateVisual"), e(c), this._scheduler.performVisualTasks(c, h, {
            visualType: "visual",
            setDirty: !0
          }), c.eachComponent(function(d, y) {
            if (d !== "series") {
              var p = v.getViewOfComponentModel(y);
              p && p.__alive && p.updateVisual(y, c, v._api, h);
            }
          }), c.eachSeries(function(d) {
            var y = v._chartsMap[d.__viewId];
            y.updateVisual(d, c, v._api, h);
          }), ge.trigger("afterupdate", c, this._api));
        },
        updateLayout: function(h) {
          je.update.call(this, h);
        }
      }, Fl = function(h, v, c, d) {
        if (h._disposed) {
          h.id;
          return;
        }
        for (var y = h._model, p = h._coordSysMgr.getCoordinateSystems(), g, m = sl(y, c), _ = 0; _ < p.length; _++) {
          var S = p[_];
          if (S[v] && (g = S[v](y, m, d)) != null)
            return g;
        }
      }, zl = function(h, v) {
        var c = h._chartsMap, d = h._scheduler;
        v.eachSeries(function(y) {
          d.updateStreamModes(y, c[y.__viewId]);
        });
      }, Hl = function(h, v) {
        var c = this, d = this.getModel(), y = h.type, p = h.escapeConnect, g = Ko[y], m = g.actionInfo, _ = (m.update || "update").split(":"), S = _.pop(), w = _[0] != null && Ae(_[0]);
        this[It] = !0;
        var b = [h], x = !1;
        h.batch && (x = !0, b = H(h.batch, function(I) {
          return I = ot(k({}, I), h), I.batch = null, I;
        }));
        var D = [], T, C = Bu(h), M = nv(h);
        if (M && Wg(this._api), A(b, function(I) {
          if (T = g.action(I, c._model, c._api), T = T || k({}, I), T.type = m.event || T.type, D.push(T), M) {
            var E = $f(h), R = E.queryOptionMap, V = E.mainTypeSpecified, B = V ? R.keys()[0] : "series";
            Ka(c, S, I, B), Jt(c);
          } else C ? (Ka(c, S, I, "series"), Jt(c)) : w && Ka(c, S, I, w.main, w.sub);
        }), S !== "none" && !M && !C && !w)
          try {
            this[zt] ? (_i(this), je.update.call(this, h), this[zt] = null) : je[S].call(this, h);
          } catch (I) {
            throw this[It] = !1, I;
          }
        if (x ? T = {
          type: m.event || y,
          escapeConnect: p,
          batch: D
        } : T = D[0], this[It] = !1, !v) {
          var L = this._messageCenter;
          if (L.trigger(T.type, T), C) {
            var P = {
              type: "selectchanged",
              escapeConnect: p,
              selected: pb(d),
              isFromClick: h.isFromClick || !1,
              fromAction: h.type,
              fromActionPayload: h
            };
            L.trigger(P.type, P);
          }
        }
      }, dn = function(h) {
        for (var v = this._pendingActions; v.length; ) {
          var c = v.shift();
          Hl.call(this, c, h);
        }
      }, pn = function(h) {
        !h && this.trigger("updated");
      }, _d = function(h, v) {
        h.on("rendered", function(c) {
          v.trigger("rendered", c), // Although zr is dirty if initial animation is not finished
          // and this checking is called on frame, we also check
          // animation finished for robustness.
          h.animation.isFinished() && !v[zt] && !v._scheduler.unfinished && !v._pendingActions.length && v.trigger("finished");
        });
      }, Sd = function(h, v) {
        h.on("mouseover", function(c) {
          var d = c.target, y = Pn(d, Nu);
          y && (cb(y, c, v._api), Jt(v));
        }).on("mouseout", function(c) {
          var d = c.target, y = Pn(d, Nu);
          y && (vb(y, c, v._api), Jt(v));
        }).on("click", function(c) {
          var d = c.target, y = Pn(d, function(m) {
            return et(m).dataIndex != null;
          }, !0);
          if (y) {
            var p = y.selected ? "unselect" : "select", g = et(y);
            v._api.dispatchAction({
              type: p,
              dataType: g.dataType,
              dataIndexInside: g.dataIndex,
              seriesIndex: g.seriesIndex,
              isFromClick: !0
            });
          }
        });
      };
      function e(h) {
        h.clearColorPalette(), h.eachSeries(function(v) {
          v.clearColorPalette();
        });
      }
      function i(h) {
        var v = [], c = [], d = !1;
        if (h.eachComponent(function(m, _) {
          var S = _.get("zlevel") || 0, w = _.get("z") || 0, b = _.getZLevelKey();
          d = d || !!b, (m === "series" ? c : v).push({
            zlevel: S,
            z: w,
            idx: _.componentIndex,
            type: m,
            key: b
          });
        }), d) {
          var y = v.concat(c), p, g;
          vo(y, function(m, _) {
            return m.zlevel === _.zlevel ? m.z - _.z : m.zlevel - _.zlevel;
          }), A(y, function(m) {
            var _ = h.getComponent(m.type, m.idx), S = m.zlevel, w = m.key;
            p != null && (S = Math.max(p, S)), w ? (S === p && w !== g && S++, g = w) : g && (S === p && S++, g = ""), p = S, _.setZLevel(S);
          });
        }
      }
      $l = function(h, v, c, d, y) {
        i(v), bd(h, v, c, d, y), A(h._chartsViews, function(p) {
          p.__alive = !1;
        }), ja(h, v, c, d, y), A(h._chartsViews, function(p) {
          p.__alive || p.remove(v, c);
        });
      }, bd = function(h, v, c, d, y, p) {
        A(p || h._componentsViews, function(g) {
          var m = g.__model;
          u(m, g), g.render(m, v, c, d), s(m, g), f(m, g);
        });
      }, ja = function(h, v, c, d, y, p) {
        var g = h._scheduler;
        y = k(y || {}, {
          updatedSeries: v.getSeries()
        }), ge.trigger("series:beforeupdate", v, c, y);
        var m = !1;
        v.eachSeries(function(_) {
          var S = h._chartsMap[_.__viewId];
          S.__alive = !0;
          var w = S.renderTask;
          g.updatePayload(w, d), u(_, S), p && p.get(_.uid) && w.dirty(), w.perform(g.getPerformArgs(w)) && (m = !0), S.group.silent = !!_.get("silent"), o(_, S), ev(_);
        }), g.unfinished = m || g.unfinished, ge.trigger("series:layoutlabels", v, c, y), ge.trigger("series:transition", v, c, y), v.eachSeries(function(_) {
          var S = h._chartsMap[_.__viewId];
          s(_, S), f(_, S);
        }), a(h, v), ge.trigger("series:afterupdate", v, c, y);
      }, Jt = function(h) {
        h[Ol] = !0, h.getZr().wakeUp();
      }, xd = function(h) {
        h[Ol] && (h.getZr().storage.traverse(function(v) {
          $n(v) || n(v);
        }), h[Ol] = !1);
      };
      function n(h) {
        for (var v = [], c = h.currentStates, d = 0; d < c.length; d++) {
          var y = c[d];
          y === "emphasis" || y === "blur" || y === "select" || v.push(y);
        }
        h.selected && h.states.select && v.push("select"), h.hoverState === fs && h.states.emphasis ? v.push("emphasis") : h.hoverState === us && h.states.blur && v.push("blur"), h.useStates(v);
      }
      function a(h, v) {
        var c = h._zr, d = c.storage, y = 0;
        d.traverse(function(p) {
          p.isGroup || y++;
        }), y > v.get("hoverLayerThreshold") && !U.node && !U.worker && v.eachSeries(function(p) {
          if (!p.preventUsingHoverLayer) {
            var g = h._chartsMap[p.__viewId];
            g.__alive && g.eachRendered(function(m) {
              m.states.emphasis && (m.states.emphasis.hoverLayer = !0);
            });
          }
        });
      }
      function o(h, v) {
        var c = h.get("blendMode") || null;
        v.eachRendered(function(d) {
          d.isGroup || (d.style.blend = c);
        });
      }
      function s(h, v) {
        if (!h.preventAutoZ) {
          var c = h.get("z") || 0, d = h.get("zlevel") || 0;
          v.eachRendered(function(y) {
            return l(y, c, d, -1 / 0), !0;
          });
        }
      }
      function l(h, v, c, d) {
        var y = h.getTextContent(), p = h.getTextGuideLine(), g = h.isGroup;
        if (g)
          for (var m = h.childrenRef(), _ = 0; _ < m.length; _++)
            d = Math.max(l(m[_], v, c, d), d);
        else
          h.z = v, h.zlevel = c, d = Math.max(h.z2, d);
        if (y && (y.z = v, y.zlevel = c, isFinite(d) && (y.z2 = d + 2)), p) {
          var S = h.textGuideLineConfig;
          p.z = v, p.zlevel = c, isFinite(d) && (p.z2 = d + (S && S.showAbove ? 1 : -1));
        }
        return d;
      }
      function u(h, v) {
        v.eachRendered(function(c) {
          if (!$n(c)) {
            var d = c.getTextContent(), y = c.getTextGuideLine();
            c.stateTransition && (c.stateTransition = null), d && d.stateTransition && (d.stateTransition = null), y && y.stateTransition && (y.stateTransition = null), c.hasState() ? (c.prevStates = c.currentStates, c.clearStates()) : c.prevStates && (c.prevStates = null);
          }
        });
      }
      function f(h, v) {
        var c = h.getModel("stateAnimation"), d = h.isAnimationEnabled(), y = c.get("duration"), p = y > 0 ? {
          duration: y,
          delay: c.get("delay"),
          easing: c.get("easing")
          // additive: stateAnimationModel.get('additive')
        } : null;
        v.eachRendered(function(g) {
          if (g.states && g.states.emphasis) {
            if ($n(g))
              return;
            if (g instanceof st && Sb(g), g.__dirty) {
              var m = g.prevStates;
              m && g.useStates(m);
            }
            if (d) {
              g.stateTransition = p;
              var _ = g.getTextContent(), S = g.getTextGuideLine();
              _ && (_.stateTransition = p), S && (S.stateTransition = p);
            }
            g.__dirty && n(g);
          }
        });
      }
      wd = function(h) {
        return new /** @class */
        ((function(v) {
          O(c, v);
          function c() {
            return v !== null && v.apply(this, arguments) || this;
          }
          return c.prototype.getCoordinateSystems = function() {
            return h._coordSysMgr.getCoordinateSystems();
          }, c.prototype.getComponentByElement = function(d) {
            for (; d; ) {
              var y = d.__ecComponentInfo;
              if (y != null)
                return h._model.getComponent(y.mainType, y.index);
              d = d.parent;
            }
          }, c.prototype.enterEmphasis = function(d, y) {
            ia(d, y), Jt(h);
          }, c.prototype.leaveEmphasis = function(d, y) {
            na(d, y), Jt(h);
          }, c.prototype.enterBlur = function(d) {
            Hg(d), Jt(h);
          }, c.prototype.leaveBlur = function(d) {
            Yf(d), Jt(h);
          }, c.prototype.enterSelect = function(d) {
            $g(d), Jt(h);
          }, c.prototype.leaveSelect = function(d) {
            Vg(d), Jt(h);
          }, c.prototype.getModel = function() {
            return h.getModel();
          }, c.prototype.getViewOfComponentModel = function(d) {
            return h.getViewOfComponentModel(d);
          }, c.prototype.getViewOfSeriesModel = function(d) {
            return h.getViewOfSeriesModel(d);
          }, c;
        })(My))(h);
      }, mm = function(h) {
        function v(c, d) {
          for (var y = 0; y < c.length; y++) {
            var p = c[y];
            p[Nl] = d;
          }
        }
        A(Un, function(c, d) {
          h._messageCenter.on(d, function(y) {
            if (Td[h.group] && h[Nl] !== md) {
              if (y && y.escapeConnect)
                return;
              var p = h.makeActionFromEvent(y), g = [];
              A(Yn, function(m) {
                m !== h && m.group === h.group && g.push(m);
              }), v(g, md), A(g, function(m) {
                m[Nl] !== pC && m.dispatchAction(p);
              }), v(g, gC);
            }
          });
        });
      };
    })(), t;
  })(Ie)
), mh = _m.prototype;
mh.on = vm("on");
mh.off = vm("off");
mh.one = function(r, t, e) {
  var i = this;
  function n() {
    for (var a = [], o = 0; o < arguments.length; o++)
      a[o] = arguments[o];
    t && t.apply && t.apply(this, a), i.off(r, n);
  }
  this.on.call(this, r, n, e);
};
var yC = ["click", "dblclick", "mouseover", "mouseout", "mousemove", "mousedown", "mouseup", "globalout", "contextmenu"];
var Ko = {}, Un = {}, Qu = [], Ju = [], jo = [], Sm = {}, tf = {}, Yn = {}, Td = {}, mC = +/* @__PURE__ */ new Date() - 0, _h = "_echarts_instance_";
function _C(r, t, e) {
  {
    var i = SC(r);
    if (i)
      return i;
  }
  var n = new _m(r, t, e);
  return n.id = "ec_" + mC++, Yn[n.id] = n, Cg(r, _h, n.id), mm(n), ge.trigger("afterinit", n), n;
}
function SC(r) {
  return Yn[tS(r, _h)];
}
function bm(r, t) {
  Sm[r] = t;
}
function wm(r) {
  rt(Ju, r) < 0 && Ju.push(r);
}
function xm(r, t) {
  bh(Qu, r, t, sC);
}
function bC(r) {
  Sh("afterinit", r);
}
function wC(r) {
  Sh("afterupdate", r);
}
function Sh(r, t) {
  ge.on(r, t);
}
function Qi(r, t, e) {
  G(t) && (e = t, t = "");
  var i = W(r) ? r.type : [r, r = {
    event: t
  }][0];
  r.event = (r.event || i).toLowerCase(), t = r.event, !Un[t] && ($e(yd.test(i) && yd.test(t)), Ko[i] || (Ko[i] = {
    action: e,
    actionInfo: r
  }), Un[t] = i);
}
function xC(r, t) {
  fh.register(r, t);
}
function TC(r, t) {
  bh(jo, r, t, fm, "layout");
}
function ai(r, t) {
  bh(jo, r, t, hm, "visual");
}
var Cd = [];
function bh(r, t, e, i, n) {
  if ((G(t) || W(t)) && (e = t, t = i), !(rt(Cd, e) >= 0)) {
    Cd.push(e);
    var a = jy.wrapStageHandler(e, n);
    a.__prio = t, a.__raw = e, r.push(a);
  }
}
function Tm(r, t) {
  tf[r] = t;
}
function CC(r, t, e) {
  var i = rC("registerMap");
  i && i(r, t, e);
}
var MC = Rx;
ai(yh, uT);
ai(Is, fT);
ai(Is, hT);
ai(yh, TT);
ai(Is, CT);
ai(cm, tC);
wm(Ay);
xm(aC, px);
Tm("default", cT);
Qi({
  type: Xr,
  event: Xr,
  update: Xr
}, Ut);
Qi({
  type: So,
  event: So,
  update: So
}, Ut);
Qi({
  type: Fn,
  event: Fn,
  update: Fn
}, Ut);
Qi({
  type: bo,
  event: bo,
  update: bo
}, Ut);
Qi({
  type: zn,
  event: zn,
  update: zn
}, Ut);
bm("light", wT);
bm("dark", em);
function gn(r) {
  return r == null ? 0 : r.length || 1;
}
function Md(r) {
  return r;
}
var DC = (
  /** @class */
  (function() {
    function r(t, e, i, n, a, o) {
      this._old = t, this._new = e, this._oldKeyGetter = i || Md, this._newKeyGetter = n || Md, this.context = a, this._diffModeMultiple = o === "multiple";
    }
    return r.prototype.add = function(t) {
      return this._add = t, this;
    }, r.prototype.update = function(t) {
      return this._update = t, this;
    }, r.prototype.updateManyToOne = function(t) {
      return this._updateManyToOne = t, this;
    }, r.prototype.updateOneToMany = function(t) {
      return this._updateOneToMany = t, this;
    }, r.prototype.updateManyToMany = function(t) {
      return this._updateManyToMany = t, this;
    }, r.prototype.remove = function(t) {
      return this._remove = t, this;
    }, r.prototype.execute = function() {
      this[this._diffModeMultiple ? "_executeMultiple" : "_executeOneToOne"]();
    }, r.prototype._executeOneToOne = function() {
      var t = this._old, e = this._new, i = {}, n = new Array(t.length), a = new Array(e.length);
      this._initIndexMap(t, null, n, "_oldKeyGetter"), this._initIndexMap(e, i, a, "_newKeyGetter");
      for (var o = 0; o < t.length; o++) {
        var s = n[o], l = i[s], u = gn(l);
        if (u > 1) {
          var f = l.shift();
          l.length === 1 && (i[s] = l[0]), this._update && this._update(f, o);
        } else u === 1 ? (i[s] = null, this._update && this._update(l, o)) : this._remove && this._remove(o);
      }
      this._performRestAdd(a, i);
    }, r.prototype._executeMultiple = function() {
      var t = this._old, e = this._new, i = {}, n = {}, a = [], o = [];
      this._initIndexMap(t, i, a, "_oldKeyGetter"), this._initIndexMap(e, n, o, "_newKeyGetter");
      for (var s = 0; s < a.length; s++) {
        var l = a[s], u = i[l], f = n[l], h = gn(u), v = gn(f);
        if (h > 1 && v === 1)
          this._updateManyToOne && this._updateManyToOne(f, u), n[l] = null;
        else if (h === 1 && v > 1)
          this._updateOneToMany && this._updateOneToMany(f, u), n[l] = null;
        else if (h === 1 && v === 1)
          this._update && this._update(f, u), n[l] = null;
        else if (h > 1 && v > 1)
          this._updateManyToMany && this._updateManyToMany(f, u), n[l] = null;
        else if (h > 1)
          for (var c = 0; c < h; c++)
            this._remove && this._remove(u[c]);
        else
          this._remove && this._remove(u);
      }
      this._performRestAdd(o, n);
    }, r.prototype._performRestAdd = function(t, e) {
      for (var i = 0; i < t.length; i++) {
        var n = t[i], a = e[n], o = gn(a);
        if (o > 1)
          for (var s = 0; s < o; s++)
            this._add && this._add(a[s]);
        else o === 1 && this._add && this._add(a);
        e[n] = null;
      }
    }, r.prototype._initIndexMap = function(t, e, i, n) {
      for (var a = this._diffModeMultiple, o = 0; o < t.length; o++) {
        var s = "_ec_" + this[n](t[o], o);
        if (a || (i[o] = s), !!e) {
          var l = e[s], u = gn(l);
          u === 0 ? (e[s] = o, a && i.push(s)) : u === 1 ? e[s] = [l, o] : l.push(o);
        }
      }
    }, r;
  })()
), AC = (
  /** @class */
  (function() {
    function r(t, e) {
      this._encode = t, this._schema = e;
    }
    return r.prototype.get = function() {
      return {
        // Do not generate full dimension name until fist used.
        fullDimensions: this._getFullDimensionNames(),
        encode: this._encode
      };
    }, r.prototype._getFullDimensionNames = function() {
      return this._cachedDimNames || (this._cachedDimNames = this._schema ? this._schema.makeOutputDimensionNames() : []), this._cachedDimNames;
    }, r;
  })()
);
function LC(r, t) {
  var e = {}, i = e.encode = {}, n = Z(), a = [], o = [], s = {};
  A(r.dimensions, function(v) {
    var c = r.getDimensionInfo(v), d = c.coordDim;
    if (d) {
      var y = c.coordDimIndex;
      Vl(i, d)[y] = v, c.isExtraCoord || (n.set(d, 1), IC(c.type) && (a[0] = v), Vl(s, d)[y] = r.getDimensionIndex(c.name)), c.defaultTooltip && o.push(v);
    }
    by.each(function(p, g) {
      var m = Vl(i, g), _ = c.otherDims[g];
      _ != null && _ !== !1 && (m[_] = c.name);
    });
  });
  var l = [], u = {};
  n.each(function(v, c) {
    var d = i[c];
    u[c] = d[0], l = l.concat(d);
  }), e.dataDimsOnCoord = l, e.dataDimIndicesOnCoord = H(l, function(v) {
    return r.getDimensionInfo(v).storeDimIndex;
  }), e.encodeFirstDimNotExtra = u;
  var f = i.label;
  f && f.length && (a = f.slice());
  var h = i.tooltip;
  return h && h.length ? o = h.slice() : o.length || (o = a.slice()), i.defaultedLabel = a, i.defaultedTooltip = o, e.userOutput = new AC(s, t), e;
}
function Vl(r, t) {
  return r.hasOwnProperty(t) || (r[t] = []), r[t];
}
function PC(r) {
  return r === "category" ? "ordinal" : r === "time" ? "time" : "float";
}
function IC(r) {
  return !(r === "ordinal" || r === "time");
}
var To = (
  /** @class */
  /* @__PURE__ */ (function() {
    function r(t) {
      this.otherDims = {}, t != null && k(this, t);
    }
    return r;
  })()
), EC = mt(), RC = {
  float: "f",
  int: "i",
  ordinal: "o",
  number: "n",
  time: "t"
}, Cm = (
  /** @class */
  (function() {
    function r(t) {
      this.dimensions = t.dimensions, this._dimOmitted = t.dimensionOmitted, this.source = t.source, this._fullDimCount = t.fullDimensionCount, this._updateDimOmitted(t.dimensionOmitted);
    }
    return r.prototype.isDimensionOmitted = function() {
      return this._dimOmitted;
    }, r.prototype._updateDimOmitted = function(t) {
      this._dimOmitted = t, t && (this._dimNameMap || (this._dimNameMap = Am(this.source)));
    }, r.prototype.getSourceDimensionIndex = function(t) {
      return X(this._dimNameMap.get(t), -1);
    }, r.prototype.getSourceDimension = function(t) {
      var e = this.source.dimensionsDefine;
      if (e)
        return e[t];
    }, r.prototype.makeStoreSchema = function() {
      for (var t = this._fullDimCount, e = Iy(this.source), i = !Lm(t), n = "", a = [], o = 0, s = 0; o < t; o++) {
        var l = void 0, u = void 0, f = void 0, h = this.dimensions[s];
        if (h && h.storeDimIndex === o)
          l = e ? h.name : null, u = h.type, f = h.ordinalMeta, s++;
        else {
          var v = this.getSourceDimension(o);
          v && (l = e ? v.name : null, u = v.type);
        }
        a.push({
          property: l,
          type: u,
          ordinalMeta: f
        }), e && l != null && (!h || !h.isCalculationCoord) && (n += i ? l.replace(/\`/g, "`1").replace(/\$/g, "`2") : l), n += "$", n += RC[u] || "f", f && (n += f.uid), n += "$";
      }
      var c = this.source, d = [c.seriesLayoutBy, c.startIndex, n].join("$$");
      return {
        dimensions: a,
        hash: d
      };
    }, r.prototype.makeOutputDimensionNames = function() {
      for (var t = [], e = 0, i = 0; e < this._fullDimCount; e++) {
        var n = void 0, a = this.dimensions[i];
        if (a && a.storeDimIndex === e)
          a.isCalculationCoord || (n = a.name), i++;
        else {
          var o = this.getSourceDimension(e);
          o && (n = o.name);
        }
        t.push(n);
      }
      return t;
    }, r.prototype.appendCalculationDimension = function(t) {
      this.dimensions.push(t), t.isCalculationCoord = !0, this._fullDimCount++, this._updateDimOmitted(!0);
    }, r;
  })()
);
function Mm(r) {
  return r instanceof Cm;
}
function Dm(r) {
  for (var t = Z(), e = 0; e < (r || []).length; e++) {
    var i = r[e], n = W(i) ? i.name : i;
    n != null && t.get(n) == null && t.set(n, e);
  }
  return t;
}
function Am(r) {
  var t = EC(r);
  return t.dimNameMap || (t.dimNameMap = Dm(r.dimensionsDefine));
}
function Lm(r) {
  return r > 30;
}
var yn = W, Qe = H, kC = typeof Int32Array > "u" ? Array : Int32Array, OC = "e\0\0", Dd = -1, NC = ["hasItemOption", "_nameList", "_idList", "_invertedIndicesMap", "_dimSummary", "userOutput", "_rawData", "_dimValueGetter", "_nameDimIdx", "_idDimIdx", "_nameRepeatCount"], BC = ["_approximateExtent"], Ad, Qa, mn, _n, Gl, Sn, Wl, Xn = (
  /** @class */
  (function() {
    function r(t, e) {
      this.type = "list", this._dimOmitted = !1, this._nameList = [], this._idList = [], this._visual = {}, this._layout = {}, this._itemVisuals = [], this._itemLayouts = [], this._graphicEls = [], this._approximateExtent = {}, this._calculationInfo = {}, this.hasItemOption = !1, this.TRANSFERABLE_METHODS = ["cloneShallow", "downSample", "minmaxDownSample", "lttbDownSample", "map"], this.CHANGABLE_METHODS = ["filterSelf", "selectRange"], this.DOWNSAMPLE_METHODS = ["downSample", "minmaxDownSample", "lttbDownSample"];
      var i, n = !1;
      Mm(t) ? (i = t.dimensions, this._dimOmitted = t.isDimensionOmitted(), this._schema = t) : (n = !0, i = t), i = i || ["x", "y"];
      for (var a = {}, o = [], s = {}, l = !1, u = {}, f = 0; f < i.length; f++) {
        var h = i[f], v = z(h) ? new To({
          name: h
        }) : h instanceof To ? h : new To(h), c = v.name;
        v.type = v.type || "float", v.coordDim || (v.coordDim = c, v.coordDimIndex = 0);
        var d = v.otherDims = v.otherDims || {};
        o.push(c), a[c] = v, u[c] != null && (l = !0), v.createInvertedIndices && (s[c] = []), d.itemName === 0 && (this._nameDimIdx = f), d.itemId === 0 && (this._idDimIdx = f), n && (v.storeDimIndex = f);
      }
      if (this.dimensions = o, this._dimInfos = a, this._initGetDimensionInfo(l), this.hostModel = e, this._invertedIndicesMap = s, this._dimOmitted) {
        var y = this._dimIdxToName = Z();
        A(o, function(p) {
          y.set(a[p].storeDimIndex, p);
        });
      }
    }
    return r.prototype.getDimension = function(t) {
      var e = this._recognizeDimIndex(t);
      if (e == null)
        return t;
      if (e = t, !this._dimOmitted)
        return this.dimensions[e];
      var i = this._dimIdxToName.get(e);
      if (i != null)
        return i;
      var n = this._schema.getSourceDimension(e);
      if (n)
        return n.name;
    }, r.prototype.getDimensionIndex = function(t) {
      var e = this._recognizeDimIndex(t);
      if (e != null)
        return e;
      if (t == null)
        return -1;
      var i = this._getDimInfo(t);
      return i ? i.storeDimIndex : this._dimOmitted ? this._schema.getSourceDimensionIndex(t) : -1;
    }, r.prototype._recognizeDimIndex = function(t) {
      if (vt(t) || t != null && !isNaN(t) && !this._getDimInfo(t) && (!this._dimOmitted || this._schema.getSourceDimensionIndex(t) < 0))
        return +t;
    }, r.prototype._getStoreDimIndex = function(t) {
      var e = this.getDimensionIndex(t);
      return e;
    }, r.prototype.getDimensionInfo = function(t) {
      return this._getDimInfo(this.getDimension(t));
    }, r.prototype._initGetDimensionInfo = function(t) {
      var e = this._dimInfos;
      this._getDimInfo = t ? function(i) {
        return e.hasOwnProperty(i) ? e[i] : void 0;
      } : function(i) {
        return e[i];
      };
    }, r.prototype.getDimensionsOnCoord = function() {
      return this._dimSummary.dataDimsOnCoord.slice();
    }, r.prototype.mapDimension = function(t, e) {
      var i = this._dimSummary;
      if (e == null)
        return i.encodeFirstDimNotExtra[t];
      var n = i.encode[t];
      return n ? n[e] : null;
    }, r.prototype.mapDimensionsAll = function(t) {
      var e = this._dimSummary, i = e.encode[t];
      return (i || []).slice();
    }, r.prototype.getStore = function() {
      return this._store;
    }, r.prototype.initData = function(t, e, i) {
      var n = this, a;
      if (t instanceof Vu && (a = t), !a) {
        var o = this.dimensions, s = hh(t) || Yt(t) ? new Ey(t, o.length) : t;
        a = new Vu();
        var l = Qe(o, function(u) {
          return {
            type: n._dimInfos[u].type,
            property: u
          };
        });
        a.initData(s, l, i);
      }
      this._store = a, this._nameList = (e || []).slice(), this._idList = [], this._nameRepeatCount = {}, this._doInit(0, a.count()), this._dimSummary = LC(this, this._schema), this.userOutput = this._dimSummary.userOutput;
    }, r.prototype.appendData = function(t) {
      var e = this._store.appendData(t);
      this._doInit(e[0], e[1]);
    }, r.prototype.appendValues = function(t, e) {
      var i = this._store.appendValues(t, e && e.length), n = i.start, a = i.end, o = this._shouldMakeIdFromName();
      if (this._updateOrdinalMeta(), e)
        for (var s = n; s < a; s++) {
          var l = s - n;
          this._nameList[s] = e[l], o && Wl(this, s);
        }
    }, r.prototype._updateOrdinalMeta = function() {
      for (var t = this._store, e = this.dimensions, i = 0; i < e.length; i++) {
        var n = this._dimInfos[e[i]];
        n.ordinalMeta && t.collectOrdinalMeta(n.storeDimIndex, n.ordinalMeta);
      }
    }, r.prototype._shouldMakeIdFromName = function() {
      var t = this._store.getProvider();
      return this._idDimIdx == null && t.getSource().sourceFormat !== cr && !t.fillStorage;
    }, r.prototype._doInit = function(t, e) {
      if (!(t >= e)) {
        var i = this._store, n = i.getProvider();
        this._updateOrdinalMeta();
        var a = this._nameList, o = this._idList, s = n.getSource().sourceFormat, l = s === he;
        if (l && !n.pure)
          for (var u = [], f = t; f < e; f++) {
            var h = n.getItem(f, u);
            if (!this.hasItemOption && G1(h) && (this.hasItemOption = !0), h) {
              var v = h.name;
              a[f] == null && v != null && (a[f] = Le(v, null));
              var c = h.id;
              o[f] == null && c != null && (o[f] = Le(c, null));
            }
          }
        if (this._shouldMakeIdFromName())
          for (var f = t; f < e; f++)
            Wl(this, f);
        Ad(this);
      }
    }, r.prototype.getApproximateExtent = function(t) {
      return this._approximateExtent[t] || this._store.getDataExtent(this._getStoreDimIndex(t));
    }, r.prototype.setApproximateExtent = function(t, e) {
      e = this.getDimension(e), this._approximateExtent[e] = t.slice();
    }, r.prototype.getCalculationInfo = function(t) {
      return this._calculationInfo[t];
    }, r.prototype.setCalculationInfo = function(t, e) {
      yn(t) ? k(this._calculationInfo, t) : this._calculationInfo[t] = e;
    }, r.prototype.getName = function(t) {
      var e = this.getRawIndex(t), i = this._nameList[e];
      return i == null && this._nameDimIdx != null && (i = mn(this, this._nameDimIdx, e)), i == null && (i = ""), i;
    }, r.prototype._getCategory = function(t, e) {
      var i = this._store.get(t, e), n = this._store.getOrdinalMeta(t);
      return n ? n.categories[i] : i;
    }, r.prototype.getId = function(t) {
      return Qa(this, this.getRawIndex(t));
    }, r.prototype.count = function() {
      return this._store.count();
    }, r.prototype.get = function(t, e) {
      var i = this._store, n = this._dimInfos[t];
      if (n)
        return i.get(n.storeDimIndex, e);
    }, r.prototype.getByRawIndex = function(t, e) {
      var i = this._store, n = this._dimInfos[t];
      if (n)
        return i.getByRawIndex(n.storeDimIndex, e);
    }, r.prototype.getIndices = function() {
      return this._store.getIndices();
    }, r.prototype.getDataExtent = function(t) {
      return this._store.getDataExtent(this._getStoreDimIndex(t));
    }, r.prototype.getSum = function(t) {
      return this._store.getSum(this._getStoreDimIndex(t));
    }, r.prototype.getMedian = function(t) {
      return this._store.getMedian(this._getStoreDimIndex(t));
    }, r.prototype.getValues = function(t, e) {
      var i = this, n = this._store;
      return N(t) ? n.getValues(Qe(t, function(a) {
        return i._getStoreDimIndex(a);
      }), e) : n.getValues(t);
    }, r.prototype.hasValue = function(t) {
      for (var e = this._dimSummary.dataDimIndicesOnCoord, i = 0, n = e.length; i < n; i++)
        if (isNaN(this._store.get(e[i], t)))
          return !1;
      return !0;
    }, r.prototype.indexOfName = function(t) {
      for (var e = 0, i = this._store.count(); e < i; e++)
        if (this.getName(e) === t)
          return e;
      return -1;
    }, r.prototype.getRawIndex = function(t) {
      return this._store.getRawIndex(t);
    }, r.prototype.indexOfRawIndex = function(t) {
      return this._store.indexOfRawIndex(t);
    }, r.prototype.rawIndexOf = function(t, e) {
      var i = t && this._invertedIndicesMap[t], n = i && i[e];
      return n == null || isNaN(n) ? Dd : n;
    }, r.prototype.indicesOfNearest = function(t, e, i) {
      return this._store.indicesOfNearest(this._getStoreDimIndex(t), e, i);
    }, r.prototype.each = function(t, e, i) {
      G(t) && (i = e, e = t, t = []);
      var n = i || this, a = Qe(_n(t), this._getStoreDimIndex, this);
      this._store.each(a, n ? dt(e, n) : e);
    }, r.prototype.filterSelf = function(t, e, i) {
      G(t) && (i = e, e = t, t = []);
      var n = i || this, a = Qe(_n(t), this._getStoreDimIndex, this);
      return this._store = this._store.filter(a, n ? dt(e, n) : e), this;
    }, r.prototype.selectRange = function(t) {
      var e = this, i = {}, n = pt(t);
      return A(n, function(a) {
        var o = e._getStoreDimIndex(a);
        i[o] = t[a];
      }), this._store = this._store.selectRange(i), this;
    }, r.prototype.mapArray = function(t, e, i) {
      G(t) && (i = e, e = t, t = []), i = i || this;
      var n = [];
      return this.each(t, function() {
        n.push(e && e.apply(this, arguments));
      }, i), n;
    }, r.prototype.map = function(t, e, i, n) {
      var a = i || n || this, o = Qe(_n(t), this._getStoreDimIndex, this), s = Sn(this);
      return s._store = this._store.map(o, a ? dt(e, a) : e), s;
    }, r.prototype.modify = function(t, e, i, n) {
      var a = i || n || this, o = Qe(_n(t), this._getStoreDimIndex, this);
      this._store.modify(o, a ? dt(e, a) : e);
    }, r.prototype.downSample = function(t, e, i, n) {
      var a = Sn(this);
      return a._store = this._store.downSample(this._getStoreDimIndex(t), e, i, n), a;
    }, r.prototype.minmaxDownSample = function(t, e) {
      var i = Sn(this);
      return i._store = this._store.minmaxDownSample(this._getStoreDimIndex(t), e), i;
    }, r.prototype.lttbDownSample = function(t, e) {
      var i = Sn(this);
      return i._store = this._store.lttbDownSample(this._getStoreDimIndex(t), e), i;
    }, r.prototype.getRawDataItem = function(t) {
      return this._store.getRawDataItem(t);
    }, r.prototype.getItemModel = function(t) {
      var e = this.hostModel, i = this.getRawDataItem(t);
      return new yt(i, e, e && e.ecModel);
    }, r.prototype.diff = function(t) {
      var e = this;
      return new DC(t ? t.getStore().getIndices() : [], this.getStore().getIndices(), function(i) {
        return Qa(t, i);
      }, function(i) {
        return Qa(e, i);
      });
    }, r.prototype.getVisual = function(t) {
      var e = this._visual;
      return e && e[t];
    }, r.prototype.setVisual = function(t, e) {
      this._visual = this._visual || {}, yn(t) ? k(this._visual, t) : this._visual[t] = e;
    }, r.prototype.getItemVisual = function(t, e) {
      var i = this._itemVisuals[t], n = i && i[e];
      return n ?? this.getVisual(e);
    }, r.prototype.hasItemVisual = function() {
      return this._itemVisuals.length > 0;
    }, r.prototype.ensureUniqueItemVisual = function(t, e) {
      var i = this._itemVisuals, n = i[t];
      n || (n = i[t] = {});
      var a = n[e];
      return a == null && (a = this.getVisual(e), N(a) ? a = a.slice() : yn(a) && (a = k({}, a)), n[e] = a), a;
    }, r.prototype.setItemVisual = function(t, e, i) {
      var n = this._itemVisuals[t] || {};
      this._itemVisuals[t] = n, yn(e) ? k(n, e) : n[e] = i;
    }, r.prototype.clearAllVisual = function() {
      this._visual = {}, this._itemVisuals = [];
    }, r.prototype.setLayout = function(t, e) {
      yn(t) ? k(this._layout, t) : this._layout[t] = e;
    }, r.prototype.getLayout = function(t) {
      return this._layout[t];
    }, r.prototype.getItemLayout = function(t) {
      return this._itemLayouts[t];
    }, r.prototype.setItemLayout = function(t, e, i) {
      this._itemLayouts[t] = i ? k(this._itemLayouts[t] || {}, e) : e;
    }, r.prototype.clearItemLayouts = function() {
      this._itemLayouts.length = 0;
    }, r.prototype.setItemGraphicEl = function(t, e) {
      var i = this.hostModel && this.hostModel.seriesIndex;
      eb(i, this.dataType, t, e), this._graphicEls[t] = e;
    }, r.prototype.getItemGraphicEl = function(t) {
      return this._graphicEls[t];
    }, r.prototype.eachItemGraphicEl = function(t, e) {
      A(this._graphicEls, function(i, n) {
        i && t && t.call(e, i, n);
      });
    }, r.prototype.cloneShallow = function(t) {
      return t || (t = new r(this._schema ? this._schema : Qe(this.dimensions, this._getDimInfo, this), this.hostModel)), Gl(t, this), t._store = this._store, t;
    }, r.prototype.wrapMethod = function(t, e) {
      var i = this[t];
      G(i) && (this.__wrappedMethods = this.__wrappedMethods || [], this.__wrappedMethods.push(t), this[t] = function() {
        var n = i.apply(this, arguments);
        return e.apply(this, [n].concat(Lf(arguments)));
      });
    }, r.internalField = (function() {
      Ad = function(t) {
        var e = t._invertedIndicesMap;
        A(e, function(i, n) {
          var a = t._dimInfos[n], o = a.ordinalMeta, s = t._store;
          if (o) {
            i = e[n] = new kC(o.categories.length);
            for (var l = 0; l < i.length; l++)
              i[l] = Dd;
            for (var l = 0; l < s.count(); l++)
              i[s.get(a.storeDimIndex, l)] = l;
          }
        });
      }, mn = function(t, e, i) {
        return Le(t._getCategory(e, i), null);
      }, Qa = function(t, e) {
        var i = t._idList[e];
        return i == null && t._idDimIdx != null && (i = mn(t, t._idDimIdx, e)), i == null && (i = OC + e), i;
      }, _n = function(t) {
        return N(t) || (t = t != null ? [t] : []), t;
      }, Sn = function(t) {
        var e = new r(t._schema ? t._schema : Qe(t.dimensions, t._getDimInfo, t), t.hostModel);
        return Gl(e, t), e;
      }, Gl = function(t, e) {
        A(NC.concat(e.__wrappedMethods || []), function(i) {
          e.hasOwnProperty(i) && (t[i] = e[i]);
        }), t.__wrappedMethods = e.__wrappedMethods, A(BC, function(i) {
          t[i] = K(e[i]);
        }), t._calculationInfo = k({}, e._calculationInfo);
      }, Wl = function(t, e) {
        var i = t._nameList, n = t._idList, a = t._nameDimIdx, o = t._idDimIdx, s = i[e], l = n[e];
        if (s == null && a != null && (i[e] = s = mn(t, a, e)), l == null && o != null && (n[e] = l = mn(t, o, e)), l == null && s != null) {
          var u = t._nameRepeatCount, f = u[s] = (u[s] || 0) + 1;
          l = s, f > 1 && (l += "__ec__" + f), n[e] = l;
        }
      };
    })(), r;
  })()
);
function FC(r, t) {
  hh(r) || (r = Ly(r)), t = t || {};
  var e = t.coordDimensions || [], i = t.dimensionsDefine || r.dimensionsDefine || [], n = Z(), a = [], o = HC(r, e, i, t.dimensionsCount), s = t.canOmitUnusedDimensions && Lm(o), l = i === r.dimensionsDefine, u = l ? Am(r) : Dm(i), f = t.encodeDefine;
  !f && t.encodeDefaulter && (f = t.encodeDefaulter(r, o));
  for (var h = Z(f), v = new By(o), c = 0; c < v.length; c++)
    v[c] = -1;
  function d(T) {
    var C = v[T];
    if (C < 0) {
      var M = i[T], L = W(M) ? M : {
        name: M
      }, P = new To(), I = L.name;
      I != null && u.get(I) != null && (P.name = P.displayName = I), L.type != null && (P.type = L.type), L.displayName != null && (P.displayName = L.displayName);
      var E = a.length;
      return v[T] = E, P.storeDimIndex = T, a.push(P), P;
    }
    return a[C];
  }
  if (!s)
    for (var c = 0; c < o; c++)
      d(c);
  h.each(function(T, C) {
    var M = Ot(T).slice();
    if (M.length === 1 && !z(M[0]) && M[0] < 0) {
      h.set(C, !1);
      return;
    }
    var L = h.set(C, []);
    A(M, function(P, I) {
      var E = z(P) ? u.get(P) : P;
      E != null && E < o && (L[I] = E, p(d(E), C, I));
    });
  });
  var y = 0;
  A(e, function(T) {
    var C, M, L, P;
    if (z(T))
      C = T, P = {};
    else {
      P = T, C = P.name;
      var I = P.ordinalMeta;
      P.ordinalMeta = null, P = k({}, P), P.ordinalMeta = I, M = P.dimsDef, L = P.otherDims, P.name = P.coordDim = P.coordDimIndex = P.dimsDef = P.otherDims = null;
    }
    var E = h.get(C);
    if (E !== !1) {
      if (E = Ot(E), !E.length)
        for (var R = 0; R < (M && M.length || 1); R++) {
          for (; y < o && d(y).coordDim != null; )
            y++;
          y < o && E.push(y++);
        }
      A(E, function(V, B) {
        var F = d(V);
        if (l && P.type != null && (F.type = P.type), p(ot(F, P), C, B), F.name == null && M) {
          var $ = M[B];
          !W($) && ($ = {
            name: $
          }), F.name = F.displayName = $.name, F.defaultTooltip = $.defaultTooltip;
        }
        L && ot(F.otherDims, L);
      });
    }
  });
  function p(T, C, M) {
    by.get(C) != null ? T.otherDims[C] = M : (T.coordDim = C, T.coordDimIndex = M, n.set(C, !0));
  }
  var g = t.generateCoord, m = t.generateCoordCount, _ = m != null;
  m = g ? m || 1 : 0;
  var S = g || "value";
  function w(T) {
    T.name == null && (T.name = T.coordDim);
  }
  if (s)
    A(a, function(T) {
      w(T);
    }), a.sort(function(T, C) {
      return T.storeDimIndex - C.storeDimIndex;
    });
  else
    for (var b = 0; b < o; b++) {
      var x = d(b), D = x.coordDim;
      D == null && (x.coordDim = $C(S, n, _), x.coordDimIndex = 0, (!g || m <= 0) && (x.isExtraCoord = !0), m--), w(x), x.type == null && (Cy(r, b) === Kt.Must || x.isExtraCoord && (x.otherDims.itemName != null || x.otherDims.seriesName != null)) && (x.type = "ordinal");
    }
  return zC(a), new Cm({
    source: r,
    dimensions: a,
    fullDimensionCount: o,
    dimensionOmitted: s
  });
}
function zC(r) {
  for (var t = Z(), e = 0; e < r.length; e++) {
    var i = r[e], n = i.name, a = t.get(n) || 0;
    a > 0 && (i.name = n + (a - 1)), a++, t.set(n, a);
  }
}
function HC(r, t, e, i) {
  var n = Math.max(r.dimensionsDetectedCount || 1, t.length, e.length, i || 0);
  return A(t, function(a) {
    var o;
    W(a) && (o = a.dimsDef) && (n = Math.max(n, o.length));
  }), n;
}
function $C(r, t, e) {
  if (e || t.hasKey(r)) {
    for (var i = 0; t.hasKey(r + i); )
      i++;
    r += i;
  }
  return t.set(r, !0), r;
}
var VC = (
  /** @class */
  /* @__PURE__ */ (function() {
    function r(t) {
      this.coordSysDims = [], this.axisMap = Z(), this.categoryAxisMap = Z(), this.coordSysName = t;
    }
    return r;
  })()
);
function GC(r) {
  var t = r.get("coordinateSystem"), e = new VC(t), i = WC[t];
  if (i)
    return i(r, e, e.axisMap, e.categoryAxisMap), e;
}
var WC = {
  cartesian2d: function(r, t, e, i) {
    var n = r.getReferringComponents("xAxis", ye).models[0], a = r.getReferringComponents("yAxis", ye).models[0];
    t.coordSysDims = ["x", "y"], e.set("x", n), e.set("y", a), Si(n) && (i.set("x", n), t.firstCategoryDimIndex = 0), Si(a) && (i.set("y", a), t.firstCategoryDimIndex == null && (t.firstCategoryDimIndex = 1));
  },
  singleAxis: function(r, t, e, i) {
    var n = r.getReferringComponents("singleAxis", ye).models[0];
    t.coordSysDims = ["single"], e.set("single", n), Si(n) && (i.set("single", n), t.firstCategoryDimIndex = 0);
  },
  polar: function(r, t, e, i) {
    var n = r.getReferringComponents("polar", ye).models[0], a = n.findAxisModel("radiusAxis"), o = n.findAxisModel("angleAxis");
    t.coordSysDims = ["radius", "angle"], e.set("radius", a), e.set("angle", o), Si(a) && (i.set("radius", a), t.firstCategoryDimIndex = 0), Si(o) && (i.set("angle", o), t.firstCategoryDimIndex == null && (t.firstCategoryDimIndex = 1));
  },
  geo: function(r, t, e, i) {
    t.coordSysDims = ["lng", "lat"];
  },
  parallel: function(r, t, e, i) {
    var n = r.ecModel, a = n.getComponent("parallel", r.get("parallelIndex")), o = t.coordSysDims = a.dimensions.slice();
    A(a.parallelAxisIndex, function(s, l) {
      var u = n.getComponent("parallelAxis", s), f = o[l];
      e.set(f, u), Si(u) && (i.set(f, u), t.firstCategoryDimIndex == null && (t.firstCategoryDimIndex = l));
    });
  }
};
function Si(r) {
  return r.get("type") === "category";
}
function UC(r, t, e) {
  e = e || {};
  var i = e.byIndex, n = e.stackedCoordDimension, a, o, s;
  YC(t) ? a = t : (o = t.schema, a = o.dimensions, s = t.store);
  var l = !!(r && r.get("stack")), u, f, h, v;
  if (A(a, function(m, _) {
    z(m) && (a[_] = m = {
      name: m
    }), l && !m.isExtraCoord && (!i && !u && m.ordinalMeta && (u = m), !f && m.type !== "ordinal" && m.type !== "time" && (!n || n === m.coordDim) && (f = m));
  }), f && !i && !u && (i = !0), f) {
    h = "__\0ecstackresult_" + r.id, v = "__\0ecstackedover_" + r.id, u && (u.createInvertedIndices = !0);
    var c = f.coordDim, d = f.type, y = 0;
    A(a, function(m) {
      m.coordDim === c && y++;
    });
    var p = {
      name: h,
      coordDim: c,
      coordDimIndex: y,
      type: d,
      isExtraCoord: !0,
      isCalculationCoord: !0,
      storeDimIndex: a.length
    }, g = {
      name: v,
      // This dimension contains stack base (generally, 0), so do not set it as
      // `stackedDimCoordDim` to avoid extent calculation, consider log scale.
      coordDim: v,
      coordDimIndex: y + 1,
      type: d,
      isExtraCoord: !0,
      isCalculationCoord: !0,
      storeDimIndex: a.length + 1
    };
    o ? (s && (p.storeDimIndex = s.ensureCalculationDimension(v, d), g.storeDimIndex = s.ensureCalculationDimension(h, d)), o.appendCalculationDimension(p), o.appendCalculationDimension(g)) : (a.push(p), a.push(g));
  }
  return {
    stackedDimension: f && f.name,
    stackedByDimension: u && u.name,
    isStackedByIndex: i,
    stackedOverDimension: v,
    stackResultDimension: h
  };
}
function YC(r) {
  return !Mm(r.schema);
}
function Yi(r, t) {
  return !!t && t === r.getCalculationInfo("stackedDimension");
}
function Pm(r, t) {
  return Yi(r, t) ? r.getCalculationInfo("stackResultDimension") : t;
}
function XC(r, t) {
  var e = r.get("coordinateSystem"), i = fh.get(e), n;
  return t && t.coordSysDims && (n = H(t.coordSysDims, function(a) {
    var o = {
      name: a
    }, s = t.axisMap.get(a);
    if (s) {
      var l = s.get("type");
      o.type = PC(l);
    }
    return o;
  })), n || (n = i && (i.getDimensionsInfo ? i.getDimensionsInfo() : i.dimensions.slice()) || ["x", "y"]), n;
}
function ZC(r, t, e) {
  var i, n;
  return e && A(r, function(a, o) {
    var s = a.coordDim, l = e.categoryAxisMap.get(s);
    l && (i == null && (i = o), a.ordinalMeta = l.getOrdinalMeta(), t && (a.createInvertedIndices = !0)), a.otherDims.itemName != null && (n = !0);
  }), !n && i != null && (r[i].otherDims.itemName = 0), i;
}
function qC(r, t, e) {
  e = e || {};
  var i = t.getSourceManager(), n, a = !1;
  n = i.getSource(), a = n.sourceFormat === he;
  var o = GC(t), s = XC(t, o), l = e.useEncodeDefaulter, u = G(l) ? l : l ? ht(Ww, s, t) : null, f = {
    coordDimensions: s,
    generateCoord: e.generateCoord,
    encodeDefine: t.getEncode(),
    encodeDefaulter: u,
    canOmitUnusedDimensions: !a
  }, h = FC(n, f), v = ZC(h.dimensions, e.createInvertedIndices, o), c = a ? null : i.getSharedDataStore(h), d = UC(t, {
    schema: h,
    store: c
  }), y = new Xn(h, t);
  y.setCalculationInfo(d);
  var p = v != null && KC(n) ? function(g, m, _, S) {
    return S === v ? _ : this.defaultDimValueGetter(g, m, _, S);
  } : null;
  return y.hasItemOption = !1, y.initData(
    // Try to reuse the data store in sourceManager if using dataset.
    a ? n : c,
    null,
    p
  ), y;
}
function KC(r) {
  if (r.sourceFormat === he) {
    var t = jC(r.data || []);
    return !N(ga(t));
  }
}
function jC(r) {
  for (var t = 0; t < r.length && r[t] == null; )
    t++;
  return r[t];
}
var Re = (
  /** @class */
  (function() {
    function r(t) {
      this._setting = t || {}, this._extent = [1 / 0, -1 / 0];
    }
    return r.prototype.getSetting = function(t) {
      return this._setting[t];
    }, r.prototype.unionExtent = function(t) {
      var e = this._extent;
      t[0] < e[0] && (e[0] = t[0]), t[1] > e[1] && (e[1] = t[1]);
    }, r.prototype.unionExtentFromData = function(t, e) {
      this.unionExtent(t.getApproximateExtent(e));
    }, r.prototype.getExtent = function() {
      return this._extent.slice();
    }, r.prototype.setExtent = function(t, e) {
      var i = this._extent;
      isNaN(t) || (i[0] = t), isNaN(e) || (i[1] = e);
    }, r.prototype.isInExtentRange = function(t) {
      return this._extent[0] <= t && this._extent[1] >= t;
    }, r.prototype.isBlank = function() {
      return this._isBlank;
    }, r.prototype.setBlank = function(t) {
      this._isBlank = t;
    }, r;
  })()
);
os(Re);
var QC = 0, ef = (
  /** @class */
  (function() {
    function r(t) {
      this.categories = t.categories || [], this._needCollect = t.needCollect, this._deduplication = t.deduplication, this.uid = ++QC;
    }
    return r.createByAxisModel = function(t) {
      var e = t.option, i = e.data, n = i && H(i, JC);
      return new r({
        categories: n,
        needCollect: !n,
        // deduplication is default in axis.
        deduplication: e.dedplication !== !1
      });
    }, r.prototype.getOrdinal = function(t) {
      return this._getOrCreateMap().get(t);
    }, r.prototype.parseAndCollect = function(t) {
      var e, i = this._needCollect;
      if (!z(t) && !i)
        return t;
      if (i && !this._deduplication)
        return e = this.categories.length, this.categories[e] = t, e;
      var n = this._getOrCreateMap();
      return e = n.get(t), e == null && (i ? (e = this.categories.length, this.categories[e] = t, n.set(t, e)) : e = NaN), e;
    }, r.prototype._getOrCreateMap = function() {
      return this._map || (this._map = Z(this.categories));
    }, r;
  })()
);
function JC(r) {
  return W(r) && r.value != null ? r.value : r + "";
}
function rf(r) {
  return r.type === "interval" || r.type === "log";
}
function tM(r, t, e, i) {
  var n = {}, a = r[1] - r[0], o = n.interval = Sg(a / t);
  e != null && o < e && (o = n.interval = e), i != null && o > i && (o = n.interval = i);
  var s = n.intervalPrecision = Im(o), l = n.niceTickExtent = [wt(Math.ceil(r[0] / o) * o, s), wt(Math.floor(r[1] / o) * o, s)];
  return eM(l, r), n;
}
function Ul(r) {
  var t = Math.pow(10, zf(r)), e = r / t;
  return e ? e === 2 ? e = 3 : e === 3 ? e = 5 : e *= 2 : e = 1, wt(e * t);
}
function Im(r) {
  return De(r) + 2;
}
function Ld(r, t, e) {
  r[t] = Math.max(Math.min(r[t], e[1]), e[0]);
}
function eM(r, t) {
  !isFinite(r[0]) && (r[0] = t[0]), !isFinite(r[1]) && (r[1] = t[1]), Ld(r, 0, t), Ld(r, 1, t), r[0] > r[1] && (r[0] = r[1]);
}
function Es(r, t) {
  return r >= t[0] && r <= t[1];
}
function Rs(r, t) {
  return t[1] === t[0] ? 0.5 : (r - t[0]) / (t[1] - t[0]);
}
function ks(r, t) {
  return r * (t[1] - t[0]) + t[0];
}
var wh = (
  /** @class */
  (function(r) {
    O(t, r);
    function t(e) {
      var i = r.call(this, e) || this;
      i.type = "ordinal";
      var n = i.getSetting("ordinalMeta");
      return n || (n = new ef({})), N(n) && (n = new ef({
        categories: H(n, function(a) {
          return W(a) ? a.value : a;
        })
      })), i._ordinalMeta = n, i._extent = i.getSetting("extent") || [0, n.categories.length - 1], i;
    }
    return t.prototype.parse = function(e) {
      return e == null ? NaN : z(e) ? this._ordinalMeta.getOrdinal(e) : Math.round(e);
    }, t.prototype.contain = function(e) {
      return e = this.parse(e), Es(e, this._extent) && this._ordinalMeta.categories[e] != null;
    }, t.prototype.normalize = function(e) {
      return e = this._getTickNumber(this.parse(e)), Rs(e, this._extent);
    }, t.prototype.scale = function(e) {
      return e = Math.round(ks(e, this._extent)), this.getRawOrdinalNumber(e);
    }, t.prototype.getTicks = function() {
      for (var e = [], i = this._extent, n = i[0]; n <= i[1]; )
        e.push({
          value: n
        }), n++;
      return e;
    }, t.prototype.getMinorTicks = function(e) {
    }, t.prototype.setSortInfo = function(e) {
      if (e == null) {
        this._ordinalNumbersByTick = this._ticksByOrdinalNumber = null;
        return;
      }
      for (var i = e.ordinalNumbers, n = this._ordinalNumbersByTick = [], a = this._ticksByOrdinalNumber = [], o = 0, s = this._ordinalMeta.categories.length, l = Math.min(s, i.length); o < l; ++o) {
        var u = i[o];
        n[o] = u, a[u] = o;
      }
      for (var f = 0; o < s; ++o) {
        for (; a[f] != null; )
          f++;
        n.push(f), a[f] = o;
      }
    }, t.prototype._getTickNumber = function(e) {
      var i = this._ticksByOrdinalNumber;
      return i && e >= 0 && e < i.length ? i[e] : e;
    }, t.prototype.getRawOrdinalNumber = function(e) {
      var i = this._ordinalNumbersByTick;
      return i && e >= 0 && e < i.length ? i[e] : e;
    }, t.prototype.getLabel = function(e) {
      if (!this.isBlank()) {
        var i = this.getRawOrdinalNumber(e.value), n = this._ordinalMeta.categories[i];
        return n == null ? "" : n + "";
      }
    }, t.prototype.count = function() {
      return this._extent[1] - this._extent[0] + 1;
    }, t.prototype.unionExtentFromData = function(e, i) {
      this.unionExtent(e.getApproximateExtent(i));
    }, t.prototype.isInExtentRange = function(e) {
      return e = this._getTickNumber(e), this._extent[0] <= e && this._extent[1] >= e;
    }, t.prototype.getOrdinalMeta = function() {
      return this._ordinalMeta;
    }, t.prototype.calcNiceTicks = function() {
    }, t.prototype.calcNiceExtent = function() {
    }, t.type = "ordinal", t;
  })(Re)
);
Re.registerClass(wh);
var Fr = wt, Ji = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = "interval", e._interval = 0, e._intervalPrecision = 2, e;
    }
    return t.prototype.parse = function(e) {
      return e;
    }, t.prototype.contain = function(e) {
      return Es(e, this._extent);
    }, t.prototype.normalize = function(e) {
      return Rs(e, this._extent);
    }, t.prototype.scale = function(e) {
      return ks(e, this._extent);
    }, t.prototype.setExtent = function(e, i) {
      var n = this._extent;
      isNaN(e) || (n[0] = parseFloat(e)), isNaN(i) || (n[1] = parseFloat(i));
    }, t.prototype.unionExtent = function(e) {
      var i = this._extent;
      e[0] < i[0] && (i[0] = e[0]), e[1] > i[1] && (i[1] = e[1]), this.setExtent(i[0], i[1]);
    }, t.prototype.getInterval = function() {
      return this._interval;
    }, t.prototype.setInterval = function(e) {
      this._interval = e, this._niceExtent = this._extent.slice(), this._intervalPrecision = Im(e);
    }, t.prototype.getTicks = function(e) {
      var i = this._interval, n = this._extent, a = this._niceExtent, o = this._intervalPrecision, s = [];
      if (!i)
        return s;
      var l = 1e4;
      n[0] < a[0] && (e ? s.push({
        value: Fr(a[0] - i, o)
      }) : s.push({
        value: n[0]
      }));
      for (var u = a[0]; u <= a[1] && (s.push({
        value: u
      }), u = Fr(u + i, o), u !== s[s.length - 1].value); )
        if (s.length > l)
          return [];
      var f = s.length ? s[s.length - 1].value : a[1];
      return n[1] > f && (e ? s.push({
        value: Fr(f + i, o)
      }) : s.push({
        value: n[1]
      })), s;
    }, t.prototype.getMinorTicks = function(e) {
      for (var i = this.getTicks(!0), n = [], a = this.getExtent(), o = 1; o < i.length; o++) {
        for (var s = i[o], l = i[o - 1], u = 0, f = [], h = s.value - l.value, v = h / e; u < e - 1; ) {
          var c = Fr(l.value + (u + 1) * v);
          c > a[0] && c < a[1] && f.push(c), u++;
        }
        n.push(f);
      }
      return n;
    }, t.prototype.getLabel = function(e, i) {
      if (e == null)
        return "";
      var n = i && i.precision;
      n == null ? n = De(e.value) || 0 : n === "auto" && (n = this._intervalPrecision);
      var a = Fr(e.value, n, !0);
      return yy(a);
    }, t.prototype.calcNiceTicks = function(e, i, n) {
      e = e || 5;
      var a = this._extent, o = a[1] - a[0];
      if (isFinite(o)) {
        o < 0 && (o = -o, a.reverse());
        var s = tM(a, e, i, n);
        this._intervalPrecision = s.intervalPrecision, this._interval = s.interval, this._niceExtent = s.niceTickExtent;
      }
    }, t.prototype.calcNiceExtent = function(e) {
      var i = this._extent;
      if (i[0] === i[1])
        if (i[0] !== 0) {
          var n = Math.abs(i[0]);
          e.fixMax || (i[1] += n / 2), i[0] -= n / 2;
        } else
          i[1] = 1;
      var a = i[1] - i[0];
      isFinite(a) || (i[0] = 0, i[1] = 1), this.calcNiceTicks(e.splitNumber, e.minInterval, e.maxInterval);
      var o = this._interval;
      e.fixMin || (i[0] = Fr(Math.floor(i[0] / o) * o)), e.fixMax || (i[1] = Fr(Math.ceil(i[1] / o) * o));
    }, t.prototype.setNiceExtent = function(e, i) {
      this._niceExtent = [e, i];
    }, t.type = "interval", t;
  })(Re)
);
Re.registerClass(Ji);
var Em = typeof Float32Array < "u", rM = Em ? Float32Array : Array;
function Li(r) {
  return N(r) ? Em ? new Float32Array(r) : r : new rM(r);
}
var iM = "__ec_stack_";
function nM(r) {
  return r.get("stack") || iM + r.seriesIndex;
}
function Rm(r) {
  return r.dim + r.index;
}
function aM(r, t) {
  var e = [];
  return t.eachSeriesByType(r, function(i) {
    fM(i) && e.push(i);
  }), e;
}
function oM(r) {
  var t = {};
  A(r, function(l) {
    var u = l.coordinateSystem, f = u.getBaseAxis();
    if (!(f.type !== "time" && f.type !== "value"))
      for (var h = l.getData(), v = f.dim + "_" + f.index, c = h.getDimensionIndex(h.mapDimension(f.dim)), d = h.getStore(), y = 0, p = d.count(); y < p; ++y) {
        var g = d.get(c, y);
        t[v] ? t[v].push(g) : t[v] = [g];
      }
  });
  var e = {};
  for (var i in t)
    if (t.hasOwnProperty(i)) {
      var n = t[i];
      if (n) {
        n.sort(function(l, u) {
          return l - u;
        });
        for (var a = null, o = 1; o < n.length; ++o) {
          var s = n[o] - n[o - 1];
          s > 0 && (a = a === null ? s : Math.min(a, s));
        }
        e[i] = a;
      }
    }
  return e;
}
function sM(r) {
  var t = oM(r), e = [];
  return A(r, function(i) {
    var n = i.coordinateSystem, a = n.getBaseAxis(), o = a.getExtent(), s;
    if (a.type === "category")
      s = a.getBandWidth();
    else if (a.type === "value" || a.type === "time") {
      var l = a.dim + "_" + a.index, u = t[l], f = Math.abs(o[1] - o[0]), h = a.scale.getExtent(), v = Math.abs(h[1] - h[0]);
      s = u ? f / v * u : f;
    } else {
      var c = i.getData();
      s = Math.abs(o[1] - o[0]) / c.count();
    }
    var d = Tt(i.get("barWidth"), s), y = Tt(i.get("barMaxWidth"), s), p = Tt(
      // barMinWidth by default is 0.5 / 1 in cartesian. Because in value axis,
      // the auto-calculated bar width might be less than 0.5 / 1.
      i.get("barMinWidth") || (hM(i) ? 0.5 : 1),
      s
    ), g = i.get("barGap"), m = i.get("barCategoryGap");
    e.push({
      bandWidth: s,
      barWidth: d,
      barMaxWidth: y,
      barMinWidth: p,
      barGap: g,
      barCategoryGap: m,
      axisKey: Rm(a),
      stackId: nM(i)
    });
  }), lM(e);
}
function lM(r) {
  var t = {};
  A(r, function(i, n) {
    var a = i.axisKey, o = i.bandWidth, s = t[a] || {
      bandWidth: o,
      remainedWidth: o,
      autoWidthCount: 0,
      categoryGap: null,
      gap: "20%",
      stacks: {}
    }, l = s.stacks;
    t[a] = s;
    var u = i.stackId;
    l[u] || s.autoWidthCount++, l[u] = l[u] || {
      width: 0,
      maxWidth: 0
    };
    var f = i.barWidth;
    f && !l[u].width && (l[u].width = f, f = Math.min(s.remainedWidth, f), s.remainedWidth -= f);
    var h = i.barMaxWidth;
    h && (l[u].maxWidth = h);
    var v = i.barMinWidth;
    v && (l[u].minWidth = v);
    var c = i.barGap;
    c != null && (s.gap = c);
    var d = i.barCategoryGap;
    d != null && (s.categoryGap = d);
  });
  var e = {};
  return A(t, function(i, n) {
    e[n] = {};
    var a = i.stacks, o = i.bandWidth, s = i.categoryGap;
    if (s == null) {
      var l = pt(a).length;
      s = Math.max(35 - l * 4, 15) + "%";
    }
    var u = Tt(s, o), f = Tt(i.gap, 1), h = i.remainedWidth, v = i.autoWidthCount, c = (h - u) / (v + (v - 1) * f);
    c = Math.max(c, 0), A(a, function(g) {
      var m = g.maxWidth, _ = g.minWidth;
      if (g.width) {
        var S = g.width;
        m && (S = Math.min(S, m)), _ && (S = Math.max(S, _)), g.width = S, h -= S + f * S, v--;
      } else {
        var S = c;
        m && m < S && (S = Math.min(m, h)), _ && _ > S && (S = _), S !== c && (g.width = S, h -= S + f * S, v--);
      }
    }), c = (h - u) / (v + (v - 1) * f), c = Math.max(c, 0);
    var d = 0, y;
    A(a, function(g, m) {
      g.width || (g.width = c), y = g, d += g.width * (1 + f);
    }), y && (d -= y.width * f);
    var p = -d / 2;
    A(a, function(g, m) {
      e[n][m] = e[n][m] || {
        bandWidth: o,
        offset: p,
        width: g.width
      }, p += g.width * (1 + f);
    });
  }), e;
}
function uM(r, t, e) {
  if (r && t) {
    var i = r[Rm(t)];
    return i;
  }
}
function fM(r) {
  return r.coordinateSystem && r.coordinateSystem.type === "cartesian2d";
}
function hM(r) {
  return r.pipelineContext && r.pipelineContext.large;
}
var cM = function(r, t, e, i) {
  for (; e < i; ) {
    var n = e + i >>> 1;
    r[n][1] < t ? e = n + 1 : i = n;
  }
  return e;
}, km = (
  /** @class */
  (function(r) {
    O(t, r);
    function t(e) {
      var i = r.call(this, e) || this;
      return i.type = "time", i;
    }
    return t.prototype.getLabel = function(e) {
      var i = this.getSetting("useUTC");
      return bs(e.value, bv[kw(Ni(this._minLevelUnit))] || bv.second, i, this.getSetting("locale"));
    }, t.prototype.getFormattedLabel = function(e, i, n) {
      var a = this.getSetting("useUTC"), o = this.getSetting("locale");
      return Ow(e, i, n, o, a);
    }, t.prototype.getTicks = function() {
      var e = this._interval, i = this._extent, n = [];
      if (!e)
        return n;
      n.push({
        value: i[0],
        level: 0
      });
      var a = this.getSetting("useUTC"), o = _M(this._minLevelUnit, this._approxInterval, a, i);
      return n = n.concat(o), n.push({
        value: i[1],
        level: 0
      }), n;
    }, t.prototype.calcNiceExtent = function(e) {
      var i = this._extent;
      if (i[0] === i[1] && (i[0] -= le, i[1] += le), i[1] === -1 / 0 && i[0] === 1 / 0) {
        var n = /* @__PURE__ */ new Date();
        i[1] = +new Date(n.getFullYear(), n.getMonth(), n.getDate()), i[0] = i[1] - le;
      }
      this.calcNiceTicks(e.splitNumber, e.minInterval, e.maxInterval);
    }, t.prototype.calcNiceTicks = function(e, i, n) {
      e = e || 10;
      var a = this._extent, o = a[1] - a[0];
      this._approxInterval = o / e, i != null && this._approxInterval < i && (this._approxInterval = i), n != null && this._approxInterval > n && (this._approxInterval = n);
      var s = Ja.length, l = Math.min(cM(Ja, this._approxInterval, 0, s), s - 1);
      this._interval = Ja[l][1], this._minLevelUnit = Ja[Math.max(l - 1, 0)][0];
    }, t.prototype.parse = function(e) {
      return vt(e) ? e : +Ve(e);
    }, t.prototype.contain = function(e) {
      return Es(this.parse(e), this._extent);
    }, t.prototype.normalize = function(e) {
      return Rs(this.parse(e), this._extent);
    }, t.prototype.scale = function(e) {
      return ks(e, this._extent);
    }, t.type = "time", t;
  })(Ji)
), Ja = [
  // Format                           interval
  ["second", nh],
  ["minute", ah],
  ["hour", Vn],
  ["quarter-day", Vn * 6],
  ["half-day", Vn * 12],
  ["day", le * 1.2],
  ["half-week", le * 3.5],
  ["week", le * 7],
  ["month", le * 31],
  ["quarter", le * 95],
  ["half-year", Sv / 2],
  ["year", Sv]
  // 1Y
];
function vM(r, t, e, i) {
  var n = Ve(t), a = Ve(e), o = function(d) {
    return wv(n, d, i) === wv(a, d, i);
  }, s = function() {
    return o("year");
  }, l = function() {
    return s() && o("month");
  }, u = function() {
    return l() && o("day");
  }, f = function() {
    return u() && o("hour");
  }, h = function() {
    return f() && o("minute");
  }, v = function() {
    return h() && o("second");
  }, c = function() {
    return v() && o("millisecond");
  };
  switch (r) {
    case "year":
      return s();
    case "month":
      return l();
    case "day":
      return u();
    case "hour":
      return f();
    case "minute":
      return h();
    case "second":
      return v();
    case "millisecond":
      return c();
  }
}
function dM(r, t) {
  return r /= le, r > 16 ? 16 : r > 7.5 ? 7 : r > 3.5 ? 4 : r > 1.5 ? 2 : 1;
}
function pM(r) {
  var t = 30 * le;
  return r /= t, r > 6 ? 6 : r > 3 ? 3 : r > 2 ? 2 : 1;
}
function gM(r) {
  return r /= Vn, r > 12 ? 12 : r > 6 ? 6 : r > 3.5 ? 4 : r > 2 ? 2 : 1;
}
function Pd(r, t) {
  return r /= t ? ah : nh, r > 30 ? 30 : r > 20 ? 20 : r > 15 ? 15 : r > 10 ? 10 : r > 5 ? 5 : r > 2 ? 2 : 1;
}
function yM(r) {
  return Sg(r);
}
function mM(r, t, e) {
  var i = new Date(r);
  switch (Ni(t)) {
    case "year":
    case "month":
      i[hy(e)](0);
    case "day":
      i[cy(e)](1);
    case "hour":
      i[vy(e)](0);
    case "minute":
      i[dy(e)](0);
    case "second":
      i[py(e)](0), i[gy(e)](0);
  }
  return i.getTime();
}
function _M(r, t, e, i) {
  var n = 1e4, a = uy, o = 0;
  function s(C, M, L, P, I, E, R) {
    for (var V = new Date(M), B = M, F = V[P](); B < L && B <= i[1]; )
      R.push({
        value: B
      }), F += C, V[I](F), B = V.getTime();
    R.push({
      value: B,
      notAdd: !0
    });
  }
  function l(C, M, L) {
    var P = [], I = !M.length;
    if (!vM(Ni(C), i[0], i[1], e)) {
      I && (M = [{
        // TODO Optimize. Not include so may ticks.
        value: mM(new Date(i[0]), C, e)
      }, {
        value: i[1]
      }]);
      for (var E = 0; E < M.length - 1; E++) {
        var R = M[E].value, V = M[E + 1].value;
        if (R !== V) {
          var B = void 0, F = void 0, $ = void 0, J = !1;
          switch (C) {
            case "year":
              B = Math.max(1, Math.round(t / le / 365)), F = oh(e), $ = Nw(e);
              break;
            case "half-year":
            case "quarter":
            case "month":
              B = pM(t), F = Bi(e), $ = hy(e);
              break;
            case "week":
            // PENDING If week is added. Ignore day.
            case "half-week":
            case "day":
              B = dM(t), F = ws(e), $ = cy(e), J = !0;
              break;
            case "half-day":
            case "quarter-day":
            case "hour":
              B = gM(t), F = oa(e), $ = vy(e);
              break;
            case "minute":
              B = Pd(t, !0), F = xs(e), $ = dy(e);
              break;
            case "second":
              B = Pd(t, !1), F = Ts(e), $ = py(e);
              break;
            case "millisecond":
              B = yM(t), F = Cs(e), $ = gy(e);
              break;
          }
          s(B, R, V, F, $, J, P), C === "year" && L.length > 1 && E === 0 && L.unshift({
            value: L[0].value - B
          });
        }
      }
      for (var E = 0; E < P.length; E++)
        L.push(P[E]);
      return P;
    }
  }
  for (var u = [], f = [], h = 0, v = 0, c = 0; c < a.length && o++ < n; ++c) {
    var d = Ni(a[c]);
    if (Rw(a[c])) {
      l(a[c], u[u.length - 1] || [], f);
      var y = a[c + 1] ? Ni(a[c + 1]) : null;
      if (d !== y) {
        if (f.length) {
          v = h, f.sort(function(C, M) {
            return C.value - M.value;
          });
          for (var p = [], g = 0; g < f.length; ++g) {
            var m = f[g].value;
            (g === 0 || f[g - 1].value !== m) && (p.push(f[g]), m >= i[0] && m <= i[1] && h++);
          }
          var _ = (i[1] - i[0]) / t;
          if (h > _ * 1.5 && v > _ / 1.5 || (u.push(p), h > _ || r === a[c]))
            break;
        }
        f = [];
      }
    }
  }
  for (var S = xt(H(u, function(C) {
    return xt(C, function(M) {
      return M.value >= i[0] && M.value <= i[1] && !M.notAdd;
    });
  }), function(C) {
    return C.length > 0;
  }), w = [], b = S.length - 1, c = 0; c < S.length; ++c)
    for (var x = S[c], D = 0; D < x.length; ++D)
      w.push({
        value: x[D].value,
        level: b - c
      });
  w.sort(function(C, M) {
    return C.value - M.value;
  });
  for (var T = [], c = 0; c < w.length; ++c)
    (c === 0 || w[c].value !== w[c - 1].value) && T.push(w[c]);
  return T;
}
Re.registerClass(km);
var Id = Re.prototype, Zn = Ji.prototype, SM = wt, bM = Math.floor, wM = Math.ceil, to = Math.pow, ve = Math.log, xh = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = "log", e.base = 10, e._originalScale = new Ji(), e._interval = 0, e;
    }
    return t.prototype.getTicks = function(e) {
      var i = this._originalScale, n = this._extent, a = i.getExtent(), o = Zn.getTicks.call(this, e);
      return H(o, function(s) {
        var l = s.value, u = wt(to(this.base, l));
        return u = l === n[0] && this._fixMin ? eo(u, a[0]) : u, u = l === n[1] && this._fixMax ? eo(u, a[1]) : u, {
          value: u
        };
      }, this);
    }, t.prototype.setExtent = function(e, i) {
      var n = ve(this.base);
      e = ve(Math.max(0, e)) / n, i = ve(Math.max(0, i)) / n, Zn.setExtent.call(this, e, i);
    }, t.prototype.getExtent = function() {
      var e = this.base, i = Id.getExtent.call(this);
      i[0] = to(e, i[0]), i[1] = to(e, i[1]);
      var n = this._originalScale, a = n.getExtent();
      return this._fixMin && (i[0] = eo(i[0], a[0])), this._fixMax && (i[1] = eo(i[1], a[1])), i;
    }, t.prototype.unionExtent = function(e) {
      this._originalScale.unionExtent(e);
      var i = this.base;
      e[0] = ve(e[0]) / ve(i), e[1] = ve(e[1]) / ve(i), Id.unionExtent.call(this, e);
    }, t.prototype.unionExtentFromData = function(e, i) {
      this.unionExtent(e.getApproximateExtent(i));
    }, t.prototype.calcNiceTicks = function(e) {
      e = e || 10;
      var i = this._extent, n = i[1] - i[0];
      if (!(n === 1 / 0 || n <= 0)) {
        var a = H1(n), o = e / n * a;
        for (o <= 0.5 && (a *= 10); !isNaN(a) && Math.abs(a) < 1 && Math.abs(a) > 0; )
          a *= 10;
        var s = [wt(wM(i[0] / a) * a), wt(bM(i[1] / a) * a)];
        this._interval = a, this._niceExtent = s;
      }
    }, t.prototype.calcNiceExtent = function(e) {
      Zn.calcNiceExtent.call(this, e), this._fixMin = e.fixMin, this._fixMax = e.fixMax;
    }, t.prototype.parse = function(e) {
      return e;
    }, t.prototype.contain = function(e) {
      return e = ve(e) / ve(this.base), Es(e, this._extent);
    }, t.prototype.normalize = function(e) {
      return e = ve(e) / ve(this.base), Rs(e, this._extent);
    }, t.prototype.scale = function(e) {
      return e = ks(e, this._extent), to(this.base, e);
    }, t.type = "log", t;
  })(Re)
), Om = xh.prototype;
Om.getMinorTicks = Zn.getMinorTicks;
Om.getLabel = Zn.getLabel;
function eo(r, t) {
  return SM(r, De(t));
}
Re.registerClass(xh);
var xM = (
  /** @class */
  (function() {
    function r(t, e, i) {
      this._prepareParams(t, e, i);
    }
    return r.prototype._prepareParams = function(t, e, i) {
      i[1] < i[0] && (i = [NaN, NaN]), this._dataMin = i[0], this._dataMax = i[1];
      var n = this._isOrdinal = t.type === "ordinal";
      this._needCrossZero = t.type === "interval" && e.getNeedCrossZero && e.getNeedCrossZero();
      var a = e.get("min", !0);
      a == null && (a = e.get("startValue", !0));
      var o = this._modelMinRaw = a;
      G(o) ? this._modelMinNum = ro(t, o({
        min: i[0],
        max: i[1]
      })) : o !== "dataMin" && (this._modelMinNum = ro(t, o));
      var s = this._modelMaxRaw = e.get("max", !0);
      if (G(s) ? this._modelMaxNum = ro(t, s({
        min: i[0],
        max: i[1]
      })) : s !== "dataMax" && (this._modelMaxNum = ro(t, s)), n)
        this._axisDataLen = e.getCategories().length;
      else {
        var l = e.get("boundaryGap"), u = N(l) ? l : [l || 0, l || 0];
        typeof u[0] == "boolean" || typeof u[1] == "boolean" ? this._boundaryGapInner = [0, 0] : this._boundaryGapInner = [Qr(u[0], 1), Qr(u[1], 1)];
      }
    }, r.prototype.calculate = function() {
      var t = this._isOrdinal, e = this._dataMin, i = this._dataMax, n = this._axisDataLen, a = this._boundaryGapInner, o = t ? null : i - e || Math.abs(e), s = this._modelMinRaw === "dataMin" ? e : this._modelMinNum, l = this._modelMaxRaw === "dataMax" ? i : this._modelMaxNum, u = s != null, f = l != null;
      s == null && (s = t ? n ? 0 : NaN : e - a[0] * o), l == null && (l = t ? n ? n - 1 : NaN : i + a[1] * o), (s == null || !isFinite(s)) && (s = NaN), (l == null || !isFinite(l)) && (l = NaN);
      var h = Ao(s) || Ao(l) || t && !n;
      this._needCrossZero && (s > 0 && l > 0 && !u && (s = 0), s < 0 && l < 0 && !f && (l = 0));
      var v = this._determinedMin, c = this._determinedMax;
      return v != null && (s = v, u = !0), c != null && (l = c, f = !0), {
        min: s,
        max: l,
        minFixed: u,
        maxFixed: f,
        isBlank: h
      };
    }, r.prototype.modifyDataMinMax = function(t, e) {
      this[CM[t]] = e;
    }, r.prototype.setDeterminedMinMax = function(t, e) {
      var i = TM[t];
      this[i] = e;
    }, r.prototype.freeze = function() {
      this.frozen = !0;
    }, r;
  })()
), TM = {
  min: "_determinedMin",
  max: "_determinedMax"
}, CM = {
  min: "_dataMin",
  max: "_dataMax"
};
function MM(r, t, e) {
  var i = r.rawExtentInfo;
  return i || (i = new xM(r, t, e), r.rawExtentInfo = i, i);
}
function ro(r, t) {
  return t == null ? null : Ao(t) ? NaN : r.parse(t);
}
function Nm(r, t) {
  var e = r.type, i = MM(r, t, r.getExtent()).calculate();
  r.setBlank(i.isBlank);
  var n = i.min, a = i.max, o = t.ecModel;
  if (o && e === "time") {
    var s = aM("bar", o), l = !1;
    if (A(s, function(h) {
      l = l || h.getBaseAxis() === t.axis;
    }), l) {
      var u = sM(s), f = DM(n, a, t, u);
      n = f.min, a = f.max;
    }
  }
  return {
    extent: [n, a],
    // "fix" means "fixed", the value should not be
    // changed in the subsequent steps.
    fixMin: i.minFixed,
    fixMax: i.maxFixed
  };
}
function DM(r, t, e, i) {
  var n = e.axis.getExtent(), a = Math.abs(n[1] - n[0]), o = uM(i, e.axis);
  if (o === void 0)
    return {
      min: r,
      max: t
    };
  var s = 1 / 0;
  A(o, function(c) {
    s = Math.min(c.offset, s);
  });
  var l = -1 / 0;
  A(o, function(c) {
    l = Math.max(c.offset + c.width, l);
  }), s = Math.abs(s), l = Math.abs(l);
  var u = s + l, f = t - r, h = 1 - (s + l) / a, v = f / h - f;
  return t += v * (l / u), r -= v * (s / u), {
    min: r,
    max: t
  };
}
function Ed(r, t) {
  var e = t, i = Nm(r, e), n = i.extent, a = e.get("splitNumber");
  r instanceof xh && (r.base = e.get("logBase"));
  var o = r.type, s = e.get("interval"), l = o === "interval" || o === "time";
  r.setExtent(n[0], n[1]), r.calcNiceExtent({
    splitNumber: a,
    fixMin: i.fixMin,
    fixMax: i.fixMax,
    minInterval: l ? e.get("minInterval") : null,
    maxInterval: l ? e.get("maxInterval") : null
  }), s != null && r.setInterval && r.setInterval(s);
}
function AM(r, t) {
  if (t = t || r.get("type"), t)
    switch (t) {
      // Buildin scale
      case "category":
        return new wh({
          ordinalMeta: r.getOrdinalMeta ? r.getOrdinalMeta() : r.getCategories(),
          extent: [1 / 0, -1 / 0]
        });
      case "time":
        return new km({
          locale: r.ecModel.getLocaleModel(),
          useUTC: r.ecModel.get("useUTC")
        });
      default:
        return new (Re.getClass(t) || Ji)();
    }
}
function LM(r) {
  var t = r.scale.getExtent(), e = t[0], i = t[1];
  return !(e > 0 && i > 0 || e < 0 && i < 0);
}
function tn(r) {
  var t = r.getLabelModel().get("formatter"), e = r.type === "category" ? r.scale.getExtent()[0] : null;
  return r.scale.type === "time" ? /* @__PURE__ */ (function(i) {
    return function(n, a) {
      return r.scale.getFormattedLabel(n, a, i);
    };
  })(t) : z(t) ? /* @__PURE__ */ (function(i) {
    return function(n) {
      var a = r.scale.getLabel(n), o = i.replace("{value}", a ?? "");
      return o;
    };
  })(t) : G(t) ? /* @__PURE__ */ (function(i) {
    return function(n, a) {
      return e != null && (a = n.value - e), i(Th(r, n), a, n.level != null ? {
        level: n.level
      } : null);
    };
  })(t) : function(i) {
    return r.scale.getLabel(i);
  };
}
function Th(r, t) {
  return r.type === "category" ? r.scale.getLabel(t) : t.value;
}
function PM(r) {
  var t = r.model, e = r.scale;
  if (!(!t.get(["axisLabel", "show"]) || e.isBlank())) {
    var i, n, a = e.getExtent();
    e instanceof wh ? n = e.count() : (i = e.getTicks(), n = i.length);
    var o = r.getLabelModel(), s = tn(r), l, u = 1;
    n > 40 && (u = Math.ceil(n / 40));
    for (var f = 0; f < n; f += u) {
      var h = i ? i[f] : {
        value: a[0] + f
      }, v = s(h, f), c = o.getTextRect(v), d = IM(c, o.get("rotate") || 0);
      l ? l.union(d) : l = d;
    }
    return l;
  }
}
function IM(r, t) {
  var e = t * Math.PI / 180, i = r.width, n = r.height, a = i * Math.abs(Math.cos(e)) + Math.abs(n * Math.sin(e)), o = i * Math.abs(Math.sin(e)) + Math.abs(n * Math.cos(e)), s = new it(r.x, r.y, a, o);
  return s;
}
function Ch(r) {
  var t = r.get("interval");
  return t ?? "auto";
}
function Bm(r) {
  return r.type === "category" && Ch(r.getLabelModel()) === 0;
}
function EM(r, t) {
  var e = {};
  return A(r.mapDimensionsAll(t), function(i) {
    e[Pm(r, i)] = !0;
  }), pt(e);
}
var RM = (
  /** @class */
  (function() {
    function r() {
    }
    return r.prototype.getNeedCrossZero = function() {
      var t = this.option;
      return !t.scale;
    }, r.prototype.getCoordSysModel = function() {
    }, r;
  })()
), Rd = [], kM = {
  registerPreprocessor: wm,
  registerProcessor: xm,
  registerPostInit: bC,
  registerPostUpdate: wC,
  registerUpdateLifecycle: Sh,
  registerAction: Qi,
  registerCoordinateSystem: xC,
  registerLayout: TC,
  registerVisual: ai,
  registerTransform: MC,
  registerLoading: Tm,
  registerMap: CC,
  registerImpl: eC,
  PRIORITY: dC,
  ComponentModel: at,
  ComponentView: me,
  SeriesModel: dr,
  ChartView: Pe,
  // TODO Use ComponentModel and SeriesModel instead of Constructor
  registerComponentModel: function(r) {
    at.registerClass(r);
  },
  registerComponentView: function(r) {
    me.registerClass(r);
  },
  registerSeriesModel: function(r) {
    dr.registerClass(r);
  },
  registerChartView: function(r) {
    Pe.registerClass(r);
  },
  registerSubTypeDefaulter: function(r, t) {
    at.registerSubTypeDefaulter(r, t);
  },
  registerPainter: function(r, t) {
    k1(r, t);
  }
};
function pr(r) {
  if (N(r)) {
    A(r, function(t) {
      pr(t);
    });
    return;
  }
  rt(Rd, r) >= 0 || (Rd.push(r), G(r) && (r = {
    install: r
  }), r.install(kM));
}
var ha = mt();
function Fm(r, t) {
  var e = H(t, function(i) {
    return r.scale.parse(i);
  });
  return r.type === "time" && e.length > 0 && (e.sort(), e.unshift(e[0]), e.push(e[e.length - 1])), e;
}
function OM(r) {
  var t = r.getLabelModel().get("customValues");
  if (t) {
    var e = tn(r), i = r.scale.getExtent(), n = Fm(r, t), a = xt(n, function(o) {
      return o >= i[0] && o <= i[1];
    });
    return {
      labels: H(a, function(o) {
        var s = {
          value: o
        };
        return {
          formattedLabel: e(s),
          rawLabel: r.scale.getLabel(s),
          tickValue: o
        };
      })
    };
  }
  return r.type === "category" ? BM(r) : zM(r);
}
function NM(r, t) {
  var e = r.getTickModel().get("customValues");
  if (e) {
    var i = r.scale.getExtent(), n = Fm(r, e);
    return {
      ticks: xt(n, function(a) {
        return a >= i[0] && a <= i[1];
      })
    };
  }
  return r.type === "category" ? FM(r, t) : {
    ticks: H(r.scale.getTicks(), function(a) {
      return a.value;
    })
  };
}
function BM(r) {
  var t = r.getLabelModel(), e = zm(r, t);
  return !t.get("show") || r.scale.isBlank() ? {
    labels: [],
    labelCategoryInterval: e.labelCategoryInterval
  } : e;
}
function zm(r, t) {
  var e = Hm(r, "labels"), i = Ch(t), n = $m(e, i);
  if (n)
    return n;
  var a, o;
  return G(i) ? a = Wm(r, i) : (o = i === "auto" ? HM(r) : i, a = Gm(r, o)), Vm(e, i, {
    labels: a,
    labelCategoryInterval: o
  });
}
function FM(r, t) {
  var e = Hm(r, "ticks"), i = Ch(t), n = $m(e, i);
  if (n)
    return n;
  var a, o;
  if ((!t.get("show") || r.scale.isBlank()) && (a = []), G(i))
    a = Wm(r, i, !0);
  else if (i === "auto") {
    var s = zm(r, r.getLabelModel());
    o = s.labelCategoryInterval, a = H(s.labels, function(l) {
      return l.tickValue;
    });
  } else
    o = i, a = Gm(r, o, !0);
  return Vm(e, i, {
    ticks: a,
    tickCategoryInterval: o
  });
}
function zM(r) {
  var t = r.scale.getTicks(), e = tn(r);
  return {
    labels: H(t, function(i, n) {
      return {
        level: i.level,
        formattedLabel: e(i, n),
        rawLabel: r.scale.getLabel(i),
        tickValue: i.value
      };
    })
  };
}
function Hm(r, t) {
  return ha(r)[t] || (ha(r)[t] = []);
}
function $m(r, t) {
  for (var e = 0; e < r.length; e++)
    if (r[e].key === t)
      return r[e].value;
}
function Vm(r, t, e) {
  return r.push({
    key: t,
    value: e
  }), e;
}
function HM(r) {
  var t = ha(r).autoInterval;
  return t ?? (ha(r).autoInterval = r.calculateCategoryInterval());
}
function $M(r) {
  var t = VM(r), e = tn(r), i = (t.axisRotate - t.labelRotate) / 180 * Math.PI, n = r.scale, a = n.getExtent(), o = n.count();
  if (a[1] - a[0] < 1)
    return 0;
  var s = 1;
  o > 40 && (s = Math.max(1, Math.floor(o / 40)));
  for (var l = a[0], u = r.dataToCoord(l + 1) - r.dataToCoord(l), f = Math.abs(u * Math.cos(i)), h = Math.abs(u * Math.sin(i)), v = 0, c = 0; l <= a[1]; l += s) {
    var d = 0, y = 0, p = Bf(e({
      value: l
    }), t.font, "center", "top");
    d = p.width * 1.3, y = p.height * 1.3, v = Math.max(v, d, 7), c = Math.max(c, y, 7);
  }
  var g = v / f, m = c / h;
  isNaN(g) && (g = 1 / 0), isNaN(m) && (m = 1 / 0);
  var _ = Math.max(0, Math.floor(Math.min(g, m))), S = ha(r.model), w = r.getExtent(), b = S.lastAutoInterval, x = S.lastTickCount;
  return b != null && x != null && Math.abs(b - _) <= 1 && Math.abs(x - o) <= 1 && b > _ && S.axisExtent0 === w[0] && S.axisExtent1 === w[1] ? _ = b : (S.lastTickCount = o, S.lastAutoInterval = _, S.axisExtent0 = w[0], S.axisExtent1 = w[1]), _;
}
function VM(r) {
  var t = r.getLabelModel();
  return {
    axisRotate: r.getRotate ? r.getRotate() : r.isHorizontal && !r.isHorizontal() ? 90 : 0,
    labelRotate: t.get("rotate") || 0,
    font: t.getFont()
  };
}
function Gm(r, t, e) {
  var i = tn(r), n = r.scale, a = n.getExtent(), o = r.getLabelModel(), s = [], l = Math.max((t || 0) + 1, 1), u = a[0], f = n.count();
  u !== 0 && l > 1 && f / l > 2 && (u = Math.round(Math.ceil(u / l) * l));
  var h = Bm(r), v = o.get("showMinLabel") || h, c = o.get("showMaxLabel") || h;
  v && u !== a[0] && y(a[0]);
  for (var d = u; d <= a[1]; d += l)
    y(d);
  c && d - l !== a[1] && y(a[1]);
  function y(p) {
    var g = {
      value: p
    };
    s.push(e ? p : {
      formattedLabel: i(g),
      rawLabel: n.getLabel(g),
      tickValue: p
    });
  }
  return s;
}
function Wm(r, t, e) {
  var i = r.scale, n = tn(r), a = [];
  return A(i.getTicks(), function(o) {
    var s = i.getLabel(o), l = o.value;
    t(o.value, s) && a.push(e ? l : {
      formattedLabel: n(o),
      rawLabel: s,
      tickValue: l
    });
  }), a;
}
var kd = [0, 1], GM = (
  /** @class */
  (function() {
    function r(t, e, i) {
      this.onBand = !1, this.inverse = !1, this.dim = t, this.scale = e, this._extent = i || [0, 0];
    }
    return r.prototype.contain = function(t) {
      var e = this._extent, i = Math.min(e[0], e[1]), n = Math.max(e[0], e[1]);
      return t >= i && t <= n;
    }, r.prototype.containData = function(t) {
      return this.scale.contain(t);
    }, r.prototype.getExtent = function() {
      return this._extent.slice();
    }, r.prototype.getPixelPrecision = function(t) {
      return B1(t || this.scale.getExtent(), this._extent);
    }, r.prototype.setExtent = function(t, e) {
      var i = this._extent;
      i[0] = t, i[1] = e;
    }, r.prototype.dataToCoord = function(t, e) {
      var i = this._extent, n = this.scale;
      return t = n.normalize(t), this.onBand && n.type === "ordinal" && (i = i.slice(), Od(i, n.count())), Ac(t, kd, i, e);
    }, r.prototype.coordToData = function(t, e) {
      var i = this._extent, n = this.scale;
      this.onBand && n.type === "ordinal" && (i = i.slice(), Od(i, n.count()));
      var a = Ac(t, i, kd, e);
      return this.scale.scale(a);
    }, r.prototype.pointToData = function(t, e) {
    }, r.prototype.getTicksCoords = function(t) {
      t = t || {};
      var e = t.tickModel || this.getTickModel(), i = NM(this, e), n = i.ticks, a = H(n, function(s) {
        return {
          coord: this.dataToCoord(this.scale.type === "ordinal" ? this.scale.getRawOrdinalNumber(s) : s),
          tickValue: s
        };
      }, this), o = e.get("alignWithLabel");
      return WM(this, a, o, t.clamp), a;
    }, r.prototype.getMinorTicksCoords = function() {
      if (this.scale.type === "ordinal")
        return [];
      var t = this.model.getModel("minorTick"), e = t.get("splitNumber");
      e > 0 && e < 100 || (e = 5);
      var i = this.scale.getMinorTicks(e), n = H(i, function(a) {
        return H(a, function(o) {
          return {
            coord: this.dataToCoord(o),
            tickValue: o
          };
        }, this);
      }, this);
      return n;
    }, r.prototype.getViewLabels = function() {
      return OM(this).labels;
    }, r.prototype.getLabelModel = function() {
      return this.model.getModel("axisLabel");
    }, r.prototype.getTickModel = function() {
      return this.model.getModel("axisTick");
    }, r.prototype.getBandWidth = function() {
      var t = this._extent, e = this.scale.getExtent(), i = e[1] - e[0] + (this.onBand ? 1 : 0);
      i === 0 && (i = 1);
      var n = Math.abs(t[1] - t[0]);
      return Math.abs(n) / i;
    }, r.prototype.calculateCategoryInterval = function() {
      return $M(this);
    }, r;
  })()
);
function Od(r, t) {
  var e = r[1] - r[0], i = t, n = e / i / 2;
  r[0] += n, r[1] -= n;
}
function WM(r, t, e, i) {
  var n = t.length;
  if (!r.onBand || e || !n)
    return;
  var a = r.getExtent(), o, s;
  if (n === 1)
    t[0].coord = a[0], o = t[1] = {
      coord: a[1],
      tickValue: t[0].tickValue
    };
  else {
    var l = t[n - 1].tickValue - t[0].tickValue, u = (t[n - 1].coord - t[0].coord) / l;
    A(t, function(c) {
      c.coord -= u / 2;
    });
    var f = r.scale.getExtent();
    s = 1 + f[1] - t[n - 1].tickValue, o = {
      coord: t[n - 1].coord + u * s,
      tickValue: f[1] + 1
    }, t.push(o);
  }
  var h = a[0] > a[1];
  v(t[0].coord, a[0]) && (i ? t[0].coord = a[0] : t.shift()), i && v(a[0], t[0].coord) && t.unshift({
    coord: a[0]
  }), v(a[1], o.coord) && (i ? o.coord = a[1] : t.pop()), i && v(o.coord, a[1]) && t.push({
    coord: a[1]
  });
  function v(c, d) {
    return c = wt(c), d = wt(d), h ? c > d : c < d;
  }
}
function UM(r) {
  for (var t = [], e = 0; e < r.length; e++) {
    var i = r[e];
    if (!i.defaultAttr.ignore) {
      var n = i.label, a = n.getComputedTransform(), o = n.getBoundingRect(), s = !a || a[1] < 1e-5 && a[2] < 1e-5, l = n.style.margin || 0, u = o.clone();
      u.applyTransform(a), u.x -= l / 2, u.y -= l / 2, u.width += l, u.height += l;
      var f = s ? new Ho(o, a) : null;
      t.push({
        label: n,
        labelLine: i.labelLine,
        rect: u,
        localRect: o,
        obb: f,
        priority: i.priority,
        defaultAttr: i.defaultAttr,
        layoutOption: i.computedLayoutOption,
        axisAligned: s,
        transform: a
      });
    }
  }
  return t;
}
function YM(r) {
  var t = [];
  r.sort(function(y, p) {
    return p.priority - y.priority;
  });
  var e = new it(0, 0, 0, 0);
  function i(y) {
    if (!y.ignore) {
      var p = y.ensureState("emphasis");
      p.ignore == null && (p.ignore = !1);
    }
    y.ignore = !0;
  }
  for (var n = 0; n < r.length; n++) {
    var a = r[n], o = a.axisAligned, s = a.localRect, l = a.transform, u = a.label, f = a.labelLine;
    e.copy(a.rect), e.width -= 0.1, e.height -= 0.1, e.x += 0.05, e.y += 0.05;
    for (var h = a.obb, v = !1, c = 0; c < t.length; c++) {
      var d = t[c];
      if (e.intersect(d.rect)) {
        if (o && d.axisAligned) {
          v = !0;
          break;
        }
        if (d.obb || (d.obb = new Ho(d.localRect, d.transform)), h || (h = new Ho(s, l)), h.intersect(d.obb)) {
          v = !0;
          break;
        }
      }
    }
    v ? (i(u), f && i(f)) : (u.attr("ignore", a.defaultAttr.ignore), f && f.attr("ignore", a.defaultAttr.labelGuideIgnore), t.push(a));
  }
}
var XM = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = t.type, e.hasSymbolVisual = !0, e;
    }
    return t.prototype.getInitialData = function(e) {
      return qC(null, this, {
        useEncodeDefaulter: !0
      });
    }, t.prototype.getLegendIcon = function(e) {
      var i = new Dt(), n = ii("line", 0, e.itemHeight / 2, e.itemWidth, 0, e.lineStyle.stroke, !1);
      i.add(n), n.setStyle(e.lineStyle);
      var a = this.getData().getVisual("symbol"), o = this.getData().getVisual("symbolRotate"), s = a === "none" ? "circle" : a, l = e.itemHeight * 0.8, u = ii(s, (e.itemWidth - l) / 2, (e.itemHeight - l) / 2, l, l, e.itemStyle.fill);
      i.add(u), u.setStyle(e.itemStyle);
      var f = e.iconRotate === "inherit" ? o : e.iconRotate || 0;
      return u.rotation = f * Math.PI / 180, u.setOrigin([e.itemWidth / 2, e.itemHeight / 2]), s.indexOf("empty") > -1 && (u.style.stroke = u.style.fill, u.style.fill = "#fff", u.style.lineWidth = 2), i;
    }, t.type = "series.line", t.dependencies = ["grid", "polar"], t.defaultOption = {
      // zlevel: 0,
      z: 3,
      coordinateSystem: "cartesian2d",
      legendHoverLink: !0,
      clip: !0,
      label: {
        position: "top"
      },
      // itemStyle: {
      // },
      endLabel: {
        show: !1,
        valueAnimation: !0,
        distance: 8
      },
      lineStyle: {
        width: 2,
        type: "solid"
      },
      emphasis: {
        scale: !0
      },
      // areaStyle: {
      // origin of areaStyle. Valid values:
      // `'auto'/null/undefined`: from axisLine to data
      // `'start'`: from min to data
      // `'end'`: from data to max
      // origin: 'auto'
      // },
      // false, 'start', 'end', 'middle'
      step: !1,
      // Disabled if step is true
      smooth: !1,
      smoothMonotone: null,
      symbol: "emptyCircle",
      symbolSize: 4,
      symbolRotate: null,
      showSymbol: !0,
      // `false`: follow the label interval strategy.
      // `true`: show all symbols.
      // `'auto'`: If possible, show all symbols, otherwise
      //           follow the label interval strategy.
      showAllSymbol: "auto",
      // Whether to connect break point.
      connectNulls: !1,
      // Sampling for large data. Can be: 'average', 'max', 'min', 'sum', 'lttb'.
      sampling: "none",
      animationEasing: "linear",
      // Disable progressive
      progressive: 0,
      hoverLayerThreshold: 1 / 0,
      universalTransition: {
        divideShape: "clone"
      },
      triggerLineEvent: !1
    }, t;
  })(dr)
);
function Um(r, t) {
  var e = r.mapDimensionsAll("defaultedLabel"), i = e.length;
  if (i === 1) {
    var n = Ui(r, t, e[0]);
    return n != null ? n + "" : null;
  } else if (i) {
    for (var a = [], o = 0; o < e.length; o++)
      a.push(Ui(r, t, e[o]));
    return a.join(" ");
  }
}
function ZM(r, t) {
  var e = r.mapDimensionsAll("defaultedLabel");
  if (!N(t))
    return t + "";
  for (var i = [], n = 0; n < e.length; n++) {
    var a = r.getDimensionIndex(e[n]);
    a >= 0 && i.push(t[a]);
  }
  return i.join(" ");
}
var Mh = (
  /** @class */
  (function(r) {
    O(t, r);
    function t(e, i, n, a) {
      var o = r.call(this) || this;
      return o.updateData(e, i, n, a), o;
    }
    return t.prototype._createSymbol = function(e, i, n, a, o) {
      this.removeAll();
      var s = ii(e, -1, -1, 2, 2, null, o);
      s.attr({
        z2: 100,
        culling: !0,
        scaleX: a[0] / 2,
        scaleY: a[1] / 2
      }), s.drift = qM, this._symbolType = e, this.add(s);
    }, t.prototype.stopSymbolAnimation = function(e) {
      this.childAt(0).stopAnimation(null, e);
    }, t.prototype.getSymbolType = function() {
      return this._symbolType;
    }, t.prototype.getSymbolPath = function() {
      return this.childAt(0);
    }, t.prototype.highlight = function() {
      ia(this.childAt(0));
    }, t.prototype.downplay = function() {
      na(this.childAt(0));
    }, t.prototype.setZ = function(e, i) {
      var n = this.childAt(0);
      n.zlevel = e, n.z = i;
    }, t.prototype.setDraggable = function(e, i) {
      var n = this.childAt(0);
      n.draggable = e, n.cursor = !i && e ? "move" : n.cursor;
    }, t.prototype.updateData = function(e, i, n, a) {
      this.silent = !1;
      var o = e.getItemVisual(i, "symbol") || "circle", s = e.hostModel, l = t.getSymbolSize(e, i), u = o !== this._symbolType, f = a && a.disableAnimation;
      if (u) {
        var h = e.getItemVisual(i, "symbolKeepAspect");
        this._createSymbol(o, e, i, l, h);
      } else {
        var v = this.childAt(0);
        v.silent = !1;
        var c = {
          scaleX: l[0] / 2,
          scaleY: l[1] / 2
        };
        f ? v.attr(c) : We(v, c, s, i), Qb(v);
      }
      if (this._updateCommon(e, i, l, n, a), u) {
        var v = this.childAt(0);
        if (!f) {
          var c = {
            scaleX: this._sizeX,
            scaleY: this._sizeY,
            style: {
              // Always fadeIn. Because it has fadeOut animation when symbol is removed..
              opacity: v.style.opacity
            }
          };
          v.scaleX = v.scaleY = 0, v.style.opacity = 0, Ki(v, c, s, i);
        }
      }
      f && this.childAt(0).stopAnimation("leave");
    }, t.prototype._updateCommon = function(e, i, n, a, o) {
      var s = this.childAt(0), l = e.hostModel, u, f, h, v, c, d, y, p, g;
      if (a && (u = a.emphasisItemStyle, f = a.blurItemStyle, h = a.selectItemStyle, v = a.focus, c = a.blurScope, y = a.labelStatesModels, p = a.hoverScale, g = a.cursorStyle, d = a.emphasisDisabled), !a || e.hasItemOption) {
        var m = a && a.itemModel ? a.itemModel : e.getItemModel(i), _ = m.getModel("emphasis");
        u = _.getModel("itemStyle").getItemStyle(), h = m.getModel(["select", "itemStyle"]).getItemStyle(), f = m.getModel(["blur", "itemStyle"]).getItemStyle(), v = _.get("focus"), c = _.get("blurScope"), d = _.get("disabled"), y = _a(m), p = _.getShallow("scale"), g = m.getShallow("cursor");
      }
      var S = e.getItemVisual(i, "symbolRotate");
      s.attr("rotation", (S || 0) * Math.PI / 180 || 0);
      var w = Ps(e.getItemVisual(i, "symbolOffset"), n);
      w && (s.x = w[0], s.y = w[1]), g && s.attr("cursor", g);
      var b = e.getItemVisual(i, "style"), x = b.fill;
      if (s instanceof gr) {
        var D = s.style;
        s.useStyle(k({
          // TODO other properties like x, y ?
          image: D.image,
          x: D.x,
          y: D.y,
          width: D.width,
          height: D.height
        }, b));
      } else
        s.__isEmptyBrush ? s.useStyle(k({}, b)) : s.useStyle(b), s.style.decal = null, s.setColor(x, o && o.symbolInnerColor), s.style.strokeNoScale = !0;
      var T = e.getItemVisual(i, "liftZ"), C = this._z2;
      T != null ? C == null && (this._z2 = s.z2, s.z2 += T) : C != null && (s.z2 = C, this._z2 = null);
      var M = o && o.useNameLabel;
      _s(s, y, {
        labelFetcher: l,
        labelDataIndex: i,
        defaultText: L,
        inheritColor: x,
        defaultOpacity: b.opacity
      });
      function L(E) {
        return M ? e.getName(E) : Um(e, E);
      }
      this._sizeX = n[0] / 2, this._sizeY = n[1] / 2;
      var P = s.ensureState("emphasis");
      P.style = u, s.ensureState("select").style = h, s.ensureState("blur").style = f;
      var I = p == null || p === !0 ? Math.max(1.1, 3 / this._sizeY) : isFinite(p) && p > 0 ? +p : 1;
      P.scaleX = this._sizeX * I, P.scaleY = this._sizeY * I, this.setSymbolScale(1), zo(this, v, c, d);
    }, t.prototype.setSymbolScale = function(e) {
      this.scaleX = this.scaleY = e;
    }, t.prototype.fadeOut = function(e, i, n) {
      var a = this.childAt(0), o = et(this).dataIndex, s = n && n.animation;
      if (this.silent = a.silent = !0, n && n.fadeLabel) {
        var l = a.getTextContent();
        l && $o(l, {
          style: {
            opacity: 0
          }
        }, i, {
          dataIndex: o,
          removeOpt: s,
          cb: function() {
            a.removeTextContent();
          }
        });
      } else
        a.removeTextContent();
      $o(a, {
        style: {
          opacity: 0
        },
        scaleX: 0,
        scaleY: 0
      }, i, {
        dataIndex: o,
        cb: e,
        removeOpt: s
      });
    }, t.getSymbolSize = function(e, i) {
      return gh(e.getItemVisual(i, "symbolSize"));
    }, t;
  })(Dt)
);
function qM(r, t) {
  this.parent.drift(r, t);
}
function Yl(r, t, e, i) {
  return t && !isNaN(t[0]) && !isNaN(t[1]) && !(i.isIgnore && i.isIgnore(e)) && !(i.clipShape && !i.clipShape.contain(t[0], t[1])) && r.getItemVisual(e, "symbol") !== "none";
}
function Nd(r) {
  return r != null && !W(r) && (r = {
    isIgnore: r
  }), r || {};
}
function Bd(r) {
  var t = r.hostModel, e = t.getModel("emphasis");
  return {
    emphasisItemStyle: e.getModel("itemStyle").getItemStyle(),
    blurItemStyle: t.getModel(["blur", "itemStyle"]).getItemStyle(),
    selectItemStyle: t.getModel(["select", "itemStyle"]).getItemStyle(),
    focus: e.get("focus"),
    blurScope: e.get("blurScope"),
    emphasisDisabled: e.get("disabled"),
    hoverScale: e.get("scale"),
    labelStatesModels: _a(t),
    cursorStyle: t.get("cursor")
  };
}
var Ym = (
  /** @class */
  (function() {
    function r(t) {
      this.group = new Dt(), this._SymbolCtor = t || Mh;
    }
    return r.prototype.updateData = function(t, e) {
      this._progressiveEls = null, e = Nd(e);
      var i = this.group, n = t.hostModel, a = this._data, o = this._SymbolCtor, s = e.disableAnimation, l = Bd(t), u = {
        disableAnimation: s
      }, f = e.getSymbolPoint || function(h) {
        return t.getItemLayout(h);
      };
      a || i.removeAll(), t.diff(a).add(function(h) {
        var v = f(h);
        if (Yl(t, v, h, e)) {
          var c = new o(t, h, l, u);
          c.setPosition(v), t.setItemGraphicEl(h, c), i.add(c);
        }
      }).update(function(h, v) {
        var c = a.getItemGraphicEl(v), d = f(h);
        if (!Yl(t, d, h, e)) {
          i.remove(c);
          return;
        }
        var y = t.getItemVisual(h, "symbol") || "circle", p = c && c.getSymbolType && c.getSymbolType();
        if (!c || p && p !== y)
          i.remove(c), c = new o(t, h, l, u), c.setPosition(d);
        else {
          c.updateData(t, h, l, u);
          var g = {
            x: d[0],
            y: d[1]
          };
          s ? c.attr(g) : We(c, g, n);
        }
        i.add(c), t.setItemGraphicEl(h, c);
      }).remove(function(h) {
        var v = a.getItemGraphicEl(h);
        v && v.fadeOut(function() {
          i.remove(v);
        }, n);
      }).execute(), this._getSymbolPoint = f, this._data = t;
    }, r.prototype.updateLayout = function() {
      var t = this, e = this._data;
      e && e.eachItemGraphicEl(function(i, n) {
        var a = t._getSymbolPoint(n);
        i.setPosition(a), i.markRedraw();
      });
    }, r.prototype.incrementalPrepareUpdate = function(t) {
      this._seriesScope = Bd(t), this._data = null, this.group.removeAll();
    }, r.prototype.incrementalUpdate = function(t, e, i) {
      this._progressiveEls = [], i = Nd(i);
      function n(l) {
        l.isGroup || (l.incremental = !0, l.ensureState("emphasis").hoverLayer = !0);
      }
      for (var a = t.start; a < t.end; a++) {
        var o = e.getItemLayout(a);
        if (Yl(e, o, a, i)) {
          var s = new this._SymbolCtor(e, a, this._seriesScope);
          s.traverse(n), s.setPosition(o), this.group.add(s), e.setItemGraphicEl(a, s), this._progressiveEls.push(s);
        }
      }
    }, r.prototype.eachRendered = function(t) {
      ys(this._progressiveEls || this.group, t);
    }, r.prototype.remove = function(t) {
      var e = this.group, i = this._data;
      i && t ? i.eachItemGraphicEl(function(n) {
        n.fadeOut(function() {
          e.remove(n);
        }, i.hostModel);
      }) : e.removeAll();
    }, r;
  })()
);
function Xm(r, t, e) {
  var i = r.getBaseAxis(), n = r.getOtherAxis(i), a = KM(n, e), o = i.dim, s = n.dim, l = t.mapDimension(s), u = t.mapDimension(o), f = s === "x" || s === "radius" ? 1 : 0, h = H(r.dimensions, function(d) {
    return t.mapDimension(d);
  }), v = !1, c = t.getCalculationInfo("stackResultDimension");
  return Yi(
    t,
    h[0]
    /* , dims[1] */
  ) && (v = !0, h[0] = c), Yi(
    t,
    h[1]
    /* , dims[0] */
  ) && (v = !0, h[1] = c), {
    dataDimsForPoint: h,
    valueStart: a,
    valueAxisDim: s,
    baseAxisDim: o,
    stacked: !!v,
    valueDim: l,
    baseDim: u,
    baseDataOffset: f,
    stackedOverDimension: t.getCalculationInfo("stackedOverDimension")
  };
}
function KM(r, t) {
  var e = 0, i = r.scale.getExtent();
  return t === "start" ? e = i[0] : t === "end" ? e = i[1] : vt(t) && !isNaN(t) ? e = t : i[0] > 0 ? e = i[0] : i[1] < 0 && (e = i[1]), e;
}
function Zm(r, t, e, i) {
  var n = NaN;
  r.stacked && (n = e.get(e.getCalculationInfo("stackedOverDimension"), i)), isNaN(n) && (n = r.valueStart);
  var a = r.baseDataOffset, o = [];
  return o[a] = e.get(r.baseDim, i), o[1 - a] = n, t.dataToPoint(o);
}
function jM(r, t) {
  var e = [];
  return t.diff(r).add(function(i) {
    e.push({
      cmd: "+",
      idx: i
    });
  }).update(function(i, n) {
    e.push({
      cmd: "=",
      idx: n,
      idx1: i
    });
  }).remove(function(i) {
    e.push({
      cmd: "-",
      idx: i
    });
  }).execute(), e;
}
function QM(r, t, e, i, n, a, o, s) {
  for (var l = jM(r, t), u = [], f = [], h = [], v = [], c = [], d = [], y = [], p = Xm(n, t, o), g = r.getLayout("points") || [], m = t.getLayout("points") || [], _ = 0; _ < l.length; _++) {
    var S = l[_], w = !0, b = void 0, x = void 0;
    switch (S.cmd) {
      case "=":
        b = S.idx * 2, x = S.idx1 * 2;
        var D = g[b], T = g[b + 1], C = m[x], M = m[x + 1];
        (isNaN(D) || isNaN(T)) && (D = C, T = M), u.push(D, T), f.push(C, M), h.push(e[b], e[b + 1]), v.push(i[x], i[x + 1]), y.push(t.getRawIndex(S.idx1));
        break;
      case "+":
        var L = S.idx, P = p.dataDimsForPoint, I = n.dataToPoint([t.get(P[0], L), t.get(P[1], L)]);
        x = L * 2, u.push(I[0], I[1]), f.push(m[x], m[x + 1]);
        var E = Zm(p, n, t, L);
        h.push(E[0], E[1]), v.push(i[x], i[x + 1]), y.push(t.getRawIndex(L));
        break;
      case "-":
        w = !1;
    }
    w && (c.push(S), d.push(d.length));
  }
  d.sort(function(ct, Nt) {
    return y[ct] - y[Nt];
  });
  for (var R = u.length, V = Li(R), B = Li(R), F = Li(R), $ = Li(R), J = [], _ = 0; _ < d.length; _++) {
    var j = d[_], lt = _ * 2, ft = j * 2;
    V[lt] = u[ft], V[lt + 1] = u[ft + 1], B[lt] = f[ft], B[lt + 1] = f[ft + 1], F[lt] = h[ft], F[lt + 1] = h[ft + 1], $[lt] = v[ft], $[lt + 1] = v[ft + 1], J[_] = c[j];
  }
  return {
    current: V,
    next: B,
    stackedOnCurrent: F,
    stackedOnNext: $,
    status: J
  };
}
var Je = Math.min, tr = Math.max;
function Zr(r, t) {
  return isNaN(r) || isNaN(t);
}
function nf(r, t, e, i, n, a, o, s, l) {
  for (var u, f, h, v, c, d, y = e, p = 0; p < i; p++) {
    var g = t[y * 2], m = t[y * 2 + 1];
    if (y >= n || y < 0)
      break;
    if (Zr(g, m)) {
      if (l) {
        y += a;
        continue;
      }
      break;
    }
    if (y === e)
      r[a > 0 ? "moveTo" : "lineTo"](g, m), h = g, v = m;
    else {
      var _ = g - u, S = m - f;
      if (_ * _ + S * S < 0.5) {
        y += a;
        continue;
      }
      if (o > 0) {
        for (var w = y + a, b = t[w * 2], x = t[w * 2 + 1]; b === g && x === m && p < i; )
          p++, w += a, y += a, b = t[w * 2], x = t[w * 2 + 1], g = t[y * 2], m = t[y * 2 + 1], _ = g - u, S = m - f;
        var D = p + 1;
        if (l)
          for (; Zr(b, x) && D < i; )
            D++, w += a, b = t[w * 2], x = t[w * 2 + 1];
        var T = 0.5, C = 0, M = 0, L = void 0, P = void 0;
        if (D >= i || Zr(b, x))
          c = g, d = m;
        else {
          C = b - u, M = x - f;
          var I = g - u, E = b - g, R = m - f, V = x - m, B = void 0, F = void 0;
          if (s === "x") {
            B = Math.abs(I), F = Math.abs(E);
            var $ = C > 0 ? 1 : -1;
            c = g - $ * B * o, d = m, L = g + $ * F * o, P = m;
          } else if (s === "y") {
            B = Math.abs(R), F = Math.abs(V);
            var J = M > 0 ? 1 : -1;
            c = g, d = m - J * B * o, L = g, P = m + J * F * o;
          } else
            B = Math.sqrt(I * I + R * R), F = Math.sqrt(E * E + V * V), T = F / (F + B), c = g - C * o * (1 - T), d = m - M * o * (1 - T), L = g + C * o * T, P = m + M * o * T, L = Je(L, tr(b, g)), P = Je(P, tr(x, m)), L = tr(L, Je(b, g)), P = tr(P, Je(x, m)), C = L - g, M = P - m, c = g - C * B / F, d = m - M * B / F, c = Je(c, tr(u, g)), d = Je(d, tr(f, m)), c = tr(c, Je(u, g)), d = tr(d, Je(f, m)), C = g - c, M = m - d, L = g + C * F / B, P = m + M * F / B;
        }
        r.bezierCurveTo(h, v, c, d, g, m), h = L, v = P;
      } else
        r.lineTo(g, m);
    }
    u = g, f = m, y += a;
  }
  return p;
}
var qm = (
  /** @class */
  /* @__PURE__ */ (function() {
    function r() {
      this.smooth = 0, this.smoothConstraint = !0;
    }
    return r;
  })()
), JM = (
  /** @class */
  (function(r) {
    O(t, r);
    function t(e) {
      var i = r.call(this, e) || this;
      return i.type = "ec-polyline", i;
    }
    return t.prototype.getDefaultStyle = function() {
      return {
        stroke: "#000",
        fill: null
      };
    }, t.prototype.getDefaultShape = function() {
      return new qm();
    }, t.prototype.buildPath = function(e, i) {
      var n = i.points, a = 0, o = n.length / 2;
      if (i.connectNulls) {
        for (; o > 0 && Zr(n[o * 2 - 2], n[o * 2 - 1]); o--)
          ;
        for (; a < o && Zr(n[a * 2], n[a * 2 + 1]); a++)
          ;
      }
      for (; a < o; )
        a += nf(e, n, a, o, o, 1, i.smooth, i.smoothMonotone, i.connectNulls) + 1;
    }, t.prototype.getPointOn = function(e, i) {
      this.path || (this.createPathProxy(), this.buildPath(this.path, this.shape));
      for (var n = this.path, a = n.data, o = ti.CMD, s, l, u = i === "x", f = [], h = 0; h < a.length; ) {
        var v = a[h++], c = void 0, d = void 0, y = void 0, p = void 0, g = void 0, m = void 0, _ = void 0;
        switch (v) {
          case o.M:
            s = a[h++], l = a[h++];
            break;
          case o.L:
            if (c = a[h++], d = a[h++], _ = u ? (e - s) / (c - s) : (e - l) / (d - l), _ <= 1 && _ >= 0) {
              var S = u ? (d - l) * _ + l : (c - s) * _ + s;
              return u ? [e, S] : [S, e];
            }
            s = c, l = d;
            break;
          case o.C:
            c = a[h++], d = a[h++], y = a[h++], p = a[h++], g = a[h++], m = a[h++];
            var w = u ? Io(s, c, y, g, e, f) : Io(l, d, p, m, e, f);
            if (w > 0)
              for (var b = 0; b < w; b++) {
                var x = f[b];
                if (x <= 1 && x >= 0) {
                  var S = u ? At(l, d, p, m, x) : At(s, c, y, g, x);
                  return u ? [e, S] : [S, e];
                }
              }
            s = g, l = m;
            break;
        }
      }
    }, t;
  })(st)
), tD = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      return r !== null && r.apply(this, arguments) || this;
    }
    return t;
  })(qm)
), eD = (
  /** @class */
  (function(r) {
    O(t, r);
    function t(e) {
      var i = r.call(this, e) || this;
      return i.type = "ec-polygon", i;
    }
    return t.prototype.getDefaultShape = function() {
      return new tD();
    }, t.prototype.buildPath = function(e, i) {
      var n = i.points, a = i.stackedOnPoints, o = 0, s = n.length / 2, l = i.smoothMonotone;
      if (i.connectNulls) {
        for (; s > 0 && Zr(n[s * 2 - 2], n[s * 2 - 1]); s--)
          ;
        for (; o < s && Zr(n[o * 2], n[o * 2 + 1]); o++)
          ;
      }
      for (; o < s; ) {
        var u = nf(e, n, o, s, s, 1, i.smooth, l, i.connectNulls);
        nf(e, a, o + u - 1, u, s, -1, i.stackedOnSmooth, l, i.connectNulls), o += u + 1, e.closePath();
      }
    }, t;
  })(st)
);
function rD(r, t, e, i, n) {
  var a = r.getArea(), o = a.x, s = a.y, l = a.width, u = a.height, f = e.get(["lineStyle", "width"]) || 0;
  o -= f / 2, s -= f / 2, l += f, u += f, l = Math.ceil(l), o !== Math.floor(o) && (o = Math.floor(o), l++);
  var h = new Lt({
    shape: {
      x: o,
      y: s,
      width: l,
      height: u
    }
  });
  if (t) {
    var v = r.getBaseAxis(), c = v.isHorizontal(), d = v.inverse;
    c ? (d && (h.shape.x += l), h.shape.width = 0) : (d || (h.shape.y += u), h.shape.height = 0);
    var y = G(n) ? function(p) {
      n(p, h);
    } : null;
    Ki(h, {
      shape: {
        width: l,
        height: u,
        x: o,
        y: s
      }
    }, e, null, i, y);
  }
  return h;
}
function iD(r, t, e) {
  var i = r.getArea(), n = wt(i.r0, 1), a = wt(i.r, 1), o = new vs({
    shape: {
      cx: wt(r.cx, 1),
      cy: wt(r.cy, 1),
      r0: n,
      r: a,
      startAngle: i.startAngle,
      endAngle: i.endAngle,
      clockwise: i.clockwise
    }
  });
  if (t) {
    var s = r.getBaseAxis().dim === "angle";
    s ? o.shape.endAngle = i.startAngle : o.shape.r = n, Ki(o, {
      shape: {
        endAngle: i.endAngle,
        r: a
      }
    }, e);
  }
  return o;
}
function Km(r, t) {
  return r.type === t;
}
function Fd(r, t) {
  if (r.length === t.length) {
    for (var e = 0; e < r.length; e++)
      if (r[e] !== t[e])
        return;
    return !0;
  }
}
function zd(r) {
  for (var t = 1 / 0, e = 1 / 0, i = -1 / 0, n = -1 / 0, a = 0; a < r.length; ) {
    var o = r[a++], s = r[a++];
    isNaN(o) || (t = Math.min(o, t), i = Math.max(o, i)), isNaN(s) || (e = Math.min(s, e), n = Math.max(s, n));
  }
  return [[t, e], [i, n]];
}
function Hd(r, t) {
  var e = zd(r), i = e[0], n = e[1], a = zd(t), o = a[0], s = a[1];
  return Math.max(Math.abs(i[0] - o[0]), Math.abs(i[1] - o[1]), Math.abs(n[0] - s[0]), Math.abs(n[1] - s[1]));
}
function $d(r) {
  return vt(r) ? r : r ? 0.5 : 0;
}
function nD(r, t, e) {
  if (!e.valueDim)
    return [];
  for (var i = t.count(), n = Li(i * 2), a = 0; a < i; a++) {
    var o = Zm(e, r, t, a);
    n[a * 2] = o[0], n[a * 2 + 1] = o[1];
  }
  return n;
}
function er(r, t, e, i, n) {
  var a = e.getBaseAxis(), o = a.dim === "x" || a.dim === "radius" ? 0 : 1, s = [], l = 0, u = [], f = [], h = [], v = [];
  if (n) {
    for (l = 0; l < r.length; l += 2) {
      var c = t || r;
      !isNaN(c[l]) && !isNaN(c[l + 1]) && v.push(r[l], r[l + 1]);
    }
    r = v;
  }
  for (l = 0; l < r.length - 2; l += 2)
    switch (h[0] = r[l + 2], h[1] = r[l + 3], f[0] = r[l], f[1] = r[l + 1], s.push(f[0], f[1]), i) {
      case "end":
        u[o] = h[o], u[1 - o] = f[1 - o], s.push(u[0], u[1]);
        break;
      case "middle":
        var d = (f[o] + h[o]) / 2, y = [];
        u[o] = y[o] = d, u[1 - o] = f[1 - o], y[1 - o] = h[1 - o], s.push(u[0], u[1]), s.push(y[0], y[1]);
        break;
      default:
        u[o] = f[o], u[1 - o] = h[1 - o], s.push(u[0], u[1]);
    }
  return s.push(r[l++], r[l++]), s;
}
function aD(r, t) {
  var e = [], i = r.length, n, a;
  function o(f, h, v) {
    var c = f.coord, d = (v - c) / (h.coord - c), y = s1(d, [f.color, h.color]);
    return {
      coord: v,
      color: y
    };
  }
  for (var s = 0; s < i; s++) {
    var l = r[s], u = l.coord;
    if (u < 0)
      n = l;
    else if (u > t) {
      a ? e.push(o(a, l, t)) : n && e.push(o(n, l, 0), o(n, l, t));
      break;
    } else
      n && (e.push(o(n, l, 0)), n = null), e.push(l), a = l;
  }
  return e;
}
function oD(r, t, e) {
  var i = r.getVisual("visualMeta");
  if (!(!i || !i.length || !r.count()) && t.type === "cartesian2d") {
    for (var n, a, o = i.length - 1; o >= 0; o--) {
      var s = r.getDimensionInfo(i[o].dimension);
      if (n = s && s.coordDim, n === "x" || n === "y") {
        a = i[o];
        break;
      }
    }
    if (a) {
      var l = t.getAxis(n), u = H(a.stops, function(_) {
        return {
          coord: l.toGlobalCoord(l.dataToCoord(_.value)),
          color: _.color
        };
      }), f = u.length, h = a.outerColors.slice();
      f && u[0].coord > u[f - 1].coord && (u.reverse(), h.reverse());
      var v = aD(u, n === "x" ? e.getWidth() : e.getHeight()), c = v.length;
      if (!c && f)
        return u[0].coord < 0 ? h[1] ? h[1] : u[f - 1].color : h[0] ? h[0] : u[0].color;
      var d = 10, y = v[0].coord - d, p = v[c - 1].coord + d, g = p - y;
      if (g < 1e-3)
        return "transparent";
      A(v, function(_) {
        _.offset = (_.coord - y) / g;
      }), v.push({
        // NOTE: inRangeStopLen may still be 0 if stoplen is zero.
        offset: c ? v[c - 1].offset : 0.5,
        color: h[1] || "transparent"
      }), v.unshift({
        offset: c ? v[0].offset : 0.5,
        color: h[0] || "transparent"
      });
      var m = new Qg(0, 0, 0, 0, v, !0);
      return m[n] = y, m[n + "2"] = p, m;
    }
  }
}
function sD(r, t, e) {
  var i = r.get("showAllSymbol"), n = i === "auto";
  if (!(i && !n)) {
    var a = e.getAxesByScale("ordinal")[0];
    if (a && !(n && lD(a, t))) {
      var o = t.mapDimension(a.dim), s = {};
      return A(a.getViewLabels(), function(l) {
        var u = a.scale.getRawOrdinalNumber(l.tickValue);
        s[u] = 1;
      }), function(l) {
        return !s.hasOwnProperty(t.get(o, l));
      };
    }
  }
}
function lD(r, t) {
  var e = r.getExtent(), i = Math.abs(e[1] - e[0]) / r.scale.count();
  isNaN(i) && (i = 0);
  for (var n = t.count(), a = Math.max(1, Math.round(n / 5)), o = 0; o < n; o += a)
    if (Mh.getSymbolSize(
      t,
      o
      // Only for cartesian, where `isHorizontal` exists.
    )[r.isHorizontal() ? 1 : 0] * 1.5 > i)
      return !1;
  return !0;
}
function uD(r, t) {
  return isNaN(r) || isNaN(t);
}
function fD(r) {
  for (var t = r.length / 2; t > 0 && uD(r[t * 2 - 2], r[t * 2 - 1]); t--)
    ;
  return t - 1;
}
function Vd(r, t) {
  return [r[t * 2], r[t * 2 + 1]];
}
function hD(r, t, e) {
  for (var i = r.length / 2, n = e === "x" ? 0 : 1, a, o, s = 0, l = -1, u = 0; u < i; u++)
    if (o = r[u * 2 + n], !(isNaN(o) || isNaN(r[u * 2 + 1 - n]))) {
      if (u === 0) {
        a = o;
        continue;
      }
      if (a <= t && o >= t || a >= t && o <= t) {
        l = u;
        break;
      }
      s = u, a = o;
    }
  return {
    range: [s, l],
    t: (t - a) / (o - a)
  };
}
function jm(r) {
  if (r.get(["endLabel", "show"]))
    return !0;
  for (var t = 0; t < fe.length; t++)
    if (r.get([fe[t], "endLabel", "show"]))
      return !0;
  return !1;
}
function Xl(r, t, e, i) {
  if (Km(t, "cartesian2d")) {
    var n = i.getModel("endLabel"), a = n.get("valueAnimation"), o = i.getData(), s = {
      lastFrameIndex: 0
    }, l = jm(i) ? function(c, d) {
      r._endLabelOnDuring(c, d, o, s, a, n, t);
    } : null, u = t.getBaseAxis().isHorizontal(), f = rD(t, e, i, function() {
      var c = r._endLabel;
      c && e && s.originalX != null && c.attr({
        x: s.originalX,
        y: s.originalY
      });
    }, l);
    if (!i.get("clip", !0)) {
      var h = f.shape, v = Math.max(h.width, h.height);
      u ? (h.y -= v, h.height += v * 2) : (h.x -= v, h.width += v * 2);
    }
    return l && l(1, f), f;
  } else
    return iD(t, e, i);
}
function cD(r, t) {
  var e = t.getBaseAxis(), i = e.isHorizontal(), n = e.inverse, a = i ? n ? "right" : "left" : "center", o = i ? "middle" : n ? "top" : "bottom";
  return {
    normal: {
      align: r.get("align") || a,
      verticalAlign: r.get("verticalAlign") || o
    }
  };
}
var vD = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      return r !== null && r.apply(this, arguments) || this;
    }
    return t.prototype.init = function() {
      var e = new Dt(), i = new Ym();
      this.group.add(i.group), this._symbolDraw = i, this._lineGroup = e, this._changePolyState = dt(this._changePolyState, this);
    }, t.prototype.render = function(e, i, n) {
      var a = e.coordinateSystem, o = this.group, s = e.getData(), l = e.getModel("lineStyle"), u = e.getModel("areaStyle"), f = s.getLayout("points") || [], h = a.type === "polar", v = this._coordSys, c = this._symbolDraw, d = this._polyline, y = this._polygon, p = this._lineGroup, g = !i.ssr && e.get("animation"), m = !u.isEmpty(), _ = u.get("origin"), S = Xm(a, s, _), w = m && nD(a, s, S), b = e.get("showSymbol"), x = e.get("connectNulls"), D = b && !h && sD(e, s, a), T = this._data;
      T && T.eachItemGraphicEl(function(ct, Nt) {
        ct.__temp && (o.remove(ct), T.setItemGraphicEl(Nt, null));
      }), b || c.remove(), o.add(p);
      var C = h ? !1 : e.get("step"), M;
      a && a.getArea && e.get("clip", !0) && (M = a.getArea(), M.width != null ? (M.x -= 0.1, M.y -= 0.1, M.width += 0.2, M.height += 0.2) : M.r0 && (M.r0 -= 0.5, M.r += 0.5)), this._clipShapeForSymbol = M;
      var L = oD(s, a, n) || s.getVisual("style")[s.getVisual("drawType")];
      if (!(d && v.type === a.type && C === this._step))
        b && c.updateData(s, {
          isIgnore: D,
          clipShape: M,
          disableAnimation: !0,
          getSymbolPoint: function(ct) {
            return [f[ct * 2], f[ct * 2 + 1]];
          }
        }), g && this._initSymbolLabelAnimation(s, a, M), C && (w && (w = er(w, f, a, C, x)), f = er(f, null, a, C, x)), d = this._newPolyline(f), m ? y = this._newPolygon(f, w) : y && (p.remove(y), y = this._polygon = null), h || this._initOrUpdateEndLabel(e, a, ei(L)), p.setClipPath(Xl(this, a, !0, e));
      else {
        m && !y ? y = this._newPolygon(f, w) : y && !m && (p.remove(y), y = this._polygon = null), h || this._initOrUpdateEndLabel(e, a, ei(L));
        var P = p.getClipPath();
        if (P) {
          var I = Xl(this, a, !1, e);
          Ki(P, {
            shape: I.shape
          }, e);
        } else
          p.setClipPath(Xl(this, a, !0, e));
        b && c.updateData(s, {
          isIgnore: D,
          clipShape: M,
          disableAnimation: !0,
          getSymbolPoint: function(ct) {
            return [f[ct * 2], f[ct * 2 + 1]];
          }
        }), (!Fd(this._stackedOnPoints, w) || !Fd(this._points, f)) && (g ? this._doUpdateAnimation(s, w, a, n, C, _, x) : (C && (w && (w = er(w, f, a, C, x)), f = er(f, null, a, C, x)), d.setShape({
          points: f
        }), y && y.setShape({
          points: f,
          stackedOnPoints: w
        })));
      }
      var E = e.getModel("emphasis"), R = E.get("focus"), V = E.get("blurScope"), B = E.get("disabled");
      if (d.useStyle(ot(
        // Use color in lineStyle first
        l.getLineStyle(),
        {
          fill: "none",
          stroke: L,
          lineJoin: "bevel"
        }
      )), iv(d, e, "lineStyle"), d.style.lineWidth > 0 && e.get(["emphasis", "lineStyle", "width"]) === "bolder") {
        var F = d.getState("emphasis").style;
        F.lineWidth = +d.style.lineWidth + 1;
      }
      et(d).seriesIndex = e.seriesIndex, zo(d, R, V, B);
      var $ = $d(e.get("smooth")), J = e.get("smoothMonotone");
      if (d.setShape({
        smooth: $,
        smoothMonotone: J,
        connectNulls: x
      }), y) {
        var j = s.getCalculationInfo("stackedOnSeries"), lt = 0;
        y.useStyle(ot(u.getAreaStyle(), {
          fill: L,
          opacity: 0.7,
          lineJoin: "bevel",
          decal: s.getVisual("style").decal
        })), j && (lt = $d(j.get("smooth"))), y.setShape({
          smooth: $,
          stackedOnSmooth: lt,
          smoothMonotone: J,
          connectNulls: x
        }), iv(y, e, "areaStyle"), et(y).seriesIndex = e.seriesIndex, zo(y, R, V, B);
      }
      var ft = this._changePolyState;
      s.eachItemGraphicEl(function(ct) {
        ct && (ct.onHoverStateChange = ft);
      }), this._polyline.onHoverStateChange = ft, this._data = s, this._coordSys = a, this._stackedOnPoints = w, this._points = f, this._step = C, this._valueOrigin = _, e.get("triggerLineEvent") && (this.packEventData(e, d), y && this.packEventData(e, y));
    }, t.prototype.packEventData = function(e, i) {
      et(i).eventData = {
        componentType: "series",
        componentSubType: "line",
        componentIndex: e.componentIndex,
        seriesIndex: e.seriesIndex,
        seriesName: e.name,
        seriesType: "line"
      };
    }, t.prototype.highlight = function(e, i, n, a) {
      var o = e.getData(), s = Jr(o, a);
      if (this._changePolyState("emphasis"), !(s instanceof Array) && s != null && s >= 0) {
        var l = o.getLayout("points"), u = o.getItemGraphicEl(s);
        if (!u) {
          var f = l[s * 2], h = l[s * 2 + 1];
          if (isNaN(f) || isNaN(h) || this._clipShapeForSymbol && !this._clipShapeForSymbol.contain(f, h))
            return;
          var v = e.get("zlevel") || 0, c = e.get("z") || 0;
          u = new Mh(o, s), u.x = f, u.y = h, u.setZ(v, c);
          var d = u.getSymbolPath().getTextContent();
          d && (d.zlevel = v, d.z = c, d.z2 = this._polyline.z2 + 1), u.__temp = !0, o.setItemGraphicEl(s, u), u.stopSymbolAnimation(!0), this.group.add(u);
        }
        u.highlight();
      } else
        Pe.prototype.highlight.call(this, e, i, n, a);
    }, t.prototype.downplay = function(e, i, n, a) {
      var o = e.getData(), s = Jr(o, a);
      if (this._changePolyState("normal"), s != null && s >= 0) {
        var l = o.getItemGraphicEl(s);
        l && (l.__temp ? (o.setItemGraphicEl(s, null), this.group.remove(l)) : l.downplay());
      } else
        Pe.prototype.downplay.call(this, e, i, n, a);
    }, t.prototype._changePolyState = function(e) {
      var i = this._polygon;
      Qc(this._polyline, e), i && Qc(i, e);
    }, t.prototype._newPolyline = function(e) {
      var i = this._polyline;
      return i && this._lineGroup.remove(i), i = new JM({
        shape: {
          points: e
        },
        segmentIgnoreThreshold: 2,
        z2: 10
      }), this._lineGroup.add(i), this._polyline = i, i;
    }, t.prototype._newPolygon = function(e, i) {
      var n = this._polygon;
      return n && this._lineGroup.remove(n), n = new eD({
        shape: {
          points: e,
          stackedOnPoints: i
        },
        segmentIgnoreThreshold: 2
      }), this._lineGroup.add(n), this._polygon = n, n;
    }, t.prototype._initSymbolLabelAnimation = function(e, i, n) {
      var a, o, s = i.getBaseAxis(), l = s.inverse;
      i.type === "cartesian2d" ? (a = s.isHorizontal(), o = !1) : i.type === "polar" && (a = s.dim === "angle", o = !0);
      var u = e.hostModel, f = u.get("animationDuration");
      G(f) && (f = f(null));
      var h = u.get("animationDelay") || 0, v = G(h) ? h(null) : h;
      e.eachItemGraphicEl(function(c, d) {
        var y = c;
        if (y) {
          var p = [c.x, c.y], g = void 0, m = void 0, _ = void 0;
          if (n)
            if (o) {
              var S = n, w = i.pointToCoord(p);
              a ? (g = S.startAngle, m = S.endAngle, _ = -w[1] / 180 * Math.PI) : (g = S.r0, m = S.r, _ = w[0]);
            } else {
              var b = n;
              a ? (g = b.x, m = b.x + b.width, _ = c.x) : (g = b.y + b.height, m = b.y, _ = c.y);
            }
          var x = m === g ? 0 : (_ - g) / (m - g);
          l && (x = 1 - x);
          var D = G(h) ? h(d) : f * x + v, T = y.getSymbolPath(), C = T.getTextContent();
          y.attr({
            scaleX: 0,
            scaleY: 0
          }), y.animateTo({
            scaleX: 1,
            scaleY: 1
          }, {
            duration: 200,
            setToFinal: !0,
            delay: D
          }), C && C.animateFrom({
            style: {
              opacity: 0
            }
          }, {
            duration: 300,
            delay: D
          }), T.disableLabelAnimation = !0;
        }
      });
    }, t.prototype._initOrUpdateEndLabel = function(e, i, n) {
      var a = e.getModel("endLabel");
      if (jm(e)) {
        var o = e.getData(), s = this._polyline, l = o.getLayout("points");
        if (!l) {
          s.removeTextContent(), this._endLabel = null;
          return;
        }
        var u = this._endLabel;
        u || (u = this._endLabel = new Zt({
          z2: 200
          // should be higher than item symbol
        }), u.ignoreClip = !0, s.setTextContent(this._endLabel), s.disableLabelAnimation = !0);
        var f = fD(l);
        f >= 0 && (_s(s, _a(e, "endLabel"), {
          inheritColor: n,
          labelFetcher: e,
          labelDataIndex: f,
          defaultText: function(h, v, c) {
            return c != null ? ZM(o, c) : Um(o, h);
          },
          enableTextSetter: !0
        }, cD(a, i)), s.textConfig.position = null);
      } else this._endLabel && (this._polyline.removeTextContent(), this._endLabel = null);
    }, t.prototype._endLabelOnDuring = function(e, i, n, a, o, s, l) {
      var u = this._endLabel, f = this._polyline;
      if (u) {
        e < 1 && a.originalX == null && (a.originalX = u.x, a.originalY = u.y);
        var h = n.getLayout("points"), v = n.hostModel, c = v.get("connectNulls"), d = s.get("precision"), y = s.get("distance") || 0, p = l.getBaseAxis(), g = p.isHorizontal(), m = p.inverse, _ = i.shape, S = m ? g ? _.x : _.y + _.height : g ? _.x + _.width : _.y, w = (g ? y : 0) * (m ? -1 : 1), b = (g ? 0 : -y) * (m ? -1 : 1), x = g ? "x" : "y", D = hD(h, S, x), T = D.range, C = T[1] - T[0], M = void 0;
        if (C >= 1) {
          if (C > 1 && !c) {
            var L = Vd(h, T[0]);
            u.attr({
              x: L[0] + w,
              y: L[1] + b
            }), o && (M = v.getRawValue(T[0]));
          } else {
            var L = f.getPointOn(S, x);
            L && u.attr({
              x: L[0] + w,
              y: L[1] + b
            });
            var P = v.getRawValue(T[0]), I = v.getRawValue(T[1]);
            o && (M = rS(n, d, P, I, D.t));
          }
          a.lastFrameIndex = T[0];
        } else {
          var E = e === 1 || a.lastFrameIndex > 0 ? T[0] : 0, L = Vd(h, E);
          o && (M = v.getRawValue(E)), u.attr({
            x: L[0] + w,
            y: L[1] + b
          });
        }
        if (o) {
          var R = ny(u);
          typeof R.setLabelText == "function" && R.setLabelText(M);
        }
      }
    }, t.prototype._doUpdateAnimation = function(e, i, n, a, o, s, l) {
      var u = this._polyline, f = this._polygon, h = e.hostModel, v = QM(this._data, e, this._stackedOnPoints, i, this._coordSys, n, this._valueOrigin), c = v.current, d = v.stackedOnCurrent, y = v.next, p = v.stackedOnNext;
      if (o && (d = er(v.stackedOnCurrent, v.current, n, o, l), c = er(v.current, null, n, o, l), p = er(v.stackedOnNext, v.next, n, o, l), y = er(v.next, null, n, o, l)), Hd(c, y) > 3e3 || f && Hd(d, p) > 3e3) {
        u.stopAnimation(), u.setShape({
          points: y
        }), f && (f.stopAnimation(), f.setShape({
          points: y,
          stackedOnPoints: p
        }));
        return;
      }
      u.shape.__points = v.current, u.shape.points = c;
      var g = {
        shape: {
          points: y
        }
      };
      v.current !== c && (g.shape.__points = v.next), u.stopAnimation(), We(u, g, h), f && (f.setShape({
        // Reuse the points with polyline.
        points: c,
        stackedOnPoints: d
      }), f.stopAnimation(), We(f, {
        shape: {
          stackedOnPoints: p
        }
      }, h), u.shape.points !== f.shape.points && (f.shape.points = u.shape.points));
      for (var m = [], _ = v.status, S = 0; S < _.length; S++) {
        var w = _[S].cmd;
        if (w === "=") {
          var b = e.getItemGraphicEl(_[S].idx1);
          b && m.push({
            el: b,
            ptIdx: S
            // Index of points
          });
        }
      }
      u.animators && u.animators.length && u.animators[0].during(function() {
        f && f.dirtyShape();
        for (var x = u.shape.__points, D = 0; D < m.length; D++) {
          var T = m[D].el, C = m[D].ptIdx * 2;
          T.x = x[C], T.y = x[C + 1], T.markRedraw();
        }
      });
    }, t.prototype.remove = function(e) {
      var i = this.group, n = this._data;
      this._lineGroup.removeAll(), this._symbolDraw.remove(!0), n && n.eachItemGraphicEl(function(a, o) {
        a.__temp && (i.remove(a), n.setItemGraphicEl(o, null));
      }), this._polyline = this._polygon = this._coordSys = this._points = this._stackedOnPoints = this._endLabel = this._data = null;
    }, t.type = "line", t;
  })(Pe)
);
function dD(r, t) {
  return {
    seriesType: r,
    plan: Uy(),
    reset: function(e) {
      var i = e.getData(), n = e.coordinateSystem;
      if (e.pipelineContext, !!n) {
        var a = H(n.dimensions, function(h) {
          return i.mapDimension(h);
        }).slice(0, 2), o = a.length, s = i.getCalculationInfo("stackResultDimension");
        Yi(i, a[0]) && (a[0] = s), Yi(i, a[1]) && (a[1] = s);
        var l = i.getStore(), u = i.getDimensionIndex(a[0]), f = i.getDimensionIndex(a[1]);
        return o && {
          progress: function(h, v) {
            for (var c = h.end - h.start, d = Li(c * o), y = [], p = [], g = h.start, m = 0; g < h.end; g++) {
              var _ = void 0;
              if (o === 1) {
                var S = l.get(u, g);
                _ = n.dataToPoint(S, null, p);
              } else
                y[0] = l.get(u, g), y[1] = l.get(f, g), _ = n.dataToPoint(y, null, p);
              d[m++] = _[0], d[m++] = _[1];
            }
            v.setLayout("points", d);
          }
        };
      }
    }
  };
}
var pD = {
  average: function(r) {
    for (var t = 0, e = 0, i = 0; i < r.length; i++)
      isNaN(r[i]) || (t += r[i], e++);
    return e === 0 ? NaN : t / e;
  },
  sum: function(r) {
    for (var t = 0, e = 0; e < r.length; e++)
      t += r[e] || 0;
    return t;
  },
  max: function(r) {
    for (var t = -1 / 0, e = 0; e < r.length; e++)
      r[e] > t && (t = r[e]);
    return isFinite(t) ? t : NaN;
  },
  min: function(r) {
    for (var t = 1 / 0, e = 0; e < r.length; e++)
      r[e] < t && (t = r[e]);
    return isFinite(t) ? t : NaN;
  },
  // TODO
  // Median
  nearest: function(r) {
    return r[0];
  }
}, gD = function(r) {
  return Math.round(r.length / 2);
};
function yD(r) {
  return {
    seriesType: r,
    // FIXME:TS never used, so comment it
    // modifyOutputEnd: true,
    reset: function(t, e, i) {
      var n = t.getData(), a = t.get("sampling"), o = t.coordinateSystem, s = n.count();
      if (s > 10 && o.type === "cartesian2d" && a) {
        var l = o.getBaseAxis(), u = o.getOtherAxis(l), f = l.getExtent(), h = i.getDevicePixelRatio(), v = Math.abs(f[1] - f[0]) * (h || 1), c = Math.round(s / v);
        if (isFinite(c) && c > 1) {
          a === "lttb" ? t.setData(n.lttbDownSample(n.mapDimension(u.dim), 1 / c)) : a === "minmax" && t.setData(n.minmaxDownSample(n.mapDimension(u.dim), 1 / c));
          var d = void 0;
          z(a) ? d = pD[a] : G(a) && (d = a), d && t.setData(n.downSample(n.mapDimension(u.dim), 1 / c, d, gD));
        }
      }
    }
  };
}
function mD(r) {
  r.registerChartView(vD), r.registerSeriesModel(XM), r.registerLayout(dD("line")), r.registerVisual({
    seriesType: "line",
    reset: function(t) {
      var e = t.getData(), i = t.getModel("lineStyle").getLineStyle();
      i && !i.stroke && (i.stroke = e.getVisual("style").fill), e.setVisual("legendLineStyle", i);
    }
  }), r.registerProcessor(r.PRIORITY.PROCESSOR.STATISTIC, yD("line"));
}
var _D = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      return r !== null && r.apply(this, arguments) || this;
    }
    return t.type = "grid", t.dependencies = ["xAxis", "yAxis"], t.layoutMode = "box", t.defaultOption = {
      show: !1,
      // zlevel: 0,
      z: 0,
      left: "10%",
      top: 60,
      right: "10%",
      bottom: 70,
      // If grid size contain label
      containLabel: !1,
      // width: {totalWidth} - left - right,
      // height: {totalHeight} - top - bottom,
      backgroundColor: "rgba(0,0,0,0)",
      borderWidth: 1,
      borderColor: "#ccc"
    }, t;
  })(at)
), af = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      return r !== null && r.apply(this, arguments) || this;
    }
    return t.prototype.getCoordSysModel = function() {
      return this.getReferringComponents("grid", ye).models[0];
    }, t.type = "cartesian2dAxis", t;
  })(at)
);
_e(af, RM);
var Qm = {
  show: !0,
  // zlevel: 0,
  z: 0,
  // Inverse the axis.
  inverse: !1,
  // Axis name displayed.
  name: "",
  // 'start' | 'middle' | 'end'
  nameLocation: "end",
  // By degree. By default auto rotate by nameLocation.
  nameRotate: null,
  nameTruncate: {
    maxWidth: null,
    ellipsis: "...",
    placeholder: "."
  },
  // Use global text style by default.
  nameTextStyle: {},
  // The gap between axisName and axisLine.
  nameGap: 15,
  // Default `false` to support tooltip.
  silent: !1,
  // Default `false` to avoid legacy user event listener fail.
  triggerEvent: !1,
  tooltip: {
    show: !1
  },
  axisPointer: {},
  axisLine: {
    show: !0,
    onZero: !0,
    onZeroAxisIndex: null,
    lineStyle: {
      color: "#6E7079",
      width: 1,
      type: "solid"
    },
    // The arrow at both ends the the axis.
    symbol: ["none", "none"],
    symbolSize: [10, 15]
  },
  axisTick: {
    show: !0,
    // Whether axisTick is inside the grid or outside the grid.
    inside: !1,
    // The length of axisTick.
    length: 5,
    lineStyle: {
      width: 1
    }
  },
  axisLabel: {
    show: !0,
    // Whether axisLabel is inside the grid or outside the grid.
    inside: !1,
    rotate: 0,
    // true | false | null/undefined (auto)
    showMinLabel: null,
    // true | false | null/undefined (auto)
    showMaxLabel: null,
    margin: 8,
    // formatter: null,
    fontSize: 12
  },
  splitLine: {
    show: !0,
    showMinLine: !0,
    showMaxLine: !0,
    lineStyle: {
      color: ["#E0E6F1"],
      width: 1,
      type: "solid"
    }
  },
  splitArea: {
    show: !1,
    areaStyle: {
      color: ["rgba(250,250,250,0.2)", "rgba(210,219,238,0.2)"]
    }
  }
}, SD = Q({
  // The gap at both ends of the axis. For categoryAxis, boolean.
  boundaryGap: !0,
  // Set false to faster category collection.
  deduplication: null,
  // splitArea: {
  // show: false
  // },
  splitLine: {
    show: !1
  },
  axisTick: {
    // If tick is align with label when boundaryGap is true
    alignWithLabel: !1,
    interval: "auto"
  },
  axisLabel: {
    interval: "auto"
  }
}, Qm), Dh = Q({
  boundaryGap: [0, 0],
  axisLine: {
    // Not shown when other axis is categoryAxis in cartesian
    show: "auto"
  },
  axisTick: {
    // Not shown when other axis is categoryAxis in cartesian
    show: "auto"
  },
  // TODO
  // min/max: [30, datamin, 60] or [20, datamin] or [datamin, 60]
  splitNumber: 5,
  minorTick: {
    // Minor tick, not available for cateogry axis.
    show: !1,
    // Split number of minor ticks. The value should be in range of (0, 100)
    splitNumber: 5,
    // Length of minor tick
    length: 3,
    // Line style
    lineStyle: {
      // Default to be same with axisTick
    }
  },
  minorSplitLine: {
    show: !1,
    lineStyle: {
      color: "#F4F7FD",
      width: 1
    }
  }
}, Qm), bD = Q({
  splitNumber: 6,
  axisLabel: {
    // To eliminate labels that are not nice
    showMinLabel: !1,
    showMaxLabel: !1,
    rich: {
      primary: {
        fontWeight: "bold"
      }
    }
  },
  splitLine: {
    show: !1
  }
}, Dh), wD = ot({
  logBase: 10
}, Dh);
const xD = {
  category: SD,
  value: Dh,
  time: bD,
  log: wD
};
var TD = {
  value: 1,
  category: 1,
  time: 1,
  log: 1
};
function Gd(r, t, e, i) {
  A(TD, function(n, a) {
    var o = Q(Q({}, xD[a], !0), i, !0), s = (
      /** @class */
      (function(l) {
        O(u, l);
        function u() {
          var f = l !== null && l.apply(this, arguments) || this;
          return f.type = t + "Axis." + a, f;
        }
        return u.prototype.mergeDefaultAndTheme = function(f, h) {
          var v = sa(this), c = v ? Ds(f) : {}, d = h.getTheme();
          Q(f, d.get(a + "Axis")), Q(f, this.getDefaultOption()), f.type = Wd(f), v && Wi(f, c, v);
        }, u.prototype.optionUpdated = function() {
          var f = this.option;
          f.type === "category" && (this.__ordinalMeta = ef.createByAxisModel(this));
        }, u.prototype.getCategories = function(f) {
          var h = this.option;
          if (h.type === "category")
            return f ? h.data : this.__ordinalMeta.categories;
        }, u.prototype.getOrdinalMeta = function() {
          return this.__ordinalMeta;
        }, u.type = t + "Axis." + a, u.defaultOption = o, u;
      })(e)
    );
    r.registerComponentModel(s);
  }), r.registerSubTypeDefaulter(t + "Axis", Wd);
}
function Wd(r) {
  return r.type || (r.data ? "category" : "value");
}
var CD = (
  /** @class */
  (function() {
    function r(t) {
      this.type = "cartesian", this._dimList = [], this._axes = {}, this.name = t || "";
    }
    return r.prototype.getAxis = function(t) {
      return this._axes[t];
    }, r.prototype.getAxes = function() {
      return H(this._dimList, function(t) {
        return this._axes[t];
      }, this);
    }, r.prototype.getAxesByScale = function(t) {
      return t = t.toLowerCase(), xt(this.getAxes(), function(e) {
        return e.scale.type === t;
      });
    }, r.prototype.addAxis = function(t) {
      var e = t.dim;
      this._axes[e] = t, this._dimList.push(e);
    }, r;
  })()
), of = ["x", "y"];
function Ud(r) {
  return r.type === "interval" || r.type === "time";
}
var MD = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = "cartesian2d", e.dimensions = of, e;
    }
    return t.prototype.calcAffineTransform = function() {
      this._transform = this._invTransform = null;
      var e = this.getAxis("x").scale, i = this.getAxis("y").scale;
      if (!(!Ud(e) || !Ud(i))) {
        var n = e.getExtent(), a = i.getExtent(), o = this.dataToPoint([n[0], a[0]]), s = this.dataToPoint([n[1], a[1]]), l = n[1] - n[0], u = a[1] - a[0];
        if (!(!l || !u)) {
          var f = (s[0] - o[0]) / l, h = (s[1] - o[1]) / u, v = o[0] - n[0] * f, c = o[1] - a[0] * h, d = this._transform = [f, 0, 0, h, v, c];
          this._invTransform = kf([], d);
        }
      }
    }, t.prototype.getBaseAxis = function() {
      return this.getAxesByScale("ordinal")[0] || this.getAxesByScale("time")[0] || this.getAxis("x");
    }, t.prototype.containPoint = function(e) {
      var i = this.getAxis("x"), n = this.getAxis("y");
      return i.contain(i.toLocalCoord(e[0])) && n.contain(n.toLocalCoord(e[1]));
    }, t.prototype.containData = function(e) {
      return this.getAxis("x").containData(e[0]) && this.getAxis("y").containData(e[1]);
    }, t.prototype.containZone = function(e, i) {
      var n = this.dataToPoint(e), a = this.dataToPoint(i), o = this.getArea(), s = new it(n[0], n[1], a[0] - n[0], a[1] - n[1]);
      return o.intersect(s);
    }, t.prototype.dataToPoint = function(e, i, n) {
      n = n || [];
      var a = e[0], o = e[1];
      if (this._transform && a != null && isFinite(a) && o != null && isFinite(o))
        return ue(n, e, this._transform);
      var s = this.getAxis("x"), l = this.getAxis("y");
      return n[0] = s.toGlobalCoord(s.dataToCoord(a, i)), n[1] = l.toGlobalCoord(l.dataToCoord(o, i)), n;
    }, t.prototype.clampData = function(e, i) {
      var n = this.getAxis("x").scale, a = this.getAxis("y").scale, o = n.getExtent(), s = a.getExtent(), l = n.parse(e[0]), u = a.parse(e[1]);
      return i = i || [], i[0] = Math.min(Math.max(Math.min(o[0], o[1]), l), Math.max(o[0], o[1])), i[1] = Math.min(Math.max(Math.min(s[0], s[1]), u), Math.max(s[0], s[1])), i;
    }, t.prototype.pointToData = function(e, i) {
      var n = [];
      if (this._invTransform)
        return ue(n, e, this._invTransform);
      var a = this.getAxis("x"), o = this.getAxis("y");
      return n[0] = a.coordToData(a.toLocalCoord(e[0]), i), n[1] = o.coordToData(o.toLocalCoord(e[1]), i), n;
    }, t.prototype.getOtherAxis = function(e) {
      return this.getAxis(e.dim === "x" ? "y" : "x");
    }, t.prototype.getArea = function(e) {
      e = e || 0;
      var i = this.getAxis("x").getGlobalExtent(), n = this.getAxis("y").getGlobalExtent(), a = Math.min(i[0], i[1]) - e, o = Math.min(n[0], n[1]) - e, s = Math.max(i[0], i[1]) - a + e, l = Math.max(n[0], n[1]) - o + e;
      return new it(a, o, s, l);
    }, t;
  })(CD)
), DD = (
  /** @class */
  (function(r) {
    O(t, r);
    function t(e, i, n, a, o) {
      var s = r.call(this, e, i, n) || this;
      return s.index = 0, s.type = a || "value", s.position = o || "bottom", s;
    }
    return t.prototype.isHorizontal = function() {
      var e = this.position;
      return e === "top" || e === "bottom";
    }, t.prototype.getGlobalExtent = function(e) {
      var i = this.getExtent();
      return i[0] = this.toGlobalCoord(i[0]), i[1] = this.toGlobalCoord(i[1]), e && i[0] > i[1] && i.reverse(), i;
    }, t.prototype.pointToData = function(e, i) {
      return this.coordToData(this.toLocalCoord(e[this.dim === "x" ? 0 : 1]), i);
    }, t.prototype.setCategorySortInfo = function(e) {
      if (this.type !== "category")
        return !1;
      this.model.option.categorySortInfo = e, this.scale.setSortInfo(e);
    }, t;
  })(GM)
);
function sf(r, t, e) {
  e = e || {};
  var i = r.coordinateSystem, n = t.axis, a = {}, o = n.getAxesOnZeroOf()[0], s = n.position, l = o ? "onZero" : s, u = n.dim, f = i.getRect(), h = [f.x, f.x + f.width, f.y, f.y + f.height], v = {
    left: 0,
    right: 1,
    top: 0,
    bottom: 1,
    onZero: 2
  }, c = t.get("offset") || 0, d = u === "x" ? [h[2] - c, h[3] + c] : [h[0] - c, h[1] + c];
  if (o) {
    var y = o.toGlobalCoord(o.dataToCoord(0));
    d[v.onZero] = Math.max(Math.min(y, d[1]), d[0]);
  }
  a.position = [u === "y" ? d[v[l]] : h[0], u === "x" ? d[v[l]] : h[3]], a.rotation = Math.PI / 2 * (u === "x" ? 0 : 1);
  var p = {
    top: -1,
    bottom: 1,
    left: -1,
    right: 1
  };
  a.labelDirection = a.tickDirection = a.nameDirection = p[s], a.labelOffset = o ? d[v[s]] - d[v.onZero] : 0, t.get(["axisTick", "inside"]) && (a.tickDirection = -a.tickDirection), Vi(e.labelInside, t.get(["axisLabel", "inside"])) && (a.labelDirection = -a.labelDirection);
  var g = t.get(["axisLabel", "rotate"]);
  return a.labelRotate = l === "top" ? -g : g, a.z2 = 1, a;
}
function Yd(r) {
  return r.get("coordinateSystem") === "cartesian2d";
}
function Xd(r) {
  var t = {
    xAxisModel: null,
    yAxisModel: null
  };
  return A(t, function(e, i) {
    var n = i.replace(/Model$/, ""), a = r.getReferringComponents(n, ye).models[0];
    t[i] = a;
  }), t;
}
var Zl = Math.log;
function AD(r, t, e) {
  var i = Ji.prototype, n = i.getTicks.call(e), a = i.getTicks.call(e, !0), o = n.length - 1, s = i.getInterval.call(e), l = Nm(r, t), u = l.extent, f = l.fixMin, h = l.fixMax;
  if (r.type === "log") {
    var v = Zl(r.base);
    u = [Zl(u[0]) / v, Zl(u[1]) / v];
  }
  r.setExtent(u[0], u[1]), r.calcNiceExtent({
    splitNumber: o,
    fixMin: f,
    fixMax: h
  });
  var c = i.getExtent.call(r);
  f && (u[0] = c[0]), h && (u[1] = c[1]);
  var d = i.getInterval.call(r), y = u[0], p = u[1];
  if (f && h)
    d = (p - y) / o;
  else if (f)
    for (p = u[0] + d * o; p < u[1] && isFinite(p) && isFinite(u[1]); )
      d = Ul(d), p = u[0] + d * o;
  else if (h)
    for (y = u[1] - d * o; y > u[0] && isFinite(y) && isFinite(u[0]); )
      d = Ul(d), y = u[1] - d * o;
  else {
    var g = r.getTicks().length - 1;
    g > o && (d = Ul(d));
    var m = d * o;
    p = Math.ceil(u[1] / d) * d, y = wt(p - m), y < 0 && u[0] >= 0 ? (y = 0, p = wt(m)) : p > 0 && u[1] <= 0 && (p = 0, y = -wt(m));
  }
  var _ = (n[0].value - a[0].value) / s, S = (n[o].value - a[o].value) / s;
  i.setExtent.call(r, y + d * _, p + d * S), i.setInterval.call(r, d), (_ || S) && i.setNiceExtent.call(r, y + d, p - d);
}
var LD = (
  /** @class */
  (function() {
    function r(t, e, i) {
      this.type = "grid", this._coordsMap = {}, this._coordsList = [], this._axesMap = {}, this._axesList = [], this.axisPointerEnabled = !0, this.dimensions = of, this._initCartesian(t, e, i), this.model = t;
    }
    return r.prototype.getRect = function() {
      return this._rect;
    }, r.prototype.update = function(t, e) {
      var i = this._axesMap;
      this._updateScale(t, this.model);
      function n(o) {
        var s, l = pt(o), u = l.length;
        if (u) {
          for (var f = [], h = u - 1; h >= 0; h--) {
            var v = +l[h], c = o[v], d = c.model, y = c.scale;
            // Only value and log axis without interval support alignTicks.
            rf(y) && d.get("alignTicks") && d.get("interval") == null ? f.push(c) : (Ed(y, d), rf(y) && (s = c));
          }
          f.length && (s || (s = f.pop(), Ed(s.scale, s.model)), A(f, function(p) {
            AD(p.scale, p.model, s.scale);
          }));
        }
      }
      n(i.x), n(i.y);
      var a = {};
      A(i.x, function(o) {
        Zd(i, "y", o, a);
      }), A(i.y, function(o) {
        Zd(i, "x", o, a);
      }), this.resize(this.model, e);
    }, r.prototype.resize = function(t, e, i) {
      var n = t.getBoxLayoutParams(), a = !i && t.get("containLabel"), o = Uo(n, {
        width: e.getWidth(),
        height: e.getHeight()
      });
      this._rect = o;
      var s = this._axesList;
      l(), a && (A(s, function(u) {
        if (!u.model.get(["axisLabel", "inside"])) {
          var f = PM(u);
          if (f) {
            var h = u.isHorizontal() ? "height" : "width", v = u.model.get(["axisLabel", "margin"]);
            o[h] -= f[h] + v, u.position === "top" ? o.y += f.height + v : u.position === "left" && (o.x += f.width + v);
          }
        }
      }), l()), A(this._coordsList, function(u) {
        u.calcAffineTransform();
      });
      function l() {
        A(s, function(u) {
          var f = u.isHorizontal(), h = f ? [0, o.width] : [0, o.height], v = u.inverse ? 1 : 0;
          u.setExtent(h[v], h[1 - v]), PD(u, f ? o.x : o.y);
        });
      }
    }, r.prototype.getAxis = function(t, e) {
      var i = this._axesMap[t];
      if (i != null)
        return i[e || 0];
    }, r.prototype.getAxes = function() {
      return this._axesList.slice();
    }, r.prototype.getCartesian = function(t, e) {
      if (t != null && e != null) {
        var i = "x" + t + "y" + e;
        return this._coordsMap[i];
      }
      W(t) && (e = t.yAxisIndex, t = t.xAxisIndex);
      for (var n = 0, a = this._coordsList; n < a.length; n++)
        if (a[n].getAxis("x").index === t || a[n].getAxis("y").index === e)
          return a[n];
    }, r.prototype.getCartesians = function() {
      return this._coordsList.slice();
    }, r.prototype.convertToPixel = function(t, e, i) {
      var n = this._findConvertTarget(e);
      return n.cartesian ? n.cartesian.dataToPoint(i) : n.axis ? n.axis.toGlobalCoord(n.axis.dataToCoord(i)) : null;
    }, r.prototype.convertFromPixel = function(t, e, i) {
      var n = this._findConvertTarget(e);
      return n.cartesian ? n.cartesian.pointToData(i) : n.axis ? n.axis.coordToData(n.axis.toLocalCoord(i)) : null;
    }, r.prototype._findConvertTarget = function(t) {
      var e = t.seriesModel, i = t.xAxisModel || e && e.getReferringComponents("xAxis", ye).models[0], n = t.yAxisModel || e && e.getReferringComponents("yAxis", ye).models[0], a = t.gridModel, o = this._coordsList, s, l;
      if (e)
        s = e.coordinateSystem, rt(o, s) < 0 && (s = null);
      else if (i && n)
        s = this.getCartesian(i.componentIndex, n.componentIndex);
      else if (i)
        l = this.getAxis("x", i.componentIndex);
      else if (n)
        l = this.getAxis("y", n.componentIndex);
      else if (a) {
        var u = a.coordinateSystem;
        u === this && (s = this._coordsList[0]);
      }
      return {
        cartesian: s,
        axis: l
      };
    }, r.prototype.containPoint = function(t) {
      var e = this._coordsList[0];
      if (e)
        return e.containPoint(t);
    }, r.prototype._initCartesian = function(t, e, i) {
      var n = this, a = this, o = {
        left: !1,
        right: !1,
        top: !1,
        bottom: !1
      }, s = {
        x: {},
        y: {}
      }, l = {
        x: 0,
        y: 0
      };
      if (e.eachComponent("xAxis", u("x"), this), e.eachComponent("yAxis", u("y"), this), !l.x || !l.y) {
        this._axesMap = {}, this._axesList = [];
        return;
      }
      this._axesMap = s, A(s.x, function(f, h) {
        A(s.y, function(v, c) {
          var d = "x" + h + "y" + c, y = new MD(d);
          y.master = n, y.model = t, n._coordsMap[d] = y, n._coordsList.push(y), y.addAxis(f), y.addAxis(v);
        });
      });
      function u(f) {
        return function(h, v) {
          if (ql(h, t)) {
            var c = h.get("position");
            f === "x" ? c !== "top" && c !== "bottom" && (c = o.bottom ? "top" : "bottom") : c !== "left" && c !== "right" && (c = o.left ? "right" : "left"), o[c] = !0;
            var d = new DD(f, AM(h), [0, 0], h.get("type"), c), y = d.type === "category";
            d.onBand = y && h.get("boundaryGap"), d.inverse = h.get("inverse"), h.axis = d, d.model = h, d.grid = a, d.index = v, a._axesList.push(d), s[f][v] = d, l[f]++;
          }
        };
      }
    }, r.prototype._updateScale = function(t, e) {
      A(this._axesList, function(n) {
        if (n.scale.setExtent(1 / 0, -1 / 0), n.type === "category") {
          var a = n.model.get("categorySortInfo");
          n.scale.setSortInfo(a);
        }
      }), t.eachSeries(function(n) {
        if (Yd(n)) {
          var a = Xd(n), o = a.xAxisModel, s = a.yAxisModel;
          if (!ql(o, e) || !ql(s, e))
            return;
          var l = this.getCartesian(o.componentIndex, s.componentIndex), u = n.getData(), f = l.getAxis("x"), h = l.getAxis("y");
          i(u, f), i(u, h);
        }
      }, this);
      function i(n, a) {
        A(EM(n, a.dim), function(o) {
          a.scale.unionExtentFromData(n, o);
        });
      }
    }, r.prototype.getTooltipAxes = function(t) {
      var e = [], i = [];
      return A(this.getCartesians(), function(n) {
        var a = t != null && t !== "auto" ? n.getAxis(t) : n.getBaseAxis(), o = n.getOtherAxis(a);
        rt(e, a) < 0 && e.push(a), rt(i, o) < 0 && i.push(o);
      }), {
        baseAxes: e,
        otherAxes: i
      };
    }, r.create = function(t, e) {
      var i = [];
      return t.eachComponent("grid", function(n, a) {
        var o = new r(n, t, e);
        o.name = "grid_" + a, o.resize(n, e, !0), n.coordinateSystem = o, i.push(o);
      }), t.eachSeries(function(n) {
        if (Yd(n)) {
          var a = Xd(n), o = a.xAxisModel, s = a.yAxisModel, l = o.getCoordSysModel(), u = l.coordinateSystem;
          n.coordinateSystem = u.getCartesian(o.componentIndex, s.componentIndex);
        }
      }), i;
    }, r.dimensions = of, r;
  })()
);
function ql(r, t) {
  return r.getCoordSysModel() === t;
}
function Zd(r, t, e, i) {
  e.getAxesOnZeroOf = function() {
    return a ? [a] : [];
  };
  var n = r[t], a, o = e.model, s = o.get(["axisLine", "onZero"]), l = o.get(["axisLine", "onZeroAxisIndex"]);
  if (!s)
    return;
  if (l != null)
    qd(n[l]) && (a = n[l]);
  else
    for (var u in n)
      if (n.hasOwnProperty(u) && qd(n[u]) && !i[f(n[u])]) {
        a = n[u];
        break;
      }
  a && (i[f(a)] = !0);
  function f(h) {
    return h.dim + "_" + h.index;
  }
}
function qd(r) {
  return r && r.type !== "category" && r.type !== "time" && LM(r);
}
function PD(r, t) {
  var e = r.getExtent(), i = e[0] + e[1];
  r.toGlobalCoord = r.dim === "x" ? function(n) {
    return n + t;
  } : function(n) {
    return i - n + t;
  }, r.toLocalCoord = r.dim === "x" ? function(n) {
    return n - t;
  } : function(n) {
    return i - n + t;
  };
}
var sr = Math.PI, vr = (
  /** @class */
  (function() {
    function r(t, e) {
      this.group = new Dt(), this.opt = e, this.axisModel = t, ot(e, {
        labelOffset: 0,
        nameDirection: 1,
        tickDirection: 1,
        labelDirection: 1,
        silent: !0,
        handleAutoShown: function() {
          return !0;
        }
      });
      var i = new Dt({
        x: e.position[0],
        y: e.position[1],
        rotation: e.rotation
      });
      i.updateTransform(), this._transformGroup = i;
    }
    return r.prototype.hasBuilder = function(t) {
      return !!Kd[t];
    }, r.prototype.add = function(t) {
      Kd[t](this.opt, this.axisModel, this.group, this._transformGroup);
    }, r.prototype.getGroup = function() {
      return this.group;
    }, r.innerTextLayout = function(t, e, i) {
      var n = _g(e - t), a, o;
      return No(n) ? (o = i > 0 ? "top" : "bottom", a = "center") : No(n - sr) ? (o = i > 0 ? "bottom" : "top", a = "center") : (o = "middle", n > 0 && n < sr ? a = i > 0 ? "right" : "left" : a = i > 0 ? "left" : "right"), {
        rotation: n,
        textAlign: a,
        textVerticalAlign: o
      };
    }, r.makeAxisEventDataBase = function(t) {
      var e = {
        componentType: t.mainType,
        componentIndex: t.componentIndex
      };
      return e[t.mainType + "Index"] = t.componentIndex, e;
    }, r.isLabelSilent = function(t) {
      var e = t.get("tooltip");
      return t.get("silent") || !(t.get("triggerEvent") || e && e.show);
    }, r;
  })()
), Kd = {
  axisLine: function(r, t, e, i) {
    var n = t.get(["axisLine", "show"]);
    if (n === "auto" && r.handleAutoShown && (n = r.handleAutoShown("axisLine")), !!n) {
      var a = t.axis.getExtent(), o = i.transform, s = [a[0], 0], l = [a[1], 0], u = s[0] > l[0];
      o && (ue(s, s, o), ue(l, l, o));
      var f = k({
        lineCap: "round"
      }, t.getModel(["axisLine", "lineStyle"]).getLineStyle()), h = new Ge({
        shape: {
          x1: s[0],
          y1: s[1],
          x2: l[0],
          y2: l[1]
        },
        style: f,
        strokeContainThreshold: r.strokeContainThreshold || 5,
        silent: !0,
        z2: 1
      });
      aa(h.shape, h.style.lineWidth), h.anid = "line", e.add(h);
      var v = t.get(["axisLine", "symbol"]);
      if (v != null) {
        var c = t.get(["axisLine", "symbolSize"]);
        z(v) && (v = [v, v]), (z(c) || vt(c)) && (c = [c, c]);
        var d = Ps(t.get(["axisLine", "symbolOffset"]) || 0, c), y = c[0], p = c[1];
        A([{
          rotate: r.rotation + Math.PI / 2,
          offset: d[0],
          r: 0
        }, {
          rotate: r.rotation - Math.PI / 2,
          offset: d[1],
          r: Math.sqrt((s[0] - l[0]) * (s[0] - l[0]) + (s[1] - l[1]) * (s[1] - l[1]))
        }], function(g, m) {
          if (v[m] !== "none" && v[m] != null) {
            var _ = ii(v[m], -y / 2, -p / 2, y, p, f.stroke, !0), S = g.r + g.offset, w = u ? l : s;
            _.attr({
              rotation: g.rotate,
              x: w[0] + S * Math.cos(r.rotation),
              y: w[1] - S * Math.sin(r.rotation),
              silent: !0,
              z2: 11
            }), e.add(_);
          }
        });
      }
    }
  },
  axisTickLabel: function(r, t, e, i) {
    var n = RD(e, i, t, r), a = OD(e, i, t, r);
    if (ED(t, a, n), kD(e, i, t, r.tickDirection), t.get(["axisLabel", "hideOverlap"])) {
      var o = UM(H(a, function(s) {
        return {
          label: s,
          priority: s.z2,
          defaultAttr: {
            ignore: s.ignore
          }
        };
      }));
      YM(o);
    }
  },
  axisName: function(r, t, e, i) {
    var n = Vi(r.axisName, t.get("name"));
    if (n) {
      var a = t.get("nameLocation"), o = r.nameDirection, s = t.getModel("nameTextStyle"), l = t.get("nameGap") || 0, u = t.axis.getExtent(), f = u[0] > u[1] ? -1 : 1, h = [
        a === "start" ? u[0] - f * l : a === "end" ? u[1] + f * l : (u[0] + u[1]) / 2,
        // Reuse labelOffset.
        Qd(a) ? r.labelOffset + o * l : 0
      ], v, c = t.get("nameRotate");
      c != null && (c = c * sr / 180);
      var d;
      Qd(a) ? v = vr.innerTextLayout(
        r.rotation,
        c ?? r.rotation,
        // Adapt to axis.
        o
      ) : (v = ID(r.rotation, a, c || 0, u), d = r.axisNameAvailableWidth, d != null && (d = Math.abs(d / Math.sin(v.rotation)), !isFinite(d) && (d = null)));
      var y = s.getFont(), p = t.get("nameTruncate", !0) || {}, g = p.ellipsis, m = Vi(r.nameTruncateMaxWidth, p.maxWidth, d), _ = new Zt({
        x: h[0],
        y: h[1],
        rotation: v.rotation,
        silent: vr.isLabelSilent(t),
        style: Gi(s, {
          text: n,
          font: y,
          overflow: "truncate",
          width: m,
          ellipsis: g,
          fill: s.getTextColor() || t.get(["axisLine", "lineStyle", "color"]),
          align: s.get("align") || v.textAlign,
          verticalAlign: s.get("verticalAlign") || v.textVerticalAlign
        }),
        z2: 1
      });
      if (gs({
        el: _,
        componentModel: t,
        itemName: n
      }), _.__fullText = n, _.anid = "name", t.get("triggerEvent")) {
        var S = vr.makeAxisEventDataBase(t);
        S.targetType = "axisName", S.name = n, et(_).eventData = S;
      }
      i.add(_), _.updateTransform(), e.add(_), _.decomposeTransform();
    }
  }
};
function ID(r, t, e, i) {
  var n = _g(e - r), a, o, s = i[0] > i[1], l = t === "start" && !s || t !== "start" && s;
  return No(n - sr / 2) ? (o = l ? "bottom" : "top", a = "center") : No(n - sr * 1.5) ? (o = l ? "top" : "bottom", a = "center") : (o = "middle", n < sr * 1.5 && n > sr / 2 ? a = l ? "left" : "right" : a = l ? "right" : "left"), {
    rotation: n,
    textAlign: a,
    textVerticalAlign: o
  };
}
function ED(r, t, e) {
  if (!Bm(r.axis)) {
    var i = r.get(["axisLabel", "showMinLabel"]), n = r.get(["axisLabel", "showMaxLabel"]);
    t = t || [], e = e || [];
    var a = t[0], o = t[1], s = t[t.length - 1], l = t[t.length - 2], u = e[0], f = e[1], h = e[e.length - 1], v = e[e.length - 2];
    i === !1 ? (te(a), te(u)) : jd(a, o) && (i ? (te(o), te(f)) : (te(a), te(u))), n === !1 ? (te(s), te(h)) : jd(l, s) && (n ? (te(l), te(v)) : (te(s), te(h)));
  }
}
function te(r) {
  r && (r.ignore = !0);
}
function jd(r, t) {
  var e = r && r.getBoundingRect().clone(), i = t && t.getBoundingRect().clone();
  if (!(!e || !i)) {
    var n = Ef([]);
    return Rf(n, n, -r.rotation), e.applyTransform(Ri([], n, r.getLocalTransform())), i.applyTransform(Ri([], n, t.getLocalTransform())), e.intersect(i);
  }
}
function Qd(r) {
  return r === "middle" || r === "center";
}
function Jm(r, t, e, i, n) {
  for (var a = [], o = [], s = [], l = 0; l < r.length; l++) {
    var u = r[l].coord;
    o[0] = u, o[1] = 0, s[0] = u, s[1] = e, t && (ue(o, o, t), ue(s, s, t));
    var f = new Ge({
      shape: {
        x1: o[0],
        y1: o[1],
        x2: s[0],
        y2: s[1]
      },
      style: i,
      z2: 2,
      autoBatch: !0,
      silent: !0
    });
    aa(f.shape, f.style.lineWidth), f.anid = n + "_" + r[l].tickValue, a.push(f);
  }
  return a;
}
function RD(r, t, e, i) {
  var n = e.axis, a = e.getModel("axisTick"), o = a.get("show");
  if (o === "auto" && i.handleAutoShown && (o = i.handleAutoShown("axisTick")), !(!o || n.scale.isBlank())) {
    for (var s = a.getModel("lineStyle"), l = i.tickDirection * a.get("length"), u = n.getTicksCoords(), f = Jm(u, t.transform, l, ot(s.getLineStyle(), {
      stroke: e.get(["axisLine", "lineStyle", "color"])
    }), "ticks"), h = 0; h < f.length; h++)
      r.add(f[h]);
    return f;
  }
}
function kD(r, t, e, i) {
  var n = e.axis, a = e.getModel("minorTick");
  if (!(!a.get("show") || n.scale.isBlank())) {
    var o = n.getMinorTicksCoords();
    if (o.length)
      for (var s = a.getModel("lineStyle"), l = i * a.get("length"), u = ot(s.getLineStyle(), ot(e.getModel("axisTick").getLineStyle(), {
        stroke: e.get(["axisLine", "lineStyle", "color"])
      })), f = 0; f < o.length; f++)
        for (var h = Jm(o[f], t.transform, l, u, "minorticks_" + f), v = 0; v < h.length; v++)
          r.add(h[v]);
  }
}
function OD(r, t, e, i) {
  var n = e.axis, a = Vi(i.axisLabelShow, e.get(["axisLabel", "show"]));
  if (!(!a || n.scale.isBlank())) {
    var o = e.getModel("axisLabel"), s = o.get("margin"), l = n.getViewLabels(), u = (Vi(i.labelRotate, o.get("rotate")) || 0) * sr / 180, f = vr.innerTextLayout(i.rotation, u, i.labelDirection), h = e.getCategories && e.getCategories(!0), v = [], c = vr.isLabelSilent(e), d = e.get("triggerEvent");
    return A(l, function(y, p) {
      var g = n.scale.type === "ordinal" ? n.scale.getRawOrdinalNumber(y.tickValue) : y.tickValue, m = y.formattedLabel, _ = y.rawLabel, S = o;
      if (h && h[g]) {
        var w = h[g];
        W(w) && w.textStyle && (S = new yt(w.textStyle, o, e.ecModel));
      }
      var b = S.getTextColor() || e.get(["axisLine", "lineStyle", "color"]), x = n.dataToCoord(g), D = S.getShallow("align", !0) || f.textAlign, T = X(S.getShallow("alignMinLabel", !0), D), C = X(S.getShallow("alignMaxLabel", !0), D), M = S.getShallow("verticalAlign", !0) || S.getShallow("baseline", !0) || f.textVerticalAlign, L = X(S.getShallow("verticalAlignMinLabel", !0), M), P = X(S.getShallow("verticalAlignMaxLabel", !0), M), I = new Zt({
        x,
        y: i.labelOffset + i.labelDirection * s,
        rotation: f.rotation,
        silent: c,
        z2: 10 + (y.level || 0),
        style: Gi(S, {
          text: m,
          align: p === 0 ? T : p === l.length - 1 ? C : D,
          verticalAlign: p === 0 ? L : p === l.length - 1 ? P : M,
          fill: G(b) ? b(
            // (1) In category axis with data zoom, tick is not the original
            // index of axis.data. So tick should not be exposed to user
            // in category axis.
            // (2) Compatible with previous version, which always use formatted label as
            // input. But in interval scale the formatted label is like '223,445', which
            // maked user replace ','. So we modify it to return original val but remain
            // it as 'string' to avoid error in replacing.
            n.type === "category" ? _ : n.type === "value" ? g + "" : g,
            p
          ) : b
        })
      });
      if (I.anid = "label_" + g, gs({
        el: I,
        componentModel: e,
        itemName: m,
        formatterParamsExtra: {
          isTruncated: function() {
            return I.isTruncated;
          },
          value: _,
          tickIndex: p
        }
      }), d) {
        var E = vr.makeAxisEventDataBase(e);
        E.targetType = "axisLabel", E.value = _, E.tickIndex = p, n.type === "category" && (E.dataIndex = g), et(I).eventData = E;
      }
      t.add(I), I.updateTransform(), v.push(I), r.add(I), I.decomposeTransform();
    }), v;
  }
}
function ND(r, t) {
  var e = {
    /**
     * key: makeKey(axis.model)
     * value: {
     *      axis,
     *      coordSys,
     *      axisPointerModel,
     *      triggerTooltip,
     *      triggerEmphasis,
     *      involveSeries,
     *      snap,
     *      seriesModels,
     *      seriesDataCount
     * }
     */
    axesInfo: {},
    seriesInvolved: !1,
    /**
     * key: makeKey(coordSys.model)
     * value: Object: key makeKey(axis.model), value: axisInfo
     */
    coordSysAxesInfo: {},
    coordSysMap: {}
  };
  return BD(e, r, t), e.seriesInvolved && zD(e, r), e;
}
function BD(r, t, e) {
  var i = t.getComponent("tooltip"), n = t.getComponent("axisPointer"), a = n.get("link", !0) || [], o = [];
  A(e.getCoordinateSystems(), function(s) {
    if (!s.axisPointerEnabled)
      return;
    var l = ca(s.model), u = r.coordSysAxesInfo[l] = {};
    r.coordSysMap[l] = s;
    var f = s.model, h = f.getModel("tooltip", i);
    if (A(s.getAxes(), ht(y, !1, null)), s.getTooltipAxes && i && h.get("show")) {
      var v = h.get("trigger") === "axis", c = h.get(["axisPointer", "type"]) === "cross", d = s.getTooltipAxes(h.get(["axisPointer", "axis"]));
      (v || c) && A(d.baseAxes, ht(y, c ? "cross" : !0, v)), c && A(d.otherAxes, ht(y, "cross", !1));
    }
    function y(p, g, m) {
      var _ = m.model.getModel("axisPointer", n), S = _.get("show");
      if (!(!S || S === "auto" && !p && !lf(_))) {
        g == null && (g = _.get("triggerTooltip")), _ = p ? FD(m, h, n, t, p, g) : _;
        var w = _.get("snap"), b = _.get("triggerEmphasis"), x = ca(m.model), D = g || w || m.type === "category", T = r.axesInfo[x] = {
          key: x,
          axis: m,
          coordSys: s,
          axisPointerModel: _,
          triggerTooltip: g,
          triggerEmphasis: b,
          involveSeries: D,
          snap: w,
          useHandle: lf(_),
          seriesModels: [],
          linkGroup: null
        };
        u[x] = T, r.seriesInvolved = r.seriesInvolved || D;
        var C = HD(a, m);
        if (C != null) {
          var M = o[C] || (o[C] = {
            axesInfo: {}
          });
          M.axesInfo[x] = T, M.mapper = a[C].mapper, T.linkGroup = M;
        }
      }
    }
  });
}
function FD(r, t, e, i, n, a) {
  var o = t.getModel("axisPointer"), s = ["type", "snap", "lineStyle", "shadowStyle", "label", "animation", "animationDurationUpdate", "animationEasingUpdate", "z"], l = {};
  A(s, function(v) {
    l[v] = K(o.get(v));
  }), l.snap = r.type !== "category" && !!a, o.get("type") === "cross" && (l.type = "line");
  var u = l.label || (l.label = {});
  if (u.show == null && (u.show = !1), n === "cross") {
    var f = o.get(["label", "show"]);
    if (u.show = f ?? !0, !a) {
      var h = l.lineStyle = o.get("crossStyle");
      h && ot(u, h.textStyle);
    }
  }
  return r.model.getModel("axisPointer", new yt(l, e, i));
}
function zD(r, t) {
  t.eachSeries(function(e) {
    var i = e.coordinateSystem, n = e.get(["tooltip", "trigger"], !0), a = e.get(["tooltip", "show"], !0);
    !i || n === "none" || n === !1 || n === "item" || a === !1 || e.get(["axisPointer", "show"], !0) === !1 || A(r.coordSysAxesInfo[ca(i.model)], function(o) {
      var s = o.axis;
      i.getAxis(s.dim) === s && (o.seriesModels.push(e), o.seriesDataCount == null && (o.seriesDataCount = 0), o.seriesDataCount += e.getData().count());
    });
  });
}
function HD(r, t) {
  for (var e = t.model, i = t.dim, n = 0; n < r.length; n++) {
    var a = r[n] || {};
    if (Kl(a[i + "AxisId"], e.id) || Kl(a[i + "AxisIndex"], e.componentIndex) || Kl(a[i + "AxisName"], e.name))
      return n;
  }
}
function Kl(r, t) {
  return r === "all" || N(r) && rt(r, t) >= 0 || r === t;
}
function $D(r) {
  var t = Ah(r);
  if (t) {
    var e = t.axisPointerModel, i = t.axis.scale, n = e.option, a = e.get("status"), o = e.get("value");
    o != null && (o = i.parse(o));
    var s = lf(e);
    a == null && (n.status = s ? "show" : "hide");
    var l = i.getExtent().slice();
    l[0] > l[1] && l.reverse(), // Pick a value on axis when initializing.
    (o == null || o > l[1]) && (o = l[1]), o < l[0] && (o = l[0]), n.value = o, s && (n.status = t.axis.scale.isBlank() ? "hide" : "show");
  }
}
function Ah(r) {
  var t = (r.ecModel.getComponent("axisPointer") || {}).coordSysAxesInfo;
  return t && t.axesInfo[ca(r)];
}
function VD(r) {
  var t = Ah(r);
  return t && t.axisPointerModel;
}
function lf(r) {
  return !!r.get(["handle", "show"]);
}
function ca(r) {
  return r.type + "||" + r.id;
}
var Jd = {}, t_ = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = t.type, e;
    }
    return t.prototype.render = function(e, i, n, a) {
      this.axisPointerClass && $D(e), r.prototype.render.apply(this, arguments), this._doUpdateAxisPointerClass(e, n, !0);
    }, t.prototype.updateAxisPointer = function(e, i, n, a) {
      this._doUpdateAxisPointerClass(e, n, !1);
    }, t.prototype.remove = function(e, i) {
      var n = this._axisPointer;
      n && n.remove(i);
    }, t.prototype.dispose = function(e, i) {
      this._disposeAxisPointer(i), r.prototype.dispose.apply(this, arguments);
    }, t.prototype._doUpdateAxisPointerClass = function(e, i, n) {
      var a = t.getAxisPointerClass(this.axisPointerClass);
      if (a) {
        var o = VD(e);
        o ? (this._axisPointer || (this._axisPointer = new a())).render(e, o, i, n) : this._disposeAxisPointer(i);
      }
    }, t.prototype._disposeAxisPointer = function(e) {
      this._axisPointer && this._axisPointer.dispose(e), this._axisPointer = null;
    }, t.registerAxisPointerClass = function(e, i) {
      Jd[e] = i;
    }, t.getAxisPointerClass = function(e) {
      return e && Jd[e];
    }, t.type = "axis", t;
  })(me)
), uf = mt();
function GD(r, t, e, i) {
  var n = e.axis;
  if (!n.scale.isBlank()) {
    var a = e.getModel("splitArea"), o = a.getModel("areaStyle"), s = o.get("color"), l = i.coordinateSystem.getRect(), u = n.getTicksCoords({
      tickModel: a,
      clamp: !0
    });
    if (u.length) {
      var f = s.length, h = uf(r).splitAreaColors, v = Z(), c = 0;
      if (h)
        for (var d = 0; d < u.length; d++) {
          var y = h.get(u[d].tickValue);
          if (y != null) {
            c = (y + (f - 1) * d) % f;
            break;
          }
        }
      var p = n.toGlobalCoord(u[0].coord), g = o.getAreaStyle();
      s = N(s) ? s : [s];
      for (var d = 1; d < u.length; d++) {
        var m = n.toGlobalCoord(u[d].coord), _ = void 0, S = void 0, w = void 0, b = void 0;
        n.isHorizontal() ? (_ = p, S = l.y, w = m - _, b = l.height, p = _ + w) : (_ = l.x, S = p, w = l.width, b = m - S, p = S + b);
        var x = u[d - 1].tickValue;
        x != null && v.set(x, c), t.add(new Lt({
          anid: x != null ? "area_" + x : null,
          shape: {
            x: _,
            y: S,
            width: w,
            height: b
          },
          style: ot({
            fill: s[c]
          }, g),
          autoBatch: !0,
          silent: !0
        })), c = (c + 1) % f;
      }
      uf(r).splitAreaColors = v;
    }
  }
}
function WD(r) {
  uf(r).splitAreaColors = null;
}
var UD = ["axisLine", "axisTickLabel", "axisName"], YD = ["splitArea", "splitLine", "minorSplitLine"], e_ = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = t.type, e.axisPointerClass = "CartesianAxisPointer", e;
    }
    return t.prototype.render = function(e, i, n, a) {
      this.group.removeAll();
      var o = this._axisGroup;
      if (this._axisGroup = new Dt(), this.group.add(this._axisGroup), !!e.get("show")) {
        var s = e.getCoordSysModel(), l = sf(s, e), u = new vr(e, k({
          handleAutoShown: function(h) {
            for (var v = s.coordinateSystem.getCartesians(), c = 0; c < v.length; c++)
              if (rf(v[c].getOtherAxis(e.axis).scale))
                return !0;
            return !1;
          }
        }, l));
        A(UD, u.add, u), this._axisGroup.add(u.getGroup()), A(YD, function(h) {
          e.get([h, "show"]) && XD[h](this, this._axisGroup, e, s);
        }, this);
        var f = a && a.type === "changeAxisOrder" && a.isInitSort;
        f || ry(o, this._axisGroup, e), r.prototype.render.call(this, e, i, n, a);
      }
    }, t.prototype.remove = function() {
      WD(this);
    }, t.type = "cartesianAxis", t;
  })(t_)
), XD = {
  splitLine: function(r, t, e, i) {
    var n = e.axis;
    if (!n.scale.isBlank()) {
      var a = e.getModel("splitLine"), o = a.getModel("lineStyle"), s = o.get("color"), l = a.get("showMinLine") !== !1, u = a.get("showMaxLine") !== !1;
      s = N(s) ? s : [s];
      for (var f = i.coordinateSystem.getRect(), h = n.isHorizontal(), v = 0, c = n.getTicksCoords({
        tickModel: a
      }), d = [], y = [], p = o.getLineStyle(), g = 0; g < c.length; g++) {
        var m = n.toGlobalCoord(c[g].coord);
        if (!(g === 0 && !l || g === c.length - 1 && !u)) {
          var _ = c[g].tickValue;
          h ? (d[0] = m, d[1] = f.y, y[0] = m, y[1] = f.y + f.height) : (d[0] = f.x, d[1] = m, y[0] = f.x + f.width, y[1] = m);
          var S = v++ % s.length, w = new Ge({
            anid: _ != null ? "line_" + _ : null,
            autoBatch: !0,
            shape: {
              x1: d[0],
              y1: d[1],
              x2: y[0],
              y2: y[1]
            },
            style: ot({
              stroke: s[S]
            }, p),
            silent: !0
          });
          aa(w.shape, p.lineWidth), t.add(w);
        }
      }
    }
  },
  minorSplitLine: function(r, t, e, i) {
    var n = e.axis, a = e.getModel("minorSplitLine"), o = a.getModel("lineStyle"), s = i.coordinateSystem.getRect(), l = n.isHorizontal(), u = n.getMinorTicksCoords();
    if (u.length)
      for (var f = [], h = [], v = o.getLineStyle(), c = 0; c < u.length; c++)
        for (var d = 0; d < u[c].length; d++) {
          var y = n.toGlobalCoord(u[c][d].coord);
          l ? (f[0] = y, f[1] = s.y, h[0] = y, h[1] = s.y + s.height) : (f[0] = s.x, f[1] = y, h[0] = s.x + s.width, h[1] = y);
          var p = new Ge({
            anid: "minor_line_" + u[c][d].tickValue,
            autoBatch: !0,
            shape: {
              x1: f[0],
              y1: f[1],
              x2: h[0],
              y2: h[1]
            },
            style: v,
            silent: !0
          });
          aa(p.shape, v.lineWidth), t.add(p);
        }
  },
  splitArea: function(r, t, e, i) {
    GD(r, t, e, i);
  }
}, r_ = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = t.type, e;
    }
    return t.type = "xAxis", t;
  })(e_)
), ZD = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = r_.type, e;
    }
    return t.type = "yAxis", t;
  })(e_)
), qD = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = "grid", e;
    }
    return t.prototype.render = function(e, i) {
      this.group.removeAll(), e.get("show") && this.group.add(new Lt({
        shape: e.coordinateSystem.getRect(),
        style: ot({
          fill: e.get("backgroundColor")
        }, e.getItemStyle()),
        silent: !0,
        z2: -1
      }));
    }, t.type = "grid", t;
  })(me)
), tp = {
  // gridIndex: 0,
  // gridId: '',
  offset: 0
};
function KD(r) {
  r.registerComponentView(qD), r.registerComponentModel(_D), r.registerCoordinateSystem("cartesian2d", LD), Gd(r, "x", af, tp), Gd(r, "y", af, tp), r.registerComponentView(r_), r.registerComponentView(ZD), r.registerPreprocessor(function(t) {
    t.xAxis && t.yAxis && !t.grid && (t.grid = {});
  });
}
var ep = Ge.prototype, jl = ds.prototype, i_ = (
  /** @class */
  /* @__PURE__ */ (function() {
    function r() {
      this.x1 = 0, this.y1 = 0, this.x2 = 0, this.y2 = 0, this.percent = 1;
    }
    return r;
  })()
);
(function(r) {
  O(t, r);
  function t() {
    return r !== null && r.apply(this, arguments) || this;
  }
  return t;
})(i_);
function Ql(r) {
  return isNaN(+r.cpx1) || isNaN(+r.cpy1);
}
var jD = (
  /** @class */
  (function(r) {
    O(t, r);
    function t(e) {
      var i = r.call(this, e) || this;
      return i.type = "ec-line", i;
    }
    return t.prototype.getDefaultStyle = function() {
      return {
        stroke: "#000",
        fill: null
      };
    }, t.prototype.getDefaultShape = function() {
      return new i_();
    }, t.prototype.buildPath = function(e, i) {
      Ql(i) ? ep.buildPath.call(this, e, i) : jl.buildPath.call(this, e, i);
    }, t.prototype.pointAt = function(e) {
      return Ql(this.shape) ? ep.pointAt.call(this, e) : jl.pointAt.call(this, e);
    }, t.prototype.tangentAt = function(e) {
      var i = this.shape, n = Ql(i) ? [i.x2 - i.x1, i.y2 - i.y1] : jl.tangentAt.call(this, e);
      return Pf(n, n);
    }, t;
  })(st)
), Jl = ["fromSymbol", "toSymbol"];
function rp(r) {
  return "_" + r + "Type";
}
function ip(r, t, e) {
  var i = t.getItemVisual(e, r);
  if (!i || i === "none")
    return i;
  var n = t.getItemVisual(e, r + "Size"), a = t.getItemVisual(e, r + "Rotate"), o = t.getItemVisual(e, r + "Offset"), s = t.getItemVisual(e, r + "KeepAspect"), l = gh(n), u = Ps(o || 0, l);
  return i + l + u + (a || "") + (s || "");
}
function np(r, t, e) {
  var i = t.getItemVisual(e, r);
  if (!(!i || i === "none")) {
    var n = t.getItemVisual(e, r + "Size"), a = t.getItemVisual(e, r + "Rotate"), o = t.getItemVisual(e, r + "Offset"), s = t.getItemVisual(e, r + "KeepAspect"), l = gh(n), u = Ps(o || 0, l), f = ii(i, -l[0] / 2 + u[0], -l[1] / 2 + u[1], l[0], l[1], null, s);
    return f.__specifiedRotation = a == null || isNaN(a) ? void 0 : +a * Math.PI / 180 || 0, f.name = r, f;
  }
}
function QD(r) {
  var t = new jD({
    name: "line",
    subPixelOptimize: !0
  });
  return ff(t.shape, r), t;
}
function ff(r, t) {
  r.x1 = t[0][0], r.y1 = t[0][1], r.x2 = t[1][0], r.y2 = t[1][1], r.percent = 1;
  var e = t[2];
  e ? (r.cpx1 = e[0], r.cpy1 = e[1]) : (r.cpx1 = NaN, r.cpy1 = NaN);
}
var JD = (
  /** @class */
  (function(r) {
    O(t, r);
    function t(e, i, n) {
      var a = r.call(this) || this;
      return a._createLine(e, i, n), a;
    }
    return t.prototype._createLine = function(e, i, n) {
      var a = e.hostModel, o = e.getItemLayout(i), s = QD(o);
      s.shape.percent = 0, Ki(s, {
        shape: {
          percent: 1
        }
      }, a, i), this.add(s), A(Jl, function(l) {
        var u = np(l, e, i);
        this.add(u), this[rp(l)] = ip(l, e, i);
      }, this), this._updateCommonStl(e, i, n);
    }, t.prototype.updateData = function(e, i, n) {
      var a = e.hostModel, o = this.childOfName("line"), s = e.getItemLayout(i), l = {
        shape: {}
      };
      ff(l.shape, s), We(o, l, a, i), A(Jl, function(u) {
        var f = ip(u, e, i), h = rp(u);
        if (this[h] !== f) {
          this.remove(this.childOfName(u));
          var v = np(u, e, i);
          this.add(v);
        }
        this[h] = f;
      }, this), this._updateCommonStl(e, i, n);
    }, t.prototype.getLinePath = function() {
      return this.childAt(0);
    }, t.prototype._updateCommonStl = function(e, i, n) {
      var a = e.hostModel, o = this.childOfName("line"), s = n && n.emphasisLineStyle, l = n && n.blurLineStyle, u = n && n.selectLineStyle, f = n && n.labelStatesModels, h = n && n.emphasisDisabled, v = n && n.focus, c = n && n.blurScope;
      if (!n || e.hasItemOption) {
        var d = e.getItemModel(i), y = d.getModel("emphasis");
        s = y.getModel("lineStyle").getLineStyle(), l = d.getModel(["blur", "lineStyle"]).getLineStyle(), u = d.getModel(["select", "lineStyle"]).getLineStyle(), h = y.get("disabled"), v = y.get("focus"), c = y.get("blurScope"), f = _a(d);
      }
      var p = e.getItemVisual(i, "style"), g = p.stroke;
      o.useStyle(p), o.style.fill = null, o.style.strokeNoScale = !0, o.ensureState("emphasis").style = s, o.ensureState("blur").style = l, o.ensureState("select").style = u, A(Jl, function(b) {
        var x = this.childOfName(b);
        if (x) {
          x.setColor(g), x.style.opacity = p.opacity;
          for (var D = 0; D < fe.length; D++) {
            var T = fe[D], C = o.getState(T);
            if (C) {
              var M = C.style || {}, L = x.ensureState(T), P = L.style || (L.style = {});
              M.stroke != null && (P[x.__isEmptyBrush ? "stroke" : "fill"] = M.stroke), M.opacity != null && (P.opacity = M.opacity);
            }
          }
          x.markRedraw();
        }
      }, this);
      var m = a.getRawValue(i);
      _s(this, f, {
        labelDataIndex: i,
        labelFetcher: {
          getFormattedLabel: function(b, x) {
            return a.getFormattedLabel(b, x, e.dataType);
          }
        },
        inheritColor: g || "#000",
        defaultOpacity: p.opacity,
        defaultText: (m == null ? e.getName(i) : isFinite(m) ? wt(m) : m) + ""
      });
      var _ = this.getTextContent();
      if (_) {
        var S = f.normal;
        _.__align = _.style.align, _.__verticalAlign = _.style.verticalAlign, _.__position = S.get("position") || "middle";
        var w = S.get("distance");
        N(w) || (w = [w, w]), _.__labelDistance = w;
      }
      this.setTextConfig({
        position: null,
        local: !0,
        inside: !1
        // Can't be inside for stroke element.
      }), zo(this, v, c, h);
    }, t.prototype.highlight = function() {
      ia(this);
    }, t.prototype.downplay = function() {
      na(this);
    }, t.prototype.updateLayout = function(e, i) {
      this.setLinePoints(e.getItemLayout(i));
    }, t.prototype.setLinePoints = function(e) {
      var i = this.childOfName("line");
      ff(i.shape, e), i.dirty();
    }, t.prototype.beforeUpdate = function() {
      var e = this, i = e.childOfName("fromSymbol"), n = e.childOfName("toSymbol"), a = e.getTextContent();
      if (!i && !n && (!a || a.ignore))
        return;
      for (var o = 1, s = this.parent; s; )
        s.scaleX && (o /= s.scaleX), s = s.parent;
      var l = e.childOfName("line");
      if (!this.__dirty && !l.__dirty)
        return;
      var u = l.shape.percent, f = l.pointAt(0), h = l.pointAt(u), v = Qp([], h, f);
      Pf(v, v);
      function c(C, M) {
        var L = C.__specifiedRotation;
        if (L == null) {
          var P = l.tangentAt(M);
          C.attr("rotation", (M === 1 ? -1 : 1) * Math.PI / 2 - Math.atan2(P[1], P[0]));
        } else
          C.attr("rotation", L);
      }
      if (i && (i.setPosition(f), c(i, 0), i.scaleX = i.scaleY = o * u, i.markRedraw()), n && (n.setPosition(h), c(n, 1), n.scaleX = n.scaleY = o * u, n.markRedraw()), a && !a.ignore) {
        a.x = a.y = 0, a.originX = a.originY = 0;
        var d = void 0, y = void 0, p = a.__labelDistance, g = p[0] * o, m = p[1] * o, _ = u / 2, S = l.tangentAt(_), w = [S[1], -S[0]], b = l.pointAt(_);
        w[1] > 0 && (w[0] = -w[0], w[1] = -w[1]);
        var x = S[0] < 0 ? -1 : 1;
        if (a.__position !== "start" && a.__position !== "end") {
          var D = -Math.atan2(S[1], S[0]);
          h[0] < f[0] && (D = Math.PI + D), a.rotation = D;
        }
        var T = void 0;
        switch (a.__position) {
          case "insideStartTop":
          case "insideMiddleTop":
          case "insideEndTop":
          case "middle":
            T = -m, y = "bottom";
            break;
          case "insideStartBottom":
          case "insideMiddleBottom":
          case "insideEndBottom":
            T = m, y = "top";
            break;
          default:
            T = 0, y = "middle";
        }
        switch (a.__position) {
          case "end":
            a.x = v[0] * g + h[0], a.y = v[1] * m + h[1], d = v[0] > 0.8 ? "left" : v[0] < -0.8 ? "right" : "center", y = v[1] > 0.8 ? "top" : v[1] < -0.8 ? "bottom" : "middle";
            break;
          case "start":
            a.x = -v[0] * g + f[0], a.y = -v[1] * m + f[1], d = v[0] > 0.8 ? "right" : v[0] < -0.8 ? "left" : "center", y = v[1] > 0.8 ? "bottom" : v[1] < -0.8 ? "top" : "middle";
            break;
          case "insideStartTop":
          case "insideStart":
          case "insideStartBottom":
            a.x = g * x + f[0], a.y = f[1] + T, d = S[0] < 0 ? "right" : "left", a.originX = -g * x, a.originY = -T;
            break;
          case "insideMiddleTop":
          case "insideMiddle":
          case "insideMiddleBottom":
          case "middle":
            a.x = b[0], a.y = b[1] + T, d = "center", a.originY = -T;
            break;
          case "insideEndTop":
          case "insideEnd":
          case "insideEndBottom":
            a.x = -g * x + h[0], a.y = h[1] + T, d = S[0] >= 0 ? "right" : "left", a.originX = g * x, a.originY = -T;
            break;
        }
        a.scaleX = a.scaleY = o, a.setStyle({
          // Use the user specified text align and baseline first
          verticalAlign: a.__verticalAlign || y,
          align: a.__align || d
        });
      }
    }, t;
  })(Dt)
), tA = (
  /** @class */
  (function() {
    function r(t) {
      this.group = new Dt(), this._LineCtor = t || JD;
    }
    return r.prototype.updateData = function(t) {
      var e = this;
      this._progressiveEls = null;
      var i = this, n = i.group, a = i._lineData;
      i._lineData = t, a || n.removeAll();
      var o = ap(t);
      t.diff(a).add(function(s) {
        e._doAdd(t, s, o);
      }).update(function(s, l) {
        e._doUpdate(a, t, l, s, o);
      }).remove(function(s) {
        n.remove(a.getItemGraphicEl(s));
      }).execute();
    }, r.prototype.updateLayout = function() {
      var t = this._lineData;
      t && t.eachItemGraphicEl(function(e, i) {
        e.updateLayout(t, i);
      }, this);
    }, r.prototype.incrementalPrepareUpdate = function(t) {
      this._seriesScope = ap(t), this._lineData = null, this.group.removeAll();
    }, r.prototype.incrementalUpdate = function(t, e) {
      this._progressiveEls = [];
      function i(s) {
        !s.isGroup && !eA(s) && (s.incremental = !0, s.ensureState("emphasis").hoverLayer = !0);
      }
      for (var n = t.start; n < t.end; n++) {
        var a = e.getItemLayout(n);
        if (tu(a)) {
          var o = new this._LineCtor(e, n, this._seriesScope);
          o.traverse(i), this.group.add(o), e.setItemGraphicEl(n, o), this._progressiveEls.push(o);
        }
      }
    }, r.prototype.remove = function() {
      this.group.removeAll();
    }, r.prototype.eachRendered = function(t) {
      ys(this._progressiveEls || this.group, t);
    }, r.prototype._doAdd = function(t, e, i) {
      var n = t.getItemLayout(e);
      if (tu(n)) {
        var a = new this._LineCtor(t, e, i);
        t.setItemGraphicEl(e, a), this.group.add(a);
      }
    }, r.prototype._doUpdate = function(t, e, i, n, a) {
      var o = t.getItemGraphicEl(i);
      if (!tu(e.getItemLayout(n))) {
        this.group.remove(o);
        return;
      }
      o ? o.updateData(e, n, a) : o = new this._LineCtor(e, n, a), e.setItemGraphicEl(n, o), this.group.add(o);
    }, r;
  })()
);
function eA(r) {
  return r.animators && r.animators.length > 0;
}
function ap(r) {
  var t = r.hostModel, e = t.getModel("emphasis");
  return {
    lineStyle: t.getModel("lineStyle").getLineStyle(),
    emphasisLineStyle: e.getModel(["lineStyle"]).getLineStyle(),
    blurLineStyle: t.getModel(["blur", "lineStyle"]).getLineStyle(),
    selectLineStyle: t.getModel(["select", "lineStyle"]).getLineStyle(),
    emphasisDisabled: e.get("disabled"),
    blurScope: e.get("blurScope"),
    focus: e.get("focus"),
    labelStatesModels: _a(t)
  };
}
function op(r) {
  return isNaN(r[0]) || isNaN(r[1]);
}
function tu(r) {
  return r && !op(r[0]) && !op(r[1]);
}
var Hr = mt(), sp = K, eu = dt, rA = (
  /** @class */
  (function() {
    function r() {
      this._dragging = !1, this.animationThreshold = 15;
    }
    return r.prototype.render = function(t, e, i, n) {
      var a = e.get("value"), o = e.get("status");
      if (this._axisModel = t, this._axisPointerModel = e, this._api = i, !(!n && this._lastValue === a && this._lastStatus === o)) {
        this._lastValue = a, this._lastStatus = o;
        var s = this._group, l = this._handle;
        if (!o || o === "hide") {
          s && s.hide(), l && l.hide();
          return;
        }
        s && s.show(), l && l.show();
        var u = {};
        this.makeElOption(u, a, t, e, i);
        var f = u.graphicKey;
        f !== this._lastGraphicKey && this.clear(i), this._lastGraphicKey = f;
        var h = this._moveAnimation = this.determineAnimation(t, e);
        if (!s)
          s = this._group = new Dt(), this.createPointerEl(s, u, t, e), this.createLabelEl(s, u, t, e), i.getZr().add(s);
        else {
          var v = ht(lp, e, h);
          this.updatePointerEl(s, u, v), this.updateLabelEl(s, u, v, e);
        }
        fp(s, e, !0), this._renderHandle(a);
      }
    }, r.prototype.remove = function(t) {
      this.clear(t);
    }, r.prototype.dispose = function(t) {
      this.clear(t);
    }, r.prototype.determineAnimation = function(t, e) {
      var i = e.get("animation"), n = t.axis, a = n.type === "category", o = e.get("snap");
      if (!o && !a)
        return !1;
      if (i === "auto" || i == null) {
        var s = this.animationThreshold;
        if (a && n.getBandWidth() > s)
          return !0;
        if (o) {
          var l = Ah(t).seriesDataCount, u = n.getExtent();
          return Math.abs(u[0] - u[1]) / l > s;
        }
        return !1;
      }
      return i === !0;
    }, r.prototype.makeElOption = function(t, e, i, n, a) {
    }, r.prototype.createPointerEl = function(t, e, i, n) {
      var a = e.pointer;
      if (a) {
        var o = Hr(t).pointerEl = new vw[a.type](sp(e.pointer));
        t.add(o);
      }
    }, r.prototype.createLabelEl = function(t, e, i, n) {
      if (e.label) {
        var a = Hr(t).labelEl = new Zt(sp(e.label));
        t.add(a), up(a, n);
      }
    }, r.prototype.updatePointerEl = function(t, e, i) {
      var n = Hr(t).pointerEl;
      n && e.pointer && (n.setStyle(e.pointer.style), i(n, {
        shape: e.pointer.shape
      }));
    }, r.prototype.updateLabelEl = function(t, e, i, n) {
      var a = Hr(t).labelEl;
      a && (a.setStyle(e.label.style), i(a, {
        // Consider text length change in vertical axis, animation should
        // be used on shape, otherwise the effect will be weird.
        // TODOTODO
        // shape: elOption.label.shape,
        x: e.label.x,
        y: e.label.y
      }), up(a, n));
    }, r.prototype._renderHandle = function(t) {
      if (!(this._dragging || !this.updateHandleTransform)) {
        var e = this._axisPointerModel, i = this._api.getZr(), n = this._handle, a = e.getModel("handle"), o = e.get("status");
        if (!a.get("show") || !o || o === "hide") {
          n && i.remove(n), this._handle = null;
          return;
        }
        var s;
        this._handle || (s = !0, n = this._handle = eh(a.get("icon"), {
          cursor: "move",
          draggable: !0,
          onmousemove: function(u) {
            tg(u.event);
          },
          onmousedown: eu(this._onHandleDragMove, this, 0, 0),
          drift: eu(this._onHandleDragMove, this),
          ondragend: eu(this._onHandleDragEnd, this)
        }), i.add(n)), fp(n, e, !1), n.setStyle(a.getItemStyle(null, ["color", "borderColor", "borderWidth", "opacity", "shadowColor", "shadowBlur", "shadowOffsetX", "shadowOffsetY"]));
        var l = a.get("size");
        N(l) || (l = [l, l]), n.scaleX = l[0] / 2, n.scaleY = l[1] / 2, Zy(this, "_doDispatchAxisPointer", a.get("throttle") || 0, "fixRate"), this._moveHandleToValue(t, s);
      }
    }, r.prototype._moveHandleToValue = function(t, e) {
      lp(this._axisPointerModel, !e && this._moveAnimation, this._handle, ru(this.getHandleTransform(t, this._axisModel, this._axisPointerModel)));
    }, r.prototype._onHandleDragMove = function(t, e) {
      var i = this._handle;
      if (i) {
        this._dragging = !0;
        var n = this.updateHandleTransform(ru(i), [t, e], this._axisModel, this._axisPointerModel);
        this._payloadInfo = n, i.stopAnimation(), i.attr(ru(n)), Hr(i).lastProp = null, this._doDispatchAxisPointer();
      }
    }, r.prototype._doDispatchAxisPointer = function() {
      var t = this._handle;
      if (t) {
        var e = this._payloadInfo, i = this._axisModel;
        this._api.dispatchAction({
          type: "updateAxisPointer",
          x: e.cursorPoint[0],
          y: e.cursorPoint[1],
          tooltipOption: e.tooltipOption,
          axesInfo: [{
            axisDim: i.axis.dim,
            axisIndex: i.componentIndex
          }]
        });
      }
    }, r.prototype._onHandleDragEnd = function() {
      this._dragging = !1;
      var t = this._handle;
      if (t) {
        var e = this._axisPointerModel.get("value");
        this._moveHandleToValue(e), this._api.dispatchAction({
          type: "hideTip"
        });
      }
    }, r.prototype.clear = function(t) {
      this._lastValue = null, this._lastStatus = null;
      var e = t.getZr(), i = this._group, n = this._handle;
      e && i && (this._lastGraphicKey = null, i && e.remove(i), n && e.remove(n), this._group = null, this._handle = null, this._payloadInfo = null), Yu(this, "_doDispatchAxisPointer");
    }, r.prototype.doClear = function() {
    }, r.prototype.buildLabel = function(t, e, i) {
      return i = i || 0, {
        x: t[i],
        y: t[1 - i],
        width: e[i],
        height: e[1 - i]
      };
    }, r;
  })()
);
function lp(r, t, e, i) {
  n_(Hr(e).lastProp, i) || (Hr(e).lastProp = i, t ? We(e, i, r) : (e.stopAnimation(), e.attr(i)));
}
function n_(r, t) {
  if (W(r) && W(t)) {
    var e = !0;
    return A(t, function(i, n) {
      e = e && n_(r[n], i);
    }), !!e;
  } else
    return r === t;
}
function up(r, t) {
  r[t.get(["label", "show"]) ? "show" : "hide"]();
}
function ru(r) {
  return {
    x: r.x || 0,
    y: r.y || 0,
    rotation: r.rotation || 0
  };
}
function fp(r, t, e) {
  var i = t.get("z"), n = t.get("zlevel");
  r && r.traverse(function(a) {
    a.type !== "group" && (i != null && (a.z = i), n != null && (a.zlevel = n), a.silent = e);
  });
}
function iA(r) {
  var t = r.get("type"), e = r.getModel(t + "Style"), i;
  return t === "line" ? (i = e.getLineStyle(), i.fill = null) : t === "shadow" && (i = e.getAreaStyle(), i.stroke = null), i;
}
function nA(r, t, e, i, n) {
  var a = e.get("value"), o = a_(a, t.axis, t.ecModel, e.get("seriesDataIndices"), {
    precision: e.get(["label", "precision"]),
    formatter: e.get(["label", "formatter"])
  }), s = e.getModel("label"), l = Ms(s.get("padding") || 0), u = s.getFont(), f = Bf(o, u), h = n.position, v = f.width + l[1] + l[3], c = f.height + l[0] + l[2], d = n.align;
  d === "right" && (h[0] -= v), d === "center" && (h[0] -= v / 2);
  var y = n.verticalAlign;
  y === "bottom" && (h[1] -= c), y === "middle" && (h[1] -= c / 2), aA(h, v, c, i);
  var p = s.get("backgroundColor");
  (!p || p === "auto") && (p = t.get(["axisLine", "lineStyle", "color"])), r.label = {
    // shape: {x: 0, y: 0, width: width, height: height, r: labelModel.get('borderRadius')},
    x: h[0],
    y: h[1],
    style: Gi(s, {
      text: o,
      font: u,
      fill: s.getTextColor(),
      padding: l,
      backgroundColor: p
    }),
    // Label should be over axisPointer.
    z2: 10
  };
}
function aA(r, t, e, i) {
  var n = i.getWidth(), a = i.getHeight();
  r[0] = Math.min(r[0] + t, n) - t, r[1] = Math.min(r[1] + e, a) - e, r[0] = Math.max(r[0], 0), r[1] = Math.max(r[1], 0);
}
function a_(r, t, e, i, n) {
  r = t.scale.parse(r);
  var a = t.scale.getLabel({
    value: r
  }, {
    // If `precision` is set, width can be fixed (like '12.00500'), which
    // helps to debounce when when moving label.
    precision: n.precision
  }), o = n.formatter;
  if (o) {
    var s = {
      value: Th(t, {
        value: r
      }),
      axisDimension: t.dim,
      axisIndex: t.index,
      seriesData: []
    };
    A(i, function(l) {
      var u = e.getSeriesByIndex(l.seriesIndex), f = l.dataIndexInside, h = u && u.getDataParams(f);
      h && s.seriesData.push(h);
    }), z(o) ? a = o.replace("{value}", a) : G(o) && (a = o(s));
  }
  return a;
}
function o_(r, t, e) {
  var i = Ei();
  return Rf(i, i, e.rotation), mu(i, i, e.position), th([r.dataToCoord(t), (e.labelOffset || 0) + (e.labelDirection || 1) * (e.labelMargin || 0)], i);
}
function oA(r, t, e, i, n, a) {
  var o = vr.innerTextLayout(e.rotation, 0, e.labelDirection);
  e.labelMargin = n.get(["label", "margin"]), nA(t, i, n, a, {
    position: o_(i.axis, r, e),
    align: o.textAlign,
    verticalAlign: o.textVerticalAlign
  });
}
function sA(r, t, e) {
  return e = e || 0, {
    x1: r[e],
    y1: r[1 - e],
    x2: t[e],
    y2: t[1 - e]
  };
}
function lA(r, t, e) {
  return e = e || 0, {
    x: r[e],
    y: r[1 - e],
    width: t[e],
    height: t[1 - e]
  };
}
var uA = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      return r !== null && r.apply(this, arguments) || this;
    }
    return t.prototype.makeElOption = function(e, i, n, a, o) {
      var s = n.axis, l = s.grid, u = a.get("type"), f = hp(l, s).getOtherAxis(s).getGlobalExtent(), h = s.toGlobalCoord(s.dataToCoord(i, !0));
      if (u && u !== "none") {
        var v = iA(a), c = fA[u](s, h, f);
        c.style = v, e.graphicKey = c.type, e.pointer = c;
      }
      var d = sf(l.model, n);
      oA(
        // @ts-ignore
        i,
        e,
        d,
        n,
        a,
        o
      );
    }, t.prototype.getHandleTransform = function(e, i, n) {
      var a = sf(i.axis.grid.model, i, {
        labelInside: !1
      });
      a.labelMargin = n.get(["handle", "margin"]);
      var o = o_(i.axis, e, a);
      return {
        x: o[0],
        y: o[1],
        rotation: a.rotation + (a.labelDirection < 0 ? Math.PI : 0)
      };
    }, t.prototype.updateHandleTransform = function(e, i, n, a) {
      var o = n.axis, s = o.grid, l = o.getGlobalExtent(!0), u = hp(s, o).getOtherAxis(o).getGlobalExtent(), f = o.dim === "x" ? 0 : 1, h = [e.x, e.y];
      h[f] += i[f], h[f] = Math.min(l[1], h[f]), h[f] = Math.max(l[0], h[f]);
      var v = (u[1] + u[0]) / 2, c = [v, v];
      c[f] = h[f];
      var d = [{
        verticalAlign: "middle"
      }, {
        align: "center"
      }];
      return {
        x: h[0],
        y: h[1],
        rotation: e.rotation,
        cursorPoint: c,
        tooltipOption: d[f]
      };
    }, t;
  })(rA)
);
function hp(r, t) {
  var e = {};
  return e[t.dim + "AxisIndex"] = t.index, r.getCartesian(e);
}
var fA = {
  line: function(r, t, e) {
    var i = sA([t, e[0]], [t, e[1]], cp(r));
    return {
      type: "Line",
      subPixelOptimize: !0,
      shape: i
    };
  },
  shadow: function(r, t, e) {
    var i = Math.max(1, r.getBandWidth()), n = e[1] - e[0];
    return {
      type: "Rect",
      shape: lA([t - i / 2, e[0]], [i, n], cp(r))
    };
  }
};
function cp(r) {
  return r.dim === "x" ? 0 : 1;
}
var hA = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = t.type, e;
    }
    return t.type = "axisPointer", t.defaultOption = {
      // 'auto' means that show when triggered by tooltip or handle.
      show: "auto",
      // zlevel: 0,
      z: 50,
      type: "line",
      // axispointer triggered by tootip determine snap automatically,
      // see `modelHelper`.
      snap: !1,
      triggerTooltip: !0,
      triggerEmphasis: !0,
      value: null,
      status: null,
      link: [],
      // Do not set 'auto' here, otherwise global animation: false
      // will not effect at this axispointer.
      animation: null,
      animationDurationUpdate: 200,
      lineStyle: {
        color: "#B9BEC9",
        width: 1,
        type: "dashed"
      },
      shadowStyle: {
        color: "rgba(210,219,238,0.2)"
      },
      label: {
        show: !0,
        formatter: null,
        precision: "auto",
        margin: 3,
        color: "#fff",
        padding: [5, 7, 5, 7],
        backgroundColor: "auto",
        borderColor: null,
        borderWidth: 0,
        borderRadius: 3
      },
      handle: {
        show: !1,
        // eslint-disable-next-line
        icon: "M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7v-1.2h6.6z M13.3,22H6.7v-1.2h6.6z M13.3,19.6H6.7v-1.2h6.6z",
        size: 45,
        // handle margin is from symbol center to axis, which is stable when circular move.
        margin: 50,
        // color: '#1b8bbd'
        // color: '#2f4554'
        color: "#333",
        shadowBlur: 3,
        shadowColor: "#aaa",
        shadowOffsetX: 0,
        shadowOffsetY: 2,
        // For mobile performance
        throttle: 40
      }
    }, t;
  })(at)
), Fe = mt(), cA = A;
function s_(r, t, e) {
  if (!U.node) {
    var i = t.getZr();
    Fe(i).records || (Fe(i).records = {}), vA(i, t);
    var n = Fe(i).records[r] || (Fe(i).records[r] = {});
    n.handler = e;
  }
}
function vA(r, t) {
  if (Fe(r).initialized)
    return;
  Fe(r).initialized = !0, e("click", ht(vp, "click")), e("mousemove", ht(vp, "mousemove")), e("globalout", pA);
  function e(i, n) {
    r.on(i, function(a) {
      var o = gA(t);
      cA(Fe(r).records, function(s) {
        s && n(s, a, o.dispatchAction);
      }), dA(o.pendings, t);
    });
  }
}
function dA(r, t) {
  var e = r.showTip.length, i = r.hideTip.length, n;
  e ? n = r.showTip[e - 1] : i && (n = r.hideTip[i - 1]), n && (n.dispatchAction = null, t.dispatchAction(n));
}
function pA(r, t, e) {
  r.handler("leave", null, e);
}
function vp(r, t, e, i) {
  t.handler(r, e, i);
}
function gA(r) {
  var t = {
    showTip: [],
    hideTip: []
  }, e = function(i) {
    var n = t[i.type];
    n ? n.push(i) : (i.dispatchAction = e, r.dispatchAction(i));
  };
  return {
    dispatchAction: e,
    pendings: t
  };
}
function hf(r, t) {
  if (!U.node) {
    var e = t.getZr(), i = (Fe(e).records || {})[r];
    i && (Fe(e).records[r] = null);
  }
}
var yA = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = t.type, e;
    }
    return t.prototype.render = function(e, i, n) {
      var a = i.getComponent("tooltip"), o = e.get("triggerOn") || a && a.get("triggerOn") || "mousemove|click";
      s_("axisPointer", n, function(s, l, u) {
        o !== "none" && (s === "leave" || o.indexOf(s) >= 0) && u({
          type: "updateAxisPointer",
          currTrigger: s,
          x: l && l.offsetX,
          y: l && l.offsetY
        });
      });
    }, t.prototype.remove = function(e, i) {
      hf("axisPointer", i);
    }, t.prototype.dispose = function(e, i) {
      hf("axisPointer", i);
    }, t.type = "axisPointer", t;
  })(me)
);
function l_(r, t) {
  var e = [], i = r.seriesIndex, n;
  if (i == null || !(n = t.getSeriesByIndex(i)))
    return {
      point: []
    };
  var a = n.getData(), o = Jr(a, r);
  if (o == null || o < 0 || N(o))
    return {
      point: []
    };
  var s = a.getItemGraphicEl(o), l = n.coordinateSystem;
  if (n.getTooltipPosition)
    e = n.getTooltipPosition(o) || [];
  else if (l && l.dataToPoint)
    if (r.isStacked) {
      var u = l.getBaseAxis(), f = l.getOtherAxis(u), h = f.dim, v = u.dim, c = h === "x" || h === "radius" ? 1 : 0, d = a.mapDimension(v), y = [];
      y[c] = a.get(d, o), y[1 - c] = a.get(a.getCalculationInfo("stackResultDimension"), o), e = l.dataToPoint(y) || [];
    } else
      e = l.dataToPoint(a.getValues(H(l.dimensions, function(g) {
        return a.mapDimension(g);
      }), o)) || [];
  else if (s) {
    var p = s.getBoundingRect().clone();
    p.applyTransform(s.transform), e = [p.x + p.width / 2, p.y + p.height / 2];
  }
  return {
    point: e,
    el: s
  };
}
var dp = mt();
function mA(r, t, e) {
  var i = r.currTrigger, n = [r.x, r.y], a = r, o = r.dispatchAction || dt(e.dispatchAction, e), s = t.getComponent("axisPointer").coordSysAxesInfo;
  if (s) {
    Co(n) && (n = l_({
      seriesIndex: a.seriesIndex,
      // Do not use dataIndexInside from other ec instance.
      // FIXME: auto detect it?
      dataIndex: a.dataIndex
    }, t).point);
    var l = Co(n), u = a.axesInfo, f = s.axesInfo, h = i === "leave" || Co(n), v = {}, c = {}, d = {
      list: [],
      map: {}
    }, y = {
      showPointer: ht(SA, c),
      showTooltip: ht(bA, d)
    };
    A(s.coordSysMap, function(g, m) {
      var _ = l || g.containPoint(n);
      A(s.coordSysAxesInfo[m], function(S, w) {
        var b = S.axis, x = CA(u, S);
        if (!h && _ && (!u || x)) {
          var D = x && x.value;
          D == null && !l && (D = b.pointToData(n)), D != null && pp(S, D, y, !1, v);
        }
      });
    });
    var p = {};
    return A(f, function(g, m) {
      var _ = g.linkGroup;
      _ && !c[m] && A(_.axesInfo, function(S, w) {
        var b = c[w];
        if (S !== g && b) {
          var x = b.value;
          _.mapper && (x = g.axis.scale.parse(_.mapper(x, gp(S), gp(g)))), p[g.key] = x;
        }
      });
    }), A(p, function(g, m) {
      pp(f[m], g, y, !0, v);
    }), wA(c, f, v), xA(d, n, r, o), TA(f, o, e), v;
  }
}
function pp(r, t, e, i, n) {
  var a = r.axis;
  if (!(a.scale.isBlank() || !a.containData(t))) {
    if (!r.involveSeries) {
      e.showPointer(r, t);
      return;
    }
    var o = _A(t, r), s = o.payloadBatch, l = o.snapToValue;
    s[0] && n.seriesIndex == null && k(n, s[0]), !i && r.snap && a.containData(l) && l != null && (t = l), e.showPointer(r, t, s), e.showTooltip(r, o, l);
  }
}
function _A(r, t) {
  var e = t.axis, i = e.dim, n = r, a = [], o = Number.MAX_VALUE, s = -1;
  return A(t.seriesModels, function(l, u) {
    var f = l.getData().mapDimensionsAll(i), h, v;
    if (l.getAxisTooltipData) {
      var c = l.getAxisTooltipData(f, r, e);
      v = c.dataIndices, h = c.nestestValue;
    } else {
      if (v = l.getData().indicesOfNearest(
        f[0],
        r,
        // Add a threshold to avoid find the wrong dataIndex
        // when data length is not same.
        // false,
        e.type === "category" ? 0.5 : null
      ), !v.length)
        return;
      h = l.getData().get(f[0], v[0]);
    }
    if (!(h == null || !isFinite(h))) {
      var d = r - h, y = Math.abs(d);
      y <= o && ((y < o || d >= 0 && s < 0) && (o = y, s = d, n = h, a.length = 0), A(v, function(p) {
        a.push({
          seriesIndex: l.seriesIndex,
          dataIndexInside: p,
          dataIndex: l.getData().getRawIndex(p)
        });
      }));
    }
  }), {
    payloadBatch: a,
    snapToValue: n
  };
}
function SA(r, t, e, i) {
  r[t.key] = {
    value: e,
    payloadBatch: i
  };
}
function bA(r, t, e, i) {
  var n = e.payloadBatch, a = t.axis, o = a.model, s = t.axisPointerModel;
  if (!(!t.triggerTooltip || !n.length)) {
    var l = t.coordSys.model, u = ca(l), f = r.map[u];
    f || (f = r.map[u] = {
      coordSysId: l.id,
      coordSysIndex: l.componentIndex,
      coordSysType: l.type,
      coordSysMainType: l.mainType,
      dataByAxis: []
    }, r.list.push(f)), f.dataByAxis.push({
      axisDim: a.dim,
      axisIndex: o.componentIndex,
      axisType: o.type,
      axisId: o.id,
      value: i,
      // Caustion: viewHelper.getValueLabel is actually on "view stage", which
      // depends that all models have been updated. So it should not be performed
      // here. Considering axisPointerModel used here is volatile, which is hard
      // to be retrieve in TooltipView, we prepare parameters here.
      valueLabelOpt: {
        precision: s.get(["label", "precision"]),
        formatter: s.get(["label", "formatter"])
      },
      seriesDataIndices: n.slice()
    });
  }
}
function wA(r, t, e) {
  var i = e.axesInfo = [];
  A(t, function(n, a) {
    var o = n.axisPointerModel.option, s = r[a];
    s ? (!n.useHandle && (o.status = "show"), o.value = s.value, o.seriesDataIndices = (s.payloadBatch || []).slice()) : !n.useHandle && (o.status = "hide"), o.status === "show" && i.push({
      axisDim: n.axis.dim,
      axisIndex: n.axis.model.componentIndex,
      value: o.value
    });
  });
}
function xA(r, t, e, i) {
  if (Co(t) || !r.list.length) {
    i({
      type: "hideTip"
    });
    return;
  }
  var n = ((r.list[0].dataByAxis[0] || {}).seriesDataIndices || [])[0] || {};
  i({
    type: "showTip",
    escapeConnect: !0,
    x: t[0],
    y: t[1],
    tooltipOption: e.tooltipOption,
    position: e.position,
    dataIndexInside: n.dataIndexInside,
    dataIndex: n.dataIndex,
    seriesIndex: n.seriesIndex,
    dataByCoordSys: r.list
  });
}
function TA(r, t, e) {
  var i = e.getZr(), n = "axisPointerLastHighlights", a = dp(i)[n] || {}, o = dp(i)[n] = {};
  A(r, function(u, f) {
    var h = u.axisPointerModel.option;
    h.status === "show" && u.triggerEmphasis && A(h.seriesDataIndices, function(v) {
      var c = v.seriesIndex + " | " + v.dataIndex;
      o[c] = v;
    });
  });
  var s = [], l = [];
  A(a, function(u, f) {
    !o[f] && l.push(u);
  }), A(o, function(u, f) {
    !a[f] && s.push(u);
  }), l.length && e.dispatchAction({
    type: "downplay",
    escapeConnect: !0,
    // Not blur others when highlight in axisPointer.
    notBlur: !0,
    batch: l
  }), s.length && e.dispatchAction({
    type: "highlight",
    escapeConnect: !0,
    // Not blur others when highlight in axisPointer.
    notBlur: !0,
    batch: s
  });
}
function CA(r, t) {
  for (var e = 0; e < (r || []).length; e++) {
    var i = r[e];
    if (t.axis.dim === i.axisDim && t.axis.model.componentIndex === i.axisIndex)
      return i;
  }
}
function gp(r) {
  var t = r.axis.model, e = {}, i = e.axisDim = r.axis.dim;
  return e.axisIndex = e[i + "AxisIndex"] = t.componentIndex, e.axisName = e[i + "AxisName"] = t.name, e.axisId = e[i + "AxisId"] = t.id, e;
}
function Co(r) {
  return !r || r[0] == null || isNaN(r[0]) || r[1] == null || isNaN(r[1]);
}
function u_(r) {
  t_.registerAxisPointerClass("CartesianAxisPointer", uA), r.registerComponentModel(hA), r.registerComponentView(yA), r.registerPreprocessor(function(t) {
    if (t) {
      (!t.axisPointer || t.axisPointer.length === 0) && (t.axisPointer = {});
      var e = t.axisPointer.link;
      e && !N(e) && (t.axisPointer.link = [e]);
    }
  }), r.registerProcessor(r.PRIORITY.PROCESSOR.STATISTIC, function(t, e) {
    t.getComponent("axisPointer").coordSysAxesInfo = ND(t, e);
  }), r.registerAction({
    type: "updateAxisPointer",
    event: "updateAxisPointer",
    update: ":updateAxisPointer"
  }, mA);
}
function MA(r) {
  pr(KD), pr(u_);
}
function DA(r, t) {
  var e = Ms(t.get("padding")), i = t.getItemStyle(["color", "opacity"]);
  return i.fill = t.get("backgroundColor"), r = new Lt({
    shape: {
      x: r.x - e[3],
      y: r.y - e[0],
      width: r.width + e[1] + e[3],
      height: r.height + e[0] + e[2],
      r: t.get("borderRadius")
    },
    style: i,
    silent: !0,
    z2: -1
  }), r;
}
var AA = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = t.type, e;
    }
    return t.type = "tooltip", t.dependencies = ["axisPointer"], t.defaultOption = {
      // zlevel: 0,
      z: 60,
      show: !0,
      // tooltip main content
      showContent: !0,
      // 'trigger' only works on coordinate system.
      // 'item' | 'axis' | 'none'
      trigger: "item",
      // 'click' | 'mousemove' | 'none'
      triggerOn: "mousemove|click",
      alwaysShowContent: !1,
      displayMode: "single",
      renderMode: "auto",
      // whether restraint content inside viewRect.
      // If renderMode: 'richText', default true.
      // If renderMode: 'html', defaut false (for backward compat).
      confine: null,
      showDelay: 0,
      hideDelay: 100,
      // Animation transition time, unit is second
      transitionDuration: 0.4,
      enterable: !1,
      backgroundColor: "#fff",
      // box shadow
      shadowBlur: 10,
      shadowColor: "rgba(0, 0, 0, .2)",
      shadowOffsetX: 1,
      shadowOffsetY: 2,
      // tooltip border radius, unit is px, default is 4
      borderRadius: 4,
      // tooltip border width, unit is px, default is 0 (no border)
      borderWidth: 1,
      // Tooltip inside padding, default is 5 for all direction
      // Array is allowed to set up, right, bottom, left, same with css
      // The default value: See `tooltip/tooltipMarkup.ts#getPaddingFromTooltipModel`.
      padding: null,
      // Extra css text
      extraCssText: "",
      // axis indicator, trigger by axis
      axisPointer: {
        // default is line
        // legal values: 'line' | 'shadow' | 'cross'
        type: "line",
        // Valid when type is line, appoint tooltip line locate on which line. Optional
        // legal values: 'x' | 'y' | 'angle' | 'radius' | 'auto'
        // default is 'auto', chose the axis which type is category.
        // for multiply y axis, cartesian coord chose x axis, polar chose angle axis
        axis: "auto",
        animation: "auto",
        animationDurationUpdate: 200,
        animationEasingUpdate: "exponentialOut",
        crossStyle: {
          color: "#999",
          width: 1,
          type: "dashed",
          // TODO formatter
          textStyle: {}
        }
        // lineStyle and shadowStyle should not be specified here,
        // otherwise it will always override those styles on option.axisPointer.
      },
      textStyle: {
        color: "#666",
        fontSize: 14
      }
    }, t;
  })(at)
);
function f_(r) {
  var t = r.get("confine");
  return t != null ? !!t : r.get("renderMode") === "richText";
}
function h_(r) {
  if (U.domSupported) {
    for (var t = document.documentElement.style, e = 0, i = r.length; e < i; e++)
      if (r[e] in t)
        return r[e];
  }
}
var c_ = h_(["transform", "webkitTransform", "OTransform", "MozTransform", "msTransform"]), LA = h_(["webkitTransition", "transition", "OTransition", "MozTransition", "msTransition"]);
function v_(r, t) {
  if (!r)
    return t;
  t = my(t, !0);
  var e = r.indexOf(t);
  return r = e === -1 ? t : "-" + r.slice(0, e) + "-" + t, r.toLowerCase();
}
function PA(r, t) {
  var e = r.currentStyle || document.defaultView && document.defaultView.getComputedStyle(r);
  return e ? e[t] : null;
}
var IA = v_(LA, "transition"), Lh = v_(c_, "transform"), EA = "position:absolute;display:block;border-style:solid;white-space:nowrap;z-index:9999999;" + (U.transform3dSupported ? "will-change:transform;" : "");
function RA(r) {
  return r = r === "left" ? "right" : r === "right" ? "left" : r === "top" ? "bottom" : "top", r;
}
function kA(r, t, e) {
  if (!z(e) || e === "inside")
    return "";
  var i = r.get("backgroundColor"), n = r.get("borderWidth");
  t = ei(t);
  var a = RA(e), o = Math.max(Math.round(n) * 1.5, 6), s = "", l = Lh + ":", u;
  rt(["left", "right"], a) > -1 ? (s += "top:50%", l += "translateY(-50%) rotate(" + (u = a === "left" ? -225 : -45) + "deg)") : (s += "left:50%", l += "translateX(-50%) rotate(" + (u = a === "top" ? 225 : 45) + "deg)");
  var f = u * Math.PI / 180, h = o + n, v = h * Math.abs(Math.cos(f)) + h * Math.abs(Math.sin(f)), c = Math.round(((v - Math.SQRT2 * n) / 2 + Math.SQRT2 * n - (v - h) / 2) * 100) / 100;
  s += ";" + a + ":-" + c + "px";
  var d = t + " solid " + n + "px;", y = ["position:absolute;width:" + o + "px;height:" + o + "px;z-index:-1;", s + ";" + l + ";", "border-bottom:" + d, "border-right:" + d, "background-color:" + i + ";"];
  return '<div style="' + y.join("") + '"></div>';
}
function OA(r, t) {
  var e = "cubic-bezier(0.23,1,0.32,1)", i = " " + r / 2 + "s " + e, n = "opacity" + i + ",visibility" + i;
  return t || (i = " " + r + "s " + e, n += U.transformSupported ? "," + Lh + i : ",left" + i + ",top" + i), IA + ":" + n;
}
function yp(r, t, e) {
  var i = r.toFixed(0) + "px", n = t.toFixed(0) + "px";
  if (!U.transformSupported)
    return e ? "top:" + n + ";left:" + i + ";" : [["top", n], ["left", i]];
  var a = U.transform3dSupported, o = "translate" + (a ? "3d" : "") + "(" + i + "," + n + (a ? ",0" : "") + ")";
  return e ? "top:0;left:0;" + Lh + ":" + o + ";" : [["top", 0], ["left", 0], [c_, o]];
}
function NA(r) {
  var t = [], e = r.get("fontSize"), i = r.getTextColor();
  i && t.push("color:" + i), t.push("font:" + r.getFont());
  var n = X(r.get("lineHeight"), Math.round(e * 3 / 2));
  e && t.push("line-height:" + n + "px");
  var a = r.get("textShadowColor"), o = r.get("textShadowBlur") || 0, s = r.get("textShadowOffsetX") || 0, l = r.get("textShadowOffsetY") || 0;
  return a && o && t.push("text-shadow:" + s + "px " + l + "px " + o + "px " + a), A(["decoration", "align"], function(u) {
    var f = r.get(u);
    f && t.push("text-" + u + ":" + f);
  }), t.join(";");
}
function BA(r, t, e) {
  var i = [], n = r.get("transitionDuration"), a = r.get("backgroundColor"), o = r.get("shadowBlur"), s = r.get("shadowColor"), l = r.get("shadowOffsetX"), u = r.get("shadowOffsetY"), f = r.getModel("textStyle"), h = Wy(r, "html"), v = l + "px " + u + "px " + o + "px " + s;
  return i.push("box-shadow:" + v), t && n && i.push(OA(n, e)), a && i.push("background-color:" + a), A(["width", "color", "radius"], function(c) {
    var d = "border-" + c, y = my(d), p = r.get(y);
    p != null && i.push(d + ":" + p + (c === "color" ? "" : "px"));
  }), i.push(NA(f)), h != null && i.push("padding:" + Ms(h).join("px ") + "px"), i.join(";") + ";";
}
function mp(r, t, e, i, n) {
  var a = t && t.painter;
  if (e) {
    var o = a && a.getViewportRoot();
    o && P0(r, o, e, i, n);
  } else {
    r[0] = i, r[1] = n;
    var s = a && a.getViewportRootOffset();
    s && (r[0] += s.offsetLeft, r[1] += s.offsetTop);
  }
  r[2] = r[0] / t.getWidth(), r[3] = r[1] / t.getHeight();
}
var FA = (
  /** @class */
  (function() {
    function r(t, e) {
      if (this._show = !1, this._styleCoord = [0, 0, 0, 0], this._enterable = !0, this._alwaysShowContent = !1, this._firstShow = !0, this._longHide = !0, U.wxa)
        return null;
      var i = document.createElement("div");
      i.domBelongToZr = !0, this.el = i;
      var n = this._zr = t.getZr(), a = e.appendTo, o = a && (z(a) ? document.querySelector(a) : Jn(a) ? a : G(a) && a(t.getDom()));
      mp(this._styleCoord, n, o, t.getWidth() / 2, t.getHeight() / 2), (o || t.getDom()).appendChild(i), this._api = t, this._container = o;
      var s = this;
      i.onmouseenter = function() {
        s._enterable && (clearTimeout(s._hideTimeout), s._show = !0), s._inContent = !0;
      }, i.onmousemove = function(l) {
        if (l = l || window.event, !s._enterable) {
          var u = n.handler, f = n.painter.getViewportRoot();
          re(f, l, !0), u.dispatch("mousemove", l);
        }
      }, i.onmouseleave = function() {
        s._inContent = !1, s._enterable && s._show && s.hideLater(s._hideDelay);
      };
    }
    return r.prototype.update = function(t) {
      if (!this._container) {
        var e = this._api.getDom(), i = PA(e, "position"), n = e.style;
        n.position !== "absolute" && i !== "absolute" && (n.position = "relative");
      }
      var a = t.get("alwaysShowContent");
      a && this._moveIfResized(), this._alwaysShowContent = a, this.el.className = t.get("className") || "";
    }, r.prototype.show = function(t, e) {
      clearTimeout(this._hideTimeout), clearTimeout(this._longHideTimeout);
      var i = this.el, n = i.style, a = this._styleCoord;
      i.innerHTML ? n.cssText = EA + BA(t, !this._firstShow, this._longHide) + yp(a[0], a[1], !0) + ("border-color:" + ei(e) + ";") + (t.get("extraCssText") || "") + (";pointer-events:" + (this._enterable ? "auto" : "none")) : n.display = "none", this._show = !0, this._firstShow = !1, this._longHide = !1;
    }, r.prototype.setContent = function(t, e, i, n, a) {
      var o = this.el;
      if (t == null) {
        o.innerHTML = "";
        return;
      }
      var s = "";
      if (z(a) && i.get("trigger") === "item" && !f_(i) && (s = kA(i, n, a)), z(t))
        o.innerHTML = t + s;
      else if (t) {
        o.innerHTML = "", N(t) || (t = [t]);
        for (var l = 0; l < t.length; l++)
          Jn(t[l]) && t[l].parentNode !== o && o.appendChild(t[l]);
        if (s && o.childNodes.length) {
          var u = document.createElement("div");
          u.innerHTML = s, o.appendChild(u);
        }
      }
    }, r.prototype.setEnterable = function(t) {
      this._enterable = t;
    }, r.prototype.getSize = function() {
      var t = this.el;
      return t ? [t.offsetWidth, t.offsetHeight] : [0, 0];
    }, r.prototype.moveTo = function(t, e) {
      if (this.el) {
        var i = this._styleCoord;
        if (mp(i, this._zr, this._container, t, e), i[0] != null && i[1] != null) {
          var n = this.el.style, a = yp(i[0], i[1]);
          A(a, function(o) {
            n[o[0]] = o[1];
          });
        }
      }
    }, r.prototype._moveIfResized = function() {
      var t = this._styleCoord[2], e = this._styleCoord[3];
      this.moveTo(t * this._zr.getWidth(), e * this._zr.getHeight());
    }, r.prototype.hide = function() {
      var t = this, e = this.el.style;
      e.visibility = "hidden", e.opacity = "0", U.transform3dSupported && (e.willChange = ""), this._show = !1, this._longHideTimeout = setTimeout(function() {
        return t._longHide = !0;
      }, 500);
    }, r.prototype.hideLater = function(t) {
      this._show && !(this._inContent && this._enterable) && !this._alwaysShowContent && (t ? (this._hideDelay = t, this._show = !1, this._hideTimeout = setTimeout(dt(this.hide, this), t)) : this.hide());
    }, r.prototype.isShow = function() {
      return this._show;
    }, r.prototype.dispose = function() {
      clearTimeout(this._hideTimeout), clearTimeout(this._longHideTimeout);
      var t = this.el.parentNode;
      t && t.removeChild(this.el), this.el = this._container = null;
    }, r;
  })()
), zA = (
  /** @class */
  (function() {
    function r(t) {
      this._show = !1, this._styleCoord = [0, 0, 0, 0], this._alwaysShowContent = !1, this._enterable = !0, this._zr = t.getZr(), Sp(this._styleCoord, this._zr, t.getWidth() / 2, t.getHeight() / 2);
    }
    return r.prototype.update = function(t) {
      var e = t.get("alwaysShowContent");
      e && this._moveIfResized(), this._alwaysShowContent = e;
    }, r.prototype.show = function() {
      this._hideTimeout && clearTimeout(this._hideTimeout), this.el.show(), this._show = !0;
    }, r.prototype.setContent = function(t, e, i, n, a) {
      var o = this;
      W(t) && Gt(""), this.el && this._zr.remove(this.el);
      var s = i.getModel("textStyle");
      this.el = new Zt({
        style: {
          rich: e.richTextStyles,
          text: t,
          lineHeight: 22,
          borderWidth: 1,
          borderColor: n,
          textShadowColor: s.get("textShadowColor"),
          fill: i.get(["textStyle", "color"]),
          padding: Wy(i, "richText"),
          verticalAlign: "top",
          align: "left"
        },
        z: i.get("z")
      }), A(["backgroundColor", "borderRadius", "shadowColor", "shadowBlur", "shadowOffsetX", "shadowOffsetY"], function(u) {
        o.el.style[u] = i.get(u);
      }), A(["textShadowBlur", "textShadowOffsetX", "textShadowOffsetY"], function(u) {
        o.el.style[u] = s.get(u) || 0;
      }), this._zr.add(this.el);
      var l = this;
      this.el.on("mouseover", function() {
        l._enterable && (clearTimeout(l._hideTimeout), l._show = !0), l._inContent = !0;
      }), this.el.on("mouseout", function() {
        l._enterable && l._show && l.hideLater(l._hideDelay), l._inContent = !1;
      });
    }, r.prototype.setEnterable = function(t) {
      this._enterable = t;
    }, r.prototype.getSize = function() {
      var t = this.el, e = this.el.getBoundingRect(), i = _p(t.style);
      return [e.width + i.left + i.right, e.height + i.top + i.bottom];
    }, r.prototype.moveTo = function(t, e) {
      var i = this.el;
      if (i) {
        var n = this._styleCoord;
        Sp(n, this._zr, t, e), t = n[0], e = n[1];
        var a = i.style, o = nr(a.borderWidth || 0), s = _p(a);
        i.x = t + o + s.left, i.y = e + o + s.top, i.markRedraw();
      }
    }, r.prototype._moveIfResized = function() {
      var t = this._styleCoord[2], e = this._styleCoord[3];
      this.moveTo(t * this._zr.getWidth(), e * this._zr.getHeight());
    }, r.prototype.hide = function() {
      this.el && this.el.hide(), this._show = !1;
    }, r.prototype.hideLater = function(t) {
      this._show && !(this._inContent && this._enterable) && !this._alwaysShowContent && (t ? (this._hideDelay = t, this._show = !1, this._hideTimeout = setTimeout(dt(this.hide, this), t)) : this.hide());
    }, r.prototype.isShow = function() {
      return this._show;
    }, r.prototype.dispose = function() {
      this._zr.remove(this.el);
    }, r;
  })()
);
function nr(r) {
  return Math.max(0, r);
}
function _p(r) {
  var t = nr(r.shadowBlur || 0), e = nr(r.shadowOffsetX || 0), i = nr(r.shadowOffsetY || 0);
  return {
    left: nr(t - e),
    right: nr(t + e),
    top: nr(t - i),
    bottom: nr(t + i)
  };
}
function Sp(r, t, e, i) {
  r[0] = e, r[1] = i, r[2] = r[0] / t.getWidth(), r[3] = r[1] / t.getHeight();
}
var HA = new Lt({
  shape: {
    x: -1,
    y: -1,
    width: 2,
    height: 2
  }
}), $A = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = t.type, e;
    }
    return t.prototype.init = function(e, i) {
      if (!(U.node || !i.getDom())) {
        var n = e.getComponent("tooltip"), a = this._renderMode = eS(n.get("renderMode"));
        this._tooltipContent = a === "richText" ? new zA(i) : new FA(i, {
          appendTo: n.get("appendToBody", !0) ? "body" : n.get("appendTo", !0)
        });
      }
    }, t.prototype.render = function(e, i, n) {
      if (!(U.node || !n.getDom())) {
        this.group.removeAll(), this._tooltipModel = e, this._ecModel = i, this._api = n;
        var a = this._tooltipContent;
        a.update(e), a.setEnterable(e.get("enterable")), this._initGlobalListener(), this._keepShow(), this._renderMode !== "richText" && e.get("transitionDuration") ? Zy(this, "_updatePosition", 50, "fixRate") : Yu(this, "_updatePosition");
      }
    }, t.prototype._initGlobalListener = function() {
      var e = this._tooltipModel, i = e.get("triggerOn");
      s_("itemTooltip", this._api, dt(function(n, a, o) {
        i !== "none" && (i.indexOf(n) >= 0 ? this._tryShow(a, o) : n === "leave" && this._hide(o));
      }, this));
    }, t.prototype._keepShow = function() {
      var e = this._tooltipModel, i = this._ecModel, n = this._api, a = e.get("triggerOn");
      if (this._lastX != null && this._lastY != null && a !== "none" && a !== "click") {
        var o = this;
        clearTimeout(this._refreshUpdateTimeout), this._refreshUpdateTimeout = setTimeout(function() {
          !n.isDisposed() && o.manuallyShowTip(e, i, n, {
            x: o._lastX,
            y: o._lastY,
            dataByCoordSys: o._lastDataByCoordSys
          });
        });
      }
    }, t.prototype.manuallyShowTip = function(e, i, n, a) {
      if (!(a.from === this.uid || U.node || !n.getDom())) {
        var o = bp(a, n);
        this._ticket = "";
        var s = a.dataByCoordSys, l = UA(a, i, n);
        if (l) {
          var u = l.el.getBoundingRect().clone();
          u.applyTransform(l.el.transform), this._tryShow({
            offsetX: u.x + u.width / 2,
            offsetY: u.y + u.height / 2,
            target: l.el,
            position: a.position,
            // When manully trigger, the mouse is not on the el, so we'd better to
            // position tooltip on the bottom of the el and display arrow is possible.
            positionDefault: "bottom"
          }, o);
        } else if (a.tooltip && a.x != null && a.y != null) {
          var f = HA;
          f.x = a.x, f.y = a.y, f.update(), et(f).tooltipConfig = {
            name: null,
            option: a.tooltip
          }, this._tryShow({
            offsetX: a.x,
            offsetY: a.y,
            target: f
          }, o);
        } else if (s)
          this._tryShow({
            offsetX: a.x,
            offsetY: a.y,
            position: a.position,
            dataByCoordSys: s,
            tooltipOption: a.tooltipOption
          }, o);
        else if (a.seriesIndex != null) {
          if (this._manuallyAxisShowTip(e, i, n, a))
            return;
          var h = l_(a, i), v = h.point[0], c = h.point[1];
          v != null && c != null && this._tryShow({
            offsetX: v,
            offsetY: c,
            target: h.el,
            position: a.position,
            // When manully trigger, the mouse is not on the el, so we'd better to
            // position tooltip on the bottom of the el and display arrow is possible.
            positionDefault: "bottom"
          }, o);
        } else a.x != null && a.y != null && (n.dispatchAction({
          type: "updateAxisPointer",
          x: a.x,
          y: a.y
        }), this._tryShow({
          offsetX: a.x,
          offsetY: a.y,
          position: a.position,
          target: n.getZr().findHover(a.x, a.y).target
        }, o));
      }
    }, t.prototype.manuallyHideTip = function(e, i, n, a) {
      var o = this._tooltipContent;
      this._tooltipModel && o.hideLater(this._tooltipModel.get("hideDelay")), this._lastX = this._lastY = this._lastDataByCoordSys = null, a.from !== this.uid && this._hide(bp(a, n));
    }, t.prototype._manuallyAxisShowTip = function(e, i, n, a) {
      var o = a.seriesIndex, s = a.dataIndex, l = i.getComponent("axisPointer").coordSysAxesInfo;
      if (!(o == null || s == null || l == null)) {
        var u = i.getSeriesByIndex(o);
        if (u) {
          var f = u.getData(), h = bn([f.getItemModel(s), u, (u.coordinateSystem || {}).model], this._tooltipModel);
          if (h.get("trigger") === "axis")
            return n.dispatchAction({
              type: "updateAxisPointer",
              seriesIndex: o,
              dataIndex: s,
              position: a.position
            }), !0;
        }
      }
    }, t.prototype._tryShow = function(e, i) {
      var n = e.target, a = this._tooltipModel;
      if (a) {
        this._lastX = e.offsetX, this._lastY = e.offsetY;
        var o = e.dataByCoordSys;
        if (o && o.length)
          this._showAxisTooltip(o, e);
        else if (n) {
          var s = et(n);
          if (s.ssrType === "legend")
            return;
          this._lastDataByCoordSys = null;
          var l, u;
          Pn(n, function(f) {
            if (et(f).dataIndex != null)
              return l = f, !0;
            if (et(f).tooltipConfig != null)
              return u = f, !0;
          }, !0), l ? this._showSeriesItemTooltip(e, l, i) : u ? this._showComponentItemTooltip(e, u, i) : this._hide(i);
        } else
          this._lastDataByCoordSys = null, this._hide(i);
      }
    }, t.prototype._showOrMove = function(e, i) {
      var n = e.get("showDelay");
      i = dt(i, this), clearTimeout(this._showTimout), n > 0 ? this._showTimout = setTimeout(i, n) : i();
    }, t.prototype._showAxisTooltip = function(e, i) {
      var n = this._ecModel, a = this._tooltipModel, o = [i.offsetX, i.offsetY], s = bn([i.tooltipOption], a), l = this._renderMode, u = [], f = ri("section", {
        blocks: [],
        noHeader: !0
      }), h = [], v = new Rl();
      A(e, function(m) {
        A(m.dataByAxis, function(_) {
          var S = n.getComponent(_.axisDim + "Axis", _.axisIndex), w = _.value;
          if (!(!S || w == null)) {
            var b = a_(w, S.axis, n, _.seriesDataIndices, _.valueLabelOpt), x = ri("section", {
              header: b,
              noHeader: !Me(b),
              sortBlocks: !0,
              blocks: []
            });
            f.blocks.push(x), A(_.seriesDataIndices, function(D) {
              var T = n.getSeriesByIndex(D.seriesIndex), C = D.dataIndexInside, M = T.getDataParams(C);
              if (!(M.dataIndex < 0)) {
                M.axisDim = _.axisDim, M.axisIndex = _.axisIndex, M.axisType = _.axisType, M.axisId = _.axisId, M.axisValue = Th(S.axis, {
                  value: w
                }), M.axisValueLabel = b, M.marker = v.makeTooltipMarker("item", ei(M.color), l);
                var L = $v(T.formatTooltip(C, !0, null)), P = L.frag;
                if (P) {
                  var I = bn([T], a).get("valueFormatter");
                  x.blocks.push(I ? k({
                    valueFormatter: I
                  }, P) : P);
                }
                L.text && h.push(L.text), u.push(M);
              }
            });
          }
        });
      }), f.blocks.reverse(), h.reverse();
      var c = i.position, d = s.get("order"), y = Yv(f, v, l, d, n.get("useUTC"), s.get("textStyle"));
      y && h.unshift(y);
      var p = l === "richText" ? `

` : "<br/>", g = h.join(p);
      this._showOrMove(s, function() {
        this._updateContentNotChangedOnAxis(e, u) ? this._updatePosition(s, c, o[0], o[1], this._tooltipContent, u) : this._showTooltipContent(s, g, u, Math.random() + "", o[0], o[1], c, null, v);
      });
    }, t.prototype._showSeriesItemTooltip = function(e, i, n) {
      var a = this._ecModel, o = et(i), s = o.seriesIndex, l = a.getSeriesByIndex(s), u = o.dataModel || l, f = o.dataIndex, h = o.dataType, v = u.getData(h), c = this._renderMode, d = e.positionDefault, y = bn([v.getItemModel(f), u, l && (l.coordinateSystem || {}).model], this._tooltipModel, d ? {
        position: d
      } : null), p = y.get("trigger");
      if (!(p != null && p !== "item")) {
        var g = u.getDataParams(f, h), m = new Rl();
        g.marker = m.makeTooltipMarker("item", ei(g.color), c);
        var _ = $v(u.formatTooltip(f, !1, h)), S = y.get("order"), w = y.get("valueFormatter"), b = _.frag, x = b ? Yv(w ? k({
          valueFormatter: w
        }, b) : b, m, c, S, a.get("useUTC"), y.get("textStyle")) : _.text, D = "item_" + u.name + "_" + f;
        this._showOrMove(y, function() {
          this._showTooltipContent(y, x, g, D, e.offsetX, e.offsetY, e.position, e.target, m);
        }), n({
          type: "showTip",
          dataIndexInside: f,
          dataIndex: v.getRawIndex(f),
          seriesIndex: s,
          from: this.uid
        });
      }
    }, t.prototype._showComponentItemTooltip = function(e, i, n) {
      var a = this._renderMode === "html", o = et(i), s = o.tooltipConfig, l = s.option || {}, u = l.encodeHTMLContent;
      if (z(l)) {
        var f = l;
        l = {
          content: f,
          // Fixed formatter
          formatter: f
        }, u = !0;
      }
      u && a && l.content && (l = K(l), l.content = $t(l.content));
      var h = [l], v = this._ecModel.getComponent(o.componentMainType, o.componentIndex);
      v && h.push(v), h.push({
        formatter: l.content
      });
      var c = e.positionDefault, d = bn(h, this._tooltipModel, c ? {
        position: c
      } : null), y = d.get("content"), p = Math.random() + "", g = new Rl();
      this._showOrMove(d, function() {
        var m = K(d.get("formatterParams") || {});
        this._showTooltipContent(d, y, m, p, e.offsetX, e.offsetY, e.position, i, g);
      }), n({
        type: "showTip",
        from: this.uid
      });
    }, t.prototype._showTooltipContent = function(e, i, n, a, o, s, l, u, f) {
      if (this._ticket = "", !(!e.get("showContent") || !e.get("show"))) {
        var h = this._tooltipContent;
        h.setEnterable(e.get("enterable"));
        var v = e.get("formatter");
        l = l || e.get("position");
        var c = i, d = this._getNearestPoint([o, s], n, e.get("trigger"), e.get("borderColor")), y = d.color;
        if (v)
          if (z(v)) {
            var p = e.ecModel.get("useUTC"), g = N(n) ? n[0] : n, m = g && g.axisType && g.axisType.indexOf("time") >= 0;
            c = v, m && (c = bs(g.axisValue, c, p)), c = _y(c, n, !0);
          } else if (G(v)) {
            var _ = dt(function(S, w) {
              S === this._ticket && (h.setContent(w, f, e, y, l), this._updatePosition(e, l, o, s, h, n, u));
            }, this);
            this._ticket = a, c = v(n, a, _);
          } else
            c = v;
        h.setContent(c, f, e, y, l), h.show(e, y), this._updatePosition(e, l, o, s, h, n, u);
      }
    }, t.prototype._getNearestPoint = function(e, i, n, a) {
      if (n === "axis" || N(i))
        return {
          color: a || (this._renderMode === "html" ? "#fff" : "none")
        };
      if (!N(i))
        return {
          color: a || i.color || i.borderColor
        };
    }, t.prototype._updatePosition = function(e, i, n, a, o, s, l) {
      var u = this._api.getWidth(), f = this._api.getHeight();
      i = i || e.get("position");
      var h = o.getSize(), v = e.get("align"), c = e.get("verticalAlign"), d = l && l.getBoundingRect().clone();
      if (l && d.applyTransform(l.transform), G(i) && (i = i([n, a], s, o.el, d, {
        viewSize: [u, f],
        contentSize: h.slice()
      })), N(i))
        n = Tt(i[0], u), a = Tt(i[1], f);
      else if (W(i)) {
        var y = i;
        y.width = h[0], y.height = h[1];
        var p = Uo(y, {
          width: u,
          height: f
        });
        n = p.x, a = p.y, v = null, c = null;
      } else if (z(i) && l) {
        var g = WA(i, d, h, e.get("borderWidth"));
        n = g[0], a = g[1];
      } else {
        var g = VA(n, a, o, u, f, v ? null : 20, c ? null : 20);
        n = g[0], a = g[1];
      }
      if (v && (n -= wp(v) ? h[0] / 2 : v === "right" ? h[0] : 0), c && (a -= wp(c) ? h[1] / 2 : c === "bottom" ? h[1] : 0), f_(e)) {
        var g = GA(n, a, o, u, f);
        n = g[0], a = g[1];
      }
      o.moveTo(n, a);
    }, t.prototype._updateContentNotChangedOnAxis = function(e, i) {
      var n = this._lastDataByCoordSys, a = this._cbParamsList, o = !!n && n.length === e.length;
      return o && A(n, function(s, l) {
        var u = s.dataByAxis || [], f = e[l] || {}, h = f.dataByAxis || [];
        o = o && u.length === h.length, o && A(u, function(v, c) {
          var d = h[c] || {}, y = v.seriesDataIndices || [], p = d.seriesDataIndices || [];
          o = o && v.value === d.value && v.axisType === d.axisType && v.axisId === d.axisId && y.length === p.length, o && A(y, function(g, m) {
            var _ = p[m];
            o = o && g.seriesIndex === _.seriesIndex && g.dataIndex === _.dataIndex;
          }), a && A(v.seriesDataIndices, function(g) {
            var m = g.seriesIndex, _ = i[m], S = a[m];
            _ && S && S.data !== _.data && (o = !1);
          });
        });
      }), this._lastDataByCoordSys = e, this._cbParamsList = i, !!o;
    }, t.prototype._hide = function(e) {
      this._lastDataByCoordSys = null, e({
        type: "hideTip",
        from: this.uid
      });
    }, t.prototype.dispose = function(e, i) {
      U.node || !i.getDom() || (Yu(this, "_updatePosition"), this._tooltipContent.dispose(), hf("itemTooltip", i));
    }, t.type = "tooltip", t;
  })(me)
);
function bn(r, t, e) {
  var i = t.ecModel, n;
  e ? (n = new yt(e, i, i), n = new yt(t.option, n, i)) : n = t;
  for (var a = r.length - 1; a >= 0; a--) {
    var o = r[a];
    o && (o instanceof yt && (o = o.get("tooltip", !0)), z(o) && (o = {
      formatter: o
    }), o && (n = new yt(o, n, i)));
  }
  return n;
}
function bp(r, t) {
  return r.dispatchAction || dt(t.dispatchAction, t);
}
function VA(r, t, e, i, n, a, o) {
  var s = e.getSize(), l = s[0], u = s[1];
  return a != null && (r + l + a + 2 > i ? r -= l + a : r += a), o != null && (t + u + o > n ? t -= u + o : t += o), [r, t];
}
function GA(r, t, e, i, n) {
  var a = e.getSize(), o = a[0], s = a[1];
  return r = Math.min(r + o, i) - o, t = Math.min(t + s, n) - s, r = Math.max(r, 0), t = Math.max(t, 0), [r, t];
}
function WA(r, t, e, i) {
  var n = e[0], a = e[1], o = Math.ceil(Math.SQRT2 * i) + 8, s = 0, l = 0, u = t.width, f = t.height;
  switch (r) {
    case "inside":
      s = t.x + u / 2 - n / 2, l = t.y + f / 2 - a / 2;
      break;
    case "top":
      s = t.x + u / 2 - n / 2, l = t.y - a - o;
      break;
    case "bottom":
      s = t.x + u / 2 - n / 2, l = t.y + f + o;
      break;
    case "left":
      s = t.x - n - o, l = t.y + f / 2 - a / 2;
      break;
    case "right":
      s = t.x + u + o, l = t.y + f / 2 - a / 2;
  }
  return [s, l];
}
function wp(r) {
  return r === "center" || r === "middle";
}
function UA(r, t, e) {
  var i = $f(r).queryOptionMap, n = i.keys()[0];
  if (!(!n || n === "series")) {
    var a = ya(t, n, i.get(n), {
      useDefault: !1,
      enableAll: !1,
      enableNone: !1
    }), o = a.models[0];
    if (o) {
      var s = e.getViewOfComponentModel(o), l;
      if (s.group.traverse(function(u) {
        var f = et(u).tooltipConfig;
        if (f && f.name === r.name)
          return l = u, !0;
      }), l)
        return {
          componentMainType: n,
          componentIndex: o.componentIndex,
          el: l
        };
    }
  }
}
function YA(r) {
  pr(u_), r.registerComponentModel(AA), r.registerComponentView($A), r.registerAction({
    type: "showTip",
    event: "showTip",
    update: "tooltip:manuallyShowTip"
  }, Ut), r.registerAction({
    type: "hideTip",
    event: "hideTip",
    update: "tooltip:manuallyHideTip"
  }, Ut);
}
function d_(r, t) {
  if (!r)
    return !1;
  for (var e = N(r) ? r : [r], i = 0; i < e.length; i++)
    if (e[i] && e[i][t])
      return !0;
  return !1;
}
function io(r) {
  Lu(r, "label", ["show"]);
}
var no = mt(), ni = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = t.type, e.createdBySelf = !1, e;
    }
    return t.prototype.init = function(e, i, n) {
      this.mergeDefaultAndTheme(e, n), this._mergeOption(e, n, !1, !0);
    }, t.prototype.isAnimationEnabled = function() {
      if (U.node)
        return !1;
      var e = this.__hostSeries;
      return this.getShallow("animation") && e && e.isAnimationEnabled();
    }, t.prototype.mergeOption = function(e, i) {
      this._mergeOption(e, i, !1, !1);
    }, t.prototype._mergeOption = function(e, i, n, a) {
      var o = this.mainType;
      n || i.eachSeries(function(s) {
        var l = s.get(this.mainType, !0), u = no(s)[o];
        if (!l || !l.data) {
          no(s)[o] = null;
          return;
        }
        u ? u._mergeOption(l, i, !0) : (a && io(l), A(l.data, function(f) {
          f instanceof Array ? (io(f[0]), io(f[1])) : io(f);
        }), u = this.createMarkerModelFromSeries(l, this, i), k(u, {
          mainType: this.mainType,
          // Use the same series index and name
          seriesIndex: s.seriesIndex,
          name: s.name,
          createdBySelf: !0
        }), u.__hostSeries = s), no(s)[o] = u;
      }, this);
    }, t.prototype.formatTooltip = function(e, i, n) {
      var a = this.getData(), o = this.getRawValue(e), s = a.getName(e);
      return ri("section", {
        header: this.name,
        blocks: [ri("nameValue", {
          name: s,
          value: o,
          noName: !s,
          noValue: o == null
        })]
      });
    }, t.prototype.getData = function() {
      return this._data;
    }, t.prototype.setData = function(e) {
      this._data = e;
    }, t.prototype.getDataParams = function(e, i) {
      var n = vh.prototype.getDataParams.call(this, e, i), a = this.__hostSeries;
      return a && (n.seriesId = a.id, n.seriesName = a.name, n.seriesType = a.subType), n;
    }, t.getMarkerModelFromSeries = function(e, i) {
      return no(e)[i];
    }, t.type = "marker", t.dependencies = ["series", "grid", "polar", "geo"], t;
  })(at)
);
_e(ni, vh.prototype);
var XA = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = t.type, e;
    }
    return t.prototype.createMarkerModelFromSeries = function(e, i, n) {
      return new t(e, i, n);
    }, t.type = "markPoint", t.defaultOption = {
      // zlevel: 0,
      z: 5,
      symbol: "pin",
      symbolSize: 50,
      // symbolRotate: 0,
      // symbolOffset: [0, 0]
      tooltip: {
        trigger: "item"
      },
      label: {
        show: !0,
        position: "inside"
      },
      itemStyle: {
        borderWidth: 2
      },
      emphasis: {
        label: {
          show: !0
        }
      }
    }, t;
  })(ni)
);
function ZA(r) {
  return !(isNaN(parseFloat(r.x)) && isNaN(parseFloat(r.y)));
}
function qA(r) {
  return !isNaN(parseFloat(r.x)) && !isNaN(parseFloat(r.y));
}
function ao(r, t, e, i, n, a) {
  var o = [], s = Yi(
    t,
    i
    /* , otherDataDim */
  ), l = s ? t.getCalculationInfo("stackResultDimension") : i, u = Ph(t, l, r), f = t.indicesOfNearest(l, u)[0];
  o[n] = t.get(e, f), o[a] = t.get(l, f);
  var h = t.get(i, f), v = De(t.get(i, f));
  return v = Math.min(v, 20), v >= 0 && (o[a] = +o[a].toFixed(v)), [o, h];
}
var iu = {
  min: ht(ao, "min"),
  max: ht(ao, "max"),
  average: ht(ao, "average"),
  median: ht(ao, "median")
};
function cf(r, t) {
  if (t) {
    var e = r.getData(), i = r.coordinateSystem, n = i && i.dimensions;
    if (!qA(t) && !N(t.coord) && N(n)) {
      var a = p_(t, e, i, r);
      if (t = K(t), t.type && iu[t.type] && a.baseAxis && a.valueAxis) {
        var o = rt(n, a.baseAxis.dim), s = rt(n, a.valueAxis.dim), l = iu[t.type](e, a.baseDataDim, a.valueDataDim, o, s);
        t.coord = l[0], t.value = l[1];
      } else
        t.coord = [t.xAxis != null ? t.xAxis : t.radiusAxis, t.yAxis != null ? t.yAxis : t.angleAxis];
    }
    if (t.coord == null || !N(n))
      t.coord = [];
    else
      for (var u = t.coord, f = 0; f < 2; f++)
        iu[u[f]] && (u[f] = Ph(e, e.mapDimension(n[f]), u[f]));
    return t;
  }
}
function p_(r, t, e, i) {
  var n = {};
  return r.valueIndex != null || r.valueDim != null ? (n.valueDataDim = r.valueIndex != null ? t.getDimension(r.valueIndex) : r.valueDim, n.valueAxis = e.getAxis(KA(i, n.valueDataDim)), n.baseAxis = e.getOtherAxis(n.valueAxis), n.baseDataDim = t.mapDimension(n.baseAxis.dim)) : (n.baseAxis = i.getBaseAxis(), n.valueAxis = e.getOtherAxis(n.baseAxis), n.baseDataDim = t.mapDimension(n.baseAxis.dim), n.valueDataDim = t.mapDimension(n.valueAxis.dim)), n;
}
function KA(r, t) {
  var e = r.getData().getDimensionInfo(t);
  return e && e.coordDim;
}
function vf(r, t) {
  return r && r.containData && t.coord && !ZA(t) ? r.containData(t.coord) : !0;
}
function g_(r, t) {
  return r ? function(e, i, n, a) {
    var o = a < 2 ? e.coord && e.coord[a] : e.value;
    return Fi(o, t[a]);
  } : function(e, i, n, a) {
    return Fi(e.value, t[a]);
  };
}
function Ph(r, t, e) {
  if (e === "average") {
    var i = 0, n = 0;
    return r.each(t, function(a, o) {
      isNaN(a) || (i += a, n++);
    }), i / n;
  } else return e === "median" ? r.getMedian(t) : r.getDataExtent(t)[e === "max" ? 1 : 0];
}
var nu = mt(), y_ = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = t.type, e;
    }
    return t.prototype.init = function() {
      this.markerGroupMap = Z();
    }, t.prototype.render = function(e, i, n) {
      var a = this, o = this.markerGroupMap;
      o.each(function(s) {
        nu(s).keep = !1;
      }), i.eachSeries(function(s) {
        var l = ni.getMarkerModelFromSeries(s, a.type);
        l && a.renderSeries(s, l, i, n);
      }), o.each(function(s) {
        !nu(s).keep && a.group.remove(s.group);
      });
    }, t.prototype.markKeep = function(e) {
      nu(e).keep = !0;
    }, t.prototype.toggleBlurSeries = function(e, i) {
      var n = this;
      A(e, function(a) {
        var o = ni.getMarkerModelFromSeries(a, n.type);
        if (o) {
          var s = o.getData();
          s.eachItemGraphicEl(function(l) {
            l && (i ? Hg(l) : Yf(l));
          });
        }
      });
    }, t.type = "marker", t;
  })(me)
);
function xp(r, t, e) {
  var i = t.coordinateSystem;
  r.each(function(n) {
    var a = r.getItemModel(n), o, s = Tt(a.get("x"), e.getWidth()), l = Tt(a.get("y"), e.getHeight());
    if (!isNaN(s) && !isNaN(l))
      o = [s, l];
    else if (t.getMarkerPosition)
      o = t.getMarkerPosition(r.getValues(r.dimensions, n));
    else if (i) {
      var u = r.get(i.dimensions[0], n), f = r.get(i.dimensions[1], n);
      o = i.dataToPoint([u, f]);
    }
    isNaN(s) || (o[0] = s), isNaN(l) || (o[1] = l), r.setItemLayout(n, o);
  });
}
var jA = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = t.type, e;
    }
    return t.prototype.updateTransform = function(e, i, n) {
      i.eachSeries(function(a) {
        var o = ni.getMarkerModelFromSeries(a, "markPoint");
        o && (xp(o.getData(), a, n), this.markerGroupMap.get(a.id).updateLayout());
      }, this);
    }, t.prototype.renderSeries = function(e, i, n, a) {
      var o = e.coordinateSystem, s = e.id, l = e.getData(), u = this.markerGroupMap, f = u.get(s) || u.set(s, new Ym()), h = QA(o, e, i);
      i.setData(h), xp(i.getData(), e, a), h.each(function(v) {
        var c = h.getItemModel(v), d = c.getShallow("symbol"), y = c.getShallow("symbolSize"), p = c.getShallow("symbolRotate"), g = c.getShallow("symbolOffset"), m = c.getShallow("symbolKeepAspect");
        if (G(d) || G(y) || G(p) || G(g)) {
          var _ = i.getRawValue(v), S = i.getDataParams(v);
          G(d) && (d = d(_, S)), G(y) && (y = y(_, S)), G(p) && (p = p(_, S)), G(g) && (g = g(_, S));
        }
        var w = c.getModel("itemStyle").getItemStyle(), b = ph(l, "color");
        w.fill || (w.fill = b), h.setItemVisual(v, {
          symbol: d,
          symbolSize: y,
          symbolRotate: p,
          symbolOffset: g,
          symbolKeepAspect: m,
          style: w
        });
      }), f.updateData(h), this.group.add(f.group), h.eachItemGraphicEl(function(v) {
        v.traverse(function(c) {
          et(c).dataModel = i;
        });
      }), this.markKeep(f), f.group.silent = i.get("silent") || e.get("silent");
    }, t.type = "markPoint", t;
  })(y_)
);
function QA(r, t, e) {
  var i;
  r ? i = H(r && r.dimensions, function(s) {
    var l = t.getData().getDimensionInfo(t.getData().mapDimension(s)) || {};
    return k(k({}, l), {
      name: s,
      // DON'T use ordinalMeta to parse and collect ordinal.
      ordinalMeta: null
    });
  }) : i = [{
    name: "value",
    type: "float"
  }];
  var n = new Xn(i, e), a = H(e.get("data"), ht(cf, t));
  r && (a = xt(a, ht(vf, r)));
  var o = g_(!!r, i);
  return n.initData(a, null, o), n;
}
function JA(r) {
  r.registerComponentModel(XA), r.registerComponentView(jA), r.registerPreprocessor(function(t) {
    d_(t.series, "markPoint") && (t.markPoint = t.markPoint || {});
  });
}
var tL = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = t.type, e;
    }
    return t.prototype.createMarkerModelFromSeries = function(e, i, n) {
      return new t(e, i, n);
    }, t.type = "markLine", t.defaultOption = {
      // zlevel: 0,
      z: 5,
      symbol: ["circle", "arrow"],
      symbolSize: [8, 16],
      // symbolRotate: 0,
      symbolOffset: 0,
      precision: 2,
      tooltip: {
        trigger: "item"
      },
      label: {
        show: !0,
        position: "end",
        distance: 5
      },
      lineStyle: {
        type: "dashed"
      },
      emphasis: {
        label: {
          show: !0
        },
        lineStyle: {
          width: 3
        }
      },
      animationEasing: "linear"
    }, t;
  })(ni)
), oo = mt(), eL = function(r, t, e, i) {
  var n = r.getData(), a;
  if (N(i))
    a = i;
  else {
    var o = i.type;
    if (o === "min" || o === "max" || o === "average" || o === "median" || i.xAxis != null || i.yAxis != null) {
      var s = void 0, l = void 0;
      if (i.yAxis != null || i.xAxis != null)
        s = t.getAxis(i.yAxis != null ? "y" : "x"), l = Vi(i.yAxis, i.xAxis);
      else {
        var u = p_(i, n, t, r);
        s = u.valueAxis;
        var f = Pm(n, u.valueDataDim);
        l = Ph(n, f, o);
      }
      var h = s.dim === "x" ? 0 : 1, v = 1 - h, c = K(i), d = {
        coord: []
      };
      c.type = null, c.coord = [], c.coord[v] = -1 / 0, d.coord[v] = 1 / 0;
      var y = e.get("precision");
      y >= 0 && vt(l) && (l = +l.toFixed(Math.min(y, 20))), c.coord[h] = d.coord[h] = l, a = [c, d, {
        type: o,
        valueIndex: i.valueIndex,
        // Force to use the value of calculated value.
        value: l
      }];
    } else
      a = [];
  }
  var p = [cf(r, a[0]), cf(r, a[1]), k({}, a[2])];
  return p[2].type = p[2].type || null, Q(p[2], p[0]), Q(p[2], p[1]), p;
};
function Qo(r) {
  return !isNaN(r) && !isFinite(r);
}
function Tp(r, t, e, i) {
  var n = 1 - r, a = i.dimensions[r];
  return Qo(t[n]) && Qo(e[n]) && t[r] === e[r] && i.getAxis(a).containData(t[r]);
}
function rL(r, t) {
  if (r.type === "cartesian2d") {
    var e = t[0].coord, i = t[1].coord;
    if (e && i && (Tp(1, e, i, r) || Tp(0, e, i, r)))
      return !0;
  }
  return vf(r, t[0]) && vf(r, t[1]);
}
function au(r, t, e, i, n) {
  var a = i.coordinateSystem, o = r.getItemModel(t), s, l = Tt(o.get("x"), n.getWidth()), u = Tt(o.get("y"), n.getHeight());
  if (!isNaN(l) && !isNaN(u))
    s = [l, u];
  else {
    if (i.getMarkerPosition)
      s = i.getMarkerPosition(r.getValues(r.dimensions, t));
    else {
      var f = a.dimensions, h = r.get(f[0], t), v = r.get(f[1], t);
      s = a.dataToPoint([h, v]);
    }
    if (Km(a, "cartesian2d")) {
      var c = a.getAxis("x"), d = a.getAxis("y"), f = a.dimensions;
      Qo(r.get(f[0], t)) ? s[0] = c.toGlobalCoord(c.getExtent()[e ? 0 : 1]) : Qo(r.get(f[1], t)) && (s[1] = d.toGlobalCoord(d.getExtent()[e ? 0 : 1]));
    }
    isNaN(l) || (s[0] = l), isNaN(u) || (s[1] = u);
  }
  r.setItemLayout(t, s);
}
var iL = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = t.type, e;
    }
    return t.prototype.updateTransform = function(e, i, n) {
      i.eachSeries(function(a) {
        var o = ni.getMarkerModelFromSeries(a, "markLine");
        if (o) {
          var s = o.getData(), l = oo(o).from, u = oo(o).to;
          l.each(function(f) {
            au(l, f, !0, a, n), au(u, f, !1, a, n);
          }), s.each(function(f) {
            s.setItemLayout(f, [l.getItemLayout(f), u.getItemLayout(f)]);
          }), this.markerGroupMap.get(a.id).updateLayout();
        }
      }, this);
    }, t.prototype.renderSeries = function(e, i, n, a) {
      var o = e.coordinateSystem, s = e.id, l = e.getData(), u = this.markerGroupMap, f = u.get(s) || u.set(s, new tA());
      this.group.add(f.group);
      var h = nL(o, e, i), v = h.from, c = h.to, d = h.line;
      oo(i).from = v, oo(i).to = c, i.setData(d);
      var y = i.get("symbol"), p = i.get("symbolSize"), g = i.get("symbolRotate"), m = i.get("symbolOffset");
      N(y) || (y = [y, y]), N(p) || (p = [p, p]), N(g) || (g = [g, g]), N(m) || (m = [m, m]), h.from.each(function(S) {
        _(v, S, !0), _(c, S, !1);
      }), d.each(function(S) {
        var w = d.getItemModel(S).getModel("lineStyle").getLineStyle();
        d.setItemLayout(S, [v.getItemLayout(S), c.getItemLayout(S)]), w.stroke == null && (w.stroke = v.getItemVisual(S, "style").fill), d.setItemVisual(S, {
          fromSymbolKeepAspect: v.getItemVisual(S, "symbolKeepAspect"),
          fromSymbolOffset: v.getItemVisual(S, "symbolOffset"),
          fromSymbolRotate: v.getItemVisual(S, "symbolRotate"),
          fromSymbolSize: v.getItemVisual(S, "symbolSize"),
          fromSymbol: v.getItemVisual(S, "symbol"),
          toSymbolKeepAspect: c.getItemVisual(S, "symbolKeepAspect"),
          toSymbolOffset: c.getItemVisual(S, "symbolOffset"),
          toSymbolRotate: c.getItemVisual(S, "symbolRotate"),
          toSymbolSize: c.getItemVisual(S, "symbolSize"),
          toSymbol: c.getItemVisual(S, "symbol"),
          style: w
        });
      }), f.updateData(d), h.line.eachItemGraphicEl(function(S) {
        et(S).dataModel = i, S.traverse(function(w) {
          et(w).dataModel = i;
        });
      });
      function _(S, w, b) {
        var x = S.getItemModel(w);
        au(S, w, b, e, a);
        var D = x.getModel("itemStyle").getItemStyle();
        D.fill == null && (D.fill = ph(l, "color")), S.setItemVisual(w, {
          symbolKeepAspect: x.get("symbolKeepAspect"),
          // `0` should be considered as a valid value, so use `retrieve2` instead of `||`
          symbolOffset: X(x.get("symbolOffset", !0), m[b ? 0 : 1]),
          symbolRotate: X(x.get("symbolRotate", !0), g[b ? 0 : 1]),
          // TODO: when 2d array is supported, it should ignore parent
          symbolSize: X(x.get("symbolSize"), p[b ? 0 : 1]),
          symbol: X(x.get("symbol", !0), y[b ? 0 : 1]),
          style: D
        });
      }
      this.markKeep(f), f.group.silent = i.get("silent") || e.get("silent");
    }, t.type = "markLine", t;
  })(y_)
);
function nL(r, t, e) {
  var i;
  r ? i = H(r && r.dimensions, function(u) {
    var f = t.getData().getDimensionInfo(t.getData().mapDimension(u)) || {};
    return k(k({}, f), {
      name: u,
      // DON'T use ordinalMeta to parse and collect ordinal.
      ordinalMeta: null
    });
  }) : i = [{
    name: "value",
    type: "float"
  }];
  var n = new Xn(i, e), a = new Xn(i, e), o = new Xn([], e), s = H(e.get("data"), ht(eL, t, r, e));
  r && (s = xt(s, ht(rL, r)));
  var l = g_(!!r, i);
  return n.initData(H(s, function(u) {
    return u[0];
  }), null, l), a.initData(H(s, function(u) {
    return u[1];
  }), null, l), o.initData(H(s, function(u) {
    return u[2];
  })), o.hasItemOption = !0, {
    from: n,
    to: a,
    line: o
  };
}
function aL(r) {
  r.registerComponentModel(tL), r.registerComponentView(iL), r.registerPreprocessor(function(t) {
    d_(t.series, "markLine") && (t.markLine = t.markLine || {});
  });
}
var oL = function(r, t) {
  if (t === "all")
    return {
      type: "all",
      title: r.getLocaleModel().get(["legend", "selector", "all"])
    };
  if (t === "inverse")
    return {
      type: "inverse",
      title: r.getLocaleModel().get(["legend", "selector", "inverse"])
    };
}, df = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = t.type, e.layoutMode = {
        type: "box",
        // legend.width/height are maxWidth/maxHeight actually,
        // whereas real width/height is calculated by its content.
        // (Setting {left: 10, right: 10} does not make sense).
        // So consider the case:
        // `setOption({legend: {left: 10});`
        // then `setOption({legend: {right: 10});`
        // The previous `left` should be cleared by setting `ignoreSize`.
        ignoreSize: !0
      }, e;
    }
    return t.prototype.init = function(e, i, n) {
      this.mergeDefaultAndTheme(e, n), e.selected = e.selected || {}, this._updateSelector(e);
    }, t.prototype.mergeOption = function(e, i) {
      r.prototype.mergeOption.call(this, e, i), this._updateSelector(e);
    }, t.prototype._updateSelector = function(e) {
      var i = e.selector, n = this.ecModel;
      i === !0 && (i = e.selector = ["all", "inverse"]), N(i) && A(i, function(a, o) {
        z(a) && (a = {
          type: a
        }), i[o] = Q(a, oL(n, a.type));
      });
    }, t.prototype.optionUpdated = function() {
      this._updateData(this.ecModel);
      var e = this._data;
      if (e[0] && this.get("selectedMode") === "single") {
        for (var i = !1, n = 0; n < e.length; n++) {
          var a = e[n].get("name");
          if (this.isSelected(a)) {
            this.select(a), i = !0;
            break;
          }
        }
        !i && this.select(e[0].get("name"));
      }
    }, t.prototype._updateData = function(e) {
      var i = [], n = [];
      e.eachRawSeries(function(l) {
        var u = l.name;
        n.push(u);
        var f;
        if (l.legendVisualProvider) {
          var h = l.legendVisualProvider, v = h.getAllNames();
          e.isSeriesFiltered(l) || (n = n.concat(v)), v.length ? i = i.concat(v) : f = !0;
        } else
          f = !0;
        f && Hf(l) && i.push(l.name);
      }), this._availableNames = n;
      var a = this.get("data") || i, o = Z(), s = H(a, function(l) {
        return (z(l) || vt(l)) && (l = {
          name: l
        }), o.get(l.name) ? null : (o.set(l.name, !0), new yt(l, this, this.ecModel));
      }, this);
      this._data = xt(s, function(l) {
        return !!l;
      });
    }, t.prototype.getData = function() {
      return this._data;
    }, t.prototype.select = function(e) {
      var i = this.option.selected, n = this.get("selectedMode");
      if (n === "single") {
        var a = this._data;
        A(a, function(o) {
          i[o.get("name")] = !1;
        });
      }
      i[e] = !0;
    }, t.prototype.unSelect = function(e) {
      this.get("selectedMode") !== "single" && (this.option.selected[e] = !1);
    }, t.prototype.toggleSelected = function(e) {
      var i = this.option.selected;
      i.hasOwnProperty(e) || (i[e] = !0), this[i[e] ? "unSelect" : "select"](e);
    }, t.prototype.allSelect = function() {
      var e = this._data, i = this.option.selected;
      A(e, function(n) {
        i[n.get("name", !0)] = !0;
      });
    }, t.prototype.inverseSelect = function() {
      var e = this._data, i = this.option.selected;
      A(e, function(n) {
        var a = n.get("name", !0);
        i.hasOwnProperty(a) || (i[a] = !0), i[a] = !i[a];
      });
    }, t.prototype.isSelected = function(e) {
      var i = this.option.selected;
      return !(i.hasOwnProperty(e) && !i[e]) && rt(this._availableNames, e) >= 0;
    }, t.prototype.getOrient = function() {
      return this.get("orient") === "vertical" ? {
        index: 1,
        name: "vertical"
      } : {
        index: 0,
        name: "horizontal"
      };
    }, t.type = "legend.plain", t.dependencies = ["series"], t.defaultOption = {
      // zlevel: 0,
      z: 4,
      show: !0,
      orient: "horizontal",
      left: "center",
      // right: 'center',
      top: 0,
      // bottom: null,
      align: "auto",
      backgroundColor: "rgba(0,0,0,0)",
      borderColor: "#ccc",
      borderRadius: 0,
      borderWidth: 0,
      padding: 5,
      itemGap: 10,
      itemWidth: 25,
      itemHeight: 14,
      symbolRotate: "inherit",
      symbolKeepAspect: !0,
      inactiveColor: "#ccc",
      inactiveBorderColor: "#ccc",
      inactiveBorderWidth: "auto",
      itemStyle: {
        color: "inherit",
        opacity: "inherit",
        borderColor: "inherit",
        borderWidth: "auto",
        borderCap: "inherit",
        borderJoin: "inherit",
        borderDashOffset: "inherit",
        borderMiterLimit: "inherit"
      },
      lineStyle: {
        width: "auto",
        color: "inherit",
        inactiveColor: "#ccc",
        inactiveWidth: 2,
        opacity: "inherit",
        type: "inherit",
        cap: "inherit",
        join: "inherit",
        dashOffset: "inherit",
        miterLimit: "inherit"
      },
      textStyle: {
        color: "#333"
      },
      selectedMode: !0,
      selector: !1,
      selectorLabel: {
        show: !0,
        borderRadius: 10,
        padding: [3, 5, 3, 5],
        fontSize: 12,
        fontFamily: "sans-serif",
        color: "#666",
        borderWidth: 1,
        borderColor: "#666"
      },
      emphasis: {
        selectorLabel: {
          show: !0,
          color: "#eee",
          backgroundColor: "#666"
        }
      },
      selectorPosition: "auto",
      selectorItemGap: 7,
      selectorButtonGap: 10,
      tooltip: {
        show: !1
      }
    }, t;
  })(at)
), bi = ht, pf = A, so = Dt, m_ = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = t.type, e.newlineDisabled = !1, e;
    }
    return t.prototype.init = function() {
      this.group.add(this._contentGroup = new so()), this.group.add(this._selectorGroup = new so()), this._isFirstRender = !0;
    }, t.prototype.getContentGroup = function() {
      return this._contentGroup;
    }, t.prototype.getSelectorGroup = function() {
      return this._selectorGroup;
    }, t.prototype.render = function(e, i, n) {
      var a = this._isFirstRender;
      if (this._isFirstRender = !1, this.resetInner(), !!e.get("show", !0)) {
        var o = e.get("align"), s = e.get("orient");
        (!o || o === "auto") && (o = e.get("left") === "right" && s === "vertical" ? "right" : "left");
        var l = e.get("selector", !0), u = e.get("selectorPosition", !0);
        l && (!u || u === "auto") && (u = s === "horizontal" ? "end" : "start"), this.renderInner(o, e, i, n, l, s, u);
        var f = e.getBoxLayoutParams(), h = {
          width: n.getWidth(),
          height: n.getHeight()
        }, v = e.get("padding"), c = Uo(f, h, v), d = this.layoutInner(e, o, c, a, l, u), y = Uo(ot({
          width: d.width,
          height: d.height
        }, f), h, v);
        this.group.x = y.x - d.x, this.group.y = y.y - d.y, this.group.markRedraw(), this.group.add(this._backgroundEl = DA(d, e));
      }
    }, t.prototype.resetInner = function() {
      this.getContentGroup().removeAll(), this._backgroundEl && this.group.remove(this._backgroundEl), this.getSelectorGroup().removeAll();
    }, t.prototype.renderInner = function(e, i, n, a, o, s, l) {
      var u = this.getContentGroup(), f = Z(), h = i.get("selectedMode"), v = [];
      n.eachRawSeries(function(c) {
        !c.get("legendHoverLink") && v.push(c.id);
      }), pf(i.getData(), function(c, d) {
        var y = c.get("name");
        if (!this.newlineDisabled && (y === "" || y === `
`)) {
          var p = new so();
          p.newline = !0, u.add(p);
          return;
        }
        var g = n.getSeriesByName(y)[0];
        if (!f.get(y))
          if (g) {
            var m = g.getData(), _ = m.getVisual("legendLineStyle") || {}, S = m.getVisual("legendIcon"), w = m.getVisual("style"), b = this._createItem(g, y, d, c, i, e, _, w, S, h, a);
            b.on("click", bi(Cp, y, null, a, v)).on("mouseover", bi(gf, g.name, null, a, v)).on("mouseout", bi(yf, g.name, null, a, v)), n.ssr && b.eachChild(function(x) {
              var D = et(x);
              D.seriesIndex = g.seriesIndex, D.dataIndex = d, D.ssrType = "legend";
            }), f.set(y, !0);
          } else
            n.eachRawSeries(function(x) {
              if (!f.get(y) && x.legendVisualProvider) {
                var D = x.legendVisualProvider;
                if (!D.containName(y))
                  return;
                var T = D.indexOfName(y), C = D.getItemVisual(T, "style"), M = D.getItemVisual(T, "legendIcon"), L = ze(C.fill);
                L && L[3] === 0 && (L[3] = 0.2, C = k(k({}, C), {
                  fill: ns(L, "rgba")
                }));
                var P = this._createItem(x, y, d, c, i, e, {}, C, M, h, a);
                P.on("click", bi(Cp, null, y, a, v)).on("mouseover", bi(gf, null, y, a, v)).on("mouseout", bi(yf, null, y, a, v)), n.ssr && P.eachChild(function(I) {
                  var E = et(I);
                  E.seriesIndex = x.seriesIndex, E.dataIndex = d, E.ssrType = "legend";
                }), f.set(y, !0);
              }
            }, this);
      }, this), o && this._createSelector(o, i, a, s, l);
    }, t.prototype._createSelector = function(e, i, n, a, o) {
      var s = this.getSelectorGroup();
      pf(e, function(u) {
        var f = u.type, h = new Zt({
          style: {
            x: 0,
            y: 0,
            align: "center",
            verticalAlign: "middle"
          },
          onclick: function() {
            n.dispatchAction({
              type: f === "all" ? "legendAllSelect" : "legendInverseSelect",
              legendId: i.id
            });
          }
        });
        s.add(h);
        var v = i.getModel("selectorLabel"), c = i.getModel(["emphasis", "selectorLabel"]);
        _s(h, {
          normal: v,
          emphasis: c
        }, {
          defaultText: u.title
        }), Ou(h);
      });
    }, t.prototype._createItem = function(e, i, n, a, o, s, l, u, f, h, v) {
      var c = e.visualDrawType, d = o.get("itemWidth"), y = o.get("itemHeight"), p = o.isSelected(i), g = a.get("symbolRotate"), m = a.get("symbolKeepAspect"), _ = a.get("icon");
      f = _ || f || "roundRect";
      var S = sL(f, a, l, u, c, p, v), w = new so(), b = a.getModel("textStyle");
      if (G(e.getLegendIcon) && (!_ || _ === "inherit"))
        w.add(e.getLegendIcon({
          itemWidth: d,
          itemHeight: y,
          icon: f,
          iconRotate: g,
          itemStyle: S.itemStyle,
          lineStyle: S.lineStyle,
          symbolKeepAspect: m
        }));
      else {
        var x = _ === "inherit" && e.getData().getVisual("symbol") ? g === "inherit" ? e.getData().getVisual("symbolRotate") : g : 0;
        w.add(lL({
          itemWidth: d,
          itemHeight: y,
          icon: f,
          iconRotate: x,
          itemStyle: S.itemStyle,
          symbolKeepAspect: m
        }));
      }
      var D = s === "left" ? d + 5 : -5, T = s, C = o.get("formatter"), M = i;
      z(C) && C ? M = C.replace("{name}", i ?? "") : G(C) && (M = C(i));
      var L = p ? b.getTextColor() : a.get("inactiveColor");
      w.add(new Zt({
        style: Gi(b, {
          text: M,
          x: D,
          y: y / 2,
          fill: L,
          align: T,
          verticalAlign: "middle"
        }, {
          inheritColor: L
        })
      }));
      var P = new Lt({
        shape: w.getBoundingRect(),
        style: {
          // Cannot use 'invisible' because SVG SSR will miss the node
          fill: "transparent"
        }
      }), I = a.getModel("tooltip");
      return I.get("show") && gs({
        el: P,
        componentModel: o,
        itemName: i,
        itemTooltipOption: I.option
      }), w.add(P), w.eachChild(function(E) {
        E.silent = !0;
      }), P.silent = !h, this.getContentGroup().add(w), Ou(w), w.__legendDataIndex = n, w;
    }, t.prototype.layoutInner = function(e, i, n, a, o, s) {
      var l = this.getContentGroup(), u = this.getSelectorGroup();
      Gn(e.get("orient"), l, e.get("itemGap"), n.width, n.height);
      var f = l.getBoundingRect(), h = [-f.x, -f.y];
      if (u.markRedraw(), l.markRedraw(), o) {
        Gn(
          // Buttons in selectorGroup always layout horizontally
          "horizontal",
          u,
          e.get("selectorItemGap", !0)
        );
        var v = u.getBoundingRect(), c = [-v.x, -v.y], d = e.get("selectorButtonGap", !0), y = e.getOrient().index, p = y === 0 ? "width" : "height", g = y === 0 ? "height" : "width", m = y === 0 ? "y" : "x";
        s === "end" ? c[y] += f[p] + d : h[y] += v[p] + d, c[1 - y] += f[g] / 2 - v[g] / 2, u.x = c[0], u.y = c[1], l.x = h[0], l.y = h[1];
        var _ = {
          x: 0,
          y: 0
        };
        return _[p] = f[p] + d + v[p], _[g] = Math.max(f[g], v[g]), _[m] = Math.min(0, v[m] + c[1 - y]), _;
      } else
        return l.x = h[0], l.y = h[1], this.group.getBoundingRect();
    }, t.prototype.remove = function() {
      this.getContentGroup().removeAll(), this._isFirstRender = !0;
    }, t.type = "legend.plain", t;
  })(me)
);
function sL(r, t, e, i, n, a, o) {
  function s(p, g) {
    p.lineWidth === "auto" && (p.lineWidth = g.lineWidth > 0 ? 2 : 0), pf(p, function(m, _) {
      p[_] === "inherit" && (p[_] = g[_]);
    });
  }
  var l = t.getModel("itemStyle"), u = l.getItemStyle(), f = r.lastIndexOf("empty", 0) === 0 ? "fill" : "stroke", h = l.getShallow("decal");
  u.decal = !h || h === "inherit" ? i.decal : ju(h, o), u.fill === "inherit" && (u.fill = i[n]), u.stroke === "inherit" && (u.stroke = i[f]), u.opacity === "inherit" && (u.opacity = (n === "fill" ? i : e).opacity), s(u, i);
  var v = t.getModel("lineStyle"), c = v.getLineStyle();
  if (s(c, e), u.fill === "auto" && (u.fill = i.fill), u.stroke === "auto" && (u.stroke = i.fill), c.stroke === "auto" && (c.stroke = i.fill), !a) {
    var d = t.get("inactiveBorderWidth"), y = u[f];
    u.lineWidth = d === "auto" ? i.lineWidth > 0 && y ? 2 : 0 : u.lineWidth, u.fill = t.get("inactiveColor"), u.stroke = t.get("inactiveBorderColor"), c.stroke = v.get("inactiveColor"), c.lineWidth = v.get("inactiveWidth");
  }
  return {
    itemStyle: u,
    lineStyle: c
  };
}
function lL(r) {
  var t = r.icon || "roundRect", e = ii(t, 0, 0, r.itemWidth, r.itemHeight, r.itemStyle.fill, r.symbolKeepAspect);
  return e.setStyle(r.itemStyle), e.rotation = (r.iconRotate || 0) * Math.PI / 180, e.setOrigin([r.itemWidth / 2, r.itemHeight / 2]), t.indexOf("empty") > -1 && (e.style.stroke = e.style.fill, e.style.fill = "#fff", e.style.lineWidth = 2), e;
}
function Cp(r, t, e, i) {
  yf(r, t, e, i), e.dispatchAction({
    type: "legendToggleSelect",
    name: r ?? t
  }), gf(r, t, e, i);
}
function __(r) {
  for (var t = r.getZr().storage.getDisplayList(), e, i = 0, n = t.length; i < n && !(e = t[i].states.emphasis); )
    i++;
  return e && e.hoverLayer;
}
function gf(r, t, e, i) {
  __(e) || e.dispatchAction({
    type: "highlight",
    seriesName: r,
    name: t,
    excludeSeriesId: i
  });
}
function yf(r, t, e, i) {
  __(e) || e.dispatchAction({
    type: "downplay",
    seriesName: r,
    name: t,
    excludeSeriesId: i
  });
}
function uL(r) {
  var t = r.findComponents({
    mainType: "legend"
  });
  t && t.length && r.filterSeries(function(e) {
    for (var i = 0; i < t.length; i++)
      if (!t[i].isSelected(e.name))
        return !1;
    return !0;
  });
}
function wn(r, t, e) {
  var i = r === "allSelect" || r === "inverseSelect", n = {}, a = [];
  e.eachComponent({
    mainType: "legend",
    query: t
  }, function(s) {
    i ? s[r]() : s[r](t.name), Mp(s, n), a.push(s.componentIndex);
  });
  var o = {};
  return e.eachComponent("legend", function(s) {
    A(n, function(l, u) {
      s[l ? "select" : "unSelect"](u);
    }), Mp(s, o);
  }), i ? {
    selected: o,
    // return legendIndex array to tell the developers which legends are allSelect / inverseSelect
    legendIndex: a
  } : {
    name: t.name,
    selected: o
  };
}
function Mp(r, t) {
  var e = t || {};
  return A(r.getData(), function(i) {
    var n = i.get("name");
    if (!(n === `
` || n === "")) {
      var a = r.isSelected(n);
      jr(e, n) ? e[n] = e[n] && a : e[n] = a;
    }
  }), e;
}
function fL(r) {
  r.registerAction("legendToggleSelect", "legendselectchanged", ht(wn, "toggleSelected")), r.registerAction("legendAllSelect", "legendselectall", ht(wn, "allSelect")), r.registerAction("legendInverseSelect", "legendinverseselect", ht(wn, "inverseSelect")), r.registerAction("legendSelect", "legendselected", ht(wn, "select")), r.registerAction("legendUnSelect", "legendunselected", ht(wn, "unSelect"));
}
function S_(r) {
  r.registerComponentModel(df), r.registerComponentView(m_), r.registerProcessor(r.PRIORITY.PROCESSOR.SERIES_FILTER, uL), r.registerSubTypeDefaulter("legend", function() {
    return "plain";
  }), fL(r);
}
var hL = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = t.type, e;
    }
    return t.prototype.setScrollDataIndex = function(e) {
      this.option.scrollDataIndex = e;
    }, t.prototype.init = function(e, i, n) {
      var a = Ds(e);
      r.prototype.init.call(this, e, i, n), Dp(this, e, a);
    }, t.prototype.mergeOption = function(e, i) {
      r.prototype.mergeOption.call(this, e, i), Dp(this, this.option, e);
    }, t.type = "legend.scroll", t.defaultOption = Dw(df.defaultOption, {
      scrollDataIndex: 0,
      pageButtonItemGap: 5,
      pageButtonGap: null,
      pageButtonPosition: "end",
      pageFormatter: "{current}/{total}",
      pageIcons: {
        horizontal: ["M0,0L12,-10L12,10z", "M0,0L-12,-10L-12,10z"],
        vertical: ["M0,0L20,0L10,-20z", "M0,0L20,0L10,20z"]
      },
      pageIconColor: "#2f4554",
      pageIconInactiveColor: "#aaa",
      pageIconSize: 15,
      pageTextStyle: {
        color: "#333"
      },
      animationDurationUpdate: 800
    }), t;
  })(df)
);
function Dp(r, t, e) {
  var i = r.getOrient(), n = [1, 1];
  n[i.index] = 0, Wi(t, e, {
    type: "box",
    ignoreSize: !!n
  });
}
var Ap = Dt, ou = ["width", "height"], su = ["x", "y"], cL = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = t.type, e.newlineDisabled = !0, e._currentIndex = 0, e;
    }
    return t.prototype.init = function() {
      r.prototype.init.call(this), this.group.add(this._containerGroup = new Ap()), this._containerGroup.add(this.getContentGroup()), this.group.add(this._controllerGroup = new Ap());
    }, t.prototype.resetInner = function() {
      r.prototype.resetInner.call(this), this._controllerGroup.removeAll(), this._containerGroup.removeClipPath(), this._containerGroup.__rectSize = null;
    }, t.prototype.renderInner = function(e, i, n, a, o, s, l) {
      var u = this;
      r.prototype.renderInner.call(this, e, i, n, a, o, s, l);
      var f = this._controllerGroup, h = i.get("pageIconSize", !0), v = N(h) ? h : [h, h];
      d("pagePrev", 0);
      var c = i.getModel("pageTextStyle");
      f.add(new Zt({
        name: "pageText",
        style: {
          // Placeholder to calculate a proper layout.
          text: "xx/xx",
          fill: c.getTextColor(),
          font: c.getFont(),
          verticalAlign: "middle",
          align: "center"
        },
        silent: !0
      })), d("pageNext", 1);
      function d(y, p) {
        var g = y + "DataIndex", m = eh(i.get("pageIcons", !0)[i.getOrient().name][p], {
          // Buttons will be created in each render, so we do not need
          // to worry about avoiding using legendModel kept in scope.
          onclick: dt(u._pageGo, u, g, i, a)
        }, {
          x: -v[0] / 2,
          y: -v[1] / 2,
          width: v[0],
          height: v[1]
        });
        m.name = y, f.add(m);
      }
    }, t.prototype.layoutInner = function(e, i, n, a, o, s) {
      var l = this.getSelectorGroup(), u = e.getOrient().index, f = ou[u], h = su[u], v = ou[1 - u], c = su[1 - u];
      o && Gn(
        // Buttons in selectorGroup always layout horizontally
        "horizontal",
        l,
        e.get("selectorItemGap", !0)
      );
      var d = e.get("selectorButtonGap", !0), y = l.getBoundingRect(), p = [-y.x, -y.y], g = K(n);
      o && (g[f] = n[f] - y[f] - d);
      var m = this._layoutContentAndController(e, a, g, u, f, v, c, h);
      if (o) {
        if (s === "end")
          p[u] += m[f] + d;
        else {
          var _ = y[f] + d;
          p[u] -= _, m[h] -= _;
        }
        m[f] += y[f] + d, p[1 - u] += m[c] + m[v] / 2 - y[v] / 2, m[v] = Math.max(m[v], y[v]), m[c] = Math.min(m[c], y[c] + p[1 - u]), l.x = p[0], l.y = p[1], l.markRedraw();
      }
      return m;
    }, t.prototype._layoutContentAndController = function(e, i, n, a, o, s, l, u) {
      var f = this.getContentGroup(), h = this._containerGroup, v = this._controllerGroup;
      Gn(e.get("orient"), f, e.get("itemGap"), a ? n.width : null, a ? null : n.height), Gn(
        // Buttons in controller are layout always horizontally.
        "horizontal",
        v,
        e.get("pageButtonItemGap", !0)
      );
      var c = f.getBoundingRect(), d = v.getBoundingRect(), y = this._showController = c[o] > n[o], p = [-c.x, -c.y];
      i || (p[a] = f[u]);
      var g = [0, 0], m = [-d.x, -d.y], _ = X(e.get("pageButtonGap", !0), e.get("itemGap", !0));
      if (y) {
        var S = e.get("pageButtonPosition", !0);
        S === "end" ? m[a] += n[o] - d[o] : g[a] += d[o] + _;
      }
      m[1 - a] += c[s] / 2 - d[s] / 2, f.setPosition(p), h.setPosition(g), v.setPosition(m);
      var w = {
        x: 0,
        y: 0
      };
      if (w[o] = y ? n[o] : c[o], w[s] = Math.max(c[s], d[s]), w[l] = Math.min(0, d[l] + m[1 - a]), h.__rectSize = n[o], y) {
        var b = {
          x: 0,
          y: 0
        };
        b[o] = Math.max(n[o] - d[o] - _, 0), b[s] = w[s], h.setClipPath(new Lt({
          shape: b
        })), h.__rectSize = b[o];
      } else
        v.eachChild(function(D) {
          D.attr({
            invisible: !0,
            silent: !0
          });
        });
      var x = this._getPageInfo(e);
      return x.pageIndex != null && We(
        f,
        {
          x: x.contentPosition[0],
          y: x.contentPosition[1]
        },
        // When switch from "show controller" to "not show controller", view should be
        // updated immediately without animation, otherwise causes weird effect.
        y ? e : null
      ), this._updatePageInfoView(e, x), w;
    }, t.prototype._pageGo = function(e, i, n) {
      var a = this._getPageInfo(i)[e];
      a != null && n.dispatchAction({
        type: "legendScroll",
        scrollDataIndex: a,
        legendId: i.id
      });
    }, t.prototype._updatePageInfoView = function(e, i) {
      var n = this._controllerGroup;
      A(["pagePrev", "pageNext"], function(f) {
        var h = f + "DataIndex", v = i[h] != null, c = n.childOfName(f);
        c && (c.setStyle("fill", v ? e.get("pageIconColor", !0) : e.get("pageIconInactiveColor", !0)), c.cursor = v ? "pointer" : "default");
      });
      var a = n.childOfName("pageText"), o = e.get("pageFormatter"), s = i.pageIndex, l = s != null ? s + 1 : 0, u = i.pageCount;
      a && o && a.setStyle("text", z(o) ? o.replace("{current}", l == null ? "" : l + "").replace("{total}", u == null ? "" : u + "") : o({
        current: l,
        total: u
      }));
    }, t.prototype._getPageInfo = function(e) {
      var i = e.get("scrollDataIndex", !0), n = this.getContentGroup(), a = this._containerGroup.__rectSize, o = e.getOrient().index, s = ou[o], l = su[o], u = this._findTargetItemIndex(i), f = n.children(), h = f[u], v = f.length, c = v ? 1 : 0, d = {
        contentPosition: [n.x, n.y],
        pageCount: c,
        pageIndex: c - 1,
        pagePrevDataIndex: null,
        pageNextDataIndex: null
      };
      if (!h)
        return d;
      var y = S(h);
      d.contentPosition[o] = -y.s;
      for (var p = u + 1, g = y, m = y, _ = null; p <= v; ++p)
        _ = S(f[p]), // Half of the last item is out of the window.
        (!_ && m.e > g.s + a || _ && !w(_, g.s)) && (m.i > g.i ? g = m : g = _, g && (d.pageNextDataIndex == null && (d.pageNextDataIndex = g.i), ++d.pageCount)), m = _;
      for (var p = u - 1, g = y, m = y, _ = null; p >= -1; --p)
        _ = S(f[p]), // If the the end item does not intersect with the window started
        // from the current item, a page can be settled.
        (!_ || !w(m, _.s)) && g.i < m.i && (m = g, d.pagePrevDataIndex == null && (d.pagePrevDataIndex = g.i), ++d.pageCount, ++d.pageIndex), g = _;
      return d;
      function S(b) {
        if (b) {
          var x = b.getBoundingRect(), D = x[l] + b[l];
          return {
            s: D,
            e: D + x[s],
            i: b.__legendDataIndex
          };
        }
      }
      function w(b, x) {
        return b.e >= x && b.s <= x + a;
      }
    }, t.prototype._findTargetItemIndex = function(e) {
      if (!this._showController)
        return 0;
      var i, n = this.getContentGroup(), a;
      return n.eachChild(function(o, s) {
        var l = o.__legendDataIndex;
        a == null && l != null && (a = s), l === e && (i = s);
      }), i ?? a;
    }, t.type = "legend.scroll", t;
  })(m_)
);
function vL(r) {
  r.registerAction("legendScroll", "legendscroll", function(t, e) {
    var i = t.scrollDataIndex;
    i != null && e.eachComponent({
      mainType: "legend",
      subType: "scroll",
      query: t
    }, function(n) {
      n.setScrollDataIndex(i);
    });
  });
}
function dL(r) {
  pr(S_), r.registerComponentModel(hL), r.registerComponentView(cL), vL(r);
}
function pL(r) {
  pr(S_), pr(dL);
}
function Lp(r, t, e) {
  var i = Xi.createCanvas(), n = t.getWidth(), a = t.getHeight(), o = i.style;
  return o && (o.position = "absolute", o.left = "0", o.top = "0", o.width = n + "px", o.height = a + "px", i.setAttribute("data-zr-dom-id", r)), i.width = n * e, i.height = a * e, i;
}
var lu = (function(r) {
  O(t, r);
  function t(e, i, n) {
    var a = r.call(this) || this;
    a.motionBlur = !1, a.lastFrameAlpha = 0.7, a.dpr = 1, a.virtual = !1, a.config = {}, a.incremental = !1, a.zlevel = 0, a.maxRepaintRectCount = 5, a.__dirty = !0, a.__firstTimePaint = !0, a.__used = !1, a.__drawIndex = 0, a.__startIndex = 0, a.__endIndex = 0, a.__prevStartIndex = null, a.__prevEndIndex = null;
    var o;
    n = n || Oo, typeof e == "string" ? o = Lp(e, i, n) : W(e) && (o = e, e = o.id), a.id = e, a.dom = o;
    var s = o.style;
    return s && (jp(o), o.onselectstart = function() {
      return !1;
    }, s.padding = "0", s.margin = "0", s.borderWidth = "0"), a.painter = i, a.dpr = n, a;
  }
  return t.prototype.getElementCount = function() {
    return this.__endIndex - this.__startIndex;
  }, t.prototype.afterBrush = function() {
    this.__prevStartIndex = this.__startIndex, this.__prevEndIndex = this.__endIndex;
  }, t.prototype.initContext = function() {
    this.ctx = this.dom.getContext("2d"), this.ctx.dpr = this.dpr;
  }, t.prototype.setUnpainted = function() {
    this.__firstTimePaint = !0;
  }, t.prototype.createBackBuffer = function() {
    var e = this.dpr;
    this.domBack = Lp("back-" + this.id, this.painter, e), this.ctxBack = this.domBack.getContext("2d"), e !== 1 && this.ctxBack.scale(e, e);
  }, t.prototype.createRepaintRects = function(e, i, n, a) {
    if (this.__firstTimePaint)
      return this.__firstTimePaint = !1, null;
    var o = [], s = this.maxRepaintRectCount, l = !1, u = new it(0, 0, 0, 0);
    function f(m) {
      if (!(!m.isFinite() || m.isZero()))
        if (o.length === 0) {
          var _ = new it(0, 0, 0, 0);
          _.copy(m), o.push(_);
        } else {
          for (var S = !1, w = 1 / 0, b = 0, x = 0; x < o.length; ++x) {
            var D = o[x];
            if (D.intersect(m)) {
              var T = new it(0, 0, 0, 0);
              T.copy(D), T.union(m), o[x] = T, S = !0;
              break;
            } else if (l) {
              u.copy(m), u.union(D);
              var C = m.width * m.height, M = D.width * D.height, L = u.width * u.height, P = L - C - M;
              P < w && (w = P, b = x);
            }
          }
          if (l && (o[b].union(m), S = !0), !S) {
            var _ = new it(0, 0, 0, 0);
            _.copy(m), o.push(_);
          }
          l || (l = o.length >= s);
        }
    }
    for (var h = this.__startIndex; h < this.__endIndex; ++h) {
      var v = e[h];
      if (v) {
        var c = v.shouldBePainted(n, a, !0, !0), d = v.__isRendered && (v.__dirty & jt || !c) ? v.getPrevPaintRect() : null;
        d && f(d);
        var y = c && (v.__dirty & jt || !v.__isRendered) ? v.getPaintRect() : null;
        y && f(y);
      }
    }
    for (var h = this.__prevStartIndex; h < this.__prevEndIndex; ++h) {
      var v = i[h], c = v && v.shouldBePainted(n, a, !0, !0);
      if (v && (!c || !v.__zr) && v.__isRendered) {
        var d = v.getPrevPaintRect();
        d && f(d);
      }
    }
    var p;
    do {
      p = !1;
      for (var h = 0; h < o.length; ) {
        if (o[h].isZero()) {
          o.splice(h, 1);
          continue;
        }
        for (var g = h + 1; g < o.length; )
          o[h].intersect(o[g]) ? (p = !0, o[h].union(o[g]), o.splice(g, 1)) : g++;
        h++;
      }
    } while (p);
    return this._paintRects = o, o;
  }, t.prototype.debugGetPaintRects = function() {
    return (this._paintRects || []).slice();
  }, t.prototype.resize = function(e, i) {
    var n = this.dpr, a = this.dom, o = a.style, s = this.domBack;
    o && (o.width = e + "px", o.height = i + "px"), a.width = e * n, a.height = i * n, s && (s.width = e * n, s.height = i * n, n !== 1 && this.ctxBack.scale(n, n));
  }, t.prototype.clear = function(e, i, n) {
    var a = this.dom, o = this.ctx, s = a.width, l = a.height;
    i = i || this.clearColor;
    var u = this.motionBlur && !e, f = this.lastFrameAlpha, h = this.dpr, v = this;
    u && (this.domBack || this.createBackBuffer(), this.ctxBack.globalCompositeOperation = "copy", this.ctxBack.drawImage(a, 0, 0, s / h, l / h));
    var c = this.domBack;
    function d(y, p, g, m) {
      if (o.clearRect(y, p, g, m), i && i !== "transparent") {
        var _ = void 0;
        if (rs(i)) {
          var S = i.global || i.__width === g && i.__height === m;
          _ = S && i.__canvasGradient || qu(o, i, {
            x: 0,
            y: 0,
            width: g,
            height: m
          }), i.__canvasGradient = _, i.__width = g, i.__height = m;
        } else y0(i) && (i.scaleX = i.scaleX || h, i.scaleY = i.scaleY || h, _ = Ku(o, i, {
          dirty: function() {
            v.setUnpainted(), v.painter.refresh();
          }
        }));
        o.save(), o.fillStyle = _ || i, o.fillRect(y, p, g, m), o.restore();
      }
      u && (o.save(), o.globalAlpha = f, o.drawImage(c, y, p, g, m), o.restore());
    }
    !n || u ? d(0, 0, s, l) : n.length && A(n, function(y) {
      d(y.x * h, y.y * h, y.width * h, y.height * h);
    });
  }, t;
})(Ie), Pp = 1e5, zr = 314159, lo = 0.01, gL = 1e-3;
function yL(r) {
  return r ? r.__builtin__ ? !0 : !(typeof r.resize != "function" || typeof r.refresh != "function") : !1;
}
function mL(r, t) {
  var e = document.createElement("div");
  return e.style.cssText = [
    "position:relative",
    "width:" + r + "px",
    "height:" + t + "px",
    "padding:0",
    "margin:0",
    "border-width:0"
  ].join(";") + ";", e;
}
var _L = (function() {
  function r(t, e, i, n) {
    this.type = "canvas", this._zlevelList = [], this._prevDisplayList = [], this._layers = {}, this._layerConfig = {}, this._needsManuallyCompositing = !1, this.type = "canvas";
    var a = !t.nodeName || t.nodeName.toUpperCase() === "CANVAS";
    this._opts = i = k({}, i || {}), this.dpr = i.devicePixelRatio || Oo, this._singleCanvas = a, this.root = t;
    var o = t.style;
    o && (jp(t), t.innerHTML = ""), this.storage = e;
    var s = this._zlevelList;
    this._prevDisplayList = [];
    var l = this._layers;
    if (a) {
      var f = t, h = f.width, v = f.height;
      i.width != null && (h = i.width), i.height != null && (v = i.height), this.dpr = i.devicePixelRatio || 1, f.width = h * this.dpr, f.height = v * this.dpr, this._width = h, this._height = v;
      var c = new lu(f, this, this.dpr);
      c.__builtin__ = !0, c.initContext(), l[zr] = c, c.zlevel = zr, s.push(zr), this._domRoot = t;
    } else {
      this._width = qa(t, 0, i), this._height = qa(t, 1, i);
      var u = this._domRoot = mL(this._width, this._height);
      t.appendChild(u);
    }
  }
  return r.prototype.getType = function() {
    return "canvas";
  }, r.prototype.isSingleCanvas = function() {
    return this._singleCanvas;
  }, r.prototype.getViewportRoot = function() {
    return this._domRoot;
  }, r.prototype.getViewportRootOffset = function() {
    var t = this.getViewportRoot();
    if (t)
      return {
        offsetLeft: t.offsetLeft || 0,
        offsetTop: t.offsetTop || 0
      };
  }, r.prototype.refresh = function(t) {
    var e = this.storage.getDisplayList(!0), i = this._prevDisplayList, n = this._zlevelList;
    this._redrawId = Math.random(), this._paintList(e, i, t, this._redrawId);
    for (var a = 0; a < n.length; a++) {
      var o = n[a], s = this._layers[o];
      if (!s.__builtin__ && s.refresh) {
        var l = a === 0 ? this._backgroundColor : null;
        s.refresh(l);
      }
    }
    return this._opts.useDirtyRect && (this._prevDisplayList = e.slice()), this;
  }, r.prototype.refreshHover = function() {
    this._paintHoverList(this.storage.getDisplayList(!1));
  }, r.prototype._paintHoverList = function(t) {
    var e = t.length, i = this._hoverlayer;
    if (i && i.clear(), !!e) {
      for (var n = {
        inHover: !0,
        viewWidth: this._width,
        viewHeight: this._height
      }, a, o = 0; o < e; o++) {
        var s = t[o];
        s.__inHover && (i || (i = this._hoverlayer = this.getLayer(Pp)), a || (a = i.ctx, a.save()), Wr(a, s, n, o === e - 1));
      }
      a && a.restore();
    }
  }, r.prototype.getHoverLayer = function() {
    return this.getLayer(Pp);
  }, r.prototype.paintOne = function(t, e) {
    am(t, e);
  }, r.prototype._paintList = function(t, e, i, n) {
    if (this._redrawId === n) {
      i = i || !1, this._updateLayerStatus(t);
      var a = this._doPaintList(t, e, i), o = a.finished, s = a.needsRefreshHover;
      if (this._needsManuallyCompositing && this._compositeManually(), s && this._paintHoverList(t), o)
        this.eachLayer(function(u) {
          u.afterBrush && u.afterBrush();
        });
      else {
        var l = this;
        Lo(function() {
          l._paintList(t, e, i, n);
        });
      }
    }
  }, r.prototype._compositeManually = function() {
    var t = this.getLayer(zr).ctx, e = this._domRoot.width, i = this._domRoot.height;
    t.clearRect(0, 0, e, i), this.eachBuiltinLayer(function(n) {
      n.virtual && t.drawImage(n.dom, 0, 0, e, i);
    });
  }, r.prototype._doPaintList = function(t, e, i) {
    for (var n = this, a = [], o = this._opts.useDirtyRect, s = 0; s < this._zlevelList.length; s++) {
      var l = this._zlevelList[s], u = this._layers[l];
      u.__builtin__ && u !== this._hoverlayer && (u.__dirty || i) && a.push(u);
    }
    for (var f = !0, h = !1, v = function(y) {
      var p = a[y], g = p.ctx, m = o && p.createRepaintRects(t, e, c._width, c._height), _ = i ? p.__startIndex : p.__drawIndex, S = !i && p.incremental && Date.now, w = S && Date.now(), b = p.zlevel === c._zlevelList[0] ? c._backgroundColor : null;
      if (p.__startIndex === p.__endIndex)
        p.clear(!1, b, m);
      else if (_ === p.__startIndex) {
        var x = t[_];
        (!x.incremental || !x.notClear || i) && p.clear(!1, b, m);
      }
      _ === -1 && (console.error("For some unknown reason. drawIndex is -1"), _ = p.__startIndex);
      var D, T = function(P) {
        var I = {
          inHover: !1,
          allClipped: !1,
          prevEl: null,
          viewWidth: n._width,
          viewHeight: n._height
        };
        for (D = _; D < p.__endIndex; D++) {
          var E = t[D];
          if (E.__inHover && (h = !0), n._doPaintEl(E, p, o, P, I, D === p.__endIndex - 1), S) {
            var R = Date.now() - w;
            if (R > 15)
              break;
          }
        }
        I.prevElClipPaths && g.restore();
      };
      if (m)
        if (m.length === 0)
          D = p.__endIndex;
        else
          for (var C = c.dpr, M = 0; M < m.length; ++M) {
            var L = m[M];
            g.save(), g.beginPath(), g.rect(L.x * C, L.y * C, L.width * C, L.height * C), g.clip(), T(L), g.restore();
          }
      else
        g.save(), T(), g.restore();
      p.__drawIndex = D, p.__drawIndex < p.__endIndex && (f = !1);
    }, c = this, d = 0; d < a.length; d++)
      v(d);
    return U.wxa && A(this._layers, function(y) {
      y && y.ctx && y.ctx.draw && y.ctx.draw();
    }), {
      finished: f,
      needsRefreshHover: h
    };
  }, r.prototype._doPaintEl = function(t, e, i, n, a, o) {
    var s = e.ctx;
    if (i) {
      var l = t.getPaintRect();
      (!n || l && l.intersect(n)) && (Wr(s, t, a, o), t.setPrevPaintRect(l));
    } else
      Wr(s, t, a, o);
  }, r.prototype.getLayer = function(t, e) {
    this._singleCanvas && !this._needsManuallyCompositing && (t = zr);
    var i = this._layers[t];
    return i || (i = new lu("zr_" + t, this, this.dpr), i.zlevel = t, i.__builtin__ = !0, this._layerConfig[t] ? Q(i, this._layerConfig[t], !0) : this._layerConfig[t - lo] && Q(i, this._layerConfig[t - lo], !0), e && (i.virtual = e), this.insertLayer(t, i), i.initContext()), i;
  }, r.prototype.insertLayer = function(t, e) {
    var i = this._layers, n = this._zlevelList, a = n.length, o = this._domRoot, s = null, l = -1;
    if (!i[t] && yL(e)) {
      if (a > 0 && t > n[0]) {
        for (l = 0; l < a - 1 && !(n[l] < t && n[l + 1] > t); l++)
          ;
        s = i[n[l]];
      }
      if (n.splice(l + 1, 0, t), i[t] = e, !e.virtual)
        if (s) {
          var u = s.dom;
          u.nextSibling ? o.insertBefore(e.dom, u.nextSibling) : o.appendChild(e.dom);
        } else
          o.firstChild ? o.insertBefore(e.dom, o.firstChild) : o.appendChild(e.dom);
      e.painter || (e.painter = this);
    }
  }, r.prototype.eachLayer = function(t, e) {
    for (var i = this._zlevelList, n = 0; n < i.length; n++) {
      var a = i[n];
      t.call(e, this._layers[a], a);
    }
  }, r.prototype.eachBuiltinLayer = function(t, e) {
    for (var i = this._zlevelList, n = 0; n < i.length; n++) {
      var a = i[n], o = this._layers[a];
      o.__builtin__ && t.call(e, o, a);
    }
  }, r.prototype.eachOtherLayer = function(t, e) {
    for (var i = this._zlevelList, n = 0; n < i.length; n++) {
      var a = i[n], o = this._layers[a];
      o.__builtin__ || t.call(e, o, a);
    }
  }, r.prototype.getLayers = function() {
    return this._layers;
  }, r.prototype._updateLayerStatus = function(t) {
    this.eachBuiltinLayer(function(h, v) {
      h.__dirty = h.__used = !1;
    });
    function e(h) {
      a && (a.__endIndex !== h && (a.__dirty = !0), a.__endIndex = h);
    }
    if (this._singleCanvas)
      for (var i = 1; i < t.length; i++) {
        var n = t[i];
        if (n.zlevel !== t[i - 1].zlevel || n.incremental) {
          this._needsManuallyCompositing = !0;
          break;
        }
      }
    var a = null, o = 0, s, l;
    for (l = 0; l < t.length; l++) {
      var n = t[l], u = n.zlevel, f = void 0;
      s !== u && (s = u, o = 0), n.incremental ? (f = this.getLayer(u + gL, this._needsManuallyCompositing), f.incremental = !0, o = 1) : f = this.getLayer(u + (o > 0 ? lo : 0), this._needsManuallyCompositing), f.__builtin__ || Af("ZLevel " + u + " has been used by unkown layer " + f.id), f !== a && (f.__used = !0, f.__startIndex !== l && (f.__dirty = !0), f.__startIndex = l, f.incremental ? f.__drawIndex = -1 : f.__drawIndex = l, e(l), a = f), n.__dirty & jt && !n.__inHover && (f.__dirty = !0, f.incremental && f.__drawIndex < 0 && (f.__drawIndex = l));
    }
    e(l), this.eachBuiltinLayer(function(h, v) {
      !h.__used && h.getElementCount() > 0 && (h.__dirty = !0, h.__startIndex = h.__endIndex = h.__drawIndex = 0), h.__dirty && h.__drawIndex < 0 && (h.__drawIndex = h.__startIndex);
    });
  }, r.prototype.clear = function() {
    return this.eachBuiltinLayer(this._clearLayer), this;
  }, r.prototype._clearLayer = function(t) {
    t.clear();
  }, r.prototype.setBackgroundColor = function(t) {
    this._backgroundColor = t, A(this._layers, function(e) {
      e.setUnpainted();
    });
  }, r.prototype.configLayer = function(t, e) {
    if (e) {
      var i = this._layerConfig;
      i[t] ? Q(i[t], e, !0) : i[t] = e;
      for (var n = 0; n < this._zlevelList.length; n++) {
        var a = this._zlevelList[n];
        if (a === t || a === t + lo) {
          var o = this._layers[a];
          Q(o, i[t], !0);
        }
      }
    }
  }, r.prototype.delLayer = function(t) {
    var e = this._layers, i = this._zlevelList, n = e[t];
    n && (n.dom.parentNode.removeChild(n.dom), delete e[t], i.splice(rt(i, t), 1));
  }, r.prototype.resize = function(t, e) {
    if (this._domRoot.style) {
      var i = this._domRoot;
      i.style.display = "none";
      var n = this._opts, a = this.root;
      if (t != null && (n.width = t), e != null && (n.height = e), t = qa(a, 0, n), e = qa(a, 1, n), i.style.display = "", this._width !== t || e !== this._height) {
        i.style.width = t + "px", i.style.height = e + "px";
        for (var o in this._layers)
          this._layers.hasOwnProperty(o) && this._layers[o].resize(t, e);
        this.refresh(!0);
      }
      this._width = t, this._height = e;
    } else {
      if (t == null || e == null)
        return;
      this._width = t, this._height = e, this.getLayer(zr).resize(t, e);
    }
    return this;
  }, r.prototype.clearLayer = function(t) {
    var e = this._layers[t];
    e && e.clear();
  }, r.prototype.dispose = function() {
    this.root.innerHTML = "", this.root = this.storage = this._domRoot = this._layers = null;
  }, r.prototype.getRenderedCanvas = function(t) {
    if (t = t || {}, this._singleCanvas && !this._compositeManually)
      return this._layers[zr].dom;
    var e = new lu("image", this, t.pixelRatio || this.dpr);
    e.initContext(), e.clear(!1, t.backgroundColor || this._backgroundColor);
    var i = e.ctx;
    if (t.pixelRatio <= this.dpr) {
      this.refresh();
      var n = e.dom.width, a = e.dom.height;
      this.eachLayer(function(h) {
        h.__builtin__ ? i.drawImage(h.dom, 0, 0, n, a) : h.renderToCanvas && (i.save(), h.renderToCanvas(i), i.restore());
      });
    } else
      for (var o = {
        inHover: !1,
        viewWidth: this._width,
        viewHeight: this._height
      }, s = this.storage.getDisplayList(!0), l = 0, u = s.length; l < u; l++) {
        var f = s[l];
        Wr(i, f, o, l === u - 1);
      }
    return e.dom;
  }, r.prototype.getWidth = function() {
    return this._width;
  }, r.prototype.getHeight = function() {
    return this._height;
  }, r;
})();
function SL(r) {
  r.registerPainter("canvas", _L);
}
pr([
  mD,
  MA,
  YA,
  pL,
  aL,
  JA,
  SL
]);
const bL = 240, b_ = 32, wL = 8, Ip = b_;
class xL {
  constructor(t) {
    this.container = t, this.onLegendLayoutFinished = () => {
      this.syncLegendLayoutAfterPaint();
    }, this.instance = _C(t), this.instance.on("finished", this.onLegendLayoutFinished), this.resizeObserver = new ResizeObserver(() => {
      var e;
      (e = this.instance) == null || e.resize();
    }), this.resizeObserver.observe(t);
  }
  destroy() {
    var t, e;
    this.resizeObserver.disconnect(), (t = this.instance) == null || t.off("finished", this.onLegendLayoutFinished), (e = this.instance) == null || e.dispose(), this.instance = void 0;
  }
  /**
   * After each full paint, measure the legend bounding box and align `grid.top` + container `min-height`
   * so multi-line legends do not overlap the series (see plan: legend layout sync).
   */
  syncLegendLayoutAfterPaint() {
    var f, h, v;
    const t = this.instance;
    if (!t) return;
    const e = t;
    let i = 0, n = !1;
    try {
      const c = e.getModel().getComponent("legend", 0);
      if (((f = c == null ? void 0 : c.option) == null ? void 0 : f.show) !== !1) {
        const d = e.getViewOfComponentModel(c), y = (v = (h = d == null ? void 0 : d.group) == null ? void 0 : h.getBoundingRect()) == null ? void 0 : v.height;
        typeof y == "number" && Number.isFinite(y) && y > 0 && (i = y, n = !0);
      }
    } catch {
      n = !1;
    }
    const a = n ? Math.ceil(i) + wL : Ip, o = n ? Math.max(0, i - b_) : 0, s = bL + o, l = this.lastSyncedGridTop === void 0 ? 1 / 0 : Math.abs(a - this.lastSyncedGridTop), u = this.lastSyncedMinHeightTotalPx === void 0 ? 1 / 0 : Math.abs(s - this.lastSyncedMinHeightTotalPx);
    l <= 1 && u <= 1 || (n && o > 0 ? this.container.style.minHeight = `${s}px` : this.container.style.minHeight = "", t.setOption(
      {
        grid: {
          top: a
        }
      },
      { notMerge: !1, lazyUpdate: !1 }
    ), t.resize(), this.lastSyncedGridTop = a, this.lastSyncedMinHeightTotalPx = s);
  }
  /**
   * Align series data points to the timeline.
   * Port of alignSeriesOnTimeline from chart-renderer.ts (T004).
   */
  alignSeriesOnTimeline(t, e, i) {
    const n = new Array(e.length).fill(null);
    if (e.length === 0)
      return n;
    const a = e.length > 1 ? e[1] - e[0] : 864e5;
    for (let o = 0; o < e.length; o++) {
      const s = e[o], l = e[o + 1] ?? s + a;
      let u = null;
      if (i === void 0) {
        for (const f of t)
          if (f.timestamp >= s && f.timestamp < l) {
            u = f.value;
            break;
          }
      } else {
        const f = i.getTime() + (s - e[0]);
        for (const h of t)
          if (h.timestamp >= f && h.timestamp < f + a) {
            u = h.value;
            break;
          }
      }
      n[o] = u;
    }
    return n;
  }
  /** `ha-card` (or card root) used for Home Assistant theme CSS variables. */
  getThemeHost() {
    return this.container.closest(".ebc-card") ?? this.container.closest("ha-card") ?? this.container;
  }
  /**
   * Resolve primary color from config or theme CSS variables (T005).
   */
  resolveColor(t) {
    if (t.trim()) return t;
    const e = getComputedStyle(this.getThemeHost()), i = e.getPropertyValue("--accent-color").trim();
    if (i) return i;
    const n = e.getPropertyValue("--primary-color").trim();
    return n || "#03a9f4";
  }
  /**
   * Read Home Assistant theme tokens from the card host (`getComputedStyle`).
   */
  getHaThemeTokens() {
    const t = getComputedStyle(this.getThemeHost()), e = t.getPropertyValue("--secondary-text-color").trim() || "rgba(127, 127, 127, 0.4)", i = t.getPropertyValue("--divider-color").trim() || "rgba(127, 127, 127, 0.3)", n = t.getPropertyValue("--primary-text-color").trim() || "rgba(0, 0, 0, 0.87)", a = t.getPropertyValue("--ha-card-background").trim() || t.getPropertyValue("--card-background-color").trim() || "#ffffff";
    return {
      referenceLine: e,
      grid: i,
      primaryText: n,
      tooltipBackground: a,
      tooltipBorder: i
    };
  }
  /**
   * Compute nice max value for Y-axis (T006).
   * Rounds up dataMax to nearest "nice" step value (1, 2, 2.5, 5, 10).
   */
  niceMax(t, e) {
    if (t <= 0) return e;
    const i = Math.pow(10, Math.floor(Math.log10(t / e))), n = [1, 2, 2.5, 5, 10], a = t / i / e;
    let o;
    for (let l = 0; l < n.length; l++)
      if (a <= n[l]) {
        o = n[l];
        break;
      }
    o || (o = 10);
    const s = o * i;
    return Math.ceil(t / s) * s;
  }
  /**
   * Build values for a "null-gap dashed" series.
   * For every contiguous run of `null` values with a non-null value on both sides,
   * it linearly interpolates values across the whole span between the surrounding points
   * (including those non-null endpoints). Outside such spans it returns `null`.
   */
  buildDashedNullGapValues(t) {
    const e = new Array(t.length).fill(null);
    let i, n = 0;
    for (; n < t.length; ) {
      if (t[n] !== null) {
        i = n, n++;
        continue;
      }
      for (; n < t.length && t[n] === null; ) n++;
      const a = n < t.length ? n : void 0;
      if (i === void 0 || a === void 0)
        continue;
      const o = i, s = t[o], l = t[a], u = a - o;
      for (let f = o; f <= a; f++) {
        const h = (f - o) / u;
        e[f] = s + (l - s) * h;
      }
      i = a, n = a + 1;
    }
    return e;
  }
  /**
   * Build EChart option configuration (T008–T012).
   * Handles chart layout, axes, legend, tooltip, and series data.
   */
  buildOption(t, e, i, n, a, o, s) {
    const u = [
      ...t.filter((T) => T !== null),
      ...e.filter((T) => T !== null)
    ], f = u.length > 0 ? Math.max(...u) : 0, h = this.niceMax(f, 4), v = Math.max(i.length - 1, 0), c = v > 0 ? Math.max(1, Math.round(v / 4)) : 1, d = /* @__PURE__ */ new Set([
      0,
      c,
      c * 2,
      c * 3,
      v
    ]), y = (T) => {
      const C = Math.round(T);
      return C < 0 || C > v ? "" : d.has(C) ? String(C) : "";
    }, p = [], g = p.length;
    let m;
    const _ = Math.min(
      Math.max(n.fillCurrentOpacity, 0),
      100
    ) / 100, S = Math.min(
      Math.max(n.fillReferenceOpacity, 0),
      100
    ) / 100;
    if (p.push({
      name: a.current,
      type: "line",
      // ECharts uses `series.color` (and/or itemStyle) for hover symbols and tooltip markers.
      color: o,
      data: t.map((T, C) => T !== null ? [C, T] : null),
      lineStyle: { color: o, width: 1.5 },
      areaStyle: {
        // Ensure the filled area matches the line color, with separate opacity.
        color: o,
        opacity: n.fillCurrent ? _ : 0
      },
      connectNulls: !1,
      showSymbol: !1,
      smooth: !1,
      // Show a symbol on hover (with the same color as the line).
      symbol: "circle",
      symbolSize: 6,
      emphasis: {
        focus: "series",
        showSymbol: !0,
        symbolSize: 6,
        itemStyle: { color: o },
        lineStyle: { color: o }
      },
      itemStyle: { color: o }
    }), n.connectNulls) {
      const T = this.buildDashedNullGapValues(t);
      T.some((C) => C !== null) && p.push({
        name: `${a.current} (dashed)`,
        type: "line",
        // ECharts uses `series.color` (and/or itemStyle) for hover symbols and tooltip markers.
        color: o,
        data: T.map((C, M) => C !== null ? [M, C] : null),
        lineStyle: { type: "dashed", color: o, width: 1.5 },
        areaStyle: {
          // Prevent any filled area under interpolated dashed segments.
          opacity: 0
        },
        connectNulls: !1,
        showSymbol: !1,
        smooth: !1,
        itemStyle: { color: o },
        showInLegend: !1,
        silent: !0,
        tooltip: { show: !1 },
        // Keep focus/hover quiet (series is "silent" anyway, but this avoids edge-cases).
        emphasis: { focus: "none" }
      });
    }
    if (n.showForecast && e.some((T) => T !== null)) {
      m = p.length, p.push({
        name: a.reference,
        type: "line",
        color: s.referenceLine,
        data: e.map((C, M) => C !== null ? [M, C] : null),
        lineStyle: { color: s.referenceLine, width: 1.5 },
        areaStyle: {
          // Ensure the filled area matches the reference line color, with separate opacity.
          color: s.referenceLine,
          opacity: n.fillReference ? S : 0
        },
        connectNulls: !1,
        showSymbol: !1,
        smooth: !1,
        symbol: "circle",
        symbolSize: 6,
        emphasis: {
          focus: "series",
          showSymbol: !0,
          symbolSize: 6,
          itemStyle: { color: s.referenceLine },
          lineStyle: { color: s.referenceLine }
        },
        itemStyle: { color: s.referenceLine }
      });
      const T = this.buildDashedNullGapValues(e);
      n.connectNulls && T.some((C) => C !== null) && p.push({
        name: `${a.reference} (dashed)`,
        type: "line",
        color: s.referenceLine,
        data: T.map((C, M) => C !== null ? [M, C] : null),
        lineStyle: { type: "dashed", color: s.referenceLine, width: 1.5 },
        areaStyle: {
          // Prevent any filled area under interpolated dashed segments.
          opacity: 0
        },
        connectNulls: !1,
        showSymbol: !1,
        smooth: !1,
        itemStyle: { color: s.referenceLine },
        showInLegend: !1,
        silent: !0,
        tooltip: { show: !1 },
        emphasis: { focus: "none" }
      });
    }
    const w = /* @__PURE__ */ new Date();
    w.setHours(0, 0, 0, 0);
    const b = w.getTime(), x = i.indexOf(b);
    if (x >= 0) {
      const T = t[x] ?? null, C = e[x] ?? null;
      let M;
      T !== null && C !== null ? M = Math.max(T, C) : T !== null ? M = T : C !== null && (M = C);
      const L = [];
      M !== void 0 ? L.push([{ coord: [x, M] }, { coord: [x, 0] }]) : L.push([{ xAxis: x }, { xAxis: x }]);
      const P = [];
      T !== null && P.push({
        coord: [x, T],
        symbol: "circle",
        symbolSize: 6,
        itemStyle: { color: o }
      }), p[g].markLine = {
        silent: !0,
        symbol: ["none", "none"],
        data: L,
        lineStyle: { type: "dashed", color: o, width: 1.5 }
      }, p[g].markPoint = {
        silent: !0,
        data: P
      }, m !== void 0 && C !== null && (p[m].markPoint = {
        silent: !0,
        data: [{
          coord: [x, C],
          symbol: "circle",
          symbolSize: 6,
          itemStyle: { color: s.referenceLine }
        }]
      }), n.showForecast && x >= 0 && T !== null && n.forecastTotal !== void 0 && p.push({
        name: n.forecastLabel,
        type: "line",
        color: o,
        data: [[x, T], [i.length - 1, n.forecastTotal]],
        lineStyle: { type: "dashed", color: o, width: 1.5 },
        areaStyle: { opacity: 0 },
        showSymbol: !1,
        connectNulls: !1,
        symbol: "circle",
        symbolSize: 6,
        emphasis: {
          focus: "series",
          showSymbol: !0,
          symbolSize: 6,
          itemStyle: { color: o },
          lineStyle: { color: o }
        },
        itemStyle: { color: o }
      });
    } else
      p[g].markPoint = { silent: !0, data: [] }, p[g].markLine = { silent: !0, symbol: ["none", "none"], data: [], lineStyle: { type: "dashed", color: o, width: 1.5 } }, m !== void 0 && (p[m].markPoint = { silent: !0, data: [] });
    return {
      animation: !1,
      // Explicit grid bounds to avoid ECharts default large paddings.
      // `containLabel: true` keeps axis labels inside the grid area.
      grid: {
        containLabel: !0,
        // Give the X-axis edge labels some breathing room on responsive layouts.
        left: 8,
        right: 8,
        top: Ip,
        bottom: 0
      },
      legend: {
        show: n.showLegend === !0,
        top: 0,
        left: "center",
        textStyle: { color: s.primaryText },
        pageTextStyle: { color: s.primaryText }
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: s.tooltipBackground,
        borderColor: s.tooltipBorder,
        borderWidth: 1,
        textStyle: { color: s.primaryText },
        axisPointer: {
          type: "shadow",
          // Tint from `--divider-color` (same as split lines); opacity keeps the overlay subtle.
          shadowStyle: { color: s.grid, opacity: 0.2 }
        },
        appendTo: this.container,
        formatter: (T) => {
          var ct, Nt;
          const C = Array.isArray(T) ? T : [T], M = C[0] ?? {}, L = (M == null ? void 0 : M.dataIndex) ?? (M == null ? void 0 : M.axisValue) ?? ((ct = M == null ? void 0 : M.data) == null ? void 0 : ct[0]) ?? ((Nt = M == null ? void 0 : M.value) == null ? void 0 : Nt[0]), P = typeof L == "number" ? L : Number(L), I = n.comparisonMode, E = n.language, R = n.numberLocale, V = n.precision, B = n.unit, F = new Intl.NumberFormat(R, {
            minimumFractionDigits: V,
            maximumFractionDigits: V
          }), $ = (Bt) => Bt.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"), j = (() => {
            if (!Number.isFinite(P)) return "";
            if (I === "year_over_year") {
              const _t = Math.trunc(P) + 1, St = String(E).toLowerCase();
              let nt;
              return St.startsWith("pl") ? nt = _t === 1 ? "dzień" : "dni" : nt = _t === 1 ? "day" : "days", `${_t} ${nt}`;
            }
            const Bt = i[P];
            return Bt == null ? "" : new Intl.DateTimeFormat(E, {
              day: "numeric",
              month: "long"
            }).format(new Date(Bt));
          })(), lt = [];
          for (const Bt of C) {
            const _t = Bt ?? {}, St = (_t == null ? void 0 : _t.data) ?? (_t == null ? void 0 : _t.value);
            let nt;
            if (Array.isArray(St) ? nt = St.length > 1 ? St[1] : St[0] : nt = St, nt == null) continue;
            const Y = typeof nt == "number" ? nt : Number(nt);
            if (!Number.isFinite(Y)) continue;
            const q = typeof (_t == null ? void 0 : _t.seriesName) == "string" ? _t.seriesName : "", ke = F.format(Y), Ct = $(q), ba = $(B);
            lt.push(
              `<div class="tooltip-row">${Ct ? `${Ct}: ` : ""}${ke} ${ba}</div>`
            );
          }
          const ft = lt.join("");
          return `<div class="tooltip-container"><div class="tooltip-header">${$(
            j
          )}</div>${ft}</div>`;
        }
      },
      xAxis: {
        type: "value",
        min: 0,
        max: v,
        interval: c,
        // For `value` axis ECharts typings expect a tuple; [0,0] means "no gap".
        boundaryGap: [0, 0],
        splitLine: { show: !1 },
        // Show only a few readable labels (avoid overlapping text).
        axisTick: { show: !1 },
        axisLine: { show: !1 },
        axisLabel: {
          color: s.primaryText,
          formatter: (T) => y(T),
          margin: 8,
          hideOverlap: !0,
          // Keep both edge labels inside the grid area.
          alignMinLabel: "left",
          // Keeps the last (max) label within the grid by aligning its right edge to the right-side tick.
          // This prevents cases where the last label gets clipped/shifted (e.g. `30` vs `3` / `365` not visible).
          alignMaxLabel: "right"
        }
      },
      yAxis: {
        type: "value",
        min: 0,
        max: h,
        splitNumber: 4,
        splitLine: {
          show: !0,
          lineStyle: { color: s.grid, width: 1 }
        },
        // Oś ma się składać tylko z ticków i wartości (bez pionowej linii osi).
        axisLine: { show: !1 },
        axisTick: { show: !1 },
        axisLabel: {
          color: s.primaryText,
          formatter: (T) => T === h ? `${T} ${n.unit}` : String(T),
          margin: 8,
          // Ensures the margin translates to spacing on the right side.
          align: "right"
        }
      },
      series: p
    };
  }
  /**
   * Update chart with new data (T013).
   * Aligns series to timeline, checks hash for perf, builds option, updates instance.
   */
  update(t, e, i, n) {
    if (!this.instance) return;
    const a = this.alignSeriesOnTimeline(
      t.current.points,
      e
    ), o = t.reference ? this.alignSeriesOnTimeline(
      t.reference.points,
      e,
      i.referencePeriodStart != null ? new Date(i.referencePeriodStart) : void 0
    ) : new Array(e.length).fill(null), s = this.getHaThemeTokens(), l = JSON.stringify({
      c: a,
      r: o,
      cfg: i,
      theme: s
    });
    if (this.lastHash === l)
      return;
    this.lastHash = l, this.lastSyncedGridTop = void 0, this.lastSyncedMinHeightTotalPx = void 0, this.container.style.minHeight = "";
    const u = this.resolveColor(i.primaryColor), f = this.buildOption(
      a,
      o,
      e,
      i,
      n,
      u,
      s
    );
    this.instance.setOption(f, { notMerge: !0 });
  }
}
const TL = {
  "period.current": "Aktueller Zeitraum",
  "period.reference": "Referenzzeitraum",
  "status.loading": "Lade Langzeitstatistiken…",
  "status.error_api": "Langzeitstatistiken konnten nicht geladen werden.",
  "status.error_generic": "Beim Laden der Daten ist ein Fehler aufgetreten.",
  "status.no_data": "Für den gewählten Zeitraum sind keine Daten vorhanden.",
  "summary.current_period": "Aktueller Zeitraum",
  "summary.reference_period": "Referenzzeitraum",
  "summary.difference": "Differenz",
  "summary.difference_percent": "Differenz [%]",
  "summary.incomplete_reference": "Referenzdaten für diesen Tag sind unvollständig…",
  "forecast.current_forecast": "Prognose aktueller Zeitraum",
  "forecast.reference_consumption": "Verbrauch im Referenzzeitraum",
  "forecast.confidence": "Prognose-Konfidenz: {{confidence}}.",
  "text_summary.no_reference": "Es gibt noch nicht genug Referenzdaten, um Ihren Verbrauch zu vergleichen.",
  "text_summary.similar": "Ihr Energieverbrauch entspricht in etwa dem gleichen Zeitraum des Vorjahres.",
  "text_summary.higher": "Ihr Energieverbrauch liegt {{diff}} über dem gleichen Zeitraum des Vorjahres.",
  "text_summary.lower": "Ihr Energieverbrauch liegt {{diff}} unter dem gleichen Zeitraum des Vorjahres.",
  "error.missing_translation": "Fehlender Übersetzungsschlüssel: {{key}}",
  "editor.entity": "Entität",
  "editor.title": "Titel",
  "editor.comparison_mode": "Vergleichsmodus",
  "editor.year_over_year": "Jahr zu Jahr",
  "editor.month_over_year": "Monat zum Vorjahr",
  "editor.force_prefix": "Einheitenpräfix",
  "editor.visual_mode": "Visuell",
  "editor.yaml_mode": "YAML",
  "editor.yaml_error": "Ungültiges YAML"
}, CL = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: TL
}, Symbol.toStringTag, { value: "Module" })), ML = {
  "period.current": "Current period",
  "period.reference": "Reference period",
  "status.loading": "Loading long-term statistics data...",
  "status.error_api": "Failed to fetch long-term statistics data.",
  "status.error_generic": "An error occurred while loading data.",
  "status.no_data": "There is no data to display for the selected period.",
  "summary.current_period": "Current period",
  "summary.reference_period": "Reference period",
  "summary.difference": "Difference",
  "summary.difference_percent": "Difference [%]",
  "summary.incomplete_reference": "Reference data for this day is incomplete…",
  "forecast.current_forecast": "Current period forecast",
  "forecast.reference_consumption": "Consumption in reference period",
  "forecast.confidence": "Forecast confidence level: {{confidence}}.",
  "text_summary.no_reference": "There are not enough reference data points yet to compare your consumption.",
  "text_summary.similar": "Your energy consumption is at a similar level to the same period last year.",
  "text_summary.higher": "Your energy consumption is {{diff}} higher than in the same period last year.",
  "text_summary.lower": "Your energy consumption is {{diff}} lower than in the same period last year.",
  "error.missing_translation": "Missing translation key: {{key}}",
  "editor.entity": "Entity",
  "editor.title": "Title",
  "editor.comparison_mode": "Comparison Mode",
  "editor.year_over_year": "Year over year",
  "editor.month_over_year": "Month over year",
  "editor.force_prefix": "Unit Prefix",
  "editor.visual_mode": "Visual",
  "editor.yaml_mode": "YAML",
  "editor.yaml_error": "Invalid YAML"
}, DL = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ML
}, Symbol.toStringTag, { value: "Module" })), AL = {
  "period.current": "Bieżący okres",
  "period.reference": "Okres referencyjny",
  "status.loading": "Ładowanie danych statystyk długoterminowych...",
  "status.error_api": "Nie udało się pobrać danych statystyk długoterminowych.",
  "status.error_generic": "Wystąpił błąd podczas wczytywania danych.",
  "status.no_data": "Brak danych do wyświetlenia dla wybranego okresu.",
  "summary.current_period": "Bieżący okres",
  "summary.reference_period": "Okres referencyjny",
  "summary.difference": "Różnica",
  "summary.difference_percent": "Różnica [%]",
  "summary.incomplete_reference": "Dane referencyjne dla tego dnia są niepełne…",
  "forecast.current_forecast": "Prognoza bieżącego okresu",
  "forecast.reference_consumption": "Zużycie w okresie referencyjnym",
  "forecast.confidence": "Poziom pewności prognozy: {{confidence}}.",
  "text_summary.no_reference": "Brak wystarczających danych, aby porównać Twoje zużycie energii.",
  "text_summary.similar": "Twoje zużycie jest na podobnym poziomie jak w tym samym okresie w poprzednim roku.",
  "text_summary.higher": "Twoje zużycie jest o {{diff}} wyższe niż w tym samym okresie w poprzednim roku.",
  "text_summary.lower": "Twoje zużycie jest o {{diff}} niższe niż w tym samym okresie w poprzednim roku.",
  "error.missing_translation": "Brak tłumaczenia dla klucza: {{key}}",
  "editor.entity": "Encja",
  "editor.title": "Tytuł",
  "editor.comparison_mode": "Tryb porównania",
  "editor.year_over_year": "Rok do roku",
  "editor.month_over_year": "Miesiąc do miesiąca rok temu",
  "editor.force_prefix": "Prefiks jednostki",
  "editor.visual_mode": "Wizualny",
  "editor.yaml_mode": "YAML",
  "editor.yaml_error": "Nieprawidłowy YAML"
}, LL = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: AL
}, Symbol.toStringTag, { value: "Module" })), uu = "error.missing_translation", zi = "en", Ep = /* @__PURE__ */ Object.assign({
  "../translations/de.json": CL,
  "../translations/en.json": DL,
  "../translations/pl.json": LL
}), qn = /* @__PURE__ */ Object.create(null);
for (const r of Object.keys(Ep)) {
  const t = r.match(/\/([^/]+)\.json$/);
  if (t) {
    const e = t[1], i = Ep[r], n = i == null ? void 0 : i.default;
    n && typeof n == "object" && (qn[e] = n);
  }
}
const PL = [
  "comma",
  "decimal",
  "language",
  "system"
];
function IL(r) {
  return typeof r == "string" && PL.includes(r);
}
function EL(r) {
  return Object.prototype.hasOwnProperty.call(qn, r);
}
function RL(r, t) {
  return t ? r.replace(/\{\{(\w+)\}\}/g, (e, i) => {
    const n = t[i];
    return n === void 0 ? e : String(n);
  }) : r;
}
function xn(r, t) {
  var s, l, u;
  const e = t.language, i = e !== void 0 && e !== "" ? EL(e) ? e : (t.debug && console.warn(
    `[Energy Horizon] Unsupported config.language "${e}", falling back to "${zi}"`
  ), zi) : ((s = r == null ? void 0 : r.locale) == null ? void 0 : s.language) || (r == null ? void 0 : r.language) || zi, n = t.number_format, a = n !== void 0 ? IL(n) ? n : (t.debug && console.warn(
    `[Energy Horizon] Invalid config.number_format "${String(n)}", falling back to "system"`
  ), "system") : ((l = r == null ? void 0 : r.locale) == null ? void 0 : l.number_format) ?? "system", o = ((u = r == null ? void 0 : r.config) == null ? void 0 : u.time_zone) || // fall back to UTC if HA does not provide a time zone
  "UTC";
  return {
    language: i,
    numberFormat: a,
    timeZone: o
  };
}
function Rp(r, t) {
  switch (r) {
    case "comma":
      return "de";
    case "decimal":
      return "en";
    case "language":
      return t;
    case "system":
    default:
      return typeof navigator < "u" && navigator.language ? navigator.language : t || zi;
  }
}
function lr(r) {
  const t = qn[r] ?? qn[zi] ?? {}, e = qn[zi] ?? {};
  return (i, n) => {
    let a = t[i];
    return a === void 0 && (a = e[i]), a === void 0 ? i : RL(a, n);
  };
}
const mf = [
  { prefix: "G", factor: 1e9, display: "G" },
  { prefix: "M", factor: 1e6, display: "M" },
  { prefix: "k", factor: 1e3, display: "k" },
  { prefix: "", factor: 1, display: "" },
  { prefix: "m", factor: 1e-3, display: "m" },
  { prefix: "u", factor: 1e-6, display: "µ" }
  // µ Micro Sign
], kL = {
  G: "G",
  M: "M",
  k: "k",
  "": "",
  m: "m",
  u: "µ"
  // µ Micro Sign (U+00B5)
}, kp = /* @__PURE__ */ new Set([
  "%",
  "°C",
  "°F",
  "K",
  "h",
  "min",
  "s",
  "ms",
  "d",
  "°",
  "lx",
  "lm",
  "pH",
  "dB",
  "ppm",
  "rpm",
  "bar",
  "Pa",
  "hPa",
  "kPa",
  "mbar",
  "m",
  // meter — not to be confused with milli
  "Hz",
  "kHz",
  "MHz",
  "GHz"
]);
function OL(r) {
  if (!r)
    return {
      baseUnit: "",
      existingPrefix: "",
      scalable: !1
    };
  if (kp.has(r))
    return {
      baseUnit: r,
      existingPrefix: "",
      scalable: !1
    };
  const t = ["G", "M", "k", "m", "u"];
  for (const e of t)
    if (r.startsWith(e)) {
      const i = r.slice(e.length);
      if (i && !kp.has(i))
        return {
          baseUnit: i,
          existingPrefix: e,
          scalable: !0
        };
    }
  return {
    baseUnit: r,
    existingPrefix: "",
    scalable: !0
  };
}
function Op(r) {
  if (r === 0 || !Number.isFinite(r))
    return "";
  for (const t of mf)
    if (r / t.factor >= 1)
      return t.prefix;
  return "u";
}
function NL(r, t, e) {
  let i = (e == null ? void 0 : e.force_prefix) ?? "auto";
  (i === "µ" || i === "μ") && (i = "u");
  const n = OL(t);
  if (!n.scalable || i === "none")
    return {
      values: [...r],
      unit: t,
      prefix: "",
      factor: 1
    };
  const a = r.filter((g) => g !== null);
  if (a.length === 0)
    return {
      values: [...r],
      unit: t,
      prefix: "",
      factor: 1
    };
  const o = Math.max(...a.map((g) => Math.abs(g))), s = mf.find((g) => g.prefix === n.existingPrefix), l = (s == null ? void 0 : s.factor) ?? 1, u = o * l;
  let f;
  i === "auto" ? f = Op(u) : ["G", "M", "k", "", "m", "u"].includes(i) ? f = i : (console.warn(`[unit-scaler] Unknown force_prefix: "${i}" — falling back to auto`), f = Op(u));
  const h = mf.find((g) => g.prefix === f), v = (h == null ? void 0 : h.factor) ?? 1, c = l / v, d = r.map((g) => g === null ? null : g * c), p = (kL[f] ?? "") + n.baseUnit;
  return {
    values: d,
    unit: p,
    prefix: f,
    factor: c
  };
}
const BL = Hp`
  :host {
    display: block;
    height: 100%;
  }

  .loading {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px;
  }

  .content {
    padding: 16px;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }

  .heading {
    margin-bottom: 12px;
    font-weight: 500;
  }

  .summary {
    margin-bottom: 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 0.9rem;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    gap: 8px;
  }

  .summary-row .label {
    color: var(--secondary-text-color);
  }

  .summary-row .value {
    font-weight: 500;
  }

  .summary-note {
    margin-top: 4px;
    font-size: 0.8rem;
    color: var(--secondary-text-color);
  }

  .forecast {
    margin-bottom: 12px;
    font-size: 0.9rem;
  }

  .chart-container {
    position: relative;
    flex: 1 1 auto;
    /* ECharts requires a non-zero container height.
       In Home Assistant cards, percentage heights are often not resolved,
       so a plain min-height: 0 can collapse the chart to 0px. */
    min-height: 240px;
  }

  .ebc-card {
    height: 100%;
    box-sizing: border-box;
  }

  .ebc-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .ebc-title {
    font-weight: 500;
    color: var(--primary-text-color);
  }

  .ebc-icon {
    display: inline-flex;
    --mdc-icon-size: 24px;
  }
`;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const FL = { attribute: !0, type: String, converter: Mo, reflect: !1, hasChanged: xf }, zL = (r = FL, t, e) => {
  const { kind: i, metadata: n } = e;
  let a = globalThis.litPropertyMetadata.get(n);
  if (a === void 0 && globalThis.litPropertyMetadata.set(n, a = /* @__PURE__ */ new Map()), i === "setter" && ((r = Object.create(r)).wrapped = !0), a.set(e.name, r), i === "accessor") {
    const { name: o } = e;
    return { set(s) {
      const l = t.get.call(this);
      t.set.call(this, s), this.requestUpdate(o, l, r, !0, s);
    }, init(s) {
      return s !== void 0 && this.C(o, void 0, r, s), s;
    } };
  }
  if (i === "setter") {
    const { name: o } = e;
    return function(s) {
      const l = this[o];
      t.call(this, s), this.requestUpdate(o, l, r, !0, s);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function w_(r) {
  return (t, e) => typeof e == "object" ? zL(r, t, e) : ((i, n, a) => {
    const o = n.hasOwnProperty(a);
    return n.constructor.createProperty(a, i), o ? Object.getOwnPropertyDescriptor(n, a) : void 0;
  })(r, t, e);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function fu(r) {
  return w_({ ...r, state: !0, attribute: !1 });
}
var HL = Object.create, x_ = Object.defineProperty, $L = Object.getOwnPropertyDescriptor, T_ = (r, t) => (t = Symbol[r]) ? t : Symbol.for("Symbol." + r), Sa = (r) => {
  throw TypeError(r);
}, VL = (r, t, e) => t in r ? x_(r, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : r[t] = e, GL = (r) => [, , , HL((r == null ? void 0 : r[T_("metadata")]) ?? null)], C_ = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"], In = (r) => r !== void 0 && typeof r != "function" ? Sa("Function expected") : r, WL = (r, t, e, i, n) => ({ kind: C_[r], name: t, metadata: i, addInitializer: (a) => e._ ? Sa("Already initialized") : n.push(In(a || null)) }), UL = (r, t) => VL(t, T_("metadata"), r[3]), rr = (r, t, e, i) => {
  for (var n = 0, a = r[t >> 1], o = a && a.length; n < o; n++) t & 1 ? a[n].call(e) : i = a[n].call(e, i);
  return i;
}, Os = (r, t, e, i, n, a) => {
  for (var o, s, l, u, f, h = t & 7, v = !1, c = !1, d = r.length + 1, y = C_[h + 5], p = r[d - 1] = [], g = r[d] || (r[d] = []), m = (n = n.prototype, $L({ get [e]() {
    return YL(this, a);
  }, set [e](S) {
    return XL(this, a, S);
  } }, e)), _ = i.length - 1; _ >= 0; _--)
    u = WL(h, e, l = {}, r[3], g), u.static = v, u.private = c, f = u.access = { has: (S) => e in S }, f.get = (S) => S[e], f.set = (S, w) => S[e] = w, s = (0, i[_])({ get: m.get, set: m.set }, u), l._ = 1, s === void 0 ? In(s) && (m[y] = s) : typeof s != "object" || s === null ? Sa("Object expected") : (In(o = s.get) && (m.get = o), In(o = s.set) && (m.set = o), In(o = s.init) && p.unshift(o));
  return m && x_(n, e, m), n;
}, M_ = (r, t, e) => t.has(r) || Sa("Cannot " + e), YL = (r, t, e) => (M_(r, t, "read from private field"), t.get(r)), uo = (r, t, e) => t.has(r) ? Sa("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(r) : t.set(r, e), XL = (r, t, e, i) => (M_(r, t, "write to private field"), t.set(r, e), e), D_, A_, L_, P_, _f, Ht, Ih, Eh, Rh, kh;
class oi extends (_f = Pi, P_ = [w_({ attribute: !1 })], L_ = [fu()], A_ = [fu()], D_ = [fu()], _f) {
  constructor() {
    super(...arguments), uo(this, Ih, rr(Ht, 8, this)), rr(Ht, 11, this), this._config = void 0, uo(this, Eh, rr(Ht, 12, this, "visual")), rr(Ht, 15, this), uo(this, Rh, rr(Ht, 16, this, "")), rr(Ht, 19, this), uo(this, kh, rr(Ht, 20, this, null)), rr(Ht, 23, this);
  }
  setConfig(t) {
    this._config = { ...t }, this._editorMode = "visual", this._yamlError = null, this.requestUpdate();
  }
  _formData() {
    var t, e, i, n;
    return {
      entity: ((t = this._config) == null ? void 0 : t.entity) ?? "",
      title: (e = this._config) == null ? void 0 : e.title,
      comparison_mode: (i = this._config) == null ? void 0 : i.comparison_mode,
      force_prefix: (n = this._config) == null ? void 0 : n.force_prefix
    };
  }
  _computeLabel(t) {
    var i, n, a;
    const e = ((n = (i = this.hass) == null ? void 0 : i.locale) == null ? void 0 : n.language) ?? ((a = this.hass) == null ? void 0 : a.language) ?? "en";
    return lr(e)(`editor.${t.name}`);
  }
  _hasYamlSupport() {
    return typeof window.jsyaml < "u";
  }
  _editorLang() {
    var t, e, i;
    return ((e = (t = this.hass) == null ? void 0 : t.locale) == null ? void 0 : e.language) ?? ((i = this.hass) == null ? void 0 : i.language) ?? "en";
  }
  _buildSchema(t) {
    const e = lr(t);
    return [
      { name: "entity", selector: { entity: { domain: "sensor" } } },
      { name: "title", selector: { text: {} } },
      {
        name: "comparison_mode",
        selector: {
          select: {
            options: [
              { value: "year_over_year", label: e("editor.year_over_year") },
              { value: "month_over_year", label: e("editor.month_over_year") }
            ]
          }
        }
      },
      {
        name: "force_prefix",
        selector: {
          select: {
            options: [
              { value: "", label: "" },
              { value: "auto", label: "Auto" },
              { value: "none", label: "None (raw)" },
              { value: "G", label: "G (Giga)" },
              { value: "M", label: "M (Mega)" },
              { value: "k", label: "k (Kilo)" },
              { value: "m", label: "m (milli)" },
              { value: "µ", label: "µ (micro)" }
            ]
          }
        }
      }
    ];
  }
  _handleValueChanged(t) {
    if (!this._config) return;
    const e = {
      ...this._config,
      ...t.detail.value
    };
    this._config = e, this._emitConfigChanged();
  }
  _emitConfigChanged() {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: !0,
        composed: !0
      })
    );
  }
  _switchToYaml() {
    this._yamlText = window.jsyaml.dump(this._config ?? {}), this._yamlError = null, this._editorMode = "yaml";
  }
  _switchToVisual() {
    if (this._editorMode === "yaml")
      try {
        const t = window.jsyaml.load(this._yamlText);
        if (t == null || typeof t != "object" || Array.isArray(t)) {
          const e = this._editorLang();
          this._yamlError = lr(e)("editor.yaml_error");
          return;
        }
        this._config = t, this._yamlError = null, this._editorMode = "visual", this._emitConfigChanged();
      } catch (t) {
        this._yamlError = t.message;
      }
  }
  _handleYamlInput(t) {
    this._yamlText = t.target.value;
  }
  render() {
    if (!this._config)
      return gt``;
    const t = this._editorLang(), e = lr(t), i = e("editor.visual_mode"), n = e("editor.yaml_mode");
    return gt`
      <div class="editor">
        ${this._hasYamlSupport() ? gt`
              <div class="toggle-row">
                <button
                  type="button"
                  class=${this._editorMode === "visual" ? "active" : ""}
                  @click=${this._switchToVisual}
                >
                  ${i}
                </button>
                <button
                  type="button"
                  class=${this._editorMode === "yaml" ? "active" : ""}
                  @click=${this._switchToYaml}
                >
                  ${n}
                </button>
              </div>
            ` : ""}
        ${this._editorMode === "visual" ? gt`
              <ha-form
                .schema=${this._buildSchema(t)}
                .data=${this._formData()}
                .hass=${this.hass}
                .computeLabel=${this._computeLabel.bind(this)}
                @value-changed=${this._handleValueChanged}
              ></ha-form>
            ` : gt`
              <textarea
                class="yaml-editor"
                .value=${this._yamlText}
                @input=${this._handleYamlInput}
              ></textarea>
              ${this._yamlError ? gt`<p class="error">${this._yamlError}</p>` : ""}
            `}
      </div>
    `;
  }
}
Ht = GL(_f);
Ih = /* @__PURE__ */ new WeakMap();
Eh = /* @__PURE__ */ new WeakMap();
Rh = /* @__PURE__ */ new WeakMap();
kh = /* @__PURE__ */ new WeakMap();
Os(Ht, 4, "hass", P_, oi, Ih);
Os(Ht, 4, "_editorMode", L_, oi, Eh);
Os(Ht, 4, "_yamlText", A_, oi, Rh);
Os(Ht, 4, "_yamlError", D_, oi, kh);
UL(Ht, oi);
oi.styles = Hp`
    :host {
      display: block;
    }
    .editor {
      padding: 8px;
    }
    .toggle-row {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }
    .toggle-row button {
      flex: 1;
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      border: 1px solid var(--divider-color, #ccc);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #000);
    }
    .toggle-row button.active {
      font-weight: 600;
      border-color: var(--primary-color);
      color: var(--primary-color);
    }
    .yaml-editor {
      width: 100%;
      min-height: 200px;
      box-sizing: border-box;
      font-family: monospace;
    }
    .error {
      color: var(--error-color, #c62828);
      margin-top: 8px;
    }
  `;
customElements.define("energy-horizon-card-editor", oi);
function Np(r, t, e) {
  return r > 0 ? `+${t.format(r)} ${e}` : r < 0 ? `−${t.format(Math.abs(r))} ${e}` : `${t.format(0)} ${e}`;
}
function Bp(r, t, e) {
  return t === "year_over_year" ? String(r.getFullYear()) : t === "month_over_year" ? new Intl.DateTimeFormat(e, { month: "long", year: "numeric" }).format(r) : "";
}
function fo(r) {
  const t = Number(r);
  return !Number.isFinite(t) || t < 0 || t > 100 ? 30 : t;
}
const Jo = class Jo extends Pi {
  constructor() {
    super(...arguments), this._state = { status: "loading" };
  }
  _localizeOrError(t, e, i) {
    var a;
    const n = t(e, i);
    if (n === e) {
      (a = this._config) != null && a.debug && console.warn(
        `[Energy Horizon] Missing translation key: "${e}" (language: "${xn(
          this.hass,
          this._config
        ).language}")`
      ), this._state = {
        status: "error",
        errorMessage: uu
      };
      const o = t(uu, { key: e });
      return o === uu ? e : o;
    }
    return n;
  }
  setConfig(t) {
    this._config = t, this._state = { status: "loading" };
  }
  getCardSize() {
    return 4;
  }
  updated(t) {
    if ((t.has("hass") || t.has("_config") || t.has("_state")) && (this._state.status === "loading" && this._loadData(), this._state.status === "ready" && this._state.comparisonSeries)) {
      if (!this._chartRenderer) {
        const e = this.renderRoot.querySelector(".chart-container");
        e && (this._chartRenderer = new xL(e));
      }
      if (this._chartRenderer && this._state.period) {
        const e = xn(this.hass, this._config), i = lr(e.language), n = this._computeFullEnd(this._state.period), a = Xh(this._state.period, n), o = this._buildRendererConfig();
        this._chartRenderer.update(this._state.comparisonSeries, a, o, {
          current: this._localizeOrError(i, "period.current"),
          reference: this._localizeOrError(i, "period.reference")
        });
      }
    }
  }
  async _loadData() {
    var l, u, f;
    if (!this._config || !this.hass) return;
    const t = /* @__PURE__ */ new Date(), e = xn(this.hass, this._config), i = lr(e.language), n = K_(this._config, t, e.timeZone), a = Zh(n, this._config.entity), o = {
      ...n,
      current_start: n.reference_start,
      current_end: n.reference_end
    }, s = Zh(o, this._config.entity);
    try {
      this._config.debug && (console.log("[Energy Horizon] API Query (current):", a), console.log("[Energy Horizon] API Query (reference):", s));
      const [h, v] = await Promise.all([
        this.hass.connection.sendMessagePromise(
          a
        ),
        this.hass.connection.sendMessagePromise(
          s
        )
      ]);
      if (this._config.debug) {
        const x = (h == null ? void 0 : h.result) ?? h, D = x.results ?? x;
        if (console.log("[Energy Horizon] API Response (current, raw):", h), D && typeof D == "object") {
          const T = Object.keys(D);
          console.log(
            "[Energy Horizon] Results keys (available statistic_ids):",
            T
          );
          const C = D[this._config.entity];
          console.log(
            `[Energy Horizon] Data for entity "${this._config.entity}":`,
            C ? `${Array.isArray(C) ? C.length : 0} points` : "not found"
          ), console.log(
            "[Energy Horizon] Reference API Response (raw):",
            v
          );
        } else
          console.log(
            "[Energy Horizon] No results in response or invalid structure"
          );
      }
      const c = qh(
        h,
        this._config.entity,
        i("period.current")
      );
      if (!c) {
        this._config.debug && console.log(
          "[Energy Horizon] current series could not be built – check entity ID and results structure above"
        ), this._state = { status: "no-data" };
        return;
      }
      const d = qh(
        v,
        this._config.entity,
        i("period.reference")
      ), y = ((f = (u = (l = this.hass.states) == null ? void 0 : l[this._config.entity]) == null ? void 0 : u.attributes) == null ? void 0 : f.unit_of_measurement) ?? "", p = {
        current: y ? { ...c, unit: c.unit || y } : c,
        reference: d ? y ? { ...d, unit: d.unit || y } : d : void 0,
        aggregation: n.aggregation,
        time_zone: n.time_zone
      }, g = this._applyUnitScalingToSeries(p, y), m = J_(g), _ = this._computeFullEnd(n), S = Xh(n, _), w = t0(g, S.length);
      !m.unit && y && (m.unit = y), w && !w.unit && y && (w.unit = y);
      const b = e0(m);
      this._state = {
        status: "ready",
        comparisonSeries: g,
        summary: m,
        forecast: w,
        textSummary: b,
        period: n
      };
    } catch (h) {
      console.error(h), this._state = {
        status: "error",
        errorMessage: "status.error_api"
      };
    }
  }
  /**
   * Scales cumulative series (and reference) for display; same factor applied to
   * point rawValue so computeForecast stays consistent. Does not touch component state.
   */
  _applyUnitScalingToSeries(t, e) {
    var g;
    const i = t.current.points.map((m) => m.value), n = (g = t.reference) == null ? void 0 : g.points, a = n == null ? void 0 : n.map((m) => m.value), o = a != null && a.length ? [...i, ...a] : [...i], s = NL(o, e, {
      force_prefix: this._config.force_prefix
    }), l = i.length, u = s.values.slice(0, l), f = a != null && a.length && (n != null && n.length) ? s.values.slice(l) : void 0, h = s.factor, v = (m, _, S) => ({
      ...m,
      value: S[_] ?? m.value,
      rawValue: m.rawValue != null && Number.isFinite(m.rawValue) ? m.rawValue * h : void 0
    }), c = t.current.points.map(
      (m, _) => v(m, _, u)
    ), d = c.length > 0 ? c[c.length - 1].value : 0, y = {
      ...t.current,
      points: c,
      unit: s.unit,
      total: d
    };
    let p;
    if (t.reference && n && f && f.length === n.length) {
      const m = n.map((S, w) => v(S, w, f)), _ = m.length > 0 ? m[m.length - 1].value : 0;
      p = {
        ...t.reference,
        points: m,
        unit: s.unit,
        total: _
      };
    } else t.reference ? p = { ...t.reference, unit: s.unit } : p = void 0;
    return {
      ...t,
      current: y,
      reference: p
    };
  }
  _computeFullEnd(t) {
    return this._config.comparison_mode === "year_over_year" ? new Date(t.current_start.getFullYear(), 11, 31) : new Date(t.current_start.getFullYear(), t.current_start.getMonth() + 1, 0);
  }
  _buildRendererConfig() {
    var h, v, c;
    const t = xn(this.hass ?? null, this._config), e = t.language, i = Rp(t.numberFormat, t.language), n = lr(e), a = this._localizeOrError(
      n,
      "forecast.current_forecast"
    );
    if (!this._state.period || !this._state.comparisonSeries)
      return {
        primaryColor: this._config.primary_color ?? "",
        fillCurrent: this._config.fill_current ?? !0,
        fillReference: this._config.fill_reference ?? !1,
        fillCurrentOpacity: fo(this._config.fill_current_opacity),
        fillReferenceOpacity: fo(this._config.fill_reference_opacity),
        connectNulls: this._config.connect_nulls ?? !0,
        showLegend: this._config.show_legend === !0,
        showForecast: this._config.show_forecast ?? !1,
        forecastTotal: (h = this._state.forecast) == null ? void 0 : h.forecast_total,
        unit: ((v = this._state.forecast) == null ? void 0 : v.unit) ?? "",
        periodLabel: "",
        comparisonMode: this._config.comparison_mode,
        language: e,
        numberLocale: i,
        precision: this._config.precision ?? 2,
        forecastLabel: a
      };
    const o = this._state.period, s = this._state.comparisonSeries;
    let l = "";
    this._config.comparison_mode === "year_over_year" ? l = String(o.current_start.getFullYear()) : l = new Intl.DateTimeFormat(e, { month: "long" }).format(o.current_start);
    const u = s.current.unit, f = this._config.precision ?? 2;
    return {
      primaryColor: this._config.primary_color ?? "",
      fillCurrent: this._config.fill_current ?? !0,
      fillReference: this._config.fill_reference ?? !1,
      fillCurrentOpacity: fo(this._config.fill_current_opacity),
      fillReferenceOpacity: fo(this._config.fill_reference_opacity),
      connectNulls: this._config.connect_nulls ?? !0,
      showLegend: this._config.show_legend === !0,
      showForecast: this._config.show_forecast ?? !1,
      forecastTotal: (c = this._state.forecast) == null ? void 0 : c.forecast_total,
      unit: u,
      periodLabel: l,
      referencePeriodStart: o.reference_start.getTime(),
      comparisonMode: this._config.comparison_mode,
      language: e,
      numberLocale: i,
      precision: f,
      forecastLabel: a
    };
  }
  render() {
    var L, P, I, E, R, V, B, F;
    if (!this._config || !this.hass)
      return gt``;
    const t = xn(this.hass, this._config), e = lr(t.language);
    if (this._state.status === "loading")
      return gt`<ha-card class="ebc-card">
        <div class="loading">
          <ha-circular-progress active size="small"></ha-circular-progress>
          <span>${this._localizeOrError(e, "status.loading")}</span>
        </div>
      </ha-card>`;
    if (this._state.status === "error") {
      const $ = this._state.errorMessage ?? "status.error_generic";
      return gt`<ha-card class="ebc-card">
        <ha-alert alert-type="error">
          ${this._localizeOrError(e, $)}
        </ha-alert>
      </ha-card>`;
    }
    if (this._state.status === "no-data")
      return gt`<ha-card class="ebc-card">
        <ha-alert alert-type="info">
          ${this._localizeOrError(e, "status.no_data")}
        </ha-alert>
      </ha-card>`;
    const i = this._state.textSummary, n = this._state.summary, a = this._state.forecast, o = this._config.show_title !== !1, s = (P = (L = this.hass) == null ? void 0 : L.states) == null ? void 0 : P[this._config.entity], l = ((I = this._config.title) == null ? void 0 : I.trim()) || (s == null ? void 0 : s.attributes.friendly_name) || this._config.entity, u = this._config.show_icon !== !1, f = ((E = this._config.icon) == null ? void 0 : E.trim()) || void 0, v = o && !!l || u && (!!f || !!s), c = Rp(
      t.numberFormat,
      t.language
    ), d = this._config.precision ?? 2, y = ((B = (V = (R = this.hass.states) == null ? void 0 : R[this._config.entity]) == null ? void 0 : V.attributes) == null ? void 0 : B.unit_of_measurement) ?? "", p = new Intl.NumberFormat(c, {
      minimumFractionDigits: d,
      maximumFractionDigits: d
    }), g = new Intl.NumberFormat(c, {
      maximumFractionDigits: 1
    }), m = (n == null ? void 0 : n.unit) || y;
    let _ = this._localizeOrError(e, "summary.current_period"), S = this._localizeOrError(e, "summary.reference_period");
    if (this._state.status === "ready" && this._state.period) {
      const $ = this._config.language ?? ((F = this.hass) == null ? void 0 : F.language) ?? "en", J = Bp(this._state.period.current_start, this._config.comparison_mode, $), j = Bp(this._state.period.reference_start, this._config.comparison_mode, $);
      _ = `${_} (${J})`, S = `${S} (${j})`;
    }
    const w = n != null ? `${p.format(n.current_cumulative)} ${m}` : "", b = n != null && n.reference_cumulative != null ? `${p.format(n.reference_cumulative)} ${m}` : null, x = n != null && n.difference != null ? Np(n.difference, p, m) : null, D = n != null && n.differencePercent != null ? Np(n.differencePercent, g, "%") : null, T = a != null && a.enabled && this._config.show_forecast !== !1, C = (a == null ? void 0 : a.unit) || m;
    let M = null;
    if (i) {
      const $ = i.diffValue != null ? `${p.format(i.diffValue)} ${m}` : void 0;
      switch (i.trend) {
        case "higher":
          M = this._localizeOrError(
            e,
            "text_summary.higher",
            $ ? { diff: $ } : void 0
          );
          break;
        case "lower":
          M = this._localizeOrError(
            e,
            "text_summary.lower",
            $ ? { diff: $ } : void 0
          );
          break;
        case "similar":
          M = this._localizeOrError(e, "text_summary.similar");
          break;
        case "unknown":
        default:
          M = this._localizeOrError(e, "text_summary.no_reference");
          break;
      }
    }
    return gt`<ha-card class="ebc-card">
      <div class="content ebc-content">
        ${v ? gt`<div class="ebc-title-row">
              ${u ? f ? gt`<ha-icon class="ebc-icon" .icon=${f}></ha-icon>` : s ? gt`<ha-state-icon
                        class="ebc-icon"
                        .hass=${this.hass}
                        .stateObj=${s}
                      ></ha-state-icon>` : null : null}
              ${o && l ? gt`<span class="ebc-title">${l}</span>` : null}
            </div>` : null}

        ${M ? gt`<div class="heading ebc-header">${M}</div>` : null}

        ${n ? gt`<div class="summary ebc-stats">
              <div class="summary-row">
                <span class="label">${_}</span>
                <span class="value">${w}</span>
              </div>

              ${b ? gt`<div class="summary-row">
                    <span class="label">${S}</span>
                    <span class="value">${b}</span>
                  </div>` : null}

              ${x ? gt`<div class="summary-row">
                    <span class="label"
                      >${this._localizeOrError(e, "summary.difference")}</span
                    >
                    <span class="value">${x}</span>
                  </div>` : null}

              ${D ? gt`<div class="summary-row">
                    <span class="label"
                      >${this._localizeOrError(
      e,
      "summary.difference_percent"
    )}</span
                    >
                    <span class="value">${D}</span>
                  </div>` : null}

              ${n.reference_cumulative == null ? gt`<div class="summary-note">
                    ${this._localizeOrError(
      e,
      "summary.incomplete_reference"
    )}
                  </div>` : null}
            </div>` : null}

        ${T && a ? gt`<div class="forecast ebc-forecast">
              <div class="summary-row">
                <span class="label"
                  >${this._localizeOrError(
      e,
      "forecast.current_forecast"
    )}</span
                >
                <span class="value"
                  >${p.format(
      a.forecast_total ?? 0
    )} ${C}</span
                >
              </div>
              ${a.reference_total != null ? gt`<div class="summary-row">
                    <span class="label"
                      >${this._localizeOrError(
      e,
      "forecast.reference_consumption"
    )}</span
                    >
                    <span class="value"
                      >${p.format(
      a.reference_total
    )} ${C}</span
                    >
                  </div>` : null}
              <div class="summary-note">
                ${this._localizeOrError(e, "forecast.confidence", {
      confidence: a.confidence
    })}
              </div>
            </div>` : null}

        <div class="chart-container ebc-chart"></div>
      </div>
    </ha-card>`;
  }
  static getConfigElement() {
    return document.createElement("energy-horizon-card-editor");
  }
  static getStubConfig() {
    return { entity: "", comparison_mode: "year_over_year" };
  }
};
Jo.properties = {
  hass: { type: Object, attribute: !1 },
  _config: { state: !0 },
  _state: { state: !0 }
}, Jo.styles = BL;
let Sf = Jo;
customElements.define("energy-horizon-card", Sf);
window.customCards = window.customCards ?? [];
window.customCards.push({
  type: "energy-horizon-card",
  name: "Energy Horizon",
  description: "Visualize energy consumption by comparing current and reference period trends."
});
//# sourceMappingURL=energy-horizon-card.js.map
