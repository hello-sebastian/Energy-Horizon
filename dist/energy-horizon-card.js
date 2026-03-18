/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const io = globalThis, ff = io.ShadowRoot && (io.ShadyCSS === void 0 || io.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, hf = Symbol(), wh = /* @__PURE__ */ new WeakMap();
let _p = class {
  constructor(t, e, i) {
    if (this._$cssResult$ = !0, i !== hf) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (ff && t === void 0) {
      const i = e !== void 0 && e.length === 1;
      i && (t = wh.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && wh.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const e_ = (r) => new _p(typeof r == "string" ? r : r + "", void 0, hf), r_ = (r, ...t) => {
  const e = r.length === 1 ? r[0] : t.reduce((i, n, a) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(n) + r[a + 1], r[0]);
  return new _p(e, r, hf);
}, i_ = (r, t) => {
  if (ff) r.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const i = document.createElement("style"), n = io.litNonce;
    n !== void 0 && i.setAttribute("nonce", n), i.textContent = e.cssText, r.appendChild(i);
  }
}, bh = ff ? (r) => r : (r) => r instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const i of t.cssRules) e += i.cssText;
  return e_(e);
})(r) : r;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: n_, defineProperty: a_, getOwnPropertyDescriptor: o_, getOwnPropertyNames: s_, getOwnPropertySymbols: l_, getPrototypeOf: u_ } = Object, ir = globalThis, xh = ir.trustedTypes, f_ = xh ? xh.emptyScript : "", Ds = ir.reactiveElementPolyfillSupport, Cn = (r, t) => r, eu = { toAttribute(r, t) {
  switch (t) {
    case Boolean:
      r = r ? f_ : null;
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
} }, Sp = (r, t) => !n_(r, t), Th = { attribute: !0, type: String, converter: eu, reflect: !1, useDefault: !1, hasChanged: Sp };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), ir.litPropertyMetadata ?? (ir.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let mi = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = Th) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const i = Symbol(), n = this.getPropertyDescriptor(t, i, e);
      n !== void 0 && a_(this.prototype, t, n);
    }
  }
  static getPropertyDescriptor(t, e, i) {
    const { get: n, set: a } = o_(this.prototype, t) ?? { get() {
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
    return this.elementProperties.get(t) ?? Th;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Cn("elementProperties"))) return;
    const t = u_(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Cn("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Cn("properties"))) {
      const e = this.properties, i = [...s_(e), ...l_(e)];
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
      for (const n of i) e.unshift(bh(n));
    } else t !== void 0 && e.push(bh(t));
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
    return i_(t, this.constructor.elementStyles), t;
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
      const o = (((a = i.converter) == null ? void 0 : a.toAttribute) !== void 0 ? i.converter : eu).toAttribute(e, i.type);
      this._$Em = t, o == null ? this.removeAttribute(n) : this.setAttribute(n, o), this._$Em = null;
    }
  }
  _$AK(t, e) {
    var a, o;
    const i = this.constructor, n = i._$Eh.get(t);
    if (n !== void 0 && this._$Em !== n) {
      const s = i.getPropertyOptions(n), l = typeof s.converter == "function" ? { fromAttribute: s.converter } : ((a = s.converter) == null ? void 0 : a.fromAttribute) !== void 0 ? s.converter : eu;
      this._$Em = n;
      const u = l.fromAttribute(e, s.type);
      this[n] = u ?? ((o = this._$Ej) == null ? void 0 : o.get(n)) ?? u, this._$Em = null;
    }
  }
  requestUpdate(t, e, i, n = !1, a) {
    var o;
    if (t !== void 0) {
      const s = this.constructor;
      if (n === !1 && (a = this[t]), i ?? (i = s.getPropertyOptions(t)), !((i.hasChanged ?? Sp)(a, e) || i.useDefault && i.reflect && a === ((o = this._$Ej) == null ? void 0 : o.get(t)) && !this.hasAttribute(s._$Eu(t, i)))) return;
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
mi.elementStyles = [], mi.shadowRootOptions = { mode: "open" }, mi[Cn("elementProperties")] = /* @__PURE__ */ new Map(), mi[Cn("finalized")] = /* @__PURE__ */ new Map(), Ds == null || Ds({ ReactiveElement: mi }), (ir.reactiveElementVersions ?? (ir.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Dn = globalThis, Ch = (r) => r, mo = Dn.trustedTypes, Dh = mo ? mo.createPolicy("lit-html", { createHTML: (r) => r }) : void 0, wp = "$lit$", tr = `lit$${Math.random().toFixed(9).slice(2)}$`, bp = "?" + tr, h_ = `<${bp}>`, Ur = document, Wn = () => Ur.createComment(""), Un = (r) => r === null || typeof r != "object" && typeof r != "function", cf = Array.isArray, c_ = (r) => cf(r) || typeof (r == null ? void 0 : r[Symbol.iterator]) == "function", Ms = `[ 	
\f\r]`, Ki = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Mh = /-->/g, Ah = />/g, vr = RegExp(`>|${Ms}(?:([^\\s"'>=/]+)(${Ms}*=${Ms}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Lh = /'/g, Ph = /"/g, xp = /^(?:script|style|textarea|title)$/i, v_ = (r) => (t, ...e) => ({ _$litType$: r, strings: t, values: e }), Tt = v_(1), Oi = Symbol.for("lit-noChange"), wt = Symbol.for("lit-nothing"), Ih = /* @__PURE__ */ new WeakMap(), Br = Ur.createTreeWalker(Ur, 129);
function Tp(r, t) {
  if (!cf(r) || !r.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Dh !== void 0 ? Dh.createHTML(t) : t;
}
const d_ = (r, t) => {
  const e = r.length - 1, i = [];
  let n, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = Ki;
  for (let s = 0; s < e; s++) {
    const l = r[s];
    let u, f, h = -1, v = 0;
    for (; v < l.length && (o.lastIndex = v, f = o.exec(l), f !== null); ) v = o.lastIndex, o === Ki ? f[1] === "!--" ? o = Mh : f[1] !== void 0 ? o = Ah : f[2] !== void 0 ? (xp.test(f[2]) && (n = RegExp("</" + f[2], "g")), o = vr) : f[3] !== void 0 && (o = vr) : o === vr ? f[0] === ">" ? (o = n ?? Ki, h = -1) : f[1] === void 0 ? h = -2 : (h = o.lastIndex - f[2].length, u = f[1], o = f[3] === void 0 ? vr : f[3] === '"' ? Ph : Lh) : o === Ph || o === Lh ? o = vr : o === Mh || o === Ah ? o = Ki : (o = vr, n = void 0);
    const c = o === vr && r[s + 1].startsWith("/>") ? " " : "";
    a += o === Ki ? l + h_ : h >= 0 ? (i.push(u), l.slice(0, h) + wp + l.slice(h) + tr + c) : l + tr + (h === -2 ? s : c);
  }
  return [Tp(r, a + (r[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class Yn {
  constructor({ strings: t, _$litType$: e }, i) {
    let n;
    this.parts = [];
    let a = 0, o = 0;
    const s = t.length - 1, l = this.parts, [u, f] = d_(t, e);
    if (this.el = Yn.createElement(u, i), Br.currentNode = this.el.content, e === 2 || e === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (n = Br.nextNode()) !== null && l.length < s; ) {
      if (n.nodeType === 1) {
        if (n.hasAttributes()) for (const h of n.getAttributeNames()) if (h.endsWith(wp)) {
          const v = f[o++], c = n.getAttribute(h).split(tr), d = /([.?@])?(.*)/.exec(v);
          l.push({ type: 1, index: a, name: d[2], strings: c, ctor: d[1] === "." ? g_ : d[1] === "?" ? y_ : d[1] === "@" ? m_ : Uo }), n.removeAttribute(h);
        } else h.startsWith(tr) && (l.push({ type: 6, index: a }), n.removeAttribute(h));
        if (xp.test(n.tagName)) {
          const h = n.textContent.split(tr), v = h.length - 1;
          if (v > 0) {
            n.textContent = mo ? mo.emptyScript : "";
            for (let c = 0; c < v; c++) n.append(h[c], Wn()), Br.nextNode(), l.push({ type: 2, index: ++a });
            n.append(h[v], Wn());
          }
        }
      } else if (n.nodeType === 8) if (n.data === bp) l.push({ type: 2, index: a });
      else {
        let h = -1;
        for (; (h = n.data.indexOf(tr, h + 1)) !== -1; ) l.push({ type: 7, index: a }), h += tr.length - 1;
      }
      a++;
    }
  }
  static createElement(t, e) {
    const i = Ur.createElement("template");
    return i.innerHTML = t, i;
  }
}
function Ni(r, t, e = r, i) {
  var o, s;
  if (t === Oi) return t;
  let n = i !== void 0 ? (o = e._$Co) == null ? void 0 : o[i] : e._$Cl;
  const a = Un(t) ? void 0 : t._$litDirective$;
  return (n == null ? void 0 : n.constructor) !== a && ((s = n == null ? void 0 : n._$AO) == null || s.call(n, !1), a === void 0 ? n = void 0 : (n = new a(r), n._$AT(r, e, i)), i !== void 0 ? (e._$Co ?? (e._$Co = []))[i] = n : e._$Cl = n), n !== void 0 && (t = Ni(r, n._$AS(r, t.values), n, i)), t;
}
class p_ {
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
    const { el: { content: e }, parts: i } = this._$AD, n = ((t == null ? void 0 : t.creationScope) ?? Ur).importNode(e, !0);
    Br.currentNode = n;
    let a = Br.nextNode(), o = 0, s = 0, l = i[0];
    for (; l !== void 0; ) {
      if (o === l.index) {
        let u;
        l.type === 2 ? u = new sa(a, a.nextSibling, this, t) : l.type === 1 ? u = new l.ctor(a, l.name, l.strings, this, t) : l.type === 6 && (u = new __(a, this, t)), this._$AV.push(u), l = i[++s];
      }
      o !== (l == null ? void 0 : l.index) && (a = Br.nextNode(), o++);
    }
    return Br.currentNode = Ur, n;
  }
  p(t) {
    let e = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, e), e += i.strings.length - 2) : i._$AI(t[e])), e++;
  }
}
class sa {
  get _$AU() {
    var t;
    return ((t = this._$AM) == null ? void 0 : t._$AU) ?? this._$Cv;
  }
  constructor(t, e, i, n) {
    this.type = 2, this._$AH = wt, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = i, this.options = n, this._$Cv = (n == null ? void 0 : n.isConnected) ?? !0;
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
    t = Ni(this, t, e), Un(t) ? t === wt || t == null || t === "" ? (this._$AH !== wt && this._$AR(), this._$AH = wt) : t !== this._$AH && t !== Oi && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : c_(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== wt && Un(this._$AH) ? this._$AA.nextSibling.data = t : this.T(Ur.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    var a;
    const { values: e, _$litType$: i } = t, n = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = Yn.createElement(Tp(i.h, i.h[0]), this.options)), i);
    if (((a = this._$AH) == null ? void 0 : a._$AD) === n) this._$AH.p(e);
    else {
      const o = new p_(n, this), s = o.u(this.options);
      o.p(e), this.T(s), this._$AH = o;
    }
  }
  _$AC(t) {
    let e = Ih.get(t.strings);
    return e === void 0 && Ih.set(t.strings, e = new Yn(t)), e;
  }
  k(t) {
    cf(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let i, n = 0;
    for (const a of t) n === e.length ? e.push(i = new sa(this.O(Wn()), this.O(Wn()), this, this.options)) : i = e[n], i._$AI(a), n++;
    n < e.length && (this._$AR(i && i._$AB.nextSibling, n), e.length = n);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    var i;
    for ((i = this._$AP) == null ? void 0 : i.call(this, !1, !0, e); t !== this._$AB; ) {
      const n = Ch(t).nextSibling;
      Ch(t).remove(), t = n;
    }
  }
  setConnected(t) {
    var e;
    this._$AM === void 0 && (this._$Cv = t, (e = this._$AP) == null || e.call(this, t));
  }
}
class Uo {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, i, n, a) {
    this.type = 1, this._$AH = wt, this._$AN = void 0, this.element = t, this.name = e, this._$AM = n, this.options = a, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = wt;
  }
  _$AI(t, e = this, i, n) {
    const a = this.strings;
    let o = !1;
    if (a === void 0) t = Ni(this, t, e, 0), o = !Un(t) || t !== this._$AH && t !== Oi, o && (this._$AH = t);
    else {
      const s = t;
      let l, u;
      for (t = a[0], l = 0; l < a.length - 1; l++) u = Ni(this, s[i + l], e, l), u === Oi && (u = this._$AH[l]), o || (o = !Un(u) || u !== this._$AH[l]), u === wt ? t = wt : t !== wt && (t += (u ?? "") + a[l + 1]), this._$AH[l] = u;
    }
    o && !n && this.j(t);
  }
  j(t) {
    t === wt ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class g_ extends Uo {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === wt ? void 0 : t;
  }
}
class y_ extends Uo {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== wt);
  }
}
class m_ extends Uo {
  constructor(t, e, i, n, a) {
    super(t, e, i, n, a), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = Ni(this, t, e, 0) ?? wt) === Oi) return;
    const i = this._$AH, n = t === wt && i !== wt || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, a = t !== wt && (i === wt || n);
    n && this.element.removeEventListener(this.name, this, i), a && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var e;
    typeof this._$AH == "function" ? this._$AH.call(((e = this.options) == null ? void 0 : e.host) ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class __ {
  constructor(t, e, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    Ni(this, t);
  }
}
const As = Dn.litHtmlPolyfillSupport;
As == null || As(Yn, sa), (Dn.litHtmlVersions ?? (Dn.litHtmlVersions = [])).push("3.3.2");
const S_ = (r, t, e) => {
  const i = (e == null ? void 0 : e.renderBefore) ?? t;
  let n = i._$litPart$;
  if (n === void 0) {
    const a = (e == null ? void 0 : e.renderBefore) ?? null;
    i._$litPart$ = n = new sa(t.insertBefore(Wn(), a), a, void 0, e ?? {});
  }
  return n._$AI(r), n;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const $r = globalThis;
class Mn extends mi {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = S_(e, this.renderRoot, this.renderOptions);
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
    return Oi;
  }
}
var mp;
Mn._$litElement$ = !0, Mn.finalized = !0, (mp = $r.litElementHydrateSupport) == null || mp.call($r, { LitElement: Mn });
const Ls = $r.litElementPolyfillSupport;
Ls == null || Ls({ LitElement: Mn });
($r.litElementVersions ?? ($r.litElementVersions = [])).push("4.2.2");
const w_ = 5;
function b_(r, t) {
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
function x_(r, t, e) {
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
function Eh(r, t) {
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
function Rh(r, t, e) {
  const i = r.result ?? r, n = i.results ?? i;
  if (!n || typeof n != "object") return;
  let a = n[t];
  if (!a || a.length === 0) {
    const u = Object.keys(n);
    u.length === 1 && (a = n[u[0]]);
  }
  if (!a || a.length === 0) return;
  const { unit: o, timeSeries: s } = T_(a);
  return C_(
    s,
    o,
    e
  );
}
function T_(r) {
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
function C_(r, t, e) {
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
function D_(r) {
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
function M_(r) {
  var d;
  const t = r.current.points, e = t.length, i = Math.max(0, e - 1);
  if (i < w_)
    return {
      enabled: !1,
      unit: r.current.unit,
      confidence: "low"
    };
  const n = (d = r.reference) == null ? void 0 : d.points;
  if (!n || n.length < i + 1)
    return {
      enabled: !1,
      unit: r.current.unit,
      confidence: "low"
    };
  const a = (y, g, p) => y.slice(g, p).reduce((m, _) => m + (_.rawValue ?? 0), 0), o = a(t, 0, i), s = a(n, 0, i);
  if (!Number.isFinite(s) || s <= 0)
    return {
      enabled: !1,
      unit: r.current.unit,
      confidence: "low"
    };
  const l = a(n, i, n.length), u = a(n, 0, n.length), f = o / s, h = Math.min(5, Math.max(0.2, f)), v = o + l * h;
  let c = "low";
  return i >= 14 ? c = "high" : i >= 7 && (c = "medium"), {
    enabled: !0,
    forecast_total: v,
    reference_total: u,
    unit: r.current.unit,
    confidence: c
  };
}
function A_(r) {
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
var ru = function(r, t) {
  return ru = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(e, i) {
    e.__proto__ = i;
  } || function(e, i) {
    for (var n in i) Object.prototype.hasOwnProperty.call(i, n) && (e[n] = i[n]);
  }, ru(r, t);
};
function O(r, t) {
  if (typeof t != "function" && t !== null)
    throw new TypeError("Class extends value " + String(t) + " is not a constructor or null");
  ru(r, t);
  function e() {
    this.constructor = r;
  }
  r.prototype = t === null ? Object.create(t) : (e.prototype = t.prototype, new e());
}
var L_ = /* @__PURE__ */ (function() {
  function r() {
    this.firefox = !1, this.ie = !1, this.edge = !1, this.newEdge = !1, this.weChat = !1;
  }
  return r;
})(), P_ = /* @__PURE__ */ (function() {
  function r() {
    this.browser = new L_(), this.node = !1, this.wxa = !1, this.worker = !1, this.svgSupported = !1, this.touchEventsSupported = !1, this.pointerEventsSupported = !1, this.domSupported = !1, this.transformSupported = !1, this.transform3dSupported = !1, this.hasGlobalWindow = typeof window < "u";
  }
  return r;
})(), U = new P_();
typeof wx == "object" && typeof wx.getSystemInfoSync == "function" ? (U.wxa = !0, U.touchEventsSupported = !0) : typeof document > "u" && typeof self < "u" ? U.worker = !0 : !U.hasGlobalWindow || "Deno" in window ? (U.node = !0, U.svgSupported = !0) : I_(navigator.userAgent, U);
function I_(r, t) {
  var e = t.browser, i = r.match(/Firefox\/([\d.]+)/), n = r.match(/MSIE\s([\d.]+)/) || r.match(/Trident\/.+?rv:(([\d.]+))/), a = r.match(/Edge?\/([\d.]+)/), o = /micromessenger/i.test(r);
  i && (e.firefox = !0, e.version = i[1]), n && (e.ie = !0, e.version = n[1]), a && (e.edge = !0, e.version = a[1], e.newEdge = +a[1].split(".")[0] > 18), o && (e.weChat = !0), t.svgSupported = typeof SVGRect < "u", t.touchEventsSupported = "ontouchstart" in window && !e.ie && !e.edge, t.pointerEventsSupported = "onpointerdown" in window && (e.edge || e.ie && +e.version >= 11), t.domSupported = typeof document < "u";
  var s = document.documentElement.style;
  t.transform3dSupported = (e.ie && "transition" in s || e.edge || "WebKitCSSMatrix" in window && "m11" in new WebKitCSSMatrix() || "MozPerspective" in s) && !("OTransition" in s), t.transformSupported = t.transform3dSupported || e.ie && +e.version >= 9;
}
var vf = 12, E_ = "sans-serif", Yr = vf + "px " + E_, R_ = 20, k_ = 100, O_ = "007LLmW'55;N0500LLLLLLLLLL00NNNLzWW\\\\WQb\\0FWLg\\bWb\\WQ\\WrWWQ000CL5LLFLL0LL**F*gLLLL5F0LF\\FFF5.5N";
function N_(r) {
  var t = {};
  if (typeof JSON > "u")
    return t;
  for (var e = 0; e < r.length; e++) {
    var i = String.fromCharCode(e + 32), n = (r.charCodeAt(e) - R_) / k_;
    t[i] = n;
  }
  return t;
}
var B_ = N_(O_), Vi = {
  createCanvas: function() {
    return typeof document < "u" && document.createElement("canvas");
  },
  measureText: /* @__PURE__ */ (function() {
    var r, t;
    return function(e, i) {
      if (!r) {
        var n = Vi.createCanvas();
        r = n && n.getContext("2d");
      }
      if (r)
        return t !== i && (t = r.font = i || Yr), r.measureText(e);
      e = e || "", i = i || Yr;
      var a = /((?:\d+)?\.?\d*)px/.exec(i), o = a && +a[1] || vf, s = 0;
      if (i.indexOf("mono") >= 0)
        s = o * e.length;
      else
        for (var l = 0; l < e.length; l++) {
          var u = B_[e[l]];
          s += u == null ? o : u * o;
        }
      return { width: s };
    };
  })(),
  loadImage: function(r, t, e) {
    var i = new Image();
    return i.onload = t, i.onerror = e, i.src = r, i;
  }
}, Cp = Gi([
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
}, {}), Dp = Gi([
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
}, {}), la = Object.prototype.toString, Yo = Array.prototype, F_ = Yo.forEach, z_ = Yo.filter, df = Yo.slice, H_ = Yo.map, kh = (function() {
}).constructor, da = kh ? kh.prototype : null, pf = "__proto__", $_ = 2311;
function Mp() {
  return $_++;
}
function gf() {
  for (var r = [], t = 0; t < arguments.length; t++)
    r[t] = arguments[t];
  typeof console < "u" && console.error.apply(console, r);
}
function q(r) {
  if (r == null || typeof r != "object")
    return r;
  var t = r, e = la.call(r);
  if (e === "[object Array]") {
    if (!An(r)) {
      t = [];
      for (var i = 0, n = r.length; i < n; i++)
        t[i] = q(r[i]);
    }
  } else if (Dp[e]) {
    if (!An(r)) {
      var a = r.constructor;
      if (a.from)
        t = a.from(r);
      else {
        t = new a(r.length);
        for (var i = 0, n = r.length; i < n; i++)
          t[i] = r[i];
      }
    }
  } else if (!Cp[e] && !An(r) && !Xn(r)) {
    t = {};
    for (var o in r)
      r.hasOwnProperty(o) && o !== pf && (t[o] = q(r[o]));
  }
  return t;
}
function Q(r, t, e) {
  if (!V(t) || !V(r))
    return e ? q(t) : r;
  for (var i in t)
    if (t.hasOwnProperty(i) && i !== pf) {
      var n = r[i], a = t[i];
      V(a) && V(n) && !N(a) && !N(n) && !Xn(a) && !Xn(n) && !Oh(a) && !Oh(n) && !An(a) && !An(n) ? Q(n, a, e) : (e || !(i in r)) && (r[i] = q(t[i]));
    }
  return r;
}
function k(r, t) {
  if (Object.assign)
    Object.assign(r, t);
  else
    for (var e in t)
      t.hasOwnProperty(e) && e !== pf && (r[e] = t[e]);
  return r;
}
function at(r, t, e) {
  for (var i = vt(t), n = 0, a = i.length; n < a; n++) {
    var o = i[n];
    r[o] == null && (r[o] = t[o]);
  }
  return r;
}
function et(r, t) {
  if (r) {
    if (r.indexOf)
      return r.indexOf(t);
    for (var e = 0, i = r.length; e < i; e++)
      if (r[e] === t)
        return e;
  }
  return -1;
}
function V_(r, t) {
  var e = r.prototype;
  function i() {
  }
  i.prototype = t.prototype, r.prototype = new i();
  for (var n in e)
    e.hasOwnProperty(n) && (r.prototype[n] = e[n]);
  r.prototype.constructor = r, r.superClass = t;
}
function ge(r, t, e) {
  if (r = "prototype" in r ? r.prototype : r, t = "prototype" in t ? t.prototype : t, Object.getOwnPropertyNames)
    for (var i = Object.getOwnPropertyNames(t), n = 0; n < i.length; n++) {
      var a = i[n];
      a !== "constructor" && r[a] == null && (r[a] = t[a]);
    }
  else
    at(r, t);
}
function $t(r) {
  return !r || typeof r == "string" ? !1 : typeof r.length == "number";
}
function C(r, t, e) {
  if (r && t)
    if (r.forEach && r.forEach === F_)
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
    return yf(r);
  if (r.map && r.map === H_)
    return r.map(t, e);
  for (var i = [], n = 0, a = r.length; n < a; n++)
    i.push(t.call(e, r[n], n, r));
  return i;
}
function Gi(r, t, e, i) {
  if (r && t) {
    for (var n = 0, a = r.length; n < a; n++)
      e = t.call(i, e, r[n], n, r);
    return e;
  }
}
function _t(r, t, e) {
  if (!r)
    return [];
  if (!t)
    return yf(r);
  if (r.filter && r.filter === z_)
    return r.filter(t, e);
  for (var i = [], n = 0, a = r.length; n < a; n++)
    t.call(e, r[n], n, r) && i.push(r[n]);
  return i;
}
function vt(r) {
  if (!r)
    return [];
  if (Object.keys)
    return Object.keys(r);
  var t = [];
  for (var e in r)
    r.hasOwnProperty(e) && t.push(e);
  return t;
}
function G_(r, t) {
  for (var e = [], i = 2; i < arguments.length; i++)
    e[i - 2] = arguments[i];
  return function() {
    return r.apply(t, e.concat(df.call(arguments)));
  };
}
var ct = da && $(da.bind) ? da.call.bind(da.bind) : G_;
function lt(r) {
  for (var t = [], e = 1; e < arguments.length; e++)
    t[e - 1] = arguments[e];
  return function() {
    return r.apply(this, t.concat(df.call(arguments)));
  };
}
function N(r) {
  return Array.isArray ? Array.isArray(r) : la.call(r) === "[object Array]";
}
function $(r) {
  return typeof r == "function";
}
function z(r) {
  return typeof r == "string";
}
function iu(r) {
  return la.call(r) === "[object String]";
}
function ut(r) {
  return typeof r == "number";
}
function V(r) {
  var t = typeof r;
  return t === "function" || !!r && t === "object";
}
function Oh(r) {
  return !!Cp[la.call(r)];
}
function Vt(r) {
  return !!Dp[la.call(r)];
}
function Xn(r) {
  return typeof r == "object" && typeof r.nodeType == "number" && typeof r.ownerDocument == "object";
}
function Xo(r) {
  return r.colorStops != null;
}
function W_(r) {
  return r.image != null;
}
function _o(r) {
  return r !== r;
}
function Bi() {
  for (var r = [], t = 0; t < arguments.length; t++)
    r[t] = arguments[t];
  for (var e = 0, i = r.length; e < i; e++)
    if (r[e] != null)
      return r[e];
}
function X(r, t) {
  return r ?? t;
}
function no(r, t, e) {
  return r ?? t ?? e;
}
function yf(r) {
  for (var t = [], e = 1; e < arguments.length; e++)
    t[e - 1] = arguments[e];
  return df.apply(r, t);
}
function Ap(r) {
  if (typeof r == "number")
    return [r, r, r, r];
  var t = r.length;
  return t === 2 ? [r[0], r[1], r[0], r[1]] : t === 3 ? [r[0], r[1], r[2], r[1]] : r;
}
function Be(r, t) {
  if (!r)
    throw new Error(t);
}
function xe(r) {
  return r == null ? null : typeof r.trim == "function" ? r.trim() : r.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
}
var Lp = "__ec_primitive__";
function nu(r) {
  r[Lp] = !0;
}
function An(r) {
  return r[Lp];
}
var U_ = (function() {
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
    return vt(this.data);
  }, r.prototype.forEach = function(t) {
    var e = this.data;
    for (var i in e)
      e.hasOwnProperty(i) && t(e[i], i);
  }, r;
})(), Pp = typeof Map == "function";
function Y_() {
  return Pp ? /* @__PURE__ */ new Map() : new U_();
}
var X_ = (function() {
  function r(t) {
    var e = N(t);
    this.data = Y_();
    var i = this;
    t instanceof r ? t.each(n) : t && C(t, n);
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
    return Pp ? Array.from(t) : t;
  }, r.prototype.removeKey = function(t) {
    this.data.delete(t);
  }, r;
})();
function Z(r) {
  return new X_(r);
}
function Z_(r, t) {
  for (var e = new r.constructor(r.length + t.length), i = 0; i < r.length; i++)
    e[i] = r[i];
  for (var n = r.length, i = 0; i < t.length; i++)
    e[i + n] = t[i];
  return e;
}
function Zo(r, t) {
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
function Ip(r) {
  var t = r.style;
  t.webkitUserSelect = "none", t.userSelect = "none", t.webkitTapHighlightColor = "rgba(0,0,0,0)", t["-webkit-touch-callout"] = "none";
}
function Xr(r, t) {
  return r.hasOwnProperty(t);
}
function Ht() {
}
var q_ = 180 / Math.PI;
function Wi(r, t) {
  return r == null && (r = 0), t == null && (t = 0), [r, t];
}
function K_(r) {
  return [r[0], r[1]];
}
function Nh(r, t, e) {
  return r[0] = t[0] + e[0], r[1] = t[1] + e[1], r;
}
function Ep(r, t, e) {
  return r[0] = t[0] - e[0], r[1] = t[1] - e[1], r;
}
function Q_(r) {
  return Math.sqrt(j_(r));
}
function j_(r) {
  return r[0] * r[0] + r[1] * r[1];
}
function Ps(r, t, e) {
  return r[0] = t[0] * e, r[1] = t[1] * e, r;
}
function mf(r, t) {
  var e = Q_(t);
  return e === 0 ? (r[0] = 0, r[1] = 0) : (r[0] = t[0] / e, r[1] = t[1] / e), r;
}
function au(r, t) {
  return Math.sqrt((r[0] - t[0]) * (r[0] - t[0]) + (r[1] - t[1]) * (r[1] - t[1]));
}
var J_ = au;
function t0(r, t) {
  return (r[0] - t[0]) * (r[0] - t[0]) + (r[1] - t[1]) * (r[1] - t[1]);
}
var Di = t0;
function ae(r, t, e) {
  var i = t[0], n = t[1];
  return r[0] = e[0] * i + e[2] * n + e[4], r[1] = e[1] * i + e[3] * n + e[5], r;
}
function wi(r, t, e) {
  return r[0] = Math.min(t[0], e[0]), r[1] = Math.min(t[1], e[1]), r;
}
function bi(r, t, e) {
  return r[0] = Math.max(t[0], e[0]), r[1] = Math.max(t[1], e[1]), r;
}
var ii = /* @__PURE__ */ (function() {
  function r(t, e) {
    this.target = t, this.topTarget = e && e.topTarget;
  }
  return r;
})(), e0 = (function() {
  function r(t) {
    this.handler = t, t.on("mousedown", this._dragStart, this), t.on("mousemove", this._drag, this), t.on("mouseup", this._dragEnd, this);
  }
  return r.prototype._dragStart = function(t) {
    for (var e = t.target; e && !e.draggable; )
      e = e.parent || e.__hostTarget;
    e && (this._draggingTarget = e, e.dragging = !0, this._x = t.offsetX, this._y = t.offsetY, this.handler.dispatchToElement(new ii(e, t), "dragstart", t.event));
  }, r.prototype._drag = function(t) {
    var e = this._draggingTarget;
    if (e) {
      var i = t.offsetX, n = t.offsetY, a = i - this._x, o = n - this._y;
      this._x = i, this._y = n, e.drift(a, o, t), this.handler.dispatchToElement(new ii(e, t), "drag", t.event);
      var s = this.handler.findHover(i, n, e).target, l = this._dropTarget;
      this._dropTarget = s, e !== s && (l && s !== l && this.handler.dispatchToElement(new ii(l, t), "dragleave", t.event), s && s !== l && this.handler.dispatchToElement(new ii(s, t), "dragenter", t.event));
    }
  }, r.prototype._dragEnd = function(t) {
    var e = this._draggingTarget;
    e && (e.dragging = !1), this.handler.dispatchToElement(new ii(e, t), "dragend", t.event), this._dropTarget && this.handler.dispatchToElement(new ii(this._dropTarget, t), "drop", t.event), this._draggingTarget = null, this._dropTarget = null;
  }, r;
})(), Ae = (function() {
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
})(), r0 = Math.log(2);
function ou(r, t, e, i, n, a) {
  var o = i + "-" + n, s = r.length;
  if (a.hasOwnProperty(o))
    return a[o];
  if (t === 1) {
    var l = Math.round(Math.log((1 << s) - 1 & ~n) / r0);
    return r[e][l];
  }
  for (var u = i | 1 << e, f = e + 1; i & 1 << f; )
    f++;
  for (var h = 0, v = 0, c = 0; v < s; v++) {
    var d = 1 << v;
    d & n || (h += (c % 2 ? -1 : 1) * r[e][v] * ou(r, t - 1, f, u, n | d, a), c++);
  }
  return a[o] = h, h;
}
function Bh(r, t) {
  var e = [
    [r[0], r[1], 1, 0, 0, 0, -t[0] * r[0], -t[0] * r[1]],
    [0, 0, 0, r[0], r[1], 1, -t[1] * r[0], -t[1] * r[1]],
    [r[2], r[3], 1, 0, 0, 0, -t[2] * r[2], -t[2] * r[3]],
    [0, 0, 0, r[2], r[3], 1, -t[3] * r[2], -t[3] * r[3]],
    [r[4], r[5], 1, 0, 0, 0, -t[4] * r[4], -t[4] * r[5]],
    [0, 0, 0, r[4], r[5], 1, -t[5] * r[4], -t[5] * r[5]],
    [r[6], r[7], 1, 0, 0, 0, -t[6] * r[6], -t[6] * r[7]],
    [0, 0, 0, r[6], r[7], 1, -t[7] * r[6], -t[7] * r[7]]
  ], i = {}, n = ou(e, 8, 0, 0, 0, i);
  if (n !== 0) {
    for (var a = [], o = 0; o < 8; o++)
      for (var s = 0; s < 8; s++)
        a[s] == null && (a[s] = 0), a[s] += ((o + s) % 2 ? -1 : 1) * ou(e, 7, o === 0 ? 1 : 0, 1 << o, 1 << s, i) / n * t[o];
    return function(l, u, f) {
      var h = u * a[6] + f * a[7] + 1;
      l[0] = (u * a[0] + f * a[1] + a[2]) / h, l[1] = (u * a[3] + f * a[4] + a[5]) / h;
    };
  }
}
var Fh = "___zrEVENTSAVED", Is = [];
function i0(r, t, e, i, n) {
  return su(Is, t, i, n, !0) && su(r, e, Is[0], Is[1]);
}
function su(r, t, e, i, n) {
  if (t.getBoundingClientRect && U.domSupported && !Rp(t)) {
    var a = t[Fh] || (t[Fh] = {}), o = n0(t, a), s = a0(o, a, n);
    if (s)
      return s(r, e, i), !0;
  }
  return !1;
}
function n0(r, t) {
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
function a0(r, t, e) {
  for (var i = e ? "invTrans" : "trans", n = t[i], a = t.srcCoords, o = [], s = [], l = !0, u = 0; u < 4; u++) {
    var f = r[u].getBoundingClientRect(), h = 2 * u, v = f.left, c = f.top;
    o.push(v, c), l = l && a && v === a[h] && c === a[h + 1], s.push(r[u].offsetLeft, r[u].offsetTop);
  }
  return l && n ? n : (t.srcCoords = o, t[i] = e ? Bh(s, o) : Bh(o, s));
}
function Rp(r) {
  return r.nodeName.toUpperCase() === "CANVAS";
}
var o0 = /([&<>"'])/g, s0 = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};
function Nt(r) {
  return r == null ? "" : (r + "").replace(o0, function(t, e) {
    return s0[e];
  });
}
var l0 = /^(?:mouse|pointer|contextmenu|drag|drop)|click/, Es = [], u0 = U.browser.firefox && +U.browser.version.split(".")[0] < 39;
function lu(r, t, e, i) {
  return e = e || {}, i ? zh(r, t, e) : u0 && t.layerX != null && t.layerX !== t.offsetX ? (e.zrX = t.layerX, e.zrY = t.layerY) : t.offsetX != null ? (e.zrX = t.offsetX, e.zrY = t.offsetY) : zh(r, t, e), e;
}
function zh(r, t, e) {
  if (U.domSupported && r.getBoundingClientRect) {
    var i = t.clientX, n = t.clientY;
    if (Rp(r)) {
      var a = r.getBoundingClientRect();
      e.zrX = i - a.left, e.zrY = n - a.top;
      return;
    } else if (su(Es, r, i, n)) {
      e.zrX = Es[0], e.zrY = Es[1];
      return;
    }
  }
  e.zrX = e.zrY = 0;
}
function _f(r) {
  return r || window.event;
}
function jt(r, t, e) {
  if (t = _f(t), t.zrX != null)
    return t;
  var i = t.type, n = i && i.indexOf("touch") >= 0;
  if (n) {
    var o = i !== "touchend" ? t.targetTouches[0] : t.changedTouches[0];
    o && lu(r, o, t, e);
  } else {
    lu(r, t, t, e);
    var a = f0(t);
    t.zrDelta = a ? a / 120 : -(t.detail || 0) / 3;
  }
  var s = t.button;
  return t.which == null && s !== void 0 && l0.test(t.type) && (t.which = s & 1 ? 1 : s & 2 ? 3 : s & 4 ? 2 : 0), t;
}
function f0(r) {
  var t = r.wheelDelta;
  if (t)
    return t;
  var e = r.deltaX, i = r.deltaY;
  if (e == null || i == null)
    return t;
  var n = Math.abs(i !== 0 ? i : e), a = i > 0 ? -1 : i < 0 ? 1 : e > 0 ? -1 : 1;
  return 3 * n * a;
}
function h0(r, t, e, i) {
  r.addEventListener(t, e, i);
}
function c0(r, t, e, i) {
  r.removeEventListener(t, e, i);
}
var kp = function(r) {
  r.preventDefault(), r.stopPropagation(), r.cancelBubble = !0;
}, v0 = (function() {
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
        var l = n[o], u = lu(i, l, {});
        a.points.push([u.zrX, u.zrY]), a.touches.push(l);
      }
      this._track.push(a);
    }
  }, r.prototype._recognize = function(t) {
    for (var e in Rs)
      if (Rs.hasOwnProperty(e)) {
        var i = Rs[e](this._track, t);
        if (i)
          return i;
      }
  }, r;
})();
function Hh(r) {
  var t = r[1][0] - r[0][0], e = r[1][1] - r[0][1];
  return Math.sqrt(t * t + e * e);
}
function d0(r) {
  return [
    (r[0][0] + r[1][0]) / 2,
    (r[0][1] + r[1][1]) / 2
  ];
}
var Rs = {
  pinch: function(r, t) {
    var e = r.length;
    if (e) {
      var i = (r[e - 1] || {}).points, n = (r[e - 2] || {}).points || i;
      if (n && n.length > 1 && i && i.length > 1) {
        var a = Hh(i) / Hh(n);
        !isFinite(a) && (a = 1), t.pinchScale = a;
        var o = d0(i);
        return t.pinchX = o[0], t.pinchY = o[1], {
          type: "pinch",
          target: r[0].target,
          event: t
        };
      }
    }
  }
};
function Mi() {
  return [1, 0, 0, 1, 0, 0];
}
function Sf(r) {
  return r[0] = 1, r[1] = 0, r[2] = 0, r[3] = 1, r[4] = 0, r[5] = 0, r;
}
function p0(r, t) {
  return r[0] = t[0], r[1] = t[1], r[2] = t[2], r[3] = t[3], r[4] = t[4], r[5] = t[5], r;
}
function Ai(r, t, e) {
  var i = t[0] * e[0] + t[2] * e[1], n = t[1] * e[0] + t[3] * e[1], a = t[0] * e[2] + t[2] * e[3], o = t[1] * e[2] + t[3] * e[3], s = t[0] * e[4] + t[2] * e[5] + t[4], l = t[1] * e[4] + t[3] * e[5] + t[5];
  return r[0] = i, r[1] = n, r[2] = a, r[3] = o, r[4] = s, r[5] = l, r;
}
function uu(r, t, e) {
  return r[0] = t[0], r[1] = t[1], r[2] = t[2], r[3] = t[3], r[4] = t[4] + e[0], r[5] = t[5] + e[1], r;
}
function wf(r, t, e, i) {
  i === void 0 && (i = [0, 0]);
  var n = t[0], a = t[2], o = t[4], s = t[1], l = t[3], u = t[5], f = Math.sin(e), h = Math.cos(e);
  return r[0] = n * h + s * f, r[1] = -n * f + s * h, r[2] = a * h + l * f, r[3] = -a * f + h * l, r[4] = h * (o - i[0]) + f * (u - i[1]) + i[0], r[5] = h * (u - i[1]) - f * (o - i[0]) + i[1], r;
}
function g0(r, t, e) {
  var i = e[0], n = e[1];
  return r[0] = t[0] * i, r[1] = t[1] * n, r[2] = t[2] * i, r[3] = t[3] * n, r[4] = t[4] * i, r[5] = t[5] * n, r;
}
function bf(r, t) {
  var e = t[0], i = t[2], n = t[4], a = t[1], o = t[3], s = t[5], l = e * o - a * i;
  return l ? (l = 1 / l, r[0] = o * l, r[1] = -a * l, r[2] = -i * l, r[3] = e * l, r[4] = (i * s - o * n) * l, r[5] = (a * n - e * s) * l, r) : null;
}
var st = (function() {
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
})(), pa = Math.min, ga = Math.max, dr = new st(), pr = new st(), gr = new st(), yr = new st(), Qi = new st(), ji = new st(), rt = (function() {
  function r(t, e, i, n) {
    i < 0 && (t = t + i, i = -i), n < 0 && (e = e + n, n = -n), this.x = t, this.y = e, this.width = i, this.height = n;
  }
  return r.prototype.union = function(t) {
    var e = pa(t.x, this.x), i = pa(t.y, this.y);
    isFinite(this.x) && isFinite(this.width) ? this.width = ga(t.x + t.width, this.x + this.width) - e : this.width = t.width, isFinite(this.y) && isFinite(this.height) ? this.height = ga(t.y + t.height, this.y + this.height) - i : this.height = t.height, this.x = e, this.y = i;
  }, r.prototype.applyTransform = function(t) {
    r.applyTransform(this, this, t);
  }, r.prototype.calculateTransform = function(t) {
    var e = this, i = t.width / e.width, n = t.height / e.height, a = Mi();
    return uu(a, a, [-e.x, -e.y]), g0(a, a, [i, n]), uu(a, a, [t.x, t.y]), a;
  }, r.prototype.intersect = function(t, e) {
    if (!t)
      return !1;
    t instanceof r || (t = r.create(t));
    var i = this, n = i.x, a = i.x + i.width, o = i.y, s = i.y + i.height, l = t.x, u = t.x + t.width, f = t.y, h = t.y + t.height, v = !(a < l || u < n || s < f || h < o);
    if (e) {
      var c = 1 / 0, d = 0, y = Math.abs(a - l), g = Math.abs(u - n), p = Math.abs(s - f), m = Math.abs(h - o), _ = Math.min(y, g), S = Math.min(p, m);
      a < l || u < n ? _ > d && (d = _, y < g ? st.set(ji, -y, 0) : st.set(ji, g, 0)) : _ < c && (c = _, y < g ? st.set(Qi, y, 0) : st.set(Qi, -g, 0)), s < f || h < o ? S > d && (d = S, p < m ? st.set(ji, 0, -p) : st.set(ji, 0, m)) : _ < c && (c = _, p < m ? st.set(Qi, 0, p) : st.set(Qi, 0, -m));
    }
    return e && st.copy(e, v ? Qi : ji), v;
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
    dr.x = gr.x = e.x, dr.y = yr.y = e.y, pr.x = yr.x = e.x + e.width, pr.y = gr.y = e.y + e.height, dr.transform(i), yr.transform(i), pr.transform(i), gr.transform(i), t.x = pa(dr.x, pr.x, gr.x, yr.x), t.y = pa(dr.y, pr.y, gr.y, yr.y);
    var l = ga(dr.x, pr.x, gr.x, yr.x), u = ga(dr.y, pr.y, gr.y, yr.y);
    t.width = l - t.x, t.height = u - t.y;
  }, r;
})(), Op = "silent";
function y0(r, t, e) {
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
    stop: m0
  };
}
function m0() {
  kp(this.event);
}
var _0 = (function(r) {
  O(t, r);
  function t() {
    var e = r !== null && r.apply(this, arguments) || this;
    return e.handler = null, e;
  }
  return t.prototype.dispose = function() {
  }, t.prototype.setCursor = function() {
  }, t;
})(Ae), Ji = /* @__PURE__ */ (function() {
  function r(t, e) {
    this.x = t, this.y = e;
  }
  return r;
})(), S0 = [
  "click",
  "dblclick",
  "mousewheel",
  "mouseout",
  "mouseup",
  "mousedown",
  "mousemove",
  "contextmenu"
], ks = new rt(0, 0, 0, 0), Np = (function(r) {
  O(t, r);
  function t(e, i, n, a, o) {
    var s = r.call(this) || this;
    return s._hovered = new Ji(0, 0), s.storage = e, s.painter = i, s.painterRoot = a, s._pointerSize = o, n = n || new _0(), s.proxy = null, s.setHandlerProxy(n), s._draggingMgr = new e0(s), s;
  }
  return t.prototype.setHandlerProxy = function(e) {
    this.proxy && this.proxy.dispose(), e && (C(S0, function(i) {
      e.on && e.on(i, this[i], this);
    }, this), e.handler = this), this.proxy = e;
  }, t.prototype.mousemove = function(e) {
    var i = e.zrX, n = e.zrY, a = Bp(this, i, n), o = this._hovered, s = o.target;
    s && !s.__zr && (o = this.findHover(o.x, o.y), s = o.target);
    var l = this._hovered = a ? new Ji(i, n) : this.findHover(i, n), u = l.target, f = this.proxy;
    f.setCursor && f.setCursor(u ? u.cursor : "default"), s && u !== s && this.dispatchToElement(o, "mouseout", e), this.dispatchToElement(l, "mousemove", e), u && u !== s && this.dispatchToElement(l, "mouseover", e);
  }, t.prototype.mouseout = function(e) {
    var i = e.zrEventControl;
    i !== "only_globalout" && this.dispatchToElement(this._hovered, "mouseout", e), i !== "no_globalout" && this.trigger("globalout", { type: "globalout", event: e });
  }, t.prototype.resize = function() {
    this._hovered = new Ji(0, 0);
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
      for (var o = "on" + i, s = y0(i, e, n); a && (a[o] && (s.cancelBubble = !!a[o].call(a, s)), a.trigger(i, s), a = a.__hostTarget ? a.__hostTarget : a.parent, !s.cancelBubble); )
        ;
      s.cancelBubble || (this.trigger(i, s), this.painter && this.painter.eachOtherLayer && this.painter.eachOtherLayer(function(l) {
        typeof l[o] == "function" && l[o].call(l, s), l.trigger && l.trigger(i, s);
      }));
    }
  }, t.prototype.findHover = function(e, i, n) {
    var a = this.storage.getDisplayList(), o = new Ji(e, i);
    if ($h(a, o, e, i, n), this._pointerSize && !o.target) {
      for (var s = [], l = this._pointerSize, u = l / 2, f = new rt(e - u, i - u, l, l), h = a.length - 1; h >= 0; h--) {
        var v = a[h];
        v !== n && !v.ignore && !v.ignoreCoarsePointer && (!v.parent || !v.parent.ignoreCoarsePointer) && (ks.copy(v.getBoundingRect()), v.transform && ks.applyTransform(v.transform), ks.intersect(f) && s.push(v));
      }
      if (s.length)
        for (var c = 4, d = Math.PI / 12, y = Math.PI * 2, g = 0; g < u; g += c)
          for (var p = 0; p < y; p += d) {
            var m = e + g * Math.cos(p), _ = i + g * Math.sin(p);
            if ($h(s, o, m, _, n), o.target)
              return o;
          }
    }
    return o;
  }, t.prototype.processGesture = function(e, i) {
    this._gestureMgr || (this._gestureMgr = new v0());
    var n = this._gestureMgr;
    i === "start" && n.clear();
    var a = n.recognize(e, this.findHover(e.zrX, e.zrY, null).target, this.proxy.dom);
    if (i === "end" && n.clear(), a) {
      var o = a.type;
      e.gestureEvent = o;
      var s = new Ji();
      s.target = a.target, this.dispatchToElement(s, o, a.event);
    }
  }, t;
})(Ae);
C(["click", "mousedown", "mouseup", "mousewheel", "dblclick", "contextmenu"], function(r) {
  Np.prototype[r] = function(t) {
    var e = t.zrX, i = t.zrY, n = Bp(this, e, i), a, o;
    if ((r !== "mouseup" || !n) && (a = this.findHover(e, i), o = a.target), r === "mousedown")
      this._downEl = o, this._downPoint = [t.zrX, t.zrY], this._upEl = o;
    else if (r === "mouseup")
      this._upEl = o;
    else if (r === "click") {
      if (this._downEl !== this._upEl || !this._downPoint || J_(this._downPoint, [t.zrX, t.zrY]) > 4)
        return;
      this._downPoint = null;
    }
    this.dispatchToElement(a, r, t);
  };
});
function w0(r, t, e) {
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
    return n ? Op : !0;
  }
  return !1;
}
function $h(r, t, e, i, n) {
  for (var a = r.length - 1; a >= 0; a--) {
    var o = r[a], s = void 0;
    if (o !== n && !o.ignore && (s = w0(o, e, i)) && (!t.topTarget && (t.topTarget = o), s !== Op)) {
      t.target = o;
      break;
    }
  }
}
function Bp(r, t, e) {
  var i = r.painter;
  return t < 0 || t > i.getWidth() || e < 0 || e > i.getHeight();
}
var Fp = 32, tn = 7;
function b0(r) {
  for (var t = 0; r >= Fp; )
    t |= r & 1, r >>= 1;
  return r + t;
}
function Vh(r, t, e, i) {
  var n = t + 1;
  if (n === e)
    return 1;
  if (i(r[n++], r[t]) < 0) {
    for (; n < e && i(r[n], r[n - 1]) < 0; )
      n++;
    x0(r, t, n);
  } else
    for (; n < e && i(r[n], r[n - 1]) >= 0; )
      n++;
  return n - t;
}
function x0(r, t, e) {
  for (e--; t < e; ) {
    var i = r[t];
    r[t++] = r[e], r[e--] = i;
  }
}
function Gh(r, t, e, i, n) {
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
function Os(r, t, e, i, n, a) {
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
function Ns(r, t, e, i, n, a) {
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
function T0(r, t) {
  var e = tn, i, n, a = 0, o = [];
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
    var d = i[c], y = n[c], g = i[c + 1], p = n[c + 1];
    n[c] = y + p, c === a - 3 && (i[c + 1] = i[c + 2], n[c + 1] = n[c + 2]), a--;
    var m = Ns(r[g], r, d, y, 0, t);
    d += m, y -= m, y !== 0 && (p = Os(r[d + y - 1], r, g, p, p - 1, t), p !== 0 && (y <= p ? h(d, y, g, p) : v(d, y, g, p)));
  }
  function h(c, d, y, g) {
    var p = 0;
    for (p = 0; p < d; p++)
      o[p] = r[c + p];
    var m = 0, _ = y, S = c;
    if (r[S++] = r[_++], --g === 0) {
      for (p = 0; p < d; p++)
        r[S + p] = o[m + p];
      return;
    }
    if (d === 1) {
      for (p = 0; p < g; p++)
        r[S + p] = r[_ + p];
      r[S + g] = o[m];
      return;
    }
    for (var b = e, w, x, T; ; ) {
      w = 0, x = 0, T = !1;
      do
        if (t(r[_], o[m]) < 0) {
          if (r[S++] = r[_++], x++, w = 0, --g === 0) {
            T = !0;
            break;
          }
        } else if (r[S++] = o[m++], w++, x = 0, --d === 1) {
          T = !0;
          break;
        }
      while ((w | x) < b);
      if (T)
        break;
      do {
        if (w = Ns(r[_], o, m, d, 0, t), w !== 0) {
          for (p = 0; p < w; p++)
            r[S + p] = o[m + p];
          if (S += w, m += w, d -= w, d <= 1) {
            T = !0;
            break;
          }
        }
        if (r[S++] = r[_++], --g === 0) {
          T = !0;
          break;
        }
        if (x = Os(o[m], r, _, g, 0, t), x !== 0) {
          for (p = 0; p < x; p++)
            r[S + p] = r[_ + p];
          if (S += x, _ += x, g -= x, g === 0) {
            T = !0;
            break;
          }
        }
        if (r[S++] = o[m++], --d === 1) {
          T = !0;
          break;
        }
        b--;
      } while (w >= tn || x >= tn);
      if (T)
        break;
      b < 0 && (b = 0), b += 2;
    }
    if (e = b, e < 1 && (e = 1), d === 1) {
      for (p = 0; p < g; p++)
        r[S + p] = r[_ + p];
      r[S + g] = o[m];
    } else {
      if (d === 0)
        throw new Error();
      for (p = 0; p < d; p++)
        r[S + p] = o[m + p];
    }
  }
  function v(c, d, y, g) {
    var p = 0;
    for (p = 0; p < g; p++)
      o[p] = r[y + p];
    var m = c + d - 1, _ = g - 1, S = y + g - 1, b = 0, w = 0;
    if (r[S--] = r[m--], --d === 0) {
      for (b = S - (g - 1), p = 0; p < g; p++)
        r[b + p] = o[p];
      return;
    }
    if (g === 1) {
      for (S -= d, m -= d, w = S + 1, b = m + 1, p = d - 1; p >= 0; p--)
        r[w + p] = r[b + p];
      r[S] = o[_];
      return;
    }
    for (var x = e; ; ) {
      var T = 0, D = 0, A = !1;
      do
        if (t(o[_], r[m]) < 0) {
          if (r[S--] = r[m--], T++, D = 0, --d === 0) {
            A = !0;
            break;
          }
        } else if (r[S--] = o[_--], D++, T = 0, --g === 1) {
          A = !0;
          break;
        }
      while ((T | D) < x);
      if (A)
        break;
      do {
        if (T = d - Ns(o[_], r, c, d, d - 1, t), T !== 0) {
          for (S -= T, m -= T, d -= T, w = S + 1, b = m + 1, p = T - 1; p >= 0; p--)
            r[w + p] = r[b + p];
          if (d === 0) {
            A = !0;
            break;
          }
        }
        if (r[S--] = o[_--], --g === 1) {
          A = !0;
          break;
        }
        if (D = g - Os(r[m], o, 0, g, g - 1, t), D !== 0) {
          for (S -= D, _ -= D, g -= D, w = S + 1, b = _ + 1, p = 0; p < D; p++)
            r[w + p] = o[b + p];
          if (g <= 1) {
            A = !0;
            break;
          }
        }
        if (r[S--] = r[m--], --d === 0) {
          A = !0;
          break;
        }
        x--;
      } while (T >= tn || D >= tn);
      if (A)
        break;
      x < 0 && (x = 0), x += 2;
    }
    if (e = x, e < 1 && (e = 1), g === 1) {
      for (S -= d, m -= d, w = S + 1, b = m + 1, p = d - 1; p >= 0; p--)
        r[w + p] = r[b + p];
      r[S] = o[_];
    } else {
      if (g === 0)
        throw new Error();
      for (b = S - (g - 1), p = 0; p < g; p++)
        r[b + p] = o[p];
    }
  }
  return {
    mergeRuns: l,
    forceMergeRuns: u,
    pushRun: s
  };
}
function ao(r, t, e, i) {
  e || (e = 0), i || (i = r.length);
  var n = i - e;
  if (!(n < 2)) {
    var a = 0;
    if (n < Fp) {
      a = Vh(r, e, i, t), Gh(r, e, i, e + a, t);
      return;
    }
    var o = T0(r, t), s = b0(n);
    do {
      if (a = Vh(r, e, i, t), a < s) {
        var l = n;
        l > s && (l = s), Gh(r, e, e + l, e + a, t), a = l;
      }
      o.pushRun(e, a), o.mergeRuns(), n -= a, e += a;
    } while (n !== 0);
    o.forceMergeRuns();
  }
}
var Xt = 1, mn = 2, _i = 4, Wh = !1;
function Bs() {
  Wh || (Wh = !0, console.warn("z / z2 / zlevel of displayable is invalid, which may cause unexpected errors"));
}
function Uh(r, t) {
  return r.zlevel === t.zlevel ? r.z === t.z ? r.z2 - t.z2 : r.z - t.z : r.zlevel - t.zlevel;
}
var C0 = (function() {
  function r() {
    this._roots = [], this._displayList = [], this._displayListLen = 0, this.displayableSortFunc = Uh;
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
    i.length = this._displayListLen, ao(i, Uh);
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
          t.__dirty && (u.__dirty |= Xt), this._updateAndAddDisplayable(u, e, i);
        }
        t.__dirty = 0;
      } else {
        var f = t;
        e && e.length ? f.__clipPaths = e : f.__clipPaths && f.__clipPaths.length > 0 && (f.__clipPaths = []), isNaN(f.z) && (Bs(), f.z = 0), isNaN(f.z2) && (Bs(), f.z2 = 0), isNaN(f.zlevel) && (Bs(), f.zlevel = 0), this._displayList[this._displayListLen++] = f;
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
    var n = et(this._roots, t);
    n >= 0 && this._roots.splice(n, 1);
  }, r.prototype.delAllRoots = function() {
    this._roots = [], this._displayList = [], this._displayListLen = 0;
  }, r.prototype.getRoots = function() {
    return this._roots;
  }, r.prototype.dispose = function() {
    this._displayList = null, this._roots = null;
  }, r;
})(), So;
So = U.hasGlobalWindow && (window.requestAnimationFrame && window.requestAnimationFrame.bind(window) || window.msRequestAnimationFrame && window.msRequestAnimationFrame.bind(window) || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame) || function(r) {
  return setTimeout(r, 16);
};
var Ln = {
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
    return 1 - Ln.bounceOut(1 - r);
  },
  bounceOut: function(r) {
    return r < 1 / 2.75 ? 7.5625 * r * r : r < 2 / 2.75 ? 7.5625 * (r -= 1.5 / 2.75) * r + 0.75 : r < 2.5 / 2.75 ? 7.5625 * (r -= 2.25 / 2.75) * r + 0.9375 : 7.5625 * (r -= 2.625 / 2.75) * r + 0.984375;
  },
  bounceInOut: function(r) {
    return r < 0.5 ? Ln.bounceIn(r * 2) * 0.5 : Ln.bounceOut(r * 2 - 1) * 0.5 + 0.5;
  }
}, ya = Math.pow, nr = Math.sqrt, wo = 1e-8, zp = 1e-4, Yh = nr(3), ma = 1 / 3, be = Wi(), ee = Wi(), Li = Wi();
function er(r) {
  return r > -wo && r < wo;
}
function Hp(r) {
  return r > wo || r < -wo;
}
function Ct(r, t, e, i, n) {
  var a = 1 - n;
  return a * a * (a * r + 3 * n * t) + n * n * (n * i + 3 * a * e);
}
function Xh(r, t, e, i, n) {
  var a = 1 - n;
  return 3 * (((t - r) * a + 2 * (e - t) * n) * a + (i - e) * n * n);
}
function bo(r, t, e, i, n, a) {
  var o = i + 3 * (t - e) - r, s = 3 * (e - t * 2 + r), l = 3 * (t - r), u = r - n, f = s * s - 3 * o * l, h = s * l - 9 * o * u, v = l * l - 3 * s * u, c = 0;
  if (er(f) && er(h))
    if (er(s))
      a[0] = 0;
    else {
      var d = -l / s;
      d >= 0 && d <= 1 && (a[c++] = d);
    }
  else {
    var y = h * h - 4 * f * v;
    if (er(y)) {
      var g = h / f, d = -s / o + g, p = -g / 2;
      d >= 0 && d <= 1 && (a[c++] = d), p >= 0 && p <= 1 && (a[c++] = p);
    } else if (y > 0) {
      var m = nr(y), _ = f * s + 1.5 * o * (-h + m), S = f * s + 1.5 * o * (-h - m);
      _ < 0 ? _ = -ya(-_, ma) : _ = ya(_, ma), S < 0 ? S = -ya(-S, ma) : S = ya(S, ma);
      var d = (-s - (_ + S)) / (3 * o);
      d >= 0 && d <= 1 && (a[c++] = d);
    } else {
      var b = (2 * f * s - 3 * o * h) / (2 * nr(f * f * f)), w = Math.acos(b) / 3, x = nr(f), T = Math.cos(w), d = (-s - 2 * x * T) / (3 * o), p = (-s + x * (T + Yh * Math.sin(w))) / (3 * o), D = (-s + x * (T - Yh * Math.sin(w))) / (3 * o);
      d >= 0 && d <= 1 && (a[c++] = d), p >= 0 && p <= 1 && (a[c++] = p), D >= 0 && D <= 1 && (a[c++] = D);
    }
  }
  return c;
}
function $p(r, t, e, i, n) {
  var a = 6 * e - 12 * t + 6 * r, o = 9 * t + 3 * i - 3 * r - 9 * e, s = 3 * t - 3 * r, l = 0;
  if (er(o)) {
    if (Hp(a)) {
      var u = -s / a;
      u >= 0 && u <= 1 && (n[l++] = u);
    }
  } else {
    var f = a * a - 4 * o * s;
    if (er(f))
      n[0] = -a / (2 * o);
    else if (f > 0) {
      var h = nr(f), u = (-a + h) / (2 * o), v = (-a - h) / (2 * o);
      u >= 0 && u <= 1 && (n[l++] = u), v >= 0 && v <= 1 && (n[l++] = v);
    }
  }
  return l;
}
function xo(r, t, e, i, n, a) {
  var o = (t - r) * n + r, s = (e - t) * n + t, l = (i - e) * n + e, u = (s - o) * n + o, f = (l - s) * n + s, h = (f - u) * n + u;
  a[0] = r, a[1] = o, a[2] = u, a[3] = h, a[4] = h, a[5] = f, a[6] = l, a[7] = i;
}
function D0(r, t, e, i, n, a, o, s, l, u, f) {
  var h, v = 5e-3, c = 1 / 0, d, y, g, p;
  be[0] = l, be[1] = u;
  for (var m = 0; m < 1; m += 0.05)
    ee[0] = Ct(r, e, n, o, m), ee[1] = Ct(t, i, a, s, m), g = Di(be, ee), g < c && (h = m, c = g);
  c = 1 / 0;
  for (var _ = 0; _ < 32 && !(v < zp); _++)
    d = h - v, y = h + v, ee[0] = Ct(r, e, n, o, d), ee[1] = Ct(t, i, a, s, d), g = Di(ee, be), d >= 0 && g < c ? (h = d, c = g) : (Li[0] = Ct(r, e, n, o, y), Li[1] = Ct(t, i, a, s, y), p = Di(Li, be), y <= 1 && p < c ? (h = y, c = p) : v *= 0.5);
  return nr(c);
}
function M0(r, t, e, i, n, a, o, s, l) {
  for (var u = r, f = t, h = 0, v = 1 / l, c = 1; c <= l; c++) {
    var d = c * v, y = Ct(r, e, n, o, d), g = Ct(t, i, a, s, d), p = y - u, m = g - f;
    h += Math.sqrt(p * p + m * m), u = y, f = g;
  }
  return h;
}
function Bt(r, t, e, i) {
  var n = 1 - i;
  return n * (n * r + 2 * i * t) + i * i * e;
}
function Zh(r, t, e, i) {
  return 2 * ((1 - i) * (t - r) + i * (e - t));
}
function A0(r, t, e, i, n) {
  var a = r - 2 * t + e, o = 2 * (t - r), s = r - i, l = 0;
  if (er(a)) {
    if (Hp(o)) {
      var u = -s / o;
      u >= 0 && u <= 1 && (n[l++] = u);
    }
  } else {
    var f = o * o - 4 * a * s;
    if (er(f)) {
      var u = -o / (2 * a);
      u >= 0 && u <= 1 && (n[l++] = u);
    } else if (f > 0) {
      var h = nr(f), u = (-o + h) / (2 * a), v = (-o - h) / (2 * a);
      u >= 0 && u <= 1 && (n[l++] = u), v >= 0 && v <= 1 && (n[l++] = v);
    }
  }
  return l;
}
function Vp(r, t, e) {
  var i = r + e - 2 * t;
  return i === 0 ? 0.5 : (r - t) / i;
}
function To(r, t, e, i, n) {
  var a = (t - r) * i + r, o = (e - t) * i + t, s = (o - a) * i + a;
  n[0] = r, n[1] = a, n[2] = s, n[3] = s, n[4] = o, n[5] = e;
}
function L0(r, t, e, i, n, a, o, s, l) {
  var u, f = 5e-3, h = 1 / 0;
  be[0] = o, be[1] = s;
  for (var v = 0; v < 1; v += 0.05) {
    ee[0] = Bt(r, e, n, v), ee[1] = Bt(t, i, a, v);
    var c = Di(be, ee);
    c < h && (u = v, h = c);
  }
  h = 1 / 0;
  for (var d = 0; d < 32 && !(f < zp); d++) {
    var y = u - f, g = u + f;
    ee[0] = Bt(r, e, n, y), ee[1] = Bt(t, i, a, y);
    var c = Di(ee, be);
    if (y >= 0 && c < h)
      u = y, h = c;
    else {
      Li[0] = Bt(r, e, n, g), Li[1] = Bt(t, i, a, g);
      var p = Di(Li, be);
      g <= 1 && p < h ? (u = g, h = p) : f *= 0.5;
    }
  }
  return nr(h);
}
function P0(r, t, e, i, n, a, o) {
  for (var s = r, l = t, u = 0, f = 1 / o, h = 1; h <= o; h++) {
    var v = h * f, c = Bt(r, e, n, v), d = Bt(t, i, a, v), y = c - s, g = d - l;
    u += Math.sqrt(y * y + g * g), s = c, l = d;
  }
  return u;
}
var I0 = /cubic-bezier\(([0-9,\.e ]+)\)/;
function Gp(r) {
  var t = r && I0.exec(r);
  if (t) {
    var e = t[1].split(","), i = +xe(e[0]), n = +xe(e[1]), a = +xe(e[2]), o = +xe(e[3]);
    if (isNaN(i + n + a + o))
      return;
    var s = [];
    return function(l) {
      return l <= 0 ? 0 : l >= 1 ? 1 : bo(0, i, a, 1, l, s) && Ct(0, n, o, 1, s[0]);
    };
  }
}
var E0 = (function() {
  function r(t) {
    this._inited = !1, this._startTime = 0, this._pausedTime = 0, this._paused = !1, this._life = t.life || 1e3, this._delay = t.delay || 0, this.loop = t.loop || !1, this.onframe = t.onframe || Ht, this.ondestroy = t.ondestroy || Ht, this.onrestart = t.onrestart || Ht, t.easing && this.setEasing(t.easing);
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
    this.easing = t, this.easingFunc = $(t) ? t : Ln[t] || Gp(t);
  }, r;
})(), Wp = /* @__PURE__ */ (function() {
  function r(t) {
    this.value = t;
  }
  return r;
})(), R0 = (function() {
  function r() {
    this._len = 0;
  }
  return r.prototype.insert = function(t) {
    var e = new Wp(t);
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
})(), ua = (function() {
  function r(t) {
    this._list = new R0(), this._maxSize = 10, this._map = {}, this._maxSize = t;
  }
  return r.prototype.put = function(t, e) {
    var i = this._list, n = this._map, a = null;
    if (n[t] == null) {
      var o = i.len(), s = this._lastRemovedEntry;
      if (o >= this._maxSize && o > 0) {
        var l = i.head;
        i.remove(l), delete n[l.key], a = l.value, this._lastRemovedEntry = l;
      }
      s ? s.value = e : s = new Wp(e), s.key = t, i.insertEntry(s), n[t] = s;
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
})(), qh = {
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
function ar(r) {
  return r = Math.round(r), r < 0 ? 0 : r > 255 ? 255 : r;
}
function fu(r) {
  return r < 0 ? 0 : r > 1 ? 1 : r;
}
function Fs(r) {
  var t = r;
  return t.length && t.charAt(t.length - 1) === "%" ? ar(parseFloat(t) / 100 * 255) : ar(parseInt(t, 10));
}
function Pn(r) {
  var t = r;
  return t.length && t.charAt(t.length - 1) === "%" ? fu(parseFloat(t) / 100) : fu(parseFloat(t));
}
function zs(r, t, e) {
  return e < 0 ? e += 1 : e > 1 && (e -= 1), e * 6 < 1 ? r + (t - r) * e * 6 : e * 2 < 1 ? t : e * 3 < 2 ? r + (t - r) * (2 / 3 - e) * 6 : r;
}
function _a(r, t, e) {
  return r + (t - r) * e;
}
function Qt(r, t, e, i, n) {
  return r[0] = t, r[1] = e, r[2] = i, r[3] = n, r;
}
function hu(r, t) {
  return r[0] = t[0], r[1] = t[1], r[2] = t[2], r[3] = t[3], r;
}
var Up = new ua(20), Sa = null;
function ni(r, t) {
  Sa && hu(Sa, t), Sa = Up.put(r, Sa || t.slice());
}
function Oe(r, t) {
  if (r) {
    t = t || [];
    var e = Up.get(r);
    if (e)
      return hu(t, e);
    r = r + "";
    var i = r.replace(/ /g, "").toLowerCase();
    if (i in qh)
      return hu(t, qh[i]), ni(r, t), t;
    var n = i.length;
    if (i.charAt(0) === "#") {
      if (n === 4 || n === 5) {
        var a = parseInt(i.slice(1, 4), 16);
        if (!(a >= 0 && a <= 4095)) {
          Qt(t, 0, 0, 0, 1);
          return;
        }
        return Qt(t, (a & 3840) >> 4 | (a & 3840) >> 8, a & 240 | (a & 240) >> 4, a & 15 | (a & 15) << 4, n === 5 ? parseInt(i.slice(4), 16) / 15 : 1), ni(r, t), t;
      } else if (n === 7 || n === 9) {
        var a = parseInt(i.slice(1, 7), 16);
        if (!(a >= 0 && a <= 16777215)) {
          Qt(t, 0, 0, 0, 1);
          return;
        }
        return Qt(t, (a & 16711680) >> 16, (a & 65280) >> 8, a & 255, n === 9 ? parseInt(i.slice(7), 16) / 255 : 1), ni(r, t), t;
      }
      return;
    }
    var o = i.indexOf("("), s = i.indexOf(")");
    if (o !== -1 && s + 1 === n) {
      var l = i.substr(0, o), u = i.substr(o + 1, s - (o + 1)).split(","), f = 1;
      switch (l) {
        case "rgba":
          if (u.length !== 4)
            return u.length === 3 ? Qt(t, +u[0], +u[1], +u[2], 1) : Qt(t, 0, 0, 0, 1);
          f = Pn(u.pop());
        case "rgb":
          if (u.length >= 3)
            return Qt(t, Fs(u[0]), Fs(u[1]), Fs(u[2]), u.length === 3 ? f : Pn(u[3])), ni(r, t), t;
          Qt(t, 0, 0, 0, 1);
          return;
        case "hsla":
          if (u.length !== 4) {
            Qt(t, 0, 0, 0, 1);
            return;
          }
          return u[3] = Pn(u[3]), Kh(u, t), ni(r, t), t;
        case "hsl":
          if (u.length !== 3) {
            Qt(t, 0, 0, 0, 1);
            return;
          }
          return Kh(u, t), ni(r, t), t;
        default:
          return;
      }
    }
    Qt(t, 0, 0, 0, 1);
  }
}
function Kh(r, t) {
  var e = (parseFloat(r[0]) % 360 + 360) % 360 / 360, i = Pn(r[1]), n = Pn(r[2]), a = n <= 0.5 ? n * (i + 1) : n + i - n * i, o = n * 2 - a;
  return t = t || [], Qt(t, ar(zs(o, a, e + 1 / 3) * 255), ar(zs(o, a, e) * 255), ar(zs(o, a, e - 1 / 3) * 255), 1), r.length === 4 && (t[3] = r[3]), t;
}
function Qh(r, t) {
  var e = Oe(r);
  if (e) {
    for (var i = 0; i < 3; i++)
      e[i] = e[i] * (1 - t) | 0, e[i] > 255 ? e[i] = 255 : e[i] < 0 && (e[i] = 0);
    return qo(e, e.length === 4 ? "rgba" : "rgb");
  }
}
function k0(r, t, e) {
  if (!(!(t && t.length) || !(r >= 0 && r <= 1))) {
    var i = r * (t.length - 1), n = Math.floor(i), a = Math.ceil(i), o = Oe(t[n]), s = Oe(t[a]), l = i - n, u = qo([
      ar(_a(o[0], s[0], l)),
      ar(_a(o[1], s[1], l)),
      ar(_a(o[2], s[2], l)),
      fu(_a(o[3], s[3], l))
    ], "rgba");
    return e ? {
      color: u,
      leftIndex: n,
      rightIndex: a,
      value: i
    } : u;
  }
}
function qo(r, t) {
  if (!(!r || !r.length)) {
    var e = r[0] + "," + r[1] + "," + r[2];
    return (t === "rgba" || t === "hsva" || t === "hsla") && (e += "," + r[3]), t + "(" + e + ")";
  }
}
function Co(r, t) {
  var e = Oe(r);
  return e ? (0.299 * e[0] + 0.587 * e[1] + 0.114 * e[2]) * e[3] / 255 + (1 - e[3]) * t : 0;
}
var jh = new ua(100);
function Jh(r) {
  if (z(r)) {
    var t = jh.get(r);
    return t || (t = Qh(r, -0.1), jh.put(r, t)), t;
  } else if (Xo(r)) {
    var e = k({}, r);
    return e.colorStops = H(r.colorStops, function(i) {
      return {
        offset: i.offset,
        color: Qh(i.color, -0.1)
      };
    }), e;
  }
  return r;
}
function O0(r) {
  return r.type === "linear";
}
function N0(r) {
  return r.type === "radial";
}
(function() {
  return U.hasGlobalWindow && $(window.btoa) ? function(r) {
    return window.btoa(unescape(encodeURIComponent(r)));
  } : typeof Buffer < "u" ? function(r) {
    return Buffer.from(r).toString("base64");
  } : function(r) {
    return null;
  };
})();
var cu = Array.prototype.slice;
function Re(r, t, e) {
  return (t - r) * e + r;
}
function Hs(r, t, e, i) {
  for (var n = t.length, a = 0; a < n; a++)
    r[a] = Re(t[a], e[a], i);
  return r;
}
function B0(r, t, e, i) {
  for (var n = t.length, a = n && t[0].length, o = 0; o < n; o++) {
    r[o] || (r[o] = []);
    for (var s = 0; s < a; s++)
      r[o][s] = Re(t[o][s], e[o][s], i);
  }
  return r;
}
function wa(r, t, e, i) {
  for (var n = t.length, a = 0; a < n; a++)
    r[a] = t[a] + e[a] * i;
  return r;
}
function tc(r, t, e, i) {
  for (var n = t.length, a = n && t[0].length, o = 0; o < n; o++) {
    r[o] || (r[o] = []);
    for (var s = 0; s < a; s++)
      r[o][s] = t[o][s] + e[o][s] * i;
  }
  return r;
}
function F0(r, t) {
  for (var e = r.length, i = t.length, n = e > i ? t : r, a = Math.min(e, i), o = n[a - 1] || { color: [0, 0, 0, 0], offset: 0 }, s = a; s < Math.max(e, i); s++)
    n.push({
      offset: o.offset,
      color: o.color.slice()
    });
}
function z0(r, t, e) {
  var i = r, n = t;
  if (!(!i.push || !n.push)) {
    var a = i.length, o = n.length;
    if (a !== o) {
      var s = a > o;
      if (s)
        i.length = o;
      else
        for (var l = a; l < o; l++)
          i.push(e === 1 ? n[l] : cu.call(n[l]));
    }
    for (var u = i[0] && i[0].length, l = 0; l < i.length; l++)
      if (e === 1)
        isNaN(i[l]) && (i[l] = n[l]);
      else
        for (var f = 0; f < u; f++)
          isNaN(i[l][f]) && (i[l][f] = n[l][f]);
  }
}
function oo(r) {
  if ($t(r)) {
    var t = r.length;
    if ($t(r[0])) {
      for (var e = [], i = 0; i < t; i++)
        e.push(cu.call(r[i]));
      return e;
    }
    return cu.call(r);
  }
  return r;
}
function so(r) {
  return r[0] = Math.floor(r[0]) || 0, r[1] = Math.floor(r[1]) || 0, r[2] = Math.floor(r[2]) || 0, r[3] = r[3] == null ? 1 : r[3], "rgba(" + r.join(",") + ")";
}
function H0(r) {
  return $t(r && r[0]) ? 2 : 1;
}
var ba = 0, lo = 1, Yp = 2, _n = 3, vu = 4, du = 5, ec = 6;
function rc(r) {
  return r === vu || r === du;
}
function xa(r) {
  return r === lo || r === Yp;
}
var en = [0, 0, 0, 0], $0 = (function() {
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
    var n = this.keyframes, a = n.length, o = !1, s = ec, l = e;
    if ($t(e)) {
      var u = H0(e);
      s = u, (u === 1 && !ut(e[0]) || u === 2 && !ut(e[0][0])) && (o = !0);
    } else if (ut(e) && !_o(e))
      s = ba;
    else if (z(e))
      if (!isNaN(+e))
        s = ba;
      else {
        var f = Oe(e);
        f && (l = f, s = _n);
      }
    else if (Xo(e)) {
      var h = k({}, l);
      h.colorStops = H(e.colorStops, function(c) {
        return {
          offset: c.offset,
          color: Oe(c.color)
        };
      }), O0(e) ? s = vu : N0(e) && (s = du), l = h;
    }
    a === 0 ? this.valType = s : (s !== this.valType || s === ec) && (o = !0), this.discrete = this.discrete || o;
    var v = {
      time: t,
      value: l,
      rawValue: e,
      percent: 0
    };
    return i && (v.easing = i, v.easingFunc = $(i) ? i : Ln[i] || Gp(i)), n.push(v), v;
  }, r.prototype.prepare = function(t, e) {
    var i = this.keyframes;
    this._needsSort && i.sort(function(y, g) {
      return y.time - g.time;
    });
    for (var n = this.valType, a = i.length, o = i[a - 1], s = this.discrete, l = xa(n), u = rc(n), f = 0; f < a; f++) {
      var h = i[f], v = h.value, c = o.value;
      h.percent = h.time / t, s || (l && f !== a - 1 ? z0(v, c, n) : u && F0(v.colorStops, c.colorStops));
    }
    if (!s && n !== du && e && this.needsAnimate() && e.needsAnimate() && n === e.valType && !e._finished) {
      this._additiveTrack = e;
      for (var d = i[0].value, f = 0; f < a; f++)
        n === ba ? i[f].additiveValue = i[f].value - d : n === _n ? i[f].additiveValue = wa([], i[f].value, d, -1) : xa(n) && (i[f].additiveValue = n === lo ? wa([], i[f].value, d, -1) : tc([], i[f].value, d, -1));
    }
  }, r.prototype.step = function(t, e) {
    if (!this._finished) {
      this._additiveTrack && this._additiveTrack._finished && (this._additiveTrack = null);
      var i = this._additiveTrack != null, n = i ? "additiveValue" : "value", a = this.valType, o = this.keyframes, s = o.length, l = this.propName, u = a === _n, f, h = this._lastFr, v = Math.min, c, d;
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
        var g = d.percent - c.percent, p = g === 0 ? 1 : v((e - c.percent) / g, 1);
        d.easingFunc && (p = d.easingFunc(p));
        var m = i ? this._additiveValue : u ? en : t[l];
        if ((xa(a) || u) && !m && (m = this._additiveValue = []), this.discrete)
          t[l] = p < 1 ? c.rawValue : d.rawValue;
        else if (xa(a))
          a === lo ? Hs(m, c[n], d[n], p) : B0(m, c[n], d[n], p);
        else if (rc(a)) {
          var _ = c[n], S = d[n], b = a === vu;
          t[l] = {
            type: b ? "linear" : "radial",
            x: Re(_.x, S.x, p),
            y: Re(_.y, S.y, p),
            colorStops: H(_.colorStops, function(x, T) {
              var D = S.colorStops[T];
              return {
                offset: Re(x.offset, D.offset, p),
                color: so(Hs([], x.color, D.color, p))
              };
            }),
            global: S.global
          }, b ? (t[l].x2 = Re(_.x2, S.x2, p), t[l].y2 = Re(_.y2, S.y2, p)) : t[l].r = Re(_.r, S.r, p);
        } else if (u)
          Hs(m, c[n], d[n], p), i || (t[l] = so(m));
        else {
          var w = Re(c[n], d[n], p);
          i ? this._additiveValue = w : t[l] = w;
        }
        i && this._addToTarget(t);
      }
    }
  }, r.prototype._addToTarget = function(t) {
    var e = this.valType, i = this.propName, n = this._additiveValue;
    e === ba ? t[i] = t[i] + n : e === _n ? (Oe(t[i], en), wa(en, en, n, 1), t[i] = so(en)) : e === lo ? wa(t[i], t[i], n, 1) : e === Yp && tc(t[i], t[i], n, 1);
  }, r;
})(), xf = (function() {
  function r(t, e, i, n) {
    if (this._tracks = {}, this._trackKeys = [], this._maxTime = 0, this._started = 0, this._clip = null, this._target = t, this._loop = e, e && n) {
      gf("Can' use additive animation on looped animation.");
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
    return this.whenWithKeys(t, e, vt(e), i);
  }, r.prototype.whenWithKeys = function(t, e, i, n) {
    for (var a = this._tracks, o = 0; o < i.length; o++) {
      var s = i[o], l = a[s];
      if (!l) {
        l = a[s] = new $0(s);
        var u = void 0, f = this._getAdditiveTrack(s);
        if (f) {
          var h = f.keyframes, v = h[h.length - 1];
          u = v && v.value, f.valType === _n && u && (u = so(u));
        } else
          u = this._target[s];
        if (u == null)
          continue;
        t > 0 && l.addKeyframe(0, oo(u), n), this._trackKeys.push(s);
      }
      l.addKeyframe(t, oo(e[s]), n);
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
        var v = new E0({
          life: n,
          loop: this._loop,
          delay: this._delay || 0,
          onframe: function(c) {
            e._started = 2;
            var d = e._additiveAnimators;
            if (d) {
              for (var y = !1, g = 0; g < d.length; g++)
                if (d[g]._clip) {
                  y = !0;
                  break;
                }
              y || (e._additiveAnimators = null);
            }
            for (var g = 0; g < i.length; g++)
              i[g].step(e._target, c);
            var p = e._onframeCbs;
            if (p)
              for (var g = 0; g < p.length; g++)
                p[g](e._target, c);
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
          l && (t[a] = oo(l.rawValue));
        }
      }
    }
  }, r.prototype.__changeFinalValue = function(t, e) {
    e = e || vt(t);
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
function xi() {
  return (/* @__PURE__ */ new Date()).getTime();
}
var V0 = (function(r) {
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
    for (var i = xi() - this._pausedTime, n = i - this._time, a = this._head; a; ) {
      var o = a.next, s = a.step(i, n);
      s && (a.ondestroy(), this.removeClip(a)), a = o;
    }
    this._time = i, e || (this.trigger("frame", n), this.stage.update && this.stage.update());
  }, t.prototype._startLoop = function() {
    var e = this;
    this._running = !0;
    function i() {
      e._running && (So(i), !e._paused && e.update());
    }
    So(i);
  }, t.prototype.start = function() {
    this._running || (this._time = xi(), this._pausedTime = 0, this._startLoop());
  }, t.prototype.stop = function() {
    this._running = !1;
  }, t.prototype.pause = function() {
    this._paused || (this._pauseStart = xi(), this._paused = !0);
  }, t.prototype.resume = function() {
    this._paused && (this._pausedTime += xi() - this._pauseStart, this._paused = !1);
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
    var n = new xf(e, i.loop);
    return this.addAnimator(n), n;
  }, t;
})(Ae), G0 = 300, $s = U.domSupported, Vs = (function() {
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
})(), ic = {
  mouse: ["mousemove", "mouseup"],
  pointer: ["pointermove", "pointerup"]
}, nc = !1;
function pu(r) {
  var t = r.pointerType;
  return t === "pen" || t === "touch";
}
function W0(r) {
  r.touching = !0, r.touchTimer != null && (clearTimeout(r.touchTimer), r.touchTimer = null), r.touchTimer = setTimeout(function() {
    r.touching = !1, r.touchTimer = null;
  }, 700);
}
function Gs(r) {
  r && (r.zrByTouch = !0);
}
function U0(r, t) {
  return jt(r.dom, new Y0(r, t), !0);
}
function Xp(r, t) {
  for (var e = t, i = !1; e && e.nodeType !== 9 && !(i = e.domBelongToZr || e !== t && e === r.painterRoot); )
    e = e.parentNode;
  return i;
}
var Y0 = /* @__PURE__ */ (function() {
  function r(t, e) {
    this.stopPropagation = Ht, this.stopImmediatePropagation = Ht, this.preventDefault = Ht, this.type = e.type, this.target = this.currentTarget = t.dom, this.pointerType = e.pointerType, this.clientX = e.clientX, this.clientY = e.clientY;
  }
  return r;
})(), ce = {
  mousedown: function(r) {
    r = jt(this.dom, r), this.__mayPointerCapture = [r.zrX, r.zrY], this.trigger("mousedown", r);
  },
  mousemove: function(r) {
    r = jt(this.dom, r);
    var t = this.__mayPointerCapture;
    t && (r.zrX !== t[0] || r.zrY !== t[1]) && this.__togglePointerCapture(!0), this.trigger("mousemove", r);
  },
  mouseup: function(r) {
    r = jt(this.dom, r), this.__togglePointerCapture(!1), this.trigger("mouseup", r);
  },
  mouseout: function(r) {
    r = jt(this.dom, r);
    var t = r.toElement || r.relatedTarget;
    Xp(this, t) || (this.__pointerCapturing && (r.zrEventControl = "no_globalout"), this.trigger("mouseout", r));
  },
  wheel: function(r) {
    nc = !0, r = jt(this.dom, r), this.trigger("mousewheel", r);
  },
  mousewheel: function(r) {
    nc || (r = jt(this.dom, r), this.trigger("mousewheel", r));
  },
  touchstart: function(r) {
    r = jt(this.dom, r), Gs(r), this.__lastTouchMoment = /* @__PURE__ */ new Date(), this.handler.processGesture(r, "start"), ce.mousemove.call(this, r), ce.mousedown.call(this, r);
  },
  touchmove: function(r) {
    r = jt(this.dom, r), Gs(r), this.handler.processGesture(r, "change"), ce.mousemove.call(this, r);
  },
  touchend: function(r) {
    r = jt(this.dom, r), Gs(r), this.handler.processGesture(r, "end"), ce.mouseup.call(this, r), +/* @__PURE__ */ new Date() - +this.__lastTouchMoment < G0 && ce.click.call(this, r);
  },
  pointerdown: function(r) {
    ce.mousedown.call(this, r);
  },
  pointermove: function(r) {
    pu(r) || ce.mousemove.call(this, r);
  },
  pointerup: function(r) {
    ce.mouseup.call(this, r);
  },
  pointerout: function(r) {
    pu(r) || ce.mouseout.call(this, r);
  }
};
C(["click", "dblclick", "contextmenu"], function(r) {
  ce[r] = function(t) {
    t = jt(this.dom, t), this.trigger(r, t);
  };
});
var gu = {
  pointermove: function(r) {
    pu(r) || gu.mousemove.call(this, r);
  },
  pointerup: function(r) {
    gu.mouseup.call(this, r);
  },
  mousemove: function(r) {
    this.trigger("mousemove", r);
  },
  mouseup: function(r) {
    var t = this.__pointerCapturing;
    this.__togglePointerCapture(!1), this.trigger("mouseup", r), t && (r.zrEventControl = "only_globalout", this.trigger("mouseout", r));
  }
};
function X0(r, t) {
  var e = t.domHandlers;
  U.pointerEventsSupported ? C(Vs.pointer, function(i) {
    uo(t, i, function(n) {
      e[i].call(r, n);
    });
  }) : (U.touchEventsSupported && C(Vs.touch, function(i) {
    uo(t, i, function(n) {
      e[i].call(r, n), W0(t);
    });
  }), C(Vs.mouse, function(i) {
    uo(t, i, function(n) {
      n = _f(n), t.touching || e[i].call(r, n);
    });
  }));
}
function Z0(r, t) {
  U.pointerEventsSupported ? C(ic.pointer, e) : U.touchEventsSupported || C(ic.mouse, e);
  function e(i) {
    function n(a) {
      a = _f(a), Xp(r, a.target) || (a = U0(r, a), t.domHandlers[i].call(r, a));
    }
    uo(t, i, n, { capture: !0 });
  }
}
function uo(r, t, e, i) {
  r.mounted[t] = e, r.listenerOpts[t] = i, h0(r.domTarget, t, e, i);
}
function Ws(r) {
  var t = r.mounted;
  for (var e in t)
    t.hasOwnProperty(e) && c0(r.domTarget, e, t[e], r.listenerOpts[e]);
  r.mounted = {};
}
var ac = /* @__PURE__ */ (function() {
  function r(t, e) {
    this.mounted = {}, this.listenerOpts = {}, this.touching = !1, this.domTarget = t, this.domHandlers = e;
  }
  return r;
})(), q0 = (function(r) {
  O(t, r);
  function t(e, i) {
    var n = r.call(this) || this;
    return n.__pointerCapturing = !1, n.dom = e, n.painterRoot = i, n._localHandlerScope = new ac(e, ce), $s && (n._globalHandlerScope = new ac(document, gu)), X0(n, n._localHandlerScope), n;
  }
  return t.prototype.dispose = function() {
    Ws(this._localHandlerScope), $s && Ws(this._globalHandlerScope);
  }, t.prototype.setCursor = function(e) {
    this.dom.style && (this.dom.style.cursor = e || "default");
  }, t.prototype.__togglePointerCapture = function(e) {
    if (this.__mayPointerCapture = null, $s && +this.__pointerCapturing ^ +e) {
      this.__pointerCapturing = e;
      var i = this._globalHandlerScope;
      e ? Z0(this, i) : Ws(i);
    }
  }, t;
})(Ae), Zp = 1;
U.hasGlobalWindow && (Zp = Math.max(window.devicePixelRatio || window.screen && window.screen.deviceXDPI / window.screen.logicalXDPI || 1, 1));
var Do = Zp, yu = 0.4, mu = "#333", _u = "#ccc", K0 = "#eee", oc = Sf, sc = 5e-5;
function mr(r) {
  return r > sc || r < -sc;
}
var _r = [], ai = [], Us = Mi(), Ys = Math.abs, Tf = (function() {
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
    return mr(this.rotation) || mr(this.x) || mr(this.y) || mr(this.scaleX - 1) || mr(this.scaleY - 1) || mr(this.skewX) || mr(this.skewY);
  }, r.prototype.updateTransform = function() {
    var t = this.parent && this.parent.transform, e = this.needLocalTransform(), i = this.transform;
    if (!(e || t)) {
      i && (oc(i), this.invTransform = null);
      return;
    }
    i = i || Mi(), e ? this.getLocalTransform(i) : oc(i), t && (e ? Ai(i, t, i) : p0(i, t)), this.transform = i, this._resolveGlobalScaleRatio(i);
  }, r.prototype._resolveGlobalScaleRatio = function(t) {
    var e = this.globalScaleRatio;
    if (e != null && e !== 1) {
      this.getGlobalScale(_r);
      var i = _r[0] < 0 ? -1 : 1, n = _r[1] < 0 ? -1 : 1, a = ((_r[0] - i) * e + i) / _r[0] || 0, o = ((_r[1] - n) * e + n) / _r[1] || 0;
      t[0] *= a, t[1] *= a, t[2] *= o, t[3] *= o;
    }
    this.invTransform = this.invTransform || Mi(), bf(this.invTransform, t);
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
      t && t.transform && (t.invTransform = t.invTransform || Mi(), Ai(ai, t.invTransform, e), e = ai);
      var i = this.originX, n = this.originY;
      (i || n) && (Us[4] = i, Us[5] = n, Ai(ai, e, Us), ai[4] -= i, ai[5] -= n, e = ai), this.setLocalTransform(e);
    }
  }, r.prototype.getGlobalScale = function(t) {
    var e = this.transform;
    return t = t || [], e ? (t[0] = Math.sqrt(e[0] * e[0] + e[1] * e[1]), t[1] = Math.sqrt(e[2] * e[2] + e[3] * e[3]), e[0] < 0 && (t[0] = -t[0]), e[3] < 0 && (t[1] = -t[1]), t) : (t[0] = 1, t[1] = 1, t);
  }, r.prototype.transformCoordToLocal = function(t, e) {
    var i = [t, e], n = this.invTransform;
    return n && ae(i, i, n), i;
  }, r.prototype.transformCoordToGlobal = function(t, e) {
    var i = [t, e], n = this.transform;
    return n && ae(i, i, n), i;
  }, r.prototype.getLineScale = function() {
    var t = this.transform;
    return t && Ys(t[0] - 1) > 1e-10 && Ys(t[3] - 1) > 1e-10 ? Math.sqrt(Ys(t[0] * t[3] - t[2] * t[1])) : 1;
  }, r.prototype.copyTransform = function(t) {
    Q0(this, t);
  }, r.getLocalTransform = function(t, e) {
    e = e || [];
    var i = t.originX || 0, n = t.originY || 0, a = t.scaleX, o = t.scaleY, s = t.anchorX, l = t.anchorY, u = t.rotation || 0, f = t.x, h = t.y, v = t.skewX ? Math.tan(t.skewX) : 0, c = t.skewY ? Math.tan(-t.skewY) : 0;
    if (i || n || s || l) {
      var d = i + s, y = n + l;
      e[4] = -d * a - v * y * o, e[5] = -y * o - c * d * a;
    } else
      e[4] = e[5] = 0;
    return e[0] = a, e[3] = o, e[1] = c * a, e[2] = v * o, u && wf(e, e, u), e[4] += i + f, e[5] += n + h, e;
  }, r.initDefaultProps = (function() {
    var t = r.prototype;
    t.scaleX = t.scaleY = t.globalScaleRatio = 1, t.x = t.y = t.originX = t.originY = t.skewX = t.skewY = t.rotation = t.anchorX = t.anchorY = 0;
  })(), r;
})(), Zn = [
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
function Q0(r, t) {
  for (var e = 0; e < Zn.length; e++) {
    var i = Zn[e];
    r[i] = t[i];
  }
}
var lc = {};
function Zt(r, t) {
  t = t || Yr;
  var e = lc[t];
  e || (e = lc[t] = new ua(500));
  var i = e.get(r);
  return i == null && (i = Vi.measureText(r, t).width, e.put(r, i)), i;
}
function uc(r, t, e, i) {
  var n = Zt(r, t), a = Df(t), o = Sn(0, n, e), s = Si(0, a, i), l = new rt(o, s, n, a);
  return l;
}
function Cf(r, t, e, i) {
  var n = ((r || "") + "").split(`
`), a = n.length;
  if (a === 1)
    return uc(n[0], t, e, i);
  for (var o = new rt(0, 0, 0, 0), s = 0; s < n.length; s++) {
    var l = uc(n[s], t, e, i);
    s === 0 ? o.copy(l) : o.union(l);
  }
  return o;
}
function Sn(r, t, e) {
  return e === "right" ? r -= t : e === "center" && (r -= t / 2), r;
}
function Si(r, t, e) {
  return e === "middle" ? r -= t / 2 : e === "bottom" && (r -= t), r;
}
function Df(r) {
  return Zt("国", r);
}
function Zr(r, t) {
  return typeof r == "string" ? r.lastIndexOf("%") >= 0 ? parseFloat(r) / 100 * t : parseFloat(r) : r;
}
function qp(r, t, e) {
  var i = t.position || "inside", n = t.distance != null ? t.distance : 5, a = e.height, o = e.width, s = a / 2, l = e.x, u = e.y, f = "left", h = "top";
  if (i instanceof Array)
    l += Zr(i[0], e.width), u += Zr(i[1], e.height), f = null, h = null;
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
var Xs = "__zr_normal__", Zs = Zn.concat(["ignore"]), j0 = Gi(Zn, function(r, t) {
  return r[t] = !0, r;
}, { ignore: !1 }), oi = {}, J0 = new rt(0, 0, 0, 0), Ko = (function() {
  function r(t) {
    this.id = Mp(), this.animators = [], this.currentStates = [], this.states = {}, this._init(t);
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
        var f = J0;
        i.layoutRect ? f.copy(i.layoutRect) : f.copy(this.getBoundingRect()), n || f.applyTransform(this.transform), this.calculateTextPosition ? this.calculateTextPosition(oi, i, f) : qp(oi, i, f), a.x = oi.x, a.y = oi.y, o = oi.align, s = oi.verticalAlign;
        var h = i.origin;
        if (h && i.rotation != null) {
          var v = void 0, c = void 0;
          h === "center" ? (v = f.width * 0.5, c = f.height * 0.5) : (v = Zr(h[0], f.width), c = Zr(h[1], f.height)), u = !0, a.originX = -a.x + v + (n ? 0 : f.x), a.originY = -a.y + c + (n ? 0 : f.y);
        }
      }
      i.rotation != null && (a.rotation = i.rotation);
      var d = i.offset;
      d && (a.x += d[0], a.y += d[1], u || (a.originX = -d[0], a.originY = -d[1]));
      var y = i.inside == null ? typeof i.position == "string" && i.position.indexOf("inside") >= 0 : i.inside, g = this._innerTextDefaultStyle || (this._innerTextDefaultStyle = {}), p = void 0, m = void 0, _ = void 0;
      y && this.canBeInsideText() ? (p = i.insideFill, m = i.insideStroke, (p == null || p === "auto") && (p = this.getInsideTextFill()), (m == null || m === "auto") && (m = this.getInsideTextStroke(p), _ = !0)) : (p = i.outsideFill, m = i.outsideStroke, (p == null || p === "auto") && (p = this.getOutsideFill()), (m == null || m === "auto") && (m = this.getOutsideStroke(p), _ = !0)), p = p || "#000", (p !== g.fill || m !== g.stroke || _ !== g.autoStroke || o !== g.align || s !== g.verticalAlign) && (l = !0, g.fill = p, g.stroke = m, g.autoStroke = _, g.align = o, g.verticalAlign = s, e.setDefaultTextStyle(g)), e.__dirty |= Xt, l && e.dirtyStyle(!0);
    }
  }, r.prototype.canBeInsideText = function() {
    return !0;
  }, r.prototype.getInsideTextFill = function() {
    return "#fff";
  }, r.prototype.getInsideTextStroke = function(t) {
    return "#000";
  }, r.prototype.getOutsideFill = function() {
    return this.__zr && this.__zr.isDarkMode() ? _u : mu;
  }, r.prototype.getOutsideStroke = function(t) {
    var e = this.__zr && this.__zr.getBackgroundColor(), i = typeof e == "string" && Oe(e);
    i || (i = [255, 255, 255, 1]);
    for (var n = i[3], a = this.__zr.isDarkMode(), o = 0; o < 3; o++)
      i[o] = i[o] * n + (a ? 0 : 255) * (1 - n);
    return i[3] = 1, qo(i, "rgba");
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
    else if (V(t))
      for (var i = t, n = vt(i), a = 0; a < n.length; a++) {
        var o = n[a];
        this.attrKV(o, t[o]);
      }
    return this.markRedraw(), this;
  }, r.prototype.saveCurrentToNormalState = function(t) {
    this._innerSaveToNormal(t);
    for (var e = this._normalState, i = 0; i < this.animators.length; i++) {
      var n = this.animators[i], a = n.__fromStateTransition;
      if (!(n.getLoop() || a && a !== Xs)) {
        var o = n.targetName, s = o ? e[o] : e;
        n.saveTo(s);
      }
    }
  }, r.prototype._innerSaveToNormal = function(t) {
    var e = this._normalState;
    e || (e = this._normalState = {}), t.textConfig && !e.textConfig && (e.textConfig = this.textConfig), this._savePrimaryToNormal(t, e, Zs);
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
    this.useState(Xs, !1, t);
  }, r.prototype.useState = function(t, e, i, n) {
    var a = t === Xs, o = this.hasState();
    if (!(!o && a)) {
      var s = this.currentStates, l = this.stateTransition;
      if (!(et(s, t) >= 0 && (e || s.length === 1))) {
        var u;
        if (this.stateProxy && !a && (u = this.stateProxy(t)), u || (u = this.states && this.states[t]), !u && !a) {
          gf("State " + t + " not exists.");
          return;
        }
        a || this.saveCurrentToNormalState(u);
        var f = !!(u && u.hoverLayer || n);
        f && this._toggleHoverLayerFlag(!0), this._applyStateObj(t, u, this._normalState, e, !i && !this.__inHover && l && l.duration > 0, l);
        var h = this._textContent, v = this._textGuide;
        return h && h.useState(t, e, i, f), v && v.useState(t, e, i, f), a ? (this.currentStates = [], this._normalState = {}) : e ? this.currentStates.push(t) : this.currentStates = [t], this._updateAnimationTargets(), this.markRedraw(), !f && this.__inHover && (this._toggleHoverLayerFlag(!1), this.__dirty &= ~Xt), u;
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
      var y = this._textContent, g = this._textGuide;
      y && y.useStates(t, e, v), g && g.useStates(t, e, v), this._updateAnimationTargets(), this.currentStates = t.slice(), this.markRedraw(), !v && this.__inHover && (this._toggleHoverLayerFlag(!1), this.__dirty &= ~Xt);
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
    var e = et(this.currentStates, t);
    if (e >= 0) {
      var i = this.currentStates.slice();
      i.splice(e, 1), this.useStates(i);
    }
  }, r.prototype.replaceState = function(t, e, i) {
    var n = this.currentStates.slice(), a = et(n, t), o = et(n, e) >= 0;
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
    for (var l = {}, u = !1, f = 0; f < Zs.length; f++) {
      var h = Zs[f], v = a && j0[h];
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
    e !== t && (e && e !== t && this.removeTextContent(), t.innerTransformable = new Tf(), this._attachComponent(t), this._textContent = t, this.markRedraw());
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
    this.__dirty |= Xt;
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
    var n = t ? this[t] : this, a = new xf(n, e, i);
    return t && (a.targetName = t), this.addAnimator(a, t), a;
  }, r.prototype.addAnimator = function(t, e) {
    var i = this.__zr, n = this;
    t.during(function() {
      n.updateDuringAnimation(e);
    }).done(function() {
      var a = n.animators, o = et(a, t);
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
    qs(this, t, e, i);
  }, r.prototype.animateFrom = function(t, e, i) {
    qs(this, t, e, i, !0);
  }, r.prototype._transitionState = function(t, e, i, n) {
    for (var a = qs(this, e, i, n), o = 0; o < a.length; o++)
      a[o].__fromStateTransition = t;
  }, r.prototype.getBoundingRect = function() {
    return null;
  }, r.prototype.getPaintRect = function() {
    return null;
  }, r.initDefaultProps = (function() {
    var t = r.prototype;
    t.type = "element", t.name = "", t.ignore = t.silent = t.isGroup = t.draggable = t.dragging = t.ignoreClip = t.__inHover = !1, t.__dirty = Xt;
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
ge(Ko, Ae);
ge(Ko, Tf);
function qs(r, t, e, i, n) {
  e = e || {};
  var a = [];
  Kp(r, "", r, t, e, i, a, n);
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
function Ks(r, t, e) {
  for (var i = 0; i < e; i++)
    r[i] = t[i];
}
function t1(r) {
  return $t(r[0]);
}
function e1(r, t, e) {
  if ($t(t[e]))
    if ($t(r[e]) || (r[e] = []), Vt(t[e])) {
      var i = t[e].length;
      r[e].length !== i && (r[e] = new t[e].constructor(i), Ks(r[e], t[e], i));
    } else {
      var n = t[e], a = r[e], o = n.length;
      if (t1(n))
        for (var s = n[0].length, l = 0; l < o; l++)
          a[l] ? Ks(a[l], n[l], s) : a[l] = Array.prototype.slice.call(n[l]);
      else
        Ks(a, n, o);
      a.length = n.length;
    }
  else
    r[e] = t[e];
}
function r1(r, t) {
  return r === t || $t(r) && $t(t) && i1(r, t);
}
function i1(r, t) {
  var e = r.length;
  if (e !== t.length)
    return !1;
  for (var i = 0; i < e; i++)
    if (r[i] !== t[i])
      return !1;
  return !0;
}
function Kp(r, t, e, i, n, a, o, s) {
  for (var l = vt(i), u = n.duration, f = n.delay, h = n.additive, v = n.setToFinal, c = !V(a), d = r.animators, y = [], g = 0; g < l.length; g++) {
    var p = l[g], m = i[p];
    if (m != null && e[p] != null && (c || a[p]))
      if (V(m) && !$t(m) && !Xo(m)) {
        if (t) {
          s || (e[p] = m, r.updateDuringAnimation(t));
          continue;
        }
        Kp(r, p, e[p], m, n, a && a[p], o, s);
      } else
        y.push(p);
    else s || (e[p] = m, r.updateDuringAnimation(t), y.push(p));
  }
  var _ = y.length;
  if (!h && _)
    for (var S = 0; S < d.length; S++) {
      var b = d[S];
      if (b.targetName === t) {
        var w = b.stopTracks(y);
        if (w) {
          var x = et(d, b);
          d.splice(x, 1);
        }
      }
    }
  if (n.force || (y = _t(y, function(M) {
    return !r1(i[M], e[M]);
  }), _ = y.length), _ > 0 || n.force && !o.length) {
    var T = void 0, D = void 0, A = void 0;
    if (s) {
      D = {}, v && (T = {});
      for (var S = 0; S < _; S++) {
        var p = y[S];
        D[p] = e[p], v ? T[p] = i[p] : e[p] = i[p];
      }
    } else if (v) {
      A = {};
      for (var S = 0; S < _; S++) {
        var p = y[S];
        A[p] = oo(e[p]), e1(e, i, p);
      }
    }
    var b = new xf(e, !1, !1, h ? _t(d, function(L) {
      return L.targetName === t;
    }) : null);
    b.targetName = t, n.scope && (b.scope = n.scope), v && T && b.whenWithKeys(0, T, y), A && b.whenWithKeys(0, A, y), b.whenWithKeys(u ?? 500, s ? D : i, y).delay(f || 0), r.addAnimator(b, t), o.push(b);
  }
}
var bt = (function(r) {
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
    var n = et(this._children, e);
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
    var i = this.__zr, n = this._children, a = et(n, e);
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
    for (var i = new rt(0, 0, 0, 0), n = e || this._children, a = [], o = null, s = 0; s < n.length; s++) {
      var l = n[s];
      if (!(l.ignore || l.invisible)) {
        var u = l.getBoundingRect(), f = l.getLocalTransform(a);
        f ? (rt.applyTransform(i, u, f), o = o || i.clone(), o.union(i)) : (o = o || u.clone(), o.union(u));
      }
    }
    return o || i;
  }, t;
})(Ko);
bt.prototype.type = "group";
/*!
* ZRender, a high performance 2d drawing library.
*
* Copyright (c) 2013, Baidu Inc.
* All rights reserved.
*
* LICENSE
* https://github.com/ecomfe/zrender/blob/master/LICENSE.txt
*/
var fo = {}, Qp = {};
function n1(r) {
  delete Qp[r];
}
function a1(r) {
  if (!r)
    return !1;
  if (typeof r == "string")
    return Co(r, 1) < yu;
  if (r.colorStops) {
    for (var t = r.colorStops, e = 0, i = t.length, n = 0; n < i; n++)
      e += Co(t[n].color, 1);
    return e /= i, e < yu;
  }
  return !1;
}
var o1 = (function() {
  function r(t, e, i) {
    var n = this;
    this._sleepAfterStill = 10, this._stillFrameAccum = 0, this._needsRefresh = !0, this._needsRefreshHover = !0, this._darkMode = !1, i = i || {}, this.dom = e, this.id = t;
    var a = new C0(), o = i.renderer || "canvas";
    fo[o] || (o = vt(fo)[0]), i.useDirtyRect = i.useDirtyRect == null ? !1 : i.useDirtyRect;
    var s = new fo[o](e, a, i, t), l = i.ssr || s.ssrOnly;
    this.storage = a, this.painter = s;
    var u = !U.node && !U.worker && !l ? new q0(s.getViewportRoot(), s.root) : null, f = i.useCoarsePointer, h = f == null || f === "auto" ? U.touchEventsSupported : !!f, v = 44, c;
    h && (c = X(i.pointerSize, v)), this.handler = new Np(a, s, u, s.root, c), this.animation = new V0({
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
    this._disposed || (this.painter.setBackgroundColor && this.painter.setBackgroundColor(t), this.refresh(), this._backgroundColor = t, this._darkMode = a1(t));
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
    var e, i = xi();
    this._needsRefresh && (e = !0, this.refreshImmediately(t)), this._needsRefreshHover && (e = !0, this.refreshHoverImmediately());
    var n = xi();
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
        t[e] instanceof bt && t[e].removeSelfFromZr(this);
      this.storage.delAllRoots(), this.painter.clear();
    }
  }, r.prototype.dispose = function() {
    this._disposed || (this.animation.stop(), this.clear(), this.storage.dispose(), this.painter.dispose(), this.handler.dispose(), this.animation = this.storage = this.painter = this.handler = null, this._disposed = !0, n1(this.id));
  }, r;
})();
function fc(r, t) {
  var e = new o1(Mp(), r, t);
  return Qp[e.id] = e, e;
}
function s1(r, t) {
  fo[r] = t;
}
var hc = 1e-4, jp = 20;
function l1(r) {
  return r.replace(/^\s+|\s+$/g, "");
}
function cc(r, t, e, i) {
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
function St(r, t) {
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
  return z(r) ? l1(r).match(/%$/) ? parseFloat(r) / 100 * t : parseFloat(r) : r == null ? NaN : +r;
}
function mt(r, t, e) {
  return t == null && (t = 10), t = Math.min(Math.max(0, t), jp), r = (+r).toFixed(t), e ? r : +r;
}
function Te(r) {
  if (r = +r, isNaN(r))
    return 0;
  if (r > 1e-14) {
    for (var t = 1, e = 0; e < 15; e++, t *= 10)
      if (Math.round(r * t) / t === r)
        return e;
  }
  return u1(r);
}
function u1(r) {
  var t = r.toString().toLowerCase(), e = t.indexOf("e"), i = e > 0 ? +t.slice(e + 1) : 0, n = e > 0 ? e : t.length, a = t.indexOf("."), o = a < 0 ? 0 : n - 1 - a;
  return Math.max(0, o - i);
}
function f1(r, t) {
  var e = Math.log, i = Math.LN10, n = Math.floor(e(r[1] - r[0]) / i), a = Math.round(e(Math.abs(t[1] - t[0])) / i), o = Math.min(Math.max(-n + a, 0), 20);
  return isFinite(o) ? o : 20;
}
function h1(r, t) {
  var e = Math.max(Te(r), Te(t)), i = r + t;
  return e > jp ? i : mt(i, e);
}
function Jp(r) {
  var t = Math.PI * 2;
  return (r % t + t) % t;
}
function Mo(r) {
  return r > -hc && r < hc;
}
var c1 = /^(?:(\d{4})(?:[-\/](\d{1,2})(?:[-\/](\d{1,2})(?:[T ](\d{1,2})(?::(\d{1,2})(?::(\d{1,2})(?:[.,](\d+))?)?)?(Z|[\+\-]\d\d:?\d\d)?)?)?)?)?$/;
function Fe(r) {
  if (r instanceof Date)
    return r;
  if (z(r)) {
    var t = c1.exec(r);
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
function v1(r) {
  return Math.pow(10, Mf(r));
}
function Mf(r) {
  if (r === 0)
    return 0;
  var t = Math.floor(Math.log(r) / Math.LN10);
  return r / Math.pow(10, t) >= 10 && t++, t;
}
function tg(r, t) {
  var e = Mf(r), i = Math.pow(10, e), n = r / i, a;
  return n < 1.5 ? a = 1 : n < 2.5 ? a = 2 : n < 4 ? a = 3 : n < 7 ? a = 5 : a = 10, r = a * i, e >= -20 ? +r.toFixed(e < 0 ? -e : 0) : r;
}
function Ao(r) {
  var t = parseFloat(r);
  return t == r && (t !== 0 || !z(r) || r.indexOf("x") <= 0) ? t : NaN;
}
function d1(r) {
  return !isNaN(Ao(r));
}
function eg() {
  return Math.round(Math.random() * 9);
}
function rg(r, t) {
  return t === 0 ? r : rg(t, r % t);
}
function vc(r, t) {
  return r == null ? t : t == null ? r : r * t / rg(r, t);
}
function Ft(r) {
  throw new Error(r);
}
function dc(r, t, e) {
  return (t - r) * e + r;
}
var ig = "series\0", p1 = "\0_ec_\0";
function Rt(r) {
  return r instanceof Array ? r : r == null ? [] : [r];
}
function Su(r, t, e) {
  if (r) {
    r[t] = r[t] || {}, r.emphasis = r.emphasis || {}, r.emphasis[t] = r.emphasis[t] || {};
    for (var i = 0, n = e.length; i < n; i++) {
      var a = e[i];
      !r.emphasis[t].hasOwnProperty(a) && r[t].hasOwnProperty(a) && (r.emphasis[t][a] = r[t][a]);
    }
  }
}
var pc = ["fontStyle", "fontWeight", "fontSize", "fontFamily", "rich", "tag", "color", "textBorderColor", "textBorderWidth", "width", "height", "lineHeight", "align", "verticalAlign", "baseline", "shadowColor", "shadowBlur", "shadowOffsetX", "shadowOffsetY", "textShadowColor", "textShadowBlur", "textShadowOffsetX", "textShadowOffsetY", "backgroundColor", "borderColor", "borderWidth", "borderRadius", "padding"];
function fa(r) {
  return V(r) && !N(r) && !(r instanceof Date) ? r.value : r;
}
function g1(r) {
  return V(r) && !(r instanceof Array);
}
function y1(r, t, e) {
  var i = e === "normalMerge", n = e === "replaceMerge", a = e === "replaceAll";
  r = r || [], t = (t || []).slice();
  var o = Z();
  C(t, function(l, u) {
    if (!V(l)) {
      t[u] = null;
      return;
    }
  });
  var s = m1(r, o, e);
  return (i || n) && _1(s, r, o, t), i && S1(s, t), i || n ? w1(s, t, n) : a && b1(s, t), x1(s), s;
}
function m1(r, t, e) {
  var i = [];
  if (e === "replaceAll")
    return i;
  for (var n = 0; n < r.length; n++) {
    var a = r[n];
    a && a.id != null && t.set(a.id, n), i.push({
      existing: e === "replaceMerge" || qn(a) ? null : a,
      newOption: null,
      keyInfo: null,
      brandNew: null
    });
  }
  return i;
}
function _1(r, t, e, i) {
  C(i, function(n, a) {
    if (!(!n || n.id == null)) {
      var o = In(n.id), s = e.get(o);
      if (s != null) {
        var l = r[s];
        Be(!l.newOption, 'Duplicated option on id "' + o + '".'), l.newOption = n, l.existing = t[s], i[a] = null;
      }
    }
  });
}
function S1(r, t) {
  C(t, function(e, i) {
    if (!(!e || e.name == null))
      for (var n = 0; n < r.length; n++) {
        var a = r[n].existing;
        if (!r[n].newOption && a && (a.id == null || e.id == null) && !qn(e) && !qn(a) && ng("name", a, e)) {
          r[n].newOption = e, t[i] = null;
          return;
        }
      }
  });
}
function w1(r, t, e) {
  C(t, function(i) {
    if (i) {
      for (
        var n, a = 0;
        // Be `!resultItem` only when `nextIdx >= result.length`.
        (n = r[a]) && (n.newOption || qn(n.existing) || // In mode "replaceMerge", here no not-mapped-non-internal-existing.
        n.existing && i.id != null && !ng("id", i, n.existing));
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
function b1(r, t) {
  C(t, function(e) {
    r.push({
      newOption: e,
      brandNew: !0,
      existing: null,
      keyInfo: null
    });
  });
}
function x1(r) {
  var t = Z();
  C(r, function(e) {
    var i = e.existing;
    i && t.set(i.id, e);
  }), C(r, function(e) {
    var i = e.newOption;
    Be(!i || i.id == null || !t.get(i.id) || t.get(i.id) === e, "id duplicates: " + (i && i.id)), i && i.id != null && t.set(i.id, e), !e.keyInfo && (e.keyInfo = {});
  }), C(r, function(e, i) {
    var n = e.existing, a = e.newOption, o = e.keyInfo;
    if (V(a)) {
      if (o.name = a.name != null ? In(a.name) : n ? n.name : ig + i, n)
        o.id = In(n.id);
      else if (a.id != null)
        o.id = In(a.id);
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
function ng(r, t, e) {
  var i = De(t[r], null), n = De(e[r], null);
  return i != null && n != null && i === n;
}
function In(r) {
  return De(r, "");
}
function De(r, t) {
  return r == null ? t : z(r) ? r : ut(r) || iu(r) ? r + "" : t;
}
function Af(r) {
  var t = r.name;
  return !!(t && t.indexOf(ig));
}
function qn(r) {
  return r && r.id != null && In(r.id).indexOf(p1) === 0;
}
function T1(r, t, e) {
  C(r, function(i) {
    var n = i.newOption;
    V(n) && (i.keyInfo.mainType = t, i.keyInfo.subType = C1(t, n, i.existing, e));
  });
}
function C1(r, t, e, i) {
  var n = t.type ? t.type : e ? e.subType : i.determineSubType(r, t);
  return n;
}
function qr(r, t) {
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
function gt() {
  var r = "__ec_inner_" + D1++;
  return function(t) {
    return t[r] || (t[r] = {});
  };
}
var D1 = eg();
function Qs(r, t, e) {
  var i = Lf(t, e), n = i.mainTypeSpecified, a = i.queryOptionMap, o = i.others, s = o, l = e ? e.defaultMainType : null;
  return !n && l && a.set(l, {}), a.each(function(u, f) {
    var h = ha(r, f, u, {
      useDefault: l === f,
      enableAll: e && e.enableAll != null ? e.enableAll : !0,
      enableNone: e && e.enableNone != null ? e.enableNone : !0
    });
    s[f + "Models"] = h.models, s[f + "Model"] = h.models[0];
  }), s;
}
function Lf(r, t) {
  var e;
  if (z(r)) {
    var i = {};
    i[r + "Index"] = 0, e = i;
  } else
    e = r;
  var n = Z(), a = {}, o = !1;
  return C(e, function(s, l) {
    if (l === "dataIndex" || l === "dataIndexInside") {
      a[l] = s;
      return;
    }
    var u = l.match(/^(\w+)(Index|Id|Name)$/) || [], f = u[1], h = (u[2] || "").toLowerCase();
    if (!(!f || !h || t && t.includeMainTypes && et(t.includeMainTypes, f) < 0)) {
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
var de = {
  useDefault: !0,
  enableAll: !1,
  enableNone: !1
};
function ha(r, t, e, i) {
  i = i || de;
  var n = e.index, a = e.id, o = e.name, s = {
    models: null,
    specified: n != null || a != null || o != null
  };
  if (!s.specified) {
    var l = void 0;
    return s.models = i.useDefault && (l = r.getComponent(t)) ? [l] : [], s;
  }
  return n === "none" || n === !1 ? (Be(i.enableNone, '`"none"` or `false` is not a valid value on index option.'), s.models = [], s) : (n === "all" && (Be(i.enableAll, '`"all"` is not a valid value on index option.'), n = a = o = null), s.models = r.queryComponents({
    mainType: t,
    index: n,
    id: a,
    name: o
  }), s);
}
function ag(r, t, e) {
  r.setAttribute ? r.setAttribute(t, e) : r[t] = e;
}
function M1(r, t) {
  return r.getAttribute ? r.getAttribute(t) : r[t];
}
function A1(r) {
  return r === "auto" ? U.domSupported ? "html" : "richText" : r || "html";
}
function L1(r, t, e, i, n) {
  var a = t == null || t === "auto";
  if (i == null)
    return i;
  if (ut(i)) {
    var o = dc(e || 0, i, n);
    return mt(o, a ? Math.max(Te(e || 0), Te(i)) : t);
  } else {
    if (z(i))
      return n < 1 ? e : i;
    for (var s = [], l = e, u = i, f = Math.max(l ? l.length : 0, u.length), h = 0; h < f; ++h) {
      var v = r.getDimensionInfo(h);
      if (v && v.type === "ordinal")
        s[h] = (n < 1 && l ? l : u)[h];
      else {
        var c = l && l[h] ? l[h] : 0, d = u[h], o = dc(c, d, n);
        s[h] = mt(o, a ? Math.max(Te(c), Te(d)) : t);
      }
    }
    return s;
  }
}
var P1 = ".", Sr = "___EC__COMPONENT__CONTAINER___", og = "___EC__EXTENDED_CLASS___";
function Ce(r) {
  var t = {
    main: "",
    sub: ""
  };
  if (r) {
    var e = r.split(P1);
    t.main = e[0] || "", t.sub = e[1] || "";
  }
  return t;
}
function I1(r) {
  Be(/^[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)?$/.test(r), 'componentType "' + r + '" illegal');
}
function E1(r) {
  return !!(r && r[og]);
}
function Pf(r, t) {
  r.$constructor = r, r.extend = function(e) {
    var i = this, n;
    return R1(i) ? n = /** @class */
    (function(a) {
      O(o, a);
      function o() {
        return a.apply(this, arguments) || this;
      }
      return o;
    })(i) : (n = function() {
      (e.$constructor || i).apply(this, arguments);
    }, V_(n, this)), k(n.prototype, e), n[og] = !0, n.extend = this.extend, n.superCall = N1, n.superApply = B1, n.superClass = i, n;
  };
}
function R1(r) {
  return $(r) && /^class\s/.test(Function.prototype.toString.call(r));
}
function sg(r, t) {
  r.extend = t.extend;
}
var k1 = Math.round(Math.random() * 10);
function O1(r) {
  var t = ["__\0is_clz", k1++].join("_");
  r.prototype[t] = !0, r.isInstance = function(e) {
    return !!(e && e[t]);
  };
}
function N1(r, t) {
  for (var e = [], i = 2; i < arguments.length; i++)
    e[i - 2] = arguments[i];
  return this.superClass.prototype[t].apply(r, e);
}
function B1(r, t, e) {
  return this.superClass.prototype[t].apply(r, e);
}
function Qo(r) {
  var t = {};
  r.registerClass = function(i) {
    var n = i.type || i.prototype.type;
    if (n) {
      I1(n), i.prototype.type = n;
      var a = Ce(n);
      if (!a.sub)
        t[a.main] = i;
      else if (a.sub !== Sr) {
        var o = e(a);
        o[a.sub] = i;
      }
    }
    return i;
  }, r.getClass = function(i, n, a) {
    var o = t[i];
    if (o && o[Sr] && (o = n ? o[n] : null), a && !o)
      throw new Error(n ? "Component " + i + "." + (n || "") + " is used but not imported." : i + ".type should be specified.");
    return o;
  }, r.getClassesByMainType = function(i) {
    var n = Ce(i), a = [], o = t[n.main];
    return o && o[Sr] ? C(o, function(s, l) {
      l !== Sr && a.push(s);
    }) : a.push(o), a;
  }, r.hasClass = function(i) {
    var n = Ce(i);
    return !!t[n.main];
  }, r.getAllClassMainTypes = function() {
    var i = [];
    return C(t, function(n, a) {
      i.push(a);
    }), i;
  }, r.hasSubTypes = function(i) {
    var n = Ce(i), a = t[n.main];
    return a && a[Sr];
  };
  function e(i) {
    var n = t[i.main];
    return (!n || !n[Sr]) && (n = t[i.main] = {}, n[Sr] = !0), n;
  }
}
function Kn(r, t) {
  for (var e = 0; e < r.length; e++)
    r[e][1] || (r[e][1] = r[e][0]);
  return t = t || !1, function(i, n, a) {
    for (var o = {}, s = 0; s < r.length; s++) {
      var l = r[s][1];
      if (!(n && et(n, l) >= 0 || a && et(a, l) < 0)) {
        var u = i.getShallow(l, t);
        u != null && (o[r[s][0]] = u);
      }
    }
    return o;
  };
}
var F1 = [
  ["fill", "color"],
  ["shadowBlur"],
  ["shadowOffsetX"],
  ["shadowOffsetY"],
  ["opacity"],
  ["shadowColor"]
  // Option decal is in `DecalObject` but style.decal is in `PatternObject`.
  // So do not transfer decal directly.
], z1 = Kn(F1), H1 = (
  /** @class */
  (function() {
    function r() {
    }
    return r.prototype.getAreaStyle = function(t, e) {
      return z1(this, t, e);
    }, r;
  })()
), wu = new ua(50);
function $1(r) {
  if (typeof r == "string") {
    var t = wu.get(r);
    return t && t.image;
  } else
    return r;
}
function lg(r, t, e, i, n) {
  if (r)
    if (typeof r == "string") {
      if (t && t.__zrImageSrc === r || !e)
        return t;
      var a = wu.get(r), o = { hostEl: e, cb: i, cbPayload: n };
      return a ? (t = a.image, !jo(t) && a.pending.push(o)) : (t = Vi.loadImage(r, gc, gc), t.__zrImageSrc = r, wu.put(r, t.__cachedImgObj = {
        image: t,
        pending: [o]
      })), t;
    } else
      return r;
  else return t;
}
function gc() {
  var r = this.__cachedImgObj;
  this.onload = this.onerror = this.__cachedImgObj = null;
  for (var t = 0; t < r.pending.length; t++) {
    var e = r.pending[t], i = e.cb;
    i && i(this, e.cbPayload), e.hostEl.dirty();
  }
  r.pending.length = 0;
}
function jo(r) {
  return r && r.width && r.height;
}
var js = /\{([a-zA-Z0-9_]+)\|([^}]*)\}/g;
function V1(r, t, e, i, n, a) {
  if (!e) {
    r.text = "", r.isTruncated = !1;
    return;
  }
  var o = (t + "").split(`
`);
  a = ug(e, i, n, a);
  for (var s = !1, l = {}, u = 0, f = o.length; u < f; u++)
    fg(l, o[u], a), o[u] = l.textLine, s = s || l.isTruncated;
  r.text = o.join(`
`), r.isTruncated = s;
}
function ug(r, t, e, i) {
  i = i || {};
  var n = k({}, i);
  n.font = t, e = X(e, "..."), n.maxIterations = X(i.maxIterations, 2);
  var a = n.minChar = X(i.minChar, 0);
  n.cnCharWidth = Zt("国", t);
  var o = n.ascCharWidth = Zt("a", t);
  n.placeholder = X(i.placeholder, "");
  for (var s = r = Math.max(0, r - 1), l = 0; l < a && s >= o; l++)
    s -= o;
  var u = Zt(e, t);
  return u > s && (e = "", u = 0), s = r - u, n.ellipsis = e, n.ellipsisWidth = u, n.contentWidth = s, n.containerWidth = r, n;
}
function fg(r, t, e) {
  var i = e.containerWidth, n = e.font, a = e.contentWidth;
  if (!i) {
    r.textLine = "", r.isTruncated = !1;
    return;
  }
  var o = Zt(t, n);
  if (o <= i) {
    r.textLine = t, r.isTruncated = !1;
    return;
  }
  for (var s = 0; ; s++) {
    if (o <= a || s >= e.maxIterations) {
      t += e.ellipsis;
      break;
    }
    var l = s === 0 ? G1(t, a, e.ascCharWidth, e.cnCharWidth) : o > 0 ? Math.floor(t.length * a / o) : 0;
    t = t.substr(0, l), o = Zt(t, n);
  }
  t === "" && (t = e.placeholder), r.textLine = t, r.isTruncated = !0;
}
function G1(r, t, e, i) {
  for (var n = 0, a = 0, o = r.length; a < o && n < t; a++) {
    var s = r.charCodeAt(a);
    n += 0 <= s && s <= 127 ? e : i;
  }
  return a;
}
function W1(r, t) {
  r != null && (r += "");
  var e = t.overflow, i = t.padding, n = t.font, a = e === "truncate", o = Df(n), s = X(t.lineHeight, o), l = !!t.backgroundColor, u = t.lineOverflow === "truncate", f = !1, h = t.width, v;
  h != null && (e === "break" || e === "breakAll") ? v = r ? hg(r, t.font, h, e === "breakAll", 0).lines : [] : v = r ? r.split(`
`) : [];
  var c = v.length * s, d = X(t.height, c);
  if (c > d && u) {
    var y = Math.floor(d / s);
    f = f || v.length > y, v = v.slice(0, y);
  }
  if (r && a && h != null)
    for (var g = ug(h, n, t.ellipsis, {
      minChar: t.truncateMinChar,
      placeholder: t.placeholder
    }), p = {}, m = 0; m < v.length; m++)
      fg(p, v[m], g), v[m] = p.textLine, f = f || p.isTruncated;
  for (var _ = d, S = 0, m = 0; m < v.length; m++)
    S = Math.max(Zt(v[m], n), S);
  h == null && (h = S);
  var b = S;
  return i && (_ += i[0] + i[2], b += i[1] + i[3], h += i[1] + i[3]), l && (b = h), {
    lines: v,
    height: d,
    outerWidth: b,
    outerHeight: _,
    lineHeight: s,
    calculatedLineHeight: o,
    contentWidth: S,
    contentHeight: c,
    width: h,
    isTruncated: f
  };
}
var U1 = /* @__PURE__ */ (function() {
  function r() {
  }
  return r;
})(), yc = /* @__PURE__ */ (function() {
  function r(t) {
    this.tokens = [], t && (this.tokens = t);
  }
  return r;
})(), Y1 = /* @__PURE__ */ (function() {
  function r() {
    this.width = 0, this.height = 0, this.contentWidth = 0, this.contentHeight = 0, this.outerWidth = 0, this.outerHeight = 0, this.lines = [], this.isTruncated = !1;
  }
  return r;
})();
function X1(r, t) {
  var e = new Y1();
  if (r != null && (r += ""), !r)
    return e;
  for (var i = t.width, n = t.height, a = t.overflow, o = (a === "break" || a === "breakAll") && i != null ? { width: i, accumWidth: 0, breakAll: a === "breakAll" } : null, s = js.lastIndex = 0, l; (l = js.exec(r)) != null; ) {
    var u = l.index;
    u > s && Js(e, r.substring(s, u), t, o), Js(e, l[2], t, o, l[1]), s = js.lastIndex;
  }
  s < r.length && Js(e, r.substring(s, r.length), t, o);
  var f = [], h = 0, v = 0, c = t.padding, d = a === "truncate", y = t.lineOverflow === "truncate", g = {};
  function p(G, it, j) {
    G.width = it, G.lineHeight = j, h += j, v = Math.max(v, it);
  }
  t: for (var m = 0; m < e.lines.length; m++) {
    for (var _ = e.lines[m], S = 0, b = 0, w = 0; w < _.tokens.length; w++) {
      var x = _.tokens[w], T = x.styleName && t.rich[x.styleName] || {}, D = x.textPadding = T.padding, A = D ? D[1] + D[3] : 0, M = x.font = T.font || t.font;
      x.contentHeight = Df(M);
      var L = X(T.height, x.contentHeight);
      if (x.innerHeight = L, D && (L += D[0] + D[2]), x.height = L, x.lineHeight = no(T.lineHeight, t.lineHeight, L), x.align = T && T.align || t.align, x.verticalAlign = T && T.verticalAlign || "middle", y && n != null && h + x.lineHeight > n) {
        var P = e.lines.length;
        w > 0 ? (_.tokens = _.tokens.slice(0, w), p(_, b, S), e.lines = e.lines.slice(0, m + 1)) : e.lines = e.lines.slice(0, m), e.isTruncated = e.isTruncated || e.lines.length < P;
        break t;
      }
      var I = T.width, E = I == null || I === "auto";
      if (typeof I == "string" && I.charAt(I.length - 1) === "%")
        x.percentWidth = I, f.push(x), x.contentWidth = Zt(x.text, M);
      else {
        if (E) {
          var R = T.backgroundColor, W = R && R.image;
          W && (W = $1(W), jo(W) && (x.width = Math.max(x.width, W.width * L / W.height)));
        }
        var B = d && i != null ? i - b : null;
        B != null && B < x.width ? !E || B < A ? (x.text = "", x.width = x.contentWidth = 0) : (V1(g, x.text, B - A, M, t.ellipsis, { minChar: t.truncateMinChar }), x.text = g.text, e.isTruncated = e.isTruncated || g.isTruncated, x.width = x.contentWidth = Zt(x.text, M)) : x.contentWidth = Zt(x.text, M);
      }
      x.width += A, b += x.width, T && (S = Math.max(S, x.lineHeight));
    }
    p(_, b, S);
  }
  e.outerWidth = e.width = X(i, v), e.outerHeight = e.height = X(n, h), e.contentHeight = h, e.contentWidth = v, c && (e.outerWidth += c[1] + c[3], e.outerHeight += c[0] + c[2]);
  for (var m = 0; m < f.length; m++) {
    var x = f[m], F = x.percentWidth;
    x.width = parseInt(F, 10) / 100 * e.width;
  }
  return e;
}
function Js(r, t, e, i, n) {
  var a = t === "", o = n && e.rich[n] || {}, s = r.lines, l = o.font || e.font, u = !1, f, h;
  if (i) {
    var v = o.padding, c = v ? v[1] + v[3] : 0;
    if (o.width != null && o.width !== "auto") {
      var d = Zr(o.width, i.width) + c;
      s.length > 0 && d + i.accumWidth > i.width && (f = t.split(`
`), u = !0), i.accumWidth = d;
    } else {
      var y = hg(t, l, i.width, i.breakAll, i.accumWidth);
      i.accumWidth = y.accumWidth + c, h = y.linesWidths, f = y.lines;
    }
  } else
    f = t.split(`
`);
  for (var g = 0; g < f.length; g++) {
    var p = f[g], m = new U1();
    if (m.styleName = n, m.text = p, m.isLineHolder = !p && !a, typeof o.width == "number" ? m.width = o.width : m.width = h ? h[g] : Zt(p, l), !g && !u) {
      var _ = (s[s.length - 1] || (s[0] = new yc())).tokens, S = _.length;
      S === 1 && _[0].isLineHolder ? _[0] = m : (p || !S || a) && _.push(m);
    } else
      s.push(new yc([m]));
  }
}
function Z1(r) {
  var t = r.charCodeAt(0);
  return t >= 32 && t <= 591 || t >= 880 && t <= 4351 || t >= 4608 && t <= 5119 || t >= 7680 && t <= 8303;
}
var q1 = Gi(",&?/;] ".split(""), function(r, t) {
  return r[t] = !0, r;
}, {});
function K1(r) {
  return Z1(r) ? !!q1[r] : !0;
}
function hg(r, t, e, i, n) {
  for (var a = [], o = [], s = "", l = "", u = 0, f = 0, h = 0; h < r.length; h++) {
    var v = r.charAt(h);
    if (v === `
`) {
      l && (s += l, f += u), a.push(s), o.push(f), s = "", l = "", u = 0, f = 0;
      continue;
    }
    var c = Zt(v, t), d = i ? !1 : !K1(v);
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
var bu = "__zr_style_" + Math.round(Math.random() * 10), Vr = {
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  shadowColor: "#000",
  opacity: 1,
  blend: "source-over"
}, Jo = {
  style: {
    shadowBlur: !0,
    shadowOffsetX: !0,
    shadowOffsetY: !0,
    shadowColor: !0,
    opacity: !0
  }
};
Vr[bu] = !0;
var mc = ["z", "z2", "invisible"], Q1 = ["invisible"], ca = (function(r) {
  O(t, r);
  function t(e) {
    return r.call(this, e) || this;
  }
  return t.prototype._init = function(e) {
    for (var i = vt(e), n = 0; n < i.length; n++) {
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
    if (this.ignore || this.invisible || this.style.opacity === 0 || this.culling && j1(this, e, i) || o && !o[0] && !o[3])
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
      e = this._paintRect || (this._paintRect = new rt(0, 0, 0, 0)), i ? rt.applyTransform(e, n, i) : e.copy(n), (o || s || l) && (e.width += o * 2 + Math.abs(s), e.height += o * 2 + Math.abs(l), e.x = Math.min(e.x, e.x + s - o), e.y = Math.min(e.y, e.y + l - o));
      var u = this.dirtyRectTolerance;
      e.isZero() || (e.x = Math.floor(e.x - u), e.y = Math.floor(e.y - u), e.width = Math.ceil(e.width + 1 + u * 2), e.height = Math.ceil(e.height + 1 + u * 2));
    }
    return e;
  }, t.prototype.setPrevPaintRect = function(e) {
    e ? (this._prevPaintRect = this._prevPaintRect || new rt(0, 0, 0, 0), this._prevPaintRect.copy(e)) : this._prevPaintRect = null;
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
    e || this.markRedraw(), this.__dirty |= mn, this._rect && (this._rect = null);
  }, t.prototype.dirty = function() {
    this.dirtyStyle();
  }, t.prototype.styleChanged = function() {
    return !!(this.__dirty & mn);
  }, t.prototype.styleUpdated = function() {
    this.__dirty &= ~mn;
  }, t.prototype.createStyle = function(e) {
    return Zo(Vr, e);
  }, t.prototype.useStyle = function(e) {
    e[bu] || (e = this.createStyle(e)), this.__inHover ? this.__hoverStyle = e : this.style = e, this.dirtyStyle();
  }, t.prototype.isStyleObject = function(e) {
    return e[bu];
  }, t.prototype._innerSaveToNormal = function(e) {
    r.prototype._innerSaveToNormal.call(this, e);
    var i = this._normalState;
    e.style && !i.style && (i.style = this._mergeStyle(this.createStyle(), this.style)), this._savePrimaryToNormal(e, i, mc);
  }, t.prototype._applyStateObj = function(e, i, n, a, o, s) {
    r.prototype._applyStateObj.call(this, e, i, n, a, o, s);
    var l = !(i && a), u;
    if (i && i.style ? o ? a ? u = i.style : (u = this._mergeStyle(this.createStyle(), n.style), this._mergeStyle(u, i.style)) : (u = this._mergeStyle(this.createStyle(), a ? this.style : n.style), this._mergeStyle(u, i.style)) : l && (u = n.style), u)
      if (o) {
        var f = this.style;
        if (this.style = this.createStyle(l ? {} : f), l)
          for (var h = vt(f), v = 0; v < h.length; v++) {
            var c = h[v];
            c in u && (u[c] = u[c], this.style[c] = f[c]);
          }
        for (var d = vt(u), v = 0; v < d.length; v++) {
          var c = d[v];
          this.style[c] = this.style[c];
        }
        this._transitionState(e, {
          style: u
        }, s, this.getAnimationStyleProps());
      } else
        this.useStyle(u);
    for (var y = this.__inHover ? Q1 : mc, v = 0; v < y.length; v++) {
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
    return Jo;
  }, t.initDefaultProps = (function() {
    var e = t.prototype;
    e.type = "displayable", e.invisible = !1, e.z = 0, e.z2 = 0, e.zlevel = 0, e.culling = !1, e.cursor = "pointer", e.rectHover = !1, e.incremental = !1, e._rect = null, e.dirtyRectTolerance = 0, e.__dirty = Xt | mn;
  })(), t;
})(Ko), tl = new rt(0, 0, 0, 0), el = new rt(0, 0, 0, 0);
function j1(r, t, e) {
  return tl.copy(r.getBoundingRect()), r.transform && tl.applyTransform(r.transform), el.width = t, el.height = e, !tl.intersect(el);
}
var re = Math.min, ie = Math.max, rl = Math.sin, il = Math.cos, wr = Math.PI * 2, Ta = Wi(), Ca = Wi(), Da = Wi();
function _c(r, t, e, i, n, a) {
  n[0] = re(r, e), n[1] = re(t, i), a[0] = ie(r, e), a[1] = ie(t, i);
}
var Sc = [], wc = [];
function J1(r, t, e, i, n, a, o, s, l, u) {
  var f = $p, h = Ct, v = f(r, e, n, o, Sc);
  l[0] = 1 / 0, l[1] = 1 / 0, u[0] = -1 / 0, u[1] = -1 / 0;
  for (var c = 0; c < v; c++) {
    var d = h(r, e, n, o, Sc[c]);
    l[0] = re(d, l[0]), u[0] = ie(d, u[0]);
  }
  v = f(t, i, a, s, wc);
  for (var c = 0; c < v; c++) {
    var y = h(t, i, a, s, wc[c]);
    l[1] = re(y, l[1]), u[1] = ie(y, u[1]);
  }
  l[0] = re(r, l[0]), u[0] = ie(r, u[0]), l[0] = re(o, l[0]), u[0] = ie(o, u[0]), l[1] = re(t, l[1]), u[1] = ie(t, u[1]), l[1] = re(s, l[1]), u[1] = ie(s, u[1]);
}
function tS(r, t, e, i, n, a, o, s) {
  var l = Vp, u = Bt, f = ie(re(l(r, e, n), 1), 0), h = ie(re(l(t, i, a), 1), 0), v = u(r, e, n, f), c = u(t, i, a, h);
  o[0] = re(r, n, v), o[1] = re(t, a, c), s[0] = ie(r, n, v), s[1] = ie(t, a, c);
}
function eS(r, t, e, i, n, a, o, s, l) {
  var u = wi, f = bi, h = Math.abs(n - a);
  if (h % wr < 1e-4 && h > 1e-4) {
    s[0] = r - e, s[1] = t - i, l[0] = r + e, l[1] = t + i;
    return;
  }
  if (Ta[0] = il(n) * e + r, Ta[1] = rl(n) * i + t, Ca[0] = il(a) * e + r, Ca[1] = rl(a) * i + t, u(s, Ta, Ca), f(l, Ta, Ca), n = n % wr, n < 0 && (n = n + wr), a = a % wr, a < 0 && (a = a + wr), n > a && !o ? a += wr : n < a && o && (n += wr), o) {
    var v = a;
    a = n, n = v;
  }
  for (var c = 0; c < a; c += Math.PI / 2)
    c > n && (Da[0] = il(c) * e + r, Da[1] = rl(c) * i + t, u(s, Da, s), f(l, Da, l));
}
var J = {
  M: 1,
  L: 2,
  C: 3,
  Q: 4,
  A: 5,
  Z: 6,
  R: 7
}, br = [], xr = [], me = [], Ge = [], _e = [], Se = [], nl = Math.min, al = Math.max, Tr = Math.cos, Cr = Math.sin, Ie = Math.abs, xu = Math.PI, je = xu * 2, ol = typeof Float32Array < "u", rn = [];
function sl(r) {
  var t = Math.round(r / xu * 1e8) / 1e8;
  return t % 2 * xu;
}
function rS(r, t) {
  var e = sl(r[0]);
  e < 0 && (e += je);
  var i = e - r[0], n = r[1];
  n += i, !t && n - e >= je ? n = e + je : t && e - n >= je ? n = e - je : !t && e > n ? n = e + (je - sl(e - n)) : t && e < n && (n = e - (je - sl(n - e))), r[0] = e, r[1] = n;
}
var Kr = (function() {
  function r(t) {
    this.dpr = 1, this._xi = 0, this._yi = 0, this._x0 = 0, this._y0 = 0, this._len = 0, t && (this._saveData = !1), this._saveData && (this.data = []);
  }
  return r.prototype.increaseVersion = function() {
    this._version++;
  }, r.prototype.getVersion = function() {
    return this._version;
  }, r.prototype.setScale = function(t, e, i) {
    i = i || 0, i > 0 && (this._ux = Ie(i / Do / t) || 0, this._uy = Ie(i / Do / e) || 0);
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
    return this._drawPendingPt(), this.addData(J.M, t, e), this._ctx && this._ctx.moveTo(t, e), this._x0 = t, this._y0 = e, this._xi = t, this._yi = e, this;
  }, r.prototype.lineTo = function(t, e) {
    var i = Ie(t - this._xi), n = Ie(e - this._yi), a = i > this._ux || n > this._uy;
    if (this.addData(J.L, t, e), this._ctx && a && this._ctx.lineTo(t, e), a)
      this._xi = t, this._yi = e, this._pendingPtDist = 0;
    else {
      var o = i * i + n * n;
      o > this._pendingPtDist && (this._pendingPtX = t, this._pendingPtY = e, this._pendingPtDist = o);
    }
    return this;
  }, r.prototype.bezierCurveTo = function(t, e, i, n, a, o) {
    return this._drawPendingPt(), this.addData(J.C, t, e, i, n, a, o), this._ctx && this._ctx.bezierCurveTo(t, e, i, n, a, o), this._xi = a, this._yi = o, this;
  }, r.prototype.quadraticCurveTo = function(t, e, i, n) {
    return this._drawPendingPt(), this.addData(J.Q, t, e, i, n), this._ctx && this._ctx.quadraticCurveTo(t, e, i, n), this._xi = i, this._yi = n, this;
  }, r.prototype.arc = function(t, e, i, n, a, o) {
    this._drawPendingPt(), rn[0] = n, rn[1] = a, rS(rn, o), n = rn[0], a = rn[1];
    var s = a - n;
    return this.addData(J.A, t, e, i, i, n, s, 0, o ? 0 : 1), this._ctx && this._ctx.arc(t, e, i, n, a, o), this._xi = Tr(a) * i + t, this._yi = Cr(a) * i + e, this;
  }, r.prototype.arcTo = function(t, e, i, n, a) {
    return this._drawPendingPt(), this._ctx && this._ctx.arcTo(t, e, i, n, a), this;
  }, r.prototype.rect = function(t, e, i, n) {
    return this._drawPendingPt(), this._ctx && this._ctx.rect(t, e, i, n), this.addData(J.R, t, e, i, n), this;
  }, r.prototype.closePath = function() {
    this._drawPendingPt(), this.addData(J.Z);
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
    !(this.data && this.data.length === e) && ol && (this.data = new Float32Array(e));
    for (var i = 0; i < e; i++)
      this.data[i] = t[i];
    this._len = e;
  }, r.prototype.appendPath = function(t) {
    t instanceof Array || (t = [t]);
    for (var e = t.length, i = 0, n = this._len, a = 0; a < e; a++)
      i += t[a].len();
    ol && this.data instanceof Float32Array && (this.data = new Float32Array(n + i));
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
      t instanceof Array && (t.length = this._len, ol && this._len > 11 && (this.data = new Float32Array(t)));
    }
  }, r.prototype.getBoundingRect = function() {
    me[0] = me[1] = _e[0] = _e[1] = Number.MAX_VALUE, Ge[0] = Ge[1] = Se[0] = Se[1] = -Number.MAX_VALUE;
    var t = this.data, e = 0, i = 0, n = 0, a = 0, o;
    for (o = 0; o < this._len; ) {
      var s = t[o++], l = o === 1;
      switch (l && (e = t[o], i = t[o + 1], n = e, a = i), s) {
        case J.M:
          e = n = t[o++], i = a = t[o++], _e[0] = n, _e[1] = a, Se[0] = n, Se[1] = a;
          break;
        case J.L:
          _c(e, i, t[o], t[o + 1], _e, Se), e = t[o++], i = t[o++];
          break;
        case J.C:
          J1(e, i, t[o++], t[o++], t[o++], t[o++], t[o], t[o + 1], _e, Se), e = t[o++], i = t[o++];
          break;
        case J.Q:
          tS(e, i, t[o++], t[o++], t[o], t[o + 1], _e, Se), e = t[o++], i = t[o++];
          break;
        case J.A:
          var u = t[o++], f = t[o++], h = t[o++], v = t[o++], c = t[o++], d = t[o++] + c;
          o += 1;
          var y = !t[o++];
          l && (n = Tr(c) * h + u, a = Cr(c) * v + f), eS(u, f, h, v, c, d, y, _e, Se), e = Tr(d) * h + u, i = Cr(d) * v + f;
          break;
        case J.R:
          n = e = t[o++], a = i = t[o++];
          var g = t[o++], p = t[o++];
          _c(n, a, n + g, a + p, _e, Se);
          break;
        case J.Z:
          e = n, i = a;
          break;
      }
      wi(me, me, _e), bi(Ge, Ge, Se);
    }
    return o === 0 && (me[0] = me[1] = Ge[0] = Ge[1] = 0), new rt(me[0], me[1], Ge[0] - me[0], Ge[1] - me[1]);
  }, r.prototype._calculateLength = function() {
    var t = this.data, e = this._len, i = this._ux, n = this._uy, a = 0, o = 0, s = 0, l = 0;
    this._pathSegLen || (this._pathSegLen = []);
    for (var u = this._pathSegLen, f = 0, h = 0, v = 0; v < e; ) {
      var c = t[v++], d = v === 1;
      d && (a = t[v], o = t[v + 1], s = a, l = o);
      var y = -1;
      switch (c) {
        case J.M:
          a = s = t[v++], o = l = t[v++];
          break;
        case J.L: {
          var g = t[v++], p = t[v++], m = g - a, _ = p - o;
          (Ie(m) > i || Ie(_) > n || v === e - 1) && (y = Math.sqrt(m * m + _ * _), a = g, o = p);
          break;
        }
        case J.C: {
          var S = t[v++], b = t[v++], g = t[v++], p = t[v++], w = t[v++], x = t[v++];
          y = M0(a, o, S, b, g, p, w, x, 10), a = w, o = x;
          break;
        }
        case J.Q: {
          var S = t[v++], b = t[v++], g = t[v++], p = t[v++];
          y = P0(a, o, S, b, g, p, 10), a = g, o = p;
          break;
        }
        case J.A:
          var T = t[v++], D = t[v++], A = t[v++], M = t[v++], L = t[v++], P = t[v++], I = P + L;
          v += 1, d && (s = Tr(L) * A + T, l = Cr(L) * M + D), y = al(A, M) * nl(je, Math.abs(P)), a = Tr(I) * A + T, o = Cr(I) * M + D;
          break;
        case J.R: {
          s = a = t[v++], l = o = t[v++];
          var E = t[v++], R = t[v++];
          y = E * 2 + R * 2;
          break;
        }
        case J.Z: {
          var m = s - a, _ = l - o;
          y = Math.sqrt(m * m + _ * _), a = s, o = l;
          break;
        }
      }
      y >= 0 && (u[h++] = y, f += y);
    }
    return this._pathLen = f, f;
  }, r.prototype.rebuildPath = function(t, e) {
    var i = this.data, n = this._ux, a = this._uy, o = this._len, s, l, u, f, h, v, c = e < 1, d, y, g = 0, p = 0, m, _ = 0, S, b;
    if (!(c && (this._pathSegLen || this._calculateLength(), d = this._pathSegLen, y = this._pathLen, m = e * y, !m)))
      t: for (var w = 0; w < o; ) {
        var x = i[w++], T = w === 1;
        switch (T && (u = i[w], f = i[w + 1], s = u, l = f), x !== J.L && _ > 0 && (t.lineTo(S, b), _ = 0), x) {
          case J.M:
            s = u = i[w++], l = f = i[w++], t.moveTo(u, f);
            break;
          case J.L: {
            h = i[w++], v = i[w++];
            var D = Ie(h - u), A = Ie(v - f);
            if (D > n || A > a) {
              if (c) {
                var M = d[p++];
                if (g + M > m) {
                  var L = (m - g) / M;
                  t.lineTo(u * (1 - L) + h * L, f * (1 - L) + v * L);
                  break t;
                }
                g += M;
              }
              t.lineTo(h, v), u = h, f = v, _ = 0;
            } else {
              var P = D * D + A * A;
              P > _ && (S = h, b = v, _ = P);
            }
            break;
          }
          case J.C: {
            var I = i[w++], E = i[w++], R = i[w++], W = i[w++], B = i[w++], F = i[w++];
            if (c) {
              var M = d[p++];
              if (g + M > m) {
                var L = (m - g) / M;
                xo(u, I, R, B, L, br), xo(f, E, W, F, L, xr), t.bezierCurveTo(br[1], xr[1], br[2], xr[2], br[3], xr[3]);
                break t;
              }
              g += M;
            }
            t.bezierCurveTo(I, E, R, W, B, F), u = B, f = F;
            break;
          }
          case J.Q: {
            var I = i[w++], E = i[w++], R = i[w++], W = i[w++];
            if (c) {
              var M = d[p++];
              if (g + M > m) {
                var L = (m - g) / M;
                To(u, I, R, L, br), To(f, E, W, L, xr), t.quadraticCurveTo(br[1], xr[1], br[2], xr[2]);
                break t;
              }
              g += M;
            }
            t.quadraticCurveTo(I, E, R, W), u = R, f = W;
            break;
          }
          case J.A:
            var G = i[w++], it = i[w++], j = i[w++], ft = i[w++], ht = i[w++], dt = i[w++], le = i[w++], hr = !i[w++], ri = j > ft ? j : ft, Ut = Ie(j - ft) > 1e-3, xt = ht + dt, Y = !1;
            if (c) {
              var M = d[p++];
              g + M > m && (xt = ht + dt * (m - g) / M, Y = !0), g += M;
            }
            if (Ut && t.ellipse ? t.ellipse(G, it, j, ft, le, ht, xt, hr) : t.arc(G, it, ri, ht, xt, hr), Y)
              break t;
            T && (s = Tr(ht) * j + G, l = Cr(ht) * ft + it), u = Tr(xt) * j + G, f = Cr(xt) * ft + it;
            break;
          case J.R:
            s = u = i[w], l = f = i[w + 1], h = i[w++], v = i[w++];
            var K = i[w++], cr = i[w++];
            if (c) {
              var M = d[p++];
              if (g + M > m) {
                var It = m - g;
                t.moveTo(h, v), t.lineTo(h + nl(It, K), v), It -= K, It > 0 && t.lineTo(h + K, v + nl(It, cr)), It -= cr, It > 0 && t.lineTo(h + al(K - It, 0), v + cr), It -= K, It > 0 && t.lineTo(h, v + al(cr - It, 0));
                break t;
              }
              g += M;
            }
            t.rect(h, v, K, cr);
            break;
          case J.Z:
            if (c) {
              var M = d[p++];
              if (g + M > m) {
                var L = (m - g) / M;
                t.lineTo(u * (1 - L) + s * L, f * (1 - L) + l * L);
                break t;
              }
              g += M;
            }
            t.closePath(), u = s, f = l;
        }
      }
  }, r.prototype.clone = function() {
    var t = new r(), e = this.data;
    return t.data = e.slice ? e.slice() : Array.prototype.slice.call(e), t._len = this._len, t;
  }, r.CMD = J, r.initDefaultProps = (function() {
    var t = r.prototype;
    t._saveData = !0, t._ux = 0, t._uy = 0, t._pendingPtDist = 0, t._version = 0;
  })(), r;
})();
function si(r, t, e, i, n, a, o) {
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
function iS(r, t, e, i, n, a, o, s, l, u, f) {
  if (l === 0)
    return !1;
  var h = l;
  if (f > t + h && f > i + h && f > a + h && f > s + h || f < t - h && f < i - h && f < a - h && f < s - h || u > r + h && u > e + h && u > n + h && u > o + h || u < r - h && u < e - h && u < n - h && u < o - h)
    return !1;
  var v = D0(r, t, e, i, n, a, o, s, u, f);
  return v <= h / 2;
}
function nS(r, t, e, i, n, a, o, s, l) {
  if (o === 0)
    return !1;
  var u = o;
  if (l > t + u && l > i + u && l > a + u || l < t - u && l < i - u && l < a - u || s > r + u && s > e + u && s > n + u || s < r - u && s < e - u && s < n - u)
    return !1;
  var f = L0(r, t, e, i, n, a, s, l);
  return f <= u / 2;
}
var bc = Math.PI * 2;
function Ma(r) {
  return r %= bc, r < 0 && (r += bc), r;
}
var nn = Math.PI * 2;
function aS(r, t, e, i, n, a, o, s, l) {
  if (o === 0)
    return !1;
  var u = o;
  s -= r, l -= t;
  var f = Math.sqrt(s * s + l * l);
  if (f - u > e || f + u < e)
    return !1;
  if (Math.abs(i - n) % nn < 1e-4)
    return !0;
  if (a) {
    var h = i;
    i = Ma(n), n = Ma(h);
  } else
    i = Ma(i), n = Ma(n);
  i > n && (n += nn);
  var v = Math.atan2(l, s);
  return v < 0 && (v += nn), v >= i && v <= n || v + nn >= i && v + nn <= n;
}
function Dr(r, t, e, i, n, a) {
  if (a > t && a > i || a < t && a < i || i === t)
    return 0;
  var o = (a - t) / (i - t), s = i < t ? 1 : -1;
  (o === 1 || o === 0) && (s = i < t ? 0.5 : -0.5);
  var l = o * (e - r) + r;
  return l === n ? 1 / 0 : l > n ? s : 0;
}
var We = Kr.CMD, Mr = Math.PI * 2, oS = 1e-4;
function sS(r, t) {
  return Math.abs(r - t) < oS;
}
var Et = [-1, -1, -1], te = [-1, -1];
function lS() {
  var r = te[0];
  te[0] = te[1], te[1] = r;
}
function uS(r, t, e, i, n, a, o, s, l, u) {
  if (u > t && u > i && u > a && u > s || u < t && u < i && u < a && u < s)
    return 0;
  var f = bo(t, i, a, s, u, Et);
  if (f === 0)
    return 0;
  for (var h = 0, v = -1, c = void 0, d = void 0, y = 0; y < f; y++) {
    var g = Et[y], p = g === 0 || g === 1 ? 0.5 : 1, m = Ct(r, e, n, o, g);
    m < l || (v < 0 && (v = $p(t, i, a, s, te), te[1] < te[0] && v > 1 && lS(), c = Ct(t, i, a, s, te[0]), v > 1 && (d = Ct(t, i, a, s, te[1]))), v === 2 ? g < te[0] ? h += c < t ? p : -p : g < te[1] ? h += d < c ? p : -p : h += s < d ? p : -p : g < te[0] ? h += c < t ? p : -p : h += s < c ? p : -p);
  }
  return h;
}
function fS(r, t, e, i, n, a, o, s) {
  if (s > t && s > i && s > a || s < t && s < i && s < a)
    return 0;
  var l = A0(t, i, a, s, Et);
  if (l === 0)
    return 0;
  var u = Vp(t, i, a);
  if (u >= 0 && u <= 1) {
    for (var f = 0, h = Bt(t, i, a, u), v = 0; v < l; v++) {
      var c = Et[v] === 0 || Et[v] === 1 ? 0.5 : 1, d = Bt(r, e, n, Et[v]);
      d < o || (Et[v] < u ? f += h < t ? c : -c : f += a < h ? c : -c);
    }
    return f;
  } else {
    var c = Et[0] === 0 || Et[0] === 1 ? 0.5 : 1, d = Bt(r, e, n, Et[0]);
    return d < o ? 0 : a < t ? c : -c;
  }
}
function hS(r, t, e, i, n, a, o, s) {
  if (s -= t, s > e || s < -e)
    return 0;
  var l = Math.sqrt(e * e - s * s);
  Et[0] = -l, Et[1] = l;
  var u = Math.abs(i - n);
  if (u < 1e-4)
    return 0;
  if (u >= Mr - 1e-4) {
    i = 0, n = Mr;
    var f = a ? 1 : -1;
    return o >= Et[0] + r && o <= Et[1] + r ? f : 0;
  }
  if (i > n) {
    var h = i;
    i = n, n = h;
  }
  i < 0 && (i += Mr, n += Mr);
  for (var v = 0, c = 0; c < 2; c++) {
    var d = Et[c];
    if (d + r > o) {
      var y = Math.atan2(s, d), f = a ? 1 : -1;
      y < 0 && (y = Mr + y), (y >= i && y <= n || y + Mr >= i && y + Mr <= n) && (y > Math.PI / 2 && y < Math.PI * 1.5 && (f = -f), v += f);
    }
  }
  return v;
}
function cg(r, t, e, i, n) {
  for (var a = r.data, o = r.len(), s = 0, l = 0, u = 0, f = 0, h = 0, v, c, d = 0; d < o; ) {
    var y = a[d++], g = d === 1;
    switch (y === We.M && d > 1 && (e || (s += Dr(l, u, f, h, i, n))), g && (l = a[d], u = a[d + 1], f = l, h = u), y) {
      case We.M:
        f = a[d++], h = a[d++], l = f, u = h;
        break;
      case We.L:
        if (e) {
          if (si(l, u, a[d], a[d + 1], t, i, n))
            return !0;
        } else
          s += Dr(l, u, a[d], a[d + 1], i, n) || 0;
        l = a[d++], u = a[d++];
        break;
      case We.C:
        if (e) {
          if (iS(l, u, a[d++], a[d++], a[d++], a[d++], a[d], a[d + 1], t, i, n))
            return !0;
        } else
          s += uS(l, u, a[d++], a[d++], a[d++], a[d++], a[d], a[d + 1], i, n) || 0;
        l = a[d++], u = a[d++];
        break;
      case We.Q:
        if (e) {
          if (nS(l, u, a[d++], a[d++], a[d], a[d + 1], t, i, n))
            return !0;
        } else
          s += fS(l, u, a[d++], a[d++], a[d], a[d + 1], i, n) || 0;
        l = a[d++], u = a[d++];
        break;
      case We.A:
        var p = a[d++], m = a[d++], _ = a[d++], S = a[d++], b = a[d++], w = a[d++];
        d += 1;
        var x = !!(1 - a[d++]);
        v = Math.cos(b) * _ + p, c = Math.sin(b) * S + m, g ? (f = v, h = c) : s += Dr(l, u, v, c, i, n);
        var T = (i - p) * S / _ + p;
        if (e) {
          if (aS(p, m, S, b, b + w, x, t, T, n))
            return !0;
        } else
          s += hS(p, m, S, b, b + w, x, T, n);
        l = Math.cos(b + w) * _ + p, u = Math.sin(b + w) * S + m;
        break;
      case We.R:
        f = l = a[d++], h = u = a[d++];
        var D = a[d++], A = a[d++];
        if (v = f + D, c = h + A, e) {
          if (si(f, h, v, h, t, i, n) || si(v, h, v, c, t, i, n) || si(v, c, f, c, t, i, n) || si(f, c, f, h, t, i, n))
            return !0;
        } else
          s += Dr(v, h, v, c, i, n), s += Dr(f, c, f, h, i, n);
        break;
      case We.Z:
        if (e) {
          if (si(l, u, f, h, t, i, n))
            return !0;
        } else
          s += Dr(l, u, f, h, i, n);
        l = f, u = h;
        break;
    }
  }
  return !e && !sS(u, h) && (s += Dr(l, u, f, h, i, n) || 0), s !== 0;
}
function cS(r, t, e) {
  return cg(r, 0, !1, t, e);
}
function vS(r, t, e, i) {
  return cg(r, t, !0, e, i);
}
var vg = at({
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
}, Vr), dS = {
  style: at({
    fill: !0,
    stroke: !0,
    strokePercent: !0,
    fillOpacity: !0,
    strokeOpacity: !0,
    lineDashOffset: !0,
    lineWidth: !0,
    miterLimit: !0
  }, Jo.style)
}, ll = Zn.concat([
  "invisible",
  "culling",
  "z",
  "z2",
  "zlevel",
  "parent"
]), ot = (function(r) {
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
      for (var s = 0; s < ll.length; ++s)
        n[ll[s]] = this[ll[s]];
      n.__dirty |= Xt;
    } else this._decalEl && (this._decalEl = null);
  }, t.prototype.getDecalElement = function() {
    return this._decalEl;
  }, t.prototype._init = function(e) {
    var i = vt(e);
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
        var i = Co(e, 0);
        return i > 0.5 ? mu : i > 0.2 ? K0 : _u;
      } else if (e)
        return _u;
    }
    return mu;
  }, t.prototype.getInsideTextStroke = function(e) {
    var i = this.style.fill;
    if (z(i)) {
      var n = this.__zr, a = !!(n && n.isDarkMode()), o = Co(e, 0) < yu;
      if (a === o)
        return i;
    }
  }, t.prototype.buildPath = function(e, i, n) {
  }, t.prototype.pathUpdated = function() {
    this.__dirty &= ~_i;
  }, t.prototype.getUpdatedPathProxy = function(e) {
    return !this.path && this.createPathProxy(), this.path.beginPath(), this.buildPath(this.path, this.shape, e), this.path;
  }, t.prototype.createPathProxy = function() {
    this.path = new Kr(!1);
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
      (a || this.__dirty & _i) && (o.beginPath(), this.buildPath(o, this.shape, !1), this.pathUpdated()), e = o.getBoundingRect();
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
        if (u > 1e-10 && (this.hasFill() || (l = Math.max(l, this.strokeContainThreshold)), vS(s, l / u, e, i)))
          return !0;
      }
      if (this.hasFill())
        return cS(s, e, i);
    }
    return !1;
  }, t.prototype.dirtyShape = function() {
    this.__dirty |= _i, this._rect && (this._rect = null), this._decalEl && this._decalEl.dirtyShape(), this.markRedraw();
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
    return !!(this.__dirty & _i);
  }, t.prototype.createStyle = function(e) {
    return Zo(vg, e);
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
        for (var f = {}, h = vt(u), v = 0; v < h.length; v++) {
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
    return dS;
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
        return q(e.style);
      }, o.prototype.getDefaultShape = function() {
        return q(e.shape);
      }, o;
    })(t);
    for (var n in e)
      typeof e[n] == "function" && (i.prototype[n] = e[n]);
    return i;
  }, t.initDefaultProps = (function() {
    var e = t.prototype;
    e.type = "path", e.strokeContainThreshold = 5, e.segmentIgnoreThreshold = 0, e.subPixelOptimize = !1, e.autoBatch = !1, e.__dirty = Xt | mn | _i;
  })(), t;
})(ca), pS = at({
  strokeFirst: !0,
  font: Yr,
  x: 0,
  y: 0,
  textAlign: "left",
  textBaseline: "top",
  miterLimit: 2
}, vg), Lo = (function(r) {
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
    return Zo(pS, e);
  }, t.prototype.setBoundingRect = function(e) {
    this._rect = e;
  }, t.prototype.getBoundingRect = function() {
    var e = this.style;
    if (!this._rect) {
      var i = e.text;
      i != null ? i += "" : i = "";
      var n = Cf(i, e.font, e.textAlign, e.textBaseline);
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
})(ca);
Lo.prototype.type = "tspan";
var gS = at({
  x: 0,
  y: 0
}, Vr), yS = {
  style: at({
    x: !0,
    y: !0,
    width: !0,
    height: !0,
    sx: !0,
    sy: !0,
    sWidth: !0,
    sHeight: !0
  }, Jo.style)
};
function mS(r) {
  return !!(r && typeof r != "string" && r.width && r.height);
}
var fr = (function(r) {
  O(t, r);
  function t() {
    return r !== null && r.apply(this, arguments) || this;
  }
  return t.prototype.createStyle = function(e) {
    return Zo(gS, e);
  }, t.prototype._getSize = function(e) {
    var i = this.style, n = i[e];
    if (n != null)
      return n;
    var a = mS(i.image) ? i.image : this.__image;
    if (!a)
      return 0;
    var o = e === "width" ? "height" : "width", s = i[o];
    return s == null ? a[e] : a[e] / a[o] * s;
  }, t.prototype.getWidth = function() {
    return this._getSize("width");
  }, t.prototype.getHeight = function() {
    return this._getSize("height");
  }, t.prototype.getAnimationStyleProps = function() {
    return yS;
  }, t.prototype.getBoundingRect = function() {
    var e = this.style;
    return this._rect || (this._rect = new rt(e.x || 0, e.y || 0, this.getWidth(), this.getHeight())), this._rect;
  }, t;
})(ca);
fr.prototype.type = "image";
function _S(r, t) {
  var e = t.x, i = t.y, n = t.width, a = t.height, o = t.r, s, l, u, f;
  n < 0 && (e = e + n, n = -n), a < 0 && (i = i + a, a = -a), typeof o == "number" ? s = l = u = f = o : o instanceof Array ? o.length === 1 ? s = l = u = f = o[0] : o.length === 2 ? (s = u = o[0], l = f = o[1]) : o.length === 3 ? (s = o[0], l = f = o[1], u = o[2]) : (s = o[0], l = o[1], u = o[2], f = o[3]) : s = l = u = f = 0;
  var h;
  s + l > n && (h = s + l, s *= n / h, l *= n / h), u + f > n && (h = u + f, u *= n / h, f *= n / h), l + u > a && (h = l + u, l *= a / h, u *= a / h), s + f > a && (h = s + f, s *= a / h, f *= a / h), r.moveTo(e + s, i), r.lineTo(e + n - l, i), l !== 0 && r.arc(e + n - l, i + l, l, -Math.PI / 2, 0), r.lineTo(e + n, i + a - u), u !== 0 && r.arc(e + n - u, i + a - u, u, 0, Math.PI / 2), r.lineTo(e + f, i + a), f !== 0 && r.arc(e + f, i + a - f, f, Math.PI / 2, Math.PI), r.lineTo(e, i + s), s !== 0 && r.arc(e + s, i + s, s, Math.PI, Math.PI * 1.5);
}
var Ti = Math.round;
function dg(r, t, e) {
  if (t) {
    var i = t.x1, n = t.x2, a = t.y1, o = t.y2;
    r.x1 = i, r.x2 = n, r.y1 = a, r.y2 = o;
    var s = e && e.lineWidth;
    return s && (Ti(i * 2) === Ti(n * 2) && (r.x1 = r.x2 = Fr(i, s, !0)), Ti(a * 2) === Ti(o * 2) && (r.y1 = r.y2 = Fr(a, s, !0))), r;
  }
}
function pg(r, t, e) {
  if (t) {
    var i = t.x, n = t.y, a = t.width, o = t.height;
    r.x = i, r.y = n, r.width = a, r.height = o;
    var s = e && e.lineWidth;
    return s && (r.x = Fr(i, s, !0), r.y = Fr(n, s, !0), r.width = Math.max(Fr(i + a, s, !1) - r.x, a === 0 ? 0 : 1), r.height = Math.max(Fr(n + o, s, !1) - r.y, o === 0 ? 0 : 1)), r;
  }
}
function Fr(r, t, e) {
  if (!t)
    return r;
  var i = Ti(r * 2);
  return (i + Ti(t)) % 2 === 0 ? i / 2 : (i + (e ? 1 : -1)) / 2;
}
var SS = /* @__PURE__ */ (function() {
  function r() {
    this.x = 0, this.y = 0, this.width = 0, this.height = 0;
  }
  return r;
})(), wS = {}, Dt = (function(r) {
  O(t, r);
  function t(e) {
    return r.call(this, e) || this;
  }
  return t.prototype.getDefaultShape = function() {
    return new SS();
  }, t.prototype.buildPath = function(e, i) {
    var n, a, o, s;
    if (this.subPixelOptimize) {
      var l = pg(wS, i, this.style);
      n = l.x, a = l.y, o = l.width, s = l.height, l.r = i.r, i = l;
    } else
      n = i.x, a = i.y, o = i.width, s = i.height;
    i.r ? _S(e, i) : e.rect(n, a, o, s);
  }, t.prototype.isZeroArea = function() {
    return !this.shape.width || !this.shape.height;
  }, t;
})(ot);
Dt.prototype.type = "rect";
var xc = {
  fill: "#000"
}, Tc = 2, bS = {
  style: at({
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
  }, Jo.style)
}, Gt = (function(r) {
  O(t, r);
  function t(e) {
    var i = r.call(this) || this;
    return i.type = "text", i._children = [], i._defaultStyle = xc, i.attr(e), i;
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
    this._childCursor = 0, MS(this.style), this.style.rich ? this._updateRichTexts() : this._updatePlainTexts(), this._children.length = this._childCursor, this.styleUpdated();
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
      for (var e = new rt(0, 0, 0, 0), i = this._children, n = [], a = null, o = 0; o < i.length; o++) {
        var s = i[o], l = s.getBoundingRect(), u = s.getLocalTransform(n);
        u ? (e.copy(l), e.applyTransform(u), a = a || e.clone(), a.union(e)) : (a = a || l.clone(), a.union(l));
      }
      this._rect = a || e;
    }
    return this._rect;
  }, t.prototype.setDefaultTextStyle = function(e) {
    this._defaultStyle = e || xc;
  }, t.prototype.setTextContent = function(e) {
  }, t.prototype._mergeStyle = function(e, i) {
    if (!i)
      return e;
    var n = i.rich, a = e.rich || n && {};
    return k(e, i), n && a ? (this._mergeRich(a, n), e.rich = a) : a && (e.rich = a), e;
  }, t.prototype._mergeRich = function(e, i) {
    for (var n = vt(i), a = 0; a < n.length; a++) {
      var o = n[a];
      e[o] = e[o] || {}, k(e[o], i[o]);
    }
  }, t.prototype.getAnimationStyleProps = function() {
    return bS;
  }, t.prototype._getOrCreateChild = function(e) {
    var i = this._children[this._childCursor];
    return (!i || !(i instanceof e)) && (i = new e()), this._children[this._childCursor++] = i, i.__zr = this.__zr, i.parent = this, i;
  }, t.prototype._updatePlainTexts = function() {
    var e = this.style, i = e.font || Yr, n = e.padding, a = Ic(e), o = W1(a, e), s = ul(e), l = !!e.backgroundColor, u = o.outerHeight, f = o.outerWidth, h = o.contentWidth, v = o.lines, c = o.lineHeight, d = this._defaultStyle;
    this.isTruncated = !!o.isTruncated;
    var y = e.x || 0, g = e.y || 0, p = e.align || d.align || "left", m = e.verticalAlign || d.verticalAlign || "top", _ = y, S = Si(g, o.contentHeight, m);
    if (s || n) {
      var b = Sn(y, f, p), w = Si(g, u, m);
      s && this._renderBackground(e, e, b, w, f, u);
    }
    S += c / 2, n && (_ = Pc(y, p, n), m === "top" ? S += n[0] : m === "bottom" && (S -= n[2]));
    for (var x = 0, T = !1, D = Lc("fill" in e ? e.fill : (T = !0, d.fill)), A = Ac("stroke" in e ? e.stroke : !l && (!d.autoStroke || T) ? (x = Tc, d.stroke) : null), M = e.textShadowBlur > 0, L = e.width != null && (e.overflow === "truncate" || e.overflow === "break" || e.overflow === "breakAll"), P = o.calculatedLineHeight, I = 0; I < v.length; I++) {
      var E = this._getOrCreateChild(Lo), R = E.createStyle();
      E.useStyle(R), R.text = v[I], R.x = _, R.y = S, R.textAlign = p, R.textBaseline = "middle", R.opacity = e.opacity, R.strokeFirst = !0, M && (R.shadowBlur = e.textShadowBlur || 0, R.shadowColor = e.textShadowColor || "transparent", R.shadowOffsetX = e.textShadowOffsetX || 0, R.shadowOffsetY = e.textShadowOffsetY || 0), R.stroke = A, R.fill = D, A && (R.lineWidth = e.lineWidth || x, R.lineDash = e.lineDash, R.lineDashOffset = e.lineDashOffset || 0), R.font = i, Dc(R, e), S += c, L && E.setBoundingRect(new rt(Sn(R.x, h, R.textAlign), Si(R.y, P, R.textBaseline), h, P));
    }
  }, t.prototype._updateRichTexts = function() {
    var e = this.style, i = Ic(e), n = X1(i, e), a = n.width, o = n.outerWidth, s = n.outerHeight, l = e.padding, u = e.x || 0, f = e.y || 0, h = this._defaultStyle, v = e.align || h.align, c = e.verticalAlign || h.verticalAlign;
    this.isTruncated = !!n.isTruncated;
    var d = Sn(u, o, v), y = Si(f, s, c), g = d, p = y;
    l && (g += l[3], p += l[0]);
    var m = g + a;
    ul(e) && this._renderBackground(e, e, d, y, o, s);
    for (var _ = !!e.backgroundColor, S = 0; S < n.lines.length; S++) {
      for (var b = n.lines[S], w = b.tokens, x = w.length, T = b.lineHeight, D = b.width, A = 0, M = g, L = m, P = x - 1, I = void 0; A < x && (I = w[A], !I.align || I.align === "left"); )
        this._placeToken(I, e, T, p, M, "left", _), D -= I.width, M += I.width, A++;
      for (; P >= 0 && (I = w[P], I.align === "right"); )
        this._placeToken(I, e, T, p, L, "right", _), D -= I.width, L -= I.width, P--;
      for (M += (a - (M - g) - (m - L) - D) / 2; A <= P; )
        I = w[A], this._placeToken(I, e, T, p, M + I.width / 2, "center", _), M += I.width, A++;
      p += T;
    }
  }, t.prototype._placeToken = function(e, i, n, a, o, s, l) {
    var u = i.rich[e.styleName] || {};
    u.text = e.text;
    var f = e.verticalAlign, h = a + n / 2;
    f === "top" ? h = a + e.height / 2 : f === "bottom" && (h = a + n - e.height / 2);
    var v = !e.isLineHolder && ul(u);
    v && this._renderBackground(u, i, s === "right" ? o - e.width : s === "center" ? o - e.width / 2 : o, h - e.height / 2, e.width, e.height);
    var c = !!u.backgroundColor, d = e.textPadding;
    d && (o = Pc(o, s, d), h -= e.height / 2 - d[0] - e.innerHeight / 2);
    var y = this._getOrCreateChild(Lo), g = y.createStyle();
    y.useStyle(g);
    var p = this._defaultStyle, m = !1, _ = 0, S = Lc("fill" in u ? u.fill : "fill" in i ? i.fill : (m = !0, p.fill)), b = Ac("stroke" in u ? u.stroke : "stroke" in i ? i.stroke : !c && !l && (!p.autoStroke || m) ? (_ = Tc, p.stroke) : null), w = u.textShadowBlur > 0 || i.textShadowBlur > 0;
    g.text = e.text, g.x = o, g.y = h, w && (g.shadowBlur = u.textShadowBlur || i.textShadowBlur || 0, g.shadowColor = u.textShadowColor || i.textShadowColor || "transparent", g.shadowOffsetX = u.textShadowOffsetX || i.textShadowOffsetX || 0, g.shadowOffsetY = u.textShadowOffsetY || i.textShadowOffsetY || 0), g.textAlign = s, g.textBaseline = "middle", g.font = e.font || Yr, g.opacity = no(u.opacity, i.opacity, 1), Dc(g, u), b && (g.lineWidth = no(u.lineWidth, i.lineWidth, _), g.lineDash = X(u.lineDash, i.lineDash), g.lineDashOffset = i.lineDashOffset || 0, g.stroke = b), S && (g.fill = S);
    var x = e.contentWidth, T = e.contentHeight;
    y.setBoundingRect(new rt(Sn(g.x, x, g.textAlign), Si(g.y, T, g.textBaseline), x, T));
  }, t.prototype._renderBackground = function(e, i, n, a, o, s) {
    var l = e.backgroundColor, u = e.borderWidth, f = e.borderColor, h = l && l.image, v = l && !h, c = e.borderRadius, d = this, y, g;
    if (v || e.lineHeight || u && f) {
      y = this._getOrCreateChild(Dt), y.useStyle(y.createStyle()), y.style.fill = null;
      var p = y.shape;
      p.x = n, p.y = a, p.width = o, p.height = s, p.r = c, y.dirtyShape();
    }
    if (v) {
      var m = y.style;
      m.fill = l || null, m.fillOpacity = X(e.fillOpacity, 1);
    } else if (h) {
      g = this._getOrCreateChild(fr), g.onload = function() {
        d.dirtyStyle();
      };
      var _ = g.style;
      _.image = l.image, _.x = n, _.y = a, _.width = o, _.height = s;
    }
    if (u && f) {
      var m = y.style;
      m.lineWidth = u, m.stroke = f, m.strokeOpacity = X(e.strokeOpacity, 1), m.lineDash = e.borderDash, m.lineDashOffset = e.borderDashOffset || 0, y.strokeContainThreshold = 0, y.hasFill() && y.hasStroke() && (m.strokeFirst = !0, m.lineWidth *= 2);
    }
    var S = (y || g).style;
    S.shadowBlur = e.shadowBlur || 0, S.shadowColor = e.shadowColor || "transparent", S.shadowOffsetX = e.shadowOffsetX || 0, S.shadowOffsetY = e.shadowOffsetY || 0, S.opacity = no(e.opacity, i.opacity, 1);
  }, t.makeFont = function(e) {
    var i = "";
    return DS(e) && (i = [
      e.fontStyle,
      e.fontWeight,
      CS(e.fontSize),
      e.fontFamily || "sans-serif"
    ].join(" ")), i && xe(i) || e.textFont || e.font;
  }, t;
})(ca), xS = { left: !0, right: 1, center: 1 }, TS = { top: 1, bottom: 1, middle: 1 }, Cc = ["fontStyle", "fontWeight", "fontSize", "fontFamily"];
function CS(r) {
  return typeof r == "string" && (r.indexOf("px") !== -1 || r.indexOf("rem") !== -1 || r.indexOf("em") !== -1) ? r : isNaN(+r) ? vf + "px" : r + "px";
}
function Dc(r, t) {
  for (var e = 0; e < Cc.length; e++) {
    var i = Cc[e], n = t[i];
    n != null && (r[i] = n);
  }
}
function DS(r) {
  return r.fontSize != null || r.fontFamily || r.fontWeight;
}
function MS(r) {
  return Mc(r), C(r.rich, Mc), r;
}
function Mc(r) {
  if (r) {
    r.font = Gt.makeFont(r);
    var t = r.align;
    t === "middle" && (t = "center"), r.align = t == null || xS[t] ? t : "left";
    var e = r.verticalAlign;
    e === "center" && (e = "middle"), r.verticalAlign = e == null || TS[e] ? e : "top";
    var i = r.padding;
    i && (r.padding = Ap(r.padding));
  }
}
function Ac(r, t) {
  return r == null || t <= 0 || r === "transparent" || r === "none" ? null : r.image || r.colorStops ? "#000" : r;
}
function Lc(r) {
  return r == null || r === "none" ? null : r.image || r.colorStops ? "#000" : r;
}
function Pc(r, t, e) {
  return t === "right" ? r - e[1] : t === "center" ? r + e[3] / 2 - e[1] / 2 : r + e[3];
}
function Ic(r) {
  var t = r.text;
  return t != null && (t += ""), t;
}
function ul(r) {
  return !!(r.backgroundColor || r.lineHeight || r.borderWidth && r.borderColor);
}
var tt = gt(), AS = function(r, t, e, i) {
  if (i) {
    var n = tt(i);
    n.dataIndex = e, n.dataType = t, n.seriesIndex = r, n.ssrType = "chart", i.type === "group" && i.traverse(function(a) {
      var o = tt(a);
      o.seriesIndex = r, o.dataIndex = e, o.dataType = t, o.ssrType = "chart";
    });
  }
}, Ec = 1, Rc = {}, gg = gt(), If = gt(), Ef = 0, ts = 1, es = 2, oe = ["emphasis", "blur", "select"], kc = ["normal", "emphasis", "blur", "select"], LS = 10, PS = 9, Gr = "highlight", ho = "downplay", En = "select", co = "unselect", Rn = "toggleSelect";
function li(r) {
  return r != null && r !== "none";
}
function rs(r, t, e) {
  r.onHoverStateChange && (r.hoverState || 0) !== e && r.onHoverStateChange(t), r.hoverState = e;
}
function yg(r) {
  rs(r, "emphasis", es);
}
function mg(r) {
  r.hoverState === es && rs(r, "normal", Ef);
}
function Rf(r) {
  rs(r, "blur", ts);
}
function _g(r) {
  r.hoverState === ts && rs(r, "normal", Ef);
}
function IS(r) {
  r.selected = !0;
}
function ES(r) {
  r.selected = !1;
}
function Oc(r, t, e) {
  t(r, e);
}
function $e(r, t, e) {
  Oc(r, t, e), r.isGroup && r.traverse(function(i) {
    Oc(i, t, e);
  });
}
function Nc(r, t) {
  switch (t) {
    case "emphasis":
      r.hoverState = es;
      break;
    case "normal":
      r.hoverState = Ef;
      break;
    case "blur":
      r.hoverState = ts;
      break;
    case "select":
      r.selected = !0;
  }
}
function RS(r, t, e, i) {
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
function kS(r, t, e, i) {
  var n = e && et(e, "select") >= 0, a = !1;
  if (r instanceof ot) {
    var o = gg(r), s = n && o.selectFill || o.normalFill, l = n && o.selectStroke || o.normalStroke;
    if (li(s) || li(l)) {
      i = i || {};
      var u = i.style || {};
      u.fill === "inherit" ? (a = !0, i = k({}, i), u = k({}, u), u.fill = s) : !li(u.fill) && li(s) ? (a = !0, i = k({}, i), u = k({}, u), u.fill = Jh(s)) : !li(u.stroke) && li(l) && (a || (i = k({}, i), u = k({}, u)), u.stroke = Jh(l)), i.style = u;
    }
  }
  if (i && i.z2 == null) {
    a || (i = k({}, i));
    var f = r.z2EmphasisLift;
    i.z2 = r.z2 + (f ?? LS);
  }
  return i;
}
function OS(r, t, e) {
  if (e && e.z2 == null) {
    e = k({}, e);
    var i = r.z2SelectLift;
    e.z2 = r.z2 + (i ?? PS);
  }
  return e;
}
function NS(r, t, e) {
  var i = et(r.currentStates, t) >= 0, n = r.style.opacity, a = i ? null : RS(r, ["opacity"], t, {
    opacity: 1
  });
  e = e || {};
  var o = e.style || {};
  return o.opacity == null && (e = k({}, e), o = k({
    // Already being applied 'emphasis'. DON'T mul opacity multiple times.
    opacity: i ? n : a.opacity * 0.1
  }, o), e.style = o), e;
}
function fl(r, t) {
  var e = this.states[r];
  if (this.style) {
    if (r === "emphasis")
      return kS(this, r, t, e);
    if (r === "blur")
      return NS(this, r, e);
    if (r === "select")
      return OS(this, r, e);
  }
  return e;
}
function BS(r) {
  r.stateProxy = fl;
  var t = r.getTextContent(), e = r.getTextGuideLine();
  t && (t.stateProxy = fl), e && (e.stateProxy = fl);
}
function Bc(r, t) {
  !xg(r, t) && !r.__highByOuter && $e(r, yg);
}
function Fc(r, t) {
  !xg(r, t) && !r.__highByOuter && $e(r, mg);
}
function Qn(r, t) {
  r.__highByOuter |= 1 << (t || 0), $e(r, yg);
}
function jn(r, t) {
  !(r.__highByOuter &= ~(1 << (t || 0))) && $e(r, mg);
}
function Sg(r) {
  $e(r, Rf);
}
function kf(r) {
  $e(r, _g);
}
function wg(r) {
  $e(r, IS);
}
function bg(r) {
  $e(r, ES);
}
function xg(r, t) {
  return r.__highDownSilentOnTouch && t.zrByTouch;
}
function Tg(r) {
  var t = r.getModel(), e = [], i = [];
  t.eachComponent(function(n, a) {
    var o = If(a), s = n === "series", l = s ? r.getViewOfSeriesModel(a) : r.getViewOfComponentModel(a);
    !s && i.push(l), o.isBlured && (l.group.traverse(function(u) {
      _g(u);
    }), s && e.push(a)), o.isBlured = !1;
  }), C(i, function(n) {
    n && n.toggleBlurSeries && n.toggleBlurSeries(e, !1, t);
  });
}
function Tu(r, t, e, i) {
  var n = i.getModel();
  e = e || "coordinateSystem";
  function a(u, f) {
    for (var h = 0; h < f.length; h++) {
      var v = u.getItemGraphicEl(f[h]);
      v && kf(v);
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
        if (c.group.traverse(function(g) {
          g.__highByOuter && f && t === "self" || Rf(g);
        }), $t(t))
          a(u.getData(), t);
        else if (V(t))
          for (var d = vt(t), y = 0; y < d.length; y++)
            a(u.getData(d[y]), t[d[y]]);
        l.push(u), If(u).isBlured = !0;
      }
    }), n.eachComponent(function(u, f) {
      if (u !== "series") {
        var h = i.getViewOfComponentModel(f);
        h && h.toggleBlurSeries && h.toggleBlurSeries(l, !0, n);
      }
    });
  }
}
function Cu(r, t, e) {
  if (!(r == null || t == null)) {
    var i = e.getModel().getComponent(r, t);
    if (i) {
      If(i).isBlured = !0;
      var n = e.getViewOfComponentModel(i);
      !n || !n.focusBlurEnabled || n.group.traverse(function(a) {
        Rf(a);
      });
    }
  }
}
function FS(r, t, e) {
  var i = r.seriesIndex, n = r.getData(t.dataType);
  if (n) {
    var a = qr(n, t);
    a = (N(a) ? a[0] : a) || 0;
    var o = n.getItemGraphicEl(a);
    if (!o)
      for (var s = n.count(), l = 0; !o && l < s; )
        o = n.getItemGraphicEl(l++);
    if (o) {
      var u = tt(o);
      Tu(i, u.focus, u.blurScope, e);
    } else {
      var f = r.get(["emphasis", "focus"]), h = r.get(["emphasis", "blurScope"]);
      f != null && Tu(i, f, h, e);
    }
  }
}
function Of(r, t, e, i) {
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
    if (tt(s[u]).focus === "self") {
      l = !0;
      break;
    }
  return {
    focusSelf: l,
    dispatchers: s
  };
}
function zS(r, t, e) {
  var i = tt(r), n = Of(i.componentMainType, i.componentIndex, i.componentHighDownName, e), a = n.dispatchers, o = n.focusSelf;
  a ? (o && Cu(i.componentMainType, i.componentIndex, e), C(a, function(s) {
    return Bc(s, t);
  })) : (Tu(i.seriesIndex, i.focus, i.blurScope, e), i.focus === "self" && Cu(i.componentMainType, i.componentIndex, e), Bc(r, t));
}
function HS(r, t, e) {
  Tg(e);
  var i = tt(r), n = Of(i.componentMainType, i.componentIndex, i.componentHighDownName, e).dispatchers;
  n ? C(n, function(a) {
    return Fc(a, t);
  }) : Fc(r, t);
}
function $S(r, t, e) {
  if (Au(t)) {
    var i = t.dataType, n = r.getData(i), a = qr(n, t);
    N(a) || (a = [a]), r[t.type === Rn ? "toggleSelect" : t.type === En ? "select" : "unselect"](a, i);
  }
}
function zc(r) {
  var t = r.getAllData();
  C(t, function(e) {
    var i = e.data, n = e.type;
    i.eachItemGraphicEl(function(a, o) {
      r.isSelected(o, n) ? wg(a) : bg(a);
    });
  });
}
function VS(r) {
  var t = [];
  return r.eachSeries(function(e) {
    var i = e.getAllData();
    C(i, function(n) {
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
function Du(r, t, e) {
  Cg(r, !0), $e(r, BS), WS(r, t, e);
}
function GS(r) {
  Cg(r, !1);
}
function Po(r, t, e, i) {
  i ? GS(r) : Du(r, t, e);
}
function WS(r, t, e) {
  var i = tt(r);
  t != null ? (i.focus = t, i.blurScope = e) : i.focus && (i.focus = null);
}
var Hc = ["emphasis", "blur", "select"], US = {
  itemStyle: "getItemStyle",
  lineStyle: "getLineStyle",
  areaStyle: "getAreaStyle"
};
function $c(r, t, e, i) {
  e = e || "itemStyle";
  for (var n = 0; n < Hc.length; n++) {
    var a = Hc[n], o = t.getModel([a, e]), s = r.ensureState(a);
    s.style = o[US[e]]();
  }
}
function Cg(r, t) {
  var e = t === !1, i = r;
  r.highDownSilentOnTouch && (i.__highDownSilentOnTouch = r.highDownSilentOnTouch), (!e || i.__highDownDispatcher) && (i.__highByOuter = i.__highByOuter || 0, i.__highDownDispatcher = !e);
}
function Mu(r) {
  return !!(r && r.__highDownDispatcher);
}
function YS(r) {
  var t = Rc[r];
  return t == null && Ec <= 32 && (t = Rc[r] = Ec++), t;
}
function Au(r) {
  var t = r.type;
  return t === En || t === co || t === Rn;
}
function Vc(r) {
  var t = r.type;
  return t === Gr || t === ho;
}
function XS(r) {
  var t = gg(r);
  t.normalFill = r.style.fill, t.normalStroke = r.style.stroke;
  var e = r.states.select || {};
  t.selectFill = e.style && e.style.fill || null, t.selectStroke = e.style && e.style.stroke || null;
}
var ui = Kr.CMD, ZS = [[], [], []], Gc = Math.sqrt, qS = Math.atan2;
function KS(r, t) {
  if (t) {
    var e = r.data, i = r.len(), n, a, o, s, l, u, f = ui.M, h = ui.C, v = ui.L, c = ui.R, d = ui.A, y = ui.Q;
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
          var g = t[4], p = t[5], m = Gc(t[0] * t[0] + t[1] * t[1]), _ = Gc(t[2] * t[2] + t[3] * t[3]), S = qS(-t[1] / _, t[0] / m);
          e[o] *= m, e[o++] += g, e[o] *= _, e[o++] += p, e[o++] *= m, e[o++] *= _, e[o++] += S, e[o++] += S, o += 2, s = o;
          break;
        case c:
          u[0] = e[o++], u[1] = e[o++], ae(u, u, t), e[s++] = u[0], e[s++] = u[1], u[0] += e[o++], u[1] += e[o++], ae(u, u, t), e[s++] = u[0], e[s++] = u[1];
      }
      for (l = 0; l < a; l++) {
        var b = ZS[l];
        b[0] = e[o++], b[1] = e[o++], ae(b, b, t), e[s++] = b[0], e[s++] = b[1];
      }
    }
    r.increaseVersion();
  }
}
var hl = Math.sqrt, Aa = Math.sin, La = Math.cos, an = Math.PI;
function Wc(r) {
  return Math.sqrt(r[0] * r[0] + r[1] * r[1]);
}
function Lu(r, t) {
  return (r[0] * t[0] + r[1] * t[1]) / (Wc(r) * Wc(t));
}
function Uc(r, t) {
  return (r[0] * t[1] < r[1] * t[0] ? -1 : 1) * Math.acos(Lu(r, t));
}
function Yc(r, t, e, i, n, a, o, s, l, u, f) {
  var h = l * (an / 180), v = La(h) * (r - e) / 2 + Aa(h) * (t - i) / 2, c = -1 * Aa(h) * (r - e) / 2 + La(h) * (t - i) / 2, d = v * v / (o * o) + c * c / (s * s);
  d > 1 && (o *= hl(d), s *= hl(d));
  var y = (n === a ? -1 : 1) * hl((o * o * (s * s) - o * o * (c * c) - s * s * (v * v)) / (o * o * (c * c) + s * s * (v * v))) || 0, g = y * o * c / s, p = y * -s * v / o, m = (r + e) / 2 + La(h) * g - Aa(h) * p, _ = (t + i) / 2 + Aa(h) * g + La(h) * p, S = Uc([1, 0], [(v - g) / o, (c - p) / s]), b = [(v - g) / o, (c - p) / s], w = [(-1 * v - g) / o, (-1 * c - p) / s], x = Uc(b, w);
  if (Lu(b, w) <= -1 && (x = an), Lu(b, w) >= 1 && (x = 0), x < 0) {
    var T = Math.round(x / an * 1e6) / 1e6;
    x = an * 2 + T % 2 * an;
  }
  f.addData(u, m, _, o, s, S, x, h, a);
}
var QS = /([mlvhzcqtsa])([^mlvhzcqtsa]*)/ig, jS = /-?([0-9]*\.)?[0-9]+([eE]-?[0-9]+)?/g;
function JS(r) {
  var t = new Kr();
  if (!r)
    return t;
  var e = 0, i = 0, n = e, a = i, o, s = Kr.CMD, l = r.match(QS);
  if (!l)
    return t;
  for (var u = 0; u < l.length; u++) {
    for (var f = l[u], h = f.charAt(0), v = void 0, c = f.match(jS) || [], d = c.length, y = 0; y < d; y++)
      c[y] = parseFloat(c[y]);
    for (var g = 0; g < d; ) {
      var p = void 0, m = void 0, _ = void 0, S = void 0, b = void 0, w = void 0, x = void 0, T = e, D = i, A = void 0, M = void 0;
      switch (h) {
        case "l":
          e += c[g++], i += c[g++], v = s.L, t.addData(v, e, i);
          break;
        case "L":
          e = c[g++], i = c[g++], v = s.L, t.addData(v, e, i);
          break;
        case "m":
          e += c[g++], i += c[g++], v = s.M, t.addData(v, e, i), n = e, a = i, h = "l";
          break;
        case "M":
          e = c[g++], i = c[g++], v = s.M, t.addData(v, e, i), n = e, a = i, h = "L";
          break;
        case "h":
          e += c[g++], v = s.L, t.addData(v, e, i);
          break;
        case "H":
          e = c[g++], v = s.L, t.addData(v, e, i);
          break;
        case "v":
          i += c[g++], v = s.L, t.addData(v, e, i);
          break;
        case "V":
          i = c[g++], v = s.L, t.addData(v, e, i);
          break;
        case "C":
          v = s.C, t.addData(v, c[g++], c[g++], c[g++], c[g++], c[g++], c[g++]), e = c[g - 2], i = c[g - 1];
          break;
        case "c":
          v = s.C, t.addData(v, c[g++] + e, c[g++] + i, c[g++] + e, c[g++] + i, c[g++] + e, c[g++] + i), e += c[g - 2], i += c[g - 1];
          break;
        case "S":
          p = e, m = i, A = t.len(), M = t.data, o === s.C && (p += e - M[A - 4], m += i - M[A - 3]), v = s.C, T = c[g++], D = c[g++], e = c[g++], i = c[g++], t.addData(v, p, m, T, D, e, i);
          break;
        case "s":
          p = e, m = i, A = t.len(), M = t.data, o === s.C && (p += e - M[A - 4], m += i - M[A - 3]), v = s.C, T = e + c[g++], D = i + c[g++], e += c[g++], i += c[g++], t.addData(v, p, m, T, D, e, i);
          break;
        case "Q":
          T = c[g++], D = c[g++], e = c[g++], i = c[g++], v = s.Q, t.addData(v, T, D, e, i);
          break;
        case "q":
          T = c[g++] + e, D = c[g++] + i, e += c[g++], i += c[g++], v = s.Q, t.addData(v, T, D, e, i);
          break;
        case "T":
          p = e, m = i, A = t.len(), M = t.data, o === s.Q && (p += e - M[A - 4], m += i - M[A - 3]), e = c[g++], i = c[g++], v = s.Q, t.addData(v, p, m, e, i);
          break;
        case "t":
          p = e, m = i, A = t.len(), M = t.data, o === s.Q && (p += e - M[A - 4], m += i - M[A - 3]), e += c[g++], i += c[g++], v = s.Q, t.addData(v, p, m, e, i);
          break;
        case "A":
          _ = c[g++], S = c[g++], b = c[g++], w = c[g++], x = c[g++], T = e, D = i, e = c[g++], i = c[g++], v = s.A, Yc(T, D, e, i, w, x, _, S, b, v, t);
          break;
        case "a":
          _ = c[g++], S = c[g++], b = c[g++], w = c[g++], x = c[g++], T = e, D = i, e += c[g++], i += c[g++], v = s.A, Yc(T, D, e, i, w, x, _, S, b, v, t);
          break;
      }
    }
    (h === "z" || h === "Z") && (v = s.Z, t.addData(v), e = n, i = a), o = v;
  }
  return t.toStatic(), t;
}
var Dg = (function(r) {
  O(t, r);
  function t() {
    return r !== null && r.apply(this, arguments) || this;
  }
  return t.prototype.applyTransform = function(e) {
  }, t;
})(ot);
function Mg(r) {
  return r.setData != null;
}
function Ag(r, t) {
  var e = JS(r), i = k({}, t);
  return i.buildPath = function(n) {
    if (Mg(n)) {
      n.setData(e.data);
      var a = n.getContext();
      a && n.rebuildPath(a, 1);
    } else {
      var a = n;
      e.rebuildPath(a, 1);
    }
  }, i.applyTransform = function(n) {
    KS(e, n), this.dirtyShape();
  }, i;
}
function tw(r, t) {
  return new Dg(Ag(r, t));
}
function ew(r, t) {
  var e = Ag(r, t), i = (function(n) {
    O(a, n);
    function a(o) {
      var s = n.call(this, o) || this;
      return s.applyTransform = e.applyTransform, s.buildPath = e.buildPath, s;
    }
    return a;
  })(Dg);
  return i;
}
function rw(r, t) {
  for (var e = [], i = r.length, n = 0; n < i; n++) {
    var a = r[n];
    e.push(a.getUpdatedPathProxy(!0));
  }
  var o = new ot(t);
  return o.createPathProxy(), o.buildPath = function(s) {
    if (Mg(s)) {
      s.appendPath(e);
      var l = s.getContext();
      l && s.rebuildPath(l, 1);
    }
  }, o;
}
var iw = /* @__PURE__ */ (function() {
  function r() {
    this.cx = 0, this.cy = 0, this.r = 0;
  }
  return r;
})(), is = (function(r) {
  O(t, r);
  function t(e) {
    return r.call(this, e) || this;
  }
  return t.prototype.getDefaultShape = function() {
    return new iw();
  }, t.prototype.buildPath = function(e, i) {
    e.moveTo(i.cx + i.r, i.cy), e.arc(i.cx, i.cy, i.r, 0, Math.PI * 2);
  }, t;
})(ot);
is.prototype.type = "circle";
var nw = /* @__PURE__ */ (function() {
  function r() {
    this.cx = 0, this.cy = 0, this.rx = 0, this.ry = 0;
  }
  return r;
})(), Nf = (function(r) {
  O(t, r);
  function t(e) {
    return r.call(this, e) || this;
  }
  return t.prototype.getDefaultShape = function() {
    return new nw();
  }, t.prototype.buildPath = function(e, i) {
    var n = 0.5522848, a = i.cx, o = i.cy, s = i.rx, l = i.ry, u = s * n, f = l * n;
    e.moveTo(a - s, o), e.bezierCurveTo(a - s, o - f, a - u, o - l, a, o - l), e.bezierCurveTo(a + u, o - l, a + s, o - f, a + s, o), e.bezierCurveTo(a + s, o + f, a + u, o + l, a, o + l), e.bezierCurveTo(a - u, o + l, a - s, o + f, a - s, o), e.closePath();
  }, t;
})(ot);
Nf.prototype.type = "ellipse";
var Lg = Math.PI, cl = Lg * 2, Ar = Math.sin, fi = Math.cos, aw = Math.acos, Mt = Math.atan2, Xc = Math.abs, kn = Math.sqrt, wn = Math.max, we = Math.min, he = 1e-4;
function ow(r, t, e, i, n, a, o, s) {
  var l = e - r, u = i - t, f = o - n, h = s - a, v = h * l - f * u;
  if (!(v * v < he))
    return v = (f * (t - a) - h * (r - n)) / v, [r + v * l, t + v * u];
}
function Pa(r, t, e, i, n, a, o) {
  var s = r - e, l = t - i, u = (o ? a : -a) / kn(s * s + l * l), f = u * l, h = -u * s, v = r + f, c = t + h, d = e + f, y = i + h, g = (v + d) / 2, p = (c + y) / 2, m = d - v, _ = y - c, S = m * m + _ * _, b = n - a, w = v * y - d * c, x = (_ < 0 ? -1 : 1) * kn(wn(0, b * b * S - w * w)), T = (w * _ - m * x) / S, D = (-w * m - _ * x) / S, A = (w * _ + m * x) / S, M = (-w * m + _ * x) / S, L = T - g, P = D - p, I = A - g, E = M - p;
  return L * L + P * P > I * I + E * E && (T = A, D = M), {
    cx: T,
    cy: D,
    x0: -f,
    y0: -h,
    x1: T * (n / b - 1),
    y1: D * (n / b - 1)
  };
}
function sw(r) {
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
function lw(r, t) {
  var e, i = wn(t.r, 0), n = wn(t.r0 || 0, 0), a = i > 0, o = n > 0;
  if (!(!a && !o)) {
    if (a || (i = n, n = 0), n > i) {
      var s = i;
      i = n, n = s;
    }
    var l = t.startAngle, u = t.endAngle;
    if (!(isNaN(l) || isNaN(u))) {
      var f = t.cx, h = t.cy, v = !!t.clockwise, c = Xc(u - l), d = c > cl && c % cl;
      if (d > he && (c = d), !(i > he))
        r.moveTo(f, h);
      else if (c > cl - he)
        r.moveTo(f + i * fi(l), h + i * Ar(l)), r.arc(f, h, i, l, u, !v), n > he && (r.moveTo(f + n * fi(u), h + n * Ar(u)), r.arc(f, h, n, u, l, v));
      else {
        var y = void 0, g = void 0, p = void 0, m = void 0, _ = void 0, S = void 0, b = void 0, w = void 0, x = void 0, T = void 0, D = void 0, A = void 0, M = void 0, L = void 0, P = void 0, I = void 0, E = i * fi(l), R = i * Ar(l), W = n * fi(u), B = n * Ar(u), F = c > he;
        if (F) {
          var G = t.cornerRadius;
          G && (e = sw(G), y = e[0], g = e[1], p = e[2], m = e[3]);
          var it = Xc(i - n) / 2;
          if (_ = we(it, p), S = we(it, m), b = we(it, y), w = we(it, g), D = x = wn(_, S), A = T = wn(b, w), (x > he || T > he) && (M = i * fi(u), L = i * Ar(u), P = n * fi(l), I = n * Ar(l), c < Lg)) {
            var j = ow(E, R, P, I, M, L, W, B);
            if (j) {
              var ft = E - j[0], ht = R - j[1], dt = M - j[0], le = L - j[1], hr = 1 / Ar(aw((ft * dt + ht * le) / (kn(ft * ft + ht * ht) * kn(dt * dt + le * le))) / 2), ri = kn(j[0] * j[0] + j[1] * j[1]);
              D = we(x, (i - ri) / (hr + 1)), A = we(T, (n - ri) / (hr - 1));
            }
          }
        }
        if (!F)
          r.moveTo(f + E, h + R);
        else if (D > he) {
          var Ut = we(p, D), xt = we(m, D), Y = Pa(P, I, E, R, i, Ut, v), K = Pa(M, L, W, B, i, xt, v);
          r.moveTo(f + Y.cx + Y.x0, h + Y.cy + Y.y0), D < x && Ut === xt ? r.arc(f + Y.cx, h + Y.cy, D, Mt(Y.y0, Y.x0), Mt(K.y0, K.x0), !v) : (Ut > 0 && r.arc(f + Y.cx, h + Y.cy, Ut, Mt(Y.y0, Y.x0), Mt(Y.y1, Y.x1), !v), r.arc(f, h, i, Mt(Y.cy + Y.y1, Y.cx + Y.x1), Mt(K.cy + K.y1, K.cx + K.x1), !v), xt > 0 && r.arc(f + K.cx, h + K.cy, xt, Mt(K.y1, K.x1), Mt(K.y0, K.x0), !v));
        } else
          r.moveTo(f + E, h + R), r.arc(f, h, i, l, u, !v);
        if (!(n > he) || !F)
          r.lineTo(f + W, h + B);
        else if (A > he) {
          var Ut = we(y, A), xt = we(g, A), Y = Pa(W, B, M, L, n, -xt, v), K = Pa(E, R, P, I, n, -Ut, v);
          r.lineTo(f + Y.cx + Y.x0, h + Y.cy + Y.y0), A < T && Ut === xt ? r.arc(f + Y.cx, h + Y.cy, A, Mt(Y.y0, Y.x0), Mt(K.y0, K.x0), !v) : (xt > 0 && r.arc(f + Y.cx, h + Y.cy, xt, Mt(Y.y0, Y.x0), Mt(Y.y1, Y.x1), !v), r.arc(f, h, n, Mt(Y.cy + Y.y1, Y.cx + Y.x1), Mt(K.cy + K.y1, K.cx + K.x1), v), Ut > 0 && r.arc(f + K.cx, h + K.cy, Ut, Mt(K.y1, K.x1), Mt(K.y0, K.x0), !v));
        } else
          r.lineTo(f + W, h + B), r.arc(f, h, n, u, l, v);
      }
      r.closePath();
    }
  }
}
var uw = /* @__PURE__ */ (function() {
  function r() {
    this.cx = 0, this.cy = 0, this.r0 = 0, this.r = 0, this.startAngle = 0, this.endAngle = Math.PI * 2, this.clockwise = !0, this.cornerRadius = 0;
  }
  return r;
})(), ns = (function(r) {
  O(t, r);
  function t(e) {
    return r.call(this, e) || this;
  }
  return t.prototype.getDefaultShape = function() {
    return new uw();
  }, t.prototype.buildPath = function(e, i) {
    lw(e, i);
  }, t.prototype.isZeroArea = function() {
    return this.shape.startAngle === this.shape.endAngle || this.shape.r === this.shape.r0;
  }, t;
})(ot);
ns.prototype.type = "sector";
var fw = /* @__PURE__ */ (function() {
  function r() {
    this.cx = 0, this.cy = 0, this.r = 0, this.r0 = 0;
  }
  return r;
})(), Bf = (function(r) {
  O(t, r);
  function t(e) {
    return r.call(this, e) || this;
  }
  return t.prototype.getDefaultShape = function() {
    return new fw();
  }, t.prototype.buildPath = function(e, i) {
    var n = i.cx, a = i.cy, o = Math.PI * 2;
    e.moveTo(n + i.r, a), e.arc(n, a, i.r, 0, o, !1), e.moveTo(n + i.r0, a), e.arc(n, a, i.r0, 0, o, !0);
  }, t;
})(ot);
Bf.prototype.type = "ring";
function hw(r, t, e, i) {
  var n = [], a = [], o = [], s = [], l, u, f, h;
  if (i) {
    f = [1 / 0, 1 / 0], h = [-1 / 0, -1 / 0];
    for (var v = 0, c = r.length; v < c; v++)
      wi(f, f, r[v]), bi(h, h, r[v]);
    wi(f, f, i[0]), bi(h, h, i[1]);
  }
  for (var v = 0, c = r.length; v < c; v++) {
    var d = r[v];
    if (e)
      l = r[v ? v - 1 : c - 1], u = r[(v + 1) % c];
    else if (v === 0 || v === c - 1) {
      n.push(K_(r[v]));
      continue;
    } else
      l = r[v - 1], u = r[v + 1];
    Ep(a, u, l), Ps(a, a, t);
    var y = au(d, l), g = au(d, u), p = y + g;
    p !== 0 && (y /= p, g /= p), Ps(o, a, -y), Ps(s, a, g);
    var m = Nh([], d, o), _ = Nh([], d, s);
    i && (bi(m, m, f), wi(m, m, h), bi(_, _, f), wi(_, _, h)), n.push(m), n.push(_);
  }
  return e && n.push(n.shift()), n;
}
function Pg(r, t, e) {
  var i = t.smooth, n = t.points;
  if (n && n.length >= 2) {
    if (i) {
      var a = hw(n, i, e, t.smoothConstraint);
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
var cw = /* @__PURE__ */ (function() {
  function r() {
    this.points = null, this.smooth = 0, this.smoothConstraint = null;
  }
  return r;
})(), Ff = (function(r) {
  O(t, r);
  function t(e) {
    return r.call(this, e) || this;
  }
  return t.prototype.getDefaultShape = function() {
    return new cw();
  }, t.prototype.buildPath = function(e, i) {
    Pg(e, i, !0);
  }, t;
})(ot);
Ff.prototype.type = "polygon";
var vw = /* @__PURE__ */ (function() {
  function r() {
    this.points = null, this.percent = 1, this.smooth = 0, this.smoothConstraint = null;
  }
  return r;
})(), zf = (function(r) {
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
    return new vw();
  }, t.prototype.buildPath = function(e, i) {
    Pg(e, i, !1);
  }, t;
})(ot);
zf.prototype.type = "polyline";
var dw = {}, pw = /* @__PURE__ */ (function() {
  function r() {
    this.x1 = 0, this.y1 = 0, this.x2 = 0, this.y2 = 0, this.percent = 1;
  }
  return r;
})(), ze = (function(r) {
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
    return new pw();
  }, t.prototype.buildPath = function(e, i) {
    var n, a, o, s;
    if (this.subPixelOptimize) {
      var l = dg(dw, i, this.style);
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
})(ot);
ze.prototype.type = "line";
var kt = [], gw = /* @__PURE__ */ (function() {
  function r() {
    this.x1 = 0, this.y1 = 0, this.x2 = 0, this.y2 = 0, this.cpx1 = 0, this.cpy1 = 0, this.percent = 1;
  }
  return r;
})();
function Zc(r, t, e) {
  var i = r.cpx2, n = r.cpy2;
  return i != null || n != null ? [
    (e ? Xh : Ct)(r.x1, r.cpx1, r.cpx2, r.x2, t),
    (e ? Xh : Ct)(r.y1, r.cpy1, r.cpy2, r.y2, t)
  ] : [
    (e ? Zh : Bt)(r.x1, r.cpx1, r.x2, t),
    (e ? Zh : Bt)(r.y1, r.cpy1, r.y2, t)
  ];
}
var as = (function(r) {
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
    return new gw();
  }, t.prototype.buildPath = function(e, i) {
    var n = i.x1, a = i.y1, o = i.x2, s = i.y2, l = i.cpx1, u = i.cpy1, f = i.cpx2, h = i.cpy2, v = i.percent;
    v !== 0 && (e.moveTo(n, a), f == null || h == null ? (v < 1 && (To(n, l, o, v, kt), l = kt[1], o = kt[2], To(a, u, s, v, kt), u = kt[1], s = kt[2]), e.quadraticCurveTo(l, u, o, s)) : (v < 1 && (xo(n, l, f, o, v, kt), l = kt[1], f = kt[2], o = kt[3], xo(a, u, h, s, v, kt), u = kt[1], h = kt[2], s = kt[3]), e.bezierCurveTo(l, u, f, h, o, s)));
  }, t.prototype.pointAt = function(e) {
    return Zc(this.shape, e, !1);
  }, t.prototype.tangentAt = function(e) {
    var i = Zc(this.shape, e, !0);
    return mf(i, i);
  }, t;
})(ot);
as.prototype.type = "bezier-curve";
var yw = /* @__PURE__ */ (function() {
  function r() {
    this.cx = 0, this.cy = 0, this.r = 0, this.startAngle = 0, this.endAngle = Math.PI * 2, this.clockwise = !0;
  }
  return r;
})(), os = (function(r) {
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
    return new yw();
  }, t.prototype.buildPath = function(e, i) {
    var n = i.cx, a = i.cy, o = Math.max(i.r, 0), s = i.startAngle, l = i.endAngle, u = i.clockwise, f = Math.cos(s), h = Math.sin(s);
    e.moveTo(f * o + n, h * o + a), e.arc(n, a, o, s, l, !u);
  }, t;
})(ot);
os.prototype.type = "arc";
var mw = (function(r) {
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
    return this._updatePathDirty.call(this), ot.prototype.getBoundingRect.call(this);
  }, t;
})(ot), Ig = (function() {
  function r(t) {
    this.colorStops = t || [];
  }
  return r.prototype.addColorStop = function(t, e) {
    this.colorStops.push({
      offset: t,
      color: e
    });
  }, r;
})(), Eg = (function(r) {
  O(t, r);
  function t(e, i, n, a, o, s) {
    var l = r.call(this, o) || this;
    return l.x = e ?? 0, l.y = i ?? 0, l.x2 = n ?? 1, l.y2 = a ?? 0, l.type = "linear", l.global = s || !1, l;
  }
  return t;
})(Ig), _w = (function(r) {
  O(t, r);
  function t(e, i, n, a, o) {
    var s = r.call(this, a) || this;
    return s.x = e ?? 0.5, s.y = i ?? 0.5, s.r = n ?? 0.5, s.type = "radial", s.global = o || !1, s;
  }
  return t;
})(Ig), Lr = [0, 0], Pr = [0, 0], Ia = new st(), Ea = new st(), Io = (function() {
  function r(t, e) {
    this._corners = [], this._axes = [], this._origin = [0, 0];
    for (var i = 0; i < 4; i++)
      this._corners[i] = new st();
    for (var i = 0; i < 2; i++)
      this._axes[i] = new st();
    t && this.fromBoundingRect(t, e);
  }
  return r.prototype.fromBoundingRect = function(t, e) {
    var i = this._corners, n = this._axes, a = t.x, o = t.y, s = a + t.width, l = o + t.height;
    if (i[0].set(a, o), i[1].set(s, o), i[2].set(s, l), i[3].set(a, l), e)
      for (var u = 0; u < 4; u++)
        i[u].transform(e);
    st.sub(n[0], i[1], i[0]), st.sub(n[1], i[3], i[0]), n[0].normalize(), n[1].normalize();
    for (var u = 0; u < 2; u++)
      this._origin[u] = n[u].dot(i[0]);
  }, r.prototype.intersect = function(t, e) {
    var i = !0, n = !e;
    return Ia.set(1 / 0, 1 / 0), Ea.set(0, 0), !this._intersectCheckOneSide(this, t, Ia, Ea, n, 1) && (i = !1, n) || !this._intersectCheckOneSide(t, this, Ia, Ea, n, -1) && (i = !1, n) || n || st.copy(e, i ? Ia : Ea), i;
  }, r.prototype._intersectCheckOneSide = function(t, e, i, n, a, o) {
    for (var s = !0, l = 0; l < 2; l++) {
      var u = this._axes[l];
      if (this._getProjMinMaxOnAxis(l, t._corners, Lr), this._getProjMinMaxOnAxis(l, e._corners, Pr), Lr[1] < Pr[0] || Lr[0] > Pr[1]) {
        if (s = !1, a)
          return s;
        var f = Math.abs(Pr[0] - Lr[1]), h = Math.abs(Lr[0] - Pr[1]);
        Math.min(f, h) > n.len() && (f < h ? st.scale(n, u, -f * o) : st.scale(n, u, h * o));
      } else if (i) {
        var f = Math.abs(Pr[0] - Lr[1]), h = Math.abs(Lr[0] - Pr[1]);
        Math.min(f, h) < i.len() && (f < h ? st.scale(i, u, f * o) : st.scale(i, u, -h * o));
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
})(), Sw = [], ww = (function(r) {
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
      for (var e = new rt(1 / 0, 1 / 0, -1 / 0, -1 / 0), i = 0; i < this._displayables.length; i++) {
        var n = this._displayables[i], a = n.getBoundingRect().clone();
        n.needLocalTransform() && a.applyTransform(n.getLocalTransform(Sw)), e.union(a);
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
})(ca), bw = gt();
function xw(r, t, e, i, n) {
  var a;
  if (t && t.ecModel) {
    var o = t.ecModel.getUpdatePayload();
    a = o && o.animation;
  }
  var s = t && t.isAnimationEnabled(), l = r === "update";
  if (s) {
    var u = void 0, f = void 0, h = void 0;
    i ? (u = X(i.duration, 200), f = X(i.easing, "cubicOut"), h = 0) : (u = t.getShallow(l ? "animationDurationUpdate" : "animationDuration"), f = t.getShallow(l ? "animationEasingUpdate" : "animationEasing"), h = t.getShallow(l ? "animationDelayUpdate" : "animationDelay")), a && (a.duration != null && (u = a.duration), a.easing != null && (f = a.easing), a.delay != null && (h = a.delay)), $(h) && (h = h(e, n)), $(u) && (u = u(e));
    var v = {
      duration: u || 0,
      delay: h,
      easing: f
    };
    return v;
  } else
    return null;
}
function Hf(r, t, e, i, n, a, o) {
  var s = !1, l;
  $(n) ? (o = a, a = n, n = null) : V(n) && (a = n.cb, o = n.during, s = n.isFrom, l = n.removeOpt, n = n.dataIndex);
  var u = r === "leave";
  u || t.stopAnimation("leave");
  var f = xw(r, i, n, u ? l || {} : null, i && i.getAnimationDelayParams ? i.getAnimationDelayParams(t, n) : null);
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
function He(r, t, e, i, n, a) {
  Hf("update", r, t, e, i, n, a);
}
function Ui(r, t, e, i, n, a) {
  Hf("enter", r, t, e, i, n, a);
}
function On(r) {
  if (!r.__zr)
    return !0;
  for (var t = 0; t < r.animators.length; t++) {
    var e = r.animators[t];
    if (e.scope === "leave")
      return !0;
  }
  return !1;
}
function Eo(r, t, e, i, n, a) {
  On(r) || Hf("leave", r, t, e, i, n, a);
}
function qc(r, t, e, i) {
  r.removeTextContent(), r.removeTextGuideLine(), Eo(r, {
    style: {
      opacity: 0
    }
  }, t, e, i);
}
function Tw(r, t, e) {
  function i() {
    r.parent && r.parent.remove(r);
  }
  r.isGroup ? r.traverse(function(n) {
    n.isGroup || qc(n, t, e, i);
  }) : qc(r, t, e, i);
}
function Cw(r) {
  bw(r).oldStyle = r.style;
}
var Ro = Math.max, ko = Math.min, Pu = {};
function Dw(r) {
  return ot.extend(r);
}
var Mw = ew;
function Aw(r, t) {
  return Mw(r, t);
}
function ye(r, t) {
  Pu[r] = t;
}
function Lw(r) {
  if (Pu.hasOwnProperty(r))
    return Pu[r];
}
function $f(r, t, e, i) {
  var n = tw(r, t);
  return e && (i === "center" && (e = kg(e, n.getBoundingRect())), Og(n, e)), n;
}
function Rg(r, t, e) {
  var i = new fr({
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
        i.setStyle(kg(t, a));
      }
    }
  });
  return i;
}
function kg(r, t) {
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
var Pw = rw;
function Og(r, t) {
  if (r.applyTransform) {
    var e = r.getBoundingRect(), i = e.calculateTransform(t);
    r.applyTransform(i);
  }
}
function Jn(r, t) {
  return dg(r, r, {
    lineWidth: t
  }), r;
}
function Iw(r) {
  return pg(r.shape, r.shape, r.style), r;
}
var Ew = Fr;
function Rw(r, t) {
  for (var e = Sf([]); r && r !== t; )
    Ai(e, r.getLocalTransform(), e), r = r.parent;
  return e;
}
function Vf(r, t, e) {
  return t && !$t(t) && (t = Tf.getLocalTransform(t)), e && (t = bf([], t)), ae([], r, t);
}
function kw(r, t, e) {
  var i = t[4] === 0 || t[5] === 0 || t[0] === 0 ? 1 : Math.abs(2 * t[4] / t[0]), n = t[4] === 0 || t[5] === 0 || t[2] === 0 ? 1 : Math.abs(2 * t[4] / t[2]), a = [r === "left" ? -i : r === "right" ? i : 0, r === "top" ? -n : r === "bottom" ? n : 0];
  return a = Vf(a, t, e), Math.abs(a[0]) > Math.abs(a[1]) ? a[0] > 0 ? "right" : "left" : a[1] > 0 ? "bottom" : "top";
}
function Kc(r) {
  return !r.isGroup;
}
function Ow(r) {
  return r.shape != null;
}
function Ng(r, t, e) {
  if (!r || !t)
    return;
  function i(o) {
    var s = {};
    return o.traverse(function(l) {
      Kc(l) && l.anid && (s[l.anid] = l);
    }), s;
  }
  function n(o) {
    var s = {
      x: o.x,
      y: o.y,
      rotation: o.rotation
    };
    return Ow(o) && (s.shape = k({}, o.shape)), s;
  }
  var a = i(r);
  t.traverse(function(o) {
    if (Kc(o) && o.anid) {
      var s = a[o.anid];
      if (s) {
        var l = n(o);
        o.attr(n(s)), He(o, l, e, tt(o).dataIndex);
      }
    }
  });
}
function Nw(r, t) {
  return H(r, function(e) {
    var i = e[0];
    i = Ro(i, t.x), i = ko(i, t.x + t.width);
    var n = e[1];
    return n = Ro(n, t.y), n = ko(n, t.y + t.height), [i, n];
  });
}
function Bw(r, t) {
  var e = Ro(r.x, t.x), i = ko(r.x + r.width, t.x + t.width), n = Ro(r.y, t.y), a = ko(r.y + r.height, t.y + t.height);
  if (i >= e && a >= n)
    return {
      x: e,
      y: n,
      width: i - e,
      height: a - n
    };
}
function Gf(r, t, e) {
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
    return r.indexOf("image://") === 0 ? (n.image = r.slice(8), at(n, e), new fr(i)) : $f(r.replace("path://", ""), i, e, "center");
}
function Fw(r, t, e, i, n) {
  for (var a = 0, o = n[n.length - 1]; a < n.length; a++) {
    var s = n[a];
    if (Bg(r, t, e, i, s[0], s[1], o[0], o[1]))
      return !0;
    o = s;
  }
}
function Bg(r, t, e, i, n, a, o, s) {
  var l = e - r, u = i - t, f = o - n, h = s - a, v = vl(f, h, l, u);
  if (zw(v))
    return !1;
  var c = r - n, d = t - a, y = vl(c, d, l, u) / v;
  if (y < 0 || y > 1)
    return !1;
  var g = vl(c, d, f, h) / v;
  return !(g < 0 || g > 1);
}
function vl(r, t, e, i) {
  return r * i - e * t;
}
function zw(r) {
  return r <= 1e-6 && r >= -1e-6;
}
function ss(r) {
  var t = r.itemTooltipOption, e = r.componentModel, i = r.itemName, n = z(t) ? {
    formatter: t
  } : t, a = e.mainType, o = e.componentIndex, s = {
    componentType: a,
    name: i,
    $vars: ["name"]
  };
  s[a + "Index"] = o;
  var l = r.formatterParamsExtra;
  l && C(vt(l), function(f) {
    Xr(s, f) || (s[f] = l[f], s.$vars.push(f));
  });
  var u = tt(r.el);
  u.componentMainType = a, u.componentIndex = o, u.tooltipConfig = {
    name: i,
    option: at({
      content: i,
      encodeHTMLContent: !0,
      formatterParams: s
    }, n)
  };
}
function Qc(r, t) {
  var e;
  r.isGroup && (e = t(r)), e || r.traverse(t);
}
function ls(r, t) {
  if (r)
    if (N(r))
      for (var e = 0; e < r.length; e++)
        Qc(r[e], t);
    else
      Qc(r, t);
}
ye("circle", is);
ye("ellipse", Nf);
ye("sector", ns);
ye("ring", Bf);
ye("polygon", Ff);
ye("polyline", zf);
ye("rect", Dt);
ye("line", ze);
ye("bezierCurve", as);
ye("arc", os);
const Hw = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Arc: os,
  BezierCurve: as,
  BoundingRect: rt,
  Circle: is,
  CompoundPath: mw,
  Ellipse: Nf,
  Group: bt,
  Image: fr,
  IncrementalDisplayable: ww,
  Line: ze,
  LinearGradient: Eg,
  OrientedBoundingRect: Io,
  Path: ot,
  Point: st,
  Polygon: Ff,
  Polyline: zf,
  RadialGradient: _w,
  Rect: Dt,
  Ring: Bf,
  Sector: ns,
  Text: Gt,
  applyTransform: Vf,
  clipPointsByRect: Nw,
  clipRectByRect: Bw,
  createIcon: Gf,
  extendPath: Aw,
  extendShape: Dw,
  getShapeClass: Lw,
  getTransform: Rw,
  groupTransition: Ng,
  initProps: Ui,
  isElementRemoved: On,
  lineLineIntersect: Bg,
  linePolygonIntersect: Fw,
  makeImage: Rg,
  makePath: $f,
  mergePath: Pw,
  registerShape: ye,
  removeElement: Eo,
  removeElementWithFadeOut: Tw,
  resizePath: Og,
  setTooltipConfig: ss,
  subPixelOptimize: Ew,
  subPixelOptimizeLine: Jn,
  subPixelOptimizeRect: Iw,
  transformDirection: kw,
  traverseElements: ls,
  updateProps: He
}, Symbol.toStringTag, { value: "Module" }));
var us = {};
function $w(r, t) {
  for (var e = 0; e < oe.length; e++) {
    var i = oe[e], n = t[i], a = r.ensureState(i);
    a.style = a.style || {}, a.style.text = n;
  }
  var o = r.currentStates.slice();
  r.clearStates(!0), r.setStyle({
    text: t.normal
  }), r.useStates(o, !0);
}
function jc(r, t, e) {
  var i = r.labelFetcher, n = r.labelDataIndex, a = r.labelDimIndex, o = t.normal, s;
  i && (s = i.getFormattedLabel(n, "normal", null, a, o && o.get("formatter"), e != null ? {
    interpolatedValue: e
  } : null)), s == null && (s = $(r.defaultText) ? r.defaultText(n, r, e) : r.defaultText);
  for (var l = {
    normal: s
  }, u = 0; u < oe.length; u++) {
    var f = oe[u], h = t[f];
    l[f] = X(i ? i.getFormattedLabel(n, f, null, a, h && h.get("formatter")) : null, s);
  }
  return l;
}
function fs(r, t, e, i) {
  e = e || us;
  for (var n = r instanceof Gt, a = !1, o = 0; o < kc.length; o++) {
    var s = t[kc[o]];
    if (s && s.getShallow("show")) {
      a = !0;
      break;
    }
  }
  var l = n ? r : r.getTextContent();
  if (a) {
    n || (l || (l = new Gt(), r.setTextContent(l)), r.stateProxy && (l.stateProxy = r.stateProxy));
    var u = jc(e, t), f = t.normal, h = !!f.getShallow("show"), v = Fi(f, i && i.normal, e, !1, !n);
    v.text = u.normal, n || r.setTextConfig(Jc(f, e, !1));
    for (var o = 0; o < oe.length; o++) {
      var c = oe[o], s = t[c];
      if (s) {
        var d = l.ensureState(c), y = !!X(s.getShallow("show"), h);
        if (y !== h && (d.ignore = !y), d.style = Fi(s, i && i[c], e, !0, !n), d.style.text = u[c], !n) {
          var g = r.ensureState(c);
          g.textConfig = Jc(s, e, !0);
        }
      }
    }
    l.silent = !!f.getShallow("silent"), l.style.x != null && (v.x = l.style.x), l.style.y != null && (v.y = l.style.y), l.ignore = !h, l.useStyle(v), l.dirty(), e.enableTextSetter && (Fg(l).setLabelText = function(p) {
      var m = jc(e, t, p);
      $w(l, m);
    });
  } else l && (l.ignore = !0);
  r.dirty();
}
function va(r, t) {
  t = t || "label";
  for (var e = {
    normal: r.getModel(t)
  }, i = 0; i < oe.length; i++) {
    var n = oe[i];
    e[n] = r.getModel([n, t]);
  }
  return e;
}
function Fi(r, t, e, i, n) {
  var a = {};
  return Vw(a, r, e, i, n), t && k(a, t), a;
}
function Jc(r, t, e) {
  t = t || {};
  var i = {}, n, a = r.getShallow("rotate"), o = X(r.getShallow("distance"), e ? null : 5), s = r.getShallow("offset");
  return n = r.getShallow("position") || (e ? null : "inside"), n === "outside" && (n = t.defaultOutsidePosition || "top"), n != null && (i.position = n), s != null && (i.offset = s), a != null && (a *= Math.PI / 180, i.rotation = a), o != null && (i.distance = o), i.outsideFill = r.get("color") === "inherit" ? t.inheritColor || null : "auto", i;
}
function Vw(r, t, e, i, n) {
  e = e || us;
  var a = t.ecModel, o = a && a.option.textStyle, s = Gw(t), l;
  if (s) {
    l = {};
    for (var u in s)
      if (s.hasOwnProperty(u)) {
        var f = t.getModel(["rich", u]);
        iv(l[u] = {}, f, o, e, i, n, !1, !0);
      }
  }
  l && (r.rich = l);
  var h = t.get("overflow");
  h && (r.overflow = h);
  var v = t.get("minMargin");
  v != null && (r.margin = v), iv(r, t, o, e, i, n, !0, !1);
}
function Gw(r) {
  for (var t; r && r !== r.ecModel; ) {
    var e = (r.option || us).rich;
    if (e) {
      t = t || {};
      for (var i = vt(e), n = 0; n < i.length; n++) {
        var a = i[n];
        t[a] = 1;
      }
    }
    r = r.parentModel;
  }
  return t;
}
var tv = ["fontStyle", "fontWeight", "fontSize", "fontFamily", "textShadowColor", "textShadowBlur", "textShadowOffsetX", "textShadowOffsetY"], ev = ["align", "lineHeight", "width", "height", "tag", "verticalAlign", "ellipsis"], rv = ["padding", "borderWidth", "borderRadius", "borderDashOffset", "backgroundColor", "borderColor", "shadowColor", "shadowBlur", "shadowOffsetX", "shadowOffsetY"];
function iv(r, t, e, i, n, a, o, s) {
  e = !n && e || us;
  var l = i && i.inheritColor, u = t.getShallow("color"), f = t.getShallow("textBorderColor"), h = X(t.getShallow("opacity"), e.opacity);
  (u === "inherit" || u === "auto") && (l ? u = l : u = null), (f === "inherit" || f === "auto") && (l ? f = l : f = null), a || (u = u || e.color, f = f || e.textBorderColor), u != null && (r.fill = u), f != null && (r.stroke = f);
  var v = X(t.getShallow("textBorderWidth"), e.textBorderWidth);
  v != null && (r.lineWidth = v);
  var c = X(t.getShallow("textBorderType"), e.textBorderType);
  c != null && (r.lineDash = c);
  var d = X(t.getShallow("textBorderDashOffset"), e.textBorderDashOffset);
  d != null && (r.lineDashOffset = d), !n && h == null && !s && (h = i && i.defaultOpacity), h != null && (r.opacity = h), !n && !a && r.fill == null && i.inheritColor && (r.fill = i.inheritColor);
  for (var y = 0; y < tv.length; y++) {
    var g = tv[y], p = X(t.getShallow(g), e[g]);
    p != null && (r[g] = p);
  }
  for (var y = 0; y < ev.length; y++) {
    var g = ev[y], p = t.getShallow(g);
    p != null && (r[g] = p);
  }
  if (r.verticalAlign == null) {
    var m = t.getShallow("baseline");
    m != null && (r.verticalAlign = m);
  }
  if (!o || !i.disableBox) {
    for (var y = 0; y < rv.length; y++) {
      var g = rv[y], p = t.getShallow(g);
      p != null && (r[g] = p);
    }
    var _ = t.getShallow("borderType");
    _ != null && (r.borderDash = _), (r.backgroundColor === "auto" || r.backgroundColor === "inherit") && l && (r.backgroundColor = l), (r.borderColor === "auto" || r.borderColor === "inherit") && l && (r.borderColor = l);
  }
}
function Ww(r, t) {
  var e = t && t.getModel("textStyle");
  return xe([
    // FIXME in node-canvas fontWeight is before fontStyle
    r.fontStyle || e && e.getShallow("fontStyle") || "",
    r.fontWeight || e && e.getShallow("fontWeight") || "",
    (r.fontSize || e && e.getShallow("fontSize") || 12) + "px",
    r.fontFamily || e && e.getShallow("fontFamily") || "sans-serif"
  ].join(" "));
}
var Fg = gt(), Uw = ["textStyle", "color"], dl = ["fontStyle", "fontWeight", "fontSize", "fontFamily", "padding", "lineHeight", "rich", "width", "height", "overflow"], pl = new Gt(), Yw = (
  /** @class */
  (function() {
    function r() {
    }
    return r.prototype.getTextColor = function(t) {
      var e = this.ecModel;
      return this.getShallow("color") || (!t && e ? e.get(Uw) : null);
    }, r.prototype.getFont = function() {
      return Ww({
        fontStyle: this.getShallow("fontStyle"),
        fontWeight: this.getShallow("fontWeight"),
        fontSize: this.getShallow("fontSize"),
        fontFamily: this.getShallow("fontFamily")
      }, this.ecModel);
    }, r.prototype.getTextRect = function(t) {
      for (var e = {
        text: t,
        verticalAlign: this.getShallow("verticalAlign") || this.getShallow("baseline")
      }, i = 0; i < dl.length; i++)
        e[dl[i]] = this.getShallow(dl[i]);
      return pl.useStyle(e), pl.update(), pl.getBoundingRect();
    }, r;
  })()
), zg = [
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
], Xw = Kn(zg), Zw = (
  /** @class */
  (function() {
    function r() {
    }
    return r.prototype.getLineStyle = function(t) {
      return Xw(this, t);
    }, r;
  })()
), Hg = [
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
], qw = Kn(Hg), Kw = (
  /** @class */
  (function() {
    function r() {
    }
    return r.prototype.getItemStyle = function(t, e) {
      return qw(this, t, e);
    }, r;
  })()
), pt = (
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
      return new t(q(this.option));
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
Pf(pt);
O1(pt);
ge(pt, Zw);
ge(pt, Kw);
ge(pt, H1);
ge(pt, Yw);
var Qw = Math.round(Math.random() * 10);
function hs(r) {
  return [r || "", Qw++].join("_");
}
function jw(r) {
  var t = {};
  r.registerSubTypeDefaulter = function(e, i) {
    var n = Ce(e);
    t[n.main] = i;
  }, r.determineSubType = function(e, i) {
    var n = i.type;
    if (!n) {
      var a = Ce(e).main;
      r.hasSubTypes(e) && t[a] && (n = t[a](i));
    }
    return n;
  };
}
function Jw(r, t) {
  r.topologicalTravel = function(a, o, s, l) {
    if (!a.length)
      return;
    var u = e(o), f = u.graph, h = u.noEntryList, v = {};
    for (C(a, function(m) {
      v[m] = !0;
    }); h.length; ) {
      var c = h.pop(), d = f[c], y = !!v[c];
      y && (s.call(l, c, d.originalDeps.slice()), delete v[c]), C(d.successor, y ? p : g);
    }
    C(v, function() {
      var m = "";
      throw new Error(m);
    });
    function g(m) {
      f[m].entryCount--, f[m].entryCount === 0 && h.push(m);
    }
    function p(m) {
      v[m] = !0, g(m);
    }
  };
  function e(a) {
    var o = {}, s = [];
    return C(a, function(l) {
      var u = i(o, l), f = u.originalDeps = t(l), h = n(f, a);
      u.entryCount = h.length, u.entryCount === 0 && s.push(l), C(h, function(v) {
        et(u.predecessor, v) < 0 && u.predecessor.push(v);
        var c = i(o, v);
        et(c.successor, v) < 0 && c.successor.push(l);
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
    return C(a, function(l) {
      et(o, l) >= 0 && s.push(l);
    }), s;
  }
}
function tb(r, t) {
  return Q(Q({}, r, !0), t, !0);
}
const eb = {
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
}, rb = {
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
var Oo = "ZH", Wf = "EN", Pi = Wf, vo = {}, Uf = {}, $g = U.domSupported ? (function() {
  var r = (
    /* eslint-disable-next-line */
    (document.documentElement.lang || navigator.language || navigator.browserLanguage || Pi).toUpperCase()
  );
  return r.indexOf(Oo) > -1 ? Oo : Pi;
})() : Pi;
function Vg(r, t) {
  r = r.toUpperCase(), Uf[r] = new pt(t), vo[r] = t;
}
function ib(r) {
  if (z(r)) {
    var t = vo[r.toUpperCase()] || {};
    return r === Oo || r === Wf ? q(t) : Q(q(t), q(vo[Pi]), !1);
  } else
    return Q(q(r), q(vo[Pi]), !1);
}
function nb(r) {
  return Uf[r];
}
function ab() {
  return Uf[Pi];
}
Vg(Wf, eb);
Vg(Oo, rb);
var Yf = 1e3, Xf = Yf * 60, Nn = Xf * 60, ne = Nn * 24, nv = ne * 365, bn = {
  year: "{yyyy}",
  month: "{MMM}",
  day: "{d}",
  hour: "{HH}:{mm}",
  minute: "{HH}:{mm}",
  second: "{HH}:{mm}:{ss}",
  millisecond: "{HH}:{mm}:{ss} {SSS}",
  none: "{yyyy}-{MM}-{dd} {HH}:{mm}:{ss} {SSS}"
}, Ra = "{yyyy}-{MM}-{dd}", av = {
  year: "{yyyy}",
  month: "{yyyy}-{MM}",
  day: Ra,
  hour: Ra + " " + bn.hour,
  minute: Ra + " " + bn.minute,
  second: Ra + " " + bn.second,
  millisecond: bn.none
}, gl = ["year", "month", "day", "hour", "minute", "second", "millisecond"], Gg = ["year", "half-year", "quarter", "month", "week", "half-week", "day", "half-day", "quarter-day", "hour", "minute", "second", "millisecond"];
function Ue(r, t) {
  return r += "", "0000".substr(0, t - r.length) + r;
}
function Ii(r) {
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
function ob(r) {
  return r === Ii(r);
}
function sb(r) {
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
function cs(r, t, e, i) {
  var n = Fe(r), a = n[Zf(e)](), o = n[Ei(e)]() + 1, s = Math.floor((o - 1) / 3) + 1, l = n[vs(e)](), u = n["get" + (e ? "UTC" : "") + "Day"](), f = n[ta(e)](), h = (f - 1) % 12 + 1, v = n[ds(e)](), c = n[ps(e)](), d = n[gs(e)](), y = f >= 12 ? "pm" : "am", g = y.toUpperCase(), p = i instanceof pt ? i : nb(i || $g) || ab(), m = p.getModel("time"), _ = m.get("month"), S = m.get("monthAbbr"), b = m.get("dayOfWeek"), w = m.get("dayOfWeekAbbr");
  return (t || "").replace(/{a}/g, y + "").replace(/{A}/g, g + "").replace(/{yyyy}/g, a + "").replace(/{yy}/g, Ue(a % 100 + "", 2)).replace(/{Q}/g, s + "").replace(/{MMMM}/g, _[o - 1]).replace(/{MMM}/g, S[o - 1]).replace(/{MM}/g, Ue(o, 2)).replace(/{M}/g, o + "").replace(/{dd}/g, Ue(l, 2)).replace(/{d}/g, l + "").replace(/{eeee}/g, b[u]).replace(/{ee}/g, w[u]).replace(/{e}/g, u + "").replace(/{HH}/g, Ue(f, 2)).replace(/{H}/g, f + "").replace(/{hh}/g, Ue(h + "", 2)).replace(/{h}/g, h + "").replace(/{mm}/g, Ue(v, 2)).replace(/{m}/g, v + "").replace(/{ss}/g, Ue(c, 2)).replace(/{s}/g, c + "").replace(/{SSS}/g, Ue(d, 3)).replace(/{S}/g, d + "");
}
function lb(r, t, e, i, n) {
  var a = null;
  if (z(e))
    a = e;
  else if ($(e))
    a = e(r.value, t, {
      level: r.level
    });
  else {
    var o = k({}, bn);
    if (r.level > 0)
      for (var s = 0; s < gl.length; ++s)
        o[gl[s]] = "{primary|" + o[gl[s]] + "}";
    var l = e ? e.inherit === !1 ? e : at(e, o) : o, u = Wg(r.value, n);
    if (l[u])
      a = l[u];
    else if (l.inherit) {
      for (var f = Gg.indexOf(u), s = f - 1; s >= 0; --s)
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
  return cs(new Date(r.value), a, n, i);
}
function Wg(r, t) {
  var e = Fe(r), i = e[Ei(t)]() + 1, n = e[vs(t)](), a = e[ta(t)](), o = e[ds(t)](), s = e[ps(t)](), l = e[gs(t)](), u = l === 0, f = u && s === 0, h = f && o === 0, v = h && a === 0, c = v && n === 1, d = c && i === 1;
  return d ? "year" : c ? "month" : v ? "day" : h ? "hour" : f ? "minute" : u ? "second" : "millisecond";
}
function ov(r, t, e) {
  var i = ut(r) ? Fe(r) : r;
  switch (t = t || Wg(r, e), t) {
    case "year":
      return i[Zf(e)]();
    case "half-year":
      return i[Ei(e)]() >= 6 ? 1 : 0;
    case "quarter":
      return Math.floor((i[Ei(e)]() + 1) / 4);
    case "month":
      return i[Ei(e)]();
    case "day":
      return i[vs(e)]();
    case "half-day":
      return i[ta(e)]() / 24;
    case "hour":
      return i[ta(e)]();
    case "minute":
      return i[ds(e)]();
    case "second":
      return i[ps(e)]();
    case "millisecond":
      return i[gs(e)]();
  }
}
function Zf(r) {
  return r ? "getUTCFullYear" : "getFullYear";
}
function Ei(r) {
  return r ? "getUTCMonth" : "getMonth";
}
function vs(r) {
  return r ? "getUTCDate" : "getDate";
}
function ta(r) {
  return r ? "getUTCHours" : "getHours";
}
function ds(r) {
  return r ? "getUTCMinutes" : "getMinutes";
}
function ps(r) {
  return r ? "getUTCSeconds" : "getSeconds";
}
function gs(r) {
  return r ? "getUTCMilliseconds" : "getMilliseconds";
}
function ub(r) {
  return r ? "setUTCFullYear" : "setFullYear";
}
function Ug(r) {
  return r ? "setUTCMonth" : "setMonth";
}
function Yg(r) {
  return r ? "setUTCDate" : "setDate";
}
function Xg(r) {
  return r ? "setUTCHours" : "setHours";
}
function Zg(r) {
  return r ? "setUTCMinutes" : "setMinutes";
}
function qg(r) {
  return r ? "setUTCSeconds" : "setSeconds";
}
function Kg(r) {
  return r ? "setUTCMilliseconds" : "setMilliseconds";
}
function Qg(r) {
  if (!d1(r))
    return z(r) ? r : "-";
  var t = (r + "").split(".");
  return t[0].replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, "$1,") + (t.length > 1 ? "." + t[1] : "");
}
function jg(r, t) {
  return r = (r || "").toLowerCase().replace(/-(.)/g, function(e, i) {
    return i.toUpperCase();
  }), t && r && (r = r.charAt(0).toUpperCase() + r.slice(1)), r;
}
var ys = Ap;
function Iu(r, t, e) {
  var i = "{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}";
  function n(f) {
    return f && xe(f) ? f : "-";
  }
  function a(f) {
    return !!(f != null && !isNaN(f) && isFinite(f));
  }
  var o = t === "time", s = r instanceof Date;
  if (o || s) {
    var l = o ? Fe(r) : r;
    if (isNaN(+l)) {
      if (s)
        return "-";
    } else return cs(l, i, e);
  }
  if (t === "ordinal")
    return iu(r) ? n(r) : ut(r) && a(r) ? r + "" : "-";
  var u = Ao(r);
  return a(u) ? Qg(u) : iu(r) ? n(r) : typeof r == "boolean" ? r + "" : "-";
}
var sv = ["a", "b", "c", "d", "e", "f", "g"], yl = function(r, t) {
  return "{" + r + (t ?? "") + "}";
};
function Jg(r, t, e) {
  N(t) || (t = [t]);
  var i = t.length;
  if (!i)
    return "";
  for (var n = t[0].$vars || [], a = 0; a < n.length; a++) {
    var o = sv[a];
    r = r.replace(yl(o), yl(o, 0));
  }
  for (var s = 0; s < i; s++)
    for (var l = 0; l < n.length; l++) {
      var u = t[s][n[l]];
      r = r.replace(yl(sv[l], s), e ? Nt(u) : u);
    }
  return r;
}
function fb(r, t) {
  var e = z(r) ? {
    color: r,
    extraCssText: t
  } : r || {}, i = e.color, n = e.type;
  t = e.extraCssText;
  var a = e.renderMode || "html";
  if (!i)
    return "";
  if (a === "html")
    return n === "subItem" ? '<span style="display:inline-block;vertical-align:middle;margin-right:8px;margin-left:3px;border-radius:4px;width:4px;height:4px;background-color:' + Nt(i) + ";" + (t || "") + '"></span>' : '<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:' + Nt(i) + ";" + (t || "") + '"></span>';
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
function Qr(r, t) {
  return t = t || "transparent", z(r) ? r : V(r) && r.colorStops && (r.colorStops[0] || {}).color || t;
}
var po = C, hb = ["left", "right", "top", "bottom", "width", "height"], ka = [["width", "left", "right"], ["height", "top", "bottom"]];
function qf(r, t, e, i, n) {
  var a = 0, o = 0;
  i == null && (i = 1 / 0), n == null && (n = 1 / 0);
  var s = 0;
  t.eachChild(function(l, u) {
    var f = l.getBoundingRect(), h = t.childAt(u + 1), v = h && h.getBoundingRect(), c, d;
    if (r === "horizontal") {
      var y = f.width + (v ? -v.x + f.x : 0);
      c = a + y, c > i || l.newline ? (a = 0, c = y, o += s + e, s = f.height) : s = Math.max(s, f.height);
    } else {
      var g = f.height + (v ? -v.y + f.y : 0);
      d = o + g, d > n || l.newline ? (a += s + e, o = 0, d = g, s = f.width) : s = Math.max(s, f.width);
    }
    l.newline || (l.x = a, l.y = o, l.markRedraw(), r === "horizontal" ? a = c + e : o = d + e);
  });
}
var Bn = qf;
lt(qf, "vertical");
lt(qf, "horizontal");
function No(r, t, e) {
  e = ys(e || 0);
  var i = t.width, n = t.height, a = St(r.left, i), o = St(r.top, n), s = St(r.right, i), l = St(r.bottom, n), u = St(r.width, i), f = St(r.height, n), h = e[2] + e[0], v = e[1] + e[3], c = r.aspect;
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
  var d = new rt(a + e[3], o + e[0], u, f);
  return d.margin = e, d;
}
function ea(r) {
  var t = r.layoutMode || r.constructor.layoutMode;
  return V(t) ? t : t ? {
    type: t
  } : null;
}
function zi(r, t, e) {
  var i = e && e.ignoreSize;
  !N(i) && (i = [i, i]);
  var n = o(ka[0], 0), a = o(ka[1], 1);
  u(ka[0], r, n), u(ka[1], r, a);
  function o(f, h) {
    var v = {}, c = 0, d = {}, y = 0, g = 2;
    if (po(f, function(_) {
      d[_] = r[_];
    }), po(f, function(_) {
      s(t, _) && (v[_] = d[_] = t[_]), l(v, _) && c++, l(d, _) && y++;
    }), i[h])
      return l(t, f[1]) ? d[f[2]] = null : l(t, f[2]) && (d[f[1]] = null), d;
    if (y === g || !c)
      return d;
    if (c >= g)
      return v;
    for (var p = 0; p < f.length; p++) {
      var m = f[p];
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
    po(f, function(c) {
      h[c] = v[c];
    });
  }
}
function ms(r) {
  return cb({}, r);
}
function cb(r, t) {
  return t && r && po(hb, function(e) {
    t.hasOwnProperty(e) && (r[e] = t[e]);
  }), r;
}
var vb = gt(), nt = (
  /** @class */
  (function(r) {
    O(t, r);
    function t(e, i, n) {
      var a = r.call(this, e, i, n) || this;
      return a.uid = hs("ec_cpt_model"), a;
    }
    return t.prototype.init = function(e, i, n) {
      this.mergeDefaultAndTheme(e, n);
    }, t.prototype.mergeDefaultAndTheme = function(e, i) {
      var n = ea(this), a = n ? ms(e) : {}, o = i.getTheme();
      Q(e, o.get(this.mainType)), Q(e, this.getDefaultOption()), n && zi(e, a, n);
    }, t.prototype.mergeOption = function(e, i) {
      Q(this.option, e, !0);
      var n = ea(this);
      n && zi(this.option, e, n);
    }, t.prototype.optionUpdated = function(e, i) {
    }, t.prototype.getDefaultOption = function() {
      var e = this.constructor;
      if (!E1(e))
        return e.defaultOption;
      var i = vb(this);
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
      return ha(this.ecModel, e, {
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
  })(pt)
);
sg(nt, pt);
Qo(nt);
jw(nt);
Jw(nt, db);
function db(r) {
  var t = [];
  return C(nt.getClassesByMainType(r), function(e) {
    t = t.concat(e.dependencies || e.prototype.dependencies || []);
  }), t = H(t, function(e) {
    return Ce(e).main;
  }), r !== "dataset" && et(t, "dataset") <= 0 && t.unshift("dataset"), t;
}
var ty = "";
typeof navigator < "u" && (ty = navigator.platform || "");
var hi = "rgba(0, 0, 0, 0.2)";
const pb = {
  darkMode: "auto",
  // backgroundColor: 'rgba(0,0,0,0)',
  colorBy: "series",
  color: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"],
  gradientColor: ["#f6efa6", "#d88273", "#bf444c"],
  aria: {
    decal: {
      decals: [{
        color: hi,
        dashArrayX: [1, 0],
        dashArrayY: [2, 5],
        symbolSize: 1,
        rotation: Math.PI / 6
      }, {
        color: hi,
        symbol: "circle",
        dashArrayX: [[8, 8], [0, 8, 8, 0]],
        dashArrayY: [6, 0],
        symbolSize: 0.8
      }, {
        color: hi,
        dashArrayX: [1, 0],
        dashArrayY: [4, 3],
        rotation: -Math.PI / 4
      }, {
        color: hi,
        dashArrayX: [[6, 6], [0, 6, 6, 0]],
        dashArrayY: [6, 0]
      }, {
        color: hi,
        dashArrayX: [[1, 0], [1, 6]],
        dashArrayY: [1, 0, 6, 0],
        rotation: Math.PI / 4
      }, {
        color: hi,
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
    fontFamily: ty.match(/^Win/) ? "Microsoft YaHei" : "sans-serif",
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
var ey = Z(["tooltip", "label", "itemName", "itemId", "itemGroupId", "itemChildGroupId", "seriesName"]), se = "original", Wt = "arrayRows", Le = "objectRows", Ve = "keyedColumns", or = "typedArray", ry = "unknown", Ne = "column", Yi = "row", Yt = {
  Must: 1,
  Might: 2,
  Not: 3
  // Other cases
}, iy = gt();
function gb(r) {
  iy(r).datasetMap = Z();
}
function yb(r, t, e) {
  var i = {}, n = ny(t);
  if (!n || !r)
    return i;
  var a = [], o = [], s = t.ecModel, l = iy(s).datasetMap, u = n.uid + "_" + e.seriesLayoutBy, f, h;
  r = r.slice(), C(r, function(y, g) {
    var p = V(y) ? y : r[g] = {
      name: y
    };
    p.type === "ordinal" && f == null && (f = g, h = d(p)), i[p.name] = [];
  });
  var v = l.get(u) || l.set(u, {
    categoryWayDim: h,
    valueWayDim: 0
  });
  C(r, function(y, g) {
    var p = y.name, m = d(y);
    if (f == null) {
      var _ = v.valueWayDim;
      c(i[p], _, m), c(o, _, m), v.valueWayDim += m;
    } else if (f === g)
      c(i[p], 0, m), c(a, 0, m);
    else {
      var _ = v.categoryWayDim;
      c(i[p], _, m), c(o, _, m), v.categoryWayDim += m;
    }
  });
  function c(y, g, p) {
    for (var m = 0; m < p; m++)
      y.push(g + m);
  }
  function d(y) {
    var g = y.dimsDef;
    return g ? g.length : 1;
  }
  return a.length && (i.itemName = a), o.length && (i.seriesName = o), i;
}
function ny(r) {
  var t = r.get("data", !0);
  if (!t)
    return ha(r.ecModel, "dataset", {
      index: r.get("datasetIndex", !0),
      id: r.get("datasetId", !0)
    }, de).models[0];
}
function mb(r) {
  return !r.get("transform", !0) && !r.get("fromTransformResult", !0) ? [] : ha(r.ecModel, "dataset", {
    index: r.get("fromDatasetIndex", !0),
    id: r.get("fromDatasetId", !0)
  }, de).models;
}
function ay(r, t) {
  return _b(r.data, r.sourceFormat, r.seriesLayoutBy, r.dimensionsDefine, r.startIndex, t);
}
function _b(r, t, e, i, n, a) {
  var o, s = 5;
  if (Vt(r))
    return Yt.Not;
  var l, u;
  if (i) {
    var f = i[a];
    V(f) ? (l = f.name, u = f.type) : z(f) && (l = f);
  }
  if (u != null)
    return u === "ordinal" ? Yt.Must : Yt.Not;
  if (t === Wt) {
    var h = r;
    if (e === Yi) {
      for (var v = h[a], c = 0; c < (v || []).length && c < s; c++)
        if ((o = S(v[n + c])) != null)
          return o;
    } else
      for (var c = 0; c < h.length && c < s; c++) {
        var d = h[n + c];
        if (d && (o = S(d[a])) != null)
          return o;
      }
  } else if (t === Le) {
    var y = r;
    if (!l)
      return Yt.Not;
    for (var c = 0; c < y.length && c < s; c++) {
      var g = y[c];
      if (g && (o = S(g[l])) != null)
        return o;
    }
  } else if (t === Ve) {
    var p = r;
    if (!l)
      return Yt.Not;
    var v = p[l];
    if (!v || Vt(v))
      return Yt.Not;
    for (var c = 0; c < v.length && c < s; c++)
      if ((o = S(v[c])) != null)
        return o;
  } else if (t === se)
    for (var m = r, c = 0; c < m.length && c < s; c++) {
      var g = m[c], _ = fa(g);
      if (!N(_))
        return Yt.Not;
      if ((o = S(_[a])) != null)
        return o;
    }
  function S(b) {
    var w = z(b);
    if (b != null && Number.isFinite(Number(b)) && b !== "")
      return w ? Yt.Might : Yt.Not;
    if (w && b !== "-")
      return Yt.Must;
  }
  return Yt.Not;
}
var Sb = Z();
function wb(r, t, e) {
  var i = Sb.get(t);
  if (!i)
    return e;
  var n = i(r);
  return n ? e.concat(n) : e;
}
var lv = gt();
gt();
var Kf = (
  /** @class */
  (function() {
    function r() {
    }
    return r.prototype.getColorFromPalette = function(t, e, i) {
      var n = Rt(this.get("color", !0)), a = this.get("colorLayer", !0);
      return xb(this, lv, n, a, t, e, i);
    }, r.prototype.clearColorPalette = function() {
      Tb(this, lv);
    }, r;
  })()
);
function bb(r, t) {
  for (var e = r.length, i = 0; i < e; i++)
    if (r[i].length > t)
      return r[i];
  return r[e - 1];
}
function xb(r, t, e, i, n, a, o) {
  a = a || r;
  var s = t(a), l = s.paletteIdx || 0, u = s.paletteNameMap = s.paletteNameMap || {};
  if (u.hasOwnProperty(n))
    return u[n];
  var f = o == null || !i ? e : bb(i, o);
  if (f = f || e, !(!f || !f.length)) {
    var h = f[l];
    return n && (u[n] = h), s.paletteIdx = (l + 1) % f.length, h;
  }
}
function Tb(r, t) {
  t(r).paletteIdx = 0, t(r).paletteNameMap = {};
}
var Oa, on, uv, fv = "\0_ec_inner", Cb = 1, Qf = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      return r !== null && r.apply(this, arguments) || this;
    }
    return t.prototype.init = function(e, i, n, a, o, s) {
      a = a || {}, this.option = null, this._theme = new pt(a), this._locale = new pt(o), this._optionManager = s;
    }, t.prototype.setOption = function(e, i, n) {
      var a = vv(i);
      this._optionManager.setOption(e, n, a), this._resetOption(null, a);
    }, t.prototype.resetOption = function(e, i) {
      return this._resetOption(e, vv(i));
    }, t.prototype._resetOption = function(e, i) {
      var n = !1, a = this._optionManager;
      if (!e || e === "recreate") {
        var o = a.mountOption(e === "recreate");
        !this.option || e === "recreate" ? uv(this, o) : (this.restoreData(), this._mergeOption(o, i)), n = !0;
      }
      if ((e === "timeline" || e === "media") && this.restoreData(), !e || e === "recreate" || e === "timeline") {
        var s = a.getTimelineOption(this);
        s && (n = !0, this._mergeOption(s, i));
      }
      if (!e || e === "recreate" || e === "media") {
        var l = a.getMediaOption(this);
        l.length && C(l, function(u) {
          n = !0, this._mergeOption(u, i);
        }, this);
      }
      return n;
    }, t.prototype.mergeOption = function(e) {
      this._mergeOption(e, null);
    }, t.prototype._mergeOption = function(e, i) {
      var n = this.option, a = this._componentsMap, o = this._componentsCount, s = [], l = Z(), u = i && i.replaceMergeMainTypeMap;
      gb(this), C(e, function(h, v) {
        h != null && (nt.hasClass(v) ? v && (s.push(v), l.set(v, !0)) : n[v] = n[v] == null ? q(h) : Q(n[v], h, !0));
      }), u && u.each(function(h, v) {
        nt.hasClass(v) && !l.get(v) && (s.push(v), l.set(v, !0));
      }), nt.topologicalTravel(s, nt.getAllClassMainTypes(), f, this);
      function f(h) {
        var v = wb(this, h, Rt(e[h])), c = a.get(h), d = (
          // `!oldCmptList` means init. See the comment in `mappingToExists`
          c ? u && u.get(h) ? "replaceMerge" : "normalMerge" : "replaceAll"
        ), y = y1(c, v, d);
        T1(y, h, nt), n[h] = null, a.set(h, null), o.set(h, 0);
        var g = [], p = [], m = 0, _;
        C(y, function(S, b) {
          var w = S.existing, x = S.newOption;
          if (!x)
            w && (w.mergeOption({}, this), w.optionUpdated({}, !1));
          else {
            var T = h === "series", D = nt.getClass(
              h,
              S.keyInfo.subType,
              !T
              // Give a more detailed warn later if series don't exists
            );
            if (!D)
              return;
            if (h === "tooltip") {
              if (_)
                return;
              _ = !0;
            }
            if (w && w.constructor === D)
              w.name = S.keyInfo.name, w.mergeOption(x, this), w.optionUpdated(x, !1);
            else {
              var A = k({
                componentIndex: b
              }, S.keyInfo);
              w = new D(x, this, this, A), k(w, A), S.brandNew && (w.__requireNewView = !0), w.init(x, this, this), w.optionUpdated(null, !0);
            }
          }
          w ? (g.push(w.option), p.push(w), m++) : (g.push(void 0), p.push(void 0));
        }, this), n[h] = g, a.set(h, p), o.set(h, m), h === "series" && Oa(this);
      }
      this._seriesIndices || Oa(this);
    }, t.prototype.getOption = function() {
      var e = q(this.option);
      return C(e, function(i, n) {
        if (nt.hasClass(n)) {
          for (var a = Rt(i), o = a.length, s = !1, l = o - 1; l >= 0; l--)
            a[l] && !qn(a[l]) ? s = !0 : (a[l] = null, !s && o--);
          a.length = o, e[n] = a;
        }
      }), delete e[fv], e;
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
      return n != null ? (l = [], C(Rt(n), function(u) {
        s[u] && l.push(s[u]);
      })) : a != null ? l = hv("id", a, s) : o != null ? l = hv("name", o, s) : l = _t(s, function(u) {
        return !!u;
      }), cv(l, e);
    }, t.prototype.findComponents = function(e) {
      var i = e.query, n = e.mainType, a = s(i), o = a ? this.queryComponents(a) : _t(this._componentsMap.get(n), function(u) {
        return !!u;
      });
      return l(cv(o, e));
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
        return e.filter ? _t(u, e.filter) : u;
      }
    }, t.prototype.eachComponent = function(e, i, n) {
      var a = this._componentsMap;
      if ($(e)) {
        var o = i, s = e;
        a.each(function(h, v) {
          for (var c = 0; h && c < h.length; c++) {
            var d = h[c];
            d && s.call(o, v, d, d.componentIndex);
          }
        });
      } else
        for (var l = z(e) ? a.get(e) : V(e) ? this.findComponents(e) : null, u = 0; l && u < l.length; u++) {
          var f = l[u];
          f && i.call(n, f, f.componentIndex);
        }
    }, t.prototype.getSeriesByName = function(e) {
      var i = De(e, null);
      return _t(this._componentsMap.get("series"), function(n) {
        return !!n && i != null && n.name === i;
      });
    }, t.prototype.getSeriesByIndex = function(e) {
      return this._componentsMap.get("series")[e];
    }, t.prototype.getSeriesByType = function(e) {
      return _t(this._componentsMap.get("series"), function(i) {
        return !!i && i.subType === e;
      });
    }, t.prototype.getSeries = function() {
      return _t(this._componentsMap.get("series"), function(e) {
        return !!e;
      });
    }, t.prototype.getSeriesCount = function() {
      return this._componentsCount.get("series");
    }, t.prototype.eachSeries = function(e, i) {
      on(this), C(this._seriesIndices, function(n) {
        var a = this._componentsMap.get("series")[n];
        e.call(i, a, n);
      }, this);
    }, t.prototype.eachRawSeries = function(e, i) {
      C(this._componentsMap.get("series"), function(n) {
        n && e.call(i, n, n.componentIndex);
      });
    }, t.prototype.eachSeriesByType = function(e, i, n) {
      on(this), C(this._seriesIndices, function(a) {
        var o = this._componentsMap.get("series")[a];
        o.subType === e && i.call(n, o, a);
      }, this);
    }, t.prototype.eachRawSeriesByType = function(e, i, n) {
      return C(this.getSeriesByType(e), i, n);
    }, t.prototype.isSeriesFiltered = function(e) {
      return on(this), this._seriesIndicesMap.get(e.componentIndex) == null;
    }, t.prototype.getCurrentSeriesIndices = function() {
      return (this._seriesIndices || []).slice();
    }, t.prototype.filterSeries = function(e, i) {
      on(this);
      var n = [];
      C(this._seriesIndices, function(a) {
        var o = this._componentsMap.get("series")[a];
        e.call(i, o, a) && n.push(a);
      }, this), this._seriesIndices = n, this._seriesIndicesMap = Z(n);
    }, t.prototype.restoreData = function(e) {
      Oa(this);
      var i = this._componentsMap, n = [];
      i.each(function(a, o) {
        nt.hasClass(o) && n.push(o);
      }), nt.topologicalTravel(n, nt.getAllClassMainTypes(), function(a) {
        C(i.get(a), function(o) {
          o && (a !== "series" || !Db(o, e)) && o.restoreData();
        });
      });
    }, t.internalField = (function() {
      Oa = function(e) {
        var i = e._seriesIndices = [];
        C(e._componentsMap.get("series"), function(n) {
          n && i.push(n.componentIndex);
        }), e._seriesIndicesMap = Z(i);
      }, on = function(e) {
      }, uv = function(e, i) {
        e.option = {}, e.option[fv] = Cb, e._componentsMap = Z({
          series: []
        }), e._componentsCount = Z();
        var n = i.aria;
        V(n) && n.enabled == null && (n.enabled = !0), Mb(i, e._theme.option), Q(i, pb, !1), e._mergeOption(i, null);
      };
    })(), t;
  })(pt)
);
function Db(r, t) {
  if (t) {
    var e = t.seriesIndex, i = t.seriesId, n = t.seriesName;
    return e != null && r.componentIndex !== e || i != null && r.id !== i || n != null && r.name !== n;
  }
}
function Mb(r, t) {
  var e = r.color && !r.colorLayer;
  C(t, function(i, n) {
    n === "colorLayer" && e || nt.hasClass(n) || (typeof i == "object" ? r[n] = r[n] ? Q(r[n], i, !1) : q(i) : r[n] == null && (r[n] = i));
  });
}
function hv(r, t, e) {
  if (N(t)) {
    var i = Z();
    return C(t, function(a) {
      if (a != null) {
        var o = De(a, null);
        o != null && i.set(a, !0);
      }
    }), _t(e, function(a) {
      return a && i.get(a[r]);
    });
  } else {
    var n = De(t, null);
    return _t(e, function(a) {
      return a && n != null && a[r] === n;
    });
  }
}
function cv(r, t) {
  return t.hasOwnProperty("subType") ? _t(r, function(e) {
    return e && e.subType === t.subType;
  }) : r;
}
function vv(r) {
  var t = Z();
  return r && C(Rt(r.replaceMerge), function(e) {
    t.set(e, !0);
  }), {
    replaceMergeMainTypeMap: t
  };
}
ge(Qf, Kf);
var Ab = [
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
], oy = (
  /** @class */
  /* @__PURE__ */ (function() {
    function r(t) {
      C(Ab, function(e) {
        this[e] = ct(t[e], t);
      }, this);
    }
    return r;
  })()
), ml = {}, jf = (
  /** @class */
  (function() {
    function r() {
      this._coordinateSystems = [];
    }
    return r.prototype.create = function(t, e) {
      var i = [];
      C(ml, function(n, a) {
        var o = n.create(t, e);
        i = i.concat(o || []);
      }), this._coordinateSystems = i;
    }, r.prototype.update = function(t, e) {
      C(this._coordinateSystems, function(i) {
        i.update && i.update(t, e);
      });
    }, r.prototype.getCoordinateSystems = function() {
      return this._coordinateSystems.slice();
    }, r.register = function(t, e) {
      ml[t] = e;
    }, r.get = function(t) {
      return ml[t];
    }, r;
  })()
), Lb = /^(min|max)?(.+)$/, Pb = (
  /** @class */
  (function() {
    function r(t) {
      this._timelineOptions = [], this._mediaList = [], this._currentMediaIndices = [], this._api = t;
    }
    return r.prototype.setOption = function(t, e, i) {
      t && (C(Rt(t.series), function(o) {
        o && o.data && Vt(o.data) && nu(o.data);
      }), C(Rt(t.dataset), function(o) {
        o && o.source && Vt(o.source) && nu(o.source);
      })), t = q(t);
      var n = this._optionBackup, a = Ib(t, e, !n);
      this._newBaseOption = a.baseOption, n ? (a.timelineOptions.length && (n.timelineOptions = a.timelineOptions), a.mediaList.length && (n.mediaList = a.mediaList), a.mediaDefault && (n.mediaDefault = a.mediaDefault)) : this._optionBackup = a;
    }, r.prototype.mountOption = function(t) {
      var e = this._optionBackup;
      return this._timelineOptions = e.timelineOptions, this._mediaList = e.mediaList, this._mediaDefault = e.mediaDefault, this._currentMediaIndices = [], q(t ? e.baseOption : this._newBaseOption);
    }, r.prototype.getTimelineOption = function(t) {
      var e, i = this._timelineOptions;
      if (i.length) {
        var n = t.getComponent("timeline");
        n && (e = q(
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
        Eb(n[l].query, e, i) && o.push(l);
      return !o.length && a && (o = [-1]), o.length && !kb(o, this._currentMediaIndices) && (s = H(o, function(f) {
        return q(f === -1 ? a.option : n[f].option);
      })), this._currentMediaIndices = o, s;
    }, r;
  })()
);
function Ib(r, t, e) {
  var i = [], n, a, o = r.baseOption, s = r.timeline, l = r.options, u = r.media, f = !!r.media, h = !!(l || s || o && o.timeline);
  o ? (a = o, a.timeline || (a.timeline = s)) : ((h || f) && (r.options = r.media = null), a = r), f && N(u) && C(u, function(c) {
    c && c.option && (c.query ? i.push(c) : n || (n = c));
  }), v(a), C(l, function(c) {
    return v(c);
  }), C(i, function(c) {
    return v(c.option);
  });
  function v(c) {
    C(t, function(d) {
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
function Eb(r, t, e) {
  var i = {
    width: t,
    height: e,
    aspectratio: t / e
    // lower case for convenience.
  }, n = !0;
  return C(r, function(a, o) {
    var s = o.match(Lb);
    if (!(!s || !s[1] || !s[2])) {
      var l = s[1], u = s[2].toLowerCase();
      Rb(i[u], a, l) || (n = !1);
    }
  }), n;
}
function Rb(r, t, e) {
  return e === "min" ? r >= t : e === "max" ? r <= t : r === t;
}
function kb(r, t) {
  return r.join(",") === t.join(",");
}
var ue = C, ra = V, dv = ["areaStyle", "lineStyle", "nodeStyle", "linkStyle", "chordStyle", "label", "labelLine"];
function _l(r) {
  var t = r && r.itemStyle;
  if (t)
    for (var e = 0, i = dv.length; e < i; e++) {
      var n = dv[e], a = t.normal, o = t.emphasis;
      a && a[n] && (r[n] = r[n] || {}, r[n].normal ? Q(r[n].normal, a[n]) : r[n].normal = a[n], a[n] = null), o && o[n] && (r[n] = r[n] || {}, r[n].emphasis ? Q(r[n].emphasis, o[n]) : r[n].emphasis = o[n], o[n] = null);
    }
}
function Pt(r, t, e) {
  if (r && r[t] && (r[t].normal || r[t].emphasis)) {
    var i = r[t].normal, n = r[t].emphasis;
    i && (e ? (r[t].normal = r[t].emphasis = null, at(r[t], i)) : r[t] = i), n && (r.emphasis = r.emphasis || {}, r.emphasis[t] = n, n.focus && (r.emphasis.focus = n.focus), n.blurScope && (r.emphasis.blurScope = n.blurScope));
  }
}
function xn(r) {
  Pt(r, "itemStyle"), Pt(r, "lineStyle"), Pt(r, "areaStyle"), Pt(r, "label"), Pt(r, "labelLine"), Pt(r, "upperLabel"), Pt(r, "edgeLabel");
}
function yt(r, t) {
  var e = ra(r) && r[t], i = ra(e) && e.textStyle;
  if (i)
    for (var n = 0, a = pc.length; n < a; n++) {
      var o = pc[n];
      i.hasOwnProperty(o) && (e[o] = i[o]);
    }
}
function Jt(r) {
  r && (xn(r), yt(r, "label"), r.emphasis && yt(r.emphasis, "label"));
}
function Ob(r) {
  if (ra(r)) {
    _l(r), xn(r), yt(r, "label"), yt(r, "upperLabel"), yt(r, "edgeLabel"), r.emphasis && (yt(r.emphasis, "label"), yt(r.emphasis, "upperLabel"), yt(r.emphasis, "edgeLabel"));
    var t = r.markPoint;
    t && (_l(t), Jt(t));
    var e = r.markLine;
    e && (_l(e), Jt(e));
    var i = r.markArea;
    i && Jt(i);
    var n = r.data;
    if (r.type === "graph") {
      n = n || r.nodes;
      var a = r.links || r.edges;
      if (a && !Vt(a))
        for (var o = 0; o < a.length; o++)
          Jt(a[o]);
      C(r.categories, function(u) {
        xn(u);
      });
    }
    if (n && !Vt(n))
      for (var o = 0; o < n.length; o++)
        Jt(n[o]);
    if (t = r.markPoint, t && t.data)
      for (var s = t.data, o = 0; o < s.length; o++)
        Jt(s[o]);
    if (e = r.markLine, e && e.data)
      for (var l = e.data, o = 0; o < l.length; o++)
        N(l[o]) ? (Jt(l[o][0]), Jt(l[o][1])) : Jt(l[o]);
    r.type === "gauge" ? (yt(r, "axisLabel"), yt(r, "title"), yt(r, "detail")) : r.type === "treemap" ? (Pt(r.breadcrumb, "itemStyle"), C(r.levels, function(u) {
      xn(u);
    })) : r.type === "tree" && xn(r.leaves);
  }
}
function Ee(r) {
  return N(r) ? r : r ? [r] : [];
}
function pv(r) {
  return (N(r) ? r[0] : r) || {};
}
function Nb(r, t) {
  ue(Ee(r.series), function(i) {
    ra(i) && Ob(i);
  });
  var e = ["xAxis", "yAxis", "radiusAxis", "angleAxis", "singleAxis", "parallelAxis", "radar"];
  t && e.push("valueAxis", "categoryAxis", "logAxis", "timeAxis"), ue(e, function(i) {
    ue(Ee(r[i]), function(n) {
      n && (yt(n, "axisLabel"), yt(n.axisPointer, "label"));
    });
  }), ue(Ee(r.parallel), function(i) {
    var n = i && i.parallelAxisDefault;
    yt(n, "axisLabel"), yt(n && n.axisPointer, "label");
  }), ue(Ee(r.calendar), function(i) {
    Pt(i, "itemStyle"), yt(i, "dayLabel"), yt(i, "monthLabel"), yt(i, "yearLabel");
  }), ue(Ee(r.radar), function(i) {
    yt(i, "name"), i.name && i.axisName == null && (i.axisName = i.name, delete i.name), i.nameGap != null && i.axisNameGap == null && (i.axisNameGap = i.nameGap, delete i.nameGap);
  }), ue(Ee(r.geo), function(i) {
    ra(i) && (Jt(i), ue(Ee(i.regions), function(n) {
      Jt(n);
    }));
  }), ue(Ee(r.timeline), function(i) {
    Jt(i), Pt(i, "label"), Pt(i, "itemStyle"), Pt(i, "controlStyle", !0);
    var n = i.data;
    N(n) && C(n, function(a) {
      V(a) && (Pt(a, "label"), Pt(a, "itemStyle"));
    });
  }), ue(Ee(r.toolbox), function(i) {
    Pt(i, "iconStyle"), ue(i.feature, function(n) {
      Pt(n, "iconStyle");
    });
  }), yt(pv(r.axisPointer), "label"), yt(pv(r.tooltip).axisPointer, "label");
}
function Bb(r, t) {
  for (var e = t.split(","), i = r, n = 0; n < e.length && (i = i && i[e[n]], i != null); n++)
    ;
  return i;
}
function Fb(r, t, e, i) {
  for (var n = t.split(","), a = r, o, s = 0; s < n.length - 1; s++)
    o = n[s], a[o] == null && (a[o] = {}), a = a[o];
  a[n[s]] == null && (a[n[s]] = e);
}
function gv(r) {
  r && C(zb, function(t) {
    t[0] in r && !(t[1] in r) && (r[t[1]] = r[t[0]]);
  });
}
var zb = [["x", "left"], ["y", "top"], ["x2", "right"], ["y2", "bottom"]], Hb = ["grid", "geo", "parallel", "legend", "toolbox", "title", "visualMap", "dataZoom", "timeline"], Sl = [["borderRadius", "barBorderRadius"], ["borderColor", "barBorderColor"], ["borderWidth", "barBorderWidth"]];
function sn(r) {
  var t = r && r.itemStyle;
  if (t)
    for (var e = 0; e < Sl.length; e++) {
      var i = Sl[e][1], n = Sl[e][0];
      t[i] != null && (t[n] = t[i]);
    }
}
function yv(r) {
  r && r.alignTo === "edge" && r.margin != null && r.edgeDistance == null && (r.edgeDistance = r.margin);
}
function mv(r) {
  r && r.downplay && !r.blur && (r.blur = r.downplay);
}
function $b(r) {
  r && r.focusNodeAdjacency != null && (r.emphasis = r.emphasis || {}, r.emphasis.focus == null && (r.emphasis.focus = "adjacency"));
}
function sy(r, t) {
  if (r)
    for (var e = 0; e < r.length; e++)
      t(r[e]), r[e] && sy(r[e].children, t);
}
function ly(r, t) {
  Nb(r, t), r.series = Rt(r.series), C(r.series, function(e) {
    if (V(e)) {
      var i = e.type;
      if (i === "line")
        e.clipOverflow != null && (e.clip = e.clipOverflow);
      else if (i === "pie" || i === "gauge") {
        e.clockWise != null && (e.clockwise = e.clockWise), yv(e.label);
        var n = e.data;
        if (n && !Vt(n))
          for (var a = 0; a < n.length; a++)
            yv(n[a]);
        e.hoverOffset != null && (e.emphasis = e.emphasis || {}, (e.emphasis.scaleSize = null) && (e.emphasis.scaleSize = e.hoverOffset));
      } else if (i === "gauge") {
        var o = Bb(e, "pointer.color");
        o != null && Fb(e, "itemStyle.color", o);
      } else if (i === "bar") {
        sn(e), sn(e.backgroundStyle), sn(e.emphasis);
        var n = e.data;
        if (n && !Vt(n))
          for (var a = 0; a < n.length; a++)
            typeof n[a] == "object" && (sn(n[a]), sn(n[a] && n[a].emphasis));
      } else if (i === "sunburst") {
        var s = e.highlightPolicy;
        s && (e.emphasis = e.emphasis || {}, e.emphasis.focus || (e.emphasis.focus = s)), mv(e), sy(e.data, mv);
      } else i === "graph" || i === "sankey" ? $b(e) : i === "map" && (e.mapType && !e.map && (e.map = e.mapType), e.mapLocation && at(e, e.mapLocation));
      e.hoverAnimation != null && (e.emphasis = e.emphasis || {}, e.emphasis && e.emphasis.scale == null && (e.emphasis.scale = e.hoverAnimation)), gv(e);
    }
  }), r.dataRange && (r.visualMap = r.dataRange), C(Hb, function(e) {
    var i = r[e];
    i && (N(i) || (i = [i]), C(i, function(n) {
      gv(n);
    }));
  });
}
function Vb(r) {
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
  }), t.each(Gb);
}
function Gb(r) {
  C(r, function(t, e) {
    var i = [], n = [NaN, NaN], a = [t.stackResultDimension, t.stackedOverDimension], o = t.data, s = t.isStackedByIndex, l = t.seriesModel.get("stackStrategy") || "samesign";
    o.modify(a, function(u, f, h) {
      var v = o.get(t.stackedDimension, h);
      if (isNaN(v))
        return n;
      var c, d;
      s ? d = o.getRawIndex(h) : c = o.get(t.stackedByDimension, h);
      for (var y = NaN, g = e - 1; g >= 0; g--) {
        var p = r[g];
        if (s || (d = p.data.rawIndexOf(p.stackedByDimension, c)), d >= 0) {
          var m = p.data.getByRawIndex(p.stackResultDimension, d);
          if (l === "all" || l === "positive" && m > 0 || l === "negative" && m < 0 || l === "samesign" && v >= 0 && m > 0 || l === "samesign" && v <= 0 && m < 0) {
            v = h1(v, m), y = m;
            break;
          }
        }
      }
      return i[0] = v, i[1] = y, i;
    });
  });
}
var _s = (
  /** @class */
  /* @__PURE__ */ (function() {
    function r(t) {
      this.data = t.data || (t.sourceFormat === Ve ? {} : []), this.sourceFormat = t.sourceFormat || ry, this.seriesLayoutBy = t.seriesLayoutBy || Ne, this.startIndex = t.startIndex || 0, this.dimensionsDetectedCount = t.dimensionsDetectedCount, this.metaRawOption = t.metaRawOption;
      var e = this.dimensionsDefine = t.dimensionsDefine;
      if (e)
        for (var i = 0; i < e.length; i++) {
          var n = e[i];
          n.type == null && ay(this, i) === Yt.Must && (n.type = "ordinal");
        }
    }
    return r;
  })()
);
function Jf(r) {
  return r instanceof _s;
}
function Eu(r, t, e) {
  e = e || fy(r);
  var i = t.seriesLayoutBy, n = Ub(r, e, i, t.sourceHeader, t.dimensions), a = new _s({
    data: r,
    sourceFormat: e,
    seriesLayoutBy: i,
    dimensionsDefine: n.dimensionsDefine,
    startIndex: n.startIndex,
    dimensionsDetectedCount: n.dimensionsDetectedCount,
    metaRawOption: q(t)
  });
  return a;
}
function uy(r) {
  return new _s({
    data: r,
    sourceFormat: Vt(r) ? or : se
  });
}
function Wb(r) {
  return new _s({
    data: r.data,
    sourceFormat: r.sourceFormat,
    seriesLayoutBy: r.seriesLayoutBy,
    dimensionsDefine: q(r.dimensionsDefine),
    startIndex: r.startIndex,
    dimensionsDetectedCount: r.dimensionsDetectedCount
  });
}
function fy(r) {
  var t = ry;
  if (Vt(r))
    t = or;
  else if (N(r)) {
    r.length === 0 && (t = Wt);
    for (var e = 0, i = r.length; e < i; e++) {
      var n = r[e];
      if (n != null) {
        if (N(n) || Vt(n)) {
          t = Wt;
          break;
        } else if (V(n)) {
          t = Le;
          break;
        }
      }
    }
  } else if (V(r)) {
    for (var a in r)
      if (Xr(r, a) && $t(r[a])) {
        t = Ve;
        break;
      }
  }
  return t;
}
function Ub(r, t, e, i, n) {
  var a, o;
  if (!r)
    return {
      dimensionsDefine: _v(n),
      startIndex: o,
      dimensionsDetectedCount: a
    };
  if (t === Wt) {
    var s = r;
    i === "auto" || i == null ? Sv(function(u) {
      u != null && u !== "-" && (z(u) ? o == null && (o = 1) : o = 0);
    }, e, s, 10) : o = ut(i) ? i : i ? 1 : 0, !n && o === 1 && (n = [], Sv(function(u, f) {
      n[f] = u != null ? u + "" : "";
    }, e, s, 1 / 0)), a = n ? n.length : e === Yi ? s.length : s[0] ? s[0].length : null;
  } else if (t === Le)
    n || (n = Yb(r));
  else if (t === Ve)
    n || (n = [], C(r, function(u, f) {
      n.push(f);
    }));
  else if (t === se) {
    var l = fa(r[0]);
    a = N(l) && l.length || 1;
  }
  return {
    startIndex: o,
    dimensionsDefine: _v(n),
    dimensionsDetectedCount: a
  };
}
function Yb(r) {
  for (var t = 0, e; t < r.length && !(e = r[t++]); )
    ;
  if (e)
    return vt(e);
}
function _v(r) {
  if (r) {
    var t = Z();
    return H(r, function(e, i) {
      e = V(e) ? e : {
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
function Sv(r, t, e, i) {
  if (t === Yi)
    for (var n = 0; n < e.length && n < i; n++)
      r(e[n] ? e[n][0] : null, n);
  else
    for (var a = e[0] || [], n = 0; n < a.length && n < i; n++)
      r(a[n], n);
}
function hy(r) {
  var t = r.sourceFormat;
  return t === Le || t === Ve;
}
var Ir, Er, Rr, wv, bv, cy = (
  /** @class */
  (function() {
    function r(t, e) {
      var i = Jf(t) ? t : uy(t);
      this._source = i;
      var n = this._data = i.data;
      i.sourceFormat === or && (this._offset = 0, this._dimSize = e, this._data = n), bv(this, n, i);
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
      bv = function(o, s, l) {
        var u = l.sourceFormat, f = l.seriesLayoutBy, h = l.startIndex, v = l.dimensionsDefine, c = wv[th(u, f)];
        if (k(o, c), u === or)
          o.getItem = e, o.count = n, o.fillStorage = i;
        else {
          var d = vy(u, f);
          o.getItem = ct(d, null, s, h, v);
          var y = dy(u, f);
          o.count = ct(y, null, s, h, v);
        }
      };
      var e = function(o, s) {
        o = o - this._offset, s = s || [];
        for (var l = this._data, u = this._dimSize, f = u * o, h = 0; h < u; h++)
          s[h] = l[f + h];
        return s;
      }, i = function(o, s, l, u) {
        for (var f = this._data, h = this._dimSize, v = 0; v < h; v++) {
          for (var c = u[v], d = c[0] == null ? 1 / 0 : c[0], y = c[1] == null ? -1 / 0 : c[1], g = s - o, p = l[v], m = 0; m < g; m++) {
            var _ = f[m * h + v];
            p[o + m] = _, _ < d && (d = _), _ > y && (y = _);
          }
          c[0] = d, c[1] = y;
        }
      }, n = function() {
        return this._data ? this._data.length / this._dimSize : 0;
      };
      wv = (t = {}, t[Wt + "_" + Ne] = {
        pure: !0,
        appendData: a
      }, t[Wt + "_" + Yi] = {
        pure: !0,
        appendData: function() {
          throw new Error('Do not support appendData when set seriesLayoutBy: "row".');
        }
      }, t[Le] = {
        pure: !0,
        appendData: a
      }, t[Ve] = {
        pure: !0,
        appendData: function(o) {
          var s = this._data;
          C(o, function(l, u) {
            for (var f = s[u] || (s[u] = []), h = 0; h < (l || []).length; h++)
              f.push(l[h]);
          });
        }
      }, t[se] = {
        appendData: a
      }, t[or] = {
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
), xv = function(r, t, e, i) {
  return r[i];
}, Xb = (Ir = {}, Ir[Wt + "_" + Ne] = function(r, t, e, i) {
  return r[i + t];
}, Ir[Wt + "_" + Yi] = function(r, t, e, i, n) {
  i += t;
  for (var a = n || [], o = r, s = 0; s < o.length; s++) {
    var l = o[s];
    a[s] = l ? l[i] : null;
  }
  return a;
}, Ir[Le] = xv, Ir[Ve] = function(r, t, e, i, n) {
  for (var a = n || [], o = 0; o < e.length; o++) {
    var s = e[o].name, l = r[s];
    a[o] = l ? l[i] : null;
  }
  return a;
}, Ir[se] = xv, Ir);
function vy(r, t) {
  var e = Xb[th(r, t)];
  return e;
}
var Tv = function(r, t, e) {
  return r.length;
}, Zb = (Er = {}, Er[Wt + "_" + Ne] = function(r, t, e) {
  return Math.max(0, r.length - t);
}, Er[Wt + "_" + Yi] = function(r, t, e) {
  var i = r[0];
  return i ? Math.max(0, i.length - t) : 0;
}, Er[Le] = Tv, Er[Ve] = function(r, t, e) {
  var i = e[0].name, n = r[i];
  return n ? n.length : 0;
}, Er[se] = Tv, Er);
function dy(r, t) {
  var e = Zb[th(r, t)];
  return e;
}
var wl = function(r, t, e) {
  return r[t];
}, qb = (Rr = {}, Rr[Wt] = wl, Rr[Le] = function(r, t, e) {
  return r[e];
}, Rr[Ve] = wl, Rr[se] = function(r, t, e) {
  var i = fa(r);
  return i instanceof Array ? i[t] : i;
}, Rr[or] = wl, Rr);
function py(r) {
  var t = qb[r];
  return t;
}
function th(r, t) {
  return r === Wt ? r + "_" + t : r;
}
function Hi(r, t, e) {
  if (r) {
    var i = r.getRawDataItem(t);
    if (i != null) {
      var n = r.getStore(), a = n.getSource().sourceFormat;
      if (e != null) {
        var o = r.getDimensionIndex(e), s = n.getDimensionProperty(o);
        return py(a)(i, o, s);
      } else {
        var l = i;
        return a === se && (l = fa(i)), l;
      }
    }
  }
}
var Kb = /\{@(.+?)\}/g, eh = (
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
      if ($(a))
        return l.status = e, l.dimensionIndex = n, a(l);
      if (z(a)) {
        var f = Jg(a, l);
        return f.replace(Kb, function(h, v) {
          var c = v.length, d = v;
          d.charAt(0) === "[" && d.charAt(c - 1) === "]" && (d = +d.slice(1, c - 1));
          var y = Hi(s, t, d);
          if (o && N(o.interpolatedValue)) {
            var g = s.getDimensionIndex(d);
            g >= 0 && (y = o.interpolatedValue[g]);
          }
          return y != null ? y + "" : "";
        });
      }
    }, r.prototype.getRawValue = function(t, e) {
      return Hi(this.getData(e), t);
    }, r.prototype.formatTooltip = function(t, e, i) {
    }, r;
  })()
);
function Cv(r) {
  var t, e;
  return V(r) ? r.type && (e = r) : t = r, {
    text: t,
    // markers: markers || markersExisting,
    frag: e
  };
}
function Fn(r) {
  return new Qb(r);
}
var Qb = (
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
            for (var g = 0; g < y.length; g++)
              this._doProgress(y[g], c, d, l, u);
          else
            this._doProgress(y, c, d, l, u);
        }
        this._dueIndex = d;
        var p = this._settedOutputEnd != null ? this._settedOutputEnd : d;
        this._outputDueEnd = p;
      } else
        this._dueIndex = this._outputDueEnd = this._settedOutputEnd != null ? this._settedOutputEnd : this._dueEnd;
      return this.unfinished();
    }, r.prototype.dirty = function() {
      this._dirty = !0, this._onDirty && this._onDirty(this.context);
    }, r.prototype._doProgress = function(t, e, i, n, a) {
      Dv.reset(e, i, n, a), this._callingProgress = t, this._callingProgress({
        start: e,
        end: i,
        count: i - e,
        next: Dv.next
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
), Dv = /* @__PURE__ */ (function() {
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
function Ri(r, t) {
  var e = t && t.type;
  return e === "ordinal" ? r : (e === "time" && !ut(r) && r != null && r !== "-" && (r = +Fe(r)), r == null || r === "" ? NaN : Number(r));
}
Z({
  number: function(r) {
    return parseFloat(r);
  },
  time: function(r) {
    return +Fe(r);
  },
  trim: function(r) {
    return z(r) ? xe(r) : r;
  }
});
var jb = (
  /** @class */
  (function() {
    function r(t, e) {
      var i = t === "desc";
      this._resultLT = i ? 1 : -1, e == null && (e = i ? "min" : "max"), this._incomparable = e === "min" ? -1 / 0 : 1 / 0;
    }
    return r.prototype.evaluate = function(t, e) {
      var i = ut(t) ? t : Ao(t), n = ut(e) ? e : Ao(e), a = isNaN(i), o = isNaN(n);
      if (a && (i = this._incomparable), o && (n = this._incomparable), a && o) {
        var s = z(t), l = z(e);
        s && (i = l ? t : 0), l && (n = s ? e : 0);
      }
      return i < n ? this._resultLT : i > n ? -this._resultLT : 0;
    }, r;
  })()
), Jb = (
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
      return Ri(t, e);
    }, r;
  })()
);
function tx(r, t) {
  var e = new Jb(), i = r.data, n = e.sourceFormat = r.sourceFormat, a = r.startIndex, o = "";
  r.seriesLayoutBy !== Ne && Ft(o);
  var s = [], l = {}, u = r.dimensionsDefine;
  if (u)
    C(u, function(y, g) {
      var p = y.name, m = {
        index: g,
        name: p,
        displayName: y.displayName
      };
      if (s.push(m), p != null) {
        var _ = "";
        Xr(l, p) && Ft(_), l[p] = m;
      }
    });
  else
    for (var f = 0; f < r.dimensionsDetectedCount; f++)
      s.push({
        index: f
      });
  var h = vy(n, Ne);
  t.__isBuiltIn && (e.getRawDataItem = function(y) {
    return h(i, a, s, y);
  }, e.getRawData = ct(ex, null, r)), e.cloneRawData = ct(rx, null, r);
  var v = dy(n, Ne);
  e.count = ct(v, null, i, a, s);
  var c = py(n);
  e.retrieveValue = function(y, g) {
    var p = h(i, a, s, y);
    return d(p, g);
  };
  var d = e.retrieveValueFromItem = function(y, g) {
    if (y != null) {
      var p = s[g];
      if (p)
        return c(y, g, p.name);
    }
  };
  return e.getDimensionInfo = ct(ix, null, s, l), e.cloneAllDimensionInfo = ct(nx, null, s), e;
}
function ex(r) {
  var t = r.sourceFormat;
  if (!rh(t)) {
    var e = "";
    Ft(e);
  }
  return r.data;
}
function rx(r) {
  var t = r.sourceFormat, e = r.data;
  if (!rh(t)) {
    var i = "";
    Ft(i);
  }
  if (t === Wt) {
    for (var n = [], a = 0, o = e.length; a < o; a++)
      n.push(e[a].slice());
    return n;
  } else if (t === Le) {
    for (var n = [], a = 0, o = e.length; a < o; a++)
      n.push(k({}, e[a]));
    return n;
  }
}
function ix(r, t, e) {
  if (e != null) {
    if (ut(e) || !isNaN(e) && !Xr(t, e))
      return r[e];
    if (Xr(t, e))
      return t[e];
  }
}
function nx(r) {
  return q(r);
}
var gy = Z();
function ax(r) {
  r = q(r);
  var t = r.type, e = "";
  t || Ft(e);
  var i = t.split(":");
  i.length !== 2 && Ft(e);
  var n = !1;
  i[0] === "echarts" && (t = i[1], n = !0), r.__isBuiltIn = n, gy.set(t, r);
}
function ox(r, t, e) {
  var i = Rt(r), n = i.length, a = "";
  n || Ft(a);
  for (var o = 0, s = n; o < s; o++) {
    var l = i[o];
    t = sx(l, t), o !== s - 1 && (t.length = Math.max(t.length, 1));
  }
  return t;
}
function sx(r, t, e, i) {
  var n = "";
  t.length || Ft(n), V(r) || Ft(n);
  var a = r.type, o = gy.get(a);
  o || Ft(n);
  var s = H(t, function(u) {
    return tx(u, o);
  }), l = Rt(o.transform({
    upstream: s[0],
    upstreamList: s,
    config: q(r.config)
  }));
  return H(l, function(u, f) {
    var h = "";
    V(u) || Ft(h), u.data || Ft(h);
    var v = fy(u.data);
    rh(v) || Ft(h);
    var c, d = t[0];
    if (d && f === 0 && !u.dimensions) {
      var y = d.startIndex;
      y && (u.data = d.data.slice(0, y).concat(u.data)), c = {
        seriesLayoutBy: Ne,
        sourceHeader: y,
        dimensions: d.metaRawOption.dimensions
      };
    } else
      c = {
        seriesLayoutBy: Ne,
        sourceHeader: 0,
        dimensions: u.dimensions
      };
    return Eu(u.data, c, null);
  });
}
function rh(r) {
  return r === Wt || r === Le;
}
var Ss = "undefined", lx = typeof Uint32Array === Ss ? Array : Uint32Array, ux = typeof Uint16Array === Ss ? Array : Uint16Array, yy = typeof Int32Array === Ss ? Array : Int32Array, Mv = typeof Float64Array === Ss ? Array : Float64Array, my = {
  float: Mv,
  int: yy,
  // Ordinal data type can be string or int
  ordinal: Array,
  number: Array,
  time: Mv
}, bl;
function ci(r) {
  return r > 65535 ? lx : ux;
}
function vi() {
  return [1 / 0, -1 / 0];
}
function fx(r) {
  var t = r.constructor;
  return t === Array ? r.slice() : new t(r);
}
function Av(r, t, e, i, n) {
  var a = my[e || "float"];
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
var Ru = (
  /** @class */
  (function() {
    function r() {
      this._chunks = [], this._rawExtent = [], this._extent = [], this._count = 0, this._rawCount = 0, this._calcDimNameToIdx = Z();
    }
    return r.prototype.initData = function(t, e, i) {
      this._provider = t, this._chunks = [], this._indices = null, this.getRawIndex = this._getRawIdxIdentity;
      var n = t.getSource(), a = this.defaultDimValueGetter = bl[n.sourceFormat];
      this._dimValueGetter = i || a, this._rawExtent = [], hy(n), this._dimensions = H(e, function(o) {
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
      }, i.set(t, a), this._chunks[a] = new my[e || "float"](this._rawCount), this._rawExtent[a] = vi(), a;
    }, r.prototype.collectOrdinalMeta = function(t, e) {
      var i = this._chunks[t], n = this._dimensions[t], a = this._rawExtent, o = n.ordinalOffset || 0, s = i.length;
      o === 0 && (a[t] = vi());
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
        Av(i, u, f.type, l, !0);
      }
      for (var h = [], v = s; v < l; v++)
        for (var c = v - s, d = 0; d < a; d++) {
          var f = n[d], y = bl.arrayRows.call(this, t[c] || h, f.property, c, d);
          i[d][v] = y;
          var g = o[d];
          y < g[0] && (g[0] = y), y > g[1] && (g[1] = y);
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
        l[f] || (l[f] = vi()), Av(a, f, h.type, e, i);
      }
      if (n.fillStorage)
        n.fillStorage(t, e, a, l);
      else
        for (var v = [], c = t; c < e; c++) {
          v = n.getItem(c, v);
          for (var d = 0; d < s; d++) {
            var y = a[d], g = this._dimValueGetter(v, u[d], c, d);
            y[c] = g;
            var p = l[d];
            g < p[0] && (p[0] = g), g > p[1] && (p[1] = g);
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
        var i = ci(this._rawCount);
        t = new i(this.count());
        for (var a = 0; a < t.length; a++)
          t[a] = a;
      }
      return t;
    }, r.prototype.filter = function(t, e) {
      if (!this._count)
        return this;
      for (var i = this.clone(), n = i.count(), a = ci(i._rawCount), o = new a(n), s = [], l = t.length, u = 0, f = t[0], h = i._chunks, v = 0; v < n; v++) {
        var c = void 0, d = i.getRawIndex(v);
        if (l === 0)
          c = e(v);
        else if (l === 1) {
          var y = h[f][d];
          c = e(y, v);
        } else {
          for (var g = 0; g < l; g++)
            s[g] = h[t[g]][d];
          s[g] = v, c = e.apply(null, s);
        }
        c && (o[u++] = d);
      }
      return u < n && (i._indices = o), i._count = u, i._extent = [], i._updateGetRawIdx(), i;
    }, r.prototype.selectRange = function(t) {
      var e = this.clone(), i = e._count;
      if (!i)
        return this;
      var n = vt(t), a = n.length;
      if (!a)
        return this;
      var o = e.count(), s = ci(e._rawCount), l = new s(o), u = 0, f = n[0], h = t[f][0], v = t[f][1], c = e._chunks, d = !1;
      if (!e._indices) {
        var y = 0;
        if (a === 1) {
          for (var g = c[n[0]], p = 0; p < i; p++) {
            var m = g[p];
            (m >= h && m <= v || isNaN(m)) && (l[u++] = y), y++;
          }
          d = !0;
        } else if (a === 2) {
          for (var g = c[n[0]], _ = c[n[1]], S = t[n[1]][0], b = t[n[1]][1], p = 0; p < i; p++) {
            var m = g[p], w = _[p];
            (m >= h && m <= v || isNaN(m)) && (w >= S && w <= b || isNaN(w)) && (l[u++] = y), y++;
          }
          d = !0;
        }
      }
      if (!d)
        if (a === 1)
          for (var p = 0; p < o; p++) {
            var x = e.getRawIndex(p), m = c[n[0]][x];
            (m >= h && m <= v || isNaN(m)) && (l[u++] = x);
          }
        else
          for (var p = 0; p < o; p++) {
            for (var T = !0, x = e.getRawIndex(p), D = 0; D < a; D++) {
              var A = n[D], m = c[A][x];
              (m < t[A][0] || m > t[A][1]) && (T = !1);
            }
            T && (l[u++] = e.getRawIndex(p));
          }
      return u < o && (e._indices = l), e._count = u, e._extent = [], e._updateGetRawIdx(), e;
    }, r.prototype.map = function(t, e) {
      var i = this.clone(t);
      return this._updateDims(i, t, e), i;
    }, r.prototype.modify = function(t, e) {
      this._updateDims(this, t, e);
    }, r.prototype._updateDims = function(t, e, i) {
      for (var n = t._chunks, a = [], o = e.length, s = t.count(), l = [], u = t._rawExtent, f = 0; f < e.length; f++)
        u[e[f]] = vi();
      for (var h = 0; h < s; h++) {
        for (var v = t.getRawIndex(h), c = 0; c < o; c++)
          l[c] = n[e[c]][v];
        l[o] = h;
        var d = i && i.apply(null, l);
        if (d != null) {
          typeof d != "object" && (a[0] = d, d = a);
          for (var f = 0; f < d.length; f++) {
            var y = e[f], g = d[f], p = u[y], m = n[y];
            m && (m[v] = g), g < p[0] && (p[0] = g), g > p[1] && (p[1] = g);
          }
        }
      }
    }, r.prototype.lttbDownSample = function(t, e) {
      var i = this.clone([t], !0), n = i._chunks, a = n[t], o = this.count(), s = 0, l = Math.floor(1 / e), u = this.getRawIndex(0), f, h, v, c = new (ci(this._rawCount))(Math.min((Math.ceil(o / l) + 2) * 2, o));
      c[s++] = u;
      for (var d = 1; d < o - 1; d += l) {
        for (var y = Math.min(d + l, o - 1), g = Math.min(d + l * 2, o), p = (g + y) / 2, m = 0, _ = y; _ < g; _++) {
          var S = this.getRawIndex(_), b = a[S];
          isNaN(b) || (m += b);
        }
        m /= g - y;
        var w = d, x = Math.min(d + l, o), T = d - 1, D = a[u];
        f = -1, v = w;
        for (var A = -1, M = 0, _ = w; _ < x; _++) {
          var S = this.getRawIndex(_), b = a[S];
          if (isNaN(b)) {
            M++, A < 0 && (A = S);
            continue;
          }
          h = Math.abs((T - p) * (b - D) - (T - _) * (m - D)), h > f && (f = h, v = S);
        }
        M > 0 && M < x - w && (c[s++] = Math.min(A, v), v = Math.max(A, v)), c[s++] = v, u = v;
      }
      return c[s++] = this.getRawIndex(o - 1), i._count = s, i._indices = c, i.getRawIndex = this._getRawIdx, i;
    }, r.prototype.minmaxDownSample = function(t, e) {
      for (var i = this.clone([t], !0), n = i._chunks, a = Math.floor(1 / e), o = n[t], s = this.count(), l = new (ci(this._rawCount))(Math.ceil(s / a) * 2), u = 0, f = 0; f < s; f += a) {
        var h = f, v = o[this.getRawIndex(h)], c = f, d = o[this.getRawIndex(c)], y = a;
        f + a > s && (y = s - f);
        for (var g = 0; g < y; g++) {
          var p = this.getRawIndex(f + g), m = o[p];
          m < v && (v = m, h = f + g), m > d && (d = m, c = f + g);
        }
        var _ = this.getRawIndex(h), S = this.getRawIndex(c);
        h < c ? (l[u++] = _, l[u++] = S) : (l[u++] = S, l[u++] = _);
      }
      return i._count = u, i._indices = l, i._updateGetRawIdx(), i;
    }, r.prototype.downSample = function(t, e, i, n) {
      for (var a = this.clone([t], !0), o = a._chunks, s = [], l = Math.floor(1 / e), u = o[t], f = this.count(), h = a._rawExtent[t] = vi(), v = new (ci(this._rawCount))(Math.ceil(f / l)), c = 0, d = 0; d < f; d += l) {
        l > f - d && (l = f - d, s.length = l);
        for (var y = 0; y < l; y++) {
          var g = this.getRawIndex(d + y);
          s[y] = u[g];
        }
        var p = i(s), m = this.getRawIndex(Math.min(d + n(s, p) || 0, f - 1));
        u[m] = p, p < h[0] && (h[0] = p), p > h[1] && (h[1] = p), v[c++] = m;
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
      var e = this._chunks[t], i = vi();
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
      var i = new r(), n = this._chunks, a = t && Gi(t, function(s, l) {
        return s[l] = !0, s;
      }, {});
      if (a)
        for (var o = 0; o < n.length; o++)
          i._chunks[o] = a[o] ? fx(n[o]) : n[o];
      else
        i._chunks = n;
      return this._copyCommonProps(i), e || (i._indices = this._cloneIndices()), i._updateGetRawIdx(), i;
    }, r.prototype._copyCommonProps = function(t) {
      t._count = this._count, t._rawCount = this._rawCount, t._provider = this._provider, t._dimensions = this._dimensions, t._extent = q(this._extent), t._rawExtent = q(this._rawExtent);
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
        return Ri(e[a], this._dimensions[a]);
      }
      bl = {
        arrayRows: t,
        objectRows: function(e, i, n, a) {
          return Ri(e[i], this._dimensions[a]);
        },
        keyedColumns: t,
        original: function(e, i, n, a) {
          var o = e && (e.value == null ? e : e.value);
          return Ri(o instanceof Array ? o[a] : o, this._dimensions[a]);
        },
        typedArray: function(e, i, n, a) {
          return e[a];
        }
      };
    })(), r;
  })()
), hx = (
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
      if (Na(t)) {
        var o = t, s = void 0, l = void 0, u = void 0;
        if (i) {
          var f = e[0];
          f.prepareSource(), u = f.getSource(), s = u.data, l = u.sourceFormat, a = [f._getVersionSign()];
        } else
          s = o.get("data", !0), l = Vt(s) ? or : se, a = [];
        var h = this._getSourceMetaRawOption() || {}, v = u && u.metaRawOption || {}, c = X(h.seriesLayoutBy, v.seriesLayoutBy) || null, d = X(h.sourceHeader, v.sourceHeader), y = X(h.dimensions, v.dimensions), g = c !== v.seriesLayoutBy || !!d != !!v.sourceHeader || y;
        n = g ? [Eu(s, {
          seriesLayoutBy: c,
          sourceHeader: d,
          dimensions: y
        }, l)] : [];
      } else {
        var p = t;
        if (i) {
          var m = this._applyTransform(e);
          n = m.sourceList, a = m.upstreamSignList;
        } else {
          var _ = p.get("source", !0);
          n = [Eu(_, this._getSourceMetaRawOption(), null)], a = [];
        }
      }
      this._setLocalSource(n, a);
    }, r.prototype._applyTransform = function(t) {
      var e = this._sourceHost, i = e.get("transform", !0), n = e.get("fromTransformResult", !0);
      if (n != null) {
        var a = "";
        t.length !== 1 && Lv(a);
      }
      var o, s = [], l = [];
      return C(t, function(u) {
        u.prepareSource();
        var f = u.getSource(n || 0), h = "";
        n != null && !f && Lv(h), s.push(f), l.push(u._getVersionSign());
      }), i ? o = ox(i, s, {
        datasetIndex: e.componentIndex
      }) : n != null && (o = [Wb(s[0])]), {
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
        Na(this._sourceHost) && l ? s = l._innerGetDataStore(t, e, i) : (s = new Ru(), s.initData(new cy(e, t.length), t)), o[i] = s;
      }
      return s;
    }, r.prototype._getUpstreamSourceManagers = function() {
      var t = this._sourceHost;
      if (Na(t)) {
        var e = ny(t);
        return e ? [e.getSourceManager()] : [];
      } else
        return H(mb(t), function(i) {
          return i.getSourceManager();
        });
    }, r.prototype._getSourceMetaRawOption = function() {
      var t = this._sourceHost, e, i, n;
      if (Na(t))
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
function Na(r) {
  return r.mainType === "series";
}
function Lv(r) {
  throw new Error(r);
}
var cx = "line-height:1";
function _y(r) {
  var t = r.lineHeight;
  return t == null ? cx : "line-height:" + Nt(t + "") + "px";
}
function Sy(r, t) {
  var e = r.color || "#6e7079", i = r.fontSize || 12, n = r.fontWeight || "400", a = r.color || "#464646", o = r.fontSize || 14, s = r.fontWeight || "900";
  return t === "html" ? {
    // eslint-disable-next-line max-len
    nameStyle: "font-size:" + Nt(i + "") + "px;color:" + Nt(e) + ";font-weight:" + Nt(n + ""),
    // eslint-disable-next-line max-len
    valueStyle: "font-size:" + Nt(o + "") + "px;color:" + Nt(a) + ";font-weight:" + Nt(s + "")
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
var vx = [0, 10, 20, 30], dx = ["", `
`, `

`, `


`];
function jr(r, t) {
  return t.type = r, t;
}
function ku(r) {
  return r.type === "section";
}
function wy(r) {
  return ku(r) ? px : gx;
}
function by(r) {
  if (ku(r)) {
    var t = 0, e = r.blocks.length, i = e > 1 || e > 0 && !r.noHeader;
    return C(r.blocks, function(n) {
      var a = by(n);
      a >= t && (t = a + +(i && // 0 always can not be readable gap level.
      (!a || ku(n) && !n.noHeader)));
    }), t;
  }
  return 0;
}
function px(r, t, e, i) {
  var n = t.noHeader, a = yx(by(t)), o = [], s = t.blocks || [];
  Be(!s || N(s)), s = s || [];
  var l = r.orderMode;
  if (t.sortBlocks && l) {
    s = s.slice();
    var u = {
      valueAsc: "asc",
      valueDesc: "desc"
    };
    if (Xr(u, l)) {
      var f = new jb(u[l], null);
      s.sort(function(y, g) {
        return f.evaluate(y.sortParam, g.sortParam);
      });
    } else l === "seriesDesc" && s.reverse();
  }
  C(s, function(y, g) {
    var p = t.valueFormatter, m = wy(y)(
      // Inherit valueFormatter
      p ? k(k({}, r), {
        valueFormatter: p
      }) : r,
      y,
      g > 0 ? a.html : 0,
      i
    );
    m != null && o.push(m);
  });
  var h = r.renderMode === "richText" ? o.join(a.richText) : Ou(i, o.join(""), n ? e : a.html);
  if (n)
    return h;
  var v = Iu(t.header, "ordinal", r.useUTC), c = Sy(i, r.renderMode).nameStyle, d = _y(i);
  return r.renderMode === "richText" ? xy(r, v, c) + a.richText + h : Ou(i, '<div style="' + c + ";" + d + ';">' + Nt(v) + "</div>" + h, e);
}
function gx(r, t, e, i) {
  var n = r.renderMode, a = t.noName, o = t.noValue, s = !t.markerType, l = t.name, u = r.useUTC, f = t.valueFormatter || r.valueFormatter || function(S) {
    return S = N(S) ? S : [S], H(S, function(b, w) {
      return Iu(b, N(c) ? c[w] : c, u);
    });
  };
  if (!(a && o)) {
    var h = s ? "" : r.markupStyleCreator.makeTooltipMarker(t.markerType, t.markerColor || "#333", n), v = a ? "" : Iu(l, "ordinal", u), c = t.valueType, d = o ? [] : f(t.value, t.dataIndex), y = !s || !a, g = !s && a, p = Sy(i, n), m = p.nameStyle, _ = p.valueStyle;
    return n === "richText" ? (s ? "" : h) + (a ? "" : xy(r, v, m)) + (o ? "" : Sx(r, d, y, g, _)) : Ou(i, (s ? "" : h) + (a ? "" : mx(v, !s, m)) + (o ? "" : _x(d, y, g, _)), e);
  }
}
function Pv(r, t, e, i, n, a) {
  if (r) {
    var o = wy(r), s = {
      useUTC: n,
      renderMode: e,
      orderMode: i,
      markupStyleCreator: t,
      valueFormatter: r.valueFormatter
    };
    return o(s, r, 0, a);
  }
}
function yx(r) {
  return {
    html: vx[r],
    richText: dx[r]
  };
}
function Ou(r, t, e) {
  var i = '<div style="clear:both"></div>', n = "margin: " + e + "px 0 0", a = _y(r);
  return '<div style="' + n + ";" + a + ';">' + t + i + "</div>";
}
function mx(r, t, e) {
  var i = t ? "margin-left:2px" : "";
  return '<span style="' + e + ";" + i + '">' + Nt(r) + "</span>";
}
function _x(r, t, e, i) {
  var n = e ? "10px" : "20px", a = t ? "float:right;margin-left:" + n : "";
  return r = N(r) ? r : [r], '<span style="' + a + ";" + i + '">' + H(r, function(o) {
    return Nt(o);
  }).join("&nbsp;&nbsp;") + "</span>";
}
function xy(r, t, e) {
  return r.markupStyleCreator.wrapRichTextStyle(t, e);
}
function Sx(r, t, e, i, n) {
  var a = [n], o = i ? 10 : 20;
  return e && a.push({
    padding: [0, 0, 0, o],
    align: "right"
  }), r.markupStyleCreator.wrapRichTextStyle(N(t) ? t.join("  ") : t, a);
}
function bx(r, t) {
  var e = r.getData().getItemVisual(t, "style"), i = e[r.visualDrawType];
  return Qr(i);
}
function Ty(r, t) {
  var e = r.get("padding");
  return e ?? (t === "richText" ? [8, 10] : 10);
}
var xl = (
  /** @class */
  (function() {
    function r() {
      this.richTextStyles = {}, this._nextStyleNameId = eg();
    }
    return r.prototype._generateStyleName = function() {
      return "__EC_aUTo_" + this._nextStyleNameId++;
    }, r.prototype.makeTooltipMarker = function(t, e, i) {
      var n = i === "richText" ? this._generateStyleName() : null, a = fb({
        color: e,
        type: t,
        renderMode: i,
        markerId: n
      });
      return z(a) ? a : (this.richTextStyles[n] = a.style, a.content);
    }, r.prototype.wrapRichTextStyle = function(t, e) {
      var i = {};
      N(e) ? C(e, function(a) {
        return k(i, a);
      }) : k(i, e);
      var n = this._generateStyleName();
      return this.richTextStyles[n] = i, "{" + n + "|" + t + "}";
    }, r;
  })()
);
function xx(r) {
  var t = r.series, e = r.dataIndex, i = r.multipleSeries, n = t.getData(), a = n.mapDimensionsAll("defaultedTooltip"), o = a.length, s = t.getRawValue(e), l = N(s), u = bx(t, e), f, h, v, c;
  if (o > 1 || l && !o) {
    var d = Tx(s, t, e, a, u);
    f = d.inlineValues, h = d.inlineValueTypes, v = d.blocks, c = d.inlineValues[0];
  } else if (o) {
    var y = n.getDimensionInfo(a[0]);
    c = f = Hi(n, e, a[0]), h = y.type;
  } else
    c = f = l ? s[0] : s;
  var g = Af(t), p = g && t.name || "", m = n.getName(e), _ = i ? p : m;
  return jr("section", {
    header: p,
    // When series name is not specified, do not show a header line with only '-'.
    // This case always happens in tooltip.trigger: 'item'.
    noHeader: i || !g,
    sortParam: c,
    blocks: [jr("nameValue", {
      markerType: "item",
      markerColor: u,
      // Do not mix display seriesName and itemName in one tooltip,
      // which might confuses users.
      name: _,
      // name dimension might be auto assigned, where the name might
      // be not readable. So we check trim here.
      noName: !xe(_),
      value: f,
      valueType: h,
      dataIndex: e
    })].concat(v || [])
  });
}
function Tx(r, t, e, i, n) {
  var a = t.getData(), o = Gi(r, function(h, v, c) {
    var d = a.getDimensionInfo(c);
    return h = h || d && d.tooltip !== !1 && d.displayName != null;
  }, !1), s = [], l = [], u = [];
  i.length ? C(i, function(h) {
    f(Hi(a, e, h), h);
  }) : C(r, f);
  function f(h, v) {
    var c = a.getDimensionInfo(v);
    !c || c.otherDims.tooltip === !1 || (o ? u.push(jr("nameValue", {
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
var Ye = gt();
function Ba(r, t) {
  return r.getName(t) || r.getId(t);
}
var Cx = "__universalTransitionEnabled", lr = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e._selectedDataIndicesMap = {}, e;
    }
    return t.prototype.init = function(e, i, n) {
      this.seriesIndex = this.componentIndex, this.dataTask = Fn({
        count: Mx,
        reset: Ax
      }), this.dataTask.context = {
        model: this
      }, this.mergeDefaultAndTheme(e, n);
      var a = Ye(this).sourceManager = new hx(this);
      a.prepareSource();
      var o = this.getInitialData(e, n);
      Ev(o, this), this.dataTask.context.data = o, Ye(this).dataBeforeProcessed = o, Iv(this), this._initSelectedMapFromData(o);
    }, t.prototype.mergeDefaultAndTheme = function(e, i) {
      var n = ea(this), a = n ? ms(e) : {}, o = this.subType;
      nt.hasClass(o) && (o += "Series"), Q(e, i.getTheme().get(this.subType)), Q(e, this.getDefaultOption()), Su(e, "label", ["show"]), this.fillDataTextStyle(e.data), n && zi(e, a, n);
    }, t.prototype.mergeOption = function(e, i) {
      e = Q(this.option, e, !0), this.fillDataTextStyle(e.data);
      var n = ea(this);
      n && zi(this.option, e, n);
      var a = Ye(this).sourceManager;
      a.dirty(), a.prepareSource();
      var o = this.getInitialData(e, i);
      Ev(o, this), this.dataTask.dirty(), this.dataTask.context.data = o, Ye(this).dataBeforeProcessed = o, Iv(this), this._initSelectedMapFromData(o);
    }, t.prototype.fillDataTextStyle = function(e) {
      if (e && !Vt(e))
        for (var i = ["show"], n = 0; n < e.length; n++)
          e[n] && e[n].label && Su(e[n], "label", i);
    }, t.prototype.getInitialData = function(e, i) {
    }, t.prototype.appendData = function(e) {
      var i = this.getRawData();
      i.appendData(e.data);
    }, t.prototype.getData = function(e) {
      var i = Nu(this);
      if (i) {
        var n = i.context.data;
        return e == null || !n.getLinkedData ? n : n.getLinkedData(e);
      } else
        return Ye(this).data;
    }, t.prototype.getAllData = function() {
      var e = this.getData();
      return e && e.getLinkedDataAll ? e.getLinkedDataAll() : [{
        data: e
      }];
    }, t.prototype.setData = function(e) {
      var i = Nu(this);
      if (i) {
        var n = i.context;
        n.outputData = e, i !== this.dataTask && (n.data = e);
      }
      Ye(this).data = e;
    }, t.prototype.getEncode = function() {
      var e = this.get("encode", !0);
      if (e)
        return Z(e);
    }, t.prototype.getSourceManager = function() {
      return Ye(this).sourceManager;
    }, t.prototype.getSource = function() {
      return this.getSourceManager().getSource();
    }, t.prototype.getRawData = function() {
      return Ye(this).dataBeforeProcessed;
    }, t.prototype.getColorBy = function() {
      var e = this.get("colorBy");
      return e || "series";
    }, t.prototype.isColorBySeries = function() {
      return this.getColorBy() === "series";
    }, t.prototype.getBaseAxis = function() {
      var e = this.coordinateSystem;
      return e && e.getBaseAxis && e.getBaseAxis();
    }, t.prototype.formatTooltip = function(e, i, n) {
      return xx({
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
      var a = this.ecModel, o = Kf.prototype.getColorFromPalette.call(this, e, i, n);
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
          var l = e[s], u = Ba(o, l);
          n[u] = !1, this._selectedDataIndicesMap[u] = -1;
        }
      }
    }, t.prototype.toggleSelect = function(e, i) {
      for (var n = [], a = 0; a < e.length; a++)
        n[0] = e[a], this.isSelected(e[a], i) ? this.unselect(n, i) : this.select(n, i);
    }, t.prototype.getSelectedDataIndices = function() {
      if (this.option.selectedMap === "all")
        return [].slice.call(this.getData().getIndices());
      for (var e = this._selectedDataIndicesMap, i = vt(e), n = [], a = 0; a < i.length; a++) {
        var o = e[i[a]];
        o >= 0 && n.push(o);
      }
      return n;
    }, t.prototype.isSelected = function(e, i) {
      var n = this.option.selectedMap;
      if (!n)
        return !1;
      var a = this.getData(i);
      return (n === "all" || n[Ba(a, e)]) && !a.getItemModel(e).get(["select", "disabled"]);
    }, t.prototype.isUniversalTransitionEnabled = function() {
      if (this[Cx])
        return !0;
      var e = this.option.universalTransition;
      return e ? e === !0 ? !0 : e && e.enabled : !1;
    }, t.prototype._innerSelect = function(e, i) {
      var n, a, o = this.option, s = o.selectedMode, l = i.length;
      if (!(!s || !l)) {
        if (s === "series")
          o.selectedMap = "all";
        else if (s === "multiple") {
          V(o.selectedMap) || (o.selectedMap = {});
          for (var u = o.selectedMap, f = 0; f < l; f++) {
            var h = i[f], v = Ba(e, h);
            u[v] = !0, this._selectedDataIndicesMap[v] = e.getRawIndex(h);
          }
        } else if (s === "single" || s === !0) {
          var c = i[l - 1], v = Ba(e, c);
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
      return nt.registerClass(e);
    }, t.protoInitialize = (function() {
      var e = t.prototype;
      e.type = "series.__base__", e.seriesIndex = 0, e.ignoreStyleOnData = !1, e.hasSymbolVisual = !1, e.defaultSymbol = "circle", e.visualStyleAccessPath = "itemStyle", e.visualDrawType = "fill";
    })(), t;
  })(nt)
);
ge(lr, eh);
ge(lr, Kf);
sg(lr, nt);
function Iv(r) {
  var t = r.name;
  Af(r) || (r.name = Dx(r) || t);
}
function Dx(r) {
  var t = r.getRawData(), e = t.mapDimensionsAll("seriesName"), i = [];
  return C(e, function(n) {
    var a = t.getDimensionInfo(n);
    a.displayName && i.push(a.displayName);
  }), i.join(" ");
}
function Mx(r) {
  return r.model.getRawData().count();
}
function Ax(r) {
  var t = r.model;
  return t.setData(t.getRawData().cloneShallow()), Lx;
}
function Lx(r, t) {
  t.outputData && r.end > t.outputData.count() && t.model.getRawData().cloneShallow(t.outputData);
}
function Ev(r, t) {
  C(Z_(r.CHANGABLE_METHODS, r.DOWNSAMPLE_METHODS), function(e) {
    r.wrapMethod(e, lt(Px, t));
  });
}
function Px(r, t) {
  var e = Nu(r);
  return e && e.setOutputEnd((t || this).count()), t;
}
function Nu(r) {
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
var pe = (
  /** @class */
  (function() {
    function r() {
      this.group = new bt(), this.uid = hs("viewComponent");
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
Pf(pe);
Qo(pe);
function Cy() {
  var r = gt();
  return function(t) {
    var e = r(t), i = t.pipelineContext, n = !!e.large, a = !!e.progressiveRender, o = e.large = !!(i && i.large), s = e.progressiveRender = !!(i && i.progressiveRender);
    return (n !== o || a !== s) && "reset";
  };
}
var Dy = gt(), Ix = Cy(), Me = (
  /** @class */
  (function() {
    function r() {
      this.group = new bt(), this.uid = hs("viewChart"), this.renderTask = Fn({
        plan: Ex,
        reset: Rx
      }), this.renderTask.context = {
        view: this
      };
    }
    return r.prototype.init = function(t, e) {
    }, r.prototype.render = function(t, e, i, n) {
    }, r.prototype.highlight = function(t, e, i, n) {
      var a = t.getData(n && n.dataType);
      a && kv(a, n, "emphasis");
    }, r.prototype.downplay = function(t, e, i, n) {
      var a = t.getData(n && n.dataType);
      a && kv(a, n, "normal");
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
      ls(this.group, t);
    }, r.markUpdateMethod = function(t, e) {
      Dy(t).updateMethod = e;
    }, r.protoInitialize = (function() {
      var t = r.prototype;
      t.type = "chart";
    })(), r;
  })()
);
function Rv(r, t, e) {
  r && Mu(r) && (t === "emphasis" ? Qn : jn)(r, e);
}
function kv(r, t, e) {
  var i = qr(r, t), n = t && t.highlightKey != null ? YS(t.highlightKey) : null;
  i != null ? C(Rt(i), function(a) {
    Rv(r.getItemGraphicEl(a), e, n);
  }) : r.eachItemGraphicEl(function(a) {
    Rv(a, e, n);
  });
}
Pf(Me);
Qo(Me);
function Ex(r) {
  return Ix(r.model);
}
function Rx(r) {
  var t = r.model, e = r.ecModel, i = r.api, n = r.payload, a = t.pipelineContext.progressiveRender, o = r.view, s = n && Dy(n).updateMethod, l = a ? "incrementalPrepareRender" : s && o[s] ? s : "render";
  return l !== "render" && o[l](t, e, i, n), kx[l];
}
var kx = {
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
}, Bo = "\0__throttleOriginMethod", Ov = "\0__throttleRate", Nv = "\0__throttleType";
function My(r, t, e) {
  var i, n = 0, a = 0, o = null, s, l, u, f;
  t = t || 0;
  function h() {
    a = (/* @__PURE__ */ new Date()).getTime(), o = null, r.apply(l, u || []);
  }
  var v = function() {
    for (var c = [], d = 0; d < arguments.length; d++)
      c[d] = arguments[d];
    i = (/* @__PURE__ */ new Date()).getTime(), l = this, u = c;
    var y = f || t, g = f || e;
    f = null, s = i - (g ? n : a) - y, clearTimeout(o), g ? o = setTimeout(h, y) : s >= 0 ? h() : o = setTimeout(h, -s), n = i;
  };
  return v.clear = function() {
    o && (clearTimeout(o), o = null);
  }, v.debounceNextCall = function(c) {
    f = c;
  }, v;
}
function Ay(r, t, e, i) {
  var n = r[t];
  if (n) {
    var a = n[Bo] || n, o = n[Nv], s = n[Ov];
    if (s !== e || o !== i) {
      if (e == null || !i)
        return r[t] = a;
      n = r[t] = My(a, e, i === "debounce"), n[Bo] = a, n[Nv] = i, n[Ov] = e;
    }
    return n;
  }
}
function Bu(r, t) {
  var e = r[t];
  e && e[Bo] && (e.clear && e.clear(), r[t] = e[Bo]);
}
var Bv = gt(), Fv = {
  itemStyle: Kn(Hg, !0),
  lineStyle: Kn(zg, !0)
}, Ox = {
  lineStyle: "stroke",
  itemStyle: "fill"
};
function Ly(r, t) {
  var e = r.visualStyleMapper || Fv[t];
  return e || (console.warn("Unknown style type '" + t + "'."), Fv.itemStyle);
}
function Py(r, t) {
  var e = r.visualDrawType || Ox[t];
  return e || (console.warn("Unknown style type '" + t + "'."), "fill");
}
var Nx = {
  createOnAllSeries: !0,
  performRawSeries: !0,
  reset: function(r, t) {
    var e = r.getData(), i = r.visualStyleAccessPath || "itemStyle", n = r.getModel(i), a = Ly(r, i), o = a(n), s = n.getShallow("decal");
    s && (e.setVisual("decal", s), s.dirty = !0);
    var l = Py(r, i), u = o[l], f = $(u) ? u : null, h = o.fill === "auto" || o.stroke === "auto";
    if (!o[l] || f || h) {
      var v = r.getColorFromPalette(
        // TODO series count changed.
        r.name,
        null,
        t.getSeriesCount()
      );
      o[l] || (o[l] = v, e.setVisual("colorFromPalette", !0)), o.fill = o.fill === "auto" || $(o.fill) ? v : o.fill, o.stroke = o.stroke === "auto" || $(o.stroke) ? v : o.stroke;
    }
    if (e.setVisual("style", o), e.setVisual("drawType", l), !t.isSeriesFiltered(r) && f)
      return e.setVisual("colorFromPalette", !1), {
        dataEach: function(c, d) {
          var y = r.getDataParams(d), g = k({}, o);
          g[l] = f(y), c.setItemVisual(d, "style", g);
        }
      };
  }
}, ln = new pt(), Bx = {
  createOnAllSeries: !0,
  performRawSeries: !0,
  reset: function(r, t) {
    if (!(r.ignoreStyleOnData || t.isSeriesFiltered(r))) {
      var e = r.getData(), i = r.visualStyleAccessPath || "itemStyle", n = Ly(r, i), a = e.getVisual("drawType");
      return {
        dataEach: e.hasItemOption ? function(o, s) {
          var l = o.getRawDataItem(s);
          if (l && l[i]) {
            ln.option = l[i];
            var u = n(ln), f = o.ensureUniqueItemVisual(s, "style");
            k(f, u), ln.option.decal && (o.setItemVisual(s, "decal", ln.option.decal), ln.option.decal.dirty = !0), a in u && o.setItemVisual(s, "colorFromPalette", !1);
          }
        } : null
      };
    }
  }
}, Fx = {
  performRawSeries: !0,
  overallReset: function(r) {
    var t = Z();
    r.eachSeries(function(e) {
      var i = e.getColorBy();
      if (!e.isColorBySeries()) {
        var n = e.type + "-" + i, a = t.get(n);
        a || (a = {}, t.set(n, a)), Bv(e).scope = a;
      }
    }), r.eachSeries(function(e) {
      if (!(e.isColorBySeries() || r.isSeriesFiltered(e))) {
        var i = e.getRawData(), n = {}, a = e.getData(), o = Bv(e).scope, s = e.visualStyleAccessPath || "itemStyle", l = Py(e, s);
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
}, Fa = Math.PI;
function zx(r, t) {
  t = t || {}, at(t, {
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
  var e = new bt(), i = new Dt({
    style: {
      fill: t.maskColor
    },
    zlevel: t.zlevel,
    z: 1e4
  });
  e.add(i);
  var n = new Gt({
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
  }), a = new Dt({
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
  return t.showSpinner && (o = new os({
    shape: {
      startAngle: -Fa / 2,
      endAngle: -Fa / 2 + 0.1,
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
    endAngle: Fa * 3 / 2
  }).start("circularInOut"), o.animateShape(!0).when(1e3, {
    startAngle: Fa * 3 / 2
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
var Iy = (
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
      C(this._allHandlers, function(n) {
        var a = t.get(n.uid) || t.set(n.uid, {}), o = "";
        Be(!(n.reset && n.overallReset), o), n.reset && this._createSeriesStageTask(n, a, e, i), n.overallReset && this._createOverallStageTask(n, a, e, i);
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
      C(t, function(l, u) {
        if (!(n.visualType && n.visualType !== l.visualType)) {
          var f = o._stageTaskMap.get(l.uid), h = f.seriesTaskMap, v = f.overallTask;
          if (v) {
            var c, d = v.agentStubMap;
            d.each(function(g) {
              s(n, g) && (g.dirty(), c = !0);
            }), c && v.dirty(), o.updatePayload(v, i);
            var y = o.getPerformArgs(v, n.block);
            d.each(function(g) {
              g.perform(y);
            }), v.perform(y) && (a = !0);
          } else h && h.each(function(g, p) {
            s(n, g) && g.dirty();
            var m = o.getPerformArgs(g, n.block);
            m.skip = !l.performRawSeries && e.isSeriesFiltered(g.context.model), o.updatePayload(g, i), g.perform(m) && (a = !0);
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
        var v = h.uid, c = s.set(v, o && o.get(v) || Fn({
          plan: Wx,
          reset: Ux,
          count: Xx
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
      var a = this, o = e.overallTask = e.overallTask || Fn({
        reset: Hx
      });
      o.context = {
        ecModel: i,
        api: n,
        overallReset: t.overallReset,
        scheduler: a
      };
      var s = o.agentStubMap, l = o.agentStubMap = Z(), u = t.seriesType, f = t.getTargetSeries, h = !0, v = !1, c = "";
      Be(!t.createOnAllSeries, c), u ? i.eachRawSeriesByType(u, d) : f ? f(i, n).each(d) : (h = !1, C(i.getSeries(), d));
      function d(y) {
        var g = y.uid, p = l.set(g, s && s.get(g) || // When the result of `getTargetSeries` changed, the overallTask
        // should be set as dirty and re-performed.
        (v = !0, Fn({
          reset: $x,
          onDirty: Gx
        })));
        p.context = {
          model: y,
          overallProgress: h
          // FIXME:TS never used, so comment it
          // modifyOutputEnd: modifyOutputEnd
        }, p.agent = o, p.__block = h, a._pipe(y, p);
      }
      v && o.dirty();
    }, r.prototype._pipe = function(t, e) {
      var i = t.uid, n = this._pipelineMap.get(i);
      !n.head && (n.head = e), n.tail && n.tail.pipe(e), n.tail = e, e.__idxInPipeline = n.count++, e.__pipeline = n;
    }, r.wrapStageHandler = function(t, e) {
      return $(t) && (t = {
        overallReset: t,
        seriesType: Zx(t)
      }), t.uid = hs("stageHandler"), e && (t.visualType = e), t;
    }, r;
  })()
);
function Hx(r) {
  r.overallReset(r.ecModel, r.api, r.payload);
}
function $x(r) {
  return r.overallProgress && Vx;
}
function Vx() {
  this.agent.dirty(), this.getDownstream().dirty();
}
function Gx() {
  this.agent && this.agent.dirty();
}
function Wx(r) {
  return r.plan ? r.plan(r.model, r.ecModel, r.api, r.payload) : null;
}
function Ux(r) {
  r.useClearVisual && r.data.clearAllVisual();
  var t = r.resetDefines = Rt(r.reset(r.model, r.ecModel, r.api, r.payload));
  return t.length > 1 ? H(t, function(e, i) {
    return Ey(i);
  }) : Yx;
}
var Yx = Ey(0);
function Ey(r) {
  return function(t, e) {
    var i = e.data, n = e.resetDefines[r];
    if (n && n.dataEach)
      for (var a = t.start; a < t.end; a++)
        n.dataEach(i, a);
    else n && n.progress && n.progress(t, i);
  };
}
function Xx(r) {
  return r.data.count();
}
function Zx(r) {
  Fo = null;
  try {
    r(ia, Ry);
  } catch {
  }
  return Fo;
}
var ia = {}, Ry = {}, Fo;
ky(ia, Qf);
ky(Ry, oy);
ia.eachSeriesByType = ia.eachRawSeriesByType = function(r) {
  Fo = r;
};
ia.eachComponent = function(r) {
  r.mainType === "series" && r.subType && (Fo = r.subType);
};
function ky(r, t) {
  for (var e in t.prototype)
    r[e] = Ht;
}
var zv = ["#37A2DA", "#32C5E9", "#67E0E3", "#9FE6B8", "#FFDB5C", "#ff9f7f", "#fb7293", "#E062AE", "#E690D1", "#e7bcf3", "#9d96f5", "#8378EA", "#96BFFF"];
const qx = {
  color: zv,
  colorLayer: [["#37A2DA", "#ffd85c", "#fd7b5f"], ["#37A2DA", "#67E0E3", "#FFDB5C", "#ff9f7f", "#E062AE", "#9d96f5"], ["#37A2DA", "#32C5E9", "#9FE6B8", "#FFDB5C", "#ff9f7f", "#fb7293", "#e7bcf3", "#8378EA", "#96BFFF"], zv]
};
var Lt = "#B9B8CE", Hv = "#100C2A", za = function() {
  return {
    axisLine: {
      lineStyle: {
        color: Lt
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
}, $v = ["#4992ff", "#7cffb2", "#fddd60", "#ff6e76", "#58d9f9", "#05c091", "#ff8a45", "#8d48e3", "#dd79ff"], Oy = {
  darkMode: !0,
  color: $v,
  backgroundColor: Hv,
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
      color: Lt
    },
    pageTextStyle: {
      color: Lt
    }
  },
  textStyle: {
    color: Lt
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
      borderColor: Lt
    }
  },
  dataZoom: {
    borderColor: "#71708A",
    textStyle: {
      color: Lt
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
      color: Lt
    }
  },
  timeline: {
    lineStyle: {
      color: Lt
    },
    label: {
      color: Lt
    },
    controlStyle: {
      color: Lt,
      borderColor: Lt
    }
  },
  calendar: {
    itemStyle: {
      color: Hv
    },
    dayLabel: {
      color: Lt
    },
    monthLabel: {
      color: Lt
    },
    yearLabel: {
      color: Lt
    }
  },
  timeAxis: za(),
  logAxis: za(),
  valueAxis: za(),
  categoryAxis: za(),
  line: {
    symbol: "circle"
  },
  graph: {
    color: $v
  },
  gauge: {
    title: {
      color: Lt
    },
    axisLine: {
      lineStyle: {
        color: [[1, "rgba(207,212,219,0.2)"]]
      }
    },
    axisLabel: {
      color: Lt
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
Oy.categoryAxis.splitLine.show = !1;
var Kx = (
  /** @class */
  (function() {
    function r() {
    }
    return r.prototype.normalizeQuery = function(t) {
      var e = {}, i = {}, n = {};
      if (z(t)) {
        var a = Ce(t);
        e.mainType = a.main || null, e.subType = a.sub || null;
      } else {
        var o = ["Index", "Name", "Id"], s = {
          name: 1,
          dataIndex: 1,
          dataType: 1
        };
        C(t, function(l, u) {
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
), Fu = ["symbol", "symbolSize", "symbolRotate", "symbolOffset"], Vv = Fu.concat(["symbolKeepAspect"]), Qx = {
  createOnAllSeries: !0,
  // For legend.
  performRawSeries: !0,
  reset: function(r, t) {
    var e = r.getData();
    if (r.legendIcon && e.setVisual("legendIcon", r.legendIcon), !r.hasSymbolVisual)
      return;
    for (var i = {}, n = {}, a = !1, o = 0; o < Fu.length; o++) {
      var s = Fu[o], l = r.get(s);
      $(l) ? (a = !0, n[s] = l) : i[s] = l;
    }
    if (i.symbol = i.symbol || r.defaultSymbol, e.setVisual(k({
      legendIcon: r.legendIcon || i.symbol,
      symbolKeepAspect: r.get("symbolKeepAspect")
    }, i)), t.isSeriesFiltered(r))
      return;
    var u = vt(n);
    function f(h, v) {
      for (var c = r.getRawValue(v), d = r.getDataParams(v), y = 0; y < u.length; y++) {
        var g = u[y];
        h.setItemVisual(v, g, n[g](c, d));
      }
    }
    return {
      dataEach: a ? f : null
    };
  }
}, jx = {
  createOnAllSeries: !0,
  // For legend.
  performRawSeries: !0,
  reset: function(r, t) {
    if (!r.hasSymbolVisual || t.isSeriesFiltered(r))
      return;
    var e = r.getData();
    function i(n, a) {
      for (var o = n.getItemModel(a), s = 0; s < Vv.length; s++) {
        var l = Vv[s], u = o.getShallow(l, !0);
        u != null && n.setItemVisual(a, l, u);
      }
    }
    return {
      dataEach: e.hasItemOption ? i : null
    };
  }
};
function Jx(r, t, e) {
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
function ih(r, t) {
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
function di(r, t, e, i, n) {
  var a = r + t;
  e.isSilent(a) || i.eachComponent({
    mainType: "series",
    subType: "pie"
  }, function(o) {
    for (var s = o.seriesIndex, l = o.option.selectedMap, u = n.selected, f = 0; f < u.length; f++)
      if (u[f].seriesIndex === s) {
        var h = o.getData(), v = qr(h, n.fromActionPayload);
        e.trigger(a, {
          type: a,
          seriesId: o.id,
          name: N(v) ? h.getName(v[0]) : h.getName(v),
          selected: z(l) ? l : k({}, l)
        });
      }
  });
}
function tT(r, t, e) {
  r.on("selectchanged", function(i) {
    var n = e.getModel();
    i.isFromClick ? (di("map", "selectchanged", t, n, i), di("pie", "selectchanged", t, n, i)) : i.fromAction === "select" ? (di("map", "selected", t, n, i), di("pie", "selected", t, n, i)) : i.fromAction === "unselect" && (di("map", "unselected", t, n, i), di("pie", "unselected", t, n, i));
  });
}
function Tn(r, t, e) {
  for (var i; r && !(t(r) && (i = r, e)); )
    r = r.__hostTarget || r.parent;
  return i;
}
var eT = Math.round(Math.random() * 9), rT = typeof Object.defineProperty == "function", iT = (function() {
  function r() {
    this._id = "__ec_inner_" + eT++;
  }
  return r.prototype.get = function(t) {
    return this._guard(t)[this._id];
  }, r.prototype.set = function(t, e) {
    var i = this._guard(t);
    return rT ? Object.defineProperty(i, this._id, {
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
})(), nT = ot.extend({
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
}), aT = ot.extend({
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
}), oT = ot.extend({
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
}), sT = ot.extend({
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
}), lT = {
  line: ze,
  rect: Dt,
  roundRect: Dt,
  square: Dt,
  circle: is,
  diamond: aT,
  pin: oT,
  arrow: sT,
  triangle: nT
}, uT = {
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
}, zu = {};
C(lT, function(r, t) {
  zu[t] = new r();
});
var fT = ot.extend({
  type: "symbol",
  shape: {
    symbolType: "",
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  calculateTextPosition: function(r, t, e) {
    var i = qp(r, t, e), n = this.shape;
    return n && n.symbolType === "pin" && t.position === "inside" && (i.y = e.y + e.height * 0.4), i;
  },
  buildPath: function(r, t, e) {
    var i = t.symbolType;
    if (i !== "none") {
      var n = zu[i];
      n || (i = "rect", n = zu[i]), uT[i](t.x, t.y, t.width, t.height, n.shape), n.buildPath(r, n.shape, e);
    }
  }
});
function hT(r, t) {
  if (this.type !== "image") {
    var e = this.style;
    this.__isEmptyBrush ? (e.stroke = r, e.fill = t || "#fff", e.lineWidth = 2) : this.shape.symbolType === "line" ? e.stroke = r : e.fill = r, this.markRedraw();
  }
}
function Jr(r, t, e, i, n, a, o) {
  var s = r.indexOf("empty") === 0;
  s && (r = r.substr(5, 1).toLowerCase() + r.substr(6));
  var l;
  return r.indexOf("image://") === 0 ? l = Rg(r.slice(8), new rt(t, e, i, n), o ? "center" : "cover") : r.indexOf("path://") === 0 ? l = $f(r.slice(7), {}, new rt(t, e, i, n), o ? "center" : "cover") : l = new fT({
    shape: {
      symbolType: r,
      x: t,
      y: e,
      width: i,
      height: n
    }
  }), l.__isEmptyBrush = s, l.setColor = hT, a && l.setColor(a), l;
}
function nh(r) {
  return N(r) || (r = [+r, +r]), [r[0] || 0, r[1] || 0];
}
function ws(r, t) {
  if (r != null)
    return N(r) || (r = [r, r]), [St(r[0], t[0]) || 0, St(X(r[1], r[0]), t[1]) || 0];
}
function zr(r) {
  return isFinite(r);
}
function cT(r, t, e) {
  var i = t.x == null ? 0 : t.x, n = t.x2 == null ? 1 : t.x2, a = t.y == null ? 0 : t.y, o = t.y2 == null ? 0 : t.y2;
  t.global || (i = i * e.width + e.x, n = n * e.width + e.x, a = a * e.height + e.y, o = o * e.height + e.y), i = zr(i) ? i : 0, n = zr(n) ? n : 1, a = zr(a) ? a : 0, o = zr(o) ? o : 0;
  var s = r.createLinearGradient(i, a, n, o);
  return s;
}
function vT(r, t, e) {
  var i = e.width, n = e.height, a = Math.min(i, n), o = t.x == null ? 0.5 : t.x, s = t.y == null ? 0.5 : t.y, l = t.r == null ? 0.5 : t.r;
  t.global || (o = o * i + e.x, s = s * n + e.y, l = l * a), o = zr(o) ? o : 0.5, s = zr(s) ? s : 0.5, l = l >= 0 && zr(l) ? l : 0.5;
  var u = r.createRadialGradient(o, s, 0, o, s, l);
  return u;
}
function Hu(r, t, e) {
  for (var i = t.type === "radial" ? vT(r, t, e) : cT(r, t, e), n = t.colorStops, a = 0; a < n.length; a++)
    i.addColorStop(n[a].offset, n[a].color);
  return i;
}
function dT(r, t) {
  if (r === t || !r && !t)
    return !1;
  if (!r || !t || r.length !== t.length)
    return !0;
  for (var e = 0; e < r.length; e++)
    if (r[e] !== t[e])
      return !0;
  return !1;
}
function Ha(r) {
  return parseInt(r, 10);
}
function $a(r, t, e) {
  var i = ["width", "height"][t], n = ["clientWidth", "clientHeight"][t], a = ["paddingLeft", "paddingTop"][t], o = ["paddingRight", "paddingBottom"][t];
  if (e[i] != null && e[i] !== "auto")
    return parseFloat(e[i]);
  var s = document.defaultView.getComputedStyle(r);
  return (r[n] || Ha(s[i]) || Ha(r.style[i])) - (Ha(s[a]) || 0) - (Ha(s[o]) || 0) | 0;
}
function pT(r, t) {
  return !r || r === "solid" || !(t > 0) ? null : r === "dashed" ? [4 * t, 2 * t] : r === "dotted" ? [t] : ut(r) ? [r] : N(r) ? r : null;
}
function Ny(r) {
  var t = r.style, e = t.lineDash && t.lineWidth > 0 && pT(t.lineDash, t.lineWidth), i = t.lineDashOffset;
  if (e) {
    var n = t.strokeNoScale && r.getLineScale ? r.getLineScale() : 1;
    n && n !== 1 && (e = H(e, function(a) {
      return a / n;
    }), i /= n);
  }
  return [e, i];
}
var gT = new Kr(!0);
function zo(r) {
  var t = r.stroke;
  return !(t == null || t === "none" || !(r.lineWidth > 0));
}
function Gv(r) {
  return typeof r == "string" && r !== "none";
}
function Ho(r) {
  var t = r.fill;
  return t != null && t !== "none";
}
function Wv(r, t) {
  if (t.fillOpacity != null && t.fillOpacity !== 1) {
    var e = r.globalAlpha;
    r.globalAlpha = t.fillOpacity * t.opacity, r.fill(), r.globalAlpha = e;
  } else
    r.fill();
}
function Uv(r, t) {
  if (t.strokeOpacity != null && t.strokeOpacity !== 1) {
    var e = r.globalAlpha;
    r.globalAlpha = t.strokeOpacity * t.opacity, r.stroke(), r.globalAlpha = e;
  } else
    r.stroke();
}
function $u(r, t, e) {
  var i = lg(t.image, t.__image, e);
  if (jo(i)) {
    var n = r.createPattern(i, t.repeat || "repeat");
    if (typeof DOMMatrix == "function" && n && n.setTransform) {
      var a = new DOMMatrix();
      a.translateSelf(t.x || 0, t.y || 0), a.rotateSelf(0, 0, (t.rotation || 0) * q_), a.scaleSelf(t.scaleX || 1, t.scaleY || 1), n.setTransform(a);
    }
    return n;
  }
}
function yT(r, t, e, i) {
  var n, a = zo(e), o = Ho(e), s = e.strokePercent, l = s < 1, u = !t.path;
  (!t.silent || l) && u && t.createPathProxy();
  var f = t.path || gT, h = t.__dirty;
  if (!i) {
    var v = e.fill, c = e.stroke, d = o && !!v.colorStops, y = a && !!c.colorStops, g = o && !!v.image, p = a && !!c.image, m = void 0, _ = void 0, S = void 0, b = void 0, w = void 0;
    (d || y) && (w = t.getBoundingRect()), d && (m = h ? Hu(r, v, w) : t.__canvasFillGradient, t.__canvasFillGradient = m), y && (_ = h ? Hu(r, c, w) : t.__canvasStrokeGradient, t.__canvasStrokeGradient = _), g && (S = h || !t.__canvasFillPattern ? $u(r, v, t) : t.__canvasFillPattern, t.__canvasFillPattern = S), p && (b = h || !t.__canvasStrokePattern ? $u(r, c, t) : t.__canvasStrokePattern, t.__canvasStrokePattern = S), d ? r.fillStyle = m : g && (S ? r.fillStyle = S : o = !1), y ? r.strokeStyle = _ : p && (b ? r.strokeStyle = b : a = !1);
  }
  var x = t.getGlobalScale();
  f.setScale(x[0], x[1], t.segmentIgnoreThreshold);
  var T, D;
  r.setLineDash && e.lineDash && (n = Ny(t), T = n[0], D = n[1]);
  var A = !0;
  (u || h & _i) && (f.setDPR(r.dpr), l ? f.setContext(null) : (f.setContext(r), A = !1), f.reset(), t.buildPath(f, t.shape, i), f.toStatic(), t.pathUpdated()), A && f.rebuildPath(r, l ? s : 1), T && (r.setLineDash(T), r.lineDashOffset = D), i || (e.strokeFirst ? (a && Uv(r, e), o && Wv(r, e)) : (o && Wv(r, e), a && Uv(r, e))), T && r.setLineDash([]);
}
function mT(r, t, e) {
  var i = t.__image = lg(e.image, t.__image, t, t.onload);
  if (!(!i || !jo(i))) {
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
function _T(r, t, e) {
  var i, n = e.text;
  if (n != null && (n += ""), n) {
    r.font = e.font || Yr, r.textAlign = e.textAlign, r.textBaseline = e.textBaseline;
    var a = void 0, o = void 0;
    r.setLineDash && e.lineDash && (i = Ny(t), a = i[0], o = i[1]), a && (r.setLineDash(a), r.lineDashOffset = o), e.strokeFirst ? (zo(e) && r.strokeText(n, e.x, e.y), Ho(e) && r.fillText(n, e.x, e.y)) : (Ho(e) && r.fillText(n, e.x, e.y), zo(e) && r.strokeText(n, e.x, e.y)), a && r.setLineDash([]);
  }
}
var Yv = ["shadowBlur", "shadowOffsetX", "shadowOffsetY"], Xv = [
  ["lineCap", "butt"],
  ["lineJoin", "miter"],
  ["miterLimit", 10]
];
function By(r, t, e, i, n) {
  var a = !1;
  if (!i && (e = e || {}, t === e))
    return !1;
  if (i || t.opacity !== e.opacity) {
    zt(r, n), a = !0;
    var o = Math.max(Math.min(t.opacity, 1), 0);
    r.globalAlpha = isNaN(o) ? Vr.opacity : o;
  }
  (i || t.blend !== e.blend) && (a || (zt(r, n), a = !0), r.globalCompositeOperation = t.blend || Vr.blend);
  for (var s = 0; s < Yv.length; s++) {
    var l = Yv[s];
    (i || t[l] !== e[l]) && (a || (zt(r, n), a = !0), r[l] = r.dpr * (t[l] || 0));
  }
  return (i || t.shadowColor !== e.shadowColor) && (a || (zt(r, n), a = !0), r.shadowColor = t.shadowColor || Vr.shadowColor), a;
}
function Zv(r, t, e, i, n) {
  var a = na(t, n.inHover), o = i ? null : e && na(e, n.inHover) || {};
  if (a === o)
    return !1;
  var s = By(r, a, o, i, n);
  if ((i || a.fill !== o.fill) && (s || (zt(r, n), s = !0), Gv(a.fill) && (r.fillStyle = a.fill)), (i || a.stroke !== o.stroke) && (s || (zt(r, n), s = !0), Gv(a.stroke) && (r.strokeStyle = a.stroke)), (i || a.opacity !== o.opacity) && (s || (zt(r, n), s = !0), r.globalAlpha = a.opacity == null ? 1 : a.opacity), t.hasStroke()) {
    var l = a.lineWidth, u = l / (a.strokeNoScale && t.getLineScale ? t.getLineScale() : 1);
    r.lineWidth !== u && (s || (zt(r, n), s = !0), r.lineWidth = u);
  }
  for (var f = 0; f < Xv.length; f++) {
    var h = Xv[f], v = h[0];
    (i || a[v] !== o[v]) && (s || (zt(r, n), s = !0), r[v] = a[v] || h[1]);
  }
  return s;
}
function ST(r, t, e, i, n) {
  return By(r, na(t, n.inHover), e && na(e, n.inHover), i, n);
}
function Fy(r, t) {
  var e = t.transform, i = r.dpr || 1;
  e ? r.setTransform(i * e[0], i * e[1], i * e[2], i * e[3], i * e[4], i * e[5]) : r.setTransform(i, 0, 0, i, 0, 0);
}
function wT(r, t, e) {
  for (var i = !1, n = 0; n < r.length; n++) {
    var a = r[n];
    i = i || a.isZeroArea(), Fy(t, a), t.beginPath(), a.buildPath(t, a.shape), t.clip();
  }
  e.allClipped = i;
}
function bT(r, t) {
  return r && t ? r[0] !== t[0] || r[1] !== t[1] || r[2] !== t[2] || r[3] !== t[3] || r[4] !== t[4] || r[5] !== t[5] : !(!r && !t);
}
var qv = 1, Kv = 2, Qv = 3, jv = 4;
function xT(r) {
  var t = Ho(r), e = zo(r);
  return !(r.lineDash || !(+t ^ +e) || t && typeof r.fill != "string" || e && typeof r.stroke != "string" || r.strokePercent < 1 || r.strokeOpacity < 1 || r.fillOpacity < 1);
}
function zt(r, t) {
  t.batchFill && r.fill(), t.batchStroke && r.stroke(), t.batchFill = "", t.batchStroke = "";
}
function na(r, t) {
  return t && r.__hoverStyle || r.style;
}
function zy(r, t) {
  Hr(r, t, { inHover: !1, viewWidth: 0, viewHeight: 0 }, !0);
}
function Hr(r, t, e, i) {
  var n = t.transform;
  if (!t.shouldBePainted(e.viewWidth, e.viewHeight, !1, !1)) {
    t.__dirty &= ~Xt, t.__isRendered = !1;
    return;
  }
  var a = t.__clipPaths, o = e.prevElClipPaths, s = !1, l = !1;
  if ((!o || dT(a, o)) && (o && o.length && (zt(r, e), r.restore(), l = s = !0, e.prevElClipPaths = null, e.allClipped = !1, e.prevEl = null), a && a.length && (zt(r, e), r.save(), wT(a, r, e), s = !0), e.prevElClipPaths = a), e.allClipped) {
    t.__isRendered = !1;
    return;
  }
  t.beforeBrush && t.beforeBrush(), t.innerBeforeBrush();
  var u = e.prevEl;
  u || (l = s = !0);
  var f = t instanceof ot && t.autoBatch && xT(t.style);
  s || bT(n, u.transform) ? (zt(r, e), Fy(r, t)) : f || zt(r, e);
  var h = na(t, e.inHover);
  t instanceof ot ? (e.lastDrawType !== qv && (l = !0, e.lastDrawType = qv), Zv(r, t, u, l, e), (!f || !e.batchFill && !e.batchStroke) && r.beginPath(), yT(r, t, h, f), f && (e.batchFill = h.fill || "", e.batchStroke = h.stroke || "")) : t instanceof Lo ? (e.lastDrawType !== Qv && (l = !0, e.lastDrawType = Qv), Zv(r, t, u, l, e), _T(r, t, h)) : t instanceof fr ? (e.lastDrawType !== Kv && (l = !0, e.lastDrawType = Kv), ST(r, t, u, l, e), mT(r, t, h)) : t.getTemporalDisplayables && (e.lastDrawType !== jv && (l = !0, e.lastDrawType = jv), TT(r, t, e)), f && i && zt(r, e), t.innerAfterBrush(), t.afterBrush && t.afterBrush(), e.prevEl = t, t.__dirty = 0, t.__isRendered = !0;
}
function TT(r, t, e) {
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
    l.beforeBrush && l.beforeBrush(), l.innerBeforeBrush(), Hr(r, l, a, o === s - 1), l.innerAfterBrush(), l.afterBrush && l.afterBrush(), a.prevEl = l;
  }
  for (var u = 0, f = n.length; u < f; u++) {
    var l = n[u];
    l.beforeBrush && l.beforeBrush(), l.innerBeforeBrush(), Hr(r, l, a, u === f - 1), l.innerAfterBrush(), l.afterBrush && l.afterBrush(), a.prevEl = l;
  }
  t.clearTemporalDisplayables(), t.notClear = !0, r.restore();
}
var Tl = new iT(), Jv = new ua(100), td = ["symbol", "symbolSize", "symbolKeepAspect", "color", "backgroundColor", "dashArrayX", "dashArrayY", "maxTileWidth", "maxTileHeight"];
function Vu(r, t) {
  if (r === "none")
    return null;
  var e = t.getDevicePixelRatio(), i = t.getZr(), n = i.painter.type === "svg";
  r.dirty && Tl.delete(r);
  var a = Tl.get(r);
  if (a)
    return a;
  var o = at(r, {
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
  return l(s), s.rotation = o.rotation, s.scaleX = s.scaleY = n ? 1 : 1 / e, Tl.set(r, s), r.dirty = !1, s;
  function l(u) {
    for (var f = [e], h = !0, v = 0; v < td.length; ++v) {
      var c = o[td[v]];
      if (c != null && !N(c) && !z(c) && !ut(c) && typeof c != "boolean") {
        h = !1;
        break;
      }
      f.push(c);
    }
    var d;
    if (h) {
      d = f.join(",") + (n ? "-svg" : "");
      var y = Jv.get(d);
      y && (n ? u.svgElement = y : u.image = y);
    }
    var g = $y(o.dashArrayX), p = CT(o.dashArrayY), m = Hy(o.symbol), _ = DT(g), S = Vy(p), b = !n && Vi.createCanvas(), w = n && {
      tag: "g",
      attrs: {},
      key: "dcl",
      children: []
    }, x = D(), T;
    b && (b.width = x.width * e, b.height = x.height * e, T = b.getContext("2d")), A(), h && Jv.put(d, b || w), u.image = b, u.svgElement = w, u.svgWidth = x.width, u.svgHeight = x.height;
    function D() {
      for (var M = 1, L = 0, P = _.length; L < P; ++L)
        M = vc(M, _[L]);
      for (var I = 1, L = 0, P = m.length; L < P; ++L)
        I = vc(I, m[L].length);
      M *= I;
      var E = S * _.length * m.length;
      return {
        width: Math.max(1, Math.min(M, o.maxTileWidth)),
        height: Math.max(1, Math.min(E, o.maxTileHeight))
      };
    }
    function A() {
      T && (T.clearRect(0, 0, b.width, b.height), o.backgroundColor && (T.fillStyle = o.backgroundColor, T.fillRect(0, 0, b.width, b.height)));
      for (var M = 0, L = 0; L < p.length; ++L)
        M += p[L];
      if (M <= 0)
        return;
      for (var P = -S, I = 0, E = 0, R = 0; P < x.height; ) {
        if (I % 2 === 0) {
          for (var W = E / 2 % m.length, B = 0, F = 0, G = 0; B < x.width * 2; ) {
            for (var it = 0, L = 0; L < g[R].length; ++L)
              it += g[R][L];
            if (it <= 0)
              break;
            if (F % 2 === 0) {
              var j = (1 - o.symbolSize) * 0.5, ft = B + g[R][F] * j, ht = P + p[I] * j, dt = g[R][F] * o.symbolSize, le = p[I] * o.symbolSize, hr = G / 2 % m[W].length;
              ri(ft, ht, dt, le, m[W][hr]);
            }
            B += g[R][F], ++G, ++F, F === g[R].length && (F = 0);
          }
          ++R, R === g.length && (R = 0);
        }
        P += p[I], ++E, ++I, I === p.length && (I = 0);
      }
      function ri(Ut, xt, Y, K, cr) {
        var It = n ? 1 : e, _h = Jr(cr, Ut * It, xt * It, Y * It, K * It, o.color, o.symbolKeepAspect);
        if (n) {
          var Sh = i.painter.renderOneToVNode(_h);
          Sh && w.children.push(Sh);
        } else
          zy(T, _h);
      }
    }
  }
}
function Hy(r) {
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
    return Hy([r]);
  for (var i = [], e = 0; e < r.length; ++e)
    z(r[e]) ? i.push([r[e]]) : i.push(r[e]);
  return i;
}
function $y(r) {
  if (!r || r.length === 0)
    return [[0, 0]];
  if (ut(r)) {
    var t = Math.ceil(r);
    return [[t, t]];
  }
  for (var e = !0, i = 0; i < r.length; ++i)
    if (!ut(r[i])) {
      e = !1;
      break;
    }
  if (e)
    return $y([r]);
  for (var n = [], i = 0; i < r.length; ++i)
    if (ut(r[i])) {
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
function CT(r) {
  if (!r || typeof r == "object" && r.length === 0)
    return [0, 0];
  if (ut(r)) {
    var t = Math.ceil(r);
    return [t, t];
  }
  var e = H(r, function(i) {
    return Math.ceil(i);
  });
  return r.length % 2 ? e.concat(e) : e;
}
function DT(r) {
  return H(r, function(t) {
    return Vy(t);
  });
}
function Vy(r) {
  for (var t = 0, e = 0; e < r.length; ++e)
    t += r[e];
  return r.length % 2 === 1 ? t * 2 : t;
}
function MT(r, t) {
  r.eachRawSeries(function(e) {
    if (!r.isSeriesFiltered(e)) {
      var i = e.getData();
      i.hasItemVisual() && i.each(function(o) {
        var s = i.getItemVisual(o, "decal");
        if (s) {
          var l = i.ensureUniqueItemVisual(o, "style");
          l.decal = Vu(s, t);
        }
      });
      var n = i.getVisual("decal");
      if (n) {
        var a = i.getVisual("style");
        a.decal = Vu(n, t);
      }
    }
  });
}
var ve = new Ae(), Gy = {};
function AT(r, t) {
  Gy[r] = t;
}
function LT(r) {
  return Gy[r];
}
var PT = 1, IT = 800, ET = 900, RT = 1e3, kT = 2e3, OT = 5e3, Wy = 1e3, NT = 1100, ah = 2e3, Uy = 3e3, BT = 4e3, bs = 4500, FT = 4600, zT = 5e3, HT = 6e3, Yy = 7e3, $T = {
  PROCESSOR: {
    FILTER: RT,
    SERIES_FILTER: IT,
    STATISTIC: OT
  },
  VISUAL: {
    LAYOUT: Wy,
    PROGRESSIVE_LAYOUT: NT,
    GLOBAL: ah,
    CHART: Uy,
    POST_CHART_LAYOUT: FT,
    COMPONENT: BT,
    BRUSH: zT,
    CHART_ITEM: bs,
    ARIA: HT,
    DECAL: Yy
  }
}, At = "__flagInMainProcess", Ot = "__pendingUpdate", Cl = "__needsUpdateStatus", ed = /^[a-zA-Z0-9_]+$/, Dl = "__connectUpdateStatus", rd = 0, VT = 1, GT = 2;
function Xy(r) {
  return function() {
    for (var t = [], e = 0; e < arguments.length; e++)
      t[e] = arguments[e];
    if (this.isDisposed()) {
      this.id;
      return;
    }
    return qy(this, r, t);
  };
}
function Zy(r) {
  return function() {
    for (var t = [], e = 0; e < arguments.length; e++)
      t[e] = arguments[e];
    return qy(this, r, t);
  };
}
function qy(r, t, e) {
  return e[0] = e[0] && e[0].toLowerCase(), Ae.prototype[t].apply(r, e);
}
var Ky = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      return r !== null && r.apply(this, arguments) || this;
    }
    return t;
  })(Ae)
), Qy = Ky.prototype;
Qy.on = Zy("on");
Qy.off = Zy("off");
var pi, Ml, Va, Xe, Al, Ll, Pl, un, fn, id, nd, Il, ad, Ga, od, jy, qt, sd, Jy = (
  /** @class */
  (function(r) {
    O(t, r);
    function t(e, i, n) {
      var a = r.call(this, new Kx()) || this;
      a._chartsViews = [], a._chartsMap = {}, a._componentsViews = [], a._componentsMap = {}, a._pendingActions = [], n = n || {}, z(i) && (i = tm[i]), a._dom = e;
      var o = "canvas", s = "auto", l = !1;
      n.ssr;
      var u = a._zr = fc(e, {
        renderer: n.renderer || o,
        devicePixelRatio: n.devicePixelRatio,
        width: n.width,
        height: n.height,
        ssr: n.ssr,
        useDirtyRect: X(n.useDirtyRect, l),
        useCoarsePointer: X(n.useCoarsePointer, s),
        pointerSize: n.pointerSize
      });
      a._ssr = n.ssr, a._throttledZrFlush = My(ct(u.flush, u), 17), i = q(i), i && ly(i, !0), a._theme = i, a._locale = ib(n.locale || $g), a._coordSysMgr = new jf();
      var f = a._api = od(a);
      function h(v, c) {
        return v.__prio - c.__prio;
      }
      return ao(Vo, h), ao(Gu, h), a._scheduler = new Iy(a, f, Gu, Vo), a._messageCenter = new Ky(), a._initEvents(), a.resize = ct(a.resize, a), u.animation.on("frame", a._onframe, a), id(u, a), nd(u, a), nu(a), a;
    }
    return t.prototype._onframe = function() {
      if (!this._disposed) {
        sd(this);
        var e = this._scheduler;
        if (this[Ot]) {
          var i = this[Ot].silent;
          this[At] = !0;
          try {
            pi(this), Xe.update.call(this, null, this[Ot].updateParams);
          } catch (l) {
            throw this[At] = !1, this[Ot] = null, l;
          }
          this._zr.flush(), this[At] = !1, this[Ot] = null, un.call(this, i), fn.call(this, i);
        } else if (e.unfinished) {
          var n = PT, a = this._model, o = this._api;
          e.unfinished = !1;
          do {
            var s = +/* @__PURE__ */ new Date();
            e.performSeriesTasks(a), e.performDataProcessorTasks(a), Ll(this, a), e.performVisualTasks(a), Ga(this, this._model, o, "remain", {}), n -= +/* @__PURE__ */ new Date() - s;
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
      if (!this[At]) {
        if (this._disposed) {
          this.id;
          return;
        }
        var a, o, s;
        if (V(i) && (n = i.lazyUpdate, a = i.silent, o = i.replaceMerge, s = i.transition, i = i.notMerge), this[At] = !0, !this._model || i) {
          var l = new Pb(this._api), u = this._theme, f = this._model = new Qf();
          f.scheduler = this._scheduler, f.ssr = this._ssr, f.init(null, null, null, u, this._locale, l);
        }
        this._model.setOption(e, {
          replaceMerge: o
        }, Wu);
        var h = {
          seriesTransition: s,
          optionChanged: !0
        };
        if (n)
          this[Ot] = {
            silent: a,
            updateParams: h
          }, this[At] = !1, this.getZr().wakeUp();
        else {
          try {
            pi(this), Xe.update.call(this, null, h);
          } catch (v) {
            throw this[Ot] = null, this[At] = !1, v;
          }
          this._ssr || this._zr.flush(), this[Ot] = null, this[At] = !1, un.call(this, a), fn.call(this, a);
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
        return C(i, function(n) {
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
      C(i, function(l) {
        n.eachComponent({
          mainType: l
        }, function(u) {
          var f = o._componentsMap[u.__viewId];
          f.group.ignore || (a.push(f), f.group.ignore = !0);
        });
      });
      var s = this._zr.painter.getType() === "svg" ? this.getSvgDataURL() : this.renderToCanvas(e).toDataURL("image/" + (e && e.type || "png"));
      return C(a, function(l) {
        l.group.ignore = !1;
      }), s;
    }, t.prototype.getConnectedDataURL = function(e) {
      if (this._disposed) {
        this.id;
        return;
      }
      var i = e.type === "svg", n = this.group, a = Math.min, o = Math.max, s = 1 / 0;
      if (ld[n]) {
        var l = s, u = s, f = -s, h = -s, v = [], c = e && e.pixelRatio || this.getDevicePixelRatio();
        C(Hn, function(_, S) {
          if (_.group === n) {
            var b = i ? _.getZr().painter.getSvgDom().innerHTML : _.renderToCanvas(q(e)), w = _.getDom().getBoundingClientRect();
            l = a(w.left, l), u = a(w.top, u), f = o(w.right, f), h = o(w.bottom, h), v.push({
              dom: b,
              left: w.left,
              top: w.top
            });
          }
        }), l *= c, u *= c, f *= c, h *= c;
        var d = f - l, y = h - u, g = Vi.createCanvas(), p = fc(g, {
          renderer: i ? "svg" : "canvas"
        });
        if (p.resize({
          width: d,
          height: y
        }), i) {
          var m = "";
          return C(v, function(_) {
            var S = _.left - l, b = _.top - u;
            m += '<g transform="translate(' + S + "," + b + ')">' + _.dom + "</g>";
          }), p.painter.getSvgRoot().innerHTML = m, e.connectedBackgroundColor && p.painter.setBackgroundColor(e.connectedBackgroundColor), p.refreshImmediately(), p.painter.toDataURL();
        } else
          return e.connectedBackgroundColor && p.add(new Dt({
            shape: {
              x: 0,
              y: 0,
              width: d,
              height: y
            },
            style: {
              fill: e.connectedBackgroundColor
            }
          })), C(v, function(_) {
            var S = new fr({
              style: {
                x: _.left * c - l,
                y: _.top * c - u,
                image: _.dom
              }
            });
            p.add(S);
          }), p.refreshImmediately(), g.toDataURL("image/" + (e && e.type || "png"));
      } else
        return this.getDataURL(e);
    }, t.prototype.convertToPixel = function(e, i) {
      return Al(this, "convertToPixel", e, i);
    }, t.prototype.convertFromPixel = function(e, i) {
      return Al(this, "convertFromPixel", e, i);
    }, t.prototype.containPixel = function(e, i) {
      if (this._disposed) {
        this.id;
        return;
      }
      var n = this._model, a, o = Qs(n, e);
      return C(o, function(s, l) {
        l.indexOf("Models") >= 0 && C(s, function(u) {
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
      var n = this._model, a = Qs(n, e, {
        defaultMainType: "series"
      }), o = a.seriesModel, s = o.getData(), l = a.hasOwnProperty("dataIndexInside") ? a.dataIndexInside : a.hasOwnProperty("dataIndex") ? s.indexOfRawIndex(a.dataIndex) : null;
      return l != null ? Jx(s, l, i) : ih(s, i);
    }, t.prototype.getViewOfComponentModel = function(e) {
      return this._componentsMap[e.__viewId];
    }, t.prototype.getViewOfSeriesModel = function(e) {
      return this._chartsMap[e.__viewId];
    }, t.prototype._initEvents = function() {
      var e = this;
      C(WT, function(i) {
        var n = function(a) {
          var o = e.getModel(), s = a.target, l, u = i === "globalout";
          if (u ? l = {} : s && Tn(s, function(d) {
            var y = tt(d);
            if (y && y.dataIndex != null) {
              var g = y.dataModel || o.getSeriesByIndex(y.seriesIndex);
              return l = g && g.getDataParams(y.dataIndex, y.dataType, s) || {}, !0;
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
      }), C(zn, function(i, n) {
        e._messageCenter.on(n, function(a) {
          this.trigger(n, a);
        }, e);
      }), C(["selectchanged"], function(i) {
        e._messageCenter.on(i, function(n) {
          this.trigger(i, n);
        }, e);
      }), tT(this._messageCenter, this, this._api);
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
      e && ag(this.getDom(), sh, "");
      var i = this, n = i._api, a = i._model;
      C(i._componentsViews, function(o) {
        o.dispose(a, n);
      }), C(i._chartsViews, function(o) {
        o.dispose(a, n);
      }), i._zr.dispose(), i._dom = i._model = i._chartsMap = i._componentsMap = i._chartsViews = i._componentsViews = i._scheduler = i._api = i._zr = i._throttledZrFlush = i._theme = i._coordSysMgr = i._messageCenter = null, delete Hn[i.id];
    }, t.prototype.resize = function(e) {
      if (!this[At]) {
        if (this._disposed) {
          this.id;
          return;
        }
        this._zr.resize(e);
        var i = this._model;
        if (this._loadingFX && this._loadingFX.resize(), !!i) {
          var n = i.resetOption("media"), a = e && e.silent;
          this[Ot] && (a == null && (a = this[Ot].silent), n = !0, this[Ot] = null), this[At] = !0;
          try {
            n && pi(this), Xe.update.call(this, {
              type: "resize",
              animation: k({
                // Disable animation
                duration: 0
              }, e && e.animation)
            });
          } catch (o) {
            throw this[At] = !1, o;
          }
          this[At] = !1, un.call(this, a), fn.call(this, a);
        }
      }
    }, t.prototype.showLoading = function(e, i) {
      if (this._disposed) {
        this.id;
        return;
      }
      if (V(e) && (i = e, e = ""), e = e || "default", this.hideLoading(), !!Uu[e]) {
        var n = Uu[e](this._api, i), a = this._zr;
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
      return i.type = zn[e.type], i;
    }, t.prototype.dispatchAction = function(e, i) {
      if (this._disposed) {
        this.id;
        return;
      }
      if (V(i) || (i = {
        silent: !!i
      }), !!$o[e.type] && this._model) {
        if (this[At]) {
          this._pendingActions.push(e);
          return;
        }
        var n = i.silent;
        Pl.call(this, e, n);
        var a = i.flush;
        a ? this._zr.flush() : a !== !1 && U.browser.weChat && this._throttledZrFlush(), un.call(this, n), fn.call(this, n);
      }
    }, t.prototype.updateLabelLayout = function() {
      ve.trigger("series:layoutlabels", this._model, this._api, {
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
      pi = function(h) {
        var v = h._scheduler;
        v.restorePipelines(h._model), v.prepareStageTasks(), Ml(h, !0), Ml(h, !1), v.plan();
      }, Ml = function(h, v) {
        for (var c = h._model, d = h._scheduler, y = v ? h._componentsViews : h._chartsViews, g = v ? h._componentsMap : h._chartsMap, p = h._zr, m = h._api, _ = 0; _ < y.length; _++)
          y[_].__alive = !1;
        v ? c.eachComponent(function(w, x) {
          w !== "series" && S(x);
        }) : c.eachSeries(S);
        function S(w) {
          var x = w.__requireNewView;
          w.__requireNewView = !1;
          var T = "_ec_" + w.id + "_" + w.type, D = !x && g[T];
          if (!D) {
            var A = Ce(w.type), M = v ? pe.getClass(A.main, A.sub) : (
              // FIXME:TS
              // (ChartView as ChartViewConstructor).getClass('series', classType.sub)
              // For backward compat, still support a chart type declared as only subType
              // like "liquidfill", but recommend "series.liquidfill"
              // But need a base class to make a type series.
              Me.getClass(A.sub)
            );
            D = new M(), D.init(c, m), g[T] = D, y.push(D), p.add(D.group);
          }
          w.__viewId = D.__id = T, D.__alive = !0, D.__model = w, D.group.__ecComponentInfo = {
            mainType: w.mainType,
            index: w.componentIndex
          }, !v && d.prepareView(D, w, c, m);
        }
        for (var _ = 0; _ < y.length; ) {
          var b = y[_];
          b.__alive ? _++ : (!v && b.renderTask.dispose(), p.remove(b.group), b.dispose(c, m), y.splice(_, 1), g[b.__id] === b && delete g[b.__id], b.__id = b.group.__ecComponentInfo = null);
        }
      }, Va = function(h, v, c, d, y) {
        var g = h._model;
        if (g.setUpdatePayload(c), !d) {
          C([].concat(h._componentsViews).concat(h._chartsViews), b);
          return;
        }
        var p = {};
        p[d + "Id"] = c[d + "Id"], p[d + "Index"] = c[d + "Index"], p[d + "Name"] = c[d + "Name"];
        var m = {
          mainType: d,
          query: p
        };
        y && (m.subType = y);
        var _ = c.excludeSeriesId, S;
        _ != null && (S = Z(), C(Rt(_), function(w) {
          var x = De(w, null);
          x != null && S.set(x, !0);
        })), g && g.eachComponent(m, function(w) {
          var x = S && S.get(w.id) != null;
          if (!x)
            if (Vc(c))
              if (w instanceof lr)
                c.type === Gr && !c.notBlur && !w.get(["emphasis", "disabled"]) && FS(w, c, h._api);
              else {
                var T = Of(w.mainType, w.componentIndex, c.name, h._api), D = T.focusSelf, A = T.dispatchers;
                c.type === Gr && D && !c.notBlur && Cu(w.mainType, w.componentIndex, h._api), A && C(A, function(M) {
                  c.type === Gr ? Qn(M) : jn(M);
                });
              }
            else Au(c) && w instanceof lr && ($S(w, c, h._api), zc(w), qt(h));
        }, h), g && g.eachComponent(m, function(w) {
          var x = S && S.get(w.id) != null;
          x || b(h[d === "series" ? "_chartsMap" : "_componentsMap"][w.__viewId]);
        }, h);
        function b(w) {
          w && w.__alive && w[v] && w[v](w.__model, g, h._api, c);
        }
      }, Xe = {
        prepareAndUpdate: function(h) {
          pi(this), Xe.update.call(this, h, {
            // Needs to mark option changed if newOption is given.
            // It's from MagicType.
            // TODO If use a separate flag optionChanged in payload?
            optionChanged: h.newOption != null
          });
        },
        update: function(h, v) {
          var c = this._model, d = this._api, y = this._zr, g = this._coordSysMgr, p = this._scheduler;
          if (c) {
            c.setUpdatePayload(h), p.restoreData(c, h), p.performSeriesTasks(c), g.create(c, d), p.performDataProcessorTasks(c, h), Ll(this, c), g.update(c, d), e(c), p.performVisualTasks(c, h), Il(this, c, d, h, v);
            var m = c.get("backgroundColor") || "transparent", _ = c.get("darkMode");
            y.setBackgroundColor(m), _ != null && _ !== "auto" && y.setDarkMode(_), ve.trigger("afterupdate", c, d);
          }
        },
        updateTransform: function(h) {
          var v = this, c = this._model, d = this._api;
          if (c) {
            c.setUpdatePayload(h);
            var y = [];
            c.eachComponent(function(p, m) {
              if (p !== "series") {
                var _ = v.getViewOfComponentModel(m);
                if (_ && _.__alive)
                  if (_.updateTransform) {
                    var S = _.updateTransform(m, c, d, h);
                    S && S.update && y.push(_);
                  } else
                    y.push(_);
              }
            });
            var g = Z();
            c.eachSeries(function(p) {
              var m = v._chartsMap[p.__viewId];
              if (m.updateTransform) {
                var _ = m.updateTransform(p, c, d, h);
                _ && _.update && g.set(p.uid, 1);
              } else
                g.set(p.uid, 1);
            }), e(c), this._scheduler.performVisualTasks(c, h, {
              setDirty: !0,
              dirtyMap: g
            }), Ga(this, c, d, h, {}, g), ve.trigger("afterupdate", c, d);
          }
        },
        updateView: function(h) {
          var v = this._model;
          v && (v.setUpdatePayload(h), Me.markUpdateMethod(h, "updateView"), e(v), this._scheduler.performVisualTasks(v, h, {
            setDirty: !0
          }), Il(this, v, this._api, h, {}), ve.trigger("afterupdate", v, this._api));
        },
        updateVisual: function(h) {
          var v = this, c = this._model;
          c && (c.setUpdatePayload(h), c.eachSeries(function(d) {
            d.getData().clearAllVisual();
          }), Me.markUpdateMethod(h, "updateVisual"), e(c), this._scheduler.performVisualTasks(c, h, {
            visualType: "visual",
            setDirty: !0
          }), c.eachComponent(function(d, y) {
            if (d !== "series") {
              var g = v.getViewOfComponentModel(y);
              g && g.__alive && g.updateVisual(y, c, v._api, h);
            }
          }), c.eachSeries(function(d) {
            var y = v._chartsMap[d.__viewId];
            y.updateVisual(d, c, v._api, h);
          }), ve.trigger("afterupdate", c, this._api));
        },
        updateLayout: function(h) {
          Xe.update.call(this, h);
        }
      }, Al = function(h, v, c, d) {
        if (h._disposed) {
          h.id;
          return;
        }
        for (var y = h._model, g = h._coordSysMgr.getCoordinateSystems(), p, m = Qs(y, c), _ = 0; _ < g.length; _++) {
          var S = g[_];
          if (S[v] && (p = S[v](y, m, d)) != null)
            return p;
        }
      }, Ll = function(h, v) {
        var c = h._chartsMap, d = h._scheduler;
        v.eachSeries(function(y) {
          d.updateStreamModes(y, c[y.__viewId]);
        });
      }, Pl = function(h, v) {
        var c = this, d = this.getModel(), y = h.type, g = h.escapeConnect, p = $o[y], m = p.actionInfo, _ = (m.update || "update").split(":"), S = _.pop(), b = _[0] != null && Ce(_[0]);
        this[At] = !0;
        var w = [h], x = !1;
        h.batch && (x = !0, w = H(h.batch, function(I) {
          return I = at(k({}, I), h), I.batch = null, I;
        }));
        var T = [], D, A = Au(h), M = Vc(h);
        if (M && Tg(this._api), C(w, function(I) {
          if (D = p.action(I, c._model, c._api), D = D || k({}, I), D.type = m.event || D.type, T.push(D), M) {
            var E = Lf(h), R = E.queryOptionMap, W = E.mainTypeSpecified, B = W ? R.keys()[0] : "series";
            Va(c, S, I, B), qt(c);
          } else A ? (Va(c, S, I, "series"), qt(c)) : b && Va(c, S, I, b.main, b.sub);
        }), S !== "none" && !M && !A && !b)
          try {
            this[Ot] ? (pi(this), Xe.update.call(this, h), this[Ot] = null) : Xe[S].call(this, h);
          } catch (I) {
            throw this[At] = !1, I;
          }
        if (x ? D = {
          type: m.event || y,
          escapeConnect: g,
          batch: T
        } : D = T[0], this[At] = !1, !v) {
          var L = this._messageCenter;
          if (L.trigger(D.type, D), A) {
            var P = {
              type: "selectchanged",
              escapeConnect: g,
              selected: VS(d),
              isFromClick: h.isFromClick || !1,
              fromAction: h.type,
              fromActionPayload: h
            };
            L.trigger(P.type, P);
          }
        }
      }, un = function(h) {
        for (var v = this._pendingActions; v.length; ) {
          var c = v.shift();
          Pl.call(this, c, h);
        }
      }, fn = function(h) {
        !h && this.trigger("updated");
      }, id = function(h, v) {
        h.on("rendered", function(c) {
          v.trigger("rendered", c), // Although zr is dirty if initial animation is not finished
          // and this checking is called on frame, we also check
          // animation finished for robustness.
          h.animation.isFinished() && !v[Ot] && !v._scheduler.unfinished && !v._pendingActions.length && v.trigger("finished");
        });
      }, nd = function(h, v) {
        h.on("mouseover", function(c) {
          var d = c.target, y = Tn(d, Mu);
          y && (zS(y, c, v._api), qt(v));
        }).on("mouseout", function(c) {
          var d = c.target, y = Tn(d, Mu);
          y && (HS(y, c, v._api), qt(v));
        }).on("click", function(c) {
          var d = c.target, y = Tn(d, function(m) {
            return tt(m).dataIndex != null;
          }, !0);
          if (y) {
            var g = y.selected ? "unselect" : "select", p = tt(y);
            v._api.dispatchAction({
              type: g,
              dataType: p.dataType,
              dataIndexInside: p.dataIndex,
              seriesIndex: p.seriesIndex,
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
          var S = _.get("zlevel") || 0, b = _.get("z") || 0, w = _.getZLevelKey();
          d = d || !!w, (m === "series" ? c : v).push({
            zlevel: S,
            z: b,
            idx: _.componentIndex,
            type: m,
            key: w
          });
        }), d) {
          var y = v.concat(c), g, p;
          ao(y, function(m, _) {
            return m.zlevel === _.zlevel ? m.z - _.z : m.zlevel - _.zlevel;
          }), C(y, function(m) {
            var _ = h.getComponent(m.type, m.idx), S = m.zlevel, b = m.key;
            g != null && (S = Math.max(g, S)), b ? (S === g && b !== p && S++, p = b) : p && (S === g && S++, p = ""), g = S, _.setZLevel(S);
          });
        }
      }
      Il = function(h, v, c, d, y) {
        i(v), ad(h, v, c, d, y), C(h._chartsViews, function(g) {
          g.__alive = !1;
        }), Ga(h, v, c, d, y), C(h._chartsViews, function(g) {
          g.__alive || g.remove(v, c);
        });
      }, ad = function(h, v, c, d, y, g) {
        C(g || h._componentsViews, function(p) {
          var m = p.__model;
          u(m, p), p.render(m, v, c, d), s(m, p), f(m, p);
        });
      }, Ga = function(h, v, c, d, y, g) {
        var p = h._scheduler;
        y = k(y || {}, {
          updatedSeries: v.getSeries()
        }), ve.trigger("series:beforeupdate", v, c, y);
        var m = !1;
        v.eachSeries(function(_) {
          var S = h._chartsMap[_.__viewId];
          S.__alive = !0;
          var b = S.renderTask;
          p.updatePayload(b, d), u(_, S), g && g.get(_.uid) && b.dirty(), b.perform(p.getPerformArgs(b)) && (m = !0), S.group.silent = !!_.get("silent"), o(_, S), zc(_);
        }), p.unfinished = m || p.unfinished, ve.trigger("series:layoutlabels", v, c, y), ve.trigger("series:transition", v, c, y), v.eachSeries(function(_) {
          var S = h._chartsMap[_.__viewId];
          s(_, S), f(_, S);
        }), a(h, v), ve.trigger("series:afterupdate", v, c, y);
      }, qt = function(h) {
        h[Cl] = !0, h.getZr().wakeUp();
      }, sd = function(h) {
        h[Cl] && (h.getZr().storage.traverse(function(v) {
          On(v) || n(v);
        }), h[Cl] = !1);
      };
      function n(h) {
        for (var v = [], c = h.currentStates, d = 0; d < c.length; d++) {
          var y = c[d];
          y === "emphasis" || y === "blur" || y === "select" || v.push(y);
        }
        h.selected && h.states.select && v.push("select"), h.hoverState === es && h.states.emphasis ? v.push("emphasis") : h.hoverState === ts && h.states.blur && v.push("blur"), h.useStates(v);
      }
      function a(h, v) {
        var c = h._zr, d = c.storage, y = 0;
        d.traverse(function(g) {
          g.isGroup || y++;
        }), y > v.get("hoverLayerThreshold") && !U.node && !U.worker && v.eachSeries(function(g) {
          if (!g.preventUsingHoverLayer) {
            var p = h._chartsMap[g.__viewId];
            p.__alive && p.eachRendered(function(m) {
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
        var y = h.getTextContent(), g = h.getTextGuideLine(), p = h.isGroup;
        if (p)
          for (var m = h.childrenRef(), _ = 0; _ < m.length; _++)
            d = Math.max(l(m[_], v, c, d), d);
        else
          h.z = v, h.zlevel = c, d = Math.max(h.z2, d);
        if (y && (y.z = v, y.zlevel = c, isFinite(d) && (y.z2 = d + 2)), g) {
          var S = h.textGuideLineConfig;
          g.z = v, g.zlevel = c, isFinite(d) && (g.z2 = d + (S && S.showAbove ? 1 : -1));
        }
        return d;
      }
      function u(h, v) {
        v.eachRendered(function(c) {
          if (!On(c)) {
            var d = c.getTextContent(), y = c.getTextGuideLine();
            c.stateTransition && (c.stateTransition = null), d && d.stateTransition && (d.stateTransition = null), y && y.stateTransition && (y.stateTransition = null), c.hasState() ? (c.prevStates = c.currentStates, c.clearStates()) : c.prevStates && (c.prevStates = null);
          }
        });
      }
      function f(h, v) {
        var c = h.getModel("stateAnimation"), d = h.isAnimationEnabled(), y = c.get("duration"), g = y > 0 ? {
          duration: y,
          delay: c.get("delay"),
          easing: c.get("easing")
          // additive: stateAnimationModel.get('additive')
        } : null;
        v.eachRendered(function(p) {
          if (p.states && p.states.emphasis) {
            if (On(p))
              return;
            if (p instanceof ot && XS(p), p.__dirty) {
              var m = p.prevStates;
              m && p.useStates(m);
            }
            if (d) {
              p.stateTransition = g;
              var _ = p.getTextContent(), S = p.getTextGuideLine();
              _ && (_.stateTransition = g), S && (S.stateTransition = g);
            }
            p.__dirty && n(p);
          }
        });
      }
      od = function(h) {
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
            Qn(d, y), qt(h);
          }, c.prototype.leaveEmphasis = function(d, y) {
            jn(d, y), qt(h);
          }, c.prototype.enterBlur = function(d) {
            Sg(d), qt(h);
          }, c.prototype.leaveBlur = function(d) {
            kf(d), qt(h);
          }, c.prototype.enterSelect = function(d) {
            wg(d), qt(h);
          }, c.prototype.leaveSelect = function(d) {
            bg(d), qt(h);
          }, c.prototype.getModel = function() {
            return h.getModel();
          }, c.prototype.getViewOfComponentModel = function(d) {
            return h.getViewOfComponentModel(d);
          }, c.prototype.getViewOfSeriesModel = function(d) {
            return h.getViewOfSeriesModel(d);
          }, c;
        })(oy))(h);
      }, jy = function(h) {
        function v(c, d) {
          for (var y = 0; y < c.length; y++) {
            var g = c[y];
            g[Dl] = d;
          }
        }
        C(zn, function(c, d) {
          h._messageCenter.on(d, function(y) {
            if (ld[h.group] && h[Dl] !== rd) {
              if (y && y.escapeConnect)
                return;
              var g = h.makeActionFromEvent(y), p = [];
              C(Hn, function(m) {
                m !== h && m.group === h.group && p.push(m);
              }), v(p, rd), C(p, function(m) {
                m[Dl] !== VT && m.dispatchAction(g);
              }), v(p, GT);
            }
          });
        });
      };
    })(), t;
  })(Ae)
), oh = Jy.prototype;
oh.on = Xy("on");
oh.off = Xy("off");
oh.one = function(r, t, e) {
  var i = this;
  function n() {
    for (var a = [], o = 0; o < arguments.length; o++)
      a[o] = arguments[o];
    t && t.apply && t.apply(this, a), i.off(r, n);
  }
  this.on.call(this, r, n, e);
};
var WT = ["click", "dblclick", "mouseover", "mouseout", "mousemove", "mousedown", "mouseup", "globalout", "contextmenu"];
var $o = {}, zn = {}, Gu = [], Wu = [], Vo = [], tm = {}, Uu = {}, Hn = {}, ld = {}, UT = +/* @__PURE__ */ new Date() - 0, sh = "_echarts_instance_";
function YT(r, t, e) {
  {
    var i = XT(r);
    if (i)
      return i;
  }
  var n = new Jy(r, t, e);
  return n.id = "ec_" + UT++, Hn[n.id] = n, ag(r, sh, n.id), jy(n), ve.trigger("afterinit", n), n;
}
function XT(r) {
  return Hn[M1(r, sh)];
}
function em(r, t) {
  tm[r] = t;
}
function rm(r) {
  et(Wu, r) < 0 && Wu.push(r);
}
function im(r, t) {
  uh(Gu, r, t, kT);
}
function ZT(r) {
  lh("afterinit", r);
}
function qT(r) {
  lh("afterupdate", r);
}
function lh(r, t) {
  ve.on(r, t);
}
function Xi(r, t, e) {
  $(t) && (e = t, t = "");
  var i = V(r) ? r.type : [r, r = {
    event: t
  }][0];
  r.event = (r.event || i).toLowerCase(), t = r.event, !zn[t] && (Be(ed.test(i) && ed.test(t)), $o[i] || ($o[i] = {
    action: e,
    actionInfo: r
  }), zn[t] = i);
}
function KT(r, t) {
  jf.register(r, t);
}
function QT(r, t) {
  uh(Vo, r, t, Wy, "layout");
}
function ei(r, t) {
  uh(Vo, r, t, Uy, "visual");
}
var ud = [];
function uh(r, t, e, i, n) {
  if (($(t) || V(t)) && (e = t, t = i), !(et(ud, e) >= 0)) {
    ud.push(e);
    var a = Iy.wrapStageHandler(e, n);
    a.__prio = t, a.__raw = e, r.push(a);
  }
}
function nm(r, t) {
  Uu[r] = t;
}
function jT(r, t, e) {
  var i = LT("registerMap");
  i && i(r, t, e);
}
var JT = ax;
ei(ah, Nx);
ei(bs, Bx);
ei(bs, Fx);
ei(ah, Qx);
ei(bs, jx);
ei(Yy, MT);
rm(ly);
im(ET, Vb);
nm("default", zx);
Xi({
  type: Gr,
  event: Gr,
  update: Gr
}, Ht);
Xi({
  type: ho,
  event: ho,
  update: ho
}, Ht);
Xi({
  type: En,
  event: En,
  update: En
}, Ht);
Xi({
  type: co,
  event: co,
  update: co
}, Ht);
Xi({
  type: Rn,
  event: Rn,
  update: Rn
}, Ht);
em("light", qx);
em("dark", Oy);
function hn(r) {
  return r == null ? 0 : r.length || 1;
}
function fd(r) {
  return r;
}
var tC = (
  /** @class */
  (function() {
    function r(t, e, i, n, a, o) {
      this._old = t, this._new = e, this._oldKeyGetter = i || fd, this._newKeyGetter = n || fd, this.context = a, this._diffModeMultiple = o === "multiple";
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
        var s = n[o], l = i[s], u = hn(l);
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
        var l = a[s], u = i[l], f = n[l], h = hn(u), v = hn(f);
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
        var n = t[i], a = e[n], o = hn(a);
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
          var l = e[s], u = hn(l);
          u === 0 ? (e[s] = o, a && i.push(s)) : u === 1 ? e[s] = [l, o] : l.push(o);
        }
      }
    }, r;
  })()
), eC = (
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
function rC(r, t) {
  var e = {}, i = e.encode = {}, n = Z(), a = [], o = [], s = {};
  C(r.dimensions, function(v) {
    var c = r.getDimensionInfo(v), d = c.coordDim;
    if (d) {
      var y = c.coordDimIndex;
      El(i, d)[y] = v, c.isExtraCoord || (n.set(d, 1), nC(c.type) && (a[0] = v), El(s, d)[y] = r.getDimensionIndex(c.name)), c.defaultTooltip && o.push(v);
    }
    ey.each(function(g, p) {
      var m = El(i, p), _ = c.otherDims[p];
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
  return h && h.length ? o = h.slice() : o.length || (o = a.slice()), i.defaultedLabel = a, i.defaultedTooltip = o, e.userOutput = new eC(s, t), e;
}
function El(r, t) {
  return r.hasOwnProperty(t) || (r[t] = []), r[t];
}
function iC(r) {
  return r === "category" ? "ordinal" : r === "time" ? "time" : "float";
}
function nC(r) {
  return !(r === "ordinal" || r === "time");
}
var go = (
  /** @class */
  /* @__PURE__ */ (function() {
    function r(t) {
      this.otherDims = {}, t != null && k(this, t);
    }
    return r;
  })()
), aC = gt(), oC = {
  float: "f",
  int: "i",
  ordinal: "o",
  number: "n",
  time: "t"
}, am = (
  /** @class */
  (function() {
    function r(t) {
      this.dimensions = t.dimensions, this._dimOmitted = t.dimensionOmitted, this.source = t.source, this._fullDimCount = t.fullDimensionCount, this._updateDimOmitted(t.dimensionOmitted);
    }
    return r.prototype.isDimensionOmitted = function() {
      return this._dimOmitted;
    }, r.prototype._updateDimOmitted = function(t) {
      this._dimOmitted = t, t && (this._dimNameMap || (this._dimNameMap = lm(this.source)));
    }, r.prototype.getSourceDimensionIndex = function(t) {
      return X(this._dimNameMap.get(t), -1);
    }, r.prototype.getSourceDimension = function(t) {
      var e = this.source.dimensionsDefine;
      if (e)
        return e[t];
    }, r.prototype.makeStoreSchema = function() {
      for (var t = this._fullDimCount, e = hy(this.source), i = !um(t), n = "", a = [], o = 0, s = 0; o < t; o++) {
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
        }), e && l != null && (!h || !h.isCalculationCoord) && (n += i ? l.replace(/\`/g, "`1").replace(/\$/g, "`2") : l), n += "$", n += oC[u] || "f", f && (n += f.uid), n += "$";
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
function om(r) {
  return r instanceof am;
}
function sm(r) {
  for (var t = Z(), e = 0; e < (r || []).length; e++) {
    var i = r[e], n = V(i) ? i.name : i;
    n != null && t.get(n) == null && t.set(n, e);
  }
  return t;
}
function lm(r) {
  var t = aC(r);
  return t.dimNameMap || (t.dimNameMap = sm(r.dimensionsDefine));
}
function um(r) {
  return r > 30;
}
var cn = V, Ze = H, sC = typeof Int32Array > "u" ? Array : Int32Array, lC = "e\0\0", hd = -1, uC = ["hasItemOption", "_nameList", "_idList", "_invertedIndicesMap", "_dimSummary", "userOutput", "_rawData", "_dimValueGetter", "_nameDimIdx", "_idDimIdx", "_nameRepeatCount"], fC = ["_approximateExtent"], cd, Wa, vn, dn, Rl, pn, kl, $n = (
  /** @class */
  (function() {
    function r(t, e) {
      this.type = "list", this._dimOmitted = !1, this._nameList = [], this._idList = [], this._visual = {}, this._layout = {}, this._itemVisuals = [], this._itemLayouts = [], this._graphicEls = [], this._approximateExtent = {}, this._calculationInfo = {}, this.hasItemOption = !1, this.TRANSFERABLE_METHODS = ["cloneShallow", "downSample", "minmaxDownSample", "lttbDownSample", "map"], this.CHANGABLE_METHODS = ["filterSelf", "selectRange"], this.DOWNSAMPLE_METHODS = ["downSample", "minmaxDownSample", "lttbDownSample"];
      var i, n = !1;
      om(t) ? (i = t.dimensions, this._dimOmitted = t.isDimensionOmitted(), this._schema = t) : (n = !0, i = t), i = i || ["x", "y"];
      for (var a = {}, o = [], s = {}, l = !1, u = {}, f = 0; f < i.length; f++) {
        var h = i[f], v = z(h) ? new go({
          name: h
        }) : h instanceof go ? h : new go(h), c = v.name;
        v.type = v.type || "float", v.coordDim || (v.coordDim = c, v.coordDimIndex = 0);
        var d = v.otherDims = v.otherDims || {};
        o.push(c), a[c] = v, u[c] != null && (l = !0), v.createInvertedIndices && (s[c] = []), d.itemName === 0 && (this._nameDimIdx = f), d.itemId === 0 && (this._idDimIdx = f), n && (v.storeDimIndex = f);
      }
      if (this.dimensions = o, this._dimInfos = a, this._initGetDimensionInfo(l), this.hostModel = e, this._invertedIndicesMap = s, this._dimOmitted) {
        var y = this._dimIdxToName = Z();
        C(o, function(g) {
          y.set(a[g].storeDimIndex, g);
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
      if (ut(t) || t != null && !isNaN(t) && !this._getDimInfo(t) && (!this._dimOmitted || this._schema.getSourceDimensionIndex(t) < 0))
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
      if (t instanceof Ru && (a = t), !a) {
        var o = this.dimensions, s = Jf(t) || $t(t) ? new cy(t, o.length) : t;
        a = new Ru();
        var l = Ze(o, function(u) {
          return {
            type: n._dimInfos[u].type,
            property: u
          };
        });
        a.initData(s, l, i);
      }
      this._store = a, this._nameList = (e || []).slice(), this._idList = [], this._nameRepeatCount = {}, this._doInit(0, a.count()), this._dimSummary = rC(this, this._schema), this.userOutput = this._dimSummary.userOutput;
    }, r.prototype.appendData = function(t) {
      var e = this._store.appendData(t);
      this._doInit(e[0], e[1]);
    }, r.prototype.appendValues = function(t, e) {
      var i = this._store.appendValues(t, e && e.length), n = i.start, a = i.end, o = this._shouldMakeIdFromName();
      if (this._updateOrdinalMeta(), e)
        for (var s = n; s < a; s++) {
          var l = s - n;
          this._nameList[s] = e[l], o && kl(this, s);
        }
    }, r.prototype._updateOrdinalMeta = function() {
      for (var t = this._store, e = this.dimensions, i = 0; i < e.length; i++) {
        var n = this._dimInfos[e[i]];
        n.ordinalMeta && t.collectOrdinalMeta(n.storeDimIndex, n.ordinalMeta);
      }
    }, r.prototype._shouldMakeIdFromName = function() {
      var t = this._store.getProvider();
      return this._idDimIdx == null && t.getSource().sourceFormat !== or && !t.fillStorage;
    }, r.prototype._doInit = function(t, e) {
      if (!(t >= e)) {
        var i = this._store, n = i.getProvider();
        this._updateOrdinalMeta();
        var a = this._nameList, o = this._idList, s = n.getSource().sourceFormat, l = s === se;
        if (l && !n.pure)
          for (var u = [], f = t; f < e; f++) {
            var h = n.getItem(f, u);
            if (!this.hasItemOption && g1(h) && (this.hasItemOption = !0), h) {
              var v = h.name;
              a[f] == null && v != null && (a[f] = De(v, null));
              var c = h.id;
              o[f] == null && c != null && (o[f] = De(c, null));
            }
          }
        if (this._shouldMakeIdFromName())
          for (var f = t; f < e; f++)
            kl(this, f);
        cd(this);
      }
    }, r.prototype.getApproximateExtent = function(t) {
      return this._approximateExtent[t] || this._store.getDataExtent(this._getStoreDimIndex(t));
    }, r.prototype.setApproximateExtent = function(t, e) {
      e = this.getDimension(e), this._approximateExtent[e] = t.slice();
    }, r.prototype.getCalculationInfo = function(t) {
      return this._calculationInfo[t];
    }, r.prototype.setCalculationInfo = function(t, e) {
      cn(t) ? k(this._calculationInfo, t) : this._calculationInfo[t] = e;
    }, r.prototype.getName = function(t) {
      var e = this.getRawIndex(t), i = this._nameList[e];
      return i == null && this._nameDimIdx != null && (i = vn(this, this._nameDimIdx, e)), i == null && (i = ""), i;
    }, r.prototype._getCategory = function(t, e) {
      var i = this._store.get(t, e), n = this._store.getOrdinalMeta(t);
      return n ? n.categories[i] : i;
    }, r.prototype.getId = function(t) {
      return Wa(this, this.getRawIndex(t));
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
      return N(t) ? n.getValues(Ze(t, function(a) {
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
      return n == null || isNaN(n) ? hd : n;
    }, r.prototype.indicesOfNearest = function(t, e, i) {
      return this._store.indicesOfNearest(this._getStoreDimIndex(t), e, i);
    }, r.prototype.each = function(t, e, i) {
      $(t) && (i = e, e = t, t = []);
      var n = i || this, a = Ze(dn(t), this._getStoreDimIndex, this);
      this._store.each(a, n ? ct(e, n) : e);
    }, r.prototype.filterSelf = function(t, e, i) {
      $(t) && (i = e, e = t, t = []);
      var n = i || this, a = Ze(dn(t), this._getStoreDimIndex, this);
      return this._store = this._store.filter(a, n ? ct(e, n) : e), this;
    }, r.prototype.selectRange = function(t) {
      var e = this, i = {}, n = vt(t);
      return C(n, function(a) {
        var o = e._getStoreDimIndex(a);
        i[o] = t[a];
      }), this._store = this._store.selectRange(i), this;
    }, r.prototype.mapArray = function(t, e, i) {
      $(t) && (i = e, e = t, t = []), i = i || this;
      var n = [];
      return this.each(t, function() {
        n.push(e && e.apply(this, arguments));
      }, i), n;
    }, r.prototype.map = function(t, e, i, n) {
      var a = i || n || this, o = Ze(dn(t), this._getStoreDimIndex, this), s = pn(this);
      return s._store = this._store.map(o, a ? ct(e, a) : e), s;
    }, r.prototype.modify = function(t, e, i, n) {
      var a = i || n || this, o = Ze(dn(t), this._getStoreDimIndex, this);
      this._store.modify(o, a ? ct(e, a) : e);
    }, r.prototype.downSample = function(t, e, i, n) {
      var a = pn(this);
      return a._store = this._store.downSample(this._getStoreDimIndex(t), e, i, n), a;
    }, r.prototype.minmaxDownSample = function(t, e) {
      var i = pn(this);
      return i._store = this._store.minmaxDownSample(this._getStoreDimIndex(t), e), i;
    }, r.prototype.lttbDownSample = function(t, e) {
      var i = pn(this);
      return i._store = this._store.lttbDownSample(this._getStoreDimIndex(t), e), i;
    }, r.prototype.getRawDataItem = function(t) {
      return this._store.getRawDataItem(t);
    }, r.prototype.getItemModel = function(t) {
      var e = this.hostModel, i = this.getRawDataItem(t);
      return new pt(i, e, e && e.ecModel);
    }, r.prototype.diff = function(t) {
      var e = this;
      return new tC(t ? t.getStore().getIndices() : [], this.getStore().getIndices(), function(i) {
        return Wa(t, i);
      }, function(i) {
        return Wa(e, i);
      });
    }, r.prototype.getVisual = function(t) {
      var e = this._visual;
      return e && e[t];
    }, r.prototype.setVisual = function(t, e) {
      this._visual = this._visual || {}, cn(t) ? k(this._visual, t) : this._visual[t] = e;
    }, r.prototype.getItemVisual = function(t, e) {
      var i = this._itemVisuals[t], n = i && i[e];
      return n ?? this.getVisual(e);
    }, r.prototype.hasItemVisual = function() {
      return this._itemVisuals.length > 0;
    }, r.prototype.ensureUniqueItemVisual = function(t, e) {
      var i = this._itemVisuals, n = i[t];
      n || (n = i[t] = {});
      var a = n[e];
      return a == null && (a = this.getVisual(e), N(a) ? a = a.slice() : cn(a) && (a = k({}, a)), n[e] = a), a;
    }, r.prototype.setItemVisual = function(t, e, i) {
      var n = this._itemVisuals[t] || {};
      this._itemVisuals[t] = n, cn(e) ? k(n, e) : n[e] = i;
    }, r.prototype.clearAllVisual = function() {
      this._visual = {}, this._itemVisuals = [];
    }, r.prototype.setLayout = function(t, e) {
      cn(t) ? k(this._layout, t) : this._layout[t] = e;
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
      AS(i, this.dataType, t, e), this._graphicEls[t] = e;
    }, r.prototype.getItemGraphicEl = function(t) {
      return this._graphicEls[t];
    }, r.prototype.eachItemGraphicEl = function(t, e) {
      C(this._graphicEls, function(i, n) {
        i && t && t.call(e, i, n);
      });
    }, r.prototype.cloneShallow = function(t) {
      return t || (t = new r(this._schema ? this._schema : Ze(this.dimensions, this._getDimInfo, this), this.hostModel)), Rl(t, this), t._store = this._store, t;
    }, r.prototype.wrapMethod = function(t, e) {
      var i = this[t];
      $(i) && (this.__wrappedMethods = this.__wrappedMethods || [], this.__wrappedMethods.push(t), this[t] = function() {
        var n = i.apply(this, arguments);
        return e.apply(this, [n].concat(yf(arguments)));
      });
    }, r.internalField = (function() {
      cd = function(t) {
        var e = t._invertedIndicesMap;
        C(e, function(i, n) {
          var a = t._dimInfos[n], o = a.ordinalMeta, s = t._store;
          if (o) {
            i = e[n] = new sC(o.categories.length);
            for (var l = 0; l < i.length; l++)
              i[l] = hd;
            for (var l = 0; l < s.count(); l++)
              i[s.get(a.storeDimIndex, l)] = l;
          }
        });
      }, vn = function(t, e, i) {
        return De(t._getCategory(e, i), null);
      }, Wa = function(t, e) {
        var i = t._idList[e];
        return i == null && t._idDimIdx != null && (i = vn(t, t._idDimIdx, e)), i == null && (i = lC + e), i;
      }, dn = function(t) {
        return N(t) || (t = t != null ? [t] : []), t;
      }, pn = function(t) {
        var e = new r(t._schema ? t._schema : Ze(t.dimensions, t._getDimInfo, t), t.hostModel);
        return Rl(e, t), e;
      }, Rl = function(t, e) {
        C(uC.concat(e.__wrappedMethods || []), function(i) {
          e.hasOwnProperty(i) && (t[i] = e[i]);
        }), t.__wrappedMethods = e.__wrappedMethods, C(fC, function(i) {
          t[i] = q(e[i]);
        }), t._calculationInfo = k({}, e._calculationInfo);
      }, kl = function(t, e) {
        var i = t._nameList, n = t._idList, a = t._nameDimIdx, o = t._idDimIdx, s = i[e], l = n[e];
        if (s == null && a != null && (i[e] = s = vn(t, a, e)), l == null && o != null && (n[e] = l = vn(t, o, e)), l == null && s != null) {
          var u = t._nameRepeatCount, f = u[s] = (u[s] || 0) + 1;
          l = s, f > 1 && (l += "__ec__" + f), n[e] = l;
        }
      };
    })(), r;
  })()
);
function hC(r, t) {
  Jf(r) || (r = uy(r)), t = t || {};
  var e = t.coordDimensions || [], i = t.dimensionsDefine || r.dimensionsDefine || [], n = Z(), a = [], o = vC(r, e, i, t.dimensionsCount), s = t.canOmitUnusedDimensions && um(o), l = i === r.dimensionsDefine, u = l ? lm(r) : sm(i), f = t.encodeDefine;
  !f && t.encodeDefaulter && (f = t.encodeDefaulter(r, o));
  for (var h = Z(f), v = new yy(o), c = 0; c < v.length; c++)
    v[c] = -1;
  function d(D) {
    var A = v[D];
    if (A < 0) {
      var M = i[D], L = V(M) ? M : {
        name: M
      }, P = new go(), I = L.name;
      I != null && u.get(I) != null && (P.name = P.displayName = I), L.type != null && (P.type = L.type), L.displayName != null && (P.displayName = L.displayName);
      var E = a.length;
      return v[D] = E, P.storeDimIndex = D, a.push(P), P;
    }
    return a[A];
  }
  if (!s)
    for (var c = 0; c < o; c++)
      d(c);
  h.each(function(D, A) {
    var M = Rt(D).slice();
    if (M.length === 1 && !z(M[0]) && M[0] < 0) {
      h.set(A, !1);
      return;
    }
    var L = h.set(A, []);
    C(M, function(P, I) {
      var E = z(P) ? u.get(P) : P;
      E != null && E < o && (L[I] = E, g(d(E), A, I));
    });
  });
  var y = 0;
  C(e, function(D) {
    var A, M, L, P;
    if (z(D))
      A = D, P = {};
    else {
      P = D, A = P.name;
      var I = P.ordinalMeta;
      P.ordinalMeta = null, P = k({}, P), P.ordinalMeta = I, M = P.dimsDef, L = P.otherDims, P.name = P.coordDim = P.coordDimIndex = P.dimsDef = P.otherDims = null;
    }
    var E = h.get(A);
    if (E !== !1) {
      if (E = Rt(E), !E.length)
        for (var R = 0; R < (M && M.length || 1); R++) {
          for (; y < o && d(y).coordDim != null; )
            y++;
          y < o && E.push(y++);
        }
      C(E, function(W, B) {
        var F = d(W);
        if (l && P.type != null && (F.type = P.type), g(at(F, P), A, B), F.name == null && M) {
          var G = M[B];
          !V(G) && (G = {
            name: G
          }), F.name = F.displayName = G.name, F.defaultTooltip = G.defaultTooltip;
        }
        L && at(F.otherDims, L);
      });
    }
  });
  function g(D, A, M) {
    ey.get(A) != null ? D.otherDims[A] = M : (D.coordDim = A, D.coordDimIndex = M, n.set(A, !0));
  }
  var p = t.generateCoord, m = t.generateCoordCount, _ = m != null;
  m = p ? m || 1 : 0;
  var S = p || "value";
  function b(D) {
    D.name == null && (D.name = D.coordDim);
  }
  if (s)
    C(a, function(D) {
      b(D);
    }), a.sort(function(D, A) {
      return D.storeDimIndex - A.storeDimIndex;
    });
  else
    for (var w = 0; w < o; w++) {
      var x = d(w), T = x.coordDim;
      T == null && (x.coordDim = dC(S, n, _), x.coordDimIndex = 0, (!p || m <= 0) && (x.isExtraCoord = !0), m--), b(x), x.type == null && (ay(r, w) === Yt.Must || x.isExtraCoord && (x.otherDims.itemName != null || x.otherDims.seriesName != null)) && (x.type = "ordinal");
    }
  return cC(a), new am({
    source: r,
    dimensions: a,
    fullDimensionCount: o,
    dimensionOmitted: s
  });
}
function cC(r) {
  for (var t = Z(), e = 0; e < r.length; e++) {
    var i = r[e], n = i.name, a = t.get(n) || 0;
    a > 0 && (i.name = n + (a - 1)), a++, t.set(n, a);
  }
}
function vC(r, t, e, i) {
  var n = Math.max(r.dimensionsDetectedCount || 1, t.length, e.length, i || 0);
  return C(t, function(a) {
    var o;
    V(a) && (o = a.dimsDef) && (n = Math.max(n, o.length));
  }), n;
}
function dC(r, t, e) {
  if (e || t.hasKey(r)) {
    for (var i = 0; t.hasKey(r + i); )
      i++;
    r += i;
  }
  return t.set(r, !0), r;
}
var pC = (
  /** @class */
  /* @__PURE__ */ (function() {
    function r(t) {
      this.coordSysDims = [], this.axisMap = Z(), this.categoryAxisMap = Z(), this.coordSysName = t;
    }
    return r;
  })()
);
function gC(r) {
  var t = r.get("coordinateSystem"), e = new pC(t), i = yC[t];
  if (i)
    return i(r, e, e.axisMap, e.categoryAxisMap), e;
}
var yC = {
  cartesian2d: function(r, t, e, i) {
    var n = r.getReferringComponents("xAxis", de).models[0], a = r.getReferringComponents("yAxis", de).models[0];
    t.coordSysDims = ["x", "y"], e.set("x", n), e.set("y", a), gi(n) && (i.set("x", n), t.firstCategoryDimIndex = 0), gi(a) && (i.set("y", a), t.firstCategoryDimIndex == null && (t.firstCategoryDimIndex = 1));
  },
  singleAxis: function(r, t, e, i) {
    var n = r.getReferringComponents("singleAxis", de).models[0];
    t.coordSysDims = ["single"], e.set("single", n), gi(n) && (i.set("single", n), t.firstCategoryDimIndex = 0);
  },
  polar: function(r, t, e, i) {
    var n = r.getReferringComponents("polar", de).models[0], a = n.findAxisModel("radiusAxis"), o = n.findAxisModel("angleAxis");
    t.coordSysDims = ["radius", "angle"], e.set("radius", a), e.set("angle", o), gi(a) && (i.set("radius", a), t.firstCategoryDimIndex = 0), gi(o) && (i.set("angle", o), t.firstCategoryDimIndex == null && (t.firstCategoryDimIndex = 1));
  },
  geo: function(r, t, e, i) {
    t.coordSysDims = ["lng", "lat"];
  },
  parallel: function(r, t, e, i) {
    var n = r.ecModel, a = n.getComponent("parallel", r.get("parallelIndex")), o = t.coordSysDims = a.dimensions.slice();
    C(a.parallelAxisIndex, function(s, l) {
      var u = n.getComponent("parallelAxis", s), f = o[l];
      e.set(f, u), gi(u) && (i.set(f, u), t.firstCategoryDimIndex == null && (t.firstCategoryDimIndex = l));
    });
  }
};
function gi(r) {
  return r.get("type") === "category";
}
function mC(r, t, e) {
  e = e || {};
  var i = e.byIndex, n = e.stackedCoordDimension, a, o, s;
  _C(t) ? a = t : (o = t.schema, a = o.dimensions, s = t.store);
  var l = !!(r && r.get("stack")), u, f, h, v;
  if (C(a, function(m, _) {
    z(m) && (a[_] = m = {
      name: m
    }), l && !m.isExtraCoord && (!i && !u && m.ordinalMeta && (u = m), !f && m.type !== "ordinal" && m.type !== "time" && (!n || n === m.coordDim) && (f = m));
  }), f && !i && !u && (i = !0), f) {
    h = "__\0ecstackresult_" + r.id, v = "__\0ecstackedover_" + r.id, u && (u.createInvertedIndices = !0);
    var c = f.coordDim, d = f.type, y = 0;
    C(a, function(m) {
      m.coordDim === c && y++;
    });
    var g = {
      name: h,
      coordDim: c,
      coordDimIndex: y,
      type: d,
      isExtraCoord: !0,
      isCalculationCoord: !0,
      storeDimIndex: a.length
    }, p = {
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
    o ? (s && (g.storeDimIndex = s.ensureCalculationDimension(v, d), p.storeDimIndex = s.ensureCalculationDimension(h, d)), o.appendCalculationDimension(g), o.appendCalculationDimension(p)) : (a.push(g), a.push(p));
  }
  return {
    stackedDimension: f && f.name,
    stackedByDimension: u && u.name,
    isStackedByIndex: i,
    stackedOverDimension: v,
    stackResultDimension: h
  };
}
function _C(r) {
  return !om(r.schema);
}
function $i(r, t) {
  return !!t && t === r.getCalculationInfo("stackedDimension");
}
function fm(r, t) {
  return $i(r, t) ? r.getCalculationInfo("stackResultDimension") : t;
}
function SC(r, t) {
  var e = r.get("coordinateSystem"), i = jf.get(e), n;
  return t && t.coordSysDims && (n = H(t.coordSysDims, function(a) {
    var o = {
      name: a
    }, s = t.axisMap.get(a);
    if (s) {
      var l = s.get("type");
      o.type = iC(l);
    }
    return o;
  })), n || (n = i && (i.getDimensionsInfo ? i.getDimensionsInfo() : i.dimensions.slice()) || ["x", "y"]), n;
}
function wC(r, t, e) {
  var i, n;
  return e && C(r, function(a, o) {
    var s = a.coordDim, l = e.categoryAxisMap.get(s);
    l && (i == null && (i = o), a.ordinalMeta = l.getOrdinalMeta(), t && (a.createInvertedIndices = !0)), a.otherDims.itemName != null && (n = !0);
  }), !n && i != null && (r[i].otherDims.itemName = 0), i;
}
function bC(r, t, e) {
  e = e || {};
  var i = t.getSourceManager(), n, a = !1;
  n = i.getSource(), a = n.sourceFormat === se;
  var o = gC(t), s = SC(t, o), l = e.useEncodeDefaulter, u = $(l) ? l : l ? lt(yb, s, t) : null, f = {
    coordDimensions: s,
    generateCoord: e.generateCoord,
    encodeDefine: t.getEncode(),
    encodeDefaulter: u,
    canOmitUnusedDimensions: !a
  }, h = hC(n, f), v = wC(h.dimensions, e.createInvertedIndices, o), c = a ? null : i.getSharedDataStore(h), d = mC(t, {
    schema: h,
    store: c
  }), y = new $n(h, t);
  y.setCalculationInfo(d);
  var g = v != null && xC(n) ? function(p, m, _, S) {
    return S === v ? _ : this.defaultDimValueGetter(p, m, _, S);
  } : null;
  return y.hasItemOption = !1, y.initData(
    // Try to reuse the data store in sourceManager if using dataset.
    a ? n : c,
    null,
    g
  ), y;
}
function xC(r) {
  if (r.sourceFormat === se) {
    var t = TC(r.data || []);
    return !N(fa(t));
  }
}
function TC(r) {
  for (var t = 0; t < r.length && r[t] == null; )
    t++;
  return r[t];
}
var Pe = (
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
Qo(Pe);
var CC = 0, Yu = (
  /** @class */
  (function() {
    function r(t) {
      this.categories = t.categories || [], this._needCollect = t.needCollect, this._deduplication = t.deduplication, this.uid = ++CC;
    }
    return r.createByAxisModel = function(t) {
      var e = t.option, i = e.data, n = i && H(i, DC);
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
function DC(r) {
  return V(r) && r.value != null ? r.value : r + "";
}
function Xu(r) {
  return r.type === "interval" || r.type === "log";
}
function MC(r, t, e, i) {
  var n = {}, a = r[1] - r[0], o = n.interval = tg(a / t);
  e != null && o < e && (o = n.interval = e), i != null && o > i && (o = n.interval = i);
  var s = n.intervalPrecision = hm(o), l = n.niceTickExtent = [mt(Math.ceil(r[0] / o) * o, s), mt(Math.floor(r[1] / o) * o, s)];
  return AC(l, r), n;
}
function Ol(r) {
  var t = Math.pow(10, Mf(r)), e = r / t;
  return e ? e === 2 ? e = 3 : e === 3 ? e = 5 : e *= 2 : e = 1, mt(e * t);
}
function hm(r) {
  return Te(r) + 2;
}
function vd(r, t, e) {
  r[t] = Math.max(Math.min(r[t], e[1]), e[0]);
}
function AC(r, t) {
  !isFinite(r[0]) && (r[0] = t[0]), !isFinite(r[1]) && (r[1] = t[1]), vd(r, 0, t), vd(r, 1, t), r[0] > r[1] && (r[0] = r[1]);
}
function xs(r, t) {
  return r >= t[0] && r <= t[1];
}
function Ts(r, t) {
  return t[1] === t[0] ? 0.5 : (r - t[0]) / (t[1] - t[0]);
}
function Cs(r, t) {
  return r * (t[1] - t[0]) + t[0];
}
var fh = (
  /** @class */
  (function(r) {
    O(t, r);
    function t(e) {
      var i = r.call(this, e) || this;
      i.type = "ordinal";
      var n = i.getSetting("ordinalMeta");
      return n || (n = new Yu({})), N(n) && (n = new Yu({
        categories: H(n, function(a) {
          return V(a) ? a.value : a;
        })
      })), i._ordinalMeta = n, i._extent = i.getSetting("extent") || [0, n.categories.length - 1], i;
    }
    return t.prototype.parse = function(e) {
      return e == null ? NaN : z(e) ? this._ordinalMeta.getOrdinal(e) : Math.round(e);
    }, t.prototype.contain = function(e) {
      return e = this.parse(e), xs(e, this._extent) && this._ordinalMeta.categories[e] != null;
    }, t.prototype.normalize = function(e) {
      return e = this._getTickNumber(this.parse(e)), Ts(e, this._extent);
    }, t.prototype.scale = function(e) {
      return e = Math.round(Cs(e, this._extent)), this.getRawOrdinalNumber(e);
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
  })(Pe)
);
Pe.registerClass(fh);
var kr = mt, Zi = (
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
      return xs(e, this._extent);
    }, t.prototype.normalize = function(e) {
      return Ts(e, this._extent);
    }, t.prototype.scale = function(e) {
      return Cs(e, this._extent);
    }, t.prototype.setExtent = function(e, i) {
      var n = this._extent;
      isNaN(e) || (n[0] = parseFloat(e)), isNaN(i) || (n[1] = parseFloat(i));
    }, t.prototype.unionExtent = function(e) {
      var i = this._extent;
      e[0] < i[0] && (i[0] = e[0]), e[1] > i[1] && (i[1] = e[1]), this.setExtent(i[0], i[1]);
    }, t.prototype.getInterval = function() {
      return this._interval;
    }, t.prototype.setInterval = function(e) {
      this._interval = e, this._niceExtent = this._extent.slice(), this._intervalPrecision = hm(e);
    }, t.prototype.getTicks = function(e) {
      var i = this._interval, n = this._extent, a = this._niceExtent, o = this._intervalPrecision, s = [];
      if (!i)
        return s;
      var l = 1e4;
      n[0] < a[0] && (e ? s.push({
        value: kr(a[0] - i, o)
      }) : s.push({
        value: n[0]
      }));
      for (var u = a[0]; u <= a[1] && (s.push({
        value: u
      }), u = kr(u + i, o), u !== s[s.length - 1].value); )
        if (s.length > l)
          return [];
      var f = s.length ? s[s.length - 1].value : a[1];
      return n[1] > f && (e ? s.push({
        value: kr(f + i, o)
      }) : s.push({
        value: n[1]
      })), s;
    }, t.prototype.getMinorTicks = function(e) {
      for (var i = this.getTicks(!0), n = [], a = this.getExtent(), o = 1; o < i.length; o++) {
        for (var s = i[o], l = i[o - 1], u = 0, f = [], h = s.value - l.value, v = h / e; u < e - 1; ) {
          var c = kr(l.value + (u + 1) * v);
          c > a[0] && c < a[1] && f.push(c), u++;
        }
        n.push(f);
      }
      return n;
    }, t.prototype.getLabel = function(e, i) {
      if (e == null)
        return "";
      var n = i && i.precision;
      n == null ? n = Te(e.value) || 0 : n === "auto" && (n = this._intervalPrecision);
      var a = kr(e.value, n, !0);
      return Qg(a);
    }, t.prototype.calcNiceTicks = function(e, i, n) {
      e = e || 5;
      var a = this._extent, o = a[1] - a[0];
      if (isFinite(o)) {
        o < 0 && (o = -o, a.reverse());
        var s = MC(a, e, i, n);
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
      e.fixMin || (i[0] = kr(Math.floor(i[0] / o) * o)), e.fixMax || (i[1] = kr(Math.ceil(i[1] / o) * o));
    }, t.prototype.setNiceExtent = function(e, i) {
      this._niceExtent = [e, i];
    }, t.type = "interval", t;
  })(Pe)
);
Pe.registerClass(Zi);
var cm = typeof Float32Array < "u", LC = cm ? Float32Array : Array;
function Ci(r) {
  return N(r) ? cm ? new Float32Array(r) : r : new LC(r);
}
var PC = "__ec_stack_";
function IC(r) {
  return r.get("stack") || PC + r.seriesIndex;
}
function vm(r) {
  return r.dim + r.index;
}
function EC(r, t) {
  var e = [];
  return t.eachSeriesByType(r, function(i) {
    BC(i) && e.push(i);
  }), e;
}
function RC(r) {
  var t = {};
  C(r, function(l) {
    var u = l.coordinateSystem, f = u.getBaseAxis();
    if (!(f.type !== "time" && f.type !== "value"))
      for (var h = l.getData(), v = f.dim + "_" + f.index, c = h.getDimensionIndex(h.mapDimension(f.dim)), d = h.getStore(), y = 0, g = d.count(); y < g; ++y) {
        var p = d.get(c, y);
        t[v] ? t[v].push(p) : t[v] = [p];
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
function kC(r) {
  var t = RC(r), e = [];
  return C(r, function(i) {
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
    var d = St(i.get("barWidth"), s), y = St(i.get("barMaxWidth"), s), g = St(
      // barMinWidth by default is 0.5 / 1 in cartesian. Because in value axis,
      // the auto-calculated bar width might be less than 0.5 / 1.
      i.get("barMinWidth") || (FC(i) ? 0.5 : 1),
      s
    ), p = i.get("barGap"), m = i.get("barCategoryGap");
    e.push({
      bandWidth: s,
      barWidth: d,
      barMaxWidth: y,
      barMinWidth: g,
      barGap: p,
      barCategoryGap: m,
      axisKey: vm(a),
      stackId: IC(i)
    });
  }), OC(e);
}
function OC(r) {
  var t = {};
  C(r, function(i, n) {
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
  return C(t, function(i, n) {
    e[n] = {};
    var a = i.stacks, o = i.bandWidth, s = i.categoryGap;
    if (s == null) {
      var l = vt(a).length;
      s = Math.max(35 - l * 4, 15) + "%";
    }
    var u = St(s, o), f = St(i.gap, 1), h = i.remainedWidth, v = i.autoWidthCount, c = (h - u) / (v + (v - 1) * f);
    c = Math.max(c, 0), C(a, function(p) {
      var m = p.maxWidth, _ = p.minWidth;
      if (p.width) {
        var S = p.width;
        m && (S = Math.min(S, m)), _ && (S = Math.max(S, _)), p.width = S, h -= S + f * S, v--;
      } else {
        var S = c;
        m && m < S && (S = Math.min(m, h)), _ && _ > S && (S = _), S !== c && (p.width = S, h -= S + f * S, v--);
      }
    }), c = (h - u) / (v + (v - 1) * f), c = Math.max(c, 0);
    var d = 0, y;
    C(a, function(p, m) {
      p.width || (p.width = c), y = p, d += p.width * (1 + f);
    }), y && (d -= y.width * f);
    var g = -d / 2;
    C(a, function(p, m) {
      e[n][m] = e[n][m] || {
        bandWidth: o,
        offset: g,
        width: p.width
      }, g += p.width * (1 + f);
    });
  }), e;
}
function NC(r, t, e) {
  if (r && t) {
    var i = r[vm(t)];
    return i;
  }
}
function BC(r) {
  return r.coordinateSystem && r.coordinateSystem.type === "cartesian2d";
}
function FC(r) {
  return r.pipelineContext && r.pipelineContext.large;
}
var zC = function(r, t, e, i) {
  for (; e < i; ) {
    var n = e + i >>> 1;
    r[n][1] < t ? e = n + 1 : i = n;
  }
  return e;
}, dm = (
  /** @class */
  (function(r) {
    O(t, r);
    function t(e) {
      var i = r.call(this, e) || this;
      return i.type = "time", i;
    }
    return t.prototype.getLabel = function(e) {
      var i = this.getSetting("useUTC");
      return cs(e.value, av[sb(Ii(this._minLevelUnit))] || av.second, i, this.getSetting("locale"));
    }, t.prototype.getFormattedLabel = function(e, i, n) {
      var a = this.getSetting("useUTC"), o = this.getSetting("locale");
      return lb(e, i, n, o, a);
    }, t.prototype.getTicks = function() {
      var e = this._interval, i = this._extent, n = [];
      if (!e)
        return n;
      n.push({
        value: i[0],
        level: 0
      });
      var a = this.getSetting("useUTC"), o = YC(this._minLevelUnit, this._approxInterval, a, i);
      return n = n.concat(o), n.push({
        value: i[1],
        level: 0
      }), n;
    }, t.prototype.calcNiceExtent = function(e) {
      var i = this._extent;
      if (i[0] === i[1] && (i[0] -= ne, i[1] += ne), i[1] === -1 / 0 && i[0] === 1 / 0) {
        var n = /* @__PURE__ */ new Date();
        i[1] = +new Date(n.getFullYear(), n.getMonth(), n.getDate()), i[0] = i[1] - ne;
      }
      this.calcNiceTicks(e.splitNumber, e.minInterval, e.maxInterval);
    }, t.prototype.calcNiceTicks = function(e, i, n) {
      e = e || 10;
      var a = this._extent, o = a[1] - a[0];
      this._approxInterval = o / e, i != null && this._approxInterval < i && (this._approxInterval = i), n != null && this._approxInterval > n && (this._approxInterval = n);
      var s = Ua.length, l = Math.min(zC(Ua, this._approxInterval, 0, s), s - 1);
      this._interval = Ua[l][1], this._minLevelUnit = Ua[Math.max(l - 1, 0)][0];
    }, t.prototype.parse = function(e) {
      return ut(e) ? e : +Fe(e);
    }, t.prototype.contain = function(e) {
      return xs(this.parse(e), this._extent);
    }, t.prototype.normalize = function(e) {
      return Ts(this.parse(e), this._extent);
    }, t.prototype.scale = function(e) {
      return Cs(e, this._extent);
    }, t.type = "time", t;
  })(Zi)
), Ua = [
  // Format                           interval
  ["second", Yf],
  ["minute", Xf],
  ["hour", Nn],
  ["quarter-day", Nn * 6],
  ["half-day", Nn * 12],
  ["day", ne * 1.2],
  ["half-week", ne * 3.5],
  ["week", ne * 7],
  ["month", ne * 31],
  ["quarter", ne * 95],
  ["half-year", nv / 2],
  ["year", nv]
  // 1Y
];
function HC(r, t, e, i) {
  var n = Fe(t), a = Fe(e), o = function(d) {
    return ov(n, d, i) === ov(a, d, i);
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
function $C(r, t) {
  return r /= ne, r > 16 ? 16 : r > 7.5 ? 7 : r > 3.5 ? 4 : r > 1.5 ? 2 : 1;
}
function VC(r) {
  var t = 30 * ne;
  return r /= t, r > 6 ? 6 : r > 3 ? 3 : r > 2 ? 2 : 1;
}
function GC(r) {
  return r /= Nn, r > 12 ? 12 : r > 6 ? 6 : r > 3.5 ? 4 : r > 2 ? 2 : 1;
}
function dd(r, t) {
  return r /= t ? Xf : Yf, r > 30 ? 30 : r > 20 ? 20 : r > 15 ? 15 : r > 10 ? 10 : r > 5 ? 5 : r > 2 ? 2 : 1;
}
function WC(r) {
  return tg(r);
}
function UC(r, t, e) {
  var i = new Date(r);
  switch (Ii(t)) {
    case "year":
    case "month":
      i[Ug(e)](0);
    case "day":
      i[Yg(e)](1);
    case "hour":
      i[Xg(e)](0);
    case "minute":
      i[Zg(e)](0);
    case "second":
      i[qg(e)](0), i[Kg(e)](0);
  }
  return i.getTime();
}
function YC(r, t, e, i) {
  var n = 1e4, a = Gg, o = 0;
  function s(A, M, L, P, I, E, R) {
    for (var W = new Date(M), B = M, F = W[P](); B < L && B <= i[1]; )
      R.push({
        value: B
      }), F += A, W[I](F), B = W.getTime();
    R.push({
      value: B,
      notAdd: !0
    });
  }
  function l(A, M, L) {
    var P = [], I = !M.length;
    if (!HC(Ii(A), i[0], i[1], e)) {
      I && (M = [{
        // TODO Optimize. Not include so may ticks.
        value: UC(new Date(i[0]), A, e)
      }, {
        value: i[1]
      }]);
      for (var E = 0; E < M.length - 1; E++) {
        var R = M[E].value, W = M[E + 1].value;
        if (R !== W) {
          var B = void 0, F = void 0, G = void 0, it = !1;
          switch (A) {
            case "year":
              B = Math.max(1, Math.round(t / ne / 365)), F = Zf(e), G = ub(e);
              break;
            case "half-year":
            case "quarter":
            case "month":
              B = VC(t), F = Ei(e), G = Ug(e);
              break;
            case "week":
            // PENDING If week is added. Ignore day.
            case "half-week":
            case "day":
              B = $C(t), F = vs(e), G = Yg(e), it = !0;
              break;
            case "half-day":
            case "quarter-day":
            case "hour":
              B = GC(t), F = ta(e), G = Xg(e);
              break;
            case "minute":
              B = dd(t, !0), F = ds(e), G = Zg(e);
              break;
            case "second":
              B = dd(t, !1), F = ps(e), G = qg(e);
              break;
            case "millisecond":
              B = WC(t), F = gs(e), G = Kg(e);
              break;
          }
          s(B, R, W, F, G, it, P), A === "year" && L.length > 1 && E === 0 && L.unshift({
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
    var d = Ii(a[c]);
    if (ob(a[c])) {
      l(a[c], u[u.length - 1] || [], f);
      var y = a[c + 1] ? Ii(a[c + 1]) : null;
      if (d !== y) {
        if (f.length) {
          v = h, f.sort(function(A, M) {
            return A.value - M.value;
          });
          for (var g = [], p = 0; p < f.length; ++p) {
            var m = f[p].value;
            (p === 0 || f[p - 1].value !== m) && (g.push(f[p]), m >= i[0] && m <= i[1] && h++);
          }
          var _ = (i[1] - i[0]) / t;
          if (h > _ * 1.5 && v > _ / 1.5 || (u.push(g), h > _ || r === a[c]))
            break;
        }
        f = [];
      }
    }
  }
  for (var S = _t(H(u, function(A) {
    return _t(A, function(M) {
      return M.value >= i[0] && M.value <= i[1] && !M.notAdd;
    });
  }), function(A) {
    return A.length > 0;
  }), b = [], w = S.length - 1, c = 0; c < S.length; ++c)
    for (var x = S[c], T = 0; T < x.length; ++T)
      b.push({
        value: x[T].value,
        level: w - c
      });
  b.sort(function(A, M) {
    return A.value - M.value;
  });
  for (var D = [], c = 0; c < b.length; ++c)
    (c === 0 || b[c].value !== b[c - 1].value) && D.push(b[c]);
  return D;
}
Pe.registerClass(dm);
var pd = Pe.prototype, Vn = Zi.prototype, XC = mt, ZC = Math.floor, qC = Math.ceil, Ya = Math.pow, fe = Math.log, hh = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = "log", e.base = 10, e._originalScale = new Zi(), e._interval = 0, e;
    }
    return t.prototype.getTicks = function(e) {
      var i = this._originalScale, n = this._extent, a = i.getExtent(), o = Vn.getTicks.call(this, e);
      return H(o, function(s) {
        var l = s.value, u = mt(Ya(this.base, l));
        return u = l === n[0] && this._fixMin ? Xa(u, a[0]) : u, u = l === n[1] && this._fixMax ? Xa(u, a[1]) : u, {
          value: u
        };
      }, this);
    }, t.prototype.setExtent = function(e, i) {
      var n = fe(this.base);
      e = fe(Math.max(0, e)) / n, i = fe(Math.max(0, i)) / n, Vn.setExtent.call(this, e, i);
    }, t.prototype.getExtent = function() {
      var e = this.base, i = pd.getExtent.call(this);
      i[0] = Ya(e, i[0]), i[1] = Ya(e, i[1]);
      var n = this._originalScale, a = n.getExtent();
      return this._fixMin && (i[0] = Xa(i[0], a[0])), this._fixMax && (i[1] = Xa(i[1], a[1])), i;
    }, t.prototype.unionExtent = function(e) {
      this._originalScale.unionExtent(e);
      var i = this.base;
      e[0] = fe(e[0]) / fe(i), e[1] = fe(e[1]) / fe(i), pd.unionExtent.call(this, e);
    }, t.prototype.unionExtentFromData = function(e, i) {
      this.unionExtent(e.getApproximateExtent(i));
    }, t.prototype.calcNiceTicks = function(e) {
      e = e || 10;
      var i = this._extent, n = i[1] - i[0];
      if (!(n === 1 / 0 || n <= 0)) {
        var a = v1(n), o = e / n * a;
        for (o <= 0.5 && (a *= 10); !isNaN(a) && Math.abs(a) < 1 && Math.abs(a) > 0; )
          a *= 10;
        var s = [mt(qC(i[0] / a) * a), mt(ZC(i[1] / a) * a)];
        this._interval = a, this._niceExtent = s;
      }
    }, t.prototype.calcNiceExtent = function(e) {
      Vn.calcNiceExtent.call(this, e), this._fixMin = e.fixMin, this._fixMax = e.fixMax;
    }, t.prototype.parse = function(e) {
      return e;
    }, t.prototype.contain = function(e) {
      return e = fe(e) / fe(this.base), xs(e, this._extent);
    }, t.prototype.normalize = function(e) {
      return e = fe(e) / fe(this.base), Ts(e, this._extent);
    }, t.prototype.scale = function(e) {
      return e = Cs(e, this._extent), Ya(this.base, e);
    }, t.type = "log", t;
  })(Pe)
), pm = hh.prototype;
pm.getMinorTicks = Vn.getMinorTicks;
pm.getLabel = Vn.getLabel;
function Xa(r, t) {
  return XC(r, Te(t));
}
Pe.registerClass(hh);
var KC = (
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
      $(o) ? this._modelMinNum = Za(t, o({
        min: i[0],
        max: i[1]
      })) : o !== "dataMin" && (this._modelMinNum = Za(t, o));
      var s = this._modelMaxRaw = e.get("max", !0);
      if ($(s) ? this._modelMaxNum = Za(t, s({
        min: i[0],
        max: i[1]
      })) : s !== "dataMax" && (this._modelMaxNum = Za(t, s)), n)
        this._axisDataLen = e.getCategories().length;
      else {
        var l = e.get("boundaryGap"), u = N(l) ? l : [l || 0, l || 0];
        typeof u[0] == "boolean" || typeof u[1] == "boolean" ? this._boundaryGapInner = [0, 0] : this._boundaryGapInner = [Zr(u[0], 1), Zr(u[1], 1)];
      }
    }, r.prototype.calculate = function() {
      var t = this._isOrdinal, e = this._dataMin, i = this._dataMax, n = this._axisDataLen, a = this._boundaryGapInner, o = t ? null : i - e || Math.abs(e), s = this._modelMinRaw === "dataMin" ? e : this._modelMinNum, l = this._modelMaxRaw === "dataMax" ? i : this._modelMaxNum, u = s != null, f = l != null;
      s == null && (s = t ? n ? 0 : NaN : e - a[0] * o), l == null && (l = t ? n ? n - 1 : NaN : i + a[1] * o), (s == null || !isFinite(s)) && (s = NaN), (l == null || !isFinite(l)) && (l = NaN);
      var h = _o(s) || _o(l) || t && !n;
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
      this[jC[t]] = e;
    }, r.prototype.setDeterminedMinMax = function(t, e) {
      var i = QC[t];
      this[i] = e;
    }, r.prototype.freeze = function() {
      this.frozen = !0;
    }, r;
  })()
), QC = {
  min: "_determinedMin",
  max: "_determinedMax"
}, jC = {
  min: "_dataMin",
  max: "_dataMax"
};
function JC(r, t, e) {
  var i = r.rawExtentInfo;
  return i || (i = new KC(r, t, e), r.rawExtentInfo = i, i);
}
function Za(r, t) {
  return t == null ? null : _o(t) ? NaN : r.parse(t);
}
function gm(r, t) {
  var e = r.type, i = JC(r, t, r.getExtent()).calculate();
  r.setBlank(i.isBlank);
  var n = i.min, a = i.max, o = t.ecModel;
  if (o && e === "time") {
    var s = EC("bar", o), l = !1;
    if (C(s, function(h) {
      l = l || h.getBaseAxis() === t.axis;
    }), l) {
      var u = kC(s), f = tD(n, a, t, u);
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
function tD(r, t, e, i) {
  var n = e.axis.getExtent(), a = Math.abs(n[1] - n[0]), o = NC(i, e.axis);
  if (o === void 0)
    return {
      min: r,
      max: t
    };
  var s = 1 / 0;
  C(o, function(c) {
    s = Math.min(c.offset, s);
  });
  var l = -1 / 0;
  C(o, function(c) {
    l = Math.max(c.offset + c.width, l);
  }), s = Math.abs(s), l = Math.abs(l);
  var u = s + l, f = t - r, h = 1 - (s + l) / a, v = f / h - f;
  return t += v * (l / u), r -= v * (s / u), {
    min: r,
    max: t
  };
}
function gd(r, t) {
  var e = t, i = gm(r, e), n = i.extent, a = e.get("splitNumber");
  r instanceof hh && (r.base = e.get("logBase"));
  var o = r.type, s = e.get("interval"), l = o === "interval" || o === "time";
  r.setExtent(n[0], n[1]), r.calcNiceExtent({
    splitNumber: a,
    fixMin: i.fixMin,
    fixMax: i.fixMax,
    minInterval: l ? e.get("minInterval") : null,
    maxInterval: l ? e.get("maxInterval") : null
  }), s != null && r.setInterval && r.setInterval(s);
}
function eD(r, t) {
  if (t = t || r.get("type"), t)
    switch (t) {
      // Buildin scale
      case "category":
        return new fh({
          ordinalMeta: r.getOrdinalMeta ? r.getOrdinalMeta() : r.getCategories(),
          extent: [1 / 0, -1 / 0]
        });
      case "time":
        return new dm({
          locale: r.ecModel.getLocaleModel(),
          useUTC: r.ecModel.get("useUTC")
        });
      default:
        return new (Pe.getClass(t) || Zi)();
    }
}
function rD(r) {
  var t = r.scale.getExtent(), e = t[0], i = t[1];
  return !(e > 0 && i > 0 || e < 0 && i < 0);
}
function qi(r) {
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
  })(t) : $(t) ? /* @__PURE__ */ (function(i) {
    return function(n, a) {
      return e != null && (a = n.value - e), i(ch(r, n), a, n.level != null ? {
        level: n.level
      } : null);
    };
  })(t) : function(i) {
    return r.scale.getLabel(i);
  };
}
function ch(r, t) {
  return r.type === "category" ? r.scale.getLabel(t) : t.value;
}
function iD(r) {
  var t = r.model, e = r.scale;
  if (!(!t.get(["axisLabel", "show"]) || e.isBlank())) {
    var i, n, a = e.getExtent();
    e instanceof fh ? n = e.count() : (i = e.getTicks(), n = i.length);
    var o = r.getLabelModel(), s = qi(r), l, u = 1;
    n > 40 && (u = Math.ceil(n / 40));
    for (var f = 0; f < n; f += u) {
      var h = i ? i[f] : {
        value: a[0] + f
      }, v = s(h, f), c = o.getTextRect(v), d = nD(c, o.get("rotate") || 0);
      l ? l.union(d) : l = d;
    }
    return l;
  }
}
function nD(r, t) {
  var e = t * Math.PI / 180, i = r.width, n = r.height, a = i * Math.abs(Math.cos(e)) + Math.abs(n * Math.sin(e)), o = i * Math.abs(Math.sin(e)) + Math.abs(n * Math.cos(e)), s = new rt(r.x, r.y, a, o);
  return s;
}
function vh(r) {
  var t = r.get("interval");
  return t ?? "auto";
}
function ym(r) {
  return r.type === "category" && vh(r.getLabelModel()) === 0;
}
function aD(r, t) {
  var e = {};
  return C(r.mapDimensionsAll(t), function(i) {
    e[fm(r, i)] = !0;
  }), vt(e);
}
var oD = (
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
), yd = [], sD = {
  registerPreprocessor: rm,
  registerProcessor: im,
  registerPostInit: ZT,
  registerPostUpdate: qT,
  registerUpdateLifecycle: lh,
  registerAction: Xi,
  registerCoordinateSystem: KT,
  registerLayout: QT,
  registerVisual: ei,
  registerTransform: JT,
  registerLoading: nm,
  registerMap: jT,
  registerImpl: AT,
  PRIORITY: $T,
  ComponentModel: nt,
  ComponentView: pe,
  SeriesModel: lr,
  ChartView: Me,
  // TODO Use ComponentModel and SeriesModel instead of Constructor
  registerComponentModel: function(r) {
    nt.registerClass(r);
  },
  registerComponentView: function(r) {
    pe.registerClass(r);
  },
  registerSeriesModel: function(r) {
    lr.registerClass(r);
  },
  registerChartView: function(r) {
    Me.registerClass(r);
  },
  registerSubTypeDefaulter: function(r, t) {
    nt.registerSubTypeDefaulter(r, t);
  },
  registerPainter: function(r, t) {
    s1(r, t);
  }
};
function ur(r) {
  if (N(r)) {
    C(r, function(t) {
      ur(t);
    });
    return;
  }
  et(yd, r) >= 0 || (yd.push(r), $(r) && (r = {
    install: r
  }), r.install(sD));
}
var aa = gt();
function mm(r, t) {
  var e = H(t, function(i) {
    return r.scale.parse(i);
  });
  return r.type === "time" && e.length > 0 && (e.sort(), e.unshift(e[0]), e.push(e[e.length - 1])), e;
}
function lD(r) {
  var t = r.getLabelModel().get("customValues");
  if (t) {
    var e = qi(r), i = r.scale.getExtent(), n = mm(r, t), a = _t(n, function(o) {
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
  return r.type === "category" ? fD(r) : cD(r);
}
function uD(r, t) {
  var e = r.getTickModel().get("customValues");
  if (e) {
    var i = r.scale.getExtent(), n = mm(r, e);
    return {
      ticks: _t(n, function(a) {
        return a >= i[0] && a <= i[1];
      })
    };
  }
  return r.type === "category" ? hD(r, t) : {
    ticks: H(r.scale.getTicks(), function(a) {
      return a.value;
    })
  };
}
function fD(r) {
  var t = r.getLabelModel(), e = _m(r, t);
  return !t.get("show") || r.scale.isBlank() ? {
    labels: [],
    labelCategoryInterval: e.labelCategoryInterval
  } : e;
}
function _m(r, t) {
  var e = Sm(r, "labels"), i = vh(t), n = wm(e, i);
  if (n)
    return n;
  var a, o;
  return $(i) ? a = Tm(r, i) : (o = i === "auto" ? vD(r) : i, a = xm(r, o)), bm(e, i, {
    labels: a,
    labelCategoryInterval: o
  });
}
function hD(r, t) {
  var e = Sm(r, "ticks"), i = vh(t), n = wm(e, i);
  if (n)
    return n;
  var a, o;
  if ((!t.get("show") || r.scale.isBlank()) && (a = []), $(i))
    a = Tm(r, i, !0);
  else if (i === "auto") {
    var s = _m(r, r.getLabelModel());
    o = s.labelCategoryInterval, a = H(s.labels, function(l) {
      return l.tickValue;
    });
  } else
    o = i, a = xm(r, o, !0);
  return bm(e, i, {
    ticks: a,
    tickCategoryInterval: o
  });
}
function cD(r) {
  var t = r.scale.getTicks(), e = qi(r);
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
function Sm(r, t) {
  return aa(r)[t] || (aa(r)[t] = []);
}
function wm(r, t) {
  for (var e = 0; e < r.length; e++)
    if (r[e].key === t)
      return r[e].value;
}
function bm(r, t, e) {
  return r.push({
    key: t,
    value: e
  }), e;
}
function vD(r) {
  var t = aa(r).autoInterval;
  return t ?? (aa(r).autoInterval = r.calculateCategoryInterval());
}
function dD(r) {
  var t = pD(r), e = qi(r), i = (t.axisRotate - t.labelRotate) / 180 * Math.PI, n = r.scale, a = n.getExtent(), o = n.count();
  if (a[1] - a[0] < 1)
    return 0;
  var s = 1;
  o > 40 && (s = Math.max(1, Math.floor(o / 40)));
  for (var l = a[0], u = r.dataToCoord(l + 1) - r.dataToCoord(l), f = Math.abs(u * Math.cos(i)), h = Math.abs(u * Math.sin(i)), v = 0, c = 0; l <= a[1]; l += s) {
    var d = 0, y = 0, g = Cf(e({
      value: l
    }), t.font, "center", "top");
    d = g.width * 1.3, y = g.height * 1.3, v = Math.max(v, d, 7), c = Math.max(c, y, 7);
  }
  var p = v / f, m = c / h;
  isNaN(p) && (p = 1 / 0), isNaN(m) && (m = 1 / 0);
  var _ = Math.max(0, Math.floor(Math.min(p, m))), S = aa(r.model), b = r.getExtent(), w = S.lastAutoInterval, x = S.lastTickCount;
  return w != null && x != null && Math.abs(w - _) <= 1 && Math.abs(x - o) <= 1 && w > _ && S.axisExtent0 === b[0] && S.axisExtent1 === b[1] ? _ = w : (S.lastTickCount = o, S.lastAutoInterval = _, S.axisExtent0 = b[0], S.axisExtent1 = b[1]), _;
}
function pD(r) {
  var t = r.getLabelModel();
  return {
    axisRotate: r.getRotate ? r.getRotate() : r.isHorizontal && !r.isHorizontal() ? 90 : 0,
    labelRotate: t.get("rotate") || 0,
    font: t.getFont()
  };
}
function xm(r, t, e) {
  var i = qi(r), n = r.scale, a = n.getExtent(), o = r.getLabelModel(), s = [], l = Math.max((t || 0) + 1, 1), u = a[0], f = n.count();
  u !== 0 && l > 1 && f / l > 2 && (u = Math.round(Math.ceil(u / l) * l));
  var h = ym(r), v = o.get("showMinLabel") || h, c = o.get("showMaxLabel") || h;
  v && u !== a[0] && y(a[0]);
  for (var d = u; d <= a[1]; d += l)
    y(d);
  c && d - l !== a[1] && y(a[1]);
  function y(g) {
    var p = {
      value: g
    };
    s.push(e ? g : {
      formattedLabel: i(p),
      rawLabel: n.getLabel(p),
      tickValue: g
    });
  }
  return s;
}
function Tm(r, t, e) {
  var i = r.scale, n = qi(r), a = [];
  return C(i.getTicks(), function(o) {
    var s = i.getLabel(o), l = o.value;
    t(o.value, s) && a.push(e ? l : {
      formattedLabel: n(o),
      rawLabel: s,
      tickValue: l
    });
  }), a;
}
var md = [0, 1], gD = (
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
      return f1(t || this.scale.getExtent(), this._extent);
    }, r.prototype.setExtent = function(t, e) {
      var i = this._extent;
      i[0] = t, i[1] = e;
    }, r.prototype.dataToCoord = function(t, e) {
      var i = this._extent, n = this.scale;
      return t = n.normalize(t), this.onBand && n.type === "ordinal" && (i = i.slice(), _d(i, n.count())), cc(t, md, i, e);
    }, r.prototype.coordToData = function(t, e) {
      var i = this._extent, n = this.scale;
      this.onBand && n.type === "ordinal" && (i = i.slice(), _d(i, n.count()));
      var a = cc(t, i, md, e);
      return this.scale.scale(a);
    }, r.prototype.pointToData = function(t, e) {
    }, r.prototype.getTicksCoords = function(t) {
      t = t || {};
      var e = t.tickModel || this.getTickModel(), i = uD(this, e), n = i.ticks, a = H(n, function(s) {
        return {
          coord: this.dataToCoord(this.scale.type === "ordinal" ? this.scale.getRawOrdinalNumber(s) : s),
          tickValue: s
        };
      }, this), o = e.get("alignWithLabel");
      return yD(this, a, o, t.clamp), a;
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
      return lD(this).labels;
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
      return dD(this);
    }, r;
  })()
);
function _d(r, t) {
  var e = r[1] - r[0], i = t, n = e / i / 2;
  r[0] += n, r[1] -= n;
}
function yD(r, t, e, i) {
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
    C(t, function(c) {
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
    return c = mt(c), d = mt(d), h ? c > d : c < d;
  }
}
function mD(r) {
  for (var t = [], e = 0; e < r.length; e++) {
    var i = r[e];
    if (!i.defaultAttr.ignore) {
      var n = i.label, a = n.getComputedTransform(), o = n.getBoundingRect(), s = !a || a[1] < 1e-5 && a[2] < 1e-5, l = n.style.margin || 0, u = o.clone();
      u.applyTransform(a), u.x -= l / 2, u.y -= l / 2, u.width += l, u.height += l;
      var f = s ? new Io(o, a) : null;
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
function _D(r) {
  var t = [];
  r.sort(function(y, g) {
    return g.priority - y.priority;
  });
  var e = new rt(0, 0, 0, 0);
  function i(y) {
    if (!y.ignore) {
      var g = y.ensureState("emphasis");
      g.ignore == null && (g.ignore = !1);
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
        if (d.obb || (d.obb = new Io(d.localRect, d.transform)), h || (h = new Io(s, l)), h.intersect(d.obb)) {
          v = !0;
          break;
        }
      }
    }
    v ? (i(u), f && i(f)) : (u.attr("ignore", a.defaultAttr.ignore), f && f.attr("ignore", a.defaultAttr.labelGuideIgnore), t.push(a));
  }
}
var SD = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = t.type, e.hasSymbolVisual = !0, e;
    }
    return t.prototype.getInitialData = function(e) {
      return bC(null, this, {
        useEncodeDefaulter: !0
      });
    }, t.prototype.getLegendIcon = function(e) {
      var i = new bt(), n = Jr("line", 0, e.itemHeight / 2, e.itemWidth, 0, e.lineStyle.stroke, !1);
      i.add(n), n.setStyle(e.lineStyle);
      var a = this.getData().getVisual("symbol"), o = this.getData().getVisual("symbolRotate"), s = a === "none" ? "circle" : a, l = e.itemHeight * 0.8, u = Jr(s, (e.itemWidth - l) / 2, (e.itemHeight - l) / 2, l, l, e.itemStyle.fill);
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
  })(lr)
);
function Cm(r, t) {
  var e = r.mapDimensionsAll("defaultedLabel"), i = e.length;
  if (i === 1) {
    var n = Hi(r, t, e[0]);
    return n != null ? n + "" : null;
  } else if (i) {
    for (var a = [], o = 0; o < e.length; o++)
      a.push(Hi(r, t, e[o]));
    return a.join(" ");
  }
}
function wD(r, t) {
  var e = r.mapDimensionsAll("defaultedLabel");
  if (!N(t))
    return t + "";
  for (var i = [], n = 0; n < e.length; n++) {
    var a = r.getDimensionIndex(e[n]);
    a >= 0 && i.push(t[a]);
  }
  return i.join(" ");
}
var dh = (
  /** @class */
  (function(r) {
    O(t, r);
    function t(e, i, n, a) {
      var o = r.call(this) || this;
      return o.updateData(e, i, n, a), o;
    }
    return t.prototype._createSymbol = function(e, i, n, a, o) {
      this.removeAll();
      var s = Jr(e, -1, -1, 2, 2, null, o);
      s.attr({
        z2: 100,
        culling: !0,
        scaleX: a[0] / 2,
        scaleY: a[1] / 2
      }), s.drift = bD, this._symbolType = e, this.add(s);
    }, t.prototype.stopSymbolAnimation = function(e) {
      this.childAt(0).stopAnimation(null, e);
    }, t.prototype.getSymbolType = function() {
      return this._symbolType;
    }, t.prototype.getSymbolPath = function() {
      return this.childAt(0);
    }, t.prototype.highlight = function() {
      Qn(this.childAt(0));
    }, t.prototype.downplay = function() {
      jn(this.childAt(0));
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
        f ? v.attr(c) : He(v, c, s, i), Cw(v);
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
          v.scaleX = v.scaleY = 0, v.style.opacity = 0, Ui(v, c, s, i);
        }
      }
      f && this.childAt(0).stopAnimation("leave");
    }, t.prototype._updateCommon = function(e, i, n, a, o) {
      var s = this.childAt(0), l = e.hostModel, u, f, h, v, c, d, y, g, p;
      if (a && (u = a.emphasisItemStyle, f = a.blurItemStyle, h = a.selectItemStyle, v = a.focus, c = a.blurScope, y = a.labelStatesModels, g = a.hoverScale, p = a.cursorStyle, d = a.emphasisDisabled), !a || e.hasItemOption) {
        var m = a && a.itemModel ? a.itemModel : e.getItemModel(i), _ = m.getModel("emphasis");
        u = _.getModel("itemStyle").getItemStyle(), h = m.getModel(["select", "itemStyle"]).getItemStyle(), f = m.getModel(["blur", "itemStyle"]).getItemStyle(), v = _.get("focus"), c = _.get("blurScope"), d = _.get("disabled"), y = va(m), g = _.getShallow("scale"), p = m.getShallow("cursor");
      }
      var S = e.getItemVisual(i, "symbolRotate");
      s.attr("rotation", (S || 0) * Math.PI / 180 || 0);
      var b = ws(e.getItemVisual(i, "symbolOffset"), n);
      b && (s.x = b[0], s.y = b[1]), p && s.attr("cursor", p);
      var w = e.getItemVisual(i, "style"), x = w.fill;
      if (s instanceof fr) {
        var T = s.style;
        s.useStyle(k({
          // TODO other properties like x, y ?
          image: T.image,
          x: T.x,
          y: T.y,
          width: T.width,
          height: T.height
        }, w));
      } else
        s.__isEmptyBrush ? s.useStyle(k({}, w)) : s.useStyle(w), s.style.decal = null, s.setColor(x, o && o.symbolInnerColor), s.style.strokeNoScale = !0;
      var D = e.getItemVisual(i, "liftZ"), A = this._z2;
      D != null ? A == null && (this._z2 = s.z2, s.z2 += D) : A != null && (s.z2 = A, this._z2 = null);
      var M = o && o.useNameLabel;
      fs(s, y, {
        labelFetcher: l,
        labelDataIndex: i,
        defaultText: L,
        inheritColor: x,
        defaultOpacity: w.opacity
      });
      function L(E) {
        return M ? e.getName(E) : Cm(e, E);
      }
      this._sizeX = n[0] / 2, this._sizeY = n[1] / 2;
      var P = s.ensureState("emphasis");
      P.style = u, s.ensureState("select").style = h, s.ensureState("blur").style = f;
      var I = g == null || g === !0 ? Math.max(1.1, 3 / this._sizeY) : isFinite(g) && g > 0 ? +g : 1;
      P.scaleX = this._sizeX * I, P.scaleY = this._sizeY * I, this.setSymbolScale(1), Po(this, v, c, d);
    }, t.prototype.setSymbolScale = function(e) {
      this.scaleX = this.scaleY = e;
    }, t.prototype.fadeOut = function(e, i, n) {
      var a = this.childAt(0), o = tt(this).dataIndex, s = n && n.animation;
      if (this.silent = a.silent = !0, n && n.fadeLabel) {
        var l = a.getTextContent();
        l && Eo(l, {
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
      Eo(a, {
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
      return nh(e.getItemVisual(i, "symbolSize"));
    }, t;
  })(bt)
);
function bD(r, t) {
  this.parent.drift(r, t);
}
function Nl(r, t, e, i) {
  return t && !isNaN(t[0]) && !isNaN(t[1]) && !(i.isIgnore && i.isIgnore(e)) && !(i.clipShape && !i.clipShape.contain(t[0], t[1])) && r.getItemVisual(e, "symbol") !== "none";
}
function Sd(r) {
  return r != null && !V(r) && (r = {
    isIgnore: r
  }), r || {};
}
function wd(r) {
  var t = r.hostModel, e = t.getModel("emphasis");
  return {
    emphasisItemStyle: e.getModel("itemStyle").getItemStyle(),
    blurItemStyle: t.getModel(["blur", "itemStyle"]).getItemStyle(),
    selectItemStyle: t.getModel(["select", "itemStyle"]).getItemStyle(),
    focus: e.get("focus"),
    blurScope: e.get("blurScope"),
    emphasisDisabled: e.get("disabled"),
    hoverScale: e.get("scale"),
    labelStatesModels: va(t),
    cursorStyle: t.get("cursor")
  };
}
var Dm = (
  /** @class */
  (function() {
    function r(t) {
      this.group = new bt(), this._SymbolCtor = t || dh;
    }
    return r.prototype.updateData = function(t, e) {
      this._progressiveEls = null, e = Sd(e);
      var i = this.group, n = t.hostModel, a = this._data, o = this._SymbolCtor, s = e.disableAnimation, l = wd(t), u = {
        disableAnimation: s
      }, f = e.getSymbolPoint || function(h) {
        return t.getItemLayout(h);
      };
      a || i.removeAll(), t.diff(a).add(function(h) {
        var v = f(h);
        if (Nl(t, v, h, e)) {
          var c = new o(t, h, l, u);
          c.setPosition(v), t.setItemGraphicEl(h, c), i.add(c);
        }
      }).update(function(h, v) {
        var c = a.getItemGraphicEl(v), d = f(h);
        if (!Nl(t, d, h, e)) {
          i.remove(c);
          return;
        }
        var y = t.getItemVisual(h, "symbol") || "circle", g = c && c.getSymbolType && c.getSymbolType();
        if (!c || g && g !== y)
          i.remove(c), c = new o(t, h, l, u), c.setPosition(d);
        else {
          c.updateData(t, h, l, u);
          var p = {
            x: d[0],
            y: d[1]
          };
          s ? c.attr(p) : He(c, p, n);
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
      this._seriesScope = wd(t), this._data = null, this.group.removeAll();
    }, r.prototype.incrementalUpdate = function(t, e, i) {
      this._progressiveEls = [], i = Sd(i);
      function n(l) {
        l.isGroup || (l.incremental = !0, l.ensureState("emphasis").hoverLayer = !0);
      }
      for (var a = t.start; a < t.end; a++) {
        var o = e.getItemLayout(a);
        if (Nl(e, o, a, i)) {
          var s = new this._SymbolCtor(e, a, this._seriesScope);
          s.traverse(n), s.setPosition(o), this.group.add(s), e.setItemGraphicEl(a, s), this._progressiveEls.push(s);
        }
      }
    }, r.prototype.eachRendered = function(t) {
      ls(this._progressiveEls || this.group, t);
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
function Mm(r, t, e) {
  var i = r.getBaseAxis(), n = r.getOtherAxis(i), a = xD(n, e), o = i.dim, s = n.dim, l = t.mapDimension(s), u = t.mapDimension(o), f = s === "x" || s === "radius" ? 1 : 0, h = H(r.dimensions, function(d) {
    return t.mapDimension(d);
  }), v = !1, c = t.getCalculationInfo("stackResultDimension");
  return $i(
    t,
    h[0]
    /* , dims[1] */
  ) && (v = !0, h[0] = c), $i(
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
function xD(r, t) {
  var e = 0, i = r.scale.getExtent();
  return t === "start" ? e = i[0] : t === "end" ? e = i[1] : ut(t) && !isNaN(t) ? e = t : i[0] > 0 ? e = i[0] : i[1] < 0 && (e = i[1]), e;
}
function Am(r, t, e, i) {
  var n = NaN;
  r.stacked && (n = e.get(e.getCalculationInfo("stackedOverDimension"), i)), isNaN(n) && (n = r.valueStart);
  var a = r.baseDataOffset, o = [];
  return o[a] = e.get(r.baseDim, i), o[1 - a] = n, t.dataToPoint(o);
}
function TD(r, t) {
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
function CD(r, t, e, i, n, a, o, s) {
  for (var l = TD(r, t), u = [], f = [], h = [], v = [], c = [], d = [], y = [], g = Mm(n, t, o), p = r.getLayout("points") || [], m = t.getLayout("points") || [], _ = 0; _ < l.length; _++) {
    var S = l[_], b = !0, w = void 0, x = void 0;
    switch (S.cmd) {
      case "=":
        w = S.idx * 2, x = S.idx1 * 2;
        var T = p[w], D = p[w + 1], A = m[x], M = m[x + 1];
        (isNaN(T) || isNaN(D)) && (T = A, D = M), u.push(T, D), f.push(A, M), h.push(e[w], e[w + 1]), v.push(i[x], i[x + 1]), y.push(t.getRawIndex(S.idx1));
        break;
      case "+":
        var L = S.idx, P = g.dataDimsForPoint, I = n.dataToPoint([t.get(P[0], L), t.get(P[1], L)]);
        x = L * 2, u.push(I[0], I[1]), f.push(m[x], m[x + 1]);
        var E = Am(g, n, t, L);
        h.push(E[0], E[1]), v.push(i[x], i[x + 1]), y.push(t.getRawIndex(L));
        break;
      case "-":
        b = !1;
    }
    b && (c.push(S), d.push(d.length));
  }
  d.sort(function(dt, le) {
    return y[dt] - y[le];
  });
  for (var R = u.length, W = Ci(R), B = Ci(R), F = Ci(R), G = Ci(R), it = [], _ = 0; _ < d.length; _++) {
    var j = d[_], ft = _ * 2, ht = j * 2;
    W[ft] = u[ht], W[ft + 1] = u[ht + 1], B[ft] = f[ht], B[ft + 1] = f[ht + 1], F[ft] = h[ht], F[ft + 1] = h[ht + 1], G[ft] = v[ht], G[ft + 1] = v[ht + 1], it[_] = c[j];
  }
  return {
    current: W,
    next: B,
    stackedOnCurrent: F,
    stackedOnNext: G,
    status: it
  };
}
var qe = Math.min, Ke = Math.max;
function Wr(r, t) {
  return isNaN(r) || isNaN(t);
}
function Zu(r, t, e, i, n, a, o, s, l) {
  for (var u, f, h, v, c, d, y = e, g = 0; g < i; g++) {
    var p = t[y * 2], m = t[y * 2 + 1];
    if (y >= n || y < 0)
      break;
    if (Wr(p, m)) {
      if (l) {
        y += a;
        continue;
      }
      break;
    }
    if (y === e)
      r[a > 0 ? "moveTo" : "lineTo"](p, m), h = p, v = m;
    else {
      var _ = p - u, S = m - f;
      if (_ * _ + S * S < 0.5) {
        y += a;
        continue;
      }
      if (o > 0) {
        for (var b = y + a, w = t[b * 2], x = t[b * 2 + 1]; w === p && x === m && g < i; )
          g++, b += a, y += a, w = t[b * 2], x = t[b * 2 + 1], p = t[y * 2], m = t[y * 2 + 1], _ = p - u, S = m - f;
        var T = g + 1;
        if (l)
          for (; Wr(w, x) && T < i; )
            T++, b += a, w = t[b * 2], x = t[b * 2 + 1];
        var D = 0.5, A = 0, M = 0, L = void 0, P = void 0;
        if (T >= i || Wr(w, x))
          c = p, d = m;
        else {
          A = w - u, M = x - f;
          var I = p - u, E = w - p, R = m - f, W = x - m, B = void 0, F = void 0;
          if (s === "x") {
            B = Math.abs(I), F = Math.abs(E);
            var G = A > 0 ? 1 : -1;
            c = p - G * B * o, d = m, L = p + G * F * o, P = m;
          } else if (s === "y") {
            B = Math.abs(R), F = Math.abs(W);
            var it = M > 0 ? 1 : -1;
            c = p, d = m - it * B * o, L = p, P = m + it * F * o;
          } else
            B = Math.sqrt(I * I + R * R), F = Math.sqrt(E * E + W * W), D = F / (F + B), c = p - A * o * (1 - D), d = m - M * o * (1 - D), L = p + A * o * D, P = m + M * o * D, L = qe(L, Ke(w, p)), P = qe(P, Ke(x, m)), L = Ke(L, qe(w, p)), P = Ke(P, qe(x, m)), A = L - p, M = P - m, c = p - A * B / F, d = m - M * B / F, c = qe(c, Ke(u, p)), d = qe(d, Ke(f, m)), c = Ke(c, qe(u, p)), d = Ke(d, qe(f, m)), A = p - c, M = m - d, L = p + A * F / B, P = m + M * F / B;
        }
        r.bezierCurveTo(h, v, c, d, p, m), h = L, v = P;
      } else
        r.lineTo(p, m);
    }
    u = p, f = m, y += a;
  }
  return g;
}
var Lm = (
  /** @class */
  /* @__PURE__ */ (function() {
    function r() {
      this.smooth = 0, this.smoothConstraint = !0;
    }
    return r;
  })()
), DD = (
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
      return new Lm();
    }, t.prototype.buildPath = function(e, i) {
      var n = i.points, a = 0, o = n.length / 2;
      if (i.connectNulls) {
        for (; o > 0 && Wr(n[o * 2 - 2], n[o * 2 - 1]); o--)
          ;
        for (; a < o && Wr(n[a * 2], n[a * 2 + 1]); a++)
          ;
      }
      for (; a < o; )
        a += Zu(e, n, a, o, o, 1, i.smooth, i.smoothMonotone, i.connectNulls) + 1;
    }, t.prototype.getPointOn = function(e, i) {
      this.path || (this.createPathProxy(), this.buildPath(this.path, this.shape));
      for (var n = this.path, a = n.data, o = Kr.CMD, s, l, u = i === "x", f = [], h = 0; h < a.length; ) {
        var v = a[h++], c = void 0, d = void 0, y = void 0, g = void 0, p = void 0, m = void 0, _ = void 0;
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
            c = a[h++], d = a[h++], y = a[h++], g = a[h++], p = a[h++], m = a[h++];
            var b = u ? bo(s, c, y, p, e, f) : bo(l, d, g, m, e, f);
            if (b > 0)
              for (var w = 0; w < b; w++) {
                var x = f[w];
                if (x <= 1 && x >= 0) {
                  var S = u ? Ct(l, d, g, m, x) : Ct(s, c, y, p, x);
                  return u ? [e, S] : [S, e];
                }
              }
            s = p, l = m;
            break;
        }
      }
    }, t;
  })(ot)
), MD = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      return r !== null && r.apply(this, arguments) || this;
    }
    return t;
  })(Lm)
), AD = (
  /** @class */
  (function(r) {
    O(t, r);
    function t(e) {
      var i = r.call(this, e) || this;
      return i.type = "ec-polygon", i;
    }
    return t.prototype.getDefaultShape = function() {
      return new MD();
    }, t.prototype.buildPath = function(e, i) {
      var n = i.points, a = i.stackedOnPoints, o = 0, s = n.length / 2, l = i.smoothMonotone;
      if (i.connectNulls) {
        for (; s > 0 && Wr(n[s * 2 - 2], n[s * 2 - 1]); s--)
          ;
        for (; o < s && Wr(n[o * 2], n[o * 2 + 1]); o++)
          ;
      }
      for (; o < s; ) {
        var u = Zu(e, n, o, s, s, 1, i.smooth, l, i.connectNulls);
        Zu(e, a, o + u - 1, u, s, -1, i.stackedOnSmooth, l, i.connectNulls), o += u + 1, e.closePath();
      }
    }, t;
  })(ot)
);
function LD(r, t, e, i, n) {
  var a = r.getArea(), o = a.x, s = a.y, l = a.width, u = a.height, f = e.get(["lineStyle", "width"]) || 0;
  o -= f / 2, s -= f / 2, l += f, u += f, l = Math.ceil(l), o !== Math.floor(o) && (o = Math.floor(o), l++);
  var h = new Dt({
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
    var y = $(n) ? function(g) {
      n(g, h);
    } : null;
    Ui(h, {
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
function PD(r, t, e) {
  var i = r.getArea(), n = mt(i.r0, 1), a = mt(i.r, 1), o = new ns({
    shape: {
      cx: mt(r.cx, 1),
      cy: mt(r.cy, 1),
      r0: n,
      r: a,
      startAngle: i.startAngle,
      endAngle: i.endAngle,
      clockwise: i.clockwise
    }
  });
  if (t) {
    var s = r.getBaseAxis().dim === "angle";
    s ? o.shape.endAngle = i.startAngle : o.shape.r = n, Ui(o, {
      shape: {
        endAngle: i.endAngle,
        r: a
      }
    }, e);
  }
  return o;
}
function Pm(r, t) {
  return r.type === t;
}
function bd(r, t) {
  if (r.length === t.length) {
    for (var e = 0; e < r.length; e++)
      if (r[e] !== t[e])
        return;
    return !0;
  }
}
function xd(r) {
  for (var t = 1 / 0, e = 1 / 0, i = -1 / 0, n = -1 / 0, a = 0; a < r.length; ) {
    var o = r[a++], s = r[a++];
    isNaN(o) || (t = Math.min(o, t), i = Math.max(o, i)), isNaN(s) || (e = Math.min(s, e), n = Math.max(s, n));
  }
  return [[t, e], [i, n]];
}
function Td(r, t) {
  var e = xd(r), i = e[0], n = e[1], a = xd(t), o = a[0], s = a[1];
  return Math.max(Math.abs(i[0] - o[0]), Math.abs(i[1] - o[1]), Math.abs(n[0] - s[0]), Math.abs(n[1] - s[1]));
}
function Cd(r) {
  return ut(r) ? r : r ? 0.5 : 0;
}
function ID(r, t, e) {
  if (!e.valueDim)
    return [];
  for (var i = t.count(), n = Ci(i * 2), a = 0; a < i; a++) {
    var o = Am(e, r, t, a);
    n[a * 2] = o[0], n[a * 2 + 1] = o[1];
  }
  return n;
}
function Qe(r, t, e, i, n) {
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
function ED(r, t) {
  var e = [], i = r.length, n, a;
  function o(f, h, v) {
    var c = f.coord, d = (v - c) / (h.coord - c), y = k0(d, [f.color, h.color]);
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
function RD(r, t, e) {
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
      var v = ED(u, n === "x" ? e.getWidth() : e.getHeight()), c = v.length;
      if (!c && f)
        return u[0].coord < 0 ? h[1] ? h[1] : u[f - 1].color : h[0] ? h[0] : u[0].color;
      var d = 10, y = v[0].coord - d, g = v[c - 1].coord + d, p = g - y;
      if (p < 1e-3)
        return "transparent";
      C(v, function(_) {
        _.offset = (_.coord - y) / p;
      }), v.push({
        // NOTE: inRangeStopLen may still be 0 if stoplen is zero.
        offset: c ? v[c - 1].offset : 0.5,
        color: h[1] || "transparent"
      }), v.unshift({
        offset: c ? v[0].offset : 0.5,
        color: h[0] || "transparent"
      });
      var m = new Eg(0, 0, 0, 0, v, !0);
      return m[n] = y, m[n + "2"] = g, m;
    }
  }
}
function kD(r, t, e) {
  var i = r.get("showAllSymbol"), n = i === "auto";
  if (!(i && !n)) {
    var a = e.getAxesByScale("ordinal")[0];
    if (a && !(n && OD(a, t))) {
      var o = t.mapDimension(a.dim), s = {};
      return C(a.getViewLabels(), function(l) {
        var u = a.scale.getRawOrdinalNumber(l.tickValue);
        s[u] = 1;
      }), function(l) {
        return !s.hasOwnProperty(t.get(o, l));
      };
    }
  }
}
function OD(r, t) {
  var e = r.getExtent(), i = Math.abs(e[1] - e[0]) / r.scale.count();
  isNaN(i) && (i = 0);
  for (var n = t.count(), a = Math.max(1, Math.round(n / 5)), o = 0; o < n; o += a)
    if (dh.getSymbolSize(
      t,
      o
      // Only for cartesian, where `isHorizontal` exists.
    )[r.isHorizontal() ? 1 : 0] * 1.5 > i)
      return !1;
  return !0;
}
function ND(r, t) {
  return isNaN(r) || isNaN(t);
}
function BD(r) {
  for (var t = r.length / 2; t > 0 && ND(r[t * 2 - 2], r[t * 2 - 1]); t--)
    ;
  return t - 1;
}
function Dd(r, t) {
  return [r[t * 2], r[t * 2 + 1]];
}
function FD(r, t, e) {
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
function Im(r) {
  if (r.get(["endLabel", "show"]))
    return !0;
  for (var t = 0; t < oe.length; t++)
    if (r.get([oe[t], "endLabel", "show"]))
      return !0;
  return !1;
}
function Bl(r, t, e, i) {
  if (Pm(t, "cartesian2d")) {
    var n = i.getModel("endLabel"), a = n.get("valueAnimation"), o = i.getData(), s = {
      lastFrameIndex: 0
    }, l = Im(i) ? function(c, d) {
      r._endLabelOnDuring(c, d, o, s, a, n, t);
    } : null, u = t.getBaseAxis().isHorizontal(), f = LD(t, e, i, function() {
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
    return PD(t, e, i);
}
function zD(r, t) {
  var e = t.getBaseAxis(), i = e.isHorizontal(), n = e.inverse, a = i ? n ? "right" : "left" : "center", o = i ? "middle" : n ? "top" : "bottom";
  return {
    normal: {
      align: r.get("align") || a,
      verticalAlign: r.get("verticalAlign") || o
    }
  };
}
var HD = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      return r !== null && r.apply(this, arguments) || this;
    }
    return t.prototype.init = function() {
      var e = new bt(), i = new Dm();
      this.group.add(i.group), this._symbolDraw = i, this._lineGroup = e, this._changePolyState = ct(this._changePolyState, this);
    }, t.prototype.render = function(e, i, n) {
      var a = e.coordinateSystem, o = this.group, s = e.getData(), l = e.getModel("lineStyle"), u = e.getModel("areaStyle"), f = s.getLayout("points") || [], h = a.type === "polar", v = this._coordSys, c = this._symbolDraw, d = this._polyline, y = this._polygon, g = this._lineGroup, p = !i.ssr && e.get("animation"), m = !u.isEmpty(), _ = u.get("origin"), S = Mm(a, s, _), b = m && ID(a, s, S), w = e.get("showSymbol"), x = e.get("connectNulls"), T = w && !h && kD(e, s, a), D = this._data;
      D && D.eachItemGraphicEl(function(dt, le) {
        dt.__temp && (o.remove(dt), D.setItemGraphicEl(le, null));
      }), w || c.remove(), o.add(g);
      var A = h ? !1 : e.get("step"), M;
      a && a.getArea && e.get("clip", !0) && (M = a.getArea(), M.width != null ? (M.x -= 0.1, M.y -= 0.1, M.width += 0.2, M.height += 0.2) : M.r0 && (M.r0 -= 0.5, M.r += 0.5)), this._clipShapeForSymbol = M;
      var L = RD(s, a, n) || s.getVisual("style")[s.getVisual("drawType")];
      if (!(d && v.type === a.type && A === this._step))
        w && c.updateData(s, {
          isIgnore: T,
          clipShape: M,
          disableAnimation: !0,
          getSymbolPoint: function(dt) {
            return [f[dt * 2], f[dt * 2 + 1]];
          }
        }), p && this._initSymbolLabelAnimation(s, a, M), A && (b && (b = Qe(b, f, a, A, x)), f = Qe(f, null, a, A, x)), d = this._newPolyline(f), m ? y = this._newPolygon(f, b) : y && (g.remove(y), y = this._polygon = null), h || this._initOrUpdateEndLabel(e, a, Qr(L)), g.setClipPath(Bl(this, a, !0, e));
      else {
        m && !y ? y = this._newPolygon(f, b) : y && !m && (g.remove(y), y = this._polygon = null), h || this._initOrUpdateEndLabel(e, a, Qr(L));
        var P = g.getClipPath();
        if (P) {
          var I = Bl(this, a, !1, e);
          Ui(P, {
            shape: I.shape
          }, e);
        } else
          g.setClipPath(Bl(this, a, !0, e));
        w && c.updateData(s, {
          isIgnore: T,
          clipShape: M,
          disableAnimation: !0,
          getSymbolPoint: function(dt) {
            return [f[dt * 2], f[dt * 2 + 1]];
          }
        }), (!bd(this._stackedOnPoints, b) || !bd(this._points, f)) && (p ? this._doUpdateAnimation(s, b, a, n, A, _, x) : (A && (b && (b = Qe(b, f, a, A, x)), f = Qe(f, null, a, A, x)), d.setShape({
          points: f
        }), y && y.setShape({
          points: f,
          stackedOnPoints: b
        })));
      }
      var E = e.getModel("emphasis"), R = E.get("focus"), W = E.get("blurScope"), B = E.get("disabled");
      if (d.useStyle(at(
        // Use color in lineStyle first
        l.getLineStyle(),
        {
          fill: "none",
          stroke: L,
          lineJoin: "bevel"
        }
      )), $c(d, e, "lineStyle"), d.style.lineWidth > 0 && e.get(["emphasis", "lineStyle", "width"]) === "bolder") {
        var F = d.getState("emphasis").style;
        F.lineWidth = +d.style.lineWidth + 1;
      }
      tt(d).seriesIndex = e.seriesIndex, Po(d, R, W, B);
      var G = Cd(e.get("smooth")), it = e.get("smoothMonotone");
      if (d.setShape({
        smooth: G,
        smoothMonotone: it,
        connectNulls: x
      }), y) {
        var j = s.getCalculationInfo("stackedOnSeries"), ft = 0;
        y.useStyle(at(u.getAreaStyle(), {
          fill: L,
          opacity: 0.7,
          lineJoin: "bevel",
          decal: s.getVisual("style").decal
        })), j && (ft = Cd(j.get("smooth"))), y.setShape({
          smooth: G,
          stackedOnSmooth: ft,
          smoothMonotone: it,
          connectNulls: x
        }), $c(y, e, "areaStyle"), tt(y).seriesIndex = e.seriesIndex, Po(y, R, W, B);
      }
      var ht = this._changePolyState;
      s.eachItemGraphicEl(function(dt) {
        dt && (dt.onHoverStateChange = ht);
      }), this._polyline.onHoverStateChange = ht, this._data = s, this._coordSys = a, this._stackedOnPoints = b, this._points = f, this._step = A, this._valueOrigin = _, e.get("triggerLineEvent") && (this.packEventData(e, d), y && this.packEventData(e, y));
    }, t.prototype.packEventData = function(e, i) {
      tt(i).eventData = {
        componentType: "series",
        componentSubType: "line",
        componentIndex: e.componentIndex,
        seriesIndex: e.seriesIndex,
        seriesName: e.name,
        seriesType: "line"
      };
    }, t.prototype.highlight = function(e, i, n, a) {
      var o = e.getData(), s = qr(o, a);
      if (this._changePolyState("emphasis"), !(s instanceof Array) && s != null && s >= 0) {
        var l = o.getLayout("points"), u = o.getItemGraphicEl(s);
        if (!u) {
          var f = l[s * 2], h = l[s * 2 + 1];
          if (isNaN(f) || isNaN(h) || this._clipShapeForSymbol && !this._clipShapeForSymbol.contain(f, h))
            return;
          var v = e.get("zlevel") || 0, c = e.get("z") || 0;
          u = new dh(o, s), u.x = f, u.y = h, u.setZ(v, c);
          var d = u.getSymbolPath().getTextContent();
          d && (d.zlevel = v, d.z = c, d.z2 = this._polyline.z2 + 1), u.__temp = !0, o.setItemGraphicEl(s, u), u.stopSymbolAnimation(!0), this.group.add(u);
        }
        u.highlight();
      } else
        Me.prototype.highlight.call(this, e, i, n, a);
    }, t.prototype.downplay = function(e, i, n, a) {
      var o = e.getData(), s = qr(o, a);
      if (this._changePolyState("normal"), s != null && s >= 0) {
        var l = o.getItemGraphicEl(s);
        l && (l.__temp ? (o.setItemGraphicEl(s, null), this.group.remove(l)) : l.downplay());
      } else
        Me.prototype.downplay.call(this, e, i, n, a);
    }, t.prototype._changePolyState = function(e) {
      var i = this._polygon;
      Nc(this._polyline, e), i && Nc(i, e);
    }, t.prototype._newPolyline = function(e) {
      var i = this._polyline;
      return i && this._lineGroup.remove(i), i = new DD({
        shape: {
          points: e
        },
        segmentIgnoreThreshold: 2,
        z2: 10
      }), this._lineGroup.add(i), this._polyline = i, i;
    }, t.prototype._newPolygon = function(e, i) {
      var n = this._polygon;
      return n && this._lineGroup.remove(n), n = new AD({
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
      $(f) && (f = f(null));
      var h = u.get("animationDelay") || 0, v = $(h) ? h(null) : h;
      e.eachItemGraphicEl(function(c, d) {
        var y = c;
        if (y) {
          var g = [c.x, c.y], p = void 0, m = void 0, _ = void 0;
          if (n)
            if (o) {
              var S = n, b = i.pointToCoord(g);
              a ? (p = S.startAngle, m = S.endAngle, _ = -b[1] / 180 * Math.PI) : (p = S.r0, m = S.r, _ = b[0]);
            } else {
              var w = n;
              a ? (p = w.x, m = w.x + w.width, _ = c.x) : (p = w.y + w.height, m = w.y, _ = c.y);
            }
          var x = m === p ? 0 : (_ - p) / (m - p);
          l && (x = 1 - x);
          var T = $(h) ? h(d) : f * x + v, D = y.getSymbolPath(), A = D.getTextContent();
          y.attr({
            scaleX: 0,
            scaleY: 0
          }), y.animateTo({
            scaleX: 1,
            scaleY: 1
          }, {
            duration: 200,
            setToFinal: !0,
            delay: T
          }), A && A.animateFrom({
            style: {
              opacity: 0
            }
          }, {
            duration: 300,
            delay: T
          }), D.disableLabelAnimation = !0;
        }
      });
    }, t.prototype._initOrUpdateEndLabel = function(e, i, n) {
      var a = e.getModel("endLabel");
      if (Im(e)) {
        var o = e.getData(), s = this._polyline, l = o.getLayout("points");
        if (!l) {
          s.removeTextContent(), this._endLabel = null;
          return;
        }
        var u = this._endLabel;
        u || (u = this._endLabel = new Gt({
          z2: 200
          // should be higher than item symbol
        }), u.ignoreClip = !0, s.setTextContent(this._endLabel), s.disableLabelAnimation = !0);
        var f = BD(l);
        f >= 0 && (fs(s, va(e, "endLabel"), {
          inheritColor: n,
          labelFetcher: e,
          labelDataIndex: f,
          defaultText: function(h, v, c) {
            return c != null ? wD(o, c) : Cm(o, h);
          },
          enableTextSetter: !0
        }, zD(a, i)), s.textConfig.position = null);
      } else this._endLabel && (this._polyline.removeTextContent(), this._endLabel = null);
    }, t.prototype._endLabelOnDuring = function(e, i, n, a, o, s, l) {
      var u = this._endLabel, f = this._polyline;
      if (u) {
        e < 1 && a.originalX == null && (a.originalX = u.x, a.originalY = u.y);
        var h = n.getLayout("points"), v = n.hostModel, c = v.get("connectNulls"), d = s.get("precision"), y = s.get("distance") || 0, g = l.getBaseAxis(), p = g.isHorizontal(), m = g.inverse, _ = i.shape, S = m ? p ? _.x : _.y + _.height : p ? _.x + _.width : _.y, b = (p ? y : 0) * (m ? -1 : 1), w = (p ? 0 : -y) * (m ? -1 : 1), x = p ? "x" : "y", T = FD(h, S, x), D = T.range, A = D[1] - D[0], M = void 0;
        if (A >= 1) {
          if (A > 1 && !c) {
            var L = Dd(h, D[0]);
            u.attr({
              x: L[0] + b,
              y: L[1] + w
            }), o && (M = v.getRawValue(D[0]));
          } else {
            var L = f.getPointOn(S, x);
            L && u.attr({
              x: L[0] + b,
              y: L[1] + w
            });
            var P = v.getRawValue(D[0]), I = v.getRawValue(D[1]);
            o && (M = L1(n, d, P, I, T.t));
          }
          a.lastFrameIndex = D[0];
        } else {
          var E = e === 1 || a.lastFrameIndex > 0 ? D[0] : 0, L = Dd(h, E);
          o && (M = v.getRawValue(E)), u.attr({
            x: L[0] + b,
            y: L[1] + w
          });
        }
        if (o) {
          var R = Fg(u);
          typeof R.setLabelText == "function" && R.setLabelText(M);
        }
      }
    }, t.prototype._doUpdateAnimation = function(e, i, n, a, o, s, l) {
      var u = this._polyline, f = this._polygon, h = e.hostModel, v = CD(this._data, e, this._stackedOnPoints, i, this._coordSys, n, this._valueOrigin), c = v.current, d = v.stackedOnCurrent, y = v.next, g = v.stackedOnNext;
      if (o && (d = Qe(v.stackedOnCurrent, v.current, n, o, l), c = Qe(v.current, null, n, o, l), g = Qe(v.stackedOnNext, v.next, n, o, l), y = Qe(v.next, null, n, o, l)), Td(c, y) > 3e3 || f && Td(d, g) > 3e3) {
        u.stopAnimation(), u.setShape({
          points: y
        }), f && (f.stopAnimation(), f.setShape({
          points: y,
          stackedOnPoints: g
        }));
        return;
      }
      u.shape.__points = v.current, u.shape.points = c;
      var p = {
        shape: {
          points: y
        }
      };
      v.current !== c && (p.shape.__points = v.next), u.stopAnimation(), He(u, p, h), f && (f.setShape({
        // Reuse the points with polyline.
        points: c,
        stackedOnPoints: d
      }), f.stopAnimation(), He(f, {
        shape: {
          stackedOnPoints: g
        }
      }, h), u.shape.points !== f.shape.points && (f.shape.points = u.shape.points));
      for (var m = [], _ = v.status, S = 0; S < _.length; S++) {
        var b = _[S].cmd;
        if (b === "=") {
          var w = e.getItemGraphicEl(_[S].idx1);
          w && m.push({
            el: w,
            ptIdx: S
            // Index of points
          });
        }
      }
      u.animators && u.animators.length && u.animators[0].during(function() {
        f && f.dirtyShape();
        for (var x = u.shape.__points, T = 0; T < m.length; T++) {
          var D = m[T].el, A = m[T].ptIdx * 2;
          D.x = x[A], D.y = x[A + 1], D.markRedraw();
        }
      });
    }, t.prototype.remove = function(e) {
      var i = this.group, n = this._data;
      this._lineGroup.removeAll(), this._symbolDraw.remove(!0), n && n.eachItemGraphicEl(function(a, o) {
        a.__temp && (i.remove(a), n.setItemGraphicEl(o, null));
      }), this._polyline = this._polygon = this._coordSys = this._points = this._stackedOnPoints = this._endLabel = this._data = null;
    }, t.type = "line", t;
  })(Me)
);
function $D(r, t) {
  return {
    seriesType: r,
    plan: Cy(),
    reset: function(e) {
      var i = e.getData(), n = e.coordinateSystem;
      if (e.pipelineContext, !!n) {
        var a = H(n.dimensions, function(h) {
          return i.mapDimension(h);
        }).slice(0, 2), o = a.length, s = i.getCalculationInfo("stackResultDimension");
        $i(i, a[0]) && (a[0] = s), $i(i, a[1]) && (a[1] = s);
        var l = i.getStore(), u = i.getDimensionIndex(a[0]), f = i.getDimensionIndex(a[1]);
        return o && {
          progress: function(h, v) {
            for (var c = h.end - h.start, d = Ci(c * o), y = [], g = [], p = h.start, m = 0; p < h.end; p++) {
              var _ = void 0;
              if (o === 1) {
                var S = l.get(u, p);
                _ = n.dataToPoint(S, null, g);
              } else
                y[0] = l.get(u, p), y[1] = l.get(f, p), _ = n.dataToPoint(y, null, g);
              d[m++] = _[0], d[m++] = _[1];
            }
            v.setLayout("points", d);
          }
        };
      }
    }
  };
}
var VD = {
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
}, GD = function(r) {
  return Math.round(r.length / 2);
};
function WD(r) {
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
          z(a) ? d = VD[a] : $(a) && (d = a), d && t.setData(n.downSample(n.mapDimension(u.dim), 1 / c, d, GD));
        }
      }
    }
  };
}
function UD(r) {
  r.registerChartView(HD), r.registerSeriesModel(SD), r.registerLayout($D("line")), r.registerVisual({
    seriesType: "line",
    reset: function(t) {
      var e = t.getData(), i = t.getModel("lineStyle").getLineStyle();
      i && !i.stroke && (i.stroke = e.getVisual("style").fill), e.setVisual("legendLineStyle", i);
    }
  }), r.registerProcessor(r.PRIORITY.PROCESSOR.STATISTIC, WD("line"));
}
var YD = (
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
  })(nt)
), qu = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      return r !== null && r.apply(this, arguments) || this;
    }
    return t.prototype.getCoordSysModel = function() {
      return this.getReferringComponents("grid", de).models[0];
    }, t.type = "cartesian2dAxis", t;
  })(nt)
);
ge(qu, oD);
var Em = {
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
}, XD = Q({
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
}, Em), ph = Q({
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
}, Em), ZD = Q({
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
}, ph), qD = at({
  logBase: 10
}, ph);
const KD = {
  category: XD,
  value: ph,
  time: ZD,
  log: qD
};
var QD = {
  value: 1,
  category: 1,
  time: 1,
  log: 1
};
function Md(r, t, e, i) {
  C(QD, function(n, a) {
    var o = Q(Q({}, KD[a], !0), i, !0), s = (
      /** @class */
      (function(l) {
        O(u, l);
        function u() {
          var f = l !== null && l.apply(this, arguments) || this;
          return f.type = t + "Axis." + a, f;
        }
        return u.prototype.mergeDefaultAndTheme = function(f, h) {
          var v = ea(this), c = v ? ms(f) : {}, d = h.getTheme();
          Q(f, d.get(a + "Axis")), Q(f, this.getDefaultOption()), f.type = Ad(f), v && zi(f, c, v);
        }, u.prototype.optionUpdated = function() {
          var f = this.option;
          f.type === "category" && (this.__ordinalMeta = Yu.createByAxisModel(this));
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
  }), r.registerSubTypeDefaulter(t + "Axis", Ad);
}
function Ad(r) {
  return r.type || (r.data ? "category" : "value");
}
var jD = (
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
      return t = t.toLowerCase(), _t(this.getAxes(), function(e) {
        return e.scale.type === t;
      });
    }, r.prototype.addAxis = function(t) {
      var e = t.dim;
      this._axes[e] = t, this._dimList.push(e);
    }, r;
  })()
), Ku = ["x", "y"];
function Ld(r) {
  return r.type === "interval" || r.type === "time";
}
var JD = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = "cartesian2d", e.dimensions = Ku, e;
    }
    return t.prototype.calcAffineTransform = function() {
      this._transform = this._invTransform = null;
      var e = this.getAxis("x").scale, i = this.getAxis("y").scale;
      if (!(!Ld(e) || !Ld(i))) {
        var n = e.getExtent(), a = i.getExtent(), o = this.dataToPoint([n[0], a[0]]), s = this.dataToPoint([n[1], a[1]]), l = n[1] - n[0], u = a[1] - a[0];
        if (!(!l || !u)) {
          var f = (s[0] - o[0]) / l, h = (s[1] - o[1]) / u, v = o[0] - n[0] * f, c = o[1] - a[0] * h, d = this._transform = [f, 0, 0, h, v, c];
          this._invTransform = bf([], d);
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
      var n = this.dataToPoint(e), a = this.dataToPoint(i), o = this.getArea(), s = new rt(n[0], n[1], a[0] - n[0], a[1] - n[1]);
      return o.intersect(s);
    }, t.prototype.dataToPoint = function(e, i, n) {
      n = n || [];
      var a = e[0], o = e[1];
      if (this._transform && a != null && isFinite(a) && o != null && isFinite(o))
        return ae(n, e, this._transform);
      var s = this.getAxis("x"), l = this.getAxis("y");
      return n[0] = s.toGlobalCoord(s.dataToCoord(a, i)), n[1] = l.toGlobalCoord(l.dataToCoord(o, i)), n;
    }, t.prototype.clampData = function(e, i) {
      var n = this.getAxis("x").scale, a = this.getAxis("y").scale, o = n.getExtent(), s = a.getExtent(), l = n.parse(e[0]), u = a.parse(e[1]);
      return i = i || [], i[0] = Math.min(Math.max(Math.min(o[0], o[1]), l), Math.max(o[0], o[1])), i[1] = Math.min(Math.max(Math.min(s[0], s[1]), u), Math.max(s[0], s[1])), i;
    }, t.prototype.pointToData = function(e, i) {
      var n = [];
      if (this._invTransform)
        return ae(n, e, this._invTransform);
      var a = this.getAxis("x"), o = this.getAxis("y");
      return n[0] = a.coordToData(a.toLocalCoord(e[0]), i), n[1] = o.coordToData(o.toLocalCoord(e[1]), i), n;
    }, t.prototype.getOtherAxis = function(e) {
      return this.getAxis(e.dim === "x" ? "y" : "x");
    }, t.prototype.getArea = function(e) {
      e = e || 0;
      var i = this.getAxis("x").getGlobalExtent(), n = this.getAxis("y").getGlobalExtent(), a = Math.min(i[0], i[1]) - e, o = Math.min(n[0], n[1]) - e, s = Math.max(i[0], i[1]) - a + e, l = Math.max(n[0], n[1]) - o + e;
      return new rt(a, o, s, l);
    }, t;
  })(jD)
), tM = (
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
  })(gD)
);
function Qu(r, t, e) {
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
  var g = {
    top: -1,
    bottom: 1,
    left: -1,
    right: 1
  };
  a.labelDirection = a.tickDirection = a.nameDirection = g[s], a.labelOffset = o ? d[v[s]] - d[v.onZero] : 0, t.get(["axisTick", "inside"]) && (a.tickDirection = -a.tickDirection), Bi(e.labelInside, t.get(["axisLabel", "inside"])) && (a.labelDirection = -a.labelDirection);
  var p = t.get(["axisLabel", "rotate"]);
  return a.labelRotate = l === "top" ? -p : p, a.z2 = 1, a;
}
function Pd(r) {
  return r.get("coordinateSystem") === "cartesian2d";
}
function Id(r) {
  var t = {
    xAxisModel: null,
    yAxisModel: null
  };
  return C(t, function(e, i) {
    var n = i.replace(/Model$/, ""), a = r.getReferringComponents(n, de).models[0];
    t[i] = a;
  }), t;
}
var Fl = Math.log;
function eM(r, t, e) {
  var i = Zi.prototype, n = i.getTicks.call(e), a = i.getTicks.call(e, !0), o = n.length - 1, s = i.getInterval.call(e), l = gm(r, t), u = l.extent, f = l.fixMin, h = l.fixMax;
  if (r.type === "log") {
    var v = Fl(r.base);
    u = [Fl(u[0]) / v, Fl(u[1]) / v];
  }
  r.setExtent(u[0], u[1]), r.calcNiceExtent({
    splitNumber: o,
    fixMin: f,
    fixMax: h
  });
  var c = i.getExtent.call(r);
  f && (u[0] = c[0]), h && (u[1] = c[1]);
  var d = i.getInterval.call(r), y = u[0], g = u[1];
  if (f && h)
    d = (g - y) / o;
  else if (f)
    for (g = u[0] + d * o; g < u[1] && isFinite(g) && isFinite(u[1]); )
      d = Ol(d), g = u[0] + d * o;
  else if (h)
    for (y = u[1] - d * o; y > u[0] && isFinite(y) && isFinite(u[0]); )
      d = Ol(d), y = u[1] - d * o;
  else {
    var p = r.getTicks().length - 1;
    p > o && (d = Ol(d));
    var m = d * o;
    g = Math.ceil(u[1] / d) * d, y = mt(g - m), y < 0 && u[0] >= 0 ? (y = 0, g = mt(m)) : g > 0 && u[1] <= 0 && (g = 0, y = -mt(m));
  }
  var _ = (n[0].value - a[0].value) / s, S = (n[o].value - a[o].value) / s;
  i.setExtent.call(r, y + d * _, g + d * S), i.setInterval.call(r, d), (_ || S) && i.setNiceExtent.call(r, y + d, g - d);
}
var rM = (
  /** @class */
  (function() {
    function r(t, e, i) {
      this.type = "grid", this._coordsMap = {}, this._coordsList = [], this._axesMap = {}, this._axesList = [], this.axisPointerEnabled = !0, this.dimensions = Ku, this._initCartesian(t, e, i), this.model = t;
    }
    return r.prototype.getRect = function() {
      return this._rect;
    }, r.prototype.update = function(t, e) {
      var i = this._axesMap;
      this._updateScale(t, this.model);
      function n(o) {
        var s, l = vt(o), u = l.length;
        if (u) {
          for (var f = [], h = u - 1; h >= 0; h--) {
            var v = +l[h], c = o[v], d = c.model, y = c.scale;
            // Only value and log axis without interval support alignTicks.
            Xu(y) && d.get("alignTicks") && d.get("interval") == null ? f.push(c) : (gd(y, d), Xu(y) && (s = c));
          }
          f.length && (s || (s = f.pop(), gd(s.scale, s.model)), C(f, function(g) {
            eM(g.scale, g.model, s.scale);
          }));
        }
      }
      n(i.x), n(i.y);
      var a = {};
      C(i.x, function(o) {
        Ed(i, "y", o, a);
      }), C(i.y, function(o) {
        Ed(i, "x", o, a);
      }), this.resize(this.model, e);
    }, r.prototype.resize = function(t, e, i) {
      var n = t.getBoxLayoutParams(), a = !i && t.get("containLabel"), o = No(n, {
        width: e.getWidth(),
        height: e.getHeight()
      });
      this._rect = o;
      var s = this._axesList;
      l(), a && (C(s, function(u) {
        if (!u.model.get(["axisLabel", "inside"])) {
          var f = iD(u);
          if (f) {
            var h = u.isHorizontal() ? "height" : "width", v = u.model.get(["axisLabel", "margin"]);
            o[h] -= f[h] + v, u.position === "top" ? o.y += f.height + v : u.position === "left" && (o.x += f.width + v);
          }
        }
      }), l()), C(this._coordsList, function(u) {
        u.calcAffineTransform();
      });
      function l() {
        C(s, function(u) {
          var f = u.isHorizontal(), h = f ? [0, o.width] : [0, o.height], v = u.inverse ? 1 : 0;
          u.setExtent(h[v], h[1 - v]), iM(u, f ? o.x : o.y);
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
      V(t) && (e = t.yAxisIndex, t = t.xAxisIndex);
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
      var e = t.seriesModel, i = t.xAxisModel || e && e.getReferringComponents("xAxis", de).models[0], n = t.yAxisModel || e && e.getReferringComponents("yAxis", de).models[0], a = t.gridModel, o = this._coordsList, s, l;
      if (e)
        s = e.coordinateSystem, et(o, s) < 0 && (s = null);
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
      this._axesMap = s, C(s.x, function(f, h) {
        C(s.y, function(v, c) {
          var d = "x" + h + "y" + c, y = new JD(d);
          y.master = n, y.model = t, n._coordsMap[d] = y, n._coordsList.push(y), y.addAxis(f), y.addAxis(v);
        });
      });
      function u(f) {
        return function(h, v) {
          if (zl(h, t)) {
            var c = h.get("position");
            f === "x" ? c !== "top" && c !== "bottom" && (c = o.bottom ? "top" : "bottom") : c !== "left" && c !== "right" && (c = o.left ? "right" : "left"), o[c] = !0;
            var d = new tM(f, eD(h), [0, 0], h.get("type"), c), y = d.type === "category";
            d.onBand = y && h.get("boundaryGap"), d.inverse = h.get("inverse"), h.axis = d, d.model = h, d.grid = a, d.index = v, a._axesList.push(d), s[f][v] = d, l[f]++;
          }
        };
      }
    }, r.prototype._updateScale = function(t, e) {
      C(this._axesList, function(n) {
        if (n.scale.setExtent(1 / 0, -1 / 0), n.type === "category") {
          var a = n.model.get("categorySortInfo");
          n.scale.setSortInfo(a);
        }
      }), t.eachSeries(function(n) {
        if (Pd(n)) {
          var a = Id(n), o = a.xAxisModel, s = a.yAxisModel;
          if (!zl(o, e) || !zl(s, e))
            return;
          var l = this.getCartesian(o.componentIndex, s.componentIndex), u = n.getData(), f = l.getAxis("x"), h = l.getAxis("y");
          i(u, f), i(u, h);
        }
      }, this);
      function i(n, a) {
        C(aD(n, a.dim), function(o) {
          a.scale.unionExtentFromData(n, o);
        });
      }
    }, r.prototype.getTooltipAxes = function(t) {
      var e = [], i = [];
      return C(this.getCartesians(), function(n) {
        var a = t != null && t !== "auto" ? n.getAxis(t) : n.getBaseAxis(), o = n.getOtherAxis(a);
        et(e, a) < 0 && e.push(a), et(i, o) < 0 && i.push(o);
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
        if (Pd(n)) {
          var a = Id(n), o = a.xAxisModel, s = a.yAxisModel, l = o.getCoordSysModel(), u = l.coordinateSystem;
          n.coordinateSystem = u.getCartesian(o.componentIndex, s.componentIndex);
        }
      }), i;
    }, r.dimensions = Ku, r;
  })()
);
function zl(r, t) {
  return r.getCoordSysModel() === t;
}
function Ed(r, t, e, i) {
  e.getAxesOnZeroOf = function() {
    return a ? [a] : [];
  };
  var n = r[t], a, o = e.model, s = o.get(["axisLine", "onZero"]), l = o.get(["axisLine", "onZeroAxisIndex"]);
  if (!s)
    return;
  if (l != null)
    Rd(n[l]) && (a = n[l]);
  else
    for (var u in n)
      if (n.hasOwnProperty(u) && Rd(n[u]) && !i[f(n[u])]) {
        a = n[u];
        break;
      }
  a && (i[f(a)] = !0);
  function f(h) {
    return h.dim + "_" + h.index;
  }
}
function Rd(r) {
  return r && r.type !== "category" && r.type !== "time" && rD(r);
}
function iM(r, t) {
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
var rr = Math.PI, sr = (
  /** @class */
  (function() {
    function r(t, e) {
      this.group = new bt(), this.opt = e, this.axisModel = t, at(e, {
        labelOffset: 0,
        nameDirection: 1,
        tickDirection: 1,
        labelDirection: 1,
        silent: !0,
        handleAutoShown: function() {
          return !0;
        }
      });
      var i = new bt({
        x: e.position[0],
        y: e.position[1],
        rotation: e.rotation
      });
      i.updateTransform(), this._transformGroup = i;
    }
    return r.prototype.hasBuilder = function(t) {
      return !!kd[t];
    }, r.prototype.add = function(t) {
      kd[t](this.opt, this.axisModel, this.group, this._transformGroup);
    }, r.prototype.getGroup = function() {
      return this.group;
    }, r.innerTextLayout = function(t, e, i) {
      var n = Jp(e - t), a, o;
      return Mo(n) ? (o = i > 0 ? "top" : "bottom", a = "center") : Mo(n - rr) ? (o = i > 0 ? "bottom" : "top", a = "center") : (o = "middle", n > 0 && n < rr ? a = i > 0 ? "right" : "left" : a = i > 0 ? "left" : "right"), {
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
), kd = {
  axisLine: function(r, t, e, i) {
    var n = t.get(["axisLine", "show"]);
    if (n === "auto" && r.handleAutoShown && (n = r.handleAutoShown("axisLine")), !!n) {
      var a = t.axis.getExtent(), o = i.transform, s = [a[0], 0], l = [a[1], 0], u = s[0] > l[0];
      o && (ae(s, s, o), ae(l, l, o));
      var f = k({
        lineCap: "round"
      }, t.getModel(["axisLine", "lineStyle"]).getLineStyle()), h = new ze({
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
      Jn(h.shape, h.style.lineWidth), h.anid = "line", e.add(h);
      var v = t.get(["axisLine", "symbol"]);
      if (v != null) {
        var c = t.get(["axisLine", "symbolSize"]);
        z(v) && (v = [v, v]), (z(c) || ut(c)) && (c = [c, c]);
        var d = ws(t.get(["axisLine", "symbolOffset"]) || 0, c), y = c[0], g = c[1];
        C([{
          rotate: r.rotation + Math.PI / 2,
          offset: d[0],
          r: 0
        }, {
          rotate: r.rotation - Math.PI / 2,
          offset: d[1],
          r: Math.sqrt((s[0] - l[0]) * (s[0] - l[0]) + (s[1] - l[1]) * (s[1] - l[1]))
        }], function(p, m) {
          if (v[m] !== "none" && v[m] != null) {
            var _ = Jr(v[m], -y / 2, -g / 2, y, g, f.stroke, !0), S = p.r + p.offset, b = u ? l : s;
            _.attr({
              rotation: p.rotate,
              x: b[0] + S * Math.cos(r.rotation),
              y: b[1] - S * Math.sin(r.rotation),
              silent: !0,
              z2: 11
            }), e.add(_);
          }
        });
      }
    }
  },
  axisTickLabel: function(r, t, e, i) {
    var n = oM(e, i, t, r), a = lM(e, i, t, r);
    if (aM(t, a, n), sM(e, i, t, r.tickDirection), t.get(["axisLabel", "hideOverlap"])) {
      var o = mD(H(a, function(s) {
        return {
          label: s,
          priority: s.z2,
          defaultAttr: {
            ignore: s.ignore
          }
        };
      }));
      _D(o);
    }
  },
  axisName: function(r, t, e, i) {
    var n = Bi(r.axisName, t.get("name"));
    if (n) {
      var a = t.get("nameLocation"), o = r.nameDirection, s = t.getModel("nameTextStyle"), l = t.get("nameGap") || 0, u = t.axis.getExtent(), f = u[0] > u[1] ? -1 : 1, h = [
        a === "start" ? u[0] - f * l : a === "end" ? u[1] + f * l : (u[0] + u[1]) / 2,
        // Reuse labelOffset.
        Nd(a) ? r.labelOffset + o * l : 0
      ], v, c = t.get("nameRotate");
      c != null && (c = c * rr / 180);
      var d;
      Nd(a) ? v = sr.innerTextLayout(
        r.rotation,
        c ?? r.rotation,
        // Adapt to axis.
        o
      ) : (v = nM(r.rotation, a, c || 0, u), d = r.axisNameAvailableWidth, d != null && (d = Math.abs(d / Math.sin(v.rotation)), !isFinite(d) && (d = null)));
      var y = s.getFont(), g = t.get("nameTruncate", !0) || {}, p = g.ellipsis, m = Bi(r.nameTruncateMaxWidth, g.maxWidth, d), _ = new Gt({
        x: h[0],
        y: h[1],
        rotation: v.rotation,
        silent: sr.isLabelSilent(t),
        style: Fi(s, {
          text: n,
          font: y,
          overflow: "truncate",
          width: m,
          ellipsis: p,
          fill: s.getTextColor() || t.get(["axisLine", "lineStyle", "color"]),
          align: s.get("align") || v.textAlign,
          verticalAlign: s.get("verticalAlign") || v.textVerticalAlign
        }),
        z2: 1
      });
      if (ss({
        el: _,
        componentModel: t,
        itemName: n
      }), _.__fullText = n, _.anid = "name", t.get("triggerEvent")) {
        var S = sr.makeAxisEventDataBase(t);
        S.targetType = "axisName", S.name = n, tt(_).eventData = S;
      }
      i.add(_), _.updateTransform(), e.add(_), _.decomposeTransform();
    }
  }
};
function nM(r, t, e, i) {
  var n = Jp(e - r), a, o, s = i[0] > i[1], l = t === "start" && !s || t !== "start" && s;
  return Mo(n - rr / 2) ? (o = l ? "bottom" : "top", a = "center") : Mo(n - rr * 1.5) ? (o = l ? "top" : "bottom", a = "center") : (o = "middle", n < rr * 1.5 && n > rr / 2 ? a = l ? "left" : "right" : a = l ? "right" : "left"), {
    rotation: n,
    textAlign: a,
    textVerticalAlign: o
  };
}
function aM(r, t, e) {
  if (!ym(r.axis)) {
    var i = r.get(["axisLabel", "showMinLabel"]), n = r.get(["axisLabel", "showMaxLabel"]);
    t = t || [], e = e || [];
    var a = t[0], o = t[1], s = t[t.length - 1], l = t[t.length - 2], u = e[0], f = e[1], h = e[e.length - 1], v = e[e.length - 2];
    i === !1 ? (Kt(a), Kt(u)) : Od(a, o) && (i ? (Kt(o), Kt(f)) : (Kt(a), Kt(u))), n === !1 ? (Kt(s), Kt(h)) : Od(l, s) && (n ? (Kt(l), Kt(v)) : (Kt(s), Kt(h)));
  }
}
function Kt(r) {
  r && (r.ignore = !0);
}
function Od(r, t) {
  var e = r && r.getBoundingRect().clone(), i = t && t.getBoundingRect().clone();
  if (!(!e || !i)) {
    var n = Sf([]);
    return wf(n, n, -r.rotation), e.applyTransform(Ai([], n, r.getLocalTransform())), i.applyTransform(Ai([], n, t.getLocalTransform())), e.intersect(i);
  }
}
function Nd(r) {
  return r === "middle" || r === "center";
}
function Rm(r, t, e, i, n) {
  for (var a = [], o = [], s = [], l = 0; l < r.length; l++) {
    var u = r[l].coord;
    o[0] = u, o[1] = 0, s[0] = u, s[1] = e, t && (ae(o, o, t), ae(s, s, t));
    var f = new ze({
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
    Jn(f.shape, f.style.lineWidth), f.anid = n + "_" + r[l].tickValue, a.push(f);
  }
  return a;
}
function oM(r, t, e, i) {
  var n = e.axis, a = e.getModel("axisTick"), o = a.get("show");
  if (o === "auto" && i.handleAutoShown && (o = i.handleAutoShown("axisTick")), !(!o || n.scale.isBlank())) {
    for (var s = a.getModel("lineStyle"), l = i.tickDirection * a.get("length"), u = n.getTicksCoords(), f = Rm(u, t.transform, l, at(s.getLineStyle(), {
      stroke: e.get(["axisLine", "lineStyle", "color"])
    }), "ticks"), h = 0; h < f.length; h++)
      r.add(f[h]);
    return f;
  }
}
function sM(r, t, e, i) {
  var n = e.axis, a = e.getModel("minorTick");
  if (!(!a.get("show") || n.scale.isBlank())) {
    var o = n.getMinorTicksCoords();
    if (o.length)
      for (var s = a.getModel("lineStyle"), l = i * a.get("length"), u = at(s.getLineStyle(), at(e.getModel("axisTick").getLineStyle(), {
        stroke: e.get(["axisLine", "lineStyle", "color"])
      })), f = 0; f < o.length; f++)
        for (var h = Rm(o[f], t.transform, l, u, "minorticks_" + f), v = 0; v < h.length; v++)
          r.add(h[v]);
  }
}
function lM(r, t, e, i) {
  var n = e.axis, a = Bi(i.axisLabelShow, e.get(["axisLabel", "show"]));
  if (!(!a || n.scale.isBlank())) {
    var o = e.getModel("axisLabel"), s = o.get("margin"), l = n.getViewLabels(), u = (Bi(i.labelRotate, o.get("rotate")) || 0) * rr / 180, f = sr.innerTextLayout(i.rotation, u, i.labelDirection), h = e.getCategories && e.getCategories(!0), v = [], c = sr.isLabelSilent(e), d = e.get("triggerEvent");
    return C(l, function(y, g) {
      var p = n.scale.type === "ordinal" ? n.scale.getRawOrdinalNumber(y.tickValue) : y.tickValue, m = y.formattedLabel, _ = y.rawLabel, S = o;
      if (h && h[p]) {
        var b = h[p];
        V(b) && b.textStyle && (S = new pt(b.textStyle, o, e.ecModel));
      }
      var w = S.getTextColor() || e.get(["axisLine", "lineStyle", "color"]), x = n.dataToCoord(p), T = S.getShallow("align", !0) || f.textAlign, D = X(S.getShallow("alignMinLabel", !0), T), A = X(S.getShallow("alignMaxLabel", !0), T), M = S.getShallow("verticalAlign", !0) || S.getShallow("baseline", !0) || f.textVerticalAlign, L = X(S.getShallow("verticalAlignMinLabel", !0), M), P = X(S.getShallow("verticalAlignMaxLabel", !0), M), I = new Gt({
        x,
        y: i.labelOffset + i.labelDirection * s,
        rotation: f.rotation,
        silent: c,
        z2: 10 + (y.level || 0),
        style: Fi(S, {
          text: m,
          align: g === 0 ? D : g === l.length - 1 ? A : T,
          verticalAlign: g === 0 ? L : g === l.length - 1 ? P : M,
          fill: $(w) ? w(
            // (1) In category axis with data zoom, tick is not the original
            // index of axis.data. So tick should not be exposed to user
            // in category axis.
            // (2) Compatible with previous version, which always use formatted label as
            // input. But in interval scale the formatted label is like '223,445', which
            // maked user replace ','. So we modify it to return original val but remain
            // it as 'string' to avoid error in replacing.
            n.type === "category" ? _ : n.type === "value" ? p + "" : p,
            g
          ) : w
        })
      });
      if (I.anid = "label_" + p, ss({
        el: I,
        componentModel: e,
        itemName: m,
        formatterParamsExtra: {
          isTruncated: function() {
            return I.isTruncated;
          },
          value: _,
          tickIndex: g
        }
      }), d) {
        var E = sr.makeAxisEventDataBase(e);
        E.targetType = "axisLabel", E.value = _, E.tickIndex = g, n.type === "category" && (E.dataIndex = p), tt(I).eventData = E;
      }
      t.add(I), I.updateTransform(), v.push(I), r.add(I), I.decomposeTransform();
    }), v;
  }
}
function uM(r, t) {
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
  return fM(e, r, t), e.seriesInvolved && cM(e, r), e;
}
function fM(r, t, e) {
  var i = t.getComponent("tooltip"), n = t.getComponent("axisPointer"), a = n.get("link", !0) || [], o = [];
  C(e.getCoordinateSystems(), function(s) {
    if (!s.axisPointerEnabled)
      return;
    var l = oa(s.model), u = r.coordSysAxesInfo[l] = {};
    r.coordSysMap[l] = s;
    var f = s.model, h = f.getModel("tooltip", i);
    if (C(s.getAxes(), lt(y, !1, null)), s.getTooltipAxes && i && h.get("show")) {
      var v = h.get("trigger") === "axis", c = h.get(["axisPointer", "type"]) === "cross", d = s.getTooltipAxes(h.get(["axisPointer", "axis"]));
      (v || c) && C(d.baseAxes, lt(y, c ? "cross" : !0, v)), c && C(d.otherAxes, lt(y, "cross", !1));
    }
    function y(g, p, m) {
      var _ = m.model.getModel("axisPointer", n), S = _.get("show");
      if (!(!S || S === "auto" && !g && !ju(_))) {
        p == null && (p = _.get("triggerTooltip")), _ = g ? hM(m, h, n, t, g, p) : _;
        var b = _.get("snap"), w = _.get("triggerEmphasis"), x = oa(m.model), T = p || b || m.type === "category", D = r.axesInfo[x] = {
          key: x,
          axis: m,
          coordSys: s,
          axisPointerModel: _,
          triggerTooltip: p,
          triggerEmphasis: w,
          involveSeries: T,
          snap: b,
          useHandle: ju(_),
          seriesModels: [],
          linkGroup: null
        };
        u[x] = D, r.seriesInvolved = r.seriesInvolved || T;
        var A = vM(a, m);
        if (A != null) {
          var M = o[A] || (o[A] = {
            axesInfo: {}
          });
          M.axesInfo[x] = D, M.mapper = a[A].mapper, D.linkGroup = M;
        }
      }
    }
  });
}
function hM(r, t, e, i, n, a) {
  var o = t.getModel("axisPointer"), s = ["type", "snap", "lineStyle", "shadowStyle", "label", "animation", "animationDurationUpdate", "animationEasingUpdate", "z"], l = {};
  C(s, function(v) {
    l[v] = q(o.get(v));
  }), l.snap = r.type !== "category" && !!a, o.get("type") === "cross" && (l.type = "line");
  var u = l.label || (l.label = {});
  if (u.show == null && (u.show = !1), n === "cross") {
    var f = o.get(["label", "show"]);
    if (u.show = f ?? !0, !a) {
      var h = l.lineStyle = o.get("crossStyle");
      h && at(u, h.textStyle);
    }
  }
  return r.model.getModel("axisPointer", new pt(l, e, i));
}
function cM(r, t) {
  t.eachSeries(function(e) {
    var i = e.coordinateSystem, n = e.get(["tooltip", "trigger"], !0), a = e.get(["tooltip", "show"], !0);
    !i || n === "none" || n === !1 || n === "item" || a === !1 || e.get(["axisPointer", "show"], !0) === !1 || C(r.coordSysAxesInfo[oa(i.model)], function(o) {
      var s = o.axis;
      i.getAxis(s.dim) === s && (o.seriesModels.push(e), o.seriesDataCount == null && (o.seriesDataCount = 0), o.seriesDataCount += e.getData().count());
    });
  });
}
function vM(r, t) {
  for (var e = t.model, i = t.dim, n = 0; n < r.length; n++) {
    var a = r[n] || {};
    if (Hl(a[i + "AxisId"], e.id) || Hl(a[i + "AxisIndex"], e.componentIndex) || Hl(a[i + "AxisName"], e.name))
      return n;
  }
}
function Hl(r, t) {
  return r === "all" || N(r) && et(r, t) >= 0 || r === t;
}
function dM(r) {
  var t = gh(r);
  if (t) {
    var e = t.axisPointerModel, i = t.axis.scale, n = e.option, a = e.get("status"), o = e.get("value");
    o != null && (o = i.parse(o));
    var s = ju(e);
    a == null && (n.status = s ? "show" : "hide");
    var l = i.getExtent().slice();
    l[0] > l[1] && l.reverse(), // Pick a value on axis when initializing.
    (o == null || o > l[1]) && (o = l[1]), o < l[0] && (o = l[0]), n.value = o, s && (n.status = t.axis.scale.isBlank() ? "hide" : "show");
  }
}
function gh(r) {
  var t = (r.ecModel.getComponent("axisPointer") || {}).coordSysAxesInfo;
  return t && t.axesInfo[oa(r)];
}
function pM(r) {
  var t = gh(r);
  return t && t.axisPointerModel;
}
function ju(r) {
  return !!r.get(["handle", "show"]);
}
function oa(r) {
  return r.type + "||" + r.id;
}
var Bd = {}, km = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = t.type, e;
    }
    return t.prototype.render = function(e, i, n, a) {
      this.axisPointerClass && dM(e), r.prototype.render.apply(this, arguments), this._doUpdateAxisPointerClass(e, n, !0);
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
        var o = pM(e);
        o ? (this._axisPointer || (this._axisPointer = new a())).render(e, o, i, n) : this._disposeAxisPointer(i);
      }
    }, t.prototype._disposeAxisPointer = function(e) {
      this._axisPointer && this._axisPointer.dispose(e), this._axisPointer = null;
    }, t.registerAxisPointerClass = function(e, i) {
      Bd[e] = i;
    }, t.getAxisPointerClass = function(e) {
      return e && Bd[e];
    }, t.type = "axis", t;
  })(pe)
), Ju = gt();
function gM(r, t, e, i) {
  var n = e.axis;
  if (!n.scale.isBlank()) {
    var a = e.getModel("splitArea"), o = a.getModel("areaStyle"), s = o.get("color"), l = i.coordinateSystem.getRect(), u = n.getTicksCoords({
      tickModel: a,
      clamp: !0
    });
    if (u.length) {
      var f = s.length, h = Ju(r).splitAreaColors, v = Z(), c = 0;
      if (h)
        for (var d = 0; d < u.length; d++) {
          var y = h.get(u[d].tickValue);
          if (y != null) {
            c = (y + (f - 1) * d) % f;
            break;
          }
        }
      var g = n.toGlobalCoord(u[0].coord), p = o.getAreaStyle();
      s = N(s) ? s : [s];
      for (var d = 1; d < u.length; d++) {
        var m = n.toGlobalCoord(u[d].coord), _ = void 0, S = void 0, b = void 0, w = void 0;
        n.isHorizontal() ? (_ = g, S = l.y, b = m - _, w = l.height, g = _ + b) : (_ = l.x, S = g, b = l.width, w = m - S, g = S + w);
        var x = u[d - 1].tickValue;
        x != null && v.set(x, c), t.add(new Dt({
          anid: x != null ? "area_" + x : null,
          shape: {
            x: _,
            y: S,
            width: b,
            height: w
          },
          style: at({
            fill: s[c]
          }, p),
          autoBatch: !0,
          silent: !0
        })), c = (c + 1) % f;
      }
      Ju(r).splitAreaColors = v;
    }
  }
}
function yM(r) {
  Ju(r).splitAreaColors = null;
}
var mM = ["axisLine", "axisTickLabel", "axisName"], _M = ["splitArea", "splitLine", "minorSplitLine"], Om = (
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
      if (this._axisGroup = new bt(), this.group.add(this._axisGroup), !!e.get("show")) {
        var s = e.getCoordSysModel(), l = Qu(s, e), u = new sr(e, k({
          handleAutoShown: function(h) {
            for (var v = s.coordinateSystem.getCartesians(), c = 0; c < v.length; c++)
              if (Xu(v[c].getOtherAxis(e.axis).scale))
                return !0;
            return !1;
          }
        }, l));
        C(mM, u.add, u), this._axisGroup.add(u.getGroup()), C(_M, function(h) {
          e.get([h, "show"]) && SM[h](this, this._axisGroup, e, s);
        }, this);
        var f = a && a.type === "changeAxisOrder" && a.isInitSort;
        f || Ng(o, this._axisGroup, e), r.prototype.render.call(this, e, i, n, a);
      }
    }, t.prototype.remove = function() {
      yM(this);
    }, t.type = "cartesianAxis", t;
  })(km)
), SM = {
  splitLine: function(r, t, e, i) {
    var n = e.axis;
    if (!n.scale.isBlank()) {
      var a = e.getModel("splitLine"), o = a.getModel("lineStyle"), s = o.get("color"), l = a.get("showMinLine") !== !1, u = a.get("showMaxLine") !== !1;
      s = N(s) ? s : [s];
      for (var f = i.coordinateSystem.getRect(), h = n.isHorizontal(), v = 0, c = n.getTicksCoords({
        tickModel: a
      }), d = [], y = [], g = o.getLineStyle(), p = 0; p < c.length; p++) {
        var m = n.toGlobalCoord(c[p].coord);
        if (!(p === 0 && !l || p === c.length - 1 && !u)) {
          var _ = c[p].tickValue;
          h ? (d[0] = m, d[1] = f.y, y[0] = m, y[1] = f.y + f.height) : (d[0] = f.x, d[1] = m, y[0] = f.x + f.width, y[1] = m);
          var S = v++ % s.length, b = new ze({
            anid: _ != null ? "line_" + _ : null,
            autoBatch: !0,
            shape: {
              x1: d[0],
              y1: d[1],
              x2: y[0],
              y2: y[1]
            },
            style: at({
              stroke: s[S]
            }, g),
            silent: !0
          });
          Jn(b.shape, g.lineWidth), t.add(b);
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
          var g = new ze({
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
          Jn(g.shape, v.lineWidth), t.add(g);
        }
  },
  splitArea: function(r, t, e, i) {
    gM(r, t, e, i);
  }
}, Nm = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = t.type, e;
    }
    return t.type = "xAxis", t;
  })(Om)
), wM = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = Nm.type, e;
    }
    return t.type = "yAxis", t;
  })(Om)
), bM = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = "grid", e;
    }
    return t.prototype.render = function(e, i) {
      this.group.removeAll(), e.get("show") && this.group.add(new Dt({
        shape: e.coordinateSystem.getRect(),
        style: at({
          fill: e.get("backgroundColor")
        }, e.getItemStyle()),
        silent: !0,
        z2: -1
      }));
    }, t.type = "grid", t;
  })(pe)
), Fd = {
  // gridIndex: 0,
  // gridId: '',
  offset: 0
};
function xM(r) {
  r.registerComponentView(bM), r.registerComponentModel(YD), r.registerCoordinateSystem("cartesian2d", rM), Md(r, "x", qu, Fd), Md(r, "y", qu, Fd), r.registerComponentView(Nm), r.registerComponentView(wM), r.registerPreprocessor(function(t) {
    t.xAxis && t.yAxis && !t.grid && (t.grid = {});
  });
}
var zd = ze.prototype, $l = as.prototype, Bm = (
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
})(Bm);
function Vl(r) {
  return isNaN(+r.cpx1) || isNaN(+r.cpy1);
}
var TM = (
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
      return new Bm();
    }, t.prototype.buildPath = function(e, i) {
      Vl(i) ? zd.buildPath.call(this, e, i) : $l.buildPath.call(this, e, i);
    }, t.prototype.pointAt = function(e) {
      return Vl(this.shape) ? zd.pointAt.call(this, e) : $l.pointAt.call(this, e);
    }, t.prototype.tangentAt = function(e) {
      var i = this.shape, n = Vl(i) ? [i.x2 - i.x1, i.y2 - i.y1] : $l.tangentAt.call(this, e);
      return mf(n, n);
    }, t;
  })(ot)
), Gl = ["fromSymbol", "toSymbol"];
function Hd(r) {
  return "_" + r + "Type";
}
function $d(r, t, e) {
  var i = t.getItemVisual(e, r);
  if (!i || i === "none")
    return i;
  var n = t.getItemVisual(e, r + "Size"), a = t.getItemVisual(e, r + "Rotate"), o = t.getItemVisual(e, r + "Offset"), s = t.getItemVisual(e, r + "KeepAspect"), l = nh(n), u = ws(o || 0, l);
  return i + l + u + (a || "") + (s || "");
}
function Vd(r, t, e) {
  var i = t.getItemVisual(e, r);
  if (!(!i || i === "none")) {
    var n = t.getItemVisual(e, r + "Size"), a = t.getItemVisual(e, r + "Rotate"), o = t.getItemVisual(e, r + "Offset"), s = t.getItemVisual(e, r + "KeepAspect"), l = nh(n), u = ws(o || 0, l), f = Jr(i, -l[0] / 2 + u[0], -l[1] / 2 + u[1], l[0], l[1], null, s);
    return f.__specifiedRotation = a == null || isNaN(a) ? void 0 : +a * Math.PI / 180 || 0, f.name = r, f;
  }
}
function CM(r) {
  var t = new TM({
    name: "line",
    subPixelOptimize: !0
  });
  return tf(t.shape, r), t;
}
function tf(r, t) {
  r.x1 = t[0][0], r.y1 = t[0][1], r.x2 = t[1][0], r.y2 = t[1][1], r.percent = 1;
  var e = t[2];
  e ? (r.cpx1 = e[0], r.cpy1 = e[1]) : (r.cpx1 = NaN, r.cpy1 = NaN);
}
var DM = (
  /** @class */
  (function(r) {
    O(t, r);
    function t(e, i, n) {
      var a = r.call(this) || this;
      return a._createLine(e, i, n), a;
    }
    return t.prototype._createLine = function(e, i, n) {
      var a = e.hostModel, o = e.getItemLayout(i), s = CM(o);
      s.shape.percent = 0, Ui(s, {
        shape: {
          percent: 1
        }
      }, a, i), this.add(s), C(Gl, function(l) {
        var u = Vd(l, e, i);
        this.add(u), this[Hd(l)] = $d(l, e, i);
      }, this), this._updateCommonStl(e, i, n);
    }, t.prototype.updateData = function(e, i, n) {
      var a = e.hostModel, o = this.childOfName("line"), s = e.getItemLayout(i), l = {
        shape: {}
      };
      tf(l.shape, s), He(o, l, a, i), C(Gl, function(u) {
        var f = $d(u, e, i), h = Hd(u);
        if (this[h] !== f) {
          this.remove(this.childOfName(u));
          var v = Vd(u, e, i);
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
        s = y.getModel("lineStyle").getLineStyle(), l = d.getModel(["blur", "lineStyle"]).getLineStyle(), u = d.getModel(["select", "lineStyle"]).getLineStyle(), h = y.get("disabled"), v = y.get("focus"), c = y.get("blurScope"), f = va(d);
      }
      var g = e.getItemVisual(i, "style"), p = g.stroke;
      o.useStyle(g), o.style.fill = null, o.style.strokeNoScale = !0, o.ensureState("emphasis").style = s, o.ensureState("blur").style = l, o.ensureState("select").style = u, C(Gl, function(w) {
        var x = this.childOfName(w);
        if (x) {
          x.setColor(p), x.style.opacity = g.opacity;
          for (var T = 0; T < oe.length; T++) {
            var D = oe[T], A = o.getState(D);
            if (A) {
              var M = A.style || {}, L = x.ensureState(D), P = L.style || (L.style = {});
              M.stroke != null && (P[x.__isEmptyBrush ? "stroke" : "fill"] = M.stroke), M.opacity != null && (P.opacity = M.opacity);
            }
          }
          x.markRedraw();
        }
      }, this);
      var m = a.getRawValue(i);
      fs(this, f, {
        labelDataIndex: i,
        labelFetcher: {
          getFormattedLabel: function(w, x) {
            return a.getFormattedLabel(w, x, e.dataType);
          }
        },
        inheritColor: p || "#000",
        defaultOpacity: g.opacity,
        defaultText: (m == null ? e.getName(i) : isFinite(m) ? mt(m) : m) + ""
      });
      var _ = this.getTextContent();
      if (_) {
        var S = f.normal;
        _.__align = _.style.align, _.__verticalAlign = _.style.verticalAlign, _.__position = S.get("position") || "middle";
        var b = S.get("distance");
        N(b) || (b = [b, b]), _.__labelDistance = b;
      }
      this.setTextConfig({
        position: null,
        local: !0,
        inside: !1
        // Can't be inside for stroke element.
      }), Po(this, v, c, h);
    }, t.prototype.highlight = function() {
      Qn(this);
    }, t.prototype.downplay = function() {
      jn(this);
    }, t.prototype.updateLayout = function(e, i) {
      this.setLinePoints(e.getItemLayout(i));
    }, t.prototype.setLinePoints = function(e) {
      var i = this.childOfName("line");
      tf(i.shape, e), i.dirty();
    }, t.prototype.beforeUpdate = function() {
      var e = this, i = e.childOfName("fromSymbol"), n = e.childOfName("toSymbol"), a = e.getTextContent();
      if (!i && !n && (!a || a.ignore))
        return;
      for (var o = 1, s = this.parent; s; )
        s.scaleX && (o /= s.scaleX), s = s.parent;
      var l = e.childOfName("line");
      if (!this.__dirty && !l.__dirty)
        return;
      var u = l.shape.percent, f = l.pointAt(0), h = l.pointAt(u), v = Ep([], h, f);
      mf(v, v);
      function c(A, M) {
        var L = A.__specifiedRotation;
        if (L == null) {
          var P = l.tangentAt(M);
          A.attr("rotation", (M === 1 ? -1 : 1) * Math.PI / 2 - Math.atan2(P[1], P[0]));
        } else
          A.attr("rotation", L);
      }
      if (i && (i.setPosition(f), c(i, 0), i.scaleX = i.scaleY = o * u, i.markRedraw()), n && (n.setPosition(h), c(n, 1), n.scaleX = n.scaleY = o * u, n.markRedraw()), a && !a.ignore) {
        a.x = a.y = 0, a.originX = a.originY = 0;
        var d = void 0, y = void 0, g = a.__labelDistance, p = g[0] * o, m = g[1] * o, _ = u / 2, S = l.tangentAt(_), b = [S[1], -S[0]], w = l.pointAt(_);
        b[1] > 0 && (b[0] = -b[0], b[1] = -b[1]);
        var x = S[0] < 0 ? -1 : 1;
        if (a.__position !== "start" && a.__position !== "end") {
          var T = -Math.atan2(S[1], S[0]);
          h[0] < f[0] && (T = Math.PI + T), a.rotation = T;
        }
        var D = void 0;
        switch (a.__position) {
          case "insideStartTop":
          case "insideMiddleTop":
          case "insideEndTop":
          case "middle":
            D = -m, y = "bottom";
            break;
          case "insideStartBottom":
          case "insideMiddleBottom":
          case "insideEndBottom":
            D = m, y = "top";
            break;
          default:
            D = 0, y = "middle";
        }
        switch (a.__position) {
          case "end":
            a.x = v[0] * p + h[0], a.y = v[1] * m + h[1], d = v[0] > 0.8 ? "left" : v[0] < -0.8 ? "right" : "center", y = v[1] > 0.8 ? "top" : v[1] < -0.8 ? "bottom" : "middle";
            break;
          case "start":
            a.x = -v[0] * p + f[0], a.y = -v[1] * m + f[1], d = v[0] > 0.8 ? "right" : v[0] < -0.8 ? "left" : "center", y = v[1] > 0.8 ? "bottom" : v[1] < -0.8 ? "top" : "middle";
            break;
          case "insideStartTop":
          case "insideStart":
          case "insideStartBottom":
            a.x = p * x + f[0], a.y = f[1] + D, d = S[0] < 0 ? "right" : "left", a.originX = -p * x, a.originY = -D;
            break;
          case "insideMiddleTop":
          case "insideMiddle":
          case "insideMiddleBottom":
          case "middle":
            a.x = w[0], a.y = w[1] + D, d = "center", a.originY = -D;
            break;
          case "insideEndTop":
          case "insideEnd":
          case "insideEndBottom":
            a.x = -p * x + h[0], a.y = h[1] + D, d = S[0] >= 0 ? "right" : "left", a.originX = p * x, a.originY = -D;
            break;
        }
        a.scaleX = a.scaleY = o, a.setStyle({
          // Use the user specified text align and baseline first
          verticalAlign: a.__verticalAlign || y,
          align: a.__align || d
        });
      }
    }, t;
  })(bt)
), MM = (
  /** @class */
  (function() {
    function r(t) {
      this.group = new bt(), this._LineCtor = t || DM;
    }
    return r.prototype.updateData = function(t) {
      var e = this;
      this._progressiveEls = null;
      var i = this, n = i.group, a = i._lineData;
      i._lineData = t, a || n.removeAll();
      var o = Gd(t);
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
      this._seriesScope = Gd(t), this._lineData = null, this.group.removeAll();
    }, r.prototype.incrementalUpdate = function(t, e) {
      this._progressiveEls = [];
      function i(s) {
        !s.isGroup && !AM(s) && (s.incremental = !0, s.ensureState("emphasis").hoverLayer = !0);
      }
      for (var n = t.start; n < t.end; n++) {
        var a = e.getItemLayout(n);
        if (Wl(a)) {
          var o = new this._LineCtor(e, n, this._seriesScope);
          o.traverse(i), this.group.add(o), e.setItemGraphicEl(n, o), this._progressiveEls.push(o);
        }
      }
    }, r.prototype.remove = function() {
      this.group.removeAll();
    }, r.prototype.eachRendered = function(t) {
      ls(this._progressiveEls || this.group, t);
    }, r.prototype._doAdd = function(t, e, i) {
      var n = t.getItemLayout(e);
      if (Wl(n)) {
        var a = new this._LineCtor(t, e, i);
        t.setItemGraphicEl(e, a), this.group.add(a);
      }
    }, r.prototype._doUpdate = function(t, e, i, n, a) {
      var o = t.getItemGraphicEl(i);
      if (!Wl(e.getItemLayout(n))) {
        this.group.remove(o);
        return;
      }
      o ? o.updateData(e, n, a) : o = new this._LineCtor(e, n, a), e.setItemGraphicEl(n, o), this.group.add(o);
    }, r;
  })()
);
function AM(r) {
  return r.animators && r.animators.length > 0;
}
function Gd(r) {
  var t = r.hostModel, e = t.getModel("emphasis");
  return {
    lineStyle: t.getModel("lineStyle").getLineStyle(),
    emphasisLineStyle: e.getModel(["lineStyle"]).getLineStyle(),
    blurLineStyle: t.getModel(["blur", "lineStyle"]).getLineStyle(),
    selectLineStyle: t.getModel(["select", "lineStyle"]).getLineStyle(),
    emphasisDisabled: e.get("disabled"),
    blurScope: e.get("blurScope"),
    focus: e.get("focus"),
    labelStatesModels: va(t)
  };
}
function Wd(r) {
  return isNaN(r[0]) || isNaN(r[1]);
}
function Wl(r) {
  return r && !Wd(r[0]) && !Wd(r[1]);
}
var Nr = gt(), Ud = q, Ul = ct, LM = (
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
          s = this._group = new bt(), this.createPointerEl(s, u, t, e), this.createLabelEl(s, u, t, e), i.getZr().add(s);
        else {
          var v = lt(Yd, e, h);
          this.updatePointerEl(s, u, v), this.updateLabelEl(s, u, v, e);
        }
        Zd(s, e, !0), this._renderHandle(a);
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
          var l = gh(t).seriesDataCount, u = n.getExtent();
          return Math.abs(u[0] - u[1]) / l > s;
        }
        return !1;
      }
      return i === !0;
    }, r.prototype.makeElOption = function(t, e, i, n, a) {
    }, r.prototype.createPointerEl = function(t, e, i, n) {
      var a = e.pointer;
      if (a) {
        var o = Nr(t).pointerEl = new Hw[a.type](Ud(e.pointer));
        t.add(o);
      }
    }, r.prototype.createLabelEl = function(t, e, i, n) {
      if (e.label) {
        var a = Nr(t).labelEl = new Gt(Ud(e.label));
        t.add(a), Xd(a, n);
      }
    }, r.prototype.updatePointerEl = function(t, e, i) {
      var n = Nr(t).pointerEl;
      n && e.pointer && (n.setStyle(e.pointer.style), i(n, {
        shape: e.pointer.shape
      }));
    }, r.prototype.updateLabelEl = function(t, e, i, n) {
      var a = Nr(t).labelEl;
      a && (a.setStyle(e.label.style), i(a, {
        // Consider text length change in vertical axis, animation should
        // be used on shape, otherwise the effect will be weird.
        // TODOTODO
        // shape: elOption.label.shape,
        x: e.label.x,
        y: e.label.y
      }), Xd(a, n));
    }, r.prototype._renderHandle = function(t) {
      if (!(this._dragging || !this.updateHandleTransform)) {
        var e = this._axisPointerModel, i = this._api.getZr(), n = this._handle, a = e.getModel("handle"), o = e.get("status");
        if (!a.get("show") || !o || o === "hide") {
          n && i.remove(n), this._handle = null;
          return;
        }
        var s;
        this._handle || (s = !0, n = this._handle = Gf(a.get("icon"), {
          cursor: "move",
          draggable: !0,
          onmousemove: function(u) {
            kp(u.event);
          },
          onmousedown: Ul(this._onHandleDragMove, this, 0, 0),
          drift: Ul(this._onHandleDragMove, this),
          ondragend: Ul(this._onHandleDragEnd, this)
        }), i.add(n)), Zd(n, e, !1), n.setStyle(a.getItemStyle(null, ["color", "borderColor", "borderWidth", "opacity", "shadowColor", "shadowBlur", "shadowOffsetX", "shadowOffsetY"]));
        var l = a.get("size");
        N(l) || (l = [l, l]), n.scaleX = l[0] / 2, n.scaleY = l[1] / 2, Ay(this, "_doDispatchAxisPointer", a.get("throttle") || 0, "fixRate"), this._moveHandleToValue(t, s);
      }
    }, r.prototype._moveHandleToValue = function(t, e) {
      Yd(this._axisPointerModel, !e && this._moveAnimation, this._handle, Yl(this.getHandleTransform(t, this._axisModel, this._axisPointerModel)));
    }, r.prototype._onHandleDragMove = function(t, e) {
      var i = this._handle;
      if (i) {
        this._dragging = !0;
        var n = this.updateHandleTransform(Yl(i), [t, e], this._axisModel, this._axisPointerModel);
        this._payloadInfo = n, i.stopAnimation(), i.attr(Yl(n)), Nr(i).lastProp = null, this._doDispatchAxisPointer();
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
      e && i && (this._lastGraphicKey = null, i && e.remove(i), n && e.remove(n), this._group = null, this._handle = null, this._payloadInfo = null), Bu(this, "_doDispatchAxisPointer");
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
function Yd(r, t, e, i) {
  Fm(Nr(e).lastProp, i) || (Nr(e).lastProp = i, t ? He(e, i, r) : (e.stopAnimation(), e.attr(i)));
}
function Fm(r, t) {
  if (V(r) && V(t)) {
    var e = !0;
    return C(t, function(i, n) {
      e = e && Fm(r[n], i);
    }), !!e;
  } else
    return r === t;
}
function Xd(r, t) {
  r[t.get(["label", "show"]) ? "show" : "hide"]();
}
function Yl(r) {
  return {
    x: r.x || 0,
    y: r.y || 0,
    rotation: r.rotation || 0
  };
}
function Zd(r, t, e) {
  var i = t.get("z"), n = t.get("zlevel");
  r && r.traverse(function(a) {
    a.type !== "group" && (i != null && (a.z = i), n != null && (a.zlevel = n), a.silent = e);
  });
}
function PM(r) {
  var t = r.get("type"), e = r.getModel(t + "Style"), i;
  return t === "line" ? (i = e.getLineStyle(), i.fill = null) : t === "shadow" && (i = e.getAreaStyle(), i.stroke = null), i;
}
function IM(r, t, e, i, n) {
  var a = e.get("value"), o = zm(a, t.axis, t.ecModel, e.get("seriesDataIndices"), {
    precision: e.get(["label", "precision"]),
    formatter: e.get(["label", "formatter"])
  }), s = e.getModel("label"), l = ys(s.get("padding") || 0), u = s.getFont(), f = Cf(o, u), h = n.position, v = f.width + l[1] + l[3], c = f.height + l[0] + l[2], d = n.align;
  d === "right" && (h[0] -= v), d === "center" && (h[0] -= v / 2);
  var y = n.verticalAlign;
  y === "bottom" && (h[1] -= c), y === "middle" && (h[1] -= c / 2), EM(h, v, c, i);
  var g = s.get("backgroundColor");
  (!g || g === "auto") && (g = t.get(["axisLine", "lineStyle", "color"])), r.label = {
    // shape: {x: 0, y: 0, width: width, height: height, r: labelModel.get('borderRadius')},
    x: h[0],
    y: h[1],
    style: Fi(s, {
      text: o,
      font: u,
      fill: s.getTextColor(),
      padding: l,
      backgroundColor: g
    }),
    // Label should be over axisPointer.
    z2: 10
  };
}
function EM(r, t, e, i) {
  var n = i.getWidth(), a = i.getHeight();
  r[0] = Math.min(r[0] + t, n) - t, r[1] = Math.min(r[1] + e, a) - e, r[0] = Math.max(r[0], 0), r[1] = Math.max(r[1], 0);
}
function zm(r, t, e, i, n) {
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
      value: ch(t, {
        value: r
      }),
      axisDimension: t.dim,
      axisIndex: t.index,
      seriesData: []
    };
    C(i, function(l) {
      var u = e.getSeriesByIndex(l.seriesIndex), f = l.dataIndexInside, h = u && u.getDataParams(f);
      h && s.seriesData.push(h);
    }), z(o) ? a = o.replace("{value}", a) : $(o) && (a = o(s));
  }
  return a;
}
function Hm(r, t, e) {
  var i = Mi();
  return wf(i, i, e.rotation), uu(i, i, e.position), Vf([r.dataToCoord(t), (e.labelOffset || 0) + (e.labelDirection || 1) * (e.labelMargin || 0)], i);
}
function RM(r, t, e, i, n, a) {
  var o = sr.innerTextLayout(e.rotation, 0, e.labelDirection);
  e.labelMargin = n.get(["label", "margin"]), IM(t, i, n, a, {
    position: Hm(i.axis, r, e),
    align: o.textAlign,
    verticalAlign: o.textVerticalAlign
  });
}
function kM(r, t, e) {
  return e = e || 0, {
    x1: r[e],
    y1: r[1 - e],
    x2: t[e],
    y2: t[1 - e]
  };
}
function OM(r, t, e) {
  return e = e || 0, {
    x: r[e],
    y: r[1 - e],
    width: t[e],
    height: t[1 - e]
  };
}
var NM = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      return r !== null && r.apply(this, arguments) || this;
    }
    return t.prototype.makeElOption = function(e, i, n, a, o) {
      var s = n.axis, l = s.grid, u = a.get("type"), f = qd(l, s).getOtherAxis(s).getGlobalExtent(), h = s.toGlobalCoord(s.dataToCoord(i, !0));
      if (u && u !== "none") {
        var v = PM(a), c = BM[u](s, h, f);
        c.style = v, e.graphicKey = c.type, e.pointer = c;
      }
      var d = Qu(l.model, n);
      RM(
        // @ts-ignore
        i,
        e,
        d,
        n,
        a,
        o
      );
    }, t.prototype.getHandleTransform = function(e, i, n) {
      var a = Qu(i.axis.grid.model, i, {
        labelInside: !1
      });
      a.labelMargin = n.get(["handle", "margin"]);
      var o = Hm(i.axis, e, a);
      return {
        x: o[0],
        y: o[1],
        rotation: a.rotation + (a.labelDirection < 0 ? Math.PI : 0)
      };
    }, t.prototype.updateHandleTransform = function(e, i, n, a) {
      var o = n.axis, s = o.grid, l = o.getGlobalExtent(!0), u = qd(s, o).getOtherAxis(o).getGlobalExtent(), f = o.dim === "x" ? 0 : 1, h = [e.x, e.y];
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
  })(LM)
);
function qd(r, t) {
  var e = {};
  return e[t.dim + "AxisIndex"] = t.index, r.getCartesian(e);
}
var BM = {
  line: function(r, t, e) {
    var i = kM([t, e[0]], [t, e[1]], Kd(r));
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
      shape: OM([t - i / 2, e[0]], [i, n], Kd(r))
    };
  }
};
function Kd(r) {
  return r.dim === "x" ? 0 : 1;
}
var FM = (
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
  })(nt)
), ke = gt(), zM = C;
function $m(r, t, e) {
  if (!U.node) {
    var i = t.getZr();
    ke(i).records || (ke(i).records = {}), HM(i, t);
    var n = ke(i).records[r] || (ke(i).records[r] = {});
    n.handler = e;
  }
}
function HM(r, t) {
  if (ke(r).initialized)
    return;
  ke(r).initialized = !0, e("click", lt(Qd, "click")), e("mousemove", lt(Qd, "mousemove")), e("globalout", VM);
  function e(i, n) {
    r.on(i, function(a) {
      var o = GM(t);
      zM(ke(r).records, function(s) {
        s && n(s, a, o.dispatchAction);
      }), $M(o.pendings, t);
    });
  }
}
function $M(r, t) {
  var e = r.showTip.length, i = r.hideTip.length, n;
  e ? n = r.showTip[e - 1] : i && (n = r.hideTip[i - 1]), n && (n.dispatchAction = null, t.dispatchAction(n));
}
function VM(r, t, e) {
  r.handler("leave", null, e);
}
function Qd(r, t, e, i) {
  t.handler(r, e, i);
}
function GM(r) {
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
function ef(r, t) {
  if (!U.node) {
    var e = t.getZr(), i = (ke(e).records || {})[r];
    i && (ke(e).records[r] = null);
  }
}
var WM = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = t.type, e;
    }
    return t.prototype.render = function(e, i, n) {
      var a = i.getComponent("tooltip"), o = e.get("triggerOn") || a && a.get("triggerOn") || "mousemove|click";
      $m("axisPointer", n, function(s, l, u) {
        o !== "none" && (s === "leave" || o.indexOf(s) >= 0) && u({
          type: "updateAxisPointer",
          currTrigger: s,
          x: l && l.offsetX,
          y: l && l.offsetY
        });
      });
    }, t.prototype.remove = function(e, i) {
      ef("axisPointer", i);
    }, t.prototype.dispose = function(e, i) {
      ef("axisPointer", i);
    }, t.type = "axisPointer", t;
  })(pe)
);
function Vm(r, t) {
  var e = [], i = r.seriesIndex, n;
  if (i == null || !(n = t.getSeriesByIndex(i)))
    return {
      point: []
    };
  var a = n.getData(), o = qr(a, r);
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
      e = l.dataToPoint(a.getValues(H(l.dimensions, function(p) {
        return a.mapDimension(p);
      }), o)) || [];
  else if (s) {
    var g = s.getBoundingRect().clone();
    g.applyTransform(s.transform), e = [g.x + g.width / 2, g.y + g.height / 2];
  }
  return {
    point: e,
    el: s
  };
}
var jd = gt();
function UM(r, t, e) {
  var i = r.currTrigger, n = [r.x, r.y], a = r, o = r.dispatchAction || ct(e.dispatchAction, e), s = t.getComponent("axisPointer").coordSysAxesInfo;
  if (s) {
    yo(n) && (n = Vm({
      seriesIndex: a.seriesIndex,
      // Do not use dataIndexInside from other ec instance.
      // FIXME: auto detect it?
      dataIndex: a.dataIndex
    }, t).point);
    var l = yo(n), u = a.axesInfo, f = s.axesInfo, h = i === "leave" || yo(n), v = {}, c = {}, d = {
      list: [],
      map: {}
    }, y = {
      showPointer: lt(XM, c),
      showTooltip: lt(ZM, d)
    };
    C(s.coordSysMap, function(p, m) {
      var _ = l || p.containPoint(n);
      C(s.coordSysAxesInfo[m], function(S, b) {
        var w = S.axis, x = jM(u, S);
        if (!h && _ && (!u || x)) {
          var T = x && x.value;
          T == null && !l && (T = w.pointToData(n)), T != null && Jd(S, T, y, !1, v);
        }
      });
    });
    var g = {};
    return C(f, function(p, m) {
      var _ = p.linkGroup;
      _ && !c[m] && C(_.axesInfo, function(S, b) {
        var w = c[b];
        if (S !== p && w) {
          var x = w.value;
          _.mapper && (x = p.axis.scale.parse(_.mapper(x, tp(S), tp(p)))), g[p.key] = x;
        }
      });
    }), C(g, function(p, m) {
      Jd(f[m], p, y, !0, v);
    }), qM(c, f, v), KM(d, n, r, o), QM(f, o, e), v;
  }
}
function Jd(r, t, e, i, n) {
  var a = r.axis;
  if (!(a.scale.isBlank() || !a.containData(t))) {
    if (!r.involveSeries) {
      e.showPointer(r, t);
      return;
    }
    var o = YM(t, r), s = o.payloadBatch, l = o.snapToValue;
    s[0] && n.seriesIndex == null && k(n, s[0]), !i && r.snap && a.containData(l) && l != null && (t = l), e.showPointer(r, t, s), e.showTooltip(r, o, l);
  }
}
function YM(r, t) {
  var e = t.axis, i = e.dim, n = r, a = [], o = Number.MAX_VALUE, s = -1;
  return C(t.seriesModels, function(l, u) {
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
      y <= o && ((y < o || d >= 0 && s < 0) && (o = y, s = d, n = h, a.length = 0), C(v, function(g) {
        a.push({
          seriesIndex: l.seriesIndex,
          dataIndexInside: g,
          dataIndex: l.getData().getRawIndex(g)
        });
      }));
    }
  }), {
    payloadBatch: a,
    snapToValue: n
  };
}
function XM(r, t, e, i) {
  r[t.key] = {
    value: e,
    payloadBatch: i
  };
}
function ZM(r, t, e, i) {
  var n = e.payloadBatch, a = t.axis, o = a.model, s = t.axisPointerModel;
  if (!(!t.triggerTooltip || !n.length)) {
    var l = t.coordSys.model, u = oa(l), f = r.map[u];
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
function qM(r, t, e) {
  var i = e.axesInfo = [];
  C(t, function(n, a) {
    var o = n.axisPointerModel.option, s = r[a];
    s ? (!n.useHandle && (o.status = "show"), o.value = s.value, o.seriesDataIndices = (s.payloadBatch || []).slice()) : !n.useHandle && (o.status = "hide"), o.status === "show" && i.push({
      axisDim: n.axis.dim,
      axisIndex: n.axis.model.componentIndex,
      value: o.value
    });
  });
}
function KM(r, t, e, i) {
  if (yo(t) || !r.list.length) {
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
function QM(r, t, e) {
  var i = e.getZr(), n = "axisPointerLastHighlights", a = jd(i)[n] || {}, o = jd(i)[n] = {};
  C(r, function(u, f) {
    var h = u.axisPointerModel.option;
    h.status === "show" && u.triggerEmphasis && C(h.seriesDataIndices, function(v) {
      var c = v.seriesIndex + " | " + v.dataIndex;
      o[c] = v;
    });
  });
  var s = [], l = [];
  C(a, function(u, f) {
    !o[f] && l.push(u);
  }), C(o, function(u, f) {
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
function jM(r, t) {
  for (var e = 0; e < (r || []).length; e++) {
    var i = r[e];
    if (t.axis.dim === i.axisDim && t.axis.model.componentIndex === i.axisIndex)
      return i;
  }
}
function tp(r) {
  var t = r.axis.model, e = {}, i = e.axisDim = r.axis.dim;
  return e.axisIndex = e[i + "AxisIndex"] = t.componentIndex, e.axisName = e[i + "AxisName"] = t.name, e.axisId = e[i + "AxisId"] = t.id, e;
}
function yo(r) {
  return !r || r[0] == null || isNaN(r[0]) || r[1] == null || isNaN(r[1]);
}
function Gm(r) {
  km.registerAxisPointerClass("CartesianAxisPointer", NM), r.registerComponentModel(FM), r.registerComponentView(WM), r.registerPreprocessor(function(t) {
    if (t) {
      (!t.axisPointer || t.axisPointer.length === 0) && (t.axisPointer = {});
      var e = t.axisPointer.link;
      e && !N(e) && (t.axisPointer.link = [e]);
    }
  }), r.registerProcessor(r.PRIORITY.PROCESSOR.STATISTIC, function(t, e) {
    t.getComponent("axisPointer").coordSysAxesInfo = uM(t, e);
  }), r.registerAction({
    type: "updateAxisPointer",
    event: "updateAxisPointer",
    update: ":updateAxisPointer"
  }, UM);
}
function JM(r) {
  ur(xM), ur(Gm);
}
function tA(r, t) {
  var e = ys(t.get("padding")), i = t.getItemStyle(["color", "opacity"]);
  return i.fill = t.get("backgroundColor"), r = new Dt({
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
var eA = (
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
  })(nt)
);
function Wm(r) {
  var t = r.get("confine");
  return t != null ? !!t : r.get("renderMode") === "richText";
}
function Um(r) {
  if (U.domSupported) {
    for (var t = document.documentElement.style, e = 0, i = r.length; e < i; e++)
      if (r[e] in t)
        return r[e];
  }
}
var Ym = Um(["transform", "webkitTransform", "OTransform", "MozTransform", "msTransform"]), rA = Um(["webkitTransition", "transition", "OTransition", "MozTransition", "msTransition"]);
function Xm(r, t) {
  if (!r)
    return t;
  t = jg(t, !0);
  var e = r.indexOf(t);
  return r = e === -1 ? t : "-" + r.slice(0, e) + "-" + t, r.toLowerCase();
}
function iA(r, t) {
  var e = r.currentStyle || document.defaultView && document.defaultView.getComputedStyle(r);
  return e ? e[t] : null;
}
var nA = Xm(rA, "transition"), yh = Xm(Ym, "transform"), aA = "position:absolute;display:block;border-style:solid;white-space:nowrap;z-index:9999999;" + (U.transform3dSupported ? "will-change:transform;" : "");
function oA(r) {
  return r = r === "left" ? "right" : r === "right" ? "left" : r === "top" ? "bottom" : "top", r;
}
function sA(r, t, e) {
  if (!z(e) || e === "inside")
    return "";
  var i = r.get("backgroundColor"), n = r.get("borderWidth");
  t = Qr(t);
  var a = oA(e), o = Math.max(Math.round(n) * 1.5, 6), s = "", l = yh + ":", u;
  et(["left", "right"], a) > -1 ? (s += "top:50%", l += "translateY(-50%) rotate(" + (u = a === "left" ? -225 : -45) + "deg)") : (s += "left:50%", l += "translateX(-50%) rotate(" + (u = a === "top" ? 225 : 45) + "deg)");
  var f = u * Math.PI / 180, h = o + n, v = h * Math.abs(Math.cos(f)) + h * Math.abs(Math.sin(f)), c = Math.round(((v - Math.SQRT2 * n) / 2 + Math.SQRT2 * n - (v - h) / 2) * 100) / 100;
  s += ";" + a + ":-" + c + "px";
  var d = t + " solid " + n + "px;", y = ["position:absolute;width:" + o + "px;height:" + o + "px;z-index:-1;", s + ";" + l + ";", "border-bottom:" + d, "border-right:" + d, "background-color:" + i + ";"];
  return '<div style="' + y.join("") + '"></div>';
}
function lA(r, t) {
  var e = "cubic-bezier(0.23,1,0.32,1)", i = " " + r / 2 + "s " + e, n = "opacity" + i + ",visibility" + i;
  return t || (i = " " + r + "s " + e, n += U.transformSupported ? "," + yh + i : ",left" + i + ",top" + i), nA + ":" + n;
}
function ep(r, t, e) {
  var i = r.toFixed(0) + "px", n = t.toFixed(0) + "px";
  if (!U.transformSupported)
    return e ? "top:" + n + ";left:" + i + ";" : [["top", n], ["left", i]];
  var a = U.transform3dSupported, o = "translate" + (a ? "3d" : "") + "(" + i + "," + n + (a ? ",0" : "") + ")";
  return e ? "top:0;left:0;" + yh + ":" + o + ";" : [["top", 0], ["left", 0], [Ym, o]];
}
function uA(r) {
  var t = [], e = r.get("fontSize"), i = r.getTextColor();
  i && t.push("color:" + i), t.push("font:" + r.getFont());
  var n = X(r.get("lineHeight"), Math.round(e * 3 / 2));
  e && t.push("line-height:" + n + "px");
  var a = r.get("textShadowColor"), o = r.get("textShadowBlur") || 0, s = r.get("textShadowOffsetX") || 0, l = r.get("textShadowOffsetY") || 0;
  return a && o && t.push("text-shadow:" + s + "px " + l + "px " + o + "px " + a), C(["decoration", "align"], function(u) {
    var f = r.get(u);
    f && t.push("text-" + u + ":" + f);
  }), t.join(";");
}
function fA(r, t, e) {
  var i = [], n = r.get("transitionDuration"), a = r.get("backgroundColor"), o = r.get("shadowBlur"), s = r.get("shadowColor"), l = r.get("shadowOffsetX"), u = r.get("shadowOffsetY"), f = r.getModel("textStyle"), h = Ty(r, "html"), v = l + "px " + u + "px " + o + "px " + s;
  return i.push("box-shadow:" + v), t && n && i.push(lA(n, e)), a && i.push("background-color:" + a), C(["width", "color", "radius"], function(c) {
    var d = "border-" + c, y = jg(d), g = r.get(y);
    g != null && i.push(d + ":" + g + (c === "color" ? "" : "px"));
  }), i.push(uA(f)), h != null && i.push("padding:" + ys(h).join("px ") + "px"), i.join(";") + ";";
}
function rp(r, t, e, i, n) {
  var a = t && t.painter;
  if (e) {
    var o = a && a.getViewportRoot();
    o && i0(r, o, e, i, n);
  } else {
    r[0] = i, r[1] = n;
    var s = a && a.getViewportRootOffset();
    s && (r[0] += s.offsetLeft, r[1] += s.offsetTop);
  }
  r[2] = r[0] / t.getWidth(), r[3] = r[1] / t.getHeight();
}
var hA = (
  /** @class */
  (function() {
    function r(t, e) {
      if (this._show = !1, this._styleCoord = [0, 0, 0, 0], this._enterable = !0, this._alwaysShowContent = !1, this._firstShow = !0, this._longHide = !0, U.wxa)
        return null;
      var i = document.createElement("div");
      i.domBelongToZr = !0, this.el = i;
      var n = this._zr = t.getZr(), a = e.appendTo, o = a && (z(a) ? document.querySelector(a) : Xn(a) ? a : $(a) && a(t.getDom()));
      rp(this._styleCoord, n, o, t.getWidth() / 2, t.getHeight() / 2), (o || t.getDom()).appendChild(i), this._api = t, this._container = o;
      var s = this;
      i.onmouseenter = function() {
        s._enterable && (clearTimeout(s._hideTimeout), s._show = !0), s._inContent = !0;
      }, i.onmousemove = function(l) {
        if (l = l || window.event, !s._enterable) {
          var u = n.handler, f = n.painter.getViewportRoot();
          jt(f, l, !0), u.dispatch("mousemove", l);
        }
      }, i.onmouseleave = function() {
        s._inContent = !1, s._enterable && s._show && s.hideLater(s._hideDelay);
      };
    }
    return r.prototype.update = function(t) {
      if (!this._container) {
        var e = this._api.getDom(), i = iA(e, "position"), n = e.style;
        n.position !== "absolute" && i !== "absolute" && (n.position = "relative");
      }
      var a = t.get("alwaysShowContent");
      a && this._moveIfResized(), this._alwaysShowContent = a, this.el.className = t.get("className") || "";
    }, r.prototype.show = function(t, e) {
      clearTimeout(this._hideTimeout), clearTimeout(this._longHideTimeout);
      var i = this.el, n = i.style, a = this._styleCoord;
      i.innerHTML ? n.cssText = aA + fA(t, !this._firstShow, this._longHide) + ep(a[0], a[1], !0) + ("border-color:" + Qr(e) + ";") + (t.get("extraCssText") || "") + (";pointer-events:" + (this._enterable ? "auto" : "none")) : n.display = "none", this._show = !0, this._firstShow = !1, this._longHide = !1;
    }, r.prototype.setContent = function(t, e, i, n, a) {
      var o = this.el;
      if (t == null) {
        o.innerHTML = "";
        return;
      }
      var s = "";
      if (z(a) && i.get("trigger") === "item" && !Wm(i) && (s = sA(i, n, a)), z(t))
        o.innerHTML = t + s;
      else if (t) {
        o.innerHTML = "", N(t) || (t = [t]);
        for (var l = 0; l < t.length; l++)
          Xn(t[l]) && t[l].parentNode !== o && o.appendChild(t[l]);
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
        if (rp(i, this._zr, this._container, t, e), i[0] != null && i[1] != null) {
          var n = this.el.style, a = ep(i[0], i[1]);
          C(a, function(o) {
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
      this._show && !(this._inContent && this._enterable) && !this._alwaysShowContent && (t ? (this._hideDelay = t, this._show = !1, this._hideTimeout = setTimeout(ct(this.hide, this), t)) : this.hide());
    }, r.prototype.isShow = function() {
      return this._show;
    }, r.prototype.dispose = function() {
      clearTimeout(this._hideTimeout), clearTimeout(this._longHideTimeout);
      var t = this.el.parentNode;
      t && t.removeChild(this.el), this.el = this._container = null;
    }, r;
  })()
), cA = (
  /** @class */
  (function() {
    function r(t) {
      this._show = !1, this._styleCoord = [0, 0, 0, 0], this._alwaysShowContent = !1, this._enterable = !0, this._zr = t.getZr(), np(this._styleCoord, this._zr, t.getWidth() / 2, t.getHeight() / 2);
    }
    return r.prototype.update = function(t) {
      var e = t.get("alwaysShowContent");
      e && this._moveIfResized(), this._alwaysShowContent = e;
    }, r.prototype.show = function() {
      this._hideTimeout && clearTimeout(this._hideTimeout), this.el.show(), this._show = !0;
    }, r.prototype.setContent = function(t, e, i, n, a) {
      var o = this;
      V(t) && Ft(""), this.el && this._zr.remove(this.el);
      var s = i.getModel("textStyle");
      this.el = new Gt({
        style: {
          rich: e.richTextStyles,
          text: t,
          lineHeight: 22,
          borderWidth: 1,
          borderColor: n,
          textShadowColor: s.get("textShadowColor"),
          fill: i.get(["textStyle", "color"]),
          padding: Ty(i, "richText"),
          verticalAlign: "top",
          align: "left"
        },
        z: i.get("z")
      }), C(["backgroundColor", "borderRadius", "shadowColor", "shadowBlur", "shadowOffsetX", "shadowOffsetY"], function(u) {
        o.el.style[u] = i.get(u);
      }), C(["textShadowBlur", "textShadowOffsetX", "textShadowOffsetY"], function(u) {
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
      var t = this.el, e = this.el.getBoundingRect(), i = ip(t.style);
      return [e.width + i.left + i.right, e.height + i.top + i.bottom];
    }, r.prototype.moveTo = function(t, e) {
      var i = this.el;
      if (i) {
        var n = this._styleCoord;
        np(n, this._zr, t, e), t = n[0], e = n[1];
        var a = i.style, o = Je(a.borderWidth || 0), s = ip(a);
        i.x = t + o + s.left, i.y = e + o + s.top, i.markRedraw();
      }
    }, r.prototype._moveIfResized = function() {
      var t = this._styleCoord[2], e = this._styleCoord[3];
      this.moveTo(t * this._zr.getWidth(), e * this._zr.getHeight());
    }, r.prototype.hide = function() {
      this.el && this.el.hide(), this._show = !1;
    }, r.prototype.hideLater = function(t) {
      this._show && !(this._inContent && this._enterable) && !this._alwaysShowContent && (t ? (this._hideDelay = t, this._show = !1, this._hideTimeout = setTimeout(ct(this.hide, this), t)) : this.hide());
    }, r.prototype.isShow = function() {
      return this._show;
    }, r.prototype.dispose = function() {
      this._zr.remove(this.el);
    }, r;
  })()
);
function Je(r) {
  return Math.max(0, r);
}
function ip(r) {
  var t = Je(r.shadowBlur || 0), e = Je(r.shadowOffsetX || 0), i = Je(r.shadowOffsetY || 0);
  return {
    left: Je(t - e),
    right: Je(t + e),
    top: Je(t - i),
    bottom: Je(t + i)
  };
}
function np(r, t, e, i) {
  r[0] = e, r[1] = i, r[2] = r[0] / t.getWidth(), r[3] = r[1] / t.getHeight();
}
var vA = new Dt({
  shape: {
    x: -1,
    y: -1,
    width: 2,
    height: 2
  }
}), dA = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = t.type, e;
    }
    return t.prototype.init = function(e, i) {
      if (!(U.node || !i.getDom())) {
        var n = e.getComponent("tooltip"), a = this._renderMode = A1(n.get("renderMode"));
        this._tooltipContent = a === "richText" ? new cA(i) : new hA(i, {
          appendTo: n.get("appendToBody", !0) ? "body" : n.get("appendTo", !0)
        });
      }
    }, t.prototype.render = function(e, i, n) {
      if (!(U.node || !n.getDom())) {
        this.group.removeAll(), this._tooltipModel = e, this._ecModel = i, this._api = n;
        var a = this._tooltipContent;
        a.update(e), a.setEnterable(e.get("enterable")), this._initGlobalListener(), this._keepShow(), this._renderMode !== "richText" && e.get("transitionDuration") ? Ay(this, "_updatePosition", 50, "fixRate") : Bu(this, "_updatePosition");
      }
    }, t.prototype._initGlobalListener = function() {
      var e = this._tooltipModel, i = e.get("triggerOn");
      $m("itemTooltip", this._api, ct(function(n, a, o) {
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
        var o = ap(a, n);
        this._ticket = "";
        var s = a.dataByCoordSys, l = mA(a, i, n);
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
          var f = vA;
          f.x = a.x, f.y = a.y, f.update(), tt(f).tooltipConfig = {
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
          var h = Vm(a, i), v = h.point[0], c = h.point[1];
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
      this._tooltipModel && o.hideLater(this._tooltipModel.get("hideDelay")), this._lastX = this._lastY = this._lastDataByCoordSys = null, a.from !== this.uid && this._hide(ap(a, n));
    }, t.prototype._manuallyAxisShowTip = function(e, i, n, a) {
      var o = a.seriesIndex, s = a.dataIndex, l = i.getComponent("axisPointer").coordSysAxesInfo;
      if (!(o == null || s == null || l == null)) {
        var u = i.getSeriesByIndex(o);
        if (u) {
          var f = u.getData(), h = gn([f.getItemModel(s), u, (u.coordinateSystem || {}).model], this._tooltipModel);
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
          var s = tt(n);
          if (s.ssrType === "legend")
            return;
          this._lastDataByCoordSys = null;
          var l, u;
          Tn(n, function(f) {
            if (tt(f).dataIndex != null)
              return l = f, !0;
            if (tt(f).tooltipConfig != null)
              return u = f, !0;
          }, !0), l ? this._showSeriesItemTooltip(e, l, i) : u ? this._showComponentItemTooltip(e, u, i) : this._hide(i);
        } else
          this._lastDataByCoordSys = null, this._hide(i);
      }
    }, t.prototype._showOrMove = function(e, i) {
      var n = e.get("showDelay");
      i = ct(i, this), clearTimeout(this._showTimout), n > 0 ? this._showTimout = setTimeout(i, n) : i();
    }, t.prototype._showAxisTooltip = function(e, i) {
      var n = this._ecModel, a = this._tooltipModel, o = [i.offsetX, i.offsetY], s = gn([i.tooltipOption], a), l = this._renderMode, u = [], f = jr("section", {
        blocks: [],
        noHeader: !0
      }), h = [], v = new xl();
      C(e, function(m) {
        C(m.dataByAxis, function(_) {
          var S = n.getComponent(_.axisDim + "Axis", _.axisIndex), b = _.value;
          if (!(!S || b == null)) {
            var w = zm(b, S.axis, n, _.seriesDataIndices, _.valueLabelOpt), x = jr("section", {
              header: w,
              noHeader: !xe(w),
              sortBlocks: !0,
              blocks: []
            });
            f.blocks.push(x), C(_.seriesDataIndices, function(T) {
              var D = n.getSeriesByIndex(T.seriesIndex), A = T.dataIndexInside, M = D.getDataParams(A);
              if (!(M.dataIndex < 0)) {
                M.axisDim = _.axisDim, M.axisIndex = _.axisIndex, M.axisType = _.axisType, M.axisId = _.axisId, M.axisValue = ch(S.axis, {
                  value: b
                }), M.axisValueLabel = w, M.marker = v.makeTooltipMarker("item", Qr(M.color), l);
                var L = Cv(D.formatTooltip(A, !0, null)), P = L.frag;
                if (P) {
                  var I = gn([D], a).get("valueFormatter");
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
      var c = i.position, d = s.get("order"), y = Pv(f, v, l, d, n.get("useUTC"), s.get("textStyle"));
      y && h.unshift(y);
      var g = l === "richText" ? `

` : "<br/>", p = h.join(g);
      this._showOrMove(s, function() {
        this._updateContentNotChangedOnAxis(e, u) ? this._updatePosition(s, c, o[0], o[1], this._tooltipContent, u) : this._showTooltipContent(s, p, u, Math.random() + "", o[0], o[1], c, null, v);
      });
    }, t.prototype._showSeriesItemTooltip = function(e, i, n) {
      var a = this._ecModel, o = tt(i), s = o.seriesIndex, l = a.getSeriesByIndex(s), u = o.dataModel || l, f = o.dataIndex, h = o.dataType, v = u.getData(h), c = this._renderMode, d = e.positionDefault, y = gn([v.getItemModel(f), u, l && (l.coordinateSystem || {}).model], this._tooltipModel, d ? {
        position: d
      } : null), g = y.get("trigger");
      if (!(g != null && g !== "item")) {
        var p = u.getDataParams(f, h), m = new xl();
        p.marker = m.makeTooltipMarker("item", Qr(p.color), c);
        var _ = Cv(u.formatTooltip(f, !1, h)), S = y.get("order"), b = y.get("valueFormatter"), w = _.frag, x = w ? Pv(b ? k({
          valueFormatter: b
        }, w) : w, m, c, S, a.get("useUTC"), y.get("textStyle")) : _.text, T = "item_" + u.name + "_" + f;
        this._showOrMove(y, function() {
          this._showTooltipContent(y, x, p, T, e.offsetX, e.offsetY, e.position, e.target, m);
        }), n({
          type: "showTip",
          dataIndexInside: f,
          dataIndex: v.getRawIndex(f),
          seriesIndex: s,
          from: this.uid
        });
      }
    }, t.prototype._showComponentItemTooltip = function(e, i, n) {
      var a = this._renderMode === "html", o = tt(i), s = o.tooltipConfig, l = s.option || {}, u = l.encodeHTMLContent;
      if (z(l)) {
        var f = l;
        l = {
          content: f,
          // Fixed formatter
          formatter: f
        }, u = !0;
      }
      u && a && l.content && (l = q(l), l.content = Nt(l.content));
      var h = [l], v = this._ecModel.getComponent(o.componentMainType, o.componentIndex);
      v && h.push(v), h.push({
        formatter: l.content
      });
      var c = e.positionDefault, d = gn(h, this._tooltipModel, c ? {
        position: c
      } : null), y = d.get("content"), g = Math.random() + "", p = new xl();
      this._showOrMove(d, function() {
        var m = q(d.get("formatterParams") || {});
        this._showTooltipContent(d, y, m, g, e.offsetX, e.offsetY, e.position, i, p);
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
            var g = e.ecModel.get("useUTC"), p = N(n) ? n[0] : n, m = p && p.axisType && p.axisType.indexOf("time") >= 0;
            c = v, m && (c = cs(p.axisValue, c, g)), c = Jg(c, n, !0);
          } else if ($(v)) {
            var _ = ct(function(S, b) {
              S === this._ticket && (h.setContent(b, f, e, y, l), this._updatePosition(e, l, o, s, h, n, u));
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
      if (l && d.applyTransform(l.transform), $(i) && (i = i([n, a], s, o.el, d, {
        viewSize: [u, f],
        contentSize: h.slice()
      })), N(i))
        n = St(i[0], u), a = St(i[1], f);
      else if (V(i)) {
        var y = i;
        y.width = h[0], y.height = h[1];
        var g = No(y, {
          width: u,
          height: f
        });
        n = g.x, a = g.y, v = null, c = null;
      } else if (z(i) && l) {
        var p = yA(i, d, h, e.get("borderWidth"));
        n = p[0], a = p[1];
      } else {
        var p = pA(n, a, o, u, f, v ? null : 20, c ? null : 20);
        n = p[0], a = p[1];
      }
      if (v && (n -= op(v) ? h[0] / 2 : v === "right" ? h[0] : 0), c && (a -= op(c) ? h[1] / 2 : c === "bottom" ? h[1] : 0), Wm(e)) {
        var p = gA(n, a, o, u, f);
        n = p[0], a = p[1];
      }
      o.moveTo(n, a);
    }, t.prototype._updateContentNotChangedOnAxis = function(e, i) {
      var n = this._lastDataByCoordSys, a = this._cbParamsList, o = !!n && n.length === e.length;
      return o && C(n, function(s, l) {
        var u = s.dataByAxis || [], f = e[l] || {}, h = f.dataByAxis || [];
        o = o && u.length === h.length, o && C(u, function(v, c) {
          var d = h[c] || {}, y = v.seriesDataIndices || [], g = d.seriesDataIndices || [];
          o = o && v.value === d.value && v.axisType === d.axisType && v.axisId === d.axisId && y.length === g.length, o && C(y, function(p, m) {
            var _ = g[m];
            o = o && p.seriesIndex === _.seriesIndex && p.dataIndex === _.dataIndex;
          }), a && C(v.seriesDataIndices, function(p) {
            var m = p.seriesIndex, _ = i[m], S = a[m];
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
      U.node || !i.getDom() || (Bu(this, "_updatePosition"), this._tooltipContent.dispose(), ef("itemTooltip", i));
    }, t.type = "tooltip", t;
  })(pe)
);
function gn(r, t, e) {
  var i = t.ecModel, n;
  e ? (n = new pt(e, i, i), n = new pt(t.option, n, i)) : n = t;
  for (var a = r.length - 1; a >= 0; a--) {
    var o = r[a];
    o && (o instanceof pt && (o = o.get("tooltip", !0)), z(o) && (o = {
      formatter: o
    }), o && (n = new pt(o, n, i)));
  }
  return n;
}
function ap(r, t) {
  return r.dispatchAction || ct(t.dispatchAction, t);
}
function pA(r, t, e, i, n, a, o) {
  var s = e.getSize(), l = s[0], u = s[1];
  return a != null && (r + l + a + 2 > i ? r -= l + a : r += a), o != null && (t + u + o > n ? t -= u + o : t += o), [r, t];
}
function gA(r, t, e, i, n) {
  var a = e.getSize(), o = a[0], s = a[1];
  return r = Math.min(r + o, i) - o, t = Math.min(t + s, n) - s, r = Math.max(r, 0), t = Math.max(t, 0), [r, t];
}
function yA(r, t, e, i) {
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
function op(r) {
  return r === "center" || r === "middle";
}
function mA(r, t, e) {
  var i = Lf(r).queryOptionMap, n = i.keys()[0];
  if (!(!n || n === "series")) {
    var a = ha(t, n, i.get(n), {
      useDefault: !1,
      enableAll: !1,
      enableNone: !1
    }), o = a.models[0];
    if (o) {
      var s = e.getViewOfComponentModel(o), l;
      if (s.group.traverse(function(u) {
        var f = tt(u).tooltipConfig;
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
function _A(r) {
  ur(Gm), r.registerComponentModel(eA), r.registerComponentView(dA), r.registerAction({
    type: "showTip",
    event: "showTip",
    update: "tooltip:manuallyShowTip"
  }, Ht), r.registerAction({
    type: "hideTip",
    event: "hideTip",
    update: "tooltip:manuallyHideTip"
  }, Ht);
}
function Zm(r, t) {
  if (!r)
    return !1;
  for (var e = N(r) ? r : [r], i = 0; i < e.length; i++)
    if (e[i] && e[i][t])
      return !0;
  return !1;
}
function qa(r) {
  Su(r, "label", ["show"]);
}
var Ka = gt(), ti = (
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
        var l = s.get(this.mainType, !0), u = Ka(s)[o];
        if (!l || !l.data) {
          Ka(s)[o] = null;
          return;
        }
        u ? u._mergeOption(l, i, !0) : (a && qa(l), C(l.data, function(f) {
          f instanceof Array ? (qa(f[0]), qa(f[1])) : qa(f);
        }), u = this.createMarkerModelFromSeries(l, this, i), k(u, {
          mainType: this.mainType,
          // Use the same series index and name
          seriesIndex: s.seriesIndex,
          name: s.name,
          createdBySelf: !0
        }), u.__hostSeries = s), Ka(s)[o] = u;
      }, this);
    }, t.prototype.formatTooltip = function(e, i, n) {
      var a = this.getData(), o = this.getRawValue(e), s = a.getName(e);
      return jr("section", {
        header: this.name,
        blocks: [jr("nameValue", {
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
      var n = eh.prototype.getDataParams.call(this, e, i), a = this.__hostSeries;
      return a && (n.seriesId = a.id, n.seriesName = a.name, n.seriesType = a.subType), n;
    }, t.getMarkerModelFromSeries = function(e, i) {
      return Ka(e)[i];
    }, t.type = "marker", t.dependencies = ["series", "grid", "polar", "geo"], t;
  })(nt)
);
ge(ti, eh.prototype);
var SA = (
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
  })(ti)
);
function wA(r) {
  return !(isNaN(parseFloat(r.x)) && isNaN(parseFloat(r.y)));
}
function bA(r) {
  return !isNaN(parseFloat(r.x)) && !isNaN(parseFloat(r.y));
}
function Qa(r, t, e, i, n, a) {
  var o = [], s = $i(
    t,
    i
    /* , otherDataDim */
  ), l = s ? t.getCalculationInfo("stackResultDimension") : i, u = mh(t, l, r), f = t.indicesOfNearest(l, u)[0];
  o[n] = t.get(e, f), o[a] = t.get(l, f);
  var h = t.get(i, f), v = Te(t.get(i, f));
  return v = Math.min(v, 20), v >= 0 && (o[a] = +o[a].toFixed(v)), [o, h];
}
var Xl = {
  min: lt(Qa, "min"),
  max: lt(Qa, "max"),
  average: lt(Qa, "average"),
  median: lt(Qa, "median")
};
function rf(r, t) {
  if (t) {
    var e = r.getData(), i = r.coordinateSystem, n = i && i.dimensions;
    if (!bA(t) && !N(t.coord) && N(n)) {
      var a = qm(t, e, i, r);
      if (t = q(t), t.type && Xl[t.type] && a.baseAxis && a.valueAxis) {
        var o = et(n, a.baseAxis.dim), s = et(n, a.valueAxis.dim), l = Xl[t.type](e, a.baseDataDim, a.valueDataDim, o, s);
        t.coord = l[0], t.value = l[1];
      } else
        t.coord = [t.xAxis != null ? t.xAxis : t.radiusAxis, t.yAxis != null ? t.yAxis : t.angleAxis];
    }
    if (t.coord == null || !N(n))
      t.coord = [];
    else
      for (var u = t.coord, f = 0; f < 2; f++)
        Xl[u[f]] && (u[f] = mh(e, e.mapDimension(n[f]), u[f]));
    return t;
  }
}
function qm(r, t, e, i) {
  var n = {};
  return r.valueIndex != null || r.valueDim != null ? (n.valueDataDim = r.valueIndex != null ? t.getDimension(r.valueIndex) : r.valueDim, n.valueAxis = e.getAxis(xA(i, n.valueDataDim)), n.baseAxis = e.getOtherAxis(n.valueAxis), n.baseDataDim = t.mapDimension(n.baseAxis.dim)) : (n.baseAxis = i.getBaseAxis(), n.valueAxis = e.getOtherAxis(n.baseAxis), n.baseDataDim = t.mapDimension(n.baseAxis.dim), n.valueDataDim = t.mapDimension(n.valueAxis.dim)), n;
}
function xA(r, t) {
  var e = r.getData().getDimensionInfo(t);
  return e && e.coordDim;
}
function nf(r, t) {
  return r && r.containData && t.coord && !wA(t) ? r.containData(t.coord) : !0;
}
function Km(r, t) {
  return r ? function(e, i, n, a) {
    var o = a < 2 ? e.coord && e.coord[a] : e.value;
    return Ri(o, t[a]);
  } : function(e, i, n, a) {
    return Ri(e.value, t[a]);
  };
}
function mh(r, t, e) {
  if (e === "average") {
    var i = 0, n = 0;
    return r.each(t, function(a, o) {
      isNaN(a) || (i += a, n++);
    }), i / n;
  } else return e === "median" ? r.getMedian(t) : r.getDataExtent(t)[e === "max" ? 1 : 0];
}
var Zl = gt(), Qm = (
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
        Zl(s).keep = !1;
      }), i.eachSeries(function(s) {
        var l = ti.getMarkerModelFromSeries(s, a.type);
        l && a.renderSeries(s, l, i, n);
      }), o.each(function(s) {
        !Zl(s).keep && a.group.remove(s.group);
      });
    }, t.prototype.markKeep = function(e) {
      Zl(e).keep = !0;
    }, t.prototype.toggleBlurSeries = function(e, i) {
      var n = this;
      C(e, function(a) {
        var o = ti.getMarkerModelFromSeries(a, n.type);
        if (o) {
          var s = o.getData();
          s.eachItemGraphicEl(function(l) {
            l && (i ? Sg(l) : kf(l));
          });
        }
      });
    }, t.type = "marker", t;
  })(pe)
);
function sp(r, t, e) {
  var i = t.coordinateSystem;
  r.each(function(n) {
    var a = r.getItemModel(n), o, s = St(a.get("x"), e.getWidth()), l = St(a.get("y"), e.getHeight());
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
var TA = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = t.type, e;
    }
    return t.prototype.updateTransform = function(e, i, n) {
      i.eachSeries(function(a) {
        var o = ti.getMarkerModelFromSeries(a, "markPoint");
        o && (sp(o.getData(), a, n), this.markerGroupMap.get(a.id).updateLayout());
      }, this);
    }, t.prototype.renderSeries = function(e, i, n, a) {
      var o = e.coordinateSystem, s = e.id, l = e.getData(), u = this.markerGroupMap, f = u.get(s) || u.set(s, new Dm()), h = CA(o, e, i);
      i.setData(h), sp(i.getData(), e, a), h.each(function(v) {
        var c = h.getItemModel(v), d = c.getShallow("symbol"), y = c.getShallow("symbolSize"), g = c.getShallow("symbolRotate"), p = c.getShallow("symbolOffset"), m = c.getShallow("symbolKeepAspect");
        if ($(d) || $(y) || $(g) || $(p)) {
          var _ = i.getRawValue(v), S = i.getDataParams(v);
          $(d) && (d = d(_, S)), $(y) && (y = y(_, S)), $(g) && (g = g(_, S)), $(p) && (p = p(_, S));
        }
        var b = c.getModel("itemStyle").getItemStyle(), w = ih(l, "color");
        b.fill || (b.fill = w), h.setItemVisual(v, {
          symbol: d,
          symbolSize: y,
          symbolRotate: g,
          symbolOffset: p,
          symbolKeepAspect: m,
          style: b
        });
      }), f.updateData(h), this.group.add(f.group), h.eachItemGraphicEl(function(v) {
        v.traverse(function(c) {
          tt(c).dataModel = i;
        });
      }), this.markKeep(f), f.group.silent = i.get("silent") || e.get("silent");
    }, t.type = "markPoint", t;
  })(Qm)
);
function CA(r, t, e) {
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
  var n = new $n(i, e), a = H(e.get("data"), lt(rf, t));
  r && (a = _t(a, lt(nf, r)));
  var o = Km(!!r, i);
  return n.initData(a, null, o), n;
}
function DA(r) {
  r.registerComponentModel(SA), r.registerComponentView(TA), r.registerPreprocessor(function(t) {
    Zm(t.series, "markPoint") && (t.markPoint = t.markPoint || {});
  });
}
var MA = (
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
  })(ti)
), ja = gt(), AA = function(r, t, e, i) {
  var n = r.getData(), a;
  if (N(i))
    a = i;
  else {
    var o = i.type;
    if (o === "min" || o === "max" || o === "average" || o === "median" || i.xAxis != null || i.yAxis != null) {
      var s = void 0, l = void 0;
      if (i.yAxis != null || i.xAxis != null)
        s = t.getAxis(i.yAxis != null ? "y" : "x"), l = Bi(i.yAxis, i.xAxis);
      else {
        var u = qm(i, n, t, r);
        s = u.valueAxis;
        var f = fm(n, u.valueDataDim);
        l = mh(n, f, o);
      }
      var h = s.dim === "x" ? 0 : 1, v = 1 - h, c = q(i), d = {
        coord: []
      };
      c.type = null, c.coord = [], c.coord[v] = -1 / 0, d.coord[v] = 1 / 0;
      var y = e.get("precision");
      y >= 0 && ut(l) && (l = +l.toFixed(Math.min(y, 20))), c.coord[h] = d.coord[h] = l, a = [c, d, {
        type: o,
        valueIndex: i.valueIndex,
        // Force to use the value of calculated value.
        value: l
      }];
    } else
      a = [];
  }
  var g = [rf(r, a[0]), rf(r, a[1]), k({}, a[2])];
  return g[2].type = g[2].type || null, Q(g[2], g[0]), Q(g[2], g[1]), g;
};
function Go(r) {
  return !isNaN(r) && !isFinite(r);
}
function lp(r, t, e, i) {
  var n = 1 - r, a = i.dimensions[r];
  return Go(t[n]) && Go(e[n]) && t[r] === e[r] && i.getAxis(a).containData(t[r]);
}
function LA(r, t) {
  if (r.type === "cartesian2d") {
    var e = t[0].coord, i = t[1].coord;
    if (e && i && (lp(1, e, i, r) || lp(0, e, i, r)))
      return !0;
  }
  return nf(r, t[0]) && nf(r, t[1]);
}
function ql(r, t, e, i, n) {
  var a = i.coordinateSystem, o = r.getItemModel(t), s, l = St(o.get("x"), n.getWidth()), u = St(o.get("y"), n.getHeight());
  if (!isNaN(l) && !isNaN(u))
    s = [l, u];
  else {
    if (i.getMarkerPosition)
      s = i.getMarkerPosition(r.getValues(r.dimensions, t));
    else {
      var f = a.dimensions, h = r.get(f[0], t), v = r.get(f[1], t);
      s = a.dataToPoint([h, v]);
    }
    if (Pm(a, "cartesian2d")) {
      var c = a.getAxis("x"), d = a.getAxis("y"), f = a.dimensions;
      Go(r.get(f[0], t)) ? s[0] = c.toGlobalCoord(c.getExtent()[e ? 0 : 1]) : Go(r.get(f[1], t)) && (s[1] = d.toGlobalCoord(d.getExtent()[e ? 0 : 1]));
    }
    isNaN(l) || (s[0] = l), isNaN(u) || (s[1] = u);
  }
  r.setItemLayout(t, s);
}
var PA = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = t.type, e;
    }
    return t.prototype.updateTransform = function(e, i, n) {
      i.eachSeries(function(a) {
        var o = ti.getMarkerModelFromSeries(a, "markLine");
        if (o) {
          var s = o.getData(), l = ja(o).from, u = ja(o).to;
          l.each(function(f) {
            ql(l, f, !0, a, n), ql(u, f, !1, a, n);
          }), s.each(function(f) {
            s.setItemLayout(f, [l.getItemLayout(f), u.getItemLayout(f)]);
          }), this.markerGroupMap.get(a.id).updateLayout();
        }
      }, this);
    }, t.prototype.renderSeries = function(e, i, n, a) {
      var o = e.coordinateSystem, s = e.id, l = e.getData(), u = this.markerGroupMap, f = u.get(s) || u.set(s, new MM());
      this.group.add(f.group);
      var h = IA(o, e, i), v = h.from, c = h.to, d = h.line;
      ja(i).from = v, ja(i).to = c, i.setData(d);
      var y = i.get("symbol"), g = i.get("symbolSize"), p = i.get("symbolRotate"), m = i.get("symbolOffset");
      N(y) || (y = [y, y]), N(g) || (g = [g, g]), N(p) || (p = [p, p]), N(m) || (m = [m, m]), h.from.each(function(S) {
        _(v, S, !0), _(c, S, !1);
      }), d.each(function(S) {
        var b = d.getItemModel(S).getModel("lineStyle").getLineStyle();
        d.setItemLayout(S, [v.getItemLayout(S), c.getItemLayout(S)]), b.stroke == null && (b.stroke = v.getItemVisual(S, "style").fill), d.setItemVisual(S, {
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
          style: b
        });
      }), f.updateData(d), h.line.eachItemGraphicEl(function(S) {
        tt(S).dataModel = i, S.traverse(function(b) {
          tt(b).dataModel = i;
        });
      });
      function _(S, b, w) {
        var x = S.getItemModel(b);
        ql(S, b, w, e, a);
        var T = x.getModel("itemStyle").getItemStyle();
        T.fill == null && (T.fill = ih(l, "color")), S.setItemVisual(b, {
          symbolKeepAspect: x.get("symbolKeepAspect"),
          // `0` should be considered as a valid value, so use `retrieve2` instead of `||`
          symbolOffset: X(x.get("symbolOffset", !0), m[w ? 0 : 1]),
          symbolRotate: X(x.get("symbolRotate", !0), p[w ? 0 : 1]),
          // TODO: when 2d array is supported, it should ignore parent
          symbolSize: X(x.get("symbolSize"), g[w ? 0 : 1]),
          symbol: X(x.get("symbol", !0), y[w ? 0 : 1]),
          style: T
        });
      }
      this.markKeep(f), f.group.silent = i.get("silent") || e.get("silent");
    }, t.type = "markLine", t;
  })(Qm)
);
function IA(r, t, e) {
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
  var n = new $n(i, e), a = new $n(i, e), o = new $n([], e), s = H(e.get("data"), lt(AA, t, r, e));
  r && (s = _t(s, lt(LA, r)));
  var l = Km(!!r, i);
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
function EA(r) {
  r.registerComponentModel(MA), r.registerComponentView(PA), r.registerPreprocessor(function(t) {
    Zm(t.series, "markLine") && (t.markLine = t.markLine || {});
  });
}
var RA = function(r, t) {
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
}, af = (
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
      i === !0 && (i = e.selector = ["all", "inverse"]), N(i) && C(i, function(a, o) {
        z(a) && (a = {
          type: a
        }), i[o] = Q(a, RA(n, a.type));
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
        f && Af(l) && i.push(l.name);
      }), this._availableNames = n;
      var a = this.get("data") || i, o = Z(), s = H(a, function(l) {
        return (z(l) || ut(l)) && (l = {
          name: l
        }), o.get(l.name) ? null : (o.set(l.name, !0), new pt(l, this, this.ecModel));
      }, this);
      this._data = _t(s, function(l) {
        return !!l;
      });
    }, t.prototype.getData = function() {
      return this._data;
    }, t.prototype.select = function(e) {
      var i = this.option.selected, n = this.get("selectedMode");
      if (n === "single") {
        var a = this._data;
        C(a, function(o) {
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
      C(e, function(n) {
        i[n.get("name", !0)] = !0;
      });
    }, t.prototype.inverseSelect = function() {
      var e = this._data, i = this.option.selected;
      C(e, function(n) {
        var a = n.get("name", !0);
        i.hasOwnProperty(a) || (i[a] = !0), i[a] = !i[a];
      });
    }, t.prototype.isSelected = function(e) {
      var i = this.option.selected;
      return !(i.hasOwnProperty(e) && !i[e]) && et(this._availableNames, e) >= 0;
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
  })(nt)
), yi = lt, of = C, Ja = bt, jm = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = t.type, e.newlineDisabled = !1, e;
    }
    return t.prototype.init = function() {
      this.group.add(this._contentGroup = new Ja()), this.group.add(this._selectorGroup = new Ja()), this._isFirstRender = !0;
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
        }, v = e.get("padding"), c = No(f, h, v), d = this.layoutInner(e, o, c, a, l, u), y = No(at({
          width: d.width,
          height: d.height
        }, f), h, v);
        this.group.x = y.x - d.x, this.group.y = y.y - d.y, this.group.markRedraw(), this.group.add(this._backgroundEl = tA(d, e));
      }
    }, t.prototype.resetInner = function() {
      this.getContentGroup().removeAll(), this._backgroundEl && this.group.remove(this._backgroundEl), this.getSelectorGroup().removeAll();
    }, t.prototype.renderInner = function(e, i, n, a, o, s, l) {
      var u = this.getContentGroup(), f = Z(), h = i.get("selectedMode"), v = [];
      n.eachRawSeries(function(c) {
        !c.get("legendHoverLink") && v.push(c.id);
      }), of(i.getData(), function(c, d) {
        var y = c.get("name");
        if (!this.newlineDisabled && (y === "" || y === `
`)) {
          var g = new Ja();
          g.newline = !0, u.add(g);
          return;
        }
        var p = n.getSeriesByName(y)[0];
        if (!f.get(y))
          if (p) {
            var m = p.getData(), _ = m.getVisual("legendLineStyle") || {}, S = m.getVisual("legendIcon"), b = m.getVisual("style"), w = this._createItem(p, y, d, c, i, e, _, b, S, h, a);
            w.on("click", yi(up, y, null, a, v)).on("mouseover", yi(sf, p.name, null, a, v)).on("mouseout", yi(lf, p.name, null, a, v)), n.ssr && w.eachChild(function(x) {
              var T = tt(x);
              T.seriesIndex = p.seriesIndex, T.dataIndex = d, T.ssrType = "legend";
            }), f.set(y, !0);
          } else
            n.eachRawSeries(function(x) {
              if (!f.get(y) && x.legendVisualProvider) {
                var T = x.legendVisualProvider;
                if (!T.containName(y))
                  return;
                var D = T.indexOfName(y), A = T.getItemVisual(D, "style"), M = T.getItemVisual(D, "legendIcon"), L = Oe(A.fill);
                L && L[3] === 0 && (L[3] = 0.2, A = k(k({}, A), {
                  fill: qo(L, "rgba")
                }));
                var P = this._createItem(x, y, d, c, i, e, {}, A, M, h, a);
                P.on("click", yi(up, null, y, a, v)).on("mouseover", yi(sf, null, y, a, v)).on("mouseout", yi(lf, null, y, a, v)), n.ssr && P.eachChild(function(I) {
                  var E = tt(I);
                  E.seriesIndex = x.seriesIndex, E.dataIndex = d, E.ssrType = "legend";
                }), f.set(y, !0);
              }
            }, this);
      }, this), o && this._createSelector(o, i, a, s, l);
    }, t.prototype._createSelector = function(e, i, n, a, o) {
      var s = this.getSelectorGroup();
      of(e, function(u) {
        var f = u.type, h = new Gt({
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
        fs(h, {
          normal: v,
          emphasis: c
        }, {
          defaultText: u.title
        }), Du(h);
      });
    }, t.prototype._createItem = function(e, i, n, a, o, s, l, u, f, h, v) {
      var c = e.visualDrawType, d = o.get("itemWidth"), y = o.get("itemHeight"), g = o.isSelected(i), p = a.get("symbolRotate"), m = a.get("symbolKeepAspect"), _ = a.get("icon");
      f = _ || f || "roundRect";
      var S = kA(f, a, l, u, c, g, v), b = new Ja(), w = a.getModel("textStyle");
      if ($(e.getLegendIcon) && (!_ || _ === "inherit"))
        b.add(e.getLegendIcon({
          itemWidth: d,
          itemHeight: y,
          icon: f,
          iconRotate: p,
          itemStyle: S.itemStyle,
          lineStyle: S.lineStyle,
          symbolKeepAspect: m
        }));
      else {
        var x = _ === "inherit" && e.getData().getVisual("symbol") ? p === "inherit" ? e.getData().getVisual("symbolRotate") : p : 0;
        b.add(OA({
          itemWidth: d,
          itemHeight: y,
          icon: f,
          iconRotate: x,
          itemStyle: S.itemStyle,
          symbolKeepAspect: m
        }));
      }
      var T = s === "left" ? d + 5 : -5, D = s, A = o.get("formatter"), M = i;
      z(A) && A ? M = A.replace("{name}", i ?? "") : $(A) && (M = A(i));
      var L = g ? w.getTextColor() : a.get("inactiveColor");
      b.add(new Gt({
        style: Fi(w, {
          text: M,
          x: T,
          y: y / 2,
          fill: L,
          align: D,
          verticalAlign: "middle"
        }, {
          inheritColor: L
        })
      }));
      var P = new Dt({
        shape: b.getBoundingRect(),
        style: {
          // Cannot use 'invisible' because SVG SSR will miss the node
          fill: "transparent"
        }
      }), I = a.getModel("tooltip");
      return I.get("show") && ss({
        el: P,
        componentModel: o,
        itemName: i,
        itemTooltipOption: I.option
      }), b.add(P), b.eachChild(function(E) {
        E.silent = !0;
      }), P.silent = !h, this.getContentGroup().add(b), Du(b), b.__legendDataIndex = n, b;
    }, t.prototype.layoutInner = function(e, i, n, a, o, s) {
      var l = this.getContentGroup(), u = this.getSelectorGroup();
      Bn(e.get("orient"), l, e.get("itemGap"), n.width, n.height);
      var f = l.getBoundingRect(), h = [-f.x, -f.y];
      if (u.markRedraw(), l.markRedraw(), o) {
        Bn(
          // Buttons in selectorGroup always layout horizontally
          "horizontal",
          u,
          e.get("selectorItemGap", !0)
        );
        var v = u.getBoundingRect(), c = [-v.x, -v.y], d = e.get("selectorButtonGap", !0), y = e.getOrient().index, g = y === 0 ? "width" : "height", p = y === 0 ? "height" : "width", m = y === 0 ? "y" : "x";
        s === "end" ? c[y] += f[g] + d : h[y] += v[g] + d, c[1 - y] += f[p] / 2 - v[p] / 2, u.x = c[0], u.y = c[1], l.x = h[0], l.y = h[1];
        var _ = {
          x: 0,
          y: 0
        };
        return _[g] = f[g] + d + v[g], _[p] = Math.max(f[p], v[p]), _[m] = Math.min(0, v[m] + c[1 - y]), _;
      } else
        return l.x = h[0], l.y = h[1], this.group.getBoundingRect();
    }, t.prototype.remove = function() {
      this.getContentGroup().removeAll(), this._isFirstRender = !0;
    }, t.type = "legend.plain", t;
  })(pe)
);
function kA(r, t, e, i, n, a, o) {
  function s(g, p) {
    g.lineWidth === "auto" && (g.lineWidth = p.lineWidth > 0 ? 2 : 0), of(g, function(m, _) {
      g[_] === "inherit" && (g[_] = p[_]);
    });
  }
  var l = t.getModel("itemStyle"), u = l.getItemStyle(), f = r.lastIndexOf("empty", 0) === 0 ? "fill" : "stroke", h = l.getShallow("decal");
  u.decal = !h || h === "inherit" ? i.decal : Vu(h, o), u.fill === "inherit" && (u.fill = i[n]), u.stroke === "inherit" && (u.stroke = i[f]), u.opacity === "inherit" && (u.opacity = (n === "fill" ? i : e).opacity), s(u, i);
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
function OA(r) {
  var t = r.icon || "roundRect", e = Jr(t, 0, 0, r.itemWidth, r.itemHeight, r.itemStyle.fill, r.symbolKeepAspect);
  return e.setStyle(r.itemStyle), e.rotation = (r.iconRotate || 0) * Math.PI / 180, e.setOrigin([r.itemWidth / 2, r.itemHeight / 2]), t.indexOf("empty") > -1 && (e.style.stroke = e.style.fill, e.style.fill = "#fff", e.style.lineWidth = 2), e;
}
function up(r, t, e, i) {
  lf(r, t, e, i), e.dispatchAction({
    type: "legendToggleSelect",
    name: r ?? t
  }), sf(r, t, e, i);
}
function Jm(r) {
  for (var t = r.getZr().storage.getDisplayList(), e, i = 0, n = t.length; i < n && !(e = t[i].states.emphasis); )
    i++;
  return e && e.hoverLayer;
}
function sf(r, t, e, i) {
  Jm(e) || e.dispatchAction({
    type: "highlight",
    seriesName: r,
    name: t,
    excludeSeriesId: i
  });
}
function lf(r, t, e, i) {
  Jm(e) || e.dispatchAction({
    type: "downplay",
    seriesName: r,
    name: t,
    excludeSeriesId: i
  });
}
function NA(r) {
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
function yn(r, t, e) {
  var i = r === "allSelect" || r === "inverseSelect", n = {}, a = [];
  e.eachComponent({
    mainType: "legend",
    query: t
  }, function(s) {
    i ? s[r]() : s[r](t.name), fp(s, n), a.push(s.componentIndex);
  });
  var o = {};
  return e.eachComponent("legend", function(s) {
    C(n, function(l, u) {
      s[l ? "select" : "unSelect"](u);
    }), fp(s, o);
  }), i ? {
    selected: o,
    // return legendIndex array to tell the developers which legends are allSelect / inverseSelect
    legendIndex: a
  } : {
    name: t.name,
    selected: o
  };
}
function fp(r, t) {
  var e = t || {};
  return C(r.getData(), function(i) {
    var n = i.get("name");
    if (!(n === `
` || n === "")) {
      var a = r.isSelected(n);
      Xr(e, n) ? e[n] = e[n] && a : e[n] = a;
    }
  }), e;
}
function BA(r) {
  r.registerAction("legendToggleSelect", "legendselectchanged", lt(yn, "toggleSelected")), r.registerAction("legendAllSelect", "legendselectall", lt(yn, "allSelect")), r.registerAction("legendInverseSelect", "legendinverseselect", lt(yn, "inverseSelect")), r.registerAction("legendSelect", "legendselected", lt(yn, "select")), r.registerAction("legendUnSelect", "legendunselected", lt(yn, "unSelect"));
}
function t_(r) {
  r.registerComponentModel(af), r.registerComponentView(jm), r.registerProcessor(r.PRIORITY.PROCESSOR.SERIES_FILTER, NA), r.registerSubTypeDefaulter("legend", function() {
    return "plain";
  }), BA(r);
}
var FA = (
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
      var a = ms(e);
      r.prototype.init.call(this, e, i, n), hp(this, e, a);
    }, t.prototype.mergeOption = function(e, i) {
      r.prototype.mergeOption.call(this, e, i), hp(this, this.option, e);
    }, t.type = "legend.scroll", t.defaultOption = tb(af.defaultOption, {
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
  })(af)
);
function hp(r, t, e) {
  var i = r.getOrient(), n = [1, 1];
  n[i.index] = 0, zi(t, e, {
    type: "box",
    ignoreSize: !!n
  });
}
var cp = bt, Kl = ["width", "height"], Ql = ["x", "y"], zA = (
  /** @class */
  (function(r) {
    O(t, r);
    function t() {
      var e = r !== null && r.apply(this, arguments) || this;
      return e.type = t.type, e.newlineDisabled = !0, e._currentIndex = 0, e;
    }
    return t.prototype.init = function() {
      r.prototype.init.call(this), this.group.add(this._containerGroup = new cp()), this._containerGroup.add(this.getContentGroup()), this.group.add(this._controllerGroup = new cp());
    }, t.prototype.resetInner = function() {
      r.prototype.resetInner.call(this), this._controllerGroup.removeAll(), this._containerGroup.removeClipPath(), this._containerGroup.__rectSize = null;
    }, t.prototype.renderInner = function(e, i, n, a, o, s, l) {
      var u = this;
      r.prototype.renderInner.call(this, e, i, n, a, o, s, l);
      var f = this._controllerGroup, h = i.get("pageIconSize", !0), v = N(h) ? h : [h, h];
      d("pagePrev", 0);
      var c = i.getModel("pageTextStyle");
      f.add(new Gt({
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
      function d(y, g) {
        var p = y + "DataIndex", m = Gf(i.get("pageIcons", !0)[i.getOrient().name][g], {
          // Buttons will be created in each render, so we do not need
          // to worry about avoiding using legendModel kept in scope.
          onclick: ct(u._pageGo, u, p, i, a)
        }, {
          x: -v[0] / 2,
          y: -v[1] / 2,
          width: v[0],
          height: v[1]
        });
        m.name = y, f.add(m);
      }
    }, t.prototype.layoutInner = function(e, i, n, a, o, s) {
      var l = this.getSelectorGroup(), u = e.getOrient().index, f = Kl[u], h = Ql[u], v = Kl[1 - u], c = Ql[1 - u];
      o && Bn(
        // Buttons in selectorGroup always layout horizontally
        "horizontal",
        l,
        e.get("selectorItemGap", !0)
      );
      var d = e.get("selectorButtonGap", !0), y = l.getBoundingRect(), g = [-y.x, -y.y], p = q(n);
      o && (p[f] = n[f] - y[f] - d);
      var m = this._layoutContentAndController(e, a, p, u, f, v, c, h);
      if (o) {
        if (s === "end")
          g[u] += m[f] + d;
        else {
          var _ = y[f] + d;
          g[u] -= _, m[h] -= _;
        }
        m[f] += y[f] + d, g[1 - u] += m[c] + m[v] / 2 - y[v] / 2, m[v] = Math.max(m[v], y[v]), m[c] = Math.min(m[c], y[c] + g[1 - u]), l.x = g[0], l.y = g[1], l.markRedraw();
      }
      return m;
    }, t.prototype._layoutContentAndController = function(e, i, n, a, o, s, l, u) {
      var f = this.getContentGroup(), h = this._containerGroup, v = this._controllerGroup;
      Bn(e.get("orient"), f, e.get("itemGap"), a ? n.width : null, a ? null : n.height), Bn(
        // Buttons in controller are layout always horizontally.
        "horizontal",
        v,
        e.get("pageButtonItemGap", !0)
      );
      var c = f.getBoundingRect(), d = v.getBoundingRect(), y = this._showController = c[o] > n[o], g = [-c.x, -c.y];
      i || (g[a] = f[u]);
      var p = [0, 0], m = [-d.x, -d.y], _ = X(e.get("pageButtonGap", !0), e.get("itemGap", !0));
      if (y) {
        var S = e.get("pageButtonPosition", !0);
        S === "end" ? m[a] += n[o] - d[o] : p[a] += d[o] + _;
      }
      m[1 - a] += c[s] / 2 - d[s] / 2, f.setPosition(g), h.setPosition(p), v.setPosition(m);
      var b = {
        x: 0,
        y: 0
      };
      if (b[o] = y ? n[o] : c[o], b[s] = Math.max(c[s], d[s]), b[l] = Math.min(0, d[l] + m[1 - a]), h.__rectSize = n[o], y) {
        var w = {
          x: 0,
          y: 0
        };
        w[o] = Math.max(n[o] - d[o] - _, 0), w[s] = b[s], h.setClipPath(new Dt({
          shape: w
        })), h.__rectSize = w[o];
      } else
        v.eachChild(function(T) {
          T.attr({
            invisible: !0,
            silent: !0
          });
        });
      var x = this._getPageInfo(e);
      return x.pageIndex != null && He(
        f,
        {
          x: x.contentPosition[0],
          y: x.contentPosition[1]
        },
        // When switch from "show controller" to "not show controller", view should be
        // updated immediately without animation, otherwise causes weird effect.
        y ? e : null
      ), this._updatePageInfoView(e, x), b;
    }, t.prototype._pageGo = function(e, i, n) {
      var a = this._getPageInfo(i)[e];
      a != null && n.dispatchAction({
        type: "legendScroll",
        scrollDataIndex: a,
        legendId: i.id
      });
    }, t.prototype._updatePageInfoView = function(e, i) {
      var n = this._controllerGroup;
      C(["pagePrev", "pageNext"], function(f) {
        var h = f + "DataIndex", v = i[h] != null, c = n.childOfName(f);
        c && (c.setStyle("fill", v ? e.get("pageIconColor", !0) : e.get("pageIconInactiveColor", !0)), c.cursor = v ? "pointer" : "default");
      });
      var a = n.childOfName("pageText"), o = e.get("pageFormatter"), s = i.pageIndex, l = s != null ? s + 1 : 0, u = i.pageCount;
      a && o && a.setStyle("text", z(o) ? o.replace("{current}", l == null ? "" : l + "").replace("{total}", u == null ? "" : u + "") : o({
        current: l,
        total: u
      }));
    }, t.prototype._getPageInfo = function(e) {
      var i = e.get("scrollDataIndex", !0), n = this.getContentGroup(), a = this._containerGroup.__rectSize, o = e.getOrient().index, s = Kl[o], l = Ql[o], u = this._findTargetItemIndex(i), f = n.children(), h = f[u], v = f.length, c = v ? 1 : 0, d = {
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
      for (var g = u + 1, p = y, m = y, _ = null; g <= v; ++g)
        _ = S(f[g]), // Half of the last item is out of the window.
        (!_ && m.e > p.s + a || _ && !b(_, p.s)) && (m.i > p.i ? p = m : p = _, p && (d.pageNextDataIndex == null && (d.pageNextDataIndex = p.i), ++d.pageCount)), m = _;
      for (var g = u - 1, p = y, m = y, _ = null; g >= -1; --g)
        _ = S(f[g]), // If the the end item does not intersect with the window started
        // from the current item, a page can be settled.
        (!_ || !b(m, _.s)) && p.i < m.i && (m = p, d.pagePrevDataIndex == null && (d.pagePrevDataIndex = p.i), ++d.pageCount, ++d.pageIndex), p = _;
      return d;
      function S(w) {
        if (w) {
          var x = w.getBoundingRect(), T = x[l] + w[l];
          return {
            s: T,
            e: T + x[s],
            i: w.__legendDataIndex
          };
        }
      }
      function b(w, x) {
        return w.e >= x && w.s <= x + a;
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
  })(jm)
);
function HA(r) {
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
function $A(r) {
  ur(t_), r.registerComponentModel(FA), r.registerComponentView(zA), HA(r);
}
function VA(r) {
  ur(t_), ur($A);
}
function vp(r, t, e) {
  var i = Vi.createCanvas(), n = t.getWidth(), a = t.getHeight(), o = i.style;
  return o && (o.position = "absolute", o.left = "0", o.top = "0", o.width = n + "px", o.height = a + "px", i.setAttribute("data-zr-dom-id", r)), i.width = n * e, i.height = a * e, i;
}
var jl = (function(r) {
  O(t, r);
  function t(e, i, n) {
    var a = r.call(this) || this;
    a.motionBlur = !1, a.lastFrameAlpha = 0.7, a.dpr = 1, a.virtual = !1, a.config = {}, a.incremental = !1, a.zlevel = 0, a.maxRepaintRectCount = 5, a.__dirty = !0, a.__firstTimePaint = !0, a.__used = !1, a.__drawIndex = 0, a.__startIndex = 0, a.__endIndex = 0, a.__prevStartIndex = null, a.__prevEndIndex = null;
    var o;
    n = n || Do, typeof e == "string" ? o = vp(e, i, n) : V(e) && (o = e, e = o.id), a.id = e, a.dom = o;
    var s = o.style;
    return s && (Ip(o), o.onselectstart = function() {
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
    this.domBack = vp("back-" + this.id, this.painter, e), this.ctxBack = this.domBack.getContext("2d"), e !== 1 && this.ctxBack.scale(e, e);
  }, t.prototype.createRepaintRects = function(e, i, n, a) {
    if (this.__firstTimePaint)
      return this.__firstTimePaint = !1, null;
    var o = [], s = this.maxRepaintRectCount, l = !1, u = new rt(0, 0, 0, 0);
    function f(m) {
      if (!(!m.isFinite() || m.isZero()))
        if (o.length === 0) {
          var _ = new rt(0, 0, 0, 0);
          _.copy(m), o.push(_);
        } else {
          for (var S = !1, b = 1 / 0, w = 0, x = 0; x < o.length; ++x) {
            var T = o[x];
            if (T.intersect(m)) {
              var D = new rt(0, 0, 0, 0);
              D.copy(T), D.union(m), o[x] = D, S = !0;
              break;
            } else if (l) {
              u.copy(m), u.union(T);
              var A = m.width * m.height, M = T.width * T.height, L = u.width * u.height, P = L - A - M;
              P < b && (b = P, w = x);
            }
          }
          if (l && (o[w].union(m), S = !0), !S) {
            var _ = new rt(0, 0, 0, 0);
            _.copy(m), o.push(_);
          }
          l || (l = o.length >= s);
        }
    }
    for (var h = this.__startIndex; h < this.__endIndex; ++h) {
      var v = e[h];
      if (v) {
        var c = v.shouldBePainted(n, a, !0, !0), d = v.__isRendered && (v.__dirty & Xt || !c) ? v.getPrevPaintRect() : null;
        d && f(d);
        var y = c && (v.__dirty & Xt || !v.__isRendered) ? v.getPaintRect() : null;
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
    var g;
    do {
      g = !1;
      for (var h = 0; h < o.length; ) {
        if (o[h].isZero()) {
          o.splice(h, 1);
          continue;
        }
        for (var p = h + 1; p < o.length; )
          o[h].intersect(o[p]) ? (g = !0, o[h].union(o[p]), o.splice(p, 1)) : p++;
        h++;
      }
    } while (g);
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
    function d(y, g, p, m) {
      if (o.clearRect(y, g, p, m), i && i !== "transparent") {
        var _ = void 0;
        if (Xo(i)) {
          var S = i.global || i.__width === p && i.__height === m;
          _ = S && i.__canvasGradient || Hu(o, i, {
            x: 0,
            y: 0,
            width: p,
            height: m
          }), i.__canvasGradient = _, i.__width = p, i.__height = m;
        } else W_(i) && (i.scaleX = i.scaleX || h, i.scaleY = i.scaleY || h, _ = $u(o, i, {
          dirty: function() {
            v.setUnpainted(), v.painter.refresh();
          }
        }));
        o.save(), o.fillStyle = _ || i, o.fillRect(y, g, p, m), o.restore();
      }
      u && (o.save(), o.globalAlpha = f, o.drawImage(c, y, g, p, m), o.restore());
    }
    !n || u ? d(0, 0, s, l) : n.length && C(n, function(y) {
      d(y.x * h, y.y * h, y.width * h, y.height * h);
    });
  }, t;
})(Ae), dp = 1e5, Or = 314159, to = 0.01, GA = 1e-3;
function WA(r) {
  return r ? r.__builtin__ ? !0 : !(typeof r.resize != "function" || typeof r.refresh != "function") : !1;
}
function UA(r, t) {
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
var YA = (function() {
  function r(t, e, i, n) {
    this.type = "canvas", this._zlevelList = [], this._prevDisplayList = [], this._layers = {}, this._layerConfig = {}, this._needsManuallyCompositing = !1, this.type = "canvas";
    var a = !t.nodeName || t.nodeName.toUpperCase() === "CANVAS";
    this._opts = i = k({}, i || {}), this.dpr = i.devicePixelRatio || Do, this._singleCanvas = a, this.root = t;
    var o = t.style;
    o && (Ip(t), t.innerHTML = ""), this.storage = e;
    var s = this._zlevelList;
    this._prevDisplayList = [];
    var l = this._layers;
    if (a) {
      var f = t, h = f.width, v = f.height;
      i.width != null && (h = i.width), i.height != null && (v = i.height), this.dpr = i.devicePixelRatio || 1, f.width = h * this.dpr, f.height = v * this.dpr, this._width = h, this._height = v;
      var c = new jl(f, this, this.dpr);
      c.__builtin__ = !0, c.initContext(), l[Or] = c, c.zlevel = Or, s.push(Or), this._domRoot = t;
    } else {
      this._width = $a(t, 0, i), this._height = $a(t, 1, i);
      var u = this._domRoot = UA(this._width, this._height);
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
        s.__inHover && (i || (i = this._hoverlayer = this.getLayer(dp)), a || (a = i.ctx, a.save()), Hr(a, s, n, o === e - 1));
      }
      a && a.restore();
    }
  }, r.prototype.getHoverLayer = function() {
    return this.getLayer(dp);
  }, r.prototype.paintOne = function(t, e) {
    zy(t, e);
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
        So(function() {
          l._paintList(t, e, i, n);
        });
      }
    }
  }, r.prototype._compositeManually = function() {
    var t = this.getLayer(Or).ctx, e = this._domRoot.width, i = this._domRoot.height;
    t.clearRect(0, 0, e, i), this.eachBuiltinLayer(function(n) {
      n.virtual && t.drawImage(n.dom, 0, 0, e, i);
    });
  }, r.prototype._doPaintList = function(t, e, i) {
    for (var n = this, a = [], o = this._opts.useDirtyRect, s = 0; s < this._zlevelList.length; s++) {
      var l = this._zlevelList[s], u = this._layers[l];
      u.__builtin__ && u !== this._hoverlayer && (u.__dirty || i) && a.push(u);
    }
    for (var f = !0, h = !1, v = function(y) {
      var g = a[y], p = g.ctx, m = o && g.createRepaintRects(t, e, c._width, c._height), _ = i ? g.__startIndex : g.__drawIndex, S = !i && g.incremental && Date.now, b = S && Date.now(), w = g.zlevel === c._zlevelList[0] ? c._backgroundColor : null;
      if (g.__startIndex === g.__endIndex)
        g.clear(!1, w, m);
      else if (_ === g.__startIndex) {
        var x = t[_];
        (!x.incremental || !x.notClear || i) && g.clear(!1, w, m);
      }
      _ === -1 && (console.error("For some unknown reason. drawIndex is -1"), _ = g.__startIndex);
      var T, D = function(P) {
        var I = {
          inHover: !1,
          allClipped: !1,
          prevEl: null,
          viewWidth: n._width,
          viewHeight: n._height
        };
        for (T = _; T < g.__endIndex; T++) {
          var E = t[T];
          if (E.__inHover && (h = !0), n._doPaintEl(E, g, o, P, I, T === g.__endIndex - 1), S) {
            var R = Date.now() - b;
            if (R > 15)
              break;
          }
        }
        I.prevElClipPaths && p.restore();
      };
      if (m)
        if (m.length === 0)
          T = g.__endIndex;
        else
          for (var A = c.dpr, M = 0; M < m.length; ++M) {
            var L = m[M];
            p.save(), p.beginPath(), p.rect(L.x * A, L.y * A, L.width * A, L.height * A), p.clip(), D(L), p.restore();
          }
      else
        p.save(), D(), p.restore();
      g.__drawIndex = T, g.__drawIndex < g.__endIndex && (f = !1);
    }, c = this, d = 0; d < a.length; d++)
      v(d);
    return U.wxa && C(this._layers, function(y) {
      y && y.ctx && y.ctx.draw && y.ctx.draw();
    }), {
      finished: f,
      needsRefreshHover: h
    };
  }, r.prototype._doPaintEl = function(t, e, i, n, a, o) {
    var s = e.ctx;
    if (i) {
      var l = t.getPaintRect();
      (!n || l && l.intersect(n)) && (Hr(s, t, a, o), t.setPrevPaintRect(l));
    } else
      Hr(s, t, a, o);
  }, r.prototype.getLayer = function(t, e) {
    this._singleCanvas && !this._needsManuallyCompositing && (t = Or);
    var i = this._layers[t];
    return i || (i = new jl("zr_" + t, this, this.dpr), i.zlevel = t, i.__builtin__ = !0, this._layerConfig[t] ? Q(i, this._layerConfig[t], !0) : this._layerConfig[t - to] && Q(i, this._layerConfig[t - to], !0), e && (i.virtual = e), this.insertLayer(t, i), i.initContext()), i;
  }, r.prototype.insertLayer = function(t, e) {
    var i = this._layers, n = this._zlevelList, a = n.length, o = this._domRoot, s = null, l = -1;
    if (!i[t] && WA(e)) {
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
      s !== u && (s = u, o = 0), n.incremental ? (f = this.getLayer(u + GA, this._needsManuallyCompositing), f.incremental = !0, o = 1) : f = this.getLayer(u + (o > 0 ? to : 0), this._needsManuallyCompositing), f.__builtin__ || gf("ZLevel " + u + " has been used by unkown layer " + f.id), f !== a && (f.__used = !0, f.__startIndex !== l && (f.__dirty = !0), f.__startIndex = l, f.incremental ? f.__drawIndex = -1 : f.__drawIndex = l, e(l), a = f), n.__dirty & Xt && !n.__inHover && (f.__dirty = !0, f.incremental && f.__drawIndex < 0 && (f.__drawIndex = l));
    }
    e(l), this.eachBuiltinLayer(function(h, v) {
      !h.__used && h.getElementCount() > 0 && (h.__dirty = !0, h.__startIndex = h.__endIndex = h.__drawIndex = 0), h.__dirty && h.__drawIndex < 0 && (h.__drawIndex = h.__startIndex);
    });
  }, r.prototype.clear = function() {
    return this.eachBuiltinLayer(this._clearLayer), this;
  }, r.prototype._clearLayer = function(t) {
    t.clear();
  }, r.prototype.setBackgroundColor = function(t) {
    this._backgroundColor = t, C(this._layers, function(e) {
      e.setUnpainted();
    });
  }, r.prototype.configLayer = function(t, e) {
    if (e) {
      var i = this._layerConfig;
      i[t] ? Q(i[t], e, !0) : i[t] = e;
      for (var n = 0; n < this._zlevelList.length; n++) {
        var a = this._zlevelList[n];
        if (a === t || a === t + to) {
          var o = this._layers[a];
          Q(o, i[t], !0);
        }
      }
    }
  }, r.prototype.delLayer = function(t) {
    var e = this._layers, i = this._zlevelList, n = e[t];
    n && (n.dom.parentNode.removeChild(n.dom), delete e[t], i.splice(et(i, t), 1));
  }, r.prototype.resize = function(t, e) {
    if (this._domRoot.style) {
      var i = this._domRoot;
      i.style.display = "none";
      var n = this._opts, a = this.root;
      if (t != null && (n.width = t), e != null && (n.height = e), t = $a(a, 0, n), e = $a(a, 1, n), i.style.display = "", this._width !== t || e !== this._height) {
        i.style.width = t + "px", i.style.height = e + "px";
        for (var o in this._layers)
          this._layers.hasOwnProperty(o) && this._layers[o].resize(t, e);
        this.refresh(!0);
      }
      this._width = t, this._height = e;
    } else {
      if (t == null || e == null)
        return;
      this._width = t, this._height = e, this.getLayer(Or).resize(t, e);
    }
    return this;
  }, r.prototype.clearLayer = function(t) {
    var e = this._layers[t];
    e && e.clear();
  }, r.prototype.dispose = function() {
    this.root.innerHTML = "", this.root = this.storage = this._domRoot = this._layers = null;
  }, r.prototype.getRenderedCanvas = function(t) {
    if (t = t || {}, this._singleCanvas && !this._compositeManually)
      return this._layers[Or].dom;
    var e = new jl("image", this, t.pixelRatio || this.dpr);
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
        Hr(i, f, o, l === u - 1);
      }
    return e.dom;
  }, r.prototype.getWidth = function() {
    return this._width;
  }, r.prototype.getHeight = function() {
    return this._height;
  }, r;
})();
function XA(r) {
  r.registerPainter("canvas", YA);
}
ur([
  UD,
  JM,
  _A,
  VA,
  EA,
  DA,
  XA
]);
class ZA {
  constructor(t) {
    this.container = t, this.instance = YT(t), this.resizeObserver = new ResizeObserver(() => {
      var e;
      (e = this.instance) == null || e.resize();
    }), this.resizeObserver.observe(t);
  }
  destroy() {
    var t;
    this.resizeObserver.disconnect(), (t = this.instance) == null || t.dispose(), this.instance = void 0;
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
  /**
   * Resolve primary color from config or theme CSS variables (T005).
   */
  resolveColor(t) {
    if (t.trim()) return t;
    const e = this.container.closest(".ehc-card") ?? this.container.closest("ha-card") ?? this.container, i = getComputedStyle(e), n = i.getPropertyValue("--accent-color").trim();
    if (n) return n;
    const a = i.getPropertyValue("--primary-color").trim();
    return a || "#03a9f4";
  }
  /**
   * Get theme colors from CSS variables (T005).
   */
  getThemeColors() {
    const t = this.container.closest(".ehc-card") ?? this.container.closest("ha-card") ?? this.container, e = getComputedStyle(t), i = e.getPropertyValue("--secondary-text-color").trim() || "#727272", n = e.getPropertyValue("--divider-color").trim() || "rgba(127, 127, 127, 0.3)";
    return {
      referenceLine: i,
      grid: n
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
   * Build EChart option configuration (T008–T012).
   * Handles chart layout, axes, legend, tooltip, and series data.
   */
  buildOption(t, e, i, n, a, o, s) {
    const l = Math.max(
      ...t.filter((p) => p !== null),
      ...e.filter((p) => p !== null),
      1
    ), u = this.niceMax(l, 4), f = [], h = Math.min(
      Math.max(n.fillCurrentOpacity, 0),
      100
    ) / 100, v = Math.min(
      Math.max(n.fillReferenceOpacity, 0),
      100
    ) / 100;
    f.push({
      name: a.current,
      type: "line",
      data: t.map((p, m) => p !== null ? [m, p] : null),
      lineStyle: { color: o, width: 1.5 },
      areaStyle: {
        opacity: n.fillCurrent ? h : 0
      },
      connectNulls: !1,
      showSymbol: !1,
      smooth: !1
    }), n.showForecast && e.some((p) => p !== null) && f.push({
      name: a.reference,
      type: "line",
      data: e.map((p, m) => p !== null ? [m, p] : null),
      lineStyle: { color: s.referenceLine, width: 1.5 },
      areaStyle: {
        opacity: n.fillReference ? v : 0
      },
      connectNulls: !1,
      showSymbol: !1,
      smooth: !1
    });
    const c = /* @__PURE__ */ new Date();
    c.setHours(0, 0, 0, 0);
    const d = c.getTime(), y = i.indexOf(d);
    if (y >= 0) {
      const p = t[y] ?? null, m = e[y] ?? null;
      let _;
      p !== null && m !== null ? _ = Math.max(p, m) : p !== null ? _ = p : m !== null && (_ = m);
      const S = [];
      _ !== void 0 ? S.push([{ coord: [y, _] }, { coord: [y, 0] }]) : S.push([{ xAxis: y }, { xAxis: y }]);
      const b = [];
      p !== null && b.push({
        coord: [y, p],
        symbol: "circle",
        symbolSize: 6,
        itemStyle: { color: o }
      }), f[0].markLine = {
        silent: !0,
        symbol: ["none", "none"],
        data: S,
        lineStyle: { type: "dashed", color: o, width: 1.5 }
      }, f[0].markPoint = {
        silent: !0,
        data: b
      }, f.length > 1 && m !== null && (f[1].markPoint = {
        silent: !0,
        data: [{
          coord: [y, m],
          symbol: "circle",
          symbolSize: 6,
          itemStyle: { color: s.referenceLine }
        }]
      }), n.showForecast && y >= 0 && p !== null && n.forecastTotal !== void 0 && f.push({
        type: "line",
        data: [[y, p], [i.length - 1, n.forecastTotal]],
        lineStyle: { type: "dashed", color: o, width: 1.5 },
        areaStyle: { opacity: 0 },
        showSymbol: !1,
        connectNulls: !1
      });
    } else
      f[0].markPoint = { silent: !0, data: [] }, f[0].markLine = { silent: !0, symbol: ["none", "none"], data: [], lineStyle: { type: "dashed", color: o, width: 1.5 } }, f.length > 1 && (f[1].markPoint = { silent: !0, data: [] });
    return {
      animation: !1,
      grid: { containLabel: !0 },
      legend: { show: !0 },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        appendTo: this.container
      },
      xAxis: {
        type: "value",
        min: 0,
        max: i.length - 1,
        interval: 1,
        boundaryGap: !1,
        splitLine: { show: !1 }
      },
      yAxis: {
        type: "value",
        min: 0,
        max: u,
        splitNumber: 4,
        axisLabel: {
          formatter: (p) => p === u ? `${p} ${n.unit}` : String(p)
        }
      },
      series: f
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
    ) : new Array(e.length).fill(null), s = JSON.stringify({
      c: a,
      r: o,
      cfg: i
    });
    if (this.lastHash === s)
      return;
    this.lastHash = s;
    const l = this.resolveColor(i.primaryColor), u = this.getThemeColors(), f = this.buildOption(
      a,
      o,
      e,
      i,
      n,
      l,
      u
    );
    this.instance.setOption(f, { notMerge: !0 });
  }
}
const qA = {
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
}, KA = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: qA
}, Symbol.toStringTag, { value: "Module" })), QA = {
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
}, jA = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: QA
}, Symbol.toStringTag, { value: "Module" })), JA = {
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
}, tL = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: JA
}, Symbol.toStringTag, { value: "Module" })), Jl = "error.missing_translation", ki = "en", pp = /* @__PURE__ */ Object.assign({
  "../translations/de.json": KA,
  "../translations/en.json": jA,
  "../translations/pl.json": tL
}), Gn = /* @__PURE__ */ Object.create(null);
for (const r of Object.keys(pp)) {
  const t = r.match(/\/([^/]+)\.json$/);
  if (t) {
    const e = t[1], i = pp[r], n = i == null ? void 0 : i.default;
    n && typeof n == "object" && (Gn[e] = n);
  }
}
const eL = [
  "comma",
  "decimal",
  "language",
  "system"
];
function rL(r) {
  return typeof r == "string" && eL.includes(r);
}
function iL(r) {
  return Object.prototype.hasOwnProperty.call(Gn, r);
}
function nL(r, t) {
  return t ? r.replace(/\{\{(\w+)\}\}/g, (e, i) => {
    const n = t[i];
    return n === void 0 ? e : String(n);
  }) : r;
}
function eo(r, t) {
  var s, l, u;
  const e = t.language, i = e !== void 0 && e !== "" ? iL(e) ? e : (t.debug && console.warn(
    `[Energy Horizon] Unsupported config.language "${e}", falling back to "${ki}"`
  ), ki) : ((s = r == null ? void 0 : r.locale) == null ? void 0 : s.language) || (r == null ? void 0 : r.language) || ki, n = t.number_format, a = n !== void 0 ? rL(n) ? n : (t.debug && console.warn(
    `[Energy Horizon] Invalid config.number_format "${String(n)}", falling back to "system"`
  ), "system") : ((l = r == null ? void 0 : r.locale) == null ? void 0 : l.number_format) ?? "system", o = ((u = r == null ? void 0 : r.config) == null ? void 0 : u.time_zone) || // fall back to UTC if HA does not provide a time zone
  "UTC";
  return {
    language: i,
    numberFormat: a,
    timeZone: o
  };
}
function aL(r, t) {
  switch (r) {
    case "comma":
      return "de";
    case "decimal":
      return "en";
    case "language":
      return t;
    case "system":
    default:
      return typeof navigator < "u" && navigator.language ? navigator.language : t || ki;
  }
}
function tu(r) {
  const t = Gn[r] ?? Gn[ki] ?? {}, e = Gn[ki] ?? {};
  return (i, n) => {
    let a = t[i];
    return a === void 0 && (a = e[i]), a === void 0 ? i : nL(a, n);
  };
}
const oL = r_`
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
    height: 290px;
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
function gp(r, t, e) {
  return r > 0 ? `+${t.format(r)} ${e}` : r < 0 ? `−${t.format(Math.abs(r))} ${e}` : `${t.format(0)} ${e}`;
}
function yp(r, t, e) {
  return t === "year_over_year" ? String(r.getFullYear()) : t === "month_over_year" ? new Intl.DateTimeFormat(e, { month: "long", year: "numeric" }).format(r) : "";
}
function ro(r) {
  const t = Number(r);
  return !Number.isFinite(t) || t < 0 || t > 100 ? 30 : t;
}
const Wo = class Wo extends Mn {
  constructor() {
    super(...arguments), this._state = { status: "loading" };
  }
  _localizeOrError(t, e, i) {
    var a;
    const n = t(e, i);
    if (n === e) {
      (a = this._config) != null && a.debug && console.warn(
        `[Energy Horizon] Missing translation key: "${e}" (language: "${eo(
          this.hass,
          this._config
        ).language}")`
      ), this._state = {
        status: "error",
        errorMessage: Jl
      };
      const o = t(Jl, { key: e });
      return o === Jl ? e : o;
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
        e && (this._chartRenderer = new ZA(e));
      }
      if (this._chartRenderer && this._state.period) {
        const e = eo(this.hass, this._config), i = tu(e.language), n = this._computeFullEnd(this._state.period), a = b_(this._state.period, n), o = this._buildRendererConfig();
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
    const t = /* @__PURE__ */ new Date(), e = eo(this.hass, this._config), i = tu(e.language), n = x_(this._config, t, e.timeZone), a = Eh(n, this._config.entity), o = {
      ...n,
      current_start: n.reference_start,
      current_end: n.reference_end
    }, s = Eh(o, this._config.entity);
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
        const S = (h == null ? void 0 : h.result) ?? h, b = S.results ?? S;
        if (console.log("[Energy Horizon] API Response (current, raw):", h), b && typeof b == "object") {
          const w = Object.keys(b);
          console.log(
            "[Energy Horizon] Results keys (available statistic_ids):",
            w
          );
          const x = b[this._config.entity];
          console.log(
            `[Energy Horizon] Data for entity "${this._config.entity}":`,
            x ? `${Array.isArray(x) ? x.length : 0} points` : "not found"
          ), console.log(
            "[Energy Horizon] Reference API Response (raw):",
            v
          );
        } else
          console.log(
            "[Energy Horizon] No results in response or invalid structure"
          );
      }
      const c = Rh(
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
      const d = Rh(
        v,
        this._config.entity,
        i("period.reference")
      ), y = ((f = (u = (l = this.hass.states) == null ? void 0 : l[this._config.entity]) == null ? void 0 : u.attributes) == null ? void 0 : f.unit_of_measurement) ?? "", g = {
        current: y ? { ...c, unit: c.unit || y } : c,
        reference: d ? y ? { ...d, unit: d.unit || y } : d : void 0,
        aggregation: n.aggregation,
        time_zone: n.time_zone
      }, p = D_(g), m = M_(g);
      !p.unit && y && (p.unit = y), m && !m.unit && y && (m.unit = y);
      const _ = A_(p);
      this._state = {
        status: "ready",
        comparisonSeries: g,
        summary: p,
        forecast: m,
        textSummary: _,
        period: n
      };
    } catch (h) {
      console.error(h), this._state = {
        status: "error",
        errorMessage: "status.error_api"
      };
    }
  }
  _computeFullEnd(t) {
    return this._config.comparison_mode === "year_over_year" ? new Date(t.current_start.getFullYear(), 11, 31) : new Date(t.current_start.getFullYear(), t.current_start.getMonth() + 1, 0);
  }
  _buildRendererConfig() {
    var o, s, l, u, f, h, v;
    if (!this._state.period)
      return {
        primaryColor: this._config.primary_color ?? "",
        fillCurrent: this._config.fill_current ?? !0,
        fillReference: this._config.fill_reference ?? !1,
        fillCurrentOpacity: ro(this._config.fill_current_opacity),
        fillReferenceOpacity: ro(this._config.fill_reference_opacity),
        showForecast: this._config.show_forecast ?? !1,
        forecastTotal: (o = this._state.forecast) == null ? void 0 : o.forecast_total,
        unit: ((s = this._state.forecast) == null ? void 0 : s.unit) ?? "",
        periodLabel: ""
      };
    const t = this._state.period, e = this._config.language ?? ((l = this.hass) == null ? void 0 : l.language) ?? "en";
    let i = "";
    this._config.comparison_mode === "year_over_year" ? i = String(t.current_start.getFullYear()) : i = new Intl.DateTimeFormat(e, { month: "long" }).format(t.current_start);
    const n = (f = (u = this.hass) == null ? void 0 : u.states) == null ? void 0 : f[this._config.entity], a = ((h = n == null ? void 0 : n.attributes) == null ? void 0 : h.unit_of_measurement) ?? "";
    return {
      primaryColor: this._config.primary_color ?? "",
      fillCurrent: this._config.fill_current ?? !0,
      fillReference: this._config.fill_reference ?? !1,
      fillCurrentOpacity: ro(this._config.fill_current_opacity),
      fillReferenceOpacity: ro(this._config.fill_reference_opacity),
      showForecast: this._config.show_forecast ?? !1,
      forecastTotal: (v = this._state.forecast) == null ? void 0 : v.forecast_total,
      unit: a,
      periodLabel: i,
      referencePeriodStart: t.reference_start.getTime()
    };
  }
  render() {
    var L, P, I, E, R, W, B, F;
    if (!this._config || !this.hass)
      return Tt``;
    const t = eo(this.hass, this._config), e = tu(t.language);
    if (this._state.status === "loading")
      return Tt`<ha-card class="ebc-card">
        <div class="loading">
          <ha-circular-progress active size="small"></ha-circular-progress>
          <span>${this._localizeOrError(e, "status.loading")}</span>
        </div>
      </ha-card>`;
    if (this._state.status === "error") {
      const G = this._state.errorMessage ?? "status.error_generic";
      return Tt`<ha-card class="ebc-card">
        <ha-alert alert-type="error">
          ${this._localizeOrError(e, G)}
        </ha-alert>
      </ha-card>`;
    }
    if (this._state.status === "no-data")
      return Tt`<ha-card class="ebc-card">
        <ha-alert alert-type="info">
          ${this._localizeOrError(e, "status.no_data")}
        </ha-alert>
      </ha-card>`;
    const i = this._state.textSummary, n = this._state.summary, a = this._state.forecast, o = this._config.show_title !== !1, s = (P = (L = this.hass) == null ? void 0 : L.states) == null ? void 0 : P[this._config.entity], l = ((I = this._config.title) == null ? void 0 : I.trim()) || (s == null ? void 0 : s.attributes.friendly_name) || this._config.entity, u = this._config.show_icon !== !1, f = ((E = this._config.icon) == null ? void 0 : E.trim()) || void 0, v = o && !!l || u && (!!f || !!s), c = aL(
      t.numberFormat,
      t.language
    ), d = this._config.precision ?? 1, y = ((B = (W = (R = this.hass.states) == null ? void 0 : R[this._config.entity]) == null ? void 0 : W.attributes) == null ? void 0 : B.unit_of_measurement) ?? "", g = new Intl.NumberFormat(c, {
      minimumFractionDigits: d,
      maximumFractionDigits: d
    }), p = new Intl.NumberFormat(c, {
      maximumFractionDigits: 1
    }), m = (n == null ? void 0 : n.unit) || y;
    let _ = this._localizeOrError(e, "summary.current_period"), S = this._localizeOrError(e, "summary.reference_period");
    if (this._state.status === "ready" && this._state.period) {
      const G = this._config.language ?? ((F = this.hass) == null ? void 0 : F.language) ?? "en", it = yp(this._state.period.current_start, this._config.comparison_mode, G), j = yp(this._state.period.reference_start, this._config.comparison_mode, G);
      _ = `${_} (${it})`, S = `${S} (${j})`;
    }
    const b = n != null ? `${g.format(n.current_cumulative)} ${m}` : "", w = n != null && n.reference_cumulative != null ? `${g.format(n.reference_cumulative)} ${m}` : null, x = n != null && n.difference != null ? gp(n.difference, g, m) : null, T = n != null && n.differencePercent != null ? gp(n.differencePercent, p, "%") : null, D = a != null && a.enabled && this._config.show_forecast !== !1, A = (a == null ? void 0 : a.unit) || m;
    let M = null;
    if (i) {
      const G = i.diffValue != null ? `${g.format(i.diffValue)} ${m}` : void 0;
      switch (i.trend) {
        case "higher":
          M = this._localizeOrError(
            e,
            "text_summary.higher",
            G ? { diff: G } : void 0
          );
          break;
        case "lower":
          M = this._localizeOrError(
            e,
            "text_summary.lower",
            G ? { diff: G } : void 0
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
    return Tt`<ha-card class="ebc-card">
      <div class="content ebc-content">
        ${v ? Tt`<div class="ebc-title-row">
              ${u ? f ? Tt`<ha-icon class="ebc-icon" .icon=${f}></ha-icon>` : s ? Tt`<ha-state-icon
                        class="ebc-icon"
                        .hass=${this.hass}
                        .stateObj=${s}
                      ></ha-state-icon>` : null : null}
              ${o && l ? Tt`<span class="ebc-title">${l}</span>` : null}
            </div>` : null}

        ${M ? Tt`<div class="heading ebc-header">${M}</div>` : null}

        ${n ? Tt`<div class="summary ebc-stats">
              <div class="summary-row">
                <span class="label">${_}</span>
                <span class="value">${b}</span>
              </div>

              ${w ? Tt`<div class="summary-row">
                    <span class="label">${S}</span>
                    <span class="value">${w}</span>
                  </div>` : null}

              ${x ? Tt`<div class="summary-row">
                    <span class="label"
                      >${this._localizeOrError(e, "summary.difference")}</span
                    >
                    <span class="value">${x}</span>
                  </div>` : null}

              ${T ? Tt`<div class="summary-row">
                    <span class="label"
                      >${this._localizeOrError(
      e,
      "summary.difference_percent"
    )}</span
                    >
                    <span class="value">${T}</span>
                  </div>` : null}

              ${n.reference_cumulative == null ? Tt`<div class="summary-note">
                    ${this._localizeOrError(
      e,
      "summary.incomplete_reference"
    )}
                  </div>` : null}
            </div>` : null}

        ${D && a ? Tt`<div class="forecast ebc-forecast">
              <div class="summary-row">
                <span class="label"
                  >${this._localizeOrError(
      e,
      "forecast.current_forecast"
    )}</span
                >
                <span class="value"
                  >${g.format(
      a.forecast_total ?? 0
    )} ${A}</span
                >
              </div>
              ${a.reference_total != null ? Tt`<div class="summary-row">
                    <span class="label"
                      >${this._localizeOrError(
      e,
      "forecast.reference_consumption"
    )}</span
                    >
                    <span class="value"
                      >${g.format(
      a.reference_total
    )} ${A}</span
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
};
Wo.properties = {
  hass: { type: Object, attribute: !1 },
  _config: { state: !0 },
  _state: { state: !0 }
}, Wo.styles = oL;
let uf = Wo;
customElements.define("energy-horizon-card", uf);
//# sourceMappingURL=energy-horizon-card.js.map
