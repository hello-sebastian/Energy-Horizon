var Wo = Object.defineProperty;
var Bo = (n, t, e) => t in n ? Wo(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e;
var y = (n, t, e) => Bo(n, typeof t != "symbol" ? t + "" : t, e);
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const mn = globalThis, wi = mn.ShadowRoot && (mn.ShadyCSS === void 0 || mn.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, vi = Symbol(), Bi = /* @__PURE__ */ new WeakMap();
let Dr = class {
  constructor(t, e, i) {
    if (this._$cssResult$ = !0, i !== vi) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (wi && t === void 0) {
      const i = e !== void 0 && e.length === 1;
      i && (t = Bi.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && Bi.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Yo = (n) => new Dr(typeof n == "string" ? n : n + "", void 0, vi), jo = (n, ...t) => {
  const e = n.length === 1 ? n[0] : t.reduce((i, s, r) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s) + n[r + 1], n[0]);
  return new Dr(e, n, vi);
}, Vo = (n, t) => {
  if (wi) n.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const i = document.createElement("style"), s = mn.litNonce;
    s !== void 0 && i.setAttribute("nonce", s), i.textContent = e.cssText, n.appendChild(i);
  }
}, Yi = wi ? (n) => n : (n) => n instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const i of t.cssRules) e += i.cssText;
  return Yo(e);
})(n) : n;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Uo, defineProperty: qo, getOwnPropertyDescriptor: Xo, getOwnPropertyNames: Qo, getOwnPropertySymbols: Go, getPrototypeOf: Ko } = Object, Tt = globalThis, ji = Tt.trustedTypes, Zo = ji ? ji.emptyScript : "", Nn = Tt.reactiveElementPolyfillSupport, Se = (n, t) => n, ri = { toAttribute(n, t) {
  switch (t) {
    case Boolean:
      n = n ? Zo : null;
      break;
    case Object:
    case Array:
      n = n == null ? n : JSON.stringify(n);
  }
  return n;
}, fromAttribute(n, t) {
  let e = n;
  switch (t) {
    case Boolean:
      e = n !== null;
      break;
    case Number:
      e = n === null ? null : Number(n);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(n);
      } catch {
        e = null;
      }
  }
  return e;
} }, Pr = (n, t) => !Uo(n, t), Vi = { attribute: !0, type: String, converter: ri, reflect: !1, useDefault: !1, hasChanged: Pr };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), Tt.litPropertyMetadata ?? (Tt.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let ie = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = Vi) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const i = Symbol(), s = this.getPropertyDescriptor(t, i, e);
      s !== void 0 && qo(this.prototype, t, s);
    }
  }
  static getPropertyDescriptor(t, e, i) {
    const { get: s, set: r } = Xo(this.prototype, t) ?? { get() {
      return this[e];
    }, set(o) {
      this[e] = o;
    } };
    return { get: s, set(o) {
      const a = s == null ? void 0 : s.call(this);
      r == null || r.call(this, o), this.requestUpdate(t, a, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? Vi;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Se("elementProperties"))) return;
    const t = Ko(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Se("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Se("properties"))) {
      const e = this.properties, i = [...Qo(e), ...Go(e)];
      for (const s of i) this.createProperty(s, e[s]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [i, s] of e) this.elementProperties.set(i, s);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, i] of this.elementProperties) {
      const s = this._$Eu(e, i);
      s !== void 0 && this._$Eh.set(s, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const i = new Set(t.flat(1 / 0).reverse());
      for (const s of i) e.unshift(Yi(s));
    } else t !== void 0 && e.push(Yi(t));
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
    return Vo(t, this.constructor.elementStyles), t;
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
    var r;
    const i = this.constructor.elementProperties.get(t), s = this.constructor._$Eu(t, i);
    if (s !== void 0 && i.reflect === !0) {
      const o = (((r = i.converter) == null ? void 0 : r.toAttribute) !== void 0 ? i.converter : ri).toAttribute(e, i.type);
      this._$Em = t, o == null ? this.removeAttribute(s) : this.setAttribute(s, o), this._$Em = null;
    }
  }
  _$AK(t, e) {
    var r, o;
    const i = this.constructor, s = i._$Eh.get(t);
    if (s !== void 0 && this._$Em !== s) {
      const a = i.getPropertyOptions(s), c = typeof a.converter == "function" ? { fromAttribute: a.converter } : ((r = a.converter) == null ? void 0 : r.fromAttribute) !== void 0 ? a.converter : ri;
      this._$Em = s;
      const l = c.fromAttribute(e, a.type);
      this[s] = l ?? ((o = this._$Ej) == null ? void 0 : o.get(s)) ?? l, this._$Em = null;
    }
  }
  requestUpdate(t, e, i, s = !1, r) {
    var o;
    if (t !== void 0) {
      const a = this.constructor;
      if (s === !1 && (r = this[t]), i ?? (i = a.getPropertyOptions(t)), !((i.hasChanged ?? Pr)(r, e) || i.useDefault && i.reflect && r === ((o = this._$Ej) == null ? void 0 : o.get(t)) && !this.hasAttribute(a._$Eu(t, i)))) return;
      this.C(t, e, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: i, reflect: s, wrapped: r }, o) {
    i && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t) && (this._$Ej.set(t, o ?? e ?? this[t]), r !== !0 || o !== void 0) || (this._$AL.has(t) || (this.hasUpdated || i || (e = void 0), this._$AL.set(t, e)), s === !0 && this._$Em !== t && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t));
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
        for (const [r, o] of this._$Ep) this[r] = o;
        this._$Ep = void 0;
      }
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [r, o] of s) {
        const { wrapped: a } = o, c = this[r];
        a !== !0 || this._$AL.has(r) || c === void 0 || this.C(r, void 0, o, c);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), (i = this._$EO) == null || i.forEach((s) => {
        var r;
        return (r = s.hostUpdate) == null ? void 0 : r.call(s);
      }), this.update(e)) : this._$EM();
    } catch (s) {
      throw t = !1, this._$EM(), s;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    var e;
    (e = this._$EO) == null || e.forEach((i) => {
      var s;
      return (s = i.hostUpdated) == null ? void 0 : s.call(i);
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
ie.elementStyles = [], ie.shadowRootOptions = { mode: "open" }, ie[Se("elementProperties")] = /* @__PURE__ */ new Map(), ie[Se("finalized")] = /* @__PURE__ */ new Map(), Nn == null || Nn({ ReactiveElement: ie }), (Tt.reactiveElementVersions ?? (Tt.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Oe = globalThis, Ui = (n) => n, xn = Oe.trustedTypes, qi = xn ? xn.createPolicy("lit-html", { createHTML: (n) => n }) : void 0, Sr = "$lit$", kt = `lit$${Math.random().toFixed(9).slice(2)}$`, Or = "?" + kt, Jo = `<${Or}>`, Qt = document, Re = () => Qt.createComment(""), He = (n) => n === null || typeof n != "object" && typeof n != "function", Mi = Array.isArray, ta = (n) => Mi(n) || typeof (n == null ? void 0 : n[Symbol.iterator]) == "function", Wn = `[ 	
\f\r]`, me = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Xi = /-->/g, Qi = />/g, zt = RegExp(`>|${Wn}(?:([^\\s"'>=/]+)(${Wn}*=${Wn}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Gi = /'/g, Ki = /"/g, Tr = /^(?:script|style|textarea|title)$/i, ea = (n) => (t, ...e) => ({ _$litType$: n, strings: t, values: e }), Q = ea(1), ae = Symbol.for("lit-noChange"), q = Symbol.for("lit-nothing"), Zi = /* @__PURE__ */ new WeakMap(), jt = Qt.createTreeWalker(Qt, 129);
function Cr(n, t) {
  if (!Mi(n) || !n.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return qi !== void 0 ? qi.createHTML(t) : t;
}
const na = (n, t) => {
  const e = n.length - 1, i = [];
  let s, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = me;
  for (let a = 0; a < e; a++) {
    const c = n[a];
    let l, h, u = -1, d = 0;
    for (; d < c.length && (o.lastIndex = d, h = o.exec(c), h !== null); ) d = o.lastIndex, o === me ? h[1] === "!--" ? o = Xi : h[1] !== void 0 ? o = Qi : h[2] !== void 0 ? (Tr.test(h[2]) && (s = RegExp("</" + h[2], "g")), o = zt) : h[3] !== void 0 && (o = zt) : o === zt ? h[0] === ">" ? (o = s ?? me, u = -1) : h[1] === void 0 ? u = -2 : (u = o.lastIndex - h[2].length, l = h[1], o = h[3] === void 0 ? zt : h[3] === '"' ? Ki : Gi) : o === Ki || o === Gi ? o = zt : o === Xi || o === Qi ? o = me : (o = zt, s = void 0);
    const f = o === zt && n[a + 1].startsWith("/>") ? " " : "";
    r += o === me ? c + Jo : u >= 0 ? (i.push(l), c.slice(0, u) + Sr + c.slice(u) + kt + f) : c + kt + (u === -2 ? a : f);
  }
  return [Cr(n, r + (n[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class Ne {
  constructor({ strings: t, _$litType$: e }, i) {
    let s;
    this.parts = [];
    let r = 0, o = 0;
    const a = t.length - 1, c = this.parts, [l, h] = na(t, e);
    if (this.el = Ne.createElement(l, i), jt.currentNode = this.el.content, e === 2 || e === 3) {
      const u = this.el.content.firstChild;
      u.replaceWith(...u.childNodes);
    }
    for (; (s = jt.nextNode()) !== null && c.length < a; ) {
      if (s.nodeType === 1) {
        if (s.hasAttributes()) for (const u of s.getAttributeNames()) if (u.endsWith(Sr)) {
          const d = h[o++], f = s.getAttribute(u).split(kt), g = /([.?@])?(.*)/.exec(d);
          c.push({ type: 1, index: r, name: g[2], strings: f, ctor: g[1] === "." ? sa : g[1] === "?" ? ra : g[1] === "@" ? oa : En }), s.removeAttribute(u);
        } else u.startsWith(kt) && (c.push({ type: 6, index: r }), s.removeAttribute(u));
        if (Tr.test(s.tagName)) {
          const u = s.textContent.split(kt), d = u.length - 1;
          if (d > 0) {
            s.textContent = xn ? xn.emptyScript : "";
            for (let f = 0; f < d; f++) s.append(u[f], Re()), jt.nextNode(), c.push({ type: 2, index: ++r });
            s.append(u[d], Re());
          }
        }
      } else if (s.nodeType === 8) if (s.data === Or) c.push({ type: 2, index: r });
      else {
        let u = -1;
        for (; (u = s.data.indexOf(kt, u + 1)) !== -1; ) c.push({ type: 7, index: r }), u += kt.length - 1;
      }
      r++;
    }
  }
  static createElement(t, e) {
    const i = Qt.createElement("template");
    return i.innerHTML = t, i;
  }
}
function ce(n, t, e = n, i) {
  var o, a;
  if (t === ae) return t;
  let s = i !== void 0 ? (o = e._$Co) == null ? void 0 : o[i] : e._$Cl;
  const r = He(t) ? void 0 : t._$litDirective$;
  return (s == null ? void 0 : s.constructor) !== r && ((a = s == null ? void 0 : s._$AO) == null || a.call(s, !1), r === void 0 ? s = void 0 : (s = new r(n), s._$AT(n, e, i)), i !== void 0 ? (e._$Co ?? (e._$Co = []))[i] = s : e._$Cl = s), s !== void 0 && (t = ce(n, s._$AS(n, t.values), s, i)), t;
}
class ia {
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
    const { el: { content: e }, parts: i } = this._$AD, s = ((t == null ? void 0 : t.creationScope) ?? Qt).importNode(e, !0);
    jt.currentNode = s;
    let r = jt.nextNode(), o = 0, a = 0, c = i[0];
    for (; c !== void 0; ) {
      if (o === c.index) {
        let l;
        c.type === 2 ? l = new qe(r, r.nextSibling, this, t) : c.type === 1 ? l = new c.ctor(r, c.name, c.strings, this, t) : c.type === 6 && (l = new aa(r, this, t)), this._$AV.push(l), c = i[++a];
      }
      o !== (c == null ? void 0 : c.index) && (r = jt.nextNode(), o++);
    }
    return jt.currentNode = Qt, s;
  }
  p(t) {
    let e = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, e), e += i.strings.length - 2) : i._$AI(t[e])), e++;
  }
}
class qe {
  get _$AU() {
    var t;
    return ((t = this._$AM) == null ? void 0 : t._$AU) ?? this._$Cv;
  }
  constructor(t, e, i, s) {
    this.type = 2, this._$AH = q, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = i, this.options = s, this._$Cv = (s == null ? void 0 : s.isConnected) ?? !0;
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
    t = ce(this, t, e), He(t) ? t === q || t == null || t === "" ? (this._$AH !== q && this._$AR(), this._$AH = q) : t !== this._$AH && t !== ae && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : ta(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== q && He(this._$AH) ? this._$AA.nextSibling.data = t : this.T(Qt.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    var r;
    const { values: e, _$litType$: i } = t, s = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = Ne.createElement(Cr(i.h, i.h[0]), this.options)), i);
    if (((r = this._$AH) == null ? void 0 : r._$AD) === s) this._$AH.p(e);
    else {
      const o = new ia(s, this), a = o.u(this.options);
      o.p(e), this.T(a), this._$AH = o;
    }
  }
  _$AC(t) {
    let e = Zi.get(t.strings);
    return e === void 0 && Zi.set(t.strings, e = new Ne(t)), e;
  }
  k(t) {
    Mi(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let i, s = 0;
    for (const r of t) s === e.length ? e.push(i = new qe(this.O(Re()), this.O(Re()), this, this.options)) : i = e[s], i._$AI(r), s++;
    s < e.length && (this._$AR(i && i._$AB.nextSibling, s), e.length = s);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    var i;
    for ((i = this._$AP) == null ? void 0 : i.call(this, !1, !0, e); t !== this._$AB; ) {
      const s = Ui(t).nextSibling;
      Ui(t).remove(), t = s;
    }
  }
  setConnected(t) {
    var e;
    this._$AM === void 0 && (this._$Cv = t, (e = this._$AP) == null || e.call(this, t));
  }
}
class En {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, i, s, r) {
    this.type = 1, this._$AH = q, this._$AN = void 0, this.element = t, this.name = e, this._$AM = s, this.options = r, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = q;
  }
  _$AI(t, e = this, i, s) {
    const r = this.strings;
    let o = !1;
    if (r === void 0) t = ce(this, t, e, 0), o = !He(t) || t !== this._$AH && t !== ae, o && (this._$AH = t);
    else {
      const a = t;
      let c, l;
      for (t = r[0], c = 0; c < r.length - 1; c++) l = ce(this, a[i + c], e, c), l === ae && (l = this._$AH[c]), o || (o = !He(l) || l !== this._$AH[c]), l === q ? t = q : t !== q && (t += (l ?? "") + r[c + 1]), this._$AH[c] = l;
    }
    o && !s && this.j(t);
  }
  j(t) {
    t === q ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class sa extends En {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === q ? void 0 : t;
  }
}
class ra extends En {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== q);
  }
}
class oa extends En {
  constructor(t, e, i, s, r) {
    super(t, e, i, s, r), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = ce(this, t, e, 0) ?? q) === ae) return;
    const i = this._$AH, s = t === q && i !== q || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, r = t !== q && (i === q || s);
    s && this.element.removeEventListener(this.name, this, i), r && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var e;
    typeof this._$AH == "function" ? this._$AH.call(((e = this.options) == null ? void 0 : e.host) ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class aa {
  constructor(t, e, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    ce(this, t);
  }
}
const Bn = Oe.litHtmlPolyfillSupport;
Bn == null || Bn(Ne, qe), (Oe.litHtmlVersions ?? (Oe.litHtmlVersions = [])).push("3.3.2");
const ca = (n, t, e) => {
  const i = (e == null ? void 0 : e.renderBefore) ?? t;
  let s = i._$litPart$;
  if (s === void 0) {
    const r = (e == null ? void 0 : e.renderBefore) ?? null;
    i._$litPart$ = s = new qe(t.insertBefore(Re(), r), r, void 0, e ?? {});
  }
  return s._$AI(n), s;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const qt = globalThis;
class Te extends ie {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = ca(e, this.renderRoot, this.renderOptions);
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
    return ae;
  }
}
var kr;
Te._$litElement$ = !0, Te.finalized = !0, (kr = qt.litElementHydrateSupport) == null || kr.call(qt, { LitElement: Te });
const Yn = qt.litElementPolyfillSupport;
Yn == null || Yn({ LitElement: Te });
(qt.litElementVersions ?? (qt.litElementVersions = [])).push("4.2.2");
const la = 5;
function ha(n, t, e) {
  const i = new Date(t.getTime()), s = n.period_offset ?? -1;
  let r, o, a, c;
  if (n.comparison_mode === "year_over_year") {
    const l = i.getFullYear();
    r = new Date(l, 0, 1, 0, 0, 0, 0), o = i;
    const h = l + s;
    a = new Date(h, 0, 1, 0, 0, 0, 0), c = new Date(h, 11, 31, 23, 59, 59, 999);
  } else {
    const l = i.getFullYear(), h = i.getMonth();
    r = new Date(l, h, 1, 0, 0, 0, 0), o = i;
    const u = l + s;
    a = new Date(u, h, 1, 0, 0, 0, 0), c = new Date(u, h + 1, 0, 23, 59, 59, 999);
  }
  return {
    current_start: r,
    current_end: o,
    reference_start: a,
    reference_end: c,
    aggregation: n.aggregation ?? "day",
    time_zone: e
  };
}
function Ji(n, t) {
  const e = {
    day: "day",
    week: "week",
    month: "month"
  };
  return {
    type: "recorder/statistics_during_period",
    start_time: n.current_start.toISOString(),
    end_time: n.current_end.toISOString(),
    statistic_ids: [t],
    period: e[n.aggregation]
  };
}
function ts(n, t, e) {
  const i = n.result ?? n, s = i.results ?? i;
  if (!s || typeof s != "object") return;
  let r = s[t];
  if (!r || r.length === 0) {
    const l = Object.keys(s);
    l.length === 1 && (r = s[l[0]]);
  }
  if (!r || r.length === 0) return;
  const { unit: o, timeSeries: a } = ua(r);
  return da(
    a,
    o,
    e
  );
}
function ua(n) {
  let t = "";
  const e = [];
  let i;
  for (const s of n) {
    let r;
    if (typeof s.sum == "number")
      if (i === void 0) {
        i = s.sum;
        continue;
      } else {
        const o = s.sum - i;
        if (i = s.sum, !Number.isFinite(o) || o <= 0)
          continue;
        r = o;
      }
    else typeof s.change == "number" ? r = s.change : typeof s.state == "number" && (r = s.state);
    if (!(r == null || !Number.isFinite(r))) {
      if (!t && s.unit_of_measurement)
        t = s.unit_of_measurement;
      else if (t && s.unit_of_measurement && s.unit_of_measurement !== t)
        return { unit: "", timeSeries: [] };
      e.push({
        timestamp: new Date(s.start).getTime(),
        value: r,
        rawValue: r
      });
    }
  }
  return { unit: t, timeSeries: e.sort((s, r) => s.timestamp - r.timestamp) };
}
function da(n, t, e) {
  let i = 0;
  const s = n.map((o) => {
    const a = o.rawValue ?? o.value;
    return i += a, { ...o, value: i };
  }), r = s.length > 0 ? s[s.length - 1].value : 0;
  return {
    points: s,
    unit: t,
    periodLabel: e,
    total: r
  };
}
function fa(n) {
  var o, a, c;
  const t = n.current.points, e = ((o = t[t.length - 1]) == null ? void 0 : o.value) ?? 0;
  let i;
  if (n.reference && n.reference.points.length >= t.length) {
    const l = n.reference.points;
    i = ((a = l[t.length - 1]) == null ? void 0 : a.value) ?? ((c = l[l.length - 1]) == null ? void 0 : c.value);
  }
  let s, r;
  return i != null && (s = e - i, i !== 0 && (r = s / i * 100)), {
    current_cumulative: e,
    reference_cumulative: i,
    difference: s,
    differencePercent: r,
    unit: n.current.unit
  };
}
function ga(n) {
  var g;
  const t = n.current.points, e = t.length, i = Math.max(0, e - 1);
  if (i < la)
    return {
      enabled: !1,
      unit: n.current.unit,
      confidence: "low"
    };
  const s = (g = n.reference) == null ? void 0 : g.points;
  if (!s || s.length < i + 1)
    return {
      enabled: !1,
      unit: n.current.unit,
      confidence: "low"
    };
  const r = (m, p, b) => m.slice(p, b).reduce((_, v) => _ + (v.rawValue ?? 0), 0), o = r(t, 0, i), a = r(s, 0, i);
  if (!Number.isFinite(a) || a <= 0)
    return {
      enabled: !1,
      unit: n.current.unit,
      confidence: "low"
    };
  const c = r(s, i, s.length), l = r(s, 0, s.length), h = o / a, u = Math.min(5, Math.max(0.2, h)), d = o + c * u;
  let f = "low";
  return i >= 14 ? f = "high" : i >= 7 && (f = "medium"), {
    enabled: !0,
    forecast_total: d,
    reference_total: l,
    unit: n.current.unit,
    confidence: f
  };
}
function ma(n) {
  const { reference_cumulative: t, difference: e, unit: i } = n;
  if (t == null || e == null)
    return {
      trend: "unknown",
      unit: i
    };
  const s = Math.abs(e);
  return s < 0.01 ? {
    trend: "similar",
    diffValue: s,
    unit: i
  } : e > 0 ? {
    trend: "higher",
    diffValue: s,
    unit: i
  } : {
    trend: "lower",
    diffValue: s,
    unit: i
  };
}
/*!
 * @kurkle/color v0.3.4
 * https://github.com/kurkle/color#readme
 * (c) 2024 Jukka Kurkela
 * Released under the MIT License
 */
function Xe(n) {
  return n + 0.5 | 0;
}
const Dt = (n, t, e) => Math.max(Math.min(n, e), t);
function ke(n) {
  return Dt(Xe(n * 2.55), 0, 255);
}
function Ct(n) {
  return Dt(Xe(n * 255), 0, 255);
}
function xt(n) {
  return Dt(Xe(n / 2.55) / 100, 0, 1);
}
function es(n) {
  return Dt(Xe(n * 100), 0, 100);
}
const rt = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, a: 10, b: 11, c: 12, d: 13, e: 14, f: 15 }, oi = [..."0123456789ABCDEF"], pa = (n) => oi[n & 15], ba = (n) => oi[(n & 240) >> 4] + oi[n & 15], Je = (n) => (n & 240) >> 4 === (n & 15), ya = (n) => Je(n.r) && Je(n.g) && Je(n.b) && Je(n.a);
function _a(n) {
  var t = n.length, e;
  return n[0] === "#" && (t === 4 || t === 5 ? e = {
    r: 255 & rt[n[1]] * 17,
    g: 255 & rt[n[2]] * 17,
    b: 255 & rt[n[3]] * 17,
    a: t === 5 ? rt[n[4]] * 17 : 255
  } : (t === 7 || t === 9) && (e = {
    r: rt[n[1]] << 4 | rt[n[2]],
    g: rt[n[3]] << 4 | rt[n[4]],
    b: rt[n[5]] << 4 | rt[n[6]],
    a: t === 9 ? rt[n[7]] << 4 | rt[n[8]] : 255
  })), e;
}
const xa = (n, t) => n < 255 ? t(n) : "";
function wa(n) {
  var t = ya(n) ? pa : ba;
  return n ? "#" + t(n.r) + t(n.g) + t(n.b) + xa(n.a, t) : void 0;
}
const va = /^(hsla?|hwb|hsv)\(\s*([-+.e\d]+)(?:deg)?[\s,]+([-+.e\d]+)%[\s,]+([-+.e\d]+)%(?:[\s,]+([-+.e\d]+)(%)?)?\s*\)$/;
function Ar(n, t, e) {
  const i = t * Math.min(e, 1 - e), s = (r, o = (r + n / 30) % 12) => e - i * Math.max(Math.min(o - 3, 9 - o, 1), -1);
  return [s(0), s(8), s(4)];
}
function Ma(n, t, e) {
  const i = (s, r = (s + n / 60) % 6) => e - e * t * Math.max(Math.min(r, 4 - r, 1), 0);
  return [i(5), i(3), i(1)];
}
function ka(n, t, e) {
  const i = Ar(n, 1, 0.5);
  let s;
  for (t + e > 1 && (s = 1 / (t + e), t *= s, e *= s), s = 0; s < 3; s++)
    i[s] *= 1 - t - e, i[s] += t;
  return i;
}
function Da(n, t, e, i, s) {
  return n === s ? (t - e) / i + (t < e ? 6 : 0) : t === s ? (e - n) / i + 2 : (n - t) / i + 4;
}
function ki(n) {
  const e = n.r / 255, i = n.g / 255, s = n.b / 255, r = Math.max(e, i, s), o = Math.min(e, i, s), a = (r + o) / 2;
  let c, l, h;
  return r !== o && (h = r - o, l = a > 0.5 ? h / (2 - r - o) : h / (r + o), c = Da(e, i, s, h, r), c = c * 60 + 0.5), [c | 0, l || 0, a];
}
function Di(n, t, e, i) {
  return (Array.isArray(t) ? n(t[0], t[1], t[2]) : n(t, e, i)).map(Ct);
}
function Pi(n, t, e) {
  return Di(Ar, n, t, e);
}
function Pa(n, t, e) {
  return Di(ka, n, t, e);
}
function Sa(n, t, e) {
  return Di(Ma, n, t, e);
}
function Er(n) {
  return (n % 360 + 360) % 360;
}
function Oa(n) {
  const t = va.exec(n);
  let e = 255, i;
  if (!t)
    return;
  t[5] !== i && (e = t[6] ? ke(+t[5]) : Ct(+t[5]));
  const s = Er(+t[2]), r = +t[3] / 100, o = +t[4] / 100;
  return t[1] === "hwb" ? i = Pa(s, r, o) : t[1] === "hsv" ? i = Sa(s, r, o) : i = Pi(s, r, o), {
    r: i[0],
    g: i[1],
    b: i[2],
    a: e
  };
}
function Ta(n, t) {
  var e = ki(n);
  e[0] = Er(e[0] + t), e = Pi(e), n.r = e[0], n.g = e[1], n.b = e[2];
}
function Ca(n) {
  if (!n)
    return;
  const t = ki(n), e = t[0], i = es(t[1]), s = es(t[2]);
  return n.a < 255 ? `hsla(${e}, ${i}%, ${s}%, ${xt(n.a)})` : `hsl(${e}, ${i}%, ${s}%)`;
}
const ns = {
  x: "dark",
  Z: "light",
  Y: "re",
  X: "blu",
  W: "gr",
  V: "medium",
  U: "slate",
  A: "ee",
  T: "ol",
  S: "or",
  B: "ra",
  C: "lateg",
  D: "ights",
  R: "in",
  Q: "turquois",
  E: "hi",
  P: "ro",
  O: "al",
  N: "le",
  M: "de",
  L: "yello",
  F: "en",
  K: "ch",
  G: "arks",
  H: "ea",
  I: "ightg",
  J: "wh"
}, is = {
  OiceXe: "f0f8ff",
  antiquewEte: "faebd7",
  aqua: "ffff",
  aquamarRe: "7fffd4",
  azuY: "f0ffff",
  beige: "f5f5dc",
  bisque: "ffe4c4",
  black: "0",
  blanKedOmond: "ffebcd",
  Xe: "ff",
  XeviTet: "8a2be2",
  bPwn: "a52a2a",
  burlywood: "deb887",
  caMtXe: "5f9ea0",
  KartYuse: "7fff00",
  KocTate: "d2691e",
  cSO: "ff7f50",
  cSnflowerXe: "6495ed",
  cSnsilk: "fff8dc",
  crimson: "dc143c",
  cyan: "ffff",
  xXe: "8b",
  xcyan: "8b8b",
  xgTMnPd: "b8860b",
  xWay: "a9a9a9",
  xgYF: "6400",
  xgYy: "a9a9a9",
  xkhaki: "bdb76b",
  xmagFta: "8b008b",
  xTivegYF: "556b2f",
  xSange: "ff8c00",
  xScEd: "9932cc",
  xYd: "8b0000",
  xsOmon: "e9967a",
  xsHgYF: "8fbc8f",
  xUXe: "483d8b",
  xUWay: "2f4f4f",
  xUgYy: "2f4f4f",
  xQe: "ced1",
  xviTet: "9400d3",
  dAppRk: "ff1493",
  dApskyXe: "bfff",
  dimWay: "696969",
  dimgYy: "696969",
  dodgerXe: "1e90ff",
  fiYbrick: "b22222",
  flSOwEte: "fffaf0",
  foYstWAn: "228b22",
  fuKsia: "ff00ff",
  gaRsbSo: "dcdcdc",
  ghostwEte: "f8f8ff",
  gTd: "ffd700",
  gTMnPd: "daa520",
  Way: "808080",
  gYF: "8000",
  gYFLw: "adff2f",
  gYy: "808080",
  honeyMw: "f0fff0",
  hotpRk: "ff69b4",
  RdianYd: "cd5c5c",
  Rdigo: "4b0082",
  ivSy: "fffff0",
  khaki: "f0e68c",
  lavFMr: "e6e6fa",
  lavFMrXsh: "fff0f5",
  lawngYF: "7cfc00",
  NmoncEffon: "fffacd",
  ZXe: "add8e6",
  ZcSO: "f08080",
  Zcyan: "e0ffff",
  ZgTMnPdLw: "fafad2",
  ZWay: "d3d3d3",
  ZgYF: "90ee90",
  ZgYy: "d3d3d3",
  ZpRk: "ffb6c1",
  ZsOmon: "ffa07a",
  ZsHgYF: "20b2aa",
  ZskyXe: "87cefa",
  ZUWay: "778899",
  ZUgYy: "778899",
  ZstAlXe: "b0c4de",
  ZLw: "ffffe0",
  lime: "ff00",
  limegYF: "32cd32",
  lRF: "faf0e6",
  magFta: "ff00ff",
  maPon: "800000",
  VaquamarRe: "66cdaa",
  VXe: "cd",
  VScEd: "ba55d3",
  VpurpN: "9370db",
  VsHgYF: "3cb371",
  VUXe: "7b68ee",
  VsprRggYF: "fa9a",
  VQe: "48d1cc",
  VviTetYd: "c71585",
  midnightXe: "191970",
  mRtcYam: "f5fffa",
  mistyPse: "ffe4e1",
  moccasR: "ffe4b5",
  navajowEte: "ffdead",
  navy: "80",
  Tdlace: "fdf5e6",
  Tive: "808000",
  TivedBb: "6b8e23",
  Sange: "ffa500",
  SangeYd: "ff4500",
  ScEd: "da70d6",
  pOegTMnPd: "eee8aa",
  pOegYF: "98fb98",
  pOeQe: "afeeee",
  pOeviTetYd: "db7093",
  papayawEp: "ffefd5",
  pHKpuff: "ffdab9",
  peru: "cd853f",
  pRk: "ffc0cb",
  plum: "dda0dd",
  powMrXe: "b0e0e6",
  purpN: "800080",
  YbeccapurpN: "663399",
  Yd: "ff0000",
  Psybrown: "bc8f8f",
  PyOXe: "4169e1",
  saddNbPwn: "8b4513",
  sOmon: "fa8072",
  sandybPwn: "f4a460",
  sHgYF: "2e8b57",
  sHshell: "fff5ee",
  siFna: "a0522d",
  silver: "c0c0c0",
  skyXe: "87ceeb",
  UXe: "6a5acd",
  UWay: "708090",
  UgYy: "708090",
  snow: "fffafa",
  sprRggYF: "ff7f",
  stAlXe: "4682b4",
  tan: "d2b48c",
  teO: "8080",
  tEstN: "d8bfd8",
  tomato: "ff6347",
  Qe: "40e0d0",
  viTet: "ee82ee",
  JHt: "f5deb3",
  wEte: "ffffff",
  wEtesmoke: "f5f5f5",
  Lw: "ffff00",
  LwgYF: "9acd32"
};
function Aa() {
  const n = {}, t = Object.keys(is), e = Object.keys(ns);
  let i, s, r, o, a;
  for (i = 0; i < t.length; i++) {
    for (o = a = t[i], s = 0; s < e.length; s++)
      r = e[s], a = a.replace(r, ns[r]);
    r = parseInt(is[o], 16), n[a] = [r >> 16 & 255, r >> 8 & 255, r & 255];
  }
  return n;
}
let tn;
function Ea(n) {
  tn || (tn = Aa(), tn.transparent = [0, 0, 0, 0]);
  const t = tn[n.toLowerCase()];
  return t && {
    r: t[0],
    g: t[1],
    b: t[2],
    a: t.length === 4 ? t[3] : 255
  };
}
const $a = /^rgba?\(\s*([-+.\d]+)(%)?[\s,]+([-+.e\d]+)(%)?[\s,]+([-+.e\d]+)(%)?(?:[\s,/]+([-+.e\d]+)(%)?)?\s*\)$/;
function Ia(n) {
  const t = $a.exec(n);
  let e = 255, i, s, r;
  if (t) {
    if (t[7] !== i) {
      const o = +t[7];
      e = t[8] ? ke(o) : Dt(o * 255, 0, 255);
    }
    return i = +t[1], s = +t[3], r = +t[5], i = 255 & (t[2] ? ke(i) : Dt(i, 0, 255)), s = 255 & (t[4] ? ke(s) : Dt(s, 0, 255)), r = 255 & (t[6] ? ke(r) : Dt(r, 0, 255)), {
      r: i,
      g: s,
      b: r,
      a: e
    };
  }
}
function La(n) {
  return n && (n.a < 255 ? `rgba(${n.r}, ${n.g}, ${n.b}, ${xt(n.a)})` : `rgb(${n.r}, ${n.g}, ${n.b})`);
}
const jn = (n) => n <= 31308e-7 ? n * 12.92 : Math.pow(n, 1 / 2.4) * 1.055 - 0.055, ee = (n) => n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
function Fa(n, t, e) {
  const i = ee(xt(n.r)), s = ee(xt(n.g)), r = ee(xt(n.b));
  return {
    r: Ct(jn(i + e * (ee(xt(t.r)) - i))),
    g: Ct(jn(s + e * (ee(xt(t.g)) - s))),
    b: Ct(jn(r + e * (ee(xt(t.b)) - r))),
    a: n.a + e * (t.a - n.a)
  };
}
function en(n, t, e) {
  if (n) {
    let i = ki(n);
    i[t] = Math.max(0, Math.min(i[t] + i[t] * e, t === 0 ? 360 : 1)), i = Pi(i), n.r = i[0], n.g = i[1], n.b = i[2];
  }
}
function $r(n, t) {
  return n && Object.assign(t || {}, n);
}
function ss(n) {
  var t = { r: 0, g: 0, b: 0, a: 255 };
  return Array.isArray(n) ? n.length >= 3 && (t = { r: n[0], g: n[1], b: n[2], a: 255 }, n.length > 3 && (t.a = Ct(n[3]))) : (t = $r(n, { r: 0, g: 0, b: 0, a: 1 }), t.a = Ct(t.a)), t;
}
function za(n) {
  return n.charAt(0) === "r" ? Ia(n) : Oa(n);
}
class We {
  constructor(t) {
    if (t instanceof We)
      return t;
    const e = typeof t;
    let i;
    e === "object" ? i = ss(t) : e === "string" && (i = _a(t) || Ea(t) || za(t)), this._rgb = i, this._valid = !!i;
  }
  get valid() {
    return this._valid;
  }
  get rgb() {
    var t = $r(this._rgb);
    return t && (t.a = xt(t.a)), t;
  }
  set rgb(t) {
    this._rgb = ss(t);
  }
  rgbString() {
    return this._valid ? La(this._rgb) : void 0;
  }
  hexString() {
    return this._valid ? wa(this._rgb) : void 0;
  }
  hslString() {
    return this._valid ? Ca(this._rgb) : void 0;
  }
  mix(t, e) {
    if (t) {
      const i = this.rgb, s = t.rgb;
      let r;
      const o = e === r ? 0.5 : e, a = 2 * o - 1, c = i.a - s.a, l = ((a * c === -1 ? a : (a + c) / (1 + a * c)) + 1) / 2;
      r = 1 - l, i.r = 255 & l * i.r + r * s.r + 0.5, i.g = 255 & l * i.g + r * s.g + 0.5, i.b = 255 & l * i.b + r * s.b + 0.5, i.a = o * i.a + (1 - o) * s.a, this.rgb = i;
    }
    return this;
  }
  interpolate(t, e) {
    return t && (this._rgb = Fa(this._rgb, t._rgb, e)), this;
  }
  clone() {
    return new We(this.rgb);
  }
  alpha(t) {
    return this._rgb.a = Ct(t), this;
  }
  clearer(t) {
    const e = this._rgb;
    return e.a *= 1 - t, this;
  }
  greyscale() {
    const t = this._rgb, e = Xe(t.r * 0.3 + t.g * 0.59 + t.b * 0.11);
    return t.r = t.g = t.b = e, this;
  }
  opaquer(t) {
    const e = this._rgb;
    return e.a *= 1 + t, this;
  }
  negate() {
    const t = this._rgb;
    return t.r = 255 - t.r, t.g = 255 - t.g, t.b = 255 - t.b, this;
  }
  lighten(t) {
    return en(this._rgb, 2, t), this;
  }
  darken(t) {
    return en(this._rgb, 2, -t), this;
  }
  saturate(t) {
    return en(this._rgb, 1, t), this;
  }
  desaturate(t) {
    return en(this._rgb, 1, -t), this;
  }
  rotate(t) {
    return Ta(this._rgb, t), this;
  }
}
/*!
 * Chart.js v4.5.1
 * https://www.chartjs.org
 * (c) 2025 Chart.js Contributors
 * Released under the MIT License
 */
function bt() {
}
const Ra = /* @__PURE__ */ (() => {
  let n = 0;
  return () => n++;
})();
function z(n) {
  return n == null;
}
function X(n) {
  if (Array.isArray && Array.isArray(n))
    return !0;
  const t = Object.prototype.toString.call(n);
  return t.slice(0, 7) === "[object" && t.slice(-6) === "Array]";
}
function E(n) {
  return n !== null && Object.prototype.toString.call(n) === "[object Object]";
}
function J(n) {
  return (typeof n == "number" || n instanceof Number) && isFinite(+n);
}
function ht(n, t) {
  return J(n) ? n : t;
}
function A(n, t) {
  return typeof n > "u" ? t : n;
}
const Ha = (n, t) => typeof n == "string" && n.endsWith("%") ? parseFloat(n) / 100 * t : +n;
function F(n, t, e) {
  if (n && typeof n.call == "function")
    return n.apply(e, t);
}
function L(n, t, e, i) {
  let s, r, o;
  if (X(n))
    for (r = n.length, s = 0; s < r; s++)
      t.call(e, n[s], s);
  else if (E(n))
    for (o = Object.keys(n), r = o.length, s = 0; s < r; s++)
      t.call(e, n[o[s]], o[s]);
}
function wn(n, t) {
  let e, i, s, r;
  if (!n || !t || n.length !== t.length)
    return !1;
  for (e = 0, i = n.length; e < i; ++e)
    if (s = n[e], r = t[e], s.datasetIndex !== r.datasetIndex || s.index !== r.index)
      return !1;
  return !0;
}
function vn(n) {
  if (X(n))
    return n.map(vn);
  if (E(n)) {
    const t = /* @__PURE__ */ Object.create(null), e = Object.keys(n), i = e.length;
    let s = 0;
    for (; s < i; ++s)
      t[e[s]] = vn(n[e[s]]);
    return t;
  }
  return n;
}
function Ir(n) {
  return [
    "__proto__",
    "prototype",
    "constructor"
  ].indexOf(n) === -1;
}
function Na(n, t, e, i) {
  if (!Ir(n))
    return;
  const s = t[n], r = e[n];
  E(s) && E(r) ? Be(s, r, i) : t[n] = vn(r);
}
function Be(n, t, e) {
  const i = X(t) ? t : [
    t
  ], s = i.length;
  if (!E(n))
    return n;
  e = e || {};
  const r = e.merger || Na;
  let o;
  for (let a = 0; a < s; ++a) {
    if (o = i[a], !E(o))
      continue;
    const c = Object.keys(o);
    for (let l = 0, h = c.length; l < h; ++l)
      r(c[l], n, o, e);
  }
  return n;
}
function Ce(n, t) {
  return Be(n, t, {
    merger: Wa
  });
}
function Wa(n, t, e) {
  if (!Ir(n))
    return;
  const i = t[n], s = e[n];
  E(i) && E(s) ? Ce(i, s) : Object.prototype.hasOwnProperty.call(t, n) || (t[n] = vn(s));
}
const rs = {
  // Chart.helpers.core resolveObjectKey should resolve empty key to root object
  "": (n) => n,
  // default resolvers
  x: (n) => n.x,
  y: (n) => n.y
};
function Ba(n) {
  const t = n.split("."), e = [];
  let i = "";
  for (const s of t)
    i += s, i.endsWith("\\") ? i = i.slice(0, -1) + "." : (e.push(i), i = "");
  return e;
}
function Ya(n) {
  const t = Ba(n);
  return (e) => {
    for (const i of t) {
      if (i === "")
        break;
      e = e && e[i];
    }
    return e;
  };
}
function Mn(n, t) {
  return (rs[t] || (rs[t] = Ya(t)))(n);
}
function Si(n) {
  return n.charAt(0).toUpperCase() + n.slice(1);
}
const kn = (n) => typeof n < "u", At = (n) => typeof n == "function", os = (n, t) => {
  if (n.size !== t.size)
    return !1;
  for (const e of n)
    if (!t.has(e))
      return !1;
  return !0;
};
function ja(n) {
  return n.type === "mouseup" || n.type === "click" || n.type === "contextmenu";
}
const Z = Math.PI, ct = 2 * Z, Va = ct + Z, Dn = Number.POSITIVE_INFINITY, Ua = Z / 180, ot = Z / 2, Rt = Z / 4, as = Z * 2 / 3, Lr = Math.log10, le = Math.sign;
function Ae(n, t, e) {
  return Math.abs(n - t) < e;
}
function cs(n) {
  const t = Math.round(n);
  n = Ae(n, t, n / 1e3) ? t : n;
  const e = Math.pow(10, Math.floor(Lr(n))), i = n / e;
  return (i <= 1 ? 1 : i <= 2 ? 2 : i <= 5 ? 5 : 10) * e;
}
function qa(n) {
  const t = [], e = Math.sqrt(n);
  let i;
  for (i = 1; i < e; i++)
    n % i === 0 && (t.push(i), t.push(n / i));
  return e === (e | 0) && t.push(e), t.sort((s, r) => s - r).pop(), t;
}
function Xa(n) {
  return typeof n == "symbol" || typeof n == "object" && n !== null && !(Symbol.toPrimitive in n || "toString" in n || "valueOf" in n);
}
function Ye(n) {
  return !Xa(n) && !isNaN(parseFloat(n)) && isFinite(n);
}
function Qa(n, t) {
  const e = Math.round(n);
  return e - t <= n && e + t >= n;
}
function Ga(n, t, e) {
  let i, s, r;
  for (i = 0, s = n.length; i < s; i++)
    r = n[i][e], isNaN(r) || (t.min = Math.min(t.min, r), t.max = Math.max(t.max, r));
}
function Vt(n) {
  return n * (Z / 180);
}
function Ka(n) {
  return n * (180 / Z);
}
function ls(n) {
  if (!J(n))
    return;
  let t = 1, e = 0;
  for (; Math.round(n * t) / t !== n; )
    t *= 10, e++;
  return e;
}
function Za(n, t) {
  const e = t.x - n.x, i = t.y - n.y, s = Math.sqrt(e * e + i * i);
  let r = Math.atan2(i, e);
  return r < -0.5 * Z && (r += ct), {
    angle: r,
    distance: s
  };
}
function ai(n, t) {
  return Math.sqrt(Math.pow(t.x - n.x, 2) + Math.pow(t.y - n.y, 2));
}
function Ja(n, t) {
  return (n - t + Va) % ct - Z;
}
function ft(n) {
  return (n % ct + ct) % ct;
}
function Fr(n, t, e, i) {
  const s = ft(n), r = ft(t), o = ft(e), a = ft(r - s), c = ft(o - s), l = ft(s - r), h = ft(s - o);
  return s === r || s === o || i && r === o || a > c && l < h;
}
function at(n, t, e) {
  return Math.max(t, Math.min(e, n));
}
function tc(n) {
  return at(n, -32768, 32767);
}
function se(n, t, e, i = 1e-6) {
  return n >= Math.min(t, e) - i && n <= Math.max(t, e) + i;
}
function Oi(n, t, e) {
  e = e || ((o) => n[o] < t);
  let i = n.length - 1, s = 0, r;
  for (; i - s > 1; )
    r = s + i >> 1, e(r) ? s = r : i = r;
  return {
    lo: s,
    hi: i
  };
}
const Ut = (n, t, e, i) => Oi(n, e, i ? (s) => {
  const r = n[s][t];
  return r < e || r === e && n[s + 1][t] === e;
} : (s) => n[s][t] < e), ec = (n, t, e) => Oi(n, e, (i) => n[i][t] >= e);
function nc(n, t, e) {
  let i = 0, s = n.length;
  for (; i < s && n[i] < t; )
    i++;
  for (; s > i && n[s - 1] > e; )
    s--;
  return i > 0 || s < n.length ? n.slice(i, s) : n;
}
const zr = [
  "push",
  "pop",
  "shift",
  "splice",
  "unshift"
];
function ic(n, t) {
  if (n._chartjs) {
    n._chartjs.listeners.push(t);
    return;
  }
  Object.defineProperty(n, "_chartjs", {
    configurable: !0,
    enumerable: !1,
    value: {
      listeners: [
        t
      ]
    }
  }), zr.forEach((e) => {
    const i = "_onData" + Si(e), s = n[e];
    Object.defineProperty(n, e, {
      configurable: !0,
      enumerable: !1,
      value(...r) {
        const o = s.apply(this, r);
        return n._chartjs.listeners.forEach((a) => {
          typeof a[i] == "function" && a[i](...r);
        }), o;
      }
    });
  });
}
function hs(n, t) {
  const e = n._chartjs;
  if (!e)
    return;
  const i = e.listeners, s = i.indexOf(t);
  s !== -1 && i.splice(s, 1), !(i.length > 0) && (zr.forEach((r) => {
    delete n[r];
  }), delete n._chartjs);
}
function sc(n) {
  const t = new Set(n);
  return t.size === n.length ? n : Array.from(t);
}
const Rr = (function() {
  return typeof window > "u" ? function(n) {
    return n();
  } : window.requestAnimationFrame;
})();
function Hr(n, t) {
  let e = [], i = !1;
  return function(...s) {
    e = s, i || (i = !0, Rr.call(window, () => {
      i = !1, n.apply(t, e);
    }));
  };
}
function rc(n, t) {
  let e;
  return function(...i) {
    return t ? (clearTimeout(e), e = setTimeout(n, t, i)) : n.apply(this, i), t;
  };
}
const Nr = (n) => n === "start" ? "left" : n === "end" ? "right" : "center", st = (n, t, e) => n === "start" ? t : n === "end" ? e : (t + e) / 2, oc = (n, t, e, i) => n === (i ? "left" : "right") ? e : n === "center" ? (t + e) / 2 : t;
function ac(n, t, e) {
  const i = t.length;
  let s = 0, r = i;
  if (n._sorted) {
    const { iScale: o, vScale: a, _parsed: c } = n, l = n.dataset && n.dataset.options ? n.dataset.options.spanGaps : null, h = o.axis, { min: u, max: d, minDefined: f, maxDefined: g } = o.getUserBounds();
    if (f) {
      if (s = Math.min(
        // @ts-expect-error Need to type _parsed
        Ut(c, h, u).lo,
        // @ts-expect-error Need to fix types on _lookupByKey
        e ? i : Ut(t, h, o.getPixelForValue(u)).lo
      ), l) {
        const m = c.slice(0, s + 1).reverse().findIndex((p) => !z(p[a.axis]));
        s -= Math.max(0, m);
      }
      s = at(s, 0, i - 1);
    }
    if (g) {
      let m = Math.max(
        // @ts-expect-error Need to type _parsed
        Ut(c, o.axis, d, !0).hi + 1,
        // @ts-expect-error Need to fix types on _lookupByKey
        e ? 0 : Ut(t, h, o.getPixelForValue(d), !0).hi + 1
      );
      if (l) {
        const p = c.slice(m - 1).findIndex((b) => !z(b[a.axis]));
        m += Math.max(0, p);
      }
      r = at(m, s, i) - s;
    } else
      r = i - s;
  }
  return {
    start: s,
    count: r
  };
}
function cc(n) {
  const { xScale: t, yScale: e, _scaleRanges: i } = n, s = {
    xmin: t.min,
    xmax: t.max,
    ymin: e.min,
    ymax: e.max
  };
  if (!i)
    return n._scaleRanges = s, !0;
  const r = i.xmin !== t.min || i.xmax !== t.max || i.ymin !== e.min || i.ymax !== e.max;
  return Object.assign(i, s), r;
}
const nn = (n) => n === 0 || n === 1, us = (n, t, e) => -(Math.pow(2, 10 * (n -= 1)) * Math.sin((n - t) * ct / e)), ds = (n, t, e) => Math.pow(2, -10 * n) * Math.sin((n - t) * ct / e) + 1, Ee = {
  linear: (n) => n,
  easeInQuad: (n) => n * n,
  easeOutQuad: (n) => -n * (n - 2),
  easeInOutQuad: (n) => (n /= 0.5) < 1 ? 0.5 * n * n : -0.5 * (--n * (n - 2) - 1),
  easeInCubic: (n) => n * n * n,
  easeOutCubic: (n) => (n -= 1) * n * n + 1,
  easeInOutCubic: (n) => (n /= 0.5) < 1 ? 0.5 * n * n * n : 0.5 * ((n -= 2) * n * n + 2),
  easeInQuart: (n) => n * n * n * n,
  easeOutQuart: (n) => -((n -= 1) * n * n * n - 1),
  easeInOutQuart: (n) => (n /= 0.5) < 1 ? 0.5 * n * n * n * n : -0.5 * ((n -= 2) * n * n * n - 2),
  easeInQuint: (n) => n * n * n * n * n,
  easeOutQuint: (n) => (n -= 1) * n * n * n * n + 1,
  easeInOutQuint: (n) => (n /= 0.5) < 1 ? 0.5 * n * n * n * n * n : 0.5 * ((n -= 2) * n * n * n * n + 2),
  easeInSine: (n) => -Math.cos(n * ot) + 1,
  easeOutSine: (n) => Math.sin(n * ot),
  easeInOutSine: (n) => -0.5 * (Math.cos(Z * n) - 1),
  easeInExpo: (n) => n === 0 ? 0 : Math.pow(2, 10 * (n - 1)),
  easeOutExpo: (n) => n === 1 ? 1 : -Math.pow(2, -10 * n) + 1,
  easeInOutExpo: (n) => nn(n) ? n : n < 0.5 ? 0.5 * Math.pow(2, 10 * (n * 2 - 1)) : 0.5 * (-Math.pow(2, -10 * (n * 2 - 1)) + 2),
  easeInCirc: (n) => n >= 1 ? n : -(Math.sqrt(1 - n * n) - 1),
  easeOutCirc: (n) => Math.sqrt(1 - (n -= 1) * n),
  easeInOutCirc: (n) => (n /= 0.5) < 1 ? -0.5 * (Math.sqrt(1 - n * n) - 1) : 0.5 * (Math.sqrt(1 - (n -= 2) * n) + 1),
  easeInElastic: (n) => nn(n) ? n : us(n, 0.075, 0.3),
  easeOutElastic: (n) => nn(n) ? n : ds(n, 0.075, 0.3),
  easeInOutElastic(n) {
    return nn(n) ? n : n < 0.5 ? 0.5 * us(n * 2, 0.1125, 0.45) : 0.5 + 0.5 * ds(n * 2 - 1, 0.1125, 0.45);
  },
  easeInBack(n) {
    return n * n * ((1.70158 + 1) * n - 1.70158);
  },
  easeOutBack(n) {
    return (n -= 1) * n * ((1.70158 + 1) * n + 1.70158) + 1;
  },
  easeInOutBack(n) {
    let t = 1.70158;
    return (n /= 0.5) < 1 ? 0.5 * (n * n * (((t *= 1.525) + 1) * n - t)) : 0.5 * ((n -= 2) * n * (((t *= 1.525) + 1) * n + t) + 2);
  },
  easeInBounce: (n) => 1 - Ee.easeOutBounce(1 - n),
  easeOutBounce(n) {
    return n < 1 / 2.75 ? 7.5625 * n * n : n < 2 / 2.75 ? 7.5625 * (n -= 1.5 / 2.75) * n + 0.75 : n < 2.5 / 2.75 ? 7.5625 * (n -= 2.25 / 2.75) * n + 0.9375 : 7.5625 * (n -= 2.625 / 2.75) * n + 0.984375;
  },
  easeInOutBounce: (n) => n < 0.5 ? Ee.easeInBounce(n * 2) * 0.5 : Ee.easeOutBounce(n * 2 - 1) * 0.5 + 0.5
};
function Ti(n) {
  if (n && typeof n == "object") {
    const t = n.toString();
    return t === "[object CanvasPattern]" || t === "[object CanvasGradient]";
  }
  return !1;
}
function fs(n) {
  return Ti(n) ? n : new We(n);
}
function Vn(n) {
  return Ti(n) ? n : new We(n).saturate(0.5).darken(0.1).hexString();
}
const lc = [
  "x",
  "y",
  "borderWidth",
  "radius",
  "tension"
], hc = [
  "color",
  "borderColor",
  "backgroundColor"
];
function uc(n) {
  n.set("animation", {
    delay: void 0,
    duration: 1e3,
    easing: "easeOutQuart",
    fn: void 0,
    from: void 0,
    loop: void 0,
    to: void 0,
    type: void 0
  }), n.describe("animation", {
    _fallback: !1,
    _indexable: !1,
    _scriptable: (t) => t !== "onProgress" && t !== "onComplete" && t !== "fn"
  }), n.set("animations", {
    colors: {
      type: "color",
      properties: hc
    },
    numbers: {
      type: "number",
      properties: lc
    }
  }), n.describe("animations", {
    _fallback: "animation"
  }), n.set("transitions", {
    active: {
      animation: {
        duration: 400
      }
    },
    resize: {
      animation: {
        duration: 0
      }
    },
    show: {
      animations: {
        colors: {
          from: "transparent"
        },
        visible: {
          type: "boolean",
          duration: 0
        }
      }
    },
    hide: {
      animations: {
        colors: {
          to: "transparent"
        },
        visible: {
          type: "boolean",
          easing: "linear",
          fn: (t) => t | 0
        }
      }
    }
  });
}
function dc(n) {
  n.set("layout", {
    autoPadding: !0,
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  });
}
const gs = /* @__PURE__ */ new Map();
function fc(n, t) {
  t = t || {};
  const e = n + JSON.stringify(t);
  let i = gs.get(e);
  return i || (i = new Intl.NumberFormat(n, t), gs.set(e, i)), i;
}
function Wr(n, t, e) {
  return fc(t, e).format(n);
}
const gc = {
  values(n) {
    return X(n) ? n : "" + n;
  },
  numeric(n, t, e) {
    if (n === 0)
      return "0";
    const i = this.chart.options.locale;
    let s, r = n;
    if (e.length > 1) {
      const l = Math.max(Math.abs(e[0].value), Math.abs(e[e.length - 1].value));
      (l < 1e-4 || l > 1e15) && (s = "scientific"), r = mc(n, e);
    }
    const o = Lr(Math.abs(r)), a = isNaN(o) ? 1 : Math.max(Math.min(-1 * Math.floor(o), 20), 0), c = {
      notation: s,
      minimumFractionDigits: a,
      maximumFractionDigits: a
    };
    return Object.assign(c, this.options.ticks.format), Wr(n, i, c);
  }
};
function mc(n, t) {
  let e = t.length > 3 ? t[2].value - t[1].value : t[1].value - t[0].value;
  return Math.abs(e) >= 1 && n !== Math.floor(n) && (e = n - Math.floor(n)), e;
}
var Br = {
  formatters: gc
};
function pc(n) {
  n.set("scale", {
    display: !0,
    offset: !1,
    reverse: !1,
    beginAtZero: !1,
    bounds: "ticks",
    clip: !0,
    grace: 0,
    grid: {
      display: !0,
      lineWidth: 1,
      drawOnChartArea: !0,
      drawTicks: !0,
      tickLength: 8,
      tickWidth: (t, e) => e.lineWidth,
      tickColor: (t, e) => e.color,
      offset: !1
    },
    border: {
      display: !0,
      dash: [],
      dashOffset: 0,
      width: 1
    },
    title: {
      display: !1,
      text: "",
      padding: {
        top: 4,
        bottom: 4
      }
    },
    ticks: {
      minRotation: 0,
      maxRotation: 50,
      mirror: !1,
      textStrokeWidth: 0,
      textStrokeColor: "",
      padding: 3,
      display: !0,
      autoSkip: !0,
      autoSkipPadding: 3,
      labelOffset: 0,
      callback: Br.formatters.values,
      minor: {},
      major: {},
      align: "center",
      crossAlign: "near",
      showLabelBackdrop: !1,
      backdropColor: "rgba(255, 255, 255, 0.75)",
      backdropPadding: 2
    }
  }), n.route("scale.ticks", "color", "", "color"), n.route("scale.grid", "color", "", "borderColor"), n.route("scale.border", "color", "", "borderColor"), n.route("scale.title", "color", "", "color"), n.describe("scale", {
    _fallback: !1,
    _scriptable: (t) => !t.startsWith("before") && !t.startsWith("after") && t !== "callback" && t !== "parser",
    _indexable: (t) => t !== "borderDash" && t !== "tickBorderDash" && t !== "dash"
  }), n.describe("scales", {
    _fallback: "scale"
  }), n.describe("scale.ticks", {
    _scriptable: (t) => t !== "backdropPadding" && t !== "callback",
    _indexable: (t) => t !== "backdropPadding"
  });
}
const Gt = /* @__PURE__ */ Object.create(null), ci = /* @__PURE__ */ Object.create(null);
function $e(n, t) {
  if (!t)
    return n;
  const e = t.split(".");
  for (let i = 0, s = e.length; i < s; ++i) {
    const r = e[i];
    n = n[r] || (n[r] = /* @__PURE__ */ Object.create(null));
  }
  return n;
}
function Un(n, t, e) {
  return typeof t == "string" ? Be($e(n, t), e) : Be($e(n, ""), t);
}
class bc {
  constructor(t, e) {
    this.animation = void 0, this.backgroundColor = "rgba(0,0,0,0.1)", this.borderColor = "rgba(0,0,0,0.1)", this.color = "#666", this.datasets = {}, this.devicePixelRatio = (i) => i.chart.platform.getDevicePixelRatio(), this.elements = {}, this.events = [
      "mousemove",
      "mouseout",
      "click",
      "touchstart",
      "touchmove"
    ], this.font = {
      family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
      size: 12,
      style: "normal",
      lineHeight: 1.2,
      weight: null
    }, this.hover = {}, this.hoverBackgroundColor = (i, s) => Vn(s.backgroundColor), this.hoverBorderColor = (i, s) => Vn(s.borderColor), this.hoverColor = (i, s) => Vn(s.color), this.indexAxis = "x", this.interaction = {
      mode: "nearest",
      intersect: !0,
      includeInvisible: !1
    }, this.maintainAspectRatio = !0, this.onHover = null, this.onClick = null, this.parsing = !0, this.plugins = {}, this.responsive = !0, this.scale = void 0, this.scales = {}, this.showLine = !0, this.drawActiveElementsOnTop = !0, this.describe(t), this.apply(e);
  }
  set(t, e) {
    return Un(this, t, e);
  }
  get(t) {
    return $e(this, t);
  }
  describe(t, e) {
    return Un(ci, t, e);
  }
  override(t, e) {
    return Un(Gt, t, e);
  }
  route(t, e, i, s) {
    const r = $e(this, t), o = $e(this, i), a = "_" + e;
    Object.defineProperties(r, {
      [a]: {
        value: r[e],
        writable: !0
      },
      [e]: {
        enumerable: !0,
        get() {
          const c = this[a], l = o[s];
          return E(c) ? Object.assign({}, l, c) : A(c, l);
        },
        set(c) {
          this[a] = c;
        }
      }
    });
  }
  apply(t) {
    t.forEach((e) => e(this));
  }
}
var B = /* @__PURE__ */ new bc({
  _scriptable: (n) => !n.startsWith("on"),
  _indexable: (n) => n !== "events",
  hover: {
    _fallback: "interaction"
  },
  interaction: {
    _scriptable: !1,
    _indexable: !1
  }
}, [
  uc,
  dc,
  pc
]);
function yc(n) {
  return !n || z(n.size) || z(n.family) ? null : (n.style ? n.style + " " : "") + (n.weight ? n.weight + " " : "") + n.size + "px " + n.family;
}
function ms(n, t, e, i, s) {
  let r = t[s];
  return r || (r = t[s] = n.measureText(s).width, e.push(s)), r > i && (i = r), i;
}
function Ht(n, t, e) {
  const i = n.currentDevicePixelRatio, s = e !== 0 ? Math.max(e / 2, 0.5) : 0;
  return Math.round((t - s) * i) / i + s;
}
function ps(n, t) {
  !t && !n || (t = t || n.getContext("2d"), t.save(), t.resetTransform(), t.clearRect(0, 0, n.width, n.height), t.restore());
}
function li(n, t, e, i) {
  Yr(n, t, e, i, null);
}
function Yr(n, t, e, i, s) {
  let r, o, a, c, l, h, u, d;
  const f = t.pointStyle, g = t.rotation, m = t.radius;
  let p = (g || 0) * Ua;
  if (f && typeof f == "object" && (r = f.toString(), r === "[object HTMLImageElement]" || r === "[object HTMLCanvasElement]")) {
    n.save(), n.translate(e, i), n.rotate(p), n.drawImage(f, -f.width / 2, -f.height / 2, f.width, f.height), n.restore();
    return;
  }
  if (!(isNaN(m) || m <= 0)) {
    switch (n.beginPath(), f) {
      // Default includes circle
      default:
        s ? n.ellipse(e, i, s / 2, m, 0, 0, ct) : n.arc(e, i, m, 0, ct), n.closePath();
        break;
      case "triangle":
        h = s ? s / 2 : m, n.moveTo(e + Math.sin(p) * h, i - Math.cos(p) * m), p += as, n.lineTo(e + Math.sin(p) * h, i - Math.cos(p) * m), p += as, n.lineTo(e + Math.sin(p) * h, i - Math.cos(p) * m), n.closePath();
        break;
      case "rectRounded":
        l = m * 0.516, c = m - l, o = Math.cos(p + Rt) * c, u = Math.cos(p + Rt) * (s ? s / 2 - l : c), a = Math.sin(p + Rt) * c, d = Math.sin(p + Rt) * (s ? s / 2 - l : c), n.arc(e - u, i - a, l, p - Z, p - ot), n.arc(e + d, i - o, l, p - ot, p), n.arc(e + u, i + a, l, p, p + ot), n.arc(e - d, i + o, l, p + ot, p + Z), n.closePath();
        break;
      case "rect":
        if (!g) {
          c = Math.SQRT1_2 * m, h = s ? s / 2 : c, n.rect(e - h, i - c, 2 * h, 2 * c);
          break;
        }
        p += Rt;
      /* falls through */
      case "rectRot":
        u = Math.cos(p) * (s ? s / 2 : m), o = Math.cos(p) * m, a = Math.sin(p) * m, d = Math.sin(p) * (s ? s / 2 : m), n.moveTo(e - u, i - a), n.lineTo(e + d, i - o), n.lineTo(e + u, i + a), n.lineTo(e - d, i + o), n.closePath();
        break;
      case "crossRot":
        p += Rt;
      /* falls through */
      case "cross":
        u = Math.cos(p) * (s ? s / 2 : m), o = Math.cos(p) * m, a = Math.sin(p) * m, d = Math.sin(p) * (s ? s / 2 : m), n.moveTo(e - u, i - a), n.lineTo(e + u, i + a), n.moveTo(e + d, i - o), n.lineTo(e - d, i + o);
        break;
      case "star":
        u = Math.cos(p) * (s ? s / 2 : m), o = Math.cos(p) * m, a = Math.sin(p) * m, d = Math.sin(p) * (s ? s / 2 : m), n.moveTo(e - u, i - a), n.lineTo(e + u, i + a), n.moveTo(e + d, i - o), n.lineTo(e - d, i + o), p += Rt, u = Math.cos(p) * (s ? s / 2 : m), o = Math.cos(p) * m, a = Math.sin(p) * m, d = Math.sin(p) * (s ? s / 2 : m), n.moveTo(e - u, i - a), n.lineTo(e + u, i + a), n.moveTo(e + d, i - o), n.lineTo(e - d, i + o);
        break;
      case "line":
        o = s ? s / 2 : Math.cos(p) * m, a = Math.sin(p) * m, n.moveTo(e - o, i - a), n.lineTo(e + o, i + a);
        break;
      case "dash":
        n.moveTo(e, i), n.lineTo(e + Math.cos(p) * (s ? s / 2 : m), i + Math.sin(p) * m);
        break;
      case !1:
        n.closePath();
        break;
    }
    n.fill(), t.borderWidth > 0 && n.stroke();
  }
}
function je(n, t, e) {
  return e = e || 0.5, !t || n && n.x > t.left - e && n.x < t.right + e && n.y > t.top - e && n.y < t.bottom + e;
}
function $n(n, t) {
  n.save(), n.beginPath(), n.rect(t.left, t.top, t.right - t.left, t.bottom - t.top), n.clip();
}
function In(n) {
  n.restore();
}
function _c(n, t, e, i, s) {
  if (!t)
    return n.lineTo(e.x, e.y);
  if (s === "middle") {
    const r = (t.x + e.x) / 2;
    n.lineTo(r, t.y), n.lineTo(r, e.y);
  } else s === "after" != !!i ? n.lineTo(t.x, e.y) : n.lineTo(e.x, t.y);
  n.lineTo(e.x, e.y);
}
function xc(n, t, e, i) {
  if (!t)
    return n.lineTo(e.x, e.y);
  n.bezierCurveTo(i ? t.cp1x : t.cp2x, i ? t.cp1y : t.cp2y, i ? e.cp2x : e.cp1x, i ? e.cp2y : e.cp1y, e.x, e.y);
}
function wc(n, t) {
  t.translation && n.translate(t.translation[0], t.translation[1]), z(t.rotation) || n.rotate(t.rotation), t.color && (n.fillStyle = t.color), t.textAlign && (n.textAlign = t.textAlign), t.textBaseline && (n.textBaseline = t.textBaseline);
}
function vc(n, t, e, i, s) {
  if (s.strikethrough || s.underline) {
    const r = n.measureText(i), o = t - r.actualBoundingBoxLeft, a = t + r.actualBoundingBoxRight, c = e - r.actualBoundingBoxAscent, l = e + r.actualBoundingBoxDescent, h = s.strikethrough ? (c + l) / 2 : l;
    n.strokeStyle = n.fillStyle, n.beginPath(), n.lineWidth = s.decorationWidth || 2, n.moveTo(o, h), n.lineTo(a, h), n.stroke();
  }
}
function Mc(n, t) {
  const e = n.fillStyle;
  n.fillStyle = t.color, n.fillRect(t.left, t.top, t.width, t.height), n.fillStyle = e;
}
function Pn(n, t, e, i, s, r = {}) {
  const o = X(t) ? t : [
    t
  ], a = r.strokeWidth > 0 && r.strokeColor !== "";
  let c, l;
  for (n.save(), n.font = s.string, wc(n, r), c = 0; c < o.length; ++c)
    l = o[c], r.backdrop && Mc(n, r.backdrop), a && (r.strokeColor && (n.strokeStyle = r.strokeColor), z(r.strokeWidth) || (n.lineWidth = r.strokeWidth), n.strokeText(l, e, i, r.maxWidth)), n.fillText(l, e, i, r.maxWidth), vc(n, e, i, l, r), i += Number(s.lineHeight);
  n.restore();
}
function hi(n, t) {
  const { x: e, y: i, w: s, h: r, radius: o } = t;
  n.arc(e + o.topLeft, i + o.topLeft, o.topLeft, 1.5 * Z, Z, !0), n.lineTo(e, i + r - o.bottomLeft), n.arc(e + o.bottomLeft, i + r - o.bottomLeft, o.bottomLeft, Z, ot, !0), n.lineTo(e + s - o.bottomRight, i + r), n.arc(e + s - o.bottomRight, i + r - o.bottomRight, o.bottomRight, ot, 0, !0), n.lineTo(e + s, i + o.topRight), n.arc(e + s - o.topRight, i + o.topRight, o.topRight, 0, -ot, !0), n.lineTo(e + o.topLeft, i);
}
const kc = /^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/, Dc = /^(normal|italic|initial|inherit|unset|(oblique( -?[0-9]?[0-9]deg)?))$/;
function Pc(n, t) {
  const e = ("" + n).match(kc);
  if (!e || e[1] === "normal")
    return t * 1.2;
  switch (n = +e[2], e[3]) {
    case "px":
      return n;
    case "%":
      n /= 100;
      break;
  }
  return t * n;
}
const Sc = (n) => +n || 0;
function jr(n, t) {
  const e = {}, i = E(t), s = i ? Object.keys(t) : t, r = E(n) ? i ? (o) => A(n[o], n[t[o]]) : (o) => n[o] : () => n;
  for (const o of s)
    e[o] = Sc(r(o));
  return e;
}
function Oc(n) {
  return jr(n, {
    top: "y",
    right: "x",
    bottom: "y",
    left: "x"
  });
}
function Ie(n) {
  return jr(n, [
    "topLeft",
    "topRight",
    "bottomLeft",
    "bottomRight"
  ]);
}
function lt(n) {
  const t = Oc(n);
  return t.width = t.left + t.right, t.height = t.top + t.bottom, t;
}
function it(n, t) {
  n = n || {}, t = t || B.font;
  let e = A(n.size, t.size);
  typeof e == "string" && (e = parseInt(e, 10));
  let i = A(n.style, t.style);
  i && !("" + i).match(Dc) && (console.warn('Invalid font style specified: "' + i + '"'), i = void 0);
  const s = {
    family: A(n.family, t.family),
    lineHeight: Pc(A(n.lineHeight, t.lineHeight), e),
    size: e,
    style: i,
    weight: A(n.weight, t.weight),
    string: ""
  };
  return s.string = yc(s), s;
}
function sn(n, t, e, i) {
  let s, r, o;
  for (s = 0, r = n.length; s < r; ++s)
    if (o = n[s], o !== void 0 && o !== void 0)
      return o;
}
function Tc(n, t, e) {
  const { min: i, max: s } = n, r = Ha(t, (s - i) / 2), o = (a, c) => e && a === 0 ? 0 : a + c;
  return {
    min: o(i, -Math.abs(r)),
    max: o(s, r)
  };
}
function Kt(n, t) {
  return Object.assign(Object.create(n), t);
}
function Ci(n, t = [
  ""
], e, i, s = () => n[0]) {
  const r = e || n;
  typeof i > "u" && (i = Xr("_fallback", n));
  const o = {
    [Symbol.toStringTag]: "Object",
    _cacheable: !0,
    _scopes: n,
    _rootScopes: r,
    _fallback: i,
    _getTarget: s,
    override: (a) => Ci([
      a,
      ...n
    ], t, r, i)
  };
  return new Proxy(o, {
    /**
    * A trap for the delete operator.
    */
    deleteProperty(a, c) {
      return delete a[c], delete a._keys, delete n[0][c], !0;
    },
    /**
    * A trap for getting property values.
    */
    get(a, c) {
      return Ur(a, c, () => zc(c, t, n, a));
    },
    /**
    * A trap for Object.getOwnPropertyDescriptor.
    * Also used by Object.hasOwnProperty.
    */
    getOwnPropertyDescriptor(a, c) {
      return Reflect.getOwnPropertyDescriptor(a._scopes[0], c);
    },
    /**
    * A trap for Object.getPrototypeOf.
    */
    getPrototypeOf() {
      return Reflect.getPrototypeOf(n[0]);
    },
    /**
    * A trap for the in operator.
    */
    has(a, c) {
      return ys(a).includes(c);
    },
    /**
    * A trap for Object.getOwnPropertyNames and Object.getOwnPropertySymbols.
    */
    ownKeys(a) {
      return ys(a);
    },
    /**
    * A trap for setting property values.
    */
    set(a, c, l) {
      const h = a._storage || (a._storage = s());
      return a[c] = h[c] = l, delete a._keys, !0;
    }
  });
}
function he(n, t, e, i) {
  const s = {
    _cacheable: !1,
    _proxy: n,
    _context: t,
    _subProxy: e,
    _stack: /* @__PURE__ */ new Set(),
    _descriptors: Vr(n, i),
    setContext: (r) => he(n, r, e, i),
    override: (r) => he(n.override(r), t, e, i)
  };
  return new Proxy(s, {
    /**
    * A trap for the delete operator.
    */
    deleteProperty(r, o) {
      return delete r[o], delete n[o], !0;
    },
    /**
    * A trap for getting property values.
    */
    get(r, o, a) {
      return Ur(r, o, () => Ac(r, o, a));
    },
    /**
    * A trap for Object.getOwnPropertyDescriptor.
    * Also used by Object.hasOwnProperty.
    */
    getOwnPropertyDescriptor(r, o) {
      return r._descriptors.allKeys ? Reflect.has(n, o) ? {
        enumerable: !0,
        configurable: !0
      } : void 0 : Reflect.getOwnPropertyDescriptor(n, o);
    },
    /**
    * A trap for Object.getPrototypeOf.
    */
    getPrototypeOf() {
      return Reflect.getPrototypeOf(n);
    },
    /**
    * A trap for the in operator.
    */
    has(r, o) {
      return Reflect.has(n, o);
    },
    /**
    * A trap for Object.getOwnPropertyNames and Object.getOwnPropertySymbols.
    */
    ownKeys() {
      return Reflect.ownKeys(n);
    },
    /**
    * A trap for setting property values.
    */
    set(r, o, a) {
      return n[o] = a, delete r[o], !0;
    }
  });
}
function Vr(n, t = {
  scriptable: !0,
  indexable: !0
}) {
  const { _scriptable: e = t.scriptable, _indexable: i = t.indexable, _allKeys: s = t.allKeys } = n;
  return {
    allKeys: s,
    scriptable: e,
    indexable: i,
    isScriptable: At(e) ? e : () => e,
    isIndexable: At(i) ? i : () => i
  };
}
const Cc = (n, t) => n ? n + Si(t) : t, Ai = (n, t) => E(t) && n !== "adapters" && (Object.getPrototypeOf(t) === null || t.constructor === Object);
function Ur(n, t, e) {
  if (Object.prototype.hasOwnProperty.call(n, t) || t === "constructor")
    return n[t];
  const i = e();
  return n[t] = i, i;
}
function Ac(n, t, e) {
  const { _proxy: i, _context: s, _subProxy: r, _descriptors: o } = n;
  let a = i[t];
  return At(a) && o.isScriptable(t) && (a = Ec(t, a, n, e)), X(a) && a.length && (a = $c(t, a, n, o.isIndexable)), Ai(t, a) && (a = he(a, s, r && r[t], o)), a;
}
function Ec(n, t, e, i) {
  const { _proxy: s, _context: r, _subProxy: o, _stack: a } = e;
  if (a.has(n))
    throw new Error("Recursion detected: " + Array.from(a).join("->") + "->" + n);
  a.add(n);
  let c = t(r, o || i);
  return a.delete(n), Ai(n, c) && (c = Ei(s._scopes, s, n, c)), c;
}
function $c(n, t, e, i) {
  const { _proxy: s, _context: r, _subProxy: o, _descriptors: a } = e;
  if (typeof r.index < "u" && i(n))
    return t[r.index % t.length];
  if (E(t[0])) {
    const c = t, l = s._scopes.filter((h) => h !== c);
    t = [];
    for (const h of c) {
      const u = Ei(l, s, n, h);
      t.push(he(u, r, o && o[n], a));
    }
  }
  return t;
}
function qr(n, t, e) {
  return At(n) ? n(t, e) : n;
}
const Ic = (n, t) => n === !0 ? t : typeof n == "string" ? Mn(t, n) : void 0;
function Lc(n, t, e, i, s) {
  for (const r of t) {
    const o = Ic(e, r);
    if (o) {
      n.add(o);
      const a = qr(o._fallback, e, s);
      if (typeof a < "u" && a !== e && a !== i)
        return a;
    } else if (o === !1 && typeof i < "u" && e !== i)
      return null;
  }
  return !1;
}
function Ei(n, t, e, i) {
  const s = t._rootScopes, r = qr(t._fallback, e, i), o = [
    ...n,
    ...s
  ], a = /* @__PURE__ */ new Set();
  a.add(i);
  let c = bs(a, o, e, r || e, i);
  return c === null || typeof r < "u" && r !== e && (c = bs(a, o, r, c, i), c === null) ? !1 : Ci(Array.from(a), [
    ""
  ], s, r, () => Fc(t, e, i));
}
function bs(n, t, e, i, s) {
  for (; e; )
    e = Lc(n, t, e, i, s);
  return e;
}
function Fc(n, t, e) {
  const i = n._getTarget();
  t in i || (i[t] = {});
  const s = i[t];
  return X(s) && E(e) ? e : s || {};
}
function zc(n, t, e, i) {
  let s;
  for (const r of t)
    if (s = Xr(Cc(r, n), e), typeof s < "u")
      return Ai(n, s) ? Ei(e, i, n, s) : s;
}
function Xr(n, t) {
  for (const e of t) {
    if (!e)
      continue;
    const i = e[n];
    if (typeof i < "u")
      return i;
  }
}
function ys(n) {
  let t = n._keys;
  return t || (t = n._keys = Rc(n._scopes)), t;
}
function Rc(n) {
  const t = /* @__PURE__ */ new Set();
  for (const e of n)
    for (const i of Object.keys(e).filter((s) => !s.startsWith("_")))
      t.add(i);
  return Array.from(t);
}
const Hc = Number.EPSILON || 1e-14, ue = (n, t) => t < n.length && !n[t].skip && n[t], Qr = (n) => n === "x" ? "y" : "x";
function Nc(n, t, e, i) {
  const s = n.skip ? t : n, r = t, o = e.skip ? t : e, a = ai(r, s), c = ai(o, r);
  let l = a / (a + c), h = c / (a + c);
  l = isNaN(l) ? 0 : l, h = isNaN(h) ? 0 : h;
  const u = i * l, d = i * h;
  return {
    previous: {
      x: r.x - u * (o.x - s.x),
      y: r.y - u * (o.y - s.y)
    },
    next: {
      x: r.x + d * (o.x - s.x),
      y: r.y + d * (o.y - s.y)
    }
  };
}
function Wc(n, t, e) {
  const i = n.length;
  let s, r, o, a, c, l = ue(n, 0);
  for (let h = 0; h < i - 1; ++h)
    if (c = l, l = ue(n, h + 1), !(!c || !l)) {
      if (Ae(t[h], 0, Hc)) {
        e[h] = e[h + 1] = 0;
        continue;
      }
      s = e[h] / t[h], r = e[h + 1] / t[h], a = Math.pow(s, 2) + Math.pow(r, 2), !(a <= 9) && (o = 3 / Math.sqrt(a), e[h] = s * o * t[h], e[h + 1] = r * o * t[h]);
    }
}
function Bc(n, t, e = "x") {
  const i = Qr(e), s = n.length;
  let r, o, a, c = ue(n, 0);
  for (let l = 0; l < s; ++l) {
    if (o = a, a = c, c = ue(n, l + 1), !a)
      continue;
    const h = a[e], u = a[i];
    o && (r = (h - o[e]) / 3, a[`cp1${e}`] = h - r, a[`cp1${i}`] = u - r * t[l]), c && (r = (c[e] - h) / 3, a[`cp2${e}`] = h + r, a[`cp2${i}`] = u + r * t[l]);
  }
}
function Yc(n, t = "x") {
  const e = Qr(t), i = n.length, s = Array(i).fill(0), r = Array(i);
  let o, a, c, l = ue(n, 0);
  for (o = 0; o < i; ++o)
    if (a = c, c = l, l = ue(n, o + 1), !!c) {
      if (l) {
        const h = l[t] - c[t];
        s[o] = h !== 0 ? (l[e] - c[e]) / h : 0;
      }
      r[o] = a ? l ? le(s[o - 1]) !== le(s[o]) ? 0 : (s[o - 1] + s[o]) / 2 : s[o - 1] : s[o];
    }
  Wc(n, s, r), Bc(n, r, t);
}
function rn(n, t, e) {
  return Math.max(Math.min(n, e), t);
}
function jc(n, t) {
  let e, i, s, r, o, a = je(n[0], t);
  for (e = 0, i = n.length; e < i; ++e)
    o = r, r = a, a = e < i - 1 && je(n[e + 1], t), r && (s = n[e], o && (s.cp1x = rn(s.cp1x, t.left, t.right), s.cp1y = rn(s.cp1y, t.top, t.bottom)), a && (s.cp2x = rn(s.cp2x, t.left, t.right), s.cp2y = rn(s.cp2y, t.top, t.bottom)));
}
function Vc(n, t, e, i, s) {
  let r, o, a, c;
  if (t.spanGaps && (n = n.filter((l) => !l.skip)), t.cubicInterpolationMode === "monotone")
    Yc(n, s);
  else {
    let l = i ? n[n.length - 1] : n[0];
    for (r = 0, o = n.length; r < o; ++r)
      a = n[r], c = Nc(l, a, n[Math.min(r + 1, o - (i ? 0 : 1)) % o], t.tension), a.cp1x = c.previous.x, a.cp1y = c.previous.y, a.cp2x = c.next.x, a.cp2y = c.next.y, l = a;
  }
  t.capBezierPoints && jc(n, e);
}
function $i() {
  return typeof window < "u" && typeof document < "u";
}
function Ii(n) {
  let t = n.parentNode;
  return t && t.toString() === "[object ShadowRoot]" && (t = t.host), t;
}
function Sn(n, t, e) {
  let i;
  return typeof n == "string" ? (i = parseInt(n, 10), n.indexOf("%") !== -1 && (i = i / 100 * t.parentNode[e])) : i = n, i;
}
const Ln = (n) => n.ownerDocument.defaultView.getComputedStyle(n, null);
function Uc(n, t) {
  return Ln(n).getPropertyValue(t);
}
const qc = [
  "top",
  "right",
  "bottom",
  "left"
];
function Xt(n, t, e) {
  const i = {};
  e = e ? "-" + e : "";
  for (let s = 0; s < 4; s++) {
    const r = qc[s];
    i[r] = parseFloat(n[t + "-" + r + e]) || 0;
  }
  return i.width = i.left + i.right, i.height = i.top + i.bottom, i;
}
const Xc = (n, t, e) => (n > 0 || t > 0) && (!e || !e.shadowRoot);
function Qc(n, t) {
  const e = n.touches, i = e && e.length ? e[0] : n, { offsetX: s, offsetY: r } = i;
  let o = !1, a, c;
  if (Xc(s, r, n.target))
    a = s, c = r;
  else {
    const l = t.getBoundingClientRect();
    a = i.clientX - l.left, c = i.clientY - l.top, o = !0;
  }
  return {
    x: a,
    y: c,
    box: o
  };
}
function Wt(n, t) {
  if ("native" in n)
    return n;
  const { canvas: e, currentDevicePixelRatio: i } = t, s = Ln(e), r = s.boxSizing === "border-box", o = Xt(s, "padding"), a = Xt(s, "border", "width"), { x: c, y: l, box: h } = Qc(n, e), u = o.left + (h && a.left), d = o.top + (h && a.top);
  let { width: f, height: g } = t;
  return r && (f -= o.width + a.width, g -= o.height + a.height), {
    x: Math.round((c - u) / f * e.width / i),
    y: Math.round((l - d) / g * e.height / i)
  };
}
function Gc(n, t, e) {
  let i, s;
  if (t === void 0 || e === void 0) {
    const r = n && Ii(n);
    if (!r)
      t = n.clientWidth, e = n.clientHeight;
    else {
      const o = r.getBoundingClientRect(), a = Ln(r), c = Xt(a, "border", "width"), l = Xt(a, "padding");
      t = o.width - l.width - c.width, e = o.height - l.height - c.height, i = Sn(a.maxWidth, r, "clientWidth"), s = Sn(a.maxHeight, r, "clientHeight");
    }
  }
  return {
    width: t,
    height: e,
    maxWidth: i || Dn,
    maxHeight: s || Dn
  };
}
const Pt = (n) => Math.round(n * 10) / 10;
function Kc(n, t, e, i) {
  const s = Ln(n), r = Xt(s, "margin"), o = Sn(s.maxWidth, n, "clientWidth") || Dn, a = Sn(s.maxHeight, n, "clientHeight") || Dn, c = Gc(n, t, e);
  let { width: l, height: h } = c;
  if (s.boxSizing === "content-box") {
    const d = Xt(s, "border", "width"), f = Xt(s, "padding");
    l -= f.width + d.width, h -= f.height + d.height;
  }
  return l = Math.max(0, l - r.width), h = Math.max(0, i ? l / i : h - r.height), l = Pt(Math.min(l, o, c.maxWidth)), h = Pt(Math.min(h, a, c.maxHeight)), l && !h && (h = Pt(l / 2)), (t !== void 0 || e !== void 0) && i && c.height && h > c.height && (h = c.height, l = Pt(Math.floor(h * i))), {
    width: l,
    height: h
  };
}
function _s(n, t, e) {
  const i = t || 1, s = Pt(n.height * i), r = Pt(n.width * i);
  n.height = Pt(n.height), n.width = Pt(n.width);
  const o = n.canvas;
  return o.style && (e || !o.style.height && !o.style.width) && (o.style.height = `${n.height}px`, o.style.width = `${n.width}px`), n.currentDevicePixelRatio !== i || o.height !== s || o.width !== r ? (n.currentDevicePixelRatio = i, o.height = s, o.width = r, n.ctx.setTransform(i, 0, 0, i, 0, 0), !0) : !1;
}
const Zc = (function() {
  let n = !1;
  try {
    const t = {
      get passive() {
        return n = !0, !1;
      }
    };
    $i() && (window.addEventListener("test", null, t), window.removeEventListener("test", null, t));
  } catch {
  }
  return n;
})();
function xs(n, t) {
  const e = Uc(n, t), i = e && e.match(/^(\d+)(\.\d+)?px$/);
  return i ? +i[1] : void 0;
}
function Bt(n, t, e, i) {
  return {
    x: n.x + e * (t.x - n.x),
    y: n.y + e * (t.y - n.y)
  };
}
function Jc(n, t, e, i) {
  return {
    x: n.x + e * (t.x - n.x),
    y: i === "middle" ? e < 0.5 ? n.y : t.y : i === "after" ? e < 1 ? n.y : t.y : e > 0 ? t.y : n.y
  };
}
function tl(n, t, e, i) {
  const s = {
    x: n.cp2x,
    y: n.cp2y
  }, r = {
    x: t.cp1x,
    y: t.cp1y
  }, o = Bt(n, s, e), a = Bt(s, r, e), c = Bt(r, t, e), l = Bt(o, a, e), h = Bt(a, c, e);
  return Bt(l, h, e);
}
const el = function(n, t) {
  return {
    x(e) {
      return n + n + t - e;
    },
    setWidth(e) {
      t = e;
    },
    textAlign(e) {
      return e === "center" ? e : e === "right" ? "left" : "right";
    },
    xPlus(e, i) {
      return e - i;
    },
    leftForLtr(e, i) {
      return e - i;
    }
  };
}, nl = function() {
  return {
    x(n) {
      return n;
    },
    setWidth(n) {
    },
    textAlign(n) {
      return n;
    },
    xPlus(n, t) {
      return n + t;
    },
    leftForLtr(n, t) {
      return n;
    }
  };
};
function re(n, t, e) {
  return n ? el(t, e) : nl();
}
function Gr(n, t) {
  let e, i;
  (t === "ltr" || t === "rtl") && (e = n.canvas.style, i = [
    e.getPropertyValue("direction"),
    e.getPropertyPriority("direction")
  ], e.setProperty("direction", t, "important"), n.prevTextDirection = i);
}
function Kr(n, t) {
  t !== void 0 && (delete n.prevTextDirection, n.canvas.style.setProperty("direction", t[0], t[1]));
}
function Zr(n) {
  return n === "angle" ? {
    between: Fr,
    compare: Ja,
    normalize: ft
  } : {
    between: se,
    compare: (t, e) => t - e,
    normalize: (t) => t
  };
}
function ws({ start: n, end: t, count: e, loop: i, style: s }) {
  return {
    start: n % e,
    end: t % e,
    loop: i && (t - n + 1) % e === 0,
    style: s
  };
}
function il(n, t, e) {
  const { property: i, start: s, end: r } = e, { between: o, normalize: a } = Zr(i), c = t.length;
  let { start: l, end: h, loop: u } = n, d, f;
  if (u) {
    for (l += c, h += c, d = 0, f = c; d < f && o(a(t[l % c][i]), s, r); ++d)
      l--, h--;
    l %= c, h %= c;
  }
  return h < l && (h += c), {
    start: l,
    end: h,
    loop: u,
    style: n.style
  };
}
function Jr(n, t, e) {
  if (!e)
    return [
      n
    ];
  const { property: i, start: s, end: r } = e, o = t.length, { compare: a, between: c, normalize: l } = Zr(i), { start: h, end: u, loop: d, style: f } = il(n, t, e), g = [];
  let m = !1, p = null, b, _, v;
  const M = () => c(s, v, b) && a(s, v) !== 0, w = () => a(r, b) === 0 || c(r, v, b), P = () => m || M(), k = () => !m || w();
  for (let x = h, D = h; x <= u; ++x)
    _ = t[x % o], !_.skip && (b = l(_[i]), b !== v && (m = c(b, s, r), p === null && P() && (p = a(b, s) === 0 ? x : D), p !== null && k() && (g.push(ws({
      start: p,
      end: x,
      loop: d,
      count: o,
      style: f
    })), p = null), D = x, v = b));
  return p !== null && g.push(ws({
    start: p,
    end: u,
    loop: d,
    count: o,
    style: f
  })), g;
}
function to(n, t) {
  const e = [], i = n.segments;
  for (let s = 0; s < i.length; s++) {
    const r = Jr(i[s], n.points, t);
    r.length && e.push(...r);
  }
  return e;
}
function sl(n, t, e, i) {
  let s = 0, r = t - 1;
  if (e && !i)
    for (; s < t && !n[s].skip; )
      s++;
  for (; s < t && n[s].skip; )
    s++;
  for (s %= t, e && (r += s); r > s && n[r % t].skip; )
    r--;
  return r %= t, {
    start: s,
    end: r
  };
}
function rl(n, t, e, i) {
  const s = n.length, r = [];
  let o = t, a = n[t], c;
  for (c = t + 1; c <= e; ++c) {
    const l = n[c % s];
    l.skip || l.stop ? a.skip || (i = !1, r.push({
      start: t % s,
      end: (c - 1) % s,
      loop: i
    }), t = o = l.stop ? c : null) : (o = c, a.skip && (t = c)), a = l;
  }
  return o !== null && r.push({
    start: t % s,
    end: o % s,
    loop: i
  }), r;
}
function ol(n, t) {
  const e = n.points, i = n.options.spanGaps, s = e.length;
  if (!s)
    return [];
  const r = !!n._loop, { start: o, end: a } = sl(e, s, r, i);
  if (i === !0)
    return vs(n, [
      {
        start: o,
        end: a,
        loop: r
      }
    ], e, t);
  const c = a < o ? a + s : a, l = !!n._fullLoop && o === 0 && a === s - 1;
  return vs(n, rl(e, o, c, l), e, t);
}
function vs(n, t, e, i) {
  return !i || !i.setContext || !e ? t : al(n, t, e, i);
}
function al(n, t, e, i) {
  const s = n._chart.getContext(), r = Ms(n.options), { _datasetIndex: o, options: { spanGaps: a } } = n, c = e.length, l = [];
  let h = r, u = t[0].start, d = u;
  function f(g, m, p, b) {
    const _ = a ? -1 : 1;
    if (g !== m) {
      for (g += c; e[g % c].skip; )
        g -= _;
      for (; e[m % c].skip; )
        m += _;
      g % c !== m % c && (l.push({
        start: g % c,
        end: m % c,
        loop: p,
        style: b
      }), h = b, u = m % c);
    }
  }
  for (const g of t) {
    u = a ? u : g.start;
    let m = e[u % c], p;
    for (d = u + 1; d <= g.end; d++) {
      const b = e[d % c];
      p = Ms(i.setContext(Kt(s, {
        type: "segment",
        p0: m,
        p1: b,
        p0DataIndex: (d - 1) % c,
        p1DataIndex: d % c,
        datasetIndex: o
      }))), cl(p, h) && f(u, d - 1, g.loop, h), m = b, h = p;
    }
    u < d - 1 && f(u, d - 1, g.loop, h);
  }
  return l;
}
function Ms(n) {
  return {
    backgroundColor: n.backgroundColor,
    borderCapStyle: n.borderCapStyle,
    borderDash: n.borderDash,
    borderDashOffset: n.borderDashOffset,
    borderJoinStyle: n.borderJoinStyle,
    borderWidth: n.borderWidth,
    borderColor: n.borderColor
  };
}
function cl(n, t) {
  if (!t)
    return !1;
  const e = [], i = function(s, r) {
    return Ti(r) ? (e.includes(r) || e.push(r), e.indexOf(r)) : r;
  };
  return JSON.stringify(n, i) !== JSON.stringify(t, i);
}
function on(n, t, e) {
  return n.options.clip ? n[e] : t[e];
}
function ll(n, t) {
  const { xScale: e, yScale: i } = n;
  return e && i ? {
    left: on(e, t, "left"),
    right: on(e, t, "right"),
    top: on(i, t, "top"),
    bottom: on(i, t, "bottom")
  } : t;
}
function eo(n, t) {
  const e = t._clip;
  if (e.disabled)
    return !1;
  const i = ll(t, n.chartArea);
  return {
    left: e.left === !1 ? 0 : i.left - (e.left === !0 ? 0 : e.left),
    right: e.right === !1 ? n.width : i.right + (e.right === !0 ? 0 : e.right),
    top: e.top === !1 ? 0 : i.top - (e.top === !0 ? 0 : e.top),
    bottom: e.bottom === !1 ? n.height : i.bottom + (e.bottom === !0 ? 0 : e.bottom)
  };
}
/*!
 * Chart.js v4.5.1
 * https://www.chartjs.org
 * (c) 2025 Chart.js Contributors
 * Released under the MIT License
 */
class hl {
  constructor() {
    this._request = null, this._charts = /* @__PURE__ */ new Map(), this._running = !1, this._lastDate = void 0;
  }
  _notify(t, e, i, s) {
    const r = e.listeners[s], o = e.duration;
    r.forEach((a) => a({
      chart: t,
      initial: e.initial,
      numSteps: o,
      currentStep: Math.min(i - e.start, o)
    }));
  }
  _refresh() {
    this._request || (this._running = !0, this._request = Rr.call(window, () => {
      this._update(), this._request = null, this._running && this._refresh();
    }));
  }
  _update(t = Date.now()) {
    let e = 0;
    this._charts.forEach((i, s) => {
      if (!i.running || !i.items.length)
        return;
      const r = i.items;
      let o = r.length - 1, a = !1, c;
      for (; o >= 0; --o)
        c = r[o], c._active ? (c._total > i.duration && (i.duration = c._total), c.tick(t), a = !0) : (r[o] = r[r.length - 1], r.pop());
      a && (s.draw(), this._notify(s, i, t, "progress")), r.length || (i.running = !1, this._notify(s, i, t, "complete"), i.initial = !1), e += r.length;
    }), this._lastDate = t, e === 0 && (this._running = !1);
  }
  _getAnims(t) {
    const e = this._charts;
    let i = e.get(t);
    return i || (i = {
      running: !1,
      initial: !0,
      items: [],
      listeners: {
        complete: [],
        progress: []
      }
    }, e.set(t, i)), i;
  }
  listen(t, e, i) {
    this._getAnims(t).listeners[e].push(i);
  }
  add(t, e) {
    !e || !e.length || this._getAnims(t).items.push(...e);
  }
  has(t) {
    return this._getAnims(t).items.length > 0;
  }
  start(t) {
    const e = this._charts.get(t);
    e && (e.running = !0, e.start = Date.now(), e.duration = e.items.reduce((i, s) => Math.max(i, s._duration), 0), this._refresh());
  }
  running(t) {
    if (!this._running)
      return !1;
    const e = this._charts.get(t);
    return !(!e || !e.running || !e.items.length);
  }
  stop(t) {
    const e = this._charts.get(t);
    if (!e || !e.items.length)
      return;
    const i = e.items;
    let s = i.length - 1;
    for (; s >= 0; --s)
      i[s].cancel();
    e.items = [], this._notify(t, e, Date.now(), "complete");
  }
  remove(t) {
    return this._charts.delete(t);
  }
}
var yt = /* @__PURE__ */ new hl();
const ks = "transparent", ul = {
  boolean(n, t, e) {
    return e > 0.5 ? t : n;
  },
  color(n, t, e) {
    const i = fs(n || ks), s = i.valid && fs(t || ks);
    return s && s.valid ? s.mix(i, e).hexString() : t;
  },
  number(n, t, e) {
    return n + (t - n) * e;
  }
};
class dl {
  constructor(t, e, i, s) {
    const r = e[i];
    s = sn([
      t.to,
      s,
      r,
      t.from
    ]);
    const o = sn([
      t.from,
      r,
      s
    ]);
    this._active = !0, this._fn = t.fn || ul[t.type || typeof o], this._easing = Ee[t.easing] || Ee.linear, this._start = Math.floor(Date.now() + (t.delay || 0)), this._duration = this._total = Math.floor(t.duration), this._loop = !!t.loop, this._target = e, this._prop = i, this._from = o, this._to = s, this._promises = void 0;
  }
  active() {
    return this._active;
  }
  update(t, e, i) {
    if (this._active) {
      this._notify(!1);
      const s = this._target[this._prop], r = i - this._start, o = this._duration - r;
      this._start = i, this._duration = Math.floor(Math.max(o, t.duration)), this._total += r, this._loop = !!t.loop, this._to = sn([
        t.to,
        e,
        s,
        t.from
      ]), this._from = sn([
        t.from,
        s,
        e
      ]);
    }
  }
  cancel() {
    this._active && (this.tick(Date.now()), this._active = !1, this._notify(!1));
  }
  tick(t) {
    const e = t - this._start, i = this._duration, s = this._prop, r = this._from, o = this._loop, a = this._to;
    let c;
    if (this._active = r !== a && (o || e < i), !this._active) {
      this._target[s] = a, this._notify(!0);
      return;
    }
    if (e < 0) {
      this._target[s] = r;
      return;
    }
    c = e / i % 2, c = o && c > 1 ? 2 - c : c, c = this._easing(Math.min(1, Math.max(0, c))), this._target[s] = this._fn(r, a, c);
  }
  wait() {
    const t = this._promises || (this._promises = []);
    return new Promise((e, i) => {
      t.push({
        res: e,
        rej: i
      });
    });
  }
  _notify(t) {
    const e = t ? "res" : "rej", i = this._promises || [];
    for (let s = 0; s < i.length; s++)
      i[s][e]();
  }
}
class no {
  constructor(t, e) {
    this._chart = t, this._properties = /* @__PURE__ */ new Map(), this.configure(e);
  }
  configure(t) {
    if (!E(t))
      return;
    const e = Object.keys(B.animation), i = this._properties;
    Object.getOwnPropertyNames(t).forEach((s) => {
      const r = t[s];
      if (!E(r))
        return;
      const o = {};
      for (const a of e)
        o[a] = r[a];
      (X(r.properties) && r.properties || [
        s
      ]).forEach((a) => {
        (a === s || !i.has(a)) && i.set(a, o);
      });
    });
  }
  _animateOptions(t, e) {
    const i = e.options, s = gl(t, i);
    if (!s)
      return [];
    const r = this._createAnimations(s, i);
    return i.$shared && fl(t.options.$animations, i).then(() => {
      t.options = i;
    }, () => {
    }), r;
  }
  _createAnimations(t, e) {
    const i = this._properties, s = [], r = t.$animations || (t.$animations = {}), o = Object.keys(e), a = Date.now();
    let c;
    for (c = o.length - 1; c >= 0; --c) {
      const l = o[c];
      if (l.charAt(0) === "$")
        continue;
      if (l === "options") {
        s.push(...this._animateOptions(t, e));
        continue;
      }
      const h = e[l];
      let u = r[l];
      const d = i.get(l);
      if (u)
        if (d && u.active()) {
          u.update(d, h, a);
          continue;
        } else
          u.cancel();
      if (!d || !d.duration) {
        t[l] = h;
        continue;
      }
      r[l] = u = new dl(d, t, l, h), s.push(u);
    }
    return s;
  }
  update(t, e) {
    if (this._properties.size === 0) {
      Object.assign(t, e);
      return;
    }
    const i = this._createAnimations(t, e);
    if (i.length)
      return yt.add(this._chart, i), !0;
  }
}
function fl(n, t) {
  const e = [], i = Object.keys(t);
  for (let s = 0; s < i.length; s++) {
    const r = n[i[s]];
    r && r.active() && e.push(r.wait());
  }
  return Promise.all(e);
}
function gl(n, t) {
  if (!t)
    return;
  let e = n.options;
  if (!e) {
    n.options = t;
    return;
  }
  return e.$shared && (n.options = e = Object.assign({}, e, {
    $shared: !1,
    $animations: {}
  })), e;
}
function Ds(n, t) {
  const e = n && n.options || {}, i = e.reverse, s = e.min === void 0 ? t : 0, r = e.max === void 0 ? t : 0;
  return {
    start: i ? r : s,
    end: i ? s : r
  };
}
function ml(n, t, e) {
  if (e === !1)
    return !1;
  const i = Ds(n, e), s = Ds(t, e);
  return {
    top: s.end,
    right: i.end,
    bottom: s.start,
    left: i.start
  };
}
function pl(n) {
  let t, e, i, s;
  return E(n) ? (t = n.top, e = n.right, i = n.bottom, s = n.left) : t = e = i = s = n, {
    top: t,
    right: e,
    bottom: i,
    left: s,
    disabled: n === !1
  };
}
function io(n, t) {
  const e = [], i = n._getSortedDatasetMetas(t);
  let s, r;
  for (s = 0, r = i.length; s < r; ++s)
    e.push(i[s].index);
  return e;
}
function Ps(n, t, e, i = {}) {
  const s = n.keys, r = i.mode === "single";
  let o, a, c, l;
  if (t === null)
    return;
  let h = !1;
  for (o = 0, a = s.length; o < a; ++o) {
    if (c = +s[o], c === e) {
      if (h = !0, i.all)
        continue;
      break;
    }
    l = n.values[c], J(l) && (r || t === 0 || le(t) === le(l)) && (t += l);
  }
  return !h && !i.all ? 0 : t;
}
function bl(n, t) {
  const { iScale: e, vScale: i } = t, s = e.axis === "x" ? "x" : "y", r = i.axis === "x" ? "x" : "y", o = Object.keys(n), a = new Array(o.length);
  let c, l, h;
  for (c = 0, l = o.length; c < l; ++c)
    h = o[c], a[c] = {
      [s]: h,
      [r]: n[h]
    };
  return a;
}
function qn(n, t) {
  const e = n && n.options.stacked;
  return e || e === void 0 && t.stack !== void 0;
}
function yl(n, t, e) {
  return `${n.id}.${t.id}.${e.stack || e.type}`;
}
function _l(n) {
  const { min: t, max: e, minDefined: i, maxDefined: s } = n.getUserBounds();
  return {
    min: i ? t : Number.NEGATIVE_INFINITY,
    max: s ? e : Number.POSITIVE_INFINITY
  };
}
function xl(n, t, e) {
  const i = n[t] || (n[t] = {});
  return i[e] || (i[e] = {});
}
function Ss(n, t, e, i) {
  for (const s of t.getMatchingVisibleMetas(i).reverse()) {
    const r = n[s.index];
    if (e && r > 0 || !e && r < 0)
      return s.index;
  }
  return null;
}
function Os(n, t) {
  const { chart: e, _cachedMeta: i } = n, s = e._stacks || (e._stacks = {}), { iScale: r, vScale: o, index: a } = i, c = r.axis, l = o.axis, h = yl(r, o, i), u = t.length;
  let d;
  for (let f = 0; f < u; ++f) {
    const g = t[f], { [c]: m, [l]: p } = g, b = g._stacks || (g._stacks = {});
    d = b[l] = xl(s, h, m), d[a] = p, d._top = Ss(d, o, !0, i.type), d._bottom = Ss(d, o, !1, i.type);
    const _ = d._visualValues || (d._visualValues = {});
    _[a] = p;
  }
}
function Xn(n, t) {
  const e = n.scales;
  return Object.keys(e).filter((i) => e[i].axis === t).shift();
}
function wl(n, t) {
  return Kt(n, {
    active: !1,
    dataset: void 0,
    datasetIndex: t,
    index: t,
    mode: "default",
    type: "dataset"
  });
}
function vl(n, t, e) {
  return Kt(n, {
    active: !1,
    dataIndex: t,
    parsed: void 0,
    raw: void 0,
    element: e,
    index: t,
    mode: "default",
    type: "data"
  });
}
function pe(n, t) {
  const e = n.controller.index, i = n.vScale && n.vScale.axis;
  if (i) {
    t = t || n._parsed;
    for (const s of t) {
      const r = s._stacks;
      if (!r || r[i] === void 0 || r[i][e] === void 0)
        return;
      delete r[i][e], r[i]._visualValues !== void 0 && r[i]._visualValues[e] !== void 0 && delete r[i]._visualValues[e];
    }
  }
}
const Qn = (n) => n === "reset" || n === "none", Ts = (n, t) => t ? n : Object.assign({}, n), Ml = (n, t, e) => n && !t.hidden && t._stacked && {
  keys: io(e, !0),
  values: null
};
class Le {
  constructor(t, e) {
    this.chart = t, this._ctx = t.ctx, this.index = e, this._cachedDataOpts = {}, this._cachedMeta = this.getMeta(), this._type = this._cachedMeta.type, this.options = void 0, this._parsing = !1, this._data = void 0, this._objectData = void 0, this._sharedOptions = void 0, this._drawStart = void 0, this._drawCount = void 0, this.enableOptionSharing = !1, this.supportsDecimation = !1, this.$context = void 0, this._syncList = [], this.datasetElementType = new.target.datasetElementType, this.dataElementType = new.target.dataElementType, this.initialize();
  }
  initialize() {
    const t = this._cachedMeta;
    this.configure(), this.linkScales(), t._stacked = qn(t.vScale, t), this.addElements(), this.options.fill && !this.chart.isPluginEnabled("filler") && console.warn("Tried to use the 'fill' option without the 'Filler' plugin enabled. Please import and register the 'Filler' plugin and make sure it is not disabled in the options");
  }
  updateIndex(t) {
    this.index !== t && pe(this._cachedMeta), this.index = t;
  }
  linkScales() {
    const t = this.chart, e = this._cachedMeta, i = this.getDataset(), s = (u, d, f, g) => u === "x" ? d : u === "r" ? g : f, r = e.xAxisID = A(i.xAxisID, Xn(t, "x")), o = e.yAxisID = A(i.yAxisID, Xn(t, "y")), a = e.rAxisID = A(i.rAxisID, Xn(t, "r")), c = e.indexAxis, l = e.iAxisID = s(c, r, o, a), h = e.vAxisID = s(c, o, r, a);
    e.xScale = this.getScaleForId(r), e.yScale = this.getScaleForId(o), e.rScale = this.getScaleForId(a), e.iScale = this.getScaleForId(l), e.vScale = this.getScaleForId(h);
  }
  getDataset() {
    return this.chart.data.datasets[this.index];
  }
  getMeta() {
    return this.chart.getDatasetMeta(this.index);
  }
  getScaleForId(t) {
    return this.chart.scales[t];
  }
  _getOtherScale(t) {
    const e = this._cachedMeta;
    return t === e.iScale ? e.vScale : e.iScale;
  }
  reset() {
    this._update("reset");
  }
  _destroy() {
    const t = this._cachedMeta;
    this._data && hs(this._data, this), t._stacked && pe(t);
  }
  _dataCheck() {
    const t = this.getDataset(), e = t.data || (t.data = []), i = this._data;
    if (E(e)) {
      const s = this._cachedMeta;
      this._data = bl(e, s);
    } else if (i !== e) {
      if (i) {
        hs(i, this);
        const s = this._cachedMeta;
        pe(s), s._parsed = [];
      }
      e && Object.isExtensible(e) && ic(e, this), this._syncList = [], this._data = e;
    }
  }
  addElements() {
    const t = this._cachedMeta;
    this._dataCheck(), this.datasetElementType && (t.dataset = new this.datasetElementType());
  }
  buildOrUpdateElements(t) {
    const e = this._cachedMeta, i = this.getDataset();
    let s = !1;
    this._dataCheck();
    const r = e._stacked;
    e._stacked = qn(e.vScale, e), e.stack !== i.stack && (s = !0, pe(e), e.stack = i.stack), this._resyncElements(t), (s || r !== e._stacked) && (Os(this, e._parsed), e._stacked = qn(e.vScale, e));
  }
  configure() {
    const t = this.chart.config, e = t.datasetScopeKeys(this._type), i = t.getOptionScopes(this.getDataset(), e, !0);
    this.options = t.createResolver(i, this.getContext()), this._parsing = this.options.parsing, this._cachedDataOpts = {};
  }
  parse(t, e) {
    const { _cachedMeta: i, _data: s } = this, { iScale: r, _stacked: o } = i, a = r.axis;
    let c = t === 0 && e === s.length ? !0 : i._sorted, l = t > 0 && i._parsed[t - 1], h, u, d;
    if (this._parsing === !1)
      i._parsed = s, i._sorted = !0, d = s;
    else {
      X(s[t]) ? d = this.parseArrayData(i, s, t, e) : E(s[t]) ? d = this.parseObjectData(i, s, t, e) : d = this.parsePrimitiveData(i, s, t, e);
      const f = () => u[a] === null || l && u[a] < l[a];
      for (h = 0; h < e; ++h)
        i._parsed[h + t] = u = d[h], c && (f() && (c = !1), l = u);
      i._sorted = c;
    }
    o && Os(this, d);
  }
  parsePrimitiveData(t, e, i, s) {
    const { iScale: r, vScale: o } = t, a = r.axis, c = o.axis, l = r.getLabels(), h = r === o, u = new Array(s);
    let d, f, g;
    for (d = 0, f = s; d < f; ++d)
      g = d + i, u[d] = {
        [a]: h || r.parse(l[g], g),
        [c]: o.parse(e[g], g)
      };
    return u;
  }
  parseArrayData(t, e, i, s) {
    const { xScale: r, yScale: o } = t, a = new Array(s);
    let c, l, h, u;
    for (c = 0, l = s; c < l; ++c)
      h = c + i, u = e[h], a[c] = {
        x: r.parse(u[0], h),
        y: o.parse(u[1], h)
      };
    return a;
  }
  parseObjectData(t, e, i, s) {
    const { xScale: r, yScale: o } = t, { xAxisKey: a = "x", yAxisKey: c = "y" } = this._parsing, l = new Array(s);
    let h, u, d, f;
    for (h = 0, u = s; h < u; ++h)
      d = h + i, f = e[d], l[h] = {
        x: r.parse(Mn(f, a), d),
        y: o.parse(Mn(f, c), d)
      };
    return l;
  }
  getParsed(t) {
    return this._cachedMeta._parsed[t];
  }
  getDataElement(t) {
    return this._cachedMeta.data[t];
  }
  applyStack(t, e, i) {
    const s = this.chart, r = this._cachedMeta, o = e[t.axis], a = {
      keys: io(s, !0),
      values: e._stacks[t.axis]._visualValues
    };
    return Ps(a, o, r.index, {
      mode: i
    });
  }
  updateRangeFromParsed(t, e, i, s) {
    const r = i[e.axis];
    let o = r === null ? NaN : r;
    const a = s && i._stacks[e.axis];
    s && a && (s.values = a, o = Ps(s, r, this._cachedMeta.index)), t.min = Math.min(t.min, o), t.max = Math.max(t.max, o);
  }
  getMinMax(t, e) {
    const i = this._cachedMeta, s = i._parsed, r = i._sorted && t === i.iScale, o = s.length, a = this._getOtherScale(t), c = Ml(e, i, this.chart), l = {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY
    }, { min: h, max: u } = _l(a);
    let d, f;
    function g() {
      f = s[d];
      const m = f[a.axis];
      return !J(f[t.axis]) || h > m || u < m;
    }
    for (d = 0; d < o && !(!g() && (this.updateRangeFromParsed(l, t, f, c), r)); ++d)
      ;
    if (r) {
      for (d = o - 1; d >= 0; --d)
        if (!g()) {
          this.updateRangeFromParsed(l, t, f, c);
          break;
        }
    }
    return l;
  }
  getAllParsedValues(t) {
    const e = this._cachedMeta._parsed, i = [];
    let s, r, o;
    for (s = 0, r = e.length; s < r; ++s)
      o = e[s][t.axis], J(o) && i.push(o);
    return i;
  }
  getMaxOverflow() {
    return !1;
  }
  getLabelAndValue(t) {
    const e = this._cachedMeta, i = e.iScale, s = e.vScale, r = this.getParsed(t);
    return {
      label: i ? "" + i.getLabelForValue(r[i.axis]) : "",
      value: s ? "" + s.getLabelForValue(r[s.axis]) : ""
    };
  }
  _update(t) {
    const e = this._cachedMeta;
    this.update(t || "default"), e._clip = pl(A(this.options.clip, ml(e.xScale, e.yScale, this.getMaxOverflow())));
  }
  update(t) {
  }
  draw() {
    const t = this._ctx, e = this.chart, i = this._cachedMeta, s = i.data || [], r = e.chartArea, o = [], a = this._drawStart || 0, c = this._drawCount || s.length - a, l = this.options.drawActiveElementsOnTop;
    let h;
    for (i.dataset && i.dataset.draw(t, r, a, c), h = a; h < a + c; ++h) {
      const u = s[h];
      u.hidden || (u.active && l ? o.push(u) : u.draw(t, r));
    }
    for (h = 0; h < o.length; ++h)
      o[h].draw(t, r);
  }
  getStyle(t, e) {
    const i = e ? "active" : "default";
    return t === void 0 && this._cachedMeta.dataset ? this.resolveDatasetElementOptions(i) : this.resolveDataElementOptions(t || 0, i);
  }
  getContext(t, e, i) {
    const s = this.getDataset();
    let r;
    if (t >= 0 && t < this._cachedMeta.data.length) {
      const o = this._cachedMeta.data[t];
      r = o.$context || (o.$context = vl(this.getContext(), t, o)), r.parsed = this.getParsed(t), r.raw = s.data[t], r.index = r.dataIndex = t;
    } else
      r = this.$context || (this.$context = wl(this.chart.getContext(), this.index)), r.dataset = s, r.index = r.datasetIndex = this.index;
    return r.active = !!e, r.mode = i, r;
  }
  resolveDatasetElementOptions(t) {
    return this._resolveElementOptions(this.datasetElementType.id, t);
  }
  resolveDataElementOptions(t, e) {
    return this._resolveElementOptions(this.dataElementType.id, e, t);
  }
  _resolveElementOptions(t, e = "default", i) {
    const s = e === "active", r = this._cachedDataOpts, o = t + "-" + e, a = r[o], c = this.enableOptionSharing && kn(i);
    if (a)
      return Ts(a, c);
    const l = this.chart.config, h = l.datasetElementScopeKeys(this._type, t), u = s ? [
      `${t}Hover`,
      "hover",
      t,
      ""
    ] : [
      t,
      ""
    ], d = l.getOptionScopes(this.getDataset(), h), f = Object.keys(B.elements[t]), g = () => this.getContext(i, s, e), m = l.resolveNamedOptions(d, f, g, u);
    return m.$shared && (m.$shared = c, r[o] = Object.freeze(Ts(m, c))), m;
  }
  _resolveAnimations(t, e, i) {
    const s = this.chart, r = this._cachedDataOpts, o = `animation-${e}`, a = r[o];
    if (a)
      return a;
    let c;
    if (s.options.animation !== !1) {
      const h = this.chart.config, u = h.datasetAnimationScopeKeys(this._type, e), d = h.getOptionScopes(this.getDataset(), u);
      c = h.createResolver(d, this.getContext(t, i, e));
    }
    const l = new no(s, c && c.animations);
    return c && c._cacheable && (r[o] = Object.freeze(l)), l;
  }
  getSharedOptions(t) {
    if (t.$shared)
      return this._sharedOptions || (this._sharedOptions = Object.assign({}, t));
  }
  includeOptions(t, e) {
    return !e || Qn(t) || this.chart._animationsDisabled;
  }
  _getSharedOptions(t, e) {
    const i = this.resolveDataElementOptions(t, e), s = this._sharedOptions, r = this.getSharedOptions(i), o = this.includeOptions(e, r) || r !== s;
    return this.updateSharedOptions(r, e, i), {
      sharedOptions: r,
      includeOptions: o
    };
  }
  updateElement(t, e, i, s) {
    Qn(s) ? Object.assign(t, i) : this._resolveAnimations(e, s).update(t, i);
  }
  updateSharedOptions(t, e, i) {
    t && !Qn(e) && this._resolveAnimations(void 0, e).update(t, i);
  }
  _setStyle(t, e, i, s) {
    t.active = s;
    const r = this.getStyle(e, s);
    this._resolveAnimations(e, i, s).update(t, {
      options: !s && this.getSharedOptions(r) || r
    });
  }
  removeHoverStyle(t, e, i) {
    this._setStyle(t, i, "active", !1);
  }
  setHoverStyle(t, e, i) {
    this._setStyle(t, i, "active", !0);
  }
  _removeDatasetHoverStyle() {
    const t = this._cachedMeta.dataset;
    t && this._setStyle(t, void 0, "active", !1);
  }
  _setDatasetHoverStyle() {
    const t = this._cachedMeta.dataset;
    t && this._setStyle(t, void 0, "active", !0);
  }
  _resyncElements(t) {
    const e = this._data, i = this._cachedMeta.data;
    for (const [a, c, l] of this._syncList)
      this[a](c, l);
    this._syncList = [];
    const s = i.length, r = e.length, o = Math.min(r, s);
    o && this.parse(0, o), r > s ? this._insertElements(s, r - s, t) : r < s && this._removeElements(r, s - r);
  }
  _insertElements(t, e, i = !0) {
    const s = this._cachedMeta, r = s.data, o = t + e;
    let a;
    const c = (l) => {
      for (l.length += e, a = l.length - 1; a >= o; a--)
        l[a] = l[a - e];
    };
    for (c(r), a = t; a < o; ++a)
      r[a] = new this.dataElementType();
    this._parsing && c(s._parsed), this.parse(t, e), i && this.updateElements(r, t, e, "reset");
  }
  updateElements(t, e, i, s) {
  }
  _removeElements(t, e) {
    const i = this._cachedMeta;
    if (this._parsing) {
      const s = i._parsed.splice(t, e);
      i._stacked && pe(i, s);
    }
    i.data.splice(t, e);
  }
  _sync(t) {
    if (this._parsing)
      this._syncList.push(t);
    else {
      const [e, i, s] = t;
      this[e](i, s);
    }
    this.chart._dataChanges.push([
      this.index,
      ...t
    ]);
  }
  _onDataPush() {
    const t = arguments.length;
    this._sync([
      "_insertElements",
      this.getDataset().data.length - t,
      t
    ]);
  }
  _onDataPop() {
    this._sync([
      "_removeElements",
      this._cachedMeta.data.length - 1,
      1
    ]);
  }
  _onDataShift() {
    this._sync([
      "_removeElements",
      0,
      1
    ]);
  }
  _onDataSplice(t, e) {
    e && this._sync([
      "_removeElements",
      t,
      e
    ]);
    const i = arguments.length - 2;
    i && this._sync([
      "_insertElements",
      t,
      i
    ]);
  }
  _onDataUnshift() {
    this._sync([
      "_insertElements",
      0,
      arguments.length
    ]);
  }
}
y(Le, "defaults", {}), y(Le, "datasetElementType", null), y(Le, "dataElementType", null);
class pn extends Le {
  initialize() {
    this.enableOptionSharing = !0, this.supportsDecimation = !0, super.initialize();
  }
  update(t) {
    const e = this._cachedMeta, { dataset: i, data: s = [], _dataset: r } = e, o = this.chart._animationsDisabled;
    let { start: a, count: c } = ac(e, s, o);
    this._drawStart = a, this._drawCount = c, cc(e) && (a = 0, c = s.length), i._chart = this.chart, i._datasetIndex = this.index, i._decimated = !!r._decimated, i.points = s;
    const l = this.resolveDatasetElementOptions(t);
    this.options.showLine || (l.borderWidth = 0), l.segment = this.options.segment, this.updateElement(i, void 0, {
      animated: !o,
      options: l
    }, t), this.updateElements(s, a, c, t);
  }
  updateElements(t, e, i, s) {
    const r = s === "reset", { iScale: o, vScale: a, _stacked: c, _dataset: l } = this._cachedMeta, { sharedOptions: h, includeOptions: u } = this._getSharedOptions(e, s), d = o.axis, f = a.axis, { spanGaps: g, segment: m } = this.options, p = Ye(g) ? g : Number.POSITIVE_INFINITY, b = this.chart._animationsDisabled || r || s === "none", _ = e + i, v = t.length;
    let M = e > 0 && this.getParsed(e - 1);
    for (let w = 0; w < v; ++w) {
      const P = t[w], k = b ? P : {};
      if (w < e || w >= _) {
        k.skip = !0;
        continue;
      }
      const x = this.getParsed(w), D = z(x[f]), O = k[d] = o.getPixelForValue(x[d], w), S = k[f] = r || D ? a.getBasePixel() : a.getPixelForValue(c ? this.applyStack(a, x, c) : x[f], w);
      k.skip = isNaN(O) || isNaN(S) || D, k.stop = w > 0 && Math.abs(x[d] - M[d]) > p, m && (k.parsed = x, k.raw = l.data[w]), u && (k.options = h || this.resolveDataElementOptions(w, P.active ? "active" : s)), b || this.updateElement(P, w, k, s), M = x;
    }
  }
  getMaxOverflow() {
    const t = this._cachedMeta, e = t.dataset, i = e.options && e.options.borderWidth || 0, s = t.data || [];
    if (!s.length)
      return i;
    const r = s[0].size(this.resolveDataElementOptions(0)), o = s[s.length - 1].size(this.resolveDataElementOptions(s.length - 1));
    return Math.max(i, r, o) / 2;
  }
  draw() {
    const t = this._cachedMeta;
    t.dataset.updateControlPoints(this.chart.chartArea, t.iScale.axis), super.draw();
  }
}
y(pn, "id", "line"), y(pn, "defaults", {
  datasetElementType: "line",
  dataElementType: "point",
  showLine: !0,
  spanGaps: !1
}), y(pn, "overrides", {
  scales: {
    _index_: {
      type: "category"
    },
    _value_: {
      type: "linear"
    }
  }
});
function Nt() {
  throw new Error("This method is not implemented: Check that a complete date adapter is provided.");
}
class Li {
  constructor(t) {
    y(this, "options");
    this.options = t || {};
  }
  /**
  * Override default date adapter methods.
  * Accepts type parameter to define options type.
  * @example
  * Chart._adapters._date.override<{myAdapterOption: string}>({
  *   init() {
  *     console.log(this.options.myAdapterOption);
  *   }
  * })
  */
  static override(t) {
    Object.assign(Li.prototype, t);
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  init() {
  }
  formats() {
    return Nt();
  }
  parse() {
    return Nt();
  }
  format() {
    return Nt();
  }
  add() {
    return Nt();
  }
  diff() {
    return Nt();
  }
  startOf() {
    return Nt();
  }
  endOf() {
    return Nt();
  }
}
var so = {
  _date: Li
};
function kl(n, t, e, i) {
  const { controller: s, data: r, _sorted: o } = n, a = s._cachedMeta.iScale, c = n.dataset && n.dataset.options ? n.dataset.options.spanGaps : null;
  if (a && t === a.axis && t !== "r" && o && r.length) {
    const l = a._reversePixels ? ec : Ut;
    if (i) {
      if (s._sharedOptions) {
        const h = r[0], u = typeof h.getRange == "function" && h.getRange(t);
        if (u) {
          const d = l(r, t, e - u), f = l(r, t, e + u);
          return {
            lo: d.lo,
            hi: f.hi
          };
        }
      }
    } else {
      const h = l(r, t, e);
      if (c) {
        const { vScale: u } = s._cachedMeta, { _parsed: d } = n, f = d.slice(0, h.lo + 1).reverse().findIndex((m) => !z(m[u.axis]));
        h.lo -= Math.max(0, f);
        const g = d.slice(h.hi).findIndex((m) => !z(m[u.axis]));
        h.hi += Math.max(0, g);
      }
      return h;
    }
  }
  return {
    lo: 0,
    hi: r.length - 1
  };
}
function Fn(n, t, e, i, s) {
  const r = n.getSortedVisibleDatasetMetas(), o = e[t];
  for (let a = 0, c = r.length; a < c; ++a) {
    const { index: l, data: h } = r[a], { lo: u, hi: d } = kl(r[a], t, o, s);
    for (let f = u; f <= d; ++f) {
      const g = h[f];
      g.skip || i(g, l, f);
    }
  }
}
function Dl(n) {
  const t = n.indexOf("x") !== -1, e = n.indexOf("y") !== -1;
  return function(i, s) {
    const r = t ? Math.abs(i.x - s.x) : 0, o = e ? Math.abs(i.y - s.y) : 0;
    return Math.sqrt(Math.pow(r, 2) + Math.pow(o, 2));
  };
}
function Gn(n, t, e, i, s) {
  const r = [];
  return !s && !n.isPointInArea(t) || Fn(n, e, t, function(a, c, l) {
    !s && !je(a, n.chartArea, 0) || a.inRange(t.x, t.y, i) && r.push({
      element: a,
      datasetIndex: c,
      index: l
    });
  }, !0), r;
}
function Pl(n, t, e, i) {
  let s = [];
  function r(o, a, c) {
    const { startAngle: l, endAngle: h } = o.getProps([
      "startAngle",
      "endAngle"
    ], i), { angle: u } = Za(o, {
      x: t.x,
      y: t.y
    });
    Fr(u, l, h) && s.push({
      element: o,
      datasetIndex: a,
      index: c
    });
  }
  return Fn(n, e, t, r), s;
}
function Sl(n, t, e, i, s, r) {
  let o = [];
  const a = Dl(e);
  let c = Number.POSITIVE_INFINITY;
  function l(h, u, d) {
    const f = h.inRange(t.x, t.y, s);
    if (i && !f)
      return;
    const g = h.getCenterPoint(s);
    if (!(!!r || n.isPointInArea(g)) && !f)
      return;
    const p = a(t, g);
    p < c ? (o = [
      {
        element: h,
        datasetIndex: u,
        index: d
      }
    ], c = p) : p === c && o.push({
      element: h,
      datasetIndex: u,
      index: d
    });
  }
  return Fn(n, e, t, l), o;
}
function Kn(n, t, e, i, s, r) {
  return !r && !n.isPointInArea(t) ? [] : e === "r" && !i ? Pl(n, t, e, s) : Sl(n, t, e, i, s, r);
}
function Cs(n, t, e, i, s) {
  const r = [], o = e === "x" ? "inXRange" : "inYRange";
  let a = !1;
  return Fn(n, e, t, (c, l, h) => {
    c[o] && c[o](t[e], s) && (r.push({
      element: c,
      datasetIndex: l,
      index: h
    }), a = a || c.inRange(t.x, t.y, s));
  }), i && !a ? [] : r;
}
var Ol = {
  modes: {
    index(n, t, e, i) {
      const s = Wt(t, n), r = e.axis || "x", o = e.includeInvisible || !1, a = e.intersect ? Gn(n, s, r, i, o) : Kn(n, s, r, !1, i, o), c = [];
      return a.length ? (n.getSortedVisibleDatasetMetas().forEach((l) => {
        const h = a[0].index, u = l.data[h];
        u && !u.skip && c.push({
          element: u,
          datasetIndex: l.index,
          index: h
        });
      }), c) : [];
    },
    dataset(n, t, e, i) {
      const s = Wt(t, n), r = e.axis || "xy", o = e.includeInvisible || !1;
      let a = e.intersect ? Gn(n, s, r, i, o) : Kn(n, s, r, !1, i, o);
      if (a.length > 0) {
        const c = a[0].datasetIndex, l = n.getDatasetMeta(c).data;
        a = [];
        for (let h = 0; h < l.length; ++h)
          a.push({
            element: l[h],
            datasetIndex: c,
            index: h
          });
      }
      return a;
    },
    point(n, t, e, i) {
      const s = Wt(t, n), r = e.axis || "xy", o = e.includeInvisible || !1;
      return Gn(n, s, r, i, o);
    },
    nearest(n, t, e, i) {
      const s = Wt(t, n), r = e.axis || "xy", o = e.includeInvisible || !1;
      return Kn(n, s, r, e.intersect, i, o);
    },
    x(n, t, e, i) {
      const s = Wt(t, n);
      return Cs(n, s, "x", e.intersect, i);
    },
    y(n, t, e, i) {
      const s = Wt(t, n);
      return Cs(n, s, "y", e.intersect, i);
    }
  }
};
const ro = [
  "left",
  "top",
  "right",
  "bottom"
];
function be(n, t) {
  return n.filter((e) => e.pos === t);
}
function As(n, t) {
  return n.filter((e) => ro.indexOf(e.pos) === -1 && e.box.axis === t);
}
function ye(n, t) {
  return n.sort((e, i) => {
    const s = t ? i : e, r = t ? e : i;
    return s.weight === r.weight ? s.index - r.index : s.weight - r.weight;
  });
}
function Tl(n) {
  const t = [];
  let e, i, s, r, o, a;
  for (e = 0, i = (n || []).length; e < i; ++e)
    s = n[e], { position: r, options: { stack: o, stackWeight: a = 1 } } = s, t.push({
      index: e,
      box: s,
      pos: r,
      horizontal: s.isHorizontal(),
      weight: s.weight,
      stack: o && r + o,
      stackWeight: a
    });
  return t;
}
function Cl(n) {
  const t = {};
  for (const e of n) {
    const { stack: i, pos: s, stackWeight: r } = e;
    if (!i || !ro.includes(s))
      continue;
    const o = t[i] || (t[i] = {
      count: 0,
      placed: 0,
      weight: 0,
      size: 0
    });
    o.count++, o.weight += r;
  }
  return t;
}
function Al(n, t) {
  const e = Cl(n), { vBoxMaxWidth: i, hBoxMaxHeight: s } = t;
  let r, o, a;
  for (r = 0, o = n.length; r < o; ++r) {
    a = n[r];
    const { fullSize: c } = a.box, l = e[a.stack], h = l && a.stackWeight / l.weight;
    a.horizontal ? (a.width = h ? h * i : c && t.availableWidth, a.height = s) : (a.width = i, a.height = h ? h * s : c && t.availableHeight);
  }
  return e;
}
function El(n) {
  const t = Tl(n), e = ye(t.filter((l) => l.box.fullSize), !0), i = ye(be(t, "left"), !0), s = ye(be(t, "right")), r = ye(be(t, "top"), !0), o = ye(be(t, "bottom")), a = As(t, "x"), c = As(t, "y");
  return {
    fullSize: e,
    leftAndTop: i.concat(r),
    rightAndBottom: s.concat(c).concat(o).concat(a),
    chartArea: be(t, "chartArea"),
    vertical: i.concat(s).concat(c),
    horizontal: r.concat(o).concat(a)
  };
}
function Es(n, t, e, i) {
  return Math.max(n[e], t[e]) + Math.max(n[i], t[i]);
}
function oo(n, t) {
  n.top = Math.max(n.top, t.top), n.left = Math.max(n.left, t.left), n.bottom = Math.max(n.bottom, t.bottom), n.right = Math.max(n.right, t.right);
}
function $l(n, t, e, i) {
  const { pos: s, box: r } = e, o = n.maxPadding;
  if (!E(s)) {
    e.size && (n[s] -= e.size);
    const u = i[e.stack] || {
      size: 0,
      count: 1
    };
    u.size = Math.max(u.size, e.horizontal ? r.height : r.width), e.size = u.size / u.count, n[s] += e.size;
  }
  r.getPadding && oo(o, r.getPadding());
  const a = Math.max(0, t.outerWidth - Es(o, n, "left", "right")), c = Math.max(0, t.outerHeight - Es(o, n, "top", "bottom")), l = a !== n.w, h = c !== n.h;
  return n.w = a, n.h = c, e.horizontal ? {
    same: l,
    other: h
  } : {
    same: h,
    other: l
  };
}
function Il(n) {
  const t = n.maxPadding;
  function e(i) {
    const s = Math.max(t[i] - n[i], 0);
    return n[i] += s, s;
  }
  n.y += e("top"), n.x += e("left"), e("right"), e("bottom");
}
function Ll(n, t) {
  const e = t.maxPadding;
  function i(s) {
    const r = {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0
    };
    return s.forEach((o) => {
      r[o] = Math.max(t[o], e[o]);
    }), r;
  }
  return i(n ? [
    "left",
    "right"
  ] : [
    "top",
    "bottom"
  ]);
}
function De(n, t, e, i) {
  const s = [];
  let r, o, a, c, l, h;
  for (r = 0, o = n.length, l = 0; r < o; ++r) {
    a = n[r], c = a.box, c.update(a.width || t.w, a.height || t.h, Ll(a.horizontal, t));
    const { same: u, other: d } = $l(t, e, a, i);
    l |= u && s.length, h = h || d, c.fullSize || s.push(a);
  }
  return l && De(s, t, e, i) || h;
}
function an(n, t, e, i, s) {
  n.top = e, n.left = t, n.right = t + i, n.bottom = e + s, n.width = i, n.height = s;
}
function $s(n, t, e, i) {
  const s = e.padding;
  let { x: r, y: o } = t;
  for (const a of n) {
    const c = a.box, l = i[a.stack] || {
      placed: 0,
      weight: 1
    }, h = a.stackWeight / l.weight || 1;
    if (a.horizontal) {
      const u = t.w * h, d = l.size || c.height;
      kn(l.start) && (o = l.start), c.fullSize ? an(c, s.left, o, e.outerWidth - s.right - s.left, d) : an(c, t.left + l.placed, o, u, d), l.start = o, l.placed += u, o = c.bottom;
    } else {
      const u = t.h * h, d = l.size || c.width;
      kn(l.start) && (r = l.start), c.fullSize ? an(c, r, s.top, d, e.outerHeight - s.bottom - s.top) : an(c, r, t.top + l.placed, d, u), l.start = r, l.placed += u, r = c.right;
    }
  }
  t.x = r, t.y = o;
}
var St = {
  addBox(n, t) {
    n.boxes || (n.boxes = []), t.fullSize = t.fullSize || !1, t.position = t.position || "top", t.weight = t.weight || 0, t._layers = t._layers || function() {
      return [
        {
          z: 0,
          draw(e) {
            t.draw(e);
          }
        }
      ];
    }, n.boxes.push(t);
  },
  removeBox(n, t) {
    const e = n.boxes ? n.boxes.indexOf(t) : -1;
    e !== -1 && n.boxes.splice(e, 1);
  },
  configure(n, t, e) {
    t.fullSize = e.fullSize, t.position = e.position, t.weight = e.weight;
  },
  update(n, t, e, i) {
    if (!n)
      return;
    const s = lt(n.options.layout.padding), r = Math.max(t - s.width, 0), o = Math.max(e - s.height, 0), a = El(n.boxes), c = a.vertical, l = a.horizontal;
    L(n.boxes, (m) => {
      typeof m.beforeLayout == "function" && m.beforeLayout();
    });
    const h = c.reduce((m, p) => p.box.options && p.box.options.display === !1 ? m : m + 1, 0) || 1, u = Object.freeze({
      outerWidth: t,
      outerHeight: e,
      padding: s,
      availableWidth: r,
      availableHeight: o,
      vBoxMaxWidth: r / 2 / h,
      hBoxMaxHeight: o / 2
    }), d = Object.assign({}, s);
    oo(d, lt(i));
    const f = Object.assign({
      maxPadding: d,
      w: r,
      h: o,
      x: s.left,
      y: s.top
    }, s), g = Al(c.concat(l), u);
    De(a.fullSize, f, u, g), De(c, f, u, g), De(l, f, u, g) && De(c, f, u, g), Il(f), $s(a.leftAndTop, f, u, g), f.x += f.w, f.y += f.h, $s(a.rightAndBottom, f, u, g), n.chartArea = {
      left: f.left,
      top: f.top,
      right: f.left + f.w,
      bottom: f.top + f.h,
      height: f.h,
      width: f.w
    }, L(a.chartArea, (m) => {
      const p = m.box;
      Object.assign(p, n.chartArea), p.update(f.w, f.h, {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      });
    });
  }
};
class ao {
  acquireContext(t, e) {
  }
  releaseContext(t) {
    return !1;
  }
  addEventListener(t, e, i) {
  }
  removeEventListener(t, e, i) {
  }
  getDevicePixelRatio() {
    return 1;
  }
  getMaximumSize(t, e, i, s) {
    return e = Math.max(0, e || t.width), i = i || t.height, {
      width: e,
      height: Math.max(0, s ? Math.floor(e / s) : i)
    };
  }
  isAttached(t) {
    return !0;
  }
  updateConfig(t) {
  }
}
class Fl extends ao {
  acquireContext(t) {
    return t && t.getContext && t.getContext("2d") || null;
  }
  updateConfig(t) {
    t.options.animation = !1;
  }
}
const bn = "$chartjs", zl = {
  touchstart: "mousedown",
  touchmove: "mousemove",
  touchend: "mouseup",
  pointerenter: "mouseenter",
  pointerdown: "mousedown",
  pointermove: "mousemove",
  pointerup: "mouseup",
  pointerleave: "mouseout",
  pointerout: "mouseout"
}, Is = (n) => n === null || n === "";
function Rl(n, t) {
  const e = n.style, i = n.getAttribute("height"), s = n.getAttribute("width");
  if (n[bn] = {
    initial: {
      height: i,
      width: s,
      style: {
        display: e.display,
        height: e.height,
        width: e.width
      }
    }
  }, e.display = e.display || "block", e.boxSizing = e.boxSizing || "border-box", Is(s)) {
    const r = xs(n, "width");
    r !== void 0 && (n.width = r);
  }
  if (Is(i))
    if (n.style.height === "")
      n.height = n.width / (t || 2);
    else {
      const r = xs(n, "height");
      r !== void 0 && (n.height = r);
    }
  return n;
}
const co = Zc ? {
  passive: !0
} : !1;
function Hl(n, t, e) {
  n && n.addEventListener(t, e, co);
}
function Nl(n, t, e) {
  n && n.canvas && n.canvas.removeEventListener(t, e, co);
}
function Wl(n, t) {
  const e = zl[n.type] || n.type, { x: i, y: s } = Wt(n, t);
  return {
    type: e,
    chart: t,
    native: n,
    x: i !== void 0 ? i : null,
    y: s !== void 0 ? s : null
  };
}
function On(n, t) {
  for (const e of n)
    if (e === t || e.contains(t))
      return !0;
}
function Bl(n, t, e) {
  const i = n.canvas, s = new MutationObserver((r) => {
    let o = !1;
    for (const a of r)
      o = o || On(a.addedNodes, i), o = o && !On(a.removedNodes, i);
    o && e();
  });
  return s.observe(document, {
    childList: !0,
    subtree: !0
  }), s;
}
function Yl(n, t, e) {
  const i = n.canvas, s = new MutationObserver((r) => {
    let o = !1;
    for (const a of r)
      o = o || On(a.removedNodes, i), o = o && !On(a.addedNodes, i);
    o && e();
  });
  return s.observe(document, {
    childList: !0,
    subtree: !0
  }), s;
}
const Ve = /* @__PURE__ */ new Map();
let Ls = 0;
function lo() {
  const n = window.devicePixelRatio;
  n !== Ls && (Ls = n, Ve.forEach((t, e) => {
    e.currentDevicePixelRatio !== n && t();
  }));
}
function jl(n, t) {
  Ve.size || window.addEventListener("resize", lo), Ve.set(n, t);
}
function Vl(n) {
  Ve.delete(n), Ve.size || window.removeEventListener("resize", lo);
}
function Ul(n, t, e) {
  const i = n.canvas, s = i && Ii(i);
  if (!s)
    return;
  const r = Hr((a, c) => {
    const l = s.clientWidth;
    e(a, c), l < s.clientWidth && e();
  }, window), o = new ResizeObserver((a) => {
    const c = a[0], l = c.contentRect.width, h = c.contentRect.height;
    l === 0 && h === 0 || r(l, h);
  });
  return o.observe(s), jl(n, r), o;
}
function Zn(n, t, e) {
  e && e.disconnect(), t === "resize" && Vl(n);
}
function ql(n, t, e) {
  const i = n.canvas, s = Hr((r) => {
    n.ctx !== null && e(Wl(r, n));
  }, n);
  return Hl(i, t, s), s;
}
class Xl extends ao {
  acquireContext(t, e) {
    const i = t && t.getContext && t.getContext("2d");
    return i && i.canvas === t ? (Rl(t, e), i) : null;
  }
  releaseContext(t) {
    const e = t.canvas;
    if (!e[bn])
      return !1;
    const i = e[bn].initial;
    [
      "height",
      "width"
    ].forEach((r) => {
      const o = i[r];
      z(o) ? e.removeAttribute(r) : e.setAttribute(r, o);
    });
    const s = i.style || {};
    return Object.keys(s).forEach((r) => {
      e.style[r] = s[r];
    }), e.width = e.width, delete e[bn], !0;
  }
  addEventListener(t, e, i) {
    this.removeEventListener(t, e);
    const s = t.$proxies || (t.$proxies = {}), o = {
      attach: Bl,
      detach: Yl,
      resize: Ul
    }[e] || ql;
    s[e] = o(t, e, i);
  }
  removeEventListener(t, e) {
    const i = t.$proxies || (t.$proxies = {}), s = i[e];
    if (!s)
      return;
    ({
      attach: Zn,
      detach: Zn,
      resize: Zn
    }[e] || Nl)(t, e, s), i[e] = void 0;
  }
  getDevicePixelRatio() {
    return window.devicePixelRatio;
  }
  getMaximumSize(t, e, i, s) {
    return Kc(t, e, i, s);
  }
  isAttached(t) {
    const e = t && Ii(t);
    return !!(e && e.isConnected);
  }
}
function Ql(n) {
  return !$i() || typeof OffscreenCanvas < "u" && n instanceof OffscreenCanvas ? Fl : Xl;
}
class Et {
  constructor() {
    y(this, "x");
    y(this, "y");
    y(this, "active", !1);
    y(this, "options");
    y(this, "$animations");
  }
  tooltipPosition(t) {
    const { x: e, y: i } = this.getProps([
      "x",
      "y"
    ], t);
    return {
      x: e,
      y: i
    };
  }
  hasValue() {
    return Ye(this.x) && Ye(this.y);
  }
  getProps(t, e) {
    const i = this.$animations;
    if (!e || !i)
      return this;
    const s = {};
    return t.forEach((r) => {
      s[r] = i[r] && i[r].active() ? i[r]._to : this[r];
    }), s;
  }
}
y(Et, "defaults", {}), y(Et, "defaultRoutes");
function Gl(n, t) {
  const e = n.options.ticks, i = Kl(n), s = Math.min(e.maxTicksLimit || i, i), r = e.major.enabled ? Jl(t) : [], o = r.length, a = r[0], c = r[o - 1], l = [];
  if (o > s)
    return th(t, l, r, o / s), l;
  const h = Zl(r, t, s);
  if (o > 0) {
    let u, d;
    const f = o > 1 ? Math.round((c - a) / (o - 1)) : null;
    for (cn(t, l, h, z(f) ? 0 : a - f, a), u = 0, d = o - 1; u < d; u++)
      cn(t, l, h, r[u], r[u + 1]);
    return cn(t, l, h, c, z(f) ? t.length : c + f), l;
  }
  return cn(t, l, h), l;
}
function Kl(n) {
  const t = n.options.offset, e = n._tickSize(), i = n._length / e + (t ? 0 : 1), s = n._maxLength / e;
  return Math.floor(Math.min(i, s));
}
function Zl(n, t, e) {
  const i = eh(n), s = t.length / e;
  if (!i)
    return Math.max(s, 1);
  const r = qa(i);
  for (let o = 0, a = r.length - 1; o < a; o++) {
    const c = r[o];
    if (c > s)
      return c;
  }
  return Math.max(s, 1);
}
function Jl(n) {
  const t = [];
  let e, i;
  for (e = 0, i = n.length; e < i; e++)
    n[e].major && t.push(e);
  return t;
}
function th(n, t, e, i) {
  let s = 0, r = e[0], o;
  for (i = Math.ceil(i), o = 0; o < n.length; o++)
    o === r && (t.push(n[o]), s++, r = e[s * i]);
}
function cn(n, t, e, i, s) {
  const r = A(i, 0), o = Math.min(A(s, n.length), n.length);
  let a = 0, c, l, h;
  for (e = Math.ceil(e), s && (c = s - i, e = c / Math.floor(c / e)), h = r; h < 0; )
    a++, h = Math.round(r + a * e);
  for (l = Math.max(r, 0); l < o; l++)
    l === h && (t.push(n[l]), a++, h = Math.round(r + a * e));
}
function eh(n) {
  const t = n.length;
  let e, i;
  if (t < 2)
    return !1;
  for (i = n[0], e = 1; e < t; ++e)
    if (n[e] - n[e - 1] !== i)
      return !1;
  return i;
}
const nh = (n) => n === "left" ? "right" : n === "right" ? "left" : n, Fs = (n, t, e) => t === "top" || t === "left" ? n[t] + e : n[t] - e, zs = (n, t) => Math.min(t || n, n);
function Rs(n, t) {
  const e = [], i = n.length / t, s = n.length;
  let r = 0;
  for (; r < s; r += i)
    e.push(n[Math.floor(r)]);
  return e;
}
function ih(n, t, e) {
  const i = n.ticks.length, s = Math.min(t, i - 1), r = n._startPixel, o = n._endPixel, a = 1e-6;
  let c = n.getPixelForTick(s), l;
  if (!(e && (i === 1 ? l = Math.max(c - r, o - c) : t === 0 ? l = (n.getPixelForTick(1) - c) / 2 : l = (c - n.getPixelForTick(s - 1)) / 2, c += s < t ? l : -l, c < r - a || c > o + a)))
    return c;
}
function sh(n, t) {
  L(n, (e) => {
    const i = e.gc, s = i.length / 2;
    let r;
    if (s > t) {
      for (r = 0; r < s; ++r)
        delete e.data[i[r]];
      i.splice(0, s);
    }
  });
}
function _e(n) {
  return n.drawTicks ? n.tickLength : 0;
}
function Hs(n, t) {
  if (!n.display)
    return 0;
  const e = it(n.font, t), i = lt(n.padding);
  return (X(n.text) ? n.text.length : 1) * e.lineHeight + i.height;
}
function rh(n, t) {
  return Kt(n, {
    scale: t,
    type: "scale"
  });
}
function oh(n, t, e) {
  return Kt(n, {
    tick: e,
    index: t,
    type: "tick"
  });
}
function ah(n, t, e) {
  let i = Nr(n);
  return (e && t !== "right" || !e && t === "right") && (i = nh(i)), i;
}
function ch(n, t, e, i) {
  const { top: s, left: r, bottom: o, right: a, chart: c } = n, { chartArea: l, scales: h } = c;
  let u = 0, d, f, g;
  const m = o - s, p = a - r;
  if (n.isHorizontal()) {
    if (f = st(i, r, a), E(e)) {
      const b = Object.keys(e)[0], _ = e[b];
      g = h[b].getPixelForValue(_) + m - t;
    } else e === "center" ? g = (l.bottom + l.top) / 2 + m - t : g = Fs(n, e, t);
    d = a - r;
  } else {
    if (E(e)) {
      const b = Object.keys(e)[0], _ = e[b];
      f = h[b].getPixelForValue(_) - p + t;
    } else e === "center" ? f = (l.left + l.right) / 2 - p + t : f = Fs(n, e, t);
    g = st(i, o, s), u = e === "left" ? -ot : ot;
  }
  return {
    titleX: f,
    titleY: g,
    maxWidth: d,
    rotation: u
  };
}
class Qe extends Et {
  constructor(t) {
    super(), this.id = t.id, this.type = t.type, this.options = void 0, this.ctx = t.ctx, this.chart = t.chart, this.top = void 0, this.bottom = void 0, this.left = void 0, this.right = void 0, this.width = void 0, this.height = void 0, this._margins = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }, this.maxWidth = void 0, this.maxHeight = void 0, this.paddingTop = void 0, this.paddingBottom = void 0, this.paddingLeft = void 0, this.paddingRight = void 0, this.axis = void 0, this.labelRotation = void 0, this.min = void 0, this.max = void 0, this._range = void 0, this.ticks = [], this._gridLineItems = null, this._labelItems = null, this._labelSizes = null, this._length = 0, this._maxLength = 0, this._longestTextCache = {}, this._startPixel = void 0, this._endPixel = void 0, this._reversePixels = !1, this._userMax = void 0, this._userMin = void 0, this._suggestedMax = void 0, this._suggestedMin = void 0, this._ticksLength = 0, this._borderValue = 0, this._cache = {}, this._dataLimitsCached = !1, this.$context = void 0;
  }
  init(t) {
    this.options = t.setContext(this.getContext()), this.axis = t.axis, this._userMin = this.parse(t.min), this._userMax = this.parse(t.max), this._suggestedMin = this.parse(t.suggestedMin), this._suggestedMax = this.parse(t.suggestedMax);
  }
  parse(t, e) {
    return t;
  }
  getUserBounds() {
    let { _userMin: t, _userMax: e, _suggestedMin: i, _suggestedMax: s } = this;
    return t = ht(t, Number.POSITIVE_INFINITY), e = ht(e, Number.NEGATIVE_INFINITY), i = ht(i, Number.POSITIVE_INFINITY), s = ht(s, Number.NEGATIVE_INFINITY), {
      min: ht(t, i),
      max: ht(e, s),
      minDefined: J(t),
      maxDefined: J(e)
    };
  }
  getMinMax(t) {
    let { min: e, max: i, minDefined: s, maxDefined: r } = this.getUserBounds(), o;
    if (s && r)
      return {
        min: e,
        max: i
      };
    const a = this.getMatchingVisibleMetas();
    for (let c = 0, l = a.length; c < l; ++c)
      o = a[c].controller.getMinMax(this, t), s || (e = Math.min(e, o.min)), r || (i = Math.max(i, o.max));
    return e = r && e > i ? i : e, i = s && e > i ? e : i, {
      min: ht(e, ht(i, e)),
      max: ht(i, ht(e, i))
    };
  }
  getPadding() {
    return {
      left: this.paddingLeft || 0,
      top: this.paddingTop || 0,
      right: this.paddingRight || 0,
      bottom: this.paddingBottom || 0
    };
  }
  getTicks() {
    return this.ticks;
  }
  getLabels() {
    const t = this.chart.data;
    return this.options.labels || (this.isHorizontal() ? t.xLabels : t.yLabels) || t.labels || [];
  }
  getLabelItems(t = this.chart.chartArea) {
    return this._labelItems || (this._labelItems = this._computeLabelItems(t));
  }
  beforeLayout() {
    this._cache = {}, this._dataLimitsCached = !1;
  }
  beforeUpdate() {
    F(this.options.beforeUpdate, [
      this
    ]);
  }
  update(t, e, i) {
    const { beginAtZero: s, grace: r, ticks: o } = this.options, a = o.sampleSize;
    this.beforeUpdate(), this.maxWidth = t, this.maxHeight = e, this._margins = i = Object.assign({
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }, i), this.ticks = null, this._labelSizes = null, this._gridLineItems = null, this._labelItems = null, this.beforeSetDimensions(), this.setDimensions(), this.afterSetDimensions(), this._maxLength = this.isHorizontal() ? this.width + i.left + i.right : this.height + i.top + i.bottom, this._dataLimitsCached || (this.beforeDataLimits(), this.determineDataLimits(), this.afterDataLimits(), this._range = Tc(this, r, s), this._dataLimitsCached = !0), this.beforeBuildTicks(), this.ticks = this.buildTicks() || [], this.afterBuildTicks();
    const c = a < this.ticks.length;
    this._convertTicksToLabels(c ? Rs(this.ticks, a) : this.ticks), this.configure(), this.beforeCalculateLabelRotation(), this.calculateLabelRotation(), this.afterCalculateLabelRotation(), o.display && (o.autoSkip || o.source === "auto") && (this.ticks = Gl(this, this.ticks), this._labelSizes = null, this.afterAutoSkip()), c && this._convertTicksToLabels(this.ticks), this.beforeFit(), this.fit(), this.afterFit(), this.afterUpdate();
  }
  configure() {
    let t = this.options.reverse, e, i;
    this.isHorizontal() ? (e = this.left, i = this.right) : (e = this.top, i = this.bottom, t = !t), this._startPixel = e, this._endPixel = i, this._reversePixels = t, this._length = i - e, this._alignToPixels = this.options.alignToPixels;
  }
  afterUpdate() {
    F(this.options.afterUpdate, [
      this
    ]);
  }
  beforeSetDimensions() {
    F(this.options.beforeSetDimensions, [
      this
    ]);
  }
  setDimensions() {
    this.isHorizontal() ? (this.width = this.maxWidth, this.left = 0, this.right = this.width) : (this.height = this.maxHeight, this.top = 0, this.bottom = this.height), this.paddingLeft = 0, this.paddingTop = 0, this.paddingRight = 0, this.paddingBottom = 0;
  }
  afterSetDimensions() {
    F(this.options.afterSetDimensions, [
      this
    ]);
  }
  _callHooks(t) {
    this.chart.notifyPlugins(t, this.getContext()), F(this.options[t], [
      this
    ]);
  }
  beforeDataLimits() {
    this._callHooks("beforeDataLimits");
  }
  determineDataLimits() {
  }
  afterDataLimits() {
    this._callHooks("afterDataLimits");
  }
  beforeBuildTicks() {
    this._callHooks("beforeBuildTicks");
  }
  buildTicks() {
    return [];
  }
  afterBuildTicks() {
    this._callHooks("afterBuildTicks");
  }
  beforeTickToLabelConversion() {
    F(this.options.beforeTickToLabelConversion, [
      this
    ]);
  }
  generateTickLabels(t) {
    const e = this.options.ticks;
    let i, s, r;
    for (i = 0, s = t.length; i < s; i++)
      r = t[i], r.label = F(e.callback, [
        r.value,
        i,
        t
      ], this);
  }
  afterTickToLabelConversion() {
    F(this.options.afterTickToLabelConversion, [
      this
    ]);
  }
  beforeCalculateLabelRotation() {
    F(this.options.beforeCalculateLabelRotation, [
      this
    ]);
  }
  calculateLabelRotation() {
    const t = this.options, e = t.ticks, i = zs(this.ticks.length, t.ticks.maxTicksLimit), s = e.minRotation || 0, r = e.maxRotation;
    let o = s, a, c, l;
    if (!this._isVisible() || !e.display || s >= r || i <= 1 || !this.isHorizontal()) {
      this.labelRotation = s;
      return;
    }
    const h = this._getLabelSizes(), u = h.widest.width, d = h.highest.height, f = at(this.chart.width - u, 0, this.maxWidth);
    a = t.offset ? this.maxWidth / i : f / (i - 1), u + 6 > a && (a = f / (i - (t.offset ? 0.5 : 1)), c = this.maxHeight - _e(t.grid) - e.padding - Hs(t.title, this.chart.options.font), l = Math.sqrt(u * u + d * d), o = Ka(Math.min(Math.asin(at((h.highest.height + 6) / a, -1, 1)), Math.asin(at(c / l, -1, 1)) - Math.asin(at(d / l, -1, 1)))), o = Math.max(s, Math.min(r, o))), this.labelRotation = o;
  }
  afterCalculateLabelRotation() {
    F(this.options.afterCalculateLabelRotation, [
      this
    ]);
  }
  afterAutoSkip() {
  }
  beforeFit() {
    F(this.options.beforeFit, [
      this
    ]);
  }
  fit() {
    const t = {
      width: 0,
      height: 0
    }, { chart: e, options: { ticks: i, title: s, grid: r } } = this, o = this._isVisible(), a = this.isHorizontal();
    if (o) {
      const c = Hs(s, e.options.font);
      if (a ? (t.width = this.maxWidth, t.height = _e(r) + c) : (t.height = this.maxHeight, t.width = _e(r) + c), i.display && this.ticks.length) {
        const { first: l, last: h, widest: u, highest: d } = this._getLabelSizes(), f = i.padding * 2, g = Vt(this.labelRotation), m = Math.cos(g), p = Math.sin(g);
        if (a) {
          const b = i.mirror ? 0 : p * u.width + m * d.height;
          t.height = Math.min(this.maxHeight, t.height + b + f);
        } else {
          const b = i.mirror ? 0 : m * u.width + p * d.height;
          t.width = Math.min(this.maxWidth, t.width + b + f);
        }
        this._calculatePadding(l, h, p, m);
      }
    }
    this._handleMargins(), a ? (this.width = this._length = e.width - this._margins.left - this._margins.right, this.height = t.height) : (this.width = t.width, this.height = this._length = e.height - this._margins.top - this._margins.bottom);
  }
  _calculatePadding(t, e, i, s) {
    const { ticks: { align: r, padding: o }, position: a } = this.options, c = this.labelRotation !== 0, l = a !== "top" && this.axis === "x";
    if (this.isHorizontal()) {
      const h = this.getPixelForTick(0) - this.left, u = this.right - this.getPixelForTick(this.ticks.length - 1);
      let d = 0, f = 0;
      c ? l ? (d = s * t.width, f = i * e.height) : (d = i * t.height, f = s * e.width) : r === "start" ? f = e.width : r === "end" ? d = t.width : r !== "inner" && (d = t.width / 2, f = e.width / 2), this.paddingLeft = Math.max((d - h + o) * this.width / (this.width - h), 0), this.paddingRight = Math.max((f - u + o) * this.width / (this.width - u), 0);
    } else {
      let h = e.height / 2, u = t.height / 2;
      r === "start" ? (h = 0, u = t.height) : r === "end" && (h = e.height, u = 0), this.paddingTop = h + o, this.paddingBottom = u + o;
    }
  }
  _handleMargins() {
    this._margins && (this._margins.left = Math.max(this.paddingLeft, this._margins.left), this._margins.top = Math.max(this.paddingTop, this._margins.top), this._margins.right = Math.max(this.paddingRight, this._margins.right), this._margins.bottom = Math.max(this.paddingBottom, this._margins.bottom));
  }
  afterFit() {
    F(this.options.afterFit, [
      this
    ]);
  }
  isHorizontal() {
    const { axis: t, position: e } = this.options;
    return e === "top" || e === "bottom" || t === "x";
  }
  isFullSize() {
    return this.options.fullSize;
  }
  _convertTicksToLabels(t) {
    this.beforeTickToLabelConversion(), this.generateTickLabels(t);
    let e, i;
    for (e = 0, i = t.length; e < i; e++)
      z(t[e].label) && (t.splice(e, 1), i--, e--);
    this.afterTickToLabelConversion();
  }
  _getLabelSizes() {
    let t = this._labelSizes;
    if (!t) {
      const e = this.options.ticks.sampleSize;
      let i = this.ticks;
      e < i.length && (i = Rs(i, e)), this._labelSizes = t = this._computeLabelSizes(i, i.length, this.options.ticks.maxTicksLimit);
    }
    return t;
  }
  _computeLabelSizes(t, e, i) {
    const { ctx: s, _longestTextCache: r } = this, o = [], a = [], c = Math.floor(e / zs(e, i));
    let l = 0, h = 0, u, d, f, g, m, p, b, _, v, M, w;
    for (u = 0; u < e; u += c) {
      if (g = t[u].label, m = this._resolveTickFontOptions(u), s.font = p = m.string, b = r[p] = r[p] || {
        data: {},
        gc: []
      }, _ = m.lineHeight, v = M = 0, !z(g) && !X(g))
        v = ms(s, b.data, b.gc, v, g), M = _;
      else if (X(g))
        for (d = 0, f = g.length; d < f; ++d)
          w = g[d], !z(w) && !X(w) && (v = ms(s, b.data, b.gc, v, w), M += _);
      o.push(v), a.push(M), l = Math.max(v, l), h = Math.max(M, h);
    }
    sh(r, e);
    const P = o.indexOf(l), k = a.indexOf(h), x = (D) => ({
      width: o[D] || 0,
      height: a[D] || 0
    });
    return {
      first: x(0),
      last: x(e - 1),
      widest: x(P),
      highest: x(k),
      widths: o,
      heights: a
    };
  }
  getLabelForValue(t) {
    return t;
  }
  getPixelForValue(t, e) {
    return NaN;
  }
  getValueForPixel(t) {
  }
  getPixelForTick(t) {
    const e = this.ticks;
    return t < 0 || t > e.length - 1 ? null : this.getPixelForValue(e[t].value);
  }
  getPixelForDecimal(t) {
    this._reversePixels && (t = 1 - t);
    const e = this._startPixel + t * this._length;
    return tc(this._alignToPixels ? Ht(this.chart, e, 0) : e);
  }
  getDecimalForPixel(t) {
    const e = (t - this._startPixel) / this._length;
    return this._reversePixels ? 1 - e : e;
  }
  getBasePixel() {
    return this.getPixelForValue(this.getBaseValue());
  }
  getBaseValue() {
    const { min: t, max: e } = this;
    return t < 0 && e < 0 ? e : t > 0 && e > 0 ? t : 0;
  }
  getContext(t) {
    const e = this.ticks || [];
    if (t >= 0 && t < e.length) {
      const i = e[t];
      return i.$context || (i.$context = oh(this.getContext(), t, i));
    }
    return this.$context || (this.$context = rh(this.chart.getContext(), this));
  }
  _tickSize() {
    const t = this.options.ticks, e = Vt(this.labelRotation), i = Math.abs(Math.cos(e)), s = Math.abs(Math.sin(e)), r = this._getLabelSizes(), o = t.autoSkipPadding || 0, a = r ? r.widest.width + o : 0, c = r ? r.highest.height + o : 0;
    return this.isHorizontal() ? c * i > a * s ? a / i : c / s : c * s < a * i ? c / i : a / s;
  }
  _isVisible() {
    const t = this.options.display;
    return t !== "auto" ? !!t : this.getMatchingVisibleMetas().length > 0;
  }
  _computeGridLineItems(t) {
    const e = this.axis, i = this.chart, s = this.options, { grid: r, position: o, border: a } = s, c = r.offset, l = this.isHorizontal(), u = this.ticks.length + (c ? 1 : 0), d = _e(r), f = [], g = a.setContext(this.getContext()), m = g.display ? g.width : 0, p = m / 2, b = function(U) {
      return Ht(i, U, m);
    };
    let _, v, M, w, P, k, x, D, O, S, C, V;
    if (o === "top")
      _ = b(this.bottom), k = this.bottom - d, D = _ - p, S = b(t.top) + p, V = t.bottom;
    else if (o === "bottom")
      _ = b(this.top), S = t.top, V = b(t.bottom) - p, k = _ + p, D = this.top + d;
    else if (o === "left")
      _ = b(this.right), P = this.right - d, x = _ - p, O = b(t.left) + p, C = t.right;
    else if (o === "right")
      _ = b(this.left), O = t.left, C = b(t.right) - p, P = _ + p, x = this.left + d;
    else if (e === "x") {
      if (o === "center")
        _ = b((t.top + t.bottom) / 2 + 0.5);
      else if (E(o)) {
        const U = Object.keys(o)[0], tt = o[U];
        _ = b(this.chart.scales[U].getPixelForValue(tt));
      }
      S = t.top, V = t.bottom, k = _ + p, D = k + d;
    } else if (e === "y") {
      if (o === "center")
        _ = b((t.left + t.right) / 2);
      else if (E(o)) {
        const U = Object.keys(o)[0], tt = o[U];
        _ = b(this.chart.scales[U].getPixelForValue(tt));
      }
      P = _ - p, x = P - d, O = t.left, C = t.right;
    }
    const G = A(s.ticks.maxTicksLimit, u), R = Math.max(1, Math.ceil(u / G));
    for (v = 0; v < u; v += R) {
      const U = this.getContext(v), tt = r.setContext(U), $t = a.setContext(U), It = tt.lineWidth, K = tt.color, te = $t.dash || [], vt = $t.dashOffset, fe = tt.tickWidth, Lt = tt.tickColor, ge = tt.tickBorderDash || [], Ft = tt.tickBorderDashOffset;
      M = ih(this, v, c), M !== void 0 && (w = Ht(i, M, It), l ? P = x = O = C = w : k = D = S = V = w, f.push({
        tx1: P,
        ty1: k,
        tx2: x,
        ty2: D,
        x1: O,
        y1: S,
        x2: C,
        y2: V,
        width: It,
        color: K,
        borderDash: te,
        borderDashOffset: vt,
        tickWidth: fe,
        tickColor: Lt,
        tickBorderDash: ge,
        tickBorderDashOffset: Ft
      }));
    }
    return this._ticksLength = u, this._borderValue = _, f;
  }
  _computeLabelItems(t) {
    const e = this.axis, i = this.options, { position: s, ticks: r } = i, o = this.isHorizontal(), a = this.ticks, { align: c, crossAlign: l, padding: h, mirror: u } = r, d = _e(i.grid), f = d + h, g = u ? -h : f, m = -Vt(this.labelRotation), p = [];
    let b, _, v, M, w, P, k, x, D, O, S, C, V = "middle";
    if (s === "top")
      P = this.bottom - g, k = this._getXAxisLabelAlignment();
    else if (s === "bottom")
      P = this.top + g, k = this._getXAxisLabelAlignment();
    else if (s === "left") {
      const R = this._getYAxisLabelAlignment(d);
      k = R.textAlign, w = R.x;
    } else if (s === "right") {
      const R = this._getYAxisLabelAlignment(d);
      k = R.textAlign, w = R.x;
    } else if (e === "x") {
      if (s === "center")
        P = (t.top + t.bottom) / 2 + f;
      else if (E(s)) {
        const R = Object.keys(s)[0], U = s[R];
        P = this.chart.scales[R].getPixelForValue(U) + f;
      }
      k = this._getXAxisLabelAlignment();
    } else if (e === "y") {
      if (s === "center")
        w = (t.left + t.right) / 2 - f;
      else if (E(s)) {
        const R = Object.keys(s)[0], U = s[R];
        w = this.chart.scales[R].getPixelForValue(U);
      }
      k = this._getYAxisLabelAlignment(d).textAlign;
    }
    e === "y" && (c === "start" ? V = "top" : c === "end" && (V = "bottom"));
    const G = this._getLabelSizes();
    for (b = 0, _ = a.length; b < _; ++b) {
      v = a[b], M = v.label;
      const R = r.setContext(this.getContext(b));
      x = this.getPixelForTick(b) + r.labelOffset, D = this._resolveTickFontOptions(b), O = D.lineHeight, S = X(M) ? M.length : 1;
      const U = S / 2, tt = R.color, $t = R.textStrokeColor, It = R.textStrokeWidth;
      let K = k;
      o ? (w = x, k === "inner" && (b === _ - 1 ? K = this.options.reverse ? "left" : "right" : b === 0 ? K = this.options.reverse ? "right" : "left" : K = "center"), s === "top" ? l === "near" || m !== 0 ? C = -S * O + O / 2 : l === "center" ? C = -G.highest.height / 2 - U * O + O : C = -G.highest.height + O / 2 : l === "near" || m !== 0 ? C = O / 2 : l === "center" ? C = G.highest.height / 2 - U * O : C = G.highest.height - S * O, u && (C *= -1), m !== 0 && !R.showLabelBackdrop && (w += O / 2 * Math.sin(m))) : (P = x, C = (1 - S) * O / 2);
      let te;
      if (R.showLabelBackdrop) {
        const vt = lt(R.backdropPadding), fe = G.heights[b], Lt = G.widths[b];
        let ge = C - vt.top, Ft = 0 - vt.left;
        switch (V) {
          case "middle":
            ge -= fe / 2;
            break;
          case "bottom":
            ge -= fe;
            break;
        }
        switch (k) {
          case "center":
            Ft -= Lt / 2;
            break;
          case "right":
            Ft -= Lt;
            break;
          case "inner":
            b === _ - 1 ? Ft -= Lt : b > 0 && (Ft -= Lt / 2);
            break;
        }
        te = {
          left: Ft,
          top: ge,
          width: Lt + vt.width,
          height: fe + vt.height,
          color: R.backdropColor
        };
      }
      p.push({
        label: M,
        font: D,
        textOffset: C,
        options: {
          rotation: m,
          color: tt,
          strokeColor: $t,
          strokeWidth: It,
          textAlign: K,
          textBaseline: V,
          translation: [
            w,
            P
          ],
          backdrop: te
        }
      });
    }
    return p;
  }
  _getXAxisLabelAlignment() {
    const { position: t, ticks: e } = this.options;
    if (-Vt(this.labelRotation))
      return t === "top" ? "left" : "right";
    let s = "center";
    return e.align === "start" ? s = "left" : e.align === "end" ? s = "right" : e.align === "inner" && (s = "inner"), s;
  }
  _getYAxisLabelAlignment(t) {
    const { position: e, ticks: { crossAlign: i, mirror: s, padding: r } } = this.options, o = this._getLabelSizes(), a = t + r, c = o.widest.width;
    let l, h;
    return e === "left" ? s ? (h = this.right + r, i === "near" ? l = "left" : i === "center" ? (l = "center", h += c / 2) : (l = "right", h += c)) : (h = this.right - a, i === "near" ? l = "right" : i === "center" ? (l = "center", h -= c / 2) : (l = "left", h = this.left)) : e === "right" ? s ? (h = this.left + r, i === "near" ? l = "right" : i === "center" ? (l = "center", h -= c / 2) : (l = "left", h -= c)) : (h = this.left + a, i === "near" ? l = "left" : i === "center" ? (l = "center", h += c / 2) : (l = "right", h = this.right)) : l = "right", {
      textAlign: l,
      x: h
    };
  }
  _computeLabelArea() {
    if (this.options.ticks.mirror)
      return;
    const t = this.chart, e = this.options.position;
    if (e === "left" || e === "right")
      return {
        top: 0,
        left: this.left,
        bottom: t.height,
        right: this.right
      };
    if (e === "top" || e === "bottom")
      return {
        top: this.top,
        left: 0,
        bottom: this.bottom,
        right: t.width
      };
  }
  drawBackground() {
    const { ctx: t, options: { backgroundColor: e }, left: i, top: s, width: r, height: o } = this;
    e && (t.save(), t.fillStyle = e, t.fillRect(i, s, r, o), t.restore());
  }
  getLineWidthForValue(t) {
    const e = this.options.grid;
    if (!this._isVisible() || !e.display)
      return 0;
    const s = this.ticks.findIndex((r) => r.value === t);
    return s >= 0 ? e.setContext(this.getContext(s)).lineWidth : 0;
  }
  drawGrid(t) {
    const e = this.options.grid, i = this.ctx, s = this._gridLineItems || (this._gridLineItems = this._computeGridLineItems(t));
    let r, o;
    const a = (c, l, h) => {
      !h.width || !h.color || (i.save(), i.lineWidth = h.width, i.strokeStyle = h.color, i.setLineDash(h.borderDash || []), i.lineDashOffset = h.borderDashOffset, i.beginPath(), i.moveTo(c.x, c.y), i.lineTo(l.x, l.y), i.stroke(), i.restore());
    };
    if (e.display)
      for (r = 0, o = s.length; r < o; ++r) {
        const c = s[r];
        e.drawOnChartArea && a({
          x: c.x1,
          y: c.y1
        }, {
          x: c.x2,
          y: c.y2
        }, c), e.drawTicks && a({
          x: c.tx1,
          y: c.ty1
        }, {
          x: c.tx2,
          y: c.ty2
        }, {
          color: c.tickColor,
          width: c.tickWidth,
          borderDash: c.tickBorderDash,
          borderDashOffset: c.tickBorderDashOffset
        });
      }
  }
  drawBorder() {
    const { chart: t, ctx: e, options: { border: i, grid: s } } = this, r = i.setContext(this.getContext()), o = i.display ? r.width : 0;
    if (!o)
      return;
    const a = s.setContext(this.getContext(0)).lineWidth, c = this._borderValue;
    let l, h, u, d;
    this.isHorizontal() ? (l = Ht(t, this.left, o) - o / 2, h = Ht(t, this.right, a) + a / 2, u = d = c) : (u = Ht(t, this.top, o) - o / 2, d = Ht(t, this.bottom, a) + a / 2, l = h = c), e.save(), e.lineWidth = r.width, e.strokeStyle = r.color, e.beginPath(), e.moveTo(l, u), e.lineTo(h, d), e.stroke(), e.restore();
  }
  drawLabels(t) {
    if (!this.options.ticks.display)
      return;
    const i = this.ctx, s = this._computeLabelArea();
    s && $n(i, s);
    const r = this.getLabelItems(t);
    for (const o of r) {
      const a = o.options, c = o.font, l = o.label, h = o.textOffset;
      Pn(i, l, 0, h, c, a);
    }
    s && In(i);
  }
  drawTitle() {
    const { ctx: t, options: { position: e, title: i, reverse: s } } = this;
    if (!i.display)
      return;
    const r = it(i.font), o = lt(i.padding), a = i.align;
    let c = r.lineHeight / 2;
    e === "bottom" || e === "center" || E(e) ? (c += o.bottom, X(i.text) && (c += r.lineHeight * (i.text.length - 1))) : c += o.top;
    const { titleX: l, titleY: h, maxWidth: u, rotation: d } = ch(this, c, e, a);
    Pn(t, i.text, 0, 0, r, {
      color: i.color,
      maxWidth: u,
      rotation: d,
      textAlign: ah(a, e, s),
      textBaseline: "middle",
      translation: [
        l,
        h
      ]
    });
  }
  draw(t) {
    this._isVisible() && (this.drawBackground(), this.drawGrid(t), this.drawBorder(), this.drawTitle(), this.drawLabels(t));
  }
  _layers() {
    const t = this.options, e = t.ticks && t.ticks.z || 0, i = A(t.grid && t.grid.z, -1), s = A(t.border && t.border.z, 0);
    return !this._isVisible() || this.draw !== Qe.prototype.draw ? [
      {
        z: e,
        draw: (r) => {
          this.draw(r);
        }
      }
    ] : [
      {
        z: i,
        draw: (r) => {
          this.drawBackground(), this.drawGrid(r), this.drawTitle();
        }
      },
      {
        z: s,
        draw: () => {
          this.drawBorder();
        }
      },
      {
        z: e,
        draw: (r) => {
          this.drawLabels(r);
        }
      }
    ];
  }
  getMatchingVisibleMetas(t) {
    const e = this.chart.getSortedVisibleDatasetMetas(), i = this.axis + "AxisID", s = [];
    let r, o;
    for (r = 0, o = e.length; r < o; ++r) {
      const a = e[r];
      a[i] === this.id && (!t || a.type === t) && s.push(a);
    }
    return s;
  }
  _resolveTickFontOptions(t) {
    const e = this.options.ticks.setContext(this.getContext(t));
    return it(e.font);
  }
  _maxDigits() {
    const t = this._resolveTickFontOptions(0).lineHeight;
    return (this.isHorizontal() ? this.width : this.height) / t;
  }
}
class ln {
  constructor(t, e, i) {
    this.type = t, this.scope = e, this.override = i, this.items = /* @__PURE__ */ Object.create(null);
  }
  isForType(t) {
    return Object.prototype.isPrototypeOf.call(this.type.prototype, t.prototype);
  }
  register(t) {
    const e = Object.getPrototypeOf(t);
    let i;
    uh(e) && (i = this.register(e));
    const s = this.items, r = t.id, o = this.scope + "." + r;
    if (!r)
      throw new Error("class does not have id: " + t);
    return r in s || (s[r] = t, lh(t, o, i), this.override && B.override(t.id, t.overrides)), o;
  }
  get(t) {
    return this.items[t];
  }
  unregister(t) {
    const e = this.items, i = t.id, s = this.scope;
    i in e && delete e[i], s && i in B[s] && (delete B[s][i], this.override && delete Gt[i]);
  }
}
function lh(n, t, e) {
  const i = Be(/* @__PURE__ */ Object.create(null), [
    e ? B.get(e) : {},
    B.get(t),
    n.defaults
  ]);
  B.set(t, i), n.defaultRoutes && hh(t, n.defaultRoutes), n.descriptors && B.describe(t, n.descriptors);
}
function hh(n, t) {
  Object.keys(t).forEach((e) => {
    const i = e.split("."), s = i.pop(), r = [
      n
    ].concat(i).join("."), o = t[e].split("."), a = o.pop(), c = o.join(".");
    B.route(r, s, c, a);
  });
}
function uh(n) {
  return "id" in n && "defaults" in n;
}
class dh {
  constructor() {
    this.controllers = new ln(Le, "datasets", !0), this.elements = new ln(Et, "elements"), this.plugins = new ln(Object, "plugins"), this.scales = new ln(Qe, "scales"), this._typedRegistries = [
      this.controllers,
      this.scales,
      this.elements
    ];
  }
  add(...t) {
    this._each("register", t);
  }
  remove(...t) {
    this._each("unregister", t);
  }
  addControllers(...t) {
    this._each("register", t, this.controllers);
  }
  addElements(...t) {
    this._each("register", t, this.elements);
  }
  addPlugins(...t) {
    this._each("register", t, this.plugins);
  }
  addScales(...t) {
    this._each("register", t, this.scales);
  }
  getController(t) {
    return this._get(t, this.controllers, "controller");
  }
  getElement(t) {
    return this._get(t, this.elements, "element");
  }
  getPlugin(t) {
    return this._get(t, this.plugins, "plugin");
  }
  getScale(t) {
    return this._get(t, this.scales, "scale");
  }
  removeControllers(...t) {
    this._each("unregister", t, this.controllers);
  }
  removeElements(...t) {
    this._each("unregister", t, this.elements);
  }
  removePlugins(...t) {
    this._each("unregister", t, this.plugins);
  }
  removeScales(...t) {
    this._each("unregister", t, this.scales);
  }
  _each(t, e, i) {
    [
      ...e
    ].forEach((s) => {
      const r = i || this._getRegistryForType(s);
      i || r.isForType(s) || r === this.plugins && s.id ? this._exec(t, r, s) : L(s, (o) => {
        const a = i || this._getRegistryForType(o);
        this._exec(t, a, o);
      });
    });
  }
  _exec(t, e, i) {
    const s = Si(t);
    F(i["before" + s], [], i), e[t](i), F(i["after" + s], [], i);
  }
  _getRegistryForType(t) {
    for (let e = 0; e < this._typedRegistries.length; e++) {
      const i = this._typedRegistries[e];
      if (i.isForType(t))
        return i;
    }
    return this.plugins;
  }
  _get(t, e, i) {
    const s = e.get(t);
    if (s === void 0)
      throw new Error('"' + t + '" is not a registered ' + i + ".");
    return s;
  }
}
var dt = /* @__PURE__ */ new dh();
class fh {
  constructor() {
    this._init = void 0;
  }
  notify(t, e, i, s) {
    if (e === "beforeInit" && (this._init = this._createDescriptors(t, !0), this._notify(this._init, t, "install")), this._init === void 0)
      return;
    const r = s ? this._descriptors(t).filter(s) : this._descriptors(t), o = this._notify(r, t, e, i);
    return e === "afterDestroy" && (this._notify(r, t, "stop"), this._notify(this._init, t, "uninstall"), this._init = void 0), o;
  }
  _notify(t, e, i, s) {
    s = s || {};
    for (const r of t) {
      const o = r.plugin, a = o[i], c = [
        e,
        s,
        r.options
      ];
      if (F(a, c, o) === !1 && s.cancelable)
        return !1;
    }
    return !0;
  }
  invalidate() {
    z(this._cache) || (this._oldCache = this._cache, this._cache = void 0);
  }
  _descriptors(t) {
    if (this._cache)
      return this._cache;
    const e = this._cache = this._createDescriptors(t);
    return this._notifyStateChanges(t), e;
  }
  _createDescriptors(t, e) {
    const i = t && t.config, s = A(i.options && i.options.plugins, {}), r = gh(i);
    return s === !1 && !e ? [] : ph(t, r, s, e);
  }
  _notifyStateChanges(t) {
    const e = this._oldCache || [], i = this._cache, s = (r, o) => r.filter((a) => !o.some((c) => a.plugin.id === c.plugin.id));
    this._notify(s(e, i), t, "stop"), this._notify(s(i, e), t, "start");
  }
}
function gh(n) {
  const t = {}, e = [], i = Object.keys(dt.plugins.items);
  for (let r = 0; r < i.length; r++)
    e.push(dt.getPlugin(i[r]));
  const s = n.plugins || [];
  for (let r = 0; r < s.length; r++) {
    const o = s[r];
    e.indexOf(o) === -1 && (e.push(o), t[o.id] = !0);
  }
  return {
    plugins: e,
    localIds: t
  };
}
function mh(n, t) {
  return !t && n === !1 ? null : n === !0 ? {} : n;
}
function ph(n, { plugins: t, localIds: e }, i, s) {
  const r = [], o = n.getContext();
  for (const a of t) {
    const c = a.id, l = mh(i[c], s);
    l !== null && r.push({
      plugin: a,
      options: bh(n.config, {
        plugin: a,
        local: e[c]
      }, l, o)
    });
  }
  return r;
}
function bh(n, { plugin: t, local: e }, i, s) {
  const r = n.pluginScopeKeys(t), o = n.getOptionScopes(i, r);
  return e && t.defaults && o.push(t.defaults), n.createResolver(o, s, [
    ""
  ], {
    scriptable: !1,
    indexable: !1,
    allKeys: !0
  });
}
function ui(n, t) {
  const e = B.datasets[n] || {};
  return ((t.datasets || {})[n] || {}).indexAxis || t.indexAxis || e.indexAxis || "x";
}
function yh(n, t) {
  let e = n;
  return n === "_index_" ? e = t : n === "_value_" && (e = t === "x" ? "y" : "x"), e;
}
function _h(n, t) {
  return n === t ? "_index_" : "_value_";
}
function Ns(n) {
  if (n === "x" || n === "y" || n === "r")
    return n;
}
function xh(n) {
  if (n === "top" || n === "bottom")
    return "x";
  if (n === "left" || n === "right")
    return "y";
}
function di(n, ...t) {
  if (Ns(n))
    return n;
  for (const e of t) {
    const i = e.axis || xh(e.position) || n.length > 1 && Ns(n[0].toLowerCase());
    if (i)
      return i;
  }
  throw new Error(`Cannot determine type of '${n}' axis. Please provide 'axis' or 'position' option.`);
}
function Ws(n, t, e) {
  if (e[t + "AxisID"] === n)
    return {
      axis: t
    };
}
function wh(n, t) {
  if (t.data && t.data.datasets) {
    const e = t.data.datasets.filter((i) => i.xAxisID === n || i.yAxisID === n);
    if (e.length)
      return Ws(n, "x", e[0]) || Ws(n, "y", e[0]);
  }
  return {};
}
function vh(n, t) {
  const e = Gt[n.type] || {
    scales: {}
  }, i = t.scales || {}, s = ui(n.type, t), r = /* @__PURE__ */ Object.create(null);
  return Object.keys(i).forEach((o) => {
    const a = i[o];
    if (!E(a))
      return console.error(`Invalid scale configuration for scale: ${o}`);
    if (a._proxy)
      return console.warn(`Ignoring resolver passed as options for scale: ${o}`);
    const c = di(o, a, wh(o, n), B.scales[a.type]), l = _h(c, s), h = e.scales || {};
    r[o] = Ce(/* @__PURE__ */ Object.create(null), [
      {
        axis: c
      },
      a,
      h[c],
      h[l]
    ]);
  }), n.data.datasets.forEach((o) => {
    const a = o.type || n.type, c = o.indexAxis || ui(a, t), h = (Gt[a] || {}).scales || {};
    Object.keys(h).forEach((u) => {
      const d = yh(u, c), f = o[d + "AxisID"] || d;
      r[f] = r[f] || /* @__PURE__ */ Object.create(null), Ce(r[f], [
        {
          axis: d
        },
        i[f],
        h[u]
      ]);
    });
  }), Object.keys(r).forEach((o) => {
    const a = r[o];
    Ce(a, [
      B.scales[a.type],
      B.scale
    ]);
  }), r;
}
function ho(n) {
  const t = n.options || (n.options = {});
  t.plugins = A(t.plugins, {}), t.scales = vh(n, t);
}
function uo(n) {
  return n = n || {}, n.datasets = n.datasets || [], n.labels = n.labels || [], n;
}
function Mh(n) {
  return n = n || {}, n.data = uo(n.data), ho(n), n;
}
const Bs = /* @__PURE__ */ new Map(), fo = /* @__PURE__ */ new Set();
function hn(n, t) {
  let e = Bs.get(n);
  return e || (e = t(), Bs.set(n, e), fo.add(e)), e;
}
const xe = (n, t, e) => {
  const i = Mn(t, e);
  i !== void 0 && n.add(i);
};
class kh {
  constructor(t) {
    this._config = Mh(t), this._scopeCache = /* @__PURE__ */ new Map(), this._resolverCache = /* @__PURE__ */ new Map();
  }
  get platform() {
    return this._config.platform;
  }
  get type() {
    return this._config.type;
  }
  set type(t) {
    this._config.type = t;
  }
  get data() {
    return this._config.data;
  }
  set data(t) {
    this._config.data = uo(t);
  }
  get options() {
    return this._config.options;
  }
  set options(t) {
    this._config.options = t;
  }
  get plugins() {
    return this._config.plugins;
  }
  update() {
    const t = this._config;
    this.clearCache(), ho(t);
  }
  clearCache() {
    this._scopeCache.clear(), this._resolverCache.clear();
  }
  datasetScopeKeys(t) {
    return hn(t, () => [
      [
        `datasets.${t}`,
        ""
      ]
    ]);
  }
  datasetAnimationScopeKeys(t, e) {
    return hn(`${t}.transition.${e}`, () => [
      [
        `datasets.${t}.transitions.${e}`,
        `transitions.${e}`
      ],
      [
        `datasets.${t}`,
        ""
      ]
    ]);
  }
  datasetElementScopeKeys(t, e) {
    return hn(`${t}-${e}`, () => [
      [
        `datasets.${t}.elements.${e}`,
        `datasets.${t}`,
        `elements.${e}`,
        ""
      ]
    ]);
  }
  pluginScopeKeys(t) {
    const e = t.id, i = this.type;
    return hn(`${i}-plugin-${e}`, () => [
      [
        `plugins.${e}`,
        ...t.additionalOptionScopes || []
      ]
    ]);
  }
  _cachedScopes(t, e) {
    const i = this._scopeCache;
    let s = i.get(t);
    return (!s || e) && (s = /* @__PURE__ */ new Map(), i.set(t, s)), s;
  }
  getOptionScopes(t, e, i) {
    const { options: s, type: r } = this, o = this._cachedScopes(t, i), a = o.get(e);
    if (a)
      return a;
    const c = /* @__PURE__ */ new Set();
    e.forEach((h) => {
      t && (c.add(t), h.forEach((u) => xe(c, t, u))), h.forEach((u) => xe(c, s, u)), h.forEach((u) => xe(c, Gt[r] || {}, u)), h.forEach((u) => xe(c, B, u)), h.forEach((u) => xe(c, ci, u));
    });
    const l = Array.from(c);
    return l.length === 0 && l.push(/* @__PURE__ */ Object.create(null)), fo.has(e) && o.set(e, l), l;
  }
  chartOptionScopes() {
    const { options: t, type: e } = this;
    return [
      t,
      Gt[e] || {},
      B.datasets[e] || {},
      {
        type: e
      },
      B,
      ci
    ];
  }
  resolveNamedOptions(t, e, i, s = [
    ""
  ]) {
    const r = {
      $shared: !0
    }, { resolver: o, subPrefixes: a } = Ys(this._resolverCache, t, s);
    let c = o;
    if (Ph(o, e)) {
      r.$shared = !1, i = At(i) ? i() : i;
      const l = this.createResolver(t, i, a);
      c = he(o, i, l);
    }
    for (const l of e)
      r[l] = c[l];
    return r;
  }
  createResolver(t, e, i = [
    ""
  ], s) {
    const { resolver: r } = Ys(this._resolverCache, t, i);
    return E(e) ? he(r, e, void 0, s) : r;
  }
}
function Ys(n, t, e) {
  let i = n.get(t);
  i || (i = /* @__PURE__ */ new Map(), n.set(t, i));
  const s = e.join();
  let r = i.get(s);
  return r || (r = {
    resolver: Ci(t, e),
    subPrefixes: e.filter((a) => !a.toLowerCase().includes("hover"))
  }, i.set(s, r)), r;
}
const Dh = (n) => E(n) && Object.getOwnPropertyNames(n).some((t) => At(n[t]));
function Ph(n, t) {
  const { isScriptable: e, isIndexable: i } = Vr(n);
  for (const s of t) {
    const r = e(s), o = i(s), a = (o || r) && n[s];
    if (r && (At(a) || Dh(a)) || o && X(a))
      return !0;
  }
  return !1;
}
var Sh = "4.5.1";
const Oh = [
  "top",
  "bottom",
  "left",
  "right",
  "chartArea"
];
function js(n, t) {
  return n === "top" || n === "bottom" || Oh.indexOf(n) === -1 && t === "x";
}
function Vs(n, t) {
  return function(e, i) {
    return e[n] === i[n] ? e[t] - i[t] : e[n] - i[n];
  };
}
function Us(n) {
  const t = n.chart, e = t.options.animation;
  t.notifyPlugins("afterRender"), F(e && e.onComplete, [
    n
  ], t);
}
function Th(n) {
  const t = n.chart, e = t.options.animation;
  F(e && e.onProgress, [
    n
  ], t);
}
function go(n) {
  return $i() && typeof n == "string" ? n = document.getElementById(n) : n && n.length && (n = n[0]), n && n.canvas && (n = n.canvas), n;
}
const yn = {}, qs = (n) => {
  const t = go(n);
  return Object.values(yn).filter((e) => e.canvas === t).pop();
};
function Ch(n, t, e) {
  const i = Object.keys(n);
  for (const s of i) {
    const r = +s;
    if (r >= t) {
      const o = n[s];
      delete n[s], (e > 0 || r > t) && (n[r + e] = o);
    }
  }
}
function Ah(n, t, e, i) {
  return !e || n.type === "mouseout" ? null : i ? t : n;
}
class wt {
  static register(...t) {
    dt.add(...t), Xs();
  }
  static unregister(...t) {
    dt.remove(...t), Xs();
  }
  constructor(t, e) {
    const i = this.config = new kh(e), s = go(t), r = qs(s);
    if (r)
      throw new Error("Canvas is already in use. Chart with ID '" + r.id + "' must be destroyed before the canvas with ID '" + r.canvas.id + "' can be reused.");
    const o = i.createResolver(i.chartOptionScopes(), this.getContext());
    this.platform = new (i.platform || Ql(s))(), this.platform.updateConfig(i);
    const a = this.platform.acquireContext(s, o.aspectRatio), c = a && a.canvas, l = c && c.height, h = c && c.width;
    if (this.id = Ra(), this.ctx = a, this.canvas = c, this.width = h, this.height = l, this._options = o, this._aspectRatio = this.aspectRatio, this._layers = [], this._metasets = [], this._stacks = void 0, this.boxes = [], this.currentDevicePixelRatio = void 0, this.chartArea = void 0, this._active = [], this._lastEvent = void 0, this._listeners = {}, this._responsiveListeners = void 0, this._sortedMetasets = [], this.scales = {}, this._plugins = new fh(), this.$proxies = {}, this._hiddenIndices = {}, this.attached = !1, this._animationsDisabled = void 0, this.$context = void 0, this._doResize = rc((u) => this.update(u), o.resizeDelay || 0), this._dataChanges = [], yn[this.id] = this, !a || !c) {
      console.error("Failed to create chart: can't acquire context from the given item");
      return;
    }
    yt.listen(this, "complete", Us), yt.listen(this, "progress", Th), this._initialize(), this.attached && this.update();
  }
  get aspectRatio() {
    const { options: { aspectRatio: t, maintainAspectRatio: e }, width: i, height: s, _aspectRatio: r } = this;
    return z(t) ? e && r ? r : s ? i / s : null : t;
  }
  get data() {
    return this.config.data;
  }
  set data(t) {
    this.config.data = t;
  }
  get options() {
    return this._options;
  }
  set options(t) {
    this.config.options = t;
  }
  get registry() {
    return dt;
  }
  _initialize() {
    return this.notifyPlugins("beforeInit"), this.options.responsive ? this.resize() : _s(this, this.options.devicePixelRatio), this.bindEvents(), this.notifyPlugins("afterInit"), this;
  }
  clear() {
    return ps(this.canvas, this.ctx), this;
  }
  stop() {
    return yt.stop(this), this;
  }
  resize(t, e) {
    yt.running(this) ? this._resizeBeforeDraw = {
      width: t,
      height: e
    } : this._resize(t, e);
  }
  _resize(t, e) {
    const i = this.options, s = this.canvas, r = i.maintainAspectRatio && this.aspectRatio, o = this.platform.getMaximumSize(s, t, e, r), a = i.devicePixelRatio || this.platform.getDevicePixelRatio(), c = this.width ? "resize" : "attach";
    this.width = o.width, this.height = o.height, this._aspectRatio = this.aspectRatio, _s(this, a, !0) && (this.notifyPlugins("resize", {
      size: o
    }), F(i.onResize, [
      this,
      o
    ], this), this.attached && this._doResize(c) && this.render());
  }
  ensureScalesHaveIDs() {
    const e = this.options.scales || {};
    L(e, (i, s) => {
      i.id = s;
    });
  }
  buildOrUpdateScales() {
    const t = this.options, e = t.scales, i = this.scales, s = Object.keys(i).reduce((o, a) => (o[a] = !1, o), {});
    let r = [];
    e && (r = r.concat(Object.keys(e).map((o) => {
      const a = e[o], c = di(o, a), l = c === "r", h = c === "x";
      return {
        options: a,
        dposition: l ? "chartArea" : h ? "bottom" : "left",
        dtype: l ? "radialLinear" : h ? "category" : "linear"
      };
    }))), L(r, (o) => {
      const a = o.options, c = a.id, l = di(c, a), h = A(a.type, o.dtype);
      (a.position === void 0 || js(a.position, l) !== js(o.dposition)) && (a.position = o.dposition), s[c] = !0;
      let u = null;
      if (c in i && i[c].type === h)
        u = i[c];
      else {
        const d = dt.getScale(h);
        u = new d({
          id: c,
          type: h,
          ctx: this.ctx,
          chart: this
        }), i[u.id] = u;
      }
      u.init(a, t);
    }), L(s, (o, a) => {
      o || delete i[a];
    }), L(i, (o) => {
      St.configure(this, o, o.options), St.addBox(this, o);
    });
  }
  _updateMetasets() {
    const t = this._metasets, e = this.data.datasets.length, i = t.length;
    if (t.sort((s, r) => s.index - r.index), i > e) {
      for (let s = e; s < i; ++s)
        this._destroyDatasetMeta(s);
      t.splice(e, i - e);
    }
    this._sortedMetasets = t.slice(0).sort(Vs("order", "index"));
  }
  _removeUnreferencedMetasets() {
    const { _metasets: t, data: { datasets: e } } = this;
    t.length > e.length && delete this._stacks, t.forEach((i, s) => {
      e.filter((r) => r === i._dataset).length === 0 && this._destroyDatasetMeta(s);
    });
  }
  buildOrUpdateControllers() {
    const t = [], e = this.data.datasets;
    let i, s;
    for (this._removeUnreferencedMetasets(), i = 0, s = e.length; i < s; i++) {
      const r = e[i];
      let o = this.getDatasetMeta(i);
      const a = r.type || this.config.type;
      if (o.type && o.type !== a && (this._destroyDatasetMeta(i), o = this.getDatasetMeta(i)), o.type = a, o.indexAxis = r.indexAxis || ui(a, this.options), o.order = r.order || 0, o.index = i, o.label = "" + r.label, o.visible = this.isDatasetVisible(i), o.controller)
        o.controller.updateIndex(i), o.controller.linkScales();
      else {
        const c = dt.getController(a), { datasetElementType: l, dataElementType: h } = B.datasets[a];
        Object.assign(c, {
          dataElementType: dt.getElement(h),
          datasetElementType: l && dt.getElement(l)
        }), o.controller = new c(this, i), t.push(o.controller);
      }
    }
    return this._updateMetasets(), t;
  }
  _resetElements() {
    L(this.data.datasets, (t, e) => {
      this.getDatasetMeta(e).controller.reset();
    }, this);
  }
  reset() {
    this._resetElements(), this.notifyPlugins("reset");
  }
  update(t) {
    const e = this.config;
    e.update();
    const i = this._options = e.createResolver(e.chartOptionScopes(), this.getContext()), s = this._animationsDisabled = !i.animation;
    if (this._updateScales(), this._checkEventBindings(), this._updateHiddenIndices(), this._plugins.invalidate(), this.notifyPlugins("beforeUpdate", {
      mode: t,
      cancelable: !0
    }) === !1)
      return;
    const r = this.buildOrUpdateControllers();
    this.notifyPlugins("beforeElementsUpdate");
    let o = 0;
    for (let l = 0, h = this.data.datasets.length; l < h; l++) {
      const { controller: u } = this.getDatasetMeta(l), d = !s && r.indexOf(u) === -1;
      u.buildOrUpdateElements(d), o = Math.max(+u.getMaxOverflow(), o);
    }
    o = this._minPadding = i.layout.autoPadding ? o : 0, this._updateLayout(o), s || L(r, (l) => {
      l.reset();
    }), this._updateDatasets(t), this.notifyPlugins("afterUpdate", {
      mode: t
    }), this._layers.sort(Vs("z", "_idx"));
    const { _active: a, _lastEvent: c } = this;
    c ? this._eventHandler(c, !0) : a.length && this._updateHoverStyles(a, a, !0), this.render();
  }
  _updateScales() {
    L(this.scales, (t) => {
      St.removeBox(this, t);
    }), this.ensureScalesHaveIDs(), this.buildOrUpdateScales();
  }
  _checkEventBindings() {
    const t = this.options, e = new Set(Object.keys(this._listeners)), i = new Set(t.events);
    (!os(e, i) || !!this._responsiveListeners !== t.responsive) && (this.unbindEvents(), this.bindEvents());
  }
  _updateHiddenIndices() {
    const { _hiddenIndices: t } = this, e = this._getUniformDataChanges() || [];
    for (const { method: i, start: s, count: r } of e) {
      const o = i === "_removeElements" ? -r : r;
      Ch(t, s, o);
    }
  }
  _getUniformDataChanges() {
    const t = this._dataChanges;
    if (!t || !t.length)
      return;
    this._dataChanges = [];
    const e = this.data.datasets.length, i = (r) => new Set(t.filter((o) => o[0] === r).map((o, a) => a + "," + o.splice(1).join(","))), s = i(0);
    for (let r = 1; r < e; r++)
      if (!os(s, i(r)))
        return;
    return Array.from(s).map((r) => r.split(",")).map((r) => ({
      method: r[1],
      start: +r[2],
      count: +r[3]
    }));
  }
  _updateLayout(t) {
    if (this.notifyPlugins("beforeLayout", {
      cancelable: !0
    }) === !1)
      return;
    St.update(this, this.width, this.height, t);
    const e = this.chartArea, i = e.width <= 0 || e.height <= 0;
    this._layers = [], L(this.boxes, (s) => {
      i && s.position === "chartArea" || (s.configure && s.configure(), this._layers.push(...s._layers()));
    }, this), this._layers.forEach((s, r) => {
      s._idx = r;
    }), this.notifyPlugins("afterLayout");
  }
  _updateDatasets(t) {
    if (this.notifyPlugins("beforeDatasetsUpdate", {
      mode: t,
      cancelable: !0
    }) !== !1) {
      for (let e = 0, i = this.data.datasets.length; e < i; ++e)
        this.getDatasetMeta(e).controller.configure();
      for (let e = 0, i = this.data.datasets.length; e < i; ++e)
        this._updateDataset(e, At(t) ? t({
          datasetIndex: e
        }) : t);
      this.notifyPlugins("afterDatasetsUpdate", {
        mode: t
      });
    }
  }
  _updateDataset(t, e) {
    const i = this.getDatasetMeta(t), s = {
      meta: i,
      index: t,
      mode: e,
      cancelable: !0
    };
    this.notifyPlugins("beforeDatasetUpdate", s) !== !1 && (i.controller._update(e), s.cancelable = !1, this.notifyPlugins("afterDatasetUpdate", s));
  }
  render() {
    this.notifyPlugins("beforeRender", {
      cancelable: !0
    }) !== !1 && (yt.has(this) ? this.attached && !yt.running(this) && yt.start(this) : (this.draw(), Us({
      chart: this
    })));
  }
  draw() {
    let t;
    if (this._resizeBeforeDraw) {
      const { width: i, height: s } = this._resizeBeforeDraw;
      this._resizeBeforeDraw = null, this._resize(i, s);
    }
    if (this.clear(), this.width <= 0 || this.height <= 0 || this.notifyPlugins("beforeDraw", {
      cancelable: !0
    }) === !1)
      return;
    const e = this._layers;
    for (t = 0; t < e.length && e[t].z <= 0; ++t)
      e[t].draw(this.chartArea);
    for (this._drawDatasets(); t < e.length; ++t)
      e[t].draw(this.chartArea);
    this.notifyPlugins("afterDraw");
  }
  _getSortedDatasetMetas(t) {
    const e = this._sortedMetasets, i = [];
    let s, r;
    for (s = 0, r = e.length; s < r; ++s) {
      const o = e[s];
      (!t || o.visible) && i.push(o);
    }
    return i;
  }
  getSortedVisibleDatasetMetas() {
    return this._getSortedDatasetMetas(!0);
  }
  _drawDatasets() {
    if (this.notifyPlugins("beforeDatasetsDraw", {
      cancelable: !0
    }) === !1)
      return;
    const t = this.getSortedVisibleDatasetMetas();
    for (let e = t.length - 1; e >= 0; --e)
      this._drawDataset(t[e]);
    this.notifyPlugins("afterDatasetsDraw");
  }
  _drawDataset(t) {
    const e = this.ctx, i = {
      meta: t,
      index: t.index,
      cancelable: !0
    }, s = eo(this, t);
    this.notifyPlugins("beforeDatasetDraw", i) !== !1 && (s && $n(e, s), t.controller.draw(), s && In(e), i.cancelable = !1, this.notifyPlugins("afterDatasetDraw", i));
  }
  isPointInArea(t) {
    return je(t, this.chartArea, this._minPadding);
  }
  getElementsAtEventForMode(t, e, i, s) {
    const r = Ol.modes[e];
    return typeof r == "function" ? r(this, t, i, s) : [];
  }
  getDatasetMeta(t) {
    const e = this.data.datasets[t], i = this._metasets;
    let s = i.filter((r) => r && r._dataset === e).pop();
    return s || (s = {
      type: null,
      data: [],
      dataset: null,
      controller: null,
      hidden: null,
      xAxisID: null,
      yAxisID: null,
      order: e && e.order || 0,
      index: t,
      _dataset: e,
      _parsed: [],
      _sorted: !1
    }, i.push(s)), s;
  }
  getContext() {
    return this.$context || (this.$context = Kt(null, {
      chart: this,
      type: "chart"
    }));
  }
  getVisibleDatasetCount() {
    return this.getSortedVisibleDatasetMetas().length;
  }
  isDatasetVisible(t) {
    const e = this.data.datasets[t];
    if (!e)
      return !1;
    const i = this.getDatasetMeta(t);
    return typeof i.hidden == "boolean" ? !i.hidden : !e.hidden;
  }
  setDatasetVisibility(t, e) {
    const i = this.getDatasetMeta(t);
    i.hidden = !e;
  }
  toggleDataVisibility(t) {
    this._hiddenIndices[t] = !this._hiddenIndices[t];
  }
  getDataVisibility(t) {
    return !this._hiddenIndices[t];
  }
  _updateVisibility(t, e, i) {
    const s = i ? "show" : "hide", r = this.getDatasetMeta(t), o = r.controller._resolveAnimations(void 0, s);
    kn(e) ? (r.data[e].hidden = !i, this.update()) : (this.setDatasetVisibility(t, i), o.update(r, {
      visible: i
    }), this.update((a) => a.datasetIndex === t ? s : void 0));
  }
  hide(t, e) {
    this._updateVisibility(t, e, !1);
  }
  show(t, e) {
    this._updateVisibility(t, e, !0);
  }
  _destroyDatasetMeta(t) {
    const e = this._metasets[t];
    e && e.controller && e.controller._destroy(), delete this._metasets[t];
  }
  _stop() {
    let t, e;
    for (this.stop(), yt.remove(this), t = 0, e = this.data.datasets.length; t < e; ++t)
      this._destroyDatasetMeta(t);
  }
  destroy() {
    this.notifyPlugins("beforeDestroy");
    const { canvas: t, ctx: e } = this;
    this._stop(), this.config.clearCache(), t && (this.unbindEvents(), ps(t, e), this.platform.releaseContext(e), this.canvas = null, this.ctx = null), delete yn[this.id], this.notifyPlugins("afterDestroy");
  }
  toBase64Image(...t) {
    return this.canvas.toDataURL(...t);
  }
  bindEvents() {
    this.bindUserEvents(), this.options.responsive ? this.bindResponsiveEvents() : this.attached = !0;
  }
  bindUserEvents() {
    const t = this._listeners, e = this.platform, i = (r, o) => {
      e.addEventListener(this, r, o), t[r] = o;
    }, s = (r, o, a) => {
      r.offsetX = o, r.offsetY = a, this._eventHandler(r);
    };
    L(this.options.events, (r) => i(r, s));
  }
  bindResponsiveEvents() {
    this._responsiveListeners || (this._responsiveListeners = {});
    const t = this._responsiveListeners, e = this.platform, i = (c, l) => {
      e.addEventListener(this, c, l), t[c] = l;
    }, s = (c, l) => {
      t[c] && (e.removeEventListener(this, c, l), delete t[c]);
    }, r = (c, l) => {
      this.canvas && this.resize(c, l);
    };
    let o;
    const a = () => {
      s("attach", a), this.attached = !0, this.resize(), i("resize", r), i("detach", o);
    };
    o = () => {
      this.attached = !1, s("resize", r), this._stop(), this._resize(0, 0), i("attach", a);
    }, e.isAttached(this.canvas) ? a() : o();
  }
  unbindEvents() {
    L(this._listeners, (t, e) => {
      this.platform.removeEventListener(this, e, t);
    }), this._listeners = {}, L(this._responsiveListeners, (t, e) => {
      this.platform.removeEventListener(this, e, t);
    }), this._responsiveListeners = void 0;
  }
  updateHoverStyle(t, e, i) {
    const s = i ? "set" : "remove";
    let r, o, a, c;
    for (e === "dataset" && (r = this.getDatasetMeta(t[0].datasetIndex), r.controller["_" + s + "DatasetHoverStyle"]()), a = 0, c = t.length; a < c; ++a) {
      o = t[a];
      const l = o && this.getDatasetMeta(o.datasetIndex).controller;
      l && l[s + "HoverStyle"](o.element, o.datasetIndex, o.index);
    }
  }
  getActiveElements() {
    return this._active || [];
  }
  setActiveElements(t) {
    const e = this._active || [], i = t.map(({ datasetIndex: r, index: o }) => {
      const a = this.getDatasetMeta(r);
      if (!a)
        throw new Error("No dataset found at index " + r);
      return {
        datasetIndex: r,
        element: a.data[o],
        index: o
      };
    });
    !wn(i, e) && (this._active = i, this._lastEvent = null, this._updateHoverStyles(i, e));
  }
  notifyPlugins(t, e, i) {
    return this._plugins.notify(this, t, e, i);
  }
  isPluginEnabled(t) {
    return this._plugins._cache.filter((e) => e.plugin.id === t).length === 1;
  }
  _updateHoverStyles(t, e, i) {
    const s = this.options.hover, r = (c, l) => c.filter((h) => !l.some((u) => h.datasetIndex === u.datasetIndex && h.index === u.index)), o = r(e, t), a = i ? t : r(t, e);
    o.length && this.updateHoverStyle(o, s.mode, !1), a.length && s.mode && this.updateHoverStyle(a, s.mode, !0);
  }
  _eventHandler(t, e) {
    const i = {
      event: t,
      replay: e,
      cancelable: !0,
      inChartArea: this.isPointInArea(t)
    }, s = (o) => (o.options.events || this.options.events).includes(t.native.type);
    if (this.notifyPlugins("beforeEvent", i, s) === !1)
      return;
    const r = this._handleEvent(t, e, i.inChartArea);
    return i.cancelable = !1, this.notifyPlugins("afterEvent", i, s), (r || i.changed) && this.render(), this;
  }
  _handleEvent(t, e, i) {
    const { _active: s = [], options: r } = this, o = e, a = this._getActiveElements(t, s, i, o), c = ja(t), l = Ah(t, this._lastEvent, i, c);
    i && (this._lastEvent = null, F(r.onHover, [
      t,
      a,
      this
    ], this), c && F(r.onClick, [
      t,
      a,
      this
    ], this));
    const h = !wn(a, s);
    return (h || e) && (this._active = a, this._updateHoverStyles(a, s, e)), this._lastEvent = l, h;
  }
  _getActiveElements(t, e, i, s) {
    if (t.type === "mouseout")
      return [];
    if (!i)
      return e;
    const r = this.options.hover;
    return this.getElementsAtEventForMode(t, r.mode, r, s);
  }
}
y(wt, "defaults", B), y(wt, "instances", yn), y(wt, "overrides", Gt), y(wt, "registry", dt), y(wt, "version", Sh), y(wt, "getChart", qs);
function Xs() {
  return L(wt.instances, (n) => n._plugins.invalidate());
}
function mo(n, t, e = t) {
  n.lineCap = A(e.borderCapStyle, t.borderCapStyle), n.setLineDash(A(e.borderDash, t.borderDash)), n.lineDashOffset = A(e.borderDashOffset, t.borderDashOffset), n.lineJoin = A(e.borderJoinStyle, t.borderJoinStyle), n.lineWidth = A(e.borderWidth, t.borderWidth), n.strokeStyle = A(e.borderColor, t.borderColor);
}
function Eh(n, t, e) {
  n.lineTo(e.x, e.y);
}
function $h(n) {
  return n.stepped ? _c : n.tension || n.cubicInterpolationMode === "monotone" ? xc : Eh;
}
function po(n, t, e = {}) {
  const i = n.length, { start: s = 0, end: r = i - 1 } = e, { start: o, end: a } = t, c = Math.max(s, o), l = Math.min(r, a), h = s < o && r < o || s > a && r > a;
  return {
    count: i,
    start: c,
    loop: t.loop,
    ilen: l < c && !h ? i + l - c : l - c
  };
}
function Ih(n, t, e, i) {
  const { points: s, options: r } = t, { count: o, start: a, loop: c, ilen: l } = po(s, e, i), h = $h(r);
  let { move: u = !0, reverse: d } = i || {}, f, g, m;
  for (f = 0; f <= l; ++f)
    g = s[(a + (d ? l - f : f)) % o], !g.skip && (u ? (n.moveTo(g.x, g.y), u = !1) : h(n, m, g, d, r.stepped), m = g);
  return c && (g = s[(a + (d ? l : 0)) % o], h(n, m, g, d, r.stepped)), !!c;
}
function Lh(n, t, e, i) {
  const s = t.points, { count: r, start: o, ilen: a } = po(s, e, i), { move: c = !0, reverse: l } = i || {};
  let h = 0, u = 0, d, f, g, m, p, b;
  const _ = (M) => (o + (l ? a - M : M)) % r, v = () => {
    m !== p && (n.lineTo(h, p), n.lineTo(h, m), n.lineTo(h, b));
  };
  for (c && (f = s[_(0)], n.moveTo(f.x, f.y)), d = 0; d <= a; ++d) {
    if (f = s[_(d)], f.skip)
      continue;
    const M = f.x, w = f.y, P = M | 0;
    P === g ? (w < m ? m = w : w > p && (p = w), h = (u * h + M) / ++u) : (v(), n.lineTo(M, w), g = P, u = 0, m = p = w), b = w;
  }
  v();
}
function fi(n) {
  const t = n.options, e = t.borderDash && t.borderDash.length;
  return !n._decimated && !n._loop && !t.tension && t.cubicInterpolationMode !== "monotone" && !t.stepped && !e ? Lh : Ih;
}
function Fh(n) {
  return n.stepped ? Jc : n.tension || n.cubicInterpolationMode === "monotone" ? tl : Bt;
}
function zh(n, t, e, i) {
  let s = t._path;
  s || (s = t._path = new Path2D(), t.path(s, e, i) && s.closePath()), mo(n, t.options), n.stroke(s);
}
function Rh(n, t, e, i) {
  const { segments: s, options: r } = t, o = fi(t);
  for (const a of s)
    mo(n, r, a.style), n.beginPath(), o(n, t, a, {
      start: e,
      end: e + i - 1
    }) && n.closePath(), n.stroke();
}
const Hh = typeof Path2D == "function";
function Nh(n, t, e, i) {
  Hh && !t.options.segment ? zh(n, t, e, i) : Rh(n, t, e, i);
}
class Ot extends Et {
  constructor(t) {
    super(), this.animated = !0, this.options = void 0, this._chart = void 0, this._loop = void 0, this._fullLoop = void 0, this._path = void 0, this._points = void 0, this._segments = void 0, this._decimated = !1, this._pointsUpdated = !1, this._datasetIndex = void 0, t && Object.assign(this, t);
  }
  updateControlPoints(t, e) {
    const i = this.options;
    if ((i.tension || i.cubicInterpolationMode === "monotone") && !i.stepped && !this._pointsUpdated) {
      const s = i.spanGaps ? this._loop : this._fullLoop;
      Vc(this._points, i, t, s, e), this._pointsUpdated = !0;
    }
  }
  set points(t) {
    this._points = t, delete this._segments, delete this._path, this._pointsUpdated = !1;
  }
  get points() {
    return this._points;
  }
  get segments() {
    return this._segments || (this._segments = ol(this, this.options.segment));
  }
  first() {
    const t = this.segments, e = this.points;
    return t.length && e[t[0].start];
  }
  last() {
    const t = this.segments, e = this.points, i = t.length;
    return i && e[t[i - 1].end];
  }
  interpolate(t, e) {
    const i = this.options, s = t[e], r = this.points, o = to(this, {
      property: e,
      start: s,
      end: s
    });
    if (!o.length)
      return;
    const a = [], c = Fh(i);
    let l, h;
    for (l = 0, h = o.length; l < h; ++l) {
      const { start: u, end: d } = o[l], f = r[u], g = r[d];
      if (f === g) {
        a.push(f);
        continue;
      }
      const m = Math.abs((s - f[e]) / (g[e] - f[e])), p = c(f, g, m, i.stepped);
      p[e] = t[e], a.push(p);
    }
    return a.length === 1 ? a[0] : a;
  }
  pathSegment(t, e, i) {
    return fi(this)(t, this, e, i);
  }
  path(t, e, i) {
    const s = this.segments, r = fi(this);
    let o = this._loop;
    e = e || 0, i = i || this.points.length - e;
    for (const a of s)
      o &= r(t, this, a, {
        start: e,
        end: e + i - 1
      });
    return !!o;
  }
  draw(t, e, i, s) {
    const r = this.options || {};
    (this.points || []).length && r.borderWidth && (t.save(), Nh(t, this, i, s), t.restore()), this.animated && (this._pointsUpdated = !1, this._path = void 0);
  }
}
y(Ot, "id", "line"), y(Ot, "defaults", {
  borderCapStyle: "butt",
  borderDash: [],
  borderDashOffset: 0,
  borderJoinStyle: "miter",
  borderWidth: 3,
  capBezierPoints: !0,
  cubicInterpolationMode: "default",
  fill: !1,
  spanGaps: !1,
  stepped: !1,
  tension: 0
}), y(Ot, "defaultRoutes", {
  backgroundColor: "backgroundColor",
  borderColor: "borderColor"
}), y(Ot, "descriptors", {
  _scriptable: !0,
  _indexable: (t) => t !== "borderDash" && t !== "fill"
});
function Qs(n, t, e, i) {
  const s = n.options, { [e]: r } = n.getProps([
    e
  ], i);
  return Math.abs(t - r) < s.radius + s.hitRadius;
}
class _n extends Et {
  constructor(e) {
    super();
    y(this, "parsed");
    y(this, "skip");
    y(this, "stop");
    this.options = void 0, this.parsed = void 0, this.skip = void 0, this.stop = void 0, e && Object.assign(this, e);
  }
  inRange(e, i, s) {
    const r = this.options, { x: o, y: a } = this.getProps([
      "x",
      "y"
    ], s);
    return Math.pow(e - o, 2) + Math.pow(i - a, 2) < Math.pow(r.hitRadius + r.radius, 2);
  }
  inXRange(e, i) {
    return Qs(this, e, "x", i);
  }
  inYRange(e, i) {
    return Qs(this, e, "y", i);
  }
  getCenterPoint(e) {
    const { x: i, y: s } = this.getProps([
      "x",
      "y"
    ], e);
    return {
      x: i,
      y: s
    };
  }
  size(e) {
    e = e || this.options || {};
    let i = e.radius || 0;
    i = Math.max(i, i && e.hoverRadius || 0);
    const s = i && e.borderWidth || 0;
    return (i + s) * 2;
  }
  draw(e, i) {
    const s = this.options;
    this.skip || s.radius < 0.1 || !je(this, i, this.size(s) / 2) || (e.strokeStyle = s.borderColor, e.lineWidth = s.borderWidth, e.fillStyle = s.backgroundColor, li(e, s, this.x, this.y));
  }
  getRange() {
    const e = this.options || {};
    return e.radius + e.hitRadius;
  }
}
y(_n, "id", "point"), /**
* @type {any}
*/
y(_n, "defaults", {
  borderWidth: 1,
  hitRadius: 1,
  hoverBorderWidth: 1,
  hoverRadius: 4,
  pointStyle: "circle",
  radius: 3,
  rotation: 0
}), /**
* @type {any}
*/
y(_n, "defaultRoutes", {
  backgroundColor: "backgroundColor",
  borderColor: "borderColor"
});
function Wh(n, t, e) {
  const i = n.segments, s = n.points, r = t.points, o = [];
  for (const a of i) {
    let { start: c, end: l } = a;
    l = zn(c, l, s);
    const h = gi(e, s[c], s[l], a.loop);
    if (!t.segments) {
      o.push({
        source: a,
        target: h,
        start: s[c],
        end: s[l]
      });
      continue;
    }
    const u = to(t, h);
    for (const d of u) {
      const f = gi(e, r[d.start], r[d.end], d.loop), g = Jr(a, s, f);
      for (const m of g)
        o.push({
          source: m,
          target: d,
          start: {
            [e]: Gs(h, f, "start", Math.max)
          },
          end: {
            [e]: Gs(h, f, "end", Math.min)
          }
        });
    }
  }
  return o;
}
function gi(n, t, e, i) {
  if (i)
    return;
  let s = t[n], r = e[n];
  return n === "angle" && (s = ft(s), r = ft(r)), {
    property: n,
    start: s,
    end: r
  };
}
function Bh(n, t) {
  const { x: e = null, y: i = null } = n || {}, s = t.points, r = [];
  return t.segments.forEach(({ start: o, end: a }) => {
    a = zn(o, a, s);
    const c = s[o], l = s[a];
    i !== null ? (r.push({
      x: c.x,
      y: i
    }), r.push({
      x: l.x,
      y: i
    })) : e !== null && (r.push({
      x: e,
      y: c.y
    }), r.push({
      x: e,
      y: l.y
    }));
  }), r;
}
function zn(n, t, e) {
  for (; t > n; t--) {
    const i = e[t];
    if (!isNaN(i.x) && !isNaN(i.y))
      break;
  }
  return t;
}
function Gs(n, t, e, i) {
  return n && t ? i(n[e], t[e]) : n ? n[e] : t ? t[e] : 0;
}
function bo(n, t) {
  let e = [], i = !1;
  return X(n) ? (i = !0, e = n) : e = Bh(n, t), e.length ? new Ot({
    points: e,
    options: {
      tension: 0
    },
    _loop: i,
    _fullLoop: i
  }) : null;
}
function Ks(n) {
  return n && n.fill !== !1;
}
function Yh(n, t, e) {
  let s = n[t].fill;
  const r = [
    t
  ];
  let o;
  if (!e)
    return s;
  for (; s !== !1 && r.indexOf(s) === -1; ) {
    if (!J(s))
      return s;
    if (o = n[s], !o)
      return !1;
    if (o.visible)
      return s;
    r.push(s), s = o.fill;
  }
  return !1;
}
function jh(n, t, e) {
  const i = Xh(n);
  if (E(i))
    return isNaN(i.value) ? !1 : i;
  let s = parseFloat(i);
  return J(s) && Math.floor(s) === s ? Vh(i[0], t, s, e) : [
    "origin",
    "start",
    "end",
    "stack",
    "shape"
  ].indexOf(i) >= 0 && i;
}
function Vh(n, t, e, i) {
  return (n === "-" || n === "+") && (e = t + e), e === t || e < 0 || e >= i ? !1 : e;
}
function Uh(n, t) {
  let e = null;
  return n === "start" ? e = t.bottom : n === "end" ? e = t.top : E(n) ? e = t.getPixelForValue(n.value) : t.getBasePixel && (e = t.getBasePixel()), e;
}
function qh(n, t, e) {
  let i;
  return n === "start" ? i = e : n === "end" ? i = t.options.reverse ? t.min : t.max : E(n) ? i = n.value : i = t.getBaseValue(), i;
}
function Xh(n) {
  const t = n.options, e = t.fill;
  let i = A(e && e.target, e);
  return i === void 0 && (i = !!t.backgroundColor), i === !1 || i === null ? !1 : i === !0 ? "origin" : i;
}
function Qh(n) {
  const { scale: t, index: e, line: i } = n, s = [], r = i.segments, o = i.points, a = Gh(t, e);
  a.push(bo({
    x: null,
    y: t.bottom
  }, i));
  for (let c = 0; c < r.length; c++) {
    const l = r[c];
    for (let h = l.start; h <= l.end; h++)
      Kh(s, o[h], a);
  }
  return new Ot({
    points: s,
    options: {}
  });
}
function Gh(n, t) {
  const e = [], i = n.getMatchingVisibleMetas("line");
  for (let s = 0; s < i.length; s++) {
    const r = i[s];
    if (r.index === t)
      break;
    r.hidden || e.unshift(r.dataset);
  }
  return e;
}
function Kh(n, t, e) {
  const i = [];
  for (let s = 0; s < e.length; s++) {
    const r = e[s], { first: o, last: a, point: c } = Zh(r, t, "x");
    if (!(!c || o && a)) {
      if (o)
        i.unshift(c);
      else if (n.push(c), !a)
        break;
    }
  }
  n.push(...i);
}
function Zh(n, t, e) {
  const i = n.interpolate(t, e);
  if (!i)
    return {};
  const s = i[e], r = n.segments, o = n.points;
  let a = !1, c = !1;
  for (let l = 0; l < r.length; l++) {
    const h = r[l], u = o[h.start][e], d = o[h.end][e];
    if (se(s, u, d)) {
      a = s === u, c = s === d;
      break;
    }
  }
  return {
    first: a,
    last: c,
    point: i
  };
}
class yo {
  constructor(t) {
    this.x = t.x, this.y = t.y, this.radius = t.radius;
  }
  pathSegment(t, e, i) {
    const { x: s, y: r, radius: o } = this;
    return e = e || {
      start: 0,
      end: ct
    }, t.arc(s, r, o, e.end, e.start, !0), !i.bounds;
  }
  interpolate(t) {
    const { x: e, y: i, radius: s } = this, r = t.angle;
    return {
      x: e + Math.cos(r) * s,
      y: i + Math.sin(r) * s,
      angle: r
    };
  }
}
function Jh(n) {
  const { chart: t, fill: e, line: i } = n;
  if (J(e))
    return tu(t, e);
  if (e === "stack")
    return Qh(n);
  if (e === "shape")
    return !0;
  const s = eu(n);
  return s instanceof yo ? s : bo(s, i);
}
function tu(n, t) {
  const e = n.getDatasetMeta(t);
  return e && n.isDatasetVisible(t) ? e.dataset : null;
}
function eu(n) {
  return (n.scale || {}).getPointPositionForValue ? iu(n) : nu(n);
}
function nu(n) {
  const { scale: t = {}, fill: e } = n, i = Uh(e, t);
  if (J(i)) {
    const s = t.isHorizontal();
    return {
      x: s ? i : null,
      y: s ? null : i
    };
  }
  return null;
}
function iu(n) {
  const { scale: t, fill: e } = n, i = t.options, s = t.getLabels().length, r = i.reverse ? t.max : t.min, o = qh(e, t, r), a = [];
  if (i.grid.circular) {
    const c = t.getPointPositionForValue(0, r);
    return new yo({
      x: c.x,
      y: c.y,
      radius: t.getDistanceFromCenterForValue(o)
    });
  }
  for (let c = 0; c < s; ++c)
    a.push(t.getPointPositionForValue(c, o));
  return a;
}
function Jn(n, t, e) {
  const i = Jh(t), { chart: s, index: r, line: o, scale: a, axis: c } = t, l = o.options, h = l.fill, u = l.backgroundColor, { above: d = u, below: f = u } = h || {}, g = s.getDatasetMeta(r), m = eo(s, g);
  i && o.points.length && ($n(n, e), su(n, {
    line: o,
    target: i,
    above: d,
    below: f,
    area: e,
    scale: a,
    axis: c,
    clip: m
  }), In(n));
}
function su(n, t) {
  const { line: e, target: i, above: s, below: r, area: o, scale: a, clip: c } = t, l = e._loop ? "angle" : t.axis;
  n.save();
  let h = r;
  r !== s && (l === "x" ? (Zs(n, i, o.top), ti(n, {
    line: e,
    target: i,
    color: s,
    scale: a,
    property: l,
    clip: c
  }), n.restore(), n.save(), Zs(n, i, o.bottom)) : l === "y" && (Js(n, i, o.left), ti(n, {
    line: e,
    target: i,
    color: r,
    scale: a,
    property: l,
    clip: c
  }), n.restore(), n.save(), Js(n, i, o.right), h = s)), ti(n, {
    line: e,
    target: i,
    color: h,
    scale: a,
    property: l,
    clip: c
  }), n.restore();
}
function Zs(n, t, e) {
  const { segments: i, points: s } = t;
  let r = !0, o = !1;
  n.beginPath();
  for (const a of i) {
    const { start: c, end: l } = a, h = s[c], u = s[zn(c, l, s)];
    r ? (n.moveTo(h.x, h.y), r = !1) : (n.lineTo(h.x, e), n.lineTo(h.x, h.y)), o = !!t.pathSegment(n, a, {
      move: o
    }), o ? n.closePath() : n.lineTo(u.x, e);
  }
  n.lineTo(t.first().x, e), n.closePath(), n.clip();
}
function Js(n, t, e) {
  const { segments: i, points: s } = t;
  let r = !0, o = !1;
  n.beginPath();
  for (const a of i) {
    const { start: c, end: l } = a, h = s[c], u = s[zn(c, l, s)];
    r ? (n.moveTo(h.x, h.y), r = !1) : (n.lineTo(e, h.y), n.lineTo(h.x, h.y)), o = !!t.pathSegment(n, a, {
      move: o
    }), o ? n.closePath() : n.lineTo(e, u.y);
  }
  n.lineTo(e, t.first().y), n.closePath(), n.clip();
}
function ti(n, t) {
  const { line: e, target: i, property: s, color: r, scale: o, clip: a } = t, c = Wh(e, i, s);
  for (const { source: l, target: h, start: u, end: d } of c) {
    const { style: { backgroundColor: f = r } = {} } = l, g = i !== !0;
    n.save(), n.fillStyle = f, ru(n, o, a, g && gi(s, u, d)), n.beginPath();
    const m = !!e.pathSegment(n, l);
    let p;
    if (g) {
      m ? n.closePath() : tr(n, i, d, s);
      const b = !!i.pathSegment(n, h, {
        move: m,
        reverse: !0
      });
      p = m && b, p || tr(n, i, u, s);
    }
    n.closePath(), n.fill(p ? "evenodd" : "nonzero"), n.restore();
  }
}
function ru(n, t, e, i) {
  const s = t.chart.chartArea, { property: r, start: o, end: a } = i || {};
  if (r === "x" || r === "y") {
    let c, l, h, u;
    r === "x" ? (c = o, l = s.top, h = a, u = s.bottom) : (c = s.left, l = o, h = s.right, u = a), n.beginPath(), e && (c = Math.max(c, e.left), h = Math.min(h, e.right), l = Math.max(l, e.top), u = Math.min(u, e.bottom)), n.rect(c, l, h - c, u - l), n.clip();
  }
}
function tr(n, t, e, i) {
  const s = t.interpolate(e, i);
  s && n.lineTo(s.x, s.y);
}
var ou = {
  id: "filler",
  afterDatasetsUpdate(n, t, e) {
    const i = (n.data.datasets || []).length, s = [];
    let r, o, a, c;
    for (o = 0; o < i; ++o)
      r = n.getDatasetMeta(o), a = r.dataset, c = null, a && a.options && a instanceof Ot && (c = {
        visible: n.isDatasetVisible(o),
        index: o,
        fill: jh(a, o, i),
        chart: n,
        axis: r.controller.options.indexAxis,
        scale: r.vScale,
        line: a
      }), r.$filler = c, s.push(c);
    for (o = 0; o < i; ++o)
      c = s[o], !(!c || c.fill === !1) && (c.fill = Yh(s, o, e.propagate));
  },
  beforeDraw(n, t, e) {
    const i = e.drawTime === "beforeDraw", s = n.getSortedVisibleDatasetMetas(), r = n.chartArea;
    for (let o = s.length - 1; o >= 0; --o) {
      const a = s[o].$filler;
      a && (a.line.updateControlPoints(r, a.axis), i && a.fill && Jn(n.ctx, a, r));
    }
  },
  beforeDatasetsDraw(n, t, e) {
    if (e.drawTime !== "beforeDatasetsDraw")
      return;
    const i = n.getSortedVisibleDatasetMetas();
    for (let s = i.length - 1; s >= 0; --s) {
      const r = i[s].$filler;
      Ks(r) && Jn(n.ctx, r, n.chartArea);
    }
  },
  beforeDatasetDraw(n, t, e) {
    const i = t.meta.$filler;
    !Ks(i) || e.drawTime !== "beforeDatasetDraw" || Jn(n.ctx, i, n.chartArea);
  },
  defaults: {
    propagate: !0,
    drawTime: "beforeDatasetDraw"
  }
};
const er = (n, t) => {
  let { boxHeight: e = t, boxWidth: i = t } = n;
  return n.usePointStyle && (e = Math.min(e, t), i = n.pointStyleWidth || Math.min(i, t)), {
    boxWidth: i,
    boxHeight: e,
    itemHeight: Math.max(t, e)
  };
}, au = (n, t) => n !== null && t !== null && n.datasetIndex === t.datasetIndex && n.index === t.index;
class nr extends Et {
  constructor(t) {
    super(), this._added = !1, this.legendHitBoxes = [], this._hoveredItem = null, this.doughnutMode = !1, this.chart = t.chart, this.options = t.options, this.ctx = t.ctx, this.legendItems = void 0, this.columnSizes = void 0, this.lineWidths = void 0, this.maxHeight = void 0, this.maxWidth = void 0, this.top = void 0, this.bottom = void 0, this.left = void 0, this.right = void 0, this.height = void 0, this.width = void 0, this._margins = void 0, this.position = void 0, this.weight = void 0, this.fullSize = void 0;
  }
  update(t, e, i) {
    this.maxWidth = t, this.maxHeight = e, this._margins = i, this.setDimensions(), this.buildLabels(), this.fit();
  }
  setDimensions() {
    this.isHorizontal() ? (this.width = this.maxWidth, this.left = this._margins.left, this.right = this.width) : (this.height = this.maxHeight, this.top = this._margins.top, this.bottom = this.height);
  }
  buildLabels() {
    const t = this.options.labels || {};
    let e = F(t.generateLabels, [
      this.chart
    ], this) || [];
    t.filter && (e = e.filter((i) => t.filter(i, this.chart.data))), t.sort && (e = e.sort((i, s) => t.sort(i, s, this.chart.data))), this.options.reverse && e.reverse(), this.legendItems = e;
  }
  fit() {
    const { options: t, ctx: e } = this;
    if (!t.display) {
      this.width = this.height = 0;
      return;
    }
    const i = t.labels, s = it(i.font), r = s.size, o = this._computeTitleHeight(), { boxWidth: a, itemHeight: c } = er(i, r);
    let l, h;
    e.font = s.string, this.isHorizontal() ? (l = this.maxWidth, h = this._fitRows(o, r, a, c) + 10) : (h = this.maxHeight, l = this._fitCols(o, s, a, c) + 10), this.width = Math.min(l, t.maxWidth || this.maxWidth), this.height = Math.min(h, t.maxHeight || this.maxHeight);
  }
  _fitRows(t, e, i, s) {
    const { ctx: r, maxWidth: o, options: { labels: { padding: a } } } = this, c = this.legendHitBoxes = [], l = this.lineWidths = [
      0
    ], h = s + a;
    let u = t;
    r.textAlign = "left", r.textBaseline = "middle";
    let d = -1, f = -h;
    return this.legendItems.forEach((g, m) => {
      const p = i + e / 2 + r.measureText(g.text).width;
      (m === 0 || l[l.length - 1] + p + 2 * a > o) && (u += h, l[l.length - (m > 0 ? 0 : 1)] = 0, f += h, d++), c[m] = {
        left: 0,
        top: f,
        row: d,
        width: p,
        height: s
      }, l[l.length - 1] += p + a;
    }), u;
  }
  _fitCols(t, e, i, s) {
    const { ctx: r, maxHeight: o, options: { labels: { padding: a } } } = this, c = this.legendHitBoxes = [], l = this.columnSizes = [], h = o - t;
    let u = a, d = 0, f = 0, g = 0, m = 0;
    return this.legendItems.forEach((p, b) => {
      const { itemWidth: _, itemHeight: v } = cu(i, e, r, p, s);
      b > 0 && f + v + 2 * a > h && (u += d + a, l.push({
        width: d,
        height: f
      }), g += d + a, m++, d = f = 0), c[b] = {
        left: g,
        top: f,
        col: m,
        width: _,
        height: v
      }, d = Math.max(d, _), f += v + a;
    }), u += d, l.push({
      width: d,
      height: f
    }), u;
  }
  adjustHitBoxes() {
    if (!this.options.display)
      return;
    const t = this._computeTitleHeight(), { legendHitBoxes: e, options: { align: i, labels: { padding: s }, rtl: r } } = this, o = re(r, this.left, this.width);
    if (this.isHorizontal()) {
      let a = 0, c = st(i, this.left + s, this.right - this.lineWidths[a]);
      for (const l of e)
        a !== l.row && (a = l.row, c = st(i, this.left + s, this.right - this.lineWidths[a])), l.top += this.top + t + s, l.left = o.leftForLtr(o.x(c), l.width), c += l.width + s;
    } else {
      let a = 0, c = st(i, this.top + t + s, this.bottom - this.columnSizes[a].height);
      for (const l of e)
        l.col !== a && (a = l.col, c = st(i, this.top + t + s, this.bottom - this.columnSizes[a].height)), l.top = c, l.left += this.left + s, l.left = o.leftForLtr(o.x(l.left), l.width), c += l.height + s;
    }
  }
  isHorizontal() {
    return this.options.position === "top" || this.options.position === "bottom";
  }
  draw() {
    if (this.options.display) {
      const t = this.ctx;
      $n(t, this), this._draw(), In(t);
    }
  }
  _draw() {
    const { options: t, columnSizes: e, lineWidths: i, ctx: s } = this, { align: r, labels: o } = t, a = B.color, c = re(t.rtl, this.left, this.width), l = it(o.font), { padding: h } = o, u = l.size, d = u / 2;
    let f;
    this.drawTitle(), s.textAlign = c.textAlign("left"), s.textBaseline = "middle", s.lineWidth = 0.5, s.font = l.string;
    const { boxWidth: g, boxHeight: m, itemHeight: p } = er(o, u), b = function(P, k, x) {
      if (isNaN(g) || g <= 0 || isNaN(m) || m < 0)
        return;
      s.save();
      const D = A(x.lineWidth, 1);
      if (s.fillStyle = A(x.fillStyle, a), s.lineCap = A(x.lineCap, "butt"), s.lineDashOffset = A(x.lineDashOffset, 0), s.lineJoin = A(x.lineJoin, "miter"), s.lineWidth = D, s.strokeStyle = A(x.strokeStyle, a), s.setLineDash(A(x.lineDash, [])), o.usePointStyle) {
        const O = {
          radius: m * Math.SQRT2 / 2,
          pointStyle: x.pointStyle,
          rotation: x.rotation,
          borderWidth: D
        }, S = c.xPlus(P, g / 2), C = k + d;
        Yr(s, O, S, C, o.pointStyleWidth && g);
      } else {
        const O = k + Math.max((u - m) / 2, 0), S = c.leftForLtr(P, g), C = Ie(x.borderRadius);
        s.beginPath(), Object.values(C).some((V) => V !== 0) ? hi(s, {
          x: S,
          y: O,
          w: g,
          h: m,
          radius: C
        }) : s.rect(S, O, g, m), s.fill(), D !== 0 && s.stroke();
      }
      s.restore();
    }, _ = function(P, k, x) {
      Pn(s, x.text, P, k + p / 2, l, {
        strikethrough: x.hidden,
        textAlign: c.textAlign(x.textAlign)
      });
    }, v = this.isHorizontal(), M = this._computeTitleHeight();
    v ? f = {
      x: st(r, this.left + h, this.right - i[0]),
      y: this.top + h + M,
      line: 0
    } : f = {
      x: this.left + h,
      y: st(r, this.top + M + h, this.bottom - e[0].height),
      line: 0
    }, Gr(this.ctx, t.textDirection);
    const w = p + h;
    this.legendItems.forEach((P, k) => {
      s.strokeStyle = P.fontColor, s.fillStyle = P.fontColor;
      const x = s.measureText(P.text).width, D = c.textAlign(P.textAlign || (P.textAlign = o.textAlign)), O = g + d + x;
      let S = f.x, C = f.y;
      c.setWidth(this.width), v ? k > 0 && S + O + h > this.right && (C = f.y += w, f.line++, S = f.x = st(r, this.left + h, this.right - i[f.line])) : k > 0 && C + w > this.bottom && (S = f.x = S + e[f.line].width + h, f.line++, C = f.y = st(r, this.top + M + h, this.bottom - e[f.line].height));
      const V = c.x(S);
      if (b(V, C, P), S = oc(D, S + g + d, v ? S + O : this.right, t.rtl), _(c.x(S), C, P), v)
        f.x += O + h;
      else if (typeof P.text != "string") {
        const G = l.lineHeight;
        f.y += _o(P, G) + h;
      } else
        f.y += w;
    }), Kr(this.ctx, t.textDirection);
  }
  drawTitle() {
    const t = this.options, e = t.title, i = it(e.font), s = lt(e.padding);
    if (!e.display)
      return;
    const r = re(t.rtl, this.left, this.width), o = this.ctx, a = e.position, c = i.size / 2, l = s.top + c;
    let h, u = this.left, d = this.width;
    if (this.isHorizontal())
      d = Math.max(...this.lineWidths), h = this.top + l, u = st(t.align, u, this.right - d);
    else {
      const g = this.columnSizes.reduce((m, p) => Math.max(m, p.height), 0);
      h = l + st(t.align, this.top, this.bottom - g - t.labels.padding - this._computeTitleHeight());
    }
    const f = st(a, u, u + d);
    o.textAlign = r.textAlign(Nr(a)), o.textBaseline = "middle", o.strokeStyle = e.color, o.fillStyle = e.color, o.font = i.string, Pn(o, e.text, f, h, i);
  }
  _computeTitleHeight() {
    const t = this.options.title, e = it(t.font), i = lt(t.padding);
    return t.display ? e.lineHeight + i.height : 0;
  }
  _getLegendItemAt(t, e) {
    let i, s, r;
    if (se(t, this.left, this.right) && se(e, this.top, this.bottom)) {
      for (r = this.legendHitBoxes, i = 0; i < r.length; ++i)
        if (s = r[i], se(t, s.left, s.left + s.width) && se(e, s.top, s.top + s.height))
          return this.legendItems[i];
    }
    return null;
  }
  handleEvent(t) {
    const e = this.options;
    if (!uu(t.type, e))
      return;
    const i = this._getLegendItemAt(t.x, t.y);
    if (t.type === "mousemove" || t.type === "mouseout") {
      const s = this._hoveredItem, r = au(s, i);
      s && !r && F(e.onLeave, [
        t,
        s,
        this
      ], this), this._hoveredItem = i, i && !r && F(e.onHover, [
        t,
        i,
        this
      ], this);
    } else i && F(e.onClick, [
      t,
      i,
      this
    ], this);
  }
}
function cu(n, t, e, i, s) {
  const r = lu(i, n, t, e), o = hu(s, i, t.lineHeight);
  return {
    itemWidth: r,
    itemHeight: o
  };
}
function lu(n, t, e, i) {
  let s = n.text;
  return s && typeof s != "string" && (s = s.reduce((r, o) => r.length > o.length ? r : o)), t + e.size / 2 + i.measureText(s).width;
}
function hu(n, t, e) {
  let i = n;
  return typeof t.text != "string" && (i = _o(t, e)), i;
}
function _o(n, t) {
  const e = n.text ? n.text.length : 0;
  return t * e;
}
function uu(n, t) {
  return !!((n === "mousemove" || n === "mouseout") && (t.onHover || t.onLeave) || t.onClick && (n === "click" || n === "mouseup"));
}
var du = {
  id: "legend",
  _element: nr,
  start(n, t, e) {
    const i = n.legend = new nr({
      ctx: n.ctx,
      options: e,
      chart: n
    });
    St.configure(n, i, e), St.addBox(n, i);
  },
  stop(n) {
    St.removeBox(n, n.legend), delete n.legend;
  },
  beforeUpdate(n, t, e) {
    const i = n.legend;
    St.configure(n, i, e), i.options = e;
  },
  afterUpdate(n) {
    const t = n.legend;
    t.buildLabels(), t.adjustHitBoxes();
  },
  afterEvent(n, t) {
    t.replay || n.legend.handleEvent(t.event);
  },
  defaults: {
    display: !0,
    position: "top",
    align: "center",
    fullSize: !0,
    reverse: !1,
    weight: 1e3,
    onClick(n, t, e) {
      const i = t.datasetIndex, s = e.chart;
      s.isDatasetVisible(i) ? (s.hide(i), t.hidden = !0) : (s.show(i), t.hidden = !1);
    },
    onHover: null,
    onLeave: null,
    labels: {
      color: (n) => n.chart.options.color,
      boxWidth: 40,
      padding: 10,
      generateLabels(n) {
        const t = n.data.datasets, { labels: { usePointStyle: e, pointStyle: i, textAlign: s, color: r, useBorderRadius: o, borderRadius: a } } = n.legend.options;
        return n._getSortedDatasetMetas().map((c) => {
          const l = c.controller.getStyle(e ? 0 : void 0), h = lt(l.borderWidth);
          return {
            text: t[c.index].label,
            fillStyle: l.backgroundColor,
            fontColor: r,
            hidden: !c.visible,
            lineCap: l.borderCapStyle,
            lineDash: l.borderDash,
            lineDashOffset: l.borderDashOffset,
            lineJoin: l.borderJoinStyle,
            lineWidth: (h.width + h.height) / 4,
            strokeStyle: l.borderColor,
            pointStyle: i || l.pointStyle,
            rotation: l.rotation,
            textAlign: s || l.textAlign,
            borderRadius: o && (a || l.borderRadius),
            datasetIndex: c.index
          };
        }, this);
      }
    },
    title: {
      color: (n) => n.chart.options.color,
      display: !1,
      position: "center",
      text: ""
    }
  },
  descriptors: {
    _scriptable: (n) => !n.startsWith("on"),
    labels: {
      _scriptable: (n) => ![
        "generateLabels",
        "filter",
        "sort"
      ].includes(n)
    }
  }
};
const Pe = {
  average(n) {
    if (!n.length)
      return !1;
    let t, e, i = /* @__PURE__ */ new Set(), s = 0, r = 0;
    for (t = 0, e = n.length; t < e; ++t) {
      const a = n[t].element;
      if (a && a.hasValue()) {
        const c = a.tooltipPosition();
        i.add(c.x), s += c.y, ++r;
      }
    }
    return r === 0 || i.size === 0 ? !1 : {
      x: [
        ...i
      ].reduce((a, c) => a + c) / i.size,
      y: s / r
    };
  },
  nearest(n, t) {
    if (!n.length)
      return !1;
    let e = t.x, i = t.y, s = Number.POSITIVE_INFINITY, r, o, a;
    for (r = 0, o = n.length; r < o; ++r) {
      const c = n[r].element;
      if (c && c.hasValue()) {
        const l = c.getCenterPoint(), h = ai(t, l);
        h < s && (s = h, a = c);
      }
    }
    if (a) {
      const c = a.tooltipPosition();
      e = c.x, i = c.y;
    }
    return {
      x: e,
      y: i
    };
  }
};
function ut(n, t) {
  return t && (X(t) ? Array.prototype.push.apply(n, t) : n.push(t)), n;
}
function _t(n) {
  return (typeof n == "string" || n instanceof String) && n.indexOf(`
`) > -1 ? n.split(`
`) : n;
}
function fu(n, t) {
  const { element: e, datasetIndex: i, index: s } = t, r = n.getDatasetMeta(i).controller, { label: o, value: a } = r.getLabelAndValue(s);
  return {
    chart: n,
    label: o,
    parsed: r.getParsed(s),
    raw: n.data.datasets[i].data[s],
    formattedValue: a,
    dataset: r.getDataset(),
    dataIndex: s,
    datasetIndex: i,
    element: e
  };
}
function ir(n, t) {
  const e = n.chart.ctx, { body: i, footer: s, title: r } = n, { boxWidth: o, boxHeight: a } = t, c = it(t.bodyFont), l = it(t.titleFont), h = it(t.footerFont), u = r.length, d = s.length, f = i.length, g = lt(t.padding);
  let m = g.height, p = 0, b = i.reduce((M, w) => M + w.before.length + w.lines.length + w.after.length, 0);
  if (b += n.beforeBody.length + n.afterBody.length, u && (m += u * l.lineHeight + (u - 1) * t.titleSpacing + t.titleMarginBottom), b) {
    const M = t.displayColors ? Math.max(a, c.lineHeight) : c.lineHeight;
    m += f * M + (b - f) * c.lineHeight + (b - 1) * t.bodySpacing;
  }
  d && (m += t.footerMarginTop + d * h.lineHeight + (d - 1) * t.footerSpacing);
  let _ = 0;
  const v = function(M) {
    p = Math.max(p, e.measureText(M).width + _);
  };
  return e.save(), e.font = l.string, L(n.title, v), e.font = c.string, L(n.beforeBody.concat(n.afterBody), v), _ = t.displayColors ? o + 2 + t.boxPadding : 0, L(i, (M) => {
    L(M.before, v), L(M.lines, v), L(M.after, v);
  }), _ = 0, e.font = h.string, L(n.footer, v), e.restore(), p += g.width, {
    width: p,
    height: m
  };
}
function gu(n, t) {
  const { y: e, height: i } = t;
  return e < i / 2 ? "top" : e > n.height - i / 2 ? "bottom" : "center";
}
function mu(n, t, e, i) {
  const { x: s, width: r } = i, o = e.caretSize + e.caretPadding;
  if (n === "left" && s + r + o > t.width || n === "right" && s - r - o < 0)
    return !0;
}
function pu(n, t, e, i) {
  const { x: s, width: r } = e, { width: o, chartArea: { left: a, right: c } } = n;
  let l = "center";
  return i === "center" ? l = s <= (a + c) / 2 ? "left" : "right" : s <= r / 2 ? l = "left" : s >= o - r / 2 && (l = "right"), mu(l, n, t, e) && (l = "center"), l;
}
function sr(n, t, e) {
  const i = e.yAlign || t.yAlign || gu(n, e);
  return {
    xAlign: e.xAlign || t.xAlign || pu(n, t, e, i),
    yAlign: i
  };
}
function bu(n, t) {
  let { x: e, width: i } = n;
  return t === "right" ? e -= i : t === "center" && (e -= i / 2), e;
}
function yu(n, t, e) {
  let { y: i, height: s } = n;
  return t === "top" ? i += e : t === "bottom" ? i -= s + e : i -= s / 2, i;
}
function rr(n, t, e, i) {
  const { caretSize: s, caretPadding: r, cornerRadius: o } = n, { xAlign: a, yAlign: c } = e, l = s + r, { topLeft: h, topRight: u, bottomLeft: d, bottomRight: f } = Ie(o);
  let g = bu(t, a);
  const m = yu(t, c, l);
  return c === "center" ? a === "left" ? g += l : a === "right" && (g -= l) : a === "left" ? g -= Math.max(h, d) + s : a === "right" && (g += Math.max(u, f) + s), {
    x: at(g, 0, i.width - t.width),
    y: at(m, 0, i.height - t.height)
  };
}
function un(n, t, e) {
  const i = lt(e.padding);
  return t === "center" ? n.x + n.width / 2 : t === "right" ? n.x + n.width - i.right : n.x + i.left;
}
function or(n) {
  return ut([], _t(n));
}
function _u(n, t, e) {
  return Kt(n, {
    tooltip: t,
    tooltipItems: e,
    type: "tooltip"
  });
}
function ar(n, t) {
  const e = t && t.dataset && t.dataset.tooltip && t.dataset.tooltip.callbacks;
  return e ? n.override(e) : n;
}
const xo = {
  beforeTitle: bt,
  title(n) {
    if (n.length > 0) {
      const t = n[0], e = t.chart.data.labels, i = e ? e.length : 0;
      if (this && this.options && this.options.mode === "dataset")
        return t.dataset.label || "";
      if (t.label)
        return t.label;
      if (i > 0 && t.dataIndex < i)
        return e[t.dataIndex];
    }
    return "";
  },
  afterTitle: bt,
  beforeBody: bt,
  beforeLabel: bt,
  label(n) {
    if (this && this.options && this.options.mode === "dataset")
      return n.label + ": " + n.formattedValue || n.formattedValue;
    let t = n.dataset.label || "";
    t && (t += ": ");
    const e = n.formattedValue;
    return z(e) || (t += e), t;
  },
  labelColor(n) {
    const e = n.chart.getDatasetMeta(n.datasetIndex).controller.getStyle(n.dataIndex);
    return {
      borderColor: e.borderColor,
      backgroundColor: e.backgroundColor,
      borderWidth: e.borderWidth,
      borderDash: e.borderDash,
      borderDashOffset: e.borderDashOffset,
      borderRadius: 0
    };
  },
  labelTextColor() {
    return this.options.bodyColor;
  },
  labelPointStyle(n) {
    const e = n.chart.getDatasetMeta(n.datasetIndex).controller.getStyle(n.dataIndex);
    return {
      pointStyle: e.pointStyle,
      rotation: e.rotation
    };
  },
  afterLabel: bt,
  afterBody: bt,
  beforeFooter: bt,
  footer: bt,
  afterFooter: bt
};
function et(n, t, e, i) {
  const s = n[t].call(e, i);
  return typeof s > "u" ? xo[t].call(e, i) : s;
}
class mi extends Et {
  constructor(t) {
    super(), this.opacity = 0, this._active = [], this._eventPosition = void 0, this._size = void 0, this._cachedAnimations = void 0, this._tooltipItems = [], this.$animations = void 0, this.$context = void 0, this.chart = t.chart, this.options = t.options, this.dataPoints = void 0, this.title = void 0, this.beforeBody = void 0, this.body = void 0, this.afterBody = void 0, this.footer = void 0, this.xAlign = void 0, this.yAlign = void 0, this.x = void 0, this.y = void 0, this.height = void 0, this.width = void 0, this.caretX = void 0, this.caretY = void 0, this.labelColors = void 0, this.labelPointStyles = void 0, this.labelTextColors = void 0;
  }
  initialize(t) {
    this.options = t, this._cachedAnimations = void 0, this.$context = void 0;
  }
  _resolveAnimations() {
    const t = this._cachedAnimations;
    if (t)
      return t;
    const e = this.chart, i = this.options.setContext(this.getContext()), s = i.enabled && e.options.animation && i.animations, r = new no(this.chart, s);
    return s._cacheable && (this._cachedAnimations = Object.freeze(r)), r;
  }
  getContext() {
    return this.$context || (this.$context = _u(this.chart.getContext(), this, this._tooltipItems));
  }
  getTitle(t, e) {
    const { callbacks: i } = e, s = et(i, "beforeTitle", this, t), r = et(i, "title", this, t), o = et(i, "afterTitle", this, t);
    let a = [];
    return a = ut(a, _t(s)), a = ut(a, _t(r)), a = ut(a, _t(o)), a;
  }
  getBeforeBody(t, e) {
    return or(et(e.callbacks, "beforeBody", this, t));
  }
  getBody(t, e) {
    const { callbacks: i } = e, s = [];
    return L(t, (r) => {
      const o = {
        before: [],
        lines: [],
        after: []
      }, a = ar(i, r);
      ut(o.before, _t(et(a, "beforeLabel", this, r))), ut(o.lines, et(a, "label", this, r)), ut(o.after, _t(et(a, "afterLabel", this, r))), s.push(o);
    }), s;
  }
  getAfterBody(t, e) {
    return or(et(e.callbacks, "afterBody", this, t));
  }
  getFooter(t, e) {
    const { callbacks: i } = e, s = et(i, "beforeFooter", this, t), r = et(i, "footer", this, t), o = et(i, "afterFooter", this, t);
    let a = [];
    return a = ut(a, _t(s)), a = ut(a, _t(r)), a = ut(a, _t(o)), a;
  }
  _createItems(t) {
    const e = this._active, i = this.chart.data, s = [], r = [], o = [];
    let a = [], c, l;
    for (c = 0, l = e.length; c < l; ++c)
      a.push(fu(this.chart, e[c]));
    return t.filter && (a = a.filter((h, u, d) => t.filter(h, u, d, i))), t.itemSort && (a = a.sort((h, u) => t.itemSort(h, u, i))), L(a, (h) => {
      const u = ar(t.callbacks, h);
      s.push(et(u, "labelColor", this, h)), r.push(et(u, "labelPointStyle", this, h)), o.push(et(u, "labelTextColor", this, h));
    }), this.labelColors = s, this.labelPointStyles = r, this.labelTextColors = o, this.dataPoints = a, a;
  }
  update(t, e) {
    const i = this.options.setContext(this.getContext()), s = this._active;
    let r, o = [];
    if (!s.length)
      this.opacity !== 0 && (r = {
        opacity: 0
      });
    else {
      const a = Pe[i.position].call(this, s, this._eventPosition);
      o = this._createItems(i), this.title = this.getTitle(o, i), this.beforeBody = this.getBeforeBody(o, i), this.body = this.getBody(o, i), this.afterBody = this.getAfterBody(o, i), this.footer = this.getFooter(o, i);
      const c = this._size = ir(this, i), l = Object.assign({}, a, c), h = sr(this.chart, i, l), u = rr(i, l, h, this.chart);
      this.xAlign = h.xAlign, this.yAlign = h.yAlign, r = {
        opacity: 1,
        x: u.x,
        y: u.y,
        width: c.width,
        height: c.height,
        caretX: a.x,
        caretY: a.y
      };
    }
    this._tooltipItems = o, this.$context = void 0, r && this._resolveAnimations().update(this, r), t && i.external && i.external.call(this, {
      chart: this.chart,
      tooltip: this,
      replay: e
    });
  }
  drawCaret(t, e, i, s) {
    const r = this.getCaretPosition(t, i, s);
    e.lineTo(r.x1, r.y1), e.lineTo(r.x2, r.y2), e.lineTo(r.x3, r.y3);
  }
  getCaretPosition(t, e, i) {
    const { xAlign: s, yAlign: r } = this, { caretSize: o, cornerRadius: a } = i, { topLeft: c, topRight: l, bottomLeft: h, bottomRight: u } = Ie(a), { x: d, y: f } = t, { width: g, height: m } = e;
    let p, b, _, v, M, w;
    return r === "center" ? (M = f + m / 2, s === "left" ? (p = d, b = p - o, v = M + o, w = M - o) : (p = d + g, b = p + o, v = M - o, w = M + o), _ = p) : (s === "left" ? b = d + Math.max(c, h) + o : s === "right" ? b = d + g - Math.max(l, u) - o : b = this.caretX, r === "top" ? (v = f, M = v - o, p = b - o, _ = b + o) : (v = f + m, M = v + o, p = b + o, _ = b - o), w = v), {
      x1: p,
      x2: b,
      x3: _,
      y1: v,
      y2: M,
      y3: w
    };
  }
  drawTitle(t, e, i) {
    const s = this.title, r = s.length;
    let o, a, c;
    if (r) {
      const l = re(i.rtl, this.x, this.width);
      for (t.x = un(this, i.titleAlign, i), e.textAlign = l.textAlign(i.titleAlign), e.textBaseline = "middle", o = it(i.titleFont), a = i.titleSpacing, e.fillStyle = i.titleColor, e.font = o.string, c = 0; c < r; ++c)
        e.fillText(s[c], l.x(t.x), t.y + o.lineHeight / 2), t.y += o.lineHeight + a, c + 1 === r && (t.y += i.titleMarginBottom - a);
    }
  }
  _drawColorBox(t, e, i, s, r) {
    const o = this.labelColors[i], a = this.labelPointStyles[i], { boxHeight: c, boxWidth: l } = r, h = it(r.bodyFont), u = un(this, "left", r), d = s.x(u), f = c < h.lineHeight ? (h.lineHeight - c) / 2 : 0, g = e.y + f;
    if (r.usePointStyle) {
      const m = {
        radius: Math.min(l, c) / 2,
        pointStyle: a.pointStyle,
        rotation: a.rotation,
        borderWidth: 1
      }, p = s.leftForLtr(d, l) + l / 2, b = g + c / 2;
      t.strokeStyle = r.multiKeyBackground, t.fillStyle = r.multiKeyBackground, li(t, m, p, b), t.strokeStyle = o.borderColor, t.fillStyle = o.backgroundColor, li(t, m, p, b);
    } else {
      t.lineWidth = E(o.borderWidth) ? Math.max(...Object.values(o.borderWidth)) : o.borderWidth || 1, t.strokeStyle = o.borderColor, t.setLineDash(o.borderDash || []), t.lineDashOffset = o.borderDashOffset || 0;
      const m = s.leftForLtr(d, l), p = s.leftForLtr(s.xPlus(d, 1), l - 2), b = Ie(o.borderRadius);
      Object.values(b).some((_) => _ !== 0) ? (t.beginPath(), t.fillStyle = r.multiKeyBackground, hi(t, {
        x: m,
        y: g,
        w: l,
        h: c,
        radius: b
      }), t.fill(), t.stroke(), t.fillStyle = o.backgroundColor, t.beginPath(), hi(t, {
        x: p,
        y: g + 1,
        w: l - 2,
        h: c - 2,
        radius: b
      }), t.fill()) : (t.fillStyle = r.multiKeyBackground, t.fillRect(m, g, l, c), t.strokeRect(m, g, l, c), t.fillStyle = o.backgroundColor, t.fillRect(p, g + 1, l - 2, c - 2));
    }
    t.fillStyle = this.labelTextColors[i];
  }
  drawBody(t, e, i) {
    const { body: s } = this, { bodySpacing: r, bodyAlign: o, displayColors: a, boxHeight: c, boxWidth: l, boxPadding: h } = i, u = it(i.bodyFont);
    let d = u.lineHeight, f = 0;
    const g = re(i.rtl, this.x, this.width), m = function(x) {
      e.fillText(x, g.x(t.x + f), t.y + d / 2), t.y += d + r;
    }, p = g.textAlign(o);
    let b, _, v, M, w, P, k;
    for (e.textAlign = o, e.textBaseline = "middle", e.font = u.string, t.x = un(this, p, i), e.fillStyle = i.bodyColor, L(this.beforeBody, m), f = a && p !== "right" ? o === "center" ? l / 2 + h : l + 2 + h : 0, M = 0, P = s.length; M < P; ++M) {
      for (b = s[M], _ = this.labelTextColors[M], e.fillStyle = _, L(b.before, m), v = b.lines, a && v.length && (this._drawColorBox(e, t, M, g, i), d = Math.max(u.lineHeight, c)), w = 0, k = v.length; w < k; ++w)
        m(v[w]), d = u.lineHeight;
      L(b.after, m);
    }
    f = 0, d = u.lineHeight, L(this.afterBody, m), t.y -= r;
  }
  drawFooter(t, e, i) {
    const s = this.footer, r = s.length;
    let o, a;
    if (r) {
      const c = re(i.rtl, this.x, this.width);
      for (t.x = un(this, i.footerAlign, i), t.y += i.footerMarginTop, e.textAlign = c.textAlign(i.footerAlign), e.textBaseline = "middle", o = it(i.footerFont), e.fillStyle = i.footerColor, e.font = o.string, a = 0; a < r; ++a)
        e.fillText(s[a], c.x(t.x), t.y + o.lineHeight / 2), t.y += o.lineHeight + i.footerSpacing;
    }
  }
  drawBackground(t, e, i, s) {
    const { xAlign: r, yAlign: o } = this, { x: a, y: c } = t, { width: l, height: h } = i, { topLeft: u, topRight: d, bottomLeft: f, bottomRight: g } = Ie(s.cornerRadius);
    e.fillStyle = s.backgroundColor, e.strokeStyle = s.borderColor, e.lineWidth = s.borderWidth, e.beginPath(), e.moveTo(a + u, c), o === "top" && this.drawCaret(t, e, i, s), e.lineTo(a + l - d, c), e.quadraticCurveTo(a + l, c, a + l, c + d), o === "center" && r === "right" && this.drawCaret(t, e, i, s), e.lineTo(a + l, c + h - g), e.quadraticCurveTo(a + l, c + h, a + l - g, c + h), o === "bottom" && this.drawCaret(t, e, i, s), e.lineTo(a + f, c + h), e.quadraticCurveTo(a, c + h, a, c + h - f), o === "center" && r === "left" && this.drawCaret(t, e, i, s), e.lineTo(a, c + u), e.quadraticCurveTo(a, c, a + u, c), e.closePath(), e.fill(), s.borderWidth > 0 && e.stroke();
  }
  _updateAnimationTarget(t) {
    const e = this.chart, i = this.$animations, s = i && i.x, r = i && i.y;
    if (s || r) {
      const o = Pe[t.position].call(this, this._active, this._eventPosition);
      if (!o)
        return;
      const a = this._size = ir(this, t), c = Object.assign({}, o, this._size), l = sr(e, t, c), h = rr(t, c, l, e);
      (s._to !== h.x || r._to !== h.y) && (this.xAlign = l.xAlign, this.yAlign = l.yAlign, this.width = a.width, this.height = a.height, this.caretX = o.x, this.caretY = o.y, this._resolveAnimations().update(this, h));
    }
  }
  _willRender() {
    return !!this.opacity;
  }
  draw(t) {
    const e = this.options.setContext(this.getContext());
    let i = this.opacity;
    if (!i)
      return;
    this._updateAnimationTarget(e);
    const s = {
      width: this.width,
      height: this.height
    }, r = {
      x: this.x,
      y: this.y
    };
    i = Math.abs(i) < 1e-3 ? 0 : i;
    const o = lt(e.padding), a = this.title.length || this.beforeBody.length || this.body.length || this.afterBody.length || this.footer.length;
    e.enabled && a && (t.save(), t.globalAlpha = i, this.drawBackground(r, t, s, e), Gr(t, e.textDirection), r.y += o.top, this.drawTitle(r, t, e), this.drawBody(r, t, e), this.drawFooter(r, t, e), Kr(t, e.textDirection), t.restore());
  }
  getActiveElements() {
    return this._active || [];
  }
  setActiveElements(t, e) {
    const i = this._active, s = t.map(({ datasetIndex: a, index: c }) => {
      const l = this.chart.getDatasetMeta(a);
      if (!l)
        throw new Error("Cannot find a dataset at index " + a);
      return {
        datasetIndex: a,
        element: l.data[c],
        index: c
      };
    }), r = !wn(i, s), o = this._positionChanged(s, e);
    (r || o) && (this._active = s, this._eventPosition = e, this._ignoreReplayEvents = !0, this.update(!0));
  }
  handleEvent(t, e, i = !0) {
    if (e && this._ignoreReplayEvents)
      return !1;
    this._ignoreReplayEvents = !1;
    const s = this.options, r = this._active || [], o = this._getActiveElements(t, r, e, i), a = this._positionChanged(o, t), c = e || !wn(o, r) || a;
    return c && (this._active = o, (s.enabled || s.external) && (this._eventPosition = {
      x: t.x,
      y: t.y
    }, this.update(!0, e))), c;
  }
  _getActiveElements(t, e, i, s) {
    const r = this.options;
    if (t.type === "mouseout")
      return [];
    if (!s)
      return e.filter((a) => this.chart.data.datasets[a.datasetIndex] && this.chart.getDatasetMeta(a.datasetIndex).controller.getParsed(a.index) !== void 0);
    const o = this.chart.getElementsAtEventForMode(t, r.mode, r, i);
    return r.reverse && o.reverse(), o;
  }
  _positionChanged(t, e) {
    const { caretX: i, caretY: s, options: r } = this, o = Pe[r.position].call(this, t, e);
    return o !== !1 && (i !== o.x || s !== o.y);
  }
}
y(mi, "positioners", Pe);
var xu = {
  id: "tooltip",
  _element: mi,
  positioners: Pe,
  afterInit(n, t, e) {
    e && (n.tooltip = new mi({
      chart: n,
      options: e
    }));
  },
  beforeUpdate(n, t, e) {
    n.tooltip && n.tooltip.initialize(e);
  },
  reset(n, t, e) {
    n.tooltip && n.tooltip.initialize(e);
  },
  afterDraw(n) {
    const t = n.tooltip;
    if (t && t._willRender()) {
      const e = {
        tooltip: t
      };
      if (n.notifyPlugins("beforeTooltipDraw", {
        ...e,
        cancelable: !0
      }) === !1)
        return;
      t.draw(n.ctx), n.notifyPlugins("afterTooltipDraw", e);
    }
  },
  afterEvent(n, t) {
    if (n.tooltip) {
      const e = t.replay;
      n.tooltip.handleEvent(t.event, e, t.inChartArea) && (t.changed = !0);
    }
  },
  defaults: {
    enabled: !0,
    external: null,
    position: "average",
    backgroundColor: "rgba(0,0,0,0.8)",
    titleColor: "#fff",
    titleFont: {
      weight: "bold"
    },
    titleSpacing: 2,
    titleMarginBottom: 6,
    titleAlign: "left",
    bodyColor: "#fff",
    bodySpacing: 2,
    bodyFont: {},
    bodyAlign: "left",
    footerColor: "#fff",
    footerSpacing: 2,
    footerMarginTop: 6,
    footerFont: {
      weight: "bold"
    },
    footerAlign: "left",
    padding: 6,
    caretPadding: 2,
    caretSize: 5,
    cornerRadius: 6,
    boxHeight: (n, t) => t.bodyFont.size,
    boxWidth: (n, t) => t.bodyFont.size,
    multiKeyBackground: "#fff",
    displayColors: !0,
    boxPadding: 0,
    borderColor: "rgba(0,0,0,0)",
    borderWidth: 0,
    animation: {
      duration: 400,
      easing: "easeOutQuart"
    },
    animations: {
      numbers: {
        type: "number",
        properties: [
          "x",
          "y",
          "width",
          "height",
          "caretX",
          "caretY"
        ]
      },
      opacity: {
        easing: "linear",
        duration: 200
      }
    },
    callbacks: xo
  },
  defaultRoutes: {
    bodyFont: "font",
    footerFont: "font",
    titleFont: "font"
  },
  descriptors: {
    _scriptable: (n) => n !== "filter" && n !== "itemSort" && n !== "external",
    _indexable: !1,
    callbacks: {
      _scriptable: !1,
      _indexable: !1
    },
    animation: {
      _fallback: !1
    },
    animations: {
      _fallback: "animation"
    }
  },
  additionalOptionScopes: [
    "interaction"
  ]
};
function wu(n, t) {
  const e = [], { bounds: s, step: r, min: o, max: a, precision: c, count: l, maxTicks: h, maxDigits: u, includeBounds: d } = n, f = r || 1, g = h - 1, { min: m, max: p } = t, b = !z(o), _ = !z(a), v = !z(l), M = (p - m) / (u + 1);
  let w = cs((p - m) / g / f) * f, P, k, x, D;
  if (w < 1e-14 && !b && !_)
    return [
      {
        value: m
      },
      {
        value: p
      }
    ];
  D = Math.ceil(p / w) - Math.floor(m / w), D > g && (w = cs(D * w / g / f) * f), z(c) || (P = Math.pow(10, c), w = Math.ceil(w * P) / P), s === "ticks" ? (k = Math.floor(m / w) * w, x = Math.ceil(p / w) * w) : (k = m, x = p), b && _ && r && Qa((a - o) / r, w / 1e3) ? (D = Math.round(Math.min((a - o) / w, h)), w = (a - o) / D, k = o, x = a) : v ? (k = b ? o : k, x = _ ? a : x, D = l - 1, w = (x - k) / D) : (D = (x - k) / w, Ae(D, Math.round(D), w / 1e3) ? D = Math.round(D) : D = Math.ceil(D));
  const O = Math.max(ls(w), ls(k));
  P = Math.pow(10, z(c) ? O : c), k = Math.round(k * P) / P, x = Math.round(x * P) / P;
  let S = 0;
  for (b && (d && k !== o ? (e.push({
    value: o
  }), k < o && S++, Ae(Math.round((k + S * w) * P) / P, o, cr(o, M, n)) && S++) : k < o && S++); S < D; ++S) {
    const C = Math.round((k + S * w) * P) / P;
    if (_ && C > a)
      break;
    e.push({
      value: C
    });
  }
  return _ && d && x !== a ? e.length && Ae(e[e.length - 1].value, a, cr(a, M, n)) ? e[e.length - 1].value = a : e.push({
    value: a
  }) : (!_ || x === a) && e.push({
    value: x
  }), e;
}
function cr(n, t, { horizontal: e, minRotation: i }) {
  const s = Vt(i), r = (e ? Math.sin(s) : Math.cos(s)) || 1e-3, o = 0.75 * t * ("" + n).length;
  return Math.min(t / r, o);
}
class vu extends Qe {
  constructor(t) {
    super(t), this.start = void 0, this.end = void 0, this._startValue = void 0, this._endValue = void 0, this._valueRange = 0;
  }
  parse(t, e) {
    return z(t) || (typeof t == "number" || t instanceof Number) && !isFinite(+t) ? null : +t;
  }
  handleTickRangeOptions() {
    const { beginAtZero: t } = this.options, { minDefined: e, maxDefined: i } = this.getUserBounds();
    let { min: s, max: r } = this;
    const o = (c) => s = e ? s : c, a = (c) => r = i ? r : c;
    if (t) {
      const c = le(s), l = le(r);
      c < 0 && l < 0 ? a(0) : c > 0 && l > 0 && o(0);
    }
    if (s === r) {
      let c = r === 0 ? 1 : Math.abs(r * 0.05);
      a(r + c), t || o(s - c);
    }
    this.min = s, this.max = r;
  }
  getTickLimit() {
    const t = this.options.ticks;
    let { maxTicksLimit: e, stepSize: i } = t, s;
    return i ? (s = Math.ceil(this.max / i) - Math.floor(this.min / i) + 1, s > 1e3 && (console.warn(`scales.${this.id}.ticks.stepSize: ${i} would result generating up to ${s} ticks. Limiting to 1000.`), s = 1e3)) : (s = this.computeTickLimit(), e = e || 11), e && (s = Math.min(e, s)), s;
  }
  computeTickLimit() {
    return Number.POSITIVE_INFINITY;
  }
  buildTicks() {
    const t = this.options, e = t.ticks;
    let i = this.getTickLimit();
    i = Math.max(2, i);
    const s = {
      maxTicks: i,
      bounds: t.bounds,
      min: t.min,
      max: t.max,
      precision: e.precision,
      step: e.stepSize,
      count: e.count,
      maxDigits: this._maxDigits(),
      horizontal: this.isHorizontal(),
      minRotation: e.minRotation || 0,
      includeBounds: e.includeBounds !== !1
    }, r = this._range || this, o = wu(s, r);
    return t.bounds === "ticks" && Ga(o, this, "value"), t.reverse ? (o.reverse(), this.start = this.max, this.end = this.min) : (this.start = this.min, this.end = this.max), o;
  }
  configure() {
    const t = this.ticks;
    let e = this.min, i = this.max;
    if (super.configure(), this.options.offset && t.length) {
      const s = (i - e) / Math.max(t.length - 1, 1) / 2;
      e -= s, i += s;
    }
    this._startValue = e, this._endValue = i, this._valueRange = i - e;
  }
  getLabelForValue(t) {
    return Wr(t, this.chart.options.locale, this.options.ticks.format);
  }
}
class pi extends vu {
  determineDataLimits() {
    const { min: t, max: e } = this.getMinMax(!0);
    this.min = J(t) ? t : 0, this.max = J(e) ? e : 1, this.handleTickRangeOptions();
  }
  computeTickLimit() {
    const t = this.isHorizontal(), e = t ? this.width : this.height, i = Vt(this.options.ticks.minRotation), s = (t ? Math.sin(i) : Math.cos(i)) || 1e-3, r = this._resolveTickFontOptions(0);
    return Math.ceil(e / Math.min(40, r.lineHeight / s));
  }
  getPixelForValue(t) {
    return t === null ? NaN : this.getPixelForDecimal((t - this._startValue) / this._valueRange);
  }
  getValueForPixel(t) {
    return this._startValue + this.getDecimalForPixel(t) * this._valueRange;
  }
}
y(pi, "id", "linear"), y(pi, "defaults", {
  ticks: {
    callback: Br.formatters.numeric
  }
});
const Rn = {
  millisecond: {
    common: !0,
    size: 1,
    steps: 1e3
  },
  second: {
    common: !0,
    size: 1e3,
    steps: 60
  },
  minute: {
    common: !0,
    size: 6e4,
    steps: 60
  },
  hour: {
    common: !0,
    size: 36e5,
    steps: 24
  },
  day: {
    common: !0,
    size: 864e5,
    steps: 30
  },
  week: {
    common: !1,
    size: 6048e5,
    steps: 4
  },
  month: {
    common: !0,
    size: 2628e6,
    steps: 12
  },
  quarter: {
    common: !1,
    size: 7884e6,
    steps: 4
  },
  year: {
    common: !0,
    size: 3154e7
  }
}, nt = /* @__PURE__ */ Object.keys(Rn);
function lr(n, t) {
  return n - t;
}
function hr(n, t) {
  if (z(t))
    return null;
  const e = n._adapter, { parser: i, round: s, isoWeekday: r } = n._parseOpts;
  let o = t;
  return typeof i == "function" && (o = i(o)), J(o) || (o = typeof i == "string" ? e.parse(o, i) : e.parse(o)), o === null ? null : (s && (o = s === "week" && (Ye(r) || r === !0) ? e.startOf(o, "isoWeek", r) : e.startOf(o, s)), +o);
}
function ur(n, t, e, i) {
  const s = nt.length;
  for (let r = nt.indexOf(n); r < s - 1; ++r) {
    const o = Rn[nt[r]], a = o.steps ? o.steps : Number.MAX_SAFE_INTEGER;
    if (o.common && Math.ceil((e - t) / (a * o.size)) <= i)
      return nt[r];
  }
  return nt[s - 1];
}
function Mu(n, t, e, i, s) {
  for (let r = nt.length - 1; r >= nt.indexOf(e); r--) {
    const o = nt[r];
    if (Rn[o].common && n._adapter.diff(s, i, o) >= t - 1)
      return o;
  }
  return nt[e ? nt.indexOf(e) : 0];
}
function ku(n) {
  for (let t = nt.indexOf(n) + 1, e = nt.length; t < e; ++t)
    if (Rn[nt[t]].common)
      return nt[t];
}
function dr(n, t, e) {
  if (!e)
    n[t] = !0;
  else if (e.length) {
    const { lo: i, hi: s } = Oi(e, t), r = e[i] >= t ? e[i] : e[s];
    n[r] = !0;
  }
}
function Du(n, t, e, i) {
  const s = n._adapter, r = +s.startOf(t[0].value, i), o = t[t.length - 1].value;
  let a, c;
  for (a = r; a <= o; a = +s.add(a, 1, i))
    c = e[a], c >= 0 && (t[c].major = !0);
  return t;
}
function fr(n, t, e) {
  const i = [], s = {}, r = t.length;
  let o, a;
  for (o = 0; o < r; ++o)
    a = t[o], s[a] = o, i.push({
      value: a,
      major: !1
    });
  return r === 0 || !e ? i : Du(n, i, s, e);
}
class Ue extends Qe {
  constructor(t) {
    super(t), this._cache = {
      data: [],
      labels: [],
      all: []
    }, this._unit = "day", this._majorUnit = void 0, this._offsets = {}, this._normalized = !1, this._parseOpts = void 0;
  }
  init(t, e = {}) {
    const i = t.time || (t.time = {}), s = this._adapter = new so._date(t.adapters.date);
    s.init(e), Ce(i.displayFormats, s.formats()), this._parseOpts = {
      parser: i.parser,
      round: i.round,
      isoWeekday: i.isoWeekday
    }, super.init(t), this._normalized = e.normalized;
  }
  parse(t, e) {
    return t === void 0 ? null : hr(this, t);
  }
  beforeLayout() {
    super.beforeLayout(), this._cache = {
      data: [],
      labels: [],
      all: []
    };
  }
  determineDataLimits() {
    const t = this.options, e = this._adapter, i = t.time.unit || "day";
    let { min: s, max: r, minDefined: o, maxDefined: a } = this.getUserBounds();
    function c(l) {
      !o && !isNaN(l.min) && (s = Math.min(s, l.min)), !a && !isNaN(l.max) && (r = Math.max(r, l.max));
    }
    (!o || !a) && (c(this._getLabelBounds()), (t.bounds !== "ticks" || t.ticks.source !== "labels") && c(this.getMinMax(!1))), s = J(s) && !isNaN(s) ? s : +e.startOf(Date.now(), i), r = J(r) && !isNaN(r) ? r : +e.endOf(Date.now(), i) + 1, this.min = Math.min(s, r - 1), this.max = Math.max(s + 1, r);
  }
  _getLabelBounds() {
    const t = this.getLabelTimestamps();
    let e = Number.POSITIVE_INFINITY, i = Number.NEGATIVE_INFINITY;
    return t.length && (e = t[0], i = t[t.length - 1]), {
      min: e,
      max: i
    };
  }
  buildTicks() {
    const t = this.options, e = t.time, i = t.ticks, s = i.source === "labels" ? this.getLabelTimestamps() : this._generate();
    t.bounds === "ticks" && s.length && (this.min = this._userMin || s[0], this.max = this._userMax || s[s.length - 1]);
    const r = this.min, o = this.max, a = nc(s, r, o);
    return this._unit = e.unit || (i.autoSkip ? ur(e.minUnit, this.min, this.max, this._getLabelCapacity(r)) : Mu(this, a.length, e.minUnit, this.min, this.max)), this._majorUnit = !i.major.enabled || this._unit === "year" ? void 0 : ku(this._unit), this.initOffsets(s), t.reverse && a.reverse(), fr(this, a, this._majorUnit);
  }
  afterAutoSkip() {
    this.options.offsetAfterAutoskip && this.initOffsets(this.ticks.map((t) => +t.value));
  }
  initOffsets(t = []) {
    let e = 0, i = 0, s, r;
    this.options.offset && t.length && (s = this.getDecimalForValue(t[0]), t.length === 1 ? e = 1 - s : e = (this.getDecimalForValue(t[1]) - s) / 2, r = this.getDecimalForValue(t[t.length - 1]), t.length === 1 ? i = r : i = (r - this.getDecimalForValue(t[t.length - 2])) / 2);
    const o = t.length < 3 ? 0.5 : 0.25;
    e = at(e, 0, o), i = at(i, 0, o), this._offsets = {
      start: e,
      end: i,
      factor: 1 / (e + 1 + i)
    };
  }
  _generate() {
    const t = this._adapter, e = this.min, i = this.max, s = this.options, r = s.time, o = r.unit || ur(r.minUnit, e, i, this._getLabelCapacity(e)), a = A(s.ticks.stepSize, 1), c = o === "week" ? r.isoWeekday : !1, l = Ye(c) || c === !0, h = {};
    let u = e, d, f;
    if (l && (u = +t.startOf(u, "isoWeek", c)), u = +t.startOf(u, l ? "day" : o), t.diff(i, e, o) > 1e5 * a)
      throw new Error(e + " and " + i + " are too far apart with stepSize of " + a + " " + o);
    const g = s.ticks.source === "data" && this.getDataTimestamps();
    for (d = u, f = 0; d < i; d = +t.add(d, a, o), f++)
      dr(h, d, g);
    return (d === i || s.bounds === "ticks" || f === 1) && dr(h, d, g), Object.keys(h).sort(lr).map((m) => +m);
  }
  getLabelForValue(t) {
    const e = this._adapter, i = this.options.time;
    return i.tooltipFormat ? e.format(t, i.tooltipFormat) : e.format(t, i.displayFormats.datetime);
  }
  format(t, e) {
    const s = this.options.time.displayFormats, r = this._unit, o = e || s[r];
    return this._adapter.format(t, o);
  }
  _tickFormatFunction(t, e, i, s) {
    const r = this.options, o = r.ticks.callback;
    if (o)
      return F(o, [
        t,
        e,
        i
      ], this);
    const a = r.time.displayFormats, c = this._unit, l = this._majorUnit, h = c && a[c], u = l && a[l], d = i[e], f = l && u && d && d.major;
    return this._adapter.format(t, s || (f ? u : h));
  }
  generateTickLabels(t) {
    let e, i, s;
    for (e = 0, i = t.length; e < i; ++e)
      s = t[e], s.label = this._tickFormatFunction(s.value, e, t);
  }
  getDecimalForValue(t) {
    return t === null ? NaN : (t - this.min) / (this.max - this.min);
  }
  getPixelForValue(t) {
    const e = this._offsets, i = this.getDecimalForValue(t);
    return this.getPixelForDecimal((e.start + i) * e.factor);
  }
  getValueForPixel(t) {
    const e = this._offsets, i = this.getDecimalForPixel(t) / e.factor - e.end;
    return this.min + i * (this.max - this.min);
  }
  _getLabelSize(t) {
    const e = this.options.ticks, i = this.ctx.measureText(t).width, s = Vt(this.isHorizontal() ? e.maxRotation : e.minRotation), r = Math.cos(s), o = Math.sin(s), a = this._resolveTickFontOptions(0).size;
    return {
      w: i * r + a * o,
      h: i * o + a * r
    };
  }
  _getLabelCapacity(t) {
    const e = this.options.time, i = e.displayFormats, s = i[e.unit] || i.millisecond, r = this._tickFormatFunction(t, 0, fr(this, [
      t
    ], this._majorUnit), s), o = this._getLabelSize(r), a = Math.floor(this.isHorizontal() ? this.width / o.w : this.height / o.h) - 1;
    return a > 0 ? a : 1;
  }
  getDataTimestamps() {
    let t = this._cache.data || [], e, i;
    if (t.length)
      return t;
    const s = this.getMatchingVisibleMetas();
    if (this._normalized && s.length)
      return this._cache.data = s[0].controller.getAllParsedValues(this);
    for (e = 0, i = s.length; e < i; ++e)
      t = t.concat(s[e].controller.getAllParsedValues(this));
    return this._cache.data = this.normalize(t);
  }
  getLabelTimestamps() {
    const t = this._cache.labels || [];
    let e, i;
    if (t.length)
      return t;
    const s = this.getLabels();
    for (e = 0, i = s.length; e < i; ++e)
      t.push(hr(this, s[e]));
    return this._cache.labels = this._normalized ? t : this.normalize(t);
  }
  normalize(t) {
    return sc(t.sort(lr));
  }
}
y(Ue, "id", "time"), y(Ue, "defaults", {
  bounds: "data",
  adapters: {},
  time: {
    parser: !1,
    unit: !1,
    round: !1,
    isoWeekday: !1,
    minUnit: "millisecond",
    displayFormats: {}
  },
  ticks: {
    source: "auto",
    callback: !1,
    major: {
      enabled: !1
    }
  }
});
function dn(n, t, e) {
  let i = 0, s = n.length - 1, r, o, a, c;
  e ? (t >= n[i].pos && t <= n[s].pos && ({ lo: i, hi: s } = Ut(n, "pos", t)), { pos: r, time: a } = n[i], { pos: o, time: c } = n[s]) : (t >= n[i].time && t <= n[s].time && ({ lo: i, hi: s } = Ut(n, "time", t)), { time: r, pos: a } = n[i], { time: o, pos: c } = n[s]);
  const l = o - r;
  return l ? a + (c - a) * (t - r) / l : a;
}
class gr extends Ue {
  constructor(t) {
    super(t), this._table = [], this._minPos = void 0, this._tableRange = void 0;
  }
  initOffsets() {
    const t = this._getTimestampsForTable(), e = this._table = this.buildLookupTable(t);
    this._minPos = dn(e, this.min), this._tableRange = dn(e, this.max) - this._minPos, super.initOffsets(t);
  }
  buildLookupTable(t) {
    const { min: e, max: i } = this, s = [], r = [];
    let o, a, c, l, h;
    for (o = 0, a = t.length; o < a; ++o)
      l = t[o], l >= e && l <= i && s.push(l);
    if (s.length < 2)
      return [
        {
          time: e,
          pos: 0
        },
        {
          time: i,
          pos: 1
        }
      ];
    for (o = 0, a = s.length; o < a; ++o)
      h = s[o + 1], c = s[o - 1], l = s[o], Math.round((h + c) / 2) !== l && r.push({
        time: l,
        pos: o / (a - 1)
      });
    return r;
  }
  _generate() {
    const t = this.min, e = this.max;
    let i = super.getDataTimestamps();
    return (!i.includes(t) || !i.length) && i.splice(0, 0, t), (!i.includes(e) || i.length === 1) && i.push(e), i.sort((s, r) => s - r);
  }
  _getTimestampsForTable() {
    let t = this._cache.all || [];
    if (t.length)
      return t;
    const e = this.getDataTimestamps(), i = this.getLabelTimestamps();
    return e.length && i.length ? t = this.normalize(e.concat(i)) : t = e.length ? e : i, t = this._cache.all = t, t;
  }
  getDecimalForValue(t) {
    return (dn(this._table, t) - this._minPos) / this._tableRange;
  }
  getValueForPixel(t) {
    const e = this._offsets, i = this.getDecimalForPixel(t) / e.factor - e.end;
    return dn(this._table, i * this._tableRange + this._minPos, !0);
  }
}
y(gr, "id", "timeseries"), y(gr, "defaults", Ue.defaults);
const wo = 6048e5, Pu = 864e5, Ge = 6e4, Ke = 36e5, Su = 1e3, mr = Symbol.for("constructDateFrom");
function N(n, t) {
  return typeof n == "function" ? n(t) : n && typeof n == "object" && mr in n ? n[mr](t) : n instanceof Date ? new n.constructor(t) : new Date(t);
}
function T(n, t) {
  return N(t || n, n);
}
function Hn(n, t, e) {
  const i = T(n, e == null ? void 0 : e.in);
  return isNaN(t) ? N((e == null ? void 0 : e.in) || n, NaN) : (t && i.setDate(i.getDate() + t), i);
}
function Fi(n, t, e) {
  const i = T(n, e == null ? void 0 : e.in);
  if (isNaN(t)) return N(n, NaN);
  if (!t)
    return i;
  const s = i.getDate(), r = N(n, i.getTime());
  r.setMonth(i.getMonth() + t + 1, 0);
  const o = r.getDate();
  return s >= o ? r : (i.setFullYear(
    r.getFullYear(),
    r.getMonth(),
    s
  ), i);
}
function zi(n, t, e) {
  return N(n, +T(n) + t);
}
function Ou(n, t, e) {
  return zi(n, t * Ke);
}
let Tu = {};
function Zt() {
  return Tu;
}
function pt(n, t) {
  var a, c, l, h;
  const e = Zt(), i = (t == null ? void 0 : t.weekStartsOn) ?? ((c = (a = t == null ? void 0 : t.locale) == null ? void 0 : a.options) == null ? void 0 : c.weekStartsOn) ?? e.weekStartsOn ?? ((h = (l = e.locale) == null ? void 0 : l.options) == null ? void 0 : h.weekStartsOn) ?? 0, s = T(n, t == null ? void 0 : t.in), r = s.getDay(), o = (r < i ? 7 : 0) + r - i;
  return s.setDate(s.getDate() - o), s.setHours(0, 0, 0, 0), s;
}
function de(n, t) {
  return pt(n, { ...t, weekStartsOn: 1 });
}
function vo(n, t) {
  const e = T(n, t == null ? void 0 : t.in), i = e.getFullYear(), s = N(e, 0);
  s.setFullYear(i + 1, 0, 4), s.setHours(0, 0, 0, 0);
  const r = de(s), o = N(e, 0);
  o.setFullYear(i, 0, 4), o.setHours(0, 0, 0, 0);
  const a = de(o);
  return e.getTime() >= r.getTime() ? i + 1 : e.getTime() >= a.getTime() ? i : i - 1;
}
function Tn(n) {
  const t = T(n), e = new Date(
    Date.UTC(
      t.getFullYear(),
      t.getMonth(),
      t.getDate(),
      t.getHours(),
      t.getMinutes(),
      t.getSeconds(),
      t.getMilliseconds()
    )
  );
  return e.setUTCFullYear(t.getFullYear()), +n - +e;
}
function Jt(n, ...t) {
  const e = N.bind(
    null,
    t.find((i) => typeof i == "object")
  );
  return t.map(e);
}
function bi(n, t) {
  const e = T(n, t == null ? void 0 : t.in);
  return e.setHours(0, 0, 0, 0), e;
}
function Mo(n, t, e) {
  const [i, s] = Jt(
    e == null ? void 0 : e.in,
    n,
    t
  ), r = bi(i), o = bi(s), a = +r - Tn(r), c = +o - Tn(o);
  return Math.round((a - c) / Pu);
}
function Cu(n, t) {
  const e = vo(n, t), i = N(n, 0);
  return i.setFullYear(e, 0, 4), i.setHours(0, 0, 0, 0), de(i);
}
function Au(n, t, e) {
  const i = T(n, e == null ? void 0 : e.in);
  return i.setTime(i.getTime() + t * Ge), i;
}
function Eu(n, t, e) {
  return Fi(n, t * 3, e);
}
function $u(n, t, e) {
  return zi(n, t * 1e3);
}
function Iu(n, t, e) {
  return Hn(n, t * 7, e);
}
function Lu(n, t, e) {
  return Fi(n, t * 12, e);
}
function Fe(n, t) {
  const e = +T(n) - +T(t);
  return e < 0 ? -1 : e > 0 ? 1 : e;
}
function Fu(n) {
  return n instanceof Date || typeof n == "object" && Object.prototype.toString.call(n) === "[object Date]";
}
function ko(n) {
  return !(!Fu(n) && typeof n != "number" || isNaN(+T(n)));
}
function zu(n, t, e) {
  const [i, s] = Jt(
    e == null ? void 0 : e.in,
    n,
    t
  ), r = i.getFullYear() - s.getFullYear(), o = i.getMonth() - s.getMonth();
  return r * 12 + o;
}
function Ru(n, t, e) {
  const [i, s] = Jt(
    e == null ? void 0 : e.in,
    n,
    t
  );
  return i.getFullYear() - s.getFullYear();
}
function Do(n, t, e) {
  const [i, s] = Jt(
    e == null ? void 0 : e.in,
    n,
    t
  ), r = pr(i, s), o = Math.abs(
    Mo(i, s)
  );
  i.setDate(i.getDate() - r * o);
  const a = +(pr(i, s) === -r), c = r * (o - a);
  return c === 0 ? 0 : c;
}
function pr(n, t) {
  const e = n.getFullYear() - t.getFullYear() || n.getMonth() - t.getMonth() || n.getDate() - t.getDate() || n.getHours() - t.getHours() || n.getMinutes() - t.getMinutes() || n.getSeconds() - t.getSeconds() || n.getMilliseconds() - t.getMilliseconds();
  return e < 0 ? -1 : e > 0 ? 1 : e;
}
function Ze(n) {
  return (t) => {
    const i = (n ? Math[n] : Math.trunc)(t);
    return i === 0 ? 0 : i;
  };
}
function Hu(n, t, e) {
  const [i, s] = Jt(
    e == null ? void 0 : e.in,
    n,
    t
  ), r = (+i - +s) / Ke;
  return Ze(e == null ? void 0 : e.roundingMethod)(r);
}
function Ri(n, t) {
  return +T(n) - +T(t);
}
function Nu(n, t, e) {
  const i = Ri(n, t) / Ge;
  return Ze(e == null ? void 0 : e.roundingMethod)(i);
}
function Po(n, t) {
  const e = T(n, t == null ? void 0 : t.in);
  return e.setHours(23, 59, 59, 999), e;
}
function So(n, t) {
  const e = T(n, t == null ? void 0 : t.in), i = e.getMonth();
  return e.setFullYear(e.getFullYear(), i + 1, 0), e.setHours(23, 59, 59, 999), e;
}
function Wu(n, t) {
  const e = T(n, t == null ? void 0 : t.in);
  return +Po(e, t) == +So(e, t);
}
function Oo(n, t, e) {
  const [i, s, r] = Jt(
    e == null ? void 0 : e.in,
    n,
    n,
    t
  ), o = Fe(s, r), a = Math.abs(
    zu(s, r)
  );
  if (a < 1) return 0;
  s.getMonth() === 1 && s.getDate() > 27 && s.setDate(30), s.setMonth(s.getMonth() - o * a);
  let c = Fe(s, r) === -o;
  Wu(i) && a === 1 && Fe(i, r) === 1 && (c = !1);
  const l = o * (a - +c);
  return l === 0 ? 0 : l;
}
function Bu(n, t, e) {
  const i = Oo(n, t, e) / 3;
  return Ze(e == null ? void 0 : e.roundingMethod)(i);
}
function Yu(n, t, e) {
  const i = Ri(n, t) / 1e3;
  return Ze(e == null ? void 0 : e.roundingMethod)(i);
}
function ju(n, t, e) {
  const i = Do(n, t, e) / 7;
  return Ze(e == null ? void 0 : e.roundingMethod)(i);
}
function Vu(n, t, e) {
  const [i, s] = Jt(
    e == null ? void 0 : e.in,
    n,
    t
  ), r = Fe(i, s), o = Math.abs(Ru(i, s));
  i.setFullYear(1584), s.setFullYear(1584);
  const a = Fe(i, s) === -r, c = r * (o - +a);
  return c === 0 ? 0 : c;
}
function Uu(n, t) {
  const e = T(n, t == null ? void 0 : t.in), i = e.getMonth(), s = i - i % 3;
  return e.setMonth(s, 1), e.setHours(0, 0, 0, 0), e;
}
function qu(n, t) {
  const e = T(n, t == null ? void 0 : t.in);
  return e.setDate(1), e.setHours(0, 0, 0, 0), e;
}
function Xu(n, t) {
  const e = T(n, t == null ? void 0 : t.in), i = e.getFullYear();
  return e.setFullYear(i + 1, 0, 0), e.setHours(23, 59, 59, 999), e;
}
function To(n, t) {
  const e = T(n, t == null ? void 0 : t.in);
  return e.setFullYear(e.getFullYear(), 0, 1), e.setHours(0, 0, 0, 0), e;
}
function Qu(n, t) {
  const e = T(n, t == null ? void 0 : t.in);
  return e.setMinutes(59, 59, 999), e;
}
function Gu(n, t) {
  var a, c;
  const e = Zt(), i = e.weekStartsOn ?? ((c = (a = e.locale) == null ? void 0 : a.options) == null ? void 0 : c.weekStartsOn) ?? 0, s = T(n, t == null ? void 0 : t.in), r = s.getDay(), o = (r < i ? -7 : 0) + 6 - (r - i);
  return s.setDate(s.getDate() + o), s.setHours(23, 59, 59, 999), s;
}
function Ku(n, t) {
  const e = T(n, t == null ? void 0 : t.in);
  return e.setSeconds(59, 999), e;
}
function Zu(n, t) {
  const e = T(n, t == null ? void 0 : t.in), i = e.getMonth(), s = i - i % 3 + 3;
  return e.setMonth(s, 0), e.setHours(23, 59, 59, 999), e;
}
function Ju(n, t) {
  const e = T(n, t == null ? void 0 : t.in);
  return e.setMilliseconds(999), e;
}
const td = {
  lessThanXSeconds: {
    one: "less than a second",
    other: "less than {{count}} seconds"
  },
  xSeconds: {
    one: "1 second",
    other: "{{count}} seconds"
  },
  halfAMinute: "half a minute",
  lessThanXMinutes: {
    one: "less than a minute",
    other: "less than {{count}} minutes"
  },
  xMinutes: {
    one: "1 minute",
    other: "{{count}} minutes"
  },
  aboutXHours: {
    one: "about 1 hour",
    other: "about {{count}} hours"
  },
  xHours: {
    one: "1 hour",
    other: "{{count}} hours"
  },
  xDays: {
    one: "1 day",
    other: "{{count}} days"
  },
  aboutXWeeks: {
    one: "about 1 week",
    other: "about {{count}} weeks"
  },
  xWeeks: {
    one: "1 week",
    other: "{{count}} weeks"
  },
  aboutXMonths: {
    one: "about 1 month",
    other: "about {{count}} months"
  },
  xMonths: {
    one: "1 month",
    other: "{{count}} months"
  },
  aboutXYears: {
    one: "about 1 year",
    other: "about {{count}} years"
  },
  xYears: {
    one: "1 year",
    other: "{{count}} years"
  },
  overXYears: {
    one: "over 1 year",
    other: "over {{count}} years"
  },
  almostXYears: {
    one: "almost 1 year",
    other: "almost {{count}} years"
  }
}, ed = (n, t, e) => {
  let i;
  const s = td[n];
  return typeof s == "string" ? i = s : t === 1 ? i = s.one : i = s.other.replace("{{count}}", t.toString()), e != null && e.addSuffix ? e.comparison && e.comparison > 0 ? "in " + i : i + " ago" : i;
};
function ei(n) {
  return (t = {}) => {
    const e = t.width ? String(t.width) : n.defaultWidth;
    return n.formats[e] || n.formats[n.defaultWidth];
  };
}
const nd = {
  full: "EEEE, MMMM do, y",
  long: "MMMM do, y",
  medium: "MMM d, y",
  short: "MM/dd/yyyy"
}, id = {
  full: "h:mm:ss a zzzz",
  long: "h:mm:ss a z",
  medium: "h:mm:ss a",
  short: "h:mm a"
}, sd = {
  full: "{{date}} 'at' {{time}}",
  long: "{{date}} 'at' {{time}}",
  medium: "{{date}}, {{time}}",
  short: "{{date}}, {{time}}"
}, rd = {
  date: ei({
    formats: nd,
    defaultWidth: "full"
  }),
  time: ei({
    formats: id,
    defaultWidth: "full"
  }),
  dateTime: ei({
    formats: sd,
    defaultWidth: "full"
  })
}, od = {
  lastWeek: "'last' eeee 'at' p",
  yesterday: "'yesterday at' p",
  today: "'today at' p",
  tomorrow: "'tomorrow at' p",
  nextWeek: "eeee 'at' p",
  other: "P"
}, ad = (n, t, e, i) => od[n];
function we(n) {
  return (t, e) => {
    const i = e != null && e.context ? String(e.context) : "standalone";
    let s;
    if (i === "formatting" && n.formattingValues) {
      const o = n.defaultFormattingWidth || n.defaultWidth, a = e != null && e.width ? String(e.width) : o;
      s = n.formattingValues[a] || n.formattingValues[o];
    } else {
      const o = n.defaultWidth, a = e != null && e.width ? String(e.width) : n.defaultWidth;
      s = n.values[a] || n.values[o];
    }
    const r = n.argumentCallback ? n.argumentCallback(t) : t;
    return s[r];
  };
}
const cd = {
  narrow: ["B", "A"],
  abbreviated: ["BC", "AD"],
  wide: ["Before Christ", "Anno Domini"]
}, ld = {
  narrow: ["1", "2", "3", "4"],
  abbreviated: ["Q1", "Q2", "Q3", "Q4"],
  wide: ["1st quarter", "2nd quarter", "3rd quarter", "4th quarter"]
}, hd = {
  narrow: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
  abbreviated: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ],
  wide: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ]
}, ud = {
  narrow: ["S", "M", "T", "W", "T", "F", "S"],
  short: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  abbreviated: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  wide: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ]
}, dd = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mi",
    noon: "n",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  }
}, fd = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mi",
    noon: "n",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "midnight",
    noon: "noon",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "midnight",
    noon: "noon",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  }
}, gd = (n, t) => {
  const e = Number(n), i = e % 100;
  if (i > 20 || i < 10)
    switch (i % 10) {
      case 1:
        return e + "st";
      case 2:
        return e + "nd";
      case 3:
        return e + "rd";
    }
  return e + "th";
}, md = {
  ordinalNumber: gd,
  era: we({
    values: cd,
    defaultWidth: "wide"
  }),
  quarter: we({
    values: ld,
    defaultWidth: "wide",
    argumentCallback: (n) => n - 1
  }),
  month: we({
    values: hd,
    defaultWidth: "wide"
  }),
  day: we({
    values: ud,
    defaultWidth: "wide"
  }),
  dayPeriod: we({
    values: dd,
    defaultWidth: "wide",
    formattingValues: fd,
    defaultFormattingWidth: "wide"
  })
};
function ve(n) {
  return (t, e = {}) => {
    const i = e.width, s = i && n.matchPatterns[i] || n.matchPatterns[n.defaultMatchWidth], r = t.match(s);
    if (!r)
      return null;
    const o = r[0], a = i && n.parsePatterns[i] || n.parsePatterns[n.defaultParseWidth], c = Array.isArray(a) ? bd(a, (u) => u.test(o)) : (
      // [TODO] -- I challenge you to fix the type
      pd(a, (u) => u.test(o))
    );
    let l;
    l = n.valueCallback ? n.valueCallback(c) : c, l = e.valueCallback ? (
      // [TODO] -- I challenge you to fix the type
      e.valueCallback(l)
    ) : l;
    const h = t.slice(o.length);
    return { value: l, rest: h };
  };
}
function pd(n, t) {
  for (const e in n)
    if (Object.prototype.hasOwnProperty.call(n, e) && t(n[e]))
      return e;
}
function bd(n, t) {
  for (let e = 0; e < n.length; e++)
    if (t(n[e]))
      return e;
}
function yd(n) {
  return (t, e = {}) => {
    const i = t.match(n.matchPattern);
    if (!i) return null;
    const s = i[0], r = t.match(n.parsePattern);
    if (!r) return null;
    let o = n.valueCallback ? n.valueCallback(r[0]) : r[0];
    o = e.valueCallback ? e.valueCallback(o) : o;
    const a = t.slice(s.length);
    return { value: o, rest: a };
  };
}
const _d = /^(\d+)(th|st|nd|rd)?/i, xd = /\d+/i, wd = {
  narrow: /^(b|a)/i,
  abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
  wide: /^(before christ|before common era|anno domini|common era)/i
}, vd = {
  any: [/^b/i, /^(a|c)/i]
}, Md = {
  narrow: /^[1234]/i,
  abbreviated: /^q[1234]/i,
  wide: /^[1234](th|st|nd|rd)? quarter/i
}, kd = {
  any: [/1/i, /2/i, /3/i, /4/i]
}, Dd = {
  narrow: /^[jfmasond]/i,
  abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
  wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
}, Pd = {
  narrow: [
    /^j/i,
    /^f/i,
    /^m/i,
    /^a/i,
    /^m/i,
    /^j/i,
    /^j/i,
    /^a/i,
    /^s/i,
    /^o/i,
    /^n/i,
    /^d/i
  ],
  any: [
    /^ja/i,
    /^f/i,
    /^mar/i,
    /^ap/i,
    /^may/i,
    /^jun/i,
    /^jul/i,
    /^au/i,
    /^s/i,
    /^o/i,
    /^n/i,
    /^d/i
  ]
}, Sd = {
  narrow: /^[smtwf]/i,
  short: /^(su|mo|tu|we|th|fr|sa)/i,
  abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
  wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
}, Od = {
  narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
  any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
}, Td = {
  narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
  any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
}, Cd = {
  any: {
    am: /^a/i,
    pm: /^p/i,
    midnight: /^mi/i,
    noon: /^no/i,
    morning: /morning/i,
    afternoon: /afternoon/i,
    evening: /evening/i,
    night: /night/i
  }
}, Ad = {
  ordinalNumber: yd({
    matchPattern: _d,
    parsePattern: xd,
    valueCallback: (n) => parseInt(n, 10)
  }),
  era: ve({
    matchPatterns: wd,
    defaultMatchWidth: "wide",
    parsePatterns: vd,
    defaultParseWidth: "any"
  }),
  quarter: ve({
    matchPatterns: Md,
    defaultMatchWidth: "wide",
    parsePatterns: kd,
    defaultParseWidth: "any",
    valueCallback: (n) => n + 1
  }),
  month: ve({
    matchPatterns: Dd,
    defaultMatchWidth: "wide",
    parsePatterns: Pd,
    defaultParseWidth: "any"
  }),
  day: ve({
    matchPatterns: Sd,
    defaultMatchWidth: "wide",
    parsePatterns: Od,
    defaultParseWidth: "any"
  }),
  dayPeriod: ve({
    matchPatterns: Td,
    defaultMatchWidth: "any",
    parsePatterns: Cd,
    defaultParseWidth: "any"
  })
}, Co = {
  code: "en-US",
  formatDistance: ed,
  formatLong: rd,
  formatRelative: ad,
  localize: md,
  match: Ad,
  options: {
    weekStartsOn: 0,
    firstWeekContainsDate: 1
  }
};
function Ed(n, t) {
  const e = T(n, t == null ? void 0 : t.in);
  return Mo(e, To(e)) + 1;
}
function Ao(n, t) {
  const e = T(n, t == null ? void 0 : t.in), i = +de(e) - +Cu(e);
  return Math.round(i / wo) + 1;
}
function Hi(n, t) {
  var h, u, d, f;
  const e = T(n, t == null ? void 0 : t.in), i = e.getFullYear(), s = Zt(), r = (t == null ? void 0 : t.firstWeekContainsDate) ?? ((u = (h = t == null ? void 0 : t.locale) == null ? void 0 : h.options) == null ? void 0 : u.firstWeekContainsDate) ?? s.firstWeekContainsDate ?? ((f = (d = s.locale) == null ? void 0 : d.options) == null ? void 0 : f.firstWeekContainsDate) ?? 1, o = N((t == null ? void 0 : t.in) || n, 0);
  o.setFullYear(i + 1, 0, r), o.setHours(0, 0, 0, 0);
  const a = pt(o, t), c = N((t == null ? void 0 : t.in) || n, 0);
  c.setFullYear(i, 0, r), c.setHours(0, 0, 0, 0);
  const l = pt(c, t);
  return +e >= +a ? i + 1 : +e >= +l ? i : i - 1;
}
function $d(n, t) {
  var a, c, l, h;
  const e = Zt(), i = (t == null ? void 0 : t.firstWeekContainsDate) ?? ((c = (a = t == null ? void 0 : t.locale) == null ? void 0 : a.options) == null ? void 0 : c.firstWeekContainsDate) ?? e.firstWeekContainsDate ?? ((h = (l = e.locale) == null ? void 0 : l.options) == null ? void 0 : h.firstWeekContainsDate) ?? 1, s = Hi(n, t), r = N((t == null ? void 0 : t.in) || n, 0);
  return r.setFullYear(s, 0, i), r.setHours(0, 0, 0, 0), pt(r, t);
}
function Eo(n, t) {
  const e = T(n, t == null ? void 0 : t.in), i = +pt(e, t) - +$d(e, t);
  return Math.round(i / wo) + 1;
}
function I(n, t) {
  const e = n < 0 ? "-" : "", i = Math.abs(n).toString().padStart(t, "0");
  return e + i;
}
const Mt = {
  // Year
  y(n, t) {
    const e = n.getFullYear(), i = e > 0 ? e : 1 - e;
    return I(t === "yy" ? i % 100 : i, t.length);
  },
  // Month
  M(n, t) {
    const e = n.getMonth();
    return t === "M" ? String(e + 1) : I(e + 1, 2);
  },
  // Day of the month
  d(n, t) {
    return I(n.getDate(), t.length);
  },
  // AM or PM
  a(n, t) {
    const e = n.getHours() / 12 >= 1 ? "pm" : "am";
    switch (t) {
      case "a":
      case "aa":
        return e.toUpperCase();
      case "aaa":
        return e;
      case "aaaaa":
        return e[0];
      case "aaaa":
      default:
        return e === "am" ? "a.m." : "p.m.";
    }
  },
  // Hour [1-12]
  h(n, t) {
    return I(n.getHours() % 12 || 12, t.length);
  },
  // Hour [0-23]
  H(n, t) {
    return I(n.getHours(), t.length);
  },
  // Minute
  m(n, t) {
    return I(n.getMinutes(), t.length);
  },
  // Second
  s(n, t) {
    return I(n.getSeconds(), t.length);
  },
  // Fraction of second
  S(n, t) {
    const e = t.length, i = n.getMilliseconds(), s = Math.trunc(
      i * Math.pow(10, e - 3)
    );
    return I(s, t.length);
  }
}, ne = {
  midnight: "midnight",
  noon: "noon",
  morning: "morning",
  afternoon: "afternoon",
  evening: "evening",
  night: "night"
}, br = {
  // Era
  G: function(n, t, e) {
    const i = n.getFullYear() > 0 ? 1 : 0;
    switch (t) {
      // AD, BC
      case "G":
      case "GG":
      case "GGG":
        return e.era(i, { width: "abbreviated" });
      // A, B
      case "GGGGG":
        return e.era(i, { width: "narrow" });
      // Anno Domini, Before Christ
      case "GGGG":
      default:
        return e.era(i, { width: "wide" });
    }
  },
  // Year
  y: function(n, t, e) {
    if (t === "yo") {
      const i = n.getFullYear(), s = i > 0 ? i : 1 - i;
      return e.ordinalNumber(s, { unit: "year" });
    }
    return Mt.y(n, t);
  },
  // Local week-numbering year
  Y: function(n, t, e, i) {
    const s = Hi(n, i), r = s > 0 ? s : 1 - s;
    if (t === "YY") {
      const o = r % 100;
      return I(o, 2);
    }
    return t === "Yo" ? e.ordinalNumber(r, { unit: "year" }) : I(r, t.length);
  },
  // ISO week-numbering year
  R: function(n, t) {
    const e = vo(n);
    return I(e, t.length);
  },
  // Extended year. This is a single number designating the year of this calendar system.
  // The main difference between `y` and `u` localizers are B.C. years:
  // | Year | `y` | `u` |
  // |------|-----|-----|
  // | AC 1 |   1 |   1 |
  // | BC 1 |   1 |   0 |
  // | BC 2 |   2 |  -1 |
  // Also `yy` always returns the last two digits of a year,
  // while `uu` pads single digit years to 2 characters and returns other years unchanged.
  u: function(n, t) {
    const e = n.getFullYear();
    return I(e, t.length);
  },
  // Quarter
  Q: function(n, t, e) {
    const i = Math.ceil((n.getMonth() + 1) / 3);
    switch (t) {
      // 1, 2, 3, 4
      case "Q":
        return String(i);
      // 01, 02, 03, 04
      case "QQ":
        return I(i, 2);
      // 1st, 2nd, 3rd, 4th
      case "Qo":
        return e.ordinalNumber(i, { unit: "quarter" });
      // Q1, Q2, Q3, Q4
      case "QQQ":
        return e.quarter(i, {
          width: "abbreviated",
          context: "formatting"
        });
      // 1, 2, 3, 4 (narrow quarter; could be not numerical)
      case "QQQQQ":
        return e.quarter(i, {
          width: "narrow",
          context: "formatting"
        });
      // 1st quarter, 2nd quarter, ...
      case "QQQQ":
      default:
        return e.quarter(i, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Stand-alone quarter
  q: function(n, t, e) {
    const i = Math.ceil((n.getMonth() + 1) / 3);
    switch (t) {
      // 1, 2, 3, 4
      case "q":
        return String(i);
      // 01, 02, 03, 04
      case "qq":
        return I(i, 2);
      // 1st, 2nd, 3rd, 4th
      case "qo":
        return e.ordinalNumber(i, { unit: "quarter" });
      // Q1, Q2, Q3, Q4
      case "qqq":
        return e.quarter(i, {
          width: "abbreviated",
          context: "standalone"
        });
      // 1, 2, 3, 4 (narrow quarter; could be not numerical)
      case "qqqqq":
        return e.quarter(i, {
          width: "narrow",
          context: "standalone"
        });
      // 1st quarter, 2nd quarter, ...
      case "qqqq":
      default:
        return e.quarter(i, {
          width: "wide",
          context: "standalone"
        });
    }
  },
  // Month
  M: function(n, t, e) {
    const i = n.getMonth();
    switch (t) {
      case "M":
      case "MM":
        return Mt.M(n, t);
      // 1st, 2nd, ..., 12th
      case "Mo":
        return e.ordinalNumber(i + 1, { unit: "month" });
      // Jan, Feb, ..., Dec
      case "MMM":
        return e.month(i, {
          width: "abbreviated",
          context: "formatting"
        });
      // J, F, ..., D
      case "MMMMM":
        return e.month(i, {
          width: "narrow",
          context: "formatting"
        });
      // January, February, ..., December
      case "MMMM":
      default:
        return e.month(i, { width: "wide", context: "formatting" });
    }
  },
  // Stand-alone month
  L: function(n, t, e) {
    const i = n.getMonth();
    switch (t) {
      // 1, 2, ..., 12
      case "L":
        return String(i + 1);
      // 01, 02, ..., 12
      case "LL":
        return I(i + 1, 2);
      // 1st, 2nd, ..., 12th
      case "Lo":
        return e.ordinalNumber(i + 1, { unit: "month" });
      // Jan, Feb, ..., Dec
      case "LLL":
        return e.month(i, {
          width: "abbreviated",
          context: "standalone"
        });
      // J, F, ..., D
      case "LLLLL":
        return e.month(i, {
          width: "narrow",
          context: "standalone"
        });
      // January, February, ..., December
      case "LLLL":
      default:
        return e.month(i, { width: "wide", context: "standalone" });
    }
  },
  // Local week of year
  w: function(n, t, e, i) {
    const s = Eo(n, i);
    return t === "wo" ? e.ordinalNumber(s, { unit: "week" }) : I(s, t.length);
  },
  // ISO week of year
  I: function(n, t, e) {
    const i = Ao(n);
    return t === "Io" ? e.ordinalNumber(i, { unit: "week" }) : I(i, t.length);
  },
  // Day of the month
  d: function(n, t, e) {
    return t === "do" ? e.ordinalNumber(n.getDate(), { unit: "date" }) : Mt.d(n, t);
  },
  // Day of year
  D: function(n, t, e) {
    const i = Ed(n);
    return t === "Do" ? e.ordinalNumber(i, { unit: "dayOfYear" }) : I(i, t.length);
  },
  // Day of week
  E: function(n, t, e) {
    const i = n.getDay();
    switch (t) {
      // Tue
      case "E":
      case "EE":
      case "EEE":
        return e.day(i, {
          width: "abbreviated",
          context: "formatting"
        });
      // T
      case "EEEEE":
        return e.day(i, {
          width: "narrow",
          context: "formatting"
        });
      // Tu
      case "EEEEEE":
        return e.day(i, {
          width: "short",
          context: "formatting"
        });
      // Tuesday
      case "EEEE":
      default:
        return e.day(i, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Local day of week
  e: function(n, t, e, i) {
    const s = n.getDay(), r = (s - i.weekStartsOn + 8) % 7 || 7;
    switch (t) {
      // Numerical value (Nth day of week with current locale or weekStartsOn)
      case "e":
        return String(r);
      // Padded numerical value
      case "ee":
        return I(r, 2);
      // 1st, 2nd, ..., 7th
      case "eo":
        return e.ordinalNumber(r, { unit: "day" });
      case "eee":
        return e.day(s, {
          width: "abbreviated",
          context: "formatting"
        });
      // T
      case "eeeee":
        return e.day(s, {
          width: "narrow",
          context: "formatting"
        });
      // Tu
      case "eeeeee":
        return e.day(s, {
          width: "short",
          context: "formatting"
        });
      // Tuesday
      case "eeee":
      default:
        return e.day(s, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Stand-alone local day of week
  c: function(n, t, e, i) {
    const s = n.getDay(), r = (s - i.weekStartsOn + 8) % 7 || 7;
    switch (t) {
      // Numerical value (same as in `e`)
      case "c":
        return String(r);
      // Padded numerical value
      case "cc":
        return I(r, t.length);
      // 1st, 2nd, ..., 7th
      case "co":
        return e.ordinalNumber(r, { unit: "day" });
      case "ccc":
        return e.day(s, {
          width: "abbreviated",
          context: "standalone"
        });
      // T
      case "ccccc":
        return e.day(s, {
          width: "narrow",
          context: "standalone"
        });
      // Tu
      case "cccccc":
        return e.day(s, {
          width: "short",
          context: "standalone"
        });
      // Tuesday
      case "cccc":
      default:
        return e.day(s, {
          width: "wide",
          context: "standalone"
        });
    }
  },
  // ISO day of week
  i: function(n, t, e) {
    const i = n.getDay(), s = i === 0 ? 7 : i;
    switch (t) {
      // 2
      case "i":
        return String(s);
      // 02
      case "ii":
        return I(s, t.length);
      // 2nd
      case "io":
        return e.ordinalNumber(s, { unit: "day" });
      // Tue
      case "iii":
        return e.day(i, {
          width: "abbreviated",
          context: "formatting"
        });
      // T
      case "iiiii":
        return e.day(i, {
          width: "narrow",
          context: "formatting"
        });
      // Tu
      case "iiiiii":
        return e.day(i, {
          width: "short",
          context: "formatting"
        });
      // Tuesday
      case "iiii":
      default:
        return e.day(i, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // AM or PM
  a: function(n, t, e) {
    const s = n.getHours() / 12 >= 1 ? "pm" : "am";
    switch (t) {
      case "a":
      case "aa":
        return e.dayPeriod(s, {
          width: "abbreviated",
          context: "formatting"
        });
      case "aaa":
        return e.dayPeriod(s, {
          width: "abbreviated",
          context: "formatting"
        }).toLowerCase();
      case "aaaaa":
        return e.dayPeriod(s, {
          width: "narrow",
          context: "formatting"
        });
      case "aaaa":
      default:
        return e.dayPeriod(s, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // AM, PM, midnight, noon
  b: function(n, t, e) {
    const i = n.getHours();
    let s;
    switch (i === 12 ? s = ne.noon : i === 0 ? s = ne.midnight : s = i / 12 >= 1 ? "pm" : "am", t) {
      case "b":
      case "bb":
        return e.dayPeriod(s, {
          width: "abbreviated",
          context: "formatting"
        });
      case "bbb":
        return e.dayPeriod(s, {
          width: "abbreviated",
          context: "formatting"
        }).toLowerCase();
      case "bbbbb":
        return e.dayPeriod(s, {
          width: "narrow",
          context: "formatting"
        });
      case "bbbb":
      default:
        return e.dayPeriod(s, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // in the morning, in the afternoon, in the evening, at night
  B: function(n, t, e) {
    const i = n.getHours();
    let s;
    switch (i >= 17 ? s = ne.evening : i >= 12 ? s = ne.afternoon : i >= 4 ? s = ne.morning : s = ne.night, t) {
      case "B":
      case "BB":
      case "BBB":
        return e.dayPeriod(s, {
          width: "abbreviated",
          context: "formatting"
        });
      case "BBBBB":
        return e.dayPeriod(s, {
          width: "narrow",
          context: "formatting"
        });
      case "BBBB":
      default:
        return e.dayPeriod(s, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Hour [1-12]
  h: function(n, t, e) {
    if (t === "ho") {
      let i = n.getHours() % 12;
      return i === 0 && (i = 12), e.ordinalNumber(i, { unit: "hour" });
    }
    return Mt.h(n, t);
  },
  // Hour [0-23]
  H: function(n, t, e) {
    return t === "Ho" ? e.ordinalNumber(n.getHours(), { unit: "hour" }) : Mt.H(n, t);
  },
  // Hour [0-11]
  K: function(n, t, e) {
    const i = n.getHours() % 12;
    return t === "Ko" ? e.ordinalNumber(i, { unit: "hour" }) : I(i, t.length);
  },
  // Hour [1-24]
  k: function(n, t, e) {
    let i = n.getHours();
    return i === 0 && (i = 24), t === "ko" ? e.ordinalNumber(i, { unit: "hour" }) : I(i, t.length);
  },
  // Minute
  m: function(n, t, e) {
    return t === "mo" ? e.ordinalNumber(n.getMinutes(), { unit: "minute" }) : Mt.m(n, t);
  },
  // Second
  s: function(n, t, e) {
    return t === "so" ? e.ordinalNumber(n.getSeconds(), { unit: "second" }) : Mt.s(n, t);
  },
  // Fraction of second
  S: function(n, t) {
    return Mt.S(n, t);
  },
  // Timezone (ISO-8601. If offset is 0, output is always `'Z'`)
  X: function(n, t, e) {
    const i = n.getTimezoneOffset();
    if (i === 0)
      return "Z";
    switch (t) {
      // Hours and optional minutes
      case "X":
        return _r(i);
      // Hours, minutes and optional seconds without `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `XX`
      case "XXXX":
      case "XX":
        return Yt(i);
      // Hours, minutes and optional seconds with `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `XXX`
      case "XXXXX":
      case "XXX":
      // Hours and minutes with `:` delimiter
      default:
        return Yt(i, ":");
    }
  },
  // Timezone (ISO-8601. If offset is 0, output is `'+00:00'` or equivalent)
  x: function(n, t, e) {
    const i = n.getTimezoneOffset();
    switch (t) {
      // Hours and optional minutes
      case "x":
        return _r(i);
      // Hours, minutes and optional seconds without `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `xx`
      case "xxxx":
      case "xx":
        return Yt(i);
      // Hours, minutes and optional seconds with `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `xxx`
      case "xxxxx":
      case "xxx":
      // Hours and minutes with `:` delimiter
      default:
        return Yt(i, ":");
    }
  },
  // Timezone (GMT)
  O: function(n, t, e) {
    const i = n.getTimezoneOffset();
    switch (t) {
      // Short
      case "O":
      case "OO":
      case "OOO":
        return "GMT" + yr(i, ":");
      // Long
      case "OOOO":
      default:
        return "GMT" + Yt(i, ":");
    }
  },
  // Timezone (specific non-location)
  z: function(n, t, e) {
    const i = n.getTimezoneOffset();
    switch (t) {
      // Short
      case "z":
      case "zz":
      case "zzz":
        return "GMT" + yr(i, ":");
      // Long
      case "zzzz":
      default:
        return "GMT" + Yt(i, ":");
    }
  },
  // Seconds timestamp
  t: function(n, t, e) {
    const i = Math.trunc(+n / 1e3);
    return I(i, t.length);
  },
  // Milliseconds timestamp
  T: function(n, t, e) {
    return I(+n, t.length);
  }
};
function yr(n, t = "") {
  const e = n > 0 ? "-" : "+", i = Math.abs(n), s = Math.trunc(i / 60), r = i % 60;
  return r === 0 ? e + String(s) : e + String(s) + t + I(r, 2);
}
function _r(n, t) {
  return n % 60 === 0 ? (n > 0 ? "-" : "+") + I(Math.abs(n) / 60, 2) : Yt(n, t);
}
function Yt(n, t = "") {
  const e = n > 0 ? "-" : "+", i = Math.abs(n), s = I(Math.trunc(i / 60), 2), r = I(i % 60, 2);
  return e + s + t + r;
}
const xr = (n, t) => {
  switch (n) {
    case "P":
      return t.date({ width: "short" });
    case "PP":
      return t.date({ width: "medium" });
    case "PPP":
      return t.date({ width: "long" });
    case "PPPP":
    default:
      return t.date({ width: "full" });
  }
}, $o = (n, t) => {
  switch (n) {
    case "p":
      return t.time({ width: "short" });
    case "pp":
      return t.time({ width: "medium" });
    case "ppp":
      return t.time({ width: "long" });
    case "pppp":
    default:
      return t.time({ width: "full" });
  }
}, Id = (n, t) => {
  const e = n.match(/(P+)(p+)?/) || [], i = e[1], s = e[2];
  if (!s)
    return xr(n, t);
  let r;
  switch (i) {
    case "P":
      r = t.dateTime({ width: "short" });
      break;
    case "PP":
      r = t.dateTime({ width: "medium" });
      break;
    case "PPP":
      r = t.dateTime({ width: "long" });
      break;
    case "PPPP":
    default:
      r = t.dateTime({ width: "full" });
      break;
  }
  return r.replace("{{date}}", xr(i, t)).replace("{{time}}", $o(s, t));
}, yi = {
  p: $o,
  P: Id
}, Ld = /^D+$/, Fd = /^Y+$/, zd = ["D", "DD", "YY", "YYYY"];
function Io(n) {
  return Ld.test(n);
}
function Lo(n) {
  return Fd.test(n);
}
function _i(n, t, e) {
  const i = Rd(n, t, e);
  if (console.warn(i), zd.includes(n)) throw new RangeError(i);
}
function Rd(n, t, e) {
  const i = n[0] === "Y" ? "years" : "days of the month";
  return `Use \`${n.toLowerCase()}\` instead of \`${n}\` (in \`${t}\`) for formatting ${i} to the input \`${e}\`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md`;
}
const Hd = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g, Nd = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g, Wd = /^'([^]*?)'?$/, Bd = /''/g, Yd = /[a-zA-Z]/;
function jd(n, t, e) {
  var h, u, d, f, g, m, p, b;
  const i = Zt(), s = (e == null ? void 0 : e.locale) ?? i.locale ?? Co, r = (e == null ? void 0 : e.firstWeekContainsDate) ?? ((u = (h = e == null ? void 0 : e.locale) == null ? void 0 : h.options) == null ? void 0 : u.firstWeekContainsDate) ?? i.firstWeekContainsDate ?? ((f = (d = i.locale) == null ? void 0 : d.options) == null ? void 0 : f.firstWeekContainsDate) ?? 1, o = (e == null ? void 0 : e.weekStartsOn) ?? ((m = (g = e == null ? void 0 : e.locale) == null ? void 0 : g.options) == null ? void 0 : m.weekStartsOn) ?? i.weekStartsOn ?? ((b = (p = i.locale) == null ? void 0 : p.options) == null ? void 0 : b.weekStartsOn) ?? 0, a = T(n, e == null ? void 0 : e.in);
  if (!ko(a))
    throw new RangeError("Invalid time value");
  let c = t.match(Nd).map((_) => {
    const v = _[0];
    if (v === "p" || v === "P") {
      const M = yi[v];
      return M(_, s.formatLong);
    }
    return _;
  }).join("").match(Hd).map((_) => {
    if (_ === "''")
      return { isToken: !1, value: "'" };
    const v = _[0];
    if (v === "'")
      return { isToken: !1, value: Vd(_) };
    if (br[v])
      return { isToken: !0, value: _ };
    if (v.match(Yd))
      throw new RangeError(
        "Format string contains an unescaped latin alphabet character `" + v + "`"
      );
    return { isToken: !1, value: _ };
  });
  s.localize.preprocessor && (c = s.localize.preprocessor(a, c));
  const l = {
    firstWeekContainsDate: r,
    weekStartsOn: o,
    locale: s
  };
  return c.map((_) => {
    if (!_.isToken) return _.value;
    const v = _.value;
    (!(e != null && e.useAdditionalWeekYearTokens) && Lo(v) || !(e != null && e.useAdditionalDayOfYearTokens) && Io(v)) && _i(v, t, String(n));
    const M = br[v[0]];
    return M(a, v, s.localize, l);
  }).join("");
}
function Vd(n) {
  const t = n.match(Wd);
  return t ? t[1].replace(Bd, "'") : n;
}
function Ud() {
  return Object.assign({}, Zt());
}
function qd(n, t) {
  const e = T(n, t == null ? void 0 : t.in).getDay();
  return e === 0 ? 7 : e;
}
function Xd(n, t) {
  const e = Qd(t) ? new t(0) : N(t, 0);
  return e.setFullYear(n.getFullYear(), n.getMonth(), n.getDate()), e.setHours(
    n.getHours(),
    n.getMinutes(),
    n.getSeconds(),
    n.getMilliseconds()
  ), e;
}
function Qd(n) {
  var t;
  return typeof n == "function" && ((t = n.prototype) == null ? void 0 : t.constructor) === n;
}
const Gd = 10;
class Fo {
  constructor() {
    y(this, "subPriority", 0);
  }
  validate(t, e) {
    return !0;
  }
}
class Kd extends Fo {
  constructor(t, e, i, s, r) {
    super(), this.value = t, this.validateValue = e, this.setValue = i, this.priority = s, r && (this.subPriority = r);
  }
  validate(t, e) {
    return this.validateValue(t, this.value, e);
  }
  set(t, e, i) {
    return this.setValue(t, e, this.value, i);
  }
}
class Zd extends Fo {
  constructor(e, i) {
    super();
    y(this, "priority", Gd);
    y(this, "subPriority", -1);
    this.context = e || ((s) => N(i, s));
  }
  set(e, i) {
    return i.timestampIsSet ? e : N(e, Xd(e, this.context));
  }
}
class $ {
  run(t, e, i, s) {
    const r = this.parse(t, e, i, s);
    return r ? {
      setter: new Kd(
        r.value,
        this.validate,
        this.set,
        this.priority,
        this.subPriority
      ),
      rest: r.rest
    } : null;
  }
  validate(t, e, i) {
    return !0;
  }
}
class Jd extends $ {
  constructor() {
    super(...arguments);
    y(this, "priority", 140);
    y(this, "incompatibleTokens", ["R", "u", "t", "T"]);
  }
  parse(e, i, s) {
    switch (i) {
      // AD, BC
      case "G":
      case "GG":
      case "GGG":
        return s.era(e, { width: "abbreviated" }) || s.era(e, { width: "narrow" });
      // A, B
      case "GGGGG":
        return s.era(e, { width: "narrow" });
      // Anno Domini, Before Christ
      case "GGGG":
      default:
        return s.era(e, { width: "wide" }) || s.era(e, { width: "abbreviated" }) || s.era(e, { width: "narrow" });
    }
  }
  set(e, i, s) {
    return i.era = s, e.setFullYear(s, 0, 1), e.setHours(0, 0, 0, 0), e;
  }
}
const Y = {
  month: /^(1[0-2]|0?\d)/,
  // 0 to 12
  date: /^(3[0-1]|[0-2]?\d)/,
  // 0 to 31
  dayOfYear: /^(36[0-6]|3[0-5]\d|[0-2]?\d?\d)/,
  // 0 to 366
  week: /^(5[0-3]|[0-4]?\d)/,
  // 0 to 53
  hour23h: /^(2[0-3]|[0-1]?\d)/,
  // 0 to 23
  hour24h: /^(2[0-4]|[0-1]?\d)/,
  // 0 to 24
  hour11h: /^(1[0-1]|0?\d)/,
  // 0 to 11
  hour12h: /^(1[0-2]|0?\d)/,
  // 0 to 12
  minute: /^[0-5]?\d/,
  // 0 to 59
  second: /^[0-5]?\d/,
  // 0 to 59
  singleDigit: /^\d/,
  // 0 to 9
  twoDigits: /^\d{1,2}/,
  // 0 to 99
  threeDigits: /^\d{1,3}/,
  // 0 to 999
  fourDigits: /^\d{1,4}/,
  // 0 to 9999
  anyDigitsSigned: /^-?\d+/,
  singleDigitSigned: /^-?\d/,
  // 0 to 9, -0 to -9
  twoDigitsSigned: /^-?\d{1,2}/,
  // 0 to 99, -0 to -99
  threeDigitsSigned: /^-?\d{1,3}/,
  // 0 to 999, -0 to -999
  fourDigitsSigned: /^-?\d{1,4}/
  // 0 to 9999, -0 to -9999
}, gt = {
  basicOptionalMinutes: /^([+-])(\d{2})(\d{2})?|Z/,
  basic: /^([+-])(\d{2})(\d{2})|Z/,
  basicOptionalSeconds: /^([+-])(\d{2})(\d{2})((\d{2}))?|Z/,
  extended: /^([+-])(\d{2}):(\d{2})|Z/,
  extendedOptionalSeconds: /^([+-])(\d{2}):(\d{2})(:(\d{2}))?|Z/
};
function j(n, t) {
  return n && {
    value: t(n.value),
    rest: n.rest
  };
}
function H(n, t) {
  const e = t.match(n);
  return e ? {
    value: parseInt(e[0], 10),
    rest: t.slice(e[0].length)
  } : null;
}
function mt(n, t) {
  const e = t.match(n);
  if (!e)
    return null;
  if (e[0] === "Z")
    return {
      value: 0,
      rest: t.slice(1)
    };
  const i = e[1] === "+" ? 1 : -1, s = e[2] ? parseInt(e[2], 10) : 0, r = e[3] ? parseInt(e[3], 10) : 0, o = e[5] ? parseInt(e[5], 10) : 0;
  return {
    value: i * (s * Ke + r * Ge + o * Su),
    rest: t.slice(e[0].length)
  };
}
function zo(n) {
  return H(Y.anyDigitsSigned, n);
}
function W(n, t) {
  switch (n) {
    case 1:
      return H(Y.singleDigit, t);
    case 2:
      return H(Y.twoDigits, t);
    case 3:
      return H(Y.threeDigits, t);
    case 4:
      return H(Y.fourDigits, t);
    default:
      return H(new RegExp("^\\d{1," + n + "}"), t);
  }
}
function Cn(n, t) {
  switch (n) {
    case 1:
      return H(Y.singleDigitSigned, t);
    case 2:
      return H(Y.twoDigitsSigned, t);
    case 3:
      return H(Y.threeDigitsSigned, t);
    case 4:
      return H(Y.fourDigitsSigned, t);
    default:
      return H(new RegExp("^-?\\d{1," + n + "}"), t);
  }
}
function Ni(n) {
  switch (n) {
    case "morning":
      return 4;
    case "evening":
      return 17;
    case "pm":
    case "noon":
    case "afternoon":
      return 12;
    case "am":
    case "midnight":
    case "night":
    default:
      return 0;
  }
}
function Ro(n, t) {
  const e = t > 0, i = e ? t : 1 - t;
  let s;
  if (i <= 50)
    s = n || 100;
  else {
    const r = i + 50, o = Math.trunc(r / 100) * 100, a = n >= r % 100;
    s = n + o - (a ? 100 : 0);
  }
  return e ? s : 1 - s;
}
function Ho(n) {
  return n % 400 === 0 || n % 4 === 0 && n % 100 !== 0;
}
class tf extends $ {
  constructor() {
    super(...arguments);
    y(this, "priority", 130);
    y(this, "incompatibleTokens", ["Y", "R", "u", "w", "I", "i", "e", "c", "t", "T"]);
  }
  parse(e, i, s) {
    const r = (o) => ({
      year: o,
      isTwoDigitYear: i === "yy"
    });
    switch (i) {
      case "y":
        return j(W(4, e), r);
      case "yo":
        return j(
          s.ordinalNumber(e, {
            unit: "year"
          }),
          r
        );
      default:
        return j(W(i.length, e), r);
    }
  }
  validate(e, i) {
    return i.isTwoDigitYear || i.year > 0;
  }
  set(e, i, s) {
    const r = e.getFullYear();
    if (s.isTwoDigitYear) {
      const a = Ro(
        s.year,
        r
      );
      return e.setFullYear(a, 0, 1), e.setHours(0, 0, 0, 0), e;
    }
    const o = !("era" in i) || i.era === 1 ? s.year : 1 - s.year;
    return e.setFullYear(o, 0, 1), e.setHours(0, 0, 0, 0), e;
  }
}
class ef extends $ {
  constructor() {
    super(...arguments);
    y(this, "priority", 130);
    y(this, "incompatibleTokens", [
      "y",
      "R",
      "u",
      "Q",
      "q",
      "M",
      "L",
      "I",
      "d",
      "D",
      "i",
      "t",
      "T"
    ]);
  }
  parse(e, i, s) {
    const r = (o) => ({
      year: o,
      isTwoDigitYear: i === "YY"
    });
    switch (i) {
      case "Y":
        return j(W(4, e), r);
      case "Yo":
        return j(
          s.ordinalNumber(e, {
            unit: "year"
          }),
          r
        );
      default:
        return j(W(i.length, e), r);
    }
  }
  validate(e, i) {
    return i.isTwoDigitYear || i.year > 0;
  }
  set(e, i, s, r) {
    const o = Hi(e, r);
    if (s.isTwoDigitYear) {
      const c = Ro(
        s.year,
        o
      );
      return e.setFullYear(
        c,
        0,
        r.firstWeekContainsDate
      ), e.setHours(0, 0, 0, 0), pt(e, r);
    }
    const a = !("era" in i) || i.era === 1 ? s.year : 1 - s.year;
    return e.setFullYear(a, 0, r.firstWeekContainsDate), e.setHours(0, 0, 0, 0), pt(e, r);
  }
}
class nf extends $ {
  constructor() {
    super(...arguments);
    y(this, "priority", 130);
    y(this, "incompatibleTokens", [
      "G",
      "y",
      "Y",
      "u",
      "Q",
      "q",
      "M",
      "L",
      "w",
      "d",
      "D",
      "e",
      "c",
      "t",
      "T"
    ]);
  }
  parse(e, i) {
    return Cn(i === "R" ? 4 : i.length, e);
  }
  set(e, i, s) {
    const r = N(e, 0);
    return r.setFullYear(s, 0, 4), r.setHours(0, 0, 0, 0), de(r);
  }
}
class sf extends $ {
  constructor() {
    super(...arguments);
    y(this, "priority", 130);
    y(this, "incompatibleTokens", ["G", "y", "Y", "R", "w", "I", "i", "e", "c", "t", "T"]);
  }
  parse(e, i) {
    return Cn(i === "u" ? 4 : i.length, e);
  }
  set(e, i, s) {
    return e.setFullYear(s, 0, 1), e.setHours(0, 0, 0, 0), e;
  }
}
class rf extends $ {
  constructor() {
    super(...arguments);
    y(this, "priority", 120);
    y(this, "incompatibleTokens", [
      "Y",
      "R",
      "q",
      "M",
      "L",
      "w",
      "I",
      "d",
      "D",
      "i",
      "e",
      "c",
      "t",
      "T"
    ]);
  }
  parse(e, i, s) {
    switch (i) {
      // 1, 2, 3, 4
      case "Q":
      case "QQ":
        return W(i.length, e);
      // 1st, 2nd, 3rd, 4th
      case "Qo":
        return s.ordinalNumber(e, { unit: "quarter" });
      // Q1, Q2, Q3, Q4
      case "QQQ":
        return s.quarter(e, {
          width: "abbreviated",
          context: "formatting"
        }) || s.quarter(e, {
          width: "narrow",
          context: "formatting"
        });
      // 1, 2, 3, 4 (narrow quarter; could be not numerical)
      case "QQQQQ":
        return s.quarter(e, {
          width: "narrow",
          context: "formatting"
        });
      // 1st quarter, 2nd quarter, ...
      case "QQQQ":
      default:
        return s.quarter(e, {
          width: "wide",
          context: "formatting"
        }) || s.quarter(e, {
          width: "abbreviated",
          context: "formatting"
        }) || s.quarter(e, {
          width: "narrow",
          context: "formatting"
        });
    }
  }
  validate(e, i) {
    return i >= 1 && i <= 4;
  }
  set(e, i, s) {
    return e.setMonth((s - 1) * 3, 1), e.setHours(0, 0, 0, 0), e;
  }
}
class of extends $ {
  constructor() {
    super(...arguments);
    y(this, "priority", 120);
    y(this, "incompatibleTokens", [
      "Y",
      "R",
      "Q",
      "M",
      "L",
      "w",
      "I",
      "d",
      "D",
      "i",
      "e",
      "c",
      "t",
      "T"
    ]);
  }
  parse(e, i, s) {
    switch (i) {
      // 1, 2, 3, 4
      case "q":
      case "qq":
        return W(i.length, e);
      // 1st, 2nd, 3rd, 4th
      case "qo":
        return s.ordinalNumber(e, { unit: "quarter" });
      // Q1, Q2, Q3, Q4
      case "qqq":
        return s.quarter(e, {
          width: "abbreviated",
          context: "standalone"
        }) || s.quarter(e, {
          width: "narrow",
          context: "standalone"
        });
      // 1, 2, 3, 4 (narrow quarter; could be not numerical)
      case "qqqqq":
        return s.quarter(e, {
          width: "narrow",
          context: "standalone"
        });
      // 1st quarter, 2nd quarter, ...
      case "qqqq":
      default:
        return s.quarter(e, {
          width: "wide",
          context: "standalone"
        }) || s.quarter(e, {
          width: "abbreviated",
          context: "standalone"
        }) || s.quarter(e, {
          width: "narrow",
          context: "standalone"
        });
    }
  }
  validate(e, i) {
    return i >= 1 && i <= 4;
  }
  set(e, i, s) {
    return e.setMonth((s - 1) * 3, 1), e.setHours(0, 0, 0, 0), e;
  }
}
class af extends $ {
  constructor() {
    super(...arguments);
    y(this, "incompatibleTokens", [
      "Y",
      "R",
      "q",
      "Q",
      "L",
      "w",
      "I",
      "D",
      "i",
      "e",
      "c",
      "t",
      "T"
    ]);
    y(this, "priority", 110);
  }
  parse(e, i, s) {
    const r = (o) => o - 1;
    switch (i) {
      // 1, 2, ..., 12
      case "M":
        return j(
          H(Y.month, e),
          r
        );
      // 01, 02, ..., 12
      case "MM":
        return j(W(2, e), r);
      // 1st, 2nd, ..., 12th
      case "Mo":
        return j(
          s.ordinalNumber(e, {
            unit: "month"
          }),
          r
        );
      // Jan, Feb, ..., Dec
      case "MMM":
        return s.month(e, {
          width: "abbreviated",
          context: "formatting"
        }) || s.month(e, { width: "narrow", context: "formatting" });
      // J, F, ..., D
      case "MMMMM":
        return s.month(e, {
          width: "narrow",
          context: "formatting"
        });
      // January, February, ..., December
      case "MMMM":
      default:
        return s.month(e, { width: "wide", context: "formatting" }) || s.month(e, {
          width: "abbreviated",
          context: "formatting"
        }) || s.month(e, { width: "narrow", context: "formatting" });
    }
  }
  validate(e, i) {
    return i >= 0 && i <= 11;
  }
  set(e, i, s) {
    return e.setMonth(s, 1), e.setHours(0, 0, 0, 0), e;
  }
}
class cf extends $ {
  constructor() {
    super(...arguments);
    y(this, "priority", 110);
    y(this, "incompatibleTokens", [
      "Y",
      "R",
      "q",
      "Q",
      "M",
      "w",
      "I",
      "D",
      "i",
      "e",
      "c",
      "t",
      "T"
    ]);
  }
  parse(e, i, s) {
    const r = (o) => o - 1;
    switch (i) {
      // 1, 2, ..., 12
      case "L":
        return j(
          H(Y.month, e),
          r
        );
      // 01, 02, ..., 12
      case "LL":
        return j(W(2, e), r);
      // 1st, 2nd, ..., 12th
      case "Lo":
        return j(
          s.ordinalNumber(e, {
            unit: "month"
          }),
          r
        );
      // Jan, Feb, ..., Dec
      case "LLL":
        return s.month(e, {
          width: "abbreviated",
          context: "standalone"
        }) || s.month(e, { width: "narrow", context: "standalone" });
      // J, F, ..., D
      case "LLLLL":
        return s.month(e, {
          width: "narrow",
          context: "standalone"
        });
      // January, February, ..., December
      case "LLLL":
      default:
        return s.month(e, { width: "wide", context: "standalone" }) || s.month(e, {
          width: "abbreviated",
          context: "standalone"
        }) || s.month(e, { width: "narrow", context: "standalone" });
    }
  }
  validate(e, i) {
    return i >= 0 && i <= 11;
  }
  set(e, i, s) {
    return e.setMonth(s, 1), e.setHours(0, 0, 0, 0), e;
  }
}
function lf(n, t, e) {
  const i = T(n, e == null ? void 0 : e.in), s = Eo(i, e) - t;
  return i.setDate(i.getDate() - s * 7), T(i, e == null ? void 0 : e.in);
}
class hf extends $ {
  constructor() {
    super(...arguments);
    y(this, "priority", 100);
    y(this, "incompatibleTokens", [
      "y",
      "R",
      "u",
      "q",
      "Q",
      "M",
      "L",
      "I",
      "d",
      "D",
      "i",
      "t",
      "T"
    ]);
  }
  parse(e, i, s) {
    switch (i) {
      case "w":
        return H(Y.week, e);
      case "wo":
        return s.ordinalNumber(e, { unit: "week" });
      default:
        return W(i.length, e);
    }
  }
  validate(e, i) {
    return i >= 1 && i <= 53;
  }
  set(e, i, s, r) {
    return pt(lf(e, s, r), r);
  }
}
function uf(n, t, e) {
  const i = T(n, e == null ? void 0 : e.in), s = Ao(i, e) - t;
  return i.setDate(i.getDate() - s * 7), i;
}
class df extends $ {
  constructor() {
    super(...arguments);
    y(this, "priority", 100);
    y(this, "incompatibleTokens", [
      "y",
      "Y",
      "u",
      "q",
      "Q",
      "M",
      "L",
      "w",
      "d",
      "D",
      "e",
      "c",
      "t",
      "T"
    ]);
  }
  parse(e, i, s) {
    switch (i) {
      case "I":
        return H(Y.week, e);
      case "Io":
        return s.ordinalNumber(e, { unit: "week" });
      default:
        return W(i.length, e);
    }
  }
  validate(e, i) {
    return i >= 1 && i <= 53;
  }
  set(e, i, s) {
    return de(uf(e, s));
  }
}
const ff = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], gf = [
  31,
  29,
  31,
  30,
  31,
  30,
  31,
  31,
  30,
  31,
  30,
  31
];
class mf extends $ {
  constructor() {
    super(...arguments);
    y(this, "priority", 90);
    y(this, "subPriority", 1);
    y(this, "incompatibleTokens", [
      "Y",
      "R",
      "q",
      "Q",
      "w",
      "I",
      "D",
      "i",
      "e",
      "c",
      "t",
      "T"
    ]);
  }
  parse(e, i, s) {
    switch (i) {
      case "d":
        return H(Y.date, e);
      case "do":
        return s.ordinalNumber(e, { unit: "date" });
      default:
        return W(i.length, e);
    }
  }
  validate(e, i) {
    const s = e.getFullYear(), r = Ho(s), o = e.getMonth();
    return r ? i >= 1 && i <= gf[o] : i >= 1 && i <= ff[o];
  }
  set(e, i, s) {
    return e.setDate(s), e.setHours(0, 0, 0, 0), e;
  }
}
class pf extends $ {
  constructor() {
    super(...arguments);
    y(this, "priority", 90);
    y(this, "subpriority", 1);
    y(this, "incompatibleTokens", [
      "Y",
      "R",
      "q",
      "Q",
      "M",
      "L",
      "w",
      "I",
      "d",
      "E",
      "i",
      "e",
      "c",
      "t",
      "T"
    ]);
  }
  parse(e, i, s) {
    switch (i) {
      case "D":
      case "DD":
        return H(Y.dayOfYear, e);
      case "Do":
        return s.ordinalNumber(e, { unit: "date" });
      default:
        return W(i.length, e);
    }
  }
  validate(e, i) {
    const s = e.getFullYear();
    return Ho(s) ? i >= 1 && i <= 366 : i >= 1 && i <= 365;
  }
  set(e, i, s) {
    return e.setMonth(0, s), e.setHours(0, 0, 0, 0), e;
  }
}
function Wi(n, t, e) {
  var u, d, f, g;
  const i = Zt(), s = (e == null ? void 0 : e.weekStartsOn) ?? ((d = (u = e == null ? void 0 : e.locale) == null ? void 0 : u.options) == null ? void 0 : d.weekStartsOn) ?? i.weekStartsOn ?? ((g = (f = i.locale) == null ? void 0 : f.options) == null ? void 0 : g.weekStartsOn) ?? 0, r = T(n, e == null ? void 0 : e.in), o = r.getDay(), c = (t % 7 + 7) % 7, l = 7 - s, h = t < 0 || t > 6 ? t - (o + l) % 7 : (c + l) % 7 - (o + l) % 7;
  return Hn(r, h, e);
}
class bf extends $ {
  constructor() {
    super(...arguments);
    y(this, "priority", 90);
    y(this, "incompatibleTokens", ["D", "i", "e", "c", "t", "T"]);
  }
  parse(e, i, s) {
    switch (i) {
      // Tue
      case "E":
      case "EE":
      case "EEE":
        return s.day(e, {
          width: "abbreviated",
          context: "formatting"
        }) || s.day(e, { width: "short", context: "formatting" }) || s.day(e, { width: "narrow", context: "formatting" });
      // T
      case "EEEEE":
        return s.day(e, {
          width: "narrow",
          context: "formatting"
        });
      // Tu
      case "EEEEEE":
        return s.day(e, { width: "short", context: "formatting" }) || s.day(e, { width: "narrow", context: "formatting" });
      // Tuesday
      case "EEEE":
      default:
        return s.day(e, { width: "wide", context: "formatting" }) || s.day(e, {
          width: "abbreviated",
          context: "formatting"
        }) || s.day(e, { width: "short", context: "formatting" }) || s.day(e, { width: "narrow", context: "formatting" });
    }
  }
  validate(e, i) {
    return i >= 0 && i <= 6;
  }
  set(e, i, s, r) {
    return e = Wi(e, s, r), e.setHours(0, 0, 0, 0), e;
  }
}
class yf extends $ {
  constructor() {
    super(...arguments);
    y(this, "priority", 90);
    y(this, "incompatibleTokens", [
      "y",
      "R",
      "u",
      "q",
      "Q",
      "M",
      "L",
      "I",
      "d",
      "D",
      "E",
      "i",
      "c",
      "t",
      "T"
    ]);
  }
  parse(e, i, s, r) {
    const o = (a) => {
      const c = Math.floor((a - 1) / 7) * 7;
      return (a + r.weekStartsOn + 6) % 7 + c;
    };
    switch (i) {
      // 3
      case "e":
      case "ee":
        return j(W(i.length, e), o);
      // 3rd
      case "eo":
        return j(
          s.ordinalNumber(e, {
            unit: "day"
          }),
          o
        );
      // Tue
      case "eee":
        return s.day(e, {
          width: "abbreviated",
          context: "formatting"
        }) || s.day(e, { width: "short", context: "formatting" }) || s.day(e, { width: "narrow", context: "formatting" });
      // T
      case "eeeee":
        return s.day(e, {
          width: "narrow",
          context: "formatting"
        });
      // Tu
      case "eeeeee":
        return s.day(e, { width: "short", context: "formatting" }) || s.day(e, { width: "narrow", context: "formatting" });
      // Tuesday
      case "eeee":
      default:
        return s.day(e, { width: "wide", context: "formatting" }) || s.day(e, {
          width: "abbreviated",
          context: "formatting"
        }) || s.day(e, { width: "short", context: "formatting" }) || s.day(e, { width: "narrow", context: "formatting" });
    }
  }
  validate(e, i) {
    return i >= 0 && i <= 6;
  }
  set(e, i, s, r) {
    return e = Wi(e, s, r), e.setHours(0, 0, 0, 0), e;
  }
}
class _f extends $ {
  constructor() {
    super(...arguments);
    y(this, "priority", 90);
    y(this, "incompatibleTokens", [
      "y",
      "R",
      "u",
      "q",
      "Q",
      "M",
      "L",
      "I",
      "d",
      "D",
      "E",
      "i",
      "e",
      "t",
      "T"
    ]);
  }
  parse(e, i, s, r) {
    const o = (a) => {
      const c = Math.floor((a - 1) / 7) * 7;
      return (a + r.weekStartsOn + 6) % 7 + c;
    };
    switch (i) {
      // 3
      case "c":
      case "cc":
        return j(W(i.length, e), o);
      // 3rd
      case "co":
        return j(
          s.ordinalNumber(e, {
            unit: "day"
          }),
          o
        );
      // Tue
      case "ccc":
        return s.day(e, {
          width: "abbreviated",
          context: "standalone"
        }) || s.day(e, { width: "short", context: "standalone" }) || s.day(e, { width: "narrow", context: "standalone" });
      // T
      case "ccccc":
        return s.day(e, {
          width: "narrow",
          context: "standalone"
        });
      // Tu
      case "cccccc":
        return s.day(e, { width: "short", context: "standalone" }) || s.day(e, { width: "narrow", context: "standalone" });
      // Tuesday
      case "cccc":
      default:
        return s.day(e, { width: "wide", context: "standalone" }) || s.day(e, {
          width: "abbreviated",
          context: "standalone"
        }) || s.day(e, { width: "short", context: "standalone" }) || s.day(e, { width: "narrow", context: "standalone" });
    }
  }
  validate(e, i) {
    return i >= 0 && i <= 6;
  }
  set(e, i, s, r) {
    return e = Wi(e, s, r), e.setHours(0, 0, 0, 0), e;
  }
}
function xf(n, t, e) {
  const i = T(n, e == null ? void 0 : e.in), s = qd(i, e), r = t - s;
  return Hn(i, r, e);
}
class wf extends $ {
  constructor() {
    super(...arguments);
    y(this, "priority", 90);
    y(this, "incompatibleTokens", [
      "y",
      "Y",
      "u",
      "q",
      "Q",
      "M",
      "L",
      "w",
      "d",
      "D",
      "E",
      "e",
      "c",
      "t",
      "T"
    ]);
  }
  parse(e, i, s) {
    const r = (o) => o === 0 ? 7 : o;
    switch (i) {
      // 2
      case "i":
      case "ii":
        return W(i.length, e);
      // 2nd
      case "io":
        return s.ordinalNumber(e, { unit: "day" });
      // Tue
      case "iii":
        return j(
          s.day(e, {
            width: "abbreviated",
            context: "formatting"
          }) || s.day(e, {
            width: "short",
            context: "formatting"
          }) || s.day(e, {
            width: "narrow",
            context: "formatting"
          }),
          r
        );
      // T
      case "iiiii":
        return j(
          s.day(e, {
            width: "narrow",
            context: "formatting"
          }),
          r
        );
      // Tu
      case "iiiiii":
        return j(
          s.day(e, {
            width: "short",
            context: "formatting"
          }) || s.day(e, {
            width: "narrow",
            context: "formatting"
          }),
          r
        );
      // Tuesday
      case "iiii":
      default:
        return j(
          s.day(e, {
            width: "wide",
            context: "formatting"
          }) || s.day(e, {
            width: "abbreviated",
            context: "formatting"
          }) || s.day(e, {
            width: "short",
            context: "formatting"
          }) || s.day(e, {
            width: "narrow",
            context: "formatting"
          }),
          r
        );
    }
  }
  validate(e, i) {
    return i >= 1 && i <= 7;
  }
  set(e, i, s) {
    return e = xf(e, s), e.setHours(0, 0, 0, 0), e;
  }
}
class vf extends $ {
  constructor() {
    super(...arguments);
    y(this, "priority", 80);
    y(this, "incompatibleTokens", ["b", "B", "H", "k", "t", "T"]);
  }
  parse(e, i, s) {
    switch (i) {
      case "a":
      case "aa":
      case "aaa":
        return s.dayPeriod(e, {
          width: "abbreviated",
          context: "formatting"
        }) || s.dayPeriod(e, {
          width: "narrow",
          context: "formatting"
        });
      case "aaaaa":
        return s.dayPeriod(e, {
          width: "narrow",
          context: "formatting"
        });
      case "aaaa":
      default:
        return s.dayPeriod(e, {
          width: "wide",
          context: "formatting"
        }) || s.dayPeriod(e, {
          width: "abbreviated",
          context: "formatting"
        }) || s.dayPeriod(e, {
          width: "narrow",
          context: "formatting"
        });
    }
  }
  set(e, i, s) {
    return e.setHours(Ni(s), 0, 0, 0), e;
  }
}
class Mf extends $ {
  constructor() {
    super(...arguments);
    y(this, "priority", 80);
    y(this, "incompatibleTokens", ["a", "B", "H", "k", "t", "T"]);
  }
  parse(e, i, s) {
    switch (i) {
      case "b":
      case "bb":
      case "bbb":
        return s.dayPeriod(e, {
          width: "abbreviated",
          context: "formatting"
        }) || s.dayPeriod(e, {
          width: "narrow",
          context: "formatting"
        });
      case "bbbbb":
        return s.dayPeriod(e, {
          width: "narrow",
          context: "formatting"
        });
      case "bbbb":
      default:
        return s.dayPeriod(e, {
          width: "wide",
          context: "formatting"
        }) || s.dayPeriod(e, {
          width: "abbreviated",
          context: "formatting"
        }) || s.dayPeriod(e, {
          width: "narrow",
          context: "formatting"
        });
    }
  }
  set(e, i, s) {
    return e.setHours(Ni(s), 0, 0, 0), e;
  }
}
class kf extends $ {
  constructor() {
    super(...arguments);
    y(this, "priority", 80);
    y(this, "incompatibleTokens", ["a", "b", "t", "T"]);
  }
  parse(e, i, s) {
    switch (i) {
      case "B":
      case "BB":
      case "BBB":
        return s.dayPeriod(e, {
          width: "abbreviated",
          context: "formatting"
        }) || s.dayPeriod(e, {
          width: "narrow",
          context: "formatting"
        });
      case "BBBBB":
        return s.dayPeriod(e, {
          width: "narrow",
          context: "formatting"
        });
      case "BBBB":
      default:
        return s.dayPeriod(e, {
          width: "wide",
          context: "formatting"
        }) || s.dayPeriod(e, {
          width: "abbreviated",
          context: "formatting"
        }) || s.dayPeriod(e, {
          width: "narrow",
          context: "formatting"
        });
    }
  }
  set(e, i, s) {
    return e.setHours(Ni(s), 0, 0, 0), e;
  }
}
class Df extends $ {
  constructor() {
    super(...arguments);
    y(this, "priority", 70);
    y(this, "incompatibleTokens", ["H", "K", "k", "t", "T"]);
  }
  parse(e, i, s) {
    switch (i) {
      case "h":
        return H(Y.hour12h, e);
      case "ho":
        return s.ordinalNumber(e, { unit: "hour" });
      default:
        return W(i.length, e);
    }
  }
  validate(e, i) {
    return i >= 1 && i <= 12;
  }
  set(e, i, s) {
    const r = e.getHours() >= 12;
    return r && s < 12 ? e.setHours(s + 12, 0, 0, 0) : !r && s === 12 ? e.setHours(0, 0, 0, 0) : e.setHours(s, 0, 0, 0), e;
  }
}
class Pf extends $ {
  constructor() {
    super(...arguments);
    y(this, "priority", 70);
    y(this, "incompatibleTokens", ["a", "b", "h", "K", "k", "t", "T"]);
  }
  parse(e, i, s) {
    switch (i) {
      case "H":
        return H(Y.hour23h, e);
      case "Ho":
        return s.ordinalNumber(e, { unit: "hour" });
      default:
        return W(i.length, e);
    }
  }
  validate(e, i) {
    return i >= 0 && i <= 23;
  }
  set(e, i, s) {
    return e.setHours(s, 0, 0, 0), e;
  }
}
class Sf extends $ {
  constructor() {
    super(...arguments);
    y(this, "priority", 70);
    y(this, "incompatibleTokens", ["h", "H", "k", "t", "T"]);
  }
  parse(e, i, s) {
    switch (i) {
      case "K":
        return H(Y.hour11h, e);
      case "Ko":
        return s.ordinalNumber(e, { unit: "hour" });
      default:
        return W(i.length, e);
    }
  }
  validate(e, i) {
    return i >= 0 && i <= 11;
  }
  set(e, i, s) {
    return e.getHours() >= 12 && s < 12 ? e.setHours(s + 12, 0, 0, 0) : e.setHours(s, 0, 0, 0), e;
  }
}
class Of extends $ {
  constructor() {
    super(...arguments);
    y(this, "priority", 70);
    y(this, "incompatibleTokens", ["a", "b", "h", "H", "K", "t", "T"]);
  }
  parse(e, i, s) {
    switch (i) {
      case "k":
        return H(Y.hour24h, e);
      case "ko":
        return s.ordinalNumber(e, { unit: "hour" });
      default:
        return W(i.length, e);
    }
  }
  validate(e, i) {
    return i >= 1 && i <= 24;
  }
  set(e, i, s) {
    const r = s <= 24 ? s % 24 : s;
    return e.setHours(r, 0, 0, 0), e;
  }
}
class Tf extends $ {
  constructor() {
    super(...arguments);
    y(this, "priority", 60);
    y(this, "incompatibleTokens", ["t", "T"]);
  }
  parse(e, i, s) {
    switch (i) {
      case "m":
        return H(Y.minute, e);
      case "mo":
        return s.ordinalNumber(e, { unit: "minute" });
      default:
        return W(i.length, e);
    }
  }
  validate(e, i) {
    return i >= 0 && i <= 59;
  }
  set(e, i, s) {
    return e.setMinutes(s, 0, 0), e;
  }
}
class Cf extends $ {
  constructor() {
    super(...arguments);
    y(this, "priority", 50);
    y(this, "incompatibleTokens", ["t", "T"]);
  }
  parse(e, i, s) {
    switch (i) {
      case "s":
        return H(Y.second, e);
      case "so":
        return s.ordinalNumber(e, { unit: "second" });
      default:
        return W(i.length, e);
    }
  }
  validate(e, i) {
    return i >= 0 && i <= 59;
  }
  set(e, i, s) {
    return e.setSeconds(s, 0), e;
  }
}
class Af extends $ {
  constructor() {
    super(...arguments);
    y(this, "priority", 30);
    y(this, "incompatibleTokens", ["t", "T"]);
  }
  parse(e, i) {
    const s = (r) => Math.trunc(r * Math.pow(10, -i.length + 3));
    return j(W(i.length, e), s);
  }
  set(e, i, s) {
    return e.setMilliseconds(s), e;
  }
}
class Ef extends $ {
  constructor() {
    super(...arguments);
    y(this, "priority", 10);
    y(this, "incompatibleTokens", ["t", "T", "x"]);
  }
  parse(e, i) {
    switch (i) {
      case "X":
        return mt(
          gt.basicOptionalMinutes,
          e
        );
      case "XX":
        return mt(gt.basic, e);
      case "XXXX":
        return mt(
          gt.basicOptionalSeconds,
          e
        );
      case "XXXXX":
        return mt(
          gt.extendedOptionalSeconds,
          e
        );
      case "XXX":
      default:
        return mt(gt.extended, e);
    }
  }
  set(e, i, s) {
    return i.timestampIsSet ? e : N(
      e,
      e.getTime() - Tn(e) - s
    );
  }
}
class $f extends $ {
  constructor() {
    super(...arguments);
    y(this, "priority", 10);
    y(this, "incompatibleTokens", ["t", "T", "X"]);
  }
  parse(e, i) {
    switch (i) {
      case "x":
        return mt(
          gt.basicOptionalMinutes,
          e
        );
      case "xx":
        return mt(gt.basic, e);
      case "xxxx":
        return mt(
          gt.basicOptionalSeconds,
          e
        );
      case "xxxxx":
        return mt(
          gt.extendedOptionalSeconds,
          e
        );
      case "xxx":
      default:
        return mt(gt.extended, e);
    }
  }
  set(e, i, s) {
    return i.timestampIsSet ? e : N(
      e,
      e.getTime() - Tn(e) - s
    );
  }
}
class If extends $ {
  constructor() {
    super(...arguments);
    y(this, "priority", 40);
    y(this, "incompatibleTokens", "*");
  }
  parse(e) {
    return zo(e);
  }
  set(e, i, s) {
    return [N(e, s * 1e3), { timestampIsSet: !0 }];
  }
}
class Lf extends $ {
  constructor() {
    super(...arguments);
    y(this, "priority", 20);
    y(this, "incompatibleTokens", "*");
  }
  parse(e) {
    return zo(e);
  }
  set(e, i, s) {
    return [N(e, s), { timestampIsSet: !0 }];
  }
}
const Ff = {
  G: new Jd(),
  y: new tf(),
  Y: new ef(),
  R: new nf(),
  u: new sf(),
  Q: new rf(),
  q: new of(),
  M: new af(),
  L: new cf(),
  w: new hf(),
  I: new df(),
  d: new mf(),
  D: new pf(),
  E: new bf(),
  e: new yf(),
  c: new _f(),
  i: new wf(),
  a: new vf(),
  b: new Mf(),
  B: new kf(),
  h: new Df(),
  H: new Pf(),
  K: new Sf(),
  k: new Of(),
  m: new Tf(),
  s: new Cf(),
  S: new Af(),
  X: new Ef(),
  x: new $f(),
  t: new If(),
  T: new Lf()
}, zf = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g, Rf = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g, Hf = /^'([^]*?)'?$/, Nf = /''/g, Wf = /\S/, Bf = /[a-zA-Z]/;
function Yf(n, t, e, i) {
  var p, b, _, v, M, w, P, k;
  const s = () => N((i == null ? void 0 : i.in) || e, NaN), r = Ud(), o = (i == null ? void 0 : i.locale) ?? r.locale ?? Co, a = (i == null ? void 0 : i.firstWeekContainsDate) ?? ((b = (p = i == null ? void 0 : i.locale) == null ? void 0 : p.options) == null ? void 0 : b.firstWeekContainsDate) ?? r.firstWeekContainsDate ?? ((v = (_ = r.locale) == null ? void 0 : _.options) == null ? void 0 : v.firstWeekContainsDate) ?? 1, c = (i == null ? void 0 : i.weekStartsOn) ?? ((w = (M = i == null ? void 0 : i.locale) == null ? void 0 : M.options) == null ? void 0 : w.weekStartsOn) ?? r.weekStartsOn ?? ((k = (P = r.locale) == null ? void 0 : P.options) == null ? void 0 : k.weekStartsOn) ?? 0;
  if (!t)
    return n ? s() : T(e, i == null ? void 0 : i.in);
  const l = {
    firstWeekContainsDate: a,
    weekStartsOn: c,
    locale: o
  }, h = [new Zd(i == null ? void 0 : i.in, e)], u = t.match(Rf).map((x) => {
    const D = x[0];
    if (D in yi) {
      const O = yi[D];
      return O(x, o.formatLong);
    }
    return x;
  }).join("").match(zf), d = [];
  for (let x of u) {
    !(i != null && i.useAdditionalWeekYearTokens) && Lo(x) && _i(x, t, n), !(i != null && i.useAdditionalDayOfYearTokens) && Io(x) && _i(x, t, n);
    const D = x[0], O = Ff[D];
    if (O) {
      const { incompatibleTokens: S } = O;
      if (Array.isArray(S)) {
        const V = d.find(
          (G) => S.includes(G.token) || G.token === D
        );
        if (V)
          throw new RangeError(
            `The format string mustn't contain \`${V.fullToken}\` and \`${x}\` at the same time`
          );
      } else if (O.incompatibleTokens === "*" && d.length > 0)
        throw new RangeError(
          `The format string mustn't contain \`${x}\` and any other token at the same time`
        );
      d.push({ token: D, fullToken: x });
      const C = O.run(
        n,
        x,
        o.match,
        l
      );
      if (!C)
        return s();
      h.push(C.setter), n = C.rest;
    } else {
      if (D.match(Bf))
        throw new RangeError(
          "Format string contains an unescaped latin alphabet character `" + D + "`"
        );
      if (x === "''" ? x = "'" : D === "'" && (x = jf(x)), n.indexOf(x) === 0)
        n = n.slice(x.length);
      else
        return s();
    }
  }
  if (n.length > 0 && Wf.test(n))
    return s();
  const f = h.map((x) => x.priority).sort((x, D) => D - x).filter((x, D, O) => O.indexOf(x) === D).map(
    (x) => h.filter((D) => D.priority === x).sort((D, O) => O.subPriority - D.subPriority)
  ).map((x) => x[0]);
  let g = T(e, i == null ? void 0 : i.in);
  if (isNaN(+g)) return s();
  const m = {};
  for (const x of f) {
    if (!x.validate(g, l))
      return s();
    const D = x.set(g, m, l);
    Array.isArray(D) ? (g = D[0], Object.assign(m, D[1])) : g = D;
  }
  return g;
}
function jf(n) {
  return n.match(Hf)[1].replace(Nf, "'");
}
function Vf(n, t) {
  const e = T(n, t == null ? void 0 : t.in);
  return e.setMinutes(0, 0, 0), e;
}
function Uf(n, t) {
  const e = T(n, t == null ? void 0 : t.in);
  return e.setSeconds(0, 0), e;
}
function qf(n, t) {
  const e = T(n, t == null ? void 0 : t.in);
  return e.setMilliseconds(0), e;
}
function Xf(n, t) {
  const e = () => N(t == null ? void 0 : t.in, NaN), i = (t == null ? void 0 : t.additionalDigits) ?? 2, s = Zf(n);
  let r;
  if (s.date) {
    const l = Jf(s.date, i);
    r = tg(l.restDateString, l.year);
  }
  if (!r || isNaN(+r)) return e();
  const o = +r;
  let a = 0, c;
  if (s.time && (a = eg(s.time), isNaN(a)))
    return e();
  if (s.timezone) {
    if (c = ng(s.timezone), isNaN(c)) return e();
  } else {
    const l = new Date(o + a), h = T(0, t == null ? void 0 : t.in);
    return h.setFullYear(
      l.getUTCFullYear(),
      l.getUTCMonth(),
      l.getUTCDate()
    ), h.setHours(
      l.getUTCHours(),
      l.getUTCMinutes(),
      l.getUTCSeconds(),
      l.getUTCMilliseconds()
    ), h;
  }
  return T(o + a + c, t == null ? void 0 : t.in);
}
const fn = {
  dateTimeDelimiter: /[T ]/,
  timeZoneDelimiter: /[Z ]/i,
  timezone: /([Z+-].*)$/
}, Qf = /^-?(?:(\d{3})|(\d{2})(?:-?(\d{2}))?|W(\d{2})(?:-?(\d{1}))?|)$/, Gf = /^(\d{2}(?:[.,]\d*)?)(?::?(\d{2}(?:[.,]\d*)?))?(?::?(\d{2}(?:[.,]\d*)?))?$/, Kf = /^([+-])(\d{2})(?::?(\d{2}))?$/;
function Zf(n) {
  const t = {}, e = n.split(fn.dateTimeDelimiter);
  let i;
  if (e.length > 2)
    return t;
  if (/:/.test(e[0]) ? i = e[0] : (t.date = e[0], i = e[1], fn.timeZoneDelimiter.test(t.date) && (t.date = n.split(fn.timeZoneDelimiter)[0], i = n.substr(
    t.date.length,
    n.length
  ))), i) {
    const s = fn.timezone.exec(i);
    s ? (t.time = i.replace(s[1], ""), t.timezone = s[1]) : t.time = i;
  }
  return t;
}
function Jf(n, t) {
  const e = new RegExp(
    "^(?:(\\d{4}|[+-]\\d{" + (4 + t) + "})|(\\d{2}|[+-]\\d{" + (2 + t) + "})$)"
  ), i = n.match(e);
  if (!i) return { year: NaN, restDateString: "" };
  const s = i[1] ? parseInt(i[1]) : null, r = i[2] ? parseInt(i[2]) : null;
  return {
    year: r === null ? s : r * 100,
    restDateString: n.slice((i[1] || i[2]).length)
  };
}
function tg(n, t) {
  if (t === null) return /* @__PURE__ */ new Date(NaN);
  const e = n.match(Qf);
  if (!e) return /* @__PURE__ */ new Date(NaN);
  const i = !!e[4], s = Me(e[1]), r = Me(e[2]) - 1, o = Me(e[3]), a = Me(e[4]), c = Me(e[5]) - 1;
  if (i)
    return ag(t, a, c) ? ig(t, a, c) : /* @__PURE__ */ new Date(NaN);
  {
    const l = /* @__PURE__ */ new Date(0);
    return !rg(t, r, o) || !og(t, s) ? /* @__PURE__ */ new Date(NaN) : (l.setUTCFullYear(t, r, Math.max(s, o)), l);
  }
}
function Me(n) {
  return n ? parseInt(n) : 1;
}
function eg(n) {
  const t = n.match(Gf);
  if (!t) return NaN;
  const e = ni(t[1]), i = ni(t[2]), s = ni(t[3]);
  return cg(e, i, s) ? e * Ke + i * Ge + s * 1e3 : NaN;
}
function ni(n) {
  return n && parseFloat(n.replace(",", ".")) || 0;
}
function ng(n) {
  if (n === "Z") return 0;
  const t = n.match(Kf);
  if (!t) return 0;
  const e = t[1] === "+" ? -1 : 1, i = parseInt(t[2]), s = t[3] && parseInt(t[3]) || 0;
  return lg(i, s) ? e * (i * Ke + s * Ge) : NaN;
}
function ig(n, t, e) {
  const i = /* @__PURE__ */ new Date(0);
  i.setUTCFullYear(n, 0, 4);
  const s = i.getUTCDay() || 7, r = (t - 1) * 7 + e + 1 - s;
  return i.setUTCDate(i.getUTCDate() + r), i;
}
const sg = [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function No(n) {
  return n % 400 === 0 || n % 4 === 0 && n % 100 !== 0;
}
function rg(n, t, e) {
  return t >= 0 && t <= 11 && e >= 1 && e <= (sg[t] || (No(n) ? 29 : 28));
}
function og(n, t) {
  return t >= 1 && t <= (No(n) ? 366 : 365);
}
function ag(n, t, e) {
  return t >= 1 && t <= 53 && e >= 0 && e <= 6;
}
function cg(n, t, e) {
  return n === 24 ? t === 0 && e === 0 : e >= 0 && e < 60 && t >= 0 && t < 60 && n >= 0 && n < 25;
}
function lg(n, t) {
  return t >= 0 && t <= 59;
}
/*!
 * chartjs-adapter-date-fns v3.0.0
 * https://www.chartjs.org
 * (c) 2022 chartjs-adapter-date-fns Contributors
 * Released under the MIT license
 */
const hg = {
  datetime: "MMM d, yyyy, h:mm:ss aaaa",
  millisecond: "h:mm:ss.SSS aaaa",
  second: "h:mm:ss aaaa",
  minute: "h:mm aaaa",
  hour: "ha",
  day: "MMM d",
  week: "PP",
  month: "MMM yyyy",
  quarter: "qqq - yyyy",
  year: "yyyy"
};
so._date.override({
  _id: "date-fns",
  // DEBUG
  formats: function() {
    return hg;
  },
  parse: function(n, t) {
    if (n === null || typeof n > "u")
      return null;
    const e = typeof n;
    return e === "number" || n instanceof Date ? n = T(n) : e === "string" && (typeof t == "string" ? n = Yf(n, t, /* @__PURE__ */ new Date(), this.options) : n = Xf(n, this.options)), ko(n) ? n.getTime() : null;
  },
  format: function(n, t) {
    return jd(n, t, this.options);
  },
  add: function(n, t, e) {
    switch (e) {
      case "millisecond":
        return zi(n, t);
      case "second":
        return $u(n, t);
      case "minute":
        return Au(n, t);
      case "hour":
        return Ou(n, t);
      case "day":
        return Hn(n, t);
      case "week":
        return Iu(n, t);
      case "month":
        return Fi(n, t);
      case "quarter":
        return Eu(n, t);
      case "year":
        return Lu(n, t);
      default:
        return n;
    }
  },
  diff: function(n, t, e) {
    switch (e) {
      case "millisecond":
        return Ri(n, t);
      case "second":
        return Yu(n, t);
      case "minute":
        return Nu(n, t);
      case "hour":
        return Hu(n, t);
      case "day":
        return Do(n, t);
      case "week":
        return ju(n, t);
      case "month":
        return Oo(n, t);
      case "quarter":
        return Bu(n, t);
      case "year":
        return Vu(n, t);
      default:
        return 0;
    }
  },
  startOf: function(n, t, e) {
    switch (t) {
      case "second":
        return qf(n);
      case "minute":
        return Uf(n);
      case "hour":
        return Vf(n);
      case "day":
        return bi(n);
      case "week":
        return pt(n);
      case "isoWeek":
        return pt(n, { weekStartsOn: +e });
      case "month":
        return qu(n);
      case "quarter":
        return Uu(n);
      case "year":
        return To(n);
      default:
        return n;
    }
  },
  endOf: function(n, t) {
    switch (t) {
      case "second":
        return Ju(n);
      case "minute":
        return Ku(n);
      case "hour":
        return Qu(n);
      case "day":
        return Po(n);
      case "week":
        return Gu(n);
      case "month":
        return So(n);
      case "quarter":
        return Zu(n);
      case "year":
        return Xu(n);
      default:
        return n;
    }
  }
});
wt.register(
  pn,
  Ot,
  _n,
  pi,
  Ue,
  xu,
  du,
  ou
);
class ug {
  constructor(t) {
    this.canvas = t;
  }
  getThemeColors() {
    const t = this.canvas.closest(".ehc-card") ?? this.canvas.closest("ha-card") ?? this.canvas, e = getComputedStyle(t), i = e.getPropertyValue("--accent-color").trim() || e.getPropertyValue("--primary-color").trim() || "#03a9f4", s = e.getPropertyValue("--secondary-text-color").trim() || "#727272", r = e.getPropertyValue("--divider-color").trim() || "rgba(127, 127, 127, 0.3)";
    return {
      currentLine: i,
      referenceLine: s,
      grid: r
    };
  }
  destroy() {
    var t;
    (t = this.chart) == null || t.destroy(), this.chart = void 0;
  }
  /** @param labels - Pre-localized legend labels from the card (e.g. period.current / period.reference). */
  update(t, e) {
    const i = this.canvas.getContext("2d");
    if (!i) return;
    const s = t.current.points.map((h, u) => ({
      x: u + 1,
      y: h.value
    })), r = t.reference ? t.reference.points.map((h, u) => ({
      x: u + 1,
      y: h.value
    })) : [], o = JSON.stringify({
      c: s,
      r
    });
    if (this.lastHash === o && this.chart)
      return;
    this.lastHash = o;
    const a = this.getThemeColors(), c = {
      datasets: [
        {
          label: e.current,
          data: s,
          borderColor: a.currentLine,
          backgroundColor: "transparent",
          fill: !1,
          pointRadius: 0,
          tension: 0.3
        },
        ...t.reference ? [
          {
            label: e.reference,
            data: r,
            borderColor: a.referenceLine,
            backgroundColor: "transparent",
            pointRadius: 0,
            borderDash: [4, 2],
            tension: 0.3
          }
        ] : []
      ]
    }, l = {
      responsive: !0,
      maintainAspectRatio: !1,
      animation: !1,
      plugins: {
        legend: {
          display: !0
        },
        tooltip: {
          mode: "index",
          intersect: !1
        }
      },
      scales: {
        x: {
          type: "linear",
          ticks: {
            precision: 0
          },
          grid: {
            color: a.grid
          }
        },
        y: {
          beginAtZero: !0,
          grid: {
            color: a.grid
          }
        }
      }
    };
    this.chart ? (this.chart.data = c, this.chart.options = l, this.chart.update()) : this.chart = new wt(i, {
      type: "line",
      data: c,
      options: l
    });
  }
}
const dg = {
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
  "error.missing_translation": "Fehlender Übersetzungsschlüssel: {{key}}"
}, fg = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: dg
}, Symbol.toStringTag, { value: "Module" })), gg = {
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
  "error.missing_translation": "Missing translation key: {{key}}"
}, mg = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: gg
}, Symbol.toStringTag, { value: "Module" })), pg = {
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
  "error.missing_translation": "Brak tłumaczenia dla klucza: {{key}}"
}, bg = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: pg
}, Symbol.toStringTag, { value: "Module" })), ii = "error.missing_translation", oe = "en", wr = /* @__PURE__ */ Object.assign({
  "../translations/de.json": fg,
  "../translations/en.json": mg,
  "../translations/pl.json": bg
}), ze = /* @__PURE__ */ Object.create(null);
for (const n of Object.keys(wr)) {
  const t = n.match(/\/([^/]+)\.json$/);
  if (t) {
    const e = t[1], i = wr[n], s = i == null ? void 0 : i.default;
    s && typeof s == "object" && (ze[e] = s);
  }
}
const yg = [
  "comma",
  "decimal",
  "language",
  "system"
];
function _g(n) {
  return typeof n == "string" && yg.includes(n);
}
function xg(n) {
  return Object.prototype.hasOwnProperty.call(ze, n);
}
function wg(n, t) {
  return t ? n.replace(/\{\{(\w+)\}\}/g, (e, i) => {
    const s = t[i];
    return s === void 0 ? e : String(s);
  }) : n;
}
function gn(n, t) {
  var a, c, l;
  const e = t.language, i = e !== void 0 && e !== "" ? xg(e) ? e : (t.debug && console.warn(
    `[Energy Horizon] Unsupported config.language "${e}", falling back to "${oe}"`
  ), oe) : ((a = n == null ? void 0 : n.locale) == null ? void 0 : a.language) || (n == null ? void 0 : n.language) || oe, s = t.number_format, r = s !== void 0 ? _g(s) ? s : (t.debug && console.warn(
    `[Energy Horizon] Invalid config.number_format "${String(s)}", falling back to "system"`
  ), "system") : ((c = n == null ? void 0 : n.locale) == null ? void 0 : c.number_format) ?? "system", o = ((l = n == null ? void 0 : n.config) == null ? void 0 : l.time_zone) || // fall back to UTC if HA does not provide a time zone
  "UTC";
  return {
    language: i,
    numberFormat: r,
    timeZone: o
  };
}
function vg(n, t) {
  switch (n) {
    case "comma":
      return "de";
    case "decimal":
      return "en";
    case "language":
      return t;
    case "system":
    default:
      return typeof navigator < "u" && navigator.language ? navigator.language : t || oe;
  }
}
function si(n) {
  const t = ze[n] ?? ze[oe] ?? {}, e = ze[oe] ?? {};
  return (i, s) => {
    let r = t[i];
    return r === void 0 && (r = e[i]), r === void 0 ? i : wg(r, s);
  };
}
const Mg = jo`
  :host {
    display: block;
  }

  .loading {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px;
  }

  .content {
    padding: 16px;
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
    height: 200px;
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
function vr(n, t, e) {
  return n > 0 ? `+${t.format(n)} ${e}` : n < 0 ? `−${t.format(Math.abs(n))} ${e}` : `${t.format(0)} ${e}`;
}
function Mr(n, t, e) {
  return t === "year_over_year" ? String(n.getFullYear()) : t === "month_over_year" ? new Intl.DateTimeFormat(e, { month: "long", year: "numeric" }).format(n) : "";
}
const An = class An extends Te {
  constructor() {
    super(...arguments), this._state = { status: "loading" };
  }
  _localizeOrError(t, e, i) {
    var r;
    const s = t(e, i);
    if (s === e) {
      (r = this._config) != null && r.debug && console.warn(
        `[Energy Horizon] Missing translation key: "${e}" (language: "${gn(
          this.hass,
          this._config
        ).language}")`
      ), this._state = {
        status: "error",
        errorMessage: ii
      };
      const o = t(ii, { key: e });
      return o === ii ? e : o;
    }
    return s;
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
        const e = this.renderRoot.querySelector("canvas");
        e && (this._chartRenderer = new ug(e));
      }
      if (this._chartRenderer) {
        const e = gn(this.hass, this._config), i = si(e.language);
        this._chartRenderer.update(this._state.comparisonSeries, {
          current: this._localizeOrError(i, "period.current"),
          reference: this._localizeOrError(i, "period.reference")
        });
      }
    }
  }
  async _loadData() {
    var c, l, h;
    if (!this._config || !this.hass) return;
    const t = /* @__PURE__ */ new Date(), e = gn(this.hass, this._config), i = si(e.language), s = ha(this._config, t, e.timeZone), r = Ji(s, this._config.entity), o = {
      ...s,
      current_start: s.reference_start,
      current_end: s.reference_end
    }, a = Ji(o, this._config.entity);
    try {
      this._config.debug && (console.log("[Energy Horizon] API Query (current):", r), console.log("[Energy Horizon] API Query (reference):", a));
      const [u, d] = await Promise.all([
        this.hass.connection.sendMessagePromise(
          r
        ),
        this.hass.connection.sendMessagePromise(
          a
        )
      ]);
      if (this._config.debug) {
        const M = (u == null ? void 0 : u.result) ?? u, w = M.results ?? M;
        if (console.log("[Energy Horizon] API Response (current, raw):", u), w && typeof w == "object") {
          const P = Object.keys(w);
          console.log(
            "[Energy Horizon] Results keys (available statistic_ids):",
            P
          );
          const k = w[this._config.entity];
          console.log(
            `[Energy Horizon] Data for entity "${this._config.entity}":`,
            k ? `${Array.isArray(k) ? k.length : 0} points` : "not found"
          ), console.log(
            "[Energy Horizon] Reference API Response (raw):",
            d
          );
        } else
          console.log(
            "[Energy Horizon] No results in response or invalid structure"
          );
      }
      const f = ts(
        u,
        this._config.entity,
        i("period.current")
      );
      if (!f) {
        this._config.debug && console.log(
          "[Energy Horizon] current series could not be built – check entity ID and results structure above"
        ), this._state = { status: "no-data" };
        return;
      }
      const g = ts(
        d,
        this._config.entity,
        i("period.reference")
      ), m = ((h = (l = (c = this.hass.states) == null ? void 0 : c[this._config.entity]) == null ? void 0 : l.attributes) == null ? void 0 : h.unit_of_measurement) ?? "", p = {
        current: m ? { ...f, unit: f.unit || m } : f,
        reference: g ? m ? { ...g, unit: g.unit || m } : g : void 0,
        aggregation: s.aggregation,
        time_zone: s.time_zone
      }, b = fa(p), _ = ga(p);
      !b.unit && m && (b.unit = m), _ && !_.unit && m && (_.unit = m);
      const v = ma(b);
      this._state = {
        status: "ready",
        comparisonSeries: p,
        summary: b,
        forecast: _,
        textSummary: v,
        period: s
      };
    } catch (u) {
      console.error(u), this._state = {
        status: "error",
        errorMessage: "status.error_api"
      };
    }
  }
  render() {
    var C, V, G, R, U, tt, $t, It;
    if (!this._config || !this.hass)
      return Q``;
    const t = gn(this.hass, this._config), e = si(t.language);
    if (this._state.status === "loading")
      return Q`<ha-card class="ebc-card">
        <div class="loading">
          <ha-circular-progress active size="small"></ha-circular-progress>
          <span>${this._localizeOrError(e, "status.loading")}</span>
        </div>
      </ha-card>`;
    if (this._state.status === "error") {
      const K = this._state.errorMessage ?? "status.error_generic";
      return Q`<ha-card class="ebc-card">
        <ha-alert alert-type="error">
          ${this._localizeOrError(e, K)}
        </ha-alert>
      </ha-card>`;
    }
    if (this._state.status === "no-data")
      return Q`<ha-card class="ebc-card">
        <ha-alert alert-type="info">
          ${this._localizeOrError(e, "status.no_data")}
        </ha-alert>
      </ha-card>`;
    const i = this._state.textSummary, s = this._state.summary, r = this._state.forecast, o = this._config.show_title !== !1, a = (V = (C = this.hass) == null ? void 0 : C.states) == null ? void 0 : V[this._config.entity], c = ((G = this._config.title) == null ? void 0 : G.trim()) || (a == null ? void 0 : a.attributes.friendly_name) || this._config.entity, l = this._config.show_icon !== !1, h = ((R = this._config.icon) == null ? void 0 : R.trim()) || void 0, d = o && !!c || l && (!!h || !!a), f = vg(
      t.numberFormat,
      t.language
    ), g = this._config.precision ?? 1, m = (($t = (tt = (U = this.hass.states) == null ? void 0 : U[this._config.entity]) == null ? void 0 : tt.attributes) == null ? void 0 : $t.unit_of_measurement) ?? "", p = new Intl.NumberFormat(f, {
      minimumFractionDigits: g,
      maximumFractionDigits: g
    }), b = new Intl.NumberFormat(f, {
      maximumFractionDigits: 1
    }), _ = (s == null ? void 0 : s.unit) || m;
    let v = this._localizeOrError(e, "summary.current_period"), M = this._localizeOrError(e, "summary.reference_period");
    if (this._state.status === "ready" && this._state.period) {
      const K = this._config.language ?? ((It = this.hass) == null ? void 0 : It.language) ?? "en", te = Mr(this._state.period.current_start, this._config.comparison_mode, K), vt = Mr(this._state.period.reference_start, this._config.comparison_mode, K);
      v = `${v} (${te})`, M = `${M} (${vt})`;
    }
    const w = s != null ? `${p.format(s.current_cumulative)} ${_}` : "", P = s != null && s.reference_cumulative != null ? `${p.format(s.reference_cumulative)} ${_}` : null, k = s != null && s.difference != null ? vr(s.difference, p, _) : null, x = s != null && s.differencePercent != null ? vr(s.differencePercent, b, "%") : null, D = r != null && r.enabled && this._config.show_forecast !== !1, O = (r == null ? void 0 : r.unit) || _;
    let S = null;
    if (i) {
      const K = i.diffValue != null ? `${p.format(i.diffValue)} ${_}` : void 0;
      switch (i.trend) {
        case "higher":
          S = this._localizeOrError(
            e,
            "text_summary.higher",
            K ? { diff: K } : void 0
          );
          break;
        case "lower":
          S = this._localizeOrError(
            e,
            "text_summary.lower",
            K ? { diff: K } : void 0
          );
          break;
        case "similar":
          S = this._localizeOrError(e, "text_summary.similar");
          break;
        case "unknown":
        default:
          S = this._localizeOrError(e, "text_summary.no_reference");
          break;
      }
    }
    return Q`<ha-card class="ebc-card">
      <div class="content ebc-content">
        ${d ? Q`<div class="ebc-title-row">
              ${l ? h ? Q`<ha-icon class="ebc-icon" .icon=${h}></ha-icon>` : a ? Q`<ha-state-icon
                        class="ebc-icon"
                        .hass=${this.hass}
                        .stateObj=${a}
                      ></ha-state-icon>` : null : null}
              ${o && c ? Q`<span class="ebc-title">${c}</span>` : null}
            </div>` : null}

        ${S ? Q`<div class="heading ebc-header">${S}</div>` : null}

        ${s ? Q`<div class="summary ebc-stats">
              <div class="summary-row">
                <span class="label">${v}</span>
                <span class="value">${w}</span>
              </div>

              ${P ? Q`<div class="summary-row">
                    <span class="label">${M}</span>
                    <span class="value">${P}</span>
                  </div>` : null}

              ${k ? Q`<div class="summary-row">
                    <span class="label"
                      >${this._localizeOrError(e, "summary.difference")}</span
                    >
                    <span class="value">${k}</span>
                  </div>` : null}

              ${x ? Q`<div class="summary-row">
                    <span class="label"
                      >${this._localizeOrError(
      e,
      "summary.difference_percent"
    )}</span
                    >
                    <span class="value">${x}</span>
                  </div>` : null}

              ${s.reference_cumulative == null ? Q`<div class="summary-note">
                    ${this._localizeOrError(
      e,
      "summary.incomplete_reference"
    )}
                  </div>` : null}
            </div>` : null}

        ${D && r ? Q`<div class="forecast ebc-forecast">
              <div class="summary-row">
                <span class="label"
                  >${this._localizeOrError(
      e,
      "forecast.current_forecast"
    )}</span
                >
                <span class="value"
                  >${p.format(
      r.forecast_total ?? 0
    )} ${O}</span
                >
              </div>
              ${r.reference_total != null ? Q`<div class="summary-row">
                    <span class="label"
                      >${this._localizeOrError(
      e,
      "forecast.reference_consumption"
    )}</span
                    >
                    <span class="value"
                      >${p.format(
      r.reference_total
    )} ${O}</span
                    >
                  </div>` : null}
              <div class="summary-note">
                ${this._localizeOrError(e, "forecast.confidence", {
      confidence: r.confidence
    })}
              </div>
            </div>` : null}

        <div class="chart-container ebc-chart">
          <canvas></canvas>
        </div>
      </div>
    </ha-card>`;
  }
};
An.properties = {
  hass: { type: Object, attribute: !1 },
  _config: { state: !0 },
  _state: { state: !0 }
}, An.styles = Mg;
let xi = An;
customElements.define("energy-horizon-card", xi);
//# sourceMappingURL=energy-horizon-card.js.map
