var Io = Object.defineProperty;
var $o = (n, t, e) => t in n ? Io(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e;
var y = (n, t, e) => $o(n, typeof t != "symbol" ? t + "" : t, e);
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const dn = globalThis, pi = dn.ShadowRoot && (dn.ShadyCSS === void 0 || dn.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, bi = Symbol(), Ri = /* @__PURE__ */ new WeakMap();
let br = class {
  constructor(t, e, i) {
    if (this._$cssResult$ = !0, i !== bi) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (pi && t === void 0) {
      const i = e !== void 0 && e.length === 1;
      i && (t = Ri.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && Ri.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Lo = (n) => new br(typeof n == "string" ? n : n + "", void 0, bi), Fo = (n, ...t) => {
  const e = n.length === 1 ? n[0] : t.reduce((i, s, r) => i + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s) + n[r + 1], n[0]);
  return new br(e, n, bi);
}, Ro = (n, t) => {
  if (pi) n.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const i = document.createElement("style"), s = dn.litNonce;
    s !== void 0 && i.setAttribute("nonce", s), i.textContent = e.cssText, n.appendChild(i);
  }
}, Hi = pi ? (n) => n : (n) => n instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const i of t.cssRules) e += i.cssText;
  return Lo(e);
})(n) : n;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Ho, defineProperty: zo, getOwnPropertyDescriptor: No, getOwnPropertyNames: Wo, getOwnPropertySymbols: Bo, getPrototypeOf: Yo } = Object, St = globalThis, zi = St.trustedTypes, jo = zi ? zi.emptyScript : "", Rn = St.reactiveElementPolyfillSupport, Me = (n, t) => n, ti = { toAttribute(n, t) {
  switch (t) {
    case Boolean:
      n = n ? jo : null;
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
} }, yr = (n, t) => !Ho(n, t), Ni = { attribute: !0, type: String, converter: ti, reflect: !1, useDefault: !1, hasChanged: yr };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), St.litPropertyMetadata ?? (St.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let te = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = Ni) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const i = Symbol(), s = this.getPropertyDescriptor(t, i, e);
      s !== void 0 && zo(this.prototype, t, s);
    }
  }
  static getPropertyDescriptor(t, e, i) {
    const { get: s, set: r } = No(this.prototype, t) ?? { get() {
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
    return this.elementProperties.get(t) ?? Ni;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Me("elementProperties"))) return;
    const t = Yo(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Me("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Me("properties"))) {
      const e = this.properties, i = [...Wo(e), ...Bo(e)];
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
      for (const s of i) e.unshift(Hi(s));
    } else t !== void 0 && e.push(Hi(t));
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
    return Ro(t, this.constructor.elementStyles), t;
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
      const o = (((r = i.converter) == null ? void 0 : r.toAttribute) !== void 0 ? i.converter : ti).toAttribute(e, i.type);
      this._$Em = t, o == null ? this.removeAttribute(s) : this.setAttribute(s, o), this._$Em = null;
    }
  }
  _$AK(t, e) {
    var r, o;
    const i = this.constructor, s = i._$Eh.get(t);
    if (s !== void 0 && this._$Em !== s) {
      const a = i.getPropertyOptions(s), c = typeof a.converter == "function" ? { fromAttribute: a.converter } : ((r = a.converter) == null ? void 0 : r.fromAttribute) !== void 0 ? a.converter : ti;
      this._$Em = s;
      const l = c.fromAttribute(e, a.type);
      this[s] = l ?? ((o = this._$Ej) == null ? void 0 : o.get(s)) ?? l, this._$Em = null;
    }
  }
  requestUpdate(t, e, i, s = !1, r) {
    var o;
    if (t !== void 0) {
      const a = this.constructor;
      if (s === !1 && (r = this[t]), i ?? (i = a.getPropertyOptions(t)), !((i.hasChanged ?? yr)(r, e) || i.useDefault && i.reflect && r === ((o = this._$Ej) == null ? void 0 : o.get(t)) && !this.hasAttribute(a._$Eu(t, i)))) return;
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
te.elementStyles = [], te.shadowRootOptions = { mode: "open" }, te[Me("elementProperties")] = /* @__PURE__ */ new Map(), te[Me("finalized")] = /* @__PURE__ */ new Map(), Rn == null || Rn({ ReactiveElement: te }), (St.reactiveElementVersions ?? (St.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ke = globalThis, Wi = (n) => n, bn = ke.trustedTypes, Bi = bn ? bn.createPolicy("lit-html", { createHTML: (n) => n }) : void 0, _r = "$lit$", vt = `lit$${Math.random().toFixed(9).slice(2)}$`, xr = "?" + vt, Vo = `<${xr}>`, Vt = document, Ie = () => Vt.createComment(""), $e = (n) => n === null || typeof n != "object" && typeof n != "function", yi = Array.isArray, Uo = (n) => yi(n) || typeof (n == null ? void 0 : n[Symbol.iterator]) == "function", Hn = `[ 	
\f\r]`, ue = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Yi = /-->/g, ji = />/g, It = RegExp(`>|${Hn}(?:([^\\s"'>=/]+)(${Hn}*=${Hn}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Vi = /'/g, Ui = /"/g, wr = /^(?:script|style|textarea|title)$/i, qo = (n) => (t, ...e) => ({ _$litType$: n, strings: t, values: e }), et = qo(1), ie = Symbol.for("lit-noChange"), V = Symbol.for("lit-nothing"), qi = /* @__PURE__ */ new WeakMap(), Nt = Vt.createTreeWalker(Vt, 129);
function vr(n, t) {
  if (!yi(n) || !n.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Bi !== void 0 ? Bi.createHTML(t) : t;
}
const Xo = (n, t) => {
  const e = n.length - 1, i = [];
  let s, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = ue;
  for (let a = 0; a < e; a++) {
    const c = n[a];
    let l, h, u = -1, d = 0;
    for (; d < c.length && (o.lastIndex = d, h = o.exec(c), h !== null); ) d = o.lastIndex, o === ue ? h[1] === "!--" ? o = Yi : h[1] !== void 0 ? o = ji : h[2] !== void 0 ? (wr.test(h[2]) && (s = RegExp("</" + h[2], "g")), o = It) : h[3] !== void 0 && (o = It) : o === It ? h[0] === ">" ? (o = s ?? ue, u = -1) : h[1] === void 0 ? u = -2 : (u = o.lastIndex - h[2].length, l = h[1], o = h[3] === void 0 ? It : h[3] === '"' ? Ui : Vi) : o === Ui || o === Vi ? o = It : o === Yi || o === ji ? o = ue : (o = It, s = void 0);
    const f = o === It && n[a + 1].startsWith("/>") ? " " : "";
    r += o === ue ? c + Vo : u >= 0 ? (i.push(l), c.slice(0, u) + _r + c.slice(u) + vt + f) : c + vt + (u === -2 ? a : f);
  }
  return [vr(n, r + (n[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class Le {
  constructor({ strings: t, _$litType$: e }, i) {
    let s;
    this.parts = [];
    let r = 0, o = 0;
    const a = t.length - 1, c = this.parts, [l, h] = Xo(t, e);
    if (this.el = Le.createElement(l, i), Nt.currentNode = this.el.content, e === 2 || e === 3) {
      const u = this.el.content.firstChild;
      u.replaceWith(...u.childNodes);
    }
    for (; (s = Nt.nextNode()) !== null && c.length < a; ) {
      if (s.nodeType === 1) {
        if (s.hasAttributes()) for (const u of s.getAttributeNames()) if (u.endsWith(_r)) {
          const d = h[o++], f = s.getAttribute(u).split(vt), g = /([.?@])?(.*)/.exec(d);
          c.push({ type: 1, index: r, name: g[2], strings: f, ctor: g[1] === "." ? Go : g[1] === "?" ? Ko : g[1] === "@" ? Zo : Tn }), s.removeAttribute(u);
        } else u.startsWith(vt) && (c.push({ type: 6, index: r }), s.removeAttribute(u));
        if (wr.test(s.tagName)) {
          const u = s.textContent.split(vt), d = u.length - 1;
          if (d > 0) {
            s.textContent = bn ? bn.emptyScript : "";
            for (let f = 0; f < d; f++) s.append(u[f], Ie()), Nt.nextNode(), c.push({ type: 2, index: ++r });
            s.append(u[d], Ie());
          }
        }
      } else if (s.nodeType === 8) if (s.data === xr) c.push({ type: 2, index: r });
      else {
        let u = -1;
        for (; (u = s.data.indexOf(vt, u + 1)) !== -1; ) c.push({ type: 7, index: r }), u += vt.length - 1;
      }
      r++;
    }
  }
  static createElement(t, e) {
    const i = Vt.createElement("template");
    return i.innerHTML = t, i;
  }
}
function se(n, t, e = n, i) {
  var o, a;
  if (t === ie) return t;
  let s = i !== void 0 ? (o = e._$Co) == null ? void 0 : o[i] : e._$Cl;
  const r = $e(t) ? void 0 : t._$litDirective$;
  return (s == null ? void 0 : s.constructor) !== r && ((a = s == null ? void 0 : s._$AO) == null || a.call(s, !1), r === void 0 ? s = void 0 : (s = new r(n), s._$AT(n, e, i)), i !== void 0 ? (e._$Co ?? (e._$Co = []))[i] = s : e._$Cl = s), s !== void 0 && (t = se(n, s._$AS(n, t.values), s, i)), t;
}
class Qo {
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
    const { el: { content: e }, parts: i } = this._$AD, s = ((t == null ? void 0 : t.creationScope) ?? Vt).importNode(e, !0);
    Nt.currentNode = s;
    let r = Nt.nextNode(), o = 0, a = 0, c = i[0];
    for (; c !== void 0; ) {
      if (o === c.index) {
        let l;
        c.type === 2 ? l = new Be(r, r.nextSibling, this, t) : c.type === 1 ? l = new c.ctor(r, c.name, c.strings, this, t) : c.type === 6 && (l = new Jo(r, this, t)), this._$AV.push(l), c = i[++a];
      }
      o !== (c == null ? void 0 : c.index) && (r = Nt.nextNode(), o++);
    }
    return Nt.currentNode = Vt, s;
  }
  p(t) {
    let e = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, e), e += i.strings.length - 2) : i._$AI(t[e])), e++;
  }
}
class Be {
  get _$AU() {
    var t;
    return ((t = this._$AM) == null ? void 0 : t._$AU) ?? this._$Cv;
  }
  constructor(t, e, i, s) {
    this.type = 2, this._$AH = V, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = i, this.options = s, this._$Cv = (s == null ? void 0 : s.isConnected) ?? !0;
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
    t = se(this, t, e), $e(t) ? t === V || t == null || t === "" ? (this._$AH !== V && this._$AR(), this._$AH = V) : t !== this._$AH && t !== ie && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Uo(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== V && $e(this._$AH) ? this._$AA.nextSibling.data = t : this.T(Vt.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    var r;
    const { values: e, _$litType$: i } = t, s = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = Le.createElement(vr(i.h, i.h[0]), this.options)), i);
    if (((r = this._$AH) == null ? void 0 : r._$AD) === s) this._$AH.p(e);
    else {
      const o = new Qo(s, this), a = o.u(this.options);
      o.p(e), this.T(a), this._$AH = o;
    }
  }
  _$AC(t) {
    let e = qi.get(t.strings);
    return e === void 0 && qi.set(t.strings, e = new Le(t)), e;
  }
  k(t) {
    yi(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let i, s = 0;
    for (const r of t) s === e.length ? e.push(i = new Be(this.O(Ie()), this.O(Ie()), this, this.options)) : i = e[s], i._$AI(r), s++;
    s < e.length && (this._$AR(i && i._$AB.nextSibling, s), e.length = s);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    var i;
    for ((i = this._$AP) == null ? void 0 : i.call(this, !1, !0, e); t !== this._$AB; ) {
      const s = Wi(t).nextSibling;
      Wi(t).remove(), t = s;
    }
  }
  setConnected(t) {
    var e;
    this._$AM === void 0 && (this._$Cv = t, (e = this._$AP) == null || e.call(this, t));
  }
}
class Tn {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, i, s, r) {
    this.type = 1, this._$AH = V, this._$AN = void 0, this.element = t, this.name = e, this._$AM = s, this.options = r, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = V;
  }
  _$AI(t, e = this, i, s) {
    const r = this.strings;
    let o = !1;
    if (r === void 0) t = se(this, t, e, 0), o = !$e(t) || t !== this._$AH && t !== ie, o && (this._$AH = t);
    else {
      const a = t;
      let c, l;
      for (t = r[0], c = 0; c < r.length - 1; c++) l = se(this, a[i + c], e, c), l === ie && (l = this._$AH[c]), o || (o = !$e(l) || l !== this._$AH[c]), l === V ? t = V : t !== V && (t += (l ?? "") + r[c + 1]), this._$AH[c] = l;
    }
    o && !s && this.j(t);
  }
  j(t) {
    t === V ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Go extends Tn {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === V ? void 0 : t;
  }
}
class Ko extends Tn {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== V);
  }
}
class Zo extends Tn {
  constructor(t, e, i, s, r) {
    super(t, e, i, s, r), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = se(this, t, e, 0) ?? V) === ie) return;
    const i = this._$AH, s = t === V && i !== V || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, r = t !== V && (i === V || s);
    s && this.element.removeEventListener(this.name, this, i), r && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    var e;
    typeof this._$AH == "function" ? this._$AH.call(((e = this.options) == null ? void 0 : e.host) ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Jo {
  constructor(t, e, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    se(this, t);
  }
}
const zn = ke.litHtmlPolyfillSupport;
zn == null || zn(Le, Be), (ke.litHtmlVersions ?? (ke.litHtmlVersions = [])).push("3.3.2");
const ta = (n, t, e) => {
  const i = (e == null ? void 0 : e.renderBefore) ?? t;
  let s = i._$litPart$;
  if (s === void 0) {
    const r = (e == null ? void 0 : e.renderBefore) ?? null;
    i._$litPart$ = s = new Be(t.insertBefore(Ie(), r), r, void 0, e ?? {});
  }
  return s._$AI(n), s;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Yt = globalThis;
class De extends te {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = ta(e, this.renderRoot, this.renderOptions);
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
    return ie;
  }
}
var pr;
De._$litElement$ = !0, De.finalized = !0, (pr = Yt.litElementHydrateSupport) == null || pr.call(Yt, { LitElement: De });
const Nn = Yt.litElementPolyfillSupport;
Nn == null || Nn({ LitElement: De });
(Yt.litElementVersions ?? (Yt.litElementVersions = [])).push("4.2.2");
const ea = 5;
function na(n, t, e) {
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
function Xi(n, t) {
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
function Qi(n, t, e) {
  const i = n.result ?? n, s = i.results ?? i;
  if (!s || typeof s != "object") return;
  let r = s[t];
  if (!r || r.length === 0) {
    const l = Object.keys(s);
    l.length === 1 && (r = s[l[0]]);
  }
  if (!r || r.length === 0) return;
  const { unit: o, timeSeries: a } = ia(r);
  return sa(
    a,
    o,
    e
  );
}
function ia(n) {
  let t = "";
  const e = [];
  let i;
  for (const s of n) {
    let r;
    if (typeof s.change == "number")
      r = s.change;
    else if (typeof s.sum == "number")
      if (i === void 0) {
        i = s.sum;
        continue;
      } else {
        const o = s.sum - i;
        if (i = s.sum, !Number.isFinite(o) || o <= 0)
          continue;
        r = o;
      }
    else typeof s.state == "number" && (r = s.state);
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
function sa(n, t, e) {
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
function ra(n) {
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
function oa(n) {
  const t = n.current.points, e = t.length;
  if (e < ea)
    return {
      enabled: !1,
      unit: n.current.unit,
      confidence: "low"
    };
  const s = t[e - 1].value / e, r = new Date(t[0].timestamp), c = (new Date(t[e - 1].timestamp).getTime() - r.getTime()) / (1e3 * 60 * 60 * 24);
  let l;
  if (c > 200) {
    const d = r.getFullYear();
    l = d % 4 === 0 && d % 100 !== 0 || d % 400 === 0 ? 366 : 365;
  } else {
    const d = r.getFullYear(), f = r.getMonth();
    l = new Date(d, f + 1, 0).getDate();
  }
  const h = s * l;
  let u = "low";
  return e >= 14 ? u = "high" : e >= 7 && (u = "medium"), {
    enabled: !0,
    forecast_total: h,
    unit: n.current.unit,
    confidence: u
  };
}
function aa(n) {
  const { current_cumulative: t, reference_cumulative: e, difference: i, unit: s } = n;
  if (e == null || i == null)
    return {
      trend: "unknown",
      heading: "Brak wystarczających danych z wcześniejszego okresu, aby porównać zużycie."
    };
  const r = Math.abs(i), a = `${new Intl.NumberFormat(void 0, {
    maximumFractionDigits: 2
  }).format(r)} ${s}`;
  return r < 0.01 ? {
    trend: "similar",
    heading: "Twoje zużycie jest na podobnym poziomie jak w tym samym okresie w poprzednim roku."
  } : i > 0 ? {
    trend: "higher",
    heading: `Twoje zużycie jest o ${a} wyższe niż w tym samym okresie w poprzednim roku.`
  } : {
    trend: "lower",
    heading: `Twoje zużycie jest o ${a} niższe niż w tym samym okresie w poprzednim roku.`
  };
}
/*!
 * @kurkle/color v0.3.4
 * https://github.com/kurkle/color#readme
 * (c) 2024 Jukka Kurkela
 * Released under the MIT License
 */
function Ye(n) {
  return n + 0.5 | 0;
}
const Mt = (n, t, e) => Math.max(Math.min(n, e), t);
function xe(n) {
  return Mt(Ye(n * 2.55), 0, 255);
}
function Ot(n) {
  return Mt(Ye(n * 255), 0, 255);
}
function _t(n) {
  return Mt(Ye(n / 2.55) / 100, 0, 1);
}
function Gi(n) {
  return Mt(Ye(n * 100), 0, 100);
}
const st = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, a: 10, b: 11, c: 12, d: 13, e: 14, f: 15 }, ei = [..."0123456789ABCDEF"], ca = (n) => ei[n & 15], la = (n) => ei[(n & 240) >> 4] + ei[n & 15], Ke = (n) => (n & 240) >> 4 === (n & 15), ha = (n) => Ke(n.r) && Ke(n.g) && Ke(n.b) && Ke(n.a);
function ua(n) {
  var t = n.length, e;
  return n[0] === "#" && (t === 4 || t === 5 ? e = {
    r: 255 & st[n[1]] * 17,
    g: 255 & st[n[2]] * 17,
    b: 255 & st[n[3]] * 17,
    a: t === 5 ? st[n[4]] * 17 : 255
  } : (t === 7 || t === 9) && (e = {
    r: st[n[1]] << 4 | st[n[2]],
    g: st[n[3]] << 4 | st[n[4]],
    b: st[n[5]] << 4 | st[n[6]],
    a: t === 9 ? st[n[7]] << 4 | st[n[8]] : 255
  })), e;
}
const da = (n, t) => n < 255 ? t(n) : "";
function fa(n) {
  var t = ha(n) ? ca : la;
  return n ? "#" + t(n.r) + t(n.g) + t(n.b) + da(n.a, t) : void 0;
}
const ga = /^(hsla?|hwb|hsv)\(\s*([-+.e\d]+)(?:deg)?[\s,]+([-+.e\d]+)%[\s,]+([-+.e\d]+)%(?:[\s,]+([-+.e\d]+)(%)?)?\s*\)$/;
function Mr(n, t, e) {
  const i = t * Math.min(e, 1 - e), s = (r, o = (r + n / 30) % 12) => e - i * Math.max(Math.min(o - 3, 9 - o, 1), -1);
  return [s(0), s(8), s(4)];
}
function ma(n, t, e) {
  const i = (s, r = (s + n / 60) % 6) => e - e * t * Math.max(Math.min(r, 4 - r, 1), 0);
  return [i(5), i(3), i(1)];
}
function pa(n, t, e) {
  const i = Mr(n, 1, 0.5);
  let s;
  for (t + e > 1 && (s = 1 / (t + e), t *= s, e *= s), s = 0; s < 3; s++)
    i[s] *= 1 - t - e, i[s] += t;
  return i;
}
function ba(n, t, e, i, s) {
  return n === s ? (t - e) / i + (t < e ? 6 : 0) : t === s ? (e - n) / i + 2 : (n - t) / i + 4;
}
function _i(n) {
  const e = n.r / 255, i = n.g / 255, s = n.b / 255, r = Math.max(e, i, s), o = Math.min(e, i, s), a = (r + o) / 2;
  let c, l, h;
  return r !== o && (h = r - o, l = a > 0.5 ? h / (2 - r - o) : h / (r + o), c = ba(e, i, s, h, r), c = c * 60 + 0.5), [c | 0, l || 0, a];
}
function xi(n, t, e, i) {
  return (Array.isArray(t) ? n(t[0], t[1], t[2]) : n(t, e, i)).map(Ot);
}
function wi(n, t, e) {
  return xi(Mr, n, t, e);
}
function ya(n, t, e) {
  return xi(pa, n, t, e);
}
function _a(n, t, e) {
  return xi(ma, n, t, e);
}
function kr(n) {
  return (n % 360 + 360) % 360;
}
function xa(n) {
  const t = ga.exec(n);
  let e = 255, i;
  if (!t)
    return;
  t[5] !== i && (e = t[6] ? xe(+t[5]) : Ot(+t[5]));
  const s = kr(+t[2]), r = +t[3] / 100, o = +t[4] / 100;
  return t[1] === "hwb" ? i = ya(s, r, o) : t[1] === "hsv" ? i = _a(s, r, o) : i = wi(s, r, o), {
    r: i[0],
    g: i[1],
    b: i[2],
    a: e
  };
}
function wa(n, t) {
  var e = _i(n);
  e[0] = kr(e[0] + t), e = wi(e), n.r = e[0], n.g = e[1], n.b = e[2];
}
function va(n) {
  if (!n)
    return;
  const t = _i(n), e = t[0], i = Gi(t[1]), s = Gi(t[2]);
  return n.a < 255 ? `hsla(${e}, ${i}%, ${s}%, ${_t(n.a)})` : `hsl(${e}, ${i}%, ${s}%)`;
}
const Ki = {
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
}, Zi = {
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
function Ma() {
  const n = {}, t = Object.keys(Zi), e = Object.keys(Ki);
  let i, s, r, o, a;
  for (i = 0; i < t.length; i++) {
    for (o = a = t[i], s = 0; s < e.length; s++)
      r = e[s], a = a.replace(r, Ki[r]);
    r = parseInt(Zi[o], 16), n[a] = [r >> 16 & 255, r >> 8 & 255, r & 255];
  }
  return n;
}
let Ze;
function ka(n) {
  Ze || (Ze = Ma(), Ze.transparent = [0, 0, 0, 0]);
  const t = Ze[n.toLowerCase()];
  return t && {
    r: t[0],
    g: t[1],
    b: t[2],
    a: t.length === 4 ? t[3] : 255
  };
}
const Da = /^rgba?\(\s*([-+.\d]+)(%)?[\s,]+([-+.e\d]+)(%)?[\s,]+([-+.e\d]+)(%)?(?:[\s,/]+([-+.e\d]+)(%)?)?\s*\)$/;
function Pa(n) {
  const t = Da.exec(n);
  let e = 255, i, s, r;
  if (t) {
    if (t[7] !== i) {
      const o = +t[7];
      e = t[8] ? xe(o) : Mt(o * 255, 0, 255);
    }
    return i = +t[1], s = +t[3], r = +t[5], i = 255 & (t[2] ? xe(i) : Mt(i, 0, 255)), s = 255 & (t[4] ? xe(s) : Mt(s, 0, 255)), r = 255 & (t[6] ? xe(r) : Mt(r, 0, 255)), {
      r: i,
      g: s,
      b: r,
      a: e
    };
  }
}
function Sa(n) {
  return n && (n.a < 255 ? `rgba(${n.r}, ${n.g}, ${n.b}, ${_t(n.a)})` : `rgb(${n.r}, ${n.g}, ${n.b})`);
}
const Wn = (n) => n <= 31308e-7 ? n * 12.92 : Math.pow(n, 1 / 2.4) * 1.055 - 0.055, Zt = (n) => n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
function Oa(n, t, e) {
  const i = Zt(_t(n.r)), s = Zt(_t(n.g)), r = Zt(_t(n.b));
  return {
    r: Ot(Wn(i + e * (Zt(_t(t.r)) - i))),
    g: Ot(Wn(s + e * (Zt(_t(t.g)) - s))),
    b: Ot(Wn(r + e * (Zt(_t(t.b)) - r))),
    a: n.a + e * (t.a - n.a)
  };
}
function Je(n, t, e) {
  if (n) {
    let i = _i(n);
    i[t] = Math.max(0, Math.min(i[t] + i[t] * e, t === 0 ? 360 : 1)), i = wi(i), n.r = i[0], n.g = i[1], n.b = i[2];
  }
}
function Dr(n, t) {
  return n && Object.assign(t || {}, n);
}
function Ji(n) {
  var t = { r: 0, g: 0, b: 0, a: 255 };
  return Array.isArray(n) ? n.length >= 3 && (t = { r: n[0], g: n[1], b: n[2], a: 255 }, n.length > 3 && (t.a = Ot(n[3]))) : (t = Dr(n, { r: 0, g: 0, b: 0, a: 1 }), t.a = Ot(t.a)), t;
}
function Ta(n) {
  return n.charAt(0) === "r" ? Pa(n) : xa(n);
}
class Fe {
  constructor(t) {
    if (t instanceof Fe)
      return t;
    const e = typeof t;
    let i;
    e === "object" ? i = Ji(t) : e === "string" && (i = ua(t) || ka(t) || Ta(t)), this._rgb = i, this._valid = !!i;
  }
  get valid() {
    return this._valid;
  }
  get rgb() {
    var t = Dr(this._rgb);
    return t && (t.a = _t(t.a)), t;
  }
  set rgb(t) {
    this._rgb = Ji(t);
  }
  rgbString() {
    return this._valid ? Sa(this._rgb) : void 0;
  }
  hexString() {
    return this._valid ? fa(this._rgb) : void 0;
  }
  hslString() {
    return this._valid ? va(this._rgb) : void 0;
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
    return t && (this._rgb = Oa(this._rgb, t._rgb, e)), this;
  }
  clone() {
    return new Fe(this.rgb);
  }
  alpha(t) {
    return this._rgb.a = Ot(t), this;
  }
  clearer(t) {
    const e = this._rgb;
    return e.a *= 1 - t, this;
  }
  greyscale() {
    const t = this._rgb, e = Ye(t.r * 0.3 + t.g * 0.59 + t.b * 0.11);
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
    return Je(this._rgb, 2, t), this;
  }
  darken(t) {
    return Je(this._rgb, 2, -t), this;
  }
  saturate(t) {
    return Je(this._rgb, 1, t), this;
  }
  desaturate(t) {
    return Je(this._rgb, 1, -t), this;
  }
  rotate(t) {
    return wa(this._rgb, t), this;
  }
}
/*!
 * Chart.js v4.5.1
 * https://www.chartjs.org
 * (c) 2025 Chart.js Contributors
 * Released under the MIT License
 */
function pt() {
}
const Ca = /* @__PURE__ */ (() => {
  let n = 0;
  return () => n++;
})();
function R(n) {
  return n == null;
}
function U(n) {
  if (Array.isArray && Array.isArray(n))
    return !0;
  const t = Object.prototype.toString.call(n);
  return t.slice(0, 7) === "[object" && t.slice(-6) === "Array]";
}
function E(n) {
  return n !== null && Object.prototype.toString.call(n) === "[object Object]";
}
function G(n) {
  return (typeof n == "number" || n instanceof Number) && isFinite(+n);
}
function lt(n, t) {
  return G(n) ? n : t;
}
function A(n, t) {
  return typeof n > "u" ? t : n;
}
const Aa = (n, t) => typeof n == "string" && n.endsWith("%") ? parseFloat(n) / 100 * t : +n;
function F(n, t, e) {
  if (n && typeof n.call == "function")
    return n.apply(e, t);
}
function L(n, t, e, i) {
  let s, r, o;
  if (U(n))
    for (r = n.length, s = 0; s < r; s++)
      t.call(e, n[s], s);
  else if (E(n))
    for (o = Object.keys(n), r = o.length, s = 0; s < r; s++)
      t.call(e, n[o[s]], o[s]);
}
function yn(n, t) {
  let e, i, s, r;
  if (!n || !t || n.length !== t.length)
    return !1;
  for (e = 0, i = n.length; e < i; ++e)
    if (s = n[e], r = t[e], s.datasetIndex !== r.datasetIndex || s.index !== r.index)
      return !1;
  return !0;
}
function _n(n) {
  if (U(n))
    return n.map(_n);
  if (E(n)) {
    const t = /* @__PURE__ */ Object.create(null), e = Object.keys(n), i = e.length;
    let s = 0;
    for (; s < i; ++s)
      t[e[s]] = _n(n[e[s]]);
    return t;
  }
  return n;
}
function Pr(n) {
  return [
    "__proto__",
    "prototype",
    "constructor"
  ].indexOf(n) === -1;
}
function Ea(n, t, e, i) {
  if (!Pr(n))
    return;
  const s = t[n], r = e[n];
  E(s) && E(r) ? Re(s, r, i) : t[n] = _n(r);
}
function Re(n, t, e) {
  const i = U(t) ? t : [
    t
  ], s = i.length;
  if (!E(n))
    return n;
  e = e || {};
  const r = e.merger || Ea;
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
function Pe(n, t) {
  return Re(n, t, {
    merger: Ia
  });
}
function Ia(n, t, e) {
  if (!Pr(n))
    return;
  const i = t[n], s = e[n];
  E(i) && E(s) ? Pe(i, s) : Object.prototype.hasOwnProperty.call(t, n) || (t[n] = _n(s));
}
const ts = {
  // Chart.helpers.core resolveObjectKey should resolve empty key to root object
  "": (n) => n,
  // default resolvers
  x: (n) => n.x,
  y: (n) => n.y
};
function $a(n) {
  const t = n.split("."), e = [];
  let i = "";
  for (const s of t)
    i += s, i.endsWith("\\") ? i = i.slice(0, -1) + "." : (e.push(i), i = "");
  return e;
}
function La(n) {
  const t = $a(n);
  return (e) => {
    for (const i of t) {
      if (i === "")
        break;
      e = e && e[i];
    }
    return e;
  };
}
function xn(n, t) {
  return (ts[t] || (ts[t] = La(t)))(n);
}
function vi(n) {
  return n.charAt(0).toUpperCase() + n.slice(1);
}
const wn = (n) => typeof n < "u", Tt = (n) => typeof n == "function", es = (n, t) => {
  if (n.size !== t.size)
    return !1;
  for (const e of n)
    if (!t.has(e))
      return !1;
  return !0;
};
function Fa(n) {
  return n.type === "mouseup" || n.type === "click" || n.type === "contextmenu";
}
const Q = Math.PI, at = 2 * Q, Ra = at + Q, vn = Number.POSITIVE_INFINITY, Ha = Q / 180, rt = Q / 2, $t = Q / 4, ns = Q * 2 / 3, Sr = Math.log10, re = Math.sign;
function Se(n, t, e) {
  return Math.abs(n - t) < e;
}
function is(n) {
  const t = Math.round(n);
  n = Se(n, t, n / 1e3) ? t : n;
  const e = Math.pow(10, Math.floor(Sr(n))), i = n / e;
  return (i <= 1 ? 1 : i <= 2 ? 2 : i <= 5 ? 5 : 10) * e;
}
function za(n) {
  const t = [], e = Math.sqrt(n);
  let i;
  for (i = 1; i < e; i++)
    n % i === 0 && (t.push(i), t.push(n / i));
  return e === (e | 0) && t.push(e), t.sort((s, r) => s - r).pop(), t;
}
function Na(n) {
  return typeof n == "symbol" || typeof n == "object" && n !== null && !(Symbol.toPrimitive in n || "toString" in n || "valueOf" in n);
}
function He(n) {
  return !Na(n) && !isNaN(parseFloat(n)) && isFinite(n);
}
function Wa(n, t) {
  const e = Math.round(n);
  return e - t <= n && e + t >= n;
}
function Ba(n, t, e) {
  let i, s, r;
  for (i = 0, s = n.length; i < s; i++)
    r = n[i][e], isNaN(r) || (t.min = Math.min(t.min, r), t.max = Math.max(t.max, r));
}
function Wt(n) {
  return n * (Q / 180);
}
function Ya(n) {
  return n * (180 / Q);
}
function ss(n) {
  if (!G(n))
    return;
  let t = 1, e = 0;
  for (; Math.round(n * t) / t !== n; )
    t *= 10, e++;
  return e;
}
function ja(n, t) {
  const e = t.x - n.x, i = t.y - n.y, s = Math.sqrt(e * e + i * i);
  let r = Math.atan2(i, e);
  return r < -0.5 * Q && (r += at), {
    angle: r,
    distance: s
  };
}
function ni(n, t) {
  return Math.sqrt(Math.pow(t.x - n.x, 2) + Math.pow(t.y - n.y, 2));
}
function Va(n, t) {
  return (n - t + Ra) % at - Q;
}
function dt(n) {
  return (n % at + at) % at;
}
function Or(n, t, e, i) {
  const s = dt(n), r = dt(t), o = dt(e), a = dt(r - s), c = dt(o - s), l = dt(s - r), h = dt(s - o);
  return s === r || s === o || i && r === o || a > c && l < h;
}
function ot(n, t, e) {
  return Math.max(t, Math.min(e, n));
}
function Ua(n) {
  return ot(n, -32768, 32767);
}
function ee(n, t, e, i = 1e-6) {
  return n >= Math.min(t, e) - i && n <= Math.max(t, e) + i;
}
function Mi(n, t, e) {
  e = e || ((o) => n[o] < t);
  let i = n.length - 1, s = 0, r;
  for (; i - s > 1; )
    r = s + i >> 1, e(r) ? s = r : i = r;
  return {
    lo: s,
    hi: i
  };
}
const Bt = (n, t, e, i) => Mi(n, e, i ? (s) => {
  const r = n[s][t];
  return r < e || r === e && n[s + 1][t] === e;
} : (s) => n[s][t] < e), qa = (n, t, e) => Mi(n, e, (i) => n[i][t] >= e);
function Xa(n, t, e) {
  let i = 0, s = n.length;
  for (; i < s && n[i] < t; )
    i++;
  for (; s > i && n[s - 1] > e; )
    s--;
  return i > 0 || s < n.length ? n.slice(i, s) : n;
}
const Tr = [
  "push",
  "pop",
  "shift",
  "splice",
  "unshift"
];
function Qa(n, t) {
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
  }), Tr.forEach((e) => {
    const i = "_onData" + vi(e), s = n[e];
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
function rs(n, t) {
  const e = n._chartjs;
  if (!e)
    return;
  const i = e.listeners, s = i.indexOf(t);
  s !== -1 && i.splice(s, 1), !(i.length > 0) && (Tr.forEach((r) => {
    delete n[r];
  }), delete n._chartjs);
}
function Ga(n) {
  const t = new Set(n);
  return t.size === n.length ? n : Array.from(t);
}
const Cr = (function() {
  return typeof window > "u" ? function(n) {
    return n();
  } : window.requestAnimationFrame;
})();
function Ar(n, t) {
  let e = [], i = !1;
  return function(...s) {
    e = s, i || (i = !0, Cr.call(window, () => {
      i = !1, n.apply(t, e);
    }));
  };
}
function Ka(n, t) {
  let e;
  return function(...i) {
    return t ? (clearTimeout(e), e = setTimeout(n, t, i)) : n.apply(this, i), t;
  };
}
const Er = (n) => n === "start" ? "left" : n === "end" ? "right" : "center", nt = (n, t, e) => n === "start" ? t : n === "end" ? e : (t + e) / 2, Za = (n, t, e, i) => n === (i ? "left" : "right") ? e : n === "center" ? (t + e) / 2 : t;
function Ja(n, t, e) {
  const i = t.length;
  let s = 0, r = i;
  if (n._sorted) {
    const { iScale: o, vScale: a, _parsed: c } = n, l = n.dataset && n.dataset.options ? n.dataset.options.spanGaps : null, h = o.axis, { min: u, max: d, minDefined: f, maxDefined: g } = o.getUserBounds();
    if (f) {
      if (s = Math.min(
        // @ts-expect-error Need to type _parsed
        Bt(c, h, u).lo,
        // @ts-expect-error Need to fix types on _lookupByKey
        e ? i : Bt(t, h, o.getPixelForValue(u)).lo
      ), l) {
        const m = c.slice(0, s + 1).reverse().findIndex((p) => !R(p[a.axis]));
        s -= Math.max(0, m);
      }
      s = ot(s, 0, i - 1);
    }
    if (g) {
      let m = Math.max(
        // @ts-expect-error Need to type _parsed
        Bt(c, o.axis, d, !0).hi + 1,
        // @ts-expect-error Need to fix types on _lookupByKey
        e ? 0 : Bt(t, h, o.getPixelForValue(d), !0).hi + 1
      );
      if (l) {
        const p = c.slice(m - 1).findIndex((b) => !R(b[a.axis]));
        m += Math.max(0, p);
      }
      r = ot(m, s, i) - s;
    } else
      r = i - s;
  }
  return {
    start: s,
    count: r
  };
}
function tc(n) {
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
const tn = (n) => n === 0 || n === 1, os = (n, t, e) => -(Math.pow(2, 10 * (n -= 1)) * Math.sin((n - t) * at / e)), as = (n, t, e) => Math.pow(2, -10 * n) * Math.sin((n - t) * at / e) + 1, Oe = {
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
  easeInSine: (n) => -Math.cos(n * rt) + 1,
  easeOutSine: (n) => Math.sin(n * rt),
  easeInOutSine: (n) => -0.5 * (Math.cos(Q * n) - 1),
  easeInExpo: (n) => n === 0 ? 0 : Math.pow(2, 10 * (n - 1)),
  easeOutExpo: (n) => n === 1 ? 1 : -Math.pow(2, -10 * n) + 1,
  easeInOutExpo: (n) => tn(n) ? n : n < 0.5 ? 0.5 * Math.pow(2, 10 * (n * 2 - 1)) : 0.5 * (-Math.pow(2, -10 * (n * 2 - 1)) + 2),
  easeInCirc: (n) => n >= 1 ? n : -(Math.sqrt(1 - n * n) - 1),
  easeOutCirc: (n) => Math.sqrt(1 - (n -= 1) * n),
  easeInOutCirc: (n) => (n /= 0.5) < 1 ? -0.5 * (Math.sqrt(1 - n * n) - 1) : 0.5 * (Math.sqrt(1 - (n -= 2) * n) + 1),
  easeInElastic: (n) => tn(n) ? n : os(n, 0.075, 0.3),
  easeOutElastic: (n) => tn(n) ? n : as(n, 0.075, 0.3),
  easeInOutElastic(n) {
    return tn(n) ? n : n < 0.5 ? 0.5 * os(n * 2, 0.1125, 0.45) : 0.5 + 0.5 * as(n * 2 - 1, 0.1125, 0.45);
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
  easeInBounce: (n) => 1 - Oe.easeOutBounce(1 - n),
  easeOutBounce(n) {
    return n < 1 / 2.75 ? 7.5625 * n * n : n < 2 / 2.75 ? 7.5625 * (n -= 1.5 / 2.75) * n + 0.75 : n < 2.5 / 2.75 ? 7.5625 * (n -= 2.25 / 2.75) * n + 0.9375 : 7.5625 * (n -= 2.625 / 2.75) * n + 0.984375;
  },
  easeInOutBounce: (n) => n < 0.5 ? Oe.easeInBounce(n * 2) * 0.5 : Oe.easeOutBounce(n * 2 - 1) * 0.5 + 0.5
};
function ki(n) {
  if (n && typeof n == "object") {
    const t = n.toString();
    return t === "[object CanvasPattern]" || t === "[object CanvasGradient]";
  }
  return !1;
}
function cs(n) {
  return ki(n) ? n : new Fe(n);
}
function Bn(n) {
  return ki(n) ? n : new Fe(n).saturate(0.5).darken(0.1).hexString();
}
const ec = [
  "x",
  "y",
  "borderWidth",
  "radius",
  "tension"
], nc = [
  "color",
  "borderColor",
  "backgroundColor"
];
function ic(n) {
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
      properties: nc
    },
    numbers: {
      type: "number",
      properties: ec
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
function sc(n) {
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
const ls = /* @__PURE__ */ new Map();
function rc(n, t) {
  t = t || {};
  const e = n + JSON.stringify(t);
  let i = ls.get(e);
  return i || (i = new Intl.NumberFormat(n, t), ls.set(e, i)), i;
}
function Ir(n, t, e) {
  return rc(t, e).format(n);
}
const oc = {
  values(n) {
    return U(n) ? n : "" + n;
  },
  numeric(n, t, e) {
    if (n === 0)
      return "0";
    const i = this.chart.options.locale;
    let s, r = n;
    if (e.length > 1) {
      const l = Math.max(Math.abs(e[0].value), Math.abs(e[e.length - 1].value));
      (l < 1e-4 || l > 1e15) && (s = "scientific"), r = ac(n, e);
    }
    const o = Sr(Math.abs(r)), a = isNaN(o) ? 1 : Math.max(Math.min(-1 * Math.floor(o), 20), 0), c = {
      notation: s,
      minimumFractionDigits: a,
      maximumFractionDigits: a
    };
    return Object.assign(c, this.options.ticks.format), Ir(n, i, c);
  }
};
function ac(n, t) {
  let e = t.length > 3 ? t[2].value - t[1].value : t[1].value - t[0].value;
  return Math.abs(e) >= 1 && n !== Math.floor(n) && (e = n - Math.floor(n)), e;
}
var $r = {
  formatters: oc
};
function cc(n) {
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
      callback: $r.formatters.values,
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
const Ut = /* @__PURE__ */ Object.create(null), ii = /* @__PURE__ */ Object.create(null);
function Te(n, t) {
  if (!t)
    return n;
  const e = t.split(".");
  for (let i = 0, s = e.length; i < s; ++i) {
    const r = e[i];
    n = n[r] || (n[r] = /* @__PURE__ */ Object.create(null));
  }
  return n;
}
function Yn(n, t, e) {
  return typeof t == "string" ? Re(Te(n, t), e) : Re(Te(n, ""), t);
}
class lc {
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
    }, this.hover = {}, this.hoverBackgroundColor = (i, s) => Bn(s.backgroundColor), this.hoverBorderColor = (i, s) => Bn(s.borderColor), this.hoverColor = (i, s) => Bn(s.color), this.indexAxis = "x", this.interaction = {
      mode: "nearest",
      intersect: !0,
      includeInvisible: !1
    }, this.maintainAspectRatio = !0, this.onHover = null, this.onClick = null, this.parsing = !0, this.plugins = {}, this.responsive = !0, this.scale = void 0, this.scales = {}, this.showLine = !0, this.drawActiveElementsOnTop = !0, this.describe(t), this.apply(e);
  }
  set(t, e) {
    return Yn(this, t, e);
  }
  get(t) {
    return Te(this, t);
  }
  describe(t, e) {
    return Yn(ii, t, e);
  }
  override(t, e) {
    return Yn(Ut, t, e);
  }
  route(t, e, i, s) {
    const r = Te(this, t), o = Te(this, i), a = "_" + e;
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
var B = /* @__PURE__ */ new lc({
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
  ic,
  sc,
  cc
]);
function hc(n) {
  return !n || R(n.size) || R(n.family) ? null : (n.style ? n.style + " " : "") + (n.weight ? n.weight + " " : "") + n.size + "px " + n.family;
}
function hs(n, t, e, i, s) {
  let r = t[s];
  return r || (r = t[s] = n.measureText(s).width, e.push(s)), r > i && (i = r), i;
}
function Lt(n, t, e) {
  const i = n.currentDevicePixelRatio, s = e !== 0 ? Math.max(e / 2, 0.5) : 0;
  return Math.round((t - s) * i) / i + s;
}
function us(n, t) {
  !t && !n || (t = t || n.getContext("2d"), t.save(), t.resetTransform(), t.clearRect(0, 0, n.width, n.height), t.restore());
}
function si(n, t, e, i) {
  Lr(n, t, e, i, null);
}
function Lr(n, t, e, i, s) {
  let r, o, a, c, l, h, u, d;
  const f = t.pointStyle, g = t.rotation, m = t.radius;
  let p = (g || 0) * Ha;
  if (f && typeof f == "object" && (r = f.toString(), r === "[object HTMLImageElement]" || r === "[object HTMLCanvasElement]")) {
    n.save(), n.translate(e, i), n.rotate(p), n.drawImage(f, -f.width / 2, -f.height / 2, f.width, f.height), n.restore();
    return;
  }
  if (!(isNaN(m) || m <= 0)) {
    switch (n.beginPath(), f) {
      // Default includes circle
      default:
        s ? n.ellipse(e, i, s / 2, m, 0, 0, at) : n.arc(e, i, m, 0, at), n.closePath();
        break;
      case "triangle":
        h = s ? s / 2 : m, n.moveTo(e + Math.sin(p) * h, i - Math.cos(p) * m), p += ns, n.lineTo(e + Math.sin(p) * h, i - Math.cos(p) * m), p += ns, n.lineTo(e + Math.sin(p) * h, i - Math.cos(p) * m), n.closePath();
        break;
      case "rectRounded":
        l = m * 0.516, c = m - l, o = Math.cos(p + $t) * c, u = Math.cos(p + $t) * (s ? s / 2 - l : c), a = Math.sin(p + $t) * c, d = Math.sin(p + $t) * (s ? s / 2 - l : c), n.arc(e - u, i - a, l, p - Q, p - rt), n.arc(e + d, i - o, l, p - rt, p), n.arc(e + u, i + a, l, p, p + rt), n.arc(e - d, i + o, l, p + rt, p + Q), n.closePath();
        break;
      case "rect":
        if (!g) {
          c = Math.SQRT1_2 * m, h = s ? s / 2 : c, n.rect(e - h, i - c, 2 * h, 2 * c);
          break;
        }
        p += $t;
      /* falls through */
      case "rectRot":
        u = Math.cos(p) * (s ? s / 2 : m), o = Math.cos(p) * m, a = Math.sin(p) * m, d = Math.sin(p) * (s ? s / 2 : m), n.moveTo(e - u, i - a), n.lineTo(e + d, i - o), n.lineTo(e + u, i + a), n.lineTo(e - d, i + o), n.closePath();
        break;
      case "crossRot":
        p += $t;
      /* falls through */
      case "cross":
        u = Math.cos(p) * (s ? s / 2 : m), o = Math.cos(p) * m, a = Math.sin(p) * m, d = Math.sin(p) * (s ? s / 2 : m), n.moveTo(e - u, i - a), n.lineTo(e + u, i + a), n.moveTo(e + d, i - o), n.lineTo(e - d, i + o);
        break;
      case "star":
        u = Math.cos(p) * (s ? s / 2 : m), o = Math.cos(p) * m, a = Math.sin(p) * m, d = Math.sin(p) * (s ? s / 2 : m), n.moveTo(e - u, i - a), n.lineTo(e + u, i + a), n.moveTo(e + d, i - o), n.lineTo(e - d, i + o), p += $t, u = Math.cos(p) * (s ? s / 2 : m), o = Math.cos(p) * m, a = Math.sin(p) * m, d = Math.sin(p) * (s ? s / 2 : m), n.moveTo(e - u, i - a), n.lineTo(e + u, i + a), n.moveTo(e + d, i - o), n.lineTo(e - d, i + o);
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
function ze(n, t, e) {
  return e = e || 0.5, !t || n && n.x > t.left - e && n.x < t.right + e && n.y > t.top - e && n.y < t.bottom + e;
}
function Cn(n, t) {
  n.save(), n.beginPath(), n.rect(t.left, t.top, t.right - t.left, t.bottom - t.top), n.clip();
}
function An(n) {
  n.restore();
}
function uc(n, t, e, i, s) {
  if (!t)
    return n.lineTo(e.x, e.y);
  if (s === "middle") {
    const r = (t.x + e.x) / 2;
    n.lineTo(r, t.y), n.lineTo(r, e.y);
  } else s === "after" != !!i ? n.lineTo(t.x, e.y) : n.lineTo(e.x, t.y);
  n.lineTo(e.x, e.y);
}
function dc(n, t, e, i) {
  if (!t)
    return n.lineTo(e.x, e.y);
  n.bezierCurveTo(i ? t.cp1x : t.cp2x, i ? t.cp1y : t.cp2y, i ? e.cp2x : e.cp1x, i ? e.cp2y : e.cp1y, e.x, e.y);
}
function fc(n, t) {
  t.translation && n.translate(t.translation[0], t.translation[1]), R(t.rotation) || n.rotate(t.rotation), t.color && (n.fillStyle = t.color), t.textAlign && (n.textAlign = t.textAlign), t.textBaseline && (n.textBaseline = t.textBaseline);
}
function gc(n, t, e, i, s) {
  if (s.strikethrough || s.underline) {
    const r = n.measureText(i), o = t - r.actualBoundingBoxLeft, a = t + r.actualBoundingBoxRight, c = e - r.actualBoundingBoxAscent, l = e + r.actualBoundingBoxDescent, h = s.strikethrough ? (c + l) / 2 : l;
    n.strokeStyle = n.fillStyle, n.beginPath(), n.lineWidth = s.decorationWidth || 2, n.moveTo(o, h), n.lineTo(a, h), n.stroke();
  }
}
function mc(n, t) {
  const e = n.fillStyle;
  n.fillStyle = t.color, n.fillRect(t.left, t.top, t.width, t.height), n.fillStyle = e;
}
function Mn(n, t, e, i, s, r = {}) {
  const o = U(t) ? t : [
    t
  ], a = r.strokeWidth > 0 && r.strokeColor !== "";
  let c, l;
  for (n.save(), n.font = s.string, fc(n, r), c = 0; c < o.length; ++c)
    l = o[c], r.backdrop && mc(n, r.backdrop), a && (r.strokeColor && (n.strokeStyle = r.strokeColor), R(r.strokeWidth) || (n.lineWidth = r.strokeWidth), n.strokeText(l, e, i, r.maxWidth)), n.fillText(l, e, i, r.maxWidth), gc(n, e, i, l, r), i += Number(s.lineHeight);
  n.restore();
}
function ri(n, t) {
  const { x: e, y: i, w: s, h: r, radius: o } = t;
  n.arc(e + o.topLeft, i + o.topLeft, o.topLeft, 1.5 * Q, Q, !0), n.lineTo(e, i + r - o.bottomLeft), n.arc(e + o.bottomLeft, i + r - o.bottomLeft, o.bottomLeft, Q, rt, !0), n.lineTo(e + s - o.bottomRight, i + r), n.arc(e + s - o.bottomRight, i + r - o.bottomRight, o.bottomRight, rt, 0, !0), n.lineTo(e + s, i + o.topRight), n.arc(e + s - o.topRight, i + o.topRight, o.topRight, 0, -rt, !0), n.lineTo(e + o.topLeft, i);
}
const pc = /^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/, bc = /^(normal|italic|initial|inherit|unset|(oblique( -?[0-9]?[0-9]deg)?))$/;
function yc(n, t) {
  const e = ("" + n).match(pc);
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
const _c = (n) => +n || 0;
function Fr(n, t) {
  const e = {}, i = E(t), s = i ? Object.keys(t) : t, r = E(n) ? i ? (o) => A(n[o], n[t[o]]) : (o) => n[o] : () => n;
  for (const o of s)
    e[o] = _c(r(o));
  return e;
}
function xc(n) {
  return Fr(n, {
    top: "y",
    right: "x",
    bottom: "y",
    left: "x"
  });
}
function Ce(n) {
  return Fr(n, [
    "topLeft",
    "topRight",
    "bottomLeft",
    "bottomRight"
  ]);
}
function ct(n) {
  const t = xc(n);
  return t.width = t.left + t.right, t.height = t.top + t.bottom, t;
}
function J(n, t) {
  n = n || {}, t = t || B.font;
  let e = A(n.size, t.size);
  typeof e == "string" && (e = parseInt(e, 10));
  let i = A(n.style, t.style);
  i && !("" + i).match(bc) && (console.warn('Invalid font style specified: "' + i + '"'), i = void 0);
  const s = {
    family: A(n.family, t.family),
    lineHeight: yc(A(n.lineHeight, t.lineHeight), e),
    size: e,
    style: i,
    weight: A(n.weight, t.weight),
    string: ""
  };
  return s.string = hc(s), s;
}
function en(n, t, e, i) {
  let s, r, o;
  for (s = 0, r = n.length; s < r; ++s)
    if (o = n[s], o !== void 0 && o !== void 0)
      return o;
}
function wc(n, t, e) {
  const { min: i, max: s } = n, r = Aa(t, (s - i) / 2), o = (a, c) => e && a === 0 ? 0 : a + c;
  return {
    min: o(i, -Math.abs(r)),
    max: o(s, r)
  };
}
function qt(n, t) {
  return Object.assign(Object.create(n), t);
}
function Di(n, t = [
  ""
], e, i, s = () => n[0]) {
  const r = e || n;
  typeof i > "u" && (i = Nr("_fallback", n));
  const o = {
    [Symbol.toStringTag]: "Object",
    _cacheable: !0,
    _scopes: n,
    _rootScopes: r,
    _fallback: i,
    _getTarget: s,
    override: (a) => Di([
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
      return Hr(a, c, () => Tc(c, t, n, a));
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
      return fs(a).includes(c);
    },
    /**
    * A trap for Object.getOwnPropertyNames and Object.getOwnPropertySymbols.
    */
    ownKeys(a) {
      return fs(a);
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
function oe(n, t, e, i) {
  const s = {
    _cacheable: !1,
    _proxy: n,
    _context: t,
    _subProxy: e,
    _stack: /* @__PURE__ */ new Set(),
    _descriptors: Rr(n, i),
    setContext: (r) => oe(n, r, e, i),
    override: (r) => oe(n.override(r), t, e, i)
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
      return Hr(r, o, () => Mc(r, o, a));
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
function Rr(n, t = {
  scriptable: !0,
  indexable: !0
}) {
  const { _scriptable: e = t.scriptable, _indexable: i = t.indexable, _allKeys: s = t.allKeys } = n;
  return {
    allKeys: s,
    scriptable: e,
    indexable: i,
    isScriptable: Tt(e) ? e : () => e,
    isIndexable: Tt(i) ? i : () => i
  };
}
const vc = (n, t) => n ? n + vi(t) : t, Pi = (n, t) => E(t) && n !== "adapters" && (Object.getPrototypeOf(t) === null || t.constructor === Object);
function Hr(n, t, e) {
  if (Object.prototype.hasOwnProperty.call(n, t) || t === "constructor")
    return n[t];
  const i = e();
  return n[t] = i, i;
}
function Mc(n, t, e) {
  const { _proxy: i, _context: s, _subProxy: r, _descriptors: o } = n;
  let a = i[t];
  return Tt(a) && o.isScriptable(t) && (a = kc(t, a, n, e)), U(a) && a.length && (a = Dc(t, a, n, o.isIndexable)), Pi(t, a) && (a = oe(a, s, r && r[t], o)), a;
}
function kc(n, t, e, i) {
  const { _proxy: s, _context: r, _subProxy: o, _stack: a } = e;
  if (a.has(n))
    throw new Error("Recursion detected: " + Array.from(a).join("->") + "->" + n);
  a.add(n);
  let c = t(r, o || i);
  return a.delete(n), Pi(n, c) && (c = Si(s._scopes, s, n, c)), c;
}
function Dc(n, t, e, i) {
  const { _proxy: s, _context: r, _subProxy: o, _descriptors: a } = e;
  if (typeof r.index < "u" && i(n))
    return t[r.index % t.length];
  if (E(t[0])) {
    const c = t, l = s._scopes.filter((h) => h !== c);
    t = [];
    for (const h of c) {
      const u = Si(l, s, n, h);
      t.push(oe(u, r, o && o[n], a));
    }
  }
  return t;
}
function zr(n, t, e) {
  return Tt(n) ? n(t, e) : n;
}
const Pc = (n, t) => n === !0 ? t : typeof n == "string" ? xn(t, n) : void 0;
function Sc(n, t, e, i, s) {
  for (const r of t) {
    const o = Pc(e, r);
    if (o) {
      n.add(o);
      const a = zr(o._fallback, e, s);
      if (typeof a < "u" && a !== e && a !== i)
        return a;
    } else if (o === !1 && typeof i < "u" && e !== i)
      return null;
  }
  return !1;
}
function Si(n, t, e, i) {
  const s = t._rootScopes, r = zr(t._fallback, e, i), o = [
    ...n,
    ...s
  ], a = /* @__PURE__ */ new Set();
  a.add(i);
  let c = ds(a, o, e, r || e, i);
  return c === null || typeof r < "u" && r !== e && (c = ds(a, o, r, c, i), c === null) ? !1 : Di(Array.from(a), [
    ""
  ], s, r, () => Oc(t, e, i));
}
function ds(n, t, e, i, s) {
  for (; e; )
    e = Sc(n, t, e, i, s);
  return e;
}
function Oc(n, t, e) {
  const i = n._getTarget();
  t in i || (i[t] = {});
  const s = i[t];
  return U(s) && E(e) ? e : s || {};
}
function Tc(n, t, e, i) {
  let s;
  for (const r of t)
    if (s = Nr(vc(r, n), e), typeof s < "u")
      return Pi(n, s) ? Si(e, i, n, s) : s;
}
function Nr(n, t) {
  for (const e of t) {
    if (!e)
      continue;
    const i = e[n];
    if (typeof i < "u")
      return i;
  }
}
function fs(n) {
  let t = n._keys;
  return t || (t = n._keys = Cc(n._scopes)), t;
}
function Cc(n) {
  const t = /* @__PURE__ */ new Set();
  for (const e of n)
    for (const i of Object.keys(e).filter((s) => !s.startsWith("_")))
      t.add(i);
  return Array.from(t);
}
const Ac = Number.EPSILON || 1e-14, ae = (n, t) => t < n.length && !n[t].skip && n[t], Wr = (n) => n === "x" ? "y" : "x";
function Ec(n, t, e, i) {
  const s = n.skip ? t : n, r = t, o = e.skip ? t : e, a = ni(r, s), c = ni(o, r);
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
function Ic(n, t, e) {
  const i = n.length;
  let s, r, o, a, c, l = ae(n, 0);
  for (let h = 0; h < i - 1; ++h)
    if (c = l, l = ae(n, h + 1), !(!c || !l)) {
      if (Se(t[h], 0, Ac)) {
        e[h] = e[h + 1] = 0;
        continue;
      }
      s = e[h] / t[h], r = e[h + 1] / t[h], a = Math.pow(s, 2) + Math.pow(r, 2), !(a <= 9) && (o = 3 / Math.sqrt(a), e[h] = s * o * t[h], e[h + 1] = r * o * t[h]);
    }
}
function $c(n, t, e = "x") {
  const i = Wr(e), s = n.length;
  let r, o, a, c = ae(n, 0);
  for (let l = 0; l < s; ++l) {
    if (o = a, a = c, c = ae(n, l + 1), !a)
      continue;
    const h = a[e], u = a[i];
    o && (r = (h - o[e]) / 3, a[`cp1${e}`] = h - r, a[`cp1${i}`] = u - r * t[l]), c && (r = (c[e] - h) / 3, a[`cp2${e}`] = h + r, a[`cp2${i}`] = u + r * t[l]);
  }
}
function Lc(n, t = "x") {
  const e = Wr(t), i = n.length, s = Array(i).fill(0), r = Array(i);
  let o, a, c, l = ae(n, 0);
  for (o = 0; o < i; ++o)
    if (a = c, c = l, l = ae(n, o + 1), !!c) {
      if (l) {
        const h = l[t] - c[t];
        s[o] = h !== 0 ? (l[e] - c[e]) / h : 0;
      }
      r[o] = a ? l ? re(s[o - 1]) !== re(s[o]) ? 0 : (s[o - 1] + s[o]) / 2 : s[o - 1] : s[o];
    }
  Ic(n, s, r), $c(n, r, t);
}
function nn(n, t, e) {
  return Math.max(Math.min(n, e), t);
}
function Fc(n, t) {
  let e, i, s, r, o, a = ze(n[0], t);
  for (e = 0, i = n.length; e < i; ++e)
    o = r, r = a, a = e < i - 1 && ze(n[e + 1], t), r && (s = n[e], o && (s.cp1x = nn(s.cp1x, t.left, t.right), s.cp1y = nn(s.cp1y, t.top, t.bottom)), a && (s.cp2x = nn(s.cp2x, t.left, t.right), s.cp2y = nn(s.cp2y, t.top, t.bottom)));
}
function Rc(n, t, e, i, s) {
  let r, o, a, c;
  if (t.spanGaps && (n = n.filter((l) => !l.skip)), t.cubicInterpolationMode === "monotone")
    Lc(n, s);
  else {
    let l = i ? n[n.length - 1] : n[0];
    for (r = 0, o = n.length; r < o; ++r)
      a = n[r], c = Ec(l, a, n[Math.min(r + 1, o - (i ? 0 : 1)) % o], t.tension), a.cp1x = c.previous.x, a.cp1y = c.previous.y, a.cp2x = c.next.x, a.cp2y = c.next.y, l = a;
  }
  t.capBezierPoints && Fc(n, e);
}
function Oi() {
  return typeof window < "u" && typeof document < "u";
}
function Ti(n) {
  let t = n.parentNode;
  return t && t.toString() === "[object ShadowRoot]" && (t = t.host), t;
}
function kn(n, t, e) {
  let i;
  return typeof n == "string" ? (i = parseInt(n, 10), n.indexOf("%") !== -1 && (i = i / 100 * t.parentNode[e])) : i = n, i;
}
const En = (n) => n.ownerDocument.defaultView.getComputedStyle(n, null);
function Hc(n, t) {
  return En(n).getPropertyValue(t);
}
const zc = [
  "top",
  "right",
  "bottom",
  "left"
];
function jt(n, t, e) {
  const i = {};
  e = e ? "-" + e : "";
  for (let s = 0; s < 4; s++) {
    const r = zc[s];
    i[r] = parseFloat(n[t + "-" + r + e]) || 0;
  }
  return i.width = i.left + i.right, i.height = i.top + i.bottom, i;
}
const Nc = (n, t, e) => (n > 0 || t > 0) && (!e || !e.shadowRoot);
function Wc(n, t) {
  const e = n.touches, i = e && e.length ? e[0] : n, { offsetX: s, offsetY: r } = i;
  let o = !1, a, c;
  if (Nc(s, r, n.target))
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
function Rt(n, t) {
  if ("native" in n)
    return n;
  const { canvas: e, currentDevicePixelRatio: i } = t, s = En(e), r = s.boxSizing === "border-box", o = jt(s, "padding"), a = jt(s, "border", "width"), { x: c, y: l, box: h } = Wc(n, e), u = o.left + (h && a.left), d = o.top + (h && a.top);
  let { width: f, height: g } = t;
  return r && (f -= o.width + a.width, g -= o.height + a.height), {
    x: Math.round((c - u) / f * e.width / i),
    y: Math.round((l - d) / g * e.height / i)
  };
}
function Bc(n, t, e) {
  let i, s;
  if (t === void 0 || e === void 0) {
    const r = n && Ti(n);
    if (!r)
      t = n.clientWidth, e = n.clientHeight;
    else {
      const o = r.getBoundingClientRect(), a = En(r), c = jt(a, "border", "width"), l = jt(a, "padding");
      t = o.width - l.width - c.width, e = o.height - l.height - c.height, i = kn(a.maxWidth, r, "clientWidth"), s = kn(a.maxHeight, r, "clientHeight");
    }
  }
  return {
    width: t,
    height: e,
    maxWidth: i || vn,
    maxHeight: s || vn
  };
}
const kt = (n) => Math.round(n * 10) / 10;
function Yc(n, t, e, i) {
  const s = En(n), r = jt(s, "margin"), o = kn(s.maxWidth, n, "clientWidth") || vn, a = kn(s.maxHeight, n, "clientHeight") || vn, c = Bc(n, t, e);
  let { width: l, height: h } = c;
  if (s.boxSizing === "content-box") {
    const d = jt(s, "border", "width"), f = jt(s, "padding");
    l -= f.width + d.width, h -= f.height + d.height;
  }
  return l = Math.max(0, l - r.width), h = Math.max(0, i ? l / i : h - r.height), l = kt(Math.min(l, o, c.maxWidth)), h = kt(Math.min(h, a, c.maxHeight)), l && !h && (h = kt(l / 2)), (t !== void 0 || e !== void 0) && i && c.height && h > c.height && (h = c.height, l = kt(Math.floor(h * i))), {
    width: l,
    height: h
  };
}
function gs(n, t, e) {
  const i = t || 1, s = kt(n.height * i), r = kt(n.width * i);
  n.height = kt(n.height), n.width = kt(n.width);
  const o = n.canvas;
  return o.style && (e || !o.style.height && !o.style.width) && (o.style.height = `${n.height}px`, o.style.width = `${n.width}px`), n.currentDevicePixelRatio !== i || o.height !== s || o.width !== r ? (n.currentDevicePixelRatio = i, o.height = s, o.width = r, n.ctx.setTransform(i, 0, 0, i, 0, 0), !0) : !1;
}
const jc = (function() {
  let n = !1;
  try {
    const t = {
      get passive() {
        return n = !0, !1;
      }
    };
    Oi() && (window.addEventListener("test", null, t), window.removeEventListener("test", null, t));
  } catch {
  }
  return n;
})();
function ms(n, t) {
  const e = Hc(n, t), i = e && e.match(/^(\d+)(\.\d+)?px$/);
  return i ? +i[1] : void 0;
}
function Ht(n, t, e, i) {
  return {
    x: n.x + e * (t.x - n.x),
    y: n.y + e * (t.y - n.y)
  };
}
function Vc(n, t, e, i) {
  return {
    x: n.x + e * (t.x - n.x),
    y: i === "middle" ? e < 0.5 ? n.y : t.y : i === "after" ? e < 1 ? n.y : t.y : e > 0 ? t.y : n.y
  };
}
function Uc(n, t, e, i) {
  const s = {
    x: n.cp2x,
    y: n.cp2y
  }, r = {
    x: t.cp1x,
    y: t.cp1y
  }, o = Ht(n, s, e), a = Ht(s, r, e), c = Ht(r, t, e), l = Ht(o, a, e), h = Ht(a, c, e);
  return Ht(l, h, e);
}
const qc = function(n, t) {
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
}, Xc = function() {
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
function ne(n, t, e) {
  return n ? qc(t, e) : Xc();
}
function Br(n, t) {
  let e, i;
  (t === "ltr" || t === "rtl") && (e = n.canvas.style, i = [
    e.getPropertyValue("direction"),
    e.getPropertyPriority("direction")
  ], e.setProperty("direction", t, "important"), n.prevTextDirection = i);
}
function Yr(n, t) {
  t !== void 0 && (delete n.prevTextDirection, n.canvas.style.setProperty("direction", t[0], t[1]));
}
function jr(n) {
  return n === "angle" ? {
    between: Or,
    compare: Va,
    normalize: dt
  } : {
    between: ee,
    compare: (t, e) => t - e,
    normalize: (t) => t
  };
}
function ps({ start: n, end: t, count: e, loop: i, style: s }) {
  return {
    start: n % e,
    end: t % e,
    loop: i && (t - n + 1) % e === 0,
    style: s
  };
}
function Qc(n, t, e) {
  const { property: i, start: s, end: r } = e, { between: o, normalize: a } = jr(i), c = t.length;
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
function Vr(n, t, e) {
  if (!e)
    return [
      n
    ];
  const { property: i, start: s, end: r } = e, o = t.length, { compare: a, between: c, normalize: l } = jr(i), { start: h, end: u, loop: d, style: f } = Qc(n, t, e), g = [];
  let m = !1, p = null, b, x, v;
  const M = () => c(s, v, b) && a(s, v) !== 0, w = () => a(r, b) === 0 || c(r, v, b), P = () => m || M(), D = () => !m || w();
  for (let _ = h, k = h; _ <= u; ++_)
    x = t[_ % o], !x.skip && (b = l(x[i]), b !== v && (m = c(b, s, r), p === null && P() && (p = a(b, s) === 0 ? _ : k), p !== null && D() && (g.push(ps({
      start: p,
      end: _,
      loop: d,
      count: o,
      style: f
    })), p = null), k = _, v = b));
  return p !== null && g.push(ps({
    start: p,
    end: u,
    loop: d,
    count: o,
    style: f
  })), g;
}
function Ur(n, t) {
  const e = [], i = n.segments;
  for (let s = 0; s < i.length; s++) {
    const r = Vr(i[s], n.points, t);
    r.length && e.push(...r);
  }
  return e;
}
function Gc(n, t, e, i) {
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
function Kc(n, t, e, i) {
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
function Zc(n, t) {
  const e = n.points, i = n.options.spanGaps, s = e.length;
  if (!s)
    return [];
  const r = !!n._loop, { start: o, end: a } = Gc(e, s, r, i);
  if (i === !0)
    return bs(n, [
      {
        start: o,
        end: a,
        loop: r
      }
    ], e, t);
  const c = a < o ? a + s : a, l = !!n._fullLoop && o === 0 && a === s - 1;
  return bs(n, Kc(e, o, c, l), e, t);
}
function bs(n, t, e, i) {
  return !i || !i.setContext || !e ? t : Jc(n, t, e, i);
}
function Jc(n, t, e, i) {
  const s = n._chart.getContext(), r = ys(n.options), { _datasetIndex: o, options: { spanGaps: a } } = n, c = e.length, l = [];
  let h = r, u = t[0].start, d = u;
  function f(g, m, p, b) {
    const x = a ? -1 : 1;
    if (g !== m) {
      for (g += c; e[g % c].skip; )
        g -= x;
      for (; e[m % c].skip; )
        m += x;
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
      p = ys(i.setContext(qt(s, {
        type: "segment",
        p0: m,
        p1: b,
        p0DataIndex: (d - 1) % c,
        p1DataIndex: d % c,
        datasetIndex: o
      }))), tl(p, h) && f(u, d - 1, g.loop, h), m = b, h = p;
    }
    u < d - 1 && f(u, d - 1, g.loop, h);
  }
  return l;
}
function ys(n) {
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
function tl(n, t) {
  if (!t)
    return !1;
  const e = [], i = function(s, r) {
    return ki(r) ? (e.includes(r) || e.push(r), e.indexOf(r)) : r;
  };
  return JSON.stringify(n, i) !== JSON.stringify(t, i);
}
function sn(n, t, e) {
  return n.options.clip ? n[e] : t[e];
}
function el(n, t) {
  const { xScale: e, yScale: i } = n;
  return e && i ? {
    left: sn(e, t, "left"),
    right: sn(e, t, "right"),
    top: sn(i, t, "top"),
    bottom: sn(i, t, "bottom")
  } : t;
}
function qr(n, t) {
  const e = t._clip;
  if (e.disabled)
    return !1;
  const i = el(t, n.chartArea);
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
class nl {
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
    this._request || (this._running = !0, this._request = Cr.call(window, () => {
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
var bt = /* @__PURE__ */ new nl();
const _s = "transparent", il = {
  boolean(n, t, e) {
    return e > 0.5 ? t : n;
  },
  color(n, t, e) {
    const i = cs(n || _s), s = i.valid && cs(t || _s);
    return s && s.valid ? s.mix(i, e).hexString() : t;
  },
  number(n, t, e) {
    return n + (t - n) * e;
  }
};
class sl {
  constructor(t, e, i, s) {
    const r = e[i];
    s = en([
      t.to,
      s,
      r,
      t.from
    ]);
    const o = en([
      t.from,
      r,
      s
    ]);
    this._active = !0, this._fn = t.fn || il[t.type || typeof o], this._easing = Oe[t.easing] || Oe.linear, this._start = Math.floor(Date.now() + (t.delay || 0)), this._duration = this._total = Math.floor(t.duration), this._loop = !!t.loop, this._target = e, this._prop = i, this._from = o, this._to = s, this._promises = void 0;
  }
  active() {
    return this._active;
  }
  update(t, e, i) {
    if (this._active) {
      this._notify(!1);
      const s = this._target[this._prop], r = i - this._start, o = this._duration - r;
      this._start = i, this._duration = Math.floor(Math.max(o, t.duration)), this._total += r, this._loop = !!t.loop, this._to = en([
        t.to,
        e,
        s,
        t.from
      ]), this._from = en([
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
class Xr {
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
      (U(r.properties) && r.properties || [
        s
      ]).forEach((a) => {
        (a === s || !i.has(a)) && i.set(a, o);
      });
    });
  }
  _animateOptions(t, e) {
    const i = e.options, s = ol(t, i);
    if (!s)
      return [];
    const r = this._createAnimations(s, i);
    return i.$shared && rl(t.options.$animations, i).then(() => {
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
      r[l] = u = new sl(d, t, l, h), s.push(u);
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
      return bt.add(this._chart, i), !0;
  }
}
function rl(n, t) {
  const e = [], i = Object.keys(t);
  for (let s = 0; s < i.length; s++) {
    const r = n[i[s]];
    r && r.active() && e.push(r.wait());
  }
  return Promise.all(e);
}
function ol(n, t) {
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
function xs(n, t) {
  const e = n && n.options || {}, i = e.reverse, s = e.min === void 0 ? t : 0, r = e.max === void 0 ? t : 0;
  return {
    start: i ? r : s,
    end: i ? s : r
  };
}
function al(n, t, e) {
  if (e === !1)
    return !1;
  const i = xs(n, e), s = xs(t, e);
  return {
    top: s.end,
    right: i.end,
    bottom: s.start,
    left: i.start
  };
}
function cl(n) {
  let t, e, i, s;
  return E(n) ? (t = n.top, e = n.right, i = n.bottom, s = n.left) : t = e = i = s = n, {
    top: t,
    right: e,
    bottom: i,
    left: s,
    disabled: n === !1
  };
}
function Qr(n, t) {
  const e = [], i = n._getSortedDatasetMetas(t);
  let s, r;
  for (s = 0, r = i.length; s < r; ++s)
    e.push(i[s].index);
  return e;
}
function ws(n, t, e, i = {}) {
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
    l = n.values[c], G(l) && (r || t === 0 || re(t) === re(l)) && (t += l);
  }
  return !h && !i.all ? 0 : t;
}
function ll(n, t) {
  const { iScale: e, vScale: i } = t, s = e.axis === "x" ? "x" : "y", r = i.axis === "x" ? "x" : "y", o = Object.keys(n), a = new Array(o.length);
  let c, l, h;
  for (c = 0, l = o.length; c < l; ++c)
    h = o[c], a[c] = {
      [s]: h,
      [r]: n[h]
    };
  return a;
}
function jn(n, t) {
  const e = n && n.options.stacked;
  return e || e === void 0 && t.stack !== void 0;
}
function hl(n, t, e) {
  return `${n.id}.${t.id}.${e.stack || e.type}`;
}
function ul(n) {
  const { min: t, max: e, minDefined: i, maxDefined: s } = n.getUserBounds();
  return {
    min: i ? t : Number.NEGATIVE_INFINITY,
    max: s ? e : Number.POSITIVE_INFINITY
  };
}
function dl(n, t, e) {
  const i = n[t] || (n[t] = {});
  return i[e] || (i[e] = {});
}
function vs(n, t, e, i) {
  for (const s of t.getMatchingVisibleMetas(i).reverse()) {
    const r = n[s.index];
    if (e && r > 0 || !e && r < 0)
      return s.index;
  }
  return null;
}
function Ms(n, t) {
  const { chart: e, _cachedMeta: i } = n, s = e._stacks || (e._stacks = {}), { iScale: r, vScale: o, index: a } = i, c = r.axis, l = o.axis, h = hl(r, o, i), u = t.length;
  let d;
  for (let f = 0; f < u; ++f) {
    const g = t[f], { [c]: m, [l]: p } = g, b = g._stacks || (g._stacks = {});
    d = b[l] = dl(s, h, m), d[a] = p, d._top = vs(d, o, !0, i.type), d._bottom = vs(d, o, !1, i.type);
    const x = d._visualValues || (d._visualValues = {});
    x[a] = p;
  }
}
function Vn(n, t) {
  const e = n.scales;
  return Object.keys(e).filter((i) => e[i].axis === t).shift();
}
function fl(n, t) {
  return qt(n, {
    active: !1,
    dataset: void 0,
    datasetIndex: t,
    index: t,
    mode: "default",
    type: "dataset"
  });
}
function gl(n, t, e) {
  return qt(n, {
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
function de(n, t) {
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
const Un = (n) => n === "reset" || n === "none", ks = (n, t) => t ? n : Object.assign({}, n), ml = (n, t, e) => n && !t.hidden && t._stacked && {
  keys: Qr(e, !0),
  values: null
};
class Ae {
  constructor(t, e) {
    this.chart = t, this._ctx = t.ctx, this.index = e, this._cachedDataOpts = {}, this._cachedMeta = this.getMeta(), this._type = this._cachedMeta.type, this.options = void 0, this._parsing = !1, this._data = void 0, this._objectData = void 0, this._sharedOptions = void 0, this._drawStart = void 0, this._drawCount = void 0, this.enableOptionSharing = !1, this.supportsDecimation = !1, this.$context = void 0, this._syncList = [], this.datasetElementType = new.target.datasetElementType, this.dataElementType = new.target.dataElementType, this.initialize();
  }
  initialize() {
    const t = this._cachedMeta;
    this.configure(), this.linkScales(), t._stacked = jn(t.vScale, t), this.addElements(), this.options.fill && !this.chart.isPluginEnabled("filler") && console.warn("Tried to use the 'fill' option without the 'Filler' plugin enabled. Please import and register the 'Filler' plugin and make sure it is not disabled in the options");
  }
  updateIndex(t) {
    this.index !== t && de(this._cachedMeta), this.index = t;
  }
  linkScales() {
    const t = this.chart, e = this._cachedMeta, i = this.getDataset(), s = (u, d, f, g) => u === "x" ? d : u === "r" ? g : f, r = e.xAxisID = A(i.xAxisID, Vn(t, "x")), o = e.yAxisID = A(i.yAxisID, Vn(t, "y")), a = e.rAxisID = A(i.rAxisID, Vn(t, "r")), c = e.indexAxis, l = e.iAxisID = s(c, r, o, a), h = e.vAxisID = s(c, o, r, a);
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
    this._data && rs(this._data, this), t._stacked && de(t);
  }
  _dataCheck() {
    const t = this.getDataset(), e = t.data || (t.data = []), i = this._data;
    if (E(e)) {
      const s = this._cachedMeta;
      this._data = ll(e, s);
    } else if (i !== e) {
      if (i) {
        rs(i, this);
        const s = this._cachedMeta;
        de(s), s._parsed = [];
      }
      e && Object.isExtensible(e) && Qa(e, this), this._syncList = [], this._data = e;
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
    e._stacked = jn(e.vScale, e), e.stack !== i.stack && (s = !0, de(e), e.stack = i.stack), this._resyncElements(t), (s || r !== e._stacked) && (Ms(this, e._parsed), e._stacked = jn(e.vScale, e));
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
      U(s[t]) ? d = this.parseArrayData(i, s, t, e) : E(s[t]) ? d = this.parseObjectData(i, s, t, e) : d = this.parsePrimitiveData(i, s, t, e);
      const f = () => u[a] === null || l && u[a] < l[a];
      for (h = 0; h < e; ++h)
        i._parsed[h + t] = u = d[h], c && (f() && (c = !1), l = u);
      i._sorted = c;
    }
    o && Ms(this, d);
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
        x: r.parse(xn(f, a), d),
        y: o.parse(xn(f, c), d)
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
      keys: Qr(s, !0),
      values: e._stacks[t.axis]._visualValues
    };
    return ws(a, o, r.index, {
      mode: i
    });
  }
  updateRangeFromParsed(t, e, i, s) {
    const r = i[e.axis];
    let o = r === null ? NaN : r;
    const a = s && i._stacks[e.axis];
    s && a && (s.values = a, o = ws(s, r, this._cachedMeta.index)), t.min = Math.min(t.min, o), t.max = Math.max(t.max, o);
  }
  getMinMax(t, e) {
    const i = this._cachedMeta, s = i._parsed, r = i._sorted && t === i.iScale, o = s.length, a = this._getOtherScale(t), c = ml(e, i, this.chart), l = {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY
    }, { min: h, max: u } = ul(a);
    let d, f;
    function g() {
      f = s[d];
      const m = f[a.axis];
      return !G(f[t.axis]) || h > m || u < m;
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
      o = e[s][t.axis], G(o) && i.push(o);
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
    this.update(t || "default"), e._clip = cl(A(this.options.clip, al(e.xScale, e.yScale, this.getMaxOverflow())));
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
      r = o.$context || (o.$context = gl(this.getContext(), t, o)), r.parsed = this.getParsed(t), r.raw = s.data[t], r.index = r.dataIndex = t;
    } else
      r = this.$context || (this.$context = fl(this.chart.getContext(), this.index)), r.dataset = s, r.index = r.datasetIndex = this.index;
    return r.active = !!e, r.mode = i, r;
  }
  resolveDatasetElementOptions(t) {
    return this._resolveElementOptions(this.datasetElementType.id, t);
  }
  resolveDataElementOptions(t, e) {
    return this._resolveElementOptions(this.dataElementType.id, e, t);
  }
  _resolveElementOptions(t, e = "default", i) {
    const s = e === "active", r = this._cachedDataOpts, o = t + "-" + e, a = r[o], c = this.enableOptionSharing && wn(i);
    if (a)
      return ks(a, c);
    const l = this.chart.config, h = l.datasetElementScopeKeys(this._type, t), u = s ? [
      `${t}Hover`,
      "hover",
      t,
      ""
    ] : [
      t,
      ""
    ], d = l.getOptionScopes(this.getDataset(), h), f = Object.keys(B.elements[t]), g = () => this.getContext(i, s, e), m = l.resolveNamedOptions(d, f, g, u);
    return m.$shared && (m.$shared = c, r[o] = Object.freeze(ks(m, c))), m;
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
    const l = new Xr(s, c && c.animations);
    return c && c._cacheable && (r[o] = Object.freeze(l)), l;
  }
  getSharedOptions(t) {
    if (t.$shared)
      return this._sharedOptions || (this._sharedOptions = Object.assign({}, t));
  }
  includeOptions(t, e) {
    return !e || Un(t) || this.chart._animationsDisabled;
  }
  _getSharedOptions(t, e) {
    const i = this.resolveDataElementOptions(t, e), s = this._sharedOptions, r = this.getSharedOptions(i), o = this.includeOptions(e, r) || r !== s;
    return this.updateSharedOptions(r, e, i), {
      sharedOptions: r,
      includeOptions: o
    };
  }
  updateElement(t, e, i, s) {
    Un(s) ? Object.assign(t, i) : this._resolveAnimations(e, s).update(t, i);
  }
  updateSharedOptions(t, e, i) {
    t && !Un(e) && this._resolveAnimations(void 0, e).update(t, i);
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
      i._stacked && de(i, s);
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
y(Ae, "defaults", {}), y(Ae, "datasetElementType", null), y(Ae, "dataElementType", null);
class fn extends Ae {
  initialize() {
    this.enableOptionSharing = !0, this.supportsDecimation = !0, super.initialize();
  }
  update(t) {
    const e = this._cachedMeta, { dataset: i, data: s = [], _dataset: r } = e, o = this.chart._animationsDisabled;
    let { start: a, count: c } = Ja(e, s, o);
    this._drawStart = a, this._drawCount = c, tc(e) && (a = 0, c = s.length), i._chart = this.chart, i._datasetIndex = this.index, i._decimated = !!r._decimated, i.points = s;
    const l = this.resolveDatasetElementOptions(t);
    this.options.showLine || (l.borderWidth = 0), l.segment = this.options.segment, this.updateElement(i, void 0, {
      animated: !o,
      options: l
    }, t), this.updateElements(s, a, c, t);
  }
  updateElements(t, e, i, s) {
    const r = s === "reset", { iScale: o, vScale: a, _stacked: c, _dataset: l } = this._cachedMeta, { sharedOptions: h, includeOptions: u } = this._getSharedOptions(e, s), d = o.axis, f = a.axis, { spanGaps: g, segment: m } = this.options, p = He(g) ? g : Number.POSITIVE_INFINITY, b = this.chart._animationsDisabled || r || s === "none", x = e + i, v = t.length;
    let M = e > 0 && this.getParsed(e - 1);
    for (let w = 0; w < v; ++w) {
      const P = t[w], D = b ? P : {};
      if (w < e || w >= x) {
        D.skip = !0;
        continue;
      }
      const _ = this.getParsed(w), k = R(_[f]), O = D[d] = o.getPixelForValue(_[d], w), T = D[f] = r || k ? a.getBasePixel() : a.getPixelForValue(c ? this.applyStack(a, _, c) : _[f], w);
      D.skip = isNaN(O) || isNaN(T) || k, D.stop = w > 0 && Math.abs(_[d] - M[d]) > p, m && (D.parsed = _, D.raw = l.data[w]), u && (D.options = h || this.resolveDataElementOptions(w, P.active ? "active" : s)), b || this.updateElement(P, w, D, s), M = _;
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
y(fn, "id", "line"), y(fn, "defaults", {
  datasetElementType: "line",
  dataElementType: "point",
  showLine: !0,
  spanGaps: !1
}), y(fn, "overrides", {
  scales: {
    _index_: {
      type: "category"
    },
    _value_: {
      type: "linear"
    }
  }
});
function Ft() {
  throw new Error("This method is not implemented: Check that a complete date adapter is provided.");
}
class Ci {
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
    Object.assign(Ci.prototype, t);
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  init() {
  }
  formats() {
    return Ft();
  }
  parse() {
    return Ft();
  }
  format() {
    return Ft();
  }
  add() {
    return Ft();
  }
  diff() {
    return Ft();
  }
  startOf() {
    return Ft();
  }
  endOf() {
    return Ft();
  }
}
var Gr = {
  _date: Ci
};
function pl(n, t, e, i) {
  const { controller: s, data: r, _sorted: o } = n, a = s._cachedMeta.iScale, c = n.dataset && n.dataset.options ? n.dataset.options.spanGaps : null;
  if (a && t === a.axis && t !== "r" && o && r.length) {
    const l = a._reversePixels ? qa : Bt;
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
        const { vScale: u } = s._cachedMeta, { _parsed: d } = n, f = d.slice(0, h.lo + 1).reverse().findIndex((m) => !R(m[u.axis]));
        h.lo -= Math.max(0, f);
        const g = d.slice(h.hi).findIndex((m) => !R(m[u.axis]));
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
function In(n, t, e, i, s) {
  const r = n.getSortedVisibleDatasetMetas(), o = e[t];
  for (let a = 0, c = r.length; a < c; ++a) {
    const { index: l, data: h } = r[a], { lo: u, hi: d } = pl(r[a], t, o, s);
    for (let f = u; f <= d; ++f) {
      const g = h[f];
      g.skip || i(g, l, f);
    }
  }
}
function bl(n) {
  const t = n.indexOf("x") !== -1, e = n.indexOf("y") !== -1;
  return function(i, s) {
    const r = t ? Math.abs(i.x - s.x) : 0, o = e ? Math.abs(i.y - s.y) : 0;
    return Math.sqrt(Math.pow(r, 2) + Math.pow(o, 2));
  };
}
function qn(n, t, e, i, s) {
  const r = [];
  return !s && !n.isPointInArea(t) || In(n, e, t, function(a, c, l) {
    !s && !ze(a, n.chartArea, 0) || a.inRange(t.x, t.y, i) && r.push({
      element: a,
      datasetIndex: c,
      index: l
    });
  }, !0), r;
}
function yl(n, t, e, i) {
  let s = [];
  function r(o, a, c) {
    const { startAngle: l, endAngle: h } = o.getProps([
      "startAngle",
      "endAngle"
    ], i), { angle: u } = ja(o, {
      x: t.x,
      y: t.y
    });
    Or(u, l, h) && s.push({
      element: o,
      datasetIndex: a,
      index: c
    });
  }
  return In(n, e, t, r), s;
}
function _l(n, t, e, i, s, r) {
  let o = [];
  const a = bl(e);
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
  return In(n, e, t, l), o;
}
function Xn(n, t, e, i, s, r) {
  return !r && !n.isPointInArea(t) ? [] : e === "r" && !i ? yl(n, t, e, s) : _l(n, t, e, i, s, r);
}
function Ds(n, t, e, i, s) {
  const r = [], o = e === "x" ? "inXRange" : "inYRange";
  let a = !1;
  return In(n, e, t, (c, l, h) => {
    c[o] && c[o](t[e], s) && (r.push({
      element: c,
      datasetIndex: l,
      index: h
    }), a = a || c.inRange(t.x, t.y, s));
  }), i && !a ? [] : r;
}
var xl = {
  modes: {
    index(n, t, e, i) {
      const s = Rt(t, n), r = e.axis || "x", o = e.includeInvisible || !1, a = e.intersect ? qn(n, s, r, i, o) : Xn(n, s, r, !1, i, o), c = [];
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
      const s = Rt(t, n), r = e.axis || "xy", o = e.includeInvisible || !1;
      let a = e.intersect ? qn(n, s, r, i, o) : Xn(n, s, r, !1, i, o);
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
      const s = Rt(t, n), r = e.axis || "xy", o = e.includeInvisible || !1;
      return qn(n, s, r, i, o);
    },
    nearest(n, t, e, i) {
      const s = Rt(t, n), r = e.axis || "xy", o = e.includeInvisible || !1;
      return Xn(n, s, r, e.intersect, i, o);
    },
    x(n, t, e, i) {
      const s = Rt(t, n);
      return Ds(n, s, "x", e.intersect, i);
    },
    y(n, t, e, i) {
      const s = Rt(t, n);
      return Ds(n, s, "y", e.intersect, i);
    }
  }
};
const Kr = [
  "left",
  "top",
  "right",
  "bottom"
];
function fe(n, t) {
  return n.filter((e) => e.pos === t);
}
function Ps(n, t) {
  return n.filter((e) => Kr.indexOf(e.pos) === -1 && e.box.axis === t);
}
function ge(n, t) {
  return n.sort((e, i) => {
    const s = t ? i : e, r = t ? e : i;
    return s.weight === r.weight ? s.index - r.index : s.weight - r.weight;
  });
}
function wl(n) {
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
function vl(n) {
  const t = {};
  for (const e of n) {
    const { stack: i, pos: s, stackWeight: r } = e;
    if (!i || !Kr.includes(s))
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
function Ml(n, t) {
  const e = vl(n), { vBoxMaxWidth: i, hBoxMaxHeight: s } = t;
  let r, o, a;
  for (r = 0, o = n.length; r < o; ++r) {
    a = n[r];
    const { fullSize: c } = a.box, l = e[a.stack], h = l && a.stackWeight / l.weight;
    a.horizontal ? (a.width = h ? h * i : c && t.availableWidth, a.height = s) : (a.width = i, a.height = h ? h * s : c && t.availableHeight);
  }
  return e;
}
function kl(n) {
  const t = wl(n), e = ge(t.filter((l) => l.box.fullSize), !0), i = ge(fe(t, "left"), !0), s = ge(fe(t, "right")), r = ge(fe(t, "top"), !0), o = ge(fe(t, "bottom")), a = Ps(t, "x"), c = Ps(t, "y");
  return {
    fullSize: e,
    leftAndTop: i.concat(r),
    rightAndBottom: s.concat(c).concat(o).concat(a),
    chartArea: fe(t, "chartArea"),
    vertical: i.concat(s).concat(c),
    horizontal: r.concat(o).concat(a)
  };
}
function Ss(n, t, e, i) {
  return Math.max(n[e], t[e]) + Math.max(n[i], t[i]);
}
function Zr(n, t) {
  n.top = Math.max(n.top, t.top), n.left = Math.max(n.left, t.left), n.bottom = Math.max(n.bottom, t.bottom), n.right = Math.max(n.right, t.right);
}
function Dl(n, t, e, i) {
  const { pos: s, box: r } = e, o = n.maxPadding;
  if (!E(s)) {
    e.size && (n[s] -= e.size);
    const u = i[e.stack] || {
      size: 0,
      count: 1
    };
    u.size = Math.max(u.size, e.horizontal ? r.height : r.width), e.size = u.size / u.count, n[s] += e.size;
  }
  r.getPadding && Zr(o, r.getPadding());
  const a = Math.max(0, t.outerWidth - Ss(o, n, "left", "right")), c = Math.max(0, t.outerHeight - Ss(o, n, "top", "bottom")), l = a !== n.w, h = c !== n.h;
  return n.w = a, n.h = c, e.horizontal ? {
    same: l,
    other: h
  } : {
    same: h,
    other: l
  };
}
function Pl(n) {
  const t = n.maxPadding;
  function e(i) {
    const s = Math.max(t[i] - n[i], 0);
    return n[i] += s, s;
  }
  n.y += e("top"), n.x += e("left"), e("right"), e("bottom");
}
function Sl(n, t) {
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
function we(n, t, e, i) {
  const s = [];
  let r, o, a, c, l, h;
  for (r = 0, o = n.length, l = 0; r < o; ++r) {
    a = n[r], c = a.box, c.update(a.width || t.w, a.height || t.h, Sl(a.horizontal, t));
    const { same: u, other: d } = Dl(t, e, a, i);
    l |= u && s.length, h = h || d, c.fullSize || s.push(a);
  }
  return l && we(s, t, e, i) || h;
}
function rn(n, t, e, i, s) {
  n.top = e, n.left = t, n.right = t + i, n.bottom = e + s, n.width = i, n.height = s;
}
function Os(n, t, e, i) {
  const s = e.padding;
  let { x: r, y: o } = t;
  for (const a of n) {
    const c = a.box, l = i[a.stack] || {
      placed: 0,
      weight: 1
    }, h = a.stackWeight / l.weight || 1;
    if (a.horizontal) {
      const u = t.w * h, d = l.size || c.height;
      wn(l.start) && (o = l.start), c.fullSize ? rn(c, s.left, o, e.outerWidth - s.right - s.left, d) : rn(c, t.left + l.placed, o, u, d), l.start = o, l.placed += u, o = c.bottom;
    } else {
      const u = t.h * h, d = l.size || c.width;
      wn(l.start) && (r = l.start), c.fullSize ? rn(c, r, s.top, d, e.outerHeight - s.bottom - s.top) : rn(c, r, t.top + l.placed, d, u), l.start = r, l.placed += u, r = c.right;
    }
  }
  t.x = r, t.y = o;
}
var Dt = {
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
    const s = ct(n.options.layout.padding), r = Math.max(t - s.width, 0), o = Math.max(e - s.height, 0), a = kl(n.boxes), c = a.vertical, l = a.horizontal;
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
    Zr(d, ct(i));
    const f = Object.assign({
      maxPadding: d,
      w: r,
      h: o,
      x: s.left,
      y: s.top
    }, s), g = Ml(c.concat(l), u);
    we(a.fullSize, f, u, g), we(c, f, u, g), we(l, f, u, g) && we(c, f, u, g), Pl(f), Os(a.leftAndTop, f, u, g), f.x += f.w, f.y += f.h, Os(a.rightAndBottom, f, u, g), n.chartArea = {
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
class Jr {
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
class Ol extends Jr {
  acquireContext(t) {
    return t && t.getContext && t.getContext("2d") || null;
  }
  updateConfig(t) {
    t.options.animation = !1;
  }
}
const gn = "$chartjs", Tl = {
  touchstart: "mousedown",
  touchmove: "mousemove",
  touchend: "mouseup",
  pointerenter: "mouseenter",
  pointerdown: "mousedown",
  pointermove: "mousemove",
  pointerup: "mouseup",
  pointerleave: "mouseout",
  pointerout: "mouseout"
}, Ts = (n) => n === null || n === "";
function Cl(n, t) {
  const e = n.style, i = n.getAttribute("height"), s = n.getAttribute("width");
  if (n[gn] = {
    initial: {
      height: i,
      width: s,
      style: {
        display: e.display,
        height: e.height,
        width: e.width
      }
    }
  }, e.display = e.display || "block", e.boxSizing = e.boxSizing || "border-box", Ts(s)) {
    const r = ms(n, "width");
    r !== void 0 && (n.width = r);
  }
  if (Ts(i))
    if (n.style.height === "")
      n.height = n.width / (t || 2);
    else {
      const r = ms(n, "height");
      r !== void 0 && (n.height = r);
    }
  return n;
}
const to = jc ? {
  passive: !0
} : !1;
function Al(n, t, e) {
  n && n.addEventListener(t, e, to);
}
function El(n, t, e) {
  n && n.canvas && n.canvas.removeEventListener(t, e, to);
}
function Il(n, t) {
  const e = Tl[n.type] || n.type, { x: i, y: s } = Rt(n, t);
  return {
    type: e,
    chart: t,
    native: n,
    x: i !== void 0 ? i : null,
    y: s !== void 0 ? s : null
  };
}
function Dn(n, t) {
  for (const e of n)
    if (e === t || e.contains(t))
      return !0;
}
function $l(n, t, e) {
  const i = n.canvas, s = new MutationObserver((r) => {
    let o = !1;
    for (const a of r)
      o = o || Dn(a.addedNodes, i), o = o && !Dn(a.removedNodes, i);
    o && e();
  });
  return s.observe(document, {
    childList: !0,
    subtree: !0
  }), s;
}
function Ll(n, t, e) {
  const i = n.canvas, s = new MutationObserver((r) => {
    let o = !1;
    for (const a of r)
      o = o || Dn(a.removedNodes, i), o = o && !Dn(a.addedNodes, i);
    o && e();
  });
  return s.observe(document, {
    childList: !0,
    subtree: !0
  }), s;
}
const Ne = /* @__PURE__ */ new Map();
let Cs = 0;
function eo() {
  const n = window.devicePixelRatio;
  n !== Cs && (Cs = n, Ne.forEach((t, e) => {
    e.currentDevicePixelRatio !== n && t();
  }));
}
function Fl(n, t) {
  Ne.size || window.addEventListener("resize", eo), Ne.set(n, t);
}
function Rl(n) {
  Ne.delete(n), Ne.size || window.removeEventListener("resize", eo);
}
function Hl(n, t, e) {
  const i = n.canvas, s = i && Ti(i);
  if (!s)
    return;
  const r = Ar((a, c) => {
    const l = s.clientWidth;
    e(a, c), l < s.clientWidth && e();
  }, window), o = new ResizeObserver((a) => {
    const c = a[0], l = c.contentRect.width, h = c.contentRect.height;
    l === 0 && h === 0 || r(l, h);
  });
  return o.observe(s), Fl(n, r), o;
}
function Qn(n, t, e) {
  e && e.disconnect(), t === "resize" && Rl(n);
}
function zl(n, t, e) {
  const i = n.canvas, s = Ar((r) => {
    n.ctx !== null && e(Il(r, n));
  }, n);
  return Al(i, t, s), s;
}
class Nl extends Jr {
  acquireContext(t, e) {
    const i = t && t.getContext && t.getContext("2d");
    return i && i.canvas === t ? (Cl(t, e), i) : null;
  }
  releaseContext(t) {
    const e = t.canvas;
    if (!e[gn])
      return !1;
    const i = e[gn].initial;
    [
      "height",
      "width"
    ].forEach((r) => {
      const o = i[r];
      R(o) ? e.removeAttribute(r) : e.setAttribute(r, o);
    });
    const s = i.style || {};
    return Object.keys(s).forEach((r) => {
      e.style[r] = s[r];
    }), e.width = e.width, delete e[gn], !0;
  }
  addEventListener(t, e, i) {
    this.removeEventListener(t, e);
    const s = t.$proxies || (t.$proxies = {}), o = {
      attach: $l,
      detach: Ll,
      resize: Hl
    }[e] || zl;
    s[e] = o(t, e, i);
  }
  removeEventListener(t, e) {
    const i = t.$proxies || (t.$proxies = {}), s = i[e];
    if (!s)
      return;
    ({
      attach: Qn,
      detach: Qn,
      resize: Qn
    }[e] || El)(t, e, s), i[e] = void 0;
  }
  getDevicePixelRatio() {
    return window.devicePixelRatio;
  }
  getMaximumSize(t, e, i, s) {
    return Yc(t, e, i, s);
  }
  isAttached(t) {
    const e = t && Ti(t);
    return !!(e && e.isConnected);
  }
}
function Wl(n) {
  return !Oi() || typeof OffscreenCanvas < "u" && n instanceof OffscreenCanvas ? Ol : Nl;
}
class Ct {
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
    return He(this.x) && He(this.y);
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
y(Ct, "defaults", {}), y(Ct, "defaultRoutes");
function Bl(n, t) {
  const e = n.options.ticks, i = Yl(n), s = Math.min(e.maxTicksLimit || i, i), r = e.major.enabled ? Vl(t) : [], o = r.length, a = r[0], c = r[o - 1], l = [];
  if (o > s)
    return Ul(t, l, r, o / s), l;
  const h = jl(r, t, s);
  if (o > 0) {
    let u, d;
    const f = o > 1 ? Math.round((c - a) / (o - 1)) : null;
    for (on(t, l, h, R(f) ? 0 : a - f, a), u = 0, d = o - 1; u < d; u++)
      on(t, l, h, r[u], r[u + 1]);
    return on(t, l, h, c, R(f) ? t.length : c + f), l;
  }
  return on(t, l, h), l;
}
function Yl(n) {
  const t = n.options.offset, e = n._tickSize(), i = n._length / e + (t ? 0 : 1), s = n._maxLength / e;
  return Math.floor(Math.min(i, s));
}
function jl(n, t, e) {
  const i = ql(n), s = t.length / e;
  if (!i)
    return Math.max(s, 1);
  const r = za(i);
  for (let o = 0, a = r.length - 1; o < a; o++) {
    const c = r[o];
    if (c > s)
      return c;
  }
  return Math.max(s, 1);
}
function Vl(n) {
  const t = [];
  let e, i;
  for (e = 0, i = n.length; e < i; e++)
    n[e].major && t.push(e);
  return t;
}
function Ul(n, t, e, i) {
  let s = 0, r = e[0], o;
  for (i = Math.ceil(i), o = 0; o < n.length; o++)
    o === r && (t.push(n[o]), s++, r = e[s * i]);
}
function on(n, t, e, i, s) {
  const r = A(i, 0), o = Math.min(A(s, n.length), n.length);
  let a = 0, c, l, h;
  for (e = Math.ceil(e), s && (c = s - i, e = c / Math.floor(c / e)), h = r; h < 0; )
    a++, h = Math.round(r + a * e);
  for (l = Math.max(r, 0); l < o; l++)
    l === h && (t.push(n[l]), a++, h = Math.round(r + a * e));
}
function ql(n) {
  const t = n.length;
  let e, i;
  if (t < 2)
    return !1;
  for (i = n[0], e = 1; e < t; ++e)
    if (n[e] - n[e - 1] !== i)
      return !1;
  return i;
}
const Xl = (n) => n === "left" ? "right" : n === "right" ? "left" : n, As = (n, t, e) => t === "top" || t === "left" ? n[t] + e : n[t] - e, Es = (n, t) => Math.min(t || n, n);
function Is(n, t) {
  const e = [], i = n.length / t, s = n.length;
  let r = 0;
  for (; r < s; r += i)
    e.push(n[Math.floor(r)]);
  return e;
}
function Ql(n, t, e) {
  const i = n.ticks.length, s = Math.min(t, i - 1), r = n._startPixel, o = n._endPixel, a = 1e-6;
  let c = n.getPixelForTick(s), l;
  if (!(e && (i === 1 ? l = Math.max(c - r, o - c) : t === 0 ? l = (n.getPixelForTick(1) - c) / 2 : l = (c - n.getPixelForTick(s - 1)) / 2, c += s < t ? l : -l, c < r - a || c > o + a)))
    return c;
}
function Gl(n, t) {
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
function me(n) {
  return n.drawTicks ? n.tickLength : 0;
}
function $s(n, t) {
  if (!n.display)
    return 0;
  const e = J(n.font, t), i = ct(n.padding);
  return (U(n.text) ? n.text.length : 1) * e.lineHeight + i.height;
}
function Kl(n, t) {
  return qt(n, {
    scale: t,
    type: "scale"
  });
}
function Zl(n, t, e) {
  return qt(n, {
    tick: e,
    index: t,
    type: "tick"
  });
}
function Jl(n, t, e) {
  let i = Er(n);
  return (e && t !== "right" || !e && t === "right") && (i = Xl(i)), i;
}
function th(n, t, e, i) {
  const { top: s, left: r, bottom: o, right: a, chart: c } = n, { chartArea: l, scales: h } = c;
  let u = 0, d, f, g;
  const m = o - s, p = a - r;
  if (n.isHorizontal()) {
    if (f = nt(i, r, a), E(e)) {
      const b = Object.keys(e)[0], x = e[b];
      g = h[b].getPixelForValue(x) + m - t;
    } else e === "center" ? g = (l.bottom + l.top) / 2 + m - t : g = As(n, e, t);
    d = a - r;
  } else {
    if (E(e)) {
      const b = Object.keys(e)[0], x = e[b];
      f = h[b].getPixelForValue(x) - p + t;
    } else e === "center" ? f = (l.left + l.right) / 2 - p + t : f = As(n, e, t);
    g = nt(i, o, s), u = e === "left" ? -rt : rt;
  }
  return {
    titleX: f,
    titleY: g,
    maxWidth: d,
    rotation: u
  };
}
class je extends Ct {
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
    return t = lt(t, Number.POSITIVE_INFINITY), e = lt(e, Number.NEGATIVE_INFINITY), i = lt(i, Number.POSITIVE_INFINITY), s = lt(s, Number.NEGATIVE_INFINITY), {
      min: lt(t, i),
      max: lt(e, s),
      minDefined: G(t),
      maxDefined: G(e)
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
      min: lt(e, lt(i, e)),
      max: lt(i, lt(e, i))
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
    }, i), this.ticks = null, this._labelSizes = null, this._gridLineItems = null, this._labelItems = null, this.beforeSetDimensions(), this.setDimensions(), this.afterSetDimensions(), this._maxLength = this.isHorizontal() ? this.width + i.left + i.right : this.height + i.top + i.bottom, this._dataLimitsCached || (this.beforeDataLimits(), this.determineDataLimits(), this.afterDataLimits(), this._range = wc(this, r, s), this._dataLimitsCached = !0), this.beforeBuildTicks(), this.ticks = this.buildTicks() || [], this.afterBuildTicks();
    const c = a < this.ticks.length;
    this._convertTicksToLabels(c ? Is(this.ticks, a) : this.ticks), this.configure(), this.beforeCalculateLabelRotation(), this.calculateLabelRotation(), this.afterCalculateLabelRotation(), o.display && (o.autoSkip || o.source === "auto") && (this.ticks = Bl(this, this.ticks), this._labelSizes = null, this.afterAutoSkip()), c && this._convertTicksToLabels(this.ticks), this.beforeFit(), this.fit(), this.afterFit(), this.afterUpdate();
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
    const t = this.options, e = t.ticks, i = Es(this.ticks.length, t.ticks.maxTicksLimit), s = e.minRotation || 0, r = e.maxRotation;
    let o = s, a, c, l;
    if (!this._isVisible() || !e.display || s >= r || i <= 1 || !this.isHorizontal()) {
      this.labelRotation = s;
      return;
    }
    const h = this._getLabelSizes(), u = h.widest.width, d = h.highest.height, f = ot(this.chart.width - u, 0, this.maxWidth);
    a = t.offset ? this.maxWidth / i : f / (i - 1), u + 6 > a && (a = f / (i - (t.offset ? 0.5 : 1)), c = this.maxHeight - me(t.grid) - e.padding - $s(t.title, this.chart.options.font), l = Math.sqrt(u * u + d * d), o = Ya(Math.min(Math.asin(ot((h.highest.height + 6) / a, -1, 1)), Math.asin(ot(c / l, -1, 1)) - Math.asin(ot(d / l, -1, 1)))), o = Math.max(s, Math.min(r, o))), this.labelRotation = o;
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
      const c = $s(s, e.options.font);
      if (a ? (t.width = this.maxWidth, t.height = me(r) + c) : (t.height = this.maxHeight, t.width = me(r) + c), i.display && this.ticks.length) {
        const { first: l, last: h, widest: u, highest: d } = this._getLabelSizes(), f = i.padding * 2, g = Wt(this.labelRotation), m = Math.cos(g), p = Math.sin(g);
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
      R(t[e].label) && (t.splice(e, 1), i--, e--);
    this.afterTickToLabelConversion();
  }
  _getLabelSizes() {
    let t = this._labelSizes;
    if (!t) {
      const e = this.options.ticks.sampleSize;
      let i = this.ticks;
      e < i.length && (i = Is(i, e)), this._labelSizes = t = this._computeLabelSizes(i, i.length, this.options.ticks.maxTicksLimit);
    }
    return t;
  }
  _computeLabelSizes(t, e, i) {
    const { ctx: s, _longestTextCache: r } = this, o = [], a = [], c = Math.floor(e / Es(e, i));
    let l = 0, h = 0, u, d, f, g, m, p, b, x, v, M, w;
    for (u = 0; u < e; u += c) {
      if (g = t[u].label, m = this._resolveTickFontOptions(u), s.font = p = m.string, b = r[p] = r[p] || {
        data: {},
        gc: []
      }, x = m.lineHeight, v = M = 0, !R(g) && !U(g))
        v = hs(s, b.data, b.gc, v, g), M = x;
      else if (U(g))
        for (d = 0, f = g.length; d < f; ++d)
          w = g[d], !R(w) && !U(w) && (v = hs(s, b.data, b.gc, v, w), M += x);
      o.push(v), a.push(M), l = Math.max(v, l), h = Math.max(M, h);
    }
    Gl(r, e);
    const P = o.indexOf(l), D = a.indexOf(h), _ = (k) => ({
      width: o[k] || 0,
      height: a[k] || 0
    });
    return {
      first: _(0),
      last: _(e - 1),
      widest: _(P),
      highest: _(D),
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
    return Ua(this._alignToPixels ? Lt(this.chart, e, 0) : e);
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
      return i.$context || (i.$context = Zl(this.getContext(), t, i));
    }
    return this.$context || (this.$context = Kl(this.chart.getContext(), this));
  }
  _tickSize() {
    const t = this.options.ticks, e = Wt(this.labelRotation), i = Math.abs(Math.cos(e)), s = Math.abs(Math.sin(e)), r = this._getLabelSizes(), o = t.autoSkipPadding || 0, a = r ? r.widest.width + o : 0, c = r ? r.highest.height + o : 0;
    return this.isHorizontal() ? c * i > a * s ? a / i : c / s : c * s < a * i ? c / i : a / s;
  }
  _isVisible() {
    const t = this.options.display;
    return t !== "auto" ? !!t : this.getMatchingVisibleMetas().length > 0;
  }
  _computeGridLineItems(t) {
    const e = this.axis, i = this.chart, s = this.options, { grid: r, position: o, border: a } = s, c = r.offset, l = this.isHorizontal(), u = this.ticks.length + (c ? 1 : 0), d = me(r), f = [], g = a.setContext(this.getContext()), m = g.display ? g.width : 0, p = m / 2, b = function(X) {
      return Lt(i, X, m);
    };
    let x, v, M, w, P, D, _, k, O, T, C, q;
    if (o === "top")
      x = b(this.bottom), D = this.bottom - d, k = x - p, T = b(t.top) + p, q = t.bottom;
    else if (o === "bottom")
      x = b(this.top), T = t.top, q = b(t.bottom) - p, D = x + p, k = this.top + d;
    else if (o === "left")
      x = b(this.right), P = this.right - d, _ = x - p, O = b(t.left) + p, C = t.right;
    else if (o === "right")
      x = b(this.left), O = t.left, C = b(t.right) - p, P = x + p, _ = this.left + d;
    else if (e === "x") {
      if (o === "center")
        x = b((t.top + t.bottom) / 2 + 0.5);
      else if (E(o)) {
        const X = Object.keys(o)[0], it = o[X];
        x = b(this.chart.scales[X].getPixelForValue(it));
      }
      T = t.top, q = t.bottom, D = x + p, k = D + d;
    } else if (e === "y") {
      if (o === "center")
        x = b((t.left + t.right) / 2);
      else if (E(o)) {
        const X = Object.keys(o)[0], it = o[X];
        x = b(this.chart.scales[X].getPixelForValue(it));
      }
      P = x - p, _ = P - d, O = t.left, C = t.right;
    }
    const tt = A(s.ticks.maxTicksLimit, u), W = Math.max(1, Math.ceil(u / tt));
    for (v = 0; v < u; v += W) {
      const X = this.getContext(v), it = r.setContext(X), Xe = a.setContext(X), Qe = it.lineWidth, Gt = it.color, Ge = Xe.dash || [], Kt = Xe.dashOffset, le = it.tickWidth, At = it.tickColor, he = it.tickBorderDash || [], Et = it.tickBorderDashOffset;
      M = Ql(this, v, c), M !== void 0 && (w = Lt(i, M, Qe), l ? P = _ = O = C = w : D = k = T = q = w, f.push({
        tx1: P,
        ty1: D,
        tx2: _,
        ty2: k,
        x1: O,
        y1: T,
        x2: C,
        y2: q,
        width: Qe,
        color: Gt,
        borderDash: Ge,
        borderDashOffset: Kt,
        tickWidth: le,
        tickColor: At,
        tickBorderDash: he,
        tickBorderDashOffset: Et
      }));
    }
    return this._ticksLength = u, this._borderValue = x, f;
  }
  _computeLabelItems(t) {
    const e = this.axis, i = this.options, { position: s, ticks: r } = i, o = this.isHorizontal(), a = this.ticks, { align: c, crossAlign: l, padding: h, mirror: u } = r, d = me(i.grid), f = d + h, g = u ? -h : f, m = -Wt(this.labelRotation), p = [];
    let b, x, v, M, w, P, D, _, k, O, T, C, q = "middle";
    if (s === "top")
      P = this.bottom - g, D = this._getXAxisLabelAlignment();
    else if (s === "bottom")
      P = this.top + g, D = this._getXAxisLabelAlignment();
    else if (s === "left") {
      const W = this._getYAxisLabelAlignment(d);
      D = W.textAlign, w = W.x;
    } else if (s === "right") {
      const W = this._getYAxisLabelAlignment(d);
      D = W.textAlign, w = W.x;
    } else if (e === "x") {
      if (s === "center")
        P = (t.top + t.bottom) / 2 + f;
      else if (E(s)) {
        const W = Object.keys(s)[0], X = s[W];
        P = this.chart.scales[W].getPixelForValue(X) + f;
      }
      D = this._getXAxisLabelAlignment();
    } else if (e === "y") {
      if (s === "center")
        w = (t.left + t.right) / 2 - f;
      else if (E(s)) {
        const W = Object.keys(s)[0], X = s[W];
        w = this.chart.scales[W].getPixelForValue(X);
      }
      D = this._getYAxisLabelAlignment(d).textAlign;
    }
    e === "y" && (c === "start" ? q = "top" : c === "end" && (q = "bottom"));
    const tt = this._getLabelSizes();
    for (b = 0, x = a.length; b < x; ++b) {
      v = a[b], M = v.label;
      const W = r.setContext(this.getContext(b));
      _ = this.getPixelForTick(b) + r.labelOffset, k = this._resolveTickFontOptions(b), O = k.lineHeight, T = U(M) ? M.length : 1;
      const X = T / 2, it = W.color, Xe = W.textStrokeColor, Qe = W.textStrokeWidth;
      let Gt = D;
      o ? (w = _, D === "inner" && (b === x - 1 ? Gt = this.options.reverse ? "left" : "right" : b === 0 ? Gt = this.options.reverse ? "right" : "left" : Gt = "center"), s === "top" ? l === "near" || m !== 0 ? C = -T * O + O / 2 : l === "center" ? C = -tt.highest.height / 2 - X * O + O : C = -tt.highest.height + O / 2 : l === "near" || m !== 0 ? C = O / 2 : l === "center" ? C = tt.highest.height / 2 - X * O : C = tt.highest.height - T * O, u && (C *= -1), m !== 0 && !W.showLabelBackdrop && (w += O / 2 * Math.sin(m))) : (P = _, C = (1 - T) * O / 2);
      let Ge;
      if (W.showLabelBackdrop) {
        const Kt = ct(W.backdropPadding), le = tt.heights[b], At = tt.widths[b];
        let he = C - Kt.top, Et = 0 - Kt.left;
        switch (q) {
          case "middle":
            he -= le / 2;
            break;
          case "bottom":
            he -= le;
            break;
        }
        switch (D) {
          case "center":
            Et -= At / 2;
            break;
          case "right":
            Et -= At;
            break;
          case "inner":
            b === x - 1 ? Et -= At : b > 0 && (Et -= At / 2);
            break;
        }
        Ge = {
          left: Et,
          top: he,
          width: At + Kt.width,
          height: le + Kt.height,
          color: W.backdropColor
        };
      }
      p.push({
        label: M,
        font: k,
        textOffset: C,
        options: {
          rotation: m,
          color: it,
          strokeColor: Xe,
          strokeWidth: Qe,
          textAlign: Gt,
          textBaseline: q,
          translation: [
            w,
            P
          ],
          backdrop: Ge
        }
      });
    }
    return p;
  }
  _getXAxisLabelAlignment() {
    const { position: t, ticks: e } = this.options;
    if (-Wt(this.labelRotation))
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
    this.isHorizontal() ? (l = Lt(t, this.left, o) - o / 2, h = Lt(t, this.right, a) + a / 2, u = d = c) : (u = Lt(t, this.top, o) - o / 2, d = Lt(t, this.bottom, a) + a / 2, l = h = c), e.save(), e.lineWidth = r.width, e.strokeStyle = r.color, e.beginPath(), e.moveTo(l, u), e.lineTo(h, d), e.stroke(), e.restore();
  }
  drawLabels(t) {
    if (!this.options.ticks.display)
      return;
    const i = this.ctx, s = this._computeLabelArea();
    s && Cn(i, s);
    const r = this.getLabelItems(t);
    for (const o of r) {
      const a = o.options, c = o.font, l = o.label, h = o.textOffset;
      Mn(i, l, 0, h, c, a);
    }
    s && An(i);
  }
  drawTitle() {
    const { ctx: t, options: { position: e, title: i, reverse: s } } = this;
    if (!i.display)
      return;
    const r = J(i.font), o = ct(i.padding), a = i.align;
    let c = r.lineHeight / 2;
    e === "bottom" || e === "center" || E(e) ? (c += o.bottom, U(i.text) && (c += r.lineHeight * (i.text.length - 1))) : c += o.top;
    const { titleX: l, titleY: h, maxWidth: u, rotation: d } = th(this, c, e, a);
    Mn(t, i.text, 0, 0, r, {
      color: i.color,
      maxWidth: u,
      rotation: d,
      textAlign: Jl(a, e, s),
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
    return !this._isVisible() || this.draw !== je.prototype.draw ? [
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
    return J(e.font);
  }
  _maxDigits() {
    const t = this._resolveTickFontOptions(0).lineHeight;
    return (this.isHorizontal() ? this.width : this.height) / t;
  }
}
class an {
  constructor(t, e, i) {
    this.type = t, this.scope = e, this.override = i, this.items = /* @__PURE__ */ Object.create(null);
  }
  isForType(t) {
    return Object.prototype.isPrototypeOf.call(this.type.prototype, t.prototype);
  }
  register(t) {
    const e = Object.getPrototypeOf(t);
    let i;
    ih(e) && (i = this.register(e));
    const s = this.items, r = t.id, o = this.scope + "." + r;
    if (!r)
      throw new Error("class does not have id: " + t);
    return r in s || (s[r] = t, eh(t, o, i), this.override && B.override(t.id, t.overrides)), o;
  }
  get(t) {
    return this.items[t];
  }
  unregister(t) {
    const e = this.items, i = t.id, s = this.scope;
    i in e && delete e[i], s && i in B[s] && (delete B[s][i], this.override && delete Ut[i]);
  }
}
function eh(n, t, e) {
  const i = Re(/* @__PURE__ */ Object.create(null), [
    e ? B.get(e) : {},
    B.get(t),
    n.defaults
  ]);
  B.set(t, i), n.defaultRoutes && nh(t, n.defaultRoutes), n.descriptors && B.describe(t, n.descriptors);
}
function nh(n, t) {
  Object.keys(t).forEach((e) => {
    const i = e.split("."), s = i.pop(), r = [
      n
    ].concat(i).join("."), o = t[e].split("."), a = o.pop(), c = o.join(".");
    B.route(r, s, c, a);
  });
}
function ih(n) {
  return "id" in n && "defaults" in n;
}
class sh {
  constructor() {
    this.controllers = new an(Ae, "datasets", !0), this.elements = new an(Ct, "elements"), this.plugins = new an(Object, "plugins"), this.scales = new an(je, "scales"), this._typedRegistries = [
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
    const s = vi(t);
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
var ut = /* @__PURE__ */ new sh();
class rh {
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
    R(this._cache) || (this._oldCache = this._cache, this._cache = void 0);
  }
  _descriptors(t) {
    if (this._cache)
      return this._cache;
    const e = this._cache = this._createDescriptors(t);
    return this._notifyStateChanges(t), e;
  }
  _createDescriptors(t, e) {
    const i = t && t.config, s = A(i.options && i.options.plugins, {}), r = oh(i);
    return s === !1 && !e ? [] : ch(t, r, s, e);
  }
  _notifyStateChanges(t) {
    const e = this._oldCache || [], i = this._cache, s = (r, o) => r.filter((a) => !o.some((c) => a.plugin.id === c.plugin.id));
    this._notify(s(e, i), t, "stop"), this._notify(s(i, e), t, "start");
  }
}
function oh(n) {
  const t = {}, e = [], i = Object.keys(ut.plugins.items);
  for (let r = 0; r < i.length; r++)
    e.push(ut.getPlugin(i[r]));
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
function ah(n, t) {
  return !t && n === !1 ? null : n === !0 ? {} : n;
}
function ch(n, { plugins: t, localIds: e }, i, s) {
  const r = [], o = n.getContext();
  for (const a of t) {
    const c = a.id, l = ah(i[c], s);
    l !== null && r.push({
      plugin: a,
      options: lh(n.config, {
        plugin: a,
        local: e[c]
      }, l, o)
    });
  }
  return r;
}
function lh(n, { plugin: t, local: e }, i, s) {
  const r = n.pluginScopeKeys(t), o = n.getOptionScopes(i, r);
  return e && t.defaults && o.push(t.defaults), n.createResolver(o, s, [
    ""
  ], {
    scriptable: !1,
    indexable: !1,
    allKeys: !0
  });
}
function oi(n, t) {
  const e = B.datasets[n] || {};
  return ((t.datasets || {})[n] || {}).indexAxis || t.indexAxis || e.indexAxis || "x";
}
function hh(n, t) {
  let e = n;
  return n === "_index_" ? e = t : n === "_value_" && (e = t === "x" ? "y" : "x"), e;
}
function uh(n, t) {
  return n === t ? "_index_" : "_value_";
}
function Ls(n) {
  if (n === "x" || n === "y" || n === "r")
    return n;
}
function dh(n) {
  if (n === "top" || n === "bottom")
    return "x";
  if (n === "left" || n === "right")
    return "y";
}
function ai(n, ...t) {
  if (Ls(n))
    return n;
  for (const e of t) {
    const i = e.axis || dh(e.position) || n.length > 1 && Ls(n[0].toLowerCase());
    if (i)
      return i;
  }
  throw new Error(`Cannot determine type of '${n}' axis. Please provide 'axis' or 'position' option.`);
}
function Fs(n, t, e) {
  if (e[t + "AxisID"] === n)
    return {
      axis: t
    };
}
function fh(n, t) {
  if (t.data && t.data.datasets) {
    const e = t.data.datasets.filter((i) => i.xAxisID === n || i.yAxisID === n);
    if (e.length)
      return Fs(n, "x", e[0]) || Fs(n, "y", e[0]);
  }
  return {};
}
function gh(n, t) {
  const e = Ut[n.type] || {
    scales: {}
  }, i = t.scales || {}, s = oi(n.type, t), r = /* @__PURE__ */ Object.create(null);
  return Object.keys(i).forEach((o) => {
    const a = i[o];
    if (!E(a))
      return console.error(`Invalid scale configuration for scale: ${o}`);
    if (a._proxy)
      return console.warn(`Ignoring resolver passed as options for scale: ${o}`);
    const c = ai(o, a, fh(o, n), B.scales[a.type]), l = uh(c, s), h = e.scales || {};
    r[o] = Pe(/* @__PURE__ */ Object.create(null), [
      {
        axis: c
      },
      a,
      h[c],
      h[l]
    ]);
  }), n.data.datasets.forEach((o) => {
    const a = o.type || n.type, c = o.indexAxis || oi(a, t), h = (Ut[a] || {}).scales || {};
    Object.keys(h).forEach((u) => {
      const d = hh(u, c), f = o[d + "AxisID"] || d;
      r[f] = r[f] || /* @__PURE__ */ Object.create(null), Pe(r[f], [
        {
          axis: d
        },
        i[f],
        h[u]
      ]);
    });
  }), Object.keys(r).forEach((o) => {
    const a = r[o];
    Pe(a, [
      B.scales[a.type],
      B.scale
    ]);
  }), r;
}
function no(n) {
  const t = n.options || (n.options = {});
  t.plugins = A(t.plugins, {}), t.scales = gh(n, t);
}
function io(n) {
  return n = n || {}, n.datasets = n.datasets || [], n.labels = n.labels || [], n;
}
function mh(n) {
  return n = n || {}, n.data = io(n.data), no(n), n;
}
const Rs = /* @__PURE__ */ new Map(), so = /* @__PURE__ */ new Set();
function cn(n, t) {
  let e = Rs.get(n);
  return e || (e = t(), Rs.set(n, e), so.add(e)), e;
}
const pe = (n, t, e) => {
  const i = xn(t, e);
  i !== void 0 && n.add(i);
};
class ph {
  constructor(t) {
    this._config = mh(t), this._scopeCache = /* @__PURE__ */ new Map(), this._resolverCache = /* @__PURE__ */ new Map();
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
    this._config.data = io(t);
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
    this.clearCache(), no(t);
  }
  clearCache() {
    this._scopeCache.clear(), this._resolverCache.clear();
  }
  datasetScopeKeys(t) {
    return cn(t, () => [
      [
        `datasets.${t}`,
        ""
      ]
    ]);
  }
  datasetAnimationScopeKeys(t, e) {
    return cn(`${t}.transition.${e}`, () => [
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
    return cn(`${t}-${e}`, () => [
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
    return cn(`${i}-plugin-${e}`, () => [
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
      t && (c.add(t), h.forEach((u) => pe(c, t, u))), h.forEach((u) => pe(c, s, u)), h.forEach((u) => pe(c, Ut[r] || {}, u)), h.forEach((u) => pe(c, B, u)), h.forEach((u) => pe(c, ii, u));
    });
    const l = Array.from(c);
    return l.length === 0 && l.push(/* @__PURE__ */ Object.create(null)), so.has(e) && o.set(e, l), l;
  }
  chartOptionScopes() {
    const { options: t, type: e } = this;
    return [
      t,
      Ut[e] || {},
      B.datasets[e] || {},
      {
        type: e
      },
      B,
      ii
    ];
  }
  resolveNamedOptions(t, e, i, s = [
    ""
  ]) {
    const r = {
      $shared: !0
    }, { resolver: o, subPrefixes: a } = Hs(this._resolverCache, t, s);
    let c = o;
    if (yh(o, e)) {
      r.$shared = !1, i = Tt(i) ? i() : i;
      const l = this.createResolver(t, i, a);
      c = oe(o, i, l);
    }
    for (const l of e)
      r[l] = c[l];
    return r;
  }
  createResolver(t, e, i = [
    ""
  ], s) {
    const { resolver: r } = Hs(this._resolverCache, t, i);
    return E(e) ? oe(r, e, void 0, s) : r;
  }
}
function Hs(n, t, e) {
  let i = n.get(t);
  i || (i = /* @__PURE__ */ new Map(), n.set(t, i));
  const s = e.join();
  let r = i.get(s);
  return r || (r = {
    resolver: Di(t, e),
    subPrefixes: e.filter((a) => !a.toLowerCase().includes("hover"))
  }, i.set(s, r)), r;
}
const bh = (n) => E(n) && Object.getOwnPropertyNames(n).some((t) => Tt(n[t]));
function yh(n, t) {
  const { isScriptable: e, isIndexable: i } = Rr(n);
  for (const s of t) {
    const r = e(s), o = i(s), a = (o || r) && n[s];
    if (r && (Tt(a) || bh(a)) || o && U(a))
      return !0;
  }
  return !1;
}
var _h = "4.5.1";
const xh = [
  "top",
  "bottom",
  "left",
  "right",
  "chartArea"
];
function zs(n, t) {
  return n === "top" || n === "bottom" || xh.indexOf(n) === -1 && t === "x";
}
function Ns(n, t) {
  return function(e, i) {
    return e[n] === i[n] ? e[t] - i[t] : e[n] - i[n];
  };
}
function Ws(n) {
  const t = n.chart, e = t.options.animation;
  t.notifyPlugins("afterRender"), F(e && e.onComplete, [
    n
  ], t);
}
function wh(n) {
  const t = n.chart, e = t.options.animation;
  F(e && e.onProgress, [
    n
  ], t);
}
function ro(n) {
  return Oi() && typeof n == "string" ? n = document.getElementById(n) : n && n.length && (n = n[0]), n && n.canvas && (n = n.canvas), n;
}
const mn = {}, Bs = (n) => {
  const t = ro(n);
  return Object.values(mn).filter((e) => e.canvas === t).pop();
};
function vh(n, t, e) {
  const i = Object.keys(n);
  for (const s of i) {
    const r = +s;
    if (r >= t) {
      const o = n[s];
      delete n[s], (e > 0 || r > t) && (n[r + e] = o);
    }
  }
}
function Mh(n, t, e, i) {
  return !e || n.type === "mouseout" ? null : i ? t : n;
}
class xt {
  static register(...t) {
    ut.add(...t), Ys();
  }
  static unregister(...t) {
    ut.remove(...t), Ys();
  }
  constructor(t, e) {
    const i = this.config = new ph(e), s = ro(t), r = Bs(s);
    if (r)
      throw new Error("Canvas is already in use. Chart with ID '" + r.id + "' must be destroyed before the canvas with ID '" + r.canvas.id + "' can be reused.");
    const o = i.createResolver(i.chartOptionScopes(), this.getContext());
    this.platform = new (i.platform || Wl(s))(), this.platform.updateConfig(i);
    const a = this.platform.acquireContext(s, o.aspectRatio), c = a && a.canvas, l = c && c.height, h = c && c.width;
    if (this.id = Ca(), this.ctx = a, this.canvas = c, this.width = h, this.height = l, this._options = o, this._aspectRatio = this.aspectRatio, this._layers = [], this._metasets = [], this._stacks = void 0, this.boxes = [], this.currentDevicePixelRatio = void 0, this.chartArea = void 0, this._active = [], this._lastEvent = void 0, this._listeners = {}, this._responsiveListeners = void 0, this._sortedMetasets = [], this.scales = {}, this._plugins = new rh(), this.$proxies = {}, this._hiddenIndices = {}, this.attached = !1, this._animationsDisabled = void 0, this.$context = void 0, this._doResize = Ka((u) => this.update(u), o.resizeDelay || 0), this._dataChanges = [], mn[this.id] = this, !a || !c) {
      console.error("Failed to create chart: can't acquire context from the given item");
      return;
    }
    bt.listen(this, "complete", Ws), bt.listen(this, "progress", wh), this._initialize(), this.attached && this.update();
  }
  get aspectRatio() {
    const { options: { aspectRatio: t, maintainAspectRatio: e }, width: i, height: s, _aspectRatio: r } = this;
    return R(t) ? e && r ? r : s ? i / s : null : t;
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
    return ut;
  }
  _initialize() {
    return this.notifyPlugins("beforeInit"), this.options.responsive ? this.resize() : gs(this, this.options.devicePixelRatio), this.bindEvents(), this.notifyPlugins("afterInit"), this;
  }
  clear() {
    return us(this.canvas, this.ctx), this;
  }
  stop() {
    return bt.stop(this), this;
  }
  resize(t, e) {
    bt.running(this) ? this._resizeBeforeDraw = {
      width: t,
      height: e
    } : this._resize(t, e);
  }
  _resize(t, e) {
    const i = this.options, s = this.canvas, r = i.maintainAspectRatio && this.aspectRatio, o = this.platform.getMaximumSize(s, t, e, r), a = i.devicePixelRatio || this.platform.getDevicePixelRatio(), c = this.width ? "resize" : "attach";
    this.width = o.width, this.height = o.height, this._aspectRatio = this.aspectRatio, gs(this, a, !0) && (this.notifyPlugins("resize", {
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
      const a = e[o], c = ai(o, a), l = c === "r", h = c === "x";
      return {
        options: a,
        dposition: l ? "chartArea" : h ? "bottom" : "left",
        dtype: l ? "radialLinear" : h ? "category" : "linear"
      };
    }))), L(r, (o) => {
      const a = o.options, c = a.id, l = ai(c, a), h = A(a.type, o.dtype);
      (a.position === void 0 || zs(a.position, l) !== zs(o.dposition)) && (a.position = o.dposition), s[c] = !0;
      let u = null;
      if (c in i && i[c].type === h)
        u = i[c];
      else {
        const d = ut.getScale(h);
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
      Dt.configure(this, o, o.options), Dt.addBox(this, o);
    });
  }
  _updateMetasets() {
    const t = this._metasets, e = this.data.datasets.length, i = t.length;
    if (t.sort((s, r) => s.index - r.index), i > e) {
      for (let s = e; s < i; ++s)
        this._destroyDatasetMeta(s);
      t.splice(e, i - e);
    }
    this._sortedMetasets = t.slice(0).sort(Ns("order", "index"));
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
      if (o.type && o.type !== a && (this._destroyDatasetMeta(i), o = this.getDatasetMeta(i)), o.type = a, o.indexAxis = r.indexAxis || oi(a, this.options), o.order = r.order || 0, o.index = i, o.label = "" + r.label, o.visible = this.isDatasetVisible(i), o.controller)
        o.controller.updateIndex(i), o.controller.linkScales();
      else {
        const c = ut.getController(a), { datasetElementType: l, dataElementType: h } = B.datasets[a];
        Object.assign(c, {
          dataElementType: ut.getElement(h),
          datasetElementType: l && ut.getElement(l)
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
    }), this._layers.sort(Ns("z", "_idx"));
    const { _active: a, _lastEvent: c } = this;
    c ? this._eventHandler(c, !0) : a.length && this._updateHoverStyles(a, a, !0), this.render();
  }
  _updateScales() {
    L(this.scales, (t) => {
      Dt.removeBox(this, t);
    }), this.ensureScalesHaveIDs(), this.buildOrUpdateScales();
  }
  _checkEventBindings() {
    const t = this.options, e = new Set(Object.keys(this._listeners)), i = new Set(t.events);
    (!es(e, i) || !!this._responsiveListeners !== t.responsive) && (this.unbindEvents(), this.bindEvents());
  }
  _updateHiddenIndices() {
    const { _hiddenIndices: t } = this, e = this._getUniformDataChanges() || [];
    for (const { method: i, start: s, count: r } of e) {
      const o = i === "_removeElements" ? -r : r;
      vh(t, s, o);
    }
  }
  _getUniformDataChanges() {
    const t = this._dataChanges;
    if (!t || !t.length)
      return;
    this._dataChanges = [];
    const e = this.data.datasets.length, i = (r) => new Set(t.filter((o) => o[0] === r).map((o, a) => a + "," + o.splice(1).join(","))), s = i(0);
    for (let r = 1; r < e; r++)
      if (!es(s, i(r)))
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
    Dt.update(this, this.width, this.height, t);
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
        this._updateDataset(e, Tt(t) ? t({
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
    }) !== !1 && (bt.has(this) ? this.attached && !bt.running(this) && bt.start(this) : (this.draw(), Ws({
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
    }, s = qr(this, t);
    this.notifyPlugins("beforeDatasetDraw", i) !== !1 && (s && Cn(e, s), t.controller.draw(), s && An(e), i.cancelable = !1, this.notifyPlugins("afterDatasetDraw", i));
  }
  isPointInArea(t) {
    return ze(t, this.chartArea, this._minPadding);
  }
  getElementsAtEventForMode(t, e, i, s) {
    const r = xl.modes[e];
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
    return this.$context || (this.$context = qt(null, {
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
    wn(e) ? (r.data[e].hidden = !i, this.update()) : (this.setDatasetVisibility(t, i), o.update(r, {
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
    for (this.stop(), bt.remove(this), t = 0, e = this.data.datasets.length; t < e; ++t)
      this._destroyDatasetMeta(t);
  }
  destroy() {
    this.notifyPlugins("beforeDestroy");
    const { canvas: t, ctx: e } = this;
    this._stop(), this.config.clearCache(), t && (this.unbindEvents(), us(t, e), this.platform.releaseContext(e), this.canvas = null, this.ctx = null), delete mn[this.id], this.notifyPlugins("afterDestroy");
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
    !yn(i, e) && (this._active = i, this._lastEvent = null, this._updateHoverStyles(i, e));
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
    const { _active: s = [], options: r } = this, o = e, a = this._getActiveElements(t, s, i, o), c = Fa(t), l = Mh(t, this._lastEvent, i, c);
    i && (this._lastEvent = null, F(r.onHover, [
      t,
      a,
      this
    ], this), c && F(r.onClick, [
      t,
      a,
      this
    ], this));
    const h = !yn(a, s);
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
y(xt, "defaults", B), y(xt, "instances", mn), y(xt, "overrides", Ut), y(xt, "registry", ut), y(xt, "version", _h), y(xt, "getChart", Bs);
function Ys() {
  return L(xt.instances, (n) => n._plugins.invalidate());
}
function oo(n, t, e = t) {
  n.lineCap = A(e.borderCapStyle, t.borderCapStyle), n.setLineDash(A(e.borderDash, t.borderDash)), n.lineDashOffset = A(e.borderDashOffset, t.borderDashOffset), n.lineJoin = A(e.borderJoinStyle, t.borderJoinStyle), n.lineWidth = A(e.borderWidth, t.borderWidth), n.strokeStyle = A(e.borderColor, t.borderColor);
}
function kh(n, t, e) {
  n.lineTo(e.x, e.y);
}
function Dh(n) {
  return n.stepped ? uc : n.tension || n.cubicInterpolationMode === "monotone" ? dc : kh;
}
function ao(n, t, e = {}) {
  const i = n.length, { start: s = 0, end: r = i - 1 } = e, { start: o, end: a } = t, c = Math.max(s, o), l = Math.min(r, a), h = s < o && r < o || s > a && r > a;
  return {
    count: i,
    start: c,
    loop: t.loop,
    ilen: l < c && !h ? i + l - c : l - c
  };
}
function Ph(n, t, e, i) {
  const { points: s, options: r } = t, { count: o, start: a, loop: c, ilen: l } = ao(s, e, i), h = Dh(r);
  let { move: u = !0, reverse: d } = i || {}, f, g, m;
  for (f = 0; f <= l; ++f)
    g = s[(a + (d ? l - f : f)) % o], !g.skip && (u ? (n.moveTo(g.x, g.y), u = !1) : h(n, m, g, d, r.stepped), m = g);
  return c && (g = s[(a + (d ? l : 0)) % o], h(n, m, g, d, r.stepped)), !!c;
}
function Sh(n, t, e, i) {
  const s = t.points, { count: r, start: o, ilen: a } = ao(s, e, i), { move: c = !0, reverse: l } = i || {};
  let h = 0, u = 0, d, f, g, m, p, b;
  const x = (M) => (o + (l ? a - M : M)) % r, v = () => {
    m !== p && (n.lineTo(h, p), n.lineTo(h, m), n.lineTo(h, b));
  };
  for (c && (f = s[x(0)], n.moveTo(f.x, f.y)), d = 0; d <= a; ++d) {
    if (f = s[x(d)], f.skip)
      continue;
    const M = f.x, w = f.y, P = M | 0;
    P === g ? (w < m ? m = w : w > p && (p = w), h = (u * h + M) / ++u) : (v(), n.lineTo(M, w), g = P, u = 0, m = p = w), b = w;
  }
  v();
}
function ci(n) {
  const t = n.options, e = t.borderDash && t.borderDash.length;
  return !n._decimated && !n._loop && !t.tension && t.cubicInterpolationMode !== "monotone" && !t.stepped && !e ? Sh : Ph;
}
function Oh(n) {
  return n.stepped ? Vc : n.tension || n.cubicInterpolationMode === "monotone" ? Uc : Ht;
}
function Th(n, t, e, i) {
  let s = t._path;
  s || (s = t._path = new Path2D(), t.path(s, e, i) && s.closePath()), oo(n, t.options), n.stroke(s);
}
function Ch(n, t, e, i) {
  const { segments: s, options: r } = t, o = ci(t);
  for (const a of s)
    oo(n, r, a.style), n.beginPath(), o(n, t, a, {
      start: e,
      end: e + i - 1
    }) && n.closePath(), n.stroke();
}
const Ah = typeof Path2D == "function";
function Eh(n, t, e, i) {
  Ah && !t.options.segment ? Th(n, t, e, i) : Ch(n, t, e, i);
}
class Pt extends Ct {
  constructor(t) {
    super(), this.animated = !0, this.options = void 0, this._chart = void 0, this._loop = void 0, this._fullLoop = void 0, this._path = void 0, this._points = void 0, this._segments = void 0, this._decimated = !1, this._pointsUpdated = !1, this._datasetIndex = void 0, t && Object.assign(this, t);
  }
  updateControlPoints(t, e) {
    const i = this.options;
    if ((i.tension || i.cubicInterpolationMode === "monotone") && !i.stepped && !this._pointsUpdated) {
      const s = i.spanGaps ? this._loop : this._fullLoop;
      Rc(this._points, i, t, s, e), this._pointsUpdated = !0;
    }
  }
  set points(t) {
    this._points = t, delete this._segments, delete this._path, this._pointsUpdated = !1;
  }
  get points() {
    return this._points;
  }
  get segments() {
    return this._segments || (this._segments = Zc(this, this.options.segment));
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
    const i = this.options, s = t[e], r = this.points, o = Ur(this, {
      property: e,
      start: s,
      end: s
    });
    if (!o.length)
      return;
    const a = [], c = Oh(i);
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
    return ci(this)(t, this, e, i);
  }
  path(t, e, i) {
    const s = this.segments, r = ci(this);
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
    (this.points || []).length && r.borderWidth && (t.save(), Eh(t, this, i, s), t.restore()), this.animated && (this._pointsUpdated = !1, this._path = void 0);
  }
}
y(Pt, "id", "line"), y(Pt, "defaults", {
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
}), y(Pt, "defaultRoutes", {
  backgroundColor: "backgroundColor",
  borderColor: "borderColor"
}), y(Pt, "descriptors", {
  _scriptable: !0,
  _indexable: (t) => t !== "borderDash" && t !== "fill"
});
function js(n, t, e, i) {
  const s = n.options, { [e]: r } = n.getProps([
    e
  ], i);
  return Math.abs(t - r) < s.radius + s.hitRadius;
}
class pn extends Ct {
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
    return js(this, e, "x", i);
  }
  inYRange(e, i) {
    return js(this, e, "y", i);
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
    this.skip || s.radius < 0.1 || !ze(this, i, this.size(s) / 2) || (e.strokeStyle = s.borderColor, e.lineWidth = s.borderWidth, e.fillStyle = s.backgroundColor, si(e, s, this.x, this.y));
  }
  getRange() {
    const e = this.options || {};
    return e.radius + e.hitRadius;
  }
}
y(pn, "id", "point"), /**
* @type {any}
*/
y(pn, "defaults", {
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
y(pn, "defaultRoutes", {
  backgroundColor: "backgroundColor",
  borderColor: "borderColor"
});
function Ih(n, t, e) {
  const i = n.segments, s = n.points, r = t.points, o = [];
  for (const a of i) {
    let { start: c, end: l } = a;
    l = $n(c, l, s);
    const h = li(e, s[c], s[l], a.loop);
    if (!t.segments) {
      o.push({
        source: a,
        target: h,
        start: s[c],
        end: s[l]
      });
      continue;
    }
    const u = Ur(t, h);
    for (const d of u) {
      const f = li(e, r[d.start], r[d.end], d.loop), g = Vr(a, s, f);
      for (const m of g)
        o.push({
          source: m,
          target: d,
          start: {
            [e]: Vs(h, f, "start", Math.max)
          },
          end: {
            [e]: Vs(h, f, "end", Math.min)
          }
        });
    }
  }
  return o;
}
function li(n, t, e, i) {
  if (i)
    return;
  let s = t[n], r = e[n];
  return n === "angle" && (s = dt(s), r = dt(r)), {
    property: n,
    start: s,
    end: r
  };
}
function $h(n, t) {
  const { x: e = null, y: i = null } = n || {}, s = t.points, r = [];
  return t.segments.forEach(({ start: o, end: a }) => {
    a = $n(o, a, s);
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
function $n(n, t, e) {
  for (; t > n; t--) {
    const i = e[t];
    if (!isNaN(i.x) && !isNaN(i.y))
      break;
  }
  return t;
}
function Vs(n, t, e, i) {
  return n && t ? i(n[e], t[e]) : n ? n[e] : t ? t[e] : 0;
}
function co(n, t) {
  let e = [], i = !1;
  return U(n) ? (i = !0, e = n) : e = $h(n, t), e.length ? new Pt({
    points: e,
    options: {
      tension: 0
    },
    _loop: i,
    _fullLoop: i
  }) : null;
}
function Us(n) {
  return n && n.fill !== !1;
}
function Lh(n, t, e) {
  let s = n[t].fill;
  const r = [
    t
  ];
  let o;
  if (!e)
    return s;
  for (; s !== !1 && r.indexOf(s) === -1; ) {
    if (!G(s))
      return s;
    if (o = n[s], !o)
      return !1;
    if (o.visible)
      return s;
    r.push(s), s = o.fill;
  }
  return !1;
}
function Fh(n, t, e) {
  const i = Nh(n);
  if (E(i))
    return isNaN(i.value) ? !1 : i;
  let s = parseFloat(i);
  return G(s) && Math.floor(s) === s ? Rh(i[0], t, s, e) : [
    "origin",
    "start",
    "end",
    "stack",
    "shape"
  ].indexOf(i) >= 0 && i;
}
function Rh(n, t, e, i) {
  return (n === "-" || n === "+") && (e = t + e), e === t || e < 0 || e >= i ? !1 : e;
}
function Hh(n, t) {
  let e = null;
  return n === "start" ? e = t.bottom : n === "end" ? e = t.top : E(n) ? e = t.getPixelForValue(n.value) : t.getBasePixel && (e = t.getBasePixel()), e;
}
function zh(n, t, e) {
  let i;
  return n === "start" ? i = e : n === "end" ? i = t.options.reverse ? t.min : t.max : E(n) ? i = n.value : i = t.getBaseValue(), i;
}
function Nh(n) {
  const t = n.options, e = t.fill;
  let i = A(e && e.target, e);
  return i === void 0 && (i = !!t.backgroundColor), i === !1 || i === null ? !1 : i === !0 ? "origin" : i;
}
function Wh(n) {
  const { scale: t, index: e, line: i } = n, s = [], r = i.segments, o = i.points, a = Bh(t, e);
  a.push(co({
    x: null,
    y: t.bottom
  }, i));
  for (let c = 0; c < r.length; c++) {
    const l = r[c];
    for (let h = l.start; h <= l.end; h++)
      Yh(s, o[h], a);
  }
  return new Pt({
    points: s,
    options: {}
  });
}
function Bh(n, t) {
  const e = [], i = n.getMatchingVisibleMetas("line");
  for (let s = 0; s < i.length; s++) {
    const r = i[s];
    if (r.index === t)
      break;
    r.hidden || e.unshift(r.dataset);
  }
  return e;
}
function Yh(n, t, e) {
  const i = [];
  for (let s = 0; s < e.length; s++) {
    const r = e[s], { first: o, last: a, point: c } = jh(r, t, "x");
    if (!(!c || o && a)) {
      if (o)
        i.unshift(c);
      else if (n.push(c), !a)
        break;
    }
  }
  n.push(...i);
}
function jh(n, t, e) {
  const i = n.interpolate(t, e);
  if (!i)
    return {};
  const s = i[e], r = n.segments, o = n.points;
  let a = !1, c = !1;
  for (let l = 0; l < r.length; l++) {
    const h = r[l], u = o[h.start][e], d = o[h.end][e];
    if (ee(s, u, d)) {
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
class lo {
  constructor(t) {
    this.x = t.x, this.y = t.y, this.radius = t.radius;
  }
  pathSegment(t, e, i) {
    const { x: s, y: r, radius: o } = this;
    return e = e || {
      start: 0,
      end: at
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
function Vh(n) {
  const { chart: t, fill: e, line: i } = n;
  if (G(e))
    return Uh(t, e);
  if (e === "stack")
    return Wh(n);
  if (e === "shape")
    return !0;
  const s = qh(n);
  return s instanceof lo ? s : co(s, i);
}
function Uh(n, t) {
  const e = n.getDatasetMeta(t);
  return e && n.isDatasetVisible(t) ? e.dataset : null;
}
function qh(n) {
  return (n.scale || {}).getPointPositionForValue ? Qh(n) : Xh(n);
}
function Xh(n) {
  const { scale: t = {}, fill: e } = n, i = Hh(e, t);
  if (G(i)) {
    const s = t.isHorizontal();
    return {
      x: s ? i : null,
      y: s ? null : i
    };
  }
  return null;
}
function Qh(n) {
  const { scale: t, fill: e } = n, i = t.options, s = t.getLabels().length, r = i.reverse ? t.max : t.min, o = zh(e, t, r), a = [];
  if (i.grid.circular) {
    const c = t.getPointPositionForValue(0, r);
    return new lo({
      x: c.x,
      y: c.y,
      radius: t.getDistanceFromCenterForValue(o)
    });
  }
  for (let c = 0; c < s; ++c)
    a.push(t.getPointPositionForValue(c, o));
  return a;
}
function Gn(n, t, e) {
  const i = Vh(t), { chart: s, index: r, line: o, scale: a, axis: c } = t, l = o.options, h = l.fill, u = l.backgroundColor, { above: d = u, below: f = u } = h || {}, g = s.getDatasetMeta(r), m = qr(s, g);
  i && o.points.length && (Cn(n, e), Gh(n, {
    line: o,
    target: i,
    above: d,
    below: f,
    area: e,
    scale: a,
    axis: c,
    clip: m
  }), An(n));
}
function Gh(n, t) {
  const { line: e, target: i, above: s, below: r, area: o, scale: a, clip: c } = t, l = e._loop ? "angle" : t.axis;
  n.save();
  let h = r;
  r !== s && (l === "x" ? (qs(n, i, o.top), Kn(n, {
    line: e,
    target: i,
    color: s,
    scale: a,
    property: l,
    clip: c
  }), n.restore(), n.save(), qs(n, i, o.bottom)) : l === "y" && (Xs(n, i, o.left), Kn(n, {
    line: e,
    target: i,
    color: r,
    scale: a,
    property: l,
    clip: c
  }), n.restore(), n.save(), Xs(n, i, o.right), h = s)), Kn(n, {
    line: e,
    target: i,
    color: h,
    scale: a,
    property: l,
    clip: c
  }), n.restore();
}
function qs(n, t, e) {
  const { segments: i, points: s } = t;
  let r = !0, o = !1;
  n.beginPath();
  for (const a of i) {
    const { start: c, end: l } = a, h = s[c], u = s[$n(c, l, s)];
    r ? (n.moveTo(h.x, h.y), r = !1) : (n.lineTo(h.x, e), n.lineTo(h.x, h.y)), o = !!t.pathSegment(n, a, {
      move: o
    }), o ? n.closePath() : n.lineTo(u.x, e);
  }
  n.lineTo(t.first().x, e), n.closePath(), n.clip();
}
function Xs(n, t, e) {
  const { segments: i, points: s } = t;
  let r = !0, o = !1;
  n.beginPath();
  for (const a of i) {
    const { start: c, end: l } = a, h = s[c], u = s[$n(c, l, s)];
    r ? (n.moveTo(h.x, h.y), r = !1) : (n.lineTo(e, h.y), n.lineTo(h.x, h.y)), o = !!t.pathSegment(n, a, {
      move: o
    }), o ? n.closePath() : n.lineTo(e, u.y);
  }
  n.lineTo(e, t.first().y), n.closePath(), n.clip();
}
function Kn(n, t) {
  const { line: e, target: i, property: s, color: r, scale: o, clip: a } = t, c = Ih(e, i, s);
  for (const { source: l, target: h, start: u, end: d } of c) {
    const { style: { backgroundColor: f = r } = {} } = l, g = i !== !0;
    n.save(), n.fillStyle = f, Kh(n, o, a, g && li(s, u, d)), n.beginPath();
    const m = !!e.pathSegment(n, l);
    let p;
    if (g) {
      m ? n.closePath() : Qs(n, i, d, s);
      const b = !!i.pathSegment(n, h, {
        move: m,
        reverse: !0
      });
      p = m && b, p || Qs(n, i, u, s);
    }
    n.closePath(), n.fill(p ? "evenodd" : "nonzero"), n.restore();
  }
}
function Kh(n, t, e, i) {
  const s = t.chart.chartArea, { property: r, start: o, end: a } = i || {};
  if (r === "x" || r === "y") {
    let c, l, h, u;
    r === "x" ? (c = o, l = s.top, h = a, u = s.bottom) : (c = s.left, l = o, h = s.right, u = a), n.beginPath(), e && (c = Math.max(c, e.left), h = Math.min(h, e.right), l = Math.max(l, e.top), u = Math.min(u, e.bottom)), n.rect(c, l, h - c, u - l), n.clip();
  }
}
function Qs(n, t, e, i) {
  const s = t.interpolate(e, i);
  s && n.lineTo(s.x, s.y);
}
var Zh = {
  id: "filler",
  afterDatasetsUpdate(n, t, e) {
    const i = (n.data.datasets || []).length, s = [];
    let r, o, a, c;
    for (o = 0; o < i; ++o)
      r = n.getDatasetMeta(o), a = r.dataset, c = null, a && a.options && a instanceof Pt && (c = {
        visible: n.isDatasetVisible(o),
        index: o,
        fill: Fh(a, o, i),
        chart: n,
        axis: r.controller.options.indexAxis,
        scale: r.vScale,
        line: a
      }), r.$filler = c, s.push(c);
    for (o = 0; o < i; ++o)
      c = s[o], !(!c || c.fill === !1) && (c.fill = Lh(s, o, e.propagate));
  },
  beforeDraw(n, t, e) {
    const i = e.drawTime === "beforeDraw", s = n.getSortedVisibleDatasetMetas(), r = n.chartArea;
    for (let o = s.length - 1; o >= 0; --o) {
      const a = s[o].$filler;
      a && (a.line.updateControlPoints(r, a.axis), i && a.fill && Gn(n.ctx, a, r));
    }
  },
  beforeDatasetsDraw(n, t, e) {
    if (e.drawTime !== "beforeDatasetsDraw")
      return;
    const i = n.getSortedVisibleDatasetMetas();
    for (let s = i.length - 1; s >= 0; --s) {
      const r = i[s].$filler;
      Us(r) && Gn(n.ctx, r, n.chartArea);
    }
  },
  beforeDatasetDraw(n, t, e) {
    const i = t.meta.$filler;
    !Us(i) || e.drawTime !== "beforeDatasetDraw" || Gn(n.ctx, i, n.chartArea);
  },
  defaults: {
    propagate: !0,
    drawTime: "beforeDatasetDraw"
  }
};
const Gs = (n, t) => {
  let { boxHeight: e = t, boxWidth: i = t } = n;
  return n.usePointStyle && (e = Math.min(e, t), i = n.pointStyleWidth || Math.min(i, t)), {
    boxWidth: i,
    boxHeight: e,
    itemHeight: Math.max(t, e)
  };
}, Jh = (n, t) => n !== null && t !== null && n.datasetIndex === t.datasetIndex && n.index === t.index;
class Ks extends Ct {
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
    const i = t.labels, s = J(i.font), r = s.size, o = this._computeTitleHeight(), { boxWidth: a, itemHeight: c } = Gs(i, r);
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
      const { itemWidth: x, itemHeight: v } = tu(i, e, r, p, s);
      b > 0 && f + v + 2 * a > h && (u += d + a, l.push({
        width: d,
        height: f
      }), g += d + a, m++, d = f = 0), c[b] = {
        left: g,
        top: f,
        col: m,
        width: x,
        height: v
      }, d = Math.max(d, x), f += v + a;
    }), u += d, l.push({
      width: d,
      height: f
    }), u;
  }
  adjustHitBoxes() {
    if (!this.options.display)
      return;
    const t = this._computeTitleHeight(), { legendHitBoxes: e, options: { align: i, labels: { padding: s }, rtl: r } } = this, o = ne(r, this.left, this.width);
    if (this.isHorizontal()) {
      let a = 0, c = nt(i, this.left + s, this.right - this.lineWidths[a]);
      for (const l of e)
        a !== l.row && (a = l.row, c = nt(i, this.left + s, this.right - this.lineWidths[a])), l.top += this.top + t + s, l.left = o.leftForLtr(o.x(c), l.width), c += l.width + s;
    } else {
      let a = 0, c = nt(i, this.top + t + s, this.bottom - this.columnSizes[a].height);
      for (const l of e)
        l.col !== a && (a = l.col, c = nt(i, this.top + t + s, this.bottom - this.columnSizes[a].height)), l.top = c, l.left += this.left + s, l.left = o.leftForLtr(o.x(l.left), l.width), c += l.height + s;
    }
  }
  isHorizontal() {
    return this.options.position === "top" || this.options.position === "bottom";
  }
  draw() {
    if (this.options.display) {
      const t = this.ctx;
      Cn(t, this), this._draw(), An(t);
    }
  }
  _draw() {
    const { options: t, columnSizes: e, lineWidths: i, ctx: s } = this, { align: r, labels: o } = t, a = B.color, c = ne(t.rtl, this.left, this.width), l = J(o.font), { padding: h } = o, u = l.size, d = u / 2;
    let f;
    this.drawTitle(), s.textAlign = c.textAlign("left"), s.textBaseline = "middle", s.lineWidth = 0.5, s.font = l.string;
    const { boxWidth: g, boxHeight: m, itemHeight: p } = Gs(o, u), b = function(P, D, _) {
      if (isNaN(g) || g <= 0 || isNaN(m) || m < 0)
        return;
      s.save();
      const k = A(_.lineWidth, 1);
      if (s.fillStyle = A(_.fillStyle, a), s.lineCap = A(_.lineCap, "butt"), s.lineDashOffset = A(_.lineDashOffset, 0), s.lineJoin = A(_.lineJoin, "miter"), s.lineWidth = k, s.strokeStyle = A(_.strokeStyle, a), s.setLineDash(A(_.lineDash, [])), o.usePointStyle) {
        const O = {
          radius: m * Math.SQRT2 / 2,
          pointStyle: _.pointStyle,
          rotation: _.rotation,
          borderWidth: k
        }, T = c.xPlus(P, g / 2), C = D + d;
        Lr(s, O, T, C, o.pointStyleWidth && g);
      } else {
        const O = D + Math.max((u - m) / 2, 0), T = c.leftForLtr(P, g), C = Ce(_.borderRadius);
        s.beginPath(), Object.values(C).some((q) => q !== 0) ? ri(s, {
          x: T,
          y: O,
          w: g,
          h: m,
          radius: C
        }) : s.rect(T, O, g, m), s.fill(), k !== 0 && s.stroke();
      }
      s.restore();
    }, x = function(P, D, _) {
      Mn(s, _.text, P, D + p / 2, l, {
        strikethrough: _.hidden,
        textAlign: c.textAlign(_.textAlign)
      });
    }, v = this.isHorizontal(), M = this._computeTitleHeight();
    v ? f = {
      x: nt(r, this.left + h, this.right - i[0]),
      y: this.top + h + M,
      line: 0
    } : f = {
      x: this.left + h,
      y: nt(r, this.top + M + h, this.bottom - e[0].height),
      line: 0
    }, Br(this.ctx, t.textDirection);
    const w = p + h;
    this.legendItems.forEach((P, D) => {
      s.strokeStyle = P.fontColor, s.fillStyle = P.fontColor;
      const _ = s.measureText(P.text).width, k = c.textAlign(P.textAlign || (P.textAlign = o.textAlign)), O = g + d + _;
      let T = f.x, C = f.y;
      c.setWidth(this.width), v ? D > 0 && T + O + h > this.right && (C = f.y += w, f.line++, T = f.x = nt(r, this.left + h, this.right - i[f.line])) : D > 0 && C + w > this.bottom && (T = f.x = T + e[f.line].width + h, f.line++, C = f.y = nt(r, this.top + M + h, this.bottom - e[f.line].height));
      const q = c.x(T);
      if (b(q, C, P), T = Za(k, T + g + d, v ? T + O : this.right, t.rtl), x(c.x(T), C, P), v)
        f.x += O + h;
      else if (typeof P.text != "string") {
        const tt = l.lineHeight;
        f.y += ho(P, tt) + h;
      } else
        f.y += w;
    }), Yr(this.ctx, t.textDirection);
  }
  drawTitle() {
    const t = this.options, e = t.title, i = J(e.font), s = ct(e.padding);
    if (!e.display)
      return;
    const r = ne(t.rtl, this.left, this.width), o = this.ctx, a = e.position, c = i.size / 2, l = s.top + c;
    let h, u = this.left, d = this.width;
    if (this.isHorizontal())
      d = Math.max(...this.lineWidths), h = this.top + l, u = nt(t.align, u, this.right - d);
    else {
      const g = this.columnSizes.reduce((m, p) => Math.max(m, p.height), 0);
      h = l + nt(t.align, this.top, this.bottom - g - t.labels.padding - this._computeTitleHeight());
    }
    const f = nt(a, u, u + d);
    o.textAlign = r.textAlign(Er(a)), o.textBaseline = "middle", o.strokeStyle = e.color, o.fillStyle = e.color, o.font = i.string, Mn(o, e.text, f, h, i);
  }
  _computeTitleHeight() {
    const t = this.options.title, e = J(t.font), i = ct(t.padding);
    return t.display ? e.lineHeight + i.height : 0;
  }
  _getLegendItemAt(t, e) {
    let i, s, r;
    if (ee(t, this.left, this.right) && ee(e, this.top, this.bottom)) {
      for (r = this.legendHitBoxes, i = 0; i < r.length; ++i)
        if (s = r[i], ee(t, s.left, s.left + s.width) && ee(e, s.top, s.top + s.height))
          return this.legendItems[i];
    }
    return null;
  }
  handleEvent(t) {
    const e = this.options;
    if (!iu(t.type, e))
      return;
    const i = this._getLegendItemAt(t.x, t.y);
    if (t.type === "mousemove" || t.type === "mouseout") {
      const s = this._hoveredItem, r = Jh(s, i);
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
function tu(n, t, e, i, s) {
  const r = eu(i, n, t, e), o = nu(s, i, t.lineHeight);
  return {
    itemWidth: r,
    itemHeight: o
  };
}
function eu(n, t, e, i) {
  let s = n.text;
  return s && typeof s != "string" && (s = s.reduce((r, o) => r.length > o.length ? r : o)), t + e.size / 2 + i.measureText(s).width;
}
function nu(n, t, e) {
  let i = n;
  return typeof t.text != "string" && (i = ho(t, e)), i;
}
function ho(n, t) {
  const e = n.text ? n.text.length : 0;
  return t * e;
}
function iu(n, t) {
  return !!((n === "mousemove" || n === "mouseout") && (t.onHover || t.onLeave) || t.onClick && (n === "click" || n === "mouseup"));
}
var su = {
  id: "legend",
  _element: Ks,
  start(n, t, e) {
    const i = n.legend = new Ks({
      ctx: n.ctx,
      options: e,
      chart: n
    });
    Dt.configure(n, i, e), Dt.addBox(n, i);
  },
  stop(n) {
    Dt.removeBox(n, n.legend), delete n.legend;
  },
  beforeUpdate(n, t, e) {
    const i = n.legend;
    Dt.configure(n, i, e), i.options = e;
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
          const l = c.controller.getStyle(e ? 0 : void 0), h = ct(l.borderWidth);
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
const ve = {
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
        const l = c.getCenterPoint(), h = ni(t, l);
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
function ht(n, t) {
  return t && (U(t) ? Array.prototype.push.apply(n, t) : n.push(t)), n;
}
function yt(n) {
  return (typeof n == "string" || n instanceof String) && n.indexOf(`
`) > -1 ? n.split(`
`) : n;
}
function ru(n, t) {
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
function Zs(n, t) {
  const e = n.chart.ctx, { body: i, footer: s, title: r } = n, { boxWidth: o, boxHeight: a } = t, c = J(t.bodyFont), l = J(t.titleFont), h = J(t.footerFont), u = r.length, d = s.length, f = i.length, g = ct(t.padding);
  let m = g.height, p = 0, b = i.reduce((M, w) => M + w.before.length + w.lines.length + w.after.length, 0);
  if (b += n.beforeBody.length + n.afterBody.length, u && (m += u * l.lineHeight + (u - 1) * t.titleSpacing + t.titleMarginBottom), b) {
    const M = t.displayColors ? Math.max(a, c.lineHeight) : c.lineHeight;
    m += f * M + (b - f) * c.lineHeight + (b - 1) * t.bodySpacing;
  }
  d && (m += t.footerMarginTop + d * h.lineHeight + (d - 1) * t.footerSpacing);
  let x = 0;
  const v = function(M) {
    p = Math.max(p, e.measureText(M).width + x);
  };
  return e.save(), e.font = l.string, L(n.title, v), e.font = c.string, L(n.beforeBody.concat(n.afterBody), v), x = t.displayColors ? o + 2 + t.boxPadding : 0, L(i, (M) => {
    L(M.before, v), L(M.lines, v), L(M.after, v);
  }), x = 0, e.font = h.string, L(n.footer, v), e.restore(), p += g.width, {
    width: p,
    height: m
  };
}
function ou(n, t) {
  const { y: e, height: i } = t;
  return e < i / 2 ? "top" : e > n.height - i / 2 ? "bottom" : "center";
}
function au(n, t, e, i) {
  const { x: s, width: r } = i, o = e.caretSize + e.caretPadding;
  if (n === "left" && s + r + o > t.width || n === "right" && s - r - o < 0)
    return !0;
}
function cu(n, t, e, i) {
  const { x: s, width: r } = e, { width: o, chartArea: { left: a, right: c } } = n;
  let l = "center";
  return i === "center" ? l = s <= (a + c) / 2 ? "left" : "right" : s <= r / 2 ? l = "left" : s >= o - r / 2 && (l = "right"), au(l, n, t, e) && (l = "center"), l;
}
function Js(n, t, e) {
  const i = e.yAlign || t.yAlign || ou(n, e);
  return {
    xAlign: e.xAlign || t.xAlign || cu(n, t, e, i),
    yAlign: i
  };
}
function lu(n, t) {
  let { x: e, width: i } = n;
  return t === "right" ? e -= i : t === "center" && (e -= i / 2), e;
}
function hu(n, t, e) {
  let { y: i, height: s } = n;
  return t === "top" ? i += e : t === "bottom" ? i -= s + e : i -= s / 2, i;
}
function tr(n, t, e, i) {
  const { caretSize: s, caretPadding: r, cornerRadius: o } = n, { xAlign: a, yAlign: c } = e, l = s + r, { topLeft: h, topRight: u, bottomLeft: d, bottomRight: f } = Ce(o);
  let g = lu(t, a);
  const m = hu(t, c, l);
  return c === "center" ? a === "left" ? g += l : a === "right" && (g -= l) : a === "left" ? g -= Math.max(h, d) + s : a === "right" && (g += Math.max(u, f) + s), {
    x: ot(g, 0, i.width - t.width),
    y: ot(m, 0, i.height - t.height)
  };
}
function ln(n, t, e) {
  const i = ct(e.padding);
  return t === "center" ? n.x + n.width / 2 : t === "right" ? n.x + n.width - i.right : n.x + i.left;
}
function er(n) {
  return ht([], yt(n));
}
function uu(n, t, e) {
  return qt(n, {
    tooltip: t,
    tooltipItems: e,
    type: "tooltip"
  });
}
function nr(n, t) {
  const e = t && t.dataset && t.dataset.tooltip && t.dataset.tooltip.callbacks;
  return e ? n.override(e) : n;
}
const uo = {
  beforeTitle: pt,
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
  afterTitle: pt,
  beforeBody: pt,
  beforeLabel: pt,
  label(n) {
    if (this && this.options && this.options.mode === "dataset")
      return n.label + ": " + n.formattedValue || n.formattedValue;
    let t = n.dataset.label || "";
    t && (t += ": ");
    const e = n.formattedValue;
    return R(e) || (t += e), t;
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
  afterLabel: pt,
  afterBody: pt,
  beforeFooter: pt,
  footer: pt,
  afterFooter: pt
};
function K(n, t, e, i) {
  const s = n[t].call(e, i);
  return typeof s > "u" ? uo[t].call(e, i) : s;
}
class hi extends Ct {
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
    const e = this.chart, i = this.options.setContext(this.getContext()), s = i.enabled && e.options.animation && i.animations, r = new Xr(this.chart, s);
    return s._cacheable && (this._cachedAnimations = Object.freeze(r)), r;
  }
  getContext() {
    return this.$context || (this.$context = uu(this.chart.getContext(), this, this._tooltipItems));
  }
  getTitle(t, e) {
    const { callbacks: i } = e, s = K(i, "beforeTitle", this, t), r = K(i, "title", this, t), o = K(i, "afterTitle", this, t);
    let a = [];
    return a = ht(a, yt(s)), a = ht(a, yt(r)), a = ht(a, yt(o)), a;
  }
  getBeforeBody(t, e) {
    return er(K(e.callbacks, "beforeBody", this, t));
  }
  getBody(t, e) {
    const { callbacks: i } = e, s = [];
    return L(t, (r) => {
      const o = {
        before: [],
        lines: [],
        after: []
      }, a = nr(i, r);
      ht(o.before, yt(K(a, "beforeLabel", this, r))), ht(o.lines, K(a, "label", this, r)), ht(o.after, yt(K(a, "afterLabel", this, r))), s.push(o);
    }), s;
  }
  getAfterBody(t, e) {
    return er(K(e.callbacks, "afterBody", this, t));
  }
  getFooter(t, e) {
    const { callbacks: i } = e, s = K(i, "beforeFooter", this, t), r = K(i, "footer", this, t), o = K(i, "afterFooter", this, t);
    let a = [];
    return a = ht(a, yt(s)), a = ht(a, yt(r)), a = ht(a, yt(o)), a;
  }
  _createItems(t) {
    const e = this._active, i = this.chart.data, s = [], r = [], o = [];
    let a = [], c, l;
    for (c = 0, l = e.length; c < l; ++c)
      a.push(ru(this.chart, e[c]));
    return t.filter && (a = a.filter((h, u, d) => t.filter(h, u, d, i))), t.itemSort && (a = a.sort((h, u) => t.itemSort(h, u, i))), L(a, (h) => {
      const u = nr(t.callbacks, h);
      s.push(K(u, "labelColor", this, h)), r.push(K(u, "labelPointStyle", this, h)), o.push(K(u, "labelTextColor", this, h));
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
      const a = ve[i.position].call(this, s, this._eventPosition);
      o = this._createItems(i), this.title = this.getTitle(o, i), this.beforeBody = this.getBeforeBody(o, i), this.body = this.getBody(o, i), this.afterBody = this.getAfterBody(o, i), this.footer = this.getFooter(o, i);
      const c = this._size = Zs(this, i), l = Object.assign({}, a, c), h = Js(this.chart, i, l), u = tr(i, l, h, this.chart);
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
    const { xAlign: s, yAlign: r } = this, { caretSize: o, cornerRadius: a } = i, { topLeft: c, topRight: l, bottomLeft: h, bottomRight: u } = Ce(a), { x: d, y: f } = t, { width: g, height: m } = e;
    let p, b, x, v, M, w;
    return r === "center" ? (M = f + m / 2, s === "left" ? (p = d, b = p - o, v = M + o, w = M - o) : (p = d + g, b = p + o, v = M - o, w = M + o), x = p) : (s === "left" ? b = d + Math.max(c, h) + o : s === "right" ? b = d + g - Math.max(l, u) - o : b = this.caretX, r === "top" ? (v = f, M = v - o, p = b - o, x = b + o) : (v = f + m, M = v + o, p = b + o, x = b - o), w = v), {
      x1: p,
      x2: b,
      x3: x,
      y1: v,
      y2: M,
      y3: w
    };
  }
  drawTitle(t, e, i) {
    const s = this.title, r = s.length;
    let o, a, c;
    if (r) {
      const l = ne(i.rtl, this.x, this.width);
      for (t.x = ln(this, i.titleAlign, i), e.textAlign = l.textAlign(i.titleAlign), e.textBaseline = "middle", o = J(i.titleFont), a = i.titleSpacing, e.fillStyle = i.titleColor, e.font = o.string, c = 0; c < r; ++c)
        e.fillText(s[c], l.x(t.x), t.y + o.lineHeight / 2), t.y += o.lineHeight + a, c + 1 === r && (t.y += i.titleMarginBottom - a);
    }
  }
  _drawColorBox(t, e, i, s, r) {
    const o = this.labelColors[i], a = this.labelPointStyles[i], { boxHeight: c, boxWidth: l } = r, h = J(r.bodyFont), u = ln(this, "left", r), d = s.x(u), f = c < h.lineHeight ? (h.lineHeight - c) / 2 : 0, g = e.y + f;
    if (r.usePointStyle) {
      const m = {
        radius: Math.min(l, c) / 2,
        pointStyle: a.pointStyle,
        rotation: a.rotation,
        borderWidth: 1
      }, p = s.leftForLtr(d, l) + l / 2, b = g + c / 2;
      t.strokeStyle = r.multiKeyBackground, t.fillStyle = r.multiKeyBackground, si(t, m, p, b), t.strokeStyle = o.borderColor, t.fillStyle = o.backgroundColor, si(t, m, p, b);
    } else {
      t.lineWidth = E(o.borderWidth) ? Math.max(...Object.values(o.borderWidth)) : o.borderWidth || 1, t.strokeStyle = o.borderColor, t.setLineDash(o.borderDash || []), t.lineDashOffset = o.borderDashOffset || 0;
      const m = s.leftForLtr(d, l), p = s.leftForLtr(s.xPlus(d, 1), l - 2), b = Ce(o.borderRadius);
      Object.values(b).some((x) => x !== 0) ? (t.beginPath(), t.fillStyle = r.multiKeyBackground, ri(t, {
        x: m,
        y: g,
        w: l,
        h: c,
        radius: b
      }), t.fill(), t.stroke(), t.fillStyle = o.backgroundColor, t.beginPath(), ri(t, {
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
    const { body: s } = this, { bodySpacing: r, bodyAlign: o, displayColors: a, boxHeight: c, boxWidth: l, boxPadding: h } = i, u = J(i.bodyFont);
    let d = u.lineHeight, f = 0;
    const g = ne(i.rtl, this.x, this.width), m = function(_) {
      e.fillText(_, g.x(t.x + f), t.y + d / 2), t.y += d + r;
    }, p = g.textAlign(o);
    let b, x, v, M, w, P, D;
    for (e.textAlign = o, e.textBaseline = "middle", e.font = u.string, t.x = ln(this, p, i), e.fillStyle = i.bodyColor, L(this.beforeBody, m), f = a && p !== "right" ? o === "center" ? l / 2 + h : l + 2 + h : 0, M = 0, P = s.length; M < P; ++M) {
      for (b = s[M], x = this.labelTextColors[M], e.fillStyle = x, L(b.before, m), v = b.lines, a && v.length && (this._drawColorBox(e, t, M, g, i), d = Math.max(u.lineHeight, c)), w = 0, D = v.length; w < D; ++w)
        m(v[w]), d = u.lineHeight;
      L(b.after, m);
    }
    f = 0, d = u.lineHeight, L(this.afterBody, m), t.y -= r;
  }
  drawFooter(t, e, i) {
    const s = this.footer, r = s.length;
    let o, a;
    if (r) {
      const c = ne(i.rtl, this.x, this.width);
      for (t.x = ln(this, i.footerAlign, i), t.y += i.footerMarginTop, e.textAlign = c.textAlign(i.footerAlign), e.textBaseline = "middle", o = J(i.footerFont), e.fillStyle = i.footerColor, e.font = o.string, a = 0; a < r; ++a)
        e.fillText(s[a], c.x(t.x), t.y + o.lineHeight / 2), t.y += o.lineHeight + i.footerSpacing;
    }
  }
  drawBackground(t, e, i, s) {
    const { xAlign: r, yAlign: o } = this, { x: a, y: c } = t, { width: l, height: h } = i, { topLeft: u, topRight: d, bottomLeft: f, bottomRight: g } = Ce(s.cornerRadius);
    e.fillStyle = s.backgroundColor, e.strokeStyle = s.borderColor, e.lineWidth = s.borderWidth, e.beginPath(), e.moveTo(a + u, c), o === "top" && this.drawCaret(t, e, i, s), e.lineTo(a + l - d, c), e.quadraticCurveTo(a + l, c, a + l, c + d), o === "center" && r === "right" && this.drawCaret(t, e, i, s), e.lineTo(a + l, c + h - g), e.quadraticCurveTo(a + l, c + h, a + l - g, c + h), o === "bottom" && this.drawCaret(t, e, i, s), e.lineTo(a + f, c + h), e.quadraticCurveTo(a, c + h, a, c + h - f), o === "center" && r === "left" && this.drawCaret(t, e, i, s), e.lineTo(a, c + u), e.quadraticCurveTo(a, c, a + u, c), e.closePath(), e.fill(), s.borderWidth > 0 && e.stroke();
  }
  _updateAnimationTarget(t) {
    const e = this.chart, i = this.$animations, s = i && i.x, r = i && i.y;
    if (s || r) {
      const o = ve[t.position].call(this, this._active, this._eventPosition);
      if (!o)
        return;
      const a = this._size = Zs(this, t), c = Object.assign({}, o, this._size), l = Js(e, t, c), h = tr(t, c, l, e);
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
    const o = ct(e.padding), a = this.title.length || this.beforeBody.length || this.body.length || this.afterBody.length || this.footer.length;
    e.enabled && a && (t.save(), t.globalAlpha = i, this.drawBackground(r, t, s, e), Br(t, e.textDirection), r.y += o.top, this.drawTitle(r, t, e), this.drawBody(r, t, e), this.drawFooter(r, t, e), Yr(t, e.textDirection), t.restore());
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
    }), r = !yn(i, s), o = this._positionChanged(s, e);
    (r || o) && (this._active = s, this._eventPosition = e, this._ignoreReplayEvents = !0, this.update(!0));
  }
  handleEvent(t, e, i = !0) {
    if (e && this._ignoreReplayEvents)
      return !1;
    this._ignoreReplayEvents = !1;
    const s = this.options, r = this._active || [], o = this._getActiveElements(t, r, e, i), a = this._positionChanged(o, t), c = e || !yn(o, r) || a;
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
    const { caretX: i, caretY: s, options: r } = this, o = ve[r.position].call(this, t, e);
    return o !== !1 && (i !== o.x || s !== o.y);
  }
}
y(hi, "positioners", ve);
var du = {
  id: "tooltip",
  _element: hi,
  positioners: ve,
  afterInit(n, t, e) {
    e && (n.tooltip = new hi({
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
    callbacks: uo
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
function fu(n, t) {
  const e = [], { bounds: s, step: r, min: o, max: a, precision: c, count: l, maxTicks: h, maxDigits: u, includeBounds: d } = n, f = r || 1, g = h - 1, { min: m, max: p } = t, b = !R(o), x = !R(a), v = !R(l), M = (p - m) / (u + 1);
  let w = is((p - m) / g / f) * f, P, D, _, k;
  if (w < 1e-14 && !b && !x)
    return [
      {
        value: m
      },
      {
        value: p
      }
    ];
  k = Math.ceil(p / w) - Math.floor(m / w), k > g && (w = is(k * w / g / f) * f), R(c) || (P = Math.pow(10, c), w = Math.ceil(w * P) / P), s === "ticks" ? (D = Math.floor(m / w) * w, _ = Math.ceil(p / w) * w) : (D = m, _ = p), b && x && r && Wa((a - o) / r, w / 1e3) ? (k = Math.round(Math.min((a - o) / w, h)), w = (a - o) / k, D = o, _ = a) : v ? (D = b ? o : D, _ = x ? a : _, k = l - 1, w = (_ - D) / k) : (k = (_ - D) / w, Se(k, Math.round(k), w / 1e3) ? k = Math.round(k) : k = Math.ceil(k));
  const O = Math.max(ss(w), ss(D));
  P = Math.pow(10, R(c) ? O : c), D = Math.round(D * P) / P, _ = Math.round(_ * P) / P;
  let T = 0;
  for (b && (d && D !== o ? (e.push({
    value: o
  }), D < o && T++, Se(Math.round((D + T * w) * P) / P, o, ir(o, M, n)) && T++) : D < o && T++); T < k; ++T) {
    const C = Math.round((D + T * w) * P) / P;
    if (x && C > a)
      break;
    e.push({
      value: C
    });
  }
  return x && d && _ !== a ? e.length && Se(e[e.length - 1].value, a, ir(a, M, n)) ? e[e.length - 1].value = a : e.push({
    value: a
  }) : (!x || _ === a) && e.push({
    value: _
  }), e;
}
function ir(n, t, { horizontal: e, minRotation: i }) {
  const s = Wt(i), r = (e ? Math.sin(s) : Math.cos(s)) || 1e-3, o = 0.75 * t * ("" + n).length;
  return Math.min(t / r, o);
}
class gu extends je {
  constructor(t) {
    super(t), this.start = void 0, this.end = void 0, this._startValue = void 0, this._endValue = void 0, this._valueRange = 0;
  }
  parse(t, e) {
    return R(t) || (typeof t == "number" || t instanceof Number) && !isFinite(+t) ? null : +t;
  }
  handleTickRangeOptions() {
    const { beginAtZero: t } = this.options, { minDefined: e, maxDefined: i } = this.getUserBounds();
    let { min: s, max: r } = this;
    const o = (c) => s = e ? s : c, a = (c) => r = i ? r : c;
    if (t) {
      const c = re(s), l = re(r);
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
    }, r = this._range || this, o = fu(s, r);
    return t.bounds === "ticks" && Ba(o, this, "value"), t.reverse ? (o.reverse(), this.start = this.max, this.end = this.min) : (this.start = this.min, this.end = this.max), o;
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
    return Ir(t, this.chart.options.locale, this.options.ticks.format);
  }
}
class ui extends gu {
  determineDataLimits() {
    const { min: t, max: e } = this.getMinMax(!0);
    this.min = G(t) ? t : 0, this.max = G(e) ? e : 1, this.handleTickRangeOptions();
  }
  computeTickLimit() {
    const t = this.isHorizontal(), e = t ? this.width : this.height, i = Wt(this.options.ticks.minRotation), s = (t ? Math.sin(i) : Math.cos(i)) || 1e-3, r = this._resolveTickFontOptions(0);
    return Math.ceil(e / Math.min(40, r.lineHeight / s));
  }
  getPixelForValue(t) {
    return t === null ? NaN : this.getPixelForDecimal((t - this._startValue) / this._valueRange);
  }
  getValueForPixel(t) {
    return this._startValue + this.getDecimalForPixel(t) * this._valueRange;
  }
}
y(ui, "id", "linear"), y(ui, "defaults", {
  ticks: {
    callback: $r.formatters.numeric
  }
});
const Ln = {
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
}, Z = /* @__PURE__ */ Object.keys(Ln);
function sr(n, t) {
  return n - t;
}
function rr(n, t) {
  if (R(t))
    return null;
  const e = n._adapter, { parser: i, round: s, isoWeekday: r } = n._parseOpts;
  let o = t;
  return typeof i == "function" && (o = i(o)), G(o) || (o = typeof i == "string" ? e.parse(o, i) : e.parse(o)), o === null ? null : (s && (o = s === "week" && (He(r) || r === !0) ? e.startOf(o, "isoWeek", r) : e.startOf(o, s)), +o);
}
function or(n, t, e, i) {
  const s = Z.length;
  for (let r = Z.indexOf(n); r < s - 1; ++r) {
    const o = Ln[Z[r]], a = o.steps ? o.steps : Number.MAX_SAFE_INTEGER;
    if (o.common && Math.ceil((e - t) / (a * o.size)) <= i)
      return Z[r];
  }
  return Z[s - 1];
}
function mu(n, t, e, i, s) {
  for (let r = Z.length - 1; r >= Z.indexOf(e); r--) {
    const o = Z[r];
    if (Ln[o].common && n._adapter.diff(s, i, o) >= t - 1)
      return o;
  }
  return Z[e ? Z.indexOf(e) : 0];
}
function pu(n) {
  for (let t = Z.indexOf(n) + 1, e = Z.length; t < e; ++t)
    if (Ln[Z[t]].common)
      return Z[t];
}
function ar(n, t, e) {
  if (!e)
    n[t] = !0;
  else if (e.length) {
    const { lo: i, hi: s } = Mi(e, t), r = e[i] >= t ? e[i] : e[s];
    n[r] = !0;
  }
}
function bu(n, t, e, i) {
  const s = n._adapter, r = +s.startOf(t[0].value, i), o = t[t.length - 1].value;
  let a, c;
  for (a = r; a <= o; a = +s.add(a, 1, i))
    c = e[a], c >= 0 && (t[c].major = !0);
  return t;
}
function cr(n, t, e) {
  const i = [], s = {}, r = t.length;
  let o, a;
  for (o = 0; o < r; ++o)
    a = t[o], s[a] = o, i.push({
      value: a,
      major: !1
    });
  return r === 0 || !e ? i : bu(n, i, s, e);
}
class We extends je {
  constructor(t) {
    super(t), this._cache = {
      data: [],
      labels: [],
      all: []
    }, this._unit = "day", this._majorUnit = void 0, this._offsets = {}, this._normalized = !1, this._parseOpts = void 0;
  }
  init(t, e = {}) {
    const i = t.time || (t.time = {}), s = this._adapter = new Gr._date(t.adapters.date);
    s.init(e), Pe(i.displayFormats, s.formats()), this._parseOpts = {
      parser: i.parser,
      round: i.round,
      isoWeekday: i.isoWeekday
    }, super.init(t), this._normalized = e.normalized;
  }
  parse(t, e) {
    return t === void 0 ? null : rr(this, t);
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
    (!o || !a) && (c(this._getLabelBounds()), (t.bounds !== "ticks" || t.ticks.source !== "labels") && c(this.getMinMax(!1))), s = G(s) && !isNaN(s) ? s : +e.startOf(Date.now(), i), r = G(r) && !isNaN(r) ? r : +e.endOf(Date.now(), i) + 1, this.min = Math.min(s, r - 1), this.max = Math.max(s + 1, r);
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
    const r = this.min, o = this.max, a = Xa(s, r, o);
    return this._unit = e.unit || (i.autoSkip ? or(e.minUnit, this.min, this.max, this._getLabelCapacity(r)) : mu(this, a.length, e.minUnit, this.min, this.max)), this._majorUnit = !i.major.enabled || this._unit === "year" ? void 0 : pu(this._unit), this.initOffsets(s), t.reverse && a.reverse(), cr(this, a, this._majorUnit);
  }
  afterAutoSkip() {
    this.options.offsetAfterAutoskip && this.initOffsets(this.ticks.map((t) => +t.value));
  }
  initOffsets(t = []) {
    let e = 0, i = 0, s, r;
    this.options.offset && t.length && (s = this.getDecimalForValue(t[0]), t.length === 1 ? e = 1 - s : e = (this.getDecimalForValue(t[1]) - s) / 2, r = this.getDecimalForValue(t[t.length - 1]), t.length === 1 ? i = r : i = (r - this.getDecimalForValue(t[t.length - 2])) / 2);
    const o = t.length < 3 ? 0.5 : 0.25;
    e = ot(e, 0, o), i = ot(i, 0, o), this._offsets = {
      start: e,
      end: i,
      factor: 1 / (e + 1 + i)
    };
  }
  _generate() {
    const t = this._adapter, e = this.min, i = this.max, s = this.options, r = s.time, o = r.unit || or(r.minUnit, e, i, this._getLabelCapacity(e)), a = A(s.ticks.stepSize, 1), c = o === "week" ? r.isoWeekday : !1, l = He(c) || c === !0, h = {};
    let u = e, d, f;
    if (l && (u = +t.startOf(u, "isoWeek", c)), u = +t.startOf(u, l ? "day" : o), t.diff(i, e, o) > 1e5 * a)
      throw new Error(e + " and " + i + " are too far apart with stepSize of " + a + " " + o);
    const g = s.ticks.source === "data" && this.getDataTimestamps();
    for (d = u, f = 0; d < i; d = +t.add(d, a, o), f++)
      ar(h, d, g);
    return (d === i || s.bounds === "ticks" || f === 1) && ar(h, d, g), Object.keys(h).sort(sr).map((m) => +m);
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
    const e = this.options.ticks, i = this.ctx.measureText(t).width, s = Wt(this.isHorizontal() ? e.maxRotation : e.minRotation), r = Math.cos(s), o = Math.sin(s), a = this._resolveTickFontOptions(0).size;
    return {
      w: i * r + a * o,
      h: i * o + a * r
    };
  }
  _getLabelCapacity(t) {
    const e = this.options.time, i = e.displayFormats, s = i[e.unit] || i.millisecond, r = this._tickFormatFunction(t, 0, cr(this, [
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
      t.push(rr(this, s[e]));
    return this._cache.labels = this._normalized ? t : this.normalize(t);
  }
  normalize(t) {
    return Ga(t.sort(sr));
  }
}
y(We, "id", "time"), y(We, "defaults", {
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
function hn(n, t, e) {
  let i = 0, s = n.length - 1, r, o, a, c;
  e ? (t >= n[i].pos && t <= n[s].pos && ({ lo: i, hi: s } = Bt(n, "pos", t)), { pos: r, time: a } = n[i], { pos: o, time: c } = n[s]) : (t >= n[i].time && t <= n[s].time && ({ lo: i, hi: s } = Bt(n, "time", t)), { time: r, pos: a } = n[i], { time: o, pos: c } = n[s]);
  const l = o - r;
  return l ? a + (c - a) * (t - r) / l : a;
}
class lr extends We {
  constructor(t) {
    super(t), this._table = [], this._minPos = void 0, this._tableRange = void 0;
  }
  initOffsets() {
    const t = this._getTimestampsForTable(), e = this._table = this.buildLookupTable(t);
    this._minPos = hn(e, this.min), this._tableRange = hn(e, this.max) - this._minPos, super.initOffsets(t);
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
    return (hn(this._table, t) - this._minPos) / this._tableRange;
  }
  getValueForPixel(t) {
    const e = this._offsets, i = this.getDecimalForPixel(t) / e.factor - e.end;
    return hn(this._table, i * this._tableRange + this._minPos, !0);
  }
}
y(lr, "id", "timeseries"), y(lr, "defaults", We.defaults);
const fo = 6048e5, yu = 864e5, Ve = 6e4, Ue = 36e5, _u = 1e3, hr = Symbol.for("constructDateFrom");
function z(n, t) {
  return typeof n == "function" ? n(t) : n && typeof n == "object" && hr in n ? n[hr](t) : n instanceof Date ? new n.constructor(t) : new Date(t);
}
function S(n, t) {
  return z(t || n, n);
}
function Fn(n, t, e) {
  const i = S(n, e == null ? void 0 : e.in);
  return isNaN(t) ? z((e == null ? void 0 : e.in) || n, NaN) : (t && i.setDate(i.getDate() + t), i);
}
function Ai(n, t, e) {
  const i = S(n, e == null ? void 0 : e.in);
  if (isNaN(t)) return z(n, NaN);
  if (!t)
    return i;
  const s = i.getDate(), r = z(n, i.getTime());
  r.setMonth(i.getMonth() + t + 1, 0);
  const o = r.getDate();
  return s >= o ? r : (i.setFullYear(
    r.getFullYear(),
    r.getMonth(),
    s
  ), i);
}
function Ei(n, t, e) {
  return z(n, +S(n) + t);
}
function xu(n, t, e) {
  return Ei(n, t * Ue);
}
let wu = {};
function Xt() {
  return wu;
}
function mt(n, t) {
  var a, c, l, h;
  const e = Xt(), i = (t == null ? void 0 : t.weekStartsOn) ?? ((c = (a = t == null ? void 0 : t.locale) == null ? void 0 : a.options) == null ? void 0 : c.weekStartsOn) ?? e.weekStartsOn ?? ((h = (l = e.locale) == null ? void 0 : l.options) == null ? void 0 : h.weekStartsOn) ?? 0, s = S(n, t == null ? void 0 : t.in), r = s.getDay(), o = (r < i ? 7 : 0) + r - i;
  return s.setDate(s.getDate() - o), s.setHours(0, 0, 0, 0), s;
}
function ce(n, t) {
  return mt(n, { ...t, weekStartsOn: 1 });
}
function go(n, t) {
  const e = S(n, t == null ? void 0 : t.in), i = e.getFullYear(), s = z(e, 0);
  s.setFullYear(i + 1, 0, 4), s.setHours(0, 0, 0, 0);
  const r = ce(s), o = z(e, 0);
  o.setFullYear(i, 0, 4), o.setHours(0, 0, 0, 0);
  const a = ce(o);
  return e.getTime() >= r.getTime() ? i + 1 : e.getTime() >= a.getTime() ? i : i - 1;
}
function Pn(n) {
  const t = S(n), e = new Date(
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
function Qt(n, ...t) {
  const e = z.bind(
    null,
    t.find((i) => typeof i == "object")
  );
  return t.map(e);
}
function di(n, t) {
  const e = S(n, t == null ? void 0 : t.in);
  return e.setHours(0, 0, 0, 0), e;
}
function mo(n, t, e) {
  const [i, s] = Qt(
    e == null ? void 0 : e.in,
    n,
    t
  ), r = di(i), o = di(s), a = +r - Pn(r), c = +o - Pn(o);
  return Math.round((a - c) / yu);
}
function vu(n, t) {
  const e = go(n, t), i = z(n, 0);
  return i.setFullYear(e, 0, 4), i.setHours(0, 0, 0, 0), ce(i);
}
function Mu(n, t, e) {
  const i = S(n, e == null ? void 0 : e.in);
  return i.setTime(i.getTime() + t * Ve), i;
}
function ku(n, t, e) {
  return Ai(n, t * 3, e);
}
function Du(n, t, e) {
  return Ei(n, t * 1e3);
}
function Pu(n, t, e) {
  return Fn(n, t * 7, e);
}
function Su(n, t, e) {
  return Ai(n, t * 12, e);
}
function Ee(n, t) {
  const e = +S(n) - +S(t);
  return e < 0 ? -1 : e > 0 ? 1 : e;
}
function Ou(n) {
  return n instanceof Date || typeof n == "object" && Object.prototype.toString.call(n) === "[object Date]";
}
function po(n) {
  return !(!Ou(n) && typeof n != "number" || isNaN(+S(n)));
}
function Tu(n, t, e) {
  const [i, s] = Qt(
    e == null ? void 0 : e.in,
    n,
    t
  ), r = i.getFullYear() - s.getFullYear(), o = i.getMonth() - s.getMonth();
  return r * 12 + o;
}
function Cu(n, t, e) {
  const [i, s] = Qt(
    e == null ? void 0 : e.in,
    n,
    t
  );
  return i.getFullYear() - s.getFullYear();
}
function bo(n, t, e) {
  const [i, s] = Qt(
    e == null ? void 0 : e.in,
    n,
    t
  ), r = ur(i, s), o = Math.abs(
    mo(i, s)
  );
  i.setDate(i.getDate() - r * o);
  const a = +(ur(i, s) === -r), c = r * (o - a);
  return c === 0 ? 0 : c;
}
function ur(n, t) {
  const e = n.getFullYear() - t.getFullYear() || n.getMonth() - t.getMonth() || n.getDate() - t.getDate() || n.getHours() - t.getHours() || n.getMinutes() - t.getMinutes() || n.getSeconds() - t.getSeconds() || n.getMilliseconds() - t.getMilliseconds();
  return e < 0 ? -1 : e > 0 ? 1 : e;
}
function qe(n) {
  return (t) => {
    const i = (n ? Math[n] : Math.trunc)(t);
    return i === 0 ? 0 : i;
  };
}
function Au(n, t, e) {
  const [i, s] = Qt(
    e == null ? void 0 : e.in,
    n,
    t
  ), r = (+i - +s) / Ue;
  return qe(e == null ? void 0 : e.roundingMethod)(r);
}
function Ii(n, t) {
  return +S(n) - +S(t);
}
function Eu(n, t, e) {
  const i = Ii(n, t) / Ve;
  return qe(e == null ? void 0 : e.roundingMethod)(i);
}
function yo(n, t) {
  const e = S(n, t == null ? void 0 : t.in);
  return e.setHours(23, 59, 59, 999), e;
}
function _o(n, t) {
  const e = S(n, t == null ? void 0 : t.in), i = e.getMonth();
  return e.setFullYear(e.getFullYear(), i + 1, 0), e.setHours(23, 59, 59, 999), e;
}
function Iu(n, t) {
  const e = S(n, t == null ? void 0 : t.in);
  return +yo(e, t) == +_o(e, t);
}
function xo(n, t, e) {
  const [i, s, r] = Qt(
    e == null ? void 0 : e.in,
    n,
    n,
    t
  ), o = Ee(s, r), a = Math.abs(
    Tu(s, r)
  );
  if (a < 1) return 0;
  s.getMonth() === 1 && s.getDate() > 27 && s.setDate(30), s.setMonth(s.getMonth() - o * a);
  let c = Ee(s, r) === -o;
  Iu(i) && a === 1 && Ee(i, r) === 1 && (c = !1);
  const l = o * (a - +c);
  return l === 0 ? 0 : l;
}
function $u(n, t, e) {
  const i = xo(n, t, e) / 3;
  return qe(e == null ? void 0 : e.roundingMethod)(i);
}
function Lu(n, t, e) {
  const i = Ii(n, t) / 1e3;
  return qe(e == null ? void 0 : e.roundingMethod)(i);
}
function Fu(n, t, e) {
  const i = bo(n, t, e) / 7;
  return qe(e == null ? void 0 : e.roundingMethod)(i);
}
function Ru(n, t, e) {
  const [i, s] = Qt(
    e == null ? void 0 : e.in,
    n,
    t
  ), r = Ee(i, s), o = Math.abs(Cu(i, s));
  i.setFullYear(1584), s.setFullYear(1584);
  const a = Ee(i, s) === -r, c = r * (o - +a);
  return c === 0 ? 0 : c;
}
function Hu(n, t) {
  const e = S(n, t == null ? void 0 : t.in), i = e.getMonth(), s = i - i % 3;
  return e.setMonth(s, 1), e.setHours(0, 0, 0, 0), e;
}
function zu(n, t) {
  const e = S(n, t == null ? void 0 : t.in);
  return e.setDate(1), e.setHours(0, 0, 0, 0), e;
}
function Nu(n, t) {
  const e = S(n, t == null ? void 0 : t.in), i = e.getFullYear();
  return e.setFullYear(i + 1, 0, 0), e.setHours(23, 59, 59, 999), e;
}
function wo(n, t) {
  const e = S(n, t == null ? void 0 : t.in);
  return e.setFullYear(e.getFullYear(), 0, 1), e.setHours(0, 0, 0, 0), e;
}
function Wu(n, t) {
  const e = S(n, t == null ? void 0 : t.in);
  return e.setMinutes(59, 59, 999), e;
}
function Bu(n, t) {
  var a, c;
  const e = Xt(), i = e.weekStartsOn ?? ((c = (a = e.locale) == null ? void 0 : a.options) == null ? void 0 : c.weekStartsOn) ?? 0, s = S(n, t == null ? void 0 : t.in), r = s.getDay(), o = (r < i ? -7 : 0) + 6 - (r - i);
  return s.setDate(s.getDate() + o), s.setHours(23, 59, 59, 999), s;
}
function Yu(n, t) {
  const e = S(n, t == null ? void 0 : t.in);
  return e.setSeconds(59, 999), e;
}
function ju(n, t) {
  const e = S(n, t == null ? void 0 : t.in), i = e.getMonth(), s = i - i % 3 + 3;
  return e.setMonth(s, 0), e.setHours(23, 59, 59, 999), e;
}
function Vu(n, t) {
  const e = S(n, t == null ? void 0 : t.in);
  return e.setMilliseconds(999), e;
}
const Uu = {
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
}, qu = (n, t, e) => {
  let i;
  const s = Uu[n];
  return typeof s == "string" ? i = s : t === 1 ? i = s.one : i = s.other.replace("{{count}}", t.toString()), e != null && e.addSuffix ? e.comparison && e.comparison > 0 ? "in " + i : i + " ago" : i;
};
function Zn(n) {
  return (t = {}) => {
    const e = t.width ? String(t.width) : n.defaultWidth;
    return n.formats[e] || n.formats[n.defaultWidth];
  };
}
const Xu = {
  full: "EEEE, MMMM do, y",
  long: "MMMM do, y",
  medium: "MMM d, y",
  short: "MM/dd/yyyy"
}, Qu = {
  full: "h:mm:ss a zzzz",
  long: "h:mm:ss a z",
  medium: "h:mm:ss a",
  short: "h:mm a"
}, Gu = {
  full: "{{date}} 'at' {{time}}",
  long: "{{date}} 'at' {{time}}",
  medium: "{{date}}, {{time}}",
  short: "{{date}}, {{time}}"
}, Ku = {
  date: Zn({
    formats: Xu,
    defaultWidth: "full"
  }),
  time: Zn({
    formats: Qu,
    defaultWidth: "full"
  }),
  dateTime: Zn({
    formats: Gu,
    defaultWidth: "full"
  })
}, Zu = {
  lastWeek: "'last' eeee 'at' p",
  yesterday: "'yesterday at' p",
  today: "'today at' p",
  tomorrow: "'tomorrow at' p",
  nextWeek: "eeee 'at' p",
  other: "P"
}, Ju = (n, t, e, i) => Zu[n];
function be(n) {
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
const td = {
  narrow: ["B", "A"],
  abbreviated: ["BC", "AD"],
  wide: ["Before Christ", "Anno Domini"]
}, ed = {
  narrow: ["1", "2", "3", "4"],
  abbreviated: ["Q1", "Q2", "Q3", "Q4"],
  wide: ["1st quarter", "2nd quarter", "3rd quarter", "4th quarter"]
}, nd = {
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
}, id = {
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
}, sd = {
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
}, rd = {
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
}, od = (n, t) => {
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
}, ad = {
  ordinalNumber: od,
  era: be({
    values: td,
    defaultWidth: "wide"
  }),
  quarter: be({
    values: ed,
    defaultWidth: "wide",
    argumentCallback: (n) => n - 1
  }),
  month: be({
    values: nd,
    defaultWidth: "wide"
  }),
  day: be({
    values: id,
    defaultWidth: "wide"
  }),
  dayPeriod: be({
    values: sd,
    defaultWidth: "wide",
    formattingValues: rd,
    defaultFormattingWidth: "wide"
  })
};
function ye(n) {
  return (t, e = {}) => {
    const i = e.width, s = i && n.matchPatterns[i] || n.matchPatterns[n.defaultMatchWidth], r = t.match(s);
    if (!r)
      return null;
    const o = r[0], a = i && n.parsePatterns[i] || n.parsePatterns[n.defaultParseWidth], c = Array.isArray(a) ? ld(a, (u) => u.test(o)) : (
      // [TODO] -- I challenge you to fix the type
      cd(a, (u) => u.test(o))
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
function cd(n, t) {
  for (const e in n)
    if (Object.prototype.hasOwnProperty.call(n, e) && t(n[e]))
      return e;
}
function ld(n, t) {
  for (let e = 0; e < n.length; e++)
    if (t(n[e]))
      return e;
}
function hd(n) {
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
const ud = /^(\d+)(th|st|nd|rd)?/i, dd = /\d+/i, fd = {
  narrow: /^(b|a)/i,
  abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
  wide: /^(before christ|before common era|anno domini|common era)/i
}, gd = {
  any: [/^b/i, /^(a|c)/i]
}, md = {
  narrow: /^[1234]/i,
  abbreviated: /^q[1234]/i,
  wide: /^[1234](th|st|nd|rd)? quarter/i
}, pd = {
  any: [/1/i, /2/i, /3/i, /4/i]
}, bd = {
  narrow: /^[jfmasond]/i,
  abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
  wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
}, yd = {
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
}, _d = {
  narrow: /^[smtwf]/i,
  short: /^(su|mo|tu|we|th|fr|sa)/i,
  abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
  wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
}, xd = {
  narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
  any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
}, wd = {
  narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
  any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
}, vd = {
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
}, Md = {
  ordinalNumber: hd({
    matchPattern: ud,
    parsePattern: dd,
    valueCallback: (n) => parseInt(n, 10)
  }),
  era: ye({
    matchPatterns: fd,
    defaultMatchWidth: "wide",
    parsePatterns: gd,
    defaultParseWidth: "any"
  }),
  quarter: ye({
    matchPatterns: md,
    defaultMatchWidth: "wide",
    parsePatterns: pd,
    defaultParseWidth: "any",
    valueCallback: (n) => n + 1
  }),
  month: ye({
    matchPatterns: bd,
    defaultMatchWidth: "wide",
    parsePatterns: yd,
    defaultParseWidth: "any"
  }),
  day: ye({
    matchPatterns: _d,
    defaultMatchWidth: "wide",
    parsePatterns: xd,
    defaultParseWidth: "any"
  }),
  dayPeriod: ye({
    matchPatterns: wd,
    defaultMatchWidth: "any",
    parsePatterns: vd,
    defaultParseWidth: "any"
  })
}, vo = {
  code: "en-US",
  formatDistance: qu,
  formatLong: Ku,
  formatRelative: Ju,
  localize: ad,
  match: Md,
  options: {
    weekStartsOn: 0,
    firstWeekContainsDate: 1
  }
};
function kd(n, t) {
  const e = S(n, t == null ? void 0 : t.in);
  return mo(e, wo(e)) + 1;
}
function Mo(n, t) {
  const e = S(n, t == null ? void 0 : t.in), i = +ce(e) - +vu(e);
  return Math.round(i / fo) + 1;
}
function $i(n, t) {
  var h, u, d, f;
  const e = S(n, t == null ? void 0 : t.in), i = e.getFullYear(), s = Xt(), r = (t == null ? void 0 : t.firstWeekContainsDate) ?? ((u = (h = t == null ? void 0 : t.locale) == null ? void 0 : h.options) == null ? void 0 : u.firstWeekContainsDate) ?? s.firstWeekContainsDate ?? ((f = (d = s.locale) == null ? void 0 : d.options) == null ? void 0 : f.firstWeekContainsDate) ?? 1, o = z((t == null ? void 0 : t.in) || n, 0);
  o.setFullYear(i + 1, 0, r), o.setHours(0, 0, 0, 0);
  const a = mt(o, t), c = z((t == null ? void 0 : t.in) || n, 0);
  c.setFullYear(i, 0, r), c.setHours(0, 0, 0, 0);
  const l = mt(c, t);
  return +e >= +a ? i + 1 : +e >= +l ? i : i - 1;
}
function Dd(n, t) {
  var a, c, l, h;
  const e = Xt(), i = (t == null ? void 0 : t.firstWeekContainsDate) ?? ((c = (a = t == null ? void 0 : t.locale) == null ? void 0 : a.options) == null ? void 0 : c.firstWeekContainsDate) ?? e.firstWeekContainsDate ?? ((h = (l = e.locale) == null ? void 0 : l.options) == null ? void 0 : h.firstWeekContainsDate) ?? 1, s = $i(n, t), r = z((t == null ? void 0 : t.in) || n, 0);
  return r.setFullYear(s, 0, i), r.setHours(0, 0, 0, 0), mt(r, t);
}
function ko(n, t) {
  const e = S(n, t == null ? void 0 : t.in), i = +mt(e, t) - +Dd(e, t);
  return Math.round(i / fo) + 1;
}
function $(n, t) {
  const e = n < 0 ? "-" : "", i = Math.abs(n).toString().padStart(t, "0");
  return e + i;
}
const wt = {
  // Year
  y(n, t) {
    const e = n.getFullYear(), i = e > 0 ? e : 1 - e;
    return $(t === "yy" ? i % 100 : i, t.length);
  },
  // Month
  M(n, t) {
    const e = n.getMonth();
    return t === "M" ? String(e + 1) : $(e + 1, 2);
  },
  // Day of the month
  d(n, t) {
    return $(n.getDate(), t.length);
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
    return $(n.getHours() % 12 || 12, t.length);
  },
  // Hour [0-23]
  H(n, t) {
    return $(n.getHours(), t.length);
  },
  // Minute
  m(n, t) {
    return $(n.getMinutes(), t.length);
  },
  // Second
  s(n, t) {
    return $(n.getSeconds(), t.length);
  },
  // Fraction of second
  S(n, t) {
    const e = t.length, i = n.getMilliseconds(), s = Math.trunc(
      i * Math.pow(10, e - 3)
    );
    return $(s, t.length);
  }
}, Jt = {
  midnight: "midnight",
  noon: "noon",
  morning: "morning",
  afternoon: "afternoon",
  evening: "evening",
  night: "night"
}, dr = {
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
    return wt.y(n, t);
  },
  // Local week-numbering year
  Y: function(n, t, e, i) {
    const s = $i(n, i), r = s > 0 ? s : 1 - s;
    if (t === "YY") {
      const o = r % 100;
      return $(o, 2);
    }
    return t === "Yo" ? e.ordinalNumber(r, { unit: "year" }) : $(r, t.length);
  },
  // ISO week-numbering year
  R: function(n, t) {
    const e = go(n);
    return $(e, t.length);
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
    return $(e, t.length);
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
        return $(i, 2);
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
        return $(i, 2);
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
        return wt.M(n, t);
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
        return $(i + 1, 2);
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
    const s = ko(n, i);
    return t === "wo" ? e.ordinalNumber(s, { unit: "week" }) : $(s, t.length);
  },
  // ISO week of year
  I: function(n, t, e) {
    const i = Mo(n);
    return t === "Io" ? e.ordinalNumber(i, { unit: "week" }) : $(i, t.length);
  },
  // Day of the month
  d: function(n, t, e) {
    return t === "do" ? e.ordinalNumber(n.getDate(), { unit: "date" }) : wt.d(n, t);
  },
  // Day of year
  D: function(n, t, e) {
    const i = kd(n);
    return t === "Do" ? e.ordinalNumber(i, { unit: "dayOfYear" }) : $(i, t.length);
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
        return $(r, 2);
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
        return $(r, t.length);
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
        return $(s, t.length);
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
    switch (i === 12 ? s = Jt.noon : i === 0 ? s = Jt.midnight : s = i / 12 >= 1 ? "pm" : "am", t) {
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
    switch (i >= 17 ? s = Jt.evening : i >= 12 ? s = Jt.afternoon : i >= 4 ? s = Jt.morning : s = Jt.night, t) {
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
    return wt.h(n, t);
  },
  // Hour [0-23]
  H: function(n, t, e) {
    return t === "Ho" ? e.ordinalNumber(n.getHours(), { unit: "hour" }) : wt.H(n, t);
  },
  // Hour [0-11]
  K: function(n, t, e) {
    const i = n.getHours() % 12;
    return t === "Ko" ? e.ordinalNumber(i, { unit: "hour" }) : $(i, t.length);
  },
  // Hour [1-24]
  k: function(n, t, e) {
    let i = n.getHours();
    return i === 0 && (i = 24), t === "ko" ? e.ordinalNumber(i, { unit: "hour" }) : $(i, t.length);
  },
  // Minute
  m: function(n, t, e) {
    return t === "mo" ? e.ordinalNumber(n.getMinutes(), { unit: "minute" }) : wt.m(n, t);
  },
  // Second
  s: function(n, t, e) {
    return t === "so" ? e.ordinalNumber(n.getSeconds(), { unit: "second" }) : wt.s(n, t);
  },
  // Fraction of second
  S: function(n, t) {
    return wt.S(n, t);
  },
  // Timezone (ISO-8601. If offset is 0, output is always `'Z'`)
  X: function(n, t, e) {
    const i = n.getTimezoneOffset();
    if (i === 0)
      return "Z";
    switch (t) {
      // Hours and optional minutes
      case "X":
        return gr(i);
      // Hours, minutes and optional seconds without `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `XX`
      case "XXXX":
      case "XX":
        return zt(i);
      // Hours, minutes and optional seconds with `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `XXX`
      case "XXXXX":
      case "XXX":
      // Hours and minutes with `:` delimiter
      default:
        return zt(i, ":");
    }
  },
  // Timezone (ISO-8601. If offset is 0, output is `'+00:00'` or equivalent)
  x: function(n, t, e) {
    const i = n.getTimezoneOffset();
    switch (t) {
      // Hours and optional minutes
      case "x":
        return gr(i);
      // Hours, minutes and optional seconds without `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `xx`
      case "xxxx":
      case "xx":
        return zt(i);
      // Hours, minutes and optional seconds with `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `xxx`
      case "xxxxx":
      case "xxx":
      // Hours and minutes with `:` delimiter
      default:
        return zt(i, ":");
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
        return "GMT" + fr(i, ":");
      // Long
      case "OOOO":
      default:
        return "GMT" + zt(i, ":");
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
        return "GMT" + fr(i, ":");
      // Long
      case "zzzz":
      default:
        return "GMT" + zt(i, ":");
    }
  },
  // Seconds timestamp
  t: function(n, t, e) {
    const i = Math.trunc(+n / 1e3);
    return $(i, t.length);
  },
  // Milliseconds timestamp
  T: function(n, t, e) {
    return $(+n, t.length);
  }
};
function fr(n, t = "") {
  const e = n > 0 ? "-" : "+", i = Math.abs(n), s = Math.trunc(i / 60), r = i % 60;
  return r === 0 ? e + String(s) : e + String(s) + t + $(r, 2);
}
function gr(n, t) {
  return n % 60 === 0 ? (n > 0 ? "-" : "+") + $(Math.abs(n) / 60, 2) : zt(n, t);
}
function zt(n, t = "") {
  const e = n > 0 ? "-" : "+", i = Math.abs(n), s = $(Math.trunc(i / 60), 2), r = $(i % 60, 2);
  return e + s + t + r;
}
const mr = (n, t) => {
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
}, Do = (n, t) => {
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
}, Pd = (n, t) => {
  const e = n.match(/(P+)(p+)?/) || [], i = e[1], s = e[2];
  if (!s)
    return mr(n, t);
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
  return r.replace("{{date}}", mr(i, t)).replace("{{time}}", Do(s, t));
}, fi = {
  p: Do,
  P: Pd
}, Sd = /^D+$/, Od = /^Y+$/, Td = ["D", "DD", "YY", "YYYY"];
function Po(n) {
  return Sd.test(n);
}
function So(n) {
  return Od.test(n);
}
function gi(n, t, e) {
  const i = Cd(n, t, e);
  if (console.warn(i), Td.includes(n)) throw new RangeError(i);
}
function Cd(n, t, e) {
  const i = n[0] === "Y" ? "years" : "days of the month";
  return `Use \`${n.toLowerCase()}\` instead of \`${n}\` (in \`${t}\`) for formatting ${i} to the input \`${e}\`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md`;
}
const Ad = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g, Ed = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g, Id = /^'([^]*?)'?$/, $d = /''/g, Ld = /[a-zA-Z]/;
function Fd(n, t, e) {
  var h, u, d, f, g, m, p, b;
  const i = Xt(), s = (e == null ? void 0 : e.locale) ?? i.locale ?? vo, r = (e == null ? void 0 : e.firstWeekContainsDate) ?? ((u = (h = e == null ? void 0 : e.locale) == null ? void 0 : h.options) == null ? void 0 : u.firstWeekContainsDate) ?? i.firstWeekContainsDate ?? ((f = (d = i.locale) == null ? void 0 : d.options) == null ? void 0 : f.firstWeekContainsDate) ?? 1, o = (e == null ? void 0 : e.weekStartsOn) ?? ((m = (g = e == null ? void 0 : e.locale) == null ? void 0 : g.options) == null ? void 0 : m.weekStartsOn) ?? i.weekStartsOn ?? ((b = (p = i.locale) == null ? void 0 : p.options) == null ? void 0 : b.weekStartsOn) ?? 0, a = S(n, e == null ? void 0 : e.in);
  if (!po(a))
    throw new RangeError("Invalid time value");
  let c = t.match(Ed).map((x) => {
    const v = x[0];
    if (v === "p" || v === "P") {
      const M = fi[v];
      return M(x, s.formatLong);
    }
    return x;
  }).join("").match(Ad).map((x) => {
    if (x === "''")
      return { isToken: !1, value: "'" };
    const v = x[0];
    if (v === "'")
      return { isToken: !1, value: Rd(x) };
    if (dr[v])
      return { isToken: !0, value: x };
    if (v.match(Ld))
      throw new RangeError(
        "Format string contains an unescaped latin alphabet character `" + v + "`"
      );
    return { isToken: !1, value: x };
  });
  s.localize.preprocessor && (c = s.localize.preprocessor(a, c));
  const l = {
    firstWeekContainsDate: r,
    weekStartsOn: o,
    locale: s
  };
  return c.map((x) => {
    if (!x.isToken) return x.value;
    const v = x.value;
    (!(e != null && e.useAdditionalWeekYearTokens) && So(v) || !(e != null && e.useAdditionalDayOfYearTokens) && Po(v)) && gi(v, t, String(n));
    const M = dr[v[0]];
    return M(a, v, s.localize, l);
  }).join("");
}
function Rd(n) {
  const t = n.match(Id);
  return t ? t[1].replace($d, "'") : n;
}
function Hd() {
  return Object.assign({}, Xt());
}
function zd(n, t) {
  const e = S(n, t == null ? void 0 : t.in).getDay();
  return e === 0 ? 7 : e;
}
function Nd(n, t) {
  const e = Wd(t) ? new t(0) : z(t, 0);
  return e.setFullYear(n.getFullYear(), n.getMonth(), n.getDate()), e.setHours(
    n.getHours(),
    n.getMinutes(),
    n.getSeconds(),
    n.getMilliseconds()
  ), e;
}
function Wd(n) {
  var t;
  return typeof n == "function" && ((t = n.prototype) == null ? void 0 : t.constructor) === n;
}
const Bd = 10;
class Oo {
  constructor() {
    y(this, "subPriority", 0);
  }
  validate(t, e) {
    return !0;
  }
}
class Yd extends Oo {
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
class jd extends Oo {
  constructor(e, i) {
    super();
    y(this, "priority", Bd);
    y(this, "subPriority", -1);
    this.context = e || ((s) => z(i, s));
  }
  set(e, i) {
    return i.timestampIsSet ? e : z(e, Nd(e, this.context));
  }
}
class I {
  run(t, e, i, s) {
    const r = this.parse(t, e, i, s);
    return r ? {
      setter: new Yd(
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
class Vd extends I {
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
}, ft = {
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
function gt(n, t) {
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
    value: i * (s * Ue + r * Ve + o * _u),
    rest: t.slice(e[0].length)
  };
}
function To(n) {
  return H(Y.anyDigitsSigned, n);
}
function N(n, t) {
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
function Sn(n, t) {
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
function Li(n) {
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
function Co(n, t) {
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
function Ao(n) {
  return n % 400 === 0 || n % 4 === 0 && n % 100 !== 0;
}
class Ud extends I {
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
        return j(N(4, e), r);
      case "yo":
        return j(
          s.ordinalNumber(e, {
            unit: "year"
          }),
          r
        );
      default:
        return j(N(i.length, e), r);
    }
  }
  validate(e, i) {
    return i.isTwoDigitYear || i.year > 0;
  }
  set(e, i, s) {
    const r = e.getFullYear();
    if (s.isTwoDigitYear) {
      const a = Co(
        s.year,
        r
      );
      return e.setFullYear(a, 0, 1), e.setHours(0, 0, 0, 0), e;
    }
    const o = !("era" in i) || i.era === 1 ? s.year : 1 - s.year;
    return e.setFullYear(o, 0, 1), e.setHours(0, 0, 0, 0), e;
  }
}
class qd extends I {
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
        return j(N(4, e), r);
      case "Yo":
        return j(
          s.ordinalNumber(e, {
            unit: "year"
          }),
          r
        );
      default:
        return j(N(i.length, e), r);
    }
  }
  validate(e, i) {
    return i.isTwoDigitYear || i.year > 0;
  }
  set(e, i, s, r) {
    const o = $i(e, r);
    if (s.isTwoDigitYear) {
      const c = Co(
        s.year,
        o
      );
      return e.setFullYear(
        c,
        0,
        r.firstWeekContainsDate
      ), e.setHours(0, 0, 0, 0), mt(e, r);
    }
    const a = !("era" in i) || i.era === 1 ? s.year : 1 - s.year;
    return e.setFullYear(a, 0, r.firstWeekContainsDate), e.setHours(0, 0, 0, 0), mt(e, r);
  }
}
class Xd extends I {
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
    return Sn(i === "R" ? 4 : i.length, e);
  }
  set(e, i, s) {
    const r = z(e, 0);
    return r.setFullYear(s, 0, 4), r.setHours(0, 0, 0, 0), ce(r);
  }
}
class Qd extends I {
  constructor() {
    super(...arguments);
    y(this, "priority", 130);
    y(this, "incompatibleTokens", ["G", "y", "Y", "R", "w", "I", "i", "e", "c", "t", "T"]);
  }
  parse(e, i) {
    return Sn(i === "u" ? 4 : i.length, e);
  }
  set(e, i, s) {
    return e.setFullYear(s, 0, 1), e.setHours(0, 0, 0, 0), e;
  }
}
class Gd extends I {
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
        return N(i.length, e);
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
class Kd extends I {
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
        return N(i.length, e);
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
class Zd extends I {
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
        return j(N(2, e), r);
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
class Jd extends I {
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
        return j(N(2, e), r);
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
function tf(n, t, e) {
  const i = S(n, e == null ? void 0 : e.in), s = ko(i, e) - t;
  return i.setDate(i.getDate() - s * 7), S(i, e == null ? void 0 : e.in);
}
class ef extends I {
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
        return N(i.length, e);
    }
  }
  validate(e, i) {
    return i >= 1 && i <= 53;
  }
  set(e, i, s, r) {
    return mt(tf(e, s, r), r);
  }
}
function nf(n, t, e) {
  const i = S(n, e == null ? void 0 : e.in), s = Mo(i, e) - t;
  return i.setDate(i.getDate() - s * 7), i;
}
class sf extends I {
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
        return N(i.length, e);
    }
  }
  validate(e, i) {
    return i >= 1 && i <= 53;
  }
  set(e, i, s) {
    return ce(nf(e, s));
  }
}
const rf = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], of = [
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
class af extends I {
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
        return N(i.length, e);
    }
  }
  validate(e, i) {
    const s = e.getFullYear(), r = Ao(s), o = e.getMonth();
    return r ? i >= 1 && i <= of[o] : i >= 1 && i <= rf[o];
  }
  set(e, i, s) {
    return e.setDate(s), e.setHours(0, 0, 0, 0), e;
  }
}
class cf extends I {
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
        return N(i.length, e);
    }
  }
  validate(e, i) {
    const s = e.getFullYear();
    return Ao(s) ? i >= 1 && i <= 366 : i >= 1 && i <= 365;
  }
  set(e, i, s) {
    return e.setMonth(0, s), e.setHours(0, 0, 0, 0), e;
  }
}
function Fi(n, t, e) {
  var u, d, f, g;
  const i = Xt(), s = (e == null ? void 0 : e.weekStartsOn) ?? ((d = (u = e == null ? void 0 : e.locale) == null ? void 0 : u.options) == null ? void 0 : d.weekStartsOn) ?? i.weekStartsOn ?? ((g = (f = i.locale) == null ? void 0 : f.options) == null ? void 0 : g.weekStartsOn) ?? 0, r = S(n, e == null ? void 0 : e.in), o = r.getDay(), c = (t % 7 + 7) % 7, l = 7 - s, h = t < 0 || t > 6 ? t - (o + l) % 7 : (c + l) % 7 - (o + l) % 7;
  return Fn(r, h, e);
}
class lf extends I {
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
    return e = Fi(e, s, r), e.setHours(0, 0, 0, 0), e;
  }
}
class hf extends I {
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
        return j(N(i.length, e), o);
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
    return e = Fi(e, s, r), e.setHours(0, 0, 0, 0), e;
  }
}
class uf extends I {
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
        return j(N(i.length, e), o);
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
    return e = Fi(e, s, r), e.setHours(0, 0, 0, 0), e;
  }
}
function df(n, t, e) {
  const i = S(n, e == null ? void 0 : e.in), s = zd(i, e), r = t - s;
  return Fn(i, r, e);
}
class ff extends I {
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
        return N(i.length, e);
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
    return e = df(e, s), e.setHours(0, 0, 0, 0), e;
  }
}
class gf extends I {
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
    return e.setHours(Li(s), 0, 0, 0), e;
  }
}
class mf extends I {
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
    return e.setHours(Li(s), 0, 0, 0), e;
  }
}
class pf extends I {
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
    return e.setHours(Li(s), 0, 0, 0), e;
  }
}
class bf extends I {
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
        return N(i.length, e);
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
class yf extends I {
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
        return N(i.length, e);
    }
  }
  validate(e, i) {
    return i >= 0 && i <= 23;
  }
  set(e, i, s) {
    return e.setHours(s, 0, 0, 0), e;
  }
}
class _f extends I {
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
        return N(i.length, e);
    }
  }
  validate(e, i) {
    return i >= 0 && i <= 11;
  }
  set(e, i, s) {
    return e.getHours() >= 12 && s < 12 ? e.setHours(s + 12, 0, 0, 0) : e.setHours(s, 0, 0, 0), e;
  }
}
class xf extends I {
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
        return N(i.length, e);
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
class wf extends I {
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
        return N(i.length, e);
    }
  }
  validate(e, i) {
    return i >= 0 && i <= 59;
  }
  set(e, i, s) {
    return e.setMinutes(s, 0, 0), e;
  }
}
class vf extends I {
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
        return N(i.length, e);
    }
  }
  validate(e, i) {
    return i >= 0 && i <= 59;
  }
  set(e, i, s) {
    return e.setSeconds(s, 0), e;
  }
}
class Mf extends I {
  constructor() {
    super(...arguments);
    y(this, "priority", 30);
    y(this, "incompatibleTokens", ["t", "T"]);
  }
  parse(e, i) {
    const s = (r) => Math.trunc(r * Math.pow(10, -i.length + 3));
    return j(N(i.length, e), s);
  }
  set(e, i, s) {
    return e.setMilliseconds(s), e;
  }
}
class kf extends I {
  constructor() {
    super(...arguments);
    y(this, "priority", 10);
    y(this, "incompatibleTokens", ["t", "T", "x"]);
  }
  parse(e, i) {
    switch (i) {
      case "X":
        return gt(
          ft.basicOptionalMinutes,
          e
        );
      case "XX":
        return gt(ft.basic, e);
      case "XXXX":
        return gt(
          ft.basicOptionalSeconds,
          e
        );
      case "XXXXX":
        return gt(
          ft.extendedOptionalSeconds,
          e
        );
      case "XXX":
      default:
        return gt(ft.extended, e);
    }
  }
  set(e, i, s) {
    return i.timestampIsSet ? e : z(
      e,
      e.getTime() - Pn(e) - s
    );
  }
}
class Df extends I {
  constructor() {
    super(...arguments);
    y(this, "priority", 10);
    y(this, "incompatibleTokens", ["t", "T", "X"]);
  }
  parse(e, i) {
    switch (i) {
      case "x":
        return gt(
          ft.basicOptionalMinutes,
          e
        );
      case "xx":
        return gt(ft.basic, e);
      case "xxxx":
        return gt(
          ft.basicOptionalSeconds,
          e
        );
      case "xxxxx":
        return gt(
          ft.extendedOptionalSeconds,
          e
        );
      case "xxx":
      default:
        return gt(ft.extended, e);
    }
  }
  set(e, i, s) {
    return i.timestampIsSet ? e : z(
      e,
      e.getTime() - Pn(e) - s
    );
  }
}
class Pf extends I {
  constructor() {
    super(...arguments);
    y(this, "priority", 40);
    y(this, "incompatibleTokens", "*");
  }
  parse(e) {
    return To(e);
  }
  set(e, i, s) {
    return [z(e, s * 1e3), { timestampIsSet: !0 }];
  }
}
class Sf extends I {
  constructor() {
    super(...arguments);
    y(this, "priority", 20);
    y(this, "incompatibleTokens", "*");
  }
  parse(e) {
    return To(e);
  }
  set(e, i, s) {
    return [z(e, s), { timestampIsSet: !0 }];
  }
}
const Of = {
  G: new Vd(),
  y: new Ud(),
  Y: new qd(),
  R: new Xd(),
  u: new Qd(),
  Q: new Gd(),
  q: new Kd(),
  M: new Zd(),
  L: new Jd(),
  w: new ef(),
  I: new sf(),
  d: new af(),
  D: new cf(),
  E: new lf(),
  e: new hf(),
  c: new uf(),
  i: new ff(),
  a: new gf(),
  b: new mf(),
  B: new pf(),
  h: new bf(),
  H: new yf(),
  K: new _f(),
  k: new xf(),
  m: new wf(),
  s: new vf(),
  S: new Mf(),
  X: new kf(),
  x: new Df(),
  t: new Pf(),
  T: new Sf()
}, Tf = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g, Cf = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g, Af = /^'([^]*?)'?$/, Ef = /''/g, If = /\S/, $f = /[a-zA-Z]/;
function Lf(n, t, e, i) {
  var p, b, x, v, M, w, P, D;
  const s = () => z((i == null ? void 0 : i.in) || e, NaN), r = Hd(), o = (i == null ? void 0 : i.locale) ?? r.locale ?? vo, a = (i == null ? void 0 : i.firstWeekContainsDate) ?? ((b = (p = i == null ? void 0 : i.locale) == null ? void 0 : p.options) == null ? void 0 : b.firstWeekContainsDate) ?? r.firstWeekContainsDate ?? ((v = (x = r.locale) == null ? void 0 : x.options) == null ? void 0 : v.firstWeekContainsDate) ?? 1, c = (i == null ? void 0 : i.weekStartsOn) ?? ((w = (M = i == null ? void 0 : i.locale) == null ? void 0 : M.options) == null ? void 0 : w.weekStartsOn) ?? r.weekStartsOn ?? ((D = (P = r.locale) == null ? void 0 : P.options) == null ? void 0 : D.weekStartsOn) ?? 0;
  if (!t)
    return n ? s() : S(e, i == null ? void 0 : i.in);
  const l = {
    firstWeekContainsDate: a,
    weekStartsOn: c,
    locale: o
  }, h = [new jd(i == null ? void 0 : i.in, e)], u = t.match(Cf).map((_) => {
    const k = _[0];
    if (k in fi) {
      const O = fi[k];
      return O(_, o.formatLong);
    }
    return _;
  }).join("").match(Tf), d = [];
  for (let _ of u) {
    !(i != null && i.useAdditionalWeekYearTokens) && So(_) && gi(_, t, n), !(i != null && i.useAdditionalDayOfYearTokens) && Po(_) && gi(_, t, n);
    const k = _[0], O = Of[k];
    if (O) {
      const { incompatibleTokens: T } = O;
      if (Array.isArray(T)) {
        const q = d.find(
          (tt) => T.includes(tt.token) || tt.token === k
        );
        if (q)
          throw new RangeError(
            `The format string mustn't contain \`${q.fullToken}\` and \`${_}\` at the same time`
          );
      } else if (O.incompatibleTokens === "*" && d.length > 0)
        throw new RangeError(
          `The format string mustn't contain \`${_}\` and any other token at the same time`
        );
      d.push({ token: k, fullToken: _ });
      const C = O.run(
        n,
        _,
        o.match,
        l
      );
      if (!C)
        return s();
      h.push(C.setter), n = C.rest;
    } else {
      if (k.match($f))
        throw new RangeError(
          "Format string contains an unescaped latin alphabet character `" + k + "`"
        );
      if (_ === "''" ? _ = "'" : k === "'" && (_ = Ff(_)), n.indexOf(_) === 0)
        n = n.slice(_.length);
      else
        return s();
    }
  }
  if (n.length > 0 && If.test(n))
    return s();
  const f = h.map((_) => _.priority).sort((_, k) => k - _).filter((_, k, O) => O.indexOf(_) === k).map(
    (_) => h.filter((k) => k.priority === _).sort((k, O) => O.subPriority - k.subPriority)
  ).map((_) => _[0]);
  let g = S(e, i == null ? void 0 : i.in);
  if (isNaN(+g)) return s();
  const m = {};
  for (const _ of f) {
    if (!_.validate(g, l))
      return s();
    const k = _.set(g, m, l);
    Array.isArray(k) ? (g = k[0], Object.assign(m, k[1])) : g = k;
  }
  return g;
}
function Ff(n) {
  return n.match(Af)[1].replace(Ef, "'");
}
function Rf(n, t) {
  const e = S(n, t == null ? void 0 : t.in);
  return e.setMinutes(0, 0, 0), e;
}
function Hf(n, t) {
  const e = S(n, t == null ? void 0 : t.in);
  return e.setSeconds(0, 0), e;
}
function zf(n, t) {
  const e = S(n, t == null ? void 0 : t.in);
  return e.setMilliseconds(0), e;
}
function Nf(n, t) {
  const e = () => z(t == null ? void 0 : t.in, NaN), i = (t == null ? void 0 : t.additionalDigits) ?? 2, s = jf(n);
  let r;
  if (s.date) {
    const l = Vf(s.date, i);
    r = Uf(l.restDateString, l.year);
  }
  if (!r || isNaN(+r)) return e();
  const o = +r;
  let a = 0, c;
  if (s.time && (a = qf(s.time), isNaN(a)))
    return e();
  if (s.timezone) {
    if (c = Xf(s.timezone), isNaN(c)) return e();
  } else {
    const l = new Date(o + a), h = S(0, t == null ? void 0 : t.in);
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
  return S(o + a + c, t == null ? void 0 : t.in);
}
const un = {
  dateTimeDelimiter: /[T ]/,
  timeZoneDelimiter: /[Z ]/i,
  timezone: /([Z+-].*)$/
}, Wf = /^-?(?:(\d{3})|(\d{2})(?:-?(\d{2}))?|W(\d{2})(?:-?(\d{1}))?|)$/, Bf = /^(\d{2}(?:[.,]\d*)?)(?::?(\d{2}(?:[.,]\d*)?))?(?::?(\d{2}(?:[.,]\d*)?))?$/, Yf = /^([+-])(\d{2})(?::?(\d{2}))?$/;
function jf(n) {
  const t = {}, e = n.split(un.dateTimeDelimiter);
  let i;
  if (e.length > 2)
    return t;
  if (/:/.test(e[0]) ? i = e[0] : (t.date = e[0], i = e[1], un.timeZoneDelimiter.test(t.date) && (t.date = n.split(un.timeZoneDelimiter)[0], i = n.substr(
    t.date.length,
    n.length
  ))), i) {
    const s = un.timezone.exec(i);
    s ? (t.time = i.replace(s[1], ""), t.timezone = s[1]) : t.time = i;
  }
  return t;
}
function Vf(n, t) {
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
function Uf(n, t) {
  if (t === null) return /* @__PURE__ */ new Date(NaN);
  const e = n.match(Wf);
  if (!e) return /* @__PURE__ */ new Date(NaN);
  const i = !!e[4], s = _e(e[1]), r = _e(e[2]) - 1, o = _e(e[3]), a = _e(e[4]), c = _e(e[5]) - 1;
  if (i)
    return Jf(t, a, c) ? Qf(t, a, c) : /* @__PURE__ */ new Date(NaN);
  {
    const l = /* @__PURE__ */ new Date(0);
    return !Kf(t, r, o) || !Zf(t, s) ? /* @__PURE__ */ new Date(NaN) : (l.setUTCFullYear(t, r, Math.max(s, o)), l);
  }
}
function _e(n) {
  return n ? parseInt(n) : 1;
}
function qf(n) {
  const t = n.match(Bf);
  if (!t) return NaN;
  const e = Jn(t[1]), i = Jn(t[2]), s = Jn(t[3]);
  return tg(e, i, s) ? e * Ue + i * Ve + s * 1e3 : NaN;
}
function Jn(n) {
  return n && parseFloat(n.replace(",", ".")) || 0;
}
function Xf(n) {
  if (n === "Z") return 0;
  const t = n.match(Yf);
  if (!t) return 0;
  const e = t[1] === "+" ? -1 : 1, i = parseInt(t[2]), s = t[3] && parseInt(t[3]) || 0;
  return eg(i, s) ? e * (i * Ue + s * Ve) : NaN;
}
function Qf(n, t, e) {
  const i = /* @__PURE__ */ new Date(0);
  i.setUTCFullYear(n, 0, 4);
  const s = i.getUTCDay() || 7, r = (t - 1) * 7 + e + 1 - s;
  return i.setUTCDate(i.getUTCDate() + r), i;
}
const Gf = [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function Eo(n) {
  return n % 400 === 0 || n % 4 === 0 && n % 100 !== 0;
}
function Kf(n, t, e) {
  return t >= 0 && t <= 11 && e >= 1 && e <= (Gf[t] || (Eo(n) ? 29 : 28));
}
function Zf(n, t) {
  return t >= 1 && t <= (Eo(n) ? 366 : 365);
}
function Jf(n, t, e) {
  return t >= 1 && t <= 53 && e >= 0 && e <= 6;
}
function tg(n, t, e) {
  return n === 24 ? t === 0 && e === 0 : e >= 0 && e < 60 && t >= 0 && t < 60 && n >= 0 && n < 25;
}
function eg(n, t) {
  return t >= 0 && t <= 59;
}
/*!
 * chartjs-adapter-date-fns v3.0.0
 * https://www.chartjs.org
 * (c) 2022 chartjs-adapter-date-fns Contributors
 * Released under the MIT license
 */
const ng = {
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
Gr._date.override({
  _id: "date-fns",
  // DEBUG
  formats: function() {
    return ng;
  },
  parse: function(n, t) {
    if (n === null || typeof n > "u")
      return null;
    const e = typeof n;
    return e === "number" || n instanceof Date ? n = S(n) : e === "string" && (typeof t == "string" ? n = Lf(n, t, /* @__PURE__ */ new Date(), this.options) : n = Nf(n, this.options)), po(n) ? n.getTime() : null;
  },
  format: function(n, t) {
    return Fd(n, t, this.options);
  },
  add: function(n, t, e) {
    switch (e) {
      case "millisecond":
        return Ei(n, t);
      case "second":
        return Du(n, t);
      case "minute":
        return Mu(n, t);
      case "hour":
        return xu(n, t);
      case "day":
        return Fn(n, t);
      case "week":
        return Pu(n, t);
      case "month":
        return Ai(n, t);
      case "quarter":
        return ku(n, t);
      case "year":
        return Su(n, t);
      default:
        return n;
    }
  },
  diff: function(n, t, e) {
    switch (e) {
      case "millisecond":
        return Ii(n, t);
      case "second":
        return Lu(n, t);
      case "minute":
        return Eu(n, t);
      case "hour":
        return Au(n, t);
      case "day":
        return bo(n, t);
      case "week":
        return Fu(n, t);
      case "month":
        return xo(n, t);
      case "quarter":
        return $u(n, t);
      case "year":
        return Ru(n, t);
      default:
        return 0;
    }
  },
  startOf: function(n, t, e) {
    switch (t) {
      case "second":
        return zf(n);
      case "minute":
        return Hf(n);
      case "hour":
        return Rf(n);
      case "day":
        return di(n);
      case "week":
        return mt(n);
      case "isoWeek":
        return mt(n, { weekStartsOn: +e });
      case "month":
        return zu(n);
      case "quarter":
        return Hu(n);
      case "year":
        return wo(n);
      default:
        return n;
    }
  },
  endOf: function(n, t) {
    switch (t) {
      case "second":
        return Vu(n);
      case "minute":
        return Yu(n);
      case "hour":
        return Wu(n);
      case "day":
        return yo(n);
      case "week":
        return Bu(n);
      case "month":
        return _o(n);
      case "quarter":
        return ju(n);
      case "year":
        return Nu(n);
      default:
        return n;
    }
  }
});
xt.register(
  fn,
  Pt,
  pn,
  ui,
  We,
  du,
  su,
  Zh
);
class ig {
  constructor(t) {
    this.canvas = t;
  }
  destroy() {
    var t;
    (t = this.chart) == null || t.destroy(), this.chart = void 0;
  }
  update(t) {
    const e = this.canvas.getContext("2d");
    if (!e) return;
    const i = t.current.points.map((a) => ({
      x: a.timestamp,
      y: a.value
    })), s = t.reference ? t.reference.points.map((a) => ({ x: a.timestamp, y: a.value })) : [], r = {
      datasets: [
        {
          label: "Bieżący okres",
          data: i,
          borderColor: "var(--primary-color)",
          backgroundColor: "rgba(0, 150, 136, 0.2)",
          fill: !0,
          pointRadius: 0,
          tension: 0.3
        },
        ...t.reference ? [
          {
            label: "Okres referencyjny",
            data: s,
            borderColor: "var(--secondary-text-color)",
            backgroundColor: "transparent",
            pointRadius: 0,
            borderDash: [4, 2],
            tension: 0.3
          }
        ] : []
      ]
    }, o = {
      responsive: !0,
      maintainAspectRatio: !1,
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
          type: "time",
          time: {
            unit: "day"
          },
          grid: {
            color: "rgba(255, 255, 255, 0.06)"
          }
        },
        y: {
          beginAtZero: !0,
          grid: {
            color: "rgba(255, 255, 255, 0.06)"
          }
        }
      }
    };
    this.chart ? (this.chart.data = r, this.chart.options = o, this.chart.update()) : this.chart = new xt(e, {
      type: "line",
      data: r,
      options: o
    });
  }
}
const On = class On extends De {
  constructor() {
    super(...arguments), this._state = { status: "loading" };
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
        e && (this._chartRenderer = new ig(e));
      }
      this._chartRenderer && this._chartRenderer.update(this._state.comparisonSeries);
    }
  }
  async _loadData() {
    if (!this._config || !this.hass) return;
    const t = /* @__PURE__ */ new Date(), i = na(this._config, t, "UTC"), s = Xi(i, this._config.entity), r = {
      ...i,
      current_start: i.reference_start,
      current_end: i.reference_end
    }, o = Xi(r, this._config.entity);
    try {
      this._config.debug && (console.log("[Energy Burndown] API Query (current):", s), console.log("[Energy Burndown] API Query (reference):", o));
      const [a, c] = await Promise.all([
        this.hass.connection.sendMessagePromise(
          s
        ),
        this.hass.connection.sendMessagePromise(
          o
        )
      ]);
      if (this._config.debug) {
        const m = (a == null ? void 0 : a.result) ?? a, p = m.results ?? m;
        if (console.log("[Energy Burndown] API Response (current, raw):", a), p && typeof p == "object") {
          const b = Object.keys(p);
          console.log(
            "[Energy Burndown] Results keys (available statistic_ids):",
            b
          );
          const x = p[this._config.entity];
          console.log(
            `[Energy Burndown] Data for entity "${this._config.entity}":`,
            x ? `${Array.isArray(x) ? x.length : 0} points` : "not found"
          ), console.log(
            "[Energy Burndown] Reference API Response (raw):",
            c
          );
        } else
          console.log(
            "[Energy Burndown] No results in response or invalid structure"
          );
      }
      const l = Qi(
        a,
        this._config.entity,
        "Bieżący okres"
      );
      if (!l) {
        this._config.debug && console.log(
          "[Energy Burndown] current series could not be built – check entity ID and results structure above"
        ), this._state = { status: "no-data" };
        return;
      }
      const h = Qi(
        c,
        this._config.entity,
        "Okres referencyjny"
      ), u = {
        current: l,
        reference: h ?? void 0,
        aggregation: i.aggregation,
        time_zone: i.time_zone
      }, d = ra(u), f = oa(u), g = aa(d);
      this._state = {
        status: "ready",
        comparisonSeries: u,
        summary: d,
        forecast: f,
        textSummary: g
      };
    } catch (a) {
      console.error(a), this._state = {
        status: "error",
        errorMessage: "Nie udało się pobrać danych statystyk długoterminowych."
      };
    }
  }
  render() {
    var m, p, b, x, v;
    if (!this._config || !this.hass)
      return et``;
    if (this._state.status === "loading")
      return et`<ha-card>
        <div class="loading">
          <ha-circular-progress active size="small"></ha-circular-progress>
          <span>Ładowanie danych statystyk długoterminowych...</span>
        </div>
      </ha-card>`;
    if (this._state.status === "error")
      return et`<ha-card>
        <ha-alert alert-type="error">
          ${this._state.errorMessage ?? "Wystąpił błąd podczas wczytywania danych."}
        </ha-alert>
      </ha-card>`;
    if (this._state.status === "no-data")
      return et`<ha-card>
        <ha-alert alert-type="info">
          Brak danych do wyświetlenia dla wybranego okresu.
        </ha-alert>
      </ha-card>`;
    const t = (m = this._state.textSummary) == null ? void 0 : m.heading, e = this._state.summary, i = this._state.forecast, s = ((p = this.hass.locale) == null ? void 0 : p.language) ?? this.hass.language ?? navigator.language, r = this._config.precision ?? 1, o = ((v = (x = (b = this.hass.states) == null ? void 0 : b[this._config.entity]) == null ? void 0 : x.attributes) == null ? void 0 : v.unit_of_measurement) ?? "", a = new Intl.NumberFormat(s, {
      minimumFractionDigits: r,
      maximumFractionDigits: r
    }), c = new Intl.NumberFormat(s, {
      maximumFractionDigits: 1
    }), l = (e == null ? void 0 : e.unit) || o, h = e != null ? `${a.format(e.current_cumulative)} ${l}` : "", u = e != null && e.reference_cumulative != null ? `${a.format(e.reference_cumulative)} ${l}` : null, d = e != null && e.difference != null ? `${a.format(Math.abs(e.difference))} ${l}` : null, f = e != null && e.differencePercent != null ? `${c.format(e.differencePercent)} %` : null, g = i != null && i.enabled && this._config.show_forecast !== !1;
    return et`<ha-card>
      <div class="content">
        ${t ? et`<div class="heading">${t}</div>` : null}

        ${e ? et`<div class="summary">
              <div class="summary-row">
                <span class="label">Bieżący okres</span>
                <span class="value">${h}</span>
              </div>

              ${u ? et`<div class="summary-row">
                    <span class="label">Okres referencyjny</span>
                    <span class="value">${u}</span>
                  </div>` : null}

              ${d ? et`<div class="summary-row">
                    <span class="label">Różnica</span>
                    <span class="value">${d}</span>
                  </div>` : null}

              ${f ? et`<div class="summary-row">
                    <span class="label">Różnica [%]</span>
                    <span class="value">${f}</span>
                  </div>` : null}

              ${e.reference_cumulative == null ? et`<div class="summary-note">
                    Dane referencyjne dla tego dnia są niepełne – liczby
                    porównawcze mogą być niedostępne lub przybliżone.
                  </div>` : null}
            </div>` : null}

        ${g && i ? et`<div class="forecast">
              <div class="summary-row">
                <span class="label">Prognoza bieżącego okresu</span>
                <span class="value"
                  >${a.format(
      i.forecast_total ?? 0
    )} ${i.unit}</span
                >
              </div>
              ${i.reference_total != null ? et`<div class="summary-row">
                    <span class="label">Wartość historyczna</span>
                    <span class="value"
                      >${a.format(
      i.reference_total
    )} ${i.unit}</span
                    >
                  </div>` : null}
              <div class="summary-note">
                Poziom pewności prognozy: ${i.confidence}.
              </div>
            </div>` : null}

        <div class="chart-container">
          <canvas></canvas>
        </div>
      </div>
    </ha-card>`;
  }
};
On.properties = {
  hass: { type: Object, attribute: !1 },
  _config: { state: !0 },
  _state: { state: !0 }
}, On.styles = Fo`
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
  `;
let mi = On;
customElements.define("energy-burndown-card", mi);
//# sourceMappingURL=energy-burndown-card.js.map
